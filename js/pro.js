// DJingood Pro (lot 59, découpe du lot 68) : l'abonnement qui ouvre tout DJingood. Chargé juste après compte.js.
// Tous les fichiers de js/ partagent la même portée et sont chargés dans l'ordre indiqué dans index.html.
'use strict';
/* Décision de l'utilisateur du 10 nov. 2026 (lot 68), qui remplace celle des 6-8 nov. (« rien de ce qui existe ne passe en
   Pro », Pro = les tutos) : 3 exercices gratuits pour comprendre le concept, tout le reste dans Pro. Ce qui est gratuit est
   décidé dans niveaux.js (niveauPro, chapitrePro, proBloque) et tutos.js (le seul tuto `gratuit`). 4,99 € par mois ou
   49,99 € par an. Pas d'essai gratuit pour tout le monde, mais un mois offert, une fois, aux joueurs d'avant Pro (plus bas).
   Écran d'après la maquette v5 (captures/maquette-pro/, hors Git) : pas de texte en dégradé, pas de reflet animé, pas de
   halo de lumière dans le fond (« ça fait IA »).

   Tant que PRO_PRET est faux, rien ne change pour les joueurs : aucun cadenas, tous les tutos s'ouvrent (et l'onglet
   « Tutos » est lui-même caché, TUTOS_PRET). Pour essayer : ?pro=1 dans l'adresse (retenu pour l'onglet du navigateur) ;
   les tests posent window.DJINGOOD_PRO.

   Qui est Pro : c'est Stripe qui le sait (api/pro.js) ; le site le lui demande avec le jeton du compte, à chaque connexion,
   et retient la réponse dans coach-pro (sur cet ordinateur seulement, CPT_LOCAL) pour ne pas montrer de cadenas à un
   abonné le temps que la réponse arrive. Les tutos étant dans le site, un curieux peut toujours les ouvrir : le cadenas est
   une porte, pas un coffre. */
// PRO_PRET, l’interrupteur, est dans js/pro-pret.js (lot 68 : la page de présentation le lit aussi)
const proEssai = (() => { try { if (/[?&]pro=1(&|$)/.test(location.search)) sessionStorage.setItem('djingood-pro', '1'); return sessionStorage.getItem('djingood-pro') === '1'; } catch (e) { return false; } })();
const proVerrou = () => PRO_PRET || proEssai || !!window.DJINGOOD_PRO;
const PRO_API = '/api/pro', PRO_LENT = 10000, PRO_CLE = 'coach-pro', PRO_FORMULES = ['mois', 'an'];
const PRO_PRIX = {
  mois: ['4,99 €', '/ mois', 'Sans engagement : tu arrêtes quand tu veux.'],
  an: ['49,99 €', '/ an', '<s>59,88 €</s> soit 4,17 € par mois · 2 mois offerts']
};

/* ---------- Ce qu'on sait de l'abonnement ----------
   coach-pro : { uid, actif, formule, jusqua (secondes), annule, essai, offert } du dernier compte vérifié sur cet ordinateur
   (essai : pendant le mois offert ; offert : le mois offert l'attend, lot 68). Lot 76 : semaine (pendant les 7 jours
   gratuits) et essaiDispo (faux = ce compte a déjà eu un abonnement : plus d'essai gratuit). */
// Lot 81 : rattrapage = la fin (en secondes) de l'offre de rattrapage de ce compte (api/pro.js), ou null
const proVide = uid => ({ uid: uid || '', actif: false, formule: null, jusqua: null, annule: false, essai: false, offert: false, semaine: false, essaiDispo: true, rattrapage: null });
const proNombre = x => typeof x === 'number' && isFinite(x) ? x : null;
let proEtat = (() => {
  try {
    const d = JSON.parse(localStorage.getItem(PRO_CLE));
    if (!d || typeof d !== 'object' || typeof d.uid !== 'string' || !d.uid) return proVide();
    return { uid: d.uid, actif: d.actif === true, formule: PRO_FORMULES.includes(d.formule) ? d.formule : null,
      jusqua: typeof d.jusqua === 'number' && isFinite(d.jusqua) ? d.jusqua : null, annule: d.annule === true, essai: d.essai === true, offert: d.offert === true,
      semaine: d.semaine === true, essaiDispo: d.essaiDispo !== false, rattrapage: proNombre(d.rattrapage) };
  } catch (e) { return proVide(); }
})();
// Le compte de cet ordinateur : celui qui est connecté, sinon le dernier (la session se reprend au chargement)
const proUid = () => (cpt && cpt.uid) || (cptSauve && cptSauve.uid) || '';
const proActif = () => proEtat.actif && !!proEtat.uid && proEtat.uid === proUid() && (!proEtat.jusqua || proEtat.jusqua * 1000 > Date.now() - 3 * 864e5);
const proLibre = t => !proVerrou() || !!t.gratuit || proActif();
function proMaj(d, uid){
  proEtat = d && d.pro ? { uid, actif: true, formule: PRO_FORMULES.includes(d.formule) ? d.formule : null,
    jusqua: typeof d.jusqua === 'number' ? d.jusqua : null, annule: !!d.annule, essai: !!d.essai, semaine: !!d.semaine, essaiDispo: false }
    : Object.assign(proVide(uid), { offert: !!(d && d.offert), essaiDispo: !(d && d.essaiDispo === false), rattrapage: proNombre(d && d.rattrapage) });
  try { localStorage.setItem(PRO_CLE, JSON.stringify(proEtat)); } catch (e) {}
  proReponse = true;
  proRafraichit(); proCompteRend(); proFondateurPlusTard();
}
let proReponse = false;   // Stripe a répondu pour ce compte depuis le chargement (le mois offert attend sa réponse)
// Lot 68 : tout le site dépend de l'abonnement ; une nouvelle réponse de Stripe redessine ce qui est à l'écran
function proRafraichit(){
  // pendant « Préparation… », le bouton garde son texte (gardien, 11 nov.)
  if (!run){ renderHud(); renderExpert(); if (!/^Préparation/.test($('startBtn').textContent)){ setStartBtn(false); updateSetup(); } }
  if (view === 'accueil') renderHome(); else if (view === 'entrainer' && !prac) renderTrain(); else if (view === 'vrai') renderReal();
  else if (view === 'tutos') renderTutos(); else if (view === 'progres') renderProgres();
}

/* ---------- Parler à la fonction api/pro.js ---------- */
const proUser = () => (cptFb && cptFb.auth && cptFb.auth.currentUser) || null;
function proAppel(action, o = {}){
  const u = proUser();
  if (!u) return Promise.reject(new Error('pas-connecte'));
  return u.getIdToken().then(jeton => {
    const ctl = window.AbortController ? new AbortController() : null, t = setTimeout(() => { if (ctl) ctl.abort(); }, PRO_LENT);
    return fetch(PRO_API, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + jeton },
      body: JSON.stringify(Object.assign({ action }, o, LANGUE === 'en' ? { langue: 'en' } : {})), signal: ctl ? ctl.signal : undefined })   // lot 80 : Stripe en anglais
      .then(r => r.json().catch(() => ({})).then(d => { if (!r.ok) throw new Error((d && d.erreur) || 'erreur ' + r.status); return d; }))
      .finally(() => clearTimeout(t));
  });
}
// Aller sur une page de Stripe (paiement, « Gérer mon abonnement »)
function proVaVers(url){ if (typeof url === 'string' && /^https?:\/\//.test(url)) location.assign(url); }

/* ---------- Le retour de Stripe, et chaque connexion ----------
   Après le paiement, Stripe renvoie sur /?pro=merci&session=cs_…#tutos. */
let proRetour = (() => { const m = /[?&]pro=merci&session=(cs_[A-Za-z0-9_]+)/.exec(location.search); return m ? m[1] : ''; })();
// Lot 81 : revenu de la page de paiement sans payer (Stripe renvoie sur /?pro=retour#apprendre) : on montrera le rattrapage
let proAnnule = /[?&]pro=retour(&|$)/.test(location.search);
if (proAnnule){ try { history.replaceState(null, '', location.pathname + location.hash); } catch (e) {} }
let proApres = null;   // { f: formule, essai } choisis avant de créer son compte : on enchaîne sur le paiement une fois connecté
// Appelé par compte.js (cptChange) à chaque connexion ou déconnexion
function proCompte(u){
  if (!u){ proCompteRend(); if (view === 'tutos') renderTutos(); return; }
  if (!proVerrou() && !proRetour) return;
  if (proRetour){
    const id = proRetour; proRetour = '';
    try { history.replaceState(null, '', location.pathname + location.hash); } catch (e) {}
    proAppel('session', { id }).then(d => { proMaj(d, u.uid); if (d.pro) proMerci(); }, () => proVerifie(u));
  } else proVerifie(u).then(() => { if (proAnnule){ proAnnule = false; proRattrapageMontre(); } });
  if (proApres){ const a = proApres; proApres = null; proPayer(a.f, a.essai); }
}
function proVerifie(u){ return proAppel('etat').then(d => proMaj(d, u.uid), () => {}); }

/* ---------- La fenêtre « DJingood Pro » ---------- */
let proFormule = 'an';
const proVoulu = { lire(){ try { return sessionStorage.getItem('djingood-pro-voulu') || ''; } catch (e) { return ''; } },
  ecrire(id){ try { if (id) sessionStorage.setItem('djingood-pro-voulu', id); else sessionStorage.removeItem('djingood-pro-voulu'); } catch (e) {} } };
function proPrix(){
  document.querySelectorAll('#pro .pro-bascule button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.f === proFormule)));
  const r = proRattrapage(), eco = document.querySelector('#pro .pro-eco');
  if (eco) eco.textContent = r ? '−30 %' : '−17 %';   // lot 81 : 34,99 € au lieu de 49,99 €
  if (r) stat1('rattrapage-vu');   // proPrix n'est appelé que pour la fenêtre Pro, qui s'affiche juste après
  const [p, par, d] = proFormule === 'an' && r ? ['34,99 €', '/ 1re année', `<s>49,99 €</s> ${proRattrapageFin()} · ensuite 49,99 € par an`] : PRO_PRIX[proFormule];   // lot 81
  $('proPrix').textContent = p; $('proPar').textContent = par; $('proDetail').innerHTML = d;   // nos propres textes
}
/* ---------- Lot 81 : le rattrapage ----------
   Décision de l'utilisateur (21 nov. 2026) : « rattrapage à 34,99 € pendant 48 h ». Quelqu'un qui a ouvert la page de
   paiement sans payer voit, pendant 48 heures et une seule fois, sa première année à 34,99 € au lieu de 49,99 €. C'est
   api/pro.js qui sait si l'offre court encore et jusqu'à quand (etat → rattrapage) ; payer la revérifie. Pas de fenêtre qui
   s'ouvre toute seule (règle du 20 nov.) : l'offre est dans la carte de fin, la carte de résultat du niveau 3 et la fenêtre
   Pro. Seule exception, en revenant de Stripe sans payer : si la carte de fin n'est pas à l'écran, la fenêtre Pro qu'on
   vient de quitter se rouvre avec l'offre (c'est l'écran d'où l'on venait). */
let rattrapageFini = false;   // api/pro.js a répondu que l'offre est finie
const proRattrapage = () => proVerrou() && !proActif() && !proFondateur() && !rattrapageFini && !!proEtat.uid && proEtat.uid === proUid()
  && typeof proEtat.rattrapage === 'number' && proEtat.rattrapage * 1000 > Date.now();
// « jusqu'au dimanche 23 novembre à 14 h 05 » (en anglais : la date et l'heure à l'anglaise, LOCALE)
function proRattrapageFin(){
  const t = new Date(proEtat.rattrapage * 1000), d = t.toLocaleDateString(LOCALE, { weekday: 'long', day: 'numeric', month: 'long' });
  // l'heure ne se coupe jamais en fin de ligne (« 9 h » / « 51 »)
  const h = LANGUE === 'en' ? t.toLocaleTimeString(LOCALE, { hour: 'numeric', minute: '2-digit' }) : t.getHours() + ' h ' + String(t.getMinutes()).padStart(2, '0');
  return `jusqu’au ${d} à ${h}`;
}
function proRattrapageMontre(){
  if (!proRattrapage()) return;
  stat1('rattrapage-vu');
  const fin = $('nivFinOffre');
  if (fin && fin.offsetParent) return;   // la carte de fin le montre déjà
  if ($('pro').hidden) proOuvre('');
}
// lot 76 : le message s'écrit aussi sous l'offre de la carte de fin (.offre-msg), d'où l'on paie sans ouvrir la fenêtre
function proDit(t){ for (const m of [$('proMsg'), ...document.querySelectorAll('.offre-msg')]){ m.textContent = t; m.hidden = !t; } }
/* Lot 68 : ce qu'on voulait quand la fenêtre s'est ouverte, pour le dire en haut (« Pour jouer « L'écho out » ») et le
   proposer juste après le paiement. id = un tuto ; q = { n, i } (un niveau), { chap }, { vue: 'entrainer' | 'vrai' },
   { fin: true } (la fin des niveaux gratuits). */
function proPour(id, q = {}){
  if (id){ const t = TUTOS.find(x => x.id === id); return { voulu: id, contexte: t ? `Pour regarder « ${t.titre} »` : '', depuis: 'tuto' }; }
  if (q.fin) return { voulu: 'niv:1:' + NIV_GRATUITS, contexte: `Tu as fini les ${NIV_GRATUITS} niveaux gratuits`, depuis: 'fin' };
  // lot 81 : l'essai proposé dès la première réussite (essaiTot, niveaux.js) ; après le paiement, on reprend au niveau suivant
  if (q.tot) return { voulu: 'niv:1:' + (q.i || 0), contexte: '', depuis: 'reussite' };
  if (q.n != null && lessonsOf(q.n)[q.i]) return { voulu: `niv:${q.n}:${q.i}`, contexte: `Pour jouer « ${lessonsOf(q.n)[q.i].title} »`, depuis: 'niveau' };
  // un chapitre qui demande encore des étoiles le dit dès maintenant, avant de payer (gardien du lot 68)
  if (q.chap){ const c = CHAPTERS.find(x => x.n === q.chap); return { voulu: 'chap:' + q.chap, contexte: c ? `Pour ouvrir le chapitre ${c.n} : « ${c.title} »` + (proChapOuvert(c.n) ? '' : c.n === 3 ? ' (après 10 ★ au chapitre 2)' : ' (après 14 ★ au chapitre 1)') : '', depuis: 'chapitre' }; }
  if (q.vue === 'entrainer') return { voulu: 'vue:entrainer', contexte: 'Pour t’entraîner sans limite', depuis: 'entrainement' };
  if (q.vue === 'vrai') return { voulu: 'vue:vrai', contexte: 'Pour mixer ta propre musique', depuis: 'vrai' };
  return { voulu: '', contexte: '', depuis: 'menu' };
}
// Le joueur a déjà joué (une étoile quelque part, ou un record du Mode Expert) : il sait si le site marche avec sa table
const proAJoue = () => [1, 2, 3, 4, 5, 6, 7].some(n => sumStars(bankOf(n)) > 0) || Object.keys(xBest).length > 0;
// Ouvre la fenêtre (depuis un niveau, un chapitre, un tuto, l'accueil, la fin des niveaux gratuits ou « Mon compte »)
function proOuvre(id, q){
  if (!proVerrou()) return false;
  const p = proPour(id, q || {});
  proVoulu.ecrire(p.voulu);
  $('proContexte').hidden = !p.contexte; $('proContexteTxt').textContent = p.contexte;
  $('proNbEx').textContent = proNbExercices(); $('proNbTu').textContent = TUTOS.filter(t => !t.gratuit).length;   // « 10 de plus », comme plus bas (gardien)
  $('proDedansTxt').textContent = `${proNbExercices()} exercices, ${TUTOS.filter(t => !t.gratuit).length} tutos, et un nouveau tuto chaque mois.`;
  proFormule = 'an'; proPrix(); proDit(''); $('proGo').disabled = false;
  // Règle du lot 68 : on ne pousse jamais à payer avant d'avoir joué avec sa table (certaines tables et Safari ne marchent
  // pas avec le site : payer avant de le savoir, c'est un remboursement). « Passer à Pro quand même » reste possible.
  const essai = !proAJoue() && !proFondateur(), tel = typeof cpMobile === 'function' && cpMobile();
  $('proEssai').hidden = !essai; $('proGo').hidden = essai; $('proQuandMeme').hidden = !essai;
  if (essai){
    $('proEssaiTxt').textContent = `Tes ${NIV_GRATUITS} premiers exercices sont gratuits${tel ? ', sur ordinateur' : ''}. Vérifie que ta table marche avec DJingood avant de payer quoi que ce soit.`;
    $('proEssaiGo').textContent = tel ? 'M’envoyer le lien pour l’ordi' : 'Jouer le niveau 1 (gratuit)'; $('proEssaiGo').disabled = false;
  }
  proFondateurPrix();
  $('pro').hidden = false; document.body.classList.add('pro-ouvert');
  $('proTitre').focus({ preventScroll: true });
  stat('pro-ouvert', { depuis: id || p.depuis });
  return true;
}
$('proEssaiGo').addEventListener('click', e => {
  if (typeof cpMobile === 'function' && cpMobile()){ cpEnvoieLien(e.currentTarget); return; }
  proFerme(); goLesson(1, firstTodo(stars, NIV_GRATUITS));
});
$('proQuandMeme').addEventListener('click', () => { $('proEssai').hidden = true; $('proQuandMeme').hidden = true; $('proGo').hidden = false; $('proGo').focus(); });
function proFerme(){ $('pro').hidden = true; document.body.classList.remove('pro-ouvert'); }
// essai : true = le mois offert aux joueurs d'avant Pro ; 'semaine' = les 7 jours gratuits (lot 76). api/pro.js vérifie
// que l'un comme l'autre ne sert qu'une fois par compte.
const proBoutons = on => { for (const b of [$('proGo'), ...document.querySelectorAll('.offre-go'), $('rProGo')]) if (b) b.disabled = !on; };
// Lot 76 : on peut payer depuis la carte de résultat (déjà refermée) ou une offre : si aucun message n'est à l'écran, la
// fenêtre Pro s'ouvre pour dire ce qui s'est passé (gardien : sinon, rien ne se passait)
function proDitVu(t){ const vu = !$('pro').hidden || [...document.querySelectorAll('.offre-msg')].some(m => !!m.parentElement.offsetParent); if (!vu) proOuvre(''); proDit(t); }
function proPayer(f, essai){
  proBoutons(false); proDit(essai === true ? 'Un instant : on prépare ton mois offert…' : essai === 'semaine' ? 'Un instant : on prépare ton essai gratuit…' : 'Un instant : on ouvre la page de paiement…');
  const ratt = f === 'an' && essai !== true && proRattrapage();   // lot 81 : l'année à 34,99 €
  stat('pro-payer', Object.assign({ formule: f, essai: essai === 'semaine' ? 'semaine' : !!essai }, ratt ? { rattrapage: true } : {}));
  proAppel('payer', Object.assign({ formule: f }, essai ? { essai } : {}, ratt ? { rattrapage: true } : {})).then(d => proVaVers(d.url)).catch(e => {
    proBoutons(true);
    if (e.message === 'deja-pro'){ proDitVu('Tu es déjà Pro !'); const u = proUser(); if (u) proVerifie(u); return; }
    if (e.message === 'rattrapage-fini'){ rattrapageFini = true; proPrix(); proOffresRend(); proDitVu('L’offre à 34,99 € est terminée : tu peux continuer au prix normal.'); return; }
    if (e.message === 'essai-deja' && essai === 'semaine'){ semaineUtilisee = true; proFondateurPrix(); proOffresRend(); proDitVu('Ton essai gratuit a déjà servi : tu peux t’abonner tout de suite.'); return; }
    // le mois offert a déjà servi : ce compte a déjà eu un abonnement, donc pas de 7 jours gratuits non plus (lot 76)
    if (e.message === 'essai-deja'){ fondUtilise = true; semaineUtilisee = true; proFondateurPrix(); proOffresRend(); proDitVu('Ton mois offert a déjà servi : tu peux t’abonner tout de suite.'); return; }
    // un compte trop récent pour le mois offert : il a droit aux 7 jours gratuits, comme tout le monde (lot 76)
    if (e.message === 'essai-reserve'){ fondUtilise = true; proFondateurPrix(); proOffresRend(); proDitVu(proSemaineDispo() ? `Le mois offert est réservé aux comptes créés avant l’arrivée de Pro : tu peux essayer Pro ${PRO_ESSAI_JOURS} jours gratuitement.` : 'Le mois offert est réservé aux comptes créés avant l’arrivée de Pro : tu peux t’abonner tout de suite.'); return; }
    proDitVu(e.message === 'pas-configure' ? "Le paiement n'est pas encore ouvert. Reviens bientôt !" : "La page de paiement ne s'ouvre pas. Vérifie ta connexion, puis réessaie.");
  });
}
// Il faut un compte pour retrouver son abonnement : sans compte, on le crée, puis on enchaîne sur le paiement (proCompte)
function proAvecCompte(f, essai){
  if (proUser()){ proPayer(f, essai); return; }
  proApres = { f, essai }; proFerme(); openCompte(); cptVa('creer');
  cptDit(essai === true ? 'Crée ton compte : ton mois offert et ta progression y seront gardés.' : essai === 'semaine' ? 'Crée ton compte : il garde ton essai gratuit et ta progression, sur ton ordinateur comme sur ton téléphone.' : 'Crée ton compte : il garde ton abonnement, sur ton ordinateur comme sur ton téléphone.');
}
$('proGo').addEventListener('click', () => proAvecCompte(proFormule, proEssaiType()));
document.querySelectorAll('#pro .pro-bascule button').forEach(b => b.addEventListener('click', () => { proFormule = b.dataset.f; proPrix(); }));
$('proFermer').addEventListener('click', proFerme);
$('proPlusTard').addEventListener('click', proFerme);
$('proBandeauBtn').addEventListener('click', () => proOuvre(''));
$('rbProBtn').addEventListener('click', () => proOuvre('', { vue: 'vrai' }));   // lot 68 : Ma musique (ancien « Passer au vrai », lot 72)
window.addEventListener('keydown', e => {
  if (e.key !== 'Escape') return;
  if (!$('pro').hidden){ proFerme(); e.stopImmediatePropagation(); }
  else if (!$('proMerci').hidden){ proMerciFerme(); e.stopImmediatePropagation(); }
}, true);

/* ---------- « Bienvenue dans Pro » ---------- */
/* Ce qu'on voulait avant de payer (proPour) : [question, bouton, aller] ; sinon, le prochain niveau du chapitre 1.
   Pro ouvre tout, mais la progression reste (gardien du lot 68) : un chapitre demande toujours ses étoiles (14 au chapitre 1
   pour les chapitres 2, 4 à 7 ; 10 au chapitre 2 pour le 3), un niveau, ceux d'avant. Si ce qu'on voulait n'est pas encore
   ouvert, on le dit, et on propose le prochain niveau jouable (un client qui vient de payer ne doit pas croire que ça n'a pas
   marché). */
const proChapOuvert = n => n === 1 || ({ 2: ch2Unlocked, 3: ch3Unlocked, 4: ch4Unlocked, 5: ch5Unlocked, 6: ch6Unlocked, 7: ch7Unlocked }[n] || (() => false))();
const proChapAttente = n => n === 3 ? `Le chapitre 3 s’ouvre avec 10 ★ au chapitre 2.` : `Le chapitre ${n} s’ouvre avec 14 ★ au chapitre 1 (tu en as ${sumStars(stars)}).`;
function proSuite(v){
  let m = /^niv:([1-7]):(\d+)$/.exec(v || ''), attente = '';
  if (m){ const n = +m[1], i = +m[2], l = lessonsOf(n)[i];
    if (l && proChapOuvert(n) && niveauOuvert(i, n)) return [`On continue avec « ${l.title} » ?`, `Jouer « ${l.title} »`, () => goLesson(n, i)];
    if (l) attente = !proChapOuvert(n) ? proChapAttente(n) : `« ${l.title} » s’ouvre quand les niveaux d’avant sont réussis.`; }
  m = /^chap:([1-7])$/.exec(v || '');
  if (m){ const n = +m[1], c = CHAPTERS.find(x => x.n === n);
    if (c && proChapOuvert(n)) return [`On ouvre « ${c.title} » ?`, `Aller au chapitre ${n}`, () => goLesson(n, firstTodo(bankOf(n), lessonsOf(n).length))];
    if (c) attente = proChapAttente(n); }
  if (attente){ const i = firstTodo(stars, BASE_LESSONS.length); return [`${attente} On continue avec « ${BASE_LESSONS[i].title} » ?`, `Jouer « ${BASE_LESSONS[i].title} »`, () => goLesson(1, i)]; }
  if (v === 'vue:entrainer') return ['On va s’entraîner ?', 'Aller à l’entraînement', () => { location.hash = '#entrainer'; }];
  if (v === 'vue:vrai') return ['On mixe ta musique ?', 'Aller à Ma musique', () => { location.hash = '#musique'; }];
  const t = TUTOS.find(x => x.id === v);
  if (t) return [`On commence par « ${t.titre} » ?`, `Regarder « ${t.titre} »`, () => { if (location.hash !== '#tutos') location.hash = '#tutos'; setTimeout(() => tuOuvre(t.id), 0); }];
  const i = firstTodo(stars, BASE_LESSONS.length);
  return ['On reprend où tu en étais ?', `Jouer « ${BASE_LESSONS[i].title} »`, () => goLesson(1, i)];
}
function proMerci(){
  const s = proSuite(proVoulu.lire());
  $('proMerciTxt').textContent = `Tout DJingood est ouvert : les 7 chapitres et tous les tutos. ${s[0]}`;
  $('proMerciGo').textContent = s[1];
  $('proMerci').hidden = false; document.body.classList.add('pro-ouvert');
  stat1('pro');   // une seule fois par navigateur (stats.js)
  // lot 81 : « Comment tu as connu DJingood ? », seulement après le paiement (ça sert aux statistiques, pas au joueur)
  const deja = (() => { try { return !!localStorage.getItem(SOURCE_CLE); } catch (e) { return false; } })();
  $('proSource').hidden = deja; $('proSourceChoix').hidden = false; $('proSourceMerci').hidden = true;
}
/* Lot 81 : d'où viennent ceux qui paient. Une seule réponse par navigateur (coach-source-pro), envoyée à Umami et PostHog
   (stat, stats.js) sous le nom pro-source. TikTok n'a qu'un lien en bio : sans cette question, on ne sait pas d'où vient un
   abonné. */
const SOURCE_CLE = 'coach-source-pro', SOURCES = ['tiktok', 'instagram', 'youtube', 'google', 'ami', 'autre'];
document.querySelectorAll('#proSourceChoix button').forEach(b => b.addEventListener('click', () => {
  const s = SOURCES.includes(b.dataset.s) ? b.dataset.s : 'autre';
  stat('pro-source', { d: s });
  try { localStorage.setItem(SOURCE_CLE, s); } catch (e) {}
  $('proSourceChoix').hidden = true; $('proSourceMerci').hidden = false;
}));
function proMerciFerme(){ $('proMerci').hidden = true; document.body.classList.remove('pro-ouvert'); }
$('proMerciGo').addEventListener('click', () => {
  const s = proSuite(proVoulu.lire()); proVoulu.ecrire(''); proMerciFerme(); s[2]();
});

/* ---------- Le mois offert aux comptes déjà créés (lot 68) ----------
   Demande de l'utilisateur (11 nov. 2026) : les comptes DJingood déjà enregistrés reçoivent un mois de Pro offert ; un compte
   créé ensuite n'a que les exercices gratuits. C'est api/pro.js qui le sait (date de création du compte chez Firebase, avant
   FONDATEURS_AVANT, et jamais abonné) et le dit dans sa réponse `offert` : sans compte, pas d'offre. Ils gardent toutes leurs
   étoiles ; le mois commence sans carte bancaire (un essai de 30 jours, qui s'arrête tout seul si aucune carte n'est ajoutée).
   Un message, une seule fois (coach-fondateur, qui suit le compte) ; ensuite l'offre reste dans la fenêtre Pro. */
const FOND_CLE = 'coach-fondateur';
let fondUtilise = false;   // api/pro.js a répondu que le mois offert a déjà servi, ou qu'il n'est pas pour ce compte
const proFondateur = () => proVerrou() && !proActif() && !fondUtilise && proEtat.offert === true && !!proEtat.uid && proEtat.uid === proUid();
const fondVu = () => { try { return localStorage.getItem(FOND_CLE) === '1'; } catch (e) { return true; } };
// La fenêtre Pro d'un joueur d'avant Pro : le bouton prend le mois offert
// Lot 76 : sinon, les 7 jours gratuits si ce compte n'a jamais été abonné (#proSemaine)
function proFondateurPrix(){
  const f = proFondateur(), s = !f && proSemaineDispo(); $('proFond').hidden = !f; $('proSemaine').hidden = !s;
  $('proGo').firstChild.textContent = f ? 'Prendre mon mois offert' : s ? `Commencer mes ${PRO_ESSAI_JOURS} jours gratuits` : 'Passer à Pro';
}
function proFondateurPropose(essais = 0){
  if (!proFondateur() || fondVu()) return;
  // un compte connu sur cet ordinateur : on attend que Stripe ait dit s'il est abonné (sur un nouvel ordinateur, coach-pro est
  // vide et un abonné passerait pour un joueur d'avant Pro, gardien du lot 68) ; proMaj nous rappelle après sa réponse
  if (proUid() && !proReponse) return;
  // pas par-dessus autre chose : les questions de Vini, une partie, une autre fenêtre ; on réessaie un peu plus tard
  const occupe = run || preparing || ['pp', 'ordi', 'serie', 'pro', 'proMerci', 'compte', 'onb', 'quiz', 'cp', 'verif', 'reg'].some(id => $(id) && !$(id).hidden);
  if (occupe){ if (essais < 20) setTimeout(() => proFondateurPropose(essais + 1), 5000); return; }
  try { localStorage.setItem(FOND_CLE, '1'); } catch (e) {}
  const v = $('fondVini'); if (!v.firstChild) viniMettre(v, 'danse');
  const p = (typeof cpt !== 'undefined' && cpt && cpt.prenom) || '';
  $('fondPour').textContent = p ? `Pour toi, ${p}` : 'Pour toi';
  $('fond').hidden = false; $('fondGo').focus({ preventScroll: true });
  stat1('fondateur-vu');
}
let fondPlanifie = false;
function proFondateurPlusTard(){ if (!fondPlanifie && proFondateur() && !fondVu()){ fondPlanifie = true; setTimeout(() => { fondPlanifie = false; proFondateurPropose(); }, 2500); } }
function fondFerme(){ $('fond').hidden = true; }
$('fondGo').addEventListener('click', () => { fondFerme(); proOuvre(''); proAvecCompte('mois', true); });   // la fenêtre Pro montre où on en est (et une erreur éventuelle)
$('fondPlusTard').addEventListener('click', fondFerme);
$('fondX').addEventListener('click', fondFerme);
window.addEventListener('keydown', e => { if (e.key === 'Escape' && !$('fond').hidden){ fondFerme(); e.stopImmediatePropagation(); } }, true);

/* ---------- Lot 76 : 7 jours gratuits, carte demandée ----------
   Décision de l'utilisateur (19 nov. 2026, « Go, laisse 7 jours gratuits avec la carte ») : après les 3 niveaux gratuits,
   on propose d'essayer Pro 7 jours. La carte est demandée par Stripe au début, rien n'est prélevé ; au 7e jour, l'abonnement
   choisi démarre tout seul, sauf s'il a été arrêté avant (« Gérer mon abonnement », puis « Annuler »). Deux jours avant, un mail de
   service prévient (api/rappel.js). Un seul essai par compte : api/pro.js refuse (409 essai-deja) un compte qui a déjà eu un
   abonnement, et le dit dans etat (essaiDispo). Les joueurs d'avant Pro gardent leur mois offert, sans carte (plus haut).
   L'offre (proOffre) est sur la carte de fin d'Apprendre ; on y paie sans passer par la grande fenêtre Pro (proDemarre). */
const PRO_ESSAI_JOURS = 7;
let semaineUtilisee = false;   // api/pro.js a répondu que l'essai a déjà servi pour ce compte
const proSemaineDispo = () => proVerrou() && !proActif() && !proFondateur() && !semaineUtilisee && !(proEtat.uid && proEtat.uid === proUid() && proEtat.essaiDispo === false);
const proEssaiType = () => proFondateur() ? true : proSemaineDispo() ? 'semaine' : false;
/* La formule choisie sous l'offre. Lot 81 (décision de l'utilisateur du 21 nov. 2026, « ok pour l'année d'office ») :
   l'année d'office, en premier, affichée en prix par mois (4,17 €) avec son prix réel juste dessous (49,99 € par an) ; le
   mois juste à côté. Remplace le mois d'office du 20 nov. (« 49,99 € à l'année, ça peut refroidir » : afficher 4,17 € par
   mois y répond). La grande fenêtre Pro avait déjà l'année d'office. */
let offreFormule = 'an';
// Ce qu'on paie au bout de l'essai, ou tout de suite (lot 81 : 34,99 € la première année pendant le rattrapage ; le prix par
// mois de l'année, 4,17 €, est déjà sur le bouton de la formule, d'où la phrase courte : la carte de fin tient dans 768 px)
const offrePrix = (long = false) => offreFormule === 'an' ? (proRattrapage() ? '34,99 € pour ta première année' : long ? '49,99 € pour l’année (soit 4,17 € par mois)' : '49,99 € pour l’année') : '4,99 € par mois';
/* Lot 81 : l'offre reprend le plan des Premiers pas (« Ton plan : Pioneer DDJ-FLX4 · 10 min par jour », « Dans 2 semaines : ta
   première vraie transition. »), pour qu'elle ait l'air faite pour lui. Rien si les questions ont été passées. La table n'est
   nommée que si c'est une table connue (son nom est le même dans les deux langues). */
const PLAN_BUT = { debut: 'ta première vraie transition', apprenti: 'des transitions vraiment propres', confirme: 'un set à 100 sur 100' };
const PLAN_QUAND = { 5: 'À ton rythme', 10: 'Dans 2 semaines', 15: 'En moins de 2 semaines' };
function proPlan(){
  try {
    if (typeof accueil === 'undefined' || !accueil || accueil.passe) return null;
    const t = accueil.table === 'table' && accueil.modele && accueil.modele !== 'autre' && accueil.modele !== 'inconnue' ? ppNomDe(accueil.modele) : '', m = accueil.min;
    const haut = t && m ? `Ton plan : ${t} · ${m} min par jour` : t ? `Ton plan : ${t}` : m ? `Ton plan : ${m} min par jour` : '';
    const but = PLAN_BUT[accueil.niveau] && PLAN_QUAND[m] ? `${PLAN_QUAND[m]} : ${PLAN_BUT[accueil.niveau]}.` : '';
    return haut || but ? [haut, but] : null;
  } catch (e) { return null; }
}
function proOffre(box, q){
  if (!box) return;
  box.innerHTML = ''; box._q = q || {};
  const el = (tag, cls, txt) => { const e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; };
  const f = proFondateur(), s = !f && proSemaineDispo(), r = !f && proRattrapage();
  if (f){
    box.append(el('p', 'offre-t', 'Ton premier mois est offert'),
      el('p', 'offre-sous', 'Sans carte bancaire : merci d’avoir été là avant Pro. Ensuite, 4,99 € par mois ou 49,99 € par an, seulement si tu continues.'));
  } else {
    box.appendChild(el('p', 'offre-t', r ? 'Ta première année à 34,99 €' : s ? `Essaie Pro ${PRO_ESSAI_JOURS} jours, gratuitement` : 'Continue avec DJingood Pro'));
    // compté seulement si l'offre est vraiment à l'écran (la carte de fin se dessine aussi derrière un autre onglet, gardien)
    if (r){ box.appendChild(el('p', 'offre-sous', `Au lieu de 49,99 €, ${proRattrapageFin()}.`)); if (box.offsetParent) stat1('rattrapage-vu'); }
    else { const p = proPlan(); if (p){ const e = el('p', 'offre-plan'); if (p[0]) e.appendChild(el('b', '', p[0])); if (p[1]) e.appendChild(el('span', '', p[1])); box.appendChild(e); } }
    // les deux formules, côte à côte : l'année (d'office, lot 81) ou le mois
    const choix = el('div', 'offre-choix'); choix.setAttribute('role', 'group'); choix.setAttribute('aria-label', 'Formule');
    for (const [fo, nom, prix, plus] of [['an', 'À l’année', r ? '34,99 €' : '4,17 €/mois', r ? 'la 1re année' : '49,99 € par an'], ['mois', 'Au mois', '4,99 €/mois', 'payé chaque mois']]){
      const b = el('button', 'offre-f'); b.type = 'button'; b.dataset.f = fo; b.setAttribute('aria-pressed', String(offreFormule === fo));
      b.append(el('span', 'offre-f-nom', nom), el('b', '', prix)); if (plus) b.appendChild(el('small', '', plus));
      b.addEventListener('click', e => { e.stopPropagation(); offreFormule = fo; proOffresRend(); });
      choix.appendChild(b);
    }
    box.appendChild(choix);
    if (s){
      const ol = el('ol', 'offre-frise');
      for (const [q1, t] of [['Aujourd’hui', `Tout s’ouvre : les ${proNbExercices()} exercices, les tutos de Vini, l’entraînement. Ta carte est demandée, mais rien n’est prélevé.`],
        [`Jour ${PRO_ESSAI_JOURS - 2}`, 'Vini t’envoie un mail pour te prévenir.'],
        [`Jour ${PRO_ESSAI_JOURS}`, `${offrePrix()}, sauf si tu arrêtes avant (dans « Mon compte »).`]]){   // lot 81 : le « » » ne tombe plus seul en début de ligne
        const li = el('li'); li.append(el('b', '', q1), el('span', '', t)); ol.appendChild(li); }
      box.appendChild(ol);
    } else {
      const ul = el('ul', 'offre-liste');
      for (const t of [`Les ${proNbExercices()} exercices, jusqu’au set noté sur 100`, 'Les tutos de Vini', 'L’entraînement et Ma musique']) ul.appendChild(el('li', '', t));
      box.appendChild(ul);
    }
  }
  const go = el('button', 'offre-go', f ? 'Prendre mon mois offert' : s ? `Commencer mes ${PRO_ESSAI_JOURS} jours gratuits` : 'Continuer avec Pro'); go.type = 'button';
  go.addEventListener('click', () => proDemarre(box._q));
  box.appendChild(go);
  box.appendChild(el('p', 'offre-p', 'Sans engagement · Paiement sécurisé par Stripe'));
  const m = el('p', 'offre-msg'); m.setAttribute('role', 'status'); m.hidden = true;
  box.appendChild(m);
}
// Redessine les offres affichées (la formule a changé, ou Stripe a répondu)
function proOffresRend(){ document.querySelectorAll('.offre').forEach(b => { if (b.offsetParent || !b.closest('[hidden]')) proOffre(b, b._q); }); if (typeof finEssaiTexte === 'function') finEssaiTexte(); }
// « Commencer mes 7 jours gratuits » : tout droit vers la page de paiement de Stripe (en créant d'abord le compte, s'il le
// faut), sans la grande fenêtre Pro. La règle du lot 68 reste : jamais pousser à payer avant d'avoir joué avec sa table.
function proDemarre(q){
  if (!proVerrou()) return;
  stat('pro-offre', { essai: String(proEssaiType()) });
  if (!proAJoue()){ proOuvre('', q); return; }
  proVoulu.ecrire(proPour('', q || {}).voulu);
  proAvecCompte(proFondateur() ? 'mois' : offreFormule, proEssaiType());
}

/* ---------- Dans « Mon compte » ---------- */
const proDate = s => new Date(s * 1000).toLocaleDateString(LOCALE, { day: 'numeric', month: 'long', year: 'numeric' });
// Appelé par cptRend (compte.js) et à chaque nouvelle réponse de Stripe
function proCompteRend(){
  const box = $('cptPro'); if (!box) return;
  box.hidden = !(proVerrou() && cpt);
  if ($('cptProSec')) $('cptProSec').hidden = box.hidden;   // le titre « Abonnement » de « Mon compte » (lot 60)
  if (box.hidden) return;
  const actif = proActif(), e = proEtat;
  box.classList.toggle('actif', actif);
  $('cptProTxt').textContent = actif && e.essai ? `${e.semaine ? 'Essai gratuit' : 'Mois offert'}${e.jusqua ? " jusqu'au " + proDate(e.jusqua) : ''}`   // lot 68 : le mois offert des joueurs d'avant Pro ; lot 76 : les 7 jours gratuits
    : actif ? [e.formule === 'an' ? "À l'année" : e.formule === 'mois' ? 'Au mois' : '', e.jusqua ? (e.annule ? "s'arrête le " : 'renouvelé le ') + proDate(e.jusqua) : ''].filter(Boolean).join(' · ')
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
// Lot 68 : avec Pro allumé, l'onglet « Tutos » se montre (tutos.js, chargé avant, ne pouvait pas encore le savoir) ; et le
// mois offert aux joueurs d'avant Pro, une fois la page posée
if (proVerrou()){ $('tabTutos').hidden = false; setTimeout(proFondateurPlusTard, 1500); }
