import type { ReactNode } from "react";
import { FooterDisclaimer } from "@/components/layout/FooterDisclaimer";
import { Header } from "@/components/layout/Header";

interface AppShellProps {
  children: ReactNode;
  footer?: boolean;
  compact?: boolean;
}

export function AppShell({ children, footer = true, compact = false }: AppShellProps) {
  return (
    <>
      <Header />
      <main>
        <section className={compact ? "app-section app-section-compact" : "app-section"}>
          <div className="container app-container">{children}</div>
        </section>
      </main>
      {footer && <FooterDisclaimer />}
    </>
  );
}
