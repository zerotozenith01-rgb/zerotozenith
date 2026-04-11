"""
profile_routes.py
─────────────────
Endpoints for user medical profile:
  GET  /api/profile                 — get user profile & medical history
  POST /api/profile                 — save/update profile
  POST /api/profile/treatment       — add a past treatment
  DELETE /api/profile/treatment     — remove a treatment
  POST /api/profile/medicine        — add a current medicine
  DELETE /api/profile/medicine      — remove a current medicine
  GET  /api/profile/recommendations — get personalized medicine recommendations
"""

from flask import Blueprint, request, jsonify
from services.gemini_service import enrich_medicine, _call, clean_json_response

profile_bp = Blueprint("profile", __name__)

# In-memory store (per-session). In production, use Supabase users table.
_profiles = {}

def _get_profile(user_id="default"):
    if user_id not in _profiles:
        _profiles[user_id] = {
            "name": "Aditya",
            "email": "aditya@example.com",
            "phone": "+91 98765 43210",
            "location": "Gurugram, Haryana",
            "allergies": "",
            "blood_group": "",
            "past_treatments": [],
            "current_medicines": [],
        }
    return _profiles[user_id]


@profile_bp.route("", methods=["GET"])
def get_profile():
    profile = _get_profile()
    return jsonify(profile)


@profile_bp.route("", methods=["POST"])
def save_profile():
    body = request.json or {}
    profile = _get_profile()
    for key in ("name", "email", "phone", "location", "allergies", "blood_group"):
        if key in body:
            profile[key] = body[key]
    return jsonify({"success": True, "profile": profile})


@profile_bp.route("/treatment", methods=["POST"])
def add_treatment():
    body = request.json or {}
    profile = _get_profile()
    treatment = {
        "id": len(profile["past_treatments"]) + 1,
        "condition": body.get("condition", ""),
        "doctor": body.get("doctor", ""),
        "date": body.get("date", ""),
        "medicines_used": body.get("medicines_used", []),
        "notes": body.get("notes", ""),
    }
    profile["past_treatments"].append(treatment)
    return jsonify({"success": True, "treatment": treatment})


@profile_bp.route("/treatment", methods=["DELETE"])
def remove_treatment():
    tid = request.args.get("id", type=int)
    profile = _get_profile()
    profile["past_treatments"] = [t for t in profile["past_treatments"] if t["id"] != tid]
    return jsonify({"success": True})


@profile_bp.route("/medicine", methods=["POST"])
def add_medicine():
    body = request.json or {}
    profile = _get_profile()
    medicine = {
        "id": len(profile["current_medicines"]) + 1,
        "name": body.get("name", ""),
        "dosage": body.get("dosage", ""),
        "frequency": body.get("frequency", ""),
        "since": body.get("since", ""),
        "prescribed_by": body.get("prescribed_by", ""),
    }
    profile["current_medicines"].append(medicine)
    return jsonify({"success": True, "medicine": medicine})


@profile_bp.route("/medicine", methods=["DELETE"])
def remove_medicine():
    mid = request.args.get("id", type=int)
    profile = _get_profile()
    profile["current_medicines"] = [m for m in profile["current_medicines"] if m["id"] != mid]
    return jsonify({"success": True})


@profile_bp.route("/recommendations", methods=["GET"])
def get_recommendations():
    """
    Generate personalized recommendations based on user's medical history.
    """
    profile = _get_profile()
    
    current_meds = [m["name"] for m in profile.get("current_medicines", [])]
    past_conditions = [t["condition"] for t in profile.get("past_treatments", [])]
    past_meds = []
    for t in profile.get("past_treatments", []):
        past_meds.extend(t.get("medicines_used", []))
    allergies = profile.get("allergies", "")

    if not current_meds and not past_conditions:
        return jsonify({"recommendations": [], "message": "Add your medical history to get personalized recommendations."})

    prompt = f"""
You are a pharmaceutical advisor. Based on this patient profile, suggest 3-5 helpful recommendations.

Current Medicines: {', '.join(current_meds) if current_meds else 'None'}
Past Conditions: {', '.join(past_conditions) if past_conditions else 'None'}
Previously Used Medicines: {', '.join(set(past_meds)) if past_meds else 'None'}
Known Allergies: {allergies or 'None'}

Return ONLY a JSON array of recommendation objects:
[
  {{
    "title": "short recommendation title",
    "description": "1-2 sentence explanation",
    "type": "warning | suggestion | info",
    "related_medicine": "medicine name if applicable"
  }}
]

Focus on: drug interactions, better alternatives they should ask their doctor about, 
lifestyle tips related to their conditions, and any precautions given their history.
"""
    raw = _call(prompt)
    if not raw:
        # Fallback recommendations based on profile data
        recs = []
        if current_meds:
            recs.append({
                "title": f"Review your {current_meds[0]} dosage",
                "description": f"Regular check-ups ensure your current {current_meds[0]} prescription remains optimal.",
                "type": "suggestion",
                "related_medicine": current_meds[0],
            })
        if past_conditions:
            recs.append({
                "title": f"Monitor for {past_conditions[0]} recurrence",
                "description": f"Given your history with {past_conditions[0]}, maintain regular follow-ups with your doctor.",
                "type": "info",
                "related_medicine": "",
            })
        if allergies:
            recs.append({
                "title": "Allergy Alert Active",
                "description": f"Your allergy to {allergies} is noted. All medicine suggestions will account for this.",
                "type": "warning",
                "related_medicine": "",
            })
        recs.append({
            "title": "Keep your profile updated",
            "description": "An accurate medical history helps us suggest safer and more affordable alternatives.",
            "type": "info",
            "related_medicine": "",
        })
        return jsonify({"recommendations": recs})

    result = clean_json_response(raw)
    return jsonify({"recommendations": result if isinstance(result, list) else []})
