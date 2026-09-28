import { ArrowRight, ShieldCheck, Sparkles, Star } from 'lucide-react';
import type { Persona } from '../../types/property';
import RecommendationButton from '../common/RecommendationButton';
import PersonaSelector from '../persona/PersonaSelector';
import SearchBar from '../search/SearchBar';
import HeroVisual from './HeroVisual';

interface Props {
  persona: Persona;
  onPersona: (p: Persona) => void;
  search: string;
  onSearch: (v: string) => void;
  onSearchSubmit: () => void;
  loading: boolean;
  onRecommend: () => void;
}

export default function Hero({ persona, onPersona, search, onSearch, onSearchSubmit, loading, onRecommend }: Props) {
  return (
    <section id="home" className="relative overflow-hidden bg-gradient-to-b from-[#0B1626] via-[#0F1E2E] to-[#14304a] pt-16 md:pt-[72px]">
      {/* subtle texture */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.15]"
        style={{
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.5) 1px, transparent 1px)',
          backgroundSize: '26px 26px',
        }}
      />
      <div aria-hidden className="pointer-events-none absolute -right-40 -top-40 h-[480px] w-[480px] rounded-full bg-emerald-500/20 blur-[120px]" />
      <div aria-hidden className="pointer-events-none absolute -left-40 bottom-0 h-[380px] w-[380px] rounded-full bg-teal-400/10 blur-[110px]" />

      <div className="relative mx-auto grid max-w-7xl gap-12 px-4 pb-16 pt-10 sm:px-6 md:pt-16 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-10 lg:px-8 lg:pb-20">
        {/* Left */}
        <div className="text-white">
          <span className="animate-fade-up inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3.5 py-1.5 text-[12px] font-semibold backdrop-blur">
            <Sparkles className="h-3.5 w-3.5 text-emerald-300" />
            AI-powered housing discovery
            <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[11px] text-emerald-200">New</span>
          </span>

          <h1 className="animate-fade-up stagger-1 font-display mt-5 text-[36px] font-extrabold leading-[1.06] tracking-tight sm:text-[48px] lg:text-[56px]">
            Find a home that fits your <span className="text-emerald-400">life</span>, not just your budget.
          </h1>
          <p className="animate-fade-up stagger-2 mt-4 max-w-xl text-[15px] leading-relaxed text-slate-300 sm:text-[17px]">
            Our AI analyzes your lifestyle, preferences, budget, and location to recommend homes that are genuinely suited to you.
          </p>

          <div className="animate-fade-up stagger-3 mt-6 flex flex-wrap items-center gap-3">
            <RecommendationButton loading={loading} onClick={onRecommend} />
            <a
              href="#explore"
              className="inline-flex h-[52px] items-center gap-2 rounded-2xl border border-white/20 bg-white/5 px-6 text-[15px] font-semibold text-white backdrop-blur transition hover:bg-white/15"
            >
              Explore homes <ArrowRight className="h-4 w-4" />
            </a>
          </div>

          <div className="animate-fade-up stagger-3 mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-[13px] text-slate-300">
            <span className="flex items-center gap-1.5"><ShieldCheck className="h-4 w-4 text-emerald-300" /> Verified listings</span>
            <span className="flex items-center gap-1.5"><Star className="h-4 w-4 fill-amber-400 text-amber-400" /> 4.8 rated by 12k seekers</span>
            <span className="hidden sm:inline text-slate-500">|</span>
            <span className="text-slate-400">No brokerage on select homes</span>
          </div>

          {/* Persona + search card */}
          <div className="animate-fade-up stagger-4 mt-8 rounded-[20px] bg-white p-4 sm:p-5 text-slate-900 shadow-2xl">
            <PersonaSelector value={persona} onChange={onPersona} />
            <div className="mt-4">
              <SearchBar value={search} onChange={onSearch} onSubmit={onSearchSubmit} />
            </div>
          </div>
        </div>

        {/* Right */}
        <div className="animate-fade-up stagger-2 lg:pl-4">
          <HeroVisual />
        </div>
      </div>

      {/* How it works strip (inside hero, keeps global order intact) */}
      <div id="how-it-works" className="relative border-t border-white/10 bg-white/[0.04] backdrop-blur">
        <div className="mx-auto grid max-w-7xl gap-3 px-4 py-6 sm:px-6 md:grid-cols-4 lg:px-8">
          {[
            ['01', 'Select persona', 'Tell us how you live'],
            ['02', 'Set preferences', 'Budget, location, amenities'],
            ['03', 'AI analyzes', 'Matching + ranking in seconds'],
            ['04', 'Explore ranked homes', 'Map + explainable listings'],
          ].map(([n, t, d]) => (
            <div key={n} className="flex items-center gap-3 rounded-2xl px-3 py-2">
              <span className="font-display text-[22px] font-extrabold text-emerald-400">{n}</span>
              <span>
                <span className="block text-[13px] font-bold text-white">{t}</span>
                <span className="block text-[12px] text-slate-400">{d}</span>
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
