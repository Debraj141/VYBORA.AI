"""Tiny JSON-backed preference store for hackathon demonstration."""
import json
from pathlib import Path

DATA_FILE = Path(__file__).with_name("preferences.json")

def _load():
    if not DATA_FILE.exists():
        return {}
    try:
        return json.loads(DATA_FILE.read_text(encoding="utf-8"))
    except (json.JSONDecodeError, OSError):
        return {}

def record_feedback(user_id: str, semantic_id: str, action: str):
    data = _load()
    user = data.setdefault(user_id, {"saved": [], "skipped": []})
    target = "saved" if action == "save" else "skipped"
    other = "skipped" if action == "save" else "saved"
    if semantic_id not in user[target]:
        user[target].append(semantic_id)
    if semantic_id in user[other]:
        user[other].remove(semantic_id)
    DATA_FILE.write_text(json.dumps(data, indent=2), encoding="utf-8")
    return user

def get_preferences(user_id: str):
    return _load().get(user_id, {"saved": [], "skipped": []})
