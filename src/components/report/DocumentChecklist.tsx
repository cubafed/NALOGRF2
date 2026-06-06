"use client";

import { useEffect, useState } from "react";
import type { DocumentChecklistItem } from "@/lib/report/document-checklist-types";
import {
  loadCollectedKeys,
  saveCollectedKeys,
} from "@/lib/client/document-checklist-storage";
import { DocumentChecklistProgress } from "./DocumentChecklistProgress";

interface DocumentChecklistProps {
  items: DocumentChecklistItem[];
}

const PRIORITY_LABEL: Record<string, string> = {
  critical: "Критично",
  medium: "Средне",
  low: "Низко",
};

const PRIORITY_COLOR: Record<string, string> = {
  critical: "var(--red)",
  medium: "var(--amber)",
  low: "var(--muted)",
};

const PRIORITY_BG: Record<string, string> = {
  critical: "rgba(255, 107, 107, 0.08)",
  medium: "rgba(255, 189, 90, 0.08)",
  low: "rgba(255,255,255,0.03)",
};

const CATEGORY_LABEL: Record<string, string> = {
  bank: "Банк",
  exchange: "Биржа",
  wallet: "Кошелёк",
  p2p: "P2P",
  accounting: "Учёт",
  other: "Прочее",
};

export function DocumentChecklist({ items }: DocumentChecklistProps) {
  const [collectedKeys, setCollectedKeys] = useState<Set<string>>(new Set());
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setCollectedKeys(new Set(loadCollectedKeys()));
    setHydrated(true);
  }, []);

  const toggle = (key: string) => {
    setCollectedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      saveCollectedKeys(Array.from(next));
      return next;
    });
  };

  if (items.length === 0) {
    return (
      <p className="muted">
        По текущим findings дополнительные документы не указаны.
      </p>
    );
  }

  const collected = hydrated
    ? items.filter((item) => collectedKeys.has(item.key)).length
    : 0;

  return (
    <div>
      <DocumentChecklistProgress total={items.length} collected={collected} />

      <ul
        style={{
          margin: 0,
          padding: 0,
          listStyle: "none",
          display: "grid",
          gap: "10px",
        }}
      >
        {items.map((item) => {
          const isCollected = hydrated && collectedKeys.has(item.key);
          return (
            <li
              key={item.key}
              style={{
                border: "1px solid var(--line)",
                borderRadius: "8px",
                background: isCollected
                  ? "rgba(0,200,122,0.06)"
                  : PRIORITY_BG[item.priority],
                padding: "14px 16px",
                opacity: isCollected ? 0.65 : 1,
                transition: "opacity 0.2s ease, background 0.2s ease",
              }}
            >
              <label
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "12px",
                  cursor: "pointer",
                }}
              >
                <input
                  className="print-hidden"
                  type="checkbox"
                  checked={isCollected}
                  onChange={() => toggle(item.key)}
                  aria-label={`Отметить "${item.ru}" как собранный документ`}
                  style={{
                    marginTop: "2px",
                    width: "16px",
                    height: "16px",
                    flexShrink: 0,
                    accentColor: "var(--green)",
                    cursor: "pointer",
                  }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      flexWrap: "wrap",
                      gap: "8px",
                      marginBottom: "4px",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "14px",
                        fontWeight: 700,
                        textDecoration: isCollected ? "line-through" : "none",
                      }}
                    >
                      {item.ru}
                    </span>
                    <span
                      style={{
                        fontSize: "11px",
                        color: "var(--muted)",
                        fontStyle: "italic",
                      }}
                    >
                      {item.en}
                    </span>

                    <span
                      className="severity"
                      style={{
                        background: PRIORITY_BG[item.priority],
                        color: PRIORITY_COLOR[item.priority],
                        fontSize: "10px",
                      }}
                    >
                      {PRIORITY_LABEL[item.priority] ?? item.priority}
                    </span>

                    <span
                      className="badge"
                      style={{ fontSize: "10px", padding: "3px 8px" }}
                    >
                      {CATEGORY_LABEL[item.category] ?? item.category}
                    </span>
                  </div>

                  {item.description && (
                    <p
                      className="muted"
                      style={{ margin: "0 0 6px", fontSize: "13px" }}
                    >
                      {item.description}
                    </p>
                  )}

                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "8px",
                      marginTop: "4px",
                      fontSize: "12px",
                      color: "var(--muted)",
                    }}
                  >
                    {item.requiredByFindingIds.length > 0 && (
                      <span>
                        Требуется по {item.requiredByFindingIds.length}{" "}
                        {item.requiredByFindingIds.length === 1
                          ? "проблеме"
                          : "проблемам"}
                      </span>
                    )}
                    {item.affectedRawRowNumbers.length > 0 && (
                      <span>
                        · строки:{" "}
                        {item.affectedRawRowNumbers.slice(0, 8).join(", ")}
                        {item.affectedRawRowNumbers.length > 8 ? " …" : ""}
                      </span>
                    )}
                  </div>
                </div>

                {isCollected && (
                  <span
                    className="print-only-inline"
                    style={{
                      flexShrink: 0,
                      fontSize: "13px",
                      color: "var(--green)",
                      fontWeight: 700,
                    }}
                  >
                    ✓
                  </span>
                )}
              </label>
            </li>
          );
        })}
      </ul>

      <p
        className="muted"
        style={{ marginTop: "16px", fontSize: "12px" }}
      >
        Список носит справочный характер. Конкретный банк или бухгалтер может
        запросить другой набор документов.
      </p>
    </div>
  );
}
