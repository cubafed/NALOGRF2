import { Header } from "@/components/layout/Header";
import { FooterDisclaimer } from "@/components/layout/FooterDisclaimer";
import { ReportPreview } from "@/components/report/ReportPreview";

export const metadata = {
  title: "Preview отчета — Crypto Audit Report",
  description:
    "Структурированный preview отчета по источнику средств на основе локального импорта и review findings.",
};

export default function ReportPage() {
  return (
    <>
      <Header />
      <main>
        <div className="container" style={{ paddingTop: "48px", paddingBottom: "64px" }}>
          <div style={{ marginBottom: "32px" }}>
            <p className="eyebrow">Report preview</p>
            <h1 style={{ margin: "0 0 10px" }}>Preview отчета</h1>
            <p className="muted" style={{ maxWidth: "640px" }}>
              Структурированный предпросмотр отчета на основе последнего локального импорта и
              review findings. Помогает заранее подготовить пояснения и документы для банка,
              бухгалтера или налогового консультанта.
            </p>
          </div>
          <ReportPreview />
        </div>
      </main>
      <FooterDisclaimer />
    </>
  );
}
