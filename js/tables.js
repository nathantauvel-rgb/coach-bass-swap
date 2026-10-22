// Fiches de table (lot 38) : les tables de débutant que DJingood reconnaît toutes seules, sans réglage pas à pas.
// Tous les fichiers de js/ partagent la même portée et sont chargés dans l'ordre indiqué dans index.html.
// Chargé avant midi.js, qui s'en sert dès le chargement (validation de coach-table).
'use strict';
/* ---------- Les fiches ----------
   Une fiche = une table : son nom affiché, `re` pour la reconnaître au nom que le navigateur donne à son port MIDI,
   et `cmd`, le message envoyé par chaque commande : [canal (0 à 15), numéro]. Potards et faders envoient des messages
   de potard (CC), PLAY et ON de l'effet des notes. Une commande absente de `cmd` se fait à l'écran (comme pour une table
   réglée pas à pas sans cette commande).
   `plus` : les commandes de la table complète (lot 39 : aigus, TRIM, filtre de B, crossfader, tempo, CUE, CUE casque),
   reprises par modeleMap. Molettes et pads ne sont branchés que sur la FLX4 (flx4Plus dans midi.js) : à l'écran ailleurs.
   D'où viennent les numéros : des correspondances de la communauté du logiciel libre Mixxx (dossier res/controllers,
   relevées le 20 oct. 2026), recoupées entre tables d'une même marque. Ce sont des faits (quel bouton envoie quel
   message), pas du code repris. **Aucune de ces tables n'a été essayée en vrai** : `teste` passe à true quand un joueur
   l'a vérifiée avec « Vérifier ma table ». Sur les variantes « MK2 » ou « MKII », les numéros peuvent changer : elles ne
   sont pas reconnues (réglage pas à pas).
   La DDJ-FLX4 n'a pas de fiche ici : c'est la table de référence du site (DEFAULT_MAP dans midi.js), qui ne change pas. */
const MODELES = [
  // Pioneer DJ : même plan que la FLX4 (voie A sur le canal 1, voie B sur le canal 2, filtres sur le canal 7)
  { id: 'ddj400', nom: 'Pioneer DDJ-400', re: /DDJ-?400(?!\d)/i,
    cmd: { faderA: [0, 19], faderB: [1, 19], lowA: [0, 15], lowB: [1, 15], midA: [0, 11], midB: [1, 11], cfxA: [6, 23], playA: [0, 11], playB: [1, 11], fxOn: [4, 71] },
    plus: { hiA: [0, 7], hiB: [1, 7], trimA: [0, 4], trimB: [1, 4], cfxB: [6, 24], xfader: [6, 31], tempoA: [0, 0], tempoB: [1, 0], cueA: [0, 12], cueB: [1, 12], pflA: [0, 84], pflB: [1, 84] } },
  { id: 'ddjsb3', nom: 'Pioneer DDJ-SB3', re: /DDJ-?SB3/i,
    cmd: { faderA: [0, 19], faderB: [1, 19], lowA: [0, 15], lowB: [1, 15], midA: [0, 11], midB: [1, 11], cfxA: [6, 23], playA: [0, 11], playB: [1, 11], fxOn: [4, 71] },
    plus: { hiA: [0, 7], hiB: [1, 7], trimA: [0, 4], trimB: [1, 4], cfxB: [6, 24], xfader: [6, 31], tempoA: [0, 0], tempoB: [1, 0], cueA: [0, 12], cueB: [1, 12], pflA: [0, 84], pflB: [1, 84] } },
  { id: 'ddj200', nom: 'Pioneer DDJ-200', re: /DDJ-?200(?!\d)/i,
    cmd: { faderA: [0, 19], faderB: [1, 19], lowA: [0, 15], lowB: [1, 15], midA: [0, 11], midB: [1, 11], cfxA: [6, 23], playA: [0, 11], playB: [1, 11] },
    plus: { hiA: [0, 7], hiB: [1, 7], cfxB: [6, 24], xfader: [6, 31], tempoA: [0, 0], tempoB: [1, 0], cueA: [0, 12], cueB: [1, 12], pflA: [0, 84], pflB: [1, 84] } },
  // Hercules : voie A sur le canal 2, voie B sur le canal 3. L'Inpulse 200 et la Starlight n'ont pas de MID.
  { id: 'inpulse200', nom: 'Hercules DJControl Inpulse 200', re: /Inpulse\s*200(?!\s*MK)/i,
    cmd: { faderA: [1, 0], faderB: [2, 0], lowA: [1, 2], lowB: [2, 2], cfxA: [1, 1], playA: [1, 7], playB: [2, 7] },
    plus: { hiA: [1, 4], hiB: [2, 4], trimA: [1, 5], trimB: [2, 5], cfxB: [2, 1], xfader: [0, 0], tempoA: [1, 8], tempoB: [2, 8], cueA: [1, 6], cueB: [2, 6], pflA: [1, 12], pflB: [2, 12] } },
  { id: 'inpulse300', nom: 'Hercules DJControl Inpulse 300', re: /Inpulse\s*300(?!\s*MK)/i,
    cmd: { faderA: [1, 0], faderB: [2, 0], lowA: [1, 2], lowB: [2, 2], midA: [1, 3], midB: [2, 3], cfxA: [1, 1], playA: [1, 7], playB: [2, 7] },
    plus: { hiA: [1, 4], hiB: [2, 4], trimA: [1, 5], trimB: [2, 5], cfxB: [2, 1], xfader: [0, 0], tempoA: [1, 8], tempoB: [2, 8], cueA: [1, 6], cueB: [2, 6], pflA: [1, 12], pflB: [2, 12] } },
  { id: 'inpulse500', nom: 'Hercules DJControl Inpulse 500', re: /Inpulse\s*500(?!\s*MK)/i,
    cmd: { faderA: [1, 0], faderB: [2, 0], lowA: [1, 2], lowB: [2, 2], midA: [1, 3], midB: [2, 3], cfxA: [1, 1], playA: [1, 7], playB: [2, 7] },
    plus: { hiA: [1, 4], hiB: [2, 4], trimA: [1, 5], trimB: [2, 5], cfxB: [2, 1], xfader: [0, 0], tempoA: [1, 8], tempoB: [2, 8], cueA: [1, 6], cueB: [2, 6], pflA: [1, 12], pflB: [2, 12] } },
  { id: 'starlight', nom: 'Hercules DJControl Starlight', re: /Starlight/i,
    cmd: { faderA: [1, 0], faderB: [2, 0], lowA: [1, 2], lowB: [2, 2], cfxA: [1, 1], playA: [1, 7], playB: [2, 7] },
    plus: { cfxB: [2, 1], xfader: [0, 0], tempoA: [1, 8], tempoB: [2, 8], cueA: [1, 6], cueB: [2, 6], pflA: [1, 12], pflB: [2, 12] } },
  // Numark (plan commun aux tables pensées pour Serato) : voie A sur le canal 1, voie B sur le canal 2
  { id: 'mixtrackplatinumfx', nom: 'Numark Mixtrack Platinum FX', re: /Mix\s*Track\s*Platinum\s*FX/i,
    cmd: { faderA: [0, 28], faderB: [1, 28], lowA: [0, 25], lowB: [1, 25], midA: [0, 24], midB: [1, 24], cfxA: [0, 26], playA: [0, 0], playB: [1, 0] },
    plus: { hiA: [0, 23], hiB: [1, 23], trimA: [0, 22], trimB: [1, 22], cfxB: [1, 26], xfader: [15, 8], tempoA: [0, 9], tempoB: [1, 9], cueA: [0, 1], cueB: [1, 1], pflA: [0, 27], pflB: [1, 27] } },
  { id: 'mixtrackprofx', nom: 'Numark Mixtrack Pro FX', re: /Mix\s*Track\s*Pro\s*FX/i,
    cmd: { faderA: [0, 28], faderB: [1, 28], lowA: [0, 25], lowB: [1, 25], midA: [0, 24], midB: [1, 24], cfxA: [0, 26], playA: [0, 0], playB: [1, 0] },
    plus: { hiA: [0, 23], hiB: [1, 23], trimA: [0, 22], trimB: [1, 22], cfxB: [1, 26], xfader: [15, 8], tempoA: [0, 9], tempoB: [1, 9], cueA: [0, 1], cueB: [1, 1], pflA: [0, 27], pflB: [1, 27] } },
  // La Party Mix n'a ni MID ni filtre ; ses aigus et ses basses sont décalés d'un numéro par rapport aux Mixtrack
  { id: 'partymix', nom: 'Numark Party Mix', re: /Party\s*Mix(?!\s*(MK|II|Live))/i,
    cmd: { faderA: [0, 28], faderB: [1, 28], lowA: [0, 25], lowB: [1, 25], playA: [0, 0], playB: [1, 0] },
    plus: { hiA: [0, 24], hiB: [1, 24], trimA: [0, 23], trimB: [1, 23], xfader: [15, 8], tempoA: [0, 9], tempoB: [1, 9], cueA: [0, 1], cueB: [1, 1], pflA: [0, 27], pflB: [1, 27] } },
  // La DJ2GO2 Touch n'a ni faders de voie ni égaliseur : presque tout se fait à l'écran
  { id: 'dj2go2touch', nom: 'Numark DJ2GO2 Touch', re: /DJ\s*2\s*GO\s*2/i,
    cmd: { playA: [0, 0], playB: [1, 0] },
    plus: { xfader: [15, 8], tempoA: [0, 9], tempoB: [1, 9], cueA: [0, 1], cueB: [1, 1], pflA: [0, 27], pflB: [1, 27] } },
  // Roland : même plan que les Numark
  { id: 'dj505', nom: 'Roland DJ-505', re: /DJ-?505/i,
    cmd: { faderA: [0, 28], faderB: [1, 28], lowA: [0, 25], lowB: [1, 25], midA: [0, 24], midB: [1, 24], cfxA: [0, 26], playA: [0, 0], playB: [1, 0] },
    plus: { hiA: [0, 23], hiB: [1, 23], trimA: [0, 22], trimB: [1, 22], cfxB: [1, 26], xfader: [15, 8], pflA: [0, 27], pflB: [1, 27] } },
  // Reloop : tout sur le canal 1. Son potard d'effet ne devient un filtre qu'avec SHIFT : pas de filtre ici.
  // Ses numéros (49 à 62) tombent là où d'autres tables envoient le « second message » d'un potard fin : `sansFin`
  // dit au site de ne pas les ignorer (apprentissage, « Ma table », « Vérifier ma table »).
  { id: 'mixage', nom: 'Reloop Mixage', re: /Mixage/i, sansFin: true,
    cmd: { faderA: [0, 56], faderB: [0, 62], lowA: [0, 55], lowB: [0, 61], midA: [0, 54], midB: [0, 60], playA: [0, 12], playB: [0, 26] },
    plus: { hiA: [0, 53], hiB: [0, 59], trimA: [0, 51], trimB: [0, 57], xfader: [0, 49], cueA: [0, 11], cueB: [0, 25], pflA: [0, 14], pflB: [0, 28] } }
];
MODELES.forEach(f => { f.teste = false; });
const modeleId = id => MODELES.find(f => f.id === id) || null;
// La fiche d'un nom de port MIDI (Windows ajoute parfois « 2- » devant : le motif cherche n'importe où dans le nom)
const modeleDe = name => MODELES.find(f => f.re.test(String(name))) || null;
// Les réglages d'une fiche, au format de coach-midi-map
// (avec `plus` : les commandes de la table complète, lot 39 ; celles que le site ne connaît pas sont écartées par cleanMap)
function modeleMap(f){ const out = {}; for (const [k, [ch, n]] of Object.entries(Object.assign({}, f.plus, f.cmd))) out[k] = { ch, n }; return out; }
