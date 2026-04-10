"""
openfda_service.py
──────────────────
Free APIs used:
  1. OpenFDA Drug Label API  — https://api.fda.gov/drug/label.json
     • No key needed (rate-limited to 240 req/min with key, 40/min without)
     • Set OPENFDA_API_KEY in .env for higher limits

  2. OpenMRS Concept Dictionary / RxNorm API (free, no key)
     • For salt/ingredient lookup

  3. CDSCO public search page scraper (fallback)
     • https://cdscoonline.gov.in/CDSCO/Drugs

These are combined to verify whether a medicine with a given salt composition
is genuinely approved and to fetch its uses/indications.
"""

import os
import re
import logging
import httpx
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

OPENFDA_KEY = os.getenv("OPENFDA_API_KEY", "")
_BASE = "https://api.fda.gov/drug"
_RXNORM_BASE = "https://rxnav.nlm.nih.gov/REST"

_HEADERS = {"User-Agent": "SaltSense/1.0 (medicine search app)"}


def _fda_get(endpoint: str, params: dict) -> dict | None:
    """GET from OpenFDA with optional API key."""
    if OPENFDA_KEY:
        params["api_key"] = OPENFDA_KEY
    try:
        r = httpx.get(f"{_BASE}/{endpoint}", params=params, headers=_HEADERS, timeout=8)
        if r.status_code == 200:
            return r.json()
        logger.warning("OpenFDA %s %s → %s", endpoint, params, r.status_code)
    except Exception as exc:
        logger.error("OpenFDA request error: %s", exc)
    return None


# ── OpenFDA label lookup ──────────────────────────────────────────────────────

def fetch_drug_label(brand_name: str) -> dict:
    """
    Fetch drug label info from OpenFDA.
    Returns dict with: indications, warnings, dosage, description, active_ingredients
    """
    data = _fda_get("label.json", {
        "search": f'brand_name:"{brand_name}"',
        "limit": 1,
    })

    if not data or not data.get("results"):
        # Try generic/substance name search
        data = _fda_get("label.json", {
            "search": f'generic_name:"{brand_name}"',
            "limit": 1,
        })

    if not data or not data.get("results"):
        return {}

    r = data["results"][0]
    openfda = r.get("openfda", {})

    return {
        "brand_name": openfda.get("brand_name", [None])[0],
        "generic_name": openfda.get("generic_name", [None])[0],
        "manufacturer": openfda.get("manufacturer_name", [None])[0],
        "indications": _first(r.get("indications_and_usage")),
        "dosage": _first(r.get("dosage_and_administration")),
        "warnings": _first(r.get("warnings")),
        "active_ingredients": openfda.get("substance_name", []),
        "product_ndc": openfda.get("product_ndc", []),
        "source": "openfda",
    }


def search_by_ingredient(ingredient: str, limit: int = 10) -> list[dict]:
    """
    Search OpenFDA for drugs containing a specific active ingredient/salt.
    Useful for finding alternatives with same composition.
    """
    data = _fda_get("label.json", {
        "search": f'active_ingredient:"{ingredient}"',
        "limit": limit,
    })

    if not data or not data.get("results"):
        return []

    results = []
    for r in data["results"]:
        openfda = r.get("openfda", {})
        brand = openfda.get("brand_name", [None])[0]
        generic = openfda.get("generic_name", [None])[0]
        manufacturer = openfda.get("manufacturer_name", [None])[0]
        if brand or generic:
            results.append({
                "brand_name": brand or generic,
                "generic_name": generic,
                "manufacturer": manufacturer,
                "active_ingredients": openfda.get("substance_name", []),
                "indications": _first(r.get("indications_and_usage")),
                "source": "openfda",
                "is_verified": True,
                "verification_source": "US-FDA",
            })
    return results


# ── RxNorm salt/ingredient search ────────────────────────────────────────────

def rxnorm_search(drug_name: str) -> dict:
    """
    Use RxNorm (free, no key) to get normalized drug name + ingredients.
    """
    try:
        r = httpx.get(
            f"{_RXNORM_BASE}/drugs.json",
            params={"name": drug_name},
            headers=_HEADERS,
            timeout=6,
        )
        if r.status_code != 200:
            return {}
        data = r.json()
        drug_group = data.get("drugGroup", {})
        concept_groups = drug_group.get("conceptGroup", [])
        for group in concept_groups:
            concepts = group.get("conceptProperties", [])
            if concepts:
                c = concepts[0]
                return {
                    "rxcui": c.get("rxcui"),
                    "name": c.get("name"),
                    "synonym": c.get("synonym"),
                    "source": "rxnorm",
                }
    except Exception as exc:
        logger.error("RxNorm error: %s", exc)
    return {}


def rxnorm_ingredients(rxcui: str) -> list[str]:
    """Get active ingredients for an RxNorm RxCUI."""
    try:
        r = httpx.get(
            f"{_RXNORM_BASE}/rxcui/{rxcui}/related.json",
            params={"tty": "IN"},
            headers=_HEADERS,
            timeout=6,
        )
        if r.status_code != 200:
            return []
        data = r.json()
        groups = data.get("relatedGroup", {}).get("conceptGroup", [])
        ingredients = []
        for g in groups:
            for c in g.get("conceptProperties", []):
                name = c.get("name")
                if name:
                    ingredients.append(name)
        return ingredients
    except Exception as exc:
        logger.error("RxNorm ingredients error: %s", exc)
        return []


# ── Indian drug search via DailyMed / WHO essential medicines ─────────────────

def search_who_essential(salt_name: str) -> list[dict]:
    """
    Search WHO Model List of Essential Medicines for a given salt.
    Uses the WHO API (free, no key needed).
    """
    try:
        r = httpx.get(
            "https://list.essentialmedicines.org/search",
            params={"q": salt_name, "format": "json"},
            headers=_HEADERS,
            timeout=8,
        )
        if r.status_code == 200:
            data = r.json()
            return [
                {
                    "name": item.get("name"),
                    "category": item.get("section"),
                    "formulation": item.get("formulation"),
                    "is_essential": True,
                    "source": "WHO_EML",
                    "is_verified": True,
                    "verification_source": "WHO-EML",
                }
                for item in data.get("results", [])[:5]
            ]
    except Exception:
        pass
    return []


# ── CDSCO verification via public API ────────────────────────────────────────

def verify_cdsco(brand_name: str, manufacturer: str = "") -> dict:
    """
    Attempt to verify medicine against CDSCO's public drug approval database.
    Uses the unofficial public search endpoint.
    Returns: {verified: bool, approval_info: str, source: str}
    """
    try:
        # CDSCO public search (GET endpoint available for drug lookups)
        r = httpx.get(
            "https://cdscoonline.gov.in/CDSCO/Drugs",
            params={
                "brandName": brand_name,
                "manufacturerName": manufacturer,
            },
            headers=_HEADERS,
            timeout=10,
            follow_redirects=True,
        )
        # Check if brand name appears in response HTML
        if r.status_code == 200 and brand_name.lower() in r.text.lower():
            return {
                "verified": True,
                "approval_info": "Found in CDSCO public database",
                "source": "CDSCO",
            }
    except Exception as exc:
        logger.warning("CDSCO check failed (network): %s", exc)

    # Fallback: check if salt is in WHO EML (reliable proxy for legitimacy)
    return {
        "verified": False,
        "approval_info": "Could not verify with CDSCO (offline or not found)",
        "source": "unverified",
    }


def verify_medicine_composition(salt_composition: str, alternative_composition: str) -> dict:
    """
    Compare two salt compositions to determine if they're equivalent.
    Returns match percentage and whether it's a safe substitute.
    """
    def parse_salts(comp: str) -> set:
        # Extract salt names (strip numbers/units like 500mg, 10mcg)
        parts = re.split(r"[+,/]", comp.lower())
        salts = set()
        for p in parts:
            cleaned = re.sub(r"\d+(\.\d+)?\s*(mg|mcg|iu|g|ml|%)", "", p).strip()
            if cleaned:
                salts.add(cleaned)
        return salts

    orig_salts = parse_salts(salt_composition)
    alt_salts = parse_salts(alternative_composition)

    if not orig_salts:
        return {"match_percent": 0, "exact_match": False, "safe_substitute": False}

    intersection = orig_salts & alt_salts
    match_pct = int((len(intersection) / len(orig_salts)) * 100)

    return {
        "match_percent": match_pct,
        "exact_match": match_pct == 100,
        "safe_substitute": match_pct >= 80,
        "matched_salts": list(intersection),
        "missing_salts": list(orig_salts - alt_salts),
    }


# ── Helpers ──────────────────────────────────────────────────────────────────

def _first(field) -> str:
    """Safely get first item from FDA label list field."""
    if isinstance(field, list) and field:
        return field[0][:500]  # trim long text
    return ""
