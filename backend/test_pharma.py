import requests, json, sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

r = requests.get("http://127.0.0.1:5000/api/pharmacies/nearby", timeout=10)
data = r.json()
print(f"Total pharmacies: {len(data['pharmacies'])}\n")
for p in data["pharmacies"][:5]:
    print(f"  {p['name']}")
    print(f"    Address:  {p['address']}")
    print(f"    Phone:    {p['phone']}")
    print(f"    Hours:    {p['open_time']}")
    print(f"    Rating:   {p['rating']}")
    print(f"    Distance: {p['distance']}")
    print()
