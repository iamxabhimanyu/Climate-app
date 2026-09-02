import React, { useState } from 'react';
import { Clock, Droplets, SunMedium, Wind, ShieldAlert, ChevronRight } from 'lucide-react';
import { HourlyForecast } from '../types';
import { WeatherIcon } from '../utils/weatherIcons';

interface HourlyForecastScrollProps {
  hourly: HourlyForecast[];
  onAskAI?: (prompt: string) => void;
}

export const HourlyForecastScroll: React.FC<HourlyForecastScrollProps> = ({ hourly, onAskAI }) => {
  const [selectedHourIndex, setSelectedHourIndex] = useState<number | null>(null);
  const selectedHour = selectedHourIndex !== null ? hourly[selectedHourIndex] : null;

  return (
    <section className="rounded-3xl p-4 sm:p-5 bg-white/[0.05] border border-white/[0.08] backdrop-blur-2xl shadow-xl space-y-3">
      <div className="flex items-center justify-between gap-2 px-1">
        <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          <Clock className="w-3.5 h-3.5 text-sky-400" />
          <span>Hourly Forecast</span>
        </div>
        <span className="text-[10px] text-slate-400">24-Hour Horizon</span>
      </div>

      {/* Horizontally scrollable list */}
      <div className="flex gap-2 overflow-x-auto pb-2 pt-0.5 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent overscroll-x-contain touch-pan-x -mx-1 px-1">
        {hourly.map((hour, idx) => {
          const isSelected = selectedHourIndex === idx;
          const isCurrentHour = idx === 0;

          return (
            <button
              key={idx}
              onClick={() => setSelectedHourIndex(isSelected ? null : idx)}
              className={`flex flex-col items-center justify-between py-2.5 px-3 rounded-2xl min-w-[70px] sm:min-w-[78px] min-h-[96px] shrink-0 border transition-all cursor-pointer text-center touch-manipulation select-none active:scale-95 ${
                isSelected
                  ? 'bg-sky-500/25 border-sky-400/60 text-white shadow-md ring-1 ring-sky-400/40'
                  : 'bg-white/[0.04] hover:bg-white/[0.08] border-white/[0.06] text-slate-200'
              }`}
            >
              <span className={`text-[11px] font-medium ${isCurrentHour ? 'text-sky-300 font-bold' : isSelected ? 'text-white' : 'text-slate-400'}`}>
                {isCurrentHour ? 'Now' : hour.time}
              </span>

              <div className="my-1.5 flex flex-col items-center">
                <WeatherIcon condition={hour.condition} className="w-6 h-6 shrink-0" />
                {hour.rainProb > 15 ? (
                  <div className="flex items-center gap-0.5 text-[10px] font-semibold text-sky-400 mt-1">
                    <Droplets className="w-2.5 h-2.5" />
                    <span>{hour.rainProb}%</span>
                  </div>
                ) : (
                  <span className="text-[9px] text-slate-500 mt-1">{hour.conditionText.split(' ')[0]}</span>
                )}
              </div>

              <span className="text-sm font-semibold font-['Outfit'] text-slate-100">
                {hour.temp}°
              </span>
            </button>
          );
        })}
      </div>

      {/* Expandable Details for Selected Hour */}
      {selectedHour && (
        <div className="mt-2 p-3.5 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs animate-in fade-in duration-200">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-sky-500/15 text-sky-400 border border-sky-400/30 shrink-0">
              <WeatherIcon condition={selectedHour.condition} className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-sm">{selectedHour.time}: {selectedHour.conditionText}</span>
                <span className="text-slate-400">({selectedHour.temp}°C · Feels {selectedHour.feelsLike}°C)</span>
              </div>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-300 mt-1">
                <span className="flex items-center gap-1 text-sky-300">
                  <Droplets className="w-3 h-3" /> Rain: {selectedHour.rainProb}%
                </span>
                <span className="flex items-center gap-1 text-amber-300">
                  <SunMedium className="w-3 h-3" /> UV: {selectedHour.uvIndex}
                </span>
                <span className="flex items-center gap-1 text-teal-300">
                  <Wind className="w-3 h-3" /> Wind: {selectedHour.windSpeed} km/h
                </span>
                <span className="flex items-center gap-1 text-emerald-300">
                  <ShieldAlert className="w-3 h-3" /> AQI: {selectedHour.aqi}
                </span>
              </div>
            </div>
          </div>

          {onAskAI && (
            <button
              onClick={() =>
                onAskAI(
                  `What are the best outdoor activity recommendations and precautions for ${selectedHour.time} when it is ${selectedHour.temp}°C with ${selectedHour.conditionText} and ${selectedHour.rainProb}% rain chance?`
                )
              }
              className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-500/15 hover:bg-sky-500/25 text-sky-300 font-semibold text-[11px] border border-sky-400/30 transition-all shrink-0 active:scale-95 group"
            >
              <span>Ask AI About {selectedHour.time}</span>
              <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </button>
          )}
        </div>
      )}
    </section>
  );
};



