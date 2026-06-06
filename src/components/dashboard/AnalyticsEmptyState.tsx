import Link from "next/link";

export function AnalyticsEmptyState() {
  return (
    <section className="panel">
      <div className="panel-inner empty-import-state">
        <p className="eyebrow">Analytics</p>
        <h1 style={{ margin: 0 }}>Пока нет данных для аналитики</h1>
        <p className="muted">
          Загрузите CSV на странице импорта или используйте sample CSV, чтобы увидеть
          аналитику криптоистории.
        </p>
        <div className="actions">
          <Link href="/upload" className="btn btn-primary">
            Перейти к загрузке CSV
          </Link>
        </div>
      </div>
    </section>
  );
}
