import React from 'react';
import { Layers, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { DetectedItem } from '../../types/plastic';

interface MultiItemBreakdownProps {
  items: DetectedItem[];
}

export const MultiItemBreakdown: React.FC<MultiItemBreakdownProps> = ({ items }) => {
  if (!items || items.length === 0) return null;

  return (
    <div className="p-5 rounded-3xl bg-slate-900/70 border border-slate-800 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Multi-Item Pile Decomposition</h3>
            <p className="text-[11px] text-slate-400">
              {items.length} distinct plastic waste items segmented in optical view
            </p>
          </div>
        </div>
        <span className="font-mono text-xs text-teal-400 bg-teal-950/60 px-2.5 py-1 rounded-full border border-teal-500/30 font-bold">
          {items.length} ITEMS DETECTED
        </span>
      </div>

      <div className="divide-y divide-slate-800/80 rounded-2xl bg-slate-950/70 border border-slate-800 overflow-hidden">
        {items.map((item, idx) => (
          <div key={idx} className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <span className="w-6 h-6 rounded-lg bg-slate-800 border border-slate-700 text-emerald-400 font-mono font-bold flex items-center justify-center text-xs shrink-0">
                #{item.resinCode || (idx + 1)}
              </span>
              <div>
                <div className="font-bold text-slate-200">{item.name}</div>
                <div className="text-[11px] font-mono text-emerald-400">
                  Polymer: {item.polymer}
                  {item.approximateWeightGrams ? ` (~${item.approximateWeightGrams}g)` : ''}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:self-center">
              <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 text-[11px] font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                <span>{item.action}</span>
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
