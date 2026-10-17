// Vérifier ma table (lot 33) : la checklist de la vraie table, guidée pas à pas dans « Ma table ». Le site coche tout seul ce
// qu'il peut entendre (commandes qui répondent, débrancher et rebrancher), relève les numéros MIDI des commandes qu'il n'utilise
// pas encore (crossfader, HI, molette, pads…) et pose quelques questions. Résultat dans coach-verif, résumé dans le rapport.
// Tous les fichiers de js/ partagent la même portée et sont chargés dans l'ordre indiqué dans index.html.
'use strict';
/* ---------- Vérifier ma table ---------- */
const VF_KEY = 'coach-verif';
const VF_NOMS = { faderA: 'Fader de volume A', faderB: 'Fader de volume B', lowA: 'Potard LOW de A', lowB: 'Potard LOW de B', midA: 'Potard MID de A', cfxA: 'Potard CFX (filtre) de A',
  playA: 'PLAY de la platine gauche', playB: 'PLAY de la platine droite', fxOn: 'ON de l’effet' };
const VF_STEPS = [
  { id: 'table', type: 'auto', titre: 'Ta table est-elle reconnue ?', texte: 'Branche ta table en USB, rekordbox fermé. Le site doit la reconnaître tout seul.' },
  { id: 'faders', type: 'auto', titre: 'Les faders de volume', texte: 'Monte le fader de A jusqu’en haut, puis descends-le jusqu’en bas. Pareil pour celui de B.', keys: ['faderA', 'faderB'] },
  { id: 'low', type: 'auto', titre: 'Les potards LOW', texte: 'Tourne le LOW de A tout à gauche, puis tout à droite. Pareil pour celui de B.', keys: ['lowA', 'lowB'] },
  { id: 'mid', type: 'auto', titre: 'Le MID et le filtre', texte: 'Tourne le MID de A d’un bout à l’autre, puis le potard CFX de A (le filtre, sous les effets).', keys: ['midA', 'cfxA'] },
  { id: 'boutons', type: 'auto', titre: 'Les boutons', texte: 'Appuie sur PLAY de la platine gauche, puis sur PLAY de la platine droite, puis sur ON de l’effet.', keys: ['playA', 'playB', 'fxOn'] },
  { id: 'xfader', type: 'capture', genre: 'cc', titre: 'Le crossfader', texte: 'Bouge le crossfader (le fader horizontal, en bas au milieu) d’un bout à l’autre.' },
  { id: 'hiA', type: 'capture', genre: 'cc', titre: 'Le potard HI de A', texte: 'Tourne le potard HI de la platine gauche (le plus haut des trois potards d’égaliseur).' },
  { id: 'hiB', type: 'capture', genre: 'cc', titre: 'Le potard HI de B', texte: 'Tourne le potard HI de la platine droite.' },
  { id: 'trimA', type: 'capture', genre: 'cc', titre: 'Le potard TRIM de A', texte: 'Tourne le potard TRIM de la platine gauche (tout en haut, au-dessus du HI).' },
  { id: 'tempoA', type: 'capture', genre: 'cc', titre: 'Le tempo de A', texte: 'Bouge le fader TEMPO de la platine gauche (le fader vertical, sur le côté de la molette).' },
  { id: 'jogA', type: 'capture', genre: 'jog', titre: 'La molette de A', texte: 'Tourne la grande molette de la platine gauche par le bord, sans appuyer dessus.' },
  { id: 'cueA', type: 'capture', genre: 'note', titre: 'Le bouton CUE de A', texte: 'Appuie deux fois sur CUE de la platine gauche (juste au-dessus de PLAY).' },
  { id: 'padA', type: 'capture', genre: 'note', titre: 'Le pad 1 de A', texte: 'Appuie sur HOT CUE au-dessus des pads de gauche, puis deux fois sur le premier pad (en haut à gauche).' },
  { id: 'syncA', type: 'capture', genre: 'note', titre: 'BEAT SYNC de A', texte: 'Appuie deux fois sur BEAT SYNC de la platine gauche.' },
  { id: 'branche', type: 'branche', titre: 'Débrancher, rebrancher', texte: 'Débranche le câble USB de la table, attends deux secondes, puis rebranche-le.' },
  { id: 'schema', type: 'manuel', titre: 'Le dessin de la table', texte: 'Compare ce dessin à ta vraie table : chaque commande est-elle au bon endroit, avec le bon nom ?', svg: true,
    choix: [['ok', 'Oui, tout est bon'], ['ko', 'Non, il y a une erreur']] },
  { id: 'son', type: 'manuel', titre: 'Le son dans le casque', texte: 'Branche un casque sur la table, puis appuie sur « Écouter » : tu dois entendre quelques secondes de musique.', ecoute: true,
    choix: [['ok', 'Oui, j’entends bien'], ['ko', 'Non, rien dans le casque']] },
  { id: 'expert', type: 'manuel', titre: 'Le Mode Expert, au casque', texte: 'Joue 5 fois le niveau 1 « Le bon moment » en Mode Expert, au casque de la table, en appuyant sur PLAY bien en rythme. Tes scores tournent autour de :', jouer: 'expert',
    choix: [['80', 'Plus de 80'], ['60', 'Entre 60 et 80'], ['0', 'Moins de 60']], choix2: ['Le site dit le plus souvent :', [['tot', 'Trop tôt'], ['tard', 'Trop tard'], ['varie', 'Ça varie']]] },
  { id: 'musique', type: 'manuel', titre: 'La vraie musique', texte: 'Joue le niveau 6 « Le swap des basses » avec la vraie musique, au casque. Quand A et B jouent ensemble, les grosses caisses tombent-elles en même temps ?', jouer: 'swap',
    choix: [['ok', 'Oui, c’est calé'], ['ko', 'Non, ça « galope »']], choix2: ['Et les deux morceaux ensemble :', [['ok', 'Sonnent bien'], ['ko', 'Sonnent faux']]] },
  { id: 'sons', type: 'manuel', titre: 'Les petits sons du jeu', texte: 'Pendant ces parties, les petits sons du jeu (réussi, raté, étoiles) étaient :', choix: [['ok', 'Bien dosés'], ['fort', 'Trop forts'], ['gene', 'Gênants en Mode Expert']] },
  { id: 'fin', type: 'fin', titre: 'Vérification terminée' }
];
const VF_N = VF_STEPS.length - 1;   // étapes à faire (sans l'écran de fin)

// Ce qui est gardé : l'étape où l'on en est, le résultat de chaque étape, les numéros relevés, les notes
let vf = {}; try { vf = JSON.parse(localStorage.getItem(VF_KEY) || '{}'); } catch (e) {}
if (!vf || typeof vf !== 'object' || Array.isArray(vf)) vf = {};
{ const ids = VF_STEPS.map(s => s.id), obj = o => o && typeof o === 'object' && !Array.isArray(o) ? o : {}, txt = v => typeof v === 'string' ? v.slice(0, 300) : '';
  const res = obj(vf.res), midi = obj(vf.midi), note = obj(vf.note), res2 = obj(vf.res2);
  vf = { i: Number.isInteger(vf.i) && vf.i >= 0 && vf.i <= VF_N ? vf.i : 0,
    res: Object.fromEntries(Object.entries(res).filter(([k, v]) => ids.includes(k) && typeof v === 'string' && v.length <= 12)),
    res2: Object.fromEntries(Object.entries(res2).filter(([k, v]) => ids.includes(k) && typeof v === 'string' && v.length <= 12)),
    note: Object.fromEntries(Object.entries(note).filter(([k]) => ids.includes(k)).map(([k, v]) => [k, txt(v)])),
    midi: Object.fromEntries(Object.entries(midi).filter(([k, m]) => ids.includes(k) && m && ['cc', 'note'].includes(m.type) && [m.ch, m.n].every(x => Number.isInteger(x) && x >= 0 && x <= 127))
      .map(([k, m]) => [k, { type: m.type, ch: m.ch, n: m.n }])),
    fini: txt(vf.fini).slice(0, 10), nom: txt(vf.nom).slice(0, 80) }; }
const vfSave = () => { try { localStorage.setItem(VF_KEY, JSON.stringify(vf)); } catch (e) {} };
// Ce qui ne se garde pas : les commandes vues bouger pendant l'étape, le relevé en cours, le câble débranché
const verif = { on: false, vu: {}, cap: null, debr: false, rebr: false, auto: 0 };
const vfStep = () => VF_STEPS[vf.i];
const vfCanal = m => `canal ${m.ch + 1}, ${m.type === 'note' ? 'note' : 'numéro'} ${m.n}`;

function openVerif(){
  if (vf.fini && vf.i >= VF_N) vf.i = VF_N;
  verif.on = true; learnKey = null; $('verif').hidden = false; vfEntre(); renderVerif(); $('vfTitle').focus({ preventScroll: true });
}
function closeVerif(){ verif.on = false; $('verif').hidden = true; clearTimeout(verif.auto); vfSave(); if (view === 'table') renderTable(); }
// En arrivant sur une étape : on oublie ce qu'on avait vu bouger et ce qu'on était en train de relever
function vfEntre(){
  const st = vfStep(); verif.vu = {}; verif.cap = st.type === 'capture' ? { vals: new Set(), nb: 0, last: null, notes: {} } : null; verif.debr = false; verif.rebr = false; clearTimeout(verif.auto);
}
const vfConnue = (ch, n) => MIDI_CC.concat(MIDI_NOTE).some(k => midiSame(map[k], ch, n));
// Une commande de l'étape pas encore réglée (le filtre et ON de l'effet ne le sont pas d'origine) : le premier message qui lui
// ressemble et qui n'appartient à aucune autre commande devient son réglage, comme « Apprendre » dans « Ma table »
function vfApprend(k, type, ch, d1, d2){
  const btn = MIDI_NOTE.includes(k), fin = d1 >= 32 && d1 < 64;
  const ok = btn ? (type === 0x90 && d2 > 0) || (type === 0xB0 && d2 >= 64 && !fin) : type === 0xB0 && !fin;
  if (!ok || vfConnue(ch, d1)) return false;
  map = Object.assign({}, map, { [k]: btn && type === 0xB0 ? { ch, n: d1, cc: true } : { ch, n: d1 } });
  try { localStorage.setItem('coach-midi-map', JSON.stringify(map)); } catch (e) {}
  return true;
}
function vfAller(i){ vf.i = Math.max(0, Math.min(VF_N, i)); if (vf.i === VF_N && !vf.fini) vf.fini = dayKey(); vfSave(); vfEntre(); renderVerif(); $('vfTitle').focus({ preventScroll: true }); }
function vfResultat(r, auto){ const st = vfStep(); vf.res[st.id] = r; vfSave(); if (auto){ clearTimeout(verif.auto); verif.auto = setTimeout(() => { if (verif.on && vfStep() === st) vfAller(vf.i + 1); }, 1100); } }

// Une commande « vue » : un potard ou un fader poussé aux deux bouts, ou un bouton pressé
const vfVu = k => { const v = verif.vu[k]; return !!v && (MIDI_NOTE.includes(k) ? v.press : v.min <= .06 && v.max >= .94); };
function vfChecks(st){
  if (st.id === 'table') return [['Une table est branchée', midiCount > 0], tableCfg && !midiNames.some(isFlx4) ? ['Elle est réglée et prête à jouer', tableOn()]
    : ['C’est une DDJ-FLX4, prête à jouer sans réglage', midiNames.some(isFlx4) && tableOn()]];
  if (st.type === 'branche') return [['Table débranchée', verif.debr], ['Table rebranchée et reconnue', verif.rebr]];
  return st.keys.map(k => [VF_NOMS[k] + (map[k] ? '' : ' (pas encore réglé : bouge-le, le site l’apprend)'), vfVu(k)]);
}
function verifMidi(type, ch, d1, d2){
  const st = vfStep(), val = clamp01(d2 / 127);
  // les positions restent retenues, comme dans « Ma table » : la position de départ d'un niveau en dépend
  if (type === 0xB0) for (const k of MIDI_CC) if (midiSame(map[k], ch, d1)) phys[k] = val;
  if (st.type === 'auto' && st.keys){
    const libre = st.keys.find(x => !map[x]); if (libre) vfApprend(libre, type, ch, d1, d2);
    for (const k of st.keys){ const m = map[k]; if (!midiSame(m, ch, d1)) continue;
      const v = verif.vu[k] || (verif.vu[k] = { min: 1, max: 0, press: false });
      if (MIDI_NOTE.includes(k)){ if ((type === 0x90 && d2 > 0 && !m.cc) || (type === 0xB0 && m.cc && d2 >= 64)) v.press = true; }
      else if (type === 0xB0){ v.min = Math.min(v.min, val); v.max = Math.max(v.max, val); } }
    renderVerif(); return;
  }
  if (st.type === 'capture' && verif.cap && !vf.midi[st.id]){
    const c = verif.cap; if (vfConnue(ch, d1)) return;
    if (st.genre === 'note'){ if (type !== 0x90 || d2 === 0) return;
      const k = ch + ':' + d1; c.notes[k] = (c.notes[k] || 0) + 1; c.last = { type: 'note', ch, n: d1 };
      if (c.notes[k] >= 2) vfReleve({ type: 'note', ch, n: d1 }); else renderVerif(); return; }
    if (type !== 0xB0) return;
    if (st.genre === 'cc' && d1 >= 32 && d1 < 64) return;   // second message d'un potard « fin » : on garde le premier
    if (!c.last || c.last.ch !== ch || c.last.n !== d1){ c.vals = new Set(); c.nb = 0; }
    c.last = { type: 'cc', ch, n: d1 }; c.vals.add(d2); c.nb++;
    if ((st.genre === 'jog' && c.nb >= 6) || (st.genre === 'cc' && c.vals.size >= 3)) vfReleve({ type: 'cc', ch, n: d1 }); else renderVerif();
  }
}
function vfReleve(m){ const st = vfStep(); vf.midi[st.id] = m; vf.res[st.id] = 'ok'; vfSave(); son('reussi'); renderVerif(); clearTimeout(verif.auto);
  verif.auto = setTimeout(() => { if (verif.on && vfStep() === st) vfAller(vf.i + 1); }, 1200); }
// Branchée, débranchée : appelé par initMidi à chaque changement
function verifBranche(){ if (!verif.on) return; const st = vfStep();
  if (st.type === 'branche'){ if (!midiCount) verif.debr = true; else if (verif.debr) verif.rebr = true; }
  renderVerif(); }
// Quelques secondes de vraie musique, directement sur la sortie (enceintes et casque de la table)
function vfEcoute(){
  ensureAudio(); if (ac.state !== 'running') ac.resume();
  songSafe('vrai', 0, 'A').then(s => { const src = ac.createBufferSource(), g = ac.createGain(), t = ac.currentTime + .05;
    src.buffer = bufOf(s); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(1, t + .15); g.gain.setValueAtTime(1, t + 3.6); g.gain.linearRampToValueAtTime(0, t + 4);
    src.connect(g); g.connect(master); src.start(t, 20); src.stop(t + 4.1); }).catch(() => {});
}
// « Aller jouer » : on garde l'étape, on ouvre le bon niveau ; « Ma table » propose ensuite de reprendre
function vfJouer(quoi){ closeVerif();
  if (quoi === 'expert'){ expert = true; saveExpert(); goLesson(1, 0); } else goLesson(1, BASE_LESSONS.findIndex(l => l.kind === 'swap')); }

function renderVerif(){
  if (!verif.on) return;
  const st = vfStep(), fin = st.type === 'fin';
  $('vfKick').textContent = fin ? 'Vérifier ma table' : `Vérifier ma table · étape ${vf.i + 1} sur ${VF_N}`;
  $('vfFill').style.width = (fin ? 100 : Math.max(4, vf.i / VF_N * 100)) + '%';
  $('vfTitle').textContent = st.titre; $('vfText').textContent = fin ? vfBilan() : st.texte;
  const ul = $('vfList'); ul.innerHTML = ''; ul.hidden = !(st.type === 'auto' || st.type === 'branche');
  if (!ul.hidden){ const cs = vfChecks(st); for (const [t, ok] of cs){ const li = document.createElement('li'); li.className = ok ? 'ok' : ''; li.textContent = (ok ? '✓ ' : '… ') + t; ul.appendChild(li); }
    if (cs.every(c => c[1]) && !vf.res[st.id]){ if (st.id === 'table') vf.nom = midiNames.join(', ').slice(0, 80); vfResultat('ok', true); } }
  // le relevé d'une commande pas encore utilisée
  const sEl = $('vfState'); sEl.className = 'regstate'; sEl.textContent = '';
  if (st.type === 'capture'){ const m = vf.midi[st.id];
    if (m){ sEl.textContent = `C’est noté : ${vfCanal(m)} ✓`; sEl.classList.add('ok'); }
    else if (!midiCount) sEl.textContent = 'Branche ta table pour faire cette étape.';
    else if (verif.cap && verif.cap.last) sEl.textContent = `Reçu : ${vfCanal(verif.cap.last)}… continue.`;
    else sEl.textContent = 'J’écoute ta table…'; }
  if ((st.type === 'auto' || st.type === 'branche') && vf.res[st.id] === 'ok'){ sEl.textContent = 'Tout répond ✓'; sEl.classList.add('ok'); }
  else if ((st.type === 'auto') && !midiCount){ sEl.textContent = 'Aucune table branchée pour l’instant.'; }
  // les questions
  const box = $('vfChoix'); box.innerHTML = ''; box.hidden = st.type !== 'manuel';
  if (st.type === 'manuel'){
    const groupe = (titre, liste, cle) => { if (titre){ const p = document.createElement('p'); p.className = 'vfq'; p.textContent = titre; box.appendChild(p); }
      const row = document.createElement('div'); row.className = 'vfrow'; row.setAttribute('role', 'group');
      for (const [v, t] of liste){ const b = document.createElement('button'); b.type = 'button'; b.className = 'vfopt'; b.textContent = t; b.setAttribute('aria-pressed', String(vf[cle][st.id] === v));
        b.addEventListener('click', () => { vf[cle][st.id] = v; vfSave(); son('clic'); renderVerif(); }); row.appendChild(b); }
      box.appendChild(row); };
    if (st.jouer){ const b = document.createElement('button'); b.type = 'button'; b.className = 'ghost vfjouer'; b.textContent = st.jouer === 'expert' ? 'Aller jouer le niveau 1 en Mode Expert' : 'Aller jouer « Le swap des basses »';
      b.addEventListener('click', () => vfJouer(st.jouer)); box.appendChild(b); }
    if (st.ecoute){ const b = document.createElement('button'); b.type = 'button'; b.className = 'ghost vfjouer'; b.textContent = 'Écouter'; b.addEventListener('click', vfEcoute); box.appendChild(b); }
    groupe('', st.choix, 'res'); if (st.choix2) groupe(st.choix2[0], st.choix2[1], 'res2');
  }
  // le dessin de « Ma table », sans ses boutons (un <svg> n'a pas de propriété hidden : on passe par l'attribut)
  const svg = $('vfSvg'); svg.toggleAttribute('hidden', !st.svg); if (st.svg && !svg.firstChild) svg.innerHTML = tableSvg().replace(/ tabindex="0" role="button" aria-label="[^"]*"/g, '');
  const nb = $('vfNoteBox'); nb.hidden = st.type !== 'manuel'; if (!nb.hidden) $('vfNote').value = vf.note[st.id] || '';
  // les boutons du bas
  const pret = st.type === 'manuel' ? !!vf.res[st.id] && (!st.choix2 || !!vf.res2[st.id]) : !!vf.res[st.id];
  $('vfBack').hidden = vf.i === 0; $('vfSkip').hidden = fin || pret;
  $('vfSkip').textContent = st.type === 'capture' ? 'Je n’ai pas cette commande' : 'Passer';
  $('vfKo').hidden = !(st.type === 'auto' || st.type === 'branche') || vf.res[st.id] === 'ok';
  $('vfNext').hidden = fin; $('vfNext').disabled = !pret;
  $('vfCopy').hidden = !fin; $('vfRestart').hidden = !fin;
}
// Le bilan de l'écran de fin, et le texte du rapport
// À regarder : ce qui ne marche pas, ou une réponse autre que la première (la bonne) ; une commande absente ou une étape passée n'en est pas
const vfARegarder = st => { const r = vf.res[st.id]; if (!r) return false;
  return st.choix ? r !== st.choix[0][0] || (st.id === 'musique' && vf.res2[st.id] === 'ko') : r === 'ko'; };
function vfBilan(){ const faits = VF_STEPS.slice(0, VF_N), ko = faits.filter(vfARegarder).length,
    ok = faits.filter(s => vf.res[s.id] && !['absent', 'passe'].includes(vf.res[s.id]) && !vfARegarder(s)).length;
  return `${ok} étape${ok > 1 ? 's' : ''} sans souci sur ${VF_N}${ko ? `, ${ko} à regarder` : ''}. Copie le rapport et envoie-le : il contient tout ce que le site a relevé sur ta table.`; }
function verifResume(){
  if (!Object.keys(vf.res).length) return [];
  const L = [`Vérification de la table${vf.fini ? ' (terminée le ' + vf.fini + ')' : ` (en cours, étape ${vf.i + 1} sur ${VF_N})`} :`];
  for (const st of VF_STEPS.slice(0, VF_N)){ const r = vf.res[st.id]; if (!r) continue;
    const lib = st.choix ? (st.choix.find(c => c[0] === r) || [, r])[1] : r === 'ok' ? 'OK' : r === 'absent' ? 'pas sur cette table' : r === 'passe' ? 'passé' : 'ne marche pas';
    const lib2 = st.choix2 && vf.res2[st.id] ? ' · ' + ((st.choix2[1].find(c => c[0] === vf.res2[st.id]) || [, ''])[1]) : '';
    L.push(` - ${st.titre.replace(/ /g, ' ')} : ${lib}${lib2}${vf.midi[st.id] ? ' (' + vfCanal(vf.midi[st.id]) + ')' : ''}${st.id === 'table' && vf.nom ? ' (' + vf.nom + ')' : ''}${vf.note[st.id] ? ' · « ' + vf.note[st.id] + ' »' : ''}`); }
  L.push(' - Réglages utilisés : ' + MIDI_CC.concat(MIDI_NOTE).filter(k => map[k]).map(k => `${k} = ${vfCanal({ type: MIDI_NOTE.includes(k) && !map[k].cc ? 'note' : 'cc', ch: map[k].ch, n: map[k].n })}`).join(', '));
  return L;
}
function vfCopier(){
  const t = ['Vérification DJingo du ' + dayKey(), 'Table : ' + (midiNames.join(', ') || 'aucune branchée'), ''].concat(verifResume()).join('\n').replace(/ /g, ' ');
  const show = () => { const a = $('vfOut'); a.value = t; a.hidden = false; a.focus(); a.select(); };
  if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(t).then(() => { $('vfState').textContent = 'Rapport copié ! Colle-le dans un message.'; $('vfState').className = 'regstate ok'; }, show); else show();
}
$('vfNext').addEventListener('click', () => { const st = vfStep(); if (st.type === 'manuel') vf.note[st.id] = $('vfNote').value.trim().slice(0, 300); vfAller(vf.i + 1); });
$('vfBack').addEventListener('click', () => vfAller(vf.i - 1));
$('vfSkip').addEventListener('click', () => { const st = vfStep(); vf.res[st.id] = st.type === 'capture' ? 'absent' : 'passe'; vfAller(vf.i + 1); });
$('vfKo').addEventListener('click', () => { const st = vfStep(); vf.res[st.id] = 'ko'; vfAller(vf.i + 1); });
$('vfNote').addEventListener('input', () => { const st = vfStep(); vf.note[st.id] = $('vfNote').value.slice(0, 300); vfSave(); });
$('vfCopy').addEventListener('click', vfCopier);
$('vfRestart').addEventListener('click', () => { vf = { i: 0, res: {}, res2: {}, note: {}, midi: {}, fini: '', nom: '' }; vfSave(); $('vfOut').hidden = true; vfAller(0); });
$('vfClose').addEventListener('click', closeVerif);
$('tVerif').addEventListener('click', openVerif);
document.addEventListener('keydown', e => { if (e.key === 'Escape' && verif.on){ e.stopPropagation(); closeVerif(); } }, true);
// Le bouton de « Ma table » : commencer, reprendre ou revoir
// La carte n'apparaît qu'avec une table prête à jouer, ou une vérification déjà commencée
function renderVerifBtn(){ const encours = Object.keys(vf.res).length > 0;
  $('tVerif').parentNode.hidden = !tableOn() && !encours;
  $('tVerif').textContent = vf.fini ? 'Revoir ma vérification de la table' : encours ? `Reprendre la vérification (étape ${vf.i + 1} sur ${VF_N})` : 'Vérifier ma table pas à pas';
  $('tVerifSub').textContent = vf.fini ? `Faite le ${vf.fini.split('-').reverse().join('/')} : tu peux la revoir et copier le rapport.` : encours ? 'Elle reprend là où tu t’étais arrêté.' : '10 minutes : le site vérifie chaque commande avec toi.'; }
