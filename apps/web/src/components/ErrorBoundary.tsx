import { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertTriangle } from "lucide-react";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallbackLabel?: string;
}

interface ErrorBoundaryState {
  error: Error | null;
}

/**
 * Catches render-time errors anywhere below it in the tree and shows a recoverable
 * fallback instead of a blank white screen. Scoped per-page in AppShell so a crash in,
 * say, the Museum page doesn't take down the Dig Site.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(
      `[ErrorBoundary${this.props.fallbackLabel ? `:${this.props.fallbackLabel}` : ""}]`,
      error,
      info.componentStack,
    );
  }

  private reset = () => this.setState({ error: null });

  render() {
    if (this.state.error) {
      return (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center">
          <AlertTriangle size={32} className="text-gold-400" />
          <p className="text-sm font-semibold text-sand-100">
            {this.props.fallbackLabel ? `${this.props.fallbackLabel} hit a snag.` : "Something went wrong."}
          </p>
          <p className="max-w-sm text-xs text-sand-500">
            This section failed to render, but the rest of Sediment is unaffected. Try again, or switch to another page
            from the sidebar.
          </p>
          <button
            onClick={this.reset}
            className="rounded-lg border border-gold-500/50 bg-gold-500/10 px-4 py-2 text-xs font-semibold text-gold-300 hover:bg-gold-500/20"
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
