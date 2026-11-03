"""Lightweight, explainable intent extraction for the VYBORA demo."""
MOOD_TERMS = {
    "calm": ["calm", "peaceful", "relax", "relaxing", "quiet", "chill", "soft"],
    "dreamy": ["dreamy", "dream", "floaty", "atmospheric"],
    "nostalgic": ["nostalgic", "memories", "throwback", "reminisce"],
    "emotional": ["emotional", "sad", "lonely", "heartbroken", "melancholic"],
    "energetic": ["energetic", "energy", "hype", "pump", "motivated", "intense"],
    "focused": ["focus", "focused", "concentrate", "productive"],
    "uplifting": ["uplifting", "happy", "positive", "hopeful"],
    "reflective": ["reflective", "thoughtful", "introspective"],
}
ACTIVITY_TERMS = {
    "study": ["study", "studying", "reading", "assignment", "exam"],
    "focus": ["focus", "work", "working", "concentrate", "coding"],
    "late night": ["midnight", "late night", "night", "lonely night"],
    "drive": ["drive", "driving", "road trip", "car"],
    "workout": ["gym", "workout", "training", "running", "exercise"],
    "relax": ["relax", "unwind", "rest", "sleep"],
    "reflect": ["reflect", "thinking", "alone", "memories"],
    "hangout": ["friends", "hangout", "hanging out"],
}
GENRE_TERMS = ["ambient", "indie", "folk", "electronic", "acoustic", "techno", "house", "synth-pop", "classical", "rock", "jazz", "hip-hop"]
ENERGY_TERMS = {
    "low": ["low energy", "slow", "soft", "gentle", "peaceful", "calm", "not too intense"],
    "medium": ["medium energy", "steady", "moderate", "balanced"],
    "high": ["high energy", "energetic", "hype", "intense", "fast", "powerful"],
}

def extract_intent(query: str) -> dict:
    text = query.lower()
    moods = [mood for mood, words in MOOD_TERMS.items() if any(word in text for word in words)]
    activities = [activity for activity, words in ACTIVITY_TERMS.items() if any(word in text for word in words)]
    genres = [genre for genre in GENRE_TERMS if genre in text]
    energy = next((level for level, words in ENERGY_TERMS.items() if any(word in text for word in words)), "medium")
    return {"moods": moods, "activities": activities, "genres": genres, "energy": energy}
