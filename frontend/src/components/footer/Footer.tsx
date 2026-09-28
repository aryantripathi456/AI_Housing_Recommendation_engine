import { Globe, Home, Mail, MessageCircle, Share2, Sparkles } from 'lucide-react';

export default function Footer() {
  return (
    <footer id="about" className="bg-navy-950 text-slate-300">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-[1.3fr_1fr_1fr_1fr]">
          <div>
            <a href="#home" className="flex items-center gap-2.5" aria-label="NestAI home">
              <span className="relative grid h-10 w-10 place-items-center rounded-2xl bg-white text-navy-900">
                <Home className="h-5 w-5" strokeWidth={2.2} />
                <span className="absolute -right-1 -top-1 grid h-5 w-5 place-items-center rounded-full bg-emerald-500">
                  <Sparkles className="h-3 w-3 text-white" />
                </span>
              </span>
              <span className="font-display text-[19px] font-extrabold text-white">NestAI</span>
            </a>
            <p className="mt-4 max-w-xs text-[14px] leading-relaxed text-slate-400">
              AI-powered housing discovery built around the way you live.
            </p>
            <div className="mt-5 flex gap-2">
              {[
                { icon: Globe, label: 'Website' },
                { icon: MessageCircle, label: 'Community' },
                { icon: Mail, label: 'Email' },
                { icon: Share2, label: 'Share' },
              ].map(({ icon: Icon, label }) => (
                <a
                  key={label} href="#home" aria-label={label}
                  className="grid h-10 w-10 place-items-center rounded-full bg-white/10 text-slate-300 transition hover:bg-emerald-600 hover:text-white"
                >
                  <Icon className="h-[18px] w-[18px]" />
                </a>
              ))}
            </div>
          </div>

          {[
            { h: 'Product', links: ['Explore', 'AI Recommendations', 'Saved Homes', 'Map'] },
            { h: 'Company', links: ['About', 'Contact', 'Careers', 'Blog'] },
            { h: 'Support', links: ['Help Center', 'Privacy', 'Terms', 'Contact Support'] },
          ].map((col) => (
            <nav key={col.h} aria-label={col.h}>
              <p className="text-[13px] font-extrabold uppercase tracking-wider text-white">{col.h}</p>
              <ul className="mt-4 space-y-2.5 text-[14px]">
                {col.links.map((l) => (
                  <li key={l}>
                    <a href="#home" className="text-slate-400 transition hover:text-emerald-300">{l}</a>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 text-[13px] text-slate-500 sm:flex-row">
          <p>© 2026 NestAI. All rights reserved.</p>
          <p>Made for seekers in Mumbai · Data is illustrative</p>
        </div>
      </div>
    </footer>
  );
}
