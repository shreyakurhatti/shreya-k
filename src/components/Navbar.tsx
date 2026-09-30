import React, { useState } from 'react';
import {
  Recycle,
  Sparkles,
  BarChart3,
  MapPin,
  Building2,
  Store,
  Wallet,
  Calculator,
  BookOpen,
  Info,
  Flame,
  Award,
  Globe,
  Sun,
  Moon,
  MessageSquare,
  Menu,
  X,
  ChevronDown,
  QrCode,
  HeartPulse,
  Building,
  CheckCircle2,
  Database,
} from 'lucide-react';
import { useEco } from '../context/EcoContext';
import { SupportedLanguage } from '../types/plastic';
import { MongoStatusModal } from './Database/MongoStatusModal';

export const Navbar: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    ecoPoints,
    carbonCreditsKg,
    streakDays,
    verifiedDropoffs,
    setQrModalOpen,
    language,
    setLanguage,
    locationRegion,
    setLocationRegion,
    highContrast,
    setHighContrast,
    setEcoBotOpen,
    t,
  } = useEco();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [regionMenuOpen, setRegionMenuOpen] = useState(false);
  const [mongoModalOpen, setMongoModalOpen] = useState(false);

  const CITIES = [
    'Bengaluru, India',
    'Seattle, USA',
    'Berlin, Germany',
    'London, UK',
    'Tokyo, Japan',
    'Delhi, India',
    'Global Standard',
  ];

  const NAV_ITEMS = [
    { id: 'scan', label: 'Scanner', icon: Recycle, highlight: true },
    { id: 'checkin', label: 'Collection Points', icon: QrCode },
    { id: 'health', label: 'Health Advisor', icon: HeartPulse },
    { id: 'upcycle', label: 'Upcycle Studio', icon: Sparkles },
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'hotspots', label: 'Hotspot Forecast', icon: MapPin },
    { id: 'brands', label: 'Brand Board', icon: Building2 },
    { id: 'marketplace', label: 'Waste Market', icon: Store },
    { id: 'operator', label: 'Operator Hub', icon: Building },
    { id: 'wallet', label: 'Carbon Wallet', icon: Wallet },
    { id: 'calculator', label: 'Footprint', icon: Calculator },
    { id: 'learn', label: 'Resin Guide', icon: BookOpen },
    { id: 'about', label: 'About', icon: Info },
  ];

  return (
    <header className={`sticky top-0 z-40 transition-colors duration-200 border-b ${
      highContrast 
        ? 'bg-black border-lime-400 text-white' 
        : 'bg-slate-950/85 backdrop-blur-xl border-emerald-950/80 text-slate-100 shadow-lg shadow-emerald-950/20'
    }`}>
      {/* Top Banner with Local Rules and Status */}
      <div className="bg-gradient-to-r from-emerald-950/80 via-teal-950/60 to-slate-950 border-b border-emerald-500/15 py-1 px-4 text-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 overflow-x-auto text-slate-300">
          <div className="flex items-center gap-2 shrink-0">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span className="text-emerald-400 font-medium">PlastiSense Circular Intelligence</span>
            <span className="text-slate-500 hidden sm:inline">|</span>
            <span className="text-slate-400 hidden sm:inline">
              Sorting logic attuned to: <strong className="text-emerald-300">{locationRegion}</strong>
            </span>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {/* Quick Region Selector Dropdown */}
            <div className="relative">
              <button
                onClick={() => setRegionMenuOpen(!regionMenuOpen)}
                className="flex items-center gap-1 text-slate-300 hover:text-emerald-300 px-2 py-0.5 rounded bg-slate-900/80 border border-slate-700/60 text-xs transition"
                title="Change active municipality for local waste segregation rules"
              >
                <Globe className="w-3 h-3 text-emerald-400" />
                <span className="truncate max-w-[130px]">{locationRegion.split(',')[0]}</span>
                <ChevronDown className="w-3 h-3" />
              </button>

              {regionMenuOpen && (
                <div className="absolute right-0 mt-1 w-48 py-1 bg-slate-900 border border-emerald-500/30 rounded-lg shadow-2xl z-50 text-xs">
                  <div className="px-3 py-1 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    Select Jurisdiction
                  </div>
                  {CITIES.map((c) => (
                    <button
                      key={c}
                      onClick={() => {
                        setLocationRegion(c);
                        setRegionMenuOpen(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 hover:bg-emerald-950/60 flex items-center justify-between ${
                        locationRegion === c ? 'text-emerald-400 font-semibold' : 'text-slate-300'
                      }`}
                    >
                      {c}
                      {locationRegion === c && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Language Switcher */}
            <div className="flex items-center gap-1 bg-slate-900/80 border border-slate-700/60 rounded px-1.5 py-0.5 text-xs">
              <button
                onClick={() => setLanguage('en')}
                className={`px-1.5 py-0.5 rounded ${language === 'en' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'}`}
              >
                EN
              </button>
              <button
                onClick={() => setLanguage('kn')}
                className={`px-1.5 py-0.5 rounded ${language === 'kn' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'}`}
                title="Kannada"
              >
                ಕನ್ನಡ
              </button>
              <button
                onClick={() => setLanguage('hi')}
                className={`px-1.5 py-0.5 rounded ${language === 'hi' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'}`}
                title="Hindi"
              >
                हिन्दी
              </button>
            </div>

            {/* MongoDB Atlas Database Pill */}
            <button
              onClick={() => setMongoModalOpen(true)}
              className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-900/80 border border-emerald-500/30 hover:border-emerald-400 text-slate-300 hover:text-emerald-300 text-xs transition"
              title="MongoDB Atlas Database Status (cluster0 / plastisense)"
            >
              <Database className="w-3 h-3 text-emerald-400" />
              <span className="hidden sm:inline font-mono text-[11px]">MongoDB</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </button>

            {/* High Contrast Toggle */}
            <button
              onClick={() => setHighContrast(!highContrast)}
              className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition"
              title="Toggle High Contrast Mode"
              aria-label="Toggle High Contrast"
            >
              {highContrast ? <Sun className="w-3.5 h-3.5 text-yellow-300" /> : <Moon className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <div 
          onClick={() => setActiveTab('scan')} 
          className="flex items-center gap-2.5 cursor-pointer group shrink-0"
        >
          <div className="relative w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-lime-400 p-[1.5px] shadow-lg shadow-emerald-500/20 group-hover:shadow-emerald-400/40 transition">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Recycle className="w-5 h-5 text-emerald-400 group-hover:rotate-180 transition-transform duration-700" />
            </div>
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-lime-400 rounded-full border-2 border-slate-950"></span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-display font-extrabold text-lg tracking-tight bg-gradient-to-r from-emerald-400 via-teal-300 to-lime-300 bg-clip-text text-transparent">
                PlastiSense
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-950 border border-emerald-500/30 text-emerald-400 font-semibold uppercase">
                AI Vision
              </span>
            </div>
            <p className="text-[10px] text-slate-400 -mt-0.5 hidden sm:block">
              Intelligent Plastic Waste & Circular Action
            </p>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1 overflow-x-auto py-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0 ${
                  isActive
                    ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/40 shadow-sm shadow-emerald-500/10'
                    : 'text-slate-300 hover:text-white hover:bg-slate-900 border border-transparent'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
                {item.highlight && (
                  <span className="w-1.5 h-1.5 rounded-full bg-lime-400 animate-pulse"></span>
                )}
              </button>
            );
          })}
        </nav>

        {/* User Impact Badges & Action CTAs */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Prominent Scan QR Check-In Action Button */}
          <button
            onClick={() => setQrModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-400 to-lime-400 hover:from-emerald-400 hover:to-lime-300 text-slate-950 font-extrabold text-xs shadow-md shadow-emerald-500/20 active:scale-95 transition"
            title="Scan QR at Collection Point to record verified drop-off"
          >
            <QrCode className="w-3.5 h-3.5 stroke-[2.5]" />
            <span className="font-display">Scan QR</span>
          </button>

          {/* Verified Drop-offs Count */}
          <div
            className="hidden md:flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/25 px-2 py-1 rounded-lg text-emerald-400 text-xs font-semibold cursor-pointer hover:bg-emerald-500/20 transition"
            title={`${verifiedDropoffs} verified drop-offs recorded`}
            onClick={() => setActiveTab('checkin')}
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>{verifiedDropoffs} Drops</span>
          </div>

          {/* Streak Indicator */}
          <div 
            className="flex items-center gap-1 bg-amber-500/10 border border-amber-500/25 px-2 py-1 rounded-lg text-amber-400 text-xs font-semibold cursor-pointer"
            title={`${streakDays} days active recycling streak!`}
            onClick={() => setActiveTab('dashboard')}
          >
            <Flame className="w-3.5 h-3.5 fill-amber-400 animate-bounce" />
            <span>{streakDays}d</span>
          </div>

          {/* Eco Points XP */}
          <div 
            className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/25 px-2.5 py-1 rounded-lg text-emerald-300 text-xs font-semibold cursor-pointer hover:bg-emerald-500/20 transition"
            title="Total Eco Points earned"
            onClick={() => setActiveTab('dashboard')}
          >
            <Award className="w-3.5 h-3.5 text-emerald-400" />
            <span>{ecoPoints} XP</span>
          </div>

          {/* Carbon Wallet Pill */}
          <div 
            className="hidden sm:flex items-center gap-1 bg-teal-500/10 border border-teal-500/25 px-2.5 py-1 rounded-lg text-teal-300 text-xs font-semibold cursor-pointer hover:bg-teal-500/20 transition"
            title="Carbon Offset Wallet"
            onClick={() => setActiveTab('wallet')}
          >
            <Wallet className="w-3.5 h-3.5 text-teal-400" />
            <span>{carbonCreditsKg} kg CO₂</span>
          </div>

          {/* Ask EcoBot Floating Trigger */}
          <button
            onClick={() => setEcoBotOpen(true)}
            className="flex items-center gap-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-slate-950 font-bold px-3 py-1.5 rounded-lg text-xs transition shadow-md shadow-emerald-600/25"
            title="Ask EcoBot AI about recycling or health risks"
          >
            <MessageSquare className="w-3.5 h-3.5 fill-slate-950" />
            <span className="hidden md:inline">EcoBot</span>
          </button>

          {/* Mobile Menu Hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-1.5 text-slate-300 hover:text-white hover:bg-slate-900 rounded-lg border border-slate-800"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden px-4 py-3 border-t border-emerald-950 bg-slate-950/95 space-y-1">
          <div className="grid grid-cols-2 gap-2 pb-2">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition ${
                    isActive
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'text-slate-300 hover:bg-slate-900'
                  }`}
                >
                  <Icon className="w-4 h-4 text-emerald-400" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>Location: <strong className="text-emerald-400">{locationRegion}</strong></span>
            <span>Carbon: <strong className="text-teal-400">{carbonCreditsKg} kg CO₂</strong></span>
          </div>
        </div>
      )}

      {/* MongoDB Atlas Status & Configuration Diagnostics Modal */}
      <MongoStatusModal
        isOpen={mongoModalOpen}
        onClose={() => setMongoModalOpen(false)}
      />
    </header>
  );
};
