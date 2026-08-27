import React from 'react';
import type { Character } from '@engine/types';

type AvatarMood = 'initial' | 'worn' | 'critical' | 'successful';

interface PresidentAvatarProps {
  character: Pick<Character, 'name' | 'surname' | 'avatarId' | 'health' | 'stress' | 'popularity'>;
  className?: string;
  showCaption?: boolean;
}

const AVATAR_PROFILES: Record<string, {
  skin: string;
  hair: string;
  hairShape: string;
  suit: string;
  tie: string;
  face: 'oval' | 'square' | 'soft' | 'broad';
  glasses?: boolean;
}> = {
  morales: { skin: '#d7a373', hair: '#5b3324', hairShape: 'M42 51c7-18 22-27 40-22 10 3 17 11 19 23-16-8-40-9-59-1Z', suit: '#1f3f4d', tie: '#6ee7b7', face: 'oval', glasses: true },
  alvear: { skin: '#f0c39a', hair: '#d9b35f', hairShape: 'M40 52c5-20 19-31 40-28 15 2 24 13 27 29-18-8-43-9-67-1Z', suit: '#243046', tie: '#f59e0b', face: 'square' },
  santillan: { skin: '#c98962', hair: '#24130f', hairShape: 'M38 57c2-22 14-35 34-35 21 0 33 13 36 35-10-10-18-14-36-14-17 0-25 5-34 14Z', suit: '#172554', tie: '#38bdf8', face: 'soft', glasses: true },
  benitez: { skin: '#9f633f', hair: '#171717', hairShape: 'M37 55c5-19 18-31 36-31 21 0 35 13 38 34-22-8-48-8-74-3Z', suit: '#163225', tie: '#22c55e', face: 'broad' },
  custom: { skin: '#c48a64', hair: '#2f1f1a', hairShape: 'M40 53c7-18 20-28 38-27 16 1 27 12 30 28-19-7-43-7-68-1Z', suit: '#1e293b', tie: '#60a5fa', face: 'oval' },
};

export function getAvatarMood(character: Pick<Character, 'health' | 'stress' | 'popularity'>): AvatarMood {
  if (character.health <= 30 || character.stress >= 86) return 'critical';
  if (character.health <= 55 || character.stress >= 62) return 'worn';
  if (character.popularity >= 62 && character.stress <= 48 && character.health >= 55) return 'successful';
  return 'initial';
}

export function getAvatarMoodLabel(mood: AvatarMood): string {
  if (mood === 'critical') return 'Mandato al límite';
  if (mood === 'worn') return 'Desgaste visible';
  if (mood === 'successful') return 'Autoridad consolidada';
  return 'Inicio del mandato';
}

export const PresidentAvatar: React.FC<PresidentAvatarProps> = ({ character, className = '', showCaption = false }) => {
  const profile = AVATAR_PROFILES[character.avatarId ?? 'custom'] ?? AVATAR_PROFILES.custom!;
  const mood = getAvatarMood(character);
  const underEye = mood === 'critical' ? '#4c1d95' : '#64748b';
  const mouth = mood === 'successful' ? 'M58 83c8 6 20 6 28 0' : mood === 'critical' ? 'M59 86c9-5 18-5 27 0' : 'M58 84c8 2 19 2 28 0';
  const faceRx = profile.face === 'square' ? 18 : profile.face === 'broad' ? 24 : 22;
  const faceRy = profile.face === 'soft' ? 29 : profile.face === 'broad' ? 25 : 28;
  const stainOpacity = mood === 'critical' ? 0.32 : mood === 'worn' ? 0.18 : 0;
  const confidenceGlow = mood === 'successful' ? 0.35 : 0.12;

  return (
    <div className={`relative ${className}`}>
      <svg viewBox="0 0 140 160" role="img" aria-label={`Retrato de ${character.name} ${character.surname}`} className="w-full h-full drop-shadow-xl">
        <defs>
          <radialGradient id={`glow-${character.avatarId ?? 'custom'}`} cx="50%" cy="34%" r="60%">
            <stop offset="0%" stopColor="#bae6fd" stopOpacity={confidenceGlow} />
            <stop offset="100%" stopColor="#020617" stopOpacity="0" />
          </radialGradient>
          <linearGradient id={`suit-${character.avatarId ?? 'custom'}`} x1="0" x2="1" y1="0" y2="1">
            <stop stopColor={profile.suit} />
            <stop offset="100%" stopColor="#020617" />
          </linearGradient>
        </defs>
        <rect width="140" height="160" rx="18" fill="#0f172a" />
        <rect x="8" y="8" width="124" height="144" rx="16" fill={`url(#glow-${character.avatarId ?? 'custom'})`} />
        <path d="M23 148c6-32 23-49 47-49s42 17 48 49H23Z" fill={`url(#suit-${character.avatarId ?? 'custom'})`} />
        <path d="M58 104h24l-12 20-12-20Z" fill="#e2e8f0" />
        <path d="M68 112h6l6 32H62l6-32Z" fill={profile.tie} opacity={mood === 'critical' ? 0.7 : 1} />
        <ellipse cx="70" cy="66" rx={faceRx} ry={faceRy} fill={profile.skin} />
        <path d={profile.hairShape} fill={profile.hair} />
        <path d="M47 62c6-3 12-3 17 0" stroke="#1f2937" strokeWidth="3" strokeLinecap="round" fill="none" />
        <path d="M76 62c6-3 12-3 17 0" stroke="#1f2937" strokeWidth="3" strokeLinecap="round" fill="none" />
        <circle cx="57" cy="70" r="2.4" fill="#111827" />
        <circle cx="84" cy="70" r="2.4" fill="#111827" />
        {(mood === 'worn' || mood === 'critical') && (
          <>
            <path d="M51 76c5 3 10 3 15 0" stroke={underEye} strokeOpacity={mood === 'critical' ? 0.75 : 0.45} strokeWidth="2" strokeLinecap="round" />
            <path d="M77 76c5 3 10 3 15 0" stroke={underEye} strokeOpacity={mood === 'critical' ? 0.75 : 0.45} strokeWidth="2" strokeLinecap="round" />
            <path d="M72 51c5 8 6 17 3 27" stroke="#7f1d1d" strokeOpacity={stainOpacity} strokeWidth="2" strokeLinecap="round" />
          </>
        )}
        {profile.glasses && (
          <path d="M47 69h18m10 0h18M65 69c3-2 7-2 10 0M45 69c0 8 22 8 22 0M73 69c0 8 22 8 22 0" stroke="#0f172a" strokeWidth="2" fill="none" strokeLinecap="round" />
        )}
        <path d={mouth} stroke="#5b2b23" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        {mood === 'critical' && <path d="M101 43l5 13m-73-6l-6 13" stroke="#f97316" strokeWidth="3" strokeLinecap="round" opacity="0.65" />}
        {mood === 'successful' && <path d="M37 119c21 10 45 10 66 0" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" opacity="0.7" />}
      </svg>
      {showCaption && (
        <div className="absolute left-2 right-2 bottom-2 rounded-xl bg-slate-950/75 px-2 py-1 text-center text-[10px] font-bold text-slate-100 border border-white/10">
          {getAvatarMoodLabel(mood)}
        </div>
      )}
    </div>
  );
};
