"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Calculator, FileText, Save } from "lucide-react";
import {
  loadLatestImportSession,
  type ImportSession,
} from "@/lib/client/import-session-storage";
import {
  clearManualCostBasisEntry,
  loadManualCostBasisEntries,
  saveManualCostBasisEntry,
} from "@/lib/client/manual-cost-basis-storage";
import { calculatePreliminaryTaxEstimate } from "@/lib/tax/calculate-preliminary-tax-estimate";
import { classifyTaxEvents } from "@/lib/tax/classify-tax-events";
import type {
  ManualCostBasisByTransactionId,
  PreliminaryTaxEstimateLine,
} from "@/lib/tax/manual-cost-basis-types";
import { PreliminaryTaxEstimatePanel } from "@/components/tax/PreliminaryTaxEstimatePanel";

const TAX_DISCLAIMER =
  "Не является налоговой, юридической или финансовой консультацией. Расчет предварительный и основан только на данных пользователя.";

function formatMaybeMoney(value: number | null, currency: string): string {
  if (value === null) return "—";
  return (
    new Intl.NumberFormat("ru-RU", {
      maximumFractionDigits: 2,
      minimumFractionDigits: 0,
    }).format(value) + ` ${currency}`
  );
}

function statusLabel(status: PreliminaryTaxEstimateLine["status"]): string {
  if (status === "included") return "Включено";
  if (status === "needs_review") return "Требует проверки";
  return "Исключено";
}

function canEditCostBasis(line: PreliminaryTaxEstimateLine): boolean {
  return (
    line.reasonCode === "included_manual_cost_basis" ||
    line.reasonCode === "missing_manual_cost_basis"
  );
}

export function ManualCostBasisPanel() {
  const [session, setSession] = useState<ImportSession | null>(null);
  const [manualCostBasis, setManualCostBasis] = useState<ManualCostBasisByTransactionId>({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setSession(loadLatestImportSession());
    setManualCostBasis(loadManualCostBasisEntries());
    setLoaded(true);
  }, []);

  const classifications = useMemo(
    () => (session ? classifyTaxEvents(session.transactions) : []),
    [session],
  );

  const estimate = useMemo(
    () =>
      session
        ? calculatePreliminaryTaxEstimate(session.transactions, classifications, manualCostBasis)
        : null,
    [classifications, manualCostBasis, session],
  );

  const handleCostBasisChange = (line: PreliminaryTaxEstimateLine, value: string) => {
    const trimmedValue = value.trim();

    if (trimmedValue.length === 0) {
      clearManualCostBasisEntry(line.transactionId);
      setManualCostBasis((current) => {
        const next = { ...current };
        delete next[line.transactionId];
        return next;
      });
      return;
    }

    const entry = {
      transactionId: line.transactionId,
      costBasisFiat: trimmedValue,
      fiatCurrency: line.fiatCurrency,
      updatedAt: new Date().toISOString(),
    };

    saveManualCostBasisEntry(entry);
    setManualCostBasis((current) => ({
      ...current,
      [line.transactionId]: entry,
    }));
  };

  if (!loaded) {
    return (
      <section className="panel">
        <div className="panel-inner">
          <p className="muted">Загрузка локальных данных...</p>
        </div>
      </section>
    );
  }

  if (!session || !estimate) {
    return (
      <section className="panel">
        <div className="panel-inner empty-import-state">
          <FileText size={28} color="var(--muted)" style={{ marginBottom: 12 }} />
          <h2 style={{ margin: "0 0 8px" }}>Нет локального импорта</h2>
          <p className="muted" style={{ maxWidth: 620 }}>
            Откройте импорт CSV и загрузите файл или пример. После этого здесь появятся
            taxable candidate операции и предварительная налоговая оценка.
          </p>
          <p className="muted" style={{ maxWidth: 620, fontSize: 13 }}>
            {TAX_DISCLAIMER}
          </p>
          <Link href="/upload" className="btn btn-primary">
            Открыть импорт CSV
          </Link>
        </div>
      </section>
    );
  }

  const editableLines = estimate.lines.filter(canEditCostBasis);

  return (
    <div className="upload-stack">
      <section className="panel">
        <div className="panel-inner">
          <div className="panel-head">
            <div>
              <p className="eyebrow">Manual cost basis</p>
              <h2 style={{ margin: 0 }}>Ручная база затрат</h2>
            </div>
            <span className="badge">
              <Save size={13} />
              Browser storage
            </span>
          </div>
          <p className="muted" style={{ marginTop: 12, maxWidth: 760 }}>
            Данные берутся из последнего локального CSV-импорта. Введите ручную базу затрат
            для поддерживаемых sell/P2P-sale операций; строки без базы затрат исключаются из
            предварительной оценки.
          </p>

          {editableLines.length === 0 ? (
            <p className="muted" style={{ marginTop: 18 }}>
              В текущем импорте нет поддерживаемых операций с fiat proceeds для ручной базы затрат.
            </p>
          ) : (
            <div style={{ overflowX: "auto", marginTop: 18 }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>Дата</th>
                    <th>Операция</th>
                    <th>Актив</th>
                    <th>Proceeds</th>
                    <th>База затрат</th>
                    <th>Статус</th>
                  </tr>
                </thead>
                <tbody>
                  {editableLines.map((line) => (
                    <tr key={line.transactionId}>
                      <td>{line.date ?? "—"}</td>
                      <td>{line.type}</td>
                      <td>
                        {line.amount} {line.asset}
                      </td>
                      <td>{formatMaybeMoney(line.proceedsFiat, line.fiatCurrency)}</td>
                      <td>
                        <input
                          aria-label={`Ручная база затрат для операции ${line.transactionId}`}
                          inputMode="decimal"
                          min="0"
                          step="0.01"
                          type="number"
                          value={manualCostBasis[line.transactionId]?.costBasisFiat ?? ""}
                          onChange={(event) => handleCostBasisChange(line, event.target.value)}
                          placeholder="0"
                          style={{
                            width: 140,
                            border: "1px solid var(--line)",
                            borderRadius: 8,
                            background: "var(--panel-2)",
                            color: "var(--ink)",
                            padding: "9px 10px",
                          }}
                        />
                      </td>
                      <td>{statusLabel(line.status)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      <PreliminaryTaxEstimatePanel estimate={estimate} />

      <section className="panel">
        <div className="panel-inner">
          <div className="panel-head">
            <div>
              <p className="eyebrow">Included / excluded / needs review</p>
              <h2 style={{ margin: 0 }}>Все операции в оценке</h2>
            </div>
            <span className="badge">
              <Calculator size={13} />
              {estimate.summary.totalOperations} операций
            </span>
          </div>

          <div style={{ overflowX: "auto", marginTop: 18 }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Дата</th>
                  <th>Тип</th>
                  <th>Актив</th>
                  <th>Классификация</th>
                  <th>Статус</th>
                  <th>Proceeds</th>
                  <th>База</th>
                  <th>Fee</th>
                  <th>Предварительный результат</th>
                  <th>Причина</th>
                </tr>
              </thead>
              <tbody>
                {estimate.lines.map((line) => (
                  <tr key={line.transactionId}>
                    <td>{line.date ?? "—"}</td>
                    <td>{line.type}</td>
                    <td>
                      {line.amount} {line.asset}
                    </td>
                    <td>{line.classificationCategory}</td>
                    <td>{statusLabel(line.status)}</td>
                    <td>{formatMaybeMoney(line.proceedsFiat, line.fiatCurrency)}</td>
                    <td>{formatMaybeMoney(line.manualCostBasisFiat, line.fiatCurrency)}</td>
                    <td>{formatMaybeMoney(line.feeFiat, line.fiatCurrency)}</td>
                    <td>
                      {formatMaybeMoney(line.preliminaryTaxableResultFiat, line.fiatCurrency)}
                    </td>
                    <td style={{ minWidth: 260 }}>{line.explanation}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}
