import type { Transaction } from "@/lib/domain/types";

export function TransactionPreviewTable({ transactions }: { transactions: Transaction[] }) {
  const preview = transactions.slice(0, 20);

  return (
    <section className="panel">
      <div className="panel-inner">
        <div className="panel-head">
          <div>
            <p className="eyebrow">Transactions preview</p>
            <h2 style={{ margin: 0 }}>Первые 20 parsed transactions</h2>
          </div>
          <span className="badge">{transactions.length}</span>
        </div>
        {preview.length === 0 ? (
          <p className="muted" style={{ marginTop: "16px" }}>
            Валидных транзакций пока нет.
          </p>
        ) : (
          <div style={{ overflowX: "auto", marginTop: "18px" }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Asset</th>
                  <th>Amount</th>
                  <th>Fiat value</th>
                  <th>Fee</th>
                  <th>Source</th>
                  <th>Raw row</th>
                </tr>
              </thead>
              <tbody>
                {preview.map((transaction) => (
                  <tr key={transaction.id}>
                    <td>{transaction.timestamp ?? transaction.date ?? "—"}</td>
                    <td>{transaction.type}</td>
                    <td>{transaction.asset}</td>
                    <td>{transaction.amount}</td>
                    <td>{transaction.fiatValue ?? "—"}</td>
                    <td>{formatFee(transaction.feeAmount, transaction.feeAsset)}</td>
                    <td>{transaction.source ?? "—"}</td>
                    <td>{transaction.rawRowNumber ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}

function formatFee(amount?: string, asset?: string): string {
  if (!amount && !asset) return "—";
  return [amount, asset].filter(Boolean).join(" ");
}
