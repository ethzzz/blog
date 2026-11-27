import { events } from "./sse.mjs";

const $ = (id) => document.getElementById(id);
const values = (form) => Object.fromEntries(new FormData(form));
const el = (tag, text) => Object.assign(document.createElement(tag), { textContent: text });
const button = (text, action) => {
  const element = el("button", text);
  element.type = "button";
  element.onclick = protect(action);
  return element;
};
let key = "";
let stage = 1;
let chatController;
let proposal;

function protect(action) {
  return async (event) => {
    event?.preventDefault();
    $("status").textContent = "";
    try {
      await action(event);
    } catch (error) {
      $("status").textContent = error.name === "AbortError" ? "已停止生成。" : error.message;
    }
  };
}

async function request(path, options = {}) {
  const { data, ...init } = options;
  const headers = { Authorization: `Bearer ${key}`, ...init.headers };
  if (data) {
    headers["Content-Type"] = "application/json";
    init.body = JSON.stringify(data);
  }
  const response = await fetch(path, { ...init, headers });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(`${error.code ?? response.status}${error.requestId ? `（请求 ${error.requestId}）` : ""}`);
  }
  return response;
}
const api = async (path, options) => (await request(path, options)).json();
const post = (path, data) => api(path, { method: "POST", data });

function message(role, text, status) {
  return el("p", `${role === "user" ? "你" : "助手"}：${text}${status === "interrupted" ? "（已中断）" : ""}`);
}

async function refreshMessages() {
  const id = $("conversations").value;
  const rows = id ? await api(`/api/messages?id=${encodeURIComponent(id)}`) : [];
  if (id !== $("conversations").value) return;
  $("messages").replaceChildren(...rows.map(({ role, text, status }) => message(role, text, status)));
}

async function refreshChats(id = $("conversations").value) {
  const rows = await api("/api/conversations");
  $("conversations").replaceChildren(...rows.map((row) => Object.assign(el("option", row.title), { value: row.id })));
  if (rows.some((row) => row.id === id)) $("conversations").value = id;
  await refreshMessages();
}

async function viewDocument(id) {
  const item = await api(`/api/document?id=${encodeURIComponent(id)}`);
  $("source").textContent = `${item.title}\n\n${item.text}`;
}

async function refreshDocuments() {
  const rows = await api("/api/documents");
  $("documents").replaceChildren(...rows.flatMap(({ id, title }) => [
    button(title, () => viewDocument(id)),
    button(`删除「${title}」`, async () => {
      if (!window.confirm(`删除「${title}」？`)) return;
      await api(`/api/document?id=${encodeURIComponent(id)}`, { method: "DELETE" });
      $("source").textContent = "";
      $("answer").textContent = "";
      $("citations").replaceChildren();
      await refreshDocuments();
    }),
  ]));
}

async function refreshTasks() {
  const tasks = await api("/api/tasks");
  $("tasks").replaceChildren(...tasks.map(({ title }) => el("li", title)));
}

async function refreshUsage() {
  const usage = await api("/api/usage");
  $("usage-summary").textContent = `今日（UTC）请求 ${usage.requests}/${usage.dailyLimit}，已采集 token ${usage.recordedTokens}（${usage.requestsWithUsage} 条请求返回用量），平均耗时 ${usage.averageMs ?? "—"} ms。`;
  $("runs").replaceChildren(...usage.recent.map((run) => {
    const row = el("div", `${run.path} · ${run.status} · ${run.duration ?? "—"} ms `);
    if (run.status === "ok") {
      for (const [rating, title] of [[1, "有帮助"], [-1, "待改进"]]) {
        row.append(button(run.rating === rating ? `${title} ✓` : title, async () => {
          await post("/api/feedback", { id: run.id, rating });
          await refreshUsage();
        }));
      }
    }
    return row;
  }));
}

$("auth").onsubmit = protect(async () => {
  key = $("key").value;
  stage = (await api("/api/health")).stage;
  await refreshChats();
  for (const panel of document.querySelectorAll("[data-stage]")) panel.hidden = Number(panel.dataset.stage) > stage;
  if (stage >= 2) await refreshDocuments();
  if (stage >= 3) await refreshTasks();
  if (stage >= 5) await refreshUsage();
  $("auth").hidden = true;
  $("key").value = "";
  $("workspace").hidden = false;
});
$("new-chat").onsubmit = protect(async ({ currentTarget: form }) => {
  if (chatController) return;
  const { id } = await post("/api/conversations", values(form));
  form.reset();
  await refreshChats(id);
});
$("conversations").onchange = protect(refreshMessages);
$("stop").onclick = () => chatController?.abort();
$("chat").onsubmit = protect(async ({ currentTarget: form }) => {
  const id = $("conversations").value;
  if (!id) throw new Error("请先新建会话。");
  if (chatController) return;
  const { text } = values(form);
  chatController = new AbortController();
  $("send").disabled = $("conversations").disabled = $("new-chat").querySelector("button").disabled = true;
  $("stop").disabled = false;
  let output = "";
  let completed = false;
  let answer;
  try {
    const response = await request("/api/chat", {
      method: "POST", data: { id, text }, signal: chatController.signal,
    });
    $("messages").append(message("user", text));
    answer = message("assistant", "");
    $("messages").append(answer);
    for await (const frame of events(response.body)) {
      const value = JSON.parse(frame.data);
      if (frame.type === "error") throw new Error(value.code);
      if (frame.type === "done") {
        completed = true;
        if ($("question").value === text) form.reset();
        break;
      }
      if (frame.type === "delta") {
        output += value.text;
        answer.textContent = `助手：${output}`;
      }
    }
    if (!completed) throw new Error("生成中断，请刷新会话确认已保存的内容。");
  } finally {
    if (answer && !completed) answer.textContent = `助手：${output}（已中断）`;
    chatController = undefined;
    $("send").disabled = $("conversations").disabled = $("new-chat").querySelector("button").disabled = false;
    $("stop").disabled = true;
  }
});
$("import-doc").onsubmit = protect(async ({ currentTarget: form }) => {
  await post("/api/documents", values(form));
  form.reset();
  await refreshDocuments();
});
$("ask").onsubmit = protect(async ({ currentTarget: form }) => {
  const result = await post("/api/ask", values(form));
  $("answer").textContent = result.answer;
  $("source").textContent = "";
  $("citations").replaceChildren(...result.citations.map(({ title, id, part, excerpt }) => {
    const item = el("li", excerpt);
    item.append(" ", button(`${title} · 片段 ${part}`, () => viewDocument(id)));
    return item;
  }));
});
$("agent").onsubmit = protect(async ({ currentTarget: form }) => {
  proposal = undefined;
  $("confirm").hidden = true;
  const result = await post("/api/agent", values(form));
  proposal = result.proposal;
  $("plan").textContent = `${result.answer} ${proposal?.title ?? ""} ${result.trace.join(" → ")}`;
  $("confirm").hidden = !proposal;
});
$("confirm").onclick = protect(async () => {
  const pending = proposal;
  if (!pending) return;
  await post("/api/tasks/confirm", { id: pending.id });
  if (proposal === pending) {
    proposal = undefined;
    $("confirm").hidden = true;
    $("plan").textContent = `已创建「${pending.title}」。`;
  }
  await refreshTasks();
});
$("media").onsubmit = protect(async ({ currentTarget: form }) => {
  const { file, question } = values(form);
  const type = /\.wav$/i.test(file.name) ? "audio/wav" : file.type;
  const result = await api("/api/media", {
    method: "POST", headers: { "Content-Type": type, "X-Media-Question": encodeURIComponent(question) }, body: file,
  });
  $("media-result").textContent = result.text;
  $("use-media").hidden = false;
});
$("use-media").onclick = () => {
  $("question").value = $("media-result").textContent.slice(0, 2000);
  $("question").focus();
};
$("refresh-usage").onclick = protect(refreshUsage);
