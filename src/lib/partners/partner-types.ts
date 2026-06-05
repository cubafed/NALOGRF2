export interface PartnerAttribution {
  partner: string | null;
  ref: string | null;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  utmContent: string | null;
  utmTerm: string | null;
  capturedAt: string;
  landingPath: string;
}

export interface DemoPartner {
  id: string;
  title: string;
  description: string;
  href: string;
}
