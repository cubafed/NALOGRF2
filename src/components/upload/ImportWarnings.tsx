import type { ParserWarning } from "@/lib/parsers/parser-types";
import { DataPanel } from "@/components/ui/DataPanel";
import { StatusBadge } from "@/components/ui/StatusBadge";

export function ImportWarnings({ warnings }: { warnings: ParserWarning[] }) {
  return (
    <DataPanel
      actions={<StatusBadge label={String(warnings.length)} status={warnings.length > 0 ? "needs_review" : "ready"} />}
      eyebrow="Импорт"
      title="Предупреждения импорта"
    >
        {warnings.length === 0 ? (
          <p className="muted" style={{ marginTop: "16px" }}>
            Предупреждений нет.
          </p>
        ) : (
          <div style={{ overflowX: "auto", marginTop: "18px" }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Код</th>
                  <th>Строка</th>
                  <th>Поле</th>
                  <th>Сообщение</th>
                </tr>
              </thead>
              <tbody>
                {warnings.map((warning, index) => (
                  <tr key={`${warning.code}-${warning.rowNumber ?? "global"}-${index}`}>
                    <td>{warning.code}</td>
                    <td>{warning.rowNumber ?? "—"}</td>
                    <td>{warning.field ?? "—"}</td>
                    <td>{warning.message}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
    </DataPanel>
  );
}
