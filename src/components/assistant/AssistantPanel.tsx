"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Send, Sparkles } from "lucide-react";
import {
  loadLatestImportSession,
  type ImportSession,
} from "@/lib/client/import-session-storage";
import { summarizeFindings } from "@/lib/assistant/build-assistant-context";
import { streamAssistant } from "@/lib/assistant/assistant-client";
import type { AssistantContext, AssistantMessage } from "@/lib/assistant/assistant-types";

const SUGGESTIONS = [
  "Объясни простыми словами, что показывает мой результат.",
  "Какие документы стоит подготовить по найденным пунктам?",
  "Помоги составить черновик пояснения для банка.",
];

export function AssistantPanel() {
  const [session, setSession] = useState<ImportSession | null | "loading">("loading");
  const [messages, setMessages] = useState<AssistantMessage[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSession(loadLatestImportSession());
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages, streaming]);

  const context = useMemo<AssistantContext | null>(() => {
    if (!session || session === "loading") return null;
    return {
      readinessScore: session.riskResult.readinessScore,
      findings: summarizeFindings(session.riskResult.findings),
    };
  }, [session]);

  if (session === "loading" || !context) return null;

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (trimmed.length === 0 || streaming) return;
    setError(null);
    const nextMessages: AssistantMessage[] = [...messages, { role: "user", content: trimmed }];
    setMessages(nextMessages);
    setInput("");
    setStreaming(true);

    // Placeholder assistant turn we append streamed chunks into.
    setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

    try {
      await streamAssistant({
        messages: nextMessages,
        context,
        onChunk: (chunk) => {
          setMessages((prev) => {
            const copy = [...prev];
            const last = copy[copy.length - 1];
            if (last && last.role === "assistant") {
              copy[copy.length - 1] = { role: "assistant", content: last.content + chunk };
            }
            return copy;
          });
        },
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Не удалось получить ответ.";
      setError(message);
      // Drop the empty placeholder if nothing streamed.
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last && last.role === "assistant" && last.content === "") return prev.slice(0, -1);
        return prev;
      });
    } finally {
      setStreaming(false);
    }
  };

  return (
    <section className="panel">
      <div className="panel-inner">
        <div className="panel-head">
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Sparkles size={16} style={{ color: "var(--blue)", flexShrink: 0 }} />
            <div>
              <p className="eyebrow" style={{ margin: 0 }}>ИИ-помощник</p>
              <h2 style={{ margin: 0 }}>Пояснения и черновики</h2>
            </div>
          </div>
          <span className="badge">Только пояснения · не считает налог</span>
        </div>

        <p className="muted" style={{ marginTop: 12, maxWidth: 760, fontSize: 13 }}>
          Помощник объясняет результаты детерминированного расчёта и помогает с черновиками
          текстов. Он не рассчитывает и не изменяет налоговые суммы — все числа берутся из
          расчёта. Результат предварительный, для проверки с бухгалтером.
        </p>

        {messages.length > 0 && (
          <div
            ref={scrollRef}
            style={{
              marginTop: 14,
              maxHeight: 360,
              overflowY: "auto",
              display: "grid",
              gap: 10,
            }}
          >
            {messages.map((m, i) => (
              <div
                key={i}
                style={{
                  justifySelf: m.role === "user" ? "end" : "start",
                  maxWidth: "85%",
                  border: "1px solid var(--line)",
                  borderRadius: "var(--radius-sm)",
                  padding: "10px 12px",
                  background: m.role === "user" ? "var(--panel-2)" : "transparent",
                  fontSize: 13.5,
                  whiteSpace: "pre-wrap",
                  lineHeight: 1.5,
                }}
              >
                {m.content || (streaming ? "…" : "")}
              </div>
            ))}
          </div>
        )}

        {messages.length === 0 && (
          <div style={{ marginTop: 14, display: "flex", gap: 8, flexWrap: "wrap" }}>
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                type="button"
                className="btn"
                style={{ fontSize: 12.5 }}
                onClick={() => send(s)}
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {error && (
          <p style={{ margin: "12px 0 0", fontSize: 13, color: "var(--red, #c0392b)" }}>{error}</p>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
          style={{ marginTop: 14, display: "flex", gap: 8 }}
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Задайте вопрос о вашем результате…"
            disabled={streaming}
            style={{
              flex: 1,
              border: "1px solid var(--line)",
              borderRadius: "var(--radius-sm)",
              padding: "10px 12px",
              background: "var(--panel-2)",
              color: "inherit",
              fontSize: 13.5,
            }}
          />
          <button type="submit" className="btn" style={{ gap: 6 }} disabled={streaming || input.trim() === ""}>
            <Send size={14} />
            {streaming ? "…" : "Спросить"}
          </button>
        </form>
      </div>
    </section>
  );
}
