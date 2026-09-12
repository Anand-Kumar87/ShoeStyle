import React, { Component, ErrorInfo, ReactNode } from 'react';
import Link from 'next/link';
import { AlertTriangle, RefreshCw, Home, ShieldAlert } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorId: string | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorId: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    const errorId = `err_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    return { hasError: true, error, errorId };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const errorId = this.state.errorId || `err_${Date.now()}`;

    console.error('[CLIENT ERROR BOUNDARY CAUGHT]', error, errorInfo);

    // Transmit to Centralized Observability Endpoint
    if (typeof window !== 'undefined') {
      const payload = {
        id: errorId,
        message: error.message || 'React rendering exception',
        stack: error.stack || null,
        source: 'client',
        severity: 'fatal',
        url: window.location.href,
        route: window.location.pathname,
        metadata: {
          componentStack: errorInfo.componentStack,
          screenResolution: `${window.innerWidth}x${window.innerHeight}`,
          online: navigator.onLine,
        },
      };

      try {
        const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
        if (navigator.sendBeacon) {
          navigator.sendBeacon('/api/telemetry/errors', blob);
        } else {
          fetch('/api/telemetry/errors', {
            method: 'POST',
            body: JSON.stringify(payload),
            headers: { 'Content-Type': 'application/json' },
            keepalive: true,
          }).catch(() => {});
        }
      } catch (e) {
        // Prevent telemetry delivery failure from causing secondary crash
      }
    }
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorId: null });
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 sm:px-6 py-12">
          <div className="max-w-md w-full bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200/80 text-center">
            {/* Warning Icon Badge */}
            <div className="w-16 h-16 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-sm border border-red-100">
              <ShieldAlert size={32} className="stroke-[2.2]" />
            </div>

            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mb-2">
              Something went wrong
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mb-6 leading-relaxed">
              We encountered an unexpected display issue. Our automated observability system has logged this incident.
            </p>

            {this.state.errorId && (
              <div className="bg-slate-50 border border-slate-200/60 rounded-xl px-3 py-2 mb-6 text-left flex items-center justify-between text-[11px] text-slate-500">
                <span className="font-bold">Incident Reference:</span>
                <code className="font-mono bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-800 font-bold">
                  {this.state.errorId}
                </code>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={this.handleReset}
                className="flex-1 inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-black text-white font-black text-xs uppercase tracking-wider py-3.5 px-4 rounded-xl shadow-md transition-all active:scale-95 cursor-pointer"
              >
                <RefreshCw size={14} /> Reload Page
              </button>

              <Link
                href="/"
                className="flex-1 inline-flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-xs uppercase tracking-wider py-3.5 px-4 rounded-xl transition-all active:scale-95 cursor-pointer"
              >
                <Home size={14} /> Return Home
              </Link>
            </div>

            {/* Development-only Expandable Debug Info */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-6 text-left bg-red-50/50 p-3 rounded-xl border border-red-100 text-[11px] text-red-900">
                <summary className="font-bold cursor-pointer text-red-700 select-none">
                  Developer Stack Trace
                </summary>
                <pre className="mt-2 overflow-x-auto whitespace-pre-wrap font-mono p-2 bg-white rounded border border-red-200 text-[10px] text-red-800">
                  {this.state.error.stack || this.state.error.message}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
