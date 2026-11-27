// Browser and Node share framing. Network chunks can split a UTF-8 character or CRLF.
export async function* events(body) {
  const reader = body.pipeThrough(new TextDecoderStream()).getReader();
  let buffer = "";
  let type = "message";
  let data = [];
  let size = 0;
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += value;
      while (true) {
        const end = buffer.search(/[\r\n]/);
        if (end < 0 || (buffer[end] === "\r" && end === buffer.length - 1)) break;
        const line = buffer.slice(0, end);
        buffer = buffer.slice(end + (buffer.slice(end, end + 2) === "\r\n" ? 2 : 1));
        if (!line) {
          if (data.length) yield { type, data: data.join("\n") };
          type = "message";
          data = [];
          size = 0;
          continue;
        }
        const colon = line.indexOf(":");
        const field = colon < 0 ? line : line.slice(0, colon);
        const text = colon < 0 ? "" : line.slice(colon + 1).replace(/^ /, "");
        if (field === "event") type = text || "message";
        if (field === "data") {
          size += text.length + 1;
          if (size > 1_048_576) throw new Error("SSE_EVENT_TOO_LARGE");
          data.push(text);
        }
      }
      if (buffer.length > 1_048_576) throw new Error("SSE_LINE_TOO_LARGE");
    }
    if (buffer === "\r" && data.length) yield { type, data: data.join("\n") };
  } finally {
    await reader.cancel().catch(() => {});
    reader.releaseLock();
  }
}
