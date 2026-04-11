from db import supabase
import json

r = supabase.table("pharmacies").select("name, address").execute()
for p in r.data:
    print(f"{p['name']} - {p['address']}")
print(f"\nTotal: {len(r.data)}")
