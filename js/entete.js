// L'en-tête (lot 90 « L'en-tête respire », lot D du diagnostic UX du 26 nov. 2026, maquette validée : « Go »)
// Un seul menu range ce qui sert peu : le son (sons.js), la langue (FR | EN, langue.js), « Mon avis » (avis.js) et « Revoir le
// guide » (guide.js, seulement sur Apprendre et sur ordinateur). Connecté, il s'ouvre par le bouton du prénom, avec « Mon compte »
// en tête ; sinon par « ⋯ », à côté de « Se connecter » qui reste violet et bien visible (sa demande du lot 54). Les fonctions
// ne changent pas : seule leur entrée bouge. Sur téléphone, les onglets passent dans une barre en bas de l'écran : c'est la
// feuille de style seule (bloc « Lot 90 » de styles.css).
// Tous les fichiers de js/ partagent la même portée et sont chargés dans l'ordre indiqué dans index.html.
'use strict';
// Le bouton qui ouvre le menu : celui du prénom une fois connecté (cptMenu, compte.js), sinon « ⋯ »
const menuOuvreur = () => $(cptMenu() ? 'cptBtn' : 'menuBtn');
const menuOuvert = () => !$('menuPanneau').hidden;
// Qui ouvre le menu, et ce que disent ses boutons (appelé aussi par cptEtat et renderSons)
function menuRend(){
  const parCpt = cptMenu(), ouvert = menuOuvert(), muet = volSite === 0, c = $('cptBtn'), b = $('menuBtn');
  b.hidden = parCpt;
  b.setAttribute('aria-expanded', String(ouvert && !parCpt));
  b.setAttribute('aria-label', muet ? 'Son coupé, langue, mon avis' : 'Son, langue, mon avis');
  if (parCpt){ c.setAttribute('aria-controls', 'menuPanneau'); c.setAttribute('aria-expanded', String(ouvert)); }
  else { c.removeAttribute('aria-controls'); c.removeAttribute('aria-expanded'); }
  $('menuCompte').hidden = !parCpt;
  if (parCpt){ $('menuAv').textContent = cptInitiale(); $('menuNom').textContent = cpt.prenom; }
  // tout le son du site est coupé : un petit haut-parleur barré sur le bouton qui ouvre le menu (avant, l'icône de l'en-tête le disait)
  const o = parCpt ? c : b;
  for (const x of [b, c]) x.querySelector('.menumuet').hidden = !(muet && x === o);
}
// Ouvrir ou fermer ; `revenir` rend la main au bouton qui l'ouvre (Échap, ou un choix qui ouvre une fenêtre)
function menuOuvre(ouvert, revenir){
  const m = $('menuPanneau');
  if (ouvert === menuOuvert()) return;
  m.hidden = !ouvert; menuRend();
  if (ouvert){
    // juste sous le bouton qui l'ouvre, même quand les onglets passent sur une seconde ligne (écran moyen)
    const b = menuOuvreur(); m.style.setProperty('--menu-haut', (b.offsetTop + b.offsetHeight + 10) + 'px');
    // le premier choix prend la main (« Mon compte », ou le bouton qui coupe le son), comme le panneau du son du lot 60
    const p = m.querySelector('button:not([hidden])'); if (p) p.focus({ preventScroll: true });
  } else if (revenir){ const b = menuOuvreur(); if (!b.hidden) b.focus({ preventScroll: true }); }
}
function menuBascule(){ menuOuvre(!menuOuvert()); }
$('menuBtn').addEventListener('click', menuBascule);
$('menuCompte').addEventListener('click', openCompte);
// Un choix qui ouvre une fenêtre referme d'abord le menu et rend la main à son bouton : la fenêtre, une fois fermée, y revient
// (closeAvis, closeCompte). En capture, pour passer avant openAvis et openOnb, qui notent où était la main.
$('menuPanneau').addEventListener('click', e => { if (e.target.closest('#menuCompte, #avisBtn, #guideBtn')) menuOuvre(false, true); }, true);
// Échap ferme le menu, et seulement lui : pas aussi la carte de fin d'un niveau (comme le panneau du son, gardien du lot 60)
document.addEventListener('keydown', e => {
  if (e.key !== 'Escape' || !menuOuvert()) return;
  e.stopImmediatePropagation(); menuOuvre(false, true);
}, true);
// Un clic ailleurs le ferme (le bouton qui l'ouvre le ferme lui-même)
document.addEventListener('pointerdown', e => {
  if (!menuOuvert() || $('menuPanneau').contains(e.target) || menuOuvreur().contains(e.target)) return;
  menuOuvre(false);
});
// La main qui sort du menu au clavier (Tab) le ferme aussi ; un clic dans le menu, sur du texte, ne compte pas (relatedTarget vide)
$('menuPanneau').addEventListener('focusout', e => {
  const v = e.relatedTarget;
  if (v && menuOuvert() && !$('menuPanneau').contains(v) && v !== menuOuvreur()) menuOuvre(false);
});
menuRend();
