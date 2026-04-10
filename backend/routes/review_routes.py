from flask import Blueprint, request
from services.review_service import get_reviews, add_review

review_bp = Blueprint("review", __name__)

@review_bp.route("/<medicine_id>")
def reviews(medicine_id):
    return get_reviews(medicine_id)


@review_bp.route("", methods=["POST"])
def add():
    data = request.json
    add_review(data)
    return {"message": "Review added"}