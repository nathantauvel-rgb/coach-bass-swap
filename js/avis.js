// Tests avec des débutants : « Mon avis », « C'était clair ? » après un niveau, rapport à envoyer, remise à zéro.
// Tous les fichiers de js/ partagent la même portée et sont chargés dans l'ordre indiqué dans index.html.
'use strict';
/* ---------- Journal ----------
   Le journal reste sur l'ordinateur du testeur, dans `coach-journal`, jusqu'à ce qu'il copie ou envoie son rapport.
   Seuls partent : chaque avis, quand on appuie sur « Envoyer mon avis » (plus bas), et les réponses à « C'était clair ? »,
   comptées par Umami sans rien qui désigne le joueur (stats.js). */
const JR_KEY = 'coach-journal', JR_MAX = 200, AVIS_MAIL = '';   // AVIS_MAIL : adresse qui reçoit les rapports ; vide = pas de bouton e-mail
const JR_DAY = /^\d{4}-\d\d-\d\d$/, JR_CLAIR = ['oui', 'bof', 'non'];
let jr = {}; try { jr = JSON.parse(localStorage.getItem(JR_KEY) || '{}'); } catch (e) {}
if (!jr || typeof jr !== 'object' || Array.isArray(jr)) jr = {};
{ const arr = (v, ok, max = JR_MAX) => Array.isArray(v) ? v.filter(ok).slice(-max) : [], txt = v => typeof v === 'string' ? v.slice(0, 1000) : '';
  const cl = jr.clair && typeof jr.clair === 'object' && !Array.isArray(jr.clair) ? jr.clair : {};
  jr = {
    debut: typeof jr.debut === 'string' && JR_DAY.test(jr.debut) ? jr.debut : dayKey(),
    jours: arr(jr.jours, d => typeof d === 'string' && JR_DAY.test(d)),
    secs: Math.max(0, Math.floor(+jr.secs) || 0),
    parties: arr(jr.parties, p => p && typeof p === 'object' && [1, 2, 3, 4, 5, 6, 7].includes(p.c) && Number.isInteger(p.n) && p.n >= 0 && p.n < lessonsOf(p.c).length && [1, 2, 3].includes(p.e)),
    clair: Object.fromEntries(Object.entries(cl).filter(([k, v]) => /^[1-7]-[0-6]$/.test(k) && JR_CLAIR.includes(v))),
    avis: arr(jr.avis, a => a && typeof a === 'object' && typeof a.d === 'string').map(a => Object.assign({ d: a.d.slice(0, 10), ecran: txt(a.ecran).slice(0, 80), bloque: txt(a.bloque), plu: txt(a.plu), note: [1, 2, 3, 4, 5].includes(a.note) ? a.note : 0 },
      a.p === 0 || a.p === 1 ? { p: a.p } : {})),   // p : 0 = pas encore parti, 1 = parti (lot 46) ; sans p, écrit avant qu'un avis puisse partir
    erreurs: arr(jr.erreurs, e => typeof e === 'string', 5)
  };
}
let jrOff = false;   // vrai pendant la remise à zéro : plus rien ne doit être réécrit
const saveJr = () => { if (jrOff) return; try { localStorage.setItem(JR_KEY, JSON.stringify(jr)); } catch (e) {} };
if (jr.jours[jr.jours.length - 1] !== dayKey()){ jr.jours.push(dayKey()); jr.jours = jr.jours.slice(-JR_MAX); }
saveJr();
// revenu un autre jour, puis sept jours différents (stats.js)
if (jr.jours.length >= 2) stat1('revenu');
if (jr.jours.length >= 7) stat1('jours-7');
// Temps passé : seulement quand la page est affichée
setInterval(() => { if (document.visibilityState === 'visible'){ jr.secs += 15; saveJr(); } }, 15000);
// Les erreurs affichées dans le bandeau sont aussi gardées pour le rapport
const jrError = m => { jr.erreurs = jr.erreurs.concat(String(m).slice(0, 200)).slice(-5); saveJr(); };
window.addEventListener('error', e => jrError((e.message || 'erreur') + (e.lineno ? ' · ligne ' + e.lineno : '')));
window.addEventListener('unhandledrejection', e => { const r = e.reason; if (!(r && r.silent)) jrError((r && r.message) || r); });

/* ---------- Après un niveau : la partie est notée dans le journal, et « C'était clair ? » ---------- */
let clairKey = '';
function avisPartie(ch, st){
  jr.parties.push({ c: ch, n: li, e: st, k: prac ? prac.kind : placement ? 'test' : '', d: dayKey() }); jr.parties = jr.parties.slice(-JR_MAX); saveJr();
  clairKey = ch + '-' + li; $('clairRow').hidden = false; clairShow();
}
function clairShow(){ const v = jr.clair[clairKey] || ''; document.querySelectorAll('#clairRow [data-clair]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.clair === v))); $('clairMerci').hidden = !v; }
document.querySelectorAll('#clairRow [data-clair]').forEach(b => b.addEventListener('click', () => { if (!clairKey) return;
  const avant = jr.clair[clairKey]; jr.clair[clairKey] = b.dataset.clair; saveJr(); clairShow();
  // compté par Umami à chaque réponse qui change : le niveau et la réponse, rien d'autre
  if (avant !== b.dataset.clair){ const [c, n] = clairKey.split('-').map(Number), l = lessonsOf(c)[n];
    stat('clair', { niveau: `Ch. ${c} · ${n + 1}. ${l ? l.title : ''}`, reponse: b.dataset.clair }); } }));

/* ---------- Le rapport ---------- */
function navName(){
  const u = navigator.userAgent, m = u.match(/Edg\/(\d+)/) || u.match(/Chrome\/(\d+)/) || u.match(/Firefox\/(\d+)/), nav = m ? (/Edg\//.test(u) ? 'Edge ' : /Chrome\//.test(u) ? 'Chrome ' : 'Firefox ') + m[1] : /Safari\//.test(u) ? 'Safari' : 'navigateur inconnu';
  const os = /Windows/.test(u) ? 'Windows' : /iPhone|iPad/.test(u) ? 'iPhone ou iPad' : /Android/.test(u) ? 'Android' : /Mac OS/.test(u) ? 'Mac' : /Linux/.test(u) ? 'Linux' : '';
  return nav + (os ? ', ' + os : '');
}
// Sans table, pourquoi (lot 45) : le navigateur ne peut pas en voir, l'accès a été refusé, ou il n'en voit aucune
const MIDI_RAPPORT = { absent: ' · navigateur qui ne sait pas parler aux tables', refuse: ' · accès à la table refusé', question: ' · accès à la table pas encore autorisé', pret: ' · aucune table vue par le navigateur' };
function avisRapport(){
  const L = [], lv = (c, n) => lessonsOf(c)[n], max = BASE_LESSONS.length * 3;
  L.push(`Rapport DJingood du ${dayKey()}`);
  L.push(`Parcours : ${PARCOURS[parcours] ? PARCOURS[parcours].name : 'pas encore choisi'} · ${midiCount > 0 ? 'table branchée : ' + midiNames.join(', ') + (tableCfg ? (tableCfg.modele ? ' (reconnue d’après sa fiche)' : ' (réglée pas à pas)') : tableOn() ? '' : ' (pas encore réglée)') : 'sans table (souris)' + (MIDI_RAPPORT[midiEtat] || '')} · ${navName()}`);
  L.push(`Premiers pas : ${ppResume()}`);
  L.push(`Temps sur le site : ${Math.round(jr.secs / 60)} min, sur ${plur(jr.jours.length, 'jour', 'jours')} (première visite le ${jr.debut})`);
  L.push(`Étoiles : chapitre 1 ${sumStars(stars)}/${max}, chapitre 2 ${sumStars(ch2Stars)}/${max}, chapitre 3 ${sumStars(ch3Stars)}/${CH3_LESSONS.length * 3}, chapitre 4 ${sumStars(ch4Stars)}/${CH4_LESSONS.length * 3}, chapitre 5 ${sumStars(ch5Stars)}/${CH5_LESSONS.length * 3}${CH6_PRET ? `, chapitre 6 ${sumStars(ch6Stars)}/${CH6_LESSONS.length * 3}` : ''}, chapitre 7 ${sumStars(ch7Stars)}/${CH7_LESSONS.length * 3} · ${$('xpTxt').textContent} · badges ${badgesWon.length}/${BADGES.length} · quiz ${quizOk.length}/${QUIZ.length}`);
  const g = new Map();
  for (const p of jr.parties){ const k = p.c + '-' + p.n; if (!g.has(k)) g.set(k, { c: p.c, n: p.n, tries: 0, best: 0, last: 0 }); const x = g.get(k); x.tries++; x.best = Math.max(x.best, p.e); x.last = p.e; }
  for (const k of Object.keys(jr.clair)) if (!g.has(k)){ const [c, n] = k.split('-').map(Number); g.set(k, { c, n, tries: 0, best: 0, last: 0 }); }
  const nPrac = jr.parties.filter(p => p.k && p.k !== 'test').length, nTest = jr.parties.filter(p => p.k === 'test').length;
  L.push('', `Niveaux joués (${plur(jr.parties.length, 'partie', 'parties')}, dont ${nPrac} en entraînement et ${nTest} au test de placement) :`);
  if (!g.size) L.push(' - aucun');
  for (const [k, x] of g) L.push(` - Chapitre ${x.c}, niveau ${x.n + 1} « ${lv(x.c, x.n).title} » : ${plur(x.tries, 'essai', 'essais')}, meilleur ${'★'.repeat(x.best) || '—'}, dernier ${'★'.repeat(x.last) || '—'}, clair : ${jr.clair[k] || 'pas répondu'}`);
  L.push('', `Avis (${jr.avis.length}) :`);
  if (!jr.avis.length) L.push(' - aucun');
  for (const a of jr.avis) L.push(` - Le ${a.d}, sur « ${a.ecran} », note ${a.note ? a.note + '/5' : 'non donnée'}`, `   Bloqué : ${a.bloque || '—'}`, `   Plu : ${a.plu || '—'}`);
  const vfl = verifResume(); if (vfl.length) L.push('', ...vfl);
  if (jr.erreurs.length) L.push('', 'Erreurs affichées :', ...jr.erreurs.map(e => ' - ' + e));
  return L.join('\n');
}

/* ---------- La fenêtre « Mon avis » ---------- */
let avis = null;   // fenêtre ouverte : { back, note }
const SCREEN_NAME = { accueil: 'Accueil', apprendre: 'Apprendre', entrainer: 'S\'entraîner', vrai: 'Passer au vrai', table: 'Ma table', progres: 'Mes progrès' };
const avisScreen = () => (SCREEN_NAME[view] || 'Accueil') + (view === 'apprendre' ? ' · ' + (prac ? 'entraînement, ' : '') + LESSONS[li].title : '');
function avisSum(){ $('avSum').textContent = `Il contient ${plur(jr.avis.length, 'avis', 'avis')}, ${plur(jr.parties.length, 'partie jouée', 'parties jouées')} et le temps passé sur le site. Il reste sur cet ordinateur tant que tu ne le copies pas.`; }
function avisMsg(t){ const m = $('avMsg'); m.textContent = t; m.hidden = !t; }
function openAvis(){
  if (avis) return; if (quiz) closeQuiz(); if (run) stopRun();
  avis = { back: document.activeElement, note: 0, ecran: avisScreen() };
  $('avBloque').value = ''; $('avPlu').value = ''; avisNote(0); avisMsg(''); $('avText').hidden = true; $('avReset').closest('details').open = false;
  const a = $('avMail'); a.hidden = !AVIS_MAIL;
  avisSum(); $('avis').hidden = false; $('avBloque').focus({ preventScroll: true });
}
function closeAvis(){ if (!avis) return; const b = avis.back; avis = null; $('avis').hidden = true; if (b && b.isConnected && !b.hidden) b.focus({ preventScroll: true }); }
function avisNote(n){ if (avis) avis.note = n; document.querySelectorAll('#avNote [data-note]').forEach(b => b.setAttribute('aria-pressed', String(+b.dataset.note === n))); }
function avisSave(){
  const bloque = $('avBloque').value.trim().slice(0, 1000), plu = $('avPlu').value.trim().slice(0, 1000);
  if (!bloque && !plu && !avis.note){ avisMsg('Écris au moins une réponse, ou choisis une note.'); return; }
  const a = { d: dayKey(), ecran: avis.ecran, bloque, plu, note: avis.note }, enLigne = avisEnLigne();
  if (enLigne) a.p = 0;
  jr.avis.push(a); jr.avis = jr.avis.slice(-JR_MAX); saveJr();
  $('avBloque').value = ''; $('avPlu').value = ''; avisNote(0); avisSum();
  if (!enLigne){ avisMsg('Merci, ton avis est enregistré ! Quand tu as fini de tester, envoie ton rapport ci-dessous.'); return; }
  avisMsg('Envoi de ton avis…'); $('avSave').disabled = true;
  avisEnvoie(a).then(ok => { $('avSave').disabled = false;
    avisMsg(ok ? 'Merci, ton avis est bien arrivé chez l’équipe DJingood ! Tu peux en écrire un autre quand tu veux.'
      : 'Ton avis est gardé sur cet ordinateur, mais il n’a pas pu partir (pas de connexion ?). Il repartira tout seul à ta prochaine visite.'); });
}
/* ---------- Envoyer l'avis à l'équipe (lot 46) ----------
   Sur le vrai site, chaque avis est enregistré dans la base Firebase (collection `avis`) : tout le monde peut en écrire un,
   personne ne peut les relire depuis le site (firestore.rules). L'équipe les lit dans la console Firebase.
   Avec l'avis partent : la date, l'écran, le parcours, la table branchée, le navigateur, et l'identifiant du compte si on
   est connecté (pour retrouver sa progression). Pas l'adresse e-mail, pas le prénom.
   Un avis qui n'a pas pu partir (`p` : 0) repart tout seul à la visite suivante. Les avis écrits avant ce lot n'ont pas
   de `p` : ils restent sur l'ordinateur, puisqu'on avait promis « rien n'est envoyé sans toi ».
   En local et pendant les tests, rien ne part, sauf avec le faux Firebase des tests (`window.DJINGO_FIREBASE`). */
const AVIS_DOC = 'avis', AVIS_LENT = 8000;
const avisEnLigne = () => typeof cptOn === 'function' && cptOn() && (STATS_DOMAINES.includes(location.hostname) || !!window.DJINGO_FIREBASE);
function avisDoc(a){
  const b = ppBranchee(), d = { v: 1, quand: firebase.firestore.FieldValue.serverTimestamp(), jour: a.d, ecran: a.ecran, note: a.note,
    bloque: a.bloque, plu: a.plu, parcours: parcours || '', table: b ? b.nom.slice(0, 120) : 'aucune', appareil: navName().slice(0, 80) };
  if (cpt) d.uid = cpt.uid;
  return d;
}
const avisEnCours = new Set();   // un avis en route ne doit pas repartir une deuxième fois en même temps
function avisEnvoie(a){
  let fin = 0; avisEnCours.add(a);
  const part = cptSdkDb().then(() => cptFb.db.collection(AVIS_DOC).add(avisDoc(a)));
  // Noté comme parti dès qu'il arrive, même après les 8 s (connexion très lente) : sinon il repartirait en double
  part.then(() => { if (a.p !== 1){ a.p = 1; saveJr(); stat('avis', { note: a.note }); } }, () => {});
  return Promise.race([part,
    new Promise((_, ko) => { fin = setTimeout(() => ko(new Error('trop lent')), AVIS_LENT); })   // hors ligne, Firestore ne répond jamais
  ]).then(() => true, () => false)
    .then(ok => { clearTimeout(fin); avisEnCours.delete(a); return ok; });
}
// Les avis restés en attente repartent, un par un, une fois la page tranquille
setTimeout(() => { if (!avisEnLigne()) return;
  jr.avis.filter(a => a.p === 0 && !avisEnCours.has(a)).reduce((p, a) => p.then(() => avisEnvoie(a)), Promise.resolve()); }, 10000);
function avisCopy(){
  const t = avisRapport(), box = $('avText'), show = () => { box.value = t; box.hidden = false; box.focus(); box.select(); avisMsg('Sélectionne le texte ci-dessous et copie-le (Ctrl + C), puis colle-le dans ton message.'); };
  if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(t).then(() => avisMsg('Rapport copié ! Colle-le dans un e-mail ou un message (Ctrl + V).'), show); else show();
}
function avisMail(){
  let t = avisRapport(); if (t.length > 1800) t = t.slice(0, 1800) + '\n(rapport coupé : utilise plutôt « Copier mon rapport »)';
  location.href = 'mailto:' + AVIS_MAIL + '?subject=' + encodeURIComponent('Rapport DJingood') + '&body=' + encodeURIComponent(t);
}
// Remise à zéro : tout ce que le site a enregistré, sauf ce qui concerne la table (réglages, nom d'une autre table, vérification)
// et les étapes déjà comptées par les statistiques (sinon un testeur qui recommence serait compté deux fois)
function avisReset(){
  jrOff = true;
  const efface = () => {
    try { Object.keys(localStorage).filter(k => k.startsWith('coach-') && !['coach-midi-map', 'coach-table', 'coach-tables', 'coach-verif', 'coach-stats'].includes(k)).forEach(k => localStorage.removeItem(k)); } catch (e) {}
    // replaceState ne déclenche pas hashchange : avec location.hash, l'accueil se réaffichait une fraction de seconde et
    // réécrivait les quêtes du jour juste après l'effacement (test instable, trouvé par le gardien du lot 44)
    history.replaceState(null, '', '#accueil'); location.reload();
  };
  // D'abord le compte en ligne, sinon la progression reviendrait au rechargement (compte.js est chargé après ce fichier).
  // S'il n'a pas pu être effacé (hors ligne), on n'efface rien du tout et on le dit : pas de promesse non tenue.
  const fini = typeof cptOublie === 'function' ? cptOublie() : Promise.resolve(true);
  fini.then(ok => { if (ok === false && typeof cptResetKo === 'function'){ jrOff = false; cptResetKo(); return; } efface(); }, efface);
}
$('avisBtn').addEventListener('click', openAvis);
$('avClose').addEventListener('click', closeAvis);
$('avis').addEventListener('click', e => { if (e.target === $('avis')) closeAvis(); });
$('avSave').addEventListener('click', avisSave);
$('avCopy').addEventListener('click', avisCopy);
$('avMail').addEventListener('click', avisMail);
$('avReset').addEventListener('click', avisReset);
document.querySelectorAll('#avNote [data-note]').forEach(b => b.addEventListener('click', () => avisNote(avis && avis.note === +b.dataset.note ? 0 : +b.dataset.note)));
document.addEventListener('keydown', e => { if (e.key === 'Escape' && avis){ e.stopPropagation(); closeAvis(); } }, true);
