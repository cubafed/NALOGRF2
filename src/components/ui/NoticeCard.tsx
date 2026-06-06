import type { ReactNode } from "react";

interface NoticeCardProps {
  title?: string;
  children: ReactNode;
  variant?: "info" | "warning" | "danger" | "success" | "neutral";
  compact?: boolean;
}

export function NoticeCard({
  title,
  children,
  variant = "info",
  compact = false,
}: NoticeCardProps) {
  return (
    <div className={`notice-card notice-${variant} ${compact ? "notice-compact" : ""}`}>
      {title && <strong>{title}</strong>}
      <div>{children}</div>
    </div>
  );
}
