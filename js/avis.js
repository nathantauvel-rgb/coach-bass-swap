// Tests avec des débutants : « Mon avis », « C'était clair ? » après un niveau, rapport à envoyer, remise à zéro.
// Tous les fichiers de js/ partagent la même portée et sont chargés dans l'ordre indiqué dans index.html.
'use strict';
/* ---------- Journal ----------
   Tout reste sur l'ordinateur du testeur, dans `coach-journal`, jusqu'à ce qu'il copie ou envoie son rapport.
   Rien n'est envoyé automatiquement. */
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
    parties: arr(jr.parties, p => p && typeof p === 'object' && [1, 2, 3, 4, 5, 6].includes(p.c) && Number.isInteger(p.n) && p.n >= 0 && p.n < lessonsOf(p.c).length && [1, 2, 3].includes(p.e)),
    clair: Object.fromEntries(Object.entries(cl).filter(([k, v]) => /^[1-6]-[0-6]$/.test(k) && JR_CLAIR.includes(v))),
    avis: arr(jr.avis, a => a && typeof a === 'object' && typeof a.d === 'string').map(a => ({ d: a.d.slice(0, 10), ecran: txt(a.ecran).slice(0, 80), bloque: txt(a.bloque), plu: txt(a.plu), note: [1, 2, 3, 4, 5].includes(a.note) ? a.note : 0 })),
    erreurs: arr(jr.erreurs, e => typeof e === 'string', 5)
  };
}
let jrOff = false;   // vrai pendant la remise à zéro : plus rien ne doit être réécrit
const saveJr = () => { if (jrOff) return; try { localStorage.setItem(JR_KEY, JSON.stringify(jr)); } catch (e) {} };
if (jr.jours[jr.jours.length - 1] !== dayKey()){ jr.jours.push(dayKey()); jr.jours = jr.jours.slice(-JR_MAX); }
saveJr();
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
document.querySelectorAll('#clairRow [data-clair]').forEach(b => b.addEventListener('click', () => { if (!clairKey) return; jr.clair[clairKey] = b.dataset.clair; saveJr(); clairShow(); }));

/* ---------- Le rapport ---------- */
function navName(){
  const u = navigator.userAgent, m = u.match(/Edg\/(\d+)/) || u.match(/Chrome\/(\d+)/) || u.match(/Firefox\/(\d+)/), nav = m ? (/Edg\//.test(u) ? 'Edge ' : /Chrome\//.test(u) ? 'Chrome ' : 'Firefox ') + m[1] : /Safari\//.test(u) ? 'Safari' : 'navigateur inconnu';
  const os = /Windows/.test(u) ? 'Windows' : /iPhone|iPad/.test(u) ? 'iPhone ou iPad' : /Android/.test(u) ? 'Android' : /Mac OS/.test(u) ? 'Mac' : /Linux/.test(u) ? 'Linux' : '';
  return nav + (os ? ', ' + os : '');
}
function avisRapport(){
  const L = [], lv = (c, n) => lessonsOf(c)[n], max = BASE_LESSONS.length * 3;
  L.push(`Rapport DJingood du ${dayKey()}`);
  L.push(`Parcours : ${PARCOURS[parcours] ? PARCOURS[parcours].name : 'pas encore choisi'} · ${midiCount > 0 ? 'table branchée : ' + midiNames.join(', ') + (tableCfg ? (tableCfg.modele ? ' (reconnue d’après sa fiche)' : ' (réglée pas à pas)') : tableOn() ? '' : ' (pas encore réglée)') : 'sans table (souris)'} · ${navName()}`);
  L.push(`Premiers pas : ${ppResume()}`);
  L.push(`Temps sur le site : ${Math.round(jr.secs / 60)} min, sur ${plur(jr.jours.length, 'jour', 'jours')} (première visite le ${jr.debut})`);
  L.push(`Étoiles : chapitre 1 ${sumStars(stars)}/${max}, chapitre 2 ${sumStars(ch2Stars)}/${max}, chapitre 3 ${sumStars(ch3Stars)}/${CH3_LESSONS.length * 3}, chapitre 4 ${sumStars(ch4Stars)}/${CH4_LESSONS.length * 3}, chapitre 5 ${sumStars(ch5Stars)}/${CH5_LESSONS.length * 3}${CH6_PRET ? `, chapitre 6 ${sumStars(ch6Stars)}/${CH6_LESSONS.length * 3}` : ''} · ${$('xpTxt').textContent} · badges ${badgesWon.length}/${BADGES.length} · quiz ${quizOk.length}/${QUIZ.length}`);
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
function avisSum(){ $('avSum').textContent = `Il contient ${plur(jr.avis.length, 'avis', 'avis')}, ${plur(jr.parties.length, 'partie jouée', 'parties jouées')} et le temps passé sur le site. Rien n'est envoyé sans toi.`; }
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
  jr.avis.push({ d: dayKey(), ecran: avis.ecran, bloque, plu, note: avis.note }); jr.avis = jr.avis.slice(-JR_MAX); saveJr();
  $('avBloque').value = ''; $('avPlu').value = ''; avisNote(0); avisSum();
  avisMsg('Merci, ton avis est enregistré ! Quand tu as fini de tester, envoie ton rapport ci-dessous.');
}
function avisCopy(){
  const t = avisRapport(), box = $('avText'), show = () => { box.value = t; box.hidden = false; box.focus(); box.select(); avisMsg('Sélectionne le texte ci-dessous et copie-le (Ctrl + C), puis colle-le dans ton message.'); };
  if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(t).then(() => avisMsg('Rapport copié ! Colle-le dans un e-mail ou un message (Ctrl + V).'), show); else show();
}
function avisMail(){
  let t = avisRapport(); if (t.length > 1800) t = t.slice(0, 1800) + '\n(rapport coupé : utilise plutôt « Copier mon rapport »)';
  location.href = 'mailto:' + AVIS_MAIL + '?subject=' + encodeURIComponent('Rapport DJingood') + '&body=' + encodeURIComponent(t);
}
// Remise à zéro : tout ce que le site a enregistré, sauf ce qui concerne la table (réglages, nom d'une autre table, vérification)
function avisReset(){
  jrOff = true;
  const efface = () => {
    try { Object.keys(localStorage).filter(k => k.startsWith('coach-') && !['coach-midi-map', 'coach-table', 'coach-tables', 'coach-verif'].includes(k)).forEach(k => localStorage.removeItem(k)); } catch (e) {}
    location.hash = '#accueil'; location.reload();
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
