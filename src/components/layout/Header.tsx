import Link from "next/link";

export function Header() {
  return (
    <header className="topbar">
      <div className="container topbar-inner">
        <Link href="/" className="brand" aria-label="Crypto Audit Report">
          <span className="brand-mark">CA</span>
          <span>
            <strong>Crypto Audit Report</strong>
            <small>Предпросмотр отчета</small>
          </span>
        </Link>
        <nav className="nav" aria-label="Основные разделы">
          <Link href="/upload">Импорт</Link>
          <Link href="/problems">Проблемы</Link>
          <Link href="/report">Отчет</Link>
          <Link href="/saved-reports">Сохраненные</Link>
          <Link href="/partners">Партнерам</Link>
          <Link href="/account">Аккаунт</Link>
        </nav>
        <Link href="/upload" className="btn btn-primary">
          Импортировать CSV
        </Link>
      </div>
    </header>
  );
}
