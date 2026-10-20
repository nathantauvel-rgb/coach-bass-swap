// Chapitre 5 « Le calage » (lot 40) : caler deux morceaux soi-même, sans SYNC, en retirant les aides une à une.
// Tous les fichiers de js/ partagent la même portée et sont chargés dans l'ordre indiqué dans index.html.
// Chargé avant niveaux.js (qui lit CH5_LESSONS au chargement) ; les fonctions d'ici ne servent qu'en cours de partie.
'use strict';
/* ---------- Les niveaux ----------
   `cal` décrit le niveau :
     quiz     : niveau 1, on écoute et on répond (calé, B en avance, B en retard), pas de geste sur la table
     decale   : [min, max] du décalage de départ de B, en millisecondes (le signe est tiré au hasard)
     bpmB     : tempos possibles pour B (A est à 124) ; vide = même tempo que A
     compteur : le compteur de décalage est affiché (true), seulement une fois B lancé ('apres'), ou pas du tout (false)
     bpm      : le BPM des platines est affiché
     grace    : temps laissés pour caler avant que la note commence
     entre    : B doit entrer (fader en haut) à ce temps, déjà calé
     libre    : B n'est pas lancé par le site : le joueur le lance quand il veut, à l'instant exact
   (noCount, au niveau 7 : la piste est dans le brouillard, comme au chapitre 2)
     swap     : swap des basses à ce temps (noté comme au chapitre 1)
   Seuils (choix de l'utilisateur, à ajuster après ses essais) : ★★★ si B reste à moins de CAL_OK ms 85 % du temps noté,
   ★★ à moins de CAL_MID ms 60 % du temps. */
const CAL_OK = 15, CAL_MID = 25, CAL_BPM_A = 124;
const CH5_INIT = { faderA: 1, faderB: 1, lowA: .5, lowB: .5, cfxA: .5, midA: .5, midB: .5 };
const CH5_LESSONS = [
  { kind: 'cal', title: 'Entendre le décalage', goal: 'Écoute A et B ensemble : calés, ou B en avance, ou B en retard ?',
    how: 'Cinq écoutes, sans toucher à la table. Calés, les deux grosses caisses tombent ensemble : un seul coup, net. B en avance : son coup arrive juste avant celui de A, on entend « ta-boum ». B en retard : c’est l’inverse, « boum-ta ». Réponds avec les trois boutons au-dessus de la table.',
    show: [], user: [], autoLaunch: true, launchBeat: 20, bCue: 0, bBass: true, init: CH5_INIT, start: 16, end: 124,
    cal: { quiz: true, bpm: true, compteur: false } },
  { kind: 'cal', title: 'Pousser, freiner', goal: 'B part un peu à côté : rattrape-le à la molette, puis garde-le calé.',
    how: 'B a le même tempo que A, mais il est parti un peu trop tôt ou trop tard. Tourne la molette de B : dans le sens des aiguilles d’une montre, tu le pousses ; dans l’autre sens, tu le freines. Le compteur au-dessus de la table dit de combien il est décalé : vise moins de 15 ms, et garde-le là jusqu’à la fin.',
    show: ['gJogB'], user: [], autoLaunch: true, launchBeat: 20, bCue: 0, bBass: true, init: CH5_INIT, start: 16, end: 84,
    cal: { decale: [40, 90], bpmB: [], compteur: true, bpm: true, grace: 8 } },
  { kind: 'cal', title: 'La bonne vitesse', goal: 'B va un peu plus vite que A : règle son tempo, puis cale-le.',
    how: 'B est à 126 BPM, A à 124 : même bien parti, il prend de l’avance petit à petit. Ramène-le à 124 avec le curseur TEMPO de B (vers le haut, il ralentit), puis rattrape le décalage à la molette.',
    show: ['gTempoB', 'gJogB'], user: [], autoLaunch: true, launchBeat: 20, bCue: 0, bBass: true, init: CH5_INIT, start: 16, end: 100,
    cal: { decale: [0, 0], bpmB: [126], compteur: true, bpm: true, grace: 16 } },
  { kind: 'cal', title: 'La vitesse à l’oreille', goal: 'Plus de BPM affiché : entends si B accélère ou ralentit, et corrige.',
    how: 'B n’a pas le même tempo que A, mais cette fois aucun chiffre ne te dit lequel va le plus vite. Écoute : si le compteur grimpe vers « en avance », B est trop rapide ; s’il descend vers « en retard », il est trop lent. Corrige au TEMPO, puis à la molette.',
    show: ['gTempoB', 'gJogB'], user: [], autoLaunch: true, launchBeat: 20, bCue: 0, bBass: true, init: CH5_INIT, start: 16, end: 100,
    cal: { decale: [20, 50], bpmB: [121, 122, 126, 127], compteur: true, bpm: false, grace: 16 } },
  { kind: 'cal', title: 'Au casque', goal: 'Prépare B au casque sans que la salle l’entende, puis fais-le entrer sur la phrase.',
    how: 'B joue fader en bas : la salle n’entend que A. Allume CUE 🎧 de B pour l’écouter au casque, règle son tempo et cale-le. Au temps 64, monte son fader : il doit entrer déjà calé. Sans sortie casque sur ta table, B est joué tout bas dans les enceintes.',
    show: ['gTempoB', 'gJogB', 'gCasqueB', 'gFad'], user: ['faderB'], autoLaunch: true, launchBeat: 20, bCue: 0, bBass: true, init: Object.assign({}, CH5_INIT, { faderB: 0 }), start: 16, end: 96,
    cal: { decale: [20, 60], bpmB: [122, 126], compteur: true, bpm: false, grace: 16, entre: 64 } },
  { kind: 'cal', title: 'Lancer et caler', goal: 'Tout toi-même : lance B, règle sa vitesse, cale-le, puis échange les basses.',
    how: 'B n’est pas lancé : appuie sur LANCE B (PLAY de droite) au début d’une mesure, vers le temps 32. Il part à l’instant exact, sans calage automatique. Règle son tempo (4 BPM d’écart), cale-le, puis au temps 64 échange les basses : LOW de A normal → coupé, LOW de B coupé → normal.',
    show: ['gPlay', 'gTempoB', 'gJogB', 'gLow'], user: ['lowA', 'lowB'], autoLaunch: false, launchBeat: 32, bCue: 0, bBass: true, init: Object.assign({}, CH5_INIT, { lowB: 0 }), start: 16, end: 96,
    cal: { libre: true, bpmB: [120, 128], compteur: 'apres', bpm: false, grace: 16, swap: 64 } },
  { kind: 'cal', title: 'Sans filet', goal: 'Le final : ni BPM, ni compteur, ni repère. Lance, cale et échange les basses à l’oreille.',
    how: 'Comme le niveau précédent, mais sans aucune aide à l’écran : ni BPM, ni compteur, ni repère sur la piste. Lance B vers le temps 32, cale-le au tempo et à la molette en écoutant, puis échange les basses au temps 64.',
    show: ['gPlay', 'gTempoB', 'gJogB', 'gLow'], user: ['lowA', 'lowB'], autoLaunch: false, launchBeat: 32, bCue: 0, bBass: true, init: Object.assign({}, CH5_INIT, { lowB: 0 }), start: 16, end: 96, noCount: true,
    cal: { libre: true, bpmB: [119, 120, 128, 129], compteur: false, bpm: false, grace: 16, swap: 64 } }
];
CH5_LESSONS.forEach(l => { l.btn = []; l.targets = l.cal.swap ? [[l.cal.swap, 'SWAP', 'AB']] : l.cal.entre ? [[l.cal.entre, 'B ENTRE', 'B']] : []; l.caps = []; });
const hasard = a => a[Math.floor(Math.random() * a.length)];
// Tempo de B pour cette partie (tiré au départ), et la vitesse à donner au morceau B pour l'obtenir
function calChoisitBpm(l){ const t = l.cal.bpmB && l.cal.bpmB.length ? hasard(l.cal.bpmB) : CAL_BPM_A; return t; }

/* ---------- Lancer B ---------- */
// B part au temps `k` de A, décalé de `ms` millisecondes (positif : en avance), sur sa propre grille (perB)
function calLance(k, ms){
  const t = run.t0 + (k - START) * P, perB = run.calPer, off = ms / 1000;
  play('B', run.bBuf, t + Math.max(0, -off), Math.max(0, off), false);
  calGrille(perB); run.launch = k; run.lowBAtLaunch = ctrl.lowB; $('launchB').disabled = true;
}
// La grille de B (son propre tempo) et sa boucle de sécurité, en temps de B
function calGrille(perB){ const d = deck.B; d.per = perB; d.secu = { s: 64 * perB, e: 128 * perB }; if (d.node){ d.node.loopStart = d.secu.s; d.node.loopEnd = d.secu.e; d.node.loop = true; } }
// Niveaux 6 et 7 : B part à l'instant de l'appui, sans calage automatique (comme le Mode Expert)
function calLanceLibre(){
  if (!run || run.launch !== null) return; ensureAudio();
  play('B', run.bBuf, ac.currentTime + .005, 0, false); calGrille(run.calPer);
  run.launch = beatNow(); run.lowBAtLaunch = ctrl.lowB; $('launchB').disabled = true;
  const e = run.launch - LESSONS[li].launchBeat;
  pop(Math.abs(e) <= 2 ? 'B est lancé : cale-le !' : `B lancé ${Math.abs(Math.round(e))} temps ${e > 0 ? 'tard' : 'tôt'} : cale-le vite !`, Math.abs(e) <= 2 ? 'ok' : 'mid');
}
// Départ d'une partie du chapitre 5 (appelé par startRun à la place de launchAt)
function calDepart(demo){
  const l = LESSONS[li], c = l.cal;
  run.cal = { mes: [], decale: 0 }; casque.A = casque.B = false; plCasque(); $('casqueB').setAttribute('aria-pressed', 'false');
  if (c.quiz){ run.q = { tours: calTours(), i: 0, rep: [], attend: false }; calTour(l.launchBeat); return; }
  if (c.libre && !demo) return;
  const [a, z] = c.decale || [0, 0], ms = (a + Math.random() * (z - a)) * (Math.random() < .5 ? -1 : 1);
  run.cal.decale = ms; calLance(l.launchBeat, ms);
}

/* ---------- Niveau 1 : à l'oreille ---------- */
// Cinq tours : un calé, deux en avance, deux en retard (dans le désordre), de plus en plus fins
function calTours(){
  const t = [0, 55, -55, 32, -32]; for (let i = t.length - 1; i > 0; i--){ const j = Math.floor(Math.random() * (i + 1)); [t[i], t[j]] = [t[j], t[i]]; }
  // les deux écarts les plus fins à la fin
  return t.sort((x, y) => (Math.abs(x) === 32) - (Math.abs(y) === 32));
}
function calTour(k){ const q = run.q, ms = q.tours[q.i]; q.debut = k; q.attend = false; calQuizBoutons(false); calLance(k, ms); }
const CAL_REP = { 0: 'calés', 1: 'B en avance', '-1': 'B en retard' };
const calSens = ms => ms === 0 ? 0 : ms > 0 ? 1 : -1;
function calRepond(r){
  if (!run || !run.q || !run.q.attend) return; const q = run.q, ms = q.tours[q.i], bon = calSens(ms);
  q.rep.push([r, bon, ms]); q.attend = false; calQuizBoutons(false);
  if (r === bon){ pop(bon === 0 ? 'Oui, calés !' : `Oui : ${CAL_REP[bon]} (${Math.abs(Math.round(ms))} ms)`, 'ok'); chime(true); }
  else { pop(`Non : c’était « ${CAL_REP[bon]} »`, 'bad'); }
  q.i++;
  if (q.i >= q.tours.length){ setTimeout(() => { if (run && run.q) finish(); }, 1200); return; }
  calTour(Math.ceil(beatNow()) + 4);
}
function calQuizBoutons(on){ $('calQuiz').hidden = !(run && run.q); $('calQuiz').querySelectorAll('button').forEach(b => { b.disabled = !on; }); }

/* ---------- Pendant la partie ---------- */
// Appelé à chaque image : mesure du décalage, compteur, consignes, tours du niveau 1
function calFrame(b){
  const l = LESSONS[li], c = l.cal, ms = plDecalage();
  if (ms != null && run.launch !== null && b >= run.launch + 1) run.cal.mes.push([b, ms, ctrl.faderB, deck.B.rate]);
  if (c.quiz){ const q = run.q;
    if (run.demo && q.i < q.tours.length && b >= q.debut + 8){ const ms = q.tours[q.i], bon = calSens(ms);
      pop(`Écoute ${q.i + 1} : ${CAL_REP[bon]}${bon ? ` (${Math.abs(Math.round(ms))} ms)` : ''}`, 'ok'); q.i++;
      if (q.i >= q.tours.length) finish(); else calTour(Math.ceil(b) + 4); return; }
    if (!run.demo && !q.attend && q.i < q.tours.length && b >= q.debut + 8){ q.attend = true; calQuizBoutons(true); }
    showAction(q.attend ? `Écoute ${q.i + 1} sur ${q.tours.length} : calés, B en avance, ou B en retard ?` : `Écoute ${q.i + 1} sur ${q.tours.length}…`);
    calCompteur(null); return; }
  if (run.demo) calDemo(b, ms);
  calCompteur(c.compteur ? ms : null, !!c.compteur);
  // la consigne du moment
  // niveau 7 « Sans filet » : aucune aide dans la bulle (ni moment de lancer, ni compte à rebours, ni « Calé »)
  if (c.compteur === false) showAction(run.launch === null ? 'Lance B quand tu le sens.' : 'Écoute, cale, et échange les basses au bon moment.');
  else if (c.libre && run.launch === null) showAction(b < l.launchBeat - 8 ? 'Prépare-toi à lancer B vers le temps ' + l.launchBeat + '.' : 'Lance B au début d’une mesure !');
  else if (c.swap && b >= c.swap - 8 && b < c.swap + 2) showAction(`Dans ${Math.max(0, Math.ceil(c.swap - b))} temps : échange les basses !`);
  else if (c.entre && b >= c.entre - 8 && b < c.entre + 2) showAction(`Dans ${Math.max(0, Math.ceil(c.entre - b))} temps : monte le fader de B !`);
  else if (ms != null) showAction(Math.abs(ms) <= CAL_OK ? 'Calé : garde-le comme ça.' : (ms > 0 ? 'B est en avance : freine-le.' : 'B est en retard : pousse-le.'));
}
// Le compteur au-dessus de la table : texte et aiguille (±100 ms). `garde` : le niveau a un compteur ; tant que B ne joue
// pas, il reste à sa place (sans aiguille) pour que la table ne saute pas quand B part.
function calCompteur(ms, garde = false){
  const bar = $('calBar'); bar.hidden = ms == null && !garde; bar.classList.toggle('attend', ms == null);
  if (ms == null){ if (garde){ $('calTxt').textContent = 'Le compteur s’allume quand B joue'; bar.classList.remove('ok', 'mid'); } return; }
  const a = Math.abs(ms), ok = a <= CAL_OK;
  $('calTxt').textContent = ok ? `Calé · ${Math.round(a)} ms` : `B en ${ms > 0 ? 'avance' : 'retard'} de ${Math.round(a)} ms`;
  bar.classList.toggle('ok', ok); bar.classList.toggle('mid', !ok && a <= 50);
  $('calAig').style.left = (50 + Math.max(-50, Math.min(50, ms / 2))) + '%';
}
// La démo : le site règle le tempo de B tout de suite, puis le rattrape à la molette, en douceur
function calDemo(b, ms){
  if (run.launch === null) return;
  if (b >= run.launch + 2 && !run.cal.tempoFait){ ctrl.tempoB = clamp01(.5 - (CAL_BPM_A / run.calBpm - 1) / (2 * PL_TEMPO)); applyCtrl(); run.cal.tempoFait = true; }
  if (ms != null && b >= run.launch + 4 && Math.abs(ms) > 3) plJog('B', -ms * .05);
}

// La démo des niveaux 5 à 7 : B monte au temps 64, ou les basses s'échangent au temps 64 (le tempo et la molette : calDemo)
function calDemoGestes(b){
  const c = LESSONS[li].cal; let ch = false; const set = (k, v) => { if (Math.abs(ctrl[k] - v) > .002){ ctrl[k] = v; ch = true; } };
  if (c.libre && run.launch === null && b >= LESSONS[li].launchBeat){ play('B', run.bBuf, ac.currentTime + .005, 0, false); calGrille(run.calPer); run.launch = beatNow(); }
  if (c.entre) set('faderB', b >= c.entre ? 1 : 0);
  if (c.swap){ set('lowA', b >= c.swap ? 0 : .5); set('lowB', b >= c.swap ? .5 : 0); }
  if (ch) applyCtrl();
}

$('calQuiz').querySelectorAll('button').forEach(b => b.addEventListener('click', () => calRepond(+b.dataset.r)));

/* ---------- La note ---------- */
// Ce qui compte : la part du temps où B est resté calé (après le temps laissé pour caler), le temps qu'il a fallu,
// la vitesse finale de B, et selon le niveau l'entrée de B ou le swap des basses
function calMesures(r){
  const l = LESSONS[li], c = l.cal, d0 = (r.launch == null ? l.launchBeat : r.launch) + (c.grace || 0);
  const m = r.cal.mes.filter(x => x[0] >= d0), n = m.length || 1;
  const p15 = m.filter(x => Math.abs(x[1]) <= CAL_OK).length / n, p25 = m.filter(x => Math.abs(x[1]) <= CAL_MID).length / n;
  // calé pour de bon : 4 temps de suite sous CAL_OK
  let tCal = null, run4 = null; for (const x of r.cal.mes){ if (Math.abs(x[1]) <= CAL_OK){ if (run4 == null) run4 = x[0]; if (x[0] - run4 >= 4){ tCal = run4; break; } } else run4 = null; }
  const last = r.cal.mes[r.cal.mes.length - 1], bpmFin = last ? r.calBpm * last[3] : null;
  return { p15: m.length ? p15 : 0, p25: m.length ? p25 : 0, tCal, bpmFin };
}
function calEval(r){
  const l = LESSONS[li], c = l.cal;
  if (c.quiz){ return r.q.rep.map(([rep, bon, ms]) => rep === bon ? ['ok', bon === 0 ? 'Calés : bien entendu.' : `${CAL_REP[bon]} de ${Math.abs(Math.round(ms))} ms : bien entendu.`, 1]
    : ['bad', `Tu as répondu « ${CAL_REP[rep]} », c’était « ${CAL_REP[bon]} »${bon ? ` (${Math.abs(Math.round(ms))} ms)` : ''}.` + (bon === 1 ? ' En avance : le coup de B arrive juste avant celui de A.' : bon === -1 ? ' En retard : le coup de B arrive juste après celui de A.' : ' Calés : un seul coup, net.'), 0])
    .concat(r.q.rep.length < r.q.tours.length ? [['bad', `Tu n’as répondu qu’à ${r.q.rep.length} écoute${r.q.rep.length > 1 ? 's' : ''} sur ${r.q.tours.length}.`, 0]] : []); }
  if (r.launch == null) return [['bad', 'Tu n’as pas lancé B : appuie sur LANCE B (PLAY de droite) vers le temps ' + l.launchBeat + '.', 0]];
  const M = calMesures(r), out = [], pc = x => Math.round(x * 100);
  r.calM = M;
  out.push(M.p15 >= .85 ? ['ok', `B est resté calé (moins de ${CAL_OK} ms) ${pc(M.p15)} % du temps.`, 1]
    : M.p25 >= .6 ? ['mid', `B est resté calé ${pc(M.p15)} % du temps, et presque calé (moins de ${CAL_MID} ms) ${pc(M.p25)} % du temps. Encore un peu de précision.`, .5 + .5 * M.p15]
    : ['bad', `B n’est resté calé que ${pc(M.p15)} % du temps. ${l.cal.bpmB && l.cal.bpmB.length ? 'Règle d’abord son tempo, puis rattrape le décalage à la molette.' : 'Rattrape-le à la molette, par petites touches.'}`, M.p15]);
  const lb = r.launch;
  out.push(M.tCal == null ? ['bad', 'B n’a jamais été calé 4 temps de suite.', 0]
    : M.tCal - lb <= (c.grace || 8) ? ['ok', `Calé en ${Math.round(M.tCal - lb)} temps.`, 1] : ['mid', `Calé en ${Math.round(M.tCal - lb)} temps : vise moins de ${c.grace || 8}.`, .5]);
  if (c.bpmB && c.bpmB.length && M.bpmFin != null){ const e = M.bpmFin - CAL_BPM_A;
    out.push(Math.abs(e) <= .15 ? ['ok', `B finit à ${fr1(M.bpmFin)} BPM, comme A.`, 1] : ['mid', `B finit à ${fr1(M.bpmFin)} BPM : il ${e > 0 ? 'va encore trop vite' : 'est encore trop lent'} (A est à ${CAL_BPM_A}).`, .5]); }
  if (c.entre){ const x = r.cal.mes.find(y => y[0] >= l.launchBeat && y[2] >= .9);
    out.push(!x ? ['bad', 'Le fader de B n’est jamais monté : B n’est pas entré.', 0]
      : Math.abs(x[0] - c.entre) <= 2 && Math.abs(x[1]) <= CAL_MID ? ['ok', `B est entré au temps ${Math.round(x[0])}, déjà calé.`, 1]
      : Math.abs(x[1]) > CAL_MID ? ['mid', `B est entré décalé de ${Math.abs(Math.round(x[1]))} ms : cale-le au casque avant de monter son fader.`, .5]
      : ['mid', `B est entré au temps ${Math.round(x[0])} : vise le temps ${c.entre}.`, .5]); }
  if (c.swap) out.push(...evalSwap(r.frames));
  return out;
}
// Étoiles : d'après la part du temps calé ; une autre consigne ratée (entrée, swap) empêche les 3 étoiles
function calEtoiles(r, items){
  if (LESSONS[li].cal.quiz){ const bons = r.q.rep.filter(([a, b]) => a === b).length; return bons >= r.q.tours.length ? 3 : bons >= r.q.tours.length - 1 ? 2 : 1; }
  const M = r.calM; if (!M) return 1;
  let st = M.p15 >= .85 ? 3 : M.p25 >= .6 ? 2 : 1;
  if (st === 3 && items.some(x => x[0] !== 'ok')) st = 2;
  return st;
}
