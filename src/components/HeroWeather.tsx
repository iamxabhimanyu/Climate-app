import React from 'react';
import { motion } from 'motion/react';
import { WeatherData } from '../types';
import { Droplets, Wind, SunMedium, ShieldAlert, Sparkles, Navigation, Share2, MapPin } from 'lucide-react';
import { EnvironmentalMetricType } from './EnvironmentalDetailModal';

interface HeroWeatherProps {
  data: WeatherData;
  isLiveGPS?: boolean;
  onAskAIAboutCurrent: () => void;
  onOpenMetricDetail?: (metric: EnvironmentalMetricType) => void;
  onOpenShareModal?: () => void;
  onOpenLocationModal?: () => void;
}

export const HeroWeather: React.FC<HeroWeatherProps> = ({
  data,
  isLiveGPS = false,
  onAskAIAboutCurrent,
  onOpenMetricDetail,
  onOpenShareModal,
  onOpenLocationModal,
}) => {
  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
      className="relative flex flex-col items-center text-center pt-2 pb-1 px-2 select-none w-full"
    >
      {/* Location Context & Subtle Status Indicator */}
      <div className="flex items-center justify-center gap-2 text-xs text-sky-300 font-medium tracking-wide mb-1 flex-wrap">
        <button
          onClick={onOpenLocationModal}
          className="flex items-center gap-1 px-3 py-1 rounded-full bg-white/[0.04] hover:bg-white/[0.08] active:scale-95 border border-white/[0.08] backdrop-blur-md transition-all cursor-pointer"
          title="Change location"
        >
          {isLiveGPS ? (
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          ) : (
            <Navigation className="w-3 h-3 text-sky-400 fill-sky-400 shrink-0" />
          )}
          <span className="text-[11px] text-slate-200 font-medium">
            {isLiveGPS ? 'Live GPS Location' : 'Current Station'}
          </span>
          <span className="text-slate-500">·</span>
          <span className="text-[10px] text-slate-400">{data.lastUpdated || 'Just now'}</span>
        </button>

        {onOpenShareModal && (
          <button
            onClick={onOpenShareModal}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/[0.04] hover:bg-white/[0.1] active:scale-95 border border-white/[0.08] text-slate-300 hover:text-white transition-all text-[11px] cursor-pointer"
            title="Share weather & location"
          >
            <Share2 className="w-3 h-3 text-sky-400" />
            <span>Share</span>
          </button>
        )}
      </div>

      <h1
        onClick={onOpenLocationModal}
        className="text-2xl sm:text-3xl font-semibold tracking-tight text-white px-2 cursor-pointer hover:text-sky-200 transition-colors"
        title="Tap to change location"
      >
        {data.locationName}
      </h1>

      {/* Hero Temperature & Condition (Free-standing, not boxed into a generic card) */}
      <button
        onClick={onAskAIAboutCurrent}
        className="my-1 flex flex-col items-center relative group cursor-pointer focus:outline-none touch-manipulation"
        title="Tap to ask AI Weather Summary"
      >
        <div className="flex items-start justify-center">
          <span className="text-[82px] min-[360px]:text-[92px] min-[390px]:text-[104px] sm:text-[116px] font-extralight tracking-[-0.04em] text-white leading-none font-['Outfit'] drop-shadow-sm">
            {data.currentTemp}
          </span>
          <span className="text-3xl min-[360px]:text-4xl sm:text-5xl font-extralight text-sky-300 font-['Outfit'] mt-1 sm:mt-2">
            °
          </span>
        </div>

        <div className="text-lg sm:text-xl font-medium text-slate-100 mt-0.5">
          {data.conditionText}
        </div>

        <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-300 font-normal mt-1 flex-wrap justify-center">
          <span>Feels like <strong className="text-white font-semibold">{data.feelsLike}°</strong></span>
          <span className="text-slate-500">·</span>
          <span>High <strong className="text-white font-semibold">{data.highTemp}°</strong> · Low <strong className="text-white font-semibold">{data.lowTemp}°</strong></span>
        </div>
      </button>

      {/* Atmospheric Summary Pills (Chance of rain, UV, Wind, Air Quality) */}
      <div className="grid grid-cols-4 gap-1.5 sm:gap-2 w-full max-w-md mt-2.5">
        <button
          onClick={() => onOpenMetricDetail && onOpenMetricDetail('humidity')}
          className="flex flex-col items-center justify-center p-2 min-[375px]:p-2.5 rounded-2xl bg-white/[0.05] hover:bg-white/[0.1] active:scale-95 border border-white/[0.08] backdrop-blur-xl transition-all cursor-pointer text-center group min-h-[58px] min-[375px]:min-h-[64px]"
          title="Chance of rain"
        >
          <div className="flex items-center gap-1 text-[10px] min-[375px]:text-[11px] text-slate-400 mb-0.5 group-hover:text-slate-200">
            <Droplets className="w-3 h-3 text-sky-400 shrink-0" />
            <span>Rain</span>
          </div>
          <span className="text-xs sm:text-sm font-semibold text-slate-100">
            {data.hourly[0]?.rainProb || 5}%
          </span>
        </button>

        <button
          onClick={() => onOpenMetricDetail && onOpenMetricDetail('uv')}
          className="flex flex-col items-center justify-center p-2 min-[375px]:p-2.5 rounded-2xl bg-white/[0.05] hover:bg-white/[0.1] active:scale-95 border border-white/[0.08] backdrop-blur-xl transition-all cursor-pointer text-center group min-h-[58px] min-[375px]:min-h-[64px]"
          title="UV Index"
        >
          <div className="flex items-center gap-1 text-[10px] min-[375px]:text-[11px] text-slate-400 mb-0.5 group-hover:text-slate-200">
            <SunMedium className="w-3 h-3 text-amber-400 shrink-0" />
            <span>UV</span>
          </div>
          <span className="text-xs sm:text-sm font-semibold text-slate-100">
            {data.environment.uvIndex} <span className="text-[9px] min-[375px]:text-[10px] font-normal text-slate-400 hidden min-[360px]:inline">({data.environment.uvStatus.slice(0, 3)})</span>
          </span>
        </button>

        <button
          onClick={() => onOpenMetricDetail && onOpenMetricDetail('wind')}
          className="flex flex-col items-center justify-center p-2 min-[375px]:p-2.5 rounded-2xl bg-white/[0.05] hover:bg-white/[0.1] active:scale-95 border border-white/[0.08] backdrop-blur-xl transition-all cursor-pointer text-center group min-h-[58px] min-[375px]:min-h-[64px]"
          title="Wind speed"
        >
          <div className="flex items-center gap-1 text-[10px] min-[375px]:text-[11px] text-slate-400 mb-0.5 group-hover:text-slate-200">
            <Wind className="w-3 h-3 text-teal-400 shrink-0" />
            <span>Wind</span>
          </div>
          <span className="text-xs sm:text-sm font-semibold text-slate-100">
            {data.environment.windSpeed} <span className="text-[9px] min-[375px]:text-[10px] font-normal text-slate-400">km/h</span>
          </span>
        </button>

        <button
          onClick={() => onOpenMetricDetail && onOpenMetricDetail('aqi')}
          className="flex flex-col items-center justify-center p-2 min-[375px]:p-2.5 rounded-2xl bg-white/[0.05] hover:bg-white/[0.1] active:scale-95 border border-white/[0.08] backdrop-blur-xl transition-all cursor-pointer text-center group min-h-[58px] min-[375px]:min-h-[64px]"
          title="Air Quality Index"
        >
          <div className="flex items-center gap-1 text-[10px] min-[375px]:text-[11px] text-slate-400 mb-0.5 group-hover:text-slate-200">
            <ShieldAlert className="w-3 h-3 text-emerald-400 shrink-0" />
            <span>AQI</span>
          </div>
          <span className={`text-xs sm:text-sm font-semibold ${data.environment.aqi > 150 ? 'text-rose-400' : data.environment.aqi > 100 ? 'text-amber-400' : 'text-emerald-400'}`}>
            {data.environment.aqi}
          </span>
        </button>
      </div>
    </motion.section>
  );
};
