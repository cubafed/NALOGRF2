import type { ReactNode } from "react";

interface SectionHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
  compact?: boolean;
}

export function SectionHeader({
  eyebrow,
  title,
  description,
  action,
  compact = false,
}: SectionHeaderProps) {
  return (
    <div className={compact ? "section-header section-header-compact" : "section-header"}>
      <div>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h2>{title}</h2>
        {description && <p className="muted">{description}</p>}
      </div>
      {action && <div className="section-action">{action}</div>}
    </div>
  );
}
