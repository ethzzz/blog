import { body, fail, json, label } from "./http.mjs";
import { lockAccount } from "./db.mjs";

export async function install({ db, env, register, users }) {
  const perMinute = Number(env.REQUESTS_PER_MINUTE ?? 12);
  const perDay = Number(env.REQUESTS_PER_DAY ?? 100);
  if (![perMinute, perDay].every((n) => Number.isSafeInteger(n) && n > 0)) throw new Error("INVALID_QUOTA");
  await db.run(`CREATE TABLE IF NOT EXISTS runs (
    id CHAR(36) PRIMARY KEY,
    owner VARCHAR(32) NOT NULL,
    path VARCHAR(100) NOT NULL,
    started BIGINT NOT NULL,
    duration INTEGER,
    status VARCHAR(16) NOT NULL,
    tokens BIGINT NOT NULL DEFAULT 0,
    usage_samples INTEGER NOT NULL DEFAULT 0,
    INDEX (owner, started),
    FOREIGN KEY (owner) REFERENCES accounts(id) ON DELETE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin`);
  await db.run(`CREATE TABLE IF NOT EXISTS feedback (
    run_id CHAR(36) PRIMARY KEY,
    rating TINYINT NOT NULL CHECK (rating IN (-1, 1)),
    FOREIGN KEY (run_id) REFERENCES runs(id) ON DELETE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin`);
  for (const [owner] of users) {
    await db.run("UPDATE runs SET status = 'interrupted' WHERE owner = ? AND status = 'running'", owner);
  }
  const count = "SELECT count(*) AS n FROM runs WHERE owner = ? AND started >= ?";
  const reserve = async (owner, path, id) => {
    const started = await db.transaction(async (tx) => {
      await lockAccount(tx, owner);
      const now = Date.now();
      if ((await tx.one(count, owner, now - 60_000)).n >= perMinute) fail(429, "RATE_LIMIT");
      if ((await tx.one(count, owner, now - now % 86_400_000)).n >= perDay) fail(429, "DAILY_REQUEST_LIMIT");
      await tx.run("INSERT INTO runs (id, owner, path, started, status) VALUES (?, ?, ?, ?, 'running')",
        id, owner, path, now);
      return now;
    });
    let tokens = 0;
    let samples = 0;
    return {
      usage(data) {
        if (Number.isSafeInteger(data?.total_tokens) && data.total_tokens >= 0) {
          tokens += data.total_tokens;
          samples++;
        }
      },
      async finish(status) {
        const duration = Date.now() - started;
        await db.run("UPDATE runs SET duration = ?, status = ?, tokens = ?, usage_samples = ? WHERE id = ?",
          duration, String(status), tokens, samples, id);
        console.log(JSON.stringify({ requestId: id, path, duration, status, tokens, usageSamples: samples }));
      },
    };
  };
  register("GET", "/api/usage", async ({ owner, res }) => {
    const now = Date.now();
    const today = now - now % 86_400_000;
    const usage = await db.one(`
      SELECT count(*) AS requests, coalesce(sum(tokens), 0) AS recordedTokens,
        sum(CASE WHEN usage_samples > 0 THEN 1 ELSE 0 END) AS requestsWithUsage,
        round(avg(duration)) AS averageMs FROM runs WHERE owner = ? AND started >= ?
    `, owner, today);
    json(res, { ...usage, requestsWithUsage: usage.requestsWithUsage ?? 0, dailyLimit: perDay,
      recent: await db.all(`
        SELECT id, path, status, duration, tokens, usage_samples AS usageSamples, rating
        FROM runs LEFT JOIN feedback ON feedback.run_id = runs.id WHERE owner = ? ORDER BY started DESC, id DESC LIMIT 10
      `, owner) });
  });
  register("POST", "/api/feedback", async ({ owner, req, res }) => {
    const input = await body(req);
    const id = label(input.id, 64);
    if (![1, -1].includes(input.rating)) fail(400, "INVALID_RATING");
    if (!await db.one("SELECT 1 FROM runs WHERE id = ? AND owner = ? AND status = 'ok'", id, owner)) {
      fail(404, "RUN_NOT_FOUND");
    }
    await db.run("INSERT INTO feedback (run_id, rating) VALUES (?, ?) ON DUPLICATE KEY UPDATE rating = ?",
      id, input.rating, input.rating);
    json(res, { saved: true });
  });
  return { reserve };
}
