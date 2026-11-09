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
// La musique (7 nov. 2026) : quatre morceaux de Pixabay choisis à l'oreille par l'utilisateur (Play House sonnait « IA » ; les
// effets du lot 58 se jouent sur « Luxury Life » et « House - July », l'extrait des niveaux),
// ramenés à 124 BPM sans changer leur hauteur par tests/musique-pixabay.js. Deux paires de tonalités qui vont ensemble :
// « Deep House » (alexrockbeat, fa majeur) et « Deep House Instrumental » (arnaud136, ré mineur), « Luxury Life » et
// « Fashion Diva House » (kulakovka, la mineur). Les parties de chaque extrait, en temps de l'extrait, mesurées dans le
// son : [début, fin, nom, 'fort' pour un drop]
const TU_PARTIES = {
  'tuto-deep-a': [[0, 32, 'break de A'], [32, 96, 'A · « Deep House »'], [96, 128, 'dernière phrase de A'], [128, 148, 'fin de A']],
  'tuto-instru-b': [[0, 64, 'montée de B · « Deep House Instrumental »'], [64, 136, 'DROP', 'fort']],
  'tuto-luxury-a': [[0, 32, 'A · « Luxury Life »'], [32, 64, 'break de A'], [64, 96, 'A · « Luxury Life »'], [96, 128, 'dernière phrase de A'], [128, 160, 'fin de A']],
  'tuto-diva-b': [[0, 32, 'intro de B · « Fashion Diva »'], [32, 96, 'DROP', 'fort']],
  'niv-july-b': [[0, 64, 'intro de B · « House - July »'], [64, 136, 'DROP', 'fort']]   // l'extrait des niveaux (lot 57)
};
const TU_MUSIQUE = {
  deep: '« Deep House » (alexrockbeat) et « Deep House Instrumental » (arnaud136), sur Pixabay',
  luxury: '« Luxury Life » et « Fashion Diva House » (kulakovka), sur Pixabay',
  july: '« Luxury Life » (kulakovka) et « House - July » (Easy_Eva), sur Pixabay'
};
/* ---------- Les tutos ----------
   Une platine : m (le morceau, dans musique/), debut (temps de A où elle part), pos (où elle part dans son morceau), fin (après,
   le morceau est fini : silence), evts ([temps de A, 'in' | 'out' | 'exit' | 'moitie']), niv (son fader, [temps, valeur]…),
   casque ([de, à]…) ; lot 58 : eq ({ low, mid, hi } : [temps, valeur]…, 1 = normal, 0 = coupé), filtre ([temps, valeur]…,
   0 = neutre, 1 = que les aigus, -1 = que les graves), fx ([de, à, 'echo' | 'reverb']… : l'effet allumé de… à ; comme sur
   la table, l'éteindre coupe aussi ce qui résonne encore),
   marques ([temps, texte]… : les gestes écrits sur la piste). Une version = deux platines (+ alerte : où ça casse, pour une
   version ratée).
   Un plan : ch (chapitre), dit (ce que dit Vini), seg ([de, à, version] : le passage qu'on écoute ensuite), etape, badge
   ('rate' ou 'ok'), focus ('boucle' ou 'phrases'), note, cibles (commandes à montrer), pose (de Vini), revele (jusqu'où la
   piste est déjà dessinée au début du plan), fin (le dernier plan : « À retenir »). */
// Paire « deep » : A a ses basses du temps 32 au temps 128 puis sa fin ; B part de son break : 64 temps sans basse (le break,
// puis la montée), puis son vrai drop (à 1:32 dans le morceau, dit par l'utilisateur). Paire « luxury » :
// B (« Fashion Diva ») n'a que 32 temps d'intro, il part donc 32 temps plus tard pour que son drop tombe au même endroit.
const tuA = (o = {}) => Object.assign({ m: 'tuto-deep-a', debut: 0, pos: 0, fin: 148, evts: [], niv: [[0, 1], [128, 1], [128.06, 0]], casque: [], fx: [], marques: [] }, o);
const tuB = (o = {}) => Object.assign({ m: 'tuto-instru-b', debut: 32, pos: 0, fin: 136, evts: [], niv: [[0, 0]], casque: [], fx: [], marques: [] }, o);
const tuLux = o => tuA(Object.assign({ m: 'tuto-luxury-a', fin: 160 }, o));
const tuDiva = o => tuB(Object.assign({ m: 'tuto-diva-b', fin: 96 }, o));
const tuCoupe = x => [[0, 1], [x, 1], [x + .06, 0]];   // A à fond, puis baissé d'un coup au temps x
const TU_ATTEND_B = { evts: [[64, 'in'], [96, 'out'], [128, 'exit']], niv: [[0, 0], [100, 0], [112, .8], [128, .8], [128.06, 1]], casque: [[32, 100]] };
const TU_ATTEND_FORT = { niv: [[0, 0], [80, 0], [80.06, .8], [128, .8], [128.06, 1]], casque: [[32, 80]] };   // B déjà monté : on entend bien la boucle
const TU_PROLONGE_B = { debut: 96, niv: [[0, 0], [112, 0], [124, .8], [160, .8], [160.06, 1]], casque: [[96, 112]] };
const TU_MONTEE_B = { debut: 96, niv: [[0, 0], [128, 0], [128.02, 1]], casque: [[96, 120]] };
const TU_SECOURS_B = { debut: 104, niv: [[0, 0], [112, 0], [124, .8], [136, .8], [136.06, 1]], casque: [[104, 112]] };
const TU_MONTEE_A = [[96, 'in'], [104, 'out'], [112, 'moitie'], [120, 'moitie'], [124, 'moitie'], [126, 'moitie']];
const TU_ECOUTE = "Écoute d'abord la transition en entier. Je t'explique juste après.";

// Lot 58 : les familles « Le volume et les basses » (paire « deep ») et « Les effets » (paire « july » : « Luxury Life » puis
// « House - July », la mineur toutes les deux ; B part au temps 64, son drop tombe au temps 128, quand A est coupé)
const tuJuly = o => tuB(Object.assign({ m: 'niv-july-b', fin: 136 }, o));
const TU_FONDU_A = { niv: [[0, 1], [120, 1], [128, 0]], marques: [[120, 'FADER ↓']] };
const TU_FONDU_B = { debut: 64, niv: [[0, 0], [96, 0], [120, 1]], casque: [[64, 96]], marques: [[96, 'FADER ↑']] };
const TU_SWAP_A = { eq: { low: [[0, 1], [96, 1], [96.02, 0]] }, marques: [[96, 'LOW ↓']] };
const TU_SWAP_B = { niv: [[0, 0], [64, 0], [80, 1]], casque: [[32, 64]], eq: { low: [[0, 0], [96, 0], [96.02, 1]] }, marques: [[96, 'LOW ↑']] };
const TU_BANDES_A = { eq: { hi: [[0, 1], [96, 1], [96.02, 0]], mid: [[0, 1], [104, 1], [104.02, 0]], low: [[0, 1], [112, 1], [112.02, 0]] }, marques: [[96, 'HI ↓'], [104, 'MID ↓'], [112, 'LOW ↓']] };
const TU_BANDES_B = { niv: [[0, 0], [72, 0], [88, 1]], casque: [[32, 72]], eq: { hi: [[0, 0], [96, 0], [96.02, 1]], mid: [[0, 0], [104, 0], [104.02, 1]], low: [[0, 0], [112, 0], [112.02, 1]] }, marques: [[96, 'HI ↑'], [104, 'MID ↑'], [112, 'LOW ↑']] };
const TU_COUPE_B = { debut: 64, niv: [[0, 0], [128, 0], [128.06, 1]], casque: [[64, 104]], marques: [[128, 'FADER ↑']] };   // casque fini avant la dernière phrase : le trou d'une coupure trop tôt s'entend
const TU_EFFET_B = { debut: 64, niv: [[0, 0], [96, 0], [112, .8], [128, .8], [128.06, 1]], casque: [[64, 96]], marques: [[96, 'FADER ↑']] };
const TU_ECHO_A = { fx: [[124, 136, 'echo']], marques: [[124, 'ÉCHO'], [128, 'FADER ↓']] };
const TU_REVERBE_A = { fx: [[120, 140, 'reverb']], marques: [[120, 'RÉVERBE'], [128, 'FADER ↓']] };
const TU_FILTRE_A = { filtre: [[0, 0], [112, 0], [128, -.75]], marques: [[112, 'FILTRE se ferme'], [128, 'FADER ↓']] };
const TU_FILTRE_B = { debut: 64, filtre: [[0, .8], [96, .8], [128, 0]], niv: [[0, 0], [96, 0], [100, .9], [128, .9], [128.06, 1]], casque: [[64, 96]], marques: [[96, 'FADER ↑'], [96, "FILTRE s'ouvre"]] };

const TUTOS = [
  {
    id: 'attend', famille: 'boucles', titre: 'La boucle qui attend', gratuit: true, duree: '3 min', musique: 'deep',
    resume: 'B patiente en boucle juste avant son drop, puis part pile quand A se termine.',
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
      { ch: 1, dit: "La boucle, c'est la salle d'attente de B : il tourne en rond juste avant son drop, et c'est toi qui choisis quand il part.", focus: 'boucle' },
      { ch: 1, dit: "Elle te sauve quand B arrive trop vite à son drop, ou quand A dure plus longtemps que prévu." },
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
    id: 'prolonge', famille: 'boucles', titre: "La boucle qui prolonge l'outro", duree: '3 min', musique: 'deep',
    resume: "A finit avant le drop de B ? Tu boucles la fin de A, le temps que B arrive.",
    vue: [88, 168], etat: 140,
    versions: {
      bon: { A: tuA({ fin: 128, evts: [[112, 'in'], [128, 'out']], niv: tuCoupe(160) }), B: tuB(TU_PROLONGE_B) },
      sans: { A: tuA({ fin: 128, niv: tuCoupe(160) }), B: tuB(TU_PROLONGE_B), alerte: [128, '↑ A est fini : il ne reste que B, sans ses basses'] },
      tot: { A: tuA({ fin: 128, evts: [[112, 'in'], [128, 'out'], [136, 'exit']], niv: tuCoupe(160) }), B: tuB(TU_PROLONGE_B), alerte: [144, "↑ le trou : A s'est arrêté trop tôt"] }
    },
    plans: [
      { ch: 0, dit: TU_ECOUTE },
      { ch: 0, dit: 'Écoute… et suis le trait blanc sur la piste.', seg: [108, 168] },
      { ch: 0, dit: 'Tu as entendu ? A est arrivé au bout, mais il a continué à tourner sur ses 16 derniers temps, le temps que B arrive à son drop.', pose: { bras: 'pouce', yeux: 'clin' } },
      { ch: 1, dit: "Le problème : B met longtemps à arriver à son drop, et A se termine avant. Écoute ce qui se passe sans boucle :", seg: [120, 160, 'sans'], badge: 'rate' },
      { ch: 1, dit: "Tout retombe : pendant 32 temps, il ne reste que B, sans ses basses, tout maigre. La boucle qui prolonge l'outro bouche ce trou.", focus: 'boucle' },
      { ch: 2, dit: "Lance B au casque sur une phrase de A, puis monte son fader pendant la fin de A.", seg: [94, 124], revele: 94, cibles: ['playB', 'faderB'] },
      { ch: 2, dit: '16 temps avant la fin de A, appuie sur IN.', seg: [104, 116], revele: 104, cibles: ['inA'] },
      { ch: 2, dit: "Sur la fin de A, appuie sur OUT : A repart 16 temps en arrière, et tourne en boucle sous la montée de B.", seg: [120, 140], revele: 120, cibles: ['outA'] },
      { ch: 2, dit: "Pas besoin d'EXIT : quand le drop de B arrive, baisse A d'un coup.", seg: [148, 168], revele: 148, cibles: ['faderA'] },
      { ch: 3, etape: "L'erreur", dit: "Tu appuies sur EXIT trop tôt : A repart vers sa fin… et s'arrête avant le drop de B.", seg: [128, 164, 'tot'], badge: 'rate', pose: { sueur: true } },
      { ch: 3, etape: "L'erreur", dit: "Tu as entendu le trou ? Garde la boucle jusqu'au drop de B. La bonne :", seg: [128, 164], badge: 'ok' },
      { ch: 4, dit: 'Bravo ! Avec cette boucle, plus de trou entre deux morceaux.', fin: true }
    ],
    retenir: ['Si A finit avant le drop de B, **boucle la fin de A**.', "**IN** 16 temps avant la fin, **OUT** sur la fin : A tourne sous B jusqu'à son drop.", "Pas d'EXIT : au drop de B, **baisse A** d'un coup."]
  },
  {
    id: 'montee', famille: 'boucles', titre: 'La montée en boucle', duree: '3 min', musique: 'luxury',
    resume: 'Une boucle qui raccourcit (8, 4, 2, 1 temps) fait monter la tension avant le drop.',
    vue: [72, 144], etat: 118,
    versions: {
      bon: { A: tuLux({ evts: TU_MONTEE_A, niv: tuCoupe(128) }), B: tuDiva(TU_MONTEE_B) },
      vite: { A: tuLux({ evts: [[96, 'in'], [104, 'out'], [106, 'moitie'], [108, 'moitie'], [109, 'moitie'], [110, 'moitie']], niv: tuCoupe(128) }), B: tuDiva(TU_MONTEE_B), alerte: [110, '↑ trop vite : la boucle bégaie 18 temps'] }
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
    id: 'secours', famille: 'boucles', titre: 'La boucle de secours', duree: '3 min', musique: 'luxury',
    resume: 'B est parti en retard ? Une boucle de 4 temps sur A rattrape tout.',
    vue: [72, 152], etat: 116,
    versions: {
      bon: { A: tuLux({ fin: 128, evts: [[124, 'in'], [128, 'out']], niv: tuCoupe(136) }), B: tuDiva(TU_SECOURS_B) },
      sans: { A: tuLux({ fin: 128, niv: tuCoupe(136) }), B: tuDiva(TU_SECOURS_B), alerte: [128, '↑ le trou : 8 temps sans A avant le drop'] },
      deborde: { A: tuLux({ fin: 128, evts: [[126, 'in'], [130, 'out']], niv: tuCoupe(136) }), B: tuDiva(TU_SECOURS_B), alerte: [130, '↑ la boucle déborde après la fin de A : un trou à chaque tour'] }
    },
    plans: [
      { ch: 0, dit: TU_ECOUTE },
      { ch: 0, dit: 'Écoute… et suis le trait blanc sur la piste.', seg: [100, 152] },
      { ch: 0, dit: "B était parti en retard, mais tu n'as rien entendu : A a répété sa dernière mesure, le temps que le drop de B arrive.", pose: { bras: 'pouce', yeux: 'clin' } },
      { ch: 1, dit: 'Tu as lancé B 8 temps trop tard ? Ça arrive à tout le monde. Son drop tombera 8 temps après la fin de A. Écoute :', seg: [112, 148, 'sans'], badge: 'rate' },
      { ch: 1, dit: "Tu entends le trou ? La boucle de secours gagne ces 8 temps, et personne ne s'en rend compte.", focus: 'boucle' },
      { ch: 2, dit: "Oups : B part 8 temps après le début d'une phrase de A. Son drop arrivera en retard.", seg: [92, 112], revele: 92, cibles: ['playB'] },
      { ch: 2, dit: 'Sur la dernière mesure de A, 4 temps avant la fin, appuie sur IN.', seg: [116, 127], revele: 116, cibles: ['inA'] },
      { ch: 2, dit: 'Sur la fin de A, appuie sur OUT : A répète sa dernière mesure. Deux tours, et tu as gagné 8 temps.', seg: [122, 138], revele: 122, cibles: ['outA'] },
      { ch: 2, dit: "Au drop de B, baisse A d'un coup. Sauvé !", seg: [128, 148], revele: 128, cibles: ['faderA'] },
      { ch: 3, etape: "L'erreur", dit: 'Tu appuies sur IN 2 temps trop tard : ta boucle déborde après la fin de A. Écoute :', seg: [116, 144, 'deborde'], badge: 'rate', pose: { sueur: true } },
      { ch: 3, etape: "L'erreur", dit: 'Un trou à chaque tour ! Ta boucle doit finir pile sur la fin de A. La bonne :', seg: [116, 144], badge: 'ok' },
      { ch: 4, dit: 'Bravo ! Un B parti en retard ne te fait plus peur.', fin: true }
    ],
    retenir: ['B parti en retard ? **Boucle la fin de A** pour gagner du temps.', 'Une boucle de **4 temps** qui tourne deux fois : **8 temps** de gagnés.', 'Ta boucle finit **pile sur la fin de A**, et au drop de B tu baisses A.']
  },
  // ---------- Le volume et les basses (lot 58) : paire « deep » ; A coupé au temps 128 ----------
  {
    id: 'fondu', famille: 'volume', titre: 'Le fondu au fader', gratuit: true, duree: '3 min', musique: 'deep',
    resume: 'B monte tout doucement pendant la dernière phrase de A, et son drop tombe quand A disparaît.',
    vue: [56, 144], etat: 112,
    versions: {
      bon: { A: tuA(TU_FONDU_A), B: tuB(TU_FONDU_B) },
      vite: { A: tuA(TU_FONDU_A), B: tuB(Object.assign({}, TU_FONDU_B, { niv: [[0, 0], [96, 0], [96.06, 1]], marques: [[96, 'FADER ↑']] })), alerte: [96, "↑ B arrive d'un coup"] },
      tot: { A: tuA({ niv: [[0, 1], [100, 1], [108, 0]], marques: [[100, 'FADER ↓']] }), B: tuB(TU_FONDU_B), alerte: [108, "↑ A est parti : il ne reste que la montée de B"] }
    },
    plans: [
      { ch: 0, dit: TU_ECOUTE },
      { ch: 0, dit: "Écoute… et suis le trait blanc sur la piste : c'est là où on en est.", seg: [88, 144] },
      { ch: 0, dit: "Tu as entendu ? B est monté tout doucement pendant la fin de A, et on n'a pas entendu la couture. C'est le fondu au fader.", pose: { bras: 'pouce', yeux: 'clin' } },
      { ch: 1, dit: "C'est la transition la plus simple : un morceau monte pendant que l'autre descend, juste avec les faders." },
      { ch: 1, dit: "Le secret : B monte doucement pendant la dernière phrase de A, et son drop tombe pile quand A s'arrête.", focus: 'phrases', note: '1 phrase = 32 temps = 8 mesures de 4 temps' },
      { ch: 2, dit: "Lance B au casque, au début de l'avant-dernière phrase de A.", seg: [56, 72], revele: 64, cibles: ['playB', 'casqueB'] },
      { ch: 2, dit: 'Au début de la dernière phrase de A, monte le fader de B, tout doucement : en 24 temps.', seg: [92, 122], revele: 92, cibles: ['faderB'] },
      { ch: 2, dit: 'Sur les 8 derniers temps, baisse A. Le drop de B tombe pile quand A disparaît.', seg: [116, 140], revele: 116, cibles: ['faderA'] },
      { ch: 3, etape: 'Erreur n° 1', dit: "Tu montes B d'un coup. Écoute le début de la phrase :", seg: [88, 112, 'vite'], badge: 'rate', pose: { sueur: true } },
      { ch: 3, etape: 'Erreur n° 1', dit: "Ça saute : tout le monde l'a entendu. Monte-le doucement, sur 24 temps. La bonne :", seg: [88, 112], badge: 'ok' },
      { ch: 3, etape: 'Erreur n° 2', dit: 'Tu baisses A trop tôt. Écoute la fin de la phrase :', seg: [96, 132, 'tot'], badge: 'rate', pose: { sueur: true } },
      { ch: 3, etape: 'Erreur n° 2', dit: "Il ne reste que la montée de B, toute maigre. Garde A jusqu'au drop de B. La bonne :", seg: [96, 132], badge: 'ok' },
      { ch: 4, dit: 'Bravo, tu connais le fondu au fader ! Garde ces trois lignes en tête.', fin: true }
    ],
    retenir: ["B monte **doucement**, pendant la dernière phrase de A : pas d'un coup.", '**A descend sur les 8 derniers temps**, pas avant.', 'Le **drop de B** tombe pile quand A disparaît.']
  },
  {
    id: 'swap', famille: 'volume', titre: 'Le swap des basses', duree: '3 min', musique: 'deep',
    resume: 'Au drop de B, les basses changent de morceau, sur le 1 : jamais deux basses en même temps.',
    vue: [24, 140], etat: 104,
    versions: {
      bon: { A: tuA(TU_SWAP_A), B: tuB(TU_SWAP_B) },
      double: { A: tuA(), B: tuB(Object.assign({}, TU_SWAP_B, { eq: null, marques: [] })), alerte: [96, '↑ deux basses en même temps : ça devient boueux'] },
      tard: { A: tuA(Object.assign({}, TU_SWAP_A, { eq: { low: [[0, 1], [98, 1], [98.02, 0]] }, marques: [[98, 'LOW ↓']] })), B: tuB(TU_SWAP_B), alerte: [96, '↑ 2 temps de basses doublées'] }
    },
    plans: [
      { ch: 0, dit: TU_ECOUTE },
      { ch: 0, dit: 'Écoute… et suis le trait blanc sur la piste.', seg: [80, 136] },
      { ch: 0, dit: "Tu as entendu ? Au drop de B, les basses ont changé de morceau d'un coup, sur le 1. C'est le swap des basses.", pose: { bras: 'pouce', yeux: 'clin' } },
      { ch: 1, dit: 'Deux basses en même temps, ça fait de la bouillie : les graves des deux morceaux se marchent dessus.' },
      { ch: 1, dit: "Le swap, c'est échanger les basses : celles de A partent, celles de B arrivent, au même instant, sur le 1.", focus: 'phrases', note: 'LOW = les basses · tout à gauche = coupé' },
      { ch: 2, dit: 'Coupe le LOW de B, tout à gauche. Puis lance B au casque, sur une phrase de A.', seg: [24, 40], revele: 32, cibles: ['lowB', 'playB', 'casqueB'] },
      { ch: 2, dit: "Monte son fader pendant sa montée : on l'entend, mais sans ses basses.", seg: [60, 84], revele: 60, cibles: ['faderB'] },
      { ch: 2, dit: 'Au drop de B, sur le 1 : coupe le LOW de A et ouvre celui de B, en même temps.', seg: [88, 108], revele: 88, cibles: ['lowA', 'lowB'] },
      { ch: 2, dit: 'A finit sa phrase sans ses basses. À la fin, baisse-le.', seg: [118, 136], revele: 118, cibles: ['faderA'] },
      { ch: 3, etape: 'Erreur n° 1', dit: 'Tu oublies le swap. Écoute le drop de B :', seg: [88, 108, 'double'], badge: 'rate', pose: { sueur: true } },
      { ch: 3, etape: 'Erreur n° 1', dit: 'Ça cogne et ça bave : deux basses ensemble. La bonne :', seg: [88, 108], badge: 'ok' },
      { ch: 3, etape: 'Erreur n° 2', dit: 'Tu ouvres le LOW de B à l’heure, mais tu coupes celui de A 2 temps trop tard. Écoute bien le drop :', seg: [88, 108, 'tard'], badge: 'rate', pose: { sueur: true } },
      { ch: 3, etape: 'Erreur n° 2', dit: 'Les basses se sont doublées pendant 2 temps. Les deux potards en même temps, sur le 1. La bonne :', seg: [88, 108], badge: 'ok' },
      { ch: 4, dit: 'Bravo, tu sais faire le swap des basses !', fin: true }
    ],
    retenir: ['**Jamais deux basses** en même temps.', 'Le **LOW de B coupé** avant de le lancer.', 'Au **drop de B**, sur le 1 : LOW de A coupé, LOW de B ouvert.']
  },
  {
    id: 'bandes', famille: 'volume', titre: 'Le mix aux 3 bandes', duree: '3 min', musique: 'deep',
    resume: 'Les aigus, puis les médiums, puis les basses : B entre bande par bande pendant que A s’efface.',
    vue: [24, 136], etat: 108,
    versions: {
      bon: { A: tuA(TU_BANDES_A), B: tuB(TU_BANDES_B) },
      ensemble: { A: tuA(), B: tuB(Object.assign({}, TU_BANDES_B, { eq: null, marques: [] })), alerte: [96, '↑ deux morceaux entiers en même temps : tout se mélange'] }
    },
    plans: [
      { ch: 0, dit: TU_ECOUTE },
      { ch: 0, dit: 'Écoute… et suis le trait blanc sur la piste.', seg: [84, 136] },
      { ch: 0, dit: "Tu as entendu ? B est entré par petits morceaux : ses aigus, puis ses médiums, puis ses basses. Et A s'effaçait de la même façon.", pose: { bras: 'pouce', yeux: 'clin' } },
      { ch: 1, dit: "Le swap échange les basses. Le mix aux 3 bandes va plus loin : les aigus, puis les médiums, puis les basses, une bande toutes les 2 mesures.", note: 'HI = les aigus · MID = les voix, les mélodies · LOW = les basses' },
      { ch: 1, dit: 'C’est plus long et plus doux : parfait quand deux morceaux se ressemblent.' },
      { ch: 2, dit: 'Avant de lancer B, coupe ses trois potards : HI, MID et LOW tout à gauche. Puis lance-le au casque.', seg: [24, 40], revele: 32, cibles: ['hiB', 'midB', 'lowB', 'playB'] },
      { ch: 2, dit: "Monte son fader : on n'entend presque rien, c'est normal.", seg: [68, 92], revele: 68, cibles: ['faderB'] },
      { ch: 2, dit: 'Au drop de B, échange les aigus : HI de A à gauche, HI de B au milieu.', seg: [92, 104], revele: 92, cibles: ['hiA', 'hiB'] },
      { ch: 2, dit: '2 mesures plus tard, les médiums.', seg: [100, 112], revele: 100, cibles: ['midA', 'midB'] },
      { ch: 2, dit: "Encore 2 mesures : les basses. A n'est plus qu'un souffle : baisse-le à la fin de sa phrase.", seg: [108, 132], revele: 108, cibles: ['lowA', 'lowB', 'faderA'] },
      { ch: 3, etape: "L'erreur", dit: 'Tu ouvres B en entier d’un coup, et A reste entier. Écoute :', seg: [92, 116, 'ensemble'], badge: 'rate', pose: { sueur: true } },
      { ch: 3, etape: "L'erreur", dit: 'Deux morceaux entiers : tout se mélange. Une bande à la fois. La bonne :', seg: [92, 116], badge: 'ok' },
      { ch: 4, dit: 'Bravo, tu sais mixer aux 3 bandes !', fin: true }
    ],
    retenir: ['**HI, puis MID, puis LOW** : une bande toutes les 2 mesures.', 'Ce que B gagne, **A le perd au même moment**.', 'Les **basses en dernier**, sur le 1.']
  },
  {
    id: 'coupe', famille: 'volume', titre: 'La coupure sèche', duree: '2 min', musique: 'deep',
    resume: 'Sur le 1, A disparaît et le drop de B arrive, d’un coup : pas de mélange.',
    vue: [56, 148], etat: 120,
    versions: {
      bon: { A: tuA({ marques: [[128, 'FADER ↓']] }), B: tuB(TU_COUPE_B) },
      tot: { A: tuA({ niv: tuCoupe(126), marques: [[126, 'FADER ↓']] }), B: tuB(TU_COUPE_B), alerte: [126, '↑ 2 temps de silence'] },
      tard: { A: tuA({ niv: tuCoupe(130), marques: [[130, 'FADER ↓']] }), B: tuB(TU_COUPE_B), alerte: [128, '↑ A traîne 2 temps sur le drop de B'] }
    },
    plans: [
      { ch: 0, dit: TU_ECOUTE },
      { ch: 0, dit: 'Écoute… et suis le trait blanc sur la piste.', seg: [104, 148] },
      { ch: 0, dit: "Tu as entendu ? Sur le 1, A a disparu et le drop de B est arrivé, d'un coup. C'est la coupure sèche.", pose: { bras: 'pouce', yeux: 'clin' } },
      { ch: 1, dit: "C'est la transition la plus franche : pas de mélange, on passe d'un morceau à l'autre en un instant." },
      { ch: 1, dit: 'Tout se joue sur un seul temps : le 1 où A finit sa phrase et où B lâche son drop.', focus: 'phrases', note: '1 phrase = 32 temps = 8 mesures de 4 temps' },
      { ch: 2, dit: 'Lance B au casque, 64 temps avant la fin de A : son drop tombera pile à la fin.', seg: [56, 72], revele: 64, cibles: ['playB', 'casqueB'] },
      { ch: 2, dit: 'Prépare tes deux mains : une sur le fader de A, une sur celui de B. Compte la dernière phrase de A…', seg: [104, 126], revele: 104, cibles: ['faderA', 'faderB'] },
      { ch: 2, dit: '… et sur le 1 : A en bas, B en haut, en même temps.', seg: [120, 140], revele: 120, cibles: ['faderA', 'faderB'] },
      { ch: 3, etape: 'Erreur n° 1', dit: 'Tu coupes A 2 temps trop tôt. Écoute :', seg: [116, 136, 'tot'], badge: 'rate', pose: { sueur: true } },
      { ch: 3, etape: 'Erreur n° 1', dit: 'Un trou ! La salle l’a entendu. Les deux mains en même temps. La bonne :', seg: [116, 136], badge: 'ok' },
      { ch: 3, etape: 'Erreur n° 2', dit: 'Tu coupes A 2 temps trop tard. Écoute :', seg: [116, 136, 'tard'], badge: 'rate', pose: { sueur: true } },
      { ch: 3, etape: 'Erreur n° 2', dit: 'A a mordu sur le drop de B. Sur le 1, pile. La bonne :', seg: [116, 136], badge: 'ok' },
      { ch: 4, dit: 'Bravo, tu connais la coupure sèche !', fin: true }
    ],
    retenir: ['**Sur le 1** : A en bas, B en haut, en même temps.', 'Lance B pour que **son drop tombe pile** à la fin de A.', 'Ni **trou**, ni **chevauchement**.']
  },
  // ---------- Les effets (lot 58) : paire « july » (« Luxury Life » puis « House - July ») ; A coupé au temps 128 ----------
  {
    id: 'echo', famille: 'effets', titre: "L'écho out", gratuit: true, duree: '3 min', musique: 'july',
    resume: 'La dernière mesure de A rebondit en échos, pendant que le drop de B arrive dessous.',
    vue: [56, 144], etat: 126,
    versions: {
      bon: { A: tuLux(TU_ECHO_A), B: tuJuly(TU_EFFET_B) },
      sec: { A: tuLux({ marques: [[128, 'FADER ↓']] }), B: tuJuly(TU_EFFET_B), alerte: [128, "↑ A s'arrête net"] },
      tot: { A: tuLux(Object.assign({}, TU_ECHO_A, { fx: [[112, 136, 'echo']], marques: [[112, 'ÉCHO'], [128, 'FADER ↓']] })), B: tuJuly(TU_EFFET_B), alerte: [112, '↑ A se noie dans ses échos'] }
    },
    plans: [
      { ch: 0, dit: TU_ECOUTE },
      { ch: 0, dit: 'Écoute… et suis le trait blanc sur la piste.', seg: [104, 144] },
      { ch: 0, dit: "Tu as entendu ? A ne s'est pas arrêté net : sa dernière mesure a rebondi en échos, et le drop de B est arrivé dessous. C'est l'écho out.", pose: { bras: 'pouce', yeux: 'clin' } },
      { ch: 1, dit: "L'écho répète le son, de plus en plus bas, comme dans la montagne. Il continue même quand le fader de A est en bas." },
      { ch: 1, dit: "L'écho out fait partir A en douceur, surtout quand B arrive avec un gros drop.", focus: 'phrases', note: "Sur la table : l'effet ECHO du BEAT FX, réglé sur 3/4 de temps" },
      { ch: 2, dit: 'Lance B au casque, 64 temps avant la fin de A : son drop tombera pile à la fin.', seg: [60, 72], revele: 64, cibles: ['playB', 'casqueB'] },
      { ch: 2, dit: 'Au début de la dernière phrase de A, monte doucement le fader de B.', seg: [92, 116], revele: 92, cibles: ['faderB'] },
      { ch: 2, dit: "Sur la dernière mesure de A, allume l'écho : les 4 derniers temps rebondissent.", seg: [116, 128], revele: 116, cibles: ['echo'] },
      { ch: 2, dit: "Sur le 1, baisse A d'un coup. Laisse l'écho allumé : il continue tout seul, sous le drop de B.", seg: [120, 140], revele: 120, cibles: ['faderA'] },
      { ch: 2, dit: 'Quand les échos se sont éteints, tu peux éteindre l’effet.', revele: 140, cibles: ['echo'] },
      { ch: 3, etape: 'Erreur n° 1', dit: "Sans écho, A s'arrête net. Écoute :", seg: [116, 136, 'sec'], badge: 'rate', pose: { sueur: true } },
      { ch: 3, etape: 'Erreur n° 1', dit: "Ça coupe, c'est sec. Avec l'écho :", seg: [116, 136], badge: 'ok' },
      { ch: 3, etape: 'Erreur n° 2', dit: "Tu allumes l'écho 3 mesures trop tôt. Écoute :", seg: [104, 136, 'tot'], badge: 'rate', pose: { sueur: true } },
      { ch: 3, etape: 'Erreur n° 2', dit: 'A se noie dans ses répétitions avant même la fin : c’est brouillon. Une seule mesure suffit. La bonne :', seg: [104, 136], badge: 'ok' },
      { ch: 4, dit: "Bravo, tu connais l'écho out !", fin: true }
    ],
    retenir: ["L'écho sur **la dernière mesure** de A, pas avant.", "Sur le 1, **A en bas** : l'écho continue tout seul.", "Tu éteins l'écho **quand les répétitions se sont tues**."]
  },
  {
    id: 'reverbe', famille: 'effets', titre: 'La sortie dans la réverbe', duree: '3 min', musique: 'july',
    resume: 'A s’envole dans un nuage de réverbe, et le drop de B arrive pendant qu’il s’éteint.',
    vue: [56, 144], etat: 126,
    versions: {
      bon: { A: tuLux(TU_REVERBE_A), B: tuJuly(TU_EFFET_B) },
      eteint: { A: tuLux(Object.assign({}, TU_REVERBE_A, { fx: [[120, 128, 'reverb']], marques: [[120, 'RÉVERBE'], [128, 'FADER ↓'], [128, 'RÉVERBE off']] })), B: tuJuly(TU_EFFET_B), alerte: [128, "↑ la réverbe s'est coupée avec A"] },
      trop: { A: tuLux(Object.assign({}, TU_REVERBE_A, { fx: [[104, 138, 'reverb']], marques: [[104, 'RÉVERBE'], [128, 'FADER ↓']] })), B: tuJuly(TU_EFFET_B), alerte: [104, '↑ tout devient flou, trop tôt'] }
    },
    plans: [
      { ch: 0, dit: TU_ECOUTE },
      { ch: 0, dit: 'Écoute… et suis le trait blanc sur la piste.', seg: [104, 144] },
      { ch: 0, dit: "Tu as entendu ? A s'est envolé dans un nuage, comme dans une immense salle, pendant que B arrivait. C'est la sortie dans la réverbe.", pose: { bras: 'pouce', yeux: 'clin' } },
      { ch: 1, dit: "La réverbe, c'est le son d'une grande salle : il ne se répète pas comme l'écho, il s'étale et s'éteint doucement." },
      { ch: 1, dit: 'Elle fait disparaître A dans un souffle : parfait quand B commence par un gros drop.', note: "Sur la table : l'effet REVERB du BEAT FX" },
      { ch: 2, dit: 'Lance B au casque, 64 temps avant la fin de A : son drop tombera pile à la fin.', seg: [60, 72], revele: 64, cibles: ['playB', 'casqueB'] },
      { ch: 2, dit: 'Au début de la dernière phrase de A, monte doucement le fader de B.', seg: [92, 116], revele: 92, cibles: ['faderB'] },
      { ch: 2, dit: '2 mesures avant la fin de A, allume la réverbe.', seg: [112, 128], revele: 112, cibles: ['reverb'] },
      { ch: 2, dit: 'Sur le 1, baisse A. La réverbe continue de résonner : laisse-la allumée !', seg: [120, 142], revele: 120, cibles: ['faderA'] },
      { ch: 3, etape: 'Erreur n° 1', dit: 'Tu éteins la réverbe en même temps que tu baisses A. Écoute :', seg: [116, 138, 'eteint'], badge: 'rate', pose: { sueur: true } },
      { ch: 3, etape: 'Erreur n° 1', dit: "Le nuage a disparu d'un coup : c'est comme couper net. Laisse l'effet allumé. La bonne :", seg: [116, 138], badge: 'ok' },
      { ch: 3, etape: 'Erreur n° 2', dit: 'Tu allumes la réverbe 4 mesures trop tôt. Écoute :', seg: [100, 132, 'trop'], badge: 'rate', pose: { sueur: true } },
      { ch: 3, etape: 'Erreur n° 2', dit: 'A devient flou bien avant la fin : on ne comprend plus rien. 2 mesures suffisent. La bonne :', seg: [100, 132], badge: 'ok' },
      { ch: 4, dit: 'Bravo, tu sais sortir dans la réverbe !', fin: true }
    ],
    retenir: ['La réverbe sur les **2 dernières mesures** de A.', 'Sur le 1, **A en bas**, mais la réverbe **reste allumée**.', 'Tu l’éteins **quand le nuage s’est éteint**.']
  },
  {
    id: 'filtre', famille: 'effets', titre: 'Le filtre qui ouvre', duree: '3 min', musique: 'july',
    resume: 'B entre tout fin, juste ses aigus, et s’ouvre petit à petit jusqu’à son drop. A, lui, se referme.',
    vue: [56, 144], etat: 116,
    versions: {
      bon: { A: tuLux(TU_FILTRE_A), B: tuJuly(TU_FILTRE_B) },
      coup: { A: tuLux(TU_FILTRE_A), B: tuJuly(Object.assign({}, TU_FILTRE_B, { filtre: [[0, .8], [104, .8], [104.06, 0]], marques: [[96, 'FADER ↑'], [104, 'FILTRE ouvert']] })), alerte: [104, "↑ B s'ouvre d'un coup, trop tôt"] }
    },
    plans: [
      { ch: 0, dit: TU_ECOUTE },
      { ch: 0, dit: 'Écoute… et suis le trait blanc sur la piste.', seg: [88, 144] },
      { ch: 0, dit: "Tu as entendu ? B est arrivé tout fin, juste ses aigus, puis il s'est ouvert jusqu'à son drop. A, lui, s'est refermé. C'est la transition au filtre.", pose: { bras: 'pouce', yeux: 'clin' } },
      { ch: 1, dit: "Le filtre enlève une partie du son. Tourné à droite, il ne garde que les aigus : le morceau devient tout fin. À gauche, il ne garde que les graves : il devient sourd." },
      { ch: 1, dit: "Avec lui, B peut entrer tôt sans gêner A : il est trop fin pour se battre avec lui.", note: 'Le filtre au milieu = le son normal' },
      { ch: 2, dit: 'Avant de lancer B, tourne son filtre presque tout à droite. Puis lance-le au casque.', seg: [60, 72], revele: 64, cibles: ['filtreB', 'playB'] },
      { ch: 2, dit: "Au début de la dernière phrase de A, monte le fader de B : on n'entend que ses aigus.", seg: [92, 108], revele: 92, cibles: ['faderB'] },
      { ch: 2, dit: 'Pendant toute la phrase, ramène doucement le filtre de B vers le milieu.', seg: [100, 124], revele: 100, cibles: ['filtreB'] },
      { ch: 2, dit: 'Sur les 16 derniers temps, tourne le filtre de A vers la gauche : il s’assourdit. Sur le 1, baisse-le.', seg: [110, 140], revele: 110, cibles: ['filtreA', 'faderA'] },
      { ch: 3, etape: "L'erreur", dit: "Tu ouvres le filtre de B d'un coup, sans attendre la fin de la phrase. Écoute :", seg: [96, 124, 'coup'], badge: 'rate', pose: { sueur: true } },
      { ch: 3, etape: "L'erreur", dit: 'B débarque en entier, trop tôt, et se bat avec A. Tourne doucement, sur toute la phrase. La bonne :', seg: [96, 124], badge: 'ok' },
      { ch: 4, dit: 'Bravo, tu sais faire entrer un morceau au filtre !', fin: true }
    ],
    retenir: ['B entre **filtré** : seulement ses aigus.', 'Tu l’**ouvres doucement**, sur toute la dernière phrase de A.', 'A se **referme** pendant ce temps, puis il part sur le 1.']
  }
];
// dans l'ordre où on les apprend (lot 58) : les gestes de base, puis les effets, puis les boucles
const TU_FAMILLES = [
  { id: 'volume', titre: 'Le volume et les basses', resume: 'Le fader, le swap des basses, les 3 bandes, la coupure : les transitions de base, faites proprement.' },
  { id: 'effets', titre: 'Les effets', resume: "L'écho, la réverbe, le filtre : faire partir un morceau en douceur, en faire entrer un autre." },
  { id: 'boucles', titre: 'Les boucles', resume: 'IN, OUT, EXIT et ½X : faire attendre un morceau, en prolonger un autre, faire monter la tension, rattraper un retard.' }
];
const tuDansLOrdre = () => TU_FAMILLES.flatMap(f => TUTOS.filter(t => t.famille === f.id));
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
  bufs: {}, charge: {}, sortie: null, noeuds: [], srcs: [], son: null, raf: 0
};
// coach-tutos : { vus: [tutos vus jusqu'au bout] } (l'ancien `vol`, volume du lecteur, n'est plus lu depuis le lot 60 :
// le volume est celui du site, coach-volume)
const TU_CLE = 'coach-tutos';
const tuLu = (() => { try { const d = JSON.parse(localStorage.getItem(TU_CLE)); return d && typeof d === 'object' ? d : {}; } catch (e) { return {}; } })();
let tuVus = Array.isArray(tuLu.vus) ? tuLu.vus.filter(id => TUTOS.some(t => t.id === id)) : [];
const tuGarde = () => { try { localStorage.setItem(TU_CLE, JSON.stringify({ vus: tuVus })); } catch (e) {} };
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
// Le son d'une platine, après le fader : LOW, MID, HI (1 = normal, 0 = coupé), le filtre (0 = neutre, vers 1 il ne garde que
// les aigus, vers -1 que les graves), et les effets envoyés après le fader, qui résonnent encore quand le fader est coupé
// (comme l'écho des niveaux, audio.js : 3/4 de temps, réinjecté à 58 %), tant que l'effet reste allumé.
const TU_EQ_COUPE = 26;   // un potard tout à gauche : -26 dB
const tuEq = (s, bande, x) => s.eq && s.eq[bande] ? tuInterp(s.eq[bande], x) : 1;
const tuFiltre = (s, x) => s.filtre ? tuInterp(s.filtre, x) : 0;
const tuFx = (s, type, x) => s.fx.some(([a, z, t]) => t === type && x >= a && x < z);
const tuPasseHaut = v => v > 0 ? 20 * Math.pow(400, v) : 20;            // vers 8 kHz : il ne reste que les aigus
const tuPasseBas = v => v < 0 ? 20000 * Math.pow(1 / 200, -v) : 20000;   // vers 100 Hz : il ne reste que les graves
let tuIr = null;
// La réverbe : une salle de 3 secondes (du bruit qui s'éteint, un peu plus vite dans les aigus)
function tuReverbe(){
  if (!tuIr){
    const n = Math.round(ac.sampleRate * 3.2); tuIr = ac.createBuffer(2, n, ac.sampleRate);
    for (let c = 0; c < 2; c++){
      const d = tuIr.getChannelData(c); let lp = 0;
      for (let i = 0; i < n; i++){ const t = i / ac.sampleRate, w = Math.random() * 2 - 1; lp += .35 * (w - lp); d[i] = (.7 * lp + .3 * w * Math.exp(-t * 1.5)) * Math.exp(-t * 1.6) * .5; }
    }
  }
  const cv = ac.createConvolver(); cv.buffer = tuIr; return cv;
}
function tuSonStop(){
  tu.srcs.forEach(s => { try { s.stop(); } catch (e) {} });
  tu.srcs = []; tu.son = null;
  // un graphe neuf à chaque passage : les queues d'écho et de réverbe d'avant s'arrêtent net
  tu.noeuds.forEach(n => { try { n.disconnect(); } catch (e) {} });
  tu.noeuds = [];
}
function tuSonJoue([de, a, vNom = 'bon']){
  tuSonStop(); ensureAudio();
  if (!tu.sortie){ tu.sortie = ac.createGain(); tu.sortie.connect(master); tuVolumeApplique(); }   // → niveau des tutos → sortie du site (volume du site)
  const v = tu.t.versions[vNom], t0 = ac.currentTime + .1, T = x => t0 + (x - de) * TU_BEAT, nd = n => (tu.noeuds.push(n), n);
  tu.son = { de, a, v: vNom, t0, tFin: t0 + (a - de) * TU_BEAT };
  // les effets, partagés par les deux platines (un seul est allumé à la fois, comme le BEAT FX de la table)
  // la réverbe (une convolution de 3,2 s) n'est fabriquée que si la version s'en sert : sur un téléphone lent, elle coûte
  const avecRev = [v.A, v.B].some(s => s.fx.some(f => f[2] === 'reverb'));
  const delay = nd(ac.createDelay(4)), fb = nd(ac.createGain()), echoSort = nd(ac.createGain()), rev = avecRev ? nd(tuReverbe()) : null, revSort = nd(ac.createGain());
  delay.delayTime.value = TU_BEAT * .75; fb.gain.value = .58; echoSort.gain.value = .85; revSort.gain.value = 1;
  delay.connect(fb); fb.connect(delay); delay.connect(echoSort); echoSort.connect(tu.sortie); if (rev){ rev.connect(revSort); revSort.connect(tu.sortie); }
  const fxOn = (type, x) => tuFx(v.A, type, x) || tuFx(v.B, type, x);
  // une valeur par seizième de temps ; une commande qui ne bouge pas pendant le passage ne reçoit qu'une valeur
  const pas = (param, f) => {
    const xs = []; for (let x = de; x <= a + 1e-9; x += 1 / 16) xs.push(x);
    const vs = xs.map(f); param.cancelScheduledValues(0); param.setValueAtTime(vs[0], t0);
    if (vs.some(u => u !== vs[0])) for (let n = 1; n < xs.length; n++) param.linearRampToValueAtTime(vs[n], T(xs[n]));
  };
  for (const k of ['A', 'B']){
    const s = v[k], buf = tu.bufs[s.m];
    const g = nd(ac.createGain()), lo = nd(ac.createBiquadFilter()), mi = nd(ac.createBiquadFilter()), hi = nd(ac.createBiquadFilter());
    const hp = nd(ac.createBiquadFilter()), lp = nd(ac.createBiquadFilter()), envE = nd(ac.createGain()), envR = nd(ac.createGain());
    lo.type = 'lowshelf'; lo.frequency.value = 200; mi.type = 'peaking'; mi.frequency.value = 1000; mi.Q.value = .8; hi.type = 'highshelf'; hi.frequency.value = 3200;
    hp.type = 'highpass'; lp.type = 'lowpass'; hp.Q.value = .9; lp.Q.value = .9;
    g.connect(lo); lo.connect(mi); mi.connect(hi); hi.connect(hp); hp.connect(lp); lp.connect(tu.sortie);
    lp.connect(envE); envE.connect(delay); if (rev){ lp.connect(envR); envR.connect(rev); }
    // chaque saut de la boucle est un nouveau départ, au temps près, avec un fondu de 3 ms pour ne pas claquer
    for (const p of tuJoue(s, de, a).pieces){
      const src = ac.createBufferSource(), e = nd(ac.createGain()), t = T(p.x0), d = (p.x1 - p.x0) * TU_BEAT;
      src.buffer = buf; src.connect(e); e.connect(g);
      e.gain.setValueAtTime(0, t); e.gain.linearRampToValueAtTime(1, t + .003);
      e.gain.setValueAtTime(1, Math.max(t + .003, t + d - .003)); e.gain.linearRampToValueAtTime(0, t + d);
      src.start(t, p.b0 * TU_BEAT, d); tu.srcs.push(src);
    }
    // le fader, le casque, les potards, le filtre et les effets, point par point (un seizième de temps)
    pas(g.gain, x => tuNiv(s, x));
    pas(lo.gain, x => -TU_EQ_COUPE * (1 - tuEq(s, 'low', x)));
    pas(mi.gain, x => -TU_EQ_COUPE * (1 - tuEq(s, 'mid', x)));
    pas(hi.gain, x => -TU_EQ_COUPE * (1 - tuEq(s, 'hi', x)));
    pas(hp.frequency, x => tuPasseHaut(tuFiltre(s, x)));
    pas(lp.frequency, x => tuPasseBas(tuFiltre(s, x)));
    pas(envE.gain, x => tuFx(s, 'echo', x) ? 1 : 0);
    pas(envR.gain, x => tuFx(s, 'reverb', x) ? .8 : 0);
  }
  // éteindre l'effet coupe aussi sa queue (comme le BEAT FX : une erreur fréquente, montrée dans « La sortie dans la réverbe »)
  pas(echoSort.gain, x => fxOn('echo', x) ? .85 : 0);
  pas(revSort.gain, x => fxOn('reverb', x) ? 1 : 0);
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
// Le timbre d'une platine sur la piste (lot 58) : basses coupées, filtrée
const tuTimbre = (s, x) => (tuEq(s, 'low', x) < .5 ? 'sb' : '') + (Math.abs(tuFiltre(s, x)) > .3 ? 'f' : '');
// Une voie de la piste : ce qu'on entend de la platine, coupé aux parties du morceau, aux boucles, au fader et au timbre ;
// après un effet, sa queue (l'écho ou la réverbe qui résonne encore, fader coupé)
function tuVoie(k, s, revele){
  const parts = TU_PARTIES[s.m], fin = Math.min(revele, tu.X1);
  let h = '';
  for (const p of tuJoue(s, tu.X0, fin).pieces){
    const cuts = new Set([p.x0, p.x1]);
    for (const [b0, b1] of parts) for (const bb of [b0, b1]){ const xx = p.x0 + bb - p.b0; if (xx > p.x0 + 1e-6 && xx < p.x1 - 1e-6) cuts.add(xx); }
    let prec = tuEcoute(s, p.x0) + tuTimbre(s, p.x0);
    for (let xx = Math.ceil(p.x0 * 4) / 4; xx < p.x1; xx += .25){ const e = tuEcoute(s, xx) + tuTimbre(s, xx); if (e !== prec){ cuts.add(xx); prec = e; } }
    const c = [...cuts].sort((u, w) => u - w);
    for (let n = 0; n < c.length - 1; n++){
      const a = c[n], z = c[n + 1], m = (a + z) / 2, ecoute = tuEcoute(s, m);
      if (!ecoute) continue;
      const bm = p.b0 + (m - p.x0), part = parts.find(([b0, b1]) => bm >= b0 && bm < b1) || parts[parts.length - 1];
      const tb = tuTimbre(s, m), sb = tb.includes('sb'), fi = tb.includes('f');
      const txt = p.boucle ? (p.rep ? '↺ la boucle repart' : 'boucle') : ecoute === 'casque' ? k + ' au casque' : part[2] + (sb ? ' · sans basses' : fi ? ' · filtré' : '');
      h += tuBloc(`tu-${k.toLowerCase()}${part[3] ? ' fort' : ''}${p.boucle ? ' boucle' : ''}${ecoute === 'casque' ? ' casque' : ''}${sb ? ' maigre' : ''}${fi ? ' filtre' : ''}`, a, z, txt);
    }
  }
  // la queue : de l'instant où le fader est coupé jusqu'à ce que l'effet soit éteint
  for (const [a, z, type] of s.fx){
    let xc = null; for (let xx = a; xx < z; xx += .25) if (tuInterp(s.niv, xx) < .05){ xc = xx; break; }
    if (xc !== null && xc < fin) h += tuBloc(`tu-${k.toLowerCase()} queue`, xc, Math.min(z, fin), type === 'echo' ? 'écho…' : 'réverbe…');
  }
  return h;
}
const TU_MARQUE = { in: 'IN', out: 'OUT', exit: 'EXIT', moitie: '½X' };
function tuMarques(v, revele, pop){
  let h = '';
  const proche = Math.max(3.5, (tu.X1 - tu.X0) * .085);   // une étiquette fait environ 8 % de la piste
  for (const k of ['A', 'B']){
    const s = v[k], liste = s.evts.map(([x, t]) => [x, TU_MARQUE[t]]).concat(s.marques.map(([x, t]) => [x, t]));
    if (s.debut > tu.X0) liste.push([s.debut, 'PLAY']);
    liste.sort((p, q) => p[0] - q[0]);
    let der = -1e9, haut = false;
    for (const [x, t] of liste){
      if (x < tu.X0 || x > tu.X1 || x > revele + 1e-6) continue;
      haut = x - der < proche ? !haut : false; der = x;   // deux repères trop proches : le second monte d'un cran
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
  // un potard : son aiguille tourne (tuMajTable)
  const potard = (c, x, y) => `<g class="tu-c" data-c="${c}"><circle class="tu-cible" cx="${x}" cy="${y}" r="20"/><circle class="tu-forme" cx="${x}" cy="${y}" r="14"/><g class="tu-aig"><line x1="${x}" y1="${y - 3}" x2="${x}" y2="${y - 13}"/></g></g>`;
  const fader = (c, x) => `<g class="tu-c" data-c="${c}"><rect class="tu-cible" x="${x - 26}" y="230" width="52" height="82" rx="12"/><rect class="tu-rail" x="${x - 3}" y="238" width="6" height="64" rx="3"/><g class="tu-cap"><rect x="${x - 17}" y="-7" width="34" height="14" rx="3"/><line x1="${x - 12}" y1="0" x2="${x + 12}" y2="0"/></g></g>`;
  const casque = (c, x) => `<g class="tu-c" data-c="${c}"><rect class="tu-cible" x="${x - 25}" y="199" width="50" height="30" rx="10"/><rect class="tu-forme" x="${x - 20}" y="204" width="40" height="20" rx="6"/><path class="tu-casque" d="M${x - 6} 218 v-2 a6 6 0 0 1 12 0 v2 M${x - 7} 216 v4 M${x + 7} 216 v4"/></g>`;
  // une platine (le curseur TEMPO, jamais utilisé dans un tuto, n'est plus dessiné : sa place va à la table de mixage)
  const platine = (k, ox) => {
    let sillons = '';
    for (let r = 34; r <= 54; r += 7) sillons += `<circle class="tu-sillon" cx="172" cy="138" r="${r}"/>`;
    return `<g transform="translate(${ox} 36)"><text class="tu-lettre tu-let-${k.toLowerCase()}" x="26" y="44">${k}</text><text class="tu-pet" x="186" y="20">LOOP</text>
  ${bouton('in' + k, 92, 28, 44, 'IN')}${bouton('out' + k, 140, 28, 44, 'OUT')}${bouton('exit' + k, 188, 28, 44, 'EXIT')}${bouton('moitie' + k, 236, 28, 44, '½X')}
  <g class="tu-c" data-c="jog${k}"><circle class="tu-jog" cx="172" cy="138" r="68"/><circle class="tu-anneau" cx="172" cy="138" r="62"/>${sillons}<circle class="tu-centre" cx="172" cy="138" r="22"/><g class="tu-rep"><line x1="172" y1="84" x2="172" y2="100"/></g></g>
  ${rond('cue' + k, 50, 214, 'CUE')}${rond('play' + k, 102, 214, '▶❙❙')}</g>`;
  };
  // la table de mixage (lot 58) : HI, MID, LOW et FILTRE de chaque voie, le casque, les faders ; à droite le BEAT FX
  // (ÉCHO, RÉVERBE), à sa place sur la DDJ-FLX4
  const bandes = [['hi', 'HI', 66], ['mid', 'MID', 104], ['low', 'LOW', 142], ['filtre', 'FILTRE', 180]];
  return `<svg viewBox="0 0 960 320" role="img" aria-label="La table DJ : platine A, table de mixage, platine B">
<rect class="tu-corps-t" x="3" y="3" width="954" height="314" rx="26"/>${platine('A', 14)}
<rect class="tu-zone" x="316" y="14" width="328" height="298" rx="16"/>
<text class="tu-lettre tu-let-a" x="420" y="40" text-anchor="middle">A</text><text class="tu-lettre tu-let-b" x="530" y="40" text-anchor="middle">B</text>
${bandes.map(([c, nom, y]) => `${potard(c + 'A', 420, y)}<text class="tu-pet tu-pet-m" x="475" y="${y + 4}">${nom}</text>${potard(c + 'B', 530, y)}`).join('')}
<text class="tu-pet" x="600" y="62">BEAT FX</text>${bouton('echo', 568, 74, 64, 'ÉCHO')}${bouton('reverb', 568, 106, 64, 'RÉVERBE')}
${casque('casqueA', 420)}${casque('casqueB', 530)}${fader('faderA', 420)}${fader('faderB', 530)}${platine('B', 652)}</svg>`;
}
// Les commandes dont ce tuto se sert ; les autres sont éteintes
function tuCommandes(t){
  const c = new Set(['playA', 'playB', 'jogA', 'jogB', 'faderA', 'faderB']);
  for (const v of Object.values(t.versions)) for (const k of ['A', 'B']){
    const s = v[k];
    for (const [, type] of s.evts) c.add(type + k);
    if (s.casque.length) c.add('casque' + k);
    if (s.eq) Object.keys(s.eq).forEach(b => c.add(b + k));
    if (s.filtre) c.add('filtre' + k);
    s.fx.forEach(([, , type]) => c.add(type));
  }
  t.plans.forEach(p => (p.cibles || []).forEach(x => c.add(x)));
  return c;
}
// L'aiguille d'un potard : LOW, MID, HI à midi quand ils sont normaux, tout à gauche coupés ; le filtre à midi au neutre
function tuAiguille(c, angle){
  const g = tuCtl(c), circ = g && g.querySelector('.tu-forme');
  if (!circ) return;
  g.querySelector('.tu-aig').setAttribute('transform', `rotate(${angle.toFixed(1)} ${circ.getAttribute('cx')} ${circ.getAttribute('cy')})`);
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
    for (const b of ['hi', 'mid', 'low']){ const u = tuEq(s, b, x); tuAiguille(b + k, -135 * (1 - u)); tuCl(b + k, 'coupe-' + l, u < .5); }
    const f = tuFiltre(s, x); tuAiguille('filtre' + k, 135 * f); tuCl('filtre' + k, 'coupe-' + l, Math.abs(f) > .15);
    const cap = tuCtl('fader' + k).querySelector('.tu-cap');
    cap.setAttribute('transform', `translate(0 ${(302 - tuInterp(s.niv, x) * 64).toFixed(1)})`);
    if (joue) tu.angle[k] = e.b * TU_BEAT * 200;   // un disque à 33 tours ⅓ : 200 degrés par seconde
    tuCtl('jog' + k).querySelector('.tu-rep').setAttribute('transform', `rotate(${(tu.angle[k] % 360).toFixed(1)} 172 138)`);
  }
  for (const type of ['echo', 'reverb']){ tuCl(type, 'on-a', tuFx(v.A, type, x)); tuCl(type, 'on-b', tuFx(v.B, type, x)); }
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
  const t = tu.t, ordre = tuDansLOrdre(), apres = ordre[ordre.indexOf(t) + 1];   // dans l'ordre du catalogue, d'une famille à l'autre
  $('tuRetenirListe').innerHTML = t.retenir.map(r => `<li><span>${tuTypo(r).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>')}</span></li>`).join('');
  $('tuSuivant').hidden = !apres;
  if (apres) $('tuSuivant').textContent = tuTypo(`Tuto suivant : ${apres.titre}`);
}

/* ---------- Ouvrir, fermer ---------- */
function tuOuvre(id){
  const t = TUTOS.find(x => x.id === id); if (!t) return;
  if (!proLibre(t)){ proOuvre(id); return; }   // un tuto Pro sans abonnement : la fenêtre DJingood Pro (pro.js)
  tuSonStop();
  tu.t = t; [tu.X0, tu.X1] = t.vue;
  $('tuCatalogue').hidden = true; $('tuLecteur').hidden = false;
  const fam = TU_FAMILLES.find(f => f.id === t.famille), dans = TUTOS.filter(x => x.famille === t.famille);
  $('tuTitre').textContent = t.titre;
  $('tuMusique').textContent = tuTypo('Musique : ' + TU_MUSIQUE[t.musique]);
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
/* Les vignettes du catalogue (lot 62) : un mot et un dessin du geste, dans le style de la fenêtre Pro (« Ce que tu
   débloques »). Avant, les cartes n'avaient que du texte (tour des écrans du lot 61, point F). Dessins en traits, 100 × 60. */
const TU_VIGNETTES = {
  fondu: ['FADER', '<path d="M6 14C40 14 60 46 94 46"/><path d="M6 46C40 46 60 14 94 14" opacity=".45"/>'],
  swap: ['BASSES', '<path d="M4 44c10-22 20 10 30-6s20 18 30-4 20 12 32-2"/><path d="M4 30h92" opacity=".25"/>'],
  bandes: ['3 BANDES', '<path d="M14 16h48M14 30h68M14 44h34"/><circle cx="70" cy="16" r="4"/><circle cx="90" cy="30" r="4"/><circle cx="56" cy="44" r="4"/>'],
  coupe: ['COUPURE', '<path d="M6 30h38"/><path d="M50 8v44"/><path d="M58 22h36v16H58z" opacity=".7"/>'],
  echo: ['ÉCHO', '<path d="M10 10v40M30 16v28M48 22v16M64 26v8M78 28v4"/>'],
  reverbe: ['RÉVERBE', '<circle cx="50" cy="30" r="8"/><circle cx="50" cy="30" r="17" opacity=".6"/><circle cx="50" cy="30" r="26" opacity=".3"/>'],
  filtre: ['FILTRE', '<path d="M4 50C30 50 40 10 60 10s30 0 36 0"/>'],
  attend: ['BOUCLE', '<path d="M30 18h40a12 12 0 0 1 0 24H30a12 12 0 0 1 0-24"/><path d="M62 12l8 6-8 6"/>'],
  prolonge: ['BOUCLE', '<path d="M6 30h22" opacity=".45"/><path d="M34 20h18a10 10 0 0 1 0 20H34a10 10 0 0 1 0-20"/><path d="M62 20h18a10 10 0 0 1 0 20H62a10 10 0 0 1 0-20" opacity=".6"/>'],
  montee: ['MONTÉE', '<path d="M8 50h16v-8h16v-8h16v-8h16v-8h16"/><path d="M78 10l10 8" opacity=".45"/>'],
  secours: ['SECOURS', '<circle cx="50" cy="30" r="20"/><circle cx="50" cy="30" r="9"/><path d="M50 10v11M50 39v11M30 30h11M59 30h11"/>']
};
const tuVignette = id => { const v = TU_VIGNETTES[id]; return v ? `<span class="tu-vg" aria-hidden="true"><span class="tu-vg-mot">${v[0]}</span><svg viewBox="0 0 100 60">${v[1]}</svg></span>` : ''; };
function renderTutos(){
  if (tu.phase !== 'ferme') return;
  $('tuFamilles').innerHTML = TU_FAMILLES.map(f => {
    const liste = TUTOS.filter(t => t.famille === f.id);
    return `<section class="tu-famille"><h2>${f.titre}</h2><p class="tu-fam-resume">${tuTypo(f.resume)}</p><div class="cards tu-cartes">${liste.map(t => {
      const vu = tuVus.includes(t.id), etiquette = vu ? 'Vu' : t.gratuit ? 'Gratuit' : 'Pro', ferme = !proLibre(t);
      const cadenas = ferme ? '<svg class="tu-cadenas" viewBox="0 0 24 24" aria-label="Avec DJingood Pro"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>' : '';
      return `<button type="button" class="card tu-carte${vu ? ' tu-vu' : ''}${ferme ? ' tu-ferme' : ''}" data-tu="${t.id}">${tuVignette(t.id)}<span class="soon tu-etiq${vu ? ' ok' : t.gratuit ? '' : ' pro'}">${etiquette}</span>${cadenas}<strong>${tuTypo(t.titre)}</strong><p>${tuTypo(t.resume)}</p><span class="tu-duree">${t.duree} · avec Vini</span></button>`;
    }).join('')}</div></section>`;
  }).join('');
  $('tuFamilles').querySelectorAll('[data-tu]').forEach(b => b.addEventListener('click', () => tuOuvre(b.dataset.tu)));
  // le bandeau de DJingood Pro (pro.js) : seulement quand Pro est allumé et qu'on n'est pas abonné
  const fermes = TUTOS.filter(t => !proLibre(t)).length;
  $('proBandeau').hidden = !fermes;
  $('proBandeauTxt').textContent = `Les ${fermes} autres, et un nouveau chaque mois, sont dans DJingood Pro.`;
  const reste = tuDansLOrdre().filter(t => !tuVus.includes(t.id));
  viniDit('tutos', tuTypo(!tuVus.length ? `Ici, je t'explique les techniques des DJ, une par une. Commence par « ${reste[0].titre} » !`
    : reste.length ? `Prochain tuto conseillé : « ${reste[0].titre} ».` : 'Tu as vu tous les tutos. Bravo !'), tuVus.length && !reste.length ? 'danse' : 'calme');
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
$('tuSuivant').addEventListener('click', () => { const ordre = tuDansLOrdre(), apres = ordre[ordre.indexOf(tu.t) + 1]; if (apres) tuOuvre(apres.id); });   // l'ordre du catalogue (gardien du lot 58)
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
   Une glissière et un haut-parleur, comme sous une vidéo (demande de l'utilisateur, 7 nov. 2026). Depuis le lot 60, la
   glissière règle le volume de TOUT le site (volSite, js/audio.js), comme le haut-parleur de l'en-tête et « Mon compte » :
   c'est un curseur .volcurseur, que sons.js suit tout seul (volRend). Le haut-parleur du lecteur coupe et remet le son du
   site. TU_NIVEAU garde l'équilibre d'avant entre les tutos et les exercices (0,7 au carré : l'ancien réglage du lecteur). */
const TU_NIVEAU = .49;
const tuMuet = () => volSite === 0;
function tuVolumeApplique(){
  if (tu.sortie && ac) tu.sortie.gain.value = TU_NIVEAU;
  const b = $('tuMuet'), muet = tuMuet();
  b.setAttribute('aria-pressed', String(muet)); b.setAttribute('aria-label', muet ? 'Remettre le son' : 'Couper le son'); b.innerHTML = sonsIcone(!muet);
}
$('tuMuet').addEventListener('click', volMuetBascule);
tuVolumeApplique();
$('tabTutos').hidden = !tutosOn();
