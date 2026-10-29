// Les mails de Vini : demander l'accord, le retenir, et le dire à l'outil d'envoi (Brevo).
// Tous les fichiers de js/ partagent la même portée et sont chargés dans l'ordre indiqué dans index.html.
'use strict';
/* ---------- Les mails de Vini (lot 54, 29 oct. 2026) ----------
   Demande de l'utilisateur : relancer par mail les gens qui ont un compte, pour qu'ils reviennent.
   **On n'écrit qu'à ceux qui ont dit oui** (règle de la CNIL pour la prospection par mail : une case jamais cochée
   d'avance). Trois façons de dire oui ou non :
   - la case « Vini peut m'écrire » en créant son compte (`creation`) ;
   - pour les comptes créés avant ce lot, la question « je peux t'écrire ? », posée une seule fois, sur l'accueil,
     à la prochaine visite connectée (`question`). La fermer vaut « non » ;
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

   **ML_PRET** : tant qu'il est faux, rien des mails ne se voit (ni case, ni question, ni interrupteur), parce que
   Brevo n'est pas encore réglé (voir MAILS.md). La proposition de compte, elle, marche déjà.
   Chargé juste avant compte.js, qui appelle `mlRend`, `mlPret`, `mlChoix`, `mlEtat` et `mlQCache`. */
const ML_PRET = false;
const ML_KEY = 'coach-mails';                 // la réponse du joueur, suit le compte
const ML_PROPOSE = 'coach-compte-propose';    // le dernier jour où la carte de fin a proposé le compte (reste sur cet ordinateur)
const ML_API = '/api/mails';
const ML_LENT = 8000;                         // au-delà, on considère que la fonction ne répond pas
const ML_REPS = ['oui', 'non', 'attente'];
function mlActif(){ let t = false; try { t = window.DJINGO_MAILS === true; } catch (e) {} return (ML_PRET || t) && cptOn(); }   // DJINGO_MAILS : pour les tests

let mlVu = '';          // le compte dont on a déjà regardé la réponse dans cette page
let mlVoulu = null;     // la case au moment de créer le compte : true, false, ou null (pas de case à ce moment-là)
let mlQT = 0;           // minuteur de la question
let mlRate = false;     // le « oui » de la question n'a pas pu partir : fermer la fenêtre ne vaut plus « non »
let mlFini = false;     // la question a eu sa réponse (lien de confirmation envoyé) : le bouton ne fait plus que fermer
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
  if (v === true){ const u = mlUser(); if (u && !u.emailVerified) mlLienPart = true; mlVeut('creation').catch(() => mlQuestionBientot()); return; }   // raté : la question le rattrapera
  if (v === false){ if (!mlRep()){ mlNote('non', 'creation'); mlAppel('non', { ou: 'creation' }).catch(() => {}); } return; }   // case pas cochée : on ne demandera pas
  const r = mlRep();
  if (r === 'attente') mlConfirme();
  else if (!r) mlQuestionBientot();
}
// La case, au moment où le joueur crée son compte (formulaire ou Google depuis « Créer mon compte »)
function mlChoix(){ const a = $('cptAccord'); mlVoulu = mlActif() && cptPas === 'creer' && a && !a.hidden ? $('cptMails').checked : null; }

/* ---------- La question, pour les comptes créés avant ----------
   Sur l'accueil seulement, quand rien d'autre n'est ouvert et qu'aucune partie ne tourne : on réessaie toutes les
   3 secondes jusqu'à ce que ce soit le bon moment. */
function mlQuestionBientot(){ clearTimeout(mlQT); mlQT = setTimeout(mlQuestionEssaie, 1500); }
function mlQuestionEssaie(){
  if (!cpt || !mlActif() || mlRep() || !$('mlQ').hidden) return;
  if (view !== 'accueil' || run || document.querySelector('[role="dialog"]:not([hidden])')){ mlQT = setTimeout(mlQuestionEssaie, 3000); return; }
  mlRate = false; mlFini = false; mlMsg('');
  $('mlOui').textContent = 'Oui, écris-moi'; $('mlNon').hidden = false;
  $('mlTitre').textContent = cpt.prenom && cpt.prenom !== 'toi' ? cpt.prenom + ', je peux t\'écrire ?' : 'Je peux t\'écrire ?';
  viniMettre($('mlVini'), 'calme');
  $('mlQ').hidden = false; $('mlTitre').focus({ preventScroll: true });
  stat1('mails-question');
}
function mlMsg(t){ const m = $('mlMsg'); m.textContent = t || ''; m.hidden = !t; }
function mlQBoutons(off){ $('mlOui').disabled = !!off; $('mlNon').disabled = !!off; }
function mlQCache(){ $('mlQ').hidden = true; mlQBoutons(false); }
function mlOui(){
  if (!cpt || mlFini){ mlQCache(); return; }
  mlQBoutons(true); mlMsg('Un instant…');
  mlVeut('question').then(r => {
    if (r === 'oui'){ mlQCache(); viniSaute('home'); return; }
    // adresse à confirmer : on le dit ici, et le bouton ne fait plus que fermer
    mlFini = true; mlQBoutons(false); $('mlNon').hidden = true; $('mlOui').textContent = 'J\'ai compris';
    mlMsg('C\'est presque fini : DJingood vient de t\'envoyer un mail. Clique sur le lien dedans pour confirmer ton adresse.');
  }, () => { mlRate = true; mlQBoutons(false); mlMsg('Ça n’a pas marché (pas de connexion ?). Réessaie, ou plus tard dans « Mon compte ».'); });
}
// « Non merci », la croix, Échap, ou un clic à côté : c'est non, et on ne redemandera pas (sauf si le « oui » n'a pas pu
// partir, ou s'il attend la confirmation de l'adresse : alors on ferme seulement)
function mlNon(){
  if ($('mlQ').hidden || $('mlNon').disabled) return;
  // le « non » part aussi chez Brevo : l'adresse a pu y être inscrite depuis un autre appareil (Brevo répond 404 sinon, rien n'est créé)
  if (!mlRate && !mlFini && cpt){ mlNote('non', 'question'); stat('mails-non', { ou: 'question' }); mlAppel('non', { ou: 'question' }).catch(() => {}); }
  mlQCache();
}

/* ---------- Dans « Mon compte » ---------- */
const ML_TXT = 'Un par semaine au plus : des astuces et les nouveautés. Tu peux aussi arrêter depuis n\'importe quel mail.';
const ML_TXT_ATTENTE = 'Presque fini : clique sur le lien que DJingood t\'a envoyé par mail pour confirmer ton adresse. Pas reçu ? Coupe puis rallume ce bouton.';
// Appelé par cptRend : la case du formulaire de création, et l'interrupteur quand on est connecté
function mlRend(){
  const a = $('cptAccord'); if (a) a.hidden = !(mlActif() && !cpt && cptPas === 'creer');
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
    if (rep !== avant && (avant || rep === 'oui')) mlNote(rep, 'compte');   // sans réponse et pas inscrit : on garde la question
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
$('mlOui').addEventListener('click', mlOui);
$('mlNon').addEventListener('click', mlNon);
$('mlFerme').addEventListener('click', mlNon);
$('mlQ').addEventListener('click', e => { if (e.target === $('mlQ')) mlNon(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape' && !$('mlQ').hidden){ e.stopPropagation(); mlNon(); } }, true);
