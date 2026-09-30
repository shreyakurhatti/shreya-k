import React from 'react';
import { Camera, Sparkles, ShieldCheck, ArrowRight, Activity, Leaf, Layers, Recycle } from 'lucide-react';
import { useEco } from '../context/EcoContext';

export const Hero: React.FC = () => {
  const { setActiveTab, t } = useEco();

  return (
    <section className="relative overflow-hidden pt-8 pb-12 px-4 sm:px-6 lg:px-8 border-b border-emerald-950/50">
      {/* Background radial gradients */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[350px] bg-gradient-to-tr from-emerald-600/15 via-teal-500/15 to-transparent blur-3xl pointer-events-none rounded-full" />
      <div className="absolute -top-10 -right-10 w-96 h-96 bg-lime-500/10 blur-3xl pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
        {/* Left Column: Bold Value Proposition */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-lime-400 animate-pulse" />
            <span>Next-Gen Polymer Vision & Segregation Intelligence</span>
          </div>

          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1] text-white">
            Transform Plastic Waste into{' '}
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-lime-300 bg-clip-text text-transparent">
              Circular Value
            </span>
          </h1>

          <p className="text-slate-300 text-base sm:text-lg max-w-2xl leading-relaxed">
            Snap any bottle, pouch, or packaging pile. PlastiSense instantly decodes polymer resin
            chemistry (♳–♹), evaluates toxic additive health hazards, predicts biodegradation timelines, and
            prescribes precise segregation and DIY upcycling instructions.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => {
                setActiveTab('scan');
                const scannerElement = document.getElementById('scanner-section');
                if (scannerElement) {
                  scannerElement.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className="flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-400 to-lime-400 hover:from-emerald-400 hover:to-lime-300 text-slate-950 font-bold text-sm tracking-wide shadow-lg shadow-emerald-500/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <Camera className="w-4 h-4 stroke-[2.5]" />
              <span>Scan Plastic Waste Now</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => setActiveTab('upcycle')}
              className="flex items-center gap-2 px-5 py-3.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700/80 text-sm font-semibold transition"
            >
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>Explore Upcycle Studio</span>
            </button>

            <button
              onClick={() => setActiveTab('hotspots')}
              className="flex items-center gap-2 px-4 py-3.5 rounded-xl bg-emerald-950/40 hover:bg-emerald-900/40 text-emerald-300 border border-emerald-500/30 text-sm font-semibold transition"
            >
              <Activity className="w-4 h-4 text-emerald-400" />
              <span>7-Day Hotspot Forecast</span>
            </button>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-3 gap-3 pt-4 border-t border-slate-800/80 max-w-lg">
            <div className="space-y-0.5">
              <div className="text-xl font-display font-extrabold text-white">7 Resin Types</div>
              <div className="text-xs text-slate-400">PET to Bioplastics classified</div>
            </div>
            <div className="space-y-0.5">
              <div className="text-xl font-display font-extrabold text-emerald-400">0 - 100 Score</div>
              <div className="text-xs text-slate-400">Health & Severity risk index</div>
            </div>
            <div className="space-y-0.5">
              <div className="text-xl font-display font-extrabold text-teal-300">100% Circular</div>
              <div className="text-xs text-slate-400">Segregate, upcycle & redeem</div>
            </div>
          </div>
        </div>

        {/* Right Column: Animated Circular Economy Loop (Plastic -> Degradation / Recycling -> Leaf) */}
        <div className="lg:col-span-5 flex justify-center">
          <div className="relative w-full max-w-[420px] aspect-square rounded-3xl p-6 bg-gradient-to-b from-slate-900/90 to-slate-950/90 border border-emerald-500/25 shadow-2xl shadow-emerald-950/40 overflow-hidden flex flex-col items-center justify-between">
            {/* Animated Cyber-Organic Scanner Ring */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.08)_0%,transparent_70%)]" />

            {/* Header Badge */}
            <div className="w-full flex items-center justify-between text-xs text-slate-400 z-10 border-b border-slate-800/80 pb-3">
              <span className="flex items-center gap-1.5 font-mono text-[11px] text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                ACTIVE BIO-SPECTRAL SCAN
              </span>
              <span className="text-[11px] font-mono text-slate-400">POLYMER_ID: PET_01</span>
            </div>

            {/* Central Animated Morph Graphic: Plastic Bottle to Living Organic Leaf / Recycling Loop */}
            <div className="relative my-auto flex items-center justify-center">
              {/* Outer rotating circular rings */}
              <div className="absolute w-60 h-60 rounded-full border border-dashed border-emerald-500/30 animate-[spin_20s_linear_infinite]" />
              <div className="absolute w-48 h-48 rounded-full border border-teal-500/40 animate-[spin_12s_linear_infinite_reverse]" />
              <div className="absolute w-36 h-36 rounded-full bg-emerald-500/10 blur-xl animate-pulse" />

              {/* Central Node Graphic */}
              <div className="relative w-32 h-32 rounded-2xl bg-gradient-to-tr from-slate-950 via-slate-900 to-emerald-950 border-2 border-emerald-400/60 p-3 shadow-xl shadow-emerald-500/20 flex flex-col items-center justify-center group">
                <div className="relative flex items-center justify-center">
                  <Recycle className="w-12 h-12 text-emerald-400 animate-spin transition-all duration-1000 group-hover:scale-110" style={{ animationDuration: '8s' }} />
                  <Leaf className="w-6 h-6 text-lime-400 absolute animate-bounce" />
                </div>
                <div className="text-[11px] font-bold font-mono text-emerald-300 mt-2">
                  ♳ PET 450yr → 0
                </div>
              </div>

              {/* Floating Orbiting Feature Badges */}
              <div className="absolute -top-2 left-2 bg-slate-900/90 border border-emerald-500/40 text-[10px] px-2.5 py-1 rounded-full text-emerald-300 font-mono shadow-md backdrop-blur-md">
                Ideonella Enzyme: 92%
              </div>
              <div className="absolute -bottom-2 right-2 bg-slate-900/90 border border-teal-500/40 text-[10px] px-2.5 py-1 rounded-full text-teal-300 font-mono shadow-md backdrop-blur-md">
                CO₂ Saved: +0.18 kg
              </div>
              <div className="absolute top-1/2 -right-6 -translate-y-1/2 bg-slate-900/90 border border-lime-500/40 text-[10px] px-2.5 py-1 rounded-full text-lime-300 font-mono shadow-md backdrop-blur-md">
                Toxicity: Low
              </div>
            </div>

            {/* Bottom Realtime Scan Progress bar */}
            <div className="w-full z-10 bg-slate-950/90 rounded-xl p-3 border border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300 font-medium">Circular Transformation Status</span>
                <span className="text-emerald-400 font-mono font-bold">100% Diverted</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                <div className="bg-gradient-to-r from-emerald-500 via-teal-400 to-lime-400 h-full w-full animate-pulse" />
              </div>
              <div className="flex items-center justify-between text-[10px] text-slate-400">
                <span>Input: Post-Consumer Waste</span>
                <span>Output: Upcycled Green Asset</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
