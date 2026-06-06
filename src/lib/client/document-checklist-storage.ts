const STORAGE_KEY = "crypto_audit_document_checklist_v1";

interface ChecklistStorageData {
  version: 1;
  collectedKeys: string[];
}

function getStorage(): Storage | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function loadCollectedKeys(): string[] {
  const storage = getStorage();
  if (!storage) return [];
  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (
      typeof parsed !== "object" ||
      parsed === null ||
      (parsed as { version?: unknown }).version !== 1
    ) {
      return [];
    }
    const data = parsed as ChecklistStorageData;
    if (!Array.isArray(data.collectedKeys)) return [];
    return data.collectedKeys.filter((k) => typeof k === "string");
  } catch {
    return [];
  }
}

export function saveCollectedKeys(keys: string[]): void {
  const storage = getStorage();
  if (!storage) return;
  try {
    const data: ChecklistStorageData = { version: 1, collectedKeys: keys };
    storage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Storage quota exceeded or unavailable — fail silently
  }
}

export function clearCollectedKeys(): void {
  const storage = getStorage();
  if (!storage) return;
  try {
    storage.removeItem(STORAGE_KEY);
  } catch {
    // Fail silently
  }
}
