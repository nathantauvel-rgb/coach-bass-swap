// Onglet Passer au vrai.
// Tous les fichiers de js/ partagent la même portée et sont chargés dans l'ordre indiqué dans index.html.
'use strict';
/* ---------- Passer au vrai : collection rekordbox, paires recommandées, missions ----------
   Un morceau = [titre, artiste, genre, bpm, tonalité Camelot]. Seules ces infos sont lues dans le XML,
   et elles restent dans le navigateur. Une paire = [score, i, j] (indices dans rbLib, i = le plus lent). */
const RB_KEY = 'coach-collection', RB_MIS = 'coach-missions', RB_MAX = 6000, RB_PER = 6, RB_PC = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
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
const rbClean = t => Array.isArray(t) && typeof t[0] === 'string' && t[0].trim() ? [t[0].trim().slice(0, 120), String(t[1] || '').trim().slice(0, 80), String(t[2] || '').trim().slice(0, 40), +t[3] > 40 && +t[3] < 250 ? Math.round(+t[3] * 10) / 10 : 0, /^(1[0-2]|[1-9])[AB]$/.test(t[4]) ? t[4] : ''] : null;
let rbLib = [], rbName = '', rbPairs = [], rbAll = null, rbStale = true, rbPage = 0, rbSel = null, rbMis = { pair: '', done: {}, total: 0 };
try { const d = JSON.parse(localStorage.getItem(RB_KEY) || 'null'); if (d && Array.isArray(d.t)){ rbLib = d.t.slice(0, RB_MAX).map(rbClean).filter(Boolean); rbName = typeof d.n === 'string' ? d.n.slice(0, 80) : ''; } } catch (e) {}
try { const d = JSON.parse(localStorage.getItem(RB_MIS) || 'null'); if (d && typeof d === 'object' && !Array.isArray(d)) rbMis = { pair: typeof d.pair === 'string' ? d.pair : '', done: d.done && typeof d.done === 'object' && !Array.isArray(d.done) ? d.done : {}, total: Math.max(0, Math.floor(+d.total) || 0) }; } catch (e) {}
{ const m = rbMis.pair.match(/^(\d+)\|(\d+)$/); if (m && +m[1] < rbLib.length && +m[2] < rbLib.length && m[1] !== m[2]) rbSel = [+m[1], +m[2]]; else { rbMis.pair = ''; rbMis.done = {}; } }
const rbSaveMis = () => { try { localStorage.setItem(RB_MIS, JSON.stringify(rbMis)); } catch (e) {} };
function rbParse(text){
  const doc = new DOMParser().parseFromString(text, 'application/xml');
  if (doc.querySelector('parsererror')) throw new Error('xml');
  const coll = doc.querySelector('COLLECTION'); if (!coll) throw new Error('collection');
  const out = [];
  for (const el of coll.querySelectorAll(':scope > TRACK')){ const tempo = el.querySelector('TEMPO');
    const t = rbClean([el.getAttribute('Name') || '', el.getAttribute('Artist') || '', el.getAttribute('Genre') || '', parseFloat(el.getAttribute('AverageBpm')) || parseFloat(tempo && tempo.getAttribute('Bpm')) || 0, rbKey(el.getAttribute('Tonality'))]);
    if (t) out.push(t); }
  return out;
}
const RB_DEMO = [['Matin clair', 'Exemple', 'House', 122, '8A'], ['Les quais', 'Exemple', 'House', 123, '9A'], ['Verre fumé', 'Exemple', 'House', 124, '8A'], ['Piscine vide', 'Exemple', 'House', 124, '8B'],
  ['Après minuit', 'Exemple', 'Tech House', 126, '7A'], ['Néon rose', 'Exemple', 'Tech House', 126, '8A'], ['Tunnel', 'Exemple', 'Techno', 130, '5A'], ['Acier', 'Exemple', 'Techno', 131, '6A'],
  ['Sable chaud', 'Exemple', 'Afro House', 120, '4A'], ['Tambours', 'Exemple', 'Afro House', 121, '4A'], ['Grand soleil', 'Exemple', 'Afro House', 122, '5A'], ['Vieux vinyle', 'Exemple', 'Disco', 118, '11B']];
function rbScore(a, b, rel){
  const ad = Math.abs(b[3] / a[3] - 1) * 100, st = ad <= 1 ? 1 : ad <= 3 ? .8 : .45, sk = { same: 1, adj: .9, rel: .8, boost: .45, clash: .05 }[rel];
  const ga = a[2].toLowerCase(), gb = b[2].toLowerCase(), sg = ga && gb ? (ga === gb || ga.includes(gb) || gb.includes(ga) ? 1 : .3) : .5;
  return Math.round((.45 * st + .4 * sk + .15 * sg) * 100);
}
function rbBuild(filter){
  const idx = rbLib.map((_, i) => i).filter(i => rbLib[i][3] && rbLib[i][4]).sort((x, y) => rbLib[x][3] - rbLib[y][3] || x - y);
  const f = (filter || '').toLowerCase().trim(), hit = idx.map(i => !f || (rbLib[i][0] + ' ' + rbLib[i][1]).toLowerCase().includes(f)), cand = [];
  for (let x = 0; x < idx.length; x++){ const i = idx[x], a = rbLib[i], best = [];
    for (let y = x + 1; y < idx.length; y++){ const j = idx[y], b = rbLib[j]; if (b[3] > a[3] * 1.06) break; if (!hit[x] && !hit[y]) continue;
      if (a[0].toLowerCase() === b[0].toLowerCase()) continue;
      const rel = rbRel(a[4], b[4]); if (rel === 'clash') continue;
      const s = rbScore(a, b, rel); if (s >= 60) best.push([s, i, j]); }
    best.sort((p, q) => q[0] - p[0]); for (const c of best.slice(0, f ? 12 : 4)) cand.push(c); }
  cand.sort((p, q) => q[0] - p[0] || p[1] - q[1] || p[2] - q[2]);
  const used = {}, out = [], lim = f ? 99 : 1;
  for (const c of cand){ if ((used[c[1]] || 0) >= lim || (used[c[2]] || 0) >= lim) continue; used[c[1]] = (used[c[1]] || 0) + 1; used[c[2]] = (used[c[2]] || 0) + 1; out.push(c); if (out.length >= 60) break; }
  return out;
}
function rbWhy(a, b){
  const same = Math.abs(b[3] / a[3] - 1) * 100 <= .5, rel = rbRel(a[4], b[4]);
  const key = { same: `même tonalité (${a[4]})`, adj: `tonalités voisines (${a[4]} et ${b[4]})`, rel: `tonalités cousines (${a[4]} et ${b[4]})`, boost: `montée d'énergie (${a[4]} vers ${b[4]})`, clash: `tonalités éloignées (${a[4]} et ${b[4]})` }[rel];
  return (same ? `Même tempo (${rbBpm(a[3])} BPM)` : `${rbBpm(a[3])} et ${rbBpm(b[3])} BPM`) + ' · ' + key + (a[2] && b[2] && a[2].toLowerCase() === b[2].toLowerCase() ? ' · même genre' : '');
}
function rbMissionList(a, b){
  const same = Math.abs(b[3] / a[3] - 1) * 100 <= .5;
  return [
    ['prep', 'Prépare tes deux morceaux', `Dans rekordbox, charge « ${a[0]} » sur la platine 1 et « ${b[0]} » sur la platine 2. ` + (same ? `Ils sont au même tempo (${rbBpm(a[3])} BPM).` : `Le premier est à ${rbBpm(a[3])} BPM, le second à ${rbBpm(b[3])} : appuie sur BEAT SYNC de la platine 2 pour qu'il se cale sur le premier.`)],
    ['outro', 'Repère la fin du premier morceau', `Écoute « ${a[0]} » en comptant les phrases de 32 temps. Vers la fin, trouve le moment où le morceau se vide : c'est son outro. Pose un repère dessus avec un pad HOT CUE.`],
    ['moment', 'Le bon moment', `Fader de la platine 2 en bas. Relance « ${a[0]} » un peu avant ton repère, et appuie sur PLAY de la platine 2 pile sur le premier temps de l'outro. Écoute au casque (bouton CUE du canal 2) : les deux grosses caisses doivent tomber ensemble.`],
    ['fader', 'Le fader', `Refais la même chose, puis monte le fader de « ${b[0]} » sur une phrase, et baisse celui de « ${a[0]} » sur la phrase suivante.`],
    ['swap', 'Le swap des basses', `Avant de lancer « ${b[0]} », coupe son LOW. Au début d'une phrase, coupe le LOW de « ${a[0]} » et remets celui de « ${b[0]} » au milieu, dans le même geste.`],
    ['full', 'La transition complète', 'Tout d\'affilée, sans t\'arrêter : LOW coupé, PLAY sur la phrase, fader qui monte, swap des basses, puis le premier morceau qui sort. Recommence jusqu\'à ce que ça sonne propre trois fois de suite.']
  ];
}
function rbSet(list, name){
  rbLib = list.slice(0, RB_MAX); rbName = name || ''; rbSel = null; rbMis.pair = ''; rbMis.done = {}; rbSaveMis(); rbAll = null; rbStale = true; rbPage = 0; $('rbFind').value = ''; $('rbMsg').textContent = '';
  try { if (rbLib.length) localStorage.setItem(RB_KEY, JSON.stringify({ n: rbName, t: rbLib })); else localStorage.removeItem(RB_KEY); }
  catch (e) { $('rbMsg').textContent = 'Ta collection est trop grande pour être gardée en mémoire : il faudra la réimporter à ta prochaine visite.'; }
  renderReal();
}
function renderMissions(){
  const box = $('rbMisBox'); box.hidden = !rbSel; if (!rbSel) return;
  const a = rbLib[rbSel[0]], b = rbLib[rbSel[1]], list = rbMissionList(a, b), ol = $('rbMissions'); ol.innerHTML = '';
  $('rbMisSub').textContent = `Avec « ${a[0]} » puis « ${b[0]} ». Fais chaque mission sur ta table, et coche-la quand c'est propre. Les quatre dernières reprennent les niveaux 1 à 4 des leçons.`;
  for (const [id, title, text] of list){ const liEl = document.createElement('li'), lab = document.createElement('label'), cb = document.createElement('input'), d = document.createElement('div'), st = document.createElement('strong'), sp = document.createElement('span');
    cb.type = 'checkbox'; cb.checked = !!rbMis.done[id]; liEl.classList.toggle('done', cb.checked); st.textContent = title; sp.textContent = text; d.append(st, sp); lab.append(cb, d); liEl.appendChild(lab); ol.appendChild(liEl);
    cb.addEventListener('change', () => { if (cb.checked) rbMis.done[id] = 1; else delete rbMis.done[id];
      const all = list.every(m => rbMis.done[m[0]]); if (all && !rbMis.done.ok){ rbMis.done.ok = 1; rbMis.total++; confetti(120); }
      rbSaveMis(); renderMissions(); }); }
  const dn = $('rbDone'); dn.hidden = !rbMis.done.ok; dn.textContent = `Paire validée ! Tu as réussi ${plur(rbMis.total, 'vraie transition', 'vraies transitions')} avec ta musique. Choisis une autre paire pour continuer.`;
}
function renderReal(){
  const has = rbLib.length > 0; $('rbEmpty').hidden = has; $('rbFull').hidden = !has; if (!has) return;
  const usable = rbLib.filter(t => t[3] && t[4]).length;
  $('rbSum').textContent = plur(rbLib.length, 'morceau', 'morceaux') + (rbName ? ' · ' + rbName : '') + (usable < rbLib.length ? ` · ${usable} avec tempo et tonalité` : '');
  if (rbStale){ const f = $('rbFind').value.trim(); if (f) rbPairs = rbBuild(f); else rbPairs = rbAll = rbAll || rbBuild(''); rbStale = false; rbPage = 0; }
  const pages = Math.max(1, Math.ceil(rbPairs.length / RB_PER)); if (rbPage >= pages) rbPage = 0;
  const box = $('rbPairs'); box.innerHTML = '';
  const shown = rbPairs.slice(rbPage * RB_PER, rbPage * RB_PER + RB_PER);
  if (rbSel && !$('rbFind').value.trim() && !shown.some(c => c[1] === rbSel[0] && c[2] === rbSel[1])) shown.unshift([0, rbSel[0], rbSel[1]]);
  for (const c of shown){ const a = rbLib[c[1]], b = rbLib[c[2]], btn = document.createElement('button'); btn.type = 'button'; btn.className = 'duo';
    btn.setAttribute('aria-pressed', String(!!rbSel && rbSel[0] === c[1] && rbSel[1] === c[2]));
    for (const t of [a, b]){ const pt = document.createElement('span'), nm = document.createElement('b'), ar = document.createElement('span'); pt.className = 'pt'; nm.textContent = t[0]; ar.textContent = t[1] || 'Artiste inconnu'; pt.append(nm, ar);
      if (t === b){ const arrow = document.createElement('span'); arrow.className = 'ar'; arrow.textContent = '→'; arrow.setAttribute('aria-hidden', 'true'); btn.appendChild(arrow); } btn.appendChild(pt); }
    const why = document.createElement('span'); why.className = 'why'; if (c[0] >= 85){ const easy = document.createElement('b'); easy.textContent = 'Facile'; why.appendChild(easy); } why.appendChild(document.createTextNode(rbWhy(a, b))); btn.appendChild(why);
    btn.addEventListener('click', () => { const k = c[1] + '|' + c[2]; if (rbMis.pair !== k){ rbMis.pair = k; rbMis.done = {}; rbSaveMis(); } rbSel = [c[1], c[2]]; renderReal(); $('rbMisBox').scrollIntoView({ behavior: REDUCED ? 'auto' : 'smooth', block: 'start' }); });
    box.appendChild(btn); }
  if (!shown.length){ const p = document.createElement('p'); p.className = 'subnote'; p.textContent = $('rbFind').value.trim() ? 'Aucune paire trouvée pour cette recherche.' : 'Aucune paire trouvée. Vérifie que rekordbox a bien analysé tes morceaux (tempo et tonalité), puis réexporte ta collection.'; box.appendChild(p); }
  $('rbMore').hidden = pages < 2;
  renderMissions();
}
$('rbPick').addEventListener('click', () => $('rbFile').click());
$('rbChange').addEventListener('click', () => $('rbFile').click());
$('rbDemo').addEventListener('click', () => rbSet(RB_DEMO.map(rbClean), 'collection d\'exemple'));
$('rbClear').addEventListener('click', () => rbSet([], ''));
$('rbMore').addEventListener('click', () => { rbPage++; renderReal(); });
$('rbFind').addEventListener('input', () => { rbStale = true; renderReal(); });
$('rbFile').addEventListener('change', async e => {
  const f = e.target.files[0]; e.target.value = ''; if (!f) return; $('rbMsg').textContent = '';
  try { const list = rbParse(await f.text()); if (!list.length) throw new Error('vide'); const cut = list.length > RB_MAX; rbSet(list, f.name.replace(/\.xml$/i, ''));
    if (cut) $('rbMsg').textContent = `Ta collection est très grande : seuls les ${RB_MAX} premiers morceaux sont utilisés.`; }
  catch (err) { $('rbMsg').textContent = err && err.message === 'vide' ? 'Ce fichier ne contient aucun morceau.' : 'Ce fichier n\'est pas une collection rekordbox. Dans rekordbox : Fichier, puis Exporter la collection au format xml.'; }
});
