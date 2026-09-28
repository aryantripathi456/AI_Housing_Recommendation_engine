import { MapPin, Search } from 'lucide-react';

interface Props {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
}

const QUICK = ['Bandra', 'Powai', 'BKC', 'Andheri'];

export default function SearchBar({ value, onChange, onSubmit }: Props) {
  return (
    <div>
      <form
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
        className="flex h-[52px] items-center gap-2 rounded-2xl border border-slate-200 bg-white p-1.5 pl-4 shadow-[0_10px_36px_rgba(11,22,38,0.10)] focus-within:border-emerald-500 focus-within:ring-4 focus-within:ring-emerald-100"
      >
        <Search className="h-5 w-5 shrink-0 text-slate-400" aria-hidden />
        <label htmlFor="hero-search" className="sr-only">
          Search by location, area, college, office or neighborhood
        </label>
        <input
          id="hero-search"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Search by location, area, college, office or neighborhood..."
          className="min-w-0 flex-1 bg-transparent text-[14px] text-navy-900 placeholder:text-slate-400 focus:outline-none"
          autoComplete="off"
        />
        <span className="hidden sm:flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1.5 text-[12px] font-semibold text-slate-500">
          <MapPin className="h-3.5 w-3.5" /> Mumbai
        </span>
        <button
          type="submit"
          className="h-full shrink-0 rounded-xl bg-navy-900 px-4 sm:px-5 text-[14px] font-semibold text-white transition hover:bg-emerald-600"
        >
          Search
        </button>
      </form>
      <div className="mt-2.5 flex flex-wrap items-center gap-1.5 text-[12px]">
        <span className="text-slate-400 font-medium">Popular:</span>
        {QUICK.map((q) => (
          <button
            key={q}
            type="button"
            onClick={() => {
              onChange(q);
              onSubmit();
            }}
            className="rounded-full border border-slate-200 bg-white px-3 py-1 font-semibold text-slate-600 transition hover:border-emerald-400 hover:text-emerald-700"
          >
            {q}
          </button>
        ))}
      </div>
    </div>
  );
}
