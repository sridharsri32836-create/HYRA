// ============================================================
// EcoTrack — goals.js (Goals & Gamification Page Logic)
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
  loadGoalInputs();
  renderStreak();
  renderBadges();
  renderMilestones();
  renderGoalProgress();
});

function loadGoalInputs() {
  const goals = APP.getGoals();
  const daily = document.getElementById('goal-daily');
  const monthly = document.getElementById('goal-monthly');
  if (daily) daily.value = goals.daily;
  if (monthly) monthly.value = goals.monthly;
}

function saveGoals() {
  const daily   = parseFloat(document.getElementById('goal-daily').value) || 5;
  const monthly = parseFloat(document.getElementById('goal-monthly').value) || 50;
  APP.saveGoals({ daily, monthly });
  APP.toast('✅ Goals saved!', 'success');
  renderGoalProgress();
}

function renderGoalProgress() {
  const logs    = APP.getLogs();
  const goals   = APP.getGoals();
  const monthCO2= APP.sumCO2(logs, l => APP.isThisMonth(l.ts));
  const pct     = goals.monthly > 0 ? Math.min((monthCO2 / goals.monthly) * 100, 100) : 0;

  const label = document.getElementById('goal-progress-label');
  const pctEl = document.getElementById('goal-progress-pct');
  const bar   = document.getElementById('goal-progress-bar');

  if (label) label.textContent = `${monthCO2.toFixed(1)} / ${goals.monthly} kg`;
  if (pctEl) pctEl.textContent = pct.toFixed(0) + '%';
  if (bar) {
    bar.style.width = pct + '%';
    bar.style.background = pct < 70
      ? 'linear-gradient(90deg, var(--neon-green), var(--teal))'
      : pct < 100
      ? 'linear-gradient(90deg, var(--gold), #ff9500)'
      : 'linear-gradient(90deg, var(--red), #ff9500)';
  }
}

function renderStreak() {
  const logs = APP.getLogs();
  const streak = APP.checkStreak(logs);
  const numEl = document.getElementById('streak-num');
  if (numEl) numEl.textContent = streak;

  const weekEl = document.getElementById('streak-week');
  if (!weekEl) return;
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(APP.CURRENT_DATE);
    d.setDate(d.getDate() - i);
    const dateStr = d.toDateString();
    const hasLog = logs.some(l => new Date(l.ts).toDateString() === dateStr);
    const label = ['Su','Mo','Tu','We','Th','Fr','Sa'][d.getDay()];
    days.push({ label, hasLog, isToday: i === 0 });
  }
  weekEl.innerHTML = days.map(d => `
    <div style="flex:1;text-align:center;">
      <div style="width:32px;height:32px;border-radius:50%;margin:0 auto 4px;
        background:${d.hasLog ? 'var(--neon-green)' : 'rgba(255,255,255,0.06)'};
        border:${d.isToday ? '2px solid var(--teal)' : '1px solid transparent'};
        display:flex;align-items:center;justify-content:center;font-size:1rem;">
        ${d.hasLog ? '✓' : ''}
      </div>
      <span style="font-size:0.65rem;color:var(--text-muted)">${d.label}</span>
    </div>
  `).join('');
}

function renderBadges() {
  const grid    = document.getElementById('badges-grid');
  const countEl = document.getElementById('badge-count');
  if (!grid) return;

  const earned  = new Set(APP.getBadges());
  const earnedCount = APP.BADGE_DEFS.filter(b => earned.has(b.id)).length;

  if (countEl) countEl.textContent = `${earnedCount} / ${APP.BADGE_DEFS.length} earned`;

  grid.innerHTML = APP.BADGE_DEFS.map(badge => {
    const hasIt = earned.has(badge.id);
    return `<div class="badge-card ${hasIt ? 'earned' : ''}">
      <div class="badge-emoji">${badge.emoji}</div>
      <div class="badge-name">${badge.name}</div>
      <div class="badge-desc">${badge.desc}</div>
      ${hasIt ? '<div class="badge-earned-label">✅ Earned!</div>' : '<div style="font-size:0.65rem;color:var(--text-muted);margin-top:6px;">Locked</div>'}
    </div>`;
  }).join('');
}

function renderMilestones() {
  const el   = document.getElementById('milestones-list');
  if (!el) return;
  const logs = APP.getLogs();
  const total= logs.reduce((s, l) => s + l.co2, 0);
  const goals = APP.getGoals();
  const monthCO2 = APP.sumCO2(logs, l => APP.isThisMonth(l.ts));

  const milestones = [
    { label: 'Log 1st Activity',    target: 1,   current: logs.length, unit: 'logs', emoji: '🌱' },
    { label: 'Log 10 Activities',   target: 10,  current: logs.length, unit: 'logs', emoji: '📊' },
    { label: 'Log 50 Activities',   target: 50,  current: logs.length, unit: 'logs', emoji: '🏅' },
    { label: 'Track 100 kg total',  target: 100, current: total, unit: 'kg',  emoji: '📈' },
    { label: 'Under goal this month', target: goals.monthly, current: monthCO2, unit: 'kg', emoji: '🎯', inverse: true },
    { label: '7-day streak',        target: 7,   current: APP.checkStreak(logs), unit: 'days', emoji: '🔥' },
  ];

  el.innerHTML = milestones.map(m => {
    const pct = m.inverse
      ? Math.min(100, (1 - (m.current / m.target)) * 100)
      : Math.min(100, (m.current / m.target) * 100);
    const done = m.inverse ? m.current <= m.target : m.current >= m.target;
    const color = done ? 'var(--neon-green)' : 'var(--teal)';
    return `<div style="display:flex;align-items:center;gap:14px;margin-bottom:16px;padding-bottom:16px;
      border-bottom:1px solid rgba(255,255,255,0.04);">
      <div style="font-size:1.8rem;width:36px;text-align:center;">${m.emoji}</div>
      <div style="flex:1;">
        <div style="display:flex;justify-content:space-between;margin-bottom:6px;">
          <span style="font-size:0.88rem;font-weight:600;${done?'color:var(--neon-green)':''}">${m.label}</span>
          <span style="font-size:0.8rem;color:${color}">${m.inverse ? m.current.toFixed(1) : m.current} / ${m.target} ${m.unit}</span>
        </div>
        <div style="height:5px;background:rgba(255,255,255,0.06);border-radius:4px;overflow:hidden;">
          <div style="height:100%;border-radius:4px;background:${color};width:${pct}%;transition:width 1s ease;"></div>
        </div>
      </div>
      ${done ? '<span style="color:var(--neon-green);font-size:1.2rem;">✅</span>' : ''}
    </div>`;
  }).join('');
}
