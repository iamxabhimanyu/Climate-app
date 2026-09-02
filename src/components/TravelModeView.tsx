import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Luggage,
  Search,
  CheckCircle2,
  Circle,
  Sparkles,
  ShieldAlert,
  ArrowRight,
  RefreshCw,
  Plus,
  Trash2,
  CheckCheck,
  RotateCcw,
  Copy,
  Check,
  MapPin,
  Compass,
  Radio,
} from 'lucide-react';
import { PackingItem, TravelDestination, WeatherData, UserLocationState } from '../types';
import { GLOBAL_DESTINATIONS } from '../data/weatherData';
import { WeatherIcon } from '../utils/weatherIcons';
import { generateDeterministicPackingList } from '../utils/weatherEngine';
import { LocationMapView } from './LocationMapView';
import { DemoLocationPreset } from '../utils/locationManager';

interface TravelModeViewProps {
  weatherData: WeatherData;
  userLocation: UserLocationState;
  onDetectCurrentLocation: () => Promise<void>;
  onSelectPresetLocation: (preset: DemoLocationPreset) => void;
  onToggleLiveSharing: () => void;
  onAskAIAboutDestination: (city: string) => void;
}

export const TravelModeView: React.FC<TravelModeViewProps> = ({
  weatherData,
  userLocation,
  onDetectCurrentLocation,
  onSelectPresetLocation,
  onToggleLiveSharing,
  onAskAIAboutDestination,
}) => {
  const [subView, setSubView] = useState<'map' | 'packing'>('map');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDestination, setSelectedDestination] = useState<TravelDestination>(GLOBAL_DESTINATIONS[0]);
  const [tripDuration, setTripDuration] = useState(3);
  const [packingFilter, setPackingFilter] = useState<'all' | 'essential' | 'unpacked' | 'packed'>('all');
  const [customItemInput, setCustomItemInput] = useState('');
  const [copiedNotification, setCopiedNotification] = useState(false);
  const [packingList, setPackingList] = useState<PackingItem[]>(() =>
    generateDeterministicPackingList(
      GLOBAL_DESTINATIONS[0].city,
      GLOBAL_DESTINATIONS[0].temp,
      GLOBAL_DESTINATIONS[0].rainProb,
      GLOBAL_DESTINATIONS[0].conditionText
    )
  );
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  const filteredDestinations = GLOBAL_DESTINATIONS.filter(
    (d) =>
      d.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.country.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectDestination = (dest: TravelDestination) => {
    setSelectedDestination(dest);
    setPackingList(
      generateDeterministicPackingList(dest.city, dest.temp, dest.rainProb, dest.conditionText)
    );
  };

  const handleToggleCheck = (itemId: string) => {
    setPackingList((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, checked: !item.checked } : item))
    );
  };

  const handleCheckAll = () => {
    setPackingList((prev) => prev.map((item) => ({ ...item, checked: true })));
  };

  const handleResetAll = () => {
    setPackingList((prev) => prev.map((item) => ({ ...item, checked: false })));
  };

  const handleDeleteItem = (itemId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setPackingList((prev) => prev.filter((item) => item.id !== itemId));
  };

  const handleAddCustomItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customItemInput.trim()) return;
    const newItem: PackingItem = {
      id: `custom-pack-${Date.now()}`,
      category: 'Custom',
      item: customItemInput.trim(),
      essential: false,
      checked: false,
      weatherReason: `Added by user for trip to ${selectedDestination.city}`,
    };
    setPackingList((prev) => [newItem, ...prev]);
    setCustomItemInput('');
  };

  const handleCopyPackingList = () => {
    const text = packingList
      .map((item) => `[${item.checked ? 'x' : ' '}] ${item.item} (${item.category}) - ${item.weatherReason}`)
      .join('\n');
    navigator.clipboard.writeText(`Trip to ${selectedDestination.city} Packing Checklist:\n${text}`);
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 2000);
  };

  const handleGenerateAIPacking = async () => {
    setIsGeneratingAI(true);
    try {
      const res = await fetch('/api/gemini/packing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          destinationCity: selectedDestination.city,
          country: selectedDestination.country,
          temp: selectedDestination.temp,
          condition: selectedDestination.conditionText,
          rainProb: selectedDestination.rainProb,
          durationDays: tripDuration,
        }),
      });
      const data = await res.json();
      if (data.items && data.items.length > 0) {
        const mappedItems: PackingItem[] = data.items.map((it: any, idx: number) => ({
          id: `ai-pack-${idx}-${Date.now()}`,
          category: it.category || 'General',
          item: it.item,
          essential: it.essential !== false,
          checked: false,
          weatherReason: it.reason || `Tailored for ${selectedDestination.temp}°C and ${selectedDestination.rainProb}% rain chance.`,
        }));
        setPackingList(mappedItems);
      }
    } catch (err) {
      console.error('Error generating AI packing list:', err);
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const displayedPackingItems = packingList.filter((item) => {
    if (packingFilter === 'essential') return item.essential;
    if (packingFilter === 'unpacked') return !item.checked;
    if (packingFilter === 'packed') return item.checked;
    return true;
  });

  const packedCount = packingList.filter((item) => item.checked).length;
  const totalCount = packingList.length;
  const packedPercent = totalCount > 0 ? Math.round((packedCount / totalCount) * 100) : 0;

  return (
    <div className="space-y-4 pb-20">
      {/* View Switcher Header */}
      <div className="flex bg-white/[0.04] p-1 rounded-2xl border border-white/[0.08] text-xs">
        <button
          onClick={() => setSubView('map')}
          className={`flex-1 py-2.5 rounded-xl font-bold transition-all cursor-pointer min-h-[44px] touch-manipulation select-none active:scale-95 flex items-center justify-center gap-2 ${
            subView === 'map'
              ? 'bg-gradient-to-r from-[#60A5FA] to-blue-600 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Compass className="w-4 h-4" />
          <span>Live Location & Radar Map</span>
          {userLocation.isLiveGPS && (
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          )}
        </button>

        <button
          onClick={() => setSubView('packing')}
          className={`flex-1 py-2.5 rounded-xl font-bold transition-all cursor-pointer min-h-[44px] touch-manipulation select-none active:scale-95 flex items-center justify-center gap-2 ${
            subView === 'packing'
              ? 'bg-gradient-to-r from-[#60A5FA] to-blue-600 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Luggage className="w-4 h-4" />
          <span>Travel & Packing</span>
        </button>
      </div>

      {/* VIEW 1: INTERACTIVE LIVE LOCATION & RADAR MAP */}
      {subView === 'map' && (
        <motion.div
          key="sub-map"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
        >
          <LocationMapView
            weatherData={weatherData}
            userLocation={userLocation}
            onDetectCurrentLocation={onDetectCurrentLocation}
            onSelectPresetLocation={onSelectPresetLocation}
            onToggleLiveSharing={onToggleLiveSharing}
            onAskAIAboutLocation={onAskAIAboutDestination}
          />
        </motion.div>
      )}

      {/* VIEW 2: TRAVEL DESTINATIONS & AI PACKING */}
      {subView === 'packing' && (
        <motion.div
          key="sub-packing"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          className="space-y-4"
        >
          {/* Travel Header */}
          <div className="p-5 rounded-[28px] bg-white/[0.04] border border-white/[0.08] backdrop-blur-xl shadow-2xl">
            <div className="flex items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-2xl bg-[rgba(96,165,250,0.15)] text-[#60A5FA] border border-[rgba(96,165,250,0.3)]">
                  <Luggage className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-[#60A5FA]">
                    Explore & Travel Mode
                  </span>
                  <h2 className="text-base sm:text-lg font-bold text-white leading-tight">
                    Destination Intelligence & Packing
                  </h2>
                </div>
              </div>
            </div>

            {/* Destination Search */}
            <div className="relative mt-2">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                id="travel-destination-search"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search destination (London, Mumbai, Delhi, Dubai, Tokyo, New York)..."
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white/[0.04] border border-white/[0.08] text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-[#60A5FA]/50"
              />
            </div>

            {/* Quick Destination Pills */}
            <div className="flex gap-2 overflow-x-auto pt-3 pb-1 scrollbar-none overscroll-x-contain -mx-1 px-1">
              {filteredDestinations.map((dest) => (
                <button
                  key={dest.id}
                  onClick={() => handleSelectDestination(dest)}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold shrink-0 transition-all border cursor-pointer min-h-[44px] touch-manipulation select-none active:scale-95 ${
                    selectedDestination.id === dest.id
                      ? 'bg-[rgba(96,165,250,0.25)] border-[rgba(96,165,250,0.5)] text-sky-200 shadow-sm'
                      : 'bg-white/[0.03] border-white/[0.05] text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <WeatherIcon condition={dest.condition} className="w-4 h-4" />
                  <span>{dest.city}</span>
                  <span className="opacity-60 text-[10px]">{dest.temp}°</span>
                </button>
              ))}
            </div>
          </div>

          {/* Selected Destination Weather Spotlight Card */}
          <motion.div
            key={selectedDestination.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 sm:p-5 rounded-[28px] bg-gradient-to-br from-[rgba(96,165,250,0.1)] to-[rgba(30,58,138,0.05)] border border-[rgba(96,165,250,0.2)] backdrop-blur-xl shadow-2xl space-y-3"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                <div className="p-2.5 sm:p-3 rounded-2xl bg-white/[0.05] border border-white/[0.08] shrink-0">
                  <WeatherIcon condition={selectedDestination.condition} className="w-8 h-8 sm:w-10 sm:h-10" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h3 className="text-lg sm:text-xl font-bold text-white truncate">
                      {selectedDestination.city}
                    </h3>
                    <span className="text-xs text-slate-400 truncate">{selectedDestination.country}</span>
                  </div>
                  <p className="text-xs text-slate-300 font-medium mt-0.5 truncate">
                    {selectedDestination.conditionText}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                <div className="text-right">
                  <div className="text-2xl sm:text-3xl font-extrabold text-white font-['Outfit']">
                    {selectedDestination.temp}°C
                  </div>
                  <span className="text-[10px] sm:text-[11px] text-[#60A5FA] font-medium">
                    {selectedDestination.rainProb}% Rain
                  </span>
                </div>

                <div className="px-2.5 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-right">
                  <div className="text-sm sm:text-base font-extrabold leading-tight font-['Outfit']">
                    {selectedDestination.travelScore}<span className="text-[9px] opacity-70">/100</span>
                  </div>
                  <div className="text-[8px] sm:text-[9px] uppercase font-semibold">Index</div>
                </div>
              </div>
            </div>

            {/* Travel Advisory Callout */}
            <div className="p-3 rounded-2xl bg-[rgba(96,165,250,0.08)] border border-[rgba(96,165,250,0.2)] text-xs text-slate-100 flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 text-[#60A5FA] shrink-0 mt-0.5" />
              <div className="leading-relaxed">
                <strong className="text-[#60A5FA]">Advisory:</strong> {selectedDestination.travelAdvisory}
              </div>
            </div>

            {/* Ask AI about this destination */}
            <button
              onClick={() => onAskAIAboutDestination(selectedDestination.city)}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] active:scale-[0.98] border border-white/[0.08] text-xs font-semibold text-slate-200 hover:text-white transition-all cursor-pointer min-h-[44px] touch-manipulation"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#60A5FA] shrink-0" />
              <span className="truncate">Ask AI: "What to do in {selectedDestination.city}?"</span>
              <ArrowRight className="w-3.5 h-3.5 shrink-0" />
            </button>
          </motion.div>

          {/* AI Smart Packing Assistant Section */}
          <div className="p-4 sm:p-5 rounded-[28px] bg-white/[0.04] border border-white/[0.08] backdrop-blur-xl shadow-2xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <h3 className="text-base font-bold text-white">AI Packing Assistant</h3>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Customized checklist for {selectedDestination.city}
                </p>
              </div>

              <div className="flex items-center gap-2">
                {/* Trip duration pills */}
                <div className="flex items-center gap-1 bg-white/[0.03] p-1 rounded-xl border border-white/[0.06] text-xs">
                  {[2, 3, 5, 7].map((days) => (
                    <button
                      key={days}
                      onClick={() => setTripDuration(days)}
                      className={`px-3 py-2 rounded-lg font-semibold transition-all cursor-pointer min-h-[38px] touch-manipulation select-none active:scale-95 ${
                        tripDuration === days ? 'bg-[#60A5FA] text-slate-950 shadow-sm' : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {days}d
                    </button>
                  ))}
                </div>

                <button
                  onClick={handleGenerateAIPacking}
                  disabled={isGeneratingAI}
                  className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-slate-200 text-xs font-semibold transition-all active:scale-95 shadow-sm cursor-pointer min-h-[40px] touch-manipulation"
                >
                  <RefreshCw className={`w-3.5 h-3.5 text-[#60A5FA] ${isGeneratingAI ? 'animate-spin' : ''}`} />
                  <span>{isGeneratingAI ? 'Generating...' : 'AI Refresh'}</span>
                </button>
              </div>
            </div>

            {/* Progress Bar & Filter Tabs */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-300">
                <span>
                  Packing Progress: <strong>{packedCount}</strong> of <strong>{totalCount}</strong> items ({packedPercent}%)
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCheckAll}
                    className="flex items-center gap-1 text-[11px] text-[#60A5FA] hover:text-white transition-colors cursor-pointer"
                    title="Check all items"
                  >
                    <CheckCheck className="w-3 h-3" /> Check All
                  </button>
                  <span className="text-slate-600">•</span>
                  <button
                    onClick={handleResetAll}
                    className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white transition-colors cursor-pointer"
                    title="Reset all checkmarks"
                  >
                    <RotateCcw className="w-3 h-3" /> Reset
                  </button>
                  <span className="text-slate-600">•</span>
                  <button
                    onClick={handleCopyPackingList}
                    className="flex items-center gap-1 text-[11px] text-amber-400 hover:text-amber-300 transition-colors cursor-pointer"
                    title="Copy list to clipboard"
                  >
                    {copiedNotification ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedNotification ? 'Copied!' : 'Copy'}</span>
                  </button>
                </div>
              </div>

              <div className="w-full bg-white/[0.06] h-2 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-400 h-full rounded-full transition-all duration-300"
                  style={{ width: `${packedPercent}%` }}
                />
              </div>

              {/* Filter Pills */}
              <div className="flex items-center gap-1.5 pt-1 text-xs overflow-x-auto pb-1 scrollbar-none overscroll-x-contain">
                {(['all', 'essential', 'unpacked', 'packed'] as const).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setPackingFilter(filter)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-semibold capitalize transition-all cursor-pointer min-h-[40px] touch-manipulation select-none active:scale-95 ${
                      packingFilter === filter
                        ? 'bg-white/[0.15] text-white border border-white/[0.2]'
                        : 'text-slate-400 hover:text-slate-200 bg-white/[0.02] border border-white/[0.04]'
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>

            {/* Add Custom Item Form */}
            <form onSubmit={handleAddCustomItem} className="flex gap-2">
              <input
                type="text"
                value={customItemInput}
                onChange={(e) => setCustomItemInput(e.target.value)}
                placeholder="Add personal gear..."
                className="flex-1 px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-[#60A5FA]/50 min-h-[44px]"
              />
              <button
                type="submit"
                className="flex items-center gap-1 px-4 py-2.5 rounded-xl bg-[rgba(96,165,250,0.15)] hover:bg-[rgba(96,165,250,0.25)] text-[#60A5FA] text-xs font-semibold border border-[rgba(96,165,250,0.3)] transition-all cursor-pointer active:scale-95 min-h-[44px] touch-manipulation"
              >
                <Plus className="w-4 h-4" />
                <span>Add</span>
              </button>
            </form>

            {/* Interactive Packing Items Checklist */}
            <div className="space-y-2">
              {displayedPackingItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleToggleCheck(item.id)}
                  className={`group flex items-start gap-3 p-3 rounded-2xl border transition-all cursor-pointer select-none min-h-[48px] touch-manipulation active:scale-[0.99] ${
                    item.checked
                      ? 'bg-emerald-950/20 border-emerald-500/30 text-slate-300'
                      : 'bg-white/[0.02] hover:bg-white/[0.05] border-white/[0.05] text-slate-100'
                  }`}
                >
                  <button className="mt-0.5 shrink-0 text-slate-400 group-hover:text-slate-200">
                    {item.checked ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <Circle className="w-5 h-5 text-slate-500" />
                    )}
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`text-xs sm:text-sm font-semibold ${
                          item.checked ? 'line-through opacity-70 text-slate-400' : 'text-slate-100'
                        }`}
                      >
                        {item.item}
                      </span>
                      {item.essential && (
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 shrink-0 uppercase">
                          Essential
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                      {item.weatherReason}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-white/[0.04] text-slate-400">
                      {item.category}
                    </span>
                    <button
                      onClick={(e) => handleDeleteItem(item.id, e)}
                      className="p-1.5 hover:bg-rose-500/20 rounded-md text-slate-500 hover:text-rose-300 transition-all min-w-[32px] min-h-[32px] flex items-center justify-center cursor-pointer"
                      title="Delete item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}

              {displayedPackingItems.length === 0 && (
                <div className="text-center py-6 text-xs text-slate-400">
                  No items matching filter "{packingFilter}".
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};
