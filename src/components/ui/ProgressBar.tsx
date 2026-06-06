interface ProgressBarProps {
  value: number;
  label?: string;
}

function clamp(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(Math.max(value, 0), 100);
}

export function ProgressBar({ value, label }: ProgressBarProps) {
  const safeValue = clamp(value);

  return (
    <div className="progress-wrap">
      {label && <span>{label}</span>}
      <div className="progress-track" aria-label={label ?? "Progress"} aria-valuenow={safeValue} role="progressbar">
        <i style={{ width: `${safeValue}%` }} />
      </div>
    </div>
  );
}
