import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { motion } from 'framer-motion';
import { useGameStore } from '@stores/game-store';
import { Button } from '@components/ui/Button';
export const MainMenu = ({ onStartNew, onContinue }) => {
    const hasSave = useGameStore((s) => s.hasSaveAvailable);
    const loadExistingGame = useGameStore((s) => s.loadExistingGame);
    const handleContinue = () => {
        if (loadExistingGame()) {
            onContinue();
        }
    };
    return (_jsxs("div", { className: "min-h-screen bg-[#0a1628] flex flex-col justify-center items-center p-6 relative overflow-hidden", children: [_jsx("div", { className: "absolute w-[600px] h-[600px] bg-sky-500/10 rounded-full blur-[140px] pointer-events-none" }), _jsx("div", { className: "absolute w-[400px] h-[400px] bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" }), _jsxs(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.8 }, className: "text-center z-10 max-w-xl", children: [_jsx("h1", { className: "text-6xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-amber-300 to-sky-200 mb-4", children: "MI MANDATO" }), _jsx("p", { className: "text-lg text-slate-300 font-light mb-2", children: "Un simulador sobre sobrevivir al poder." }), _jsx("p", { className: "text-xs text-slate-400 italic mb-10", children: "\u00ABEl sistema siempre intenta doblarte. La pregunta es qu\u00E9 costo est\u00E1s dispuesto a pagar.\u00BB" }), _jsxs("div", { className: "flex flex-col gap-4 max-w-xs mx-auto", children: [hasSave && (_jsx(Button, { variant: "gold", size: "lg", onClick: handleContinue, children: "Continuar Mandato \u2794" })), _jsx(Button, { variant: "primary", size: "lg", onClick: onStartNew, children: "Nueva Carrera Pol\u00EDtica" })] })] })] }));
};
