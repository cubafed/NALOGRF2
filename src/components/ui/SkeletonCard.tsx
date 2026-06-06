interface SkeletonCardProps {
  lines?: number;
  height?: number;
}

export function SkeletonCard({ lines = 3, height = 80 }: SkeletonCardProps) {
  return (
    <div className="panel" style={{ padding: 24 }}>
      <div className="flex-col" style={{ gap: 10 }}>
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className="skeleton"
            style={{
              height: i === 0 ? height : 14,
              width: i === 0 ? "100%" : `${60 + i * 10}%`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
