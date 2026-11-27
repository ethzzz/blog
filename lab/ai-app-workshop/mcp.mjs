import { createInterface } from "node:readline";
import { listTasks } from "./agent.mjs";
import { connect } from "./db.mjs";

// The operator sets this identity when launching the local subprocess.
const owner = process.env.MCP_OWNER;
const { MCP_DB_USER, MCP_DB_PASSWORD } = process.env;
if (!owner || !MCP_DB_USER || !MCP_DB_PASSWORD) {
  throw new Error("Set MCP_OWNER and the MySQL read-only account (MCP_DB_USER/MCP_DB_PASSWORD)");
}
const db = connect(process.env, { user: MCP_DB_USER, password: MCP_DB_PASSWORD });
const version = "2025-11-25";
let phase = "new";
const lines = createInterface({ input: process.stdin, crlfDelay: Infinity });
const send = (message) => process.stdout.write(JSON.stringify({ jsonrpc: "2.0", ...message }) + "\n");

for await (const line of lines) {
  let request;
  try {
    request = JSON.parse(line);
  } catch {
    send({ id: null, error: { code: -32700, message: "Parse error" } });
    continue;
  }
  if (!request || request.jsonrpc !== "2.0" || typeof request.method !== "string") {
    send({ id: null, error: { code: -32600, message: "Invalid request" } });
    continue;
  }
  const { id, method, params } = request;
  if (id === undefined) {
    if (method === "notifications/initialized" && phase === "initializing") phase = "ready";
    continue;
  }
  const reply = (result) => send({ id, result });
  const reject = (code, message) => send({ id, error: { code, message } });
  try {
    if (method === "initialize" && phase === "new" && typeof params?.protocolVersion === "string" &&
        params.capabilities && params.clientInfo) {
      phase = "initializing";
      reply({ protocolVersion: version, capabilities: { tools: {} }, serverInfo: { name: "workshop-tasks", version: "1.0.0" } });
    } else if (method === "ping") {
      reply({});
    } else if (phase !== "ready") {
      reject(-32000, "Initialize first");
    } else if (method === "tools/list") {
      reply({ tools: [{ name: "list_tasks", description: "列出绑定用户的待办",
        inputSchema: { type: "object", properties: {}, additionalProperties: false },
        annotations: { readOnlyHint: true } }] });
    } else if (method === "tools/call") {
      const args = params?.arguments ?? {};
      if (params?.name !== "list_tasks" || typeof args !== "object" || Array.isArray(args) || Object.keys(args).length) {
        reject(-32602, "Expected list_tasks with empty arguments");
        continue;
      }
      reply({ content: [{ type: "text", text: JSON.stringify(await listTasks(db, owner)) }] });
    } else {
      reject(-32601, "Method not found");
    }
  } catch {
    reject(-32603, "Internal error");
  }
}
await db.close();
