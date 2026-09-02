import React from 'react';
import { WeatherCondition, TimePhase } from '../types';
import { getAtmosphereSkyTheme, getAtmosphereState } from '../utils/atmosphereEngine';
import { SunAtmosphere } from './atmosphere/SunAtmosphere';
import { MoonAtmosphere } from './atmosphere/MoonAtmosphere';
import { StarField } from './atmosphere/StarField';
import { CloudLayers } from './atmosphere/CloudLayers';
import { RainAtmosphere } from './atmosphere/RainAtmosphere';
import { LightningAtmosphere } from './atmosphere/LightningAtmosphere';
import { FogAtmosphere } from './atmosphere/FogAtmosphere';
import { SnowAtmosphere } from './atmosphere/SnowAtmosphere';

interface AtmosphericBackgroundProps {
  condition: WeatherCondition;
  timePhase?: TimePhase;
  isNight?: boolean;
  currentHour?: number;
  sunriseStr?: string;
  sunsetStr?: string;
}

export const AtmosphericBackground: React.FC<AtmosphericBackgroundProps> = ({
  condition,
  timePhase = 'auto',
  isNight = false,
  currentHour,
  sunriseStr,
  sunsetStr,
}: AtmosphericBackgroundProps) => {
  // If isNight is explicitly passed and timePhase is auto, use 'night'
  const effectiveTimePhase: TimePhase = (isNight && timePhase === 'auto') ? ('night' as const) : timePhase;

  // Resolve active atmospheric state & theme config
  const state = getAtmosphereState(condition, effectiveTimePhase, currentHour, sunriseStr, sunsetStr);
  const theme = getAtmosphereSkyTheme(state);

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none -z-10 overflow-hidden select-none bg-[#030712]"
    >
      {/* 1. Base Dynamic Atmospheric Sky Gradient */}
      <div
        className="absolute inset-0 transition-all duration-1000 ease-out"
        style={{ background: theme.background }}
      />

      {/* 2. Ambient Atmosphere Lighting Glow */}
      <div
        className="absolute inset-0 transition-all duration-1000 ease-out opacity-90"
        style={{ background: theme.ambientGlow }}
      />

      {/* 3. Celestial Star Field (Night / Dawn) */}
      {theme.hasStars && <StarField density={theme.hasMoon ? 'normal' : 'dense'} />}

      {/* 4. Sun Atmosphere (Daytime / Sunrise / Sunset) */}
      {theme.hasSun && <SunAtmosphere variant={theme.sunVariant} />}

      {/* 5. Moon Atmosphere (Nighttime) */}
      {theme.hasMoon && <MoonAtmosphere />}

      {/* 6. Parallax Drifting Cloud Layers */}
      {theme.cloudCoverage !== 'none' && (
        <CloudLayers coverage={theme.cloudCoverage} tone={theme.cloudTone} />
      )}

      {/* 7. Rain Particle Atmosphere (Drizzle / Heavy Rain) */}
      {theme.rainIntensity !== 'none' && (
        <RainAtmosphere intensity={theme.rainIntensity} />
      )}

      {/* 8. Thunderstorm Sheet Lightning Glow */}
      {theme.hasLightning && <LightningAtmosphere />}

      {/* 9. Fog / Atmospheric Haze Layers */}
      {theme.hasFog && <FogAtmosphere />}

      {/* 10. Snow Flurry Particles */}
      {theme.hasSnow && <SnowAtmosphere />}

      {/* 11. Subtle Sky Sheen Top Horizon Overlay */}
      <div className="absolute top-0 inset-x-0 h-96 bg-gradient-to-b from-white/[0.03] to-transparent pointer-events-none" />
    </div>
  );
};
