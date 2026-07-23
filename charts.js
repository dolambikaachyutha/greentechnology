/**
 * SolarClean AI - Interactive Chart.js Visualization Engine
 * Renders high-performance, dark-mode glassmorphic charts for power generation, soiling trends, weather impact, and timeline.
 */

window.SolarChartsModule = (function () {

  let chartInstances = {};

  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: { color: '#9CA3AF', font: { family: 'Outfit', size: 12 } }
      },
      tooltip: {
        backgroundColor: 'rgba(10, 15, 36, 0.9)',
        titleColor: '#FBBF24',
        bodyColor: '#F3F4F6',
        borderColor: 'rgba(245, 158, 11, 0.4)',
        borderWidth: 1,
        padding: 10
      }
    },
    scales: {
      x: {
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        ticks: { color: '#6B7280', font: { family: 'Outfit' } }
      },
      y: {
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        ticks: { color: '#6B7280', font: { family: 'Outfit' } }
      }
    }
  };

  // 1. Render 100-Day Soiling & Cleaning Trend Chart
  function renderSoilingTrendChart(canvasId, dataset) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;

    if (chartInstances[canvasId]) chartInstances[canvasId].destroy();

    const labels = dataset.map(d => d.date);
    const soilingScores = dataset.map(d => d.soilingScore);
    const cleaningEvents = dataset.map(d => d.cleanedToday ? d.soilingScore : null);

    chartInstances[canvasId] = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Estimated Soiling Score (%)',
            data: soilingScores,
            borderColor: '#F59E0B',
            backgroundColor: 'rgba(245, 158, 11, 0.1)',
            fill: true,
            tension: 0.3,
            borderWidth: 2,
            pointRadius: 1
          },
          {
            label: 'Washing Event',
            data: cleaningEvents,
            borderColor: '#10B981',
            backgroundColor: '#10B981',
            pointRadius: 6,
            pointHoverRadius: 9,
            showLine: false
          }
        ]
      },
      options: {
        ...commonOptions,
        scales: {
          ...commonOptions.scales,
          y: {
            ...commonOptions.scales.y,
            title: { display: true, text: 'Soiling Loss (%)', color: '#9CA3AF' }
          }
        }
      }
    });
  }

  // 2. Expected vs Actual Power Diurnal Curve Chart
  function renderPowerCurveChart(canvasId, diurnalData) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;

    if (chartInstances[canvasId]) chartInstances[canvasId].destroy();

    const labels = diurnalData.map(d => d.time);
    const expected = diurnalData.map(d => d.expectedKw);
    const actual = diurnalData.map(d => d.actualKw);

    chartInstances[canvasId] = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Expected Power (kW)',
            data: expected,
            borderColor: '#06B6D4',
            backgroundColor: 'rgba(6, 182, 212, 0.1)',
            fill: true,
            borderDash: [5, 5],
            tension: 0.4
          },
          {
            label: 'Actual Inverter Power (kW)',
            data: actual,
            borderColor: '#F59E0B',
            backgroundColor: 'rgba(245, 158, 11, 0.25)',
            fill: true,
            tension: 0.4
          }
        ]
      },
      options: {
        ...commonOptions,
        scales: {
          ...commonOptions.scales,
          y: {
            ...commonOptions.scales.y,
            title: { display: true, text: 'Power Output (kW)', color: '#9CA3AF' }
          }
        }
      }
    });
  }

  // 3. Rainfall vs Dust Accumulation Dual-Axis Chart
  function renderRainVsDustChart(canvasId, dataset) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;

    if (chartInstances[canvasId]) chartInstances[canvasId].destroy();

    const labels = dataset.slice(-30).map(d => d.date);
    const rain = dataset.slice(-30).map(d => d.rainMm);
    const soiling = dataset.slice(-30).map(d => d.soilingScore);

    chartInstances[canvasId] = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Rainfall (mm)',
            data: rain,
            backgroundColor: 'rgba(34, 211, 238, 0.6)',
            borderColor: '#06B6D4',
            borderWidth: 1,
            yAxisID: 'yRain'
          },
          {
            label: 'Soiling Score (%)',
            data: soiling,
            type: 'line',
            borderColor: '#EF4444',
            backgroundColor: 'transparent',
            borderWidth: 2,
            tension: 0.3,
            yAxisID: 'yDust'
          }
        ]
      },
      options: {
        ...commonOptions,
        scales: {
          x: commonOptions.scales.x,
          yRain: {
            type: 'linear',
            position: 'left',
            grid: { color: 'rgba(255, 255, 255, 0.05)' },
            title: { display: true, text: 'Rainfall (mm)', color: '#06B6D4' }
          },
          yDust: {
            type: 'linear',
            position: 'right',
            grid: { drawOnChartArea: false },
            title: { display: true, text: 'Soiling Score (%)', color: '#EF4444' }
          }
        }
      }
    });
  }

  // 4. Monthly Production Chart
  function renderMonthlyProductionChart(canvasId) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;

    if (chartInstances[canvasId]) chartInstances[canvasId].destroy();

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const expectedMwh = [32, 38, 45, 52, 60, 68, 72, 69, 58, 48, 36, 30];
    const actualMwh = [29.5, 35.1, 41.2, 48.0, 54.8, 62.0, 64.5, 62.1, 52.8, 43.6, 33.0, 27.8];

    chartInstances[canvasId] = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: months,
        datasets: [
          { label: 'Expected MWh', data: expectedMwh, backgroundColor: 'rgba(16, 185, 129, 0.5)', borderColor: '#10B981', borderWidth: 1 },
          { label: 'Actual MWh', data: actualMwh, backgroundColor: 'rgba(245, 158, 11, 0.6)', borderColor: '#F59E0B', borderWidth: 1 }
        ]
      },
      options: commonOptions
    });
  }

  return {
    renderSoilingTrendChart,
    renderPowerCurveChart,
    renderRainVsDustChart,
    renderMonthlyProductionChart
  };

})();
