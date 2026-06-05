import type { PartnerAttribution } from "@/lib/partners/partner-types";

const partnerAttributionStorageKey = "crypto-audit-report.partner-attribution.v1";

function getLocalStorage(): Storage | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function isNullableString(value: unknown): value is string | null {
  return typeof value === "string" || value === null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isPartnerAttribution(value: unknown): value is PartnerAttribution {
  if (!isRecord(value)) {
    return false;
  }

  return (
    isNullableString(value.partner) &&
    isNullableString(value.ref) &&
    isNullableString(value.utmSource) &&
    isNullableString(value.utmMedium) &&
    isNullableString(value.utmCampaign) &&
    isNullableString(value.utmContent) &&
    isNullableString(value.utmTerm) &&
    typeof value.capturedAt === "string" &&
    typeof value.landingPath === "string"
  );
}

export function savePartnerAttribution(attribution: PartnerAttribution): void {
  const storage = getLocalStorage();

  if (!storage) {
    return;
  }

  try {
    storage.setItem(partnerAttributionStorageKey, JSON.stringify(attribution));
  } catch {
    // Browser storage can be disabled or full; attribution is optional in this MVP.
  }
}

export function loadPartnerAttribution(): PartnerAttribution | null {
  const storage = getLocalStorage();

  if (!storage) {
    return null;
  }

  try {
    const rawValue = storage.getItem(partnerAttributionStorageKey);

    if (!rawValue) {
      return null;
    }

    const parsedValue: unknown = JSON.parse(rawValue);
    return isPartnerAttribution(parsedValue) ? parsedValue : null;
  } catch {
    return null;
  }
}

export function clearPartnerAttribution(): void {
  const storage = getLocalStorage();

  if (!storage) {
    return;
  }

  try {
    storage.removeItem(partnerAttributionStorageKey);
  } catch {
    // Optional local metadata can be ignored when storage is unavailable.
  }
}
