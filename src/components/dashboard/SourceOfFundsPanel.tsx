import type { SourceOfFundsMetrics } from "@/lib/metrics/analytics-types";

interface SourceOfFundsPanelProps {
  metrics: SourceOfFundsMetrics;
}

const metricRows: Array<{
  label: string;
  key: keyof SourceOfFundsMetrics;
}> = [
  { label: "Missing cost basis", key: "missingCostBasisCount" },
  { label: "P2P inflows", key: "p2pInflowCount" },
  { label: "Large fiat withdrawals", key: "largeFiatWithdrawalCount" },
  { label: "Unmatched transfers", key: "unmatchedTransferCount" },
  { label: "Unknown source wallets", key: "unknownSourceWalletCount" },
  { label: "Unknown transaction types", key: "unknownTransactionTypeCount" },
  { label: "Affected rows", key: "affectedRowsCount" },
];

export function SourceOfFundsPanel({ metrics }: SourceOfFundsPanelProps) {
  return (
    <section className="panel">
      <div className="panel-inner">
        <p className="eyebrow">Source-of-funds review</p>
        <h2 style={{ margin: "0 0 16px" }}>Проблемы, которые могут потребовать пояснения</h2>
        <div className="metric-grid">
          {metricRows.map((row) => (
            <div className="metric" key={row.key}>
              <span>{row.label}</span>
              <strong>{metrics[row.key]}</strong>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
