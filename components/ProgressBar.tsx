
import React from 'react';

interface ProgressBarProps {
  value: number;
  label: string;
  colorClass?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ value, label, colorClass = "bg-indigo-500" }) => {
  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-1 text-xs font-medium text-slate-400 uppercase tracking-wider">
        <span>{label}</span>
        <span className="text-slate-100">{value}%</span>
      </div>
      <div className="w-full bg-slate-800 rounded-full h-2">
        <div 
          className={`h-2 rounded-full transition-all duration-1000 ${colorClass}`} 
          style={{ width: `${value}%` }}
        ></div>
      </div>
    </div>
  );
};
