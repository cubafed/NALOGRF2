import type { DocumentChecklistItem } from "@/lib/report/document-checklist-types";
import { DocumentChecklist } from "./DocumentChecklist";

interface ReportDocumentsSectionProps {
  documentsNeeded: string[];
  affectedRows: number[];
  documentChecklist: DocumentChecklistItem[];
}

export function ReportDocumentsSection({
  documentChecklist,
}: ReportDocumentsSectionProps) {
  return (
    <section className="panel">
      <div className="panel-inner">
        <p className="eyebrow">Документы</p>
        <h2 style={{ margin: "0 0 16px" }}>
          Что может понадобиться подготовить
        </h2>
        <DocumentChecklist items={documentChecklist} />
      </div>
    </section>
  );
}
