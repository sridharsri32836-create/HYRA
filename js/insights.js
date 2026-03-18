// ============================================================
// EcoTrack — insights.js (AI Insights Page Logic)
// ============================================================

const DEFAULT_TIPS = [
  { num: '1', text: '🚇 Switch your daily commute to metro or bus — it can cut your transport emissions by up to 80% vs a petrol car.' },
  { num: '2', text: '🥗 Go meat-free 2–3 days a week. A vegetarian meal emits 0.6 kg CO₂ vs 15+ kg for beef — a 25× difference!' },
  { num: '3', text: '💡 Switch all bulbs to LEDs and use a smart power strip to eliminate standby power. Saves ~80 kg CO₂/year at India grid intensity.' },
  { num: '4', text: '🛵 Consider an electric 2-wheeler for local trips — at 0.05 kg CO₂/km vs 0.09 kg for petrol, it halves your transport footprint.' },
  { num: '5', text: '🌱 Compost food waste at home — it diverts organic material from landfills and prevents potent methane emissions.' },
];

document.addEventListener('DOMContentLoaded', () => {
  renderTrendChart();
  renderComparison();
  renderDefaultTips();
  renderMonthlyBreakdown();
});

// ---- 7-Day Bar Chart ----
function renderTrendChart() {
  const chart = document.getElementById('trend-chart');
  const daysEl = document.getElementById('trend-days');
  if (!chart) return;

  const logs = APP.getLogs();
  const days = [];
  let maxVal = 0;

  for (let i = 6; i >= 0; i--) {
    const d = new Date(APP.CURRENT_DATE);
    d.setDate(d.getDate() - i);
    const dateStr = d.toDateString();
    const dayLogs = logs.filter(l => new Date(l.ts).toDateString() === dateStr);
    const total = dayLogs.reduce((s, l) => s + l.co2, 0);
    days.push({ date: d, total });
    if (total > maxVal) maxVal = total;
  }

  const goals = APP.getGoals();
  maxVal = Math.max(maxVal, goals.daily * 1.2, 1);

  chart.innerHTML = days.map((day, i) => {
    const pct = (day.total / maxVal) * 100;
    const label = i === 6 ? 'Today' : ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][day.date.getDay()];
    const color = day.total === 0 ? 'rgba(255,255,255,0.1)' :
      day.total <= goals.daily ? 'var(--neon-green)' :
      day.total <= goals.daily * 1.5 ? 'var(--gold)' : 'var(--red)';
    return `<div class="bar-col">
      <div class="bar-val">${day.total > 0 ? day.total.toFixed(1) : ''}</div>
      <div class="bar" style="height: ${Math.max(pct, 2)}%; background: ${color}; transition: height 0.8s ease ${i*0.1}s;"></div>
      <div class="bar-label">${label}</div>
    </div>`;
  }).join('');
}

// ---- CO2 Comparison ----
function renderComparison() {
  const row = document.getElementById('comparison-row');
  if (!row) return;

  const logs = APP.getLogs();
  const monthCO2 = APP.sumCO2(logs, l => APP.isThisMonth(l.ts));
  const yearEst = monthCO2 * 12;

  const comparisons = [
    { name: 'You (Annual Est.)', val: yearEst, color: 'var(--teal)', max: 10000 },
    { name: 'Avg Indian (1,700 kg/yr)', val: 1700, color: 'var(--neon-green)', max: 10000 },
    { name: 'Global Average (4,700 kg/yr)', val: 4700, color: 'var(--gold)', max: 10000 },
    { name: 'USA Average (16,000 kg/yr)', val: 16000, color: 'var(--red)', max: 10000 },
  ];

  row.innerHTML = comparisons.map(c => {
    const pct = Math.min((c.val / 16000) * 100, 100);
    return `<div class="comparison-item">
      <div class="comp-label">
        <span class="comp-name">${c.name}</span>
        <span class="comp-val" style="color:${c.color}">${c.val.toFixed(0)} kg</span>
      </div>
      <div class="comp-bar-wrap">
        <div class="comp-bar" style="width:${pct}%; background:${c.color}; border-radius:4px;"></div>
      </div>
    </div>`;
  }).join('');
}

// ---- Default Tips ----
function renderDefaultTips(tips) {
  const el = document.getElementById('tips-list');
  if (!el) return;
  const items = tips || DEFAULT_TIPS;
  el.innerHTML = items.map(t => `
    <div class="tip-item">
      <div class="tip-num">${t.num}</div>
      <div class="tip-text">${t.text}</div>
    </div>
  `).join('');
}

// ---- Monthly Breakdown ----
function renderMonthlyBreakdown() {
  const grid = document.getElementById('monthly-breakdown');
  if (!grid) return;

  const logs = APP.getLogs().filter(l => APP.isThisMonth(l.ts));
  if (!logs.length) {
    grid.innerHTML = '<p style="color:var(--text-muted);font-size:0.88rem;">No data this month. Start logging!</p>';
    return;
  }

  const catData = {};
  logs.forEach(l => { catData[l.category] = (catData[l.category] || 0) + l.co2; });
  const total = Object.values(catData).reduce((s, v) => s + v, 0);
  const catColors = { transport:'#00d4ff', food:'#00ff88', energy:'#ffd700', shopping:'#7b2fff', water:'#00aaff', custom:'#ff6b6b' };

  grid.innerHTML = Object.entries(catData).sort((a,b)=>b[1]-a[1]).map(([cat, val]) => {
    const info = APP.CATEGORIES[cat] || { icon: '📦', label: cat };
    const color = catColors[cat] || '#888';
    const pct = total > 0 ? (val/total)*100 : 0;
    return `<div class="breakdown-item">
      <div class="breakdown-emoji">${info.icon}</div>
      <div class="breakdown-label">${info.label}</div>
      <div class="breakdown-val" style="color:${color}">${val.toFixed(1)} kg</div>
      <div class="breakdown-bar-wrap"><div class="breakdown-bar" style="width:${pct}%; background:${color}"></div></div>
    </div>`;
  }).join('');
}

// ---- AI Prediction ----
async function getAIPrediction() {
  const btn = document.getElementById('predict-btn');
  const content = document.getElementById('prediction-content');
  const settings = APP.getSettings();
  const apiKey = settings.anthropicKey;

  if (!apiKey) {
    content.innerHTML = `<div class="glass-card-sm" style="padding:16px;">
      <p style="color:var(--gold); font-size:0.9rem;">⚠️ No Claude API key found.</p>
      <p style="color:var(--text-muted); font-size:0.82rem; margin-top:8px;">Add your Anthropic API key in <a href="settings.html" style="color:var(--teal)">Settings</a> to enable AI predictions.</p>
    </div>
    <br/><button class="btn-primary" onclick="getAIPrediction()" id="predict-btn" style="width:100%; justify-content:center;">🤖 Try with API Key</button>`;
    return;
  }

  btn.disabled = true;
  btn.textContent = '⏳ Generating...';

  const logs = APP.getLogs().slice(0, 30);
  const summary = summarizeLogs(logs);
  const goals = APP.getGoals();

  const prompt = `You are an AI carbon footprint analyst. Based on the user's recent activity logs, provide:
1. A 7-day CO₂ prediction (just a paragraph, not exact numbers)
2. The top risk factor in their habits
3. One quick win they can do tomorrow

User's recent 30-day data summary:
${JSON.stringify(summary, null, 2)}

Monthly goal: ${goals.monthly} kg CO₂
Daily goal: ${goals.daily} kg CO₂

Write in a friendly, motivating tone. Keep it under 200 words. Format with clear sections.`;

  try {
    const resp = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 400,
        messages: [{ role: 'user', content: prompt }],
      }),
    });
    const data = await resp.json();
    const text = data.content?.[0]?.text || 'Could not generate prediction.';
    content.innerHTML = `<div style="font-size:0.9rem; color:var(--text-secondary); line-height:1.7; white-space:pre-wrap;">${text}</div>
    <br/><button class="btn-secondary" onclick="getAIPrediction()" id="predict-btn">🔄 Regenerate</button>`;
  } catch (e) {
    content.innerHTML = `<p style="color:var(--red)">Error: ${e.message}</p><button class="btn-primary" onclick="getAIPrediction()" id="predict-btn" style="margin-top:12px;">Try Again</button>`;
  }
}

// ---- AI Tips ----
async function getAITips() {
  const btn = document.getElementById('tips-btn');
  const listEl = document.getElementById('tips-list');
  const settings = APP.getSettings();
  const apiKey = settings.anthropicKey;

  if (!apiKey) {
    APP.toast('Add Claude API key in Settings for AI tips', 'info');
    return;
  }

  btn.disabled = true;
  btn.textContent = '⏳ Loading...';
  listEl.innerHTML = '<p style="color:var(--text-muted); font-size:0.88rem;">Generating personalized tips...</p>';

  const logs = APP.getLogs().slice(0, 20);
  const summary = summarizeLogs(logs);

  const prompt = `Based on this user's carbon footprint data, give exactly 5 personalized eco tips:
${JSON.stringify(summary, null, 2)}
Context: User is based in India (2026). Grid intensity: 0.70 kg CO₂/kWh.

Return ONLY a JSON array:
[{"num":"1","text":"tip text here"},...]
No markdown, no extra text.`;

  try {
    const resp = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 600,
        messages: [{ role: 'user', content: prompt }],
      }),
    });
    const data = await resp.json();
    const text = data.content?.[0]?.text || '[]';
    let tips;
    try { tips = JSON.parse(text.replace(/```json|```/g,'').trim()); }
    catch { tips = DEFAULT_TIPS; }
    renderDefaultTips(tips);
    APP.toast('✅ AI tips refreshed!', 'success');
  } catch (e) {
    renderDefaultTips();
    APP.toast('Failed to load AI tips — showing defaults', 'info');
  } finally {
    btn.disabled = false;
    btn.textContent = '🤖 Refresh Tips';
  }
}

function summarizeLogs(logs) {
  const categories = {};
  logs.forEach(l => { categories[l.category] = (categories[l.category] || 0) + l.co2; });
  const total = Object.values(categories).reduce((s,v)=>s+v,0);
  const topCategory = Object.entries(categories).sort((a,b)=>b[1]-a[1])[0]?.[0] || 'none';
  return {
    totalCO2_kg: parseFloat(total.toFixed(2)),
    byCategory: categories,
    topCategory,
    numActivities: logs.length,
    avgPerActivity: logs.length ? parseFloat((total/logs.length).toFixed(2)) : 0,
  };
}
