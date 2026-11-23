/* Board Runner — on-device rules parser. No network, no AI. */
(function (root) {
  'use strict';

  // ---------- dictionaries ----------
  // brand -> generic (generic -> null). Lowercase keys.
  const MEDS = {
    // DM
    metformin: null, glucophage: 'metformin', glipizide: null, glyburide: null, glimepiride: null,
    insulin: null, lantus: 'insulin glargine', glargine: null, basaglar: 'insulin glargine', toujeo: 'insulin glargine',
    humalog: 'insulin lispro', novolog: 'insulin aspart', levemir: 'insulin detemir', tresiba: 'insulin degludec',
    januvia: 'sitagliptin', sitagliptin: null, janumet: 'sitagliptin/metformin', pioglitazone: null, actos: 'pioglitazone',
    // GLP-1
    ozempic: 'semaglutide', wegovy: 'semaglutide', rybelsus: 'semaglutide', semaglutide: null,
    mounjaro: 'tirzepatide', zepbound: 'tirzepatide', tirzepatide: null, trulicity: 'dulaglutide', dulaglutide: null,
    victoza: 'liraglutide', saxenda: 'liraglutide', liraglutide: null, byetta: 'exenatide', bydureon: 'exenatide', exenatide: null,
    // SGLT2
    jardiance: 'empagliflozin', empagliflozin: null, farxiga: 'dapagliflozin', dapagliflozin: null,
    invokana: 'canagliflozin', canagliflozin: null, steglatro: 'ertugliflozin', ertugliflozin: null,
    // anticoag / antiplatelet
    warfarin: null, coumadin: 'warfarin', eliquis: 'apixaban', apixaban: null, xarelto: 'rivaroxaban', rivaroxaban: null,
    pradaxa: 'dabigatran', dabigatran: null, savaysa: 'edoxaban', edoxaban: null, lovenox: 'enoxaparin', enoxaparin: null,
    heparin: null, plavix: 'clopidogrel', clopidogrel: null, brilinta: 'ticagrelor', ticagrelor: null, effient: 'prasugrel',
    prasugrel: null, aspirin: null, 'baby aspirin': 'aspirin 81', asa: 'aspirin', cilostazol: null,
    // cardiac / BP
    lisinopril: null, losartan: null, valsartan: null, olmesartan: null, irbesartan: null, telmisartan: null,
    enalapril: null, benazepril: null, ramipril: null, amlodipine: null, norvasc: 'amlodipine', nifedipine: null,
    diltiazem: null, cardizem: 'diltiazem', verapamil: null, metoprolol: null, toprol: 'metoprolol', lopressor: 'metoprolol',
    carvedilol: null, coreg: 'carvedilol', atenolol: null, propranolol: null, bisoprolol: null, labetalol: null, nebivolol: null,
    hydrochlorothiazide: null, hctz: 'hydrochlorothiazide', chlorthalidone: null, furosemide: null, lasix: 'furosemide',
    bumetanide: null, bumex: 'bumetanide', torsemide: null, spironolactone: null, aldactone: 'spironolactone',
    entresto: 'sacubitril/valsartan', hydralazine: null, clonidine: null, digoxin: null, amiodarone: null, sotalol: null,
    flecainide: null, isosorbide: null, imdur: 'isosorbide', nitroglycerin: null, ranolazine: null,
    atorvastatin: null, lipitor: 'atorvastatin', rosuvastatin: null, crestor: 'rosuvastatin', simvastatin: null,
    pravastatin: null, ezetimibe: null, fenofibrate: null,
    // pulm
    albuterol: null, proair: 'albuterol', ventolin: 'albuterol', symbicort: 'budesonide/formoterol', advair: 'fluticasone/salmeterol',
    breo: 'fluticasone/vilanterol', trelegy: 'fluticasone/umeclidinium/vilanterol', spiriva: 'tiotropium', tiotropium: null,
    montelukast: null, singulair: 'montelukast', fluticasone: null, flonase: 'fluticasone',
    // neuro / psych
    gabapentin: null, neurontin: 'gabapentin', pregabalin: null, lyrica: 'pregabalin', fluoxetine: null, prozac: 'fluoxetine',
    sertraline: null, zoloft: 'sertraline', citalopram: null, celexa: 'citalopram', escitalopram: null, lexapro: 'escitalopram',
    paroxetine: null, paxil: 'paroxetine', venlafaxine: null, effexor: 'venlafaxine', duloxetine: null, cymbalta: 'duloxetine',
    bupropion: null, wellbutrin: 'bupropion', trazodone: null, mirtazapine: null, amitriptyline: null, nortriptyline: null,
    phenelzine: null, nardil: 'phenelzine', selegiline: null, tranylcypromine: null, lithium: null, quetiapine: null,
    seroquel: 'quetiapine', aripiprazole: null, abilify: 'aripiprazole', olanzapine: null, risperidone: null,
    lamotrigine: null, lamictal: 'lamotrigine', levetiracetam: null, keppra: 'levetiracetam', topiramate: null, topamax: 'topiramate',
    carbamazepine: null, oxcarbazepine: null, valproate: null, depakote: 'valproate', phenytoin: null, dilantin: 'phenytoin',
    alprazolam: null, xanax: 'alprazolam', lorazepam: null, ativan: 'lorazepam', clonazepam: null, klonopin: 'clonazepam',
    diazepam: null, valium: 'diazepam', zolpidem: null, ambien: 'zolpidem', melatonin: null,
    adderall: 'amphetamine', methylphenidate: null, ritalin: 'methylphenidate', vyvanse: 'lisdexamfetamine',
    donepezil: null, aricept: 'donepezil', carbidopa: null, sinemet: 'carbidopa/levodopa', ropinirole: null, pramipexole: null,
    sumatriptan: null, cyclobenzaprine: null, flexeril: 'cyclobenzaprine', tizanidine: null, baclofen: null, methocarbamol: null,
    // pain / opioid
    oxycodone: null, percocet: 'oxycodone/APAP', hydrocodone: null, norco: 'hydrocodone/APAP', tramadol: null,
    morphine: null, hydromorphone: null, dilaudid: 'hydromorphone', fentanyl: null, methadone: null,
    buprenorphine: null, suboxone: 'buprenorphine/naloxone', subutex: 'buprenorphine', naltrexone: null, vivitrol: 'naltrexone',
    ibuprofen: null, motrin: 'ibuprofen', advil: 'ibuprofen', naproxen: null, aleve: 'naproxen', meloxicam: null, mobic: 'meloxicam',
    celecoxib: null, celebrex: 'celecoxib', acetaminophen: null, tylenol: 'acetaminophen', diclofenac: null,
    // GU
    tamsulosin: null, flomax: 'tamsulosin', finasteride: null, proscar: 'finasteride', dutasteride: null, avodart: 'dutasteride',
    oxybutynin: null, tolterodine: null, mirabegron: null, myrbetriq: 'mirabegron', sildenafil: null, viagra: 'sildenafil',
    tadalafil: null, cialis: 'tadalafil', alfuzosin: null, terazosin: null, doxazosin: null,
    // GI
    omeprazole: null, prilosec: 'omeprazole', pantoprazole: null, protonix: 'pantoprazole', esomeprazole: null,
    nexium: 'esomeprazole', lansoprazole: null, famotidine: null, pepcid: 'famotidine', ondansetron: null, zofran: 'ondansetron',
    // endo / other
    levothyroxine: null, synthroid: 'levothyroxine', prednisone: null, methylprednisolone: null, hydrocortisone: null,
    dexamethasone: null, methotrexate: null, hydroxychloroquine: null, plaquenil: 'hydroxychloroquine', humira: 'adalimumab',
    allopurinol: null, colchicine: null, alendronate: null, fosamax: 'alendronate', estradiol: null, 'birth control': null,
    phentermine: null, potassium: null, 'vitamin d': null, 'fish oil': null, 'multivitamin': null, iron: null, b12: null,
    cetirizine: null, zyrtec: 'cetirizine', loratadine: null, claritin: 'loratadine', diphenhydramine: null, benadryl: 'diphenhydramine'
  };
  const MED_NAMES = Object.keys(MEDS).sort((a, b) => b.length - a.length);

  const SURG_TERMS = [
    'appy', 'appendectomy', 'lap chole', 'chole', 'cholecystectomy', 'tka', 'tkas', 'tha', 'thas', 'total knees?', 'total hips?',
    'knee replacements?', 'hip replacements?', 'shoulder replacements?', 'discectomy', 'discectomies', 'microdiscectomy',
    'laminectomy', 'laminectomies', 'fusions?', 'acdf', 'cabg', 'bypass', 'hysterectomy', 'c-?sections?', 'cesarean',
    'tonsillectomy', 't ?& ?a', 'hernia repairs?', 'hernias?', 'turp', 'aquablation', 'urolift', 'prostatectomy',
    'mastectomy', 'lumpectomy', 'colectomy', 'bowel resection', 'gastric bypass', 'gastric sleeve', 'sleeve gastrectomy',
    'whipple', 'nephrectomy', 'thyroidectomy', 'arthroscopy', 'scope', 'acl( repair| reconstruction)?', 'rotator cuff( repair)?',
    'carpal tunnel( release)?', 'cataracts?( surgery)?', 'lasik', 'valve replacement', 'pacemaker placement', 'stents?',
    'cardiac cath', 'ablation', 'tubal( ligation)?', 'vasectomy', 'orif', 'colonoscopy', 'egd', 'd ?& ?c',
    '[a-z]+(?:ectomy|ectomies|otomy|otomies|plasty|plasties|oscopy|oscopies|pexy|rrhaphy)'
  ];
  const SURG_RE = new RegExp('\\b(?:' + SURG_TERMS.join('|') + ')\\b', 'gi');
  const MODIFIERS = /\b(?:bilateral|left|right|multiple|lap|laparoscopic|robotic|total|partial|open|redo|revision|two|three|four|several|lumbar|cervical|l\d(?:-[ls]\d)?|c\d(?:-c\d)?|\d+)\s+$/i;

  const NEG_RE = /\b(?:no|denies|denied|negative for|ruled out|r\/o|not|never|without|none)\b/i;
  const ALLERGY_RE = /\b(?:allerg\w*|nkda|nka|no known (?:drug )?allergies)\b/i;

  // labels: [field, regex]  (regex matched against original text, case-insensitive)
  const LABELS = [
    ['proc', /\b(?:procedure(?: is| today)?|here for(?: an?)?|having(?: an?| a| his| her)?|scheduled for(?: an?)?|booked for(?: an?)?|surgery today is|today'?s case is|case is|surgeon(?: is)?)\b/gi],
    ['pmh', /\b(?:past medical history|medical history|pmh|pmhx|history of|hx of|has a history of)\b/gi],
    ['psh', /\b(?:past surgical history|surgical history|psh|pshx|prior surger(?:y|ies)|previous surger(?:y|ies)|surgeries|status post|s\/p)\b/gi],
    ['meds', /\b(?:home medications|home meds|medications|medication list|meds|takes|taking)\b/gi],
    ['allergies', /\b(?:allergies|allergy|allergic to)\b/gi],
    ['flags', /\b(?:flags?|concerns?|airway)\b/gi]
  ];

  const ACRONYMS = ['copd', 'chf', 'cad', 'osa', 'htn', 'dm', 'dm2', 't2dm', 'bph', 'gerd', 'ckd', 'esrd', 'afib', 'cva', 'tia', 'mi',
    'cabg', 'tka', 'tha', 'acdf', 'turp', 'ponv', 'dvt', 'ef', 'hld', 'nkda', 'nka', 'pcn', 'cpap', 'bipap', 'acl', 'orif', 'egd',
    'asa', 'hctz', 'ra', 'ms', 'pe', 'ptsd', 'adhd', 'ibs', 'uti', 'bmi', 'icd', 'aicd', 'mh', 'apap', 'ra', 'iv'];

  const NUMWORDS = { zero: 0, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
    eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15, sixteen: 16, seventeen: 17, eighteen: 18, nineteen: 19, twenty: 20,
    for: 4, to: 2, too: 2, won: 1, ate: 8 };

  // Speech slips inside surgical / med context. Marked with "?".
  const SLIPS = [
    [/\bhappy\b/gi, 'appy?'], [/\blap colly\b/gi, 'lap chole?'], [/\bcoli\b/gi, 'chole?'], [/\bteeka\b/gi, 'TKA?'],
    [/\bpro ?zack\b/gi, 'Prozac?'], [/\bflow max\b/gi, 'Flomax?'], [/\bmet forming\b/gi, 'metformin?']
  ];

  // ---------- helpers ----------
  const clean = s => s.replace(/\s+/g, ' ').replace(/^[\s,;:.\-–—]+|[\s,;:.\-–—]+$/g, '').trim();
  const words = s => clean(s).split(' ').filter(Boolean);

  function lev(a, b) {
    if (Math.abs(a.length - b.length) > 2) return 9;
    const d = Array.from({ length: a.length + 1 }, (_, i) => [i]);
    for (let j = 1; j <= b.length; j++) d[0][j] = j;
    for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++)
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    return d[a.length][b.length];
  }

  function fuzzyMed(word) {
    const w = word.toLowerCase();
    if (w.length < 6 || MEDS.hasOwnProperty(w)) return null;
    let best = null, bd = 9;
    for (const m of MED_NAMES) {
      if (m.includes(' ')) continue;
      const dist = lev(w, m);
      if (dist < bd) { bd = dist; best = m; }
    }
    const tol = w.length >= 9 ? 2 : 1;
    return bd <= tol ? best : null;
  }

  function prettyMed(name) {
    const key = name.toLowerCase();
    const gen = MEDS[key];
    const nice = key.replace(/\b\w/g, c => c.toUpperCase());
    if (gen === null || gen === undefined) return key === 'asa' ? 'aspirin' : key;
    // brand: capitalize, add generic
    return nice + ' (' + gen + ')';
  }

  const MED_RE = new RegExp('\\b(?:' + MED_NAMES.map(m => m.replace(/ /g, '\\s+')).join('|') + ')\\b', 'gi');
  const DOSE_RE = /^\s*\d+(?:\.\d+)?\s*(?:mg|mcg|micrograms?|milligrams?|units?|u|g|grams?|ml|%)?(?:\s*(?:daily|once a day|twice a day|bid|tid|qid|qd|qhs|at night|at bedtime|in the morning|weekly|prn|as needed))?/i;

  function caseFix(s) {
    let out = s;
    for (const a of ACRONYMS) out = out.replace(new RegExp('\\b' + a + '\\b', 'gi'), a.toUpperCase());
    out = out.replace(/\ba ?fib\b/gi, 'AFib').replace(/\bdr\b\.?/gi, 'Dr.').replace(/\bspo2\b/gi, 'SpO2')
      .replace(/\bt ?& ?a\b/gi, 'T&A').replace(/\bd ?& ?c\b/gi, 'D&C').replace(/\bs\/p\b/gi, 's/p');
    return out;
  }
  const cap = s => s ? s.charAt(0).toUpperCase() + s.slice(1) : s;

  // split "and"-joined dictionary lists; "metformin gabapentin" without commas -> pieces at each match
  function splitAtMatches(text, re, extendModifiers) {
    re.lastIndex = 0;
    const starts = [];
    let m;
    while ((m = re.exec(text))) {
      let s = m.index;
      if (extendModifiers) {
        let pre = text.slice(0, s), mm;
        while ((mm = pre.match(MODIFIERS))) { s -= mm[0].length; pre = text.slice(0, s); }
      }
      starts.push(s);
    }
    if (starts.length < 2) return [text];
    const out = [];
    const lead = text.slice(0, starts[0]);
    for (let i = 0; i < starts.length; i++) out.push(text.slice(starts[i], starts[i + 1] ?? text.length));
    if (clean(lead)) out[0] = lead + out[0];
    return out.map(p => clean(p.replace(/\b(?:and|also|plus|as well as)\s*$/i, ''))).filter(Boolean);
  }

  function splitItems(seg) {
    // commas / "also"; keep "X and Y ruled out" together unless both halves are dictionary terms
    let parts = seg.replace(/\s+(?=(?:no|denies|possible|probable|questionable|hx of)\s)/gi, ', ')
      .replace(/\b(ruled out|negative)\s+(?=\w)/gi, '$1, ')
      .split(/,|\balso\b|\bplus\b/i).map(clean).filter(Boolean);
    const out = [];
    for (const p of parts) {
      const halves = p.split(/\s+and\s+/i);
      const isDict = h => { MED_RE.lastIndex = 0; SURG_RE.lastIndex = 0; return MED_RE.test(h) || SURG_RE.test(h); };
      if (halves.length > 1 && !NEG_RE.test(p) && halves.every(isDict)) out.push(...halves.map(clean));
      else out.push(p);
    }
    // attach dangling qualifiers to previous item
    const merged = [];
    for (const it of out) {
      if (merged.length && (/^(?:followed by|f\/u|with|due to|secondary to|which|that|but|from|on|since|last)\b/i.test(it) ||
          (words(it).length <= 2 && !isDictWord(it) && !NEG_RE.test(it) && !/\d/.test(it)))) {
        merged[merged.length - 1] += ' ' + it;
      } else merged.push(it);
    }
    return merged;
  }
  function isDictWord(s) { MED_RE.lastIndex = 0; SURG_RE.lastIndex = 0; return MED_RE.test(s) || SURG_RE.test(s) || /\b(?:copd|chf|osa|cad|htn|dm|afib|bph|gerd|ckd|asthma|diabetes)\b/i.test(s); }

  function medItems(seg, notes) {
    const out = [];
    for (const item of splitItems(seg)) {
      for (let piece of splitAtMatches(item, MED_RE, false)) {
        piece = clean(piece.replace(/^(?:takes|taking|on|and)\s+/i, ''));
        if (!piece) continue;
        MED_RE.lastIndex = 0;
        const m = MED_RE.exec(piece);
        if (m) {
          const rest = piece.slice(m.index + m[0].length);
          const before = clean(piece.slice(0, m.index));
          out.push(clean((before ? before + ' ' : '') + prettyMed(m[0].replace(/\s+/g, ' ')) + rest));
        } else {
          // try fuzzy per word
          let fixed = false;
          const ws = words(piece).map(w => {
            const f = fuzzyMed(w.replace(/[^a-z]/gi, ''));
            if (f) { fixed = true; notes.push(`"${w}" read as ${f}?`); return prettyMed(f) + '?'; }
            return w;
          });
          out.push(ws.join(' ') + (fixed ? '' : ''));
        }
      }
    }
    return out;
  }

  function surgItems(seg) {
    const out = [];
    for (const item of splitItems(seg)) out.push(...splitAtMatches(item, SURG_RE, true));
    return out;
  }

  // ---------- extraction of vitals / room / body / identifiers ----------
  function extractGlobal(t, R) {
    const notes = R.notes, warn = R.warnings;
    // identifiers -> strip + warn
    const idPatterns = [
      [/\b(?:(?:his|her|patient'?s?|pt'?s?)\s+)?name\s+is\s+[a-z]+(?:\s+[a-z]+)?/gi, 'name'],
      [/\b(?:mr|mrs|ms|miss)\.?\s+[a-z]+/gi, 'name'],
      [/\b(?:mrn|medical record(?: number)?|account number|acct)\b[\s#:]*[\w-]*/gi, 'MRN'],
      [/\b(?:dob|d\.o\.b\.?|date of birth|birthday|born(?: on| in)?)\b[\s:]*[^.,;]*/gi, 'DOB'],
      [/\b\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4}\b/g, 'date'],
      [/\b(?:january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{1,2}(?:st|nd|rd|th)?(?:,?\s+\d{4})?/gi, 'date'],
      [/\b\d{3}[-.\s]\d{3}[-.\s]\d{4}\b/g, 'phone'],
      [/\b\d{3}-\d{2}-\d{4}\b/g, 'SSN']
    ];
    for (const [re, kind] of idPatterns) {
      t = t.replace(re, () => { warn.push(`Removed a possible ${kind}. Rooms only — no names, MRN, DOB.`); return ' '; });
    }
    // age > 89 is a HIPAA identifier
    t = t.replace(/\b(\d{2,3})[\s-]*(?:years?|yrs?|y\/?o)[\s-]*(?:old)?\b/gi, (m, a) => {
      a = +a;
      if (a > 89) { warn.push('Age over 89 changed to "90+" (HIPAA identifier).'); R.age = '90+'; }
      else R.age = String(a);
      return ' ';
    });
    t = t.replace(/\b(male|female|man|woman|gentleman|lady|guy|gal)\b/i, (m, s) => {
      R.sex = /^(male|man|gentleman|guy)$/i.test(s) ? 'M' : 'F'; return ' ';
    });

    // room
    t = t.replace(/\b(?:pre-?op\s+)?(?:room|rm|bay|bed)\s*(?:number|#|no\.?)?\s*(\d{1,3}[a-z]?\b|[a-z]\b|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty|for|to|too)/i,
      (m, r) => { R.room = NUMWORDS[r.toLowerCase()] !== undefined ? String(NUMWORDS[r.toLowerCase()]) : r.toUpperCase(); return ' . '; });

    // SpO2 first (so "pulse ox" isn't read as pulse)
    t = t.replace(/\b(?:spo2|sp o2|o2 sat(?:uration)?s?|sat(?:uration)?s?|pulse ox(?:imetry)?|oxygen sat(?:uration)?|oxygen)\s*(?:is|of|was|at)?\s*(\d{2,3})\s*(?:%|percent)?(?:\s*(?:on\s+)?(room air|ra\b|\d+\s*(?:l|liters?)(?:\s*nasal cannula|\s*nc)?))?/gi,
      (m, v, o2) => { R.v.spo2 = v + '%' + (o2 ? ' ' + (/room|ra/i.test(o2) ? 'RA' : o2.replace(/liters?/i, 'L')) : ''); return ' . '; });
    // BP
    let bp = false;
    t = t.replace(/\b(?:bp|blood pressure|pressure)\s*(?:is|of|was|at)?\s*(\d{2,3})\s*(?:\/|over)\s*(\d{2,3})/gi,
      (m, s, d) => { if (!bp) { R.v.bp = s + '/' + d; bp = true; } return ' . '; });
    if (!bp) t = t.replace(/\b(\d{2,3})\s*(?:\/|over)\s*(\d{2,3})\b/, (m, s, d) => { R.v.bp = s + '/' + d + '?'; notes.push('BP assumed from "' + m + '"'); return ' . '; });
    // RR
    t = t.replace(/\b(?:rr|resp(?:iratory)?(?: rate)?|resps|respirations|breathing)\s*(?:is|of|was|at|rate)?\s*(\d{1,2})\b/gi,
      (m, v) => { if (!R.v.rr) R.v.rr = v; return ' . '; });
    // HR (may appear twice — slip)
    const hrs = [];
    t = t.replace(/\b(?:hr|heart rate|pulse|heart rates)\s*(?:is|of|was|at)?\s*(\d{2,3}|\d)\b/gi, (m, v) => { hrs.push({ m, v }); return ' . '; });
    if (hrs.length) {
      const first = hrs[0];
      if (+first.v < 30 && !R.v.rr && hrs.length === 1) { R.v.hr = first.v + '?'; notes.push(`HR ${first.v} is low — check (RR?)`); }
      else R.v.hr = first.v;
      if (hrs.length > 1) {
        const second = hrs[1];
        if (!R.v.rr && +second.v <= 40) { R.v.rr = second.v + '?'; notes.push(`Second "${second.m.trim()}" read as RR ${second.v}`); }
        else notes.push(`Extra heart-rate value "${second.m.trim()}" ignored`);
      }
    }
    // temp (into vitals note)
    t = t.replace(/\b(?:temp(?:erature)?)\s*(?:is|of|was)?\s*(\d{2,3}(?:\.\d)?)/gi, (m, v) => { R.v.temp = v; return ' . '; });

    // body
    t = t.replace(/\bbmi\s*(?:is|of|was)?\s*(\d{2}(?:\.\d)?)/gi, (m, v) => { R.bmi = v; return ' . '; });
    t = t.replace(/\b(?:weighs?|weight(?: is)?)?\s*(\d{2,3}(?:\.\d)?)\s*(kg|kilos?|kilograms?|pounds|lbs?)\b/gi,
      (m, v, u) => { R.wt = { v: +v, kg: /^k/i.test(u) }; return ' . '; });
    t = t.replace(/\b(\d)\s*(?:foot|feet|ft|')\s*(?:(\d{1,2})\s*(?:inches|inch|in|")?)?/gi, (m, f, i) => { R.ht = { in: +f * 12 + (+i || 0) }; return ' . '; });
    t = t.replace(/\b(\d{3})\s*(?:cm|centimeters)\b/gi, (m, c) => { R.ht = { in: +c / 2.54 }; return ' . '; });
    t = t.replace(/\b(morbidly obese|super obese|obese|overweight|thin|frail|cachectic|petite|large|big guy|big gal|muscular)\b/gi,
      (m) => { R.habitus.push(m.toLowerCase()); return ' '; });
    return t;
  }

  // ---------- main ----------
  function parse(input) {
    const R = { notes: [], warnings: [], v: {}, habitus: [], age: null, sex: null };
    let t = ' ' + (input || '') + ' ';
    t = t.replace(/\bpepper\b[\s.!]*$/i, ' ');                  // trailing "pepper"
    t = t.replace(/\b(dr|mr|mrs|ms|st)\./gi, '$1 ')             // abbreviations with periods
         .replace(/(\d)\.(\d)/g, '$1․$2');                // protect decimals
    for (const [re, rep] of SLIPS) t = t.replace(re, m => { R.notes.push(`"${m}" read as ${rep}`); return rep; });

    t = extractGlobal(t, R);

    const F = { proc: [], pmh: [], psh: [], meds: [], allergies: [], flagsSaid: [] };
    const negatives = [];
    let surgeon = '';

    const sentences = t.split(/[.;!?\n]+/).map(s => s.replace(/․/g, '.')).map(clean).filter(Boolean);
    let carry = null;
    for (const sent of sentences) {
      // find labels
      const hits = [];
      for (const [field, re] of LABELS) {
        re.lastIndex = 0; let m;
        while ((m = re.exec(sent))) hits.push({ field, i: m.index, end: m.index + m[0].length, text: m[0] });
      }
      hits.sort((a, b) => a.i - b.i || b.end - a.end);
      const clean_hits = [];
      for (const h of hits) if (!clean_hits.length || h.i >= clean_hits[clean_hits.length - 1].end) clean_hits.push(h);
      // label "airway" keeps its word
      const segs = [];
      const firstStart = clean_hits.length ? clean_hits[0].i : sent.length;
      if (clean(sent.slice(0, firstStart))) segs.push({ field: carry, text: sent.slice(0, firstStart) });
      clean_hits.forEach((h, k) => {
        const txt = sent.slice(h.end, k + 1 < clean_hits.length ? clean_hits[k + 1].i : sent.length);
        segs.push({ field: h.field, text: (/airway/i.test(h.text) ? 'airway ' : '') + txt, label: h.text });
      });
      carry = null;
      for (const s of segs) {
        let text = clean(s.text.replace(/^(?:is|are|include|includes|of|:)\s+/i, ''));
        if (!text) { if (s.field) carry = s.field; continue; }
        if (s.field === 'proc') {
          const dm = text.match(/\b(?:with|by)?\s*(?:dr|doctor)\s+([a-z][a-z'-]+)/i);
          if (dm) { surgeon = 'Dr. ' + dm[1].charAt(0).toUpperCase() + dm[1].slice(1); text = clean(text.replace(dm[0], '')); }
          else if (/surgeon/i.test(s.label || '')) { surgeon = text.replace(/\b\w/g, c => c.toUpperCase()); text = ''; }
          if (text) F.proc.push(text);
          continue;
        }
        if (s.field === 'meds') { F.meds.push(...medItems(text, R.notes)); continue; }
        if (s.field === 'psh') { F.psh.push(...surgItems(text)); continue; }
        if (s.field === 'allergies') { F.allergies.push(text); continue; }
        if (s.field === 'flags') { F.flagsSaid.push(text); continue; }
        // pmh (soft) or unlabeled: classify each item
        for (const item of splitItems(text)) {
          const neg = NEG_RE.test(item);
          MED_RE.lastIndex = 0; SURG_RE.lastIndex = 0;
          if (ALLERGY_RE.test(item)) F.allergies.push(item.replace(/^allergic to\s+/i, ''));
          else if (neg) { F.pmh.push(item); negatives.push(item); }
          else if (MED_RE.test(item) && s.field !== 'pmh') F.meds.push(...medItems(item, R.notes));
          else if ((SURG_RE.lastIndex = 0, SURG_RE.test(item)) && !/\b(?:low|sats?|failure)\b/i.test(item)) F.psh.push(...surgItems(item));
          else if (/\b(?:dr|doctor)\s+[a-z]/i.test(item) && !F.proc.length && !surgeon && !/followed|pcp|cardiolog|pulm/i.test(item)) {
            const dm = item.match(/\b(?:dr|doctor)\s+([a-z][a-z'-]+)/i);
            surgeon = 'Dr. ' + dm[1].charAt(0).toUpperCase() + dm[1].slice(1);
            const rest = clean(item.replace(dm[0], '').replace(/\b(?:with|by)\s*$/i, ''));
            if (rest) F.proc.push(rest);
          }
          else F.pmh.push(item);
        }
      }
    }

    // ---------- build card ----------
    const lowerLead = (x, i) => {
      if (i === 0) return x;
      const w = x.split(' ')[0];
      return /^[A-Z][a-z]+$/.test(w) && !(MEDS[w.toLowerCase()]) ? w.toLowerCase() + x.slice(w.length) : x;
    };
    const fmt = arr => cap(arr.map(clean).filter(Boolean).map(caseFix).map(lowerLead).join(', '));
    const card = {};
    card.room = R.room || '';
    if (!R.room) R.warnings.push('No room heard — add the room # (rooms only, no names).');
    card.proc = [fmt(F.proc), surgeon].filter(Boolean).join(' / ');

    const body = [];
    if (R.age || R.sex) body.push(R.age ? R.age + (R.age.endsWith('+') ? ' ' : '') + (R.sex || 'yo') : R.sex);
    if (R.habitus.length) body.push(R.habitus.join(', '));
    if (R.wt) body.push(R.wt.kg ? R.wt.v + ' kg' : R.wt.v + ' lb');
    if (R.ht) body.push(Math.floor(R.ht.in / 12) + "'" + Math.round(R.ht.in % 12) + '"');
    let bmiNum = R.bmi ? +R.bmi : null;
    if (R.bmi) body.push('BMI ' + R.bmi);
    else if (R.wt && R.ht) {
      const kg = R.wt.kg ? R.wt.v : R.wt.v * 0.4536, m = R.ht.in * 0.0254;
      bmiNum = Math.round(kg / (m * m));
      body.push('BMI ~' + bmiNum + ' (calc)');
    }
    card.body = body.join(', ');

    const v = R.v;
    card.vitals = (v.bp || v.hr || v.rr || v.spo2 || v.temp)
      ? `BP ${v.bp || '—'}, HR ${v.hr || '—'}, RR ${v.rr || '—'}, SpO2 ${v.spo2 || '—'}` + (v.temp ? `, T ${v.temp}` : '')
      : '';
    card.pmh = fmt(F.pmh);
    card.meds = fmt(F.meds);
    card.psh = fmt(F.psh);
    card.allergies = fmt(F.allergies);
    card.flags = buildFlags(F, negatives, bmiNum, v).concat(F.flagsSaid.map(caseFix)).join(' • ');
    return { card, notes: R.notes, warnings: R.warnings };
  }

  // ---------- anesthesia flags (only from what was said) ----------
  function buildFlags(F, negatives, bmi, v) {
    const flags = [];
    const add = s => { if (!flags.includes(s)) flags.push(s); };
    const pos = F.pmh.concat(F.psh);
    const medTxt = F.meds.join(' | ').toLowerCase();
    const has = (re) => pos.filter(x => {
      const g = new RegExp(re.source, 'gi'); let m;
      while ((m = g.exec(x))) if (!termNegated(x, m.index, m[0].length)) return true;
      return false;
    });

    has(/difficult (?:airway|intubation|tube)|mallampati\s*(?:3|4|iii|iv|three|four)|limited (?:neck|mouth|opening)|small mouth|beard|dentures|loose teeth|neck fusion|acdf|c-?spine|trach/i)
      .forEach(x => add('Airway: ' + cap(caseFix(clean(x)))));
    if (has(/\bosa\b|sleep apnea|cpap|bipap/i).length) add('OSA');
    has(/\bchf\b|heart failure|\bef\b|ejection fraction|\bcad\b|coronary|stents?\b|\bmi\b|heart attack|cabg|a ?fib|atrial fib|pacemaker|aicd|\bicd\b|defibrillator|valve|aortic stenosis|murmur|arrhythmia/i)
      .forEach(x => add('Cardiac: ' + cap(caseFix(clean(x)))));
    has(/copd|asthma|low (?:sats?|o2|oxygen)|hypox|home o2|home oxygen|pulmonary hypertension|pulm htn|emphysema|\bild\b|fibrosis|smok/i)
      .forEach(x => add('Pulm: ' + cap(caseFix(clean(x)))));
    if (has(/diabet|\bdm2?\b|t2dm|a1c/i).length || /metformin|insulin|glipizide|glyburide|glimepiride|sitagliptin|januvia|lantus|humalog|novolog/.test(medTxt)) {
      const m = medTxt.match(/metformin|insulin[^|,]*|glipizide|glyburide|glimepiride|sitagliptin/);
      add(has(/diabet|\bdm2?\b|t2dm/i).length ? 'DM' + (m ? ' (' + m[0].trim() + ')' : '') : 'DM? (' + (m ? m[0].trim() : 'meds') + ')');
    }
    const glp = medTxt.match(/ozempic|wegovy|rybelsus|semaglutide|mounjaro|zepbound|tirzepatide|trulicity|dulaglutide|victoza|saxenda|liraglutide|byetta|bydureon|exenatide/);
    if (glp) add('GLP-1 (' + glp[0] + ') — last dose? aspiration risk');
    const sglt = medTxt.match(/jardiance|empagliflozin|farxiga|dapagliflozin|invokana|canagliflozin|steglatro|ertugliflozin/);
    if (sglt) add('SGLT2i (' + sglt[0] + ') — last dose?');
    const ac = F.meds.map(x => (x.toLowerCase().match(/warfarin|coumadin|eliquis|apixaban|xarelto|rivaroxaban|pradaxa|dabigatran|savaysa|edoxaban|lovenox|enoxaparin|heparin|plavix|clopidogrel|brilinta|ticagrelor|effient|prasugrel|cilostazol|aspirin/) || [])[0]).filter(Boolean);
    if (ac.length) add('Anticoag/antiplatelet (' + ac.join(', ') + ') — last dose?');
    const opi = medTxt.match(/suboxone|subutex|buprenorphine|methadone|naltrexone|vivitrol/);
    if (opi) add('Opioid mgmt: ' + opi[0]);
    const maoi = medTxt.match(/phenelzine|nardil|selegiline|tranylcypromine/);
    if (maoi) add('MAOI: ' + maoi[0]);
    if (/prednisone|methylprednisolone|hydrocortisone|dexamethasone/.test(medTxt)) add('Steroids — stress dose?');
    if (has(/malignant hyperthermia|\bmh\b/i).length) add('MH history');
    if (has(/ponv|nausea after|motion sick/i).length) add('PONV');
    if (has(/gerd|reflux|hiatal hernia|gastroparesis/i).length) add('Aspiration: ' + caseFix(clean(has(/gerd|reflux|hiatal hernia|gastroparesis/i)[0])));
    if (has(/pregnan/i).length) add('Pregnant');
    has(/seizure|epilep|stroke|\bcva\b|\btia\b/i).forEach(x => add('Neuro: ' + cap(caseFix(clean(x)))));
    has(/ckd|dialysis|esrd|renal failure|kidney disease/i).forEach(x => add('Renal: ' + cap(caseFix(clean(x)))));
    if (has(/difficult iv|hard stick|poor access|no veins/i).length) add('Difficult IV');
    if (bmi && bmi >= 40) add('BMI ≥40');
    if (v.spo2 && parseInt(v.spo2) < 92) add('SpO2 ' + v.spo2);
    if (v.bp && parseInt(v.bp) >= 180) add('BP ' + v.bp);
    return flags;
  }

  function termNegated(item, i, len) {
    const before = item.slice(0, i).split(/\s+/).filter(Boolean).slice(-4).join(' ');
    const after = item.slice(i + len).split(/\s+/).filter(Boolean).slice(0, 4).join(' ');
    return /\b(?:no|denies|denied|negative for|without|never|not)\b/i.test(before) || /\b(?:ruled out|negative|r\/o)\b/i.test(after);
  }

  const FIELD_ORDER = [
    ['room', 'ROOM'], ['proc', 'PROCEDURE / SURGEON'], ['body', 'BODY/BMI'], ['vitals', 'VITALS'], ['pmh', 'PMH'],
    ['meds', 'MEDS'], ['psh', 'PSH'], ['allergies', 'ALLERGIES'], ['flags', 'FLAGS']
  ];
  function cardText(card) {
    return FIELD_ORDER.map(([k, label]) => label + ': ' + ((card[k] || '').trim() || '—')).join('\n');
  }

  const api = { parse, cardText, FIELD_ORDER };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.BRParser = api;
})(typeof window !== 'undefined' ? window : globalThis);
