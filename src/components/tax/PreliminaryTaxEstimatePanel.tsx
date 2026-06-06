"use client";

import { Download } from "lucide-react";
import type {
  PreliminaryTaxEstimate,
  PreliminaryTaxEstimateLine,
} from "@/lib/tax/manual-cost-basis-types";

const DISCLAIMER =
  "Не является налоговой, юридической или финансовой консультацией. Расчет предварительный и основан только на данных пользователя.";

function formatMoney(value: number, currency: string): string {
  return new Intl.NumberFormat("ru-RU", {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  }).format(value) + ` ${currency}`;
}

function escapeCsv(value: string | number | null | undefined): string {
  const text = value === null || value === undefined ? "" : String(value);
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function buildCsv(lines: readonly PreliminaryTaxEstimateLine[]): string {
  const header = [
    "raw_row_id",
    "date",
    "type",
    "asset",
    "amount",
    "fiat_currency",
    "classification",
    "status",
    "reason_code",
    "proceeds_fiat",
    "manual_cost_basis_fiat",
    "fee_fiat",
    "preliminary_taxable_result_fiat",
  ];
  const rows = lines.map((line) =>
    [
      line.rawRowId,
      line.date,
      line.type,
      line.asset,
      line.amount,
      line.fiatCurrency,
      line.classificationCategory,
      line.status,
      line.reasonCode,
      line.proceedsFiat,
      line.manualCostBasisFiat,
      line.feeFiat,
      line.preliminaryTaxableResultFiat,
    ]
      .map(escapeCsv)
      .join(","),
  );
  return [header.join(","), ...rows].join("\n");
}

export function PreliminaryTaxEstimatePanel({
  estimate,
}: {
  estimate: PreliminaryTaxEstimate;
}) {
  const { summary, lines } = estimate;

  // Always render at least one block; never sum across currencies.
  const currencyBlocks =
    summary.byCurrency.length > 0
      ? summary.byCurrency
      : [
          {
            fiatCurrency: summary.fiatCurrency,
            includedOperations: 0,
            totalProceedsFiat: 0,
            totalManualCostBasisFiat: 0,
            totalFeesFiat: 0,
            preliminaryTaxableResultFiat: 0,
          },
        ];

  const handleExport = () => {
    if (typeof window === "undefined") return;
    const csv = "﻿" + buildCsv(lines); // BOM for Excel/RU locale
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "preliminary-tax-estimate.csv";
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  };

  return (
    <section className="panel">
      <div className="panel-inner">
        <div className="panel-head">
          <div>
            <p className="eyebrow">Предварительная налоговая оценка</p>
            <h2 style={{ margin: 0 }}>Итог по включенным операциям</h2>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button
              type="button"
              onClick={handleExport}
              disabled={lines.length === 0}
              className="btn"
              style={{ gap: 6, fontSize: 12, padding: "6px 10px", opacity: lines.length === 0 ? 0.5 : 1 }}
            >
              <Download size={13} />
              Экспорт CSV
            </button>
            <span className="badge">Local-only</span>
          </div>
        </div>

        <div className="metric-grid" style={{ marginTop: 18 }}>
          <div className="metric">
            <span>Включено</span>
            <strong>{summary.includedOperations}</strong>
          </div>
          <div className="metric">
            <span>Исключено</span>
            <strong>{summary.excludedOperations}</strong>
          </div>
          <div className="metric">
            <span>Требует проверки</span>
            <strong>{summary.needsReviewOperations}</strong>
          </div>
          <div className="metric">
            <span>Taxable candidates</span>
            <strong>{summary.taxableCandidates}</strong>
          </div>
        </div>

        {summary.byCurrency.length > 1 && (
          <p className="muted" style={{ margin: "18px 0 0", fontSize: 12 }}>
            Несколько валют — итоги показаны отдельно по каждой валюте и не суммируются между собой.
          </p>
        )}

        {currencyBlocks.map((block) => (
          <div key={block.fiatCurrency} style={{ marginTop: 14 }}>
            {summary.byCurrency.length > 1 && (
              <p className="eyebrow" style={{ margin: "0 0 8px" }}>
                {block.fiatCurrency} · {block.includedOperations} оп.
              </p>
            )}
            <div className="grid-3">
              <div className="panel" style={{ background: "var(--panel-2)" }}>
                <div className="panel-inner">
                  <p className="eyebrow">Proceeds</p>
                  <strong style={{ fontSize: 22 }}>
                    {formatMoney(block.totalProceedsFiat, block.fiatCurrency)}
                  </strong>
                </div>
              </div>
              <div className="panel" style={{ background: "var(--panel-2)" }}>
                <div className="panel-inner">
                  <p className="eyebrow">Manual cost basis + fees</p>
                  <strong style={{ fontSize: 22 }}>
                    {formatMoney(
                      block.totalManualCostBasisFiat + block.totalFeesFiat,
                      block.fiatCurrency,
                    )}
                  </strong>
                </div>
              </div>
              <div className="panel" style={{ background: "var(--blue-soft)" }}>
                <div className="panel-inner">
                  <p className="eyebrow">Preliminary result</p>
                  <strong style={{ fontSize: 22 }}>
                    {formatMoney(block.preliminaryTaxableResultFiat, block.fiatCurrency)}
                  </strong>
                </div>
              </div>
            </div>
          </div>
        ))}

        <p className="muted" style={{ margin: "18px 0 0", fontSize: 13 }}>
          {DISCLAIMER}
        </p>
      </div>
    </section>
  );
}
