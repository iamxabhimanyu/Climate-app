import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  MapPin,
  Navigation,
  Search,
  Check,
  ArrowRight,
  Sparkles,
  Loader2,
  ChevronRight,
} from 'lucide-react';
import { PersonaId } from '../types';
import { PERSONA_PROFILES } from '../data/weatherData';
import { PersonaIcon } from '../utils/weatherIcons';

interface OnboardingModalProps {
  isOpen: boolean;
  selectedPersonas: PersonaId[];
  onTogglePersona: (id: PersonaId) => void;
  onSetSelectedPersonas?: (ids: PersonaId[]) => void;
  onDetectLocation: () => Promise<void>;
  onOpenSearchModal: () => void;
  currentLocationName: string;
  isDetectingGPS: boolean;
  onComplete: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  selectedPersonas,
  onTogglePersona,
  onSetSelectedPersonas,
  onDetectLocation,
  onOpenSearchModal,
  currentLocationName,
  isDetectingGPS,
  onComplete,
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [locationSuccess, setLocationSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleUseGPS = async () => {
    try {
      await onDetectLocation();
      setLocationSuccess(true);
      setTimeout(() => {
        setStep(3);
      }, 600);
    } catch {
      // If error occurs, stay on step 2 with search option ready
      setLocationSuccess(false);
    }
  };

  const handleSkipPersonalization = () => {
    onComplete();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-2xl">
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 24, scale: 0.96 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-md rounded-t-[32px] sm:rounded-[32px] bg-[#05070A] border border-white/[0.12] p-5 sm:p-7 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col relative text-left"
        >
          {/* Subtle Ambient Light */}
          <div className="absolute -top-24 -left-24 w-64 h-64 bg-sky-500/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Progress dots indicator */}
          <div className="flex items-center justify-center gap-1.5 mb-6">
            <div className={`h-1.5 rounded-full transition-all duration-300 ${step === 1 ? 'w-8 bg-sky-400' : 'w-2 bg-white/20'}`} />
            <div className={`h-1.5 rounded-full transition-all duration-300 ${step === 2 ? 'w-8 bg-sky-400' : 'w-2 bg-white/20'}`} />
            <div className={`h-1.5 rounded-full transition-all duration-300 ${step === 3 ? 'w-8 bg-sky-400' : 'w-2 bg-white/20'}`} />
          </div>

          {/* ============================================================ */}
          {/* SCREEN 1: MINIMAL WELCOME                                   */}
          {/* ============================================================ */}
          {step === 1 && (
            <motion.div
              key="step-1"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="space-y-6 flex flex-col justify-between flex-1"
            >
              <div className="space-y-4 pt-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/15 border border-sky-400/30 text-sky-300 text-xs font-semibold">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>ClimaIQ</span>
                </div>

                <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
                  Understand your weather. <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-indigo-300">
                    Make better decisions.
                  </span>
                </h1>

                <p className="text-sm text-slate-300 leading-relaxed font-normal">
                  Personalized weather intelligence based on your location, environment and daily needs.
                </p>
              </div>

              <div className="pt-4 space-y-3">
                <button
                  id="onboarding-get-started-btn"
                  onClick={() => setStep(2)}
                  className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl bg-sky-400 hover:bg-sky-300 text-slate-950 font-bold text-sm sm:text-base shadow-lg shadow-sky-500/25 active:scale-95 transition-all cursor-pointer min-h-[50px] touch-manipulation"
                >
                  <span>Get Started</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* ============================================================ */}
          {/* SCREEN 2: LOCATION ONBOARDING                               */}
          {/* ============================================================ */}
          {step === 2 && (
            <motion.div
              key="step-2"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="space-y-5 flex flex-col justify-between flex-1"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-sky-400 uppercase tracking-wider">
                  <span>Location</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  Where are you?
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Get weather and personalized recommendations for where you are.
                </p>
              </div>

              {/* Two clear location options */}
              <div className="space-y-3 my-2">
                {/* 1. Primary: Use Current Location */}
                <button
                  id="onboarding-use-gps-btn"
                  onClick={handleUseGPS}
                  disabled={isDetectingGPS}
                  className="w-full p-4 rounded-2xl bg-sky-500/15 hover:bg-sky-500/25 border border-sky-400/40 text-left transition-all active:scale-[0.98] cursor-pointer flex items-center justify-between gap-3 group min-h-[64px] touch-manipulation"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="p-2.5 rounded-xl bg-sky-400 text-slate-950 shrink-0">
                      {isDetectingGPS ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <Navigation className="w-5 h-5 fill-slate-950" />
                      )}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white group-hover:text-sky-200 transition-colors">
                        Use My Current Location
                      </div>
                      <div className="text-xs text-slate-300">
                        {isDetectingGPS
                          ? 'Detecting precise GPS coordinates...'
                          : locationSuccess
                          ? `Found: ${currentLocationName}`
                          : 'Automatic local sensors & forecast'}
                      </div>
                    </div>
                  </div>

                  <ChevronRight className="w-5 h-5 text-sky-400 group-hover:translate-x-1 transition-transform shrink-0" />
                </button>

                {/* 2. Secondary: Search for location */}
                <button
                  id="onboarding-search-location-btn"
                  onClick={() => {
                    onOpenSearchModal();
                    setStep(3);
                  }}
                  className="w-full p-4 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-left transition-all active:scale-[0.98] cursor-pointer flex items-center justify-between gap-3 group min-h-[64px] touch-manipulation"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="p-2.5 rounded-xl bg-white/[0.08] text-slate-200 shrink-0">
                      <Search className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white">Search for a Location</div>
                      <div className="text-xs text-slate-400">Choose from major cities & stations</div>
                    </div>
                  </div>

                  <ChevronRight className="w-5 h-5 text-slate-400 group-hover:translate-x-1 transition-transform shrink-0" />
                </button>
              </div>

              {/* Navigation controls */}
              <div className="pt-2 flex items-center justify-between border-t border-white/[0.08]">
                <button
                  onClick={() => setStep(1)}
                  className="px-3 py-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer min-h-[44px] flex items-center"
                >
                  Back
                </button>

                <button
                  onClick={() => setStep(3)}
                  className="px-4 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-xs font-semibold text-slate-200 transition-colors cursor-pointer min-h-[44px] flex items-center gap-1"
                >
                  <span>Skip location</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          )}

          {/* ============================================================ */}
          {/* SCREEN 3: PERSONALIZATION ONBOARDING                        */}
          {/* ============================================================ */}
          {step === 3 && (
            <motion.div
              key="step-3"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="space-y-4 flex flex-col justify-between flex-1"
            >
              <div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-sky-400 uppercase tracking-wider">
                  <span>Personalize</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-0.5">
                  What matters most to you?
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Select one or more to personalize your daily recommendations.
                </p>
              </div>

              {/* Friendly Visual Interest Options */}
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-white/10">
                {PERSONA_PROFILES.map((profile) => {
                  const isSelected = selectedPersonas.includes(profile.id);
                  return (
                    <div
                      key={profile.id}
                      onClick={() => onTogglePersona(profile.id)}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 min-h-[50px] touch-manipulation active:scale-[0.99] select-none ${
                        isSelected
                          ? 'bg-sky-500/15 border-sky-400/40 text-white shadow-sm'
                          : 'bg-white/[0.03] hover:bg-white/[0.06] border-white/[0.06] text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`p-2 rounded-xl text-sky-400 shrink-0 ${isSelected ? 'bg-sky-400/20' : 'bg-white/[0.05]'}`}>
                          <PersonaIcon personaId={profile.id} className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-xs sm:text-sm font-bold text-white truncate">
                            {profile.name}
                          </h4>
                          <p className="text-[11px] text-slate-400 truncate">{profile.tagline}</p>
                        </div>
                      </div>

                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center border transition-all shrink-0 ${
                          isSelected
                            ? 'bg-sky-400 border-sky-400 text-slate-950'
                            : 'border-slate-600 bg-transparent'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Action Buttons */}
              <div className="pt-3 flex items-center justify-between border-t border-white/[0.08] gap-2">
                <button
                  onClick={handleSkipPersonalization}
                  className="px-3 py-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer min-h-[44px] flex items-center"
                >
                  Skip for now
                </button>

                <button
                  id="onboarding-finish-btn"
                  onClick={onComplete}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-sky-400 hover:bg-sky-300 text-slate-950 font-bold text-xs sm:text-sm shadow-lg shadow-sky-500/25 active:scale-95 transition-all cursor-pointer min-h-[44px] touch-manipulation"
                >
                  <span>Continue</span>
                  <Check className="w-4 h-4 stroke-[2.5]" />
                </button>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
