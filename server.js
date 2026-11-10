const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const { Chess } = require("chess.js");

// Load local .env if present
const envPath = path.join(__dirname, ".env");
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf8");
  for (const line of envContent.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx > 0) {
      const key = trimmed.slice(0, eqIdx).trim();
      const val = trimmed.slice(eqIdx + 1).trim();
      if (!process.env[key]) process.env[key] = val;
    }
  }
}

const PORT = Number(process.env.PORT || 33450);
const OMNIROUTE_BASE_URL = process.env.AI_GATEWAY_URL || process.env.OMNIROUTE_BASE_URL || "http://127.0.0.1:20128/v1";
const OMNIROUTE_API_KEY = process.env.AI_API_KEY || process.env.OMNIROUTE_API_KEY || "";

const CURATED_MODELS = [
  {
    id: "antigravity/gemini-3.8-flash-medium",
    name: "Gemini 3.8 Flash (Medium)",
    provider: "antigravity",
    badge: "Balanced GM",
    description: "Sharp tactical & positional play via Antigravity"
  },
  {
    id: "groq/qwen/qwen3.8-27b",
    name: "Qwen 3.8 27B (Groq)",
    provider: "groq",
    badge: "Ultra-Fast Blitz",
    description: "Sub-second blitz responses via Groq LPU"
  },
  {
    id: "groq/openai/gpt-oss-120b",
    name: "GPT-OSS 120B (Groq)",
    provider: "groq",
    badge: "Fast Reasoning",
    description: "High-speed reasoning with chain-of-thought"
  },
  {
    id: "antigravity/claude-sonnet-5-5-medium",
    name: "Claude Sonnet 5.5 (Medium)",
    provider: "antigravity",
    badge: "Positional Master",
    description: "Deep strategic planning & natural commentary"
  },
  {
    id: "antigravity/gemini-4-argon-medium",
    name: "Gemini 4 Argon (Medium)",
    provider: "antigravity",
    badge: "Deep Strategic",
    description: "Next-gen flagship model for complex middle games"
  },
  {
    id: "antigravity/claude-opus-5-5-high",
    name: "Claude Opus 5.5 (High)",
    provider: "antigravity",
    badge: "Heavy Calculation",
    description: "Maximum depth calculation & grandmaster prose"
  },
  {
    id: "antigravity/gemini-3.8-flash-low",
    name: "Gemini 3.8 Flash (Low)",
    provider: "antigravity",
    badge: "Rapid Tactician",
    description: "Low-latency Gemini 3.8 Flash tier"
  },
  {
    id: "antigravity/gpt-oss-120b-medium",
    name: "GPT-OSS 120B (Antigravity)",
    provider: "antigravity",
    badge: "Open-Weights GM",
    description: "120B parameter open-weights model via Antigravity"
  },
  {
    id: "antigravity/gemini-2.5-flash",
    name: "Gemini 3.5 Flash Lite",
    provider: "antigravity",
    badge: "Speedster",
    description: "Lightweight fast response tier"
  }
];

const FALLBACK_CHAIN = [
  "antigravity/gemini-3.8-flash-medium",
  "groq/qwen/qwen3.8-27b",
  "groq/openai/gpt-oss-120b",
  "antigravity/claude-sonnet-5-5-medium",
  "antigravity/gemini-3.8-flash-low",
  "antigravity/gemini-2.5-flash"
];

// Piece values and Piece-Square Tables (from White's perspective, rank 8 down to rank 1)
const PIECE_VALUES = { p: 100, n: 320, b: 330, r: 500, q: 900, k: 20000 };

const PST = {
  p: [
    [0,  0,  0,  0,  0,  0,  0,  0],
    [50, 50, 50, 50, 50, 50, 50, 50],
    [10, 10, 20, 30, 30, 20, 10, 10],
    [5,  5, 10, 25, 25, 10,  5,  5],
    [0,  0,  0, 20, 20,  0,  0,  0],
    [5, -5,-10,  0,  0,-10, -5,  5],
    [5, 10, 10,-20,-20, 10, 10,  5],
    [0,  0,  0,  0,  0,  0,  0,  0]
  ],
  n: [
    [-50,-40,-30,-30,-30,-30,-40,-50],
    [-40,-20,  0,  0,  0,  0,-20,-40],
    [-30,  0, 10, 15, 15, 10,  0,-30],
    [-30,  5, 15, 20, 20, 15,  5,-30],
    [-30,  0, 15, 20, 20, 15,  0,-30],
    [-30,  5, 10, 15, 15, 10,  5,-30],
    [-40,-20,  0,  5,  5,  0,-20,-40],
    [-50,-40,-30,-30,-30,-30,-40,-50]
  ],
  b: [
    [-20,-10,-10,-10,-10,-10,-10,-20],
    [-10,  0,  0,  0,  0,  0,  0,-10],
    [-10,  0,  5, 10, 10,  5,  0,-10],
    [-10,  5,  5, 10, 10,  5,  5,-10],
    [-10,  0, 10, 10, 10, 10,  0,-10],
    [-10, 10, 10, 10, 10, 10, 10,-10],
    [-10,  5,  0,  0,  0,  0,  5,-10],
    [-20,-10,-10,-10,-10,-10,-10,-20]
  ],
  r: [
    [0,  0,  0,  0,  0,  0,  0,  0],
    [5, 10, 10, 10, 10, 10, 10,  5],
    [-5,  0,  0,  0,  0,  0,  0, -5],
    [-5,  0,  0,  0,  0,  0,  0, -5],
    [-5,  0,  0,  0,  0,  0,  0, -5],
    [-5,  0,  0,  0,  0,  0,  0, -5],
    [-5,  0,  0,  0,  0,  0,  0, -5],
    [0,  0,  0,  5,  5,  0,  0,  0]
  ],
  q: [
    [-20,-10,-10, -5, -5,-10,-10,-20],
    [-10,  0,  0,  0,  0,  0,  0,-10],
    [-10,  0,  5,  5,  5,  5,  0,-10],
    [-5,  0,  5,  5,  5,  5,  0, -5],
    [0,  0,  5,  5,  5,  5,  0, -5],
    [-10,  5,  5,  5,  5,  5,  0,-10],
    [-10,  0,  5,  0,  0,  0,  0,-10],
    [-20,-10,-10, -5, -5,-10,-10,-20]
  ],
  k: [
    [-30,-40,-40,-50,-50,-40,-40,-30],
    [-30,-40,-40,-50,-50,-40,-40,-30],
    [-30,-40,-40,-50,-50,-40,-40,-30],
    [-30,-40,-40,-50,-50,-40,-40,-30],
    [-20,-30,-30,-40,-40,-30,-30,-20],
    [-10,-20,-20,-20,-20,-20,-20,-10],
    [20, 20,  0,  0,  0,  0, 20, 20],
    [20, 30, 10,  0,  0, 10, 30, 20]
  ]
};

/**
 * Evaluate board in centipawns from White's perspective (+ is good for White, - is good for Black).
 */
function evaluateBoard(chess) {
  if (chess.isCheckmate()) {
    return chess.turn() === "w" ? -99999 : 99999;
  }
  if (chess.isDraw() || chess.isStalemate() || chess.isThreefoldRepetition()) {
    return 0;
  }

  const board = chess.board();
  let score = 0;

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (!piece) continue;
      const base = PIECE_VALUES[piece.type] || 0;
      const table = PST[piece.type];
      const pstVal = table
        ? piece.color === "w"
          ? table[r][c]
          : table[7 - r][c]
        : 0;
      if (piece.color === "w") {
        score += base + pstVal;
      } else {
        score -= base + pstVal;
      }
    }
  }

  if (chess.inCheck()) {
    score += chess.turn() === "w" ? -35 : 35;
  }

  return score;
}

/**
 * Compute tactical lookahead (minimax with alpha-beta pruning) to rank candidate moves
 * and detect immediate tactics (mate-in-1, winning captures, hanging pieces).
 */
function minimax(chess, depth, alpha, beta, maximizingWhite) {
  if (depth === 0 || chess.isGameOver()) {
    return evaluateBoard(chess);
  }

  const moves = chess.moves({ verbose: true });
  // Sort captures and checks first for better pruning
  moves.sort((a, b) => (b.captured ? 10 : 0) - (a.captured ? 10 : 0));

  if (maximizingWhite) {
    let maxEval = -Infinity;
    for (const m of moves) {
      chess.move(m);
      const ev = minimax(chess, depth - 1, alpha, beta, false);
      chess.undo();
      if (ev > maxEval) maxEval = ev;
      if (ev > alpha) alpha = ev;
      if (beta <= alpha) break;
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (const m of moves) {
      chess.move(m);
      const ev = minimax(chess, depth - 1, alpha, beta, true);
      chess.undo();
      if (ev < minEval) minEval = ev;
      if (ev < beta) beta = ev;
      if (beta <= alpha) break;
    }
    return minEval;
  }
}

function analyzeCandidateMoves(fen, searchDepth = 2) {
  const chess = new Chess(fen);
  const turn = chess.turn(); // 'w' or 'b'
  const verboseMoves = chess.moves({ verbose: true });

  const scored = verboseMoves.map((m) => {
    chess.move(m);
    const isMate = chess.isCheckmate();
    const givesCheck = chess.inCheck();
    const scoreWhite = isMate
      ? turn === "w"
        ? 99999
        : -99999
      : minimax(chess, searchDepth - 1, -Infinity, Infinity, turn !== "w");
    chess.undo();

    // Score from current player's perspective
    const playerScore = turn === "w" ? scoreWhite : -scoreWhite;
    const uci = `${m.from}${m.to}${m.promotion || ""}`;

    let tags = [];
    if (isMate) tags.push("CHECKMATE");
    else if (givesCheck) tags.push("check");
    if (m.captured) tags.push(`captures ${m.captured.toUpperCase()}`);
    if (m.san.includes("O-O")) tags.push("castling");
    if (m.promotion) tags.push(`promotes to ${m.promotion.toUpperCase()}`);

    return {
      san: m.san,
      uci,
      from: m.from,
      to: m.to,
      promotion: m.promotion || null,
      captured: m.captured || null,
      piece: m.piece,
      flags: m.flags,
      scoreWhite: +(scoreWhite / 100).toFixed(2),
      playerScore: +(playerScore / 100).toFixed(2),
      tags
    };
  });

  scored.sort((a, b) => b.playerScore - a.playerScore);
  return {
    turn,
    inCheck: chess.inCheck(),
    currentEvalWhite: +(evaluateBoard(chess) / 100).toFixed(2),
    ascii: chess.ascii(),
    candidates: scored
  };
}

/**
 * Native node:http helper to call OmniRoute without global fetch() stream issues.
 */
function omnirouteRequest(endpointPath, method = "GET", payload = null, timeoutMs = 18000) {
  return new Promise((resolve, reject) => {
    const baseUrl = new URL(OMNIROUTE_BASE_URL);
    const fullPath = path.posix.join(baseUrl.pathname, endpointPath);
    const bodyStr = payload ? JSON.stringify(payload) : null;

    const options = {
      hostname: baseUrl.hostname,
      port: baseUrl.port || 20128,
      path: fullPath,
      method,
      headers: {
        Authorization: `Bearer ${OMNIROUTE_API_KEY}`,
        Accept: "application/json",
        ...(bodyStr
          ? {
              "Content-Type": "application/json",
              "Content-Length": Buffer.byteLength(bodyStr)
            }
          : {})
      }
    };

    const startTime = Date.now();
    const req = http.request(options, (res) => {
      const chunks = [];
      res.on("data", (chunk) => chunks.push(chunk));
      res.on("end", () => {
        const latencyMs = Date.now() - startTime;
        const raw = Buffer.concat(chunks).toString("utf8");
        try {
          const parsed = JSON.parse(raw);
          resolve({
            status: res.statusCode,
            latencyMs,
            headers: res.headers,
            data: parsed
          });
        } catch (err) {
          resolve({
            status: res.statusCode,
            latencyMs,
            headers: res.headers,
            data: null,
            raw
          });
        }
      });
    });

    req.setTimeout(timeoutMs, () => {
      req.destroy(new Error(`AI engine request timed out after ${timeoutMs}ms`));
    });

    req.on("error", (err) => {
      reject(err);
    });

    if (bodyStr) {
      req.write(bodyStr);
    }
    req.end();
  });
}

/**
 * Extract JSON or move token from LLM text output.
 */
function parseLlmMoveResponse(content, legalCandidates) {
  if (!content || typeof content !== "string") return null;

  const bySan = new Map();
  const bySanClean = new Map();
  const byUci = new Map();

  for (const c of legalCandidates) {
    bySan.set(c.san, c);
    bySanClean.set(c.san.replace(/[+#?!]/g, "").toLowerCase(), c);
    byUci.set(c.uci.toLowerCase(), c);
  }

  function matchMoveToken(token) {
    if (!token || typeof token !== "string") return null;
    const t = token.trim();
    if (bySan.has(t)) return bySan.get(t);
    const clean = t.replace(/[+#?!]/g, "").toLowerCase();
    if (byUci.has(clean)) return byUci.get(clean);
    if (bySanClean.has(clean)) return bySanClean.get(clean);
    return null;
  }

  // Try parsing JSON block first
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    try {
      const parsed = JSON.parse(jsonMatch[0]);
      const matched =
        matchMoveToken(parsed.move) ||
        matchMoveToken(parsed.san) ||
        matchMoveToken(parsed.uci);
      if (matched) {
        return {
          candidate: matched,
          thought:
            parsed.thought ||
            parsed.commentary ||
            parsed.reason ||
            "Calculated best continuation.",
          plan: parsed.plan || parsed.strategy || ""
        };
      }
    } catch {
      // Fall through to regex extraction
    }
  }

  // Fallback: look for any legal SAN or UCI token mentioned in the text
  const tokens = content.split(/[\s,`"':;()[\]{}]+/).filter(Boolean);
  for (const tok of tokens) {
    const matched = matchMoveToken(tok);
    if (matched) {
      return {
        candidate: matched,
        thought: content.replace(/```[\s\S]*?```/g, "").trim().slice(0, 260) || "Tactical selection.",
        plan: ""
      };
    }
  }

  return null;
}

/**
 * Call OmniRoute with automatic model fallback if the primary model is cooling down or fails.
 */
async function requestOmniRouteCompletion(requestedModel, messages, temperature = 0.25) {
  const modelsToTry = [
    requestedModel,
    ...FALLBACK_CHAIN.filter((m) => m !== requestedModel)
  ];

  const attempts = [];

  for (const modelId of modelsToTry) {
    try {
      const res = await omnirouteRequest("/chat/completions", "POST", {
        model: modelId,
        stream: false,
        temperature,
        messages
      });

      const content = res.data?.choices?.[0]?.message?.content || "";
      const reasoning = res.data?.choices?.[0]?.message?.reasoning || "";

      // Check for upstream deprecation / version warning strings masquerading as 200
      const isDeprecatedBanner =
        content.includes("no longer supported") ||
        content.includes("is no longer available. Please switch to");

      if (res.status === 200 && (content || reasoning) && !isDeprecatedBanner) {
        return {
          ok: true,
          requestedModel,
          usedModel: res.data?.model || modelId,
          routedModelId: modelId,
          latencyMs: res.latencyMs,
          usage: res.data?.usage || null,
          content: content || reasoning,
          reasoning,
          attempts
        };
      }

      attempts.push({
        model: modelId,
        status: res.status,
        error: res.data?.error?.message || content.slice(0, 120) || "Empty response"
      });
    } catch (err) {
      attempts.push({
        model: modelId,
        status: 0,
        error: err.message
      });
    }
  }

  return {
    ok: false,
    requestedModel,
    attempts
  };
}

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".mjs": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".ico": "image/x-icon"
};

function sendJson(res, status, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store"
  });
  res.end(body);
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let total = 0;
    req.on("data", (chunk) => {
      total += chunk.length;
      if (total > 1e6) {
        req.destroy();
        reject(new Error("Payload too large"));
        return;
      }
      chunks.push(chunk);
    });
    req.on("end", () => {
      try {
        const raw = Buffer.concat(chunks).toString("utf8");
        resolve(raw ? JSON.parse(raw) : {});
      } catch (e) {
        reject(new Error("Invalid JSON body"));
      }
    });
    req.on("error", reject);
  });
}

const server = http.createServer(async (req, res) => {
  const parsedUrl = new URL(req.url, `http://${req.headers.host || "localhost"}`);
  const pathname = parsedUrl.pathname;

  // API: Gateway Status & Models
  if (pathname === "/api/status" && req.method === "GET") {
    try {
      const probe = await omnirouteRequest("/models", "GET", null, 5000);
      const liveIds = new Set((probe.data?.data || []).map((m) => m.id));
      sendJson(res, 200, {
        online: probe.status === 200,
        gatewayUrl: OMNIROUTE_BASE_URL,
        dashboardUrl: OMNIROUTE_BASE_URL.replace(/\/v1\/?$/, ""),
        latencyMs: probe.latencyMs,
        totalGatewayModels: liveIds.size,
        curatedModels: CURATED_MODELS
      });
    } catch (err) {
      sendJson(res, 200, {
        online: false,
        gatewayUrl: OMNIROUTE_BASE_URL,
        dashboardUrl: OMNIROUTE_BASE_URL.replace(/\/v1\/?$/, ""),
        error: err.message,
        curatedModels: CURATED_MODELS
      });
    }
    return;
  }

  // API: Compute Computer Player Move via OmniRoute
  if (pathname === "/api/ai-move" && req.method === "POST") {
    try {
      const body = await readJsonBody(req);
      const {
        fen,
        history = [],
        model = "antigravity/gemini-3.8-flash-medium",
        difficulty = "grandmaster",
        persona = "Analytical Grandmaster"
      } = body;

      if (!fen) {
        sendJson(res, 400, { error: "Missing FEN string" });
        return;
      }

      const depth = difficulty === "casual" ? 1 : 2;
      const analysis = analyzeCandidateMoves(fen, depth);

      if (analysis.candidates.length === 0) {
        sendJson(res, 400, { error: "No legal moves available in this position" });
        return;
      }

      // If only 1 forced legal move exists, still ask or return quickly with commentary
      const sideName = analysis.turn === "w" ? "White" : "Black";
      const topCandidatesSummary = analysis.candidates
        .slice(0, 8)
        .map(
          (c, i) =>
            `${i + 1}. ${c.san} (UCI: ${c.uci}, eval: ${c.scoreWhite >= 0 ? "+" : ""}${c.scoreWhite}${
              c.tags.length ? `, ${c.tags.join(", ")}` : ""
            })`
        )
        .join("\n");

      const allLegalSan = analysis.candidates.map((c) => c.san).join(", ");
      const recentMoves = history.slice(-16).join(" ") || "Opening position";

      const difficultyInstruction =
        difficulty === "casual"
          ? "Play natural, human-like club chess. Occasionally prefer creative or thematic moves over the absolute top engine line."
          : difficulty === "tactical"
          ? "Prioritize aggressive tactics, checks, captures, and initiative."
          : "Play at maximum Grandmaster strength. Choose the strongest move clinically and explain the positional and tactical justification.";

      const systemPrompt = `You are an elite Grandmaster Chess AI playing as ${sideName}.
Persona: ${persona}. ${difficultyInstruction}
You MUST select a move strictly from the provided LEGAL MOVES list.
Respond ONLY with a valid JSON object matching this exact schema:
{"move": "<exact SAN move from legal moves>", "plan": "<short 4-8 word strategic plan>", "thought": "<1-2 sentence tactical/positional explanation>"}`;

      const userPrompt = `Current Position (FEN): ${fen}
Side to move: ${sideName}${analysis.inCheck ? " (CURRENTLY IN CHECK!)" : ""}
Recent move history: ${recentMoves}

Board:
${analysis.ascii}

Tactical Pre-Analysis (Top Candidate Moves for ${sideName}):
${topCandidatesSummary}

All Legal Moves (${analysis.candidates.length}): ${allLegalSan}

Select your move as ${sideName} and reply ONLY with JSON: {"move": "...", "plan": "...", "thought": "..."}`;

      const temperature = difficulty === "casual" ? 0.6 : 0.2;
      const llmResult = await requestOmniRouteCompletion(
        model,
        [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature
      );

      let chosen = null;
      let thought = "";
      let plan = "";
      let source = "omniroute-llm";

      if (llmResult.ok) {
        const parsed = parseLlmMoveResponse(llmResult.content, analysis.candidates);
        if (parsed) {
          chosen = parsed.candidate;
          thought = parsed.thought;
          plan = parsed.plan || "Execute positional plan";
        }
      }

      // If LLM returned an unparseable move or all models failed, pick from tactical analysis
      if (!chosen) {
        chosen =
          difficulty === "casual" && analysis.candidates.length > 2
            ? analysis.candidates[Math.floor(Math.random() * Math.min(3, analysis.candidates.length))]
            : analysis.candidates[0];
        thought = llmResult.ok
          ? `Selected top tactical continuation ${chosen.san} (${llmResult.content.slice(0, 120)})`
          : `Tactical fallback selected ${chosen.san} (eval ${chosen.scoreWhite >= 0 ? "+" : ""}${chosen.scoreWhite}).`;
        plan = chosen.tags.length ? chosen.tags.join(", ") : "Improve piece activity";
        source = llmResult.ok ? "omniroute-hybrid-validated" : "local-tactical-fallback";
      }

      sendJson(res, 200, {
        move: {
          san: chosen.san,
          uci: chosen.uci,
          from: chosen.from,
          to: chosen.to,
          promotion: chosen.promotion
        },
        thought,
        plan,
        evaluation: `${chosen.scoreWhite >= 0 ? "+" : ""}${chosen.scoreWhite.toFixed(2)}`,
        evalScore: chosen.scoreWhite,
        topCandidates: analysis.candidates.slice(0, 5),
        telemetry: {
          gateway: OMNIROUTE_BASE_URL,
          requestedModel: model,
          actualModel: llmResult.usedModel || model,
          routedModelId: llmResult.routedModelId || model,
          latencyMs: llmResult.latencyMs || 0,
          tokens: llmResult.usage
            ? {
                prompt: llmResult.usage.prompt_tokens || 0,
                completion: llmResult.usage.completion_tokens || 0,
                total: llmResult.usage.total_tokens || 0
              }
            : null,
          source,
          attempts: llmResult.attempts || []
        }
      });
    } catch (err) {
      sendJson(res, 500, { error: err.message });
    }
    return;
  }

  // API: Ask OmniRoute Grandmaster Coach for Hint
  if (pathname === "/api/ai-hint" && req.method === "POST") {
    try {
      const body = await readJsonBody(req);
      const {
        fen,
        history = [],
        model = "antigravity/gemini-3.8-flash-medium"
      } = body;

      if (!fen) {
        sendJson(res, 400, { error: "Missing FEN string" });
        return;
      }

      const analysis = analyzeCandidateMoves(fen, 2);
      if (analysis.candidates.length === 0) {
        sendJson(res, 400, { error: "Game is already over." });
        return;
      }

      const sideName = analysis.turn === "w" ? "White" : "Black";
      const top3 = analysis.candidates.slice(0, 4);
      const topSummary = top3
        .map(
          (c, idx) =>
            `${idx + 1}. ${c.san} (eval ${c.scoreWhite >= 0 ? "+" : ""}${c.scoreWhite}${
              c.tags.length ? `, ${c.tags.join(", ")}` : ""
            })`
        )
        .join("\n");

      const prompt = `You are a friendly Grandmaster Chess Coach helping the ${sideName} player.
Current FEN: ${fen}
Recent moves: ${history.slice(-12).join(" ") || "Opening"}
Top tactical candidate moves for ${sideName}:
${topSummary}

Reply ONLY with JSON:
{"bestMove": "<SAN>", "headline": "<short encouraging coaching tip>", "explanation": "<2-3 sentences explaining the best move and what tactical ideas or threats to watch for>"}`;

      const llmResult = await requestOmniRouteCompletion(
        model,
        [{ role: "user", content: prompt }],
        0.3
      );

      let bestMove = top3[0].san;
      let headline = `Recommended: ${top3[0].san}`;
      let explanation = `Playing ${top3[0].san} gives an evaluation of ${
        top3[0].scoreWhite >= 0 ? "+" : ""
      }${top3[0].scoreWhite}.`;

      if (llmResult.ok && llmResult.content) {
        const jsonMatch = llmResult.content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          try {
            const parsed = JSON.parse(jsonMatch[0]);
            if (parsed.bestMove) bestMove = parsed.bestMove;
            if (parsed.headline) headline = parsed.headline;
            if (parsed.explanation) explanation = parsed.explanation;
          } catch {
            explanation = llmResult.content.slice(0, 300);
          }
        } else {
          explanation = llmResult.content.slice(0, 300);
        }
      }

      const matchedCandidate =
        analysis.candidates.find(
          (c) => c.san.toLowerCase() === String(bestMove).trim().toLowerCase()
        ) || top3[0];

      sendJson(res, 200, {
        bestMove: matchedCandidate.san,
        from: matchedCandidate.from,
        to: matchedCandidate.to,
        headline,
        explanation,
        candidates: top3,
        telemetry: {
          actualModel: llmResult.usedModel || model,
          latencyMs: llmResult.latencyMs || 0
        }
      });
    } catch (err) {
      sendJson(res, 500, { error: err.message });
    }
    return;
  }

  // Static files from public/
  const publicDir = path.join(__dirname, "public");
  const relativePath = pathname === "/" ? "index.html" : pathname.replace(/^\/+/, "");
  const safePath = path.normalize(path.join(publicDir, relativePath));

  if (!safePath.startsWith(publicDir)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  fs.stat(safePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("Not Found");
      return;
    }

    const ext = path.extname(safePath).toLowerCase();
    res.writeHead(200, {
      "Content-Type": MIME_TYPES[ext] || "application/octet-stream",
      "Cache-Control": "no-cache"
    });
    fs.createReadStream(safePath).pipe(res);
  });
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`♟️  OmniRoute Chess Server listening on http://localhost:${PORT}`);
  console.log(`🔗 Connected to OmniRoute Gateway: ${OMNIROUTE_BASE_URL}`);
});
