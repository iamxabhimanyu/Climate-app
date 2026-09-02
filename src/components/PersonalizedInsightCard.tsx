import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Info,
  Check,
  Luggage,
  Activity,
  HelpCircle,
  ShieldAlert,
} from 'lucide-react';
import { FitnessActivityType, PersonalizedInsight, PersonaId, WeatherData } from '../types';
import { PERSONA_PROFILES } from '../data/weatherData';
import { PersonaIcon } from '../utils/weatherIcons';
import { calculatePersonalizedInsight } from '../utils/weatherEngine';

interface PersonalizedInsightCardProps {
  insight: PersonalizedInsight;
  weatherData: WeatherData;
  selectedPersonas?: PersonaId[];
  onAskAI: (prompt: string) => void;
  onSwitchPersona: () => void;
  onSelectPersonaId?: (id: PersonaId) => void;
}

export const PersonalizedInsightCard: React.FC<PersonalizedInsightCardProps> = ({
  insight: initialInsight,
  weatherData,
  selectedPersonas = [],
  onAskAI,
  onSwitchPersona,
  onSelectPersonaId,
}) => {
  const [selectedFitnessActivity, setSelectedFitnessActivity] = useState<FitnessActivityType>('running');
  const [showExplainability, setShowExplainability] = useState<boolean>(false);
  const [checkedPackingItems, setCheckedPackingItems] = useState<Record<string, boolean>>({
    'p-1': true,
    'p-5': true,
  });

  // Recalculate if fitness
  const insight =
    initialInsight.personaId === 'fitness'
      ? calculatePersonalizedInsight('fitness', weatherData, selectedFitnessActivity)
      : initialInsight;

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-300 border-emerald-400/40 bg-emerald-500/15';
    if (score >= 60) return 'text-amber-300 border-amber-400/40 bg-amber-500/15';
    return 'text-rose-300 border-rose-400/40 bg-rose-500/15';
  };

  const getStatusBadgeElement = () => {
    const badge =
      insight.statusBadge ||
      (insight.score >= 75
        ? 'GOOD TO GO'
        : insight.score >= 55
        ? 'CAUTION'
        : insight.score >= 35
        ? 'NOT IDEAL'
        : 'HIGH RISK');

    if (badge === 'GOOD TO GO') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          GOOD TO GO
        </span>
      );
    }
    if (badge === 'CAUTION') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-amber-500/20 text-amber-300 border border-amber-400/40 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-amber-400" />
          CAUTION
        </span>
      );
    }
    if (badge === 'NOT IDEAL') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-orange-500/20 text-orange-300 border border-orange-400/40 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-orange-400" />
          NOT IDEAL
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-rose-500/20 text-rose-300 border border-rose-400/40 shadow-sm">
        <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping" />
        HIGH RISK
      </span>
    );
  };

  const getActionIcon = () => {
    switch (insight.actionType) {
      case 'positive':
        return <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />;
      case 'caution':
        return <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />;
      case 'alert':
      case 'warning':
        return <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />;
      default:
        return <Info className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />;
    }
  };

  const generateDefaultPrompt = () => {
    switch (insight.personaId) {
      case 'fitness':
        return `Can I go ${selectedFitnessActivity} at ${insight.primaryWindow || '6 PM'} today based on this weather?`;
      case 'commuter':
        return `What is the best commute departure window today to avoid rain and delays?`;
      case 'traveler':
        return `What clothes and essentials should I pack for ${weatherData.locationName}?`;
      case 'health':
        return `Is it safe for sensitive individuals to exercise outdoors given today's AQI ${weatherData.environment.aqi}?`;
      case 'agriculture':
        return `Should I delay farm irrigation today based on expected rainfall in ${weatherData.locationName}?`;
      case 'beach':
        return `Are beach, wave, and rip current conditions safe for swimming this afternoon?`;
      case 'family':
        return `What precautions should we take for school pickup and afternoon outdoor play?`;
      default:
        return `What are your recommendations for today's weather?`;
    }
  };

  const togglePackingItem = (id: string) => {
    setCheckedPackingItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Filter profiles to user's selected interests, or show all if none selected
  const activeProfiles =
    selectedPersonas.length > 0
      ? PERSONA_PROFILES.filter((p) => selectedPersonas.includes(p.id))
      : PERSONA_PROFILES;

  return (
    <motion.section
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className="relative overflow-hidden rounded-3xl p-5 bg-gradient-to-br from-sky-500/15 via-white/[0.05] to-indigo-950/20 border border-sky-400/30 backdrop-blur-2xl shadow-xl space-y-4 select-none text-left"
    >
      {/* Ambient subtle light glow */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-56 h-56 bg-sky-400/15 rounded-full blur-3xl pointer-events-none" />

      {/* Header: "Your Day" */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-sky-300">
            <div className="p-1.5 rounded-xl bg-sky-500/20 border border-sky-400/30">
              <PersonaIcon personaId={insight.personaId} className="w-4 h-4 text-sky-300" />
            </div>
            <span>Your Day · Weather Intelligence</span>
          </div>

          <button
            onClick={onSwitchPersona}
            className="text-[11px] font-semibold text-sky-300 hover:text-white transition-colors shrink-0 px-3 py-1 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.1] cursor-pointer"
          >
            Manage Interests
          </button>
        </div>

        {/* Quick Horizontal Persona Switch Tabs */}
        {onSelectPersonaId && activeProfiles.length > 1 && (
          <div className="flex gap-1.5 overflow-x-auto pb-1 pt-0.5 scrollbar-none overscroll-x-contain -mx-1 px-1">
            {activeProfiles.map((p) => {
              const isSelected = p.id === insight.personaId;
              return (
                <button
                  key={p.id}
                  onClick={() => onSelectPersonaId(p.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold shrink-0 min-h-[38px] transition-all cursor-pointer touch-manipulation select-none active:scale-95 ${
                    isSelected
                      ? 'bg-sky-400 text-slate-950 font-bold shadow-md shadow-sky-500/30'
                      : 'bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 border border-white/[0.06]'
                  }`}
                >
                  <PersonaIcon personaId={p.id} className="w-3.5 h-3.5" />
                  <span>{p.shortName}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* OUTDOOR FITNESS SUB-ACTIVITY SELECTOR */}
      {insight.personaId === 'fitness' && (
        <div className="p-2.5 rounded-2xl bg-white/[0.04] border border-white/[0.08]">
          <div className="text-[10px] uppercase font-bold text-slate-400 px-1 mb-1.5 tracking-wider flex items-center gap-1">
            <Activity className="w-3 h-3 text-emerald-400" />
            <span>Target Activity</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
            {[
              { id: 'running', label: '🏃 Running' },
              { id: 'walking', label: '🚶 Walking' },
              { id: 'cycling', label: '🚴 Cycling' },
              { id: 'workout', label: '🏋️ Workout' },
            ].map((act) => {
              const isActActive = selectedFitnessActivity === act.id;
              return (
                <button
                  key={act.id}
                  onClick={() => setSelectedFitnessActivity(act.id as FitnessActivityType)}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all text-center min-h-[40px] flex items-center justify-center cursor-pointer touch-manipulation select-none active:scale-95 ${
                    isActActive
                      ? 'bg-emerald-400 text-slate-950 shadow-md font-bold'
                      : 'bg-white/[0.03] hover:bg-white/[0.08] text-slate-300 border border-white/[0.05]'
                  }`}
                >
                  {act.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Decision Highlight */}
      <div className="flex items-start justify-between gap-3 flex-wrap sm:flex-nowrap">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h2 className="text-sm sm:text-base font-bold text-white tracking-tight leading-snug">
              {insight.title}
            </h2>
            {getStatusBadgeElement()}
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-sky-200 mt-0.5 font-['Outfit'] tracking-tight">
            {insight.highlightText}
          </div>
        </div>

        {/* Score Badge */}
        <div className={`px-3 py-1.5 rounded-2xl border ${getScoreColor(insight.score)} shrink-0 text-center shadow-lg`}>
          <div className="text-base sm:text-lg font-extrabold font-['Outfit'] leading-none">
            {insight.score}/100
          </div>
          <div className="text-[9px] uppercase font-bold tracking-wider opacity-90 mt-0.5">
            {insight.scoreLabel}
          </div>
        </div>
      </div>

      {/* Clear Recommendation Callout */}
      <div className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-sky-500/10 border border-sky-400/25">
        {getActionIcon()}
        <div className="flex-1">
          <p className="text-xs sm:text-sm font-medium text-slate-100 leading-relaxed">
            {insight.recommendation}
          </p>
        </div>
      </div>

      {/* "Why this recommendation?" Progressive Expander */}
      {insight.explainabilityFactors && insight.explainabilityFactors.length > 0 && (
        <div className="rounded-2xl bg-black/20 border border-white/[0.07] p-3 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300">
              <HelpCircle className="w-3.5 h-3.5 text-sky-400" />
              <span>Why this recommendation?</span>
            </div>
            <button
              onClick={() => setShowExplainability(!showExplainability)}
              className="text-[11px] text-sky-300 hover:text-white font-medium transition-colors cursor-pointer"
            >
              {showExplainability ? 'Hide details' : 'Show details'}
            </button>
          </div>

          <AnimatePresence>
            {showExplainability && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-1.5 pt-1"
              >
                {insight.explainabilityFactors.map((factor, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between text-xs py-1 px-2 rounded-xl bg-white/[0.02] border border-white/[0.03]"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      {factor.status === 'good' ? (
                        <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center text-[10px] font-extrabold shrink-0">
                          ✓
                        </span>
                      ) : factor.status === 'caution' ? (
                        <span className="w-4 h-4 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center text-[10px] font-extrabold shrink-0">
                          ⚠️
                        </span>
                      ) : (
                        <span className="w-4 h-4 rounded-full bg-rose-500/20 text-rose-300 flex items-center justify-center text-[10px] font-extrabold shrink-0">
                          ✕
                        </span>
                      )}
                      <span className="text-slate-200 font-medium truncate">{factor.factor}</span>
                    </div>
                    <span className="text-[11px] text-slate-400 shrink-0 ml-2 font-mono">{factor.detail}</span>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* TRAVELER: PACKING CHECKLIST */}
      {insight.personaId === 'traveler' && insight.packingList && (
        <div className="rounded-2xl bg-white/[0.03] border border-white/[0.08] p-3.5 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-white">
              <Luggage className="w-4 h-4 text-sky-400" />
              <span>Packing Checklist ({weatherData.locationName})</span>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-400/30">
              Weather-Tailored
            </span>
          </div>

          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-white/10">
            {insight.packingList.map((item) => {
              const isChecked = checkedPackingItems[item.id] ?? item.checked;
              return (
                <div
                  key={item.id}
                  onClick={() => togglePackingItem(item.id)}
                  className={`p-2.5 rounded-xl border transition-all flex items-start gap-2.5 cursor-pointer min-h-[44px] touch-manipulation select-none active:scale-98 ${
                    isChecked
                      ? 'bg-sky-500/15 border-sky-400/35 text-white'
                      : 'bg-white/[0.03] border-white/[0.05] text-slate-300 hover:bg-white/[0.06]'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-lg border flex items-center justify-center shrink-0 mt-0.5 ${
                      isChecked
                        ? 'bg-sky-400 border-sky-400 text-slate-950'
                        : 'border-white/30'
                    }`}
                  >
                    {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className={`text-xs font-semibold ${isChecked ? 'text-sky-200' : 'text-slate-200'}`}>
                        {item.item}
                      </span>
                      {item.essential && (
                        <span className="text-[9px] font-bold uppercase px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300">
                          Essential
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-400 mt-0.5">{item.weatherReason}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ASK WEATHER AI CTA */}
      <button
        id="ask-ai-from-insight-btn"
        onClick={() => onAskAI(generateDefaultPrompt())}
        className="w-full flex items-center justify-between gap-2 px-4 py-3 rounded-2xl bg-white/[0.06] hover:bg-white/[0.12] active:scale-[0.98] border border-white/[0.1] text-slate-100 text-xs sm:text-sm font-semibold transition-all shadow-md group cursor-pointer min-h-[48px] touch-manipulation select-none"
      >
        <span className="flex items-center gap-2 min-w-0">
          <Sparkles className="w-4 h-4 text-sky-400 group-hover:rotate-12 transition-transform shrink-0" />
          <span className="text-slate-200 truncate text-left">
            Ask AI: <span className="text-sky-300 font-normal">"{generateDefaultPrompt()}"</span>
          </span>
        </span>
        <ArrowRight className="w-4 h-4 text-sky-400 group-hover:translate-x-1 transition-transform shrink-0" />
      </button>
    </motion.section>
  );
};
