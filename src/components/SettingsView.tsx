import React from 'react';
import { motion } from 'motion/react';
import {
  Settings as SettingsIcon,
  Sparkles,
  MapPin,
  Compass,
  Thermometer,
  Wind,
  Shield,
  RotateCcw,
  Check,
  Navigation,
  Share2,
  HelpCircle,
  ChevronRight,
  Layers,
  History,
} from 'lucide-react';
import { PersonaId, UserLocationState } from '../types';
import { PERSONA_PROFILES } from '../data/weatherData';
import { PersonaIcon } from '../utils/weatherIcons';
import { NavigationState } from '../utils/dataStructures';

interface SettingsViewProps {
  selectedPersonas: PersonaId[];
  activePersona: PersonaId;
  onTogglePersona: (id: PersonaId) => void;
  onSetActivePersona: (id: PersonaId) => void;
  userLocation: UserLocationState;
  onDetectLocation: () => Promise<void>;
  onOpenLocationModal: () => void;
  onOpenShareModal: () => void;
  onReopenOnboarding: () => void;
  isDetectingGPS: boolean;
  navigationHistory?: NavigationState[];
  queuePendingCount?: number;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  selectedPersonas,
  activePersona,
  onTogglePersona,
  onSetActivePersona,
  userLocation,
  onDetectLocation,
  onOpenLocationModal,
  onOpenShareModal,
  onReopenOnboarding,
  isDetectingGPS,
  navigationHistory = [],
  queuePendingCount = 0,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.25 }}
      className="space-y-4 pb-20 select-none text-left"
    >
      {/* Settings Header */}
      <div className="p-4 sm:p-5 rounded-3xl bg-white/[0.04] border border-white/[0.08] backdrop-blur-2xl shadow-xl flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-sky-500/15 text-sky-400 border border-sky-400/30">
            <SettingsIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white leading-tight">Settings & Preferences</h2>
            <p className="text-xs text-slate-400">Personalize weather intelligence, location and units</p>
          </div>
        </div>
      </div>

      {/* SECTION 1: PERSONALIZATION & INTERESTS */}
      <div className="p-4 sm:p-5 rounded-3xl bg-white/[0.04] border border-white/[0.08] backdrop-blur-2xl shadow-xl space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-sky-400 uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Personalization & Interests</span>
          </div>
          <span className="text-[10px] text-slate-400">{selectedPersonas.length} Active</span>
        </div>

        <p className="text-xs text-slate-300">
          Select what matters to you. The app tailors the "Your Day" recommendation, safety alerts, and activity schedules to these selections.
        </p>

        {/* Interests Grid */}
        <div className="space-y-2 pt-1">
          {PERSONA_PROFILES.map((profile) => {
            const isSelected = selectedPersonas.includes(profile.id);
            const isPrimary = activePersona === profile.id;

            return (
              <div
                key={profile.id}
                className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 min-h-[50px] touch-manipulation select-none ${
                  isSelected
                    ? 'bg-sky-500/15 border-sky-400/35 text-white'
                    : 'bg-white/[0.02] border-white/[0.05] text-slate-300'
                }`}
              >
                <div
                  onClick={() => onTogglePersona(profile.id)}
                  className="flex items-center gap-3 flex-1 cursor-pointer min-w-0"
                >
                  <div className={`p-2 rounded-xl text-sky-400 shrink-0 ${isSelected ? 'bg-sky-400/20' : 'bg-white/[0.04]'}`}>
                    <PersonaIcon personaId={profile.id} className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs sm:text-sm font-bold text-white truncate">{profile.name}</span>
                      {isPrimary && (
                        <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-sky-400 text-slate-950">
                          Primary Focus
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 truncate">{profile.tagline}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {isSelected && !isPrimary && (
                    <button
                      onClick={() => onSetActivePersona(profile.id)}
                      className="text-[10px] px-2 py-1 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] text-sky-300 font-semibold cursor-pointer active:scale-95"
                    >
                      Set Primary
                    </button>
                  )}
                  <button
                    onClick={() => onTogglePersona(profile.id)}
                    className={`w-6 h-6 rounded-full flex items-center justify-center border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-sky-400 border-sky-400 text-slate-950'
                        : 'border-slate-600 bg-transparent'
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 2: LOCATION & SENSORS */}
      <div className="p-4 sm:p-5 rounded-3xl bg-white/[0.04] border border-white/[0.08] backdrop-blur-2xl shadow-xl space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-sky-400 uppercase tracking-wider">
          <MapPin className="w-3.5 h-3.5" />
          <span>Location & Weather Stations</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-between gap-3">
          <div>
            <div className="text-xs text-slate-400">Current Active Location</div>
            <div className="text-sm sm:text-base font-bold text-white mt-0.5">
              {userLocation.locationName}, {userLocation.country}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              {userLocation.isLiveGPS ? '📍 Live GPS coordinates active' : 'Selected meteorological station'}
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={onDetectLocation}
              disabled={isDetectingGPS}
              className="px-3 py-2 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 font-bold text-xs border border-sky-400/30 cursor-pointer active:scale-95 transition-all flex items-center gap-1 min-h-[44px]"
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>{isDetectingGPS ? 'Detecting...' : 'Detect GPS'}</span>
            </button>
            <button
              onClick={onOpenLocationModal}
              className="px-3 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-white font-semibold text-xs border border-white/[0.08] cursor-pointer active:scale-95 transition-all min-h-[44px]"
            >
              Change
            </button>
          </div>
        </div>

        {/* Location Sharing Row */}
        <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-between gap-3">
          <div>
            <div className="text-xs font-bold text-white flex items-center gap-1.5">
              <Share2 className="w-3.5 h-3.5 text-sky-400" />
              <span>Live Location & Weather Sharing</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Share real-time weather alerts and location safely with family and friends.
            </p>
          </div>

          <button
            onClick={onOpenShareModal}
            className="px-3.5 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-sky-300 font-semibold text-xs border border-white/[0.08] cursor-pointer active:scale-95 transition-all shrink-0 min-h-[44px]"
          >
            Share Link
          </button>
        </div>
      </div>

      {/* SECTION 3: DATA STRUCTURES & ARCHITECTURE (QUEUE & STACK) */}
      <div className="p-4 sm:p-5 rounded-3xl bg-white/[0.04] border border-white/[0.08] backdrop-blur-2xl shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-sky-400 uppercase tracking-wider">
            <Layers className="w-3.5 h-3.5" />
            <span>Core Data Structures & Architecture</span>
          </div>
          <span className="text-[10px] text-emerald-400 font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/30">
            Active
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {/* Stack Card */}
          <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.06] space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <History className="w-3.5 h-3.5 text-sky-400" />
                <span>Navigation Stack (LIFO)</span>
              </span>
              <span className="text-[10px] text-sky-300 font-bold px-1.5 py-0.5 rounded bg-sky-500/20">
                Depth: {navigationHistory.length}
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Tracks screen states, modals, and breadcrumbs with deterministic Back navigation.
            </p>
            {navigationHistory.length > 0 && (
              <div className="flex items-center gap-1 overflow-x-auto py-1 text-[10px] text-slate-300 scrollbar-none">
                {navigationHistory.slice(0, 4).map((h, i) => (
                  <span key={i} className="px-2 py-0.5 rounded-md bg-white/[0.06] shrink-0">
                    {i === 0 ? '▶ ' : ''}{h.label}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Queue Card */}
          <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.06] space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-amber-400" />
                <span>Alert Event Queue (FIFO)</span>
              </span>
              <span className="text-[10px] text-amber-300 font-bold px-1.5 py-0.5 rounded bg-amber-500/20">
                Pending: {queuePendingCount}
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Buffers and processes incoming sensor threshold breaches in sequential chronological order.
            </p>
          </div>
        </div>
      </div>

      {/* SECTION 4: WALKTHROUGH & APP RESET */}
      <div className="p-4 sm:p-5 rounded-3xl bg-white/[0.04] border border-white/[0.08] backdrop-blur-2xl shadow-xl space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-wider">
          <HelpCircle className="w-3.5 h-3.5 text-sky-400" />
          <span>App Walkthrough & Guidance</span>
        </div>

        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-xs font-bold text-white">Replay Onboarding Guide</div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Review the initial setup and feature overview anytime.
            </div>
          </div>

          <button
            onClick={onReopenOnboarding}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-slate-200 text-xs font-semibold border border-white/[0.08] cursor-pointer active:scale-95 transition-all min-h-[44px]"
          >
            <RotateCcw className="w-3.5 h-3.5 text-sky-400" />
            <span>Replay</span>
          </button>
        </div>
      </div>

      {/* About & Trust Footer */}
      <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.04] text-center space-y-1">
        <div className="text-xs font-semibold text-slate-400">ClimaIQ Weather Intelligence</div>
        <p className="text-[11px] text-slate-500">
          “Simple on the surface. Powerful underneath.” · Real-time atmospheric & deterministic localized engine.
        </p>
      </div>
    </motion.div>
  );
};

