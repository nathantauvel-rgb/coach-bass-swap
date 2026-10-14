// Niveaux, progression, déroulement d'une partie et notation.
// Tous les fichiers de js/ partagent la même portée et sont chargés dans l'ordre indiqué dans index.html.
'use strict';
/* ---------- Niveaux ---------- */
const BASE_LESSONS = [
  { title: 'Le bon moment', goal: 'Lance B pile quand A entre dans son outro.',
    how: 'Le geste arrive sur la piste : appuie sur LANCE B (ou PLAY droite sur la FLX4) quand il touche la ligne. Tout le reste est automatique.',
    show: ['gPlay'], bBass: false, autoLaunch: false, init: { faderA: 1, faderB: 0, lowA: .5, lowB: .5 }, user: [] },
  { title: 'Le fader', goal: 'Fais entrer B en douceur, puis fais sortir A avant le drop.',
    how: 'B démarre tout seul. Monte son fader sur 16 à 32 temps, puis baisse celui de A : il doit être à zéro quand le drop de B arrive sur la ligne.',
    show: ['gFad'], bBass: false, autoLaunch: true, init: { faderA: 1, faderB: 0, lowA: .5, lowB: .5 }, user: ['faderA', 'faderB'] },
  { title: 'Le swap des basses', goal: 'Échange les basses de A et B pile sur la ligne.',
    how: 'B arrive tout seul, basses coupées. Quand « Swap » touche la ligne, coupe le LOW de A et ouvre celui de B, une main sur chaque potard.',
    show: ['gLow'], bBass: true, autoLaunch: true, init: { faderA: 1, faderB: 0, lowA: .5, lowB: 0 }, user: ['lowA', 'lowB'] },
  { title: 'La transition complète', goal: 'Tout toi-même, comme en soirée.',
    how: 'Coupe le LOW de B, lance B sur la ligne, monte son fader, swap des basses à la phrase suivante, puis fais sortir A avant le drop.',
    show: ['gPlay', 'gLow', 'gFad'], bBass: true, autoLaunch: false, init: { faderA: 1, faderB: 0, lowA: .5, lowB: .5 }, user: ['faderA', 'faderB', 'lowA', 'lowB'] },
  { kind: 'filter', title: 'Le filtre', goal: 'Efface A en douceur avec le filtre pendant que B monte.',
    how: 'B arrive tout seul. Quand « FILTRE » touche la ligne, tourne le potard CFX de A vers la droite, lentement : il doit être à fond quand « À FOND » arrive, juste avant le drop de B.',
    show: ['gCfx'], bBass: false, autoLaunch: true, init: { faderA: 1, faderB: 0, lowA: .5, lowB: .5, cfxA: .5 }, user: ['cfxA'], start: 24, end: 112 },
  { kind: 'echo', title: 'L\'echo out', goal: 'Fais disparaître A dans un écho, puis B tombe sur son drop.',
    how: 'Sur le dernier temps avant la ligne, active l\'écho (bouton ECHO, ON de l\'effet sur la FLX4, ou touche E), puis baisse d\'un coup le fader de A sur la ligne. B démarre tout seul sur son drop.',
    show: ['gEcho', 'gFad'], bBass: false, autoLaunch: true, launchBeat: 64, bCue: 64, init: { faderA: 1, faderB: 1, lowA: .5, lowB: .5, cfxA: .5 }, user: ['faderA'], btn: ['echo'], start: 40, end: 96 },
  { kind: 'cut', title: 'La coupure sèche', goal: 'Coupe A et lance B sur son drop, au même instant.',
    how: 'B est calé sur son drop. Quand les losanges touchent la ligne, lance B (PLAY droite ou espace) et baisse d\'un coup le fader de A, dans le même geste.',
    show: ['gPlay', 'gFad'], bBass: false, autoLaunch: false, launchBeat: 64, bCue: 64, init: { faderA: 1, faderB: 1, lowA: .5, lowB: .5, cfxA: .5 }, user: ['faderA'], start: 40, end: 96 }
];
BASE_LESSONS.forEach(l => { l.kind = l.kind || 'swap'; l.init.cfxA = l.init.cfxA ?? .5; l.launchBeat = l.launchBeat || 32; l.bCue = l.bCue || 0; l.start = l.start || 16; l.end = l.end || 116; l.btn = l.btn || []; });
['moment', 'fader', 'swap', 'full'].forEach((k, i) => { BASE_LESSONS[i].kind = k; });
const FULL = ['k', 'b', 'h', 'c', 'cl'], CH3_INIT = { faderA: 1, faderB: 0, lowA: .5, lowB: .5, cfxA: .5, midA: .5, midB: .5 };
const CH3_LESSONS = [
  { kind: 'shortintro', wave: true, title: 'L\'intro courte', goal: 'Lance B pour que son drop tombe pile quand A s\'arrête.',
    how: 'Ici, B n\'a que 16 temps d\'intro. Sur la piste, la forme d\'onde bleue pâle montre où tomberait B si tu le lançais maintenant : lance-le quand son drop (là où l\'onde grossit) s\'aligne sur la fin de A.',
    show: ['gPlay'], autoLaunch: false, init: CH3_INIT, user: [], start: 0, end: 72,
    A: [[0, 16, FULL], [16, 48, ['k', 'b', 'h']]], aEnd: 48, B: [[0, 16, ['k', 'h']], [16, 80, FULL]], bIntro: 16, bLoop: [16, 80], launchBeat: 32,
    targets: [[32, 'LANCE B', 'B']], caps: [[16, 'A entre dans son outro'], [32, 'B lancé : 16 temps avant la fin de A'], [48, 'Drop de B pile à la fin de A']] },
  { kind: 'break', wave: true, title: 'Le piège du break', goal: 'Ne te fais pas avoir par le break : attends la vraie fin de A.',
    how: 'A a un break au milieu : la musique se vide, puis repart de plus belle. Repère sur la forme d\'onde la vraie fin du morceau, puis lance B (32 temps d\'intro) pour que son drop tombe quand A s\'arrête.',
    show: ['gPlay'], autoLaunch: false, init: CH3_INIT, user: [], start: 0, end: 108,
    A: [[0, 16, FULL], [16, 32, ['pad', 'h']], [32, 64, FULL], [64, 96, ['k', 'b', 'h']]], aEnd: 96, B: [[0, 32, ['k', 'h']], [32, 96, FULL]], bIntro: 32, bLoop: [32, 96], launchBeat: 64,
    targets: [[64, 'LANCE B', 'B']], caps: [[16, 'Break : ce n\'est pas la fin !'], [32, 'A repart à fond'], [64, 'Vraie outro : B est lancé'], [96, 'Drop de B à la fin de A']] },
  { kind: 'vocal', wave: true, title: 'Une seule voix à la fois', goal: 'Coupe le MID de A quand la voix de B arrive.',
    how: 'A chante encore pendant son outro, et B a une voix dans son intro. Quand B commence à chanter, coupe le MID de A (le potard des voix) pour qu\'on n\'entende jamais deux voix ensemble. B arrive tout seul.',
    show: ['gMid'], autoLaunch: true, init: CH3_INIT, user: ['midA'], start: 16, end: 108,
    A: [[0, 32, FULL.concat('v')], [32, 80, ['k', 'b', 'h', 'v']], [80, 96, ['k', 'b', 'h']]], aEnd: 96, B: [[0, 16, ['k', 'h']], [16, 64, ['k', 'h', 'v']], [64, 128, FULL]], bIntro: 64, bLoop: [64, 128], launchBeat: 32,
    targets: [[48, 'VOIX', 'A']], caps: [[32, 'B arrive, sans voix'], [48, 'B chante : MID de A coupé'], [96, 'Drop de B']] },
  { kind: 'read', wave: true, random: true, title: 'Lecture express', goal: 'Structure inconnue : lis les formes d\'onde et lance B au bon moment.',
    how: 'À chaque partie, l\'outro de A et l\'intro de B changent de longueur. Lis la forme d\'onde de A pour trouver sa fin, regarde l\'intro de B, et lance B pour que son drop tombe quand A s\'arrête.',
    show: ['gPlay'], autoLaunch: false, init: CH3_INIT, user: [], start: 0, end: 100, launchBeat: 32, targets: [], caps: [] }
];
CH3_LESSONS.forEach(l => { l.init = Object.assign({}, l.init); l.bCue = 0; l.btn = []; });
function randomizeRead(l){
  const aOut = [32, 48, 64][Math.floor(Math.random() * 3)], bi = [16, 32][Math.floor(Math.random() * 2)];
  Object.assign(l, { A: [[0, aOut, FULL], [aOut, aOut + 32, ['k', 'b', 'h']]], aEnd: aOut + 32, B: [[0, bi, ['k', 'h']], [bi, bi + 64, FULL]], bIntro: bi, bLoop: [bi, bi + 64] });
  l.launchBeat = l.aEnd - bi; l.start = Math.max(0, aOut - 20); l.end = l.aEnd + 20; l.targets = [[l.launchBeat, 'LANCE B', 'B']];
  l.caps = [[aOut, 'A entre dans son outro'], [l.launchBeat, `B lancé : ${bi} temps avant la fin de A`], [l.aEnd, 'Drop de B pile à la fin de A']];
}
let LESSONS = BASE_LESSONS;
const TARGETS = { 4: [[64, 'FILTRE', 'A'], [92, 'À FOND', 'A']], 5: [[63, 'ECHO', 'AB'], [64, 'COUPE A', 'A']], 6: [[64, 'LANCE B', 'B'], [64, 'COUPE A', 'A']], 0: [[32, 'LANCE B', 'B']], 1: [[64, 'B À FOND', 'B'], [96, 'A SORTI', 'A']], 2: [[64, 'SWAP', 'AB']], 3: [[32, 'LANCE B', 'B'], [64, 'SWAP', 'AB'], [96, 'A SORTI', 'A']] };
const ACT = { 'LANCE B': 'lance B', 'B À FOND': 'monte le fader de B à fond', 'A SORTI': 'baisse le fader de A à zéro', 'SWAP': 'échange les basses : LOW de A à gauche, LOW de B au milieu',
  'FILTRE': 'commence à tourner le FILTRE de A vers la droite', 'À FOND': 'FILTRE de A tourné à fond', 'ECHO': 'active l\'ÉCHO', 'COUPE A': 'coupe le fader de A d\'un coup', 'VOIX': 'coupe le MID de A' };
const GROUP_OF = { 'LANCE B': 'gPlay', 'B À FOND': 'gFad', 'A SORTI': 'gFad', 'SWAP': 'gLow', 'FILTRE': 'gCfx', 'À FOND': 'gCfx', 'ECHO': 'gEcho', 'COUPE A': 'gFad', 'VOIX': 'gMid' };
let lastPopAt = 0, lastAct = '';
function setFocus(ids){ for (const g of ['gPlay', 'gLow', 'gFad', 'gCfx', 'gEcho', 'gMid']) $(g).classList.toggle('focus', ids.includes(g)); }
function showAction(t){ if (t === lastAct) return; lastAct = t; if (performance.now() - lastPopAt > 1600) say(t); }
const RING_LAB = { 'FILTRE': 'temps avant de tourner le filtre', 'À FOND': 'temps : filtre à fond avant le drop', 'ECHO': 'temps avant d\'activer l\'écho', 'COUPE A': 'temps avant de couper A', 'LANCE B': 'temps avant de lancer B', 'B À FOND': 'temps pour monter B', 'SWAP': 'temps avant le swap', 'A SORTI': 'temps avant le drop de B : A doit être sorti' };
let preparing = false, li = 0, run = null, ear = false, styleChoice = 'house', chapter = 1, TOL = 1, placement = null, prac = null;
let stars = {}; try { stars = JSON.parse(localStorage.getItem('coach-lecons') || '{}') || {}; } catch (e) {}
let earStars = {}; try { earStars = JSON.parse(localStorage.getItem('coach-lecons-oreille') || '{}') || {}; } catch (e) {}
try { styleChoice = localStorage.getItem('coach-style') || 'house'; } catch (e) {}
const pickStyle = () => styleChoice === 'random' ? ['house', 'techno', 'afro'][Math.floor(Math.random() * 3)] : styleChoice;
let ch2Stars = null; try { ch2Stars = JSON.parse(localStorage.getItem('coach-ch2') || 'null'); } catch (e) {}
if (!ch2Stars) ch2Stars = Object.assign({}, earStars);
let ch2Open = false; try { ch2Open = localStorage.getItem('coach-ch2-ouvert') === '1'; chapter = +(localStorage.getItem('coach-chapitre') || 1) || 1; } catch (e) {}
const CH2_STYLE = ['techno', 'afro', 'house', 'techno', 'afro', 'house', 'techno'];
const CHAPTERS = [
  { n: 1, title: 'Les bases', sub: 'Guidé, un geste à la fois' },
  { n: 2, title: 'La maîtrise', sub: 'À l\'oreille, précision ×2' },
  { n: 3, title: 'Les vrais morceaux', sub: 'Formes d\'onde, breaks, voix' },
  { n: 4, title: 'Sans filet', sub: 'Sans sync, mix harmonique', soon: true },
  { n: 5, title: 'La soirée', sub: 'Mini-sets enchaînés', soon: true }
];
let ch3Stars = {}; try { ch3Stars = JSON.parse(localStorage.getItem('coach-ch3') || '{}') || {}; } catch (e) {}
let ch3Open = false;
if (/[?&]tout=1/.test(location.search)){ ch2Open = true; ch3Open = true; }
const bankOf = c => c === 3 ? ch3Stars : c === 2 ? ch2Stars : stars;
const BANK_KEY = { 1: 'coach-lecons', 2: 'coach-ch2', 3: 'coach-ch3' }, XP_PER = { 1: 10, 2: 15, 3: 20 };
const sumStars = b => Object.values(b || {}).reduce((s, v) => s + (+v || 0), 0);
const ch2Unlocked = () => ch2Open || sumStars(stars) >= 14;
const ch3Unlocked = () => ch3Open || sumStars(ch2Stars) >= 10;
if (!['house', 'techno', 'afro', 'random'].includes(styleChoice)) styleChoice = 'house';
if (![1, 2, 3].includes(chapter)) chapter = 1;
if (chapter === 2 && !ch2Unlocked()) chapter = 1;
if (chapter === 3 && !ch3Unlocked()) chapter = 1;
if (chapter === 3) LESSONS = CH3_LESSONS;
const isAuto = k => !!(run && run.demo) || !LESSONS[li].user.includes(k);
const clamp01 = x => Math.max(0, Math.min(1, x));

function renderChapters(){
  const bar = $('chapters'); bar.innerHTML = '';
  for (const c of CHAPTERS){
    const b = document.createElement('button'); b.type = 'button'; b.className = 'chap'; b.setAttribute('aria-pressed', String(c.n === chapter));
    const locked = c.soon || (c.n === 2 && !ch2Unlocked()) || (c.n === 3 && !ch3Unlocked());
    b.disabled = locked && c.n !== chapter;
    const sub = c.soon ? 'Bientôt' : c.n === 2 && !ch2Unlocked() ? `Verrouillé : ${sumStars(stars)}/14 ★ au chapitre 1` : c.n === 3 && !ch3Unlocked() ? `Verrouillé : ${sumStars(ch2Stars)}/10 ★ au chapitre 2` : c.sub;
    b.innerHTML = `<span class="cn">Chapitre ${c.n}</span><strong></strong><span class="cs"></span>`; b.querySelector('strong').textContent = c.title; b.querySelector('.cs').textContent = sub;
    b.addEventListener('click', () => setChapter(c.n)); bar.appendChild(b);
  }
  if (!ch2Unlocked()){ const t = document.createElement('button'); t.type = 'button'; t.className = 'chap test';
    t.innerHTML = '<span class="cn">Tu mixes déjà ?</span><strong>Test de placement</strong><span class="cs">3 épreuves pour sauter les bases</span>';
    t.addEventListener('click', startPlacement); bar.appendChild(t); }
}
function setChapter(n){
  if (run || n === chapter) return; if (n === 2 && !ch2Unlocked()) return; if (n === 3 && !ch3Unlocked()) return;
  LESSONS = n === 3 ? CH3_LESSONS : BASE_LESSONS;
  chapter = n; try { localStorage.setItem('coach-chapitre', String(n)); } catch (e) {}
  const bank = bankOf(n), first = LESSONS.findIndex((_, i) => !(bank[i] >= 2)); selectLesson(first < 0 ? 0 : first);
}
function renderHud(){
  const t1 = sumStars(stars), t2 = sumStars(ch2Stars), t3 = sumStars(ch3Stars), xp = t1 * 10 + t2 * 15 + t3 * 20 + quizXp();
  $('lvl').textContent = 'Niv. ' + (1 + Math.floor(xp / 30)); $('xpFill').style.width = (xp % 30) / 30 * 100 + '%'; $('xpTxt').textContent = xp + ' XP';
  $('starTot').textContent = (t1 + t2 + t3) + '/' + (BASE_LESSONS.length * 6 + CH3_LESSONS.length * 3);
  const bank = bankOf(chapter), map = $('map'); map.querySelectorAll('.node').forEach(n => n.remove()); map.style.setProperty('--n', LESSONS.length);
  let lastDone = -1;
  LESSONS.forEach((l, i) => { const st = bank[i] || 0; if (st) lastDone = i;
    const b = document.createElement('button'); b.type = 'button'; b.className = 'node' + (st ? ' done' : ''); b.setAttribute('aria-pressed', String(i === li));
    b.innerHTML = `<span class="dot">${st === 3 ? '★' : i + 1}</span><span class="t"></span><span class="s"><b>${'★'.repeat(st)}</b>${'★'.repeat(3 - st)}</span>`;
    b.querySelector('.t').textContent = l.title; b.setAttribute('aria-label', `Niveau ${i + 1} : ${l.title}, ${st} étoile(s) sur 3`);
    b.addEventListener('click', () => { if (!placement) selectLesson(i); }); map.appendChild(b); });
  $('mapProg').style.width = lastDone < 0 ? '0' : (Math.min(lastDone, LESSONS.length - 1) / (LESSONS.length - 1) * (100 - 100 / LESSONS.length)) + '%';
  renderChapters();
  const cur = map.querySelector('.node[aria-pressed="true"]'); if (cur && map.scrollWidth > map.clientWidth) map.scrollLeft = cur.offsetLeft - map.clientWidth / 2 + cur.offsetWidth / 2;
}
function styleLabel(){ if (chapter === 3) return 'House · 124 BPM'; if (chapter === 2){ const d = STYLE_DEFS[CH2_STYLE[li]]; return d.label + ' · ' + d.bpm + ' BPM · à l\'oreille · précision serrée'; }
  return styleChoice === 'random' ? 'Style surprise à chaque partie' : STYLE_DEFS[styleChoice].label + ' · ' + STYLE_DEFS[styleChoice].bpm + ' BPM'; }
function selectLesson(i){
  stopRun(); li = i; const l = LESSONS[i]; if (l.random) randomizeRead(l); START = l.start; END = l.end; TOL = chapter === 2 ? .5 : 1;
  $('lnum').textContent = (chapter > 1 ? `Chapitre ${chapter} · ` : '') + `Niveau ${i + 1} sur ${LESSONS.length}`; $('ltitle').textContent = l.title; $('lgoal').textContent = l.goal; $('lhow').textContent = l.how;
  for (const g of ['gPlay', 'gLow', 'gFad', 'gCfx', 'gEcho', 'gMid']) $(g).hidden = !l.show.includes(g);
  for (const [k, w] of [['lowA', 'wLowA'], ['lowB', 'wLowB'], ['faderA', 'wFadA'], ['faderB', 'wFadB'], ['cfxA', 'wCfxA'], ['midA', 'wMidA']]) $(w).classList.toggle('auto', isAuto(k));
  Object.assign(ctrl, l.init); applyCtrl();
  $('result').hidden = true; setStartBtn(false); $('launchB').disabled = true;
  $('cdNum').textContent = '—'; $('cdLab').textContent = ''; $('ring').classList.remove('hot'); $('progFill').style.width = '0';
  $('hint').textContent = chapter === 3 ? 'Chapitre 3 : plus de compte à rebours. Lis les formes d\'onde, comme dans rekordbox. La démo montre le bon moment.' : chapter === 2 ? 'Chapitre 2 : pas de compte à rebours, et il faut être deux fois plus précis. Regarde la démo si besoin.' : l.user.length && l.user.length < 4 ? 'Les contrôles grisés bougent tout seuls : regarde-les, ils te montrent le geste.' : '';
  ear = chapter === 2; $('styleSeg').hidden = chapter > 1;
  $('modeTag').hidden = !(chapter === 2 || l.wave); $('modeTag').textContent = l.wave ? 'Lis les formes d\'onde' : 'À l\'oreille · précision ×2';
  if (l.wave){ waveTk = null; if (hasWorkers()) prepareCh3(l).then(tk => { if (LESSONS[li] === l && !run){ waveTk = tk; drawHighway(START); } }).catch(() => {}); } else waveTk = null; $('styleTag').textContent = styleLabel();
  $('stage').classList.remove('ear');
  chooseSongs();
  const firstT = (l.targets || []).find(t => GROUP_OF[t[1]] && (l.user.length || t[1] === 'LANCE B'));
  const idle = firstT ? 'Ton geste : ' + ACT[firstT[1]] + '. Regarde la démo si tu hésites !' : 'Regarde la démo, puis à toi !';
  $('hint').textContent = idle; say(idle);
  renderHud(); drawHighway(START); updateSetup();
}
function setStartBtn(running){ const b = $('startBtn'); b.textContent = running ? 'Arrêter' : 'Jouer'; b.classList.toggle('stop', running); }

let START = 16, END = 116;
function startRun(demo = false){
  if (!demo && needSetup() && !setupReady()){ updateSetup(); return; }
  ensureAudio(); if (ac.state !== 'running') ac.resume();
  if (preparing) return; preparing = true;
  $('startBtn').textContent = hasWorkers() ? 'Préparation…' : 'Préparation (quelques secondes)…'; $('watchBtn').disabled = true;
  const myLi = li, myCh = chapter;
  setTimeout(async () => {
    const lw = LESSONS[li]; let tkW = null, styW = null, vrW = 0;
    let songA = null, songB = null;
    try { if (lw.wave) tkW = await prepareCh3(lw).catch(() => prepareCh3(lw)); else { styW = sel.sty; vrW = sel.vr; [songA, songB] = await Promise.all([songSafe(styW, vrW, 'A'), songSafe(styW, vrW, lw.bBass ? 'B1' : 'B0')]); } }
    finally { preparing = false; $('watchBtn').disabled = false; }
    if (li !== myLi || chapter !== myCh || run){ setStartBtn(false); return; }
    if (lw.wave){ const tk = tkW; waveTk = tk; tk.bufA = tk.bufA || bufferOf(tk.A); tk.bufB = tk.bufB || bufferOf(tk.B); tracks = { A: tk.bufA, B0: tk.bufB, B1: tk.bufB }; if (deck.A.delay) deck.A.delay.delayTime.value = P * .75; $('styleTag').textContent = styleLabel(); }
    else { const d = STYLE_DEFS[styW]; BPM = d.bpm; P = 60 / BPM; tracks = { A: bufOf(songA), B0: bufOf(songB), B1: bufOf(songB) }; if (deck.A.delay) deck.A.delay.delayTime.value = P * .75; }
    const l = LESSONS[li]; Object.assign(ctrl, l.init); if (needSetup()) for (const k of l.user) if (phys[k] != null) ctrl[k] = phys[k]; applyCtrl();
    const t0 = ac.currentTime + .15;
    play('A', tracks.A, t0, START * P, false);
    const earRun = (chapter === 2 || !!(prac && prac.ear)) && !demo;
    run = { t0, launch: null, frames: [], lowBAtLaunch: null, bBuf: l.bBass ? tracks.B1 : tracks.B0, status: {}, popped: {}, lastBeat: START - 1, demo, cap: 0, ear: earRun, ch: chapter };
    $('stage').classList.toggle('ear', earRun); $('stage').classList.add('running');
    const st0 = $('stage').getBoundingClientRect(); if (st0.top < -4 || st0.top > 40) window.scrollTo({ top: window.scrollY + st0.top - 8, behavior: REDUCED ? 'auto' : 'smooth' });
    setEcho(false); run.echoAt = null;
    if (l.autoLaunch || demo) launchAt(l.launchBeat);
    $('stage').classList.toggle('demo', demo); $('demoTag').hidden = !demo; $('watchBtn').disabled = true;
    $('result').hidden = true; setStartBtn(true); $('setup').hidden = true; $('startBtn').disabled = false; $('startBtn').classList.remove('ready'); $('launchB').disabled = !!l.autoLaunch; $('startBtn').blur();
    $('hint').textContent = demo ? 'Démonstration : regarde les contrôles bouger et écoute le résultat.' : l.btn.includes('echo') ? 'Astuce : la touche E active aussi l\'écho.' : !l.autoLaunch ? 'Astuce : la barre d\'espace lance aussi B.' : '';
    if (demo) for (const w of ['wLowA', 'wLowB', 'wFadA', 'wFadB', 'wCfxA', 'wMidA']) $(w).classList.add('auto');
    $('echoBtn').disabled = demo || !l.btn.includes('echo');
  }, 30);
}
const beatNow = () => run ? (ac.currentTime - run.t0) / P + START : null;
function launchAt(k){ run.launch = k; run.lowBAtLaunch = ctrl.lowB; play('B', run.bBuf, run.t0 + (k - START) * P, LESSONS[li].bCue * P, true, ...(LESSONS[li].bLoop || [64, 128])); $('launchB').disabled = true; }
function judgeLaunch(k){
  const LW = LESSONS[li];
  if (LW.wave){ const d = k + LW.bIntro - LW.aEnd;
    if (d === 0){ pop('PARFAIT !', 'ok'); run.status['LANCE B'] = 'ok'; chime(true); }
    else { pop(d < 0 ? 'Trop tôt !' : 'Trop tard !', Math.abs(d) <= 2 ? 'mid' : 'bad'); run.status['LANCE B'] = Math.abs(d) <= 2 ? 'mid' : 'bad'; }
    return; }
  const e = k - LESSONS[li].launchBeat;
  if (e === 0){ pop('PARFAIT !', 'ok'); run.status['LANCE B'] = 'ok'; chime(true); }
  else if (Math.abs(e) <= 2){ pop(`${Math.abs(e)} temps trop ${e > 0 ? 'tard' : 'tôt'}`, 'mid'); run.status['LANCE B'] = 'mid'; chime(false); }
  else if (e % 32 === 0){ pop('Bonne phrase… mais pas la bonne', 'mid'); run.status['LANCE B'] = 'mid'; }
  else { pop('Raté : milieu de phrase', 'bad'); run.status['LANCE B'] = 'bad'; }
}
function launchB(){
  if (!run || run.launch !== null || LESSONS[li].autoLaunch) return;
  const b = beatNow(), k = Math.round(b);
  if (k >= b) launchAt(k);
  else { run.launch = k; run.lowBAtLaunch = ctrl.lowB; play('B', run.bBuf, ac.currentTime + .01, LESSONS[li].bCue * P + (b - k) * P + .01, true, ...(LESSONS[li].bLoop || [64, 128])); $('launchB').disabled = true; }
  judgeLaunch(k);
}
function stopRun(){ setFocus([]); lastAct = ''; const wasDemo = run && run.demo; if (ac){ stop('A'); stop('B'); setEcho(false); } run = null; setStartBtn(false); $('launchB').disabled = true;
  $('stage').classList.remove('demo', 'ear', 'running'); $('demoTag').hidden = true; $('watchBtn').disabled = false;
  if (wasDemo){ for (const [k, w] of [['lowA', 'wLowA'], ['lowB', 'wLowB'], ['faderA', 'wFadA'], ['faderB', 'wFadB'], ['cfxA', 'wCfxA'], ['midA', 'wMidA']]) $(w).classList.toggle('auto', isAuto(k)); Object.assign(ctrl, LESSONS[li].init); applyCtrl(); }
  updateSetup(); }
let echoOn = false;
function setEcho(on){ echoOn = !!on; if (ac && deck.A.echoIn) deck.A.echoIn.gain.setTargetAtTime(echoOn ? 1 : 0, ac.currentTime, .004); const b = $('echoBtn'); b.setAttribute('aria-pressed', String(echoOn)); }
function toggleEcho(){
  if (!run || run.demo || !LESSONS[li].btn.includes('echo')) return;
  setEcho(!echoOn);
  if (echoOn && run.echoAt == null){ const b = beatNow(); run.echoAt = b; const e = b - 63;
    if (e >= -1.5 * TOL && e <= .6 * TOL){ pop('Écho lancé !', 'ok'); run.status.ECHO = 'ok'; chime(true); }
    else { pop(e < 0 ? 'Écho trop tôt' : 'Écho trop tard', 'mid'); run.status.ECHO = 'mid'; } }
}
function ideal(k, b, i = li){
  const kd = LESSONS[i].kind, r = (x, a, d) => clamp01((x - a) / d), L3 = LESSONS[i];
  if (L3.wave){
    if (k === 'faderB') return kd === 'vocal' ? r(b, 32, 16) : r(b, L3.launchBeat, kd === 'break' ? 16 : 8);
    if (k === 'faderA') return kd === 'vocal' ? 1 - r(b, 80, 16) : 1;
    if (k === 'midA') return kd === 'vocal' ? .5 - .5 * r(b, 47.75, .5) : .5;
    return k === 'echo' ? 0 : .5;
  }
  if (k === 'midA' || k === 'midB') return .5;
  if (kd === 'filter'){ if (k === 'cfxA') return .5 + .5 * r(b, 64, 28); if (k === 'faderB') return r(b, 32, 16); if (k === 'faderA') return 1 - r(b, 96, 4); return k === 'echo' ? 0 : .5; }
  if (kd === 'echo' || kd === 'cut'){ if (k === 'faderA') return 1 - r(b, 63.75, .25); if (k === 'faderB') return 1; if (k === 'echo') return kd === 'echo' && b >= 63 && b < 72 ? 1 : 0; return .5; }
  if (k === 'cfxA') return .5; if (k === 'echo') return 0;
  const bass = LESSONS[i].bBass, ramp = (x, a, d) => clamp01((x - a) / d);
  if (k === 'faderB') return ramp(b, 32, 24);
  if (k === 'faderA') return 1 - ramp(b, 72, 20);
  if (k === 'lowA') return bass ? .5 - .5 * ramp(b, 63.75, .5) : .5;
  return bass ? .5 * ramp(b, 63.75, .5) : .5;
}
const DEMO_CAPS = { 0: [[32, 'B part sur le 1 de l\'outro'], [96, 'Le drop de B tombe pile']],
  1: [[32, 'B entre, fader en bas'], [56, 'B est à fond'], [92, 'A est sorti'], [96, 'Drop de B !']],
  2: [[32, 'B arrive, basses coupées'], [64, 'Swap : A coupé, B ouvert'], [96, 'Drop de B !']],
  3: [[30, 'LOW de B coupé avant de lancer'], [32, 'B part sur le 1'], [56, 'B est à fond'], [64, 'Swap des basses'], [92, 'A est sorti'], [96, 'Drop de B !']] };
Object.assign(DEMO_CAPS, { 4: [[32, 'B arrive'], [64, 'Le filtre commence : A perd ses basses'], [80, 'On continue lentement'], [92, 'Filtre à fond : A n\'est plus qu\'un souffle'], [96, 'Drop de B !']],
  5: [[60, 'Écoute la fin de phrase de A'], [63, 'Écho activé sur le dernier temps'], [64, 'Fader de A coupé : l\'écho résonne'], [66, 'B tombe sur son drop']],
  6: [[60, 'Prépare tes deux mains'], [64, 'A coupé et B lancé, au même instant'], [70, 'Transition nette, sans mélange']] });
BASE_LESSONS.forEach((l, i) => { l.targets = TARGETS[i]; l.caps = DEMO_CAPS[i]; });
function demoCaptions(b){ const caps = LESSONS[li].caps; while (run.cap < caps.length && b >= caps[run.cap][0]){ pop(caps[run.cap][1], 'ok'); run.cap++; } }
function automate(b){
  const L = run.launch; let ch = false;
  if (run.demo){ for (const k of ['faderA', 'faderB', 'lowA', 'lowB', 'cfxA', 'midA']){ const v = ideal(k, b); if (Math.abs(ctrl[k] - v) > .002){ ctrl[k] = v; ch = true; } } if (ch) applyCtrl(); const ev = ideal('echo', b) > .5; if (ev !== echoOn) setEcho(ev); return; }
  const set = (k, v) => { if (isAuto(k) && Math.abs(ctrl[k] - v) > .002){ ctrl[k] = v; ch = true; } };
  if (LESSONS[li].kind === 'moment' && L !== null){ set('faderB', clamp01((b - L) / 16)); set('faderA', 1 - clamp01((b - (L + 48)) / 16)); }
  if (LESSONS[li].kind === 'swap'){ set('faderB', clamp01((b - 32) / 16)); set('faderA', 1 - clamp01((b - 80) / 16)); }
  const KW = LESSONS[li];
  if (KW.wave){ if (KW.kind === 'vocal'){ set('faderB', clamp01((b - 32) / 16)); set('faderA', 1 - clamp01((b - 80) / 16)); }
    else if (L !== null) set('faderB', clamp01((b - L) / (KW.kind === 'break' ? 16 : 8))); }
  if (LESSONS[li].kind === 'filter'){ set('faderB', clamp01((b - 32) / 16)); set('faderA', 1 - clamp01((b - 96) / 4)); }
  if (LESSONS[li].kind === 'echo' && echoOn && b > 72) setEcho(false);
  if (ch) applyCtrl();
}
function liveJudge(b){
  const s = run.status, p = run.popped;
  if (['swap', 'full'].includes(LESSONS[li].kind)){
    if (p.kill == null && b >= 40 && ctrl.lowA < .12) p.kill = b;
    if (p.open == null && b >= 40 && ctrl.lowB > .4) p.open = b;
    if (p.kill != null && p.open != null && !s.SWAP){
      const e = (p.kill + p.open) / 2 - 64, ov = Math.abs(p.kill - p.open);
      if (Math.abs(e) <= .75 * TOL && ov <= .6 * TOL){ pop('SWAP PARFAIT !', 'ok'); s.SWAP = 'ok'; chime(true); }
      else if (Math.abs(e) <= 2 * TOL && ov <= 2 * TOL){ pop(Math.abs(e) > .75 * TOL ? `Swap ${e > 0 ? 'en retard' : 'en avance'}` : 'Swap pas tout à fait net', 'mid'); s.SWAP = 'mid'; chime(false); }
      else { pop('Swap raté', 'bad'); s.SWAP = 'bad'; }
    }
    if (!s.SWAP && b > 70){ pop('Le swap, c\'était maintenant !', 'bad'); s.SWAP = 'bad'; }
  }
  if (['fader', 'full'].includes(LESSONS[li].kind)){
    if (!s['B À FOND'] && b >= 32 && ctrl.faderB >= .9){ const ok = b <= 64 + 4 * TOL; pop(ok ? 'B est installé !' : 'B est à fond… un peu tard', ok ? 'ok' : 'mid'); s['B À FOND'] = ok ? 'ok' : 'mid'; if (ok) chime(true); }
    if (!s['A SORTI'] && b >= 40 && ctrl.faderA <= .05){ const ok = b >= 64 - 4 * TOL && b <= 96 + 2 * TOL; pop(ok ? 'A sorti à temps !' : 'A sorti trop tôt', ok ? 'ok' : 'mid'); s['A SORTI'] = ok ? 'ok' : 'mid'; if (ok) chime(true); }
    if (!s['A SORTI'] && b > 96 + 2 * TOL){ pop('Deux basses en même temps !', 'bad'); s['A SORTI'] = 'bad'; }
  }
  const L0 = LESSONS[li];
  if (L0.kind === 'vocal'){
    if (!s.VOIX && b >= 36 && ctrl.midA < .12){ const e = b - 48, ok = Math.abs(e) <= 1; pop(ok ? 'Voix coupée pile !' : e < 0 ? 'Coupé trop tôt' : 'Coupé en retard', ok ? 'ok' : 'mid'); s.VOIX = ok ? 'ok' : 'mid'; if (ok) chime(true); }
    if (!s.VOIX && b > 50){ pop('Deux voix en même temps !', 'bad'); s.VOIX = 'bad'; }
  }
  if (!L0.wave && !L0.autoLaunch && run.launch === null && b > L0.launchBeat + 3 && !s['LANCE B']){ pop('Trop tard ! Lance B', 'bad'); s['LANCE B'] = 'late'; }
  if (L0.kind === 'filter'){
    if (!p.wrong && ctrl.cfxA < .4){ p.wrong = 1; pop('Mauvais côté ! Tourne vers la droite', 'bad'); }
    if (!s.FILTRE && b >= 40 && ctrl.cfxA > .56){ const ok = Math.abs(b - 64) <= 6 * TOL; pop(ok ? 'Filtre lancé !' : b < 58 ? 'Filtre trop tôt' : 'Filtre en retard', ok ? 'ok' : 'mid'); s.FILTRE = ok ? 'ok' : 'mid'; if (ok) chime(true); p.fStart = b; }
    if (!s.FILTRE && b > 80){ pop('Tourne le filtre !', 'bad'); s.FILTRE = 'bad'; }
    if (!s['À FOND'] && b >= 40 && ctrl.cfxA >= .9){ const d = p.fStart != null ? b - p.fStart : 0, ok = b <= 96 + 2 * TOL && d >= 12; pop(ok ? 'A s\'efface en douceur !' : d < 12 ? 'Trop brusque !' : 'Un peu tard', ok ? 'ok' : 'mid'); s['À FOND'] = ok ? 'ok' : 'mid'; if (ok) chime(true); }
    if (!s['À FOND'] && b > 99){ pop('A n\'est pas filtré au drop !', 'bad'); s['À FOND'] = 'bad'; }
  }
  if (L0.kind === 'echo' || L0.kind === 'cut'){
    if (L0.kind === 'echo' && !s.ECHO && b > 64.5){ pop('Pas d\'écho !', 'bad'); s.ECHO = 'bad'; }
    if (!s['COUPE A'] && b >= 56 && ctrl.faderA < .1){ const e = b - 64, ok = Math.abs(e) <= .6 * TOL, withEcho = L0.kind === 'cut' || run.echoAt != null;
      pop(ok ? (L0.kind === 'echo' ? (withEcho ? 'ECHO OUT PARFAIT !' : 'Coupé… mais sans écho') : 'Coupure nette !') : `Coupé ${e > 0 ? 'en retard' : 'trop tôt'}`, ok && withEcho ? 'ok' : 'mid');
      s['COUPE A'] = ok && withEcho ? 'ok' : 'mid'; if (ok && withEcho) chime(true); }
    if (!s['COUPE A'] && b > 66){ pop('Coupe A !', 'bad'); s['COUPE A'] = 'bad'; }
  }
}
function frame(){
  requestAnimationFrame(frame);
  if (!run){ return; }
  const b = beatNow(); if (b < START) return;
  automate(b); if (run.demo) demoCaptions(b); else liveJudge(b);
  run.frames.push({ b, ma: ctrl.midA, fa: ctrl.faderA, fb: ctrl.faderB, la: ctrl.lowA, lb: ctrl.lowB, ca: ctrl.cfxA, ec: echoOn ? 1 : 0 });
  const tg = LESSONS[li].targets.find(([x, lab]) => x > b - .5 && !(run.status[lab] && run.status[lab] !== 'late'));
  const ring = $('ring');
  const LL = LESSONS[li], userGroups = LL.show.filter(g => g !== 'gPlay' || !LL.autoLaunch);
  if (run.demo){ $('cdNum').textContent = tg ? Math.max(0, Math.ceil(tg[0] - b)) : '♪'; $('cdLab').textContent = tg ? 'temps' : ''; ring.classList.remove('hot'); setFocus(tg && tg[0] - b <= 6 ? LL.targets.filter(t => t[0] === tg[0]).map(t => GROUP_OF[t[1]]) : []); }
  else if (LL.wave || run.ear){ $('cdNum').textContent = '?'; $('cdLab').textContent = ''; ring.classList.remove('hot'); setFocus(userGroups);
    showAction(LL.wave ? 'Lis les formes d\'onde et agis au bon moment.' : 'Pas de compte à rebours : écoute et sens la phrase.'); }
  else if (tg){ const n = Math.max(0, Math.ceil(tg[0] - b)), same = LL.targets.filter(t => t[0] === tg[0]);
    $('cdNum').textContent = n; $('cdLab').textContent = 'temps'; ring.classList.toggle('hot', n <= 4);
    setFocus(n <= 8 ? same.map(t => GROUP_OF[t[1]]) : []);
    const what = same.map(t => ACT[t[1]]).join(' et ');
    showAction(n <= 1 ? 'Maintenant : ' + what + ' !' : 'Dans ' + n + ' temps : ' + what + '.'); }
  else { $('cdNum').textContent = '♪'; $('cdLab').textContent = ''; ring.classList.remove('hot'); setFocus([]); showAction('Écoute le résultat…'); }
  if (!REDUCED){ const f = b - Math.floor(b), k = Math.exp(-f * 7); ring.style.transform = `scale(${1 + .07 * k})`; ring.style.setProperty('--o', k.toFixed(2)); }
  $('progFill').style.width = clamp01((b - START) / (END - START)) * 100 + '%';
  drawHighway(b);
  if (b >= END) finish();
  if (run && !LESSONS[li].autoLaunch && run.launch === null && b > LESSONS[li].launchBeat + 40) finish();
}
const fr1 = v => (Math.round(v * 10) / 10).toString().replace('.', ',');
const firstAt = (fr, from, test) => { const f = fr.find(x => x.b >= from && test(x)); return f ? f.b : null; };
function evalLaunch(L, target = 32){
  if (L === null) return ['bad', 'Tu n\'as pas lancé B : écoute le compte à rebours et appuie quand il arrive à zéro.', 0];
  const e = L - target;
  if (e === 0) return ['ok', target === 32 ? 'B est parti pile sur le 1 de l\'outro de A.' : 'B est parti pile sur le début de la phrase.', 1];
  if (Math.abs(e) <= 2) return ['mid', `B est parti ${Math.abs(e)} temps ${e > 0 ? 'trop tard' : 'trop tôt'} : son drop tombe ${Math.abs(e)} temps ${e > 0 ? 'après' : 'avant'} la fin de phrase de A, ça s'entend comme un décalage.`, .5];
  if (e % 32 === 0) return ['mid', `B est parti sur le début d'une autre phrase (${e > 0 ? 'une phrase trop tard' : 'une phrase trop tôt'}) : c'est en rythme, mais pas au bon moment du morceau.`, .5];
  return ['bad', `B est parti au temps ${(((L % 32) + 32) % 32) + 1} de la phrase, en plein milieu : les deux morceaux ne changent plus en même temps. Attends le début de la phrase.`, 0];
}
function evalFaders(fr){
  const out = []; const bReach = firstAt(fr, 32, x => x.fb >= .9), aOut = firstAt(fr, 40, x => x.fa <= .05);
  let jump = 0; for (let i = 0; i < fr.length; i++){ const j = fr.findIndex(x => x.b >= fr[i].b + 2); if (j < 0) break; jump = Math.max(jump, fr[j].fb - fr[i].fb); }
  let dip = 1; for (const x of fr) if (x.b >= 40 && x.b <= 92) dip = Math.min(dip, Math.max(x.fa, x.fb));
  out.push(bReach === null ? ['bad', 'B n\'est jamais arrivé à fond : monte son fader jusqu\'en haut.', 0] : bReach <= 64 + 4 * TOL ? ['ok', `B est arrivé à fond au temps ${Math.round(bReach)}, bien installé avant la suite.`, 1] : ['mid', `B est arrivé à fond tard (temps ${Math.round(bReach)}). Vise le temps 64.`, .5]);
  out.push(jump > .6 ? ['mid', 'Tu as monté B presque d\'un coup : étale le geste sur 16 temps au moins pour une entrée douce.', .5] : ['ok', 'Montée de B progressive : l\'entrée est douce.', 1]);
  out.push(aOut === null || aOut > 96 + 2 * TOL ? ['bad', 'A jouait encore au drop de B : deux basses en même temps. Baisse A avant que le compte à rebours arrive à zéro.', 0]
    : aOut < 64 - 4 * TOL ? ['mid', `A est sorti tôt (temps ${Math.round(aOut)}), avant que B soit vraiment installé.`, .5] : ['ok', `A est sorti au temps ${Math.round(aOut)}, avant le drop de B.`, 1]);
  out.push(dip < .45 ? ['mid', 'Il y a eu un creux de volume : les deux faders étaient bas en même temps.', .5] : ['ok', 'Pas de creux de volume pendant la transition.', 1]);
  return out;
}
function evalSwap(fr){
  const tKill = firstAt(fr, 40, x => x.la < .12), tOpen = firstAt(fr, 40, x => x.lb > .4);
  if (tKill === null || tOpen === null) return [['bad', tKill === null ? 'Les basses de A n\'ont jamais été coupées : tourne son LOW à fond à gauche.' : 'Les basses de B n\'ont jamais été ouvertes : remonte son LOW au milieu.', 0]];
  const sw = (tKill + tOpen) / 2, e = sw - 64, ov = Math.max(0, tKill - tOpen), gap = Math.max(0, tOpen - tKill), out = [];
  out.push(Math.abs(e) <= .75 * TOL ? ['ok', 'Swap pile sur le début de la phrase.', 1] : Math.abs(e) <= 2 * TOL ? ['mid', `Swap ${fr1(Math.abs(e))} temps ${e > 0 ? 'trop tard' : 'trop tôt'}.`, .5] : ['bad', `Swap à ${fr1(Math.abs(e))} temps de la phrase : vise le début de la phrase.`, 0]);
  out.push(ov > 2 * TOL ? ['bad', `Deux basses ensemble pendant ${fr1(ov)} temps : ouvre B et coupe A dans le même geste.`, 0] : ov > .5 * TOL ? ['mid', `Deux basses ensemble pendant ${fr1(ov)} temps : ça frotte un peu.`, .5]
    : gap > 2 * TOL ? ['bad', `Plus aucune basse pendant ${fr1(gap)} temps : l'énergie retombe.`, 0] : gap > .5 * TOL ? ['mid', `Petit trou dans les basses (${fr1(gap)} temps).`, .5] : ['ok', 'Les basses passent de A à B sans chevauchement ni trou.', 1]);
  return out;
}

function evalFilter(fr){
  const out = [], st = firstAt(fr, 40, x => x.ca > .56), full = firstAt(fr, 40, x => x.ca >= .9);
  if (fr.some(x => x.ca < .4)) out.push(['bad', 'Tu as tourné le filtre vers la gauche : de ce côté il enlève les aigus et garde les basses. Pour effacer A, tourne vers la droite.', 0]);
  out.push(st == null ? ['bad', 'Le filtre n\'a jamais été tourné : tourne le CFX de A vers la droite.', 0] : Math.abs(st - 64) <= 6 * TOL ? ['ok', `Filtre lancé au temps ${Math.round(st)}, au début de la phrase.`, 1] : ['mid', `Filtre lancé au temps ${Math.round(st)} : commence quand « FILTRE » touche la ligne (temps 64).`, .5]);
  if (st != null) out.push(full == null || full > 96 + 3 * TOL ? ['bad', 'A n\'était pas complètement filtré au drop de B : va jusqu\'au bout du potard avant « À FOND ».', 0] : full - st < 12 ? ['mid', `Filtre monté trop vite (${Math.round(full - st)} temps) : étale le geste sur 16 à 32 temps.`, .5] : ['ok', `Filtre monté en ${Math.round(full - st)} temps : A s'efface en douceur.`, 1]);
  return out;
}
function evalEcho(fr, at){
  const out = [], cut = firstAt(fr, 56, x => x.fa < .1);
  if (at == null) out.push(['bad', 'Tu n\'as pas activé l\'écho : appuie sur ECHO juste avant de couper A.', 0]);
  else { const e = at - 63; out.push(e >= -1.5 * TOL && e <= .6 * TOL ? ['ok', 'Écho activé sur le dernier temps de la phrase.', 1] : ['mid', `Écho activé ${fr1(Math.abs(e))} temps ${e > 0 ? 'trop tard' : 'trop tôt'} : vise le dernier temps avant la ligne.`, .5]); }
  if (cut == null) out.push(['bad', 'A n\'a jamais été coupé : baisse son fader d\'un coup sur la ligne.', 0]);
  else { const e = cut - 64; out.push(Math.abs(e) <= .6 * TOL ? ['ok', 'A coupé pile au début de la phrase : B tombe dans l\'écho.', 1] : Math.abs(e) <= 1.5 * TOL ? ['mid', `A coupé ${fr1(Math.abs(e))} temps ${e > 0 ? 'en retard' : 'trop tôt'}.`, .5] : ['bad', `A coupé à ${fr1(Math.abs(e))} temps de la ligne.`, 0]); }
  if (at != null && cut != null) out.push(at < cut ? ['ok', 'L\'écho était lancé avant la coupure : A s\'éteint en douceur.', 1] : ['bad', 'Tu as coupé A avant de lancer l\'écho : il n\'y avait plus rien à faire résonner.', 0]);
  return out;
}
function evalCut(fr, L){
  const cut = firstAt(fr, 56, x => x.fa < .1);
  if (cut == null) return [['bad', 'A n\'a jamais été coupé : baisse son fader d\'un coup au moment où B démarre.', 0]];
  const e = cut - 64, out = [];
  out.push(Math.abs(e) <= .5 * TOL ? ['ok', 'A coupé pile sur la ligne.', 1] : Math.abs(e) <= 1.5 * TOL ? ['mid', `A coupé ${fr1(Math.abs(e))} temps ${e > 0 ? 'en retard' : 'trop tôt'}.`, .5] : ['bad', `A coupé à ${fr1(Math.abs(e))} temps de la ligne.`, 0]);
  if (L != null){ const d = cut - L; out.push(Math.abs(d) <= .75 * TOL ? ['ok', 'Coupure et lancement en même temps : la transition est nette.', 1] : d > 0 ? ['mid', `A et B ont joué ensemble pendant ${fr1(d)} temps : coupe A dans le même geste.`, .5] : ['mid', `Il y a eu un blanc de ${fr1(-d)} temps entre la coupure et le lancement de B.`, .5]); }
  return out;
}
function evalWave(L, l){
  if (L == null) return [['bad', 'Tu n\'as pas lancé B : repère la fin de A sur la forme d\'onde, puis lance B pour que son drop tombe dessus.', 0]];
  const d = L + l.bIntro - l.aEnd, how = ` Le bon moment était le temps ${l.launchBeat} : fin de A (temps ${l.aEnd}) moins l'intro de B (${l.bIntro} temps).`, out = [];
  if (d === 0) out.push(['ok', 'Le drop de B est tombé pile quand A s\'est arrêté.', 1]);
  else if (d < 0) out.push([d >= -2 ? 'mid' : 'bad', `B lancé trop tôt : son drop est tombé ${-d} temps avant la fin de A, pendant que A jouait encore.` + how, d >= -2 ? .5 : 0]);
  else out.push([d <= 2 ? 'mid' : 'bad', `B lancé trop tard : ${d} temps de vide entre la fin de A et le drop de B.` + how, d <= 2 ? .5 : 0]);
  if (l.kind === 'break' && L >= 16 && L < 64) out.push(['bad', 'Tu t\'es fait piéger par le break de A : la musique s\'est vidée, mais ce n\'était pas la fin. Sur la forme d\'onde, on voyait qu\'elle repartait.', 0]);
  return out;
}
function evalVocal(fr){
  const t = firstAt(fr, 36, x => x.ma < .12);
  if (t == null) return [['bad', 'Le MID de A n\'a jamais été coupé : les deux voix se sont superposées pendant toute l\'intro de B.', 0]];
  const e = t - 48;
  if (Math.abs(e) <= 1) return [['ok', 'MID de A coupé pile quand B commence à chanter : une seule voix à la fois.', 1]];
  if (e < 0) return [[e >= -4 ? 'mid' : 'bad', `MID coupé ${fr1(-e)} temps trop tôt : A a perdu sa voix alors que B ne chantait pas encore.`, e >= -4 ? .5 : 0]];
  return [[e <= 4 ? 'mid' : 'bad', `MID coupé ${fr1(e)} temps trop tard : on a entendu deux voix ensemble pendant ${fr1(e)} temps.`, e <= 4 ? .5 : 0]];
}
function finish(){
  if (!run) return; const r = run; stopRun();
  if (r.demo){ $('hint').textContent = 'À toi ! Appuie sur Jouer et refais exactement la même chose.'; $('startBtn').classList.add('ready'); $('cdNum').textContent = '—'; $('cdLab').textContent = 'À toi de jouer'; $('ring').classList.remove('hot'); return; }
  let items = [];
  const KD = LESSONS[li].kind;
  if (KD === 'moment') items = [evalLaunch(r.launch)];
  if (KD === 'fader') items = evalFaders(r.frames);
  if (KD === 'swap') items = evalSwap(r.frames);
  if (KD === 'full'){ items = [evalLaunch(r.launch)];
    if (r.launch !== null) items.push(r.lowBAtLaunch < .15 ? ['ok', 'Basses de B coupées avant de le lancer.', 1] : ['bad', 'B est parti avec ses basses ouvertes : coupe son LOW avant de le lancer.', 0]);
    items = items.concat(evalSwap(r.frames), evalFaders(r.frames).filter((_, i) => i !== 1)); }
  if (['shortintro', 'break', 'read'].includes(KD)) items = evalWave(r.launch, LESSONS[li]);
  if (KD === 'vocal') items = evalVocal(r.frames);
  if (LESSONS[li].kind === 'filter') items = evalFilter(r.frames);
  if (LESSONS[li].kind === 'echo') items = evalEcho(r.frames, r.echoAt);
  if (LESSONS[li].kind === 'cut') items = [evalLaunch(r.launch, 64)].concat(evalCut(r.frames, r.launch));
  const score = items.reduce((s, x) => s + x[2], 0) / items.length, st = score >= .9 ? 3 : score >= .55 ? 2 : 1;
  const wasOpen = ch2Unlocked(), was3 = ch3Unlocked(), bank = bankOf(r.ch), before = bank[li] || 0;
  if (!prac){ bank[li] = Math.max(before, st); try { localStorage.setItem(BANK_KEY[r.ch], JSON.stringify(bank)); } catch (e) {} }
  const rs = $('rStars'); rs.innerHTML = '';
  for (let i = 0; i < 3; i++){ const sp = document.createElement('span'); sp.textContent = '★'; if (i < st) sp.className = 'on'; sp.style.animationDelay = (i * .18) + 's'; rs.appendChild(sp); }
  $('rTitle').textContent = (r.ch > 1 ? `Chapitre ${r.ch} : ` : '') + (st === 3 ? 'Parfait, transition de pro !' : st === 2 ? 'Presque ! Un détail à régler.' : 'Pas encore. Lis le conseil et rejoue.');
  const gained = (bank[li] - before) * XP_PER[r.ch]; $('rGain').textContent = (gained > 0 ? `+${gained} XP` : st === 3 ? 'Score maximum déjà atteint' : `Record : ${'★'.repeat(bank[li])}`) + (!wasOpen && ch2Unlocked() ? ' · Chapitre 2 débloqué !' : '') + (!was3 && ch3Unlocked() ? ' · Chapitre 3 débloqué !' : '');
  const ul = $('rDetails'); ul.innerHTML = ''; for (const [lvl, txt] of items){ const x = document.createElement('li'); x.className = lvl; x.textContent = txt; ul.appendChild(x); }
  $('next').hidden = li >= LESSONS.length - 1;
  $('result').hidden = false; $('retry').focus({ preventScroll: true });
  $('cdNum').textContent = '—'; $('cdLab').textContent = 'Appuie sur Jouer'; $('ring').classList.remove('hot');
  drawCompare(r.frames, li, r.launch);
  if (LESSONS[li].random){ const l = LESSONS[li]; randomizeRead(l); START = l.start; END = l.end; if (hasWorkers()) prepareCh3(l).then(tk => { if (!run && LESSONS[li] === l){ waveTk = tk; drawHighway(START); } }).catch(() => {}); }
  if (placement) placementStep(st);
  if (prac) pracStep(st);
  quizOffer(st); avisPartie(r.ch, st);
  renderHud(); if (st >= 2) confetti(st === 3 ? 160 : 60);
}
