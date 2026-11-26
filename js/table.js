// Page « Ma table » : schéma simplifié d'une table (sur le modèle de la DDJ-FLX4), explication de chaque commande,
// réaction en direct, réglages, et préparation pas à pas d'une autre table (reglage.js).
// Tous les fichiers de js/ partagent la même portée et sont chargés dans l'ordre indiqué dans index.html.
'use strict';
/* ---------- Ma table ----------
   Le schéma est un dessin simplifié fait pour le site (pas une reproduction de la table). Seules les commandes
   qui ont un réglage MIDI (MIDI_CC et MIDI_NOTE dans midi.js) réagissent en direct ; les autres sont expliquées
   et marquées « pas encore utilisée ». Sur cette page, les messages de la table ne pilotent pas les niveaux
   (voir onMidi) : ils servent seulement à montrer ce qui bouge. */
const TKINDS = {
  sync: ['BEAT SYNC', 'Cale automatiquement le tempo de cette platine sur l\'autre. Pratique pour débuter : tu te concentres sur le bon moment et sur tes gestes.'],
  jog: ['Jog, le grand plateau', 'Pousse ou retient le morceau pour le recaler à la main, et sert à se déplacer dedans quand il est à l\'arrêt.'],
  tempo: ['Fader de tempo', 'Accélère ou ralentit le morceau. C\'est avec lui qu\'on met deux morceaux à la même vitesse quand on n\'utilise pas BEAT SYNC.'],
  cue: ['Bouton CUE', 'Pose un point de départ dans le morceau et y revient. Morceau à l\'arrêt, il le fait jouer tant que tu restes appuyé.'],
  play: ['Bouton PLAY', 'Lance ou arrête le morceau de cette platine.'],
  pads: ['Pads', 'Huit touches sous le plateau. En mode HOT CUE, chacune garde un repère dans le morceau et y saute d\'un appui.'],
  trim: ['Potard TRIM', 'Règle le niveau d\'entrée du morceau, pour que deux morceaux aient la même force avant de les mélanger.'],
  hi: ['Potard HI', 'Les aigus : charleys, cymbales, tout ce qui brille dans le morceau.'],
  mid: ['Potard MID', 'Les médiums : les voix et les mélodies. À couper sur un morceau quand l\'autre chante.'],
  low: ['Potard LOW', 'Les basses : grosse caisse et ligne de basse. Deux basses en même temps, ça fait de la bouillie : c\'est le potard clé des transitions.'],
  cfx: ['Le filtre (CFX sur la FLX4)', 'Un filtre : vers la droite le son s\'affine, vers la gauche il s\'étouffe, à midi (neutre) il ne fait rien.'],
  casque: ['Bouton CUE du casque', 'Envoie ce morceau dans ton casque, pour le préparer sans que le public l\'entende.'],
  fader: ['Fader de volume', 'Le volume du morceau dans les enceintes. Tout en bas, on ne l\'entend plus.'],
  cross: ['Crossfader', 'Glisse d\'un morceau à l\'autre en un seul geste : à gauche la platine A, à droite la platine B.'],
  fx: ['Bouton ON de l\'effet', 'Active l\'effet choisi sur la table, par exemple un écho.']
};
// Réglage MIDI de chaque commande du schéma, quand il y en a un
const TKEY = { faderA: 'faderA', faderB: 'faderB', lowA: 'lowA', lowB: 'lowB', midA: 'midA', midB: 'midB', cfxA: 'cfxA', playA: 'playA', playB: 'playB', fx: 'fxOn',
  // lot 39 : la table complète
  hiA: 'hiA', hiB: 'hiB', trimA: 'trimA', trimB: 'trimB', cfxB: 'cfxB', cross: 'xfader', tempoA: 'tempoA', tempoB: 'tempoB', cueA: 'cueA', cueB: 'cueB', casqueA: 'pflA', casqueB: 'pflB' };
const tKind = id => id === 'cross' || id === 'fx' ? id : id.slice(0, -1);
const tSide = id => id === 'cross' || id === 'fx' ? '' : id.slice(-1);
const tName = id => TKINDS[tKind(id)][0] + (tSide(id) ? ' ' + tSide(id) : '');
// Niveaux qui se servent d'une commande, lus dans les niveaux eux-mêmes
function usedIn(key){ const out = []; if (!key) return out;
  for (const [list, pre] of [[BASE_LESSONS, ''], [CH3_LESSONS, 'chapitre 3, '], [CH4_LESSONS, 'chapitre 4, ']]) list.forEach(l => { if (l.user.includes(key) || (key === 'playB' && !l.autoLaunch) || (key === 'fxOn' && l.btn.includes('echo'))) out.push(pre + l.title); });
  return out; }
let tableSel = '', tableLive = {}, tableNote = '', tableReset = false, tableTimer = {};
/* Lot 92 « Trois choses en moins » (diagnostic UX du 26 nov. 2026) : le canal, le numéro MIDI et « Réapprendre » sont du
   vocabulaire technique pour un débutant. Ils sont rangés sous « Réglages avancés » (#tAvance), replié ; tableAvance garde
   son état pendant la visite (le panneau est refait à chaque mouvement de la table) : il est relu sur le repli lui-même
   juste avant d'en avoir besoin (l'événement « toggle » arrive un instant après le clic, trop tard si la table parle tout de
   suite). La note d'une commande que le site n'utilise pas ne donne son canal et son numéro que s'il est ouvert.
   tableApprend : la commande qu'on apprend depuis cette page et son réglage d'avant, pour dire « C'est appris » (la ligne du
   réglage, elle, est repliée). */
let tableAvance = false, tableApprend = null, tableAppris = '';
const TABLE_APPRIS = 'C’est appris : le site reconnaît maintenant cette commande.';
const tableAvanceLu = () => { const d = $('tAvance'); if (d) tableAvance = d.open; return tableAvance; };
const tableInconnue = (genre, ch, n) => tableAvanceLu() ? `Commande reçue mais pas encore utilisée par le site (${genre}, canal ${ch + 1}, numéro ${n}).`
  : 'Commande reçue, mais le site ne s’en sert pas encore.';
function tableSvg(){
  const g = (id, inner) => `<g class="tc t${tSide(id).toLowerCase() || 'm'}${usedIn(TKEY[id]).length ? ' site' : ''}" data-c="${id}" tabindex="0" role="button" aria-label="${tName(id).replace(/"/g, '')}">${inner}</g>`;
  const knob = (id, cx, cy) => g(id, `<circle cx="${cx}" cy="${cy}" r="17"/><line class="mk" x1="${cx}" y1="${cy - 5}" x2="${cx}" y2="${cy - 14}"/>`);
  let s = '<rect class="body" x="10" y="10" width="300" height="420" rx="18"/><rect class="body" x="330" y="10" width="260" height="420" rx="18"/><rect class="body" x="610" y="10" width="300" height="420" rx="18"/>';
  for (const [side, dx] of [['A', 0], ['B', 600]]){
    s += `<text class="tt" x="${dx + 210}" y="47" text-anchor="middle">PLATINE ${side}</text>`;
    s += g('sync' + side, `<rect x="${dx + 30}" y="28" width="84" height="28" rx="14"/><text x="${dx + 72}" y="47" text-anchor="middle">SYNC</text>`);
    s += g('jog' + side, `<circle cx="${dx + 150}" cy="165" r="88"/><circle class="sl" cx="${dx + 150}" cy="165" r="72"/><circle class="sl" cx="${dx + 150}" cy="165" r="58"/><circle class="sl" cx="${dx + 150}" cy="165" r="44"/><circle class="in" cx="${dx + 150}" cy="165" r="26"/>`);   // lot 63 : les sillons
    s += g('tempo' + side, `<rect x="${dx + 268}" y="90" width="18" height="150" rx="9"/><rect class="cap" x="${dx + 262}" y="156" width="30" height="14" rx="4"/>`);
    s += g('cue' + side, `<circle cx="${dx + 50}" cy="318" r="21"/><text x="${dx + 50}" y="322" text-anchor="middle">CUE</text>`);
    s += g('play' + side, `<circle cx="${dx + 50}" cy="378" r="21"/><path class="mkf" d="M${dx + 44} 369v18l15-9z"/>`);
    let pads = `<rect class="hit" x="${dx + 94}" y="291" width="188" height="108" rx="12"/>`; for (let r = 0; r < 2; r++) for (let c = 0; c < 4; c++) pads += `<rect x="${dx + 100 + c * 46}" y="${297 + r * 54}" width="38" height="42" rx="8"/>`;
    s += g('pads' + side, pads);
  }
  [['TRIM', 49], ['HI', 99], ['MID', 149], ['LOW', 199], ['FILTRE', 254], ['CASQUE', 298], ['VOLUME', 362]].forEach(([t, y]) => { s += `<text class="tt" x="460" y="${y}" text-anchor="middle">${t}</text>`; });
  for (const [side, cx] of [['A', 400], ['B', 520]]){
    s += knob('trim' + side, cx, 45) + knob('hi' + side, cx, 95) + knob('mid' + side, cx, 145) + knob('low' + side, cx, 195) + knob('cfx' + side, cx, 250);
    s += g('casque' + side, `<rect x="${cx - 22}" y="283" width="44" height="22" rx="7"/>`);
    s += g('fader' + side, `<rect x="${cx - 8}" y="318" width="16" height="80" rx="8"/><rect class="cap" x="${cx - 17}" y="344" width="34" height="14" rx="4"/>`);
  }
  s += g('cross', '<rect x="420" y="410" width="80" height="12" rx="6"/><rect class="cap" x="452" y="405" width="16" height="22" rx="4"/>');
  s += g('fx', '<rect x="546" y="31" width="38" height="28" rx="8"/><text x="565" y="50" text-anchor="middle">ON</text>');
  return s;
}
// Le schéma suit la table : fader à sa vraie hauteur, repère du potard tourné (v de 0 à 1)
function tableSchemaSet(key, v){
  const id = Object.keys(TKEY).find(x => TKEY[x] === key), el = id && $('tSvg').querySelector(`[data-c="${id}"]`); if (!el || v == null) return;
  if (key.startsWith('fader')) el.querySelector('.cap').setAttribute('y', (318 + (1 - v) * 66).toFixed(1));
  else if (key.startsWith('tempo')) el.querySelector('.cap').setAttribute('y', (90 + (1 - v) * 136).toFixed(1));
  else if (key === 'xfader') el.querySelector('.cap').setAttribute('x', (420 + v * 64).toFixed(1));
  else { const c = el.querySelector('circle'), mk = el.querySelector('.mk'); mk.setAttribute('transform', `rotate(${(-135 + 270 * v).toFixed(1)} ${c.getAttribute('cx')} ${c.getAttribute('cy')})`); }
}
const tablePos = k => MIDI_CC.includes(k) ? (phys[k] != null ? `Position : ${Math.round(phys[k] * 100)} %` : '') : '';
function renderTable(){
  const svg = $('tSvg'); if (!svg.firstChild) svg.innerHTML = tableSvg();
  for (const k of MIDI_CC) tableSchemaSet(k, phys[k]);
  const et = tableEtat(), nom = midiNames.join(', ');
  $('tState').textContent = !midiCount ? 'Branche ta table : les commandes réagissent.'
    : et === 'nouvelle' ? `Table branchée : ${nom}. Elle n'est pas encore réglée : clique sur « Régler ma table pas à pas », puis bouge chaque commande quand le site te le demande.`
    : et === 'flx4' ? `Table branchée : ${nom}. Les réglages sont encore ceux de ton autre table : clique sur « Revenir aux réglages de la DDJ-FLX4 ».`
    : et === 'connue' ? `Table branchée : ${nom}. DJingood connaît ses réglages, mais ceux en place sont ceux de ta table réglée à la main : clique sur « ${tableResetTxt()} », en bas de la page.`
    : tableCfg && tableCfg.modele ? `Table branchée : ${nom}, reconnue toute seule. Ses réglages viennent de sa documentation et n'ont pas encore été vérifiés sur une vraie table : si une commande ne répond pas, « Vérifier ma table » le dira, et tu peux la réapprendre.`
    : `Table branchée : ${nom}${tableCfg ? ' (réglée pas à pas)' : ''}. Bouge une commande pour la voir réagir.`;
  // « Ta table n'apparaît pas ? » (lot 45) : ouverte quand aucune table n'est vue, repliée sinon (« Ta table ne réagit pas ? »)
  const aide = midiAideRemplir($('tAideBody')), ta = $('tAide'), cle = midiEtat + (midiCount ? '+' : '');
  $('tAideSum').textContent = aide.titre; if (ta.dataset.k !== cle){ ta.dataset.k = cle; ta.open = !midiCount; }
  $('tKick').textContent = tableCfg || (midiCount && !midiNames.some(isFlx4)) || !midiCount ? 'Ta table' : 'Ta DDJ-FLX4';
  $('tReg').hidden = !midiCount; renderVerifBtn();
  svg.querySelectorAll('.tc').forEach(el => { el.classList.toggle('sel', el.dataset.c === tableSel); el.setAttribute('aria-pressed', String(el.dataset.c === tableSel)); });
  // lot 92 : l'apprentissage commencé ici vient de finir et le réglage a changé : on le dit (midi.js vient de vider la note)
  if (tableApprend && learnKey !== tableApprend.k){
    if (!learnKey && map[tableApprend.k] !== tableApprend.avant){ tableNote = TABLE_APPRIS; tableAppris = tableApprend.k; }   // midi.js pose toujours un réglage neuf, même pour la même commande
    tableApprend = null; }
  $('tNote').textContent = tableNote;
  tableAvanceLu();   // lot 92 : l'état du repli, lu avant de refaire le panneau
  const box = $('tPanel'); box.innerHTML = '';
  const add = (tag, cls, txt, dans = box) => { const e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; dans.appendChild(e); return e; };
  if (!tableSel){ add('strong', '', 'Choisis une commande'); add('p', '', 'Clique sur une commande du schéma pour savoir à quoi elle sert. En couleur : celles que le site utilise dans ses niveaux.'); }
  else { const key = TKEY[tableSel], used = usedIn(key), m = key ? map[key] : null;
    add('strong', '', tName(tableSel)); add('p', '', TKINDS[tKind(tableSel)][1]);
    add('p', 'tuse', used.length ? 'Utilisée dans : ' + used.join(' · ') + '.' : key ? 'Reconnue par le site, mais aucun niveau ne s\'en sert pour l\'instant.' : 'Pas encore utilisée par le site.');
    // Table branchée mais pas encore réglée (ou FLX4 avec les réglages d'une autre table) : on règle d'abord tout, pas à pas
    if (key && midiCount && !tableOn()) add('p', 'tmap', tableEtat() === 'flx4' ? 'Reprends d\'abord les réglages de la DDJ-FLX4 (bouton en bas de la page).' : 'Règle d\'abord ta table : clique sur « Régler ma table pas à pas », en bas de la page.');
    else if (key){
      // lot 92 : « Bouge-la… » seulement pour une commande réglée (pas encore réglée, elle ne peut pas réagir : « Apprendre » suit)
      const live = tableLive[tableSel] || tablePos(key); if (live || (midiCount && m)) add('p', 'tlive', live || 'Bouge-la sur ta table pour la voir réagir.');
      // le réglage d'origine : celui de la fiche de la table, ou de la FLX4 ; une table réglée à la main n'en a pas
      const fi = tableCfg && tableCfg.modele ? modeleId(tableCfg.modele) : null, fc = fi && fi.cmd[key];
      const def = fi ? (fc ? { ch: fc[0], n: fc[1] } : null) : tableCfg ? null : DEFAULT_MAP[key], same = m && def && m.ch === def.ch && m.n === def.n;
      // lot 92 : une commande réglée range son canal, son numéro et « Réapprendre » sous « Réglages avancés », replié ; une
      // commande pas encore réglée garde « Apprendre » en vue (le filtre A d'une FLX4 : le débutant en a besoin)
      let ici = box;
      if (m){ const d = add('details', 'tavance'); d.id = 'tAvance'; d.open = tableAvance;
        add('summary', '', 'Réglages avancés', d); ici = add('div', 'tavance-in', null, d); }
      add('p', 'tmap', m ? `Réglage : canal ${m.ch + 1}, numéro ${m.n}${same ? ' (d\'origine)' : def || tableCfg ? ' (appris)' : ''}.` : tableCfg ? 'Pas sur ta table : tu la fais à l\'écran. Si ta table l\'a, clique sur « Apprendre », puis bouge-la.' : 'Pas encore réglée : clique sur « Apprendre », puis bouge-la sur ta table.', ici);
      const b = add('button', 'ghost', learnKey === key ? (MIDI_NOTE.includes(key) ? 'Appuie dessus sur ta table… (annuler)' : 'Bouge-la sur ta table… (annuler)') : m ? 'Réapprendre cette commande' : 'Apprendre cette commande', ici); b.type = 'button'; b.id = 'tLearn';
      b.addEventListener('click', () => { learnKey = learnKey === key ? null : key; tableApprend = learnKey ? { k: key, avant: map[key] } : null; tableNote = ''; renderTable(); });
    } }
  const r = $('tReset'); r.textContent = tableReset ? 'Confirmer : effacer mes réglages appris' : tableResetTxt();
}
// Le bouton du bas : la fiche de la table branchée (si les réglages en place sont ceux d'une table réglée à la main),
// sinon les réglages d'origine de la table reconnue, sinon ceux de la DDJ-FLX4
// (ou, lot 55, la fiche d'une table réglée à la main avant que DJingood la connaisse : ficheNouvelle dans midi.js)
const tableResetModele = () => tableEtat() === 'connue' ? modeleDe(midiNames.find(modeleDe)) : ficheNouvelle() || (tableCfg && tableCfg.modele ? modeleId(tableCfg.modele) : null);
function tableResetTxt(){ const fi = tableResetModele();
  return tableEtat() === 'connue' || ficheNouvelle() ? `Prendre les réglages de la ${fi.nom}` : fi ? `Revenir aux réglages d'origine de la ${fi.nom}` : tableCfg ? 'Revenir aux réglages de la DDJ-FLX4' : 'Revenir aux réglages d\'origine'; }
// « Apprendre » refuse une commande déjà réglée ailleurs (une commande de la table ne pilote qu'une chose) : il le dit (lot 55)
function tableDejaPris(k){ const id = Object.keys(TKEY).find(x => TKEY[x] === k), nom = id ? tName(id) : k;
  tableNote = `Ça, c'est déjà le réglage de « ${nom} » : une même commande de ta table ne peut pas servir à deux endroits. Bouge celle que tu veux régler, ou refais « Régler ma table pas à pas » pour tout remettre en ordre.`;
  $('tNote').textContent = tableNote; }
function tableSelect(id){ if (!TKINDS[tKind(id)]) return; if (learnKey) learnKey = null; tableApprend = null; tableSel = id; tableReset = false; renderTable(); }
// Une commande connue vient de bouger sur la table : on la montre et on l'allume un instant
function tableSeen(key, txt){
  const id = Object.keys(TKEY).find(x => TKEY[x] === key); if (!id) return;
  // lot 92 : un potard qu'on vient d'apprendre tourne encore : « C'est appris » reste tant que c'est lui qui bouge (gardien)
  tableLive[id] = txt; if (tableNote !== TABLE_APPRIS || key !== tableAppris) tableNote = ''; tableSel = id; tableReset = false; renderTable();
  const el = $('tSvg').querySelector(`[data-c="${id}"]`); if (el){ el.classList.add('live'); clearTimeout(tableTimer[id]); tableTimer[id] = setTimeout(() => el.classList.remove('live'), 700); }
}
function tableMidi(type, ch, d1, d2, val){
  if (type === 0xB0){ const kb = MIDI_NOTE.find(x => map[x] && map[x].cc && midiSame(map[x], ch, d1)); if (kb){ if (d2 >= 64) tableSeen(kb, 'Appuyée !'); return; }
    const k = MIDI_CC.find(x => midiSame(map[x], ch, d1)); if (!k && msgFin(d1)) return;
    if (k){ phys[k] = val; tableSeen(k, `Position : ${Math.round(val * 100)} %`); } else { tableNote = tableInconnue('potard ou fader', ch, d1); $('tNote').textContent = tableNote; } }
  else if (type === 0x90 && d2 > 0){ const k = MIDI_NOTE.find(x => map[x] && !map[x].cc && midiSame(map[x], ch, d1));
    if (k) tableSeen(k, 'Appuyée !'); else { tableNote = tableInconnue('bouton', ch, d1); $('tNote').textContent = tableNote; } }
}
// Retour aux réglages de la DDJ-FLX4 : on oublie aussi l'autre table réglée pas à pas
function flx4Map(){ map = cleanMap(null); tableCfg = null; for (const k of Object.keys(phys)) delete phys[k];
  try { localStorage.removeItem('coach-midi-map'); localStorage.removeItem('coach-table'); } catch (e) {}
  renderPill(); updateSetup(); renderTableBar(); }
$('tReg').addEventListener('click', () => { tableApprend = null; openReg(); });
$('tVerif').addEventListener('click', () => { tableApprend = null; });   // lot 92 : « Vérifier ma table » (verif.js) arrête aussi l'apprentissage
$('tSvg').addEventListener('click', e => { const el = e.target.closest('.tc'); if (el) tableSelect(el.dataset.c); });
$('tSvg').addEventListener('keydown', e => { const el = e.target.closest('.tc'); if (el && (e.key === 'Enter' || e.key === ' ')){ e.preventDefault(); tableSelect(el.dataset.c); } });
$('tReset').addEventListener('click', () => {
  if (!tableReset){ tableReset = true; renderTable(); return; }
  const fi = tableResetModele(), autre = !!tableCfg; tableReset = false; learnKey = null; tableApprend = null;
  if (fi){ modeleApply(tableEtat() === 'connue' ? midiNames.find(modeleDe) : tableCfg.nom); renderPill(); updateSetup(); renderTableBar(); tableNote = `Réglages de la ${fi.nom} en place.`; renderTable(); return; }
  flx4Map();
  tableNote = (autre ? 'Réglages de la DDJ-FLX4 rétablis.' : 'Réglages d\'origine rétablis.') + ' Le filtre et le bouton d\'effet seront à réapprendre.'; renderTable();
});
