// Premiers pas (lot 28, refait au lot 37, animé au lot 52) : à la toute première visite, Vini pose trois questions, une par écran,
// comme dans Duolingo : ton niveau, ta table, ton objectif du jour. Le niveau choisit le parcours (parcours.js) et la première partie.
// Les réponses sont gardées dans coach-accueil.
// Tous les fichiers de js/ partagent la même portée et sont chargés dans l'ordre indiqué dans index.html.
'use strict';
/* ---------- Premiers pas ----------
   S'ouvre seulement pour un nouveau venu : pas de parcours (ni choisi, ni déduit d'une progression) et pas encore de réponses.
   « Passer » ferme sans rien choisir : l'accueil propose alors les trois parcours.
   Lot 37 (choix de l'utilisateur, 22 oct. 2026) : plus de « Pourquoi tu veux mixer ? » (la réponse ne servait à rien), plus de
   test de placement (les chapitres ne sont pas de plus en plus durs, ce sont des gestes différents), et aucune table n'est
   mise en avant : la table branchée est reconnue toute seule, sinon on la choisit dans la liste.
   Lot 52 (« Oui, toutes », 28 oct. 2026, d'après la maquette captures/maquette-vini) : c'est la première image du site, elle doit
   vivre. Vini sort de la platine et mixe au premier écran, sa bulle s'écrit pendant qu'il parle, il réagit à chaque réponse et
   danse au rythme de l'objectif choisi, et la musique monte d'une question à l'autre jusqu'au drop de « Commencer ». */
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
// Ce que fait Vini à chaque réponse (lot 52) : une pose par-dessus son humeur (viniPose, js/vini.js) ; calme : il ne danse pas
const PP_POSES = {
  debut: { bras: 'pouce', yeux: 'clin', fx: 'etoiles' },
  apprenti: { bras: 'oreille', yeux: 'fermes', fx: 'notes', rythme: 'hoche' },
  confirme: { lunettes: true, fx: 'etoiles', rythme: 'hoche' },
  5: { yeux: 'fermes', rythme: 'lent' },
  15: { bras: 'haut', sourcils: true, sueur: true, rythme: 'rapide' },
  ecoute: { bras: 'oreille', fx: 'ondes', calme: true },   // il tend l'oreille : il attend ta table
  souris: { bras: 'souris' },
  connue: { bras: 'pouce', yeux: 'clin' },
  branchee: { fx: 'etoiles' }
};
// La tête de lecture de la barre d'avancement, en % : le drop de la forme d'onde est au bout, « Commencer » l'y amène
const PP_POS = [5, 30, 52, 74];
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
// petits dessins (traits de la couleur du texte de la carte) ; au lot 52, ils bougent quand on choisit la réponse
const ppTrait = d => `<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
const PP_IC = {
  table: ppTrait('<rect x="2" y="8" width="28" height="16" rx="4"/><g class="pp-ic-rot" style="transform-origin:9px 16px"><circle cx="9" cy="16" r="4"/><path d="M9 16v-3.2"/></g><g class="pp-ic-rot" style="transform-origin:23px 16px"><circle cx="23" cy="16" r="4"/><path d="M23 16v-3.2"/></g><path d="M15 12v8M17 12v8"/>'),
  souris: ppTrait('<rect x="9" y="3" width="14" height="26" rx="7"/><path d="M9 11h14"/><path class="pp-ic-molette" d="M16 5v3.5"/>'),
  coche: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
  plan: ppTrait('<circle cx="16" cy="16" r="13"/>' + [[10, 7], [15, 11], [20, 5], [25, 9]].map(([x, h], i) => `<path class="pp-pl" style="--i:${i}" d="M${x} 21v-${h}" stroke-width="2.6"/>`).join(''))
};
const ppBarres = n => `<svg viewBox="0 0 28 24">${[[2, 14, 10], [11.5, 7, 17], [21, 0, 24]].map(([x, y, h], k) => `<rect class="${k <= n ? 'pp-b-on' : 'pp-b-off'}" style="--i:${k}" x="${x}" y="${y}" width="5" height="${h}" rx="2.5"/>`).join('')}</svg>`;
// L'objectif du jour : un petit disque qui tourne plus ou moins vite
const ppVinyle = m => `<svg class="pp-ic-vinyle pp-v${m}" viewBox="0 0 32 32"><circle class="pp-iv-d" cx="16" cy="16" r="13"/><path class="pp-iv-r" d="M7.5 13A9 9 0 0 1 13 7.5"/><circle class="pp-iv-l" cx="16" cy="16" r="4.5"/></svg>`;
const ppEllipse = (cx, cy, rx, ry) => `M${cx - rx} ${cy}A${rx} ${ry} 0 1 0 ${cx + rx} ${cy}A${rx} ${ry} 0 1 0 ${cx - rx} ${cy}`;
// La table reconnue, en petit : ses anneaux s'allument et ses pads clignotent sur le tempo
function ppMiniTable(){
  let pads = '';
  for (let k = 0; k < 8; k++) pads += `<rect class="ps-pad ${k > 3 ? 'ps-pad-b' : 'ps-pad-a'}" style="--k:${k}" x="${(k > 3 ? 76 : 12) + (k % 4) * 8.5}" y="44" width="7" height="5" rx="1.5"/>`;
  return `<svg class="ps-mini" viewBox="0 0 120 58"><rect class="ps-face" x="2" y="12" width="116" height="44" rx="10"/><rect class="ps-haut" x="2" y="5" width="116" height="47" rx="10"/>
<ellipse class="ps-bord" cx="28" cy="25" rx="21" ry="12"/><ellipse class="ps-bord" cx="92" cy="25" rx="21" ry="12"/>
<path class="ps-anneau ps-a" pathLength="100" d="${ppEllipse(28, 25, 17, 9.4)}"/><path class="ps-anneau ps-b" pathLength="100" d="${ppEllipse(92, 25, 17, 9.4)}"/>
<ellipse class="ps-plateau" cx="28" cy="25" rx="13" ry="7"/><ellipse class="ps-plateau" cx="92" cy="25" rx="13" ry="7"/>
<path class="ps-fente" d="M54 15V35M66 15V35"/><rect class="ps-cap" x="50" y="18" width="8" height="4" rx="1"/><rect class="ps-cap" x="62" y="18" width="8" height="4" rx="1"/>${pads}</svg>`;
}

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
// entree : l'entrée du premier écran a déjà été jouée ; attente : la bulle attend que Vini ait atterri ; vol : son saut vers le coin ;
// vh : Vini sur la table du premier écran ; sort : on quitte le premier écran ; fini : « Commencer » a été cliqué
const pp = { on: false, i: 0, rep: ppVide(), entree: false, attente: false, vol: null, vh: null, sort: false, fini: false };
const ppAOuvrir = () => !parcours && !accueil;
const ppSave = o => { accueil = o; try { localStorage.setItem(ACC_KEY, JSON.stringify(o)); } catch (e) {} };
// Les minuteurs d'un écran, tous annulés quand l'écran change ou que les questions se ferment
let ppMinuteurs = [];
function ppPlusTard(ms, f){ const t = setTimeout(() => { ppMinuteurs = ppMinuteurs.filter(x => x !== t); f(); }, ms); ppMinuteurs.push(t); }
function ppAnnule(){
  ppMinuteurs.forEach(clearTimeout); ppMinuteurs = [];
  if (pp.vol){ pp.vol.onfinish = null; pp.vol.cancel(); pp.vol = null; }
}

function openPremiers(){
  if (pp.on) return;
  Object.assign(pp, { on: true, i: 0, rep: ppVide(), entree: false, sort: false, fini: false });
  if (!$('ppVini').firstChild) viniMettre($('ppVini'));
  if (!$('ppFill').firstChild) ppOndeInit();
  $('pp').hidden = false; document.documentElement.classList.add('pp-open');
  if (sonsOn) ppMusiquePrepare();
  ppRender(0);
}
function ppClose(){
  ppAnnule(); ppTapeFin(); ppMusiqueArret();
  pp.on = false; $('pp').hidden = true; document.documentElement.classList.remove('pp-open');
  $('ppScene').textContent = ''; pp.vh = null;
}
// « Commencer » : les réponses sont gardées tout de suite. Vini se ramasse, la musique s'ouvre jusqu'au temps suivant, et c'est
// le drop (lot 52) : il saute, les notes et les vinyles volent. Puis la première étape du parcours qui va avec le niveau : le niveau 1
// (et le guide) pour un Grand débutant, le Mode Expert pour un Apprenti DJ, le set (chapitre 7) pour un DJ confirmé
function ppFin(){
  const r = pp.rep, v = $('ppVini');
  pp.fini = true; $('ppGo').disabled = true;
  ppSave({ niveau: r.niveau, table: r.table, modele: r.modele, min: r.min, fini: dayKey() });
  stat1('premiers-pas-fin', { parcours: r.niveau, table: r.table === 'table' ? 'oui' : 'non' });
  goalSet(r.min);
  ppAnnule(); ppAvance(100);
  const attente = ppMusiqueDrop();
  if (REDUCED) return ppFinSuite();
  viniPose(v, { yeux: 'fermes' }); viniHumeur(v, 'calme'); v.classList.add('pp-ramasse');
  ppPlusTard(attente, () => {
    v.classList.remove('pp-ramasse'); viniPose(v, {}); viniHumeur(v, 'parfait'); v._pose = null;
    ppDrop(v); if (ppBulle('C’est parti !')) ppTaper(v);
    ppPlusTard(1100, ppFinSuite);
  });
}
function ppFinSuite(){
  const r = pp.rep;
  ppMusiqueArret(1.2); ppClose(); setParcours(r.niveau);
  // sur un téléphone, « Comprendre » passe devant (lot 48) : nextStage la donne en premier
  if (r.niveau === 'debut' && !cpEtape()) goLesson(1, 0); else STAGES[nextStage() || PARCOURS[r.niveau].stages[0]].go();
}
function ppPasser(){ ppSave({ passe: true, fini: dayKey() }); stat1('premiers-pas-passes'); ppClose(); renderHome(); }
const ppPret = () => { const r = pp.rep, id = PP_ETAPES[pp.i];
  return id === 'salut' || (id === 'niveau' && r.niveau !== null) || (id === 'table' && r.table !== null) || (id === 'objectif' && r.min !== null); };
/* L'écran de la table. Une table branchée est reconnue toute seule (ppMidi est appelé par initMidi à chaque branchement) ;
   sinon « J'ai une table » ouvre la liste par marque, qui sert seulement à savoir si DJingood la connaît déjà. */
function ppTableOpts(add){
  const r = pp.rep, b = ppBranchee();
  if (b){ r.table = 'table'; r.modele = b.id; r.vue = true;
    add({ v: 'table', txt: b.nom, sub: b.id === 'inconnue' ? 'Branchée · je ne la connais pas encore' : 'Branchée et reconnue', ic: ppMiniTable(), big: true, pick: () => {} });
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
  sel.addEventListener('change', () => { r.modele = sel.value; ppMaj(); ppSautille(); });
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
// Une table vient d'être branchée ou débranchée pendant l'écran de la table : on le refait, et Vini saute de joie quand il la voit
// (le navigateur prévient plusieurs fois pour un seul branchement : on ne refait l'écran que si la table a changé)
let ppVu = '';
function ppMidi(){ const b = ppBranchee(), k = b ? b.nom : '';
  if (k === ppVu) return; ppVu = k;
  if (!pp.on || PP_ETAPES[pp.i] !== 'table' || pp.fini) return;
  ppRender(0);
  if (b){ viniJoie($('ppVini')); son('reussi'); ppPlusTard(380, () => ppEclats($('ppOpts').querySelector('.pp-opt'), 36, .7)); } }
function ppOption(o, k){
  const b = document.createElement('button'); b.type = 'button'; b.className = 'pp-opt' + (o.big ? ' pp-big' : '') + (REDUCED ? '' : ' pp-entre'); b.dataset.v = String(o.v);
  // les réponses arrivent l'une après l'autre (lot 52)
  b.style.setProperty('--d', (140 + k * 85) + 'ms');
  b.addEventListener('animationend', e => { if (e.animationName === 'pp-entre') b.classList.remove('pp-entre'); });
  if (o.badge){ const g = document.createElement('span'); g.className = 'pp-badge'; g.textContent = o.badge; b.appendChild(g); }
  if (o.ic){ const ic = document.createElement('span'); ic.className = 'pp-ic'; ic.setAttribute('aria-hidden', 'true'); ic.innerHTML = o.ic; b.appendChild(ic); }
  const t = document.createElement('span'), m = document.createElement('span'); t.className = 'pp-txt'; m.textContent = o.txt; t.appendChild(m);
  if (o.sub){ const s = document.createElement('span'); s.className = 'pp-sub'; s.textContent = o.sub; t.appendChild(s); }
  b.appendChild(t);
  if (o.tag){ const s = document.createElement('span'); s.className = 'pp-tag'; s.textContent = o.tag; b.appendChild(s); }
  if (o.coche){ const c = document.createElement('span'); c.className = 'pp-check'; c.setAttribute('aria-hidden', 'true'); c.innerHTML = PP_IC.coche; b.appendChild(c); }
  b.addEventListener('click', () => { if (pp.fini) return; o.pick(); ppMaj(); ppSautille(); son('clic'); });
  return b;
}
// Un écran : la question de Vini, les réponses, le bouton du bas. `sens` : 1 en avançant, -1 en revenant, 0 sur place ;
// `vol` : la place de Vini sur la table du premier écran, quand il en vient (il saute jusqu'au coin)
function ppRender(sens, vol){
  const id = PP_ETAPES[pp.i], r = pp.rep, body = $('ppBody'), box = $('ppOpts');
  ppAnnule(); ppTapeFin();
  $('ppBack').hidden = pp.i === 0;
  $('ppSon').hidden = pp.i === 0;
  ppAvance(PP_POS[pp.i]); ppMusiqueEtape();
  body.classList.remove('pp-intro', 'pp-derriere', 'pp-salue', 'pp-mixe', 'pp-sort');
  body.classList.toggle('pp-hero', id === 'salut');
  $('ppAsk').classList.remove('pp-cache', 'pp-pop');
  // l'entrée du premier écran ne se joue qu'une fois : en y revenant, Vini mixe déjà
  const intro = id === 'salut' && !pp.entree && !REDUCED;
  pp.attente = intro || (!!vol && !REDUCED);
  if (id === 'salut'){ ppHero(intro); pp.entree = true; }
  else { $('ppScene').hidden = true; $('ppScene').textContent = ''; pp.vh = null; }
  box.innerHTML = '';
  let k = 0;
  const add = o => box.appendChild(ppOption(o, k++));
  if (id === 'niveau') PP_NIVEAUX.forEach(([v, txt, sub], n) => add({ v, txt, sub, ic: ppBarres(n), pick: () => { r.niveau = v; } }));
  if (id === 'table') ppTableOpts(add);
  if (id === 'objectif') PP_MINUTES.forEach(([v, tag]) => add({ v, txt: v + ' min par jour', tag, ic: ppVinyle(v), pick: () => { r.min = v; ppMusiqueVitesse(v); } }));
  $('ppGo').textContent = id === 'salut' ? 'C’est parti' : id === 'objectif' ? 'Commencer' : 'Continuer';
  ppMaj();
  if (vol && !REDUCED && id !== 'salut') ppVol(vol);
  else if (sens && id !== 'salut') ppSautille();
  const first = box.querySelector('.pp-opt'); (first || $('ppCol')).focus({ preventScroll: true });
}
// Après un choix : les cartes cochées, ce que dit Vini et ce qu'il fait, la petite note, le bouton du bas
function ppMaj(){
  const id = PP_ETAPES[pp.i], r = pp.rep;
  const sel = { niveau: r.niveau, table: r.table, objectif: r.min }[id];
  $('ppOpts').querySelectorAll('.pp-opt').forEach(b => b.setAttribute('aria-pressed', String(sel !== null && sel !== undefined && String(sel) === b.dataset.v)));
  const liste = $('ppListe'); if (liste) liste.hidden = r.table !== 'table';
  const aide = $('ppAide'); if (aide) aide.hidden = !ppAideVue(r);
  const texte = id === 'salut' ? 'Salut, moi c’est Vini ! Je vais t’apprendre à mixer. D’abord, trois questions pour préparer ton parcours.'
    : id === 'niveau' ? (r.niveau === null ? 'Tu en es où avec le mix ?' : PP_NIVEAUX.find(x => x[0] === r.niveau)[3])
    : id === 'table' ? ppTableDit()
    : 'Combien de temps par jour pour t’entraîner ?';
  if (ppBulle(texte) && !pp.attente) ppTaper(id === 'salut' ? pp.vh : $('ppVini'));
  if (!pp.attente) ppPose();
  const note = $('ppNote'), m = PP_MINUTES.find(x => x[0] === r.min);
  note.hidden = !(id === 'objectif' && m);
  if (!note.hidden){ note.innerHTML = PP_IC.plan; const t = document.createElement('span'), b = document.createElement('b');
    t.textContent = `Avec ${m[0]} min par jour, ta première vraie transition propre `; b.textContent = m[2]; t.appendChild(b); note.appendChild(t); }
  $('ppGo').disabled = !ppPret() || pp.fini;
}
$('ppGo').addEventListener('click', () => {
  if (!ppPret() || pp.fini || pp.sort) return;
  if (pp.i === 0) ppQuitteHero(); else if (pp.i === PP_ETAPES.length - 1) ppFin(); else { pp.i++; ppRender(1); }
});
$('ppBack').addEventListener('click', () => { if (pp.i > 0 && !pp.fini && !pp.sort){ pp.i--; ppRender(-1); } });
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

/* ---------- Vini réagit (lot 52) ----------
   Sa pose suit l'écran et la réponse choisie (PP_POSES) ; il fait un petit saut à chaque choix. Avec la musique, il danse calé
   sur ses temps. */
function ppPoseDe(){
  const id = PP_ETAPES[pp.i], r = pp.rep;
  if (id === 'niveau') return PP_POSES[r.niveau] || null;
  if (id === 'objectif') return PP_POSES[r.min] || null;
  if (id !== 'table') return null;
  if (ppBranchee()) return PP_POSES.branchee;
  if (r.table === 'souris') return PP_POSES.souris;
  if (r.table === 'table') return r.modele ? PP_POSES.connue : PP_POSES.ecoute;
  return midiEtat === 'question' ? PP_POSES.ecoute : null;
}
function ppPose(){
  const v = $('ppVini');
  if (PP_ETAPES[pp.i] === 'salut' || pp.vol || pp.fini) return;
  const p = ppPoseDe() || {}, cle = JSON.stringify(p);
  if (v._pose === cle) return;
  v._pose = cle; viniPose(v, p);
  if (!v.classList.contains('vn-parfait')) viniHumeur(v, p.calme ? 'calme' : 'danse');
  ppCale(v);
}
function ppSautille(){
  if (REDUCED || pp.vol) return;
  $('ppVini').animate([{ transform: 'none' }, { transform: 'translateY(-16px)', offset: .4 }, { transform: 'translateY(3px) scaleY(.95)', offset: .78 }, { transform: 'none' }],
    { duration: 380, easing: 'ease-out' });
}
// Vini danse calé sur la musique : chaque mouvement repart pile sur un temps
function ppCale(v){
  if (!ppSon.src || !v) return;
  const b = PP_TEMPS / ppSon.vitesse, c = v.classList;
  const cycle = c.contains('vn-r-lent') ? 4 : c.contains('vn-r-rapide') ? .5 : c.contains('vn-parfait') ? 2 : 1;
  v.style.setProperty('--vini-beat', b.toFixed(4) + 's'); v.style.setProperty('--vini-delay', (-(ppTemps() % cycle) * b).toFixed(3) + 's');
  const garde = [...c].filter(x => /^vn-(danse|parfait|calme|rate|r-\w+)$/.test(x));
  c.remove(...garde); void v.getBoundingClientRect(); c.add(...garde);
}

/* ---------- La bulle de Vini (lot 52) : le texte s'écrit pendant qu'il parle ----------
   La phrase est posée d'un coup, lettre par lettre, encore transparentes : la bulle a tout de suite sa taille (rien ne saute autour)
   et la phrase entière est déjà là pour les lecteurs d'écran. Puis les lettres apparaissent une à une ; toucher la bulle affiche tout. */
let ppTape = null;
// Renvoie vrai si la phrase a changé
function ppBulle(texte){
  const el = $('ppAsk');
  if (el.dataset.t === texte) return false;
  ppTapeFin(); el.dataset.t = texte; el.textContent = '';
  for (const ch of texte){ const s = document.createElement('span'); s.className = 'pp-c'; s.textContent = ch; el.appendChild(s); }
  return true;
}
// v : le Vini qui parle ; fin : appelée quand tout est écrit
function ppTaper(v, fin){
  ppTapeFin();
  const cs = [...$('ppAsk').querySelectorAll('.pp-c:not(.v)')];
  if (REDUCED || !cs.length){ cs.forEach(s => s.classList.add('v')); if (fin) fin(); return; }
  let i = 0, pause = 0;
  if (v) viniParle(v, true);
  ppTape = { v, fin, t: setInterval(() => {
    if (pause > 0){ pause--; return; }
    const c = cs[i++];
    if (!c){ const f = ppTape.fin; ppTapeFin(); if (f) f(); return; }
    c.classList.add('v');
    if ('.!?'.includes(c.textContent) && i < cs.length) pause = 7; else if (c.textContent === ',' || c.textContent === ':') pause = 3;
  }, 26) };
}
function ppTapeFin(){
  if (!ppTape) return;
  clearInterval(ppTape.t); $('ppAsk').querySelectorAll('.pp-c').forEach(s => s.classList.add('v'));
  if (ppTape.v) viniParle(ppTape.v, false);
  ppTape = null;
}
$('ppAsk').addEventListener('click', () => { if (ppTape){ const f = ppTape.fin; ppTapeFin(); if (f) f(); } });

/* ---------- Le premier écran (lot 52) : Vini sort de la platine de gauche et mixe derrière sa table ----------
   Une table dessinée (deux platines, la table de mixage, les pads). La première fois (pp-intro), elle monte et s'allume, Vini y
   tourne comme un disque, saute dehors et atterrit derrière la table (pp-derriere : le bas de son corps est caché), dit bonjour en
   agitant la main (pp-salue), puis mixe (pp-mixe) : une main scratche, l'autre tient le casque, puis passe au crossfader. */
function ppSceneSvg(){
  let pads = '', vu = '', boutons = '';
  for (let k = 0; k < 8; k++) pads += `<rect class="ps-pad ${k > 3 ? 'ps-pad-b' : 'ps-pad-a'}" style="--k:${k}" x="${(k > 3 ? 266 : 50) + (k % 4) * 24}" y="293" width="20" height="10" rx="3"/>`;
  [[191, ''], [203, ' ps-vu-d']].forEach(([x, d]) => { for (let k = 0; k < 6; k++) vu += `<rect class="ps-vu ps-vu${k} ${k > 3 ? 'ps-vu-o' : 'ps-vu-v'}${d}" x="${x}" y="${283 - k * 7}" width="6" height="5" rx="1.2"/>`; });
  [172, 228].forEach(x => [217, 231, 245].forEach(y => { boutons += `<ellipse class="ps-bouton" cx="${x}" cy="${y}" rx="5.5" ry="3.6"/><path class="ps-trait" d="M${x} ${y}v-3"/>`; }));
  const anneau = (cx, c) => `<path class="ps-lueur ${c}" d="${ppEllipse(cx, 254, 60, 32.4)}"/><path class="ps-anneau ${c}" pathLength="100" d="${ppEllipse(cx, 254, 60, 32.4)}"/>`;
  const plateau = (cx, c) => `<g transform="translate(${cx} 254) scale(1 .54)"><g class="ps-plat ${c}"><circle class="ps-plateau" r="52"/><circle class="ps-sillon" r="44"/><circle class="ps-sillon" r="35"/><rect class="ps-repere" x="-3" y="-51" width="6" height="17" rx="3"/><circle class="ps-axe" r="9"/></g></g>`;
  const bras = (c, d, x, y) => `<g class="ps-bras ${c}"><g class="ps-bras-in"><path class="vn-st vn-s-m6 ps-bras-trait" d="${d}"/><circle class="vn-cr" cx="${x}" cy="${y}" r="7.5"/></g></g>`;
  const note = (x, y, c) => `<g transform="translate(${x} ${y})"><g class="ps-note ${c}"><ellipse rx="6.5" ry="5" transform="rotate(-20)"/><rect x="4.5" y="-22" width="3" height="22" rx="1.5"/><path d="M6 -22Q16 -18 14 -8Q11 -14 6 -15Z"/></g></g>`;
  // Vini en disque sur la platine de gauche, avant de sauter : son visage tourne avec le disque
  const disque = `<g class="ps-disque" transform="translate(92 252) scale(1 .54)"><g class="ps-disque-rot"><circle class="vn-m6" r="46"/><circle class="vn-m5" r="43"/><circle class="vn-st vn-s-m6 vn-sillon" r="37"/><circle class="vn-st vn-s-m6 vn-sillon" r="31"/><circle class="vn-cr" r="24"/>
<g transform="scale(.5) translate(-120 -132)"><ellipse class="vn-ink" cx="105" cy="120" rx="7.5" ry="12.5"/><ellipse class="vn-ink" cx="135" cy="120" rx="7.5" ry="12.5"/><path class="vn-cr" d="M106.5 117 L114 106 L118 113 Z"/><path class="vn-cr" d="M136.5 117 L144 106 L148 113 Z"/><path class="vn-ink" d="M98 139 Q120 163 142 139 Q120 151 98 139 Z"/></g></g></g>`;
  return `<svg class="ps" viewBox="0 24 400 312" aria-hidden="true" focusable="false">
<defs><radialGradient id="psHalo"><stop offset="0" class="ps-halo1"/><stop offset=".6" class="ps-halo2"/><stop offset="1" class="ps-halo3"/></radialGradient>
<clipPath id="psDerriere"><rect x="-60" y="-80" width="520" height="286"/></clipPath></defs>
<ellipse class="ps-halo" cx="200" cy="150" rx="175" ry="135" fill="url(#psHalo)"/>
<g class="ps-table">
<ellipse class="ps-ombre" cx="200" cy="331" rx="194" ry="8"/><rect class="ps-face" x="8" y="224" width="384" height="104" rx="22"/><rect class="ps-haut" x="8" y="204" width="384" height="108" rx="22"/><path class="ps-reflet" d="M36 206.5H364"/>
<ellipse class="ps-bord" cx="92" cy="254" rx="66" ry="36"/><ellipse class="ps-bord" cx="308" cy="254" rx="66" ry="36"/>
${anneau(92, 'ps-a')}${anneau(308, 'ps-b')}${plateau(92, 'ps-plat-g')}${plateau(308, 'ps-plat-d')}${disque}${boutons}
<path class="ps-fente" d="M172 262V290M228 262V290M184 303H216"/><rect class="ps-cap" x="164" y="264" width="16" height="7" rx="2"/><rect class="ps-cap" x="220" y="264" width="16" height="7" rx="2"/>
${vu}<rect class="ps-cap ps-xf" x="195" y="299" width="10" height="8" rx="2"/>${pads}
<text class="ps-marque" x="200" y="323">DJINGOOD</text>
</g>
<g class="ps-vini-clip"><g class="ps-vini">${VINI_SVG.replace('<svg ', '<svg class="vini" x="-90" y="-99" width="180" height="195" overflow="visible" ')}</g></g>
${bras('ps-bg', 'M147 194Q114 204 110 240', 110, 244)}${bras('ps-boreille', 'M253 194Q300 198 285 148', 283, 142)}${bras('ps-bfader', 'M253 194Q260 252 214 297', 211, 300)}${bras('ps-bsalut', 'M253 194Q300 188 298 128', 298, 121)}
<g class="ps-notes">${note(54, 222, 'ps-n1')}${note(346, 220, 'ps-n2')}${note(198, 236, 'ps-n3')}</g>
</svg>`;
}
// La place de Vini sur la table (son cadre de 240 × 260), là où il est au repos, en pixels de la page
function ppPlaceVh(){
  const s = $('ppScene').firstElementChild; if (!s) return null;
  const r = s.getBoundingClientRect(), k = r.width / 400;
  return { left: r.left + 110 * k, top: r.top + (51 - 24) * k, width: 180 * k, height: 195 * k };
}
function ppHero(intro){
  const box = $('ppScene'), body = $('ppBody');
  box.innerHTML = ppSceneSvg(); box.hidden = false;
  const v = box.querySelector('.vini'); pp.vh = v;
  viniHumeur(v, 'calme');
  if (!intro){ viniPose(v, { bras: 'aucun', rythme: 'hoche' }); body.classList.add('pp-derriere', 'pp-mixe'); return; }
  viniPose(v, { bras: 'aucun' });
  body.classList.add('pp-intro');
  ppPlusTard(2090, () => body.classList.add('pp-derriere'));
  ppPlusTard(2420, () => {
    pp.attente = false; viniPose(v, { bras: 'aucun', rythme: 'hoche' }); body.classList.add('pp-salue');
    ppEclats(v, 16, .5);
    ppTaper(v, () => ppPlusTard(900, () => { body.classList.remove('pp-salue'); body.classList.add('pp-mixe'); }));
  });
}
// « C'est parti » : la musique démarre, la table s'en va, Vini saute jusqu'au coin
function ppQuitteHero(){
  ppMusiqueLance();
  const r = ppPlaceVh();
  if (REDUCED || !r){ pp.i++; ppRender(1); return; }
  ppAnnule(); ppTapeFin(); pp.sort = true;
  $('ppBody').classList.remove('pp-intro'); $('ppBody').classList.add('pp-sort');
  ppPlusTard(230, () => { pp.sort = false; pp.i++; ppRender(1, r); });
}
// Le saut de la table au coin : #ppVini part de la place qu'avait Vini sur la table et y saute en arc, puis il parle
function ppVol(r){
  const v = $('ppVini'), a = v.getBoundingClientRect(), b = $('ppAsk');
  const dx = r.left - a.left, dy = r.top - a.top, s = r.width / a.width;
  viniHumeur(v, 'calme'); viniPose(v, { bras: 'haut', bouche: 'ouverte' }); v._pose = null;
  b.classList.add('pp-cache');
  const an = v.animate([
    { transform: `translate(${dx}px,${dy}px) scale(${s})` },
    { transform: `translate(${dx * .45}px,${dy * .45 - 90}px) scale(${(s + 1) / 2}) rotate(-12deg)`, offset: .45 },
    { transform: 'none' }
  ], { duration: 720, easing: 'cubic-bezier(.33,.66,.4,1)' });
  pp.vol = an;
  // un onglet en arrière-plan peut retenir l'animation : au bout d'une seconde, Vini parle quand même
  const suite = () => { if (pp.vol !== an) return; pp.vol = null; an.onfinish = null; an.cancel();
    pp.attente = false; b.classList.remove('pp-cache'); b.classList.add('pp-pop'); ppSautille(); ppPose(); ppTaper(v); };
  an.onfinish = suite; ppPlusTard(1000, suite);
}

/* ---------- La barre d'avancement en forme d'onde (lot 52) ----------
   Comme l'aperçu d'un morceau dans un logiciel de DJ : une intro calme, une montée, une petite pause, puis le drop. La partie jouée
   est violette, la tête de lecture avance d'une question à l'autre et arrive au drop avec « Commencer ». */
function ppOndeSvg(drop){
  let r = '';
  for (let k = 0; k < 64; k++){
    const u = k / 63, bruit = Math.abs(Math.sin(k * 12.9898) * 43758.5453) % 1;
    const a = u < .2 ? .2 + bruit * .18 : u < .7 ? .3 + (u - .2) / .5 * .42 + bruit * .16 : u < .77 ? .16 + bruit * .1 : .8 + bruit * .2, h = 4 + a * 20;
    r += `<rect${drop && u > .77 ? ' class="pp-fort"' : ''} x="${k * 4 + .7}" y="${(13 - h / 2).toFixed(1)}" width="2.6" height="${h.toFixed(1)}" rx="1.3"/>`;
  }
  return `<svg viewBox="0 0 256 26" preserveAspectRatio="none" aria-hidden="true">${r}</svg>`;
}
function ppOndeInit(){ $('ppBar').insertAdjacentHTML('afterbegin', ppOndeSvg(false)); $('ppFill').innerHTML = ppOndeSvg(true); $('ppBar').insertAdjacentHTML('beforeend', '<b class="pp-tete"></b>'); }
function ppAvance(p){
  const f = $('ppFill'), c = `inset(0 ${100 - p}% 0 0)`, t = $('ppBar').querySelector('.pp-tete');
  f.style.clipPath = c; f.style.webkitClipPath = c; if (t) t.style.left = p + '%';
  $('ppBar').setAttribute('aria-valuenow', String(Math.round(p)));
}

/* ---------- La musique (lot 52) ----------
   Après « C'est parti », « Dj » (Play House, CC0 : le morceau de la vraie musique, à 124 BPM, coupé pile sur un temps) joue en
   boucle derrière un filtre : étouffé, comme entendu de la pièce d'à côté, il s'ouvre un peu plus à chaque question (PP_COUPURE) ;
   l'objectif du jour le ralentit ou l'accélère, comme le tempo d'une platine ; « Commencer » est le drop : le filtre s'ouvre en grand
   sur le temps suivant. Elle suit le bouton des sons (coach-sons) et s'arrête quand les questions se ferment. */
const PP_MUSIQUE = 'musique/dj-a.mp3';
const PP_TEMPS = 60 / 124;   // un temps du morceau, en secondes
const PP_COUPURE = { salut: 380, niveau: 380, table: 820, objectif: 1900 };
const PP_VITESSE = { 5: .94, 10: 1, 15: 1.07 };
const ppSon = { pret: null, src: null, filtre: null, gain: null, t0: 0, pos0: 0, vitesse: 1 };
function ppMusiquePrepare(){
  if (!ppSon.pret) ppSon.pret = fetch(PP_MUSIQUE).then(r => { if (!r.ok) throw quiet('musique ' + r.status); return r.arrayBuffer(); })
    .then(vraiDecode).catch(() => { ppSon.pret = null; return null; });
  return ppSon.pret;
}
// Appelée par un clic : le navigateur laisse alors le son partir
function ppMusiqueLance(){
  if (!sonsOn || ppSon.src || !pp.on) return;
  ensureAudio(); if (ac.state !== 'running') ac.resume();
  try { if (navigator.audioSession) navigator.audioSession.type = 'playback'; } catch (e) {}   // iPhone : le son passe même en mode silencieux
  ppMusiquePrepare().then(buf => {
    if (!buf || ppSon.src || !pp.on || pp.fini || !sonsOn) return;
    const src = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain(), t = ac.currentTime + .05;
    src.buffer = buf; src.loop = true; f.type = 'lowpass'; f.Q.value = .7; f.frequency.value = PP_COUPURE[PP_ETAPES[pp.i]];
    g.gain.value = 0; src.connect(f); f.connect(g); g.connect(master); src.start(t); g.gain.setTargetAtTime(.55, t, .3);
    Object.assign(ppSon, { src, filtre: f, gain: g, t0: t, pos0: 0, vitesse: 1 });
    if (PP_ETAPES[pp.i] === 'objectif' && pp.rep.min) ppMusiqueVitesse(pp.rep.min); else ppCale($('ppVini'));
  });
}
// Où en est le morceau, en temps (sans musique : 0)
const ppTemps = () => ppSon.src ? ppSon.pos0 + (ac.currentTime - ppSon.t0) * ppSon.vitesse / PP_TEMPS : 0;
function ppMusiqueEtape(){ if (ppSon.src && !pp.fini) ppSon.filtre.frequency.setTargetAtTime(PP_COUPURE[PP_ETAPES[pp.i]], ac.currentTime, .4); }
function ppMusiqueVitesse(min){
  const v = PP_VITESSE[min] || 1;
  if (!ppSon.src || v === ppSon.vitesse) return;
  ppSon.pos0 = ppTemps(); ppSon.t0 = ac.currentTime; ppSon.vitesse = v;
  ppSon.src.playbackRate.setValueAtTime(v, ppSon.t0); ppCale($('ppVini'));
}
function ppMusiqueArret(duree = .3){
  if (!ppSon.src) return;
  const { src, gain } = ppSon, t = ac.currentTime;
  gain.gain.cancelScheduledValues(t); gain.gain.setValueAtTime(gain.gain.value, t); gain.gain.linearRampToValueAtTime(0, t + duree);
  try { src.stop(t + duree + .05); } catch (e) {}
  ppSon.src = null; ppSon.vitesse = 1;
}
// Le drop : le filtre s'ouvre jusqu'au prochain temps (au moins 0,7 temps d'attente). Renvoie l'attente, en millisecondes.
function ppMusiqueDrop(){
  if (!ppSon.src) return 450;
  const t = ac.currentTime, b = ppTemps(), dt = (Math.ceil(b + .7) - b) * PP_TEMPS / ppSon.vitesse, f = ppSon.filtre.frequency, g = ppSon.gain.gain;
  f.cancelScheduledValues(t); f.setValueAtTime(f.value, t); f.exponentialRampToValueAtTime(16000, t + dt);
  g.cancelScheduledValues(t); g.setValueAtTime(g.value, t); g.linearRampToValueAtTime(.9, t + dt);
  return dt * 1000;
}
// Le bouton de la musique, à côté de « Passer » : c'est le même réglage que le haut-parleur de l'en-tête (coach-sons)
function ppSonRendu(){
  const b = $('ppSon');
  b.setAttribute('aria-pressed', String(sonsOn)); b.setAttribute('aria-label', sonsOn ? 'Musique : activée' : 'Musique : coupée');
  b.title = sonsOn ? 'Couper la musique' : 'Remettre la musique'; b.innerHTML = sonsIcone(sonsOn);
}
$('ppSon').addEventListener('click', () => {
  sonsOn = !sonsOn; try { localStorage.setItem('coach-sons', sonsOn ? '1' : '0'); } catch (e) {}
  renderSons(); ppSonRendu();
  if (sonsOn) ppMusiqueLance(); else ppMusiqueArret();
});
ppSonRendu();

/* ---------- Éclats (lot 52) : des notes, des étoiles et de petits vinyles, au drop et quand une table est reconnue ---------- */
const ppFx = { parts: [], raf: 0, d: 1, cols: null };
function ppEclats(el, n, force = 1){
  if (REDUCED || !el) return;
  const cv = $('ppEclats'), r = el.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height * .45;
  if (!ppFx.cols){ const cs = getComputedStyle(document.documentElement); ppFx.cols = ['--brand', '--brand-light', '--a', '--vini-spark', '--vini-cream'].map(k => cs.getPropertyValue(k).trim()); }
  if (!ppFx.raf){ ppFx.d = Math.min(2, window.devicePixelRatio || 1); cv.width = innerWidth * ppFx.d; cv.height = innerHeight * ppFx.d; }
  const formes = ['note', 'etoile', 'disque', 'bande'];
  for (let i = 0; i < n; i++){
    const a = -Math.PI / 2 + (Math.random() - .5) * Math.PI * 1.3, vit = (4 + Math.random() * 9) * force;
    ppFx.parts.push({ x, y, vx: Math.cos(a) * vit, vy: Math.sin(a) * vit - 1.5 * force, r: Math.random() * 6.28, vr: (Math.random() - .5) * .3, t: 0,
      vie: 60 + Math.random() * 45, s: 5 + Math.random() * 6, c: ppFx.cols[i % 4], f: formes[(Math.random() * formes.length) | 0] });
  }
  if (!ppFx.raf) ppFx.raf = requestAnimationFrame(ppEclatsPas);
}
function ppEclatsPas(){
  const g = $('ppEclats').getContext('2d');
  g.setTransform(ppFx.d, 0, 0, ppFx.d, 0, 0); g.clearRect(0, 0, innerWidth, innerHeight);
  ppFx.parts = ppFx.parts.filter(p => p.t < p.vie);
  for (const p of ppFx.parts){
    p.t++; p.vy += .3; p.vx *= .985; p.vy *= .985; p.x += p.vx; p.y += p.vy; p.r += p.vr;
    const s = p.s;
    g.save(); g.globalAlpha = Math.min(1, (p.vie - p.t) / 22); g.translate(p.x, p.y); g.rotate(p.r); g.fillStyle = p.c; g.strokeStyle = p.c;
    if (p.f === 'note'){ g.beginPath(); g.ellipse(0, 0, s * .62, s * .46, -.35, 0, 6.29); g.fill(); g.fillRect(s * .4, -s * 1.9, s * .24, s * 1.9);
      g.beginPath(); g.moveTo(s * .52, -s * 1.9); g.quadraticCurveTo(s * 1.4, -s * 1.6, s * 1.2, -s * .9); g.lineWidth = s * .2; g.stroke(); }
    else if (p.f === 'etoile'){ g.beginPath(); for (let k = 0; k < 10; k++){ const rr = k % 2 ? s * .42 : s, aa = k * Math.PI / 5; g.lineTo(Math.cos(aa) * rr, Math.sin(aa) * rr); } g.closePath(); g.fill(); }
    else if (p.f === 'disque'){ g.beginPath(); g.arc(0, 0, s * .8, 0, 6.29); g.fill(); g.fillStyle = ppFx.cols[4]; g.beginPath(); g.arc(0, 0, s * .3, 0, 6.29); g.fill(); }
    else g.fillRect(-s * .5, -s * .18, s, s * .36);
    g.restore();
  }
  ppFx.raf = ppFx.parts.length ? requestAnimationFrame(ppEclatsPas) : 0;
  if (!ppFx.raf) g.clearRect(0, 0, innerWidth, innerHeight);
}
// Le drop : un éclair de lumière, une onde qui part de Vini, et les éclats
function ppDrop(v){
  if (REDUCED) return;
  const r = v.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height * .45;
  const f = document.createElement('i'), c = document.createElement('i');
  f.className = 'pp-flash'; f.style.setProperty('--x', x + 'px'); f.style.setProperty('--y', y + 'px');
  c.className = 'pp-choc'; c.style.left = x + 'px'; c.style.top = y + 'px';
  $('pp').append(f, c); setTimeout(() => { f.remove(); c.remove(); }, 900);
  ppEclats(v, 130, 1.15);
}
