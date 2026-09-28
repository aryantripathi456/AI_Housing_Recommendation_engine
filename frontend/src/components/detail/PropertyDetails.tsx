import { lazy, Suspense, useEffect } from 'react';
import { Bath, BedDouble, Heart, MapPin, Phone, Ruler, ShieldCheck, Star, X } from 'lucide-react';
import type { Persona, Property } from '../../types/property';
import { formatINR } from '../../utils/recommendation';
import AIScore from '../property/AIScore';
import RecommendationReasons from '../property/RecommendationReasons';

// Intelligence panels (Recharts) load on demand with the modal.
const AffordabilityPanel = lazy(() => import('../intelligence/AffordabilityPanel'));
const CommutePanel = lazy(() => import('../intelligence/CommutePanel'));
const LiveabilityPanel = lazy(() => import('../intelligence/LiveabilityPanel'));

const PanelFallback = () => <div className="skeleton h-36 w-full rounded-2xl" aria-label="Loading insights" />;

interface Props {
  property: Property | null;
  persona: Persona;
  saved: boolean;
  onToggleSave: (id: string) => void;
  onClose: () => void;
  income: number | null;
  onIncomeChange: (n: number | null) => void;
}

export default function PropertyDetails({ property: p, persona, saved, onToggleSave, onClose, income, onIncomeChange }: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    if (p) {
      document.addEventListener('keydown', onKey);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [p, onClose]);

  if (!p) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center sm:items-center sm:p-6" role="dialog" aria-modal="true" aria-label={`${p.title} details`}>
      <div className="absolute inset-0 bg-navy-950/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative max-h-[92vh] w-full max-w-3xl overflow-y-auto nice-scroll rounded-t-[24px] bg-white shadow-2xl sm:rounded-[24px] animate-fade-up">
        <div className="relative">
          <img src={p.image} alt={`${p.title} — ${p.type} in ${p.location}`} className="h-64 sm:h-80 w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
          <button
            type="button" onClick={onClose} aria-label="Close details"
            className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full bg-white/95 text-navy-900 shadow hover:bg-white"
          >
            <X className="h-5 w-5" />
          </button>
          <div className="absolute bottom-4 left-5 right-5 flex flex-wrap items-end justify-between gap-3 text-white">
            <div>
              <p className="text-[12px] font-bold uppercase tracking-wider text-emerald-300">{p.type} · {p.location}</p>
              <h2 className="font-display text-[24px] sm:text-[28px] font-extrabold leading-tight">{p.title}</h2>
              <p className="flex items-center gap-1.5 text-[13px] text-white/85"><MapPin className="h-4 w-4" /> {p.location}, {p.city}</p>
            </div>
            <div className="rounded-2xl bg-white/95 px-4 py-2.5 text-navy-900 backdrop-blur">
              <p className="font-display text-[20px] font-extrabold">{formatINR(p.price)}<span className="text-[13px] font-medium text-slate-400">/mo</span></p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 p-5 sm:p-7 md:grid-cols-[1fr_300px]">
          <div>
            <div className="grid grid-cols-4 gap-2 rounded-2xl border border-slate-100 bg-slate-50 p-4 text-center">
              {[
                { icon: BedDouble, v: `${p.bedrooms}`, l: 'Bedrooms' },
                { icon: Bath, v: `${p.bathrooms}`, l: 'Bathrooms' },
                { icon: Ruler, v: `${p.area} sq.ft`, l: 'Area' },
                { icon: Star, v: `${p.rating}`, l: 'Rating' },
              ].map(({ icon: Icon, v, l }) => (
                <div key={l}>
                  <Icon className="mx-auto h-5 w-5 text-slate-400" />
                  <p className="mt-1 text-[14px] font-extrabold text-navy-900">{v}</p>
                  <p className="text-[11px] text-slate-400">{l}</p>
                </div>
              ))}
            </div>

            <h3 className="font-display mt-6 text-[16px] font-extrabold text-navy-900">About this home</h3>
            <p className="mt-2 text-[14px] leading-relaxed text-slate-600">{p.description}</p>

            <h3 className="font-display mt-6 text-[16px] font-extrabold text-navy-900">Amenities</h3>
            <div className="mt-2.5 flex flex-wrap gap-2">
              {p.amenities.map((a) => (
                <span key={a} className="rounded-full bg-slate-100 px-3.5 py-1.5 text-[13px] font-semibold text-slate-700">{a}</span>
              ))}
            </div>

            <div className="mt-6">
              <Suspense fallback={<PanelFallback />}>
                <LiveabilityPanel propertyId={p.id} />
              </Suspense>
            </div>

            <div className="mt-6">
              <Suspense fallback={<PanelFallback />}>
                <CommutePanel propertyId={p.id} lat={p.latitude} lng={p.longitude} />
              </Suspense>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-200 p-4">
              <AIScore score={p.matchScore} />
              <p className="mt-2.5 text-[13px] italic leading-relaxed text-slate-500">
                "Recommended because this property fits your budget, keeps your commute short and sits near public transport."
              </p>
            </div>
            <RecommendationReasons reasons={p.recommendationReasons[persona]} persona={persona} limit={5} />
            <Suspense fallback={<PanelFallback />}>
              <AffordabilityPanel propertyId={p.id} price={p.price} income={income} onIncomeChange={onIncomeChange} />
            </Suspense>
            <div className="flex items-center gap-1.5 text-[12px] text-slate-500">
              <ShieldCheck className="h-4 w-4 text-emerald-600" /> Verified listing · {p.furnished ? 'Furnished' : 'Unfurnished'}
            </div>
            <div className="flex gap-2.5">
              <button
                type="button"
                onClick={() => onToggleSave(p.id)}
                aria-pressed={saved}
                className={`flex h-12 flex-1 items-center justify-center gap-2 rounded-2xl border text-[14px] font-bold transition ${saved ? 'border-rose-200 bg-rose-50 text-rose-600' : 'border-slate-200 text-slate-700 hover:border-rose-300 hover:text-rose-600'}`}
              >
                <Heart className={`h-[18px] w-[18px] ${saved ? 'fill-rose-500 text-rose-500' : ''}`} />
                {saved ? 'Saved' : 'Save'}
              </button>
              <button
                type="button"
                onClick={() => alert(`Enquiry sent for ${p.title}. The owner will contact you shortly.`)}
                className="flex h-12 flex-[1.4] items-center justify-center gap-2 rounded-2xl bg-emerald-600 text-[14px] font-bold text-white hover:bg-emerald-500"
              >
                <Phone className="h-4 w-4" /> Enquire
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
