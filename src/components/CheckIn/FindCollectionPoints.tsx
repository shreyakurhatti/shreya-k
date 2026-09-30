import React, { useState } from 'react';
import {
  MapPin,
  Filter,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  QrCode,
  Flame,
  Scale,
  Award,
  TreePine,
  Zap,
  Smartphone,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { useEco } from '../../context/EcoContext';
import { CollectionPoint } from '../../types/plastic';

export const FindCollectionPoints: React.FC = () => {
  const {
    collectionPoints,
    recyclingActivities,
    totalRecycledKg,
    verifiedDropoffs,
    streakDays,
    setQrModalOpen,
    setActiveCheckInPoint,
    locationRegion,
  } = useEco();

  const [selectedMaterial, setSelectedMaterial] = useState<string>('All');
  const [openNowOnly, setOpenNowOnly] = useState<boolean>(false);
  const [selectedType, setSelectedType] = useState<string>('All');

  const MATERIALS = ['All', 'PET (#1)', 'HDPE (#2)', 'PP (#5)', 'LDPE (#4)'];
  const TYPES = ['All', 'kiosk', 'recycler', 'bin', 'school', 'society'];

  const filteredPoints = collectionPoints.filter((cp) => {
    if (selectedMaterial !== 'All') {
      const match = cp.acceptedMaterials.some((m) => m.includes(selectedMaterial.split(' ')[0]));
      if (!match) return false;
    }
    if (selectedType !== 'All' && cp.type !== selectedType) {
      return false;
    }
    if (openNowOnly && cp.status !== 'active') {
      return false;
    }
    return true;
  });

  // Calculate environmental equivalents
  const treesSaved = (totalRecycledKg * 0.08).toFixed(1);
  const bottlesDiverted = Math.round(totalRecycledKg * 40);
  const smartphoneCharges = Math.round(totalRecycledKg * 110);

  const handleCheckInAtPoint = (point: CollectionPoint) => {
    setActiveCheckInPoint(point);
    setQrModalOpen(true);
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-slate-900/80 border border-emerald-500/30 backdrop-blur-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
            <QrCode className="w-3.5 h-3.5 text-lime-400" />
            <span>Verified Collection Points & Drop-off Network</span>
          </div>
          <h2 className="text-2xl font-display font-extrabold text-white">
            Find Nearby Collection Points
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
            Locate smart kiosks, community school bins, and certified recyclers. Scan the QR code at drop-off to mint verified carbon credits and earn weekly streaks.
          </p>
        </div>

        <button
          onClick={() => {
            setActiveCheckInPoint(null);
            setQrModalOpen(true);
          }}
          className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-lime-400 hover:from-emerald-400 hover:to-lime-300 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/25 transition active:scale-95 shrink-0"
        >
          <QrCode className="w-4 h-4 stroke-[2.5]" />
          <span>Scan QR Check-In Now</span>
        </button>
      </div>

      {/* Personal Recycling Journey Overview Bar */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-emerald-950/40 to-slate-900 border border-emerald-500/30">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-1">
            <span className="text-[11px] font-mono text-emerald-400 font-bold uppercase">
              Your Verified Impact Journey
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-display font-extrabold text-white">
                {totalRecycledKg} <span className="text-sm font-sans text-emerald-400">kg</span>
              </span>
              <span className="text-xs text-slate-400">
                across {verifiedDropoffs} verified drop-offs
              </span>
            </div>
          </div>

          {/* Equivalents Cards */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 text-center">
              <TreePine className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
              <div className="font-mono text-sm font-bold text-white">{treesSaved}</div>
              <div className="text-[10px] text-slate-400">Tree-Years Saved</div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 text-center">
              <Scale className="w-5 h-5 text-teal-400 mx-auto mb-1" />
              <div className="font-mono text-sm font-bold text-white">{bottlesDiverted}</div>
              <div className="text-[10px] text-slate-400">Bottles Diverted</div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 text-center">
              <Smartphone className="w-5 h-5 text-lime-400 mx-auto mb-1" />
              <div className="font-mono text-sm font-bold text-white">{smartphoneCharges}</div>
              <div className="text-[10px] text-slate-400">Phone Charges Eq.</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-slate-400 font-semibold flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" />
            Accepted Material:
          </span>
          {MATERIALS.map((mat) => (
            <button
              key={mat}
              onClick={() => setSelectedMaterial(mat)}
              className={`px-2.5 py-1 rounded-lg transition font-medium ${
                selectedMaterial === mat
                  ? 'bg-emerald-500 text-slate-950 font-bold'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {mat}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-1.5 cursor-pointer text-slate-300">
            <input
              type="checkbox"
              checked={openNowOnly}
              onChange={(e) => setOpenNowOnly(e.target.checked)}
              className="accent-emerald-500 rounded"
            />
            <span>Open & Ready Only</span>
          </label>
        </div>
      </div>

      {/* Collection Points Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredPoints.map((cp) => {
          const isFull = cp.fillLevelPercent >= 90;
          return (
            <div
              key={cp.id}
              className={`p-5 rounded-3xl border transition flex flex-col justify-between space-y-4 ${
                isFull
                  ? 'bg-slate-950/50 border-red-500/30'
                  : 'bg-slate-900/70 border-slate-800 hover:border-emerald-500/40 shadow-xl'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2 text-xs">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-slate-950 border border-slate-800 text-emerald-400">
                    {cp.type} • {cp.city}
                  </span>

                  <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                    isFull
                      ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                      : cp.status === 'active'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                      : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                  }`}>
                    {isFull ? '100% Full' : cp.status === 'active' ? 'Active' : cp.status}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-white leading-snug">{cp.name}</h3>
                  <p className="text-xs text-slate-400 flex items-start gap-1 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{cp.address}</span>
                  </p>
                </div>

                {/* Fill Level Meter */}
                <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-1.5 text-xs">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-400">Current Capacity:</span>
                    <span className="font-mono font-bold text-slate-200">{cp.fillLevelPercent}%</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        cp.fillLevelPercent > 80
                          ? 'bg-red-400'
                          : cp.fillLevelPercent > 50
                          ? 'bg-amber-400'
                          : 'bg-emerald-400'
                      }`}
                      style={{ width: `${cp.fillLevelPercent}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>{cp.todayCheckInsCount || 0} drop-offs today</span>
                    <span>{cp.totalCollectedKg || 0} kg collected</span>
                  </div>
                </div>

                {/* Accepted Materials */}
                <div className="space-y-1.5 text-xs">
                  <span className="text-[11px] font-semibold text-slate-400">Accepted Materials:</span>
                  <div className="flex flex-wrap gap-1">
                    {cp.acceptedMaterials.map((mat, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded bg-emerald-950/40 border border-emerald-500/20 text-emerald-300 text-[10px] font-mono"
                      >
                        ✓ {mat}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="text-[11px] text-slate-400 flex items-center gap-1 font-mono">
                  <Clock className="w-3 h-3 text-slate-500" />
                  <span>{cp.openingHours}</span>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => handleCheckInAtPoint(cp)}
                  disabled={isFull}
                  className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
                    isFull
                      ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-emerald-500 to-lime-400 hover:from-emerald-400 hover:to-lime-300 text-slate-950 shadow-md'
                  }`}
                >
                  <QrCode className="w-3.5 h-3.5" />
                  <span>{isFull ? 'Drop-off Bin Full' : 'Check In at this Point'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Verified Recycling Activities History Log */}
      <div className="p-6 rounded-3xl bg-slate-900/70 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white">Verified Activity Feed</h3>
            <p className="text-xs text-slate-400">Audited check-in receipts and tamper-proof log</p>
          </div>
          <span className="text-xs font-mono text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-500/30">
            {verifiedDropoffs} VERIFIED ENTRIES
          </span>
        </div>

        <div className="divide-y divide-slate-800 rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden">
          {recyclingActivities.map((act) => (
            <div
              key={act.id}
              className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">{act.cpName}</span>
                    <span className="px-2 py-0.2 rounded text-[10px] bg-emerald-500/10 text-emerald-400 font-mono font-bold border border-emerald-500/30">
                      VERIFIED
                    </span>
                  </div>
                  <div className="text-slate-400 text-[11px]">
                    {act.items.map((it) => `${it.plasticType} (${it.weightKg}kg)`).join(', ')}
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono">
                    ID: {act.id} • {new Date(act.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 sm:self-center">
                <div className="text-right">
                  <div className="text-sm font-mono font-bold text-emerald-400">
                    +{act.pointsAwarded} XP
                  </div>
                  <div className="text-[10px] font-mono text-teal-300">
                    +{act.carbonCreditsAwarded} kg CO₂
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
