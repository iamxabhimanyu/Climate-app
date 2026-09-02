import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Activity,
  Car,
  HeartPulse,
  Users,
  Sprout,
  Waves,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  RefreshCw,
  Flame,
  Droplets,
  Wind,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { PersonaId, WeatherData } from '../types';
import { PERSONA_PROFILES } from '../data/weatherData';
import { PersonaIcon } from '../utils/weatherIcons';
import { calculatePersonalizedInsight } from '../utils/weatherEngine';

interface InsightsViewProps {
  weatherData: WeatherData;
  activePersona: PersonaId;
  onSelectPersona: (id: PersonaId) => void;
  onAskAI: (prompt: string) => void;
}

export const InsightsView: React.FC<InsightsViewProps> = ({
  weatherData,
  activePersona,
  onSelectPersona,
  onAskAI,
}) => {
  const [selectedTab, setSelectedTab] = useState<PersonaId>(activePersona);
  const [selectedWorkout, setSelectedWorkout] = useState<'Running' | 'Cycling' | 'Walking' | 'HIIT'>('Running');
  const [commuteMode, setCommuteMode] = useState<'Car' | 'Two-Wheeler' | 'Public Transit' | 'Walking'>('Two-Wheeler');
  const [isSensorRefreshing, setIsSensorRefreshing] = useState(false);
  const [sensorSuccessMsg, setSensorSuccessMsg] = useState('');
  const [familyTimeSlot, setFamilyTimeSlot] = useState<'Morning' | 'Afternoon' | 'Evening'>('Evening');

  const activeInsight = calculatePersonalizedInsight(selectedTab, weatherData);
  const currentProfile = PERSONA_PROFILES.find((p) => p.id === selectedTab) || PERSONA_PROFILES[0];

  const handleRefreshSensor = () => {
    setIsSensorRefreshing(true);
    setSensorSuccessMsg('');
    setTimeout(() => {
      setIsSensorRefreshing(false);
      setSensorSuccessMsg('IoT Telemetry Synced with Live Microclimate Node.');
      setTimeout(() => setSensorSuccessMsg(''), 3000);
    }, 800);
  };

  const getWorkoutDetails = (w: 'Running' | 'Cycling' | 'Walking' | 'HIIT') => {
    switch (w) {
      case 'Running':
        return {
          window: '6:00 PM – 7:15 PM',
          suitability: weatherData.currentTemp > 33 ? 'Moderate (High Heat)' : 'Optimal (Cool Sunset)',
          calorie: '~620 kcal/h',
          hydration: '500 ml/h',
          advice: 'Stick to shaded urban trails or coastal routes. Avoid high humidity mid-afternoon sun.',
        };
      case 'Cycling':
        return {
          window: '6:30 AM – 8:00 AM',
          suitability: weatherData.environment.windSpeed > 30 ? 'Caution (Crosswinds)' : 'Optimal (Low Traffic)',
          calorie: '~540 kcal/h',
          hydration: '450 ml/h',
          advice: `Headwinds of ${weatherData.environment.windSpeed} km/h from ${weatherData.environment.windDirection}. Wear aerodynamic windbreaker.`,
        };
      case 'Walking':
        return {
          window: '7:00 PM – 8:30 PM',
          suitability: 'Optimal (Low UV)',
          calorie: '~260 kcal/h',
          hydration: '300 ml/h',
          advice: 'Pavement temperature has cooled safely. Ideal for brisk cardio and pet walking.',
        };
      case 'HIIT':
        return {
          window: 'Indoor / Shaded Park 6:45 PM',
          suitability: weatherData.currentTemp > 29 ? 'Indoor Air-Conditioned Recommended' : 'Outdoor Shaded Safe',
          calorie: '~750 kcal/h',
          hydration: '750 ml/h',
          advice: 'High cardiac output in humid atmosphere causes rapid core temperature rise. Take 90s rest intervals.',
        };
    }
  };

  const workoutData = getWorkoutDetails(selectedWorkout);

  return (
    <div className="space-y-4 pb-20">
      {/* Persona Tabs Horizontal Scroll */}
      <div className="p-4 rounded-[28px] bg-white/[0.04] border border-white/[0.08] backdrop-blur-xl shadow-2xl">
        <div className="flex items-center justify-between gap-2 mb-2.5 px-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#60A5FA]">
            Intelligence Personas
          </span>
          <span className="text-[11px] text-slate-400">Select Mode</span>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none overscroll-x-contain -mx-1 px-1">
          {PERSONA_PROFILES.map((profile) => (
            <button
              key={profile.id}
              onClick={() => {
                setSelectedTab(profile.id);
                onSelectPersona(profile.id);
              }}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-semibold shrink-0 transition-all border cursor-pointer min-h-[44px] touch-manipulation select-none active:scale-95 ${
                selectedTab === profile.id
                  ? 'bg-[rgba(96,165,250,0.25)] border-[rgba(96,165,250,0.45)] text-sky-200 shadow-md'
                  : 'bg-white/[0.03] border-white/[0.05] text-slate-400 hover:text-slate-200'
              }`}
            >
              <PersonaIcon personaId={profile.id} className="w-4 h-4" />
              <span>{profile.shortName}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Persona Intelligence Screen */}
      <motion.div
        key={selectedTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        {/* Header Persona Spotlight Banner */}
        <div className="p-4 sm:p-5 rounded-[28px] bg-gradient-to-br from-[rgba(96,165,250,0.1)] to-[rgba(30,58,138,0.05)] border border-[rgba(96,165,250,0.2)] backdrop-blur-xl shadow-2xl">
          <div className="flex items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
              <div className="p-2.5 sm:p-3 rounded-2xl bg-[rgba(96,165,250,0.15)] border border-[rgba(96,165,250,0.3)] text-[#60A5FA] shrink-0">
                <PersonaIcon personaId={selectedTab} className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div className="min-w-0">
                <h3 className="text-base sm:text-lg font-bold text-white leading-tight truncate">
                  {currentProfile.name} Mode
                </h3>
                <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5 truncate">
                  {currentProfile.tagline}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <div className="px-3 py-1.5 rounded-2xl bg-white/[0.04] border border-white/[0.08] text-right">
                <div className="text-xl sm:text-2xl font-extrabold text-slate-100 font-['Outfit'] leading-none">
                  {activeInsight.score}<span className="text-xs font-normal opacity-70">/100</span>
                </div>
                <div className="text-[9px] uppercase font-bold text-[#60A5FA] mt-0.5">
                  {activeInsight.scoreLabel}
                </div>
              </div>
            </div>
          </div>

          {/* Primary Recommendation Banner */}
          <div className="p-3 rounded-2xl bg-[rgba(96,165,250,0.08)] border border-[rgba(96,165,250,0.2)] flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-[#60A5FA] shrink-0 mt-0.5" />
            <div>
              <span className="text-xs font-semibold text-[#60A5FA] block mb-0.5">Recommendation:</span>
              <p className="text-xs font-medium text-slate-200 leading-relaxed">
                {activeInsight.recommendation}
              </p>
            </div>
          </div>
        </div>

        {/* Persona Specific Custom Interactive Components */}

        {/* 1. FITNESS MODE */}
        {selectedTab === 'fitness' && (
          <div className="p-4 sm:p-5 rounded-[28px] bg-white/[0.04] border border-white/[0.08] backdrop-blur-xl shadow-2xl space-y-4">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <h4 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-400 shrink-0" />
                Workout Intelligence Matrix
              </h4>
              <span className="text-xs text-emerald-400 font-semibold">{workoutData.window}</span>
            </div>

            {/* Workout Selector */}
            <div className="grid grid-cols-2 min-[400px]:grid-cols-4 gap-1.5 sm:gap-2">
              {(['Running', 'Cycling', 'Walking', 'HIIT'] as const).map((w) => (
                <button
                  key={w}
                  onClick={() => setSelectedWorkout(w)}
                  className={`py-2 px-2 rounded-xl text-xs font-semibold text-center transition-all border cursor-pointer min-h-[40px] touch-manipulation select-none active:scale-95 ${
                    selectedWorkout === w
                      ? 'bg-emerald-500/20 border-emerald-400/40 text-emerald-200 shadow-md ring-1 ring-emerald-400/30'
                      : 'bg-white/[0.02] border-white/[0.05] text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {w}
                </button>
              ))}
            </div>

            {/* Selected Workout Metric Matrix */}
            <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.06] space-y-3">
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                  <span className="text-slate-400 flex items-center justify-center gap-1 text-[10px] min-[360px]:text-[11px] truncate">
                    <Zap className="w-3 h-3 text-amber-400 shrink-0" /> Suitability
                  </span>
                  <div className="font-bold text-slate-100 text-[10px] min-[360px]:text-[11px] mt-0.5 truncate">{workoutData.suitability}</div>
                </div>
                <div className="p-2 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                  <span className="text-slate-400 flex items-center justify-center gap-1 text-[10px] min-[360px]:text-[11px] truncate">
                    <Flame className="w-3 h-3 text-rose-400 shrink-0" /> Burn
                  </span>
                  <div className="font-bold text-slate-100 text-[10px] min-[360px]:text-[11px] mt-0.5 truncate">{workoutData.calorie}</div>
                </div>
                <div className="p-2 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                  <span className="text-slate-400 flex items-center justify-center gap-1 text-[10px] min-[360px]:text-[11px] truncate">
                    <Droplets className="w-3 h-3 text-[#60A5FA] shrink-0" /> Hydration
                  </span>
                  <div className="font-bold text-slate-100 text-[10px] min-[360px]:text-[11px] mt-0.5 truncate">{workoutData.hydration}</div>
                </div>
              </div>

              <p className="text-xs text-slate-300 font-normal leading-relaxed">
                💡 <strong className="text-emerald-300">{selectedWorkout}:</strong> {workoutData.advice}
              </p>
            </div>

            {/* Hourly Fitness Heatmap */}
            <div className="space-y-2">
              <span className="text-[10px] min-[360px]:text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
                Today's Workout Comfort Timeline
              </span>
              <div className="grid grid-cols-3 min-[400px]:grid-cols-6 gap-1.5 sm:gap-2 text-center text-xs">
                {weatherData.hourly.slice(0, 6).map((h, i) => {
                  const fit = h.temp <= 28 && h.rainProb <= 20 && h.uvIndex <= 4;
                  return (
                    <div
                      key={i}
                      className={`p-2 rounded-2xl border flex flex-col justify-between items-center ${
                        fit
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
                          : 'bg-amber-500/10 border-amber-500/30 text-amber-200'
                      }`}
                    >
                      <span className="text-[10px] text-slate-400 font-medium">{h.time}</span>
                      <span className="text-xs sm:text-sm font-bold my-0.5 font-['Outfit']">{h.temp}°</span>
                      <span className="text-[8px] sm:text-[9px] font-bold uppercase">{fit ? 'Optimal' : 'Caution'}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* 2. COMMUTER MODE */}
        {selectedTab === 'commuter' && (
          <div className="p-4 sm:p-5 rounded-[28px] bg-white/[0.04] border border-white/[0.08] backdrop-blur-xl shadow-2xl space-y-4">
            <div className="flex items-center justify-between gap-2">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Car className="w-4 h-4 text-[#60A5FA]" />
                Commute Departure Optimizer
              </h4>
            </div>

            {/* Commuter Transit Mode Selector */}
            <div className="grid grid-cols-2 min-[400px]:grid-cols-4 gap-1.5 sm:gap-2">
              {(['Two-Wheeler', 'Car', 'Public Transit', 'Walking'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setCommuteMode(mode)}
                  className={`py-2 px-1 rounded-xl text-xs font-semibold text-center truncate transition-all border cursor-pointer min-h-[40px] touch-manipulation select-none active:scale-95 ${
                    commuteMode === mode
                      ? 'bg-[rgba(96,165,250,0.2)] border-[rgba(96,165,250,0.4)] text-sky-200'
                      : 'bg-white/[0.02] border-white/[0.05] text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 sm:p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30">
                <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wide">
                  🟢 Recommended ({commuteMode})
                </span>
                <div className="text-lg sm:text-xl font-bold text-slate-100 mt-1">
                  {weatherData.commute?.recommendedDeparture || '4:15 PM – 4:45 PM'}
                </div>
                <p className="text-[11px] text-slate-300 mt-1">
                  Clear road visibility and lowest expected precipitation window for {commuteMode}.
                </p>
              </div>

              <div className="p-3.5 sm:p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30">
                <span className="text-xs font-semibold text-rose-400 uppercase tracking-wide">
                  🔴 Window to Avoid
                </span>
                <div className="text-lg sm:text-xl font-bold text-slate-100 mt-1">
                  {weatherData.commute?.avoidTimeWindow || '5:30 PM – 6:45 PM'}
                </div>
                <p className="text-[11px] text-slate-300 mt-1">
                  {weatherData.commute?.riskReason || 'High rain probability and reduced visibility.'}
                </p>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-between text-xs">
              <div>
                <span className="text-slate-400 text-[10px] min-[360px]:text-xs">Roadway Visibility</span>
                <div className="text-sm font-bold text-slate-100">{weatherData.environment.visibility} km</div>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] min-[360px]:text-xs">Fog / Mist Hazard</span>
                <div className="text-sm font-bold text-slate-100">{weatherData.commute?.fogRisk || 'Low'}</div>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] min-[360px]:text-xs">Storm Warning</span>
                <div className="text-sm font-bold text-slate-100">{weatherData.commute?.stormWarning ? 'Active ⚠️' : 'None'}</div>
              </div>
            </div>
          </div>
        )}

        {/* 3. HEALTH & AQI MODE */}
        {selectedTab === 'health' && (
          <div className="p-4 sm:p-5 rounded-[28px] bg-white/[0.04] border border-white/[0.08] backdrop-blur-xl shadow-2xl space-y-4">
            <h4 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
              <HeartPulse className="w-4 h-4 text-rose-400 shrink-0" />
              Air Quality & Respiratory Safety Matrix
            </h4>

            <div className="p-3.5 sm:p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-300">AQI Breakdown</span>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-md ${weatherData.environment.aqi > 150 ? 'bg-rose-500/20 text-rose-300' : 'bg-emerald-500/20 text-emerald-300'}`}>
                  {weatherData.environment.aqiStatus}
                </span>
              </div>
              <div className="grid grid-cols-4 gap-1.5 sm:gap-2 text-center text-xs mt-3">
                <div className="p-2 rounded-xl bg-white/[0.02]">
                  <span className="text-slate-400 text-[10px]">PM2.5</span>
                  <div className="font-bold text-slate-100 text-[11px] sm:text-xs">{weatherData.environment.pm25} µg</div>
                </div>
                <div className="p-2 rounded-xl bg-white/[0.02]">
                  <span className="text-slate-400 text-[10px]">PM10</span>
                  <div className="font-bold text-slate-100 text-[11px] sm:text-xs">{weatherData.environment.pm10} µg</div>
                </div>
                <div className="p-2 rounded-xl bg-white/[0.02]">
                  <span className="text-slate-400 text-[10px]">NO₂</span>
                  <div className="font-bold text-slate-100 text-[11px] sm:text-xs">{weatherData.environment.no2} ppb</div>
                </div>
                <div className="p-2 rounded-xl bg-white/[0.02]">
                  <span className="text-slate-400 text-[10px]">UV Index</span>
                  <div className="font-bold text-slate-100 text-[11px] sm:text-xs">{weatherData.environment.uvIndex}</div>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-rose-950/30 border border-rose-500/20 text-xs text-rose-200 leading-relaxed">
              <strong>Health Guidance:</strong> {weatherData.environment.aqi > 150
                ? 'High particulate concentration. Asthmatic and sensitive individuals should wear N95 masks outdoors.'
                : 'Air quality levels are safe for general public activities and outdoor recreation.'}
            </div>
          </div>
        )}

        {/* 4. AGRICULTURE & GARDENING MODE */}
        {selectedTab === 'agriculture' && (
          <div className="p-4 sm:p-5 rounded-[28px] bg-white/[0.04] border border-white/[0.08] backdrop-blur-xl shadow-2xl space-y-4">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <h4 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                <Sprout className="w-4 h-4 text-green-400 shrink-0" />
                Soil Moisture & Irrigation Forecast
              </h4>
              <button
                onClick={handleRefreshSensor}
                disabled={isSensorRefreshing}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-green-300 text-xs font-semibold transition-all cursor-pointer min-h-[40px] touch-manipulation active:scale-95"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSensorRefreshing ? 'animate-spin' : ''}`} />
                <span>{isSensorRefreshing ? 'Syncing...' : 'Sync IoT Sensor'}</span>
              </button>
            </div>

            {sensorSuccessMsg && (
              <div className="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 text-xs flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{sensorSuccessMsg}</span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
              <div className="p-3.5 sm:p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
                <span className="text-xs text-slate-400">Sensor Soil Moisture</span>
                <div className="text-xl sm:text-2xl font-bold text-slate-100 font-['Outfit'] mt-1">
                  {weatherData.agriculture?.soilMoisture || 68}%
                </div>
                <span className="text-[10px] text-green-400 font-medium">IoT Node Active</span>
              </div>

              <div className="p-3.5 sm:p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
                <span className="text-xs text-slate-400">Expected 24h Rain</span>
                <div className="text-xl sm:text-2xl font-bold text-slate-100 font-['Outfit'] mt-1">
                  {weatherData.agriculture?.expectedRain24h || 18} <span className="text-xs font-normal">mm</span>
                </div>
                <span className="text-[10px] text-[#60A5FA] font-medium">Precipitation Vol</span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-green-950/30 border border-green-500/30 text-xs text-green-200 leading-relaxed">
              <span className="font-bold block mb-1">🌱 Irrigation Optimization Engine:</span>
              <p>
                {weatherData.agriculture?.irrigationRecommendation ||
                  'Delay irrigation for 24-36 hours. Natural rainfall will meet crop water requirements and avoid fertilizer leaching.'}
              </p>
            </div>
          </div>
        )}

        {/* 5. BEACH & SURFER MODE */}
        {selectedTab === 'beach' && (
          <div className="p-4 sm:p-5 rounded-[28px] bg-white/[0.04] border border-white/[0.08] backdrop-blur-xl shadow-2xl space-y-4">
            <h4 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
              <Waves className="w-4 h-4 text-cyan-400 shrink-0" />
              Marine, Surf & Swell Intelligence
            </h4>

            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2.5 sm:p-3 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
                <span className="text-slate-400 text-[10px]">Wave Height</span>
                <div className="text-sm sm:text-base font-bold text-slate-100 mt-1">{weatherData.marine?.waveHeight || 1.8} m</div>
              </div>
              <div className="p-2.5 sm:p-3 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
                <span className="text-slate-400 text-[10px]">Water Temp</span>
                <div className="text-sm sm:text-base font-bold text-slate-100 mt-1">{weatherData.marine?.waterTemp || 28}°C</div>
              </div>
              <div className="p-2.5 sm:p-3 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
                <span className="text-slate-400 text-[10px]">Rip Current</span>
                <div className="text-sm sm:text-base font-bold text-slate-100 mt-1">{weatherData.marine?.ripCurrentRisk || 'Low'}</div>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-cyan-950/30 border border-cyan-500/20 text-xs text-cyan-200 leading-relaxed">
              <strong>Tide Status:</strong> {weatherData.marine?.tideTiming?.nextHighTide || 'High Tide at 3:45 PM'}. Conditions are suitable for recreational beach activities in designated sectors.
            </div>
          </div>
        )}

        {/* 6. FAMILY & COMMUTE MODE */}
        {selectedTab === 'family' && (
          <div className="p-4 sm:p-5 rounded-[28px] bg-white/[0.04] border border-white/[0.08] backdrop-blur-xl shadow-2xl space-y-4">
            <div className="flex items-center justify-between gap-2">
              <h4 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-violet-400 shrink-0" />
                Family & School Commute Safety
              </h4>
            </div>

            {/* Time Slot Simulator */}
            <div className="grid grid-cols-3 gap-2">
              {(['Morning', 'Afternoon', 'Evening'] as const).map((slot) => (
                <button
                  key={slot}
                  onClick={() => setFamilyTimeSlot(slot)}
                  className={`py-2 rounded-xl text-xs font-semibold transition-all border cursor-pointer min-h-[40px] touch-manipulation select-none active:scale-95 ${
                    familyTimeSlot === slot
                      ? 'bg-violet-500/20 border-violet-400/40 text-violet-200'
                      : 'bg-white/[0.02] border-white/[0.05] text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {slot}
                </button>
              ))}
            </div>

            <div className="p-3.5 sm:p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">{familyTimeSlot} Risk:</span>
                <span className="font-bold text-slate-200">{familyTimeSlot === 'Afternoon' ? 'Moderate (UV peak)' : 'Low / Nominal'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Playground Index:</span>
                <span className="font-bold text-emerald-400">{familyTimeSlot === 'Evening' ? '92/100 (Optimal)' : '78/100 (Safe)'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Gear Checklist:</span>
                <span className="font-bold text-amber-400">Compact umbrella & SPF 30+</span>
              </div>
            </div>
          </div>
        )}

        {/* Ask AI Trigger for current mode */}
        <button
          onClick={() => onAskAI(`What are the key weather precautions for a ${currentProfile.name} in ${weatherData.locationName} today?`)}
          className="w-full flex items-center justify-between gap-2 p-4 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] active:scale-[0.98] border border-white/[0.08] text-slate-100 text-xs sm:text-sm font-semibold transition-all shadow-md group cursor-pointer min-h-[52px] touch-manipulation"
        >
          <span className="flex items-center gap-2 min-w-0">
            <Sparkles className="w-4 h-4 text-[#60A5FA] group-hover:rotate-12 transition-transform shrink-0" />
            <span className="truncate">Ask AI about {currentProfile.shortName} Guidance</span>
          </span>
          <ArrowRight className="w-4 h-4 text-[#60A5FA] group-hover:translate-x-1 transition-transform shrink-0" />
        </button>
      </motion.div>
    </div>
  );
};


