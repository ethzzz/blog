import { setTimeout as delay } from "node:timers/promises";
import { events } from "./sse.mjs";

export function createModel(env) {
  if (env.AI_PROVIDER !== "compatible") {
    if (env.AI_PROVIDER && env.AI_PROVIDER !== "mock") throw new Error("INVALID_PROVIDER");
    return { name: "mock", async *stream({ messages, signal }) {
      const text = messages.at(-1).content;
      for (const piece of `演练回复：${text}`.match(/.{1,4}/gsu)) {
        await delay(40, undefined, { signal });
        yield { text: piece };
      }
    } };
  }

  const base = new URL(env.AI_BASE_URL ?? "https://api.openai.com/v1/");
  if (!base.pathname.endsWith("/")) base.pathname += "/";
  if (base.protocol !== "https:" && !(base.protocol === "http:" && base.hostname === "127.0.0.1")) {
    throw new Error("INVALID_PROVIDER_URL");
  }
  if (!env.AI_API_KEY || !env.AI_CHAT_MODEL) throw new Error("MISSING_PROVIDER_CONFIG");

  const request = async (path, payload, signal) => {
    const form = payload instanceof FormData;
    const headers = { Authorization: `Bearer ${env.AI_API_KEY}` };
    if (!form) headers["Content-Type"] = "application/json";
    const response = await fetch(new URL(path, base), {
      method: "POST", headers, signal, redirect: "error",
      body: form ? payload : JSON.stringify(payload),
    });
    if (!response.ok) {
      await response.body?.cancel();
      throw new Error(`PROVIDER_HTTP_${response.status}`);
    }
    return response;
  };

  const complete = async ({ messages, tools, model, signal, usage }) => {
    const response = await request("chat/completions", {
      model: model ?? env.AI_CHAT_MODEL, messages, tools, max_completion_tokens: 800,
    }, signal);
    const result = await response.json();
    usage?.(result.usage);
    const choice = result.choices?.[0];
    if (!choice?.message || choice.finish_reason === "length") throw new Error("INCOMPLETE_COMPLETION");
    return choice.message;
  };

  return {
    name: env.AI_CHAT_MODEL, complete,
    embeddingId: env.AI_EMBED_MODEL ? `${base.origin}${base.pathname}:${env.AI_EMBED_MODEL}` : null,
    async *stream({ messages, signal }) {
      const response = await request("chat/completions", {
        model: env.AI_CHAT_MODEL, messages, stream: true, max_completion_tokens: 800,
        stream_options: { include_usage: true },
      }, signal);
      if (!response.body || !response.headers.get("content-type")?.includes("text/event-stream")) {
        await response.body?.cancel();
        throw new Error("EXPECTED_PROVIDER_SSE");
      }
      for await (const frame of events(response.body)) {
        if (frame.data === "[DONE]") return;
        const result = JSON.parse(frame.data);
        if (result.error || result.choices?.[0]?.finish_reason === "length") throw new Error("INCOMPLETE_STREAM");
        if (typeof result.choices?.[0]?.delta?.content === "string") {
          yield { text: result.choices[0].delta.content };
        }
        if (result.usage) yield { usage: result.usage };
      }
      throw new Error("PROVIDER_STREAM_CLOSED");
    },
    async embed(texts, signal, usage) {
      if (!env.AI_EMBED_MODEL) throw new Error("MISSING_EMBEDDING_MODEL");
      const response = await request("embeddings", { model: env.AI_EMBED_MODEL, input: texts }, signal);
      const result = await response.json();
      usage?.(result.usage);
      return result.data.sort((a, b) => a.index - b.index).map(({ embedding }) => embedding);
    },
    async describe(image, question, signal, usage) {
      if (!env.AI_VISION_MODEL) throw new Error("MISSING_VISION_MODEL");
      const result = await complete({
        model: env.AI_VISION_MODEL, signal, usage,
        messages: [{ role: "user", content: [
          { type: "text", text: question },
          { type: "image_url", image_url: { url: image } },
        ] }],
      });
      return result.content;
    },
    async transcribe(blob, filename, signal, usage) {
      if (!env.AI_AUDIO_MODEL) throw new Error("MISSING_AUDIO_MODEL");
      const form = new FormData();
      form.set("model", env.AI_AUDIO_MODEL);
      form.set("file", blob, filename);
      const result = await (await request("audio/transcriptions", form, signal)).json();
      if (result.usage?.type === "tokens") usage(result.usage);
      return result.text;
    },
  };
}
