import { Component, type ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackLabel?: string;
}

interface State {
  hasError: boolean;
}

/**
 * Isolates a subtree (e.g. the Leaflet map) so a runtime error there
 * shows a fallback instead of white-screening the entire app.
 */
export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(err: unknown) {
    // Visible in devtools console for diagnosis; never throws.
    console.error('[NestAI] section failed to render:', err);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          role="alert"
          className="flex flex-col items-center justify-center gap-2 rounded-[20px] border border-slate-200 bg-slate-50 px-6 py-14 text-center"
        >
          <AlertTriangle className="h-7 w-7 text-amber-500" />
          <p className="font-display text-[16px] font-extrabold text-navy-900">
            {this.props.fallbackLabel ?? 'This section could not be displayed.'}
          </p>
          <p className="max-w-sm text-[13px] text-slate-500">
            The rest of the site still works — try reloading the page.
          </p>
          <button
            type="button"
            onClick={() => this.setState({ hasError: false })}
            className="mt-2 h-10 rounded-full bg-navy-900 px-5 text-[13px] font-semibold text-white hover:bg-emerald-600"
          >
            Retry
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
