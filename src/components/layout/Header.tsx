"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Shield, Upload } from "lucide-react";

const NAV_LINKS = [
  { href: "/", label: "Главная" },
  { href: "/demo", label: "Демо" },
  { href: "/upload", label: "Загрузить" },
  { href: "/problems", label: "Проблемы" },
  { href: "/report", label: "Отчет" },
  { href: "/partners", label: "Партнерам" },
];

export function Header() {
  const pathname = usePathname();

  return (
    <header className="topbar">
      <div className="container topbar-inner">
        <Link href="/" className="brand" aria-label="Crypto Audit Report — на главную">
          <span
            className="brand-mark"
            style={{ display: "flex", alignItems: "center", justifyContent: "center" }}
          >
            <Shield size={20} strokeWidth={2.5} />
          </span>
          <span>
            <strong>CryptoAudit</strong>
            <small>Source-of-Funds Report</small>
          </span>
        </Link>

        <nav className="nav" aria-label="Основные разделы">
          {NAV_LINKS.map(({ href, label }) => {
            const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={active ? "nav-active" : undefined}
                style={{ letterSpacing: "0.01em", fontSize: 13 }}
              >
                {label}
              </Link>
            );
          })}
        </nav>

        <Link href="/upload" className="btn btn-primary" style={{ gap: 8 }}>
          <Upload size={15} />
          Загрузить CSV
        </Link>
      </div>
    </header>
  );
}
