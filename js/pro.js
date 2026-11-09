// DJingood Pro (lot 59) : l'abonnement qui ouvre les tutos Pro. Chargé juste après compte.js.
// Tous les fichiers de js/ partagent la même portée et sont chargés dans l'ordre indiqué dans index.html.
'use strict';
/* Décisions de l'utilisateur (6-8 nov. 2026) : rien de ce qui existe ne passe en Pro ; Pro = les tutos (sauf le premier de
   chaque famille, gratuit) et ceux qui arriveront chaque mois ; 4,99 € par mois ou 49,99 € par an ; pas d'essai gratuit.
   Écran d'après la maquette v5 (captures/maquette-pro/, hors Git) : pas de texte en dégradé, pas de reflet animé, pas de
   halo de lumière dans le fond (« ça fait IA »).

   Tant que PRO_PRET est faux, rien ne change pour les joueurs : aucun cadenas, tous les tutos s'ouvrent (et l'onglet
   « Tutos » est lui-même caché, TUTOS_PRET). Pour essayer : ?pro=1 dans l'adresse (retenu pour l'onglet du navigateur) ;
   les tests posent window.DJINGOOD_PRO.

   Qui est Pro : c'est Stripe qui le sait (api/pro.js) ; le site le lui demande avec le jeton du compte, à chaque connexion,
   et retient la réponse dans coach-pro (sur cet ordinateur seulement, CPT_LOCAL) pour ne pas montrer de cadenas à un
   abonné le temps que la réponse arrive. Les tutos étant dans le site, un curieux peut toujours les ouvrir : le cadenas est
   une porte, pas un coffre. */
const PRO_PRET = false;
const proEssai = (() => { try { if (/[?&]pro=1(&|$)/.test(location.search)) sessionStorage.setItem('djingood-pro', '1'); return sessionStorage.getItem('djingood-pro') === '1'; } catch (e) { return false; } })();
const proVerrou = () => PRO_PRET || proEssai || !!window.DJINGOOD_PRO;
const PRO_API = '/api/pro', PRO_LENT = 10000, PRO_CLE = 'coach-pro', PRO_FORMULES = ['mois', 'an'];
const PRO_PRIX = {
  mois: ['4,99 €', '/ mois', 'Sans engagement : tu arrêtes quand tu veux.'],
  an: ['49,99 €', '/ an', '<s>59,88 €</s> soit 4,17 € par mois · 2 mois offerts']
};

/* ---------- Ce qu'on sait de l'abonnement ----------
   coach-pro : { uid, actif, formule, jusqua (secondes), annule } du dernier compte vérifié sur cet ordinateur. */
const proVide = uid => ({ uid: uid || '', actif: false, formule: null, jusqua: null, annule: false });
let proEtat = (() => {
  try {
    const d = JSON.parse(localStorage.getItem(PRO_CLE));
    if (!d || typeof d !== 'object' || typeof d.uid !== 'string' || !d.uid) return proVide();
    return { uid: d.uid, actif: d.actif === true, formule: PRO_FORMULES.includes(d.formule) ? d.formule : null,
      jusqua: typeof d.jusqua === 'number' && isFinite(d.jusqua) ? d.jusqua : null, annule: d.annule === true };
  } catch (e) { return proVide(); }
})();
// Le compte de cet ordinateur : celui qui est connecté, sinon le dernier (la session se reprend au chargement)
const proUid = () => (cpt && cpt.uid) || (cptSauve && cptSauve.uid) || '';
const proActif = () => proEtat.actif && !!proEtat.uid && proEtat.uid === proUid() && (!proEtat.jusqua || proEtat.jusqua * 1000 > Date.now() - 3 * 864e5);
const proLibre = t => !proVerrou() || !!t.gratuit || proActif();
function proMaj(d, uid){
  proEtat = d && d.pro ? { uid, actif: true, formule: PRO_FORMULES.includes(d.formule) ? d.formule : null,
    jusqua: typeof d.jusqua === 'number' ? d.jusqua : null, annule: !!d.annule } : proVide(uid);
  try { localStorage.setItem(PRO_CLE, JSON.stringify(proEtat)); } catch (e) {}
  if (view === 'tutos') renderTutos();
  proCompteRend();
}

/* ---------- Parler à la fonction api/pro.js ---------- */
const proUser = () => (cptFb && cptFb.auth && cptFb.auth.currentUser) || null;
function proAppel(action, o = {}){
  const u = proUser();
  if (!u) return Promise.reject(new Error('pas-connecte'));
  return u.getIdToken().then(jeton => {
    const ctl = window.AbortController ? new AbortController() : null, t = setTimeout(() => { if (ctl) ctl.abort(); }, PRO_LENT);
    return fetch(PRO_API, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + jeton },
      body: JSON.stringify(Object.assign({ action }, o)), signal: ctl ? ctl.signal : undefined })
      .then(r => r.json().catch(() => ({})).then(d => { if (!r.ok) throw new Error((d && d.erreur) || 'erreur ' + r.status); return d; }))
      .finally(() => clearTimeout(t));
  });
}
// Aller sur une page de Stripe (paiement, « Gérer mon abonnement »)
function proVaVers(url){ if (typeof url === 'string' && /^https?:\/\//.test(url)) location.assign(url); }

/* ---------- Le retour de Stripe, et chaque connexion ----------
   Après le paiement, Stripe renvoie sur /?pro=merci&session=cs_…#tutos. */
let proRetour = (() => { const m = /[?&]pro=merci&session=(cs_[A-Za-z0-9_]+)/.exec(location.search); return m ? m[1] : ''; })();
let proApres = null;   // la formule choisie avant de créer son compte : on enchaîne sur le paiement une fois connecté
// Appelé par compte.js (cptChange) à chaque connexion ou déconnexion
function proCompte(u){
  if (!u){ proCompteRend(); if (view === 'tutos') renderTutos(); return; }
  if (!proVerrou() && !proRetour) return;
  if (proRetour){
    const id = proRetour; proRetour = '';
    try { history.replaceState(null, '', location.pathname + location.hash); } catch (e) {}
    proAppel('session', { id }).then(d => { proMaj(d, u.uid); if (d.pro) proMerci(); }, () => proVerifie(u));
  } else proVerifie(u);
  if (proApres){ const f = proApres; proApres = null; proPayer(f); }
}
function proVerifie(u){ return proAppel('etat').then(d => proMaj(d, u.uid), () => {}); }

/* ---------- La fenêtre « DJingood Pro » ---------- */
let proFormule = 'an';
const proVoulu = { lire(){ try { return sessionStorage.getItem('djingood-pro-voulu') || ''; } catch (e) { return ''; } },
  ecrire(id){ try { if (id) sessionStorage.setItem('djingood-pro-voulu', id); else sessionStorage.removeItem('djingood-pro-voulu'); } catch (e) {} } };
function proPrix(){
  document.querySelectorAll('#pro .pro-bascule button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.f === proFormule)));
  const [p, par, d] = PRO_PRIX[proFormule];
  $('proPrix').textContent = p; $('proPar').textContent = par; $('proDetail').innerHTML = d;   // nos propres textes
}
function proDit(t){ $('proMsg').textContent = t; $('proMsg').hidden = !t; }
// Ouvre la fenêtre (depuis un tuto Pro, le bandeau du catalogue ou « Mon compte ») ; id = le tuto qu'on voulait voir
function proOuvre(id){
  if (!proVerrou()) return false;
  if (id) proVoulu.ecrire(id);
  const n = TUTOS.length;
  $('proDedansTxt').textContent = `${n} tutos aujourd'hui, et un nouveau chaque mois.`;
  proFormule = 'an'; proPrix(); proDit(''); $('proGo').disabled = false;
  $('pro').hidden = false; document.body.classList.add('pro-ouvert');
  $('proTitre').focus({ preventScroll: true });
  stat('pro-ouvert', { depuis: id || 'menu' });
  return true;
}
function proFerme(){ $('pro').hidden = true; document.body.classList.remove('pro-ouvert'); }
function proPayer(f){
  $('proGo').disabled = true; proDit('Un instant : on ouvre la page de paiement…');
  stat('pro-payer', { formule: f });
  proAppel('payer', { formule: f }).then(d => proVaVers(d.url)).catch(e => {
    $('proGo').disabled = false;
    if (e.message === 'deja-pro'){ proDit('Tu es déjà Pro !'); const u = proUser(); if (u) proVerifie(u); return; }
    proDit(e.message === 'pas-configure' ? "Le paiement n'est pas encore ouvert. Reviens bientôt !" : "La page de paiement ne s'ouvre pas. Vérifie ta connexion, puis réessaie.");
  });
}
$('proGo').addEventListener('click', () => {
  if (!proUser()){
    // il faut un compte pour retrouver son abonnement : on le crée, puis on enchaîne sur le paiement (proCompte)
    proApres = proFormule; proFerme(); openCompte(); cptVa('creer');
    cptDit('Crée ton compte : il garde ton abonnement, sur ton ordinateur comme sur ton téléphone.');
    return;
  }
  proPayer(proFormule);
});
document.querySelectorAll('#pro .pro-bascule button').forEach(b => b.addEventListener('click', () => { proFormule = b.dataset.f; proPrix(); }));
$('proFermer').addEventListener('click', proFerme);
$('proPlusTard').addEventListener('click', proFerme);
$('proBandeauBtn').addEventListener('click', () => proOuvre(''));
window.addEventListener('keydown', e => {
  if (e.key !== 'Escape') return;
  if (!$('pro').hidden){ proFerme(); e.stopImmediatePropagation(); }
  else if (!$('proMerci').hidden){ proMerciFerme(); e.stopImmediatePropagation(); }
}, true);

/* ---------- « Bienvenue dans Pro » ---------- */
function proMerci(){
  const t = TUTOS.find(x => x.id === proVoulu.lire());
  $('proMerciTxt').textContent = t ? `Tous les tutos sont ouverts. On commence par « ${t.titre} » ?` : 'Tous les tutos sont ouverts.';
  $('proMerciGo').textContent = t ? `Regarder « ${t.titre} »` : 'Voir les tutos';
  $('proMerci').hidden = false; document.body.classList.add('pro-ouvert');
  stat1('pro');   // une seule fois par navigateur (stats.js)
}
function proMerciFerme(){ $('proMerci').hidden = true; document.body.classList.remove('pro-ouvert'); }
$('proMerciGo').addEventListener('click', () => {
  const id = proVoulu.lire(); proVoulu.ecrire(''); proMerciFerme();
  if (location.hash !== '#tutos') location.hash = '#tutos';
  if (id && TUTOS.some(t => t.id === id)) setTimeout(() => tuOuvre(id), 0);
});

/* ---------- Dans « Mon compte » ---------- */
const proDate = s => new Date(s * 1000).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
// Appelé par cptRend (compte.js) et à chaque nouvelle réponse de Stripe
function proCompteRend(){
  const box = $('cptPro'); if (!box) return;
  box.hidden = !(proVerrou() && cpt);
  if (box.hidden) return;
  const actif = proActif(), e = proEtat;
  box.classList.toggle('actif', actif);
  $('cptProTxt').textContent = actif
    ? [e.formule === 'an' ? "À l'année" : e.formule === 'mois' ? 'Au mois' : '', e.jusqua ? (e.annule ? "s'arrête le " : 'renouvelé le ') + proDate(e.jusqua) : ''].filter(Boolean).join(' · ')
    : '4,99 € par mois, ou 49,99 € par an.';
  $('cptProBtn').textContent = actif ? 'Gérer mon abonnement' : 'Découvrir Pro';
}
$('cptProBtn').addEventListener('click', () => {
  if (!proActif()){ closeCompte(); proOuvre(''); return; }
  $('cptProBtn').disabled = true;
  proAppel('gerer').then(d => proVaVers(d.url)).catch(() => cptDit("La page de l'abonnement ne s'ouvre pas. Vérifie ta connexion, puis réessaie."))
    .finally(() => { $('cptProBtn').disabled = false; });
});

// Une session déjà reprise avant le chargement de ce fichier (compte.js n'a pas pu nous prévenir) : on la rattrape
if (proUser()) proCompte(proUser());
