import Link from "next/link";
import { FindingSummaryCard } from "@/components/audit/FindingSummaryCard";
import { FooterDisclaimer } from "@/components/layout/FooterDisclaimer";
import { Header } from "@/components/layout/Header";
import { HowItWorks } from "@/components/marketing/HowItWorks";
import { LandingHero } from "@/components/marketing/LandingHero";
import { UseCases } from "@/components/marketing/UseCases";
import { demoReport } from "@/lib/demo/demo-report";

export default function HomePage() {
  return (
    <>
      <Header />
      <main>
        <LandingHero />
        <HowItWorks />
        <section className="section">
          <div className="container">
            <div className="row-between" style={{ marginBottom: "24px" }}>
              <div className="section-head" style={{ marginBottom: 0 }}>
                <p className="eyebrow">Risk preview</p>
                <h2>Проблемы должны быть actionable, а не просто technical warning</h2>
              </div>
              <Link href="/demo" className="btn btn-primary">
                Открыть демо
              </Link>
              <Link href="/upload" className="btn btn-secondary">
                Проверить CSV
              </Link>
            </div>
            <div className="grid-3">
              {demoReport.findings.slice(0, 3).map((finding) => (
                <FindingSummaryCard finding={finding} key={finding.ruleId} />
              ))}
            </div>
          </div>
        </section>
        <UseCases />
      </main>
      <FooterDisclaimer />
    </>
  );
}
