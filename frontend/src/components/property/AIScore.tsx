interface Props {
  score: number;
  compact?: boolean;
}

export default function AIScore({ score, compact }: Props) {
  const r = 22;
  const c = 2 * Math.PI * r;
  const offset = c - (score / 100) * c;
  const color = score >= 92 ? '#059669' : score >= 86 ? '#0d9488' : '#2563eb';

  if (compact) {
    return (
      <span className="inline-flex items-center gap-2">
        <span className="h-1.5 w-16 overflow-hidden rounded-full bg-slate-100" role="img" aria-label={`${score}% AI match`}>
          <span className="block h-full rounded-full" style={{ width: `${score}%`, background: color }} />
        </span>
        <span className="text-[12px] font-extrabold text-navy-900">{score}% AI Match</span>
      </span>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <span className="relative grid h-14 w-14 place-items-center" role="img" aria-label={`${score}% AI match`}>
        <svg viewBox="0 0 56 56" className="absolute inset-0 h-full w-full -rotate-90">
          <circle cx="28" cy="28" r={r} fill="none" stroke="#eef1f4" strokeWidth="6" />
          <circle
            cx="28" cy="28" r={r} fill="none" stroke={color} strokeWidth="6"
            strokeLinecap="round" strokeDasharray={c} strokeDashoffset={offset}
          />
        </svg>
        <span className="text-[13px] font-extrabold text-navy-900">{score}%</span>
      </span>
      <span>
        <span className="block text-[13px] font-extrabold text-navy-900">AI Match</span>
        <span className="block text-[12px] text-slate-500">Ranked for your lifestyle</span>
      </span>
    </div>
  );
}
