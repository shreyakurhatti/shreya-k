import React, { useState } from 'react';
import {
  Wallet,
  Leaf,
  Gift,
  ArrowUpRight,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  QrCode,
  ShieldCheck,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { useEco } from '../../context/EcoContext';
import { CARBON_REWARDS } from '../../data/mockData';

export const CarbonWallet: React.FC = () => {
  const { carbonCreditsKg, redeemReward, verifiedDropoffs, totalRecycledKg, setQrModalOpen } = useEco();

  const [redeemedCode, setRedeemedCode] = useState<{ title: string; code: string } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Monthly Sequestration History Data
  const monthlyData = [
    { month: 'Apr', credits: 1.8 },
    { month: 'May', credits: 2.6 },
    { month: 'Jun', credits: 3.2 },
    { month: 'Jul', credits: 4.1 },
    { month: 'Aug', credits: 3.8 },
    { month: 'Sep', credits: carbonCreditsKg },
  ];

  const handleRedeem = (cost: number, title: string) => {
    setErrorMessage(null);
    const success = redeemReward(cost, title);
    if (success) {
      setRedeemedCode({
        title,
        code: `PLASTI-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      });
    } else {
      setErrorMessage(`Insufficient carbon credits. You need ${cost} kg CO₂e to redeem "${title}".`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Wallet Balance Hero Card */}
      <div className="p-8 rounded-3xl bg-gradient-to-tr from-slate-900 via-slate-900 to-teal-950 border border-teal-500/30 backdrop-blur-xl relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-300 text-xs font-semibold">
              <Leaf className="w-3.5 h-3.5 text-teal-400" />
              <span>Decentralized Voluntary Carbon Account</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-display font-extrabold text-white">
              {carbonCreditsKg} <span className="text-lg font-sans font-medium text-teal-300">kg CO₂e</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-md">
              Earned by verifying plastic segregation, bottle flattening, and zero-waste upcycling projects.
            </p>
          </div>

          <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 space-y-2 shrink-0 text-xs">
            <div className="flex items-center justify-between gap-4">
              <span className="text-slate-400">Verified Drop-Offs</span>
              <strong className="text-emerald-400 font-mono font-bold">{verifiedDropoffs} Drops ({totalRecycledKg} kg)</strong>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-slate-400">Equivalent Trees</span>
              <strong className="text-white font-mono font-bold">{(carbonCreditsKg * 0.12).toFixed(1)} Tree-Years</strong>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-slate-400">Verification Status</span>
              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Audited
              </span>
            </div>
            <button
              onClick={() => setQrModalOpen(true)}
              className="w-full mt-2 py-1.5 px-3 rounded-xl bg-gradient-to-r from-emerald-500 to-lime-400 hover:from-emerald-400 hover:to-lime-300 text-slate-950 font-bold text-xs shadow transition flex items-center justify-center gap-1.5"
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>Scan QR to Deposit</span>
            </button>
          </div>
        </div>
      </div>

      {/* Monthly Accumulation Chart */}
      <div className="p-6 rounded-3xl bg-slate-900/70 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white">Monthly Carbon Offset Velocity</h3>
            <p className="text-[11px] text-slate-400">Kilograms of carbon prevented from atmospheric release</p>
          </div>
          <span className="text-xs font-mono text-teal-400 bg-teal-950/60 px-2.5 py-1 rounded-full border border-teal-500/30 font-bold">
            +24% MONTH-OVER-MONTH
          </span>
        </div>

        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="month" stroke="#64748b" fontSize={11} />
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
              <Bar dataKey="credits" name="Offset kg CO2e" fill="#14b8a6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Redeem Eco Rewards Section */}
      <div className="p-6 rounded-3xl bg-slate-900/70 border border-slate-800 space-y-5">
        <div>
          <div className="flex items-center gap-2">
            <Gift className="w-4 h-4 text-emerald-400" />
            <h3 className="text-base font-bold text-white">Redeem Ecological Rewards</h3>
          </div>
          <p className="text-xs text-slate-400">
            Convert your earned carbon credits into real environmental sponsorships and merchant discounts
          </p>
        </div>

        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-red-950/60 border border-red-500/40 text-red-200 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {redeemedCode && (
          <div className="p-4 rounded-2xl bg-emerald-950/80 border border-emerald-500/40 text-xs space-y-1.5 animate-fadeIn">
            <div className="flex items-center gap-2 text-emerald-300 font-bold">
              <Sparkles className="w-4 h-4 text-lime-400" />
              <span>Reward Claimed: {redeemedCode.title}!</span>
            </div>
            <p className="text-slate-300">
              Your redemption code: <strong className="font-mono text-white bg-slate-900 px-2 py-0.5 rounded border border-emerald-500/30">{redeemedCode.code}</strong>
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {CARBON_REWARDS.map((rew) => {
            const canAfford = carbonCreditsKg >= rew.costKgCo2;
            return (
              <div
                key={rew.id}
                className="p-5 rounded-3xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between space-y-4 hover:border-emerald-500/40 transition"
              >
                <div className="space-y-2">
                  <div className="text-3xl mb-1">{rew.icon}</div>
                  <h4 className="text-sm font-bold text-white">{rew.title}</h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    {rew.description}
                  </p>
                  <div className="text-[10px] text-emerald-400 font-semibold pt-1">
                    Partner: {rew.partner}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-teal-300">
                    {rew.costKgCo2} kg CO₂
                  </span>

                  <button
                    onClick={() => handleRedeem(rew.costKgCo2, rew.title)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                      canAfford
                        ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md'
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    Redeem
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
