/**
 * SolarClean AI - Expected vs Actual Power Analysis & Inverter CSV Parser
 * Calculates Soiling Score = ((Expected Output - Actual Output) / Expected Output) * 100
 */

window.SolarPowerModule = (function () {

  function parseInverterCSV(csvText) {
    const lines = csvText.trim().split('\n');
    if (lines.length < 2) return null;

    const headers = lines[0].toLowerCase().split(',').map(h => h.trim());
    const dataPoints = [];

    for (let i = 1; i < lines.length; i++) {
      const parts = lines[i].split(',').map(p => p.trim());
      if (parts.length < 2) continue;

      const time = parts[0];
      const val1 = parseFloat(parts[1]) || 0;
      const val2 = parts[2] ? parseFloat(parts[2]) : null;

      let expected = val1;
      let actual = val2 !== null ? val2 : val1 * 0.88; // Default 12% soiling loss if single column

      if (headers.includes('actual') && headers.includes('expected')) {
        const expIdx = headers.indexOf('expected');
        const actIdx = headers.indexOf('actual');
        expected = parseFloat(parts[expIdx]) || 0;
        actual = parseFloat(parts[actIdx]) || 0;
      }

      const loss = Math.max(0, expected - actual);
      const soilingScore = expected > 0 ? parseFloat(((loss / expected) * 100).toFixed(2)) : 0;

      dataPoints.push({
        time,
        expectedKw: parseFloat(expected.toFixed(2)),
        actualKw: parseFloat(actual.toFixed(2)),
        lossKw: parseFloat(loss.toFixed(2)),
        soilingScore
      });
    }

    return dataPoints;
  }

  // Generates 24-hour diurnal power generation curve simulation
  function generate24HourDiurnalCurve(capacityKw, currentSoilingScorePct, cloudCoverPct) {
    const hours = [];
    const baseCurve = [0,0,0,0,0, 0.02, 0.15, 0.40, 0.65, 0.85, 0.96, 1.0, 0.98, 0.88, 0.70, 0.48, 0.22, 0.05, 0,0,0,0,0,0];

    for (let h = 0; h < 24; h++) {
      const timeStr = `${h < 10 ? '0' + h : h}:00`;
      const sunFactor = baseCurve[h];

      const expectedKw = parseFloat((capacityKw * sunFactor * (1 - (cloudCoverPct / 250))).toFixed(2));
      const actualKw = parseFloat((expectedKw * (1 - (currentSoilingScorePct / 100))).toFixed(2));
      const lossKw = parseFloat((expectedKw - actualKw).toFixed(2));

      hours.push({
        time: timeStr,
        expectedKw,
        actualKw,
        lossKw,
        soilingScore: currentSoilingScorePct
      });
    }

    return hours;
  }

  return {
    parseInverterCSV,
    generate24HourDiurnalCurve
  };

})();
