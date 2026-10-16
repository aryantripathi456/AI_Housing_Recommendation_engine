import { Bath, BedDouble, GitCompareArrows, Heart, MapPin, Ruler, Sparkles, Star, TrainFront } from 'lucide-react';
import type { Persona, Property } from '../../types/property';
import { formatPropertyPrice } from '../../utils/recommendation';
import AIScore from './AIScore';
import RecommendationReasons from './RecommendationReasons';

interface Props {
  property: Property;
  persona: Persona;
  saved: boolean;
  onToggleSave: (id: string) => void;
  onOpen: (id: string) => void;
  onSelect: (id: string) => void;
  selected: boolean;
  compareSelected?: boolean;
  onToggleCompare?: (id: string) => void;
}

export default function PropertyCard({ property: p, persona, saved, onToggleSave, onOpen, onSelect, selected, compareSelected, onToggleCompare }: Props) {
  const sale = p.listingType === 'sale';
  const nearest = p.nearestStations?.[0];
  return (
    <article
      onClick={() => {
        onSelect(p.id);
        onOpen(p.id);
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          onSelect(p.id);
          onOpen(p.id);
        }
      }}
      tabIndex={0}
      aria-label={`${p.title}, ${p.location}, ${formatPropertyPrice(p.price, p.listingType)}${sale ? ' total' : ' per month'}, ${p.matchScore}% AI match`}
      className={`group cursor-pointer overflow-hidden rounded-[20px] border bg-white transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_24px_60px_rgba(11,22,38,0.16)] ${
        selected ? 'border-emerald-500 ring-2 ring-emerald-200' : 'border-slate-200'
      }`}
    >
      <div className="relative">
        <img
          src={p.image}
          alt={`${p.title} — ${p.type} in ${p.location}`}
          loading="lazy"
          className="h-52 w-full object-cover transition duration-500 group-hover:scale-[1.04]"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=900&q=80&auto=format&fit=crop';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/25 to-transparent opacity-0 transition group-hover:opacity-100" />
        <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-navy-900/90 px-2.5 py-1 text-[11px] font-bold text-white backdrop-blur">
          <Sparkles className="h-3 w-3 text-emerald-300" /> AI Recommended
        </span>
        <button
          type="button"
          aria-label={saved ? `Unsave ${p.title}` : `Save ${p.title}`}
          aria-pressed={saved}
          onClick={(e) => {
            e.stopPropagation();
            onToggleSave(p.id);
          }}
          className={`absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full shadow-lg transition active:scale-90 ${
            saved ? 'bg-rose-500 text-white' : 'bg-white/95 text-slate-500 hover:text-rose-500'
          }`}
        >
          <Heart className={`h-[18px] w-[18px] ${saved ? 'fill-white' : ''}`} />
        </button>
        <span className="absolute bottom-3 left-3 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-bold text-navy-900">
          {p.type} · {p.furnished ? 'Furnished' : 'Unfurnished'}
        </span>
        {onToggleCompare && (
          <button
            type="button"
            aria-label={compareSelected ? `Remove ${p.title} from compare` : `Add ${p.title} to compare`}
            aria-pressed={!!compareSelected}
            onClick={(e) => {
              e.stopPropagation();
              onToggleCompare(p.id);
            }}
            className={`absolute bottom-3 right-3 flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold shadow-lg transition active:scale-95 ${
              compareSelected ? 'bg-emerald-600 text-white' : 'bg-white/95 text-slate-600 hover:text-emerald-700'
            }`}
          >
            <GitCompareArrows className="h-3.5 w-3.5" /> {compareSelected ? 'Added' : 'Compare'}
          </button>
        )}
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="truncate font-display text-[17px] font-extrabold text-navy-900">{p.title}</h3>
            <p className="mt-0.5 flex items-center gap-1 text-[13px] text-slate-500">
              <MapPin className="h-3.5 w-3.5 shrink-0" /> {p.location} · {p.city}
            </p>
          </div>
          <span className="flex shrink-0 items-center gap-1 rounded-full bg-amber-50 px-2 py-1 text-[12px] font-bold text-amber-600">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" /> {p.rating}
          </span>
        </div>

        <div className="mt-3 flex items-baseline gap-1.5">
          <p className="font-display text-[22px] font-extrabold text-navy-900">{formatPropertyPrice(p.price, p.listingType)}</p>
          <p className="text-[13px] font-medium text-slate-400">{sale ? 'total' : '/month'}</p>
          <p className="ml-auto text-[13px] font-semibold text-slate-500">{p.bedrooms} BHK · {p.area} sq.ft</p>
        </div>
        {sale && (
          <span className="mt-1.5 inline-block rounded-full bg-sky-50 px-2.5 py-0.5 text-[11px] font-bold text-sky-700">
            For Sale
          </span>
        )}

        <div className="mt-3 grid grid-cols-4 gap-2 border-y border-slate-100 py-3 text-center">
          {[
            { icon: BedDouble, v: `${p.bedrooms}`, l: 'Beds' },
            { icon: Bath, v: `${p.bathrooms}`, l: 'Baths' },
            { icon: Ruler, v: `${p.area}`, l: 'sq.ft' },
            { icon: MapPin, v: p.distanceToWork != null ? `${p.distanceToWork} km` : '—', l: 'Work' },
          ].map(({ icon: Icon, v, l }) => (
            <div key={l}>
              <Icon className="mx-auto h-4 w-4 text-slate-400" />
              <p className="mt-1 text-[12px] font-bold text-navy-900">{v}</p>
              <p className="text-[11px] text-slate-400">{l}</p>
            </div>
          ))}
        </div>

        {nearest && (
          <p className="mt-3 flex items-center gap-1.5 truncate text-[12px] font-semibold text-slate-600">
            <TrainFront className="h-4 w-4 shrink-0 text-emerald-600" />
            <span className="truncate">
              {nearest.name} · {nearest.distanceKm.toFixed(1)} km
            </span>
          </p>
        )}

        <div className="mt-4">
          <AIScore score={p.matchScore} compact />
        </div>
        <div className="mt-3">
          <RecommendationReasons reasons={p.recommendationReasons[persona]} persona={persona} limit={3} />
        </div>
      </div>
    </article>
  );
}
