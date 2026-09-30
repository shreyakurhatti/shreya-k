import React, { useState } from 'react';
import { Calculator, ArrowRight, CheckCircle2, RotateCcw, Sparkles, TrendingDown } from 'lucide-react';
import { useEco } from '../../context/EcoContext';

export const FootprintCalculator: React.FC = () => {
  const { triggerConfetti } = useEco();

  const [bottlesPerWeek, setBottlesPerWeek] = useState<number>(4);
  const [takeawayPerWeek, setTakeawayPerWeek] = useState<number>(3);
  const [bagsPerWeek, setBagsPerWeek] = useState<number>(5);
  const [packagedSnacksPerWeek, setPackagedSnacksPerWeek] = useState<number>(4);

  // Calculation in kilograms per year
  // Bottle ~ 25g
  // Takeaway container + cutlery + bag ~ 60g
  // Bag / wrap ~ 10g
  // Multilayer snack packet ~ 8g
  const annualBottlesKg = (bottlesPerWeek * 52 * 0.025);
  const annualTakeawayKg = (takeawayPerWeek * 52 * 0.060);
  const annualBagsKg = (bagsPerWeek * 52 * 0.010);
  const annualSnacksKg = (packagedSnacksPerWeek * 52 * 0.008);
  const personalCareBaselineKg = 4.2; // shampoo, toothbrushes, detergent jugs

  const totalYearlyKg = parseFloat(
    (annualBottlesKg + annualTakeawayKg + annualBagsKg + annualSnacksKg + personalCareBaselineKg).toFixed(1)
  );

  const globalAverageKg = 44.0;
  const isBetterThanAverage = totalYearlyKg < globalAverageKg;
  const differencePct = Math.abs(Math.round(((totalYearlyKg - globalAverageKg) / globalAverageKg) * 100));

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-slate-900/80 border border-emerald-500/30 backdrop-blur-xl space-y-1">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
          <Calculator className="w-3.5 h-3.5 text-lime-400" />
          <span>Annual Consumption Audit</span>
        </div>
        <h2 className="text-2xl font-display font-extrabold text-white">
          Personal Plastic Footprint Calculator
        </h2>
        <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
          Answer 4 simple lifestyle questions to estimate your yearly polymer mass generation and unlock a personalized reduction roadmap.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Interactive Sliders Questionnaire */}
        <div className="lg:col-span-7 p-6 rounded-3xl bg-slate-900/70 border border-slate-800 space-y-6">
          <h3 className="text-base font-bold text-white">Weekly Consumption Inputs</h3>

          {/* Question 1: Bottles */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <label className="text-slate-200 font-semibold">
                Single-use bottled water / soda drinks
              </label>
              <span className="font-mono text-emerald-400 font-bold">{bottlesPerWeek} bottles / week</span>
            </div>
            <input
              type="range"
              min="0"
              max="25"
              value={bottlesPerWeek}
              onChange={(e) => setBottlesPerWeek(parseInt(e.target.value, 10))}
              className="w-full accent-emerald-400 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>0 (Reusable flask)</span>
              <span>10</span>
              <span>25+ bottles</span>
            </div>
          </div>

          {/* Question 2: Food Deliveries */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <label className="text-slate-200 font-semibold">
                Restaurant takeout or food deliveries
              </label>
              <span className="font-mono text-emerald-400 font-bold">{takeawayPerWeek} meals / week</span>
            </div>
            <input
              type="range"
              min="0"
              max="15"
              value={takeawayPerWeek}
              onChange={(e) => setTakeawayPerWeek(parseInt(e.target.value, 10))}
              className="w-full accent-emerald-400 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>0 (Cook at home)</span>
              <span>7</span>
              <span>15 meals</span>
            </div>
          </div>

          {/* Question 3: Shopping bags */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <label className="text-slate-200 font-semibold">
                Plastic grocery bags & film produce wraps
              </label>
              <span className="font-mono text-emerald-400 font-bold">{bagsPerWeek} bags / week</span>
            </div>
            <input
              type="range"
              min="0"
              max="20"
              value={bagsPerWeek}
              onChange={(e) => setBagsPerWeek(parseInt(e.target.value, 10))}
              className="w-full accent-emerald-400 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>0 (Cloth tote bags)</span>
              <span>10</span>
              <span>20 bags</span>
            </div>
          </div>

          {/* Question 4: Packaged snacks */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <label className="text-slate-200 font-semibold">
                Single-serve snacks (chips, biscuits, chocolate bars)
              </label>
              <span className="font-mono text-emerald-400 font-bold">{packagedSnacksPerWeek} packs / week</span>
            </div>
            <input
              type="range"
              min="0"
              max="25"
              value={packagedSnacksPerWeek}
              onChange={(e) => setPackagedSnacksPerWeek(parseInt(e.target.value, 10))}
              className="w-full accent-emerald-400 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>0 (Bulk jar snacks)</span>
              <span>12</span>
              <span>25 packs</span>
            </div>
          </div>
        </div>

        {/* Right: Results Card & Personalized Reduction Roadmap */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-6 rounded-3xl bg-slate-900/80 border border-emerald-500/30 space-y-5 text-center">
            <div className="space-y-1">
              <div className="text-xs uppercase font-mono tracking-wider text-slate-400">
                Estimated Annual Generation
              </div>
              <div className="text-4xl font-extrabold font-display text-white">
                {totalYearlyKg} <span className="text-lg font-sans text-emerald-400">kg / year</span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Global Citizen Average:</span>
                <strong className="text-slate-200 font-mono">{globalAverageKg} kg/year</strong>
              </div>
              <div className="flex items-center justify-between mt-1 pt-1 border-t border-slate-800">
                <span className="text-slate-400">Comparison:</span>
                <span className={`font-bold ${isBetterThanAverage ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {isBetterThanAverage ? `${differencePct}% lower than average!` : `${differencePct}% above average`}
                </span>
              </div>
            </div>

            {/* Personalized Reduction Tips */}
            <div className="text-left space-y-2.5 pt-2">
              <div className="text-xs font-semibold text-slate-300">
                High-Impact Mitigation Steps:
              </div>
              <div className="space-y-2 text-xs">
                {bottlesPerWeek > 2 && (
                  <div className="flex items-start gap-2 text-slate-300 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>Carry an insulated stainless steel flask to prevent <strong>{annualBottlesKg.toFixed(1)} kg</strong> of PET waste.</span>
                  </div>
                )}
                {takeawayPerWeek > 1 && (
                  <div className="flex items-start gap-2 text-slate-300 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>Opt-out of disposable plastic cutlery on delivery apps to eliminate <strong>{(annualTakeawayKg * 0.4).toFixed(1)} kg</strong> of brittle PS plastic.</span>
                  </div>
                )}
                {bagsPerWeek > 2 && (
                  <div className="flex items-start gap-2 text-slate-300 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>Keep 2 washable organic cotton tote bags in your vehicle or backpack.</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
