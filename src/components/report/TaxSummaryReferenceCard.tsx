"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Calculator, FileText } from "lucide-react";
import { loadManualCostBasisEntries } from "@/lib/client/manual-cost-basis-storage";
import { getTaxSummaryContext } from "@/lib/report/tax-summary-context";

export function TaxSummaryReferenceCard() {
  const [entryCount, setEntryCount] = useState<number | null>(null);

  useEffect(() => {
    const entries = loadManualCostBasisEntries();
    const ctx = getTaxSummaryContext(entries);
    setEntryCount(ctx.entryCount);
  }, []);

  if (entryCount === null || entryCount === 0) return null;

  return (
    <section className="panel">
      <div className="panel-inner">
        <div className="panel-head">
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Calculator size={16} style={{ color: "var(--blue)", flexShrink: 0 }} />
            <div>
              <p className="eyebrow" style={{ margin: 0 }}>Налоговая оценка</p>
              <h2 style={{ margin: 0 }}>Предварительная налоговая оценка доступна</h2>
            </div>
          </div>
          <span className="badge">Local-only</span>
        </div>

        <p className="muted" style={{ marginTop: 12, maxWidth: 720, fontSize: 13 }}>
          Введена себестоимость для {entryCount}{" "}
          {entryCount === 1 ? "операции" : entryCount < 5 ? "операций" : "операций"}.
          Предварительная оценка показывает результат «выручка − себестоимость − комиссия» по
          поддерживаемым операциям. Это ориентир для проверки — не итоговая сумма налога.
        </p>

        <div
          style={{
            display: "flex",
            gap: 8,
            marginTop: 14,
            padding: "10px 12px",
            borderRadius: "var(--radius-sm)",
            background: "rgba(26,130,255,0.06)",
            border: "1px solid rgba(26,130,255,0.16)",
          }}
        >
          <FileText size={14} style={{ flexShrink: 0, color: "var(--blue)", marginTop: 1 }} />
          <p style={{ margin: 0, fontSize: 12, color: "var(--muted-strong)" }}>
            Включите JSON или CSV экспорт из раздела «Налог» в пакет документов для бухгалтера
            или налогового консультанта.
          </p>
        </div>

        <div style={{ marginTop: 14, display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Link href="/tax" className="btn" style={{ gap: 6, fontSize: 13 }}>
            <Calculator size={14} />
            Открыть налоговую оценку
          </Link>
        </div>

        <p className="muted" style={{ margin: "12px 0 0", fontSize: 12 }}>
          Не является налоговой, юридической или финансовой консультацией. Расчет предварительный
          и основан только на данных пользователя.
        </p>
      </div>
    </section>
  );
}
