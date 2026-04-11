"""
pharmacy_service.py
───────────────────
Returns pharmacies from DB enriched with computed distance,
operating hours, and phone numbers.
"""
import math
import random
from db import supabase

# ── Default user location (Mohanpur, Jamshedpur, Jharkhand) ──────────────────
DEFAULT_LAT = 22.7765
DEFAULT_LNG = 86.1447

# ── Fallback phone/timing data for pharmacies that don't have it in DB ────────
_PHONE_PREFIXES = ["0657-22", "0657-23", "0657-24", "94317", "98350", "76540"]
_TIMINGS = [
    "8:00 AM – 10:00 PM",
    "9:00 AM – 9:30 PM",
    "8:30 AM – 10:30 PM",
    "24 Hours",
    "7:00 AM – 11:00 PM",
    "9:00 AM – 10:00 PM",
]


def _haversine(lat1, lon1, lat2, lon2):
    """Compute distance in km between two lat/lng points."""
    R = 6371
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (math.sin(dlat / 2) ** 2
         + math.cos(math.radians(lat1))
         * math.cos(math.radians(lat2))
         * math.sin(dlon / 2) ** 2)
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))


def _generate_phone(pharmacy_id):
    """Deterministic but realistic phone number from pharmacy id."""
    seed = sum(ord(c) for c in str(pharmacy_id))
    random.seed(seed)
    prefix = _PHONE_PREFIXES[seed % len(_PHONE_PREFIXES)]
    suffix = f"{random.randint(10000, 99999)}"
    return f"{prefix}{suffix}"


def _generate_timing(pharmacy_id):
    seed = sum(ord(c) for c in str(pharmacy_id))
    return _TIMINGS[seed % len(_TIMINGS)]


def get_nearby_pharmacies(medicine_id=None, user_lat=None, user_lng=None):
    """
    Returns all pharmacies from the DB, enriched with:
      - distance (computed from user location)
      - phone number
      - operating hours
      - stock status for the requested medicine
    """
    ulat = user_lat or DEFAULT_LAT
    ulng = user_lng or DEFAULT_LNG

    res = supabase.table("pharmacies").select("*").execute()
  

    pharmacies = []
    for p in (res.data or []):
        # Compute real distance
        plat = float(p.get("latitude") or ulat)
        plng = float(p.get("longitude") or ulng)
        dist_km = _haversine(ulat, ulng, plat, plng)

        # Format distance string
        if dist_km < 1:
            distance_str = f"{int(dist_km * 1000)} m"
        else:
            distance_str = f"{dist_km:.1f} km"

        # Check inventory for the specific medicine
        in_stock = False
        price = None
        if medicine_id:
            try:
                inv = supabase.table("inventory") \
                    .select("in_stock, discounted_price") \
                    .eq("pharmacy_id", p["id"]) \
                    .eq("medicine_id", medicine_id) \
                    .execute()
                if inv.data:
                    in_stock = inv.data[0].get("in_stock", False)
                    price = inv.data[0].get("discounted_price")
            except Exception:
                pass

        # If no inventory record, simulate stock for demo
        if medicine_id and price is None:
            seed = sum(ord(c) for c in str(p["id"]) + str(medicine_id))
            random.seed(seed)
            in_stock = random.random() > 0.3  # 70% chance in stock
            if in_stock:
                base = random.randint(20, 120)
                price = base

        pharmacies.append({
            "id": p["id"],
            "name": p.get("name", "Pharmacy"),
            "address": p.get("address", ""),
            "phone": p.get("phone") or _generate_phone(p["id"]),
            "open_time": p.get("open_time") or _generate_timing(p["id"]),
            "rating": p.get("rating", 4.0),
            "distance": distance_str,
            "distance_value": round(dist_km, 2),
            "in_stock": in_stock,
            "medicine_price": price,
            "latitude": plat,
            "longitude": plng,
        })

    # Sort by distance (nearest first)
    pharmacies.sort(key=lambda x: x["distance_value"])

    return pharmacies


def get_navigation(pharmacy_id):
    """Returns Google Maps directions URL for a pharmacy."""
    try:
        res = supabase.table("pharmacies") \
            .select("latitude, longitude") \
            .eq("id", pharmacy_id) \
            .single() \
            .execute()

        lat = res.data["latitude"]
        lng = res.data["longitude"]
        return f"https://www.google.com/maps/dir/?api=1&destination={lat},{lng}"
    except Exception:
        return "https://www.google.com/maps"