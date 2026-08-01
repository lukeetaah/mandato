import React from 'react';

export interface SliderProps {
  label: string;
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange: (val: number) => void;
  description?: string;
}

export const Slider: React.FC<SliderProps> = ({
  label,
  value,
  min = 0,
  max = 100,
  step = 1,
  onChange,
  description,
}) => {
  return (
    <div className="w-full">
      <div className="flex justify-between items-center text-sm font-medium mb-1">
        <span className="text-slate-200">{label}</span>
        <span className="text-sky-400 font-bold">{value}</span>
      </div>
      {description && <p className="text-xs text-slate-400 mb-2">{description}</p>}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-sky-400 bg-slate-800 h-2 rounded-lg cursor-pointer"
      />
    </div>
  );
};
