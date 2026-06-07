import type { AssistantContext, AssistantMessage } from "@/lib/assistant/assistant-types";
import { buildAssistantContext } from "@/lib/assistant/build-assistant-context";

/**
 * System prompt for the AI advisor. Hard guardrails (enforced by instruction here and by
 * keeping all numbers in the deterministic context):
 * - The AI explains results and drafts document/declaration text ONLY.
 * - It NEVER computes, estimates, or alters tax numbers — every figure comes from the
 *   deterministic engine and is provided in the context block.
 * - Output is always framed as preliminary, for review with an accountant/tax consultant.
 * - It never makes legal/tax/AML conclusions and never uses unsafe framing — it stays
 *   with neutral, review-oriented language ("may require explanation" / "стоит проверить").
 */
export const ASSISTANT_SYSTEM_PROMPT = [
  "Ты — ИИ-помощник в сервисе Crypto Audit Report (крипто-налоги, RU).",
  "Твоя роль строго ограничена:",
  "1) пояснять пользователю результаты, рассчитанные детерминированным движком;",
  "2) помогать с черновиками текстов (пояснения, описания для декларации 3-НДФЛ, письма).",
  "",
  "ЖЁСТКИЕ ПРАВИЛА:",
  "- Ты НИКОГДА не считаешь, не оцениваешь и не изменяешь налоговые числа. Все суммы, база и ставки берутся ТОЛЬКО из предоставленного блока детерминированных данных. Если числа нет в данных — скажи, что его нужно получить из расчёта, и не выдумывай.",
  "- Всегда подчёркивай, что результат предварительный и предназначен для проверки с бухгалтером или налоговым консультантом, а не является официальной суммой к уплате или подачей в ФНС.",
  "- Не давай юридических, налоговых или комплаенс-заключений и не оценивай происхождение средств как хорошее или плохое.",
  "- Не навешивай на операции негативные ярлыки, не обещай результат взаимодействия с банком и не предлагай способы ухода от налогов.",
  "- Используй нейтральные формулировки: «может потребовать пояснения», «стоит проверить», «банк или бухгалтер может запросить».",
  "- Отвечай на русском языке, кратко и по делу.",
].join("\n");

/** Anthropic message shape (subset) used for the API request body. */
export interface AnthropicMessageParam {
  role: "user" | "assistant";
  content: string;
}

export interface AssistantRequestBody {
  model: string;
  max_tokens: number;
  system: string;
  messages: AnthropicMessageParam[];
  stream: boolean;
}

/** Sanitize the chat history: keep only role + trimmed string content, drop empties. */
export function sanitizeMessages(messages: AssistantMessage[]): AnthropicMessageParam[] {
  if (!Array.isArray(messages)) return [];
  return messages
    .filter((m) => (m?.role === "user" || m?.role === "assistant") && typeof m.content === "string")
    .map((m) => ({ role: m.role, content: m.content.trim() }))
    .filter((m) => m.content.length > 0);
}

/**
 * Assemble the Anthropic Messages API request body. The deterministic context is appended
 * to the system prompt (trusted channel) so the model treats the engine's numbers as fixed.
 * Pure and deterministic — no network, no env access — so it can be unit-tested.
 */
export function buildAssistantRequestBody(
  messages: AssistantMessage[],
  context: AssistantContext,
  model = "claude-sonnet-4-6",
): AssistantRequestBody {
  const system = `${ASSISTANT_SYSTEM_PROMPT}\n\n${buildAssistantContext(context)}`;
  return {
    model,
    max_tokens: 1024,
    system,
    messages: sanitizeMessages(messages),
    stream: true,
  };
}
