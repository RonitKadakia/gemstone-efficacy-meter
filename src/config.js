/* =========================================================================
   AstroLaabh - Gemstone Efficacy Meter - CONTENT & SCORING CONFIG
   PRD §7 (steps), §8 (scoring), §10.2 (data model), §10.5 (config-driven).
   Every question, option, point value, hint, gap line and verdict lives here
   so astrology/product can tune wording & weights WITHOUT touching components.
   ========================================================================= */

/* ---- Sign-off decisions (PRD §13) baked in here, all togglable -------- */
export const SCORING = {
  PILLAR_MAX: { quality: 65, light: 35, compliance: 22 }, // §8.1 — compliance raised to 22 (platinum bonus +2 on metal)
  TOTAL_MAX: 122,                                          // §8.2 — raised from 120 (platinum can score 10 vs gold's 8)
  // §13.1 - percentage of 120 (recommended; preserves brief weights).
  // §13.8 - worst-case cap. Default (a): accept weights as-is.
  //   Set HARD_GATE=true for decision (b): cap opaque / fracture-filled at 29%.
  HARD_GATE: false,
  HARD_GATE_CAP: 29,
  // §13.3 - "Don't know" partial credit
  METAL_DONTKNOW_POINTS: 3,
};

/* ---- Stone metadata (PRD §10.2 StoneMeta) - drives Step 8 + result copy */
export const STONES = {
  yellow_sapphire: {
    id: 'yellow_sapphire', displayName: 'Yellow Sapphire', vedicName: 'Pukhraj',
    planet: 'Jupiter', correctMetals: ['gold'], correctFinger: 'index',
    gem: { color: '#E6C24A', name: 'golden' },
  },
  blue_sapphire: {
    id: 'blue_sapphire', displayName: 'Blue Sapphire', vedicName: 'Neelam',
    planet: 'Saturn', correctMetals: ['silver', 'panchdhatu'], correctFinger: 'middle',
    gem: { color: '#3C4C86', name: 'deep blue' },
  },
  ruby: {
    id: 'ruby', displayName: 'Ruby', vedicName: 'Manik',
    planet: 'Sun', correctMetals: ['gold'], correctFinger: 'ring',
    gem: { color: '#9E2B38', name: 'red' },
  },
  emerald: {
    id: 'emerald', displayName: 'Emerald', vedicName: 'Panna',
    planet: 'Mercury', correctMetals: ['gold', 'silver'], correctFinger: 'little',
    gem: { color: '#2E6B4F', name: 'green' },
  },
};

const FINGER_LABEL = { index: 'index finger', middle: 'middle finger', ring: 'ring finger', little: 'little finger' };
export const metalLabel = (m) => ({ gold: 'gold', silver: 'silver', panchdhatu: 'panchdhatu (five-metal alloy)' }[m] || m);
export const fingerLabel = (f) => FINGER_LABEL[f] || f;

/* ---- Verdict bands (PRD §8.4) - boundaries 30 / 55 / 80 inclusive ----- */
export const VERDICTS = [
  { min: 80, max: 100, label: 'Highly effective',
    message: 'Your stone meets most of the key Vedic criteria. It is likely working as intended.' },
  { min: 55, max: 79, label: 'Partially effective',
    message: 'Your stone has some strong factors, but specific gaps are reducing its astrological impact.' },
  { min: 30, max: 54, label: 'Weakly effective',
    message: 'Several critical factors are missing. This stone is unlikely to be delivering meaningful planetary benefit.' },
  { min: 0, max: 29, label: 'Not effective',
    message: 'This stone does not meet the core criteria for Vedic gemstone efficacy. Wearing it is unlikely to have any astrological effect.' },
];

/* ---- Pretty factor names for the result-screen gap list -------------- */
export const FACTOR_NAMES = {
  origin: 'Origin', treatment: 'Treatment', carat: 'Carat weight', certification: 'Certification',
  light_transmission: 'Light transmission', luster: 'Luster',
  metal: 'Metal setting', finger: 'Where worn', energising: 'Energising ritual',
};

/* =========================================================================
   THE 9 STEPS  (PRD §7).  `image` = illustration key (see illustrations.js).
   Each non-max option carries a `gap` line surfaced on the result screen
   when chosen (PRD §9.3 - clarity, never shame).
   ========================================================================= */
export const QUESTIONS = [
  /* -------- Step 1 - Stone selection (anchor, 0 pts) ------------------- */
  {
    step: 1, factorKey: null, pillar: null, maxPoints: 0, image: 'stone_select',
    title: 'Which stone are you wearing?',
    hint: 'This sets everything that follows - the ruling planet, and the correct metal and finger for your stone.',
    options: [
      { id: 'yellow_sapphire', label: 'Yellow Sapphire', subLabel: 'Pukhraj · Jupiter', points: 0 },
      { id: 'blue_sapphire',   label: 'Blue Sapphire',   subLabel: 'Neelam · Saturn',   points: 0 },
      { id: 'ruby',            label: 'Ruby',            subLabel: 'Manik · Sun',       points: 0 },
      { id: 'emerald',         label: 'Emerald',         subLabel: 'Panna · Mercury',   points: 0 },
    ],
  },

  /* -------- Step 2 - Origin (25 pts, highest weight) ------------------- */
  {
    step: 2, factorKey: 'origin', pillar: 'quality', maxPoints: 25, image: 'origin',
    title: 'Do you know the origin of your stone?',
    hint: 'Origin determines the stone’s natural planetary resonance. A Kashmir sapphire and an African sapphire are chemically similar but astrologically very different.',
    options: [
      { id: 'premium',   label: 'Yes - premium origin',    subLabel: 'Ceylon / Burma / Kashmir / Colombia', points: 25 },
      { id: 'secondary', label: 'Yes - secondary origin',  subLabel: 'African, Brazilian, or other',         points: 13,
        gap: 'Your stone is from a secondary origin - astrologically weaker than premium Ceylon, Burma, Kashmir or Colombian sources, even when chemically similar.' },
      { id: 'dontknow',  label: 'Don’t know',              subLabel: 'Bought from a local jeweller',         points: 5,
        gap: 'The origin is unknown - without a verified premium source, the stone’s natural planetary resonance can’t be confirmed.' },
      { id: 'synthetic', label: 'May be synthetic / glass', subLabel: 'No certificate',                       points: 0,
        gap: 'The stone may be synthetic or glass - a lab-grown or imitation stone carries no natural planetary resonance at all.' },
    ],
  },

  /* -------- Step 3 - Treatment (20 pts) ------------------------------- */
  {
    step: 3, factorKey: 'treatment', pillar: 'quality', maxPoints: 20, image: 'treatment',
    title: 'Has the stone been treated?',
    hint: 'Heat treatment irreversibly alters the crystal structure. In Jyotish, this is considered energetically equivalent to destroying the stone’s ability to conduct planetary light.',
    options: [
      { id: 'untreated', label: 'Unheated / untreated',          subLabel: 'Confirmed by lab certificate',  points: 20 },
      { id: 'heated',    label: 'Heated or treated',             subLabel: 'Standard commercial treatment', points: 6,
        gap: 'The stone is heat-treated - heat irreversibly alters the crystal lattice, which Jyotish treats as severely reducing its ability to conduct planetary light.' },
      { id: 'dontknow',  label: 'Don’t know',                    subLabel: 'No certificate available',      points: 4,
        gap: 'Treatment status is unknown - without a certificate, heat or other enhancement can’t be ruled out.' },
      { id: 'fracture',  label: 'Fracture-filled / heavily oiled', subLabel: 'Visible clarity enhancement', points: 0,
        gap: 'The stone is fracture-filled or heavily oiled - clarity enhancement that Jyotish considers equivalent to destroying the stone’s energetic conductivity.' },
    ],
  },

  /* -------- Step 4 - Light transmission (20 pts) - MOST VISUAL --------- */
  {
    step: 4, factorKey: 'light_transmission', pillar: 'light', maxPoints: 20, image: 'light',
    title: 'How does light behave in your stone?',
    hint: 'Hold your stone up to a light source. A Jyotish-grade stone must be able to receive, travel through, and transmit planetary light. Opacity = blockage. Cloudiness = obstruction.',
    options: [
      { id: 'clear',  label: 'Fully transparent',  subLabel: 'Light passes clean through - no cloudiness', points: 20 },
      { id: 'mostly', label: 'Mostly transparent', subLabel: 'Minor inclusions but light flows well',      points: 14,
        gap: 'Minor inclusions are present - light still flows, but the channel for planetary energy isn’t perfectly clear.' },
      { id: 'cloudy', label: 'Cloudy or milky',    subLabel: 'Light diffuses - hard to see through',       points: 6,
        gap: 'Your stone is cloudy or milky - light diffuses instead of passing cleanly, obstructing the flow of planetary energy.' },
      { id: 'opaque', label: 'Opaque',             subLabel: 'No light passes through at all',             points: 0,
        gap: 'Your stone is opaque - light can’t pass through at all, which Jyotish treats as a complete blockage of planetary energy.' },
    ],
  },

  /* -------- Step 5 - Luster (15 pts) ---------------------------------- */
  {
    step: 5, factorKey: 'luster', pillar: 'light', maxPoints: 15, image: 'luster',
    title: 'How is the luster of your stone?',
    hint: 'Luster is the stone’s surface ability to reflect light. A stone without luster cannot radiate the planet’s energy outward. Vedic texts describe a dull stone as energetically inert.',
    options: [
      { id: 'bright',    label: 'Bright and vivid',            subLabel: 'Strong reflective surface, catches light easily', points: 15 },
      { id: 'moderate',  label: 'Moderate sheen',              subLabel: 'Some shine but not brilliant',                    points: 9,
        gap: 'Luster is only moderate - the stone shines but doesn’t radiate energy outward as strongly as a vivid surface.' },
      { id: 'dull',      label: 'Dull or waxy',                subLabel: 'Flat surface, very little reflection',            points: 3,
        gap: 'The surface is dull or waxy - Vedic texts describe a lustreless stone as mruta (energetically inert).' },
      { id: 'scratched', label: 'Scratched or damaged surface', subLabel: 'Polish broken - light scatters unevenly',       points: 0,
        gap: 'The polish is broken - scratches scatter light unevenly, so the stone can’t radiate energy cleanly.' },
    ],
  },

  /* -------- Step 6 - Carat weight (15 pts) ---------------------------- */
  {
    step: 6, factorKey: 'carat', pillar: 'quality', maxPoints: 15, image: 'carat',
    title: 'What is the carat weight of your stone?',
    hint: 'Mass determines the volume of planetary energy the stone can hold. Below a minimum threshold there isn’t enough to register a measurable influence.',
    options: [
      { id: 'under2', label: 'Under 2 carats', subLabel: 'Below minimum threshold', points: 0,
        gap: 'Under 2 carats - below the minimum mass needed to hold a measurable volume of planetary energy.' },
      { id: '2to4',   label: '2–4 carats',     subLabel: 'Acceptable range',        points: 8,
        gap: '2–4 carats is acceptable, but greater mass would hold and channel more planetary energy.' },
      { id: '4to6',   label: '4–6 carats',     subLabel: 'Strong efficacy range',   points: 12,
        gap: '4–6 carats is a strong range - just short of the optimal mass for this stone.' },
      { id: '6plus',  label: '6+ carats',      subLabel: 'Optimal',                 points: 15 },
      { id: 'dontknow', label: 'Don’t know',   subLabel: 'Not sure of the weight',  points: 3,
        gap: 'The carat weight is unknown - without it there’s no way to confirm the stone has the mass needed to hold planetary energy.' },
    ],
  },

  /* -------- Step 7 - Certification (5 pts) ---------------------------- */
  {
    step: 7, factorKey: 'certification', pillar: 'quality', maxPoints: 5, image: 'certification',
    title: 'Does the stone have a lab certificate?',
    hint: 'A certificate doesn’t make a stone more powerful - it verifies that every other claim (origin, treatment, weight) is actually true.',
    options: [
      { id: 'intl',    label: 'Yes - international lab', subLabel: 'GIA, GRS, Gübelin, SSEF',   points: 5 },
      { id: 'indian',  label: 'Yes - Indian lab',        subLabel: 'IGI India, GII, IGL, GTL',  points: 3,
        gap: 'Certified by an Indian lab - credible, though international labs (GIA, GRS, Gübelin, SSEF) carry the highest verification standard.' },
      { id: 'unknown', label: 'Yes - unknown lab',       subLabel: 'Unrecognised or local lab', points: 1,
        gap: 'The certificate is from an unknown lab - its standards can’t be verified, so the report carries little weight.' },
      { id: 'none',    label: 'No certificate',          subLabel: 'Uncertified stone',         points: 0,
        gap: 'No lab certificate - none of the stone’s claims (origin, treatment, weight) can be independently verified.' },
    ],
  },

  /* -------- Step 8 - Metal & finger (DYNAMIC: metal 8 + finger 5) ------ */
  {
    step: 8, factorKey: 'metal_finger', pillar: 'compliance', maxPoints: 13, image: 'hand', dynamic: true,
    title: 'How is your stone worn?',
    hint: 'Each planet maps to a specific metal and finger. The wrong metal breaks the energetic circuit; the wrong finger misdirects the energy rather than nullifying it.',
    // Options resolved dynamically against the selected stone (see scoring.js).
    metalOptions: [
      { id: 'gold',       label: 'Gold' },
      { id: 'platinum',   label: 'Platinum' },
      { id: 'silver',     label: 'Silver' },
      { id: 'panchdhatu', label: 'Panchdhatu' },
      { id: 'other',      label: 'Other metal' },
      { id: 'dontknow',   label: 'Don’t know' },
    ],
    fingerOptions: [
      { id: 'index',    label: 'Index finger' },
      { id: 'middle',   label: 'Middle finger' },
      { id: 'ring',     label: 'Ring finger' },
      { id: 'little',   label: 'Little finger' },
      { id: 'thumb',    label: 'Thumb' },
      { id: 'pendant',  label: 'Pendant',  subLabel: 'Worn around the neck' },
      { id: 'bracelet', label: 'Bracelet', subLabel: 'Worn on the wrist' },
    ],
  },

  /* -------- Step 9 - Energising (7 pts) ------------------------------- */
  {
    step: 9, factorKey: 'energising', pillar: 'compliance', maxPoints: 7, image: 'energising',
    title: 'Was it energised before wearing?',
    hint: 'An unenergised stone is latent, not active - its energy hasn’t been switched on. There’s no judgment for not knowing the ritual; it’s correctable at any time.',
    options: [
      { id: 'proper', label: 'Yes - proper ritual',      subLabel: 'Correct mantra, day, and Panchang', points: 7 },
      { id: 'basic',  label: 'Yes - basic washing only', subLabel: 'Water or milk rinse, no mantra',     points: 3,
        gap: 'Only a basic wash was done - without the correct mantra, day, and Panchang, the stone isn’t fully activated.' },
      { id: 'no',     label: 'No - worn directly',       subLabel: 'No energising done',                points: 0,
        gap: 'The stone was worn directly without energising - it stays latent rather than active. This is correctable at any time.' },
      { id: 'dontknow', label: 'Don’t know',             subLabel: 'Gifted or inherited stone',         points: 1,
        gap: 'Energising status is unknown - if it was never properly energised, the stone may still be latent. Easily corrected.' },
    ],
  },
];

export const TOTAL_STEPS = QUESTIONS.length;
export const questionByStep = (s) => QUESTIONS.find((q) => q.step === s);
