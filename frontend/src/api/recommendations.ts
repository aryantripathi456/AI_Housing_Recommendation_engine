import { api } from './client';
import type { Filters, Persona, Property } from '../types/property';

export interface RecommendationRequest {
  persona: Persona;
  filters: Filters;
  searchQuery: string;
  monthlyIncome?: number | null;
}

/**
 * Live recommendation service — POST /api/recommendations.
 * Backend owns filtering + MAUT/cosine ranking; frontend keeps the staged
 * loading UX and client-side re-sorting. No mock fallback (strict mode:
 * failures surface through the hook's error state).
 */
export async function getRecommendations(req: RecommendationRequest): Promise<Property[]> {
  return api<Property[]>('/api/recommendations', {
    method: 'POST',
    body: JSON.stringify({
      persona: req.persona,
      filters: req.filters,
      searchQuery: req.searchQuery,
      monthlyIncome: req.monthlyIncome ?? null,
    }),
  });
}
