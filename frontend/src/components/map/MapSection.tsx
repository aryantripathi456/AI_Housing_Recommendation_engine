import { lazy, Suspense, useState } from 'react';
import { Heart, List, Map as MapIcon, MapPin, Star } from 'lucide-react';
import type { Property } from '../../types/property';
import { formatINR } from '../../utils/recommendation';
import ErrorBoundary from '../common/ErrorBoundary';

const PropertyMap = lazy(() => import('./PropertyMap'));

interface Props {
  properties: Property[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onOpen: (id: string) => void;
  savedIds: string[];
  onToggleSave: (id: string) => void;
  loading: boolean;
}

export default function MapSection({ properties, selectedId, onSelect, onOpen, savedIds, onToggleSave, loading }: Props) {
  const [mobileTab, setMobileTab] = useState<'map' | 'list'>('map');
  const selected = properties.find((p) => p.id === selectedId) ?? properties[0];

  return (
    <section id="explore" className="bg-white py-14 md:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[12px] font-bold uppercase tracking-[0.16em] text-emerald-600">Live map</p>
            <h2 className="font-display mt-1 text-[28px] sm:text-[36px] font-extrabold tracking-tight text-navy-900">
              Explore Properties Near You
            </h2>
            <p className="mt-1.5 max-w-xl text-[14px] sm:text-[15px] text-slate-500">
              Click a price marker to preview the home. Selection stays in sync with listings below.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex rounded-full border border-slate-200 bg-slate-50 p-1 text-[13px] font-semibold md:hidden" role="tablist" aria-label="Map or list">
              <button
                type="button" role="tab" aria-selected={mobileTab === 'map'}
                onClick={() => setMobileTab('map')}
                className={`flex items-center gap-1.5 rounded-full px-4 py-2 ${mobileTab === 'map' ? 'bg-navy-900 text-white' : 'text-slate-500'}`}
              >
                <MapIcon className="h-4 w-4" /> Map
              </button>
              <button
                type="button" role="tab" aria-selected={mobileTab === 'list'}
                onClick={() => setMobileTab('list')}
                className={`flex items-center gap-1.5 rounded-full px-4 py-2 ${mobileTab === 'list' ? 'bg-navy-900 text-white' : 'text-slate-500'}`}
              >
                <List className="h-4 w-4" /> List
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-5 lg:grid-cols-[60%_40%]">
          {/* Map */}
          <div className={`${mobileTab === 'list' ? 'hidden md:block' : ''}`}>
            {loading ? (
              <div className="skeleton h-[380px] md:h-[520px] w-full rounded-[20px]" aria-label="Loading map" />
            ) : properties.length === 0 ? (
              <div className="grid h-[380px] place-items-center rounded-[20px] border border-dashed border-slate-300 bg-slate-50 text-[14px] text-slate-500">
                No properties to show on the map.
              </div>
            ) : (
              <Suspense fallback={<div className="skeleton h-[380px] md:h-[520px] w-full rounded-[20px]" />}>
                <ErrorBoundary fallbackLabel="The map could not be displayed.">
                  <PropertyMap properties={properties} selectedId={selectedId} onSelect={onSelect} onOpen={onOpen} />
                </ErrorBoundary>
              </Suspense>
            )}
          </div>

          {/* Side preview panel */}
          <div className={`${mobileTab === 'map' ? 'hidden md:flex' : 'flex'} flex-col gap-3`}>
            <p className="text-[12px] font-bold uppercase tracking-[0.14em] text-slate-400">
              Preview · {properties.length} homes
            </p>
            <div className="nice-scroll flex max-h-[300px] md:max-h-[520px] flex-col gap-3 overflow-y-auto pr-1">
              {properties.slice(0, 6).map((p) => {
                const active = p.id === selectedId;
                const saved = savedIds.includes(p.id);
                return (
                  <article
                    key={p.id}
                    onClick={() => onSelect(p.id)}
                    onKeyDown={(e) => e.key === 'Enter' && onSelect(p.id)}
                    tabIndex={0}
                    className={`flex cursor-pointer gap-3 rounded-2xl border p-3 transition ${
                      active
                        ? 'border-emerald-500 bg-emerald-50/60 shadow-lg ring-1 ring-emerald-500'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-md'
                    }`}
                    aria-label={`${p.title}, ${formatINR(p.price)} per month`}
                  >
                    <img src={p.image} alt="" loading="lazy" className="h-20 w-24 shrink-0 rounded-xl object-cover" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className="truncate text-[14px] font-bold text-navy-900">{p.title}</p>
                        <button
                          type="button"
                          aria-label={saved ? `Unsave ${p.title}` : `Save ${p.title}`}
                          aria-pressed={saved}
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleSave(p.id);
                          }}
                          className={`grid h-8 w-8 shrink-0 place-items-center rounded-full transition ${saved ? 'bg-rose-50 text-rose-500' : 'bg-slate-100 text-slate-400 hover:text-rose-500'}`}
                        >
                          <Heart className={`h-4 w-4 ${saved ? 'fill-rose-500' : ''}`} />
                        </button>
                      </div>
                      <p className="flex items-center gap-1 text-[12px] text-slate-500">
                        <MapPin className="h-3 w-3" /> {p.location}
                      </p>
                      <div className="mt-1 flex items-center justify-between">
                        <p className="text-[14px] font-extrabold text-navy-900">
                          {formatINR(p.price)}<span className="text-[12px] font-medium text-slate-400">/mo</span>
                        </p>
                        <span className="flex items-center gap-2 text-[12px] font-bold">
                          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-emerald-700">{p.matchScore}%</span>
                          <span className="flex items-center gap-0.5 text-slate-500"><Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />{p.rating}</span>
                        </span>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

            {selected && (
              <button
                type="button"
                onClick={() => onOpen(selected.id)}
                className="h-12 rounded-2xl bg-navy-900 text-[14px] font-semibold text-white transition hover:bg-emerald-600"
              >
                View {selected.title} — {formatINR(selected.price)}/mo
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
