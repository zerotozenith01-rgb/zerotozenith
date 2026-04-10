from flask import Blueprint
from db import supabase

stats_bp = Blueprint("stats", __name__)

@stats_bp.route("/stats")
def stats():
    med_count = supabase.table("medicines").select("*", count="exact").execute()
    pharm_count = supabase.table("pharmacies").select("*", count="exact").execute()
    rev_count = supabase.table("reviews").select("*", count="exact").execute()

    return {
        "total_medicines": med_count.count,
        "total_pharmacies": pharm_count.count,
        "total_reviews": rev_count.count,
        "average_savings": 45
    }