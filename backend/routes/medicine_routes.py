"""
medicine_routes.py  (enhanced)
────────────────────────────────
Endpoints:
  GET  /api/medicines/search             — full ilike search + API enrichment
  GET  /api/medicines/smart-search       — fuzzy autocomplete dropdown
  GET  /api/medicines/nlp-search         — spaCy NLP natural-language search
  GET  /api/medicines/<id>/alternatives  — DB + Gemini + OpenFDA alternatives
  GET  /api/medicines/<id>/detail        — full enriched detail card
  POST /api/medicines/scan-prescription  — Gemini Vision OCR on uploaded image
  GET  /api/medicines/verify             — on-demand CDSCO/OpenFDA verification
"""

import base64
from flask import Blueprint, request, jsonify
from services.medicine_service import (
    search_medicines,
    get_alternatives,
    smart_search,
    nlp_parse_query,
    get_medicine_detail,
)
from services.openfda_service import verify_cdsco, fetch_drug_label
from services.gemini_service import parse_prescription_image

medicine_bp = Blueprint("medicine", __name__)


# ── /search ──────────────────────────────────────────────────────────────────

@medicine_bp.route("/search")
def search():
    """
    Standard search. Returns enriched medicine cards including:
      - uses / diseases treated
      - salt composition
      - is_verified status
    """
    q = request.args.get("q", "").strip()
    category = request.args.get("category", "All")
    medicines = search_medicines(q)

    if category and category != "All":
        medicines = [m for m in medicines if m.get("category", "") == category]

    return jsonify({"medicines": medicines})


# ── /smart-search ─────────────────────────────────────────────────────────────

@medicine_bp.route("/smart-search")
def smart_search_route():
    """
    Fuzzy-match autocomplete suggestions.
    Query param: q
    Returns: [{id, brand_name, score}]
    """
    q = request.args.get("q", "").strip()
    if not q:
        return jsonify({"suggestions": []})
    return jsonify({"suggestions": smart_search(q)})


# ── /nlp-search ───────────────────────────────────────────────────────────────

@medicine_bp.route("/nlp-search")
def nlp_search():
    """
    Natural-language search. spaCy extracts drug name token, then full search.
    E.g. "I need something for headache" → parsed: "headache" → searches by salt
    """
    q = request.args.get("q", "").strip()
    if not q:
        return jsonify({"medicines": [], "parsed_query": ""})

    parsed = nlp_parse_query(q)
    medicines = search_medicines(parsed)
    return jsonify({"medicines": medicines, "parsed_query": parsed})


# ── /<id>/alternatives ────────────────────────────────────────────────────────

@medicine_bp.route("/<medicine_id>/alternatives")
def alternatives(medicine_id):
    """
    Returns cheap, composition-verified alternatives.
    Response includes:
      - original medicine info
      - exact_matches (≥95% composition match)
      - similar_matches (80–94% match)
      - Each entry has: is_verified, verification_source, savings_percent,
                        match_percent, composition_match, is_generic
    """
    data = get_alternatives(medicine_id)
    return jsonify(data)


# ── /<id>/detail ──────────────────────────────────────────────────────────────

@medicine_bp.route("/<medicine_id>/detail")
def detail(medicine_id):
    """
    Full enriched detail for one medicine.
    Used when user clicks a result card for more info.
    """
    data = get_medicine_detail(medicine_id)
    if not data:
        return jsonify({"error": "Medicine not found"}), 404
    return jsonify(data)


# ── /verify ───────────────────────────────────────────────────────────────────

@medicine_bp.route("/verify")
def verify():
    """
    On-demand verification of a medicine against CDSCO + OpenFDA.
    Query params: brand_name, manufacturer (optional)
    Returns: {verified, approval_info, source, fda_info}
    """
    brand_name = request.args.get("brand_name", "").strip()
    manufacturer = request.args.get("manufacturer", "").strip()

    if not brand_name:
        return jsonify({"error": "brand_name param required"}), 400

    cdsco_result = verify_cdsco(brand_name, manufacturer)
    fda_info = fetch_drug_label(brand_name)

    return jsonify({
        "brand_name": brand_name,
        "cdsco": cdsco_result,
        "openfda": {
            "found": bool(fda_info.get("brand_name")),
            "generic_name": fda_info.get("generic_name"),
            "indications": fda_info.get("indications"),
            "manufacturer": fda_info.get("manufacturer"),
        },
        "verified": cdsco_result["verified"] or bool(fda_info.get("brand_name")),
    })


# ── /scan-prescription ────────────────────────────────────────────────────────

@medicine_bp.route("/scan-prescription", methods=["POST"])
def scan_prescription():
    """
    POST a base64 image (JSON body: {image: "<base64>", mime_type: "image/jpeg"})
    Returns extracted medicine names + search results for each.
    """
    body = request.json or {}
    image_b64 = body.get("image", "")
    mime_type = body.get("mime_type", "image/jpeg")

    if not image_b64:
        # Try file upload
        file = request.files.get("file")
        if file:
            image_b64 = base64.b64encode(file.read()).decode("utf-8")
            mime_type = file.content_type or "image/jpeg"

    if not image_b64:
        return jsonify({"error": "No image provided"}), 400

    ocr_result = parse_prescription_image(image_b64, mime_type)
    medicine_names = ocr_result.get("medicines", [])

    # Search for each extracted medicine name
    search_results = {}
    for name in medicine_names[:5]:  # limit to 5 to avoid rate-limit
        results = search_medicines(name)
        if results:
            search_results[name] = results[:3]

    return jsonify({
        "extracted_medicines": medicine_names,
        "raw_text": ocr_result.get("raw_text", ""),
        "search_results": search_results,
    })
