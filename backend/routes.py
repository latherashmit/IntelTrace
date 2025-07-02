from flask import jsonify, request
from load_data import load_data
from datetime import datetime  
from auth_routes import auth_bp, token_required  # COPILOT MODIFICATIOB

# Load preprocessed data
suspects, events, transactions = load_data()

def setup_routes(app):
    app.register_blueprint(auth_bp)  # COPILOT MODIFICATION

    # GET /api/suspects
    @app.route("/api/suspects")
    def get_suspects():
        return jsonify(suspects.to_dict(orient="records"))

    # GET /api/search?name=xyz
    @app.route("/api/search")
    def search_suspects():
        query = request.args.get("name", "").lower()
        if not query:
            return jsonify({"error": "Missing 'name' parameter"}), 400

        matches = suspects[suspects["name"].str.lower().str.contains(query)]

        results = []
        for _, row in matches.iterrows():
            involved_events = events[events["suspects_involved"].apply(lambda lst: row["suspect_id"] in lst)]
            event_ids = involved_events["event_id"].tolist()

            results.append({
                "suspect_id": row["suspect_id"],
                "name": row["name"],
                "location": row.get("location", ""),
                "risk_level": row.get("risk_level", ""),
                "known_associates": row.get("known_associates", []),
                "associated_events": event_ids
            })

        return jsonify(results)

    # GET /api/events
    @app.route("/api/events")
    def get_events():
        return jsonify(events.to_dict(orient="records"))

    # GET /api/transactions
    @app.route("/api/transactions")
    def get_transactions():
        return jsonify(transactions.to_dict(orient="records"))

    # GET /api/graph
    @app.route("/api/graph")
    def get_graph():
        nodes = []
        edges = []

        # Suspect nodes
        for _, row in suspects.iterrows():
            nodes.append({
                "id": row["suspect_id"],
                "label": row["name"],
                "group": "suspect",
                "risk": row["risk_level"]
            })
            for associate in row["known_associates"]:
                edges.append({
                    "from": row["suspect_id"],
                    "to": associate,
                    "label": "associate"
                })

        # Event nodes
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

        # Transaction edges
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
            except Exception as e:
                continue  # skip any rows with invalid date/time

            alert_data.append({
                "title": row["type"],
                "location": row["location"],
                "time": dt.strftime("%Y-%m-%d %H:%M"),
                "level": level
            })

        return jsonify(sorted(alert_data, key=lambda x: x["time"], reverse=True))

#COPILOT MODIFICATION
    @app.route("/api/protected")
    @token_required
    def protected(current_user):
        return jsonify({'message': f'Hello, {current_user}. This is a protected route.'})

