interface ReportDocumentsSectionProps {
  documentsNeeded: string[];
  affectedRows: number[];
}

export function ReportDocumentsSection({
  documentsNeeded,
  affectedRows,
}: ReportDocumentsSectionProps) {
  return (
    <section className="panel">
      <div className="panel-inner">
        <p className="eyebrow">Документы</p>
        <h2 style={{ margin: "0 0 16px" }}>Что может понадобиться подготовить</h2>

        {documentsNeeded.length === 0 ? (
          <p className="muted">Дополнительные документы по findings не указаны.</p>
        ) : (
          <ul style={{ margin: 0, paddingLeft: "18px" }}>
            {documentsNeeded.map((doc) => (
              <li key={doc} style={{ fontSize: "14px", marginBottom: "4px" }}>
                {doc}
              </li>
            ))}
          </ul>
        )}

        {affectedRows.length > 0 && (
          <p className="muted" style={{ marginTop: "16px", fontSize: "13px" }}>
            <strong>Затронутые строки:</strong> {affectedRows.join(", ")}
          </p>
        )}
      </div>
    </section>
  );
}
