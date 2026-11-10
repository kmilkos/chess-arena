// Chess Arena — Curated Piece Sets & Visual Customization Engine
// Designed with Google Stitch (Project 15880745256483103422)
// 100% Offline Local Vector SVGs & WebAudio Sound Packs (Zero External CDN Dependencies)

export const STORAGE_KEY = "chessArenaVisualSettings_v1";

export const DEFAULT_VISUAL_SETTINGS = {
  pieceSetId: "classic",
  pieceScale: 92, // 80 to 105 (%)
  glowStyle: "crisp", // 'crisp' | 'neon' | 'shadow3d' | 'cartoon'
  boardTheme: "emerald", // 'emerald' | 'walnut' | 'obsidian' | 'slate' | 'cyber' | 'volcanic'
  captureVfx: "shatter", // 'shatter' | 'laser' | 'comic' | 'subtle'
  soundPack: "auto", // 'auto' (follows piece set) or explicit pack id
  swapFactions: false,
  showRoleBadges: false
};

export function loadVisualSettings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_VISUAL_SETTINGS };
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_VISUAL_SETTINGS, ...parsed };
  } catch {
    return { ...DEFAULT_VISUAL_SETTINGS };
  }
}

export function saveVisualSettings(settings) {
  const merged = { ...DEFAULT_VISUAL_SETTINGS, ...settings };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
  } catch {
    // Ignore storage quota errors
  }
  return merged;
}

// Helper to wrap inner SVG paths with dynamic faction colors & stroke styles
function buildThemedSvg(palette, innerMarkup) {
  const { fill, stroke, accent, secondary } = palette;
  const processed = innerMarkup
    .replaceAll("{FILL}", fill)
    .replaceAll("{STROKE}", stroke)
    .replaceAll("{ACCENT}", accent)
    .replaceAll("{SECONDARY}", secondary || accent);
  return `<svg viewBox="0 0 45 45" xmlns="http://www.w3.org/2000/svg">${processed}</svg>`;
}

export const PIECE_SETS = [
  // 1. CLASSIC GRANDMASTER (STAUNTON)
  {
    id: "classic",
    name: "Classic Grandmaster",
    subtitle: "Staunton Olympiad Championship Cast",
    category: "classic",
    categoryLabel: "Tournament",
    rarity: "FIDE Approved",
    recommendedBoard: "emerald",
    soundPack: "wood",
    soundPackLabel: "Classic Walnut Wood",
    whiteFaction: {
      name: "White Olympiad",
      avatar: "♔",
      fill: "#ffffff",
      stroke: "#1e293b",
      accent: "#6366f1",
      secondary: "#cbd5e1",
      dot: "#f8fafc"
    },
    blackFaction: {
      name: "Black Obsidian",
      avatar: "♚",
      fill: "#1e293b",
      stroke: "#f8fafc",
      accent: "#818cf8",
      secondary: "#475569",
      dot: "#1e293b"
    },
    roleNames: { K: "King", Q: "Queen", R: "Rook", B: "Bishop", N: "Knight", P: "Pawn" },
    shapes: {
      P: `<path d="M22.5 9c-2.21 0-4 1.79-4 4 0 .89.29 1.71.78 2.38C17.33 16.5 16 18.59 16 21c0 2.03.94 3.84 2.41 5.03-3 1.06-7.41 5.55-7.41 13.47h23c0-7.92-4.41-12.41-7.41-13.47 1.47-1.19 2.41-3 2.41-5.03 0-2.41-1.33-4.5-3.28-5.62.49-.67.78-1.49.78-2.38 0-2.21-1.79-4-4-4z" fill="{FILL}" stroke="{STROKE}" stroke-width="1.8" stroke-linecap="round"/>`,
      R: `<g fill="{FILL}" stroke="{STROKE}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 39h27v-3H9v3zM12 36v-4h21v4H12zM11 14V9h4v2h5V9h5v2h5V9h4v5"/><path d="M34 14l-3 3H14l-3-3"/><path d="M31 17v12.5H14V17"/><path d="M31 29.5l1.5 2.5h-20l1.5-2.5"/><path d="M11 14h23" fill="none"/></g>`,
      N: `<g fill="{FILL}" stroke="{STROKE}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10c10.5 1 16.5 8 16 29H15c0-9 10-6.5 8-21"/><path d="M24 18c.38 2.91-5.55 7.37-8 9-3 2-2.82 4.34-5 4-1.042-.94 1.41-3.04 0-3-1 0 .19 1.23-1 2-1 0-4.003 1-4-4 0-2 6-12 6-12s1.89-1.9 2-3.5c-.73-.994-.5-2-.5-3 1-1 3 2.5 3 2.5h2s.78-1.992 2.5-3c1 0 1 3 1 3"/><circle cx="15.5" cy="15.5" r="1.2" fill="{STROKE}"/></g>`,
      B: `<g fill="{FILL}" stroke="{STROKE}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 36c3.39-.97 10.11.43 13.5-2 3.39 2.43 10.11 1.03 13.5 2 0 0 1.65.54 3 2-.68.97-1.65.99-3 .5-3.39-.97-10.11.46-13.5-1-3.39 1.46-10.11.03-13.5 1-1.354.49-2.323.47-3-.5 1.354-1.94 3-2 3-2z"/><path d="M15 32c2.5 2.5 12.5 2.5 15 0 .5-1.5 0-2 0-2 0-2.5-2.5-4-2.5-4 5.5-1.5 6-11.5-5-15.5-11 4-10.5 14-5 15.5 0 0-2.5 1.5-2.5 4 0 0-.5.5 0 2z"/><circle cx="22.5" cy="8" r="2.2"/><path d="M17.5 26h10M15 30h15m-7.5-14.5v5M20 18h5" fill="none"/></g>`,
      Q: `<g fill="{FILL}" stroke="{STROKE}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="6" cy="12" r="2"/><circle cx="14" cy="9" r="2"/><circle cx="22.5" cy="7.5" r="2"/><circle cx="31" cy="9" r="2"/><circle cx="39" cy="12" r="2"/><path d="M9 26c8.5-1.5 21-1.5 27 0l2-12-7 11V11l-5.5 13.5-3-15-3 15-5.5-14V25L7 14l2 12z"/><path d="M9 26c0 2 1.5 2 2.5 4 1 1.5 1 1 .5 3.5-1.5 1-1.5 2.5-1.5 2.5-1.5 1.5.5 2.5.5 2.5 6.5 1 16.5 1 23 0 0 0 1.5-1 0-2.5 0 0 .5-1.5-1-2.5-.5-2.5-.5-2 .5-3.5 1-2 2.5-2 2.5-4-8.5-1.5-18.5-1.5-27 0z"/><path d="M11.5 30c3.5-1 18.5-1 22 0M12 33.5c6-1 15-1 21 0" fill="none"/></g>`,
      K: `<g fill="{FILL}" stroke="{STROKE}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M22.5 11.63V6M20 8h5" fill="none"/><path d="M22.5 25s4.5-7.5 3-10.5c0 0-1-2.5-3-2.5s-3 2.5-3 2.5c-1.5 3 3 10.5 3 10.5"/><path d="M11.5 37c5.5 3.5 15.5 3.5 21 0v-7s9-4.5 6-10.5c-4-6.5-13.5-3.5-16 4V27v-3.5c-3.5-7.5-13-10.5-16-4-3 6 5 10 5 10V37z"/><path d="M11.5 30c5.5-3 15.5-3 21 0m-21 3.5c5.5-3 15.5-3 21 0m-21 3.5c5.5-3 15.5-3 21 0" fill="none"/></g>`
    }
  },

  // 2. GALACTIC EMPIRE VS REBEL ALLIANCE (SCI-FI MOVIE)
  {
    id: "galactic",
    name: "Galactic Empire vs Rebel Alliance",
    subtitle: "Space Opera Starfleet Combatants",
    category: "movies",
    categoryLabel: "Sci-Fi Movie",
    rarity: "Mythic",
    recommendedBoard: "obsidian",
    soundPack: "laser",
    soundPackLabel: "Heavy Laser & Lightsaber Hum",
    whiteFaction: {
      name: "Rebel Command",
      avatar: "⚔️",
      fill: "#f0f9ff",
      stroke: "#0c4a6e",
      accent: "#38bdf8",
      secondary: "#f97316",
      dot: "#38bdf8"
    },
    blackFaction: {
      name: "Imperial Sith Fleet",
      avatar: "🪖",
      fill: "#18181b",
      stroke: "#f4f4f5",
      accent: "#ef4444",
      secondary: "#dc2626",
      dot: "#ef4444"
    },
    roleNames: { K: "Lord", Q: "Emperor", R: "Station", B: "Sabers", N: "Starfighter", P: "Trooper" },
    shapes: {
      // K: Sith / Jedi Armored Helmet & Crest
      K: `<g stroke="{STROKE}" stroke-width="1.7" stroke-linejoin="round"><path d="M10 38h25l-2-5H12l-2 5z" fill="{FILL}"/><path d="M11 33c0-9 3-19 11.5-22C31 14 34 24 34 33H11z" fill="{FILL}"/><path d="M22.5 6v6M19 8.5h7" stroke="{ACCENT}" stroke-width="2.4" stroke-linecap="round"/><polygon points="15,22 21,22 19,26 14,25" fill="{ACCENT}"/><polygon points="30,22 24,22 26,26 31,25" fill="{ACCENT}"/><polygon points="18,31 22.5,25 27,31" fill="{SECONDARY}"/><line x1="20" y1="29" x2="20" y2="31" stroke="{STROKE}" stroke-width="1.2"/><line x1="22.5" y1="27" x2="22.5" y2="31" stroke="{STROKE}" stroke-width="1.2"/><line x1="25" y1="29" x2="25" y2="31" stroke="{STROKE}" stroke-width="1.2"/></g>`,
      // Q: Royal Starbird / Imperial Crown Hood
      Q: `<g stroke="{STROKE}" stroke-width="1.7" stroke-linejoin="round"><path d="M10 38h25l-1.5-4.5h-22L10 38z" fill="{FILL}"/><path d="M12 33.5C9 25 11 14 22.5 10 34 14 36 25 33 33.5H12z" fill="{FILL}"/><circle cx="11" cy="21" r="4" fill="{SECONDARY}"/><circle cx="34" cy="21" r="4" fill="{SECONDARY}"/><path d="M22.5 13c-3 4-4 10 0 16 4-6 3-12 0-16z" fill="{ACCENT}"/><circle cx="22.5" cy="8" r="2.2" fill="{ACCENT}"/></g>`,
      // R: Death Star / Orbital Battle Station Tower
      R: `<g stroke="{STROKE}" stroke-width="1.7" stroke-linejoin="round"><rect x="10" y="34" width="25" height="4" rx="1" fill="{FILL}"/><circle cx="22.5" cy="22" r="12.5" fill="{FILL}"/><line x1="10" y1="22.5" x2="35" y2="22.5" stroke="{ACCENT}" stroke-width="2"/><circle cx="18" cy="17.5" r="3.6" fill="{ACCENT}"/><circle cx="18" cy="17.5" r="1.2" fill="{STROKE}"/></g>`,
      // B: Crossed Plasma Lightsabers
      B: `<g stroke-linecap="round" stroke-linejoin="round"><rect x="10" y="35" width="25" height="4" rx="1.5" fill="{FILL}" stroke="{STROKE}" stroke-width="1.7"/><line x1="12" y1="31" x2="33" y2="9" stroke="{ACCENT}" stroke-width="4.2"/><line x1="33" y1="31" x2="12" y2="9" stroke="{SECONDARY}" stroke-width="4.2"/><line x1="12" y1="31" x2="16.5" y2="26.5" stroke="{STROKE}" stroke-width="4.8"/><line x1="33" y1="31" x2="28.5" y2="26.5" stroke="{STROKE}" stroke-width="4.8"/><circle cx="22.5" cy="20" r="3" fill="{FILL}" stroke="{STROKE}" stroke-width="1.5"/></g>`,
      // N: Starfighter (X-Wing / TIE Interceptor)
      N: `<g stroke="{STROKE}" stroke-width="1.7" stroke-linejoin="round"><rect x="11" y="35" width="23" height="3.5" rx="1" fill="{FILL}"/><polygon points="22.5,7 26.5,24 37,29 37,32 25.5,29 22.5,34 19.5,29 8,32 8,29 18.5,24" fill="{FILL}"/><polygon points="22.5,12 24.5,23 20.5,23" fill="{ACCENT}"/><line x1="9" y1="22" x2="9" y2="32" stroke="{ACCENT}" stroke-width="2.2"/><line x1="36" y1="22" x2="36" y2="32" stroke="{ACCENT}" stroke-width="2.2"/></g>`,
      // P: Astromech Droid / Trooper Visor
      P: `<g stroke="{STROKE}" stroke-width="1.7" stroke-linejoin="round"><rect x="11" y="34" width="23" height="4" rx="1.5" fill="{FILL}"/><path d="M14 34V21a8.5 8.5 0 0 1 17 0v13H14z" fill="{FILL}"/><line x1="14" y1="22" x2="31" y2="22" stroke="{ACCENT}" stroke-width="2.2"/><rect x="19" y="15.5" width="7" height="4" rx="1" fill="{ACCENT}"/><circle cx="25.5" cy="26.5" r="1.8" fill="{SECONDARY}"/></g>`
    }
  },

  // 3. MIDDLE-EARTH FELLOWSHIP VS MORDOR (FANTASY MOVIE)
  {
    id: "middle-earth",
    name: "Middle-earth Fellowship vs Mordor",
    subtitle: "High Fantasy Battle of the Third Age",
    category: "movies",
    categoryLabel: "Fantasy Movie",
    rarity: "Legendary",
    recommendedBoard: "walnut",
    soundPack: "orchestral",
    soundPackLabel: "Epic Horn & Blade Clash",
    whiteFaction: {
      name: "Gondor Free Peoples",
      avatar: "👑",
      fill: "#fefce8",
      stroke: "#422006",
      accent: "#eab308",
      secondary: "#38bdf8",
      dot: "#fde047"
    },
    blackFaction: {
      name: "Legions of Barad-dûr",
      avatar: "👁️",
      fill: "#1c1917",
      stroke: "#fed7aa",
      accent: "#f97316",
      secondary: "#ef4444",
      dot: "#ea580c"
    },
    roleNames: { K: "Crown", Q: "Ring/Star", R: "Eye Tower", B: "Staff", N: "Steed", P: "Shield" },
    shapes: {
      // K: Winged Crown of Gondor / Spiked Iron Helm of Sauron
      K: `<g stroke="{STROKE}" stroke-width="1.7" stroke-linejoin="round"><rect x="10" y="34" width="25" height="4" rx="1" fill="{FILL}"/><polygon points="11,34 13,15 18,23 22.5,8 27,23 32,15 34,34" fill="{FILL}"/><path d="M8 24c3-5 5-8 6-11M37 24c-3-5-5-8-6-11" stroke="{ACCENT}" stroke-width="2.2" fill="none"/><polygon points="22.5,14 25,21 22.5,28 20,21" fill="{ACCENT}"/></g>`,
      // Q: Evenstar / One Ring of Power
      Q: `<g stroke="{STROKE}" stroke-width="1.7" stroke-linejoin="round"><rect x="11" y="34" width="23" height="4" rx="1" fill="{FILL}"/><circle cx="22.5" cy="21" r="10.5" fill="none" stroke="{ACCENT}" stroke-width="4"/><polygon points="22.5,8 25.5,17.5 34,21 25.5,24.5 22.5,33 19.5,24.5 11,21 19.5,17.5" fill="{FILL}"/><circle cx="22.5" cy="21" r="3.2" fill="{SECONDARY}"/></g>`,
      // R: Eye of Barad-dûr / Minas Tirith Citadel
      R: `<g stroke="{STROKE}" stroke-width="1.7" stroke-linejoin="round"><rect x="9" y="35" width="27" height="3.5" fill="{FILL}"/><polygon points="12,35 15,15 11,9 18,13 22.5,17 27,13 34,9 30,15 33,35" fill="{FILL}"/><ellipse cx="22.5" cy="12.5" rx="6" ry="3.4" fill="{ACCENT}"/><line x1="22.5" y1="9.5" x2="22.5" y2="15.5" stroke="{STROKE}" stroke-width="2"/></g>`,
      // B: Wizard Staff with Illuminated Crystal
      B: `<g stroke="{STROKE}" stroke-width="1.7" stroke-linejoin="round"><rect x="11" y="35" width="23" height="3.5" rx="1" fill="{FILL}"/><path d="M18 35l2.5-15c-4-2-5-8-1-12 2.5 2 3 5 3 5s.5-3 3-5c4 4 3 10-1 12L27 35H18z" fill="{FILL}"/><circle cx="22.5" cy="13.5" r="3.8" fill="{ACCENT}"/></g>`,
      // N: Rearing Shadowfax / Fell Warhorse
      N: `<g stroke="{STROKE}" stroke-width="1.7" stroke-linejoin="round"><rect x="10" y="35" width="25" height="3.5" rx="1" fill="{FILL}"/><path d="M14 35c0-8 2-15 6-20l-4-2 2-4 5 1 4-3c4 3 6 10 5 28H14z" fill="{FILL}"/><path d="M26 14c3 3 4 8 3 14" stroke="{ACCENT}" stroke-width="2.2" fill="none"/><circle cx="20.5" cy="14" r="1.4" fill="{ACCENT}"/></g>`,
      // P: Leaf of Lórien / Uruk Tear-Shield
      P: `<g stroke="{STROKE}" stroke-width="1.7" stroke-linejoin="round"><rect x="12" y="35" width="21" height="3.5" rx="1" fill="{FILL}"/><path d="M22.5 10C14 15 13 26 22.5 34 32 26 31 15 22.5 10z" fill="{FILL}"/><path d="M22.5 13v17M22.5 19l-4.5-3M22.5 23l4.5-3" stroke="{ACCENT}" stroke-width="1.8" fill="none"/></g>`
    }
  },

  // 4. MUSHROOM KINGDOM VS KOOPA TROOP (RETRO PLATFORMER GAME)
  {
    id: "mushroom",
    name: "Mushroom Kingdom vs Koopa Troop",
    subtitle: "Classic Platformer Castle Showdown",
    category: "games",
    categoryLabel: "Platformer Game",
    rarity: "Collector",
    recommendedBoard: "emerald",
    soundPack: "8bit",
    soundPackLabel: "8-Bit Coin & Power-Up Chime",
    whiteFaction: {
      name: "Princess Peach Court",
      avatar: "⭐",
      fill: "#fef08a",
      stroke: "#7c2d12",
      accent: "#ef4444",
      secondary: "#f472b6",
      dot: "#ef4444"
    },
    blackFaction: {
      name: "Bowser Dark Lands",
      avatar: "🐢",
      fill: "#14532d",
      stroke: "#fef08a",
      accent: "#f97316",
      secondary: "#22c55e",
      dot: "#16a34a"
    },
    roleNames: { K: "Star", Q: "Tiara", R: "Warp Pipe", B: "Flower", N: "Yoshi", P: "Shroom" },
    shapes: {
      // K: Super Star with Eyes on Royal Pedestal
      K: `<g stroke="{STROKE}" stroke-width="1.8" stroke-linejoin="round"><rect x="11" y="34" width="23" height="4" rx="1.5" fill="{FILL}"/><polygon points="22.5,7 26.8,16.2 37,17.5 29.5,24.5 31.4,34 22.5,29.2 13.6,34 15.5,24.5 8,17.5 18.2,16.2" fill="{FILL}"/><line x1="20" y1="18.5" x2="20" y2="22.5" stroke="{STROKE}" stroke-width="2.2" stroke-linecap="round"/><line x1="25" y1="18.5" x2="25" y2="22.5" stroke="{STROKE}" stroke-width="2.2" stroke-linecap="round"/></g>`,
      // Q: Royal Peach Jewelled Crown
      Q: `<g stroke="{STROKE}" stroke-width="1.8" stroke-linejoin="round"><rect x="10" y="33" width="25" height="5" rx="1.5" fill="{FILL}"/><polygon points="11,33 11,15 17,22 22.5,11 28,22 34,15 34,33" fill="{FILL}"/><circle cx="22.5" cy="26" r="3" fill="{ACCENT}"/><circle cx="15.5" cy="27" r="2" fill="{SECONDARY}"/><circle cx="29.5" cy="27" r="2" fill="{SECONDARY}"/></g>`,
      // R: Iconic Warp Pipe
      R: `<g stroke="{STROKE}" stroke-width="1.8" stroke-linejoin="round"><rect x="13" y="19" width="19" height="19" fill="{SECONDARY}"/><rect x="10" y="11" width="25" height="8" rx="1.5" fill="{FILL}"/><line x1="16" y1="12" x2="16" y2="37" stroke="{ACCENT}" stroke-width="2"/></g>`,
      // B: Fire Flower
      B: `<g stroke="{STROKE}" stroke-width="1.8" stroke-linejoin="round"><rect x="12" y="34" width="21" height="4" rx="1.5" fill="{FILL}"/><line x1="22.5" y1="24" x2="22.5" y2="34" stroke="{SECONDARY}" stroke-width="3"/><ellipse cx="22.5" cy="17" rx="10" ry="7.5" fill="{ACCENT}"/><ellipse cx="22.5" cy="17" rx="6" ry="4.2" fill="{FILL}"/><line x1="20.5" y1="16" x2="20.5" y2="18" stroke="{STROKE}" stroke-width="1.8"/><line x1="24.5" y1="16" x2="24.5" y2="18" stroke="{STROKE}" stroke-width="1.8"/></g>`,
      // N: Dino Yoshi Silhouette
      N: `<g stroke="{STROKE}" stroke-width="1.8" stroke-linejoin="round"><rect x="11" y="34" width="23" height="4" rx="1.5" fill="{FILL}"/><path d="M15 34v-8c0-6 3-13 9-13 5 0 9 3 9 7 0 4-4 6-8 6v8H15z" fill="{FILL}"/><circle cx="29" cy="17" r="4.5" fill="{FILL}"/><circle cx="23" cy="13.5" r="1.4" fill="{STROKE}"/><path d="M15 17l-3 2 3 2m0 0l-3 2 3 2" stroke="{ACCENT}" stroke-width="2" fill="none"/></g>`,
      // P: Super Mushroom
      P: `<g stroke="{STROKE}" stroke-width="1.8" stroke-linejoin="round"><rect x="15" y="25" width="15" height="12" rx="3" fill="{FILL}"/><path d="M10 26c0-9 5.5-15 12.5-15S35 17 35 26H10z" fill="{ACCENT}"/><circle cx="22.5" cy="17" r="3.2" fill="{FILL}"/><circle cx="14.5" cy="21" r="2.2" fill="{FILL}"/><circle cx="30.5" cy="21" r="2.2" fill="{FILL}"/></g>`
    }
  },

  // 5. HYRULE TRIFORCE VS GANON'S ARMY (ADVENTURE RPG GAME)
  {
    id: "hyrule",
    name: "Hyrule Triforce vs Calamity Army",
    subtitle: "Hero of Time Legend & Hylian Royal Guard",
    category: "games",
    categoryLabel: "RPG Adventure",
    rarity: "Mythic",
    recommendedBoard: "slate",
    soundPack: "ocarina",
    soundPackLabel: "Sacred Ocarina & Master Blade",
    whiteFaction: {
      name: "Knights of Hyrule",
      avatar: "🗡️",
      fill: "#ecfeff",
      stroke: "#0f172a",
      accent: "#facc15",
      secondary: "#38bdf8",
      dot: "#22d3ee"
    },
    blackFaction: {
      name: "Calamity Horde",
      avatar: "👹",
      fill: "#27121b",
      stroke: "#fbcfe8",
      accent: "#ec4899",
      secondary: "#ef4444",
      dot: "#e11d48"
    },
    roleNames: { K: "Blade", Q: "Triforce", R: "Shield", B: "Sheikah", N: "Epona", P: "Korok" },
    shapes: {
      // K: Master Sword in Pedestal
      K: `<g stroke="{STROKE}" stroke-width="1.7" stroke-linejoin="round"><polygon points="10,38 14,31 31,31 35,38" fill="{FILL}"/><polygon points="22.5,6 25.5,11 25,25 20,25 19.5,11" fill="{FILL}"/><path d="M13 24l9.5 3 9.5-3-2 4-7.5 2-7.5-2-2-4z" fill="{ACCENT}"/><rect x="21" y="28" width="3" height="4" fill="{SECONDARY}"/></g>`,
      // Q: Golden Triforce & Royal Wing Crest
      Q: `<g stroke="{STROKE}" stroke-width="1.7" stroke-linejoin="round"><rect x="10" y="34" width="25" height="4" rx="1" fill="{FILL}"/><polygon points="22.5,8 29,19 16,19" fill="{ACCENT}"/><polygon points="16,19 22.5,30 9.5,30" fill="{ACCENT}"/><polygon points="29,19 35.5,30 22.5,30" fill="{ACCENT}"/></g>`,
      // R: Hylian Shield Bastion
      R: `<g stroke="{STROKE}" stroke-width="1.7" stroke-linejoin="round"><path d="M11 10h23v13c0 8-5.5 13-11.5 15.5C16.5 36 11 31 11 23V10z" fill="{FILL}"/><polygon points="22.5,14 26,20 19,20" fill="{ACCENT}"/><path d="M15 24l7.5 4 7.5-4-2 5-5.5 2-5.5-2-2-5z" fill="{SECONDARY}"/></g>`,
      // B: Sheikah Eye of Truth
      B: `<g stroke="{STROKE}" stroke-width="1.7" stroke-linejoin="round"><rect x="11" y="34" width="23" height="4" rx="1" fill="{FILL}"/><path d="M9 21c4.5-6.5 11-9 13.5-9S31.5 14.5 36 21c-4.5 6.5-11 9-13.5 9S13.5 27.5 9 21z" fill="{FILL}"/><circle cx="22.5" cy="21" r="5" fill="{ACCENT}"/><circle cx="22.5" cy="21" r="2" fill="{STROKE}"/><polygon points="22.5,30 20.5,34 24.5,34" fill="{SECONDARY}"/><polygon points="15,13 17,9 18.5,13" fill="{ACCENT}"/><polygon points="22.5,12 22.5,7 24,12" fill="{ACCENT}"/><polygon points="30,13 28,9 26.5,13" fill="{ACCENT}"/></g>`,
      // N: Epona Crest / Guardian Steed
      N: `<g stroke="{STROKE}" stroke-width="1.7" stroke-linejoin="round"><rect x="11" y="34" width="23" height="4" rx="1" fill="{FILL}"/><path d="M14 34c0-9 3-17 9-22l3-3 1 4 6 3-2 4-5-1c-2 3-1 9 2 15H14z" fill="{FILL}"/><path d="M17 16c-3 3-4 7-4 12" stroke="{ACCENT}" stroke-width="2.5" fill="none"/><circle cx="25" cy="14" r="1.4" fill="{ACCENT}"/></g>`,
      // P: Rupee / Korok Crest
      P: `<g stroke="{STROKE}" stroke-width="1.7" stroke-linejoin="round"><rect x="12" y="35" width="21" height="3.5" rx="1" fill="{FILL}"/><polygon points="22.5,9 31,15.5 31,27.5 22.5,34 14,27.5 14,15.5" fill="{ACCENT}"/><polygon points="22.5,13 27.5,17 27.5,26 22.5,30 17.5,26 17.5,17" fill="{FILL}"/></g>`
    }
  },

  // 6. GOTHAM VIGILANTES VS ARKHAM ROGUES (COMIC & ANIMATED SERIES)
  {
    id: "gotham",
    name: "Gotham Vigilantes vs Arkham Rogues",
    subtitle: "Midnight Neo-Noir Knight Defenders",
    category: "cartoons",
    categoryLabel: "Comic & Animated",
    rarity: "Special",
    recommendedBoard: "obsidian",
    soundPack: "noir",
    soundPackLabel: "Grapple Hook & Thunder",
    whiteFaction: {
      name: "The Bat-Family",
      avatar: "🦇",
      fill: "#e2e8f0",
      stroke: "#0f172a",
      accent: "#facc15",
      secondary: "#38bdf8",
      dot: "#facc15"
    },
    blackFaction: {
      name: "Arkham Syndicate",
      avatar: "🃏",
      fill: "#3b0764",
      stroke: "#f0fdf4",
      accent: "#4ade80",
      secondary: "#f43f5e",
      dot: "#a855f7"
    },
    roleNames: { K: "Cowl", Q: "Rogue", R: "Signal", B: "Coin", N: "Cruiser", P: "Batarang" },
    shapes: {
      // K: Iconic Pointed Bat-Cowl
      K: `<g stroke="{STROKE}" stroke-width="1.7" stroke-linejoin="round"><rect x="10" y="35" width="25" height="3.5" rx="1" fill="{FILL}"/><polygon points="12,35 12,18 15,7 19,17 26,17 30,7 33,18 33,35" fill="{FILL}"/><polygon points="15,23 20.5,25 16,27" fill="{ACCENT}"/><polygon points="30,23 24.5,25 29,27" fill="{ACCENT}"/></g>`,
      // Q: Harlequin Jester / Cat Mask Diamonds
      Q: `<g stroke="{STROKE}" stroke-width="1.7" stroke-linejoin="round"><rect x="10" y="35" width="25" height="3.5" rx="1" fill="{FILL}"/><path d="M13 35c-1-10-5-16-2-21 3-4 9 1 11.5 5 2.5-4 8.5-9 11.5-5 3 5-1 11-2 21H13z" fill="{FILL}"/><circle cx="10" cy="13" r="2.6" fill="{ACCENT}"/><circle cx="35" cy="13" r="2.6" fill="{SECONDARY}"/><polygon points="22.5,21 26,26 22.5,31 19,26" fill="{ACCENT}"/></g>`,
      // R: Gotham Gargoyle Spire & Searchlight
      R: `<g stroke="{STROKE}" stroke-width="1.7" stroke-linejoin="round"><rect x="9" y="35" width="27" height="3.5" fill="{FILL}"/><polygon points="13,35 15,17 30,17 32,35" fill="{FILL}"/><ellipse cx="22.5" cy="14" rx="9.5" ry="5.5" fill="{ACCENT}"/><path d="M17 14l2.5-2 3 2 3-2 2.5 2-2.5 2.5-3-1-3 1L17 14z" fill="{STROKE}"/></g>`,
      // B: Two-Face Coin / Riddler Emblem
      B: `<g stroke="{STROKE}" stroke-width="1.7" stroke-linejoin="round"><rect x="11" y="35" width="23" height="3.5" rx="1" fill="{FILL}"/><circle cx="22.5" cy="21" r="11" fill="{FILL}"/><path d="M22.5 10v22" stroke="{ACCENT}" stroke-width="2"/><text x="22.5" y="25.5" text-anchor="middle" font-size="13" font-weight="900" fill="{ACCENT}" stroke="none">?</text></g>`,
      // N: Armored Bat-Cruiser Silhouette
      N: `<g stroke="{STROKE}" stroke-width="1.7" stroke-linejoin="round"><polygon points="8,32 11,22 19,19 25,13 34,13 32,20 38,24 38,32" fill="{FILL}"/><circle cx="14.5" cy="33" r="4.2" fill="{ACCENT}"/><circle cx="31.5" cy="33" r="4.2" fill="{ACCENT}"/><polygon points="20,21 28,21 26,25 18,25" fill="{SECONDARY}"/></g>`,
      // P: Razor Batarang Wing
      P: `<g stroke="{STROKE}" stroke-width="1.7" stroke-linejoin="round"><rect x="12" y="34" width="21" height="4" rx="1" fill="{FILL}"/><path d="M7 18c4-5 9-6 13-2l2.5-4 2.5 4c4-4 9-3 13 2-4 3-7 7-8 12-3-3-5-4-7.5-1-2.5-3-4.5-2-7.5 1-1-5-4-9-8-12z" fill="{ACCENT}"/></g>`
    }
  },

  // 7. POCKET MONSTERS LEAGUE (ANIME & MONSTER RPG)
  {
    id: "pocket",
    name: "Pocket Monsters League",
    subtitle: "Kanto Gym Battle & Legendary Arena",
    category: "cartoons",
    categoryLabel: "Anime & RPG",
    rarity: "Rare",
    recommendedBoard: "emerald",
    soundPack: "anime",
    soundPackLabel: "Trainer Encounter & Bolt",
    whiteFaction: {
      name: "Kanto Champions",
      avatar: "⚡",
      fill: "#fef08a",
      stroke: "#713f12",
      accent: "#ef4444",
      secondary: "#f97316",
      dot: "#facc15"
    },
    blackFaction: {
      name: "Team Rocket Syndicate",
      avatar: "🔮",
      fill: "#1e1b4b",
      stroke: "#e0e7ff",
      accent: "#c084fc",
      secondary: "#ef4444",
      dot: "#a855f7"
    },
    roleNames: { K: "Dragon", Q: "Psychic", R: "Gym", B: "Alakazam", N: "Pikachu", P: "Pokéball" },
    shapes: {
      // K: Winged Flame Dragon Crest
      K: `<g stroke="{STROKE}" stroke-width="1.7" stroke-linejoin="round"><rect x="10" y="35" width="25" height="3.5" rx="1" fill="{FILL}"/><path d="M7 22l7-11 5 7 3.5-8 3.5 8 5-7 7 11-6 12H13L7 22z" fill="{FILL}"/><path d="M22.5 17c3 4 3 9 0 13-3-4-3-9 0-13z" fill="{ACCENT}"/></g>`,
      // Q: Mystic Psychic Crown
      Q: `<g stroke="{STROKE}" stroke-width="1.7" stroke-linejoin="round"><rect x="11" y="35" width="23" height="3.5" rx="1" fill="{FILL}"/><path d="M14 35l-2-19 6 6 4.5-11 4.5 11 6-6-2 19H14z" fill="{FILL}"/><circle cx="22.5" cy="25" r="4" fill="{ACCENT}"/></g>`,
      // R: Gym Badge Octagon Tower
      R: `<g stroke="{STROKE}" stroke-width="1.7" stroke-linejoin="round"><rect x="10" y="34" width="25" height="4" rx="1" fill="{FILL}"/><polygon points="17,9 28,9 34,15 34,26 28,32 17,32 11,26 11,15" fill="{FILL}"/><polygon points="19,14 26,14 29,18 29,23 26,27 19,27 16,23 16,18" fill="{ACCENT}"/></g>`,
      // B: Lightning Bolt / Psychic Emblem
      B: `<g stroke="{STROKE}" stroke-width="1.7" stroke-linejoin="round"><rect x="11" y="35" width="23" height="3.5" rx="1" fill="{FILL}"/><polygon points="25,7 12,23 21,23 18,34 33,18 24,18" fill="{ACCENT}"/></g>`,
      // N: Electric Mouse Ears & Cheek Sparks
      N: `<g stroke="{STROKE}" stroke-width="1.7" stroke-linejoin="round"><rect x="11" y="35" width="23" height="3.5" rx="1" fill="{FILL}"/><path d="M14 35c-2-5-2-12 1-16L11 8l8 6c2.5-.8 4.5-.8 7 0l8-6-4 11c3 4 3 11 1 16H14z" fill="{FILL}"/><polygon points="11,8 14,13 12.5,14.5" fill="{STROKE}"/><polygon points="34,8 31,13 32.5,14.5" fill="{STROKE}"/><circle cx="16.5" cy="26.5" r="2.4" fill="{ACCENT}"/><circle cx="28.5" cy="26.5" r="2.4" fill="{ACCENT}"/></g>`,
      // P: Iconic Monster Capture Ball
      P: `<g stroke="{STROKE}" stroke-width="1.8" stroke-linejoin="round"><circle cx="22.5" cy="23" r="12" fill="{FILL}"/><path d="M10.5 23a12 12 0 0 1 24 0H10.5z" fill="{ACCENT}"/><line x1="10.5" y1="23" x2="34.5" y2="23" stroke="{STROKE}" stroke-width="2.5"/><circle cx="22.5" cy="23" r="4" fill="{FILL}" stroke="{STROKE}" stroke-width="2"/></g>`
    }
  },

  // 8. BLOCKY CRAFT OVERWORLD VS NETHER (VOXEL SANDBOX GAME)
  {
    id: "blocky",
    name: "Blocky Craft Overworld vs Nether",
    subtitle: "Isometric Sandbox Miner Adventure",
    category: "games",
    categoryLabel: "Voxel Sandbox",
    rarity: "Custom",
    recommendedBoard: "walnut",
    soundPack: "voxel",
    soundPackLabel: "Anvil Strike & Voxel Dig",
    whiteFaction: {
      name: "Overworld Builders",
      avatar: "💎",
      fill: "#a5f3fc",
      stroke: "#083344",
      accent: "#06b6d4",
      secondary: "#22c55e",
      dot: "#06b6d4"
    },
    blackFaction: {
      name: "Nether Fortress",
      avatar: "👾",
      fill: "#2e1065",
      stroke: "#f3e8ff",
      accent: "#a855f7",
      secondary: "#f59e0b",
      dot: "#9333ea"
    },
    roleNames: { K: "Diamond", Q: "Ender", R: "Creeper", B: "Potion", N: "Steed", P: "Pickaxe" },
    shapes: {
      // K: Voxel Diamond Helmet Crown
      K: `<g stroke="{STROKE}" stroke-width="1.7" shape-rendering="crispEdges"><rect x="10" y="34" width="25" height="4" fill="{FILL}"/><polygon points="12,34 12,12 17,12 17,16 20,16 20,10 25,10 25,16 28,16 28,12 33,12 33,34" fill="{FILL}"/><rect x="16" y="21" width="5" height="5" fill="{ACCENT}"/><rect x="24" y="21" width="5" height="5" fill="{ACCENT}"/></g>`,
      // Q: Voxel Dragon / Enchanted Gem Crown
      Q: `<g stroke="{STROKE}" stroke-width="1.7" shape-rendering="crispEdges"><rect x="10" y="34" width="25" height="4" fill="{FILL}"/><rect x="13" y="16" width="19" height="18" fill="{FILL}"/><rect x="11" y="10" width="5" height="6" fill="{ACCENT}"/><rect x="20" y="8" width="5" height="8" fill="{ACCENT}"/><rect x="29" y="10" width="5" height="6" fill="{ACCENT}"/><rect x="17" y="22" width="4" height="3" fill="{SECONDARY}"/><rect x="24" y="22" width="4" height="3" fill="{SECONDARY}"/></g>`,
      // R: Iconic Creeper Block Bastion
      R: `<g stroke="{STROKE}" stroke-width="1.7" shape-rendering="crispEdges"><rect x="11" y="11" width="23" height="26" fill="{FILL}"/><rect x="15" y="16" width="4" height="4" fill="{STROKE}"/><rect x="26" y="16" width="4" height="4" fill="{STROKE}"/><rect x="20" y="20" width="5" height="7" fill="{STROKE}"/><rect x="17" y="24" width="3" height="7" fill="{STROKE}"/><rect x="25" y="24" width="3" height="7" fill="{STROKE}"/></g>`,
      // B: Voxel Potion Bottle
      B: `<g stroke="{STROKE}" stroke-width="1.7" shape-rendering="crispEdges"><rect x="19" y="8" width="7" height="4" fill="{ACCENT}"/><rect x="20" y="12" width="5" height="5" fill="{FILL}"/><polygon points="13,21 20,17 25,17 32,21 32,36 13,36" fill="{FILL}"/><rect x="16" y="24" width="13" height="9" fill="{ACCENT}"/></g>`,
      // N: Blocky Pixel Horse
      N: `<g stroke="{STROKE}" stroke-width="1.7" shape-rendering="crispEdges"><rect x="11" y="34" width="23" height="4" fill="{FILL}"/><polygon points="15,34 15,16 20,16 20,10 31,10 31,21 24,21 24,34" fill="{FILL}"/><rect x="25" y="13" width="3" height="3" fill="{ACCENT}"/></g>`,
      // P: Voxel Diamond Pickaxe
      P: `<g stroke="{STROKE}" stroke-width="1.7" shape-rendering="crispEdges"><rect x="12" y="34" width="21" height="4" fill="{FILL}"/><polygon points="12,14 20,9 32,21 27,29 24,26 26,20 19,13 15,17" fill="{ACCENT}"/><line x1="14" y1="31" x2="27" y2="18" stroke="{STROKE}" stroke-width="3.6"/></g>`
    }
  },

  // 9. SPRINGFIELD TOONS VS SHELBYVILLE (CLASSIC CARTOON)
  {
    id: "springfield",
    name: "Springfield Toons vs Shelbyville",
    subtitle: "Classic Animated Sitcom Neighborhood Rivalry",
    category: "cartoons",
    categoryLabel: "Classic Cartoon",
    rarity: "Fun",
    recommendedBoard: "slate",
    soundPack: "toon",
    soundPackLabel: "Comic Boing & Horn",
    whiteFaction: {
      name: "742 Evergreen Crew",
      avatar: "🍩",
      fill: "#fde047",
      stroke: "#1e293b",
      accent: "#ec4899",
      secondary: "#38bdf8",
      dot: "#facc15"
    },
    blackFaction: {
      name: "Shelbyville Rivals",
      avatar: "☢️",
      fill: "#1e293b",
      stroke: "#fef08a",
      accent: "#22c55e",
      secondary: "#f97316",
      dot: "#22c55e"
    },
    roleNames: { K: "Donut", Q: "Beehive", R: "Reactor", B: "Sax", N: "Skater", P: "Blinky" },
    shapes: {
      // K: Frosted Pink Donut Crown
      K: `<g stroke="{STROKE}" stroke-width="1.8" stroke-linejoin="round"><rect x="11" y="35" width="23" height="3.5" rx="1.5" fill="{FILL}"/><circle cx="22.5" cy="21" r="11.5" fill="{FILL}"/><circle cx="22.5" cy="21" r="9.5" fill="{ACCENT}"/><circle cx="22.5" cy="21" r="4" fill="#0e131e" stroke="{STROKE}" stroke-width="1.8"/><line x1="17" y1="14" x2="19" y2="15" stroke="#fff" stroke-width="1.8"/><line x1="27" y1="15" x2="29" y2="14" stroke="#38bdf8" stroke-width="1.8"/><line x1="15" y1="24" x2="17" y2="26" stroke="#fde047" stroke-width="1.8"/><line x1="27" y1="26" x2="29" y2="24" stroke="#fff" stroke-width="1.8"/></g>`,
      // Q: Tall Blue Beehive Hairdo
      Q: `<g stroke="{STROKE}" stroke-width="1.8" stroke-linejoin="round"><rect x="12" y="35" width="21" height="3.5" rx="1.5" fill="{FILL}"/><path d="M16 28c-2-5-2-15 0-19 2-3 11-3 13 0 2 4 2 14 0 19H16z" fill="{SECONDARY}"/><path d="M16 28h13l-1.5 7h-10L16 28z" fill="{FILL}"/><circle cx="18" cy="31" r="1.4" fill="{ACCENT}"/><circle cx="22.5" cy="31" r="1.4" fill="{ACCENT}"/><circle cx="27" cy="31" r="1.4" fill="{ACCENT}"/></g>`,
      // R: Nuclear Plant Cooling Tower
      R: `<g stroke="{STROKE}" stroke-width="1.8" stroke-linejoin="round"><path d="M11 37c3-8 4-15 3-23h17c-1 8 0 15 3 23H11z" fill="{FILL}"/><path d="M16 11c0-2 2.5-3.5 6.5-3.5S29 9 29 11" stroke="{ACCENT}" stroke-width="2.5" fill="none"/><circle cx="22.5" cy="25" r="4.5" fill="{ACCENT}"/></g>`,
      // B: Jazz Saxophone
      B: `<g stroke="{STROKE}" stroke-width="1.8" stroke-linejoin="round"><rect x="11" y="35" width="23" height="3.5" rx="1.5" fill="{FILL}"/><path d="M16 11h5v16c0 3 2 4 3.5 2l2.5-5h5l-3.5 9c-2.5 5-12.5 4-12.5-4V11z" fill="{ACCENT}"/></g>`,
      // N: Spiked Hair & Skateboard
      N: `<g stroke="{STROKE}" stroke-width="1.8" stroke-linejoin="round"><polygon points="14,29 14,13 17,16 19.5,12 22.5,16 25.5,12 28,16 31,13 31,29" fill="{FILL}"/><rect x="10" y="31" width="25" height="3.5" rx="1.8" fill="{ACCENT}"/><circle cx="15" cy="36.5" r="2.2" fill="{SECONDARY}"/><circle cx="30" cy="36.5" r="2.2" fill="{SECONDARY}"/></g>`,
      // P: Three-Eyed Blinky Fish
      P: `<g stroke="{STROKE}" stroke-width="1.8" stroke-linejoin="round"><rect x="12" y="35" width="21" height="3.5" rx="1.5" fill="{FILL}"/><path d="M9 22c4-6 14-7 20-2l6-4-1.5 6 1.5 6-6-4c-6 5-16 4-20-2z" fill="{ACCENT}"/><circle cx="14" cy="20.5" r="2.1" fill="#fff"/><circle cx="19" cy="19.5" r="2.1" fill="#fff"/><circle cx="24" cy="20.5" r="2.1" fill="#fff"/></g>`
    }
  },

  // 10. CYBER MECHA AUTOBOTS VS DECEPTICONS (MECHA MOVIE / CARTOON)
  {
    id: "cyber-mecha",
    name: "Cyber Mecha Autobots vs Decepticons",
    subtitle: "Transforming Alien Mechanoid War",
    category: "movies",
    categoryLabel: "Cyber Mecha",
    rarity: "Epic",
    recommendedBoard: "cyber",
    soundPack: "mecha",
    soundPackLabel: "Hydraulic Servo & Ion Cannon",
    whiteFaction: {
      name: "Matrix Vanguard",
      avatar: "🤖",
      fill: "#f8fafc",
      stroke: "#0f172a",
      accent: "#ef4444",
      secondary: "#38bdf8",
      dot: "#ef4444"
    },
    blackFaction: {
      name: "Dark Energon Legion",
      avatar: "⚡",
      fill: "#1e1b4b",
      stroke: "#e2e8f0",
      accent: "#a855f7",
      secondary: "#f43f5e",
      dot: "#a855f7"
    },
    roleNames: { K: "Prime", Q: "Seeker", R: "Energon", B: "Crest", N: "Stinger", P: "Spark" },
    shapes: {
      // K: Prime Battle Mask & Matrix Antennas
      K: `<g stroke="{STROKE}" stroke-width="1.7" stroke-linejoin="round"><rect x="10" y="35" width="25" height="3.5" fill="{FILL}"/><polygon points="13,34 11,17 14,9 16,15 22.5,11 29,15 31,9 34,17 32,34" fill="{FILL}"/><polygon points="15,20 21,21.5 16,23.5" fill="{SECONDARY}"/><polygon points="30,20 24,21.5 29,23.5" fill="{SECONDARY}"/><polygon points="17,26 22.5,24 28,26 26,33 19,33" fill="{ACCENT}"/></g>`,
      // Q: Winged Cyber Valkyrie / Seeker Crest
      Q: `<g stroke="{STROKE}" stroke-width="1.7" stroke-linejoin="round"><rect x="11" y="35" width="23" height="3.5" fill="{FILL}"/><polygon points="7,14 16,19 22.5,9 29,19 38,14 32,34 13,34" fill="{FILL}"/><polygon points="22.5,16 26,23 22.5,30 19,23" fill="{ACCENT}"/></g>`,
      // R: Glowing Energon Reactor Cube Tower
      R: `<g stroke="{STROKE}" stroke-width="1.7" stroke-linejoin="round"><rect x="10" y="34" width="25" height="4" fill="{FILL}"/><rect x="12" y="11" width="21" height="21" fill="{FILL}"/><rect x="16" y="15" width="13" height="13" fill="{ACCENT}"/><line x1="12" y1="11" x2="16" y2="15" stroke="{STROKE}" stroke-width="1.5"/><line x1="33" y1="11" x2="29" y2="15" stroke="{STROKE}" stroke-width="1.5"/></g>`,
      // B: Cyber Faction Crest Shield
      B: `<g stroke="{STROKE}" stroke-width="1.7" stroke-linejoin="round"><polygon points="11,11 22.5,8 34,11 31,34 22.5,38 14,34" fill="{FILL}"/><polygon points="15,15 22.5,20 30,15 28,23 22.5,20 17,23" fill="{ACCENT}"/><line x1="18" y1="28" x2="27" y2="28" stroke="{SECONDARY}" stroke-width="2.5"/></g>`,
      // N: Turbo Stinger / Cyber-Wolf
      N: `<g stroke="{STROKE}" stroke-width="1.7" stroke-linejoin="round"><rect x="11" y="35" width="23" height="3.5" fill="{FILL}"/><polygon points="13,34 15,18 12,10 19,14 26,14 33,10 30,18 32,34" fill="{FILL}"/><polygon points="16,21 29,21 27,25 18,25" fill="{ACCENT}"/></g>`,
      // P: AllSpark Core Cog
      P: `<g stroke="{STROKE}" stroke-width="1.7" stroke-linejoin="round"><rect x="12" y="35" width="21" height="3.5" fill="{FILL}"/><circle cx="22.5" cy="22" r="10" fill="{FILL}"/><circle cx="22.5" cy="22" r="5" fill="{ACCENT}"/></g>`
    }
  }
];

export function getPieceSetById(id) {
  return PIECE_SETS.find((s) => s.id === id) || PIECE_SETS[0];
}

export function getPieceSvg(pieceKey, visualSettings = DEFAULT_VISUAL_SETTINGS) {
  // pieceKey is e.g. "wK", "bQ", "wP"
  const side = pieceKey[0]; // 'w' or 'b'
  const role = pieceKey[1]; // 'K','Q','R','B','N','P'
  const set = getPieceSetById(visualSettings.pieceSetId);

  const useWhitePalette = visualSettings.swapFactions ? side === "b" : side === "w";
  const palette = useWhitePalette ? set.whiteFaction : set.blackFaction;
  const shapeTemplate = set.shapes[role] || PIECE_SETS[0].shapes[role];

  return buildThemedSvg(palette, shapeTemplate);
}

// Synthesize themed sound effects using Web Audio API (100% local, zero external files)
let sharedAudioCtx = null;
export function playThemedSound(eventType, visualSettings = DEFAULT_VISUAL_SETTINGS) {
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    if (!sharedAudioCtx) sharedAudioCtx = new AudioContextClass();
    if (sharedAudioCtx.state === "suspended") sharedAudioCtx.resume();

    const set = getPieceSetById(visualSettings.pieceSetId);
    const pack =
      visualSettings.soundPack && visualSettings.soundPack !== "auto"
        ? visualSettings.soundPack
        : set.soundPack;

    const now = sharedAudioCtx.currentTime;
    const osc = sharedAudioCtx.createOscillator();
    const gain = sharedAudioCtx.createGain();
    osc.connect(gain);
    gain.connect(sharedAudioCtx.destination);

    // Customize waveform & pitch profile by sound pack
    const is8Bit = pack === "8bit" || pack === "anime";
    const isLaser = pack === "laser" || pack === "mecha";
    const isToon = pack === "toon";

    if (eventType === "move") {
      osc.type = is8Bit ? "square" : isLaser ? "sawtooth" : isToon ? "triangle" : "sine";
      const startFreq = isLaser ? 540 : is8Bit ? 440 : isToon ? 220 : 280;
      const endFreq = isLaser ? 180 : is8Bit ? 660 : isToon ? 390 : 160;
      osc.frequency.setValueAtTime(startFreq, now);
      osc.frequency.exponentialRampToValueAtTime(endFreq, now + 0.085);
      gain.gain.setValueAtTime(is8Bit ? 0.09 : 0.14, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
      osc.start(now);
      osc.stop(now + 0.095);
    } else if (eventType === "capture") {
      osc.type = isLaser ? "sawtooth" : is8Bit ? "square" : "triangle";
      osc.frequency.setValueAtTime(isLaser ? 720 : 240, now);
      osc.frequency.exponentialRampToValueAtTime(isLaser ? 90 : 95, now + 0.12);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.125);
      osc.start(now);
      osc.stop(now + 0.13);
    } else if (eventType === "check") {
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(520, now);
      osc.frequency.setValueAtTime(680, now + 0.07);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
      osc.start(now);
      osc.stop(now + 0.23);
    } else if (eventType === "gameover") {
      osc.type = is8Bit ? "square" : "triangle";
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
