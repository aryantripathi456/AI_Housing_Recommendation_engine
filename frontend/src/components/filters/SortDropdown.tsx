import { ArrowUpDown, Check } from 'lucide-react';
import { useState } from 'react';
import type { SortOption } from '../../types/property';

const OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'best-match', label: 'Best Match' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'distance', label: 'Distance to Work' },
  { value: 'rating', label: 'Highest Rated' },
];

export default function SortDropdown({ value, onChange }: { value: SortOption; onChange: (v: SortOption) => void }) {
  const [open, setOpen] = useState(false);
  const current = OPTIONS.find((o) => o.value === value);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Sort by ${current?.label}`}
        className="flex h-11 items-center gap-2 rounded-full border border-slate-200 bg-white px-4 text-[13px] font-semibold text-slate-700 shadow-sm transition hover:border-slate-300"
      >
        <ArrowUpDown className="h-4 w-4 text-slate-400" />
        {current?.label}
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <ul
            role="listbox"
            aria-label="Sort options"
            className="absolute right-0 z-20 mt-2 w-56 overflow-hidden rounded-2xl border border-slate-200 bg-white p-1.5 shadow-2xl animate-fade-up"
          >
            {OPTIONS.map((o) => (
              <li key={o.value}>
                <button
                  type="button"
                  role="option"
                  aria-selected={o.value === value}
                  onClick={() => {
                    onChange(o.value);
                    setOpen(false);
                  }}
                  className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-[13px] font-medium transition ${
                    o.value === value ? 'bg-emerald-50 text-emerald-800' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {o.label}
                  {o.value === value && <Check className="h-4 w-4" />}
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
