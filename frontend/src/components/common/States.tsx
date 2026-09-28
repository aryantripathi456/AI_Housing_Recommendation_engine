import { AlertTriangle, SearchX } from 'lucide-react';

export function LoadingState({ stage }: { stage: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-14 text-center" role="status" aria-live="polite">
      <div className="relative">
        <div className="h-14 w-14 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-600" />
        <span className="absolute inset-0 grid place-items-center text-[18px]">🏠</span>
      </div>
      <p className="mt-4 font-display text-[17px] font-bold text-navy-900">Finding homes that match your lifestyle...</p>
      <p className="mt-1 text-[14px] text-emerald-700 font-medium">{stage}</p>
    </div>
  );
}

export function EmptyState({ onReset }: { onReset: () => void }) {
  return (
    <div className="flex flex-col items-center rounded-[20px] border border-dashed border-slate-300 bg-slate-50 px-6 py-16 text-center">
      <span className="grid h-14 w-14 place-items-center rounded-2xl bg-white shadow">
        <SearchX className="h-7 w-7 text-slate-400" />
      </span>
      <h3 className="font-display mt-4 text-[19px] font-extrabold text-navy-900">We couldn't find homes matching those preferences.</h3>
      <p className="mt-1.5 max-w-md text-[14px] text-slate-500">Try widening your budget, removing an amenity, or choosing a different location.</p>
      <button
        type="button" onClick={onReset}
        className="mt-5 h-11 rounded-full bg-navy-900 px-6 text-[14px] font-semibold text-white hover:bg-emerald-600"
      >
        Reset Filters
      </button>
    </div>
  );
}

export function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center rounded-[20px] border border-rose-200 bg-rose-50 px-6 py-16 text-center" role="alert">
      <AlertTriangle className="h-8 w-8 text-rose-500" />
      <h3 className="font-display mt-3 text-[19px] font-extrabold text-navy-900">Something went wrong while loading properties.</h3>
      <button
        type="button" onClick={onRetry}
        className="mt-5 h-11 rounded-full bg-navy-900 px-6 text-[14px] font-semibold text-white hover:bg-emerald-600"
      >
        Try Again
      </button>
    </div>
  );
}
