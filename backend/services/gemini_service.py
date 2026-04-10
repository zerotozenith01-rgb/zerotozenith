"""
gemini_service.py
─────────────────
Uses Google Gemini (free tier) to enrich medicine data:
  • Fetch disease/use description when DB has no info
  • Suggest cheap verified alternatives by salt composition
  • Parse prescription images (base64)

Set GEMINI_API_KEY in your .env file.
"""

import os
import json
import re
import logging
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

_API_KEY = os.getenv("GEMINI_API_KEY", "")

if _API_KEY:
    genai.configure(api_key=_API_KEY)
    _model = genai.GenerativeModel("gemini-1.5-flash-latest")  # free tier model
    _vision_model = genai.GenerativeModel("gemini-1.5-flash-latest")
    _GEMINI_AVAILABLE = True
else:
    _model = None
    _vision_model = None
    _GEMINI_AVAILABLE = False
    logger.warning("GEMINI_API_KEY not set — Gemini enrichment disabled.")


# ── Helpers ──────────────────────────────────────────────────────────────────

def _safe_json(text: str) -> dict | list | None:
    """Strip markdown fences and parse JSON safely."""
    cleaned = re.sub(r"```(?:json)?|```", "", text).strip()
    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        logger.error("Gemini JSON parse failed: %s", text[:300])
        return None


def _call(prompt: str, max_tokens: int = 800) -> str | None:
    """Raw Gemini text call with error handling."""
    if not _GEMINI_AVAILABLE:
        return None
    try:
        resp = _model.generate_content(
            prompt,
            generation_config=genai.types.GenerationConfig(
                max_output_tokens=max_tokens,
                temperature=0.2,
            ),
        )
        return resp.text
    except Exception as exc:
        logger.error("Gemini API error: %s", exc)
        return None


# ── Public API ────────────────────────────────────────────────────────────────

def enrich_medicine(brand_name: str, salt_composition: str = "") -> dict:
    """
    Returns enriched info for a medicine:
      - uses / diseases it treats
      - side effects summary
      - dosage guidance
      - category
    Returns {} on failure.
    """
    prompt = f"""
You are a pharmacology expert. For the medicine below, return ONLY a JSON object
(no markdown, no explanation) with these exact keys:

{{
  "uses": "comma-separated list of diseases/conditions this medicine treats",
  "side_effects": "brief comma-separated common side effects",
  "dosage_guidance": "general adult dosage guidance in one sentence",
  "category": "one of: Antibiotic | Pain Relief | Gastro | Cardiac | Diabetes | Allergy | Respiratory | Supplements | Antiviral | Antifungal | Neurological | Other",
  "description": "2-sentence plain-English description of what this medicine does"
}}

Medicine: {brand_name}
Salt/Composition: {salt_composition or "unknown"}
"""
    raw = _call(prompt)
    if not raw:
        return {}
    result = _safe_json(raw)
    return result if isinstance(result, dict) else {}


def find_cheap_alternatives(
    brand_name: str,
    salt_composition: str,
    current_price: float,
) -> list[dict]:
    """
    Ask Gemini to suggest cheaper generic alternatives with same salt composition.
    Returns list of dicts: [{brand_name, manufacturer, salt_composition,
                              estimated_price, why_cheaper, is_generic}]
    """
    prompt = f"""
You are an Indian pharmaceutical expert with knowledge of CDSCO-approved generics.

Original medicine: {brand_name}
Salt composition: {salt_composition}
Current price: ₹{current_price}

List up to 6 REAL cheaper alternatives available in India with the SAME salt composition.
Prefer Jan Aushadhi / generic / Cipla / Sun Pharma / Dr. Reddy's generics.

Return ONLY a JSON array (no markdown):
[
  {{
    "brand_name": "...",
    "manufacturer": "...",
    "salt_composition": "...",
    "estimated_price": <number in INR>,
    "savings_percent": <integer 0-90>,
    "why_cheaper": "brief reason (e.g. generic, Jan Aushadhi)",
    "is_generic": <true/false>,
    "available_india": true
  }}
]

Only include medicines that genuinely exist. Do not invent brands.
"""
    raw = _call(prompt, max_tokens=1200)
    if not raw:
        return []
    result = _safe_json(raw)
    return result if isinstance(result, list) else []


def parse_prescription_image(base64_image: str, mime_type: str = "image/jpeg") -> dict:
    """
    Uses Gemini Vision to extract medicine names from a prescription image.
    Returns {"medicines": ["med1", "med2", ...], "raw_text": "..."}
    """
    if not _GEMINI_AVAILABLE or not _vision_model:
        return {"medicines": [], "raw_text": ""}

    prompt = """
Extract all medicine names from this prescription or medicine package image.
Return ONLY a JSON object:
{
  "medicines": ["medicine_name_1", "medicine_name_2"],
  "raw_text": "all readable text from image"
}
"""
    try:
        import base64 as b64lib
        image_data = {
            "mime_type": mime_type,
            "data": base64_image,
        }
        resp = _vision_model.generate_content(
            [prompt, {"inline_data": image_data}],
            generation_config=genai.types.GenerationConfig(
                max_output_tokens=600,
                temperature=0.1,
            ),
        )
        result = _safe_json(resp.text)
        return result if isinstance(result, dict) else {"medicines": [], "raw_text": resp.text}
    except Exception as exc:
        logger.error("Gemini Vision error: %s", exc)
        return {"medicines": [], "raw_text": ""}
