"use client";

import { ChangeEvent, useMemo, useRef, useState } from "react";
import { sampleUniversalCsv } from "@/lib/demo/sample-universal-csv";
import type { ParseUniversalCsvResult } from "@/lib/parsers/parser-types";
import { parseUniversalCsv } from "@/lib/parsers/universal-csv-parser";
import { ImportErrors } from "@/components/upload/ImportErrors";
import { ImportSummary } from "@/components/upload/ImportSummary";
import { ImportWarnings } from "@/components/upload/ImportWarnings";
import { RawRowsPreview } from "@/components/upload/RawRowsPreview";
import { TransactionPreviewTable } from "@/components/upload/TransactionPreviewTable";

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

  const parseCsvText = (fileName: string, csvText: string) => {
    const result = parseUniversalCsv(csvText);
    setUploadState({ fileName, result });
    setUiError(null);
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
          </div>
          <ImportSummary summary={uploadState.result.summary} />
          <TransactionPreviewTable transactions={uploadState.result.transactions} />
          <ImportWarnings warnings={uploadState.result.warnings} />
          <ImportErrors errors={uploadState.result.errors} />
          <RawRowsPreview rows={uploadState.result.rawRows} />
        </>
      )}
    </div>
  );
}
