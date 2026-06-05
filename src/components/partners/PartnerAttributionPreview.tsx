"use client";

import { useEffect, useState } from "react";
import {
  clearPartnerAttribution,
  loadPartnerAttribution,
  savePartnerAttribution,
} from "@/lib/client/partner-attribution-storage";
import { parsePartnerAttribution } from "@/lib/partners/parse-partner-attribution";
import type { PartnerAttribution } from "@/lib/partners/partner-types";

type AttributionSource = "captured" | "stored";

interface AttributionState {
  attribution: PartnerAttribution;
  source: AttributionSource;
}

export function PartnerAttributionPreview() {
  const [state, setState] = useState<AttributionState | null>(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const capturedAttribution = parsePartnerAttribution(urlParams, window.location.pathname);

    if (capturedAttribution) {
      savePartnerAttribution(capturedAttribution);
      setState({ attribution: capturedAttribution, source: "captured" });
      return;
    }

    const storedAttribution = loadPartnerAttribution();

    if (storedAttribution) {
      setState({ attribution: storedAttribution, source: "stored" });
    }
  }, []);

  if (!state) {
    return null;
  }

  const { attribution, source } = state;
  const visibleFields = [
    ["partner", attribution.partner],
    ["utmSource", attribution.utmSource],
    ["utmCampaign", attribution.utmCampaign],
  ].filter(([, value]) => value);

  const handleClear = () => {
    clearPartnerAttribution();
    setState(null);
  };

  return (
    <section className="panel attribution-card">
      <div className="panel-inner">
        <div className="panel-head">
          <div>
            <p className="eyebrow">Partner attribution</p>
            <h2 style={{ margin: 0 }}>
              {source === "captured"
                ? "Партнерский переход сохранен"
                : "Активный partner tag"}
            </h2>
          </div>
          <button type="button" className="btn" onClick={handleClear}>
            Очистить partner tag
          </button>
        </div>

        {visibleFields.length > 0 && (
          <div className="metric-grid">
            {visibleFields.map(([label, value]) => (
              <div className="metric" key={label}>
                <span>{label}</span>
                <strong style={{ overflowWrap: "anywhere" }}>{value}</strong>
              </div>
            ))}
          </div>
        )}

        <p className="muted" style={{ marginBottom: 0, marginTop: "16px" }}>
          В этом MVP partner attribution хранится только локально в браузере и не
          отправляется на сервер.
        </p>
      </div>
    </section>
  );
}
