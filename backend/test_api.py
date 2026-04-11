"""Quick API health check - tests all endpoints."""
import requests, json, sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

BASE = "http://127.0.0.1:5000"

def test(name, method="GET", url="", body=None, expect_key=None):
    try:
        if method == "POST":
            r = requests.post(f"{BASE}{url}", json=body, timeout=10)
        else:
            r = requests.get(f"{BASE}{url}", timeout=10)
        data = r.json()
        status = "OK" if r.status_code < 400 else f"FAIL({r.status_code})"
        detail = ""
        if expect_key and expect_key in data:
            val = data[expect_key]
            if isinstance(val, list):
                detail = f" → {len(val)} items"
            elif isinstance(val, dict):
                detail = f" → {list(val.keys())[:3]}"
            else:
                detail = f" → {val}"
        print(f"  [{status}] {name}{detail}")
        return data
    except Exception as e:
        print(f"  [ERROR] {name}: {e}")
        return None

print("=" * 60)
print("SmartMeds API Health Check")
print("=" * 60)

print("\n1. AUTH")
test("Register (new)", "POST", "/api/auth/register", {"name":"API Test","email":"apitest@test.com","password":"test123"}, "success")
test("Login", "POST", "/api/auth/login", {"email":"apitest@test.com","password":"test123"}, "user")
test("Login (wrong pw)", "POST", "/api/auth/login", {"email":"apitest@test.com","password":"wrong"}, "error")

print("\n2. STATS")
test("Dashboard stats", "GET", "/api/stats", expect_key="total_medicines")

print("\n3. MEDICINE SEARCH")
data = test("Search 'dolo'", "GET", "/api/medicines/search?q=dolo", expect_key="medicines")
if data and data.get("medicines"):
    m = data["medicines"][0]
    print(f"     Brand: {m.get('brand_name')} | Salt: {m.get('salt_composition')} | ₹{m.get('price')}")
    print(f"     Uses: {m.get('uses','N/A')[:60]}")
    print(f"     Side Effects: {m.get('side_effects','N/A')[:60]}")
    print(f"     Warnings: {m.get('safety_warnings','N/A')[:60]}")
    # Test alternatives for this medicine
    mid = m.get("id")
    if mid:
        test(f"Alternatives for {m['brand_name']}", "GET", f"/api/medicines/{mid}/alternatives", expect_key="alternatives")

print("\n4. SMART SEARCH (autocomplete)")
test("Smart search 'para'", "GET", "/api/medicines/smart-search?q=para", expect_key="suggestions")

print("\n5. PHARMACIES")
test("Nearby pharmacies", "GET", "/api/pharmacies/nearby", expect_key="pharmacies")

print("\n6. REVIEWS")
test("Reviews list", "GET", "/api/reviews", expect_key="reviews")

print("\n7. PROFILE")
test("Get profile", "GET", "/api/profile", expect_key="name")
test("Add treatment", "POST", "/api/profile/treatment", {"condition":"Test Fever","doctor":"Test","date":"2026-04-01","medicines_used":["Dolo 650"],"notes":"test"}, "success")
test("Add medicine", "POST", "/api/profile/medicine", {"name":"Glycomet 500","dosage":"500mg","frequency":"Twice daily"}, "success")
test("Recommendations", "GET", "/api/profile/recommendations", expect_key="recommendations")

print("\n8. PRICE COMPARE")
test("Price compare", "GET", "/api/prices/compare?medicine_id=test", expect_key="pharmacy_prices")

print("\n" + "=" * 60)
print("Health check complete!")
