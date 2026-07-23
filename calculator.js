/**
 * SolarClean AI - Cost & Sustainability ESG Calculator
 * Calculates financial savings, water conservation metrics, energy recovery, and CO2 emissions reduction.
 */

window.SolarCalculatorModule = (function () {

  function calculateSustainabilityImpact(inputs) {
    const capacityKw = parseFloat(inputs.capacityKw) || 250;
    const tariff = parseFloat(inputs.tariff) || 0.15;
    const washCost = parseFloat(inputs.washCost) || 150;
    const waterPerWashLitres = parseFloat(inputs.waterPerWash) || 600;
    const currentSoilingPct = parseFloat(inputs.soilingPct) || 11.5;
    const washMethod = inputs.washMethod || 'manual'; // 'manual', 'robotic', 'dry_brush'

    // Annual energy estimation (standard yield: 1,600 kWh per kW capacity annually)
    const annualPotentialKwh = capacityKw * 1600;
    
    // Fixed schedule washing (e.g. washes every 14 days = 26 washes/year)
    const fixedScheduleWashesPerYear = 26;
    
    // SolarClean AI predictive washing (e.g. washes 9 times/year only when ROI positive and no rain coming)
    const smartAiWashesPerYear = Math.max(4, Math.round(fixedScheduleWashesPerYear * 0.35));

    const washesSavedPerYear = fixedScheduleWashesPerYear - smartAiWashesPerYear;
    const annualWaterSavedLitres = washesSavedPerYear * waterPerWashLitres;
    const annualWashingCostSavingsUsd = washesSavedPerYear * washCost;

    // Energy Recovered by cleaning at optimal times instead of letting soiling decay
    const avgSoilingImprovementPct = Math.min(15, currentSoilingPct * 0.75);
    const annualEnergyRecoveredKwh = Math.round(annualPotentialKwh * (avgSoilingImprovementPct / 100));
    const annualEnergyRecoveredMwh = parseFloat((annualEnergyRecoveredKwh / 1000).toFixed(2));
    const annualRevenueRecoveredUsd = parseFloat((annualEnergyRecoveredKwh * tariff).toFixed(2));

    // Total Net Financial Benefit = Revenue Recovered + Cleaning Expenses Saved
    const totalNetAnnualSavingsUsd = Math.round(annualRevenueRecoveredUsd + annualWashingCostSavingsUsd);

    // Carbon Offset: Standard EPA factor ~ 0.708 Metric Tons CO2 per MWh of clean solar power
    const co2OffsetTons = parseFloat((annualEnergyRecoveredMwh * 0.708).toFixed(2));

    // Equivalent Trees Planted (1 tree absorbs ~0.022 tons CO2 per year)
    const equivalentTreesPlanted = Math.round(co2OffsetTons / 0.022);

    return {
      capacityKw,
      fixedScheduleWashesPerYear,
      smartAiWashesPerYear,
      washesSavedPerYear,
      annualWaterSavedLitres,
      annualWashingCostSavingsUsd,
      annualEnergyRecoveredKwh,
      annualEnergyRecoveredMwh,
      annualRevenueRecoveredUsd,
      totalNetAnnualSavingsUsd,
      co2OffsetTons,
      equivalentTreesPlanted
    };
  }

  return {
    calculateSustainabilityImpact
  };

})();
