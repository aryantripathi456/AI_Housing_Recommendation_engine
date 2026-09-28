import type { Property, SortOption } from '../types/property';

/**
 * Client-side helpers that remain after the backend owns filtering + ranking:
 * instant re-sorting of the ranked list, plus currency formatting.
 * (The old mock `applyFilters`/`personaBoost`/`rankProperties` were removed
 * with the static dataset — POST /api/recommendations is authoritative.)
 */
export function sortProperties(list: Property[], sort: SortOption): Property[] {
  const arr = [...list];
  switch (sort) {
    case 'price-asc':
      return arr.sort((a, b) => a.price - b.price);
    case 'price-desc':
      return arr.sort((a, b) => b.price - a.price);
    case 'distance':
      return arr.sort((a, b) => (a.distanceToWork ?? 99) - (b.distanceToWork ?? 99));
    case 'rating':
      return arr.sort((a, b) => b.rating - a.rating);
    case 'best-match':
    default:
      return arr.sort((a, b) => b.matchScore - a.matchScore);
  }
}

export function formatINR(n: number): string {
  return `₹${n.toLocaleString('en-IN')}`;
}

export function formatK(n: number): string {
  if (n >= 1000) {
    const k = n / 1000;
    return `₹${Number.isInteger(k) ? k : k.toFixed(1)}K`;
  }
  return `₹${n}`;
}
