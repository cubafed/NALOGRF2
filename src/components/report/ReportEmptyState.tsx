import Link from "next/link";

export function ReportEmptyState() {
  return (
    <section className="panel">
      <div className="panel-inner empty-import-state">
        <p className="eyebrow">Нет данных</p>
        <h2>Пока нет данных для предпросмотра отчета</h2>
        <p className="muted">
          Загрузите CSV на странице импорта или используйте sample CSV, чтобы сформировать
          предпросмотр отчета.
        </p>
        <div className="actions" style={{ marginTop: "24px" }}>
          <Link href="/upload" className="btn btn-primary">
            Перейти к загрузке CSV
          </Link>
        </div>
      </div>
    </section>
  );
}
