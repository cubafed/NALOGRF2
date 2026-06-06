"use client";

import { ChangeEvent, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { sampleUniversalCsv } from "@/lib/demo/sample-universal-csv";
import type { ParseUniversalCsvResult } from "@/lib/parsers/parser-types";
import { parseUniversalCsv } from "@/lib/parsers/universal-csv-parser";
import type { ReadinessLabel, RiskEngineResult, RiskFinding } from "@/lib/risk/risk-types";
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

const expectedColumns = [
  "date",
  "type",
  "asset",
  "amount",
  "price",
  "fiat_value",
  "fiat_currency",
  "fee",
  "fee_asset",
  "tx_hash",
  "order_id",
  "counterparty",
  "source",
  "notes",
];

const maxFileSizeMb = 5;
const maxFileSizeBytes = maxFileSizeMb * 1024 * 1024;

interface UploadState {
  fileName: string;
  result: ParseUniversalCsvResult;
}

export function CsvUploadPanel() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploadState, setUploadState] = useState<UploadState | null>(null);
  const [uiError, setUiError] = useState<string | null>(null);
  const [isReading, setIsReading] = useState(false);

  const expectedColumnText = useMemo(() => expectedColumns.join(", "), []);
  const riskResult = useMemo(
    () => (uploadState ? runRiskEngine(uploadState.result.transactions) : null),
    [uploadState],
  );

  const parseCsvText = (fileName: string, csvText: string) => {
    const result = parseUniversalCsv(csvText);
    setUploadState({ fileName, result });
    setUiError(null);
    // Save to browser session storage for /problems
    const riskRes = runRiskEngine(result.transactions);
    saveLatestImportSession(buildImportSession(fileName, result, riskRes));
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".csv")) {
      setUploadState(null);
      setUiError("Выберите файл в формате .csv.");
      event.target.value = "";
      return;
    }

    if (file.size > maxFileSizeBytes) {
      setUploadState(null);
      setUiError(`Файл больше ${maxFileSizeMb} MB. Для MVP загрузите меньший CSV.`);
      event.target.value = "";
      return;
    }

    const reader = new FileReader();
    setIsReading(true);
    setUiError(null);

    reader.onload = () => {
      setIsReading(false);
      const text = typeof reader.result === "string" ? reader.result : "";
      parseCsvText(file.name, text);
    };

    reader.onerror = () => {
      setIsReading(false);
      setUploadState(null);
      setUiError("Не удалось прочитать файл в браузере. Попробуйте другой CSV.");
    };

    reader.readAsText(file);
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

  return (
    <div className="upload-stack">
      <PartnerAttributionPreview />

      <section className="panel">
        <div className="panel-inner">
          <div className="panel-head">
            <div>
              <p className="eyebrow">Local CSV import</p>
              <h2 style={{ margin: 0 }}>Universal CSV</h2>
            </div>
            <span className="badge">Browser-only</span>
          </div>

          <div className="upload-grid">
            <div className="upload-box">
              <input
                ref={inputRef}
                className="file-input"
                type="file"
                accept=".csv,text/csv"
                onChange={handleFileChange}
                aria-label="Выберите CSV файл"
              />
              <p className="upload-title">Выберите `.csv` файл</p>
              <p className="muted">
                Accepted format: `.csv`. Max file size for this MVP: {maxFileSizeMb} MB.
              </p>
              <div className="actions" style={{ marginTop: "18px" }}>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => inputRef.current?.click()}
                  disabled={isReading}
                >
                  {isReading ? "Чтение файла..." : "Выбрать файл"}
                </button>
                <button type="button" className="btn btn-secondary" onClick={handleSample}>
                  Use sample CSV
                </button>
                <button type="button" className="btn" onClick={handleClear}>
                  Clear
                </button>
              </div>
            </div>

            <div className="card">
              <span className="card-number">Expected columns</span>
              <p style={{ marginTop: "10px", overflowWrap: "anywhere" }}>{expectedColumnText}</p>
              <p className="muted" style={{ marginTop: "14px" }}>
                В этом MVP файл читается локально в браузере. Мы не сохраняем файл и не
                отправляем данные на сервер.
              </p>
              <p className="muted" style={{ marginTop: "10px" }}>
                Информационный отчет. Не является налоговой, юридической, финансовой или
                AML-консультацией.
              </p>
            </div>
          </div>

          {uiError && <p className="error-text">{uiError}</p>}
        </div>
      </section>

      {!uploadState && !uiError && (
        <section className="panel">
          <div className="panel-inner empty-import-state">
            <p className="eyebrow">Empty state</p>
            <h2>Файл еще не выбран</h2>
            <p className="muted">
              Загрузите Universal CSV или нажмите “Use sample CSV”, чтобы увидеть import preview.
            </p>
          </div>
        </section>
      )}

      {uploadState && (
        <>
          <div className="row-between">
            <div>
              <p className="eyebrow">Selected file</p>
              <h2 style={{ margin: 0 }}>{uploadState.fileName}</h2>
            </div>
            <span className="badge">
              {uploadState.result.summary.transactionCount} parsed transactions
            </span>
            <Link href="/dashboard" className="btn btn-secondary" style={{ fontSize: "13px" }}>
              Открыть аналитику
            </Link>
          </div>
          <ImportSummary summary={uploadState.result.summary} />
          {riskResult && <ReviewFindingsPanel result={riskResult} />}
          <TransactionPreviewTable transactions={uploadState.result.transactions} />
          <ImportWarnings warnings={uploadState.result.warnings} />
          <ImportErrors errors={uploadState.result.errors} />
          <RawRowsPreview rows={uploadState.result.rawRows} />
        </>
      )}
    </div>
  );
}

function ReviewFindingsPanel({ result }: { result: RiskEngineResult }) {
  return (
    <section className="panel">
      <div className="panel-inner">
        <div className="panel-head">
          <div>
            <p className="eyebrow">Проблемы для проверки</p>
            <h2 style={{ margin: 0 }}>Пробелы по источнику средств и проблемы для проверки</h2>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span className="badge">{formatReadinessLabel(result.readinessLabel)}</span>
            <Link href="/dashboard" className="btn btn-secondary" style={{ fontSize: "13px" }}>
              Аналитика
            </Link>
            <Link href="/problems" className="btn btn-primary" style={{ fontSize: "13px" }}>
              Посмотреть проблемы
            </Link>
          </div>
        </div>

        <div className="metric-grid">
          <div className="metric">
            <span>Readiness score</span>
            <strong>{result.readinessScore}/100</strong>
          </div>
          <div className="metric">
            <span>Total findings</span>
            <strong>{result.summary.totalFindings}</strong>
          </div>
          <div className="metric">
            <span>Critical / medium / low</span>
            <strong>
              {result.summary.criticalCount} / {result.summary.mediumCount} /{" "}
              {result.summary.lowCount}
            </strong>
          </div>
          <div className="metric">
            <span>Affected transactions</span>
            <strong>{result.summary.affectedTransactionCount}</strong>
          </div>
        </div>

        {result.findings.length === 0 ? (
          <p className="muted" style={{ marginTop: "16px" }}>
            Проблемы для проверки не найдены. Это не является налоговой, юридической,
            финансовой или AML-консультацией.
          </p>
        ) : (
          <div className="review-findings-grid">
            {result.findings.map((finding) => (
              <ReviewFindingCard finding={finding} key={finding.id} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function ReviewFindingCard({ finding }: { finding: RiskFinding }) {
  return (
    <article className="finding">
      <span className={`severity severity-${finding.severity}`}>{finding.severity}</span>
      <div>
        <h3 style={{ margin: "0 0 6px" }}>{finding.title}</h3>
        <p className="muted" style={{ margin: 0 }}>
          Rule ID: <strong>{finding.ruleId}</strong>
        </p>
      </div>
      <p style={{ margin: 0 }}>{finding.explanation}</p>
      <p className="muted" style={{ margin: 0 }}>
        <strong>Why it matters:</strong> {finding.whyItMatters}
      </p>
      <p className="muted" style={{ margin: 0 }}>
        <strong>Recommended action:</strong> {finding.recommendedAction}
      </p>
      <p className="muted" style={{ margin: 0 }}>
        <strong>Documents:</strong> {finding.documentsNeeded.join(", ")}
      </p>
      <p className="muted" style={{ margin: 0 }}>
        <strong>Affected raw rows:</strong>{" "}
        {finding.affectedRawRowNumbers.length > 0
          ? finding.affectedRawRowNumbers.join(", ")
          : "—"}
      </p>
    </article>
  );
}

function formatReadinessLabel(label: ReadinessLabel): string {
  if (label === "good") return "Good";
  if (label === "needs_review") return "Needs review";
  return "High risk";
}
