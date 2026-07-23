/**
 * SolarClean AI - Main Application Logic & Controller
 * Integrates 3D canvas, user authentication, weather API, dataset simulation, AI recommendations, dust detection CV, continuous scroll navigation, and interactive analytics.
 */

(function () {
  let appState = {
    user: null,
    siteProfileKey: 'sahara-50mw',
    siteProfile: null,
    dataset: [],
    weather: null,
    recommendation: null,
    diurnalPowerData: [],
    selectedVisionPreset: 'slight'
  };

  // Initialize App on DOM Ready
  document.addEventListener('DOMContentLoaded', async () => {
    // 1. Launch 3D Background Engine
    if (window.Init3DBackground) {
      window.Init3DBackground();
    }

    // 2. Setup Navigation Tabs (Smooth Scroll Anchors & ScrollSpy Observer)
    setupNavigationTabs();
    setupAuthHandlers();

    // 3. Check Current Logged In User
    appState.user = window.SolarAuthModule.getCurrentUser();
    updateUserProfileWidget(appState.user);

    // 4. Setup Site Switcher Listener & Sync with User's Assigned Site Profile
    setupSiteSwitcher();
    if (appState.user && appState.user.profileKey) {
      appState.siteProfileKey = appState.user.profileKey;
      const siteSelect = document.getElementById('site-select');
      if (siteSelect) siteSelect.value = appState.siteProfileKey;
    }

    // 5. Load Site Telemetry Data
    await loadSiteData(appState.siteProfileKey);

    // 6. Setup Interactive Event Listeners (Uploads, Vision, Calculator, Chat)
    setupVisionModuleHandlers();
    setupCalculatorHandlers();
    setupChatbotHandlers();
    setupCSVUploadHandler();

    showToast(`Welcome back, ${appState.user ? appState.user.name : 'Operator'}!`, 'good');
  });

  // Setup Smooth Scroll Navigation & IntersectionObserver ScrollSpy
  function setupNavigationTabs() {
    const tabs = document.querySelectorAll('.nav-tab');
    
    // Tab Button Click -> Smooth Scroll to Section Anchor
    tabs.forEach(tab => {
      tab.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = tab.getAttribute('data-tab');
        const targetSection = document.getElementById(targetId);

        if (targetSection) {
          targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });

    // ScrollSpy Observer: Active state follows scroll position down the page
    const sections = document.querySelectorAll('.tab-pane');
    const observerOptions = {
      root: null,
      rootMargin: '-20% 0px -60% 0px',
      threshold: 0
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const activeId = entry.target.id;
          tabs.forEach(t => {
            if (t.getAttribute('data-tab') === activeId) {
              t.classList.add('active');
            } else {
              t.classList.remove('active');
            }
          });
        }
      });
    }, observerOptions);

    sections.forEach(sec => observer.observe(sec));
  }

  // Setup Auth Modal & Event Handlers
  function setupAuthHandlers() {
    const authModal = document.getElementById('auth-modal');
    const btnAuthAction = document.getElementById('btn-auth-action');
    const tabLogin = document.getElementById('btn-tab-login');
    const tabRegister = document.getElementById('btn-tab-register');
    const formLogin = document.getElementById('form-login');
    const formRegister = document.getElementById('form-register');

    if (btnAuthAction) {
      btnAuthAction.addEventListener('click', () => {
        if (appState.user) {
          window.SolarAuthModule.logout();
          appState.user = null;
          showToast('Logged out successfully.', 'warn');
        }
        if (authModal) authModal.classList.add('open');
      });
    }

    if (tabLogin && tabRegister && formLogin && formRegister) {
      tabLogin.addEventListener('click', () => {
        tabLogin.classList.add('active');
        tabRegister.classList.remove('active');
        formLogin.style.display = 'flex';
        formRegister.style.display = 'none';
      });

      tabRegister.addEventListener('click', () => {
        tabRegister.classList.add('active');
        tabLogin.classList.remove('active');
        formRegister.style.display = 'flex';
        formLogin.style.display = 'none';
      });
    }

    document.querySelectorAll('.demo-user-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const email = btn.getAttribute('data-email');
        const loginEmailInput = document.getElementById('login-email');
        const loginPassInput = document.getElementById('login-password');
        if (loginEmailInput) loginEmailInput.value = email;
        if (loginPassInput) loginPassInput.value = 'solar123';
      });
    });

    if (formLogin) {
      formLogin.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const pass = document.getElementById('login-password').value;

        const res = window.SolarAuthModule.login(email, pass, true);
        if (res.success) {
          appState.user = res.user;
          updateUserProfileWidget(res.user);
          if (authModal) authModal.classList.remove('open');

          appState.siteProfileKey = res.user.profileKey;
          const siteSelect = document.getElementById('site-select');
          if (siteSelect) siteSelect.value = appState.siteProfileKey;

          await loadSiteData(appState.siteProfileKey);
          showToast(`Logged in as ${res.user.name}`, 'good');
        } else {
          showToast(res.message, 'alert');
        }
      });
    }

    if (formRegister) {
      formRegister.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('reg-name').value;
        const email = document.getElementById('reg-email').value;
        const pass = document.getElementById('reg-password').value;
        const cap = document.getElementById('reg-capacity').value;

        const res = window.SolarAuthModule.register(name, email, pass, cap, 'Custom Solar Site');
        if (res.success) {
          appState.user = res.user;
          updateUserProfileWidget(res.user);
          if (authModal) authModal.classList.remove('open');

          const siteSelect = document.getElementById('site-select');
          if (siteSelect) {
            const opt = document.createElement('option');
            opt.value = res.user.profileKey;
            opt.textContent = `${name}'s Array (${cap} kW)`;
            siteSelect.appendChild(opt);
            siteSelect.value = res.user.profileKey;
          }

          appState.siteProfileKey = res.user.profileKey;
          await loadSiteData(appState.siteProfileKey);
          showToast(`Account created for ${name}!`, 'good');
        } else {
          showToast(res.message, 'alert');
        }
      });
    }
  }

  function updateUserProfileWidget(user) {
    if (!user) {
      setElemText('user-display-name', 'Guest Operator');
      setElemText('user-display-role', 'Sign In to Sync Data');
      const btnAction = document.getElementById('btn-auth-action');
      if (btnAction) btnAction.innerHTML = '<i data-lucide="log-in"></i> Sign In';
      return;
    }

    setElemText('user-display-name', user.name);
    setElemText('user-display-role', user.email);
    const btnAction = document.getElementById('btn-auth-action');
    if (btnAction) btnAction.innerHTML = '<i data-lucide="log-out"></i> Logout';

    if (window.lucide) window.lucide.createIcons();
  }

  function setupSiteSwitcher() {
    const siteSelect = document.getElementById('site-select');
    if (!siteSelect) return;

    siteSelect.addEventListener('change', async (e) => {
      appState.siteProfileKey = e.target.value;
      showToast(`Loading data for ${e.target.options[e.target.selectedIndex].text}...`, 'warn');
      await loadSiteData(appState.siteProfileKey);
    });
  }

  async function loadSiteData(profileKey) {
    window.SolarDataSimulator.setCurrentProfileKey(profileKey);
    appState.siteProfile = window.SolarDataSimulator.getProfile(profileKey);
    appState.dataset = window.SolarDataSimulator.generateDataset(profileKey);

    const latestDay = appState.dataset[appState.dataset.length - 1];

    appState.weather = await window.SolarWeatherModule.fetchLiveWeather(
      appState.siteProfile.lat,
      appState.siteProfile.lon
    );

    appState.recommendation = window.SolarAIEngine.evaluateCleaningRecommendation(
      latestDay.soilingScore,
      appState.weather,
      appState.siteProfile
    );

    appState.diurnalPowerData = window.SolarPowerModule.generate24HourDiurnalCurve(
      appState.siteProfile.capacityKw,
      latestDay.soilingScore,
      appState.weather.cloudCoverPct
    );

    updateDashboardUI(latestDay);
    updateWeatherUI();
    updateAIRecommendationUI();
    renderAllCharts();
    updateCalculatorUI();
  }

  function updateDashboardUI(latestDay) {
    const site = appState.siteProfile;
    
    setElemText('kpi-capacity', site.capacityKw >= 1000 ? `${(site.capacityKw / 1000).toFixed(1)} MW` : `${site.capacityKw} kW`);
    setElemText('kpi-efficiency', `${latestDay.efficiencyPct}%`);
    setElemText('kpi-soiling', `${latestDay.soilingScore}%`);
    setElemText('kpi-loss-kwh', `${latestDay.energyLossKwh} kWh`);
    setElemText('kpi-cleaning-date', appState.recommendation.predictedCleaningDate);
    setElemText('kpi-cost-savings', `$${appState.recommendation.dailyRevenueLostUsd}/day`);
    setElemText('kpi-water-saved', `${site.waterLitresPerClean} L`);
  }

  function updateWeatherUI() {
    const w = appState.weather;
    if (!w) return;

    setElemText('wt-temp', `${w.temperatureC}°C`);
    setElemText('wt-humidity', `${w.humidityPct}%`);
    setElemText('wt-wind', `${w.windSpeedKmh} km/h`);
    setElemText('wt-rain', `${w.tomorrowRainForecastMm} mm`);
    setElemText('wt-irradiance', `${w.solarIrradiance} W/m²`);

    const weatherDetailElem = document.getElementById('weather-detail-card');
    if (weatherDetailElem) {
      weatherDetailElem.innerHTML = `
        <div class="grid-2col" style="margin-bottom: 0;">
          <div>
            <h4 style="color: var(--cyber-cyan-glow); margin-bottom: 0.5rem;">Current Solar Weather Parameters</h4>
            <p>• Ambient Temperature: <strong>${w.temperatureC}°C</strong></p>
            <p>• Relative Humidity: <strong>${w.humidityPct}%</strong></p>
            <p>• Surface Wind Speed: <strong>${w.windSpeedKmh} km/h</strong></p>
            <p>• Cloud Cover: <strong>${w.cloudCoverPct}%</strong></p>
            <p>• Direct Irradiance: <strong>${w.solarIrradiance} W/m²</strong></p>
          </div>
          <div>
            <h4 style="color: var(--solar-yellow-glow); margin-bottom: 0.5rem;">7-Day Rainfall Forecast & Washing Impact</h4>
            <p>• Tomorrow Rainfall Forecast: <strong>${w.tomorrowRainForecastMm} mm</strong></p>
            <p>• 7-Day Total Precipitation: <strong>${w.weekRainForecastMm} mm</strong></p>
            <p>• Natural Rain Washing Potential: <strong class="kpi-badge good">${w.tomorrowRainForecastMm >= 4 ? 'HIGH (Auto-Clean Active)' : 'LOW (Dry Period)'}</strong></p>
          </div>
        </div>
      `;
    }
  }

  function updateAIRecommendationUI() {
    const rec = appState.recommendation;
    if (!rec) return;

    const headlineElem = document.getElementById('ai-rec-headline');
    if (headlineElem) headlineElem.textContent = rec.headline;

    const reasoningElem = document.getElementById('ai-rec-reasoning');
    if (reasoningElem) {
      reasoningElem.innerHTML = rec.reasoning.map(r => `<p style="margin-bottom: 0.4rem;">${r}</p>`).join('');
    }

    setElemText('ai-confidence-val', `${rec.confidenceScore}%`);
    setElemText('ai-payback-val', `${rec.daysToPaybackWashing} Days`);
    setElemText('ai-loss-val', `$${rec.dailyRevenueLostUsd}`);
  }

  function renderAllCharts() {
    if (!window.SolarChartsModule || appState.dataset.length === 0) return;

    window.SolarChartsModule.renderSoilingTrendChart('chart-soiling-trend', appState.dataset);
    window.SolarChartsModule.renderPowerCurveChart('chart-power-curve', appState.diurnalPowerData);
    window.SolarChartsModule.renderRainVsDustChart('chart-rain-dust', appState.dataset);
    window.SolarChartsModule.renderMonthlyProductionChart('chart-monthly-prod');
  }

  // Vision Dust Detection Handlers
  function setupVisionModuleHandlers() {
    const canvas = document.getElementById('vision-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    window.SolarVisionModule.drawSyntheticPanel(canvas, ctx, 'slight');
    runVisionAnalysis('slight');

    document.querySelectorAll('.sample-img-thumb').forEach(thumb => {
      thumb.addEventListener('click', () => {
        document.querySelectorAll('.sample-img-thumb').forEach(t => t.classList.remove('selected'));
        thumb.classList.add('selected');
        
        const preset = thumb.getAttribute('data-preset');
        appState.selectedVisionPreset = preset;
        window.SolarVisionModule.drawSyntheticPanel(canvas, ctx, preset);
        runVisionAnalysis(preset);
      });
    });

    const dropzone = document.getElementById('vision-dropzone');
    const fileInput = document.getElementById('vision-file-input');

    if (dropzone && fileInput) {
      dropzone.addEventListener('click', () => fileInput.click());
      dropzone.addEventListener('dragover', (e) => { e.preventDefault(); dropzone.classList.add('dragover'); });
      dropzone.addEventListener('dragleave', () => dropzone.classList.remove('dragover'));
      dropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropzone.classList.remove('dragover');
        if (e.dataTransfer.files.length > 0) handleUserUploadedImage(e.dataTransfer.files[0]);
      });
      fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) handleUserUploadedImage(e.target.files[0]);
      });
    }

    const btnHeatmap = document.getElementById('btn-toggle-heatmap');
    if (btnHeatmap) {
      btnHeatmap.addEventListener('click', () => {
        const lastRes = window.SolarVisionModule.getLastResult();
        if (lastRes && lastRes.heatmapData) {
          ctx.putImageData(lastRes.heatmapData, 0, 0);
          showToast('Heatmap overlay toggled!', 'good');
        }
      });
    }
  }

  function handleUserUploadedImage(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.getElementById('vision-canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = 400;
        canvas.height = 280;
        ctx.drawImage(img, 0, 0, 400, 280);
        runVisionAnalysis(null);
        showToast('Solar panel photo analyzed successfully!', 'good');
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  function runVisionAnalysis(preset) {
    const canvas = document.getElementById('vision-canvas');
    const ctx = canvas.getContext('2d');
    const res = window.SolarVisionModule.analyzeCanvasImage(canvas, ctx, preset);

    if (res) {
      setElemText('vision-dust-pct', `${res.dustPercentage}%`);
      setElemText('vision-condition', res.condition);
      setElemText('vision-confidence', `${res.confidence}%`);
      setElemText('vision-recommendation', res.recommendation);
    }
  }

  // Calculator Handlers
  function setupCalculatorHandlers() {
    ['calc-capacity', 'calc-tariff', 'calc-wash-cost', 'calc-water'].forEach(id => {
      const input = document.getElementById(id);
      if (input) {
        input.addEventListener('input', updateCalculatorUI);
      }
    });
  }

  function updateCalculatorUI() {
    if (!window.SolarCalculatorModule) return;

    const capacityKw = getInputValue('calc-capacity', appState.siteProfile ? appState.siteProfile.capacityKw : 250);
    const tariff = getInputValue('calc-tariff', appState.siteProfile ? appState.siteProfile.tariffPerKwh : 0.15);
    const washCost = getInputValue('calc-wash-cost', appState.siteProfile ? appState.siteProfile.washCostPerClean : 150);
    const waterPerWash = getInputValue('calc-water', appState.siteProfile ? appState.siteProfile.waterLitresPerClean : 600);

    setElemText('lbl-calc-capacity', `${capacityKw} kW`);
    setElemText('lbl-calc-tariff', `$${tariff}/kWh`);
    setElemText('lbl-calc-wash-cost', `$${washCost}`);
    setElemText('lbl-calc-water', `${waterPerWash} L`);

    const res = window.SolarCalculatorModule.calculateSustainabilityImpact({
      capacityKw,
      tariff,
      washCost,
      waterPerWash,
      soilingPct: appState.dataset.length > 0 ? appState.dataset[appState.dataset.length - 1].soilingScore : 10
    });

    setElemText('calc-res-savings', `$${res.totalNetAnnualSavingsUsd.toLocaleString()}`);
    setElemText('calc-res-water', `${res.annualWaterSavedLitres.toLocaleString()} L`);
    setElemText('calc-res-mwh', `${res.annualEnergyRecoveredMwh} MWh`);
    setElemText('calc-res-co2', `${res.co2OffsetTons} Tons`);
  }

  // AI Chatbot Handlers
  function setupChatbotHandlers() {
    const fab = document.getElementById('chat-fab');
    const modal = document.getElementById('chat-modal');
    const closeBtn = document.getElementById('chat-close');
    const sendBtn = document.getElementById('chat-send');
    const input = document.getElementById('chat-input');

    if (fab && modal) {
      fab.addEventListener('click', () => modal.classList.toggle('open'));
    }
    if (closeBtn) {
      closeBtn.addEventListener('click', () => modal.classList.remove('open'));
    }

    function sendMsg() {
      const txt = input.value.trim();
      if (!txt) return;

      appendChatMessage('user', txt);
      input.value = '';

      setTimeout(() => {
        const botReply = window.SolarChatbotModule.processUserQuery(txt, appState);
        appendChatMessage('bot', botReply);
      }, 400);
    }

    if (sendBtn) sendBtn.addEventListener('click', sendMsg);
    if (input) {
      input.addEventListener('keypress', (e) => { if (e.key === 'Enter') sendMsg(); });
    }

    document.querySelectorAll('.chip-btn').forEach(chip => {
      chip.addEventListener('click', () => {
        input.value = chip.textContent;
        sendMsg();
      });
    });
  }

  function appendChatMessage(sender, text) {
    const msgBox = document.getElementById('chat-messages');
    if (!msgBox) return;

    const div = document.createElement('div');
    div.className = `chat-msg ${sender}`;
    div.innerHTML = text.replace(/\n/g, '<br>');
    msgBox.appendChild(div);
    msgBox.scrollTop = msgBox.scrollHeight;
  }

  // CSV Inverter File Upload Handler
  function setupCSVUploadHandler() {
    const csvBtn = document.getElementById('btn-upload-csv');
    const csvInput = document.getElementById('csv-file-input');

    if (csvBtn && csvInput) {
      csvBtn.addEventListener('click', () => csvInput.click());
      csvInput.addEventListener('change', (e) => {
        if (e.target.files.length === 0) return;
        const reader = new FileReader();
        reader.onload = (evt) => {
          const parsed = window.SolarPowerModule.parseInverterCSV(evt.target.result);
          if (parsed && parsed.length > 0) {
            appState.diurnalPowerData = parsed;
            window.SolarChartsModule.renderPowerCurveChart('chart-power-curve', parsed);
            showToast(`Parsed ${parsed.length} inverter data points!`, 'good');
          }
        };
        reader.readAsText(e.target.files[0]);
      });
    }
  }

  // Helper Functions
  function setElemText(id, txt) {
    const elem = document.getElementById(id);
    if (elem) elem.textContent = txt;
  }

  function getInputValue(id, fallback) {
    const elem = document.getElementById(id);
    return elem ? parseFloat(elem.value) || fallback : fallback;
  }

  function showToast(msg, type = 'good') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = msg;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

})();
