import { Component, type ErrorInfo, type ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  error: Error | null;
}

export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('App crashed:', error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-3xl border-2 border-rose-200 bg-white p-8 text-center shadow-lg">
            <h1 className="text-xl font-extrabold text-slate-800">เกิดข้อผิดพลาดในการแสดงผล</h1>
            <p className="mt-2 text-sm text-slate-500 font-medium">
              หน้าเว็บทำงานผิดพลาด กรุณาลองโหลดใหม่อีกครั้ง
            </p>
            <pre className="mt-4 max-h-40 overflow-auto rounded-xl bg-rose-50 p-3 text-left text-xs text-rose-700 whitespace-pre-wrap">
              {this.state.error.message}
            </pre>
            <button
              onClick={() => window.location.reload()}
              className="mt-6 w-full rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 transition-colors"
            >
              โหลดหน้าใหม่
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
