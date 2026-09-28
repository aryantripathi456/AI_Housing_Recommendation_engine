import { useCallback, useEffect, useState } from 'react';
import type { Persona } from '../types/property';

const SAVED_KEY = 'nestai:saved';
const PERSONA_KEY = 'nestai:persona';

const VALID_PERSONAS: Persona[] = ['student', 'professional', 'family', 'senior'];

function readSaved(): string[] {
  try {
    const raw = localStorage.getItem(SAVED_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((x) => typeof x === 'string') : [];
  } catch {
    return [];
  }
}

export function useSaved() {
  const [saved, setSaved] = useState<string[]>(() => readSaved());

  useEffect(() => {
    try {
      localStorage.setItem(SAVED_KEY, JSON.stringify(saved));
    } catch {
      // storage unavailable — ignore
    }
  }, [saved]);

  const toggle = useCallback((id: string) => {
    setSaved((prev) => (prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]));
  }, []);

  const isSaved = useCallback((id: string) => saved.includes(id), [saved]);

  return { saved, toggle, isSaved, count: saved.length };
}

export function loadStoredPersona(): Persona | null {
  try {
    const v = localStorage.getItem(PERSONA_KEY);
    return VALID_PERSONAS.includes(v as Persona) ? (v as Persona) : null;
  } catch {
    return null;
  }
}

export function storePersona(v: string) {
  try {
    localStorage.setItem(PERSONA_KEY, v);
  } catch {
    // ignore
  }
}
