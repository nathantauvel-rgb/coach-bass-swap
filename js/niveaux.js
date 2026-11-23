// Niveaux, progression, déroulement d'une partie et notation.
// Tous les fichiers de js/ partagent la même portée et sont chargés dans l'ordre indiqué dans index.html.
'use strict';
/* ---------- Niveaux ---------- */
const BASE_LESSONS = [
  { kind: 'moment', title: 'Le bon moment', goal: 'Lance B pile quand A entre dans son outro.',
    how: 'Appuie sur LANCE B (ou PLAY de droite) quand le geste touche la ligne.',
    show: ['gPlay'], bBass: false, autoLaunch: false, init: { faderA: 1, faderB: 0, lowA: .5, lowB: .5 }, user: [] },
  { kind: 'fader', title: 'Le fader', goal: 'Fais entrer B en douceur, puis fais sortir A avant le drop.',
    how: 'Monte doucement le fader de B, puis baisse celui de A avant le drop de B.',
    show: ['gFad'], bBass: false, autoLaunch: true, init: { faderA: 1, faderB: 0, lowA: .5, lowB: .5 }, user: ['faderA', 'faderB'] },
  { kind: 'cut', title: 'La coupure sèche', goal: 'Coupe A et lance B sur son drop, au même instant.',
    how: 'Sur la ligne, lance B et baisse d\'un coup le fader de A, dans le même geste.',
    show: ['gPlay', 'gFad'], bBass: false, autoLaunch: false, launchBeat: 64, bCue: 64, init: { faderA: 1, faderB: 1, lowA: .5, lowB: .5, cfxA: .5 }, user: ['faderA'], start: 40, end: 96 },
  { kind: 'echo', title: 'L\'écho out', goal: 'Fais disparaître A dans un écho, puis B tombe sur son drop.',
    how: 'Juste avant la ligne, allume l\'écho (ou touche E), puis baisse d\'un coup le fader de A sur la ligne.',
    show: ['gEcho', 'gFad'], bBass: false, autoLaunch: true, launchBeat: 64, bCue: 64, init: { faderA: 1, faderB: 1, lowA: .5, lowB: .5, cfxA: .5 }, user: ['faderA'], btn: ['echo'], start: 40, end: 96 },
  { kind: 'filter', title: 'Le filtre', goal: 'Efface A en douceur avec le filtre pendant que B joue.',
    how: 'Quand « FILTRE » touche la ligne, tourne lentement le CFX de A vers la droite, jusqu\'à « À FOND ».',
    show: ['gCfx'], bBass: false, autoLaunch: true, init: { faderA: 1, faderB: 1, lowA: .5, lowB: .5, cfxA: .5 }, user: ['cfxA'], start: 24, end: 112 },
  { kind: 'swap', title: 'Le swap des basses', goal: 'Échange les basses de A et B pile sur la ligne.',
    how: 'Sur « SWAP », échange les basses d\'un geste : LOW de A coupé, LOW de B normal.',
    show: ['gLow'], bBass: true, autoLaunch: true, init: { faderA: 1, faderB: 1, lowA: .5, lowB: 0 }, user: ['lowA', 'lowB'] },
  { kind: 'full', title: 'La transition complète', goal: 'Le final : tout toi-même, comme en soirée.',
    how: 'Lance B, monte son fader, échange les basses, puis baisse le fader de A avant le drop.',
    show: ['gPlay', 'gLow', 'gFad'], bBass: true, autoLaunch: false, init: { faderA: 1, faderB: 0, lowA: .5, lowB: 0 }, user: ['faderA', 'faderB', 'lowA', 'lowB'] }
];
BASE_LESSONS.forEach(l => { l.init.cfxA = l.init.cfxA ?? .5; l.launchBeat = l.launchBeat || 32; l.bCue = l.bCue || 0; l.start = l.start || 16; l.end = l.end || 116; l.btn = l.btn || []; });
// [début, fin] en temps : la partie s'arrête peu après le dernier geste noté (avant, tous duraient jusqu'au temps 116).
// Lot 47 : elle commence aussi 16 temps avant le premier geste (avant, jusqu'à 40 temps à attendre au filtre et au swap,
// pendant que B arrivait tout seul : B est alors déjà en route au départ, voir launchAt)
[[20, 44], [24, 100], [48, 72], [48, 72], [48, 100], [48, 72], [16, 100]].forEach(([s, e], i) => { BASE_LESSONS[i].start = s; BASE_LESSONS[i].end = e; });
const FULL = ['k', 'b', 'h', 'c', 'cl'], CH3_INIT = { faderA: 1, faderB: 0, lowA: .5, lowB: .5, cfxA: .5, midA: .5, midB: .5 };
// Lot 47 (demande de l'utilisateur : « il lance B, et après il attend 30 secondes ») : chaque niveau commence peu avant le
// geste et s'arrête une douzaine de temps après, comme « Le bon moment » au chapitre 1. On n'attend plus le drop de B :
// la note tombe dès le geste. Le break a été resserré (break, 16 temps de A, puis son outro) pour garder le piège.
const CH3_LESSONS = [
  { kind: 'shortintro', wave: true, title: 'L\'intro courte', goal: 'Lance B pour que son drop tombe pile quand A s\'arrête.',
    how: 'Ici, B n\'a que 16 temps d\'intro. Sur la piste, B en pointillé montre où il tomberait si tu le lançais maintenant : lance-le quand le début de son drop s\'aligne sur la fin de A.',
    show: ['gPlay'], autoLaunch: false, init: CH3_INIT, user: [], start: 16, end: 44,
    A: [[0, 16, FULL], [16, 48, ['k', 'b', 'h']]], aEnd: 48, B: [[0, 16, ['k', 'h']], [16, 80, FULL]], bIntro: 16, bLoop: [16, 80], launchBeat: 32,
    targets: [[32, 'LANCE B', 'B']], caps: [[16, 'A entre dans son outro'], [32, 'B lancé : 16 temps avant la fin de A'], [38, 'Son drop tombera pile à la fin de A']] },
  { kind: 'break', wave: true, title: 'Le piège du break', goal: 'Ne te fais pas avoir par le break : attends la vraie fin de A.',
    how: 'A a un break au milieu : la musique se vide, puis repart de plus belle. Repère sur la piste la vraie fin du morceau (le break n\'en est pas une), puis lance B (32 temps d\'intro) pour que son drop tombe quand A s\'arrête.',
    show: ['gPlay'], autoLaunch: false, init: CH3_INIT, user: [], start: 8, end: 60,
    A: [[0, 16, FULL], [16, 32, ['pad', 'h']], [32, 48, FULL], [48, 80, ['k', 'b', 'h']]], aEnd: 80, B: [[0, 32, ['k', 'h']], [32, 96, FULL]], bIntro: 32, bLoop: [32, 96], launchBeat: 48,
    targets: [[48, 'LANCE B', 'B']], caps: [[16, 'Break : ce n\'est pas la fin !'], [32, 'A repart à fond'], [48, 'Vraie outro : B est lancé'], [54, 'Son drop tombera pile à la fin de A']] },
  // Lot 47 : ce niveau avait deux voix fabriquées par le site ; l'utilisateur les trouvait très désagréables (« je veux plus
  // jamais l'entendre »). Ce sont maintenant deux mélodies (le « lead » des morceaux du site), et la voix n'existe plus.
  { kind: 'vocal', wave: true, title: 'Une seule mélodie à la fois', goal: 'Coupe le MID de A quand la mélodie de B arrive.',
    how: 'A joue encore sa mélodie pendant son outro, et B a une mélodie dans son intro. Quand celle de B commence, coupe le MID de A (le potard des médiums, là où vivent les mélodies et les voix) pour qu\'on n\'entende jamais deux mélodies ensemble. B arrive tout seul.',
    show: ['gMid'], autoLaunch: true, init: CH3_INIT, user: ['midA'], start: 32, end: 56,
    A: [[0, 32, FULL.concat('lead')], [32, 80, ['k', 'b', 'h', 'lead']], [80, 96, ['k', 'b', 'h']]], aEnd: 96, B: [[0, 16, ['k', 'h']], [16, 64, ['k', 'h', 'lead']], [64, 128, FULL]], bIntro: 64, bLoop: [64, 128], launchBeat: 32,
    targets: [[48, 'MÉLODIE', 'A']], caps: [[32, 'B arrive, sans mélodie'], [48, 'La mélodie de B commence : MID de A coupé'], [52, 'Une seule mélodie à la fois']] },
  { kind: 'read', wave: true, random: true, title: 'Lecture express', goal: 'Structure inconnue : lis la piste et lance B au bon moment.',
    how: 'À chaque partie, l\'outro de A et l\'intro de B changent de longueur. Lis la piste de A pour trouver sa fin, regarde la longueur de l\'intro de B, et lance B pour que son drop tombe quand A s\'arrête.',
    show: ['gPlay'], autoLaunch: false, init: CH3_INIT, user: [], start: 0, end: 100, launchBeat: 32, targets: [], caps: [] }
];
CH3_LESSONS.forEach(l => { l.init = Object.assign({}, l.init); l.bCue = 0; l.btn = []; });
function randomizeRead(l){
  const aOut = [32, 48, 64][Math.floor(Math.random() * 3)], bi = [16, 32][Math.floor(Math.random() * 2)];
  Object.assign(l, { A: [[0, aOut, FULL], [aOut, aOut + 32, ['k', 'b', 'h']]], aEnd: aOut + 32, B: [[0, bi, ['k', 'h']], [bi, bi + 64, FULL]], bIntro: bi, bLoop: [bi, bi + 64] });
  // 16 temps avant le bon moment, 12 après (lot 47 ; avant : jusqu'à 52 temps d'attente après le lancement)
  l.launchBeat = l.aEnd - bi; l.start = Math.max(0, l.launchBeat - 16); l.end = l.launchBeat + 12; l.targets = [[l.launchBeat, 'LANCE B', 'B']];
  l.caps = [[aOut, 'A entre dans son outro'], [l.launchBeat, `B lancé : ${bi} temps avant la fin de A`], [l.launchBeat + 6, 'Son drop tombera pile à la fin de A']];
}
// Lot 70 : la piste du chapitre 3 montre les mêmes blocs que les autres chapitres (avant : des formes d'onde), tirés de la
// structure des morceaux. [début, fin, nom, à fond] ; pour B, en temps depuis son lancement, son drop prolongé (il boucle).
const ch3BlocsA = l => l.A.map(([f, t, fl]) => [f, t, !fl.includes('k') ? 'Break' : fl.includes('c') ? 'Corps' : fl.includes('lead') ? 'Outro (mélodie)' : 'Outro', fl.includes('k') && fl.includes('c')]);
const ch3BlocsB = l => l.B.map(([f, t, fl], i, a) => [f, i === a.length - 1 ? Math.max(t, 160) : t, fl.includes('c') ? 'Drop' : fl.includes('lead') ? 'Intro (mélodie)' : fl.includes('b') ? 'Intro (avec basse)' : 'Intro', fl.includes('c')]);
let LESSONS = BASE_LESSONS;
const TARGETS = { 0: [[32, 'LANCE B', 'B']], 1: [[32, 'MONTE B', 'B'], [64, 'B À FOND', 'B'], [96, 'A SORTI', 'A']], 2: [[64, 'LANCE B', 'B'], [64, 'COUPE A', 'A']], 3: [[63, 'ECHO', 'AB'], [64, 'COUPE A', 'A']], 4: [[64, 'FILTRE', 'A'], [92, 'À FOND', 'A']], 5: [[64, 'SWAP', 'AB']], 6: [[32, 'LANCE B', 'B'], [56, 'B À FOND', 'B'], [64, 'SWAP', 'AB'], [96, 'A SORTI', 'A']] };
const ACT = { 'LANCE B': 'lance B (PLAY de droite)', 'MONTE B': 'commence à monter le fader de B, doucement', 'B À FOND': 'monte le fader de B jusqu\'en haut', 'A SORTI': 'baisse le fader de A jusqu\'en bas', 'SWAP': 'échange les basses : LOW de A normal → coupé, LOW de B coupé → normal',
  'FILTRE': 'commence à tourner le filtre de A vers la droite, lentement', 'À FOND': 'filtre de A tout à droite', 'ECHO': 'allume l\'écho', 'COUPE A': 'baisse d\'un coup le fader de A jusqu\'en bas', 'MÉLODIE': 'coupe le MID de A (normal → coupé)' };
const GROUP_OF = { 'LANCE B': 'gPlay', 'MONTE B': 'gFad', 'B À FOND': 'gFad', 'A SORTI': 'gFad', 'SWAP': 'gLow', 'FILTRE': 'gCfx', 'À FOND': 'gCfx', 'ECHO': 'gEcho', 'COUPE A': 'gFad', 'MÉLODIE': 'gMid' };
// Mots du DJ expliqués dans « Comment faire ? » quand le niveau les emploie (aussi utilisés par le guide)
const LEX = [["intro", "Intro", "le début d'un morceau, plus léger, fait pour le mélanger au morceau d'avant"],
  ["outro", "Outro", "la fin d'un morceau, qui se vide peu à peu : c'est là qu'on fait entrer le suivant"],
  ["drop", "Drop", "le moment où tout le morceau arrive d'un coup, basses comprises, après l'intro ou un break"],
  ["break", "Break", "une pause au milieu du morceau : la musique se vide, puis repart de plus belle"],
  ["phrase", "Phrase", "32 temps, soit 8 mesures de 4 temps : la musique change au début de chaque phrase"],
  ["swap", "Swap", "l'échange des basses entre les deux morceaux"],
  ["écho", "Écho", "un effet qui répète le son en le laissant s'éteindre"],
  // chapitre 6 (lot 41)
  ["hot cue", "Hot cue", "un repère gardé sur un pad : un premier appui le pose, les suivants font repartir le morceau de là (même s'il était arrêté). Pour l'effacer : SHIFT + pad sur la table, clic droit à l'écran"],
  ["boucle", "Boucle", "un passage de 4, 8 ou 16 temps qui se répète tant qu'on n'en sort pas (EXIT)"],
  ["quantize", "Quantize", "un réglage qui range les repères et les boucles sur le temps le plus proche, même si l'appui tombe un peu à côté"]];
const lexOf = t => LEX.filter(([w]) => new RegExp('(^|[^\\p{L}])' + w, 'iu').test(t));
let lastPopAt = 0, lastAct = '';
// Une commande peut avoir plusieurs morceaux (LOW de A et de B) : on les retrouve par data-g
function setFocus(ids){ document.querySelectorAll('.deck [data-g]').forEach(el => el.classList.toggle('focus', ids.includes(el.dataset.g))); }
function showAction(t){ if (t === lastAct) return; lastAct = t; if (performance.now() - lastPopAt > 1600) say(t); }
const RING_LAB = { 'MONTE B': 'temps avant de monter B', 'FILTRE': 'temps avant de tourner le filtre', 'À FOND': 'temps : filtre à fond avant le drop', 'ECHO': 'temps avant d\'activer l\'écho', 'COUPE A': 'temps avant de couper A', 'LANCE B': 'temps avant de lancer B', 'B À FOND': 'temps pour monter B', 'SWAP': 'temps avant le swap', 'A SORTI': 'temps avant le drop de B : A doit être sorti' };
// speed : vitesse de la partie (1 = normale, 0,9 ou 0,8 = ralenti, proposé seulement au chapitre 4 après deux échecs de suite)
let speed = 1, slowFails = {};
// styleChoice : « vrai » (vraie musique, js/vrais.js) par défaut, tant que le joueur n'a pas choisi un style lui-même
let preparing = false, li = 0, run = null, ear = false, styleChoice = 'vrai', chapter = 1, TOL = 1, placement = null, prac = null;
// Mode Expert (expert.js) : choisi par le joueur ; xRun vaut true pendant la notation d'une partie jouée en Expert
let expert = false, xRun = false;
// Nouvel ordre du chapitre 1 (16 oct. 2026) : coupure, écho et filtre avant le swap, la transition complète en dernier.
// Ce qui a été enregistré avec l'ancien ordre (étoiles, records, test de placement, journal) est déplacé une seule fois vers
// la nouvelle place de chaque niveau ; la clé coach-ordre dit que c'est fait.
const ORDRE_1 = [0, 1, 5, 6, 4, 3, 2];   // ancien numéro d'un niveau du chapitre 1 → nouveau numéro
(function ordreMigre(){
  try {
    if (localStorage.getItem('coach-ordre') === '2') return;
    const parNiveau = o => { if (!o || typeof o !== 'object' || Array.isArray(o)) return o; const r = {}; for (const [k, v] of Object.entries(o)) r[/^[0-6]$/.test(k) ? ORDRE_1[k] : k] = v; return r; };
    const json = (k, f) => { const t = localStorage.getItem(k); if (t == null) return; let v; try { v = JSON.parse(t); } catch (e) { return; } localStorage.setItem(k, JSON.stringify(f(v))); };
    for (const k of ['coach-lecons', 'coach-lecons-oreille', 'coach-ch2']) json(k, parNiveau);
    json('coach-expert', v => v && typeof v === 'object' && !Array.isArray(v) ? Object.assign({}, v, { best: parNiveau(v.best) }) : v);
    const t = localStorage.getItem('coach-test'); if (/^ko:[0-6]$/.test(t || '')) localStorage.setItem('coach-test', 'ko:' + ORDRE_1[t.slice(3)]);
    json('coach-journal', v => { if (!v || typeof v !== 'object' || Array.isArray(v)) return v;
      if (Array.isArray(v.parties)) v.parties = v.parties.map(x => x && (x.c === 1 || x.c === 2) && ORDRE_1[x.n] != null ? Object.assign({}, x, { n: ORDRE_1[x.n] }) : x);
      if (v.clair && typeof v.clair === 'object') v.clair = Object.fromEntries(Object.entries(v.clair).map(([k, x]) => { const m = /^([12])-([0-6])$/.exec(k); return [m ? m[1] + '-' + ORDRE_1[m[2]] : k, x]; }));
      return v; });
    localStorage.setItem('coach-ordre', '2');
  } catch (e) {}
})();
let stars = {}; try { stars = JSON.parse(localStorage.getItem('coach-lecons') || '{}') || {}; } catch (e) {}
let earStars = {}; try { earStars = JSON.parse(localStorage.getItem('coach-lecons-oreille') || '{}') || {}; } catch (e) {}
try { styleChoice = localStorage.getItem('coach-style') || 'vrai'; } catch (e) {}
const pickStyle = () => styleChoice === 'random' ? ['house', 'techno', 'afro'][Math.floor(Math.random() * 3)] : styleChoice;
let ch2Stars = null; try { ch2Stars = JSON.parse(localStorage.getItem('coach-ch2') || 'null'); } catch (e) {}
if (!ch2Stars) ch2Stars = Object.assign({}, earStars);
let ch2Open = false; try { ch2Open = localStorage.getItem('coach-ch2-ouvert') === '1'; chapter = +(localStorage.getItem('coach-chapitre') || 1) || 1; } catch (e) {}
const CH2_STYLE = ['techno', 'afro', 'house', 'techno', 'afro', 'house', 'techno'];
const CHAPTERS = [
  { n: 1, title: 'Les bases', sub: 'Guidé, un geste à la fois' },
  { n: 2, title: 'La maîtrise', sub: 'À l\'oreille, précision ×2' },
  { n: 3, title: 'Les vrais morceaux', sub: 'Intros, breaks, mélodies' },
  { n: 4, title: 'Les combos', sub: 'Plusieurs gestes, au demi-temps près' },
  { n: 5, title: 'Le calage', sub: 'Caler deux morceaux soi-même, sans SYNC' },
  { n: 6, title: 'Hot cues et boucles', sub: 'Partir au bon endroit, gagner du temps', soon: !CH6_PRET },
  { n: 7, title: 'Le set', sub: 'Des morceaux enchaînés, sans pause' }
];
let ch3Stars = {}; try { ch3Stars = JSON.parse(localStorage.getItem('coach-ch3') || '{}') || {}; } catch (e) {}
let ch4Stars = {}; try { ch4Stars = JSON.parse(localStorage.getItem('coach-ch4') || '{}') || {}; } catch (e) {}
let ch5Stars = {}; try { ch5Stars = JSON.parse(localStorage.getItem('coach-ch5') || '{}') || {}; } catch (e) {}
let ch6Stars = {}; try { ch6Stars = JSON.parse(localStorage.getItem('coach-ch6') || '{}') || {}; } catch (e) {}
let ch7Stars = {}; try { ch7Stars = JSON.parse(localStorage.getItem('coach-ch7') || '{}') || {}; } catch (e) {}
// Étoiles enregistrées : on ne garde que des numéros de niveau et des notes de 1 à 3 (une valeur abîmée faisait planter la carte des niveaux)
const cleanBank = o => { const r = {}; if (o && typeof o === 'object' && !Array.isArray(o)) for (const [k, v] of Object.entries(o)) if (/^\d$/.test(k) && [1, 2, 3].includes(v)) r[k] = v; return r; };
stars = cleanBank(stars); earStars = cleanBank(earStars); ch2Stars = cleanBank(ch2Stars); ch3Stars = cleanBank(ch3Stars); ch4Stars = cleanBank(ch4Stars); ch5Stars = cleanBank(ch5Stars); ch6Stars = cleanBank(ch6Stars); ch7Stars = cleanBank(ch7Stars);
let ch3Open = false;
if (/[?&]tout=1/.test(location.search)){ ch2Open = true; ch3Open = true; }
const bankOf = c => c === 7 ? ch7Stars : c === 6 ? ch6Stars : c === 5 ? ch5Stars : c === 4 ? ch4Stars : c === 3 ? ch3Stars : c === 2 ? ch2Stars : stars;
const lessonsOf = n => n === 7 ? CH7_LESSONS : n === 6 ? CH6_LESSONS : n === 5 ? CH5_LESSONS : n === 4 ? CH4_LESSONS : n === 3 ? CH3_LESSONS : BASE_LESSONS;
const BANK_KEY = { 1: 'coach-lecons', 2: 'coach-ch2', 3: 'coach-ch3', 4: 'coach-ch4', 5: 'coach-ch5', 6: 'coach-ch6', 7: 'coach-ch7' }, XP_PER = { 1: 10, 2: 15, 3: 20, 4: 20, 5: 25, 6: 25, 7: 30 };
const sumStars = b => Object.values(b || {}).reduce((s, v) => s + (+v || 0), 0);
// parcoursOuvert : Apprenti DJ et DJ confirmé ont tous les chapitres ouverts (lot 37, posé par parcours.js). Il est à part de
// ch2Open / ch3Open, qui disent ce que le joueur a vraiment débloqué (badge « Les bases », étapes du parcours).
// Il est lu ici, au chargement, parce que les lignes juste en dessous vérifient le chapitre enregistré avant que parcours.js
// soit chargé (sinon un Apprenti DJ revenait au chapitre 1 à chaque rechargement). 'deja' = l'ancien nom de l'Apprenti DJ.
// Un ancien joueur sans parcours enregistré est rangé par parcours.js : Apprenti DJ s'il avait réussi l'ancien test de
// placement. La règle est ici, pour être lue au chargement elle aussi (gardien du lot 37). Elle ne lit que coach-ch2-ouvert,
// écrit seulement par ce test réussi, donc stable : avec « et moins de 14 étoiles », le joueur redevenait Grand débutant
// le jour de sa 14e étoile, sans rien avoir choisi (gardien, quatrième passage).
const parcoursDevineApprenti = () => ch2Open;
let parcoursOuvert = false; try { const p = localStorage.getItem('coach-parcours');
  parcoursOuvert = ['apprenti', 'confirme', 'deja'].includes(p) || (!['debut', 'apprenti', 'confirme', 'deja'].includes(p) && parcoursDevineApprenti()); } catch (e) {}
const ch2Unlocked = () => ch2Open || parcoursOuvert || sumStars(stars) >= 14;
const ch3Unlocked = () => ch3Open || parcoursOuvert || sumStars(ch2Stars) >= 10;
const ch4Unlocked = () => ch2Unlocked();   // les combos s'ouvrent en même temps que le chapitre 2
const ch5Unlocked = () => ch2Unlocked();   // le calage aussi (choix de l'utilisateur, lot 40)
const ch6Unlocked = () => CH6_PRET && ch2Unlocked();   // et les hot cues (lot 41), tant qu'il est prêt
const ch7Unlocked = () => ch2Unlocked();   // et le set (lot 44)
if (!['house', 'techno', 'afro', 'random', 'vrai'].includes(styleChoice)) styleChoice = 'vrai';
if (![1, 2, 3, 4, 5, 6, 7].includes(chapter)) chapter = 1;
if (chapter === 7 && !ch7Unlocked()) chapter = 1;
if (chapter === 6 && !ch6Unlocked()) chapter = 1;
if (chapter === 4 && !ch4Unlocked()) chapter = 1;
if (chapter === 5 && !ch5Unlocked()) chapter = 1;
if (chapter === 2 && !ch2Unlocked()) chapter = 1;
if (chapter === 3 && !ch3Unlocked()) chapter = 1;
LESSONS = lessonsOf(chapter);
// Commande tenue par le site : pendant une démo, ou une commande des leçons que le niveau ne confie pas au joueur.
// Celles de la table complète (CTRL_NEUTRE : aigus, TRIM, tempo…) ne sont jamais tenues : un niveau qui ne s'en sert pas
// les éteint (tableAllume), et elles restent au neutre.
const isAuto = k => !!(run && run.demo) || (!(k in CTRL_NEUTRE) && !LESSONS[li].user.includes(k));
const clamp01 = x => Math.max(0, Math.min(1, x));

/* Lot 76 « Le niveau d'abord » (demande de l'utilisateur, 19 nov. 2026 : « trop de bordel sur la page », maquette validée :
   captures/maquette-apprendre/ du dossier principal). La liste des chapitres est dans le menu « Tous les niveaux »
   (#nivMenu, une ligne par chapitre) ; « Chapitre N · titre » (#chapBtn) est en tête de la barre et ouvre ce menu.
   Un chapitre ouvert devient le chapitre en cours, le menu reste ouvert sur ses niveaux ; un chapitre de Pro montre ses
   niveaux (fermés) et une seule ligne Pro, sans changer de chapitre. */
function renderChapters(){
  const bar = $('chapters'); bar.innerHTML = '';
  const cur = CHAPTERS.find(c => c.n === chapter);
  $('chapBtn').querySelector('.cn').textContent = `Chapitre ${chapter}`; $('chapBtn').querySelector('strong').textContent = cur.title;
  let groupePro = false;
  for (const c of CHAPTERS){
    if (c.soon) continue;   // les chapitres pas encore écrits ne prennent plus de place
    const b = document.createElement('button'); b.type = 'button'; b.className = 'chap' + (c.n === nivVue ? ' vue' : ''); b.setAttribute('aria-pressed', String(c.n === chapter));
    const locked = c.soon || (c.n === 2 && !ch2Unlocked()) || (c.n === 3 && !ch3Unlocked()) || (c.n === 4 && !ch4Unlocked()) || (c.n === 5 && !ch5Unlocked()) || (c.n === 6 && !ch6Unlocked()) || (c.n === 7 && !ch7Unlocked());
    b.disabled = locked && c.n !== chapter;
    const sub = c.soon ? 'Bientôt' : (c.n === 2 || c.n >= 4) && !ch2Unlocked() ? `Verrouillé : ${sumStars(stars)}/14 ★ au chapitre 1` : c.n === 3 && !ch3Unlocked() ? `Verrouillé : ${sumStars(ch2Stars)}/10 ★ au chapitre 2` : c.sub;
    // lot 64 : la progression du chapitre en pourcentage (étoiles gagnées sur le maximum) ; un chapitre fermé a son cadenas
    const pct = chapPct(c.n);
    // ce qu'il manque, en court et visible sur la carte (la phrase complète reste dans .cs, lue et dans l'info-bulle)
    const encore = (c.n === 2 || c.n >= 4) && !ch2Unlocked() ? `Encore ${14 - sumStars(stars)} ★ au chapitre 1` : c.n === 3 && !ch3Unlocked() ? `Encore ${10 - sumStars(ch2Stars)} ★ au chapitre 2` : '';
    // lot 68 : sans abonnement, les chapitres 2 à 7 sont dans Pro (pas grisés : ils doivent donner envie). Lot 76 : « Pro »
    // n'est plus écrit sur chacun, une seule fois au-dessus d'eux ; les toucher montre leurs niveaux et la ligne Pro.
    if (chapitrePro(c.n)){
      const nb = lessonsOf(c.n).length;
      if (!groupePro){ groupePro = true;
        const h = document.createElement('p'), lk = document.createElement('button'); h.className = 'nivmenu-gt'; h.textContent = 'Avec DJingood Pro';
        lk.type = 'button'; lk.className = 'linkbtn'; lk.textContent = 'Découvrir'; lk.addEventListener('click', () => { nivMenu(false); proOuvre(''); });
        h.appendChild(lk); bar.appendChild(h); }
      b.className = 'chap pro' + (c.n === nivVue ? ' vue' : ''); b.disabled = false;
      b.innerHTML = `<span class="cn">${NIV_CADENAS}Chapitre ${c.n}</span><strong></strong><span class="cs">${nb} niveaux</span>`;
      b.querySelector('strong').textContent = c.title; b.title = `${c.title} : avec DJingood Pro`;
      b.setAttribute('aria-label', `Chapitre ${c.n} : ${c.title}, ${nb} niveaux, avec DJingood Pro`);
      b.addEventListener('click', () => { nivVue = c.n; nivMenuRend(); }); bar.appendChild(b); continue;
    }
    b.classList.toggle('ferme', locked); b.style.setProperty('--pct', pct + '%');
    b.innerHTML = `<span class="cn">${locked ? NIV_CADENAS : ''}Chapitre ${c.n}</span><strong></strong><span class="cs"></span>${locked && encore ? '<span class="cv" aria-hidden="true"></span>' : ''}<span class="cbar" aria-hidden="true"><i></i></span>`;
    b.querySelector('strong').textContent = c.title; b.querySelector('.cs').textContent = locked ? sub : `${pct} %`; b.title = locked ? sub : `${c.title} : ${c.sub}`;
    if (b.querySelector('.cv')) b.querySelector('.cv').textContent = encore;
    b.addEventListener('click', () => { setChapter(c.n); nivVue = chapter; nivMenuRend(); }); bar.appendChild(b);
  }
}
/* ---------- Lot 76 : le menu « Tous les niveaux » ----------
   Il s'ouvre sous la barre (« Tous les niveaux », ou le nom du chapitre), par-dessus la page, comme le menu d'un site :
   à gauche Comprendre puis les chapitres, à droite les niveaux de ce qu'on a choisi à gauche (nivVue). Échap, la croix
   ou un clic ailleurs le ferment ; choisir un niveau aussi. */
let nivVue = null;   // ce que montre le menu : un numéro de chapitre, ou 'cp' (Comprendre)
function nivMenu(o){
  if (o && (run || placement || prac)) return;
  $('nivMenu').hidden = !o; $('nivTous').setAttribute('aria-expanded', String(!!o)); $('chapBtn').setAttribute('aria-expanded', String(!!o));
  if (o){ nivVue = chapter; nivMenuRend(); }
}
const chapMenu = nivMenu;   // l'ancien nom (lot 64)
function nivMenuRend(){ if (nivVue == null) nivVue = chapter; renderChapters(); nivMenuDroite(); }
// Ouvrir le menu sur Comprendre (Mes progrès, la carte de fin)
function nivMenuCp(){ nivMenu(true); nivVue = 'cp'; nivMenuRend(); }
const nivEl = (tag, cls, txt) => { const e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; };
function nivMenuDroite(){
  const d = $('nivMenuD'); d.innerHTML = '';
  const cpOk = typeof CP_LECONS !== 'undefined';
  $('nivCp').setAttribute('aria-pressed', String(nivVue === 'cp')); $('nivCp').hidden = !cpOk;
  if (cpOk) $('nivCpN').textContent = `${cpEtoiles()}/${CP_LECONS.length * 3} ★`;
  const grille = nivEl('div', 'nivgrille');
  const carte = (cls, num, titre, sous, st, clic) => {
    const b = nivEl('button', 'nivcarte ' + cls); b.type = 'button';
    const n = nivEl('span', 'num'); if (num == null) n.innerHTML = NIV_CADENAS; else n.textContent = num;
    const t = nivEl('span', 't', titre); if (sous) t.appendChild(nivEl('small', '', sous));
    const s = nivEl('span', 's'); s.innerHTML = `<b>${'★'.repeat(st)}</b>${'★'.repeat(3 - st)}`;
    b.append(n, t, s); b.addEventListener('click', () => clic(b)); grille.appendChild(b);
  };
  if (nivVue === 'cp' && cpOk){
    d.append(nivEl('h3', '', 'Comprendre · sans table'), nivEl('p', 'sub', '7 petites leçons pour entendre ce que fait un DJ. Juste ton doigt et le son. Gratuit.'));
    CP_LECONS.forEach((L, i) => { const ok = cpOuverte(i), st = cpStars[i] || 0;
      carte(!ok ? 'ferme' : st >= 2 ? 'reussi' : 'afaire', ok ? i + 1 : null, L.titre, L.sous, st, () => { if (!ok) return; nivMenu(false); cpLecon(i); }); });
    d.appendChild(grille); return;
  }
  const n = typeof nivVue === 'number' ? nivVue : chapter, c = CHAPTERS.find(x => x.n === n), L = lessonsOf(n), pro = chapitrePro(n);
  d.append(nivEl('h3', '', `Chapitre ${n} · ${c.title}`), nivEl('p', 'sub', c.sub));
  L.forEach((l, i) => {
    const st = pro ? 0 : bankOf(n)[i] || 0, ferme = pro || niveauPro(n, i) || (n === chapter && !niveauOuvert(i, n));
    carte((ferme ? 'ferme' : st >= 2 ? 'reussi' : 'afaire') + (n === chapter && i === li && !nivFinIci() ? ' courant' : ''), ferme ? null : i + 1, l.title, null, st, () => {
      if (pro){ nivMenu(false); proOuvre('', { chap: n }); return; }
      if (niveauPro(n, i)){ nivMenu(false); proOuvre('', { n, i }); return; }
      if (n !== chapter) return;
      // un niveau pas encore ouvert : le menu se ferme, Vini dit lequel réussir d'abord et la pastille tremble
      nivMenu(false);
      if (!niveauOuvert(i)){ niveauRefuse(i, $('map').querySelectorAll('.node')[i]); return; }
      selectLesson(i);
    });
  });
  d.appendChild(grille);
  // Pro, une seule fois, en clair
  const premier = L.findIndex((_, i) => niveauPro(n, i));
  if (premier >= 0){
    const p = nivEl('div', 'nivmenu-pro'), b = nivEl('button', 'pro-mini', 'Découvrir Pro'); b.type = 'button';
    p.appendChild(nivEl('p', '', pro ? `Ce chapitre est dans DJingood Pro : ses ${L.length} niveaux s'ouvrent avec l'abonnement.` : `Les niveaux ${premier + 1} à ${L.length} sont dans DJingood Pro.`));
    b.addEventListener('click', () => { nivMenu(false); proOuvre('', pro ? { chap: n } : { n, i: premier }); });
    p.appendChild(b); d.appendChild(p);
  }
}
$('nivTous').addEventListener('click', () => nivMenu($('nivMenu').hidden));
$('chapBtn').addEventListener('click', () => nivMenu($('nivMenu').hidden));
$('nivMenuX').addEventListener('click', () => { nivMenu(false); $('nivTous').focus(); });
$('nivCp').addEventListener('click', () => { nivVue = 'cp'; nivMenuRend(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape' && !$('nivMenu').hidden){ nivMenu(false); $('nivTous').focus(); } });
// composedPath : un clic dans le menu le redessine, sa cible n'est déjà plus dans la page quand le clic arrive ici
document.addEventListener('click', e => { if (!$('nivMenu').hidden && !e.composedPath().includes($('nivHaut'))) nivMenu(false); });
function setChapter(n){
  if (run || n === chapter) return; if (chapitrePro(n)){ proOuvre('', { chap: n }); return; } if (n === 2 && !ch2Unlocked()) return; if (n === 3 && !ch3Unlocked()) return; if (n === 4 && !ch4Unlocked()) return; if (n === 5 && !ch5Unlocked()) return; if (n === 6 && !ch6Unlocked()) return; if (n === 7 && !ch7Unlocked()) return;
  LESSONS = lessonsOf(n);
  chapter = n; try { localStorage.setItem('coach-chapitre', String(n)); } catch (e) {}
  const bank = bankOf(n), first = LESSONS.findIndex((_, i) => !(bank[i] >= 2)); selectLesson(first < 0 ? 0 : first);
}
/* ---------- Le parcours linéaire (lot 64) ----------
   Demande de l'utilisateur (9 nov. 2026) : « les exercices ne sont pas verrouillés ». Dans chaque chapitre, le niveau N+1
   s'ouvre quand tous les niveaux d'avant sont réussis (2 étoiles ou plus : la règle de « réussi » du site, celle de
   setChapter et des quêtes). Un niveau déjà joué reste ouvert (progression d'avant ce lot). L'entraînement, le test de
   placement et les liens du guide (niveauVisite) passent par selectLesson et ne sont pas concernés. `?tout=1` (essais) et
   `window.DJINGOOD_LIBRE` (posé par les tests) ouvrent tout. */
const NIV_LIBRE = /[?&]tout=1/.test(location.search);
const NIV_CADENAS = '<svg class="cadenas" viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>';
const niveauReussi = (bank, i) => (bank[i] || 0) >= 2;
function niveauOuvert(i, n = chapter){
  if (NIV_LIBRE || window.DJINGOOD_LIBRE || i <= 0) return true;
  const bank = bankOf(n); if ((bank[i] || 0) > 0) return true;
  for (let k = 0; k < i; k++) if (!niveauReussi(bank, k)) return false;
  return true;
}
// Le niveau qui bloque la suite : le premier pas encore réussi
const niveauEnCours = (n = chapter) => lessonsOf(n).findIndex((_, i) => !niveauReussi(bankOf(n), i));
// Un niveau fermé touché : Vini dit lequel réussir d'abord, la carte tremble
function niveauRefuse(i, b){
  const k = niveauEnCours(), l = LESSONS[k];
  $('tip').textContent = l ? `Réussis d’abord « ${l.title} » (2 étoiles) : « ${LESSONS[i].title} » ${i === k + 1 ? 's’ouvrira juste après' : 'viendra ensuite : les niveaux s’ouvrent un par un'}.` : '';
  if (typeof viniReagit === 'function') viniReagit('bad');
  if (b){ b.classList.remove('refuse'); void b.offsetWidth; b.classList.add('refuse'); }
}
/* ---------- DJingood Pro : ce qui est gratuit (lot 68) ----------
   Décision de l'utilisateur (10 nov. 2026), qui remplace « rien de ce qui existe ne passe en Pro » : 2 ou 3 exercices simples
   pour comprendre le concept, tout le reste dans Pro. Gratuit : les 3 premiers niveaux du chapitre 1 (Mode Expert compris),
   Comprendre, le défi du jour (sur ces 3 niveaux) et un tuto (tutos.js). Le reste (40 exercices, l'entraînement, Passer au
   vrai, 10 tutos) demande l'abonnement. Maquette validée : captures/maquette-pro-decoupe/ (dossier principal, hors Git).
   Tout dépend de proVerrou (pro.js, chargé bien plus tard : d'où le `typeof`) : tant que PRO_PRET est faux, rien ne change.
   Lot 82 (décision de l'utilisateur du 22 nov. 2026, « laisse le premier chapitre gratuit entièrement ») : les 7 niveaux du
   chapitre 1 sont gratuits (Mode Expert compris, puisqu'il rejoue ces niveaux). La grande carte de Pro arrive à la fin du
   niveau 7 (finEssai) ; un chapitre fermé se regarde en démo avant de payer (apercu, plus bas). Pour revenir en arrière
   (si les essais commencés baissent, analyse de MARKETING\08-chapitre-1-offert.md) : remettre 3 ici, et relire
   les textes de la grande carte (finEssai, faits pour le niveau 7) et de la carte d'un niveau de Pro (nivFinRend). */
const NIV_GRATUITS = 7;
let apercu = null;   // lot 82 : l'aperçu d'un chapitre fermé en cours ({ n, i, depuis, ch, li } : la démo regardée, d'où l'on vient)
const proBloque = () => typeof proVerrou === 'function' && proVerrou() && !proActif();
const niveauGratuit = (n, i) => n === 1 && i < NIV_GRATUITS;
const niveauPro = (n = chapter, i = li) => proBloque() && !niveauGratuit(n, i);
const chapitrePro = n => proBloque() && n !== 1;
// Le nombre d'exercices de Pro, pour les textes (40 aujourd'hui) : les niveaux des 7 chapitres, moins les gratuits
const proNbExercices = () => BASE_LESSONS.length * 2 + CH3_LESSONS.length + CH4_LESSONS.length + CH5_LESSONS.length + (CH6_PRET ? CH6_LESSONS.length : 0) + CH7_LESSONS.length - NIV_GRATUITS;
// La progression d'un chapitre, en pourcentage des étoiles
const chapPct = n => { const L = lessonsOf(n); return L.length ? Math.round(sumStars(bankOf(n)) / (L.length * 3) * 100) : 0; };
// Lien d'une page du guide (lot 51, demarrage.js) : ouvre un niveau, même si son chapitre n'est pas encore débloqué, le temps
// de la visite. Rien n'est enregistré (coach-chapitre garde le chapitre d'avant) : au rechargement, on revient où on en était.
function niveauVisite(n, i){ if (run || !lessonsOf(n)[i]) return; LESSONS = lessonsOf(n); chapter = n; selectLesson(i); }
// XP : 10 par étoile au chapitre 1, 15 au chapitre 2, 20 aux chapitres 3 et 4, 25 aux chapitres 5 et 6, 30 au chapitre 7, plus le quiz (un niveau tous les 30 XP)
const xpTotal = () => sumStars(stars) * 10 + sumStars(ch2Stars) * 15 + sumStars(ch3Stars) * 20 + sumStars(ch4Stars) * 20 + sumStars(ch5Stars) * 25 + sumStars(ch6Stars) * 25 + sumStars(ch7Stars) * 30 + quizXp() + questXp() + (typeof cpXp === 'function' ? cpXp() : 0);   // questXp : coffres des quêtes du jour (quetes.js)
function renderHud(){
  const t1 = sumStars(stars), t2 = sumStars(ch2Stars), t3 = sumStars(ch3Stars), t4 = sumStars(ch4Stars), t5 = sumStars(ch5Stars), t6 = sumStars(ch6Stars), t7 = sumStars(ch7Stars), xp = xpTotal();
  $('lvl').textContent = 'Niv. ' + (1 + Math.floor(xp / 30)); $('xpFill').style.width = (xp % 30) / 30 * 100 + '%'; $('xpTxt').textContent = xp + ' XP';
  // + les leçons de « Comprendre » (lot 48, 7 leçons de 3 étoiles)
  const tc = typeof cpEtoiles === 'function' ? cpEtoiles() : 0;
  $('starTot').textContent = (t1 + t2 + t3 + t4 + t5 + t6 + t7 + tc) + '/' + (21 + BASE_LESSONS.length * 6 + CH3_LESSONS.length * 3 + CH4_LESSONS.length * 3 + CH5_LESSONS.length * 3 + (CH6_PRET ? CH6_LESSONS.length * 3 : 0) + CH7_LESSONS.length * 3);
  const bank = bankOf(chapter), map = $('map'); map.querySelectorAll('.node').forEach(n => n.remove()); map.style.setProperty('--n', LESSONS.length);
  let lastDone = -1;
  // lot 76 : la carte de fin (un niveau de Pro affiché) : aucune pastille n'est « le niveau choisi »
  const fin = nivFinIci();
  LESSONS.forEach((l, i) => { const st = bank[i] || 0; if (st) lastDone = i;
    // lot 64 : une carte par niveau, avec son état (réussi, à faire, verrouillé)
    // lot 68 : un niveau de Pro (sans abonnement) a son propre cadenas, violet ; il passe avant le cadenas gris de la progression
    const ouvert = niveauOuvert(i), pro = niveauPro(chapter, i), etat = pro ? 'pro' : !ouvert ? 'verrou' : st >= 2 ? 'reussi' : 'encours';
    const b = document.createElement('button'); b.type = 'button'; b.className = 'node etat-' + etat + (st ? ' done' : ''); b.setAttribute('aria-pressed', String(i === li && !fin));
    if (!ouvert && !pro) b.setAttribute('aria-disabled', 'true');
    // Le disque garde toujours son numéro (comme sur la maquette du 22 oct.) : les étoiles sont juste en dessous.
    b.innerHTML = `<span class="dot">${ouvert && !pro ? i + 1 : NIV_CADENAS}</span><span class="t"></span><span class="s"><b>${'★'.repeat(st)}</b>${'★'.repeat(3 - st)}</span><span class="etq">${pro ? 'Pro' : etat === 'reussi' ? 'Réussi' : etat === 'encours' ? 'À faire' : 'Verrouillé'}</span>`;
    b.querySelector('.t').textContent = l.title;
    // lot 76 : dans la barre, la pastille montre seulement son numéro ; son nom s'affiche au survol de la souris
    b.dataset.t = tr(`${i + 1}. ${l.title}` + (etat === 'reussi' ? ' · réussi' : pro ? ' · avec Pro' : etat === 'verrou' ? ' · pas encore ouvert' : ''));   // en anglais, la bulle est traduite (lot 80)
    b.setAttribute('aria-label', `Niveau ${i + 1} : ${l.title}, ${st} étoile(s) sur 3` + (pro ? ', avec DJingood Pro' : ouvert ? '' : ', verrouillé'));
    b.addEventListener('click', () => { if (placement) return; nivMenu(false); if (niveauPro(chapter, i)){ proOuvre('', { n: chapter, i }); return; } if (!niveauOuvert(i)){ niveauRefuse(i, b); return; } selectLesson(i); }); map.appendChild(b); });
  $('mapProg').style.width = lastDone < 0 ? '0' : (Math.min(lastDone, LESSONS.length - 1) / (LESSONS.length - 1) * (100 - 100 / LESSONS.length)) + '%';
  renderChapters(); if (typeof cpRendChemin === 'function') cpRendChemin();
  $('cpBlocGratuit').hidden = !proBloque();
  // lot 76 : le bandeau Pro sous les niveaux (lot 68) n'existe plus : Pro est dit dans le menu et sur la carte de fin.
  // Comprendre reste au-dessus de la barre seulement sur un téléphone (cpMobile) ; sur ordinateur, il est dans le menu.
  $('vLearn').classList.toggle('cp-tel', typeof cpMobile === 'function' && cpMobile());
  if (!$('nivMenu').hidden) nivMenuDroite();
  nivFinRend();
}
/* ---------- Lot 76 : la carte de fin ----------
   Un niveau de Pro, sans abonnement (proIci), n'est plus affiché avec sa piste et sa table qu'on ne peut pas jouer : une
   carte à la place : « … est dans DJingood Pro » (un lien du guide, « Vérifier ma table »…). À droite, l'offre (proOffre,
   pro.js : 7 jours gratuits). Lot 82 : le chapitre 1 est gratuit en entier, la carte ne sert plus qu'aux autres chapitres ;
   « Voir la démo » montre ce niveau-là (apercu). */
function nivFinIci(){ try { return typeof proIci === 'function' && proIci() && !run; } catch (e) { return false; } }
function nivFinRend(){
  const on = nivFinIci(); $('stage').classList.toggle('fin-on', on); $('nivFin').hidden = !on; if (!on) return;
  const l = LESSONS[li], c = CHAPTERS.find(x => x.n === chapter), nCh = CHAPTERS.filter(x => !x.soon && x.n !== chapter && x.n !== 1).length;
  $('nivFinSur').textContent = `Chapitre ${chapter} · ${c.title}`;
  $('nivFinTitre').textContent = `« ${l.title} » est dans DJingood Pro`;
  const suite = $('nivFinSuite'); suite.innerHTML = '';
  LESSONS.forEach((x, i) => { if (!niveauPro(chapter, i)) return; const s = nivEl('span'); s.innerHTML = NIV_CADENAS; s.appendChild(document.createTextNode(x.title)); suite.appendChild(s); });
  $('nivFinPuis').textContent = `Et ${nCh} autres chapitres, jusqu'au set noté sur 100.`;
  // le niveau gratuit à (re)jouer : le premier pas encore réussi, sinon le moins bien noté
  const libres = BASE_LESSONS.map((_, i) => i).slice(0, NIV_GRATUITS);
  let r = libres.find(i => !niveauReussi(stars, i)); const rejoue = r == null;
  if (rejoue){ r = 0; for (let i = 0; i < NIV_GRATUITS; i++) if ((stars[i] || 0) <= (stars[r] || 0)) r = i; }
  $('nivFinRejouer').textContent = rejoue ? `Rejouer « ${BASE_LESSONS[r].title} »` : `Jouer « ${BASE_LESSONS[r].title} » (gratuit)`;
  $('nivFinRejouer').dataset.i = r;
  const cpOk = typeof CP_LECONS !== 'undefined'; $('nivFinCp').hidden = !cpOk;
  if (cpOk) $('nivFinCp').textContent = `Les leçons Comprendre restent gratuites (${cpEtoiles()}/${CP_LECONS.length * 3} ★)`;
  if (typeof proOffre === 'function') proOffre($('nivFinOffre'), { n: chapter, i: li });
}
$('nivFinRejouer').addEventListener('click', e => goLesson(1, +e.currentTarget.dataset.i || 0));
$('nivFinDemo').addEventListener('click', () => apercuDemarre(chapter, li, 'carte'));
$('nivFinCp').addEventListener('click', e => { e.stopPropagation(); nivMenuCp(); });
function styleLabel(){ if (chapter === 7) return encEtiquette(LESSONS[li]); if (chapter === 3) return 'House · 124 BPM'; if (chapter === 2){ const d = STYLE_DEFS[CH2_STYLE[li]]; return d.label + ' · ' + d.bpm + ' BPM · à l\'oreille · précision serrée'; }
  return styleChoice === 'random' ? 'Style surprise à chaque partie' : STYLE_DEFS[styleChoice].label + ' · ' + STYLE_DEFS[styleChoice].bpm + ' BPM'; }
// Précision demandée, en temps : 1 au chapitre 1, 0,5 aux chapitres 2 et 4, 0,25 en Mode Expert et au chapitre 6 (noté en ms :
// avec 1 temps de marge, un swap 265 ms en retard s'affichait « SWAP PARFAIT ! » au double drop, gardien du lot 41)
const tolOf = () => expertOn() || chapter === 6 ? .25 : chapter === 2 || chapter === 4 ? .5 : 1;
function selectLesson(i){
  // Changement de chapitre : l'ancien numéro de niveau peut ne pas exister dans le nouveau (le chapitre 4 n'a que 4 niveaux)
  if (!LESSONS[li]) li = 0;
  stopRun(); speed = 1; if (i !== li) slowFails = {}; li = i; const l = LESSONS[i]; if (l.random) randomizeRead(l); START = l.start; END = l.end; TOL = tolOf();
  $('lnum').textContent = (chapter > 1 ? `Chapitre ${chapter} · ` : '') + `Niveau ${i + 1} sur ${LESSONS.length}`; $('ltitle').textContent = l.title; $('lgoal').textContent = l.goal; $('lhow').textContent = l.how;
  const lex = lexOf(l.title + ' ' + l.goal + ' ' + l.how); $('llex').hidden = !lex.length; $('llex').textContent = lex.map(([, n, d]) => n + ' : ' + d + '.').join('\n');
  // La table complète reste affichée : les commandes dont le niveau ne se sert pas sont éteintes et inertes (lot 39)
  tableAllume(l.show);
  for (const [k, w] of [['lowA', 'wLowA'], ['lowB', 'wLowB'], ['faderA', 'wFadA'], ['faderB', 'wFadB'], ['cfxA', 'wCfxA'], ['midA', 'wMidA']]) $(w).classList.toggle('auto', isAuto(k));
  Object.assign(ctrl, CTRL_NEUTRE, l.init); applyCtrl(); casque.A = casque.B = false; plCasque(); tableDepart(); if (l.hc) hcModes(l);
  $('result').hidden = true; setStartBtn(false); $('launchB').disabled = true;
  $('cdNum').textContent = '—'; $('cdLab').textContent = ''; $('ring').classList.remove('hot'); $('progFill').style.width = '0';
  $('stage').classList.toggle('sansbpm', !!(l.cal && !l.cal.bpm) || !!(l.set && !l.set.aides.bpm)); $('calQuiz').hidden = true; $('calBar').hidden = true;
  // chapitre 7 (lot 44) : la feuille de route à droite, « Comment c'est noté ? », et le record dans le rond
  $('stage').classList.toggle('estset', !!l.set); $('setNoteBox').hidden = !l.set; $('setRoute').hidden = !l.set;
  if (l.set){ encAvant(l); const rc = encRecords[i]; $('cdNum').textContent = rc == null ? '—' : rc; $('cdLab').textContent = 'record'; }
  $('hint').textContent = chapter === 6 ? (l.hc.quant ? 'Chapitre 6 : hot cues et boucles. Quantize allumé, mais chaque appui est noté en millisecondes.' : 'Chapitre 6 : Quantize éteint. Repères et boucles partent exactement à l’appui.') : chapter === 5 ? 'Chapitre 5 : B ne se cale plus tout seul. Le site mesure le décalage pendant toute la partie.' : chapter === 4 ? 'Chapitre 4 : plusieurs gestes d\'affilée, notés au demi-temps près. 3 étoiles seulement si tout est juste.' : chapter === 3 ? 'Chapitre 3 : plus de compte à rebours. Lis la piste : elle montre l\'intro, le break et la fin de chaque morceau. La démo montre le bon moment.' : chapter === 2 ? 'Chapitre 2 : pas de compte à rebours, et il faut être deux fois plus précis. Regarde la démo si besoin.' : l.user.length && l.user.length < 4 ? 'Les contrôles grisés bougent tout seuls : regarde-les, ils te montrent le geste.' : '';
  ear = chapter === 2; $('styleSeg').hidden = chapter === 2 || chapter === 3 || chapter >= 5;
  $('modeTag').hidden = !(chapter === 2 || chapter >= 4 || l.wave); $('modeTag').textContent = l.set ? 'Noté sur 100' : l.hc ? (l.hc.quant ? 'Quantize allumé · noté en ms' : 'Quantize éteint · noté en ms') : l.cal ? (l.cal.quiz ? 'À l\'oreille, sans geste' : `Calé à moins de ${CAL_OK} ms`) : l.wave ? 'Lis la piste' : chapter === 4 ? (l.noCount ? 'Sans compte à rebours · au demi-temps près' : 'Au demi-temps près') : 'À l\'oreille · précision ×2';
  if (l.wave){ waveTk = null; if (hasWorkers()) prepareCh3(l).then(tk => { if (LESSONS[li] === l && !run){ waveTk = tk; drawHighway(START); } }).catch(() => {}); } else waveTk = null; $('styleTag').textContent = styleLabel();
  $('stage').classList.remove('ear');
  chooseSongs();
  // Avant de jouer, la bulle ne donne jamais le geste (il est dans « Pendant le niveau ») : seulement quoi faire maintenant
  const idle = proIci() ? 'Ce niveau est dans DJingood Pro. Le chapitre 1 est gratuit.' : needSetup() ? 'Place ta table en position de départ, puis appuie sur Jouer.' : l.set ? 'Pas de repère cette fois. Enchaîne comme en soirée !' : expertOn() ? 'Mode Expert : ni compte à rebours, ni repère, ni calage automatique. Chaque geste est noté en millisecondes.' : 'À toi de jouer !';
  const fb = $('lfiches'); fb.innerHTML = '';
  for (const k of fichesOf(l)){ const bt = document.createElement('button'); bt.type = 'button'; bt.className = 'linkbtn'; bt.textContent = 'Revoir la fiche : ' + FICHE_NAMES[k]; bt.addEventListener('click', () => { if (!run) openOnb([FICHES[k]], { fiche: true, keys: [k] }); }); fb.appendChild(bt); }
  fb.hidden = !fb.children.length;
  $('hint').textContent = idle; say(idle);
  renderHud(); renderExpert(); drawHighway(START); updateSetup();
  if (!$('vLearn').hidden) stageIntoView();
}
// Sur un écran peu haut, la barre des boutons (collée en bas) recouvrait la piste : on amène la scène en haut de l'écran
// Lot 76 : sur ordinateur, la barre du chapitre reste en vue tant que « Jouer » est à l'écran ; la scène ne remonte que
// pendant une partie (force), ou si « Jouer » est sous le bas de l'écran
function stageIntoView(force){
  if (force !== true && matchMedia('(min-width:1040px)').matches){ const j = $('startBtn').getBoundingClientRect(); if (j.height && j.top >= 0 && j.bottom <= innerHeight) return; }
  const r = $('stage').getBoundingClientRect(); if (r.bottom > innerHeight && r.top > 8) window.scrollTo({ top: scrollY + r.top - 8, behavior: REDUCED ? 'auto' : 'smooth' }); }
function setStartBtn(running){ $('stage').classList.toggle('joue', running); if (running && !$('vLearn').hidden) requestAnimationFrame(() => stageIntoView(true)); const b = $('startBtn'), pro = !running && proIci();
  b.textContent = running ? 'Arrêter' : pro ? 'Continuer avec Pro' : 'Jouer'; b.classList.toggle('stop', running); b.classList.toggle('pro', pro); $('watchBtn').hidden = pro; }
// lot 68 : le niveau affiché est dans Pro (sans abonnement) : « Jouer » ouvre la fenêtre Pro, pas de démo (l'entraînement
// et l'ancien test de placement ne jouent que des niveaux gratuits). Lot 82 : sauf pendant l'aperçu d'un chapitre fermé
// (apercu, plus bas), qui ne fait que regarder la démo.
const proIci = () => !(apercu && chapter === apercu.n && li === apercu.i) && !prac && !placement && !!LESSONS[li] && niveauPro(chapter, li);

let START = 16, END = 116;
function startRun(demo = false){
  // lot 68 : un niveau de Pro, sans abonnement : la fenêtre Pro, ni partie ni démo
  if (proIci()){ proOuvre('', { n: chapter, i: li }); return; }
  // lot 82 (gardien) : pendant l'aperçu, seule la démo tourne ; « Jouer » ferme l'aperçu et rouvre la fenêtre Pro
  if (apercu && !demo){ apercuFin(true); return; }
  // Table pas en place (par exemple après une fiche où l'on a tourné un potard) : on montre l'encadré et on le dit
  if (!demo && needSetup() && !setupReady()){ updateSetup(); say('Remets ta table en position de départ : « Jouer » se débloquera tout seul.'); $('setup').scrollIntoView({ behavior: REDUCED ? 'auto' : 'smooth', block: 'center' }); return; }
  ensureAudio(); if (ac.state !== 'running') ac.resume();
  if (preparing) return; preparing = true;
  if (!demo) stat1('premiere-partie');
  $('startBtn').textContent = hasWorkers() ? 'Préparation…' : 'Préparation (quelques secondes)…'; $('watchBtn').disabled = true;
  const myLi = li, myCh = chapter;
  setTimeout(async () => {
    if (LESSONS[li].set){ await encDemarre(demo); return; }   // chapitre 7 : son propre départ (set.js)
    const lw = LESSONS[li]; let tkW = null, styW = null, vrW = 0;
    let songA = null, songB = null;
    // chapitre 5 : B a son propre tempo, tiré au départ de chaque partie
    const bpmB = lw.cal ? calChoisitBpm(lw) : 0, vB = lw.cal ? bpmB / STYLE_DEFS[sel.sty].bpm : speed;
    try { if (lw.wave) tkW = await prepareCh3(lw).catch(() => prepareCh3(lw)); else { styW = sel.sty; vrW = sel.vr; const aD = !!(lw.hc && lw.hc.aDrop); [songA, songB] = await Promise.all([songSafe(styW, vrW, aD ? 'B1' : 'A', speed), songSafe(styW, hcVarB(lw, vrW), lw.bBass ? 'B1' : 'B0', vB)]); } }
    finally { preparing = false; $('watchBtn').disabled = false; }
    if (li !== myLi || chapter !== myCh || run){ setStartBtn(false); if (demo && apercu && !run) apercuFin(false, false); return; }
    if (lw.wave){ const tk = tkW; waveTk = tk; tk.bufA = tk.bufA || bufferOf(tk.A); tk.bufB = tk.bufB || bufferOf(tk.B); tracks = { A: tk.bufA, B0: tk.bufB, B1: tk.bufB }; if (deck.A.delay) deck.A.delay.delayTime.value = P * .75; $('styleTag').textContent = styleLabel(); }
    else { const d = STYLE_DEFS[styW]; BPM = d.bpm * speed; P = 60 / BPM; if (chapter === 4) $('styleTag').textContent = `${d.label} · ${Math.round(BPM)} BPM` + (speed !== 1 ? ` · ralenti ${Math.round(speed * 100)} %` : ''); tracks = { A: bufOf(songA), B0: bufOf(songB), B1: bufOf(songB) }; if (deck.A.delay) deck.A.delay.delayTime.value = P * .75;
      // vraie musique pas chargée (hors ligne…) : l'étiquette le dit pendant toute la partie
      if (songA.panne || songB.panne){ $('styleTag').textContent = 'House · 124 BPM · la vraie musique n’a pas pu se charger'; $('stage').classList.remove('credit-vrai'); } }
    const l = LESSONS[li]; Object.assign(ctrl, CTRL_NEUTRE, l.init); if (needSetup()) for (const k of l.user) if (phys[k] != null) ctrl[k] = phys[k]; applyCtrl();
    // En Expert, le départ change d'une partie à l'autre (0, 4 ou 8 temps plus tôt) : on ne peut pas jouer de mémoire
    const xp = expertOn() && !demo; START = Math.max(0, l.start - (xp ? 4 * Math.floor(Math.random() * 3) : 0));
    const t0 = ac.currentTime + .15;
    play('A', tracks.A, t0, START * P, false);
    const earRun = (chapter === 2 || !!(prac && prac.ear) || !!LESSONS[li].noCount) && !demo;
    run = { gT: performance.now(), t0, launch: null, frames: [], lowBAtLaunch: null, bBuf: l.bBass ? tracks.B1 : tracks.B0, status: {}, popped: {}, lastBeat: START - 1, demo, cap: 0, ear: earRun, ch: chapter, expert: xp,
      calBpm: bpmB, calPer: bpmB ? 60 / bpmB : 0 };
    viniCale();   // Vini danse sur les temps de cette partie
    $('stage').classList.toggle('ear', earRun); $('stage').classList.add('running');
    const st0 = $('stage').getBoundingClientRect(); if (st0.top < -4 || st0.top > 40) window.scrollTo({ top: window.scrollY + st0.top - 8, behavior: REDUCED ? 'auto' : 'smooth' });
    setEcho(false); run.echoAt = null;
    if (l.cal) calDepart(demo); else if (l.hc) hcDepart(demo); else if (l.autoLaunch || demo) launchAt(l.launchBeat);
    // les commandes tenues par le site prennent leur place du départ avant que le son parte (lot 47 : au filtre et au swap,
    // B est déjà à fond au temps 48 ; en Mode Expert, la partie peut commencer 8 temps plus tôt, B à moitié monté)
    if (!l.cal && !l.hc) automate(START);
    $('stage').classList.toggle('demo', demo); $('demoTag').hidden = !demo; $('watchBtn').disabled = true;
    $('result').hidden = true; setStartBtn(true); $('setup').hidden = true; $('plan').hidden = true; $('startBtn').disabled = false; $('startBtn').classList.remove('ready'); $('launchB').disabled = !!l.autoLaunch; $('startBtn').blur();
    $('hint').textContent = demo ? 'Démonstration : regarde les contrôles bouger et écoute le résultat.' : l.hc ? 'Astuce : sur ta table, choisis le bon mode des pads (HOT CUE ou BEAT LOOP).' : l.btn.includes('echo') ? 'Astuce : la touche E active aussi l\'écho.' : !l.autoLaunch ? 'Astuce : la barre d\'espace lance aussi B.' : '';
    if (demo) for (const w of ['wLowA', 'wLowB', 'wFadA', 'wFadB', 'wCfxA', 'wMidA']) $(w).classList.add('auto');
    $('echoBtn').disabled = demo || !l.btn.includes('echo');
  }, 30);
}
const beatNow = () => run ? (ac.currentTime - run.t0) / P + START : null;
// B lancé au temps k de A. Si la partie commence après k (lot 47 : le filtre et le swap commencent au temps 48, B part
// au temps 32), B est déjà en route au départ : il démarre avec A, plus loin dans son morceau.
function launchAt(k){ run.launch = k; run.lowBAtLaunch = ctrl.lowB; const avance = Math.max(0, START - k);
  play('B', run.bBuf, run.t0 + (k + avance - START) * P, (LESSONS[li].bCue + avance) * P, true, ...(LESSONS[li].bLoop || [64, 128])); $('launchB').disabled = true; }
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
  // chapitre 7 : PLAY de B est un PLAY/pause ordinaire (le morceau suivant peut être sur A ou sur B)
  if (LESSONS[li].set){ if (run && run.set && !run.demo){ ensureAudio(); plLecture('B'); } return; }
  if (!run || run.launch !== null || LESSONS[li].autoLaunch) return;
  // chapitre 6 : B part de son hot cue, avec le pad (la barre d'espace ou PLAY le lanceraient sans passer par le repère)
  if (LESSONS[li].hc){ say('Ici, B part de son hot cue : appuie sur le pad 1 de B.'); return; }
  if (LESSONS[li].cal){ calLanceLibre(); return; }
  if (run.expert){ launchExpert(); return; }
  const b = beatNow(), k = Math.round(b);
  if (k >= b) launchAt(k);
  else { run.launch = k; run.lowBAtLaunch = ctrl.lowB; play('B', run.bBuf, ac.currentTime + .01, LESSONS[li].bCue * P + (b - k) * P + .01, true, ...(LESSONS[li].bLoop || [64, 128])); $('launchB').disabled = true; }
  judgeLaunch(k);
}
function stopRun(){ encStop(); if (run) goalAdd((performance.now() - run.gT) / 1000); $('calQuiz').hidden = true; $('calBar').hidden = true; plQuantize = true; setFocus([]); lastAct = ''; const wasDemo = run && run.demo; if (ac){ stop('A'); stop('B'); setEcho(false); } run = null; viniCale(); setStartBtn(false); $('launchB').disabled = true;
  $('stage').classList.remove('demo', 'ear', 'running'); $('demoTag').hidden = true; $('watchBtn').disabled = false;
  if (wasDemo){ for (const [k, w] of [['lowA', 'wLowA'], ['lowB', 'wLowB'], ['faderA', 'wFadA'], ['faderB', 'wFadB'], ['cfxA', 'wCfxA'], ['midA', 'wMidA']]) $(w).classList.toggle('auto', isAuto(k)); Object.assign(ctrl, CTRL_NEUTRE, LESSONS[li].init); applyCtrl(); }
  updateSetup();
  // lot 82 : la démo d'un aperçu est finie (ou arrêtée) : retour, et la fenêtre Pro (après la fin de finish, d'où le délai)
  if (wasDemo && apercu) setTimeout(() => apercuFin(true), 0); }
// L'écho est sur A dans les leçons ; au chapitre 7, sur le morceau en cours, qui peut être sur B (echoDeck)
let echoOn = false, echoDeck = 'A';
function setEcho(on, k = 'A'){
  echoOn = !!on; echoDeck = k;
  if (ac) for (const x of ['A', 'B']){ const d = deck[x]; if (!d.echoIn) continue;
    if (x === k && echoOn) d.delay.delayTime.value = (d.per || P) / (d.rate || 1) * .75;   // trois quarts de temps du morceau
    d.echoIn.gain.setTargetAtTime(echoOn && x === k ? 1 : 0, ac.currentTime, .004); }
  $('echoBtn').setAttribute('aria-pressed', String(echoOn));
}
function toggleEcho(){
  if (run && run.set){ encEcho(); return; }
  if (!run || run.demo || !LESSONS[li].btn.includes('echo')) return;
  setEcho(!echoOn);
  if (echoOn && run.echoAt == null){ const b = run.expert ? heardBeat() : beatNow(); run.echoAt = b; const e = b - 63;
    if (e >= -1.5 * TOL && e <= .6 * TOL){ pop('Écho lancé !', 'ok'); run.status.ECHO = 'ok'; chime(true); }
    else { pop(e < 0 ? 'Écho trop tôt' : 'Écho trop tard', 'mid'); run.status.ECHO = 'mid'; } }
}
function ideal(k, b, i = li){
  if (LESSONS[i].c) return ideal4(k, b, LESSONS[i]);   // chapitre 4 (combos.js)
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
const DEMO_CAPS = { 0: [[32, 'B part sur le 1 de l\'outro'], [38, 'Même tempo, même phrase : B joue sous A']],
  1: [[32, 'B entre, fader en bas'], [56, 'B est à fond'], [92, 'A est sorti'], [96, 'Drop de B !']],
  2: [[60, 'Prépare tes deux mains'], [64, 'A coupé et B lancé, au même instant'], [68, 'Transition nette, sans mélange']],
  3: [[60, 'Écoute la fin de phrase de A'], [63, 'Écho activé sur le dernier temps'], [64, 'Fader de A coupé : l\'écho résonne'], [66, 'B tombe sur son drop']],
  4: [[48, 'B joue déjà sous A'], [64, 'Le filtre commence : A perd ses basses'], [80, 'On continue lentement'], [92, 'Filtre à fond : A n\'est plus qu\'un souffle'], [96, 'Drop de B !']],
  5: [[48, 'B joue sous A, basses coupées'], [64, 'Swap : A coupé, B ouvert'], [68, 'Les basses de B ont pris le relais']],
  6: [[30, 'B attend, basses coupées'], [32, 'B part sur le 1'], [56, 'B est à fond'], [64, 'Swap des basses'], [92, 'A est sorti'], [96, 'Drop de B !']] };
BASE_LESSONS.forEach((l, i) => { l.targets = TARGETS[i]; l.caps = DEMO_CAPS[i]; });
function demoCaptions(b){ const caps = LESSONS[li].caps; while (run.cap < caps.length && b >= caps[run.cap][0]){ pop(caps[run.cap][1], 'ok'); run.cap++; } }
function automate(b){
  const L = run.launch; let ch = false;
  if (run.demo && LESSONS[li].cal){ calDemoGestes(b); return; }
  if (LESSONS[li].hc) return;   // chapitre 6 : la démo passe par hcDemo, rien n'est tenu par le site
  if (run.demo){ for (const k of ['faderA', 'faderB', 'lowA', 'lowB', 'cfxA', 'midA']){ const v = ideal(k, b); if (Math.abs(ctrl[k] - v) > .002){ ctrl[k] = v; ch = true; } } if (ch) applyCtrl(); const ev = ideal('echo', b) > .5; if (ev !== echoOn) setEcho(ev); return; }
  const set = (k, v) => { if (isAuto(k) && Math.abs(ctrl[k] - v) > .002){ ctrl[k] = v; ch = true; } };
  if (LESSONS[li].kind === 'moment' && L !== null){ set('faderB', clamp01((b - L) / 16)); set('faderA', 1 - clamp01((b - (L + 48)) / 16)); }
  if (LESSONS[li].kind === 'swap'){ set('faderB', clamp01((b - 32) / 16)); set('faderA', 1 - clamp01((b - 80) / 16)); }
  const KW = LESSONS[li];
  if (KW.c){ for (const k of ['faderA', 'faderB', 'lowA', 'lowB', 'cfxA']) set(k, ideal4(k, b, KW)); if (KW.c.echo && echoOn && b > 72) setEcho(false); }
  if (KW.wave){ if (KW.kind === 'vocal'){ set('faderB', clamp01((b - 32) / 16)); set('faderA', 1 - clamp01((b - 80) / 16)); }
    else if (L !== null) set('faderB', clamp01((b - L) / (KW.kind === 'break' ? 16 : 8))); }
  if (LESSONS[li].kind === 'filter'){ set('faderB', clamp01((b - 32) / 16)); set('faderA', 1 - clamp01((b - 96) / 4)); }
  if (LESSONS[li].kind === 'echo' && echoOn && b > 72) setEcho(false);
  if (ch) applyCtrl();
}
function liveJudge(b){
  const s = run.status, p = run.popped;
  if (LESSONS[li].c) judge4(b);   // chapitre 4 (combos.js)
  if (['swap', 'full'].includes(LESSONS[li].kind) || (LESSONS[li].cal && LESSONS[li].cal.swap && run.launch !== null) || (LESSONS[li].hc && LESSONS[li].hc.swap && run.launch !== null)){
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
    if (!s['MÉLODIE'] && b >= 36 && ctrl.midA < .12){ const e = b - 48, ok = Math.abs(e) <= 1; pop(ok ? 'Mélodie coupée pile !' : e < 0 ? 'Coupé trop tôt' : 'Coupé en retard', ok ? 'ok' : 'mid'); s['MÉLODIE'] = ok ? 'ok' : 'mid'; if (ok) chime(true); }
    if (!s['MÉLODIE'] && b > 50){ pop('Deux mélodies en même temps !', 'bad'); s['MÉLODIE'] = 'bad'; }
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
// Une image de la partie : les positions de toutes les commandes au temps b
const snapFrame = b => ({ b, ma: ctrl.midA, fa: ctrl.faderA, fb: ctrl.faderB, la: ctrl.lowA, lb: ctrl.lowB, ca: ctrl.cfxA, ec: echoOn ? 1 : 0 });
function frame(){
  requestAnimationFrame(frame);
  if (!run){ return; }
  if (run.set){ encFrame(); return; }   // chapitre 7 : tout se passe dans set.js
  const b = beatNow(); if (b < START) return;
  // En Expert, les gestes sont mesurés au temps entendu (le son sort un peu après son calcul)
  const hb = run.expert || LESSONS[li].hc ? heardBeat() : b;   // chapitre 6 : comme en Expert, au temps entendu
  automate(b); if (run.demo) demoCaptions(b); else liveJudge(hb);
  run.frames.push(snapFrame(hb));
  // chapitre 5 : sa propre consigne, son compteur, pas de compte à rebours
  // chapitre 6 : sa consigne et son compte à rebours sont dans hcFrame (hotcues.js)
  if (LESSONS[li].hc){ hcFrame(b); setFocus(LESSONS[li].show);
    $('progFill').style.width = clamp01((b - START) / (END - START)) * 100 + '%'; drawHighway(b); if (b >= END) finish();
    if (run && !LESSONS[li].autoLaunch && run.launch === null && b > LESSONS[li].launchBeat + 40) finish(); return; }
  if (LESSONS[li].cal){ calFrame(b); if (!run){ $('progFill').style.width = '100%'; return; }   // la démo du niveau 1 finit dans calFrame : barre pleine
    const rg = $('ring'); $('cdNum').textContent = '♪'; $('cdLab').textContent = ''; rg.classList.remove('hot'); setFocus(LESSONS[li].show);
    // niveau 1 (le quiz) : la barre avance à chaque réponse, il finit dès la cinquième (END n'est qu'un filet)
    const q = run && run.q, pr = q ? q.i / q.tours.length : (b - START) / (END - START);
    $('progFill').style.width = clamp01(pr) * 100 + '%'; drawHighway(b); if (b >= END) finish();
    if (run && !LESSONS[li].autoLaunch && run.launch === null && b > LESSONS[li].launchBeat + 40) finish(); return; }
  const tg = LESSONS[li].targets.find(([x, lab]) => x > b - .5 && !(run.status[lab] && run.status[lab] !== 'late'));
  const ring = $('ring');
  const LL = LESSONS[li], userGroups = LL.show.filter(g => g !== 'gPlay' || !LL.autoLaunch);
  if (run.demo){ $('cdNum').textContent = tg ? Math.max(0, Math.ceil(tg[0] - b)) : '♪'; $('cdLab').textContent = tg ? 'temps' : ''; ring.classList.remove('hot'); setFocus(tg && tg[0] - b <= 6 ? LL.targets.filter(t => t[0] === tg[0]).map(t => GROUP_OF[t[1]]) : []); }
  else if (LL.wave || run.ear || run.expert){ $('cdNum').textContent = '?'; $('cdLab').textContent = ''; ring.classList.remove('hot'); setFocus(userGroups);
    showAction(LL.wave ? 'Lis la piste et agis au bon moment.' : run.expert ? 'Mode Expert : aucun repère, à toi de sentir le moment.' : 'Pas de compte à rebours : écoute et sens la phrase.'); }
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
// Mode Expert : les écarts s'écrivent en millisecondes, et la note d'un geste minuté devient continue
// (1 jusqu'à okMs d'écart, 0 à partir de zeroMs) au lieu de 1, 0,5 ou 0
const msOf = beats => Math.round(beats * P * 1000);
const dur = x => xRun ? `${Math.abs(msOf(x))} ms` : `${fr1(Math.abs(x))} temps`;
const xv = (v, err, okMs, zeroMs) => xRun ? clamp01(1 - (Math.abs(msOf(err)) - okMs) / (zeroMs - okMs)) : v;
const firstAt = (fr, from, test) => { const f = fr.find(x => x.b >= from && test(x)); return f ? f.b : null; };
function evalLaunch(L, target = 32){
  if (L === null) return ['bad', 'Tu n\'as pas lancé B : écoute le compte à rebours et appuie quand il arrive à zéro.', 0];
  const e = L - target;
  if (e === 0) return ['ok', target === 32 ? 'B est parti pile sur le 1 de l\'outro de A.' : 'B est parti pile sur le début de la phrase.', 1];
  if (Math.abs(e) <= 2) return ['mid', `B est parti ${Math.abs(e)} temps ${e > 0 ? 'trop tard' : 'trop tôt'} : son drop tombe ${Math.abs(e)} temps ${e > 0 ? 'après' : 'avant'} la fin de phrase de A, ça s'entend comme un décalage.`, .5];
  if (e % 32 === 0) return ['mid', `B est parti sur le début d'une autre phrase (${e > 0 ? 'une phrase trop tard' : 'une phrase trop tôt'}) : c'est en rythme, mais pas au bon moment du morceau.`, .5];
  return ['bad', `B est parti ${Math.abs(e)} temps trop ${e > 0 ? 'tard' : 'tôt'}, en plein milieu d'une phrase : les deux morceaux ne changent plus en même temps. Attends le début de la phrase.`, 0];
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
  if (tKill === null || tOpen === null) return [['bad', tKill === null ? 'Les basses de A n\'ont jamais été coupées : passe son LOW de normal à coupé (tout à gauche).' : 'Les basses de B n\'ont jamais été remises : passe son LOW de coupé à normal (à midi).', 0]];
  const sw = (tKill + tOpen) / 2, e = sw - 64, ov = Math.max(0, tKill - tOpen), gap = Math.max(0, tOpen - tKill), out = [];
  out.push(Math.abs(e) <= .75 * TOL ? ['ok', xRun ? `Swap à ${dur(e)} du début de la phrase.` : 'Swap pile sur le début de la phrase.', xv(1, e, 30, 250)] : Math.abs(e) <= 2 * TOL ? ['mid', `Swap ${dur(e)} ${e > 0 ? 'trop tard' : 'trop tôt'}.`, xv(.5, e, 30, 250)] : ['bad', `Swap à ${dur(e)} de la phrase : vise le début de la phrase.`, xv(0, e, 30, 250)]);
  const og = Math.max(ov, gap);
  out.push(ov > 2 * TOL ? ['bad', `Deux basses ensemble pendant ${dur(ov)} : ouvre B et coupe A dans le même geste.`, xv(0, og, 40, 300)] : ov > .5 * TOL ? ['mid', `Deux basses ensemble pendant ${dur(ov)} : ça frotte un peu.`, xv(.5, og, 40, 300)]
    : gap > 2 * TOL ? ['bad', `Plus aucune basse pendant ${dur(gap)} : l'énergie retombe.`, xv(0, og, 40, 300)] : gap > .5 * TOL ? ['mid', `Petit trou dans les basses (${dur(gap)}).`, xv(.5, og, 40, 300)] : ['ok', 'Les basses passent de A à B sans chevauchement ni trou.', xv(1, og, 40, 300)]);
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
  else { const e = at - 63; out.push(e >= -1.5 * TOL && e <= .6 * TOL ? ['ok', 'Écho activé sur le dernier temps de la phrase.', xv(1, e, 60, 500)] : ['mid', `Écho activé ${dur(e)} ${e > 0 ? 'trop tard' : 'trop tôt'} : vise le dernier temps avant la ligne.`, xv(.5, e, 60, 500)]); }
  if (cut == null) out.push(['bad', 'A n\'a jamais été coupé : baisse son fader d\'un coup sur la ligne.', 0]);
  else { const e = cut - 64; out.push(Math.abs(e) <= .6 * TOL ? ['ok', xRun ? `A coupé à ${dur(e)} du début de la phrase : B tombe dans l'écho.` : 'A coupé pile au début de la phrase : B tombe dans l\'écho.', xv(1, e, 30, 250)] : Math.abs(e) <= 1.5 * TOL ? ['mid', `A coupé ${dur(e)} ${e > 0 ? 'en retard' : 'trop tôt'}.`, xv(.5, e, 30, 250)] : ['bad', `A coupé à ${dur(e)} de la ligne.`, xv(0, e, 30, 250)]); }
  if (at != null && cut != null) out.push(at < cut ? ['ok', 'L\'écho était lancé avant la coupure : A s\'éteint en douceur.', 1] : ['bad', 'Tu as coupé A avant de lancer l\'écho : il n\'y avait plus rien à faire résonner.', 0]);
  return out;
}
function evalCut(fr, L){
  const cut = firstAt(fr, 56, x => x.fa < .1);
  if (cut == null) return [['bad', 'A n\'a jamais été coupé : baisse son fader d\'un coup au moment où B démarre.', 0]];
  const e = cut - 64, out = [];
  out.push(Math.abs(e) <= .5 * TOL ? ['ok', xRun ? `A coupé à ${dur(e)} de la ligne.` : 'A coupé pile sur la ligne.', xv(1, e, 30, 250)] : Math.abs(e) <= 1.5 * TOL ? ['mid', `A coupé ${dur(e)} ${e > 0 ? 'en retard' : 'trop tôt'}.`, xv(.5, e, 30, 250)] : ['bad', `A coupé à ${dur(e)} de la ligne.`, xv(0, e, 30, 250)]);
  if (L != null){ const d = cut - L; out.push(Math.abs(d) <= .75 * TOL ? ['ok', 'Coupure et lancement en même temps : la transition est nette.', xv(1, d, 30, 250)] : d > 0 ? ['mid', `A et B ont joué ensemble pendant ${dur(d)} : coupe A dans le même geste.`, xv(.5, d, 30, 250)] : ['mid', `Il y a eu un blanc de ${dur(d)} entre la coupure et le lancement de B.`, xv(.5, d, 30, 250)]); }
  return out;
}
function evalWave(L, l){
  if (L == null) return [['bad', 'Tu n\'as pas lancé B : repère la fin de A sur la piste, puis lance B pour que son drop tombe dessus.', 0]];
  const d = L + l.bIntro - l.aEnd, how = ` Le bon moment était le temps ${l.launchBeat} : fin de A (temps ${l.aEnd}) moins l'intro de B (${l.bIntro} temps).`, out = [];
  if (d === 0) out.push(['ok', 'Le drop de B est tombé pile quand A s\'est arrêté.', 1]);
  else if (d < 0) out.push([d >= -2 ? 'mid' : 'bad', `B lancé trop tôt : son drop est tombé ${-d} temps avant la fin de A, pendant que A jouait encore.` + how, d >= -2 ? .5 : 0]);
  else out.push([d <= 2 ? 'mid' : 'bad', `B lancé trop tard : ${d} temps de vide entre la fin de A et le drop de B.` + how, d <= 2 ? .5 : 0]);
  // piégé : lancé pendant le break, ou juste après (plus de 8 temps trop tôt ; une légère avance n'est pas le piège)
  if (l.kind === 'break' && L >= 16 && L < l.launchBeat - 8) out.push(['bad', 'Tu t\'es fait piéger par le break de A : la musique s\'est vidée, mais ce n\'était pas la fin. Sur la piste, on voyait que A repartait à fond après le break.', 0]);
  return out;
}
function evalVocal(fr){
  const t = firstAt(fr, 36, x => x.ma < .12);
  if (t == null) return [['bad', 'Le MID de A n\'a jamais été coupé : les deux mélodies se sont superposées.', 0]];
  const e = t - 48;
  if (Math.abs(e) <= 1) return [['ok', 'MID de A coupé pile quand la mélodie de B commence : une seule mélodie à la fois.', 1]];
  if (e < 0) return [[e >= -4 ? 'mid' : 'bad', `MID coupé ${fr1(-e)} temps trop tôt : A a perdu sa mélodie alors que celle de B n'avait pas commencé.`, e >= -4 ? .5 : 0]];
  return [[e <= 4 ? 'mid' : 'bad', `MID coupé ${fr1(e)} temps trop tard : on a entendu deux mélodies ensemble pendant ${fr1(e)} temps.`, e <= 4 ? .5 : 0]];
}
function finish(){
  if (!run) return; const r = run; stopRun();
  if (r.demo){ questNote({ demo: true }); $('hint').textContent = 'À toi ! Appuie sur Jouer et refais exactement la même chose.'; $('startBtn').classList.add('ready'); $('cdNum').textContent = '—'; $('cdLab').textContent = 'À toi de jouer'; $('ring').classList.remove('hot'); return; }
  let items = []; xRun = !!r.expert;
  const KD = LESSONS[li].kind, evL = (L, t) => r.expert ? evalLaunchX(L, t) : evalLaunch(L, t);
  if (KD === 'moment') items = [evL(r.launch)];
  if (KD === 'fader') items = evalFaders(r.frames);
  if (KD === 'swap') items = evalSwap(r.frames);
  if (KD === 'full'){ items = [evL(r.launch)];
    if (r.launch !== null) items.push(r.lowBAtLaunch < .15 ? ['ok', 'Basses de B coupées avant de le lancer.', 1] : ['bad', 'B est parti avec ses basses ouvertes : coupe son LOW avant de le lancer.', 0]);
    items = items.concat(evalSwap(r.frames), evalFaders(r.frames).filter((_, i) => i !== 1)); }
  if (['shortintro', 'break', 'read'].includes(KD)) items = evalWave(r.launch, LESSONS[li]);
  if (KD === 'vocal') items = evalVocal(r.frames);
  if (LESSONS[li].kind === 'filter') items = evalFilter(r.frames);
  if (LESSONS[li].kind === 'echo') items = evalEcho(r.frames, r.echoAt);
  if (LESSONS[li].kind === 'cut') items = [evL(r.launch, 64)].concat(evalCut(r.frames, r.launch));
  if (LESSONS[li].c) items = eval4(r);
  if (LESSONS[li].cal) items = calEval(r);
  if (LESSONS[li].hc) items = hcEval(r);
  if (LESSONS[li].set) items = encEval(r);
  // Chapitre 4 : 3 étoiles seulement si tous les gestes sont justes ; chapitre 7 : la note sur 100 du set (set.js)
  const score = r.set ? r.set.score / 100 : items.reduce((s, x) => s + x[2], 0) / items.length, st0 = LESSONS[li].c ? (score >= .999 ? 3 : score >= .6 ? 2 : 1) : score >= .9 ? 3 : score >= .55 ? 2 : 1;
  const xr = r.expert ? expertResult(score) : null, st = r.set ? encEtoiles(r.set.score) : LESSONS[li].cal ? calEtoiles(r, items) : LESSONS[li].hc ? hcEtoiles(items) : xr ? xr.st : speed < 1 ? Math.min(2, st0) : st0;
  const wasOpen = ch2Unlocked(), was3 = ch3Unlocked(), bank = bankOf(r.ch), before = bank[li] || 0;
  if (!prac){ bank[li] = Math.max(before, st); try { localStorage.setItem(BANK_KEY[r.ch], JSON.stringify(bank)); } catch (e) {} }
  // statistiques : la première réussite (2 étoiles ou plus), puis le premier niveau réussi de chaque chapitre (stats.js)
  if (st >= 2){ stat1('premiere-reussite'); if (!prac && !placement) stat1('chapitre-' + r.ch); }
  const rs = $('rStars'); rs.innerHTML = '';
  for (let i = 0; i < 3; i++){ const sp = document.createElement('span'); sp.textContent = '★'; if (i < st) sp.className = 'on'; sp.style.animationDelay = (i * .18) + 's'; rs.appendChild(sp); }
  $('rTitle').textContent = xr ? (st === 3 ? 'Expert : niveau pro !' : st === 2 ? 'Expert : bien, encore un peu de précision.' : 'Expert : pas encore. Écoute, compte, anticipe.')
    : r.set ? (st === 3 ? 'Set de pro !' : st === 2 ? 'Beau set !' : 'Pas encore. Lis le conseil et rejoue.')
    : st === 3 ? 'Parfait, transition de pro !' : st === 2 ? 'Presque ! Un détail à régler.' : 'Pas encore. Lis le conseil et rejoue.';
  // Une seule ligne sous le titre : le record, les XP gagnés, les chapitres débloqués
  const gained = (bank[li] - before) * XP_PER[r.ch], rec = r.set ? r.set.recTxt : xr ? xr.txt : gained > 0 ? '' : st === 3 ? 'Score maximum déjà atteint' : `Record : ${'★'.repeat(bank[li])}`;
  $('rGain').textContent = [rec, gained > 0 ? `+${gained} XP` : '', !wasOpen && ch2Unlocked() ? (CH6_PRET ? 'Chapitres 2, 4, 5, 6 et 7 débloqués !' : 'Chapitres 2, 4, 5 et 7 débloqués !') : '', !was3 && ch3Unlocked() ? 'Chapitre 3 débloqué !' : ''].filter(Boolean).join(' · ');
  resultatCarte(st, items, r.set ? { note: r.set.score, pire: r.set.pire, resume: items[0][0] === 'ok' ? 'Voir le détail' : `Voir toutes mes erreurs (${items.length})` } : {});
  const ul = $('rDetails'); ul.innerHTML = ''; for (const [lvl, txt] of items){ const x = document.createElement('li'); x.className = lvl; x.textContent = txt; ul.appendChild(x); }
  $('next').hidden = li >= LESSONS.length - 1 || !niveauOuvert(li + 1);   // lot 64 : pas de « Niveau suivant » vers un niveau fermé
  resultatBoutons(st);
  $('result').hidden = false; $('result').scrollTop = 0; $('retry').focus({ preventScroll: true });
  // la carte est en haut de la scène : on remonte la scène en haut de l'écran (sinon, après un set, les boutons étaient sous l'écran)
  { const r0 = $('stage').getBoundingClientRect(); if (!$('vLearn').hidden && (r0.top < -4 || r0.top > 40)) window.scrollTo({ top: scrollY + r0.top - 8, behavior: 'auto' }); }
  $('cdNum').textContent = '—'; $('cdLab').textContent = 'Appuie sur Jouer'; $('ring').classList.remove('hot');
  if (r.set){ $('cdNum').textContent = encRecords[li] ?? '—'; $('cdLab').textContent = 'record'; $('cmpBox').hidden = true; }
  else { drawCompare(r.frames, li, r.launch); if (LESSONS[li].cal || LESSONS[li].hc) $('cmpBox').hidden = true; }
  if (LESSONS[li].random){ const l = LESSONS[li]; randomizeRead(l); START = l.start; END = l.end; if (hasWorkers()) prepareCh3(l).then(tk => { if (!run && LESSONS[li] === l){ waveTk = tk; drawHighway(START); } }).catch(() => {}); }
  if (placement) placementStep(st);
  if (prac) pracStep(st);
  questLigne(questNote({ st, expert: !!r.expert, ear: !!r.ear, ch: r.ch }));   // après pracStep : le défi du jour est à jour
  const fresh = goalFresh;
  // le compte, après une réussite (mails.js) ; lot 81 : l'essai de 7 jours, dès la première réussite, prend sa place (et la
  // proposition du compte n'est alors ni comptée ni consommée pour la journée, gardien du lot 81)
  quizOffer(st); avisPartie(r.ch, st); goalNote(); slowOffer(st); resultatBoutons(st); if (!essaiTot(r.ch, st)) mlPropose(st);
  finEssai(r.ch, st, before);
  renderHud(); if (st >= 2) confetti(st === 3 ? 160 : 60);
  if (fresh) openSerie();   // objectif du jour atteint avec cette partie : l'écran de la série passe devant (avec son propre son)
  else if (st >= 2){ for (let i = 0; i < st; i++) setTimeout(() => son('etoile', i), 120 + i * 180); setTimeout(() => son('fin'), 160 + st * 180); }
  else son('finRatee');
}
/* ---------- La fin du chapitre 1 (lot 68, lot 82) ----------
   Le seul endroit où l'on pousse vraiment Pro : la première réussite (2 étoiles ou plus) du dernier niveau gratuit. Lot 82 :
   c'est le niveau 7, « La transition complète » : la personne vient de faire sa première transition complète, avec sa table.
   Demande de l'utilisateur (22 nov. 2026, après la maquette) : « un bouton … comme continuer … et qu'il se retrouve face au
   paywall … sans qu'il ait besoin d'aller lui-même consciemment appuyer sur le truc payer ». La carte fête (Vini, les étoiles,
   « Ta première transition complète ! », « Chapitre 1 terminé ») et n'a qu'un bouton, « Continuer », le même que « Niveau
   suivant », au même endroit : il ouvre la grande fenêtre Pro du chapitre 2, avec l'image de la démo (proOuvre, pro.js).
   Pas d'offre sur la carte elle-même (l'essai, le prix, le rattrapage sont dans la fenêtre). Raté, ou déjà réussi avant :
   la carte normale. */
function finEssai(ch, st, before){
  const ici = proBloque() && !prac && !placement && ch === 1 && li === NIV_GRATUITS - 1 && st >= 2 && before < 2;
  document.querySelector('.rcard').classList.toggle('fin-ch1', ici);   // « Rejouer » caché (styles.css)
  // la carte d'avant a pu être fermée sans « Continuer » (×, Échap) : on retire le rôle ; le texte, seulement hors entraînement
  // (pracStep vient d'écrire « Retour à l'entraînement », gardien du lot 82)
  if ($('next').dataset.go === 'pro' && !ici){ delete $('next').dataset.go; if (!prac && !placement) $('next').textContent = 'Niveau suivant'; }
  if (!ici) return;
  $('rTitle').textContent = 'Ta première transition complète\u00a0!';
  $('rGain').textContent = `Chapitre 1 terminé · ${sumStars(stars)} ★`;
  // une seule chose à faire : on range ce qui détourne l'œil (À travailler, question bonus, compte, le détail)
  $('rTravail').hidden = true; $('quizBtn').hidden = true; $('slowBtn').hidden = true; $('rCompte').hidden = true; $('rEssai').hidden = true; $('rTout').hidden = true;
  $('next').hidden = false; $('next').textContent = 'Continuer'; $('next').dataset.go = 'pro';
  $('next').classList.add('go'); $('retry').classList.remove('go'); $('next').focus({ preventScroll: true });   // « Rejouer », qui avait le curseur, est caché
  stat1('ch1-fini');
}
/* ---------- Lot 81 : l'essai de 7 jours, dès la première réussite ----------
   Décision de l'utilisateur (21 nov. 2026, « Oui propose l'essai de 7 jours plus tôt. Dès la première réussite c'est très
   bien ») : une partie réussie (2 étoiles ou plus) aux niveaux 1 et 2, avec une table branchée, propose aussi d'essayer Pro
   7 jours. La règle du lot 68 tient : on vient de jouer avec sa table, on sait que le site marche avec elle. C'est une
   proposition à côté, pas le bouton principal (« Niveau suivant » reste le bouton orange) ; elle prend la place de « Garde ta
   progression » (créer son compte), puisque l'essai fait créer le compte. Le bouton ouvre la fenêtre Pro (l'année d'office,
   le mois à côté, l'essai expliqué). Le dernier niveau gratuit garde sa grande carte (finEssai).
   Lot 82 (« Ok garde-la », 22 nov. 2026) : le chapitre 1 entier est gratuit, mais la proposition reste aux niveaux 1 et 2
   seulement (ESSAI_TOT_NIV), pour ne pas parler de Pro à chaque niveau. */
const ESSAI_TOT_NIV = 2;
function essaiTot(ch, st){
  const ici = proBloque() && !prac && !placement && ch === 1 && li < ESSAI_TOT_NIV && st >= 2 && midiCount > 0
    && typeof proSemaineDispo === 'function' && proSemaineDispo();
  $('rEssai').hidden = !ici;
  if (!ici) return false;
  $('rCompte').hidden = true;
  $('rEssaiTxt').textContent = `Essaie tout DJingood ${PRO_ESSAI_JOURS} jours, gratuitement.`;
  stat1('essai-tot');
  return true;
}
$('rEssaiGo').addEventListener('click', () => { $('result').hidden = true; proOuvre('', { tot: true, n: 1, i: li + 1 }); });
/* ---------- Lot 82 : l'aperçu d'un chapitre fermé ----------
   Son idée préférée de la maquette (« l'idée de la démo est vraiment bien, ça peut vraiment convertir ») : avant de payer, on
   regarde la démo d'un niveau de Pro, sur la vraie table du site. On y arrive par « Voir la démo du chapitre 2 » (grande
   carte du niveau 7) ou par l'image de la démo dans la fenêtre Pro (pro.js). Pendant l'aperçu, proIci est faux (la démo peut
   tourner) ; une barre en bas garde le bouton de l'essai et « Fermer ». À la fin de la démo (ou « Arrêter », « Fermer »), on
   revient où l'on était et la fenêtre Pro de ce chapitre se rouvre ; en changeant d'onglet, on revient sans rien rouvrir.
   Rien n'est enregistré : ni étoiles (c'est une démo), ni chapitre (coach-chapitre). */
function apercuDemarre(n, i = 0, depuis = 'fenetre'){
  const L = lessonsOf(n);
  if (run || preparing || apercu || !L[i] || !niveauPro(n, i)) return;
  apercu = { n, i, depuis, ch: chapter, li };
  $('result').hidden = true; if (typeof proFerme === 'function' && !$('pro').hidden) proFerme();
  if ($('vLearn').hidden){ location.hash = '#apprendre'; setView('apprendre'); }
  LESSONS = L; chapter = n; selectLesson(i);
  const c = CHAPTERS.find(x => x.n === n), e = typeof proEssaiType === 'function' ? proEssaiType() : false;
  $('apercuTitre').textContent = `Chapitre ${n} · ${c ? c.title : ''}`;
  $('apercuGo').textContent = e === true ? 'Prendre mon mois offert' : e === 'semaine' ? `Commencer mes ${PRO_ESSAI_JOURS} jours gratuits` : 'Continuer avec Pro';
  $('apercu').hidden = false;
  stat('demo-pro', { chap: String(n), depuis });
  startRun(true);
}
// revenir = faux : on reste où le joueur est allé entre-temps (il a changé de chapitre pendant la préparation de la démo)
function apercuFin(rouvre = true, revenir = true){
  const a = apercu; if (!a) return;
  apercu = null; $('apercu').hidden = true;
  if (run) stopRun();
  if (!revenir){ selectLesson(li); return; }
  LESSONS = lessonsOf(a.ch); chapter = a.ch; selectLesson(Math.min(a.li, LESSONS.length - 1));
  // depuis la carte d'un niveau de Pro (nivFin), l'offre est déjà sur la carte : rien à rouvrir
  if (rouvre && a.depuis !== 'carte' && typeof proOuvre === 'function') proOuvre('', a.depuis === 'niveau' ? { n: a.n, i: a.i } : { chap: a.n });
}
$('apercuX').addEventListener('click', () => apercuFin(true));
$('apercuGo').addEventListener('click', () => { const n = apercu ? apercu.n : 2; apercuFin(false); if (typeof proDemarre === 'function') proDemarre({ chap: n }); });
/* ---------- Carte de résultat ----------
   Lot 29 : Vini (joie ou déception) et le titre, façon Duolingo. Lot 44 (23 oct. 2026), à la demande de l'utilisateur
   (« trop de couleurs, trop d'informations ») : plus de cartes de couleur. Une ligne (record, XP), puis « À travailler » :
   le geste le moins réussi, en une phrase. Le détail de tous les gestes et le schéma sont repliés (« Voir le détail »).
   Au chapitre 7, la note sur 100 en grand, ce que l'erreur a coûté et le conseil de Vini. */
function resultatVini(humeur){ const el = $('rVini'); if (!el.firstChild) viniMettre(el, humeur); else viniHumeur(el, humeur); }
function resultatCarte(st, items, o = {}){
  resultatVini(st >= 2 ? 'parfait' : 'rate'); $('rTitle').classList.toggle('win', st >= 2);
  $('rNote').hidden = o.note == null; if (o.note != null) compte($('rNoteVal'), o.note, v => String(v));
  const x = items.filter(i => i[0] !== 'ok').sort((a, b) => a[2] - b[2])[0], pire = o.pire || (x ? { quoi: x[1] } : null);
  $('rTravail').hidden = !pire;
  if (pire){ $('rQuoi').textContent = pire.quoi; $('rCout').textContent = pire.cout || ''; $('rCout').hidden = !pire.cout; $('rAstuceTxt').textContent = pire.astuce || ''; $('rAstuce').hidden = !pire.astuce; }
  $('rToutSum').textContent = o.resume || `Voir le détail (${items.length})`; $('rTout').hidden = false; $('rTout').open = false;
}
// Une carte sans note ni « À travailler » (mini-set, ancien test de placement) : la liste se lit dépliée
function resultatListe(){ $('rNote').hidden = true; $('rTravail').hidden = true; $('rTout').hidden = false; $('rTout').open = true; $('rToutSum').textContent = 'Le détail'; }
// Le bouton à appuyer : « Niveau suivant » quand c'est réussi, sinon « Rejouer » (il passe à droite, en orange)
function resultatBoutons(st){ const suite = !$('next').hidden && (st >= 2 || $('retry').hidden); $('next').classList.toggle('go', suite); $('retry').classList.toggle('go', !suite); }
// Un chiffre qui défile jusqu'à sa valeur (tout de suite si l'on a demandé moins d'animations)
function compte(el, fin, fmt, ms = 700){
  const t0 = performance.now(); cancelAnimationFrame(el._cpt);
  const pas = () => { const k = REDUCED ? 1 : Math.min(1, (performance.now() - t0) / ms); el.textContent = fmt(Math.round(fin * (1 - Math.pow(1 - k, 3)))); if (k < 1) el._cpt = requestAnimationFrame(pas); };
  pas();
}
/* ---------- Ralenti (chapitre 4) ----------
   Proposé seulement après deux échecs de suite sur un combo, pour garder les niveaux dynamiques. Le morceau est
   refabriqué au nouveau tempo ; la note se fait en temps, donc la précision demandée reste la même. */
function slowOffer(st){
  const b = $('slowBtn'); b.hidden = true;
  if (chapter !== 4 || prac || placement) return;
  if (speed < 1){
    if (st >= 2){ $('rTitle').textContent = `Réussi au ralenti (${Math.round(speed * 100)} %) ! Repasse à 100 % pour les 3 étoiles.`; b.dataset.speed = '1'; b.textContent = 'Rejouer à 100 %'; b.hidden = false; }
    else if (speed > .8){ b.dataset.speed = '0.8'; b.textContent = 'Réessayer à 80 %'; b.hidden = false; }
    return;
  }
  slowFails[li] = st <= 1 ? (slowFails[li] || 0) + 1 : 0;
  if (slowFails[li] >= 2){ b.dataset.speed = '0.9'; b.textContent = 'Réessayer au ralenti (90 %)'; b.hidden = false; }
}
$('slowBtn').addEventListener('click', () => { speed = +$('slowBtn').dataset.speed || 1; if (speed === 1) slowFails[li] = 0; $('result').hidden = true; startRun(); });
