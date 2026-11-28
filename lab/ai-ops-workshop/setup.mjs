import { access, writeFile } from "node:fs/promises";

const base = new URL(process.argv[2] ?? "https://haolo.cloud/blog/ai-ops-workshop/");
const files = ["package.json", "package-lock.json", "dev.env.example", "compose.yaml", "init-dev.sql",
  "fixtures.mjs", "rules.mjs", "db.mjs", "assistant.mjs", "server.mjs", "index.html",
  "app.mjs", "rules.test.mjs", "eval-cases.json", "eval.mjs", "smoke.mjs"];

for (const file of files) {
  try {
    await access(file);
    console.log(`Kept ${file}`);
    continue;
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
  const name = file === "index.html" ? "index.html.txt" : file;
  const response = await fetch(new URL(name, base), { signal: AbortSignal.timeout(15_000) });
  if (!response.ok) throw new Error(`Download failed: ${name} (${response.status})`);
  await writeFile(file, await response.text(), { flag: "wx" });
  console.log(`Saved ${file}`);
}
