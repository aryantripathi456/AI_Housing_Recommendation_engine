import { useState } from 'react';
import { SlidersHorizontal } from 'lucide-react';
import FilterDrawer from '../filters/FilterDrawer';
import SortDropdown from '../filters/SortDropdown';
import PropertyGrid, { PropertyGridSkeleton } from '../property/PropertyGrid';
import { EmptyState, ErrorState, LoadingState } from '../common/States';
import type { RecommendationsApi } from '../../hooks/useRecommendations';
import { DEFAULT_FILTERS, PERSONA_META } from '../../types/property';

interface Props {
  rec: RecommendationsApi;
  savedIds: string[];
  onToggleSave: (id: string) => void;
  onOpen: (id: string) => void;
  compareIds: string[];
  onToggleCompare: (id: string) => void;
}

export default function ListingsSection({ rec, savedIds, onToggleSave, onOpen, compareIds, onToggleCompare }: Props) {
  const [filterOpen, setFilterOpen] = useState(false);
  const activeFilterCount =
    rec.filters.types.length +
    rec.filters.bedrooms.length +
    rec.filters.amenities.length +
    rec.filters.personas.length +
    (rec.filters.location ? 1 : 0) +
    (rec.filters.minPrice > 0 || rec.filters.maxPrice < 100000 ? 1 : 0);

  return (
    <section id="recommendations" className="bg-mist-100 bg-[#F6F7F9] py-14 md:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[12px] font-bold uppercase tracking-[0.16em] text-emerald-600">
              {PERSONA_META[rec.persona].label} picks · AI ranked
            </p>
            <h2 className="font-display mt-1 text-[28px] sm:text-[36px] font-extrabold tracking-tight text-navy-900">
              Recommended For You
            </h2>
            <p className="mt-1.5 max-w-xl text-[14px] sm:text-[15px] text-slate-500">
              Properties ranked by AI based on your lifestyle, preferences and location.
            </p>
          </div>
          <div className="flex items-center gap-2.5">
            <SortDropdown value={rec.sort} onChange={rec.setSort} />
            <button
              type="button"
              onClick={() => setFilterOpen(true)}
              aria-label={`Open filters${activeFilterCount ? `, ${activeFilterCount} active` : ''}`}
              className="relative flex h-11 items-center gap-2 rounded-full bg-navy-900 px-4 text-[13px] font-semibold text-white shadow transition hover:bg-navy-800"
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filters
              {activeFilterCount > 0 && (
                <span className="grid h-5 min-w-5 place-items-center rounded-full bg-emerald-500 px-1 text-[11px] font-bold">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>
        </div>

        <div className="mt-7">
          {rec.loading ? (
            <>
              <LoadingState stage={rec.loadingStages[rec.loadingStage]} />
              <PropertyGridSkeleton />
            </>
          ) : rec.error ? (
            <ErrorState onRetry={rec.retry} />
          ) : !rec.hasSearched ? (
            <div className="rounded-[20px] border border-slate-200 bg-white p-10 text-center text-[14px] text-slate-500">
              Select your persona above and click <strong className="text-navy-900">Get AI Recommendations</strong> to see ranked homes.
            </div>
          ) : rec.results.length === 0 ? (
            <EmptyState
              onReset={() => {
                rec.setFilters(DEFAULT_FILTERS);
                rec.setSearchQuery('');
                rec.run({ filters: DEFAULT_FILTERS, search: '' });
              }}
            />
          ) : (
            <>
              <p className="mb-4 text-[13px] font-medium text-slate-500" aria-live="polite">
                Showing <strong className="text-navy-900">{rec.results.length}</strong> homes for{' '}
                <strong className="text-navy-900">{PERSONA_META[rec.persona].label}</strong>
                {rec.searchQuery && <> matching “{rec.searchQuery}”</>}
              </p>
              <PropertyGrid
                properties={rec.results}
                persona={rec.persona}
                savedIds={savedIds}
                selectedId={rec.selectedId}
                onToggleSave={onToggleSave}
                onOpen={onOpen}
                onSelect={rec.setSelectedId}
                compareIds={compareIds}
                onToggleCompare={onToggleCompare}
              />
            </>
          )}
        </div>
      </div>

      <FilterDrawer
        open={filterOpen}
        filters={rec.filters}
        onChange={rec.setFilters}
        onClose={() => setFilterOpen(false)}
        onApply={() => rec.run()}
        monthlyIncome={rec.monthlyIncome}
        onIncomeChange={rec.setMonthlyIncome}
      />
    </section>
  );
}
