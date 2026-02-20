
import React from 'react';
import { SiteMetrics } from '../types';
import { ProgressBar } from './ProgressBar';

interface MetricCardProps {
  metrics: SiteMetrics;
  isMainBrand?: boolean;
}

export const MetricCard: React.FC<MetricCardProps> = ({ metrics, isMainBrand }) => {
  return (
    <div className={`p-6 rounded-xl border ${isMainBrand ? 'border-indigo-500/50 bg-indigo-500/5' : 'border-slate-800 bg-slate-900/50'} backdrop-blur-sm transition-all hover:border-slate-700`}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-slate-100">{metrics.name}</h3>
          <p className="text-xs text-slate-500 truncate max-w-[200px]">{metrics.url}</p>
        </div>
        {isMainBrand && (
          <span className="px-2 py-1 text-[10px] font-bold bg-indigo-500 text-white rounded uppercase tracking-tighter">Target</span>
        )}
      </div>

      <div className="space-y-4">
        <ProgressBar value={metrics.marketAlignment} label="Market Alignment" colorClass="bg-emerald-500" />
        <ProgressBar value={metrics.seoAuthority} label="SEO Authority" colorClass="bg-indigo-500" />
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4">
        <div>
          <p className="text-[10px] uppercase text-slate-500 font-bold mb-2">Key Strengths</p>
          <ul className="text-xs space-y-1 text-slate-300">
            {metrics.strengths?.slice(0, 2).map((s, i) => <li key={i}>• {s}</li>)}
          </ul>
        </div>
        <div>
          <p className="text-[10px] uppercase text-slate-500 font-bold mb-2">Vulnerabilities</p>
          <ul className="text-xs space-y-1 text-slate-300">
            {metrics.weaknesses?.slice(0, 2).map((w, i) => <li key={i}>• {w}</li>)}
          </ul>
        </div>
      </div>
    </div>
  );
};
