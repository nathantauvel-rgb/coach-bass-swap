// Page « Ma table » : schéma de la DDJ-FLX4, explication de chaque commande, réaction en direct, réglages.
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
  cfx: ['Potard CFX, le filtre', 'Un filtre : vers la droite le son s\'affine, vers la gauche il s\'étouffe, au milieu il ne fait rien.'],
  casque: ['Bouton CUE du casque', 'Envoie ce morceau dans ton casque, pour le préparer sans que le public l\'entende.'],
  fader: ['Fader de volume', 'Le volume du morceau dans les enceintes. Tout en bas, on ne l\'entend plus.'],
  cross: ['Crossfader', 'Glisse d\'un morceau à l\'autre en un seul geste : à gauche la platine A, à droite la platine B.'],
  fx: ['Bouton ON de l\'effet', 'Active l\'effet choisi sur la table, par exemple un écho.']
};
// Réglage MIDI de chaque commande du schéma, quand il y en a un
const TKEY = { faderA: 'faderA', faderB: 'faderB', lowA: 'lowA', lowB: 'lowB', midA: 'midA', midB: 'midB', cfxA: 'cfxA', playA: 'playA', playB: 'playB', fx: 'fxOn' };
const tKind = id => id === 'cross' || id === 'fx' ? id : id.slice(0, -1);
const tSide = id => id === 'cross' || id === 'fx' ? '' : id.slice(-1);
const tName = id => TKINDS[tKind(id)][0] + (tSide(id) ? ' ' + tSide(id) : '');
// Niveaux qui se servent d'une commande, lus dans les niveaux eux-mêmes
function usedIn(key){ const out = []; if (!key) return out;
  for (const [list, pre] of [[BASE_LESSONS, ''], [CH3_LESSONS, 'chapitre 3, ']]) list.forEach(l => { if (l.user.includes(key) || (key === 'playB' && !l.autoLaunch) || (key === 'fxOn' && l.btn.includes('echo'))) out.push(pre + l.title); });
  return out; }
let tableSel = '', tableLive = {}, tableNote = '', tableReset = false, tableTimer = {};
function tableSvg(){
  const g = (id, inner) => `<g class="tc t${tSide(id).toLowerCase() || 'm'}${usedIn(TKEY[id]).length ? ' site' : ''}" data-c="${id}" tabindex="0" role="button" aria-label="${tName(id).replace(/"/g, '')}">${inner}</g>`;
  const knob = (id, cx, cy) => g(id, `<circle cx="${cx}" cy="${cy}" r="17"/><line class="mk" x1="${cx}" y1="${cy - 5}" x2="${cx}" y2="${cy - 14}"/>`);
  let s = '<rect class="body" x="10" y="10" width="300" height="420" rx="18"/><rect class="body" x="330" y="10" width="260" height="420" rx="18"/><rect class="body" x="610" y="10" width="300" height="420" rx="18"/>';
  for (const [side, dx] of [['A', 0], ['B', 600]]){
    s += `<text class="tt" x="${dx + 210}" y="47" text-anchor="middle">PLATINE ${side}</text>`;
    s += g('sync' + side, `<rect x="${dx + 30}" y="28" width="84" height="28" rx="14"/><text x="${dx + 72}" y="47" text-anchor="middle">SYNC</text>`);
    s += g('jog' + side, `<circle cx="${dx + 150}" cy="165" r="88"/><circle class="in" cx="${dx + 150}" cy="165" r="26"/>`);
    s += g('tempo' + side, `<rect x="${dx + 268}" y="90" width="18" height="150" rx="9"/><rect class="cap" x="${dx + 262}" y="156" width="30" height="14" rx="4"/>`);
    s += g('cue' + side, `<circle cx="${dx + 50}" cy="318" r="21"/><text x="${dx + 50}" y="322" text-anchor="middle">CUE</text>`);
    s += g('play' + side, `<circle cx="${dx + 50}" cy="378" r="21"/><path class="mkf" d="M${dx + 44} 369v18l15-9z"/>`);
    let pads = `<rect class="hit" x="${dx + 94}" y="291" width="188" height="108" rx="12"/>`; for (let r = 0; r < 2; r++) for (let c = 0; c < 4; c++) pads += `<rect x="${dx + 100 + c * 46}" y="${297 + r * 54}" width="38" height="42" rx="8"/>`;
    s += g('pads' + side, pads);
  }
  [['TRIM', 49], ['HI', 99], ['MID', 149], ['LOW', 199], ['CFX', 254], ['CASQUE', 298], ['VOLUME', 362]].forEach(([t, y]) => { s += `<text class="tt" x="460" y="${y}" text-anchor="middle">${t}</text>`; });
  for (const [side, cx] of [['A', 400], ['B', 520]]){
    s += knob('trim' + side, cx, 45) + knob('hi' + side, cx, 95) + knob('mid' + side, cx, 145) + knob('low' + side, cx, 195) + knob('cfx' + side, cx, 250);
    s += g('casque' + side, `<rect x="${cx - 22}" y="283" width="44" height="22" rx="7"/>`);
    s += g('fader' + side, `<rect x="${cx - 8}" y="318" width="16" height="80" rx="8"/><rect class="cap" x="${cx - 17}" y="344" width="34" height="14" rx="4"/>`);
  }
  s += g('cross', '<rect x="420" y="410" width="80" height="12" rx="6"/><rect class="cap" x="452" y="405" width="16" height="22" rx="4"/>');
  s += g('fx', '<rect x="546" y="31" width="38" height="28" rx="8"/><text x="565" y="50" text-anchor="middle">ON</text>');
  return s;
}
const tablePos = k => MIDI_CC.includes(k) ? (phys[k] != null ? `Position : ${Math.round(phys[k] * 100)} %` : '') : '';
function renderTable(){
  const svg = $('tSvg'); if (!svg.firstChild) svg.innerHTML = tableSvg();
  $('tState').textContent = midiCount ? `Table branchée : ${$('midiPill').lastElementChild.textContent}. Bouge une commande pour la voir réagir.` : 'Aucune table branchée : tu peux lire les explications, et brancher ta FLX4 pour voir les commandes réagir.';
  svg.querySelectorAll('.tc').forEach(el => { el.classList.toggle('sel', el.dataset.c === tableSel); el.setAttribute('aria-pressed', String(el.dataset.c === tableSel)); });
  $('tNote').textContent = tableNote;
  const box = $('tPanel'); box.innerHTML = '';
  const add = (tag, cls, txt) => { const e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; box.appendChild(e); return e; };
  if (!tableSel){ add('strong', '', 'Choisis une commande'); add('p', '', 'Clique sur une commande du schéma pour savoir à quoi elle sert. En couleur : celles que le site utilise dans ses niveaux.'); }
  else { const key = TKEY[tableSel], used = usedIn(key), m = key ? map[key] : null;
    add('strong', '', tName(tableSel)); add('p', '', TKINDS[tKind(tableSel)][1]);
    add('p', 'tuse', used.length ? 'Utilisée dans : ' + used.join(' · ') + '.' : key ? 'Reconnue par le site, mais aucun niveau ne s\'en sert pour l\'instant.' : 'Pas encore utilisée par le site.');
    if (key){
      const live = tableLive[tableSel] || tablePos(key); if (live || midiCount) add('p', 'tlive', live || 'Bouge-la sur ta table pour la voir réagir.');
      const def = DEFAULT_MAP[key], same = m && def && m.ch === def.ch && m.n === def.n;
      add('p', 'tmap', m ? `Réglage : canal ${m.ch + 1}, numéro ${m.n}${same ? ' (d\'origine)' : def ? ' (appris)' : ''}.` : 'Pas encore réglée : clique sur « Apprendre », puis bouge-la sur ta table.');
      const b = add('button', 'ghost', learnKey === key ? (MIDI_NOTE.includes(key) ? 'Appuie dessus sur ta table… (annuler)' : 'Bouge-la sur ta table… (annuler)') : m ? 'Réapprendre cette commande' : 'Apprendre cette commande'); b.type = 'button'; b.id = 'tLearn';
      b.addEventListener('click', () => { learnKey = learnKey === key ? null : key; tableNote = ''; renderTable(); });
    } }
  const r = $('tReset'); r.textContent = tableReset ? 'Confirmer : effacer mes réglages appris' : 'Revenir aux réglages d\'origine';
}
function tableSelect(id){ if (!TKINDS[tKind(id)]) return; if (learnKey) learnKey = null; tableSel = id; tableReset = false; renderTable(); }
// Une commande connue vient de bouger sur la table : on la montre et on l'allume un instant
function tableSeen(key, txt){
  const id = Object.keys(TKEY).find(x => TKEY[x] === key); if (!id) return;
  tableLive[id] = txt; tableNote = ''; tableSel = id; tableReset = false; renderTable();
  const el = $('tSvg').querySelector(`[data-c="${id}"]`); if (el){ el.classList.add('live'); clearTimeout(tableTimer[id]); tableTimer[id] = setTimeout(() => el.classList.remove('live'), 700); }
}
function tableMidi(type, ch, d1, d2, val){
  if (type === 0xB0){ if (d1 >= 32 && d1 < 64) return;
    const k = MIDI_CC.find(x => midiSame(map[x], ch, d1));
    if (k){ phys[k] = val; tableSeen(k, `Position : ${Math.round(val * 100)} %`); } else { tableNote = `Commande reçue mais pas encore utilisée par le site (potard ou fader, canal ${ch + 1}, numéro ${d1}).`; $('tNote').textContent = tableNote; } }
  else if (type === 0x90 && d2 > 0){ const k = MIDI_NOTE.find(x => midiSame(map[x], ch, d1));
    if (k) tableSeen(k, 'Appuyée !'); else { tableNote = `Commande reçue mais pas encore utilisée par le site (bouton, canal ${ch + 1}, numéro ${d1}).`; $('tNote').textContent = tableNote; } }
}
$('tSvg').addEventListener('click', e => { const el = e.target.closest('.tc'); if (el) tableSelect(el.dataset.c); });
$('tSvg').addEventListener('keydown', e => { const el = e.target.closest('.tc'); if (el && (e.key === 'Enter' || e.key === ' ')){ e.preventDefault(); tableSelect(el.dataset.c); } });
$('tReset').addEventListener('click', () => {
  if (!tableReset){ tableReset = true; renderTable(); return; }
  tableReset = false; learnKey = null; map = cleanMap(null); try { localStorage.removeItem('coach-midi-map'); } catch (e) {}
  tableNote = 'Réglages d\'origine rétablis. Le filtre CFX et le bouton d\'effet seront à réapprendre.'; updateSetup(); renderTable();
});
