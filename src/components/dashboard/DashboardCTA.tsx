import Link from "next/link";

export function DashboardCTA() {
  return (
    <section className="panel">
      <div className="panel-inner">
        <div className="panel-head">
          <div>
            <p className="eyebrow">Next steps</p>
            <h2 style={{ margin: 0 }}>Продолжить подготовку отчета</h2>
          </div>
          <div className="actions" style={{ marginTop: 0 }}>
            <Link href="/upload" className="btn">
              Загрузить CSV
            </Link>
            <Link href="/problems" className="btn btn-secondary">
              Открыть проблемы
            </Link>
            <Link href="/report" className="btn btn-primary">
              Открыть отчет
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
