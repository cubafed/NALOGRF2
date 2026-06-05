import Link from "next/link";

export function Header() {
  return (
    <header className="topbar">
      <div className="container topbar-inner">
        <Link href="/" className="brand" aria-label="Crypto Audit Report">
          <span className="brand-mark">CA</span>
          <span>
            <strong>Crypto Audit Report</strong>
            <small>Source-of-Funds audit preview</small>
          </span>
        </Link>
        <nav className="nav" aria-label="Основные разделы">
          <Link href="/">Главная</Link>
          <Link href="/demo">Демо-отчет</Link>
          <span className="nav-placeholder" aria-disabled="true">
            Для партнеров
          </span>
        </nav>
        <Link href="/demo" className="btn btn-primary">
          Смотреть демо
        </Link>
      </div>
    </header>
  );
}
