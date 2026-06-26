/* =========================================================================
   AstroLaabh — Gemstone Efficacy Meter — SCORING ENGINE (pure)
   PRD §8 + §10.3 + §10.4.  No DOM, no side effects — fully unit-testable.
   ========================================================================= */

import { SCORING, STONES, VERDICTS, FACTOR_NAMES, metalLabel, fingerLabel } from './config.js';

export const METAL_MAX = 8;   // PRD §8.1
export const FINGER_MAX = 5;

/* factor → pillar (PRD §8.1) */
export const FACTOR_PILLAR = {
  origin: 'quality', treatment: 'quality', carat: 'quality', certification: 'quality',
  light_transmission: 'light', luster: 'light',
  metal: 'compliance', finger: 'compliance', energising: 'compliance',
};
export const FACTOR_MAX = {
  origin: 25, treatment: 20, carat: 15, certification: 5,
  light_transmission: 20, luster: 15,
  metal: 8, finger: 5, energising: 7,
};

/* -------- Step 8 dynamic point logic (PRD §10.4) --------------------- */
export function metalPoints(stoneId, optionId) {
  const stone = STONES[stoneId];
  if (!stone || !optionId) return 0;
  if (stone.correctMetals.includes(optionId)) return METAL_MAX;
  if (optionId === 'dontknow') return SCORING.METAL_DONTKNOW_POINTS; // §13.3 partial
  return 0;
}
export function fingerPoints(stoneId, optionId) {
  const stone = STONES[stoneId];
  if (!stone || !optionId) return 0;
  return optionId === stone.correctFinger ? FINGER_MAX : 0;
}

/* -------- Verdict band (PRD §8.4), boundaries inclusive -------------- */
export function verdictFor(percent) {
  return VERDICTS.find((v) => percent >= v.min && percent <= v.max) || VERDICTS[VERDICTS.length - 1];
}

/* -------- normalized per-factor points from raw answer state --------- */
function pointsForFactor(factorKey, stoneId, answers) {
  if (factorKey === 'metal')  return metalPoints(stoneId, answers.metal?.optionId);
  if (factorKey === 'finger') return fingerPoints(stoneId, answers.finger?.optionId);
  return answers[factorKey]?.points ?? 0;
}

/* =========================================================================
   score(stoneId, answers) — the headline function (PRD §10.3)
   ========================================================================= */
export function score(stoneId, answers) {
  const pillarRaw = { quality: 0, light: 0, compliance: 0 };

  for (const factorKey of Object.keys(FACTOR_PILLAR)) {
    pillarRaw[FACTOR_PILLAR[factorKey]] += pointsForFactor(factorKey, stoneId, answers);
  }

  const rawTotal = pillarRaw.quality + pillarRaw.light + pillarRaw.compliance;
  let efficacyPercent = Math.round((rawTotal / SCORING.TOTAL_MAX) * 100);

  // §13.8(b) optional hard gate (off by default — see config.SCORING.HARD_GATE)
  let capped = false;
  if (SCORING.HARD_GATE) {
    const opaque = answers.light_transmission?.optionId === 'opaque';
    const fractured = answers.treatment?.optionId === 'fracture';
    if ((opaque || fractured) && efficacyPercent > SCORING.HARD_GATE_CAP) {
      efficacyPercent = SCORING.HARD_GATE_CAP;
      capped = true;
    }
  }

  const pillarPercent = {
    quality:    Math.round((pillarRaw.quality    / SCORING.PILLAR_MAX.quality)    * 100),
    light:      Math.round((pillarRaw.light      / SCORING.PILLAR_MAX.light)      * 100),
    compliance: Math.round((pillarRaw.compliance / SCORING.PILLAR_MAX.compliance) * 100),
  };

  return { efficacyPercent, pillarPercent, pillarRaw, rawTotal, capped, verdict: verdictFor(efficacyPercent) };
}

/* =========================================================================
   buildGaps — per-factor plain-language lines (PRD §9.3), biggest gap first.
   ========================================================================= */
export function buildGaps(stoneId, answers, questions) {
  const stone = STONES[stoneId];
  const gaps = [];

  // static factors carry their `gap` string on the chosen option
  for (const q of questions) {
    if (!q.factorKey || q.dynamic) continue;
    const chosen = answers[q.factorKey];
    if (!chosen) continue;
    const opt = q.options.find((o) => o.id === chosen.optionId);
    if (opt && opt.gap) {
      gaps.push({
        factorKey: q.factorKey,
        factorName: FACTOR_NAMES[q.factorKey],
        text: opt.gap,
        lost: q.maxPoints - chosen.points,
      });
    }
  }

  // dynamic: metal
  if (stone && answers.metal) {
    const mPts = metalPoints(stoneId, answers.metal.optionId);
    if (mPts < METAL_MAX) {
      const correct = stone.correctMetals.map(metalLabel).join(' or ');
      const text = answers.metal.optionId === 'dontknow'
        ? `You’re not sure which metal the stone is set in - ${stone.planet}’s stone needs ${correct} to keep the energetic circuit intact.`
        : `Your stone is set in the wrong metal - ${stone.planet}’s stone should be set in ${correct}, and the wrong metal breaks the energetic circuit.`;
      gaps.push({ factorKey: 'metal', factorName: FACTOR_NAMES.metal, text, lost: METAL_MAX - mPts });
    }
  }
  // dynamic: finger
  if (stone && answers.finger) {
    const fPts = fingerPoints(stoneId, answers.finger.optionId);
    if (fPts < FINGER_MAX) {
      const correct = fingerLabel(stone.correctFinger);
      const text = answers.finger.optionId === 'dontknow'
        ? `You’re not sure which finger it’s worn on - ${stone.planet}’s stone belongs on the ${correct}.`
        : `Your stone is worn on the wrong finger - ${stone.planet}’s stone belongs on the ${correct}. The wrong finger misdirects the energy rather than nullifying it.`;
      gaps.push({ factorKey: 'finger', factorName: FACTOR_NAMES.finger, text, lost: FINGER_MAX - fPts });
    }
  }

  return gaps.sort((a, b) => b.lost - a.lost);
}

/* =========================================================================
   CTA selection — weakest pillar drives the emphasis (PRD §9.4).
   ========================================================================= */
export function recommendCta(result, answers) {
  const p = result.pillarPercent;
  // weakest pillar by percentage
  const weakest = ['quality', 'light', 'compliance'].reduce((a, b) => (p[b] < p[a] ? b : a));

  if (weakest === 'compliance') {
    return {
      key: 'energising',
      eyebrow: 'Recommended next step',
      title: 'Energise & align your stone',
      body: 'Your stone’s quality is fine — it’s how it’s being worn that’s holding it back. A proper energising ritual and correct setting can switch on benefits you’re currently missing.',
      cta: 'Book an energising ritual',
    };
  }
  if (weakest === 'light') {
    return {
      key: 'consultation',
      eyebrow: 'Recommended next step',
      title: 'Talk to an AstroLaabh expert',
      body: 'Transparency and luster can’t be improved after the fact — they’re fixed when the stone is chosen. An expert can help you select a clearer, more radiant stone that actually transmits planetary light.',
      cta: 'Book a consultation',
    };
  }
  // quality weakest
  const certMissing = (answers.certification?.optionId === 'none');
  if (certMissing) {
    return {
      key: 'certification',
      eyebrow: 'Recommended next step',
      title: 'Get your stone certified',
      body: 'The biggest gap is verifiability — without a lab certificate, the origin, treatment and weight of your stone are all unconfirmed. Certification tells you exactly what you own.',
      cta: 'Get a lab certificate',
    };
  }
  return {
    key: 'upgrade',
    eyebrow: 'Recommended next step',
    title: 'Find a stone that truly works',
    body: 'The core quality factors — origin, treatment or carat — are limiting this stone. An AstroLaabh consultation can guide you to a properly-sourced, untreated stone for your planet.',
    cta: 'Book a consultation',
  };
}
