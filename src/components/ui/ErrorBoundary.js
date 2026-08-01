import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Component } from 'react';
export class ErrorBoundary extends Component {
    state = {
        hasError: false,
        error: null,
    };
    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }
    componentDidCatch(error, errorInfo) {
        console.error('[MI MANDATO] Error capturado por ErrorBoundary:', error, errorInfo);
    }
    render() {
        if (this.state.hasError) {
            return (_jsx("div", { className: "min-h-screen bg-[#0a1628] text-slate-100 flex flex-col justify-center items-center p-6 text-center", children: _jsxs("div", { className: "glass-panel p-8 rounded-2xl max-w-md border border-rose-500/30", children: [_jsx("span", { className: "text-4xl block mb-3", children: "\uD83D\uDEA8" }), _jsx("h2", { className: "text-xl font-bold text-rose-300 mb-2", children: "Error de Despacho" }), _jsx("p", { className: "text-xs text-slate-400 mb-6 leading-relaxed", children: "Ocurri\u00F3 un inconveniente inesperado en la simulaci\u00F3n. Pod\u00E9s reiniciar la sesi\u00F3n o volver al men\u00FA." }), _jsx("button", { onClick: () => {
                                window.localStorage.removeItem('mi-mandato-v3');
                                window.location.reload();
                            }, className: "px-5 py-2.5 bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg hover:bg-amber-300 transition-all cursor-pointer", children: "Reiniciar Partida Fria \u2794" })] }) }));
        }
        return this.props.children;
    }
}
