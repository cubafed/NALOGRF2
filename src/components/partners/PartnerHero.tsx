import Link from "next/link";
import { MetricCard } from "@/components/ui/MetricCard";
import { NoticeCard } from "@/components/ui/NoticeCard";
import { StatusBadge } from "@/components/ui/StatusBadge";

interface PartnerHeroProps {
  eyebrow: string;
  title: string;
  subtitle: string;
  ctaHref: string;
  ctaLabel: string;
}

export function PartnerHero({
  eyebrow,
  title,
  subtitle,
  ctaHref,
  ctaLabel,
}: PartnerHeroProps) {
  return (
    <section className="section partner-hero">
      <div className="container">
        <div className="partner-hero-grid">
          <div>
            <p className="eyebrow">{eyebrow}</p>
            <h1>{title}</h1>
            <p className="lead">{subtitle}</p>
            <div className="actions">
              <Link href={ctaHref} className="btn btn-primary">
                {ctaLabel}
              </Link>
              <Link href="/upload" className="btn btn-secondary">
                Открыть импорт
              </Link>
            </div>
          </div>
          <div className="panel">
            <div className="panel-inner">
              <div className="panel-head">
                <div>
                  <p className="eyebrow">MVP tracking skeleton</p>
                  <h2 style={{ margin: 0 }}>Локальное сохранение partner tag</h2>
                </div>
                <StatusBadge status="local" />
              </div>
              <div className="metric-grid">
                <MetricCard label="Partner tag" value="локально" />
                <MetricCard label="Серверное хранение" value="нет" />
              </div>
              <NoticeCard compact variant="info">
                <p className="muted">
                  Partner attribution хранится только локально в браузере и не отправляется
                  на сервер в текущем MVP.
                </p>
              </NoticeCard>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
