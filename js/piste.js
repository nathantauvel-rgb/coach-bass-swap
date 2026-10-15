// Piste qui défile, comparaison des gestes, bulles et confettis.
// Tous les fichiers de js/ partagent la même portée et sont chargés dans l'ordre indiqué dans index.html.
'use strict';
/* ---------- Piste qui défile ---------- */
const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
const tok = n => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
const COL = {}; const loadCol = () => { for (const k of ['a', 'b', 'fg', 'muted', 'line', 'panel', 'panel-2', 'ok', 'mid', 'bad', 'xp', 'bg', 'ink', 'on-fg']) COL[k] = tok('--' + k); COL.font = tok('--sans'); COL.disp = tok('--display'); };
// Couleur nommée (#rrggbb) rendue transparente, pour les dégradés du canvas
const hexA = (hex, a) => { const m = /^#([0-9a-f]{6})$/i.exec(hex); return m ? `rgba(${parseInt(m[1].slice(0, 2), 16)},${parseInt(m[1].slice(2, 4), 16)},${parseInt(m[1].slice(4, 6), 16)},${a})` : hex; };
function rr(g, x, y, w, h, r){ g.beginPath(); if (g.roundRect) g.roundRect(x, y, w, h, r); else g.rect(x, y, w, h); }
function drawHighway(b){
  if (!COL.a) loadCol();
  const cv = $('hw'), g = cv.getContext('2d'), dpr = window.devicePixelRatio || 1, w = cv.clientWidth, h = cv.clientHeight;
  if (cv.width !== Math.round(w * dpr) || cv.height !== Math.round(h * dpr)){ cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr); }
  g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, w, h);
  const hitX = Math.max(90, w * .22), ppb = (w - hitX) / 22, X = v => hitX + (v - b) * ppb;
  const yA = 54, yB = 136, H = 46;
  // repères de temps
  for (let v = Math.floor(b - hitX / ppb) - 1; v <= b + 24; v++){
    if (v < START - 4 || v > END + 4) continue; const x = X(v), ph = v % 32 === 0, bar = v % 4 === 0;
    g.strokeStyle = ph ? COL.muted : COL.line; g.globalAlpha = ph ? .9 : bar ? .55 : .22; g.lineWidth = ph ? 2 : 1;
    g.beginPath(); g.moveTo(x, 26); g.lineTo(x, h - 8); g.stroke(); g.globalAlpha = 1;
  }
  const fit = (t, max) => { if (g.measureText(t).width <= max) return t; while (t.length > 1 && g.measureText(t + '…').width > max) t = t.slice(0, -1); return t + '…'; };
  const block = (from, to, y, col, strong, label) => { const a = X(from), z = X(to); if (z < 0 || a > w) return;
    g.globalAlpha = strong ? .9 : .28; g.fillStyle = col; rr(g, a + 1, y, z - a - 2, H, H / 2); g.fill(); g.globalAlpha = 1;
    const lx = Math.max(a + 12, 52), room = Math.min(z, w) - lx - 12; g.font = '600 13px ' + COL.font;
    if (room > 46){ g.fillStyle = strong ? COL.ink : COL.fg; g.textAlign = 'left'; g.fillText(fit(label, room), lx, y + 28); } };
  const l = LESSONS[li], L = run && run.launch !== null ? run.launch : (l.autoLaunch ? l.launchBeat : null);
  if (l.wave){
    const v0 = b - hitX / ppb - 1, v1 = b + 24;
    const wave = (env, y, col, off, alpha) => { const bw = Math.max(1, ppb / 4 - 1);
      for (let q = Math.max(0, Math.floor((v0 - off) * 4)); q < env.full.length; q++){ const v = q / 4 + off; if (v > v1) break; const x = X(v);
        const hf = env.full[q] * (H + 8), hl = env.low[q] * (H + 8) * .6;
        g.globalAlpha = alpha; g.fillStyle = col; g.fillRect(x, y + H / 2 - hf / 2, bw, hf);
        g.globalAlpha = alpha * .7; g.fillStyle = COL.fg; g.fillRect(x, y + H / 2 - hl / 2, bw, hl); }
      g.globalAlpha = 1; };
    g.fillStyle = COL.muted; g.font = '600 12px ' + COL.font; g.textAlign = 'left';
    if (waveTk){ wave(waveTk.envA, yA, COL.a, 0, .95);
      if (L !== null) wave(waveTk.envB, yB, COL.b, L, .95);
      else { wave(waveTk.envB, yB, COL.b, b, .32); g.fillStyle = COL.b; g.fillText('B si tu le lances maintenant', 8, yB + H + 18); } }
    else { g.fillText('Préparation des formes d\'onde…', 12, yA + 28); }
  } else {
  block(16, 32, yA, COL.a, true, 'Corps'); block(32, 128, yA, COL.a, false, 'Outro');
  if (L !== null){ if (l.bCue >= 64){ block(L, L + 160, yB, COL.b, true, 'Drop'); } else if (l.bCue){ block(L, L + 64 - l.bCue, yB, COL.b, false, 'Fin d\'intro'); block(L + 64 - l.bCue, L + 160, yB, COL.b, true, 'Drop'); } else { block(L, L + 64, yB, COL.b, false, l.bBass ? 'Intro (avec basse)' : 'Intro'); block(L + 64, L + 160, yB, COL.b, true, 'Drop'); } }
  else if (!(run ? run.expert : expertOn())){ const a = X(l.launchBeat); g.setLineDash([6, 5]); g.strokeStyle = COL.b; g.lineWidth = 2; rr(g, a + 1, yB, X(l.launchBeat + 64) - a - 2, H, H / 2); g.stroke(); g.setLineDash([]);
    if (a < w - 60){ g.fillStyle = COL.b; g.font = '600 13px ' + COL.font; g.textAlign = 'left'; g.fillText('B partira ici', Math.max(a + 30, 8), yB + 28); } }
  }
  // gestes à faire
  // Brouillard « à l'oreille » ; en Expert, pas de brouillard mais aucun repère ni « B partira ici »
  const fog = run && run.ear, hide = fog || (run ? !!run.expert : expertOn());
  if (fog){ g.save(); const gr = g.createLinearGradient(hitX + 6, 0, hitX + 90, 0); gr.addColorStop(0, hexA(COL['panel-2'], 0)); gr.addColorStop(1, hexA(COL['panel-2'], .93)); g.fillStyle = gr; g.fillRect(hitX + 6, 0, w, h);
    g.font = '700 13px ' + COL.font; const tx = 'Repères masqués : écoute', tw = g.measureText(tx).width + 24; g.fillStyle = COL.fg; rr(g, w - tw - 12, 12, tw, 26, 13); g.fill(); g.fillStyle = COL['on-fg']; g.textAlign = 'left'; g.fillText(tx, w - tw, 30); g.restore(); }
  for (const [v, lab, lane] of LESSONS[li].targets){
    if (hide && !(run && run.status[lab])) continue;
    if (l.wave && !(run && run.demo)) continue;
    const x = X(v); if (x < -80 || x > w + 80) continue;
    const st = run ? run.status[lab] : null, col = st === 'ok' ? COL.ok : st === 'mid' ? COL.mid : st === 'bad' || st === 'late' ? COL.bad : COL.xp;
    const y = lane === 'A' ? yA + H / 2 : lane === 'B' ? yB + H / 2 : (yA + yB + H) / 2;
    g.save(); g.shadowColor = 'rgba(27,31,51,.25)'; g.shadowBlur = 0; g.shadowOffsetY = 3; g.fillStyle = col;
    g.beginPath(); g.arc(x, y, 16, 0, Math.PI * 2); g.fill(); g.lineWidth = 4; g.strokeStyle = COL.panel; g.stroke(); g.restore();
    g.fillStyle = COL.ink; g.font = '800 15px ' + COL.font; g.textAlign = 'center'; g.fillText(st === 'ok' ? '✓' : st ? '!' : '◆', x, y + 5);
    g.fillStyle = col; g.font = '800 13px ' + COL.disp; g.fillText(lab, x, lane === 'A' ? 18 : yB + H + 18);
  }
  // ligne de frappe
  g.save(); g.strokeStyle = COL.fg; g.lineWidth = 3;
  g.beginPath(); g.moveTo(hitX, 8); g.lineTo(hitX, h - 26); g.stroke(); g.restore();
  g.font = '800 11px ' + COL.font; const mw = g.measureText('MAINTENANT').width + 16; g.fillStyle = COL.fg; rr(g, hitX - mw / 2, h - 24, mw, 20, 10); g.fill();
  g.fillStyle = COL['on-fg']; g.textAlign = 'center'; g.fillText('MAINTENANT', hitX, h - 10);
  // couloirs nommés (sur une marge qui masque ce qui défile dessous)
  g.fillStyle = COL['panel-2']; g.fillRect(0, 0, 44, h - 28);
  for (const [y, lab, col] of [[yA, 'A', COL.a], [yB, 'B', COL.b]]){ g.fillStyle = COL.panel; g.beginPath(); g.arc(22, y + H / 2, 15, 0, Math.PI * 2); g.fill();
    g.fillStyle = col; g.beginPath(); g.arc(22, y + H / 2, 12, 0, Math.PI * 2); g.fill(); g.fillStyle = COL.ink; g.font = '800 14px ' + COL.disp; g.textAlign = 'center'; g.fillText(lab, 22, y + H / 2 + 5); }
}
const SHORT = { midA: 'MID A', faderA: 'Fader A', faderB: 'Fader B', lowA: 'LOW A', lowB: 'LOW B', cfxA: 'CFX A', echo: 'Écho' };
const FK = { midA: 'ma', faderA: 'fa', faderB: 'fb', lowA: 'la', lowB: 'lb', cfxA: 'ca', echo: 'ec' };
let cmpLast = null;   // dernier schéma demandé, redessiné quand on ouvre « Voir mon geste »
function drawCompare(fr, i, launch){
  cmpLast = [fr, i, launch];
  if (!COL.a) loadCol();
  const lanes = LESSONS[i].user.slice().concat(LESSONS[i].btn), showLaunch = !LESSONS[i].autoLaunch, cv = $('cmp');
  const H = 10 + (showLaunch ? 46 : 0) + lanes.length * 58 + 18; cv.style.height = H + 'px';
  const dpr = window.devicePixelRatio || 1, w = cv.clientWidth; cv.width = Math.round(w * dpr); cv.height = Math.round(H * dpr);
  const g = cv.getContext('2d'); g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, w, H);
  const L0 = 66, X = v => L0 + (v - START) / (END - START) * (w - L0 - 10);
  for (const v of [32, 64, 96]){ g.strokeStyle = COL.line; g.lineWidth = 1; g.beginPath(); g.moveTo(X(v), 6); g.lineTo(X(v), H - 16); g.stroke();
    g.fillStyle = COL.muted; g.font = '500 11px ' + COL.font; g.textAlign = 'center'; g.fillText('temps ' + v, X(v), H - 3); }
  let y = 10;
  const label = (t, yy) => { g.fillStyle = COL.muted; g.font = '600 12px ' + COL.font; g.textAlign = 'left'; g.fillText(t, 6, yy); };
  if (showLaunch){
    label('Lancer B', y + 22);
    const yy = y + 18, dia = (x, fill, col) => { g.beginPath(); g.moveTo(x, yy - 10); g.lineTo(x + 10, yy); g.lineTo(x, yy + 10); g.lineTo(x - 10, yy); g.closePath(); if (fill){ g.fillStyle = col; g.fill(); } else { g.strokeStyle = col; g.lineWidth = 2; g.setLineDash([3, 3]); g.stroke(); g.setLineDash([]); } };
    dia(X(LESSONS[i].launchBeat), false, COL.fg);
    if (launch !== null){ dia(X(launch), true, COL.b); if (launch !== LESSONS[i].launchBeat){ g.fillStyle = COL.b; g.font = '600 12px ' + COL.font; g.textAlign = 'center'; const e = launch - LESSONS[i].launchBeat; g.fillText(Number.isInteger(launch) ? `toi : ${Math.abs(e)} temps trop ${e > 0 ? 'tard' : 'tôt'}` : `toi : ${Math.abs(msOf(e))} ms trop ${e > 0 ? 'tard' : 'tôt'}`, X(launch), yy + 26); } }
    else { g.fillStyle = COL.bad; g.font = '600 12px ' + COL.font; g.textAlign = 'left'; g.fillText('pas lancé', X(LESSONS[i].launchBeat) + 16, yy + 4); }
    y += 46;
  }
  for (const k of lanes){
    const top = y, bot = y + 44, Y = v => bot - v * 40;
    label(SHORT[k], top + 26);
    g.fillStyle = COL['panel-2']; g.globalAlpha = .5; g.fillRect(L0, top, w - L0 - 10, 44); g.globalAlpha = 1;
    g.strokeStyle = COL.fg; g.lineWidth = 2; g.setLineDash([5, 4]); g.beginPath();
    for (let b = START; b <= END; b += .5){ const yv = Y(ideal(k, b, i)); b === START ? g.moveTo(X(b), yv) : g.lineTo(X(b), yv); } g.stroke(); g.setLineDash([]);
    g.strokeStyle = k === 'echo' ? COL.xp : k.endsWith('A') ? COL.a : COL.b; g.lineWidth = 3; g.lineJoin = 'round'; g.beginPath();
    fr.forEach((f, j) => { const yv = Y(f[FK[k]]); j ? g.lineTo(X(f.b), yv) : g.moveTo(X(f.b), yv); }); g.stroke();
    y += 58;
  }
  $('cmpBox').hidden = false;
}
function say(t){ const el = $('tip'); if (el && t) el.textContent = t; const h = $('hint'); if (h && t && run && h.textContent !== t) h.textContent = t; }
function pop(text, kind){ lastPopAt = performance.now(); lastAct = ''; say(text); const d = document.createElement('div'); d.className = 'pop ' + kind; d.textContent = text; $('pops').appendChild(d); setTimeout(() => d.remove(), 1400); }
function chime(good){
  if (!ac) return; const t = ac.currentTime;
  (good ? [1046.5, 1568] : [784]).forEach((f, i) => { const o = ac.createOscillator(), gg = ac.createGain(); o.type = 'sine'; o.frequency.value = f;
    gg.gain.setValueAtTime(0, t + i * .07); gg.gain.linearRampToValueAtTime(.08, t + i * .07 + .01); gg.gain.exponentialRampToValueAtTime(.0001, t + i * .07 + .35);
    o.connect(gg); gg.connect(master); o.start(t + i * .07); o.stop(t + i * .07 + .4); });
}
function confetti(n){
  if (REDUCED) return; if (!COL.a) loadCol();
  const cv = $('confetti'), g = cv.getContext('2d'), dpr = window.devicePixelRatio || 1; cv.width = innerWidth * dpr; cv.height = innerHeight * dpr; g.setTransform(dpr, 0, 0, dpr, 0, 0);
  const cols = [COL.a, COL.b, COL.xp, COL.mid, COL.ok];
  const ps = [...Array(n)].map(() => ({ x: innerWidth / 2 + (Math.random() - .5) * 200, y: innerHeight * .45, vx: (Math.random() - .5) * 14, vy: -Math.random() * 14 - 4, r: Math.random() * 6 + 4, c: cols[Math.floor(Math.random() * cols.length)], a: Math.random() * 6, va: (Math.random() - .5) * .4 }));
  let t = 0; const step = () => { t++; g.clearRect(0, 0, innerWidth, innerHeight);
    for (const p of ps){ p.vy += .35; p.vx *= .99; p.x += p.vx; p.y += p.vy; p.a += p.va; g.save(); g.translate(p.x, p.y); g.rotate(p.a); g.fillStyle = p.c; g.fillRect(-p.r / 2, -p.r / 4, p.r, p.r / 2); g.restore(); }
    if (t < 150) requestAnimationFrame(step); else g.clearRect(0, 0, innerWidth, innerHeight); };
  step();
}
$('cmpBox').addEventListener('toggle', () => { if ($('cmpBox').open && cmpLast) drawCompare(...cmpLast); });
