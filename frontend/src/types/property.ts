export type Persona = 'student' | 'professional' | 'family' | 'senior';

export type PropertyType = 'Apartment' | 'House' | 'Studio' | 'Villa' | 'Shared';

export interface Property {
  id: string;
  title: string;
  location: string;
  city: string;
  price: number;
  type: PropertyType;
  bedrooms: number;
  bathrooms: number;
  area: number;
  latitude: number;
  longitude: number;
  image: string;
  amenities: string[];
  matchScore: number;
  personas: Persona[];
  distanceToWork?: number;
  distanceToCollege?: number;
  rating: number;
  furnished: boolean;
  description: string;
  recommendationReasons: Record<Persona, string[]>;
}

export interface Filters {
  minPrice: number;
  maxPrice: number;
  types: PropertyType[];
  bedrooms: number[]; // e.g. [1,2,3] ; 4 means 4+
  location: string;
  amenities: string[];
  personas: Persona[];
}

export type SortOption =
  | 'best-match'
  | 'price-asc'
  | 'price-desc'
  | 'distance'
  | 'rating';

export interface RecommendationRequest {
  persona: Persona;
  filters: Filters;
  searchQuery: string;
}

export const PERSONA_META: Record<
  Persona,
  { label: string; tagline: string; description: string }
> = {
  student: {
    label: 'Student',
    tagline: 'Affordable, connected, convenient',
    description: 'Budget-friendly stays near colleges, metro and cafes.',
  },
  professional: {
    label: 'Professional',
    tagline: 'Close to work and lifestyle amenities',
    description: 'Low-commute homes near business districts and metro.',
  },
  family: {
    label: 'Family',
    tagline: 'Space, safety, schools and community',
    description: 'Spacious homes near schools, parks and hospitals.',
  },
  senior: {
    label: 'Senior',
    tagline: 'Peaceful, accessible and healthcare-friendly',
    description: 'Quiet, elevator-ready homes near healthcare and parks.',
  },
};

export const DEFAULT_FILTERS: Filters = {
  minPrice: 0,
  maxPrice: 100000,
  types: [],
  bedrooms: [],
  location: '',
  amenities: [],
  personas: [],
};
