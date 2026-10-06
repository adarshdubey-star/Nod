import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Nod Error Boundary caught:', error, info);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="flex h-full w-full flex-col items-center justify-center gap-4 bg-nod-bg p-8 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-nod-amber/20">
            <span className="text-2xl">⚠</span>
          </div>
          <h2 className="text-xl font-semibold text-nod-text">
            Something went wrong
          </h2>
          <p className="max-w-md text-sm text-nod-muted">
            {this.state.error?.message || 'An unexpected error occurred.'}
          </p>
          <button
            onClick={() => {
              this.setState({ hasError: false, error: null });
            }}
            className="mt-2 rounded-lg bg-nod-orb-start px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-nod-orb-end"
          >
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
