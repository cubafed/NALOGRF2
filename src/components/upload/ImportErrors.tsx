import type { ParserError } from "@/lib/parsers/parser-types";

export function ImportErrors({ errors }: { errors: ParserError[] }) {
  return (
    <section className="panel">
      <div className="panel-inner">
        <div className="panel-head">
          <div>
            <p className="eyebrow">Errors</p>
            <h2 style={{ margin: 0 }}>Ошибки parser</h2>
          </div>
          <span className="badge">{errors.length}</span>
        </div>
        {errors.length === 0 ? (
          <p className="muted" style={{ marginTop: "16px" }}>
            Ошибок нет.
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
      </div>
    </section>
  );
}
