import type { RawCsvRow } from "@/lib/parsers/parser-types";
import { DataPanel } from "@/components/ui/DataPanel";
import { StatusBadge } from "@/components/ui/StatusBadge";

export function RawRowsPreview({ rows }: { rows: RawCsvRow[] }) {
  return (
    <DataPanel
      actions={<StatusBadge label={String(rows.length)} status="local" />}
      eyebrow="Исходные строки"
      title="Статус исходных строк"
    >
        {rows.length === 0 ? (
          <p className="muted" style={{ marginTop: "16px" }}>
            Исходных строк нет.
          </p>
        ) : (
          <div style={{ overflowX: "auto", marginTop: "18px" }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Строка</th>
                  <th>Статус</th>
                  <th>Краткое описание</th>
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
    </DataPanel>
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
