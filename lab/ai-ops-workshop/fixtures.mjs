export const models = ["LINK2", "LINK2C", "LINK3"];

export const audience = [
  { id: "u01", model: "LINK2", appVersion: "2.5.0", activated: true, guided: false },
  { id: "u02", model: "LINK2", appVersion: "2.4.9", activated: true, guided: false },
  { id: "u03", model: "LINK2", appVersion: "2.10.0", activated: true, guided: false },
  { id: "u04", model: "LINK2", appVersion: "2.5.0", activated: false, guided: false },
  { id: "u05", model: "LINK2", appVersion: "2.5.0", activated: true, guided: true },
  { id: "u06", model: "LINK2C", appVersion: "2.5.0", activated: true, guided: false },
];

export const materials = [
  { id: "guide-link2", name: "Link 2 新手教程", path: "/help/link2", models: ["LINK2"], approved: true },
  { id: "guide-all", name: "通用帮助中心", path: "/help/start", models, approved: true },
  { id: "draft-sale", name: "优惠活动草稿", path: "/help/start", models, approved: false },
];

export const demoTime = "2026-12-03T04:00:00Z";
export const demo = {
  name: "Link 2 新手引导",
  headline: "跟着教程完成 Link 2 设置",
  assetId: "guide-link2",
  models: ["LINK2"],
  minAppVersion: "2.5.0",
  activatedOnly: true,
  unguidedOnly: true,
  startsAt: "2026-12-01T00:00:00Z",
  endsAt: "2026-12-04T12:00:00Z",
  priority: 20,
};

export const fallback = {
  ...demo,
  name: "通用引导",
  headline: "浏览帮助中心",
  assetId: "guide-all",
  models,
  minAppVersion: "2.0.0",
  activatedOnly: false,
  unguidedOnly: false,
  priority: 10,
};
