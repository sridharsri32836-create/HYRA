// ============================================================
// EcoTrack — log.js (Log Activity Page Logic)
// ============================================================

let currentCategory = 'transport';
let currentSub = '';
let recognition = null;
let isRecording = false;

document.addEventListener('DOMContentLoaded', () => {
  selectCategory('transport');
  renderQuickLog();
});

// ---- Category Selection ----
function selectCategory(cat) {
  currentCategory = cat;
  currentSub = '';

  document.querySelectorAll('.tab-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.cat === cat);
  });

  const select = document.getElementById('sub-select');
  const factors = APP.FACTORS[cat] || {};
  select.innerHTML = '<option value="">Select activity...</option>' +
    Object.entries(factors).map(([key, val]) =>
      `<option value="${key}">${val.icon} ${val.label}</option>`
    ).join('');

  document.getElementById('quantity-section').style.display = 'none';
  document.getElementById('custom-section').style.display = cat === 'custom' ? 'block' : 'none';
  document.getElementById('co2-preview-val').textContent = '0.00';
}

// ---- Sub-option Update ----
function updateSubOption() {
  const select = document.getElementById('sub-select');
  currentSub = select.value;
  const cat = APP.FACTORS[currentCategory];

  if (!currentSub || !cat) {
    document.getElementById('quantity-section').style.display = 'none';
    return;
  }

  const item = cat[currentSub];
  document.getElementById('unit-display').value = item.unit;
  document.getElementById('quantity-input').value = '';
  document.getElementById('factor-info').textContent =
    `Emission factor: ${item.factor} kg CO₂ per ${item.unit}`;
  document.getElementById('quantity-section').style.display = 'block';
  document.getElementById('co2-preview-val').textContent = '0.00';
  document.getElementById('quantity-input').focus();
}

// ---- Live Preview Update ----
function updatePreview() {
  const qty = parseFloat(document.getElementById('quantity-input').value) || 0;
  if (!currentSub || !currentCategory) return;
  const co2 = APP.calcCO2(currentCategory, currentSub, qty);
  animatePreview(co2);
}

function updateCustomPreview() {
  const val = parseFloat(document.getElementById('custom-co2').value) || 0;
  animatePreview(val);
}

function animatePreview(targetVal) {
  const el = document.getElementById('co2-preview-val');
  if (!el) return;
  const current = parseFloat(el.textContent) || 0;
  const diff = targetVal - current;
  const steps = 20;
  let step = 0;
  const interval = setInterval(() => {
    step++;
    const val = current + (diff * (step / steps));
    el.textContent = val.toFixed(2);
    if (step >= steps) { clearInterval(interval); el.textContent = targetVal.toFixed(2); }
  }, 15);

  // Color feedback
  if (targetVal === 0) el.style.color = '';
  else if (targetVal < 1) el.style.color = 'var(--neon-green)';
  else if (targetVal < 5) el.style.color = 'var(--gold)';
  else el.style.color = 'var(--red)';
}

// ---- Submit ----
function submitLog() {
  let co2 = 0, label = '', subKey = currentSub;

  if (currentCategory === 'custom') {
    const name = document.getElementById('custom-name').value.trim();
    const val  = parseFloat(document.getElementById('custom-co2').value);
    if (!name) { APP.toast('Please enter an activity name', 'error'); return; }
    if (isNaN(val) || val < 0) { APP.toast('Please enter a valid CO₂ amount', 'error'); return; }
    co2   = val;
    label = name;
    subKey = 'custom';
  } else {
    if (!currentSub) { APP.toast('Please select an activity type', 'error'); return; }
    const qty = parseFloat(document.getElementById('quantity-input').value);
    if (isNaN(qty) || qty <= 0) { APP.toast('Please enter a valid quantity', 'error'); return; }
    const item = APP.FACTORS[currentCategory]?.[currentSub];
    if (!item) { APP.toast('Invalid activity', 'error'); return; }
    co2   = APP.calcCO2(currentCategory, currentSub, qty);
    label = item.label + ' (' + qty + ' ' + item.unit + ')';
  }

  const note = document.getElementById('note-input')?.value?.trim() || '';
  const entry = { category: currentCategory, sub: subKey, co2, label, note };
  APP.addLog(entry);
  APP.launchConfetti();
  APP.toast(`✅ Logged ${entry.co2.toFixed(2)} kg CO₂ for "${entry.label}"`, 'success');
  APP.checkAndAwardBadges();

  // Reset form
  document.getElementById('co2-preview-val').textContent = '0.00';
  document.getElementById('co2-preview-val').style.color = '';
  document.getElementById('quantity-input') && (document.getElementById('quantity-input').value = '');
  document.getElementById('note-input') && (document.getElementById('note-input').value = '');
  document.getElementById('custom-co2') && (document.getElementById('custom-co2').value = '');
  document.getElementById('custom-name') && (document.getElementById('custom-name').value = '');
  document.getElementById('quantity-section').style.display = 'none';
  document.getElementById('sub-select').value = '';
}

// ---- Voice Logging ----
function toggleVoice() {
  if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
    APP.toast('Voice input not supported in this browser. Try Chrome!', 'error');
    return;
  }

  if (isRecording) {
    stopRecording();
  } else {
    startRecording();
  }
}

function startRecording() {
  const Rec = window.SpeechRecognition || window.webkitSpeechRecognition;
  recognition = new Rec();
  recognition.lang = 'en-IN';
  recognition.continuous = false;
  recognition.interimResults = true;

  const btn = document.getElementById('voice-btn');
  const transcriptEl = document.getElementById('voice-transcript');
  const transcriptText = document.getElementById('voice-transcript-text');

  btn.classList.add('recording');
  document.getElementById('voice-icon').textContent = '⏹️';
  document.getElementById('voice-label').textContent = 'Recording... Tap to stop';
  transcriptEl.style.display = 'block';
  transcriptText.innerHTML = '<em>Listening... speak now</em>';
  isRecording = true;

  recognition.onresult = (e) => {
    let transcript = '';
    for (let i = e.resultIndex; i < e.results.length; i++) {
      transcript += e.results[i][0].transcript;
    }
    transcriptText.innerHTML = `"${transcript}"`;
    if (e.results[e.results.length - 1].isFinal) {
      parseVoiceTranscript(transcript);
    }
  };

  recognition.onerror = (e) => {
    APP.toast('Voice error: ' + e.error, 'error');
    stopRecording();
  };

  recognition.onend = () => stopRecording();
  recognition.start();
}

function stopRecording() {
  isRecording = false;
  const btn = document.getElementById('voice-btn');
  btn.classList.remove('recording');
  document.getElementById('voice-icon').textContent = '🎙️';
  document.getElementById('voice-label').textContent = 'Voice Log — Speak your activities';
  if (recognition) { try { recognition.stop(); } catch(e) {} recognition = null; }
}

async function parseVoiceTranscript(transcript) {
  const transcriptText = document.getElementById('voice-transcript-text');
  transcriptText.innerHTML = `<em>Parsing: "${transcript}"</em>`;

  const settings = APP.getSettings();
  const apiKey = settings.anthropicKey;

  if (!apiKey) {
    // Fallback: simple keyword parsing
    parseTranscriptLocally(transcript);
    APP.toast('No AI key — using keyword matching. Add Claude key in Settings for smarter parsing.', 'info');
    return;
  }

  try {
    const prompt = `Parse this voice log into carbon footprint activities. Return ONLY valid JSON.
Transcript: "${transcript}"

Return JSON like:
{
  "activities": [
    {"category": "transport", "sub": "car_petrol", "quantity": 18, "unit": "km", "label": "Petrol Car (18 km)"}
  ]
}

Valid categories/subs:
- transport: car_petrol, car_diesel, car_electric, bike_petrol, bike_electric, auto, bus, metro, flight_dom, flight_intl, bicycle
- food: beef, chicken, fish, egg, dairy, veg_meal, vegan_meal, rice, food_waste
- energy: electricity, lpg, png, generator, solar
- shopping: clothing, electronics, delivery, furniture, book
- water: shower_hot, washing, dishwasher
Return ONLY the JSON object, no markdown.`;

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
        max_tokens: 512,
        messages: [{ role: 'user', content: prompt }],
      }),
    });
    const data = await resp.json();
    const text = data.content?.[0]?.text || '';
    let parsed;
    try { parsed = JSON.parse(text.replace(/```json|```/g, '').trim()); }
    catch { parsed = null; }

    if (parsed?.activities?.length) {
      parsed.activities.forEach(act => {
        const co2 = APP.calcCO2(act.category, act.sub, act.quantity);
        const item = APP.FACTORS[act.category]?.[act.sub];
        APP.addLog({
          category: act.category, sub: act.sub, co2,
          label: item ? `${item.label} (${act.quantity} ${act.unit})` : act.label,
        });
      });
      APP.launchConfetti();
      APP.toast(`✅ Voice logged ${parsed.activities.length} activit${parsed.activities.length > 1 ? 'ies' : 'y'}!`, 'success');
      transcriptText.innerHTML = `✅ Logged ${parsed.activities.length} activit${parsed.activities.length > 1 ? 'ies' : 'y'} from voice.`;
      APP.checkAndAwardBadges();
    } else {
      APP.toast('Could not parse activities from voice. Try again.', 'error');
      transcriptText.innerHTML = `<em>Could not parse: "${transcript}"</em>`;
    }
  } catch (e) {
    parseTranscriptLocally(transcript);
    APP.toast('AI parsing failed — using keyword matching', 'info');
  }
}

function parseTranscriptLocally(transcript) {
  const t = transcript.toLowerCase();
  const logged = [];

  const rules = [
    { pattern: /(\d+)\s*km.*(?:car|drove|drive|petrol)/i, cat: 'transport', sub: 'car_petrol', qIdx: 1, unit: 'km' },
    { pattern: /(?:car|drove|drive|petrol).*(\d+)\s*km/i, cat: 'transport', sub: 'car_petrol', qIdx: 1, unit: 'km' },
    { pattern: /(\d+)\s*km.*(?:bike|scooter|motorbike)/i, cat: 'transport', sub: 'bike_petrol', qIdx: 1, unit: 'km' },
    { pattern: /(\d+)\s*km.*(?:bus)/i, cat: 'transport', sub: 'bus', qIdx: 1, unit: 'km' },
    { pattern: /(\d+)\s*km.*(?:metro|train)/i, cat: 'transport', sub: 'metro', qIdx: 1, unit: 'km' },
    { pattern: /(?:beef|mutton|meat).*(\d+)\s*g/i, cat: 'food', sub: 'beef', qIdx: 1, unit: 'g' },
    { pattern: /(\d+)\s*g.*(?:chicken)/i, cat: 'food', sub: 'chicken', qIdx: 1, unit: 'g' },
    { pattern: /(\d+)\s*kwh.*electricity/i, cat: 'energy', sub: 'electricity', qIdx: 1, unit: 'kWh' },
    { pattern: /(\d+(?:\.\d+)?)\s*units?.*egg/i, cat: 'food', sub: 'egg', qIdx: 1, unit: 'units' },
    { pattern: /(\d+)\s*min.*shower/i, cat: 'water', sub: 'shower_hot', qIdx: 1, unit: 'minutes' },
  ];

  for (const rule of rules) {
    const m = transcript.match(rule.pattern);
    if (m) {
      const qty = parseFloat(m[rule.qIdx]);
      const co2 = APP.calcCO2(rule.cat, rule.sub, qty);
      const item = APP.FACTORS[rule.cat]?.[rule.sub];
      APP.addLog({ category: rule.cat, sub: rule.sub, co2, label: `${item?.label || ''} (${qty} ${rule.unit})` });
      logged.push(item?.label);
    }
  }

  const transcriptText = document.getElementById('voice-transcript-text');
  if (logged.length) {
    APP.launchConfetti();
    APP.toast(`✅ Logged: ${logged.join(', ')}`, 'success');
    transcriptText.innerHTML = `✅ Logged: ${logged.join(', ')}`;
  } else {
    APP.toast('Could not match activities. Try: "I drove 20 km by car"', 'info');
    transcriptText.innerHTML = `<em>No match found for: "${transcript}"</em>`;
  }
}

// ---- Quick Log Grid ----
function renderQuickLog() {
  const grid = document.getElementById('quick-log-grid');
  if (!grid) return;
  const quickItems = [
    { cat: 'transport', sub: 'car_petrol', qty: 10, label: 'Car 10km' },
    { cat: 'transport', sub: 'metro', qty: 15, label: 'Metro 15km' },
    { cat: 'food', sub: 'veg_meal', qty: 1, label: 'Veg Meal' },
    { cat: 'food', sub: 'chicken', qty: 200, label: 'Chicken 200g' },
    { cat: 'energy', sub: 'electricity', qty: 5, label: '5 kWh Grid' },
    { cat: 'transport', sub: 'bus', qty: 20, label: 'Bus 20km' },
  ];
  grid.innerHTML = quickItems.map(item => {
    const co2 = APP.calcCO2(item.cat, item.sub, item.qty).toFixed(2);
    const cat = APP.CATEGORIES[item.cat];
    return `<div class="breakdown-item" onclick="quickLog('${item.cat}','${item.sub}',${item.qty},'${item.label}')"
      style="cursor:pointer; transition: transform 0.2s;" onmouseenter="this.style.transform='scale(1.05)'" onmouseleave="this.style.transform='scale(1)'">
      <div class="breakdown-emoji">${cat.icon}</div>
      <div class="breakdown-label">${item.label}</div>
      <div class="breakdown-val">${co2} kg</div>
    </div>`;
  }).join('');
}

function quickLog(cat, sub, qty, label) {
  const co2 = APP.calcCO2(cat, sub, qty);
  const item = APP.FACTORS[cat]?.[sub];
  APP.addLog({ category: cat, sub, co2, label: `${item?.label || label} (${qty} ${item?.unit || ''})` });
  APP.launchConfetti();
  APP.toast(`✅ Quick logged: ${label} — ${co2.toFixed(2)} kg CO₂`, 'success');
  APP.checkAndAwardBadges();
}
