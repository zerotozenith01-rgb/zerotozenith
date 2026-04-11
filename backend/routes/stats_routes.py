import datetime
from flask import Blueprint, jsonify
from db import supabase

stats_bp = Blueprint("stats", __name__)


@stats_bp.route("/stats")
def stats():
    med_count = supabase.table("medicines").select("*", count="exact").execute()
    pharm_count = supabase.table("pharmacies").select("*", count="exact").execute()
    rev_count = supabase.table("reviews").select("*", count="exact").execute()

    # ── Category breakdown from the DB ──
    all_meds = supabase.table("medicines").select("id, brand_name, category, price, manufacturer").execute()
    cat_map = {}
    for m in (all_meds.data or []):
        cat = m.get("category") or "General"
        if cat not in cat_map:
            cat_map[cat] = {"count": 0, "total_price": 0}
        cat_map[cat]["count"] += 1
        cat_map[cat]["total_price"] += float(m.get("price") or 0)

    categories = [
        {
            "name": name[:12],
            "count": info["count"],
            "avg_price": round(info["total_price"] / info["count"], 0) if info["count"] else 0,
        }
        for name, info in sorted(cat_map.items(), key=lambda x: -x[1]["count"])[:7]
    ]

    # ── Top savings: group by salt via medicine_composition → salts join ──
    top_savings = []
    try:
        # Get salt compositions for all medicines
        comp_res = supabase.table("medicine_composition") \
            .select("medicine_id, salt_id, salts(salt_name)") \
            .execute()

        # Build medicine_id → salt_name map
        med_salt_map = {}
        for c in (comp_res.data or []):
            mid = c["medicine_id"]
            salt_name = c.get("salts", {}).get("salt_name", "") if c.get("salts") else ""
            if salt_name:
                if mid not in med_salt_map:
                    med_salt_map[mid] = []
                med_salt_map[mid].append(salt_name)

        # Group medicines by their salt composition
        salt_groups = {}
        for m in (all_meds.data or []):
            mid = m["id"]
            salts = med_salt_map.get(mid, [])
            salt_key = ", ".join(sorted(salts)).lower() if salts else ""
            if not salt_key:
                continue
            price = float(m.get("price") or 0)
            if price <= 0:
                continue
            if salt_key not in salt_groups:
                salt_groups[salt_key] = []
            salt_groups[salt_key].append(m)

        for salt_key, meds in salt_groups.items():
            if len(meds) < 2:
                continue
            sorted_meds = sorted(meds, key=lambda x: float(x.get("price", 0)))
            cheapest = sorted_meds[0]
            expensive = sorted_meds[-1]
            cheap_price = float(cheapest.get("price", 0))
            exp_price = float(expensive.get("price", 0))
            if exp_price > cheap_price and exp_price > 0:
                saving_pct = round((1 - cheap_price / exp_price) * 100)
                if saving_pct >= 10:
                    salt_names = med_salt_map.get(expensive["id"], [])
                    top_savings.append({
                        "expensive_brand": expensive.get("brand_name", ""),
                        "cheapest_brand": cheapest.get("brand_name", ""),
                        "savings_percent": saving_pct,
                        "savings_amount": round(exp_price - cheap_price),
                        "salt_composition": ", ".join(salt_names),
                    })
        top_savings.sort(key=lambda x: -x["savings_percent"])
        top_savings = top_savings[:5]
    except Exception:
        top_savings = []

    # ── Recent searches (placeholder — can wire to a search_log table later) ──
    now = datetime.datetime.now()
    recent_searches = [
        {"query": "paracetamol", "timestamp": (now - datetime.timedelta(hours=1)).isoformat(), "results_count": 8},
        {"query": "azithromycin", "timestamp": (now - datetime.timedelta(hours=3)).isoformat(), "results_count": 5},
        {"query": "dolo 650", "timestamp": (now - datetime.timedelta(hours=6)).isoformat(), "results_count": 3},
        {"query": "metformin", "timestamp": (now - datetime.timedelta(hours=12)).isoformat(), "results_count": 4},
    ]

    return jsonify({
        "total_medicines": med_count.count,
        "total_pharmacies": pharm_count.count,
        "total_reviews": rev_count.count,
        "average_savings": top_savings[0]["savings_percent"] if top_savings else 40,
        "categories": categories,
        "top_savings": top_savings,
        "recent_searches": recent_searches,
    })