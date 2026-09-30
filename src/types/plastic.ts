export type SeverityLevel = 'Low' | 'Medium' | 'High' | 'Hazardous';

export type ContaminationLevel = 'clean' | 'food-soiled' | 'mixed-materials' | 'heavy-residue';

export type ConditionType = 'intact' | 'crushed' | 'fragmented' | 'weathered/degraded';

export type ActionRecommendation = 'Recycle' | 'Reuse' | 'Upcycle' | 'Compost' | 'Safe Disposal';

export interface UpcycleProject {
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Advanced';
  estimatedTime: string;
  materialsNeeded: string[];
  steps: string[];
}

export interface DetectedItem {
  name: string;
  polymer: string;
  resinCode: number;
  action: string;
  contamination?: string;
  approximateWeightGrams?: number;
}

export interface HealthRiskAnalysis {
  riskMeter: 'Green' | 'Yellow' | 'Red';
  toxicAdditives: string[];
  healthEffects: string[];
  summary: string;
}

export interface BiodegradationAnalysis {
  naturalDecompositionYears: number;
  microbialPathway: string;
  bioFacilityEligible: boolean;
  summary: string;
}

export interface ChemicalOfConcern {
  name: string;
  whereFound: string;
  plainLanguageEffect: string;
  evidenceStrength: 'Well established' | 'Emerging' | 'Limited';
}

export interface SaferAlternative {
  name: string;
  estimatedCost: string;
  whereToBuy: string;
  yearlyPlasticSavedKg: number;
  moneySavedPerYear: string;
}

export interface HealthProfile {
  commonChemicalsOfConcern: ChemicalOfConcern[];
  foodContactSafety: 'Generally safe' | 'Use with caution' | 'Avoid for hot or fatty food' | 'Not food-safe';
  heatRisk: {
    microwaveSafe: boolean;
    hotLiquidSafe: boolean;
    dishwasherSafe: boolean;
    explanation: string;
  };
  reuseSafety: {
    safeToReuse: boolean;
    maxReuseAdvice: string;
    signsToDiscard: string[];
  };
  exposureRoutes: string[];
  healthRiskLevel: 'Low' | 'Moderate' | 'Elevated';
  healthRiskReason: string;
  saferAlternatives: SaferAlternative[];
  evidenceStrength: 'Well established' | 'Emerging' | 'Limited';
  disclaimer: string;
}

export interface ScanResult {
  id: string;
  timestamp: number;
  imageUrl?: string;
  hasPlastic: boolean;
  confidence: number;
  plasticType: string;
  polymerShort: string;
  resinCode: number;
  resinSymbol: string;
  itemName: string;
  brandDetected?: string;
  contaminationLevel: ContaminationLevel;
  condition: ConditionType;
  severityLevel: SeverityLevel;
  impactScore: number; // 0 - 100
  healthRisk: HealthRiskAnalysis;
  healthProfile?: HealthProfile;
  biodegradation: BiodegradationAnalysis;
  recommendedAction: ActionRecommendation;
  steps: string[];
  co2SavedKg: number;
  oceanLandfillRisk: string;
  upcycleIdeas: UpcycleProject[];
  items?: DetectedItem[];
  disposalWarning?: string;
  funFact?: string;
  nextAction: string;
  verifiedActionTaken?: boolean;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
  category: 'scans' | 'co2' | 'upcycle' | 'community' | 'checkin' | 'health';
}

export interface HotspotReport {
  id: string;
  locationName: string;
  city: string;
  lat: number;
  lng: number;
  severity: SeverityLevel;
  wasteDensityKg: number;
  reportedBy: string;
  reportedAgo: string;
  primaryPolymers: string[];
  status: 'Open' | 'Cleanup Scheduled' | 'Cleaned';
  notes: string;
}

export interface PredictedHotspot {
  id: string;
  name: string;
  lat: number;
  lng: number;
  predictedRisk: 'Elevated' | 'Critical';
  expectedWasteIncrease: string;
  factors: {
    rainfallSim: string;
    populationDensity: string;
    historicalAccumulation: string;
  };
  reasoning: string;
}

export interface BrandPollutionStat {
  id: string;
  brand: string;
  parentCompany: string;
  itemCount: number;
  percentage: number;
  primaryPackaging: string;
  citiesTop: string[];
  circularityScore: number; // 0-100
}

export interface MarketplaceListing {
  id: string;
  title: string;
  polymer: string;
  resinCode: number;
  weightKg: number;
  condition: 'Washed & Dried' | 'Crushed & Baled' | 'Shredded Flakes';
  sellerName: string;
  sellerRating: number;
  city: string;
  estimatedValue: number; // in USD or credits
  imageUrl: string;
  claimed: boolean;
}

export interface CarbonReward {
  id: string;
  title: string;
  costKgCo2: number;
  partner: string;
  icon: string;
  description: string;
}

export type SupportedLanguage = 'en' | 'kn' | 'hi';

// --- COLLECTION POINT QR CHECK-IN DATA MODEL ---
export type CollectionPointType = 'bin' | 'kiosk' | 'recycler' | 'school' | 'society';
export type CollectionPointStatus = 'active' | 'full' | 'maintenance';

export interface CollectionPoint {
  id: string;
  name: string;
  type: CollectionPointType;
  operatorId: string;
  operatorName: string;
  location: {
    lat: number;
    lng: number;
  };
  geohash?: string;
  address: string;
  city: string;
  acceptedMaterials: string[]; // e.g. ["PET (#1 Bottles)", "HDPE (#2 Jugs)", "PP (#5 Tubs)"]
  openingHours: string;
  status: CollectionPointStatus;
  fillLevelPercent: number; // 0 - 100
  qrSecretVersion: number;
  createdAt: string;
  contactPhone?: string;
  currentQrToken?: string;
  tokenExpiresAt?: number;
  todayCheckInsCount?: number;
  totalCollectedKg?: number;
}

export interface RecyclingActivityItem {
  plasticType: string;
  resinCode: number;
  weightKg: number;
  source: 'scan' | 'photo' | 'manual';
  scanId?: string;
}

export interface RecyclingActivity {
  id: string;
  uid: string;
  cpId: string;
  cpName: string;
  items: RecyclingActivityItem[];
  totalWeightKg: number;
  photoUrl?: string;
  aiVerification: {
    matchesAccepted: boolean;
    confidence: number;
    notes: string;
  };
  verificationStatus: 'verified' | 'pending-review' | 'rejected';
  pointsAwarded: number;
  carbonCreditsAwarded: number;
  co2SavedKg: number;
  geoCheckPassed: boolean;
  deviceFingerprintHash: string;
  createdAt: string;
  rejectionReason?: string;
}

// --- HEALTH & PLASTICS ADVISOR DATA MODEL ---
export interface PlasticExposureQuizResult {
  score: number; // 0-100 (100 is cleanest/least exposure, <40 is elevated)
  tier: 'Low Exposure' | 'Moderate Exposure' | 'Elevated Exposure';
  topHabitsToChange: string[];
  saferSwapShoppingList: string[];
  weeklyReductionTarget: string;
  date: string;
}

export interface SafeSwapChallenge {
  id: string;
  title: string;
  category: 'Kitchen' | 'Beverage' | 'Takeaway' | 'Lifestyle';
  currentHabit: string;
  swapTo: string;
  material: string;
  estimatedCost: string;
  yearlyPlasticSavedKg: number;
  yearlyMoneySaved: string;
  points: number;
  completed: boolean;
}
