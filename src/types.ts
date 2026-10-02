export type MoonPhaseName = 
  | 'new_moon' 
  | 'waxing_crescent' 
  | 'first_quarter' 
  | 'waxing_gibbous' 
  | 'full_moon' 
  | 'waning_gibbous' 
  | 'last_quarter' 
  | 'waning_crescent';

export type FishingRatingLevel = 'eccellente' | 'ottimo' | 'buono' | 'medio' | 'basso';

export interface TidePoint {
  time: string; // 'HH:mm'
  hourFraction: number; // 0 to 24
  heightCm: number; // relative to ZMPS (Zero Mareografico Punta della Salute)
  trend: 'rising' | 'falling' | 'slack_high' | 'slack_low';
  currentSpeed: number; // 0 (slack) to 100 (max current)
}

export interface TideExtremum {
  time: string; // 'HH:mm'
  hourFraction: number;
  heightCm: number;
  type: 'high' | 'low';
  label: string; // 'Colmo' or 'Secca'
}

export interface BestFishingWindow {
  id: string;
  startHour: string; // 'HH:mm'
  endHour: string; // 'HH:mm'
  startFraction: number;
  endFraction: number;
  score: number; // 0 - 100
  title: string;
  reason: string;
  suggestedBait: string;
  suggestedSpots: string;
  tideContext: string;
}

export interface HourFishingData {
  hour: number; // 0 to 23
  timeLabel: string; // '00:00', '01:00'
  activityScore: number; // 0 - 100
  tideHeightCm: number;
  tideTrend: 'rising' | 'falling' | 'slack_high' | 'slack_low';
  isBestWindow: boolean;
  solunarMajor: boolean;
  solunarMinor: boolean;
  isDawnOrDusk: boolean;
}

export interface DayFishingData {
  date: Date;
  dateString: string; // 'YYYY-MM-DD'
  overallScore: number; // 0 - 100
  ratingLevel: FishingRatingLevel;
  ratingLabel: string;
  stars: number; // 1 to 5
  moonPhase: MoonPhaseName;
  moonPhaseLabel: string;
  moonIllumination: number; // 0 to 100%
  moonAgeDays: number; // 0 to 29.5
  isSizigia: boolean; // Luna nuova o piena (grandi maree)
  isQuadratura: boolean; // Quarti (maree deboli)
  seasonScore: number; // seasonal orata migration multiplier
  seasonDescription: string;
  sunriseTime: string;
  sunsetTime: string;
  extremes: TideExtremum[];
  hourlyActivity: HourFishingData[];
  bestWindows: BestFishingWindow[];
  waterTempEstimated: number; // in Celsius
  topRecommendedBait: string;
  topRecommendedRig: string;
  lagoonAdvice: string;
}

export interface VeniceSpot {
  id: string;
  name: string;
  zone: 'Bocche di Porto' | 'Canali Navigabili' | 'Barene e Bassifondi' | 'Laguna Nord' | 'Laguna Sud';
  depthRange: string;
  bestTidePhase: string;
  description: string;
  targetOrataSize: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  recommendedBaits: string[];
  tacticalTip: string;
}

export interface FishingTripNote {
  id: string;
  dateString: string;
  spotName: string;
  plannedTime: string;
  notes: string;
  baitUsed?: string;
  createdAt: number;
}
