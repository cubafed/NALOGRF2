interface DocumentChecklistProgressProps {
  total: number;
  collected: number;
}

export function DocumentChecklistProgress({
  total,
  collected,
}: DocumentChecklistProgressProps) {
  if (total === 0) return null;

  const percent = Math.round((collected / total) * 100);

  return (
    <div style={{ marginBottom: "20px" }}>
      <div
        className="row-between"
        style={{ marginBottom: "8px", alignItems: "baseline" }}
      >
        <span style={{ fontSize: "13px", color: "var(--color-muted)" }}>
          Собрано документов
        </span>
        <span style={{ fontSize: "14px", fontWeight: 600 }}>
          {collected} / {total}
        </span>
      </div>
      <div
        style={{
          height: "6px",
          borderRadius: "3px",
          background: "rgba(255,255,255,0.08)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${percent}%`,
            borderRadius: "3px",
            background:
              percent === 100
                ? "var(--color-success, #22c55e)"
                : "var(--color-accent, #6366f1)",
            transition: "width 0.25s ease",
          }}
        />
      </div>
    </div>
  );
}
