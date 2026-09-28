import { Briefcase, Check, GraduationCap, HeartHandshake, Users } from 'lucide-react';
import type { Persona } from '../../types/property';
import { PERSONA_META } from '../../types/property';

const ICONS: Record<Persona, typeof GraduationCap> = {
  student: GraduationCap,
  professional: Briefcase,
  family: Users,
  senior: HeartHandshake,
};

const ORDER: Persona[] = ['student', 'professional', 'family', 'senior'];

interface Props {
  value: Persona;
  onChange: (p: Persona) => void;
}

export default function PersonaSelector({ value, onChange }: Props) {
  return (
    <div role="radiogroup" aria-label="What type of home are you looking for?">
      <p className="text-[13px] font-bold uppercase tracking-[0.14em] text-slate-500">
        What type of home are you looking for?
      </p>
      <div className="mt-3 grid grid-cols-2 gap-2.5 sm:gap-3 xl:grid-cols-4">
        {ORDER.map((key) => {
          const Icon = ICONS[key];
          const active = value === key;
          return (
            <button
              key={key}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onChange(key)}
              className={`group relative rounded-2xl border p-3.5 text-left transition-all duration-200 sm:p-4 ${
                active
                  ? 'border-emerald-500 bg-emerald-50/70 shadow-[0_10px_30px_rgba(16,185,129,0.18)] ring-1 ring-emerald-500'
                  : 'border-slate-200 bg-white hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-lg'
              }`}
            >
              {active && (
                <span className="absolute -right-2 -top-2 grid h-6 w-6 place-items-center rounded-full bg-emerald-600 text-white shadow-lg">
                  <Check className="h-3.5 w-3.5" strokeWidth={3} />
                </span>
              )}
              <span
                className={`grid h-10 w-10 place-items-center rounded-xl transition ${
                  active ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-navy-900 group-hover:bg-navy-900 group-hover:text-white'
                }`}
              >
                <Icon className="h-5 w-5" />
              </span>
              <span className="mt-2.5 block text-[14px] font-bold text-navy-900">
                {PERSONA_META[key].label}
                {active && <span className="sr-only"> selected</span>}
              </span>
              <span className="mt-0.5 block text-[12px] leading-snug text-slate-500">
                {PERSONA_META[key].tagline}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
