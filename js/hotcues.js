// Chapitre 6 « Hot cues et boucles » (lot 41) : décider exactement quand et d'où un morceau part, et gagner du temps
// quand les morceaux ne collent pas. Notes en millisecondes, comme au chapitre 5.
// Tous les fichiers de js/ partagent la même portée et sont chargés dans l'ordre indiqué dans index.html.
// Chargé avant niveaux.js (qui lit CH6_LESSONS au chargement) ; les fonctions d'ici ne servent qu'en cours de partie.
'use strict';
/* L'INTERRUPTEUR DU CHAPITRE 6. Tant qu'il est à false, le chapitre n'existe pas pour le joueur : il ne s'affiche
   pas dans la liste des chapitres, il ne compte pas dans le total d'étoiles, et il n'est pas une étape du parcours.
   Le code ci-dessous reste chargé et testable. Mettre true quand les 7 niveaux sont finis et relus (lot 41).
   Choix de l'utilisateur le 22 oct. 2026, au moment de publier le nouveau nom : ne pas montrer un chapitre en chantier. */
const CH6_PRET = true;
/* ---------- Les niveaux ----------
   `hc` décrit le niveau :
     type   : pose (poser un hot cue sur le drop de B), lance (lancer B depuis son hot cue et couper A), sortie (B tourne en
              boucle : en sortir pour que son drop tombe sur la phrase de A), prolonge (A s'arrête trop tôt : boucler sa fin),
              montee (boucle de 16 sur A, raccourcie à 8 puis 4, puis A coupé sur le drop de B), double (le drop de B en même
              temps que celui de A, avec le swap des basses), final (tout ensemble, sans aide)
     quant  : Quantize (repères et boucles rangés sur le temps le plus proche) ; choix de l'utilisateur : allumé aux niveaux
              1 à 4, éteint aux niveaux 5 à 7
     charge : B attend, à l'arrêt, avec son hot cue 1 déjà posé sur son drop (temps 64 de B)
     finA   : A s'arrête là (fin du morceau) ; une boucle qui finit avant le fait tourner, une boucle qui dépasse s'arrête aussi
     aDrop  : A joue un morceau qui a un drop au temps 64 (niveau 6), et B un autre morceau du même style et des mêmes accords
   `plan` : les gestes de l'encadré « Pendant le niveau » ; `caps` : les légendes de la démo.
   Seuils : HC_OK ms d'écart = parfait, HC_ZERO ms ou plus = raté (une note continue entre les deux). */
const HC_OK = 20, HC_ZERO = 150;
const CH6_INIT = { faderA: 1, faderB: 1, lowA: .5, lowB: .5, cfxA: .5, midA: .5, midB: .5 };
const CH6_LESSONS = [
  { kind: 'hc', title: 'Poser un repère', goal: 'Pose le hot cue 1 de B pile sur le premier temps de son drop.',
    how: 'B joue la fin de son intro, A est baissé. Quand le drop de B arrive (le bloc « Drop » sur la piste), appuie sur le pad 1 de B, en mode HOT CUE : c’est ton repère. Quantize est allumé : le repère se range sur le temps le plus proche, mais ton appui est noté en millisecondes.',
    show: ['gPadsB'], user: [], autoLaunch: true, launchBeat: 36, bCue: 48, bBass: true, init: Object.assign({}, CH6_INIT, { faderA: .35 }), start: 36, end: 60,
    targets: [[52, 'HOT CUE', 'B']], hc: { type: 'pose', quant: true, cible: 52 },
    plan: ['Écoute la fin de l’intro de B (A est baissé)', 'Au premier temps du drop de B : pad 1 de B, en mode HOT CUE'],
    caps: [[36, 'B démarre : écoute la fin de son intro'], [48, 'Le drop de B approche'], [52, 'Pad 1 de B sur le drop : le repère est posé'], [56, 'Ce repère servira à lancer B pile sur son drop']] },
  { kind: 'hc', title: 'Lancer depuis le repère', goal: 'Sur la phrase de A, lance B depuis son hot cue et coupe A, au même instant.',
    how: 'Le hot cue 1 de B est posé sur son drop, B attend. Au temps 64 (début de la phrase de A), appuie sur le pad 1 de B : il part directement sur son drop. Dans le même geste, baisse le fader de A d’un coup.',
    show: ['gPadsB', 'gFad'], user: ['faderA'], autoLaunch: false, launchBeat: 64, bCue: 64, bBass: true, init: CH6_INIT, start: 48, end: 72,
    targets: [[64, 'LANCE B', 'B'], [64, 'COUPE A', 'A']], hc: { type: 'lance', quant: true, charge: true, cible: 64 },
    plan: ['B attend, arrêté sur son hot cue 1 (son drop)', 'Au temps 64 : pad 1 de B, et fader de A en haut → en bas d’un coup, dans le même geste'],
    caps: [[52, 'B attend, arrêté sur son hot cue 1'], [60, 'Prépare tes deux mains'], [64, 'Pad 1 de B et A coupé : B part directement sur son drop'], [68, 'Pas d’intro : la transition est nette']] },
  { kind: 'hc', title: 'B attend en boucle', goal: 'B tourne sur une boucle de 4 temps : sors-en pour que son drop tombe sur la phrase de A.',
    how: 'B tourne sur la dernière mesure de son intro, juste avant son drop. Compte les mesures de A : sors de la boucle (pad 4 « EXIT » en mode BOUCLE) pendant la dernière mesure avant le temps 64. B finit sa mesure et tombe sur son drop pile au début de la phrase. Au temps 64, A se coupe tout seul.',
    show: ['gPadsB'], user: [], autoLaunch: true, launchBeat: 48, bCue: 60, bBass: false, init: CH6_INIT, start: 48, end: 72,
    targets: [[60, 'EXIT', 'B'], [64, 'DROP B', 'B']], hc: { type: 'sortie', quant: true, boucleB: [60, 64], cible: 64 },
    plan: ['B tourne sur une boucle de 4 temps (pads de B en mode BOUCLE)', 'Entre les temps 60 et 64 : pad EXIT de B, pour sortir de la boucle', 'B finit sa mesure et tombe sur son drop au temps 64'],
    caps: [[48, 'B tourne sur la dernière mesure de son intro'], [56, 'Compte les mesures de A'], [60, 'Dernière mesure avant la phrase : on sort de la boucle'], [64, 'B finit sa mesure et tombe sur son drop'], [68, 'A se coupe tout seul : ici, seul le drop de B compte']] },
  { kind: 'hc', title: 'Prolonger l’outro', goal: 'A s’arrête au temps 96, trop tôt pour B : boucle sa fin, puis coupe A sur le drop de B.',
    how: 'Le morceau A finit au temps 96, mais le drop de B n’arrive qu’au temps 104. Avant la fin de A, pose une boucle de 8 temps sur A (pad « 8 » en mode BOUCLE), au début d’une mesure, sans dépasser la fin : A tourne au lieu de s’arrêter. Au drop de B (temps 104), baisse le fader de A d’un coup.',
    show: ['gPadsA', 'gFad'], user: ['faderA'], autoLaunch: true, launchBeat: 80, bCue: 40, bBass: false, init: CH6_INIT, start: 72, end: 112,
    blocsA: [[16, 32, true, 'Corps'], [32, 96, false, 'Outro']],
    targets: [[88, 'BOUCLE', 'A'], [104, 'COUPE A', 'A']], hc: { type: 'prolonge', quant: true, finA: 96, boucle: 88, coupe: 104 },
    plan: ['Avant le temps 96 (fin de A), au début d’une mesure : pad 8 de A, en mode BOUCLE', 'Au drop de B (temps 104) : fader de A en haut → en bas, d’un coup'],
    caps: [[80, 'B démarre, mais son drop n’arrive qu’au temps 104'], [88, 'Boucle de 8 sur A, au début d’une mesure'], [96, 'A aurait dû s’arrêter ici : il tourne en boucle'], [104, 'Drop de B : A coupé d’un coup']] },
  { kind: 'hc', title: 'La montée', goal: 'Boucle A sur 16 temps, puis 8, puis 4, et coupe-le pile sur le drop de B. Quantize éteint.',
    how: 'Quantize est éteint : la boucle part exactement quand tu appuies. Temps 64 : boucle de 16 sur A. Temps 80 : raccourcis à 8. Temps 96 : raccourcis à 4, la tension monte. Temps 112 : le drop de B arrive, baisse le fader de A d’un coup.',
    show: ['gPadsA', 'gFad'], user: ['faderA'], autoLaunch: true, launchBeat: 80, bCue: 32, bBass: false, init: CH6_INIT, start: 56, end: 120,
    targets: [[64, '16', 'A'], [80, '8', 'A'], [96, '4', 'A'], [112, 'COUPE A', 'A']], hc: { type: 'montee', quant: false, etapes: [[64, 16], [80, 8], [96, 4]], coupe: 112 },
    plan: ['Temps 64 : pad 16 de A (boucle de 16 temps)', 'Temps 80 : pad 8 de A (la boucle raccourcit)', 'Temps 96 : pad 4 de A', 'Temps 112, drop de B : fader de A en haut → en bas, d’un coup'],
    caps: [[64, 'Boucle de 16 sur A'], [80, 'Raccourcie à 8 : ça s’accélère'], [96, 'Raccourcie à 4 : la tension monte'], [112, 'Drop de B : A coupé']] },
  { kind: 'hc', title: 'Le double drop', goal: 'Fais tomber le drop de B en même temps que celui de A, et échange les basses. Quantize éteint.',
    how: 'A arrive sur son drop au temps 64. Le hot cue 1 de B est posé sur son propre drop. Au temps 64, appuie sur le pad 1 de B : les deux drops tombent ensemble. Dans le même geste, échange les basses : LOW de A normal → coupé, LOW de B coupé → normal.',
    show: ['gPadsB', 'gLow'], user: ['lowA', 'lowB'], autoLaunch: false, launchBeat: 64, bCue: 64, bBass: true, init: Object.assign({}, CH6_INIT, { lowB: 0 }), start: 48, end: 72,
    blocsA: [[16, 64, false, 'Intro'], [64, 128, true, 'Drop']],
    targets: [[64, 'LANCE B', 'B'], [64, 'SWAP', 'AB']], hc: { type: 'double', quant: false, charge: true, aDrop: true, cible: 64, swap: 64 },
    plan: ['Au temps 64, quand A arrive sur son drop : pad 1 de B (B part sur son drop)', 'Dans le même geste : LOW de A normal → coupé, LOW de B coupé → normal'],
    caps: [[56, 'A arrive sur son drop au temps 64'], [64, 'B part de son hot cue : deux drops ensemble'], [66, 'Une seule basse à la fois : celle de B']] },
  { kind: 'hc', title: 'Sans filet', goal: 'Le final, sans repère : boucle la fin de A, lance B depuis son hot cue sur la phrase et coupe A.',
    how: 'A s’arrête au temps 96. Avant la fin, boucle ses 8 derniers temps (pad 8 de A), puis, au début de la phrase suivante (temps 104), lance B depuis son hot cue (posé sur son drop) et coupe A dans le même geste. Quantize éteint, et aucun repère sur la piste.',
    show: ['gPadsA', 'gPadsB', 'gFad'], user: ['faderA'], autoLaunch: false, launchBeat: 104, bCue: 64, bBass: true, init: CH6_INIT, start: 72, end: 112, noCount: true,
    blocsA: [[16, 32, true, 'Corps'], [32, 96, false, 'Outro']],
    targets: [[88, 'BOUCLE', 'A'], [104, 'LANCE B', 'B'], [104, 'COUPE A', 'A']], hc: { type: 'final', quant: false, charge: true, finA: 96, boucle: 88, cible: 104, coupe: 104 },
    plan: ['Avant le temps 96 (fin de A) : une boucle de 8 sur A, au début d’une mesure', 'Au temps 104 : pad 1 de B, et fader de A en haut → en bas d’un coup, dans le même geste'],
    caps: [[88, 'Boucle de 8 sur A, avant sa fin'], [104, 'B lancé de son hot cue, A coupé'], [108, 'Aucun repère : tout se fait à l’oreille']] }
];
CH6_LESSONS.forEach(l => { l.btn = []; l.caps = l.caps || []; });

/* ---------- Départ ---------- */
// La version du morceau B. Au double drop, les deux morceaux jouent ensemble : il faut les mêmes accords. La suite d'accords
// d'un morceau vient de sa graine (PROGS dans morceaux.js : une sur 4) ; VARIANTS versions plus loin, la graine a avancé de
// 4 × 101, donc même suite d'accords, mais un autre motif. Ailleurs, la version choisie.
const hcVarB = (l, vr) => l.hc && l.hc.aDrop ? vr + VARIANTS : vr;
// Le mode des pads de chaque platine (HOT CUE ou BOUCLE) : dès le choix du niveau, pas seulement pendant la partie
function hcModes(l){
  const t = l.hc.type; padMode.A = t === 'prolonge' || t === 'montee' || t === 'final' ? 'lp' : 'hc'; padMode.B = t === 'sortie' ? 'lp' : 'hc';
  renderPads('A'); renderPads('B');
}
// B chargé à l'arrêt, son hot cue 1 posé sur son drop (comme dans rekordbox avant une soirée)
function hcCharge(k, buf, posCue){
  const d = deck[k]; stop(k);
  Object.assign(d, { buf, per: P, bend: 0, secu: null, boucle: null, cue: posCue, cues: [posCue, null, null, null], ancP: posCue, ancT: ac.currentTime, joue: false, rate: 1 });
}
function hcDepart(demo){
  const l = LESSONS[li], h = l.hc;
  // depuis : où commence, sur la piste, la boucle en cours de chaque platine (pour la dessiner depuis là, pas avant)
  run.hc = { gestes: [], dropAt: null, prevB: null, finFait: false, silence: false, aCoupe: false, depuis: { A: null, B: null }, demo: {} };
  plQuantize = h.quant;
  if (h.charge) hcCharge('B', run.bBuf, 64 * P);
  else { launchAt(l.launchBeat);
    if (h.boucleB){ const d = deck.B, [s, e] = h.boucleB; d.boucle = { s: s * P, e: e * P, temps: e - s }; if (d.node){ d.node.loopStart = d.boucle.s; d.node.loopEnd = d.boucle.e; d.node.loop = true; } run.hc.depuis.B = l.launchBeat; } }
  hcModes(l);
}

/* ---------- Les pads, pendant une partie du chapitre 6 ----------
   Les pads de l'écran (padPresse) et ceux de la FLX4 (flx4Plus) passent par ici : on note l'instant entendu de chaque geste.
   mode : 'hc' (hot cue n), 'lp' (boucle : n = 0, 1, 2 pour 4, 8, 16 temps, 3 pour la sortie), 'efface' (hot cue n effacé). */
const hcMs = beats => beats * P * 1000;
function hcPad(k, mode, i){
  if (!run || !run.hc || !groupeAllume('gPads' + k)) return;
  ensureAudio(); const l = LESSONS[li], h = l.hc, d = deck[k], hb = heardBeat(), b = beatNow(); let res = 'rien';
  // l'endroit du morceau que le joueur entendait à l'appui : c'est là que se posent un repère ou une boucle (lu avant que
  // plBoucle repose l'ancre de la platine, après quoi la position entendue ne se calcule plus)
  const ici = d.joue && d.buf ? plPos(k, heardTime()) : null;
  padMode[k] = mode === 'efface' ? 'hc' : mode;
  if (mode === 'efface'){ plHotCueEfface(k, i); res = 'efface'; }
  else if (mode === 'hc'){
    // niveau 1 : une fois le repère posé, un nouvel appui ne fait pas sauter B (on ne mélange pas les deux gestes) ; la bulle
    // dit comment l'effacer pour le reposer (gardien du lot 41 : on croyait devoir arrêter et rejouer)
    if (h.type === 'pose' && d.cues[i] != null){ res = 'deja'; if (!run.demo) say('Repère déjà posé. Pour le reposer : SHIFT + pad sur ta table (clic droit à l’écran), puis appuie de nouveau.'); }
    else { res = plHotCue(k, i, ici) || 'rien';
      if (res === 'saut' && k === 'B' && run.launch === null){ run.launch = b; run.lowBAtLaunch = ctrl.lowB; $('launchB').disabled = true; } }
  } else { const t = PAD_BOUCLES[i];
    if (t){ plBoucle(k, t, ici); res = 'boucle'; if (d.boucle) run.hc.depuis[k] = b + (d.boucle.s - plPos(k)) / d.per / (d.rate || 1); }
    else { const avait = !!d.boucle; plSortie(k); res = avait ? 'sortie' : 'rien';
      // B sort de sa boucle d'attente : il finit sa mesure, et son drop tombera là. On redessine la piste à cet endroit, et la
      // sortie est juste si le drop tombe sur la phrase (c'est ce qu'on entend qui compte, pas l'instant exact de l'appui).
      if (avait && k === 'B' && h.type === 'sortie'){ const reste = (64 * P - plPos('B')) / P;
        if (reste >= 0){ run.launch = b + reste - (64 - l.bCue); if (!run.status.EXIT) run.status.EXIT = Math.abs(b + reste - h.cible) < .5 ? 'ok' : 'bad'; } } } }
  run.hc.gestes.push({ k, mode, i, hb, b, res, s: d.boucle ? d.boucle.s / P : null, t: d.boucle ? d.boucle.temps : null, cue: d.cues ? d.cues[i] : null });
  hcStatut(res, hb, d.boucle ? d.boucle.temps : null);
  renderPads(k);
}
// Le repère du geste sur la piste passe au vert (ou à l'orange) dès qu'il est fait. `t` : longueur de la boucle posée
// (le repère « 8 » de la montée ne passe pas au vert pour une boucle de 4).
// « BOUCLE » (prolonger la fin de A) : n'importe quelle mesure avant la fin fait l'affaire, comme dans la note finale ; l'écart
// se mesure donc à la mesure la plus proche (une boucle posée une mesure plus tôt affichait « 1933 ms trop tôt », gardien).
function hcStatut(res, hb, t){
  const h = LESSONS[li].hc, proche = (v, lab) => lab === 'BOUCLE' ? hb < (h.finA || v + 4) : Math.abs(hb - v) <= 4;
  const tg = LESSONS[li].targets.find(([v, lab]) => !run.status[lab] && proche(v, lab) && ((res === 'pose' && lab === 'HOT CUE') || (res === 'saut' && lab === 'LANCE B') || (res === 'boucle' && (lab === 'BOUCLE' || +lab === t))));
  if (!tg) return; const ref = tg[1] === 'BOUCLE' ? Math.round(hb / 4) * 4 : tg[0], ms = Math.abs(hcMs(hb - ref));
  run.status[tg[1]] = ms <= 60 ? 'ok' : 'mid';
  if (!run.demo) pop(ms <= HC_OK * 2 ? `Pile ! (${Math.round(ms)} ms)` : `${Math.round(ms)} ms ${hb > ref ? 'en retard' : 'trop tôt'}`, ms <= 60 ? 'ok' : 'mid');
}

/* ---------- Pendant la partie ---------- */
function hcFrame(b){
  const l = LESSONS[li], h = l.hc, R = run.hc;
  if (h.type === 'sortie'){
    // B sort de sa boucle d'attente : l'instant où il passe son temps 64 (son drop)
    if (deck.B.joue){ const p = plPos('B');
      // la position de B et le temps de A sont lus à la même horloge : pas de correction de sortie ici
      if (R.prevB != null && R.prevB < 64 * P && p >= 64 * P && R.dropAt == null){ R.dropAt = b;
        const e = R.dropAt - 64; run.status['DROP B'] = Math.abs(e) < .5 ? 'ok' : 'mid';
        if (!run.demo) pop(Math.abs(e) < .5 ? 'Le drop de B tombe sur la phrase !' : `Le drop est tombé ${Math.round(Math.abs(e))} temps ${e > 0 ? 'trop tard' : 'trop tôt'}`, Math.abs(e) < .5 ? 'ok' : 'mid'); }
      R.prevB = p; }
    if (!run.status.EXIT && b >= h.cible && deck.B.boucle){ run.status.EXIT = 'bad'; if (!run.demo) pop('Trop tard : B tourne encore dans sa boucle !', 'bad'); }
    // ici, seul le drop de B compte : A est coupé par le site au début de la phrase (sinon deux basses après le drop)
    if (!R.aCoupe && b >= h.cible){ R.aCoupe = true; ctrl.faderA = 0; applyCtrl(); }
  }
  // A arrive au bout de son morceau : il s'arrête (silence). Une boucle qui finit avant la fin le fait tourner ; une boucle qui
  // dépasse la fin l'emmène au bout quand même (au-delà, il n'y a plus de musique). Quantize éteint, une boucle posée quelques
  // millisecondes après le temps dépasse d'autant : jusqu'à HC_ZERO ms, on n'entendrait pas le trou (le retard est noté à part).
  if (h.finA && !R.finFait && deck.A.joue){ const fin = h.finA * P, bc = deck.A.boucle;
    if ((!bc || bc.e > fin + HC_ZERO / 1000) && plPos('A') >= fin - .01){ R.finFait = true; R.silence = ctrl.faderA > .1; R.depasse = !!bc; stop('A');
      if (!run.demo && R.silence) pop(bc ? 'Ta boucle dépassait la fin de A : silence !' : 'A est arrivé au bout : silence ! Il fallait boucler sa fin.', 'bad'); } }
  hcCoupe(b);
  if (run.demo) hcDemo(heardBeat());   // la démo agit sur le temps entendu, comme un joueur
  hcConsigne(b);
}
// « Coupe A » : jugé dès que le fader de A est en bas (le repère passe au vert, la bulle donne l'écart), noté pareil à la fin.
// Le geste est retenu à l'instant où il arrive (gestureMark), pas seulement à l'image suivante de l'écran.
function hcCoupe(b){
  const tg = LESSONS[li].targets.find(([, lab]) => lab === 'COUPE A'); if (!tg || run.status['COUPE A']) return;
  const at = tg[0], c = ctrl.faderA < .1 ? firstAt(run.frames, at - 8, x => x.fa < .1) : null;
  if (c != null){ const ms = hcMs(c - at), a = Math.round(Math.abs(ms)); run.status['COUPE A'] = a <= 60 ? 'ok' : 'mid';
    if (!run.demo) pop(a <= HC_OK * 2 ? `A coupé pile ! (${a} ms)` : `A coupé ${a} ms ${ms > 0 ? 'en retard' : 'trop tôt'}`, a <= 60 ? 'ok' : 'mid'); }
  else if (b > at + 2){ run.status['COUPE A'] = 'bad'; if (!run.demo) pop('Coupe A !', 'bad'); }
}
// La consigne de la bulle et le compte à rebours du rond (sauf au niveau sans filet)
const HC_ACT = { 'HOT CUE': 'pose le repère (pad 1 de B)', 'LANCE B': 'lance B (pad 1)', 'COUPE A': 'coupe A', 'DROP B': 'le drop de B arrive',
  'BOUCLE': 'boucle la fin de A (pad 8)', '16': 'boucle de 16 sur A', '8': 'boucle à 8', '4': 'boucle à 4', 'SWAP': 'échange les basses' };
function hcConsigne(b){
  const l = LESSONS[li], ring = $('ring');
  const compte = n => { const num = typeof n === 'number'; $('cdNum').textContent = n == null ? '♪' : n; $('cdLab').textContent = num ? 'temps' : ''; ring.classList.toggle('hot', num && n <= 4); };
  if (!REDUCED){ const f = b - Math.floor(b), k = Math.exp(-f * 7); ring.style.transform = `scale(${1 + .07 * k})`; ring.style.setProperty('--o', k.toFixed(2)); }
  if (l.noCount){ compte('?'); showAction('Écoute, compte les mesures, et agis au bon moment.'); return; }
  // EXIT reste à faire pendant toute la dernière mesure (temps 60 à 64)
  const tg = l.targets.find(([v, lab]) => (lab === 'EXIT' ? v + 4 : v + .5) > b && !run.status[lab]);
  if (!tg){ compte(null); showAction('Écoute le résultat…'); return; }
  const n = Math.max(0, Math.ceil(tg[0] - b)); compte(n);
  if (tg[1] === 'EXIT'){ showAction(n <= 1 ? 'Maintenant : sors de la boucle de B (pad EXIT), avant le temps 64 !' : n > 8 ? 'Écoute B tourner, et compte les mesures de A.' : `Dans ${n} temps : la dernière mesure avant la phrase. Sors de la boucle (pad EXIT) pendant cette mesure.`); return; }
  const txt = [...new Set(l.targets.filter(t => t[0] === tg[0] && !run.status[t[1]]).map(t => HC_ACT[t[1]] || t[1]))].join(' et ');
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
   La zone de chaque boucle (le tour en cours, puis les suivants), les hot cues posés (un fanion numéroté), la fin du
   morceau A, et le hot cue sur lequel B attend. */
function hcDessine(g, X, b, yA, yB, H, w, hitX){
  const l = LESSONS[li], h = l.hc, Y = { A: yA, B: yB }, C = { A: COL.a, B: COL.b }, enJeu = k => !!run && deck[k].joue && !!deck[k].per;
  // Où tombe, sur la piste, le temps `s` du morceau d'une platine qui joue
  const piste = (k, s) => b + (s - plPos(k) / deck[k].per) / (deck[k].rate || 1);
  if (h.finA && !(run && deck.A.boucle) && !(run && run.hc && run.hc.finFait)){ const x = X(h.finA); if (x > hitX - 40 && x < w){ g.save(); g.strokeStyle = COL.bad; g.lineWidth = 3; g.beginPath(); g.moveTo(x, yA - 6); g.lineTo(x, yA + H + 6); g.stroke();
    g.fillStyle = COL.bad; g.font = '800 12px ' + COL.font; g.textAlign = 'left'; g.fillText('FIN DE A', x + 6, yA - 8); g.restore(); } }
  if (run && run.hc && run.hc.silence){ g.save(); g.fillStyle = COL.bad; g.font = '800 13px ' + COL.font; g.textAlign = 'left'; g.fillText('A s’est arrêté : silence', hitX + 16, yA + 28); g.restore(); }
  // La boucle : ce qui était dessiné dessous (la suite du morceau) n'arrivera plus, on l'efface avant de la dessiner
  for (const k of ['A', 'B']){ const d = deck[k]; if (!enJeu(k) || !d.boucle) continue;
    // le tour en cours commence en s0 ; les tours d'avant sont redessinés jusqu'à l'endroit où la boucle a été posée
    const y = Y[k], t = d.boucle.temps / (d.rate || 1), s0 = piste(k, d.boucle.s / d.per), dep = run.hc && run.hc.depuis[k] != null ? run.hc.depuis[k] : s0;
    let v0 = s0; while (v0 - t >= dep - .01) v0 -= t;
    const x0 = Math.max(44, X(v0));
    g.save(); g.clearRect(x0, y - 2, w - x0, H + 4);
    for (let v = v0, i = 0; X(v) < w && i < 80; v += t, i++){ const a = X(v), z = X(v + t); g.globalAlpha = Math.abs(v - s0) < .01 ? .85 : .4; g.fillStyle = C[k]; rr(g, a + 1, y, z - a - 2, H, H / 2); g.fill(); }
    g.globalAlpha = 1; g.fillStyle = COL.ink; g.font = '800 13px ' + COL.font; g.textAlign = 'left';
    g.fillText(`↻ Boucle de ${d.boucle.temps} temps`, Math.max(X(s0) + 14, hitX + 10), y + 28); g.restore(); }
  // Avant de jouer (niveau 3) : B tournera sur sa boucle jusqu'à la phrase, puis son drop, si on sort au bon moment
  if (!run && h.boucleB){ const t = h.boucleB[1] - h.boucleB[0], x0 = Math.max(44, X(l.launchBeat));
    g.save(); g.clearRect(x0, yB - 2, w - x0, H + 4); g.fillStyle = COL.b;
    for (let v = l.launchBeat; v < h.cible; v += t){ const a = X(v), z = X(v + t); g.globalAlpha = .4; rr(g, a + 1, yB, z - a - 2, H, H / 2); g.fill(); }
    const a = X(h.cible); g.globalAlpha = .9; rr(g, a + 1, yB, w - a + 40, H, H / 2); g.fill(); g.globalAlpha = 1;
    g.fillStyle = COL.fg; g.font = '600 13px ' + COL.font; g.textAlign = 'left'; g.fillText(`↻ Boucle de ${t} temps`, x0 + 12, yB + 28);
    g.fillStyle = COL.ink; g.fillText('Drop', a + 12, yB + 28); g.restore(); }
  // Les hot cues posés : là où ils passent sur la piste ; à l'arrêt sur son repère, B partira de là, à l'endroit prévu
  const fanion = (x, y, n, c) => { g.save(); g.strokeStyle = c; g.lineWidth = 2; g.beginPath(); g.moveTo(x, y - 6); g.lineTo(x, y + H + 2); g.stroke();
    g.fillStyle = c; rr(g, x, y - 22, 18, 16, 4); g.fill(); g.fillStyle = COL.ink; g.font = '800 11px ' + COL.font; g.textAlign = 'center'; g.fillText(String(n), x + 9, y - 10); g.restore(); };
  let xAttend = null;
  for (const k of ['A', 'B']){ const d = deck[k]; if (!run || !d.cues) continue;
    d.cues.forEach((c, i) => { if (c == null) return; let v = null;
      if (enJeu(k)){ const bc = d.boucle; if (!bc || (c >= bc.s && c < bc.e)) v = piste(k, c / d.per); }
      else if (run.launch === null && Math.abs((d.ancP || 0) - c) < .01){ v = l.launchBeat; if (k === 'B') xAttend = X(v); }
      if (v == null) return; const x = X(v); if (x > 44 && x < w) fanion(x, Y[k], i + 1, C[k]); }); }
  if (h.charge && (!run || run.launch === null)){ const t = 'B attend · hot cue 1 posé sur son drop';
    g.save(); g.fillStyle = COL.b; g.font = '800 12px ' + COL.font; g.textAlign = 'left';
    if (xAttend == null || xAttend > 54 + g.measureText(t).width + 16) g.fillText(t, 54, yB - 10); g.restore(); }
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
  // niveau 1 : le dernier repère posé (après un repère effacé, c'est celui qui reste)
  if (h.type === 'pose'){ const g = G.filter(x => x.k === 'B' && x.res === 'pose').pop();
    if (!g) return [['bad', 'Tu n’as pas posé de hot cue : appuie sur le pad 1 de B quand son drop arrive.', 0]];
    out.push(hcLigne(hcMs(g.hb - h.cible), a => `Appui pile sur le drop (${a} ms).`, (a, s) => `Appui ${a} ms ${s} par rapport au drop.`));
    const t = g.cue == null ? null : Math.round(g.cue / P - 64);
    out.push(t === 0 ? ['ok', 'Le repère est sur le premier temps du drop.', 1] : ['bad', `Le repère est ${Math.abs(t)} temps ${t > 0 ? 'après' : 'avant'} le drop : écoute le moment où tout entre.`, 0]); }
  if (h.type === 'lance'){ lanceB(h.cible); coupeA(h.cible); }
  if (h.type === 'sortie'){ const e = r.hc.dropAt == null ? null : r.hc.dropAt - h.cible;
    out.push(e == null ? ['bad', 'B n’est jamais sorti de sa boucle : sors-en (EXIT) pendant la dernière mesure avant le temps 64.', 0]
      : Math.abs(e) < .5 ? ['ok', 'Le drop de B est tombé pile sur la phrase de A.', 1]
      : ['bad', `Le drop de B est tombé ${Math.round(Math.abs(e))} temps ${e > 0 ? 'trop tard' : 'trop tôt'} : sors de la boucle pendant la dernière mesure avant la phrase (entre les temps 60 et 64).`, Math.abs(Math.round(e)) === 4 ? .3 : 0]); }
  // Prolonger la fin de A : n'importe quelle boucle qui part au début d'une mesure et finit avant la fin de A fait l'affaire
  if (h.type === 'prolonge' || h.type === 'final'){ const g = premier('A', 'boucle');
    if (r.hc.silence && r.hc.depasse) out.push(['bad', `Ta boucle dépassait la fin de A (temps ${h.finA}) : il est arrivé au bout quand même. Elle doit finir au temps ${h.finA} au plus tard.`, 0]);
    else if (!g || r.hc.silence) out.push(['bad', r.hc.silence ? `A est arrivé au bout de son morceau : silence. Boucle sa fin avant le temps ${h.finA}.` : 'Tu n’as pas bouclé A.', 0]);
    else if (h.quant){ const sur = Math.abs(g.s - Math.round(g.s / 4) * 4) < .01; out.push(sur ? ['ok', `Boucle de ${g.t} temps posée au début d’une mesure (temps ${Math.round(g.s)}) : A ne s’arrête pas.`, 1] : ['mid', `Boucle posée au temps ${fr1(g.s)}, pas au début d’une mesure : ça boite.`, .5]); }
    else { const bar = Math.round(g.hb / 4) * 4; out.push(hcLigne(hcMs(g.hb - bar), a => `Boucle posée pile au temps ${bar} (${a} ms) : A ne s’arrête pas.`, (a, s) => `Boucle posée ${a} ms ${s} par rapport au temps ${bar} : on entend le raccord.`)); }
    if (h.type === 'final') lanceB(h.cible);
    coupeA(h.coupe); }
  if (h.type === 'montee'){
    for (const [at, t] of h.etapes){ const g = G.filter(x => x.k === 'A' && x.res === 'boucle' && x.t === t).sort((x, y) => Math.abs(x.hb - at) - Math.abs(y.hb - at))[0];
      out.push(!g ? ['bad', `Pas de boucle de ${t} temps (au temps ${at}).`, 0] : hcLigne(hcMs(g.hb - at), a => `Boucle de ${t} pile au temps ${at} (${a} ms).`, (a, s) => `Boucle de ${t} ${a} ms ${s}.`)); }
    coupeA(h.coupe); }
  // la couleur de chaque ligne suit sa note en millisecondes (comme hcLigne), pas les catégories en temps d'evalSwap
  if (h.type === 'double'){ lanceB(h.cible); xRun = true; out.push(...evalSwap(r.frames).map(([, t, v]) => [v >= .9 ? 'ok' : v >= .4 ? 'mid' : 'bad', t, v])); }
  return out;
}
// Étoiles : la moyenne des gestes, comme le Mode Expert (90 → 3, 60 → 2)
function hcEtoiles(items){ const s = items.reduce((t, x) => t + x[2], 0) / (items.length || 1); return s >= .9 ? 3 : s >= .6 ? 2 : 1; }
