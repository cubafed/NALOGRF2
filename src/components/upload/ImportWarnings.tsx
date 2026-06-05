import type { ParserWarning } from "@/lib/parsers/parser-types";

export function ImportWarnings({ warnings }: { warnings: ParserWarning[] }) {
  return (
    <section className="panel">
      <div className="panel-inner">
        <div className="panel-head">
          <div>
            <p className="eyebrow">Warnings</p>
            <h2 style={{ margin: 0 }}>Предупреждения parser</h2>
          </div>
          <span className="badge">{warnings.length}</span>
        </div>
        {warnings.length === 0 ? (
          <p className="muted" style={{ marginTop: "16px" }}>
            Предупреждений нет.
          </p>
        ) : (
          <div style={{ overflowX: "auto", marginTop: "18px" }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Row</th>
                  <th>Field</th>
                  <th>Message</th>
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
      </div>
    </section>
  );
}
