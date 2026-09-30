import React, { useState } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  AreaChart,
  Area,
  CartesianGrid,
} from 'recharts';
import {
  Award,
  Flame,
  Leaf,
  Recycle,
  Sparkles,
  Download,
  Share2,
  Calendar,
  CheckCircle2,
  TrendingUp,
  QrCode,
  ShieldCheck,
  MapPin,
  Clock,
} from 'lucide-react';
import { useEco } from '../../context/EcoContext';
import { ScanResult } from '../../types/plastic';

export const ImpactDashboard: React.FC = () => {
  const {
    scans,
    ecoPoints,
    carbonCreditsKg,
    streakDays,
    badges,
    setActiveScan,
    setActiveTab,
    recyclingActivities,
    verifiedDropoffs,
    totalRecycledKg,
    setQrModalOpen,
  } = useEco();

  const [reportCopied, setReportCopied] = useState(false);
  const [historyTab, setHistoryTab] = useState<'scans' | 'dropoffs'>('dropoffs');

  // Compute breakdown by polymer
  const polymerCounts: { [key: string]: number } = {
    PET: 0,
    HDPE: 0,
    PVC: 0,
    LDPE: 0,
    PP: 0,
    PS: 0,
    OTHER: 0,
  };

  scans.forEach((s) => {
    const key = s.polymerShort || 'PET';
    if (polymerCounts[key] !== undefined) {
      polymerCounts[key]++;
    } else {
      polymerCounts.OTHER++;
    }
  });

  const pieData = Object.entries(polymerCounts)
    .filter(([_, val]) => val > 0)
    .map(([name, value]) => ({ name, value }));

  // Color palette for polymers
  const POLYMER_COLORS: { [key: string]: string } = {
    PET: '#0ea5e9',
    HDPE: '#10b981',
    PVC: '#ef4444',
    LDPE: '#f59e0b',
    PP: '#8b5cf6',
    PS: '#f43f5e',
    OTHER: '#14b8a6',
  };

  // Simulated Weekly Progress Data
  const weeklyTrendData = [
    { day: 'Mon', items: 2, co2: 0.32, points: 150 },
    { day: 'Tue', items: 4, co2: 0.65, points: 280 },
    { day: 'Wed', items: 3, co2: 0.48, points: 210 },
    { day: 'Thu', items: 5, co2: 0.88, points: 350 },
    { day: 'Fri', items: 3, co2: 0.52, points: 220 },
    { day: 'Sat', items: 7, co2: 1.15, points: 490 },
    { day: 'Sun', items: scans.length, co2: carbonCreditsKg, points: ecoPoints },
  ];

  const totalKgDiverted = (scans.length * 0.045).toFixed(2);
  const ecoLevel = Math.floor(ecoPoints / 250) + 1;
  const nextLevelXp = ecoLevel * 250;
  const levelProgress = Math.min(100, Math.round(((ecoPoints % 250) / 250) * 100));

  const handleShareReport = () => {
    const text = `🌿 PlastiSense Circular Impact Report 🌿\nRank: Level ${ecoLevel} Eco Guardian\nScans: ${scans.length} items analyzed\nPlastic Diverted: ${totalKgDiverted} kg\nCO2 Sequestered: ${carbonCreditsKg} kg CO2e\nActive Streak: ${streakDays} days!`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setReportCopied(true);
      setTimeout(() => setReportCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Level Summary Banner */}
      <div className="p-6 rounded-3xl bg-slate-900/80 border border-emerald-500/30 backdrop-blur-xl relative overflow-hidden">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Level & XP */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-medium">Citizen Rank</span>
              <span className="font-mono text-emerald-400 font-bold">LVL {ecoLevel}</span>
            </div>
            <div className="text-2xl font-extrabold font-display text-white">
              {ecoPoints} <span className="text-xs text-slate-400 font-sans font-normal">XP</span>
            </div>
            <div className="space-y-1">
              <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-emerald-500 to-lime-400 h-full rounded-full transition-all duration-500"
                  style={{ width: `${levelProgress}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>Progress</span>
                <span>{nextLevelXp - ecoPoints} XP to Level {ecoLevel + 1}</span>
              </div>
            </div>
          </div>

          {/* Plastic Diverted */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-medium">Plastic Diverted</span>
              <Recycle className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-extrabold font-display text-emerald-400">
              {totalKgDiverted} <span className="text-xs text-slate-400 font-sans font-normal">kg</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Across {scans.length} verified post-consumer items
            </p>
          </div>

          {/* Carbon Wallet Balance */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-medium">Atmospheric CO₂ Avoided</span>
              <Leaf className="w-4 h-4 text-teal-400" />
            </div>
            <div className="text-2xl font-extrabold font-display text-teal-300">
              {carbonCreditsKg} <span className="text-xs text-slate-400 font-sans font-normal">kg CO₂e</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Equivalent to 19 km driven in electric vehicle
            </p>
          </div>

          {/* Active Streak */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-medium">Active Habit Streak</span>
              <Flame className="w-4 h-4 text-amber-400 animate-bounce" />
            </div>
            <div className="text-2xl font-extrabold font-display text-amber-400">
              {streakDays} <span className="text-xs text-slate-400 font-sans font-normal">Days</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Daily audits build high circular habits
            </p>
          </div>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Polymer Breakdown (Donut Chart) */}
        <div className="lg:col-span-5 p-6 rounded-3xl bg-slate-900/70 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">Scanned Polymers by Resin Code</h3>
              <p className="text-[11px] text-slate-400">Composition of audited household waste</p>
            </div>
            <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
              {scans.length} ITEMS
            </span>
          </div>

          <div className="h-60 w-full flex items-center justify-center">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={POLYMER_COLORS[entry.name] || '#10b981'}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#090d16',
                      borderColor: '#1e293b',
                      borderRadius: '12px',
                      color: '#f8fafc',
                      fontSize: '12px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-xs text-slate-500">No scan data yet</div>
            )}
          </div>

          {/* Polymer Legend */}
          <div className="flex flex-wrap gap-2 justify-center pt-2 border-t border-slate-800/80">
            {pieData.map((item) => (
              <div key={item.name} className="flex items-center gap-1.5 text-xs text-slate-300">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: POLYMER_COLORS[item.name] || '#10b981' }}
                />
                <span className="font-mono">{item.name}</span>
                <span className="text-slate-500">({item.value})</span>
              </div>
            ))}
          </div>
        </div>

        {/* Weekly Trend (Area / Bar Chart) */}
        <div className="lg:col-span-7 p-6 rounded-3xl bg-slate-900/70 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">Weekly Diversion & Carbon Trend</h3>
              <p className="text-[11px] text-slate-400">Carbon offset and audited plastic velocity</p>
            </div>
            <div className="flex items-center gap-1 text-xs text-emerald-400 font-semibold">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+38% vs Last Week</span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyTrendData}>
                <defs>
                  <linearGradient id="co2Grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="day" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#090d16',
                    borderColor: '#1e293b',
                    borderRadius: '12px',
                    color: '#f8fafc',
                    fontSize: '12px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="co2"
                  name="CO2 Avoided (kg)"
                  stroke="#10b981"
                  fillOpacity={1}
                  fill="url(#co2Grad)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Gamification Badges Section */}
      <div className="p-6 rounded-3xl bg-slate-900/70 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="text-sm font-bold text-white">Eco Achievement Badges</h3>
              <p className="text-[11px] text-slate-400">
                Unlock specialized accolades by verifying proper sorting and upcycling
              </p>
            </div>
          </div>
          <span className="text-xs font-mono text-amber-400 bg-amber-950/60 px-2.5 py-1 rounded-full border border-amber-500/30 font-bold">
            {badges.filter((b) => b.unlocked).length} OF {badges.length} UNLOCKED
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {badges.map((badge) => (
            <div
              key={badge.id}
              className={`p-3.5 rounded-2xl border text-center space-y-1.5 transition ${
                badge.unlocked
                  ? 'bg-slate-950/80 border-emerald-500/40 shadow-lg shadow-emerald-500/5'
                  : 'bg-slate-950/30 border-slate-800/80 opacity-50 grayscale'
              }`}
            >
              <div className="text-2xl mb-1">{badge.icon}</div>
              <div className="text-xs font-bold text-white truncate">{badge.name}</div>
              <p className="text-[10px] text-slate-400 line-clamp-2 leading-tight">
                {badge.description}
              </p>
              {badge.unlocked && badge.unlockedAt && (
                <div className="text-[9px] font-mono text-emerald-400 pt-1">
                  ✓ {badge.unlockedAt}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Shareable Impact Summary Card */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-950/80 via-teal-950/60 to-slate-950 border border-emerald-500/40 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-lime-400" />
            <span>Verified Circular Citizen Certificate</span>
          </div>
          <h3 className="text-xl font-display font-extrabold text-white">
            Download Your Personal Circular Impact Card
          </h3>
          <p className="text-xs text-slate-300 max-w-lg leading-relaxed">
            Share your waste diversion milestones with your workplace, university, or municipal council to promote zero-waste accountability.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={handleShareReport}
            className="flex items-center gap-2 px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs border border-slate-700 transition"
          >
            <Share2 className="w-4 h-4 text-emerald-400" />
            <span>{reportCopied ? 'Report Copied!' : 'Copy Summary'}</span>
          </button>

          <button
            onClick={() => {
              window.print();
            }}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-lime-400 hover:from-emerald-400 hover:to-lime-300 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/25 transition"
          >
            <Download className="w-4 h-4" />
            <span>Download PDF / Print</span>
          </button>
        </div>
      </div>

      {/* Unified History Log: Verified Drop-Offs & AI Scans */}
      <div className="p-6 rounded-3xl bg-slate-900/70 border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-white">Activity Log & Verification Ledger</h3>
            <p className="text-[11px] text-slate-400">Audited circular contributions and AI scans</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setHistoryTab('dropoffs')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
                historyTab === 'dropoffs'
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Verified Drop-Offs ({recyclingActivities.length})</span>
            </button>

            <button
              onClick={() => setHistoryTab('scans')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
                historyTab === 'scans'
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <Recycle className="w-3.5 h-3.5" />
              <span>AI Scans ({scans.length})</span>
            </button>
          </div>
        </div>

        {/* Tab 1: Verified Recycling Drop-offs */}
        {historyTab === 'dropoffs' && (
          <div className="space-y-3">
            {recyclingActivities.length === 0 ? (
              <div className="p-8 rounded-2xl bg-slate-950/60 border border-dashed border-slate-800 text-center space-y-2">
                <QrCode className="w-8 h-8 text-emerald-400 mx-auto opacity-70" />
                <p className="text-xs text-slate-300 font-semibold">No verified collection drop-offs yet</p>
                <p className="text-[11px] text-slate-500">Scan the QR code at your nearest collection point kiosk to earn verified credits.</p>
                <button
                  onClick={() => setQrModalOpen(true)}
                  className="mt-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition inline-flex items-center gap-1.5"
                >
                  <QrCode className="w-3.5 h-3.5" />
                  <span>Scan Collection QR Now</span>
                </button>
              </div>
            ) : (
              <div className="divide-y divide-slate-800/80 rounded-2xl bg-slate-950/70 border border-slate-800 overflow-hidden">
                {recyclingActivities.map((act) => (
                  <div key={act.id} className="p-4 hover:bg-slate-900/60 transition text-xs space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
                          <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-white text-sm">{act.cpName}</span>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                              <ShieldCheck className="w-3 h-3" /> VERIFIED RECYCLING ACTIVITY
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                            <span className="font-mono">ID: {act.id}</span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3 text-slate-500" />
                              {new Date(act.createdAt).toLocaleDateString()} at {new Date(act.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center shrink-0 font-mono">
                        <span className="px-2.5 py-1 rounded-xl bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 font-bold text-xs">
                          +{act.pointsAwarded} XP
                        </span>
                        <span className="px-2.5 py-1 rounded-xl bg-teal-950/60 border border-teal-500/30 text-teal-300 font-bold text-xs">
                          +{act.co2SavedKg} kg CO₂
                        </span>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-[11px]">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-slate-400">Deposited Items:</span>
                        {act.items.map((it, idx) => (
                          <span key={idx} className="font-mono text-slate-200 bg-slate-950 px-2 py-0.5 rounded border border-slate-700">
                            {it.plasticType} ({it.weightKg}kg)
                          </span>
                        ))}
                        <span className="font-bold text-emerald-400 font-mono">
                          Total: {act.totalWeightKg} kg
                        </span>
                      </div>

                      <div className="text-slate-400 text-[10px]">
                        AI Verification: <span className="text-slate-200">{act.aiVerification?.notes || 'Intake match confirmed'}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: AI Waste Scans */}
        {historyTab === 'scans' && (
          <div className="divide-y divide-slate-800/80 rounded-2xl bg-slate-950/70 border border-slate-800 overflow-hidden">
            {scans.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  setActiveScan(item);
                  setActiveTab('scan');
                }}
                className="p-3.5 flex items-center justify-between gap-4 hover:bg-slate-900/60 cursor-pointer transition text-xs"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 font-mono font-bold text-emerald-400 flex items-center justify-center shrink-0">
                    {item.resinSymbol || `♳`}
                  </span>
                  <div className="min-w-0">
                    <div className="font-bold text-white truncate">{item.itemName}</div>
                    <div className="text-[11px] text-slate-400 font-mono">
                      {item.plasticType} • {new Date(item.timestamp).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                    {item.recommendedAction}
                  </span>
                  <span className="text-slate-400 text-xs font-mono hidden sm:inline">
                    +{item.co2SavedKg}kg CO₂
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
