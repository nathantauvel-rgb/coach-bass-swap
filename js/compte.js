// Compte DJingo : se connecter avec Google pour que la progression suive le joueur d'un appareil à l'autre.
// Tous les fichiers de js/ partagent la même portée et sont chargés dans l'ordre indiqué dans index.html.
'use strict';
/* ---------- Le compte (lot 34) ----------
   Sans compte, le site marche exactement comme avant : tout reste dans le navigateur.
   Avec un compte Google, la progression est aussi enregistrée en ligne et revient sur n'importe quel appareil.

   Comment ça marche :
   - Le site n'a ni dépendance ni étape de construction. Firebase est chargé **à la demande** (3 scripts, seulement
     quand on se connecte ou qu'on était déjà connecté), pour que la page reste aussi rapide qu'avant pour les autres.
   - Chaque fichier de js/ lit sa progression dans localStorage **au chargement de la page**. Quand la progression
     du compte arrive, on la réécrit dans localStorage puis on recharge la page (comme « Tout recommencer à zéro ») :
     c'est la seule façon sûre de la faire prendre partout sans toucher aux 18 fichiers qui la lisent.
   - L'enregistrement passe par un seul point : `localStorage.setItem` est enveloppé ici. Toute écriture d'une clé
     `coach-…` suivie par le compte déclenche un envoi, 2,5 s plus tard (pour ne pas envoyer 10 fois d'affilée).

   **Règle la plus importante : on ne renvoie rien avant d'avoir comparé.** À chaque chargement, tant que `cptBloque`
   est vrai, aucun envoi n'est possible. `cptSync()` relit d'abord le document du compte et décide (voir plus bas).
   Sans ça, un deuxième appareil écraserait tout seul la progression faite sur le premier.

   Ce qui NE suit PAS le compte : tout ce qui décrit cet ordinateur et cette table (réglages MIDI, nom de la table,
   vérification de la table, collection rekordbox importée, sons coupés), et le journal des testeurs.

   Données enregistrées en ligne : l'identifiant Google du joueur, son prénom, et sa progression. **Pas son e-mail.**

   CPT_CFG : la configuration du projet Firebase. Ces valeurs ne sont pas des secrets (elles sont visibles dans la page
   de n'importe quel site Firebase) : la sécurité vient des règles de `firestore.rules`, qui n'autorisent chaque joueur
   que sur son propre document. Tant qu'elle est vide, le bouton reste caché et rien ne change sur le site. */
let CPT_CFG = { apiKey: 'AIzaSyCRQf6s3sNfUiJ-WIrRNBXV9tb09ZFeaAU', authDomain: 'djingo-1e1f4.firebaseapp.com', projectId: 'djingo-1e1f4', appId: '1:613784014718:web:d001824b712018417c6d2f' };
try { if (window.DJINGO_FIREBASE) CPT_CFG = window.DJINGO_FIREBASE; } catch (e) {}   // pour essayer un autre projet sans modifier ce fichier
const CPT_SDK = '11.6.0';                     // version de Firebase chargée depuis gstatic.com
const CPT_DOC = 'joueurs';                    // la collection Firestore : un document par joueur, nommé par son identifiant Google
const CPT_KEY = 'coach-compte';               // sur cet ordinateur : { uid, prenom, maj, sale } de la dernière connexion
const CPT_PAUSE = 2500;                       // délai avant d'envoyer, en ms
const CPT_LENT = 5000;                        // au-delà, on dit que la connexion ne répond pas
const CPT_FIN = 3000;                         // temps maximum accordé à l'effacement du compte, pour ne jamais bloquer la remise à zéro
const CPT_TOUR = '__djingo-compte-repris';    // marque de session : on ne reprend la progression du compte qu'une fois par onglet
const CPT_MAX = 400000;                       // au-delà, on n'envoie pas (garde-fou ; Firestore refuse de toute façon au-delà de 1 Mo)
/* Les clés qui restent sur cet ordinateur et ne partent jamais en ligne.
   - La table et la collection rekordbox : elles décrivent CET appareil, elles n'ont pas de sens ailleurs.
   - `coach-journal` : le journal des testeurs. Il compte le temps toutes les 15 secondes, donc le suivre ferait un
     envoi toutes les 15 secondes par onglet ouvert, pour rien. Le rapport se copie depuis l'appareil de toute façon.
   - `coach-ordre` : ce n'est pas de la progression mais le **format** des données de ce navigateur (lot 26, nouvel
     ordre du chapitre 1). Il est posé à chaque chargement par `ordreMigre`. S'il voyageait et revenait absent d'un
     paquet, les étoiles seraient déplacées une deuxième fois, donc fausses. */
const CPT_LOCAL = ['coach-midi-map', 'coach-table', 'coach-verif', 'coach-collection', 'coach-bibliotheque', 'coach-sons', 'coach-journal', 'coach-ordre', CPT_KEY];
const cptOn = () => !!(CPT_CFG && CPT_CFG.apiKey && CPT_CFG.projectId && CPT_CFG.appId);
const cptSuivie = k => typeof k === 'string' && k.startsWith('coach-') && !CPT_LOCAL.includes(k);

let cpt = null;          // personne de connecté, ou { uid, prenom }
let cptFb = null;        // { auth, db } une fois Firebase chargé
let cptPret = null;      // la promesse de chargement de Firebase (une seule fois)
let cptT = 0;            // minuteur de l'envoi différé
let cptEnvoi = false;    // un envoi est en cours
let cptLent = false;     // l'envoi en cours met trop de temps : sûrement pas de connexion
let cptHeure = '';       // heure du dernier envoi réussi
let cptAttente = null;   // { d, maj } : progression du compte en attente d'un choix du joueur
let cptStop = false;     // vrai pendant « Tout recommencer à zéro » : plus rien ne doit être renvoyé en ligne
let cptBloque = true;    // vrai tant que la progression du compte n'a pas été comparée : aucun envoi possible
let cptMaj = 0;          // `maj` du dernier document que cet ordinateur a écrit ou repris
let cptSale = false;     // des changements locaux ne sont pas encore enregistrés en ligne
let cptFait = '';        // identifiant du compte déjà comparé dans cette page
let cptSouci = '';       // un problème qui dure (pas de réseau) : affiché dans la fenêtre tant qu'il n'est pas réglé

// Ce que cet ordinateur retient du compte, relu et validé
let cptSauve = null;
try { cptSauve = JSON.parse(localStorage.getItem(CPT_KEY) || 'null'); } catch (e) {}
if (!cptSauve || typeof cptSauve !== 'object' || typeof cptSauve.uid !== 'string') cptSauve = null;
else { cptMaj = Math.max(0, Math.floor(+cptSauve.maj) || 0); cptSale = !!cptSauve.sale; }
function cptNote(){ try { if (cpt) cptBrut.set(CPT_KEY, JSON.stringify({ uid: cpt.uid, prenom: cpt.prenom, maj: cptMaj, sale: cptSale })); } catch (e) {} }

/* ---------- Un seul point d'enregistrement ----------
   `localStorage.setItem` est enveloppé : tout le reste du site continue de l'appeler sans le savoir.
   `cptBrut` garde les vraies fonctions, pour écrire sans déclencher d'envoi. */
const cptBrut = { set: null, del: null };
try {
  cptBrut.set = localStorage.setItem.bind(localStorage);
  cptBrut.del = localStorage.removeItem.bind(localStorage);
  localStorage.setItem = function (k, v){ cptBrut.set(k, v); if (cpt && cptSuivie(k)) cptTouche(); };
  localStorage.removeItem = function (k){ cptBrut.del(k); if (cpt && cptSuivie(k)) cptTouche(); };
} catch (e) { cptBrut.set = () => {}; cptBrut.del = () => {}; }   // navigateur qui refuse le stockage : le site marche sans
function cptTouche(){ if (!cptSale){ cptSale = true; cptNote(); } cptBientot(); }
function cptBientot(){ clearTimeout(cptT); cptT = setTimeout(cptPousse, CPT_PAUSE); }

/* ---------- La progression, vue comme un paquet ---------- */
function cptDonnees(){
  const d = {};
  try { for (const k of Object.keys(localStorage)) if (cptSuivie(k)){ const v = localStorage.getItem(k); if (typeof v === 'string') d[k] = v; } } catch (e) {}
  return d;
}
/* Ce que ce paquet représente vraiment de **gagné** : étoiles, badges, questions trouvées, records Expert,
   coffres, jours d'objectif atteints, missions faites, test de placement.
   On ne peut pas se contenter de regarder quelles clés existent : un appareil tout neuf écrit déjà un parcours,
   les quêtes du jour et un objectif **avant même** qu'on se connecte. Le site croyait alors qu'il avait « une
   progression » et proposait de remplacer celle du compte par du vide — un clic suffisait à tout perdre
   (défaut trouvé par le gardien). Avec un poids, une progression nulle est reconnue comme nulle. */
function cptPoids(d){
  if (!d || typeof d !== 'object') return 0;
  const lu = k => { try { return JSON.parse(d[k] || 'null'); } catch (e) { return null; } };
  const vals = v => (v && typeof v === 'object' ? Object.values(v) : []);
  const combien = v => (v && typeof v === 'object' ? Object.keys(v).length : 0);
  const somme = k => vals(lu(k)).reduce((t, x) => t + (Math.max(0, Math.floor(+x)) || 0), 0);
  let n = somme('coach-lecons') + somme('coach-lecons-oreille') + somme('coach-ch2') + somme('coach-ch3') + somme('coach-ch4');
  n += combien(lu('coach-badges')) + combien(lu('coach-quiz'));
  const ex = lu('coach-expert'); n += combien(ex && ex.best);
  const qt = lu('coach-quetes'); if (qt) n += combien(qt.ouverts) + (vals(qt.cpt).some(x => +x > 0) ? 1 : 0) + ((+qt.xp || 0) > 0 ? 1 : 0);
  const ob = lu('coach-objectif'); if (ob) n += combien(ob.faits);
  // `total` = les paires validées. Le badge « Pour de vrai » les couvre déjà aujourd'hui, mais on ne veut pas
  // dépendre d'un badge : si sa règle changeait, ces paires deviendraient invisibles pour le poids.
  const ms = lu('coach-missions'); if (ms) n += combien(ms.done) + ((+ms.total || 0) > 0 ? 1 : 0);
  const pr = lu('coach-entrainement'); if (vals(pr).some(x => typeof x === 'number' && x > 0)) n += 1;
  if (typeof d['coach-test'] === 'string' && d['coach-test']) n += 1;
  return n;
}
// Vrai si ce navigateur n'a rien à perdre : on peut prendre la progression du compte sans rien demander.
function cptVide(){ return cptPoids(cptDonnees()) === 0; }
// Remplace la progression de cet ordinateur par celle du compte (puis on recharge la page)
function cptEcrit(d){
  try {
    for (const k of Object.keys(localStorage)) if (cptSuivie(k)) cptBrut.del(k);
    for (const k of Object.keys(d)) if (cptSuivie(k) && typeof d[k] === 'string') cptBrut.set(k, d[k]);
  } catch (e) {}
}
/* On reprend la progression du compte : on l'écrit, on note où on en est, et on recharge pour que tous les
   fichiers de js/ la relisent. **Garde-fou indispensable** : si on n'arrive pas à retenir où on en est
   (stockage refusé ou plein), ou si on a déjà repris dans cet onglet, le chargement suivant reprendrait la même
   décision et la page se rechargerait en boucle, sans fin et sans message (défaut trouvé par le gardien :
   321 rechargements en 8 secondes). Dans ce cas on garde ce qu'on vient d'écrire et on ne recharge pas. */
function cptReprend(d, maj){
  let deja = false; try { deja = sessionStorage.getItem(CPT_TOUR) === cpt.uid; } catch (e) {}
  cptEcrit(d);
  cptMaj = Math.max(0, Math.floor(+maj) || 0); cptSale = false; cptNote();
  let marque = false;
  try { sessionStorage.setItem(CPT_TOUR, cpt.uid); marque = sessionStorage.getItem(CPT_TOUR) === cpt.uid; } catch (e) {}
  let retenu = false; try { const v = JSON.parse(localStorage.getItem(CPT_KEY) || 'null'); retenu = !!v && (Math.floor(+v.maj) || 0) === cptMaj; } catch (e) {}
  if (deja || !marque || !retenu){
    cptBloque = false; cptAttente = null; cptDit('');
    cptSouci = deja ? 'Ta progression est revenue. Recharge la page toi-même pour la voir.'
      : 'Ta progression est revenue. Ce navigateur ne sait pas la retenir : recharge la page toi-même pour la voir.';
    cptEtat(); return;
  }
  location.reload();
}
// Un résumé en une ligne, pour que le joueur sache ce qu'il choisit
function cptResume(d){
  const n = k => { try { const v = JSON.parse(d[k] || '{}'); return Object.values(v).reduce((s, x) => s + (+x || 0), 0); } catch (e) { return 0; } };
  const et = n('coach-lecons') + n('coach-ch2') + n('coach-ch3') + n('coach-ch4');
  let bg = 0; try { bg = (JSON.parse(d['coach-badges'] || '[]') || []).length; } catch (e) {}
  return `${plur(et, 'étoile', 'étoiles')} et ${plur(bg, 'badge', 'badges')}`;
}

/* ---------- Charger Firebase, seulement quand il le faut ---------- */
function cptScript(src){
  return new Promise((ok, ko) => { const s = document.createElement('script'); s.src = src; s.onload = () => ok(); s.onerror = () => ko(new Error('chargement de ' + src)); document.head.appendChild(s); });
}
function cptSdk(){
  if (cptPret) return cptPret;
  const dejaLa = () => { try { return !!window.firebase; } catch (e) { return false; } };
  const charge = dejaLa() ? Promise.resolve() : (() => {
    const u = n => `https://www.gstatic.com/firebasejs/${CPT_SDK}/firebase-${n}-compat.js`;
    return cptScript(u('app')).then(() => Promise.all([cptScript(u('auth')), cptScript(u('firestore'))]));
  })();
  cptPret = charge.then(() => {
    if (!firebase.apps || !firebase.apps.length) firebase.initializeApp(CPT_CFG);
    cptFb = { auth: firebase.auth(), db: firebase.firestore() };
    cptFb.auth.onAuthStateChanged(cptChange);
  });
  cptPret.catch(() => { cptPret = null; });   // un échec ne doit pas bloquer les essais suivants
  return cptPret;
}
// Appelé par Firebase à chaque changement : au chargement (session reprise) comme après « Continuer avec Google ».
function cptChange(u){
  // Un premier appel à vide avant la reprise de session ne doit pas effacer ce qu'on retient du compte
  if (!u){ const avait = !!cpt; cpt = null; cptBloque = true; cptAttente = null; if (avait){ cptFait = ''; try { cptBrut.del(CPT_KEY); } catch (e) {} } cptEtat(); return; }
  cpt = { uid: u.uid, prenom: (u.displayName || '').trim().split(/\s+/)[0] || 'toi' };
  if (!cptSauve || cptSauve.uid !== cpt.uid){ cptMaj = 0; cptSale = false; }   // un autre compte que la dernière fois
  cptNote(); cptEtat();
  if (cptFait !== cpt.uid){ cptFait = cpt.uid; cptSync().catch(e => { cptBloque = true; cptDit(cptErreur(e)); cptEtat(); }); }
}

/* ---------- Comparer, puis seulement après, enregistrer ----------
   Tant que ce n'est pas fini, `cptBloque` empêche tout envoi : la progression du compte ne peut pas être écrasée. */
function cptSync(){
  cptBloque = true; cptSouci = ''; cptEtat();
  return cptFb.db.collection(CPT_DOC).doc(cpt.uid).get().then(s => {
    const brut = s.exists ? s.data() : null, b = brut && brut.donnees;
    const d = b && typeof b === 'object' && !Array.isArray(b) ? b : null;
    const maj = Math.max(0, Math.floor(+(brut && brut.maj)) || 0);
    // Compte neuf, ou compte sans rien de gagné : il prend ce qu'il y a ici.
    // (Ce deuxième cas évite aussi de « reprendre » un document vide en boucle s'il n'a pas de `maj` utilisable.)
    if (!d || !cptPoids(d)){
      cptBloque = false; cptSale = true;
      return cptPousse().then(() => { cptDit(`Bienvenue ${cpt.prenom} ! Ton compte est créé. À partir de maintenant, ta progression est enregistrée dessus.`); });
    }
    if (maj && maj === cptMaj){                                           // personne n'a avancé ailleurs
      cptBloque = false; cptEtat(); if (cptSale) cptBientot(); return;
    }
    if (cptVide()) return cptReprend(d, maj);                             // rien de gagné ici : on prend celle du compte
    if (cptMaj && !cptSale) return cptReprend(d, maj);                    // on était à jour : c'est un autre appareil qui a avancé
    // On n'arrive ici que si les deux côtés ont vraiment gagné quelque chose : aucun des deux choix ne peut
    // remplacer une vraie progression par du vide.
    cptAttente = { d, maj }; cptEtat();
  }, e => {
    // Pas de réseau au chargement : on reste bloqué (rien ne doit partir avant d'avoir comparé), on le dit,
    // et on réessaie dès que la connexion revient.
    cptSouci = cptErreur(e); cptEtat();
  });
}
// Le réseau revient : on refait la comparaison, et seulement après, les envois repartent.
window.addEventListener('online', () => { if (cpt && cptFb && cptBloque && !cptAttente && !cptStop) cptSync(); });
// Le joueur a choisi : garder celle du compte, ou celle de cet ordinateur
function cptGarde(quoi){
  const a = cptAttente; cptAttente = null;
  if (quoi === 'compte' && a) return cptReprend(a.d, a.maj);
  cptBloque = false; cptSale = true; cptNote(); cptEtat();
  cptPousse().then(() => cptDit('C\'est la progression de cet ordinateur qui est gardée, et elle est maintenant enregistrée sur ton compte.'));
}

/* ---------- Se connecter ---------- */
function cptEntrer(){
  if (!cptOn()) return;
  cptDit('Connexion en cours…'); cptBoutons(true);
  cptSdk()
    .then(() => cptFb.auth.signInWithPopup(new firebase.auth.GoogleAuthProvider()))
    .then(() => { cptBoutons(false); })                                   // la suite est faite par cptChange → cptSync
    .catch(e => { cptDit(cptErreur(e)); cptBoutons(false); });
}

/* ---------- Envoyer la progression ---------- */
function cptPousse(){
  if (!cpt || !cptFb || cptAttente || cptStop || cptBloque) return Promise.resolve();
  const d = cptDonnees();
  if (JSON.stringify(d).length > CPT_MAX){ cptDit('Ta progression est trop grosse pour être enregistrée en ligne. Préviens-moi : c\'est un défaut du site.'); return Promise.resolve(); }
  const maj = Date.now();
  cptEnvoi = true; cptLent = false; cptEtat();
  const lent = setTimeout(() => { if (cptEnvoi){ cptLent = true; cptEtat(); } }, CPT_LENT);
  return cptFb.db.collection(CPT_DOC).doc(cpt.uid).set({ v: 1, prenom: cpt.prenom, maj, donnees: d })
    .then(() => { cptMaj = maj; cptSale = false; cptNote(); cptHeure = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }); },
          e => { cptDit(cptErreur(e)); })
    .then(() => { clearTimeout(lent); cptEnvoi = false; cptLent = false; cptEtat(); });
}
// Avant de fermer l'onglet, on n'attend pas les 2,5 s
function cptVite(){ if (cpt){ clearTimeout(cptT); cptPousse(); } }
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') cptVite(); });
window.addEventListener('pagehide', cptVite);

/* ---------- Se déconnecter, et effacer le compte ---------- */
// Hors ligne, un envoi en cours ne répond jamais : on ne laisse pas le bouton grisé pour toujours.
function cptSortir(){
  if (!cptFb || !cpt) return;
  cptBoutons(true); clearTimeout(cptT);
  Promise.race([cptPousse(), new Promise(ok => setTimeout(ok, CPT_FIN))])
    .then(() => cptFb.auth.signOut()).then(
      () => { cptAttente = null; cptSouci = ''; cptDit('Tu es déconnecté. Ta progression reste sur cet ordinateur.'); cptBoutons(false); },
      e => { cptDit(cptErreur(e)); cptBoutons(false); });
}
/* Appelé par « Tout recommencer à zéro » (js/avis.js) : efface aussi le document du compte, sinon la progression
   reviendrait toute seule à la prochaine connexion. Renvoie `false` si on n'a pas pu l'effacer (hors ligne,
   Firestore ne répond jamais) : dans ce cas `avisReset` n'efface rien du tout et le dit, plutôt que de promettre
   un effacement qui n'a pas eu lieu. */
function cptOublie(){
  if (!cptOn()) return Promise.resolve(true);
  let marque = null; try { marque = JSON.parse(localStorage.getItem(CPT_KEY) || 'null'); } catch (e) {}
  const uid = (cpt && cpt.uid) || (marque && typeof marque.uid === 'string' ? marque.uid : '');
  if (!uid) return Promise.resolve(true);
  cptStop = true; clearTimeout(cptT);
  const boulot = cptSdk()
    .then(() => cptFb.db.collection(CPT_DOC).doc(uid).delete())
    .then(() => (cptFb ? cptFb.auth.signOut() : null))
    .then(() => true, () => false);
  return Promise.race([boulot, new Promise(ok => setTimeout(() => ok(false), CPT_FIN))])
    .then(ok => { if (!ok) cptStop = false; return ok; });
}
// L'effacement en ligne n'a pas pu se faire : on le dit dans la fenêtre « Mon avis », et rien n'a été effacé.
function cptResetKo(){
  const m = $('avMsg'); if (!m) return;
  m.textContent = 'Pas de réseau : ta progression en ligne n’a pas pu être effacée, donc rien n’a été effacé. Reconnecte-toi à internet et réessaie. Tu peux aussi te déconnecter d’abord : « Tout effacer » n’effacera alors que cet ordinateur.';
  m.hidden = false;
}

/* ---------- Ce qu'on affiche ---------- */
function cptErreur(e){
  const c = (e && e.code) || '';
  if (c === 'auth/popup-closed-by-user' || c === 'auth/cancelled-popup-request') return 'Connexion annulée.';
  if (c === 'auth/popup-blocked') return 'Ton navigateur a bloqué la fenêtre de connexion. Autorise les fenêtres surgissantes pour ce site, puis réessaie.';
  if (c === 'auth/network-request-failed' || c === 'unavailable') return 'Pas de connexion internet. Ta progression reste sur cet ordinateur, réessaie plus tard.';
  if (c === 'auth/unauthorized-domain') return 'Ce site n\'est pas encore autorisé dans le projet Firebase (Authentication → Settings → Authorized domains).';
  if (c === 'permission-denied') return 'Le compte n\'a pas le droit d\'écrire. Vérifie les règles de sécurité Firestore.';
  return 'Ça n\'a pas marché : ' + ((e && e.message) || 'erreur inconnue');
}
function cptDit(t){ const m = $('cptMsg'); if (!m) return; m.textContent = t || ''; m.hidden = !t; }
function cptBoutons(off){ for (const id of ['cptIn', 'cptOut']){ const b = $(id); if (b) b.disabled = !!off; } }
// La pastille de l'en-tête
function cptEtat(){
  const b = $('cptBtn'); if (!b) return;
  b.hidden = !cptOn();
  b.textContent = cpt ? cpt.prenom + (cptAttente ? ' ·' : '') : 'Se connecter';
  b.classList.toggle('on', !!cpt);
  b.title = cptAttente ? 'Choisis quelle progression garder' : cpt ? 'Mon compte DJingo' : 'Se connecter pour garder ta progression';
  if ($('compte') && !$('compte').hidden) cptRend();
}
// Le contenu de la fenêtre
function cptRend(){
  $('cptIn').hidden = !!cpt; $('cptOut').hidden = !cpt;
  $('cptChoix').hidden = !cptAttente;
  if (cptAttente) $('cptChoixTxt').textContent = `Ton compte a déjà une progression (${cptResume(cptAttente.d)}), et cet ordinateur en a une autre (${cptResume(cptDonnees())}). Laquelle tu gardes ? L'autre sera remplacée. Rien n'est enregistré tant que tu n'as pas choisi.`;
  $('cptEtatTxt').textContent = !cpt ? 'Sans compte, ta progression reste sur cet ordinateur et disparaît si tu changes de navigateur.'
    : cptAttente ? 'Choisis quelle progression garder, juste en dessous.'
    : cptSouci ? cptSouci
    : cptLent ? 'Pas de réseau : ta progression sera enregistrée dès que tu seras en ligne.'
    : cptEnvoi ? 'Enregistrement en cours…'
    : cptBloque ? 'Vérification de ta progression…'
    : cptHeure ? `Progression enregistrée à ${cptHeure}.` : 'Ta progression est enregistrée au fur et à mesure.';
}
function openCompte(){
  if (!cptOn()) return;
  if (quiz) closeQuiz(); if (run) stopRun();
  cptDit(''); cptBoutons(false); $('compte').hidden = false; cptRend();   // cptSouci, lui, reste affiché par cptRend
  cptSdk().then(cptRend, e => cptDit(cptErreur(e)));
  $('cptTitle').focus({ preventScroll: true });
}
function closeCompte(){ if ($('compte').hidden) return; $('compte').hidden = true; const b = $('cptBtn'); if (b && !b.hidden) b.focus({ preventScroll: true }); }

$('cptBtn').addEventListener('click', openCompte);
$('cptClose').addEventListener('click', closeCompte);
$('compte').addEventListener('click', e => { if (e.target === $('compte')) closeCompte(); });
$('cptIn').addEventListener('click', cptEntrer);
$('cptOut').addEventListener('click', cptSortir);
$('cptGardeCompte').addEventListener('click', () => cptGarde('compte'));
$('cptGardeIci').addEventListener('click', () => cptGarde('ici'));
document.addEventListener('keydown', e => { if (e.key === 'Escape' && !$('compte').hidden){ e.stopPropagation(); closeCompte(); } }, true);

/* ---------- Au chargement ---------- */
cptEtat();
// Déjà connecté la dernière fois : on recharge Firebase en silence pour reprendre la session, puis cptSync compare.
if (cptOn() && cptSauve) cptSdk().catch(() => {});
