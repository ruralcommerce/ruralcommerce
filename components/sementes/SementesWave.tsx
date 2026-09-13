export function SementesWave({ className = '' }: { className?: string }) {
  return (
    <div className={`sementes-wave ${className}`} aria-hidden>
      <svg viewBox="0 0 800 600" fill="none">
        {Array.from({ length: 14 }).map((_, index) => {
          const y = 40 + index * 38;
          const amp = 26 + (index % 4) * 8;
          return (
            <path
              key={index}
              d={`M-40 ${y} C 140 ${y - amp}, 280 ${y + amp}, 430 ${y} S 680 ${y - amp}, 860 ${y + 8}`}
              stroke="white"
              strokeOpacity={0.18 + (index % 5) * 0.03}
              strokeWidth={index % 3 === 0 ? 1.4 : 0.9}
            />
          );
        })}
      </svg>
    </div>
  );
}
