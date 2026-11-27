import { createHash, randomUUID, timingSafeEqual } from "node:crypto";
import { createServer } from "node:http";
import { readFileSync } from "node:fs";
import { body, event, fail, json, label } from "./http.mjs";
import { connect } from "./db.mjs";
import { createModel } from "./model.mjs";

const env = process.env;
const stage = Number(process.argv[2] ?? 5);
const port = Number(env.PORT ?? 8787);
if (![1, 2, 3, 4, 5].includes(stage)) throw new Error("Use stage 1–5");
const model = createModel(env);
const production = env.APP_MODE === "production";
const keys = Object.entries(JSON.parse(env.APP_USERS ?? (production ? "{}" : '{"alice":"alice-local","bob":"bob-local"}')));
if (!keys.length || new Set(keys.map(([, key]) => key)).size !== keys.length ||
    keys.some(([name, key]) => !/^[\w-]{1,32}$/.test(name) ||
      typeof key !== "string" || !/^\S+$/.test(key) || (production && key.length < 32))) {
  throw new Error("APP_USERS must contain unique access keys (32+ characters in production)");
}
if (production && stage !== 5) throw new Error("Production requires stage 5");
const hash = (text) => createHash("sha256").update(text).digest();
const users = keys.map(([name, key]) => [name, hash(key)]);

const db = connect(env);
await db.run(`CREATE TABLE IF NOT EXISTS accounts (
  id VARCHAR(32) PRIMARY KEY
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin`);
await db.run(`CREATE TABLE IF NOT EXISTS conversations (
  seq BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  id CHAR(36) NOT NULL UNIQUE,
  owner VARCHAR(32) NOT NULL,
  title VARCHAR(80) NOT NULL,
  INDEX (owner, seq),
  FOREIGN KEY (owner) REFERENCES accounts(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin`);
await db.run(`CREATE TABLE IF NOT EXISTS messages (
  seq BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  id CHAR(36) NOT NULL UNIQUE,
  conversation CHAR(36) NOT NULL,
  role VARCHAR(16) NOT NULL,
  text TEXT NOT NULL,
  status VARCHAR(16) NOT NULL,
  INDEX (conversation, seq),
  FOREIGN KEY (conversation) REFERENCES conversations(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin`);
for (const [owner] of users) {
  await db.run("INSERT INTO accounts (id) VALUES (?) ON DUPLICATE KEY UPDATE id = id", owner);
  await db.run(`UPDATE messages JOIN conversations ON messages.conversation = conversations.id
    SET messages.status = 'interrupted' WHERE conversations.owner = ? AND messages.status = 'generating'`, owner);
}

const routes = new Map();
const pages = new Map([["/", ["index.html", "text/html"]], ["/app.mjs", ["app.mjs", "text/javascript"]],
  ["/sse.mjs", ["sse.mjs", "text/javascript"]]]);
const register = (method, path, handler, metered = false) => routes.set(`${method} ${path}`, { handler, metered });
const load = { 2: "./rag.mjs", 3: "./agent.mjs", 4: "./media.mjs", 5: "./ops.mjs" };
let ops;
for (let level = 2; level <= stage; level++) {
  const feature = await import(load[level]);
  const result = await feature.install({ db, model, env, register, users });
  if (level === 5) ops = result;
}

async function conversation(connection, owner, id, lock = false) {
  const sql = "SELECT id FROM conversations WHERE id = ? AND owner = ?";
  if (!await connection.one(lock ? `${sql} FOR UPDATE` : sql, id, owner)) {
    fail(404, "CONVERSATION_NOT_FOUND");
  }
}

register("GET", "/api/conversations", async ({ owner, res }) => json(res,
  await db.all("SELECT id, title FROM conversations WHERE owner = ? ORDER BY seq DESC LIMIT 100", owner)));
register("POST", "/api/conversations", async ({ owner, req, res }) => {
  const title = label((await body(req)).title, 80);
  const id = randomUUID();
  await db.run("INSERT INTO conversations (id, owner, title) VALUES (?, ?, ?)", id, owner, title);
  json(res, { id, title }, 201);
});
register("GET", "/api/messages", async ({ owner, url, res }) => {
  const id = label(url.searchParams.get("id"), 64);
  await conversation(db, owner, id);
  json(res, await db.all(
    "SELECT id, role, text, status FROM (SELECT * FROM messages WHERE conversation = ? ORDER BY seq DESC LIMIT 100) AS recent ORDER BY seq",
    id,
  ));
});
register("POST", "/api/chat", async ({ owner, req, res, signal, usage }) => {
  const input = await body(req);
  const id = label(input.id, 64);
  const text = label(input.text, 2000);
  const runId = randomUUID();
  const messages = await db.transaction(async (tx) => {
    await conversation(tx, owner, id, true);
    if (await tx.one("SELECT 1 FROM messages WHERE conversation = ? AND status = 'generating'", id)) {
      fail(409, "CHAT_BUSY");
    }
    const history = await tx.all(
      "SELECT role, text AS content FROM (SELECT * FROM messages WHERE conversation = ? AND status = 'done' ORDER BY seq DESC LIMIT 8) AS recent ORDER BY seq",
      id,
    );
    const insert = "INSERT INTO messages (id, conversation, role, text, status) VALUES (?, ?, ?, ?, ?)";
    await tx.run(insert, randomUUID(), id, "user", text, "done");
    await tx.run(insert, runId, id, "assistant", "", "generating");
    return [
      { role: "system", content: "你是知识库工作台助手。简洁回答，清楚表达不确定性。" },
      ...history, { role: "user", content: text },
    ];
  });
  res.writeHead(200, {
    "Content-Type": "text/event-stream; charset=utf-8",
    "Cache-Control": "no-cache, no-transform", "X-Accel-Buffering": "no",
  });
  res.flushHeaders();
  let answer = "";
  let status = "interrupted";
  try {
    for await (const part of model.stream({ messages, signal })) {
      signal.throwIfAborted();
      if (part.usage) usage(part.usage);
      if (part.text) {
        answer += part.text;
        if (answer.length > 8000) throw new Error("OUTPUT_TOO_LARGE");
        await event(res, "delta", { text: part.text }, signal);
      }
    }
    signal.throwIfAborted();
    if (!answer) throw new Error("EMPTY_COMPLETION");
    status = "done";
  } finally {
    await db.run("UPDATE messages SET text = ?, status = ? WHERE id = ?", answer.slice(0, 8000), status, runId);
  }
  await event(res, "done", { id: runId }, signal);
  res.end();
}, true);

const server = createServer({ requestTimeout: 30_000, headersTimeout: 10_000 }, async (req, res) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("Referrer-Policy", "no-referrer");
  res.setHeader("Content-Security-Policy", "default-src 'none'; script-src 'self'; connect-src 'self'; style-src 'unsafe-inline'; base-uri 'none'; frame-ancestors 'none'; form-action 'none'");
  const requestId = randomUUID();
  res.setHeader("X-Request-Id", requestId);
  const disconnected = new AbortController();
  req.on("aborted", () => disconnected.abort());
  res.on("close", () => { if (!res.writableEnded) disconnected.abort(); });
  const signal = AbortSignal.any([disconnected.signal, AbortSignal.timeout(25_000)]);
  let record;
  let outcome = "ok";
  try {
    const url = new URL(req.url, "http://localhost");
    const asset = req.method === "GET" && pages.get(url.pathname);
    if (asset) {
      res.setHeader("Content-Type", `${asset[1]}; charset=utf-8`);
      res.end(readFileSync(new URL(asset[0], import.meta.url)));
      return;
    }
    if (req.method === "GET" && url.pathname === "/api/health") return json(res, { ok: true, stage });
    const route = routes.get(`${req.method} ${url.pathname}`);
    if (!route) fail(404, "NOT_FOUND");
    const bearer = /^Bearer (\S+)$/.exec(req.headers.authorization ?? "")?.[1];
    const owner = bearer && users.find(([, digest]) => timingSafeEqual(digest, hash(bearer)))?.[0];
    if (!owner) fail(401, "AUTH_REQUIRED");
    if (route.metered) record = await ops?.reserve(owner, url.pathname, requestId);
    await route.handler({ owner, url, req, res, signal, usage: (data) => record?.usage(data) });
  } catch (error) {
    outcome = disconnected.signal.aborted ? "cancelled" : signal.aborted ? "timeout" : error.status ?? 502;
    if (disconnected.signal.aborted || res.destroyed) return;
    if (res.headersSent) {
      const errorSignal = AbortSignal.any([disconnected.signal, AbortSignal.timeout(1000)]);
      await event(res, "error", { code: "STREAM_INTERRUPTED", requestId }, errorSignal).catch(() => {});
      res.end();
    } else {
      if (error.status === 413) res.setHeader("Connection", "close");
      json(res, { code: signal.aborted ? "TIMEOUT" : error.status ? error.message : "UPSTREAM_ERROR", requestId },
        signal.aborted ? 504 : error.status ?? 502);
    }
  } finally {
    await record?.finish(outcome).catch((error) => {
      console.error(JSON.stringify({ requestId, code: error.code ?? "USAGE_WRITE_FAILED" }));
    });
  }
});
server.listen(port, "127.0.0.1", () => {
  console.log(`Stage ${stage}: http://127.0.0.1:${server.address().port}`);
});
for (const signal of ["SIGINT", "SIGTERM"]) {
  process.once(signal, () => server.close(() => void db.close()));
}
