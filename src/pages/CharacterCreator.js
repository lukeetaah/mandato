import { jsx as _jsx } from "react/jsx-runtime";
import { CharacterEditor } from '@components/character/CharacterEditor';
export const CharacterCreator = ({ onComplete }) => {
    return (_jsx("div", { className: "min-h-screen bg-[#0a1628] py-8 px-4", children: _jsx(CharacterEditor, { onComplete: onComplete }) }));
};
