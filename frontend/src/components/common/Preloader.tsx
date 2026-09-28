interface Props {
  /** false → plays the fade-out transition (parent unmounts after). */
  fading: boolean;
}

/**
 * Branded splash shown for a fixed 3s on site start (see App.tsx timer).
 * Home mounts and fetches underneath, so the splash adds zero real wait.
 */
export default function Preloader({ fading }: Props) {
  return (
    <div
      role="status"
      aria-label="Loading NestAI"
      aria-hidden={fading}
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#0B1626] transition-opacity duration-500 ${
        fading ? 'pointer-events-none opacity-0' : 'opacity-100'
      }`}
    >
      <span className="relative grid h-16 w-16 place-items-center rounded-[20px] bg-white shadow-2xl">
        <svg viewBox="0 0 24 24" className="h-8 w-8 text-[#0F1E2E]" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M3 10.5 12 3l9 7.5" />
          <path d="M5 9.5V21h14V9.5" />
        </svg>
        <span className="absolute -right-1.5 -top-1.5 grid h-6 w-6 place-items-center rounded-full bg-emerald-500 shadow-lg">
          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 text-white" fill="currentColor" aria-hidden>
            <path d="M12 2l2.2 6.6L21 11l-6.8 2.4L12 20l-2.2-6.6L3 11l6.8-2.4L12 2z" />
          </svg>
        </span>
      </span>

      <p className="font-display mt-5 text-[26px] font-extrabold tracking-tight text-white">
        NestAI
      </p>
      <p className="mt-1 text-[13px] font-medium text-slate-400">
        Finding a home that fits your life…
      </p>

      <div
        className="mt-6 h-1 w-44 overflow-hidden rounded-full bg-white/15"
        aria-hidden
      >
        <div className="preloader-bar h-full rounded-full bg-emerald-400" />
      </div>
    </div>
  );
}
