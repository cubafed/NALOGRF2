"use client";

import { Search } from "lucide-react";
import type { FindingSeverity } from "@/lib/domain/types";

export type SeverityFilter = FindingSeverity | "all";

interface ProblemsFilterBarProps {
  active: SeverityFilter;
  counts: { all: number; critical: number; medium: number; low: number };
  onFilter: (f: SeverityFilter) => void;
  search: string;
  onSearch: (v: string) => void;
}

const FILTERS: { value: SeverityFilter; label: string; color?: string }[] = [
  { value: "all", label: "Все" },
  { value: "critical", label: "Критичные", color: "var(--red)" },
  { value: "medium", label: "Средние", color: "var(--amber)" },
  { value: "low", label: "Низкие", color: "var(--blue)" },
];

export function ProblemsFilterBar({
  active,
  counts,
  onFilter,
  search,
  onSearch,
}: ProblemsFilterBarProps) {
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: 8,
        alignItems: "center",
        marginBottom: 16,
      }}
    >
      <div className="filter-pills">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            onClick={() => onFilter(f.value)}
            className={`filter-pill${active === f.value ? " filter-pill--active" : ""}`}
            style={
              active === f.value && f.color
                ? { borderColor: f.color, color: f.color, background: `${f.color}14` }
                : undefined
            }
          >
            {f.label}
            <span className="filter-pill-count">{counts[f.value]}</span>
          </button>
        ))}
      </div>

      <div className="search-input-wrap" style={{ marginLeft: "auto" }}>
        <Search size={13} className="search-input-icon" />
        <input
          type="search"
          placeholder="Поиск..."
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          className="search-input"
          aria-label="Поиск по проблемам"
        />
      </div>
    </div>
  );
}
