import { createHash, timingSafeEqual } from "node:crypto";
import { readFile } from "node:fs/promises";
import { createServer } from "node:http";
import { createAssistant } from "./assistant.mjs";
import { openDatabase } from "./db.mjs";
import { audience, demo, demoTime, materials, models } from "./fixtures.mjs";
import { compare, fail, instant, isRecord, overlaps, preview, resolve, validate } from "./rules.mjs";

const env = process.env;
const keys = {
  operator: env.OPERATOR_KEY ?? "operator-local",
  reviewer: env.REVIEWER_KEY ?? "reviewer-local",
};
const invalidKey = (key) => !/^\S+$/.test(key) || (env.APP_MODE === "production" && key.length < 32);
if (keys.operator === keys.reviewer || Object.values(keys).some(invalidKey)) throw new Error("INVALID_ROLE_KEYS");
const hash = (key) => createHash("sha256").update(key).digest();
const credentials = Object.entries(keys).map(([role, key]) => [role, hash(key)]);
const suggest = createAssistant(env);
const db = await openDatabase(env);
const files = new Map([
  ["/", ["index.html", "text/html"]],
  ["/app.mjs", ["app.mjs", "text/javascript"]],
]);

function json(res, value, status = 200) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(value));
}

async function body(req) {
  if (req.headers["content-type"]?.split(";")[0] !== "application/json") fail(415, "EXPECTED_JSON");
  const chunks = [];
  let size = 0;
  for await (const chunk of req.iterator({ destroyOnReturn: false })) {
    size += chunk.length;
    if (size > 32_768) fail(413, "BODY_TOO_LARGE");
    chunks.push(chunk);
  }
  let input;
  try { input = JSON.parse(Buffer.concat(chunks)); } catch { fail(400, "INVALID_JSON"); }
  if (!isRecord(input)) fail(400, "EXPECTED_OBJECT");
  return input;
}

function identify(req) {
  const key = /^Bearer (\S+)$/.exec(req.headers.authorization ?? "")?.[1];
  const role = key && credentials.find(([, digest]) => timingSafeEqual(digest, hash(key)))?.[0];
  if (!role) fail(401, "AUTH_REQUIRED");
  return role;
}

function requireOperator(role) {
  if (role !== "operator") fail(403, "FORBIDDEN");
}

const server = createServer({ requestTimeout: 20_000 }, async (req, res) => {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Content-Security-Policy", "default-src 'none'; script-src 'self'; style-src 'unsafe-inline'; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'");
  const abort = new AbortController();
  res.on("close", () => { if (!res.writableEnded) abort.abort(); });
  try {
    const url = new URL(req.url, "http://localhost");
    const { pathname } = url;
    const method = req.method;
    const asset = method === "GET" && files.get(pathname);
    if (asset) {
      res.setHeader("Content-Type", `${asset[1]}; charset=utf-8`);
      return res.end(await readFile(new URL(asset[0], import.meta.url)));
    }
    if (method === "GET" && pathname === "/api/health") {
      await db.published();
      return json(res, { ok: true });
    }
    if (method === "GET" && ["/help/link2", "/help/start"].includes(pathname)) {
      res.setHeader("Content-Type", "text/plain; charset=utf-8");
      return res.end(pathname.endsWith("link2") ? "演练素材：Link 2 新手教程。" : "演练素材：通用帮助中心。");
    }
    const role = identify(req);
    if (method === "GET" && pathname === "/api/catalog") return json(res, { role, audience, materials, models, demo, demoTime });
    if (method === "GET" && pathname === "/api/campaigns") return json(res, await db.list());
    const match = /^\/api\/campaigns\/([a-z0-9-]{1,36})(?:\/(audit|transition))?$/.exec(pathname);
    if (method === "GET" && match?.[2] === "audit") return json(res, await db.audit(match[1]));
    if (method === "GET" && pathname === "/api/resolve") {
      const user = audience.find(({ id }) => id === url.searchParams.get("user"));
      if (!user) fail(404, "USER_NOT_FOUND");
      const rawAt = url.searchParams.get("at");
      const at = rawAt === null ? Date.now() : instant(rawAt);
      const winner = resolve(await db.published(), user, at);
      return json(res, winner ? { id: winner.id, headline: winner.config.headline,
        path: materials.find(({ id }) => id === winner.config.assetId)?.path } : null);
    }
    if (!["POST", "PATCH"].includes(method)) fail(404, "NOT_FOUND");
    const input = await body(req);
    if (method === "POST" && pathname === "/api/campaigns") {
      requireOperator(role);
      return json(res, await db.create(input.config, input.proposalId), 201);
    }
    if (method === "PATCH" && match && !match[2]) {
      requireOperator(role);
      return json(res, await db.edit(match[1], input.revision, input.config, input.proposalId));
    }
    if (method === "POST" && match?.[2] === "transition") {
      return json(res, await db.transition(match[1], input.revision, input.action, role));
    }
    if (method === "POST" && ["/api/preview", "/api/compare"].includes(pathname)) {
      const at = instant(input.at);
      const published = (await db.published()).filter(({ id }) => id !== input.excludeId);
      const config = validate(input.config, materials);
      const rows = preview(config, audience, published, at);
      const conflicts = published.filter((row) => row.config.priority === config.priority && overlaps(row.config, config)).map(({ id }) => id);
      const delta = pathname === "/api/compare" ? compare(preview(validate(input.before, materials), audience, published, at), rows) : null;
      return json(res, { rows, conflicts, delta });
    }
    if (method === "POST" && pathname === "/api/ai/suggest") {
      requireOperator(role);
      if (typeof input.brief !== "string" || !input.brief.trim() || input.brief.length > 1600) fail(400, "INVALID_BRIEF");
      const signal = AbortSignal.any([abort.signal, AbortSignal.timeout(20_000)]);
      const result = await suggest(input.brief, signal);
      signal.throwIfAborted();
      return json(res, { ...result, id: await db.saveProposal(input.brief, result) });
    }
    fail(404, "NOT_FOUND");
  } catch (error) {
    if (res.destroyed) return;
    if (error.status === 413) res.setHeader("Connection", "close");
    if (!error.status) console.error("request failed", error.code ?? error.name);
    json(res, { code: error.status ? error.message : "REQUEST_FAILED" }, error.status ?? 502);
  }
});

server.listen(Number(env.PORT ?? 8790), "127.0.0.1", () => console.log(`http://127.0.0.1:${server.address().port}`));
for (const signal of ["SIGTERM", "SIGINT"]) process.once(signal, () => server.close(() => void db.close()));
