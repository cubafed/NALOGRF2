import Link from "next/link";

interface PartnerCTAProps {
  href: string;
  label: string;
}

export function PartnerCTA({ href, label }: PartnerCTAProps) {
  return (
    <section className="section">
      <div className="container">
        <div className="panel">
          <div className="panel-inner">
            <div className="panel-head">
              <div>
                <p className="eyebrow">Demo referral link</p>
                <h2 style={{ margin: 0 }}>Проверить локальное сохранение partner tag</h2>
              </div>
              <Link href={href} className="btn btn-primary">
                {label}
              </Link>
            </div>
            <p className="muted" style={{ marginBottom: 0 }}>
              В этом MVP partner attribution хранится только локально в браузере и не
              отправляется на сервер.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
