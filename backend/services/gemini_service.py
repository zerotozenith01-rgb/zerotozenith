"""
gemini_service.py
─────────────────
Uses Google Gemini (new google.genai SDK) for:
  • Medicine enrichment (expanded details)
  • Cheap alternative suggestions
  • Prescription image OCR
"""

import os
import json
import re
import logging
from google import genai
from google.genai import types
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

# ── Client setup ─────────────────────────────────────────────────────────────
_API_KEY = os.getenv("GEMINI_API_KEY", "")
_GEMINI_AVAILABLE = False
client = None

if _API_KEY:
    client = genai.Client(api_key=_API_KEY)
    _GEMINI_AVAILABLE = True
else:
    logger.warning("GEMINI_API_KEY not set — Gemini features disabled.")

MODEL_ID = "gemini-2.0-flash-lite"  # free tier, fast, supports vision


# ── Helpers ──────────────────────────────────────────────────────────────────

def clean_json_response(text):
    """Strip markdown fences and parse JSON safely."""
    if not text:
        return None
    try:
        json_match = re.search(r'```json\s*(.*?)\s*```', text, re.DOTALL)
        if json_match:
            return json.loads(json_match.group(1))

        # Try array
        arr_match = re.search(r'(\[.*\])', text, re.DOTALL)
        if arr_match:
            try:
                return json.loads(arr_match.group(1))
            except json.JSONDecodeError:
                pass

        # Try object
        obj_match = re.search(r'(\{.*\})', text, re.DOTALL)
        if obj_match:
            return json.loads(obj_match.group(1))

        return json.loads(text)
    except (json.JSONDecodeError, AttributeError) as e:
        logger.error("Gemini JSON parse failed: %s", str(e))
        return None


def _call(prompt, max_tokens=1000):
    """Raw Gemini text call with error handling."""
    if not _GEMINI_AVAILABLE or not client:
        return None
    try:
        resp = client.models.generate_content(
            model=MODEL_ID,
            contents=prompt,
            config=types.GenerateContentConfig(
                max_output_tokens=max_tokens,
                temperature=0.2,
            ),
        )
        return resp.text
    except Exception as exc:
        logger.error("Gemini API error: %s", exc)
        return None


# ── Public API ───────────────────────────────────────────────────────────────

def enrich_medicine(brand_name, salt_composition=""):
    """
    Returns highly detailed enriched medicine info.
    Includes Safety Warnings, Food Interactions, and Storage.
    """
    prompt = f"""
You are a pharmacology expert. For the medicine below, return ONLY a JSON object 
(no markdown, no explanation) with these exact keys:

{{
  "uses": "detailed list of conditions treated",
  "side_effects": "common and serious side effects",
  "dosage_guidance": "one sentence on typical administration frequency",
  "category": "Antibiotic | Pain Relief | Gastro | Cardiac | Diabetes | Allergy | Respiratory | Supplements | Antiviral | Antifungal | Neurological | Other",
  "description": "Professional 2-sentence summary of pharmacological action",
  "safety_warnings": "specific warnings regarding alcohol, pregnancy, or driving",
  "food_interactions": "any significant food or drink restrictions",
  "storage": "recommended storage temperature and conditions"
}}

Medicine: {brand_name}
Salt/Composition: {salt_composition or "unknown"}
"""
    raw = _call(prompt)
    if not raw:
        # Robust fallback matching the new keys
        return {
            "uses": f"Treatment for conditions associated with {salt_composition or brand_name}.",
            "side_effects": "Consult a physician for side effect profile.",
            "dosage_guidance": "As directed by your healthcare provider.",
            "category": "General",
            "description": f"{brand_name} is a medication used to manage symptoms related to its active ingredients.",
            "safety_warnings": "Avoid alcohol; consult doctor if pregnant.",
            "food_interactions": "No general interactions known; check with pharmacist.",
            "storage": "Store in a cool, dry place away from sunlight."
        }
    
    result = clean_json_response(raw)
    return result if isinstance(result, dict) else {}


def find_cheap_alternatives(brand_name, salt_composition, current_price=50):
    """
    Suggests cheaper generic alternatives with same salt composition.
    """
    prompt = f"""
You are an Indian pharmaceutical expert. 
Original medicine: {brand_name}
Salt composition: {salt_composition}
Current price: ₹{current_price}

List up to 6 REAL cheaper alternatives in India with the SAME salt composition.
Focus on Jan Aushadhi, Cipla, Sun Pharma, or Dr. Reddy's generics.

Return ONLY a JSON array:
[
  {{
    "brand_name": "...",
    "manufacturer": "...",
    "salt_composition": "...",
    "estimated_price": <number>,
    "savings_percent": <int>,
    "why_cheaper": "...",
    "is_generic": true,
    "available_india": true
  }}
]
"""
    raw = _call(prompt, max_tokens=1200)
    if not raw:
        return []
    result = clean_json_response(raw)
    return result if isinstance(result, list) else []


def parse_prescription_image(image_data, mime_type="image/jpeg"):
    """
    Uses Gemini Vision to extract medicine names from a prescription image.
    """
    if not _GEMINI_AVAILABLE or not client:
        return {"medicines": []}

    prompt = """
Extract ALL medicine names from this image.
Return ONLY a JSON object: {"medicines": ["name1", "name2"]}
"""
    try:
        image_part = types.Part.from_bytes(data=image_data, mime_type=mime_type)
        resp = client.models.generate_content(
            model=MODEL_ID,
            contents=[prompt, image_part],
            config=types.GenerateContentConfig(
                max_output_tokens=600,
                temperature=0.1,
            ),
        )
        result = clean_json_response(resp.text)
        return result if isinstance(result, dict) else {"medicines": []}
    except Exception as exc:
        logger.error("Gemini Vision error: %s", exc)
        return {"medicines": []}