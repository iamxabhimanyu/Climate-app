export type PersonaId =
  | 'fitness'
  | 'commuter'
  | 'traveler'
  | 'health'
  | 'family'
  | 'agriculture'
  | 'beach';

export type FitnessActivityType = 'running' | 'walking' | 'cycling' | 'workout';

export interface PersonaProfile {
  id: PersonaId;
  name: string;
  shortName: string;
  iconName: string;
  tagline: string;
  color: string;
  badgeBg: string;
}

export type WeatherCondition =
  | 'sunny'
  | 'partly-cloudy'
  | 'cloudy'
  | 'rain'
  | 'heavy-rain'
  | 'thunderstorm'
  | 'foggy'
  | 'snow';

export type TimePhase = 'auto' | 'day' | 'night' | 'sunrise' | 'sunset';

export type AtmosphereState =
  | 'clear_day'
  | 'partly_cloudy_day'
  | 'cloudy_day'
  | 'rain_day'
  | 'heavy_rain_day'
  | 'storm_day'
  | 'foggy_day'
  | 'snow_day'
  | 'clear_night'
  | 'partly_cloudy_night'
  | 'cloudy_night'
  | 'rain_night'
  | 'heavy_rain_night'
  | 'storm_night'
  | 'foggy_night'
  | 'snow_night'
  | 'sunrise_clear'
  | 'sunrise_cloudy'
  | 'sunrise_rain'
  | 'sunset_clear'
  | 'sunset_cloudy'
  | 'sunset_rain';

export interface HourlyForecast {
  time: string;
  hour: number;
  temp: number;
  feelsLike: number;
  condition: WeatherCondition;
  conditionText: string;
  rainProb: number;
  uvIndex: number;
  windSpeed: number;
  aqi: number;
}

export interface DailyForecast {
  day: string;
  date: string;
  condition: WeatherCondition;
  conditionText: string;
  highTemp: number;
  lowTemp: number;
  rainProb: number;
  uvIndex: number;
  windSpeed: number;
  summary: string;
}

export interface EnvironmentalData {
  aqi: number;
  aqiStatus: 'Good' | 'Moderate' | 'Unhealthy for Sensitive' | 'Unhealthy' | 'Very Unhealthy' | 'Hazardous';
  pm25: number;
  pm10: number;
  no2: number;
  o3: number;
  uvIndex: number;
  uvStatus: 'Low' | 'Moderate' | 'High' | 'Very High' | 'Extreme';
  humidity: number;
  windSpeed: number;
  windDirection: string;
  windGust: number;
  visibility: number; // in km
  pressure: number; // in hPa
  dewPoint: number;
  sunrise: string;
  sunset: string;
  solarProgress: number; // 0 to 100%
}

export interface MarineData {
  waveHeight: number; // in meters
  wavePeriod: number; // in seconds
  waterTemp: number; // in °C
  tideTiming: {
    nextHighTide: string;
    nextLowTide: string;
    currentTideState: 'Rising' | 'Falling' | 'High' | 'Low';
  };
  seaCondition: 'Calm' | 'Moderate' | 'Choppy' | 'Rough' | 'Hazardous';
  beachSuitabilityScore: number; // 0-100
  surfSuitabilityScore: number; // 0-100
  ripCurrentRisk: 'Low' | 'Moderate' | 'High';
  recommendation: string;
}

export interface AgricultureData {
  soilMoisture: number; // percentage
  soilTemp: number; // in °C
  expectedRain24h: number; // in mm
  expectedRain48h: number; // in mm
  frostRisk: 'None' | 'Low' | 'Moderate' | 'High';
  evapotranspiration: number; // mm/day
  irrigationRecommendation: string;
  irrigationDelayHours: number;
  plantingGuidance: string;
  pestRisk: 'Low' | 'Moderate' | 'High';
}

export interface CommuteData {
  recommendedDeparture: string;
  avoidTimeWindow: string;
  riskReason: string;
  commuteSafetyScore: number; // 0-100
  fogRisk: 'Low' | 'Moderate' | 'High';
  stormWarning: boolean;
  recommendation: string;
}

export interface WeatherData {
  locationName: string;
  country: string;
  region: string;
  currentTemp: number;
  feelsLike: number;
  highTemp: number;
  lowTemp: number;
  condition: WeatherCondition;
  conditionText: string;
  summary: string;
  lastUpdated: string;
  timePhase?: TimePhase;
  isNight?: boolean;
  coordinates?: {
    latitude: number;
    longitude: number;
    accuracy?: number;
    isLiveGPS?: boolean;
  };
  hourly: HourlyForecast[];
  daily: DailyForecast[];
  environment: EnvironmentalData;
  marine?: MarineData;
  agriculture?: AgricultureData;
  commute?: CommuteData;
}

export type LocationPermissionStatus = 'prompt' | 'granted' | 'denied' | 'unavailable' | 'loading';

export interface UserLocationState {
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  locationName: string;
  country: string;
  region: string;
  isLiveGPS: boolean;
  isLiveSharingActive: boolean;
  permissionStatus: LocationPermissionStatus;
  lastUpdatedTime: string;
  rawTimestamp: number;
  error: string | null;
}

export interface LocationSharingSession {
  sessionId: string;
  isActive: boolean;
  locationName: string;
  latitude: number;
  longitude: number;
  updatedAt: string;
  shareUrl: string;
  weather: {
    temp: number;
    feelsLike: number;
    conditionText: string;
    condition: WeatherCondition;
    aqi: number;
    uvIndex: number;
    windSpeed: number;
    humidity: number;
    rainProb: number;
  };
  personaNote: string;
}

export interface ExplainabilityFactor {
  factor: string;
  status: 'good' | 'caution' | 'warning';
  detail: string;
}

export interface PersonalizedInsight {
  personaId: PersonaId;
  title: string;
  highlightText: string;
  score: number; // 0-100
  scoreLabel: string;
  statusBadge?: 'GOOD TO GO' | 'CAUTION' | 'NOT IDEAL' | 'HIGH RISK';
  primaryWindow?: string;
  bullets: string[];
  recommendation: string;
  actionType: 'positive' | 'warning' | 'caution' | 'alert';
  activityType?: FitnessActivityType;
  explainabilityFactors?: ExplainabilityFactor[];
  subScores?: { label: string; score: number; color?: string }[];
  secondaryMetrics?: { label: string; value: string; badge?: string; isSimulated?: boolean }[];
  packingList?: PackingItem[];
  disclaimer?: string;
}

export interface AlertItem {
  id: string;
  title: string;
  category: 'Heavy Rain' | 'Storm' | 'Fog' | 'Heat' | 'High UV' | 'Poor AQI' | 'Marine Conditions';
  severity: 'info' | 'moderate' | 'severe' | 'caution';
  time: string;
  targetPersonas: PersonaId[];
  message: string;
  recommendation: string;
  timestamp?: string;
  description?: string;
  actionRecommended?: string;
}

export type SmartAlert = AlertItem;

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  actionablePoints?: string[];
  suggestedFollowUps?: string[];
}

export interface TravelDestination {
  id: string;
  city: string;
  country: string;
  temp: number;
  condition: WeatherCondition;
  conditionText: string;
  rainProb: number;
  travelScore: number;
  travelAdvisory: string;
  popularFor: string;
}

export interface PackingItem {
  id: string;
  category: string;
  item: string;
  essential: boolean;
  checked: boolean;
  weatherReason: string;
}

export interface DemoScenario {
  id: string;
  title: string;
  description: string;
  condition: WeatherCondition;
  locationName: string;
  highlightPersona: PersonaId;
  scenarioData: WeatherData;
  timePhase?: TimePhase;
  name?: string;
  weatherData?: WeatherData;
  focusArea?: string;
}
