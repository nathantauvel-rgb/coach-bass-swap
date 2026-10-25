// Outils communs et morceaux d'entraînement : moteur de production, Web Workers.
// Tous les fichiers de js/ partagent la même portée et sont chargés dans l'ordre indiqué dans index.html.
'use strict';
const SR = 44100; let BPM = 124, P = 60 / BPM;
const $ = id => document.getElementById(id);
const n2f = m => 440 * Math.pow(2, (m - 69) / 12);
/* ---------- Morceaux d'entraînement : moteur de production ---------- */
function makeRng(seed){ let s = (seed >>> 0) || 1; return () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s / 4294967296 * 2 - 1; }; }
const TAU = Math.PI * 2;

// Percussions calculées une seule fois, puis copiées à chaque coup
let KIT = null;
function buildKit(){
  if (KIT) return KIT;
  const rnd = makeRng(777), sm = sec => new Float32Array(Math.round(sec * SR));
  const metal = (dec, len, tune = 1.62) => { const o = sm(len), fr = [205.3, 304.4, 369.6, 522.7, 540, 800].map(f => f * tune), ph = fr.map(() => 0); let p1 = 0, p2 = 0;
    for (let n = 0; n < o.length; n++){ const t = n / SR; let x = 0;
      for (let j = 0; j < fr.length; j++){ ph[j] += fr[j] / SR; if (ph[j] >= 1) ph[j] -= 1; x += ph[j] < .5 ? 1 : -1; }
      x = x / 6 * .55 + rnd() * .5; const h1 = x - p1; p1 = x; const h2 = h1 - p2; p2 = h1;
      o[n] = h2 * Math.exp(-t * dec) * Math.min(1, t / .0008); }
    return o; };
  const noise = (len, f) => { const o = sm(len); let p = 0; for (let n = 0; n < o.length; n++){ const x = rnd(); o[n] = f(n / SR, x - p, x); p = x; } return o; };
  const bp = (a, fc, q) => { const w = TAU * fc / SR, al = Math.sin(w) / (2 * q), a0 = 1 + al, a1 = -2 * Math.cos(w), a2 = 1 - al; let x1 = 0, x2 = 0, y1 = 0, y2 = 0;
    for (let n = 0; n < a.length; n++){ const x = a[n], y = (al * x - al * x2 - a1 * y1 - a2 * y2) / a0; x2 = x1; x1 = x; y2 = y1; y1 = y; a[n] = y * 2; } return a; };
  const clap = bp(noise(.4, (t, h, x) => { const on = t < .007 || (t > .010 && t < .017) || (t > .020 && t < .027) || t > .030 ? 1 : 0; return x * on * (t < .031 ? .9 : Math.exp(-(t - .031) * 14)); }), 1250, .7);
  const snare = bp(noise(.3, (t, h, x) => x * Math.exp(-t * 16)), 2600, .5);
  for (let n = 0; n < snare.length; n++){ const t = n / SR; snare[n] = snare[n] * .8 + (Math.sin(TAU * 185 * t) * .6 + Math.sin(TAU * 330 * t) * .3) * Math.exp(-t * 26); }
  const rim = sm(.07); for (let n = 0; n < rim.length; n++){ const t = n / SR; rim[n] = (Math.sin(TAU * 1720 * t) * .8 + Math.sin(TAU * 860 * t) * .3 + rnd() * .25) * Math.exp(-t * 80); }
  const shaker = bp(noise(.11, (t, h) => h * Math.min(1, t / .006) * Math.exp(-t * 42)), 7200, .6);
  const conga = f => { const o = sm(.4); let ph = 0; for (let n = 0; n < o.length; n++){ const t = n / SR; ph += f * (1 + .3 * Math.exp(-t * 55)) / SR; o[n] = Math.sin(TAU * ph) * Math.exp(-t * 10) + rnd() * .06 * Math.exp(-t * 90); } return o; };
  KIT = { hatC: metal(60, .1), hatO: metal(8.5, .55), ride: metal(4, 1, 2.3), clap, snare, rim, shaker, congaH: conga(340), congaL: conga(225),
    crashL: metal(1.5, 2.6, 1.9), crashR: metal(1.6, 2.6, 1.93) };
  return KIT;
}

const KEYS = { house: { A: 45, B: 40 }, techno: { A: 40, B: 47 }, afro: { A: 45, B: 38 } };
const PROGS = [[0, 0, 3, 10], [0, 8, 3, 10], [0, 5, 8, 7], [0, 10, 8, 7]];
const MAJ = new Set([3, 8, 10]);

// Fabrique un morceau à partir de sections [début, fin, éléments] (en temps)
function makeSong(style, role, seed, secs, o = {}){
  const kit = buildKit(), total = Math.max(...secs.map(x => x[1])), beats = total + (o.tail ?? 4);
  const N = Math.ceil((beats * P + 2.5) * SR), ML = new Float32Array(N), MR = new Float32Array(N), K = new Float32Array(N), S = new Float32Array(N), D = new Float32Array(N);
  const rnd = makeRng(seed * 7919 + 13), rand = () => (rnd() + 1) / 2;
  const at = b => Math.round(b * P * SR), kicks = [];
  const mus = (i, v, pan = 0, send = 0, dly = 0) => { if (i < 0 || i >= N) return; ML[i] += v * (pan > 0 ? 1 - pan : 1); MR[i] += v * (pan < 0 ? 1 + pan : 1); if (send) S[i] += v * send; if (dly) D[i] += v * dly; };
  const samp = (arr, b, g, pan = 0, send = 0) => { const s = at(b); for (let n = 0; n < arr.length; n++) mus(s + n, arr[n] * g, pan, send); };
  const hum = () => .88 + rand() * .24;
  const tonic = KEYS[style][role], prog = PROGS[(seed + (role === 'B' ? 1 : 0)) % PROGS.length];
  const deg = bar => prog[bar % 4], rootOf = bar => tonic + deg(bar) - (deg(bar) > 6 ? 12 : 0);
  const chordOf = (bar, base) => { const d = deg(bar), r = base + d - (d > 6 ? 12 : 0); return MAJ.has(d) ? [r, r + 4, r + 7, r + 11] : [r, r + 3, r + 7, r + 10]; };
  const has = (b, f) => secs.some(([x, y, fl]) => b >= x && b < y && fl.includes(f));
  const sw = style === 'techno' ? 0 : .04;

  // ---- instruments ----
  const kick = (b, g = 1) => { const s = at(b), deep = style === 'techno', len = Math.round((deep ? .62 : .46) * SR); kicks.push(s); let ph = 0;
    for (let n = 0; n < len && s + n < N; n++){ const t = n / SR, f = (deep ? 43 : 50) + (deep ? 150 : 125) * Math.exp(-t * (deep ? 26 : 33)); ph += f / SR;
      let x = Math.sin(TAU * ph) * Math.exp(-t * (deep ? 4.6 : 6.8)) * Math.min(1, t / .0008);
      x += Math.sin(TAU * 1500 * t) * Math.exp(-t * 95) * .14;
      K[s + n] += Math.tanh(x * 1.8) * .92 * g; } };
  const svf = (s, len, src, cut0, cut1, res, env, g, pan, send, dly, att = .003, rel = .02) => { let lp = 0, bpv = 0; const q = 1 - res;
    for (let n = 0; n < len; n++){ const t = n / SR, fc = Math.min(cut1 + (cut0 - cut1) * Math.exp(-t * env), SR / 6), f = 2 * Math.sin(Math.PI * fc / SR);
      lp += f * bpv; const hp = src(n, t) - lp - q * bpv; bpv += f * hp;
      mus(s + n, lp * Math.min(1, t / att) * Math.min(1, (len - n) / (rel * SR)) * g, pan, send, dly); } };
  const bassNote = (b, dur, m, kind, g = .5) => { const s = at(b), len = at(dur), f = n2f(m);
    if (kind === 'sub'){ for (let n = 0; n < len; n++){ const t = n / SR; mus(s + n, (Math.sin(TAU * f * t) + .3 * Math.sin(TAU * 2 * f * t)) * Math.min(1, t / .004) * Math.min(1, (len - n) / (.015 * SR)) * g * .85); } return; }
    if (kind === 'log'){ let ph = 0; for (let n = 0; n < len; n++){ const t = n / SR; ph += f * (1 + .3 * Math.exp(-t * 25)) / SR; mus(s + n, Math.tanh(Math.sin(TAU * ph) * 2.2) * Math.exp(-t * 5) * Math.min(1, t / .003) * g * .8); } return; }
    let p1 = 0, p2 = .37; const det = kind === 'reese' ? 1.008 : 1.002;
    const src = (n, t) => { p1 += f / SR; if (p1 >= 1) p1 -= 1; p2 += f * det / SR; if (p2 >= 1) p2 -= 1; return (2 * p1 - 1) * .55 + (2 * p2 - 1) * .35 + Math.sin(TAU * f * t) * .6; };
    if (kind === 'acid') svf(s, len, src, 1800 + 1600 * rand(), 160, .86, 16, g * .5, 0, .05, 0);
    else svf(s, len, src, kind === 'reese' ? 650 : 1500, kind === 'reese' ? 380 : 240, .2, kind === 'reese' ? 3 : 22, g * .62, 0, 0, 0); };
  const supersaw = (b, dur, notes, g, cut0, cut1, env, att, send, width = .55) => { const s = at(b), len = at(dur), vs = [];
    notes.forEach(m => [-.12, -.05, 0, .05, .12].forEach((d, j) => vs.push({ f: n2f(m) * Math.pow(2, d / 12), v: rand(), pan: (j - 2) / 2 * width })));
    let lL = 0, bL = 0, lR = 0, bR = 0; const k = g / vs.length * 3;
    for (let n = 0; n < len && s + n < N; n++){ const t = n / SR; let xl = 0, xr = 0;
      for (const v of vs){ v.v += v.f / SR; if (v.v >= 1) v.v -= 1; const x = 2 * v.v - 1; xl += x * (v.pan > 0 ? 1 - v.pan : 1); xr += x * (v.pan < 0 ? 1 + v.pan : 1); }
      const fc = cut1 + (cut0 - cut1) * Math.exp(-t * env), f = 2 * Math.sin(Math.PI * fc / SR);
      lL += f * bL; bL += f * (xl - lL - .7 * bL); lR += f * bR; bR += f * (xr - lR - .7 * bR);
      const a = Math.min(1, t / att) * Math.min(1, (len - n) / (.08 * SR)) * k, i = s + n; ML[i] += lL * a; MR[i] += lR * a; S[i] += (lL + lR) * a * send; } };
  const epiano = (b, dur, notes, g) => { const s = at(b), len = at(dur);
    for (let n = 0; n < len; n++){ const t = n / SR; let x = 0; for (const m of notes){ const f = n2f(m); x += Math.sin(TAU * f * t + 1.5 * Math.exp(-t * 4) * Math.sin(TAU * 2 * f * t)); }
      mus(s + n, x * Math.exp(-t * 1.3) * Math.min(1, t / .004) * Math.min(1, (len - n) / (.05 * SR)) * g, 0, .3); } };
  const lead = (b, m, g, pan) => { const s = at(b), f = n2f(m);
    if (style === 'afro'){ const len = Math.round(.45 * SR); for (let n = 0; n < len; n++){ const t = n / SR; mus(s + n, (Math.sin(TAU * f * t) + .35 * Math.sin(TAU * 4 * f * t) * Math.exp(-t * 28)) * Math.exp(-t * 8) * Math.min(1, t / .002) * g, pan, .25, .3); } return; }
    if (style === 'techno'){ bassNote(b, .22, m - 12, 'acid', g * 1.4); return; }
    let ph = 0; svf(s, Math.round(.3 * SR), () => { ph += f / SR; if (ph >= 1) ph -= 1; return (2 * ph - 1) + (ph < .5 ? .3 : -.3); }, 5200, 600, .35, 24, g, pan, .25, .35, .002, .03); };
  // (lot 47 : la « voix » fabriquée ici a été retirée, l'utilisateur la trouvait très désagréable : ne pas la remettre)
  const crash = (b, g = .22) => { const s = at(b); for (let n = 0; n < kit.crashL.length && s + n < N; n++){ ML[s + n] += kit.crashL[n] * g; MR[s + n] += kit.crashR[n] * g; S[s + n] += (kit.crashL[n] + kit.crashR[n]) * g * .2; } };
  const riser = (b0, b1, g = .12) => { const s = at(b0), len = at(b1 - b0); let lp = 0, bpv = 0;
    for (let n = 0; n < len; n++){ const u = n / len, fc = 300 + 7000 * u * u, f = 2 * Math.sin(Math.PI * fc / SR); lp += f * bpv; bpv += f * (rnd() - lp - .5 * bpv); mus(s + n, bpv * u * u * g, Math.sin(u * 12) * .4, .5); } };

  // ---- motif mélodique propre à ce morceau ----
  const stabRh = [[1.5, 3.75], [.75, 2.25, 3.5], [.5, 1.5, 2.5, 3.5], [0, 1.75, 2.5]][Math.floor(rand() * 4)];
  const motif = [...Array(16)].map((_, i) => ({ on: i % 4 === 0 || rand() < .45, t: i * .5, d: Math.floor(rand() * 4), oct: rand() < .25 ? 12 : 0 }));
  const congas = [[.75, 'H'], [1.5, 'L'], [2.25, 'H'], [2.5, 'H'], [3.5, 'L']];

  for (let b = 0; b < total; b++){
    const bar = Math.floor(b / 4), bb = b % 4, r = rootOf(bar), ph = b % 32;
    if (has(b, 'k')) kick(b, style === 'afro' ? .86 : 1);
    if (has(b, 'h')){
      if (style === 'house'){ samp(kit.hatO, b + .5, .17 * hum(), .12, .05); samp(kit.hatC, b + .25 + sw, .06 * hum(), -.3); samp(kit.hatC, b + .75 + sw, .07 * hum(), .3); if (bb === 3 && ph >= 28) samp(kit.hatO, b + .75, .08, -.2); }
      else if (style === 'techno'){ for (let q = 0; q < 4; q++) samp(kit.hatC, b + q / 4, (q === 2 ? .13 : .055) * hum(), q % 2 ? .25 : -.25); if (b >= 0 && bar % 2) samp(kit.ride, b + .5, .05, .2, .1); }
      else { [0, .27, .5, .77].forEach((o2, q) => samp(kit.shaker, b + o2, [.24, .12, .19, .12][q] * hum(), q % 2 ? .35 : -.35)); samp(kit.hatO, b + .5, .07, .2); }
    }
    if (has(b, 'cl')){
      if (b % 2 === 1) samp(style === 'afro' ? kit.rim : kit.clap, b, (style === 'afro' ? .3 : .34) * hum(), 0, .35);
      if (ph === 31) [0, .25, .5, .75].forEach((q, j) => samp(kit.snare, b + q, .07 + j * .05, 0, .25));
      else if (b % 16 === 15) samp(kit.snare, b + .75, .09, 0, .2);
    }
    if (has(b, 'p')){
      if (style === 'house'){ if (bb === 2) samp(kit.rim, b + .75, .13, .4, .25); if (bb % 2 === 0) samp(kit.shaker, b + .25 + sw, .11, -.3); }
      else if (style === 'techno'){ if (b % 2 === 1) samp(kit.rim, b + .75, .11, .3, .35); if (bb === 3) samp(kit.congaH, b + .5, .12, -.4, .25); }
      else if (bb === 0) congas.forEach(([o2, w]) => samp(w === 'H' ? kit.congaH : kit.congaL, b + o2, .22 * hum(), w === 'H' ? .3 : -.3, .1));
    }
    if (has(b, 'b')){
      if (style === 'house'){ bassNote(b + .5, .42, r - 12, 'pluck', .55); if (bb === 3 && rand() < .5) bassNote(b + .75, .2, r, 'pluck', .3); }
      else if (style === 'techno'){ if (role === 'A') for (const o2 of [.25, .5, .75]) bassNote(b + o2, .2, r - 12, 'sub', .5);
        else for (let q = 0; q < 4; q++) bassNote(b + q / 4, .2, r - 12 + [0, 0, 12, 0, 3, 0, 7, 10][(b * 4 + q) % 8], 'acid', .5); }
      else if (bb === 0){ if (role === 'A') [0, .75, 1.5, 2.5, 3].forEach(o2 => bassNote(b + o2, .3, r - 12, 'pluck', .55));
        else [[.75, 0], [1.5, 0], [2.75, 3], [3.25, 0]].forEach(([o2, m]) => bassNote(b + o2, .5, r + m, 'log', .5)); }
    }
    if (has(b, 'c') && bb === 0){
      if (style === 'house') stabRh.forEach(o2 => supersaw(b + o2, .3, chordOf(bar, tonic + 12), .16, 4200, 500, 14, .003, .3));
      else if (style === 'techno'){ if (bar % 2 === 1) supersaw(b + 2.5, .26, chordOf(bar, tonic + 12), .1, 2600, 280, 20, .003, .5, .3); }
      else epiano(b, 3.7, chordOf(bar, tonic + 24).slice(0, 3), .07);
    }
    if (has(b, 'pad') && bb === 0) supersaw(b, 4, chordOf(bar, tonic + 12).slice(0, 3), .1, 1100, 1100, 1, .35, .55, .9);
    if (has(b, 'lead') && bar % 2 === 0 && bb === 0){
      const lift = Math.floor(ph / 16) % 2;
      for (const st of motif){ if (!st.on) continue; const bt = b + st.t, cb = Math.floor(bt / 4), notes = chordOf(cb, tonic + 24);
        lead(bt, notes[(st.d + lift) % 4] + st.oct, .1, st.t % 1 ? .25 : -.25); }
    }
    // transitions : cymbale en début de phrase et montée avant chaque arrivée d'accords
    if (ph === 0 && b > 0 && has(b, 'k') && (has(b, 'c') || has(b, 'cl') || has(b, 'lead'))) crash(b);
    if (ph === 24 && b + 8 < total && (has(b + 8, 'c') || has(b + 8, 'lead')) && !has(b, 'c')) riser(b, b + 8);
  }
  if (o.end){ crash(o.end, .25); kick(o.end); }

  // ---- traitement : écho, réverb, pompe (sidechain), mixage ----
  const dd = at(.75), fbk = .38; for (let n = dd; n < N; n++) D[n] += D[n - dd] * fbk;
  for (let n = dd; n < N; n++){ ML[n] += D[n - dd] * .55; MR[n] += (n >= dd + 2205 ? D[n - dd - 2205] : 0) * .55; }
  { const cl = [1116, 1188, 1277, 1356], ap = [556, 441], sp = 23;
    const cb = cl.flatMap(d => [new Float32Array(d), new Float32Array(d + sp)]), cf = cb.map(() => 0), ci = cb.map(() => 0);
    const ab = ap.flatMap(d => [new Float32Array(d), new Float32Array(d + sp)]), ai = ab.map(() => 0);
    for (let n = 0; n < N; n++){ const x = S[n] * .02; let l = 0, rr = 0;
      for (let j = 0; j < cb.length; j++){ const buf = cb[j], y = buf[ci[j]]; cf[j] = y * .75 + cf[j] * .25; buf[ci[j]] = x + cf[j] * .84; ci[j] = (ci[j] + 1) % buf.length; if (j % 2) rr += y; else l += y; }
      for (let j = 0; j < ab.length; j++){ const buf = ab[j], y = buf[ai[j]], inp = j % 2 ? rr : l, out = y - inp; buf[ai[j]] = inp + y * .5; ai[j] = (ai[j] + 1) % buf.length; if (j % 2) rr = out; else l = out; }
      ML[n] += l * .9; MR[n] += rr * .9; } }
  const depth = style === 'afro' ? .3 : .5, tau = .13 * SR; let ki = 0, last = -1e9;
  for (let n = 0; n < N; n++){ while (ki < kicks.length && kicks[ki] <= n){ last = kicks[ki]; ki++; } const g = 1 - depth * Math.exp(-(n - last) / tau); ML[n] = ML[n] * g + K[n]; MR[n] = MR[n] * g + K[n]; }
  let pk = 0; for (let n = 0; n < N; n++) pk = Math.max(pk, Math.abs(ML[n]), Math.abs(MR[n]));
  const kk = 1.3 / (pk || 1), dn = Math.tanh(1.3);
  for (let n = 0; n < N; n++){ ML[n] = Math.tanh(ML[n] * kk) / dn * .82; MR[n] = Math.tanh(MR[n] * kk) / dn * .82; }
  return { L: ML, R: MR, N };
}
// « vrai » : de vrais morceaux en fichiers audio (js/vrais.js), pas fabriqués par le site
const STYLE_DEFS = { house: { label: 'House', bpm: 124, seed: 11 }, techno: { label: 'Techno', bpm: 130, seed: 31 }, afro: { label: 'Afro house', bpm: 120, seed: 47 }, vrai: { label: 'Vraie musique', bpm: 124, seed: 0 } };
const VARIANTS = 4, trackCache = {}, cacheOrder = [];
const SEC_A = [[0, 32, ['k', 'b', 'h', 'cl', 'c', 'lead', 'p']], [32, 64, ['k', 'b', 'h', 'cl', 'p']], [64, 128, ['k', 'b', 'h', 'p']]];
const SEC_B = wb => [[0, 32, wb ? ['k', 'h', 'b'] : ['k', 'h']], [32, 64, wb ? ['k', 'h', 'p', 'b'] : ['k', 'h', 'p']], [64, 128, ['k', 'b', 'h', 'cl', 'c', 'lead', 'p', 'pad']]];
const ch3Cache = {};
let waveTk = null;
function envOf(t){
  const c = t.L, q = Math.round(P * SR / 4), n = Math.floor(c.length / q), full = new Float32Array(n), low = new Float32Array(n), a = 1 - Math.exp(-2 * Math.PI * 150 / SR);
  let y = 0, mf = 1e-9, ml = 1e-9;
  for (let i = 0; i < n; i++){ let s1 = 0, s2 = 0; for (let j = i * q; j < (i + 1) * q; j++){ const x = c[j]; y += a * (x - y); s1 += x * x; s2 += y * y; }
    full[i] = Math.sqrt(s1 / q); low[i] = Math.sqrt(s2 / q); mf = Math.max(mf, full[i]); ml = Math.max(ml, low[i]); }
  for (let i = 0; i < n; i++){ full[i] /= mf; low[i] /= ml; }
  return { full, low };
}
// Calcul des morceaux dans des tâches de fond (Web Workers) pour que la page reste fluide
let workers = null, jobId = 0, workerErr = ''; const jobs = {};
const quiet = m => Object.assign(new Error(m), { silent: true });
function workerPool(){
  if (workers !== null) return workers;
  try {
    const src = `'use strict'; const SR = ${SR}; let P = .5; const n2f = ${n2f.toString()}; const TAU = Math.PI * 2; let KIT = null;
const KEYS = ${JSON.stringify(KEYS)}, PROGS = ${JSON.stringify(PROGS)}, MAJ = new Set(${JSON.stringify([...MAJ])});
${makeRng.toString()}
${buildKit.toString()}
${makeSong.toString()}
onmessage = e => { const d = e.data; P = 60 / d.bpm; const r = makeSong(d.style, d.role, d.seed, d.secs, d.o); postMessage({ id: d.id, L: r.L, R: r.R, N: r.N }, [r.L.buffer, r.R.buffer]); };`;
    const url = URL.createObjectURL(new Blob([src], { type: 'text/javascript' }));
    workers = [0, 1, 2].map(() => { const w = new Worker(url); w.onmessage = e => { const j = jobs[e.data.id]; delete jobs[e.data.id]; if (j) j.res(e.data); };
      w.onerror = ev => { workers = []; workerErr = (ev && ev.message) || 'calcul en arrière-plan indisponible'; ev && ev.preventDefault && ev.preventDefault(); for (const id of Object.keys(jobs)){ const j = jobs[id]; delete jobs[id]; j.rej(quiet('worker')); } slowMode(); }; return w; });
  } catch (e) { workers = []; workerErr = String((e && e.message) || e); slowMode(); }
  return workers;
}
const hasWorkers = () => workerPool().length > 0;
let slowShown = false;
function slowMode(){ if (slowShown) return; slowShown = true;
  setTimeout(() => { try { say('Ton navigateur bloque le calcul en arrière-plan : chaque lancement prendra quelques secondes.'); } catch (e) {} }, 0); }
let rrIdx = 0;
function renderSong(style, role, seed, secs, o = {}, bpm = BPM){
  const pool = workerPool();
  if (!pool.length){ const keep = P; P = 60 / bpm; const r = makeSong(style, role, seed, secs, o); P = keep; return Promise.resolve(r); }
  return new Promise((res, rej) => { const id = ++jobId, a = { id, style, role, seed, secs, o, bpm }; jobs[id] = { res, rej, a }; pool[rrIdx++ % pool.length].postMessage(a); });
}
async function prepareCh3(l){
  BPM = 124; P = 60 / BPM;
  const key = JSON.stringify([l.A, l.B]);
  if (!ch3Cache[key]){
    const [A, B] = await Promise.all([renderSong('house', 'A', 11, l.A, { end: l.aEnd, tail: 4 }, 124), renderSong('house', 'B', 23, l.B, { tail: 2 }, 124)]);
    ch3Cache[key] = { A, B, envA: envOf(A), envB: envOf(B) };
  }
  return ch3Cache[key];
}
