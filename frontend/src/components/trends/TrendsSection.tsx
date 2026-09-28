import { useEffect, useMemo, useState } from 'react';
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ApiError } from '../../api/client';
import { getLocalities, getTrends, type TrendSeries } from '../../api/intelligence';
import { formatINR } from '../../utils/recommendation';

const LINE_COLORS = ['#059669', '#0f1e2e', '#d97706', '#2563eb', '#0d9488'];

function toRows(series: TrendSeries[]) {
  const months = series[0]?.points.map((p) => p.month) ?? [];
  return months.map((m, i) => ({
    month: m.slice(2), // YY-MM for compact axis
    ...Object.fromEntries(series.map((s) => [s.locality, s.points[i]?.avgRent ?? null])),
  }));
}

export default function TrendsSection() {
  const [localities, setLocalities] = useState<string[]>([]);
  const [selected, setSelected] = useState<string[]>(['Powai', 'Bandra West', 'BKC']);
  const [series, setSeries] = useState<TrendSeries[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getLocalities()
      .then((r) => {
        setLocalities(r.localities);
        setSelected((s) => {
          const valid = s.filter((l) => r.localities.includes(l));
          return valid.length > 0 ? valid.slice(0, 5) : r.localities.slice(0, 3);
        });
      })
      .catch(() => setError('Could not load localities. Is the backend running?'));
  }, []);

  useEffect(() => {
    if (selected.length === 0) {
      setSeries([]);
      setLoading(false);
      return;
    }
    let alive = true;
    setLoading(true);
    setError(null);
    getTrends(selected)
      .then((s) => alive && setSeries(s))
      .catch((e) => alive && setError(e instanceof ApiError ? e.message : 'Could not load trends.'))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [selected.join('|')]); // eslint-disable-line react-hooks/exhaustive-deps

  const rows = useMemo(() => (series ? toRows(series) : []), [series]);

  const toggle = (loc: string) =>
    setSelected((s) => (s.includes(loc) ? s.filter((l) => l !== loc) : s.length >= 5 ? s : [...s, loc]));

  return (
    <section id="trends" className="border-t border-slate-100 bg-white py-14 md:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <p className="text-[12px] font-bold uppercase tracking-[0.16em] text-emerald-600">Market intelligence</p>
        <h2 className="font-display mt-1 text-[28px] sm:text-[36px] font-extrabold tracking-tight text-navy-900">
          Local Rent Trajectories
        </h2>
        <p className="mt-1.5 max-w-xl text-[14px] sm:text-[15px] text-slate-500">
          Monthly average rents across localities. Series are synthetic — modelled trend plus seasonality for demonstration.
        </p>

        <div className="mt-5 flex flex-wrap gap-2" role="group" aria-label="Choose localities">
          {localities.map((loc) => (
            <button
              key={loc}
              type="button"
              aria-pressed={selected.includes(loc)}
              onClick={() => toggle(loc)}
              className={`rounded-full border px-4 py-2 text-[13px] font-semibold transition ${
                selected.includes(loc)
                  ? 'border-emerald-600 bg-emerald-600 text-white'
                  : 'border-slate-200 text-slate-600 hover:border-slate-400'
              }`}
            >
              {loc}
            </button>
          ))}
        </div>

        <div className="mt-6 rounded-[20px] border border-slate-200 bg-white p-4 sm:p-6 shadow-sm">
          {loading ? (
            <div className="skeleton h-[320px] w-full rounded-2xl" aria-label="Loading rent trends" />
          ) : error ? (
            <p className="py-16 text-center text-[14px] text-rose-600" role="alert">{error}</p>
          ) : rows.length === 0 ? (
            <p className="py-16 text-center text-[14px] text-slate-500">Select at least one locality to see trends.</p>
          ) : (
            <div className="h-[320px] w-full" role="img" aria-label={`Rent trend chart for ${selected.join(', ')}`}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={rows} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eef1f4" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#6b7280' }} tickLine={false} axisLine={{ stroke: '#e5e7eb' }} />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#6b7280' }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v: number) => `₹${Math.round(v / 1000)}k`}
                    domain={['auto', 'auto']}
                  />
                  <Tooltip
                    formatter={(v) => [formatINR(Number(v)), '']}
                    labelStyle={{ fontWeight: 700 }}
                    contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 13 }}
                  />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  {selected.map((loc, i) => (
                    <Line
                      key={loc}
                      type="monotone"
                      dataKey={loc}
                      stroke={LINE_COLORS[i % LINE_COLORS.length]}
                      strokeWidth={2.5}
                      dot={false}
                      activeDot={{ r: 4 }}
                      connectNulls
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
