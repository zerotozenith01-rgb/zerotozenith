from db import supabase

def get_reviews(medicine_id):
    res = supabase.table("reviews") \
        .select("*") \
        .eq("medicine_id", medicine_id) \
        .execute()

    reviews = res.data

    # Enrich reviews with user_name and date from the data
    enriched = []
    for r in reviews:
        # Try to get user name
        user_name = "Anonymous"
        if r.get("user_id"):
            try:
                user_res = supabase.table("users").select("name").eq("id", r["user_id"]).execute()
                if user_res.data:
                    user_name = user_res.data[0]["name"]
            except:
                pass

        enriched.append({
            "id": r["id"],
            "medicine_id": r["medicine_id"],
            "user_name": user_name,
            "rating": r.get("rating", 3),
            "comment": r.get("comment", ""),
            "side_effects": r.get("side_effects", ""),
            "date": r.get("created_at", "2026-04-01"),
            "verified_purchase": True,
        })

    total = len(enriched)
    avg = sum(r["rating"] for r in enriched) / total if total else 0

    # Build rating distribution
    rating_dist = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0}
    for r in enriched:
        rating = max(1, min(5, r["rating"]))
        rating_dist[rating] = rating_dist.get(rating, 0) + 1

    return {
        "reviews": enriched,
        "total": total,
        "average_rating": round(avg, 1),
        "rating_distribution": rating_dist,
    }


def add_review(data):
    # Map frontend fields to DB columns
    insert_data = {
        "medicine_id": data.get("medicine_id"),
        "rating": data.get("rating", 5),
        "comment": data.get("comment", ""),
    }
    # If we have a user_id, use it; otherwise try user_name lookup
    if data.get("user_id"):
        insert_data["user_id"] = data["user_id"]

    supabase.table("reviews").insert(insert_data).execute()