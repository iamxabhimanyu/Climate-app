import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Share2,
  Copy,
  Check,
  Radio,
  StopCircle,
  Play,
  MapPin,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  Navigation,
  Globe,
  Clock,
} from 'lucide-react';
import { WeatherData, UserLocationState } from '../types';
import { executeLocationShare, generateShareMessage } from '../utils/locationManager';
import { WeatherIcon } from '../utils/weatherIcons';

interface LocationSharingModalProps {
  isOpen: boolean;
  weatherData: WeatherData;
  userLocation: UserLocationState;
  onToggleLiveSharing: () => void;
  onClose: () => void;
}

export const LocationSharingModal: React.FC<LocationSharingModalProps> = ({
  isOpen,
  weatherData,
  userLocation,
  onToggleLiveSharing,
  onClose,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedText, setCopiedText] = useState(false);
  const [previewTab, setPreviewTab] = useState<'share' | 'preview'>('share');

  if (!isOpen) return null;

  const lat = weatherData.coordinates?.latitude || userLocation.latitude || 19.8762;
  const lon = weatherData.coordinates?.longitude || userLocation.longitude || 75.3433;
  const liveShareUrl = `${window.location.origin}/?lat=${lat.toFixed(4)}&lon=${lon.toFixed(
    4
  )}&loc=${encodeURIComponent(weatherData.locationName)}&live=true`;

  const shareText = generateShareMessage(
    weatherData.locationName,
    weatherData,
    lat,
    lon,
    liveShareUrl
  );

  const handleNativeShare = async () => {
    const res = await executeLocationShare(weatherData.locationName, weatherData, lat, lon, liveShareUrl);
    if (res.method === 'clipboard') {
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 2000);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(liveShareUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyFormattedText = () => {
    navigator.clipboard.writeText(shareText);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          className="w-full max-w-lg rounded-t-[28px] sm:rounded-[28px] bg-[#05070A] border border-white/[0.1] p-4 sm:p-5 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col space-y-4"
        >
          {/* Modal Header */}
          <div className="flex items-center justify-between gap-3 pb-3 border-b border-white/[0.08]">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="p-2 rounded-2xl bg-[rgba(96,165,250,0.15)] text-[#60A5FA] border border-[rgba(96,165,250,0.3)] shrink-0">
                <Share2 className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h3 className="text-base font-bold text-white truncate">
                  Live Location & Sharing Center
                </h3>
                <p className="text-xs text-slate-400 truncate">
                  Smart environmental location broadcasting
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

          {/* Sub Navigation / Mode Selector */}
          <div className="flex bg-white/[0.03] p-1 rounded-2xl border border-white/[0.06] text-xs">
            <button
              onClick={() => setPreviewTab('share')}
              className={`flex-1 py-2 rounded-xl font-bold transition-all cursor-pointer min-h-[40px] touch-manipulation select-none active:scale-95 flex items-center justify-center gap-1.5 ${
                previewTab === 'share'
                  ? 'bg-gradient-to-r from-[#60A5FA] to-blue-600 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share Location</span>
            </button>

            <button
              onClick={() => setPreviewTab('preview')}
              className={`flex-1 py-2 rounded-xl font-bold transition-all cursor-pointer min-h-[40px] touch-manipulation select-none active:scale-95 flex items-center justify-center gap-1.5 ${
                previewTab === 'preview'
                  ? 'bg-gradient-to-r from-[#60A5FA] to-blue-600 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Shared Link Preview</span>
            </button>
          </div>

          {/* TAB 1: SHARE CONTROLS & LIVE SHARING TOGGLE */}
          {previewTab === 'share' && (
            <div className="space-y-3.5 overflow-y-auto pr-0.5 scrollbar-thin scrollbar-thumb-white/10">
              {/* 1. Live Sharing Mode Switch Card */}
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`p-2.5 rounded-2xl border ${
                        userLocation.isLiveSharingActive
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 animate-pulse'
                          : 'bg-white/[0.04] text-slate-400 border-white/[0.08]'
                      }`}
                    >
                      <Radio className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs sm:text-sm font-bold text-white">
                          Live Location Sharing Mode
                        </span>
                        {userLocation.isLiveSharingActive ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            🟢 Active
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-500/20 text-slate-400 border border-slate-500/30">
                            🔴 Off
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {userLocation.isLiveSharingActive
                          ? 'Real-time GPS updates actively broadcasted'
                          : 'Turn ON to enable continuous live link streaming'}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={onToggleLiveSharing}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer min-h-[44px] touch-manipulation active:scale-95 shadow-md ${
                      userLocation.isLiveSharingActive
                        ? 'bg-rose-600 hover:bg-rose-500 text-white'
                        : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                    }`}
                  >
                    {userLocation.isLiveSharingActive ? (
                      <>
                        <StopCircle className="w-4 h-4" />
                        <span>Stop</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4" />
                        <span>Start</span>
                      </>
                    )}
                  </button>
                </div>

                {userLocation.isLiveSharingActive && (
                  <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-xs text-emerald-200 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                      <span>Live broadcasting active</span>
                    </div>
                    <span className="text-[11px] opacity-75">Last updated: Just now</span>
                  </div>
                )}
              </div>

              {/* 2. One-Tap Share Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  onClick={handleNativeShare}
                  className="flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-gradient-to-r from-[#60A5FA] to-blue-600 hover:brightness-110 active:scale-95 text-slate-950 font-bold text-xs transition-all cursor-pointer min-h-[48px] touch-manipulation shadow-md"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Share Location & Weather</span>
                </button>

                <button
                  onClick={handleCopyLink}
                  className="flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-white/[0.06] hover:bg-white/[0.1] active:scale-95 text-white font-bold text-xs border border-white/[0.1] transition-all cursor-pointer min-h-[48px] touch-manipulation"
                >
                  {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-[#60A5FA]" />}
                  <span>{copiedLink ? 'Link Copied!' : 'Copy Share Link'}</span>
                </button>
              </div>

              {/* 3. Formatted Message Preview Card */}
              <div className="p-3.5 rounded-2xl bg-black/40 border border-white/[0.08] space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="font-semibold text-slate-300">Formatted Share Message</span>
                  <button
                    onClick={handleCopyFormattedText}
                    className="flex items-center gap-1 text-[11px] text-[#60A5FA] hover:text-white transition-colors cursor-pointer"
                  >
                    {copiedText ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedText ? 'Copied' : 'Copy Text'}</span>
                  </button>
                </div>

                <pre className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] text-[11px] font-mono text-slate-300 whitespace-pre-wrap leading-relaxed">
                  {shareText}
                </pre>
              </div>

              {/* Privacy Footer Note */}
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] flex items-center gap-2 text-[11px] text-slate-400">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  Location sharing requires your explicit permission. You can stop sharing at any moment.
                </span>
              </div>
            </div>
          )}

          {/* TAB 2: SHARED LINK PREVIEW (RECEIVER EXPERIENCE) */}
          {previewTab === 'preview' && (
            <div className="space-y-3.5 overflow-y-auto pr-0.5 scrollbar-thin scrollbar-thumb-white/10">
              <div className="p-2 rounded-xl bg-sky-500/10 border border-sky-400/20 text-xs text-sky-200 text-center">
                👁️ This is what people see when you share your ClimaIQ link:
              </div>

              {/* Shared Live Card Mockup */}
              <div className="p-5 rounded-[24px] bg-gradient-to-br from-slate-900 to-[#0b1220] border border-sky-500/30 shadow-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                      Live Shared Location
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-slate-400">
                    <Clock className="w-3 h-3" />
                    <span>Updated just now</span>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-[#60A5FA]" />
                      <h4 className="text-lg sm:text-xl font-extrabold text-white">
                        {weatherData.locationName}
                      </h4>
                    </div>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">
                      {lat.toFixed(4)}°N, {lon.toFixed(4)}°E
                    </p>
                  </div>

                  <div className="text-right">
                    <div className="text-3xl font-extrabold text-white font-['Outfit']">
                      {weatherData.currentTemp}°C
                    </div>
                    <span className="text-xs text-[#60A5FA] font-medium">
                      {weatherData.conditionText}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/[0.08] text-center">
                  <div className="p-2 rounded-xl bg-white/[0.04]">
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">Air Quality</div>
                    <div className="text-sm font-bold text-white mt-0.5">AQI {weatherData.environment.aqi}</div>
                  </div>
                  <div className="p-2 rounded-xl bg-white/[0.04]">
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">UV Index</div>
                    <div className="text-sm font-bold text-white mt-0.5">Index {weatherData.environment.uvIndex}</div>
                  </div>
                  <div className="p-2 rounded-xl bg-white/[0.04]">
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">Wind</div>
                    <div className="text-sm font-bold text-white mt-0.5">{weatherData.environment.windSpeed} km/h</div>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-xs text-slate-300 leading-relaxed">
                  💡 <strong>Smart Advisory:</strong> {weatherData.summary}
                </div>
              </div>

              <button
                onClick={handleCopyLink}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#60A5FA] to-blue-600 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer active:scale-95 shadow-md"
              >
                {copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copiedLink ? 'Link Copied to Clipboard!' : 'Copy Receiver Preview Link'}</span>
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
