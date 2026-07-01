/* =========================================================================
   AstroLaabh — Gemstone Efficacy Meter — ANALYTICS + PERSISTENCE
   PRD §10.6 (events) and §10.1 (sessionStorage so refresh mid-flow keeps
   progress). The analytics layer is a thin shim: it pushes to a dataLayer
   queue and console — wire to GA4 / Segment / CRM in production.
   ========================================================================= */

const QUEUE_KEY = '__astrolaabh_events';
window.dataLayer = window.dataLayer || [];

/* Allowed events (PRD §10.6) — kept explicit so typos are caught. */
const EVENTS = new Set([
  'quiz_start', 'step_view', 'step_answer', 'quiz_complete',
  'verdict_view', 'lead_submit', 'cta_click', 'drop_off',
]);

export function track(event, payload = {}) {
  if (!EVENTS.has(event)) console.warn('[analytics] unknown event:', event);
  const record = { event, ts: new Date().toISOString(), ...payload };
  window.dataLayer.push(record);
  // visible during development; replace transport in production
  console.debug('%c▸ analytics', 'color:#B08A3E;font-weight:700', event, payload);
}

/* drop-off: fire the last step seen when the tab is hidden / closed mid-flow */
let _lastStep = null;
let _completed = false;
export function markStep(step) { _lastStep = step; }
export function markComplete() { _completed = true; }
function flushDropOff() {
  if (!_completed && _lastStep != null) track('drop_off', { lastStep: _lastStep });
}
window.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') flushDropOff(); });

/* ---- sessionStorage persistence ------------------------------------- */
const STATE_KEY = '__astrolaabh_state';

export function saveState(state) {
  try { sessionStorage.setItem(STATE_KEY, JSON.stringify(state)); } catch (_) { /* ignore quota/private mode */ }
}
export function loadState() {
  try {
    const raw = sessionStorage.getItem(STATE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (_) { return null; }
}
export function clearState() {
  try { sessionStorage.removeItem(STATE_KEY); } catch (_) {}
}
