import type { AssistantContext, AssistantMessage } from "@/lib/assistant/assistant-types";

export interface StreamAssistantOptions {
  messages: AssistantMessage[];
  context: AssistantContext;
  /** Called with each incremental text chunk as it streams in. */
  onChunk: (text: string) => void;
  signal?: AbortSignal;
}

/**
 * Call /api/assistant and stream the plain-text response, invoking onChunk per chunk.
 * Throws with a readable message on HTTP errors (e.g. 503 when the advisor isn't configured).
 */
export async function streamAssistant(options: StreamAssistantOptions): Promise<void> {
  const res = await fetch("/api/assistant", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ messages: options.messages, context: options.context }),
    signal: options.signal,
  });

  if (!res.ok || !res.body) {
    let message = `Ошибка ИИ-помощника (${res.status}).`;
    try {
      const data = await res.json();
      if (data?.error) message = data.error;
    } catch {
      // Non-JSON error body — keep the default message.
    }
    throw new Error(message);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    options.onChunk(decoder.decode(value, { stream: true }));
  }
}
