import React, { useEffect } from 'react';
import { EcoProvider, useEco } from './context/EcoContext';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { ScannerView } from './components/Scanner/ScannerView';
import { ScanResults } from './components/Scanner/ScanResults';
import { MultiItemBreakdown } from './components/Scanner/MultiItemBreakdown';
import { UpcycleStudio } from './components/Upcycle/UpcycleStudio';
import { ImpactDashboard } from './components/Dashboard/ImpactDashboard';
import { HotspotMap } from './components/Hotspots/HotspotMap';
import { BrandBoard } from './components/Brands/BrandBoard';
import { Marketplace } from './components/Marketplace/Marketplace';
import { CarbonWallet } from './components/Wallet/CarbonWallet';
import { FootprintCalculator } from './components/Calculator/FootprintCalculator';
import { ResinCodeGuide } from './components/Learn/ResinCodeGuide';
import { HowItWorks } from './components/About/HowItWorks';
import { HealthAdvisor } from './components/Health/HealthAdvisor';
import { FindCollectionPoints } from './components/CheckIn/FindCollectionPoints';
import { OperatorDashboard } from './components/CheckIn/OperatorDashboard';
import { QrCheckInModal } from './components/CheckIn/QrCheckInModal';
import { BottomNav } from './components/BottomNav';
import { EcoBotModal } from './components/EcoBot/EcoBotModal';
import { Recycle, Globe, MessageSquare } from 'lucide-react';
import { validateQrToken } from './services/collectionPointService';

const AppContent: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    activeScan,
    highContrast,
    setEcoBotOpen,
    locationRegion,
    setQrModalOpen,
    setActiveCheckInPoint,
  } = useEco();

  // Check for deep link /cp/<collectionPointId> or token in URL
  useEffect(() => {
    const path = window.location.pathname;
    const search = window.location.search;
    if (path.includes('/cp/')) {
      const match = path.match(/\/cp\/([^/?]+)/);
      if (match && match[1]) {
        const cpId = match[1];
        validateQrToken(cpId).then((res) => {
          if (res.success && res.collectionPoint) {
            setActiveCheckInPoint(res.collectionPoint);
            setQrModalOpen(true);
          } else {
            setQrModalOpen(true);
          }
        });
      }
    } else if (search.includes('t=')) {
      setQrModalOpen(true);
    }
  }, [setActiveCheckInPoint, setQrModalOpen]);

  return (
    <div className={`min-h-screen flex flex-col ${highContrast ? 'contrast-125 bg-black text-white' : 'bg-slate-950 text-slate-100'}`}>
      {/* Sticky Global Navigation */}
      <Navbar />

      {/* Main Container Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 space-y-10 pb-28 md:pb-16">
        {/* Render Tab Content based on active navigation */}
        {activeTab === 'scan' && (
          <div className="space-y-10">
            {/* Hero Section */}
            <Hero />

            {/* Scanner Input View */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl sm:text-2xl font-display font-extrabold text-white">
                    Scan & Detect Plastic Waste
                  </h2>
                  <p className="text-xs text-slate-400">
                    Use your live camera, drag & drop a photo, or test with pre-loaded polymer specimens.
                  </p>
                </div>
              </div>

              <ScannerView />
            </section>

            {/* Multi-Item Breakdown (if items detected) */}
            {activeScan && activeScan.items && activeScan.items.length > 0 && (
              <MultiItemBreakdown items={activeScan.items} />
            )}

            {/* Detailed Scan Analysis Results Card */}
            {activeScan && (
              <section className="space-y-4 pt-2">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl sm:text-2xl font-display font-extrabold text-white">
                    Polymer & Environmental Diagnostics
                  </h2>
                  <span className="text-xs font-mono text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-500/30">
                    ID: {activeScan.id}
                  </span>
                </div>

                <ScanResults scan={activeScan} />
              </section>
            )}
          </div>
        )}

        {/* Collection Points & QR Check-In Directory */}
        {activeTab === 'checkin' && <FindCollectionPoints />}

        {/* Operator Dashboard for Bins, Posters & Verification */}
        {activeTab === 'operator' && <OperatorDashboard />}

        {/* Health & Endocrine Disruption Advisor */}
        {activeTab === 'health' && <HealthAdvisor />}

        {/* Upcycle Studio */}
        {activeTab === 'upcycle' && <UpcycleStudio />}

        {/* Impact Dashboard */}
        {activeTab === 'dashboard' && <ImpactDashboard />}

        {/* Hotspots Map & 7-day predictive forecasting */}
        {activeTab === 'hotspots' && <HotspotMap />}

        {/* Brand Accountability Board */}
        {activeTab === 'brands' && <BrandBoard />}

        {/* Waste-to-Value Marketplace */}
        {activeTab === 'marketplace' && <Marketplace />}

        {/* Carbon Credit Wallet */}
        {activeTab === 'wallet' && <CarbonWallet />}

        {/* Footprint Calculator */}
        {activeTab === 'calculator' && <FootprintCalculator />}

        {/* Resin Code Guide Flip Cards */}
        {activeTab === 'learn' && <ResinCodeGuide />}

        {/* About & Methodology */}
        {activeTab === 'about' && <HowItWorks />}
      </main>

      {/* Verified Recycling Drop-off QR Check-In Modal */}
      <QrCheckInModal />

      {/* Grounded AI Assistant Modal */}
      <EcoBotModal />

      {/* Floating Quick EcoBot Launcher on Bottom Right (positioned above bottom nav) */}
      <button
        onClick={() => setEcoBotOpen(true)}
        className="fixed bottom-20 md:bottom-6 right-5 z-40 p-3.5 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-lime-400 text-slate-950 shadow-2xl shadow-emerald-500/40 hover:scale-105 active:scale-95 transition flex items-center gap-2 group font-bold text-xs"
        title="Open EcoBot Grounded Chat"
      >
        <MessageSquare className="w-5 h-5 fill-slate-950" />
        <span className="hidden sm:inline pr-1">Ask EcoBot</span>
      </button>

      {/* Prominent Mobile Bottom Navigation Bar with Center Scan QR Button */}
      <div className="block md:hidden">
        <BottomNav />
      </div>

      {/* Global Environmental Action Footer */}
      <footer className="mt-16 border-t border-slate-900 bg-slate-950/90 py-8 px-4 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Recycle className="w-3.5 h-3.5" />
            </div>
            <span className="font-display font-bold text-slate-200">PlastiSense Circular Intelligence</span>
            <span className="text-slate-600">•</span>
            <span>Science-Backed Plastic Segregation System</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <span className="flex items-center gap-1">
              <Globe className="w-3 h-3 text-emerald-400" />
              <span>Rules tuned for {locationRegion}</span>
            </span>
            <button
              onClick={() => setActiveTab('about')}
              className="hover:text-emerald-300 transition"
            >
              Methodology
            </button>
            <button
              onClick={() => setActiveTab('learn')}
              className="hover:text-emerald-300 transition"
            >
              Resin Guide
            </button>
            <button
              onClick={() => setActiveTab('checkin')}
              className="text-emerald-400 hover:text-emerald-300 transition font-medium"
            >
              Collection Points
            </button>
            <button
              onClick={() => setActiveTab('operator')}
              className="text-slate-400 hover:text-white transition"
            >
              Operator Hub
            </button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto mt-4 pt-4 border-t border-slate-900/80 text-[11px] text-slate-500 text-center">
          Always inspect embossed resin triangles and consult your regional municipal waste management service for designated bin colors and curbside collection schedules.
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <EcoProvider>
      <AppContent />
    </EcoProvider>
  );
}
