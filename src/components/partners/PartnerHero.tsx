import Link from "next/link";

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
                Открыть upload
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
                <span className="badge">Browser-only</span>
              </div>
              <div className="metric-grid">
                <div className="metric">
                  <span>Partner tag</span>
                  <strong>local</strong>
                </div>
                <div className="metric">
                  <span>Server storage</span>
                  <strong>none</strong>
                </div>
              </div>
              <p className="muted" style={{ marginBottom: 0, marginTop: "16px" }}>
                В текущем MVP referral metadata сохраняется только в браузере пользователя и не
                отправляется на сервер.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
