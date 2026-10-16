// Premiers pas (lot 28) : à la toute première visite, Vini pose quelques questions, une par écran, comme dans Duolingo,
// puis mène à la première partie (ou au test de placement). Les réponses sont gardées dans coach-accueil.
// Tous les fichiers de js/ partagent la même portée et sont chargés dans l'ordre indiqué dans index.html.
'use strict';
/* ---------- Premiers pas ----------
   S'ouvre seulement pour un nouveau venu : pas de parcours (ni choisi, ni déduit d'une progression) et pas encore de réponses.
   « Passer » ferme sans rien choisir : l'accueil propose alors les deux parcours, comme avant. */
const ACC_KEY = 'coach-accueil';
const PP_ETAPES = ['salut', 'niveau', 'table', 'pourquoi', 'objectif', 'depart'];
const PP_NIVEAUX = ['Je n’ai jamais touché une table', 'Je sais lancer deux morceaux', 'Je fais des transitions, pas encore propres', 'Je mixe déjà en soirée'];
const PP_NIV_DIT = ['Parfait, on part de zéro. Un geste à la fois !', 'Bien ! On va rendre tes transitions propres.', 'Top. On va les rendre propres et précises.', 'Alors le Mode Expert va te plaire !'];
const PP_TABLES = [['flx4', 'Une Pioneer DDJ-FLX4', ''], ['autre', 'Une autre table DJ', ''], ['souris', 'Pas encore de table', 'Je joue à la souris']];
const PP_TAB_DIT = { flx4: 'Parfait : DJingo est fait pour elle.', autre: 'Pas de souci : quand tu la brancheras, je te montrerai comment la régler.', souris: 'Aucun problème : tout se joue à la souris. Tu brancheras une table plus tard.' };
const PP_POURQUOI = [['potes', 'Mixer entre potes'], ['soirees', 'Mes premières soirées'], ['reseaux', 'Publier des mixes en ligne'], ['plaisir', 'Pour le plaisir'], ['pro', 'Devenir DJ']];
const PP_MINUTES = [[5, 'Tranquille', 'à ton rythme !'], [10, 'Normal', 'en 2 semaines !'], [15, 'Intensif', 'encore plus vite !']];
const PP_DEPARTS = [['bases', 'Commencer par les bases', 'Le premier niveau, le plus facile'], ['test', 'Passer le test de placement', '3 épreuves pour trouver ton point de départ']];
// petits dessins (traits de la couleur du texte de la carte)
const ppTrait = d => `<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
const PP_IC = {
  flx4: ppTrait('<rect x="2" y="8" width="28" height="16" rx="4"/><circle cx="9" cy="16" r="4"/><circle cx="23" cy="16" r="4"/><path d="M15 12v8M17 12v8"/>'),
  autre: ppTrait('<rect x="2" y="8" width="28" height="16" rx="4"/><circle cx="10" cy="16" r="4"/><path d="M19 12h7M19 16h7M19 20h4"/>'),
  souris: ppTrait('<rect x="9" y="3" width="14" height="26" rx="7"/><path d="M16 3v8M9 11h14"/>'),
  potes: ppTrait('<circle cx="11" cy="11" r="4"/><circle cx="22" cy="12" r="3.5"/><path d="M3 26c1-5 4-7 8-7s7 2 8 7M18 20c3 0 6 2 7 6"/>'),
  soirees: ppTrait('<circle cx="16" cy="13" r="7"/><path d="M9 13h14M16 6v14M11 8.5c3 3 7 3 10 0M11 17.5c3-3 7-3 10 0M16 3v3M8 27l3-6M24 27l-3-6"/>'),
  reseaux: ppTrait('<rect x="9" y="3" width="14" height="26" rx="3"/><path d="M14 12v8l6-4z"/>'),
  plaisir: ppTrait('<path d="M16 27S4 20 4 12a6 6 0 0 1 12-2 6 6 0 0 1 12 2c0 8-12 15-12 15z"/>'),
  pro: ppTrait('<path d="M16 3l3.6 7.6 8.4 1.2-6 5.8 1.4 8.4L16 22l-7.4 4 1.4-8.4-6-5.8 8.4-1.2z"/>'),
  bases: ppTrait('<path d="M6 5h17a3 3 0 0 1 3 3v19H9a3 3 0 0 1-3-3z"/><path d="M6 24a3 3 0 0 1 3-3h17"/><path d="M14 10l2-1v8"/>'),
  test: ppTrait('<circle cx="16" cy="16" r="12"/><path d="M20.5 11.5l-3 6.5-6.5 3 3-6.5z"/>'),
  coche: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
  plan: ppTrait('<circle cx="16" cy="16" r="13"/><path d="M10 21v-7M15 21v-11M20 21v-5M25 21v-9" stroke-width="2.6"/>')
};
const ppBarres = n => `<svg viewBox="0 0 28 24">${[[0, 16, 8], [7.5, 11, 13], [15, 6, 18], [22.5, 0, 24]].map(([x, y, h], k) => `<rect class="${k <= n ? 'pp-b-on' : 'pp-b-off'}" x="${x}" y="${y}" width="5" height="${h}" rx="2.5"/>`).join('')}</svg>`;

// réponses déjà données : un objet { niveau, table, pourquoi, min, depart, fini } ou { passe, fini } ; tout le reste est ignoré
let accueil = null; try { accueil = JSON.parse(localStorage.getItem(ACC_KEY) || 'null'); } catch (e) {}
if (!accueil || typeof accueil !== 'object' || Array.isArray(accueil) || !(accueil.passe === true || typeof accueil.fini === 'string')) accueil = null;
else accueil = { niveau: [0, 1, 2, 3].includes(accueil.niveau) ? accueil.niveau : null, table: PP_TABLES.some(t => t[0] === accueil.table) ? accueil.table : null,
  pourquoi: Array.isArray(accueil.pourquoi) ? PP_POURQUOI.map(p => p[0]).filter(k => accueil.pourquoi.includes(k)) : [],
  min: PP_MINUTES.some(m => m[0] === accueil.min) ? accueil.min : null, depart: PP_DEPARTS.some(d => d[0] === accueil.depart) ? accueil.depart : null,
  passe: accueil.passe === true, fini: typeof accueil.fini === 'string' ? accueil.fini.slice(0, 10) : '' };
const pp = { on: false, i: 0, rep: { niveau: null, table: null, pourquoi: [], min: null, depart: null } };
const ppAOuvrir = () => !parcours && !accueil;
const ppSave = o => { accueil = o; try { localStorage.setItem(ACC_KEY, JSON.stringify(o)); } catch (e) {} };

function openPremiers(){
  if (pp.on) return;
  pp.on = true; pp.i = 0; pp.rep = { niveau: null, table: null, pourquoi: [], min: null, depart: null };
  if (!$('ppVini').firstChild) viniMettre($('ppVini'));
  $('pp').hidden = false; document.documentElement.classList.add('pp-open');
  ppRender(0);
}
function ppClose(){ pp.on = false; $('pp').hidden = true; document.documentElement.classList.remove('pp-open'); }
// Le dernier écran choisit le parcours, l'objectif du jour, et mène à la première partie (ou au test de placement)
function ppFin(){
  const r = pp.rep;
  ppSave({ niveau: r.niveau, table: r.table, pourquoi: r.pourquoi, min: r.min, depart: r.depart, fini: dayKey() });
  goalSet(r.min); ppClose(); setParcours(r.niveau === 0 ? 'debut' : 'deja');
  if (r.depart === 'test'){ goLesson(1, null); startPlacement(); } else goLesson(1, 0);
}
function ppPasser(){ ppSave({ passe: true, fini: dayKey() }); ppClose(); renderHome(); }
// Recommandé : les bases pour qui n'a jamais mixé, le test de placement pour les autres
const ppReco = () => pp.rep.niveau === 0 ? 'bases' : 'test';
const ppPret = () => { const r = pp.rep, id = PP_ETAPES[pp.i];
  return id === 'salut' || (id === 'niveau' && r.niveau !== null) || (id === 'table' && r.table !== null) || (id === 'pourquoi' && r.pourquoi.length > 0) || (id === 'objectif' && r.min !== null) || (id === 'depart' && r.depart !== null); };
function ppOption(o){
  const b = document.createElement('button'); b.type = 'button'; b.className = 'pp-opt' + (o.big ? ' pp-big' : ''); b.dataset.v = String(o.v);
  if (o.badge){ const g = document.createElement('span'); g.className = 'pp-badge'; g.textContent = o.badge; b.appendChild(g); }
  if (o.ic){ const ic = document.createElement('span'); ic.className = 'pp-ic'; ic.setAttribute('aria-hidden', 'true'); ic.innerHTML = o.ic; b.appendChild(ic); }
  const t = document.createElement('span'), m = document.createElement('span'); t.className = 'pp-txt'; m.textContent = o.txt; t.appendChild(m);
  if (o.sub){ const s = document.createElement('span'); s.className = 'pp-sub'; s.textContent = o.sub; t.appendChild(s); }
  b.appendChild(t);
  if (o.tag){ const s = document.createElement('span'); s.className = 'pp-tag'; s.textContent = o.tag; b.appendChild(s); }
  if (o.coche){ const c = document.createElement('span'); c.className = 'pp-check'; c.setAttribute('aria-hidden', 'true'); c.innerHTML = PP_IC.coche; b.appendChild(c); }
  b.addEventListener('click', () => { o.pick(); ppMaj(); viniJoie($('ppVini')); });
  return b;
}
// Un écran : la question de Vini, les réponses, le bouton du bas. `sens` : 1 en avançant, -1 en revenant, 0 sans animation
function ppRender(sens){
  const id = PP_ETAPES[pp.i], r = pp.rep, body = $('ppBody'), box = $('ppOpts');
  $('ppBack').hidden = pp.i === 0;
  const frac = pp.i / (PP_ETAPES.length - 1); $('ppFill').style.width = Math.max(6, frac * 100) + '%'; $('ppBar').setAttribute('aria-valuenow', String(Math.round(frac * 100)));
  body.classList.toggle('pp-hero', id === 'salut');
  box.innerHTML = ''; box.classList.toggle('pp-espace', id === 'depart');
  const add = o => box.appendChild(ppOption(o));
  if (id === 'niveau') PP_NIVEAUX.forEach((txt, k) => add({ v: k, txt, ic: ppBarres(k), pick: () => { r.niveau = k; } }));
  if (id === 'table') PP_TABLES.forEach(([v, txt, sub]) => add({ v, txt, sub, ic: PP_IC[v], pick: () => { r.table = v; } }));
  if (id === 'pourquoi') PP_POURQUOI.forEach(([v, txt]) => add({ v, txt, ic: PP_IC[v], coche: true, pick: () => { r.pourquoi = r.pourquoi.includes(v) ? r.pourquoi.filter(x => x !== v) : r.pourquoi.concat(v); } }));
  if (id === 'objectif') PP_MINUTES.forEach(([v, tag]) => add({ v, txt: v + ' min par jour', tag, pick: () => { r.min = v; } }));
  if (id === 'depart') PP_DEPARTS.forEach(([v, txt, sub]) => add({ v, txt, sub, ic: PP_IC[v], big: true, badge: v === ppReco() ? 'Recommandé' : '', pick: () => { r.depart = v; } }));
  $('ppGo').textContent = id === 'salut' ? 'C’est parti' : id === 'depart' ? 'Commencer' : 'Continuer';
  ppMaj();
  body.classList.remove('pp-in', 'pp-in-back'); void body.offsetWidth;
  if (sens && !REDUCED) body.classList.add(sens > 0 ? 'pp-in' : 'pp-in-back');
  const first = box.querySelector('.pp-opt'); (first || $('ppCol')).focus({ preventScroll: true });
}
// Après un choix : les cartes cochées, ce que dit Vini, la petite note, le bouton du bas
function ppMaj(){
  const id = PP_ETAPES[pp.i], r = pp.rep;
  const sel = { niveau: r.niveau, table: r.table, objectif: r.min, depart: r.depart }[id];
  $('ppOpts').querySelectorAll('.pp-opt').forEach(b => b.setAttribute('aria-pressed', String(id === 'pourquoi' ? r.pourquoi.includes(b.dataset.v) : sel !== null && sel !== undefined && String(sel) === b.dataset.v)));
  $('ppAsk').textContent = id === 'salut' ? 'Salut, moi c’est Vini ! Je vais t’apprendre à mixer. D’abord, quelques questions pour préparer ton parcours.'
    : id === 'niveau' ? (r.niveau === null ? 'Tu as déjà mixé ?' : PP_NIV_DIT[r.niveau])
    : id === 'table' ? (r.table === null ? 'Tu as quelle table ?' : PP_TAB_DIT[r.table])
    : id === 'pourquoi' ? 'Pourquoi tu veux mixer ? Choisis tout ce qui te parle.'
    : id === 'objectif' ? 'Combien de temps par jour pour t’entraîner ?'
    : 'Par où tu commences ?';
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
  const tab = PP_TABLES.find(t => t[0] === accueil.table), dep = PP_DEPARTS.find(d => d[0] === accueil.depart);
  return [accueil.niveau !== null ? PP_NIVEAUX[accueil.niveau] : '', tab ? tab[1] + (tab[2] ? ' (' + tab[2].toLowerCase() + ')' : '') : '',
    accueil.pourquoi.length ? 'pour : ' + accueil.pourquoi.map(k => PP_POURQUOI.find(p => p[0] === k)[1].toLowerCase()).join(', ') : '',
    accueil.min ? accueil.min + ' min par jour' : '', dep ? dep[1].toLowerCase() : ''].filter(Boolean).join(' · ');
}
