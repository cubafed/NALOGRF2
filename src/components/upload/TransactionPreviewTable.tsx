import type { Transaction } from "@/lib/domain/types";
import { DataPanel } from "@/components/ui/DataPanel";
import { StatusBadge } from "@/components/ui/StatusBadge";

export function TransactionPreviewTable({ transactions }: { transactions: Transaction[] }) {
  const preview = transactions.slice(0, 20);

  return (
    <DataPanel
      actions={<StatusBadge label={String(transactions.length)} status="ready" />}
      eyebrow="Операции"
      title="Первые 20 распознанных операций"
    >
        {preview.length === 0 ? (
          <p className="muted" style={{ marginTop: "16px" }}>
            Валидных транзакций пока нет.
          </p>
        ) : (
          <div style={{ overflowX: "auto", marginTop: "18px" }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Дата</th>
                  <th>Тип</th>
                  <th>Актив</th>
                  <th>Количество</th>
                  <th>Фиатная сумма</th>
                  <th>Комиссия</th>
                  <th>Источник</th>
                  <th>Строка CSV</th>
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
    </DataPanel>
  );
}

function formatFee(amount?: string, asset?: string): string {
  if (!amount && !asset) return "—";
  return [amount, asset].filter(Boolean).join(" ");
}
