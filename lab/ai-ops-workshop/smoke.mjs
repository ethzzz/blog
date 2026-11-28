import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { createInterface } from "node:readline";
import { fileURLToPath } from "node:url";
import mysql from "mysql2/promise";
import { demo, demoTime } from "./fixtures.mjs";

const env = process.env;
const database = env.TEST_DB_NAME ?? "ops_workshop_test";
assert.match(database, /^ops_workshop_test(?:_[a-z0-9_]+)?$/);
const child = spawn(process.execPath, [fileURLToPath(new URL("./server.mjs", import.meta.url))], {
  env: { ...env, DB_NAME: database, PORT: "0", APP_MODE: "development",
    AI_PROVIDER: "mock", OPERATOR_KEY: "operator-local", REVIEWER_KEY: "reviewer-local" },
  stdio: ["ignore", "pipe", "inherit"],
});
const closed = once(child, "close");
const lines = createInterface({ input: child.stdout });
const created = [];
let proposalId;
try {
  const [line] = await Promise.race([
    once(lines, "line", { signal: AbortSignal.timeout(10_000) }),
    closed.then(([code]) => { throw new Error(`Server exited before listening (${code})`); }),
  ]);
  const origin = new URL(line);
  lines.close();
  child.stdout.resume();
  const call = async (path, { method = "GET", data, role = "operator" } = {}) => {
    const response = await fetch(new URL(path, origin), {
      method, headers: { Authorization: `Bearer ${role}-local`, "Content-Type": "application/json" },
      body: data && JSON.stringify(data), signal: AbortSignal.timeout(8000),
    });
    return { status: response.status, data: await response.json() };
  };
  const check = async (path, options, expected = 200) => {
    const { status, data } = await call(path, options);
    assert.equal(status, expected, `${path}: ${JSON.stringify(data)}`);
    return data;
  };
  const transition = (row, action, role) => ({
    path: `/api/campaigns/${row.id}/transition`,
    options: { method: "POST", data: { revision: row.revision, action }, role },
  });
  const change = (row, action, role, expected) => {
    const { path, options } = transition(row, action, role);
    return check(path, options, expected);
  };
  const create = async (proposalId) => {
    const draft = await check("/api/campaigns", { method: "POST", data: { config: demo, proposalId } }, 201);
    created.push(draft.id);
    return draft;
  };
  const winner = (user, at = demoTime) => check(`/api/resolve?${new URLSearchParams({ user, at })}`);
  assert.equal((await check("/api/health")).ok, true);
  await check("/api/catalog", { role: "unknown" }, 401);
  assert.equal((await winner("u01")).id, "baseline");
  const rows = await check("/api/preview", { method: "POST", data: { config: demo, at: demoTime } });
  assert.deepEqual(rows.rows.filter((row) => row.matched).map(({ id }) => id), ["u01", "u03"]);
  const diff = await check("/api/compare", { method: "POST", data: {
    before: demo, config: { ...demo, minAppVersion: "2.4.0" }, at: demoTime,
  } });
  assert.deepEqual(diff.delta, { added: ["u02"], removed: [] });
  const suggestion = await check("/api/ai/suggest", { method: "POST", data: { brief: "Link 2 教程，本周五下线" } });
  proposalId = suggestion.id;
  assert.deepEqual(suggestion.patch.models, ["LINK2"]);
  assert.equal(suggestion.patch.endsAt, undefined);
  assert.equal((await check("/api/campaigns")).length, 1);
  await check("/api/ai/suggest", { method: "POST", role: "reviewer", data: { brief: "Link 2 教程" } }, 403);
  const draft = await create(proposalId);
  const edit = await check(`/api/campaigns/${draft.id}`, { method: "PATCH", data: { revision: draft.revision, config: demo } });
  await change(draft, "submit", "operator", 409);
  const review = await change(edit, "submit", "operator");
  const reviewerAudit = await check(`/api/campaigns/${review.id}/audit`, { role: "reviewer" });
  assert.equal(reviewerAudit.at(-1).proposal.evidence.model, "Link 2");
  await change(review, "publish", "operator", 403);
  const returned = await change(review, "return", "reviewer");
  const left = await change(returned, "submit", "operator");
  const right = await change(await create(), "submit", "operator");
  const attempts = await Promise.all([left, right].map((draft) => {
    const { path, options } = transition(draft, "publish", "reviewer");
    return call(path, options);
  }));
  assert.deepEqual(attempts.map(({ status }) => status).sort(), [200, 409]);
  assert.equal(attempts.find(({ status }) => status === 409).data.code, "SAME_PRIORITY_WINDOW_CONFLICT");
  const live = attempts.find(({ status }) => status === 200).data;
  assert.equal((await winner("u01")).id, live.id);
  assert.equal((await winner("u02")).id, "baseline");
  assert.equal(await winner("u01", demo.endsAt), null);
  const audits = await check(`/api/campaigns/${live.id}/audit`);
  assert.equal(audits.at(-1).action, "publish");
  assert.equal(audits.filter(({ action }) => action === "publish").length, 1);
  await change(live, "offline", "reviewer");
  assert.equal((await winner("u01")).id, "baseline");
  console.log("PASS: preview, AI proposal isolation, roles, revision, concurrent publish, audit and fallback.");
} finally {
  lines.close();
  if (child.exitCode === null && child.signalCode === null) child.kill();
  await closed;
  if (created.length || proposalId) {
    const sql = await mysql.createConnection({ host: env.DB_HOST || "127.0.0.1", port: Number(env.DB_PORT || 3308),
      user: env.DB_USER || "workshop", password: env.DB_PASSWORD, database });
    try {
      await sql.beginTransaction();
      for (const id of created) {
        await sql.execute("DELETE FROM campaign_audit WHERE campaign_id = ?", [id]);
        await sql.execute("DELETE FROM campaigns WHERE id = ?", [id]);
      }
      if (proposalId) await sql.execute("DELETE FROM ai_proposals WHERE id = ?", [proposalId]);
      await sql.commit();
    } finally {
      await sql.end();
    }
  }
}
