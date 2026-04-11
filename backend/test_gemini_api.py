"""Test Gemini API integration with model fallback."""
import requests
import json
import sys
import io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

BASE = "http://127.0.0.1:5000"

print("=" * 60)
print("Gemini API Integration Test")
print("=" * 60)

# 1. Test medicine search (triggers Gemini enrichment)
print("\n1. Medicine search with Gemini enrichment")
r = requests.get(f"{BASE}/api/medicines/search?q=crocin", timeout=30)
data = r.json()
if data.get("medicines"):
    m = data["medicines"][0]
    print(f"   Brand: {m.get('brand_name')}")
    print(f"   Salt: {m.get('salt_composition')}")
    print(f"   Uses: {m.get('uses', 'N/A')[:80]}")
    print(f"   Side Effects: {m.get('side_effects', 'N/A')[:80]}")
    print(f"   Safety Warnings: {m.get('safety_warnings', 'N/A')[:80]}")
    print(f"   Food Interactions: {m.get('food_interactions', 'N/A')[:80]}")
    print(f"   Storage: {m.get('storage', 'N/A')[:80]}")
    print(f"   Dosage: {m.get('dosage_guidance', 'N/A')[:80]}")
    # Check if we got real Gemini data vs fallback
    if "Consult a physician" in m.get("side_effects", ""):
        print("   ⚠ Using FALLBACK data (Gemini may still be quota-limited)")
    else:
        print("   ✅ Got REAL Gemini-enriched data!")
else:
    print("   ❌ No results")

# 2. Test alternatives (triggers Gemini alternative suggestions)
print("\n2. Alternatives with Gemini suggestions")
if data.get("medicines"):
    mid = data["medicines"][0]["id"]
    r = requests.get(f"{BASE}/api/medicines/{mid}/alternatives", timeout=30)
    alt_data = r.json()
    print(f"   Total alternatives: {alt_data.get('total_alternatives', 0)}")
    if alt_data.get("exact_matches"):
        for a in alt_data["exact_matches"][:3]:
            src = a.get("source", "unknown")
            print(f"   - {a['brand_name']} ₹{a.get('price')} ({a.get('match_percent')}% match, src: {src})")
    if alt_data.get("similar_matches"):
        for a in alt_data["similar_matches"][:2]:
            src = a.get("source", "unknown")
            print(f"   ~ {a['brand_name']} ₹{a.get('price')} ({a.get('match_percent')}% match, src: {src})")

# 3. Test profile recommendations (uses Gemini)
print("\n3. Profile AI recommendations")
r = requests.get(f"{BASE}/api/profile/recommendations", timeout=30)
rec_data = r.json()
recs = rec_data.get("recommendations", [])
print(f"   Got {len(recs)} recommendations")
for rec in recs[:3]:
    print(f"   - {rec.get('title', rec.get('medicine', 'N/A'))}: {str(rec.get('reason', rec.get('note', '')))[:60]}")

print("\n" + "=" * 60)
print("Gemini integration test complete!")
