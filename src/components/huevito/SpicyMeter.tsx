export function SpicyMeter({ level }: { level?: string }) {
  if (!level || level === "none") return null;

  const map: Record<string, number> = {
    mild: 1,
    medium: 3,
    hot: 4,
    very_hot: 5,
  };

  const activeCount = map[level] ?? 0;
  if (activeCount === 0) return null;

  const chili = (filled: boolean, i: number) => (
    <span
      key={i}
      className={`text-base leading-none select-none transition-opacity ${
        filled ? "opacity-100" : "opacity-25"
      }`}
      aria-hidden="true"
    >
      🌶️
    </span>
  );

  const label: Record<string, string> = {
    mild: "Suave",
    medium: "Medio",
    hot: "Picante",
    very_hot: "Muy picante",
  };

  return (
    <div className="flex items-center gap-2 pt-1">
      <div className="flex gap-0.5">
        {Array.from({ length: 5 }, (_, i) => chili(i < activeCount, i))}
      </div>
      <span className="text-xs font-semibold text-brand-brown/80">
        {label[level] ?? level}
      </span>
    </div>
  );
}
