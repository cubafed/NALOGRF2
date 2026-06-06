import Link from "next/link";
import { NoticeCard } from "@/components/ui/NoticeCard";

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
                <p className="eyebrow">Демо-ссылка партнера</p>
                <h2 style={{ margin: 0 }}>Проверить локальное сохранение partner tag</h2>
              </div>
              <Link href={href} className="btn btn-primary">
                {label}
              </Link>
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
    </section>
  );
}
