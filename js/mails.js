// Les mails de Vini : demander l'accord, le retenir, et le dire à l'outil d'envoi (Brevo).
// Tous les fichiers de js/ partagent la même portée et sont chargés dans l'ordre indiqué dans index.html.
'use strict';
/* ---------- Les mails de Vini (lot 54, 29 oct. 2026) ----------
   Demande de l'utilisateur : relancer par mail les gens qui ont un compte, pour qu'ils reviennent.
   **On n'écrit qu'à ceux qui ont dit oui** (règle de la CNIL pour la prospection par mail : une case jamais cochée
   d'avance). Deux façons de dire oui ou non :
   - la case « Recevoir les conseils de Vini par mail » en créant son compte (`creation`) : dans le formulaire, et sous
     « Continuer avec Google » sur le premier écran de la fenêtre (lot 78) ;
   - l'interrupteur « Les mails de Vini » dans « Mon compte » (`compte`), et le lien de désinscription de chaque mail
     (géré par Brevo ; `mlEtat` le relit en ouvrant « Mon compte »).
   **On n'écrit qu'à une adresse confirmée** (feu rouge du gardien : sans ça, n'importe qui pouvait créer un compte avec
   l'adresse d'un autre et lui faire envoyer nos mails). Un compte Google l'est déjà. Un compte par e-mail reçoit d'abord
   le lien de confirmation de Firebase (`mlVeut`) : sa réponse reste « attente », et l'adresse part chez Brevo quand il
   revient après avoir cliqué (`mlConfirme`, au chargement, en ouvrant « Mon compte » ou en revenant sur l'onglet).
   La réponse est gardée dans `coach-mails` ({ uid, rep: 'oui' | 'non' | 'attente', le, ou }), qui suit le compte comme
   la progression : on ne repose pas la question sur un autre appareil. `uid` : la réponse d'un autre compte, sur ce
   même navigateur, ne compte pas.

   Le site ne parle jamais à Brevo directement : sa clé permettrait à n'importe qui d'envoyer des mails au nom de
   DJingood. Il passe par la fonction `api/mails.js` (Vercel), qui vérifie le jeton du compte Firebase, prend l'adresse
   dedans et refuse une adresse pas confirmée : personne ne peut inscrire ou désinscrire l'adresse d'un autre.

   Aussi dans ce fichier : la carte de fin propose de créer un compte après une partie réussie, sur ordinateur, sans
   compte, au plus une fois par jour (`mlPropose`, appelé par `finish`). Sur téléphone, c'est la fin des leçons
   « Comprendre » qui le propose (lot 48).

   **ML_PRET** : tant qu'il est faux, rien des mails ne se voit (ni case, ni interrupteur), parce que
   Brevo n'est pas encore réglé (voir MAILS.md). La proposition de compte, elle, marche déjà.
   **Lot 78 (20 nov. 2026)** : la fenêtre « Je peux t'écrire ? », posée aux comptes créés avant le lot 54, est retirée.
   Demande de l'utilisateur : une simple case à cocher, comme sur tous les sites, pas une fenêtre. Il reste la case
   à la création du compte et l'interrupteur de « Mon compte », comme sur les autres sites. Les anciennes réponses
   « question » restent valables.
   Chargé juste avant compte.js, qui appelle `mlRend`, `mlPret`, `mlChoix` et `mlEtat`. */
const ML_PRET = true;   // lot 76 (19 nov. 2026) : allumé à la demande de l'utilisateur, une fois Brevo réglé (MAILS.md)
const ML_KEY = 'coach-mails';                 // la réponse du joueur, suit le compte
const ML_PROPOSE = 'coach-compte-propose';    // le dernier jour où la carte de fin a proposé le compte (reste sur cet ordinateur)
const ML_API = '/api/mails';
const ML_LENT = 8000;                         // au-delà, on considère que la fonction ne répond pas
const ML_REPS = ['oui', 'non', 'attente'];
function mlActif(){ let t = false; try { t = window.DJINGO_MAILS === true; } catch (e) {} return (ML_PRET || t) && cptOn(); }   // DJINGO_MAILS : pour les tests

let mlVu = '';          // le compte dont on a déjà regardé la réponse dans cette page
let mlVoulu = null;     // la case au moment de créer le compte : true, false, ou null (pas de case à ce moment-là)
let mlLienPart = false;  // la case cochée à la création, avec une adresse à confirmer : le bandeau de bienvenue le dit (compte.js)
let mlVerifie = 0;      // dernière fois qu'on a demandé à Firebase si l'adresse est confirmée (pas plus d'une fois par 10 s)

// La réponse retenue, relue et validée
function mlLit(){
  let v = null; try { v = JSON.parse(localStorage.getItem(ML_KEY) || 'null'); } catch (e) {}
  return v && typeof v === 'object' && typeof v.uid === 'string' && ML_REPS.includes(v.rep) ? v : null;
}
function mlRep(){ const v = mlLit(); return v && cpt && v.uid === cpt.uid ? v.rep : ''; }
function mlNote(rep, ou){ if (cpt) try { localStorage.setItem(ML_KEY, JSON.stringify({ uid: cpt.uid, rep, le: dayKey(), ou })); } catch (e) {} }

// Le prochain niveau du joueur, pour le premier mail (« Ta prochaine étape : Le fader »). La fonction n'accepte que
// les noms de sa liste (NIVEAUX dans api/mails.js) : un test vérifie que les deux restent d'accord.
function mlNiveau(){
  try {
    const s = nextStage();
    if (s === 'ch1'){ const i = BASE_LESSONS.findIndex((l, k) => (stars[k] || 0) < 2); if (i >= 0) return BASE_LESSONS[i].title; }
    return s && STAGES[s] ? STAGES[s].title : '';
  } catch (e) { return ''; }
}

/* ---------- Parler à la fonction api/mails.js ----------
   `oui` (prénom, prochain niveau, où), `non`, ou `etat`. Rejette si on n'est pas connecté, sans réseau, ou si la
   fonction répond une erreur (pas encore réglée : 503 ; adresse pas confirmée : 403). */
const mlUser = () => (cptFb && cptFb.auth && cptFb.auth.currentUser) || null;
function mlAppel(action, o = {}){
  const u = mlUser();
  if (!u) return Promise.reject(new Error('pas connecté'));
  return u.getIdToken().then(jeton => {
    const ctl = window.AbortController ? new AbortController() : null, t = setTimeout(() => { if (ctl) ctl.abort(); }, ML_LENT);
    return fetch(ML_API, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + jeton },
      body: JSON.stringify(Object.assign({ action }, o)), signal: ctl ? ctl.signal : undefined })
      .then(r => r.json().catch(() => ({})).then(d => { if (!r.ok) throw new Error((d && d.erreur) || 'erreur ' + r.status); return d; }))
      .finally(() => clearTimeout(t));
  });
}
// Dire oui ou non, puis le retenir (seulement si c'est vraiment parti)
function mlDit(oui, ou){
  const o = oui ? { prenom: cpt.prenom === 'toi' ? '' : cpt.prenom, niveau: mlNiveau(), ou } : { ou };
  return mlAppel(oui ? 'oui' : 'non', o).then(() => { mlNote(oui ? 'oui' : 'non', ou); stat(oui ? 'mails-oui' : 'mails-non', { ou }); mlRend(); });
}
// Le joueur dit oui. Adresse confirmée : elle part chez Brevo. Sinon, Firebase lui envoie d'abord le lien de
// confirmation, et on note « attente » (renvoie 'attente').
function mlVeut(ou){
  const u = mlUser();
  if (!u) return Promise.reject(new Error('pas connecté'));
  if (u.emailVerified) return mlDit(true, ou).then(() => 'oui');
  return u.sendEmailVerification({ url: location.origin + '/' }).catch(() => u.sendEmailVerification())   // adresse de retour refusée : sans elle
    .then(() => { mlNote('attente', ou); stat('mails-attente', { ou }); mlRend(); return 'attente'; });
}
// Il a peut-être cliqué le lien depuis : on redemande à Firebase, et si c'est confirmé, l'adresse part chez Brevo.
function mlConfirme(){
  const u = mlUser(), v = mlLit();
  if (!u || mlRep() !== 'attente' || Date.now() - mlVerifie < 10000) return Promise.resolve();
  mlVerifie = Date.now();
  return u.reload().then(() => { const w = mlUser(); if (!w || !w.emailVerified) return;
    return w.getIdToken(true).then(() => mlDit(true, (v && v.ou) || 'compte')); }).catch(() => {});
}
// `cpt` n'existe qu'une fois compte.js chargé (juste après ce fichier) : revenir sur l'onglet pendant ce court moment
// affichait le bandeau d'erreur (second passage du gardien, même piège que `view` au lot 45)
window.addEventListener('focus', () => { if (typeof cpt === 'undefined' || !cpt) return; if (mlActif() && mlRep() === 'attente') mlConfirme(); });

/* ---------- Après la connexion ----------
   Appelé par cptEtat à chaque changement ; n'agit qu'une fois par compte et par page, quand la progression a été
   comparée (avant, une reprise du compte pourrait recharger la page et réécrire `coach-mails`). */
function mlPret(){
  if (!cpt || cptBloque || cptAttente || mlVu === cpt.uid || !mlActif()) return;
  mlVu = cpt.uid;
  const v = mlVoulu; mlVoulu = null;
  if (v === true){ const u = mlUser(); if (u && !u.emailVerified) mlLienPart = true; mlVeut('creation').catch(() => {}); return; }   // raté : il reste l'interrupteur de « Mon compte »
  if (v === false){ if (!mlRep()){ mlNote('non', 'creation'); mlAppel('non', { ou: 'creation' }).catch(() => {}); } return; }   // case pas cochée en créant son compte
  if (mlRep() === 'attente') mlConfirme();
}
// La case, au moment où le joueur crée son compte : celle du formulaire (cochée ou non, c'est sa réponse), ou celle du
// premier écran, sous « Continuer avec Google ». Celle-là sert aussi à ceux qui reviennent se connecter : seulement
// cochée, elle compte (pas cochée, on ne touche pas à ce qu'ils avaient déjà répondu).
function mlChoix(){
  mlVoulu = null;
  if (!mlActif()) return;
  if (cptPas === 'creer' && !$('cptAccord').hidden) mlVoulu = $('cptMails').checked;
  else if (cptPas === 'accueil' && !$('cptAccord0').hidden && $('cptMails0').checked) mlVoulu = true;
}

/* ---------- Dans « Mon compte » ---------- */
const ML_TXT = '3 mails pour bien démarrer, puis un par semaine au plus : des astuces et les nouveautés. Tu peux aussi arrêter depuis n\'importe quel mail.';
const ML_TXT_ATTENTE = 'Presque fini : clique sur le lien que DJingood t\'a envoyé par mail pour confirmer ton adresse. Pas reçu ? Coupe puis rallume ce bouton.';
// Appelé par cptRend : la case du formulaire de création, et l'interrupteur quand on est connecté
function mlRend(){
  const a = $('cptAccord'); if (a) a.hidden = !(mlActif() && !cpt && cptPas === 'creer');
  const a0 = $('cptAccord0'); if (a0) a0.hidden = !(mlActif() && !cpt && !cptAttente && cptPas === 'accueil' && !cptAppli());   // sous le bouton Google
  const l = $('cptMailsRow'), b = $('cptMailsInter'), r = mlRep();
  if (l) l.hidden = !(mlActif() && cpt && !cptAttente);
  if (b && !b.disabled) b.setAttribute('aria-checked', String(r === 'oui' || r === 'attente'));
  const t = $('cptMailsTxt'); if (t) t.textContent = r === 'attente' ? ML_TXT_ATTENTE : ML_TXT;
}
// En ouvrant « Mon compte » : ce que Brevo sait vraiment (le joueur a pu se désinscrire depuis un mail), ou, en attente,
// si l'adresse a été confirmée depuis
function mlEtat(){
  if (!cpt || !mlActif() || cptBloque) return;
  if (mlRep() === 'attente'){ mlVerifie = 0; mlConfirme(); return; }
  mlAppel('etat').then(d => {
    const rep = d && d.oui ? 'oui' : 'non', avant = mlRep();
    if (rep !== avant && (avant || rep === 'oui')) mlNote(rep, 'compte');   // sans réponse et pas inscrit : on ne note rien
    mlRend();
  }, () => {});
}
function mlBascule(){
  const b = $('cptMailsInter'); if (b.disabled || !cpt) return;
  const oui = b.getAttribute('aria-checked') !== 'true';
  b.disabled = true; b.setAttribute('aria-checked', String(oui));
  (oui ? mlVeut('compte') : mlDit(false, 'compte').then(() => 'non')).then(
    r => { b.disabled = false; mlRend();
      cptDit(r === 'attente' ? 'DJingood vient de t’envoyer un mail : clique sur le lien dedans pour confirmer ton adresse.'
        : oui ? 'C’est noté : Vini t’écrira, un mail par semaine au plus.' : 'C’est noté : Vini ne t’écrira plus.'); },
    () => { b.disabled = false; b.setAttribute('aria-checked', String(!oui)); cptDit('Ça n’a pas marché : vérifie ta connexion, puis réessaie.'); });
}

/* ---------- La carte de fin propose le compte ----------
   Après une partie réussie (2 étoiles ou plus), sur ordinateur, sans compte, au plus une fois par jour. Jamais après un
   échec. « Niveau suivant » reste le bouton principal : celui-ci est un bouton discret dans un encadré violet.
   Le texte ne promet pas de mails : la case pour les recevoir n'est jamais cochée d'avance. */
function mlPropose(st){
  const box = $('rCompte'); box.hidden = true;
  if (st < 2 || !cptOn() || cpt || cptSauve || cpMobile()) return;
  const jour = dayKey(); let dernier = ''; try { dernier = localStorage.getItem(ML_PROPOSE) || ''; } catch (e) {}
  if (dernier === jour) return;
  try { localStorage.setItem(ML_PROPOSE, jour); } catch (e) {}
  box.hidden = false;
  stat1('compte-propose');
}

$('rCompteGo').addEventListener('click', () => { $('rCompte').hidden = true; stat('compte-propose-clic'); openCompte(); cptVa('creer'); });
$('cptMailsInter').addEventListener('click', mlBascule);
// une seule réponse : la case du premier écran et celle du formulaire disent la même chose
$('cptMails0').addEventListener('change', e => { $('cptMails').checked = e.target.checked; });
$('cptMails').addEventListener('change', e => { $('cptMails0').checked = e.target.checked; });
