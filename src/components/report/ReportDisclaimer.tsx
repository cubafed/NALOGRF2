interface ReportDisclaimerProps {
  disclaimer: string;
}

export function ReportDisclaimer({ disclaimer }: ReportDisclaimerProps) {
  return (
    <section className="panel">
      <div className="panel-inner">
        <p className="muted" style={{ margin: "0 0 6px", fontSize: "13px" }}>
          🔒 Данные загружены из локального браузерного сеанса. В этом MVP они не сохраняются на
          сервере.
        </p>
        <p className="muted" style={{ margin: 0, fontSize: "13px" }}>
          ℹ️ {disclaimer}
        </p>
      </div>
    </section>
  );
}
