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
   (essai : pendant le mois offert ; offert : le mois offert l'attend, lot 68). */
const proVide = uid => ({ uid: uid || '', actif: false, formule: null, jusqua: null, annule: false, essai: false, offert: false });
let proEtat = (() => {
  try {
    const d = JSON.parse(localStorage.getItem(PRO_CLE));
    if (!d || typeof d !== 'object' || typeof d.uid !== 'string' || !d.uid) return proVide();
    return { uid: d.uid, actif: d.actif === true, formule: PRO_FORMULES.includes(d.formule) ? d.formule : null,
      jusqua: typeof d.jusqua === 'number' && isFinite(d.jusqua) ? d.jusqua : null, annule: d.annule === true, essai: d.essai === true, offert: d.offert === true };
  } catch (e) { return proVide(); }
})();
// Le compte de cet ordinateur : celui qui est connecté, sinon le dernier (la session se reprend au chargement)
const proUid = () => (cpt && cpt.uid) || (cptSauve && cptSauve.uid) || '';
const proActif = () => proEtat.actif && !!proEtat.uid && proEtat.uid === proUid() && (!proEtat.jusqua || proEtat.jusqua * 1000 > Date.now() - 3 * 864e5);
const proLibre = t => !proVerrou() || !!t.gratuit || proActif();
function proMaj(d, uid){
  proEtat = d && d.pro ? { uid, actif: true, formule: PRO_FORMULES.includes(d.formule) ? d.formule : null,
    jusqua: typeof d.jusqua === 'number' ? d.jusqua : null, annule: !!d.annule, essai: !!d.essai } : Object.assign(proVide(uid), { offert: !!(d && d.offert) });
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
let proApres = null;   // { f: formule, essai } choisis avant de créer son compte : on enchaîne sur le paiement une fois connecté
// Appelé par compte.js (cptChange) à chaque connexion ou déconnexion
function proCompte(u){
  if (!u){ proCompteRend(); if (view === 'tutos') renderTutos(); return; }
  if (!proVerrou() && !proRetour) return;
  if (proRetour){
    const id = proRetour; proRetour = '';
    try { history.replaceState(null, '', location.pathname + location.hash); } catch (e) {}
    proAppel('session', { id }).then(d => { proMaj(d, u.uid); if (d.pro) proMerci(); }, () => proVerifie(u));
  } else proVerifie(u);
  if (proApres){ const a = proApres; proApres = null; proPayer(a.f, a.essai); }
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
/* Lot 68 : ce qu'on voulait quand la fenêtre s'est ouverte, pour le dire en haut (« Pour jouer « L'écho out » ») et le
   proposer juste après le paiement. id = un tuto ; q = { n, i } (un niveau), { chap }, { vue: 'entrainer' | 'vrai' },
   { fin: true } (la fin des niveaux gratuits). */
function proPour(id, q = {}){
  if (id){ const t = TUTOS.find(x => x.id === id); return { voulu: id, contexte: t ? `Pour regarder « ${t.titre} »` : '', depuis: 'tuto' }; }
  if (q.fin) return { voulu: 'niv:1:' + NIV_GRATUITS, contexte: `Tu as fini les ${NIV_GRATUITS} niveaux gratuits`, depuis: 'fin' };
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
// essai : le mois offert aux joueurs d'avant Pro (api/pro.js vérifie qu'il ne sert qu'une fois par compte)
function proPayer(f, essai){
  $('proGo').disabled = true; proDit(essai ? 'Un instant : on prépare ton mois offert…' : 'Un instant : on ouvre la page de paiement…');
  stat('pro-payer', { formule: f, essai: !!essai });
  proAppel('payer', essai ? { formule: f, essai: true } : { formule: f }).then(d => proVaVers(d.url)).catch(e => {
    $('proGo').disabled = false;
    if (e.message === 'deja-pro'){ proDit('Tu es déjà Pro !'); const u = proUser(); if (u) proVerifie(u); return; }
    if (e.message === 'essai-deja'){ fondUtilise = true; proFondateurPrix(); proDit('Ton mois offert a déjà servi : tu peux t’abonner juste en dessous.'); return; }
    if (e.message === 'essai-reserve'){ fondUtilise = true; proFondateurPrix(); proDit('Le mois offert est réservé aux comptes créés avant l’arrivée de Pro : tu peux t’abonner juste en dessous.'); return; }
    proDit(e.message === 'pas-configure' ? "Le paiement n'est pas encore ouvert. Reviens bientôt !" : "La page de paiement ne s'ouvre pas. Vérifie ta connexion, puis réessaie.");
  });
}
// Il faut un compte pour retrouver son abonnement : sans compte, on le crée, puis on enchaîne sur le paiement (proCompte)
function proAvecCompte(f, essai){
  if (proUser()){ proPayer(f, essai); return; }
  proApres = { f, essai }; proFerme(); openCompte(); cptVa('creer');
  cptDit(essai ? 'Crée ton compte : ton mois offert et ta progression y seront gardés.' : 'Crée ton compte : il garde ton abonnement, sur ton ordinateur comme sur ton téléphone.');
}
$('proGo').addEventListener('click', () => proAvecCompte(proFormule, proFondateur()));
document.querySelectorAll('#pro .pro-bascule button').forEach(b => b.addEventListener('click', () => { proFormule = b.dataset.f; proPrix(); }));
$('proFermer').addEventListener('click', proFerme);
$('proPlusTard').addEventListener('click', proFerme);
$('proBandeauBtn').addEventListener('click', () => proOuvre(''));
$('proNivBtn').addEventListener('click', () => proOuvre(''));   // lot 68 : la ligne sous les niveaux
$('rbProBtn').addEventListener('click', () => proOuvre('', { vue: 'vrai' }));   // lot 68 : Passer au vrai
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
  if (v === 'vue:vrai') return ['On mixe ta musique ?', 'Aller à Passer au vrai', () => { location.hash = '#vrai'; }];
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
}
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
function proFondateurPrix(){
  const f = proFondateur(); $('proFond').hidden = !f;
  $('proGo').firstChild.textContent = f ? 'Prendre mon mois offert' : 'Passer à Pro';
}
function proFondateurPropose(essais = 0){
  if (!proFondateur() || fondVu()) return;
  // un compte connu sur cet ordinateur : on attend que Stripe ait dit s'il est abonné (sur un nouvel ordinateur, coach-pro est
  // vide et un abonné passerait pour un joueur d'avant Pro, gardien du lot 68) ; proMaj nous rappelle après sa réponse
  if (proUid() && !proReponse) return;
  // pas par-dessus autre chose : les questions de Vini, une partie, une autre fenêtre ; on réessaie un peu plus tard
  const occupe = run || preparing || ['pp', 'ordi', 'mlQ', 'serie', 'pro', 'proMerci', 'compte', 'onb', 'quiz', 'cp', 'verif', 'reg'].some(id => $(id) && !$(id).hidden);
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

/* ---------- Dans « Mon compte » ---------- */
const proDate = s => new Date(s * 1000).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
// Appelé par cptRend (compte.js) et à chaque nouvelle réponse de Stripe
function proCompteRend(){
  const box = $('cptPro'); if (!box) return;
  box.hidden = !(proVerrou() && cpt);
  if ($('cptProSec')) $('cptProSec').hidden = box.hidden;   // le titre « Abonnement » de « Mon compte » (lot 60)
  if (box.hidden) return;
  const actif = proActif(), e = proEtat;
  box.classList.toggle('actif', actif);
  $('cptProTxt').textContent = actif && e.essai ? `Mois offert${e.jusqua ? " jusqu'au " + proDate(e.jusqua) : ''}`   // lot 68 : le mois offert des joueurs d'avant Pro
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
