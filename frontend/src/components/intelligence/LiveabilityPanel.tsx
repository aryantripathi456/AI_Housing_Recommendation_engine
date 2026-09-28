import { useEffect, useState } from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts';
import { getLiveability, type Liveability } from '../../api/intelligence';
import { ApiError } from '../../api/client';

const DIM_LABELS: Record<string, string> = {
  transport: 'Transport',
  education: 'Education',
  healthcare: 'Healthcare',
  shopping: 'Shopping',
  environment: 'Green & calm',
};

const DIM_COLORS: Record<string, string> = {
  transport: '#059669',
  education: '#2563eb',
  healthcare: '#0d9488',
  shopping: '#d97706',
  environment: '#65a30d',
};

export default function LiveabilityPanel({ propertyId }: { propertyId: string }) {
  const [data, setData] = useState<Liveability | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError(null);
    getLiveability(propertyId)
      .then((d) => alive && setData(d))
      .catch((e) => alive && setError(e instanceof ApiError ? e.message : 'Could not load liveability.'))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [propertyId]);

  if (loading) {
    return (
      <div aria-label="Loading liveability">
        <div className="skeleton h-5 w-40 rounded-lg" />
        <div className="skeleton mt-3 h-36 w-full rounded-2xl" />
      </div>
    );
  }
  if (error || !data) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-[13px] text-slate-500" role="alert">
        {error ?? 'Liveability unavailable.'}{' '}
        <button type="button" onClick={() => window.location.reload()} className="font-bold text-emerald-700">
          Retry
        </button>
      </div>
    );
  }

  const donut = [
    { name: 'score', value: data.overall },
    { name: 'rest', value: Math.max(0, 100 - data.overall) },
  ];

  return (
    <div>
      <div className="flex items-center justify-between">
        <h3 className="font-display text-[16px] font-extrabold text-navy-900">Liveability breakdown</h3>
        {data.cached && (
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-500">Cached score</span>
        )}
      </div>
      <div className="mt-3 flex items-center gap-4 rounded-2xl border border-slate-100 bg-slate-50/60 p-4">
        <div className="relative h-28 w-28 shrink-0" role="img" aria-label={`Liveability ${data.overall} out of 100`}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={donut} dataKey="value" innerRadius={34} outerRadius={48} startAngle={90} endAngle={-270} strokeWidth={0}>
                <Cell fill="#059669" />
                <Cell fill="#e2e8f0" />
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <span className="absolute inset-0 grid place-items-center text-[17px] font-extrabold text-navy-900">
            {Math.round(data.overall)}
          </span>
        </div>
        <div className="min-w-0 flex-1 space-y-2">
          {Object.entries(data.dimensions).map(([dim, score]) => (
            <div key={dim}>
              <div className="flex justify-between text-[12px]">
                <span className="font-semibold text-slate-600">{DIM_LABELS[dim] ?? dim}</span>
                <span className="font-extrabold text-navy-900">{Math.round(score)}</span>
              </div>
              <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-200/70">
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${score}%`, background: DIM_COLORS[dim] ?? '#059669' }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
      <p className="mt-2 text-[12px] text-slate-400">
        Scored from {Object.values(data.poiCounts).reduce((a, b) => a + b, 0)} nearby places within 5 km · Gaussian distance decay
      </p>
    </div>
  );
}
