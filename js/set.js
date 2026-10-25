// Chapitre 7 « Le set » (lot 44) : plusieurs morceaux enchaînés sans que la musique s'arrête, comme en soirée.
// Les deux platines jouent chacune leur tour (morceau 1 sur A, 2 sur B, 3 sur A…) : le site charge le morceau suivant sur la
// platine qui vient de se libérer. Plus de repère ni de compte à rebours : le joueur décide quand lancer, caler, faire entrer
// et sortir chaque morceau. La note part de 100, et chaque erreur coûte des points, mesurés en continu.
// Tous les fichiers de js/ partagent la même portée et sont chargés dans l'ordre indiqué dans index.html.
// Chargé avant niveaux.js (qui lit CH7_LESSONS au chargement) ; les fonctions d'ici ne servent qu'en cours de partie.
// Préfixe « enc » (enchaînement) : les noms en « set… » sont déjà pris (setFocus, setEcho, setChapter…).
'use strict';
/* ---------- Les morceaux ----------
   Les parties d'un morceau : [début, fin, instruments, nom], en temps du morceau. drop : où commence son premier drop (le set
   démarre là, et le dernier morceau s'arrête ENC_SOLO temps après).
   Lot 49 (demande de l'utilisateur, après le lot 47 « niveaux plus courts ») : le drop dure 16 temps au lieu de 32. Entre deux
   transitions, le morceau jouait seul une phrase entière (environ 15 s) sans rien à faire ; c'est maintenant environ 7 s.
   Drop (16) + outro (32) ne font plus un multiple de 32 : les phrases (ENC_PHRASE temps) se comptent donc depuis la FIN du
   morceau qui joue. Une ligne PHRASE de la piste tombe au début de son outro (le moment de lancer un morceau qui a 32 temps
   d'intro) et à sa fin. Le break est resserré (drop 8, break 8, drop 16) pour que son morceau ne joue pas seul 23 s, et sa
   musique se vide hors d'une ligne PHRASE, comme avant (gardien du lot 49). */
const ENC_SOLO = 16, ENC_PHRASE = 32;
const ENC_I = ['k', 'h', 'p'], ENC_D = ['k', 'b', 'h', 'cl', 'c', 'lead', 'p', 'pad'], ENC_O = ['k', 'b', 'h', 'p'];
const ENC_FORMES = {
  normal: { drop: 32, p: [[0, 32, ENC_I, 'Intro'], [32, 48, ENC_D, 'Drop'], [48, 80, ENC_O, 'Outro']] },
  basse: { drop: 32, p: [[0, 32, ENC_I.concat('b'), 'Intro avec basse'], [32, 48, ENC_D, 'Drop'], [48, 80, ENC_O, 'Outro']] },
  court: { drop: 16, p: [[0, 16, ENC_I, 'Intro courte'], [16, 32, ENC_D, 'Drop'], [32, 64, ENC_O, 'Outro']] },
  break: { drop: 32, p: [[0, 32, ENC_I, 'Intro'], [32, 40, ENC_D, 'Drop'], [40, 48, ['pad', 'h'], 'Break'], [48, 64, ENC_D, 'Drop'], [64, 96, ENC_O, 'Outro']] }
};
const encFin = f => f.p[f.p.length - 1][1];
// où commencent les phrases du morceau (comptées depuis sa fin), pour les lignes PHRASE de la piste
const encPhrase = s => encFin(ENC_FORMES[s.forme]) % ENC_PHRASE;
const ENC_NOMS = ['Néon', 'Minuit', 'Velours', 'Lumière', 'Comète', 'Satin', 'Aurore', 'Mirage', 'Orbite', 'Écume', 'Saphir', 'Nuage', 'Opale', 'Zénith'];
/* ---------- La note ----------
   On part de 100. Calage : quand on entend les deux morceaux, ils restent calés à moins de ENC_OK ms. Basses : jamais deux
   basses ensemble plus de 2 temps. Volume : pas de trou de son. Phrase : chaque morceau part au bon moment (son drop tombe à la
   fin du morceau qui sort, lot 49), et les basses changent de morceau sur une phrase (de 16 temps). Chaque critère a son plafond (ENC_MAX) ; les malus (musique arrêtée, consigne
   pas suivie, morceau pas joué) s'ajoutent. Choix de l'utilisateur sur la maquette du 23 oct. 2026 ; seuils à régler après
   ses essais sur la FLX4, comme ceux des chapitres 5 et 6. */
const ENC_OK = 15, ENC_MAX = { calage: 35, basses: 25, volume: 20, phrase: 20 }, ENC_BLANC = 15, ENC_CONSIGNE = 5, ENC_RESTE = 30, ENC_3 = 90, ENC_2 = 75;
const ENC_CAT = { calage: 'calage', basses: 'basses', volume: 'volume', entree: 'phrase', swap: 'phrase' };
const ENC_TECH = { swap: 'un swap des basses', filtre: 'un filtre', echo: 'un écho', coupe: 'une coupure sèche' };
const ENC_TECH_COURT = { swap: 'swap', filtre: 'filtre', echo: 'écho', coupe: 'coupure' };
const ENC_TECH_COMMENT = {
  swap: 'Coupe les basses du morceau qui sort (LOW à gauche) et ouvre celles du morceau qui entre, dans le même geste.',
  filtre: 'Tourne le filtre du morceau qui sort vers la droite, lentement, avant de baisser son fader.',
  echo: 'Allume l’écho sur le dernier temps du morceau qui sort, puis coupe son fader d’un coup.',
  coupe: 'Baisse d’un coup le fader du morceau qui sort, au moment où l’autre arrive sur son drop.' };
/* ---------- Les niveaux ----------
   set.m : les morceaux, [tempo, forme, style] ; set.tech : la technique imposée de chaque transition ; set.casque : chaque
   morceau doit être écouté au casque avant d'entrer ; set.montee : le tempo à atteindre à la fin, sans saut ; set.tirage :
   morceaux tirés au hasard à chaque partie. aides : BPM des platines, compteur de décalage, phrases sur la piste (sans elles,
   la piste s'arrête à MAINTENANT), note en direct et conseils de Vini. */
const ENC_TOUT = { bpm: true, decal: true, phrases: true, note: true };
const CH7_LESSONS = [
  { title: 'Premier enchaînement', goal: 'Enchaîne trois morceaux sans jamais arrêter la musique.',
    how: 'Le premier morceau joue sur la platine A. Lance le suivant sur B (PLAY de droite) au début d’une phrase, quand une ligne PHRASE touche MAINTENANT. Cale-le à la molette, monte son fader, puis fais sortir le premier avant la fin de son outro. Le troisième se charge tout seul sur A : recommence. Les trois morceaux ont le même tempo.',
    set: { m: [[124], [124], [124]], aides: ENC_TOUT } },
  { title: 'Les tempos bougent', goal: 'Trois morceaux qui n’ont pas le même tempo : règle chacun avant de le faire entrer.',
    how: 'Chaque morceau a son tempo, affiché sur sa platine. Avant de monter le fader du morceau qui entre, règle son TEMPO pour qu’il ait le même BPM que celui qui joue, puis cale-le à la molette.',
    set: { m: [[122], [124], [126]], aides: ENC_TOUT } },
  { title: 'Transitions imposées', goal: 'Quatre morceaux, et une technique pour chaque transition : swap, filtre, puis écho.',
    how: 'La feuille de route donne la technique de chaque transition. Swap : coupe les basses du morceau qui sort et ouvre celles du morceau qui entre, dans le même geste. Filtre : tourne le filtre du morceau qui sort vers la droite, lentement, avant de baisser son fader. Écho : allume l’écho sur le dernier temps, puis coupe le morceau qui sort.',
    set: { m: [[123], [125, 'basse'], [124], [126]], tech: ['swap', 'filtre', 'echo'], aides: ENC_TOUT } },
  { title: 'Morceaux pièges', goal: 'Une intro courte, un break, une intro avec basse, puis de la techno : lis chaque morceau.',
    how: 'Regarde la piste avant de lancer. « Intro courte » : 16 temps seulement. « Break » : la musique se vide au milieu, ce n’est pas la fin. « Intro avec basse » : coupe son LOW avant de le faire entrer. Le dernier morceau est de la techno, plus rapide. Plus de BPM affiché sur les platines.',
    set: { m: [[124, 'court'], [124, 'break'], [125, 'basse'], [128, 'normal', 'techno']], aides: { bpm: false, decal: true, phrases: true, note: true } } },
  { title: 'Au casque', goal: 'Prépare chaque morceau au casque avant de le faire entrer. Plus de compteur de décalage.',
    how: 'Lance le morceau suivant fader en bas et allume son CUE 🎧 : tu l’entends au casque, la salle ne l’entend pas. Cale-le à l’oreille (tempo, puis molette), puis monte son fader sur une phrase. Sans sortie casque sur ta table, il est joué tout bas dans les enceintes.',
    set: { m: [[122], [125], [121, 'basse'], [124]], casque: true, aides: { bpm: false, decal: false, phrases: true, note: true } } },
  { title: 'La montée', goal: 'Cinq morceaux de plus en plus rapides : fais monter la soirée de 120 à 128 BPM, en douceur.',
    how: 'Chaque morceau est 2 BPM plus rapide que le précédent. Cale-le sur celui qui joue, puis, une fois seul, ramène-le petit à petit à son vrai tempo : la soirée monte toute seule. Le tempo ne doit jamais sauter d’un coup, et la soirée doit finir à 126 BPM ou plus.',
    set: { m: [[120], [122], [124], [126], [128]], montee: 126, aides: { bpm: true, decal: false, phrases: true, note: true } } },
  { title: 'Le grand set', goal: 'Le final : six morceaux surprise, de 120 à 130 BPM, sans aucune aide.',
    how: 'Ni BPM, ni compteur de décalage, ni phrases dessinées, ni note en direct : la piste s’arrête à MAINTENANT. Les morceaux changent à chaque partie. Tout se fait à l’oreille : lancer sur la phrase, caler, échanger les basses, faire sortir. La note s’affiche à la fin.',
    set: { tirage: true, aides: { bpm: false, decal: false, phrases: false, note: false } } }
];
// Toute la table sert, sauf les pads (cachés au set : sans eux, la table tient sous la piste sur un écran de PC)
const ENC_SHOW = ['gPlay', 'gCueA', 'gCueB', 'gFad', 'gLow', 'gMid', 'gMidB', 'gHi', 'gTrim', 'gCfx', 'gCfxB', 'gEcho', 'gTempoA', 'gTempoB', 'gJogA', 'gJogB', 'gCasqueA', 'gCasqueB', 'gXf'];
// depart : la position de départ ne demande que les faders et les LOW (avec 8 lignes, « Jouer » sortait de l'écran, gardien)
CH7_LESSONS.forEach(l => Object.assign(l, { kind: 'set', show: ENC_SHOW, user: ['faderA', 'faderB', 'lowA', 'lowB', 'cfxA', 'midA', 'midB'], depart: ['faderA', 'faderB', 'lowA', 'lowB'],
  init: { faderA: 1, faderB: 0, lowA: .5, lowB: .5, cfxA: .5, midA: .5, midB: .5 }, autoLaunch: false, launchBeat: 0, bCue: 0, bBass: false,
  start: 0, end: 1e6, btn: ['echo'], targets: [], caps: [] }));
// Records sur 100 (clé coach-set : { best: { numéro de niveau: note } }), validés à la lecture
let encRecords = {};
try { const v = JSON.parse(localStorage.getItem('coach-set') || '{}'); if (v && v.best && typeof v.best === 'object' && !Array.isArray(v.best))
  for (const [k, x] of Object.entries(v.best)) if (/^\d$/.test(k) && Number.isInteger(x) && x >= 0 && x <= 100) encRecords[k] = x; } catch (e) {}

/* ---------- Les morceaux d'un niveau ---------- */
const encDeck = i => i % 2 ? 'B' : 'A', encAutre = k => k === 'A' ? 'B' : 'A';
// Le grand set : six morceaux tirés au hasard (tempos voisins, une forme piège de temps en temps, parfois de la techno)
function encTirage(l){
  const r = () => Math.random(), out = []; let b = 120 + Math.floor(r() * 4), cassure = false;
  for (let i = 0; i < 6; i++){
    if (i) b = Math.max(120, Math.min(130, b + [-2, -1, 1, 2, 3, 4][Math.floor(r() * 6)]));
    let f = ['normal', 'basse', 'court', 'normal'][Math.floor(r() * 4)];
    if (i > 0 && i < 5 && !cassure && r() < .3){ f = 'break'; cassure = true; }
    out.push([b, f, b >= 127 && r() < .5 ? 'techno' : 'house']);
  }
  l.set.graine = Math.floor(r() * 997); return out;
}
function encSpecs(l){
  const n = CH7_LESSONS.indexOf(l), m = l.set.tirage ? (l.set.tir || (l.set.tir = encTirage(l))) : l.set.m;
  return m.map(([bpm, forme = 'normal', style = 'house'], i) => ({ i, bpm, forme, style, k: encDeck(i), nom: ENC_NOMS[(n * 3 + i) % ENC_NOMS.length],
    seed: STYLE_DEFS[style].seed + 500 + n * 37 + i * 101 + (l.set.tirage ? l.set.graine || 0 : 0) }));
}
// Les morceaux sont fabriqués par le site (Workers) : les deux premiers dès le choix du niveau, les suivants pendant le set.
// Une fois sur une platine, un morceau ne garde que son AudioBuffer (environ 17 Mo par morceau), et ceux qui ont fini de
// jouer sont oubliés (sauf les deux premiers, gardés pour rejouer tout de suite).
const encCache = new Map();
const encCle = s => [s.style, s.k, s.seed, s.bpm, s.forme].join(':');
function encMorceau(s, encore = true){
  const c = encCle(s);
  if (!encCache.has(c)){ const p = renderSong(s.style, s.k, s.seed, ENC_FORMES[s.forme].p.map(([a, z, f]) => [a, z, f]), { tail: 2 }, s.bpm);
    encCache.set(c, p); p.catch(() => { if (encCache.get(c) === p) encCache.delete(c); }); }
  return encCache.get(c).catch(e => { if (encore) return encMorceau(s, false); throw e; });
}
function encGarde(l){ const garde = new Set(encSpecs(l).slice(0, 2).map(encCle)); for (const c of [...encCache.keys()]) if (!garde.has(c)) encCache.delete(c); }
function encPrepare(l){ if (!hasWorkers()) return; encGarde(l); for (const s of encSpecs(l).slice(0, 2)) encMorceau(s).catch(() => {}); }
// Durée approximative d'un set joué proprement : chaque morceau joue jusqu'à ce que le suivant prenne le relais
function encDuree(sp){
  let s = 0;
  sp.forEach((x, i) => { const f = ENC_FORMES[x.forme], debut = i ? 0 : f.drop, fin = i < sp.length - 1 ? encFin(f) - ENC_FORMES[sp[i + 1].forme].drop : f.drop + ENC_SOLO;
    s += (fin - debut) * 60 / x.bpm; });
  return s;
}
const encMinutes = s => { const t = Math.round(s / 10) * 10, m = Math.floor(t / 60), r = t % 60; return !m ? `${r} s` : r ? `${m} min ${r}` : `${m} min`; };
function encEtiquette(l){
  const sp = encSpecs(l), bp = sp.map(s => s.bpm), mn = Math.min(...bp), mx = Math.max(...bp);
  const tempo = l.set.tirage ? 'de 120 à 130 BPM' : !l.set.aides.bpm ? 'tempos à trouver' : mn === mx ? `${mn} BPM` : `de ${mn} à ${mx} BPM`;
  return `${sp.length} morceaux · ${tempo} · environ ${encMinutes(encDuree(sp))}`;
}

/* ---------- Avant de jouer : la feuille de route et « Comment c'est noté ? » ---------- */
function encAvant(l){
  const sp = encSpecs(l), ol = $('setRouteList'); ol.textContent = '';
  $('setRouteNote').textContent = l.set.tirage ? 'Six morceaux surprise, de 120 à 130 BPM : ils changent à chaque partie.' : '';
  if (!l.set.tirage) sp.forEach((s, i) => {
    if (i){ const sep = document.createElement('li'); sep.className = 'sep'; sep.setAttribute('aria-hidden', 'true'); sep.textContent = '›';
      const tech = l.set.tech && l.set.tech[i - 1]; if (tech){ const t = document.createElement('small'); t.textContent = ENC_TECH_COURT[tech]; sep.appendChild(t); } ol.appendChild(sep); }
    const x = document.createElement('li'), tag = document.createElement('span'), b = document.createElement('b');
    tag.className = 'enctag ' + s.k.toLowerCase(); tag.textContent = s.k; b.textContent = `« ${s.nom} »`; x.append(tag, b);
    if (l.set.aides.bpm){ const sm = document.createElement('small'); sm.textContent = s.bpm + ' BPM'; x.appendChild(sm); }
    if (l.set.tech && i){ x.setAttribute('aria-label', `${s.nom}, après ${ENC_TECH[l.set.tech[i - 1]]}`); }
    ol.appendChild(x); });
  $('setNoteTxt').textContent = encNoteTexte(l);
}
function encNoteTexte(l){
  const L = ['Tu pars de 100 points.',
    `Calage (35 points) : quand on entend les deux morceaux, ils restent calés à moins de ${ENC_OK} ms.`,
    'Basses (25) : jamais deux basses en même temps plus de 2 temps.',
    'Volume (20) : pas de trou de son pendant une transition.',
    'Phrase (20) : chaque morceau part au bon moment (son drop tombe pile à la fin du précédent), et les basses changent de morceau sur une phrase.',
    `Musique arrêtée : −${ENC_BLANC}. Morceau pas joué : −${ENC_RESTE}.`];
  if (l.set.tech) L.push(`Technique pas respectée : −${ENC_CONSIGNE}.`);
  if (l.set.casque) L.push(`Morceau pas écouté au casque avant d’entrer : −${ENC_CONSIGNE}.`);
  if (l.set.montee) L.push(`Tempo qui saute d’un coup : −${ENC_CONSIGNE}. Soirée finie sous ${l.set.montee} BPM : −${ENC_CONSIGNE}.`);
  L.push(`★★★ à partir de ${ENC_3}, ★★ à partir de ${ENC_2}.`,
    'Les deux platines jouent chacune leur tour : le morceau suivant se charge tout seul sur la platine qui vient de se libérer.');
  return L.join('\n');
}

/* ---------- Départ ---------- */
// Un morceau sur une platine, arrêté au début (comme un morceau qu'on vient de charger dans rekordbox)
function encCharge(k, song, s){
  const d = deck[k]; stop(k);
  if (!song.buf){ song.buf = bufferOf(song); song.L = song.R = null; }
  Object.assign(d, { buf: song.buf, per: 60 / s.bpm, bend: 0, secu: null, boucle: null, cue: 0, cues: [null, null, null, null], ancP: 0, ancT: ac.currentTime, joue: false });
  d.rate = plVitesseVoulue(k); renderPads(k);
}
// Appelé par startRun à la place de son propre départ (les deux premiers morceaux d'abord, les suivants pendant le set)
async function encDemarre(demo){
  const l = LESSONS[li], myLi = li, sp = encSpecs(l);
  let a, b;
  try { [a, b] = await Promise.all([encMorceau(sp[0]), encMorceau(sp[1])]); }
  catch (e){ preparing = false; $('watchBtn').disabled = false; setStartBtn(false); say('Les morceaux n’ont pas pu se préparer : réessaie.'); return; }
  preparing = false; $('watchBtn').disabled = false;
  if (li !== myLi || chapter !== 7 || run){ setStartBtn(false); return; }
  const S = { sp, cur: 0, en: { A: 0, B: 1 }, pertes: new Map(), tr: sp.map(() => ({})), ep: { basse: 0, creux: 0, blanc: 0, sortie: 0, blancCompte: false },
    lastT: ac.currentTime, decal: null, echoTail: 0, tRef: null, sautAt: -1e9, recharge: null, score: 100, robot: !!window.ENC_ROBOT };
  BPM = sp[0].bpm; P = 60 / BPM; START = 0; END = 1e6;
  Object.assign(ctrl, CTRL_NEUTRE, l.init); if (needSetup()) for (const k of l.user) if (phys[k] != null) ctrl[k] = phys[k]; applyCtrl();
  casque.A = casque.B = false; plCasque(); $('casqueA').setAttribute('aria-pressed', 'false'); $('casqueB').setAttribute('aria-pressed', 'false');
  setEcho(false); plQuantize = true;
  encCharge('A', a, sp[0]); encCharge('B', b, sp[1]);
  const t0 = ac.currentTime + .15; plDemarre('A', t0, ENC_FORMES[sp[0].forme].drop * deck.A.per);
  run = { gT: performance.now(), t0, launch: null, frames: [], lowBAtLaunch: null, status: {}, popped: {}, lastBeat: -1, demo, cap: 0, ear: false, ch: 7, expert: false, set: S };
  viniCale();
  $('stage').classList.add('running'); $('stage').classList.toggle('demo', demo); $('demoTag').hidden = !demo;
  $('watchBtn').disabled = true; $('result').hidden = true; setStartBtn(true); $('setup').hidden = true; $('plan').hidden = true;
  $('startBtn').disabled = false; $('startBtn').classList.remove('ready'); $('startBtn').blur();
  $('launchB').disabled = demo; $('echoBtn').disabled = demo;
  // Avec une table branchée, la table dessinée à l'écran est rangée : la vraie est devant le joueur (maquette du 23 oct.)
  const rangee = !demo && tableOn() && !mouseMode; $('stage').classList.toggle('rangee', rangee); $('setRange').hidden = !rangee; encRangeTexte();
  $('setLigne').hidden = false; encLigne(S);
  $('hint').textContent = demo ? 'Démonstration : écoute comment les morceaux s’enchaînent.' : 'Astuce : la barre d’espace lance le morceau qui attend.';
  say(demo ? 'Démonstration : écoute comment les morceaux s’enchaînent.' : l.set.aides.note ? `« ${sp[0].nom} » joue. Prépare « ${sp[1].nom} » sur B.` : 'Sans filet : à toi, à l’oreille.');
  if (sp.length > 2) encMorceau(sp[2]).catch(() => {});
}
function encRangeTexte(){ const r = $('stage').classList.contains('rangee'); $('setRangeTxt').textContent = r ? 'Ta table est branchée : la table à l’écran est rangée.' : 'La table à l’écran est affichée.'; $('setTableBtn').textContent = r ? 'Afficher la table' : 'Ranger la table'; }
$('setTableBtn').addEventListener('click', () => { $('stage').classList.toggle('rangee'); encRangeTexte(); });
// Fin de partie (stopRun) : on range ce qui n'appartient qu'au set
function encStop(){ $('setLigne').hidden = true; $('setRange').hidden = true; $('stage').classList.remove('rangee'); if (LESSONS[li] && LESSONS[li].set) encGarde(LESSONS[li]); }
// PLAY de la platine qui attend (barre d'espace) ; PLAY de A et de B restent des PLAY/pause ordinaires
function encLance(){
  if (!run || !run.set || run.demo) return; const S = run.set, n = S.cur + 1; if (n >= S.sp.length) return;
  const k = encDeck(n); if (S.en[k] !== n || deck[k].joue) return; ensureAudio(); plLecture(k);
}
// L'écho s'applique au morceau en cours (celui qui va sortir)
function encEcho(){ if (!run || !run.set || run.demo) return; setEcho(!echoOn, encDeck(run.set.cur)); }

/* ---------- Pendant le set ---------- */
const encVide = { i: null, joue: false, p: 0, basse: false, x: 0, s: null, f: null };
// L'état d'une platine : où en est son morceau (x, en temps du morceau), est-ce qu'on l'entend (p, de 0 à environ 1), et
// est-ce que ses basses s'entendent
function encVoie(k, S){
  const i = S.en[k], d = deck[k]; if (i == null || !d.buf) return encVide;
  const s = S.sp[i], f = ENC_FORMES[s.forme], x = plPos(k) / d.per, joue = d.joue && x >= 0 && x < encFin(f);
  const part = joue ? f.p.find(([a, z]) => x >= a && x < z) : null, fa = ctrl['fader' + k], cfx = ctrl['cfx' + k], xf = xfGain(ctrl.xfader, k);
  const filtre = cfx > .8 || cfx < .2 ? .45 : cfx > .65 || cfx < .35 ? .75 : 1;
  const p = part ? fa * fa * xf * Math.min(1.5, db2g(trimDb(ctrl['trim' + k]))) * filtre * (part[2].includes('k') ? 1 : .6) : 0;
  const basse = !!part && part[2].includes('b') && fa > .3 && xf > .3 && ctrl['low' + k] > .25 && cfx < .7;
  return { i, joue, p, basse, x, s, f };
}
function encPerte(S, type, n, pts, q = {}, msg = ''){
  const c = type + ':' + n, p = S.pertes.get(c) || { type, n, pts: 0, q: {} }, avant = Math.round(p.pts);
  p.pts += pts; for (const [k, v] of Object.entries(q)) p.q[k] = k === 'temps' || k === 'sec' ? (p.q[k] || 0) + v : v;
  S.pertes.set(c, p);
  // la bulle annonce la perte (pas au niveau sans aide, ni pendant la démo, ni à la fin : finish a déjà arrêté la partie)
  const vu = LESSONS[li].set.aides.note && !!run && !run.demo, plus = Math.round(p.pts) - avant;
  if (vu && msg && plus >= 1) pop(`${msg} −${plus}`, plus >= 5 ? 'bad' : 'mid');
  else if (vu && type === 'calage' && Math.floor(p.pts / 3) > Math.floor((p.pts - pts) / 3)) pop('Pas calés !', 'mid');
}
// Les pertes à afficher, plus grosse d'abord : arrondies, avec le plafond de chaque critère
function encListe(S){
  const tot = { calage: 0, basses: 0, volume: 0, phrase: 0 }, out = [];
  for (const p of S.pertes.values()){
    let v = Math.round(p.pts); if (p.type === 'saut') v = Math.min(v, 2 * ENC_CONSIGNE);
    const cat = ENC_CAT[p.type]; if (cat){ v = Math.min(v, ENC_MAX[cat] - tot[cat]); tot[cat] += v; }
    if (v >= 1) out.push(Object.assign({}, p, { v }));
  }
  return out.sort((a, b) => b.v - a.v);
}
const encScore = S => (S.score = Math.max(0, 100 - encListe(S).reduce((t, p) => t + p.v, 0)));
const encEtoiles = sc => sc >= ENC_3 ? 3 : sc >= ENC_2 ? 2 : 1;
function encFrame(){
  const S = run.set, l = LESSONS[li], A = l.set.aides, N = S.sp.length, t = ac.currentTime, dt = Math.min(.1, Math.max(0, t - S.lastT)); S.lastT = t;
  if (run.demo || S.robot) encAutomate(S, dt);
  const n = S.cur + 1 < N ? S.cur + 1 : null, km = encDeck(S.cur), kn = encAutre(km), tr = n != null ? S.tr[n] : null;
  const vm = encVoie(km, S), vn = n != null && S.en[kn] === n ? encVoie(kn, S) : encVide;
  const perM = deck[km].per / (deck[km].rate || 1), db = dt / perM, ici = n ?? S.cur;
  // l'écho résonne encore quelques temps après la coupure du morceau qui sort : ce n'est pas un trou de son
  if (echoOn && echoDeck === km && ctrl['fader' + km] < .1 && !S.echoTail) S.echoTail = t + 4 * perM;
  const queue = S.echoTail && t < S.echoTail ? .5 : 0, am = vm.p > .15, an = vn.p > .15;
  S.decal = vm.joue && vn.joue ? plDecalage() : null;   // positif : B en avance
  // Calage : seulement quand on entend les deux morceaux
  if (am && an && S.decal != null){ const a = Math.abs(S.decal); if (a > ENC_OK) encPerte(S, 'calage', ici, dt * (a > 40 ? 1 : .5) / 2.4, { sec: dt }); }
  // Basses : deux basses ensemble, compté en temps (le premier temps est permis : c'est l'instant du swap)
  if (vm.basse && vn.basse) S.ep.basse += db;
  else if (S.ep.basse){ const nb = S.ep.basse; S.ep.basse = 0; if (nb > 1.5) encPerte(S, 'basses', ici, nb - 1, { temps: nb }, 'Deux basses ensemble !'); }
  // Volume : un trou de son, ou plus de musique du tout
  const musique = vm.joue || vn.joue, pres = Math.max(vm.p, vn.p, queue);
  if (!musique){ S.ep.creux = 0; S.ep.blanc += db;
    if (S.ep.blanc > 2 && !S.ep.blancCompte){ S.ep.blancCompte = true; encPerte(S, 'blanc', ici, ENC_BLANC, { nom: vm.s ? vm.s.nom : S.sp[S.cur].nom }, 'La musique s’est arrêtée !'); }
    if (S.ep.blanc > 16){ finish(); return; } }
  else { S.ep.blanc = 0; S.ep.blancCompte = false;
    if (pres < .3) S.ep.creux += db;
    else if (S.ep.creux){ const nc = S.ep.creux; S.ep.creux = 0; if (nc > 1.5) encPerte(S, 'volume', ici, nc - 1, { temps: nc, seul: !vn.joue, nom: S.sp[S.cur].nom }, 'Le son a baissé !'); } }
  if (tr){
    // Avant d'entrer : écouté au casque ?
    if (!tr.entre && vn.joue && casque[kn]) tr.casqueT = (tr.casqueT || 0) + db;
    // Phrase : le morceau qui entre est-il parti au bon moment ? Son drop doit tomber à la fin du morceau qui sort (mesuré quand
    // on commence à l'entendre). Lot 49 : c'est ce qui punit les deux pièges (lancer pendant le break, ou lancer une intro
    // courte comme une intro normale), depuis que les parties des morceaux du set ne tombent plus sur des phrases de 32 temps.
    if (!tr.entre && an){
      if (vm.joue){ const tombe = vm.x + ENC_FORMES[vn.s.forme].drop - vn.x, e = tombe - encFin(vm.f), d = Math.abs(e);
        tr.entre = { d }; tr.avait = vm.basse;
        if (d >= .5) encPerte(S, 'entree', n, Math.min(8, Math.round(d)), { d: Math.round(d), sens: e > 0 ? 'après' : 'avant' }, `« ${vn.s.nom} » n’est pas parti au bon moment`); }
      else tr.entre = { d: 0 };
    }
    if (tr.entre){
      // Phrase : les basses passent d'un morceau à l'autre au début d'une phrase (de 16 temps)
      if (!tr.basses){ if (vm.basse) tr.avait = true;
        if (vn.basse && !vm.basse && tr.avait){ const x = vn.x - ENC_FORMES[vn.s.forme].drop, r = ((x % 16) + 16) % 16, d = Math.min(r, 16 - r);
          tr.basses = { d }; tr.eq = ctrl['fader' + km] > .3 && ctrl['low' + km] < .25;
          if (d >= .75) encPerte(S, 'swap', n, Math.min(4, Math.round(d)), { d: Math.round(d) }, 'Basses pas sur la phrase'); } }
      // Technique (niveau 3) : filtre, coupure, écho
      if (ctrl['cfx' + km] >= .85 && vm.p > .05) tr.filtre = true;
      const fm = ctrl['fader' + km];
      if (fm >= .7) tr.hautT = t;
      else if (fm <= .1 && tr.hautT != null && !tr.coupeVu){ tr.coupeVu = true; tr.coupe = t - tr.hautT <= 1.2 * perM; tr.echo = echoOn && echoDeck === km; }
      // Fin de la transition : le morceau qui sort ne s'entend plus (2 temps), celui qui entre s'entend
      if (vm.p < .05 || !vm.joue) S.ep.sortie += db; else S.ep.sortie = 0;
      if ((S.ep.sortie >= 2 || !vm.joue) && an){ encFinTransition(S, n, km); encFinSet(S); if (!run) return; encAffiche(S, A); return; }
    }
  }
  // La montée : le tempo du morceau en cours ne doit pas sauter d'un coup (plus de 1,5 % en 2 temps) quand il joue seul
  if (l.set.montee && am && !an && !run.demo){ const eff = vm.s.bpm * (1 + plTempoPct(km));
    if (!S.tRef) S.tRef = { t, eff };
    else if (t - S.tRef.t >= 2 * perM){ if (Math.abs(eff - S.tRef.eff) / S.tRef.eff > .015 && t - S.sautAt > 8 * perM){ S.sautAt = t; encPerte(S, 'saut', S.cur, ENC_CONSIGNE, { nom: vm.s.nom }, 'Le tempo a sauté !'); } S.tRef = { t, eff }; } }
  else S.tRef = null;
  // La platine libérée reçoit le morceau suivant
  if (S.recharge && t >= S.recharge.at){ const k = S.recharge.k; if (encVoie(k, S).p < .05){ S.recharge = null; const i = Math.max(S.en.A ?? -1, S.en.B ?? -1) + 1; if (i < N) encSuivant(S, k, i); else { stop(k); S.en[k] = null; } } }
  if (encFinSet(S)) return;
  encAffiche(S, A, vm, vn, km, kn);
}
// Le dernier morceau a joué son drop : le set est fini
function encFinSet(S){ const k = encDeck(S.cur), v = encVoie(k, S); if (S.cur === S.sp.length - 1 && v.s && v.x >= ENC_FORMES[v.s.forme].drop + ENC_SOLO){ finish(); return true; } return false; }
function encFinTransition(S, n, km){
  const l = LESSONS[li], tr = S.tr[n], tech = l.set.tech && l.set.tech[n - 1];
  if (tech && !(tech === 'swap' ? tr.eq : tech === 'filtre' ? tr.filtre : tech === 'echo' ? tr.echo : tr.coupe)) encPerte(S, 'consigne', n, ENC_CONSIGNE, { tech }, `Il fallait ${ENC_TECH[tech]}`);
  if (l.set.casque && !(tr.casqueT >= 2)) encPerte(S, 'casque', n, ENC_CONSIGNE, {}, 'Pas écouté au casque');
  tr.fini = true; S.cur = n; S.ep.sortie = 0; S.echoTail = 0; S.tRef = null;
  S.recharge = { k: km, at: ac.currentTime + 2 * deck[encDeck(n)].per };
  if (l.set.aides.note && !run.demo) viniReagit('ok');
  encLigne(S);
}
function encSuivant(S, k, i){
  S.en[k] = null; stop(k);
  // les morceaux déjà joués sont oubliés (sauf les deux premiers, gardés pour rejouer)
  for (let j = 2; j < i - 1; j++) encCache.delete(encCle(S.sp[j]));
  encMorceau(S.sp[i]).then(song => {
    if (!run || run.set !== S) return;
    encCharge(k, song, S.sp[i]); S.en[k] = i; if (echoOn && echoDeck === k) setEcho(false);
    if (run.demo || S.robot) encRemet(k);
    encLigne(S); if (i + 1 < S.sp.length) encMorceau(S.sp[i + 1]).catch(() => {});
  }).catch(() => {});
}
// Démo : la platine libérée revient en position de départ (fader en bas, potards au milieu, casque coupé)
function encRemet(k){ Object.assign(ctrl, { ['fader' + k]: 0, ['low' + k]: .5, ['cfx' + k]: .5, ['tempo' + k]: .5 }); casque[k] = false; plCasque(); $('casque' + k).setAttribute('aria-pressed', 'false'); applyCtrl(); }
// Ce qui s'affiche pendant le set : la note (ou « ? » sans aide), la ligne de route, les conseils de Vini, la piste
function encAffiche(S, A, vm, vn, km, kn){
  const sc = encScore(S);
  if (A.note){ $('cdNum').textContent = sc; $('cdLab').textContent = '/ 100'; } else { $('cdNum').textContent = '?'; $('cdLab').textContent = 'à la fin'; }
  $('ring').classList.remove('hot');
  const v = vm || encVoie(encDeck(S.cur), S);
  $('progFill').style.width = clamp01((S.cur + (v.f ? clamp01(v.x / encFin(v.f)) : 0)) / S.sp.length) * 100 + '%';
  if (run.demo) showAction('Démonstration : écoute comment les morceaux s’enchaînent.');
  else if (A.note && vm) showAction(encConseil(S, vm, vn, km, kn));
  setFocus([]); drawHighway(beatNow());
}
// Le conseil de Vini : ce qu'il y a à faire maintenant, en une phrase
function encConseil(S, vm, vn, km, kn){
  const l = LESSONS[li], n = S.cur + 1, cur = S.sp[S.cur].nom;
  if (n >= S.sp.length) return `« ${cur} » termine le set : laisse-le jouer.`;
  const nom = S.sp[n].nom, out = cur, tech = l.set.tech && l.set.tech[n - 1];
  if (S.en[kn] !== n) return `« ${cur} » joue seul. Le morceau suivant arrive sur la platine ${kn}.`;
  // pendant un break, Vini prévient : ce n'est pas la fin (avant, il disait de lancer sur la phrase, en plein piège : gardien)
  if (!deck[kn].joue && vm.joue && (vm.f.p.find(([a, z]) => vm.x >= a && vm.x < z) || [])[3] === 'Break') return `« ${cur} » est dans son break : ce n’est pas la fin, il va repartir. Attends avant de lancer « ${nom} ».`;
  if (!deck[kn].joue) return `Lance « ${nom} » sur la platine ${kn} pour que son drop tombe pile à la fin de « ${cur} »${l.set.aides.phrases ? ' (regarde où il tomberait, en pointillé)' : ''}${l.set.casque ? ', fader en bas et CUE 🎧 allumé' : ''}.`;
  if (vn.p <= .15){
    if (l.set.aides.decal && S.decal != null && Math.abs(S.decal) <= ENC_OK) return `« ${nom} » est calé : monte son fader sur une phrase.`;
    return l.set.casque ? `Cale « ${nom} » au casque (tempo, puis molette), puis monte son fader.` : `Cale « ${nom} » (tempo, puis molette), puis monte son fader sur une phrase.`;
  }
  if (tech === 'filtre') return `Tourne le filtre de « ${out} » vers la droite, puis baisse son fader.`;
  if (tech === 'echo') return `Allume l’écho sur le dernier temps de « ${out} », puis coupe son fader.`;
  if (tech === 'coupe') return `Coupe « ${out} » d’un coup quand « ${nom} » arrive sur son drop.`;
  return `Échange les basses sur une phrase, puis fais sortir « ${out} ».`;
}
// La ligne au-dessus de la piste : « Morceau 2 sur 4 », les points, et la prochaine transition
function encLigne(S){
  const l = LESSONS[li], N = S.sp.length, el = $('setLigne'); el.textContent = '';
  const b = document.createElement('b'); b.textContent = `Morceau ${S.cur + 1} sur ${N}`; el.appendChild(b);
  const dots = document.createElement('span'); dots.className = 'encdots'; dots.setAttribute('aria-hidden', 'true');
  for (let i = 0; i < N; i++){ const d = document.createElement('i'); if (i < S.cur) d.className = 'f'; else if (i === S.cur) d.className = 'c ' + encDeck(i).toLowerCase(); dots.appendChild(d); }
  el.appendChild(dots);
  const n = S.cur + 1;
  if (l.set.aides.note && n < N){ const e = document.createElement('span'), tech = l.set.tech && l.set.tech[n - 1], tg = document.createElement('span');
    e.className = 'ens'; e.append('Ensuite : ');
    if (tech){ const em = document.createElement('b'); em.textContent = ENC_TECH_COURT[tech]; e.append(em, ' vers '); }
    tg.className = 'enctag ' + encDeck(n).toLowerCase(); tg.textContent = encDeck(n); e.append(tg, ` « ${S.sp[n].nom} »`); el.appendChild(e); }
}

/* ---------- La démo (et le « robot » des tests) ----------
   Le set joué proprement : le morceau suivant part pile sur la phrase (son drop tombe à la fin du morceau en cours), au même
   tempo ; son fader monte sur 16 temps (après 8 temps au casque au niveau 5) ; les basses passent de l'un à l'autre au
   début d'une phrase ; le morceau en cours sort avec la technique demandée. À la montée, chaque morceau revient doucement à
   son vrai tempo une fois seul (environ 1 % toutes les 6 temps : avec 16 temps seul, 2 BPM de rattrapage tiennent). */
function encAutomate(S, dt){
  const l = LESSONS[li], N = S.sp.length, km = encDeck(S.cur), kn = encAutre(km), n = S.cur + 1, t = ac.currentTime, dm = deck[km];
  if (!dm.buf) return;
  const sm = S.sp[S.cur], xm = plPos(km) / dm.per, finM = encFin(ENC_FORMES[sm.forme]), perM = dm.per / (dm.rate || 1);
  let ch = false; const met = (k, v) => { v = clamp01(v); if (Math.abs(ctrl[k] - v) > .002){ ctrl[k] = v; ch = true; } }, rampe = (x, a, z) => clamp01((x - a) / (z - a));
  const dn = n < N && S.en[kn] === n ? deck[kn] : null;
  // (sans passer par met : un pas par image est plus petit que son seuil, et le tempo ne bougeait jamais, défaut trouvé au lot 49)
  if (l.set.montee && !(dn && dn.joue)){ const v = ctrl['tempo' + km], pas = .01 * dt / perM; if (Math.abs(v - .5) > .001){ ctrl['tempo' + km] = v + Math.sign(.5 - v) * Math.min(pas, Math.abs(.5 - v)); ch = true; } }
  if (dn && dn.buf){
    const sn = S.sp[n], fn = ENC_FORMES[sn.forme], L = finM - fn.drop, basseIntro = fn.p[0][2].includes('b'), tech = l.set.tech && l.set.tech[n - 1];
    if (!dn.joue && xm >= L - 8){ met('tempo' + kn, .5 - (sm.bpm * (1 + plTempoPct(km)) / sn.bpm - 1) / (2 * PL_TEMPO)); met('low' + kn, basseIntro ? 0 : .5); }
    // le lancement, à l'instant exact où le morceau en cours arrive au temps L
    if (!dn.joue && xm >= L - 1 && xm < L){ if (ch){ applyCtrl(); ch = false; } plDemarre(kn, t + (L - xm) * perM, 0); }
    if (l.set.casque){ const on = dn.joue && xm < L + 8; if (casque[kn] !== on){ casque[kn] = on; plCasque(); $('casque' + kn).setAttribute('aria-pressed', String(on)); } }
    if (dn.joue && xm >= L - 1){
      met('fader' + kn, rampe(xm, L + (l.set.casque ? 8 : 0), L + 16));
      if (basseIntro && xm >= L + 16){ met('low' + km, 0); met('low' + kn, .5); }
      if (tech === 'filtre'){ met('cfx' + km, .5 + .5 * rampe(xm, L + 16, L + 30)); if (xm >= finM - .1) met('fader' + km, 0); }
      else if (tech === 'echo'){ if (xm >= finM - 1 && !echoOn) setEcho(true, km); if (xm >= finM - .1) met('fader' + km, 0); }
      else if (tech === 'coupe'){ if (xm >= finM - .1) met('fader' + km, 0); }
      else met('fader' + km, 1 - rampe(xm, finM - 8, finM));
    }
  }
  if (ch) applyCtrl();
}

/* ---------- La piste du set ----------
   Chaque platine montre les parties de son morceau, placées selon sa vraie position et sa vitesse : quand les tempos
   diffèrent, les deux couloirs ne défilent pas à la même vitesse. Les phrases sont celles du morceau en cours. Un morceau
   chargé mais pas lancé est dessiné en pointillé là où il tomberait si on le lançait maintenant. */
function encDessine(g, w, h, hitX, ppb, yA, yB, H){
  const l = LESSONS[li], A = l.set.aides, S = run && run.set, sp = S ? S.sp : encSpecs(l), Y = { A: yA, B: yB };
  const fit = (t, max) => { if (g.measureText(t).width <= max) return t; while (t.length > 1 && g.measureText(t + '…').width > max) t = t.slice(0, -1); return t + '…'; };
  let km = 'A', xm = ENC_FORMES[sp[0].forme].drop, perM = 60 / sp[0].bpm, off = encPhrase(sp[0]);
  if (S){ km = encDeck(S.cur); const d = deck[km]; if (d.buf){ xm = plPos(km) / d.per; perM = d.per / (d.rate || 1); } off = encPhrase(S.sp[S.cur]); }
  // une ligne par mesure, une plus forte par phrase (ENC_PHRASE temps, comptés depuis la fin du morceau en cours)
  if (A.phrases) for (let j = Math.floor(xm - hitX / ppb) - 1; j <= xm + 26; j++){
    if (j % 4) continue; const x = hitX + (j - xm) * ppb, ph = ((j - off) % ENC_PHRASE + ENC_PHRASE) % ENC_PHRASE === 0;
    g.strokeStyle = ph ? COL.muted : COL.line; g.globalAlpha = ph ? .9 : .4; g.lineWidth = ph ? 2 : 1; g.beginPath(); g.moveTo(x, 26); g.lineTo(x, h - 30); g.stroke(); g.globalAlpha = 1;
    if (ph && x > 80){ g.fillStyle = COL.muted; g.font = '800 11px ' + COL.font; g.textAlign = 'center'; g.fillText('PHRASE', x, 16); } }
  for (const k of ['A', 'B']){
    const i = S ? S.en[k] : k === 'A' ? 0 : 1; if (i == null || !sp[i]) continue;
    const s = sp[i], f = ENC_FORMES[s.forme], d = deck[k], y = Y[k], col = k === 'A' ? COL.a : COL.b;
    const enJeu = S ? !!(d.buf && d.joue) : k === 'A', rk = S && d.buf ? d.rate || plVitesseVoulue(k) : 1, pk = 60 / s.bpm;
    // pas lancé : là où il tomberait si on le lançait maintenant (seulement avec les phrases dessinées)
    const xk = enJeu ? (S ? plPos(k) / d.per : f.drop) : 0;
    if (!enJeu && !A.phrases){ g.fillStyle = COL.muted; g.font = '700 13px ' + COL.font; g.textAlign = 'left'; g.fillText(`« ${s.nom} » attend sur la platine ${k}`, 56, y + 28); continue; }
    const X = v => hitX + (v - xk) * pk / rk / perM * ppb, entend = S ? encVoie(k, S).p > .15 : k === 'A';
    g.fillStyle = COL.muted; g.font = '700 12px ' + COL.font; g.textAlign = 'left';
    const bpm = A.bpm ? ` · ${(s.bpm * (S ? 1 + plTempoPct(k) : 1)).toFixed(1).replace('.', ',')} BPM` : '';
    g.fillText(`« ${s.nom} »${bpm}${enJeu ? '' : ' · s’il part maintenant'}`, 56, y - 6);
    for (const [a, z, , nom] of f.p){
      const xa = X(a), xz = X(z); if (xz < 44 || xa > w) continue; const fort = nom === 'Drop';
      g.globalAlpha = !enJeu ? .14 : entend ? (fort ? .9 : .32) : .2; g.fillStyle = col; rr(g, xa + 1, y, xz - xa - 2, H, H / 2); g.fill();
      if (!enJeu || !entend){ g.globalAlpha = .7; g.setLineDash([6, 5]); g.strokeStyle = col; g.lineWidth = 2; rr(g, xa + 2, y + 1, xz - xa - 4, H - 2, H / 2); g.stroke(); g.setLineDash([]); }
      g.globalAlpha = 1; const lx = Math.max(xa + 12, 56), room = Math.min(xz, w) - lx - 12; g.font = '600 13px ' + COL.font;
      if (room > 40){ g.fillStyle = fort && entend && enJeu ? COL.ink : COL.fg; g.fillText(fit((S && enJeu && !entend && casque[k] ? '🎧 ' : '') + nom, room), lx, y + 28); }
    }
  }
  // le décalage du morceau qui entre, quand les deux tournent
  if (A.decal && S && S.decal != null && S.cur + 1 < S.sp.length){
    const kn = encDeck(S.cur + 1), ms = Math.round(kn === 'B' ? S.decal : -S.decal), a = Math.abs(ms);
    g.font = '800 12px ' + COL.font; g.textAlign = 'right'; g.fillStyle = a <= ENC_OK ? COL.ok : COL.mid;
    g.fillText(a <= ENC_OK ? `${kn} calé (${a} ms)` : `${kn} en ${ms > 0 ? 'avance' : 'retard'} de ${a} ms`, w - 14, h - 10);
  }
  // le niveau sans aide : la piste s'arrête à MAINTENANT
  if (!A.phrases){ const gr = g.createLinearGradient(hitX + 6, 0, hitX + 60, 0); gr.addColorStop(0, hexA(COL['panel-2'], 0)); gr.addColorStop(1, hexA(COL['panel-2'], 1)); g.fillStyle = gr; g.fillRect(hitX + 6, 0, w, h); }
}

/* ---------- La note de fin ---------- */
function encTexte(S, p){
  const a = S.sp[p.n - 1] ? S.sp[p.n - 1].nom : '', b = S.sp[p.n] ? S.sp[p.n].nom : '', q = p.q, l = LESSONS[li];
  switch (p.type){
    case 'calage': return [`« ${b} » et « ${a} » n’étaient pas calés pendant ${Math.max(1, Math.round(q.sec))} s.`, `Cale « ${b} » avant de monter son fader : le tempo d’abord, puis la molette.`];
    case 'basses': return [`Deux basses en même temps pendant ${Math.round(q.temps)} temps, entre « ${a} » et « ${b} ».`, 'Coupe les basses du morceau qui entre (LOW à gauche) tant que l’autre a les siennes.'];
    case 'volume': return [q.seul ? `Le son de « ${q.nom} » a baissé pendant ${Math.round(q.temps)} temps.` : `Le son a baissé pendant ${Math.round(q.temps)} temps, entre « ${a} » et « ${b} ».`, 'Monte le morceau qui entre avant de baisser celui qui sort.'];
    case 'blanc': return [`La musique s’est arrêtée après « ${q.nom || a} ».`, 'Lance le morceau suivant avant la fin de celui qui joue : regarde où finit son outro sur la piste.'];
    case 'entree': return [`« ${b} » n’est pas parti au bon moment : son drop est tombé ${q.d} temps ${q.sens} la fin de « ${a} ».`, l.set.aides.phrases ? 'Lance le morceau suivant pour que son drop tombe pile à la fin de celui qui joue : regarde où il tomberait, en pointillé sur la piste. Attention aux intros courtes et aux breaks.' : 'Compte les mesures : lance le morceau suivant pour que son drop tombe pile à la fin de celui qui joue (une intro courte part plus tard).'];
    case 'swap': return [`Les basses sont passées de « ${a} » à « ${b} » ${q.d} temps à côté d’une phrase.`, 'Échange les basses au début d’une phrase.'];
    case 'consigne': return [`Entre « ${a} » et « ${b} », il fallait ${ENC_TECH[q.tech]}.`, ENC_TECH_COMMENT[q.tech]];
    case 'casque': return [`« ${b} » est entré sans avoir été écouté au casque.`, 'Allume CUE 🎧 du morceau qui entre, et cale-le avant de monter son fader.'];
    case 'saut': return [`Le tempo de « ${q.nom} » a sauté d’un coup.`, 'Bouge le tempo petit à petit, sur plusieurs mesures.'];
    case 'montee': return [`La soirée a fini à ${q.bpm} BPM, au lieu de ${l.set.montee} ou plus.`, 'Après chaque transition, ramène doucement le morceau à son vrai tempo : la soirée monte toute seule.'];
    case 'reste': return [q.reste > 1 ? `${q.reste} morceaux n’ont pas été joués.` : `« ${b} » n’a pas été joué.`, 'Lance le morceau suivant avant la fin de celui qui joue.'];
  }
  return ['', ''];
}
// Appelé par finish : ferme ce qui était en cours, puis la liste des erreurs (le détail replié de la carte de fin)
function encEval(r){
  const S = r.set, l = LESSONS[li], N = S.sp.length, ici = S.cur + 1 < N ? S.cur + 1 : S.cur;
  if (S.ep.basse > 1.5) encPerte(S, 'basses', ici, S.ep.basse - 1, { temps: S.ep.basse });
  if (S.ep.creux > 1.5) encPerte(S, 'volume', ici, S.ep.creux - 1, { temps: S.ep.creux, seul: true, nom: S.sp[S.cur].nom });
  S.ep.basse = S.ep.creux = 0;
  if (l.set.montee){ const eff = S.sp[S.cur].bpm * (1 + plTempoPct(encDeck(S.cur))); if (eff < l.set.montee - .25) encPerte(S, 'montee', S.cur, ENC_CONSIGNE, { bpm: Math.round(eff) }); }
  if (S.cur < N - 1) encPerte(S, 'reste', S.cur + 1, ENC_RESTE * (N - 1 - S.cur), { reste: N - 1 - S.cur });
  const liste = encListe(S); encScore(S);
  S.pire = liste.length ? (() => { const p = liste[0], [quoi, astuce] = encTexte(S, p); return { quoi, astuce, cout: `Ça t’a coûté ${p.v} point${p.v > 1 ? 's' : ''}.` }; })() : null;
  const avant = encRecords[li]; if (avant == null || S.score > avant){ encRecords[li] = S.score; try { localStorage.setItem('coach-set', JSON.stringify({ best: encRecords })); } catch (e) {} }
  S.recTxt = avant == null ? 'C’est ton premier record' : S.score > avant ? `C’est ton nouveau record (avant : ${avant})` : `Ton record : ${avant}`;
  // le grand set : d'autres morceaux à la prochaine partie
  if (l.set.tirage){ l.set.tir = null; encAvant(l); }
  if (!liste.length) return [['ok', 'Aucune erreur : la musique n’a jamais faibli.', 1]];
  return liste.map(p => [p.v >= 5 ? 'bad' : 'mid', `${encTexte(S, p)[0]} (−${p.v})`, 0]);
}
