import React, { useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Recycle,
  Sparkles,
  Volume2,
  Clock,
  Flame,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  HeartPulse,
  Dna,
  Share2,
  MessageSquare,
  Droplets,
  Award,
} from 'lucide-react';
import { ScanResult } from '../../types/plastic';
import { useEco } from '../../context/EcoContext';
import { speakText } from '../../services/geminiService';

interface ScanResultsProps {
  scan: ScanResult;
}

export const ScanResults: React.FC<ScanResultsProps> = ({ scan }) => {
  const { verifyAction, setActiveTab, setEcoBotOpen, locationRegion, t } = useEco();
  const [speaking, setSpeaking] = useState(false);
  const [copied, setCopied] = useState(false);

  // Severity color system
  const getSeverityBadge = (level: string) => {
    switch (level) {
      case 'Low':
        return {
          bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
          dot: 'bg-emerald-400',
        };
      case 'Medium':
        return {
          bg: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
          dot: 'bg-amber-400',
        };
      case 'High':
        return {
          bg: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
          dot: 'bg-orange-400',
        };
      case 'Hazardous':
      default:
        return {
          bg: 'bg-red-500/10 text-red-400 border-red-500/30',
          dot: 'bg-red-400',
        };
    }
  };

  // Health Risk color
  const getHealthRiskColor = (meter: string) => {
    switch (meter) {
      case 'Green':
        return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
      case 'Yellow':
        return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
      case 'Red':
      default:
        return 'text-red-400 bg-red-500/10 border-red-500/30';
    }
  };

  const handleVoiceRead = async () => {
    setSpeaking(true);
    const textToRead = `${scan.itemName}. Polymer identified as ${scan.plasticType}, Resin Code ${scan.resinCode}. Recommended action is ${scan.recommendedAction}. Next step: ${scan.nextAction}`;
    await speakText(textToRead);
    setTimeout(() => setSpeaking(false), 3000);
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(
        `PlastiSense Scan: Identified ${scan.itemName} (${scan.plasticType}, Resin #${scan.resinCode}). Recommended: ${scan.recommendedAction}! Saved ${scan.co2SavedKg}kg CO2.`
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const sev = getSeverityBadge(scan.severityLevel);

  return (
    <div className="space-y-6">
      {/* Low Confidence Warning (if confidence < 70%) */}
      {scan.confidence < 70 && (
        <div className="p-3.5 rounded-2xl bg-amber-950/60 border border-amber-500/40 text-amber-200 text-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              <strong>Low Confidence ({scan.confidence}%):</strong> Optical clarity or lighting was imperfect. Please inspect the stamped triangle symbol on the bottom before discarding.
            </span>
          </div>
        </div>
      )}

      {/* Main Polymer Header Card */}
      <div className="p-6 rounded-3xl bg-slate-900/80 border border-emerald-500/30 backdrop-blur-xl relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Left: Resin Code & Item Info */}
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-slate-950 to-slate-900 border-2 border-emerald-400/50 p-2 flex flex-col items-center justify-center shrink-0 shadow-lg shadow-emerald-500/10">
              <span className="font-mono text-2xl sm:text-3xl font-extrabold text-emerald-400">
                {scan.resinSymbol || `♳`}
              </span>
              <span className="text-[10px] font-mono font-bold text-slate-300">
                RESIN #{scan.resinCode}
              </span>
            </div>

            <div className="space-y-1.5 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${sev.bg}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${sev.dot}`} />
                  {scan.severityLevel} Severity
                </span>
                <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 text-xs font-mono">
                  {scan.confidence}% Confidence
                </span>
                {scan.brandDetected && (
                  <span className="px-2 py-0.5 rounded-full bg-teal-950/60 text-teal-300 border border-teal-500/30 text-xs">
                    Brand: {scan.brandDetected}
                  </span>
                )}
              </div>

              <h2 className="text-xl sm:text-2xl font-display font-extrabold text-white tracking-tight">
                {scan.itemName}
              </h2>
              <p className="text-xs sm:text-sm font-mono text-emerald-300">
                {scan.plasticType}
              </p>
            </div>
          </div>

          {/* Right: Environmental Impact Score Gauge (0-100) */}
          <div className="flex items-center gap-4 bg-slate-950/80 p-4 rounded-2xl border border-slate-800 shrink-0">
            <div className="text-right">
              <div className="text-xs text-slate-400 font-medium">Environmental Impact</div>
              <div className="text-2xl font-extrabold font-display text-white">
                {scan.impactScore}<span className="text-xs text-slate-500">/100</span>
              </div>
              <div className="text-[10px] text-slate-400">
                Condition: <strong className="text-slate-200 capitalize">{scan.condition}</strong>
              </div>
            </div>

            {/* Circular Progress Gauge */}
            <div className="relative w-14 h-14 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="28"
                  cy="28"
                  r="24"
                  stroke="#1e293b"
                  strokeWidth="5"
                  fill="none"
                />
                <circle
                  cx="28"
                  cy="28"
                  r="24"
                  stroke={scan.impactScore > 70 ? '#ef4444' : scan.impactScore > 40 ? '#f59e0b' : '#10b981'}
                  strokeWidth="5"
                  fill="none"
                  strokeDasharray="150.8"
                  strokeDashoffset={150.8 - (150.8 * scan.impactScore) / 100}
                  strokeLinecap="round"
                />
              </svg>
              <span className="absolute font-mono text-xs font-bold text-slate-200">
                {scan.impactScore}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Toolbar */}
        <div className="mt-6 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <button
              onClick={handleVoiceRead}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition ${
                speaking
                  ? 'bg-emerald-500 text-slate-950 font-bold border-emerald-400'
                  : 'bg-slate-800/80 hover:bg-slate-700 text-slate-200 border-slate-700'
              }`}
              title="Read advice aloud using Speech synthesis"
            >
              <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>{speaking ? 'Speaking...' : 'Listen Advice'}</span>
            </button>

            <button
              onClick={() => setEcoBotOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 border border-teal-500/30 transition"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Ask EcoBot</span>
            </button>

            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{copied ? 'Copied Link!' : 'Share Scan'}</span>
            </button>
          </div>

          <div className="text-slate-400 text-[11px]">
            Municipal rules matched to: <strong className="text-emerald-300">{locationRegion}</strong>
          </div>
        </div>
      </div>

      {/* Grid: Health Risk vs Biodegradation Predictor */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Health Risk Score & Toxic Additives */}
        <div className="p-5 rounded-3xl bg-slate-900/70 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
                <HeartPulse className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Health & Toxic Hazard Assessment</h3>
                <p className="text-[11px] text-slate-400">Additive migration and biological hazard</p>
              </div>
            </div>
            <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${getHealthRiskColor(scan.healthRisk?.riskMeter || 'Yellow')}`}>
              {scan.healthRisk?.riskMeter || 'Yellow'} Risk
            </span>
          </div>

          <div className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
            {scan.healthRisk?.summary}
          </div>

          {/* Extended HealthProfile Diagnostics */}
          {scan.healthProfile && (
            <div className="space-y-3 pt-1 border-t border-slate-800/80">
              {/* Food Contact Safety Badge & Heat Risk */}
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 font-semibold">Food Contact Safety:</span>
                <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                  scan.healthProfile.foodContactSafety === 'Generally safe'
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                    : scan.healthProfile.foodContactSafety === 'Not food-safe'
                    ? 'bg-red-500/10 text-red-400 border border-red-500/30'
                    : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                }`}>
                  {scan.healthProfile.foodContactSafety}
                </span>
              </div>

              {/* Heat Tolerance Matrix */}
              <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
                <div className={`p-2 rounded-xl border ${scan.healthProfile.heatRisk.microwaveSafe ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300' : 'bg-red-950/20 border-red-500/30 text-red-300'}`}>
                  <div className="font-bold">Microwave</div>
                  <div>{scan.healthProfile.heatRisk.microwaveSafe ? '✓ Safe' : '✗ Avoid'}</div>
                </div>

                <div className={`p-2 rounded-xl border ${scan.healthProfile.heatRisk.hotLiquidSafe ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300' : 'bg-red-950/20 border-red-500/30 text-red-300'}`}>
                  <div className="font-bold">Hot Liquids</div>
                  <div>{scan.healthProfile.heatRisk.hotLiquidSafe ? '✓ Safe' : '✗ Leaches'}</div>
                </div>

                <div className={`p-2 rounded-xl border ${scan.healthProfile.heatRisk.dishwasherSafe ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300' : 'bg-amber-950/20 border-amber-500/30 text-amber-300'}`}>
                  <div className="font-bold">Dishwasher</div>
                  <div>{scan.healthProfile.heatRisk.dishwasherSafe ? '✓ Top Rack' : '✗ Hand Wash'}</div>
                </div>
              </div>

              <p className="text-[11px] text-slate-400 italic">
                {scan.healthProfile.heatRisk.explanation}
              </p>

              {/* Reuse Guidance & Signs to Discard */}
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] space-y-1">
                <div className="text-slate-300 font-semibold">
                  Reuse Recommendation: <span className="font-normal text-slate-400">{scan.healthProfile.reuseSafety.maxReuseAdvice}</span>
                </div>
                {scan.healthProfile.reuseSafety.signsToDiscard.length > 0 && (
                  <div className="text-red-300 text-[10px]">
                    <strong>Signs to immediately discard:</strong> {scan.healthProfile.reuseSafety.signsToDiscard.join(', ')}
                  </div>
                )}
              </div>

              {/* Safer Non-Toxic Alternatives */}
              {scan.healthProfile.saferAlternatives && scan.healthProfile.saferAlternatives.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  <span className="text-slate-300 font-semibold text-[11px]">Recommended Safer Alternatives:</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {scan.healthProfile.saferAlternatives.map((alt, aIdx) => (
                      <div key={aIdx} className="p-2 rounded-xl bg-emerald-950/30 border border-emerald-500/20 text-[10px]">
                        <div className="font-bold text-emerald-300">{alt.name}</div>
                        <div className="text-slate-400">Cost: {alt.estimatedCost} • Saves {alt.yearlyPlasticSavedKg}kg/yr</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="space-y-2">
            <div className="text-xs font-semibold text-slate-300">Monitored Toxic Additives:</div>
            <div className="flex flex-wrap gap-1.5">
              {scan.healthRisk?.toxicAdditives?.map((additive, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 rounded-md bg-slate-800/90 border border-slate-700 text-slate-300 text-[11px] font-mono"
                >
                  {additive}
                </span>
              ))}
            </div>
          </div>

          <div className="space-y-1 text-xs text-slate-400">
            <span className="font-semibold text-slate-300">Documented Biological Risks:</span>
            <ul className="list-disc list-inside space-y-0.5 text-[11px]">
              {scan.healthRisk?.healthEffects?.map((effect, i) => (
                <li key={i}>{effect}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Biodegradation & Microbial Pathway */}
        <div className="p-5 rounded-3xl bg-slate-900/70 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
                <Dna className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Biodegradation Predictor</h3>
                <p className="text-[11px] text-slate-400">Enzymatic hydrolysis & decomposition</p>
              </div>
            </div>
            <div className="flex items-center gap-1 font-mono text-xs font-bold text-teal-300 bg-teal-950/60 px-2 py-0.5 rounded-full border border-teal-500/30">
              <Clock className="w-3 h-3" />
              <span>{scan.biodegradation?.naturalDecompositionYears || 450} Yrs</span>
            </div>
          </div>

          <div className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
            {scan.biodegradation?.summary}
          </div>

          <div className="space-y-1.5">
            <div className="text-xs font-semibold text-slate-300">Microbial / Enzymatic Pathway:</div>
            <div className="text-xs font-mono text-teal-300/90 bg-slate-950/80 p-2.5 rounded-xl border border-teal-500/20 leading-relaxed">
              {scan.biodegradation?.microbialPathway}
            </div>
          </div>

          <div className="flex items-center justify-between text-xs pt-1">
            <span className="text-slate-400">Industrial Compost Facility Eligible:</span>
            <span
              className={`font-semibold ${
                scan.biodegradation?.bioFacilityEligible ? 'text-emerald-400' : 'text-slate-400'
              }`}
            >
              {scan.biodegradation?.bioFacilityEligible ? 'Yes (Certified PLA/PHA)' : 'No (Requires Mechanical/Chemical Sorting)'}
            </span>
          </div>
        </div>
      </div>

      {/* Actionable Segregation Checklist & Immediate Next Step */}
      <div className="p-6 rounded-3xl bg-gradient-to-tr from-slate-900 via-slate-900 to-emerald-950/50 border border-emerald-500/30 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400">
              <Recycle className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs uppercase font-mono tracking-wider text-emerald-400 font-bold">
                Action Recommendation
              </div>
              <h3 className="text-lg font-bold text-white">
                {scan.recommendedAction}: Step-by-Step Segregation Protocol
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-[10px] text-slate-400">Carbon Offset Potential</div>
              <div className="text-sm font-mono font-bold text-emerald-300">
                +{scan.co2SavedKg} kg CO₂e
              </div>
            </div>
          </div>
        </div>

        {/* Ordered Steps List */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {scan.steps.map((step, idx) => (
            <div
              key={idx}
              className="flex items-start gap-3 p-3 rounded-2xl bg-slate-950/70 border border-slate-800 text-xs text-slate-200"
            >
              <span className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 flex items-center justify-center shrink-0 font-mono font-bold text-[11px]">
                {idx + 1}
              </span>
              <span className="leading-relaxed">{step}</span>
            </div>
          ))}
        </div>

        {/* Ocean & Landfill Risk Note */}
        <div className="p-3.5 rounded-2xl bg-slate-950/90 border border-slate-800 text-xs text-slate-300 flex items-start gap-2.5">
          <Droplets className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
          <div>
            <strong className="text-teal-300">Ecological Risk if Discarded: </strong>
            {scan.oceanLandfillRisk}
          </div>
        </div>

        {/* Immediate Next Action Card with XP Reward */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/80 via-teal-950/60 to-slate-950 border border-emerald-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="text-xs font-mono font-bold text-emerald-400 uppercase flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-lime-400" />
              <span>Immediate Achievable Micro-Action</span>
            </div>
            <p className="text-sm font-semibold text-white">
              {scan.nextAction}
            </p>
          </div>

          <button
            onClick={() => verifyAction(scan.id)}
            disabled={scan.verifiedActionTaken}
            className={`px-5 py-3 rounded-xl font-bold text-xs tracking-wide transition flex items-center gap-2 shrink-0 ${
              scan.verifiedActionTaken
                ? 'bg-slate-800 text-emerald-400 border border-emerald-500/40 cursor-default'
                : 'bg-gradient-to-r from-emerald-500 to-lime-400 hover:from-emerald-400 hover:to-lime-300 text-slate-950 shadow-lg shadow-emerald-500/25 active:scale-95'
            }`}
          >
            {scan.verifiedActionTaken ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Action Verified (+100 XP Claimed)</span>
              </>
            ) : (
              <>
                <Award className="w-4 h-4 text-slate-950" />
                <span>Mark Action Taken (+100 XP)</span>
              </>
            )}
          </button>
        </div>

        {/* Fun Fact */}
        {scan.funFact && (
          <div className="text-xs text-slate-400 italic text-center pt-1">
            "{scan.funFact}"
          </div>
        )}
      </div>

      {/* Upcycle Studio Quick Teaser */}
      {scan.upcycleIdeas && scan.upcycleIdeas.length > 0 && (
        <div className="p-5 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-lime-400" />
              <h3 className="text-sm font-bold text-white">
                Creative Upcycle Ideas for this {scan.polymerShort} Item
              </h3>
            </div>
            <button
              onClick={() => setActiveTab('upcycle')}
              className="text-xs text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1"
            >
              <span>Explore Studio</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {scan.upcycleIdeas.map((idea, i) => (
              <div
                key={i}
                className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2 hover:border-emerald-500/40 transition"
              >
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-semibold text-emerald-300">{idea.difficulty}</span>
                  <span className="text-slate-500 font-mono">{idea.estimatedTime}</span>
                </div>
                <div className="text-xs font-bold text-white line-clamp-1">{idea.title}</div>
                <div className="text-[11px] text-slate-400 line-clamp-2">
                  Materials: {idea.materialsNeeded.join(', ')}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
