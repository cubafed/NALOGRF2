import type { Transaction, TransactionType } from "@/lib/domain/types";
import type { TaxEventClassification } from "@/lib/tax/tax-event-types";

const supportedTypes: readonly TransactionType[] = [
  "buy",
  "sell",
  "deposit",
  "withdrawal",
  "transfer",
  "fee",
  "p2p",
  "conversion",
  "income",
  "unknown",
];

function hasText(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function hasFiatValue(transaction: Transaction): boolean {
  return hasText(transaction.fiatValue);
}

function hasRequiredCoreData(transaction: Transaction): boolean {
  return hasText(transaction.id) && hasText(transaction.asset) && hasText(transaction.amount);
}

function isSupportedTransactionType(value: unknown): value is TransactionType {
  return typeof value === "string" && supportedTypes.includes(value as TransactionType);
}

function containsP2pMarker(value: unknown): boolean {
  return typeof value === "string" && value.toLowerCase().includes("p2p");
}

function isP2pIndicated(transaction: Transaction): boolean {
  return (
    transaction.type === "p2p" ||
    containsP2pMarker(transaction.source) ||
    containsP2pMarker(transaction.originalType) ||
    containsP2pMarker(transaction.notes) ||
    containsP2pMarker(transaction.counterparty)
  );
}

function rawRowId(transaction: Transaction): string | undefined {
  return typeof transaction.rawRowNumber === "number" && Number.isFinite(transaction.rawRowNumber)
    ? String(transaction.rawRowNumber)
    : undefined;
}

function createClassification(
  transaction: Transaction,
  input: Omit<TaxEventClassification, "transactionId" | "rawRowId">,
): TaxEventClassification {
  const classification: TaxEventClassification = {
    transactionId: hasText(transaction.id) ? transaction.id : "missing_transaction_id",
    ...input,
  };
  const rowId = rawRowId(transaction);

  if (rowId) {
    classification.rawRowId = rowId;
  }

  return classification;
}

function missingDataClassification(transaction: Transaction): TaxEventClassification {
  return createClassification(transaction, {
    category: "needs_review",
    reasonCode: "missing_required_data",
    explanation:
      "Operation has missing core data and needs review before it can be used in a preliminary estimate.",
    requiredData: ["transaction id", "asset", "amount", "operation type"],
    includedInFirstEstimate: false,
  });
}

function unsupportedTypeClassification(transaction: Transaction): TaxEventClassification {
  return createClassification(transaction, {
    category: "unsupported",
    reasonCode: "unsupported_transaction_type",
    explanation:
      "Operation type is unsupported in this version and is not included in the first preliminary estimate.",
    requiredData: ["supported operation type"],
    includedInFirstEstimate: false,
  });
}

function p2pClassification(transaction: Transaction): TaxEventClassification {
  return createClassification(transaction, {
    category: "needs_review",
    reasonCode: "p2p_requires_review",
    explanation:
      "P2P operation may require proceeds, acquisition data, and source documentation review before a preliminary estimate.",
    requiredData: ["fiat proceeds", "acquisition cost / cost basis", "source documentation"],
    includedInFirstEstimate: false,
  });
}

export function classifyTaxEvent(transaction: Transaction): TaxEventClassification {
  if (!hasRequiredCoreData(transaction)) {
    return missingDataClassification(transaction);
  }

  if (!isSupportedTransactionType(transaction.type)) {
    return unsupportedTypeClassification(transaction);
  }

  if (isP2pIndicated(transaction)) {
    return p2pClassification(transaction);
  }

  switch (transaction.type) {
    case "sell":
      if (hasFiatValue(transaction)) {
        return createClassification(transaction, {
          category: "taxable_candidate",
          reasonCode: "sell_with_fiat_value",
          explanation:
            "Crypto sale with fiat value is a taxable candidate for a future preliminary estimate.",
          requiredData: ["acquisition cost / cost basis"],
          includedInFirstEstimate: true,
        });
      }

      return createClassification(transaction, {
        category: "needs_review",
        reasonCode: "sell_missing_fiat_value",
        explanation:
          "Crypto sale is missing fiat value and needs review before it can be used in a preliminary estimate.",
        requiredData: ["fiat proceeds", "fiat currency", "acquisition cost / cost basis"],
        includedInFirstEstimate: false,
      });

    case "buy":
      return createClassification(transaction, {
        category: "non_taxable_candidate",
        reasonCode: "buy_acquisition_candidate",
        explanation:
          "Buy operation may be relevant as acquisition history and cost basis for future disposals.",
        requiredData: [],
        includedInFirstEstimate: false,
      });

    case "deposit":
      return createClassification(transaction, {
        category: "needs_review",
        reasonCode: "deposit_source_review",
        explanation:
          "Deposit source may need explanation for tax-readiness or source-of-funds review.",
        requiredData: ["source explanation"],
        includedInFirstEstimate: false,
      });

    case "withdrawal":
      return createClassification(transaction, {
        category: "needs_review",
        reasonCode: "withdrawal_destination_review",
        explanation:
          "Withdrawal destination may need explanation for bank or source-of-funds review.",
        requiredData: ["destination explanation"],
        includedInFirstEstimate: false,
      });

    case "transfer":
      return createClassification(transaction, {
        category: "needs_review",
        reasonCode: "transfer_self_transfer_review",
        explanation:
          "Transfer may be non-taxable if it is a self-transfer, but it requires confirmation.",
        requiredData: ["self-transfer confirmation"],
        includedInFirstEstimate: false,
      });

    case "conversion":
      return createClassification(transaction, {
        category: "unsupported",
        reasonCode: "conversion_unsupported_v0",
        explanation:
          "Conversion is unsupported in the first draft tax estimate unless methodology is explicitly approved.",
        requiredData: ["approved conversion methodology"],
        includedInFirstEstimate: false,
      });

    case "income":
      return createClassification(transaction, {
        category: "needs_review",
        reasonCode: "income_requires_review",
        explanation:
          "Income source and fiat value require review before inclusion in a preliminary estimate.",
        requiredData: ["income source", "fiat value", "supporting documentation"],
        includedInFirstEstimate: false,
      });

    case "fee":
      return createClassification(transaction, {
        category: "needs_review",
        reasonCode: "fee_linkage_required",
        explanation:
          "Fee may be relevant only when linked to a supported taxable event.",
        requiredData: ["linked taxable event"],
        includedInFirstEstimate: false,
      });

    case "p2p":
      return p2pClassification(transaction);

    case "unknown":
      return createClassification(transaction, {
        category: "excluded_from_estimate",
        reasonCode: "unknown_type_excluded",
        explanation:
          "Unknown operation type is excluded from estimate and requires review.",
        requiredData: ["supported operation type"],
        includedInFirstEstimate: false,
      });

    default: {
      const exhaustiveCheck: never = transaction.type;
      void exhaustiveCheck;
      return createClassification(transaction, {
        category: "unsupported",
        reasonCode: "unsupported_transaction_type",
        explanation:
          "Operation type is unsupported in this version and is not included in the first preliminary estimate.",
        requiredData: ["supported operation type"],
        includedInFirstEstimate: false,
      });
    }
  }
}
