import { Chess } from "/vendor/chess.js";
import {
  loadVisualSettings,
  saveVisualSettings,
  getPieceSetById,
  getPieceSvg,
  playThemedSound
} from "/piece-sets.js";

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
  visualSettings: loadVisualSettings(),
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

function playSound(type) {
  if (!state.soundEnabled) return;
  playThemedSound(type, state.visualSettings);
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

  const activeSet = getPieceSetById(state.visualSettings.pieceSetId);
  const factions = state.visualSettings.swapFactions
    ? { w: activeSet.blackFaction, b: activeSet.whiteFaction }
    : { w: activeSet.whiteFaction, b: activeSet.blackFaction };

  const getPlayerMeta = (color) => {
    const faction = factions[color];
    const colorLabel = color === "w" ? "White" : "Black";
    if (state.gameMode === "hvh") {
      return { name: `${faction.name} (${colorLabel})`, tag: "Human", avatar: faction.avatar };
    }
    if (state.gameMode === "aivai") {
      const mId = color === "w" ? state.selectedWhiteModel : state.selectedModel;
      const shortId = mId.split("/").pop();
      return { name: `${faction.name} (${colorLabel})`, tag: shortId, avatar: faction.avatar };
    }
    // hvai
    if (color === state.humanColor) {
      return { name: `You · ${faction.name}`, tag: "Human", avatar: faction.avatar };
    } else {
      const shortId = state.selectedModel.split("/").pop();
      return { name: `AI · ${faction.name}`, tag: shortId, avatar: faction.avatar };
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

  // Header Piece Set Pill
  const setPill = document.getElementById("current-piece-set-pill");
  if (setPill) {
    setPill.textContent = `Set: ${activeSet.name}`;
  }

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

      // Piece SVG & Styling
      if (piece) {
        const key = `${piece.color}${piece.type.toUpperCase()}`;
        const wrap = document.createElement("div");
        wrap.className = `piece-svg-wrap glow-${state.visualSettings.glowStyle || "crisp"}`;
        wrap.style.inlineSize = `${state.visualSettings.pieceScale || 92}%`;
        wrap.style.blockSize = `${state.visualSettings.pieceScale || 92}%`;
        wrap.innerHTML = getPieceSvg(key, state.visualSettings);
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

        if (state.visualSettings.showRoleBadges) {
          const badge = document.createElement("span");
          badge.className = `piece-role-subbadge side-${piece.color}`;
          badge.textContent = piece.type.toUpperCase();
          sqDiv.appendChild(badge);
        }
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

  const roles = ["q", "r", "b", "n"];
  for (const r of roles) {
    const el = document.getElementById(`promo-${r}`);
    if (el) {
      el.innerHTML = getPieceSvg(`${color}${r.toUpperCase()}`, state.visualSettings);
      el.style.inlineSize = "40px";
      el.style.blockSize = "40px";
      el.style.display = "inline-flex";
      el.style.alignItems = "center";
      el.style.justifyContent = "center";
    }
  }

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
  const boardFrame = document.getElementById("board-frame");
  const themeSelect = document.getElementById("board-theme-select");
  if (state.visualSettings.boardTheme) {
    if (boardFrame) boardFrame.dataset.theme = state.visualSettings.boardTheme;
    if (themeSelect) themeSelect.value = state.visualSettings.boardTheme;
  }

  themeSelect?.addEventListener("change", (e) => {
    state.visualSettings.boardTheme = e.target.value;
    saveVisualSettings(state.visualSettings);
    if (boardFrame) boardFrame.dataset.theme = e.target.value;
  });

  // Re-sync visual settings if returning from settings page
  window.addEventListener("focus", () => {
    state.visualSettings = loadVisualSettings();
    if (boardFrame && state.visualSettings.boardTheme) {
      boardFrame.dataset.theme = state.visualSettings.boardTheme;
      if (themeSelect) themeSelect.value = state.visualSettings.boardTheme;
    }
    renderBoard();
    updatePlayerBars();
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
