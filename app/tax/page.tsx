import { FooterDisclaimer } from "@/components/layout/FooterDisclaimer";
import { Header } from "@/components/layout/Header";
import { TaxEnginePanel } from "@/components/tax/TaxEnginePanel";
import { ManualCostBasisPanel } from "@/components/tax/ManualCostBasisPanel";
import { AssistantPanel } from "@/components/assistant/AssistantPanel";

export const metadata = {
  title: "Предварительная налоговая оценка — Crypto Audit Report",
  description:
    "Локальная ручная база затрат и предварительная налоговая оценка по данным пользователя.",
};

export default function TaxPage() {
  return (
    <>
      <Header />
      <main>
        <section className="section">
          <div className="container">
            <div className="section-head">
              <p className="eyebrow">Tax-readiness MVP</p>
              <h1 style={{ margin: 0, fontSize: "clamp(38px, 5vw, 68px)", lineHeight: 1 }}>
                Предварительная налоговая оценка
              </h1>
              <p className="lead" style={{ marginTop: "14px" }}>
                Введите ручную базу затрат для поддерживаемых операций и получите
                предварительный результат для проверки бухгалтером или налоговым консультантом.
              </p>
            </div>
            <TaxEnginePanel />
            <div style={{ marginTop: 24 }}>
              <ManualCostBasisPanel />
            </div>
            <div style={{ marginTop: 24 }}>
              <AssistantPanel />
            </div>
          </div>
        </section>
      </main>
      <FooterDisclaimer />
    </>
  );
}
