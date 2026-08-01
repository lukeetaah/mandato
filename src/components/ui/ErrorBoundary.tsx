import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[MI MANDATO] Error capturado por ErrorBoundary:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0a1628] text-slate-100 flex flex-col justify-center items-center p-6 text-center">
          <div className="glass-panel p-8 rounded-2xl max-w-md border border-rose-500/30">
            <span className="text-4xl block mb-3">🚨</span>
            <h2 className="text-xl font-bold text-rose-300 mb-2">Error de Despacho</h2>
            <p className="text-xs text-slate-400 mb-6 leading-relaxed">
              Ocurrió un inconveniente inesperado en la simulación. Podés reiniciar la sesión o volver al menú.
            </p>
            <button
              onClick={() => {
                window.localStorage.removeItem('mi-mandato-v3');
                window.location.reload();
              }}
              className="px-5 py-2.5 bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg hover:bg-amber-300 transition-all cursor-pointer"
            >
              Reiniciar Partida Fria ➔
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
