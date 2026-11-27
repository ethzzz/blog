import { bytes, fail, json, label } from "./http.mjs";

const formats = {
  "image/png": (data) => data.length >= 24 && data.subarray(0, 8).equals(Buffer.from("89504e470d0a1a0a", "hex")),
  "image/jpeg": (data) => data.length >= 4 && data.subarray(0, 3).equals(Buffer.from("ffd8ff", "hex")),
  "audio/wav": (data) => data.length >= 44 && data.toString("ascii", 0, 4) === "RIFF" &&
    data.toString("ascii", 8, 12) === "WAVE",
};

export function install({ model, register }) {
  register("POST", "/api/media", async ({ req, res, signal, usage }) => {
    const type = req.headers["content-type"];
    if (!Object.hasOwn(formats, type)) fail(415, "UNSUPPORTED_MEDIA");
    const audio = type === "audio/wav";
    let question = "描述这张图片。";
    if (!audio && req.headers["x-media-question"]) {
      try {
        question = decodeURIComponent(req.headers["x-media-question"]);
      } catch {
        fail(400, "INVALID_MEDIA_QUESTION");
      }
      question = label(question, 300);
    }
    const data = await bytes(req, 2 * 1024 * 1024);
    if (!formats[type](data)) fail(415, "INVALID_MEDIA_SIGNATURE");
    signal.throwIfAborted();
    let text;
    if (audio) {
      text = model.transcribe
        ? await model.transcribe(new Blob([data], { type }), "recording.wav", signal, usage)
        : "演练转写：请查看团队发布流程。";
    } else {
      text = model.describe
        ? await model.describe(`data:${type};base64,${data.toString("base64")}`, question, signal, usage)
        : `演练识图：已读取 ${type}，问题是「${question}」。`;
    }
    if (typeof text !== "string" || !text.trim() || text.length > 20_000) fail(502, "INVALID_MEDIA_RESULT");
    json(res, { kind: audio ? "transcript" : "description", text });
  }, true);
}
