// Vraie musique (lot 25) : de courts extraits de vrais morceaux à la place des morceaux fabriqués par le site.
// (Le bouton s'appelle « Vraie musique » : « Les vrais morceaux » est déjà le nom du chapitre 3.)
// Tous les fichiers de js/ partagent la même portée et sont chargés dans l'ordre indiqué dans index.html.
// Les extraits (musique/*.mp3) sont fabriqués par tests/musique-pixabay.js : coupés pile sur un temps, ramenés à 124 BPM
// sans changer leur hauteur, même volume. A = 136 temps avec des basses ; B = 64 temps d'intro puis le drop (B0), ou des
// basses dès le début (B1). Morceaux de Pixabay choisis par l'utilisateur (lot 57, 8 nov. 2026, à la place de Play House,
// « Dj » ne lui plaisait plus) ; chaque mélange reste dans des tonalités qui vont ensemble : fa majeur et ré mineur pour le
// premier, la mineur et ré mineur pour le second, la mineur pour le troisième. « Deep House Instrumental » sert de B0 au
// second mélange avec le même extrait que les tutos (tuto-instru-b : son break, puis son drop de 1:32), « Fashion Diva
// House » de B1 au second et au troisième.
'use strict';
/* ---------- Vrais morceaux ---------- */
const VRAIS = [
  { A: 'niv-deep-a', B0: 'niv-ambient-b', B1: 'niv-instru-b1' },
  { A: 'niv-luxury-a', B0: 'tuto-instru-b', B1: 'niv-diva-b1' },
  { A: 'niv-filter-a', B0: 'niv-july-b', B1: 'niv-diva-b1' }
];
const VRAIS_TITRES = {
  'niv-deep-a': 'Deep House', 'niv-ambient-b': 'Ambient House', 'niv-instru-b1': 'Deep House Instrumental',
  'niv-luxury-a': 'Luxury Life', 'tuto-instru-b': 'Deep House Instrumental', 'niv-diva-b1': 'Fashion Diva House',
  'niv-filter-a': 'Filter House', 'niv-july-b': 'House - July'
};
const vraiOf = (vr, part) => VRAIS[((vr % VRAIS.length) + VRAIS.length) % VRAIS.length][part];
// Décodage sans attendre un clic : un contexte hors ligne suffit, le morceau décodé se joue ensuite dans le vrai
let vraiCtx = null;
function vraiDecode(data){
  if (!vraiCtx) vraiCtx = new (window.OfflineAudioContext || window.webkitOfflineAudioContext)(2, 1, 44100);
  return new Promise((res, rej) => { const r = vraiCtx.decodeAudioData(data, res, rej); if (r && r.catch) r.catch(() => {}); });
}
// Ralenti du chapitre 4 : le morceau est rejoué plus lentement, comme un disque (il descend un peu dans les graves)
function vraiSlow(buf, spd){
  const C = window.OfflineAudioContext || window.webkitOfflineAudioContext, oc = new C(2, Math.ceil(buf.length / spd), buf.sampleRate);
  const s = oc.createBufferSource(); s.buffer = buf; s.playbackRate.value = spd; s.connect(oc.destination); s.start();
  return new Promise((res, rej) => { oc.oncomplete = e => res(e.renderedBuffer); const r = oc.startRendering(); if (r && r.then) r.then(res, rej); });
}
// Un vrai morceau, prêt à jouer ({ buf }) ; s'il ne se charge pas (hors ligne, fichier absent), la house du site (panne: true)
function vraiSong(vr, part, spd = 1){
  const name = vraiOf(vr, part);
  return fetch('musique/' + name + '.mp3')
    .then(r => { if (!r.ok) throw quiet('musique ' + r.status); return r.arrayBuffer(); })
    .then(vraiDecode).then(buf => spd === 1 ? buf : vraiSlow(buf, spd)).then(buf => ({ buf, name }))
    .catch(() => songSafe('house', vr, part, spd).then(s => ({ L: s.L, R: s.R, N: s.N, panne: true })));
}
// Ce qui passe sur les deux platines, pour l'étiquette du niveau
const vraiTitres = (vr, bBass) => `« ${VRAIS_TITRES[vraiOf(vr, 'A')]} » puis « ${VRAIS_TITRES[vraiOf(vr, bBass ? 'B1' : 'B0')]} » · Pixabay`;
