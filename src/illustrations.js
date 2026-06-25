/* =========================================================================
   AstroLaabh — Gemstone Efficacy Meter — ILLUSTRATIONS
   Imagery is core to this product (PRD §5.4). These are brand-styled
   instructional SVG illustrations standing in for the prescribed reference
   photography, each serving the step's stated purpose (identify / educate /
   calibrate / instruct). They carry meaning, so every step also has alt text.
   ========================================================================= */

import { STONES } from './config.js';

const PALETTE = { bg: '#FBF8F1', surface: '#EFE7D9', sage: '#8A9070', olive: '#4F5638', gold: '#C9A84C', goldDeep: '#B08A3E', sand: '#C8AC8C', ink: '#2A2E20' };

/* ---- faceted octagonal gem (also the brand's logo motif) ------------- */
function octPoints(cx, cy, r, rot = 22.5) {
  const pts = [];
  for (let i = 0; i < 8; i++) {
    const a = ((rot + i * 45) * Math.PI) / 180;
    pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
  }
  return pts;
}
const poly = (pts) => pts.map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ');

/**
 * gem(cx, cy, r, color, opts) — a faceted octagon with adjustable optics.
 *  clarity 0..1  (transparency), luster 0..1 (specular), backlit, inclusions,
 *  fractures, scratches, dull.
 */
function gem(cx, cy, r, color, opts = {}) {
  const { clarity = 1, luster = 1, backlit = false, inclusions = false, fractures = false, scratches = false } = opts;
  const id = `g${Math.round(cx)}_${Math.round(cy)}_${r}`;
  const outer = octPoints(cx, cy, r);
  const table = octPoints(cx, cy, r * 0.5);
  const haze = (1 - clarity);

  let facets = '';
  for (let i = 0; i < 8; i++) {
    const a = outer[i], b = outer[(i + 1) % 8], t = table[i], t2 = table[(i + 1) % 8];
    const shade = i % 2 === 0 ? 0.16 : 0.30;
    facets += `<polygon points="${poly([a, b, t2, t])}" fill="${color}" fill-opacity="${(0.55 + shade) * (0.5 + clarity * 0.5)}" stroke="${PALETTE.ink}" stroke-opacity="0.10" stroke-width="0.6"/>`;
  }
  // table facet lines
  let crown = '';
  for (let i = 0; i < 8; i++) crown += `<line x1="${cx}" y1="${cy}" x2="${table[i][0].toFixed(1)}" y2="${table[i][1].toFixed(1)}" stroke="${PALETTE.ink}" stroke-opacity="0.10" stroke-width="0.5"/>`;

  const glow = backlit
    ? `<circle cx="${cx}" cy="${cy}" r="${r * 1.5}" fill="url(#${id}_glow)"/>`
    : '';
  const specular = luster > 0.05
    ? `<ellipse cx="${cx - r * 0.22}" cy="${cy - r * 0.28}" rx="${r * 0.26}" ry="${r * 0.14}" fill="#ffffff" fill-opacity="${0.65 * luster}" transform="rotate(-30 ${cx} ${cy})"/>`
    : '';
  const hazeOverlay = haze > 0.02
    ? `<polygon points="${poly(outer)}" fill="#ffffff" fill-opacity="${haze * 0.7}"/>`
    : '';
  let marks = '';
  if (inclusions) marks += `<g stroke="${PALETTE.sand}" stroke-opacity="0.7" stroke-width="0.8" stroke-linecap="round">
      <line x1="${cx - r*0.3}" y1="${cy - r*0.1}" x2="${cx + r*0.25}" y2="${cy + r*0.05}"/>
      <line x1="${cx - r*0.1}" y1="${cy - r*0.3}" x2="${cx + r*0.05}" y2="${cy + r*0.3}"/>
      <line x1="${cx - r*0.28}" y1="${cy + r*0.2}" x2="${cx + r*0.2}" y2="${cy - r*0.25}"/></g>`;
  if (fractures) marks += `<g stroke="#ffffff" stroke-opacity="0.85" stroke-width="1.1" fill="none">
      <path d="M${cx - r*0.35},${cy - r*0.2} L${cx - r*0.05},${cy} L${cx + r*0.3},${cy - r*0.15}"/>
      <path d="M${cx - r*0.1},${cy + r*0.3} L${cx + r*0.1},${cy + r*0.02} L${cx + r*0.28},${cy + r*0.22}"/></g>`;
  if (scratches) marks += `<g stroke="#ffffff" stroke-opacity="0.9" stroke-width="0.9" stroke-linecap="round">
      <line x1="${cx - r*0.4}" y1="${cy - r*0.35}" x2="${cx + r*0.1}" y2="${cy + r*0.1}"/>
      <line x1="${cx - r*0.15}" y1="${cy - r*0.4}" x2="${cx + r*0.35}" y2="${cy + r*0.05}"/>
      <line x1="${cx + r*0.05}" y1="${cy - r*0.3}" x2="${cx + r*0.3}" y2="${cy - r*0.05}"/></g>`;

  return `
    <defs>
      <radialGradient id="${id}_glow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="${color}" stop-opacity="0.55"/>
        <stop offset="100%" stop-color="${color}" stop-opacity="0"/>
      </radialGradient>
    </defs>
    ${glow}
    <g>
      <polygon points="${poly(outer)}" fill="${color}" fill-opacity="${0.85 * (0.4 + clarity * 0.6)}"/>
      ${facets}${crown}${hazeOverlay}${marks}${specular}
      <polygon points="${poly(outer)}" fill="none" stroke="${PALETTE.goldDeep}" stroke-width="1.4" stroke-opacity="0.9"/>
    </g>`;
}

/* ---- exported brand logo mark (octagonal faceted gem) --------------- */
export function gemMark(size = 34) {
  return `<svg class="gemmark" width="${size}" height="${size}" viewBox="0 0 100 100" role="img" aria-label="AstroLaabh">
    <circle cx="50" cy="50" r="48" fill="none" stroke="${PALETTE.gold}" stroke-width="1.5" stroke-opacity="0.5"/>
    ${gem(50, 50, 30, PALETTE.gold, { clarity: 1, luster: 0.9 })}
  </svg>`;
}

/* generic frame helpers */
const W = 600;
const frame = (h, inner, bg = PALETTE.bg) =>
  `<svg viewBox="0 0 ${W} ${h}" width="${W}" height="${h}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
     <rect width="${W}" height="${h}" fill="${bg}"/>${inner}</svg>`;
const panelLabel = (x, y, t) =>
  `<text x="${x}" y="${y}" font-family="Mulish,sans-serif" font-size="13" font-weight="700" letter-spacing="1.5" fill="${PALETTE.sage}" text-anchor="middle">${t.toUpperCase()}</text>`;
const tick = (x, y, t) =>
  `<text x="${x}" y="${y}" font-family="Mulish,sans-serif" font-size="12" fill="${PALETTE.olive}" text-anchor="middle">${t}</text>`;
const divLine = (x, h) => `<line x1="${x}" y1="22" x2="${x}" y2="${h-22}" stroke="${PALETTE.sand}" stroke-opacity="0.5" stroke-dasharray="3 4"/>`;

/* =========================================================================
   Per-step illustrations.  Each takes the selected stoneId for colour.
   ========================================================================= */
const ILLUS = {
  /* Step 1 — identification: the four loose stones */
  stone_select() {
    const ids = ['yellow_sapphire', 'blue_sapphire', 'ruby', 'emerald'];
    const xs = [120, 260, 400, 480];
    let g = '';
    ids.forEach((id, i) => {
      const x = 90 + i * 145;
      g += gem(x, 95, 48, STONES[id].gem.color, { clarity: 1, luster: 0.85 });
      g += `<text x="${x}" y="180" font-family="Mulish,sans-serif" font-size="13" font-weight="600" fill="${PALETTE.olive}" text-anchor="middle">${STONES[id].displayName}</text>`;
      g += `<text x="${x}" y="197" font-family="Mulish,sans-serif" font-size="11" fill="${PALETTE.sage}" text-anchor="middle">${STONES[id].vedicName} · ${STONES[id].planet}</text>`;
    });
    return frame(220, g);
  },

  /* Step 2 — origin: premium vs secondary of the selected stone */
  origin(stoneId) {
    const c = STONES[stoneId].gem.color;
    return frame(220, `
      ${divLine(W/2, 220)}
      ${gem(155, 95, 58, c, { clarity: 1, luster: 0.95 })}
      ${gem(445, 95, 58, c, { clarity: 0.55, luster: 0.5, inclusions: true })}
      ${panelLabel(155, 185, 'Premium origin')}
      <text x="155" y="203" font-family="Mulish" font-size="11" fill="${PALETTE.sage}" text-anchor="middle">Vivid, clean — deep saturation</text>
      ${panelLabel(445, 185, 'Secondary origin')}
      <text x="445" y="203" font-family="Mulish" font-size="11" fill="${PALETTE.sage}" text-anchor="middle">Paler, more included</text>
    `);
  },

  /* Step 3 — treatment: untreated (silk) vs heated (healed flux) under loupe */
  treatment(stoneId) {
    const c = STONES[stoneId].gem.color;
    const loupe = (cx) => `<circle cx="${cx}" cy="95" r="74" fill="none" stroke="${PALETTE.sand}" stroke-width="3"/><circle cx="${cx}" cy="95" r="78" fill="none" stroke="${PALETTE.goldDeep}" stroke-width="1.5" stroke-opacity="0.5"/>`;
    return frame(220, `
      ${divLine(W/2, 220)}
      ${loupe(155)}${gem(155, 95, 50, c, { clarity: 0.95, luster: 0.85, inclusions: true })}
      ${loupe(445)}${gem(445, 95, 50, c, { clarity: 0.8, luster: 0.6, fractures: true })}
      ${panelLabel(155, 188, 'Untreated')}
      <text x="155" y="205" font-family="Mulish" font-size="11" fill="${PALETTE.sage}" text-anchor="middle">Natural silk inclusions</text>
      ${panelLabel(445, 188, 'Heated / treated')}
      <text x="445" y="205" font-family="Mulish" font-size="11" fill="${PALETTE.sage}" text-anchor="middle">Healed fractures, flux residue</text>
    `);
  },

  /* Step 4 — light transmission: the 4-panel backlit calibration (KEY) */
  light(stoneId) {
    const c = STONES[stoneId].gem.color;
    const labels = ['Fully transparent', 'Mostly transparent', 'Cloudy / milky', 'Opaque'];
    const clar = [1, 0.7, 0.35, 0.0];
    let g = '';
    for (let i = 0; i < 4; i++) {
      const cx = 75 + i * 150;
      g += `<rect x="${cx-58}" y="20" width="116" height="116" rx="10" fill="#FFFDF8" stroke="${PALETTE.surface}"/>`;
      // backlight beam from behind
      g += `<rect x="${cx-58}" y="20" width="116" height="116" rx="10" fill="url(#beam)"/>`;
      g += gem(cx, 78, 40, c, { clarity: clar[i], luster: 0.6, backlit: clar[i] > 0.1 });
      g += panelLabel(cx, 158, labels[i]);
      if (i < 3) g += divLine(cx + 75, 175);
    }
    const defs = `<defs><linearGradient id="beam" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="${PALETTE.gold}" stop-opacity="0.25"/>
        <stop offset="100%" stop-color="${PALETTE.gold}" stop-opacity="0"/></linearGradient></defs>`;
    const instr = `<g transform="translate(0,178)">
        <rect x="0" y="0" width="${W}" height="42" fill="${PALETTE.surface}"/>
        <circle cx="40" cy="21" r="11" fill="none" stroke="${PALETTE.goldDeep}" stroke-width="1.5"/>
        <path d="M40 14 v14 M33 21 h14" stroke="${PALETTE.goldDeep}" stroke-width="1.5"/>
        <text x="62" y="25" font-family="Mulish" font-size="12.5" fill="${PALETTE.olive}">Hold the stone to a window or phone torch and compare against these four.</text>
      </g>`;
    return frame(220, defs + g + instr);
  },

  /* Step 5 — luster: 4-panel surface reflection reference */
  luster(stoneId) {
    const c = STONES[stoneId].gem.color;
    const labels = ['Bright & vivid', 'Moderate sheen', 'Dull / waxy', 'Scratched'];
    const lus = [1, 0.55, 0.12, 0.3];
    let g = '';
    for (let i = 0; i < 4; i++) {
      const cx = 75 + i * 150;
      g += `<rect x="${cx-58}" y="20" width="116" height="116" rx="10" fill="#F1ECE0" stroke="${PALETTE.surface}"/>`;
      g += gem(cx, 78, 40, c, { clarity: 0.85, luster: lus[i], scratches: i === 3 });
      g += panelLabel(cx, 158, labels[i]);
      if (i < 3) g += divLine(cx + 75, 175);
    }
    return frame(180, g);
  },

  /* Step 6 — carat: visual weight/scale comparison with a ruler */
  carat(stoneId) {
    const c = STONES[stoneId].gem.color;
    const sizes = [22, 34, 46, 58];
    const labels = ['1.5 ct', '3 ct', '5 ct', '7 ct'];
    let g = '';
    const baseY = 110;
    for (let i = 0; i < 4; i++) {
      const cx = 95 + i * 140;
      g += gem(cx, baseY - sizes[i] + 36, sizes[i], c, { clarity: 1, luster: 0.85 });
      g += tick(cx, 175, labels[i]);
    }
    // ruler
    g += `<line x1="40" y1="150" x2="${W-40}" y2="150" stroke="${PALETTE.sage}" stroke-width="1"/>`;
    for (let x = 40; x <= W-40; x += 26) g += `<line x1="${x}" y1="150" x2="${x}" y2="156" stroke="${PALETTE.sage}" stroke-width="1"/>`;
    g += `<text x="${W/2}" y="200" font-family="Mulish" font-size="11" fill="${PALETTE.sage}" text-anchor="middle">Shown to scale — more mass holds more planetary energy</text>`;
    return frame(220, g);
  },

  /* Step 7 — certification: a lab report mock with key fields highlighted */
  certification() {
    const row = (y, k, v, hi) => `
      <text x="55" y="${y}" font-family="Mulish" font-size="12" fill="${PALETTE.sage}">${k}</text>
      ${hi ? `<rect x="200" y="${y-13}" width="200" height="19" rx="4" fill="${PALETTE.gold}" fill-opacity="0.22"/>` : ''}
      <text x="208" y="${y}" font-family="Mulish" font-size="12.5" font-weight="${hi?700:500}" fill="${PALETTE.olive}">${v}</text>`;
    return frame(220, `
      <rect x="40" y="18" width="${W-80}" height="184" rx="10" fill="#FFFDF8" stroke="${PALETTE.sand}"/>
      <rect x="40" y="18" width="${W-80}" height="40" rx="10" fill="${PALETTE.olive}"/>
      <text x="55" y="43" font-family="Marcellus,serif" font-size="16" fill="#F4EEE4" letter-spacing="2">GEMSTONE ORIGIN REPORT</text>
      <circle cx="${W-70}" cy="38" r="13" fill="none" stroke="${PALETTE.gold}" stroke-width="1.5"/>
      ${row(85, 'Species', 'Natural Corundum')}
      ${row(110, 'Origin', 'Sri Lanka (Ceylon)', true)}
      ${row(135, 'Treatment', 'No indication of heating', true)}
      ${row(160, 'Weight', '5.42 ct', true)}
      ${row(185, 'Comment', 'Conforms to GRS standards')}
      <text x="${W/2}" y="215" font-family="Mulish" font-size="10.5" fill="${PALETTE.sage}" text-anchor="middle" opacity="0">.</text>
    `);
  },

  /* Step 8 — hand wearing the four stones on their correct fingers,
     selected stone's finger highlighted; plus metal swatches */
  hand(stoneId) {
    const map = { index: 0, middle: 1, ring: 2, little: 3 };
    const sel = STONES[stoneId].correctFinger;
    // four fingers as rounded bars
    const fx = [180, 232, 284, 330];
    const ftop = [60, 44, 56, 86];
    const fingerStones = ['yellow_sapphire', 'blue_sapphire', 'ruby', 'emerald'];
    const fnames = ['Index', 'Middle', 'Ring', 'Little'];
    let g = `<rect x="150" y="150" width="220" height="60" rx="26" fill="${PALETTE.sand}" fill-opacity="0.5"/>`; // palm
    for (let i = 0; i < 4; i++) {
      const w = 30;
      g += `<rect x="${fx[i]-w/2}" y="${ftop[i]}" width="${w}" height="${170-ftop[i]}" rx="15" fill="${PALETTE.sand}" fill-opacity="0.5"/>`;
      const ringY = ftop[i] + 46;
      const isSel = sel === fingerStones[i] || (map[sel] === i);
      // ring band
      g += `<rect x="${fx[i]-w/2-3}" y="${ringY-7}" width="${w+6}" height="16" rx="6" fill="${PALETTE.gold}"/>`;
      g += gem(fx[i], ringY+1, 11, STONES[fingerStones[i]].gem.color, { clarity: 1, luster: 0.9 });
      if (isSel) g += `<circle cx="${fx[i]}" cy="${ringY+1}" r="22" fill="none" stroke="${PALETTE.goldDeep}" stroke-width="2" stroke-dasharray="3 3"/>`;
      g += `<text x="${fx[i]}" y="195" font-family="Mulish" font-size="10.5" font-weight="${isSel?700:500}" fill="${isSel?PALETTE.goldDeep:PALETTE.sage}" text-anchor="middle">${fnames[i]}</text>`;
    }
    // metal swatches
    const sw = (x, fill, label) => `<circle cx="${x}" cy="70" r="18" fill="${fill}" stroke="${PALETTE.ink}" stroke-opacity="0.15"/><text x="${x}" y="106" font-family="Mulish" font-size="10.5" fill="${PALETTE.olive}" text-anchor="middle">${label}</text>`;
    g += sw(465, '#D9B84F', 'Gold');
    g += sw(515, '#C8CBD0', 'Silver');
    g += sw(565, '#B79A6F', 'Panch.');
    g += `<text x="515" y="40" font-family="Mulish" font-size="11" font-weight="700" letter-spacing="1.2" fill="${PALETTE.sage}" text-anchor="middle">METALS</text>`;
    return frame(220, g);
  },

  /* Step 9 — energising: aspirational copper-thali ritual (no deity imagery) */
  energising(stoneId) {
    const c = STONES[stoneId].gem.color;
    const diya = (x, y) => `<g>
      <ellipse cx="${x}" cy="${y}" rx="22" ry="8" fill="${PALETTE.goldDeep}"/>
      <path d="M${x-22} ${y} a22 9 0 0 0 44 0" fill="${PALETTE.sand}"/>
      <path d="M${x} ${y-26} C ${x-7} ${y-12}, ${x+7} ${y-12}, ${x} ${y-26} Z" fill="${PALETTE.gold}"/>
      <circle cx="${x}" cy="${y-14}" r="4" fill="#FFE9A8"/></g>`;
    const flower = (x, y) => `<g>${[0,72,144,216,288].map(a=>{const rad=a*Math.PI/180;return `<ellipse cx="${(x+10*Math.cos(rad)).toFixed(1)}" cy="${(y+10*Math.sin(rad)).toFixed(1)}" rx="7" ry="4" fill="#E8B7C2" transform="rotate(${a} ${x} ${y})"/>`}).join('')}<circle cx="${x}" cy="${y}" r="5" fill="${PALETTE.gold}"/></g>`;
    return frame(220, `
      <rect width="${W}" height="220" fill="url(#warm)"/>
      <defs><radialGradient id="warm" cx="50%" cy="40%" r="70%">
        <stop offset="0%" stop-color="#F6E7C8"/><stop offset="100%" stop-color="${PALETTE.surface}"/></radialGradient></defs>
      <ellipse cx="${W/2}" cy="125" rx="210" ry="70" fill="#B5793C" fill-opacity="0.35"/>
      <ellipse cx="${W/2}" cy="120" rx="190" ry="62" fill="none" stroke="${PALETTE.goldDeep}" stroke-width="2" stroke-opacity="0.6"/>
      ${gem(W/2, 112, 34, c, { clarity: 1, luster: 1, backlit: true })}
      ${diya(190, 120)}${diya(410, 120)}
      ${flower(250, 150)}${flower(350, 150)}
      <ellipse cx="${W/2}" cy="158" rx="26" ry="9" fill="#FBF5EA"/>
      <text x="${W/2}" y="200" font-family="Mulish" font-size="11" fill="${PALETTE.goldDeep}" text-anchor="middle">Copper thali · diyas · flowers · raw milk — energising aligns the stone to its planet</text>
    `);
  },
};

/* alt text per illustration (PRD §10.7 — images carry meaning) */
const ALT = {
  stone_select: 'The four gemstones — Yellow Sapphire, Blue Sapphire, Ruby and Emerald — shown loose for identification.',
  origin: 'Side-by-side comparison of a premium-origin stone (vivid, clean) versus a secondary-origin stone (paler, more included).',
  treatment: 'Magnified comparison of an untreated stone with natural silk inclusions versus a heat-treated stone with healed fractures.',
  light: 'A four-panel backlit reference showing the same stone fully transparent, mostly transparent, cloudy, and opaque, with an instruction to hold the stone to a light source.',
  luster: 'A four-panel surface reference showing bright, moderate, dull and scratched luster.',
  carat: 'Four stones of increasing size shown to scale against a ruler at roughly 1.5, 3, 5 and 7 carats.',
  certification: 'A gemstone lab origin report with the origin, treatment and weight fields highlighted.',
  hand: 'A hand wearing the four stones on their correct fingers, with the selected stone’s finger highlighted, plus gold, silver and panchdhatu metal swatches.',
  energising: 'An aspirational energising setup — a copper thali with the stone, lit diyas, fresh flowers and raw milk.',
};

const CAPTION = {
  stone_select: 'Tap the stone you currently wear',
  origin: 'Premium vs secondary origin of your stone',
  treatment: 'Natural inclusions vs treatment, under magnification',
  light: 'Calibrate against these four — the most important check',
  luster: 'Match your stone’s surface to one of these',
  carat: 'Carat sizes shown to scale',
  certification: 'A real lab report verifies origin, treatment & weight',
  hand: 'Correct finger & metal for each stone',
  energising: 'A proper energising ritual',
};

export function illustration(key, stoneId) {
  const fn = ILLUS[key];
  return fn ? fn(stoneId) : '';
}
export const altFor = (key) => ALT[key] || '';
export const captionFor = (key) => CAPTION[key] || '';

/* =========================================================================
   PER-OPTION VISUALS — each answer is its own large image-button.
   The composite reference panels above are decomposed here so that the
   option a customer taps *shows* the state it describes (PRD §3 show-don't-tell,
   §5.4 calibration). Returns a full <svg> sized to a 4:3 card.
   ========================================================================= */
const OVW = 200, OVH = 150, OCX = 100, OCY = 64;
const ov = (inner, bg = '#FBF8F1') =>
  `<svg viewBox="0 0 ${OVW} ${OVH}" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"><rect width="${OVW}" height="${OVH}" fill="${bg}"/>${inner}</svg>`;
const cap = (t, color = PALETTE.sage) =>
  `<text x="${OCX}" y="134" font-family="Mulish,sans-serif" font-size="12" font-weight="600" letter-spacing=".3" fill="${color}" text-anchor="middle">${t}</text>`;
const qmark = (color = PALETTE.olive) =>
  `<text x="${OCX}" y="86" font-family="Cormorant Garamond,serif" font-size="64" font-weight="600" fill="${color}" text-anchor="middle">?</text>`;

/* hex mixing for desaturated / tinted gems */
function _h(c) { return [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)]; }
function mix(a, b, t) { const A = _h(a), B = _h(b); return '#' + A.map((v, i) => Math.round(v + (B[i] - v) * t).toString(16).padStart(2, '0')).join(''); }

const stoneColor = (id) => (STONES[id] || STONES.yellow_sapphire).gem.color;
const sparkle = (x, y, r = 3) => `<g fill="#FFFFFF" fill-opacity=".9"><path d="M${x} ${y-r} L${x+r*0.5} ${y} L${x} ${y+r} L${x-r*0.5} ${y} Z"/><path d="M${x-r} ${y} L${x} ${y-r*0.5} L${x+r} ${y} L${x} ${y+r*0.5} Z"/></g>`;

/* ---- per-option visual generators, keyed by step image key ---------- */
const OPT_VIS = {
  /* Step 1 — each card is the stone itself */
  stone_select(optId) {
    const c = stoneColor(optId);
    return ov(`<radialGradient id="sg_${optId}" cx="50%" cy="45%" r="60%"><stop offset="0%" stop-color="${c}" stop-opacity=".22"/><stop offset="100%" stop-color="${c}" stop-opacity="0"/></radialGradient>
      <rect width="${OVW}" height="${OVH}" fill="url(#sg_${optId})"/>
      ${gem(OCX, OCY + 6, 46, c, { clarity: 1, luster: 0.92 })}`, '#FFFDF8');
  },

  /* Step 2 — origin quality */
  origin(optId, stoneId) {
    const c = stoneColor(stoneId);
    if (optId === 'premium') return ov(`${gem(OCX, OCY, 48, c, { clarity: 1, luster: 0.97 })}${sparkle(150, 36, 4)}${sparkle(54, 44, 3)}${sparkle(140, 92, 2.5)}`, '#FFFDF8');
    if (optId === 'secondary') return ov(gem(OCX, OCY, 46, mix(c, '#A39F86', 0.4), { clarity: 0.6, luster: 0.55, inclusions: true }), '#F7F3EA');
    if (optId === 'dontknow') return ov(`${gem(OCX, OCY - 4, 44, mix(c, '#CFC9B9', 0.72), { clarity: 0.7, luster: 0.4 })}${qmark('#FFFDF8')}`, '#EFE9DB');
    /* synthetic / glass — too-uniform with gas bubbles */
    return ov(`${gem(OCX, OCY, 46, mix(c, '#DCE2E6', 0.4), { clarity: 1, luster: 1 })}
      <circle cx="${OCX - 12}" cy="${OCY + 4}" r="5" fill="#fff" fill-opacity=".55" stroke="#fff" stroke-opacity=".8"/>
      <circle cx="${OCX + 14}" cy="${OCY - 8}" r="3.5" fill="#fff" fill-opacity=".5" stroke="#fff" stroke-opacity=".7"/>`, '#F1F2F0');
  },

  /* Step 3 — treatment */
  treatment(optId, stoneId) {
    const c = stoneColor(stoneId);
    const loupe = `<circle cx="${OCX}" cy="${OCY}" r="60" fill="none" stroke="${PALETTE.sand}" stroke-width="3" stroke-opacity=".7"/>`;
    if (optId === 'untreated') return ov(`${loupe}${gem(OCX, OCY, 44, c, { clarity: 0.95, luster: 0.85, inclusions: true })}`, '#FFFDF8');
    if (optId === 'heated') return ov(`${gem(OCX, OCY, 46, c, { clarity: 0.85, luster: 0.6, fractures: true })}
      <ellipse cx="${OCX}" cy="${OCY}" rx="58" ry="46" fill="#E0852E" fill-opacity=".16"/>`, '#F6EEE2');
    if (optId === 'dontknow') return ov(`${gem(OCX, OCY - 4, 44, mix(c, '#CFC9B9', 0.7), { clarity: 0.7, luster: 0.4 })}${qmark('#FFFDF8')}`, '#EFE9DB');
    return ov(gem(OCX, OCY, 46, mix(c, '#FFFFFF', 0.18), { clarity: 0.78, luster: 0.5, fractures: true }), '#F4EFE6'); // fracture-filled
  },

  /* Step 4 — light transmission (KEY) — backlit on dark to read transmission */
  light(optId, stoneId) {
    const c = stoneColor(stoneId);
    const clar = { clear: 1, mostly: 0.68, cloudy: 0.32, opaque: 0 }[optId] ?? 0;
    const beam = clar > 0.08
      ? `<defs><linearGradient id="bm_${optId}" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="${PALETTE.gold}" stop-opacity="${0.5 * clar}"/><stop offset="100%" stop-color="${PALETTE.gold}" stop-opacity="0"/></linearGradient></defs>
         <polygon points="${OCX - 38},6 ${OCX + 38},6 ${OCX + 60},${OCY + 30} ${OCX - 60},${OCY + 30}" fill="url(#bm_${optId})"/>`
      : '';
    const bulb = `<circle cx="${OCX}" cy="10" r="6" fill="${PALETTE.gold}" fill-opacity="${0.4 + 0.5 * clar}"/>`;
    return ov(`${beam}${bulb}${gem(OCX, OCY + 8, 42, c, { clarity: clar, luster: 0.55, backlit: clar > 0.1 })}`, '#23271B');
  },

  /* Step 5 — luster (surface reflection) */
  luster(optId, stoneId) {
    const c = stoneColor(stoneId);
    const lus = { bright: 1, moderate: 0.5, dull: 0.08, scratched: 0.32 }[optId] ?? 0;
    const reflection = lus > 0.6 ? `<ellipse cx="${OCX - 16}" cy="${OCY - 18}" rx="20" ry="9" fill="#fff" fill-opacity=".75" transform="rotate(-28 ${OCX} ${OCY})"/>` : '';
    return ov(`<linearGradient id="lz_${optId}" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#F3EDE0"/><stop offset="100%" stop-color="#DED3C0"/></linearGradient>
      <rect width="${OVW}" height="${OVH}" fill="url(#lz_${optId})"/>
      ${gem(OCX, OCY, 46, c, { clarity: 0.85, luster: lus, scratched: optId === 'scratched' })}${reflection}`, '#E7DCC9');
  },

  /* Step 6 — carat: gem sized within a fixed reference outline */
  carat(optId, stoneId) {
    const c = stoneColor(stoneId);
    const r = { under2: 20, '2to4': 30, '4to6': 41, '6plus': 52 }[optId] ?? 30;
    const ct = { under2: '1.5 ct', '2to4': '3 ct', '4to6': '5 ct', '6plus': '7 ct' }[optId] ?? '';
    return ov(`<circle cx="${OCX}" cy="${OCY}" r="52" fill="none" stroke="${PALETTE.sand}" stroke-width="1.2" stroke-dasharray="3 4" stroke-opacity=".7"/>
      ${gem(OCX, OCY, r, c, { clarity: 1, luster: 0.9 })}${cap(ct, PALETTE.goldDeep)}`, '#FFFDF8');
  },

  /* Step 7 — certification documents */
  certification(optId) {
    const doc = (headFill, seal, lab) => `
      <rect x="46" y="20" width="108" height="100" rx="7" fill="#FFFDF8" stroke="${PALETTE.sand}"/>
      <rect x="46" y="20" width="108" height="22" rx="7" fill="${headFill}"/>
      <text x="100" y="35" font-family="Marcellus,serif" font-size="9" fill="#F4EEE4" letter-spacing="1" text-anchor="middle">${lab}</text>
      <line x1="58" y1="56" x2="120" y2="56" stroke="${PALETTE.sage}" stroke-width="2" stroke-opacity=".5"/>
      <line x1="58" y1="66" x2="132" y2="66" stroke="${PALETTE.sage}" stroke-width="2" stroke-opacity=".35"/>
      <line x1="58" y1="76" x2="112" y2="76" stroke="${PALETTE.sage}" stroke-width="2" stroke-opacity=".35"/>
      ${seal}`;
    if (optId === 'intl') return ov(doc(PALETTE.olive,
      `<circle cx="132" cy="96" r="15" fill="${PALETTE.gold}"/><circle cx="132" cy="96" r="15" fill="none" stroke="${PALETTE.goldDeep}" stroke-width="1.5"/><path d="M126 96 l4 4 l8 -9" stroke="#5a4716" stroke-width="2" fill="none" stroke-linecap="round"/>`,
      'GIA · GRS'), '#F1ECE0');
    if (optId === 'indian') return ov(doc('#5B6B86',
      `<circle cx="132" cy="96" r="13" fill="none" stroke="#5B6B86" stroke-width="2"/><text x="132" y="100" font-family="Mulish" font-size="8" font-weight="700" fill="#5B6B86" text-anchor="middle">IGI</text>`,
      'IGI · GII'), '#EEEDE8');
    /* none — a plain receipt with a struck-through seal */
    return ov(`<rect x="56" y="26" width="88" height="92" rx="4" fill="#FFFDF8" stroke="${PALETTE.sand}" stroke-dasharray="4 3"/>
      <line x1="68" y1="46" x2="128" y2="46" stroke="${PALETTE.sage}" stroke-width="2" stroke-opacity=".4"/>
      <line x1="68" y1="58" x2="120" y2="58" stroke="${PALETTE.sage}" stroke-width="2" stroke-opacity=".3"/>
      <line x1="68" y1="70" x2="124" y2="70" stroke="${PALETTE.sage}" stroke-width="2" stroke-opacity=".3"/>
      <circle cx="100" cy="92" r="15" fill="none" stroke="#B23A48" stroke-width="2" stroke-opacity=".7"/>
      <line x1="89" y1="103" x2="111" y2="81" stroke="#B23A48" stroke-width="2" stroke-opacity=".7"/>`, '#F0ECE3');
  },

  /* Step 9 — energising */
  energising(optId, stoneId) {
    const c = stoneColor(stoneId);
    const diya = (x, y) => `<ellipse cx="${x}" cy="${y}" rx="13" ry="5" fill="${PALETTE.goldDeep}"/><path d="M${x} ${y-15} C ${x-4} ${y-7}, ${x+4} ${y-7}, ${x} ${y-15} Z" fill="${PALETTE.gold}"/><circle cx="${x}" cy="${y-8}" r="2.5" fill="#FFE9A8"/>`;
    const flower = (x, y) => `<g>${[0,72,144,216,288].map(a=>{const rad=a*Math.PI/180;return `<ellipse cx="${(x+6*Math.cos(rad)).toFixed(1)}" cy="${(y+6*Math.sin(rad)).toFixed(1)}" rx="4.5" ry="2.6" fill="#E8B7C2" transform="rotate(${a} ${x} ${y})"/>`}).join('')}<circle cx="${x}" cy="${y}" r="3" fill="${PALETTE.gold}"/></g>`;
    if (optId === 'proper') return ov(`<radialGradient id="wr" cx="50%" cy="42%" r="65%"><stop offset="0%" stop-color="#F6E7C8"/><stop offset="100%" stop-color="#E7DDCF"/></radialGradient>
      <rect width="${OVW}" height="${OVH}" fill="url(#wr)"/>
      <ellipse cx="${OCX}" cy="${OCY+22}" rx="76" ry="26" fill="#B5793C" fill-opacity=".3"/>
      <ellipse cx="${OCX}" cy="${OCY+18}" rx="68" ry="22" fill="none" stroke="${PALETTE.goldDeep}" stroke-width="1.5" stroke-opacity=".6"/>
      ${gem(OCX, OCY, 28, c, { clarity: 1, luster: 1, backlit: true })}
      ${diya(56, OCY + 16)}${diya(144, OCY + 16)}${flower(78, OCY + 30)}${flower(122, OCY + 30)}`, '#F0E6D2');
    if (optId === 'basic') return ov(`${gem(OCX, OCY - 6, 30, c, { clarity: 1, luster: 0.9 })}
      <path d="M58 ${OCY+18} a42 16 0 0 0 84 0 Z" fill="#EAF0F2" stroke="${PALETTE.sage}" stroke-opacity=".4"/>
      <ellipse cx="${OCX}" cy="${OCY+18}" rx="42" ry="6" fill="#DCE7EA"/>`, '#F4F6F4');
    if (optId === 'no') return ov(`${gem(OCX, OCY, 34, c, { clarity: 1, luster: 0.85 })}<line x1="46" y1="${OCY+44}" x2="154" y2="${OCY+44}" stroke="${PALETTE.sand}" stroke-width="2" stroke-opacity=".6"/>`, '#F4EFE6');
    /* dontknow — gifted / inherited */
    return ov(`${gem(OCX, OCY - 4, 30, mix(c, '#CFC9B9', 0.55), { clarity: 0.85, luster: 0.6 })}${qmark('#FFFDF8')}`, '#EFE9DB');
  },
};

/* ---- Step 8 metal swatches & finger visuals ------------------------- */
function metalVis(optId, stoneId) {
  const c = stoneColor(stoneId);
  const metalC = { gold: '#D9B84F', silver: '#CBD0D6', other: '#9AA0A6' }[optId];
  const gemTop = gem(OCX, OCY - 18, 12, c, { clarity: 1, luster: 0.95 });
  if (optId === 'dontknow') {
    return ov(`<circle cx="${OCX}" cy="${OCY + 14}" r="30" fill="none" stroke="${PALETTE.sand}" stroke-width="11"/>${qmark('#FFFDF8')}`, '#EFE9DB');
  }
  let band;
  if (optId === 'panchdhatu') {
    band = `<defs><linearGradient id="pd" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stop-color="#D9B84F"/><stop offset="40%" stop-color="#CBD0D6"/><stop offset="70%" stop-color="#B98E5E"/><stop offset="100%" stop-color="#D9B84F"/></linearGradient></defs>
      <circle cx="${OCX}" cy="${OCY + 14}" r="30" fill="none" stroke="url(#pd)" stroke-width="12"/>`;
  } else {
    band = `<circle cx="${OCX}" cy="${OCY + 14}" r="30" fill="none" stroke="${metalC}" stroke-width="12"/>
      <circle cx="${OCX}" cy="${OCY + 14}" r="25" fill="none" stroke="#fff" stroke-opacity=".35" stroke-width="2"/>`;
  }
  return ov(`${band}${gemTop}`, '#F3ECDD');
}

function fingerVis(optId) {
  const idx = { index: 0, middle: 1, ring: 2, little: 3 }[optId];
  const fx = [74, 95, 116, 135];
  const tops = [44, 32, 42, 60];
  let g = `<rect x="62" y="98" width="86" height="34" rx="14" fill="${PALETTE.sand}" fill-opacity=".55"/>`;
  for (let i = 0; i < 4; i++) {
    const w = 16, sel = i === idx;
    g += `<rect x="${fx[i] - w / 2}" y="${tops[i]}" width="${w}" height="${112 - tops[i]}" rx="8" fill="${PALETTE.sand}" fill-opacity=".55"/>`;
    if (sel) {
      const ry = tops[i] + 30;
      g += `<rect x="${fx[i] - w / 2 - 2}" y="${ry - 5}" width="${w + 4}" height="11" rx="4" fill="${PALETTE.gold}"/>`;
      g += `<circle cx="${fx[i]}" cy="${ry}" r="4.5" fill="${PALETTE.goldDeep}"/>`;
      g += `<circle cx="${fx[i]}" cy="${ry}" r="13" fill="none" stroke="${PALETTE.goldDeep}" stroke-width="1.5" stroke-dasharray="3 3"/>`;
    }
  }
  if (optId === 'dontknow') g = `<rect x="62" y="98" width="86" height="34" rx="14" fill="${PALETTE.sand}" fill-opacity=".4"/>` +
    [0,1,2,3].map(i=>`<rect x="${fx[i]-8}" y="${tops[i]}" width="16" height="${112-tops[i]}" rx="8" fill="${PALETTE.sand}" fill-opacity=".4"/>`).join('') + qmark('#fff');
  return ov(g, '#F6EFE1');
}

export function optionVisual(imageKey, optionId, stoneId, factor) {
  if (factor === 'metal') return metalVis(optionId, stoneId);
  if (factor === 'finger') return fingerVis(optionId);
  const fn = OPT_VIS[imageKey];
  return fn ? fn(optionId, stoneId) : ov(gem(OCX, OCY, 40, stoneColor(stoneId), { clarity: 1, luster: 0.9 }));
}
