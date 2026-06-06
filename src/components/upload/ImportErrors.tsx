import type { ParserError } from "@/lib/parsers/parser-types";
import { DataPanel } from "@/components/ui/DataPanel";
import { StatusBadge } from "@/components/ui/StatusBadge";

export function ImportErrors({ errors }: { errors: ParserError[] }) {
  return (
    <DataPanel
      actions={<StatusBadge label={String(errors.length)} status={errors.length > 0 ? "error" : "ready"} />}
      eyebrow="Импорт"
      title="Ошибки импорта"
    >
        {errors.length === 0 ? (
          <p className="muted" style={{ marginTop: "16px" }}>
            Ошибок нет.
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
                {errors.map((error, index) => (
                  <tr key={`${error.code}-${error.rowNumber ?? "global"}-${index}`}>
                    <td>{error.code}</td>
                    <td>{error.rowNumber ?? "—"}</td>
                    <td>{error.field ?? "—"}</td>
                    <td>{error.message}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
    </DataPanel>
  );
}
