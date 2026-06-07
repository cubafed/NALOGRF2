"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AlertTriangle, Calculator, CheckCircle, Download, RefreshCw } from "lucide-react";
import {
  loadLatestImportSession,
  type ImportSession,
} from "@/lib/client/import-session-storage";
import {
  loadJurisdictionPreference,
} from "@/lib/client/jurisdiction-preference-storage";
import { getJurisdictionInfo, getJurisdiction } from "@/lib/tax/jurisdictions/index";
import { getCostBasisMethod, type CostBasisMethodId } from "@/lib/tax/methods/index";
import { calculateTax } from "@/lib/tax/engine/calculate-tax";
import { createRateLookup, type RateTableEntry } from "@/lib/tax/rates/convert";
import { fetchRatesForTransactions } from "@/lib/rates/fetch-rates-for-transactions";
import type { TaxEngineResult } from "@/lib/tax/engine/engine-types";

const METHOD_OPTIONS: { id: CostBasisMethodId; label: string }[] = [
  { id: "fifo", label: "FIFO (первый вошёл — первый вышел)" },
  { id: "lifo", label: "LIFO (последний вошёл — первый вышел)" },
  { id: "hifo", label: "HIFO (самый дорогой — первый вышел)" },
  { id: "acb", label: "ACB (средневзвешенная себестоимость)" },
];

const ENGINE_DISCLAIMER =
  "Результат предварительный и носит исключительно информационный характер. " +
  "Это не налоговая декларация и не официальная сумма к уплате. " +
  "Проверьте с бухгалтером или налоговым консультантом.";

function fmtNumber(value: number, fractions = 2): string {
  return new Intl.NumberFormat("ru-RU", {
    minimumFractionDigits: 0,
    maximumFractionDigits: fractions,
  }).format(value);
}

function fmtMoney(value: number | null, currency: string): string {
  if (value === null) return "—";
  return fmtNumber(value) + " " + currency;
}

function statusBadge(status: "included" | "needs_review" | "excluded"): React.ReactNode {
  if (status === "included") {
    return (
      <span className="badge" style={{ background: "var(--green-soft, #00c87a22)", color: "var(--green)" }}>
        Включено
      </span>
    );
  }
  if (status === "needs_review") {
    return (
      <span className="badge" style={{ background: "var(--amber-soft, #ffbd5a22)", color: "var(--amber)" }}>
        Требует проверки
      </span>
    );
  }
  return <span className="badge">Исключено</span>;
}

export function TaxEnginePanel() {
  const [session, setSession] = useState<ImportSession | null | "loading">("loading");
  const [methodId, setMethodId] = useState<CostBasisMethodId>("fifo");
  const [rateEntries, setRateEntries] = useState<RateTableEntry[]>([]);
  const [ratesStatus, setRatesStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [fetchSummary, setFetchSummary] = useState<string>("");
  const [result, setResult] = useState<TaxEngineResult | null>(null);
  const [computeError, setComputeError] = useState<string>("");
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    setSession(loadLatestImportSession());
  }, []);

  const jurisdictionCode = useMemo(() => loadJurisdictionPreference(), []);
  const jurisdictionInfo = useMemo(() => getJurisdictionInfo(jurisdictionCode), [jurisdictionCode]);
  const reportCurrency = jurisdictionInfo?.reportCurrency ?? "RUB";

  const handleFetchRates = useCallback(async () => {
    if (!session || session === "loading") return;
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    setRatesStatus("loading");
    setFetchSummary("");
    try {
      const res = await fetchRatesForTransactions(session.transactions, reportCurrency);
      if (ctrl.signal.aborted) return;
      setRateEntries(res.entries);
      const parts: string[] = [];
      if (res.entries.length > 0) parts.push(`загружено ${res.entries.length} котировок`);
      if (res.fetchedAssets.length > 0) parts.push(`крипто: ${res.fetchedAssets.join(", ")}`);
      if (res.skippedAssets.length > 0)
        parts.push(`не найдено: ${res.skippedAssets.join(", ")}`);
      setFetchSummary(parts.join(" · ") || "Нет данных для загрузки");
      setRatesStatus("done");
    } catch {
      if (!ctrl.signal.aborted) {
        setRatesStatus("error");
        setFetchSummary("Ошибка загрузки курсов. Проверьте интернет-соединение.");
      }
    }
  }, [session, reportCurrency]);

  const handleCompute = useCallback(() => {
    if (!session || session === "loading") return;
    setComputeError("");
    const module = getJurisdiction(jurisdictionCode);
    if (!module) {
      setComputeError("Юрисдикция не поддерживается или является заглушкой. Выберите РФ-резидент или РФ-нерезидент.");
      return;
    }
    const method = getCostBasisMethod(methodId);
    if (!method) {
      setComputeError("Неизвестный метод расчёта.");
      return;
    }
    try {
      const rates = createRateLookup(module.reportCurrency, rateEntries);
      const taxResult = calculateTax({
        transactions: session.transactions,
        rates,
        jurisdiction: module,
        method,
      });
      setResult(taxResult);
    } catch (e) {
      setComputeError(e instanceof Error ? e.message : "Ошибка расчёта.");
    }
  }, [session, jurisdictionCode, methodId, rateEntries]);

  if (session === "loading") return null;

  if (!session) {
    return (
      <section className="panel">
        <div className="panel-inner empty-import-state">
          <Calculator size={28} color="var(--muted)" style={{ marginBottom: 12 }} />
          <h2 style={{ margin: "0 0 8px" }}>Нет данных для расчёта</h2>
          <p className="muted" style={{ maxWidth: 600 }}>
            Загрузите CSV с историей операций, затем вернитесь сюда.
          </p>
          <Link href="/upload" className="btn btn-primary">
            Открыть импорт CSV
          </Link>
        </div>
      </section>
    );
  }

  const txCount = session.transactions.length;

  return (
    <section className="panel">
      <div className="panel-inner">
        <div className="panel-head">
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Calculator size={16} style={{ color: "var(--blue)", flexShrink: 0 }} />
            <div>
              <p className="eyebrow" style={{ margin: 0 }}>Детерминированный движок</p>
              <h2 style={{ margin: 0 }}>Предварительный налоговый расчёт</h2>
            </div>
          </div>
          <span className="badge">
            {txCount} операций · {jurisdictionInfo?.label ?? jurisdictionCode}
          </span>
        </div>

        <p className="muted" style={{ marginTop: 10, maxWidth: 760, fontSize: 13 }}>
          FIFO/LIFO/HIFO/ACB лот-матчинг, конвертация через курсы ЦБ/CoinGecko,
          прогрессивные ставки юрисдикции. Строки без курса → «требует проверки»,
          числа не угадываются.
        </p>

        {/* Configuration */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: 12,
            marginTop: 16,
          }}
        >
          <div>
            <label style={{ display: "block", fontSize: 12, marginBottom: 4 }} className="eyebrow">
              Метод расчёта себестоимости
            </label>
            <select
              value={methodId}
              onChange={(e) => {
                setMethodId(e.target.value as CostBasisMethodId);
                setResult(null);
              }}
              style={{
                width: "100%",
                padding: "7px 10px",
                fontSize: 13,
                borderRadius: "var(--radius-sm)",
                border: "1px solid var(--line)",
                background: "var(--panel-2)",
                color: "inherit",
              }}
            >
              {METHOD_OPTIONS.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: "block", fontSize: 12, marginBottom: 4 }} className="eyebrow">
              Юрисдикция
            </label>
            <div
              style={{
                padding: "7px 10px",
                fontSize: 13,
                borderRadius: "var(--radius-sm)",
                border: "1px solid var(--line)",
                background: "var(--panel-2)",
              }}
            >
              {jurisdictionInfo?.label ?? jurisdictionCode}
              {" · "}
              <span className="muted">{jurisdictionInfo?.rateSummary ?? "—"}</span>
            </div>
          </div>
        </div>

        {/* Rate fetching */}
        <div
          style={{
            marginTop: 14,
            padding: "12px 14px",
            borderRadius: "var(--radius-sm)",
            border: "1px solid var(--line)",
            background: "var(--panel-2)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <button
              type="button"
              className="btn"
              style={{ gap: 6, fontSize: 13 }}
              disabled={ratesStatus === "loading"}
              onClick={handleFetchRates}
            >
              <RefreshCw
                size={13}
                style={{
                  animation: ratesStatus === "loading" ? "spin 1s linear infinite" : "none",
                }}
              />
              {ratesStatus === "loading" ? "Загрузка…" : "Подтянуть курсы (ЦБ + CoinGecko)"}
            </button>
            {ratesStatus === "done" && rateEntries.length > 0 && (
              <CheckCircle size={14} color="var(--green)" />
            )}
            {fetchSummary && (
              <span className="muted" style={{ fontSize: 12 }}>
                {fetchSummary}
              </span>
            )}
          </div>
          <p className="muted" style={{ margin: "6px 0 0", fontSize: 12 }}>
            Курсы кэшируются по дате в Route Handler. Строки без курса получают статус «требует проверки».
          </p>
        </div>

        {/* Compute */}
        <div style={{ marginTop: 12 }}>
          <button
            type="button"
            className="btn btn-primary"
            style={{ gap: 6 }}
            onClick={handleCompute}
          >
            <Calculator size={14} />
            Рассчитать предварительно
          </button>
          {computeError && (
            <p style={{ color: "var(--red)", fontSize: 13, marginTop: 8 }}>{computeError}</p>
          )}
        </div>

        {/* Results */}
        {result && (
          <>
            <div
              style={{
                marginTop: 20,
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
                gap: 12,
              }}
            >
              <MetricCard
                label="Налоговая база"
                value={fmtMoney(result.taxableBaseReport, result.reportCurrency)}
                sub={`метод: ${result.method}`}
              />
              <MetricCard
                label="Предварительный налог"
                value={fmtMoney(result.taxAmountReport, result.reportCurrency)}
                sub={`юрисдикция: ${result.jurisdiction}`}
                highlight
              />
              <MetricCard
                label="Включено / проверка / исключено"
                value={`${result.includedCount} / ${result.needsReviewCount} / ${result.excludedCount}`}
                sub="операций"
              />
            </div>

            {/* Tax brackets */}
            {result.appliedBrackets.length > 0 && (
              <div style={{ marginTop: 16 }}>
                <p className="eyebrow" style={{ margin: "0 0 8px" }}>Расчёт по ставкам</p>
                <div style={{ overflowX: "auto" }}>
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Ставка</th>
                        <th>База в брекете</th>
                        <th>Налог</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.appliedBrackets.map((b, i) => (
                        <tr key={i}>
                          <td>{(b.rate * 100).toFixed(0)}%</td>
                          <td>{fmtMoney(b.baseInBracket, result.reportCurrency)}</td>
                          <td>{fmtMoney(b.taxInBracket, result.reportCurrency)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Warnings */}
            {result.warnings.length > 0 && (
              <div style={{ marginTop: 14 }}>
                <p className="eyebrow" style={{ margin: "0 0 6px" }}>Предупреждения</p>
                {result.warnings.map((w, i) => (
                  <div
                    key={i}
                    style={{ display: "flex", gap: 8, alignItems: "flex-start", marginBottom: 4 }}
                  >
                    <AlertTriangle size={13} color="var(--amber)" style={{ flexShrink: 0, marginTop: 2 }} />
                    <span className="muted" style={{ fontSize: 12 }}>
                      {w}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Disposals table */}
            <div style={{ marginTop: 18 }}>
              <p className="eyebrow" style={{ margin: "0 0 8px" }}>
                Операции реализации ({result.disposals.length})
              </p>
              <div style={{ overflowX: "auto" }}>
                <table className="table">
                  <thead>
                    <tr>
                      <th>Дата</th>
                      <th>Актив</th>
                      <th>Кол-во</th>
                      <th>Выручка</th>
                      <th>Себестоимость</th>
                      <th>Прибыль/убыток</th>
                      <th>Статус</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.disposals.map((d) => (
                      <tr key={d.transactionId}>
                        <td>{d.date ?? "—"}</td>
                        <td>{d.asset}</td>
                        <td>{fmtNumber(d.quantity, 6)}</td>
                        <td>{fmtMoney(d.proceedsReport, result.reportCurrency)}</td>
                        <td>{fmtMoney(d.costBasisReport, result.reportCurrency)}</td>
                        <td
                          style={{
                            color:
                              d.gainReport === null
                                ? undefined
                                : d.gainReport >= 0
                                  ? "var(--green)"
                                  : "var(--red)",
                          }}
                        >
                          {fmtMoney(d.gainReport, result.reportCurrency)}
                        </td>
                        <td>{statusBadge(d.status)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <p className="muted" style={{ marginTop: 14, fontSize: 12 }}>
              {ENGINE_DISCLAIMER}
            </p>
          </>
        )}
      </div>

      <style jsx global>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </section>
  );
}

function MetricCard({
  label,
  value,
  sub,
  highlight,
}: {
  label: string;
  value: string;
  sub?: string;
  highlight?: boolean;
}) {
  return (
    <div
      style={{
        padding: "12px 14px",
        borderRadius: "var(--radius-sm)",
        border: `1px solid ${highlight ? "var(--blue)" : "var(--line)"}`,
        background: highlight ? "var(--blue-soft, #1a82ff18)" : "var(--panel-2)",
      }}
    >
      <p className="eyebrow" style={{ margin: "0 0 4px", fontSize: 11 }}>
        {label}
      </p>
      <p
        style={{
          margin: 0,
          fontSize: 18,
          fontWeight: 600,
          color: highlight ? "var(--blue)" : undefined,
        }}
      >
        {value}
      </p>
      {sub && (
        <p className="muted" style={{ margin: "2px 0 0", fontSize: 11 }}>
          {sub}
        </p>
      )}
    </div>
  );
}
