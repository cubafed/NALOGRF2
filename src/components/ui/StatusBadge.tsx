import { getStatusMeta } from "@/lib/ui/status-labels";

interface StatusBadgeProps {
  status: string;
  label?: string;
}

export function StatusBadge({ status, label }: StatusBadgeProps) {
  const meta = getStatusMeta(status);

  return (
    <span className={`status-badge status-${meta.tone}`}>
      {label ?? meta.label}
    </span>
  );
}
