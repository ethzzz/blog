import { models } from "./fixtures.mjs";

export function fail(status, code) {
  throw Object.assign(new Error(code), { status });
}

export const isRecord = (value) => !!value && typeof value === "object" && !Array.isArray(value);
export const isVersion = (value) => typeof value === "string" && /^(0|[1-9]\d{0,3})(\.(0|[1-9]\d{0,3})){2}$/.test(value);

export function instant(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/.test(value)) {
    fail(400, "EXPECTED_UTC_TIMESTAMP");
  }
  const date = new Date(value);
  if (!Number.isFinite(+date) || date.toISOString() !== value.replace("Z", ".000Z")) fail(400, "INVALID_DATE");
  return +date;
}

function label(value, max) {
  return typeof value === "string" && value.trim().length > 0 && value.length <= max;
}

export function validate(source, catalog) {
  if (!isRecord(source)) fail(400, "EXPECTED_CONFIG");
  const { name, headline, assetId, models: selected, minAppVersion, activatedOnly, unguidedOnly, startsAt, endsAt, priority } = source;
  if (!label(name, 80) || !label(headline, 60) || !Array.isArray(selected) || !selected.length ||
      selected.some((model) => !models.includes(model)) || !isVersion(minAppVersion) ||
      typeof activatedOnly !== "boolean" || typeof unguidedOnly !== "boolean" ||
      !Number.isInteger(priority) || priority < 1 || priority > 99) fail(400, "INVALID_CONFIG");
  if (instant(startsAt) >= instant(endsAt)) fail(400, "INVALID_WINDOW");
  const asset = catalog.find((item) => item.id === assetId);
  if (!asset?.approved || selected.some((model) => !asset.models.includes(model))) fail(400, "ASSET_UNAVAILABLE_FOR_MODELS");
  return { name: name.trim(), headline: headline.trim(), assetId, models: [...new Set(selected)],
    minAppVersion, activatedOnly, unguidedOnly, startsAt, endsAt, priority };
}

export function compareVersions(left, right) {
  const a = left.split(".").map(Number);
  const b = right.split(".").map(Number);
  for (let i = 0; i < 3; i++) if (a[i] !== b[i]) return a[i] - b[i];
  return 0;
}

export function reasons(config, user, at) {
  const result = [];
  if (at < Date.parse(config.startsAt) || at >= Date.parse(config.endsAt)) result.push("OUTSIDE_WINDOW");
  if (!config.models.includes(user.model)) result.push("MODEL_MISMATCH");
  if (compareVersions(user.appVersion, config.minAppVersion) < 0) result.push("APP_VERSION_TOO_LOW");
  if (config.activatedOnly && !user.activated) result.push("NOT_ACTIVATED");
  if (config.unguidedOnly && user.guided) result.push("ALREADY_GUIDED");
  return result;
}

export function overlaps(left, right) {
  return Date.parse(left.startsAt) < Date.parse(right.endsAt) && Date.parse(right.startsAt) < Date.parse(left.endsAt);
}

export function resolve(campaigns, user, at) {
  return campaigns.filter(({ config }) => reasons(config, user, at).length === 0)
    .sort((a, b) => b.config.priority - a.config.priority || a.id.localeCompare(b.id))[0] ?? null;
}

export function preview(config, audience, published, at) {
  return audience.map((user) => {
    const blocked = reasons(config, user, at);
    const winner = resolve(published, user, at);
    return { id: user.id, reasons: blocked, matched: blocked.length === 0,
      wouldWin: blocked.length === 0 && (!winner || config.priority > winner.config.priority),
      currentWinner: winner?.id ?? null };
  });
}

export function compare(before, after) {
  const previously = new Set(before.filter((row) => row.wouldWin).map((row) => row.id));
  const next = new Set(after.filter((row) => row.wouldWin).map((row) => row.id));
  return { added: [...next].filter((id) => !previously.has(id)), removed: [...previously].filter((id) => !next.has(id)) };
}
