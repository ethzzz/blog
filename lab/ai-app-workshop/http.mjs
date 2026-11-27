import { once } from "node:events";

export function fail(status, code) {
  throw Object.assign(new Error(code), { status });
}

export function json(res, value, status = 200) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(value));
}

export async function bytes(req, limit) {
  if (Number(req.headers["content-length"]) > limit) fail(413, "BODY_TOO_LARGE");
  const chunks = [];
  let size = 0;
  for await (const chunk of req.iterator({ destroyOnReturn: false })) {
    size += chunk.length;
    if (size > limit) fail(413, "BODY_TOO_LARGE");
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

export async function body(req) {
  if (req.headers["content-type"]?.split(";")[0] !== "application/json") {
    fail(415, "EXPECTED_JSON");
  }
  const raw = await bytes(req, 128 * 1024);
  let value;
  try {
    value = JSON.parse(raw.toString("utf8"));
  } catch {
    fail(400, "INVALID_JSON");
  }
  if (!value || typeof value !== "object" || Array.isArray(value)) fail(400, "EXPECTED_OBJECT");
  return value;
}

export function label(value, max) {
  if (typeof value !== "string" || !value.trim() || value.length > max) fail(400, "INVALID_TEXT");
  return value.trim();
}

export async function event(res, type, value, signal) {
  signal.throwIfAborted();
  const frame = `event: ${type}\ndata: ${JSON.stringify(value)}\n\n`;
  if (!res.write(frame)) await once(res, "drain", { signal });
}
