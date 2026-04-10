from db import supabase

def get_nearby_pharmacies(medicine_id=None):
    res = supabase.table("pharmacies").select("*").execute()

    pharmacies = []
    for p in res.data:
        inv = supabase.table("inventory") \
            .select("*") \
            .eq("pharmacy_id", p["id"]) \
            .execute()

        in_stock = False
        price = None

        for item in inv.data:
            if medicine_id and item["medicine_id"] == medicine_id:
                in_stock = item["in_stock"]
                price = item["discounted_price"]

        pharmacies.append({
            "id": p["id"],
            "name": p["name"],
            "address": p["address"],
            "rating": p["rating"],
            "in_stock": in_stock,
            "medicine_price": price
        })

    if not pharmacies:
        return [
            {
                "id": "mock_id_1",
                "name": "Apollo Pharmacy (Mock)",
                "address": "123 Main St",
                "rating": 4.5,
                "in_stock": True,
                "medicine_price": 50
            },
            {
                "id": "mock_id_2",
                "name": "City Medicos (Mock)",
                "address": "456 Market Road",
                "rating": 4.1,
                "in_stock": True,
                "medicine_price": 45
            }
        ]

    return pharmacies


def get_navigation(pharmacy_id):
    res = supabase.table("pharmacies") \
        .select("latitude, longitude") \
        .eq("id", pharmacy_id) \
        .single() \
        .execute()

    lat = res.data["latitude"]
    lng = res.data["longitude"]

    return f"https://www.google.com/maps/dir/?api=1&destination={lat},{lng}"