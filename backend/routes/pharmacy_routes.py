from flask import Blueprint, request
from services.pharmacy_service import get_nearby_pharmacies, get_navigation

pharmacy_bp = Blueprint("pharmacy", __name__)

@pharmacy_bp.route("/nearby")
def nearby():
    medicine_id = request.args.get("medicine_id")
    pharmacies = get_nearby_pharmacies(medicine_id)
    return {"pharmacies": pharmacies}


@pharmacy_bp.route("/navigation/<pharmacy_id>")
def navigation(pharmacy_id):
    url = get_navigation(pharmacy_id)
    return {"map_url": url}