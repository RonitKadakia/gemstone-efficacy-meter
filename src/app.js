/* =========================================================================
   AstroLaabh — Gemstone Efficacy Meter — APP
   Orchestration: state, rendering, linear navigation, keyboard a11y,
   sessionStorage persistence, analytics. No framework — config-driven views.
   ========================================================================= */

import { QUESTIONS, TOTAL_STEPS, questionByStep, STONES, SCORING } from './config.js';
import { score, buildGaps, metalPoints, fingerPoints } from './scoring.js';
import { optionVisual } from './illustrations.js';
import { track, markStep, markComplete, saveState, loadState, clearState } from './analytics.js';

const root = document.getElementById('app');

/* ---------------------------------------------------------------- state */
const fresh = () => ({ view: 'landing', step: 1, stoneId: null, answers: {}, leadSubmitted: false });
let state = loadState() || fresh();
// if a saved session exists we resume where they were (PRD §10.1 / AC7)

function persist() { saveState(state); }

/* ---------------------------------------------------------------- icons */
const I = {
  arrow: '<svg class="arrow" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
  back: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M11 18l-6-6 6-6"/></svg>',
  clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
  list: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 6h12M8 12h12M8 18h12M3 6h.01M3 12h.01M3 18h.01"/></svg>',
  lock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 1 1 8 0v3"/></svg>',
  info: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/></svg>',
  check: '<svg viewBox="0 0 24 24" fill="none" stroke="#4F5638" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 12.5l2.5 2.5L16 9"/></svg>',
  cam: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 8h3l2-2h8l2 2h3v11H3z"/><circle cx="12" cy="13" r="3.5"/></svg>',
  tick: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 13l4 4L19 7"/></svg>',
};

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

/* ============================================================ RENDER root */
function render() {
  // lock the viewport (no page scroll) only on the quiz steps; landing & result scroll
  document.body.classList.toggle('quiz-lock', state.view === 'step');
  if (state.view === 'landing') renderLanding();
  else if (state.view === 'result') renderResult();
  else renderStep();
  persist();
}

/* ============================================================ LANDING */
function renderLanding() {
  root.innerHTML = `
    <section class="screen landing">
      <div class="wordmark">Astro Laabh</div>
      <div class="tagline-rule"></div>
      <p class="eyebrow">Gemstone Efficacy Meter</p>
      <h1>How well is your gemstone <em>actually</em> working?</h1>
      <p class="lede">A 9-question Vedic assessment of your stone’s quality, light and wearing — with an honest, plain-language read on what’s helping and what isn’t.</p>
      <button class="btn btn-gold" id="begin">Begin the assessment ${I.arrow}</button>
    </section>`;

  root.querySelector('#begin').addEventListener('click', () => {
    if (state.step === 1 && !state.stoneId) { /* fresh */ }
    track('quiz_start');
    state.view = 'step';
    if (!state.stoneId) state.step = 1;
    render();
  });
}

/* ============================================================ STEP */
function selectionForStep(q) {
  if (q.step === 1) return state.stoneId;
  if (q.dynamic) return state.answers.metal && state.answers.finger ? true : null;
  return state.answers[q.factorKey] ? state.answers[q.factorKey].optionId : null;
}

function renderStep() {
  const q = questionByStep(state.step);
  const stoneId = state.stoneId;
  const pct = Math.round((state.step / TOTAL_STEPS) * 100);
  const stoneTag = stoneId ? STONES[stoneId].displayName : '';

  const body = q.dynamic ? dynamicOptionsHTML(q, stoneId) : staticOptionsHTML(q);
  const ambient = stoneId ? STONES[stoneId].gem.color : '#C9A84C';

  root.innerHTML = `
    <section class="screen step" style="--stone:${ambient}">
      <div class="step-ambient" aria-hidden="true"></div>
      <div class="topbar">
        <button class="backbtn" id="back" aria-label="Go back">${I.back}</button>
        <div class="progress-wrap">
          <div class="step-label"><span>Step ${state.step} of ${TOTAL_STEPS}</span>${stoneTag ? `<span class="stone-tag">${esc(stoneTag)}</span>` : ''}</div>
          <div class="progress-track"><div class="progress-fill" id="pfill"></div></div>
        </div>
      </div>

      <h2 class="q-title">${esc(q.title)}</h2>
      ${q.hint ? `<p class="q-hint">${esc(q.hint)}</p>` : ''}

      <div class="step-body">${body}</div>

      ${state.step === TOTAL_STEPS ? `<div class="step-foot">
        <button class="btn btn-primary" id="continue" disabled>See my result ${I.arrow}</button>
      </div>` : ''}
    </section>`;

  // a pending auto-advance from a previous step must not fire on this one
  clearTimeout(advanceTimer);

  // progress fill (animate after paint)
  requestAnimationFrame(() => { root.querySelector('#pfill').style.width = pct + '%'; });

  // back button (allowed at any step → step 1 returns to landing)
  root.querySelector('#back').addEventListener('click', goBack);

  // wire options
  if (q.dynamic) wireDynamic(q, stoneId);
  else wireStatic(q);

  // continue button only exists on the final step (others auto-advance)
  const cont = root.querySelector('#continue');
  const refreshContinue = () => { if (cont) cont.disabled = !selectionForStep(q); };
  refreshContinue();
  if (cont) cont.addEventListener('click', goNext);
  root._refreshContinue = refreshContinue;

  track('step_view', { step: state.step, stoneId: stoneId || null });
  markStep(state.step);
}

/* Steps 1–8 advance automatically once their selection is complete (Step 8
   needs both metal + finger). The final step uses the explicit button. A short
   delay lets the selected card's gold check register before moving on. */
let advanceTimer = null;
const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
function maybeAdvance(q) {
  if (q.step >= TOTAL_STEPS) return;       // last step → "See my result" button
  if (!selectionForStep(q)) return;        // wait for a complete selection
  clearTimeout(advanceTimer);
  advanceTimer = setTimeout(goNext, reducedMotion() ? 80 : 340);
}

/* ---- static (single radiogroup) image-button options ---------------- */
function gridClass(q) {
  return '';   // default 2-up grid; visuals are authored to a 4:3 card
}
function staticOptionsHTML(q) {
  const sel = q.step === 1 ? state.stoneId : state.answers[q.factorKey]?.optionId;
  return `<div class="option-grid ${gridClass(q)}" role="radiogroup" aria-label="${esc(q.title)}">
    ${q.options.map((o, i) => optCard(o, o.id === sel, i, q.image, state.stoneId)).join('')}
  </div>`;
}

/* one large image-button. For Step 1 the card's own id is the stone; for
   every other step the visual reflects the currently-selected stone. */
function optCard(o, checked, idx, imageKey, stoneId, factor) {
  const visualStone = imageKey === 'stone_select' ? o.id : (stoneId || 'yellow_sapphire');
  const aria = o.label + (o.subLabel ? ', ' + o.subLabel : '');
  return `<button class="opt-card${factor ? ' compact' : ''}" role="radio" aria-checked="${checked}"
      tabindex="${checked || idx === 0 ? 0 : -1}" data-id="${o.id}" aria-label="${esc(aria)}">
    <span class="opt-visual">${optionVisual(imageKey, o.id, visualStone, factor)}</span>
    <span class="opt-badge" aria-hidden="true">${I.tick}</span>
    <span class="opt-meta">
      <span class="opt-label">${esc(o.label)}</span>
      ${o.subLabel && imageKey !== 'origin' ? `<span class="opt-sub">${esc(o.subLabel)}</span>` : ''}
    </span>
  </button>`;
}

function wireStatic(q) {
  const group = root.querySelector('[role="radiogroup"]');
  const opts = [...group.querySelectorAll('.opt-card')];

  const choose = (el, advance) => {
    opts.forEach((o) => { o.setAttribute('aria-checked', o === el); o.tabIndex = o === el ? 0 : -1; });
    const id = el.dataset.id;
    if (q.step === 1) {
      state.stoneId = id;
    } else {
      const opt = q.options.find((o) => o.id === id);
      state.answers[q.factorKey] = { optionId: id, points: opt.points };
    }
    track('step_answer', { step: q.step, optionId: id, points: q.step === 1 ? 0 : q.options.find((o) => o.id === id).points });
    root._refreshContinue();
    persist();
    if (advance) maybeAdvance(q);
  };

  group.addEventListener('click', (e) => { const el = e.target.closest('.opt-card'); if (el) choose(el, true); });
  group.addEventListener('keydown', (e) => radioKeys(e, opts, choose));
}

/* ---- dynamic Step 8 (metal + finger sub-groups) --------------------- */
function dynamicOptionsHTML(q, stoneId) {
  const m = state.answers.metal?.optionId;
  const f = state.answers.finger?.optionId;
  const sub = (heading, pts, name, options, sel) => `
    <div class="subfactor">
      <p class="subfactor-h">${heading} <span class="pts-tag">${pts} pts</span></p>
      <div class="option-grid compact" role="radiogroup" aria-label="${heading}" data-factor="${name}">
        ${options.map((o, i) => optCard(o, o.id === sel, i, q.image, stoneId, name)).join('')}
      </div>
    </div>`;
  return sub('Metal it’s set in', 8, 'metal', q.metalOptions, m)
       + sub('Finger it’s worn on', 5, 'finger', q.fingerOptions, f);
}

function wireDynamic(q, stoneId) {
  root.querySelectorAll('[role="radiogroup"]').forEach((group) => {
    const factor = group.dataset.factor; // 'metal' | 'finger'
    const opts = [...group.querySelectorAll('.opt-card')];
    const choose = (el, advance) => {
      opts.forEach((o) => { o.setAttribute('aria-checked', o === el); o.tabIndex = o === el ? 0 : -1; });
      const id = el.dataset.id;
      const pts = factor === 'metal' ? metalPoints(stoneId, id) : fingerPoints(stoneId, id);
      state.answers[factor] = { optionId: id, points: pts };
      track('step_answer', { step: q.step, factor, optionId: id, points: pts });
      root._refreshContinue();
      persist();
      if (advance) maybeAdvance(q);   // fires once both metal + finger are chosen
    };
    group.addEventListener('click', (e) => { const el = e.target.closest('.opt-card'); if (el) choose(el, true); });
    group.addEventListener('keydown', (e) => radioKeys(e, opts, choose));
  });
}

/* ---- shared radiogroup keyboard handling (PRD §10.7) ---------------- */
function radioKeys(e, opts, choose) {
  const idx = opts.indexOf(document.activeElement);
  // arrows move focus + select but do NOT auto-advance (keeps keyboard nav usable)
  if (['ArrowDown', 'ArrowRight'].includes(e.key)) {
    e.preventDefault(); const n = opts[(idx + 1 + opts.length) % opts.length]; n.focus(); choose(n, false);
  } else if (['ArrowUp', 'ArrowLeft'].includes(e.key)) {
    e.preventDefault(); const n = opts[(idx - 1 + opts.length) % opts.length]; n.focus(); choose(n, false);
  } else if (e.key === ' ' || e.key === 'Enter') {
    // Enter / Space confirms and advances
    e.preventDefault(); const el = e.target.closest('.opt-card'); if (el) choose(el, true);
  }
}

/* ---------------------------------------------------------------- nav */
function goNext() {
  if (state.step < TOTAL_STEPS) { state.step++; render(); window.scrollTo({ top: 0, behavior: 'smooth' }); }
  else { state.view = 'result'; render(); window.scrollTo({ top: 0 }); }
}
function goBack() {
  if (state.step > 1) { state.step--; state.view = 'step'; render(); window.scrollTo({ top: 0 }); }
  else { state.view = 'landing'; render(); }
}

/* ============================================================ RESULT */
function renderResult() {
  const result = score(state.stoneId, state.answers);
  const stone = STONES[state.stoneId];
  const gaps = buildGaps(state.stoneId, state.answers, QUESTIONS);
  const v = result.verdict;

  const pillars = [
    { key: 'quality', name: 'Stone Quality', max: 65 },
    { key: 'light', name: 'Light & Luster', max: 35 },
    { key: 'compliance', name: 'Wearing Compliance', max: 20 },
  ];
  const weakest = pillars.reduce((a, b) => (result.pillarPercent[b.key] < result.pillarPercent[a.key] ? b : a)).key;

  const C = 2 * Math.PI * 100; // ring circumference (r=100)

  root.innerHTML = `
    <section class="screen result">
      <div class="brandbar" style="margin-bottom:1.4rem"><span class="wordmark" style="font-size:1rem">Astro Laabh</span></div>
      <p class="eyebrow verdict-eyebrow">Your ${esc(stone.displayName)} · ${esc(stone.vedicName)} · ${esc(stone.planet)}</p>

      <div class="ring-wrap">
        <svg viewBox="0 0 230 230">
          <defs>
            <linearGradient id="goldStroke" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stop-color="#D8BC68"/><stop offset="55%" stop-color="#C9A84C"/><stop offset="100%" stop-color="#B08A3E"/>
            </linearGradient>
          </defs>
          <circle class="ring-bg" cx="115" cy="115" r="100"/>
          <circle class="ring-fg" id="ring" cx="115" cy="115" r="100"
            stroke-dasharray="${C.toFixed(1)}" stroke-dashoffset="${C.toFixed(1)}"/>
        </svg>
        <div class="ring-center">
          <div class="ring-pct"><span id="pctnum">0</span><span class="sym">%</span></div>
          <div class="ring-sub">Efficacy</div>
        </div>
      </div>

      <div class="verdict-label">${esc(v.label)}</div>
      <p class="verdict-msg">${esc(v.message)}${result.capped ? ' <em>(score capped - a core disqualifier is present)</em>' : ''}</p>

      <div class="divider-orn"><span class="lbl">The three pillars</span></div>
      <div class="pillars">
        ${pillars.map((p) => {
          const val = result.pillarPercent[p.key];
          return `<div class="pillar-row">
            <div class="pillar-head">
              <span class="pillar-name">${p.name} <span class="max">· ${result.pillarRaw[p.key]}/${p.max} pts</span></span>
              <span class="pillar-val">${val}%</span>
            </div>
            <div class="pillar-track"><div class="pillar-bar ${p.key === weakest ? 'weak' : ''}" data-val="${val}"></div></div>
          </div>`;
        }).join('')}
      </div>

      <div class="divider-orn"><span class="lbl">${gaps.length ? 'What’s holding it back' : 'A clean result'}</span></div>
      ${gaps.length ? `<div class="gaps">
        ${gaps.map((g) => `<div class="gap">
          <span class="gap-icon">${I.info}</span>
          <div class="gap-body"><div class="gap-factor">${esc(g.factorName)}</div><div class="gap-text">${esc(g.text)}</div></div>
        </div>`).join('')}
      </div>` : `<div class="gaps-none">${I.check}<span>Your stone meets the key Vedic criteria across all factors. Maintain proper wearing and energising to keep it working.</span></div>`}

      ${leadHTML()}

      <div class="restart"><button id="restart">↺ Start over with a different stone</button></div>
      <p class="disclaimer">This score is an educational guide based on your answers - not a substitute for lab certification or a consultation with an AstroLaabh astrologer.</p>
    </section>`;

  // animate ring + number + pillars
  const ring = root.querySelector('#ring');
  const pctnum = root.querySelector('#pctnum');
  const target = result.efficacyPercent;
  requestAnimationFrame(() => {
    ring.style.strokeDashoffset = (C * (1 - target / 100)).toFixed(1);
    root.querySelectorAll('.pillar-bar').forEach((b) => { b.style.width = b.dataset.val + '%'; });
    animateNumber(pctnum, target, 1300);
  });

  wireLead();
  root.querySelector('#restart').addEventListener('click', restart);

  // analytics: completion + verdict
  track('quiz_complete', { efficacyPercent: result.efficacyPercent, pillarPercent: result.pillarPercent });
  track('verdict_view', { verdict: v.label, efficacyPercent: result.efficacyPercent });
  markComplete();
}

function leadHTML() {
  if (state.leadSubmitted) {
    return `<div class="lead" id="lead"><div class="thanks">
      ${I.check}<h3>Thank you</h3>
      <p class="lead-sub">Your full breakdown is on its way. An AstroLaabh expert will reach out shortly.</p>
    </div></div>`;
  }
  return `<div class="lead" id="lead">
    <h3>Get your full breakdown</h3>
    <p class="lead-sub">Optional - leave your details and we’ll send the complete report and connect you with an expert. You can act on your result without this.</p>
    <form id="leadform" novalidate>
      <div class="field"><label for="lf-name">Name</label><input id="lf-name" name="name" autocomplete="name" required placeholder="Your name"/></div>
      <div class="field"><label for="lf-contact">Phone number</label><input id="lf-contact" name="contact" type="tel" autocomplete="tel" inputmode="tel" required placeholder="Your WhatsApp number"/></div>
      <button class="btn btn-gold" type="submit">Send me the breakdown ${I.arrow}</button>
    </form>
  </div>`;
}

function wireLead() {
  const form = root.querySelector('#leadform');
  if (!form) return;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = form.name.value.trim();
    const contact = form.contact.value.trim();
    if (!name || !contact) {
      (!name ? form.name : form.contact).focus();
      return;
    }
    track('lead_submit', { hasContact: !!contact });
    state.leadSubmitted = true;
    persist();
    render();
    requestAnimationFrame(() => root.querySelector('#lead')?.scrollIntoView({ behavior: 'smooth', block: 'center' }));
  });
}

/* count-up animation, respects reduced motion */
function animateNumber(el, target, dur) {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) { el.textContent = target; return; }
  const start = performance.now();
  function frame(now) {
    const t = Math.min(1, (now - start) / dur);
    const eased = 1 - Math.pow(1 - t, 3);
    el.textContent = Math.round(target * eased);
    if (t < 1) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

function restart() {
  clearState();
  state = fresh();
  render();
  window.scrollTo({ top: 0 });
}

/* ---------------------------------------------------------------- boot */
render();
