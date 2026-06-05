import type { FindingSeverity } from "@/lib/domain/types";

export type SeverityFilter = FindingSeverity | "all";

interface ProblemsFilterBarProps {
  active: SeverityFilter;
  counts: { all: number; critical: number; medium: number; low: number };
  onFilter: (f: SeverityFilter) => void;
  search: string;
  onSearch: (v: string) => void;
}

const FILTERS: { value: SeverityFilter; label: string }[] = [
  { value: "all", label: "Все" },
  { value: "critical", label: "Критичные" },
  { value: "medium", label: "Средние" },
  { value: "low", label: "Низкие" },
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
        gap: "10px",
        alignItems: "center",
        marginBottom: "16px",
      }}
    >
      {FILTERS.map((f) => (
        <button
          key={f.value}
          type="button"
          onClick={() => onFilter(f.value)}
          className={`btn ${active === f.value ? "btn-primary" : "btn-secondary"}`}
          style={{ fontSize: "13px", padding: "6px 14px" }}
        >
          {f.label}{" "}
          <span style={{ opacity: 0.65 }}>
            ({counts[f.value]})
          </span>
        </button>
      ))}
      <input
        type="search"
        placeholder="Поиск по тексту..."
        value={search}
        onChange={(e) => onSearch(e.target.value)}
        style={{
          background: "var(--panel-2)",
          border: "1px solid var(--line)",
          borderRadius: "6px",
          color: "var(--ink)",
          fontSize: "13px",
          padding: "6px 12px",
          minWidth: "180px",
        }}
        aria-label="Поиск по проблемам"
      />
    </div>
  );
}
