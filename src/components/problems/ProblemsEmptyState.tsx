import Link from "next/link";

export function ProblemsEmptyState() {
  return (
    <section className="panel">
      <div className="panel-inner empty-import-state">
        <p className="eyebrow">Нет данных</p>
        <h2>Пока нет данных для problems dashboard</h2>
        <p className="muted">
          Загрузите CSV на странице импорта или используйте sample CSV, чтобы увидеть список
          проблем.
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
