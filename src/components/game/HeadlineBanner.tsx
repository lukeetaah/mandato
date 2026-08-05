import React from 'react';
import type { HeadlineItem } from '@engine/types';
import { useUIStore } from '@stores/ui-store';

export interface HeadlineBannerProps {
  headlines: HeadlineItem[];
}

export const HeadlineBanner: React.FC<HeadlineBannerProps> = ({ headlines }) => {
  const setActiveTab = useUIStore((s) => s.setActiveTab);

  if (headlines.length === 0) return null;

  const openPress = () => setActiveTab('prensa');
  const tickerItems = [...headlines, ...headlines];

  return (
    <div className="w-full border-y border-slate-800/80 bg-slate-950/70 overflow-hidden" aria-label="Titulares de prensa">
      <div className="mx-auto max-w-[1600px] flex items-center h-8">
        <span className="h-full px-3 flex items-center bg-amber-400 text-slate-950 text-[9px] font-black uppercase tracking-[0.16em] shrink-0">
          Titulares
        </span>
        <div className="relative min-w-0 flex-1 overflow-hidden h-full">
          <div className="headline-marquee-track absolute left-0 top-0 h-full flex items-center gap-12 whitespace-nowrap px-8">
            {tickerItems.map((headline, index) => (
              <button
                type="button"
                key={`${headline.id}-${index}`}
                onClick={openPress}
                className="text-[11px] text-slate-300 hover:text-amber-200 transition-colors cursor-pointer"
                title="Abrir Prensa y redes"
              >
                <span className="text-amber-400 mr-2">◆</span>
                <span className="text-slate-500 mr-1">{headline.outletName}:</span>
                {headline.title}
              </button>
            ))}
          </div>
        </div>
        <button
          type="button"
          onClick={openPress}
          className="hidden sm:block px-3 text-[9px] font-bold uppercase tracking-wider text-slate-500 hover:text-sky-300 transition-colors cursor-pointer shrink-0"
        >
          Ver prensa →
        </button>
      </div>
    </div>
  );
};
