import { Loader2, Sparkles } from 'lucide-react';

interface Props {
  loading: boolean;
  onClick: () => void;
}

export default function RecommendationButton({ loading, onClick }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className="group inline-flex h-[52px] w-full sm:w-auto items-center justify-center gap-2.5 rounded-2xl bg-emerald-600 px-8 text-[15px] font-bold text-white shadow-[0_16px_40px_rgba(5,150,105,0.35)] transition hover:-translate-y-0.5 hover:bg-emerald-500 hover:shadow-[0_20px_48px_rgba(5,150,105,0.45)] active:translate-y-0 disabled:cursor-wait disabled:opacity-80 disabled:hover:translate-y-0"
    >
      {loading ? (
        <>
          <Loader2 className="h-5 w-5 animate-spin" /> Analyzing...
        </>
      ) : (
        <>
          <Sparkles className="h-5 w-5 transition group-hover:rotate-12" />
          Get AI Recommendations
        </>
      )}
    </button>
  );
}
