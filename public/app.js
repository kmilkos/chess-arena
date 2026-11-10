import { Chess } from "/vendor/chess.js";

// Crisp vector SVG chess pieces (100% local, zero external CDN dependencies)
const PIECE_SVGS = {
  wP: `<svg viewBox="0 0 45 45"><path d="M22.5 9c-2.21 0-4 1.79-4 4 0 .89.29 1.71.78 2.38C17.33 16.5 16 18.59 16 21c0 2.03.94 3.84 2.41 5.03-3 1.06-7.41 5.55-7.41 13.47h23c0-7.92-4.41-12.41-7.41-13.47 1.47-1.19 2.41-3 2.41-5.03 0-2.41-1.33-4.5-3.28-5.62.49-.67.78-1.49.78-2.38 0-2.21-1.79-4-4-4z" fill="#fff" stroke="#1e293b" stroke-width="1.8" stroke-linecap="round"/></svg>`,
  wR: `<svg viewBox="0 0 45 45"><g fill="#fff" stroke="#1e293b" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 39h27v-3H9v3zM12 36v-4h21v4H12zM11 14V9h4v2h5V9h5v2h5V9h4v5"/><path d="M34 14l-3 3H14l-3-3"/><path d="M31 17v12.5H14V17"/><path d="M31 29.5l1.5 2.5h-20l1.5-2.5"/><path d="M11 14h23" fill="none"/></g></svg>`,
  wN: `<svg viewBox="0 0 45 45"><g fill="#fff" stroke="#1e293b" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10c10.5 1 16.5 8 16 29H15c0-9 10-6.5 8-21"/><path d="M24 18c.38 2.91-5.55 7.37-8 9-3 2-2.82 4.34-5 4-1.042-.94 1.41-3.04 0-3-1 0 .19 1.23-1 2-1 0-4.003 1-4-4 0-2 6-12 6-12s1.89-1.9 2-3.5c-.73-.994-.5-2-.5-3 1-1 3 2.5 3 2.5h2s.78-1.992 2.5-3c1 0 1 3 1 3"/><circle cx="15.5" cy="15.5" r="1" fill="#1e293b"/></g></svg>`,
  wB: `<svg viewBox="0 0 45 45"><g fill="#fff" stroke="#1e293b" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 36c3.39-.97 10.11.43 13.5-2 3.39 2.43 10.11 1.03 13.5 2 0 0 1.65.54 3 2-.68.97-1.65.99-3 .5-3.39-.97-10.11.46-13.5-1-3.39 1.46-10.11.03-13.5 1-1.354.49-2.323.47-3-.5 1.354-1.94 3-2 3-2z"/><path d="M15 32c2.5 2.5 12.5 2.5 15 0 .5-1.5 0-2 0-2 0-2.5-2.5-4-2.5-4 5.5-1.5 6-11.5-5-15.5-11 4-10.5 14-5 15.5 0 0-2.5 1.5-2.5 4 0 0-.5.5 0 2z"/><circle cx="22.5" cy="8" r="2.2"/><path d="M17.5 26h10M15 30h15m-7.5-14.5v5M20 18h5" fill="none"/></g></svg>`,
  wQ: `<svg viewBox="0 0 45 45"><g fill="#fff" stroke="#1e293b" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M8 12a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM24.5 7.5a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM41 12a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM16 8.5a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM33 9a2 2 0 1 1-4 0 2 2 0 0 1 4 0z"/><path d="M9 26c8.5-1.5 21-1.5 27 0l2-12-7 11V11l-5.5 13.5-3-15-3 15-5.5-14V25L7 14l2 12z"/><path d="M9 26c0 2 1.5 2 2.5 4 1 1.5 1 1 .5 3.5-1.5 1-1.5 2.5-1.5 2.5-1.5 1.5.5 2.5.5 2.5 6.5 1 16.5 1 23 0 0 0 1.5-1 0-2.5 0 0 .5-1.5-1-2.5-.5-2.5-.5-2 .5-3.5 1-2 2.5-2 2.5-4-8.5-1.5-18.5-1.5-27 0z"/><path d="M11.5 30c3.5-1 18.5-1 22 0M12 33.5c6-1 15-1 21 0" fill="none"/></g></svg>`,
  wK: `<svg viewBox="0 0 45 45"><g fill="#fff" stroke="#1e293b" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M22.5 11.63V6M20 8h5" fill="none"/><path d="M22.5 25s4.5-7.5 3-10.5c0 0-1-2.5-3-2.5s-3 2.5-3 2.5c-1.5 3 3 10.5 3 10.5"/><path d="M11.5 37c5.5 3.5 15.5 3.5 21 0v-7s9-4.5 6-10.5c-4-6.5-13.5-3.5-16 4V27v-3.5c-3.5-7.5-13-10.5-16-4-3 6 5 10 5 10V37z"/><path d="M11.5 30c5.5-3 15.5-3 21 0m-21 3.5c5.5-3 15.5-3 21 0m-21 3.5c5.5-3 15.5-3 21 0" fill="none"/></g></svg>`,
  bP: `<svg viewBox="0 0 45 45"><path d="M22.5 9c-2.21 0-4 1.79-4 4 0 .89.29 1.71.78 2.38C17.33 16.5 16 18.59 16 21c0 2.03.94 3.84 2.41 5.03-3 1.06-7.41 5.55-7.41 13.47h23c0-7.92-4.41-12.41-7.41-13.47 1.47-1.19 2.41-3 2.41-5.03 0-2.41-1.33-4.5-3.28-5.62.49-.67.78-1.49.78-2.38 0-2.21-1.79-4-4-4z" fill="#1e293b" stroke="#f8fafc" stroke-width="1.6" stroke-linecap="round"/></svg>`,
  bR: `<svg viewBox="0 0 45 45"><g fill="#1e293b" stroke="#f8fafc" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M9 39h27v-3H9v3zM12.5 32l1.5-2.5h17l1.5 2.5h-20zM12 36v-4h21v4H12z"/><path d="M14 29.5v-13h17v13H14z"/><path d="M14 16.5L11 14h23l-3 2.5H14zM11 14V9h4v2h5V9h5v2h5V9h4v5H11z"/></g></svg>`,
  bN: `<svg viewBox="0 0 45 45"><g fill="#1e293b" stroke="#f8fafc" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10c10.5 1 16.5 8 16 29H15c0-9 10-6.5 8-21"/><path d="M24 18c.38 2.91-5.55 7.37-8 9-3 2-2.82 4.34-5 4-1.042-.94 1.41-3.04 0-3-1 0 .19 1.23-1 2-1 0-4.003 1-4-4 0-2 6-12 6-12s1.89-1.9 2-3.5c-.73-.994-.5-2-.5-3 1-1 3 2.5 3 2.5h2s.78-1.992 2.5-3c1 0 1 3 1 3"/><circle cx="15.5" cy="15.5" r="1.2" fill="#f8fafc"/></g></svg>`,
  bB: `<svg viewBox="0 0 45 45"><g fill="#1e293b" stroke="#f8fafc" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M9 36c3.39-.97 10.11.43 13.5-2 3.39 2.43 10.11 1.03 13.5 2 0 0 1.65.54 3 2-.68.97-1.65.99-3 .5-3.39-.97-10.11.46-13.5-1-3.39 1.46-10.11.03-13.5 1-1.354.49-2.323.47-3-.5 1.354-1.94 3-2 3-2z"/><path d="M15 32c2.5 2.5 12.5 2.5 15 0 .5-1.5 0-2 0-2 0-2.5-2.5-4-2.5-4 5.5-1.5 6-11.5-5-15.5-11 4-10.5 14-5 15.5 0 0-2.5 1.5-2.5 4 0 0-.5.5 0 2z"/><circle cx="22.5" cy="8" r="2.2"/><path d="M17.5 26h10M15 30h15m-7.5-14.5v5M20 18h5" fill="none"/></g></svg>`,
  bQ: `<svg viewBox="0 0 45 45"><g fill="#1e293b" stroke="#f8fafc" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="6" cy="12" r="2"/><circle cx="14" cy="9" r="2"/><circle cx="22.5" cy="8" r="2"/><circle cx="31" cy="9" r="2"/><circle cx="39" cy="12" r="2"/><path d="M9 26c8.5-1.5 21-1.5 27 0l2.5-12.5L31 25l-.3-14.1-5.2 13.6-3-14.5-3 14.5-5.2-13.6L14 25 6.5 13.5 9 26z"/><path d="M9 26c0 2 1.5 2 2.5 4 1 1.5 1 1 .5 3.5-1.5 1-1.5 2.5-1.5 2.5-1.5 1.5.5 2.5.5 2.5 6.5 1 16.5 1 23 0 0 0 1.5-1 0-2.5 0 0 .5-1.5-1-2.5-.5-2.5-.5-2 .5-3.5 1-2 2.5-2 2.5-4-8.5-1.5-18.5-1.5-27 0z"/><path d="M11.5 30c3.5-1 18.5-1 22 0M12 33.5c6-1 15-1 21 0" fill="none"/></g></svg>`,
  bK: `<svg viewBox="0 0 45 45"><g fill="#1e293b" stroke="#f8fafc" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M22.5 11.63V6M20 8h5" fill="none"/><path d="M22.5 25s4.5-7.5 3-10.5c0 0-1-2.5-3-2.5s-3 2.5-3 2.5c-1.5 3 3 10.5 3 10.5"/><path d="M11.5 37c5.5 3.5 15.5 3.5 21 0v-7s9-4.5 6-10.5c-4-6.5-13.5-3.5-16 4V27v-3.5c-3.5-7.5-13-10.5-16-4-3 6 5 10 5 10V37z"/><path d="M11.5 30c5.5-3 15.5-3 21 0m-21 3.5c5.5-3 15.5-3 21 0m-21 3.5c5.5-3 15.5-3 21 0" fill="none"/></g></svg>`
};

const UNICODE_CAPTURED = {
  w: { p: "♙", n: "♘", b: "♗", r: "♖", q: "♕" },
  b: { p: "♟", n: "♞", b: "♝", r: "♜", q: "♛" }
};

const PIECE_WORTH = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 };

// Application State
const state = {
  chess: new Chess(),
  gameMode: "hvai", // 'hvai' | 'aivai' | 'hvh'
  humanColorPref: "w", // 'w' | 'b' | 'random'
  humanColor: "w",
  flipped: false,
  selectedSquare: null,
  legalMovesFromSelected: [],
  lastMove: null, // { from, to }
  coachHint: null, // { from, to }
  pendingPromotion: null, // { from, to }
  aiThinking: false,
  aiBattlePaused: false,
  soundEnabled: true,
  evalScoreWhite: 0.0,
  models: [],
  selectedModel: "antigravity/gemini-3.8-flash-medium",
  selectedWhiteModel: "groq/qwen/qwen3.8-27b",
  difficulty: "grandmaster",
  clocks: { w: 0, b: 0 },
  clockTimer: null,
  moveHistoryVerbose: []
};

// Safe Toast Helper (guarded per Frontend Symbol Safety rule)
function showToast(message) {
  const container = document.getElementById("toast-container");
  if (!container) return;
  const el = document.createElement("div");
  el.className = "toast";
  el.textContent = message;
  container.appendChild(el);
  setTimeout(() => {
    el.remove();
  }, 2800);
}

// Web Audio API Sound Synthesizer (100% offline, zero external files)
let audioCtx = null;
function playSound(type) {
  if (!state.soundEnabled) return;
  try {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return;
      audioCtx = new AudioContextClass();
    }
    if (audioCtx.state === "suspended") {
      audioCtx.resume();
    }

    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);

    if (type === "move") {
      osc.type = "sine";
      osc.frequency.setValueAtTime(280, now);
      osc.frequency.exponentialRampToValueAtTime(160, now + 0.065);
      gain.gain.setValueAtTime(0.14, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);
      osc.start(now);
      osc.stop(now + 0.075);
    } else if (type === "capture") {
      osc.type = "triangle";
      osc.frequency.setValueAtTime(190, now);
      osc.frequency.exponentialRampToValueAtTime(95, now + 0.09);
      gain.gain.setValueAtTime(0.22, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.095);
      osc.start(now);
      osc.stop(now + 0.1);
    } else if (type === "check") {
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(520, now);
      osc.frequency.setValueAtTime(660, now + 0.07);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
      osc.start(now);
      osc.stop(now + 0.23);
    } else if (type === "gameover") {
      osc.type = "triangle";
      osc.frequency.setValueAtTime(330, now);
      osc.frequency.setValueAtTime(440, now + 0.12);
      osc.frequency.setValueAtTime(554, now + 0.24);
      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
      osc.start(now);
      osc.stop(now + 0.46);
    }
  } catch {
    // Ignore audio context restrictions
  }
}

// Format seconds to MM:SS
function formatClock(sec) {
  const mins = Math.floor(sec / 60);
  const rem = sec % 60;
  return `${String(mins).padStart(2, "0")}:${String(rem).padStart(2, "0")}`;
}

function startClockInterval() {
  if (state.clockTimer) clearInterval(state.clockTimer);
  state.clockTimer = setInterval(() => {
    if (state.chess.isGameOver() || state.aiBattlePaused) return;
    const turn = state.chess.turn();
    state.clocks[turn] += 1;
    updatePlayerBars();
  }, 1000);
}

// Probe Engine Status & Populate Models
async function fetchGatewayStatus() {
  try {
    const res = await fetch("/api/status");
    const data = await res.json();

    if (Array.isArray(data.curatedModels) && data.curatedModels.length > 0 && state.models.length === 0) {
      state.models = data.curatedModels;
      populateModelSelects();
    }
  } catch {
    // Ignore status probe error
  }
}

function populateModelSelects() {
  const primarySelect = document.getElementById("ai-model-select");
  const whiteSelect = document.getElementById("ai-model-white-select");
  if (!primarySelect || !whiteSelect) return;

  primarySelect.innerHTML = "";
  whiteSelect.innerHTML = "";

  for (const m of state.models) {
    const opt1 = document.createElement("option");
    opt1.value = m.id;
    opt1.textContent = `${m.name} — [${m.badge}]`;
    if (m.id === state.selectedModel) opt1.selected = true;
    primarySelect.appendChild(opt1);

    const opt2 = document.createElement("option");
    opt2.value = m.id;
    opt2.textContent = `${m.name} — [${m.badge}]`;
    if (m.id === state.selectedWhiteModel) opt2.selected = true;
    whiteSelect.appendChild(opt2);
  }

  updateModelDescription();
  updatePlayerBars();
}

function updateModelDescription() {
  const descEl = document.getElementById("ai-model-desc");
  const found = state.models.find((m) => m.id === state.selectedModel);
  if (descEl && found) {
    descEl.textContent = found.description;
  }
}

// Compute Material Balance & Captured Pieces
function computeMaterialAndCaptures() {
  const initialCounts = {
    w: { p: 8, n: 2, b: 2, r: 2, q: 1 },
    b: { p: 8, n: 2, b: 2, r: 2, q: 1 }
  };
  const currentCounts = {
    w: { p: 0, n: 0, b: 0, r: 0, q: 0 },
    b: { p: 0, n: 0, b: 0, r: 0, q: 0 }
  };

  let whiteMaterial = 0;
  let blackMaterial = 0;

  for (const row of state.chess.board()) {
    for (const cell of row) {
      if (!cell) continue;
      if (cell.type !== "k") {
        currentCounts[cell.color][cell.type] = (currentCounts[cell.color][cell.type] || 0) + 1;
      }
      if (cell.color === "w") whiteMaterial += PIECE_WORTH[cell.type] || 0;
      else blackMaterial += PIECE_WORTH[cell.type] || 0;
    }
  }

  // Pieces captured BY White are missing Black pieces, and vice versa
  const capturedByWhite = [];
  const capturedByBlack = [];
  const order = ["q", "r", "b", "n", "p"];

  for (const t of order) {
    const missingBlack = Math.max(0, initialCounts.b[t] - currentCounts.b[t]);
    for (let i = 0; i < missingBlack; i++) capturedByWhite.push(UNICODE_CAPTURED.b[t]);

    const missingWhite = Math.max(0, initialCounts.w[t] - currentCounts.w[t]);
    for (let i = 0; i < missingWhite; i++) capturedByBlack.push(UNICODE_CAPTURED.w[t]);
  }

  return {
    capturedByWhite: capturedByWhite.join(""),
    capturedByBlack: capturedByBlack.join(""),
    diffWhite: whiteMaterial - blackMaterial
  };
}

// Update Top & Bottom Player Cards
function updatePlayerBars() {
  const topColor = state.flipped ? "w" : "b";
  const bottomColor = state.flipped ? "b" : "w";
  const turn = state.chess.turn();

  const topBar = document.getElementById("top-player-bar");
  const bottomBar = document.getElementById("bottom-player-bar");
  topBar.classList.toggle("active-turn", turn === topColor && !state.chess.isGameOver());
  bottomBar.classList.toggle("active-turn", turn === bottomColor && !state.chess.isGameOver());

  const getPlayerMeta = (color) => {
    const colorLabel = color === "w" ? "White" : "Black";
    if (state.gameMode === "hvh") {
      return { name: `Player (${colorLabel})`, tag: "Human", avatar: color === "w" ? "♔" : "♚" };
    }
    if (state.gameMode === "aivai") {
      const mId = color === "w" ? state.selectedWhiteModel : state.selectedModel;
      const shortId = mId.split("/").pop();
      return { name: `AI (${colorLabel})`, tag: shortId, avatar: color === "w" ? "🤖" : "⚡" };
    }
    // hvai
    if (color === state.humanColor) {
      return { name: `You (${colorLabel})`, tag: "Human", avatar: color === "w" ? "♔" : "♚" };
    } else {
      const shortId = state.selectedModel.split("/").pop();
      return { name: `Computer AI (${colorLabel})`, tag: shortId, avatar: color === "w" ? "♔" : "♚" };
    }
  };

  const topMeta = getPlayerMeta(topColor);
  const bottomMeta = getPlayerMeta(bottomColor);

  document.getElementById("top-player-avatar").textContent = topMeta.avatar;
  document.getElementById("top-player-name").textContent = topMeta.name;
  document.getElementById("top-player-tag").textContent = topMeta.tag;

  document.getElementById("bottom-player-avatar").textContent = bottomMeta.avatar;
  document.getElementById("bottom-player-name").textContent = bottomMeta.name;
  document.getElementById("bottom-player-tag").textContent = bottomMeta.tag;

  // Clocks
  document.getElementById("top-clock").textContent = formatClock(state.clocks[topColor]);
  document.getElementById("bottom-clock").textContent = formatClock(state.clocks[bottomColor]);

  // Captured & Material advantage
  const mat = computeMaterialAndCaptures();
  const topCaptured = topColor === "w" ? mat.capturedByWhite : mat.capturedByBlack;
  const bottomCaptured = bottomColor === "w" ? mat.capturedByWhite : mat.capturedByBlack;
  const topAdv = topColor === "w" ? mat.diffWhite : -mat.diffWhite;
  const bottomAdv = bottomColor === "w" ? mat.diffWhite : -mat.diffWhite;

  document.getElementById("top-captured").textContent = topCaptured;
  document.getElementById("bottom-captured").textContent = bottomCaptured;

  const topAdvEl = document.getElementById("top-material-adv");
  const bottomAdvEl = document.getElementById("bottom-material-adv");

  if (topAdv > 0) {
    topAdvEl.textContent = `+${topAdv}`;
    topAdvEl.classList.remove("hidden");
  } else {
    topAdvEl.classList.add("hidden");
  }

  if (bottomAdv > 0) {
    bottomAdvEl.textContent = `+${bottomAdv}`;
    bottomAdvEl.classList.remove("hidden");
  } else {
    bottomAdvEl.classList.add("hidden");
  }

  // Status Pill
  const statusPill = document.getElementById("turn-status-pill");
  if (state.chess.isCheckmate()) {
    const winner = turn === "w" ? "Black" : "White";
    statusPill.textContent = `Checkmate · ${winner} wins`;
    statusPill.classList.add("in-check");
  } else if (state.chess.isDraw()) {
    statusPill.textContent = "Draw Game";
    statusPill.classList.remove("in-check");
  } else if (state.chess.inCheck()) {
    statusPill.textContent = `${turn === "w" ? "White" : "Black"} is in Check!`;
    statusPill.classList.add("in-check");
  } else {
    statusPill.textContent = `${turn === "w" ? "White" : "Black"} to move`;
    statusPill.classList.remove("in-check");
  }

  // Thinking spinner
  const thinkingBadge = document.getElementById("top-thinking-badge");
  thinkingBadge.classList.toggle("hidden", !state.aiThinking);
}

// Update Evaluation Bar
function updateEvalBar(scoreWhite) {
  state.evalScoreWhite = scoreWhite;
  const fillEl = document.getElementById("eval-bar-fill");
  const labelEl = document.getElementById("eval-score-label");
  const metricEval = document.getElementById("metric-eval");

  // Clamp centipawn score (-10 to +10) to percentage (5% to 95%)
  const clamped = Math.max(-10, Math.min(10, scoreWhite));
  const whitePercent = 50 + (clamped / 10) * 45;
  fillEl.style.blockSize = `${whitePercent}%`;

  const formatted = `${scoreWhite >= 0 ? "+" : ""}${Number(scoreWhite).toFixed(1)}`;
  labelEl.textContent = formatted;
  if (metricEval) {
    metricEval.textContent = `${scoreWhite >= 0 ? "+" : ""}${Number(scoreWhite).toFixed(2)}`;
  }
}

// Render the 8x8 Chessboard
function renderBoard() {
  const boardEl = document.getElementById("chessboard");
  if (!boardEl) return;
  boardEl.innerHTML = "";

  const boardData = state.chess.board();
  const files = ["a", "b", "c", "d", "e", "f", "g", "h"];
  const ranks = ["8", "7", "6", "5", "4", "3", "2", "1"];

  const rowIndices = state.flipped ? [7, 6, 5, 4, 3, 2, 1, 0] : [0, 1, 2, 3, 4, 5, 6, 7];
  const colIndices = state.flipped ? [7, 6, 5, 4, 3, 2, 1, 0] : [0, 1, 2, 3, 4, 5, 6, 7];

  const inCheck = state.chess.inCheck();
  const turn = state.chess.turn();

  const legalTargetMap = new Map();
  for (const m of state.legalMovesFromSelected) {
    legalTargetMap.set(m.to, m);
  }

  for (let visualRow = 0; visualRow < 8; visualRow++) {
    for (let visualCol = 0; visualCol < 8; visualCol++) {
      const r = rowIndices[visualRow];
      const c = colIndices[visualCol];
      const sqName = `${files[c]}${ranks[r]}`;
      const isLight = (r + c) % 2 === 0;
      const piece = boardData[r][c];

      const sqDiv = document.createElement("div");
      sqDiv.className = `square ${isLight ? "light" : "dark"}`;
      sqDiv.dataset.square = sqName;
      sqDiv.setAttribute("role", "gridcell");
      sqDiv.setAttribute("aria-label", `${sqName}${piece ? ` ${piece.color === "w" ? "White" : "Black"} ${piece.type}` : ""}`);

      if (state.selectedSquare === sqName) {
        sqDiv.classList.add("selected");
      }
      if (state.lastMove?.from === sqName) {
        sqDiv.classList.add("last-from");
      }
      if (state.lastMove?.to === sqName) {
        sqDiv.classList.add("last-to");
      }
      if (state.coachHint?.from === sqName) {
        sqDiv.classList.add("coach-hint-from");
      }
      if (state.coachHint?.to === sqName) {
        sqDiv.classList.add("coach-hint-to");
      }
      if (inCheck && piece && piece.type === "k" && piece.color === turn) {
        sqDiv.classList.add("king-check");
      }

      // Rank & File Coordinate Labels on outer edges
      if (visualCol === 0) {
        const rankSpan = document.createElement("span");
        rankSpan.className = "coord-rank";
        rankSpan.textContent = ranks[r];
        sqDiv.appendChild(rankSpan);
      }
      if (visualRow === 7) {
        const fileSpan = document.createElement("span");
        fileSpan.className = "coord-file";
        fileSpan.textContent = files[c];
        sqDiv.appendChild(fileSpan);
      }

      // Piece SVG
      if (piece) {
        const key = `${piece.color}${piece.type.toUpperCase()}`;
        const wrap = document.createElement("div");
        wrap.className = "piece-svg-wrap";
        wrap.innerHTML = PIECE_SVGS[key] || "";
        wrap.draggable = canHumanMovePiece(piece.color);

        wrap.addEventListener("dragstart", (e) => {
          if (!canHumanMovePiece(piece.color)) {
            e.preventDefault();
            return;
          }
          selectSquare(sqName);
          e.dataTransfer.setData("text/plain", sqName);
        });

        sqDiv.appendChild(wrap);
      }

      // Legal Move Indicator
      if (legalTargetMap.has(sqName)) {
        const moveObj = legalTargetMap.get(sqName);
        const indicator = document.createElement("div");
        indicator.className =
          moveObj.captured || moveObj.flags.includes("e")
            ? "legal-capture-ring"
            : "legal-dot";
        sqDiv.appendChild(indicator);
      }

      // Click & Drag-and-Drop Handlers
      sqDiv.addEventListener("click", () => handleSquareClick(sqName));
      sqDiv.addEventListener("dragover", (e) => {
        e.preventDefault();
        sqDiv.classList.add("drag-over");
      });
      sqDiv.addEventListener("dragleave", () => {
        sqDiv.classList.remove("drag-over");
      });
      sqDiv.addEventListener("drop", (e) => {
        e.preventDefault();
        sqDiv.classList.remove("drag-over");
        const fromSq = e.dataTransfer.getData("text/plain") || state.selectedSquare;
        if (fromSq && fromSq !== sqName) {
          attemptHumanMove(fromSq, sqName);
        }
      });

      boardEl.appendChild(sqDiv);
    }
  }

  // Update FEN input box
  const fenInput = document.getElementById("fen-input");
  if (fenInput) fenInput.value = state.chess.fen();

  updatePlayerBars();
  renderMoveHistory();
}

function canHumanMovePiece(pieceColor) {
  if (state.chess.isGameOver() || state.aiThinking) return false;
  if (state.chess.turn() !== pieceColor) return false;
  if (state.gameMode === "aivai") return false;
  if (state.gameMode === "hvai" && pieceColor !== state.humanColor) return false;
  return true;
}

function selectSquare(sqName) {
  const piece = state.chess.get(sqName);
  if (!piece || !canHumanMovePiece(piece.color)) {
    state.selectedSquare = null;
    state.legalMovesFromSelected = [];
    renderBoard();
    return;
  }
  state.selectedSquare = sqName;
  state.legalMovesFromSelected = state.chess.moves({ square: sqName, verbose: true });
  renderBoard();
}

function handleSquareClick(sqName) {
  if (state.aiThinking || state.chess.isGameOver()) return;

  // Check if clicking a legal destination from currently selected square
  if (state.selectedSquare) {
    const isLegalDest = state.legalMovesFromSelected.some((m) => m.to === sqName);
    if (isLegalDest) {
      attemptHumanMove(state.selectedSquare, sqName);
      return;
    }
  }

  const clickedPiece = state.chess.get(sqName);
  if (clickedPiece && canHumanMovePiece(clickedPiece.color)) {
    if (state.selectedSquare === sqName) {
      state.selectedSquare = null;
      state.legalMovesFromSelected = [];
      renderBoard();
    } else {
      selectSquare(sqName);
    }
  } else {
    state.selectedSquare = null;
    state.legalMovesFromSelected = [];
    renderBoard();
  }
}

function attemptHumanMove(from, to) {
  const matchingMoves = state.chess
    .moves({ square: from, verbose: true })
    .filter((m) => m.to === to);

  if (matchingMoves.length === 0) return;

  // Check if this is a pawn promotion
  const isPromotion = matchingMoves.some((m) => Boolean(m.promotion));
  if (isPromotion) {
    state.pendingPromotion = { from, to };
    openPromotionDialog(state.chess.turn());
    return;
  }

  executeMove({ from, to });
}

function openPromotionDialog(color) {
  const dialog = document.getElementById("promotion-dialog");
  if (!dialog) return;
  const icons = color === "w"
    ? { q: "♕", r: "♖", b: "♗", n: "♘" }
    : { q: "♛", r: "♜", b: "♝", n: "♞" };

  document.getElementById("promo-q").textContent = icons.q;
  document.getElementById("promo-r").textContent = icons.r;
  document.getElementById("promo-b").textContent = icons.b;
  document.getElementById("promo-n").textContent = icons.n;

  dialog.showModal();
}

function executeMove(moveSpec) {
  try {
    const moveResult = state.chess.move(moveSpec);
    if (!moveResult) return false;

    state.selectedSquare = null;
    state.legalMovesFromSelected = [];
    state.lastMove = { from: moveResult.from, to: moveResult.to };
    state.coachHint = null;
    state.moveHistoryVerbose.push(moveResult);

    if (state.chess.isGameOver()) {
      playSound("gameover");
    } else if (state.chess.inCheck()) {
      playSound("check");
    } else if (moveResult.captured) {
      playSound("capture");
    } else {
      playSound("move");
    }

    renderBoard();

    if (state.chess.isGameOver()) {
      showGameOverDialog();
      return true;
    }

    // Trigger AI move if next turn belongs to the computer player
    scheduleAiTurnIfNeeded();
    return true;
  } catch {
    return false;
  }
}

function renderMoveHistory() {
  const tbody = document.getElementById("move-history-body");
  const counterBadge = document.getElementById("move-counter-badge");
  const scrollContainer = document.getElementById("move-history-scroll");
  if (!tbody) return;

  const history = state.chess.history();
  const fullMoveNum = Math.floor(history.length / 2) + 1;
  if (counterBadge) counterBadge.textContent = `Move ${fullMoveNum}`;

  if (history.length === 0) {
    tbody.innerHTML = `<tr class="empty-row"><td colspan="3">No moves played yet.</td></tr>`;
    return;
  }

  tbody.innerHTML = "";
  for (let i = 0; i < history.length; i += 2) {
    const tr = document.createElement("tr");
    const moveNumber = Math.floor(i / 2) + 1;
    const whiteSan = history[i] || "";
    const blackSan = history[i + 1] || "";

    tr.innerHTML = `
      <td>${moveNumber}.</td>
      <td>${whiteSan}</td>
      <td>${blackSan}</td>
    `;
    tbody.appendChild(tr);
  }

  if (scrollContainer) {
    scrollContainer.scrollTop = scrollContainer.scrollHeight;
  }
}

// Append Reasoning Entry to AI Thought Log
function appendThoughtEntry({ model, badge, plan, thought, latencyMs, isCoach = false }) {
  const logEl = document.getElementById("thought-log");
  if (!logEl) return;

  const welcome = logEl.querySelector(".thought-welcome");
  if (welcome) welcome.remove();

  const entry = document.createElement("div");
  entry.className = `thought-entry${isCoach ? " coach-entry" : ""}`;

  const meta = document.createElement("div");
  meta.className = "thought-meta";

  const badgeSpan = document.createElement("span");
  badgeSpan.className = "thought-badge";
  badgeSpan.textContent = `${badge || model}`;

  const timeSpan = document.createElement("span");
  timeSpan.textContent = latencyMs ? `${latencyMs}ms` : "Live";

  meta.appendChild(badgeSpan);
  meta.appendChild(timeSpan);
  entry.appendChild(meta);

  if (plan) {
    const planEl = document.createElement("div");
    planEl.className = "thought-plan";
    planEl.textContent = `Plan: ${plan}`;
    entry.appendChild(planEl);
  }

  const textEl = document.createElement("p");
  textEl.className = "thought-text";
  textEl.textContent = thought;
  entry.appendChild(textEl);

  logEl.prepend(entry);
}

// Render Candidate Moves Evaluated
function renderCandidates(candidates, chosenSan) {
  const listEl = document.getElementById("candidates-list");
  if (!listEl || !Array.isArray(candidates)) return;

  listEl.innerHTML = "";
  for (const c of candidates) {
    const pill = document.createElement("div");
    pill.className = `candidate-pill${c.san === chosenSan ? " chosen" : ""}`;
    const evalStr = `${c.scoreWhite >= 0 ? "+" : ""}${Number(c.scoreWhite).toFixed(2)}`;
    pill.innerHTML = `<strong>${c.san}</strong> <span class="candidate-eval">${evalStr}</span>`;
    listEl.appendChild(pill);
  }
}

// Check if Computer AI should play the current turn
function shouldAiPlayTurn() {
  if (state.chess.isGameOver() || state.aiThinking) return false;
  const turn = state.chess.turn();
  if (state.gameMode === "aivai") {
    return !state.aiBattlePaused;
  }
  if (state.gameMode === "hvai") {
    return turn !== state.humanColor;
  }
  return false;
}

function scheduleAiTurnIfNeeded() {
  if (!shouldAiPlayTurn()) return;
  setTimeout(() => {
    if (shouldAiPlayTurn()) {
      requestComputerMove();
    }
  }, 260);
}

// Call Backend /api/ai-move (Computer Player)
async function requestComputerMove(forceManualTrigger = false) {
  if (state.aiThinking || state.chess.isGameOver()) return;
  if (!forceManualTrigger && !shouldAiPlayTurn()) return;

  state.aiThinking = true;
  updatePlayerBars();

  const turn = state.chess.turn();
  const modelToUse =
    state.gameMode === "aivai" && turn === "w"
      ? state.selectedWhiteModel
      : state.selectedModel;

  const latencyBadge = document.getElementById("last-move-latency");
  if (latencyBadge) latencyBadge.textContent = "Player is thinking…";

  try {
    const res = await fetch("/api/ai-move", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fen: state.chess.fen(),
        history: state.chess.history(),
        model: modelToUse,
        difficulty: state.difficulty
      })
    });

    const data = await res.json();
    state.aiThinking = false;

    if (!res.ok || !data.move) {
      showToast(data.error || "AI failed to return a move.");
      updatePlayerBars();
      return;
    }

    // Update Telemetry UI
    const actualModelShort = (data.telemetry?.actualModel || modelToUse).split("/").pop();
    document.getElementById("metric-model").textContent = actualModelShort;
    if (data.telemetry?.tokens?.total) {
      document.getElementById("metric-tokens").textContent = `${data.telemetry.tokens.total} tok`;
    }
    if (latencyBadge) {
      latencyBadge.textContent = `${data.telemetry?.latencyMs || 0}ms`;
    }

    if (typeof data.evalScore === "number") {
      updateEvalBar(data.evalScore);
    }

    renderCandidates(data.topCandidates || [], data.move.san);

    appendThoughtEntry({
      model: actualModelShort,
      badge: `${turn === "w" ? "♔" : "♚"} ${ data.move.san} · ${actualModelShort}`,
      plan: data.plan,
      thought: data.thought,
      latencyMs: data.telemetry?.latencyMs
    });

    executeMove({
      from: data.move.from,
      to: data.move.to,
      promotion: data.move.promotion || "q"
    });
  } catch (err) {
    state.aiThinking = false;
    updatePlayerBars();
    showToast(`Engine error: ${err.message}`);
  }
}

// Ask Grandmaster Coach for Hint
async function requestCoachHint() {
  if (state.aiThinking || state.chess.isGameOver()) return;

  const btn = document.getElementById("coach-hint-btn");
  if (btn) btn.disabled = true;
  showToast("Asking AI Coach for tactical advice…");

  try {
    const res = await fetch("/api/ai-hint", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fen: state.chess.fen(),
        history: state.chess.history(),
        model: state.selectedModel
      })
    });

    const data = await res.json();
    if (btn) btn.disabled = false;

    if (!res.ok) {
      showToast(data.error || "Could not get coach hint.");
      return;
    }

    state.coachHint = { from: data.from, to: data.to };
    renderBoard();

    if (Array.isArray(data.candidates)) {
      renderCandidates(data.candidates, data.bestMove);
    }

    appendThoughtEntry({
      model: data.telemetry?.actualModel || state.selectedModel,
      badge: `💡 Coach Suggests: ${data.bestMove}`,
      plan: data.headline,
      thought: data.explanation,
      latencyMs: data.telemetry?.latencyMs,
      isCoach: true
    });
  } catch (err) {
    if (btn) btn.disabled = false;
    showToast(`Coach error: ${err.message}`);
  }
}

// Show Game Over Modal
function showGameOverDialog() {
  const dialog = document.getElementById("gameover-dialog");
  if (!dialog) return;

  const titleEl = document.getElementById("gameover-title");
  const subEl = document.getElementById("gameover-subtitle");
  const iconEl = document.getElementById("gameover-icon");
  const statsEl = document.getElementById("gameover-stats");

  const turn = state.chess.turn();
  if (state.chess.isCheckmate()) {
    const winner = turn === "w" ? "Black" : "White";
    iconEl.textContent = "🏆";
    titleEl.textContent = "Checkmate!";
    subEl.textContent = `${winner} wins the match.`;
  } else if (state.chess.isStalemate()) {
    iconEl.textContent = "🤝";
    titleEl.textContent = "Stalemate";
    subEl.textContent = "The game is drawn by stalemate.";
  } else if (state.chess.isThreefoldRepetition()) {
    iconEl.textContent = "🔄";
    titleEl.textContent = "Draw by Repetition";
    subEl.textContent = "Threefold repetition reached.";
  } else if (state.chess.isInsufficientMaterial()) {
    iconEl.textContent = "⚖️";
    titleEl.textContent = "Draw";
    subEl.textContent = "Insufficient material to checkmate.";
  } else {
    iconEl.textContent = "🤝";
    titleEl.textContent = "Draw Game";
    subEl.textContent = "50-move rule or drawn position.";
  }

  const totalHalfMoves = state.chess.history().length;
  statsEl.innerHTML = `
    <div><strong>Total Plies:</strong> ${totalHalfMoves}</div>
    <div><strong>Final Eval:</strong> ${state.evalScoreWhite >= 0 ? "+" : ""}${state.evalScoreWhite.toFixed(1)}</div>
    <div><strong>White Time:</strong> ${formatClock(state.clocks.w)}</div>
    <div><strong>Black Time:</strong> ${formatClock(state.clocks.b)}</div>
  `;

  dialog.showModal();
}

// Start or Reset Match
function startNewMatch(customFen = null) {
  if (customFen) {
    state.chess.load(customFen);
  } else {
    state.chess.reset();
  }

  state.selectedSquare = null;
  state.legalMovesFromSelected = [];
  state.lastMove = null;
  state.coachHint = null;
  state.pendingPromotion = null;
  state.aiThinking = false;
  state.aiBattlePaused = false;
  state.moveHistoryVerbose = [];
  state.clocks = { w: 0, b: 0 };

  // Resolve player color
  if (state.humanColorPref === "random") {
    state.humanColor = Math.random() < 0.5 ? "w" : "b";
  } else {
    state.humanColor = state.humanColorPref;
  }

  // Flip board automatically if playing Black in Human vs AI
  if (state.gameMode === "hvai") {
    state.flipped = state.humanColor === "b";
  } else if (!customFen) {
    state.flipped = false;
  }

  updateEvalBar(0.0);
  renderBoard();
  startClockInterval();
  scheduleAiTurnIfNeeded();
}

// Wire Up UI Event Listeners
function initEventListeners() {
  const setupDialog = document.getElementById("setup-dialog");
  const modeSelect = document.getElementById("game-mode-select");
  const modeBadge = document.getElementById("game-mode-badge");
  const colorGroup = document.getElementById("player-color-group");
  const secondaryAiGroup = document.getElementById("secondary-ai-group");
  const primaryAiLabel = document.getElementById("primary-ai-label");
  const pauseBtn = document.getElementById("ai-pause-btn");

  function syncSetupModalVisibility(mode) {
    if (mode === "hvai") {
      modeBadge.textContent = "Human vs AI";
      colorGroup.classList.remove("hidden");
      secondaryAiGroup.classList.add("hidden");
      primaryAiLabel.textContent = "Computer AI Model";
      pauseBtn.classList.add("hidden");
    } else if (mode === "aivai") {
      modeBadge.textContent = "AI vs AI Arena";
      colorGroup.classList.add("hidden");
      secondaryAiGroup.classList.remove("hidden");
      primaryAiLabel.textContent = "Black AI Model";
      pauseBtn.classList.remove("hidden");
    } else {
      modeBadge.textContent = "Pass & Play";
      colorGroup.classList.add("hidden");
      secondaryAiGroup.classList.add("hidden");
      primaryAiLabel.textContent = "AI Coach Model";
      pauseBtn.classList.add("hidden");
    }
  }

  modeSelect.addEventListener("change", (e) => {
    state.gameMode = e.target.value;
    syncSetupModalVisibility(state.gameMode);
  });

  // Color Segmented Buttons
  document.querySelectorAll(".seg-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".seg-btn").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      state.humanColorPref = btn.dataset.color;
    });
  });

  // Model & Difficulty Selects
  document.getElementById("ai-model-select").addEventListener("change", (e) => {
    state.selectedModel = e.target.value;
    document.getElementById("metric-model").textContent = state.selectedModel.split("/").pop();
    updateModelDescription();
    updatePlayerBars();
  });

  document.getElementById("ai-model-white-select").addEventListener("change", (e) => {
    state.selectedWhiteModel = e.target.value;
    updatePlayerBars();
  });

  document.getElementById("difficulty-select").addEventListener("change", (e) => {
    state.difficulty = e.target.value;
  });

  // Board Theme Select
  document.getElementById("board-theme-select").addEventListener("change", (e) => {
    document.getElementById("board-frame").dataset.theme = e.target.value;
  });

  // Sound Toggle
  document.getElementById("sound-toggle-btn").addEventListener("click", () => {
    state.soundEnabled = !state.soundEnabled;
    document.getElementById("sound-icon").textContent = state.soundEnabled ? "🔊" : "🔇";
    showToast(state.soundEnabled ? "Sound effects enabled" : "Sound effects muted");
  });

  // Open Setup Modal when clicking New Game
  document.getElementById("new-game-top-btn").addEventListener("click", () => {
    syncSetupModalVisibility(state.gameMode);
    setupDialog.showModal();
  });

  // Confirm & Start New Game from Setup Modal
  document.getElementById("start-match-btn").addEventListener("click", () => {
    setupDialog.close();
    startNewMatch();
  });

  // Play Again from Game Over Modal opens the Setup Modal
  document.getElementById("gameover-rematch-btn").addEventListener("click", () => {
    document.getElementById("gameover-dialog").close();
    syncSetupModalVisibility(state.gameMode);
    setupDialog.showModal();
  });

  // Pause / Resume AI vs AI
  pauseBtn.addEventListener("click", () => {
    state.aiBattlePaused = !state.aiBattlePaused;
    pauseBtn.textContent = state.aiBattlePaused ? "▶ Resume AI Battle" : "⏸ Pause AI Battle";
    if (!state.aiBattlePaused) {
      scheduleAiTurnIfNeeded();
    }
  });

  // Tactical Controls
  document.getElementById("coach-hint-btn").addEventListener("click", () => requestCoachHint());

  document.getElementById("flip-board-btn").addEventListener("click", () => {
    state.flipped = !state.flipped;
    renderBoard();
  });

  document.getElementById("force-ai-move-btn").addEventListener("click", () => {
    requestComputerMove(true);
  });

  document.getElementById("undo-move-btn").addEventListener("click", () => {
    if (state.aiThinking) return;
    const historyLen = state.chess.history().length;
    if (historyLen === 0) return;

    // In Human vs AI, undo both the AI reply and the human's move so it's human's turn again
    if (state.gameMode === "hvai" && state.chess.turn() === state.humanColor && historyLen >= 2) {
      state.chess.undo();
      state.chess.undo();
    } else {
      state.chess.undo();
    }
    state.lastMove = null;
    state.coachHint = null;
    state.selectedSquare = null;
    state.legalMovesFromSelected = [];
    renderBoard();
    showToast("Move taken back");
  });

  // Promotion Dialog Choices
  document.querySelectorAll("#promotion-choices .promo-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const piece = btn.dataset.piece || "q";
      const dialog = document.getElementById("promotion-dialog");
      dialog.close();
      if (state.pendingPromotion) {
        const { from, to } = state.pendingPromotion;
        state.pendingPromotion = null;
        executeMove({ from, to, promotion: piece });
      }
    });
  });

  // Copy FEN & PGN
  document.getElementById("copy-fen-btn").addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(state.chess.fen());
      showToast("FEN copied to clipboard");
    } catch {
      showToast("Failed to copy FEN");
    }
  });

  document.getElementById("copy-pgn-btn").addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(state.chess.pgn() || "No moves played.");
      showToast("PGN copied to clipboard");
    } catch {
      showToast("Failed to copy PGN");
    }
  });

  // Load Custom FEN Dialog
  const fenDialog = document.getElementById("fen-dialog");
  const customFenInput = document.getElementById("custom-fen-input");
  const fenErrorMsg = document.getElementById("fen-error-msg");

  document.getElementById("open-fen-modal-btn").addEventListener("click", () => {
    customFenInput.value = state.chess.fen();
    fenErrorMsg.classList.add("hidden");
    fenDialog.showModal();
  });

  document.getElementById("apply-fen-btn").addEventListener("click", () => {
    const candidateFen = customFenInput.value.trim();
    try {
      const temp = new Chess(candidateFen);
      if (temp) {
        fenDialog.close();
        startNewMatch(candidateFen);
        showToast("Custom FEN position loaded");
      }
    } catch {
      fenErrorMsg.classList.remove("hidden");
    }
  });
}

// Initialize App
initEventListeners();
renderBoard();
startClockInterval();
fetchGatewayStatus();
setInterval(fetchGatewayStatus, 15000);
