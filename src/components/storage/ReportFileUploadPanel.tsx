"use client";

import Link from "next/link";
import { ChangeEvent, useEffect, useMemo, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { getSupabaseBrowserConfig } from "@/lib/supabase/config";
import { createSupabaseReportFileStorageService } from "@/lib/storage/report-file-storage-service.supabase";
import type { ReportFileRecord } from "@/lib/storage/report-file-types";
import type { ReportFileStorageService } from "@/lib/storage/report-file-types";
import { validateReportFile } from "@/lib/storage/validate-report-file";
import { ReportFilesList } from "@/components/storage/ReportFilesList";
import { StorageUnavailableNotice } from "@/components/storage/StorageUnavailableNotice";

interface ReportFileUploadPanelProps {
  savedReportId: string;
}

type UploadState =
  | { status: "unconfigured" }
  | { status: "loading" }
  | { status: "signed_out" }
  | { status: "ready"; service: ReportFileStorageService };

export function ReportFileUploadPanel({ savedReportId }: ReportFileUploadPanelProps) {
  const [state, setState] = useState<UploadState>(() => {
    return getSupabaseBrowserConfig().configured
      ? { status: "loading" }
      : { status: "unconfigured" };
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [files, setFiles] = useState<ReportFileRecord[]>([]);
  const [message, setMessage] = useState<{ text: string; tone: "success" | "error" } | null>(
    null,
  );
  const [isUploading, setIsUploading] = useState(false);

  const validation = useMemo(() => {
    return selectedFile ? validateReportFile(selectedFile) : null;
  }, [selectedFile]);

  useEffect(() => {
    const client = createSupabaseBrowserClient();

    if (!client) {
      setState({ status: "unconfigured" });
      return;
    }

    const supabaseClient = client;
    let active = true;

    async function initialize() {
      const userResult = await supabaseClient.auth.getUser();

      if (!active) {
        return;
      }

      if (!userResult.data.user) {
        setState({ status: "signed_out" });
        return;
      }

      const service = createSupabaseReportFileStorageService(supabaseClient);
      const existingFiles = await service.listReportFiles(savedReportId);

      if (!active) {
        return;
      }

      setFiles(existingFiles);
      setState({ status: "ready", service });
    }

    initialize();

    return () => {
      active = false;
    };
  }, [savedReportId]);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    setMessage(null);
    setSelectedFile(event.target.files?.[0] ?? null);
  };

  const handleUpload = async () => {
    if (state.status !== "ready" || !selectedFile) {
      return;
    }

    const nextValidation = validateReportFile(selectedFile);

    if (!nextValidation.ok) {
      setMessage({ text: nextValidation.message, tone: "error" });
      return;
    }

    setIsUploading(true);
    setMessage(null);

    const result = await state.service.uploadReportFile({
      savedReportId,
      file: selectedFile,
    });

    setIsUploading(false);

    if (!result.ok) {
      setMessage({ text: result.error, tone: "error" });
      return;
    }

    setFiles((currentFiles) => [result.record, ...currentFiles]);
    setSelectedFile(null);
    setMessage({ text: "PDF attachment загружен и связан с отчетом.", tone: "success" });
  };

  const handleDeleted = (id: string) => {
    setFiles((currentFiles) => currentFiles.filter((file) => file.id !== id));
    setMessage({ text: "PDF attachment удален.", tone: "success" });
  };

  const handleError = (text: string) => {
    setMessage({ text, tone: "error" });
  };

  return (
    <section className="panel">
      <div className="panel-inner">
        <div className="panel-head">
          <div>
            <p className="eyebrow">Report files</p>
            <h2 style={{ margin: 0 }}>Прикрепить PDF отчета</h2>
          </div>
          <span className="badge">Explicit upload only</span>
        </div>

        {state.status === "unconfigured" && <StorageUnavailableNotice />}

        {state.status === "loading" && (
          <p className="muted">Проверка Supabase Storage и аккаунта...</p>
        )}

        {state.status === "signed_out" && (
          <div>
            <p className="muted">
              Войдите в аккаунт, чтобы прикрепить PDF к сохраненному отчету.
            </p>
            <Link href="/account" className="btn btn-primary">
              Открыть аккаунт
            </Link>
          </div>
        )}

        {state.status === "ready" && (
          <div className="upload-stack" style={{ marginTop: "18px" }}>
            <div className="upload-box">
              <p className="upload-title">Выберите PDF файл</p>
              <p className="muted">
                Файл загружается только после явного выбора и подтверждения. Raw CSV не
                загружается в этом PR.
              </p>
              <input type="file" accept=".pdf,application/pdf" onChange={handleFileChange} />
              {selectedFile && (
                <p className="muted">
                  Selected: <strong>{selectedFile.name}</strong>
                </p>
              )}
              {validation && !validation.ok && (
                <p className="status-text status-error">{validation.message}</p>
              )}
              <div className="actions" style={{ marginTop: "16px" }}>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleUpload}
                  disabled={!selectedFile || isUploading || Boolean(validation && !validation.ok)}
                >
                  {isUploading ? "Загрузка..." : "Загрузить PDF"}
                </button>
              </div>
            </div>

            {message && (
              <p className={`status-text status-${message.tone}`}>{message.text}</p>
            )}

            <ReportFilesList
              files={files}
              service={state.service}
              onDeleted={handleDeleted}
              onError={handleError}
            />
          </div>
        )}
      </div>
    </section>
  );
}
