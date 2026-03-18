// ============================================================
// EcoTrack — dashboard.js (Dashboard Page Logic)
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
  initAwareness();
  updateDashboard();
});

// ---- Awareness Banner ----
let awarenessIndex = 0;
let awarenessPaused = false;

function initAwareness() {
  const facts = APP.FACTS;
  const textEl = document.getElementById('awareness-text');
  const dotsEl = document.getElementById('awareness-dots');
  if (!textEl || !dotsEl) return;

  // Create dots
  dotsEl.innerHTML = '';
  const dotLimit = Math.min(facts.length, 8);
  for (let i = 0; i < dotLimit; i++) {
    const dot = document.createElement('div');
    dot.className = 'awareness-dot' + (i === 0 ? ' active' : '');
    dotsEl.appendChild(dot);
  }

  const showFact = (idx) => {
    const dots = dotsEl.querySelectorAll('.awareness-dot');
    textEl.classList.add('fade-out');
    setTimeout(() => {
      textEl.textContent = facts[idx];
      textEl.classList.remove('fade-out');
      textEl.classList.add('fade-in');
      dots.forEach((d, i) => d.classList.toggle('active', i === idx % dotLimit));
      setTimeout(() => textEl.classList.remove('fade-in'), 500);
    }, 450);
  };

  showFact(0);
  // Reset & restart progress bar animation
  const bar = document.getElementById('awareness-bar');
  const resetBar = () => {
    if (bar) { bar.style.animation = 'none'; bar.offsetHeight; bar.style.animation = ''; }
  };
  resetBar();

  setInterval(() => {
    if (awarenessPaused) return;
    awarenessIndex = (awarenessIndex + 1) % facts.length;
    showFact(awarenessIndex);
    resetBar();
  }, 6000);

  // Pause on hover
  const card = document.querySelector('.awareness-card');
  if (card) {
    card.addEventListener('mouseenter', () => awarenessPaused = true);
    card.addEventListener('mouseleave', () => awarenessPaused = false);
  }
}

// ---- Dashboard Stats ----
function updateDashboard() {
  const logs  = APP.getLogs();
  const goals = APP.getGoals();

  const todayCO2 = APP.sumCO2(logs, l => APP.isToday(l.ts));
  const weekCO2  = APP.sumCO2(logs, l => APP.isThisWeek(l.ts));
  const monthCO2 = APP.sumCO2(logs, l => APP.isThisMonth(l.ts));

  // Update ring values + text
  const updateRing = (id, valId, goalInfoId, value, goalVal, suffix) => {
    const ringEl = document.getElementById(id);
    const valEl  = document.getElementById(valId);
    const infoEl = document.getElementById(goalInfoId ? goalInfoId.replace('info', 'display') : null);
    if (valEl) valEl.textContent = value.toFixed(1);
    if (infoEl) infoEl.textContent = goalVal ? goalVal.toFixed(0) + ' kg' : '—';

    if (ringEl) {
      const pct = goalVal > 0 ? Math.min(value / goalVal, 1) : 0;
      const circumference = 314;
      const offset = circumference - pct * circumference;
      setTimeout(() => { ringEl.style.strokeDashoffset = offset; }, 100);
    }
  };

  updateRing('ring-today', 'ring-today-val', 'today-goal-info', todayCO2, goals.daily, 'kg');
  updateRing('ring-week',  'ring-week-val',  'week-goal-info',  weekCO2,  goals.daily * 7, 'kg');
  updateRing('ring-month', 'ring-month-val', 'month-goal-info', monthCO2, goals.monthly, 'kg');

  // Trees equivalent (each tree ~22 kg/year, so per month ~1.83 kg)
  const treesNeeded = Math.max(0, Math.ceil(monthCO2 / 1.83));
  const treesEl = document.getElementById('trees-num');
  if (treesEl) treesEl.textContent = treesNeeded;
  const treesRow = document.getElementById('trees-row');
  if (treesRow) {
    treesRow.innerHTML = Array.from({ length: Math.min(treesNeeded, 20) }, () => '🌳').join('') +
      (treesNeeded > 20 ? ` +${treesNeeded - 20}` : '');
  }

  // Goal info display
  const todayGoalD = document.getElementById('today-goal-display');
  const weekGoalD  = document.getElementById('week-goal-display');
  const monthGoalD = document.getElementById('month-goal-display');
  if (todayGoalD) todayGoalD.textContent = goals.daily + ' kg';
  if (weekGoalD)  weekGoalD.textContent  = (goals.daily * 7).toFixed(0) + ' kg';
  if (monthGoalD) monthGoalD.textContent = goals.monthly + ' kg';

  // Motivational card
  updateMotivational(monthCO2, weekCO2, todayCO2, logs, goals);

  // Recent activities
  renderRecentActivities(logs.slice(0, 8));

  // Category breakdown
  renderBreakdown(logs.filter(l => APP.isThisMonth(l.ts)));
}

function updateMotivational(monthCO2, weekCO2, todayCO2, logs, goals) {
  const iconEl = document.getElementById('motive-icon');
  const bodyEl = document.getElementById('motive-body');
  const ctaEl  = document.querySelector('.motive-cta');
  if (!bodyEl) return;

  if (!logs.length) {
    iconEl.textContent = '🚀';
    bodyEl.innerHTML = '<p>Ready to start your green journey? Log your first activity to see your personalized impact!</p>';
    return;
  }

  const monthGoal = goals.monthly;
  const pct = monthGoal > 0 ? (monthCO2 / monthGoal) * 100 : 0;
  const treeSaved = Math.floor((monthGoal - monthCO2) / 1.83);

  let msgs = [];
  if (pct < 30) {
    iconEl.textContent = '🌟';
    msgs = [
      `You're in the top 10–15% of EcoTrack users this month! You emit only <strong>${monthCO2.toFixed(1)} kg</strong> vs your ${monthGoal} kg goal.`,
      `Amazing! You've saved <strong>${(monthGoal - monthCO2).toFixed(1)} kg CO₂</strong> — equivalent to planting ${Math.max(0, treeSaved)} trees!`,
    ];
  } else if (pct < 70) {
    iconEl.textContent = '🌿';
    msgs = [
      `Good progress! You're at <strong>${monthCO2.toFixed(1)} kg CO₂</strong> this month — <strong>${(monthGoal - monthCO2).toFixed(1)} kg</strong> to spare.`,
      `You prevented <strong>${todayCO2.toFixed(2)} kg CO₂</strong> today! Try switching to metro or cycling for bigger wins.`,
    ];
  } else if (pct < 100) {
    iconEl.textContent = '⚠️';
    msgs = [
      `Watch out! You're at <strong>${monthCO2.toFixed(1)} kg</strong> — only <strong>${(monthGoal - monthCO2).toFixed(1)} kg</strong> left before hitting your monthly goal.`,
      `Consider plant-based meals or metro travel this week — they can cut your footprint by 50%!`,
    ];
  } else {
    iconEl.textContent = '🌋';
    msgs = [
      `You've exceeded your monthly goal by <strong>${(monthCO2 - monthGoal).toFixed(1)} kg</strong>. Time for green choices! Try cycling or vegetarian meals.`,
    ];
  }

  bodyEl.innerHTML = `<p>${msgs[Math.floor(Math.random() * msgs.length)]}</p>`;
  if (ctaEl) ctaEl.innerHTML = `<a href="log.html" class="btn-secondary">Log Activity →</a>`;
}

function renderRecentActivities(logs) {
  const listEl = document.getElementById('recent-list');
  if (!listEl) return;

  if (!logs.length) {
    listEl.innerHTML = `<div class="empty-state">
      <div class="empty-icon">📊</div>
      <p>No activities logged yet.</p>
      <a href="log.html" class="btn-primary">Log Your First Activity</a>
    </div>`;
    return;
  }

  const catColors = {
    transport: '#00d4ff', food: '#00ff88', energy: '#ffd700',
    shopping: '#7b2fff', water: '#00aaff', custom: '#ff6b6b',
  };

  listEl.innerHTML = logs.map(log => {
    const cat = APP.CATEGORIES[log.category] || { icon: '📦', color: '#888' };
    const color = catColors[log.category] || '#888';
    const date  = new Date(log.ts);
    const timeStr = date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    const dateStr = APP.isToday(log.ts) ? 'Today' :
      date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
    return `
      <div class="activity-item" data-id="${log.id}">
        <div class="activity-icon-wrap" style="background: ${color}20; border: 1px solid ${color}30;">
          <span>${cat.icon}</span>
        </div>
        <div class="activity-info">
          <div class="activity-name">${log.label || 'Activity'}</div>
          <div class="activity-meta">${cat.label} · ${dateStr} ${timeStr}</div>
        </div>
        <div>
          <div class="activity-co2" style="color: ${color}">${log.co2.toFixed(2)}</div>
          <div class="activity-co2-unit">kg CO₂</div>
        </div>
        <button class="activity-delete" onclick="deleteActivity('${log.id}')" title="Delete">✕</button>
      </div>
    `;
  }).join('');
}

function renderBreakdown(logs) {
  const section = document.getElementById('breakdown-section');
  const grid    = document.getElementById('breakdown-grid');
  if (!section || !grid || !logs.length) { if (section) section.style.display = 'none'; return; }

  const catData = {};
  logs.forEach(l => {
    catData[l.category] = (catData[l.category] || 0) + l.co2;
  });

  const total = Object.values(catData).reduce((s, v) => s + v, 0);
  const catColors = {
    transport: '#00d4ff', food: '#00ff88', energy: '#ffd700',
    shopping: '#7b2fff', water: '#00aaff', custom: '#ff6b6b',
  };

  grid.innerHTML = Object.entries(catData)
    .sort((a, b) => b[1] - a[1])
    .map(([cat, val]) => {
      const info  = APP.CATEGORIES[cat] || { icon: '📦', label: cat };
      const color = catColors[cat] || '#888';
      const pct   = total > 0 ? (val / total) * 100 : 0;
      return `<div class="breakdown-item">
        <div class="breakdown-emoji">${info.icon}</div>
        <div class="breakdown-label">${info.label}</div>
        <div class="breakdown-val" style="color:${color}">${val.toFixed(1)} kg</div>
        <div class="breakdown-bar-wrap">
          <div class="breakdown-bar" style="width:${pct}%; background:${color}"></div>
        </div>
      </div>`;
    }).join('');

  section.style.display = 'block';
}

function deleteActivity(id) {
  APP.deleteLog(id);
  APP.toast('Activity deleted', 'info');
  updateDashboard();
}
