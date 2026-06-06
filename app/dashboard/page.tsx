import { Header } from "@/components/layout/Header";
import { FooterDisclaimer } from "@/components/layout/FooterDisclaimer";
import { AnalyticsDashboard } from "@/components/dashboard/AnalyticsDashboard";

export const metadata = {
  title: "Аналитика — Crypto Audit Report",
  description:
    "Денежный поток, полнота данных и активность по месяцам на основе загруженных CSV-данных.",
};

export default function DashboardPage() {
  return (
    <>
      <Header />
      <main>
        <div className="container" style={{ paddingTop: "48px", paddingBottom: "64px" }}>
          <div style={{ marginBottom: "32px" }}>
            <p className="eyebrow">Analytics dashboard</p>
            <h1 style={{ margin: "0 0 10px" }}>Аналитика</h1>
            <p className="muted" style={{ maxWidth: "640px" }}>
              Денежный поток, полнота данных и активность по месяцам — по загруженным данным CSV.
              Значения рассчитаны только по локальным данным.
            </p>
          </div>
          <AnalyticsDashboard />
        </div>
      </main>
      <FooterDisclaimer />
    </>
  );
}
