import type { ImportSession } from "@/lib/client/import-session-storage";
import type { SourceOfFundsMetrics } from "@/lib/metrics/analytics-types";

function affectedTransactionCount(session: ImportSession, ruleId: string): number {
  return session.riskResult.findings
    .filter((finding) => finding.ruleId === ruleId)
    .reduce((total, finding) => total + finding.affectedTransactionIds.length, 0);
}

export function calculateSourceOfFundsMetrics(
  session: ImportSession,
): SourceOfFundsMetrics {
  const affectedRows = new Set<number>();

  session.riskResult.findings.forEach((finding) => {
    finding.affectedRawRowNumbers.forEach((rowNumber) => affectedRows.add(rowNumber));
  });

  return {
    missingCostBasisCount: affectedTransactionCount(session, "missing_cost_basis_basic"),
    p2pInflowCount: affectedTransactionCount(session, "large_p2p_inflow"),
    largeFiatWithdrawalCount: affectedTransactionCount(session, "large_fiat_withdrawal"),
    unmatchedTransferCount: affectedTransactionCount(session, "unmatched_transfer"),
    unknownSourceWalletCount: affectedTransactionCount(session, "unknown_source_wallet"),
    unknownTransactionTypeCount: affectedTransactionCount(session, "unknown_transaction_type"),
    affectedRowsCount: affectedRows.size,
  };
}
