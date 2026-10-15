// Liaison Web MIDI et mise en place de la table. Réglages d'origine : ceux de la DDJ-FLX4 ;
// une autre table se règle pas à pas (reglage.js, lot 19).
// Tous les fichiers de js/ partagent la même portée et sont chargés dans l'ordre indiqué dans index.html.
'use strict';
/* ---------- Table MIDI ---------- */
const DEFAULT_MAP = { faderA: { ch: 0, n: 19 }, faderB: { ch: 1, n: 19 }, lowA: { ch: 0, n: 15 }, lowB: { ch: 1, n: 15 }, midA: { ch: 0, n: 11 }, midB: { ch: 1, n: 11 }, playA: { ch: 0, n: 11 }, playB: { ch: 1, n: 11 } };
// Potards et faders d'un côté, boutons de l'autre : deux contrôles d'un même groupe ne peuvent pas partager un numéro.
// Un bouton envoie une note (cas de la FLX4) ou, sur d'autres tables, un message de potard : il est alors marqué `cc`.
const MIDI_CC = ['faderA', 'faderB', 'lowA', 'lowB', 'cfxA', 'midA', 'midB'], MIDI_NOTE = ['playA', 'playB', 'fxOn'];
const midiSame = (m, ch, n) => !!m && m.ch === ch && m.n === n;
const isFlx4 = name => /FLX4/i.test(String(name));
// Windows ajoute parfois « 2- » devant le nom d'une table (deux appareils pareils, ou rebranchée ailleurs) : on n'en tient pas compte
const baseName = name => String(name).replace(/^\d+-\s*/, '');
// Autre table réglée pas à pas : son nom, tel que le navigateur le donne (clé coach-table). Ses réglages ne reprennent rien de la FLX4.
let tableCfg = null; try { const t = JSON.parse(localStorage.getItem('coach-table') || 'null'); if (t && typeof t.nom === 'string' && t.nom.trim() && t.nom.length <= 200) tableCfg = { nom: t.nom }; } catch (e) {}
// Correspondance enregistrée. FLX4 : chaque entrée invalide ou manquante reprend le réglage d'origine, et les doublons y reviennent aussi.
// Autre table (`perso`) : une entrée invalide, manquante ou en double est absente, et la commande se fait à l'écran.
function cleanMap(s, perso = false){
  const src = s && typeof s === 'object' && !Array.isArray(s) ? s : {}, out = {};
  const valid = m => !!m && typeof m === 'object' && Number.isInteger(m.ch) && m.ch >= 0 && m.ch <= 15 && Number.isInteger(m.n) && m.n >= 0 && m.n <= 127;
  for (const k of MIDI_CC.concat(MIDI_NOTE)){ const m = valid(src[k]) ? src[k] : perso ? null : DEFAULT_MAP[k]; if (m){ out[k] = { ch: m.ch, n: m.n }; if (m.cc === true && MIDI_NOTE.includes(k)) out[k].cc = true; } }
  for (let pass = 0; pass < 4; pass++){ let dup = false;
    for (const grp of [MIDI_CC, MIDI_NOTE]) for (const k of grp) for (const k2 of grp){ if (k < k2 && out[k] && out[k2] && midiSame(out[k], out[k2].ch, out[k2].n)){ dup = true;
      for (const x of [k, k2]){ if (DEFAULT_MAP[x] && !perso) out[x] = Object.assign({}, DEFAULT_MAP[x]); else delete out[x]; } } }
    if (!dup) return out; }
  return perso ? out : Object.assign({}, DEFAULT_MAP);
}
let map = cleanMap(null, !!tableCfg); try { map = cleanMap(JSON.parse(localStorage.getItem('coach-midi-map') || 'null'), !!tableCfg); } catch (e) {}
// État de la table branchée : 'aucune' ; 'ok' (une FLX4 avec ses réglages, ou la table réglée pas à pas) ;
// 'nouvelle' (une autre table, pas encore réglée) ; 'flx4' (une FLX4, alors que les réglages sont ceux d'une autre table).
function tableEtat(){
  if (!midiNames.length) return 'aucune';
  if (tableCfg && midiNames.some(n => baseName(n) === baseName(tableCfg.nom))) return 'ok';
  if (midiNames.some(isFlx4)) return tableCfg ? 'flx4' : 'ok';
  return 'nouvelle';
}
const tableOn = () => tableEtat() === 'ok';
const ccDown = {};
// Un bouton de la table : PLAY de B lance B, ON de l'effet allume l'écho (PLAY de A n'est pas utilisé)
function pressKey(k){ if (k === 'playB'){ if (onb.active) onbMoved('playB'); else launchB(); } else if (k === 'fxOn'){ if (onb.active) onbMoved('fxOn'); else toggleEcho(); } }
function onMidi(e){
  if (!e || !e.data || e.data.length < 3) return;
  const [st, d1, d2] = e.data, type = st & 0xF0, ch = st & 0x0F, val = clamp01(d2 / 127);
  if (reg.active){ regMidi(type, ch, d1, d2); return; }
  if (learnKey){ const btn = MIDI_NOTE.includes(learnKey), want = btn ? (type === 0x90 && d2 > 0) : (type === 0xB0 && !(d1 >= 32 && d1 < 64));
    // un contrôle déjà utilisé par un autre réglage est refusé : on continue d'attendre le bon
    const taken = (btn ? MIDI_NOTE : MIDI_CC).some(k => k !== learnKey && midiSame(map[k], ch, d1));
    if (want && !taken){ map = Object.assign({}, map, { [learnKey]: { ch, n: d1 } }); try { localStorage.setItem('coach-midi-map', JSON.stringify(map)); } catch (_) {}
      if (type === 0xB0) phys[learnKey] = val; learnKey = null; updateSetup(); if (onb.active) renderOnb(); if (view === 'table') renderTable(); } return; }
  // Page « Ma table » : on montre ce qui bouge, sans piloter les niveaux ni l'écho
  if (view === 'table'){ tableMidi(type, ch, d1, d2, val); return; }
  // Une table pas encore réglée ne pilote rien : ses numéros ne sont pas ceux de la FLX4
  if (!tableOn()) return;
  if (type === 0xB0){
    const kb = MIDI_NOTE.find(k => map[k] && map[k].cc && midiSame(map[k], ch, d1));
    if (kb){ if (d2 >= 64 && !ccDown[kb]) pressKey(kb); ccDown[kb] = d2 >= 64; return; }
    for (const k of MIDI_CC){ if (midiSame(map[k], ch, d1)){ phys[k] = val; if (onb.active){ ctrl[k] = val; applyCtrl(); onbMoved(k); return; } if (!isAuto(k)){ ctrl[k] = val; applyCtrl(); } if (!run) updateSetup(); return; } } }
  else if (type === 0x90 && d2 > 0){ const k = MIDI_NOTE.find(x => map[x] && !map[x].cc && midiSame(map[x], ch, d1)); if (k) pressKey(k); }
}
async function initMidi(){
  const txt = $('midiPill').lastElementChild;
  if (!navigator.requestMIDIAccess){ txt.textContent = 'Souris (MIDI indisponible)'; return; }
  try { const acc = await navigator.requestMIDIAccess({ sysex: false });
    // table débranchée : ses positions ne sont plus fiables, on les oublie jusqu'au prochain mouvement
    const refresh = () => { const ins = [...acc.inputs.values()]; ins.forEach(i => { i.onmidimessage = onMidi; }); midiNames = ins.map(i => String(i.name || 'Table MIDI'));
      if (!ins.length) for (const k of Object.keys(phys)) delete phys[k]; midiCount = ins.length; renderPill();
      updateSetup(); if (onb.active) renderOnb(); if (view === 'table') renderTable(); renderTableBar(); if (reg.active) renderReg(); };
    acc.onstatechange = refresh; refresh();
  } catch (e){ txt.textContent = 'Souris (MIDI bloqué ici)'; }
}
// La pastille du haut : le nom de la table, « à régler » tant qu'elle ne pilote rien
function renderPill(){ const pill = $('midiPill'); pill.className = 'chip status' + (tableOn() ? ' on' : '');
  pill.lastElementChild.textContent = midiCount ? midiNames.join(', ') + (tableOn() ? '' : ' · à régler') : 'Souris (aucune table branchée)'; }


/* ---------- Mise en place de la table ---------- */
const phys = {}; let midiCount = 0, midiNames = [], mouseMode = false, learnKey = null;
const LEARN_TXT = { midA: 'Tourne le potard MID de A…', cfxA: 'Tourne le potard CFX de A…', fxOn: 'Appuie sur ON de l\'effet…' };
const CTRL_LABEL = { faderA: 'Fader de volume A', faderB: 'Fader de volume B', lowA: 'Potard LOW de A', lowB: 'Potard LOW de B', cfxA: 'Potard CFX de A', midA: 'Potard MID de A' };
// Vocabulaire du site (lot 18) : potard « normal » (à midi) ou « coupé » (tout à gauche), fader « en haut » ou « en bas »
function targetText(k, v){ if (k.startsWith('fader')) return v >= .5 ? 'en haut' : 'en bas'; if (k === 'cfxA') return v > .9 ? 'tout à droite' : 'neutre (à midi)'; return v < .1 ? 'coupé (tout à gauche)' : 'normal (à midi)'; }
// Petit dessin de la position : un potard avec son aiguille, ou un fader avec son curseur (couleur de la platine)
function pictoOf(k, v){ const s = document.createElement('span'); s.className = 'pic ' + (k.endsWith('A') ? 'pa' : 'pb'); s.setAttribute('aria-hidden', 'true');
  if (k.startsWith('fader')) s.innerHTML = `<svg viewBox="0 0 16 28"><rect x="6" y="2" width="4" height="24" rx="2" class="track"/><rect x="2" y="${v >= .5 ? 2 : 20}" width="12" height="6" rx="2" class="cap"/></svg>`;
  else { const a = (-135 + 270 * v) * Math.PI / 180; s.innerHTML = `<svg viewBox="0 0 28 28"><circle cx="14" cy="14" r="11" class="dial"/><line x1="14" y1="14" x2="${(14 + 9 * Math.sin(a)).toFixed(1)}" y2="${(14 - 9 * Math.cos(a)).toFixed(1)}" class="cap"/></svg>`; }
  return s; }
// « Pendant le niveau » : les gestes, dans l'ordre, écrits départ → arrivée
function planSteps(l){
  const out = [], seen = new Set();
  if (!l.autoLaunch && l.user.includes('lowB') && l.init.lowB >= .4) out.push('Avant de lancer B : LOW de B normal → coupé');
  for (const [, lab] of (l.targets || []).slice().sort((x, y) => x[0] - y[0])){ if (seen.has(lab) || !ACT[lab]) continue; seen.add(lab); out.push(ACT[lab].charAt(0).toUpperCase() + ACT[lab].slice(1)); }
  return out;
}
function renderPlan(){
  const l = LESSONS[li], steps = planSteps(l), box = $('plan'); box.hidden = !!run || !steps.length; if (box.hidden) return;
  const ol = $('planList'); ol.innerHTML = ''; for (const t of steps){ const x = document.createElement('li'); x.textContent = t; ol.appendChild(x); }
  $('planNote').textContent = l.wave || chapter === 2 || l.noCount ? 'Ici, pas de compte à rebours : écoute la musique (ou lis la forme d’onde) et fais chaque geste au bon moment.' : 'Chaque geste arrive sur la piste avec un repère ◆ et un compte à rebours : fais-le quand il touche la ligne.';
}
function inPlace(k, v, p){ if (p == null) return null; return k.startsWith('fader') ? (v >= .5 ? p >= .94 : p <= .06) : (v < .1 ? p <= .05 : Math.abs(p - .5) <= .07); }
const needSetup = () => midiCount > 0 && tableOn() && !mouseMode && LESSONS[li].user.length > 0;
// Une commande que la table réglée pas à pas n'a pas se fait à l'écran : elle ne bloque pas « Jouer »
const onScreen = k => !map[k] && !!tableCfg;
function setupReady(){ const l = LESSONS[li]; return l.user.every(k => onScreen(k) || (map[k] && inPlace(k, l.init[k], phys[k]) === true)); }
function updateSetup(){
  renderPlan();
  const box = $('setup'), btn = $('startBtn');
  if (run || !needSetup()){ box.hidden = true; if (!run){ btn.disabled = false; btn.classList.remove('ready'); if (btn.textContent !== 'Préparation…') btn.textContent = 'Jouer'; } return; }
  const l = LESSONS[li], ul = $('setupList'); ul.innerHTML = '';
  for (const k of l.user){
    const v = l.init[k], p = map[k] ? phys[k] : null, ok = map[k] ? inPlace(k, v, p) : null;
    const li2 = document.createElement('li'); li2.className = ok === true || onScreen(k) ? 'ok' : ok === false ? 'wrong' : '';
    const ic = document.createElement('span'); ic.className = 'ic'; ic.textContent = onScreen(k) ? '•' : ok === true ? '✓' : ok === false ? '!' : '?';
    const nm = document.createElement('span'); nm.innerHTML = '<b></b> '; nm.querySelector('b').textContent = CTRL_LABEL[k]; nm.appendChild(document.createTextNode(': ' + targetText(k, v))); nm.prepend(pictoOf(k, v));
    const wh = document.createElement('span'); wh.className = 'what';
    wh.textContent = onScreen(k) ? 'à l\'écran : ta table n\'en a pas' : ok === true ? 'en place' : ok === null ? 'bouge-le un peu' : k.startsWith('fader') ? (p < v ? 'monte-le' : 'descends-le') : (p < v ? 'tourne à droite' : 'tourne à gauche');
    if (!map[k] && !tableCfg){ wh.textContent = ''; const bt = document.createElement('button'); bt.type = 'button'; bt.className = 'learn' + (learnKey === k ? ' on' : '');
      bt.textContent = learnKey === k ? LEARN_TXT[k] : 'Apprendre ce contrôle'; bt.addEventListener('click', () => { learnKey = k; updateSetup(); }); wh.appendChild(bt); }
    li2.append(ic, nm, wh); ul.appendChild(li2);
    if (!isAuto(k) && p != null){ ctrl[k] = p; }
  }
  if (l.btn.includes('echo') && !map.fxOn && !tableCfg){
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
