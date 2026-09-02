import React from 'react';
import {
  ShieldAlert,
  SunMedium,
  Droplets,
  Wind,
  Eye,
  Sunrise,
  Sunset,
  Compass,
  ChevronRight,
} from 'lucide-react';
import { EnvironmentalData } from '../types';
import { EnvironmentalMetricType } from './EnvironmentalDetailModal';

interface EnvironmentalGridProps {
  environment: EnvironmentalData;
  onOpenMetricDetail: (metric: EnvironmentalMetricType) => void;
  onAskAI?: (prompt: string) => void;
}

export const EnvironmentalGrid: React.FC<EnvironmentalGridProps> = ({
  environment,
  onOpenMetricDetail,
}) => {
  const getAqiColor = (aqi: number) => {
    if (aqi <= 50) return { text: 'text-emerald-300', bg: 'bg-emerald-500/15', border: 'border-emerald-400/30' };
    if (aqi <= 100) return { text: 'text-amber-300', bg: 'bg-amber-500/15', border: 'border-amber-400/30' };
    if (aqi <= 150) return { text: 'text-orange-300', bg: 'bg-orange-500/15', border: 'border-orange-400/30' };
    return { text: 'text-rose-300', bg: 'bg-rose-500/15', border: 'border-rose-400/30' };
  };

  const getUvColor = (uv: number) => {
    if (uv <= 2) return { text: 'text-emerald-300', bg: 'bg-emerald-500/15', border: 'border-emerald-400/30' };
    if (uv <= 5) return { text: 'text-amber-300', bg: 'bg-amber-500/15', border: 'border-amber-400/30' };
    if (uv <= 7) return { text: 'text-orange-300', bg: 'bg-orange-500/15', border: 'border-orange-400/30' };
    return { text: 'text-rose-300', bg: 'bg-rose-500/15', border: 'border-rose-400/30' };
  };

  const aqiStyle = getAqiColor(environment.aqi);
  const uvStyle = getUvColor(environment.uvIndex);

  return (
    <section className="space-y-3 select-none text-left">
      {/* Header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          <ShieldAlert className="w-3.5 h-3.5 text-sky-400" />
          <span>Environmental Intelligence</span>
        </div>
        <span className="text-[10px] text-slate-400">Tap card for details</span>
      </div>

      {/* 1. AIR QUALITY SECTION */}
      <div
        onClick={() => onOpenMetricDetail('aqi')}
        className="p-4 sm:p-5 rounded-3xl bg-white/[0.04] hover:bg-white/[0.07] border border-white/[0.08] backdrop-blur-2xl transition-all cursor-pointer shadow-lg active:scale-[0.99] group min-h-[72px] touch-manipulation"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-400">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Air Quality</span>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-xl sm:text-2xl font-bold text-white font-['Outfit']">{environment.aqi}</span>
                <span className="text-xs text-slate-300">AQI · {environment.aqiStatus}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${aqiStyle.text} ${aqiStyle.bg} ${aqiStyle.border}`}>
              Air pollution: {environment.pm25} µg/m³
            </span>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>

        {/* Spectrum Bar */}
        <div className="w-full h-1.5 bg-white/[0.08] rounded-full overflow-hidden mt-3 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 via-amber-400 to-rose-500 rounded-full" />
          <div
            className="absolute top-0 bottom-0 w-2.5 h-2.5 -mt-0.5 bg-white rounded-full shadow border border-slate-900"
            style={{ left: `${Math.min(95, Math.max(5, (environment.aqi / 300) * 100))}%` }}
          />
        </div>
      </div>

      {/* 2. SUN & SOLAR CYCLE SECTION */}
      <div
        onClick={() => onOpenMetricDetail('solar')}
        className="p-4 sm:p-5 rounded-3xl bg-white/[0.04] hover:bg-white/[0.07] border border-white/[0.08] backdrop-blur-2xl transition-all cursor-pointer shadow-lg active:scale-[0.99] group min-h-[72px] touch-manipulation"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-500/15 text-amber-400">
              <SunMedium className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Sun & Daylight</span>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-xl sm:text-2xl font-bold text-white font-['Outfit']">UV {environment.uvIndex}</span>
                <span className="text-xs text-slate-300">({environment.uvStatus})</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right text-xs">
              <div className="flex items-center gap-1 text-slate-300 font-medium">
                <Sunrise className="w-3.5 h-3.5 text-amber-400" /> {environment.sunrise}
              </div>
              <div className="flex items-center gap-1 text-slate-300 font-medium mt-0.5">
                <Sunset className="w-3.5 h-3.5 text-orange-400" /> {environment.sunset}
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>

        {/* Daylight Progress */}
        <div className="w-full h-1.5 bg-white/[0.08] rounded-full overflow-hidden mt-3">
          <div className="bg-gradient-to-r from-amber-400 to-orange-400 h-full rounded-full" style={{ width: `${environment.solarProgress}%` }} />
        </div>
      </div>

      {/* 3. WIND & VISIBILITY & HUMIDITY SECTION */}
      <div className="grid grid-cols-2 gap-2.5">
        {/* Wind card */}
        <div
          onClick={() => onOpenMetricDetail('wind')}
          className="p-3.5 sm:p-4 rounded-3xl bg-white/[0.04] hover:bg-white/[0.07] border border-white/[0.08] backdrop-blur-2xl transition-all cursor-pointer shadow-lg active:scale-[0.99] group touch-manipulation"
        >
          <div className="flex items-center justify-between text-slate-400 text-[10px] font-bold uppercase tracking-wider">
            <span className="flex items-center gap-1.5">
              <Wind className="w-3.5 h-3.5 text-teal-400" /> Wind
            </span>
            <span className="flex items-center gap-0.5 text-teal-300">
              <Compass className="w-3 h-3" /> {environment.windDirection}
            </span>
          </div>

          <div className="my-2">
            <div className="text-xl sm:text-2xl font-light text-white font-['Outfit']">
              {environment.windSpeed} <span className="text-xs text-slate-400">km/h</span>
            </div>
            <div className="text-[11px] text-slate-300 mt-0.5">
              Gusts to {environment.windGust} km/h
            </div>
          </div>

          <div className="flex items-center justify-between text-[10px] text-sky-400 font-semibold pt-1 border-t border-white/[0.05]">
            <span>View Beaufort scale</span>
            <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>

        {/* Humidity & Visibility card */}
        <div
          onClick={() => onOpenMetricDetail('humidity')}
          className="p-3.5 sm:p-4 rounded-3xl bg-white/[0.04] hover:bg-white/[0.07] border border-white/[0.08] backdrop-blur-2xl transition-all cursor-pointer shadow-lg active:scale-[0.99] group touch-manipulation"
        >
          <div className="flex items-center justify-between text-slate-400 text-[10px] font-bold uppercase tracking-wider">
            <span className="flex items-center gap-1.5">
              <Droplets className="w-3.5 h-3.5 text-sky-400" /> Humidity
            </span>
            <span className="flex items-center gap-0.5 text-indigo-300">
              <Eye className="w-3 h-3" /> {environment.visibility} km
            </span>
          </div>

          <div className="my-2">
            <div className="text-xl sm:text-2xl font-light text-white font-['Outfit']">
              {environment.humidity}%
            </div>
            <div className="text-[11px] text-slate-300 mt-0.5">
              Dew point {environment.dewPoint}°C
            </div>
          </div>

          <div className="flex items-center justify-between text-[10px] text-sky-400 font-semibold pt-1 border-t border-white/[0.05]">
            <span>Comfort & hydration</span>
            <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>
      </div>
    </section>
  );
};
