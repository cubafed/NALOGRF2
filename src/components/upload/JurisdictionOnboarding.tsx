"use client";

import { useEffect, useState } from "react";
import { Pencil, ShieldCheck } from "lucide-react";
import { JurisdictionSelector } from "@/components/account/JurisdictionSelector";
import { getJurisdictionInfo } from "@/lib/tax/jurisdictions";
import {
  hasJurisdictionPreference,
  loadJurisdictionPreference,
} from "@/lib/client/jurisdiction-preference-storage";

/**
 * First-run jurisdiction onboarding shown on the upload page. If the user has not chosen a
 * jurisdiction yet, it shows the selector inline; once chosen it collapses to a compact
 * "Профиль: <label> · изменить" line. Choice persists locally and is read by the tax engine.
 */
export function JurisdictionOnboarding() {
  const [ready, setReady] = useState(false);
  const [chosen, setChosen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [code, setCode] = useState<string | null>(null);

  useEffect(() => {
    setChosen(hasJurisdictionPreference());
    setCode(loadJurisdictionPreference());
    setReady(true);
  }, []);

  if (!ready) return null;

  const label = code ? getJurisdictionInfo(code)?.label ?? code : "";
  const collapsed = chosen && !editing;

  return (
    <section className="panel" style={{ marginBottom: 18 }}>
      <div className="panel-inner">
        {collapsed ? (
          <div className="row-between" style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <ShieldCheck size={16} style={{ color: "var(--green)", flexShrink: 0 }} />
              <span style={{ fontSize: 13.5 }}>
                Налоговый профиль: <strong>{label}</strong>
              </span>
            </div>
            <button
              type="button"
              className="btn"
              style={{ gap: 6, fontSize: 12.5 }}
              onClick={() => setEditing(true)}
            >
              <Pencil size={13} />
              Изменить
            </button>
          </div>
        ) : (
          <>
            <div className="panel-head">
              <div>
                <p className="eyebrow" style={{ margin: 0 }}>Налоговый профиль</p>
                <h2 style={{ margin: 0, fontSize: 20 }}>Выберите юрисдикцию</h2>
              </div>
            </div>
            <p className="muted" style={{ margin: "8px 0 14px", fontSize: 13, maxWidth: 680 }}>
              От выбора зависят ставки и валюта предварительного расчёта. Можно изменить позже
              в разделе «Аккаунт». Результат всегда предварительный, для проверки с бухгалтером.
            </p>
            <JurisdictionSelector
              compact
              onChange={(next) => {
                setCode(next);
                setChosen(true);
                setEditing(false);
              }}
            />
          </>
        )}
      </div>
    </section>
  );
}
