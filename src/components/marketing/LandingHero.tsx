import Link from "next/link";
import { demoReport } from "@/lib/demo/demo-report";
import { ReportPreviewPanel } from "@/components/audit/ReportPreviewPanel";

export function LandingHero() {
  return (
    <section className="container hero">
      <div>
        <p className="eyebrow">Crypto source-of-funds audit</p>
        <h1>Подготовьте криптоисторию для банка, бухгалтера и налоговой</h1>
        <p className="lead">
          Загрузите операции с биржи, найдите проблемные места и получите понятный
          отчет происхождения средств.
        </p>
        <div className="actions">
          <Link href="/demo" className="btn btn-primary">
            Посмотреть демо-отчет
          </Link>
          <span className="btn btn-secondary" aria-disabled="true">
            Для бирж и партнеров
          </span>
        </div>
        <div className="hero-stats" aria-label="Ключевые параметры">
          <div>
            <strong>CSV-first</strong>
            <span>без API-ключей в MVP</span>
          </div>
          <div>
            <strong>Rules</strong>
            <span>детерминированные finding rules</span>
          </div>
          <div>
            <strong>Report</strong>
            <span>для банка и консультанта</span>
          </div>
        </div>
      </div>
      <ReportPreviewPanel report={demoReport} />
    </section>
  );
}
