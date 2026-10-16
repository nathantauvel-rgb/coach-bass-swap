// Quêtes du jour (lot 30) : trois petits défis chaque jour, comme dans Duolingo, avec un coffre d'XP à ouvrir pour chacun.
// Tous les fichiers de js/ partagent la même portée et sont chargés dans l'ordre indiqué dans index.html.
'use strict';
/* ---------- Quêtes du jour ----------
   Chaque jour, trois quêtes (une facile, une moyenne, une difficile) tirées de la date parmi celles qui ont un sens pour
   le joueur (pas de combo du chapitre 4 s'il n'est pas ouvert, par exemple). Les compteurs repartent de zéro chaque jour.
   `coach-quetes` : { jour, ids, cpt, ouverts, xp } ; `xp` = total des coffres ouverts, ajouté aux XP du joueur (xpTotal). */
const QT_KEY = 'coach-quetes';
const QT_GAIN = [10, 15, 20];   // XP du coffre selon la difficulté
const QT_CPT = ['parties', 'demos', 'reussies', 'trois', 'expert', 'oreille', 'combos', 'quiz'];
const QT_JOUE = () => sumStars(stars) > 0;   // a déjà réussi au moins un niveau : quiz et entraînement ont du sens
const QUETES = [
  { id: 'demo', niv: 0, txt: 'Regarde une démo', but: 1, cpt: 'demos', ic: 'oeil' },
  { id: 'parties2', niv: 0, txt: 'Joue 2 niveaux', but: 2, cpt: 'parties', ic: 'play' },
  { id: 'quiz3', niv: 0, txt: 'Trouve 3 bonnes réponses au quiz', but: 3, cpt: 'quiz', ic: 'quiz', dispo: QT_JOUE },
  { id: 'parties4', niv: 1, txt: 'Joue 4 niveaux', but: 4, cpt: 'parties', ic: 'play' },
  { id: 'reussies2', niv: 1, txt: 'Réussis 2 transitions', but: 2, cpt: 'reussies', ic: 'ok' },
  { id: 'trois1', niv: 1, txt: 'Fais une partie à 3 étoiles', but: 1, cpt: 'trois', ic: 'etoile' },
  { id: 'defi', niv: 1, txt: 'Réussis le défi du jour', but: 1, cpt: 'defi', ic: 'cible', dispo: () => pracPool().length > 0 },
  { id: 'oreille', niv: 1, txt: 'Réussis un niveau à l’oreille', but: 1, cpt: 'oreille', ic: 'oreille', dispo: () => pracPool().length > 0 },
  { id: 'reussies4', niv: 2, txt: 'Réussis 4 transitions', but: 4, cpt: 'reussies', ic: 'ok' },
  { id: 'trois3', niv: 2, txt: 'Fais 3 parties à 3 étoiles', but: 3, cpt: 'trois', ic: 'etoile' },
  { id: 'expert2', niv: 2, txt: 'Joue 2 niveaux en Mode Expert', but: 2, cpt: 'expert', ic: 'eclair', dispo: () => sumStars(stars) >= 3 },
  { id: 'combo', niv: 2, txt: 'Réussis un combo du chapitre 4', but: 1, cpt: 'combos', ic: 'combo', dispo: () => ch4Unlocked() }
];
const QT_IC = {
  oeil: '<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
  play: '<circle cx="12" cy="12" r="10"/><path d="M10 8l6 4-6 4z"/>',
  quiz: '<circle cx="12" cy="12" r="10"/><path d="M9.5 9a2.6 2.6 0 1 1 3.6 2.4c-.7.3-1.1.9-1.1 1.6v.5M12 17h.01"/>',
  ok: '<circle cx="12" cy="12" r="10"/><path d="M7.5 12.5l3 3 6-6.5"/>',
  etoile: '<path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5-4.8-4.6 6.6-.9z"/>',
  cible: '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="5.5"/><circle cx="12" cy="12" r="1.5"/>',
  oreille: '<path d="M7 9a5 5 0 0 1 10 0c0 3-3 4-3 7a3 3 0 0 1-5.5 1.6"/><path d="M10 9.5a2 2 0 0 1 4 0c0 1.2-1 1.6-1.4 2.4"/>',
  eclair: '<path d="M13 2L4.5 13.5h6.5L10 22l8.5-11.5H12z"/>',
  combo: '<rect x="3" y="3" width="8" height="8" rx="2"/><rect x="13" y="13" width="8" height="8" rx="2"/><path d="M11 7h4a2 2 0 0 1 2 2v4"/>'
};
const QT_COFFRE = '<svg viewBox="0 0 40 40" aria-hidden="true"><g class="qt-couvercle"><path class="qt-bois" d="M6 17v-5a7 7 0 0 1 7-7h14a7 7 0 0 1 7 7v5z"/><rect class="qt-or" x="18" y="5" width="4" height="12"/></g>'
  + '<rect class="qt-bois2" x="6" y="17" width="28" height="17" rx="3"/><rect class="qt-or" x="18" y="17" width="4" height="17"/><rect class="qt-or" x="16.5" y="15" width="7" height="7" rx="1.5"/></svg>';

let qt = {}; try { qt = JSON.parse(localStorage.getItem(QT_KEY) || '{}'); } catch (e) {}
if (!qt || typeof qt !== 'object' || Array.isArray(qt)) qt = {};
{ const cpt = qt.cpt && typeof qt.cpt === 'object' && !Array.isArray(qt.cpt) ? qt.cpt : {}, ids = Array.isArray(qt.ids) ? qt.ids : [];
  qt = { jour: typeof qt.jour === 'string' ? qt.jour.slice(0, 10) : '',
    ids: ids.filter((id, k) => QUETES.some(q => q.id === id) && ids.indexOf(id) === k).slice(0, 3),
    cpt: Object.fromEntries(QT_CPT.map(k => [k, Math.max(0, Math.min(999, Math.floor(+cpt[k]) || 0))])),
    ouverts: Array.isArray(qt.ouverts) ? qt.ouverts.filter(id => typeof id === 'string') : [],
    xp: Math.max(0, Math.min(100000, Math.floor(+qt.xp) || 0)) };
  qt.ouverts = qt.ouverts.filter(id => qt.ids.includes(id)); }
const qtSave = () => { try { localStorage.setItem(QT_KEY, JSON.stringify(qt)); } catch (e) {} };
const questXp = () => qt.xp;
const qtDef = id => QUETES.find(q => q.id === id);
// Les quêtes du jour : tirées une fois par jour, puis gardées toute la journée
function qtJour(){
  const j = dayKey(); if (qt.jour === j && qt.ids.length === 3) return;
  let h = 11; for (const c of j) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  const dispo = QUETES.filter(q => !q.dispo || q.dispo()), ids = [], pris = new Set();
  for (const niv of [0, 1, 2]){
    const choix = dispo.filter(q => q.niv === niv && !pris.has(q.cpt)), autres = dispo.filter(q => !ids.includes(q.id) && !pris.has(q.cpt));
    const liste = choix.length ? choix : autres; if (!liste.length) continue;
    const q = liste[(h >>> (niv * 5)) % liste.length]; ids.push(q.id); pris.add(q.cpt);
  }
  qt = { jour: j, ids, cpt: Object.fromEntries(QT_CPT.map(k => [k, 0])), ouverts: [], xp: qt.xp }; qtSave();
}
// Où en est une quête : le défi du jour se lit dans l'entraînement, les autres dans les compteurs du jour
const qtVal = q => q.cpt === 'defi' ? (pracStr('defiDate') === dayKey() && pracNum('defiStars') >= 2 ? 1 : 0) : qt.cpt[q.cpt] || 0;
const qtFaite = q => qtVal(q) >= q.but;
// Après chaque partie (démos comprises) ; renvoie les quêtes que cette partie vient de terminer
function questNote(ev){
  qtJour(); const avant = qt.ids.map(qtDef).filter(qtFaite).map(q => q.id), c = qt.cpt;
  if (ev.demo) c.demos++;
  else { c.parties++; if (ev.st >= 2) c.reussies++; if (ev.st === 3) c.trois++; if (ev.expert) c.expert++; if (ev.ear && ev.st >= 2) c.oreille++; if (ev.ch === 4 && ev.st >= 2) c.combos++; }
  qtSave(); return qt.ids.map(qtDef).filter(q => qtFaite(q) && !avant.includes(q.id));
}
function questQuiz(){ qtJour(); qt.cpt.quiz++; qtSave(); }
// Le coffre d'une quête terminée : il s'ouvre, Vini saute de joie, les XP s'ajoutent
function questOuvrir(id){
  const q = qtDef(id); if (!q || !qt.ids.includes(id) || qt.ouverts.includes(id) || !qtFaite(q)) return;
  const gain = QT_GAIN[q.niv]; qt.ouverts.push(id); qt.xp += gain; qtSave();
  const li = $('qtList').querySelector(`[data-q="${id}"]`); if (li) li.classList.add('ouvre');
  viniJoie($('qtVini'), 1200); renderHud();
  setTimeout(renderQuetes, REDUCED ? 0 : 900);
}
function renderQuetes(){
  qtJour(); const box = $('qtList'); box.innerHTML = '';
  if (!$('qtVini').firstChild) viniMettre($('qtVini'), 'calme');
  const fin = new Date(); fin.setHours(24, 0, 0, 0); const h = Math.max(1, Math.ceil((fin - new Date()) / 3600000));
  const faites = qt.ids.map(qtDef).filter(qtFaite).length;
  $('qtSub').textContent = `${faites} sur ${qt.ids.length} · nouvelles quêtes dans ${h} h`;
  for (const id of qt.ids){ const q = qtDef(id), v = Math.min(qtVal(q), q.but), fait = qtFaite(q), ouvert = qt.ouverts.includes(id), gain = QT_GAIN[q.niv];
    const li = document.createElement('li'), ic = document.createElement('span'), mid = document.createElement('div'), haut = document.createElement('div'), t = document.createElement('strong'), bar = document.createElement('div'), fill = document.createElement('i'), n = document.createElement('span'), b = document.createElement('button');
    li.dataset.q = id; li.className = 'qt' + (fait ? ' faite' : '') + (ouvert ? ' ouverte' : '');
    ic.className = 'qt-ic'; ic.setAttribute('aria-hidden', 'true'); ic.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${QT_IC[q.ic]}</svg>`;
    t.textContent = q.txt; bar.className = 'qt-bar'; bar.setAttribute('aria-hidden', 'true'); fill.style.width = (v / q.but * 100) + '%'; bar.appendChild(fill);
    n.className = 'qt-n'; n.textContent = `${v} / ${q.but}`; haut.className = 'qt-haut'; haut.append(t, n); mid.className = 'qt-mid'; mid.append(haut, bar);
    b.type = 'button'; b.className = 'qt-coffre'; b.innerHTML = ouvert ? '' : QT_COFFRE; b.disabled = !fait || ouvert;
    b.setAttribute('aria-label', ouvert ? `Coffre ouvert : +${gain} XP` : fait ? `Ouvrir le coffre : +${gain} XP` : `Coffre de ${gain} XP, à gagner`);
    if (ouvert){ const g = document.createElement('span'); g.className = 'qt-gain'; g.textContent = `+${gain} XP`; b.appendChild(g); }
    b.addEventListener('click', () => questOuvrir(id));
    li.append(ic, mid, b); box.appendChild(li); }
}
// Ligne de la carte de résultat (appelée par finish) quand la partie vient de terminer une quête
function questLigne(faites){ const e = $('rQuete'); e.hidden = !faites.length;
  e.textContent = faites.length ? `Quête terminée : ${faites.map(q => q.txt).join(', ')} ! Ton coffre t’attend sur l’accueil.` : ''; }
