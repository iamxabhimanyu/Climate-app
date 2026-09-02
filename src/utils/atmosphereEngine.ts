import { AtmosphereState, TimePhase, WeatherCondition } from '../types';

export interface SkyThemeConfig {
  background: string;
  ambientGlow: string;
  skyTone: 'day-clear' | 'day-overcast' | 'sunset' | 'sunrise' | 'night-clear' | 'night-storm';
  hasSun: boolean;
  sunVariant?: 'high' | 'sunrise' | 'sunset';
  hasMoon: boolean;
  hasStars: boolean;
  cloudCoverage: 'none' | 'light' | 'moderate' | 'heavy' | 'storm';
  cloudTone: 'bright' | 'golden' | 'dusk' | 'slate' | 'night' | 'storm';
  rainIntensity: 'none' | 'light' | 'heavy';
  hasLightning: boolean;
  hasFog: boolean;
  hasSnow: boolean;
  description: string;
}

// Helper to parse time strings like "06:15 AM" or "06:45 PM" into 24-hour decimal
export function parseTimeToDecimal(timeStr: string): number {
  if (!timeStr) return 12;
  const match = timeStr.trim().match(/(\d+):(\d+)\s*(AM|PM)?/i);
  if (!match) return 12;
  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const period = match[3]?.toUpperCase();

  if (period === 'PM' && hours < 12) hours += 12;
  if (period === 'AM' && hours === 12) hours = 0;

  return hours + minutes / 60;
}

export function getResolvedTimePhase(
  timePhase: TimePhase = 'auto',
  currentHour?: number,
  sunriseStr?: string,
  sunsetStr?: string
): 'day' | 'night' | 'sunrise' | 'sunset' {
  if (timePhase !== 'auto') {
    return timePhase;
  }

  // Use provided hour or derive from current system time
  let hour = currentHour !== undefined ? currentHour : new Date().getHours() + new Date().getMinutes() / 60;
  if (hour > 24) hour = hour % 24;

  const sunrise = sunriseStr ? parseTimeToDecimal(sunriseStr) : 6.0;
  const sunset = sunsetStr ? parseTimeToDecimal(sunsetStr) : 18.5;

  // Sunrise window: 45 min before to 45 min after sunrise
  if (hour >= sunrise - 0.75 && hour <= sunrise + 0.75) {
    return 'sunrise';
  }

  // Sunset window: 50 min before to 40 min after sunset
  if (hour >= sunset - 0.85 && hour <= sunset + 0.65) {
    return 'sunset';
  }

  // Daytime
  if (hour > sunrise + 0.75 && hour < sunset - 0.85) {
    return 'day';
  }

  // Otherwise night
  return 'night';
}

export function getAtmosphereState(
  condition: WeatherCondition,
  timePhase: TimePhase = 'auto',
  currentHour?: number,
  sunriseStr?: string,
  sunsetStr?: string
): AtmosphereState {
  const resolved = getResolvedTimePhase(timePhase, currentHour, sunriseStr, sunsetStr);

  if (resolved === 'night') {
    switch (condition) {
      case 'sunny':
        return 'clear_night';
      case 'partly-cloudy':
        return 'partly_cloudy_night';
      case 'cloudy':
        return 'cloudy_night';
      case 'rain':
        return 'rain_night';
      case 'heavy-rain':
        return 'heavy_rain_night';
      case 'thunderstorm':
        return 'storm_night';
      case 'foggy':
        return 'foggy_night';
      case 'snow':
        return 'snow_night';
      default:
        return 'clear_night';
    }
  }

  if (resolved === 'sunrise') {
    if (condition === 'rain' || condition === 'heavy-rain' || condition === 'thunderstorm') {
      return 'sunrise_rain';
    }
    if (condition === 'cloudy' || condition === 'partly-cloudy') {
      return 'sunrise_cloudy';
    }
    return 'sunrise_clear';
  }

  if (resolved === 'sunset') {
    if (condition === 'rain' || condition === 'heavy-rain' || condition === 'thunderstorm') {
      return 'sunset_rain';
    }
    if (condition === 'cloudy' || condition === 'partly-cloudy') {
      return 'sunset_cloudy';
    }
    return 'sunset_clear';
  }

  // Day Phase
  switch (condition) {
    case 'sunny':
      return 'clear_day';
    case 'partly-cloudy':
      return 'partly_cloudy_day';
    case 'cloudy':
      return 'cloudy_day';
    case 'rain':
      return 'rain_day';
    case 'heavy-rain':
      return 'heavy_rain_day';
    case 'thunderstorm':
      return 'storm_day';
    case 'foggy':
      return 'foggy_day';
    case 'snow':
      return 'snow_day';
    default:
      return 'clear_day';
  }
}

export function getAtmosphereSkyTheme(state: AtmosphereState): SkyThemeConfig {
  switch (state) {
    // Daytime clear sun
    case 'clear_day':
      return {
        background: 'radial-gradient(ellipse at 50% -15%, #1D4ED8 0%, #172554 42%, #081120 80%, #030712 100%)',
        ambientGlow: 'radial-gradient(circle at 50% 12%, rgba(56, 189, 248, 0.22) 0%, rgba(251, 191, 36, 0.12) 35%, transparent 70%)',
        skyTone: 'day-clear',
        hasSun: true,
        sunVariant: 'high',
        hasMoon: false,
        hasStars: false,
        cloudCoverage: 'none',
        cloudTone: 'bright',
        rainIntensity: 'none',
        hasLightning: false,
        hasFog: false,
        hasSnow: false,
        description: 'Radiant Daytime Sun & Clear Sky Atmosphere',
      };

    // Daytime partly cloudy
    case 'partly_cloudy_day':
      return {
        background: 'radial-gradient(ellipse at 50% -10%, #1E40AF 0%, #1E293B 48%, #080D1A 85%, #030712 100%)',
        ambientGlow: 'radial-gradient(circle at 45% 15%, rgba(96, 165, 250, 0.18) 0%, rgba(253, 230, 138, 0.08) 40%, transparent 65%)',
        skyTone: 'day-clear',
        hasSun: true,
        sunVariant: 'high',
        hasMoon: false,
        hasStars: false,
        cloudCoverage: 'light',
        cloudTone: 'bright',
        rainIntensity: 'none',
        hasLightning: false,
        hasFog: false,
        hasSnow: false,
        description: 'Soft Drifting Clouds with Sunlight Breaks',
      };

    // Daytime cloudy overcast
    case 'cloudy_day':
      return {
        background: 'radial-gradient(ellipse at 50% 0%, #334155 0%, #1E293B 45%, #0F172A 78%, #030712 100%)',
        ambientGlow: 'radial-gradient(circle at 50% 20%, rgba(148, 163, 184, 0.12) 0%, transparent 60%)',
        skyTone: 'day-overcast',
        hasSun: false,
        hasMoon: false,
        hasStars: false,
        cloudCoverage: 'heavy',
        cloudTone: 'slate',
        rainIntensity: 'none',
        hasLightning: false,
        hasFog: false,
        hasSnow: false,
        description: 'Multi-layer Overcast Sky Atmosphere',
      };

    // Daytime light rain
    case 'rain_day':
      return {
        background: 'radial-gradient(ellipse at 50% -5%, #1E3A5F 0%, #1E293B 50%, #0B132B 82%, #030712 100%)',
        ambientGlow: 'radial-gradient(circle at 50% 25%, rgba(56, 189, 248, 0.14) 0%, rgba(30, 41, 59, 0.2) 50%, transparent 75%)',
        skyTone: 'day-overcast',
        hasSun: false,
        hasMoon: false,
        hasStars: false,
        cloudCoverage: 'moderate',
        cloudTone: 'slate',
        rainIntensity: 'light',
        hasLightning: false,
        hasFog: false,
        hasSnow: false,
        description: 'Gentle Rain Atmosphere with Soft Cloud Canopy',
      };

    // Daytime heavy rain
    case 'heavy_rain_day':
      return {
        background: 'radial-gradient(ellipse at 50% 0%, #1E293B 0%, #0F172A 50%, #020617 85%, #000000 100%)',
        ambientGlow: 'radial-gradient(circle at 50% 20%, rgba(56, 189, 248, 0.1) 0%, transparent 60%)',
        skyTone: 'day-overcast',
        hasSun: false,
        hasMoon: false,
        hasStars: false,
        cloudCoverage: 'heavy',
        cloudTone: 'storm',
        rainIntensity: 'heavy',
        hasLightning: false,
        hasFog: false,
        hasSnow: false,
        description: 'Dense Heavy Downpour Atmosphere',
      };

    // Daytime storm
    case 'storm_day':
      return {
        background: 'radial-gradient(ellipse at 50% 0%, #312E81 0%, #1E1B4B 42%, #0B0E1B 80%, #02040A 100%)',
        ambientGlow: 'radial-gradient(circle at 50% 20%, rgba(129, 140, 248, 0.18) 0%, transparent 65%)',
        skyTone: 'day-overcast',
        hasSun: false,
        hasMoon: false,
        hasStars: false,
        cloudCoverage: 'storm',
        cloudTone: 'storm',
        rainIntensity: 'heavy',
        hasLightning: true,
        hasFog: false,
        hasSnow: false,
        description: 'Dramatic Thunderstorm Sky with Ambient Lightning',
      };

    // Daytime fog
    case 'foggy_day':
      return {
        background: 'radial-gradient(ellipse at 50% 10%, #374151 0%, #1F2937 45%, #111827 75%, #030712 100%)',
        ambientGlow: 'radial-gradient(circle at 50% 30%, rgba(209, 213, 219, 0.12) 0%, transparent 65%)',
        skyTone: 'day-overcast',
        hasSun: false,
        hasMoon: false,
        hasStars: false,
        cloudCoverage: 'moderate',
        cloudTone: 'slate',
        rainIntensity: 'none',
        hasLightning: false,
        hasFog: true,
        hasSnow: false,
        description: 'Atmospheric Haze & Fog Layers',
      };

    // Daytime snow
    case 'snow_day':
      return {
        background: 'radial-gradient(ellipse at 50% 0%, #2563EB 0%, #1E3A5F 45%, #0F172A 80%, #030712 100%)',
        ambientGlow: 'radial-gradient(circle at 50% 20%, rgba(186, 230, 253, 0.18) 0%, transparent 65%)',
        skyTone: 'day-overcast',
        hasSun: false,
        hasMoon: false,
        hasStars: false,
        cloudCoverage: 'moderate',
        cloudTone: 'bright',
        rainIntensity: 'none',
        hasLightning: false,
        hasFog: false,
        hasSnow: true,
        description: 'Drifting Snowflakes & Winter Chill Sky',
      };

    // Night clear
    case 'clear_night':
      return {
        background: 'radial-gradient(ellipse at 50% -10%, #0F172A 0%, #080D1A 45%, #030611 80%, #010308 100%)',
        ambientGlow: 'radial-gradient(circle at 75% 15%, rgba(147, 197, 253, 0.14) 0%, rgba(99, 102, 241, 0.06) 40%, transparent 70%)',
        skyTone: 'night-clear',
        hasSun: false,
        hasMoon: true,
        hasStars: true,
        cloudCoverage: 'none',
        cloudTone: 'night',
        rainIntensity: 'none',
        hasLightning: false,
        hasFog: false,
        hasSnow: false,
        description: 'Deep Celestial Night Sky with Glowing Moon & Stars',
      };

    // Night partly cloudy
    case 'partly_cloudy_night':
      return {
        background: 'radial-gradient(ellipse at 50% -10%, #0F172A 0%, #0A1020 48%, #030611 82%, #010308 100%)',
        ambientGlow: 'radial-gradient(circle at 70% 18%, rgba(147, 197, 253, 0.12) 0%, transparent 60%)',
        skyTone: 'night-clear',
        hasSun: false,
        hasMoon: true,
        hasStars: true,
        cloudCoverage: 'light',
        cloudTone: 'night',
        rainIntensity: 'none',
        hasLightning: false,
        hasFog: false,
        hasSnow: false,
        description: 'Translucent Nocturnal Clouds Drifting Across the Moon',
      };

    // Night cloudy
    case 'cloudy_night':
      return {
        background: 'radial-gradient(ellipse at 50% 0%, #1E293B 0%, #0F172A 48%, #040813 85%, #010206 100%)',
        ambientGlow: 'radial-gradient(circle at 65% 20%, rgba(147, 197, 253, 0.08) 0%, transparent 50%)',
        skyTone: 'night-clear',
        hasSun: false,
        hasMoon: true,
        hasStars: false,
        cloudCoverage: 'heavy',
        cloudTone: 'night',
        rainIntensity: 'none',
        hasLightning: false,
        hasFog: false,
        hasSnow: false,
        description: 'Overcast Night Atmosphere with Diffused Lunar Glow',
      };

    // Night rain
    case 'rain_night':
      return {
        background: 'radial-gradient(ellipse at 50% 0%, #111D33 0%, #0B1324 48%, #030712 85%, #000000 100%)',
        ambientGlow: 'radial-gradient(circle at 70% 18%, rgba(56, 189, 248, 0.1) 0%, transparent 55%)',
        skyTone: 'night-clear',
        hasSun: false,
        hasMoon: true,
        hasStars: false,
        cloudCoverage: 'moderate',
        cloudTone: 'night',
        rainIntensity: 'light',
        hasLightning: false,
        hasFog: false,
        hasSnow: false,
        description: 'Rain Falling Under a Glowing Night Sky',
      };

    // Night heavy rain
    case 'heavy_rain_night':
      return {
        background: 'radial-gradient(ellipse at 50% 0%, #0F172A 0%, #070B16 50%, #010207 88%, #000000 100%)',
        ambientGlow: 'radial-gradient(circle at 50% 20%, rgba(56, 189, 248, 0.07) 0%, transparent 50%)',
        skyTone: 'night-storm',
        hasSun: false,
        hasMoon: false,
        hasStars: false,
        cloudCoverage: 'heavy',
        cloudTone: 'storm',
        rainIntensity: 'heavy',
        hasLightning: false,
        hasFog: false,
        hasSnow: false,
        description: 'Nocturnal Torrential Rain Atmosphere',
      };

    // Night storm
    case 'storm_night':
      return {
        background: 'radial-gradient(ellipse at 50% 0%, #2E1065 0%, #1E1B4B 42%, #050714 82%, #000000 100%)',
        ambientGlow: 'radial-gradient(circle at 50% 20%, rgba(168, 85, 247, 0.16) 0%, transparent 60%)',
        skyTone: 'night-storm',
        hasSun: false,
        hasMoon: false,
        hasStars: false,
        cloudCoverage: 'storm',
        cloudTone: 'storm',
        rainIntensity: 'heavy',
        hasLightning: true,
        hasFog: false,
        hasSnow: false,
        description: 'Midnight Thunderstorm with Atmospheric Lighting',
      };

    // Night fog
    case 'foggy_night':
      return {
        background: 'radial-gradient(ellipse at 50% 0%, #1F2937 0%, #111827 50%, #030712 85%, #000000 100%)',
        ambientGlow: 'radial-gradient(circle at 50% 30%, rgba(156, 163, 175, 0.08) 0%, transparent 60%)',
        skyTone: 'night-clear',
        hasSun: false,
        hasMoon: true,
        hasStars: false,
        cloudCoverage: 'moderate',
        cloudTone: 'night',
        rainIntensity: 'none',
        hasLightning: false,
        hasFog: true,
        hasSnow: false,
        description: 'Nocturnal Mist & Fog Inversion Atmosphere',
      };

    // Night snow
    case 'snow_night':
      return {
        background: 'radial-gradient(ellipse at 50% 0%, #1E293B 0%, #0F172A 48%, #030712 85%, #000000 100%)',
        ambientGlow: 'radial-gradient(circle at 70% 18%, rgba(186, 230, 253, 0.12) 0%, transparent 60%)',
        skyTone: 'night-clear',
        hasSun: false,
        hasMoon: true,
        hasStars: true,
        cloudCoverage: 'light',
        cloudTone: 'night',
        rainIntensity: 'none',
        hasLightning: false,
        hasFog: false,
        hasSnow: true,
        description: 'Serene Night Snowfall Atmosphere',
      };

    // Sunrise clear
    case 'sunrise_clear':
      return {
        background: 'radial-gradient(ellipse at 50% 80%, #EA580C 0%, #B45309 25%, #431407 50%, #1E1B4B 75%, #0F172A 100%)',
        ambientGlow: 'radial-gradient(circle at 50% 85%, rgba(251, 146, 60, 0.35) 0%, rgba(244, 63, 94, 0.18) 35%, transparent 70%)',
        skyTone: 'sunrise',
        hasSun: true,
        sunVariant: 'sunrise',
        hasMoon: false,
        hasStars: true,
        cloudCoverage: 'none',
        cloudTone: 'golden',
        rainIntensity: 'none',
        hasLightning: false,
        hasFog: false,
        hasSnow: false,
        description: 'Golden Dawn Horizon & Morning Transition Atmosphere',
      };

    // Sunrise cloudy
    case 'sunrise_cloudy':
      return {
        background: 'radial-gradient(ellipse at 50% 75%, #C2410C 0%, #7C2D12 25%, #312E81 55%, #0F172A 100%)',
        ambientGlow: 'radial-gradient(circle at 50% 80%, rgba(251, 146, 60, 0.25) 0%, transparent 65%)',
        skyTone: 'sunrise',
        hasSun: true,
        sunVariant: 'sunrise',
        hasMoon: false,
        hasStars: false,
        cloudCoverage: 'moderate',
        cloudTone: 'golden',
        rainIntensity: 'none',
        hasLightning: false,
        hasFog: false,
        hasSnow: false,
        description: 'Morning Clouds Lit with Amber Dawn Light',
      };

    // Sunrise rain
    case 'sunrise_rain':
      return {
        background: 'radial-gradient(ellipse at 50% 70%, #9A3412 0%, #3730A3 40%, #0F172A 100%)',
        ambientGlow: 'radial-gradient(circle at 50% 75%, rgba(249, 115, 22, 0.2) 0%, transparent 60%)',
        skyTone: 'sunrise',
        hasSun: false,
        hasMoon: false,
        hasStars: false,
        cloudCoverage: 'heavy',
        cloudTone: 'dusk',
        rainIntensity: 'light',
        hasLightning: false,
        hasFog: false,
        hasSnow: false,
        description: 'Morning Dawn Showers Atmosphere',
      };

    // Sunset clear
    case 'sunset_clear':
      return {
        background: 'radial-gradient(ellipse at 50% 85%, #C2410C 0%, #991B1B 25%, #4C1D95 52%, #1E1B4B 75%, #090D1A 100%)',
        ambientGlow: 'radial-gradient(circle at 50% 85%, rgba(249, 115, 22, 0.38) 0%, rgba(236, 72, 153, 0.2) 40%, transparent 70%)',
        skyTone: 'sunset',
        hasSun: true,
        sunVariant: 'sunset',
        hasMoon: false,
        hasStars: false,
        cloudCoverage: 'none',
        cloudTone: 'dusk',
        rainIntensity: 'none',
        hasLightning: false,
        hasFog: false,
        hasSnow: false,
        description: 'Warm Sunset Glow & Twilight Transition Atmosphere',
      };

    // Sunset cloudy
    case 'sunset_cloudy':
      return {
        background: 'radial-gradient(ellipse at 50% 80%, #9A3412 0%, #701A75 30%, #312E81 60%, #090D1A 100%)',
        ambientGlow: 'radial-gradient(circle at 50% 80%, rgba(251, 146, 60, 0.28) 0%, transparent 65%)',
        skyTone: 'sunset',
        hasSun: true,
        sunVariant: 'sunset',
        hasMoon: false,
        hasStars: false,
        cloudCoverage: 'moderate',
        cloudTone: 'dusk',
        rainIntensity: 'none',
        hasLightning: false,
        hasFog: false,
        hasSnow: false,
        description: 'Dusk Clouds Illuminated by Golden-Violet Sunset Light',
      };

    // Sunset rain
    case 'sunset_rain':
      return {
        background: 'radial-gradient(ellipse at 50% 75%, #7C2D12 0%, #4C1D95 40%, #0F172A 80%, #030712 100%)',
        ambientGlow: 'radial-gradient(circle at 50% 75%, rgba(249, 115, 22, 0.2) 0%, transparent 60%)',
        skyTone: 'sunset',
        hasSun: false,
        hasMoon: false,
        hasStars: false,
        cloudCoverage: 'heavy',
        cloudTone: 'dusk',
        rainIntensity: 'light',
        hasLightning: false,
        hasFog: false,
        hasSnow: false,
        description: 'Evening Sunset Rain Atmosphere',
      };

    default:
      return {
        background: 'radial-gradient(ellipse at 50% 0%, #1E3A5F 0%, #0F1E36 45%, #05070A 100%)',
        ambientGlow: 'radial-gradient(circle at 50% 20%, rgba(56, 189, 248, 0.15) 0%, transparent 60%)',
        skyTone: 'day-clear',
        hasSun: true,
        hasMoon: false,
        hasStars: false,
        cloudCoverage: 'light',
        cloudTone: 'bright',
        rainIntensity: 'none',
        hasLightning: false,
        hasFog: false,
        hasSnow: false,
        description: 'Atmospheric Weather Sky',
      };
  }
}
