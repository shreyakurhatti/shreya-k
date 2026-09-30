import React, { useState } from 'react';
import { BookOpen, RotateCw, AlertTriangle, ShieldCheck, Check, Sparkles } from 'lucide-react';
import { RESIN_CODES_GUIDE } from '../../data/mockData';

export const ResinCodeGuide: React.FC = () => {
  const [flippedCards, setFlippedCards] = useState<{ [key: number]: boolean }>({});

  const toggleFlip = (code: number) => {
    setFlippedCards((prev) => ({ ...prev, [code]: !prev[code] }));
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-slate-900/80 border border-emerald-500/30 backdrop-blur-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
            <BookOpen className="w-3.5 h-3.5 text-lime-400" />
            <span>Polymer Science Encyclopedia</span>
          </div>
          <h2 className="text-2xl font-display font-extrabold text-white">
            Resin Identification Codes (♳–♹)
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
            Click any card to flip between consumer identification profiles and advanced chemical toxicity, additive migration, and biodegradation kinetics.
          </p>
        </div>

        <div className="text-xs text-slate-400 font-mono bg-slate-950/80 px-3 py-1.5 rounded-xl border border-slate-800">
          ASTM D7611 STANDARD SPECIFICATION
        </div>
      </div>

      {/* Flip Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {RESIN_CODES_GUIDE.map((resin) => {
          const isFlipped = !!flippedCards[resin.code];
          return (
            <div
              key={resin.code}
              onClick={() => toggleFlip(resin.code)}
              className="cursor-pointer group relative min-h-[380px] perspective-1000"
            >
              <div
                className={`w-full h-full rounded-3xl p-6 transition-all duration-500 border flex flex-col justify-between ${
                  isFlipped
                    ? 'bg-slate-950 border-teal-500/50 shadow-2xl'
                    : 'bg-slate-900/80 border-slate-800 hover:border-emerald-500/40 shadow-xl'
                }`}
              >
                {!isFlipped ? (
                  /* FRONT OF CARD */
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="w-14 h-14 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center font-mono font-extrabold text-3xl text-emerald-400 group-hover:scale-105 transition">
                        {resin.symbol}
                      </div>

                      <div className="text-right">
                        <span className="font-mono text-xs font-bold text-slate-400">
                          RESIN #{resin.code}
                        </span>
                        <div className="text-xs font-bold text-emerald-400">
                          {resin.name}
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-white leading-snug">
                        {resin.fullName}
                      </h3>
                      <div className="text-[11px] font-mono text-slate-500 pt-0.5">
                        Formula: {resin.chemicalFormula}
                      </div>
                    </div>

                    <div className="space-y-1.5 text-xs">
                      <div className="font-semibold text-slate-300">Common Products:</div>
                      <div className="flex flex-wrap gap-1">
                        {resin.commonUses.map((use, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded bg-slate-950 text-slate-300 text-[10px] border border-slate-800"
                          >
                            {use}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800/80 text-xs space-y-1">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">
                        Recyclability Status
                      </span>
                      <p className="text-slate-200 font-medium text-[11px]">{resin.recyclability}</p>
                    </div>

                    <div className="pt-2 text-center text-[10px] font-mono text-emerald-400/80 flex items-center justify-center gap-1 group-hover:text-emerald-300">
                      <RotateCw className="w-3 h-3 group-hover:rotate-180 transition duration-500" />
                      <span>Click to flip for chemical toxicity & biodegradation</span>
                    </div>
                  </div>
                ) : (
                  /* BACK OF CARD */
                  <div className="space-y-3.5 text-xs">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <div className="font-mono font-bold text-emerald-400 text-sm">
                        {resin.symbol} {resin.name} Toxicology Data
                      </div>
                      <span className="font-mono text-[10px] text-slate-400">BACK</span>
                    </div>

                    <div className="space-y-1">
                      <span className="font-bold text-red-300 text-[11px] flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3 text-red-400" />
                        Toxicity & Additive Hazard:
                      </span>
                      <p className="text-slate-300 text-[11px] leading-relaxed bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                        {resin.toxicRiskDetail}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <span className="font-bold text-teal-300 text-[11px]">
                        Biodegradation Pathway:
                      </span>
                      <p className="text-slate-300 text-[11px] leading-relaxed bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                        {resin.biodegradation}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <span className="font-bold text-emerald-300 text-[11px]">
                        Circular Action Tip:
                      </span>
                      <p className="text-slate-300 text-[11px] leading-relaxed bg-emerald-950/30 p-2.5 rounded-xl border border-emerald-500/20">
                        {resin.circularTip}
                      </p>
                    </div>

                    <div className="pt-1 text-center text-[10px] font-mono text-slate-400 flex items-center justify-center gap-1">
                      <RotateCw className="w-3 h-3" />
                      <span>Click to flip back</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
