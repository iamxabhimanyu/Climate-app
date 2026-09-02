import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Bell, AlertTriangle, AlertCircle, Info, Sparkles, Check, Layers, Play, Clock } from 'lucide-react';
import { SmartAlert } from '../types';
import { AlertEvent } from '../utils/dataStructures';

interface AlertCenterModalProps {
  isOpen: boolean;
  alerts: SmartAlert[];
  pendingEvents?: AlertEvent[];
  processedEvents?: AlertEvent[];
  onProcessNextEvent?: () => void;
  onSimulateEvent?: (type: 'wind_gust' | 'aqi_spike' | 'rain_surge') => void;
  onDismissAlert: (id: string) => void;
  onAskAIAboutAlert: (alertTitle: string) => void;
  onClose: () => void;
}

export const AlertCenterModal: React.FC<AlertCenterModalProps> = ({
  isOpen,
  alerts,
  pendingEvents = [],
  processedEvents = [],
  onProcessNextEvent,
  onSimulateEvent,
  onDismissAlert,
  onAskAIAboutAlert,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'alerts' | 'queue'>('alerts');

  if (!isOpen) return null;

  const getSeverityBadge = (severity: SmartAlert['severity']) => {
    switch (severity) {
      case 'severe':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1">
            <AlertCircle className="w-3 h-3 text-rose-400" />
            Severe Alert
          </span>
        );
      case 'caution':
      case 'moderate':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3 text-amber-400" />
            Caution
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[rgba(96,165,250,0.2)] text-[#60A5FA] border border-[rgba(96,165,250,0.3)] flex items-center gap-1">
            <Info className="w-3 h-3 text-[#60A5FA]" />
            Advisory
          </span>
        );
    }
  };

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
              <div className="p-2 rounded-2xl bg-rose-500/20 text-rose-300 border border-rose-500/30 shrink-0">
                <Bell className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-base font-bold text-white truncate">Weather Alert Center</h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 shrink-0">
                    {alerts.length} Active
                  </span>
                </div>
                <p className="text-xs text-slate-400 truncate">Contextual alerts & real-time FIFO event queue</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="min-w-[40px] min-h-[40px] rounded-full bg-white/[0.05] hover:bg-white/[0.1] text-slate-400 hover:text-white transition-colors flex items-center justify-center cursor-pointer touch-manipulation active:scale-95 shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Sub-Tabs: Active Alerts vs Event Queue */}
          <div className="flex items-center gap-2 mt-3 p-1 rounded-2xl bg-white/[0.04] border border-white/[0.06]">
            <button
              onClick={() => setActiveTab('alerts')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'alerts'
                  ? 'bg-sky-500/20 text-sky-300 border border-sky-400/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Bell className="w-3.5 h-3.5" />
              <span>Active Alerts ({alerts.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('queue')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'queue'
                  ? 'bg-sky-500/20 text-sky-300 border border-sky-400/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Event Queue (FIFO)</span>
              {pendingEvents.length > 0 && (
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
              )}
            </button>
          </div>

          {/* TAB 1: ACTIVE ALERTS */}
          {activeTab === 'alerts' && (
            <div className="overflow-y-auto py-3 space-y-3 flex-1 pr-0.5 scrollbar-thin scrollbar-thumb-white/10">
              {alerts.length === 0 ? (
                <div className="py-12 text-center text-slate-400 flex flex-col items-center">
                  <Check className="w-8 h-8 text-emerald-400 mb-2" />
                  <p className="text-sm font-semibold text-slate-200">All clear!</p>
                  <p className="text-xs text-slate-500 mt-0.5">No hazardous weather or environmental alerts in your area.</p>
                </div>
              ) : (
                alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`p-3.5 sm:p-4 rounded-2xl border transition-all ${
                      alert.severity === 'severe'
                        ? 'bg-rose-950/20 border-rose-500/30 shadow-lg shadow-rose-950/40'
                        : alert.severity === 'moderate' || alert.severity === 'caution'
                        ? 'bg-amber-950/20 border-amber-500/30'
                        : 'bg-white/[0.03] border-white/[0.06]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5 flex-wrap">
                      {getSeverityBadge(alert.severity)}
                      <span className="text-[10px] text-slate-400">{alert.time || alert.timestamp || 'Active'}</span>
                    </div>

                    <h4 className="text-sm font-bold text-white mb-1">{alert.title}</h4>
                    <p className="text-xs text-slate-300 leading-relaxed mb-3">{alert.message || alert.description}</p>

                    <div className="p-2.5 rounded-xl bg-black/40 border border-white/[0.06] text-xs text-sky-200 mb-3 leading-relaxed">
                      <strong className="text-[#60A5FA]">Action:</strong> {alert.recommendation || alert.actionRecommended}
                    </div>

                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <button
                        onClick={() => {
                          onAskAIAboutAlert(alert.title);
                          onClose();
                        }}
                        className="flex items-center gap-1.5 text-xs font-semibold text-[#60A5FA] hover:text-blue-300 min-h-[36px] py-1 touch-manipulation cursor-pointer active:scale-95"
                      >
                        <Sparkles className="w-3.5 h-3.5 shrink-0" />
                        <span>Ask AI Safety Advice</span>
                      </button>

                      <button
                        onClick={() => onDismissAlert(alert.id)}
                        className="text-[11px] text-slate-400 hover:text-slate-200 px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] min-h-[36px] flex items-center justify-center touch-manipulation cursor-pointer active:scale-95"
                      >
                        Dismiss
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 2: FIFO EVENT QUEUE INSPECTION & TELEMETRY STREAM */}
          {activeTab === 'queue' && (
            <div className="overflow-y-auto py-3 space-y-3 flex-1 pr-0.5 scrollbar-thin scrollbar-thumb-white/10">
              <div className="p-3.5 rounded-2xl bg-sky-500/10 border border-sky-400/20 text-xs text-slate-300 space-y-1.5">
                <div className="flex items-center justify-between font-bold text-sky-300">
                  <span className="flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-sky-400" />
                    <span>Real-time FIFO Queue Pipeline</span>
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-sky-500/20 text-[10px]">
                    {pendingEvents.length} Pending In Queue
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Meteorological anomalies and environmental threshold breaches are enqueued in strict FIFO order and dispatched sequentially to prevent alert fatigue.
                </p>
              </div>

              {/* Simulation Controls */}
              {onSimulateEvent && (
                <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.06] space-y-2">
                  <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">
                    Simulate Incoming Anomaly (Enqueue):
                  </span>
                  <div className="grid grid-cols-3 gap-1.5">
                    <button
                      onClick={() => onSimulateEvent('wind_gust')}
                      className="p-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-[10px] font-semibold text-slate-200 text-center transition-all cursor-pointer"
                    >
                      💨 Wind Gust
                    </button>
                    <button
                      onClick={() => onSimulateEvent('aqi_spike')}
                      className="p-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-[10px] font-semibold text-slate-200 text-center transition-all cursor-pointer"
                    >
                      🌫️ AQI Spike
                    </button>
                    <button
                      onClick={() => onSimulateEvent('rain_surge')}
                      className="p-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-[10px] font-semibold text-slate-200 text-center transition-all cursor-pointer"
                    >
                      ⛈️ Rain Surge
                    </button>
                  </div>
                </div>
              )}

              {/* Queue Process Action */}
              {pendingEvents.length > 0 && onProcessNextEvent && (
                <button
                  onClick={onProcessNextEvent}
                  className="w-full py-2.5 px-4 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg cursor-pointer transition-all active:scale-[0.98]"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Process Next Event (Dequeue FIFO)</span>
                </button>
              )}

              {/* Pending Queue Items */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Queue Buffer ({pendingEvents.length}):
                </span>
                {pendingEvents.length === 0 ? (
                  <p className="text-xs text-slate-500 italic p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                    Queue is currently empty. All anomaly events processed.
                  </p>
                ) : (
                  pendingEvents.map((evt, idx) => (
                    <div
                      key={evt.id}
                      className="p-3 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-between gap-2"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="w-5 h-5 rounded-full bg-sky-500/20 text-sky-300 text-[10px] font-bold flex items-center justify-center shrink-0">
                          #{idx + 1}
                        </span>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-white truncate">{evt.title}</p>
                          <p className="text-[11px] text-slate-400 truncate">{evt.message}</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 shrink-0">
                        Queued
                      </span>
                    </div>
                  ))
                )}
              </div>

              {/* Processed Events Log */}
              {processedEvents.length > 0 && (
                <div className="space-y-2 pt-2">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>Processed Telemetry Log ({processedEvents.length}):</span>
                  </span>
                  <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                    {processedEvents.map((pEvt) => (
                      <div
                        key={pEvt.id}
                        className="p-2.5 rounded-xl bg-emerald-500/[0.06] border border-emerald-500/15 flex items-center justify-between text-xs"
                      >
                        <span className="text-slate-200 font-medium truncate">{pEvt.title}</span>
                        <span className="text-[10px] text-emerald-400 font-bold shrink-0">✓ Dispatched</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="pt-3 border-t border-white/[0.08] flex justify-end">
            <button
              onClick={onClose}
              className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-white/[0.08] hover:bg-white/[0.12] text-white font-semibold text-xs transition-all active:scale-95 cursor-pointer touch-manipulation min-h-[44px] flex items-center justify-center"
            >
              Close Alerts
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};


