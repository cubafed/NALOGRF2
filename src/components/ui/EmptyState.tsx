import type { ReactNode } from "react";

interface EmptyStateProps {
  eyebrow?: string;
  title: string;
  description: string;
  primaryAction?: ReactNode;
  secondaryAction?: ReactNode;
  note?: ReactNode;
}

export function EmptyState({
  eyebrow,
  title,
  description,
  primaryAction,
  secondaryAction,
  note,
}: EmptyStateProps) {
  return (
    <section className="panel">
      <div className="panel-inner empty-state">
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h2>{title}</h2>
        <p className="muted">{description}</p>
        {(primaryAction || secondaryAction) && (
          <div className="actions">
            {primaryAction}
            {secondaryAction}
          </div>
        )}
        {note && <p className="empty-state-note">{note}</p>}
      </div>
    </section>
  );
}
