export type Page = 'home' | 'crop' | 'schemes' | 'market' | 'login' | 'register' | 'profile' | 'community';

export type Language = 'en' | 'hi' | 'bn' | 'sat' | 'nag' | 'kho';

export interface SoilData {
  ph: number;
  nitrogen: number;
  phosphorus: number;
  potassium: number;
  moisture: number;
  landSize: number; // in acres
  image?: File;
}

export interface LocationSoilData {
  locationName: string;
  ph: number;
  nitrogen: number;
  phosphorus: number;
  potassium: number;
  moisture: number;
}

export type RiskLevel = 'Low' | 'Medium' | 'High';

export interface RiskProfile {
    pestRisk: RiskLevel;
    waterDemand: RiskLevel;
    marketVolatility: RiskLevel;
    inputCost: RiskLevel;
}

export interface CropRecommendation {
  cropName: string;
  suitability: number; // Percentage
  confidenceScore: number; // AI confidence percentage
  expectedProfitPerAcre: number; // in INR
  riskProfile: RiskProfile;
  reason: string;
  fertilizerPlan: string;
  irrigationSchedule: string;
  waterManagement: string;
  marketInsights: string;
  cropRotationTip: string;
  // New Fields for innovative features
  idealSoilConditions: {
    ph: [number, number];
    nitrogen: [number, number];
    phosphorus: [number, number];
    potassium: [number, number];
  };
  expectedYieldPerAcre: [number, number]; // [min, max] in quintals
  estimatedWaterUsage: number; // in mm for the season
  sustainabilityScore: number; // 0-100
  carbonSequestrationPotential: number; // tons of CO2e per acre/year
  cropCalendar: {
    sowingWindow: string;
    fertilizerApplication: string;
    irrigationMilestones: string;
    pestScouting: string;
    harvestWindow: string;
  };
  pestAlerts: string[];
  averageYieldInRegion: string; // e.g., "4.5 tons/acre"
}

export interface CropDiseaseDiagnosis {
  diseaseName: string; // e.g., "Tomato Late Blight" or "Healthy"
  confidenceScore: number; // 0-100
  description: string;
  recommendedActions: string[];
}


export type SchemeCategory = 'Insurance' | 'Subsidy' | 'Credit' | 'Irrigation' | 'General';

export interface MultilingualString {
  en: string;
  hi: string;
  bn: string;
  sat: string;
  nag: string;
  kho: string;
}

export interface Scheme {
  id: string;
  title: MultilingualString;
  summary: MultilingualString;
  keyBenefit?: MultilingualString;
  benefits: MultilingualString[];
  eligibility: MultilingualString;
  documents: MultilingualString[];
  applyLink: string;
  state: 'Central' | string;
  cropType: 'Any' | string;
  category: SchemeCategory;
  tags: MultilingualString[];
  isNew?: boolean;
  popularity?: number; // for sorting
}

export interface ChatMessage {
  text: string;
  sender: 'user' | 'ai';
}

export interface Mandi {
    id: string;
    name: MultilingualString;
    district: MultilingualString;
}

export interface MarketPrice {
    cropId: string;
    cropName: MultilingualString;
    price: number; // per quintal
    trend: 'up' | 'down' | 'stable';
    aiForecast: MultilingualString;
    priceHistory?: { date: string; price: number }[];
    priceChange?: { day: number; week: number };
    marketArrivals?: number; // in tonnes
    marketSentiment?: string;
}

export interface UserHarvest {
  cropId: string;
  quantity: number; // in quintals
}

export interface User {
  id: string;
  email: string;
  name: string;
  age: number | '';
  gender: 'male' | 'female' | 'other' | '';
  landSize: number | ''; // in acres
  soilType: string;
  irrigationMethod: string;
  usualCrops: string;
  state: string;
  district: string;
}

export interface Comment {
    id: string;
    author: {
        id: string;
        name: string;
    };
    text: string;
    timestamp: string;
}

export interface CommunityPost {
    id: string;
    author: {
        id: string;
        name: string;
        avatarInitial: string;
    };
    timestamp: string;
    text: string;
    imageUrl?: string;
    likes: string[]; // Array of user IDs who liked it
    comments: Comment[];
}