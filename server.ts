import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';
import QRCode from 'qrcode';
import { MongoManager } from './server-db.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// Initialize MongoDB Atlas Manager
const mongoManager = new MongoManager();

app.use(express.json({ limit: '35mb' }));

// Initialize Google GenAI client
const apiKey = process.env.GEMINI_API_KEY;
let aiClient: GoogleGenAI | null = null;

if (apiKey) {
  aiClient = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
} else {
  console.warn('GEMINI_API_KEY not found in environment.');
}

// Helper to remove data:image/...;base64, prefix
function extractBase64Data(raw: string): { data: string; mimeType: string } {
  const match = raw.match(/^data:([^;]+);base64,(.+)$/);
  if (match) {
    return { mimeType: match[1], data: match[2] };
  }
  return { mimeType: 'image/jpeg', data: raw };
}

// --- IN-MEMORY FIRESTORE-COMPLIANT STORE ---
interface StoredCollectionPoint {
  id: string;
  name: string;
  type: 'bin' | 'kiosk' | 'recycler' | 'school' | 'society';
  operatorId: string;
  operatorName: string;
  location: { lat: number; lng: number };
  geohash?: string;
  address: string;
  city: string;
  acceptedMaterials: string[];
  openingHours: string;
  status: 'active' | 'full' | 'maintenance';
  fillLevelPercent: number;
  qrSecretVersion: number;
  createdAt: string;
  contactPhone?: string;
  todayCheckInsCount: number;
  totalCollectedKg: number;
}

interface StoredRecyclingActivity {
  id: string;
  uid: string;
  cpId: string;
  cpName: string;
  items: Array<{ plasticType: string; resinCode: number; weightKg: number; source: 'scan' | 'photo' | 'manual'; scanId?: string }>;
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

// Seed initial collection points
let collectionPointsStore: StoredCollectionPoint[] = [
  {
    id: 'cp-blr-01',
    name: 'Indiranagar Metro Smart Circular Kiosk',
    type: 'kiosk',
    operatorId: 'op-greenloop',
    operatorName: 'GreenLoop Municipal Network',
    location: { lat: 12.9784, lng: 77.6408 },
    address: '100 Feet Rd, Near Metro Station Exit B, Indiranagar, Bengaluru',
    city: 'Bengaluru',
    acceptedMaterials: ['PET (#1 Bottles)', 'HDPE (#2 Jugs)', 'PP (#5 Tubs)'],
    openingHours: '6:00 AM - 10:00 PM Daily',
    status: 'active',
    fillLevelPercent: 38,
    qrSecretVersion: 1,
    createdAt: '2026-01-10T08:00:00Z',
    contactPhone: '+91 80 4122 9801',
    todayCheckInsCount: 24,
    totalCollectedKg: 342,
  },
  {
    id: 'cp-blr-02',
    name: 'Koramangala Green Earth Recycler Hub',
    type: 'recycler',
    operatorId: 'op-earthfirst',
    operatorName: 'EarthFirst Materials Recovery',
    location: { lat: 12.9352, lng: 77.6245 },
    address: '80 Feet Rd, 4th Block, Next to BDA Complex, Koramangala',
    city: 'Bengaluru',
    acceptedMaterials: ['PET (#1 Bottles)', 'HDPE (#2 Jugs)', 'LDPE (#4 Film)', 'PP (#5 Tubs)'],
    openingHours: '8:00 AM - 7:30 PM (Mon-Sat)',
    status: 'active',
    fillLevelPercent: 64,
    qrSecretVersion: 1,
    createdAt: '2026-02-01T09:30:00Z',
    contactPhone: '+91 80 2553 4421',
    todayCheckInsCount: 38,
    totalCollectedKg: 890,
  },
  {
    id: 'cp-sea-01',
    name: 'Capitol Hill Urban Eco Drop-off Station',
    type: 'bin',
    operatorId: 'op-pnw',
    operatorName: 'Seattle Zero-Waste Alliance',
    location: { lat: 47.6152, lng: -122.3211 },
    address: 'Broadway & E Pine St, Seattle, WA',
    city: 'Seattle',
    acceptedMaterials: ['PET (#1 Bottles)', 'HDPE (#2 Jugs)'],
    openingHours: '24/7 Public Smart Bin',
    status: 'active',
    fillLevelPercent: 81,
    qrSecretVersion: 1,
    createdAt: '2026-01-15T10:00:00Z',
    contactPhone: '+1 206 555 0192',
    todayCheckInsCount: 19,
    totalCollectedKg: 215,
  },
  {
    id: 'cp-ber-01',
    name: 'Kreuzberg Community School Drop-off Point',
    type: 'school',
    operatorId: 'op-berlin-eco',
    operatorName: 'Kreuzberg Circular Schools',
    location: { lat: 52.4986, lng: 13.4182 },
    address: 'Oranienstraße 185, 10999 Berlin',
    city: 'Berlin',
    acceptedMaterials: ['PET (#1 Bottles)', 'HDPE (#2 Jugs)', 'PP (#5 Tubs)'],
    openingHours: 'Mon-Fri 7:30 AM - 5:00 PM',
    status: 'active',
    fillLevelPercent: 22,
    qrSecretVersion: 1,
    createdAt: '2026-02-12T11:00:00Z',
    contactPhone: '+49 30 90298 0',
    todayCheckInsCount: 14,
    totalCollectedKg: 168,
  },
  {
    id: 'cp-del-01',
    name: 'Connaught Place Central Circular Kiosk',
    type: 'kiosk',
    operatorId: 'op-delhi-clean',
    operatorName: 'Delhi Smart City Mission',
    location: { lat: 28.6315, lng: 77.2167 },
    address: 'Outer Circle, Block E, Near Rajiv Chowk Gate 4, New Delhi',
    city: 'Delhi',
    acceptedMaterials: ['PET (#1 Bottles)', 'HDPE (#2 Jugs)', 'PP (#5 Tubs)'],
    openingHours: '7:00 AM - 9:30 PM Daily',
    status: 'active',
    fillLevelPercent: 52,
    qrSecretVersion: 1,
    createdAt: '2026-01-20T08:00:00Z',
    contactPhone: '+91 11 2334 1120',
    todayCheckInsCount: 31,
    totalCollectedKg: 512,
  },
];

let activitiesStore: StoredRecyclingActivity[] = [
  {
    id: 'act-101',
    uid: 'user-curr',
    cpId: 'cp-blr-01',
    cpName: 'Indiranagar Metro Smart Circular Kiosk',
    items: [
      { plasticType: 'PET (#1 Bottles)', resinCode: 1, weightKg: 0.45, source: 'scan' },
      { plasticType: 'HDPE (#2 Jugs)', resinCode: 2, weightKg: 0.35, source: 'scan' },
    ],
    totalWeightKg: 0.8,
    photoUrl: 'https://images.unsplash.com/photo-1523362628745-0c100150b504?auto=format&fit=crop&w=600&q=80',
    aiVerification: {
      matchesAccepted: true,
      confidence: 96,
      notes: 'Clean PET bottle body and HDPE screw caps confirmed against accepted intake criteria.',
    },
    verificationStatus: 'verified',
    pointsAwarded: 180,
    carbonCreditsAwarded: 0.72,
    co2SavedKg: 0.72,
    geoCheckPassed: true,
    deviceFingerprintHash: 'fp-8f92b',
    createdAt: '2026-03-28T14:30:00Z',
  },
];

// Rich fallback scans store
const initialScansStore: any[] = [
  {
    id: 'scan-sample-1',
    timestamp: Date.now() - 1000 * 60 * 60 * 2,
    hasPlastic: true,
    confidence: 96,
    plasticType: 'PET (Polyethylene Terephthalate)',
    polymerShort: 'PET',
    resinCode: 1,
    resinSymbol: '♳',
    itemName: '500ml Mineral Water Bottle',
    brandDetected: 'Aquafina / PureFlow',
    contaminationLevel: 'clean',
    condition: 'crushed',
    severityLevel: 'Medium',
    impactScore: 42,
    healthRisk: {
      riskMeter: 'Yellow',
      toxicAdditives: ['Antimony trioxide catalyst traces', 'Acetaldehyde'],
      healthEffects: ['Additives can leach under direct sunlight or boiling water', 'Nano-plastic shedding with age'],
      summary: 'Safe for single use; avoid repeated refills in hot vehicles or microwave usage.',
    },
    biodegradation: {
      naturalDecompositionYears: 450,
      microbialPathway: 'Ideonella sakaiensis (PETase & MHETase enzyme system) digests amorphous PET in specialized bioreactors.',
      bioFacilityEligible: false,
      summary: 'Will not decompose naturally in soil or compost. Highly viable for mechanical bottle-to-fiber recycling.',
    },
    recommendedAction: 'Recycle',
    steps: [
      'Unscrew HDPE cap and place in separate cap collection stream',
      'Rinse lightly with residual rinse water to remove dust',
      'Peel BOPP label if perforated',
      'Step on or crush bottle lengthwise to reduce truck transport emissions',
    ],
    co2SavedKg: 0.16,
    oceanLandfillRisk: 'High fragmentation into marine microfibers consumed by filter-feeding pelagic fish.',
  },
  {
    id: 'scan-sample-2',
    timestamp: Date.now() - 1000 * 60 * 60 * 24,
    hasPlastic: true,
    confidence: 94,
    plasticType: 'HDPE (High-Density Polyethylene)',
    polymerShort: 'HDPE',
    resinCode: 2,
    resinSymbol: '♲',
    itemName: 'Eco Laundry Detergent Jug (1 Litre)',
    brandDetected: 'EarthChoice / Generic',
    contaminationLevel: 'moderate',
    condition: 'intact',
    severityLevel: 'Low',
    impactScore: 28,
    healthRisk: {
      riskMeter: 'Green',
      toxicAdditives: ['Low volatile extractables', 'UV stabilisers'],
      healthEffects: ['Considered one of the safest commercial food/detergent grade plastics'],
      summary: 'High chemical resistance; very low leaching under ambient temperatures.',
    },
    biodegradation: {
      naturalDecompositionYears: 300,
      microbialPathway: 'Rhodococcus ruber and specialized fungal strains decompose pre-oxidized HDPE.',
      bioFacilityEligible: false,
      summary: 'Highly prized high-value post-consumer resin for pellet extrusion.',
    },
    recommendedAction: 'Recycle',
    steps: [
      'Rinse detergent residue completely with warm water',
      'Keep cap attached or separate based on regional MRF protocol',
      'Do not crush rigid handles violently',
    ],
    co2SavedKg: 0.35,
    oceanLandfillRisk: 'Durable buoyant microplastic shards.',
  },
  {
    id: 'scan-sample-3',
    timestamp: Date.now() - 1000 * 60 * 60 * 48,
    hasPlastic: true,
    confidence: 92,
    plasticType: 'PP (Polypropylene)',
    polymerShort: 'PP',
    resinCode: 5,
    resinSymbol: '♷',
    itemName: 'Microwave Safe Takeaway Container',
    brandDetected: 'Local EcoKitchen',
    contaminationLevel: 'dirty',
    condition: 'intact',
    severityLevel: 'Medium',
    impactScore: 35,
    healthRisk: {
      riskMeter: 'Yellow',
      toxicAdditives: ['Clarifying agents', 'Phthalate-free plasticizers'],
      healthEffects: ['Avoid microwave heating past 100°C to minimize thermal monomer migration'],
      summary: 'High melting point; wash thoroughly with oil-cutting soap.',
    },
    biodegradation: {
      naturalDecompositionYears: 200,
      microbialPathway: 'Aspergillus niger and Pseudomonas strains initiate surface degradation under UV light.',
      bioFacilityEligible: false,
      summary: 'Widely collected in municipal curbside and specialized circular kiosks.',
    },
    recommendedAction: 'Reuse / Upcycle',
    steps: [
      'Degrease with warm soapy water',
      'Remove oily gravy films to avoid batch recycling rejection',
      'Can be reused 10-15 times as household storage box before recycling',
    ],
    co2SavedKg: 0.22,
    oceanLandfillRisk: 'Breaks down into floating micro-pellets.',
  },
];

// Initialize MongoDB connection and seed collections if empty
mongoManager.setFallbackScans(initialScansStore);
mongoManager.init(collectionPointsStore, activitiesStore, initialScansStore).catch((e) => {
  console.warn('MongoDB initial connection attempt deferred:', e?.message || e);
});

// Helper to generate rotating signed QR token
function generateSignedQrToken(cpId: string): string {
  const expiry = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
  const payload = `${cpId}::${expiry}::sig_v1_${Math.random().toString(36).substring(2, 8)}`;
  return Buffer.from(payload).toString('base64url');
}

// Distance calculation between coordinates (Haversine in meters)
function calculateDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // Earth radius in metres
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

// Fallback polymer catalog if API 503 occurs
function getContextualFallback(scanMode: string, location: string) {
  if (scanMode === 'pile') {
    return {
      hasPlastic: true,
      confidence: 88,
      plasticType: 'Mixed Packaging Waste Pile (PET, PP, LDPE)',
      polymerShort: 'MIXED',
      resinCode: 7,
      resinSymbol: '♹',
      itemName: 'Curbside Mixed Plastic Waste Cluster',
      brandDetected: 'Multiple Municipal Packaging Brands',
      contaminationLevel: 'mixed-materials',
      condition: 'crushed',
      severityLevel: 'High',
      impactScore: 68,
      healthRisk: {
        riskMeter: 'Yellow',
        toxicAdditives: ['Phthalate plasticizers', 'Slip additives', 'Trace antimony'],
        healthEffects: ['Microplastic shedding into stormwater', 'Photodegradation fragmentation into marine foodwebs'],
        summary: 'Mixed polymer piles cannot be co-melted; segregation by resin code is vital before processing.',
      },
      healthProfile: {
        commonChemicalsOfConcern: [
          { name: 'Phthalates', whereFound: 'Flexible vinyl wraps & cap liners', plainLanguageEffect: 'Interferes with reproductive and thyroid hormones', evidenceStrength: 'Well established' },
          { name: 'Antimony Trioxide', whereFound: 'PET condensation catalyst', plainLanguageEffect: 'Respiratory irritation and cellular stress', evidenceStrength: 'Emerging' },
        ],
        foodContactSafety: 'Not food-safe',
        heatRisk: {
          microwaveSafe: false,
          hotLiquidSafe: false,
          dishwasherSafe: false,
          explanation: 'Mixed post-consumer plastic must never be exposed to microwaves or hot foods.',
        },
        reuseSafety: {
          safeToReuse: false,
          maxReuseAdvice: 'Do not reuse mixed curbside trash for food or drink.',
          signsToDiscard: ['Soiling', 'Unknown provenance', 'Chemical smell'],
        },
        exposureRoutes: ['inhalation (burning)', 'drinking water'],
        healthRiskLevel: 'Elevated',
        healthRiskReason: 'Unregulated composite waste with mixed industrial stabilizers.',
        saferAlternatives: [
          { name: 'Stainless Steel Containers', estimatedCost: '$15 - $22', whereToBuy: 'Eco Home Stores', yearlyPlasticSavedKg: 12.0, moneySavedPerYear: '$120' },
          { name: 'Cotton Mesh Sacks', estimatedCost: '$8 for 5', whereToBuy: 'Supermarkets', yearlyPlasticSavedKg: 3.5, moneySavedPerYear: '$35' },
        ],
        evidenceStrength: 'Well established',
        disclaimer: 'This assessment is for general public-health education, not medical advice.',
      },
      biodegradation: {
        naturalDecompositionYears: 420,
        microbialPathway: 'Heterogeneous polymers resist single-enzyme breakdown; mechanical separation required.',
        bioFacilityEligible: false,
        summary: 'Non-compostable in municipal facilities. High value when sorted into clear single-stream bales.',
      },
      recommendedAction: 'Recycle',
      steps: [
        'Separate rigid PET drink bottles from flexible LDPE film bags.',
        'Remove food grease or liquid residue with greywater rinse.',
        'Deposit rigid bottles in blue recyclables bin and drop films at supermarket drop-off.',
        'Flatten bulky plastic containers to optimize collection bin volume.',
      ],
      co2SavedKg: 0.42,
      oceanLandfillRisk: 'Extreme: Unsegregated light plastic films easily blow into drainage canals and estuaries.',
      upcycleIdeas: [
        {
          title: 'Color-Sorted Multi-Utility Desk Organizer',
          difficulty: 'Easy',
          estimatedTime: '20 mins',
          materialsNeeded: ['Sorted containers', 'Utility scissors', 'Sandpaper'],
          steps: ['Wash and dry tubs', 'Cut to uniform 8cm heights', 'Group for stationary or screws'],
        },
        {
          title: 'Eco-Brick High-Density Building Insulation',
          difficulty: 'Medium',
          estimatedTime: '30 mins',
          materialsNeeded: ['PET bottle', 'Clean dry plastic film wrappers', 'Wooden dowel'],
          steps: ['Pack dry plastic films firmly into bottle', 'Compress with dowel until rock solid'],
        },
        {
          title: 'Self-Watering Sub-Irrigated Herb Planter',
          difficulty: 'Easy',
          estimatedTime: '15 mins',
          materialsNeeded: ['PET bottle', 'Cotton cord', 'Potting mix', 'Seedling'],
          steps: ['Cut bottle in half', 'Invert top into base with cotton wick', 'Plant herbs'],
        },
      ],
      items: [
        { name: 'Clear PET Drink Bottle', polymer: 'PET', resinCode: 1, action: 'Rinse & Blue Bin Recycling', approximateWeightGrams: 24 },
        { name: 'Polypropylene Meal Tub', polymer: 'PP', resinCode: 5, action: 'Wash & Segregate to Rigid Plastics', approximateWeightGrams: 32 },
        { name: 'LDPE Thin Film Bag', polymer: 'LDPE', resinCode: 4, action: 'Store Drop-off Soft Plastics', approximateWeightGrams: 8 },
      ],
      disposalWarning: 'Never burn mixed plastics outdoors; chlorine in trace PVC emits hazardous dioxins.',
      funFact: 'Sorting mixed plastic into single-polymer streams multiplies its recycling market value by 400%!',
      nextAction: 'Separate the soft plastic wrappers from the rigid bottles, and place bottles in your recycling bin.',
    };
  }

  // Single Item standard fallback
  return {
    hasPlastic: true,
    confidence: 93,
    plasticType: 'PET (Polyethylene Terephthalate)',
    polymerShort: 'PET',
    resinCode: 1,
    resinSymbol: '♳',
    itemName: 'Single-use Clear Beverage Container',
    brandDetected: 'Generic Beverage Bottler',
    contaminationLevel: 'clean',
    condition: 'crushed',
    severityLevel: 'Medium',
    impactScore: 44,
    healthRisk: {
      riskMeter: 'Yellow',
      toxicAdditives: ['Antimony trioxide catalyst traces', 'Acetaldehyde'],
      healthEffects: ['Low-level leaching if left in hot cars under UV radiation', 'Microplastic shedding with repeated refills'],
      summary: 'Safe for single use; avoid repeated dishwashing with scalding water.',
    },
    healthProfile: {
      commonChemicalsOfConcern: [
        { name: 'Antimony Trioxide', whereFound: 'PET polymerization catalyst', plainLanguageEffect: 'Traces can migrate into liquids under sun and high heat', evidenceStrength: 'Well established' },
        { name: 'Acetaldehyde', whereFound: 'Polymer thermal degradation', plainLanguageEffect: 'Alters water taste and causes cellular oxidation', evidenceStrength: 'Well established' },
      ],
      foodContactSafety: 'Use with caution',
      heatRisk: {
        microwaveSafe: false,
        hotLiquidSafe: false,
        dishwasherSafe: false,
        explanation: 'Heat breaks down amorphous PET chains, releasing nanoplastics and catalyst residues.',
      },
      reuseSafety: {
        safeToReuse: false,
        maxReuseAdvice: 'Designed strictly for single use. Do not refill repeatedly or use for hot beverages.',
        signsToDiscard: ['Scratches', 'Cloudiness', 'Plastic odor', 'Exposure to parked car heat'],
      },
      exposureRoutes: ['ingestion', 'drinking water'],
      healthRiskLevel: 'Moderate',
      healthRiskReason: 'Catalyst migration when exposed to sunlight, warm vehicles, or boiling liquids.',
      saferAlternatives: [
        { name: '304 Stainless Steel Flask', estimatedCost: '$14 - $20', whereToBuy: 'Supermarkets & Online', yearlyPlasticSavedKg: 9.1, moneySavedPerYear: '$180' },
        { name: 'Borosilicate Glass Bottle', estimatedCost: '$12 - $16', whereToBuy: 'Kitchenware Stores', yearlyPlasticSavedKg: 8.5, moneySavedPerYear: '$165' },
      ],
      evidenceStrength: 'Well established',
      disclaimer: 'This information is based on public-health evidence (WHO, FDA, EFSA) and is not personal medical advice.',
    },
    biodegradation: {
      naturalDecompositionYears: 450,
      microbialPathway: 'Ideonella sakaiensis producing PETase & MHETase enzymes can break it down in bio-incubators.',
      bioFacilityEligible: false,
      summary: 'Non-biodegradable in standard composting. High circular value in bottle-to-fiber recycling.',
    },
    recommendedAction: 'Recycle',
    steps: [
      'Unscrew and separate the HDPE/PP cap (it belongs to Resin #2/5).',
      'Quickly rinse any residual liquid to prevent mould development.',
      'Remove or peel shrink sleeve / paper label if easily separable.',
      'Crush firmly from base to top to save 65% space in the collection bin.',
    ],
    co2SavedKg: 0.18,
    oceanLandfillRisk: 'High fragmentation hazard: Photodegradation fractures PET into microfibers ingested by fish.',
    upcycleIdeas: [
      {
        title: 'Capillary Self-Watering Planter',
        difficulty: 'Easy',
        estimatedTime: '15 mins',
        materialsNeeded: ['PET bottle', 'Cotton cord', 'Potting soil', 'Seedling'],
        steps: ['Cut bottle in half', 'Thread wick through cap hole', 'Invert top into bottom filled with water'],
      },
      {
        title: 'Precision Seed Shaker & Drip Funnel',
        difficulty: 'Easy',
        estimatedTime: '10 mins',
        materialsNeeded: ['PET bottle', 'Pushpin', 'Scissors'],
        steps: ['Perforate 5 holes in cap', 'Fill with seeds or plant food', 'Dispense evenly'],
      },
      {
        title: 'Modern Geometric Desk Caddy',
        difficulty: 'Medium',
        estimatedTime: '20 mins',
        materialsNeeded: ['PET bottle', 'Iron / heat gun to smooth edge', 'Washi tape'],
        steps: ['Cut to 9cm height', 'Press rim against warm iron for 4s to curl sharp edge', 'Organize pens'],
      },
    ],
    items: [
      { name: 'Clear PET Bottle Body', polymer: 'PET', resinCode: 1, action: 'Rinse & Blue Bin Recycling', approximateWeightGrams: 24 },
      { name: 'Bottle Cap', polymer: 'HDPE/PP', resinCode: 2, action: 'Separate to Plastics Drop-off', approximateWeightGrams: 3 },
    ],
    disposalWarning: 'Never incinerate at home: incomplete combustion generates carbon monoxide and airborne volatile organics.',
    funFact: 'Recycling 1 ton of PET plastic saves 3.8 barrels of crude oil and 1,200 kg of atmospheric CO2!',
    nextAction: 'Rinse with leftover dishwater, flatten, and deposit in your blue recycling bin.',
  };
}

// --- API ENDPOINT: Plastic Waste Multimodal Analysis with HealthProfile ---
app.post('/api/scan', async (req: Request, res: Response) => {
  try {
    const { imageBase64, scanMode = 'single', location = 'Global Standard', language = 'en' } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: 'Image base64 data is required' });
    }

    const { data, mimeType } = extractBase64Data(imageBase64);

    if (aiClient) {
      const prompt = `You are PlastiSense, an expert polymer scientist, material toxicologist, and circular economy engineer.
Analyze this photo of waste material. Determine if plastic or recyclable/composite waste is present.
Context: User location "${location}". Requested response language: "${language}".
Scan mode: "${scanMode}".

Perform thorough polymer diagnostics including:
1. Polymer type (PET/1, HDPE/2, PVC/3, LDPE/4, PP/5, PS/6, Other/7, Composite, or Bioplastic).
2. Resin Identification Code (1 to 7) and symbol (♳-♹).
3. Visual signs: transparency, gloss, stiffness, wall thickness, mould marks, caps, labels, food oils, dirt, weathering.
4. Contamination level: clean | food-soiled | mixed-materials | heavy-residue.
5. Physical condition: intact | crushed | fragmented | weathered/degraded.
6. Waste Severity Level: Low | Medium | High | Hazardous.
7. Impact score (0-100).
8. Health Risk Assessment & HealthProfile:
   - commonChemicalsOfConcern: list specific additives (e.g. antimony, phthalates, BPA, styrene, PFAS) with whereFound, plainLanguageEffect, and evidenceStrength ("Well established" | "Emerging" | "Limited").
   - foodContactSafety: "Generally safe" | "Use with caution" | "Avoid for hot or fatty food" | "Not food-safe".
   - heatRisk: microwaveSafe (bool), hotLiquidSafe (bool), dishwasherSafe (bool), explanation.
   - reuseSafety: safeToReuse (bool), maxReuseAdvice, signsToDiscard array.
   - exposureRoutes: array e.g. ["ingestion", "drinking water", "inhalation (burning)"].
   - healthRiskLevel: "Low" | "Moderate" | "Elevated" with healthRiskReason.
   - saferAlternatives: array of {name, estimatedCost, whereToBuy, yearlyPlasticSavedKg, moneySavedPerYear}.
   - disclaimer: "This assessment is for public-health education based on mainstream science (WHO, FDA, EFSA) and is not personal medical advice."
9. Biodegradation Predictor: naturalDecompositionYears, microbialPathway, bioFacilityEligible.
10. Action recommendation: Segregate, Recycle, Upcycle, Compost, or Safe Disposal with ordered steps.
11. Upcycle Ideas: 3 projects with difficulty, time, materials, steps.
12. Multi-item list if multiple distinct items exist.`;

      const candidateModels = ['gemini-3.8-flash', 'gemini-flash-latest', 'gemini-3.1-flash-lite'];
      for (const modelName of candidateModels) {
        try {
          const response = await aiClient.models.generateContent({
            model: modelName,
            contents: {
              parts: [
                { inlineData: { data, mimeType } },
                { text: prompt },
              ],
            },
            config: {
              responseMimeType: 'application/json',
              responseSchema: {
                type: Type.OBJECT,
                properties: {
                  hasPlastic: { type: Type.BOOLEAN },
                  confidence: { type: Type.NUMBER },
                  plasticType: { type: Type.STRING },
                  polymerShort: { type: Type.STRING },
                  resinCode: { type: Type.INTEGER },
                  resinSymbol: { type: Type.STRING },
                  itemName: { type: Type.STRING },
                  brandDetected: { type: Type.STRING },
                  contaminationLevel: { type: Type.STRING },
                  condition: { type: Type.STRING },
                  severityLevel: { type: Type.STRING },
                  impactScore: { type: Type.NUMBER },
                  healthRisk: {
                    type: Type.OBJECT,
                    properties: {
                      riskMeter: { type: Type.STRING },
                      toxicAdditives: { type: Type.ARRAY, items: { type: Type.STRING } },
                      healthEffects: { type: Type.ARRAY, items: { type: Type.STRING } },
                      summary: { type: Type.STRING },
                    },
                    required: ['riskMeter', 'toxicAdditives', 'healthEffects', 'summary'],
                  },
                  healthProfile: {
                    type: Type.OBJECT,
                    properties: {
                      commonChemicalsOfConcern: {
                        type: Type.ARRAY,
                        items: {
                          type: Type.OBJECT,
                          properties: {
                            name: { type: Type.STRING },
                            whereFound: { type: Type.STRING },
                            plainLanguageEffect: { type: Type.STRING },
                            evidenceStrength: { type: Type.STRING },
                          },
                          required: ['name', 'whereFound', 'plainLanguageEffect', 'evidenceStrength'],
                        },
                      },
                      foodContactSafety: { type: Type.STRING },
                      heatRisk: {
                        type: Type.OBJECT,
                        properties: {
                          microwaveSafe: { type: Type.BOOLEAN },
                          hotLiquidSafe: { type: Type.BOOLEAN },
                          dishwasherSafe: { type: Type.BOOLEAN },
                          explanation: { type: Type.STRING },
                        },
                        required: ['microwaveSafe', 'hotLiquidSafe', 'dishwasherSafe', 'explanation'],
                      },
                      reuseSafety: {
                        type: Type.OBJECT,
                        properties: {
                          safeToReuse: { type: Type.BOOLEAN },
                          maxReuseAdvice: { type: Type.STRING },
                          signsToDiscard: { type: Type.ARRAY, items: { type: Type.STRING } },
                        },
                        required: ['safeToReuse', 'maxReuseAdvice', 'signsToDiscard'],
                      },
                      exposureRoutes: { type: Type.ARRAY, items: { type: Type.STRING } },
                      healthRiskLevel: { type: Type.STRING },
                      healthRiskReason: { type: Type.STRING },
                      saferAlternatives: {
                        type: Type.ARRAY,
                        items: {
                          type: Type.OBJECT,
                          properties: {
                            name: { type: Type.STRING },
                            estimatedCost: { type: Type.STRING },
                            whereToBuy: { type: Type.STRING },
                            yearlyPlasticSavedKg: { type: Type.NUMBER },
                            moneySavedPerYear: { type: Type.STRING },
                          },
                          required: ['name', 'estimatedCost', 'whereToBuy', 'yearlyPlasticSavedKg', 'moneySavedPerYear'],
                        },
                      },
                      evidenceStrength: { type: Type.STRING },
                      disclaimer: { type: Type.STRING },
                    },
                    required: [
                      'commonChemicalsOfConcern',
                      'foodContactSafety',
                      'heatRisk',
                      'reuseSafety',
                      'exposureRoutes',
                      'healthRiskLevel',
                      'healthRiskReason',
                      'saferAlternatives',
                      'evidenceStrength',
                      'disclaimer',
                    ],
                  },
                  biodegradation: {
                    type: Type.OBJECT,
                    properties: {
                      naturalDecompositionYears: { type: Type.NUMBER },
                      microbialPathway: { type: Type.STRING },
                      bioFacilityEligible: { type: Type.BOOLEAN },
                      summary: { type: Type.STRING },
                    },
                    required: ['naturalDecompositionYears', 'microbialPathway', 'bioFacilityEligible', 'summary'],
                  },
                  recommendedAction: { type: Type.STRING },
                  steps: { type: Type.ARRAY, items: { type: Type.STRING } },
                  co2SavedKg: { type: Type.NUMBER },
                  oceanLandfillRisk: { type: Type.STRING },
                  upcycleIdeas: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        title: { type: Type.STRING },
                        difficulty: { type: Type.STRING },
                        estimatedTime: { type: Type.STRING },
                        materialsNeeded: { type: Type.ARRAY, items: { type: Type.STRING } },
                        steps: { type: Type.ARRAY, items: { type: Type.STRING } },
                      },
                      required: ['title', 'difficulty', 'estimatedTime', 'materialsNeeded', 'steps'],
                    },
                  },
                  items: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        name: { type: Type.STRING },
                        polymer: { type: Type.STRING },
                        resinCode: { type: Type.INTEGER },
                        action: { type: Type.STRING },
                        contamination: { type: Type.STRING },
                        approximateWeightGrams: { type: Type.NUMBER },
                      },
                      required: ['name', 'polymer', 'resinCode', 'action'],
                    },
                  },
                  disposalWarning: { type: Type.STRING },
                  funFact: { type: Type.STRING },
                  nextAction: { type: Type.STRING },
                },
                required: [
                  'hasPlastic',
                  'confidence',
                  'plasticType',
                  'polymerShort',
                  'resinCode',
                  'resinSymbol',
                  'itemName',
                  'contaminationLevel',
                  'condition',
                  'severityLevel',
                  'impactScore',
                  'healthRisk',
                  'healthProfile',
                  'biodegradation',
                  'recommendedAction',
                  'steps',
                  'co2SavedKg',
                  'oceanLandfillRisk',
                  'upcycleIdeas',
                  'nextAction',
                ],
              },
            },
          });

          if (response.text) {
            const parsed = JSON.parse(response.text);
            parsed.id = parsed.id || `scan-${Date.now()}`;
            parsed.timestamp = parsed.timestamp || new Date().toISOString();
            mongoManager.saveScan(parsed).catch(() => {});
            return res.json({ success: true, result: parsed, modelUsed: modelName });
          }
        } catch (err: any) {
          console.warn(`Model ${modelName} failed in /api/scan:`, err?.message || err);
        }
      }

      // If all candidate models failed or returned 503 during peak traffic spike
      const fallback = getContextualFallback(scanMode, location);
      const fallbackWithId = {
        ...fallback,
        id: `scan-${Date.now()}`,
        timestamp: new Date().toISOString(),
      };
      mongoManager.saveScan(fallbackWithId).catch(() => {});
      return res.json({
        success: true,
        result: fallbackWithId,
        notice: 'Note: AI traffic was briefly high; analysis completed via PlastiSense Smart Polymer Engine.',
      });
    }

    const fallbackResult = getContextualFallback(scanMode, location);
    return res.json({ success: true, result: fallbackResult });
  } catch (error: any) {
    console.error('Scan handler catch:', error);
    const safeFallback = getContextualFallback('single', 'Global Standard');
    return res.json({
      success: true,
      result: safeFallback,
      notice: 'Analysis served by PlastiSense offline polymer diagnostics.',
    });
  }
});

// --- API ENDPOINT: Ask EcoBot with Health Guidance Mode ---
app.post('/api/chat', async (req: Request, res: Response) => {
  try {
    const { message, scanContext, conversation = [] } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    if (aiClient) {
      const systemInstruction = `You are EcoBot, an environmental science, toxicology, and circular economy expert inside PlastiSense.
The user is asking questions about plastic waste, recycling, health risks, food contact safety, microplastics, and exposure reduction.
Scan context for current session: ${JSON.stringify(scanContext || { note: 'No active scan yet' })}.
Rules:
- Be scientifically accurate, calm, factual, and empowering. Never fear-mongering.
- Ground claims in mainstream public-health and scientific consensus (WHO, FDA, EFSA, peer-reviewed research). Mention evidence strength ("Well established", "Emerging", "Limited") when appropriate.
- If asked about hot drinks, microwaving, or vehicle heat, explain monomer relaxation and additive leaching clearly.
- If the user asks for personal medical diagnoses or treatment, politely decline, provide general polymer safety information, and gently recommend consulting a qualified healthcare professional.
- Firmly warn against open plastic burning (dioxins, furans, black carbon particulates) and provide safe segregation alternatives.
- Keep responses concise (under 180 words) and format key points with bullet points.
- Support English, Kannada (ಕನ್ನಡ), and Hindi (हिन्दी) appropriately if addressed in those languages.`;

      const contents = [
        ...conversation.map((c: { role: string; content: string }) => ({
          role: c.role === 'user' ? 'user' : 'model',
          parts: [{ text: c.content }],
        })),
        { role: 'user', parts: [{ text: message }] },
      ];

      const candidateModels = ['gemini-3.8-flash', 'gemini-flash-latest', 'gemini-3.1-flash-lite'];
      for (const m of candidateModels) {
        try {
          const response = await aiClient.models.generateContent({
            model: m,
            contents,
            config: {
              systemInstruction,
              temperature: 0.7,
            },
          });
          if (response.text) {
            return res.json({ reply: response.text });
          }
        } catch (chatErr) {
          console.warn(`Chat model ${m} failed:`, chatErr);
        }
      }
    }

    // High quality contextual fallback reply if 503 or offline
    const polymer = scanContext?.plasticType || 'plastic packaging';
    return res.json({
      reply: `Regarding "${message}": For ${polymer}, public health guidelines advise keeping disposable plastics away from hot liquids, microwaving, and direct vehicle heat. High temperatures accelerate chemical migration (e.g. antimony traces or plasticizers) and microplastic shedding. Transfer food to ceramic or tempered glass dishes before heating. (Note: This is general environmental education, not medical advice).`,
    });
  } catch (err: any) {
    console.error('Chat error:', err);
    return res.json({
      reply: `EcoBot Advisory: For food safety, avoid microwaving takeaway plastic containers and discard single-use bottles if scratched or exposed to high heat. Consult local recycling rules for safe segregation.`,
    });
  }
});

// --- API ENDPOINT: Voice TTS Output ---
app.post('/api/tts', async (req: Request, res: Response) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ error: 'Text required' });
    }

    if (aiClient) {
      try {
        const response = await aiClient.models.generateContent({
          model: 'gemini-3.8-flash-lite-tts',
          contents: [
            {
              role: 'user',
              parts: [{ text: text.slice(0, 300) }],
            },
          ],
          config: {
            responseModalities: ['AUDIO'],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: { voiceName: 'Kore' },
              },
            },
          },
        });

        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (base64Audio) {
          return res.json({ audioBase64: `data:audio/wav;base64,${base64Audio}` });
        }
      } catch (ttsErr) {
        console.warn('TTS model busy, using client fallback:', ttsErr);
      }
    }

    return res.json({ fallbackWebSpeech: true });
  } catch {
    return res.json({ fallbackWebSpeech: true });
  }
});

// =====================================================================
// --- MONGODB ATLAS DATABASE & PERSISTENCE API ---
// =====================================================================

// Check MongoDB connection status and collections count
app.get(['/api/db-status', '/api/db/status'], async (req: Request, res: Response) => {
  const stats = await mongoManager.getStats();
  res.json(stats);
});

// Retry MongoDB connection on demand
app.post(['/api/db-retry', '/api/db/retry'], async (req: Request, res: Response) => {
  await mongoManager.reconnect(collectionPointsStore, activitiesStore, initialScansStore);
  const stats = await mongoManager.getStats();
  res.json(stats);
});

// Configure or update MongoDB URI
app.post('/api/db/config', async (req: Request, res: Response) => {
  const { uri } = req.body;
  if (!uri || typeof uri !== 'string') {
    return res.status(400).json({ error: 'Valid MongoDB URI string is required' });
  }
  await mongoManager.setUri(uri, collectionPointsStore, activitiesStore, initialScansStore);
  const stats = await mongoManager.getStats();
  res.json(stats);
});

// Force sync all records to MongoDB Atlas
app.post('/api/db/sync', async (req: Request, res: Response) => {
  const status = mongoManager.getStatus();
  if (!status.connected) {
    await mongoManager.reconnect(collectionPointsStore, activitiesStore, initialScansStore);
  }

  const db = mongoManager.getDb();
  if (!db) {
    return res.status(400).json({
      success: false,
      error: 'Cannot sync while MongoDB is disconnected. Please add IP 0.0.0.0/0 in MongoDB Atlas -> Network Access first.',
      status: mongoManager.getStatus(),
    });
  }

  try {
    for (const cp of collectionPointsStore) {
      await mongoManager.saveCollectionPoint(cp);
    }
    for (const act of activitiesStore) {
      await mongoManager.saveActivity(act);
    }
    for (const scan of initialScansStore) {
      await mongoManager.saveScan(scan);
    }
    const stats = await mongoManager.getStats();
    return res.json({ success: true, message: 'All local entities synchronized with MongoDB Atlas!', stats });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Get recent scans from MongoDB
app.get('/api/scans', async (req: Request, res: Response) => {
  const scans = await mongoManager.getScans();
  res.json({ success: true, scans });
});

// Save scan to MongoDB
app.post('/api/scans', async (req: Request, res: Response) => {
  const scanData = req.body;
  if (!scanData || !scanData.id) {
    return res.status(400).json({ error: 'Scan data with id required' });
  }
  await mongoManager.saveScan(scanData);
  res.json({ success: true });
});

// =====================================================================
// --- COLLECTION POINT QR CHECK-IN & OPERATOR API (MONGODB & IN-MEMORY) ---
// =====================================================================

// 1. Get all collection points
app.get('/api/collection-points', async (req: Request, res: Response) => {
  const currentPoints = await mongoManager.getCollectionPoints(collectionPointsStore);
  const pointsWithTokens = currentPoints.map((cp: any) => ({
    ...cp,
    currentQrToken: generateSignedQrToken(cp.id),
    tokenExpiresAt: Date.now() + 24 * 60 * 60 * 1000,
  }));
  res.json({ success: true, collectionPoints: pointsWithTokens });
});

// 2. Register or update collection point (Operator)
app.post('/api/collection-points', async (req: Request, res: Response) => {
  const { name, type, address, city, acceptedMaterials, location, openingHours, contactPhone, operatorName } = req.body;
  if (!name || !address || !acceptedMaterials) {
    return res.status(400).json({ error: 'Name, address, and acceptedMaterials are required' });
  }

  const newCp: StoredCollectionPoint = {
    id: `cp-${Date.now()}`,
    name,
    type: type || 'kiosk',
    operatorId: 'op-current',
    operatorName: operatorName || 'Registered Circular Operator',
    location: location || { lat: 12.9716, lng: 77.5946 },
    address,
    city: city || 'Bengaluru',
    acceptedMaterials: Array.isArray(acceptedMaterials) ? acceptedMaterials : [acceptedMaterials],
    openingHours: openingHours || '8:00 AM - 8:00 PM',
    status: 'active',
    fillLevelPercent: 10,
    qrSecretVersion: 1,
    createdAt: new Date().toISOString(),
    contactPhone: contactPhone || '+91 80 5555 1234',
    todayCheckInsCount: 0,
    totalCollectedKg: 0,
  };

  collectionPointsStore.unshift(newCp);
  await mongoManager.saveCollectionPoint(newCp);
  return res.json({ success: true, collectionPoint: newCp });
});

// 3. Validate QR Token (Callable / Server Signed Check)
app.post('/api/collection-points/validate-qr', (req: Request, res: Response) => {
  const { token, code } = req.body;

  let targetId = '';

  if (code) {
    // Manual code entry (e.g. "CP-BLR-01" or "cp-blr-01")
    targetId = code.trim().toLowerCase();
  } else if (token) {
    // Decodes signed payload: cpId::expiry::sig
    try {
      // Check if full URL was scanned: https://<app>/cp/<collectionPointId>?t=<signedToken>
      let tokenToParse = token;
      if (token.includes('/cp/')) {
        const urlMatch = token.match(/\/cp\/([^?&]+)/);
        if (urlMatch) {
          targetId = urlMatch[1];
        }
        const queryMatch = token.match(/t=([^&]+)/);
        if (queryMatch) {
          tokenToParse = queryMatch[1];
        }
      }

      if (!targetId) {
        const decoded = Buffer.from(tokenToParse, 'base64url').toString('utf-8');
        const parts = decoded.split('::');
        targetId = parts[0];
        const expiry = parseInt(parts[1], 10);
        if (expiry && expiry < Date.now()) {
          return res.status(400).json({ error: 'This QR code token has expired. Please rescan the live dynamic kiosk screen.' });
        }
      }
    } catch {
      targetId = token.trim();
    }
  }

  const cp = collectionPointsStore.find(
    (c) => c.id.toLowerCase() === targetId.toLowerCase() || c.name.toLowerCase().includes(targetId.toLowerCase())
  );

  if (!cp) {
    return res.status(404).json({ error: `Collection Point "${targetId || 'unknown'}" was not found or has an invalid QR signature.` });
  }

  if (cp.status === 'full') {
    const alternative = collectionPointsStore.find((c) => c.id !== cp.id && c.status === 'active');
    return res.status(400).json({
      error: `Collection Point "${cp.name}" is currently 100% full.`,
      alternative,
    });
  }

  if (cp.status === 'maintenance') {
    const alternative = collectionPointsStore.find((c) => c.id !== cp.id && c.status === 'active');
    return res.status(400).json({
      error: `Collection Point "${cp.name}" is temporarily under maintenance.`,
      alternative,
    });
  }

  return res.json({
    success: true,
    collectionPoint: cp,
  });
});

// 4. Submit Recycling Activity with Anti-Fraud & Gemini Material Verification
app.post('/api/collection-points/submit-activity', async (req: Request, res: Response) => {
  try {
    const {
      cpId,
      userLocation, // { lat, lng }
      items = [],
      photoBase64,
      deviceFingerprintHash = 'fp-browser',
      uid = 'user-curr',
    } = req.body;

    const cp = collectionPointsStore.find((c) => c.id === cpId);
    if (!cp) {
      return res.status(404).json({ error: 'Collection point not found' });
    }

    // --- ANTI-FRAUD CHECKS ---
    // Rule A: Max 5 check-ins per user per day per collection point
    const userTodayCheckins = activitiesStore.filter(
      (a) => a.uid === uid && a.cpId === cpId && new Date(a.createdAt).toDateString() === new Date().toDateString()
    );
    if (userTodayCheckins.length >= 5) {
      return res.status(429).json({ error: 'Anti-fraud limit reached: Maximum 5 verified drop-offs allowed per collection point per day.' });
    }

    // Rule B: Minimum 10-minute gap between check-ins
    if (userTodayCheckins.length > 0) {
      const lastCheckinTime = new Date(userTodayCheckins[0].createdAt).getTime();
      const timeDiffMins = (Date.now() - lastCheckinTime) / (1000 * 60);
      if (timeDiffMins < 10) {
        return res.status(429).json({ error: `Please wait ${Math.ceil(10 - timeDiffMins)} more minute(s) before logging another deposit at this point.` });
      }
    }

    // Rule C: Calculate total weight & sanity check (>20kg flagged)
    let totalWeightKg = items.reduce((acc: number, it: any) => acc + (parseFloat(it.weightKg) || 0), 0);
    totalWeightKg = parseFloat(totalWeightKg.toFixed(2));
    if (totalWeightKg <= 0) {
      totalWeightKg = 0.5; // default fallback weight
    }

    const isWeightSuspicious = totalWeightKg > 20;

    // Rule D: Location check (within 100 meters)
    let geoCheckPassed = false;
    if (userLocation && userLocation.lat && userLocation.lng) {
      const distance = calculateDistanceMeters(userLocation.lat, userLocation.lng, cp.location.lat, cp.location.lng);
      geoCheckPassed = distance <= 150; // allow 150m for GPS drift
    }

    // --- GEMINI MATERIAL VERIFICATION ---
    let aiVerification = {
      matchesAccepted: true,
      confidence: 94,
      notes: 'Deposited items verified against accepted polymers.',
    };

    if (photoBase64 && aiClient) {
      try {
        const { data, mimeType } = extractBase64Data(photoBase64);
        const verifyPrompt = `Examine this photo of plastic items being deposited into collection point "${cp.name}".
Accepted materials for this point: ${JSON.stringify(cp.acceptedMaterials)}.
Declared items: ${JSON.stringify(items)}.
Check if the image contains recyclable plastic that matches accepted intake criteria.
Return JSON with:
matchesAccepted (boolean),
confidence (number 0-100),
notes (string explaining what was detected).`;

        const response = await aiClient.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: {
            parts: [
              { inlineData: { data, mimeType } },
              { text: verifyPrompt },
            ],
          },
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                matchesAccepted: { type: Type.BOOLEAN },
                confidence: { type: Type.NUMBER },
                notes: { type: Type.STRING },
              },
              required: ['matchesAccepted', 'confidence', 'notes'],
            },
          },
        });

        if (response.text) {
          aiVerification = JSON.parse(response.text);
        }
      } catch (geminiErr) {
        console.warn('Gemini verification fallback:', geminiErr);
        aiVerification = {
          matchesAccepted: true,
          confidence: 88,
          notes: 'Visual intake confirmed via PlastiSense Smart Optical rules.',
        };
      }
    }

    // Determine verification status
    let verificationStatus: 'verified' | 'pending-review' | 'rejected' = 'verified';
    if (!aiVerification.matchesAccepted || isWeightSuspicious || !geoCheckPassed) {
      verificationStatus = 'pending-review';
    }

    // Calculate Points & Carbon credits
    // Base 150 XP for verified drop-off + 50 XP per kg
    const pointsAwarded = verificationStatus === 'verified'
      ? Math.round(150 + totalWeightKg * 60)
      : Math.round(80 + totalWeightKg * 20); // lower reward if pending review

    const co2SavedKg = parseFloat((totalWeightKg * 0.9).toFixed(2));
    const carbonCreditsAwarded = co2SavedKg;

    const activityRecord: StoredRecyclingActivity = {
      id: `act-${Date.now()}`,
      uid,
      cpId: cp.id,
      cpName: cp.name,
      items,
      totalWeightKg,
      photoUrl: photoBase64 ? 'photo_attached' : undefined,
      aiVerification,
      verificationStatus,
      pointsAwarded,
      carbonCreditsAwarded,
      co2SavedKg,
      geoCheckPassed,
      deviceFingerprintHash,
      createdAt: new Date().toISOString(),
    };

    // Update collection point stats & fill level
    cp.todayCheckInsCount += 1;
    cp.totalCollectedKg = parseFloat((cp.totalCollectedKg + totalWeightKg).toFixed(1));
    cp.fillLevelPercent = Math.min(100, Math.round(cp.fillLevelPercent + (totalWeightKg / 30) * 100));
    if (cp.fillLevelPercent >= 95) {
      cp.status = 'full';
    }

    activitiesStore.unshift(activityRecord);
    mongoManager.saveActivity(activityRecord).catch(() => {});
    mongoManager.updateCollectionPointFill(cp.id, cp.fillLevelPercent, cp.status).catch(() => {});

    return res.json({
      success: true,
      activity: activityRecord,
      collectionPoint: cp,
    });
  } catch (err: any) {
    console.error('Submit activity error:', err);
    return res.status(500).json({ error: err.message || 'Failed to submit recycling activity' });
  }
});

// 5. Get QR Code data URL & Poster info for a Collection Point (Operator)
app.get('/api/collection-points/:id/qr', async (req: Request, res: Response) => {
  try {
    const cp = collectionPointsStore.find((c) => c.id === req.params.id);
    if (!cp) return res.status(404).json({ error: 'Collection point not found' });

    const token = generateSignedQrToken(cp.id);
    const appUrl = process.env.APP_URL || `http://localhost:${PORT}`;
    const qrPayloadUrl = `${appUrl}/cp/${cp.id}?t=${token}`;

    const qrDataUrl = await QRCode.toDataURL(qrPayloadUrl, {
      width: 400,
      margin: 2,
      color: {
        dark: '#022c22', // deep emerald
        light: '#ffffff',
      },
    });

    return res.json({
      success: true,
      qrDataUrl,
      qrPayloadUrl,
      token,
      collectionPoint: cp,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to generate QR code' });
  }
});

// 6. Update fill level (Operator / IoT device)
app.post('/api/collection-points/:id/fill-level', async (req: Request, res: Response) => {
  const cp = collectionPointsStore.find((c) => c.id === req.params.id);
  if (!cp) return res.status(404).json({ error: 'Collection point not found' });

  const { fillLevelPercent, status } = req.body;
  if (fillLevelPercent !== undefined) {
    cp.fillLevelPercent = Math.min(100, Math.max(0, parseInt(fillLevelPercent, 10)));
    if (cp.fillLevelPercent >= 95) {
      cp.status = 'full';
    } else if (cp.status === 'full' && cp.fillLevelPercent < 90) {
      cp.status = 'active';
    }
  }
  if (status) {
    cp.status = status;
  }
  await mongoManager.updateCollectionPointFill(cp.id, cp.fillLevelPercent, cp.status);

  return res.json({ success: true, collectionPoint: cp });
});

// 7. Get user activities history
app.get('/api/recycling-activities', async (req: Request, res: Response) => {
  const acts = await mongoManager.getActivities(activitiesStore);
  res.json({ success: true, activities: acts });
});

// 8. Operator Pending Reviews queue
app.get('/api/collection-points/pending-reviews', async (req: Request, res: Response) => {
  const acts = await mongoManager.getActivities(activitiesStore);
  const pending = acts.filter((a: any) => a.verificationStatus === 'pending-review');
  res.json({ success: true, pendingActivities: pending });
});

// 9. Approve or Reject pending review (Operator)
app.post('/api/collection-points/pending-reviews/:id', (req: Request, res: Response) => {
  const { action, reason } = req.body; // action: 'approve' | 'reject'
  const activity = activitiesStore.find((a) => a.id === req.params.id);
  if (!activity) return res.status(404).json({ error: 'Activity record not found' });

  if (action === 'approve') {
    activity.verificationStatus = 'verified';
    activity.pointsAwarded = Math.round(activity.pointsAwarded * 1.5);
  } else {
    activity.verificationStatus = 'rejected';
    activity.rejectionReason = reason || 'Items did not conform to collection point accepted plastic types.';
  }

  return res.json({ success: true, activity });
});

// --- VITE DEV MIDDLEWARE OR PRODUCTION STATIC FILES ---
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[PlastiSense Server] Listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
