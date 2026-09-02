import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  MapPin,
  Navigation,
  Radio,
  Share2,
  Copy,
  Check,
  ShieldCheck,
  Eye,
  EyeOff,
  Sparkles,
  Layers,
  StopCircle,
  Play,
  RotateCw,
  Compass,
  AlertTriangle,
  RefreshCw,
  Maximize2,
} from 'lucide-react';
import L from 'leaflet';
import { WeatherData, UserLocationState } from '../types';
import { DEMO_LOCATION_PRESETS, DemoLocationPreset, executeLocationShare } from '../utils/locationManager';
import { WeatherIcon } from '../utils/weatherIcons';

interface LocationMapViewProps {
  weatherData: WeatherData;
  userLocation: UserLocationState;
  onDetectCurrentLocation: () => Promise<void>;
  onSelectPresetLocation: (preset: DemoLocationPreset) => void;
  onToggleLiveSharing: () => void;
  onAskAIAboutLocation: (locationName: string) => void;
}

export const LocationMapView: React.FC<LocationMapViewProps> = ({
  weatherData,
  userLocation,
  onDetectCurrentLocation,
  onSelectPresetLocation,
  onToggleLiveSharing,
  onAskAIAboutLocation,
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);

  const [isDetecting, setIsDetecting] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedMessage, setCopiedMessage] = useState(false);
  const [showCoordinates, setShowCoordinates] = useState(true);
  const [mapLayerType, setMapLayerType] = useState<'standard' | 'dark' | 'topo'>('standard');
  const [tileLoadError, setTileLoadError] = useState(false);

  // Active coordinates
  const activeLat = weatherData.coordinates?.latitude ?? userLocation.latitude ?? 19.8762;
  const activeLon = weatherData.coordinates?.longitude ?? userLocation.longitude ?? 75.3433;

  // Tile provider endpoints with reliable fallbacks
  const getTileConfig = (layer: 'standard' | 'dark' | 'topo') => {
    switch (layer) {
      case 'dark':
        return {
          url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
          attribution: '&copy; OpenStreetMap &copy; CARTO',
          subdomains: 'abcd',
          maxZoom: 19,
        };
      case 'topo':
        return {
          url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
          attribution: '&copy; OpenStreetMap &copy; OpenTopoMap',
          subdomains: 'abc',
          maxZoom: 17,
        };
      case 'standard':
      default:
        return {
          url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
          subdomains: 'abc',
          maxZoom: 19,
        };
    }
  };

  // Initialize and update Leaflet map safely
  const initMap = () => {
    if (!mapContainerRef.current) return;
    setMapError(null);
    setTileLoadError(false);

    try {
      // If container was previously initialized by Leaflet, clean it up
      if ((mapContainerRef.current as any)._leaflet_id && !mapInstanceRef.current) {
        delete (mapContainerRef.current as any)._leaflet_id;
      }

      if (!mapInstanceRef.current) {
        const map = L.map(mapContainerRef.current, {
          center: [activeLat, activeLon],
          zoom: 12,
          zoomControl: false,
          attributionControl: false,
        });

        // Add custom clean zoom control to top-right
        L.control.zoom({ position: 'topright' }).addTo(map);

        const config = getTileConfig(mapLayerType);
        const tileLayer = L.tileLayer(config.url, {
          maxZoom: config.maxZoom,
          subdomains: config.subdomains,
          attribution: config.attribution,
        });

        tileLayer.on('tileerror', () => {
          // If dark/topo fails, silently fall back to standard OpenStreetMap
          if (mapLayerType !== 'standard') {
            setMapLayerType('standard');
          }
        });

        tileLayer.addTo(map);
        tileLayerRef.current = tileLayer;
        mapInstanceRef.current = map;
      } else {
        mapInstanceRef.current.setView([activeLat, activeLon], mapInstanceRef.current.getZoom() || 12, {
          animate: true,
        });
      }

      // Render custom interactive location pin marker
      const isLive = userLocation.isLiveGPS || !!weatherData.coordinates?.isLiveGPS;
      const markerHtml = `
        <div class="relative flex items-center justify-center cursor-pointer select-none">
          <div class="absolute w-9 h-9 rounded-full ${
            isLive ? 'bg-sky-400/40 animate-ping' : 'bg-amber-400/30'
          }"></div>
          <div class="relative px-3 py-1.5 rounded-full ${
            isLive
              ? 'bg-gradient-to-r from-sky-500 to-blue-600 border border-sky-300'
              : 'bg-gradient-to-r from-blue-600 to-indigo-700 border border-blue-400'
          } text-white text-[11px] font-bold shadow-2xl flex items-center gap-1.5 whitespace-nowrap">
            <span class="text-xs">📍</span>
            <span>${weatherData.locationName.split(',')[0]} · ${weatherData.currentTemp}°C</span>
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        html: markerHtml,
        className: 'clima-map-marker',
        iconSize: [140, 36],
        iconAnchor: [70, 18],
      });

      if (markerRef.current) {
        markerRef.current.setLatLng([activeLat, activeLon]);
        markerRef.current.setIcon(customIcon);
      } else if (mapInstanceRef.current) {
        markerRef.current = L.marker([activeLat, activeLon], { icon: customIcon }).addTo(
          mapInstanceRef.current
        );
      }

      // Bind detailed weather popup
      if (markerRef.current) {
        markerRef.current.bindPopup(`
          <div style="font-family: system-ui, sans-serif; font-size: 12px; line-height: 1.4; color: #0f172a; padding: 2px;">
            <div style="font-weight: 700; font-size: 13px; color: #1e293b;">${weatherData.locationName}</div>
            <div style="color: #475569; margin-top: 2px;">Condition: <strong>${weatherData.conditionText}</strong> (${weatherData.currentTemp}°C)</div>
            <div style="color: #475569;">Air Quality: <strong>AQI ${weatherData.environment.aqi}</strong> (${weatherData.environment.aqiStatus})</div>
            <div style="color: #64748b; font-size: 10px; margin-top: 4px;">Lat: ${activeLat.toFixed(4)}°, Lon: ${activeLon.toFixed(4)}°</div>
          </div>
        `);
      }

      // Invalidate size smoothly after DOM layout
      setTimeout(() => {
        mapInstanceRef.current?.invalidateSize();
      }, 100);
    } catch (err: any) {
      console.warn('Map initialization note:', err);
      setMapError('Map unavailable. Please check Maps configuration.');
    }
  };

  // Watch layer type changes
  useEffect(() => {
    if (mapInstanceRef.current && tileLayerRef.current) {
      mapInstanceRef.current.removeLayer(tileLayerRef.current);
      const config = getTileConfig(mapLayerType);
      const newLayer = L.tileLayer(config.url, {
        maxZoom: config.maxZoom,
        subdomains: config.subdomains,
        attribution: config.attribution,
      }).addTo(mapInstanceRef.current);
      tileLayerRef.current = newLayer;
    }
  }, [mapLayerType]);

  // Main init effect
  useEffect(() => {
    initMap();

    // ResizeObserver to ensure container resize (e.g. mobile rotate, tab switch) updates map size
    let resizeObserver: ResizeObserver | null = null;
    if (mapContainerRef.current) {
      resizeObserver = new ResizeObserver(() => {
        mapInstanceRef.current?.invalidateSize();
      });
      resizeObserver.observe(mapContainerRef.current);
    }

    return () => {
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
    };
  }, [activeLat, activeLon, weatherData.locationName, weatherData.currentTemp, userLocation.isLiveGPS]);

  // Clean up Leaflet map instance on component unmount
  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove();
        } catch {}
        mapInstanceRef.current = null;
        markerRef.current = null;
        tileLayerRef.current = null;
      }
    };
  }, []);

  const handleRecenter = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([activeLat, activeLon], 13, { duration: 1 });
      markerRef.current?.openPopup();
    }
  };

  const handleDetectGPS = async () => {
    setIsDetecting(true);
    try {
      await onDetectCurrentLocation();
      setTimeout(handleRecenter, 300);
    } finally {
      setIsDetecting(false);
    }
  };

  const handleShareClick = async () => {
    const res = await executeLocationShare(
      weatherData.locationName,
      weatherData,
      activeLat,
      activeLon
    );
    if (res.method === 'clipboard') {
      setCopiedMessage(true);
      setTimeout(() => setCopiedMessage(false), 2500);
    }
  };

  const handleCopyShareLink = () => {
    const liveLink = `${window.location.origin}/?lat=${activeLat.toFixed(4)}&lon=${activeLon.toFixed(
      4
    )}&name=${encodeURIComponent(weatherData.locationName)}`;
    navigator.clipboard.writeText(liveLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="space-y-4 pb-20">
      {/* 1. Header & Live Status Card */}
      <div className="p-4 sm:p-5 rounded-[28px] bg-white/[0.04] border border-white/[0.08] backdrop-blur-xl shadow-2xl space-y-3.5">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-[rgba(96,165,250,0.15)] text-[#60A5FA] border border-[rgba(96,165,250,0.3)] shrink-0">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#60A5FA]">
                  Location Radar & Live Map
                </span>
                {userLocation.isLiveGPS ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    Live GPS Active
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                    Station Location
                  </span>
                )}
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white leading-tight">
                {weatherData.locationName}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDetectGPS}
              disabled={isDetecting}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#60A5FA] to-blue-600 text-slate-950 text-xs font-bold shadow-md hover:brightness-110 active:scale-95 transition-all cursor-pointer min-h-[44px] touch-manipulation"
            >
              <Navigation className={`w-3.5 h-3.5 ${isDetecting ? 'animate-spin' : ''}`} />
              <span>{isDetecting ? 'Detecting GPS...' : 'Use Current GPS'}</span>
            </button>
          </div>
        </div>

        {/* Location Status Subline */}
        <div className="flex items-center justify-between text-xs text-slate-400 pt-1 border-t border-white/[0.06] flex-wrap gap-2">
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-[#60A5FA]" />
            <span>
              {userLocation.isLiveGPS ? '📍 Using Current GPS Location' : '📍 Selected Location'} ·{' '}
              <strong className="text-slate-300">{weatherData.lastUpdated || 'Live Sync'}</strong>
            </span>
          </div>

          {showCoordinates && (
            <div className="text-[11px] font-mono text-slate-300 bg-white/[0.04] px-2.5 py-1 rounded-lg border border-white/[0.08]">
              {activeLat.toFixed(4)}°N, {activeLon.toFixed(4)}°E
            </div>
          )}
        </div>
      </div>

      {/* 2. Interactive Map Container */}
      <div className="relative rounded-[28px] overflow-hidden border border-white/[0.1] bg-[#0b0f19] shadow-2xl h-[320px] sm:h-[390px] w-full">
        {mapError ? (
          /* Error Fallback: "Map unavailable. Please check Maps configuration." */
          <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-slate-950/90 text-slate-300 space-y-3">
            <div className="p-3 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="space-y-1 max-w-sm">
              <h3 className="text-sm font-bold text-white">Map unavailable. Please check Maps configuration.</h3>
              <p className="text-xs text-slate-400">
                Environmental metrics and weather intelligence for <strong>{weatherData.locationName}</strong> ({activeLat.toFixed(2)}°N, {activeLon.toFixed(2)}°E) remain fully active.
              </p>
            </div>
            <button
              onClick={() => {
                setMapError(null);
                initMap();
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/[0.08] hover:bg-white/[0.15] text-white text-xs font-semibold border border-white/10 transition-all cursor-pointer min-h-[40px] active:scale-95"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry Map Initialization</span>
            </button>
          </div>
        ) : (
          <>
            {/* Map DOM Element */}
            <div ref={mapContainerRef} className="w-full h-full z-0" />

            {/* Floating Top Left Badge */}
            <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
              <div className="px-3 py-1.5 rounded-2xl bg-black/75 backdrop-blur-md border border-white/15 text-white text-xs font-medium flex items-center gap-2 shadow-lg">
                <div className="w-2 h-2 rounded-full bg-sky-400 animate-ping"></div>
                <span className="font-bold">📍 {weatherData.locationName.split(',')[0]}</span>
                <span className="text-slate-300">· {weatherData.currentTemp}°C</span>
              </div>
            </div>

            {/* Floating Top Right Recenter & Layer Switcher */}
            <div className="absolute top-3 right-12 z-10 flex items-center gap-1.5">
              <div className="flex bg-black/75 backdrop-blur-md p-1 rounded-xl border border-white/15 shadow-lg text-[10px]">
                <button
                  onClick={() => setMapLayerType('standard')}
                  className={`px-2 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                    mapLayerType === 'standard' ? 'bg-sky-500 text-slate-950' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  Map
                </button>
                <button
                  onClick={() => setMapLayerType('dark')}
                  className={`px-2 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                    mapLayerType === 'dark' ? 'bg-sky-500 text-slate-950' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  Dark
                </button>
                <button
                  onClick={() => setMapLayerType('topo')}
                  className={`px-2 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                    mapLayerType === 'topo' ? 'bg-sky-500 text-slate-950' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  Topo
                </button>
              </div>

              <button
                onClick={handleRecenter}
                title="Recenter on coordinates"
                className="p-2 rounded-xl bg-black/75 backdrop-blur-md border border-white/15 text-white hover:text-sky-300 shadow-lg cursor-pointer transition-all active:scale-95 min-h-[34px] min-w-[34px] flex items-center justify-center"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Floating Quick Action Overlay on Map Bottom */}
            <div className="absolute bottom-3 left-3 right-3 z-10 flex items-center justify-between gap-2 p-2.5 rounded-2xl bg-slate-950/85 backdrop-blur-md border border-white/15 shadow-2xl">
              <div className="flex items-center gap-2 min-w-0">
                <div className="p-1.5 rounded-xl bg-white/[0.08] text-white">
                  <WeatherIcon condition={weatherData.condition} className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-white truncate">
                    {weatherData.conditionText} · AQI {weatherData.environment.aqi}
                  </div>
                  <div className="text-[10px] text-slate-300 truncate">
                    Wind {weatherData.environment.windSpeed} km/h · UV {weatherData.environment.uvIndex}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={handleShareClick}
                  className="flex items-center gap-1 px-3 py-2 rounded-xl bg-white/[0.08] hover:bg-white/[0.15] text-slate-200 text-xs font-semibold border border-white/10 transition-all cursor-pointer min-h-[40px] touch-manipulation active:scale-95"
                >
                  <Share2 className="w-3.5 h-3.5 text-[#60A5FA]" />
                  <span>Share</span>
                </button>

                <button
                  onClick={() => onAskAIAboutLocation(weatherData.locationName)}
                  className="flex items-center gap-1 px-3 py-2 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 text-sky-200 text-xs font-semibold border border-sky-400/30 transition-all cursor-pointer min-h-[40px] touch-manipulation active:scale-95"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>AI Radar</span>
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* 3. Live Location Sharing Mode Box */}
      <div className="p-4 sm:p-5 rounded-[28px] bg-gradient-to-br from-[rgba(96,165,250,0.1)] via-[rgba(16,185,129,0.06)] to-transparent border border-[rgba(96,165,250,0.2)] backdrop-blur-xl shadow-2xl space-y-3.5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div
              className={`p-2.5 rounded-2xl border ${
                userLocation.isLiveSharingActive
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 animate-pulse'
                  : 'bg-white/[0.04] text-slate-400 border-white/[0.08]'
              }`}
            >
              <Radio className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-white">
                  Live Location Sharing Mode
                </h3>
                {userLocation.isLiveSharingActive ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    🟢 Active
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-300 border border-rose-500/20">
                    🔴 Off
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-300">
                {userLocation.isLiveSharingActive
                  ? 'Broadcasting live environmental coordinates & advisories to your contacts.'
                  : 'Explicit user control: Turn on to generate a live trackable SIH session link.'}
              </p>
            </div>
          </div>

          <button
            onClick={onToggleLiveSharing}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-2xl font-bold text-xs transition-all cursor-pointer min-h-[44px] touch-manipulation active:scale-95 shadow-md ${
              userLocation.isLiveSharingActive
                ? 'bg-rose-600 hover:bg-rose-500 text-white'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white'
            }`}
          >
            {userLocation.isLiveSharingActive ? (
              <>
                <StopCircle className="w-4 h-4" />
                <span>Stop Sharing</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                <span>Start Sharing</span>
              </>
            )}
          </button>
        </div>

        {/* Live Sharing Details (When active) */}
        {userLocation.isLiveSharingActive && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="p-3 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 text-xs space-y-2"
          >
            <div className="flex items-center justify-between text-emerald-200">
              <span className="font-semibold">🟢 Live Location Sharing Active</span>
              <span className="text-[11px] opacity-80">Last updated: Just now</span>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex-1 bg-black/40 px-3 py-2 rounded-xl text-[11px] font-mono text-slate-300 truncate border border-white/10">
                {window.location.origin}/?shareSession=demo-{Date.now().toString(36)}
              </div>
              <button
                onClick={handleCopyShareLink}
                className="flex items-center gap-1 px-3 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-bold text-xs border border-emerald-500/40 transition-all cursor-pointer min-h-[40px] touch-manipulation"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLink ? 'Copied' : 'Copy Link'}</span>
              </button>
            </div>
          </motion.div>
        )}
      </div>

      {/* 4. Predefined Demo Locations (SIH Judge Suite) */}
      <div className="p-4 sm:p-5 rounded-[28px] bg-white/[0.04] border border-white/[0.08] backdrop-blur-xl shadow-2xl space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              <span>⚡ Predefined Demo Locations</span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[rgba(96,165,250,0.15)] text-[#60A5FA] border border-[rgba(96,165,250,0.3)]">
                SIH Prototype Mode
              </span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Instantly simulate how ClimaIQ adapts across diverse micro-climates
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
          {DEMO_LOCATION_PRESETS.map((preset) => {
            const isCurrent =
              weatherData.locationName.toLowerCase().includes(preset.name.toLowerCase());

            return (
              <div
                key={preset.id}
                onClick={() => onSelectPresetLocation(preset)}
                className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-2.5 min-h-[56px] touch-manipulation active:scale-98 ${
                  isCurrent
                    ? 'bg-[rgba(96,165,250,0.18)] border-[rgba(96,165,250,0.5)] text-white shadow-md'
                    : 'bg-white/[0.02] hover:bg-white/[0.06] border-white/[0.06] text-slate-200'
                }`}
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-white truncate">{preset.name}</span>
                    <span className="text-[10px] text-[#60A5FA]">({preset.region})</span>
                    {isCurrent && <Check className="w-3.5 h-3.5 text-[#60A5FA] shrink-0 ml-1" />}
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-2 mt-0.5 leading-snug">
                    {preset.highlight}
                  </p>
                </div>

                <span className="text-[10px] font-mono font-medium px-2 py-1 rounded-lg bg-white/[0.04] text-slate-400 shrink-0">
                  {preset.latitude.toFixed(1)}°, {preset.longitude.toFixed(1)}°
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. Privacy & Geolocation Transparency Card */}
      <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between text-xs text-slate-400 gap-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>
            <strong>Privacy Assured:</strong> Location coordinates are processed exclusively for real-time environmental calculation and never stored.
          </span>
        </div>

        <button
          onClick={() => setShowCoordinates(!showCoordinates)}
          className="flex items-center gap-1 text-[11px] text-slate-300 hover:text-white px-2.5 py-1.5 rounded-xl bg-white/[0.05] border border-white/[0.08] transition-colors cursor-pointer shrink-0"
        >
          {showCoordinates ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          <span>{showCoordinates ? 'Hide Coords' : 'Show Coords'}</span>
        </button>
      </div>

      {/* Toast feedback */}
      <AnimatePresence>
        {copiedMessage && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-2xl bg-[#60A5FA] text-slate-950 font-bold text-xs shadow-2xl flex items-center gap-2"
          >
            <Check className="w-4 h-4" />
            <span>Location and weather summary copied to clipboard!</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
