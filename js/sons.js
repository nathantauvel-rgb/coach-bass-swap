// Sons du jeu (lot 31) : de petits sons fabriqués dans le navigateur (aucun fichier), comme dans Duolingo : geste réussi ou
// raté, étoiles, fin de partie, coffre, série, choix d'une réponse. Un bouton de l'en-tête les coupe (clé coach-sons).
// Tous les fichiers de js/ partagent la même portée et sont chargés dans l'ordre indiqué dans index.html.
'use strict';
/* ---------- Sons ---------- */
let sonsOn = true; try { sonsOn = localStorage.getItem('coach-sons') !== '0'; } catch (e) {}
// Une note : fréquence (Hz), départ et durée (s), forme d'onde, volume, fréquence d'arrivée (glissando) ; passe par la sortie
// générale (limiteur, casque de la table)
function sonNote(f, t0, d, type = 'sine', vol = .08, f2 = 0){
  const o = ac.createOscillator(), g = ac.createGain(), t = ac.currentTime + t0;
  o.type = type; o.frequency.setValueAtTime(f, t); if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + d);
  g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + .012); g.gain.exponentialRampToValueAtTime(.0001, t + d);
  o.connect(g); g.connect(master); o.start(t); o.stop(t + d + .05);
}
const SONS = {
  reussi: () => { sonNote(1046.5, 0, .3); sonNote(1568, .07, .35); },
  presque: () => sonNote(784, 0, .25, 'sine', .06),
  rate: () => sonNote(330, 0, .28, 'triangle', .09, 220),
  clic: () => sonNote(1320, 0, .06, 'sine', .05),
  etoile: i => { const f = [1318.5, 1661.2, 1975.5][i] || 1975.5; sonNote(f, 0, .35, 'sine', .07); sonNote(f * 2, 0, .18, 'sine', .02); },
  fin: () => [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => sonNote(f, i * .09, i === 3 ? .55 : .3, 'triangle', .07)),
  finRatee: () => { sonNote(392, 0, .22, 'triangle', .07); sonNote(329.63, .16, .38, 'triangle', .07); },
  coffre: () => { sonNote(520, 0, .22, 'triangle', .07, 1560); [2093, 2637, 3136, 4186].forEach((f, i) => sonNote(f, .18 + i * .06, .25, 'sine', .04)); },
  serie: () => { [523.25, 659.25, 783.99].forEach(f => sonNote(f, 0, .8, 'sine', .05)); sonNote(1046.5, .25, .6, 'triangle', .05); sonNote(180, 0, .5, 'triangle', .04, 420); }
};
function son(nom, ...arg){
  if (!sonsOn || !SONS[nom]) return;
  try { ensureAudio(); if (ac.state !== 'running') ac.resume(); SONS[nom](...arg); } catch (e) {}
}
// Le bouton de l'en-tête : un haut-parleur, avec ou sans ondes
function renderSons(){
  const b = $('sonsBtn'); b.setAttribute('aria-pressed', String(sonsOn)); b.title = sonsOn ? 'Couper les sons du jeu' : 'Remettre les sons du jeu';
  b.setAttribute('aria-label', sonsOn ? 'Sons du jeu : activés' : 'Sons du jeu : coupés');
  b.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z"/>'
    + (sonsOn ? '<path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11"/>' : '<path d="M16 9.5l5 5M21 9.5l-5 5"/>') + '</svg>';
}
$('sonsBtn').addEventListener('click', () => { sonsOn = !sonsOn; try { localStorage.setItem('coach-sons', sonsOn ? '1' : '0'); } catch (e) {} renderSons(); son('clic'); });
renderSons();
