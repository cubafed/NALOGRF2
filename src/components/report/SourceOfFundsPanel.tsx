"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, CheckCircle, Circle, Copy, Download, FileText, ShieldCheck } from "lucide-react";
import {
  loadLatestImportSession,
  type ImportSession,
} from "@/lib/client/import-session-storage";
import {
  buildSourceOfFundsPack,
  type SourceOfFundsPack,
} from "@/lib/report/source-of-funds-pack";
import {
  serializeSourceOfFundsPackJson,
  serializeSourceOfFundsPackText,
} from "@/lib/report/serialize-source-of-funds-pack";
import type { ExplanationLetterTemplate } from "@/lib/report/explanation-letter-templates";
import { DocumentChecklist } from "./DocumentChecklist";

function downloadBlob(content: string, filename: string, type: string) {
  if (typeof window === "undefined") return;
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

function PackExportButtons({ pack }: { pack: SourceOfFundsPack }) {
  return (
    <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
      <button
        type="button"
        className="btn"
        style={{ gap: 6, fontSize: 13 }}
        onClick={() =>
          downloadBlob(
            "﻿" + serializeSourceOfFundsPackText(pack),
            "source-of-funds-pack.md",
            "text/markdown;charset=utf-8;",
          )
        }
      >
        <Download size={14} />
        Документ (Markdown)
      </button>
      <button
        type="button"
        className="btn"
        style={{ gap: 6, fontSize: 13 }}
        onClick={() =>
          downloadBlob(
            serializeSourceOfFundsPackJson(pack),
            "source-of-funds-pack.json",
            "application/json;charset=utf-8;",
          )
        }
      >
        <Download size={14} />
        JSON
      </button>
    </div>
  );
}

function formatMoney(value: number, currency: string): string {
  return (
    new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 2 }).format(value) + ` ${currency}`
  );
}

function LetterCard({
  title,
  appliesWhen,
  body,
  highlighted,
}: {
  title: string;
  appliesWhen: string;
  body: string;
  highlighted?: boolean;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (typeof navigator === "undefined" || !navigator.clipboard) return;
    try {
      await navigator.clipboard.writeText(body);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard unavailable — ignore.
    }
  };

  return (
    <div
      style={{
        border: `1px solid ${highlighted ? "var(--blue)" : "var(--line)"}`,
        borderRadius: "var(--radius-sm)",
        padding: "12px 14px",
        background: highlighted ? "var(--blue-soft, #1a82ff10)" : "var(--panel-2)",
      }}
    >
      <div className="row-between" style={{ alignItems: "flex-start", gap: 10 }}>
        <div>
          <strong style={{ fontSize: 14 }}>{title}</strong>
          <p className="muted" style={{ margin: "2px 0 0", fontSize: 12 }}>
            {appliesWhen}
          </p>
        </div>
        <button type="button" onClick={handleCopy} className="btn" style={{ gap: 6, fontSize: 12 }}>
          {copied ? <Check size={13} color="var(--green)" /> : <Copy size={13} />}
          {copied ? "Скопировано" : "Копировать"}
        </button>
      </div>
      <pre
        style={{
          margin: "10px 0 0",
          whiteSpace: "pre-wrap",
          fontFamily: "inherit",
          fontSize: 12.5,
          color: "var(--muted-strong)",
          lineHeight: 1.5,
        }}
      >
        {body}
      </pre>
    </div>
  );
}

const BANK_REQUEST_TYPES: { value: string; label: string; letterKey: string }[] = [
  { value: "", label: "Показать все письма", letterKey: "" },
  { value: "origin", label: "Происхождение средств", letterKey: "source_of_funds_general" },
  { value: "nature", label: "Характер операций", letterKey: "bank_cover" },
  { value: "p2p", label: "P2P-операции", letterKey: "p2p_nature" },
  { value: "counterparty", label: "Операции с одним контрагентом", letterKey: "concentrated_counterparty" },
  { value: "rapid_transit", label: "Быстрый ввод/вывод", letterKey: "rapid_transit" },
  { value: "large_disposal", label: "Крупная продажа/вывод", letterKey: "large_disposal" },
  { value: "mining", label: "Майнинг/стейкинг", letterKey: "mining_staking_income" },
  { value: "income", label: "Зарплата/оплата в крипте", letterKey: "crypto_income" },
  { value: "gift", label: "Подарок/наследование", letterKey: "gift_inheritance" },
  { value: "savings", label: "Личные накопления", letterKey: "personal_savings" },
];

export function SourceOfFundsPanel() {
  const [session, setSession] = useState<ImportSession | null | "loading">("loading");
  const [bankRequestType, setBankRequestType] = useState("");
  const [showSupplementary, setShowSupplementary] = useState(false);

  useEffect(() => {
    setSession(loadLatestImportSession());
  }, []);

  const pack = useMemo(
    () =>
      session && session !== "loading"
        ? buildSourceOfFundsPack(session.transactions, session.riskResult.findings)
        : null,
    [session],
  );

  if (session === "loading" || !pack) return null;

  const selectedLetterKey =
    BANK_REQUEST_TYPES.find((t) => t.value === bankRequestType)?.letterKey ?? "";

  const allLetters: ExplanationLetterTemplate[] = [
    ...pack.letterTemplates,
    ...pack.supplementaryLetters,
  ];

  const filteredLetters =
    selectedLetterKey === ""
      ? pack.letterTemplates
      : allLetters.filter((t) => t.key === selectedLetterKey);

  return (
    <section className="panel">
      <div className="panel-inner">
        <div className="panel-head">
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <ShieldCheck size={16} style={{ color: "var(--blue)", flexShrink: 0 }} />
            <div>
              <p className="eyebrow" style={{ margin: 0 }}>Источник средств · 115-ФЗ</p>
              <h2 style={{ margin: 0 }}>Пакет подтверждения источника средств</h2>
            </div>
          </div>
          <span className="badge">Local-only · {pack.periodLabel}</span>
        </div>

        <p className="muted" style={{ marginTop: 12, maxWidth: 760, fontSize: 13 }}>
          Помогает легитимно подтвердить происхождение средств, если банк задаёт вопросы или
          запрашивает пояснения по 115-ФЗ. Сводка, документы и черновики писем собраны из вашей
          истории операций.
        </p>

        <div style={{ marginTop: 14 }}>
          <PackExportButtons pack={pack} />
        </div>

        {/* Package readiness checklist */}
        <div style={{ marginTop: 20 }}>
          <p className="eyebrow" style={{ margin: "0 0 10px" }}>Готовность пакета</p>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
              gap: 8,
            }}
          >
            {pack.readiness.map((item) => (
              <div
                key={item.key}
                style={{
                  display: "flex",
                  gap: 10,
                  alignItems: "flex-start",
                  padding: "9px 12px",
                  borderRadius: "var(--radius-sm)",
                  border: "1px solid var(--line)",
                  background: "var(--panel-2)",
                }}
              >
                {item.present ? (
                  <CheckCircle
                    size={15}
                    color="var(--green)"
                    style={{ flexShrink: 0, marginTop: 1 }}
                  />
                ) : (
                  <Circle size={15} color="var(--muted)" style={{ flexShrink: 0, marginTop: 1 }} />
                )}
                <div>
                  <p style={{ margin: 0, fontSize: 13 }}>{item.label}</p>
                  {item.hint && (
                    <p className="muted" style={{ margin: "2px 0 0", fontSize: 11 }}>
                      {item.hint}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Operations summary */}
        <div style={{ marginTop: 18 }}>
          <p className="eyebrow" style={{ margin: "0 0 8px" }}>Сводка операций</p>
          <p className="muted" style={{ margin: "0 0 8px", fontSize: 13 }}>
            Всего операций: {pack.operationsSummary.totalOperations}
          </p>
          {pack.operationsSummary.byType.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {pack.operationsSummary.byType.map((row) => (
                <span key={row.type} className="badge" style={{ fontSize: 12 }}>
                  {row.type}: {row.count}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Where funds came from */}
        {pack.inflowBySource.length > 0 && (
          <div style={{ marginTop: 18 }}>
            <p className="eyebrow" style={{ margin: "0 0 8px" }}>Откуда поступали средства</p>
            <div style={{ overflowX: "auto" }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>Источник</th>
                    <th>Валюта</th>
                    <th>Поступления</th>
                    <th>Операций</th>
                  </tr>
                </thead>
                <tbody>
                  {pack.inflowBySource.map((inflow) => (
                    <tr key={`${inflow.source}|${inflow.currency}`}>
                      <td>{inflow.source}</td>
                      <td>{inflow.currency}</td>
                      <td>{formatMoney(inflow.totalInflow, inflow.currency)}</td>
                      <td>{inflow.operationCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="muted" style={{ margin: "6px 0 0", fontSize: 12 }}>
              Суммы показаны отдельно по каждой валюте и не суммируются между собой.
            </p>
          </div>
        )}

        {/* What may need explanation */}
        {pack.itemsThatMayNeedExplanation.length > 0 && (
          <div style={{ marginTop: 22 }}>
            <p className="eyebrow" style={{ margin: "0 0 8px" }}>Может потребовать пояснения</p>
            <div style={{ display: "grid", gap: 10 }}>
              {pack.itemsThatMayNeedExplanation.map((item) => (
                <div
                  key={item.ruleId}
                  style={{
                    border: "1px solid var(--line)",
                    borderRadius: "var(--radius-sm)",
                    padding: "12px 14px",
                  }}
                >
                  <div className="row-between" style={{ gap: 10 }}>
                    <strong style={{ fontSize: 14 }}>{item.title}</strong>
                    <span className="badge" style={{ fontSize: 11 }}>
                      {item.operationCount} оп.
                    </span>
                  </div>
                  <p className="muted" style={{ margin: "6px 0 0", fontSize: 13 }}>
                    {item.whatMayNeedExplanation}
                  </p>
                  <p style={{ margin: "6px 0 0", fontSize: 13 }}>{item.recommendedAction}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Document checklist (focused subset) */}
        <div style={{ marginTop: 22 }}>
          <p className="eyebrow" style={{ margin: "0 0 8px" }}>Документы для пакета</p>
          <DocumentChecklist items={pack.documentChecklist} />
        </div>

        {/* Explanation letters */}
        <div style={{ marginTop: 22 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <FileText size={14} style={{ color: "var(--blue)" }} />
            <p className="eyebrow" style={{ margin: 0 }}>Черновики пояснительных писем</p>
          </div>

          {/* Bank request type selector */}
          <div
            style={{
              padding: "12px 14px",
              borderRadius: "var(--radius-sm)",
              border: "1px solid var(--line)",
              background: "var(--panel-2)",
              marginBottom: 14,
            }}
          >
            <label
              style={{ display: "block", fontSize: 12, marginBottom: 6 }}
              className="eyebrow"
            >
              Что запросил банк? (подберём нужное письмо)
            </label>
            <select
              value={bankRequestType}
              onChange={(e) => setBankRequestType(e.target.value)}
              style={{
                width: "100%",
                maxWidth: 420,
                padding: "7px 10px",
                fontSize: 13,
                borderRadius: "var(--radius-sm)",
                border: "1px solid var(--line)",
                background: "var(--panel-2)",
                color: "inherit",
              }}
            >
              {BANK_REQUEST_TYPES.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            {selectedLetterKey !== "" && filteredLetters.length === 0 && (
              <p className="muted" style={{ margin: "6px 0 0", fontSize: 12 }}>
                Письмо этого типа нет в основном пакете — смотрите «Дополнительные письма» ниже.
              </p>
            )}
          </div>

          <div style={{ display: "grid", gap: 12 }}>
            {filteredLetters.map((template) => (
              <LetterCard
                key={template.key}
                title={template.title}
                appliesWhen={template.appliesWhen}
                body={template.body}
                highlighted={template.key === selectedLetterKey && selectedLetterKey !== ""}
              />
            ))}
          </div>

          {/* Supplementary letters section */}
          <div style={{ marginTop: 16 }}>
            <button
              type="button"
              className="btn"
              style={{ fontSize: 13 }}
              onClick={() => setShowSupplementary((v) => !v)}
            >
              {showSupplementary
                ? "Скрыть дополнительные письма"
                : "Дополнительные письма (майнинг, зарплата, подарок, накопления)"}
            </button>
            {showSupplementary && (
              <div style={{ display: "grid", gap: 12, marginTop: 12 }}>
                {pack.supplementaryLetters.map((template) => (
                  <LetterCard
                    key={template.key}
                    title={template.title}
                    appliesWhen={template.appliesWhen}
                    body={template.body}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        <p className="muted" style={{ margin: "18px 0 0", fontSize: 12 }}>
          {pack.disclaimer}
        </p>
      </div>
    </section>
  );
}
