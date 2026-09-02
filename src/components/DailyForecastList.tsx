import React, { useState } from 'react';
import { Calendar, Droplets, ChevronDown, ChevronUp, Wind, SunMedium } from 'lucide-react';
import { DailyForecast } from '../types';
import { WeatherIcon } from '../utils/weatherIcons';

interface DailyForecastListProps {
  daily: DailyForecast[];
  onAskAI?: (prompt: string) => void;
}

export const DailyForecastList: React.FC<DailyForecastListProps> = ({ daily, onAskAI }) => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  // Find min and max across all days to normalize temperature bars
  const minTemp = Math.min(...daily.map((d) => d.lowTemp));
  const maxTemp = Math.max(...daily.map((d) => d.highTemp));
  const tempRange = Math.max(1, maxTemp - minTemp);

  const toggleExpand = (idx: number) => {
    setExpandedIndex((prev) => (prev === idx ? null : idx));
  };

  return (
    <section className="rounded-3xl p-4 sm:p-5 bg-white/[0.05] border border-white/[0.08] backdrop-blur-2xl shadow-xl space-y-2">
      <div className="flex items-center justify-between gap-2 mb-2 px-1">
        <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          <Calendar className="w-3.5 h-3.5 text-sky-400" />
          <span>7-Day Forecast</span>
        </div>
        <span className="text-[10px] text-slate-400">Tap day for schedule</span>
      </div>

      <div className="divide-y divide-white/[0.06]">
        {daily.map((day, idx) => {
          const isExpanded = expandedIndex === idx;
          const leftPercent = ((day.lowTemp - minTemp) / tempRange) * 100;
          const widthPercent = Math.max(16, ((day.highTemp - day.lowTemp) / tempRange) * 100);

          return (
            <div key={idx} className="transition-all">
              <button
                onClick={() => toggleExpand(idx)}
                className="w-full py-3 flex items-center justify-between gap-1.5 sm:gap-3 group hover:bg-white/[0.03] active:bg-white/[0.06] px-2 rounded-2xl transition-all cursor-pointer text-left focus:outline-none min-h-[48px] touch-manipulation select-none"
              >
                {/* Day & condition */}
                <div className="w-18 min-[360px]:w-22 sm:w-26 shrink-0">
                  <div className="text-xs sm:text-sm font-semibold text-slate-100 flex items-center gap-1">
                    <span className="truncate">{idx === 0 ? 'Today' : day.day}</span>
                    {isExpanded ? (
                      <ChevronUp className="w-3 h-3 text-sky-400 shrink-0" />
                    ) : (
                      <ChevronDown className="w-3 h-3 text-slate-500 group-hover:text-slate-300 shrink-0" />
                    )}
                  </div>
                  <div className="text-[10px] min-[360px]:text-[11px] text-slate-400 truncate">
                    {day.date}
                  </div>
                </div>

                {/* Weather icon & rain % */}
                <div className="flex items-center gap-1.5 w-20 min-[360px]:w-24 sm:w-28 shrink-0">
                  <WeatherIcon condition={day.condition} className="w-4 h-4 min-[360px]:w-5 min-[360px]:h-5 shrink-0" />
                  <div className="flex flex-col min-w-0">
                    <span className="text-[11px] min-[360px]:text-xs text-slate-200 font-medium truncate">
                      {day.conditionText.split(' ')[0]}
                    </span>
                    {day.rainProb > 15 && (
                      <span className="flex items-center gap-0.5 text-[9px] min-[360px]:text-[10px] text-sky-400 font-medium">
                        <Droplets className="w-2.5 h-2.5 shrink-0" />
                        {day.rainProb}%
                      </span>
                    )}
                  </div>
                </div>

                {/* Temp Bar & High/Low */}
                <div className="flex items-center gap-1.5 min-[360px]:gap-2 sm:gap-2.5 flex-1 min-w-[70px] max-w-[190px] justify-end">
                  <span className="text-[11px] min-[360px]:text-xs font-medium text-slate-400 w-6 min-[360px]:w-7 text-right font-['Outfit']">
                    {day.lowTemp}°
                  </span>

                  <div className="relative flex-1 h-1.5 bg-white/[0.08] rounded-full overflow-hidden min-w-[30px]">
                    <div
                      className="absolute top-0 bottom-0 rounded-full bg-gradient-to-r from-sky-400 via-teal-300 to-amber-400"
                      style={{
                        left: `${leftPercent}%`,
                        width: `${widthPercent}%`,
                      }}
                    />
                  </div>

                  <span className="text-[11px] min-[360px]:text-xs font-bold text-slate-100 w-6 min-[360px]:w-7 font-['Outfit']">
                    {day.highTemp}°
                  </span>
                </div>
              </button>

              {/* Accordion detail panel */}
              {isExpanded && (
                <div className="p-3.5 mb-2 rounded-2xl bg-white/[0.04] border border-white/[0.08] text-xs space-y-2.5 animate-in fade-in duration-200">
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="p-2 rounded-xl bg-white/[0.03]">
                      <span className="text-slate-400 text-[11px]">Morning</span>
                      <div className="font-semibold text-slate-100 mt-0.5">{day.lowTemp + 2}°C</div>
                    </div>
                    <div className="p-2 rounded-xl bg-white/[0.03]">
                      <span className="text-slate-400 text-[11px]">Afternoon</span>
                      <div className="font-semibold text-slate-100 mt-0.5">{day.highTemp}°C</div>
                    </div>
                    <div className="p-2 rounded-xl bg-white/[0.03]">
                      <span className="text-slate-400 text-[11px]">Evening</span>
                      <div className="font-semibold text-slate-100 mt-0.5">{day.lowTemp + 4}°C</div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px] text-slate-300">
                    <span className="flex items-center gap-1 text-amber-300">
                      <SunMedium className="w-3.5 h-3.5" /> UV Index: {day.uvIndex}
                    </span>
                    <span className="flex items-center gap-1 text-teal-300">
                      <Wind className="w-3.5 h-3.5" /> Wind: {day.windSpeed} km/h
                    </span>
                    <span className="flex items-center gap-1 text-sky-300">
                      <Droplets className="w-3.5 h-3.5" /> Rain: {day.rainProb}%
                    </span>
                  </div>

                  {onAskAI && (
                    <button
                      onClick={() =>
                        onAskAI(
                          `What are the best plans, schedule, and clothing recommendations for ${day.day} (${day.date}) with ${day.conditionText}, High ${day.highTemp}°C, Low ${day.lowTemp}°C, and ${day.rainProb}% rain?`
                        )
                      }
                      className="w-full mt-2 py-2 px-3 rounded-xl bg-sky-500/15 hover:bg-sky-500/25 text-sky-300 font-semibold text-[11px] border border-sky-400/30 transition-all flex items-center justify-center gap-1.5"
                    >
                      <span>Ask AI Schedule for {day.day}</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};



