import {
  AlertItem,
  ExplainabilityFactor,
  FitnessActivityType,
  PackingItem,
  PersonalizedInsight,
  PersonaId,
  WeatherData,
} from '../types';

export function calculatePersonalizedInsight(
  personaId: PersonaId,
  data: WeatherData,
  activityType: FitnessActivityType = 'running'
): PersonalizedInsight {
  const { currentTemp, feelsLike, highTemp, lowTemp, hourly, environment, marine, agriculture, commute } = data;

  switch (personaId) {
    case 'fitness': {
      // Dynamic Activity Weighting for Outdoor Fitness
      // Determine optimal hourly slot based on selected workout type
      let bestSlot = '6:00 PM – 7:15 PM';
      let bestScore = 0;
      let bestSlotTemp = currentTemp;
      let bestSlotRain = 10;
      let bestSlotUV = environment.uvIndex;
      let bestSlotWind = environment.windSpeed;
      let bestSlotAQI = environment.aqi;

      // Activity-specific parameters
      const getTargetTempRange = () => {
        switch (activityType) {
          case 'running': return { idealMin: 14, idealMax: 22, maxLimit: 30 };
          case 'walking': return { idealMin: 16, idealMax: 26, maxLimit: 34 };
          case 'cycling': return { idealMin: 15, idealMax: 25, maxLimit: 32 };
          case 'workout': return { idealMin: 17, idealMax: 24, maxLimit: 31 };
        }
      };
      const { idealMin, idealMax, maxLimit } = getTargetTempRange();

      for (let i = 0; i < hourly.length - 1; i++) {
        const h = hourly[i];
        let score = 100;

        // Temperature penalty
        if (h.temp > idealMax) score -= (h.temp - idealMax) * (activityType === 'running' ? 5.5 : 4);
        if (h.temp < idealMin) score -= (idealMin - h.temp) * 3;
        if (h.temp >= maxLimit) score -= 20;

        // Rain penalty
        const rainMultiplier = activityType === 'cycling' ? 0.9 : activityType === 'running' ? 0.8 : 0.5;
        if (h.rainProb > 15) score -= (h.rainProb - 15) * rainMultiplier;

        // UV penalty
        if (h.uvIndex > 5) score -= (h.uvIndex - 5) * 5;

        // Wind penalty (higher for cycling)
        if (activityType === 'cycling' && h.windSpeed > 20) {
          score -= (h.windSpeed - 20) * 1.5;
        } else if (h.windSpeed > 35) {
          score -= (h.windSpeed - 35) * 0.8;
        }

        // AQI penalty
        if (h.aqi > 100) score -= (h.aqi - 100) * 0.45;

        score = Math.max(10, Math.min(100, Math.round(score)));

        if (score > bestScore) {
          bestScore = score;
          bestSlot = `${h.time} – ${hourly[i + 1].time}`;
          bestSlotTemp = h.temp;
          bestSlotRain = h.rainProb;
          bestSlotUV = h.uvIndex;
          bestSlotWind = h.windSpeed;
          bestSlotAQI = h.aqi;
        }
      }

      const overallFitnessScore = bestScore > 0 ? bestScore : 78;
      let actionType: 'positive' | 'warning' | 'caution' | 'alert' = 'positive';
      let recommendation = `Optimal window for ${activityType}. Comfortable air temperature and safe environmental conditions.`;

      if (environment.aqi > 150) {
        actionType = 'alert';
        recommendation = `High AQI (${environment.aqi}). Shift high-intensity cardio indoors or onto a treadmill.`;
      } else if (currentTemp > 35) {
        actionType = 'warning';
        recommendation = `Severe heat stress (${currentTemp}°C). Postpone outdoor ${activityType} until sunset cooling.`;
      } else if (bestSlotRain > 60) {
        actionType = 'caution';
        recommendation = `Rain showers likely (${bestSlotRain}%). Complete ${activityType} in the early dry window or carry a water-resistant shell.`;
      } else if (overallFitnessScore < 60) {
        actionType = 'caution';
        recommendation = `Conditions are suboptimal for ${activityType}. Maintain high hydration and monitor exertion.`;
      }

      const activityNameFormatted =
        activityType === 'running' ? 'Running' :
        activityType === 'walking' ? 'Walking' :
        activityType === 'cycling' ? 'Cycling' : 'Outdoor Workout';

      const explainabilityFactors: ExplainabilityFactor[] = [
        {
          factor: `Temperature: ${bestSlotTemp}°C`,
          status: bestSlotTemp <= idealMax && bestSlotTemp >= idealMin ? 'good' : bestSlotTemp > maxLimit ? 'warning' : 'caution',
          detail: bestSlotTemp <= idealMax ? 'Comfortable thermal zone' : 'Elevated heat',
        },
        {
          factor: `UV Index: ${bestSlotUV <= 3 ? 'Low' : bestSlotUV <= 6 ? 'Moderate' : 'High (' + bestSlotUV + ')'}`,
          status: bestSlotUV <= 4 ? 'good' : bestSlotUV <= 7 ? 'caution' : 'warning',
          detail: bestSlotUV <= 4 ? 'Low sun radiation' : 'High sunburn risk',
        },
        {
          factor: `Rain Probability: ${bestSlotRain}%`,
          status: bestSlotRain <= 20 ? 'good' : bestSlotRain <= 50 ? 'caution' : 'warning',
          detail: bestSlotRain <= 20 ? 'Dry conditions' : 'Precipitation expected',
        },
        {
          factor: `Wind: ${bestSlotWind} km/h`,
          status: bestSlotWind <= 20 ? 'good' : bestSlotWind <= 32 ? 'caution' : 'warning',
          detail: bestSlotWind <= 20 ? 'Calm breeze' : 'Gusty crosswinds',
        },
        {
          factor: `Air Quality: AQI ${bestSlotAQI}`,
          status: bestSlotAQI <= 50 ? 'good' : bestSlotAQI <= 100 ? 'caution' : 'warning',
          detail: bestSlotAQI <= 100 ? 'Safe air quality' : 'Elevated particulates',
        },
      ];

      return {
        personaId: 'fitness',
        activityType,
        title: `🏃 ${activityNameFormatted} Conditions`,
        highlightText: bestSlot,
        score: overallFitnessScore,
        scoreLabel: `${activityNameFormatted} Score`,
        statusBadge:
          actionType === 'alert' || overallFitnessScore < 35
            ? 'HIGH RISK'
            : overallFitnessScore >= 75
            ? 'GOOD TO GO'
            : overallFitnessScore >= 55
            ? 'CAUTION'
            : 'NOT IDEAL',
        primaryWindow: bestSlot,
        bullets: [
          `Optimal Window: ${bestSlot}`,
          `Target Temp: ${bestSlotTemp}°C (Feels like ${Math.round(bestSlotTemp + (environment.humidity > 60 ? 2 : 0))}°C)`,
          `Rain Probability: ${bestSlotRain}%`,
          `Air Quality: AQI ${bestSlotAQI} (${environment.aqiStatus})`,
        ],
        explainabilityFactors,
        subScores: [
          { label: 'Thermal Comfort', score: Math.max(10, Math.min(100, Math.round(100 - Math.abs(bestSlotTemp - 20) * 4))) },
          { label: 'Air Purity', score: Math.max(10, Math.min(100, Math.round(100 - (bestSlotAQI / 2)))) },
          { label: 'Dryness Index', score: Math.max(10, Math.min(100, Math.round(100 - bestSlotRain))) },
        ],
        recommendation,
        actionType,
      };
    }

    case 'health': {
      const aqi = environment.aqi;
      let score = 95;
      let actionType: 'positive' | 'warning' | 'caution' | 'alert' = 'positive';
      let healthRisk = 'Low Health Risk';

      if (aqi > 200) {
        score = 25;
        actionType = 'alert';
        healthRisk = 'Hazardous for All Groups';
      } else if (aqi > 150) {
        score = 45;
        actionType = 'alert';
        healthRisk = 'Unhealthy for Sensitive Users';
      } else if (aqi > 100) {
        score = 65;
        actionType = 'warning';
        healthRisk = 'Moderate Air Quality Concern';
      } else if (environment.uvIndex > 8) {
        score = 72;
        actionType = 'caution';
        healthRisk = 'Very High UV Radiation';
      } else if (currentTemp > 38 || feelsLike > 40) {
        score = 60;
        actionType = 'warning';
        healthRisk = 'Severe Heat Exhaustion Risk';
      }

      let recommendation = 'Environmental conditions are within healthy, safe thresholds for outdoor activity.';
      if (aqi > 150) {
        recommendation = 'Consider reducing prolonged outdoor strenuous activity today and keep windows closed.';
      } else if (environment.uvIndex >= 8) {
        recommendation = 'UV radiation is intense. Apply broad-spectrum SPF 50+ sunscreen, wear UV400 sunglasses and stay shaded.';
      } else if (currentTemp >= 36) {
        recommendation = 'High ambient heat. Maintain electrolyte hydration and avoid direct sun exposure between 12 PM and 4 PM.';
      }

      const explainabilityFactors: ExplainabilityFactor[] = [
        {
          factor: `Air Quality: AQI ${aqi}`,
          status: aqi <= 50 ? 'good' : aqi <= 100 ? 'caution' : 'warning',
          detail: environment.aqiStatus,
        },
        {
          factor: `Particulate PM2.5: ${environment.pm25} µg/m³`,
          status: environment.pm25 <= 25 ? 'good' : environment.pm25 <= 50 ? 'caution' : 'warning',
          detail: environment.pm25 > 35 ? 'Elevated micro-particulates' : 'Clean baseline',
        },
        {
          factor: `UV Index: ${environment.uvIndex} (${environment.uvStatus})`,
          status: environment.uvIndex <= 5 ? 'good' : environment.uvIndex <= 7 ? 'caution' : 'warning',
          detail: environment.uvIndex >= 8 ? 'High burn risk' : 'Safe UV exposure',
        },
        {
          factor: `Humidity: ${environment.humidity}%`,
          status: environment.humidity >= 40 && environment.humidity <= 65 ? 'good' : 'caution',
          detail: environment.humidity > 70 ? 'High moisture/mold risk' : 'Comfortable',
        },
        {
          factor: `Thermal Stress: ${currentTemp}°C (Feels ${feelsLike}°C)`,
          status: feelsLike <= 32 && feelsLike >= 15 ? 'good' : feelsLike > 38 ? 'warning' : 'caution',
          detail: feelsLike > 36 ? 'Heat exhaustion potential' : 'Nominal comfort',
        },
      ];

      return {
        personaId: 'health',
        title: '🫁 Environmental Health Insight',
        highlightText: `AQI ${aqi} · ${environment.aqiStatus}`,
        score,
        scoreLabel: 'Health Risk Index',
        statusBadge:
          actionType === 'alert' || aqi > 150
            ? 'HIGH RISK'
            : aqi <= 50 && environment.uvIndex <= 5
            ? 'GOOD TO GO'
            : aqi <= 100
            ? 'CAUTION'
            : 'NOT IDEAL',
        bullets: [
          `Air Quality Index: AQI ${aqi} (${environment.aqiStatus})`,
          `Fine Particulates: PM2.5 ${environment.pm25} µg/m³ · PM10 ${environment.pm10} µg/m³`,
          `Health Risk Level: ${healthRisk}`,
          `UV Radiation: Index ${environment.uvIndex} (${environment.uvStatus})`,
        ],
        explainabilityFactors,
        subScores: [
          { label: 'Respiratory Safety', score: Math.max(10, Math.min(100, Math.round(100 - (aqi * 0.4)))) },
          { label: 'UV Safety', score: Math.max(10, Math.min(100, Math.round(100 - (environment.uvIndex * 8)))) },
          { label: 'Thermal Comfort', score: Math.max(10, Math.min(100, Math.round(100 - Math.abs(currentTemp - 23) * 4))) },
        ],
        disclaimer: 'Environmental risk index only. Not medical diagnosis or treatment.',
        recommendation,
        actionType,
      };
    }

    case 'beach': {
      const wave = marine?.waveHeight || (data.condition === 'thunderstorm' ? 2.6 : data.condition === 'heavy-rain' ? 2.1 : 0.8);
      const waterT = marine?.waterTemp || Math.min(29, Math.max(20, currentTemp - 2));
      const beachScore = marine?.beachSuitabilityScore || (data.condition === 'thunderstorm' ? 22 : data.condition === 'rain' ? 45 : Math.max(40, 100 - (wave > 1.5 ? (wave - 1.5) * 30 : 0) - (environment.windSpeed > 25 ? 20 : 0)));
      const surfScore = marine?.surfSuitabilityScore || (wave >= 1.2 && wave <= 2.2 && environment.windSpeed < 25 ? 88 : wave > 2.5 ? 40 : 65);
      const ripRisk = marine?.ripCurrentRisk || (wave > 2.0 || environment.windSpeed > 35 ? 'High' : wave > 1.2 ? 'Moderate' : 'Low');
      const actionType = ripRisk === 'High' || data.condition === 'thunderstorm' ? 'alert' : ripRisk === 'Moderate' || wave > 1.5 ? 'caution' : 'positive';

      let recommendation = 'Suitable for recreational beach activity. Calm coastal water with safe swimming conditions.';
      if (data.condition === 'thunderstorm' || ripRisk === 'High') {
        recommendation = 'Hazardous coastal conditions. Red flag warning: avoid swimming past the break zone due to strong rip currents.';
      } else if (wave > 1.4) {
        recommendation = 'Good wave swell for intermediate surfers. Recreational swimmers should remain in patrolled zones.';
      } else if (environment.uvIndex >= 8) {
        recommendation = 'High solar reflection from sand and water. Reapply water-resistant sunscreen every 90 minutes.';
      }

      const explainabilityFactors: ExplainabilityFactor[] = [
        {
          factor: `Water Temperature: ${waterT}°C`,
          status: waterT >= 24 ? 'good' : 'caution',
          detail: 'Comfortable swimming temperature',
        },
        {
          factor: `Wave Height: ${wave} m`,
          status: wave <= 1.2 ? 'good' : wave <= 2.0 ? 'caution' : 'warning',
          detail: marine?.seaCondition || (wave > 2 ? 'Rough swell' : 'Gentle chop'),
        },
        {
          factor: `Wind: ${environment.windSpeed} km/h ${environment.windDirection}`,
          status: environment.windSpeed <= 20 ? 'good' : environment.windSpeed <= 32 ? 'caution' : 'warning',
          detail: environment.windSpeed <= 20 ? 'Mild onshore breeze' : 'Choppy crosswinds',
        },
        {
          factor: `Rip Current Hazard: ${ripRisk}`,
          status: ripRisk === 'Low' ? 'good' : ripRisk === 'Moderate' ? 'caution' : 'warning',
          detail: ripRisk === 'Low' ? 'Safe swimming breaks' : 'Active rip channels',
        },
        {
          factor: `UV Exposure: ${environment.uvIndex} (${environment.uvStatus})`,
          status: environment.uvIndex <= 6 ? 'good' : 'caution',
          detail: 'Water reflection amplifies UV intensity',
        },
      ];

      return {
        personaId: 'beach',
        title: '🏖️ Beach Conditions & Marine Intelligence',
        highlightText: `${beachScore}/100 · Water: ${waterT}°C`,
        score: beachScore,
        scoreLabel: 'Beach Score',
        statusBadge:
          ripRisk === 'High' || data.condition === 'thunderstorm'
            ? 'HIGH RISK'
            : wave > 1.5 || ripRisk === 'Moderate'
            ? 'CAUTION'
            : beachScore >= 75
            ? 'GOOD TO GO'
            : 'NOT IDEAL',
        bullets: [
          `Water Temperature: ${waterT}°C · Waves: ${wave} m`,
          `Wind: ${environment.windSpeed} km/h ${environment.windDirection}`,
          `Tide: ${marine?.tideTiming?.nextHighTide || 'High Tide 3:45 PM'} (${marine?.tideTiming?.currentTideState || 'Rising'})`,
          `Rip Current Risk: ${ripRisk}`,
        ],
        explainabilityFactors,
        subScores: [
          { label: 'Recreational Swimming', score: beachScore },
          { label: 'Surf Quality', score: surfScore },
          { label: 'Coastal Water Purity', score: 92 },
        ],
        secondaryMetrics: [
          { label: 'Wave Period', value: `${marine?.wavePeriod || 9} sec` },
          { label: 'Tide State', value: `${marine?.tideTiming?.currentTideState || 'Rising'}` },
          { label: 'Sea State', value: `${marine?.seaCondition || 'Moderate'}` },
          { label: 'Data Source', value: 'Live Buoy Telemetry', isSimulated: true },
        ],
        disclaimer: 'Marine buoy and tidal models provided for recreational guidance. Observe local lifeguard flags.',
        recommendation,
        actionType,
      };
    }

    case 'traveler': {
      const rainExpected = hourly.some((h) => h.rainProb > 40) || data.daily[0]?.rainProb > 45;
      const avgRainProb = Math.round(hourly.slice(0, 8).reduce((acc, curr) => acc + curr.rainProb, 0) / 8);
      const isSevere = data.condition === 'thunderstorm' || data.condition === 'heavy-rain';
      const score = Math.max(30, 92 - (rainExpected ? 16 : 0) - (isSevere ? 30 : 0) - (environment.aqi > 100 ? 10 : 0));
      const actionType = isSevere ? 'alert' : rainExpected ? 'caution' : 'positive';

      const packingItems = generateDeterministicPackingList(data.locationName, currentTemp, avgRainProb, data.conditionText);

      let recommendation = 'Favorable sightseeing weather. Pack comfortable walking shoes and light daylight layers.';
      if (isSevere) {
        recommendation = 'Severe precipitation and storms expected. Carry a heavy-duty umbrella, waterproof bag cover, and plan indoor attractions.';
      } else if (rainExpected) {
        recommendation = 'Rain expected today / tomorrow. Carry a compact umbrella and light waterproof jacket.';
      }

      const explainabilityFactors: ExplainabilityFactor[] = [
        {
          factor: `Precipitation Risk: ${rainExpected ? 'Rain Expected (' + avgRainProb + '%)' : 'Low Rain Chance (' + avgRainProb + '%)'}`,
          status: avgRainProb <= 25 ? 'good' : avgRainProb <= 55 ? 'caution' : 'warning',
          detail: rainExpected ? 'Carry waterproof gear' : 'Clear exploring skies',
        },
        {
          factor: `Sightseeing Temp: High ${highTemp}°C / Low ${lowTemp}°C`,
          status: highTemp <= 32 && lowTemp >= 14 ? 'good' : 'caution',
          detail: `Current ${currentTemp}°C`,
        },
        {
          factor: `Daylight Window: ${environment.sunrise} to ${environment.sunset}`,
          status: 'good',
          detail: 'Full exploration daylight',
        },
        {
          factor: `Destination UV Index: ${environment.uvIndex} (${environment.uvStatus})`,
          status: environment.uvIndex <= 6 ? 'good' : 'caution',
          detail: environment.uvIndex > 6 ? 'Pack sunglasses & sunscreen' : 'Mild UV',
        },
      ];

      return {
        personaId: 'traveler',
        title: '🧳 Travel & Sightseeing Insight',
        highlightText: rainExpected ? 'Rain Expected Today / Tomorrow' : 'Prime Sightseeing Weather',
        score,
        scoreLabel: 'Travel Readiness',
        statusBadge: isSevere ? 'HIGH RISK' : rainExpected ? 'CAUTION' : score >= 75 ? 'GOOD TO GO' : 'NOT IDEAL',
        bullets: [
          `Destination Condition: ${data.conditionText}`,
          `Expected Range: ${highTemp}°C / ${lowTemp}°C`,
          `Precipitation Risk: ${rainExpected ? 'Elevated (' + avgRainProb + '%)' : 'Low (' + avgRainProb + '%)'}`,
          `Daylight: ${environment.sunrise} – ${environment.sunset}`,
        ],
        explainabilityFactors,
        packingList: packingItems,
        subScores: [
          { label: 'Walking Comfort', score: Math.max(10, Math.min(100, Math.round(100 - (avgRainProb * 0.7) - Math.abs(currentTemp - 22) * 2))) },
          { label: 'Outdoor Photo Quality', score: isSevere ? 25 : rainExpected ? 60 : 95 },
          { label: 'Transit Reliability', score: isSevere ? 45 : 90 },
        ],
        recommendation,
        actionType,
      };
    }

    case 'family': {
      // School pickup window (3:30 PM - 5:30 PM) and morning dropoff (7:30 AM - 9:00 AM)
      const pickupHours = hourly.filter((h) => h.hour >= 15 && h.hour <= 18);
      const maxPickupRain = pickupHours.length > 0 ? Math.max(...pickupHours.map((h) => h.rainProb)) : 10;
      const rainDuringSchoolPickup = maxPickupRain >= 45;
      const isExtremeHeat = highTemp >= 36;
      const score = Math.max(30, 96 - (rainDuringSchoolPickup ? 28 : 0) - (isExtremeHeat ? 20 : 0) - (environment.aqi > 100 ? 15 : 0));
      const actionType = rainDuringSchoolPickup || isExtremeHeat ? 'warning' : 'positive';

      let recommendation = 'Favorable weather for school commute and afternoon outdoor playground activities.';
      if (rainDuringSchoolPickup) {
        recommendation = 'Rain expected during school pickup (4:00 PM – 5:30 PM). Allow additional travel time and equip kids with raincoats & gum boots.';
      } else if (isExtremeHeat) {
        recommendation = 'High afternoon temperatures. Ensure children drink water frequently and schedule playground play after 5:30 PM.';
      }

      const explainabilityFactors: ExplainabilityFactor[] = [
        {
          factor: `School Pickup Window (3:30–5:30 PM): ${maxPickupRain}% Rain`,
          status: maxPickupRain <= 20 ? 'good' : maxPickupRain <= 50 ? 'caution' : 'warning',
          detail: rainDuringSchoolPickup ? 'Monsoon traffic delays' : 'Dry roads',
        },
        {
          factor: `Afternoon Peak Temp: ${highTemp}°C`,
          status: highTemp <= 32 ? 'good' : highTemp <= 36 ? 'caution' : 'warning',
          detail: isExtremeHeat ? 'Sunstroke caution for kids' : 'Pleasant warmth',
        },
        {
          factor: `Outdoor Recess / Play: ${rainDuringSchoolPickup ? 'Indoor advised after 3 PM' : 'Safe for parks'}`,
          status: rainDuringSchoolPickup ? 'caution' : 'good',
          detail: 'Playground ground safety',
        },
        {
          factor: `Kid UV Protection: ${environment.uvIndex > 5 ? 'Sun hat & SPF 50+ needed' : 'Low UV'}`,
          status: environment.uvIndex <= 5 ? 'good' : 'caution',
          detail: `UV Index ${environment.uvIndex}`,
        },
      ];

      return {
        personaId: 'family',
        title: '👨‍👩‍👧 Family Safety & School Commute',
        highlightText: rainDuringSchoolPickup ? 'School Pickup Rain Alert' : 'Safe Outdoor Play Day',
        score,
        scoreLabel: 'Family Safety Score',
        statusBadge:
          environment.aqi > 150
            ? 'HIGH RISK'
            : rainDuringSchoolPickup || isExtremeHeat
            ? 'CAUTION'
            : score >= 75
            ? 'GOOD TO GO'
            : 'NOT IDEAL',
        primaryWindow: '3:30 PM – 5:30 PM Pickup',
        bullets: [
          `School Commute Risk: ${rainDuringSchoolPickup ? 'Elevated (Rain Delays)' : 'Clear & Smooth'}`,
          `Afternoon Temperature: ${highTemp}°C (Feels ${feelsLike}°C)`,
          `Outdoor Play Window: ${rainDuringSchoolPickup ? 'Morning / Indoor after 3 PM' : '4:30 PM – 6:30 PM'}`,
          `Air Purity for Kids: AQI ${environment.aqi} (${environment.aqiStatus})`,
        ],
        explainabilityFactors,
        subScores: [
          { label: 'School Commute Safety', score: Math.max(10, Math.min(100, Math.round(100 - maxPickupRain))) },
          { label: 'Playground Suitability', score: Math.max(10, Math.min(100, Math.round(score))) },
          { label: 'Child Thermal Comfort', score: Math.max(10, Math.min(100, Math.round(100 - Math.abs(currentTemp - 22) * 3))) },
        ],
        recommendation,
        actionType,
      };
    }

    case 'agriculture': {
      const soilMoisture = agriculture?.soilMoisture || 68;
      const rainExpected = agriculture?.expectedRain24h || (hourly.some((h) => h.rainProb > 60) ? 18 : 2);
      const delayHours = agriculture?.irrigationDelayHours || (rainExpected > 12 ? 24 : 0);
      const frostRisk = agriculture?.frostRisk || (lowTemp <= 3 ? 'High' : lowTemp <= 6 ? 'Low' : 'None');
      const et = agriculture?.evapotranspiration || 3.8;
      const score = rainExpected > 15 ? 92 : soilMoisture < 35 ? 50 : 84;
      const actionType = frostRisk === 'High' ? 'alert' : delayHours > 0 ? 'caution' : 'positive';

      let recommendation = 'Proceed with scheduled drip irrigation in early morning hours to maintain root moisture.';
      if (delayHours > 0) {
        recommendation = `Soil moisture: ${soilMoisture}% · Rain expected: ${rainExpected} mm. Consider delaying irrigation for ${delayHours} hours to conserve water and prevent root waterlogging.`;
      } else if (frostRisk === 'High') {
        recommendation = 'Frost hazard tonight (low temperatures near freezing). Deploy crop frost covers and thermal blankets.';
      } else if (soilMoisture < 35) {
        recommendation = 'Soil moisture is low (below 35%). Initiate deep watering cycle before peak midday heat.';
      }

      const explainabilityFactors: ExplainabilityFactor[] = [
        {
          factor: `Soil Moisture: ${soilMoisture}% (Demo Sensor)`,
          status: soilMoisture >= 50 && soilMoisture <= 75 ? 'good' : soilMoisture < 40 ? 'warning' : 'caution',
          detail: soilMoisture >= 60 ? 'Optimal root moisture' : 'Depleted moisture',
        },
        {
          factor: `Expected 24h Rainfall: ${rainExpected} mm`,
          status: rainExpected > 10 ? 'good' : 'caution',
          detail: rainExpected > 10 ? 'Natural rainfall incoming' : 'Low precipitation',
        },
        {
          factor: `Frost Hazard: ${frostRisk}`,
          status: frostRisk === 'None' ? 'good' : frostRisk === 'Low' ? 'caution' : 'warning',
          detail: `Min overnight temp ${lowTemp}°C`,
        },
        {
          factor: `Evapotranspiration: ${et} mm/day`,
          status: et <= 5 ? 'good' : 'caution',
          detail: 'Daily moisture loss rate',
        },
      ];

      return {
        personaId: 'agriculture',
        title: '🌱 Precision Agriculture & Farm Insight',
        highlightText: delayHours > 0 ? `Delay Irrigation for ${delayHours} Hours` : 'Standard Irrigation Cycle',
        score,
        scoreLabel: 'Agri Water Index',
        statusBadge: frostRisk === 'High' ? 'HIGH RISK' : delayHours > 0 ? 'CAUTION' : score >= 75 ? 'GOOD TO GO' : 'NOT IDEAL',
        bullets: [
          `Soil Moisture: ${soilMoisture}% (Telemetry Monitored)`,
          `Expected 24h Rain: ${rainExpected} mm`,
          `Frost Hazard: ${frostRisk}`,
          `Evapotranspiration: ${et} mm/day`,
        ],
        explainabilityFactors,
        subScores: [
          { label: 'Irrigation Efficiency', score: Math.max(10, Math.min(100, score)) },
          { label: 'Frost Safety', score: frostRisk === 'High' ? 20 : frostRisk === 'Low' ? 70 : 100 },
          { label: 'Crop Growth Index', score: 86 },
        ],
        secondaryMetrics: [
          { label: 'Soil Moisture', value: `${soilMoisture}%`, isSimulated: true },
          { label: 'Soil Temp', value: `${agriculture?.soilTemp || currentTemp - 2}°C`, isSimulated: true },
          { label: '48h Expected Rain', value: `${agriculture?.expectedRain48h || rainExpected * 1.5} mm` },
          { label: 'Planting Guidance', value: agriculture?.plantingGuidance || 'Ideal for vegetative growth' },
        ],
        disclaimer: 'Soil telemetry and agro-meteorological guidance based on calibrated microclimate models (Demo Sensor Data).',
        recommendation,
        actionType,
      };
    }

    case 'commuter': {
      const departure = commute?.recommendedDeparture || '4:15 PM – 5:00 PM';
      const avoid = commute?.avoidTimeWindow || '5:30 PM – 6:30 PM';
      const score = commute?.commuteSafetyScore || (data.condition === 'heavy-rain' ? 42 : data.condition === 'thunderstorm' ? 32 : 88);
      const fogRisk = commute?.fogRisk || (environment.visibility < 3.0 ? 'High' : environment.visibility < 6.0 ? 'Moderate' : 'Low');
      const actionType: 'positive' | 'warning' | 'caution' | 'alert' =
        score > 80 ? 'positive' : score > 50 ? 'caution' : 'alert';

      const highRainHours = hourly.filter((h) => h.rainProb >= 50);
      const rainWarningText = highRainHours.length > 0
        ? `Rain probability increases to ${highRainHours[0].rainProb}% around ${highRainHours[0].time}.`
        : 'Dry roads with nominal traffic visibility.';

      let recommendation = commute?.recommendation ||
        (score < 60
          ? `Best commute window: ${departure}. Avoid ${avoid} due to expected heavy rain and reduced road visibility.`
          : 'Road conditions clear with dry tarmac and nominal visibility for your daily commute.');

      const explainabilityFactors: ExplainabilityFactor[] = [
        {
          factor: `Best Departure Window: ${departure}`,
          status: 'good',
          detail: 'Lowest traffic & weather disruption',
        },
        {
          factor: `Avoid Window: ${avoid}`,
          status: highRainHours.length > 0 ? 'warning' : 'caution',
          detail: rainWarningText,
        },
        {
          factor: `Visibility: ${environment.visibility} km (${fogRisk} Fog Risk)`,
          status: environment.visibility >= 8 ? 'good' : environment.visibility >= 4 ? 'caution' : 'warning',
          detail: environment.visibility < 5 ? 'Use low-beam fog lamps' : 'Clear line of sight',
        },
        {
          factor: `Wind Gusts: ${environment.windGust} km/h`,
          status: environment.windGust <= 25 ? 'good' : environment.windGust <= 45 ? 'caution' : 'warning',
          detail: environment.windGust > 40 ? 'High crosswind hazard' : 'Safe steering',
        },
      ];

      return {
        personaId: 'commuter',
        title: '🚗 Smart Commute Intelligence',
        highlightText: `Best Window: ${departure}`,
        score,
        scoreLabel: 'Commute Safety Score',
        statusBadge: score >= 80 ? 'GOOD TO GO' : score >= 55 ? 'CAUTION' : score >= 35 ? 'NOT IDEAL' : 'HIGH RISK',
        primaryWindow: departure,
        bullets: [
          `Recommended Departure: ${departure}`,
          `Avoid Window: ${avoid}`,
          `Atmospheric Visibility: ${environment.visibility} km (${fogRisk} Fog)`,
          `Wind Gusts: ${environment.windGust} km/h`,
        ],
        explainabilityFactors,
        subScores: [
          { label: 'Road Clearance', score },
          { label: 'Visibility Rating', score: Math.min(100, Math.round(environment.visibility * 8)) },
          { label: 'Transit Reliability', score: Math.max(20, Math.min(100, score - 5)) },
        ],
        secondaryMetrics: [
          { label: 'Recommended Departure', value: departure },
          { label: 'Avoid Window', value: avoid },
          { label: 'Traffic Weather Delay', value: score < 50 ? '+25 to 35 mins' : score < 75 ? '+10 to 15 mins' : 'Nominal (0-5 mins)', isSimulated: true },
        ],
        disclaimer: 'Commute windows calculated from hourly rain probability, fog density and wind gusts. Traffic delays simulated for demo.',
        recommendation,
        actionType,
      };
    }

    default:
      return {
        personaId: 'fitness',
        title: '🌟 Daily Weather Insight',
        highlightText: 'Pleasant Atmospheric Conditions',
        score: 85,
        scoreLabel: 'Comfort Index',
        bullets: [`Temperature: ${currentTemp}°C`, `Condition: ${data.conditionText}`],
        recommendation: 'Good day for daily activities.',
        actionType: 'positive',
      };
  }
}

export function generateSmartAlerts(data: WeatherData): AlertItem[] {
  const alerts: AlertItem[] = [];

  if (data.environment.aqi > 150) {
    alerts.push({
      id: 'alert-aqi',
      title: 'Poor Air Quality Advisory',
      category: 'Poor AQI',
      severity: data.environment.aqi > 200 ? 'severe' : 'moderate',
      time: 'Active Now',
      targetPersonas: ['health', 'fitness', 'family'],
      message: `AQI has reached ${data.environment.aqi} (${data.environment.aqiStatus}) with PM2.5 at ${data.environment.pm25} µg/m³.`,
      recommendation: 'AQI has reached an unhealthy level for sensitive users. Consider reducing prolonged outdoor activity and keep windows closed.',
    });
  }

  const heavyRainHours = data.hourly.filter((h) => h.rainProb >= 60);
  if (heavyRainHours.length > 0 || data.condition === 'heavy-rain' || data.condition === 'thunderstorm') {
    const rainTime = heavyRainHours[0]?.time ? `around ${heavyRainHours[0].time}` : 'shortly';
    alerts.push({
      id: 'alert-rain',
      title: 'Monsoon Downpour & Waterlogging Warning',
      category: 'Heavy Rain',
      severity: 'moderate',
      time: `Expected ${rainTime}`,
      targetPersonas: ['commuter', 'family', 'traveler', 'agriculture', 'fitness'],
      message: `Heavy rain expected ${rainTime}. Rain probability surges to ${heavyRainHours[0]?.rainProb || 80}%.`,
      recommendation: 'Outdoor conditions will deteriorate. Plan commute departures earlier and delay farm irrigation.',
    });
  }

  if (data.environment.uvIndex >= 8) {
    alerts.push({
      id: 'alert-uv',
      title: 'Very High UV Radiation Index',
      category: 'High UV',
      severity: data.environment.uvIndex >= 11 ? 'severe' : 'moderate',
      time: '11:00 AM – 3:30 PM',
      targetPersonas: ['health', 'beach', 'family', 'fitness'],
      message: `UV Index reaching ${data.environment.uvIndex} (${data.environment.uvStatus}). Direct skin damage possible in 15 mins.`,
      recommendation: 'Wear UV400 sunglasses, broad-brimmed hats, and apply SPF 50+ sunscreen.',
    });
  }

  if (data.currentTemp >= 38 || data.feelsLike >= 42) {
    alerts.push({
      id: 'alert-heat',
      title: 'Heatwave & Thermal Stress Alert',
      category: 'Heat',
      severity: 'severe',
      time: 'Midday Peak',
      targetPersonas: ['health', 'fitness', 'agriculture', 'family'],
      message: `Temperatures reaching ${data.highTemp}°C (Feels like ${data.feelsLike}°C).`,
      recommendation: 'Stay in shaded/air-conditioned zones, drink electrolyte-rich fluids, and postpone strenuous field labor.',
    });
  }

  if (data.marine && data.marine.ripCurrentRisk === 'High') {
    alerts.push({
      id: 'alert-marine',
      title: 'Hazardous Marine & Rip Current Advisory',
      category: 'Marine Conditions',
      severity: 'severe',
      time: 'Active Today',
      targetPersonas: ['beach', 'traveler'],
      message: `Wave height ${data.marine.waveHeight}m with strong onshore surge and hazardous rip current channels.`,
      recommendation: 'Strong winds and waves may affect beach conditions. Heed red flag warnings; keep swimmers ashore.',
    });
  }

  if (data.environment.visibility <= 3.0) {
    alerts.push({
      id: 'alert-fog',
      title: 'Low Visibility & Fog Warning',
      category: 'Fog',
      severity: 'moderate',
      time: 'Morning & Late Evening',
      targetPersonas: ['commuter', 'traveler', 'family'],
      message: `Visibility reduced to ${data.environment.visibility} km due to atmospheric haze/fog.`,
      recommendation: 'Use vehicle low-beam fog lamps and maintain safe braking distances during commute.',
    });
  }

  // Persona-specific agriculture irrigation alert if rain is expected
  if (data.agriculture && data.agriculture.expectedRain24h > 12) {
    alerts.push({
      id: 'alert-agri-rain',
      title: 'Rain Expected: Irrigation Delay Recommended',
      category: 'Heavy Rain',
      severity: 'info',
      time: 'Next 24h',
      targetPersonas: ['agriculture'],
      message: `Expected precipitation of ${data.agriculture.expectedRain24h} mm over the next 24 hours.`,
      recommendation: 'Delay irrigation to conserve water and prevent root waterlogging.',
    });
  }

  return alerts;
}

export function generateDeterministicPackingList(
  destinationCity: string,
  temp: number,
  rainProb: number,
  condition: string
): PackingItem[] {
  const isRainy = rainProb > 40 || condition.toLowerCase().includes('rain') || condition.toLowerCase().includes('drizzle');
  const isCold = temp < 18;
  const isHot = temp > 30;

  const items: PackingItem[] = [
    {
      id: 'p-1',
      category: 'Clothing & Layers',
      item: isCold ? 'Thermal base layer & fleece jacket' : isHot ? 'Breathable linen shirts & lightweight cottons' : 'Versatile cotton tees & layering sweater',
      essential: true,
      checked: true,
      weatherReason: `Tailored for ${temp}°C temperatures.`,
    },
    {
      id: 'p-2',
      category: 'Rain & Outerwear',
      item: isRainy ? 'Compact windproof umbrella & waterproof shell jacket' : 'Light windbreaker jacket',
      essential: isRainy,
      checked: isRainy,
      weatherReason: isRainy ? `${rainProb}% rain probability in ${destinationCity}.` : 'Light backup layer for breezy evenings.',
    },
    {
      id: 'p-3',
      category: 'Footwear',
      item: isRainy ? 'Water-resistant walking shoes / boots' : 'Comfortable breathable sneakers & walking shoes',
      essential: true,
      checked: false,
      weatherReason: isRainy ? 'Wet sidewalks and puddle protection.' : 'Ideal for full-day city sightseeing.',
    },
    {
      id: 'p-4',
      category: 'Sun & Health',
      item: isHot ? 'Broad-spectrum SPF 50+ sunscreen, UV sunglasses & electrolyte tabs' : 'Moisturizing lip balm & UV sunglasses',
      essential: isHot,
      checked: false,
      weatherReason: isHot ? 'High solar exposure and heat protection.' : 'Dry air skin barrier maintenance.',
    },
    {
      id: 'p-5',
      category: 'Tech & Electronics',
      item: 'Universal power adapter & 10,000mAh waterproof power bank',
      essential: true,
      checked: true,
      weatherReason: 'Essential for mobile maps, photography and navigation.',
    },
  ];

  return items;
}

export function getPersonalizedAIQuestions(personaId: PersonaId, locationName: string): { label: string; q: string }[] {
  switch (personaId) {
    case 'fitness':
      return [
        { label: '🏃 Can I run now?', q: `Can I go running right now in ${locationName} based on temperature, rain and AQI?` },
        { label: '⏰ Best time to run today?', q: `What is the single best time window to run or workout today in ${locationName}?` },
        { label: '🫁 Is air quality safe for cardio?', q: `Is the air quality and PM2.5 level safe for high-intensity outdoor running in ${locationName}?` },
        { label: '👕 What should I wear for my workout?', q: `What fitness gear and hydration should I prepare for today's weather in ${locationName}?` },
      ];
    case 'health':
      return [
        { label: '🫁 Is air quality safe today?', q: `Is the air quality and AQI in ${locationName} safe for sensitive users today?` },
        { label: '☀️ Is UV high today?', q: `What is the peak UV index today in ${locationName} and what sun protection is required?` },
        { label: '💧 How will humidity affect health?', q: `How will today's humidity and temperature in ${locationName} affect asthma and respiratory comfort?` },
        { label: '🚪 Should I keep windows closed?', q: `Based on current pollutants and pollen in ${locationName}, should I keep windows closed?` },
      ];
    case 'traveler':
      return [
        { label: '🧳 What should I pack?', q: `What clothes and essentials should I pack for visiting ${locationName} this week?` },
        { label: '✈️ Is tomorrow good for travel?', q: `Are travel and sightseeing conditions favorable tomorrow in ${locationName}?` },
        { label: '☔ Will it rain at my destination?', q: `What is the exact hourly rain probability and timing in ${locationName}?` },
        { label: '📸 Best daylight sightseeing hours?', q: `What are the best hours for outdoor photography and walking tours in ${locationName}?` },
      ];
    case 'commuter':
      return [
        { label: '🚗 When should I leave?', q: `When is the safest and clearest time to leave for my commute today in ${locationName}?` },
        { label: '🌧️ Will rain affect my commute?', q: `Will heavy rain or road waterlogging affect my evening commute in ${locationName}?` },
        { label: '🌫️ Any fog or visibility hazards?', q: `Is there any fog or low visibility expected on roads around ${locationName}?` },
        { label: '⏱️ Best departure window today?', q: `What is the optimal commute departure window to avoid peak rain in ${locationName}?` },
      ];
    case 'agriculture':
      return [
        { label: '🌱 Should I water my crops?', q: `Should I delay or proceed with irrigation today in ${locationName} based on soil moisture and rain?` },
        { label: '🌧️ How much rain is expected in 24h?', q: `What is the expected 24-hour rainfall accumulation in ${locationName}?` },
        { label: '❄️ Any frost risk tonight?', q: `Is there any frost or extreme low temperature hazard for crops tonight in ${locationName}?` },
        { label: '🌾 Is it good for pesticide spraying?', q: `Are wind speed and rain probability suitable for spraying crops today in ${locationName}?` },
      ];
    case 'beach':
      return [
        { label: '🏄 Is it good for surfing?', q: `How are the wave heights, swell period and winds for surfing today in ${locationName}?` },
        { label: '🌊 How are the waves and tides today?', q: `What are the current tide times, wave heights and sea conditions in ${locationName}?` },
        { label: '🏊 Is swimming safe this afternoon?', q: `Is it safe for recreational swimming at the beach today in ${locationName}?` },
        { label: '🚩 What is the rip current risk?', q: `What is the rip current hazard and marine safety rating today in ${locationName}?` },
      ];
    case 'family':
      return [
        { label: '🎒 What should kids wear to school?', q: `What weather gear (raincoat, umbrella, warm layers) do kids need today in ${locationName}?` },
        { label: '🚌 Will rain affect school pickup?', q: `Will heavy rain or storms impact school pickup between 3:30 PM and 5:30 PM in ${locationName}?` },
        { label: '🛝 Is afternoon good for the playground?', q: `Is the weather suitable for children to play at the outdoor park this afternoon in ${locationName}?` },
        { label: '⚡ Any storm or severe weather warnings?', q: `Are there any severe weather alerts or lightning warnings parents should know in ${locationName}?` },
      ];
    default:
      return [
        { label: '☀️ What is today\'s weather forecast?', q: `What is the overall weather forecast for today in ${locationName}?` },
        { label: '☔ Should I carry an umbrella?', q: `Should I carry an umbrella today in ${locationName}?` },
        { label: '👕 What should I wear today?', q: `What clothes are best for today's weather in ${locationName}?` },
        { label: '🏃 Is it good for outdoor activities?', q: `Are outdoor conditions good today in ${locationName}?` },
      ];
  }
}
