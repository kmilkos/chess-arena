import {
  PIECE_SETS,
  DEFAULT_VISUAL_SETTINGS,
  loadVisualSettings,
  saveVisualSettings,
  getPieceSetById,
  getPieceSvg,
  playThemedSound
} from "/piece-sets.js";

const DEMO_SCENARIOS = {
  midgame: [
    ["bR", "bN", null, "bK"],
    ["bP", null, "bB", "bQ"],
    ["wP", "wB", "wN", null],
    ["wR", "wQ", null, "wK"]
  ],
  royals: [
    [null, "bQ", "bK", null],
    ["bR", "bB", "bN", "bP"],
    ["wP", "wN", "wB", "wR"],
    [null, "wQ", "wK", null]
  ],
  vanguard: [
    ["bN", "bP", "bP", "bR"],
    [null, "bP", "wP", null],
    [null, "wP", "bP", null],
    ["wR", "wP", "wP", "wN"]
  ]
};

const uiState = {
  settings: loadVisualSettings(),
  searchQuery: "",
  activeCategory: "all",
  perspective: "split", // 'split' | 'w' | 'b'
  demoScenario: "midgame",
  demoGrid: structuredClone(DEMO_SCENARIOS.midgame),
  selectedDemoCell: { r: 2, c: 2 }
};

function showToast(message) {
  const container = document.getElementById("toast-container");
  if (!container) return;
  const el = document.createElement("div");
  el.className = "toast";
  el.textContent = message;
  container.appendChild(el);
  setTimeout(() => {
    el.remove();
  }, 2600);
}

function getEffectiveFactions(set) {
  if (uiState.settings.swapFactions) {
    return { white: set.blackFaction, black: set.whiteFaction };
  }
  return { white: set.whiteFaction, black: set.blackFaction };
}

function renderGallery() {
  const grid = document.getElementById("piece-sets-grid");
  if (!grid) return;
  grid.innerHTML = "";

  const q = uiState.searchQuery.trim().toLowerCase();
  const filtered = PIECE_SETS.filter((set) => {
    const matchesCat = uiState.activeCategory === "all" || set.category === uiState.activeCategory;
    if (!matchesCat) return false;
    if (!q) return true;
    const roleValues = Object.values(set.roleNames).join(" ").toLowerCase();
    return (
      set.name.toLowerCase().includes(q) ||
      set.subtitle.toLowerCase().includes(q) ||
      set.categoryLabel.toLowerCase().includes(q) ||
      set.whiteFaction.name.toLowerCase().includes(q) ||
      set.blackFaction.name.toLowerCase().includes(q) ||
      roleValues.includes(q)
    );
  });

  if (filtered.length === 0) {
    grid.innerHTML = `<div class="panel" style="grid-column: 1 / -1; text-align: center; padding: 2.5rem;">
      <p style="font-size: 1.05rem; color: var(--text-secondary);">No piece sets match "${uiState.searchQuery}".</p>
    </div>`;
    return;
  }

  const roles = ["K", "Q", "R", "B", "N", "P"];

  for (const set of filtered) {
    const isEquipped = uiState.settings.pieceSetId === set.id;
    const factions = getEffectiveFactions(set);

    const card = document.createElement("article");
    card.className = `piece-set-card${isEquipped ? " active-set" : ""}`;

    const previewSettings = {
      ...uiState.settings,
      pieceSetId: set.id
    };

    const piecesStripHtml = roles
      .map((role, idx) => {
        let side = "w";
        if (uiState.perspective === "b") side = "b";
        else if (uiState.perspective === "split") side = idx < 3 ? "w" : "b";

        const svg = getPieceSvg(`${side}${role}`, previewSettings);
        const roleTag = set.roleNames[role] || role;
        return `
          <div class="set-piece-cell ${side === "w" ? "side-w" : "side-b"}" title="${role}: ${roleTag}">
            <div class="set-piece-svg glow-${uiState.settings.glowStyle}">
              ${svg}
            </div>
            <span class="set-piece-label">${role} · ${roleTag}</span>
          </div>
        `;
      })
      .join("");

    card.innerHTML = `
      ${isEquipped ? `<div class="equipped-ribbon">✓ Currently Active</div>` : ""}
      <div class="set-card-top">
        <div>
          <div class="set-title-row">
            <h3 class="set-card-title">${set.name}</h3>
            <span class="set-badge set-badge-cat">${set.categoryLabel}</span>
            <span class="set-badge set-badge-rarity">${set.rarity}</span>
          </div>
          <p class="set-card-subtitle">${set.subtitle}</p>
        </div>
        <button type="button" class="btn ${isEquipped ? "btn-primary" : "btn-secondary"} btn-equip-set" data-set-id="${set.id}">
          ${isEquipped ? "Equipped" : "Select Set"}
        </button>
      </div>

      <div class="set-factions-row">
        <span class="faction-chip">
          <span class="faction-dot" style="background:${factions.white.dot}"></span>
          <strong>White:</strong> ${factions.white.avatar} ${factions.white.name}
        </span>
        <span class="faction-vs">vs</span>
        <span class="faction-chip">
          <span class="faction-dot" style="background:${factions.black.dot}"></span>
          <strong>Black:</strong> ${factions.black.avatar} ${factions.black.name}
        </span>
      </div>

      <div class="set-pieces-strip">
        ${piecesStripHtml}
      </div>

      <div class="set-card-footer">
        <span class="sound-pack-meta">🔊 Sound Pack: <strong>${set.soundPackLabel}</strong></span>
        <button type="button" class="btn-link-preview" data-set-id="${set.id}">
          Inspect on Board →
        </button>
      </div>
    `;

    grid.appendChild(card);
  }

  // Bind card buttons
  grid.querySelectorAll(".btn-equip-set, .btn-link-preview").forEach((btn) => {
    btn.addEventListener("click", () => {
      const chosenId = btn.dataset.setId;
      selectPieceSet(chosenId);
    });
  });
}

function selectPieceSet(setId) {
  const chosenSet = getPieceSetById(setId);
  uiState.settings.pieceSetId = chosenSet.id;
  saveVisualSettings(uiState.settings);
  playThemedSound("move", uiState.settings);
  syncInspectorControls();
  renderGallery();
  renderInspectorBoard();
  showToast(`Selected "${chosenSet.name}" piece set`);
}

function renderInspectorBoard() {
  const boardEl = document.getElementById("inspector-board");
  const frameEl = document.getElementById("inspector-board-frame");
  const headerPill = document.getElementById("active-set-header-pill");
  const inspectorBadge = document.getElementById("inspector-active-badge");
  const factionVsEl = document.getElementById("inspector-faction-vs");

  if (!boardEl || !frameEl) return;

  const currentSet = getPieceSetById(uiState.settings.pieceSetId);
  const factions = getEffectiveFactions(currentSet);

  frameEl.dataset.theme = uiState.settings.boardTheme;
  if (headerPill) headerPill.textContent = `Equipped: ${currentSet.name}`;
  if (inspectorBadge) inspectorBadge.textContent = currentSet.name;
  if (factionVsEl) {
    factionVsEl.textContent = `${factions.white.avatar} ${factions.white.name} vs ${factions.black.avatar} ${factions.black.name}`;
  }

  boardEl.innerHTML = "";
  const files = ["e", "f", "g", "h"];
  const ranks = ["7", "6", "5", "4"];

  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      const isLight = (r + c) % 2 === 0;
      const pieceKey = uiState.demoGrid[r][c];
      const isSelected =
        uiState.selectedDemoCell &&
        uiState.selectedDemoCell.r === r &&
        uiState.selectedDemoCell.c === c;

      const sq = document.createElement("div");
      sq.className = `square ${isLight ? "light" : "dark"}${isSelected ? " selected" : ""}`;
      sq.setAttribute("role", "gridcell");

      if (c === 0) {
        const rankSpan = document.createElement("span");
        rankSpan.className = "coord-rank";
        rankSpan.textContent = ranks[r];
        sq.appendChild(rankSpan);
      }
      if (r === 3) {
        const fileSpan = document.createElement("span");
        fileSpan.className = "coord-file";
        fileSpan.textContent = files[c];
        sq.appendChild(fileSpan);
      }

      if (pieceKey) {
        const role = pieceKey[1];
        const wrap = document.createElement("div");
        wrap.className = `piece-svg-wrap glow-${uiState.settings.glowStyle}`;
        wrap.style.inlineSize = `${uiState.settings.pieceScale}%`;
        wrap.style.blockSize = `${uiState.settings.pieceScale}%`;
        wrap.innerHTML = getPieceSvg(pieceKey, uiState.settings);
        wrap.title = `${pieceKey[0] === "w" ? "White" : "Black"} ${currentSet.roleNames[role] || role} (${role})`;
        sq.appendChild(wrap);

        if (uiState.settings.showRoleBadges) {
          const badge = document.createElement("span");
          badge.className = `piece-role-subbadge side-${pieceKey[0]}`;
          badge.textContent = role;
          sq.appendChild(badge);
        }
      }

      sq.addEventListener("click", () => handleInspectorSquareClick(r, c));
      boardEl.appendChild(sq);
    }
  }
}

function handleInspectorSquareClick(r, c) {
  const clickedPiece = uiState.demoGrid[r][c];
  const sel = uiState.selectedDemoCell;

  if (sel && (sel.r !== r || sel.c !== c) && uiState.demoGrid[sel.r][sel.c]) {
    // Move the selected piece on the demo sandbox board
    const movingPiece = uiState.demoGrid[sel.r][sel.c];
    const isCapture = Boolean(clickedPiece);
    uiState.demoGrid[sel.r][sel.c] = null;
    uiState.demoGrid[r][c] = movingPiece;
    uiState.selectedDemoCell = { r, c };
    playThemedSound(isCapture ? "capture" : "move", uiState.settings);
    renderInspectorBoard();
    return;
  }

  uiState.selectedDemoCell = { r, c };
  playThemedSound("move", uiState.settings);
  renderInspectorBoard();
}

function syncInspectorControls() {
  const scaleInput = document.getElementById("opt-piece-scale");
  const scaleVal = document.getElementById("opt-piece-scale-val");
  if (scaleInput) scaleInput.value = String(uiState.settings.pieceScale);
  if (scaleVal) scaleVal.textContent = `${uiState.settings.pieceScale}%`;

  document.querySelectorAll("#opt-glow-group .seg-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.glow === uiState.settings.glowStyle);
  });

  const swapCheck = document.getElementById("opt-swap-factions");
  if (swapCheck) swapCheck.checked = Boolean(uiState.settings.swapFactions);

  const roleBadgesCheck = document.getElementById("opt-role-badges");
  if (roleBadgesCheck) roleBadgesCheck.checked = Boolean(uiState.settings.showRoleBadges);

  const boardSelect = document.getElementById("opt-board-theme");
  if (boardSelect) boardSelect.value = uiState.settings.boardTheme;

  const vfxSelect = document.getElementById("opt-capture-vfx");
  if (vfxSelect) vfxSelect.value = uiState.settings.captureVfx;

  const soundSelect = document.getElementById("opt-sound-pack");
  if (soundSelect) soundSelect.value = uiState.settings.soundPack;
}

function bindEvents() {
  // Search input
  document.getElementById("set-search-input")?.addEventListener("input", (e) => {
    uiState.searchQuery = e.target.value || "";
    renderGallery();
  });

  // Perspective buttons
  document.querySelectorAll(".perspective-toggle-group .seg-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document
        .querySelectorAll(".perspective-toggle-group .seg-btn")
        .forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      uiState.perspective = btn.dataset.perspective;
      renderGallery();
    });
  });

  // Category filter pills
  document.querySelectorAll("#category-pills .cat-pill").forEach((btn) => {
    btn.addEventListener("click", () => {
      document
        .querySelectorAll("#category-pills .cat-pill")
        .forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      uiState.activeCategory = btn.dataset.category;
      renderGallery();
    });
  });

  // Demo scenario dropdown
  document.getElementById("demo-scenario-select")?.addEventListener("change", (e) => {
    const key = e.target.value.trim();
    const matrix = DEMO_SCENARIOS[key] || DEMO_SCENARIOS.midgame;
    uiState.demoGrid = structuredClone(matrix);
    uiState.selectedDemoCell = { r: 2, c: 2 };
    renderInspectorBoard();
  });

  // Scale slider
  document.getElementById("opt-piece-scale")?.addEventListener("input", (e) => {
    uiState.settings.pieceScale = Number(e.target.value);
    saveVisualSettings(uiState.settings);
    syncInspectorControls();
    renderInspectorBoard();
  });

  // Glow style buttons
  document.querySelectorAll("#opt-glow-group .seg-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      uiState.settings.glowStyle = btn.dataset.glow;
      saveVisualSettings(uiState.settings);
      syncInspectorControls();
      renderGallery();
      renderInspectorBoard();
    });
  });

  // Swap factions checkbox
  document.getElementById("opt-swap-factions")?.addEventListener("change", (e) => {
    uiState.settings.swapFactions = e.target.checked;
    saveVisualSettings(uiState.settings);
    renderGallery();
    renderInspectorBoard();
  });

  // Role badges checkbox
  document.getElementById("opt-role-badges")?.addEventListener("change", (e) => {
    uiState.settings.showRoleBadges = e.target.checked;
    saveVisualSettings(uiState.settings);
    renderInspectorBoard();
  });

  // Board theme select
  document.getElementById("opt-board-theme")?.addEventListener("change", (e) => {
    uiState.settings.boardTheme = e.target.value;
    saveVisualSettings(uiState.settings);
    renderInspectorBoard();
  });

  // Capture VFX select
  document.getElementById("opt-capture-vfx")?.addEventListener("change", (e) => {
    uiState.settings.captureVfx = e.target.value;
    saveVisualSettings(uiState.settings);
  });

  // Sound pack select
  document.getElementById("opt-sound-pack")?.addEventListener("change", (e) => {
    uiState.settings.soundPack = e.target.value;
    saveVisualSettings(uiState.settings);
    playThemedSound("move", uiState.settings);
  });

  // Test sound button
  document.getElementById("btn-test-sound")?.addEventListener("click", () => {
    playThemedSound("capture", uiState.settings);
    setTimeout(() => playThemedSound("move", uiState.settings), 160);
  });

  // Save & Return buttons
  const saveAndGoHome = () => {
    saveVisualSettings(uiState.settings);
    showToast("Settings saved! Returning to Chess Arena…");
    setTimeout(() => {
      window.location.href = "/";
    }, 320);
  };

  document.getElementById("btn-save-settings-top")?.addEventListener("click", saveAndGoHome);
  document.getElementById("btn-equip-apply")?.addEventListener("click", saveAndGoHome);

  // Reset defaults
  document.getElementById("btn-reset-defaults")?.addEventListener("click", () => {
    uiState.settings = saveVisualSettings({ ...DEFAULT_VISUAL_SETTINGS });
    syncInspectorControls();
    renderGallery();
    renderInspectorBoard();
    showToast("Reset to Classic Grandmaster defaults");
  });
}

document.addEventListener("DOMContentLoaded", () => {
  syncInspectorControls();
  renderGallery();
  renderInspectorBoard();
  bindEvents();
});
