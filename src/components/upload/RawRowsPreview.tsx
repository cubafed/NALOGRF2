import type { RawCsvRow } from "@/lib/parsers/parser-types";

export function RawRowsPreview({ rows }: { rows: RawCsvRow[] }) {
  return (
    <section className="panel">
      <div className="panel-inner">
        <div className="panel-head">
          <div>
            <p className="eyebrow">Raw rows</p>
            <h2 style={{ margin: 0 }}>Статус исходных строк</h2>
          </div>
          <span className="badge">{rows.length}</span>
        </div>
        {rows.length === 0 ? (
          <p className="muted" style={{ marginTop: "16px" }}>
            Исходных строк нет.
          </p>
        ) : (
          <div style={{ overflowX: "auto", marginTop: "18px" }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Row</th>
                  <th>Status</th>
                  <th>Raw summary</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.rowNumber}>
                    <td>{row.rowNumber}</td>
                    <td>{row.status}</td>
                    <td>{summarizeRawRow(row)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}

function summarizeRawRow(row: RawCsvRow): string {
  const fields = ["date", "type", "asset", "amount", "source", "notes"];
  return fields
    .map((field) => {
      const value = row.normalized[field];
      return value ? `${field}: ${value}` : "";
    })
    .filter(Boolean)
    .join(" · ");
}
