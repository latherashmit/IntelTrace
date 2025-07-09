from flask import jsonify, request
from load_data import load_data
from datetime import datetime  
# from auth_routes import auth_bp, token_required  # 🔒 Auth imports removed for demo

# Load preprocessed data
suspects, events, transactions = load_data()

def setup_routes(app):
    # app.register_blueprint(auth_bp)  # 🔒 Auth blueprint registration removed

    @app.route("/api/suspects")
    def get_suspects():
        # Calculate risk level for each suspect based on their transactions
        txns = transactions.copy()
        txns["suspicious_flag"] = txns.apply(lambda row: derive_flag(row), axis=1)
        risk_map = {}
        flag_order = {"High": 3, "Medium": 2, "Low": 1}
        for _, row in suspects.iterrows():
            related_flags = txns[(txns["from_id"] == row["suspect_id"]) | (txns["to_id"] == row["suspect_id"])]["suspicious_flag"].tolist()
            if related_flags:
                # Take the highest risk
                max_flag = max(related_flags, key=lambda f: flag_order.get(f, 0))
            else:
                max_flag = "Low"
            risk_map[row["suspect_id"]] = max_flag
        result = []
        for _, row in suspects.iterrows():
            d = row.to_dict()
            d["risk_level"] = risk_map[row["suspect_id"]]
            result.append(d)
        return jsonify(result)

    @app.route("/api/search")
    def search_suspects():
        query = request.args.get("name", "").lower()
        if not query:
            return jsonify({"error": "Missing 'name' parameter"}), 400
        txns = transactions.copy()
        txns["suspicious_flag"] = txns.apply(lambda row: derive_flag(row), axis=1)
        risk_map = {}
        flag_order = {"High": 3, "Medium": 2, "Low": 1}
        for _, row in suspects.iterrows():
            related_flags = txns[(txns["from_id"] == row["suspect_id"]) | (txns["to_id"] == row["suspect_id"])]["suspicious_flag"].tolist()
            if related_flags:
                max_flag = max(related_flags, key=lambda f: flag_order.get(f, 0))
            else:
                max_flag = "Low"
            risk_map[row["suspect_id"]] = max_flag
        matches = suspects[suspects["name"].str.lower().str.contains(query)]
        results = []
        for _, row in matches.iterrows():
            involved_events = events[events["suspects_involved"].apply(lambda lst: row["suspect_id"] in lst)]
            event_ids = involved_events["event_id"].tolist()
            results.append({
                "suspect_id": row["suspect_id"],
                "name": row["name"],
                "location": row.get("location", ""),
                "known_associates": row.get("known_associates", []),
                "associated_events": event_ids,
                "risk_level": risk_map[row["suspect_id"]]
            })
        return jsonify(results)

    def derive_flag(row):
        amt = float(row["amount"])
        method = str(row["method"]).lower()
        if amt >= 80000 or method in ["crypto", "hawala"]:
            return "High"
        elif amt >= 30000:
            return "Medium"
        else:
            return "Low"

    @app.route("/api/events")
    def get_events():
        return jsonify(events.to_dict(orient="records"))

    @app.route("/api/transactions")
    def get_transactions():
        def derive_flag(row):
            amt = float(row["amount"])
            method = str(row["method"]).lower()
            if amt >= 80000 or method in ["crypto", "hawala"]:
                return "High"
            elif amt >= 30000:
                return "Medium"
            else:
                return "Low"

        txns = transactions.copy()
        txns["suspicious_flag"] = txns.apply(derive_flag, axis=1)
        return jsonify(txns.to_dict(orient="records"))

    @app.route("/api/graph")
    def get_graph():
        # Calculate risk_map for suspects
        txns = transactions.copy()
        txns["suspicious_flag"] = txns.apply(lambda row: derive_flag(row), axis=1)
        flag_order = {"High": 3, "Medium": 2, "Low": 1}
        risk_map = {}
        for _, row in suspects.iterrows():
            related_flags = txns[(txns["from_id"] == row["suspect_id"]) | (txns["to_id"] == row["suspect_id"])]["suspicious_flag"].tolist()
            if related_flags:
                max_flag = max(related_flags, key=lambda f: flag_order.get(f, 0))
            else:
                max_flag = "Low"
            risk_map[row["suspect_id"]] = max_flag
        nodes = []
        edges = []
        for _, row in suspects.iterrows():
            nodes.append({
                "id": row["suspect_id"],
                "label": row["name"],
                "group": "suspect",
                "risk": risk_map[row["suspect_id"]]
            })
            for associate in row["known_associates"]:
                edges.append({
                    "from": row["suspect_id"],
                    "to": associate,
                    "label": "associate"
                })

        for _, row in events.iterrows():
            nodes.append({
                "id": row["event_id"],
                "label": row["type"],
                "group": "event"
            })
            for s in row["suspects_involved"]:
                edges.append({
                    "from": s,
                    "to": row["event_id"],
                    "label": "involved"
                })

        for _, row in transactions.iterrows():
            edges.append({
                "from": row["from_id"],
                "to": row["to_id"],
                "label": f"₹{row['amount']}",
                "method": row["method"]
            })

        return jsonify({"nodes": nodes, "edges": edges})

    @app.route("/api/alerts")
    def get_alerts():
        alert_data = []

        for _, row in events.iterrows():
            level = "MEDIUM"
            if "bomb" in row["type"].lower() or "ied" in row["type"].lower():
                level = "HIGH"

            try:
                dt = datetime.strptime(f"{row['date']} {row['time']}", "%Y-%m-%d %H:%M")
            except Exception:
                continue

            alert_data.append({
                "title": row["type"],
                "location": row["location"],
                "time": dt.strftime("%Y-%m-%d %H:%M"),
                "level": level
            })

        return jsonify(sorted(alert_data, key=lambda x: x["time"], reverse=True))

    # 🔒 Auth-protected route commented out
    # @app.route("/api/protected")
    # @token_required
    # def protected(current_user):
    #     return jsonify({'message': f'Hello, {current_user}. This is a protected route.'})

