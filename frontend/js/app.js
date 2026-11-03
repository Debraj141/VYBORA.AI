const form = document.getElementById("search-form");
const promptInput = document.getElementById("mood-prompt");
const discoverBtn = document.getElementById("discover-btn");
const trackGrid = document.getElementById("track-grid");
const emptyState = document.getElementById("empty-state");
const resultsMeta = document.getElementById("results-meta");
const resultSummary = document.getElementById("result-summary");
const resultCount = document.getElementById("result-count");
const demoNote = document.getElementById("demo-note");
const toast = document.getElementById("toast");
const modeButtons = [...document.querySelectorAll(".mode-btn")];

let currentMode = "familiar";
let currentQuery = "";
let toastTimer;

const demoTracks = [
  { semantic_id: "MFD_001", title: "Weightless", artist: "Marconi Union", score: 96, mood: "Calm", genre: "Ambient", energy: "Low energy", reason: "Its spacious ambient textures create a calm, low-distraction atmosphere.", color: "blue", symbol: "◌" },
  { semantic_id: "MFD_014", title: "The Night We Met", artist: "Lord Huron", score: 93, mood: "Nostalgic", genre: "Indie folk", energy: "Soft", reason: "Gentle vocals and reflective instrumentation fit a nostalgic late-night mood.", color: "purple", symbol: "☾" },
  { semantic_id: "MFD_027", title: "A Walk", artist: "Tycho", score: 90, mood: "Dreamy", genre: "Downtempo", energy: "Steady", reason: "Warm electronic layers offer movement without pulling too much attention.", color: "", symbol: "✧" }
];

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2300);
}

function setLoading(isLoading) {
  discoverBtn.disabled = isLoading;
  discoverBtn.querySelector("span:first-child").textContent = isLoading ? "Finding your sound..." : "Discover";
  discoverBtn.querySelector(".arrow").textContent = isLoading ? "◌" : "↗";
}

function safeText(value, fallback = "") {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function renderTracks(recommendations, isDemo = false) {
  trackGrid.innerHTML = "";
  emptyState.classList.add("hidden");
  resultsMeta.classList.remove("hidden");
  demoNote.classList.toggle("hidden", !isDemo);
  resultSummary.textContent = `For: “${currentQuery}”`;
  resultCount.textContent = `${recommendations.length} tracks`;

  if (!recommendations.length) {
    emptyState.classList.remove("hidden");
    emptyState.querySelector("h3").textContent = "No tracks found yet.";
    emptyState.querySelector("p").textContent = "Try describing your mood in a different way.";
    resultsMeta.classList.add("hidden");
    return;
  }

  recommendations.forEach((track, index) => {
    const id = safeText(track.semantic_id, `UNKNOWN_${index + 1}`);
    const title = safeText(track.title, "Untitled track");
    const artist = safeText(track.artist, "Unknown artist");
    const score = Number.isFinite(Number(track.score)) ? Math.round(Number(track.score)) : null;
    const tags = [track.mood, track.genre, track.energy].filter(v => typeof v === "string" && v.trim());
    const card = document.createElement("article");
    card.className = "track-card";
    card.style.animationDelay = `${index * 70}ms`;

    const top = document.createElement("div");
    top.className = "track-top";
    const art = document.createElement("div");
    art.className = `album-art ${["purple", "blue", "orange"].includes(track.color) ? track.color : ""}`;
    art.textContent = safeText(track.symbol, "♫");
    const match = document.createElement("span");
    match.className = "match";
    match.textContent = score === null ? "AI MATCH" : `${score}% MATCH`;
    top.append(art, match);

    const heading = document.createElement("h3");
    heading.textContent = title;
    const artistEl = document.createElement("div");
    artistEl.className = "artist";
    artistEl.textContent = artist;

    const tagWrap = document.createElement("div");
    tagWrap.className = "tags";
    tags.forEach(tag => {
      const el = document.createElement("span");
      el.className = "tag";
      el.textContent = tag;
      tagWrap.appendChild(el);
    });

    const reason = document.createElement("p");
    reason.className = "reason";
    reason.textContent = safeText(track.reason, "Selected because its musical profile aligns with your request.");

    const semantic = document.createElement("div");
    semantic.className = "semantic-id";
    semantic.textContent = `SEMANTIC ID · ${id}`;

    const actions = document.createElement("div");
    actions.className = "card-actions";
    const save = document.createElement("button");
    save.className = "card-action";
    save.type = "button";
    save.textContent = "♡ Save";
    save.addEventListener("click", () => handleFeedback(id, "save", save));
    const skip = document.createElement("button");
    skip.className = "card-action";
    skip.type = "button";
    skip.textContent = "Skip ↗";
    skip.addEventListener("click", () => handleFeedback(id, "skip", skip));
    actions.append(save, skip);

    card.append(top, heading, artistEl, tagWrap, reason, semantic, actions);
    trackGrid.appendChild(card);
  });
}

async function handleFeedback(semanticId, action, button) {
  button.classList.add("selected");
  if (action === "save") button.textContent = "♥ Saved";
  else button.textContent = "Skipped";
  try {
    await sendFeedback(semanticId, action);
    showToast(action === "save" ? "Saved to your taste profile." : "Feedback added. We'll learn from it.");
  } catch {
    // The UI remains usable during frontend-only development.
    showToast(action === "save" ? "Saved in this preview session." : "Skip noted in this preview session.");
  }
}

async function runSearch() {
  const query = promptInput.value.trim();
  if (!query) {
    promptInput.focus();
    showToast("Tell us what kind of music you're in the mood for.");
    return;
  }
  currentQuery = query;
  setLoading(true);
  try {
    const data = await getRecommendations(query, currentMode);
    renderTracks(data.recommendations, false);
  } catch (error) {
    console.warn("VYBORA backend unavailable:", error);
    // Clearly labelled sample data keeps the frontend demonstrable before backend integration.
    const samples = currentMode === "discover"
      ? [
          { ...demoTracks[2], title: "Open Eye Signal", artist: "Jon Hopkins", score: 92, mood: "Immersive", genre: "Electronic", energy: "Builds gradually", reason: "A less-obvious electronic direction that preserves the atmospheric feel of your request.", color: "purple", semantic_id: "MFD_042" },
          { ...demoTracks[0], title: "Says", artist: "Nils Frahm", score: 89, mood: "Reflective", genre: "Neo-classical", energy: "Gradual build", reason: "A fresh instrumental route with a patient, cinematic progression.", semantic_id: "MFD_051" },
          { ...demoTracks[1], title: "Retrograde", artist: "James Blake", score: 87, mood: "Introspective", genre: "Alternative", energy: "Moderate", reason: "A distinctive vocal and electronic blend that stays close to the requested mood.", semantic_id: "MFD_063" }
        ]
      : demoTracks;
    renderTracks(samples, true);
  } finally {
    setLoading(false);
  }
}

form.addEventListener("submit", event => {
  event.preventDefault();
  runSearch();
});

document.querySelectorAll(".prompt-chip").forEach(chip => {
  chip.addEventListener("click", () => {
    promptInput.value = chip.dataset.prompt || "";
    promptInput.focus();
  });
});

modeButtons.forEach(button => {
  button.addEventListener("click", () => {
    if (currentMode === button.dataset.mode) return;
    currentMode = button.dataset.mode;
    modeButtons.forEach(item => item.classList.toggle("active", item === button));
    if (currentQuery) runSearch();
    else showToast(currentMode === "familiar" ? "Familiar mode selected." : "Explore mode selected.");
  });
});

// Ctrl/Cmd + Enter submits the prompt from the textarea.
promptInput.addEventListener("keydown", event => {
  if ((event.ctrlKey || event.metaKey) && event.key === "Enter") runSearch();
});
