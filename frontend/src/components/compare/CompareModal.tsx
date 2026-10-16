import { useEffect, useState } from 'react';
import { GitCompareArrows, X } from 'lucide-react';
import { ApiError } from '../../api/client';
import { compareProperties, type CompareItem } from '../../api/intelligence';
import type { Persona } from '../../types/property';
import { formatPropertyPrice } from '../../utils/recommendation';

interface Props {
  ids: string[];
  persona: Persona;
  income: number | null;
  onRemove: (id: string) => void;
  onClear: () => void;
  onClose: () => void;
}

export default function CompareModal({ ids, persona, income, onRemove, onClear, onClose }: Props) {
  const [items, setItems] = useState<CompareItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  useEffect(() => {
    let alive = true;
    setItems(null);
    setError(null);
    compareProperties(ids, persona, income ?? undefined)
      .then((r) => alive && setItems(r.items))
      .catch((e) => alive && setError(e instanceof ApiError ? e.message : 'Comparison failed.'));
    return () => {
      alive = false;
    };
  }, [ids.join(','), persona]); // eslint-disable-line react-hooks/exhaustive-deps

  const best = (vals: number[], higher = true) => {
    const target = higher ? Math.max(...vals) : Math.min(...vals);
    return (v: number) => v === target;
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center sm:items-center sm:p-6" role="dialog" aria-modal="true" aria-label="Compare properties">
      <div className="absolute inset-0 bg-navy-950/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative max-h-[92vh] w-full max-w-4xl overflow-y-auto nice-scroll rounded-t-[24px] bg-white p-5 sm:p-7 shadow-2xl sm:rounded-[24px] animate-fade-up">
        <div className="flex items-center justify-between">
          <h2 className="font-display flex items-center gap-2 text-[20px] font-extrabold text-navy-900">
            <GitCompareArrows className="h-5 w-5 text-emerald-600" /> Side-by-side comparison
          </h2>
          <button type="button" onClick={onClose} aria-label="Close comparison" className="grid h-10 w-10 place-items-center rounded-full bg-slate-100 hover:bg-slate-200">
            <X className="h-5 w-5" />
          </button>
        </div>

        {!items && !error && <div className="skeleton mt-5 h-64 w-full rounded-2xl" aria-label="Loading comparison" />}
        {error && <p className="mt-5 rounded-2xl bg-rose-50 p-4 text-[14px] text-rose-700" role="alert">{error}</p>}

        {items && (
          <div className="nice-scroll mt-5 overflow-x-auto">
            <table className="w-full min-w-[560px] border-separate text-[13px]" style={{ borderSpacing: 0 }}>
              <thead>
                <tr>
                  <th className="w-32" />
                  {items.map(({ property: p }) => (
                    <th key={p.id} className="p-2 align-top">
                      <div className="overflow-hidden rounded-2xl border border-slate-200">
                        <img src={p.image} alt="" className="h-28 w-full object-cover" loading="lazy" />
                        <div className="p-3 text-left">
                          <p className="truncate text-[14px] font-extrabold text-navy-900">{p.title}</p>
                          <p className="text-[12px] text-slate-500">{p.location}</p>
                          <button type="button" onClick={() => onRemove(p.id)} className="mt-1 text-[12px] font-bold text-rose-600 hover:underline">
                            Remove
                          </button>
                        </div>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <Row label={items.some((i) => i.property.listingType === 'sale') ? 'Price' : 'Monthly rent'} vals={items.map((i) => i.property.price)} lowerBetter
                  render={(v, i) => formatPropertyPrice(v, items[i].property.listingType)} />
                <Row label="AI match" vals={items.map((i) => i.property.matchScore)}
                  render={(v) => `${Math.round(v)}%`} highlight />
                <Row label="Liveability" vals={items.map((i) => i.liveability.overall)}
                  render={(v) => `${Math.round(v)}/100`} highlight />
                <Row label="Rating" vals={items.map((i) => i.property.rating)}
                  render={(v) => `${v}/5`} />
                <Row label="Layout" vals={items.map((i) => i.property.bedrooms)} render={(_v, i) => `${items[i].property.bedrooms} BHK · ${items[i].property.area} sq.ft`} plain />
                <Row label="Commute" vals={items.map((i) => i.property.distanceToWork ?? 99)} lowerBetter
                  render={(v) => (v >= 99 ? '—' : `${v} km`)} />
                {income != null && (
                  <Row label="Affordability" vals={items.map((i) => i.affordability?.rentToIncome ?? 9)} lowerBetter
                    render={(_v, i) => items[i].affordability?.band ?? '—'} />
                )}
              </tbody>
            </table>
            <button type="button" onClick={() => { onClear(); onClose(); }} className="mt-4 text-[13px] font-bold text-slate-500 hover:text-rose-600">
              Clear all
            </button>
          </div>
        )}
      </div>
    </div>
  );

  function Row({ label, vals, render, lowerBetter, highlight, plain }: {
    label: string; vals: number[];
    render: (v: number, i: number) => React.ReactNode;
    lowerBetter?: boolean; highlight?: boolean; plain?: boolean;
  }) {
    const isBest = plain ? () => false : best(vals, !lowerBetter);
    return (
      <tr>
        <th className="py-2.5 pr-3 text-left text-[12px] font-bold uppercase tracking-wide text-slate-400">{label}</th>
        {vals.map((v, i) => (
          <td key={i} className="px-2 py-2.5 text-center">
            <span className={`inline-block rounded-xl px-3 py-1.5 font-extrabold text-navy-900 ${isBest(v) ? (highlight ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-900 text-white') : 'bg-slate-100'}`}>
              {render(v, i)}
            </span>
          </td>
        ))}
      </tr>
    );
  }
}
