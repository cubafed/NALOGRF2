export type DocumentPriority = "critical" | "medium" | "low";

export type DocumentCategory =
  | "bank"
  | "exchange"
  | "wallet"
  | "p2p"
  | "accounting"
  | "other";

export interface DocumentCatalogEntry {
  key: string;
  ru: string;
  en: string;
  description: string;
  category: DocumentCategory;
}

export interface DocumentChecklistItem {
  key: string;
  ru: string;
  en: string;
  description: string;
  category: DocumentCategory;
  priority: DocumentPriority;
  requiredByFindingIds: string[];
  affectedRawRowNumbers: number[];
  rawTokens: string[];
}
