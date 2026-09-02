import React from 'react';
import {
  Sun,
  CloudSun,
  Cloud,
  CloudRain,
  CloudLightning,
  CloudFog,
  Snowflake,
  Activity,
  Car,
  Luggage,
  HeartPulse,
  Users,
  Sprout,
  Waves,
} from 'lucide-react';
import { WeatherCondition, PersonaId } from '../types';

export const WeatherIcon: React.FC<{
  condition: WeatherCondition;
  className?: string;
  size?: number;
}> = ({ condition, className = 'w-6 h-6', size = 24 }) => {
  switch (condition) {
    case 'sunny':
      return <Sun className={`text-amber-400 ${className}`} size={size} />;
    case 'partly-cloudy':
      return <CloudSun className={`text-sky-300 ${className}`} size={size} />;
    case 'cloudy':
      return <Cloud className={`text-slate-300 ${className}`} size={size} />;
    case 'rain':
      return <CloudRain className={`text-sky-400 ${className}`} size={size} />;
    case 'heavy-rain':
      return <CloudRain className={`text-blue-400 ${className}`} size={size} />;
    case 'thunderstorm':
      return <CloudLightning className={`text-indigo-400 ${className}`} size={size} />;
    case 'foggy':
      return <CloudFog className={`text-amber-300/80 ${className}`} size={size} />;
    case 'snow':
      return <Snowflake className={`text-sky-200 ${className}`} size={size} />;
    default:
      return <Sun className={`text-amber-400 ${className}`} size={size} />;
  }
};

export const PersonaIcon: React.FC<{
  personaId: PersonaId;
  className?: string;
  size?: number;
}> = ({ personaId, className = 'w-5 h-5', size = 20 }) => {
  switch (personaId) {
    case 'fitness':
      return <Activity className={className} size={size} />;
    case 'commuter':
      return <Car className={className} size={size} />;
    case 'traveler':
      return <Luggage className={className} size={size} />;
    case 'health':
      return <HeartPulse className={className} size={size} />;
    case 'family':
      return <Users className={className} size={size} />;
    case 'agriculture':
      return <Sprout className={className} size={size} />;
    case 'beach':
      return <Waves className={className} size={size} />;
    default:
      return <Activity className={className} size={size} />;
  }
};
