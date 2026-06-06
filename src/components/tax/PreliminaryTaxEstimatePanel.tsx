import type { PreliminaryTaxEstimate } from "@/lib/tax/manual-cost-basis-types";

const DISCLAIMER =
  "Не является налоговой, юридической или финансовой консультацией. Расчет предварительный и основан только на данных пользователя.";

function formatMoney(value: number, currency: string): string {
  return new Intl.NumberFormat("ru-RU", {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  }).format(value) + ` ${currency}`;
}

export function PreliminaryTaxEstimatePanel({
  estimate,
}: {
  estimate: PreliminaryTaxEstimate;
}) {
  const { summary } = estimate;

  return (
    <section className="panel">
      <div className="panel-inner">
        <div className="panel-head">
          <div>
            <p className="eyebrow">Предварительная налоговая оценка</p>
            <h2 style={{ margin: 0 }}>Итог по включенным операциям</h2>
          </div>
          <span className="badge">Local-only</span>
        </div>

        <div className="metric-grid" style={{ marginTop: 18 }}>
          <div className="metric">
            <span>Включено</span>
            <strong>{summary.includedOperations}</strong>
          </div>
          <div className="metric">
            <span>Исключено</span>
            <strong>{summary.excludedOperations}</strong>
          </div>
          <div className="metric">
            <span>Требует проверки</span>
            <strong>{summary.needsReviewOperations}</strong>
          </div>
          <div className="metric">
            <span>Taxable candidates</span>
            <strong>{summary.taxableCandidates}</strong>
          </div>
        </div>

        <div className="grid-3" style={{ marginTop: 18 }}>
          <div className="panel" style={{ background: "var(--panel-2)" }}>
            <div className="panel-inner">
              <p className="eyebrow">Proceeds</p>
              <strong style={{ fontSize: 22 }}>
                {formatMoney(summary.totalProceedsFiat, summary.fiatCurrency)}
              </strong>
            </div>
          </div>
          <div className="panel" style={{ background: "var(--panel-2)" }}>
            <div className="panel-inner">
              <p className="eyebrow">Manual cost basis + fees</p>
              <strong style={{ fontSize: 22 }}>
                {formatMoney(
                  summary.totalManualCostBasisFiat + summary.totalFeesFiat,
                  summary.fiatCurrency,
                )}
              </strong>
            </div>
          </div>
          <div className="panel" style={{ background: "var(--blue-soft)" }}>
            <div className="panel-inner">
              <p className="eyebrow">Preliminary result</p>
              <strong style={{ fontSize: 22 }}>
                {formatMoney(summary.preliminaryTaxableResultFiat, summary.fiatCurrency)}
              </strong>
            </div>
          </div>
        </div>

        <p className="muted" style={{ margin: "18px 0 0", fontSize: 13 }}>
          {DISCLAIMER}
        </p>
      </div>
    </section>
  );
}
