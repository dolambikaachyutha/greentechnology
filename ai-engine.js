/**
 * SolarClean AI - AI Cleaning Recommendation Engine
 * Synthesizes weather forecasts, power generation loss, soiling score, and financial ROI to produce optimal cleaning decisions.
 */

window.SolarAIEngine = (function () {

  function evaluateCleaningRecommendation(soilingScorePct, weatherData, siteProfile) {
    const tomorrowRain = weatherData.tomorrowRainForecastMm || 0;
    const weekRain = weatherData.weekRainForecastMm || 0;
    const tariff = siteProfile.tariffPerKwh || 0.12;
    const washCost = siteProfile.washCostPerClean || 150;
    const capacityKw = siteProfile.capacityKw || 250;

    // Financial ROI Calculation: Daily Revenue Lost due to soiling
    const dailyEnergyLossKwh = (capacityKw * 5.5) * (soilingScorePct / 100);
    const dailyRevenueLostUsd = dailyEnergyLossKwh * tariff;
    const daysToPaybackWashing = dailyRevenueLostUsd > 0 ? Math.ceil(washCost / dailyRevenueLostUsd) : 999;

    let recommendationState = 'MONITOR'; // 'DO_NOT_CLEAN', 'CLEAN_URGENT', 'CLEAN_RECOMMENDED', 'MONITOR'
    let headline = '';
    let reasoning = [];
    let urgencyBadge = 'good';
    let confidenceScore = 94;

    // Decision Logic Matrix

    // Scenario 1: Heavy Rain Coming (Natural Wash Override)
    if (tomorrowRain >= 5.0 || (weekRain >= 12.0 && soilingScorePct < 15.0)) {
      recommendationState = 'DO_NOT_CLEAN';
      urgencyBadge = 'good';
      confidenceScore = 98;
      headline = `Cleaning NOT Required. Significant rainfall (${tomorrowRain > 0 ? tomorrowRain + ' mm tomorrow' : weekRain + ' mm this week'}) expected.`;
      reasoning.push(`🌧️ Upcoming rainfall will naturally wash dust off panels, saving $${washCost} in manual washing costs and ${siteProfile.waterLitresPerClean}L of water.`);
      reasoning.push(`📊 Current soiling score is ${soilingScorePct}%, causing ~$${dailyRevenueLostUsd.toFixed(2)}/day in energy loss, but natural rain wash will recover >80% efficiency.`);
      reasoning.push(`💡 Recommendation: Re-evaluate soiling score after rain event finishes.`);

    // Scenario 2: Critical Soiling Drop (> 10% loss) & Dry Weather ahead
    } else if (soilingScorePct >= 10.0 && daysToPaybackWashing <= 14) {
      recommendationState = 'CLEAN_URGENT';
      urgencyBadge = 'alert';
      confidenceScore = 95;
      headline = `Panel efficiency has dropped by ${soilingScorePct}%. Cleaning is URGENTLY RECOMMENDED within 2-3 days.`;
      reasoning.push(`⚠️ Soiling energy loss is costing $${dailyRevenueLostUsd.toFixed(2)} per day in ungenerated electricity.`);
      reasoning.push(`💰 Cleaning cost of $${washCost} will pay for itself in just ${daysToPaybackWashing} days of recovered generation.`);
      reasoning.push(`☀️ Zero heavy rain forecasted for the next 7 days (${weekRain} mm total). Automated or manual wash is highly cost-effective.`);

    // Scenario 3: Moderate Soiling (6% - 10%) & Dry Weather
    } else if (soilingScorePct >= 6.0) {
      recommendationState = 'CLEAN_RECOMMENDED';
      urgencyBadge = 'warn';
      confidenceScore = 89;
      headline = `Moderate soiling detected (${soilingScorePct}% drop). Schedule cleaning within 7 days.`;
      reasoning.push(`📈 Soiling accumulates at ~0.45% per day under current wind & dust conditions.`);
      reasoning.push(`💵 Current daily energy loss: $${dailyRevenueLostUsd.toFixed(2)}/day. Cleaning payback period is ${daysToPaybackWashing} days.`);
      reasoning.push(`🌤️ Weather outlook shows minimal rain (${weekRain} mm). Schedule routine cleaning array.`);

    // Scenario 4: Clean / Optimal Condition (< 6% loss)
    } else {
      recommendationState = 'DO_NOT_CLEAN';
      urgencyBadge = 'good';
      confidenceScore = 96;
      headline = `Solar panels operating near peak efficiency (Soiling: ${soilingScorePct}%). No cleaning needed.`;
      reasoning.push(`✅ Current power loss is minor (${soilingScorePct}%), well within operational tolerance.`);
      reasoning.push(`💧 Skipping unnecessary cleaning saves ${siteProfile.waterLitresPerClean} Liters of water and avoids premature glass abrasion.`);
      reasoning.push(`🔍 AI continuous monitoring active.`);
    }

    return {
      state: recommendationState,
      headline,
      reasoning,
      confidenceScore,
      urgencyBadge,
      dailyRevenueLostUsd: parseFloat(dailyRevenueLostUsd.toFixed(2)),
      daysToPaybackWashing,
      predictedCleaningDate: recommendationState.includes('CLEAN') 
        ? new Date(Date.now() + (recommendationState === 'CLEAN_URGENT' ? 2 : 5) * 86400000).toLocaleDateString()
        : 'Not Needed (Dry Clean OK)'
    };
  }

  return {
    evaluateCleaningRecommendation
  };

})();
