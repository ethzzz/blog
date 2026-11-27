import { access, writeFile } from "node:fs/promises";

const files = [
  ["server.mjs", "db.mjs", "http.mjs", "model.mjs", "sse.mjs", "index.html", "app.mjs", "smoke.mjs",
    "package.json", "package-lock.json", "compose.yaml", "init-dev.sql", "dev.env.example"],
  ["rag.mjs"],
  ["agent.mjs", "mcp.mjs"],
  ["media.mjs"],
  ["ops.mjs", "config.env.example", "evaluate.mjs", "eval-cases.json"],
];
const stage = Number(process.argv[2]);
if (!Number.isInteger(stage) || stage < 1 || stage > files.length) throw new Error("Usage: node setup.mjs 1–5 [base URL]");
const base = new URL(process.argv[3] ?? "https://haolo.cloud/blog/ai-app-workshop/");
for (const name of files.slice(0, stage).flat()) {
  try {
    await access(name);
    console.log(`Kept existing ${name}`);
    continue;
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
  const download = name === "index.html" ? "index.html.txt" : name;
  const response = await fetch(new URL(download, base), { signal: AbortSignal.timeout(15_000) });
  if (!response.ok) throw new Error(`Download failed: ${name} (${response.status})`);
  try {
    await writeFile(name, await response.text(), { flag: "wx" });
    console.log(`Saved ${name}`);
  } catch (error) {
    if (error.code !== "EEXIST") throw error;
    console.log(`Kept existing ${name}`);
  }
}
