import React from 'react';
import { CharacterEditor } from '@components/character/CharacterEditor';
import { useUIStore } from '@stores/ui-store';

export interface CharacterCreatorProps {
  onComplete: () => void;
}

export const CharacterCreator: React.FC<CharacterCreatorProps> = ({ onComplete }) => {
  const isLight = useUIStore((s) => s.theme === 'light');
  return (
    <div className={`min-h-screen py-8 px-4 transition-colors ${isLight ? 'bg-[#F5EFEB]' : 'bg-[#0a1628]'}`}>
      <CharacterEditor onComplete={onComplete} />
    </div>
  );
};

