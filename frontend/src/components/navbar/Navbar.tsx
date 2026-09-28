import { useEffect, useState } from 'react';
import { Bell, Heart, Home, Menu, Sparkles, X } from 'lucide-react';

interface NavbarProps {
  savedCount: number;
  onSavedClick: () => void;
  onFindHome: () => void;
}

const LINKS = [
  { label: 'Home', href: '#home' },
  { label: 'Explore', href: '#explore' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'About', href: '#about' },
];

export default function Navbar({ savedCount, onSavedClick, onFindHome }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [showNotif, setShowNotif] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/85 backdrop-blur-xl border-b border-slate-200/80 shadow-[0_8px_30px_rgba(11,22,38,0.08)]'
          : 'bg-white/40 backdrop-blur-sm border-b border-transparent'
      }`}
    >
      <nav
        aria-label="Primary"
        className="mx-auto flex h-16 md:h-[72px] max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8"
      >
        {/* Brand */}
        <a href="#home" className="flex items-center gap-2.5 shrink-0" aria-label="NestAI home">
          <span className="relative grid h-10 w-10 place-items-center rounded-2xl bg-navy-900 text-white shadow-lg">
            <Home className="h-5 w-5" strokeWidth={2.2} />
            <span className="absolute -right-1 -top-1 grid h-5 w-5 place-items-center rounded-full bg-emerald-500 shadow">
              <Sparkles className="h-3 w-3 text-white" />
            </span>
          </span>
          <span className="leading-tight">
            <span className="font-display block text-[18px] font-extrabold tracking-tight text-navy-900">
              NestAI
            </span>
            <span className="block text-[11px] font-medium tracking-wide text-slate-500">
              Find home, intelligently
            </span>
          </span>
        </a>

        {/* Center links */}
        <ul className="hidden lg:flex items-center gap-1 text-[14px] font-medium text-slate-600">
          {LINKS.map((l) => (
            <li key={l.label}>
              <a
                href={l.href}
                className="rounded-full px-4 py-2 transition hover:bg-slate-100 hover:text-navy-900"
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        {/* Right */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={onSavedClick}
            aria-label={`Saved properties, ${savedCount} saved`}
            className="relative grid h-10 w-10 place-items-center rounded-full text-slate-600 transition hover:bg-slate-100 hover:text-navy-900"
          >
            <Heart className="h-5 w-5" />
            {savedCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-emerald-600 px-1 text-[11px] font-bold text-white">
                {savedCount}
              </span>
            )}
          </button>

          <div className="relative">
            <button
              type="button"
              onClick={() => setShowNotif((v) => !v)}
              aria-label="Notifications"
              aria-expanded={showNotif}
              className="grid h-10 w-10 place-items-center rounded-full text-slate-600 transition hover:bg-slate-100 hover:text-navy-900"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-white" />
            </button>
            {showNotif && (
              <div className="absolute right-0 top-12 w-72 rounded-2xl border border-slate-200 bg-white p-3 shadow-2xl animate-fade-up">
                <p className="px-2 pt-1 text-[13px] font-bold text-navy-900">Notifications</p>
                <div className="mt-2 space-y-1 text-[13px]">
                  <div className="rounded-xl bg-emerald-50 p-2.5 text-slate-700">
                    <span className="font-semibold text-navy-900">3 new matches</span> for Professional in Bandra
                  </div>
                  <div className="rounded-xl p-2.5 text-slate-600 hover:bg-slate-50">
                    Price drop: Powai Lakeview Studio now ₹22,000
                  </div>
                </div>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={onFindHome}
            className="ml-1 hidden sm:inline-flex h-11 items-center gap-2 rounded-full bg-navy-900 px-5 text-[14px] font-semibold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-navy-800 hover:shadow-xl active:translate-y-0"
          >
            <Sparkles className="h-4 w-4 text-emerald-300" />
            Find My Home
          </button>

          <button
            type="button"
            aria-label="User profile"
            className="hidden sm:grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-[14px] font-bold text-white shadow"
          >
            A
          </button>

          <button
            type="button"
            className="grid h-10 w-10 place-items-center rounded-full text-navy-900 hover:bg-slate-100 lg:hidden"
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      <div
        className={`overflow-hidden transition-[max-height,opacity] duration-300 lg:hidden ${
          open ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="border-t border-slate-100 bg-white/95 backdrop-blur-xl px-4 py-3">
          <ul className="space-y-1">
            {LINKS.map((l) => (
              <li key={l.label}>
                <a
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="block rounded-xl px-3 py-2.5 text-[15px] font-medium text-slate-700 hover:bg-slate-100"
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              onFindHome();
            }}
            className="mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-navy-900 text-[15px] font-semibold text-white sm:hidden"
          >
            <Sparkles className="h-4 w-4 text-emerald-300" /> Find My Home
          </button>
        </div>
      </div>
    </header>
  );
}
