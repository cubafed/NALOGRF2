import { AnalyticsDashboard } from "@/components/dashboard/AnalyticsDashboard";
import { FooterDisclaimer } from "@/components/layout/FooterDisclaimer";
import { Header } from "@/components/layout/Header";

export const metadata = {
  title: "Аналитика криптоистории — Crypto Audit Report",
  description:
    "Локальная аналитика качества импорта, источников данных, активности и готовности отчета.",
};

export default function DashboardPage() {
  return (
    <>
      <Header />
      <main>
        <section className="section">
          <div className="container">
            <AnalyticsDashboard />
          </div>
        </section>
      </main>
      <FooterDisclaimer />
    </>
  );
}
