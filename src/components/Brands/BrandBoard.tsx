import React, { useState } from 'react';
import {
  Building2,
  TrendingDown,
  Share2,
  Filter,
  ShieldAlert,
  Award,
  Globe,
  CheckCircle2,
} from 'lucide-react';
import { BRAND_LEADERBOARD } from '../../data/mockData';
import { useEco } from '../../context/EcoContext';

export const BrandBoard: React.FC = () => {
  const { scans } = useEco();

  const [selectedCity, setSelectedCity] = useState<string>('All');
  const [copiedBrand, setCopiedBrand] = useState<string | null>(null);

  const CITIES = ['All', 'Bengaluru', 'Seattle', 'Berlin', 'London', 'Delhi'];

  // Count user scanned brands to dynamically update leaderboard
  const userScannedBrands = scans
    .filter((s) => s.brandDetected && s.brandDetected !== 'Generic Beverage Bottler')
    .map((s) => s.brandDetected as string);

  const filteredBrands = BRAND_LEADERBOARD.filter((b) => {
    if (selectedCity === 'All') return true;
    return b.citiesTop.includes(selectedCity) || b.citiesTop.includes('All Cities');
  });

  const handleShareBrand = (brandName: string, pct: number) => {
    const text = `📢 Brand Accountability Alert: ${brandName} represents ${pct}% of uncollected plastic audits in our community dataset. We demand 100% recyclable, deposit-return packaging! Via PlastiSense.`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedBrand(brandName);
      setTimeout(() => setCopiedBrand(null), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-slate-900/80 border border-emerald-500/30 backdrop-blur-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
            <Building2 className="w-3.5 h-3.5 text-lime-400" />
            <span>Producer Extended Responsibility (EPR) Audit</span>
          </div>
          <h2 className="text-2xl font-display font-extrabold text-white">
            Brand Accountability Leaderboard
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
            Tracking post-consumer plastic litter back to global conglomerates and regional manufacturers to enforce circular packaging mandates.
          </p>
        </div>

        {/* City Filter */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <span className="text-xs text-slate-400 flex items-center gap-1 shrink-0">
            <Filter className="w-3.5 h-3.5" />
            City:
          </span>
          {CITIES.map((c) => (
            <button
              key={c}
              onClick={() => setSelectedCity(c)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition shrink-0 ${
                selectedCity === c
                  ? 'bg-emerald-500 text-slate-950 font-bold'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Brand Rankings List */}
      <div className="divide-y divide-slate-800 rounded-3xl bg-slate-900/70 border border-slate-800 overflow-hidden shadow-xl">
        {filteredBrands.map((brand, idx) => (
          <div
            key={brand.id}
            className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-900/90 transition text-xs"
          >
            {/* Rank & Brand Info */}
            <div className="flex items-start gap-4">
              <span className={`w-8 h-8 rounded-xl flex items-center justify-center font-mono font-extrabold text-sm shrink-0 ${
                idx === 0
                  ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                  : idx === 1
                  ? 'bg-orange-500/20 text-orange-400 border border-orange-500/40'
                  : idx === 2
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                  : 'bg-slate-800 text-slate-400 border border-slate-700'
              }`}>
                #{idx + 1}
              </span>

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-white">{brand.brand}</h3>
                  <span className="text-[11px] text-slate-500 font-mono">({brand.parentCompany})</span>
                </div>
                <div className="text-slate-300">
                  Primary packaging: <strong className="text-emerald-300">{brand.primaryPackaging}</strong>
                </div>
                <div className="text-[11px] text-slate-400">
                  Top Audited Cities: {brand.citiesTop.join(', ')}
                </div>
              </div>
            </div>

            {/* Metrics & Share Action */}
            <div className="flex items-center gap-6 sm:self-center">
              <div className="text-right">
                <div className="text-[11px] text-slate-400">Audit Volume</div>
                <div className="text-base font-mono font-bold text-white">
                  {brand.itemCount.toLocaleString()} items ({brand.percentage}%)
                </div>
              </div>

              <div className="text-right">
                <div className="text-[11px] text-slate-400">Circularity Score</div>
                <div className="flex items-center gap-1.5 font-mono font-bold text-sm">
                  <span className={brand.circularityScore > 40 ? 'text-emerald-400' : 'text-amber-400'}>
                    {brand.circularityScore}/100
                  </span>
                </div>
              </div>

              <button
                onClick={() => handleShareBrand(brand.brand, brand.percentage)}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition shrink-0"
                title="Share accountability demand"
              >
                <Share2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>{copiedBrand === brand.brand ? 'Copied!' : 'Share Call'}</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
