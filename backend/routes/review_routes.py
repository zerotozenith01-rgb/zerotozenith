from flask import Blueprint, request, jsonify
from services.review_service import get_reviews, add_review

review_bp = Blueprint("review", __name__)

@review_bp.route("/")
def all_reviews():
    """Return the most recent reviews across all medicines."""
    from db import supabase
    res = supabase.table("reviews").select("*").limit(20).execute()
    reviews = res.data or []
    return jsonify({"reviews": reviews, "total": len(reviews)})

@review_bp.route("/<medicine_id>")
def reviews(medicine_id):
    return jsonify(get_reviews(medicine_id))


@review_bp.route("", methods=["POST"])
def add():
    data = request.json
    add_review(data)
    return jsonify({"message": "Review added", "success": True})