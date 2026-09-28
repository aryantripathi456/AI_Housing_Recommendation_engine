import { Bath, BedDouble, MapPin, Ruler, Star } from 'lucide-react';
import { formatINR } from '../../utils/recommendation';

export default function HeroVisual() {
  return (
    <div className="relative mx-auto w-full max-w-[520px]" aria-hidden>
      {/* Main property visual */}
      <div className="animate-fade-up overflow-hidden rounded-[24px] border border-white/40 bg-white shadow-[0_32px_80px_rgba(11,22,38,0.28)]">
        <div className="relative">
          <img
            src="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=900&q=80&auto=format&fit=crop"
            alt=""
            className="h-[300px] sm:h-[340px] w-full object-cover"
            loading="eager"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-navy-950/70 via-transparent to-transparent" />
          <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-[12px] font-bold text-navy-900 shadow">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse-dot" />
            Recommended for You
          </span>
          <span className="absolute right-4 top-4 rounded-full bg-emerald-500 px-3 py-1.5 text-[12px] font-extrabold text-white shadow-lg">
            98% Match
          </span>
          <div className="absolute bottom-4 left-4 right-4 text-white">
            <p className="font-display text-[20px] font-extrabold leading-tight">Urban Heights Residence</p>
            <p className="mt-1 flex items-center gap-1.5 text-[13px] text-white/85">
              <MapPin className="h-3.5 w-3.5" /> Bandra West, Mumbai · 2.4 km from work
            </p>
            <div className="mt-2.5 flex items-center gap-4 text-[12px] font-medium text-white/90">
              <span className="flex items-center gap-1"><BedDouble className="h-4 w-4" /> 2 Beds</span>
              <span className="flex items-center gap-1"><Bath className="h-4 w-4" /> 2 Baths</span>
              <span className="flex items-center gap-1"><Ruler className="h-4 w-4" /> 920 sq.ft</span>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between bg-white px-5 py-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Monthly rent</p>
            <p className="font-display text-[22px] font-extrabold text-navy-900">{formatINR(28000)}<span className="text-[13px] font-medium text-slate-400">/mo</span></p>
          </div>
          <div className="flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1.5 text-[13px] font-bold text-amber-600">
            <Star className="h-4 w-4 fill-amber-400 text-amber-400" /> 4.8
          </div>
        </div>
      </div>

      {/* Floating cards */}
      <div className="animate-float-slow absolute -left-3 sm:-left-8 top-16 rounded-2xl border border-slate-100 bg-white/95 p-3 pr-4 shadow-xl backdrop-blur">
        <p className="text-[22px] font-extrabold text-emerald-600 font-display">98%</p>
        <p className="text-[11px] font-bold text-navy-900">Match</p>
        <p className="text-[11px] text-slate-500">Perfect for your lifestyle</p>
      </div>

      <div className="animate-float-slow absolute -right-2 sm:-right-6 bottom-24 rounded-2xl border border-slate-100 bg-white/95 px-4 py-3 shadow-xl backdrop-blur" style={{ animationDelay: '1.2s' }}>
        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Distance</p>
        <p className="text-[15px] font-extrabold text-navy-900">2.4 km <span className="font-medium text-slate-400">from work</span></p>
        <div className="mt-1.5 h-1.5 w-32 overflow-hidden rounded-full bg-slate-100">
          <div className="h-full w-[30%] rounded-full bg-emerald-500" />
        </div>
      </div>

      <div className="animate-float-slow absolute -bottom-5 left-8 rounded-2xl bg-navy-900 px-4 py-3 text-white shadow-2xl" style={{ animationDelay: '2s' }}>
        <p className="text-[11px] font-medium text-white/60">AI insight</p>
        <p className="text-[13px] font-semibold">10 min commute · Safe · In budget</p>
      </div>
    </div>
  );
}
