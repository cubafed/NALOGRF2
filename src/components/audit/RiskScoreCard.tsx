interface RiskScoreCardProps {
  label: string;
  score: number;
  subtitle: string;
}

export function RiskScoreCard({ label, score, subtitle }: RiskScoreCardProps) {
  return (
    <div className="panel">
      <div className="panel-inner">
        <div className="panel-head">
          <div>
            <p className="eyebrow">{label}</p>
            <div className="score">
              {score}
              <small>/100</small>
            </div>
          </div>
          <span className="badge">Демо-оценка</span>
        </div>
        <p className="muted" style={{ marginTop: "14px" }}>
          {subtitle}
        </p>
      </div>
    </div>
  );
}
