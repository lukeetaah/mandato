import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export const Slider = ({ label, value, min = 0, max = 100, step = 1, onChange, description, }) => {
    return (_jsxs("div", { className: "w-full", children: [_jsxs("div", { className: "flex justify-between items-center text-sm font-medium mb-1", children: [_jsx("span", { className: "text-slate-200", children: label }), _jsx("span", { className: "text-sky-400 font-bold", children: value })] }), description && _jsx("p", { className: "text-xs text-slate-400 mb-2", children: description }), _jsx("input", { type: "range", min: min, max: max, step: step, value: value, onChange: (e) => onChange(Number(e.target.value)), className: "w-full accent-sky-400 bg-slate-800 h-2 rounded-lg cursor-pointer" })] }));
};
