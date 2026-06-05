interface AffectedRowsListProps {
  rowNumbers: number[];
  transactionIds: string[];
}

export function AffectedRowsList({ rowNumbers, transactionIds }: AffectedRowsListProps) {
  const hasRows = rowNumbers.length > 0;
  const hasTxIds = transactionIds.length > 0;
  if (!hasRows && !hasTxIds) return null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
      {hasRows && (
        <p className="muted" style={{ margin: 0, fontSize: "12px" }}>
          <strong>Затронутые строки:</strong> {rowNumbers.join(", ")}
        </p>
      )}
      {hasTxIds && (
        <p className="muted" style={{ margin: 0, fontSize: "12px" }}>
          <strong>ID транзакций:</strong>{" "}
          {transactionIds.slice(0, 5).join(", ")}
          {transactionIds.length > 5 && ` +${transactionIds.length - 5} ещё`}
        </p>
      )}
    </div>
  );
}
