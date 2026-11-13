// Compte DJingood : se connecter avec Google pour que la progression suive le joueur d'un appareil à l'autre.
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

   Données enregistrées **dans le document de progression** : l'identifiant du joueur, son prénom, et sa progression.
   Pas son adresse e-mail : celle-ci reste chez Firebase, du côté de l'authentification (lot 35, comptes par e-mail).

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
     paquet, les étoiles seraient déplacées une deuxième fois, donc fausses.
   - `coach-stats` : les étapes déjà comptées par les statistiques sur ce navigateur (stats.js).
   - `coach-compte-propose` : le jour où la carte de fin a proposé le compte (mails.js) ; ne sert qu'avant d'en avoir un.
   `coach-mails` (la réponse « Vini peut m'écrire », lot 54), elle, suit le compte : on ne repose pas la question ailleurs. */
const CPT_LOCAL = ['coach-midi-map', 'coach-table', 'coach-tables', 'coach-verif', 'coach-collection', 'coach-bibliotheque', 'coach-sons', 'coach-volume', 'coach-journal', 'coach-ordre', 'coach-stats', 'coach-pro', ML_PROPOSE, CPT_KEY];   // coach-pro : la réponse de Stripe (lot 59), redemandée à chaque connexion
const cptOn = () => !!(CPT_CFG && CPT_CFG.apiKey && CPT_CFG.projectId && CPT_CFG.appId);
const cptSuivie = k => typeof k === 'string' && k.startsWith('coach-') && !CPT_LOCAL.includes(k);

let cpt = null;          // personne de connecté, ou { uid, prenom }
let cptFb = null;        // { auth, db } une fois Firebase chargé
let cptPretAuth = null;  // la promesse de chargement de la connexion (app + auth), une seule fois
let cptPretDb = null;    // celle de la base (firestore), chargée seulement quand elle sert
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
function cptNote(){
  if (!cpt) return;
  cptSauve = { uid: cpt.uid, prenom: cpt.prenom, maj: cptMaj, sale: cptSale };   // tenu à jour, sinon une
  try { cptBrut.set(CPT_KEY, JSON.stringify(cptSauve)); } catch (e) {}           // reconnexion reposerait la question
}

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
  let n = somme('coach-lecons') + somme('coach-lecons-oreille') + somme('coach-ch2') + somme('coach-ch3') + somme('coach-ch4') + somme('coach-ch5') + somme('coach-ch6') + somme('coach-ch7') + somme('coach-comprendre');   // + Comprendre (lot 48)
  n += combien(lu('coach-badges')) + combien(lu('coach-quiz'));
  const ex = lu('coach-expert'); n += combien(ex && ex.best);
  const se = lu('coach-set'); n += combien(se && se.best);   // records du set (lot 44)
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
// Les réponses des questions de Vini et le parcours choisi (lot 65) : rien de « gagné », mais le plan du joueur
function cptReponses(d){
  if (typeof d['coach-parcours'] === 'string' && d['coach-parcours']) return true;
  try { const a = JSON.parse(d['coach-accueil'] || 'null'); return !!(a && typeof a === 'object' && a.niveau && !a.passe); } catch (e) { return false; }
}
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
  // le bandeau de bienvenue attend le chargement suivant
  if (cptDemande) try { sessionStorage.setItem(CPT_BONJOUR, JSON.stringify([cptRevoir(), 'Ta progression est revenue.'])); } catch (e) {}
  location.reload();
}
// Un résumé en une ligne, pour que le joueur sache ce qu'il choisit
function cptResume(d){
  const n = k => { try { const v = JSON.parse(d[k] || '{}'); return Object.values(v).reduce((s, x) => s + (+x || 0), 0); } catch (e) { return 0; } };
  const et = n('coach-lecons') + n('coach-ch2') + n('coach-ch3') + n('coach-ch4') + n('coach-ch5') + n('coach-ch6') + n('coach-ch7') + n('coach-comprendre');
  let bg = 0; try { bg = (JSON.parse(d['coach-badges'] || '[]') || []).length; } catch (e) {}
  return `${plur(et, 'étoile', 'étoiles')} et ${plur(bg, 'badge', 'badges')}`;
}

/* ---------- Charger Firebase, seulement quand il le faut ---------- */
function cptScript(src){
  return new Promise((ok, ko) => { const s = document.createElement('script'); s.src = src; s.onload = () => ok(); s.onerror = () => ko(new Error('chargement de ' + src)); document.head.appendChild(s); });
}
/* Firebase est coupé en deux : la **connexion** (app + auth, 48 Ko) et la **base** (firestore, 100 Ko).
   La fenêtre Google n'a besoin que de la première ; la base ne sert qu'une fois connecté. Attendre les deux
   avant d'ouvrir la fenêtre faisait patienter pour rien (lenteur signalée par l'utilisateur, lot 35).
   En plus, la connexion est préparée à l'avance, en douce, pour que le clic soit immédiat. */
const cptUrl = n => `https://www.gstatic.com/firebasejs/${CPT_SDK}/firebase-${n}-compat.js`;
function cptSdkAuth(){
  if (cptPretAuth) return cptPretAuth;
  let deja = false; try { deja = !!window.firebase; } catch (e) {}
  const charge = deja ? Promise.resolve() : cptScript(cptUrl('app')).then(() => cptScript(cptUrl('auth')));
  cptPretAuth = charge.then(() => {
    if (!firebase.apps || !firebase.apps.length) firebase.initializeApp(CPT_CFG);
    if (!cptFb) cptFb = {};
    cptFb.auth = firebase.auth();
    // Sans ça, Firebase envoie ses e-mails (mot de passe oublié) en anglais, quelle que soit la langue du joueur.
    try { cptFb.auth.languageCode = 'fr'; } catch (e) {}
    cptFb.auth.onAuthStateChanged(cptChange);
  });
  cptPretAuth.catch(() => { cptPretAuth = null; });   // un échec ne doit pas bloquer les essais suivants
  return cptPretAuth;
}
function cptSdkDb(){
  if (cptPretDb) return cptPretDb;
  cptPretDb = cptSdkAuth().then(() => {
    let deja = false; try { deja = !!(window.firebase && firebase.firestore); } catch (e) {}
    return deja ? null : cptScript(cptUrl('firestore'));
  }).then(() => { cptFb.db = firebase.firestore(); });
  cptPretDb.catch(() => { cptPretDb = null; });
  return cptPretDb;
}
// Appelé par Firebase à chaque changement : au chargement (session reprise) comme après « Continuer avec Google ».
function cptChange(u){
  // Un premier appel à vide avant la reprise de session ne doit pas effacer ce qu'on retient du compte
  // Firebase annonce « personne » dès qu'il a fini de charger, même si on n'a jamais été connecté : on ne
  // remet l'écran à l'accueil que si on vient vraiment de se déconnecter, sinon le formulaire qu'on est en
  // train de remplir disparaîtrait tout seul.
  if (!u){ const avait = !!cpt; cpt = null; cptBloque = true; cptAttente = null;
    if (avait){ cptPas = 'accueil'; cptFait = ''; cptDemande = false; mlVu = ''; mlQCache(); try { cptBrut.del(CPT_KEY); } catch (e) {} } cptEtat(); if (typeof proCompte === 'function') proCompte(null); return; }
  cpt = { uid: u.uid, prenom: (u.displayName || '').trim().split(/\s+/)[0] || 'toi' };
  stat1('compte');   // la première connexion sur ce navigateur (stats.js)
  if (!cptSauve || cptSauve.uid !== cpt.uid){ cptMaj = 0; cptSale = false; }   // un autre compte que la dernière fois
  cptNote(); cptEtat();
  if (cptFait !== cpt.uid){ cptFait = cpt.uid; cptSync().catch(e => { cptBloque = true; cptDit(cptErreur(e)); cptEtat(); }); }
  if (typeof ppCompteOk === 'function') ppCompteOk();   // l'écran du compte des Premiers pas passe à la suite (lot 65)
  // DJingood Pro (pro.js, chargé après ce fichier : une session reprise tout de suite arrive avant lui, il la rattrape)
  if (typeof proCompte === 'function') proCompte(u);
}

/* ---------- Comparer, puis seulement après, enregistrer ----------
   Tant que ce n'est pas fini, `cptBloque` empêche tout envoi : la progression du compte ne peut pas être écrasée. */
function cptSync(){
  cptBloque = true; cptSouci = ''; cptEtat();
  return cptSdkDb().then(() => cptFb.db.collection(CPT_DOC).doc(cpt.uid).get()).then(s => {
    const brut = s.exists ? s.data() : null, b = brut && brut.donnees;
    const d = b && typeof b === 'object' && !Array.isArray(b) ? b : null;
    const maj = Math.max(0, Math.floor(+(brut && brut.maj)) || 0);
    // Lot 65 (feu rouge du gardien) : un compte créé sur un téléphone n'a encore rien de « gagné », mais il a les réponses
    // des questions et le parcours. Un appareil qui n'en a pas (l'ordinateur où l'on ouvre le lien, un autre navigateur) les
    // reprend, au lieu d'envoyer son vide par-dessus. Après le rechargement, cet appareil les a : on ne repasse pas ici.
    // Seulement s'il n'a vraiment rien de gagné (cptVide) : des étoiles d'ici ne sont jamais remplacées par des réponses.
    if (d && !cptPoids(d) && cptReponses(d) && !cptReponses(cptDonnees()) && cptVide()) return cptReprend(d, maj);
    // Compte neuf, ou compte sans rien de gagné : il prend ce qu'il y a ici.
    // (Ce deuxième cas évite aussi de « reprendre » un document vide en boucle s'il n'a pas de `maj` utilisable.)
    if (!d || !cptPoids(d)){
      cptBloque = false; cptSale = true;
      return cptPousse().then(ok => {
        if (!ok){ cptDemande = false; return; }   // l'envoi a été refusé : cptPousse a déjà dit pourquoi, la fenêtre reste ouverte
        cptDit(`Bienvenue ${cpt.prenom} ! Ton compte est créé. À partir de maintenant, ta progression est enregistrée dessus.`); cptFini(cptBienvenue(), 'Ton compte est créé\u00a0: ta progression est enregistrée.'); });
    }
    if (maj && maj === cptMaj){                                           // personne n'a avancé ailleurs
      cptBloque = false; cptEtat(); if (cptSale) cptBientot(); cptFini(cptRevoir(), 'Ta progression est enregistrée sur ton compte.'); return;
    }
    if (cptVide()) return cptReprend(d, maj);                             // rien de gagné ici : on prend celle du compte
    if (cptMaj && !cptSale) return cptReprend(d, maj);                    // on était à jour : c'est un autre appareil qui a avancé
    // Les deux côtés sont exactement pareils : il n'y a rien à choisir, on note juste où on en est.
    // (Clés triées : Firestore ne les rend pas dans le même ordre que le navigateur.)
    const pareil = o => JSON.stringify(Object.keys(o).sort().map(k => [k, o[k]]));
    if (pareil(d) === pareil(cptDonnees())){
      cptMaj = maj; cptSale = false; cptNote(); cptBloque = false; cptEtat(); cptFini(cptRevoir(), 'Ta progression est enregistrée sur ton compte.'); return;
    }
    // On n'arrive ici que si les deux côtés ont vraiment gagné quelque chose, et qu'ils diffèrent : aucun des
    // deux choix ne peut remplacer une vraie progression par du vide.
    cptAttente = { d, maj }; cptDit(''); cptEtat();
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
  cptPousse().then(ok => { if (!ok){ cptDemande = false; return; }
    cptDit('C\'est la progression de cet ordinateur qui est gardée, et elle est maintenant enregistrée sur ton compte.');
    cptFini('C’est noté\u00a0!', 'La progression de cet ordinateur est maintenant sur ton compte.'); });
}

/* ---------- Se connecter ---------- */
// `accord` : la case « Vini peut m'écrire » de l'écran du compte des Premiers pas (lot 65) ; sans lui, celle de la fenêtre.
// Rend une promesse : rien si ça a marché, l'erreur sinon (les Premiers pas l'affichent dans leur propre écran).
function cptEntrer(accord){
  if (!cptOn()) return Promise.resolve();
  if (typeof accord === 'boolean') mlVoulu = mlActif() ? accord : null;
  else mlChoix();   // « Continuer avec Google » depuis « Créer mon compte » : la case compte aussi (mails.js)
  cptDemande = true; cptDit('Connexion en cours…'); cptBoutons(true);
  return cptSdkAuth()
    .then(() => cptFb.auth.signInWithPopup(new firebase.auth.GoogleAuthProvider()))
    .then(() => { cptBoutons(false); })                                   // la suite est faite par cptChange → cptSync
    .catch(e => { cptDemande = false; cptDit(cptErreur(e)); cptBoutons(false); return e; });
}
// Le navigateur d'une appli (TikTok, Instagram, Facebook, Snapchat…) : Google y refuse la connexion (« disallowed_useragent »),
// alors on n'y montre pas son bouton (lot 65)
const cptAppli = () => /BytedanceWebview|musical_ly|TikTok|Instagram|FBAN|FBAV|FB_IAB|Snapchat|Line\//i.test(navigator.userAgent || '');

/* ---------- Envoyer la progression ---------- */
// Rend vrai si la progression est vraiment partie, faux sinon (refus de Firebase, trop grosse, pas le moment).
function cptPousse(){
  if (!cpt || !cptFb || !cptFb.db || cptAttente || cptStop || cptBloque) return Promise.resolve(false);
  const d = cptDonnees();
  if (JSON.stringify(d).length > CPT_MAX){ cptDit('Ta progression est trop grosse pour être enregistrée en ligne. Préviens-moi : c\'est un défaut du site.'); return Promise.resolve(false); }
  const maj = Date.now();
  cptEnvoi = true; cptLent = false; cptEtat();
  const lent = setTimeout(() => { if (cptEnvoi){ cptLent = true; cptEtat(); } }, CPT_LENT);
  return cptFb.db.collection(CPT_DOC).doc(cpt.uid).set({ v: 1, prenom: cpt.prenom, maj, donnees: d })
    .then(() => { cptMaj = maj; cptSale = false; cptNote(); cptHeure = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }); return true; },
          e => { cptDit(cptErreur(e)); return false; })
    .then(ok => { clearTimeout(lent); cptEnvoi = false; cptLent = false; cptEtat(); return ok; });
}
// Avant de fermer l'onglet, on n'attend pas les 2,5 s
function cptVite(){ if (cpt){ clearTimeout(cptT); cptPousse(); } }
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') cptVite(); });
window.addEventListener('pagehide', cptVite);

/* ---------- Se déconnecter, et effacer le compte ---------- */
// Hors ligne, un envoi en cours ne répond jamais : on ne laisse pas le bouton grisé pour toujours.
function cptSortir(){
  if (!cptFb || !cptFb.auth || !cpt) return;
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
  // il faut la base pour effacer le document
  let marque = null; try { marque = JSON.parse(localStorage.getItem(CPT_KEY) || 'null'); } catch (e) {}
  const uid = (cpt && cpt.uid) || (marque && typeof marque.uid === 'string' ? marque.uid : '');
  if (!uid) return Promise.resolve(true);
  cptStop = true; clearTimeout(cptT);
  const boulot = cptSdkDb()
    .then(() => cptFb.db.collection(CPT_DOC).doc(uid).delete())
    .then(() => (cptFb && cptFb.auth ? cptFb.auth.signOut() : null))
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

/* ---------- Se créer un compte avec une adresse e-mail (lot 35) ----------
   Google ne distingue pas « créer » et « se connecter » : il crée le compte tout seul la première fois.
   L'e-mail et le mot de passe donnent les deux vrais chemins que les gens attendent (choix de l'utilisateur).
   Il faut que « E-mail/Mot de passe » soit activé dans la console Firebase (Authentication → Sign-in method),
   sinon Firebase répond `auth/operation-not-allowed` et on le dit en clair. */
const CPT_MDP_MIN = 6;                        // minimum imposé par Firebase
const cptMailOk = v => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);

function cptCreer(prenom, mail, mdp){
  cptDemande = true; cptDit('Création de ton compte…'); cptBoutons(true);
  cptSdkAuth()
    .then(() => cptFb.auth.createUserWithEmailAndPassword(mail, mdp))
    .then(r => {
      // Le prénom sert partout sur le site (Vini, la pastille) : on le pose sur le compte.
      cpt = { uid: r.user.uid, prenom }; cptNote(); cptEtat();
      return r.user.updateProfile({ displayName: prenom }).catch(() => {});
    })
    .then(() => { cptBoutons(false); })
    .catch(e => { cptDemande = false; cptDit(cptErreur(e)); cptBoutons(false); });
}
function cptEntrerMail(mail, mdp){
  cptDemande = true; cptDit('Connexion en cours…'); cptBoutons(true);
  cptSdkAuth()
    .then(() => cptFb.auth.signInWithEmailAndPassword(mail, mdp))
    .then(() => { cptBoutons(false); })                       // la suite est faite par cptChange → cptSync
    .catch(e => { cptDemande = false; cptDit(cptErreur(e)); cptBoutons(false); });
}
/* ---------- Sans mot de passe (lot 65 « Arrivée et compte ») ----------
   Le compte des Premiers pas se crée avec un prénom et une adresse, sans mot de passe à retenir. Firebase demande un mot de passe
   pour créer un compte par e-mail : on en tire un au hasard, que personne ne voit ni ne garde. Le compte existe donc tout de suite,
   et la progression part dessus dès la première minute. Pour s'y reconnecter (sur l'ordinateur, sur un autre téléphone), un
   « lien magique » part par mail (Brevo depuis le lot 67, sinon Firebase : cptLienEnvoie) : il connecte au même compte.
   Il faut que « Lien envoyé par e-mail (connexion sans mot de passe) » soit activé dans la console Firebase (Authentication →
   Sign-in method → E-mail/Mot de passe) : voir COMPTE-FIREBASE.md. Le lien ouvert sur cet appareil retrouve l'adresse dans
   CPT_LIEN_CLE ; ouvert ailleurs, Firebase demande de la réécrire (c'est sa sécurité). */
const CPT_LIEN_CLE = '__djingood-lien';   // l'adresse à qui le dernier lien a été envoyé (hors `coach-` : elle ne voyage pas avec le compte)
function cptMdpHasard(){
  const o = new Uint8Array(24); crypto.getRandomValues(o);
  return Array.from(o, x => 'abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!#%'[x % 59]).join('');
}
// Rend une promesse : le compte est créé (et connecté), ou l'erreur de Firebase. `accord` : la case « Vini peut m'écrire ».
function cptCreerSansMdp(prenom, mail, accord){
  mlVoulu = mlActif() && typeof accord === 'boolean' ? accord : null;
  cptDemande = true;
  return cptSdkAuth()
    .then(() => cptFb.auth.createUserWithEmailAndPassword(mail, cptMdpHasard()))
    .then(r => { cpt = { uid: r.user.uid, prenom }; cptNote(); cptEtat(); return r.user.updateProfile({ displayName: prenom }).catch(() => {}); })
    .catch(e => { cptDemande = false; throw e; });
}
/* Le lien part d'abord par Brevo, avec notre texte et depuis djingood.fr (lot 67 « Le mail qui arrive », api/lien.js) : le
   mail de Firebase, au texte impossible à changer, tombait souvent dans les spams d'un nouveau venu. Si la fonction n'est pas
   réglée, ne connaît pas l'adresse, ne répond pas ou se trompe, le lien part par Firebase comme avant : rien ne casse. Seul
   « trop de liens demandés » (429 : 3 dans l'heure pour cette adresse) s'arrête là, avec le code `djingood/trop-de-liens` :
   repasser par Firebase contournerait la limite. */
const CPT_LIEN_API = '/api/lien', CPT_LIEN_ATTENTE = 8000, CPT_LIEN_TROP = 'djingood/trop-de-liens';
function cptLienBrevo(mail){
  if (typeof fetch !== 'function') return Promise.resolve(false);
  const ctl = typeof AbortController === 'function' ? new AbortController() : null;
  const fin = ctl ? setTimeout(() => ctl.abort(), CPT_LIEN_ATTENTE) : 0;
  return fetch(CPT_LIEN_API, { method: 'POST', headers: { 'content-type': 'application/json' }, signal: ctl ? ctl.signal : undefined,
    body: JSON.stringify({ mail, retour: location.origin + location.pathname }) })
    .then(r => {
      clearTimeout(fin);
      // 429 avec { erreur: 'trop' } = notre limite ; un 429 sans ce corps vient de la protection de Vercel : Firebase prend le relais
      if (r.status === 429) return r.json().then(d => d, () => null).then(d => {
        if (d && d.erreur === 'trop'){ const e = new Error('trop de liens'); e.code = CPT_LIEN_TROP; throw e; }
        return false;
      });
      return r.ok ? r.json().then(d => !!(d && d.envoye), () => false) : false;
    }, () => { clearTimeout(fin); return false; });
}
// Le lien de connexion, par mail. Il ramène sur cette page, d'où cptLienFinir connecte au compte.
function cptLienEnvoie(mail){
  return cptLienBrevo(mail)
    .then(brevo => brevo ? 'brevo' : cptSdkAuth().then(() => cptFb.auth.sendSignInLinkToEmail(mail, { url: location.origin + location.pathname, handleCodeInApp: true })).then(() => 'firebase'))
    .then(par => {
      try { localStorage.setItem(CPT_LIEN_CLE, mail); } catch (e) {}
      stat1('lien-ordi-envoye');
      stat('lien-envoye', { par });   // pour comparer, dans Umami, les liens envoyés par Brevo et par Firebase
    });
}
// « J'ai déjà un compte » → « Recevoir un lien de connexion » : pour les comptes créés sans mot de passe, et pour ceux qui l'ont oublié
function cptLienDemande(){
  const mail = $('cptMail').value.trim();
  if (!cptMailOk(mail)){ cptDit('Écris l’adresse de ton compte, comme toi@exemple.fr : je t’envoie un lien pour te connecter.'); $('cptMail').focus(); return; }
  cptDit('Envoi en cours…'); cptBoutons(true);
  cptLienEnvoie(mail).then(() => { cptDit('C’est envoyé ! Ouvre le lien sur cet appareil : tu seras connecté. Pas dans ta boîte de réception ? Regarde dans les spams, puis indique à ta messagerie que ce n’est pas un spam : sinon, le lien ne s’ouvre pas.'); cptBoutons(false); },
    e => { cptDit(cptErreur(e)); cptBoutons(false); });
}
// Au chargement, l'adresse de la page est un lien de connexion (le mail qu'on vient d'ouvrir) : on connecte au compte.
// (stats.js l'a déjà retirée de l'adresse, avant Umami, et gardée dans LIEN_CONNEXION)
const cptLienVu = cptOn() && !!LIEN_CONNEXION;
const CPT_ORDI = '__djingood-ordi';   // marque de session : afficher « Bienvenue sur ordinateur », même après le rechargement du compte
function cptLienFinir(){
  cptSdkAuth().then(() => {
    if (!cptFb.auth.isSignInWithEmailLink(LIEN_CONNEXION)) return cptLienRate();
    let m = ''; try { m = localStorage.getItem(CPT_LIEN_CLE) || ''; } catch (e) {}
    if (m && cptMailOk(m)) return cptLienEntre(m);
    openCompte(); cptVa('lien');   // ouvert sur un autre appareil : Firebase veut qu'on réécrive l'adresse
  }, e => { openCompte(); cptDit(cptErreur(e)); });
}
function cptLienEntre(mail){
  cptDemande = true; cptDit('Connexion en cours…'); cptBoutons(true);
  return cptFb.auth.signInWithEmailLink(mail, LIEN_CONNEXION).then(() => {
    cptBoutons(false);
    cptLienPropre();
    try { localStorage.removeItem(CPT_LIEN_CLE); } catch (e) {}
    stat1('ordi-depuis-lien');
    if (!cpMobile()){ try { sessionStorage.setItem(CPT_ORDI, '1'); } catch (e) {} closeCompte(); ordiBienvenue(); }
  }, e => { cptDemande = false; cptBoutons(false); cptLienRate(e); });
}
// Le lien a déjà servi, ou il est trop vieux : on le retire de l'adresse et on propose d'en recevoir un autre
function cptLienRate(e){
  cptLienPropre();
  openCompte(); cptVa('entrer');
  cptDit(e && e.code && !/action-code/.test(e.code) ? cptErreur(e) : 'Ce lien a déjà servi ou il est trop vieux. Écris ton adresse, puis « Recevoir un lien de connexion » : je t’en envoie un nouveau.');
}
// L'adresse de la page sans les morceaux du lien (oobCode, apiKey…) : un rechargement ne doit pas le réessayer
function cptLienPropre(){ try { history.replaceState(null, '', location.pathname + location.hash); } catch (e) {} }

function cptOubliMdp(mail){
  cptDit('Envoi en cours…'); cptBoutons(true);
  cptSdkAuth()
    .then(() => cptFb.auth.sendPasswordResetEmail(mail))
    .then(() => { cptDit('C’est envoyé ! Regarde dans ta boîte mail, et surtout dans les spams. Si le lien n’y est pas cliquable, dis à ta messagerie que ce n’est pas un spam : il s’activera.'); cptBoutons(false); })
    .catch(e => { cptDit(cptErreur(e)); cptBoutons(false); });
}

/* ---------- Ce qu'on affiche ---------- */
function cptErreur(e){
  const c = (e && e.code) || '';
  if (c === 'auth/popup-closed-by-user' || c === 'auth/cancelled-popup-request') return 'Connexion annulée.';
  if (c === 'auth/popup-blocked') return 'Ton navigateur a bloqué la fenêtre de connexion. Autorise les fenêtres surgissantes pour ce site, puis réessaie.';
  if (c === 'auth/network-request-failed' || c === 'unavailable') return 'Pas de connexion internet. Ta progression reste sur cet ordinateur, réessaie plus tard.';
  if (c === 'auth/unauthorized-domain') return 'Ce site n’est pas encore autorisé dans le projet Firebase (Authentication → Settings → Authorized domains).';
  if (c === 'permission-denied') return 'Le compte n’a pas le droit d’écrire. Vérifie les règles de sécurité Firestore.';
  if (c === 'auth/email-already-in-use') return 'Cette adresse a déjà un compte. Choisis « J’ai déjà un compte » juste en dessous.';
  if (c === 'auth/invalid-email') return 'Cette adresse e-mail n’a pas l’air valide.';
  if (c === 'auth/weak-password') return 'Ton mot de passe est trop court : il en faut au moins ' + CPT_MDP_MIN + ' caractères.';
  if (c === 'auth/user-not-found') return 'Aucun compte avec cette adresse. Tu veux peut-être en créer un ?';
  if (c === 'auth/wrong-password' || c === 'auth/invalid-credential' || c === 'auth/invalid-login-credentials') return 'Adresse ou mot de passe incorrect.';
  if (c === 'auth/missing-password') return 'Écris ton mot de passe.';
  if (c === 'auth/too-many-requests') return 'Trop d’essais de suite. Attends quelques minutes, puis réessaie.';
  if (c === CPT_LIEN_TROP) return 'Je t’ai déjà envoyé 3 liens dans l’heure : regarde dans ta boîte de réception et dans tes spams, il y est. Tu pourras en redemander un plus tard.';
  if (c === 'auth/operation-not-allowed') return 'La connexion par e-mail n’est pas activée dans Firebase (Authentication → Sign-in method → E-mail/Mot de passe, et « Lien envoyé par e-mail »).';
  if (c === 'auth/invalid-action-code' || c === 'auth/expired-action-code') return 'Ce lien a déjà servi ou il est trop vieux. Demande-en un nouveau.';
  if (c === 'auth/missing-email') return 'Cette adresse e-mail n’a pas l’air valide.';
  if (c === 'auth/unauthorized-continue-uri' || c === 'auth/invalid-continue-uri' || c === 'auth/missing-continue-uri') return 'Ce site n’est pas encore autorisé dans le projet Firebase (Authentication → Settings → Authorized domains).';
  return 'Ça n’a pas marché : ' + ((e && e.message) || 'erreur inconnue');
}
function cptDit(t){ const m = $('cptMsg'); if (!m) return; m.textContent = t || ''; m.hidden = !t; }
function cptBoutons(off){ for (const id of ['cptGo', 'cptIn', 'cptOut', 'cptVersCreer', 'cptVersEntrer', 'cptOubli', 'cptBascule', 'cptRetour', 'cptLienBtn']){ const b = $(id); if (b) b.disabled = !!off; } }
// Le bouton du compte, en haut à droite de l'en-tête : « Se connecter », ou l'initiale et le prénom. L'initiale est
// dessinée par la feuille de style (data-initiale), pour que le texte du bouton reste le prénom.
const cptInitiale = () => (Array.from((cpt && cpt.prenom !== 'toi' && cpt.prenom) || '?')[0] || '?').toUpperCase();
function cptEtat(){
  const b = $('cptBtn'); if (!b) return;
  b.hidden = !cptOn();
  $('cptNom').textContent = cpt ? cpt.prenom + (cptAttente ? ' ·' : '') : 'Se connecter';
  b.dataset.initiale = cpt ? cptInitiale() : '';
  b.classList.toggle('on', !!cpt);
  b.title = cptAttente ? 'Choisis quelle progression garder' : cpt ? 'Mon compte DJingood' : 'Se connecter pour garder ta progression';
  if ($('compte') && !$('compte').hidden) cptRend();
  mlPret();   // la réponse « Vini peut m'écrire », une fois la progression comparée (mails.js)
}

/* Les écrans de la fenêtre : `accueil` (Google, ou un compte avec son e-mail), `creer`, `entrer`, `oubli`.
   Quand on est connecté, ils laissent la place au compte : qui est connecté (initiale, prénom, adresse) et son état.
   Refaite le 29 oct. 2026 à la demande de l'utilisateur (« Nathan » grisé dans le prénom, « Se connecter » et Google
   pas assez visibles) : Google en premier et en grand, des cases vides, « ← Retour ». */
let cptPas = 'accueil';
const CPT_TITRES = { accueil: 'Garde ta progression', creer: 'Créer mon compte', entrer: 'Content de te revoir\u00a0!', oubli: 'Mot de passe oublié', lien: 'Connexion par lien' };
function cptVa(pas){
  cptPas = pas; mlVoulu = null; cptDit(''); cptRend();
  const f = $(pas === 'creer' ? 'cptPrenom' : pas === 'entrer' || pas === 'oubli' || pas === 'lien' ? 'cptMail' : 'cptTitle');
  if (f) f.focus({ preventScroll: true });
}
function cptRend(){
  const form = cptPas === 'creer' || cptPas === 'entrer' || cptPas === 'oubli' || cptPas === 'lien';
  // Google : pas dans le navigateur d'une appli, où il refuse la connexion (lot 65)
  const dehors = !cpt && !cptAttente, google = dehors && (cptPas === 'accueil' || cptPas === 'entrer') && !cptAppli();
  $('cptChoix').hidden = !cptAttente;
  $('cptAccueil').hidden = !(dehors && cptPas === 'accueil');
  $('cptForm').hidden = !(dehors && form);
  $('cptConnecte').hidden = !cpt;
  $('cptRetour').hidden = !(dehors && form);
  $('cptIn').hidden = !google; $('cptOu').hidden = !google;
  $('cptOuTxt').textContent = cptPas === 'entrer' ? 'ou avec ton e-mail' : 'ou';
  if (cptAttente) $('cptChoixTxt').textContent = 'Ton compte a déjà une progression (' + cptResume(cptAttente.d) + '), et cet ordinateur en a une autre (' + cptResume(cptDonnees()) + '). Laquelle tu gardes ? L’autre sera remplacée. Rien n’est enregistré tant que tu n’as pas choisi.';

  if (dehors && form){
    $('cptChPrenom').hidden = cptPas !== 'creer';
    $('cptChMdp').hidden = cptPas === 'oubli' || cptPas === 'lien';
    $('cptLienBtn').hidden = cptPas !== 'entrer';
    $('cptMdpLab').textContent = cptPas === 'creer' ? 'Choisis un mot de passe' : 'Ton mot de passe';
    $('cptOubli').hidden = cptPas !== 'entrer';
    $('cptGo').textContent = cptPas === 'creer' ? 'Créer mon compte' : cptPas === 'entrer' || cptPas === 'lien' ? 'Me connecter' : 'Envoyer le lien';
    $('cptAide').textContent = cptPas === 'creer' ? CPT_MDP_MIN + ' caractères minimum' : cptPas === 'oubli' ? 'On t’envoie un lien pour en choisir un nouveau.' : '';
    $('cptOubli').parentElement.hidden = cptPas === 'lien';
    $('cptBasTxt').textContent = cptPas === 'creer' ? 'Déjà un compte\u00a0?' : cptPas === 'entrer' ? 'Pas encore de compte\u00a0?' : '';
    $('cptBascule').parentElement.hidden = cptPas === 'lien';
    $('cptBascule').textContent = cptPas === 'creer' ? 'Se connecter' : cptPas === 'entrer' ? 'Créer un compte' : 'Revenir à la connexion';
  }

  $('cptTitle').textContent = cpt ? 'Mon compte' : CPT_TITRES[cptPas] || CPT_TITRES.accueil;
  const sous = cpt ? '' : cptPas === 'accueil' ? 'Tes étoiles et ta série te suivent sur tous tes appareils.' : cptPas === 'oubli' ? 'Écris l’adresse de ton compte.'
    : cptPas === 'lien' ? 'Écris l’adresse où tu as reçu le lien : c’est la sécurité de la connexion sans mot de passe.' : '';
  $('cptSous').textContent = sous; $('cptSous').hidden = !sous;
  $('cptVini').hidden = !!cpt || cptPas === 'creer' || cptPas === 'oubli' || cptPas === 'lien';
  // qui est connecté : l'adresse vient de Firebase (elle n'est pas dans le document de progression)
  $('cptMoi').hidden = !cpt;
  // Connecté (lot 60) : une fenêtre plus large, alignée à gauche, en sections (progression, abonnement, réglages)
  $('compte').querySelector('.cptcard').classList.toggle('connecte', !!cpt);
  if (cpt){
    const u = cptFb && cptFb.auth && cptFb.auth.currentUser, mail = (u && u.email) || '';
    $('cptAvatar').textContent = cptInitiale();
    $('cptMoiNom').textContent = cpt.prenom === 'toi' ? 'Toi' : cpt.prenom;
    $('cptMoiMail').textContent = mail; $('cptMoiMail').hidden = !mail;
    cptRendProgres();
  }
  const bien = !!cpt && !cptAttente && !cptSouci && !cptLent && !cptEnvoi && !cptBloque;
  $('cptEtatTxt').textContent = !cpt ? ''
    : cptAttente ? 'Choisis quelle progression garder, juste en dessous.'
    : cptSouci ? cptSouci
    : cptLent ? 'Pas de réseau : ta progression sera enregistrée dès que tu seras en ligne.'
    : cptEnvoi ? 'Enregistrement en cours…'
    : cptBloque ? 'Vérification de ta progression…'
    : cptHeure ? 'Progression enregistrée à ' + cptHeure
    : 'Ta progression est enregistrée au fur et à mesure.';
  $('cptEtatTxt').classList.toggle('ok', bien);
  $('cptEtatTxt').hidden = !$('cptEtatTxt').textContent;
  $('cptNote').textContent = cpt ? 'Les réglages de ta table restent sur cet ordinateur : ils ne servent qu’ici.'
    : cptPas !== 'creer' ? ''
    : mlActif() ? 'DJingood enregistre ton prénom, ton adresse et ta progression. Ton adresse ne sert à t’écrire que si tu coches la case.'
    : 'DJingood enregistre ton prénom, ton adresse et ta progression. Rien d’autre, et rien n’est partagé.';
  $('cptNote').hidden = !$('cptNote').textContent;
  mlRend(); if (typeof proCompteRend === 'function') proCompteRend();   // le bloc de l'abonnement (pro.js)
  if (typeof volRend === 'function') volRend();   // le curseur du volume (sons.js)
  viniMettre($('cptVini'), 'calme');
}
// « Ta progression » dans « Mon compte » (lot 60) : les mêmes chiffres que la pastille de l'en-tête (renderHud), en phrases
function cptRendProgres(){
  const niv = ($('lvl').textContent || '').replace(/^Niv\.\s*/, ''), xp = parseInt($('xpTxt').textContent, 10) || 0;
  const [eu, tot] = ($('starTot').textContent || '0/0').split('/').map(n => parseInt(n, 10) || 0);
  const serie = typeof goalStreak === 'function' ? goalStreak() : 0;
  $('cptProgNiv').textContent = 'Niveau ' + (niv || '1') + ' · ' + xp.toLocaleString('fr-FR') + ' XP';
  $('cptProgTxt').textContent = eu + (eu > 1 ? ' étoiles' : ' étoile') + ' sur ' + tot
    + (serie > 0 ? ' · série de ' + serie + (serie > 1 ? ' jours' : ' jour') : '');
}
$('cptProgBtn').addEventListener('click', () => closeCompte());   // le lien mène à « Mes progrès » (#progres)

/* ---------- Après la connexion : la fenêtre se ferme toute seule ----------
   Demande de l'utilisateur (29 oct. 2026) : « dès que j'ai créé un compte, je dois fermer une page ». Quand le joueur
   vient de créer son compte ou de se connecter DANS cette page (`cptDemande`), et que la comparaison est finie sans
   question à lui poser, la fenêtre se ferme et un bandeau de Vini dit bienvenue (`cptToast`, 4,5 s). Jamais à la
   reprise d'une session au chargement : on ne dit pas bonjour à chaque page. S'il faut choisir entre deux
   progressions, la fenêtre reste ouverte jusqu'au choix. Si la page se recharge (progression du compte reprise), le
   bandeau passe par sessionStorage (`CPT_BONJOUR`) et s'affiche au chargement suivant. */
let cptDemande = false;
const CPT_BONJOUR = '__djingood-bonjour';
let cptToastT = 0;
const cptPrenomVu = () => (cpt && cpt.prenom !== 'toi' ? cpt.prenom : '');
const cptBienvenue = () => 'Bienvenue' + (cptPrenomVu() ? ' ' + cptPrenomVu() : '') + '\u00a0!';
const cptRevoir = () => 'Content de te revoir' + (cptPrenomVu() ? ', ' + cptPrenomVu() : '') + '\u00a0!';
function cptToast(titre, txt){
  const t = $('cptToast'); if (!t || !titre) return;
  $('cptToastTitre').textContent = titre; $('cptToastTxt').textContent = txt || ''; $('cptToastTxt').hidden = !txt;
  t.hidden = false; clearTimeout(cptToastT); cptToastT = setTimeout(() => { t.hidden = true; }, 4500);
}
function cptFini(titre, txt){
  if (!cptDemande || !cpt || cptBloque || cptAttente) return;
  cptDemande = false;
  if ($('compte').hidden){ mlLienPart = false; return; }   // fenêtre déjà fermée par le joueur : pas de bandeau qui tombe plus tard, en pleine partie
  closeCompte();
  // la case « Vini peut m'écrire » cochée avec une adresse à confirmer : on le dit tout de suite (mails.js)
  const plus = mlLienPart ? ' Pour les mails de Vini, clique sur le lien qu’on vient de t’envoyer.' : '';
  mlLienPart = false;
  cptToast(titre, txt + plus);
}

// Le formulaire, quel que soit l'écran : on vérifie ici avant d'embêter Firebase, les messages sont plus clairs.
function cptEnvoyer(e){
  if (e) e.preventDefault();
  const prenom = $('cptPrenom').value.trim().slice(0, 40), mail = $('cptMail').value.trim(), mdp = $('cptMdp').value;
  if (!cptMailOk(mail)){ cptDit('Écris une adresse e-mail valide, comme toi@exemple.fr.'); $('cptMail').focus(); return; }
  if (cptPas === 'oubli'){ cptOubliMdp(mail); return; }
  if (cptPas === 'lien'){ cptLienEntre(mail); return; }
  if (!mdp){ cptDit('Écris ton mot de passe.'); $('cptMdp').focus(); return; }
  if (cptPas === 'entrer'){ cptEntrerMail(mail, mdp); return; }
  if (!prenom){ cptDit('Écris ton prénom : c’est comme ça que Vini t’appellera.'); $('cptPrenom').focus(); return; }
  if (mdp.length < CPT_MDP_MIN){ cptDit('Ton mot de passe est trop court : il en faut au moins ' + CPT_MDP_MIN + ' caractères.'); $('cptMdp').focus(); return; }
  mlChoix();
  cptCreer(prenom, mail, mdp);
}

function cptOeil(voir){
  const i = $('cptMdp'), b = $('cptOeil');
  i.type = voir ? 'text' : 'password';
  b.setAttribute('aria-pressed', String(!!voir));
  b.textContent = voir ? 'Cacher' : 'Voir';
}
function openCompte(){
  if (!cptOn()) return;
  if (quiz) closeQuiz(); if (run) stopRun();
  cptDit(''); cptBoutons(false);
  $('cptPrenom').value = ''; $('cptMail').value = ''; $('cptMdp').value = ''; $('cptMails').checked = false; cptOeil(false);
  cptPas = 'accueil';
  $('compte').hidden = false; cptRend();   // cptSouci, lui, reste affiché par cptRend
  cptSdkAuth().then(cptRend, e => cptDit(cptErreur(e)));
  mlEtat();   // le joueur a pu se désinscrire depuis un mail : l'interrupteur dit ce que Brevo sait (mails.js)
  $('cptTitle').focus({ preventScroll: true });
}
function closeCompte(){
  if ($('compte').hidden) return;
  $('compte').hidden = true; $('cptMdp').value = '';
  const b = $('cptBtn'); if (b && !b.hidden) b.focus({ preventScroll: true });
  // un lien de connexion ouvert sans aller au bout (fenêtre fermée) : un nouveau venu retrouve les questions de Vini (lot 65)
  if (cptLienVu && !cpt && typeof ppAOuvrir === 'function' && !pp.on && ppAOuvrir()) openPremiers();
}

/* ---------- Arrivée sur l'ordinateur par le lien (lot 65) ----------
   Le joueur a créé son compte sur son téléphone, puis ouvre le lien du mail sur son PC : « Bienvenue sur ordinateur », ce qu'il a
   déjà fait (Comprendre), sa table (reconnue en direct : ppMidi appelle ordiMaj), et un seul bouton vers sa prochaine étape.
   La marque CPT_ORDI survit au rechargement que fait la reprise de la progression du compte ; elle s'efface quand il ferme. */
function ordiBienvenue(){
  if (cpMobile() || !$('ordi').hidden) return;
  viniMettre($('ordiVini'), 'parfait');
  $('ordi').hidden = false; ordiMaj(); $('ordiGo').focus({ preventScroll: true });
}
function ordiMaj(){
  if ($('ordi').hidden) return;
  const p = (cpt && cpt.prenom !== 'toi' && cpt.prenom) || (cptSauve && cptSauve.prenom && cptSauve.prenom !== 'toi' ? cptSauve.prenom : '');
  $('ordiTitre').textContent = 'Bienvenue sur ordinateur' + (p ? ', ' + p : '') + ' !';
  const n = Object.keys(cpStars).length, b = ppBranchee(), k = nextStage(), st = k && STAGES[k];
  const lignes = [
    [n > 0, 'Comprendre la musique', n > 0 ? `${n} leçon${n > 1 ? 's' : ''} sur 7` : 'Quand tu veux'],
    [!!b, b ? 'Ta table : ' + b.nom : 'Branche ta table en USB', b ? 'Reconnue' : 'Je la reconnaîtrai toute seule'],
    [false, st ? st.title : 'Ton premier niveau', '']
  ];
  const ol = $('ordiEtapes'); ol.textContent = '';
  lignes.forEach(([fait, titre, note], i) => {
    const li = document.createElement('li'); li.className = fait ? 'fait' : '';
    const num = document.createElement('span'); num.className = 'ordi-n'; num.setAttribute('aria-hidden', 'true'); num.textContent = fait ? '✓' : String(i + 1);
    const t = document.createElement('span'); t.className = 'ordi-t'; t.textContent = titre;
    const nt = document.createElement('span'); nt.className = 'ordi-note'; nt.textContent = note;
    li.append(num, t, nt); if (fait) li.setAttribute('aria-label', titre + ' : fait'); ol.appendChild(li);
  });
}
function ordiFerme(aller){
  if ($('ordi').hidden) return;
  $('ordi').hidden = true;
  try { sessionStorage.removeItem(CPT_ORDI); } catch (e) {}
  if (aller){ const k = nextStage(); if (k && STAGES[k]) STAGES[k].go(); }
}
$('ordiGo').addEventListener('click', () => ordiFerme(true));
$('ordiFerme').addEventListener('click', () => ordiFerme(false));
$('ordi').addEventListener('click', e => { if (e.target === $('ordi')) ordiFerme(false); });
document.addEventListener('keydown', e => { if (e.key === 'Escape' && !$('ordi').hidden){ e.stopPropagation(); ordiFerme(false); } }, true);

$('cptBtn').addEventListener('click', openCompte);
$('cptClose').addEventListener('click', closeCompte);
$('compte').addEventListener('click', e => { if (e.target === $('compte')) closeCompte(); });
$('cptVersCreer').addEventListener('click', () => cptVa('creer'));
$('cptVersEntrer').addEventListener('click', () => cptVa('entrer'));
$('cptBascule').addEventListener('click', () => cptVa(cptPas === 'entrer' ? 'creer' : 'entrer'));
$('cptOubli').addEventListener('click', () => cptVa('oubli'));
$('cptLienBtn').addEventListener('click', cptLienDemande);
$('cptRetour').addEventListener('click', () => cptVa(cptPas === 'oubli' ? 'entrer' : 'accueil'));
$('cptForm').addEventListener('submit', cptEnvoyer);
$('cptOeil').addEventListener('click', () => cptOeil($('cptMdp').type === 'password'));
$('cptIn').addEventListener('click', () => cptEntrer());
$('cptOut').addEventListener('click', cptSortir);
$('cptGardeCompte').addEventListener('click', () => cptGarde('compte'));
$('cptGardeIci').addEventListener('click', () => cptGarde('ici'));
// Échap : on revient d'abord à l'accueil de la fenêtre, pour ne pas fermer par mégarde ce qu'on était en train de taper
document.addEventListener('keydown', e => {
  if (e.key !== 'Escape' || $('compte').hidden) return;
  e.stopPropagation();
  if (!cpt && !cptAttente && cptPas !== 'accueil') cptVa('accueil'); else closeCompte();
}, true);

/* ---------- Au chargement ---------- */
cptEtat();
let cptOrdiVu = false; try { cptOrdiVu = sessionStorage.getItem(CPT_ORDI) === '1'; } catch (e) {}
// le bandeau « Content de te revoir » ne double pas la carte « Bienvenue sur ordinateur » (lot 65)
try { const b = JSON.parse(sessionStorage.getItem(CPT_BONJOUR) || 'null'); sessionStorage.removeItem(CPT_BONJOUR);
  if (Array.isArray(b) && !cptOrdiVu) setTimeout(() => cptToast(String(b[0] || ''), String(b[1] || '')), 600); } catch (e) {}
if (cptLienVu) cptLienFinir();                                   // la page est un lien de connexion (le mail qu'on vient d'ouvrir)
else if (cptOrdiVu) setTimeout(ordiBienvenue, 600);              // connecté par le lien, puis la progression du compte a rechargé la page
if (cptOn()){
  // Déjà connecté la dernière fois : on reprend la session tout de suite (cptSync comparera ensuite).
  // Sinon, on prépare quand même la connexion une fois la page tranquille, pour que le clic soit immédiat.
  if (cptSauve) cptSdkAuth().catch(() => {});
  else {
    // Jamais pendant une partie : l'image doit rester fluide. On repasse plus tard.
    const tot = () => { if (run){ setTimeout(tot, 5000); return; } cptSdkAuth().catch(() => {}); };
    if (window.requestIdleCallback) requestIdleCallback(tot, { timeout: 6000 }); else setTimeout(tot, 3000);
  }
}
