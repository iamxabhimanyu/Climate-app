import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Search,
  MapPin,
  Navigation,
  Check,
  Radio,
  AlertTriangle,
  RotateCw,
  Compass,
  Sparkles,
} from 'lucide-react';
import { WeatherData, UserLocationState } from '../types';
import { DEMO_LOCATION_PRESETS, DemoLocationPreset, fetchLiveCurrentLocationWeather } from '../utils/locationManager';
import { DEMO_SCENARIOS } from '../data/weatherData';
import { WeatherIcon } from '../utils/weatherIcons';

interface LocationSelectorModalProps {
  isOpen: boolean;
  currentLocationName: string;
  userLocation: UserLocationState;
  onSelectLocationData: (data: WeatherData) => void;
  onDetectGPS: () => Promise<void>;
  onClose: () => void;
}

export const LocationSelectorModal: React.FC<LocationSelectorModalProps> = ({
  isOpen,
  currentLocationName,
  userLocation,
  onSelectLocationData,
  onDetectGPS,
  onClose,
}) => {
  const [search, setSearch] = useState('');
  const [isLocating, setIsLocating] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleLiveGPSClick = async () => {
    setIsLocating(true);
    setGpsError(null);
    try {
      await onDetectGPS();
      onClose();
    } catch (err: any) {
      setGpsError(
        err.message ||
          'Location access is unavailable. Please check browser permissions or select a manual location.'
      );
    } finally {
      setIsLocating(false);
    }
  };

  const filteredScenarios = DEMO_SCENARIOS.filter(
    (s) =>
      s.locationName.toLowerCase().includes(search.toLowerCase()) ||
      s.title.toLowerCase().includes(search.toLowerCase()) ||
      (s.scenarioData?.country || '').toLowerCase().includes(search.toLowerCase())
  );

  const filteredPresets = DEMO_LOCATION_PRESETS.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.region.toLowerCase().includes(search.toLowerCase()) ||
      p.country.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          className="w-full max-w-md rounded-t-[28px] sm:rounded-[28px] bg-[#05070A] border border-white/[0.1] p-4 sm:p-5 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between gap-3 pb-3 border-b border-white/[0.08]">
            <div className="flex items-center gap-2 min-w-0">
              <div className="p-2 rounded-2xl bg-[rgba(96,165,250,0.15)] text-[#60A5FA] border border-[rgba(96,165,250,0.3)] shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h3 className="text-base font-bold text-white truncate">Select Location</h3>
                <p className="text-xs text-slate-400 truncate">
                  Live GPS detection or weather station search
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="min-w-[40px] min-h-[40px] rounded-full bg-white/[0.05] hover:bg-white/[0.1] text-slate-400 hover:text-white transition-colors flex items-center justify-center cursor-pointer touch-manipulation active:scale-95"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Search input */}
          <div className="relative my-3">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search Aurangabad, Mumbai, Pune, Delhi, London..."
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white/[0.04] border border-white/[0.08] text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-[#60A5FA]/50 min-h-[44px]"
            />
          </div>

          {/* Real Live GPS Trigger Button */}
          <div className="mb-2">
            <button
              onClick={handleLiveGPSClick}
              disabled={isLocating}
              className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-gradient-to-r from-[rgba(96,165,250,0.15)] to-blue-600/10 hover:from-[rgba(96,165,250,0.25)] hover:to-blue-600/20 border border-[rgba(96,165,250,0.4)] text-sky-200 text-xs font-bold transition-all text-left min-h-[50px] touch-manipulation active:scale-98 cursor-pointer shadow-sm"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="p-2 rounded-xl bg-sky-500/20 text-[#60A5FA]">
                  <Navigation
                    className={`w-4 h-4 ${isLocating ? 'animate-spin text-amber-300' : 'animate-pulse'}`}
                  />
                </div>
                <div className="min-w-0">
                  <span className="truncate block font-extrabold text-white text-xs sm:text-sm">
                    {isLocating ? 'Detecting GPS Location...' : '📍 Use Current Live Location'}
                  </span>
                  <p className="text-[10px] text-slate-400 font-normal truncate">
                    Acquires real GPS coordinates & reverse-geocodes city
                  </p>
                </div>
              </div>

              <span className="px-2.5 py-1 rounded-xl bg-sky-500 text-slate-950 font-bold text-[10px] shrink-0 ml-2">
                Auto Detect
              </span>
            </button>
          </div>

          {/* GPS Error Banner (Fallback to Manual) */}
          {gpsError && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-3 p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-200 text-xs flex items-start gap-2.5"
            >
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <span className="font-bold text-rose-300 block">Location access is unavailable.</span>
                <p className="text-[11px] text-rose-200/90 mt-0.5 leading-relaxed">
                  {gpsError} Please pick a city below or search manually.
                </p>
              </div>
            </motion.div>
          )}

          {/* Location Sections */}
          <div className="overflow-y-auto space-y-2 flex-1 pr-0.5 scrollbar-thin scrollbar-thumb-white/10">
            <div className="text-[10px] uppercase font-bold tracking-wider text-[#60A5FA] px-1 pt-1">
              Active Meteorological Stations & Cities
            </div>

            {filteredScenarios.map((scenario) => {
              const weather = scenario.scenarioData;
              const isSelected =
                currentLocationName.toLowerCase() === weather.locationName.toLowerCase();

              return (
                <div
                  key={scenario.id}
                  onClick={() => {
                    onSelectLocationData(weather);
                    onClose();
                  }}
                  className={`p-3 sm:p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 min-h-[52px] touch-manipulation active:scale-98 select-none ${
                    isSelected
                      ? 'bg-[rgba(96,165,250,0.15)] border-[rgba(96,165,250,0.4)] text-white shadow-sm'
                      : 'bg-white/[0.02] hover:bg-white/[0.06] border-white/[0.05] text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2 rounded-xl bg-white/[0.04]">
                      <WeatherIcon condition={scenario.condition} className="w-5 h-5 shrink-0" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5 truncate">
                        <span className="truncate">{weather.locationName}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-[#60A5FA] shrink-0" />}
                      </div>
                      <span className="text-[11px] text-slate-400 truncate block">
                        {weather.country} · {weather.conditionText}
                      </span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-sm sm:text-base font-extrabold font-['Outfit']">
                      {weather.currentTemp}°C
                    </div>
                    <span className="text-[10px] text-slate-400">
                      AQI {weather.environment.aqi}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
