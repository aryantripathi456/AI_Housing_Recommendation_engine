import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { getRecommendations } from '../api/recommendations';
import type { Filters, ListingType, Persona, Property, SortOption } from '../types/property';
import { DEFAULT_FILTERS, DEFAULT_SALE_FILTERS } from '../types/property';
import { sortProperties } from '../utils/recommendation';
import { loadStoredPersona, storePersona } from './useSaved';

const INCOME_KEY = 'nestai:income';

function loadIncome(): number | null {
  try {
    const raw = localStorage.getItem(INCOME_KEY);
    const n = raw == null ? NaN : Number(raw);
    return Number.isFinite(n) && n > 0 ? n : null;
  } catch {
    return null;
  }
}

const STAGES = [
  'Analyzing your preferences...',
  'Finding suitable properties...',
  'Ranking homes for your lifestyle...',
];

export function useRecommendations() {
  const [persona, setPersona] = useState<Persona>(
    () => loadStoredPersona() ?? 'professional',
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [listingType, setListingTypeState] = useState<ListingType>('rent');
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [sort, setSort] = useState<SortOption>('best-match');
  const [monthlyIncome, setMonthlyIncomeState] = useState<number | null>(loadIncome);
  const [results, setResults] = useState<Property[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const stageTimer = useRef<number | null>(null);

  // Never leave the staged-loading interval running after unmount.
  useEffect(() => {
    return () => {
      if (stageTimer.current) window.clearInterval(stageTimer.current);
    };
  }, []);

  const selectPersona = useCallback((p: Persona) => {
    setPersona(p);
    storePersona(p);
  }, []);

  const setMonthlyIncome = useCallback((n: number | null) => {
    setMonthlyIncomeState(n);
    try {
      if (n == null) localStorage.removeItem(INCOME_KEY);
      else localStorage.setItem(INCOME_KEY, String(n));
    } catch {
      /* storage unavailable */
    }
  }, []);

  const setListingType = useCallback((t: ListingType) => {
    setListingTypeState(t);
    // Switch budget defaults per tenure so rent caps don't hide sale homes.
    setFilters(t === 'sale' ? DEFAULT_SALE_FILTERS : DEFAULT_FILTERS);
    setSelectedId(null);
  }, []);

  const run = useCallback(
    async (override?: { persona?: Persona; filters?: Filters; search?: string; income?: number | null; listingType?: ListingType }) => {
      const p = override?.persona ?? persona;
      const f = override?.filters ?? filters;
      const q = override?.search ?? searchQuery;
      const t = override?.listingType ?? listingType;
      setLoading(true);
      setError(null);
      setLoadingStage(0);
      if (stageTimer.current) window.clearInterval(stageTimer.current);
      stageTimer.current = window.setInterval(() => {
        setLoadingStage((s) => (s + 1 < STAGES.length ? s + 1 : s));
      }, 550);
      try {
        // Backend owns filtering + ranking; income personalises price scoring.
        const income = override && 'income' in override ? override.income : monthlyIncome;
        const data = await getRecommendations({ persona: p, filters: f, searchQuery: q, monthlyIncome: income, listingType: t });
        setResults(data);
        setHasSearched(true);
        setSelectedId((prev) => prev ?? data[0]?.id ?? null);
      } catch {
        setError('Something went wrong while loading properties.');
      } finally {
        if (stageTimer.current) window.clearInterval(stageTimer.current);
        setLoading(false);
      }
    },
    [persona, filters, searchQuery, monthlyIncome, listingType],
  );

  const sorted = useMemo(() => sortProperties(results, sort), [results, sort]);

  const selected = useMemo(
    () => sorted.find((r) => r.id === selectedId) ?? sorted[0] ?? null,
    [sorted, selectedId],
  );

  return {
    persona,
    selectPersona,
    searchQuery,
    setSearchQuery,
    listingType,
    setListingType,
    filters,
    setFilters,
    sort,
    setSort,
    monthlyIncome,
    setMonthlyIncome,
    results: sorted,
    loading,
    loadingStage,
    loadingStages: STAGES,
    error,
    hasSearched,
    run,
    retry: () => run(),
    selected,
    selectedId: selected?.id ?? null,
    setSelectedId,
  };
}

export type RecommendationsApi = ReturnType<typeof useRecommendations>;
