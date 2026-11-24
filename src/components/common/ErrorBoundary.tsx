import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface ErrorBoundaryState {
  hasError: boolean;
  message: string;
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    let readable = error.message || 'An unexpected application error occurred.';
    try {
      const parsed = JSON.parse(error.message);
      if (parsed && parsed.error) {
        readable = `${parsed.error} (Operation: ${parsed.operationType || 'unknown'})`;
      }
    } catch {
      // Keep original message
    }
    return { hasError: true, message: readable };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#111111] text-white flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-[#1B1B1B] border border-white/10 rounded-lg p-8 text-center">
            <AlertTriangle className="h-10 w-10 text-[#E51C2A] mx-auto mb-4" />
            <h1 className="font-display text-2xl font-bold mb-2">Something Went Wrong</h1>
            <p className="text-sm text-[#858585] mb-6">{this.state.message}</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="px-5 py-2.5 bg-[#E51C2A] hover:bg-[#c81622] text-white text-sm font-semibold rounded transition-colors"
            >
              Reload Application
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
