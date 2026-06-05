import { FooterDisclaimer } from "@/components/layout/FooterDisclaimer";
import { Header } from "@/components/layout/Header";
import { PartnerCTA } from "@/components/partners/PartnerCTA";
import { PartnerFlow } from "@/components/partners/PartnerFlow";
import { PartnerHero } from "@/components/partners/PartnerHero";
import { PartnerValueCards } from "@/components/partners/PartnerValueCards";

export const metadata = {
  title: "Для бухгалтеров и налоговых консультантов — Crypto Audit Report",
  description:
    "Static partner page for accountants and tax consultants with local partner attribution.",
};

export default function AccountantPartnersPage() {
  return (
    <>
      <Header />
      <main>
        <PartnerHero
          eyebrow="Accountant partners"
          title="Для бухгалтеров и налоговых консультантов"
          subtitle="Клиенты могут загрузить CSV локально, увидеть missing data и review findings, а report preview помогает заранее сформулировать вопросы к клиенту."
          ctaHref="/upload?partner=demo-accountant&utm_source=accountant-page&utm_campaign=mvp-demo"
          ctaLabel="Открыть demo upload с partner tag"
        />
        <PartnerValueCards variant="accountants" />
        <PartnerFlow />
        <PartnerCTA
          href="/upload?partner=demo-accountant&utm_source=accountant-page&utm_campaign=mvp-demo"
          label="Открыть demo upload с partner tag"
        />
      </main>
      <FooterDisclaimer />
    </>
  );
}
