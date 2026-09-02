import { WeatherData, UserLocationState, LocationSharingSession } from '../types';
import { DEMO_SCENARIOS } from '../data/weatherData';

export interface DemoLocationPreset {
  id: string;
  name: string;
  region: string;
  country: string;
  latitude: number;
  longitude: number;
  highlight: string;
  scenarioId?: string;
}

export const DEMO_LOCATION_PRESETS: DemoLocationPreset[] = [
  {
    id: 'loc-aurangabad',
    name: 'Aurangabad',
    region: 'Maharashtra',
    country: 'India',
    latitude: 19.8762,
    longitude: 75.3433,
    highlight: 'Historical heritage city, pleasant sunshine with moderate humidity',
    scenarioId: 'scenario-sunny',
  },
  {
    id: 'loc-mumbai',
    name: 'Mumbai',
    region: 'Maharashtra',
    country: 'India',
    latitude: 19.0760,
    longitude: 72.8777,
    highlight: 'Coastal metropolis, active monsoon rain bands with high tide alerts',
    scenarioId: 'scenario-rain',
  },
  {
    id: 'loc-pune',
    name: 'Pune',
    region: 'Maharashtra',
    country: 'India',
    latitude: 18.5204,
    longitude: 73.8567,
    highlight: 'Hill plateau elevation, cool evening breezes & moderate UV',
    scenarioId: 'scenario-sunny',
  },
  {
    id: 'loc-delhi',
    name: 'Delhi',
    region: 'NCR',
    country: 'India',
    latitude: 28.6139,
    longitude: 77.2090,
    highlight: 'Severe winter particulate AQI 320 spike, requires N95 precautions',
    scenarioId: 'scenario-aqi',
  },
  {
    id: 'loc-bengaluru',
    name: 'Bengaluru',
    region: 'Karnataka',
    country: 'India',
    latitude: 12.9716,
    longitude: 77.5946,
    highlight: 'Tech capital, optimal 24°C garden weather with 95/100 fitness score',
    scenarioId: 'scenario-sunny',
  },
  {
    id: 'loc-london',
    name: 'London',
    region: 'England',
    country: 'United Kingdom',
    latitude: 51.5074,
    longitude: -0.1278,
    highlight: 'Temperate European overcast with light drizzle & brisk breeze',
    scenarioId: 'scenario-london',
  },
  {
    id: 'loc-tokyo',
    name: 'Tokyo',
    region: 'Kanto',
    country: 'Japan',
    latitude: 35.6762,
    longitude: 139.6503,
    highlight: 'Clear skies, vibrant urban micro-climate and clean maritime airflow',
  },
  {
    id: 'loc-newyork',
    name: 'New York',
    region: 'NY',
    country: 'United States',
    latitude: 40.7128,
    longitude: -74.0060,
    highlight: 'Atlantic coastal weather with dynamic seasonal shifts',
  },
];

/**
 * Obtain coordinates from the browser's Geolocation API.
 */
export async function getBrowserCoordinates(): Promise<{
  latitude: number;
  longitude: number;
  accuracy: number;
}> {
  if (!navigator.geolocation) {
    throw new Error('Geolocation is not supported by your browser.');
  }

  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
      },
      (error) => {
        let msg = 'Location access is unavailable.';
        if (error.code === error.PERMISSION_DENIED) {
          msg = 'Location access is unavailable. Please grant location permissions or select a location manually.';
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          msg = 'GPS signal is currently unavailable.';
        } else if (error.code === error.TIMEOUT) {
          msg = 'Location request timed out.';
        }
        reject(new Error(msg));
      },
      {
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 30000,
      }
    );
  });
}

/**
 * Reverse geocode coordinates to location name via backend
 */
export async function reverseGeocodeCoordinates(
  lat: number,
  lon: number
): Promise<{ locationName: string; cityName: string; region: string; country: string }> {
  try {
    const res = await fetch(`/api/location/reverse-geocode?lat=${lat}&lon=${lon}`);
    if (res.ok) {
      const data = await res.json();
      return {
        locationName: data.locationName || `${lat.toFixed(2)}°N, ${lon.toFixed(2)}°E`,
        cityName: data.cityName || 'Current Location',
        region: data.region || '',
        country: data.country || 'India',
      };
    }
  } catch (err) {
    console.warn('Backend reverse geocode failed, using fallback calculation:', err);
  }

  // Find closest demo preset if backend network fails
  let closest = DEMO_LOCATION_PRESETS[0];
  let minD = Infinity;
  for (const preset of DEMO_LOCATION_PRESETS) {
    const d = Math.hypot(preset.latitude - lat, preset.longitude - lon);
    if (d < minD) {
      minD = d;
      closest = preset;
    }
  }

  if (minD < 0.6) {
    return {
      locationName: `${closest.name}, ${closest.region}`,
      cityName: closest.name,
      region: closest.region,
      country: closest.country,
    };
  }

  return {
    locationName: `Zone (${lat.toFixed(2)}°N, ${lon.toFixed(2)}°E)`,
    cityName: `Zone ${lat.toFixed(2)}°`,
    region: '',
    country: 'Current Area',
  };
}

/**
 * Fetch dynamic weather data for given coordinates
 */
export async function fetchWeatherForCoordinates(
  lat: number,
  lon: number,
  name: string,
  country: string
): Promise<WeatherData> {
  try {
    const res = await fetch(
      `/api/location/weather?lat=${lat}&lon=${lon}&name=${encodeURIComponent(name)}&country=${encodeURIComponent(country)}`
    );
    if (res.ok) {
      const weatherData = await res.json();
      weatherData.coordinates = {
        latitude: lat,
        longitude: lon,
        isLiveGPS: true,
      };
      return weatherData;
    }
  } catch (err) {
    console.warn('Live weather API fetch failed, building from matched scenario:', err);
  }

  // Fallback to closest scenario
  const matched = DEMO_SCENARIOS[0].scenarioData;
  return {
    ...matched,
    locationName: name,
    country,
    coordinates: {
      latitude: lat,
      longitude: lon,
      isLiveGPS: true,
    },
    lastUpdated: 'Just now',
  };
}

/**
 * Acquire live GPS location and full weather package in one step
 */
export async function fetchLiveCurrentLocationWeather(): Promise<{
  userLocation: UserLocationState;
  weatherData: WeatherData;
}> {
  const coords = await getBrowserCoordinates();
  const geo = await reverseGeocodeCoordinates(coords.latitude, coords.longitude);
  const weatherData = await fetchWeatherForCoordinates(
    coords.latitude,
    coords.longitude,
    geo.locationName,
    geo.country
  );

  const now = new Date();
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const userLocation: UserLocationState = {
    latitude: coords.latitude,
    longitude: coords.longitude,
    accuracy: coords.accuracy,
    locationName: geo.locationName,
    country: geo.country,
    region: geo.region,
    isLiveGPS: true,
    isLiveSharingActive: false,
    permissionStatus: 'granted',
    lastUpdatedTime: `Updated at ${timeStr}`,
    rawTimestamp: Date.now(),
    error: null,
  };

  return { userLocation, weatherData };
}

/**
 * Formats a clean, professional shareable text message
 */
export function generateShareMessage(
  locationName: string,
  weather: WeatherData,
  lat?: number | null,
  lon?: number | null,
  shareUrl?: string
): string {
  const coordStr =
    lat !== null && lat !== undefined && lon !== null && lon !== undefined
      ? `(${lat.toFixed(4)}°N, ${lon.toFixed(4)}°E)`
      : '';

  const mapsUrl =
    lat !== null && lat !== undefined && lon !== null && lon !== undefined
      ? `https://maps.google.com/?q=${lat},${lon}`
      : '';

  return [
    `📍 ClimaIQ Live Weather & Location Update`,
    `Location: ${locationName} ${coordStr}`,
    `Updated: Just now`,
    `🌡️ Temperature: ${weather.currentTemp}°C (Feels like ${weather.feelsLike}°C)`,
    `🌤️ Condition: ${weather.conditionText}`,
    `🍃 Air Quality: AQI ${weather.environment.aqi} (${weather.environment.aqiStatus})`,
    `☀️ UV Index: ${weather.environment.uvIndex} | 💨 Wind: ${weather.environment.windSpeed} km/h`,
    `💡 Advisory: ${weather.summary}`,
    shareUrl ? `🔗 Live Intelligence Dashboard: ${shareUrl}` : mapsUrl ? `🗺️ View Map: ${mapsUrl}` : '',
  ]
    .filter(Boolean)
    .join('\n');
}

/**
 * Native or fallback share handler
 */
export async function executeLocationShare(
  locationName: string,
  weather: WeatherData,
  lat?: number | null,
  lon?: number | null,
  shareUrl?: string
): Promise<{ success: boolean; method: 'native' | 'clipboard' }> {
  const text = generateShareMessage(locationName, weather, lat, lon, shareUrl);

  if (navigator.share) {
    try {
      await navigator.share({
        title: `ClimaIQ: ${locationName} Weather & Location`,
        text,
        url: shareUrl || window.location.href,
      });
      return { success: true, method: 'native' };
    } catch (err: any) {
      if (err.name === 'AbortError') {
        return { success: true, method: 'native' };
      }
      // Continue to clipboard fallback
    }
  }

  try {
    await navigator.clipboard.writeText(text);
    return { success: true, method: 'clipboard' };
  } catch (clipErr) {
    console.error('Clipboard write failed:', clipErr);
    return { success: false, method: 'clipboard' };
  }
}
