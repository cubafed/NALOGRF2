import { FooterDisclaimer } from "@/components/layout/FooterDisclaimer";
import { Header } from "@/components/layout/Header";
import { PartnerCTA } from "@/components/partners/PartnerCTA";
import { PartnerFlow } from "@/components/partners/PartnerFlow";
import { PartnerHero } from "@/components/partners/PartnerHero";
import { PartnerUseCases } from "@/components/partners/PartnerUseCases";
import { PartnerValueCards } from "@/components/partners/PartnerValueCards";
import { demoPartners } from "@/lib/partners/demo-partners";

export const metadata = {
  title: "Партнерам — Crypto Audit Report",
  description:
    "Static partner pages and browser-only partner attribution skeleton for Crypto Audit Report.",
};

export default function PartnersPage() {
  return (
    <>
      <Header />
      <main>
        <PartnerHero
          eyebrow="Партнерам"
          title="Партнерская программа для бирж, бухгалтеров и крипто-сообществ"
          subtitle="Помогайте пользователям подготовить криптоисторию для банка, бухгалтера или налогового консультанта — без хранения файлов на сервере в текущем MVP."
          ctaHref="/upload?partner=demo-partner&utm_source=partner-page&utm_campaign=mvp-demo"
          ctaLabel="Открыть демо-импорт"
        />
        <PartnerUseCases partners={demoPartners} />
        <PartnerFlow />
        <PartnerValueCards />
        <PartnerCTA
          href="/upload?partner=demo-partner&utm_source=partner-page&utm_campaign=mvp-demo"
          label="Открыть демо-импорт с partner tag"
        />
      </main>
      <FooterDisclaimer />
    </>
  );
}
