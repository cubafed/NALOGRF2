import type { ReactNode } from "react";
import { SectionHeader } from "@/components/ui/SectionHeader";

interface DataPanelProps {
  title?: string;
  eyebrow?: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  compact?: boolean;
  printHidden?: boolean;
}

export function DataPanel({
  title,
  eyebrow,
  description,
  actions,
  children,
  compact = false,
  printHidden = false,
}: DataPanelProps) {
  return (
    <section className={`panel ${printHidden ? "print-hidden" : ""}`}>
      <div className={compact ? "panel-inner panel-inner-compact" : "panel-inner"}>
        {title && (
          <SectionHeader
            action={actions}
            compact={compact}
            description={description}
            eyebrow={eyebrow}
            title={title}
          />
        )}
        {children}
      </div>
    </section>
  );
}
