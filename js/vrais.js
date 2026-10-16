// Vraie musique (lot 25) : de courts extraits de vrais morceaux à la place des morceaux fabriqués par le site.
// (Le bouton s'appelle « Vraie musique » : « Les vrais morceaux » est déjà le nom du chapitre 3.)
// Tous les fichiers de js/ partagent la même portée et sont chargés dans l'ordre indiqué dans index.html.
// Les extraits (musique/*.mp3) sont fabriqués par tests/vrais-morceaux.js : coupés pile sur un temps, ramenés à 124 BPM,
// même volume. A = 136 temps avec des basses ; B = 64 temps d'intro puis le drop (B0), ou une intro qui a des basses (B1).
// Morceaux de Play House, dans le domaine public (CC0) : freemusicarchive.org/music/play-house
'use strict';
/* ---------- Vrais morceaux ---------- */
const VRAIS = [
  { A: 'dj-a', B0: 'animal-b', B1: 'power-b' },
  { A: 'animal-a', B0: 'dj-b', B1: 'power-b' }
];
const VRAIS_TITRES = { 'dj-a': 'Dj', 'dj-b': 'Dj', 'animal-a': 'Like An Animal', 'animal-b': 'Like An Animal', 'power-b': 'The Power Of The Beat' };
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
const vraiTitres = (vr, bBass) => `« ${VRAIS_TITRES[vraiOf(vr, 'A')]} » puis « ${VRAIS_TITRES[vraiOf(vr, bBass ? 'B1' : 'B0')]} » · Play House`;
