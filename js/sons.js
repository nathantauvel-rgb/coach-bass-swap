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
// Le bouton de l'en-tête : un haut-parleur, avec ou sans ondes (le même dessin sert à la musique des Premiers pas, lot 52)
const sonsIcone = on => '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z"/>'
  + (on ? '<path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11"/>' : '<path d="M16 9.5l5 5M21 9.5l-5 5"/>') + '</svg>';
/* ---------- Le son (lot 60) ----------
   Le haut-parleur de l'en-tête ouvre un petit panneau « Son » : le volume de tout le site (volSite, js/audio.js) et
   l'interrupteur des petits sons du jeu (sonsOn, coach-sons ; il coupe aussi la musique des Premiers pas). Le même volume
   se règle aussi dans « Mon compte » et sous le lecteur des tutos : tous les curseurs .volcurseur bougent ensemble. */
let volAvant = VOL_DEFAUT;   // le volume d'avant le bouton « couper », pour le remettre
const volPct = () => Math.round(volSite * 100) + ' %';
function volMuetBascule(){
  if (volSite > 0){ volAvant = volSite; volRegle(0); }
  else volRegle(volAvant > 0 ? volAvant : VOL_DEFAUT);
}
// Le panneau et l'icône de l'en-tête (appelé aussi par premiers.js quand le bouton de la musique change sonsOn)
function renderSons(){
  const b = $('sonsBtn'), muet = volSite === 0;
  b.innerHTML = sonsIcone(!muet);
  b.setAttribute('aria-label', muet ? 'Son : coupé' : 'Son : ' + volPct());
  b.title = 'Régler le son';
  b.setAttribute('aria-expanded', String(!$('volPanneau').hidden));
  const m = $('volMuet');
  m.innerHTML = sonsIcone(!muet); m.setAttribute('aria-pressed', String(muet)); m.setAttribute('aria-label', muet ? 'Remettre le son' : 'Couper le son');
  $('volBips').setAttribute('aria-checked', String(sonsOn));
}
// Tous les curseurs du volume (en-tête, « Mon compte », lecteur des tutos) et leurs textes
function volRend(){
  document.querySelectorAll('.volcurseur').forEach(r => {
    const v = r.max === '100' ? String(Math.round(volSite * 100)) : String(volSite);
    if (document.activeElement !== r) r.value = v;
  });
  document.querySelectorAll('.volpct-txt').forEach(e => { e.textContent = volSite === 0 ? 'Coupé' : volPct(); });
  renderSons();
  if (typeof tuVolumeApplique === 'function') tuVolumeApplique();
}
function volPanneau(ouvert){
  $('volPanneau').hidden = !ouvert; renderSons();
  if (ouvert) $('volCurseur').focus();
}
$('sonsBtn').addEventListener('click', () => volPanneau($('volPanneau').hidden));
$('volMuet').addEventListener('click', volMuetBascule);
$('volBips').addEventListener('click', () => {
  sonsOn = !sonsOn; try { localStorage.setItem('coach-sons', sonsOn ? '1' : '0'); } catch (e) {}
  renderSons(); son('clic');
  if (typeof ppSonRendu === 'function') ppSonRendu();
});
// Un curseur bougé (n'importe lequel) : le volume suit tout de suite ; au lâcher, un petit son pour l'entendre
document.addEventListener('input', e => {
  const r = e.target; if (!r.classList || !r.classList.contains('volcurseur')) return;
  volRegle(r.max === '100' ? (+r.value || 0) / 100 : +r.value || 0);
});
document.addEventListener('change', e => { if (e.target.classList && e.target.classList.contains('volcurseur')) son('clic'); });
// Fermer le panneau : Échap, ou un clic ailleurs
// stopImmediatePropagation : Échap ne ferme que le panneau, pas aussi la carte de fin d'un niveau (demarrage.js, gardien du lot 60)
document.addEventListener('keydown', e => { if (e.key === 'Escape' && !$('volPanneau').hidden){ e.stopImmediatePropagation(); volPanneau(false); $('sonsBtn').focus(); } });
document.addEventListener('pointerdown', e => { if (!$('volPanneau').hidden && !e.target.closest('.volbox')) volPanneau(false); });
volRend();
