import React from 'react';
import { Camera, Cpu, RefreshCw, ShieldCheck, HeartPulse, Recycle, Globe, Code, Sparkles } from 'lucide-react';
import { useEco } from '../../context/EcoContext';

export const HowItWorks: React.FC = () => {
  const { setActiveTab } = useEco();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-slate-900/80 border border-emerald-500/30 backdrop-blur-xl space-y-1">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-lime-400" />
          <span>System Architecture & Scientific Methodology</span>
        </div>
        <h2 className="text-2xl font-display font-extrabold text-white">
          How PlastiSense Powers Circular Transformation
        </h2>
        <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
          Combining state-of-the-art multimodal vision intelligence with polymer material science, local municipal recycling rules, and gamified circular incentives.
        </p>
      </div>

      {/* 3-Step Flow */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Step 1 */}
        <div className="p-6 rounded-3xl bg-slate-900/70 border border-slate-800 space-y-3 relative overflow-hidden">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-mono font-bold text-lg">
            01
          </div>
          <h3 className="text-base font-bold text-white">Optical Capture & Multi-Item Segmentation</h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            The user captures a live video frame or uploads a waste photo. The model performs object boundary detection, distinguishing between individual clear bottles, opaque jugs, flimsy films, and brittle takeout containers.
          </p>
          <div className="text-[11px] font-mono text-emerald-400 pt-1">
            • Sub-second latency • Multi-item pile isolation
          </div>
        </div>

        {/* Step 2 */}
        <div className="p-6 rounded-3xl bg-slate-900/70 border border-slate-800 space-y-3 relative overflow-hidden">
          <div className="w-12 h-12 rounded-2xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 font-mono font-bold text-lg">
            02
          </div>
          <h3 className="text-base font-bold text-white">Polymer & Toxicology Synthesis</h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Gemini vision evaluates wall transparency, stiffness lines, mold seams, and resin stamps (♳–♹). It maps polymer chemistry against known additive leaching hazards (BPA, phthalates, styrene) and bio-breakdown enzymes (Ideonella sakaiensis).
          </p>
          <div className="text-[11px] font-mono text-teal-400 pt-1">
            • Health Risk Index • Biodegradation Predictor
          </div>
        </div>

        {/* Step 3 */}
        <div className="p-6 rounded-3xl bg-slate-900/70 border border-slate-800 space-y-3 relative overflow-hidden">
          <div className="w-12 h-12 rounded-2xl bg-lime-500/10 border border-lime-500/30 flex items-center justify-center text-lime-400 font-mono font-bold text-lg">
            03
          </div>
          <h3 className="text-base font-bold text-white">Action Engine & Carbon Sequestration</h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            The platform delivers clear segregation instructions attuned to the user’s municipality, generates custom DIY upcycling blueprints, awards gamified Eco Points, and deposits verified carbon offset credits into your Carbon Wallet.
          </p>
          <div className="text-[11px] font-mono text-lime-400 pt-1">
            • Local Rules Adaptation • Carbon Credits
          </div>
        </div>
      </div>

      {/* Technology Stack & Scientific Rigor */}
      <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Code className="w-4 h-4 text-emerald-400" />
          Technical Foundations
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800/80 space-y-1">
            <span className="font-bold text-emerald-400">Gemini 3.8 Flash</span>
            <p className="text-slate-400">Multimodal visual reasoning with strictly structured JSON response schemas for deterministic polymer attributes.</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800/80 space-y-1">
            <span className="font-bold text-teal-300">Material Toxicology</span>
            <p className="text-slate-400">Based on IARC carcinogen classifications, Endocrine Society reports, and published peer-reviewed microplastic research.</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800/80 space-y-1">
            <span className="font-bold text-lime-400">GIS & Weather Engine</span>
            <p className="text-slate-400">Simulates stormwater runoff bottlenecks and urban population density to forecast emerging river litter chokepoints.</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800/80 space-y-1">
            <span className="font-bold text-amber-300">Accessibility & TTS</span>
            <p className="text-slate-400">Integrated Web Speech API and Gemini TTS for voice guidance, alongside keyboard access and high-contrast styling.</p>
          </div>
        </div>

        <div className="pt-4 text-center">
          <button
            onClick={() => setActiveTab('scan')}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-lime-400 hover:from-emerald-400 hover:to-lime-300 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/25 transition"
          >
            Launch Live Scanner
          </button>
        </div>
      </div>
    </div>
  );
};
