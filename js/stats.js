// Statistiques de visite (lot 45) : combien de gens viennent, d'où, et jusqu'où ils vont dans le jeu.
// Ce fichier ne dépend d'aucun autre : index.html le charge tout de suite après erreurs.js (pour que tous les autres
// puissent appeler `stat`), et presentation.html et confidentialite.html le chargent seul.
'use strict';
/* ---------- Umami ----------
   Umami compte les visites sans cookie et sans rien qui permette de suivre quelqu'un d'un site à l'autre : pas de bandeau
   à accepter (mesure d'audience exemptée de consentement par la CNIL, à condition d'informer et de laisser refuser :
   c'est la page confidentialite.html). Il voit tout seul les pages vues, le pays, le type d'appareil, le navigateur et
   d'où l'on vient (TikTok, Google…, ou `?utm_source=` dans le lien).
   En plus, quelques **étapes du jeu** sont envoyées, chacune une seule fois par navigateur (gardées dans `coach-stats`),
   pour voir où les gens s'arrêtent : voir STATS_ETAPES.
   - Rien n'est chargé ailleurs que sur le vrai site (STATS_DOMAINES) : ni en local, ni pendant les tests. Les tests posent
     un faux `window.umami` avant le chargement, et tout le reste du chemin est le vrai.
   - Refuser : `umami.disabled` dans localStorage (le réglage prévu par Umami), posé par le bouton de confidentialite.html.
     Il n'est pas effacé par « Tout recommencer à zéro » (ce n'est pas une clé `coach-`).
   - STATS_ID vide : rien n'est chargé, `stat` ne fait rien. */
const STATS_ID = 'e77050d6-198a-4d10-949f-74ec3df03ac2';
const STATS_SRC = 'https://cloud.umami.is/script.js';
const STATS_DOMAINES = ['djingood.fr', 'www.djingood.fr', 'coach-bass-swap.vercel.app'];
const STATS_KEY = 'coach-stats', STATS_NON = 'umami.disabled';
// Les étapes comptées une fois par navigateur, dans l'ordre où un joueur les rencontre
const STATS_ETAPES = ['sans-midi', 'premiers-pas-fin', 'premiers-pas-passes', 'table-branchee', 'premiere-partie', 'premiere-reussite',
  'chapitre-1', 'chapitre-2', 'chapitre-3', 'chapitre-4', 'chapitre-5', 'chapitre-6', 'chapitre-7', 'compte', 'rekordbox', 'revenu', 'jours-7'];
let statsFaits = []; try { statsFaits = JSON.parse(localStorage.getItem(STATS_KEY) || '[]'); } catch (e) {}
if (!Array.isArray(statsFaits)) statsFaits = [];
statsFaits = statsFaits.filter(n => STATS_ETAPES.includes(n));
let statsFile = [];   // envoyés avant que le script d'Umami soit arrivé
const statsRefuse = () => { try { return !!localStorage.getItem(STATS_NON); } catch (e) { return false; } };
const statsPret = () => { try { return !!(window.umami && typeof window.umami.track === 'function'); } catch (e) { return false; } };
// Vrai si ce qui est envoyé arrivera quelque part : le vrai site avec un identifiant, ou le faux Umami des tests
const statsActif = () => !statsRefuse() && (statsPret() || (!!STATS_ID && STATS_DOMAINES.includes(location.hostname)));
function stat(nom, d){
  if (!statsActif()) return;
  if (!statsPret()){ if (statsFile.length < 50) statsFile.push([nom, d]); return; }
  try { if (d) window.umami.track(nom, d); else window.umami.track(nom); } catch (e) {}
}
// Une étape du jeu : une seule fois par navigateur, et seulement si elle part vraiment (sinon elle resterait marquée pour rien)
function stat1(nom, d){
  if (!STATS_ETAPES.includes(nom) || statsFaits.includes(nom) || !statsActif()) return;
  statsFaits.push(nom); try { localStorage.setItem(STATS_KEY, JSON.stringify(statsFaits)); } catch (e) {}
  stat(nom, d);
}
function statsVide(){ const f = statsFile; statsFile = []; f.forEach(([n, d]) => stat(n, d)); }
function statsCharge(){
  if (!statsActif()) return;
  if (statsPret()){ statsVide(); return; }
  const s = document.createElement('script'); s.defer = true; s.src = STATS_SRC;
  s.dataset.websiteId = STATS_ID; s.dataset.domains = STATS_DOMAINES.join(',');
  s.dataset.excludeHash = 'true';   // les onglets du site (#apprendre…) sont une seule page : pas une page vue par onglet
  s.onload = statsVide;
  document.head.appendChild(s);
}
// Le bouton de confidentialite.html
function statsRefuser(non){ try { if (non) localStorage.setItem(STATS_NON, '1'); else localStorage.removeItem(STATS_NON); } catch (e) {} }
statsCharge();
