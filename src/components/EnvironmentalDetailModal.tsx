import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  ShieldAlert,
  SunMedium,
  Wind,
  Droplets,
  Eye,
  Sunrise,
  Sunset,
  Compass,
  Gauge,
  Sparkles,
  Info,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { EnvironmentalData } from '../types';

export type EnvironmentalMetricType = 'aqi' | 'uv' | 'wind' | 'humidity' | 'visibility' | 'solar';

interface EnvironmentalDetailModalProps {
  isOpen: boolean;
  metricType: EnvironmentalMetricType | null;
  environment: EnvironmentalData;
  locationName: string;
  onClose: () => void;
  onAskAI?: (prompt: string) => void;
}

export const EnvironmentalDetailModal: React.FC<EnvironmentalDetailModalProps> = ({
  isOpen,
  metricType,
  environment,
  locationName,
  onClose,
  onAskAI,
}) => {
  if (!isOpen || !metricType) return null;

  const getAqiColor = (aqi: number) => {
    if (aqi <= 50) return { text: 'text-emerald-300', bg: 'bg-emerald-500/20', border: 'border-emerald-400/40', label: 'Good' };
    if (aqi <= 100) return { text: 'text-amber-300', bg: 'bg-amber-500/20', border: 'border-amber-400/40', label: 'Moderate' };
    if (aqi <= 150) return { text: 'text-orange-300', bg: 'bg-orange-500/20', border: 'border-orange-400/40', label: 'Unhealthy for Sensitive' };
    if (aqi <= 200) return { text: 'text-rose-300', bg: 'bg-rose-500/20', border: 'border-rose-400/40', label: 'Unhealthy' };
    return { text: 'text-purple-300', bg: 'bg-purple-500/20', border: 'border-purple-400/40', label: 'Hazardous' };
  };

  const getUvColor = (uv: number) => {
    if (uv <= 2) return { text: 'text-emerald-300', bg: 'bg-emerald-500/20', border: 'border-emerald-400/40', label: 'Low Risk' };
    if (uv <= 5) return { text: 'text-amber-300', bg: 'bg-amber-500/20', border: 'border-amber-400/40', label: 'Moderate Risk' };
    if (uv <= 7) return { text: 'text-orange-300', bg: 'bg-orange-500/20', border: 'border-orange-400/40', label: 'High Risk' };
    return { text: 'text-rose-300', bg: 'bg-rose-500/20', border: 'border-rose-400/40', label: 'Very High / Extreme' };
  };

  const aqiDetails = getAqiColor(environment.aqi);
  const uvDetails = getUvColor(environment.uvIndex);

  const renderContent = () => {
    switch (metricType) {
      case 'aqi':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.04] border border-white/[0.08]">
              <div>
                <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-400">Current Air Quality Index</span>
                <div className="text-3xl sm:text-4xl font-extralight text-white font-['Outfit'] mt-0.5">
                  {environment.aqi} <span className="text-xs sm:text-sm font-semibold text-slate-300">AQI</span>
                </div>
              </div>
              <div className={`px-3 py-1.5 rounded-xl border font-bold text-xs ${aqiDetails.text} ${aqiDetails.bg} ${aqiDetails.border}`}>
                {environment.aqiStatus}
              </div>
            </div>

            {/* Scale Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-[11px] text-slate-400 font-medium">
                <span>0 (Clean)</span>
                <span>50</span>
                <span>100</span>
                <span>150</span>
                <span>200+ (Hazardous)</span>
              </div>
              <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 via-amber-400 via-orange-400 via-rose-500 to-purple-600 rounded-full" />
                <div
                  className="absolute top-0 bottom-0 w-3 h-3 -mt-0.5 bg-white rounded-full shadow-lg border border-slate-900"
                  style={{ left: `${Math.min(96, Math.max(4, (environment.aqi / 300) * 100))}%` }}
                />
              </div>
            </div>

            {/* Pollutants Breakdown Grid */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wide">Key Particulate Breakdown</span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.06] text-center">
                  <span className="text-[10px] text-slate-400 uppercase">PM2.5 (Fine)</span>
                  <div className="text-sm font-bold text-white mt-0.5">{environment.pm25} µg/m³</div>
                  <span className="text-[9px] text-slate-400 mt-0.5 block">{environment.pm25 > 35 ? 'Elevated' : 'Safe level'}</span>
                </div>
                <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.06] text-center">
                  <span className="text-[10px] text-slate-400 uppercase">PM10 (Dust)</span>
                  <div className="text-sm font-bold text-white mt-0.5">{environment.pm10} µg/m³</div>
                  <span className="text-[9px] text-slate-400 mt-0.5 block">{environment.pm10 > 50 ? 'Moderate' : 'Good'}</span>
                </div>
                <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.06] text-center">
                  <span className="text-[10px] text-slate-400 uppercase">NO₂ Nitrogen</span>
                  <div className="text-sm font-bold text-white mt-0.5">{environment.no2} ppb</div>
                  <span className="text-[9px] text-slate-400 mt-0.5 block">Vehicle emissions</span>
                </div>
                <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.06] text-center">
                  <span className="text-[10px] text-slate-400 uppercase">O₃ Ozone</span>
                  <div className="text-sm font-bold text-white mt-0.5">{environment.o3} ppb</div>
                  <span className="text-[9px] text-slate-400 mt-0.5 block">Surface oxidants</span>
                </div>
              </div>
            </div>

            {/* Health Interpretation Note */}
            <div className="p-3.5 rounded-2xl bg-sky-500/10 border border-sky-400/25 space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-bold text-sky-300">
                <Info className="w-4 h-4 shrink-0" />
                <span>Health & Activity Advice</span>
              </div>
              <p className="text-xs text-slate-200 leading-relaxed">
                {environment.aqi <= 50
                  ? 'Air quality is considered satisfactory, and air pollution poses little or no risk. Great time for outdoor workouts and ventilation.'
                  : environment.aqi <= 100
                  ? 'Air quality is acceptable. Sensitive individuals with respiratory conditions should consider limiting prolonged outdoor exertion.'
                  : 'Air quality is unhealthy for sensitive groups. Reduce strenuous outdoor exercise and keep windows closed during peak traffic hours.'}
              </p>
            </div>
          </div>
        );

      case 'uv':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.04] border border-white/[0.08]">
              <div>
                <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-400">Current UV Radiation</span>
                <div className="text-3xl sm:text-4xl font-extralight text-white font-['Outfit'] mt-0.5">
                  {environment.uvIndex} <span className="text-xs sm:text-sm font-semibold text-slate-300">Index</span>
                </div>
              </div>
              <div className={`px-3 py-1.5 rounded-xl border font-bold text-xs ${uvDetails.text} ${uvDetails.bg} ${uvDetails.border}`}>
                {environment.uvStatus}
              </div>
            </div>

            {/* Scale Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-[11px] text-slate-400 font-medium">
                <span>0 (Low)</span>
                <span>3 (Mod)</span>
                <span>6 (High)</span>
                <span>8 (V. High)</span>
                <span>11+ (Extreme)</span>
              </div>
              <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 via-amber-400 via-orange-400 via-rose-500 to-purple-600 rounded-full" />
                <div
                  className="absolute top-0 bottom-0 w-3 h-3 -mt-0.5 bg-white rounded-full shadow-lg border border-slate-900"
                  style={{ left: `${Math.min(96, Math.max(4, (environment.uvIndex / 11) * 100))}%` }}
                />
              </div>
            </div>

            {/* Sun Protection Guidelines */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <span className="font-bold text-white">Sunscreen Recommendation</span>
                  <p className="text-slate-300 mt-0.5">
                    {environment.uvIndex >= 6 ? 'Apply SPF 50+ broad-spectrum sunscreen every 2 hours.' : 'SPF 30 recommended for prolonged direct sunlight exposure.'}
                  </p>
                </div>
              </div>
              <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-start gap-2.5">
                <SunMedium className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <span className="font-bold text-white">Peak Solar Window</span>
                  <p className="text-slate-300 mt-0.5">
                    Maximum solar intensity occurs between 11:30 AM and 3:30 PM. Seek shade during peak hours.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      case 'wind':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.04] border border-white/[0.08]">
              <div>
                <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-400">Wind Velocity & Gusts</span>
                <div className="text-3xl sm:text-4xl font-extralight text-white font-['Outfit'] mt-0.5">
                  {environment.windSpeed} <span className="text-xs sm:text-sm font-semibold text-slate-300">km/h</span>
                </div>
              </div>
              <div className="px-3 py-1.5 rounded-xl border border-teal-400/40 bg-teal-500/20 text-teal-300 font-bold text-xs flex items-center gap-1">
                <Compass className="w-3.5 h-3.5" />
                <span>{environment.windDirection}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.06] text-center">
                <span className="text-[10px] text-slate-400 uppercase">Max Gusts</span>
                <div className="text-base sm:text-lg font-bold text-white mt-0.5">{environment.windGust} km/h</div>
                <span className="text-[9px] text-slate-400 mt-0.5 block">{environment.windGust > 35 ? 'Caution for cycling/drones' : 'Calm breeze'}</span>
              </div>
              <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.06] text-center">
                <span className="text-[10px] text-slate-400 uppercase">Beaufort Scale</span>
                <div className="text-base sm:text-lg font-bold text-white mt-0.5">
                  {environment.windSpeed < 12 ? 'Light Breeze' : environment.windSpeed < 29 ? 'Moderate Breeze' : 'Strong Breeze'}
                </div>
                <span className="text-[9px] text-slate-400 mt-0.5 block">Level {Math.min(12, Math.floor(environment.windSpeed / 6) + 1)}</span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-teal-500/10 border border-teal-400/25 text-xs text-slate-200">
              <span className="font-bold text-teal-300 block mb-1">Impact on Activities</span>
              {environment.windSpeed < 20
                ? 'Optimal conditions for running, cycling, outdoor tennis, and drone flight.'
                : 'Noticeable resistance for cycling and headwind running. Secure loose items outside.'}
            </div>
          </div>
        );

      case 'humidity':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.04] border border-white/[0.08]">
              <div>
                <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-400">Relative Humidity</span>
                <div className="text-3xl sm:text-4xl font-extralight text-white font-['Outfit'] mt-0.5">
                  {environment.humidity}%
                </div>
              </div>
              <div className="px-3 py-1.5 rounded-xl border border-sky-400/40 bg-sky-500/20 text-sky-300 font-bold text-xs">
                Dew point {environment.dewPoint}°C
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.06] text-center">
                <span className="text-[10px] text-slate-400 uppercase">Thermal Comfort</span>
                <div className="text-sm font-bold text-white mt-0.5">
                  {environment.humidity < 40 ? 'Dry' : environment.humidity < 65 ? 'Comfortable' : 'Humid & Muggy'}
                </div>
              </div>
              <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.06] text-center">
                <span className="text-[10px] text-slate-400 uppercase">Atmospheric Pressure</span>
                <div className="text-sm font-bold text-white mt-0.5">{environment.pressure} hPa</div>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-sky-500/10 border border-sky-400/25 text-xs text-slate-200">
              <span className="font-bold text-sky-300 block mb-1">Hydration & Sweat Rate</span>
              {environment.humidity > 70
                ? 'High humidity impairs the body’s evaporative cooling mechanism. Drink electrolyte fluids frequently during workouts.'
                : 'Comfortable evaporation rates. Normal hydration requirements apply.'}
            </div>
          </div>
        );

      case 'visibility':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.04] border border-white/[0.08]">
              <div>
                <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-400">Horizontal Sight Visibility</span>
                <div className="text-3xl sm:text-4xl font-extralight text-white font-['Outfit'] mt-0.5">
                  {environment.visibility} <span className="text-xs sm:text-sm font-semibold text-slate-300">km</span>
                </div>
              </div>
              <div className="px-3 py-1.5 rounded-xl border border-indigo-400/40 bg-indigo-500/20 text-indigo-300 font-bold text-xs">
                {environment.visibility >= 10 ? 'Clear Sight' : environment.visibility >= 5 ? 'Moderate Haze' : 'Dense Mist / Fog'}
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-indigo-500/10 border border-indigo-400/25 text-xs text-slate-200">
              <span className="font-bold text-indigo-300 block mb-1">Commuter & Highway Safety</span>
              {environment.visibility >= 10
                ? 'Full clear road visibility with no fog restrictions on local expressways.'
                : 'Reduced optical distance. Low-beam headlights recommended on highway commutes.'}
            </div>
          </div>
        );

      case 'solar':
        return (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/[0.08] space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 uppercase tracking-wider font-semibold text-[10px]">Sun Cycle Overview</span>
                <span className="text-amber-300 font-semibold">{environment.solarProgress}% of Daylight Passed</span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-400/20">
                  <div className="flex items-center justify-center gap-1.5 text-amber-300 text-xs font-semibold">
                    <Sunrise className="w-4 h-4" /> Sunrise
                  </div>
                  <div className="text-lg font-bold text-white mt-1">{environment.sunrise}</div>
                </div>
                <div className="p-3 rounded-xl bg-orange-500/10 border border-orange-400/20">
                  <div className="flex items-center justify-center gap-1.5 text-orange-300 text-xs font-semibold">
                    <Sunset className="w-4 h-4" /> Sunset
                  </div>
                  <div className="text-lg font-bold text-white mt-1">{environment.sunset}</div>
                </div>
              </div>
              <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                <div className="bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400 h-full rounded-full" style={{ width: `${environment.solarProgress}%` }} />
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-400/25 text-xs text-slate-200">
              <span className="font-bold text-amber-300 block mb-1">Golden Hour Photography & Running</span>
              The best natural lighting and optimal outdoor running conditions occur 45 minutes after sunrise and 45 minutes before sunset.
            </div>
          </div>
        );
    }
  };

  const getTitle = () => {
    switch (metricType) {
      case 'aqi': return 'Air Quality & Particulate Analysis';
      case 'uv': return 'UV Radiation & Sun Protection';
      case 'wind': return 'Wind Velocity & Beaufort Rating';
      case 'humidity': return 'Humidity & Thermal Comfort';
      case 'visibility': return 'Atmospheric Visibility';
      case 'solar': return 'Sun Cycle & Daylight Hours';
    }
  };

  const getAIQuery = () => {
    switch (metricType) {
      case 'aqi': return `What precautions should I take today in ${locationName} with AQI ${environment.aqi} and PM2.5 ${environment.pm25} µg/m³?`;
      case 'uv': return `How should I protect my skin and eyes with a UV Index of ${environment.uvIndex} in ${locationName}?`;
      case 'wind': return `How will winds of ${environment.windSpeed} km/h affect outdoor sports and activities in ${locationName}?`;
      case 'humidity': return `How does ${environment.humidity}% humidity impact hydration and workout intensity today?`;
      case 'visibility': return `What driving or travel precautions are recommended with ${environment.visibility} km visibility in ${locationName}?`;
      case 'solar': return `When is the best daylight time for outdoor activities based on today's sun cycle in ${locationName}?`;
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-xl">
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 24, scale: 0.96 }}
          transition={{ duration: 0.25 }}
          className="w-full max-w-lg rounded-t-[28px] sm:rounded-[28px] bg-[#05070A] border border-white/[0.12] p-4 sm:p-6 shadow-2xl overflow-hidden max-h-[88vh] flex flex-col relative"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
            <div className="min-w-0">
              <span className="text-[10px] uppercase font-bold text-sky-400 tracking-wider">Progressive Environmental Data</span>
              <h3 className="text-base sm:text-lg font-bold text-white truncate mt-0.5">{getTitle()}</h3>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 hover:text-white transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body Content */}
          <div className="overflow-y-auto py-4 flex-1 scrollbar-thin scrollbar-thumb-white/10 pr-0.5">
            {renderContent()}
          </div>

          {/* Footer CTA */}
          <div className="pt-3 border-t border-white/[0.08] flex items-center justify-between gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-2xl bg-white/[0.06] hover:bg-white/[0.1] text-slate-300 hover:text-white text-xs font-semibold transition-colors cursor-pointer min-h-[44px] flex items-center justify-center"
            >
              Done
            </button>

            {onAskAI && (
              <button
                onClick={() => {
                  onClose();
                  onAskAI(getAIQuery());
                }}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-[#60A5FA] hover:bg-blue-400 text-slate-950 font-bold text-xs shadow-lg shadow-blue-500/20 active:scale-95 transition-all cursor-pointer min-h-[44px] touch-manipulation"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Ask AI About This</span>
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
