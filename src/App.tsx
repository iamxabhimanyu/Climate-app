import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  ArrowRight,
  Compass,
  Share2,
  AlertTriangle,
  ChevronRight,
  ShieldAlert,
  SunMedium,
  Wind,
  Droplets,
} from 'lucide-react';
import { PersonaId, WeatherData, SmartAlert, UserLocationState } from './types';
import { DEMO_SCENARIOS, PERSONA_PROFILES } from './data/weatherData';
import { calculatePersonalizedInsight, generateSmartAlerts } from './utils/weatherEngine';
import {
  fetchLiveCurrentLocationWeather,
  fetchWeatherForCoordinates,
  DemoLocationPreset,
} from './utils/locationManager';
import {
  NavigationHistoryStack,
  NavigationState,
  AlertEventQueue,
  AlertEvent,
} from './utils/dataStructures';

// Components
import { AtmosphericBackground } from './components/AtmosphericBackground';
import { HeaderBar } from './components/HeaderBar';
import { HeroWeather } from './components/HeroWeather';
import { PersonalizedInsightCard } from './components/PersonalizedInsightCard';
import { HourlyForecastScroll } from './components/HourlyForecastScroll';
import { DailyForecastList } from './components/DailyForecastList';
import { EnvironmentalGrid } from './components/EnvironmentalGrid';
import { BottomNavBar, AppTab } from './components/BottomNavBar';
import { AIWeatherAssistant } from './components/AIWeatherAssistant';
import { TravelModeView } from './components/TravelModeView';
import { InsightsView } from './components/InsightsView';
import { SettingsView } from './components/SettingsView';
import { PersonaSelectorModal } from './components/PersonaSelectorModal';
import { LocationSelectorModal } from './components/LocationSelectorModal';
import { AlertCenterModal } from './components/AlertCenterModal';
import { OnboardingModal } from './components/OnboardingModal';
import { LocationSharingModal } from './components/LocationSharingModal';
import { EnvironmentalDetailModal, EnvironmentalMetricType } from './components/EnvironmentalDetailModal';

export function App() {
  // Main State
  const [weatherData, setWeatherData] = useState<WeatherData>(DEMO_SCENARIOS[0].scenarioData);
  const [selectedPersonas, setSelectedPersonas] = useState<PersonaId[]>(() => {
    try {
      const saved = localStorage.getItem('clima_interests_v2');
      if (saved) return JSON.parse(saved);
    } catch {}
    return ['fitness', 'commuter', 'health'];
  });
  const [activePersona, setActivePersona] = useState<PersonaId>(() => {
    try {
      const saved = localStorage.getItem('clima_primary_persona_v2');
      if (saved) return saved as PersonaId;
    } catch {}
    return 'fitness';
  });
  const [currentTab, setCurrentTab] = useState<AppTab>('home');
  const [initialAIPrompt, setInitialAIPrompt] = useState<string | undefined>(undefined);
  const [scenarioToast, setScenarioToast] = useState<string | null>(null);

  // Progressive Disclosure Modal State
  const [activeEnvironmentalMetric, setActiveEnvironmentalMetric] = useState<EnvironmentalMetricType | null>(null);

  // Live Location & Sharing State
  const [userLocation, setUserLocation] = useState<UserLocationState>({
    latitude: 19.8762,
    longitude: 75.3433,
    accuracy: 15,
    locationName: DEMO_SCENARIOS[0].scenarioData.locationName,
    country: DEMO_SCENARIOS[0].scenarioData.country,
    region: 'Maharashtra',
    isLiveGPS: false,
    isLiveSharingActive: false,
    permissionStatus: 'prompt',
    lastUpdatedTime: 'Just now',
    rawTimestamp: Date.now(),
    error: null,
  });
  const [isDetectingGPS, setIsDetectingGPS] = useState(false);

  // Modals
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [isPersonaModalOpen, setIsPersonaModalOpen] = useState(false);
  const [isAlertsModalOpen, setIsAlertsModalOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(() => {
    try {
      return localStorage.getItem('clima_onboarded_v2') !== 'true';
    } catch {
      return false;
    }
  });
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  // Active Alerts
  const [alerts, setAlerts] = useState<SmartAlert[]>(() =>
    generateSmartAlerts(DEMO_SCENARIOS[0].scenarioData)
  );

  // ==========================================
  // REAL DATA STRUCTURE 1: NAVIGATION STACK (LIFO)
  // ==========================================
  const navStackRef = useRef<NavigationHistoryStack>(
    new NavigationHistoryStack({
      tab: 'home',
      label: 'Home',
      timestamp: Date.now(),
    })
  );
  const [navHistory, setNavHistory] = useState<NavigationState[]>(() =>
    navStackRef.current.getHistory()
  );
  const [canGoBack, setCanGoBack] = useState<boolean>(false);

  // Helper to push new state onto Navigation Stack
  const pushNavigationState = useCallback(
    (tab: AppTab, label: string, modal: any = null, metric: any = null) => {
      navStackRef.current.navigateTo({
        tab,
        label,
        openedModal: modal,
        environmentalMetric: metric,
        timestamp: Date.now(),
      });
      setNavHistory(navStackRef.current.getHistory());
      setCanGoBack(navStackRef.current.canGoBack());
    },
    []
  );

  // Stack LIFO: Go Back Handler
  const handleGoBack = useCallback(() => {
    // If a modal is open, close it first
    if (activeEnvironmentalMetric) {
      setActiveEnvironmentalMetric(null);
      navStackRef.current.goBack();
      setNavHistory(navStackRef.current.getHistory());
      setCanGoBack(navStackRef.current.canGoBack());
      return;
    }
    if (isLocationModalOpen || isPersonaModalOpen || isAlertsModalOpen || isShareModalOpen) {
      setIsLocationModalOpen(false);
      setIsPersonaModalOpen(false);
      setIsAlertsModalOpen(false);
      setIsShareModalOpen(false);
      navStackRef.current.goBack();
      setNavHistory(navStackRef.current.getHistory());
      setCanGoBack(navStackRef.current.canGoBack());
      return;
    }

    const prevState = navStackRef.current.goBack();
    if (prevState) {
      setCurrentTab(prevState.tab);
      setNavHistory(navStackRef.current.getHistory());
      setCanGoBack(navStackRef.current.canGoBack());
    }
  }, [
    activeEnvironmentalMetric,
    isLocationModalOpen,
    isPersonaModalOpen,
    isAlertsModalOpen,
    isShareModalOpen,
  ]);

  // Tab change with Stack push
  const handleSelectTab = (tab: AppTab) => {
    if (tab !== currentTab) {
      const labels: Record<AppTab, string> = {
        home: 'Home',
        insights: 'Insights',
        travel: 'Travel',
        ai: 'Ask AI',
        settings: 'Settings',
      };
      pushNavigationState(tab, labels[tab]);
      setCurrentTab(tab);
    }
  };

  // ==========================================
  // REAL DATA STRUCTURE 2: ALERT EVENT QUEUE (FIFO)
  // ==========================================
  const alertQueueRef = useRef<AlertEventQueue>(new AlertEventQueue());
  const [pendingQueueEvents, setPendingQueueEvents] = useState<AlertEvent[]>([]);
  const [processedQueueEvents, setProcessedQueueEvents] = useState<AlertEvent[]>([]);

  // Seed sample telemetry events into queue initially
  useEffect(() => {
    alertQueueRef.current.enqueueEvent({
      id: 'init-evt-1',
      type: 'incoming_alert',
      title: 'Atmospheric Inversion Detected',
      category: 'Air Quality',
      severity: 'moderate',
      message: 'Cool air trapped near ground level is causing particulate buildup in valley sectors.',
    });
    alertQueueRef.current.enqueueEvent({
      id: 'init-evt-2',
      type: 'telemetry_anomaly',
      title: 'Solar UV-B Peak Wave',
      category: 'Sun & Skin',
      severity: 'caution',
      message: 'UV Index expected to peak at 8.2 between 11:30 AM and 2:00 PM.',
    });
    setPendingQueueEvents(alertQueueRef.current.getPendingEvents());
    setProcessedQueueEvents(alertQueueRef.current.getProcessedHistory());
  }, []);

  // FIFO: Dequeue next event and dispatch to active alerts
  const handleProcessNextAlertEvent = useCallback(() => {
    const nextEvent = alertQueueRef.current.processNextEvent();
    if (nextEvent) {
      const newAlert: SmartAlert = {
        id: `dispatched-${nextEvent.id}-${Date.now()}`,
        title: nextEvent.title,
        message: nextEvent.message,
        category: (nextEvent.category as any) || 'Poor AQI',
        severity: nextEvent.severity,
        targetPersonas: ['health', 'fitness', 'commuter'],
        recommendation: `Action advised: Monitor local readings and take recommended precautions for ${nextEvent.category.toLowerCase()}.`,
        time: 'Just now (FIFO)',
      };
      setAlerts((prev) => [newAlert, ...prev]);
      setPendingQueueEvents(alertQueueRef.current.getPendingEvents());
      setProcessedQueueEvents(alertQueueRef.current.getProcessedHistory());
      setScenarioToast(`⚡ Dispatched: ${nextEvent.title}`);
      setTimeout(() => setScenarioToast(null), 3000);
    }
  }, []);

  // FIFO: Enqueue simulated event
  const handleSimulateQueueEvent = useCallback(
    (type: 'wind_gust' | 'aqi_spike' | 'rain_surge') => {
      let eventPayload: Omit<AlertEvent, 'timestamp' | 'processed'>;
      if (type === 'wind_gust') {
        eventPayload = {
          id: `sim-wind-${Date.now()}`,
          type: 'telemetry_anomaly',
          title: 'Sudden Wind Gust Surge (48 km/h)',
          category: 'Wind & Turbulence',
          severity: 'caution',
          message: 'An abrupt pressure gradient is driving gusty winds across exposed elevated routes.',
        };
      } else if (type === 'aqi_spike') {
        eventPayload = {
          id: `sim-aqi-${Date.now()}`,
          type: 'threshold_breach',
          title: 'AQI Spike: PM2.5 > 155',
          category: 'Air Quality',
          severity: 'severe',
          message: 'Sensor array reports an unexpected spike in fine particulate density.',
        };
      } else {
        eventPayload = {
          id: `sim-rain-${Date.now()}`,
          type: 'incoming_alert',
          title: 'Localized Heavy Downpour Imminent',
          category: 'Precipitation',
          severity: 'moderate',
          message: 'Doppler echo indicates a rapid convective cell developing 12km upwind.',
        };
      }
      alertQueueRef.current.enqueueEvent(eventPayload);
      setPendingQueueEvents(alertQueueRef.current.getPendingEvents());
      setScenarioToast(`📥 Enqueued (FIFO): ${eventPayload.title}`);
      setTimeout(() => setScenarioToast(null), 3000);
    },
    []
  );

  // Persist selections to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('clima_interests_v2', JSON.stringify(selectedPersonas));
    } catch {}
  }, [selectedPersonas]);

  useEffect(() => {
    try {
      localStorage.setItem('clima_primary_persona_v2', activePersona);
    } catch {}
  }, [activePersona]);

  // Update alerts when weatherData changes
  useEffect(() => {
    const rawAlerts = generateSmartAlerts(weatherData);
    setAlerts(rawAlerts);
  }, [weatherData, selectedPersonas]);

  // Handle Location Switch via modal or selector
  const handleSelectLocationData = (newData: WeatherData) => {
    setWeatherData(newData);
    setUserLocation((prev) => ({
      ...prev,
      locationName: newData.locationName,
      country: newData.country,
      isLiveGPS: false,
      lastUpdatedTime: 'Just now',
    }));
    setScenarioToast(`📍 ${newData.locationName}`);
    setTimeout(() => setScenarioToast(null), 3000);
  };

  // Live GPS Acquisition Handler
  const handleDetectGPSLocation = useCallback(async () => {
    setIsDetectingGPS(true);
    try {
      const { userLocation: newLoc, weatherData: newWeather } =
        await fetchLiveCurrentLocationWeather();
      setUserLocation(newLoc);
      setWeatherData(newWeather);
      setScenarioToast(`📍 Found: ${newLoc.locationName}`);
      setTimeout(() => setScenarioToast(null), 3500);
    } catch (err: any) {
      setUserLocation((prev) => ({
        ...prev,
        permissionStatus: 'denied',
        error: err.message,
      }));
      setScenarioToast(`⚠️ Couldn't determine location. Search for a location instead.`);
      setTimeout(() => setScenarioToast(null), 4000);
      throw err;
    } finally {
      setIsDetectingGPS(false);
    }
  }, []);

  // Preset Location Selection Handler
  const handleSelectPresetLocation = async (preset: DemoLocationPreset) => {
    try {
      const newWeather = await fetchWeatherForCoordinates(
        preset.latitude,
        preset.longitude,
        `${preset.name}, ${preset.region}`,
        preset.country
      );
      setWeatherData(newWeather);
      setUserLocation((prev) => ({
        ...prev,
        latitude: preset.latitude,
        longitude: preset.longitude,
        locationName: `${preset.name}, ${preset.region}`,
        country: preset.country,
        region: preset.region,
        isLiveGPS: false,
        lastUpdatedTime: 'Just now',
      }));
      setScenarioToast(`⚡ Switched to ${preset.name}`);
      setTimeout(() => setScenarioToast(null), 3000);
    } catch (e) {
      console.error(e);
    }
  };

  // Live Sharing Toggle Handler
  const handleToggleLiveSharing = () => {
    setUserLocation((prev) => {
      const nextActive = !prev.isLiveSharingActive;
      if (nextActive) {
        setScenarioToast('🟢 Live Location Sharing Mode active');
      } else {
        setScenarioToast('🔴 Location Sharing stopped');
      }
      setTimeout(() => setScenarioToast(null), 3000);
      return { ...prev, isLiveSharingActive: nextActive };
    });
  };

  // Toggle Persona in list
  const handleTogglePersona = (id: PersonaId) => {
    setSelectedPersonas((prev) => {
      let next: PersonaId[];
      if (prev.includes(id)) {
        if (prev.length === 1) return prev; // Keep at least one
        next = prev.filter((p) => p !== id);
      } else {
        next = [...prev, id];
      }
      if (!next.includes(activePersona) && next.length > 0) {
        setActivePersona(next[0]);
      }
      return next;
    });
  };

  // Jump directly to Ask AI tab with prompt
  const handleAskAIWithPrompt = (prompt: string) => {
    setInitialAIPrompt(prompt);
    pushNavigationState('ai', 'Ask AI');
    setCurrentTab('ai');
  };

  // Open Environmental Metric Modal with Stack push
  const handleOpenEnvironmentalMetric = (metric: EnvironmentalMetricType) => {
    pushNavigationState(currentTab, `Env: ${metric}`, 'environmental', metric);
    setActiveEnvironmentalMetric(metric);
  };

  // Dismiss alert
  const handleDismissAlert = (id: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  };

  const handleFinishOnboarding = () => {
    setIsOnboardingOpen(false);
    try {
      localStorage.setItem('clima_onboarded_v2', 'true');
    } catch {}
  };

  // Primary active personalized insight
  const activeInsight = calculatePersonalizedInsight(activePersona, weatherData);

  return (
    <div className="min-h-screen text-slate-100 font-['Plus_Jakarta_Sans'] relative selection:bg-sky-500/30 selection:text-white pb-16">
      {/* Dynamic atmospheric background */}
      <AtmosphericBackground
        condition={weatherData.condition}
        timePhase={weatherData.timePhase || 'auto'}
        isNight={weatherData.isNight ?? false}
        sunriseStr={weatherData.environment?.sunrise}
        sunsetStr={weatherData.environment?.sunset}
      />

      {/* Global Header Bar with Stack LIFO Back Support */}
      <HeaderBar
        locationName={weatherData.locationName}
        country={weatherData.country}
        activePersona={activePersona}
        alertCount={alerts.length}
        isLiveGPS={userLocation.isLiveGPS}
        isLiveSharingActive={userLocation.isLiveSharingActive}
        canGoBack={canGoBack}
        onGoBack={handleGoBack}
        onOpenLocationModal={() => {
          pushNavigationState(currentTab, 'Location Select', 'location');
          setIsLocationModalOpen(true);
        }}
        onOpenPersonaModal={() => {
          pushNavigationState(currentTab, 'Persona Select', 'persona');
          setIsPersonaModalOpen(true);
        }}
        onOpenAlertsModal={() => {
          pushNavigationState(currentTab, 'Alert Center', 'alerts');
          setIsAlertsModalOpen(true);
        }}
        onOpenShareModal={() => {
          pushNavigationState(currentTab, 'Location Sharing', 'sharing');
          setIsShareModalOpen(true);
        }}
      />

      {/* Scenario / Location Toast Notification */}
      <AnimatePresence>
        {scenarioToast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-14 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-sky-400 to-blue-500 text-slate-950 font-extrabold text-xs shadow-2xl backdrop-blur-md flex items-center gap-2 max-w-[90vw] text-center"
          >
            <span>{scenarioToast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Container Layout */}
      <main className="max-w-3xl mx-auto px-3.5 sm:px-4 py-3">
        {/* TAB 1: HOME (STRICT USER INFORMATION HIERARCHY) */}
        {currentTab === 'home' && (
          <motion.div
            key="tab-home"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="space-y-4"
          >
            {/* 1 to 5. LOCATION, CURRENT WEATHER HERO, TEMPERATURE, CONDITION & HIGH/LOW */}
            <HeroWeather
              data={weatherData}
              isLiveGPS={userLocation.isLiveGPS}
              onAskAIAboutCurrent={() =>
                handleAskAIWithPrompt(
                  `What are your key advisories for today's weather in ${weatherData.locationName}?`
                )
              }
              onOpenMetricDetail={handleOpenEnvironmentalMetric}
              onOpenShareModal={() => {
                pushNavigationState(currentTab, 'Location Sharing', 'sharing');
                setIsShareModalOpen(true);
              }}
              onOpenLocationModal={() => {
                pushNavigationState(currentTab, 'Location Select', 'location');
                setIsLocationModalOpen(true);
              }}
            />

            {/* 6. HOURLY FORECAST (CLEAN HORIZONTAL TIMELINE) */}
            <HourlyForecastScroll
              hourly={weatherData.hourly}
              onAskAI={handleAskAIWithPrompt}
            />

            {/* 7. PERSONALIZED RECOMMENDATION ("YOUR DAY") */}
            <PersonalizedInsightCard
              insight={activeInsight}
              weatherData={weatherData}
              selectedPersonas={selectedPersonas}
              onAskAI={handleAskAIWithPrompt}
              onSwitchPersona={() => {
                pushNavigationState(currentTab, 'Persona Select', 'persona');
                setIsPersonaModalOpen(true);
              }}
              onSelectPersonaId={(id) => setActivePersona(id)}
            />

            {/* 8. ACTIVE SMART ALERTS CALLOUT (IF ANY) */}
            {alerts.length > 0 && (
              <div
                onClick={() => {
                  pushNavigationState(currentTab, 'Alert Center', 'alerts');
                  setIsAlertsModalOpen(true);
                }}
                className="p-3.5 sm:p-4 rounded-3xl bg-rose-500/15 hover:bg-rose-500/20 border border-rose-400/35 backdrop-blur-xl transition-all cursor-pointer flex items-center justify-between gap-3 text-left shadow-lg active:scale-[0.99] select-none"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-2 rounded-2xl bg-rose-500/25 text-rose-300 shrink-0">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.2 rounded bg-rose-500/30 text-rose-200">
                        {alerts[0].category}
                      </span>
                      <span className="text-xs font-bold text-white truncate">{alerts[0].title}</span>
                    </div>
                    <p className="text-[11px] text-slate-300 mt-0.5 truncate">{alerts[0].recommendation}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-xs text-rose-300 font-semibold shrink-0">
                  <span>Details ({alerts.length})</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            )}

            {/* 9. ENVIRONMENTAL INFORMATION (ORGANIZED SECTIONS WITH PROGRESSIVE DISCLOSURE) */}
            <EnvironmentalGrid
              environment={weatherData.environment}
              onOpenMetricDetail={handleOpenEnvironmentalMetric}
              onAskAI={handleAskAIWithPrompt}
            />

            {/* 10. DAILY FORECAST (7-DAY CLEAN ACCORDION) */}
            <DailyForecastList
              daily={weatherData.daily}
              onAskAI={handleAskAIWithPrompt}
            />

            {/* 11. NATURAL AI DISCOVERY SECTION */}
            <section className="rounded-3xl p-5 bg-white/[0.04] border border-white/[0.08] backdrop-blur-2xl shadow-xl space-y-3 select-none text-left">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-2xl bg-sky-500/15 text-sky-400 border border-sky-400/30">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Ask about your weather</h3>
                    <p className="text-[11px] text-slate-400">Contextual advice powered by Gemini AI</p>
                  </div>
                </div>
                <button
                  onClick={() => handleSelectTab('ai')}
                  className="text-[11px] font-semibold text-sky-300 hover:text-white px-3 py-1.5 rounded-xl bg-white/[0.06] border border-white/[0.1] transition-all flex items-center gap-1 cursor-pointer"
                >
                  <span>Open AI</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              {/* Natural suggested questions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  {
                    label: '🏃 Can I run now?',
                    q: `Can I run now in ${weatherData.locationName} with current temperature ${weatherData.currentTemp}°C and AQI ${weatherData.environment.aqi}?`,
                  },
                  {
                    label: '☔ Will it rain today?',
                    q: `Will it rain today in ${weatherData.locationName}? Should I carry an umbrella?`,
                  },
                  {
                    label: '👕 What should I wear?',
                    q: `What should I wear today in ${weatherData.locationName} considering temperature (${weatherData.currentTemp}°C), wind, and UV?`,
                  },
                  {
                    label: '🚗 When is the best time to commute?',
                    q: `When is the safest and best time to commute today in ${weatherData.locationName}?`,
                  },
                ].map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleAskAIWithPrompt(item.q)}
                    className="p-3 rounded-2xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.06] text-left text-xs text-slate-200 hover:text-sky-300 transition-all flex items-center justify-between group cursor-pointer min-h-[44px] touch-manipulation active:scale-[0.99]"
                  >
                    <span className="truncate">{item.label}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-sky-400 group-hover:translate-x-0.5 transition-all shrink-0 ml-1" />
                  </button>
                ))}
              </div>
            </section>
          </motion.div>
        )}

        {/* TAB 2: INSIGHTS (ALL PERSONA MODULES) */}
        {currentTab === 'insights' && (
          <motion.div
            key="tab-insights"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
          >
            <InsightsView
              weatherData={weatherData}
              activePersona={activePersona}
              onSelectPersona={(id) => setActivePersona(id)}
              onAskAI={handleAskAIWithPrompt}
            />
          </motion.div>
        )}

        {/* TAB 3: EXPLORE, LIVE LOCATION RADAR & TRAVEL */}
        {currentTab === 'travel' && (
          <motion.div
            key="tab-travel"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
          >
            <TravelModeView
              weatherData={weatherData}
              userLocation={userLocation}
              onDetectCurrentLocation={handleDetectGPSLocation}
              onSelectPresetLocation={handleSelectPresetLocation}
              onToggleLiveSharing={handleToggleLiveSharing}
              onAskAIAboutDestination={(city) =>
                handleAskAIWithPrompt(
                  `What should I pack and what precautions should I take in ${city} based on this week's weather?`
                )
              }
            />
          </motion.div>
        )}

        {/* TAB 4: ASK AI (GEMINI AI ASSISTANT) */}
        {currentTab === 'ai' && (
          <motion.div
            key="tab-ai"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
          >
            <AIWeatherAssistant
              weatherData={weatherData}
              activePersona={activePersona}
              initialPrompt={initialAIPrompt}
              onClearInitialPrompt={() => setInitialAIPrompt(undefined)}
            />
          </motion.div>
        )}

        {/* TAB 5: SETTINGS & USER CONTROL */}
        {currentTab === 'settings' && (
          <SettingsView
            selectedPersonas={selectedPersonas}
            activePersona={activePersona}
            onTogglePersona={handleTogglePersona}
            onSetActivePersona={(id) => {
              setActivePersona(id);
              if (!selectedPersonas.includes(id)) {
                setSelectedPersonas((prev) => [...prev, id]);
              }
            }}
            userLocation={userLocation}
            onDetectLocation={handleDetectGPSLocation}
            onOpenLocationModal={() => {
              pushNavigationState(currentTab, 'Location Select', 'location');
              setIsLocationModalOpen(true);
            }}
            onOpenShareModal={() => {
              pushNavigationState(currentTab, 'Location Sharing', 'sharing');
              setIsShareModalOpen(true);
            }}
            onReopenOnboarding={() => setIsOnboardingOpen(true)}
            isDetectingGPS={isDetectingGPS}
            navigationHistory={navHistory}
            queuePendingCount={pendingQueueEvents.length}
          />
        )}
      </main>

      {/* Floating Bottom Navigation Bar */}
      <BottomNavBar
        currentTab={currentTab}
        onSelectTab={handleSelectTab}
        unreadAlertCount={alerts.length}
      />

      {/* Modals & Sheets */}
      <LocationSelectorModal
        isOpen={isLocationModalOpen}
        currentLocationName={weatherData.locationName}
        userLocation={userLocation}
        onSelectLocationData={handleSelectLocationData}
        onDetectGPS={handleDetectGPSLocation}
        onClose={() => setIsLocationModalOpen(false)}
      />

      <PersonaSelectorModal
        isOpen={isPersonaModalOpen}
        selectedPersonas={selectedPersonas}
        activePersona={activePersona}
        onTogglePersona={handleTogglePersona}
        onSetActivePersona={(id) => {
          setActivePersona(id);
          if (!selectedPersonas.includes(id)) {
            setSelectedPersonas((prev) => [...prev, id]);
          }
        }}
        onClose={() => setIsPersonaModalOpen(false)}
      />

      <AlertCenterModal
        isOpen={isAlertsModalOpen}
        alerts={alerts}
        pendingEvents={pendingQueueEvents}
        processedEvents={processedQueueEvents}
        onProcessNextEvent={handleProcessNextAlertEvent}
        onSimulateEvent={handleSimulateQueueEvent}
        onDismissAlert={handleDismissAlert}
        onAskAIAboutAlert={(title) =>
          handleAskAIWithPrompt(`What precautions should I take for this alert: ${title}?`)
        }
        onClose={() => setIsAlertsModalOpen(false)}
      />

      <OnboardingModal
        isOpen={isOnboardingOpen}
        selectedPersonas={selectedPersonas}
        onTogglePersona={handleTogglePersona}
        onDetectLocation={handleDetectGPSLocation}
        onOpenSearchModal={() => {
          pushNavigationState(currentTab, 'Location Select', 'location');
          setIsLocationModalOpen(true);
        }}
        currentLocationName={weatherData.locationName}
        isDetectingGPS={isDetectingGPS}
        onComplete={handleFinishOnboarding}
      />

      <LocationSharingModal
        isOpen={isShareModalOpen}
        weatherData={weatherData}
        userLocation={userLocation}
        onToggleLiveSharing={handleToggleLiveSharing}
        onClose={() => setIsShareModalOpen(false)}
      />

      <EnvironmentalDetailModal
        isOpen={activeEnvironmentalMetric !== null}
        metricType={activeEnvironmentalMetric}
        environment={weatherData.environment}
        locationName={weatherData.locationName}
        onClose={() => setActiveEnvironmentalMetric(null)}
        onAskAI={handleAskAIWithPrompt}
      />
    </div>
  );
}

export default App;

