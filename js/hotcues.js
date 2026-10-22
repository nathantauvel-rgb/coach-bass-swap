// Chapitre 6 « Hot cues et boucles » (lot 41) : décider exactement quand et d'où un morceau part, et gagner du temps
// quand les morceaux ne collent pas. Notes en millisecondes, comme au chapitre 5.
// Tous les fichiers de js/ partagent la même portée et sont chargés dans l'ordre indiqué dans index.html.
// Chargé avant niveaux.js (qui lit CH6_LESSONS au chargement) ; les fonctions d'ici ne servent qu'en cours de partie.
'use strict';
/* L'INTERRUPTEUR DU CHAPITRE 6. Tant qu'il est à false, le chapitre n'existe pas pour le joueur : il ne s'affiche
   pas dans la liste des chapitres, il ne compte pas dans le total d'étoiles, et il n'est pas une étape du parcours.
   Le code ci-dessous reste chargé et testable. Mettre true quand les 7 niveaux sont finis et relus (lot 41).
   Choix de l'utilisateur le 22 oct. 2026, au moment de publier le nouveau nom : ne pas montrer un chapitre en chantier. */
const CH6_PRET = false;
/* ---------- Les niveaux ----------
   `hc` décrit le niveau :
     type   : pose (poser un hot cue sur le drop de B), lance (lancer B depuis son hot cue et couper A), sortie (B tourne en
              boucle : en sortir pour que son drop tombe sur la phrase de A), prolonge (A s'arrête trop tôt : boucler sa fin),
              montee (boucle de 16 sur A, raccourcie à 8 puis 4, puis A coupé sur le drop de B), double (le drop de B en même
              temps que celui de A, avec le swap des basses), final (tout ensemble, sans aide)
     quant  : Quantize (repères et boucles rangés sur le temps le plus proche) ; choix de l'utilisateur : allumé aux niveaux
              1 à 4, éteint aux niveaux 5 à 7
     charge : B attend, à l'arrêt, avec son hot cue 1 déjà posé sur son drop (temps 64 de B)
     finA   : A s'arrête là (fin du morceau), sauf s'il tourne en boucle
     aDrop  : A joue un morceau qui a un drop au temps 64 (niveau 6), et B un autre morceau du même style
   Seuils : HC_OK ms d'écart = parfait, HC_ZERO ms ou plus = raté (une note continue entre les deux). */
const HC_OK = 20, HC_ZERO = 150;
const CH6_INIT = { faderA: 1, faderB: 1, lowA: .5, lowB: .5, cfxA: .5, midA: .5, midB: .5 };
const CH6_LESSONS = [
  { kind: 'hc', title: 'Poser un repère', goal: 'Pose le hot cue 1 de B pile sur le premier temps de son drop.',
    how: 'B joue son intro, A est baissé. Quand le drop de B arrive (le bloc « Drop » sur la piste), appuie sur le pad 1 de B, en mode HOT CUE : c’est ton repère. Quantize est allumé : le repère se range sur le temps le plus proche, mais ton appui est noté en millisecondes.',
    show: ['gPadsB'], user: [], autoLaunch: true, launchBeat: 20, bCue: 32, bBass: true, init: Object.assign({}, CH6_INIT, { faderA: .35 }), start: 16, end: 62,
    targets: [[52, 'HOT CUE', 'B']], hc: { type: 'pose', quant: true, cible: 52 } },
  { kind: 'hc', title: 'Lancer depuis le repère', goal: 'Sur la phrase de A, lance B depuis son hot cue et coupe A, au même instant.',
    how: 'Le hot cue 1 de B est posé sur son drop, B attend. Au temps 64 (début de la phrase de A), appuie sur le pad 1 de B : il part directement sur son drop. Dans le même geste, baisse le fader de A d’un coup.',
    show: ['gPadsB', 'gFad'], user: ['faderA'], autoLaunch: false, launchBeat: 64, bCue: 64, bBass: true, init: CH6_INIT, start: 40, end: 76,
    targets: [[64, 'LANCE B', 'B'], [64, 'COUPE A', 'A']], hc: { type: 'lance', quant: true, charge: true, cible: 64 } },
  { kind: 'hc', title: 'B attend en boucle', goal: 'B tourne sur une boucle de 4 temps : sors-en pour que son drop tombe sur la phrase de A.',
    how: 'B tourne sur la dernière mesure de son intro, juste avant son drop. Compte les mesures de A : sors de la boucle (pad 4 « EXIT » en mode BOUCLE) pendant la dernière mesure avant le temps 64. B finit sa mesure et tombe sur son drop pile au début de la phrase.',
    show: ['gPadsB'], user: [], autoLaunch: true, launchBeat: 40, bCue: 60, bBass: true, init: CH6_INIT, start: 36, end: 76,
    targets: [[64, 'DROP B', 'B']], hc: { type: 'sortie', quant: true, boucleB: [60, 64], cible: 64 } },
  { kind: 'hc', title: 'Prolonger l’outro', goal: 'A s’arrête au temps 96, trop tôt pour B : boucle sa fin, puis coupe A sur le drop de B.',
    how: 'Le morceau A finit au temps 96, mais le drop de B n’arrive qu’au temps 104. Avant la fin de A, pose une boucle de 8 temps sur A (pad « 8 » en mode BOUCLE), au début d’une mesure : A tourne au lieu de s’arrêter. Au drop de B (temps 104), baisse le fader de A d’un coup.',
    show: ['gPadsA', 'gFad'], user: ['faderA'], autoLaunch: true, launchBeat: 80, bCue: 40, bBass: true, init: CH6_INIT, start: 72, end: 112,
    blocsA: [[16, 32, true, 'Corps'], [32, 96, false, 'Outro']],
    targets: [[88, 'BOUCLE', 'A'], [104, 'COUPE A', 'A']], hc: { type: 'prolonge', quant: true, finA: 96, boucle: 88, coupe: 104 } },
  { kind: 'hc', title: 'La montée', goal: 'Boucle A sur 16 temps, puis 8, puis 4, et coupe-le pile sur le drop de B. Quantize éteint.',
    how: 'Quantize est éteint : la boucle part exactement quand tu appuies. Temps 64 : boucle de 16 sur A. Temps 80 : raccourcis à 8. Temps 96 : raccourcis à 4, la tension monte. Temps 112 : le drop de B arrive, baisse le fader de A d’un coup.',
    show: ['gPadsA', 'gFad'], user: ['faderA'], autoLaunch: true, launchBeat: 80, bCue: 32, bBass: true, init: CH6_INIT, start: 56, end: 120,
    targets: [[64, '16', 'A'], [80, '8', 'A'], [96, '4', 'A'], [112, 'COUPE A', 'A']], hc: { type: 'montee', quant: false, etapes: [[64, 16], [80, 8], [96, 4]], coupe: 112 } },
  { kind: 'hc', title: 'Le double drop', goal: 'Fais tomber le drop de B en même temps que celui de A, et échange les basses. Quantize éteint.',
    how: 'A arrive sur son drop au temps 64. Le hot cue 1 de B est posé sur son propre drop. Au temps 64, appuie sur le pad 1 de B : les deux drops tombent ensemble. Dans le même geste, échange les basses : LOW de A normal → coupé, LOW de B coupé → normal.',
    show: ['gPadsB', 'gLow'], user: ['lowA', 'lowB'], autoLaunch: false, launchBeat: 64, bCue: 64, bBass: true, init: Object.assign({}, CH6_INIT, { lowB: 0 }), start: 40, end: 80,
    blocsA: [[16, 64, false, 'Intro'], [64, 128, true, 'Drop']],
    targets: [[64, 'LANCE B', 'B'], [64, 'SWAP', 'AB']], hc: { type: 'double', quant: false, charge: true, aDrop: true, cible: 64, swap: 64 } },
  { kind: 'hc', title: 'Sans filet', goal: 'Le final, sans repère : boucle la fin de A, lance B depuis son hot cue sur la phrase et coupe A.',
    how: 'A s’arrête au temps 96. Boucle sa dernière mesure de 8 temps avant la fin, puis, au début de la phrase suivante (temps 104), lance B depuis son hot cue (posé sur son drop) et coupe A dans le même geste. Quantize éteint, et aucun repère sur la piste.',
    show: ['gPadsA', 'gPadsB', 'gFad'], user: ['faderA'], autoLaunch: false, launchBeat: 104, bCue: 64, bBass: true, init: CH6_INIT, start: 72, end: 116, noCount: true,
    blocsA: [[16, 32, true, 'Corps'], [32, 96, false, 'Outro']],
    targets: [[88, 'BOUCLE', 'A'], [104, 'LANCE B', 'B'], [104, 'COUPE A', 'A']], hc: { type: 'final', quant: false, charge: true, finA: 96, boucle: 88, cible: 104, coupe: 104 } }
];
CH6_LESSONS.forEach(l => { l.btn = []; l.caps = []; });

/* ---------- Départ ---------- */
// B chargé à l'arrêt, son hot cue 1 posé sur son drop (comme dans rekordbox avant une soirée)
function hcCharge(k, buf, posCue){
  const d = deck[k]; stop(k);
  Object.assign(d, { buf, per: P, bend: 0, secu: null, boucle: null, cue: posCue, cues: [posCue, null, null, null], ancP: posCue, ancT: ac.currentTime, joue: false, rate: 1 });
}
function hcDepart(demo){
  const l = LESSONS[li], h = l.hc;
  run.hc = { gestes: [], dropAt: null, prevB: null, finFait: false, silence: false, demo: {} };
  plQuantize = h.quant;
  padMode.A = h.type === 'prolonge' || h.type === 'montee' || h.type === 'final' ? 'lp' : 'hc'; padMode.B = h.type === 'sortie' ? 'lp' : 'hc';
  if (h.charge) hcCharge('B', run.bBuf, 64 * P);
  else { launchAt(l.launchBeat);
    if (h.boucleB){ const d = deck.B, [s, e] = h.boucleB; d.boucle = { s: s * P, e: e * P, temps: e - s }; if (d.node){ d.node.loopStart = d.boucle.s; d.node.loopEnd = d.boucle.e; d.node.loop = true; } } }
  renderPads('A'); renderPads('B');
}

/* ---------- Les pads, pendant une partie du chapitre 6 ----------
   Les pads de l'écran (padPresse) et ceux de la FLX4 (flx4Plus) passent par ici : on note l'instant entendu de chaque geste.
   mode : 'hc' (hot cue n), 'lp' (boucle : n = 0, 1, 2 pour 4, 8, 16 temps, 3 pour la sortie), 'efface' (hot cue n effacé). */
const hcMs = beats => beats * P * 1000;
function hcPad(k, mode, i){
  if (!run || !run.hc || !groupeAllume('gPads' + k)) return;
  ensureAudio(); const l = LESSONS[li], h = l.hc, d = deck[k], hb = heardBeat(), b = beatNow(); let res = 'rien';
  padMode[k] = mode === 'efface' ? 'hc' : mode;
  if (mode === 'efface'){ plHotCueEfface(k, i); res = 'efface'; }
  else if (mode === 'hc'){
    // niveau 1 : une fois le repère posé, un nouvel appui ne fait pas sauter B (on ne mélange pas les deux gestes)
    if (h.type === 'pose' && d.cues[i] != null) res = 'deja';
    else { res = plHotCue(k, i) || 'rien';
      if (res === 'saut' && k === 'B' && run.launch === null){ run.launch = b; run.lowBAtLaunch = ctrl.lowB; $('launchB').disabled = true; } }
  } else { const t = PAD_BOUCLES[i];
    if (t){ plBoucle(k, t); res = 'boucle'; }
    else { const avait = !!d.boucle; plSortie(k); res = avait ? 'sortie' : 'rien';
      // B sort de sa boucle d'attente : on redessine la piste là où son drop va vraiment tomber
      if (avait && k === 'B' && h.type === 'sortie'){ const reste = (64 * P - plPos('B')) / P; if (reste >= 0) run.launch = b + reste - (64 - l.bCue); } } }
  run.hc.gestes.push({ k, mode, i, hb, b, res, s: d.boucle ? d.boucle.s / P : null, t: d.boucle ? d.boucle.temps : null, cue: d.cues ? d.cues[i] : null });
  hcStatut(res, hb);
  renderPads(k);
}
// Le repère du geste sur la piste passe au vert (ou à l'orange) dès qu'il est fait
function hcStatut(res, hb){
  const tg = LESSONS[li].targets.find(([v, lab]) => !run.status[lab] && Math.abs(hb - v) <= 4 && ((res === 'pose' && lab === 'HOT CUE') || (res === 'saut' && lab === 'LANCE B') || (res === 'boucle' && (lab === 'BOUCLE' || /^\d+$/.test(lab)))));
  if (!tg) return; const ms = Math.abs(hcMs(hb - tg[0]));
  run.status[tg[1]] = ms <= 60 ? 'ok' : 'mid';
  if (!run.demo) pop(ms <= HC_OK * 2 ? `Pile ! (${Math.round(ms)} ms)` : `${Math.round(ms)} ms ${hb > tg[0] ? 'en retard' : 'trop tôt'}`, ms <= 60 ? 'ok' : 'mid');
}

/* ---------- Pendant la partie ---------- */
function hcFrame(b){
  const l = LESSONS[li], h = l.hc;
  // B sort de sa boucle d'attente : l'instant où il passe son temps 64 (son drop)
  if (h.type === 'sortie' && deck.B.joue){ const p = plPos('B');
    // la position de B et le temps de A sont lus à la même horloge : pas de correction de sortie ici
    if (run.hc.prevB != null && run.hc.prevB < 64 * P && p >= 64 * P && run.hc.dropAt == null){ run.hc.dropAt = b;
      const e = run.hc.dropAt - 64; run.status['DROP B'] = Math.abs(e) < .5 ? 'ok' : 'mid';
      if (!run.demo) pop(Math.abs(e) < .5 ? 'Le drop de B tombe sur la phrase !' : `Le drop est tombé ${Math.round(Math.abs(e))} temps ${e > 0 ? 'trop tard' : 'trop tôt'}`, Math.abs(e) < .5 ? 'ok' : 'mid'); }
    run.hc.prevB = p; }
  // A arrive au bout de son morceau : s'il ne tourne pas en boucle, il s'arrête (silence)
  if (h.finA && !run.hc.finFait && deck.A.joue && !deck.A.boucle && plPos('A') >= h.finA * P - .01){ run.hc.finFait = true; run.hc.silence = ctrl.faderA > .1; stop('A');
    if (!run.demo && run.hc.silence) pop('A est arrivé au bout : silence ! Il fallait boucler sa fin.', 'bad'); }
  if (run.demo) hcDemo(heardBeat());   // la démo agit sur le temps entendu, comme un joueur
  if (l.noCount){ showAction('Écoute, compte les mesures, et agis au bon moment.'); return; }
  const tg = l.targets.find(([v, lab]) => v > b - .5 && !run.status[lab]);
  if (!tg){ showAction('Écoute le résultat…'); return; }
  const n = Math.max(0, Math.ceil(tg[0] - b)), what = { 'HOT CUE': 'pose le hot cue 1 de B', 'LANCE B': 'lance B depuis son hot cue', 'COUPE A': 'coupe A', 'DROP B': 'le drop de B (sors de la boucle avant)',
    'BOUCLE': 'boucle la fin de A (pad 8)', '16': 'boucle de 16 sur A', '8': 'raccourcis la boucle à 8', '4': 'raccourcis à 4', 'SWAP': 'échange les basses' }[tg[1]] || tg[1];
  const same = l.targets.filter(t => t[0] === tg[0] && !run.status[t[1]]).map(t => ({ 'LANCE B': 'lance B depuis son hot cue', 'COUPE A': 'coupe A', 'SWAP': 'échange les basses' }[t[1]] || what));
  const txt = [...new Set(same)].join(' et ');
  showAction(n > 8 ? 'Écoute, et prépare-toi.' : n <= 1 ? `Maintenant : ${txt} !` : `Dans ${n} temps : ${txt}.`);
}
// La démo : chaque geste pile au bon temps
function hcDemo(b){
  const h = LESSONS[li].hc, f = run.hc.demo, une = (cle, quand, faire) => { if (!f[cle] && b >= quand){ f[cle] = 1; faire(); } };
  const coupe = at => une('coupe', at, () => { ctrl.faderA = 0; applyCtrl(); });
  if (h.type === 'pose') une('pose', h.cible, () => hcPad('B', 'hc', 0));
  if (h.type === 'lance' || h.type === 'double') une('lance', h.cible, () => hcPad('B', 'hc', 0));
  if (h.type === 'lance') coupe(h.cible);
  if (h.type === 'double') une('swap', h.swap, () => { ctrl.lowA = 0; ctrl.lowB = .5; applyCtrl(); });
  if (h.type === 'sortie') une('sortie', 61, () => hcPad('B', 'lp', 3));
  if (h.type === 'prolonge' || h.type === 'final') une('boucle', h.boucle, () => hcPad('A', 'lp', 1));
  if (h.type === 'prolonge') coupe(h.coupe);
  if (h.type === 'final'){ une('lance', h.cible, () => hcPad('B', 'hc', 0)); coupe(h.coupe); }
  if (h.type === 'montee'){ h.etapes.forEach(([at, t]) => une('m' + at, at, () => hcPad('A', 'lp', PAD_BOUCLES.indexOf(t)))); coupe(h.coupe); }
}

/* ---------- Ce qu'on voit sur la piste ----------
   La boucle en cours (A ou B), la fin du morceau A, et le hot cue qui attend sur B. */
function hcDessine(g, X, b, yA, yB, H, w, hitX){
  const l = LESSONS[li], h = l.hc;
  const boucle = (k, y) => { const d = deck[k]; if (!run || !d.boucle) return;
    g.save(); g.fillStyle = k === 'A' ? COL.a : COL.b; g.globalAlpha = .9; rr(g, hitX + 2, y, w - hitX - 4, H, H / 2); g.fill(); g.globalAlpha = 1;
    g.fillStyle = COL.ink; g.font = '800 13px ' + COL.font; g.textAlign = 'left'; g.fillText(`↻ Boucle de ${d.boucle.temps} temps`, hitX + 16, y + 28); g.restore(); };
  if (h.finA && !(run && deck.A.boucle) && !(run && run.hc && run.hc.finFait)){ const x = X(h.finA); if (x > hitX - 40 && x < w){ g.save(); g.strokeStyle = COL.bad; g.lineWidth = 3; g.beginPath(); g.moveTo(x, yA - 6); g.lineTo(x, yA + H + 6); g.stroke();
    g.fillStyle = COL.bad; g.font = '800 12px ' + COL.font; g.textAlign = 'left'; g.fillText('FIN DE A', x + 6, yA - 8); g.restore(); } }
  if (run && run.hc && run.hc.silence){ g.save(); g.fillStyle = COL.bad; g.font = '800 13px ' + COL.font; g.textAlign = 'left'; g.fillText('A s’est arrêté : silence', hitX + 16, yA + 28); g.restore(); }
  boucle('A', yA); boucle('B', yB);
  if (h.charge && (!run || run.launch === null)){ g.save(); g.fillStyle = COL.b; g.font = '800 12px ' + COL.font; g.textAlign = 'left';
    g.fillText('B attend · hot cue 1 posé sur son drop', 54, yB - 10); g.restore(); }
}

/* ---------- La note ---------- */
const hcVal = ms => clamp01(1 - (Math.abs(ms) - HC_OK) / (HC_ZERO - HC_OK));
const hcLigne = (ms, ok, rate) => { const v = hcVal(ms), a = Math.round(Math.abs(ms)); return [v >= .9 ? 'ok' : v >= .4 ? 'mid' : 'bad', v >= .9 ? ok(a) : rate(a, ms > 0 ? 'en retard' : 'trop tôt'), v]; };
function hcEval(r){
  const l = LESSONS[li], h = l.hc, G = r.hc.gestes, out = [];
  const premier = (k, res) => G.find(x => x.k === k && x.res === res);
  const coupeA = at => { const c = firstAt(r.frames, at - 8, x => x.fa < .1);
    out.push(c == null ? ['bad', `A n’a pas été coupé : baisse son fader d’un coup au temps ${at}.`, 0] : hcLigne(hcMs(c - at), a => `A coupé pile au temps ${at} (${a} ms).`, (a, s) => `A coupé ${a} ms ${s} (vise le temps ${at}).`)); };
  const lanceB = at => { const g = premier('B', 'saut');
    out.push(!g ? ['bad', `Tu n’as pas lancé B : appuie sur son pad 1 (hot cue) au temps ${at}.`, 0] : hcLigne(hcMs(g.hb - at), a => `B lancé depuis son hot cue pile sur le temps ${at} (${a} ms).`, (a, s) => `B lancé ${a} ms ${s}.`)); };
  if (h.type === 'pose'){ const g = premier('B', 'pose');
    if (!g) return [['bad', 'Tu n’as pas posé de hot cue : appuie sur le pad 1 de B quand son drop arrive.', 0]];
    out.push(hcLigne(hcMs(g.hb - h.cible), a => `Appui pile sur le drop (${a} ms).`, (a, s) => `Appui ${a} ms ${s} par rapport au drop.`));
    const t = g.cue == null ? null : Math.round(g.cue / P - 64);
    out.push(t === 0 ? ['ok', 'Le repère est sur le premier temps du drop.', 1] : ['bad', `Le repère est ${Math.abs(t)} temps ${t > 0 ? 'après' : 'avant'} le drop : écoute le moment où tout entre.`, 0]); }
  if (h.type === 'lance'){ lanceB(h.cible); coupeA(h.cible); }
  if (h.type === 'sortie'){ const e = r.hc.dropAt == null ? null : r.hc.dropAt - h.cible;
    out.push(e == null ? ['bad', 'B n’est jamais sorti de sa boucle : sors-en (EXIT) pendant la dernière mesure avant le temps 64.', 0]
      : Math.abs(e) < .5 ? ['ok', 'Le drop de B est tombé pile sur la phrase de A.', 1]
      : ['bad', `Le drop de B est tombé ${Math.round(Math.abs(e))} temps ${e > 0 ? 'trop tard' : 'trop tôt'} : sors de la boucle pendant la dernière mesure avant la phrase (entre les temps 60 et 64).`, Math.abs(Math.round(e)) === 4 ? .3 : 0]); }
  if (h.type === 'prolonge' || h.type === 'final'){ const g = premier('A', 'boucle');
    if (!g || r.hc.silence) out.push(['bad', r.hc.silence ? 'A est arrivé au bout de son morceau : silence. Boucle sa fin avant le temps 96.' : 'Tu n’as pas bouclé A.', 0]);
    else if (h.quant){ const sur = Math.abs(g.s - Math.round(g.s / 4) * 4) < .01; out.push(sur ? ['ok', `Boucle de ${g.t} temps posée au début d’une mesure (temps ${Math.round(g.s)}) : A ne s’arrête pas.`, 1] : ['mid', `Boucle posée au temps ${fr1(g.s)}, pas au début d’une mesure : ça boite.`, .5]); }
    else out.push(hcLigne(hcMs(g.hb - h.boucle), a => `Boucle posée pile au temps ${h.boucle} (${a} ms) : A ne s’arrête pas.`, (a, s) => `Boucle posée ${a} ms ${s} : on entend le raccord.`));
    if (h.type === 'final') lanceB(h.cible);
    coupeA(h.coupe); }
  if (h.type === 'montee'){
    for (const [at, t] of h.etapes){ const g = G.filter(x => x.k === 'A' && x.res === 'boucle' && x.t === t).sort((x, y) => Math.abs(x.hb - at) - Math.abs(y.hb - at))[0];
      out.push(!g ? ['bad', `Pas de boucle de ${t} temps (au temps ${at}).`, 0] : hcLigne(hcMs(g.hb - at), a => `Boucle de ${t} pile au temps ${at} (${a} ms).`, (a, s) => `Boucle de ${t} ${a} ms ${s}.`)); }
    coupeA(h.coupe); }
  if (h.type === 'double'){ lanceB(h.cible); xRun = true; out.push(...evalSwap(r.frames)); }
  return out;
}
// Étoiles : la moyenne des gestes, comme le Mode Expert (90 → 3, 60 → 2)
function hcEtoiles(items){ const s = items.reduce((t, x) => t + x[2], 0) / (items.length || 1); return s >= .9 ? 3 : s >= .6 ? 2 : 1; }
