// Premiers pas (lot 28, refait au lot 37) : à la toute première visite, Vini pose trois questions, une par écran, comme
// dans Duolingo : ton niveau, ta table, ton objectif du jour. Le niveau choisit le parcours (parcours.js) et la première partie.
// Les réponses sont gardées dans coach-accueil.
// Tous les fichiers de js/ partagent la même portée et sont chargés dans l'ordre indiqué dans index.html.
'use strict';
/* ---------- Premiers pas ----------
   S'ouvre seulement pour un nouveau venu : pas de parcours (ni choisi, ni déduit d'une progression) et pas encore de réponses.
   « Passer » ferme sans rien choisir : l'accueil propose alors les trois parcours.
   Lot 37 (choix de l'utilisateur, 22 oct. 2026) : plus de « Pourquoi tu veux mixer ? » (la réponse ne servait à rien), plus de
   test de placement (les chapitres ne sont pas de plus en plus durs, ce sont des gestes différents), et aucune table n'est
   mise en avant : la table branchée est reconnue toute seule, sinon on la choisit dans la liste. */
const ACC_KEY = 'coach-accueil';
const PP_ETAPES = ['salut', 'niveau', 'table', 'objectif'];
// Les trois niveaux : identifiant (= parcours), nom, ce qu'il veut dire, ce que répond Vini
const PP_NIVEAUX = [
  ['debut', 'Grand débutant', 'Je n’ai jamais mixé', 'Parfait, on part de zéro. Chaque bouton, un par un !'],
  ['apprenti', 'Apprenti DJ', 'Je sais lancer deux morceaux, mes transitions ne sont pas encore propres', 'On saute les explications : tout est ouvert, en Mode Expert.'],
  ['confirme', 'DJ confirmé', 'Je mixe déjà, je veux du défi', 'Alors on attaque direct par un vrai set : plusieurs morceaux enchaînés, noté sur 100. Accroche-toi !']
];
const PP_TABLES = [['table', 'J’ai une table', 'Branche-la en USB : je la reconnais toute seule'], ['souris', 'Pas encore de table', 'Je joue à la souris']];
const PP_MINUTES = [[5, 'Tranquille', 'à ton rythme !'], [10, 'Normal', 'en 2 semaines !'], [15, 'Intensif', 'encore plus vite !']];
// Les tables que le site connaît, rangées par marque, toutes sur un pied d'égalité (la FLX4 avec les autres Pioneer)
const ppMarque = nom => nom.split(' ')[0];
const PP_LISTE = [{ id: 'flx4', nom: 'Pioneer DDJ-FLX4' }].concat(MODELES.map(m => ({ id: m.id, nom: m.nom })))
  .sort((a, b) => ppMarque(a.nom).localeCompare(ppMarque(b.nom)) || a.nom.localeCompare(b.nom));
const ppNomDe = id => (PP_LISTE.find(t => t.id === id) || {}).nom || '';
// La table branchée en ce moment : { nom, id } (id : 'flx4', celui d'une fiche, ou 'inconnue'), ou null
function ppBranchee(){
  if (!midiCount) return null;
  const n = midiNames.find(isFlx4) || midiNames.find(x => modeleDe(x)) || midiNames[0], m = modeleDe(n);
  return isFlx4(n) ? { nom: 'Pioneer DDJ-FLX4', id: 'flx4' } : m ? { nom: m.nom, id: m.id } : { nom: n.replace(/^\d+-\s*/, ''), id: 'inconnue' };
}
// petits dessins (traits de la couleur du texte de la carte)
const ppTrait = d => `<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
const PP_IC = {
  table: ppTrait('<rect x="2" y="8" width="28" height="16" rx="4"/><circle cx="9" cy="16" r="4"/><circle cx="23" cy="16" r="4"/><path d="M15 12v8M17 12v8"/>'),
  souris: ppTrait('<rect x="9" y="3" width="14" height="26" rx="7"/><path d="M16 3v8M9 11h14"/>'),
  coche: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
  plan: ppTrait('<circle cx="16" cy="16" r="13"/><path d="M10 21v-7M15 21v-11M20 21v-5M25 21v-9" stroke-width="2.6"/>')
};
const ppBarres = n => `<svg viewBox="0 0 28 24">${[[2, 14, 10], [11.5, 7, 17], [21, 0, 24]].map(([x, y, h], k) => `<rect class="${k <= n ? 'pp-b-on' : 'pp-b-off'}" x="${x}" y="${y}" width="5" height="${h}" rx="2.5"/>`).join('')}</svg>`;

// réponses déjà données : un objet { niveau, table, modele, min, fini } ou { passe, fini } ; tout le reste est ignoré.
// Avant le lot 37, `niveau` était un numéro de 0 à 3 (0 = Grand débutant, 1 et 2 = Apprenti DJ, 3 = DJ confirmé)
// et `table` valait 'flx4', 'autre' ou 'souris'.
let accueil = null; try { accueil = JSON.parse(localStorage.getItem(ACC_KEY) || 'null'); } catch (e) {}
if (!accueil || typeof accueil !== 'object' || Array.isArray(accueil) || !(accueil.passe === true || typeof accueil.fini === 'string')) accueil = null;
else { const v = accueil.niveau, t = accueil.table, m = accueil.modele;
  accueil = { niveau: PP_NIVEAUX.some(x => x[0] === v) ? v : [0, 1, 2, 3].includes(v) ? ['debut', 'apprenti', 'apprenti', 'confirme'][v] : null,
    table: PP_TABLES.some(x => x[0] === t) ? t : t === 'flx4' || t === 'autre' ? 'table' : null,
    modele: typeof m === 'string' && (m === 'autre' || m === 'inconnue' || !!ppNomDe(m)) ? m : t === 'flx4' ? 'flx4' : '',
    min: PP_MINUTES.some(x => x[0] === accueil.min) ? accueil.min : null, passe: accueil.passe === true, fini: typeof accueil.fini === 'string' ? accueil.fini.slice(0, 10) : '' }; }
const ppVide = () => ({ niveau: null, table: null, modele: '', min: null, vue: false });   // vue : la table a été reconnue au branchement
const pp = { on: false, i: 0, rep: ppVide() };
const ppAOuvrir = () => !parcours && !accueil;
const ppSave = o => { accueil = o; try { localStorage.setItem(ACC_KEY, JSON.stringify(o)); } catch (e) {} };

function openPremiers(){
  if (pp.on) return;
  pp.on = true; pp.i = 0; pp.rep = ppVide();
  if (!$('ppVini').firstChild) viniMettre($('ppVini'));
  $('pp').hidden = false; document.documentElement.classList.add('pp-open');
  ppRender(0);
}
function ppClose(){ pp.on = false; $('pp').hidden = true; document.documentElement.classList.remove('pp-open'); }
// Le dernier écran choisit le parcours et l'objectif du jour, puis mène à la première étape de ce parcours :
// le niveau 1 (et le guide) pour un Grand débutant, le Mode Expert pour un Apprenti DJ, le set (chapitre 7) pour un DJ confirmé
function ppFin(){
  const r = pp.rep;
  ppSave({ niveau: r.niveau, table: r.table, modele: r.modele, min: r.min, fini: dayKey() });
  goalSet(r.min); ppClose(); setParcours(r.niveau);
  if (r.niveau === 'debut') goLesson(1, 0); else STAGES[nextStage() || PARCOURS[r.niveau].stages[0]].go();
}
function ppPasser(){ ppSave({ passe: true, fini: dayKey() }); ppClose(); renderHome(); }
const ppPret = () => { const r = pp.rep, id = PP_ETAPES[pp.i];
  return id === 'salut' || (id === 'niveau' && r.niveau !== null) || (id === 'table' && r.table !== null) || (id === 'objectif' && r.min !== null); };
/* L'écran de la table. Une table branchée est reconnue toute seule (ppMidi est appelé par initMidi à chaque branchement) ;
   sinon « J'ai une table » ouvre la liste par marque, qui sert seulement à savoir si DJingood la connaît déjà. */
function ppTableOpts(add){
  const r = pp.rep, b = ppBranchee();
  if (b){ r.table = 'table'; r.modele = b.id; r.vue = true;
    add({ v: 'table', txt: b.nom, sub: b.id === 'inconnue' ? 'Branchée · je ne la connais pas encore' : 'Branchée et reconnue', ic: PP_IC.table, big: true, pick: () => {} });
    return; }
  if (r.vue){ r.vue = false; r.modele = ''; }   // elle vient d'être débranchée
  PP_TABLES.forEach(([v, txt, sub]) => add({ v, txt, sub, ic: PP_IC[v], pick: () => { r.table = v; if (v === 'souris') r.modele = ''; } }));
  const box = document.createElement('label'), t = document.createElement('span'), sel = document.createElement('select');
  box.className = 'pp-liste'; box.id = 'ppListe'; t.textContent = 'Laquelle ? (si tu ne peux pas la brancher maintenant)'; sel.id = 'ppModele';
  const vide = document.createElement('option'); vide.value = ''; vide.textContent = 'Choisis ta table'; sel.appendChild(vide);
  let grp = null;
  PP_LISTE.forEach(x => { if (!grp || grp.label !== ppMarque(x.nom)){ grp = document.createElement('optgroup'); grp.label = ppMarque(x.nom); sel.appendChild(grp); }
    const o = document.createElement('option'); o.value = x.id; o.textContent = x.nom; grp.appendChild(o); });
  const autre = document.createElement('option'); autre.value = 'autre'; autre.textContent = 'Une autre table'; sel.appendChild(autre);
  sel.value = r.modele || '';
  sel.addEventListener('change', () => { r.modele = sel.value; ppMaj(); });
  box.append(t, sel); $('ppOpts').appendChild(box);
  // Lot 45 : la table est branchée mais le navigateur ne la voit pas, ou l'accès a été refusé (midi.js)
  const d = document.createElement('details'), sm = document.createElement('summary'), body = document.createElement('div');
  d.className = 'pp-aide'; d.id = 'ppAide'; body.className = 'taide-in'; midiAideRemplir(body);
  sm.textContent = midiEtat === 'refuse' ? 'Comment l’autoriser ?' : midiEtat === 'absent' ? (midiIos() ? 'Ouvrir DJingood sur un ordinateur' : 'Ouvrir DJingood dans Chrome') : 'Elle est branchée, mais je ne la vois pas ?';
  d.open = midiEtat === 'refuse' || midiEtat === 'absent';
  d.append(sm, body); $('ppOpts').appendChild(d);
}
// L'aide se montre quand on dit avoir une table et qu'aucune n'est vue, quand l'accès a été refusé, ou quand le navigateur ne
// sait pas parler aux tables (Safari) ; jamais à la souris
const ppAideVue = r => r.table !== 'souris' && (midiEtat === 'refuse' || midiEtat === 'absent' || (midiEtat === 'pret' && r.table === 'table'));
function ppTableDit(){
  const r = pp.rep, b = ppBranchee();
  if (b) return b.id === 'inconnue' ? `Je vois ta table, mais je ne la connais pas encore : je te montrerai comment la régler, ça prend deux minutes.`
    : `Je la reconnais : ta ${b.nom} est prête à jouer !`;
  if (r.table === 'souris') return 'Aucun problème : tout se joue à la souris. Tu brancheras une table plus tard.';
  // ce que le navigateur a répondu (lot 45) : il ne peut pas voir de table, il attend qu'on l'autorise, ou on l'a refusé
  if (midiEtat === 'absent') return midiIos() ? 'Sur iPhone et iPad, je ne peux pas parler à une table. Continue à la souris, et ouvre DJingood sur un ordinateur pour brancher ta table.'
    : 'Ce navigateur ne sait pas parler aux tables DJ : ouvre DJingood dans Chrome ou Edge pour brancher la tienne. En attendant, tout marche à la souris.';
  if (midiEtat === 'question') return 'Ton navigateur te demande si je peux parler à ta table : clique sur « Autoriser », en haut de l’écran.';
  if (midiEtat === 'refuse') return 'Ton navigateur m’a refusé l’accès à ta table. Regarde juste en dessous comment l’autoriser.';
  if (r.table !== 'table') return 'Tu as une table DJ ?';
  if (r.modele === 'autre') return 'Pas de souci : quand tu la brancheras, je te montrerai comment la régler.';
  if (r.modele) return `Je connais la ${ppNomDe(r.modele)} : je la reconnaîtrai dès que tu la brancheras.`;
  return 'Branche-la en USB, je t’attends ! Tu peux aussi continuer : je la reconnaîtrai plus tard.';
}
// Une table vient d'être branchée ou débranchée pendant l'écran de la table : on le refait
// (le navigateur prévient plusieurs fois pour un seul branchement : on ne refait l'écran que si la table a changé)
let ppVu = '';
function ppMidi(){ const b = ppBranchee(), k = b ? b.nom : '';
  if (k === ppVu) return; ppVu = k;
  if (pp.on && PP_ETAPES[pp.i] === 'table'){ ppRender(0); if (b) viniJoie($('ppVini')); } }
function ppOption(o){
  const b = document.createElement('button'); b.type = 'button'; b.className = 'pp-opt' + (o.big ? ' pp-big' : ''); b.dataset.v = String(o.v);
  if (o.badge){ const g = document.createElement('span'); g.className = 'pp-badge'; g.textContent = o.badge; b.appendChild(g); }
  if (o.ic){ const ic = document.createElement('span'); ic.className = 'pp-ic'; ic.setAttribute('aria-hidden', 'true'); ic.innerHTML = o.ic; b.appendChild(ic); }
  const t = document.createElement('span'), m = document.createElement('span'); t.className = 'pp-txt'; m.textContent = o.txt; t.appendChild(m);
  if (o.sub){ const s = document.createElement('span'); s.className = 'pp-sub'; s.textContent = o.sub; t.appendChild(s); }
  b.appendChild(t);
  if (o.tag){ const s = document.createElement('span'); s.className = 'pp-tag'; s.textContent = o.tag; b.appendChild(s); }
  if (o.coche){ const c = document.createElement('span'); c.className = 'pp-check'; c.setAttribute('aria-hidden', 'true'); c.innerHTML = PP_IC.coche; b.appendChild(c); }
  b.addEventListener('click', () => { o.pick(); ppMaj(); viniJoie($('ppVini')); son('clic'); });
  return b;
}
// Un écran : la question de Vini, les réponses, le bouton du bas. `sens` : 1 en avançant, -1 en revenant, 0 sans animation
function ppRender(sens){
  const id = PP_ETAPES[pp.i], r = pp.rep, body = $('ppBody'), box = $('ppOpts');
  $('ppBack').hidden = pp.i === 0;
  const frac = pp.i / (PP_ETAPES.length - 1); $('ppFill').style.width = Math.max(6, frac * 100) + '%'; $('ppBar').setAttribute('aria-valuenow', String(Math.round(frac * 100)));
  body.classList.toggle('pp-hero', id === 'salut');
  box.innerHTML = '';
  const add = o => box.appendChild(ppOption(o));
  if (id === 'niveau') PP_NIVEAUX.forEach(([v, txt, sub], k) => add({ v, txt, sub, ic: ppBarres(k), pick: () => { r.niveau = v; } }));
  if (id === 'table') ppTableOpts(add);
  if (id === 'objectif') PP_MINUTES.forEach(([v, tag]) => add({ v, txt: v + ' min par jour', tag, pick: () => { r.min = v; } }));
  $('ppGo').textContent = id === 'salut' ? 'C’est parti' : id === 'objectif' ? 'Commencer' : 'Continuer';
  ppMaj();
  body.classList.remove('pp-in', 'pp-in-back'); void body.offsetWidth;
  if (sens && !REDUCED) body.classList.add(sens > 0 ? 'pp-in' : 'pp-in-back');
  const first = box.querySelector('.pp-opt'); (first || $('ppCol')).focus({ preventScroll: true });
}
// Après un choix : les cartes cochées, ce que dit Vini, la petite note, le bouton du bas
function ppMaj(){
  const id = PP_ETAPES[pp.i], r = pp.rep;
  const sel = { niveau: r.niveau, table: r.table, objectif: r.min }[id];
  $('ppOpts').querySelectorAll('.pp-opt').forEach(b => b.setAttribute('aria-pressed', String(sel !== null && sel !== undefined && String(sel) === b.dataset.v)));
  const liste = $('ppListe'); if (liste) liste.hidden = r.table !== 'table';
  const aide = $('ppAide'); if (aide) aide.hidden = !ppAideVue(r);
  $('ppAsk').textContent = id === 'salut' ? 'Salut, moi c’est Vini ! Je vais t’apprendre à mixer. D’abord, trois questions pour préparer ton parcours.'
    : id === 'niveau' ? (r.niveau === null ? 'Tu en es où avec le mix ?' : PP_NIVEAUX.find(x => x[0] === r.niveau)[3])
    : id === 'table' ? ppTableDit()
    : 'Combien de temps par jour pour t’entraîner ?';
  const note = $('ppNote'), m = PP_MINUTES.find(x => x[0] === r.min);
  note.hidden = !(id === 'objectif' && m);
  if (!note.hidden){ note.innerHTML = PP_IC.plan; const t = document.createElement('span'), b = document.createElement('b');
    t.textContent = `Avec ${m[0]} min par jour, ta première vraie transition propre `; b.textContent = m[2]; t.appendChild(b); note.appendChild(t); }
  $('ppGo').disabled = !ppPret();
}
$('ppGo').addEventListener('click', () => { if (!ppPret()) return; if (pp.i === PP_ETAPES.length - 1) ppFin(); else { pp.i++; ppRender(1); } });
$('ppBack').addEventListener('click', () => { if (pp.i > 0){ pp.i--; ppRender(-1); } });
$('ppSkip').addEventListener('click', ppPasser);
// Pour le rapport des testeurs : ce que la personne a répondu en arrivant
function ppResume(){
  if (!accueil) return 'pas encore faits';
  if (accueil.passe) return 'passés sans répondre';
  const niv = PP_NIVEAUX.find(x => x[0] === accueil.niveau);
  const tab = accueil.table === 'souris' ? 'pas encore de table' : accueil.table !== 'table' ? ''
    : 'une table' + (accueil.modele === 'inconnue' ? ' (branchée, pas dans la liste)' : accueil.modele === 'autre' ? ' (pas dans la liste)' : accueil.modele ? ' : ' + ppNomDe(accueil.modele) : '');
  return [niv ? niv[1] : '', tab, accueil.min ? accueil.min + ' min par jour' : ''].filter(Boolean).join(' · ');
}
