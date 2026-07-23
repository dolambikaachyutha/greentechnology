/**
 * SolarClean AI - AI Sustainability Assistant Chatbot
 * Answers solar panel maintenance queries using real-time dashboard data, weather intelligence, and energy metrics.
 */

window.SolarChatbotModule = (function () {

  function processUserQuery(userText, currentAppState) {
    const q = userText.toLowerCase();
    const weather = currentAppState.weather || {};
    const aiRec = currentAppState.recommendation || {};
    const site = currentAppState.siteProfile || {};
    const dataset = currentAppState.dataset || [];

    const latestDay = dataset.length > 0 ? dataset[dataset.length - 1] : {};
    const currentSoiling = latestDay.soilingScore || 8.5;
    const currentEff = latestDay.efficiencyPct || 19.8;
    const dailyLossUsd = latestDay.revenueLossUsd || 14.50;
    const dailyLossKwh = latestDay.energyLossKwh || 180;
    const rainTomorrow = weather.tomorrowRainForecastMm || 0;

    let reply = "";

    if (q.includes("should i clean") || q.includes("clean today") || q.includes("cleaning needed")) {
      if (rainTomorrow >= 4.0) {
        reply = `🌧️ **Do NOT clean today!** Heavy rainfall (${rainTomorrow} mm) is forecasted for tomorrow. Natural precipitation will wash the panels automatically, saving you manual cleaning costs ($${site.washCostPerClean || 150}) and conserving water!`;
      } else if (currentSoiling >= 10.0) {
        reply = `⚠️ **Yes, cleaning is recommended!** Your solar array soiling score is currently **${currentSoiling}%**, resulting in an estimated loss of **$${dailyLossUsd}/day** (${dailyLossKwh} kWh). Schedule a wash within 2-3 days for maximum ROI.`;
      } else {
        reply = `✅ **No cleaning required today.** Your current soiling level is **${currentSoiling}%** and panels are operating at **${currentEff}% efficiency**. We will notify you when a wash is cost-effective!`;
      }

    } else if (q.includes("losing") || q.includes("energy loss") || q.includes("power loss")) {
      reply = `⚡ You are currently losing approximately **${dailyLossKwh} kWh/day** due to dust accumulation, which translates to a revenue loss of **$${dailyLossUsd}/day** (or ~$${(dailyLossUsd * 30).toFixed(2)}/month).`;

    } else if (q.includes("rain") || q.includes("tomorrow's rain") || q.includes("weather")) {
      if (rainTomorrow > 0) {
        reply = `🌦️ Open-Meteo weather intelligence predicts **${rainTomorrow} mm** of rainfall tomorrow with **${weather.temperatureC || 28}°C** ambient temperature. This is expected to provide an **${rainTomorrow >= 6 ? 'EXCELLENT' : 'MODERATE'}** natural rinse!`;
      } else {
        reply = `☀️ No rain forecasted for tomorrow. High solar irradiance (**${weather.solarIrradiance || 880} W/m²**) expected with wind speeds around **${weather.windSpeedKmh || 14} km/h**.`;
      }

    } else if (q.includes("efficiency") || q.includes("current efficiency")) {
      reply = `📊 Your current solar panel efficiency is **${currentEff}%** (Base rated: ${site.baseEfficiency}%). Soiling score has reduced efficiency by **${currentSoiling}%**.`;

    } else if (q.includes("save") || q.includes("money") || q.includes("roi") || q.includes("cost")) {
      const calc = window.SolarCalculatorModule ? window.SolarCalculatorModule.calculateSustainabilityImpact({
        capacityKw: site.capacityKw,
        tariff: site.tariffPerKwh,
        washCost: site.washCostPerClean,
        waterPerWash: site.waterLitresPerClean,
        soilingPct: currentSoiling
      }) : {};

      reply = `💰 By switching to AI-driven predictive maintenance instead of a fixed wash schedule, you can save **$${calc.totalNetAnnualSavingsUsd || 1450}/year**, conserve **${calc.annualWaterSavedLitres || 9600} Liters** of water, and offset **${calc.co2OffsetTons || 8.4} Tons of CO₂**!`;

    } else {
      reply = `🤖 SolarClean AI Assistant here! Current Array Status:\n• Soiling Score: **${currentSoiling}%**\n• Current Efficiency: **${currentEff}%**\n• Tomorrow's Rain Forecast: **${rainTomorrow} mm**\n• AI Recommendation: **${aiRec.headline || 'Monitor array'}**\n\nHow else can I assist your clean energy operations?`;
    }

    return reply;
  }

  return {
    processUserQuery
  };

})();
