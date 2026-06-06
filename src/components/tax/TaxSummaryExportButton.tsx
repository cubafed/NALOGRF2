"use client";

import { Download } from "lucide-react";
import {
  buildTaxSummaryExport,
  serializeTaxSummaryCsv,
} from "@/lib/tax/build-tax-summary-export";
import type { PreliminaryTaxEstimate } from "@/lib/tax/manual-cost-basis-types";

interface TaxSummaryExportButtonProps {
  estimate: PreliminaryTaxEstimate;
  taxYear?: number | null;
}

function downloadBlob(filename: string, content: string, mime: string) {
  if (typeof window === "undefined") return;
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

export function TaxSummaryExportButton({ estimate, taxYear }: TaxSummaryExportButtonProps) {
  const disabled = estimate.lines.length === 0;

  const handleJson = () => {
    const payload = buildTaxSummaryExport(estimate, { taxYear });
    downloadBlob(
      "tax-summary.json",
      JSON.stringify(payload, null, 2),
      "application/json;charset=utf-8;",
    );
  };

  const handleCsv = () => {
    const payload = buildTaxSummaryExport(estimate, { taxYear });
    const csv = "﻿" + serializeTaxSummaryCsv(payload); // BOM for Excel/RU locale
    downloadBlob("tax-summary.csv", csv, "text/csv;charset=utf-8;");
  };

  return (
    <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
      <button
        type="button"
        onClick={handleJson}
        disabled={disabled}
        className="btn btn-primary"
        style={{ gap: 6, fontSize: 13, opacity: disabled ? 0.5 : 1 }}
      >
        <Download size={14} />
        Сохранить summary (JSON)
      </button>
      <button
        type="button"
        onClick={handleCsv}
        disabled={disabled}
        className="btn"
        style={{ gap: 6, fontSize: 13, opacity: disabled ? 0.5 : 1 }}
      >
        <Download size={14} />
        Сохранить summary (CSV)
      </button>
    </div>
  );
}
