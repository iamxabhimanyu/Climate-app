import React from 'react';
import { MapPin, Bell, ChevronDown, ChevronLeft } from 'lucide-react';
import { PersonaId } from '../types';
import { PERSONA_PROFILES } from '../data/weatherData';
import { PersonaIcon } from '../utils/weatherIcons';

interface HeaderBarProps {
  locationName: string;
  country: string;
  activePersona: PersonaId;
  alertCount: number;
  isLiveGPS?: boolean;
  isLiveSharingActive?: boolean;
  canGoBack?: boolean;
  onGoBack?: () => void;
  onOpenLocationModal: () => void;
  onOpenPersonaModal: () => void;
  onOpenAlertsModal: () => void;
  onOpenShareModal?: () => void;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  locationName,
  country,
  activePersona,
  alertCount,
  isLiveGPS = false,
  isLiveSharingActive = false,
  canGoBack = false,
  onGoBack,
  onOpenLocationModal,
  onOpenPersonaModal,
  onOpenAlertsModal,
  onOpenShareModal,
}) => {
  const currentPersona = PERSONA_PROFILES.find((p) => p.id === activePersona) || PERSONA_PROFILES[0];

  return (
    <header className="sticky top-0 z-30 w-full backdrop-blur-2xl bg-[#030712]/75 border-b border-white/[0.08] transition-all duration-300 pt-[env(safe-area-inset-top,0px)]">
      <div className="max-w-3xl mx-auto px-3 sm:px-4 py-2 flex items-center justify-between gap-2">
        {/* Left Side: Back button (if available) & Location selector */}
        <div className="flex items-center gap-1.5 min-w-0">
          {canGoBack && onGoBack && (
            <button
              id="nav-back-btn"
              onClick={onGoBack}
              className="min-h-[44px] min-w-[44px] p-2 rounded-full bg-white/[0.08] hover:bg-white/[0.15] text-slate-200 active:scale-95 border border-white/[0.1] flex items-center justify-center transition-all cursor-pointer shrink-0"
              title="Go back to previous screen (Stack LIFO)"
            >
              <ChevronLeft className="w-4 h-4 text-sky-400" />
            </button>
          )}

          {/* Location selector with GPS Indicator */}
          <button
            id="location-selector-btn"
            onClick={onOpenLocationModal}
            className="flex items-center gap-1.5 min-h-[44px] px-3 py-2 rounded-full bg-white/[0.06] hover:bg-white/[0.12] active:scale-95 border border-white/[0.1] backdrop-blur-md transition-all text-left group shadow-sm max-w-[140px] min-[375px]:max-w-[180px] sm:max-w-none cursor-pointer"
            title="Change or detect live location"
          >
            {isLiveGPS ? (
              <span className="relative flex h-2.5 w-2.5 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
            ) : (
              <MapPin className="w-3.5 h-3.5 text-sky-400 shrink-0 group-hover:scale-110 transition-transform" />
            )}
            <span className="text-xs sm:text-sm font-semibold text-slate-100 truncate">
              {locationName}
            </span>
            <ChevronDown className="w-3 h-3 text-slate-400 group-hover:text-slate-200 transition-colors shrink-0" />
          </button>
        </div>

        {/* Action Controls & Badges */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Live Sharing Quick Badge (if active) */}
          {isLiveSharingActive && onOpenShareModal && (
            <button
              onClick={onOpenShareModal}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-bold animate-pulse cursor-pointer"
              title="Live Location Sharing Active"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              <span className="hidden min-[380px]:inline">Live Sharing</span>
            </button>
          )}

          {/* Active Persona Pill */}
          <button
            id="persona-switch-btn"
            onClick={onOpenPersonaModal}
            className="flex items-center gap-1 min-h-[44px] px-2.5 sm:px-3 py-2 rounded-full bg-sky-500/15 hover:bg-sky-500/25 border border-sky-400/30 text-sky-300 active:scale-95 transition-all text-xs font-semibold tracking-wide cursor-pointer"
            title="Switch user persona"
          >
            <PersonaIcon personaId={activePersona} className="w-3.5 h-3.5 text-sky-400 shrink-0" />
            <span className="hidden min-[360px]:inline text-[11px] sm:text-xs">{currentPersona.shortName}</span>
            <ChevronDown className="w-2.5 h-2.5 opacity-70 shrink-0" />
          </button>

          {/* Alert Center Button */}
          <button
            id="alerts-center-btn"
            onClick={onOpenAlertsModal}
            className="relative min-h-[44px] min-w-[44px] p-2.5 rounded-full bg-white/[0.06] hover:bg-white/[0.12] active:scale-95 border border-white/[0.1] transition-all text-slate-200 flex items-center justify-center cursor-pointer"
            title="View Weather & Environmental Alerts"
          >
            <Bell className="w-4 h-4 text-slate-300" />
            {alertCount > 0 && (
              <span className="absolute 1 top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white ring-2 ring-[#030712] animate-pulse">
                {alertCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};


