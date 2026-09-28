import { GitCompareArrows, X } from 'lucide-react';
import type { Property } from '../../types/property';

interface Props {
  properties: Property[];
  onRemove: (id: string) => void;
  onClear: () => void;
  onCompare: () => void;
}

export default function CompareTray({ properties, onRemove, onClear, onCompare }: Props) {
  if (properties.length === 0) return null;
  return (
    <div className="fixed inset-x-0 bottom-4 z-[55] px-4 sm:bottom-6" role="region" aria-label="Compare tray">
      <div className="mx-auto flex max-w-2xl items-center gap-3 rounded-2xl border border-slate-200 bg-white/95 p-3 pl-4 shadow-2xl backdrop-blur-xl animate-fade-up">
        <span className="flex items-center gap-1.5 text-[13px] font-extrabold text-navy-900">
          <GitCompareArrows className="h-4 w-4 text-emerald-600" />
          {properties.length}/3
        </span>
        <div className="flex min-w-0 flex-1 gap-1.5 overflow-hidden">
          {properties.map((p) => (
            <span key={p.id} className="flex min-w-0 items-center gap-1 rounded-full bg-slate-100 py-1 pl-2 pr-1 text-[12px] font-semibold text-slate-700">
              <img src={p.image} alt="" className="h-5 w-5 rounded-full object-cover" />
              <span className="max-w-[90px] truncate">{p.location}</span>
              <button type="button" onClick={() => onRemove(p.id)} aria-label={`Remove ${p.title} from compare`} className="grid h-5 w-5 place-items-center rounded-full hover:bg-slate-200">
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
        <button type="button" onClick={onClear} className="hidden text-[12px] font-bold text-slate-400 hover:text-rose-600 sm:block">
          Clear
        </button>
        <button
          type="button"
          onClick={onCompare}
          disabled={properties.length < 2}
          title={properties.length < 2 ? 'Add at least 2 homes to compare' : 'Compare homes'}
          className="h-10 shrink-0 rounded-xl bg-navy-900 px-4 text-[13px] font-bold text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Compare
        </button>
      </div>
    </div>
  );
}
