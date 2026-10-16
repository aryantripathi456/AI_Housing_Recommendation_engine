import { api, ApiError } from './client';
import type { Property } from '../types/property';

/** Live FastAPI service layer (strict: errors propagate to ErrorState UI). */
export async function getProperties(params?: {
  maxPrice?: number;
  search?: string;
  sort?: string;
  limit?: number;
  listingType?: string;
}): Promise<Property[]> {
  const q = new URLSearchParams();
  if (params?.maxPrice != null) q.set('max_price', String(params.maxPrice));
  if (params?.search) q.set('search', params.search);
  if (params?.sort && params.sort !== 'best-match') q.set('sort', params.sort);
  if (params?.limit != null) q.set('limit', String(params.limit));
  if (params?.listingType) q.set('listing_type', params.listingType);
  const suffix = q.toString() ? `?${q.toString()}` : '';
  return api<Property[]>(`/api/properties${suffix}`);
}

export async function getPropertyById(id: string): Promise<Property | undefined> {
  try {
    return await api<Property>(`/api/properties/${id}`);
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) return undefined;
    throw e;
  }
}
