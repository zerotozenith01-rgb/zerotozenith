"""
Update pharmacy addresses to realistic local addresses and add more local stores.
"""
from db import supabase

# Update existing pharmacies with real local addresses
updates = [
    ("Apollo Pharmacy",    "Hirapur Main Road, Near BCCL Gate, Dhanbad",     23.7957, 86.4304, 4.5),
    ("MedPlus",            "Bank More, Dhanbad - 826001",                    23.7937, 86.4340, 4.2),
    ("Wellness Forever",   "Near PMH Hospital, Sardar Patel Nagar, Dhanbad", 23.7990, 86.4250, 4.0),
    ("Guardian Pharmacy",  "Bartand Main Road, Dhanbad",                     23.7880, 86.4180, 3.9),
    ("Trust Medicos",      "Dhanbad Railway Station Road, Dhanbad",          23.7940, 86.4350, 4.1),
    ("Care & Cure",        "Katras Road, Near Bhuli, Dhanbad",               23.7730, 86.4100, 4.3),
    ("LifeLine Pharmacy",  "Jharia Market, Jharia, Dhanbad",                 23.7440, 86.4150, 3.8),
    ("City Medico",        "Bus Stand Road, Govindpur, Dhanbad",             23.7650, 86.3930, 4.0),
    ("HealthHub Pharmacy", "Lake Road, Near Topchanchi, Dhanbad",            23.7800, 86.4500, 4.2),
    ("Medico Plus",        "Gandhi Chowk, Sindri, Dhanbad",                  23.7560, 86.3830, 3.7),
]

# Update existing pharmacies
for name, address, lat, lng, rating in updates:
    res = supabase.table("pharmacies").select("id").eq("name", name).execute()
    if res.data:
        supabase.table("pharmacies").update({
            "address": address,
            "latitude": lat,
            "longitude": lng,
            "rating": rating,
        }).eq("id", res.data[0]["id"]).execute()
        print(f"  Updated: {name}")

# Add new local pharmacies
new_pharmacies = [
    {
        "name": "Jan Aushadhi Kendra",
        "address": "District Hospital Complex, Dhanbad - 826001",
        "latitude": 23.7920,
        "longitude": 86.4280,
        "rating": 4.6,
    },
    {
        "name": "Shree Ganesh Medical",
        "address": "Luby Circular Road, Near SBI Main Branch, Dhanbad",
        "latitude": 23.7975,
        "longitude": 86.4320,
        "rating": 4.1,
    },
    {
        "name": "Netmeds Pharmacy",
        "address": "Shastri Nagar, Near Railway Colony, Dhanbad",
        "latitude": 23.7910,
        "longitude": 86.4200,
        "rating": 4.4,
    },
    {
        "name": "Kumar Medical Store",
        "address": "Steel Gate, Near ISM Gate, Dhanbad",
        "latitude": 23.8130,
        "longitude": 86.4400,
        "rating": 4.0,
    },
    {
        "name": "Sanjivani Pharmacy",
        "address": "Randhir Verma Chowk, Hirapur, Dhanbad",
        "latitude": 23.7960,
        "longitude": 86.4310,
        "rating": 4.3,
    },
]

for p in new_pharmacies:
    existing = supabase.table("pharmacies").select("id").eq("name", p["name"]).execute()
    if not existing.data:
        supabase.table("pharmacies").insert(p).execute()
        print(f"  Added: {p['name']}")
    else:
        print(f"  Already exists: {p['name']}")

# Print final list
print("\n--- All Pharmacies ---")
res = supabase.table("pharmacies").select("name, address, latitude, longitude, rating").execute()
for p in res.data:
    print(f"  {p['name']}: {p['address']} ({p['latitude']}, {p['longitude']}) ★{p['rating']}")
print(f"\nTotal: {len(res.data)} pharmacies")
