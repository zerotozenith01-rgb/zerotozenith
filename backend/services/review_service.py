from db import supabase

def get_reviews(medicine_id):
    res = supabase.table("reviews") \
        .select("*") \
        .eq("medicine_id", medicine_id) \
        .execute()

    reviews = res.data

    total = len(reviews)
    avg = sum(r["rating"] for r in reviews) / total if total else 0

    return {
        "reviews": reviews,
        "total": total,
        "average_rating": round(avg, 1)
    }


def add_review(data):
    supabase.table("reviews").insert(data).execute()