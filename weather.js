/**
 * SolarClean AI - Live Weather Intelligence Module (Open-Meteo API Integrator)
 * Fetches real-time & 7-day forecast solar weather data (Irradiance, Rain, Wind, Temp, Cloud Cover)
 */

window.SolarWeatherModule = (function () {

  async function fetchLiveWeather(lat, lon) {
    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,precipitation,cloud_cover,direct_normal_irradiance&daily=precipitation_sum,temperature_2m_max,temperature_2m_min,shortwave_radiation_sum&timezone=auto`;
      
      const response = await fetch(url);
      if (!response.ok) throw new Error('Open-Meteo API response not ok');
      const data = await response.json();

      const current = data.current || {};
      const daily = data.daily || {};

      const next7DaysRain = daily.precipitation_sum || [0, 0, 0, 0, 0, 0, 0];
      const tomorrowRainMm = next7DaysRain[1] || next7DaysRain[0] || 0;
      const totalWeekRainMm = next7DaysRain.reduce((a, b) => a + b, 0);

      return {
        isLive: true,
        temperatureC: Math.round(current.temperature_2m || 28),
        humidityPct: Math.round(current.relative_humidity_2m || 45),
        windSpeedKmh: Math.round(current.wind_speed_10m || 14),
        currentRainMm: current.precipitation || 0,
        cloudCoverPct: Math.round(current.cloud_cover || 10),
        solarIrradiance: Math.round(current.direct_normal_irradiance || 850),
        tomorrowRainForecastMm: parseFloat(tomorrowRainMm.toFixed(1)),
        weekRainForecastMm: parseFloat(totalWeekRainMm.toFixed(1)),
        dailyForecasts: (daily.time || []).map((date, idx) => ({
          date,
          rainMm: daily.precipitation_sum ? daily.precipitation_sum[idx] : 0,
          maxTemp: daily.temperature_2m_max ? daily.temperature_2m_max[idx] : 28
        }))
      };
    } catch (err) {
      console.warn('Falling back to simulated weather module due to API error/offline state:', err.message);
      return {
        isLive: false,
        temperatureC: 31,
        humidityPct: 38,
        windSpeedKmh: 18,
        currentRainMm: 0,
        cloudCoverPct: 15,
        solarIrradiance: 920,
        tomorrowRainForecastMm: 14.5, // Simulate upcoming heavy rain for smart decision override!
        weekRainForecastMm: 22.0,
        dailyForecasts: [
          { date: 'Today', rainMm: 0, maxTemp: 31 },
          { date: 'Tomorrow', rainMm: 14.5, maxTemp: 26 },
          { date: 'Day 3', rainMm: 5.2, maxTemp: 25 },
          { date: 'Day 4', rainMm: 0, maxTemp: 29 },
          { date: 'Day 5', rainMm: 0, maxTemp: 32 }
        ]
      };
    }
  }

  // Weather-Driven Dust & Rain Wash Coefficient
  function calculateWeatherImpact(weatherData) {
    const windDustMultiplier = weatherData.windSpeedKmh > 25 ? 1.5 : weatherData.windSpeedKmh > 15 ? 1.2 : 1.0;
    const humidityDustMultiplier = weatherData.humidityPct > 70 ? 1.3 : 1.0; // High humidity creates sticky pollen/dust

    const dailyDustAccumulationRate = parseFloat((0.45 * windDustMultiplier * humidityDustMultiplier).toFixed(2));
    
    // Natural Rain Wash Potential
    const rainCleaningPower = weatherData.tomorrowRainForecastMm >= 8.0 
      ? 'EXCELLENT' 
      : weatherData.tomorrowRainForecastMm >= 3.0 
      ? 'MODERATE' 
      : 'NONE';

    return {
      dailyDustAccumulationRate,
      rainCleaningPower,
      rainWillWashPanels: weatherData.tomorrowRainForecastMm >= 4.0
    };
  }

  return {
    fetchLiveWeather,
    calculateWeatherImpact
  };

})();
