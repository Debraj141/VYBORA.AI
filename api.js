/*
 * VYBORA AI frontend API client.
 * Expected backend: Python Flask at http://127.0.0.1:5000
 * Change API_BASE if your backend runs on another host/port.
 */
const API_BASE = "http://127.0.0.1:5000";

async function getRecommendations(query, mode = "familiar") {
  const response = await fetch(`${API_BASE}/api/recommend`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, mode, user_id: "demo_user" })
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`API error ${response.status}: ${message || response.statusText}`);
  }

  const data = await response.json();
  if (!Array.isArray(data.recommendations)) {
    throw new Error("Invalid API response: expected a recommendations array.");
  }
  return data;
}

async function sendFeedback(semanticId, action) {
  const response = await fetch(`${API_BASE}/api/feedback`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      user_id: "demo_user",
      semantic_id: semanticId,
      action
    })
  });

  if (!response.ok) {
    throw new Error(`Feedback API error: ${response.status}`);
  }
  return response.json().catch(() => ({}));
}
