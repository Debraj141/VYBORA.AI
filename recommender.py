"""Transparent baseline recommender: metadata relevance + discovery/familiar modes."""
import json
from pathlib import Path
from intent import extract_intent
from preferences import get_preferences

CATALOG_PATH = Path(__file__).with_name("catalog.json")
CATALOG = json.loads(CATALOG_PATH.read_text(encoding="utf-8"))

def recommend(query: str, mode: str = "familiar", user_id: str = "demo_user", limit: int = 6):
    intent = extract_intent(query)
    prefs = get_preferences(user_id)
    saved_ids = set(prefs["saved"])
    skipped_ids = set(prefs["skipped"])
    ranked = []

    for track in CATALOG:
        mood_hits = len(set(intent["moods"]) & set(track["mood"]))
        activity_hits = len(set(intent["activities"]) & set(track["activity"]))
        genre_hits = len(set(intent["genres"]) & set(track["genre"]))
        energy_match = 1 if intent["energy"] == track["energy"] else 0
        # Weighted transparent score; matching metadata matters more than popularity.
        raw = (0.40 * min(mood_hits, 1) +
               0.30 * min(activity_hits, 1) +
               0.15 * min(genre_hits, 1) +
               0.15 * energy_match)
        if not any([intent["moods"], intent["activities"], intent["genres"]]):
            raw = 0.25 + 0.15 * energy_match

        if mode == "familiar":
            if track["semantic_id"] in saved_ids:
                raw += 0.12
            raw += (track["popularity"] / 100) * 0.04
        else:
            # Discovery mode gently favors less-mainstream catalogue entries.
            raw += (1 - track["popularity"] / 100) * 0.12
            if track["semantic_id"] in saved_ids:
                raw -= 0.08

        if track["semantic_id"] in skipped_ids:
            raw -= 0.25

        score = max(0.0, min(raw, 1.0))
        reason_parts = []
        if mood_hits: reason_parts.append("matches your " + ", ".join(sorted(set(intent["moods"]) & set(track["mood"]))) + " mood")
        if activity_hits: reason_parts.append("fits " + ", ".join(sorted(set(intent["activities"]) & set(track["activity"]))))
        if genre_hits: reason_parts.append("connects with your " + ", ".join(sorted(set(intent["genres"]) & set(track["genre"]))) + " taste")
        if not reason_parts: reason_parts.append("offers a " + track["energy"] + "-energy sound to explore")
        reason = "This track " + " and ".join(reason_parts) + "."

        ranked.append({
            "semantic_id": track["semantic_id"], "title": track["title"], "artist": track["artist"],
            "score": round(score * 100), "mood": ", ".join(track["mood"][:2]),
            "genre": ", ".join(track["genre"][:2]), "energy": track["energy"].title() + " energy",
            "reason": reason, "symbol": track["symbol"], "color": track["color"],
            "_raw": score
        })

    ranked.sort(key=lambda item: item["_raw"], reverse=True)
    for item in ranked:
        item.pop("_raw", None)
    return {"intent": intent, "recommendations": ranked[:limit]}
