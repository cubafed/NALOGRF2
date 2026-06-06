"use client";

import { ChangeEvent, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { UploadCloud, CheckCircle2, FileText, AlertTriangle, ArrowRight, X } from "lucide-react";
import { sampleUniversalCsv } from "@/lib/demo/sample-universal-csv";
import type { ParseUniversalCsvResult } from "@/lib/parsers/parser-types";
import { parseUniversalCsv } from "@/lib/parsers/universal-csv-parser";
import type { ReadinessLabel, RiskEngineResult } from "@/lib/risk/risk-types";
import { runRiskEngine } from "@/lib/risk/run-risk-engine";
import {
  saveLatestImportSession,
  buildImportSession,
} from "@/lib/client/import-session-storage";
import { ImportErrors } from "@/components/upload/ImportErrors";
import { ImportSummary } from "@/components/upload/ImportSummary";
import { ImportWarnings } from "@/components/upload/ImportWarnings";
import { RawRowsPreview } from "@/components/upload/RawRowsPreview";
import { TransactionPreviewTable } from "@/components/upload/TransactionPreviewTable";
import { PartnerAttributionPreview } from "@/components/partners/PartnerAttributionPreview";
import { ReadinessGauge } from "@/components/ui/ReadinessGauge";
import { FindingsBreakdown } from "@/components/ui/FindingsBreakdown";
import { SeverityBadge } from "@/components/ui/SeverityBadge";
import { StatCard } from "@/components/ui/StatCard";

const EXPECTED_COLUMNS = [
  "date", "type", "asset", "amount", "price", "fiat_value",
  "fiat_currency", "fee", "fee_asset", "tx_hash", "order_id",
  "counterparty", "source", "notes",
];

const MAX_MB = 5;
const MAX_BYTES = MAX_MB * 1024 * 1024;

interface UploadState {
  fileName: string;
  result: ParseUniversalCsvResult;
}

export function CsvUploadPanel() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploadState, setUploadState] = useState<UploadState | null>(null);
  const [uiError, setUiError] = useState<string | null>(null);
  const [isReading, setIsReading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const riskResult = useMemo(
    () => (uploadState ? runRiskEngine(uploadState.result.transactions) : null),
    [uploadState],
  );

  const parseCsvText = (fileName: string, csvText: string) => {
    const result = parseUniversalCsv(csvText);
    setUploadState({ fileName, result });
    setUiError(null);
    const riskRes = runRiskEngine(result.transactions);
    saveLatestImportSession(buildImportSession(fileName, result, riskRes));
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    processFile(file);
    event.target.value = "";
  };

  const processFile = (file: File) => {
    if (!file.name.toLowerCase().endsWith(".csv")) {
      setUploadState(null);
      setUiError("Выберите файл в формате .csv.");
      return;
    }
    if (file.size > MAX_BYTES) {
      setUploadState(null);
      setUiError(`Файл больше ${MAX_MB} MB. Загрузите меньший CSV.`);
      return;
    }
    const reader = new FileReader();
    setIsReading(true);
    setUiError(null);
    reader.onload = () => {
      setIsReading(false);
      parseCsvText(file.name, typeof reader.result === "string" ? reader.result : "");
    };
    reader.onerror = () => {
      setIsReading(false);
      setUiError("Не удалось прочитать файл. Попробуйте другой CSV.");
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const handleSample = () => {
    if (inputRef.current) inputRef.current.value = "";
    parseCsvText("sample-universal.csv", sampleUniversalCsv);
  };

  const handleClear = () => {
    if (inputRef.current) inputRef.current.value = "";
    setUploadState(null);
    setUiError(null);
    setIsReading(false);
  };

  const isSuccess = !!uploadState && !isReading;

  return (
    <div className="upload-stack">
      <PartnerAttributionPreview />

      {/* Drop Zone */}
      <section className="panel">
        <div className="panel-inner">
          <div className="flex-between" style={{ marginBottom: 20 }}>
            <div>
              <p className="eyebrow">Локальный импорт CSV</p>
              <h2 style={{ margin: 0 }}>Universal CSV</h2>
            </div>
            <span className="badge">
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--green)", display: "inline-block", marginRight: 6 }} />
              Browser-only
            </span>
          </div>

          <input
            ref={inputRef}
            className="file-input"
            type="file"
            accept=".csv,text/csv"
            onChange={handleFileChange}
            aria-label="Выберите CSV файл"
          />

          <div
            className={`drop-zone${isDragOver ? " drop-zone--active" : ""}${isSuccess ? " drop-zone--success" : ""}`}
            onClick={() => !isSuccess && inputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
            role="button"
            tabIndex={0}
            aria-label="Зона загрузки файла — нажмите или перетащите CSV"
            onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
          >
            <AnimatePresence mode="wait">
              {isReading ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}
                >
                  <div style={{ animation: "spin-slow 1s linear infinite", color: "var(--blue)" }}>
                    <UploadCloud size={36} />
                  </div>
                  <p className="muted" style={{ margin: 0, fontSize: 13 }}>Чтение файла...</p>
                </motion.div>
              ) : isSuccess ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}
                >
                  <CheckCircle2 size={36} color="var(--green)" />
                  <div style={{ textAlign: "center" }}>
                    <p style={{ margin: 0, fontWeight: 700, fontSize: 14 }}>{uploadState.fileName}</p>
                    <p className="muted" style={{ margin: "4px 0 0", fontSize: 12 }}>
                      {uploadState.result.summary.transactionCount} транзакций разобрано
                    </p>
                  </div>
                  <button
                    type="button"
                    className="btn"
                    style={{ fontSize: 12, padding: "4px 12px", minHeight: 30 }}
                    onClick={(e) => { e.stopPropagation(); handleClear(); }}
                  >
                    <X size={12} />
                    Загрузить другой файл
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  key="idle"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}
                >
                  <UploadCloud size={36} color="var(--blue)" />
                  <div style={{ textAlign: "center" }}>
                    <p style={{ margin: 0, fontWeight: 700, fontSize: 15 }}>
                      {isDragOver ? "Отпустите файл здесь" : "Нажмите или перетащите CSV"}
                    </p>
                    <p className="muted" style={{ margin: "6px 0 0", fontSize: 12 }}>
                      .csv, до {MAX_MB} MB — данные остаются в браузере
                    </p>
                  </div>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    style={{ fontSize: 12, padding: "4px 14px", minHeight: 30 }}
                    onClick={(e) => { e.stopPropagation(); handleSample(); }}
                  >
                    Загрузить пример
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {uiError && (
            <motion.p
              className="error-text"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ display: "flex", alignItems: "center", gap: 8 }}
            >
              <AlertTriangle size={14} />
              {uiError}
            </motion.p>
          )}

          <details style={{ marginTop: 16 }}>
            <summary style={{ fontSize: 12, color: "var(--muted)", cursor: "pointer", userSelect: "none" }}>
              Ожидаемые колонки CSV
            </summary>
            <p style={{ marginTop: 8, fontSize: 12, color: "var(--muted)", overflowWrap: "anywhere" }}>
              {EXPECTED_COLUMNS.join(", ")}
            </p>
            <p className="muted" style={{ marginTop: 8, fontSize: 12 }}>
              Информационный отчет. Не является налоговой, юридической, финансовой или AML-консультацией.
            </p>
          </details>
        </div>
      </section>

      {/* Empty state */}
      {!uploadState && !uiError && (
        <section className="panel">
          <div className="panel-inner empty-import-state">
            <FileText size={28} color="var(--muted)" style={{ marginBottom: 12 }} />
            <h3 style={{ margin: "0 0 8px" }}>Файл ещё не загружен</h3>
            <p className="muted">
              Загрузите Universal CSV или нажмите «Загрузить пример», чтобы увидеть превью.
            </p>
          </div>
        </section>
      )}

      {/* Results */}
      <AnimatePresence>
        {uploadState && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
            className="upload-stack"
          >
            {/* Header */}
            <div className="flex-between">
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <FileText size={18} color="var(--blue)" />
                <div>
                  <p className="eyebrow" style={{ margin: 0 }}>Загруженный файл</p>
                  <h2 style={{ margin: 0, fontSize: 18 }}>{uploadState.fileName}</h2>
                </div>
              </div>
              <span className="badge">
                {uploadState.result.summary.transactionCount} транзакций
              </span>
            </div>

            <ImportSummary summary={uploadState.result.summary} />

            {riskResult && <ReviewFindingsPanel result={riskResult} />}

            <TransactionPreviewTable transactions={uploadState.result.transactions} />
            <ImportWarnings warnings={uploadState.result.warnings} />
            <ImportErrors errors={uploadState.result.errors} />
            <RawRowsPreview rows={uploadState.result.rawRows} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ReviewFindingsPanel({ result }: { result: RiskEngineResult }) {
  return (
    <section className="panel">
      <div className="panel-inner">
        <div className="flex-between" style={{ marginBottom: 20 }}>
          <div>
            <p className="eyebrow">Анализ рисков</p>
            <h2 style={{ margin: 0 }}>Проблемы для проверки</h2>
          </div>
          <Link href="/problems" className="btn btn-primary" style={{ fontSize: 13, gap: 6 }}>
            Подробный анализ <ArrowRight size={14} />
          </Link>
        </div>

        {/* Gauge + stats */}
        <div style={{ display: "flex", gap: 24, alignItems: "flex-start", flexWrap: "wrap", marginBottom: 24 }}>
          <ReadinessGauge score={result.readinessScore} label={result.readinessLabel} size={160} />

          <div style={{ flex: 1, display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10, minWidth: 200 }}>
            <StatCard
              icon={<AlertTriangle size={16} color="var(--red)" />}
              iconBg="var(--red-soft)"
              value={result.summary.criticalCount}
              label="Критичных"
              valueColor={result.summary.criticalCount > 0 ? "var(--red)" : undefined}
            />
            <StatCard
              icon={<AlertTriangle size={16} color="var(--amber)" />}
              iconBg="var(--amber-soft)"
              value={result.summary.mediumCount}
              label="Средних"
              valueColor={result.summary.mediumCount > 0 ? "var(--amber)" : undefined}
            />
            <StatCard
              icon={<FileText size={16} color="var(--blue)" />}
              iconBg="var(--blue-soft)"
              value={result.summary.totalFindings}
              label="Всего findings"
            />
            <StatCard
              icon={<FileText size={16} color="var(--muted)" />}
              iconBg="rgba(255,255,255,0.06)"
              value={result.summary.affectedTransactionCount}
              label="Строк затронуто"
            />
          </div>
        </div>

        {/* Chart */}
        {result.findings.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <p className="eyebrow" style={{ marginBottom: 10 }}>Breakdown</p>
            <FindingsBreakdown summary={result.summary} />
          </div>
        )}

        {result.findings.length === 0 ? (
          <p className="muted">
            Проблемы для проверки не найдены. Не является налоговой, юридической или AML-консультацией.
          </p>
        ) : (
          <div style={{ display: "grid", gap: 8 }}>
            {result.findings.map((finding) => (
              <div key={finding.id} className="finding-v2">
                <div className={`finding-v2-stripe finding-v2-stripe-${finding.severity}`} />
                <div className="finding-v2-body">
                  <div className="finding-v2-header">
                    <h3 className="finding-v2-title">{finding.title}</h3>
                    <SeverityBadge severity={finding.severity} />
                  </div>
                  <p className="finding-v2-meta">{finding.explanation}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function _formatReadinessLabel(label: ReadinessLabel): string {
  if (label === "good") return "Готов";
  if (label === "needs_review") return "Требует проверки";
  return "Высокий риск";
}
