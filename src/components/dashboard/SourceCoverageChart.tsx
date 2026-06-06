"use client";

import type { SourceCoverageResult } from "@/lib/metrics/analytics-types";
import { AlertTriangle } from "lucide-react";

interface SourceCoverageChartProps {
  result: SourceCoverageResult;
}

export function SourceCoverageChart({ result }: SourceCoverageChartProps) {
  const { entries, unknownSourceCount } = result;

  const isEmpty = entries.length === 0;

  return (
    <section className="panel">
      <div className="panel-inner">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <p className="eyebrow" style={{ margin: 0 }}>Источники данных</p>
          {unknownSourceCount > 0 && (
            <span style={{ fontSize: 11, color: "var(--amber)", display: "flex", alignItems: "center", gap: 4 }}>
              <AlertTriangle size={11} />
              {unknownSourceCount} без источника
            </span>
          )}
        </div>

        {isEmpty ? (
          <p className="muted" style={{ margin: 0, fontSize: 13, textAlign: "center", padding: "16px 0" }}>
            Поле source не заполнено в данных
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {entries.map((entry) => {
              const isUnknown = entry.source === "Неизвестный источник";
              return (
                <div key={entry.source}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                    <span
                      style={{
                        fontSize: 12,
                        color: isUnknown ? "var(--muted)" : "var(--fg)",
                        fontStyle: isUnknown ? "italic" : "normal",
                      }}
                    >
                      {entry.source}
                    </span>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      {(entry.warningCount > 0 || entry.errorCount > 0) && (
                        <span style={{ fontSize: 11, color: "var(--amber)" }}>
                          <AlertTriangle size={10} style={{ display: "inline", verticalAlign: "middle" }} />{" "}
                          {entry.warningCount + entry.errorCount}
                        </span>
                      )}
                      <span style={{ fontSize: 12, color: "var(--muted)", fontVariantNumeric: "tabular-nums" }}>
                        {entry.transactionCount.toLocaleString("ru-RU")} ({entry.percent}%)
                      </span>
                    </div>
                  </div>
                  <div className="source-bar-track">
                    <div
                      className="source-bar-fill"
                      style={{
                        width: `${entry.percent}%`,
                        background: isUnknown ? "var(--muted)" : "var(--blue)",
                        opacity: isUnknown ? 0.4 : 1,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
