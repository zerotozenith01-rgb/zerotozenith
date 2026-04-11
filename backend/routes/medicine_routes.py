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

# ── SEARCH ENDPOINTS ─────────────────────────────────────────────────────────

@medicine_bp.route("/search", methods=["GET"])
def search():
    """
    Standard search using brand name or salt.
    Query params: q (string), category (string)
    """
    q = request.args.get("q", "").strip()
    category = request.args.get("category", "All")
    
    if not q:
        return jsonify({"medicines": []})

    medicines = search_medicines(q)

    if category and category != "All":
        medicines = [m for m in medicines if m.get("category") == category]

    return jsonify({"medicines": medicines})


@medicine_bp.route("/smart-search", methods=["GET"])
def smart_search_route():
    """
    Fuzzy-match autocomplete suggestions for the search bar dropdown.
    """
    q = request.args.get("q", "").strip()
    if not q:
        return jsonify({"suggestions": []})
    
    return jsonify({"suggestions": smart_search(q)})


@medicine_bp.route("/nlp-search", methods=["GET"])
def nlp_search():
    """
    Uses spaCy to extract intent from natural language.
    Example: "I have a stomach ache" -> search_medicines("stomach ache")
    """
    q = request.args.get("q", "").strip()
    if not q:
        return jsonify({"medicines": [], "parsed_query": ""})

    parsed = nlp_parse_query(q)
    medicines = search_medicines(parsed)
    return jsonify({"medicines": medicines, "parsed_query": parsed})


# ── DETAIL & ALTERNATIVES ───────────────────────────────────────────────────

@medicine_bp.route("/<medicine_id>/detail", methods=["GET"])
def detail(medicine_id):
    """
    Returns full pharmacological detail card.
    """
    data = get_medicine_detail(medicine_id)
    if not data:
        return jsonify({"error": "Medicine not found"}), 404
    return jsonify(data)


@medicine_bp.route("/<medicine_id>/alternatives", methods=["GET"])
def alternatives(medicine_id):
    """
    Fetches composition-matched cheaper alternatives from DB and Gemini.
    """
    data = get_alternatives(medicine_id)
    if not data:
        return jsonify({"error": "Alternatives could not be processed"}), 404
    return jsonify(data)


# ── VERIFICATION & REGULATORY ───────────────────────────────────────────────

@medicine_bp.route("/verify", methods=["GET"])
def verify():
    """
    Cross-references medicine against CDSCO (India) and OpenFDA.
    """
    brand_name = request.args.get("brand_name", "").strip()
    manufacturer = request.args.get("manufacturer", "").strip()

    if not brand_name:
        return jsonify({"error": "brand_name parameter is required"}), 400

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
        "verified": cdsco_result.get("verified", False) or bool(fda_info.get("brand_name")),
    })


# ── VISION / OCR SCANNING ───────────────────────────────────────────────────

@medicine_bp.route("/scan-prescription", methods=["POST"])
def scan_prescription():
    """
    Extracts medicine names from a prescription image using Gemini Vision.
    Supports: multipart/form-data (file upload) or application/json (base64).
    """
    image_data = None
    mime_type = "image/jpeg"

    # 1. Check for File Upload (e.g., from a FormData object)
    if 'file' in request.files:
        file = request.files['file']
        image_data = file.read()
        mime_type = file.content_type or "image/jpeg"
    
    # 2. Check for Base64 JSON (e.g., from a React Native/Web camera component)
    else:
        body = request.json or {}
        image_b64 = body.get("image", "")
        if image_b64:
            # Handle potential header in base64 string
            if "," in image_b64:
                image_b64 = image_b64.split(",")[1]
            image_data = base64.b64decode(image_b64)
            mime_type = body.get("mime_type", "image/jpeg")

    if not image_data:
        return jsonify({"error": "No image data provided"}), 400

    # Call the Gemini service with binary data
    ocr_result = parse_prescription_image(image_data, mime_type)
    medicine_names = ocr_result.get("medicines", [])

    # Fallback: if Gemini returned nothing (quota exceeded), try filename hint
    if not medicine_names and 'file' in request.files:
        filename = request.files['file'].filename or ""
        # Strip extension and clean
        import re as _re
        name_hint = _re.sub(r'\.[^.]+$', '', filename)          # remove extension
        name_hint = _re.sub(r'[_\-\d]+', ' ', name_hint).strip()  # clean separators
        if name_hint and len(name_hint) > 2:
            medicine_names = [name_hint]

    # Automatically search for the first few medicines found
    search_results = {}
    detected_medicines = []
    for name in medicine_names[:3]:
        results = search_medicines(name)
        if results:
            search_results[name] = results[:3]
            detected_medicines.append({"name": name, "found": True})
        else:
            detected_medicines.append({"name": name, "found": False})

    return jsonify({
        "extracted_medicines": medicine_names,
        "detected_medicines": detected_medicines,
        "search_results": search_results,
        "status": "success" if medicine_names else "no_medicines_detected",
    })