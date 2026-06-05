import type { PartnerAttribution } from "@/lib/partners/partner-types";

const trackedKeys = [
  "partner",
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
  "ref",
] as const;

function cleanValue(value: string | null): string | null {
  const trimmed = value?.trim() ?? "";
  return trimmed.length > 0 ? trimmed : null;
}

export function parsePartnerAttribution(
  searchParams: URLSearchParams,
  landingPath: string,
  capturedAt = new Date().toISOString(),
): PartnerAttribution | null {
  const hasTrackedParam = trackedKeys.some((key) => searchParams.has(key));

  if (!hasTrackedParam) {
    return null;
  }

  return {
    partner: cleanValue(searchParams.get("partner")),
    ref: cleanValue(searchParams.get("ref")),
    utmSource: cleanValue(searchParams.get("utm_source")),
    utmMedium: cleanValue(searchParams.get("utm_medium")),
    utmCampaign: cleanValue(searchParams.get("utm_campaign")),
    utmContent: cleanValue(searchParams.get("utm_content")),
    utmTerm: cleanValue(searchParams.get("utm_term")),
    capturedAt,
    landingPath,
  };
}
