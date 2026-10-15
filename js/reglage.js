// Régler une autre table que la DDJ-FLX4, pas à pas (lot 19) : le site demande chaque commande, on la bouge, il la reconnaît.
// Tous les fichiers de js/ partagent la même portée et sont chargés dans l'ordre indiqué dans index.html.
'use strict';
/* ---------- Régler ma table ----------
   Une commande par étape, avec le schéma allumé. Potard ou fader : reconnu quand il a envoyé 3 valeurs différentes
   (un bouton appuyé par erreur ne suffit pas) ; le second message d'un potard « fin » (numéro + 32, envoyé juste après
   le premier) est ignoré. Bouton : une note, ou un message de potard qui passe de 127 à 0 (appui puis relâche).
   Une commande déjà reconnue à une autre étape est refusée. « Je n'ai pas cette commande » : elle se fera à l'écran.
   Rien n'est enregistré avant « Enregistrer » ; Échap ou la croix annulent. Le résultat : coach-midi-map (seulement les
   commandes reconnues) et coach-table (le nom de la table). */
const REG_STEPS = [
  { k: 'faderA', name: 'le fader de volume de gauche', text: 'Monte puis descends le fader de volume de la platine A : le curseur vertical à gauche du centre.' },
  { k: 'faderB', name: 'le fader de volume de droite', text: 'Monte puis descends le fader de volume de la platine B : le curseur vertical à droite du centre.' },
  { k: 'lowA', name: 'le potard LOW de gauche', text: 'Tourne le potard des basses de la platine A. Il s’appelle LOW (ou BASS) : c’est le plus bas des potards de son, juste au-dessus du fader.' },
  { k: 'lowB', name: 'le potard LOW de droite', text: 'Tourne le potard des basses de la platine B.' },
  { k: 'midA', name: 'le potard MID de gauche', text: 'Tourne le potard MID de la platine A, juste au-dessus du LOW.' },
  { k: 'cfxA', name: 'le filtre de gauche', text: 'Tourne le filtre de la platine A. Selon les tables, il s’appelle CFX, FILTER ou COLOR.' },
  { k: 'playB', name: 'le bouton PLAY de droite', text: 'Appuie sur le bouton PLAY de la platine B (souvent marqué ▶).' },
  { k: 'fxOn', name: 'le bouton de l’effet', text: 'Appuie sur le bouton qui allume les effets : ON, FX ON ou BEAT FX selon les tables. Pas de bouton d’effet ? À l’écran, le bouton ECHO ou la touche E font pareil.' }
];
const reg = { active: false, i: 0, got: {}, seen: {}, last: {}, msg: '', wait: false, nom: '', timer: 0 };
let tableLater = false;   // « Plus tard » : le bandeau ne revient qu'au prochain chargement de la page
const capFirst = t => t.charAt(0).toUpperCase() + t.slice(1);
// Le schéma est celui des fiches (même dessin, identifiants préfixés rg- pour ne pas les mélanger)
$('regSvg').innerHTML = $('onbSvg').innerHTML.replace(/id="sv-/g, 'id="rg-');
// La table à régler : la première qui n'est pas une FLX4 (ou la FLX4 elle-même, si on la règle à la main)
const regName = () => midiNames.find(n => !isFlx4(n)) || midiNames[0] || '';
const regKind = (k, m) => MIDI_CC.includes(k) || !!(m && m.cc);
function regOwner(k, got){ const cc = regKind(k, got); return REG_STEPS.find(s => s.k !== k && reg.got[s.k] && regKind(s.k, reg.got[s.k]) === cc && midiSame(reg.got[s.k], got.ch, got.n)); }

function openReg(){
  if (!midiCount || run || reg.active) return;
  learnKey = null;
  Object.assign(reg, { active: true, i: 0, got: {}, seen: {}, last: {}, msg: '', wait: false, nom: regName() });
  $('reg').hidden = false; renderTableBar(); renderReg(); setTimeout(() => $('regSkip').focus(), 30);
}
function closeReg(){ reg.active = false; clearTimeout(reg.timer); $('reg').hidden = true; renderTableBar(); }
function regGo(i){ clearTimeout(reg.timer); Object.assign(reg, { i, seen: {}, last: {}, msg: '', wait: false }); renderReg(); }

function regMidi(type, ch, d1, d2){
  const st = REG_STEPS[reg.i]; if (!st) return;
  const btn = MIDI_NOTE.includes(st.k), id = ch + ':' + d1, svg = $('regSvg'); let got = null;
  // Le schéma suit la table : une commande déjà reconnue bouge à sa place, sinon c'est celle qu'on attend qui bouge
  const own = type === 0xB0 || type === 0x90 ? REG_STEPS.find(s => reg.got[s.k] && regKind(s.k, reg.got[s.k]) === (type === 0xB0) && midiSame(reg.got[s.k], ch, d1)) : null;
  if (own){ if (MIDI_CC.includes(own.k)) onbSchemaSet(svg, 'rg-', own.k, d2 / 127); else if (d2 >= 64) onbSchemaPress(svg, 'rg-', own.k); }
  else if (type === 0xB0 && !btn && !(d1 >= 32 && d1 < 64 && reg.seen[ch + ':' + (d1 - 32)])) onbSchemaSet(svg, 'rg-', st.k, d2 / 127);
  if (reg.wait) return;
  if (btn){
    if (type === 0x90 && d2 > 0) got = { ch, n: d1 };
    else if (type === 0xB0){ if (d2 === 0 && reg.last[id] === 127) got = { ch, n: d1, cc: true }; reg.last[id] = d2; }
  } else if (type === 0xB0){
    if (d1 >= 32 && d1 < 64 && reg.seen[ch + ':' + (d1 - 32)]) return;   // second message d'un potard « fin »
    (reg.seen[id] = reg.seen[id] || new Set()).add(d2); if (reg.seen[id].size >= 3) got = { ch, n: d1 };
  }
  if (!got) return;
  const other = regOwner(st.k, got);
  if (other){ reg.msg = `Ça, c’est ${other.name}, déjà reconnu. ${btn ? 'Appuie plutôt sur' : 'Bouge plutôt'} ${st.name}.`; reg.seen = {}; reg.last = {}; renderRegState(); return; }
  reg.got[st.k] = got; reg.wait = true; reg.msg = ''; chime(true); if (btn) onbSchemaPress(svg, 'rg-', st.k); renderRegState();
  const at = reg.i; reg.timer = setTimeout(() => { if (reg.active && reg.i === at) regGo(at + 1); }, 700);
}

function renderReg(){
  const st = REG_STEPS[reg.i], end = !st, n = Object.keys(reg.got).length;
  $('regKick').textContent = end ? `Régler ma table · ${reg.nom}` : `Régler ma table · ${reg.i + 1} sur ${REG_STEPS.length}`;
  $('regTitle').textContent = end ? (n ? 'Ta table est prête' : 'Rien n’a été reconnu') : capFirst(st.name);
  $('regText').textContent = end ? (n ? 'Voici ce que le site a reconnu. Ce qui manque se fera à l’écran, à la souris. Tu pourras tout refaire depuis « Ma table ».' : 'Vérifie que ta table est bien branchée, puis recommence. Tu peux aussi jouer à la souris.') : st.text;
  $('regSvg').style.display = end ? 'none' : ''; if (!end) onbHighlight(st.k, $('regSvg'), 'rg-');
  const ul = $('regList'); ul.innerHTML = ''; ul.hidden = !end;
  if (end) for (const s of REG_STEPS){ const ok = !!reg.got[s.k], x = document.createElement('li'); x.className = ok ? 'ok' : ''; x.textContent = `${ok ? '✓' : '•'} ${capFirst(s.name)} : ${ok ? 'reconnu' : 'à l’écran'}`; ul.appendChild(x); }
  $('regSkip').hidden = end; $('regSave').hidden = !end || !n;
  $('regBack').hidden = !end && reg.i === 0; $('regBack').textContent = end ? 'Recommencer' : 'Retour';
  renderRegState();
}
function renderRegState(){
  const st = REG_STEPS[reg.i], el = $('regState'); el.className = 'regstate' + (reg.wait ? ' ok' : reg.msg ? ' warn' : '');
  el.textContent = !st ? '' : !midiCount ? 'Ta table est débranchée : rebranche-la pour continuer.' : reg.wait ? 'Reconnu !' : reg.msg || (MIDI_NOTE.includes(st.k) ? 'J’attends que tu appuies dessus sur ta table…' : 'J’attends que tu le bouges sur ta table…');
}
function regSave(){
  map = cleanMap(reg.got, true); tableCfg = { nom: reg.nom }; for (const k of Object.keys(phys)) delete phys[k];
  try { localStorage.setItem('coach-midi-map', JSON.stringify(map)); localStorage.setItem('coach-table', JSON.stringify(tableCfg)); } catch (e) {}
  closeReg(); renderPill(); updateSetup();
  if (view === 'table'){ tableNote = 'Ta table est réglée : bouge une commande pour la voir réagir.'; renderTable(); }
}

/* ---------- Le bandeau : une autre table vient d'être branchée ---------- */
function renderTableBar(){
  const bar = $('tableBar'), e = tableEtat(); bar.hidden = tableLater || reg.active || (e !== 'nouvelle' && e !== 'flx4'); if (bar.hidden) return;
  $('tbText').textContent = e === 'flx4' ? 'Tu as branché une DDJ-FLX4, mais les réglages sont ceux de ton autre table. On reprend ceux de la FLX4 ?'
    : `Nouvelle table : « ${regName()} ». Le site est réglé pour la DDJ-FLX4 : règle la tienne en une minute, en bougeant chaque commande quand il te le demande.`;
  $('tbGo').textContent = e === 'flx4' ? 'Reprendre les réglages de la FLX4' : 'Régler ma table';
}
$('tbGo').addEventListener('click', () => { if (tableEtat() === 'flx4'){ flx4Map(); if (view === 'table') renderTable(); } else openReg(); });
$('tbLater').addEventListener('click', () => { tableLater = true; renderTableBar(); });
$('regSkip').addEventListener('click', () => { if (reg.i < REG_STEPS.length){ delete reg.got[REG_STEPS[reg.i].k]; regGo(reg.i + 1); } });
$('regBack').addEventListener('click', () => {
  if (reg.i >= REG_STEPS.length){ reg.got = {}; regGo(0); return; }
  if (reg.i > 0){ delete reg.got[REG_STEPS[reg.i].k]; delete reg.got[REG_STEPS[reg.i - 1].k]; regGo(reg.i - 1); } });
$('regSave').addEventListener('click', regSave);
$('regClose').addEventListener('click', closeReg);
document.addEventListener('keydown', e => { if (e.key === 'Escape' && reg.active){ e.stopPropagation(); closeReg(); } }, true);
