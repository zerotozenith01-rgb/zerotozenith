from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from routes.medicine_routes import medicine_bp
from routes.pharmacy_routes import pharmacy_bp
from routes.review_routes import review_bp
from routes.stats_routes import stats_bp

app = Flask(__name__)
CORS(app)

app.register_blueprint(medicine_bp, url_prefix="/api/medicines")
app.register_blueprint(pharmacy_bp, url_prefix="/api/pharmacies")
app.register_blueprint(review_bp, url_prefix="/api/reviews")
app.register_blueprint(stats_bp, url_prefix="/api")

@app.route("/api/prices/compare", methods=["GET"])
def prices_compare():
    medicine_id = request.args.get("medicine_id")
    return jsonify({
      "alternatives_comparison": [],
      "pharmacy_prices": [
          {"pharmacy_name": "Apollo Pharmacy", "price": 45},
          {"pharmacy_name": "City Medicos", "price": 50}
      ],
      "cheapest": {"pharmacy_name": "Apollo Pharmacy", "price": 45},
      "most_expensive": {"pharmacy_name": "City Medicos", "price": 50},
      "potential_savings": 5
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
