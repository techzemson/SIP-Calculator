import React from 'react';
import { HelpCircle, ChevronDown } from 'lucide-react';

interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  tooltip?: string;
  onChange: (val: number) => void;
}

export const SliderControl: React.FC<SliderProps> = ({ 
  label, value, min, max, step = 1, unit = '', tooltip, onChange 
}) => {
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = Number(e.target.value);
    if (isNaN(val)) val = min;
    onChange(val);
  };

  const handleBlur = () => {
    if (value < min) onChange(min);
    if (value > max) onChange(max);
  };

  return (
    <div className="mb-6 bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 transition-all hover:shadow-md">
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-2">
          <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">{label}</label>
          {tooltip && (
            <div className="group relative">
               <HelpCircle size={14} className="text-slate-400 cursor-help" />
               <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:block w-48 p-2 bg-slate-900 text-white text-xs rounded z-10 shadow-lg">
                 {tooltip}
                 <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900"></div>
               </div>
            </div>
          )}
        </div>
        <div className="flex items-center bg-slate-100 dark:bg-slate-700 rounded-lg px-2 py-1 border border-transparent focus-within:border-primary-500">
            <span className="text-slate-500 font-medium text-xs mr-1">{unit}</span>
            <input
                type="number"
                value={value}
                onChange={handleInputChange}
                onBlur={handleBlur}
                className="w-24 bg-transparent text-right font-bold text-primary-600 outline-none text-sm dark:text-primary-400"
            />
        </div>
      </div>
      
      <div className="relative h-6 flex items-center">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full h-2 bg-slate-200 dark:bg-slate-600 rounded-lg appearance-none cursor-pointer accent-primary-600"
        />
      </div>
      <div className="flex justify-between text-xs text-slate-400 mt-1 font-medium">
        <span>{unit} {min.toLocaleString()}</span>
        <span>{unit} {max.toLocaleString()}</span>
      </div>
    </div>
  );
};

export const Toggle: React.FC<{ label: string; checked: boolean; onChange: (v: boolean) => void }> = ({ label, checked, onChange }) => (
    <div className="flex items-center justify-between py-2">
        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{label}</span>
        <button 
            onClick={() => onChange(!checked)}
            className={`w-11 h-6 flex items-center rounded-full p-1 duration-300 ease-in-out ${checked ? 'bg-primary-600' : 'bg-slate-300 dark:bg-slate-600'}`}
        >
            <div className={`bg-white w-4 h-4 rounded-full shadow-md transform duration-300 ease-in-out ${checked ? 'translate-x-5' : ''}`}></div>
        </button>
    </div>
);

interface SelectProps {
    label?: string;
    value: string;
    options: { value: string; label: string }[];
    onChange: (val: string) => void;
}

export const SelectControl: React.FC<SelectProps> = ({ label, value, options, onChange }) => (
    <div className="flex items-center gap-2">
        {label && <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">{label}</label>}
        <div className="relative group">
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="appearance-none bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border-none rounded-lg py-1.5 pl-3 pr-8 text-sm font-bold text-slate-700 dark:text-slate-200 cursor-pointer focus:ring-2 focus:ring-primary-500 transition-colors"
            >
                {options.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                <ChevronDown size={14} />
            </div>
        </div>
    </div>
);