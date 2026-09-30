import React from 'react';
import {
  Recycle,
  MapPin,
  QrCode,
  Wallet,
  BarChart3,
  Sparkles,
} from 'lucide-react';
import { useEco } from '../context/EcoContext';

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab, setQrModalOpen, highContrast } = useEco();

  return (
    <nav
      aria-label="Mobile Navigation"
      className={`fixed bottom-0 inset-x-0 z-40 border-t transition-colors pb-safe ${
        highContrast
          ? 'bg-black border-lime-400 text-white'
          : 'bg-slate-950/95 backdrop-blur-xl border-slate-800/90 text-slate-300 shadow-[0_-8px_30px_rgba(0,0,0,0.6)]'
      }`}
    >
      <div className="max-w-md mx-auto px-4 h-16 flex items-center justify-between relative">
        {/* Tab 1: Scanner */}
        <button
          type="button"
          onClick={() => setActiveTab('scan')}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition ${
            activeTab === 'scan' ? 'text-emerald-400 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="relative">
            <Recycle className="w-5 h-5" />
            {activeTab === 'scan' && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-emerald-400" />
            )}
          </div>
          <span className="text-[10px] mt-1 font-medium">Scanner</span>
        </button>

        {/* Tab 2: Collection Points */}
        <button
          type="button"
          onClick={() => setActiveTab('checkin')}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition ${
            activeTab === 'checkin' ? 'text-emerald-400 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="relative">
            <MapPin className="w-5 h-5" />
            {activeTab === 'checkin' && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-emerald-400" />
            )}
          </div>
          <span className="text-[10px] mt-1 font-medium">Points</span>
        </button>

        {/* Prominent Centre Action: SCAN QR DROP-OFF */}
        <div className="flex-1 flex flex-col items-center justify-center relative -top-3">
          <button
            type="button"
            onClick={() => setQrModalOpen(true)}
            className="group relative w-13 h-13 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-400 to-lime-400 p-[2px] shadow-xl shadow-emerald-500/40 hover:scale-105 active:scale-95 transition-all focus:outline-none focus:ring-2 focus:ring-emerald-400"
            title="Scan Collection Point QR Code to Record Verified Drop-Off"
            aria-label="Scan QR Code"
          >
            {/* Animated pulsating ring */}
            <span className="absolute inset-0 rounded-2xl bg-emerald-400/40 animate-ping opacity-75 group-hover:opacity-100" />
            <div className="relative w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center group-hover:bg-transparent transition-colors">
              <QrCode className="w-6 h-6 text-emerald-400 group-hover:text-slate-950 stroke-[2.2] transition-colors" />
            </div>
          </button>
          <span className="text-[10px] font-display font-bold text-emerald-300 mt-1 tracking-tight">
            Scan QR
          </span>
        </div>

        {/* Tab 4: Carbon Wallet */}
        <button
          type="button"
          onClick={() => setActiveTab('wallet')}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition ${
            activeTab === 'wallet' ? 'text-emerald-400 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="relative">
            <Wallet className="w-5 h-5" />
            {activeTab === 'wallet' && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-emerald-400" />
            )}
          </div>
          <span className="text-[10px] mt-1 font-medium">Wallet</span>
        </button>

        {/* Tab 5: Impact Dashboard */}
        <button
          type="button"
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition ${
            activeTab === 'dashboard' ? 'text-emerald-400 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="relative">
            <BarChart3 className="w-5 h-5" />
            {activeTab === 'dashboard' && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-emerald-400" />
            )}
          </div>
          <span className="text-[10px] mt-1 font-medium">Impact</span>
        </button>
      </div>
    </nav>
  );
};
