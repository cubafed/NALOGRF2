"use client";

import type { ReportPreviewModel } from "@/lib/report/report-types";
import { buildReportExportFilename } from "@/lib/report/build-report-export-filename";

interface ReportPrintActionsProps {
  report: ReportPreviewModel;
}

export function ReportPrintActions({ report }: ReportPrintActionsProps) {
  const filename = buildReportExportFilename(report);

  return (
    <section className="panel print-hidden">
      <div className="panel-inner">
        <div className="panel-head">
          <div>
            <p className="eyebrow">Экспорт</p>
            <h2 style={{ margin: 0 }}>Печать и PDF</h2>
          </div>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => window.print()}
          >
            Печать / сохранить PDF
          </button>
        </div>
        <p className="muted" style={{ marginBottom: 0 }}>
          Файл можно сохранить как PDF через системное окно печати браузера.
        </p>
        <p className="muted" style={{ marginBottom: 0 }}>
          В этом MVP PDF создается локально через печать браузера. Данные не
          отправляются на сервер.
        </p>
        <p className="muted" style={{ marginBottom: 0 }}>
          Рекомендуемое имя файла: <code>{filename}</code>
        </p>
      </div>
    </section>
  );
}
