/**
 * SolarClean AI - 100+ Day Solar Farm Dataset Simulator
 * Simulates weather, expected vs actual energy output, rainfall events, soiling accumulation, and cleaning cycles.
 */

window.SolarDataSimulator = (function () {

  const SITE_PROFILES = {
    'sahara-50mw': {
      id: 'sahara-50mw',
      name: 'Sahara Mega Solar Farm (50 MW)',
      location: 'Atacama / Sahara Desert',
      lat: 24.088,
      lon: 32.899,
      capacityKw: 50000,
      baseEfficiency: 21.5,
      soilingRatePerDay: 0.65, // % per day without rain/cleaning
      rainCleaningThreshold: 5.0, // mm rain needed to wash dust
      tariffPerKwh: 0.08,
      washCostPerClean: 1200,
      waterLitresPerClean: 8000
    },
    'california-250kw': {
      id: 'california-250kw',
      name: 'California Commercial Rooftop (250 kW)',
      location: 'Mojave / Los Angeles, CA',
      lat: 34.052,
      lon: -118.243,
      capacityKw: 250,
      baseEfficiency: 20.2,
      soilingRatePerDay: 0.40,
      rainCleaningThreshold: 4.0,
      tariffPerKwh: 0.18,
      washCostPerClean: 150,
      waterLitresPerClean: 600
    },
    'bavaria-12kw': {
      id: 'bavaria-12kw',
      name: 'Bavaria Eco Residential (12 kW)',
      location: 'Munich, Germany',
      lat: 48.135,
      lon: 11.582,
      capacityKw: 12,
      baseEfficiency: 19.5,
      soilingRatePerDay: 0.22,
      rainCleaningThreshold: 3.0,
      tariffPerKwh: 0.32,
      washCostPerClean: 40,
      waterLitresPerClean: 80
    }
  };

  let currentProfileKey = 'sahara-50mw';

  function generateHistorical100Days(profileKey) {
    const profile = SITE_PROFILES[profileKey] || SITE_PROFILES['sahara-50mw'];
    const days = [];
    const totalDays = 110;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - totalDays);

    let currentSoiling = 2.0; // Initial 2% soiling
    let daysSinceClean = 0;

    for (let i = 0; i < totalDays; i++) {
      const d = new Date(startDate);
      d.setDate(d.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];

      // Weather Simulation
      const tempC = Math.round(22 + Math.sin(i / 10) * 8 + (Math.random() - 0.5) * 4);
      const cloudCover = Math.min(100, Math.max(0, Math.round(15 + (Math.random() - 0.5) * 30)));
      
      // Periodic Rain events (every 18-25 days on average)
      let rainMm = 0;
      if (profileKey === 'bavaria-12kw' && (i % 6 === 0 || Math.random() < 0.25)) {
        rainMm = parseFloat((2.0 + Math.random() * 14.0).toFixed(1));
      } else if (profileKey === 'california-250kw' && (i % 18 === 0 || Math.random() < 0.08)) {
        rainMm = parseFloat((3.0 + Math.random() * 20.0).toFixed(1));
      } else if (profileKey === 'sahara-50mw' && (i === 35 || i === 85)) {
        rainMm = parseFloat((8.0 + Math.random() * 12.0).toFixed(1));
      }

      // Scheduled cleaning events
      let cleanedToday = false;
      if (daysSinceClean > 35 || (currentSoiling > 14.0 && rainMm < 2.0 && Math.random() > 0.4)) {
        cleanedToday = true;
      }

      // Soiling & Washing Logic
      if (cleanedToday) {
        currentSoiling = 1.0; // Reset after manual wash
        daysSinceClean = 0;
      } else if (rainMm >= profile.rainCleaningThreshold) {
        // Natural Rain Washing
        const washFactor = Math.min(1.0, rainMm / 15.0);
        currentSoiling = Math.max(1.5, currentSoiling * (1 - washFactor * 0.8));
        daysSinceClean = Math.round(daysSinceClean * 0.3);
      } else {
        // Daily Dust Accumulation
        const windSpeed = 10 + Math.random() * 15;
        const dustFactor = windSpeed > 20 ? 1.4 : 1.0; // High wind kicks up desert dust
        currentSoiling = Math.min(30.0, currentSoiling + profile.soilingRatePerDay * dustFactor);
        daysSinceClean++;
      }

      // Irradiance & Energy Output Calculation
      const maxIrradiance = 950 - cloudCover * 4;
      const expectedDailyKwh = Math.round((profile.capacityKw * (maxIrradiance / 1000) * 5.8));
      
      // Actual output reduced by soiling % and temperature coefficient (-0.4%/°C above 25°C)
      const tempLossFactor = Math.max(0, (tempC - 25) * 0.004);
      const actualDailyKwh = Math.round(expectedDailyKwh * (1 - (currentSoiling / 100)) * (1 - tempLossFactor));
      
      const energyLossKwh = Math.max(0, expectedDailyKwh - actualDailyKwh);
      const revenueLossUsd = parseFloat((energyLossKwh * profile.tariffPerKwh).toFixed(2));
      const currentEff = parseFloat((profile.baseEfficiency * (1 - (currentSoiling / 100))).toFixed(2));

      days.push({
        dayIndex: i,
        date: dateStr,
        tempC,
        cloudCover,
        rainMm,
        irradiance: Math.max(150, maxIrradiance),
        soilingScore: parseFloat(currentSoiling.toFixed(2)),
        cleanedToday,
        daysSinceClean,
        expectedDailyKwh,
        actualDailyKwh,
        energyLossKwh,
        revenueLossUsd,
        efficiencyPct: currentEff
      });
    }

    return days;
  }

  return {
    getProfiles: () => SITE_PROFILES,
    getProfile: (key) => SITE_PROFILES[key] || SITE_PROFILES['sahara-50mw'],
    getCurrentProfileKey: () => currentProfileKey,
    setCurrentProfileKey: (key) => { currentProfileKey = key; },
    generateDataset: generateHistorical100Days
  };

})();
