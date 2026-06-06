"use client";

import type { ReportPreviewModel } from "@/lib/report/report-types";
import { buildReportExportFilename } from "@/lib/report/build-report-export-filename";
import { DataPanel } from "@/components/ui/DataPanel";
import { NoticeCard } from "@/components/ui/NoticeCard";

interface ReportPrintActionsProps {
  report: ReportPreviewModel;
}

export function ReportPrintActions({ report }: ReportPrintActionsProps) {
  const filename = buildReportExportFilename(report);

  return (
    <DataPanel
      actions={
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => window.print()}
          >
            Печать / сохранить PDF
          </button>
      }
      eyebrow="Экспорт"
      printHidden
      title="Печать и PDF"
    >
        <p className="muted" style={{ marginBottom: 0 }}>
          Файл можно сохранить как PDF через системное окно печати браузера.
        </p>
        <NoticeCard compact variant="info">
          <p className="muted">
            В этом MVP PDF создается локально через печать браузера. Данные не
            отправляются на сервер.
          </p>
        </NoticeCard>
        <p className="muted" style={{ marginBottom: 0 }}>
          Рекомендуемое имя файла: <code>{filename}</code>
        </p>
    </DataPanel>
  );
}
