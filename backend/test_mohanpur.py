import requests, json, sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

# Test with Mohanpur coordinates
r = requests.get("http://127.0.0.1:5000/api/pharmacies/nearby?lat=22.7765&lng=86.1447", timeout=10)
data = r.json()
print(f"Total: {len(data['pharmacies'])} pharmacies\n")
print("Nearest pharmacies from Mohanpur, Jamshedpur:")
for p in data["pharmacies"][:10]:
    print(f"  {p['name']}")
    print(f"    {p['address']}")
    print(f"    Distance: {p['distance']}")
    print()
