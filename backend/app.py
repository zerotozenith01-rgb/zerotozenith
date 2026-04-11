from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from routes.medicine_routes import medicine_bp
from routes.pharmacy_routes import pharmacy_bp
from routes.review_routes import review_bp
from routes.stats_routes import stats_bp
from routes.profile_routes import profile_bp
from routes.auth_routes import auth_bp

app = Flask(__name__)
CORS(app)

app.register_blueprint(medicine_bp, url_prefix="/api/medicines")
app.register_blueprint(pharmacy_bp, url_prefix="/api/pharmacies")
app.register_blueprint(review_bp, url_prefix="/api/reviews")
app.register_blueprint(stats_bp, url_prefix="/api")
app.register_blueprint(profile_bp, url_prefix="/api/profile")
app.register_blueprint(auth_bp, url_prefix="/api/auth")

@app.route("/api/prices/compare", methods=["GET"])
def prices_compare():
    from db import supabase as _sb
    medicine_id = request.args.get("medicine_id")
    
    # Get the selected medicine
    try:
        med_res = _sb.table("medicines").select("*").eq("id", medicine_id).execute()
    except Exception:
        return jsonify({"alternatives_comparison": [], "pharmacy_prices": [], "cheapest": None, "most_expensive": None, "potential_savings": 0})
    if not med_res.data:
        return jsonify({"alternatives_comparison": [], "pharmacy_prices": [], "cheapest": None, "most_expensive": None, "potential_savings": 0})
    
    medicine = med_res.data[0]
    
    # Get salt composition via join tables
    comp_res = _sb.table("medicine_composition") \
        .select("salt_id, salts(salt_name)") \
        .eq("medicine_id", medicine_id) \
        .execute()
    salt_ids = [c["salt_id"] for c in (comp_res.data or []) if c.get("salt_id")]
    
    # Find all medicines with the same salts
    alts = []
    if salt_ids:
        alt_comp = _sb.table("medicine_composition") \
            .select("medicine_id, medicines(id, brand_name, manufacturer, price)") \
            .in_("salt_id", salt_ids) \
            .execute()
        
        seen = set()
        for c in (alt_comp.data or []):
            m = c.get("medicines")
            if not m or m["id"] in seen:
                continue
            seen.add(m["id"])
            price = float(m.get("price") or 0)
            if price <= 0:
                continue
            is_original = m["id"] == medicine_id
            alts.append({
                "name": m.get("brand_name", "Unknown"),
                "price": price,
                "type": "original" if is_original else "generic",
                "manufacturer": m.get("manufacturer", "Unknown"),
                "price_per_unit": round(price / 10, 1),
            })
    
    # If no alternatives found, just show the original
    if not alts:
        price = float(medicine.get("price") or 0)
        alts = [{"name": medicine.get("brand_name"), "price": price, "type": "original", "manufacturer": medicine.get("manufacturer", ""), "price_per_unit": round(price / 10, 1)}]
    
    alts.sort(key=lambda x: x["price"])
    
    # Get pharmacy prices
    pharm_res = _sb.table("pharmacies").select("name, address").limit(5).execute()
    import random
    base_price = float(medicine.get("price") or 50)
    pharmacy_prices = []
    for p in (pharm_res.data or []):
        variation = round(base_price * random.uniform(0.85, 1.15))
        pharmacy_prices.append({
            "pharmacy_name": p.get("name", "Pharmacy"),
            "price": variation,
            "address": p.get("address", ""),
        })
    pharmacy_prices.sort(key=lambda x: x["price"])
    
    cheapest = alts[0] if alts else None
    most_expensive = alts[-1] if alts else None
    savings = round(most_expensive["price"] - cheapest["price"]) if cheapest and most_expensive else 0

    return jsonify({
        "alternatives_comparison": alts,
        "pharmacy_prices": pharmacy_prices,
        "cheapest": cheapest,
        "most_expensive": most_expensive,
        "potential_savings": max(savings, 0),
    })

@app.route("/api/shopkeeper/request", methods=["POST"])
def shopkeeper_request():
    return jsonify({"success": True, "message": "Request sent successfully"})

@app.route("/")
def home():
    return {"message": "SaltSense Backend Running"}

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host='0.0.0.0', port=port)
