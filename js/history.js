// ============================================================
// EcoTrack — history.js (History Page Logic)
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
  renderHeatmap();
  renderHistoryStats();
  renderHistory();
});

function renderHeatmap() {
  const grid   = document.getElementById('heatmap-grid');
  const header = document.getElementById('heatmap-header');
  if (!grid) return;

  const logs = APP.getLogs();
  const goals = APP.getGoals();

  // Day labels
  if (header) header.innerHTML = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']
    .map(d => `<div class="heatmap-day-label">${d}</div>`).join('');

  // Build 35-cell grid (5 weeks)
  const cells = [];
  for (let i = 34; i >= 0; i--) {
    const d = new Date(APP.CURRENT_DATE);
    d.setDate(d.getDate() - i);
    const dateStr = d.toDateString();
    const dayLogs = logs.filter(l => new Date(l.ts).toDateString() === dateStr);
    const total = dayLogs.reduce((s, l) => s + l.co2, 0);
    let level = 0;
    if (total > 0) level = 1;
    if (total > goals.daily * 0.5) level = 2;
    if (total > goals.daily) level = 3;
    if (total > goals.daily * 1.5) level = 4;
    cells.push({ d, total, level });
  }

  grid.innerHTML = cells.map(cell => {
    const dateLabel = cell.d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
    return `<div class="heatmap-cell h${cell.level}" title="${dateLabel}: ${cell.total.toFixed(2)} kg CO₂"
      onclick="showDayDetail('${cell.d.toDateString()}')"></div>`;
  }).join('');
}

function showDayDetail(dateStr) {
  const logs = APP.getLogs().filter(l => new Date(l.ts).toDateString() === dateStr);
  if (!logs.length) { APP.toast(`No activities on ${dateStr}`, 'info'); return; }
  const total = logs.reduce((s, l) => s + l.co2, 0);
  APP.toast(`${dateStr}: ${logs.length} activities, ${total.toFixed(2)} kg CO₂`, 'info', 4000);
}

function renderHistoryStats() {
  const logs = APP.getLogs();
  const total = logs.reduce((s, l) => s + l.co2, 0);
  const avg   = logs.length ? total / logs.length : 0;

  const te = document.getElementById('hist-total');
  const ce = document.getElementById('hist-count');
  const ae = document.getElementById('hist-avg');
  if (te) te.textContent = total.toFixed(1);
  if (ce) ce.textContent = logs.length;
  if (ae) ae.textContent = avg.toFixed(2);
}

function renderHistory() {
  const listEl   = document.getElementById('history-list');
  if (!listEl) return;

  const filterCat= document.getElementById('filter-cat')?.value || '';
  let logs = APP.getLogs();
  if (filterCat) logs = logs.filter(l => l.category === filterCat);

  if (!logs.length) {
    listEl.innerHTML = `<div class="empty-state">
      <div class="empty-icon">📅</div>
      <p>${filterCat ? 'No activities in this category.' : 'No activities logged yet.'}</p>
      <a href="log.html" class="btn-primary">Log Activity</a>
    </div>`;
    return;
  }

  const catColors = { transport:'#00d4ff', food:'#00ff88', energy:'#ffd700', shopping:'#7b2fff', water:'#00aaff', custom:'#ff6b6b' };

  // Group by date
  const grouped = {};
  logs.forEach(l => {
    const d = new Date(l.ts);
    const key = d.toDateString();
    if (!grouped[key]) grouped[key] = { date: d, logs: [] };
    grouped[key].logs.push(l);
  });

  listEl.innerHTML = Object.entries(grouped).map(([dateStr, group]) => {
    const dayTotal = group.logs.reduce((s, l) => s + l.co2, 0);
    const isToday  = group.date.toDateString() === APP.CURRENT_DATE.toDateString();
    const dateLabel= isToday ? 'Today' : group.date.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });

    const items = group.logs.map(log => {
      const cat   = APP.CATEGORIES[log.category] || { icon: '📦', label: 'Other' };
      const color = catColors[log.category] || '#888';
      const time  = new Date(log.ts).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
      return `<div class="activity-item" data-id="${log.id}">
        <div class="activity-icon-wrap" style="background:${color}20;border:1px solid ${color}30;">
          <span>${cat.icon}</span>
        </div>
        <div class="activity-info">
          <div class="activity-name">${log.label || 'Activity'}</div>
          <div class="activity-meta">${cat.label} · ${time}${log.note ? ' · ' + log.note : ''}</div>
        </div>
        <div>
          <div class="activity-co2" style="color:${color}">${log.co2.toFixed(2)}</div>
          <div class="activity-co2-unit">kg CO₂</div>
        </div>
        <button class="activity-delete" onclick="deleteFromHistory('${log.id}')" title="Delete">✕</button>
      </div>`;
    }).join('');

    return `<div style="border-bottom:1px solid rgba(255,255,255,0.05);margin-bottom:4px;">
      <div style="display:flex;justify-content:space-between;padding:12px 16px 6px;font-size:0.82rem;">
        <span style="font-weight:700;color:var(--text-secondary)">${dateLabel}</span>
        <span style="color:${dayTotal > 5 ? 'var(--red)' : 'var(--neon-green)'}; font-weight:600">${dayTotal.toFixed(2)} kg CO₂</span>
      </div>
      ${items}
    </div>`;
  }).join('');
}

function deleteFromHistory(id) {
  APP.deleteLog(id);
  APP.toast('Activity deleted', 'info');
  renderHeatmap();
  renderHistoryStats();
  renderHistory();
}

function clearAllLogs() {
  if (!confirm('Clear ALL logged activities? This cannot be undone.')) return;
  localStorage.removeItem(APP.KEYS.LOGS);
  APP.toast('All activities cleared', 'info');
  renderHeatmap();
  renderHistoryStats();
  renderHistory();
}
