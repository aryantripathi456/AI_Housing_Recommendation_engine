import { RotateCcw, X } from 'lucide-react';
import type { Filters, Persona, PropertyType } from '../../types/property';
import { DEFAULT_FILTERS } from '../../types/property';
import { formatINR } from '../../utils/recommendation';

interface Props {
  open: boolean;
  filters: Filters;
  onChange: (f: Filters) => void;
  onClose: () => void;
  onApply: () => void;
  monthlyIncome: number | null;
  onIncomeChange: (n: number | null) => void;
}

const TYPES: PropertyType[] = ['Apartment', 'House', 'Studio', 'Villa', 'Shared'];
const BEDROOMS = [1, 2, 3, 4];
const AMENITIES = ['Parking', 'Gym', 'Security', 'Elevator', 'Furnished', 'Pet Friendly', 'WiFi'];
const PERSONAS: Persona[] = ['student', 'professional', 'family', 'senior'];

export default function FilterDrawer({ open, filters, onChange, onClose, onApply, monthlyIncome, onIncomeChange }: Props) {
  if (!open) return null;

  const toggleArr = <T,>(arr: T[], v: T): T[] =>
    arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v];

  const set = (patch: Partial<Filters>) => onChange({ ...filters, ...patch });

  return (
    <div className="fixed inset-0 z-[60]" role="dialog" aria-modal="true" aria-label="Filters">
      <div className="absolute inset-0 bg-navy-950/50 backdrop-blur-sm" onClick={onClose} />
      <aside className="absolute bottom-0 right-0 top-0 flex w-full max-w-md flex-col bg-white shadow-2xl animate-fade-up sm:rounded-l-[24px]">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
          <div>
            <h2 className="font-display text-[18px] font-extrabold text-navy-900">Filters</h2>
            <p className="text-[13px] text-slate-500">Refine your AI recommendations</p>
          </div>
          <button
            type="button" onClick={onClose} aria-label="Close filters"
            className="grid h-10 w-10 place-items-center rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="nice-scroll flex-1 space-y-7 overflow-y-auto px-6 py-6">
          {/* Budget */}
          <div>
            <p className="text-[13px] font-extrabold uppercase tracking-wider text-navy-900">Budget (monthly)</p>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <label className="block">
                <span className="text-[12px] font-semibold text-slate-500">Min rent</span>
                <select
                  value={filters.minPrice}
                  onChange={(e) => set({ minPrice: Number(e.target.value) })}
                  className="mt-1 h-11 w-full rounded-xl border border-slate-200 px-3 text-[14px] font-semibold"
                >
                  {[0, 15000, 20000, 25000, 30000, 40000, 50000].map((v) => (
                    <option key={v} value={v}>{v === 0 ? 'No min' : formatINR(v)}</option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="text-[12px] font-semibold text-slate-500">Max rent</span>
                <select
                  value={filters.maxPrice}
                  onChange={(e) => set({ maxPrice: Number(e.target.value) })}
                  className="mt-1 h-11 w-full rounded-xl border border-slate-200 px-3 text-[14px] font-semibold"
                >
                  {[30000, 40000, 50000, 70000, 100000].map((v) => (
                    <option key={v} value={v}>{formatINR(v)}{v === 100000 ? '+' : ''}</option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          {/* Monthly income (personalises AI price scoring + affordability) */}
          <div>
            <label htmlFor="filter-income" className="text-[13px] font-extrabold uppercase tracking-wider text-navy-900">
              Monthly income <span className="font-medium normal-case text-slate-400">(optional)</span>
            </label>
            <input
              id="filter-income"
              value={monthlyIncome != null ? String(monthlyIncome) : ''}
              onChange={(e) => {
                const n = Number(e.target.value.replace(/[^0-9]/g, ''));
                onIncomeChange(e.target.value === '' || !Number.isFinite(n) || n <= 0 ? null : n);
              }}
              inputMode="numeric"
              placeholder="e.g. 80000"
              className="mt-3 h-11 w-full rounded-xl border border-slate-200 px-4 text-[14px] font-semibold focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-100"
            />
            <p className="mt-1.5 text-[12px] text-slate-400">Used for rent-to-income scoring. Stored only in your browser.</p>
          </div>

          {/* Type */}
          <div>
            <p className="text-[13px] font-extrabold uppercase tracking-wider text-navy-900">Property type</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {TYPES.map((t) => (
                <button
                  key={t} type="button" aria-pressed={filters.types.includes(t)}
                  onClick={() => set({ types: toggleArr(filters.types, t) })}
                  className={`rounded-full border px-4 py-2 text-[13px] font-semibold transition ${filters.types.includes(t) ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-slate-200 text-slate-600 hover:border-slate-400'}`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Bedrooms */}
          <div>
            <p className="text-[13px] font-extrabold uppercase tracking-wider text-navy-900">Bedrooms</p>
            <div className="mt-3 flex gap-2">
              {BEDROOMS.map((b) => (
                <button
                  key={b} type="button" aria-pressed={filters.bedrooms.includes(b)}
                  onClick={() => set({ bedrooms: toggleArr(filters.bedrooms, b) })}
                  className={`h-11 flex-1 rounded-xl border text-[14px] font-bold transition ${filters.bedrooms.includes(b) ? 'border-emerald-600 bg-emerald-50 text-emerald-700' : 'border-slate-200 text-slate-600 hover:border-slate-400'}`}
                >
                  {b === 4 ? '4+' : b}
                </button>
              ))}
            </div>
          </div>

          {/* Location */}
          <div>
            <label htmlFor="filter-location" className="text-[13px] font-extrabold uppercase tracking-wider text-navy-900">Location</label>
            <input
              id="filter-location" value={filters.location}
              onChange={(e) => set({ location: e.target.value })}
              placeholder="e.g. Bandra, Powai, BKC..."
              className="mt-3 h-11 w-full rounded-xl border border-slate-200 px-4 text-[14px] focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-100"
            />
          </div>

          {/* Amenities */}
          <fieldset>
            <legend className="text-[13px] font-extrabold uppercase tracking-wider text-navy-900">Amenities</legend>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {AMENITIES.map((a) => (
                <label key={a} className={`flex cursor-pointer items-center gap-2.5 rounded-xl border px-3 py-2.5 text-[13px] font-semibold transition ${filters.amenities.includes(a) ? 'border-emerald-500 bg-emerald-50 text-emerald-800' : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}>
                  <input
                    type="checkbox" checked={filters.amenities.includes(a)}
                    onChange={() => set({ amenities: toggleArr(filters.amenities, a) })}
                    className="h-4 w-4 accent-emerald-600"
                  />
                  {a}
                </label>
              ))}
            </div>
          </fieldset>

          {/* Persona */}
          <fieldset>
            <legend className="text-[13px] font-extrabold uppercase tracking-wider text-navy-900">Persona</legend>
            <div className="mt-3 flex flex-wrap gap-2">
              {PERSONAS.map((p) => (
                <button
                  key={p} type="button"
                  aria-pressed={filters.personas.includes(p)}
                  onClick={() => set({ personas: toggleArr(filters.personas, p) })}
                  className={`rounded-full border px-4 py-2 text-[13px] font-semibold capitalize transition ${filters.personas.includes(p) ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-slate-200 text-slate-600 hover:border-slate-400'}`}
                >
                  {p}
                </button>
              ))}
            </div>
          </fieldset>
        </div>

        <div className="flex gap-3 border-t border-slate-100 px-6 py-4">
          <button
            type="button" onClick={() => onChange(DEFAULT_FILTERS)}
            className="flex h-12 flex-1 items-center justify-center gap-2 rounded-2xl border border-slate-200 text-[14px] font-semibold text-slate-600 hover:bg-slate-50"
          >
            <RotateCcw className="h-4 w-4" /> Reset
          </button>
          <button
            type="button"
            onClick={() => { onApply(); onClose(); }}
            className="h-12 flex-[2] rounded-2xl bg-navy-900 text-[14px] font-bold text-white hover:bg-emerald-600"
          >
            Show results
          </button>
        </div>
      </aside>
    </div>
  );
}
