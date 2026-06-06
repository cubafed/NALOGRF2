"use client";

import { useMemo, useState } from "react";
import {
  Check,
  CheckCircle2,
  Circle,
  Copy,
  Info,
  Landmark,
  Users,
} from "lucide-react";
import { buildTaxSummaryExport } from "@/lib/tax/build-tax-summary-export";
import type { PreliminaryTaxEstimate } from "@/lib/tax/manual-cost-basis-types";
import { TaxSummaryExportButton } from "@/components/tax/TaxSummaryExportButton";

interface TaxNextStepsPanelProps {
  estimate: PreliminaryTaxEstimate;
}

const NEXT_STEPS_DISCLAIMER =
  "Это не налоговая декларация и не налоговая консультация. " +
  "Используйте предварительную оценку для проверки с бухгалтером или налоговым консультантом.";

const METHODOLOGY_NOTE =
  "Расчет основан только на загруженных данных и ручной себестоимости. " +
  "Неподдержанные операции исключены из оценки.";

const CHECKLIST_ITEMS = [
  "проверить включенные операции",
  "проверить исключенные операции",
  "добавить недостающую себестоимость",
  "сохранить summary",
  "передать summary бухгалтеру/налоговому консультанту",
  "заполнить декларацию и оплатить налог через официальный канал, если это применимо",
];

function formatMoney(value: number, currency: string): string {
  return (
    new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 2 }).format(value) + ` ${currency}`
  );
}

export function TaxNextStepsPanel({ estimate }: TaxNextStepsPanelProps) {
  const summary = useMemo(() => buildTaxSummaryExport(estimate), [estimate]);
  const [checked, setChecked] = useState<boolean[]>(() => CHECKLIST_ITEMS.map(() => false));
  const [copied, setCopied] = useState(false);

  const toggle = (index: number) => {
    setChecked((current) => current.map((value, i) => (i === index ? !value : value)));
  };

  const { totals, fiatCurrency, taxYear } = summary;

  const accountantText = useMemo(() => {
    return [
      "Предварительная налоговая оценка (для проверки с бухгалтером)",
      `Год: ${taxYear ?? "—"}`,
      `Валюта: ${fiatCurrency}`,
      `Включено операций: ${totals.includedOperations}`,
      `Исключено: ${totals.excludedOperations}`,
      `Требует проверки: ${totals.needsReviewOperations}`,
      `Не поддерживается: ${totals.unsupportedOperations}`,
      `Предварительный налоговый результат: ${formatMoney(
        totals.preliminaryTaxableResultFiat,
        fiatCurrency,
      )}`,
      "",
      METHODOLOGY_NOTE,
      NEXT_STEPS_DISCLAIMER,
    ].join("\n");
  }, [fiatCurrency, taxYear, totals]);

  const handleCopy = async () => {
    if (typeof navigator === "undefined" || !navigator.clipboard) return;
    try {
      await navigator.clipboard.writeText(accountantText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard unavailable — silently ignore.
    }
  };

  return (
    <section className="panel">
      <div className="panel-inner">
        <div className="panel-head">
          <div>
            <p className="eyebrow">Next steps</p>
            <h2 style={{ margin: 0 }}>Следующие шаги</h2>
          </div>
          <span className="badge">Local-only</span>
        </div>

        <p className="muted" style={{ marginTop: 12, maxWidth: 760 }}>
          Предварительная оценка показывает результат «выручка − себестоимость − комиссия» только по
          поддерживаемым операциям с введённой себестоимостью. Это ориентир для проверки, а не
          итоговая сумма налога.
        </p>

        {/* What data was included / excluded / needs review */}
        <div className="metric-grid" style={{ marginTop: 18 }}>
          <div className="metric">
            <span>Включено</span>
            <strong>{totals.includedOperations}</strong>
          </div>
          <div className="metric">
            <span>Исключено</span>
            <strong>{totals.excludedOperations}</strong>
          </div>
          <div className="metric">
            <span>Требует проверки</span>
            <strong>{totals.needsReviewOperations}</strong>
          </div>
          <div className="metric">
            <span>Не поддерживается</span>
            <strong>{totals.unsupportedOperations}</strong>
          </div>
        </div>

        {/* What to give an accountant + how to proceed */}
        <div className="grid-2" style={{ marginTop: 18, display: "grid", gap: 14, gridTemplateColumns: "1fr 1fr" }}>
          <div style={{ display: "flex", gap: 10 }}>
            <Users size={16} style={{ flexShrink: 0, color: "var(--blue)", marginTop: 2 }} />
            <div>
              <strong style={{ fontSize: 13 }}>Что передать бухгалтеру</strong>
              <p className="muted" style={{ margin: "4px 0 0", fontSize: 13 }}>
                Сохранённый summary (JSON или CSV), исходный CSV-импорт и подтверждения себестоимости
                по включённым операциям.
              </p>
            </div>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <Landmark size={16} style={{ flexShrink: 0, color: "var(--blue)", marginTop: 2 }} />
            <div>
              <strong style={{ fontSize: 13 }}>Как действовать дальше</strong>
              <p className="muted" style={{ margin: "4px 0 0", fontSize: 13 }}>
                Уточните оценку с бухгалтером или налоговым консультантом и, если это применимо,
                подайте декларацию и оплатите налог через официальный канал.
              </p>
            </div>
          </div>
        </div>

        {/* Checklist */}
        <div style={{ marginTop: 20 }}>
          <p style={{ margin: "0 0 10px", fontSize: 11, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Чек-лист
          </p>
          <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 8 }}>
            {CHECKLIST_ITEMS.map((item, index) => {
              const isChecked = checked[index];
              return (
                <li key={item}>
                  <button
                    type="button"
                    onClick={() => toggle(index)}
                    aria-pressed={isChecked}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 10,
                      width: "100%",
                      textAlign: "left",
                      background: "transparent",
                      border: "none",
                      cursor: "pointer",
                      padding: 0,
                      color: isChecked ? "var(--muted)" : "var(--ink)",
                      fontSize: 13,
                    }}
                  >
                    {isChecked ? (
                      <CheckCircle2 size={16} color="var(--green)" style={{ flexShrink: 0, marginTop: 1 }} />
                    ) : (
                      <Circle size={16} color="var(--muted)" style={{ flexShrink: 0, marginTop: 1 }} />
                    )}
                    <span style={{ textDecoration: isChecked ? "line-through" : "none" }}>{item}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Export + copy + future placeholder */}
        <div style={{ marginTop: 22, display: "flex", flexDirection: "column", gap: 12 }}>
          <TaxSummaryExportButton estimate={estimate} taxYear={taxYear} />
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={handleCopy}
              className="btn"
              style={{ gap: 6, fontSize: 13 }}
            >
              {copied ? <Check size={14} color="var(--green)" /> : <Copy size={14} />}
              {copied ? "Скопировано" : "Скопировать для бухгалтера"}
            </button>
            <button
              type="button"
              disabled
              title="Появится позже. Сейчас приложение не формирует официальную декларацию."
              className="btn"
              style={{ gap: 6, fontSize: 13, opacity: 0.5, cursor: "not-allowed" }}
            >
              Экспорт 3-НДФЛ — позже
            </button>
          </div>
        </div>

        {/* Methodology + disclaimer */}
        <div
          style={{
            display: "flex",
            gap: 8,
            marginTop: 20,
            padding: "10px 12px",
            borderRadius: "var(--radius-sm)",
            background: "rgba(26,130,255,0.06)",
            border: "1px solid rgba(26,130,255,0.16)",
          }}
        >
          <Info size={14} style={{ flexShrink: 0, color: "var(--blue)", marginTop: 1 }} />
          <p style={{ margin: 0, fontSize: 12, color: "var(--muted-strong)" }}>{METHODOLOGY_NOTE}</p>
        </div>

        <p className="muted" style={{ margin: "12px 0 0", fontSize: 13 }}>{NEXT_STEPS_DISCLAIMER}</p>
      </div>
    </section>
  );
}
