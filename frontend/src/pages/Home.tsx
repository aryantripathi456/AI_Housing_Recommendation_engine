import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react';
import Hero from '../components/hero/Hero';
import Navbar from '../components/navbar/Navbar';
import MapSection from '../components/map/MapSection';
import ListingsSection from '../components/property/ListingsSection';
import PropertyDetails from '../components/detail/PropertyDetails';
import CompareTray from '../components/compare/CompareTray';
import Footer from '../components/footer/Footer';
import { useRecommendations } from '../hooks/useRecommendations';
import { useSaved } from '../hooks/useSaved';

// Below-the-fold / on-demand surfaces load in separate chunks
// (keeps Recharts out of the initial bundle).
const TrendsSection = lazy(() => import('../components/trends/TrendsSection'));
const CompareModal = lazy(() => import('../components/compare/CompareModal'));

export default function Home() {
  const rec = useRecommendations();
  const { saved, toggle, count } = useSaved();
  const [detailId, setDetailId] = useState<string | null>(null);
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [compareOpen, setCompareOpen] = useState(false);
  const autoRan = useRef(false);

  // Auto-run once on mount so map + listings are populated.
  // Guarded by ref so React StrictMode's double-effect in dev
  // doesn't fire two overlapping recommendation requests.
  useEffect(() => {
    if (autoRan.current) return;
    autoRan.current = true;
    rec.run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const scrollTo = useCallback((id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  const handleRecommend = useCallback(() => {
    rec.run().then(() => scrollTo('explore'));
  }, [rec, scrollTo]);

  const detailProperty = rec.results.find((p) => p.id === detailId) ?? null;
  const compareProperties = compareIds
    .map((id) => rec.results.find((p) => p.id === id))
    .filter((p): p is NonNullable<typeof p> => p != null);

  const toggleCompare = useCallback((id: string) => {
    setCompareIds((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : prev.length >= 3 ? prev : [...prev, id],
    );
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Navbar
        savedCount={count}
        onSavedClick={() => scrollTo('recommendations')}
        onFindHome={() => scrollTo('home')}
      />

      <main>
        <Hero
          persona={rec.persona}
          onPersona={rec.selectPersona}
          search={rec.searchQuery}
          onSearch={rec.setSearchQuery}
          onSearchSubmit={() => rec.run().then(() => scrollTo('explore'))}
          loading={rec.loading}
          onRecommend={handleRecommend}
        />

        <MapSection
          properties={rec.results}
          selectedId={rec.selectedId}
          onSelect={rec.setSelectedId}
          onOpen={setDetailId}
          savedIds={saved}
          onToggleSave={toggle}
          loading={rec.loading}
        />

        <ListingsSection
          rec={rec}
          savedIds={saved}
          onToggleSave={toggle}
          onOpen={setDetailId}
          compareIds={compareIds}
          onToggleCompare={toggleCompare}
        />

        <Suspense fallback={<div className="skeleton mx-auto my-14 h-72 max-w-7xl rounded-[20px]" />}>
          <TrendsSection />
        </Suspense>
      </main>

      <Footer />

      <CompareTray
        properties={compareProperties}
        onRemove={toggleCompare}
        onClear={() => setCompareIds([])}
        onCompare={() => setCompareOpen(true)}
      />
      {compareOpen && compareIds.length >= 2 && (
        <Suspense fallback={null}>
          <CompareModal
            ids={compareIds}
            persona={rec.persona}
            income={rec.monthlyIncome}
            onRemove={toggleCompare}
            onClear={() => setCompareIds([])}
            onClose={() => setCompareOpen(false)}
          />
        </Suspense>
      )}

      <PropertyDetails
        property={detailProperty}
        persona={rec.persona}
        saved={detailId ? saved.includes(detailId) : false}
        onToggleSave={toggle}
        onClose={() => setDetailId(null)}
        income={rec.monthlyIncome}
        onIncomeChange={rec.setMonthlyIncome}
      />
    </div>
  );
}
