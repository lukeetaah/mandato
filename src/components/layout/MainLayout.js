import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Header } from './Header';
import { Sidebar } from './Sidebar';
export const MainLayout = ({ children }) => {
    return (_jsxs("div", { className: "min-h-screen bg-[#0a1628] text-slate-100 flex flex-col font-sans", children: [_jsx(Header, {}), _jsxs("div", { className: "flex-1 flex overflow-hidden", children: [_jsx(Sidebar, {}), _jsx("main", { className: "flex-1 p-6 overflow-y-auto", children: children })] })] }));
};
