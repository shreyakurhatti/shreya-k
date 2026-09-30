import React, { createContext, useContext, useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  ScanResult,
  Badge,
  HotspotReport,
  MarketplaceListing,
  SupportedLanguage,
  CollectionPoint,
  RecyclingActivity,
  SafeSwapChallenge,
  PlasticExposureQuizResult,
} from '../types/plastic';
import {
  INITIAL_SCANS,
  INITIAL_BADGES,
  INITIAL_HOTSPOTS,
  MARKETPLACE_LISTINGS,
  INITIAL_COLLECTION_POINTS,
  INITIAL_RECYCLING_ACTIVITIES,
  SAFE_SWAP_CHALLENGES,
  UI_TRANSLATIONS,
} from '../data/mockData';
import { fetchCollectionPoints } from '../services/collectionPointService';

interface EcoContextType {
  scans: ScanResult[];
  activeScan: ScanResult | null;
  setActiveScan: (scan: ScanResult | null) => void;
  ecoPoints: number;
  carbonCreditsKg: number;
  streakDays: number;
  badges: Badge[];
  activeTab: string;
  setActiveTab: (tab: string) => void;
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  locationRegion: string;
  setLocationRegion: (region: string) => void;
  highContrast: boolean;
  setHighContrast: (val: boolean) => void;
  ecoBotOpen: boolean;
  setEcoBotOpen: (open: boolean) => void;
  hotspots: HotspotReport[];
  marketplaceItems: MarketplaceListing[];
  // Collection Points & Check-In
  collectionPoints: CollectionPoint[];
  setCollectionPoints: React.Dispatch<React.SetStateAction<CollectionPoint[]>>;
  recyclingActivities: RecyclingActivity[];
  qrModalOpen: boolean;
  setQrModalOpen: (open: boolean) => void;
  activeCheckInPoint: CollectionPoint | null;
  setActiveCheckInPoint: (point: CollectionPoint | null) => void;
  recordVerifiedDropoff: (activity: RecyclingActivity) => void;
  totalRecycledKg: number;
  verifiedDropoffs: number;
  // Health & Safe Swaps
  safeSwaps: SafeSwapChallenge[];
  toggleSwapChallenge: (id: string) => void;
  plasticExposureScore: PlasticExposureQuizResult | null;
  setPlasticExposureScore: (score: PlasticExposureQuizResult | null) => void;
  // Actions
  t: (key: keyof typeof UI_TRANSLATIONS['en']) => string;
  addScan: (scan: ScanResult) => void;
  verifyAction: (scanId: string) => void;
  addNewHotspot: (hotspot: Omit<HotspotReport, 'id' | 'reportedAgo'>) => void;
  claimListing: (id: string) => void;
  addListing: (listing: Omit<MarketplaceListing, 'id' | 'claimed'>) => void;
  redeemReward: (costKgCo2: number, rewardTitle: string) => boolean;
  triggerConfetti: () => void;
}

const EcoContext = createContext<EcoContextType | null>(null);

export const EcoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Scans history
  const [scans, setScans] = useState<ScanResult[]>(() => {
    try {
      const saved = localStorage.getItem('plastisense_scans');
      return saved ? JSON.parse(saved) : INITIAL_SCANS;
    } catch {
      return INITIAL_SCANS;
    }
  });

  const [activeScan, setActiveScan] = useState<ScanResult | null>(scans[0] || null);

  // Points & Carbon
  const [ecoPoints, setEcoPoints] = useState<number>(() => {
    try {
      const val = localStorage.getItem('plastisense_points');
      return val ? parseInt(val, 10) : 480;
    } catch {
      return 480;
    }
  });

  const [carbonCreditsKg, setCarbonCreditsKg] = useState<number>(() => {
    try {
      const val = localStorage.getItem('plastisense_carbon');
      return val ? parseFloat(val) : 6.62;
    } catch {
      return 6.62;
    }
  });

  const [streakDays, setStreakDays] = useState<number>(() => {
    try {
      const val = localStorage.getItem('plastisense_streak');
      return val ? parseInt(val, 10) : 5;
    } catch {
      return 5;
    }
  });

  // Badges
  const [badges, setBadges] = useState<Badge[]>(() => {
    try {
      const saved = localStorage.getItem('plastisense_badges');
      return saved ? JSON.parse(saved) : INITIAL_BADGES;
    } catch {
      return INITIAL_BADGES;
    }
  });

  // Hotspots & Marketplace
  const [hotspots, setHotspots] = useState<HotspotReport[]>(INITIAL_HOTSPOTS);
  const [marketplaceItems, setMarketplaceItems] = useState<MarketplaceListing[]>(MARKETPLACE_LISTINGS);

  // Collection Points & Recycling Activities
  const [collectionPoints, setCollectionPoints] = useState<CollectionPoint[]>(INITIAL_COLLECTION_POINTS);
  const [recyclingActivities, setRecyclingActivities] = useState<RecyclingActivity[]>(() => {
    try {
      const saved = localStorage.getItem('plastisense_activities');
      return saved ? JSON.parse(saved) : INITIAL_RECYCLING_ACTIVITIES;
    } catch {
      return INITIAL_RECYCLING_ACTIVITIES;
    }
  });

  const [qrModalOpen, setQrModalOpen] = useState<boolean>(false);
  const [activeCheckInPoint, setActiveCheckInPoint] = useState<CollectionPoint | null>(null);

  // Health Swaps & Exposure Score
  const [safeSwaps, setSafeSwaps] = useState<SafeSwapChallenge[]>(() => {
    try {
      const saved = localStorage.getItem('plastisense_swaps');
      return saved ? JSON.parse(saved) : SAFE_SWAP_CHALLENGES;
    } catch {
      return SAFE_SWAP_CHALLENGES;
    }
  });

  const [plasticExposureScore, setPlasticExposureScore] = useState<PlasticExposureQuizResult | null>(() => {
    try {
      const saved = localStorage.getItem('plastisense_exposure_score');
      return saved ? JSON.parse(saved) : {
        score: 62,
        tier: 'Moderate Exposure',
        topHabitsToChange: [
          'Replace plastic takeaway soup cups with glass',
          'Avoid bottled water in parked summer vehicles',
          'Switch to loose leaf tea',
        ],
        saferSwapShoppingList: ['Borosilicate Glass Bottle', 'Stainless Steel Tea Infuser', 'Beeswax Wraps'],
        weeklyReductionTarget: '-0.8 kg plastic / week',
        date: 'Recent Audit',
      };
    } catch {
      return null;
    }
  });

  // UI state
  const [activeTab, setActiveTab] = useState<string>('scan');
  const [language, setLanguage] = useState<SupportedLanguage>('en');
  const [locationRegion, setLocationRegion] = useState<string>('Bengaluru, India');
  const [highContrast, setHighContrast] = useState<boolean>(false);
  const [ecoBotOpen, setEcoBotOpen] = useState<boolean>(false);

  // Sync with server collection points on mount
  useEffect(() => {
    fetchCollectionPoints().then((pts) => {
      if (pts && pts.length > 0) {
        setCollectionPoints(pts);
      }
    });
  }, []);

  // Sync state to localStorage
  useEffect(() => {
    localStorage.setItem('plastisense_scans', JSON.stringify(scans));
  }, [scans]);

  useEffect(() => {
    localStorage.setItem('plastisense_points', ecoPoints.toString());
  }, [ecoPoints]);

  useEffect(() => {
    localStorage.setItem('plastisense_carbon', carbonCreditsKg.toString());
  }, [carbonCreditsKg]);

  useEffect(() => {
    localStorage.setItem('plastisense_streak', streakDays.toString());
  }, [streakDays]);

  useEffect(() => {
    localStorage.setItem('plastisense_badges', JSON.stringify(badges));
  }, [badges]);

  useEffect(() => {
    localStorage.setItem('plastisense_activities', JSON.stringify(recyclingActivities));
  }, [recyclingActivities]);

  useEffect(() => {
    localStorage.setItem('plastisense_swaps', JSON.stringify(safeSwaps));
  }, [safeSwaps]);

  useEffect(() => {
    if (plasticExposureScore) {
      localStorage.setItem('plastisense_exposure_score', JSON.stringify(plasticExposureScore));
    }
  }, [plasticExposureScore]);

  // Derived user statistics
  const verifiedDropoffs = recyclingActivities.filter((a) => a.verificationStatus === 'verified').length;
  const totalRecycledKg = parseFloat(
    recyclingActivities
      .filter((a) => a.verificationStatus === 'verified')
      .reduce((sum, a) => sum + (a.totalWeightKg || 0), 0)
      .toFixed(2)
  );

  // Multilingual translation helper
  const t = (key: keyof typeof UI_TRANSLATIONS['en']): string => {
    const langDict = UI_TRANSLATIONS[language] || UI_TRANSLATIONS.en;
    return (langDict as any)[key] || UI_TRANSLATIONS.en[key] || key;
  };

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 90,
        spread: 75,
        origin: { y: 0.6 },
        colors: ['#10b981', '#14b8a6', '#06b6d4', '#84cc16', '#34d399'],
      });
    } catch {
      // ignore
    }
  };

  const addScan = (newScan: ScanResult) => {
    setScans((prev) => [newScan, ...prev]);
    setActiveScan(newScan);
    setEcoPoints((prev) => prev + 50);

    // Check & unlock badges
    setBadges((prev) =>
      prev.map((b) => {
        if (b.id === 'first_scan' && !b.unlocked) {
          return { ...b, unlocked: true, unlockedAt: 'Just now' };
        }
        if (b.id === 'bottle_hero' && newScan.polymerShort === 'PET' && !b.unlocked) {
          return { ...b, unlocked: true, unlockedAt: 'Just now' };
        }
        return b;
      })
    );
  };

  const verifyAction = (scanId: string) => {
    let earnedCarbon = 0.2;
    setScans((prev) =>
      prev.map((s) => {
        if (s.id === scanId) {
          earnedCarbon = s.co2SavedKg || 0.2;
          return { ...s, verifiedActionTaken: true };
        }
        return s;
      })
    );

    setEcoPoints((prev) => prev + 100);
    setCarbonCreditsKg((prev) => parseFloat((prev + earnedCarbon).toFixed(2)));
    triggerConfetti();
  };

  const recordVerifiedDropoff = (activity: RecyclingActivity) => {
    setRecyclingActivities((prev) => [activity, ...prev]);
    setEcoPoints((prev) => prev + activity.pointsAwarded);
    setCarbonCreditsKg((prev) => parseFloat((prev + activity.carbonCreditsAwarded).toFixed(2)));
    setStreakDays((prev) => prev + 1);

    // Check milestone badges
    setBadges((prev) =>
      prev.map((b) => {
        if (b.id === 'first_dropoff' && !b.unlocked) {
          return { ...b, unlocked: true, unlockedAt: 'Just now' };
        }
        if (b.id === 'ten_kg_club' && totalRecycledKg + activity.totalWeightKg >= 10 && !b.unlocked) {
          return { ...b, unlocked: true, unlockedAt: 'Just now' };
        }
        return b;
      })
    );

    triggerConfetti();
  };

  const toggleSwapChallenge = (id: string) => {
    setSafeSwaps((prev) =>
      prev.map((s) => {
        if (s.id === id) {
          const nextCompleted = !s.completed;
          if (nextCompleted) {
            setEcoPoints((p) => p + s.points);
            triggerConfetti();
            setBadges((bdgs) =>
              bdgs.map((b) => (b.id === 'glass_guardian' ? { ...b, unlocked: true, unlockedAt: 'Just now' } : b))
            );
          }
          return { ...s, completed: nextCompleted };
        }
        return s;
      })
    );
  };

  const addNewHotspot = (item: Omit<HotspotReport, 'id' | 'reportedAgo'>) => {
    const newEntry: HotspotReport = {
      ...item,
      id: `hp-${Date.now()}`,
      reportedAgo: 'Just now',
    };
    setHotspots((prev) => [newEntry, ...prev]);
    setEcoPoints((prev) => prev + 150);
    triggerConfetti();
  };

  const claimListing = (id: string) => {
    setMarketplaceItems((prev) =>
      prev.map((m) => (m.id === id ? { ...m, claimed: true } : m))
    );
    setEcoPoints((prev) => prev + 80);
    triggerConfetti();
  };

  const addListing = (listing: Omit<MarketplaceListing, 'id' | 'claimed'>) => {
    const newItem: MarketplaceListing = {
      ...listing,
      id: `mkt-${Date.now()}`,
      claimed: false,
    };
    setMarketplaceItems((prev) => [newItem, ...prev]);
    setEcoPoints((prev) => prev + 120);
    triggerConfetti();
  };

  const redeemReward = (costKgCo2: number, rewardTitle: string): boolean => {
    if (carbonCreditsKg < costKgCo2) {
      return false;
    }
    setCarbonCreditsKg((prev) => parseFloat((prev - costKgCo2).toFixed(2)));
    triggerConfetti();
    return true;
  };

  return (
    <EcoContext.Provider
      value={{
        scans,
        activeScan,
        setActiveScan,
        ecoPoints,
        carbonCreditsKg,
        streakDays,
        badges,
        activeTab,
        setActiveTab,
        language,
        setLanguage,
        locationRegion,
        setLocationRegion,
        highContrast,
        setHighContrast,
        ecoBotOpen,
        setEcoBotOpen,
        hotspots,
        marketplaceItems,
        collectionPoints,
        setCollectionPoints,
        recyclingActivities,
        qrModalOpen,
        setQrModalOpen,
        activeCheckInPoint,
        setActiveCheckInPoint,
        recordVerifiedDropoff,
        totalRecycledKg,
        verifiedDropoffs,
        safeSwaps,
        toggleSwapChallenge,
        plasticExposureScore,
        setPlasticExposureScore,
        t,
        addScan,
        verifyAction,
        addNewHotspot,
        claimListing,
        addListing,
        redeemReward,
        triggerConfetti,
      }}
    >
      {children}
    </EcoContext.Provider>
  );
};

export const useEco = () => {
  const context = useContext(EcoContext);
  if (!context) {
    throw new Error('useEco must be used within an EcoProvider');
  }
  return context;
};
