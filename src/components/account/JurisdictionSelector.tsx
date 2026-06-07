"use client";

import { useEffect, useState } from "react";
import { Check, Globe, Lock } from "lucide-react";
import { jurisdictions } from "@/lib/tax/jurisdictions";
import {
  loadJurisdictionPreference,
  saveJurisdictionPreference,
} from "@/lib/client/jurisdiction-preference-storage";

export interface JurisdictionSelectorProps {
  /** Compact layout (smaller text/padding) for inline onboarding use. */
  compact?: boolean;
  /** Called with the new code after a selection is persisted. */
  onChange?: (code: string) => void;
}

/**
 * Lets the user pick their tax jurisdiction/profile. Available profiles are selectable and
 * persist to localStorage; planned countries are shown disabled ("в разработке") and never
 * selectable — they produce no tax numbers. Deterministic data comes from the registry.
 */
export function JurisdictionSelector({ compact = false, onChange }: JurisdictionSelectorProps) {
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    setSelected(loadJurisdictionPreference());
  }, []);

  const choose = (code: string) => {
    saveJurisdictionPreference(code);
    setSelected(code);
    onChange?.(code);
  };

  return (
    <div style={{ display: "grid", gap: compact ? 8 : 10 }}>
      {jurisdictions.map((j) => {
        const isSelected = selected === j.code && j.status === "available";
        const planned = j.status === "planned";
        return (
          <button
            key={j.code}
            type="button"
            disabled={planned}
            onClick={() => !planned && choose(j.code)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              textAlign: "left",
              width: "100%",
              border: `1px solid ${isSelected ? "var(--blue)" : "var(--line)"}`,
              borderRadius: "var(--radius-sm)",
              padding: compact ? "9px 11px" : "12px 14px",
              background: isSelected ? "var(--blue-soft)" : "var(--panel-2)",
              color: "inherit",
              cursor: planned ? "not-allowed" : "pointer",
              opacity: planned ? 0.5 : 1,
              transition: "var(--t-fast)",
            }}
          >
            <span style={{ flexShrink: 0, display: "flex" }}>
              {planned ? (
                <Lock size={compact ? 14 : 16} color="var(--muted)" />
              ) : isSelected ? (
                <Check size={compact ? 14 : 16} color="var(--blue)" />
              ) : (
                <Globe size={compact ? 14 : 16} color="var(--muted)" />
              )}
            </span>
            <span style={{ display: "grid", gap: 2 }}>
              <strong style={{ fontSize: compact ? 13 : 14 }}>{j.label}</strong>
              <span className="muted" style={{ fontSize: compact ? 11.5 : 12.5 }}>
                {planned ? "В разработке" : `${j.rateSummary} · ${j.reportCurrency}`}
              </span>
            </span>
            {planned && (
              <span className="badge" style={{ marginLeft: "auto", fontSize: 11 }}>
                скоро
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
