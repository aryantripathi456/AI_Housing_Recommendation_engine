import { Check } from 'lucide-react';
import type { Persona } from '../../types/property';

interface Props {
  reasons: string[];
  persona: Persona;
  limit?: number;
}

export default function RecommendationReasons({ reasons, persona, limit = 4 }: Props) {
  const items = (reasons ?? []).slice(0, limit);
  if (items.length === 0) return null;
  return (
    <div className="rounded-2xl bg-emerald-50/70 border border-emerald-100 p-3.5">
      <p className="text-[12px] font-extrabold uppercase tracking-wider text-emerald-800">
        Why this home? · {persona}
      </p>
      <ul className="mt-2 space-y-1.5">
        {items.map((r) => (
          <li key={r} className="flex items-start gap-2 text-[13px] leading-snug text-slate-700">
            <span className="mt-0.5 grid h-[18px] w-[18px] shrink-0 place-items-center rounded-full bg-emerald-600 text-white">
              <Check className="h-3 w-3" strokeWidth={3} />
            </span>
            {r}
          </li>
        ))}
      </ul>
    </div>
  );
}
