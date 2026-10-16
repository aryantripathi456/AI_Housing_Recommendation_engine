import { useEffect, useState } from 'react';
import { TrainFront } from 'lucide-react';
import { getNearestStations } from '../../api/intelligence';
import type { NearestStation } from '../../types/property';

interface Props {
  propertyId: string;
  initial?: NearestStation[];
}

/** 3 nearest railway stations + distances. Uses embedded data when present. */
export default function NearestStations({ propertyId, initial }: Props) {
  const [stations, setStations] = useState<NearestStation[] | null>(
    initial && initial.length ? initial : null,
  );
  const [loading, setLoading] = useState(!initial?.length);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initial && initial.length) {
      setStations(initial);
      setLoading(false);
      return;
    }
    let alive = true;
    setLoading(true);
    setError(null);
    getNearestStations(propertyId)
      .then((r) => alive && setStations(r.stations))
      .catch(() => alive && setError('Could not load nearby stations.'))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [propertyId]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="rounded-2xl border border-slate-200 p-4">
      <h3 className="font-display flex items-center gap-2 text-[15px] font-extrabold text-navy-900">
        <TrainFront className="h-4 w-4 text-emerald-600" /> Nearest railway stations
      </h3>
      {loading && <div className="skeleton mt-3 h-20 w-full rounded-xl" aria-label="Loading nearby stations" />}
      {error && <p className="mt-2 text-[13px] text-rose-600" role="alert">{error}</p>}
      {stations && (
        <ol className="mt-2.5 space-y-2">
          {stations.slice(0, 3).map((s, i) => (
            <li
              key={`${s.name}-${i}`}
              className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 px-3 py-2.5"
            >
              <span className="min-w-0">
                <span className="block truncate text-[13px] font-bold text-navy-900">
                  {i + 1}. {s.name}
                </span>
                <span className="block text-[12px] text-slate-500">
                  ~{Math.max(1, Math.round((s.distanceKm / 4.5) * 60))} min walk · {s.locality}
                </span>
              </span>
              <span className="shrink-0 rounded-full bg-white px-2.5 py-1 text-[12px] font-extrabold text-emerald-700 shadow-sm">
                {s.distanceKm.toFixed(1)} km
              </span>
            </li>
          ))}
        </ol>
      )}
      <p className="mt-2 text-[11px] text-slate-400">Straight-line distances from the listing.</p>
    </div>
  );
}
