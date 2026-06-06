import type {
  ManualCostBasisByTransactionId,
  ManualCostBasisEntry,
} from "@/lib/tax/manual-cost-basis-types";

const STORAGE_KEY = "crypto_audit_manual_cost_basis_v1";

function getStorage(): Storage | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function isEntry(value: unknown): value is ManualCostBasisEntry {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const entry = value as Partial<ManualCostBasisEntry>;
  return (
    typeof entry.transactionId === "string" &&
    typeof entry.costBasisFiat === "string" &&
    typeof entry.updatedAt === "string" &&
    (entry.fiatCurrency === undefined || typeof entry.fiatCurrency === "string")
  );
}

export function loadManualCostBasisEntries(): ManualCostBasisByTransactionId {
  const storage = getStorage();
  if (!storage) return {};

  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
      return {};
    }

    const entries: ManualCostBasisByTransactionId = {};
    for (const [transactionId, value] of Object.entries(parsed)) {
      if (isEntry(value) && value.transactionId === transactionId) {
        entries[transactionId] = value;
      }
    }
    return entries;
  } catch {
    return {};
  }
}

export function saveManualCostBasisEntries(entries: ManualCostBasisByTransactionId): void {
  const storage = getStorage();
  if (!storage) return;

  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch {
    // Local storage can be unavailable or full. The estimate remains usable in memory.
  }
}

export function saveManualCostBasisEntry(entry: ManualCostBasisEntry): void {
  const entries = loadManualCostBasisEntries();
  entries[entry.transactionId] = entry;
  saveManualCostBasisEntries(entries);
}

export function clearManualCostBasisEntry(transactionId: string): void {
  const entries = loadManualCostBasisEntries();
  delete entries[transactionId];
  saveManualCostBasisEntries(entries);
}
