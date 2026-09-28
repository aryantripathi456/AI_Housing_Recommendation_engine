import { useEffect, useState } from 'react';
import { Bus, Car, Footprints } from 'lucide-react';
import { ApiError } from '../../api/client';
import { getCommute, HUBS, type CommuteResult } from '../../api/intelligence';

const MODES = [
  { key: 'driving', label: 'Driving', icon: Car },
  { key: 'transit', label: 'Transit', icon: Bus },
  { key: 'walking', label: 'Walking', icon: Footprints },
] as const;

interface Props {
  propertyId: string;
  lat: number;
  lng: number;
}

export default function CommutePanel({ propertyId, lat, lng }: Props) {
  const [dest, setDest] = useState<'work' | 'college'>('work');
  const [data, setData] = useState<CommuteResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError(null);
    const hub = HUBS[dest];
    getCommute(lat, lng, hub.lat, hub.lng)
      .then((d) => alive && setData(d))
      .catch((e) => alive && setError(e instanceof ApiError ? e.message : 'Could not load commute.'))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [propertyId, lat, lng, dest]);

  return (
    <div>
      <div className="flex items-center justify-between gap-2">
        <h3 className="font-display text-[16px] font-extrabold text-navy-900">Commute times</h3>
        <div className="flex rounded-full bg-slate-100 p-1 text-[12px] font-bold" role="tablist" aria-label="Commute destination">
          {(['work', 'college'] as const).map((d) => (
            <button
              key={d}
              type="button"
              role="tab"
              aria-selected={dest === d}
              onClick={() => setDest(d)}
              className={`rounded-full px-3 py-1.5 capitalize transition ${dest === d ? 'bg-navy-900 text-white' : 'text-slate-500'}`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="skeleton mt-3 h-24 w-full rounded-2xl" aria-label="Loading commute times" />
      ) : error || !data ? (
        <p className="mt-3 rounded-2xl bg-slate-50 p-4 text-[13px] text-slate-500" role="alert">{error}</p>
      ) : (
        <ul className="mt-3 space-y-2">
          {MODES.map(({ key, label, icon: Icon }) => {
            const m = data.modes[key];
            if (!m) return null;
            return (
              <li key={key} className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-white text-navy-900 shadow-sm">
                  <Icon className="h-4.5 w-4.5 h-[18px] w-[18px]" />
                </span>
                <span className="flex-1">
                  <span className="block text-[13px] font-bold text-navy-900">{label}</span>
                  <span className="block text-[12px] text-slate-500">to {HUBS[dest].label} · {m.distanceKm} km</span>
                </span>
                <span className="text-right">
                  <span className="block text-[15px] font-extrabold text-navy-900">~{Math.round(m.durationMin)} min</span>
                  <span
                    className={`text-[11px] font-bold ${m.source === 'live' ? 'text-emerald-600' : 'text-amber-600'}`}
                    title={m.source === 'live' ? 'Real-time routing' : 'Calibrated estimate (no live transit feed)'}
                  >
                    {m.source === 'live' ? '● live' : '● estimated'}
                  </span>
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
