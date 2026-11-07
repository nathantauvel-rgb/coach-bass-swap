// Tutos (lot 56) : les techniques des DJ, expliquées par Vini, dans un lecteur qui se regarde comme une vidéo. Vini parle, la
// musique attend ; puis on écoute, et la piste et la table dessinée bougent avec le son. Format validé par l'utilisateur sur
// la maquette du 7 nov. 2026 (captures/maquette-tutos, hors Git). Première famille : les boucles, en 4 tutos.
// Tout se compte en temps de A (124 BPM). Chaque platine suit un script (départ, IN, OUT, EXIT, ½X, fader, casque) : tuJoue
// en tire ce qu'elle joue morceau par morceau, et c'est la même chose qui sert au son, à la piste et à la table.
// Tous les fichiers de js/ partagent la même portée et sont chargés dans l'ordre indiqué dans index.html.
'use strict';
/* L'onglet reste caché tant que les tutos ne sont pas prêts (comme le chapitre 6 au lot 41). Pour les essayer : ?tutos=1
   (retenu pour l'onglet du navigateur). Les tests posent window.DJINGOOD_TUTOS. */
const TUTOS_PRET = false;
const tuEssai = (() => { try { if (/[?&]tutos=1(&|$)/.test(location.search)) sessionStorage.setItem('djingood-tutos', '1'); return sessionStorage.getItem('djingood-tutos') === '1'; } catch (e) { return false; } })();
const tutosOn = () => TUTOS_PRET || tuEssai || !!window.DJINGOOD_TUTOS;

const TU_BEAT = 60 / 124;   // les extraits de « Vraie musique » sont tous à 124 BPM
const TU_CASQUE = .26;      // une platine « au casque » : dans un tuto, on l'entend tout bas, pour suivre
const TU_CHAPITRES = ['Écoute', "Quand l'utiliser", 'Pas à pas', 'Les erreurs', 'À retenir'];
const tuTypo = s => s.replace(/ ([!?:;»])/g, ' $1').replace(/« /g, '« ');
// Les parties de chaque morceau, en temps du morceau : [début, fin, nom, 'fort' pour un drop]
const TU_PARTIES = {
  'dj-a': [[0, 96, 'A · « Dj »'], [96, 128, 'dernière phrase de A'], [128, 136, 'fin de A']],
  'animal-b': [[0, 64, 'intro de B · « Like An Animal »'], [64, 136, 'DROP', 'fort']]
};
/* ---------- Les tutos ----------
   Une platine : m (le morceau, dans musique/), debut (temps de A où elle part), pos (où elle part dans son morceau), fin (après,
   le morceau est fini : silence), evts ([temps de A, 'in' | 'out' | 'exit' | 'moitie']), niv (son fader, [temps, valeur]…),
   casque ([de, à]…). Une version = deux platines (+ alerte : où ça casse, pour une version ratée).
   Un plan : ch (chapitre), dit (ce que dit Vini), seg ([de, à, version] : le passage qu'on écoute ensuite), etape, badge
   ('rate' ou 'ok'), focus ('boucle' ou 'phrases'), note, cibles (commandes à montrer), pose (de Vini), revele (jusqu'où la
   piste est déjà dessinée au début du plan), fin (le dernier plan : « À retenir »). */
const tuA = (o = {}) => Object.assign({ m: 'dj-a', debut: 0, pos: 0, fin: 136, evts: [], niv: [[0, 1], [128, 1], [128.06, 0]], casque: [] }, o);
const tuB = (o = {}) => Object.assign({ m: 'animal-b', debut: 32, pos: 0, fin: 136, evts: [], niv: [[0, 0]], casque: [] }, o);
const tuCoupe = x => [[0, 1], [x, 1], [x + .06, 0]];   // A à fond, puis baissé d'un coup au temps x
const TU_ATTEND_B = { evts: [[64, 'in'], [96, 'out'], [128, 'exit']], niv: [[0, 0], [100, 0], [112, .8], [128, .8], [128.06, 1]], casque: [[32, 100]] };
const TU_ATTEND_FORT = { niv: [[0, 0], [80, 0], [80.06, .8], [128, .8], [128.06, 1]], casque: [[32, 80]] };   // B déjà monté : on entend bien la boucle
const TU_PROLONGE_B = { debut: 96, niv: [[0, 0], [112, 0], [124, .8], [160, .8], [160.06, 1]], casque: [[96, 112]] };
const TU_MONTEE_B = { debut: 64, niv: [[0, 0], [128, 0], [128.02, 1]], casque: [[64, 92]] };
const TU_SECOURS_B = { debut: 72, niv: [[0, 0], [100, 0], [112, .8], [136, .8], [136.06, 1]], casque: [[72, 100]] };
const TU_MONTEE_A = [[96, 'in'], [104, 'out'], [112, 'moitie'], [120, 'moitie'], [124, 'moitie'], [126, 'moitie']];
const TU_ECOUTE = "Écoute d'abord la transition en entier. Je t'explique juste après.";

const TUTOS = [
  {
    id: 'attend', famille: 'boucles', titre: 'La boucle qui attend', gratuit: true, duree: '3 min',
    resume: 'B patiente en boucle sur son intro, puis part pile quand A se termine.',
    vue: [24, 144], etat: 112,
    versions: {
      bon: { A: tuA(), B: tuB(TU_ATTEND_B) },
      fort: { A: tuA(), B: tuB(Object.assign({}, TU_ATTEND_B, TU_ATTEND_FORT)) },
      mord: { A: tuA(), B: tuB(Object.assign({}, TU_ATTEND_B, TU_ATTEND_FORT, { evts: [[66, 'in'], [98, 'out'], [128, 'exit']] })), alerte: [96, "↑ 2 temps de drop s'échappent"] },
      boite: { A: tuA(), B: tuB(Object.assign({}, TU_ATTEND_B, TU_ATTEND_FORT, { evts: [[64, 'in'], [96.25, 'out'], [128, 'exit']] })), alerte: [96.25, '↑ la boucle déborde : B prend du retard'] }
    },
    plans: [
      { ch: 0, dit: TU_ECOUTE },
      { ch: 0, dit: "Écoute… et suis le trait blanc sur la piste : c'est là où on en est.", seg: [80, 144] },
      { ch: 0, dit: "Tu as entendu ? B tournait en rond sous A, et son drop est parti pile quand A s'est arrêté. C'est ça, la boucle qui attend.", pose: { bras: 'pouce', yeux: 'clin' } },
      { ch: 1, dit: "La boucle, c'est la salle d'attente de B : il tourne en rond sur son intro, et c'est toi qui choisis quand il part.", focus: 'boucle' },
      { ch: 1, dit: "Elle te sauve quand l'intro de B est trop courte, ou quand A dure plus longtemps que prévu." },
      { ch: 1, dit: "Le secret, c'est 32 temps : une phrase entière. Quand B sort de sa boucle, il retombe pile sur une phrase de A.", focus: 'phrases', note: '1 phrase = 32 temps = 8 mesures de 4 temps' },
      { ch: 2, dit: "Lance B au casque, pile sur le premier temps d'une phrase de A.", seg: [24, 40], revele: 32, cibles: ['playB', 'casqueB'] },
      { ch: 2, dit: 'Compte 32 temps. Au début de la phrase suivante, appuie sur IN.', seg: [56, 68], revele: 56, cibles: ['inB'] },
      { ch: 2, dit: 'Encore 32 temps. Juste avant le drop de B, appuie sur OUT : B repart en arrière, il tourne en boucle.', seg: [88, 104], revele: 88, cibles: ['outB'] },
      { ch: 2, dit: 'Pendant que B tourne, monte doucement son fader. Il attend sous A, sans ses basses.', seg: [98, 116], revele: 98, cibles: ['faderB'] },
      { ch: 2, dit: "A finit sa dernière phrase. Sur le 1, appuie sur EXIT et baisse A d'un coup : le drop de B tombe pile.", seg: [120, 140], revele: 120, cibles: ['exitB', 'faderA'] },
      { ch: 3, etape: 'Erreur n° 1', dit: 'Tu appuies sur IN 2 temps trop tard : ta boucle mord sur le drop. Écoute bien la fin du tour.', seg: [88, 104, 'mord'], badge: 'rate', pose: { sueur: true } },
      { ch: 3, etape: 'Erreur n° 1', dit: 'Le drop a démarré, puis il est reparti en arrière. Maintenant, la bonne :', seg: [88, 104, 'fort'], badge: 'ok' },
      { ch: 3, etape: 'Erreur n° 2', dit: 'Sans Quantize, tu appuies sur OUT un poil trop tard : ta boucle fait 32 temps et quart. Écoute après le tour.', seg: [92, 112, 'boite'], badge: 'rate', pose: { sueur: true } },
      { ch: 3, etape: 'Erreur n° 2', dit: 'Les grosses caisses ne tombent plus ensemble : ça galope. Allume Quantize : IN et OUT se posent tout seuls sur le temps. La bonne :', seg: [92, 112, 'fort'], badge: 'ok' },
      { ch: 4, dit: 'Bravo, tu connais la boucle qui attend ! Garde ces trois lignes en tête.', fin: true }
    ],
    retenir: ["**32 temps**, c'est une phrase : ta boucle fait 32 temps, pas un de plus.", "**IN** au début d'une phrase de B, **OUT** juste avant son drop. Avec Quantize allumé.", '**EXIT** sur le 1 quand A se termine : le drop de B tombe pile.']
  },
  {
    id: 'prolonge', famille: 'boucles', titre: "La boucle qui prolonge l'outro", duree: '3 min',
    resume: "A finit avant le drop de B ? Tu boucles la fin de A, le temps que B arrive.",
    vue: [88, 168], etat: 140,
    versions: {
      bon: { A: tuA({ fin: 128, evts: [[112, 'in'], [128, 'out']], niv: tuCoupe(160) }), B: tuB(TU_PROLONGE_B) },
      sans: { A: tuA({ fin: 128, niv: tuCoupe(160) }), B: tuB(TU_PROLONGE_B), alerte: [128, "↑ A est fini : il ne reste que l'intro de B"] },
      tot: { A: tuA({ fin: 128, evts: [[112, 'in'], [128, 'out'], [136, 'exit']], niv: tuCoupe(160) }), B: tuB(TU_PROLONGE_B), alerte: [144, "↑ le trou : A s'est arrêté trop tôt"] }
    },
    plans: [
      { ch: 0, dit: TU_ECOUTE },
      { ch: 0, dit: 'Écoute… et suis le trait blanc sur la piste.', seg: [108, 168] },
      { ch: 0, dit: 'Tu as entendu ? A est arrivé au bout, mais il a continué à tourner sur ses 16 derniers temps, le temps que B arrive à son drop.', pose: { bras: 'pouce', yeux: 'clin' } },
      { ch: 1, dit: "Le problème : l'intro de B est longue, et A se termine avant son drop. Écoute ce qui se passe sans boucle :", seg: [120, 160, 'sans'], badge: 'rate' },
      { ch: 1, dit: "Tout retombe : pendant 32 temps, il ne reste que l'intro de B, toute maigre. La boucle qui prolonge l'outro bouche ce trou.", focus: 'boucle' },
      { ch: 2, dit: "Lance B au casque sur une phrase de A, puis monte son fader pendant la fin de A.", seg: [94, 124], revele: 94, cibles: ['playB', 'faderB'] },
      { ch: 2, dit: '16 temps avant la fin de A, appuie sur IN.', seg: [104, 116], revele: 104, cibles: ['inA'] },
      { ch: 2, dit: "Sur la fin de A, appuie sur OUT : A repart 16 temps en arrière, et tourne en boucle sous l'intro de B.", seg: [120, 140], revele: 120, cibles: ['outA'] },
      { ch: 2, dit: "Pas besoin d'EXIT : quand le drop de B arrive, baisse A d'un coup.", seg: [148, 168], revele: 148, cibles: ['faderA'] },
      { ch: 3, etape: "L'erreur", dit: "Tu appuies sur EXIT trop tôt : A repart vers sa fin… et s'arrête avant le drop de B.", seg: [128, 164, 'tot'], badge: 'rate', pose: { sueur: true } },
      { ch: 3, etape: "L'erreur", dit: "Tu as entendu le trou ? Garde la boucle jusqu'au drop de B. La bonne :", seg: [128, 164], badge: 'ok' },
      { ch: 4, dit: 'Bravo ! Avec cette boucle, plus de trou entre deux morceaux.', fin: true }
    ],
    retenir: ['Si A finit avant le drop de B, **boucle la fin de A**.', "**IN** 16 temps avant la fin, **OUT** sur la fin : A tourne sous l'intro de B.", "Pas d'EXIT : au drop de B, **baisse A** d'un coup."]
  },
  {
    id: 'montee', famille: 'boucles', titre: 'La montée en boucle', duree: '3 min',
    resume: 'Une boucle qui raccourcit (8, 4, 2, 1 temps) fait monter la tension avant le drop.',
    vue: [72, 144], etat: 118,
    versions: {
      bon: { A: tuA({ evts: TU_MONTEE_A, niv: tuCoupe(128) }), B: tuB(TU_MONTEE_B) },
      vite: { A: tuA({ evts: [[96, 'in'], [104, 'out'], [106, 'moitie'], [108, 'moitie'], [109, 'moitie'], [110, 'moitie']], niv: tuCoupe(128) }), B: tuB(TU_MONTEE_B), alerte: [110, '↑ trop vite : la boucle bégaie 18 temps'] }
    },
    plans: [
      { ch: 0, dit: "Écoute d'abord la montée en entier. Je t'explique juste après." },
      { ch: 0, dit: 'Écoute… la boucle de A raccourcit, raccourcit… et boum.', seg: [84, 144] },
      { ch: 0, dit: 'Tu as senti la tension monter ? La boucle de A est passée de 8 temps à 4, puis 2, puis 1, puis un demi… et le drop de B a tout libéré.', pose: { bras: 'haut', bouche: 'ouverte' } },
      { ch: 1, dit: "La montée, c'est pour le moment fort de ton set : juste avant un gros drop, comme un roulement de tambour." },
      { ch: 1, dit: "Le secret : chaque ½X tombe à la fin d'un tour, deux tours à chaque fois. Le tout dure une phrase, et le drop tombe pile sur la suivante.", focus: 'phrases', note: '8 + 8 + 4 + 4 + 2 + 2 + 1 + 1 + 4 × ½ = 32 temps' },
      { ch: 2, dit: 'Au début de la dernière phrase de A, pose une boucle de 8 temps : IN, puis OUT 8 temps plus tard.', seg: [90, 110], revele: 90, cibles: ['inA', 'outA'] },
      { ch: 2, dit: 'Après deux tours, appuie sur ½X : la boucle passe à 4 temps.', seg: [106, 120], revele: 106, cibles: ['moitieA'] },
      { ch: 2, dit: 'Continue : ½X tous les deux tours. 2 temps, puis 1, puis un demi.', seg: [116, 128], revele: 116, cibles: ['moitieA'] },
      { ch: 2, dit: "Sur le 1 de la phrase suivante, baisse A et monte B d'un coup : le drop explose.", seg: [122, 140], revele: 122, cibles: ['faderA', 'faderB'] },
      { ch: 3, etape: "L'erreur", dit: 'Tu raccourcis trop vite : ta boucle arrive à un demi-temps bien avant le drop. Écoute :', seg: [96, 136, 'vite'], badge: 'rate', pose: { sueur: true } },
      { ch: 3, etape: "L'erreur", dit: 'Ça bégaie pendant 8 secondes, et la tension retombe. Deux tours à chaque fois, pas plus vite. La bonne :', seg: [96, 136], badge: 'ok' },
      { ch: 4, dit: "Bravo ! La montée, c'est ton arme pour les gros drops.", fin: true }
    ],
    retenir: ['Une boucle de **8 temps** au début de la dernière phrase de A.', '**½X tous les deux tours** : 8, 4, 2, 1, un demi.', 'Le drop de B **pile sur le 1** de la phrase suivante.']
  },
  {
    id: 'secours', famille: 'boucles', titre: 'La boucle de secours', duree: '3 min',
    resume: 'B est parti en retard ? Une boucle de 4 temps sur A rattrape tout.',
    vue: [56, 152], etat: 116,
    versions: {
      bon: { A: tuA({ fin: 128, evts: [[124, 'in'], [128, 'out']], niv: tuCoupe(136) }), B: tuB(TU_SECOURS_B) },
      sans: { A: tuA({ fin: 128, niv: tuCoupe(136) }), B: tuB(TU_SECOURS_B), alerte: [128, '↑ le trou : 8 temps sans A avant le drop'] },
      deborde: { A: tuA({ fin: 128, evts: [[126, 'in'], [130, 'out']], niv: tuCoupe(136) }), B: tuB(TU_SECOURS_B), alerte: [130, '↑ la boucle déborde après la fin de A : un trou à chaque tour'] }
    },
    plans: [
      { ch: 0, dit: TU_ECOUTE },
      { ch: 0, dit: 'Écoute… et suis le trait blanc sur la piste.', seg: [100, 152] },
      { ch: 0, dit: "B était parti en retard, mais tu n'as rien entendu : A a répété sa dernière mesure, le temps que le drop de B arrive.", pose: { bras: 'pouce', yeux: 'clin' } },
      { ch: 1, dit: 'Tu as lancé B 8 temps trop tard ? Ça arrive à tout le monde. Son drop tombera 8 temps après la fin de A. Écoute :', seg: [112, 148, 'sans'], badge: 'rate' },
      { ch: 1, dit: "Tu entends le trou ? La boucle de secours gagne ces 8 temps, et personne ne s'en rend compte.", focus: 'boucle' },
      { ch: 2, dit: "Oups : B part 8 temps après le début d'une phrase de A. Son drop arrivera en retard.", seg: [60, 80], revele: 60, cibles: ['playB'] },
      { ch: 2, dit: 'Sur la dernière mesure de A, 4 temps avant la fin, appuie sur IN.', seg: [116, 127], revele: 116, cibles: ['inA'] },
      { ch: 2, dit: 'Sur la fin de A, appuie sur OUT : A répète sa dernière mesure. Deux tours, et tu as gagné 8 temps.', seg: [122, 138], revele: 122, cibles: ['outA'] },
      { ch: 2, dit: "Au drop de B, baisse A d'un coup. Sauvé !", seg: [128, 148], revele: 128, cibles: ['faderA'] },
      { ch: 3, etape: "L'erreur", dit: 'Tu appuies sur IN 2 temps trop tard : ta boucle déborde après la fin de A. Écoute :', seg: [116, 144, 'deborde'], badge: 'rate', pose: { sueur: true } },
      { ch: 3, etape: "L'erreur", dit: 'Un trou à chaque tour ! Ta boucle doit finir pile sur la fin de A. La bonne :', seg: [116, 144], badge: 'ok' },
      { ch: 4, dit: 'Bravo ! Un B parti en retard ne te fait plus peur.', fin: true }
    ],
    retenir: ['B parti en retard ? **Boucle la fin de A** pour gagner du temps.', 'Une boucle de **4 temps** qui tourne deux fois : **8 temps** de gagnés.', 'Ta boucle finit **pile sur la fin de A**, et au drop de B tu baisses A.']
  }
];
const TU_FAMILLES = [{ id: 'boucles', titre: 'Les boucles', resume: 'IN, OUT, EXIT et ½X : faire attendre un morceau, en prolonger un autre, faire monter la tension, rattraper un retard.' }];
TUTOS.forEach(t => t.plans.forEach(p => { p.dit = tuTypo(p.dit); }));

/* ---------- Ce que joue une platine ----------
   Rejoue le script d'une platine jusqu'au temps xb : les morceaux de son entre xa et xb (x0, x1 en temps de A, b0 : où on en
   est dans le morceau, rep : la boucle est repartie, boucle : on est dans une boucle), et l'état au temps xb. */
function tuJoue(s, xa, xb){
  const ev = s.evts.slice().sort((p, q) => p[0] - q[0]), res = [], fin = s.fin;
  let x = s.debut, b = s.pos, boucle = null, attente = null, rep = false;
  const pousse = (x0, x1, b0) => {
    if (b0 >= fin - 1e-9) return;
    if (b0 + (x1 - x0) > fin) x1 = x0 + (fin - b0);
    const a = Math.max(x0, xa), z = Math.min(x1, xb);
    if (z - a > 1e-6) res.push({ x0: a, x1: z, b0: b0 + (a - x0), rep, boucle: !!boucle || attente !== null });
  };
  const avance = xe => {
    for (let garde = 0; x < xe - 1e-9 && garde < 4000; garde++){
      if (boucle){
        const reste = boucle.bIn + boucle.L - b;
        // pile à la fin d'un tour : la boucle repart (sauf si EXIT tombe exactement là, d'où le retour au début seulement ici)
        if (reste <= 1e-9){ b = boucle.bIn; rep = true; continue; }
        const x1 = Math.min(xe, x + reste); pousse(x, x1, b); b += x1 - x; x = x1;
      } else { pousse(x, xe, b); b += xe - x; x = xe; }
    }
  };
  if (xb < s.debut) return { pieces: res, joue: false, b, boucle: false, attente: false };
  for (const [xe, type] of ev){
    if (xe > xb) break;
    if (xe < s.debut) continue;
    avance(xe);
    if (type === 'in') attente = b;
    else if (type === 'out' && attente !== null){ boucle = { bIn: attente, L: Math.max(.25, b - attente) }; attente = null; b = boucle.bIn; rep = true; }
    else if (type === 'moitie' && boucle){ boucle.L = Math.max(.125, boucle.L / 2); if (b >= boucle.bIn + boucle.L - 1e-9){ b = boucle.bIn + ((b - boucle.bIn) % boucle.L); rep = true; } }
    else if (type === 'exit'){ boucle = null; attente = null; rep = false; }
  }
  avance(xb);
  return { pieces: res, joue: b < fin - 1e-9, b, boucle: !!boucle, attente: attente !== null };
}
function tuInterp(pts, x){
  if (x <= pts[0][0]) return pts[0][1];
  for (let k = 1; k < pts.length; k++){
    const [x0, v0] = pts[k - 1], [x1, v1] = pts[k];
    if (x <= x1) return v0 + (v1 - v0) * (x - x0) / (x1 - x0);
  }
  return pts[pts.length - 1][1];
}
const tuAuCasque = (s, x) => s.casque.some(([a, z]) => x >= a && x < z);
const tuNiv = (s, x) => Math.max(tuInterp(s.niv, x), tuAuCasque(s, x) ? TU_CASQUE : 0);
// Ce qu'on entend d'une platine : dans la salle (fader monté), au casque, ou rien
const tuEcoute = (s, x) => tuInterp(s.niv, x) > .05 ? 'salle' : tuAuCasque(s, x) ? 'casque' : '';

/* ---------- L'état du lecteur ---------- */
const tu = {
  t: null, X0: 0, X1: 1, i: 0, phase: 'ferme', pause: false, horloge: 0, dernier: 0, h0: 0, hFin: 0, xPrec: -1, revele: 0, rk: -1,
  texte: { spans: [], temps: [], vus: 0, total: 0 }, vues: new Set(), angle: { A: 0, B: 0 },
  bufs: {}, charge: {}, gA: null, gB: null, srcs: [], son: null, raf: 0
};
// coach-tutos : { vus: [tutos vus jusqu'au bout], vol: volume du lecteur, de 0 à 1 }
const TU_CLE = 'coach-tutos';
const tuLu = (() => { try { const d = JSON.parse(localStorage.getItem(TU_CLE)); return d && typeof d === 'object' ? d : {}; } catch (e) { return {}; } })();
let tuVus = Array.isArray(tuLu.vus) ? tuLu.vus.filter(id => TUTOS.some(t => t.id === id)) : [];
let tuVol = typeof tuLu.vol === 'number' && tuLu.vol >= 0 && tuLu.vol <= 1 ? tuLu.vol : .7;
const tuGarde = () => { try { localStorage.setItem(TU_CLE, JSON.stringify({ vus: tuVus, vol: tuVol })); } catch (e) {} };
function tuMarqueVu(id){
  if (tuVus.includes(id)) return;
  tuVus.push(id); tuGarde();
}

/* ---------- Le son ---------- */
function tuCharge(m){
  if (!tu.charge[m]) tu.charge[m] = fetch('musique/' + m + '.mp3')
    .then(r => { if (!r.ok) throw quiet('musique ' + r.status); return r.arrayBuffer(); })
    .then(vraiDecode).then(buf => (tu.bufs[m] = buf))
    .catch(e => { delete tu.charge[m]; throw e; });
  return tu.charge[m];
}
function tuSonStop(){
  tu.srcs.forEach(s => { try { s.stop(); } catch (e) {} });
  tu.srcs = []; tu.son = null;
  if (ac && tu.gA) [tu.gA, tu.gB].forEach(g => { g.gain.cancelScheduledValues(0); g.gain.setValueAtTime(0, ac.currentTime); });
}
function tuSonJoue([de, a, vNom = 'bon']){
  tuSonStop(); ensureAudio();
  if (!tu.gA){
    // les deux platines → le volume du lecteur (et le haut-parleur de l'en-tête) → la sortie du site
    tu.sortie = ac.createGain(); tu.sortie.connect(master); tuVolumeApplique();
    tu.gA = ac.createGain(); tu.gB = ac.createGain(); tu.gA.gain.value = 0; tu.gB.gain.value = 0; tu.gA.connect(tu.sortie); tu.gB.connect(tu.sortie);
  }
  const v = tu.t.versions[vNom], t0 = ac.currentTime + .1, T = x => t0 + (x - de) * TU_BEAT;
  tu.son = { de, a, v: vNom, t0, tFin: t0 + (a - de) * TU_BEAT };
  for (const k of ['A', 'B']){
    const s = v[k], g = k === 'A' ? tu.gA : tu.gB, buf = tu.bufs[s.m];
    // chaque saut de la boucle est un nouveau départ, au temps près, avec un fondu de 3 ms pour ne pas claquer
    for (const p of tuJoue(s, de, a).pieces){
      const src = ac.createBufferSource(), e = ac.createGain(), t = T(p.x0), d = (p.x1 - p.x0) * TU_BEAT;
      src.buffer = buf; src.connect(e); e.connect(g);
      e.gain.setValueAtTime(0, t); e.gain.linearRampToValueAtTime(1, t + .003);
      e.gain.setValueAtTime(1, Math.max(t + .003, t + d - .003)); e.gain.linearRampToValueAtTime(0, t + d);
      src.start(t, p.b0 * TU_BEAT, d); tu.srcs.push(src);
    }
    // le fader et le casque, point par point (un seizième de temps)
    g.gain.cancelScheduledValues(0); g.gain.setValueAtTime(tuNiv(s, de), t0);
    for (let x = de + 1 / 16; x <= a + 1e-9; x += 1 / 16) g.gain.linearRampToValueAtTime(tuNiv(s, x), T(x));
  }
}
// Le temps de A qu'on entend en ce moment
function tuX(){
  if (!tu.son) return null;
  return Math.max(tu.son.de, tu.son.de + (ac.currentTime - (ac.outputLatency || ac.baseLatency || 0) - tu.son.t0) / TU_BEAT);
}

/* ---------- La piste ---------- */
const tuPc = x => ((x - tu.X0) / (tu.X1 - tu.X0) * 100).toFixed(3) + '%';
const tuLarg = (a, z) => ((z - a) / (tu.X1 - tu.X0) * 100).toFixed(3) + '%';
const tuBloc = (cls, a, z, txt) => `<div class="tu-blk ${cls}" style="left:${tuPc(a)};width:${tuLarg(a, z)}">${z - a >= 9 || (txt.length <= 5 && z - a >= 5) ? txt : ''}</div>`;   // « DROP » tient dans 5 temps
function tuLignes(){
  const { X0, X1 } = tu;
  let h = '';
  for (let x = Math.ceil(X0 / 4) * 4; x <= X1; x += 4) h += `<i class="${x % 32 ? 'tu-ms' : 'tu-ph'}" style="left:${tuPc(x)}"></i>`;
  for (let x = Math.ceil(X0 / 32) * 32; x + 32 <= X1; x += 32) h += `<span class="tu-rg" style="left:${tuPc(x)};width:${tuLarg(x, x + 32)}">32 temps</span>`;
  $('tuLignes').innerHTML = h;
}
// Une voie de la piste : ce qu'on entend de la platine, coupé aux parties du morceau, aux boucles et au fader
function tuVoie(k, s, revele){
  const parts = TU_PARTIES[s.m], fin = Math.min(revele, tu.X1);
  let h = '';
  for (const p of tuJoue(s, tu.X0, fin).pieces){
    const cuts = new Set([p.x0, p.x1]);
    for (const [b0, b1] of parts) for (const bb of [b0, b1]){ const xx = p.x0 + bb - p.b0; if (xx > p.x0 + 1e-6 && xx < p.x1 - 1e-6) cuts.add(xx); }
    let prec = tuEcoute(s, p.x0);
    for (let xx = Math.ceil(p.x0 * 4) / 4; xx < p.x1; xx += .25){ const e = tuEcoute(s, xx); if (e !== prec){ cuts.add(xx); prec = e; } }
    const c = [...cuts].sort((u, w) => u - w);
    for (let n = 0; n < c.length - 1; n++){
      const a = c[n], z = c[n + 1], m = (a + z) / 2, ecoute = tuEcoute(s, m);
      if (!ecoute) continue;
      const bm = p.b0 + (m - p.x0), part = parts.find(([b0, b1]) => bm >= b0 && bm < b1) || parts[parts.length - 1];
      const txt = p.boucle ? (p.rep ? '↺ la boucle repart' : 'boucle') : ecoute === 'casque' ? k + ' au casque' : part[2];
      h += tuBloc(`tu-${k.toLowerCase()}${part[3] ? ' fort' : ''}${p.boucle ? ' boucle' : ''}${ecoute === 'casque' ? ' casque' : ''}`, a, z, txt);
    }
  }
  return h;
}
const TU_MARQUE = { in: 'IN', out: 'OUT', exit: 'EXIT', moitie: '½X' };
function tuMarques(v, revele, pop){
  let h = '';
  for (const k of ['A', 'B']){
    const s = v[k], liste = s.evts.map(([x, t]) => [x, TU_MARQUE[t]]);
    if (s.debut > tu.X0) liste.push([s.debut, 'PLAY']);
    liste.sort((p, q) => p[0] - q[0]);
    let der = -1e9, haut = false;
    for (const [x, t] of liste){
      if (x < tu.X0 || x > tu.X1 || x > revele + 1e-6) continue;
      haut = x - der < 3.5 ? !haut : false; der = x;   // deux repères trop proches : le second monte d'un cran
      const cle = k + t + x, neuf = !tu.vues.has(cle); tu.vues.add(cle);
      h += `<span class="tu-mk tu-mk-${k.toLowerCase()}${haut ? ' haut' : ''}${neuf && pop ? ' pop' : ''}" style="left:${tuPc(x)}">${t}</span>`;
    }
  }
  if (v.alerte && revele >= v.alerte[0]){
    const droite = (v.alerte[0] - tu.X0) / (tu.X1 - tu.X0) > .55;
    h += `<span class="tu-alerte${droite ? ' droite' : ''}" style="left:${tuPc(v.alerte[0])}">${tuTypo(v.alerte[1])}</span>`;
  }
  return h;
}
function tuPiste(vNom, revele, pop = false){
  const v = tu.t.versions[vNom];
  $('tuVoieA').innerHTML = tuVoie('A', v.A, revele);
  $('tuVoieB').innerHTML = tuVoie('B', v.B, revele);
  $('tuMarques').innerHTML = tuMarques(v, revele, pop);
}

/* ---------- La table dessinée ---------- */
const tuCtl = c => $('tuTable').querySelector(`[data-c="${c}"]`);
const tuCl = (c, cls, on) => { const e = tuCtl(c); if (e) e.classList.toggle(cls, !!on); };
function tuFlash(c){ const e = tuCtl(c); if (!e) return; e.classList.remove('flash'); void e.getBoundingClientRect(); e.classList.add('flash'); }
function tuTableSvg(){
  const bouton = (c, x, y, w, txt) => `<g class="tu-c" data-c="${c}"><rect class="tu-cible" x="${x - 5}" y="${y - 5}" width="${w + 10}" height="34" rx="10"/><rect class="tu-forme" x="${x}" y="${y}" width="${w}" height="24" rx="6"/><text class="tu-lab" x="${x + w / 2}" y="${y + 13}">${txt}</text></g>`;
  const rond = (c, x, y, txt) => `<g class="tu-c" data-c="${c}"><circle class="tu-cible" cx="${x}" cy="${y}" r="25"/><circle class="tu-forme" cx="${x}" cy="${y}" r="19"/><text class="tu-lab" x="${x}" y="${y + 1}">${txt}</text></g>`;
  const fader = (c, x) => `<g class="tu-c" data-c="${c}"><rect class="tu-cible" x="${x - 26}" y="124" width="52" height="108" rx="12"/><rect class="tu-rail" x="${x - 3}" y="134" width="6" height="90" rx="3"/><g class="tu-cap"><rect x="${x - 17}" y="-7" width="34" height="14" rx="3"/><line x1="${x - 12}" y1="0" x2="${x + 12}" y2="0"/></g></g>`;
  const casque = (c, x) => `<g class="tu-c" data-c="${c}"><rect class="tu-cible" x="${x - 25}" y="91" width="50" height="30" rx="10"/><rect class="tu-forme" x="${x - 20}" y="96" width="40" height="20" rx="6"/><path class="tu-casque" d="M${x - 6} 110 v-2 a6 6 0 0 1 12 0 v2 M${x - 7} 108 v4 M${x + 7} 108 v4"/></g>`;
  const platine = (k, ox) => {
    let sillons = '';
    for (let r = 34; r <= 54; r += 7) sillons += `<circle class="tu-sillon" cx="172" cy="138" r="${r}"/>`;
    return `<g transform="translate(${ox} 0)"><text class="tu-lettre tu-l${k.toLowerCase()}" x="26" y="44">${k}</text><text class="tu-pet" x="186" y="20">LOOP</text>
  ${bouton('in' + k, 92, 28, 44, 'IN')}${bouton('out' + k, 140, 28, 44, 'OUT')}${bouton('exit' + k, 188, 28, 44, 'EXIT')}${bouton('moitie' + k, 236, 28, 44, '½X')}
  <g class="tu-c" data-c="jog${k}"><circle class="tu-jog" cx="172" cy="138" r="68"/><circle class="tu-anneau" cx="172" cy="138" r="62"/>${sillons}<circle class="tu-centre" cx="172" cy="138" r="22"/><g class="tu-rep"><line x1="172" y1="84" x2="172" y2="100"/></g></g>
  <g class="tu-c tu-eteint"><text class="tu-pet" x="306" y="62">TEMPO</text><rect class="tu-rail" x="303" y="72" width="6" height="124" rx="3"/><rect class="tu-capt" x="293" y="128" width="26" height="12" rx="3"/></g>
  ${rond('cue' + k, 50, 214, 'CUE')}${rond('play' + k, 102, 214, '▶❙❙')}</g>`;
  };
  return `<svg viewBox="0 0 960 250" role="img" aria-label="La table DJ : platine A, table de mixage, platine B">
<rect class="tu-corps-t" x="3" y="3" width="954" height="244" rx="26"/>${platine('A', 14)}
<rect class="tu-zone" x="356" y="14" width="248" height="222" rx="16"/>
<text class="tu-lettre tu-la" x="433" y="40" text-anchor="middle">A</text><text class="tu-lettre tu-lb" x="527" y="40" text-anchor="middle">B</text>
<g class="tu-c tu-eteint"><circle class="tu-forme" cx="433" cy="66" r="13"/><text class="tu-pet" x="480" y="70">LOW</text><circle class="tu-forme" cx="527" cy="66" r="13"/></g>
${casque('casqueA', 433)}${casque('casqueB', 527)}${fader('faderA', 433)}${fader('faderB', 527)}${platine('B', 606)}</svg>`;
}
// Les commandes dont ce tuto se sert ; les autres sont éteintes
function tuCommandes(t){
  const c = new Set(['playA', 'playB', 'jogA', 'jogB', 'faderA', 'faderB']);
  for (const v of Object.values(t.versions)) for (const k of ['A', 'B']){
    for (const [, type] of v[k].evts) c.add(type + k);
    if (v[k].casque.length) c.add('casque' + k);
  }
  t.plans.forEach(p => (p.cibles || []).forEach(x => c.add(x)));
  return c;
}
function tuMajTable(x, vNom, live){
  const v = tu.t.versions[vNom];
  for (const k of ['A', 'B']){
    const s = v[k], e = tuJoue(s, x, x), joue = x >= s.debut && e.joue, l = k.toLowerCase();
    tuCl('play' + k, 'on-' + l, joue); tuCl('jog' + k, 'on-' + l, joue);
    tuCl('in' + k, 'on-' + l, e.boucle || e.attente);
    tuCl('out' + k, 'on-' + l, e.boucle); tuCl('out' + k, 'clign', e.boucle && live);
    tuCl('moitie' + k, 'on-' + l, false);
    tuCl('casque' + k, 'on-' + l, tuAuCasque(s, x));
    const cap = tuCtl('fader' + k).querySelector('.tu-cap');
    cap.setAttribute('transform', `translate(0 ${(224 - tuInterp(s.niv, x) * 90).toFixed(1)})`);
    if (joue) tu.angle[k] = e.b * TU_BEAT * 200;   // un disque à 33 tours ⅓ : 200 degrés par seconde
    tuCtl('jog' + k).querySelector('.tu-rep').setAttribute('transform', `rotate(${(tu.angle[k] % 360).toFixed(1)} 172 138)`);
  }
}

/* ---------- Vini parle : le texte s'écrit lettre par lettre, la musique attend ---------- */
function tuPrepare(t){
  const el = $('tuBulle'), sr = document.createElement('span'), vu = document.createElement('span'), tx = tu.texte;
  el.textContent = ''; sr.className = 'tu-sr'; sr.textContent = t; vu.setAttribute('aria-hidden', 'true');
  tx.spans = []; tx.temps = []; tx.vus = 0;
  let ms = 0;
  for (const ch of t){
    const s = document.createElement('span'); s.className = 'tu-c0'; s.textContent = ch; vu.appendChild(s);
    tx.spans.push(s); tx.temps.push(ms);
    ms += 26; if ('.!?…'.includes(ch)) ms += 180; else if (',:'.includes(ch)) ms += 80;
  }
  tx.total = ms; el.append(sr, vu);
}
function tuMontre(n){ const tx = tu.texte; while (tx.vus < Math.min(n, tx.spans.length)) tx.spans[tx.vus++].classList.add('v'); }
const tuReduit = () => !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
const tuLecture = p => 900 + 30 * p.dit.length;   // le temps de lire, une fois le texte écrit
const tuAvantSon = p => 500 + 8 * p.dit.length;
function tuViniPose(p, ecoute){
  const el = $('tuVini');
  if (ecoute){
    el.style.setProperty('--vini-beat', TU_BEAT.toFixed(4) + 's');
    el.style.setProperty('--vini-delay', (-((tuX() || 0) % 1) * TU_BEAT).toFixed(3) + 's');
    viniPose(el, { bras: 'oreille', fx: 'notes', sueur: !!(p.pose && p.pose.sueur) });
    viniHumeur(el, 'calme'); void el.offsetWidth; viniHumeur(el, 'danse');
  } else {
    viniPose(el, p.fin ? { bras: 'haut', bouche: 'ouverte', fx: 'etoiles' } : p.pose || {});
    viniHumeur(el, p.fin ? 'parfait' : 'calme');
  }
}

/* ---------- La lecture ---------- */
const tuVersion = p => p.seg ? p.seg[2] || 'bon' : 'bon';
function tuAller(i, o = {}){
  tuSonStop();
  const t = tu.t; tu.i = Math.max(0, Math.min(t.plans.length - 1, i));
  const p = t.plans[tu.i], fin = !!p.fin;
  Object.assign(tu, { phase: 'texte', h0: tu.horloge, hFin: 0, xPrec: -1, rk: -1, revele: p.revele !== undefined ? p.revele : tu.X1 });
  $('tuPiste').hidden = fin; $('tuTable').hidden = fin; $('tuCompteur').hidden = fin; $('tuRetenir').hidden = !fin;
  $('tuPlan').classList.toggle('f-boucle', p.focus === 'boucle'); $('tuPlan').classList.toggle('f-phrases', p.focus === 'phrases');
  const etapes = t.plans.filter(q => q.ch === 2), n = etapes.indexOf(p);
  $('tuEtape').textContent = p.etape || (n >= 0 ? `Étape ${n + 1} sur ${etapes.length}` : '');
  const b = $('tuBadge2'); b.hidden = !p.badge; b.className = 'tu-badge ' + (p.badge || ''); b.textContent = p.badge === 'rate' ? 'Version ratée' : 'Version réussie';
  ['tuEcoute', 'tuMesure', 'tuTemps'].forEach(id => { $(id).hidden = true; });
  $('tuNote').textContent = p.note ? tuTypo(p.note) : '';
  $('tuCurseur').hidden = true;
  tu.vues = new Set();
  tuPiste(tuVersion(p), tu.revele);   // ce qui est déjà là au début du plan ne saute pas
  $('tuTable').querySelectorAll('.tu-c.cible').forEach(e => e.classList.remove('cible'));
  (p.cibles || []).forEach(c => tuCl(c, 'cible', true));
  tuMajTable(p.seg ? p.seg[0] : t.etat, tuVersion(p), false);
  tuViniPose(p, false); viniParle($('tuVini'), true);
  tuPrepare(p.dit);
  if (o.direct){ tuMontre(Infinity); tuFinTexte(); tu.hFin = tu.horloge - 1e6; }
  if (fin){ tuMarqueVu(t.id); stat('tuto-fini', { tuto: t.id }); tuFinBoutons(); }
  tuChapitres();
}
function tuFinTexte(){
  if (tu.phase !== 'texte' || tu.hFin) return;
  tu.hFin = tu.horloge;
  viniParle($('tuVini'), false);
}
function tuDemarreSon(){
  const p = tu.t.plans[tu.i];
  tu.phase = 'son';
  ['tuEcoute', 'tuMesure', 'tuTemps'].forEach(id => { $(id).hidden = false; });
  $('tuNote').textContent = '';
  tuSonJoue(p.seg);
  tuViniPose(p, true);
  if (tu.pause) ac.suspend();
}
function tuFinSon(){
  tu.phase = 'apres'; tu.hFin = tu.horloge;
  tuSonStop();
  tuViniPose(tu.t.plans[tu.i], false);
}
function tuSuivant(){ if (tu.i < tu.t.plans.length - 1) tuAller(tu.i + 1); else tu.phase = 'fin'; }
function tuImage(now){
  tu.raf = 0;
  if (tu.phase === 'ferme') return;
  const dt = Math.min(250, now - tu.dernier); tu.dernier = now;
  if (!tu.pause && tu.phase !== 'charge') tu.horloge += dt;
  const p = tu.t.plans[tu.i];
  if (tu.phase === 'texte'){
    const el = tu.horloge - tu.h0, tx = tu.texte;
    let n = tx.vus; while (n < tx.temps.length && tx.temps[n] <= el) n++;
    tuMontre(tuReduit() ? Infinity : n);
    if (tx.vus >= tx.spans.length) tuFinTexte();
    if (tu.hFin && tu.horloge - tu.hFin >= (p.seg ? tuAvantSon(p) : tuLecture(p))){
      if (p.seg) tuDemarreSon(); else if (!p.fin) tuSuivant(); else tu.phase = 'fin';
    }
  } else if (tu.phase === 'son' && tu.son){
    const x = tuX(), vNom = tu.son.v, v = tu.t.versions[vNom];
    tuMajTable(x, vNom, true);
    // ce que le DJ fait au moment où on l'entend : la commande s'allume d'un coup
    for (const k of ['A', 'B']){
      const s = v[k], evs = s.evts.map(([ex, type]) => [ex, type + k]);
      if (s.debut > tu.son.de) evs.push([s.debut, 'play' + k]);
      for (const [ex, c] of evs) if (tu.xPrec < ex && x >= ex) tuFlash(c);
      const f0 = tuInterp(s.niv, Math.max(tu.son.de, tu.xPrec)), f1 = tuInterp(s.niv, x);
      if (tu.xPrec >= 0 && Math.abs(f1 - f0) > .5) tuFlash('fader' + k);
    }
    tu.xPrec = x;
    if (x > tu.revele){ tu.revele = x; const k = Math.floor(x * 2); if (k !== tu.rk){ tu.rk = k; tuPiste(vNom, x, true); } }
    const c = $('tuCurseur'); c.hidden = x < tu.X0 || x > tu.X1; c.style.left = tuPc(Math.min(tu.X1, x));
    const xm = ((x % 32) + 32) % 32;
    $('tuMesure').textContent = `Mesure ${Math.floor(xm / 4) + 1} sur 8`;
    const tt = Math.floor(xm % 4);
    $('tuTemps').querySelectorAll('i').forEach((e, k) => e.classList.toggle('ici', k === tt));
    if (ac.currentTime >= tu.son.tFin) tuFinSon();
  } else if (tu.phase === 'apres'){
    if (tu.horloge - tu.hFin >= 900) tuSuivant();
  }
  tuAvance();
  tu.raf = requestAnimationFrame(tuImage);
}
function tuBoucle(){ if (!tu.raf){ tu.dernier = performance.now(); tu.raf = requestAnimationFrame(tuImage); } }

/* ---------- Chapitres, barre d'avancement ---------- */
function tuChapitres(){
  const c = tu.t.plans[tu.i].ch;
  document.querySelectorAll('#tuChaps button').forEach(b => { const k = +b.dataset.c; b.classList.toggle('ici', k === c); b.classList.toggle('fait', k < c); b.setAttribute('aria-current', k === c ? 'step' : 'false'); });
  $('tuNum').textContent = `Plan ${tu.i + 1} / ${tu.t.plans.length}`;
}
function tuAvance(){
  const t = tu.t, p = t.plans[tu.i];
  let part;
  if (tu.phase === 'son' && tu.son) part = .35 + .65 * Math.min(1, (tuX() - tu.son.de) / (tu.son.a - tu.son.de));
  else if (tu.phase === 'apres' || tu.phase === 'fin') part = 1;
  else part = .35 * Math.min(1, (tu.horloge - tu.h0) / Math.max(1, tu.texte.total + (p.seg ? tuAvantSon(p) : tuLecture(p))));
  document.querySelectorAll('#tuAvance .tu-seg').forEach(s => {
    const c = +s.dataset.c, ids = t.plans.map((q, k) => q.ch === c ? k : -1).filter(k => k >= 0);
    const faits = ids.filter(k => k < tu.i).length + (ids.includes(tu.i) ? part : 0);
    s.firstChild.style.width = (faits / ids.length * 100).toFixed(1) + '%';
  });
}
const tuPremier = c => tu.t.plans.findIndex(p => p.ch === c);
function tuMetPause(on){
  tu.pause = on;
  $('tuLecteur').classList.toggle('en-pause', on);
  if (ac && tu.phase !== 'charge'){ if (on) ac.suspend(); else ac.resume(); }
  $('tuLire').setAttribute('aria-label', on ? 'Lecture' : 'Pause');
  $('tuLire').innerHTML = on ? '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4v16l13-8z"/></svg>' : '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 4h4.5v16H6zM13.5 4H18v16h-4.5z"/></svg>';
}
function tuFinBoutons(){
  const t = tu.t, k = TUTOS.indexOf(t), apres = TUTOS[k + 1];
  $('tuRetenirListe').innerHTML = t.retenir.map(r => `<li><span>${tuTypo(r).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>')}</span></li>`).join('');
  $('tuSuivant').hidden = !apres;
  if (apres) $('tuSuivant').textContent = tuTypo(`Tuto suivant : ${apres.titre}`);
}

/* ---------- Ouvrir, fermer ---------- */
function tuOuvre(id){
  const t = TUTOS.find(x => x.id === id); if (!t) return;
  tuSonStop();
  tu.t = t; [tu.X0, tu.X1] = t.vue;
  $('tuCatalogue').hidden = true; $('tuLecteur').hidden = false;
  const fam = TU_FAMILLES.find(f => f.id === t.famille), dans = TUTOS.filter(x => x.famille === t.famille);
  $('tuTitre').textContent = t.titre;
  $('tuFam').textContent = `${fam.titre} · tuto ${dans.indexOf(t) + 1} sur ${dans.length}`;
  $('tuPro').textContent = t.gratuit ? 'GRATUIT' : 'PRO'; $('tuPro').classList.toggle('gratuit', !!t.gratuit);
  $('tuChaps').innerHTML = TU_CHAPITRES.map((c, k) => `<button type="button" data-c="${k}"><span class="tu-n">${k + 1}</span>${c}</button>`).join('');
  $('tuAvance').innerHTML = TU_CHAPITRES.map((c, k) => `<button type="button" class="tu-seg" data-c="${k}" style="flex:${t.plans.filter(p => p.ch === k).length}" aria-label="${c}"><i></i></button>`).join('');
  document.querySelectorAll('#tuChaps button, #tuAvance .tu-seg').forEach(b => b.addEventListener('click', () => { if (tu.phase !== 'charge') tuAller(tuPremier(+b.dataset.c)); }));
  $('tuTable').innerHTML = tuTableSvg();
  const sert = tuCommandes(t);
  $('tuTable').querySelectorAll('.tu-c[data-c]').forEach(g => g.classList.toggle('tu-eteint', !sert.has(g.dataset.c)));
  tuLignes();
  if (!$('tuVini').firstChild) viniMettre($('tuVini'), 'calme');
  tu.i = 0; tu.horloge = 0; tu.phase = 'charge'; tu.revele = tu.X1; tu.vues = new Set();
  $('tuRetenir').hidden = true; $('tuPiste').hidden = false; $('tuTable').hidden = false; $('tuCompteur').hidden = false;
  $('tuEtape').textContent = ''; $('tuNote').textContent = ''; $('tuBadge2').hidden = true;
  ['tuEcoute', 'tuMesure', 'tuTemps'].forEach(x => { $(x).hidden = true; });
  tuPiste('bon', tu.X1); tuMajTable(t.etat, 'bon', false);
  tuPrepare(tuTypo('Je prépare la musique…')); tuMontre(Infinity);
  viniPose($('tuVini'), { bras: 'salut' }); viniHumeur($('tuVini'), 'calme');
  tuMetPause(false); tuChapitres(); tuAvance();
  tuVersHaut();
  stat('tuto-ouvert', { tuto: t.id });
  // le clic sur le tuto lance le son : sans lui, le navigateur le garde muet
  ensureAudio(); if (ac.state !== 'running') ac.resume();
  const ms = [...new Set(Object.values(t.versions).flatMap(v => [v.A.m, v.B.m]))];
  Promise.all(ms.map(tuCharge)).then(() => {
    if (tu.t !== t || tu.phase !== 'charge') return;
    tu.phase = 'texte'; tuAller(0); tuBoucle();
  }).catch(() => {
    if (tu.t !== t) return;
    tuPrepare(tuTypo("La musique ne se charge pas. Vérifie ta connexion, puis rouvre le tuto.")); tuMontre(Infinity);
    viniPose($('tuVini'), { sueur: true });
  });
}
// Le lecteur tout entier à l'écran, même sur un portable (comme stageIntoView pour un niveau) : l'en-tête remonte
function tuVersHaut(){ const y = $('tuLecteur').getBoundingClientRect().top + window.scrollY - 8; window.scrollTo(0, Math.max(0, y)); }
function tuFerme(){
  tuSonStop();
  if (tu.pause && ac) ac.resume();
  tu.pause = false; tu.phase = 'ferme';
  if (tu.raf){ cancelAnimationFrame(tu.raf); tu.raf = 0; }
  if ($('tuVini').firstChild) viniParle($('tuVini'), false);
  $('tuLecteur').hidden = true; $('tuCatalogue').hidden = false;
}

/* ---------- Le catalogue (l'onglet « Tutos ») ---------- */
function renderTutos(){
  if (tu.phase !== 'ferme') return;
  $('tuFamilles').innerHTML = TU_FAMILLES.map(f => {
    const liste = TUTOS.filter(t => t.famille === f.id);
    return `<section class="tu-famille"><h2>${f.titre}</h2><p class="tu-fam-resume">${tuTypo(f.resume)}</p><div class="cards tu-cartes">${liste.map(t => {
      const vu = tuVus.includes(t.id), etiquette = vu ? 'Vu' : t.gratuit ? 'Gratuit' : 'Pro';
      return `<button type="button" class="card tu-carte${vu ? ' tu-vu' : ''}" data-tu="${t.id}"><span class="soon tu-etiq${vu ? ' ok' : t.gratuit ? '' : ' pro'}">${etiquette}</span><strong>${tuTypo(t.titre)}</strong><p>${tuTypo(t.resume)}</p><span class="tu-duree">${t.duree} · avec Vini</span></button>`;
    }).join('')}</div></section>`;
  }).join('');
  $('tuFamilles').querySelectorAll('[data-tu]').forEach(b => b.addEventListener('click', () => tuOuvre(b.dataset.tu)));
  const reste = TUTOS.filter(t => !tuVus.includes(t.id));
  viniDit('tutos', tuTypo(!tuVus.length ? "Ici, je t'explique les techniques des DJ, une par une. Commence par « La boucle qui attend » !"
    : reste.length ? `Prochain tuto conseillé : « ${reste[0].titre} ».` : 'Tu as vu tous les tutos des boucles. Bravo !'), tuVus.length && !reste.length ? 'danse' : 'calme');
}

/* ---------- Les boutons du lecteur ---------- */
$('tuRetour').addEventListener('click', () => { tuFerme(); renderTutos(); window.scrollTo(0, 0); });
$('tuLire').addEventListener('click', () => { if (tu.phase !== 'charge') tuMetPause(!tu.pause); });
$('tuPrec').addEventListener('click', () => { if (tu.phase !== 'charge') tuAller(tu.i - 1); });
$('tuSuiv').addEventListener('click', () => { if (tu.phase !== 'charge') tuAller(tu.i + 1); });
$('tuRejoue').addEventListener('click', () => {
  if (tu.phase === 'charge') return;
  // « Réécouter » : le dernier passage musical (celui de ce plan, ou du plan d'avant)
  let k = tu.i; if (!tu.t.plans[k].seg && k > 0 && tu.t.plans[k - 1].seg) k--;
  if (tu.pause) tuMetPause(false);
  tuAller(k, { direct: true });
});
$('tuRevoir').addEventListener('click', () => tuAller(0));
$('tuSuivant').addEventListener('click', () => { const k = TUTOS.indexOf(tu.t); if (TUTOS[k + 1]) tuOuvre(TUTOS[k + 1].id); });
document.addEventListener('keydown', e => {
  if (tu.phase === 'ferme' || tu.phase === 'charge' || $('tuLecteur').hidden) return;
  if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || e.target.closest('button')) return;
  if (e.key === ' '){ e.preventDefault(); tuMetPause(!tu.pause); }
  else if (e.key === 'ArrowRight') tuAller(tu.i + 1);
  else if (e.key === 'ArrowLeft') tuAller(tu.i - 1);
});
// Un onglet caché arrête l'image : on met le tuto en pause pour que le son ne parte pas sans elle
document.addEventListener('visibilitychange', () => { if (document.hidden && tu.phase !== 'ferme' && tu.phase !== 'charge' && !tu.pause) tuMetPause(true); });
/* ---------- Le volume du lecteur ----------
   Une glissière et un haut-parleur, comme sous une vidéo (demande de l'utilisateur, 7 nov. 2026). Le haut-parleur de
   l'en-tête (les sons du jeu, coach-sons) coupe aussi les tutos ; remonter le volume du lecteur le rallume. */
const tuMuet = () => !sonsOn || tuVol === 0;
let tuVolAvant = .7;
function tuVolumeApplique(){
  const v = sonsOn ? tuVol : 0;
  if (tu.sortie && ac) tu.sortie.gain.setTargetAtTime(v * v, ac.currentTime, .02);   // au carré : la glissière suit mieux l'oreille
  const r = $('tuVolume'); if (document.activeElement !== r) r.value = String(sonsOn ? tuVol : 0);
  const b = $('tuMuet'), muet = tuMuet();
  b.setAttribute('aria-pressed', String(muet)); b.setAttribute('aria-label', muet ? 'Remettre le son' : 'Couper le son'); b.innerHTML = sonsIcone(!muet);
}
function tuSonsRallume(){ if (!sonsOn){ sonsOn = true; try { localStorage.setItem('coach-sons', '1'); } catch (e) {} renderSons(); } }
$('tuVolume').addEventListener('input', e => {
  tuVol = Math.max(0, Math.min(1, +e.target.value || 0));
  if (tuVol > 0) tuSonsRallume();
  tuVolumeApplique(); tuGarde();
});
$('tuMuet').addEventListener('click', () => {
  if (tuMuet()){ if (tuVol === 0) tuVol = tuVolAvant || .7; tuSonsRallume(); }
  else { tuVolAvant = tuVol; tuVol = 0; }
  tuVolumeApplique(); tuGarde();
});
$('sonsBtn').addEventListener('click', tuVolumeApplique);   // après celui de sons.js, qui a déjà changé sonsOn
tuVolumeApplique();
$('tabTutos').hidden = !tutosOn();
