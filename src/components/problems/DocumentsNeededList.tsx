interface DocumentsNeededListProps {
  documents: string[];
}

export function DocumentsNeededList({ documents }: DocumentsNeededListProps) {
  if (documents.length === 0) return null;
  return (
    <div>
      <p className="muted" style={{ margin: "0 0 4px", fontSize: "12px", fontWeight: 600 }}>
        Документы
      </p>
      <ul style={{ margin: 0, paddingLeft: "18px" }}>
        {documents.map((doc, i) => (
          <li key={i} className="muted" style={{ fontSize: "13px" }}>
            {doc}
          </li>
        ))}
      </ul>
    </div>
  );
}
