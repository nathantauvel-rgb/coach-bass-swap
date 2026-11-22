// Guide de premier lancement, et fiches « Découvre ce bouton » montrées juste avant le premier niveau qui s'en sert.
// Tous les fichiers de js/ partagent la même portée et sont chargés dans l'ordre indiqué dans index.html.
'use strict';
/* ---------- Guide de premier lancement ----------
   Le guide ne parle que de la musique (compter, parties d'un morceau). Chaque bouton de la table est présenté par
   une fiche, au moment où un niveau s'en sert pour la première fois (lot 18). */
const ONB = [
  { title: 'Bienvenue sur DJingood', text: 'Ici, tu apprends à passer d\'un morceau à l\'autre, geste par geste, sur ta table.', cta: 'C\'est parti' },
  { title: 'Compter en phrases', text: 'Un « boum » = un temps. 32 temps = une phrase. Les transitions se font au début d\'une phrase.', phrase: true },
  { title: "Les parties d'un morceau", text: 'Chaque partie a sa couleur sur la piste.', parts: true },
  { title: 'Tu es prêt', text: 'Commence par le niveau 1. Si tu hésites, « Regarde d\'abord » te montre le geste.', cta: 'Commencer le niveau 1' }
];
/* ---------- Fiches « Découvre ce bouton » ----------
   Une fiche par commande : où elle est (schéma, bouton allumé), à quoi elle sert, et on l'essaie en écoutant.
   Vocabulaire du site : potard « normal » (à midi) ou « coupé » (tout à gauche) ; fader « en haut » ou « en bas ». */
const FICHES = {
  play: { title: 'Le bouton PLAY', text: 'En bas de chaque platine : il lance ou arrête le morceau.', hl: 'playB', k: 'playB', act: 'Appuie sur PLAY à droite : la musique s\'arrête, puis repart' },
  fader: { title: 'Les faders de volume', text: 'Les deux curseurs du centre : le volume de A à gauche, de B à droite.', hl: 'faderA', k: 'faderA', act: 'Baisse puis remonte le fader de gauche' },
  low: { title: 'Le potard LOW : les basses', text: 'Les basses. À midi : on les entend. Tout à gauche : coupées. Jamais deux ensemble.', hl: 'lowA', k: 'lowA', act: 'Coupe puis remets les basses de gauche' },
  cfx: { title: 'Le filtre CFX', text: 'À midi, il ne fait rien. Vers la droite, le morceau s\'efface en douceur.', hl: 'cfxA', k: 'cfxA', act: 'Tourne le filtre de gauche vers la droite' },
  echo: { title: 'L\'écho', text: 'Il répète le son en le laissant s\'éteindre. On l\'allume juste avant de couper un morceau.', hl: 'fxOn', k: 'fxOn', act: 'Allume l\'écho et écoute' },
  mid: { title: 'Le potard MID : les voix et les mélodies', text: 'Les voix et les mélodies. À midi : on entend tout. Tout à gauche : elles reculent.', hl: 'midA', k: 'midA', act: 'Coupe puis remets le MID de gauche' }
};
const FICHE_NAMES = { play: 'le bouton PLAY', fader: 'les faders', low: 'le potard LOW', cfx: 'le filtre CFX', echo: 'l\'écho', mid: 'le potard MID' };
let fichesSeen = []; try { fichesSeen = JSON.parse(localStorage.getItem('coach-fiches') || '[]'); } catch (e) {}
fichesSeen = Array.isArray(fichesSeen) ? Object.keys(FICHES).filter(k => fichesSeen.includes(k)) : [];
// Les commandes qu'un niveau te demande de manier
function fichesOf(l){ const f = [];
  if (!l.autoLaunch) f.push('play'); if (l.user.some(k => k.startsWith('fader'))) f.push('fader'); if (l.user.some(k => k.startsWith('low'))) f.push('low');
  if (l.user.includes('cfxA')) f.push('cfx'); if (l.btn.includes('echo')) f.push('echo'); if (l.user.includes('midA')) f.push('mid'); return f; }
// Avant de jouer : les fiches pas encore vues de ce niveau, puis la partie. Jamais pour un Apprenti DJ ou un DJ confirmé (lot 37),
// ni pendant l'entraînement ou le test de placement.
function withFiches(go){
  const keys = parcoursAvance(parcours) || prac || placement || run ? [] : fichesOf(LESSONS[li]).filter(k => !fichesSeen.includes(k));
  if (!keys.length) return go();
  openOnb(keys.map(k => FICHES[k]), { fiche: true, keys, after: go });
}

const onb = { active: false, i: 0, done: {}, base: {}, t0: 0, playing: false, raf: 0, steps: ONB, fiche: false, keys: [], after: null };
let guideSeen = false; try { guideSeen = localStorage.getItem('coach-guide-vu') === '1'; } catch (e) {}
const ONB_KNOBS = [['TRIM', 34], ['HI', 62], ['MID', 88], ['LOW', 114], ['CFX', 146]];
(function drawOnbKnobs(){ const g = $('sv-knobs'); let h = '';
  for (const [lab, y] of ONB_KNOBS){ for (const [x, side] of [[266, 'A'], [334, 'B']]){ const id = `sv-${lab.toLowerCase()}${side}`;
      // lot 73 : en relief comme ceux des niveaux (lot 74) : son ombre, la jupe crantée (c'est elle qui s'éclaire), la tête, l'aiguille
      h += `<circle class="rl-k-ombre" cx="${x}" cy="${y + 2}" r="11"/><circle class="rl-kb" id="${id}" cx="${x}" cy="${y}" r="10" fill="url(#sv-gJupe)"/>`
        + `<circle class="rl-kd" cx="${x}" cy="${y}" r="8.6"/><circle class="rl-kt" cx="${x}" cy="${y}" r="6.6" fill="url(#sv-gTete)"/>`
        + `<line class="ndl" id="${id}-n" data-cx="${x}" data-cy="${y}" x1="${x}" y1="${y - 1}" x2="${x}" y2="${y - 9}"/>`; }
    h += `<text class="rl-lab" x="300" y="${y + 3.5}" text-anchor="middle">${lab}</text>`; }
  g.innerHTML = h; })();
// Le schéma suit la table (lot 19) : le fader dessiné monte ou descend, l'aiguille du potard tourne, le bouton s'allume.
// v de 0 (en bas, tout à gauche) à 1 (en haut, tout à droite). Sert aux fiches (préfixe sv-) et à « Régler ma table » (rg-).
function onbSchemaSet(svg, pre, k, v){
  if (v == null || !isFinite(v)) return; const el = svg.querySelector('#' + pre + k); if (!el) return;
  if (k.startsWith('fader')) el.lastElementChild.setAttribute('y', (176 + (1 - v) * 50).toFixed(1));
  else { const nd = svg.querySelector('#' + pre + k + '-n'); if (nd) nd.setAttribute('transform', `rotate(${(-135 + 270 * v).toFixed(1)} ${nd.dataset.cx} ${nd.dataset.cy})`); }
}
function onbSchemaPress(svg, pre, k){
  const el = svg.querySelector('#' + pre + k); if (!el) return; const t = el.tagName === 'g' ? el.firstElementChild : el;
  t.classList.add('press'); clearTimeout(t._press); t._press = setTimeout(() => t.classList.remove('press'), 250);
}
const onbSchemaSync = () => { for (const k of MIDI_CC) onbSchemaSet($('onbSvg'), 'sv-', k, ctrl[k]); };
// Allume une commande du schéma (celui des fiches, ou sa copie dans « Régler ma table », préfixe rg-)
function onbHighlight(id, svg = $('onbSvg'), pre = 'sv-'){
  svg.querySelectorAll('.hl').forEach(e => e.classList.remove('hl')); svg.querySelectorAll('.hl-ring').forEach(e => e.remove());
  if (!id) return; const el = svg.querySelector('#' + pre + id); if (!el) return;
  const t = el.tagName === 'g' ? el.firstElementChild : el; t.classList.add('hl');
  // l'anneau entoure toute la commande (le fader avec son bouton, pas seulement sa fente)
  const bb = el.getBBox ? el.getBBox() : null; if (!bb) return;
  const r = document.createElementNS('http://www.w3.org/2000/svg', 'rect'); r.setAttribute('class', 'hl-ring');
  r.setAttribute('x', bb.x - 8); r.setAttribute('y', bb.y - 8); r.setAttribute('width', bb.width + 16); r.setAttribute('height', bb.height + 16); r.setAttribute('rx', 10); svg.appendChild(r);
}
function onbStartMusic(){
  ensureAudio(); if (ac.state !== 'running') ac.resume();
  if (!tracks || !tracks.B1) return;
  Object.assign(ctrl, { faderA: 1, lowA: .5, cfxA: .5, midA: .5 }); applyCtrl(); onbSchemaSync();
  onb.t0 = ac.currentTime + .1; play('A', tracks.B1, onb.t0, 64 * P, true); onb.playing = true;
}
function onbStopMusic(){ if (ac){ stop('A'); setEcho(false); } onb.playing = false; }
// Prépare le morceau d'écoute ; `then` est appelé quand il est prêt (seulement si la fenêtre est toujours ouverte)
function onbSound(then){ ensureAudio(); if (ac.state !== 'running') ac.resume();
  songSafe('house', 0, 'B1').then(sg => { if (!onb.active) return; if (!run){ BPM = 124; P = 60 / BPM; } tracks = Object.assign({}, tracks, { B1: bufOf(sg) }); then(); }); }
function openOnb(steps = ONB, o = {}){
  Object.assign(onb, { active: true, i: 0, done: {}, base: {}, steps, fiche: !!o.fiche, keys: o.keys || [], after: o.after || null });
  $('onb').hidden = false; renderOnb(); setTimeout(() => $('onbNext').focus(), 30);
  if (onb.fiche) onbSound(() => { if (!onb.playing) onbStartMusic(); });
}
function closeOnb(){
  onb.active = false; $('onb').hidden = true; onbStopMusic(); cancelAnimationFrame(onb.raf);
  if (onb.fiche){ for (const k of onb.keys) if (!fichesSeen.includes(k)) fichesSeen.push(k); try { localStorage.setItem('coach-fiches', JSON.stringify(fichesSeen)); } catch (e) {} }
  else { guideSeen = true; try { localStorage.setItem('coach-guide-vu', '1'); } catch (e) {} }
  Object.assign(ctrl, CTRL_NEUTRE, LESSONS[li].init); applyCtrl(); updateSetup();
}
// Fin d'une série de fiches : la partie demandée démarre (sauf si on a fermé avec Échap ou la croix)
function closeFiche(go){ const after = onb.after; closeOnb(); if (go && after) after(); }
function onbMoved(k){
  const st = onb.steps[onb.i]; if (!onb.active || !st || st.k !== k) return;
  if (k === 'playB' || k === 'fxOn') onbSchemaPress($('onbSvg'), 'sv-', k);
  if (k === 'playB'){ onb.playing ? onbStopMusic() : onbStartMusic(); }
  else if (k === 'fxOn'){ if (!onb.playing) onbStartMusic(); setEcho(!echoOn); }
  else { const v = ctrl[k]; if (onb.base[k] == null) onb.base[k] = v; if (Math.abs(v - onb.base[k]) < .2) return; }
  if (!onb.done[onb.i]){ onb.done[onb.i] = true; chime(true); renderOnbTry(); const at = onb.i; setTimeout(() => { if (onb.active && onb.i === at && at < onb.steps.length - 1){ onb.i++; renderOnb(); } }, 1400); }
}
function renderOnbTry(){
  const st = onb.steps[onb.i], box = $('onbTry'); box.innerHTML = ''; box.hidden = !(st.k || st.phrase || st.parts);
  if (st.parts){
    const strip = document.createElement('div'); strip.className = 'onb-parts';
    for (const [name, full, w] of [['Intro', false, 2], ['Corps', true, 4], ['Break', false, 1], ['Corps', true, 3], ['Outro', false, 2]]){ const s = document.createElement('span'); s.className = full ? 'full' : ''; s.style.flexGrow = w; s.textContent = name; strip.appendChild(s); }
    const dl = document.createElement('dl'); dl.className = 'onb-lex';
    for (const w of ['intro', 'drop', 'break', 'outro']){ const x = LEX.find(e => e[0] === w), dt = document.createElement('dt'), dd = document.createElement('dd'); dt.textContent = x[1]; dd.textContent = x[2].charAt(0).toUpperCase() + x[2].slice(1) + '.'; dl.append(dt, dd); }
    box.append(strip, dl); return;
  }
  if (st.phrase){
    const g = document.createElement('div'); g.className = 'onb-grid'; g.id = 'onbGrid';
    for (let b = 0; b < 8; b++){ const bar = document.createElement('div'); bar.className = 'bar'; for (let j = 0; j < 4; j++) bar.appendChild(document.createElement('span')); g.appendChild(bar); }
    const c = document.createElement('span'); c.className = 'onb-count'; c.id = 'onbCount'; box.append(g, c); return;
  }
  if (!st.k) return;
  const btnKey = st.k === 'playB' || st.k === 'fxOn';
  const act = document.createElement('span'); act.className = 'act'; act.textContent = st.act + (tableOn() && map[st.k] ? '' : st.k === 'playB' ? ' (ou clique sur PLAY)' : st.k === 'fxOn' ? ' (ou clique sur ECHO)' : ' (ou utilise le curseur)'); box.appendChild(act);
  if (btnKey){ const b = document.createElement('button'); b.type = 'button'; b.className = 'onb-play'; b.textContent = st.k === 'playB' ? 'PLAY' : 'ECHO'; b.addEventListener('click', () => onbMoved(st.k)); box.appendChild(b); }
  else { const r = document.createElement('input'); r.type = 'range'; r.min = '0'; r.max = '1'; r.step = '.01'; r.value = ctrl[st.k]; r.setAttribute('aria-label', st.act);
    r.addEventListener('input', () => { ctrl[st.k] = +r.value; applyCtrl(); onbSchemaSet($('onbSvg'), 'sv-', st.k, ctrl[st.k]); onbMoved(st.k); }); box.appendChild(r); }
  if (st.k === 'cfxA' && tableOn() && !map.cfxA && !tableCfg){ const b = document.createElement('button'); b.type = 'button'; b.className = 'onb-learn'; b.textContent = learnKey === 'cfxA' ? 'Tourne le potard CFX…' : 'Faire reconnaître ce potard';
    b.addEventListener('click', () => { learnKey = 'cfxA'; renderOnbTry(); }); box.appendChild(b); }
  if (onb.done[onb.i]){ const ok = document.createElement('span'); ok.className = 'ok'; ok.textContent = 'Bien joué !'; box.appendChild(ok); }
}
function renderOnb(){
  const steps = onb.steps, st = steps[onb.i], last = onb.i === steps.length - 1;
  $('onbDots').innerHTML = steps.length > 1 ? steps.map((_, j) => `<i class="${j <= onb.i ? 'on' : ''}"></i>`).join('') : '';
  $('onbTitle').textContent = st.title; $('onbText').textContent = st.text;
  // Lot 62 : dans le guide (pas dans les fiches, qui montrent la table), Vini présente chaque étape, comme aux Premiers pas
  const vini = $('onbVini'); vini.hidden = onb.fiche; $('onb').classList.toggle('guide', !onb.fiche);
  if (!onb.fiche && !vini.firstChild && typeof viniMettre === 'function') viniMettre(vini, 'calme');
  if (st.k && st.k !== 'playB' && st.k !== 'fxOn') onb.base[st.k] = ctrl[st.k];
  $('onbSvg').style.display = st.hl ? '' : 'none'; onbHighlight(st.hl); onbSchemaSync();
  $('onbBack').hidden = onb.i === 0;
  $('onbSkip').textContent = onb.fiche ? 'Je connais, passer' : 'Passer le guide';
  $('onbNext').textContent = st.cta || (!last ? 'Suivant' : onb.fiche ? (onb.after ? 'Compris, on joue' : 'Compris') : 'Terminer');
  const pot = st.k && st.k !== 'playB' && st.k !== 'fxOn';
  $('onbNote').textContent = !pot ? '' : !midiCount ? 'Pas de table détectée : le curseur ci-dessus fait la même chose.' : !tableOn() ? 'Ta table n\'est pas encore réglée : le curseur ci-dessus fait la même chose.'
    : map[st.k] ? '' : tableCfg ? 'Ta table n\'a pas cette commande : le curseur ci-dessus fait la même chose.' : st.k === 'cfxA' ? 'Ta table doit d\'abord reconnaître ce potard : clique sur le bouton, puis tourne-le.' : '';
  renderOnbTry();
  cancelAnimationFrame(onb.raf);
  if (st.phrase){ if (!onb.playing) onbStartMusic(); const tick = () => { if (!onb.active || !onb.steps[onb.i].phrase) return;
      const cells = document.querySelectorAll('#onbGrid span'); const bt = Math.max(0, Math.floor((ac.currentTime - onb.t0) / P)) % 32;
      cells.forEach((c, j) => { c.classList.toggle('on', j === bt); c.classList.toggle('past', j < bt); });
      const ct = $('onbCount'); if (ct) ct.textContent = `Temps ${bt % 4 + 1} · mesure ${Math.floor(bt / 4) + 1} sur 8`;
      onb.raf = requestAnimationFrame(tick); }; tick(); }
}
$('onbNext').addEventListener('click', () => {
  if (onb.i === 0 && !onb.fiche){ $('onbNext').textContent = 'Préparation du son…'; onbSound(() => { onbStartMusic(); onb.i = 1; renderOnb(); }); return; }
  if (onb.i >= onb.steps.length - 1){ if (onb.fiche) closeFiche(true); else { closeOnb(); selectLesson(0); } return; }
  onb.i++; renderOnb();
});
$('onbBack').addEventListener('click', () => { if (onb.i > 0){ onb.i--; renderOnb(); } });
$('onbSkip').addEventListener('click', () => { if (onb.fiche) closeFiche(true); else closeOnb(); });
$('guideBtn').addEventListener('click', () => { if (!run) openOnb(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape' && onb.active){ if (onb.fiche) closeFiche(false); else closeOnb(); } });

new MutationObserver(() => { const t = $('hint').textContent.trim(); if (t) say(t); }).observe($('hint'), { childList: true, characterData: true, subtree: true });
