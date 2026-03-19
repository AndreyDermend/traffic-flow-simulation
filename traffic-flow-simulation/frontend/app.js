const state = {
  payload: null,
  currentTick: 0,
};

const apiBaseInput = document.getElementById('apiBase');
const representedSecondsInput = document.getElementById('representedSeconds');
const seedInput = document.getElementById('seed');
const runBtn = document.getElementById('runBtn');
const statusEl = document.getElementById('status');
const summaryGrid = document.getElementById('summaryGrid');
const playbackPanel = document.getElementById('playbackPanel');
const networkPanel = document.getElementById('networkPanel');
const tickSlider = document.getElementById('tickSlider');
const tickReadout = document.getElementById('tickReadout');
const streetGrid = document.getElementById('streetGrid');

runBtn.addEventListener('click', runSimulation);
tickSlider.addEventListener('input', () => {
  state.currentTick = Number(tickSlider.value);
  renderTick();
});

function setStatus(message, isError = false) {
  statusEl.textContent = message;
  statusEl.style.color = isError ? '#fca5a5' : '';
}

function card(title, value) {
  return `
    <article class="summary-card">
      <h3>${title}</h3>
      <p>${value}</p>
    </article>
  `;
}

async function runSimulation() {
  const apiBase = apiBaseInput.value.trim().replace(/\/$/, '');
  const representedSeconds = Number(representedSecondsInput.value || 300);
  const seed = seedInput.value.trim();
  localStorage.setItem('apiBase', apiBase);

  setStatus('Running simulation...');
  runBtn.disabled = true;

  try {
    const query = new URLSearchParams({ represented_seconds: String(representedSeconds) });
    if (seed) query.set('seed', seed);

    const response = await fetch(`${apiBase}/run-simulation?${query.toString()}`);
    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      throw new Error(body.detail || 'Request failed');
    }

    state.payload = await response.json();
    state.currentTick = 0;
    renderSummary();
    configurePlayback();
    renderTick();
    setStatus('Simulation complete.');
  } catch (error) {
    console.error(error);
    setStatus(`Error: ${error.message}`, true);
  } finally {
    runBtn.disabled = false;
  }
}

function renderSummary() {
  const { metadata, summary } = state.payload;
  summaryGrid.innerHTML = [
    card('Engine ticks', metadata.engine_ticks),
    card('Represented seconds', metadata.represented_seconds),
    card('Peak network cars', summary.peak_network_cars),
    card('Peak congestion street', summary.peak_congestion_street),
  ].join('');
}

function configurePlayback() {
  const snapshotCount = state.payload.snapshots.length;
  tickSlider.max = String(snapshotCount - 1);
  tickSlider.value = '0';
  playbackPanel.classList.remove('hidden');
  networkPanel.classList.remove('hidden');
}

function getLightBadge(light, controlType) {
  if (controlType === 'stop_sign') return '<span class="badge stop">STOP SIGN</span>';
  return light === 'GREEN'
    ? '<span class="badge green">GREEN</span>'
    : '<span class="badge red">RED</span>';
}

function renderTick() {
  const snapshot = state.payload.snapshots[state.currentTick];
  tickReadout.textContent = `Tick ${snapshot.tick} / ${state.payload.snapshots.length}`;

  streetGrid.innerHTML = snapshot.street_states.map((street) => {
    const fullness = Number(street.fullness_pct).toFixed(1);
    return `
      <article class="street-card">
        <div class="street-header">
          <div>
            <div class="street-name">${street.name}</div>
            <div class="street-meta">${street.queue_count} / ${street.queue_capacity} cars</div>
          </div>
          ${getLightBadge(street.light, street.control_type)}
        </div>
        <div class="bar-wrap">
          <div class="bar-fill" style="width:${Math.min(Number(fullness), 100)}%"></div>
        </div>
        <div class="street-meta">Fullness: ${fullness}% • Arrivals/5 min: ${street.cars_per5min}</div>
      </article>
    `;
  }).join('');
}

(function restoreApiBase() {
  const cached = localStorage.getItem('apiBase');
  if (cached) apiBaseInput.value = cached;
})();
