import type { FindingSeverity } from "@/lib/domain/types";
import { getSeverityLabel } from "@/lib/ui/status-labels";

interface SeverityBadgeProps {
  severity: FindingSeverity | string;
}

export function SeverityBadge({ severity }: SeverityBadgeProps) {
  return (
    <span className={`severity-badge severity-${severity}`}>
      {getSeverityLabel(severity)}
    </span>
  );
}
