import { buildAssistantRequestBody } from "@/lib/assistant/assistant-guardrails";
import type { AssistantRequest } from "@/lib/assistant/assistant-types";

const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";

/**
 * POST /api/assistant
 *
 * AI advisor endpoint. Accepts chat messages + a deterministic context snapshot, then
 * streams an explanation/draft back as plain text. The AI explains results and drafts
 * document text only — all tax numbers come from the deterministic engine (in the context);
 * the AI never computes or alters them (enforced by ASSISTANT_SYSTEM_PROMPT).
 *
 * The Anthropic API key stays server-side (ANTHROPIC_API_KEY). User chat content is not
 * logged here. Returns 503 when the key is not configured so the UI can degrade gracefully.
 */
export async function POST(request: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return Response.json(
      { error: "AI-помощник не настроен (нет ключа на сервере)." },
      { status: 503 },
    );
  }

  let body: AssistantRequest;
  try {
    body = (await request.json()) as AssistantRequest;
  } catch {
    return Response.json({ error: "Некорректный запрос." }, { status: 400 });
  }

  if (!body || !Array.isArray(body.messages) || !body.context) {
    return Response.json({ error: "Ожидаются поля messages и context." }, { status: 400 });
  }

  const payload = buildAssistantRequestBody(body.messages, body.context);
  if (payload.messages.length === 0) {
    return Response.json({ error: "Пустой список сообщений." }, { status: 400 });
  }

  let upstream: Response;
  try {
    upstream = await fetch(ANTHROPIC_URL, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify(payload),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return Response.json({ error: `Не удалось обратиться к ИИ: ${message}` }, { status: 502 });
  }

  if (!upstream.ok || !upstream.body) {
    const detail = await upstream.text().catch(() => "");
    return Response.json(
      { error: `ИИ-сервис вернул ошибку (${upstream.status}).`, detail: detail.slice(0, 500) },
      { status: 502 },
    );
  }

  // Parse the Anthropic SSE stream and forward only text deltas as plain text.
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  let buffer = "";

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const reader = upstream.body!.getReader();
      try {
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";
          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed.startsWith("data:")) continue;
            const data = trimmed.slice(5).trim();
            if (data === "" || data === "[DONE]") continue;
            try {
              const event = JSON.parse(data);
              if (
                event.type === "content_block_delta" &&
                event.delta?.type === "text_delta" &&
                typeof event.delta.text === "string"
              ) {
                controller.enqueue(encoder.encode(event.delta.text));
              }
            } catch {
              // Ignore non-JSON keepalive lines.
            }
          }
        }
      } catch (err) {
        controller.error(err);
        return;
      }
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}
