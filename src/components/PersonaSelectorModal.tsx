import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sparkles } from 'lucide-react';
import { PersonaId } from '../types';
import { PERSONA_PROFILES } from '../data/weatherData';
import { PersonaIcon } from '../utils/weatherIcons';

interface PersonaSelectorModalProps {
  isOpen: boolean;
  selectedPersonas: PersonaId[];
  activePersona: PersonaId;
  onTogglePersona: (id: PersonaId) => void;
  onSetActivePersona: (id: PersonaId) => void;
  onClose: () => void;
}

export const PersonaSelectorModal: React.FC<PersonaSelectorModalProps> = ({
  isOpen,
  selectedPersonas,
  activePersona,
  onTogglePersona,
  onSetActivePersona,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          className="w-full max-w-lg rounded-t-[28px] sm:rounded-[28px] bg-[#05070A] border border-white/[0.1] p-4 sm:p-5 shadow-2xl overflow-hidden max-h-[88vh] flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between gap-3 pb-3 border-b border-white/[0.08]">
            <div className="flex items-center gap-2 min-w-0">
              <Sparkles className="w-5 h-5 text-[#60A5FA] shrink-0" />
              <div className="min-w-0">
                <h3 className="text-base font-bold text-white truncate">Select Your Personas</h3>
                <p className="text-xs text-slate-400 truncate">Choose roles to tailor recommendations</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="min-w-[40px] min-h-[40px] rounded-full bg-white/[0.05] hover:bg-white/[0.1] text-slate-400 hover:text-white transition-colors flex items-center justify-center cursor-pointer touch-manipulation active:scale-95"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Persona List */}
          <div className="overflow-y-auto py-3 space-y-2.5 flex-1 pr-0.5 scrollbar-thin scrollbar-thumb-white/10">
            {PERSONA_PROFILES.map((profile) => {
              const isSelected = selectedPersonas.includes(profile.id);
              const isPrimary = activePersona === profile.id;

              return (
                <div
                  key={profile.id}
                  className={`p-3 sm:p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-2.5 ${
                    isPrimary
                      ? 'bg-[rgba(96,165,250,0.15)] border-[rgba(96,165,250,0.4)] shadow-sm'
                      : isSelected
                      ? 'bg-white/[0.04] border-white/[0.1]'
                      : 'bg-white/[0.02] border-white/[0.04] opacity-75 hover:opacity-100'
                  }`}
                >
                  <div className="flex items-center gap-2.5 sm:gap-3 flex-1 min-w-0">
                    <div className="p-2 sm:p-2.5 rounded-xl bg-[rgba(96,165,250,0.1)] border border-[rgba(96,165,250,0.2)] text-[#60A5FA] shrink-0">
                      <PersonaIcon personaId={profile.id} className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h4 className="text-xs sm:text-sm font-bold text-white truncate">
                          {profile.name}
                        </h4>
                        {isPrimary && (
                          <span className="px-1.5 py-0.2 text-[8px] sm:text-[9px] font-extrabold uppercase rounded-full bg-[#60A5FA] text-slate-950">
                            Active
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5 leading-snug truncate">
                        {profile.tagline}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5 shrink-0">
                    <button
                      onClick={() => onSetActivePersona(profile.id)}
                      className={`px-3 py-1.5 rounded-xl text-[11px] font-semibold transition-all min-h-[36px] flex items-center justify-center touch-manipulation cursor-pointer active:scale-95 ${
                        isPrimary
                          ? 'bg-[#60A5FA] text-slate-950 shadow-sm'
                          : 'bg-white/[0.05] hover:bg-white/[0.1] text-slate-300'
                      }`}
                    >
                      {isPrimary ? 'Active' : 'Make Active'}
                    </button>

                    <button
                      onClick={() => onTogglePersona(profile.id)}
                      className={`px-2 py-1 rounded-xl text-[10px] font-medium transition-all touch-manipulation cursor-pointer ${
                        isSelected
                          ? 'text-[#60A5FA] hover:text-rose-400'
                          : 'text-slate-500 hover:text-slate-300'
                      }`}
                    >
                      {isSelected ? 'Included' : '+ Include'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div className="pt-3 border-t border-white/[0.08] flex justify-end">
            <button
              onClick={onClose}
              className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-[#60A5FA] hover:bg-blue-400 text-slate-950 font-bold text-xs shadow-lg transition-all active:scale-95 cursor-pointer touch-manipulation min-h-[44px] flex items-center justify-center"
            >
              Done & Save Preferences
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

