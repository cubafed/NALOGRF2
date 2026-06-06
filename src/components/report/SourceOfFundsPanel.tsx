"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Copy, Download, FileText, ShieldCheck } from "lucide-react";
import {
  loadLatestImportSession,
  type ImportSession,
} from "@/lib/client/import-session-storage";
import { buildSourceOfFundsPack, type SourceOfFundsPack } from "@/lib/report/source-of-funds-pack";
import {
  serializeSourceOfFundsPackJson,
  serializeSourceOfFundsPackText,
} from "@/lib/report/serialize-source-of-funds-pack";
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

function LetterCard({ title, appliesWhen, body }: { title: string; appliesWhen: string; body: string }) {
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
        border: "1px solid var(--line)",
        borderRadius: "var(--radius-sm)",
        padding: "12px 14px",
        background: "var(--panel-2)",
      }}
    >
      <div className="row-between" style={{ alignItems: "flex-start", gap: 10 }}>
        <div>
          <strong style={{ fontSize: 14 }}>{title}</strong>
          <p className="muted" style={{ margin: "2px 0 0", fontSize: 12 }}>{appliesWhen}</p>
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

export function SourceOfFundsPanel() {
  const [session, setSession] = useState<ImportSession | null | "loading">("loading");

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
                    <span className="badge" style={{ fontSize: 11 }}>{item.operationCount} оп.</span>
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

        {/* Explanation-letter drafts */}
        <div style={{ marginTop: 22 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <FileText size={14} style={{ color: "var(--blue)" }} />
            <p className="eyebrow" style={{ margin: 0 }}>Черновики пояснительных писем</p>
          </div>
          <div style={{ display: "grid", gap: 12 }}>
            {pack.letterTemplates.map((template) => (
              <LetterCard
                key={template.key}
                title={template.title}
                appliesWhen={template.appliesWhen}
                body={template.body}
              />
            ))}
          </div>
        </div>

        <p className="muted" style={{ margin: "18px 0 0", fontSize: 12 }}>{pack.disclaimer}</p>
      </div>
    </section>
  );
}
