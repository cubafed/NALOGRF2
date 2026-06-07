import { DEFAULT_JURISDICTION_CODE, getJurisdictionInfo } from "@/lib/tax/jurisdictions";

const STORAGE_KEY = "crypto_audit_jurisdiction_v1";

function getStorage(): Storage | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

/**
 * Load the user's selected jurisdiction code. Falls back to the default (RU resident)
 * when nothing is stored, storage is unavailable, or the stored code is not a known
 * "available" jurisdiction (planned-only codes are never returned as a usable selection).
 */
export function loadJurisdictionPreference(): string {
  const storage = getStorage();
  if (!storage) return DEFAULT_JURISDICTION_CODE;

  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_JURISDICTION_CODE;
    const info = getJurisdictionInfo(raw);
    if (info && info.status === "available") return info.code;
    return DEFAULT_JURISDICTION_CODE;
  } catch {
    return DEFAULT_JURISDICTION_CODE;
  }
}

/** True when the user has explicitly stored a valid jurisdiction choice (for onboarding). */
export function hasJurisdictionPreference(): boolean {
  const storage = getStorage();
  if (!storage) return false;
  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) return false;
    const info = getJurisdictionInfo(raw);
    return Boolean(info && info.status === "available");
  } catch {
    return false;
  }
}

/** Persist the selected jurisdiction code. Ignores unknown or planned-only codes. */
export function saveJurisdictionPreference(code: string): void {
  const storage = getStorage();
  if (!storage) return;
  const info = getJurisdictionInfo(code);
  if (!info || info.status !== "available") return;
  try {
    storage.setItem(STORAGE_KEY, code);
  } catch {
    // Local storage can be unavailable or full; the choice stays in memory for the session.
  }
}
