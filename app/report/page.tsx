import Link from "next/link";
import { Calculator } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { FooterDisclaimer } from "@/components/layout/FooterDisclaimer";
import { ReportPreview } from "@/components/report/ReportPreview";

export const metadata = {
  title: "Предпросмотр отчета — Crypto Audit Report",
  description:
    "Структурированный предпросмотр отчета по источнику средств на основе локального импорта и проблем для проверки.",
};

export default function ReportPage() {
  return (
    <>
      <Header />
      <main>
        <div className="container" style={{ paddingTop: "48px", paddingBottom: "64px" }}>
          <div style={{ marginBottom: "32px" }}>
            <p className="eyebrow">Предпросмотр отчета</p>
            <h1 style={{ margin: "0 0 10px" }}>Предпросмотр отчета</h1>
            <p className="muted" style={{ maxWidth: "640px" }}>
              Структурированный предпросмотр отчета на основе последнего локального импорта и
              проблем для проверки. Помогает заранее подготовить пояснения и документы для банка,
              бухгалтера или налогового консультанта.
            </p>
            <Link href="/tax" className="btn" style={{ gap: 8, marginTop: 16, fontSize: 13 }}>
              <Calculator size={15} />
              Предварительная налоговая оценка
            </Link>
          </div>
          <ReportPreview />
        </div>
      </main>
      <FooterDisclaimer />
    </>
  );
}
