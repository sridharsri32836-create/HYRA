// ============================================================
// EcoTrack — app.js (Core Utilities, State, Storage)
// ============================================================

const APP = {
  VERSION: '1.0.0',
  CURRENT_DATE: new Date('2026-03-18T10:30:49+05:30'),

  // -- Emission Factors (kg CO2) --
  FACTORS: {
    transport: {
      car_petrol:    { label: 'Petrol Car', unit: 'km', factor: 0.20,  icon: '🚗' },
      car_diesel:    { label: 'Diesel Car', unit: 'km', factor: 0.17,  icon: '🚙' },
      car_electric:  { label: 'Electric Car', unit: 'km', factor: 0.04, icon: '⚡🚗' },
      bike_petrol:   { label: 'Petrol Bike/Scooter', unit: 'km', factor: 0.09, icon: '🏍️' },
      bike_electric: { label: 'E-Scooter / E-Bike', unit: 'km', factor: 0.05, icon: '🛵' },
      auto:          { label: 'Auto Rickshaw', unit: 'km', factor: 0.08,  icon: '🛺' },
      bus:           { label: 'City Bus', unit: 'km', factor: 0.04,  icon: '🚌' },
      metro:         { label: 'Metro / Train', unit: 'km', factor: 0.01, icon: '🚇' },
      flight_dom:    { label: 'Domestic Flight', unit: 'km', factor: 0.15, icon: '✈️' },
      flight_intl:   { label: 'International Flight', unit: 'km', factor: 0.30, icon: '🌍✈️' },
      bicycle:       { label: 'Bicycle / Walk', unit: 'km', factor: 0.00,  icon: '🚲' },
    },
    food: {
      beef:      { label: 'Beef / Mutton', unit: 'g', factor: 0.015,  icon: '🥩' },
      chicken:   { label: 'Chicken', unit: 'g', factor: 0.0035, icon: '🍗' },
      fish:      { label: 'Fish / Seafood', unit: 'g', factor: 0.003,  icon: '🐟' },
      egg:       { label: 'Eggs', unit: 'units', factor: 0.10,  icon: '🥚' },
      dairy:     { label: 'Dairy (milk/paneer)', unit: 'g', factor: 0.0033, icon: '🥛' },
      veg_meal:  { label: 'Vegetarian Meal', unit: 'servings', factor: 0.60,  icon: '🥗' },
      vegan_meal:{ label: 'Vegan Meal', unit: 'servings', factor: 0.30,  icon: '🌱' },
      rice:      { label: 'Rice / Wheat', unit: 'g', factor: 0.0012, icon: '🍚' },
      food_waste:{ label: 'Food Waste (thrown)', unit: 'g', factor: 0.0025, icon: '🗑️' },
    },
    energy: {
      electricity: { label: 'Electricity (India Grid)', unit: 'kWh', factor: 0.70, icon: '💡' },
      lpg:         { label: 'LPG Cylinder Gas', unit: 'kg',  factor: 2.98, icon: '🔥' },
      png:         { label: 'Piped Natural Gas', unit: 'm³', factor: 2.04, icon: '🔵' },
      generator:   { label: 'DG / Generator', unit: 'kWh', factor: 0.75, icon: '⚙️' },
      solar:       { label: 'Solar (own)', unit: 'kWh', factor: 0.00, icon: '☀️' },
    },
    shopping: {
      clothing:    { label: 'Clothing / Shoes', unit: 'items', factor: 15.0, icon: '👕' },
      electronics: { label: 'Electronics', unit: 'items', factor: 300.0, icon: '📱' },
      delivery:    { label: 'Online Delivery', unit: 'packages', factor: 0.50, icon: '📦' },
      furniture:   { label: 'Furniture', unit: 'items', factor: 50.0, icon: '🛋️' },
      book:        { label: 'Book / Paper Products', unit: 'items', factor: 1.5,  icon: '📚' },
    },
    water: {
      shower_hot:  { label: 'Hot Shower', unit: 'minutes', factor: 0.13, icon: '🚿' },
      washing:     { label: 'Washing Machine Load', unit: 'loads', factor: 0.60, icon: '🧺' },
      dishwasher:  { label: 'Dishwasher', unit: 'cycles', factor: 0.50, icon: '🍽️' },
    },
    custom: {
      custom:      { label: 'Custom Activity', unit: 'kg CO₂', factor: 1.0, icon: '🏭' },
    },
  },

  // -- Awareness Facts --
  FACTS: [
    "🌍 Global CO₂ reached ~429 ppm in early 2026 — the highest concentration in millions of years.",
    "🇮🇳 India's electricity grid emits ~0.70 kg CO₂ per kWh — switching to renewables can slash this.",
    "🚗 A petrol car in India emits ~0.20 kg CO₂ per km — metro / buses bring this down to 0.01–0.04 kg.",
    "🌳 One tree absorbs roughly 22 kg of CO₂ per year — every 22 kg saved ≈ planting a new tree!",
    "🍔 Beef produces 15–27 kg CO₂ per kg; a plant-based burger emits just 1–3 kg — 10× lower impact.",
    "✈️ A Delhi–San Francisco flight emits ~1.2–2 tonnes CO₂ per passenger — one of the biggest individual decisions.",
    "💡 Switching 5 LED bulbs saves 50–80 kg CO₂ per year versus old incandescent bulbs.",
    "🗑️ Food waste contributes ~8% of India's national greenhouse gas emissions — every bite counts!",
    "🛵 An electric 2-wheeler in India emits 0.03–0.08 kg CO₂/km vs a petrol scooter's 0.09 kg — switch today!",
    "🌾 Rice paddies in India contribute methane — a gas 80× more potent than CO₂ over 20 years.",
    "🎆 During Diwali 2025, firecrackers contributed thousands of tonnes of CO₂ with severe AQI spikes across cities.",
    "🌞 India's installed solar capacity crossed 100 GW in 2025 — but coal still generates 70% of electricity.",
    "💧 It takes ~2,500 litres of water (with significant CO₂ cost) to produce just 1 kg of beef.",
    "🏭 Top 1% of global emitters (mostly corporations) produce as much CO₂ as the bottom 50% combined.",
    "🚌 Carpooling or taking the bus for your daily commute can cut your transport emissions by up to 80%.",
    "☀️ A 3 kW rooftop solar system in India can prevent ~3–4 tonnes of CO₂ emissions per year.",
    "🌀 Extreme weather events in India (cyclones, floods, droughts) are intensifying due to rising CO₂ levels.",
    "📱 Keeping your smartphone for 4 years instead of 2 halves its lifecycle carbon footprint (≈ 70 kg saved).",
    "🧺 Washing clothes in cold water cuts the laundry energy footprint by up to 90% vs hot wash cycles.",
    "🥦 A 100% plant-based diet saves up to 1.5 tonnes of CO₂ per person per year — the biggest individual change.",
    "🌧️ India's monsoon season is becoming more erratic — a direct consequence of rising global temperatures.",
    "🚂 Indian Railways aims to become the world's first net-zero railway by 2030 — already 94% electrified.",
    "🌡️ Each 1°C rise in global temperature costs India ~2.8% of GDP in climate adaptation and damage.",
    "🏙️ Urban heat islands in Delhi, Mumbai, Chennai add 2–4°C — more AC usage → more emissions → more heat.",
  ],

  // -- Category Metadata --
  CATEGORIES: {
    transport: { label: 'Transport', icon: '🚗', color: '#00d4ff' },
    food:      { label: 'Food', icon: '🍽️', color: '#00ff88' },
    energy:    { label: 'Energy', icon: '⚡', color: '#ffd700' },
    shopping:  { label: 'Shopping', icon: '🛍️', color: '#7b2fff' },
    water:     { label: 'Water', icon: '💧', color: '#00aaff' },
    custom:    { label: 'Custom', icon: '🏭', color: '#ff6b6b' },
  },

  // -- Storage Keys --
  KEYS: {
    LOGS: 'ecotrack_logs',
    SETTINGS: 'ecotrack_settings',
    GOALS: 'ecotrack_goals',
    BADGES: 'ecotrack_badges',
  },

  // ---- Storage Helpers ----
  getLogs() {
    try { return JSON.parse(localStorage.getItem(this.KEYS.LOGS) || '[]'); }
    catch { return []; }
  },
  saveLogs(logs) {
    localStorage.setItem(this.KEYS.LOGS, JSON.stringify(logs));
  },
  addLog(entry) {
    const logs = this.getLogs();
    entry.id = Date.now().toString();
    entry.ts = new Date().toISOString();
    logs.unshift(entry);
    this.saveLogs(logs);
    return entry;
  },
  deleteLog(id) {
    const logs = this.getLogs().filter(l => l.id !== id);
    this.saveLogs(logs);
  },

  getSettings() {
    try { return JSON.parse(localStorage.getItem(this.KEYS.SETTINGS) || '{}'); }
    catch { return {}; }
  },
  saveSettings(s) {
    localStorage.setItem(this.KEYS.SETTINGS, JSON.stringify({ ...this.getSettings(), ...s }));
  },

  getGoals() {
    try { return JSON.parse(localStorage.getItem(this.KEYS.GOALS) || '{"monthly": 50, "daily": 5}'); }
    catch { return { monthly: 50, daily: 5 }; }
  },
  saveGoals(g) {
    localStorage.setItem(this.KEYS.GOALS, JSON.stringify(g));
  },

  getBadges() {
    try { return JSON.parse(localStorage.getItem(this.KEYS.BADGES) || '[]'); }
    catch { return []; }
  },
  saveBadges(b) {
    localStorage.setItem(this.KEYS.BADGES, JSON.stringify(b));
  },

  // ---- Calculation Helpers ----
  calcCO2(category, sub, quantity) {
    const cat = this.FACTORS[category];
    if (!cat) return 0;
    const item = cat[sub];
    if (!item) return 0;
    return parseFloat((item.factor * parseFloat(quantity || 0)).toFixed(3));
  },

  // ---- Date Helpers ----
  isToday(isoStr) {
    const d = new Date(isoStr);
    const now = this.CURRENT_DATE;
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
  },
  isThisWeek(isoStr) {
    const d = new Date(isoStr);
    const now = this.CURRENT_DATE;
    const weekAgo = new Date(now); weekAgo.setDate(now.getDate() - 7);
    return d >= weekAgo && d <= now;
  },
  isThisMonth(isoStr) {
    const d = new Date(isoStr);
    const now = this.CURRENT_DATE;
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
  },

  sumCO2(logs, filterFn) {
    return logs.filter(filterFn).reduce((sum, l) => sum + (l.co2 || 0), 0);
  },

  // ---- Toast Notifications ----
  _toastContainer: null,
  ensureToastContainer() {
    if (!this._toastContainer) {
      this._toastContainer = document.createElement('div');
      this._toastContainer.className = 'toast-container';
      document.body.appendChild(this._toastContainer);
    }
    return this._toastContainer;
  },
  toast(msg, type = 'info', duration = 3500) {
    const container = this.ensureToastContainer();
    const icons = { success: '✅', error: '❌', info: 'ℹ️' };
    const el = document.createElement('div');
    el.className = `toast ${type}`;
    el.innerHTML = `<span>${icons[type]}</span><span>${msg}</span>`;
    container.appendChild(el);
    setTimeout(() => {
      el.classList.add('removing');
      setTimeout(() => el.remove(), 300);
    }, duration);
  },

  // ---- Confetti ----
  launchConfetti() {
    const colors = ['#00ff88', '#00d4ff', '#ffd700', '#7b2fff', '#ff4d6d', '#fff'];
    for (let i = 0; i < 80; i++) {
      setTimeout(() => {
        const el = document.createElement('div');
        el.className = 'confetti-piece';
        el.style.left = Math.random() * 100 + 'vw';
        el.style.background = colors[Math.floor(Math.random() * colors.length)];
        el.style.width = (6 + Math.random() * 8) + 'px';
        el.style.height = (6 + Math.random() * 8) + 'px';
        el.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
        const dur = 2 + Math.random() * 2;
        el.style.animation = `confettiFall ${dur}s linear forwards`;
        el.style.animationDelay = (Math.random() * 0.5) + 's';
        document.body.appendChild(el);
        setTimeout(() => el.remove(), (dur + 0.5) * 1000);
      }, i * 20);
    }
  },

  // ---- Sidebar Toggle ----
  initSidebar() {
    const sidebar = document.getElementById('sidebar');
    const toggle  = document.getElementById('menu-toggle');
    if (!sidebar || !toggle) return;
    let overlay = document.querySelector('.sidebar-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.className = 'sidebar-overlay';
      document.body.appendChild(overlay);
    }
    const open = () => { sidebar.classList.add('open'); overlay.classList.add('visible'); };
    const close = () => { sidebar.classList.remove('open'); overlay.classList.remove('visible'); };
    toggle.addEventListener('click', () => sidebar.classList.contains('open') ? close() : open());
    overlay.addEventListener('click', close);
  },

  // ---- Active Nav ----
  setActiveNav() {
    const page = location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-item, .bottom-item').forEach(a => {
      a.classList.toggle('active', a.getAttribute('href') === page ||
        (page === '' && a.getAttribute('href') === 'index.html'));
    });
  },

  // ---- Greeting ----
  setGreeting() {
    const el = document.getElementById('greeting-text');
    if (!el) return;
    const h = this.CURRENT_DATE.getHours();
    const settings = this.getSettings();
    const name = settings.name || 'Eco Warrior';
    const greetings = [
      [5,  'Good early morning'],
      [12, 'Good morning'],
      [17, 'Good afternoon'],
      [21, 'Good evening'],
      [24, 'Good night'],
    ];
    const g = greetings.find(([lim]) => h < lim) || greetings[greetings.length - 1];
    el.textContent = `${g[0] > 17 ? '🌙' : '🌿'} ${g[1]}, ${name}!`;
  },

  // ---- Date Display ----
  setDateDisplay() {
    const el = document.getElementById('date-display');
    if (!el) return;
    el.textContent = this.CURRENT_DATE.toLocaleDateString('en-IN', { weekday: 'short', year: 'numeric', month: 'long', day: 'numeric' });
  },

  // ---- CO2 Ticker ----
  startTicker() {
    let base = 429.3;
    const update = () => {
      const drift = (Math.random() - 0.5) * 0.04;
      base = Math.max(428.0, Math.min(430.5, base + drift));
      const val = base.toFixed(1);
      const el1 = document.getElementById('ticker-main-val');
      const el2 = document.getElementById('ticker-mini-val');
      if (el1) el1.innerHTML = val + '<span class="ticker-unit">ppm</span>';
      if (el2) el2.textContent = val + ' ppm';
    };
    update();
    setInterval(update, 3000);
  },

  // ---- Badge Check ----
  BADGE_DEFS: [
    { id: 'first_log',   name: 'First Step',    emoji: '🌱', desc: 'Log your first activity',            check: (logs) => logs.length >= 1 },
    { id: 'week_streak', name: 'Week Warrior',  emoji: '🔥', desc: 'Log every day for 7 days',           check: (logs) => APP.checkStreak(logs) >= 7 },
    { id: 'under_goal',  name: 'Goal Crusher',  emoji: '🎯', desc: 'Stay under daily goal for a week',  check: (logs) => APP.checkUnderGoalDays(logs) >= 7 },
    { id: 'veg_hero',    name: 'Green Eater',   emoji: '🥗', desc: 'Log 5 vegetarian meals',             check: (logs) => logs.filter(l => l.sub === 'veg_meal' || l.sub === 'vegan_meal').length >= 5 },
    { id: 'no_car',      name: 'Car-Free',      emoji: '🚲', desc: 'Log 3 bike/walk trips',              check: (logs) => logs.filter(l => l.sub === 'bicycle').length >= 3 },
    { id: 'solar_star',  name: 'Solar Star',    emoji: '☀️', desc: 'Log solar energy use',              check: (logs) => logs.filter(l => l.sub === 'solar').length >= 1 },
    { id: 'long_log',    name: 'Data Nerd',     emoji: '📊', desc: 'Log 30+ activities',                 check: (logs) => logs.length >= 30 },
    { id: 'low_month',   name: 'Eco Champion',  emoji: '🏆', desc: 'Under 20 kg CO₂ in a month',        check: (logs) => APP.sumCO2(logs, l => APP.isThisMonth(l.ts)) < 20 && logs.filter(l => APP.isThisMonth(l.ts)).length > 5 },
  ],

  checkStreak(logs) {
    if (!logs.length) return 0;
    let streak = 0;
    let checkDate = new Date(this.CURRENT_DATE);
    for (let i = 0; i < 30; i++) {
      const dateStr = checkDate.toDateString();
      const hasLog = logs.some(l => new Date(l.ts).toDateString() === dateStr);
      if (hasLog) streak++;
      else if (i > 0) break;
      checkDate.setDate(checkDate.getDate() - 1);
    }
    return streak;
  },

  checkUnderGoalDays(logs) {
    const goals = this.getGoals();
    let days = 0;
    for (let i = 0; i < 7; i++) {
      const d = new Date(this.CURRENT_DATE);
      d.setDate(d.getDate() - i);
      const dateStr = d.toDateString();
      const dayTotal = logs.filter(l => new Date(l.ts).toDateString() === dateStr)
        .reduce((s, l) => s + l.co2, 0);
      if (dayTotal > 0 && dayTotal <= goals.daily) days++;
    }
    return days;
  },

  checkAndAwardBadges() {
    const logs = this.getLogs();
    const earned = new Set(this.getBadges());
    const newBadges = [];
    for (const badge of this.BADGE_DEFS) {
      if (!earned.has(badge.id) && badge.check(logs)) {
        earned.add(badge.id);
        newBadges.push(badge);
      }
    }
    if (newBadges.length) {
      this.saveBadges([...earned]);
      newBadges.forEach(b => this.toast(`🏅 Badge Earned: ${b.name} ${b.emoji}`, 'success', 5000));
    }
  },

  // ---- Init ----
  init() {
    this.initSidebar();
    this.setActiveNav();
    this.setGreeting();
    this.setDateDisplay();
    this.startTicker();
  }
};

// Auto-init on DOM ready
document.addEventListener('DOMContentLoaded', () => APP.init());
