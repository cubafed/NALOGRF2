import { FooterDisclaimer } from "@/components/layout/FooterDisclaimer";
import { Header } from "@/components/layout/Header";
import { PartnerCTA } from "@/components/partners/PartnerCTA";
import { PartnerFlow } from "@/components/partners/PartnerFlow";
import { PartnerHero } from "@/components/partners/PartnerHero";
import { PartnerValueCards } from "@/components/partners/PartnerValueCards";

export const metadata = {
  title: "Для криптобирж и P2P-сообществ — Crypto Audit Report",
  description:
    "Static partner page for exchanges and P2P communities with browser-only partner attribution.",
};

export default function ExchangePartnersPage() {
  return (
    <>
      <Header />
      <main>
        <PartnerHero
          eyebrow="Exchange partners"
          title="Для криптобирж и P2P-сообществ"
          subtitle="Пользователям часто нужно подготовить transaction history для bank, accountant или tax review. Партнер может направить их в локальный upload/export flow."
          ctaHref="/upload?partner=demo-exchange&utm_source=exchange-page&utm_campaign=mvp-demo"
          ctaLabel="Открыть demo upload с partner tag"
        />
        <PartnerValueCards variant="exchanges" />
        <PartnerFlow />
        <PartnerCTA
          href="/upload?partner=demo-exchange&utm_source=exchange-page&utm_campaign=mvp-demo"
          label="Открыть demo upload с partner tag"
        />
      </main>
      <FooterDisclaimer />
    </>
  );
}
