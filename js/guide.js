// Guide de premier lancement.
// Tous les fichiers de js/ partagent la même portée et sont chargés dans l'ordre indiqué dans index.html.
'use strict';
/* ---------- Guide de premier lancement ---------- */
const ONB = [
  { title: 'Bienvenue dans Coach DJ', text: 'Une transition, c\'est passer d\'un morceau à l\'autre sans que la piste de danse s\'arrête. Ici, tu l\'apprends geste par geste, sur ta FLX4. Ce petit tour prend une minute, avec le son.', cta: 'C\'est parti' },
  { title: 'Les faders de volume', text: 'Les deux curseurs verticaux au centre règlent le volume : celui de gauche pour le morceau A, celui de droite pour le morceau B. Un morceau joue sur A : baisse puis remonte le fader de gauche.', hl: 'faderA', k: 'faderA', act: 'Bouge le fader de gauche' },
  { title: 'Le potard LOW', text: 'Il gère les basses : la grosse caisse et la ligne de basse. Tourné à fond à gauche, elles disparaissent. C\'est le potard clé des transitions. Essaie sur la voie de gauche et écoute.', hl: 'lowA', k: 'lowA', act: 'Tourne le LOW de gauche' },
  { title: 'Le filtre CFX', text: 'Le dernier potard de chaque voie est un filtre. Vers la droite, le son s\'affine ; vers la gauche, il s\'étouffe. Au milieu, il ne fait rien.', hl: 'cfxA', k: 'cfxA', act: 'Tourne le CFX de gauche' },
  { title: 'Le bouton PLAY', text: 'En bas de chaque platine, PLAY lance ou arrête un morceau. Dans les niveaux, tu lances B avec le PLAY de droite. Appuie dessus : la musique s\'arrête, appuie encore : elle repart.', hl: 'playB', k: 'playB', act: 'Appuie sur PLAY à droite' },
  { title: 'Compter en phrases', text: 'Chaque coup de grosse caisse est un temps. 4 temps font une mesure, 8 mesures font une phrase de 32 temps. La musique change toujours au début d\'une phrase : c\'est là qu\'on fait les transitions. Suis la grille avec la musique.', phrase: true },
  { title: "Les parties d'un morceau", text: 'Un morceau se découpe en parties de quelques phrases. Dans les niveaux, elles portent ces noms et ont ces couleurs sur la piste.', parts: true },
  { title: 'Tu es prêt', text: 'Commence par le niveau 1. Clique sur « Regarde d\'abord » pour voir le geste parfait, puis sur « Jouer ». Avant chaque niveau, le site te dit où placer tes faders et potards.', cta: 'Commencer le niveau 1' }
];
const onb = { active: false, i: 0, done: {}, base: {}, t0: 0, playing: false, raf: 0 };
let guideSeen = false; try { guideSeen = localStorage.getItem('coach-guide-vu') === '1'; } catch (e) {}
const ONB_KNOBS = [['TRIM', 34], ['HI', 62], ['MID', 88], ['LOW', 114], ['CFX', 146]];
(function drawOnbKnobs(){ const g = $('sv-knobs'); let h = '';
  for (const [lab, y] of ONB_KNOBS){ for (const [x, side] of [[266, 'A'], [334, 'B']]) h += `<circle class="part" id="sv-${lab.toLowerCase()}${side}" cx="${x}" cy="${y}" r="10"/>`; h += `<text x="300" y="${y + 4}" text-anchor="middle">${lab}</text>`; }
  g.innerHTML = h; })();
function onbHighlight(id){
  document.querySelectorAll('#onbSvg .hl').forEach(e => e.classList.remove('hl')); document.querySelectorAll('#onbSvg .hl-ring').forEach(e => e.remove());
  if (!id) return; const el = id === 'lowA' ? $('sv-lowA') : id === 'cfxA' ? $('sv-cfxA') : $('sv-' + id); if (!el) return;
  const t = el.tagName === 'g' ? el.firstElementChild : el; t.classList.add('hl');
  const bb = t.getBBox ? t.getBBox() : null; if (!bb) return;
  const r = document.createElementNS('http://www.w3.org/2000/svg', 'rect'); r.setAttribute('class', 'hl-ring');
  r.setAttribute('x', bb.x - 8); r.setAttribute('y', bb.y - 8); r.setAttribute('width', bb.width + 16); r.setAttribute('height', bb.height + 16); r.setAttribute('rx', 10); $('onbSvg').appendChild(r);
}
function onbStartMusic(){
  ensureAudio(); if (ac.state !== 'running') ac.resume();
  if (!tracks) return;
  Object.assign(ctrl, { faderA: 1, lowA: .5, cfxA: .5 }); applyCtrl();
  onb.t0 = ac.currentTime + .1; play('A', tracks.B1, onb.t0, 64 * P, true); onb.playing = true;
}
function onbStopMusic(){ if (ac) stop('A'); onb.playing = false; }
function openOnb(){ onb.active = true; onb.i = 0; onb.done = {}; $('onb').hidden = false; renderOnb(); setTimeout(() => $('onbNext').focus(), 30); }
function closeOnb(){
  onb.active = false; $('onb').hidden = true; onbStopMusic(); cancelAnimationFrame(onb.raf);
  guideSeen = true; try { localStorage.setItem('coach-guide-vu', '1'); } catch (e) {}
  Object.assign(ctrl, LESSONS[li].init); applyCtrl(); updateSetup();
}
function onbMoved(k){
  const st = ONB[onb.i]; if (!onb.active || !st || st.k !== k) return;
  if (k === 'playB'){ onb.playing ? onbStopMusic() : onbStartMusic(); }
  else { const v = ctrl[k]; if (onb.base[k] == null) onb.base[k] = v; if (Math.abs(v - onb.base[k]) < .2) return; }
  if (!onb.done[onb.i]){ onb.done[onb.i] = true; chime(true); renderOnbTry(); const at = onb.i; setTimeout(() => { if (onb.active && onb.i === at && at < ONB.length - 1){ onb.i++; renderOnb(); } }, 1400); }
}
function renderOnbTry(){
  const st = ONB[onb.i], box = $('onbTry'); box.innerHTML = ''; box.hidden = !(st.k || st.phrase || st.parts);
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
  const act = document.createElement('span'); act.className = 'act'; act.textContent = st.act + (midiCount ? '' : st.k === 'playB' ? ' (ou clique sur PLAY)' : ' (ou utilise le curseur)'); box.appendChild(act);
  if (st.k === 'playB'){ const b = document.createElement('button'); b.type = 'button'; b.className = 'onb-play'; b.textContent = 'PLAY'; b.addEventListener('click', () => onbMoved('playB')); box.appendChild(b); }
  else { const r = document.createElement('input'); r.type = 'range'; r.min = '0'; r.max = '1'; r.step = '.01'; r.value = ctrl[st.k]; r.setAttribute('aria-label', st.act);
    r.addEventListener('input', () => { ctrl[st.k] = +r.value; applyCtrl(); onbMoved(st.k); }); box.appendChild(r); }
  if (st.k === 'cfxA' && midiCount && !map.cfxA){ const b = document.createElement('button'); b.type = 'button'; b.className = 'onb-learn'; b.textContent = learnKey === 'cfxA' ? 'Tourne le potard CFX…' : 'Faire reconnaître ce potard';
    b.addEventListener('click', () => { learnKey = 'cfxA'; renderOnbTry(); }); box.appendChild(b); }
  if (onb.done[onb.i]){ const ok = document.createElement('span'); ok.className = 'ok'; ok.textContent = 'Bien joué !'; box.appendChild(ok); }
}
function renderOnb(){
  const st = ONB[onb.i];
  $('onbDots').innerHTML = ONB.map((_, j) => `<i class="${j <= onb.i ? 'on' : ''}"></i>`).join('');
  $('onbTitle').textContent = st.title; $('onbText').textContent = st.text;
  if (st.k && st.k !== 'playB') onb.base[st.k] = ctrl[st.k];
  $('onbSvg').style.display = st.hl || (onb.i > 0 && onb.i < 5) ? '' : 'none'; onbHighlight(st.hl);
  $('onbBack').hidden = onb.i === 0; $('onbTest').hidden = onb.i !== ONB.length - 1 || ch2Unlocked(); $('onbNext').textContent = st.cta || (onb.i === ONB.length - 1 ? 'Terminer' : 'Suivant');
  $('onbNote').textContent = st.k && st.k !== 'playB' && !midiCount ? 'Pas de table détectée : le curseur ci-dessus fait la même chose.' : st.k === 'cfxA' && midiCount && !map.cfxA ? 'Ta table doit d\'abord reconnaître ce potard : clique sur le bouton, puis tourne-le.' : '';
  renderOnbTry();
  cancelAnimationFrame(onb.raf);
  if (st.phrase){ if (!onb.playing) onbStartMusic(); const tick = () => { if (!onb.active || !ONB[onb.i].phrase) return;
      const cells = document.querySelectorAll('#onbGrid span'); const bt = Math.max(0, Math.floor((ac.currentTime - onb.t0) / P)) % 32;
      cells.forEach((c, j) => { c.classList.toggle('on', j === bt); c.classList.toggle('past', j < bt); });
      const ct = $('onbCount'); if (ct) ct.textContent = `Temps ${bt % 4 + 1} · mesure ${Math.floor(bt / 4) + 1} sur 8`;
      onb.raf = requestAnimationFrame(tick); }; tick(); }
}
$('onbNext').addEventListener('click', () => {
  if (onb.i === 0){ $('onbNext').textContent = 'Préparation du son…'; ensureAudio(); if (ac.state !== 'running') ac.resume(); songSafe('house', 0, 'B1').then(sg => { if (!onb.active) return; if (!run){ BPM = 124; P = 60 / BPM; } tracks = Object.assign({}, tracks, { B1: bufOf(sg) }); onbStartMusic(); onb.i = 1; renderOnb(); }); return; }
  if (onb.i >= ONB.length - 1){ closeOnb(); selectLesson(0); return; }
  onb.i++; renderOnb();
});
$('onbBack').addEventListener('click', () => { if (onb.i > 0){ onb.i--; renderOnb(); } });
$('onbSkip').addEventListener('click', closeOnb);
$('onbTest').addEventListener('click', () => { closeOnb(); startPlacement(); });
$('guideBtn').addEventListener('click', () => { if (!run) openOnb(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape' && onb.active) closeOnb(); });

new MutationObserver(() => { const t = $('hint').textContent.trim(); if (t) say(t); }).observe($('hint'), { childList: true, characterData: true, subtree: true });
