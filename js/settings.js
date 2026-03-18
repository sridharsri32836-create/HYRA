// ============================================================
// EcoTrack — settings.js (Settings Page Logic)
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
  loadSettings();
});

function loadSettings() {
  const s = APP.getSettings();
  const g = APP.getGoals();

  const nameEl    = document.getElementById('setting-name');
  const regionEl  = document.getElementById('setting-region');
  const claudeEl  = document.getElementById('setting-anthropic-key');
  const co2El     = document.getElementById('setting-co2signal-key');
  const dailyEl   = document.getElementById('setting-daily-goal');
  const monthlyEl = document.getElementById('setting-monthly-goal');

  if (nameEl)    nameEl.value    = s.name    || '';
  if (regionEl)  regionEl.value  = s.region  || 'india_national';
  if (claudeEl)  claudeEl.value  = s.anthropicKey || '';
  if (co2El)     co2El.value     = s.co2signalKey || '';
  if (dailyEl)   dailyEl.value   = g.daily   || 5;
  if (monthlyEl) monthlyEl.value = g.monthly || 50;
}

function saveProfile() {
  const name   = document.getElementById('setting-name')?.value?.trim()  || 'Eco Warrior';
  const region = document.getElementById('setting-region')?.value || 'india_national';

  APP.saveSettings({ name, region });
  APP.toast('✅ Profile saved!', 'success');
}

function saveApiKeys() {
  const anthropicKey  = document.getElementById('setting-anthropic-key')?.value?.trim() || '';
  const co2signalKey  = document.getElementById('setting-co2signal-key')?.value?.trim() || '';

  APP.saveSettings({ anthropicKey, co2signalKey });
  APP.toast('✅ API keys saved!', 'success');

  // Verify Anthropic key if provided
  if (anthropicKey) {
    verifyAnthropicKey(anthropicKey);
  }
}

async function verifyAnthropicKey(key) {
  try {
    const resp = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': key,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 10,
        messages: [{ role: 'user', content: 'Hi' }],
      }),
    });
    if (resp.ok) {
      APP.toast('✅ Claude API key verified!', 'success');
    } else {
      const d = await resp.json();
      APP.toast(`⚠️ API key issue: ${d.error?.message || 'Invalid key'}`, 'error', 5000);
    }
  } catch (e) {
    APP.toast('⚠️ Could not verify key. Check network/CORS.', 'info');
  }
}

function saveGoalsFromSettings() {
  const daily   = parseFloat(document.getElementById('setting-daily-goal')?.value)   || 5;
  const monthly = parseFloat(document.getElementById('setting-monthly-goal')?.value) || 50;
  APP.saveGoals({ daily, monthly });
  APP.toast('✅ Goals updated!', 'success');
}

function toggleKeyVisibility(inputId, btn) {
  const input = document.getElementById(inputId);
  if (!input) return;
  if (input.type === 'password') {
    input.type = 'text'; btn.textContent = '🙈';
  } else {
    input.type = 'password'; btn.textContent = '👁️';
  }
}

function exportData() {
  const data = {
    version: APP.VERSION,
    exportedAt: new Date().toISOString(),
    logs: APP.getLogs(),
    settings: APP.getSettings(),
    goals: APP.getGoals(),
    badges: APP.getBadges(),
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url;
  a.download = `ecotrack-export-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
  APP.toast('📤 Data exported!', 'success');
}

function importData(input) {
  const file = input.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result);
      if (data.logs) APP.saveLogs(data.logs);
      if (data.settings) APP.saveSettings(data.settings);
      if (data.goals) APP.saveGoals(data.goals);
      if (data.badges) APP.saveBadges(data.badges);
      APP.toast('📥 Data imported successfully!', 'success');
      loadSettings();
    } catch (err) {
      APP.toast('⚠️ Invalid JSON file', 'error');
    }
  };
  reader.readAsText(file);
}

function resetAllData() {
  if (!confirm('⚠️ This will DELETE ALL your EcoTrack data permanently. Are you sure?')) return;
  if (!confirm('Really sure? This cannot be undone!')) return;
  Object.values(APP.KEYS).forEach(k => localStorage.removeItem(k));
  APP.toast('All data reset. Starting fresh!', 'info');
  loadSettings();
}
