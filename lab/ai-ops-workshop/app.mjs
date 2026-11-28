const $ = (id) => document.getElementById(id);
const element = (tag, text) => Object.assign(document.createElement(tag), { textContent: text });
const option = (label, value) => Object.assign(element("option", label), { value });
const time = () => $("preview-time").value.trim();
let key = "";
let catalog;
let selected;
let proposal;
let before;
let working = false;
let formChanged = false;
let appliedId;

function editable() {
  return catalog.role === "operator" && (!selected || selected.status === "draft");
}

function action(run) {
  return async (event) => {
    event?.preventDefault();
    if (working) return;
    working = true;
    $("status").textContent = "处理中…";
    try {
      $("status").textContent = await run() ?? "";
    } catch (error) {
      $("status").textContent = error.message;
    } finally {
      working = false;
    }
  };
}

async function api(path, method = "GET", payload, token = key) {
  const response = await fetch(path, {
    method, headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: payload === undefined ? undefined : JSON.stringify(payload),
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.code ?? `HTTP ${response.status}`);
  return result;
}

function read() {
  if (!editable()) return selected?.config ?? catalog.demo;
  const data = new FormData($("config"));
  return {
    name: data.get("name"), headline: data.get("headline"), assetId: data.get("assetId"),
    models: data.getAll("models"), minAppVersion: data.get("minAppVersion"),
    activatedOnly: data.has("activatedOnly"), unguidedOnly: data.has("unguidedOnly"),
    startsAt: data.get("startsAt"), endsAt: data.get("endsAt"), priority: Number(data.get("priority")),
  };
}

function fill(values) {
  for (const [field, value] of Object.entries(values)) {
    const input = $("config").elements.namedItem(field);
    if (!input) continue;
    if (input instanceof HTMLSelectElement && input.multiple) {
      for (const opt of input.options) opt.selected = value.includes(opt.value);
    } else if (input.type === "checkbox") input.checked = value;
    else input.value = value;
  }
}

function showActions() {
  const { role } = catalog;
  const status = selected?.status;
  const buttons = role === "operator" && status === "draft" ? [["submit", "提交审核"]]
    : role === "reviewer" && status === "in_review" ? [["return", "退回"], ["publish", "发布"]]
    : role === "reviewer" && status === "published" && selected.id !== "baseline" ? [["offline", "下线"]] : [];
  $("actions").replaceChildren(...buttons.map(([command, title]) => {
    const control = element("button", title);
    control.onclick = action(async () => {
      if (command === "submit" && formChanged) throw new Error("请先保存当前表单中的修改。");
      const item = await api(`/api/campaigns/${selected.id}/transition`, "POST", { action: command, revision: selected.revision });
      await refresh(item.id);
      return `活动状态已更新为 ${item.status}。`;
    });
    return control;
  }));
  for (const input of $("config").elements) input.disabled = !editable();
  $("assistant").querySelector("button").disabled = role !== "operator";
  $("apply").hidden = catalog.role !== "operator" || $("save").disabled || !proposal;
}

async function refresh(id = selected?.id) {
  const rows = await api("/api/campaigns");
  $("selection").replaceChildren(option("新草稿", ""), ...rows.map((row) =>
    option(`${row.config.name} · ${row.status}`, row.id)));
  selected = rows.find((row) => row.id === id);
  before = undefined;
  proposal = undefined;
  appliedId = undefined;
  formChanged = false;
  $("suggestion").textContent = "";
  $("summary").textContent = "";
  $("preview-rows").replaceChildren();
  $("selection").value = selected?.id ?? "";
  fill(selected?.config ?? catalog.demo);
  $("revision").textContent = selected ? `状态 ${selected.status} · 修订 ${selected.revision}` : "尚未保存";
  showActions();
  const audit = selected ? await api(`/api/campaigns/${selected.id}/audit`) : [];
  const latest = audit.at(-1);
  $("audit").textContent = audit.map((row) => `#${row.revision} ${row.actor} · ${row.action} · ${row.snapshot.status}`).join("\n");
  if (latest?.proposal) {
    $("audit").textContent += `\n\n关联需求\n${latest.brief}\n\n原始 AI 建议\n${JSON.stringify(latest.proposal, null, 2)}`;
  }
}

$("login").onsubmit = action(async () => {
  const supplied = $("secret").value;
  const next = await api("/api/catalog", "GET", undefined, supplied);
  key = supplied;
  catalog = next;
  $("secret").value = "";
  $("config").elements.assetId.replaceChildren(...catalog.materials.filter((item) => item.approved)
    .map((item) => option(item.name, item.id)));
  $("config").elements.models.replaceChildren(...catalog.models.map((model) => option(model, model)));
  $("user").replaceChildren(...catalog.audience.map(({ id }) => option(id, id)));
  $("preview-time").value = catalog.demoTime;
  await refresh(selected?.id);
  $("workspace").hidden = false;
  return `当前身份 ${catalog.role}。`;
});
$("selection").onchange = action(() => refresh($("selection").value));
$("new").onclick = action(() => refresh(""));
$("refresh").onclick = action(() => refresh($("selection").value));
$("config").oninput = () => { formChanged = true; };
$("config").onsubmit = action(async () => {
  const config = read();
  const result = selected
    ? await api(`/api/campaigns/${selected.id}`, "PATCH", { config, revision: selected.revision, proposalId: appliedId })
    : await api("/api/campaigns", "POST", { config, proposalId: appliedId });
  await refresh(result.id);
  return "草稿已保存。";
});
$("assistant").onsubmit = action(async () => {
  proposal = undefined;
  $("suggestion").textContent = "";
  showActions();
  proposal = await api("/api/ai/suggest", "POST", { brief: $("brief").value });
  $("suggestion").textContent = JSON.stringify(proposal, null, 2);
  showActions();
  return "建议已生成。检查证据和待确认项后，再应用到表单。";
});
$("apply").onclick = action(() => {
  before = read();
  fill(proposal.patch);
  appliedId = proposal.id;
  formChanged = true;
  return "已更新表单。可以先预演，再保存。";
});

async function showPreview(withDiff) {
  if (withDiff && !before) throw new Error("请先应用一次 AI 建议。");
  const data = await api(withDiff ? "/api/compare" : "/api/preview", "POST", {
    config: read(), before: withDiff ? before : undefined, at: time(), excludeId: selected?.id,
  });
  const matched = data.rows.filter((row) => row.matched).length;
  const wins = data.rows.filter((row) => row.wouldWin).length;
  $("summary").textContent = `命中 ${matched} 人，预计获胜 ${wins} 人。\n` +
    (data.conflicts.length ? `存在同优先级排期冲突（${data.conflicts.length} 条）。` : "") +
    (data.delta ? `新增 ${data.delta.added.join("、") || "无"}，移除 ${data.delta.removed.join("、") || "无"}。` : "");
  $("preview-rows").replaceChildren(...data.rows.map((row) => {
    const tr = document.createElement("tr");
    tr.append(...[row.id, row.matched ? "命中" : "排除", row.wouldWin ? "是" : "否", row.reasons.join("、") || "—"]
      .map((value) => element("td", value)));
    return tr;
  }));
}

$("preview").onclick = action(() => showPreview(false));
$("diff").onclick = action(() => showPreview(true));
$("resolve").onclick = action(async () => {
  const result = await api(`/api/resolve?${new URLSearchParams({ user: $("user").value, at: time() })}`);
  $("winner").textContent = result ? `当前素材 ${result.headline} ` : "此时没有符合条件的活动。";
  if (result?.path) {
    const link = element("a", "打开演练素材");
    link.href = result.path;
    $("winner").append(link);
  }
});
