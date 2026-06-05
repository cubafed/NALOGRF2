import { Header } from "@/components/layout/Header";
import { FooterDisclaimer } from "@/components/layout/FooterDisclaimer";
import { ProblemsDashboard } from "@/components/problems/ProblemsDashboard";

export const metadata = {
  title: "Проблемы для проверки — Crypto Audit Report",
  description:
    "Список операций и пробелов в данных, которые могут потребовать пояснения для банка, бухгалтера или налогового консультанта.",
};

export default function ProblemsPage() {
  return (
    <>
      <Header />
      <main>
        <div className="container" style={{ paddingTop: "48px", paddingBottom: "64px" }}>
          <div style={{ marginBottom: "32px" }}>
            <p className="eyebrow">Problems dashboard</p>
            <h1 style={{ margin: "0 0 10px" }}>Проблемы для проверки</h1>
            <p className="muted" style={{ maxWidth: "640px" }}>
              Список операций и пробелов в данных, которые могут потребовать пояснения для банка,
              бухгалтера или налогового консультанта.
            </p>
          </div>
          <ProblemsDashboard />
        </div>
      </main>
      <FooterDisclaimer />
    </>
  );
}
