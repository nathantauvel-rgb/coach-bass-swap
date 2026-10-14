// Chapitre 4 « Les combos » : des transitions qui enchaînent plusieurs gestes, notées au demi-temps près.
// Tous les fichiers de js/ partagent la même portée et sont chargés dans l'ordre indiqué dans index.html.
// Chargé avant niveaux.js (qui lit CH4_LESSONS au chargement) ; les fonctions d'ici ne servent qu'en cours de partie.
'use strict';
/* ---------- Les niveaux ----------
   `c` décrit les gestes attendus, en temps :
     cutLowB  : couper le LOW de B avant de le lancer        bFull : B à fond (fader) au plus tard à ce temps
     swap     : temps du swap des basses                      filt  : [début, fin] du filtre de A, vers la droite
     aOut     : [premier temps permis, dernier temps] pour que A soit sorti (fader à zéro)
     cut      : A coupé d'un coup à ce temps                  echo  : écho sur le dernier temps avant `cut`
   Ces mêmes valeurs servent à la démo, aux contrôles automatiques, aux réactions en direct et à la note. */
const CH4_INIT = { faderA: 1, faderB: 0, lowA: .5, lowB: .5, cfxA: .5, midA: .5, midB: .5 };
const CH4_LESSONS = [
  { kind: 'c-filtswap', title: 'Filtre et swap', goal: 'Efface A au filtre, puis échange les basses pile sur la phrase.',
    how: 'B arrive tout seul, basses coupées. Quand « FILTRE » touche la ligne, tourne le CFX de A vers la droite, lentement : il doit être à fond au moment du swap. Au swap, coupe le LOW de A et ouvre celui de B, dans le même geste.',
    show: ['gCfx', 'gLow'], bBass: true, autoLaunch: true, launchBeat: 32, bCue: 0, init: Object.assign({}, CH4_INIT, { lowB: 0 }), user: ['cfxA', 'lowA', 'lowB'], start: 24, end: 76,
    c: { filt: [48, 64], swap: 64 },
    targets: [[48, 'FILTRE', 'A'], [64, 'SWAP', 'AB']],
    caps: [[32, 'B arrive, basses coupées'], [48, 'Le filtre commence, lentement'], [64, 'Filtre à fond, swap des basses'], [70, 'B a pris toute la place']] },
  { kind: 'c-eclair', title: 'La transition éclair', goal: 'Toute la transition en 16 temps : lance, monte, échange, coupe.',
    how: 'Coupe le LOW de B avant de commencer. Lance B sur la ligne : il démarre 16 temps avant son drop. Monte son fader en 8 temps, puis, au drop, fais le swap des basses et baisse A d\'un coup.',
    show: ['gPlay', 'gLow', 'gFad'], bBass: true, autoLaunch: false, launchBeat: 48, bCue: 48, init: Object.assign({}, CH4_INIT), user: ['faderA', 'faderB', 'lowA', 'lowB'], start: 36, end: 74,
    c: { cutLowB: true, bFull: 56, swap: 64, cut: 64 },
    targets: [[48, 'LANCE B', 'B'], [56, 'B À FOND', 'B'], [64, 'SWAP', 'AB'], [64, 'COUPE A', 'A']],
    caps: [[44, 'LOW de B coupé'], [48, 'B part 16 temps avant son drop'], [56, 'B est à fond'], [64, 'Swap et A coupé : drop de B !']] },
  { kind: 'c-echodrop', title: 'Écho et drop, sans filet', goal: 'Écho sur A, coupure, et B lancé sur son drop : sans compte à rebours.',
    how: 'Pas de compte à rebours : compte les phrases dans ta tête. Sur le dernier temps de la phrase de A, active l\'écho (ON de l\'effet ou touche E). Sur le premier temps de la phrase suivante, coupe A et lance B, déjà calé sur son drop, dans le même geste.',
    show: ['gPlay', 'gEcho', 'gFad'], bBass: false, autoLaunch: false, launchBeat: 64, bCue: 64, init: Object.assign({}, CH4_INIT, { faderB: 1 }), user: ['faderA'], btn: ['echo'], start: 40, end: 74, noCount: true,
    c: { echo: true, cut: 64 },
    targets: [[63, 'ECHO', 'AB'], [64, 'COUPE A', 'A'], [64, 'LANCE B', 'B']],
    caps: [[56, 'Compte la fin de la phrase'], [63, 'Écho sur le dernier temps'], [64, 'A coupé, B lancé sur son drop'], [68, 'B tombe dans l\'écho']] },
  { kind: 'c-grand', title: 'Le grand mix', goal: 'Une longue transition propre : B entre, swap, filtre, et A sort avant le drop.',
    how: 'Coupe le LOW de B, lance-le sur la ligne et monte son fader. Au début de la phrase suivante, fais le swap des basses, puis efface A au filtre, lentement, jusqu\'à « À FOND ». Baisse enfin le fader de A : il doit être à zéro au drop de B.',
    show: ['gPlay', 'gCfx', 'gLow', 'gFad'], bBass: true, autoLaunch: false, launchBeat: 32, bCue: 0, init: Object.assign({}, CH4_INIT), user: ['faderA', 'faderB', 'lowA', 'lowB', 'cfxA'], start: 16, end: 100,
    c: { cutLowB: true, bFull: 56, swap: 64, filt: [64, 92], aOut: [80, 96] },
    targets: [[32, 'LANCE B', 'B'], [56, 'B À FOND', 'B'], [64, 'SWAP', 'AB'], [64, 'FILTRE', 'A'], [92, 'À FOND', 'A'], [96, 'A SORTI', 'A']],
    caps: [[28, 'LOW de B coupé'], [32, 'B part sur le 1'], [56, 'B est à fond'], [64, 'Swap, et le filtre commence'], [92, 'Filtre à fond'], [96, 'A est sorti : drop de B !']] }
];
CH4_LESSONS.forEach(l => { l.btn = l.btn || []; });

/* ---------- Le geste idéal (démo, contrôles automatiques, schéma) ---------- */
function ideal4(k, b, l){
  const c = l.c, r = (x, a, d) => Math.max(0, Math.min(1, (x - a) / d)), L = l.launchBeat;
  if (k === 'faderB') return l.init.faderB === 1 ? 1 : c.bFull ? r(b, L, c.bFull - L) : r(b, L, 16);
  if (k === 'faderA'){ if (c.cut) return 1 - r(b, c.cut - .25, .25); if (c.aOut) return 1 - r(b, c.aOut[1] - 4, 4); return 1; }
  if (k === 'lowA') return c.swap ? .5 - .5 * r(b, c.swap - .25, .5) : .5;
  if (k === 'lowB'){ if (!c.swap) return .5; if (b >= c.swap - .25) return .5 * r(b, c.swap - .25, .5); return c.cutLowB ? .5 - .5 * r(b, L - 6, 2) : 0; }
  if (k === 'cfxA') return c.filt ? .5 + .5 * r(b, c.filt[0], c.filt[1] - c.filt[0]) : .5;
  if (k === 'echo') return c.echo && b >= 63 && b < 72 ? 1 : 0;
  return .5;
}

/* ---------- Réactions pendant la partie ---------- */
function judge4(b){
  const l = LESSONS[li], c = l.c, s = run.status, p = run.popped;
  if (c.filt){
    if (!p.wrong && ctrl.cfxA < .4){ p.wrong = 1; pop('Mauvais côté ! Tourne vers la droite', 'bad'); }
    if (!s.FILTRE && b >= c.filt[0] - 8 && ctrl.cfxA > .52){ const ok = Math.abs(b - c.filt[0]) <= 4 * TOL; pop(ok ? 'Filtre lancé !' : b < c.filt[0] ? 'Filtre trop tôt' : 'Filtre en retard', ok ? 'ok' : 'mid'); s.FILTRE = ok ? 'ok' : 'mid'; if (ok) chime(true); p.fStart = b; }
    if (!s.FILTRE && b > c.filt[0] + 8){ pop('Tourne le filtre !', 'bad'); s.FILTRE = 'bad'; }
    if (!s['À FOND'] && b >= c.filt[0] - 8 && ctrl.cfxA >= .9){ const d = p.fStart != null ? b - p.fStart : 0, ok = b <= c.filt[1] + 2 * TOL && d >= (c.filt[1] - c.filt[0]) / 2;
      pop(ok ? 'A s\'efface en douceur !' : d < (c.filt[1] - c.filt[0]) / 2 ? 'Filtre trop brusque !' : 'Filtre à fond trop tard', ok ? 'ok' : 'mid'); s['À FOND'] = ok ? 'ok' : 'mid'; if (ok) chime(true); }
  }
  if (c.swap){
    if (p.kill == null && b >= c.swap - 8 && ctrl.lowA < .12) p.kill = b;
    if (p.open == null && b >= c.swap - 8 && ctrl.lowB > .4) p.open = b;
    if (p.kill != null && p.open != null && !s.SWAP){
      const e = (p.kill + p.open) / 2 - c.swap, ov = Math.abs(p.kill - p.open);
      if (Math.abs(e) <= .75 * TOL && ov <= .6 * TOL){ pop('SWAP PARFAIT !', 'ok'); s.SWAP = 'ok'; chime(true); }
      else { pop(Math.abs(e) > .75 * TOL ? `Swap ${e > 0 ? 'en retard' : 'en avance'}` : 'Swap pas tout à fait net', 'mid'); s.SWAP = 'mid'; chime(false); }
    }
    if (!s.SWAP && b > c.swap + 4){ pop('Le swap, c\'était maintenant !', 'bad'); s.SWAP = 'bad'; }
  }
  if (c.bFull && !s['B À FOND'] && run.launch !== null && ctrl.faderB >= .9){ const ok = b <= c.bFull + 2 * TOL; pop(ok ? 'B est installé !' : 'B à fond… un peu tard', ok ? 'ok' : 'mid'); s['B À FOND'] = ok ? 'ok' : 'mid'; if (ok) chime(true); }
  if (c.aOut){
    if (!s['A SORTI'] && b >= c.aOut[0] - 8 && ctrl.faderA <= .05){ const ok = b >= c.aOut[0] - 2 * TOL && b <= c.aOut[1] + TOL; pop(ok ? 'A sorti à temps !' : b < c.aOut[0] ? 'A sorti trop tôt' : 'A sorti en retard', ok ? 'ok' : 'mid'); s['A SORTI'] = ok ? 'ok' : 'mid'; if (ok) chime(true); }
    if (!s['A SORTI'] && b > c.aOut[1] + 2){ pop('A joue encore au drop !', 'bad'); s['A SORTI'] = 'bad'; }
  }
  if (c.cut){
    if (c.echo && !s.ECHO && b > c.cut + .5){ pop('Pas d\'écho !', 'bad'); s.ECHO = 'bad'; }
    if (!s['COUPE A'] && b >= c.cut - 8 && ctrl.faderA < .1){ const e = b - c.cut, ok = Math.abs(e) <= .6 * TOL; pop(ok ? 'Coupure nette !' : `Coupé ${e > 0 ? 'en retard' : 'trop tôt'}`, ok ? 'ok' : 'mid'); s['COUPE A'] = ok ? 'ok' : 'mid'; if (ok) chime(true); }
    if (!s['COUPE A'] && b > c.cut + 2){ pop('Coupe A !', 'bad'); s['COUPE A'] = 'bad'; }
  }
}

/* ---------- La note ---------- */
function eval4(r){
  const l = LESSONS[li], c = l.c, fr = r.frames, out = [];
  if (!l.autoLaunch) out.push(evalLaunch(r.launch, l.launchBeat));
  if (c.cutLowB && r.launch !== null) out.push(r.lowBAtLaunch < .15 ? ['ok', 'Basses de B coupées avant de le lancer.', 1] : ['bad', 'B est parti avec ses basses ouvertes : coupe son LOW avant de le lancer.', 0]);
  if (c.bFull){ const t = r.launch === null ? null : firstAt(fr, r.launch, x => x.fb >= .9);
    out.push(t === null ? ['bad', 'B n\'est jamais arrivé à fond : monte son fader jusqu\'en haut.', 0] : t <= c.bFull + 2 * TOL ? ['ok', `B à fond au temps ${Math.round(t)}, à l'heure.`, 1] : ['mid', `B à fond au temps ${Math.round(t)} : vise le temps ${c.bFull}.`, .5]); }
  if (c.filt){ const st = firstAt(fr, c.filt[0] - 8, x => x.ca > .52), full = firstAt(fr, c.filt[0] - 8, x => x.ca >= .9), need = (c.filt[1] - c.filt[0]) / 2;
    if (fr.some(x => x.ca < .4)) out.push(['bad', 'Tu as tourné le filtre vers la gauche : pour effacer A, tourne vers la droite.', 0]);
    out.push(st == null ? ['bad', 'Le filtre n\'a jamais été tourné.', 0] : Math.abs(st - c.filt[0]) <= 4 * TOL ? ['ok', `Filtre lancé au temps ${Math.round(st)}.`, 1] : ['mid', `Filtre lancé au temps ${Math.round(st)} : commence au temps ${c.filt[0]}.`, .5]);
    if (st != null) out.push(full == null || full > c.filt[1] + 2 * TOL ? ['bad', `A n'était pas complètement filtré au temps ${c.filt[1]}.`, 0] : full - st < need ? ['mid', `Filtre monté trop vite (${Math.round(full - st)} temps) : étale-le sur ${c.filt[1] - c.filt[0]} temps.`, .5] : ['ok', 'Filtre monté en douceur, et à fond à temps.', 1]); }
  if (c.swap) out.push(...evalSwap4(fr, c.swap));
  if (c.aOut){ const t = firstAt(fr, c.aOut[0] - 8, x => x.fa <= .05);
    out.push(t === null || t > c.aOut[1] + TOL ? ['bad', 'A jouait encore au drop de B : baisse son fader avant.', 0] : t < c.aOut[0] - 2 * TOL ? ['mid', `A est sorti tôt (temps ${Math.round(t)}).`, .5] : ['ok', `A est sorti au temps ${Math.round(t)}, avant le drop.`, 1]); }
  if (c.echo) out.push(...evalEcho(fr, r.echoAt));
  else if (c.cut){ const t = firstAt(fr, c.cut - 8, x => x.fa < .1), e = t === null ? null : t - c.cut;
    out.push(t === null ? ['bad', 'A n\'a jamais été coupé : baisse son fader d\'un coup au drop.', 0] : Math.abs(e) <= .5 * TOL ? ['ok', 'A coupé pile au drop.', 1] : ['mid', `A coupé ${fr1(Math.abs(e))} temps ${e > 0 ? 'en retard' : 'trop tôt'}.`, .5]); }
  if (c.echo && r.launch !== null){ const t = firstAt(fr, c.cut - 8, x => x.fa < .1);
    if (t !== null){ const d = t - r.launch; out.push(Math.abs(d) <= .75 * TOL ? ['ok', 'Coupure et lancement en même temps.', 1] : ['mid', d > 0 ? `A et B ont joué ensemble pendant ${fr1(d)} temps.` : `Blanc de ${fr1(-d)} temps entre la coupure et B.`, .5]); } }
  return out;
}
// Comme evalSwap (niveaux.js), mais autour du temps du swap de ce niveau
function evalSwap4(fr, at){
  const tKill = firstAt(fr, at - 8, x => x.la < .12), tOpen = firstAt(fr, at - 8, x => x.lb > .4);
  if (tKill === null || tOpen === null) return [['bad', tKill === null ? 'Les basses de A n’ont jamais été coupées : tourne son LOW à fond à gauche.' : 'Les basses de B n’ont jamais été ouvertes : remonte son LOW au milieu.', 0]];
  const e = (tKill + tOpen) / 2 - at, ov = Math.max(0, tKill - tOpen), gap = Math.max(0, tOpen - tKill), out = [];
  out.push(Math.abs(e) <= .75 * TOL ? ['ok', 'Swap pile sur le début de la phrase.', 1] : Math.abs(e) <= 2 * TOL ? ['mid', `Swap ${fr1(Math.abs(e))} temps ${e > 0 ? 'trop tard' : 'trop tôt'}.`, .5] : ['bad', `Swap à ${fr1(Math.abs(e))} temps de la phrase.`, 0]);
  out.push(ov > 2 * TOL ? ['bad', `Deux basses ensemble pendant ${fr1(ov)} temps : ouvre B et coupe A dans le même geste.`, 0] : ov > .5 * TOL ? ['mid', `Deux basses ensemble pendant ${fr1(ov)} temps.`, .5]
    : gap > 2 * TOL ? ['bad', `Plus aucune basse pendant ${fr1(gap)} temps.`, 0] : gap > .5 * TOL ? ['mid', `Petit trou dans les basses (${fr1(gap)} temps).`, .5] : ['ok', 'Les basses passent de A à B sans chevauchement ni trou.', 1]);
  return out;
}
