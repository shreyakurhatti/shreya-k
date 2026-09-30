import React, { useState } from 'react';
import {
  HeartPulse,
  ShieldCheck,
  AlertTriangle,
  Flame,
  Coffee,
  Baby,
  Sparkles,
  HelpCircle,
  CheckCircle2,
  XCircle,
  Share2,
  Info,
  Calendar,
  Layers,
  Thermometer,
  RotateCw,
  Sun,
  CloudRain,
  GlassWater,
  ShoppingBag,
} from 'lucide-react';
import { useEco } from '../../context/EcoContext';
import {
  KITCHEN_FOOD_SAFETY_GUIDE,
  HIDDEN_PLASTICS_DATA,
  MICROPLASTICS_101_DATA,
  BURNING_PLASTIC_WARNING_DATA,
  VULNERABLE_GROUPS_DATA,
  SEASONAL_HEALTH_ALERTS,
  RESIN_CODES_GUIDE,
} from '../../data/mockData';
import { PlasticExposureQuizResult } from '../../types/plastic';

export const HealthAdvisor: React.FC = () => {
  const {
    safeSwaps,
    toggleSwapChallenge,
    plasticExposureScore,
    setPlasticExposureScore,
    triggerConfetti,
  } = useEco();

  // Sub-tabs in Health Advisor
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'kitchen' | 'hidden' | 'quiz' | 'swaps' | 'vulnerable'>('overview');

  // Quiz State (10 questions)
  const [quizAnswers, setQuizAnswers] = useState<{ [key: number]: number }>({});
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);
  const [copiedInfographic, setCopiedInfographic] = useState<string | null>(null);

  const QUIZ_QUESTIONS = [
    { id: 1, text: 'How often do you drink water from single-use disposable PET plastic bottles?', options: ['Never / Stainless Steel Flask (0 pts)', '1-2 times a week (1 pt)', 'Daily / Multiple bottles a day (3 pts)'] },
    { id: 2, text: 'Do you ever leave plastic water bottles in a parked vehicle on warm or sunny days?', options: ['Never, always keep in shade (0 pts)', 'Occasionally forget in car (2 pts)', 'Frequently drink water left in warm car (3 pts)'] },
    { id: 3, text: 'How frequently do you reheat takeaway food directly in the plastic delivery container in a microwave?', options: ['Never, always transfer to ceramic/glass (0 pts)', 'Occasionally for quick warm-ups (2 pts)', 'Almost every takeaway meal (3 pts)'] },
    { id: 4, text: 'Do you drink hot tea, chai, or coffee from plastic-lined paper or polystyrene foam cups?', options: ['Bring reusable travel mug (0 pts)', '1-2 times a week at cafes/street stalls (2 pts)', 'Daily hot drinks in disposable cups (3 pts)'] },
    { id: 5, text: 'Do you cover warm or oily food leftovers with PVC or LDPE cling film wrap?', options: ['Use glass lids, beeswax wraps, or plates (0 pts)', 'Sometimes for dry baked goods (1 pt)', 'Frequently on hot/oily dishes (3 pts)'] },
    { id: 6, text: 'Do you repeatedly refill single-use clear plastic beverage bottles at home or gym?', options: ['Never, use designated reusable bottle (0 pts)', 'Refill for 2-3 days then discard (1 pt)', 'Refill the same disposable bottle for weeks (3 pts)'] },
    { id: 7, text: 'Do you steep commercial pyramid plastic mesh tea bags in boiling water?', options: ['Use loose leaf tea / stainless infuser (0 pts)', 'Occasionally on travel (1 pt)', 'Daily plastic tea bag usage (3 pts)'] },
    { id: 8, text: 'Are hot baby formula or milk bottles in your household prepared in plastic containers at boiling temperatures?', options: ['Not applicable or use borosilicate glass/silicone (0 pts)', 'Plastic bottles cooled first (1 pt)', 'Boiling water mixed directly in plastic bottles (3 pts)'] },
    { id: 9, text: 'Have you ever noticed cloudy, warped, or heavily scratched reusable plastic bottles in your kitchen still in use?', options: ['Discarded immediately when scratched (0 pts)', 'Still have 1 or 2 old cloudy bottles (2 pts)', 'Many old scratched plastic tubs still in use (3 pts)'] },
    { id: 10, text: 'Is household or garden waste (including wrappers and bags) ever burned in your neighborhood or yard?', options: ['Never, municipal segregation only (0 pts)', 'Occasionally see street leaf/waste burning (2 pts)', 'Frequent open backyard/street burning (3 pts)'] },
  ];

  const handleSelectQuizOption = (qId: number, optionIndex: number) => {
    setQuizAnswers({ ...quizAnswers, [qId]: optionIndex });
  };

  const handleCalculateScore = (e: React.FormEvent) => {
    e.preventDefault();
    let totalRiskPoints = 0;
    QUIZ_QUESTIONS.forEach((q) => {
      const ansIdx = quizAnswers[q.id] || 0;
      if (ansIdx === 1) totalRiskPoints += 1.5;
      if (ansIdx === 2) totalRiskPoints += 3;
    });

    // Score out of 100 where 100 is cleanest (lowest exposure)
    const habitScore = Math.max(15, Math.round(100 - (totalRiskPoints / 30) * 80));

    let tier: 'Low Exposure' | 'Moderate Exposure' | 'Elevated Exposure' = 'Low Exposure';
    if (habitScore < 50) tier = 'Elevated Exposure';
    else if (habitScore < 75) tier = 'Moderate Exposure';

    const topHabits: string[] = [];
    if ((quizAnswers[3] || 0) > 0) topHabits.push('Stop microwaving food inside takeaway plastic containers');
    if ((quizAnswers[2] || 0) > 0) topHabits.push('Never drink from plastic water bottles left inside hot vehicles');
    if ((quizAnswers[4] || 0) > 0) topHabits.push('Avoid hot tea or chai in thin plastic or foam cups');
    if ((quizAnswers[7] || 0) > 0) topHabits.push('Switch from pyramid plastic tea bags to stainless steel infusers');

    const result: PlasticExposureQuizResult = {
      score: habitScore,
      tier,
      topHabitsToChange: topHabits.length > 0 ? topHabits.slice(0, 3) : ['Continue maintaining your clean non-toxic kitchen routine!'],
      saferSwapShoppingList: ['Borosilicate Glass Bottle', 'Stainless Steel Meal Containers', 'GOTS Organic Beeswax Wraps'],
      weeklyReductionTarget: tier === 'Elevated Exposure' ? '-1.5 kg plastic exposure' : '-0.6 kg plastic exposure',
      date: new Date().toLocaleDateString(),
    };

    setPlasticExposureScore(result);
    setQuizSubmitted(true);
    triggerConfetti();
  };

  const handleShareInfographic = (title: string, summary: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(`🌿 PlastiSense Health Advisory: ${title}\n${summary}\nVerified evidence-based guidance.`);
      setCopiedInfographic(title);
      setTimeout(() => setCopiedInfographic(null), 2000);
    }
  };

  return (
    <div className="space-y-8">
      {/* Advisor Header */}
      <div className="p-6 rounded-3xl bg-slate-900/80 border border-emerald-500/30 backdrop-blur-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
            <HeartPulse className="w-3.5 h-3.5 text-lime-400" />
            <span>Public Health & Polymer Toxicology Intelligence</span>
          </div>
          <h2 className="text-2xl font-display font-extrabold text-white">
            Health & Plastics Advisor
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
            Calm, evidence-based public-health recommendations on how everyday disposable plastics interact with heat, food, and human biology.
          </p>
        </div>

        {/* Quick Exposure Score Pill if calculated */}
        {plasticExposureScore && (
          <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800 text-center shrink-0">
            <div className="text-[10px] text-slate-400 font-mono">Your Habit Score</div>
            <div className="text-2xl font-display font-extrabold text-emerald-400">
              {plasticExposureScore.score}<span className="text-xs text-slate-500">/100</span>
            </div>
            <div className="text-[10px] font-semibold text-slate-300">{plasticExposureScore.tier}</div>
          </div>
        )}
      </div>

      {/* Sub Navigation */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-2xl border border-slate-800 text-xs overflow-x-auto">
        {[
          { id: 'overview', label: 'Health Overview' },
          { id: 'kitchen', label: 'Kitchen & Food Safety' },
          { id: 'hidden', label: 'Hidden Plastics' },
          { id: 'quiz', label: 'Exposure Quiz (10-Q)' },
          { id: 'swaps', label: 'Safe Swaps Challenge' },
          { id: 'vulnerable', label: 'Vulnerable Groups' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id as any)}
            className={`px-3.5 py-2 rounded-xl font-medium transition shrink-0 ${
              activeSubTab === tab.id
                ? 'bg-emerald-500 text-slate-950 font-bold shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* SUB-TAB 1: HEALTH OVERVIEW & MICROPLASTICS 101 */}
      {activeSubTab === 'overview' && (
        <div className="space-y-6">
          {/* Seasonal Health Alert Banner */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {SEASONAL_HEALTH_ALERTS.map((alert, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-gradient-to-tr from-slate-900 via-slate-900 to-emerald-950/40 border border-slate-800 space-y-2 text-xs"
              >
                <div className="flex items-center gap-2">
                  <span className="text-xl">{alert.icon}</span>
                  <span className="font-bold text-white text-xs">{alert.title}</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  {alert.description}
                </p>
              </div>
            ))}
          </div>

          {/* Microplastics 101 Section */}
          <div className="p-6 rounded-3xl bg-slate-900/70 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">Microplastics & Human Biology 101</h3>
                <p className="text-xs text-slate-400">Routes of exposure and current public health consensus</p>
              </div>
              <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
                WHO & EFSA GROUNDED
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {MICROPLASTICS_101_DATA.map((item, i) => (
                <div
                  key={i}
                  className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">{item.title}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-teal-950 text-teal-300 border border-teal-500/30">
                      {item.evidence}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    {item.summary}
                  </p>
                  <div className="pt-2 border-t border-slate-800/80 text-[11px] text-emerald-300">
                    <strong>Mitigation:</strong> {item.actionTip}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Burning Plastic Warning Alert */}
          <div className="p-6 rounded-3xl bg-red-950/30 border border-red-500/40 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center shrink-0">
                <Flame className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">
                  {BURNING_PLASTIC_WARNING_DATA.headline}
                </h3>
                <p className="text-xs text-red-300/80">
                  Critical warning against open-air residential waste incineration
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {BURNING_PLASTIC_WARNING_DATA.toxicantsEmitted.map((tox, i) => (
                <div key={i} className="p-3 rounded-xl bg-slate-950/80 border border-red-500/20">
                  <div className="font-bold text-red-300">{tox.name}</div>
                  <p className="text-[11px] text-slate-300 mt-0.5">{tox.danger}</p>
                </div>
              ))}
            </div>

            <p className="text-xs text-slate-300 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
              💡 <strong>Community Guideline:</strong> {BURNING_PLASTIC_WARNING_DATA.communityAdvise}
            </p>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: KITCHEN & FOOD SAFETY GUIDE */}
      {activeSubTab === 'kitchen' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-slate-900/70 border border-slate-800 space-y-4">
            <div>
              <h3 className="text-base font-bold text-white">Kitchen & Culinary Food Safety Rules</h3>
              <p className="text-xs text-slate-400">
                Evidence-based Do's and Don'ts to prevent chemical migration and nano-plastic leaching into meals.
              </p>
            </div>

            <div className="space-y-4">
              {KITCHEN_FOOD_SAFETY_GUIDE.map((rule, idx) => (
                <div
                  key={idx}
                  className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <Thermometer className="w-4 h-4 text-emerald-400" />
                      {rule.rule}
                    </h4>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                      {rule.severity} Priority
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                    <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/20 text-slate-200">
                      <div className="font-bold text-emerald-400 flex items-center gap-1.5 mb-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>DO:</span>
                      </div>
                      <p className="text-[11px] leading-relaxed">{rule.doTip}</p>
                    </div>

                    <div className="p-3 rounded-xl bg-red-950/20 border border-red-500/20 text-slate-200">
                      <div className="font-bold text-red-400 flex items-center gap-1.5 mb-1">
                        <XCircle className="w-3.5 h-3.5" />
                        <span>DON'T:</span>
                      </div>
                      <p className="text-[11px] leading-relaxed">{rule.dontTip}</p>
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-400 pt-1">
                    🔬 <strong>Why Science Says So:</strong> {rule.why}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: HIDDEN PLASTICS EXPLAINER */}
      {activeSubTab === 'hidden' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-slate-900/70 border border-slate-800 space-y-4">
            <div>
              <h3 className="text-base font-bold text-white">Hidden Plastics in Everyday Life</h3>
              <p className="text-xs text-slate-400">
                Unsuspected synthetic polymers in everyday consumer goods and non-toxic substitutes.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {HIDDEN_PLASTICS_DATA.map((item, i) => (
                <div
                  key={i}
                  className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 text-xs"
                >
                  <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                    <h4 className="text-sm font-bold text-white">{item.item}</h4>
                    <span className="font-mono text-[10px] text-amber-400">Hidden Polymer</span>
                  </div>

                  <div>
                    <span className="text-slate-400 text-[10px] block">Constituent:</span>
                    <span className="font-mono text-emerald-300 font-semibold">{item.hiddenPolymer}</span>
                  </div>

                  <p className="text-[11px] text-slate-300 leading-relaxed bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                    {item.impact}
                  </p>

                  <div className="pt-1 text-[11px] text-teal-300">
                    <strong>Safer Alternative:</strong> {item.saferAlternative}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 4: PERSONAL EXPOSURE QUIZ (10-Q) */}
      {activeSubTab === 'quiz' && (
        <div className="p-6 rounded-3xl bg-slate-900/70 border border-slate-800 space-y-6">
          <div>
            <h3 className="text-base font-bold text-white">Personal Plastic Exposure Check (10 Questions)</h3>
            <p className="text-xs text-slate-400">
              Audit your everyday habits and receive an evidence-based reduction target and safer-swap shopping list.
            </p>
          </div>

          <form onSubmit={handleCalculateScore} className="space-y-4">
            {QUIZ_QUESTIONS.map((q) => {
              const selectedIdx = quizAnswers[q.id] !== undefined ? quizAnswers[q.id] : -1;
              return (
                <div
                  key={q.id}
                  className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5 text-xs"
                >
                  <div className="font-bold text-white">
                    {q.id}. {q.text}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {q.options.map((opt, optIdx) => (
                      <button
                        type="button"
                        key={optIdx}
                        onClick={() => handleSelectQuizOption(q.id, optIdx)}
                        className={`p-2.5 rounded-xl text-left transition text-[11px] ${
                          selectedIdx === optIdx
                            ? 'bg-emerald-500 text-slate-950 font-bold border border-emerald-400 shadow'
                            : 'bg-slate-900 hover:bg-slate-850 text-slate-300 border border-slate-800'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}

            <div className="pt-2 flex justify-center">
              <button
                type="submit"
                className="px-8 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-lime-400 text-slate-950 font-bold text-xs shadow-lg transition"
              >
                Calculate My Exposure Habit Score
              </button>
            </div>
          </form>

          {/* Quiz Results Card */}
          {plasticExposureScore && (
            <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-emerald-950/40 to-slate-900 border border-emerald-500/40 space-y-4 animate-fadeIn">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] font-mono uppercase text-emerald-400 font-bold">
                    Audit Result
                  </span>
                  <h3 className="text-xl font-display font-extrabold text-white">
                    Your Plastic Exposure Habit Score: {plasticExposureScore.score} / 100
                  </h3>
                  <div className="text-xs text-slate-300">Classification: <strong>{plasticExposureScore.tier}</strong></div>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-right">
                  <span className="text-[10px] text-slate-400">Weekly Target</span>
                  <div className="text-sm font-mono font-bold text-teal-300">{plasticExposureScore.weeklyReductionTarget}</div>
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <div className="font-semibold text-white">Top 3 High-Impact Habits to Change First:</div>
                <div className="space-y-1.5">
                  {plasticExposureScore.topHabitsToChange.map((h, i) => (
                    <div key={i} className="flex items-center gap-2 p-2 rounded-xl bg-slate-950/80 text-slate-200">
                      <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-mono font-bold text-[10px]">
                        {i + 1}
                      </span>
                      <span>{h}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5 text-xs pt-2">
                <span className="font-semibold text-slate-400">Recommended Safer Swap Shopping List:</span>
                <div className="flex flex-wrap gap-2">
                  {plasticExposureScore.saferSwapShoppingList.map((item, idx) => (
                    <span key={idx} className="px-2.5 py-1 rounded-lg bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 font-mono text-[11px]">
                      🛒 {item}
                    </span>
                  ))}
                </div>
              </div>

              <p className="text-[10px] text-slate-500 italic pt-1">
                * Note: This habit score evaluates lifestyle touchpoints and is not a medical diagnosis.
              </p>
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 5: SAFE SWAPS CHALLENGE */}
      {activeSubTab === 'swaps' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-slate-900/70 border border-slate-800 space-y-4">
            <div>
              <h3 className="text-base font-bold text-white">Safe Swap Challenge</h3>
              <p className="text-xs text-slate-400">
                Commit to replacing one single-use plastic habit with an affordable non-toxic alternative. Earn points and unlock the "Glass Guardian" badge.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {safeSwaps.map((swap) => (
                <div
                  key={swap.id}
                  className={`p-5 rounded-3xl border transition flex flex-col justify-between space-y-3 ${
                    swap.completed
                      ? 'bg-emerald-950/30 border-emerald-500/40'
                      : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-slate-900 text-slate-300">
                        {swap.category}
                      </span>
                      <span className="font-mono text-emerald-400 font-bold">+{swap.points} XP</span>
                    </div>

                    <h4 className="text-sm font-bold text-white">{swap.title}</h4>

                    <div className="space-y-1 text-slate-300 text-[11px]">
                      <div><strong>Current Habit:</strong> {swap.currentHabit}</div>
                      <div><strong>Safer Swap:</strong> <span className="text-emerald-300 font-semibold">{swap.swapTo}</span></div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 p-2 rounded-xl bg-slate-900 text-[10px] text-slate-400">
                      <div>Approx Cost: <strong className="text-white">{swap.estimatedCost}</strong></div>
                      <div>Saves/Year: <strong className="text-emerald-400">{swap.yearlyPlasticSavedKg} kg / {swap.yearlyMoneySaved}</strong></div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => toggleSwapChallenge(swap.id)}
                    className={`w-full py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                      swap.completed
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                        : 'bg-slate-800 hover:bg-slate-700 text-white'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{swap.completed ? 'Challenge Completed! (+XP)' : 'Commit to This Swap'}</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 6: VULNERABLE GROUPS & SHAREABLE INFOGRAPHICS */}
      {activeSubTab === 'vulnerable' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-slate-900/70 border border-slate-800 space-y-4">
            <div>
              <h3 className="text-base font-bold text-white">Guidelines for Vulnerable Populations</h3>
              <p className="text-xs text-slate-400">
                Special precautions for infants, pregnant mothers, and individuals with cardiac health concerns.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {VULNERABLE_GROUPS_DATA.map((vg, i) => (
                <div key={i} className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5 text-xs">
                  <div className="flex items-center gap-2">
                    <Baby className="w-4 h-4 text-emerald-400" />
                    <span className="font-bold text-white text-sm">{vg.group}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    <strong>Sensitivity:</strong> {vg.vulnerability}
                  </p>
                  <div className="pt-2 border-t border-slate-800/80 text-[11px] text-emerald-300">
                    <strong>Key Action:</strong> {vg.keyAction}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Shareable Community Infographic Cards */}
          <div className="p-6 rounded-3xl bg-slate-900/70 border border-slate-800 space-y-4">
            <div>
              <h3 className="text-base font-bold text-white">Community Awareness Infographic Cards</h3>
              <p className="text-xs text-slate-400">One-click copy and share for WhatsApp, neighborhood groups, and schools.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-white">3 Things to Never Do With Plastic Containers</h4>
                  <button
                    onClick={() => handleShareInfographic('3 Things to Never Do With Plastic', '1. Never microwave food in takeout tubs. 2. Never pour boiling tea/chai into plastic cups. 3. Never drink water left in hot sun.')}
                    className="p-1 rounded bg-slate-800 text-slate-300 hover:text-white"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <ul className="list-disc list-inside space-y-1 text-slate-300 text-[11px]">
                  <li>Never microwave meals inside plastic takeout tubs.</li>
                  <li>Never pour boiling tea or coffee into thin plastic cups.</li>
                  <li>Never drink water from bottles left inside warm parked cars.</li>
                </ul>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-white">The Zero-Burn Community Protocol</h4>
                  <button
                    onClick={() => handleShareInfographic('Zero-Burn Protocol', 'Burning plastic releases Group 1 carcinogenic dioxins & toxic soot. Segregate clean plastic for collection points.')}
                    className="p-1 rounded bg-slate-800 text-slate-300 hover:text-white"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  Burning plastic releases chlorinated dioxins and black carbon that triggers severe respiratory illness. Always segregate into collection bins!
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
