/**
 * Central HTTP client for the NestAI FastAPI backend.
 *
 * Base URL resolution:
 *  - `VITE_API_URL` set  -> explicit backend origin (e.g. deployed API)
 *  - otherwise           -> same-origin `/api` (Vite dev proxy forwards to
 *                           localhost:8000; production serves/rewrites /api)
 */
export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

const BASE = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '') ?? '';
const TIMEOUT_MS = 15000;

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const ctrl = new AbortController();
  const timer = window.setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(`${BASE}${path}`, {
      ...init,
      signal: ctrl.signal,
      headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
    });
    if (!res.ok) {
      let detail = `Request failed (${res.status})`;
      try {
        const body = await res.json();
        if (typeof body?.detail === 'string') detail = body.detail;
      } catch {
        /* keep default */
      }
      throw new ApiError(res.status, detail);
    }
    if (res.status === 204) return undefined as T;
    return (await res.json()) as T;
  } catch (e) {
    if (e instanceof ApiError) throw e;
    if (e instanceof DOMException && e.name === 'AbortError') {
      throw new ApiError(0, 'The server is taking too long to respond. Please try again.');
    }
    throw new ApiError(0, 'Cannot reach the NestAI backend. Start it with `uvicorn app.main:app` in backend/.');
  } finally {
    window.clearTimeout(timer);
  }
}

export async function checkBackendHealth(): Promise<{ ok: boolean; mapbox: boolean }> {
  try {
    const h = await api<{ status: string; mapbox: boolean }>('/health');
    return { ok: h.status === 'ok', mapbox: h.mapbox };
  } catch {
    return { ok: false, mapbox: false };
  }
}
