import assert from "node:assert/strict";
import test from "node:test";
import { normalize } from "./assistant.mjs";
import { audience, demo, demoTime, fallback, materials } from "./fixtures.mjs";
import { compare, compareVersions, instant, overlaps, preview, resolve, validate } from "./rules.mjs";

test("版本按数字逐段比较，半开区间在结束时刻立即失效", () => {
  assert.ok(compareVersions("2.10.0", "2.5.0") > 0);
  assert.throws(() => instant("2026-02-30T00:00:00Z"), { message: "INVALID_DATE" });
  assert.equal(overlaps(demo, { ...demo, startsAt: demo.endsAt, endsAt: "2026-12-05T00:00:00Z" }), false);
  assert.equal(preview(demo, audience, [], instant(demo.endsAt)).filter((row) => row.matched).length, 0);
});

test("六个用户的排除理由与修改后的获胜差异可复算", () => {
  const live = [{ id: "baseline", config: fallback }];
  const before = preview(demo, audience, live, instant(demoTime));
  assert.deepEqual(before.map(({ reasons }) => reasons), [
    [], ["APP_VERSION_TOO_LOW"], [], ["NOT_ACTIVATED"], ["ALREADY_GUIDED"], ["MODEL_MISMATCH"],
  ]);
  assert.deepEqual(before.filter((row) => row.wouldWin).map(({ id }) => id), ["u01", "u03"]);
  assert.equal(resolve(live, audience[0], instant(demoTime)).id, "baseline");
  assert.deepEqual(compare(before, preview({ ...demo, minAppVersion: "2.4.0" }, audience, live, instant(demoTime))),
    { added: ["u02"], removed: [] });
});

test("无效素材、模型伪造证据及版本改写会被拒绝", () => {
  assert.throws(() => validate({ ...demo, assetId: "draft-sale" }, materials), { message: "ASSET_UNAVAILABLE_FOR_MODELS" });
  assert.throws(() => validate({ ...demo, models: ["LINK2C"] }, materials), { message: "ASSET_UNAVAILABLE_FOR_MODELS" });
  assert.throws(() => normalize({ fields: [{ field: "model", value: "LINK3", evidence: "Link 3" }], headline: "" }, "仅 Link 2"),
    { message: "INVALID_MODEL_EVIDENCE" });
  assert.throws(() => normalize({ fields: [{ field: "minAppVersion", value: "2.0.0", evidence: "至少 2.5.0" }], headline: "" }, "至少 2.5.0"),
    { message: "MODEL_VALUE_NOT_SUPPORTED_BY_EVIDENCE" });
});
