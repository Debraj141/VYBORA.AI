from flask import Flask, jsonify, request
from flask_cors import CORS
from recommender import recommend, CATALOG
from preferences import record_feedback, get_preferences

app = Flask(__name__)
CORS(app)

@app.get("/api/health")
def health():
    return jsonify({"status": "ok", "app": "VYBORA", "catalog_size": len(CATALOG)})

@app.get("/api/catalog")
def catalog():
    return jsonify({"tracks": CATALOG, "count": len(CATALOG)})

@app.post("/api/recommend")
def recommendations():
    body = request.get_json(silent=True) or {}
    query = str(body.get("query", "")).strip()
    mode = str(body.get("mode", "familiar")).lower()
    user_id = str(body.get("user_id", "demo_user"))
    if not query:
        return jsonify({"error": "Please provide a music prompt."}), 400
    if mode not in ("familiar", "discover"):
        return jsonify({"error": "Mode must be 'familiar' or 'discover'."}), 400
    result = recommend(query, mode, user_id)
    return jsonify(result)

@app.post("/api/feedback")
def feedback():
    body = request.get_json(silent=True) or {}
    user_id = str(body.get("user_id", "demo_user"))
    semantic_id = str(body.get("semantic_id", "")).strip()
    action = str(body.get("action", "")).lower()
    valid_ids = {track["semantic_id"] for track in CATALOG}
    if semantic_id not in valid_ids:
        return jsonify({"error": "Unknown semantic_id."}), 404
    if action not in ("save", "skip"):
        return jsonify({"error": "Action must be 'save' or 'skip'."}), 400
    prefs = record_feedback(user_id, semantic_id, action)
    return jsonify({"success": True, "preferences": prefs})

@app.get("/api/preferences/<user_id>")
def preferences(user_id):
    return jsonify(get_preferences(user_id))

if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=True)
