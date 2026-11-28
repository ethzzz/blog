import { isDeepStrictEqual } from "node:util";
import { readFile } from "node:fs/promises";
import { createAssistant } from "./assistant.mjs";

const cases = JSON.parse(await readFile(new URL("./eval-cases.json", import.meta.url), "utf8"));
const suggest = createAssistant(process.env);
const results = [];
for (const sample of cases) {
  const start = performance.now();
  try {
    const result = await suggest(sample.brief, AbortSignal.timeout(20_000));
    const wrong = Object.entries(sample.expected).filter(([key, value]) => !isDeepStrictEqual(result.patch[key], value)).map(([key]) => key);
    const invented = (sample.missing ?? []).filter((key) => Object.hasOwn(result.patch, key));
    const questionOk = !sample.question || result.questions.some((question) => question.includes(sample.question));
    results.push({ name: sample.name, ok: !wrong.length && !invented.length && questionOk, wrong, invented, questionOk,
      ms: Math.round(performance.now() - start), promptVersion: result.promptVersion });
  } catch (error) {
    results.push({ name: sample.name, ok: false, error: error.message, ms: Math.round(performance.now() - start) });
  }
}
const passed = results.filter((result) => result.ok).length;
console.log(JSON.stringify({ passed, total: results.length, results }, null, 2));
if (!results.length || passed !== results.length) process.exitCode = 1;
