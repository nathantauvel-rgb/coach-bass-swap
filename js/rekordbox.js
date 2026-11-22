// Onglet « Ma musique » (lot 72 ; s'appelait « Passer au vrai ») : la collection rekordbox, ce qui va avec chaque morceau,
// la technique pour faire la transition, les missions à faire dans rekordbox, les favoris et ce qu'on a vu récemment.
// Tous les fichiers de js/ partagent la même portée et sont chargés dans l'ordre indiqué dans index.html.
'use strict';
/* Un morceau = [titre, artiste, genre, bpm, tonalité Camelot, ajouté le (AAAA-MM-JJ, ou ''), lectures (-1 : inconnu),
   playlists (indices dans rbPl)]. Seules ces infos sont lues dans le XML, et elles restent dans le navigateur
   (coach-collection ne suit pas le compte). Chaque morceau a une clé (rbCles) tirée de son titre et de son artiste : les
   favoris, les missions et les adresses (#musique/morceau/<clé>) s'en servent, et elle ne change pas quand on réimporte sa
   collection. Une clé est une empreinte, pas le titre : coach-missions, qui suit le compte, n'envoie aucun titre.
   Adresses : #musique (Mes morceaux), #musique/favoris, #musique/recents, #musique/morceau/<clé> (« Ce qui va avec »),
   #musique/paire/<clé A>/<clé B> (préparer la transition). L'ancienne adresse #vrai mène à #musique. */
const RB_KEY = 'coach-collection', RB_MIS = 'coach-missions', MM_KEY = 'coach-musique', RB_MAX = 6000, RB_PL_MAX = 300, MM_VUS = 30, MM_PAGE = 100,
  RB_PC = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
// Sans abonnement : l'import et la fiche d'un morceau sont offerts, le reste demande Pro (lot 72, choix de l'utilisateur le
// 16 nov. 2026 : « Oui, on l'offre » ; écrit aussi dans cgv.html et presentation.html). Faux : toute la page est dans Pro,
// comme au lot 68. La collection d'exemple se regarde en entier sans rien consommer : la fiche offerte attend la vraie collection.
let mmOfferte = true;

/* ---------- Le HTML de la page ----------
   Les titres, artistes, genres et noms de playlists viennent d'un fichier de l'utilisateur. Tout le HTML de ce fichier est
   fabriqué par le gabarit mmH`…${valeur}…`, qui échappe TOUTE valeur insérée, sauf un morceau déjà fabriqué par mmH ou un
   dessin de ce fichier marqué mmBrut. Oublier d'échapper n'est donc pas possible : au pire, un morceau de HTML s'afficherait
   comme du texte. Le HTML n'entre dans la page que par mmMet. Les textes français reçoivent leurs espaces insécables (mmFr). */
class MmHtml { constructor(s){ this.s = s; } toString(){ return this.s; } }
const mmBrut = s => new MmHtml(String(s));
const mmEsc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', '\'': '&#39;' }[c]));
const mmFr = s => String(s).replace(/ ([:;?!»])/g, ' $1').replace(/« /g, '« ');
// rien (null, undefined) donne une chaîne vide ; vrai et faux s'écrivent « true » et « false » (aria-pressed, gardien du lot 72)
const mmVal = v => v instanceof MmHtml ? v.s : Array.isArray(v) ? v.map(mmVal).join('') : v == null ? '' : mmEsc(v);
const mmH = (parts, ...vals) => new MmHtml(parts.reduce((o, p, i) => o + mmFr(p) + (i < vals.length ? mmVal(vals[i]) : ''), ''));
const mmMet = (el, h) => { el.innerHTML = mmVal(h); };
const mmG = s => `« ${s} »`;                    // un titre entre guillemets, dans une phrase (échappée ensuite)
const mmDit = (t, h) => viniDit('real', mmFr(t), h);

function rbKey(s){
  if (!s) return '';
  s = String(s).trim().replace('♯', '#').replace('♭', 'b');
  let m = s.match(/^0?(\d{1,2})\s*([AB])$/i);
  if (m){ const n = +m[1]; return n >= 1 && n <= 12 ? n + m[2].toUpperCase() : ''; }
  m = s.match(/^([A-Ga-g])([#b]?)\s*(m|min|minor|maj|major)?$/);
  if (!m) return '';
  const pc = (((RB_PC[m[1].toUpperCase()] + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0)) % 12) + 12) % 12, f = (pc * 7) % 12;
  return m[3] && /^m(in(or)?)?$/.test(m[3]) ? ((f + 4) % 12 + 1) + 'A' : ((f + 7) % 12 + 1) + 'B';
}
function rbRel(a, b){
  const na = parseInt(a, 10), nb = parseInt(b, 10), la = a.slice(-1), lb = b.slice(-1), d = (((nb - na) % 12) + 12) % 12;
  if (na === nb && la === lb) return 'same'; if (la === lb && (d === 1 || d === 11)) return 'adj'; if (na === nb) return 'rel'; if (la === lb && (d === 2 || d === 10)) return 'boost'; return 'clash';
}
const rbBpm = v => (Math.round(v * 10) / 10).toString().replace('.', ',');
const rbClean = t => Array.isArray(t) && typeof t[0] === 'string' && t[0].trim() ? [t[0].trim().slice(0, 120), String(t[1] || '').trim().slice(0, 80), String(t[2] || '').trim().slice(0, 40),
  +t[3] > 40 && +t[3] < 250 ? Math.round(+t[3] * 10) / 10 : 0, /^(1[0-2]|[1-9])[AB]$/.test(t[4]) ? t[4] : '',
  typeof t[5] === 'string' && /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/.test(t[5]) ? t[5] : '', Number.isInteger(t[6]) && t[6] >= 0 ? Math.min(t[6], 99999) : -1,
  Array.isArray(t[7]) ? [...new Set(t[7].filter(n => Number.isInteger(n) && n >= 0 && n < RB_PL_MAX))].slice(0, 50) : []] : null;
// La clé d'un morceau : une empreinte (FNV-1a) de son titre et de son artiste, sans accents ni majuscules
const mmNorm = s => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, ' ').trim();
function mmEmpreinte(s){ let h = 0x811c9dc5; for (let i = 0; i < s.length; i++){ h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; } return h.toString(36); }
const mmCleOk = k => typeof k === 'string' && /^m[0-9a-z]{1,8}(-\d{1,4})?$/.test(k);
const mmPaireOk = k => { if (typeof k !== 'string') return false; const p = k.split('>'); return p.length === 2 && p.every(mmCleOk) && p[0] !== p[1]; };
let rbLib = [], rbName = '', rbPl = [], rbAncien = false, rbExemple = false, rbCles = [], rbParCle = new Map(), rbMis = { v: 2, total: 0, paires: {}, ok: [] };
// Deux morceaux différents qui tombent sur la même empreinte (rare) : le second prend un numéro, toujours le même
function rbIndexe(){
  rbCles = []; rbParCle = new Map(); mmPdjCache = null;
  rbLib.forEach((t, i) => { const base = 'm' + mmEmpreinte(mmNorm(t[0]) + '|' + mmNorm(t[1])); let k = base;
    if (rbParCle.has(k)){ const u = rbLib[rbParCle.get(k)]; if (mmNorm(u[0]) !== mmNorm(t[0]) || mmNorm(u[1]) !== mmNorm(t[1])){ let n = 2; while (rbParCle.has(base + '-' + n)) n++; k = base + '-' + n; } }
    rbCles.push(k); if (!rbParCle.has(k)) rbParCle.set(k, i); });
}
let mmPdjCache = null;
try { const d = JSON.parse(localStorage.getItem(RB_KEY) || 'null');
  if (d && typeof d === 'object' && Array.isArray(d.t)){
    rbPl = Array.isArray(d.p) ? d.p.filter(x => typeof x === 'string' && x.trim()).slice(0, RB_PL_MAX).map(x => x.trim().slice(0, 60)) : [];
    rbLib = d.t.slice(0, RB_MAX).map(rbClean).filter(Boolean); for (const t of rbLib) t[7] = t[7].filter(n => n < rbPl.length);
    rbName = typeof d.n === 'string' ? d.n.slice(0, 80) : ''; rbAncien = d.v !== 2 && rbLib.length > 0; rbExemple = d.ex === true; } } catch (e) {}
rbIndexe();
// Les missions : combien sont faites pour chaque paire (« clé A>clé B »), les paires déjà validées (ok, pour ne compter chaque
// paire qu'une fois) et leur nombre (total : badge « Pour de vrai », étape du parcours).
// Avant le lot 72, une seule paire, rangée par numéros de morceaux ({ pair: 'i|j', done: {...} }) : elle est reprise.
const MM_ANCIENNES = ['prep', 'outro', 'moment', 'fader', 'swap', 'full'];
try { const d = JSON.parse(localStorage.getItem(RB_MIS) || 'null');
  if (d && typeof d === 'object' && !Array.isArray(d)){
    rbMis.total = Math.max(0, Math.floor(+d.total) || 0);
    if (d.paires && typeof d.paires === 'object' && !Array.isArray(d.paires)){
      for (const [k, n] of Object.entries(d.paires)) if (mmPaireOk(k)) rbMis.paires[k] = Math.max(0, Math.min(6, Math.floor(+n) || 0));
      rbMis.ok = Array.isArray(d.ok) ? [...new Set(d.ok.filter(mmPaireOk))].slice(-300) : []; }
    else if (typeof d.pair === 'string' && d.done && typeof d.done === 'object'){ const m = d.pair.match(/^(\d+)\|(\d+)$/), n = MM_ANCIENNES.filter(id => d.done[id]).length;
      if (m && n && rbCles[+m[1]] && rbCles[+m[2]] && rbCles[+m[1]] !== rbCles[+m[2]]){ const k = rbCles[+m[1]] + '>' + rbCles[+m[2]]; rbMis.paires[k] = n; if (d.done.ok) rbMis.ok.push(k); } } } } catch (e) {}
function rbSaveMis(){
  const k = Object.keys(rbMis.paires); if (k.length > 300) for (const x of k.slice(0, k.length - 300)) delete rbMis.paires[x];
  if (rbMis.ok.length > 300) rbMis.ok = rbMis.ok.slice(-300);
  try { localStorage.setItem(RB_MIS, JSON.stringify(rbMis)); } catch (e) {}
}
// Favoris (morceaux et paires), vus récemment, fiche offerte : sur cet ordinateur seulement, comme la collection (CPT_LOCAL)
let mmData = { fav: [], favP: [], vus: [], offerte: '' };
try { const d = JSON.parse(localStorage.getItem(MM_KEY) || 'null');
  if (d && typeof d === 'object' && !Array.isArray(d)){
    mmData.fav = Array.isArray(d.fav) ? [...new Set(d.fav.filter(mmCleOk))].slice(-500) : [];
    mmData.favP = Array.isArray(d.favP) ? [...new Set(d.favP.filter(mmPaireOk))].slice(-500) : [];
    mmData.vus = Array.isArray(d.vus) ? d.vus.filter(v => v && typeof v === 'object' && Number.isFinite(+v.q) && (v.t === 'm' ? mmCleOk(v.a) : v.t === 'p' && mmPaireOk(v.a + '>' + v.b)))
      .slice(0, MM_VUS).map(v => v.t === 'm' ? { t: 'm', a: v.a, q: +v.q } : { t: 'p', a: v.a, b: v.b, q: +v.q }) : [];
    mmData.offerte = mmCleOk(d.offerte) ? d.offerte : ''; } } catch (e) {}
const mmSauve = () => { try { localStorage.setItem(MM_KEY, JSON.stringify(mmData)); } catch (e) {} };
function rbParse(text){
  const doc = new DOMParser().parseFromString(text, 'application/xml');
  if (doc.querySelector('parsererror')) throw new Error('xml');
  const coll = doc.querySelector('COLLECTION'); if (!coll) throw new Error('collection');
  const out = [], parId = new Map(), parLieu = new Map(), playlists = [];
  for (const el of coll.querySelectorAll(':scope > TRACK')){ const tempo = el.querySelector('TEMPO'), lect = parseInt(el.getAttribute('PlayCount'), 10);
    const t = rbClean([el.getAttribute('Name') || '', el.getAttribute('Artist') || '', el.getAttribute('Genre') || '', parseFloat(el.getAttribute('AverageBpm')) || parseFloat(tempo && tempo.getAttribute('Bpm')) || 0,
      rbKey(el.getAttribute('Tonality')), (el.getAttribute('DateAdded') || '').slice(0, 10), Number.isInteger(lect) ? lect : -1, []]);
    if (!t) continue;
    if (out.length < RB_MAX){ const id = el.getAttribute('TrackID'), lieu = el.getAttribute('Location'); if (id) parId.set(id, t); if (lieu) parLieu.set(lieu, t); }
    out.push(t); }
  // Les playlists (dossiers aplatis) : un morceau sait dans lesquelles il est. KeyType 0 = numéro du morceau, 1 = emplacement du fichier
  for (const n of doc.querySelectorAll('PLAYLISTS NODE[Type="1"]')){
    if (playlists.length >= RB_PL_MAX) break;
    const nom = (n.getAttribute('Name') || '').trim().slice(0, 60), parCle = n.getAttribute('KeyType') === '1' ? parLieu : parId; if (!nom) continue;
    const membres = [...n.querySelectorAll(':scope > TRACK')].map(x => parCle.get(x.getAttribute('Key'))).filter(Boolean); if (!membres.length) continue;
    let ip = playlists.indexOf(nom); if (ip < 0){ ip = playlists.length; playlists.push(nom); }
    for (const t of membres) if (!t[7].includes(ip) && t[7].length < 50) t[7].push(ip); }
  return { morceaux: out, playlists };
}
// La collection d'exemple (titres et artistes inventés) : ajoutée il y a N jours, N lectures, playlists
const RB_DEMO_PL = ['Soirée samedi', 'Warm-up', 'Afro sunset', 'Coups de cœur', 'Nouveautés'];
const RB_DEMO = [
  ['Après minuit', 'Lune Basse', 'Afro House', 122, '8A', 4, 4, [0, 3]], ['Néon rose', 'Kalia Moon', 'Afro House', 122, '9A', 13, 0, [4]],
  ['Terre rouge', 'Moussa K.', 'Afro House', 121, '7A', 19, 7, [0, 2]], ['Soleil noir', 'Moussa K.', 'Afro House', 122, '8A', 106, 12, [2, 3]],
  ['Tambours', 'Kora Club', 'Afro House', 123, '10A', 2, 0, [0, 4]], ['Sable chaud', 'Ilé Ayo', 'Afro House', 120, '4A', 63, 3, [2]],
  ['Grand soleil', 'Sahel Drive', 'Afro House', 124, '5A', 120, 2, [2]], ['Savane', 'Kora Club', 'Afro House', 121, '4A', 6, 1, [2, 4]],
  ['Cuivres', 'Sahel Drive', 'Afro House', 123, '11A', 40, 4, [0, 2]], ['Les quais', 'Paloma Vee', 'Deep House', 122, '8B', 45, 5, [1]],
  ['Matin clair', 'Lune Basse', 'Deep House', 118, '8A', 148, 9, [1, 3]], ['Verre fumé', 'Noé Marlo', 'Deep House', 123, '9B', 28, 1, [1]],
  ['Lumière noire', 'Paloma Vee', 'Deep House', 121, '6A', 93, 2, [1]], ['Fil rouge', 'Noé Marlo', 'Deep House', 122, '7B', 1, 0, [4]],
  ['Piscine vide', 'Saint-Ange', 'Tech House', 126, '9A', 47, 6, [0]], ['Fièvre', 'Kalia Moon', 'Tech House', 127, '9A', 36, 3, [0]],
  ['Dernier métro', 'Saint-Ange', 'Tech House', 125, '7A', 79, 4, [0]], ['Grand bleu', 'Oslo Nuit', 'Melodic House & Techno', 124, '8A', 8, 2, [3, 4]],
  ['Marée haute', 'Oslo Nuit', 'Melodic House & Techno', 123, '9A', 23, 0, [4]], ['Tunnel', 'Acier Doux', 'Melodic House & Techno', 125, '5A', 132, 3, [0]],
  ['Velours', 'Mira Sol', 'House & Nu Disco', 122, '3A', 189, 8, [1]], ['Vieux vinyle', 'Les Jumeaux Disco', 'House & Nu Disco', 118, '11B', 227, 10, [1, 3]],
  ['Boule à facettes', 'Les Jumeaux Disco', 'House & Nu Disco', 120, '12B', 72, 2, [1]], ['Bain de minuit', 'Mira Sol', 'House & Nu Disco', 124, '2A', 167, 5, [3]]
];
const mmIlYa = j => dayKey(new Date(Date.now() - j * 864e5));
const rbDemo = () => ({ morceaux: RB_DEMO.map(([ti, ar, st, bpm, k, j, l, p]) => rbClean([ti, ar, st, bpm, k, mmIlYa(j), l, p])), playlists: RB_DEMO_PL.slice() });
function rbScore(a, b, rel){
  const ad = Math.abs(b[3] / a[3] - 1) * 100, st = ad <= 1 ? 1 : ad <= 3 ? .8 : .45, sk = { same: 1, adj: .9, rel: .8, boost: .45, clash: .05 }[rel];
  const ga = a[2].toLowerCase(), gb = b[2].toLowerCase(), sg = ga && gb ? (ga === gb || ga.includes(gb) || gb.includes(ga) ? 1 : .3) : .5;
  return Math.round((.45 * st + .4 * sk + .15 * sg) * 100);
}

/* ---------- Ce qui va avec : la note, l'ambiance, la difficulté et la technique d'une transition A → B ---------- */
// exo : [chapitre, numéro du niveau dans le chapitre (0 = le premier)] ; tuto : identifiant de js/tutos.js
const MM_TECH = {
  swap: { nom: 'Le swap des basses', exo: [1, 5], tuto: 'swap', dit: 'Fais un swap des basses !' },
  calage: { nom: 'Caler, puis swap des basses', exo: [5, 2], tuto: 'swap', dit: 'Cale-les, puis échange les basses !' },
  filtre: { nom: 'Le filtre qui ouvre', exo: [1, 4], tuto: 'filtre', dit: 'Fais monter l’énergie avec le filtre !' },
  echo: { nom: 'L’écho out', exo: [1, 3], tuto: 'echo', dit: 'Fais un écho out !' }
};
// force : décrit quand même une transition déconseillée (une adresse peut mener à n'importe quelle paire)
function mmCompat(a, b, force){
  if (!a[3] || !a[4] || !b[3] || !b[4]) return null;
  const rel = rbRel(a[4], b[4]), ad = Math.abs(b[3] / a[3] - 1) * 100;
  if (!force && (rel === 'clash' || ad > 6 || mmNorm(a[0]) === mmNorm(b[0]))) return null;
  const note = rbScore(a, b, rel); if (!force && note < 60) return null;
  const d = (((parseInt(b[4], 10) - parseInt(a[4], 10)) % 12) + 12) % 12, meme = a[4].slice(-1) === b[4].slice(-1), db = b[3] - a[3];
  const ga = a[2].toLowerCase(), gb = b[2].toLowerCase(), loin = rel === 'clash' || ad > 3;
  return { note, rel, ad,
    amb: db >= .5 || (Math.abs(db) < .5 && meme && (d === 1 || d === 2)) ? 'monter' : db <= -.5 || (Math.abs(db) < .5 && meme && (d === 10 || d === 11)) ? 'calmer' : 'garder',
    diff: loin ? 3 : ad <= 1 && rel !== 'boost' ? 1 : 2,
    tech: loin ? 'echo' : meme && d === 2 ? 'filtre' : ad > 1 ? 'calage' : 'swap',
    tempo: ad <= .5 ? 'même tempo' : ad <= 3 ? 'tempos proches' : 'tempos éloignés', tempoOk: ad <= 3,
    cle: { same: 'même tonalité', adj: 'tonalités voisines', rel: 'tonalités cousines', boost: d === 2 ? 'montée d’énergie' : 'descente d’énergie', clash: 'tonalités qui frottent' }[rel],
    cleIc: rel === 'clash' ? 'alerte' : rel === 'boost' ? (d === 2 ? 'haut' : 'bas') : 'coche',
    style: !!(ga && gb && (ga === gb || ga.includes(gb) || gb.includes(ga))), styleConnu: !!(ga && gb) };
}
function mmPartenaires(i){
  const a = rbLib[i], L = [];
  rbLib.forEach((b, j) => { if (j === i || rbCles[j] === rbCles[i]) return; const c = mmCompat(a, b); if (c){ c.j = j; L.push(c); } });
  return L.sort((x, y) => y.note - x.note || x.ad - y.ad || rbLib[x.j][0].localeCompare(rbLib[y.j][0], 'fr'));
}
// La paire du jour : un morceau tiré de la date, et celui qui va le mieux après lui (si possible une note d'au moins 85).
// Quelques millièmes de seconde, même sur 6000 morceaux ; gardée pour la journée.
function mmPdj(){
  const jour = dayKey(); if (mmPdjCache && mmPdjCache.jour === jour) return mmPdjCache.paire;
  const idx = rbLib.map((_, i) => i).filter(i => rbLib[i][3] && rbLib[i][4]); let h = 7, meilleur = null;
  for (const ch of jour) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  for (let n = 0; n < Math.min(40, idx.length); n++){
    const i = idx[(h + n * 7919) % idx.length], p = mmPartenaires(i)[0];
    if (p && (!meilleur || p.note > meilleur[2])) meilleur = [i, p.j, p.note];
    if (meilleur && meilleur[2] >= 85) break; }
  mmPdjCache = { jour, paire: meilleur }; return meilleur;
}
const MM_NIVEAU = n => n >= 90 ? 'Parfait' : n >= 80 ? 'Très bien' : n >= 70 ? 'Bien' : 'Possible';
const MM_DIFF = ['', 'Facile', 'Moyen', 'Difficile'];
function mmPourquoi(a, b, c){
  const A = mmG(a[0]), B = mmG(b[0]);
  const fin = {
    swap: `tu peux mélanger longtemps. Coupe les basses de ${B}, lance-le sur le 1 d’une phrase, puis échange les basses d’un seul geste.`,
    calage: `cale ${B} sur le tempo de ${A} avant de mélanger, puis échange les basses.`,
    filtre: `${B} fait monter l’énergie. Fais-le entrer filtre fermé, et ouvre-le pendant une phrase.`,
    echo: `trop loin pour un long mélange. Fais partir ${A} dans l’écho, et lance ${B} sur le 1 de la phrase.`
  }[c.tech];
  return mmFr(`${c.tempo.charAt(0).toUpperCase() + c.tempo.slice(1)} (${rbBpm(a[3])} et ${rbBpm(b[3])} BPM), ${c.cle} (${a[4]} et ${b[4]}) : ${fin}`);
}
// Les missions dans rekordbox (celles d'avant le lot 72), dont la cinquième suit la technique conseillée
function mmMissions(a, b, tech){
  const meme = Math.abs(b[3] / a[3] - 1) * 100 <= .5, A = mmG(a[0]), B = mmG(b[0]);
  const geste = {
    swap: ['Le swap des basses', `Avant de lancer ${B}, coupe son LOW. Au début d’une phrase, coupe le LOW de ${A} (tout à gauche) et remets celui de ${B} à normal (à midi), dans le même geste.`],
    calage: ['Le swap des basses', `Une fois ${B} calé, coupe son LOW avant de le lancer. Au début d’une phrase, échange les LOW des deux morceaux, dans le même geste.`],
    filtre: ['Le filtre qui ouvre', `Lance ${B} filtre fermé (tout à gauche) et monte son fader. Ouvre le filtre pendant une phrase : il doit être grand ouvert pile au début de la suivante.`],
    echo: ['L’écho out', `Allume l’écho sur ${A}. À la fin d’une phrase, baisse son fader d’un coup, et lance ${B} sur le 1 de la phrase suivante.`]
  }[tech];
  return [
    ['Prépare tes deux morceaux', `Dans rekordbox, charge ${A} sur la platine 1 et ${B} sur la platine 2. ` + (meme ? `Ils sont au même tempo (${rbBpm(a[3])} BPM).`
      : tech === 'calage' ? `Le premier est à ${rbBpm(a[3])} BPM, le second à ${rbBpm(b[3])} : cale la platine 2 avec son curseur de tempo, comme au chapitre 5 (ou appuie sur BEAT SYNC).`
      : `Le premier est à ${rbBpm(a[3])} BPM, le second à ${rbBpm(b[3])} : appuie sur BEAT SYNC de la platine 2 pour qu’il se cale sur le premier.`)],
    ['Repère la fin du premier morceau', `Écoute ${A} en comptant les phrases de 32 temps. Vers la fin, trouve le moment où le morceau se vide : c’est son outro. Pose un repère dessus avec un pad HOT CUE.`],
    ['Le bon moment', `Fader de la platine 2 en bas. Relance ${A} un peu avant ton repère, et appuie sur PLAY de la platine 2 pile sur le premier temps de l’outro. Écoute au casque (bouton CUE du canal 2) : les deux grosses caisses doivent tomber ensemble.`],
    ['Le fader', `Refais la même chose, puis monte le fader de ${B} sur une phrase, et baisse celui de ${A} sur la phrase suivante.`],
    geste,
    ['La transition complète', 'Tout d’affilée, sans t’arrêter, du début à la fin. Recommence jusqu’à ce que ça sonne propre trois fois de suite.']
  ].map(([t, x]) => [t, mmFr(x)]);
}

/* ---------- Petits dessins ---------- */
const mmT = d => mmBrut(`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`);
const MM_COEUR = 'M12 20s-7.2-4.5-9.1-9.3C1.5 7.2 3.7 4 7.1 4c2 0 3.7 1.1 4.9 2.9C13.2 5.1 14.9 4 16.9 4c3.4 0 5.6 3.2 4.2 6.7C19.2 15.5 12 20 12 20z';
const MM_IC = {
  coeur: mmT(`<path d="${MM_COEUR}"/>`),
  coeurPlein: mmBrut(`<svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linejoin="round" aria-hidden="true"><path d="${MM_COEUR}"/></svg>`),
  coche: mmT('<path d="M5 12.5l4.5 4.5L19 7.5"/>'), croix: mmT('<path d="M6 6l12 12M18 6 6 18"/>'), tiret: mmT('<path d="M7 12h10"/>'),
  alerte: mmT('<path d="M12 4 2.5 20h19z"/><path d="M12 10v4M12 17h.01"/>'), haut: mmT('<path d="M7 17 17 7M9 7h8v8"/>'), bas: mmT('<path d="M7 7l10 10M17 9v8H9"/>'),
  fleche: mmT('<path d="M5 12h14M13 6l6 6-6 6"/>'), cadenas: mmT('<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>'),
  casque: mmT('<path d="M4 15v-3a8 8 0 0 1 16 0v3"/><rect x="3" y="14" width="4.5" height="6.5" rx="1.5"/><rect x="16.5" y="14" width="4.5" height="6.5" rx="1.5"/>'),
  table: mmT('<rect x="2" y="7" width="20" height="11" rx="3"/><circle cx="7.5" cy="12.5" r="2.5"/><circle cx="16.5" cy="12.5" r="2.5"/>'),
  tuto: mmT('<rect x="3" y="4.5" width="18" height="15" rx="3"/><path d="m10 9 5 3-5 3z"/>')
};
// Les images des techniques : celles des tutos de Vini (TU_VIGNETTES de js/tutos.js) ; « calage » est nouvelle
const MM_VG = {
  swap: mmBrut('<path d="M4 44c10-22 20 10 30-6s20 18 30-4 20 12 32-2"/><path d="M4 30h92" opacity=".25"/>'),
  echo: mmBrut('<path d="M10 10v40M30 16v28M48 22v16M64 26v8M78 28v4"/>'),
  filtre: mmBrut('<path d="M4 50C30 50 40 10 60 10s30 0 36 0"/>'),
  calage: mmBrut('<path d="M10 6v20M30 6v20M50 6v20M70 6v20M90 6v20"/><path d="M17 34v20M37 34v20M57 34v20M77 34v20M97 34v20" opacity=".5"/>')
};
const mmVg = (tech, cls = '') => mmH`<span class="mm-vg ${cls}" aria-hidden="true"><svg viewBox="0 0 100 60">${MM_VG[tech]}</svg></span>`;
const mmDisque = (p = '', t = '') => mmH`<span class="mm-disque ${p} ${t}" aria-hidden="true"></span>`;
const mmDiff = d => mmH`<span class="mm-diff d${d}"><i></i><i></i><i></i>${MM_DIFF[d]}</span>`;
function mmAnneau(n, petit){
  const r = 22, C = 2 * Math.PI * r;
  return mmH`<span class="mm-note${petit ? ' petit' : ''}"><span class="mm-note-r"><svg viewBox="0 0 52 52" aria-hidden="true"><circle cx="26" cy="26" r="${r}" class="mm-note-f"/><circle cx="26" cy="26" r="${r}" class="mm-note-v" stroke-dasharray="${C.toFixed(1)}" stroke-dashoffset="${(C * (1 - n / 100)).toFixed(1)}" transform="rotate(-90 26 26)"/></svg><b>${n}</b></span><small>${MM_NIVEAU(n)}</small></span>`;
}
const MM_MOIS = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];
function mmJours(iso){ if (!iso) return null; const [y, m, d] = iso.split('-').map(Number), auj = new Date(); auj.setHours(0, 0, 0, 0); return Math.round((auj - new Date(y, m - 1, d)) / 864e5); }
function mmQuand(iso){
  const j = mmJours(iso), [y, m, d] = (iso || '').split('-').map(Number); if (j == null || !Number.isFinite(j) || !MM_MOIS[m - 1]) return '';
  return j <= 0 ? 'aujourd’hui' : j === 1 ? 'hier' : j < 7 ? `il y a ${j} jours` : `${d} ${MM_MOIS[m - 1]}${y !== new Date().getFullYear() ? ' ' + y : ''}`;
}
function mmDepuis(ms){
  const s = (Date.now() - ms) / 1000; if (s < 60) return 'à l’instant'; if (s < 3600) return `il y a ${Math.floor(s / 60)} min`; if (s < 86400) return `il y a ${Math.floor(s / 3600)} h`;
  const j = Math.floor(s / 86400); return j === 1 ? 'hier' : j < 7 ? `il y a ${j} jours` : new Date(ms).toLocaleDateString(LOCALE, { day: 'numeric', month: 'short' });
}

/* ---------- Où on est dans la page ---------- */
const mmFiltresNeufs = () => ({ q: '', style: '', tmin: 0, tmax: 0, cle: '', pl: '', recents: false, jamais: false, fav: false, tri: '', panneau: false, limite: MM_PAGE });
let mm = { ecran: 'morceaux' }, mmF = mmFiltresNeufs(), mmFi = { cle: '', amb: '', style: false, tempo: false, plus: false }, mmPv = { k: '', i: 0, toutes: false };
const mmPro = () => !proBloque();                     // abonné (ou Pro éteint) : tout est ouvert
const mmToutPro = () => proBloque() && !mmOfferte;    // sans abonnement, et rien d'offert : une carte Pro à la place de la page
// Sans abonnement, une fiche se regarde si c'est la collection d'exemple, si la fiche offerte n'a pas servi, ou si c'est elle
const mmFicheLibre = k => mmPro() || rbExemple || !mmData.offerte || mmData.offerte === k;
const mmVa = h => { location.hash = '#musique' + (h ? '/' + h : ''); };
const mmIdx = k => rbParCle.has(k) ? rbParCle.get(k) : -1;
// Appelé par setView (demarrage.js) avec ce qui suit #musique/ dans l'adresse, avant de dessiner la page
function mmRoute(p){
  const [e, x, y] = p;
  if (e === 'morceau' && rbParCle.has(x)){ mm = { ecran: 'fiche', a: x }; if (mmFi.cle !== x) mmFi = { cle: x, amb: '', style: false, tempo: false, plus: false }; }
  else if (e === 'paire' && rbParCle.has(x) && rbParCle.has(y) && x !== y){ mm = { ecran: 'paire', a: x, b: y }; const k = x + '>' + y; if (mmPv.k !== k) mmPv = { k, i: Math.min(rbMis.paires[k] || 0, 5), toutes: false }; }
  else if (e === 'favoris' || e === 'recents') mm = { ecran: e };
  else mm = { ecran: 'morceaux' };
}
function mmVu(v){
  mmData.vus = [Object.assign({}, v, { q: Date.now() }), ...mmData.vus.filter(x => !(x.t === v.t && x.a === v.a && x.b === v.b))].slice(0, MM_VUS); mmSauve();
}
function rbSet(list, name, playlists = [], exemple = false){
  rbLib = list.slice(0, RB_MAX); rbName = name || ''; rbPl = playlists.slice(0, RB_PL_MAX); rbAncien = false; rbExemple = !!exemple && rbLib.length > 0; rbIndexe();
  mmF = mmFiltresNeufs(); mm = { ecran: 'morceaux' }; $('rbMsg').textContent = '';
  try { if (rbLib.length) localStorage.setItem(RB_KEY, JSON.stringify(Object.assign({ v: 2, n: rbName, t: rbLib, p: rbPl }, rbExemple ? { ex: true } : {}))); else localStorage.removeItem(RB_KEY); }
  catch (e) { $('rbMsg').textContent = mmFr('Ta collection est trop grande pour être gardée en mémoire : il faudra la réimporter à ta prochaine visite.'); }
  if (location.hash.slice(1).includes('/')) mmVa(''); renderReal();
}

/* ---------- Mes morceaux : recherche, styles, filtres, tri ---------- */
const mmBornes = () => { const b = rbLib.map(t => t[3]).filter(Boolean); return b.length ? [Math.floor(Math.min(...b)), Math.ceil(Math.max(...b))] : [0, 0]; };
const mmADates = () => rbLib.some(t => t[5]), mmALectures = () => rbLib.some(t => t[6] >= 0);
function mmStyles(){
  const n = new Map(); for (const t of rbLib) if (t[2]) n.set(t[2], (n.get(t[2]) || 0) + 1);
  return [...n.entries()].sort((x, y) => y[1] - x[1] || x[0].localeCompare(y[0], 'fr'));
}
function mmNbFiltres(){
  const [b0, b1] = mmBornes();
  return (mmF.style ? 1 : 0) + ((mmF.tmin && mmF.tmin > b0) || (mmF.tmax && mmF.tmax < b1) ? 1 : 0) + (mmF.cle ? 1 : 0) + (mmF.pl !== '' ? 1 : 0) + (mmF.recents ? 1 : 0) + (mmF.jamais ? 1 : 0) + (mmF.fav ? 1 : 0);
}
function mmTri(){ return mmF.tri || (mmADates() ? 'ajout' : 'titre'); }
function mmFiltrer(){
  const q = mmNorm(mmF.q), fav = new Set(mmData.fav), L = [];
  rbLib.forEach((t, i) => {
    if (q && !mmNorm(t[0] + ' ' + t[1]).includes(q)) return;
    if (mmF.style && t[2] !== mmF.style) return;
    if (mmF.tmin && !(t[3] >= mmF.tmin)) return; if (mmF.tmax && !(t[3] && t[3] <= mmF.tmax)) return;
    if (mmF.cle && t[4] !== mmF.cle) return; if (mmF.pl !== '' && !t[7].includes(+mmF.pl)) return;
    if (mmF.recents){ const j = mmJours(t[5]); if (j == null || j > 30) return; }
    if (mmF.jamais && t[6] !== 0) return; if (mmF.fav && !fav.has(rbCles[i])) return;
    L.push(i); });
  const T = rbLib, tri = mmTri(), parTitre = (x, y) => T[x][0].localeCompare(T[y][0], 'fr');
  const ordre = { ajout: (x, y) => (T[y][5] || '').localeCompare(T[x][5] || '') || parTitre(x, y), titre: parTitre,
    bpm: (x, y) => (T[x][3] || 999) - (T[y][3] || 999) || parTitre(x, y),
    cle: (x, y) => (parseInt(T[x][4], 10) || 99) - (parseInt(T[y][4], 10) || 99) || T[x][4].localeCompare(T[y][4]) || parTitre(x, y),
    lect: (x, y) => T[y][6] - T[x][6] || parTitre(x, y) }[tri] || parTitre;
  return L.sort(ordre);
}
function mmLigne(i){
  const t = rbLib[i], k = rbCles[i], fav = mmData.fav.includes(k), libre = mmFicheLibre(k);
  const action = !libre ? mmH`<span class="mm-l-pro">${MM_IC.cadenas}Pro</span>` : !mmPro() && !rbExemple && mmData.offerte === k ? mmH`<span class="mm-l-va">Ta fiche offerte ›</span>` : mmH`<span class="mm-l-va">Ce qui va avec ›</span>`;
  return mmH`<div class="mm-ligne" role="listitem"><button type="button" class="mm-coeur${fav ? ' on' : ''}" data-mm="coeur" data-k="${k}" aria-pressed="${fav}" aria-label="${fav ? 'Retirer de tes favoris' : 'Ajouter à tes favoris'} : ${t[0]}">${fav ? MM_IC.coeurPlein : MM_IC.coeur}</button><button type="button" class="mm-ouvre" data-mm="fiche" data-k="${k}">${mmDisque('', 'mini')}<span class="mm-l-t"><b>${t[0]}</b><small>${t[1] || 'Artiste inconnu'}${t[6] === 0 ? mmH` · <em>jamais joué</em>` : ''}</small></span><span class="mm-l-s">${t[2] || '—'}</span><span class="mm-l-b">${t[3] ? rbBpm(t[3]) : '—'}</span><span class="mm-l-k">${t[4] ? mmH`<i class="mm-cle">${t[4]}</i>` : '—'}</span><span class="mm-l-d">${mmQuand(t[5]) || '—'}</span><span class="mm-l-a">${action}</span></button></div>`;
}
const MM_TETE = mmH`<div class="mm-l-tete" aria-hidden="true"><span></span><span>Titre</span><span>Style</span><span>Tempo</span><span>Tonalité</span><span>Ajouté</span><span></span></div>`;
function mmMajListe(){
  const L = mmFiltrer(), n = L.length, reste = n - mmF.limite;
  mmMet($('mmListe'), n ? mmH`${MM_TETE}${L.slice(0, mmF.limite).map(mmLigne)}` : mmH`<p class="mm-vide">Aucun morceau ne correspond. <button type="button" class="linkbtn" data-mm="effacer">Effacer les filtres</button></p>`);
  $('mmPlus').hidden = reste <= 0; if (reste > 0) $('mmPlus').textContent = `Afficher ${plur(Math.min(MM_PAGE, reste), 'morceau', 'morceaux')} de plus (${plur(reste, 'restant', 'restants')})`;
  const c = $('mmCompte'); if (c) c.textContent = plur(n, 'morceau', 'morceaux');
  const nf = mmNbFiltres() - (mmF.style ? 1 : 0); $('mmFiltresN').hidden = !nf; $('mmFiltresN').textContent = nf;
  mmMet($('mmActifs'), mmActifs());
  const v = $('mmTempoV'); if (v) v.textContent = mmTempoTxt();
  const r = document.querySelector('#mmPanneau .mm-rail i'); if (r) r.setAttribute('style', mmRail());
  mmCurseurs();
  return n;
}
const mmTempoTxt = () => { const [b0, b1] = mmBornes(); return `De ${rbBpm(mmF.tmin || b0)} à ${rbBpm(mmF.tmax || b1)} BPM`; };
const mmRail = () => { const [b0, b1] = mmBornes(), w = Math.max(1, b1 - b0); return `left:${(((mmF.tmin || b0) - b0) / w * 100).toFixed(1)}%;right:${((b1 - (mmF.tmax || b1)) / w * 100).toFixed(1)}%`; };
// Les deux curseurs du tempo sont l'un sur l'autre : celui du bas passe devant quand il est dans la moitié droite, sinon on ne
// pourrait plus les séparer une fois poussés tout à droite (gardien du lot 72)
function mmCurseurs(){
  const m = document.querySelector('#mmPanneau input[data-f="tmin"]'); if (!m) return;
  const [b0, b1] = mmBornes(); m.style.zIndex = (mmF.tmin || b0) > (b0 + b1) / 2 ? '2' : '';
}
function mmActifs(){
  const [b0, b1] = mmBornes(), A = [];
  if ((mmF.tmin && mmF.tmin > b0) || (mmF.tmax && mmF.tmax < b1)) A.push(['tempo', mmTempoTxt().replace(/^De /, '')]);
  if (mmF.cle) A.push(['cle', 'Tonalité ' + mmF.cle]);
  if (mmF.pl !== '' && rbPl[+mmF.pl]) A.push(['pl', 'Playlist ' + mmG(rbPl[+mmF.pl])]);
  if (mmF.recents) A.push(['recents', 'Ajoutés depuis moins d’un mois']);
  if (mmF.jamais) A.push(['jamais', 'Jamais joués']);
  if (mmF.fav) A.push(['fav', 'Mes favoris']);
  return A.map(([k, t]) => mmH`<button type="button" class="mm-actif" data-mm="enleve" data-f="${k}" aria-label="Enlever le filtre : ${t}">${t}${MM_IC.croix}</button>`);
}
const mmTog = (f, t, on) => mmH`<button type="button" class="mm-tog${on ? ' on' : ''}" data-mm="tog" data-f="${f}" aria-pressed="${!!on}"><span class="mm-tog-c">${on ? MM_IC.coche : ''}</span>${t}</button>`;
function mmPanneau(){
  const [b0, b1] = mmBornes(), cles = [...new Set(rbLib.map(t => t[4]).filter(Boolean))].sort((x, y) => parseInt(x, 10) - parseInt(y, 10) || x.localeCompare(y));
  const tous = mmStyles(), G = [];
  if (b1 > b0) G.push(mmH`<div class="mm-pg"><span class="mm-pg-t">Tempo</span><div class="mm-duo"><span class="mm-rail"><i style="${mmRail()}"></i></span><input type="range" min="${b0}" max="${b1}" value="${mmF.tmin || b0}" data-f="tmin" aria-label="Tempo le plus lent"><input type="range" min="${b0}" max="${b1}" value="${mmF.tmax || b1}" data-f="tmax" aria-label="Tempo le plus rapide"></div><span class="mm-pg-v" id="mmTempoV">${mmTempoTxt()}</span></div>`);
  G.push(mmH`<div class="mm-pg"><span class="mm-pg-t">Tonalité</span><select id="mmCle"><option value="">Toutes</option>${cles.map(k => mmH`<option${mmF.cle === k ? mmBrut(' selected') : ''}>${k}</option>`)}</select><span class="mm-pg-aide">Le code de rekordbox : 8A, 9B…</span></div>`);
  if (tous.length > 8) G.push(mmH`<div class="mm-pg"><span class="mm-pg-t">Style</span><select id="mmStyle"><option value="">Tous les styles</option>${tous.map(([s, n]) => mmH`<option value="${s}"${mmF.style === s ? mmBrut(' selected') : ''}>${s} (${n})</option>`)}</select></div>`);
  if (rbPl.length) G.push(mmH`<div class="mm-pg"><span class="mm-pg-t">Playlist rekordbox</span><select id="mmPl"><option value="">Toutes</option>${rbPl.map((p, i) => mmH`<option value="${i}"${mmF.pl === String(i) ? mmBrut(' selected') : ''}>${p} (${rbLib.filter(t => t[7].includes(i)).length})</option>`)}</select><span class="mm-pg-aide">Tes playlists, lues dans ton export.</span></div>`);
  const togs = [mmADates() ? mmTog('recents', 'Ajoutés depuis moins d’un mois', mmF.recents) : '', mmALectures() ? mmTog('jamais', 'Jamais joués', mmF.jamais) : '', mmPro() ? mmTog('fav', 'Mes favoris', mmF.fav) : ''].filter(Boolean);
  if (togs.length) G.push(mmH`<div class="mm-pg"><span class="mm-pg-t">Afficher seulement</span>${togs}</div>`);
  return mmH`${G}<div class="mm-pg-pied"><button type="button" class="linkbtn" data-mm="effacer">Effacer les filtres</button><span id="mmCompte"></span></div>`;
}
function mmRendMorceaux(){
  const styles = mmStyles(), top = styles.slice(0, 8).map(s => s[0]);
  if (mmF.style && !top.includes(mmF.style)) top.push(mmF.style);
  mmMet($('mmStyles'), styles.length ? mmH`<button type="button" class="mm-chip${mmF.style ? '' : ' on'}" data-mm="style" data-v="" aria-pressed="${!mmF.style}">Tous les styles<span>${rbLib.length}</span></button>${top.map(s => mmH`<button type="button" class="mm-chip${mmF.style === s ? ' on' : ''}" data-mm="style" data-v="${s}" aria-pressed="${mmF.style === s}">${s}<span>${(styles.find(x => x[0] === s) || [0, 0])[1]}</span></button>`)}` : '');
  const tri = mmTri(), choix = [['ajout', 'Ajoutés récemment', mmADates()], ['titre', 'Titre', true], ['bpm', 'Tempo', true], ['cle', 'Tonalité', true], ['lect', 'Les plus joués', mmALectures()]];
  mmMet($('mmTri'), choix.filter(c => c[2]).map(([k, t]) => mmH`<option value="${k}"${tri === k ? mmBrut(' selected') : ''}>${t}</option>`));
  if ($('mmQ').value !== mmF.q) $('mmQ').value = mmF.q;
  $('mmPanneau').hidden = !mmF.panneau; $('mmFiltresBtn').setAttribute('aria-expanded', String(mmF.panneau)); $('mmFiltresBtn').classList.toggle('on', mmF.panneau);
  if (mmF.panneau) mmMet($('mmPanneau'), mmPanneau());
  const n = mmMajListe();
  if (!mmPro()) mmDit(rbExemple ? 'Collection d’exemple : ouvre les fiches que tu veux !'
    : mmData.offerte ? 'Ta fiche offerte t’a plu ? Avec Pro, je fais pareil pour tous tes morceaux.' : 'Choisis le morceau que tu préfères : sa fiche est offerte.');
  else if (mmNbFiltres() || mmF.q.trim()) mmDit(n ? `${plur(n, 'morceau correspond', 'morceaux correspondent')}. Choisis-en un !` : 'Aucun morceau ne correspond : enlève un filtre.');
  else mmDit('Choisis un morceau que tu aimes : je te montre ceux qui vont avec.');
}

/* ---------- « Ce qui va avec » : la fiche d'un morceau ---------- */
function mmCarte(i, c){
  const a = rbLib[i], b = rbLib[c.j], ka = rbCles[i], kb = rbCles[c.j], k = ka + '>' + kb, t = MM_TECH[c.tech], fav = mmData.favP.includes(k);
  const tempo = mmH`<span class="${c.tempoOk ? '' : 'att'}">${c.tempoOk ? MM_IC.coche : MM_IC.alerte}<b>Tempo</b>${c.tempo}<em>${rbBpm(a[3])} → ${rbBpm(b[3])}</em></span>`;
  const cle = mmH`<span class="${c.cleIc === 'coche' ? '' : 'att'}">${MM_IC[c.cleIc]}<b>Tonalité</b>${c.cle}<em>${a[4]} → ${b[4]}</em></span>`;
  const style = c.styleConnu ? mmH`<span class="${c.style ? '' : 'off'}">${c.style ? MM_IC.coche : MM_IC.tiret}<b>Style</b>${c.style ? 'le même' : 'différent'}</span>` : '';
  return mmH`<div class="mm-carte">${mmAnneau(c.note)}<div class="mm-c-m">${mmDisque('b', 'mini')}<div><b class="mm-c-nom">${b[0]}</b><small>${b[1] || 'Artiste inconnu'}${b[2] ? ' · ' + b[2] : ''}</small><div class="mm-pourquoi">${tempo}${cle}${style}</div></div></div><div class="mm-c-t">${mmVg(c.tech)}<div><span class="mm-c-tk">Technique</span><b>${t.nom}</b>${mmDiff(c.diff)}</div></div><div class="mm-c-a"><button type="button" class="mm-coeur${fav ? ' on' : ''}" data-mm="coeurp" data-k="${k}" aria-pressed="${fav}" aria-label="${fav ? 'Retirer cette paire de tes favoris' : 'Garder cette paire'}">${fav ? MM_IC.coeurPlein : MM_IC.coeur}</button><button type="button" class="ghost mm-petit mm-ecoute" data-mm="ecoute" data-k="${kb}" aria-label="Écouter ${b[0]} sur YouTube">${MM_IC.casque}</button><button type="button" class="mm-violet mm-petit" data-mm="paire" data-a="${ka}" data-b="${kb}">${mmPro() ? '' : MM_IC.cadenas}Préparer ›</button></div></div>`;
}
function mmRendFiche(){
  const i = mmIdx(mm.a), a = rbLib[i], k = mm.a, fav = mmData.fav.includes(k), tous = mmPartenaires(i);
  const L = tous.filter(c => (!mmFi.amb || c.amb === mmFi.amb) && (!mmFi.style || c.style) && (!mmFi.tempo || c.ad <= .5)), montre = mmFi.plus ? L.slice(0, 30) : L.slice(0, 5);
  const meta = [mmH`<span><b>${a[3] ? rbBpm(a[3]) : '—'}</b> BPM</span>`, mmH`<span>Tonalité ${a[4] ? mmH`<i class="mm-cle">${a[4]}</i>` : '—'}</span>`];
  if (a[2]) meta.push(mmH`<span>${a[2]}</span>`);
  if (a[5]){ const q = mmQuand(a[5]); if (q) meta.push(mmH`<span>Ajouté ${/^\d/.test(q) ? 'le ' + q : q}</span>`); }
  if (a[6] >= 0) meta.push(mmH`<span>${a[6] ? plur(a[6], 'lecture', 'lectures') : 'Jamais joué'}</span>`);
  if (a[7].length) meta.push(mmH`<span>${a[7].slice(0, 3).map(n => rbPl[n] || '').join(' · ')}${a[7].length > 3 ? ` · +${a[7].length - 3}` : ''}</span>`);
  const autres = Math.min(L.length, 30) - montre.length;
  let corps;
  if (!a[3] || !a[4]) corps = mmH`<p class="mm-vide">rekordbox n’a pas encore analysé ce morceau : il me manque son tempo ou sa tonalité. Analyse-le dans rekordbox, puis réexporte ta collection.</p>`;
  else if (!tous.length) corps = mmH`<p class="mm-vide">Aucun morceau de ta collection ne va vraiment avec celui-là (tempo trop loin, ou tonalité qui frotte). Essaie avec un autre.</p>`;
  else corps = mmH`<div class="mm-f-titre"><h2>Ce qui va bien après</h2><span>${plur(L.length, 'morceau', 'morceaux')}</span></div><div class="mm-f-ctrl"><div class="mm-seg" role="group" aria-label="Ambiance"><span class="mm-seg-t">Ambiance</span>${[['', 'Toutes'], ['garder', 'Garder'], ['monter', 'Monter'], ['calmer', 'Calmer']].map(([v, t]) => mmH`<button type="button" class="${mmFi.amb === v ? 'on' : ''}" data-mm="amb" data-v="${v}" aria-pressed="${mmFi.amb === v}">${t}</button>`)}</div>${mmTog('fstyle', 'Même style', mmFi.style)}${mmTog('ftempo', 'Même tempo', mmFi.tempo)}</div>${montre.length ? montre.map(c => mmCarte(i, c)) : mmH`<p class="mm-vide">Aucun morceau avec ces réglages.</p>`}${autres > 0 && !mmFi.plus ? mmH`<button type="button" class="ghost mm-plus" data-mm="plusf">${autres === 1 ? 'Voir l’autre' : `Voir les ${autres} autres`}</button>` : ''}`;
  mmMet($('mmFiche'), mmH`<button type="button" class="mm-retour" data-mm="liste">‹ Mes morceaux</button><div class="mm-f-carte">${mmDisque('a', 'grand')}<div class="mm-f-info"><span class="lnum">Le morceau qui joue</span><h1>${a[0]}</h1><p class="mm-f-art">${a[1] || 'Artiste inconnu'}</p><div class="mm-f-meta">${meta}</div></div><div class="mm-f-act"><button type="button" class="mm-coeur grand${fav ? ' on' : ''}" data-mm="coeur" data-k="${k}" aria-pressed="${fav}" aria-label="${fav ? 'Retirer de tes favoris' : 'Ajouter à tes favoris'}">${fav ? MM_IC.coeurPlein : MM_IC.coeur}</button><button type="button" class="ghost mm-ecoute" data-mm="ecoute" data-k="${k}">${MM_IC.casque}Écouter</button></div></div>${corps}`);
  if (mmPro()) mmVu({ t: 'm', a: k });
  if (!rbExemple) stat1('ma-musique-fiche');   // la fiche d'un de SES morceaux (STATISTIQUES.md), pas de la collection d'exemple
  mmDit(!a[3] || !a[4] ? 'Ce morceau n’est pas encore analysé par rekordbox.' : !tous.length ? `Rien ne va vraiment après ${mmG(a[0])}. Essaie un autre morceau !`
    : `Voilà les morceaux de ta collection qui vont le mieux après ${mmG(a[0])}.${tous[0].note >= 95 ? ' Le premier, c’est un sans-faute.' : ''}`);
}

/* ---------- Préparer une transition : la technique, et les missions dans rekordbox ---------- */
function mmRendPaire(){
  const ia = mmIdx(mm.a), ib = mmIdx(mm.b), a = rbLib[ia], b = rbLib[ib], k = mm.a + '>' + mm.b, fav = mmData.favP.includes(k);
  const c = mmCompat(a, b, true), retour = mmH`<button type="button" class="mm-retour" data-mm="fiche" data-k="${mm.a}">‹ Ce qui va après ${mmG(a[0])}</button>`;
  if (!c){ mmMet($('mmPaire'), mmH`${retour}<p class="mm-vide">Il me manque le tempo ou la tonalité d’un de ces deux morceaux : analyse-les dans rekordbox, puis réexporte ta collection.</p>`); mmDit('Il me manque des infos sur ces morceaux.'); return; }
  const t = MM_TECH[c.tech], L = mmMissions(a, b, c.tech), fait = rbMis.paires[k] || 0, cur = Math.max(0, Math.min(mmPv.i, L.length - 1));
  const exo = (lessonsOf(t.exo[0]) || [])[t.exo[1]], tu = typeof TUTOS !== 'undefined' && TUTOS.find(x => x.id === t.tuto), tutoOk = tu && tutosOn();
  const deck = (m, p) => mmH`<div class="mm-t-deck ${p}">${mmDisque(p, 'petit')}<div><span class="mm-t-cote">Platine ${p.toUpperCase()}</span><b>${m[0]}</b><small>${m[1] || 'Artiste inconnu'}</small><span class="mm-t-meta">${rbBpm(m[3])} BPM · ${m[4]}</span></div></div>`;
  const mis = mmPv.toutes || fait >= 6
    ? mmH`${fait >= 6 ? mmH`<p class="mm-bravo">${MM_IC.coche}Bravo, les ${L.length} missions sont faites !${rbMis.total === 1 ? ' Nouveau badge : Pour de vrai.' : ''}</p>` : ''}<ol class="mm-m-liste">${L.map((x, n) => mmH`<li class="${n < fait ? 'ok' : ''}"><label><input type="checkbox" data-mm-case="${n}"${n < fait ? mmBrut(' checked') : ''}><span class="mm-mk">${n < fait ? MM_IC.coche : n + 1}</span><span><b>${x[0]}</b> · ${x[1]}</span></label></li>`)}</ol>${fait >= 6 ? mmH`<button type="button" class="cta mm-petit" data-mm="fiche" data-k="${mm.a}">Choisir une autre transition</button>` : mmH`<button type="button" class="linkbtn" data-mm="mtoutes">Ne voir que la mission en cours</button>`}`
    : mmH`<div class="mm-m-tete"><b>Mission ${cur + 1} sur ${L.length}</b><span class="mm-m-points" aria-hidden="true">${L.map((_, n) => mmH`<i class="${n < fait ? 'ok' : n === cur ? 'cur' : ''}"></i>`)}</span></div><h3>${L[cur][0]}</h3><p>${L[cur][1]}</p><div class="mm-m-btns"><button type="button" class="ghost mm-petit" data-mm="mprec"${cur === 0 ? mmBrut(' disabled') : ''}>‹ Précédente</button><button type="button" class="cta mm-petit" data-mm="mok">C’est fait</button></div><button type="button" class="linkbtn" data-mm="mtoutes">Voir toutes les missions</button>`;
  const btns = [exo ? mmH`<button type="button" class="mm-violet" data-mm="exo"><span class="mm-l">${MM_IC.table}M’entraîner sur le site</span><small>Chapitre ${t.exo[0]} · niveau ${t.exo[1] + 1} · ${exo.title}</small></button>` : '',
    tutoOk ? mmH`<button type="button" class="ghost" data-mm="tuto" data-v="${tu.id}"><span class="mm-l">${MM_IC.tuto}Voir le tuto</span><small>${tu.titre} · ${tu.duree || ''}</small></button>` : ''];
  mmMet($('mmPaire'), mmH`${retour}<div class="mm-t-haut">${deck(a, 'a')}<span class="mm-t-fl" aria-hidden="true">${MM_IC.fleche}</span>${deck(b, 'b')}<div class="mm-t-score">${mmAnneau(c.note)}<button type="button" class="mm-btn-coeur${fav ? ' on' : ''}" data-mm="coeurp" data-k="${k}" aria-pressed="${fav}">${fav ? MM_IC.coeurPlein : MM_IC.coeur}${fav ? 'Paire gardée' : 'Garder cette paire'}</button></div></div><div class="mm-t-grille"><div class="mm-t-tech"><span class="lnum">La technique conseillée</span><div class="mm-t-tt">${mmVg(c.tech, 'grand')}<div><h2>${t.nom}</h2>${mmDiff(c.diff)}</div></div><p>${mmPourquoi(a, b, c)}</p><div class="mm-t-btns">${btns}</div></div><div class="mm-t-mis"><span class="lnum">Sur ta table, dans rekordbox</span>${mis}</div></div>`);
  mmVu({ t: 'p', a: mm.a, b: mm.b });
  if (!rbExemple) stat1('ma-musique-paire');
  mmDit(fait >= 6 ? `Paire validée, bravo ! Tu as fait ${plur(rbMis.total, 'vraie transition', 'vraies transitions')} avec ta musique.` : `${mmG(a[0])} puis ${mmG(b[0])} : ${c.tempo}, ${c.cle}. ${t.dit}`, 'danse');
}
// Une mission faite (ou décochée) : les missions se font dans l'ordre, « fait » = combien sont faites
function mmMission(n, faite){
  const k = mm.a + '>' + mm.b, avant = rbMis.paires[k] || 0, apres = faite ? Math.max(avant, n + 1) : Math.min(avant, n);
  const valide = apres >= 6 && !rbMis.ok.includes(k);   // une paire validée ne compte qu'une fois, même décochée puis recochée
  rbMis.paires[k] = apres; if (valide){ rbMis.ok.push(k); rbMis.total++; confetti(120); badgeSync(); }
  rbSaveMis(); mmPv.i = Math.min(apres, 5); renderReal();
  if (faite && apres > avant){ viniSaute('real', valide ? 1600 : 1100); son(valide ? 'fin' : 'reussi'); }
}

/* ---------- Mes favoris, Vus récemment ---------- */
function mmPaireLigne(k, droite){
  const [x, y] = k.split('>'), ia = mmIdx(x), ib = mmIdx(y); if (ia < 0 || ib < 0) return '';
  const a = rbLib[ia], b = rbLib[ib], c = mmCompat(a, b, true);
  return mmH`<button type="button" class="mm-p-ligne" data-mm="paire" data-a="${x}" data-b="${y}">${mmDisque('a', 'mini')}<span class="mm-p-t"><b>${a[0]}</b><small>${a[3] ? rbBpm(a[3]) + ' BPM · ' : ''}${a[4]}</small></span><span class="mm-p-fl" aria-hidden="true">→</span>${mmDisque('b', 'mini')}<span class="mm-p-t"><b>${b[0]}</b><small>${b[3] ? rbBpm(b[3]) + ' BPM · ' : ''}${b[4]}</small></span><span class="mm-p-n">${c ? c.note + ' · ' + MM_NIVEAU(c.note) : ''}</span><span class="mm-p-tech">${c ? MM_TECH[c.tech].nom : ''}</span>${droite}</button>`;
}
function mmStatut(k){
  const f = rbMis.paires[k] || 0;
  return f >= 6 ? mmH`<span class="mm-st ok">${MM_IC.coche}Faite</span>` : f > 0 ? mmH`<span class="mm-st">Mission ${f + 1} sur 6</span>` : mmH`<span class="mm-st off">Pas commencée</span>`;
}
const mmFavMorceaux = () => mmData.fav.filter(k => rbParCle.has(k)), mmFavPaires = () => mmData.favP.filter(k => k.split('>').every(x => rbParCle.has(x)));
function mmRendFavoris(){
  const P = mmFavPaires().reverse(), M = mmFavMorceaux().reverse().map(mmIdx), absents = mmData.fav.length + mmData.favP.length - M.length - P.length;
  mmMet($('mmFavoris'), mmH`<h2 class="mm-sec">Paires gardées <span>${P.length}</span></h2>${P.length ? P.map(k => mmH`<div class="mm-p-ligne-boite">${mmPaireLigne(k, mmStatut(k))}<button type="button" class="mm-coeur on" data-mm="coeurp" data-k="${k}" aria-pressed="true" aria-label="Retirer cette paire de tes favoris">${MM_IC.coeurPlein}</button></div>`) : mmH`<p class="mm-vide">Pas encore de paire gardée : touche ♥ sur une paire qui te plaît.</p>`}<h2 class="mm-sec">Morceaux aimés <span>${M.length}</span></h2>${M.length ? mmH`<div class="mm-liste" role="list">${MM_TETE}${M.map(mmLigne)}</div>` : mmH`<p class="mm-vide">Pas encore de morceau aimé : touche ♥ dans la liste de tes morceaux.</p>`}${absents > 0 ? mmH`<p class="mm-note-bas">${plur(absents, 'favori n’est plus', 'favoris ne sont plus')} dans ta collection.</p>` : ''}`);
  const reste = P.filter(x => (rbMis.paires[x] || 0) < 6).length;
  mmDit(!P.length && !M.length ? 'Touche ♥ sur un morceau ou une paire : je les garde ici.' : reste ? `Tes paires gardées et tes morceaux aimés. Il te reste ${plur(reste, 'paire', 'paires')} à terminer !` : 'Tes paires gardées et tes morceaux aimés.', 'danse');
}
function mmRendRecents(){
  const V = mmData.vus.filter(v => mmIdx(v.a) >= 0 && (v.t === 'm' || mmIdx(v.b) >= 0));
  mmMet($('mmRecents'), V.length ? V.map(v => v.t === 'p'
    ? mmH`<div class="mm-p-ligne-boite mm-recent"><span class="mm-r-k">Paire</span>${mmPaireLigne(v.a + '>' + v.b, mmH`<span class="mm-r-q">${mmDepuis(v.q)}</span>`)}</div>`
    : mmH`<div class="mm-p-ligne-boite mm-recent"><span class="mm-r-k">Fiche</span><button type="button" class="mm-p-ligne seul" data-mm="fiche" data-k="${v.a}">${mmDisque('a', 'mini')}<span class="mm-p-t"><b>${rbLib[mmIdx(v.a)][0]}</b><small>Ce qui va après</small></span><span class="mm-r-q">${mmDepuis(v.q)}</span></button></div>`)
    : mmH`<p class="mm-vide">Rien pour l’instant : ouvre la fiche d’un morceau.</p>`);
  mmDit(V.length ? 'Tout ce que tu as regardé, du plus récent au plus ancien. Clique pour y revenir.' : 'Rien pour l’instant : ouvre la fiche d’un morceau.');
}

/* ---------- La page entière ---------- */
function mmRendAvant(){
  $('mmOffre').hidden = mmPro();
  const D = rbDemo().morceaux, a = D[0], P = [3, 1, 4].map(j => { const c = mmCompat(a, D[j]); return c && Object.assign(c, { j }); }).filter(Boolean);
  mmMet($('mmApercu'), mmH`<div class="mm-ap-tete"><span class="mm-ap-ex">Exemple</span>Ce que tu vas obtenir</div><div class="mm-ap-m">${mmDisque('a', 'petit')}<div><b>${a[0]}</b><small>${a[1]} · ${rbBpm(a[3])} BPM · ${a[4]}</small></div></div>${P.map(c => mmH`<div class="mm-ap-p">${mmAnneau(c.note, true)}<div class="mm-ap-pt"><b>${D[c.j][0]}</b><small>${c.tempo} · ${c.cle}</small></div><span class="mm-ap-tech">${mmVg(c.tech)}${MM_TECH[c.tech].nom}</span></div>`)}`);
  mmDit('Montre-moi ta collection rekordbox : je te trouve les morceaux qui vont ensemble.');
}
function mmRendPdj(){
  const b = $('mmPdj'), p = mmPro() ? mmPdj() : null; b.hidden = !p; if (!p) return;
  b.dataset.a = rbCles[p[0]]; b.dataset.b = rbCles[p[1]];
  mmMet(b, mmH`<span class="mm-pdj-k">Paire du jour</span><b>${rbLib[p[0]][0]}</b><span aria-hidden="true">→</span><b>${rbLib[p[1]][0]}</b><span aria-hidden="true">›</span>`);
}
function mmBanniere(){
  const g = $('mmGratuit'), o = mmIdx(mmData.offerte);
  const [titre, texte] = rbExemple ? ['C’est la collection d’exemple.', 'Avec ta collection : 1 fiche offerte, le reste dans Pro.']
    : !mmData.offerte ? ['Ta première fiche est offerte.', 'Choisis le morceau que tu préfères : je te montre ceux qui vont avec, et la technique pour chaque transition.']
    : [o >= 0 ? `Tu as vu ta fiche offerte : ${mmG(rbLib[o][0])}.` : 'Tu as déjà vu ta fiche offerte.', 'Avec DJingood Pro : ce qui va avec pour tous tes morceaux, la technique pour chaque transition, tes favoris et les missions.'];
  mmMet(g, mmH`<div><span class="pro-tag">Pro</span><b>${mmFr(titre)}</b><p>${mmFr(texte)}</p></div><button type="button" class="pro-mini" data-mm="pro">Découvrir Pro</button>`);
}
function renderReal(){
  const bloque = mmToutPro(); $('rbPro').hidden = !bloque;
  if (bloque){ $('rbEmpty').hidden = true; $('rbFull').hidden = true; mmDit('Ta propre musique, c’est dans DJingood Pro : choisis un morceau, je te trouve ceux qui vont avec.'); return; }
  const has = rbLib.length > 0; $('rbEmpty').hidden = has; $('rbFull').hidden = !has;
  if (!has){ mmRendAvant(); return; }
  if (!mmPro() && (mm.ecran === 'paire' || mm.ecran === 'favoris' || mm.ecran === 'recents' || (mm.ecran === 'fiche' && !mmFicheLibre(mm.a)))) mm = { ecran: 'morceaux' };
  if ((mm.ecran === 'fiche' && mmIdx(mm.a) < 0) || (mm.ecran === 'paire' && (mmIdx(mm.a) < 0 || mmIdx(mm.b) < 0))) mm = { ecran: 'morceaux' };
  const e = mm.ecran, dedans = e === 'fiche' || e === 'paire';
  for (const [id, x] of [['mmMorceaux', 'morceaux'], ['mmFavoris', 'favoris'], ['mmRecents', 'recents'], ['mmFiche', 'fiche'], ['mmPaire', 'paire']]) $(id).hidden = e !== x;
  $('mmHaut').hidden = dedans; $('mmOnglets').hidden = dedans;
  const utiles = rbLib.filter(t => t[3] && t[4]).length;
  $('rbSum').textContent = plur(rbLib.length, 'morceau', 'morceaux') + (rbName ? ' · ' + rbName : '') + (utiles < rbLib.length ? ` · ${utiles} avec tempo et tonalité` : '');
  $('mmAncien').hidden = !rbAncien || dedans;
  $('mmGratuit').hidden = mmPro() || dedans; if (!$('mmGratuit').hidden) mmBanniere();
  const nf = mmFavMorceaux().length + mmFavPaires().length; $('mmNbM').textContent = rbLib.length; $('mmNbF').textContent = mmPro() && nf ? nf : '';
  document.querySelectorAll('#mmOnglets [data-mm-onglet]').forEach(x => { if (x.dataset.mmOnglet === e) x.setAttribute('aria-current', 'page'); else x.removeAttribute('aria-current'); });
  mmRendPdj();
  if (e === 'fiche') mmRendFiche(); else if (e === 'paire') mmRendPaire(); else if (e === 'favoris') mmRendFavoris(); else if (e === 'recents') mmRendRecents(); else mmRendMorceaux();
}

/* ---------- Les gestes ---------- */
function mmOuvreFiche(k){
  if (!mmPro() && !rbExemple){ if (!mmData.offerte){ mmData.offerte = k; mmSauve(); } else if (mmData.offerte !== k){ proOuvre('', { vue: 'vrai' }); return; } }
  mmVa('morceau/' + k);
}
function mmEcoute(k){
  const t = rbLib[mmIdx(k)]; if (!t) return;
  try { window.open('https://www.youtube.com/results?search_query=' + encodeURIComponent((t[1] ? t[1] + ' ' : '') + t[0]), '_blank', 'noopener'); } catch (e) {}
}
$('vReal').addEventListener('click', e => {
  const el = e.target.closest('[data-mm]'); if (!el || !$('vReal').contains(el)) return;
  const d = el.dataset, act = d.mm;
  if (act === 'fiche'){ mmOuvreFiche(d.k); return; }
  if (act === 'liste'){ mmVa(''); return; }
  if (act === 'pro'){ proOuvre('', { vue: 'vrai' }); return; }
  if (act === 'paire'){ if (!mmPro()){ proOuvre('', { vue: 'vrai' }); return; } mmVa('paire/' + d.a + '/' + d.b); return; }
  if (act === 'coeur' || act === 'coeurp'){
    if (!mmPro()){ proOuvre('', { vue: 'vrai' }); return; }
    const L = act === 'coeur' ? mmData.fav : mmData.favP, j = L.indexOf(d.k); if (j >= 0) L.splice(j, 1); else { L.push(d.k); son('clic'); }
    mmSauve(); renderReal(); return;
  }
  if (act === 'ecoute'){ mmEcoute(d.k); return; }
  if (act === 'style'){ mmF.style = d.v; mmF.limite = MM_PAGE; renderReal(); return; }
  if (act === 'tog'){
    if (d.f === 'fstyle') mmFi.style = !mmFi.style; else if (d.f === 'ftempo') mmFi.tempo = !mmFi.tempo; else { mmF[d.f] = !mmF[d.f]; mmF.limite = MM_PAGE; }
    renderReal(); return;
  }
  if (act === 'enleve'){ if (d.f === 'tempo'){ mmF.tmin = 0; mmF.tmax = 0; } else if (d.f === 'cle' || d.f === 'pl') mmF[d.f] = ''; else mmF[d.f] = false; renderReal(); return; }
  if (act === 'effacer'){ Object.assign(mmF, { q: '', style: '', tmin: 0, tmax: 0, cle: '', pl: '', recents: false, jamais: false, fav: false, limite: MM_PAGE }); renderReal(); return; }
  if (act === 'amb'){ mmFi.amb = d.v; mmFi.plus = false; renderReal(); return; }
  if (act === 'plusf'){ mmFi.plus = true; renderReal(); return; }
  // le niveau de la technique s'ouvre pour cette fois, même s'il n'est pas encore atteint dans le parcours (gardien du lot 72)
  // (chapitre 1 : goLesson en visite ; un autre chapitre, peut-être encore fermé : niveauVisite, comme les liens du guide)
  if (act === 'exo'){ const c = mmCompat(rbLib[mmIdx(mm.a)], rbLib[mmIdx(mm.b)], true); if (!c) return; const [n, i] = MM_TECH[c.tech].exo;
    if (n === 1) goLesson(n, i, true); else { location.hash = '#apprendre'; setView('apprendre'); niveauVisite(n, i); } return; }
  if (act === 'tuto'){ const id = d.v; location.hash = '#tutos'; setTimeout(() => tuOuvre(id), 0); return; }
  if (act === 'mok'){ mmMission(Math.max(0, Math.min(mmPv.i, 5)), true); return; }
  if (act === 'mprec'){ mmPv.i = Math.max(0, mmPv.i - 1); renderReal(); return; }
  if (act === 'mtoutes'){ mmPv.toutes = !mmPv.toutes; if (!mmPv.toutes) mmPv.i = Math.min(rbMis.paires[mm.a + '>' + mm.b] || 0, 5); renderReal(); }
});
$('vReal').addEventListener('change', e => {
  const t = e.target;
  if (t.matches('[data-mm-case]')){ mmPv.toutes = true; mmMission(+t.dataset.mmCase, t.checked); return; }   // on reste sur la liste des missions
  if (t.id === 'mmTri'){ mmF.tri = t.value; renderReal(); return; }
  if (t.id === 'mmCle' || t.id === 'mmPl' || t.id === 'mmStyle'){ mmF[{ mmCle: 'cle', mmPl: 'pl', mmStyle: 'style' }[t.id]] = t.value; mmF.limite = MM_PAGE; renderReal(); return; }
  if (t.dataset.f === 'tmin' || t.dataset.f === 'tmax') renderReal();
});
$('vReal').addEventListener('input', e => {
  const t = e.target, [b0, b1] = mmBornes();
  if (t.id === 'mmQ'){ mmF.q = t.value; mmF.limite = MM_PAGE; mmMajListe(); return; }
  if (t.dataset.f === 'tmin'){ const v = Math.min(+t.value, mmF.tmax || b1); t.value = v; mmF.tmin = v <= b0 ? 0 : v; mmF.limite = MM_PAGE; mmMajListe(); return; }
  if (t.dataset.f === 'tmax'){ const v = Math.max(+t.value, mmF.tmin || b0); t.value = v; mmF.tmax = v >= b1 ? 0 : v; mmF.limite = MM_PAGE; mmMajListe(); }
});
// Sans abonnement, Mes favoris et Vus récemment ouvrent la fenêtre Pro au lieu de changer d'onglet
document.querySelectorAll('#mmOnglets [data-mm-onglet]').forEach(a => a.addEventListener('click', e => { if (!mmPro() && a.dataset.mmOnglet !== 'morceaux'){ e.preventDefault(); proOuvre('', { vue: 'vrai' }); } }));
$('mmFiltresBtn').addEventListener('click', () => { mmF.panneau = !mmF.panneau; renderReal(); });
$('mmPlus').addEventListener('click', () => { mmF.limite += MM_PAGE; mmMajListe(); });
$('mmPdj').addEventListener('click', () => { const b = $('mmPdj'); if (b.dataset.a && b.dataset.b) mmVa('paire/' + b.dataset.a + '/' + b.dataset.b); });
$('rbPick').addEventListener('click', () => $('rbFile').click());
$('rbChange').addEventListener('click', () => $('rbFile').click());
$('rbDemo').addEventListener('click', () => { const d = rbDemo(); rbSet(d.morceaux, 'collection d’exemple', d.playlists, true); });
$('rbClear').addEventListener('click', () => rbSet([], ''));
$('rbFile').addEventListener('change', async e => {
  const f = e.target.files[0]; e.target.value = ''; if (!f) return; $('rbMsg').textContent = '';
  try { const r = rbParse(await f.text()); if (!r.morceaux.length) throw new Error('vide'); const cut = r.morceaux.length > RB_MAX; rbSet(r.morceaux, f.name.replace(/\.xml$/i, ''), r.playlists); stat1('rekordbox');
    if (cut) $('rbMsg').textContent = mmFr(`Ta collection est très grande : seuls les ${RB_MAX} premiers morceaux sont utilisés.`); }
  catch (err) { $('rbMsg').textContent = mmFr(err && err.message === 'vide' ? 'Ce fichier ne contient aucun morceau.' : 'Ce fichier n’est pas une collection rekordbox. Dans rekordbox : Fichier, puis Exporter la collection au format xml.'); }
});
