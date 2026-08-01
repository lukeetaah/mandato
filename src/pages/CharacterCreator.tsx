import React from 'react';
import { CharacterEditor } from '@components/character/CharacterEditor';

export interface CharacterCreatorProps {
  onComplete: () => void;
}

export const CharacterCreator: React.FC<CharacterCreatorProps> = ({ onComplete }) => {
  return (
    <div className="min-h-screen bg-[#0a1628] py-8 px-4">
      <CharacterEditor onComplete={onComplete} />
    </div>
  );
};
