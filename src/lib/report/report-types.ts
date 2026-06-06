import type { ParserSummary } from "@/lib/parsers/parser-types";
import type { ReadinessLabel, RiskFinding, RiskSummary } from "@/lib/risk/risk-types";
import type { DocumentChecklistItem } from "./document-checklist-types";

export interface ReportQuestion {
  id: string;
  findingId: string;
  ruleId: string;
  question: string;
  whyItMatters: string;
  affectedRawRowNumbers: number[];
  documentsNeeded: string[];
}

export interface ReportPreviewModel {
  fileName: string | null;
  savedAt: string;
  readinessScore: number;
  readinessLabel: ReadinessLabel;
  parserSummary: ParserSummary;
  riskSummary: RiskSummary;
  findings: RiskFinding[];
  documentsNeeded: string[];
  affectedRows: number[];
  generatedQuestions: ReportQuestion[];
  documentChecklist: DocumentChecklistItem[];
  disclaimer: string;
}
