import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { randomBytes } from "node:crypto";
import { once } from "node:events";
import { createInterface } from "node:readline";
import { setTimeout as delay } from "node:timers/promises";
import { fileURLToPath } from "node:url";
import { events } from "./sse.mjs";
import { connect } from "./db.mjs";

const stage = Number(process.argv[2] ?? 5);
assert([1, 2, 3, 4, 5].includes(stage), "Use stage 1–5");
const testDb = process.env.TEST_DB_NAME ?? "kb_workshop_test";
assert.match(testDb, /^kb_workshop_test(?:_[a-z0-9_]+)?$/, "Use a dedicated kb_workshop_test database");
const run = randomBytes(8).toString("hex");
const alice = `test_alice_${run}`;
const bob = `test_bob_${run}`;
const testEnv = { ...process.env, DB_NAME: testDb };
const testDbConnection = connect(testEnv);
let started = false;
const start = (script, args, env) => spawn(process.execPath, [fileURLToPath(new URL(script, import.meta.url)), ...args], {
  env: { ...process.env, ...env }, stdio: ["pipe", "pipe", "inherit"],
});
let server;
let base;

async function boot() {
  server = start("./server.mjs", [String(stage)], {
    DB_NAME: testDb, PORT: "0", AI_PROVIDER: "mock", APP_MODE: "development",
    APP_USERS: JSON.stringify({ [alice]: "alice-local", [bob]: "bob-local" }),
    REQUESTS_PER_MINUTE: "40", REQUESTS_PER_DAY: "40",
  });
  const child = server;
  const lines = createInterface({ input: child.stdout });
  try {
    const [line] = await Promise.race([
      once(lines, "line", { signal: AbortSignal.timeout(5000) }),
      once(child, "exit").then(([code]) => { throw new Error(`Server exited: ${code}`); }),
    ]);
    base = new URL(line.match(/http:\/\/127\.0\.0\.1:\d+/)?.[0]);
    started = true;
  } finally {
    lines.close();
    child.stdout.resume();
  }
}

async function stop(child) {
  if (!child || child.exitCode !== null || child.signalCode !== null) return;
  const closed = once(child, "close");
  child.kill();
  await closed;
}

function request(path, { data, key = "alice-local", ...init } = {}) {
  const headers = { Authorization: `Bearer ${key}`, ...init.headers };
  if (data) {
    init.body = JSON.stringify(data);
    headers["Content-Type"] = "application/json";
  }
  return fetch(new URL(path, base), { ...init, headers, signal: AbortSignal.timeout(5000) });
}

async function verify(path, options, status = 200) {
  const response = await request(path, options);
  assert.equal(response.status, status, path);
  return response.json();
}
const post = (path, data, status, key) => verify(path, { method: "POST", data, key }, status);

async function checkMcp() {
  const child = start("./mcp.mjs", [], { DB_NAME: testDb, MCP_OWNER: alice });
  const lines = createInterface({ input: child.stdout });
  const send = (message) => child.stdin.write(JSON.stringify({ jsonrpc: "2.0", ...message }) + "\n");
  const call = async (id, method, params) => {
    const next = once(lines, "line", { signal: AbortSignal.timeout(3000) });
    send({ id, method, params });
    const [line] = await next;
    const message = JSON.parse(line);
    assert.equal(message.id, id);
    return message;
  };
  try {
    const hello = await call(1, "initialize", {
      protocolVersion: "2025-11-25", capabilities: {}, clientInfo: { name: "workshop-smoke", version: "1" },
    });
    assert.equal(hello.result.protocolVersion, "2025-11-25");
    send({ method: "notifications/initialized" });
    assert.deepEqual((await call(2, "tools/list")).result.tools.map(({ name }) => name), ["list_tasks"]);
    const response = await call(3, "tools/call", { name: "list_tasks", arguments: {} });
    assert.equal(JSON.parse(response.result.content[0].text)[0].title, "整理发布流程");
    assert.equal((await call(4, "tools/call", { name: "propose_task" })).error.code, -32602);
  } finally {
    const closed = once(child, "close");
    child.stdin.end();
    await closed;
    lines.close();
  }
}

try {
  const sse = new TextEncoder().encode(": comment\r\ndata: 中\r\ndata: 文\r\n\r\n");
  const split = new ReadableStream({ start(controller) {
    for (const byte of sse) controller.enqueue(Uint8Array.of(byte));
    controller.close();
  } });
  const seen = [];
  for await (const frame of events(split)) seen.push(frame);
  assert.deepEqual(seen, [{ type: "message", data: "中\n文" }]);
  await boot();
  assert.equal((await verify("/api/health")).stage, stage);
  assert.equal((await request("/")).status, 200);
  await verify("/api/conversations", { key: "invalid" }, 401);
  const { id } = await post("/api/conversations", { title: "发布会话" }, 201);
  const messages = `/api/messages?id=${id}`;
  await verify(messages, { key: "bob-local" }, 404);
  const chat = (text) => request("/api/chat", { method: "POST", data: { id, text } });
  const response = await chat("你好");
  assert.equal(response.status, 200);
  let reply = "";
  let done = false;
  for await (const frame of events(response.body)) {
    if (frame.type === "delta") reply += JSON.parse(frame.data).text;
    if (frame.type === "done") done = true;
  }
  assert.equal(reply, "演练回复：你好");
  assert.ok(done);
  const partial = await chat("这是一条应该被客户端主动停止的长消息");
  await post("/api/chat", { id, text: "并发请求" }, 409);
  for await (const frame of events(partial.body)) {
    if (frame.type === "delta") break;
  }
  let last;
  for (let i = 0; i < 40; i++) {
    last = (await verify(messages)).at(-1);
    if (last.status === "interrupted") break;
    await delay(30);
  }
  assert.equal(last.status, "interrupted");
  assert.ok(last.text.length > 0 && last.text.length < "演练回复：这是一条应该被客户端主动停止的长消息".length);
  await stop(server);
  await boot();
  assert.equal((await verify(messages))[1].text, "演练回复：你好");
  console.log("PASS 01: SSE framing, cancellation, persistence, authentication");

  if (stage >= 2) {
    const { id: doc } = await post("/api/documents", { title: "发布流程", text: "发布流程：先运行冒烟测试，再申请发布。" }, 201);
    const cases = [
      { text: "发布流程", key: "alice-local", answer: true },
      { text: "今日食堂菜单", key: "alice-local", answer: false },
      { text: "发布流程", key: "bob-local", answer: false },
    ];
    for (const sample of cases) {
      const result = await post("/api/ask", { text: sample.text }, 200, sample.key);
      assert.equal(!result.abstained, sample.answer, sample.text);
      if (sample.answer) {
        assert.equal(result.citations[0].id, doc);
        assert.match(result.answer, /冒烟测试/);
        assert.match((await verify(`/api/document?id=${doc}`)).text, /冒烟测试/);
      }
    }
    await verify(`/api/document?id=${doc}`, { key: "bob-local" }, 404);
    await verify(`/api/document?id=${doc}`, { key: "bob-local", method: "DELETE" }, 404);
    await verify(`/api/document?id=${doc}`, { method: "DELETE" });
    assert.equal((await post("/api/ask", { text: "发布流程" })).abstained, true);
    console.log("PASS 02: RAG cases 3/3, citations, deletion and data isolation");
  }

  if (stage >= 3) {
    const { proposal } = await post("/api/agent", { text: "待办：整理发布流程" });
    assert.deepEqual(await verify("/api/tasks"), []);
    await post("/api/tasks/confirm", { id: proposal.id }, 404, "bob-local");
    const confirmed = await Promise.all([
      post("/api/tasks/confirm", { id: proposal.id }),
      post("/api/tasks/confirm", { id: proposal.id }),
    ]);
    assert.deepEqual(confirmed[0], confirmed[1]);
    assert.equal((await verify("/api/tasks")).length, 1);
    await checkMcp();
    console.log("PASS 03: tool proposal, ownership, idempotent confirmation and MCP stdio");
  }

  if (stage >= 4) {
    const png = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jZioAAAAASUVORK5CYII=", "base64");
    const media = (type, data, status) => verify("/api/media", {
      method: "POST", headers: { "Content-Type": type }, body: data,
    }, status);
    assert.equal((await media("image/png", png)).kind, "description");
    await media("image/png", Buffer.from("fake"), 415);
    await media("image/png", Buffer.alloc(2 * 1024 * 1024 + 1), 413);
    const wav = Buffer.alloc(44);
    wav.write("RIFF", 0);
    wav.write("WAVE", 8);
    assert.equal((await media("audio/wav", wav)).kind, "transcript");
    console.log("PASS 04: multimodal routing, size limit and signature check");
  }

  if (stage >= 5) {
    const reviewed = await request("/api/agent", { method: "POST", data: { text: "查看待办" } });
    assert.equal(reviewed.status, 200);
    await reviewed.json();
    const runId = reviewed.headers.get("X-Request-Id");
    for (let i = 0; i < 40; i++) {
      const review = (await verify("/api/usage")).recent.find(({ id }) => id === runId);
      if (review?.status === "ok") break;
      await delay(25);
    }
    await post("/api/feedback", { id: runId, rating: 1 }, 404, "bob-local");
    await post("/api/feedback", { id: runId, rating: 1 });
    assert.equal((await verify("/api/usage")).recent.find(({ id }) => id === runId).rating, 1);
    const bobUsage = await verify("/api/usage", { key: "bob-local" });
    for (let i = bobUsage.requests; i < 39; i++) {
      await post("/api/agent", { text: "查看待办" }, 200, "bob-local");
    }
    const competing = await Promise.all([1, 2].map(() => request("/api/agent", {
      method: "POST", data: { text: "查看待办" }, key: "bob-local",
    })));
    assert.deepEqual(competing.map((result) => result.status).sort(), [200, 429]);
    await Promise.all(competing.map((result) => result.json()));
    console.log("PASS 05: usage, feedback ownership and quota");
  }
} finally {
  await stop(server);
  try {
    if (started) await testDbConnection.run("DELETE FROM accounts WHERE id IN (?, ?)", alice, bob);
  } finally {
    await testDbConnection.close();
  }
}
