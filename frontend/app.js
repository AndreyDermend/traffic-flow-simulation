const SVG_NS = 'http://www.w3.org/2000/svg';

// ─── Progress bar ────────────────────────────────────────────────────────────
const progressBar = document.getElementById('progress-bar');
window.addEventListener('scroll', () => {
  const h = document.documentElement;
  const pct = h.scrollTop / (h.scrollHeight - h.clientHeight || 1);
  progressBar.style.transform = `scaleX(${pct})`;
});

const state = {
  payload: null,
  currentTick: 0,
  selectedStreet: null,
  playTimer: null,
};

const apiBaseInput          = document.getElementById('apiBase');
const representedSecondsInput = document.getElementById('representedSeconds');
const seedInput             = document.getElementById('seed');
const runBtn                = document.getElementById('runBtn');
const playBtn               = document.getElementById('playBtn');
const statusEl              = document.getElementById('status');
const summaryGrid           = document.getElementById('summaryGrid');
const playbackPanel         = document.getElementById('playbackPanel');
const sceneLayout           = document.getElementById('sceneLayout');
const tickSlider            = document.getElementById('tickSlider');
const tickReadout           = document.getElementById('tickReadout');
const networkScene          = document.getElementById('networkScene');
const streetDetails         = document.getElementById('streetDetails');

// ─── SVG canvas: 900 × 620 ────────────────────────────────────────────────────
//
//  Road grid (all measurements in SVG units):
//
//        Left‑vert   Horiz roads    Right‑vert
//        x:60‑110    x:60 → 840     x:790‑840
//
//  Horizontal road bands (y ranges, each 54 px tall):
//    Brace Rd      y: 80  → 134
//    Farmington    y: 270 → 324
//    Memorial Rd   y: 460 → 514
//
//  Vertical road bands (x ranges, each 50 px wide):
//    Dale / LaSalle  x: 60  → 110   (left side)
//    N Main / S Main x: 790 → 840   (right side)
//
//  Lane width (one direction): 18 px
//  Lane separation gap:         8 px  (centre of road body = 10 + 9 = 19 from top of body)
//
//  Left‑side lanes:
//    southbound  x: 67,  width: 18
//    northbound  x: 90,  width: 18
//
//  Right‑side lanes:
//    southbound  x: 797, width: 18
//    northbound  x: 820, width: 18   ← kept inside 790‑840
//
//  Horizontal lanes:
//    eastbound   y: body_y + 6,  height: 18
//    westbound   y: body_y + 30, height: 18

// Road body rectangles
const ROAD_GROUPS = [
  // ── horizontal ──────────────────────────────────────────────────────────
  { key:'Brace',       label:'Brace Rd',      x:60,  y:80,  w:780, h:54, lx:450, ly:68,  rot:0   },
  { key:'Farmington',  label:'Farmington Ave', x:60,  y:270, w:780, h:54, lx:450, ly:258, rot:0   },
  { key:'Memorial',    label:'Memorial Rd',    x:110, y:460, w:730, h:54, lx:450, ly:530, rot:0   },
  // ── vertical left ───────────────────────────────────────────────────────
  { key:'Dale',        label:'Dale St',        x:60,  y:80,  w:50,  h:244,lx:85,  ly:202, rot:-90 },
  { key:'Lasalle',     label:'LaSalle Rd',     x:60,  y:324, w:50,  h:190,lx:85,  ly:419, rot:-90 },
  // ── vertical right ──────────────────────────────────────────────────────
  { key:'N Main',      label:'N Main St',      x:790, y:80,  w:50,  h:244,lx:815, ly:202, rot:-90 },
  { key:'S Main',      label:'S Main St',      x:790, y:324, w:50,  h:190,lx:815, ly:419, rot:-90 },
];

// Lane segments — each is one directional lane
// Coords must sit INSIDE the matching road body above.
const SEGMENTS = {
  // ── Brace Rd (y:80‑134) ─────────────────────────────────────────────────
  'Brace 1': {
    roadKey:'Brace', roadLabel:'Brace Rd',
    x:110, y:86, w:680, h:18, flow:'east',
    lx:115, ly:80,
  },
  'Brace 2': {
    roadKey:'Brace', roadLabel:'Brace Rd',
    x:110, y:110, w:680, h:18, flow:'west',
    lx:785, ly:104,
  },

  // ── Dale St — southbound only (body x:60‑110, y:80‑324) ─────────────────
  'Dale 3': {
    roadKey:'Dale', roadLabel:'Dale St',
    x:67, y:134, w:18, h:136, flow:'south',
    lx:56, ly:145,
  },

  // ── Farmington Ave (y:270‑324) ───────────────────────────────────────────
  'Farmington 1': {
    roadKey:'Farmington', roadLabel:'Farmington Ave',
    x:110, y:276, w:680, h:18, flow:'east',
    lx:115, ly:270,
  },
  'Farmington 2': {
    roadKey:'Farmington', roadLabel:'Farmington Ave',
    x:110, y:300, w:680, h:18, flow:'west',
    lx:785, ly:294,
  },

  // ── LaSalle Rd (body x:60‑110, y:324‑514) ───────────────────────────────
  'Lasalle 1': {
    roadKey:'Lasalle', roadLabel:'LaSalle Rd',
    x:67, y:324, w:18, h:136, flow:'south',
    lx:76, ly:335,
  },
  'Lasalle 2': {
    roadKey:'Lasalle', roadLabel:'LaSalle Rd',
    x:90, y:324, w:18, h:136, flow:'north',
    lx:99, ly:350,
  },

  // ── N Main St (body x:790‑840, y:80‑324) ────────────────────────────────
  'N Main 1': {
    roadKey:'N Main', roadLabel:'N Main St',
    x:797, y:134, w:18, h:136, flow:'south',
    lx:806, ly:145,
  },
  'N Main 2': {
    roadKey:'N Main', roadLabel:'N Main St',
    x:820, y:134, w:18, h:136, flow:'north',
    lx:829, ly:160,
  },

  // ── S Main St (body x:790‑840, y:324‑514) ───────────────────────────────
  'S Main 1': {
    roadKey:'S Main', roadLabel:'S Main St',
    x:797, y:324, w:18, h:136, flow:'south',
    lx:806, ly:335,
  },
  'S Main 2': {
    roadKey:'S Main', roadLabel:'S Main St',
    x:820, y:324, w:18, h:136, flow:'north',
    lx:829, ly:350,
  },

  // ── Memorial Rd (body x:110‑840, y:460‑514) ─────────────────────────────
  'Memorial 3': {
    roadKey:'Memorial', roadLabel:'Memorial Rd',
    x:110, y:466, w:680, h:18, flow:'east',
    lx:785, ly:460,
  },
};

// ─── Event listeners ──────────────────────────────────────────────────────────
runBtn.addEventListener('click', runSimulation);
playBtn.addEventListener('click', togglePlayback);
tickSlider.addEventListener('input', () => {
  stopPlayback();
  state.currentTick = Number(tickSlider.value);
  renderTick();
});

// ─── Utilities ────────────────────────────────────────────────────────────────
function setStatus(msg, isErr = false) {
  statusEl.textContent = msg;
  statusEl.style.color = isErr ? '#c5221f' : '';
}

function card(title, value) {
  return `<article class="summary-card"><h3>${title}</h3><p>${value}</p></article>`;
}

function el(tag, attrs = {}, text) {
  const n = document.createElementNS(SVG_NS, tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v !== undefined && v !== null) n.setAttribute(k, v);
  }
  if (text !== undefined) n.textContent = text;
  return n;
}

function getRealRoadName(name) {
  return SEGMENTS[name]?.roadLabel || name;
}

// ─── Fetch & run ──────────────────────────────────────────────────────────────
async function runSimulation() {
  const apiBase = apiBaseInput.value.trim().replace(/\/$/, '');
  const secs    = Number(representedSecondsInput.value || 300);
  const seed    = seedInput.value.trim();

  localStorage.setItem('apiBase', apiBase);
  setStatus('Running simulation…');
  runBtn.disabled = true;
  stopPlayback();

  try {
    const q = new URLSearchParams({ represented_seconds: String(secs) });
    if (seed) q.set('seed', seed);
    let data;
    try {
      const res = await fetch(`${apiBase}/run-simulation?${q}`);
      if (!res.ok) { const b = await res.json().catch(() => ({})); throw new Error(b.detail || 'Request failed'); }
      data = await res.json();
    } catch (fetchErr) {
      setStatus('API unavailable — loading sample data…');
      const fallback = await fetch('sample_run.json');
      if (!fallback.ok) throw fetchErr;
      data = await fallback.json();
    }
    state.payload = data;
    state.currentTick = 0;
    state.selectedStreet =
      state.payload.summary.peak_congestion_street ||
      state.payload.snapshots[0].street_states[0].name;
    renderSummary();
    configurePlayback();
    renderTick();
    setStatus('Simulation complete.');
  } catch (e) {
    console.error(e);
    setStatus(`Error: ${e.message}`, true);
  } finally {
    runBtn.disabled = false;
  }
}

// ─── Summary ──────────────────────────────────────────────────────────────────
function renderSummary() {
  const { metadata, summary } = state.payload;
  summaryGrid.innerHTML = [
    card('Engine ticks',           metadata.engine_ticks),
    card('Represented seconds',    metadata.represented_seconds),
    card('Peak network cars',      summary.peak_network_cars),
    card('Peak congestion street', summary.peak_congestion_street),
  ].join('');
}

// ─── Playback ─────────────────────────────────────────────────────────────────
function configurePlayback() {
  const n = state.payload.snapshots.length;
  tickSlider.max   = String(n - 1);
  tickSlider.value = '0';
  playbackPanel.classList.remove('hidden');
  sceneLayout.classList.remove('hidden');
  playBtn.textContent = 'Play';
}

function togglePlayback() {
  if (!state.payload) return;
  if (state.playTimer) { stopPlayback(); return; }
  playBtn.textContent = 'Pause';
  state.playTimer = setInterval(() => {
    const next = state.currentTick + 1;
    if (next >= state.payload.snapshots.length) { stopPlayback(); return; }
    state.currentTick = next;
    tickSlider.value  = String(next);
    renderTick();
  }, 450);
}

function stopPlayback() {
  if (state.playTimer) { clearInterval(state.playTimer); state.playTimer = null; }
  playBtn.textContent = 'Play';
}

// ─── Tick render ──────────────────────────────────────────────────────────────
function renderTick() {
  const snap = state.payload.snapshots[state.currentTick];
  tickReadout.textContent = `Tick ${snap.tick} / ${state.payload.snapshots.length - 1}`;
  renderScene(snap);
  renderStreetDetails(snap);
}

// ─── Scene ────────────────────────────────────────────────────────────────────
function renderScene(snap) {
  networkScene.innerHTML = '';

  // Canvas bg
  networkScene.appendChild(el('rect', { x:0, y:0, width:900, height:620, fill:'#f8f9fa', rx:12 }));

  // Subtle district outline
  networkScene.appendChild(el('rect', {
    x:50, y:55, width:800, height:510, rx:12,
    fill:'rgba(0,0,0,0.01)', stroke:'rgba(0,0,0,0.06)', 'stroke-width':1,
  }));

  // Road bodies + labels
  drawRoadGroups();

  // Segments
  snap.street_states.forEach(street => {
    const layout = SEGMENTS[street.name];
    if (!layout) return;
    const sel = state.selectedStreet === street.name;
    drawSegmentLane(street, layout, sel);
    drawCarsForStreet(street, layout, sel);
    drawSegmentLabel(street, layout, sel);
    drawControlMarker(street, layout);
  });
}

function drawRoadGroups() {
  // Intersection fills (drawn first so road bodies paint over them cleanly)
  const intersections = [
    { x:60,  y:80,  w:50, h:54  }, // Dale   × Brace
    { x:60,  y:270, w:50, h:54  }, // Dale   × Farmington
    { x:790, y:80,  w:50, h:54  }, // N Main × Brace
    { x:790, y:270, w:50, h:54  }, // N Main × Farmington
    { x:60,  y:460, w:50, h:54  }, // LaSalle× Memorial
    { x:790, y:460, w:50, h:54  }, // S Main × Memorial
  ];
  intersections.forEach(j => {
    networkScene.appendChild(el('rect', {
      x:j.x, y:j.y, width:j.w, height:j.h, rx:6,
      fill:'#d1d5db', opacity:0.7,
    }));
  });

  ROAD_GROUPS.forEach(r => {
    networkScene.appendChild(el('rect', {
      x:r.x, y:r.y, width:r.w, height:r.h,
      fill:'#e5e7eb', rx:10, opacity:0.95,
    }));
    networkScene.appendChild(el('text', {
      x:r.lx, y:r.ly,
      class:'street-label',
      transform: r.rot ? `rotate(${r.rot} ${r.lx} ${r.ly})` : undefined,
    }, r.label));
  });
}

function drawSegmentLane(street, layout, isSelected) {
  networkScene.appendChild(el('rect', {
    x:layout.x, y:layout.y, width:layout.w, height:layout.h,
    rx:4, fill:'rgba(26,115,232,0.08)',
  }));
  const hb = el('rect', {
    x:layout.x-3, y:layout.y-3, width:layout.w+6, height:layout.h+6,
    rx:6, class:`street-hitbox${isSelected ? ' selected' : ''}`,
  });
  hb.addEventListener('click', () => { state.selectedStreet = street.name; renderTick(); });
  networkScene.appendChild(hb);
}

function drawCarsForStreet(street, layout, isSelected) {
  const MAX = 12;
  const ratio = street.queue_capacity > 0 ? street.queue_count / street.queue_capacity : 0;
  const count = Math.min(MAX, Math.round(ratio * MAX));

  const horiz  = layout.flow === 'east' || layout.flow === 'west';
  const carL   = horiz ? 11 : 9;
  const carT   = horiz ? 8  : 9;
  const gap    = 3;
  const margin = 5;

  for (let i = 0; i < count; i++) {
    let x, y;
    if (layout.flow === 'east') {
      x = layout.x + margin + i * (carL + gap);
      y = layout.y + (layout.h - carT) / 2;
    } else if (layout.flow === 'west') {
      x = layout.x + layout.w - margin - carL - i * (carL + gap);
      y = layout.y + (layout.h - carT) / 2;
    } else if (layout.flow === 'south') {
      x = layout.x + (layout.w - carT) / 2;
      y = layout.y + margin + i * (carL + gap);
    } else {
      x = layout.x + (layout.w - carT) / 2;
      y = layout.y + layout.h - margin - carL - i * (carL + gap);
    }
    networkScene.appendChild(el('rect', {
      x, y,
      width:  horiz ? carL : carT,
      height: horiz ? carT : carL,
      class: `car-block${isSelected ? ' peak' : ''}`,
    }));
  }
}

function drawSegmentLabel(street, layout, isSelected) {
  const count = `${street.queue_count}/${street.queue_capacity}`;
  const horiz = layout.flow === 'east' || layout.flow === 'west';

  // For west/north lanes push label to the right side to avoid overlap with east/south sibling
  let anchor = 'start';
  if (layout.flow === 'west' || layout.flow === 'north') anchor = 'end';
  if (!horiz) anchor = 'middle';

  networkScene.appendChild(el('text', {
    x: layout.lx, y: layout.ly,
    'text-anchor': anchor,
    class: 'street-small-label',
    fill: isSelected ? '#1a73e8' : undefined,
    'font-size': 10,
  }, street.name));

  networkScene.appendChild(el('text', {
    x: layout.lx, y: layout.ly + 12,
    'text-anchor': anchor,
    class: 'street-small-label',
    'font-size': 10,
  }, count));
}

function drawControlMarker(street, layout) {
  let cx = layout.x + layout.w / 2;
  let cy = layout.y + layout.h / 2;

  // Marker sits at the downstream (exit) end of the lane
  if      (layout.flow === 'east')  { cx = layout.x + layout.w - 9; }
  else if (layout.flow === 'west')  { cx = layout.x + 9; }
  else if (layout.flow === 'south') { cy = layout.y + layout.h - 9; }
  else if (layout.flow === 'north') { cy = layout.y + 9; }

  if (street.control_type === 'stop_sign') {
    networkScene.appendChild(el('rect', { x:cx-14, y:cy-10, width:28, height:20, class:'stop-badge' }));
    networkScene.appendChild(el('text', { x:cx, y:cy+4, class:'stop-text' }, 'STOP'));
    return;
  }

  const fill = street.light === 'GREEN' ? '#137333' : '#c5221f';
  networkScene.appendChild(el('circle', { cx, cy, r:8, fill, class:'signal-light' }));
}

// ─── Details panel ────────────────────────────────────────────────────────────
function getBadgeHtml(street) {
  if (street.control_type === 'stop_sign') return '<span class="badge stop">STOP SIGN</span>';
  return street.light === 'GREEN'
    ? '<span class="badge green">GREEN LIGHT</span>'
    : '<span class="badge red">RED LIGHT</span>';
}

function renderStreetDetails(snap) {
  const street = snap.street_states.find(s => s.name === state.selectedStreet) || snap.street_states[0];
  if (!street) return;
  state.selectedStreet = street.name;

  const pct = Number(street.fullness_pct).toFixed(1);
  const msg = Number(pct) >= 90 ? 'Close to or at capacity this tick.'
            : Number(pct) >= 60 ? 'Visible queue buildup this tick.'
            : 'Handling load without major buildup.';

  streetDetails.innerHTML = `
    <div class="details-title">
      <h3>${street.name}</h3>${getBadgeHtml(street)}
    </div>
    <dl class="details-list">
      <div><dt>Real road</dt><dd>${getRealRoadName(street.name)}</dd></div>
      <div><dt>Simulation segment</dt><dd>${street.name}</dd></div>
      <div><dt>Queue count</dt><dd>${street.queue_count} cars</dd></div>
      <div><dt>Queue capacity</dt><dd>${street.queue_capacity} cars</dd></div>
      <div><dt>Fullness</dt><dd>${pct}%</dd></div>
      <div><dt>Observed arrivals</dt><dd>${street.cars_per5min} cars / 5-min window</dd></div>
      <div><dt>Control type</dt><dd>${street.control_type === 'stop_sign' ? 'Stop sign' : 'Traffic signal'}</dd></div>
      <div><dt>Interpretation</dt><dd>${msg}</dd></div>
      <div><dt>Model note</dt><dd>Segments 1 & 2 are opposite directions. Segment 3 is one-way.</dd></div>
    </dl>`;
}

// ─── Restore cached API base ──────────────────────────────────────────────────
(function () {
  const cached = localStorage.getItem('apiBase');
  if (cached) apiBaseInput.value = cached;
})();