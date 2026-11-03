# VYBORA — Hackathon prototype

## Project structure
- `frontend/` — HTML, CSS and JavaScript UI
- `backend/` — Flask API, sample music catalogue, intent extraction and baseline recommender

## Run the backend (Windows)
Open a terminal in the `backend` folder:

```bash
py -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
py app.py
```

The API runs at `http://127.0.0.1:5000`.

Check it at `http://127.0.0.1:5000/api/health`.

## Run the frontend
Open `frontend/index.html` with VS Code Live Server. Keep the Flask terminal running.

The frontend API client is configured for `http://127.0.0.1:5000`.

## API contract
- `POST /api/recommend` — JSON: `{"query":"calm music for studying","mode":"familiar","user_id":"demo_user"}`
- `POST /api/feedback` — JSON: `{"user_id":"demo_user","semantic_id":"VYB_001","action":"save"}`
- `GET /api/health`
- `GET /api/catalog`
- `GET /api/preferences/demo_user`

## Important prototype notes
- The catalogue is a small demonstration dataset, not a live Spotify catalogue.
- The recommender is a transparent metadata-scoring baseline, not an LLM or trained model.
- Scores are heuristic match scores, not measured probabilities.
- For the judging demo, define a fixed prompt set and compare Precision@5 against a popularity baseline. Report actual measured results; do not present the heuristic score as evaluation accuracy.
