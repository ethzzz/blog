import { readFileSync } from "node:fs";

const base = new URL(process.env.EVAL_ORIGIN ?? "http://127.0.0.1:8787");
const primary = process.env.EVAL_KEY ?? "alice-local";
const secondary = process.env.EVAL_OTHER_KEY ?? "bob-local";
if (base.hostname !== "127.0.0.1" || base.protocol !== "http:") {
  throw new Error("Use a dedicated local evaluation server");
}
const fixture = JSON.parse(readFileSync(new URL("./eval-cases.json", import.meta.url), "utf8"));

async function request(path, { method = "GET", body, key = primary } = {}) {
  const response = await fetch(new URL(path, base), {
    method, headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: body && JSON.stringify(body), signal: AbortSignal.timeout(30_000),
  });
  const result = await response.json();
  if (!response.ok) throw new Error(`${path}: ${result.code ?? response.status}`);
  return result;
}

const document = await request("/api/documents", { method: "POST", body: fixture.document });
const results = [];
try {
  for (const sample of fixture.cases) {
    const start = performance.now();
    const answerable = sample.expected !== null;
    try {
      const result = await request("/api/ask", {
        method: "POST", body: { text: sample.text }, key: sample.otherUser ? secondary : primary,
      });
      const evidence = result.citations.some(({ id }) => id === document.id);
      const ok = answerable ? !result.abstained && evidence && result.answer.includes(sample.expected)
        : result.abstained && result.citations.length === 0;
      results.push({ name: sample.name, answerable, evidence, ok, promptVersion: result.promptVersion,
        ms: Math.round(performance.now() - start), answer: result.answer });
    } catch (error) {
      results.push({ name: sample.name, answerable, evidence: false, ok: false,
        ms: Math.round(performance.now() - start), error: error.message });
    }
  }
} finally {
  await request(`/api/document?id=${encodeURIComponent(document.id)}`, { method: "DELETE" });
}
const answerable = results.filter((sample) => sample.answerable);
const refusals = results.filter((sample) => !sample.answerable);
const ratio = (rows, field) => rows.length ? rows.filter((row) => row[field]).length / rows.length : null;
console.log(JSON.stringify({
  passRate: ratio(results, "ok"),
  expectedCitationRate: ratio(answerable, "evidence"),
  refusalAccuracy: ratio(refusals, "ok"),
  averageMs: Math.round(results.reduce((sum, sample) => sum + sample.ms, 0) / Math.max(1, results.length)),
  results,
}, null, 2));
if (!results.length || results.some((sample) => !sample.ok)) process.exitCode = 1;
