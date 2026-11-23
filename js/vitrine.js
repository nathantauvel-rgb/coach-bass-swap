/* ---------- La page d'accueil (lot 83, 22 nov. 2026) ----------
   Demande de l'utilisateur : « une page d'onboarding classique comme sur tous les SaaS, pour voir si c'est mieux au niveau de
   la conversion ». Maquette validée le 22 nov. (« excellente idée la vidéo dans le site », puis « go ») : captures/maquette-accueil
   du dossier principal. Analyse : Documents/MARKETING/09-landing/09-page-accueil.md.
   Un nouveau venu (celui à qui s'ouvriraient les Premiers pas : ppAOuvrir, sans réponses ni parcours) voit, au lieu du premier
   écran de Vini, une page comme celles des SaaS : une phrase, la vidéo d'une vraie partie, « C'est parti », puis les marques,
   trois étapes, le prix et les questions. « C'est parti » ouvre directement la première question des Premiers pas (pas de
   second « C'est parti ») ; « J'ai déjà un compte » ouvre la fenêtre du compte par-dessus.
   **Test moitié / moitié** : chaque nouveau navigateur est rangé une fois pour toutes dans un groupe, gardé dans
   coach-vitrine : 'page' (cette page) ou 'vini' (l'écran de Vini, comme avant). stats.js ajoute ce groupe (`accueil`) à tout
   ce qu'il envoie à Umami et à PostHog, pour comparer les deux groupes étape par étape (STATISTIQUES.md). Pas d'avant / après :
   Black Friday et Noël changent les visiteurs. VITRINE_PART règle la part du groupe 'page' (1 : tout le monde, 0 : personne).
   ?accueil=page ou ?accueil=vini dans l'adresse montre l'un ou l'autre sans ranger le navigateur ni rien compter (pour essayer).
   Les tests automatiques (navigator.webdriver) restent sur l'écran de Vini, sauf s'ils posent coach-vitrine. */
'use strict';
const VITRINE_KEY = 'coach-vitrine';
const VITRINE_PART = 0.5;
const VITRINE_GROUPES = ['page', 'vini'];
let vitrineObs = null;

// Le groupe de ce navigateur, tiré au sort la première fois (et compté une fois : « test-accueil »)
function vitrineGroupe(){
  let force = null; try { force = new URLSearchParams(location.search).get('accueil'); } catch (e) {}
  if (VITRINE_GROUPES.includes(force)) return force;
  let g = null; try { g = localStorage.getItem(VITRINE_KEY); } catch (e) {}
  if (VITRINE_GROUPES.includes(g)) return g;
  if (navigator.webdriver) return 'vini';
  g = Math.random() < VITRINE_PART ? 'page' : 'vini';
  try { localStorage.setItem(VITRINE_KEY, g); } catch (e) {}
  stat1('test-accueil', { groupe: g });
  return g;
}
// La page se montre à un vrai nouveau venu : pas de réponses (même pas celles d'un compte à finir), pas de parcours
const vitrineAMontrer = () => !accueil && !parcours && vitrineGroupe() === 'page';

/* Habillage « moins IA » (maquette v2 validée le 23 nov. 2026, « bien mieux comme ça vasy » ; le prix gardé comme avant) :
   les titres dans la police des vidéos TikTok (Montserrat, chargée seulement pour ceux qui voient la page), Vini qui écoute
   au casque sur la vidéo puis qui danse sur l'onde, et l'onde des 3 étapes : la platine A (orange, en haut) qui s'en va, la
   platine B (bleu, en bas) qui arrive, comme une transition dans un logiciel DJ. Toujours la même onde (tirage fixe). */
let vitrinePrete = false;
function vitrineHabille(){
  if (vitrinePrete) return;
  vitrinePrete = true;
  if (!document.getElementById('vtPolice')){
    const l = document.createElement('link');
    l.id = 'vtPolice'; l.rel = 'stylesheet'; l.href = 'https://fonts.googleapis.com/css2?family=Montserrat:wght@800;900&display=swap';
    document.head.appendChild(l);
  }
  if (typeof viniMettre === 'function'){
    viniMettre($('vtViniHeros'), 'danse'); viniPose($('vtViniHeros'), { bras: 'oreille', fx: 'notes' });
    viniMettre($('vtViniOnde'), 'danse'); viniPose($('vtViniOnde'), { fx: '' });
    for (const id of ['vtViniHeros', 'vtViniOnde']){ $(id).removeAttribute('role'); $(id).removeAttribute('aria-label'); $(id).setAttribute('aria-hidden', 'true'); }
  }
  const L = 1180, N = 236, pas = L / N, w = (pas * 0.6).toFixed(1);
  let graine = 7, barres = '<rect class="vt-ligne" x="0" y="37.5" width="1180" height="1"/><rect class="vt-ligne" x="0" y="111.5" width="1180" height="1"/>';
  const hasard = () => { graine = (graine * 16807) % 2147483647; return graine / 2147483647; };
  const lisse = (a, b, x) => { const u = Math.min(1, Math.max(0, (x - a) / (b - a))); return u * u * (3 - 2 * u); };
  for (let i = 0; i < N; i++){
    const x = i / N, temps = i % 4 === 0 ? 1 : i % 2 === 0 ? 0.72 : 0.5;   // la grosse caisse sur chaque temps
    const base = (0.55 + 0.45 * hasard()) * temps;
    const ha = base * (0.35 + 0.65 * lisse(0, 0.12, x)) * (1 - lisse(0.42, 0.7, x));   // A : l'intro, puis elle sort
    const hb = base * lisse(0.3, 0.58, x) * (0.8 + 0.2 * lisse(0.7, 0.9, x));            // B : elle entre, puis le drop
    const bx = (i * pas).toFixed(1);
    if (ha > 0.04){ const h = ha * 30; barres += `<rect class="vt-wa" x="${bx}" y="${(38 - h).toFixed(1)}" width="${w}" height="${(h * 2).toFixed(1)}" rx="1"/>`; }
    if (hb > 0.04){ const h = hb * 30; barres += `<rect class="vt-wb" x="${bx}" y="${(112 - h).toFixed(1)}" width="${w}" height="${(h * 2).toFixed(1)}" rx="1"/>`; }
  }
  $('vtOnde').innerHTML = barres;
}
function vitrineOuvre(){
  const v = $('vitrine');
  v.hidden = false; v.scrollTop = 0; document.documentElement.classList.add('vitrine-open');
  vitrineHabille();
  // lot 82 : tout le chapitre 1 est offert (NIV_GRATUITS = les 7 niveaux du chapitre 1)
  const ch1 = typeof BASE_LESSONS !== 'undefined' && BASE_LESSONS.length ? BASE_LESSONS.length : 7;
  $('vtNiv').textContent = NIV_GRATUITS >= ch1 ? 'Tout le chapitre 1 avec ta table' : `Tes ${NIV_GRATUITS} premiers niveaux avec ta table`;
  $('vtDeja').hidden = !(typeof cptOn === 'function' && cptOn());   // sans comptes (Firebase pas réglé), pas de bouton qui ne fait rien
  // la vidéo n'est chargée que pour ceux qui voient la page ; immobile si l'on a demandé moins d'animations
  const vid = $('vtVideo');
  if (!vid.getAttribute('src')) vid.src = 'img/vitrine/partie.mp4';
  if (REDUCED) vid.controls = true;
  else { vid.autoplay = true; const p = vid.play(); if (p && p.catch) p.catch(() => {}); }
  // sur téléphone, le bouton reste en bas dès que celui du haut n'est plus visible
  if ('IntersectionObserver' in window && !vitrineObs){
    vitrineObs = new IntersectionObserver(e => $('vtColle').classList.toggle('vt-vu', !e[0].isIntersecting), { root: v });
    vitrineObs.observe($('vtGo'));
  }
}
function vitrineFerme(){
  const v = $('vitrine');
  if (v.hidden) return;
  v.hidden = true; document.documentElement.classList.remove('vitrine-open');
  const vid = $('vtVideo'); try { vid.pause(); } catch (e) {}
  if (vitrineObs){ vitrineObs.disconnect(); vitrineObs = null; }
}
// « C'est parti » : la première question de Vini, tout de suite (le clic laisse partir sa musique)
function vitrinePart(){
  stat1('page-accueil-go');
  vitrineFerme();
  openPremiers('niveau');
}
['vtGo', 'vtGo2', 'vtGo3'].forEach(id => $(id).addEventListener('click', vitrinePart));
$('vtDeja').addEventListener('click', () => { openCompte(); cptVa('entrer'); });
// Connecté depuis la page (« J'ai déjà un compte ») : la page s'efface. Un compte qui a déjà un parcours est repris par
// compte.js (cptSync) ; un compte encore vide fait les questions de Vini, comme un nouveau venu.
function vitrineConnecte(){
  if ($('vitrine').hidden) return;
  vitrineFerme();
  if (ppAOuvrir() && !pp.on) openPremiers();
}
