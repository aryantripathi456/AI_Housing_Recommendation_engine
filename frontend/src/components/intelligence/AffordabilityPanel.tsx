import { useEffect, useState } from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts';
import { ApiError } from '../../api/client';
import { getAffordability, type Affordability } from '../../api/intelligence';
import { formatINR, formatPropertyPrice } from '../../utils/recommendation';

const BAND_COLOR: Record<string, string> = {
  'Affordable': '#059669',
  'Moderate Risk': '#d97706',
  'Over Budget': '#e11d48',
};

interface Props {
  propertyId: string;
  price: number;
  income: number | null;
  onIncomeChange: (n: number | null) => void;
  listingType?: string;
}

export default function AffordabilityPanel({ propertyId, price, income, onIncomeChange, listingType }: Props) {
  const sale = listingType === 'sale';
  const [data, setData] = useState<Affordability | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState(income ? String(income) : '');

  useEffect(() => {
    if (income == null) {
      setData(null);
      return;
    }
    let alive = true;
    setLoading(true);
    setError(null);
    getAffordability(income, propertyId)
      .then((d) => alive && setData(d))
      .catch((e) => alive && setError(e instanceof ApiError ? e.message : 'Could not evaluate affordability.'))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [propertyId, income]);

  const submit = () => {
    const n = Number(draft.replace(/[^0-9]/g, ''));
    onIncomeChange(Number.isFinite(n) && n > 0 ? n : null);
  };

  return (
    <div className="rounded-2xl border border-slate-200 p-4">
      <h3 className="font-display text-[15px] font-extrabold text-navy-900">Affordability check</h3>

      <div className="mt-2.5 flex gap-2">
        <label htmlFor={`income-${propertyId}`} className="sr-only">Monthly income in rupees</label>
        <input
          id={`income-${propertyId}`}
          value={income != null ? String(income) : draft}
          onChange={(e) => {
            if (income != null) onIncomeChange(null);
            setDraft(e.target.value);
          }}
          onKeyDown={(e) => e.key === 'Enter' && submit()}
          inputMode="numeric"
          placeholder="Monthly income ₹"
          className="h-10 min-w-0 flex-1 rounded-xl border border-slate-200 px-3 text-[13px] font-semibold focus:border-emerald-500 focus:outline-none"
        />
        <button
          type="button"
          onClick={submit}
          className="h-10 shrink-0 rounded-xl bg-navy-900 px-4 text-[13px] font-bold text-white hover:bg-emerald-600"
        >
          Check
        </button>
      </div>

      {loading && <div className="skeleton mt-3 h-20 w-full rounded-xl" aria-label="Evaluating affordability" />}
      {error && <p className="mt-3 text-[13px] text-rose-600" role="alert">{error}</p>}

      {data && !loading && (
        <div className="mt-3 flex items-center gap-3">
          <div className="relative h-20 w-20 shrink-0" role="img" aria-label={`Rent is ${Math.round(data.rentToIncome * 100)} percent of income`}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { v: Math.min(data.rentToIncome, 1) },
                    { v: Math.max(0, 1 - Math.min(data.rentToIncome, 1)) },
                  ]}
                  dataKey="v"
                  innerRadius={26}
                  outerRadius={36}
                  startAngle={90}
                  endAngle={-270}
                  strokeWidth={0}
                >
                  <Cell fill={BAND_COLOR[data.band] ?? '#059669'} />
                  <Cell fill="#e2e8f0" />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <span className="absolute inset-0 grid place-items-center text-[13px] font-extrabold text-navy-900">
              {Math.round(data.rentToIncome * 100)}%
            </span>
          </div>
          <div className="min-w-0">
            <p className="text-[13px] font-extrabold" style={{ color: BAND_COLOR[data.band] }}>{data.band}</p>
            <p className="text-[12px] text-slate-500">
              {sale
                ? `${formatPropertyPrice(price, 'sale')} total · EMI vs ${formatINR(data.monthlyIncome)}/mo income`
                : `${formatINR(price)}/mo of ${formatINR(data.monthlyIncome)}/mo income`}
            </p>
            <p className="mt-1 text-[12px] leading-snug text-slate-600">{data.advice}</p>
          </div>
        </div>
      )}
    </div>
  );
}
