import type { ReactNode } from "react";

interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  status?: ReactNode;
  primaryAction?: ReactNode;
  secondaryActions?: ReactNode;
  meta?: ReactNode;
}

export function PageHeader({
  eyebrow,
  title,
  subtitle,
  status,
  primaryAction,
  secondaryActions,
  meta,
}: PageHeaderProps) {
  return (
    <header className="page-header">
      <div className="page-header-copy">
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <div className="page-title-row">
          <h1>{title}</h1>
          {status}
        </div>
        {subtitle && <p className="lead">{subtitle}</p>}
        {meta && <div className="page-meta">{meta}</div>}
      </div>
      {(primaryAction || secondaryActions) && (
        <div className="page-actions">
          {primaryAction}
          {secondaryActions}
        </div>
      )}
    </header>
  );
}
