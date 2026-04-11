"""
medicine_service.py  (enhanced)
─────────────────────────────────
Search pipeline:
  1. DB ilike search (fast, cached data)
  2. If missing enrichment data → OpenFDA label API (free)
  3. If still missing → Gemini AI enrichment (free tier)
  4. New data is written back to DB for future cache hits

Alternative search pipeline:
  1. DB salt-composition join (same as before)
  2. Gemini suggests cheap Indian generics by salt
  3. Each alternative is composition-verified (match %)
  4. Only alternatives with match_percent >= 80 marked safe_substitute
  5. CDSCO verification attempted for each
  6. New verified alternatives stored in DB

All DB writes are upsert-safe (won't duplicate).
"""

import logging
from db import supabase
from rapidfuzz import fuzz
from services.gemini_service import enrich_medicine, find_cheap_alternatives
from services.openfda_service import (
    fetch_drug_label,
    search_by_ingredient,
    verify_medicine_composition,
    verify_cdsco,
    rxnorm_search,
)

logger = logging.getLogger(__name__)


# ─────────────────────────────────────────────────────────────────────────────
# spaCy NLP helper
# ─────────────────────────────────────────────────────────────────────────────

try:
    import spacy
    _nlp = spacy.load("en_core_web_sm")
    _SPACY_AVAILABLE = True
except Exception:
    _nlp = None
    _SPACY_AVAILABLE = False

_MEDICINE_STOP_WORDS = {
    "i", "need", "want", "give", "something", "for", "with", "a", "an",
    "the", "tablet", "tablets", "capsule", "capsules", "syrup", "injection",
    "mg", "ml", "dose", "medicine", "drug", "pill", "pills",
}


def nlp_parse_query(raw: str) -> str:
    if not raw:
        return raw
    if _SPACY_AVAILABLE and _nlp:
        doc = _nlp(raw)
        candidates = [
            t.text for t in doc
            if t.pos_ in ("PROPN", "NOUN")
            and t.text.lower() not in _MEDICINE_STOP_WORDS
            and not t.is_punct and not t.is_space and len(t.text) > 2
        ]
        if candidates:
            return max(candidates, key=len)
    tokens = [t for t in raw.split() if t.lower() not in _MEDICINE_STOP_WORDS and len(t) > 2]
    return tokens[0] if tokens else raw


# ─────────────────────────────────────────────────────────────────────────────
# Smart fuzzy search (autocomplete)
# ─────────────────────────────────────────────────────────────────────────────

def smart_search(query: str) -> list:
    res = supabase.table("medicines").select("id, brand_name").execute()
    results = []
    for med in res.data:
        score = fuzz.partial_ratio(query.lower(), med["brand_name"].lower())
        if score > 60:
            results.append({"id": med["id"], "brand_name": med["brand_name"], "score": score})
    results.sort(key=lambda x: x["score"], reverse=True)
    return results[:10]


# ─────────────────────────────────────────────────────────────────────────────
# Core search — DB first, then enrich via APIs
# ─────────────────────────────────────────────────────────────────────────────

def search_medicines(query: str) -> list:
    """
    Full search:
      1. DB ilike → base medicine rows
      2. For each hit, fetch composition (salts)
      3. If 'uses' / 'description' missing → enrich via OpenFDA then Gemini
      4. Cache enriched data back to DB
    """
    res = (
        supabase.table("medicines")
        .select("id, brand_name, manufacturer, description, uses, category, price")
        .ilike("brand_name", f"%{query}%")
        .execute()
    )

    medicines = res.data

    # Also try salt/composition match if DB returns nothing
    if not medicines:
        medicines = _search_by_salt(query)

    results = []
    for med in medicines:
        comp = (
            supabase.table("medicine_composition")
            .select("salts(salt_name), strength_mg")
            .eq("medicine_id", med["id"])
            .execute()
        )
        salts = [s["salts"]["salt_name"] for s in comp.data if s.get("salts")]
        salt_str = ", ".join(salts)

        # Check if enrichment is needed for basic fields (uses/description)
        needs_enrichment = not med.get("uses") or not med.get("description")

        if needs_enrichment:
            enriched = _enrich_and_cache(med["id"], med["brand_name"], salt_str)
            med.update(enriched)
        else:
            # DB has uses/description but NOT the extended fields (side_effects, etc.)
            # Call Gemini directly for those without re-caching
            gem = enrich_medicine(med["brand_name"], salt_str)
            if gem:
                for key in ("side_effects", "dosage_guidance", "safety_warnings", "food_interactions", "storage"):
                    if not med.get(key) and gem.get(key):
                        med[key] = gem[key]

        results.append({
            "id": med["id"],
            "brand_name": med["brand_name"],
            "manufacturer": med.get("manufacturer", ""),
            "generic_name": salt_str,
            "salt_composition": salt_str,
            "price": med.get("price") or 50,
            "uses": med.get("uses", ""),
            "description": med.get("description", ""),
            "category": med.get("category", "Other"),
            "side_effects": med.get("side_effects", ""),
            "dosage_guidance": med.get("dosage_guidance", ""),
            "safety_warnings": med.get("safety_warnings", ""),
            "food_interactions": med.get("food_interactions", ""),
            "storage": med.get("storage", ""),
            "is_verified": med.get("is_verified", False),
            "verification_source": med.get("verification_source", ""),
        })

    return results


def _search_by_salt(query: str) -> list:
    """Secondary search: match query against salt names."""
    res = (
        supabase.table("salts")
        .select("id, salt_name")
        .ilike("salt_name", f"%{query}%")
        .execute()
    )
    if not res.data:
        return []

    salt_ids = [s["id"] for s in res.data]
    comp_res = (
        supabase.table("medicine_composition")
        .select("medicine_id, medicines(id, brand_name, manufacturer, description, uses, category, price)")
        .in_("salt_id", salt_ids)
        .execute()
    )
    seen = set()
    medicines = []
    for c in comp_res.data:
        m = c.get("medicines")
        if m and m["id"] not in seen:
            seen.add(m["id"])
            medicines.append(m)
    return medicines


def _enrich_and_cache(medicine_id: str, brand_name: str, salt_composition: str) -> dict:
    """
    Try OpenFDA → Gemini for enrichment. Cache result to DB.
    Returns dict with: uses, description, category, side_effects.
    """
    enriched = {}

    # ── 1. Try OpenFDA ────────────────────────────────────────────────────────
    fda_data = fetch_drug_label(brand_name)
    if fda_data.get("indications"):
        enriched = {
            "uses": _clean_text(fda_data["indications"])[:500],
            "description": _clean_text(fda_data.get("dosage", ""))[:300],
            "category": "Other",
            "is_verified": True,
            "verification_source": "OpenFDA",
        }

    # ── 2. Try Gemini if OpenFDA had no result ────────────────────────────────
    if not enriched.get("uses"):
        gem = enrich_medicine(brand_name, salt_composition)
        if gem.get("uses"):
            enriched = {
                "uses": gem.get("uses", "")[:500],
                "description": gem.get("description", "")[:300],
                "category": gem.get("category", "Other"),
                "side_effects": gem.get("side_effects", "")[:300],
                "dosage_guidance": gem.get("dosage_guidance", "")[:200],
                "safety_warnings": gem.get("safety_warnings", "")[:300],
                "food_interactions": gem.get("food_interactions", "")[:300],
                "storage": gem.get("storage", "")[:200],
                "is_verified": False,
                "verification_source": "Gemini-AI",
            }

    # ── 3. Cache back to DB ───────────────────────────────────────────────────
    if enriched:
        try:
            update_data = {
                "uses": enriched.get("uses"),
                "description": enriched.get("description"),
                "category": enriched.get("category")
            }
            if "is_verified" in enriched:
                update_data["cdsco_approved"] = enriched.get("is_verified")
                
            supabase.table("medicines").update(update_data).eq("id", medicine_id).execute()
            logger.info("Successfully updated enrichment to DB for %s", medicine_id)
        except Exception as exc:
            logger.error("DB cache write failed for %s: %s", medicine_id, exc)

    return enriched


# ─────────────────────────────────────────────────────────────────────────────
# Alternatives — DB + Gemini + composition verification
# ─────────────────────────────────────────────────────────────────────────────

def get_alternatives(medicine_id: str) -> dict:
    """
    Full alternatives pipeline:
      1. DB: find medicines sharing same salt_ids
      2. Gemini: suggest cheap generics
      3. For each candidate: verify composition match ≥ 80%
      4. Attempt CDSCO verification
      5. Store new verified medicines to DB
      6. Sort by price (cheapest first), split into exact/similar
    """

    # ── Get original medicine info ────────────────────────────────────────────
    orig_res = (
        supabase.table("medicines")
        .select("id, brand_name, manufacturer, price")
        .eq("id", medicine_id)
        .single()
        .execute()
    )
    original = orig_res.data or {}

    # ── Get salt composition ───────────────────────────────────────────────────
    comp = (
        supabase.table("medicine_composition")
        .select("salt_id, salts(salt_name), strength_mg")
        .eq("medicine_id", medicine_id)
        .execute()
    )
    salt_ids = [c["salt_id"] for c in comp.data]
    salts = [c["salts"]["salt_name"] for c in comp.data if c.get("salts")]
    salt_str = ", ".join(salts)
    orig_price = original.get("price") or 50

    # ── 1. DB alternatives (same salt) ───────────────────────────────────────
    db_alts = _db_alternatives(medicine_id, salt_ids, salt_str, orig_price)

    # ── 2. Gemini alternatives ────────────────────────────────────────────────
    gem_alts = []
    if original.get("brand_name"):
        gem_suggestions = find_cheap_alternatives(
            original["brand_name"], salt_str, orig_price
        )
        for s in gem_suggestions:
            alt = _process_alternative(s, salt_str, orig_price, source="Gemini-AI")
            if alt:
                gem_alts.append(alt)
                _store_new_medicine_if_not_exists(alt, salt_str)

    # ── 3. OpenFDA alternatives (by ingredient) ───────────────────────────────
    fda_alts = []
    for salt in salts[:2]:  # check first 2 salts to limit API calls
        for fda_med in search_by_ingredient(salt, limit=5):
            alt = _process_alternative(fda_med, salt_str, orig_price, source="OpenFDA")
            if alt:
                fda_alts.append(alt)

    # ── Merge + deduplicate ───────────────────────────────────────────────────
    all_alts = _deduplicate(db_alts + gem_alts + fda_alts)

    # Split by composition match
    exact = [a for a in all_alts if a.get("match_percent", 0) >= 95]
    similar = [a for a in all_alts if 80 <= a.get("match_percent", 0) < 95]

    # Sort each group cheapest first
    exact.sort(key=lambda x: x.get("price", 9999))
    similar.sort(key=lambda x: x.get("price", 9999))

    return {
        "original": {
            "id": original.get("id"),
            "brand_name": original.get("brand_name"),
            "salt_composition": salt_str,
            "price": orig_price,
        },
        "exact_matches": exact,
        "similar_matches": similar,
        "total_alternatives": len(exact) + len(similar),
    }


def _db_alternatives(medicine_id: str, salt_ids: list, salt_str: str, orig_price: float) -> list:
    if not salt_ids:
        return []
    alt = (
        supabase.table("medicine_composition")
        .select("medicine_id, medicines(id, brand_name, manufacturer, price, cdsco_approved)")
        .in_("salt_id", salt_ids)
        .execute()
    )
    results = []
    seen = set()
    for a in alt.data:
        m = a.get("medicines")
        if not m or m["id"] == medicine_id or m["id"] in seen:
            continue
        seen.add(m["id"])

        price = m.get("price") or 30
        savings = int(((orig_price - price) / orig_price) * 100) if orig_price > price else 0

        results.append({
            "id": m["id"],
            "brand_name": m["brand_name"],
            "manufacturer": m.get("manufacturer", ""),
            "price": price,
            "salt_composition": salt_str,
            "savings_percent": max(0, savings),
            "safe_substitute": True,
            "match_percent": 100,
            "composition_match": "100% match",
            "is_verified": m.get("cdsco_approved", False),
            "verification_source": "DB",
            "source": "database",
        })
    return results


def _process_alternative(med: dict, orig_salt_str: str, orig_price: float, source: str) -> dict | None:
    """Verify composition match and format an alternative entry."""
    brand = med.get("brand_name", "")
    manufacturer = med.get("manufacturer", "")
    alt_salt = med.get("salt_composition") or med.get("active_ingredients") or orig_salt_str

    if isinstance(alt_salt, list):
        alt_salt = ", ".join(alt_salt)

    # Composition verification
    match_info = verify_medicine_composition(orig_salt_str, alt_salt)
    if match_info["match_percent"] < 80:
        return None  # Skip poor matches

    price = med.get("estimated_price") or med.get("price") or (orig_price * 0.6)
    try:
        price = float(price)
    except (TypeError, ValueError):
        price = orig_price * 0.6

    savings = int(((orig_price - price) / orig_price) * 100) if orig_price > price else 0

    # CDSCO verification (best effort)
    cdsco = verify_cdsco(brand, manufacturer)

    return {
        "id": None,  # will be filled after DB store
        "brand_name": brand,
        "manufacturer": manufacturer,
        "price": round(price, 2),
        "salt_composition": alt_salt or orig_salt_str,
        "savings_percent": max(0, savings),
        "safe_substitute": match_info["safe_substitute"],
        "match_percent": match_info["match_percent"],
        "composition_match": f"{match_info['match_percent']}% match",
        "is_verified": cdsco["verified"] or source == "OpenFDA",
        "verification_source": cdsco["source"] if cdsco["verified"] else source,
        "is_generic": med.get("is_generic", False),
        "why_cheaper": med.get("why_cheaper", ""),
        "source": source,
    }


def _store_new_medicine_if_not_exists(alt: dict, salt_str: str):
    """Upsert a newly found medicine into DB so future searches hit cache."""
    if not alt.get("brand_name"):
        return
    try:
        existing = (
            supabase.table("medicines")
            .select("id")
            .ilike("brand_name", alt["brand_name"])
            .execute()
        )
        if existing.data:
            return  # Already in DB
            
        insert_data = {
            "brand_name": alt["brand_name"],
            "manufacturer": alt.get("manufacturer", ""),
            "price": alt.get("price"),
            "cdsco_approved": alt.get("is_verified", False)
        }
        # Remove None values
        insert_data = {k: v for k, v in insert_data.items() if v is not None}
        res = supabase.table("medicines").insert(insert_data).execute()
        
        # Optionally we could also insert into medicine_composition mapping if we got the salt_id, 
        # but that would require querying salts table first.
        
        logger.info("Stored new medicine from API: %s", alt["brand_name"])
    except Exception as exc:
        logger.error("Failed to store new medicine %s: %s", alt.get("brand_name"), exc)


def _deduplicate(alternatives: list) -> list:
    """Remove duplicate brand names, keeping the one with highest match_percent."""
    seen: dict[str, dict] = {}
    for alt in alternatives:
        key = alt["brand_name"].lower().strip()
        if key not in seen or alt.get("match_percent", 0) > seen[key].get("match_percent", 0):
            seen[key] = alt
    return list(seen.values())


# ─────────────────────────────────────────────────────────────────────────────
# Fetch full medicine detail (with enrichment)
# ─────────────────────────────────────────────────────────────────────────────

def get_medicine_detail(medicine_id: str) -> dict:
    """
    Get full enriched detail for one medicine (used in alternatives panel header).
    """
    res = (
        supabase.table("medicines")
        .select("*")
        .eq("id", medicine_id)
        .single()
        .execute()
    )
    if not res.data:
        return {}

    med = res.data
    comp = (
        supabase.table("medicine_composition")
        .select("salts(salt_name), strength_mg")
        .eq("medicine_id", medicine_id)
        .execute()
    )
    salts = [c["salts"]["salt_name"] for c in comp.data if c.get("salts")]
    salt_str = ", ".join(salts)

    if not med.get("uses"):
        enriched = _enrich_and_cache(medicine_id, med["brand_name"], salt_str)
        med.update(enriched)

    return {**med, "salt_composition": salt_str}


# ─────────────────────────────────────────────────────────────────────────────
# Utility
# ─────────────────────────────────────────────────────────────────────────────

def _clean_text(text: str) -> str:
    """Remove excess whitespace and HTML-ish artefacts from API text."""
    if not text:
        return ""
    text = text.replace("\n", " ").replace("\r", " ")
    import re
    text = re.sub(r"\s{2,}", " ", text)
    return text.strip()
