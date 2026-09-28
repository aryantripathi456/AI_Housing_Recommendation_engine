/** Typed clients for the NestAI intelligence endpoints (Modules 3–6). */
import { api } from './client';
import type { Persona, Property } from '../types/property';

export interface Liveability {
  propertyId: string;
  overall: number;
  dimensions: Record<'transport' | 'education' | 'healthcare' | 'shopping' | 'environment', number>;
  poiCounts: Record<string, number>;
  cached: boolean;
}

export interface CommuteMode {
  durationMin: number;
  distanceKm: number;
  source: 'live' | 'estimated';
}

export interface CommuteResult {
  origin: { lat: number; lng: number };
  destination: { lat: number; lng: number };
  modes: Record<'driving' | 'walking' | 'transit', CommuteMode>;
}

export interface Affordability {
  price: number;
  monthlyIncome: number;
  rentToIncome: number;
  band: 'Affordable' | 'Moderate Risk' | 'Over Budget';
  advice: string;
}

export interface CompareItem {
  property: Property;
  liveability: { overall: number; dimensions: Record<string, number> };
  affordability?: Affordability;
}

export interface TrendSeries {
  locality: string;
  points: { month: string; avgRent: number }[];
}

/** Well-known destination hubs (mirror backend synthetic hubs). */
export const HUBS = {
  work: { label: 'BKC work hub', lat: 19.0626, lng: 72.8656 },
  college: { label: 'IIT Bombay / Powai campus', lat: 19.1334, lng: 72.9133 },
} as const;

export const getLiveability = (id: string) =>
  api<Liveability>(`/api/properties/${id}/liveability`);

export const getCommute = (originLat: number, originLng: number, destLat: number, destLng: number) =>
  api<CommuteResult>('/api/commute', {
    method: 'POST',
    body: JSON.stringify({ originLat, originLng, destLat, destLng }),
  });

export const getAffordability = (monthlyIncome: number, propertyId?: string, price?: number) =>
  api<Affordability>('/api/affordability', {
    method: 'POST',
    body: JSON.stringify({ monthlyIncome, propertyId, price }),
  });

export const compareProperties = (ids: string[], persona: Persona, monthlyIncome?: number) =>
  api<{ items: CompareItem[] }>('/api/compare', {
    method: 'POST',
    body: JSON.stringify({ ids, persona, monthlyIncome }),
  });

export const getTrends = (localities: string[]) =>
  api<TrendSeries[]>(`/api/trends?localities=${encodeURIComponent(localities.join(','))}`);

export const getLocalities = () =>
  api<{ localities: string[] }>('/api/localities');
