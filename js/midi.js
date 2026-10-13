// DDJ-FLX4 : liaison Web MIDI et mise en place de la table.
// Tous les fichiers de js/ partagent la même portée et sont chargés dans l'ordre indiqué dans index.html.
'use strict';
/* ---------- FLX4 (MIDI) ---------- */
const DEFAULT_MAP = { faderA: { ch: 0, n: 19 }, faderB: { ch: 1, n: 19 }, lowA: { ch: 0, n: 15 }, lowB: { ch: 1, n: 15 }, midA: { ch: 0, n: 11 }, midB: { ch: 1, n: 11 }, playA: { ch: 0, n: 11 }, playB: { ch: 1, n: 11 } };
// Potards et faders d'un côté, boutons de l'autre : deux contrôles d'un même groupe ne peuvent pas partager un numéro.
const MIDI_CC = ['faderA', 'faderB', 'lowA', 'lowB', 'cfxA', 'midA', 'midB'], MIDI_NOTE = ['playA', 'playB', 'fxOn'];
const midiSame = (m, ch, n) => !!m && m.ch === ch && m.n === n;
// Correspondance enregistrée : chaque entrée invalide ou manquante reprend le réglage d'origine, et les doublons y reviennent aussi.
function cleanMap(s){
  const src = s && typeof s === 'object' && !Array.isArray(s) ? s : {}, out = {};
  const valid = m => !!m && typeof m === 'object' && Number.isInteger(m.ch) && m.ch >= 0 && m.ch <= 15 && Number.isInteger(m.n) && m.n >= 0 && m.n <= 127;
  for (const k of MIDI_CC.concat(MIDI_NOTE)){ const m = valid(src[k]) ? src[k] : DEFAULT_MAP[k]; if (m) out[k] = { ch: m.ch, n: m.n }; }
  for (let pass = 0; pass < 4; pass++){ let dup = false;
    for (const grp of [MIDI_CC, MIDI_NOTE]) for (const k of grp) for (const k2 of grp){ if (k < k2 && out[k] && out[k2] && midiSame(out[k], out[k2].ch, out[k2].n)){ dup = true;
      for (const x of [k, k2]){ if (DEFAULT_MAP[x]) out[x] = Object.assign({}, DEFAULT_MAP[x]); else delete out[x]; } } }
    if (!dup) return out; }
  return Object.assign({}, DEFAULT_MAP);
}
let map = cleanMap(null); try { map = cleanMap(JSON.parse(localStorage.getItem('coach-midi-map') || 'null')); } catch (e) {}
function onMidi(e){
  if (!e || !e.data || e.data.length < 3) return;
  const [st, d1, d2] = e.data, type = st & 0xF0, ch = st & 0x0F, val = clamp01(d2 / 127);
  if (learnKey){ const btn = MIDI_NOTE.includes(learnKey), want = btn ? (type === 0x90 && d2 > 0) : (type === 0xB0 && !(d1 >= 32 && d1 < 64));
    // un contrôle déjà utilisé par un autre réglage est refusé : on continue d'attendre le bon
    const taken = (btn ? MIDI_NOTE : MIDI_CC).some(k => k !== learnKey && midiSame(map[k], ch, d1));
    if (want && !taken){ map = Object.assign({}, map, { [learnKey]: { ch, n: d1 } }); try { localStorage.setItem('coach-midi-map', JSON.stringify(map)); } catch (_) {}
      if (type === 0xB0) phys[learnKey] = val; learnKey = null; updateSetup(); if (onb.active) renderOnb(); if (view === 'table') renderTable(); } return; }
  // Page « Ma table » : on montre ce qui bouge, sans piloter les niveaux ni l'écho
  if (view === 'table'){ tableMidi(type, ch, d1, d2, val); return; }
  if (type === 0xB0){ for (const k of MIDI_CC){ if (midiSame(map[k], ch, d1)){ phys[k] = val; if (onb.active){ ctrl[k] = val; applyCtrl(); onbMoved(k); return; } if (!isAuto(k)){ ctrl[k] = val; applyCtrl(); } if (!run) updateSetup(); return; } } }
  else if (type === 0x90 && d2 > 0){ const m = map.playB, f = map.fxOn; if (m && m.ch === ch && m.n === d1){ if (onb.active) onbMoved('playB'); else launchB(); } else if (f && f.ch === ch && f.n === d1) toggleEcho(); }
}
async function initMidi(){
  const pill = $('midiPill'), txt = pill.lastElementChild;
  if (!navigator.requestMIDIAccess){ txt.textContent = 'Souris (MIDI indisponible)'; return; }
  try { const acc = await navigator.requestMIDIAccess({ sysex: false });
    // table débranchée : ses positions ne sont plus fiables, on les oublie jusqu'au prochain mouvement
    const refresh = () => { const ins = [...acc.inputs.values()]; ins.forEach(i => { i.onmidimessage = onMidi; }); if (!ins.length) for (const k of Object.keys(phys)) delete phys[k]; pill.className = 'chip status' + (ins.length ? ' on' : ''); midiCount = ins.length; updateSetup(); if (onb.active) renderOnb(); txt.textContent = ins.length ? ins.map(i => i.name).join(', ') : 'Souris (aucune table branchée)'; if (view === 'table') renderTable(); };
    acc.onstatechange = refresh; refresh();
  } catch (e){ txt.textContent = 'Souris (MIDI bloqué ici)'; }
}


/* ---------- Mise en place de la table ---------- */
const phys = {}; let midiCount = 0, mouseMode = false, learnKey = null;
const LEARN_TXT = { midA: 'Tourne le potard MID de A…', cfxA: 'Tourne le potard CFX de A…', fxOn: 'Appuie sur ON de l\'effet…' };
const CTRL_LABEL = { faderA: 'Fader de volume A', faderB: 'Fader de volume B', lowA: 'Potard LOW de A', lowB: 'Potard LOW de B', cfxA: 'Potard CFX de A', midA: 'Potard MID de A' };
function targetText(k, v){ if (k === 'cfxA') return 'au milieu (cran central, filtre neutre)'; return k.startsWith('fader') ? (v >= .5 ? 'tout en haut' : 'tout en bas') : (v < .1 ? 'tout à gauche (basses coupées)' : 'au milieu (cran central)'); }
function inPlace(k, v, p){ if (p == null) return null; return k.startsWith('fader') ? (v >= .5 ? p >= .94 : p <= .06) : (v < .1 ? p <= .05 : Math.abs(p - .5) <= .07); }
const needSetup = () => midiCount > 0 && !mouseMode && LESSONS[li].user.length > 0;
function setupReady(){ const l = LESSONS[li]; return l.user.every(k => map[k] && inPlace(k, l.init[k], phys[k]) === true); }
function updateSetup(){
  const box = $('setup'), btn = $('startBtn');
  if (run || !needSetup()){ box.hidden = true; if (!run){ btn.disabled = false; btn.classList.remove('ready'); if (btn.textContent !== 'Préparation…') btn.textContent = 'Jouer'; } return; }
  const l = LESSONS[li], ul = $('setupList'); ul.innerHTML = '';
  for (const k of l.user){
    const v = l.init[k], p = map[k] ? phys[k] : null, ok = map[k] ? inPlace(k, v, p) : null;
    const li2 = document.createElement('li'); li2.className = ok === true ? 'ok' : ok === false ? 'wrong' : '';
    const ic = document.createElement('span'); ic.className = 'ic'; ic.textContent = ok === true ? '✓' : ok === false ? '!' : '?';
    const nm = document.createElement('span'); nm.innerHTML = '<b></b> '; nm.querySelector('b').textContent = CTRL_LABEL[k]; nm.appendChild(document.createTextNode(': ' + targetText(k, v)));
    const wh = document.createElement('span'); wh.className = 'what';
    wh.textContent = ok === true ? 'en place' : ok === null ? 'bouge-le un peu' : k.startsWith('fader') ? (p < v ? 'monte-le' : 'descends-le') : (p < v ? 'tourne à droite' : 'tourne à gauche');
    if (!map[k]){ wh.textContent = ''; const bt = document.createElement('button'); bt.type = 'button'; bt.className = 'learn' + (learnKey === k ? ' on' : '');
      bt.textContent = learnKey === k ? LEARN_TXT[k] : 'Apprendre ce contrôle'; bt.addEventListener('click', () => { learnKey = k; updateSetup(); }); wh.appendChild(bt); }
    li2.append(ic, nm, wh); ul.appendChild(li2);
    if (!isAuto(k) && p != null){ ctrl[k] = p; }
  }
  if (l.btn.includes('echo') && !map.fxOn){
    const li3 = document.createElement('li'); const ic = document.createElement('span'); ic.className = 'ic'; ic.textContent = '?';
    const nm = document.createElement('span'); nm.textContent = 'Bouton ON de l\'effet (facultatif : sinon bouton ECHO ou touche E)';
    const wh = document.createElement('span'); wh.className = 'what'; const bt = document.createElement('button'); bt.type = 'button'; bt.className = 'learn' + (learnKey === 'fxOn' ? ' on' : '');
    bt.textContent = learnKey === 'fxOn' ? LEARN_TXT.fxOn : 'Apprendre'; bt.addEventListener('click', () => { learnKey = 'fxOn'; updateSetup(); }); wh.appendChild(bt);
    li3.append(ic, nm, wh); ul.appendChild(li3);
  }
  applyCtrl();
  box.hidden = false;
  const ready = setupReady();
  btn.disabled = !ready; btn.classList.toggle('ready', ready); btn.textContent = ready ? 'Jouer' : 'Mets ta table en place';
}
$('setupSkip').addEventListener('click', () => { mouseMode = true; const l = LESSONS[li]; Object.assign(ctrl, l.init); applyCtrl(); updateSetup(); });
