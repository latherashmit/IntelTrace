from flask import jsonify, request #imports flask to build APIs and handle HTTP(HyperText Transfer Protocol) requests
from load_data import load_data #imports custom function for loading datasets
from datetime import datetime  #import datetime class for parsing dates/times
# import ast  # for safe conversion of string to list PROBLEM1

suspects, events, transactions = load_data() #Loads the data using load_data() helper function

# Flags transactions on basis of which suspects are classified
#ADVANCE THE LOGIC+
def derive_flag(row):
    amt = float(row["amount"])
    method = str(row["method"]).lower()
    time_str = row["time"]
    try:
        txn_hour = int(time_str.split(":")[0])
    except:
        txn_hour = 0

    suspicious_methods = ["crypto", "hawala"]
    is_suspicious_time = 0 <= txn_hour < 5

    if amt >= 80000 and method in suspicious_methods and is_suspicious_time:
        return "High"
    elif amt >= 30000 and txn_hour >= 2:
        return "Medium"
    else:
        return "Low"

def setup_routes(app):

    # Creates a risk level{high,medium,low} per suspect based on transactions using derive_flag() to evaluate each transaction
    def compute_risk_map():
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
        return risk_map, txns


    # Return a JSON list of all suspects with their risk levels added
    @app.route("/api/suspects")
    def get_suspects():
        risk_map, _ = compute_risk_map() 
        result = []
        for _, row in suspects.iterrows():
            d = row.to_dict()
            d["risk_level"] = risk_map[row["suspect_id"]]
            result.append(d)
        return jsonify(result)
    

    # Accepts 'name' as a parameter and filters the suspects by name attaching additional infos
    @app.route("/api/search")
    def search_suspects():
        query = request.args.get("name", "").lower()
        if not query:
            return jsonify({"error": "Missing 'name' parameter"}), 400

        # Get the risk map for each suspect
        risk_map, _ = compute_risk_map()

        # Match suspects based on lowercase search
        matches = suspects[suspects["name"].str.lower().str.contains(query)]  # UPDATED: still matching by name

        results = []
        for _, row in matches.iterrows():
            involved_events = events[
                events["suspects_involved"].apply(lambda lst: row["suspect_id"] in lst)  # UPDATED
            ]

            event_ids = involved_events["event_id"].tolist()  # UPDATED

            results.append({
                "suspect_id": row["suspect_id"],  # UPDATED
                "name": row["name"],
                "age": row["age"],  # UPDATED: new field
                "nationality": row["nationality"],  # UPDATED: new field
                "last_seen_city": row["last_seen_city"],  # UPDATED: new field
                "last_seen_coordinates": row["last_seen_coordinates"],  # UPDATED: new field
                "associated_events": event_ids,
                "risk_level": risk_map.get(row["suspect_id"], "Unknown")  # UPDATED: safe access
            })

        return jsonify(results)

    
    @app.route("/api/events")
    def get_events():
        return jsonify(events.to_dict(orient="records"))
    
    # Returns all transactions with added suspicious_flag
    @app.route("/api/transactions")
    def get_transactions():
        txns = transactions.copy()
        txns["suspicious_flag"] = txns.apply(derive_flag, axis=1)  
        return jsonify(txns.to_dict(orient="records"))
    
    #Key defination
    ##Defines a REST endpoint at /api/graph , when client sends a GET URL , the function below will run
    @app.route("/api/graph")  
    def get_graph():
        risk_map, txns = compute_risk_map()
        nodes = [] #Appends suspects and events
        edges = [] #Appends transactions with suspects and involvement in events
        for _, row in suspects.iterrows(): #Iterate over each row in suspects and adds a node
            nodes.append({
                #keys in dictionary to define a graph node {id , label , group , risk} , these are the fields in the JSON we would return
                "id": row["suspect_id"],
                "label": row["name"], #Displayed in frontend
                "group": "suspect",
                "risk": risk_map[row["suspect_id"]]
            })

        for _, row in events.iterrows():  #Iterate over each row in events and adds a node
            nodes.append({
                "id": row["event_id"],
                "label": row["type"],
                "group": "event"
            })
            for s in row["suspects_involved"]: #Iterate over all suspects involved in a particular event and adds an edge
                edges.append({
                    "from": s,
                    "to": row["event_id"],
                    "label": "involved"
                })

        for _, row in transactions.iterrows(): #Iterate over each row in transaction and adds an edge
            edges.append({
                "from": row["from_id"],
                "to": row["to_id"],
                "label": f"₹{row['amount']}",
                "method": row["method"]
            })

        return jsonify({"nodes": nodes, "edges": edges}) #Converts it to JSON and packages nodes and edges into a dictionary

    #Scans all events classifying them into alerts
    @app.route("/api/alerts")
    def get_alerts():
        alert_data = []

        for _, row in events.iterrows():
            level = "MEDIUM"
            if "bomb" in row["type"].lower():
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
    
        # Returns detailed info for all suspects, including risk and associated events
    @app.route("/api/suspect-details-all")
    def get_all_suspect_details():
        risk_map, _ = compute_risk_map()
        all_details = []

        for _, row in suspects.iterrows():
            involved_events = events[
                events["suspects_involved"].apply(lambda lst: row["suspect_id"] in lst)
            ]
            event_ids = involved_events["event_id"].tolist()

            all_details.append({
                "suspect_id": row["suspect_id"],
                "name": row["name"],
                "age": row["age"],
                "nationality": row["nationality"],
                "last_seen_city": row["last_seen_city"],
                "last_seen_coordinates": row["last_seen_coordinates"],
                "associated_events": event_ids,
                "risk_level": risk_map.get(row["suspect_id"], "Unknown")
            })

        return jsonify(all_details)

