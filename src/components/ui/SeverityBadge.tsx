import type { FindingSeverity } from "@/lib/domain/types";
import { AlertTriangle, AlertCircle, Info } from "lucide-react";

interface SeverityBadgeProps {
  severity: FindingSeverity;
  showIcon?: boolean;
}

const LABEL: Record<FindingSeverity, string> = {
  critical: "Критично",
  medium: "Средне",
  low: "Низко",
};

const ICON_CLASS: Record<FindingSeverity, string> = {
  critical: "severity severity-critical",
  medium: "severity severity-medium",
  low: "severity severity-low",
};

export function SeverityBadge({ severity, showIcon = true }: SeverityBadgeProps) {
  return (
    <span className={ICON_CLASS[severity]} style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
      {showIcon && (
        <>
          {severity === "critical" && <AlertTriangle size={10} />}
          {severity === "medium" && <AlertCircle size={10} />}
          {severity === "low" && <Info size={10} />}
        </>
      )}
      {LABEL[severity]}
    </span>
  );
}
