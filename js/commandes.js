// La table complète à l'écran (lot 39) : molettes, PLAY et CUE, pads (hot cues et boucles), CUE casque, vumètres.
// Les potards et les faders (aigus, TRIM, tempo, crossfader compris) sont construits par controles.js.
// Tous les fichiers de js/ partagent la même portée et sont chargés dans l'ordre indiqué dans index.html.
'use strict';
/* ---------- Commandes allumées ou éteintes ----------
   Un niveau dit de quels groupes il se sert (`show`) ; les autres commandes restent visibles, mais éteintes et inertes
   (ni souris, ni clavier). Rien d'allumé hors des niveaux qui en ont besoin : un PLAY de A pressé par erreur arrêterait
   la musique en pleine partie. */
function tableAllume(show){
  document.querySelectorAll('.deck [data-g]').forEach(el => { const on = show.includes(el.dataset.g); el.classList.toggle('eteint', !on); el.inert = !on; });
}

/* ---------- Les pads ---------- */
const padMode = { A: 'hc', B: 'hc' };
const PAD_BOUCLES = [4, 8, 16];
function renderPads(k){
  const box = $('pads' + k); if (!box) return; const d = deck[k], hc = padMode[k] === 'hc';
  document.querySelectorAll(`.ptabs [data-p="${k}"]`).forEach(b => b.setAttribute('aria-pressed', String(b.dataset.mode === padMode[k])));
  if (box.children.length !== 4) box.innerHTML = '<button type="button" class="pad"></button>'.repeat(4);
  [...box.children].forEach((b, i) => {
    if (hc){ const pose = !!(d.cues && d.cues[i] != null); b.textContent = String(i + 1); b.classList.toggle('pose', pose); b.classList.remove('live');
      b.setAttribute('aria-label', `Hot cue ${i + 1} de ${k}${pose ? ' (posé ; clic droit pour l’effacer)' : ' (vide : un clic le pose)'}`); }
    else { const t = PAD_BOUCLES[i]; b.textContent = t ? String(t) : 'EXIT'; b.classList.remove('pose');
      b.classList.toggle('live', !!(t && d.boucle && d.boucle.temps === t)); b.setAttribute('aria-label', t ? `Boucle de ${t} temps sur ${k}` : `Sortir de la boucle de ${k}`); }
  });
}
function padPresse(k, i){
  // chapitre 6 : le geste est noté (instant entendu), et le niveau décide de ce qu'il fait (hotcues.js)
  if (run && LESSONS[li].hc){ hcPad(k, padMode[k], i); return; }
  ensureAudio();
  if (padMode[k] === 'hc') plHotCue(k, i);
  else if (PAD_BOUCLES[i]) plBoucle(k, PAD_BOUCLES[i]); else plSortie(k);
  renderPads(k);
}

/* ---------- La molette à la souris ----------
   On la fait tourner en glissant autour de son centre : chaque degré tourné compte comme un cran (signé). */
function jogSouris(el){
  const k = el.dataset.p; let last = null;
  const angle = e => { const r = el.getBoundingClientRect(); return Math.atan2(e.clientY - (r.top + r.height / 2), e.clientX - (r.left + r.width / 2)) * 180 / Math.PI; };
  el.addEventListener('pointerdown', e => { e.preventDefault(); el.focus(); try { el.setPointerCapture(e.pointerId); } catch (_) {} last = angle(e); el.classList.add('tenu'); });
  el.addEventListener('pointermove', e => { if (last == null) return; const a = angle(e); let d = a - last; if (d > 180) d -= 360; if (d < -180) d += 360; last = a;
    if (Math.abs(d) >= .5){ plJog(k, Math.round(d)); gestureMark(); } });
  ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(t => el.addEventListener(t, () => { last = null; el.classList.remove('tenu'); }));
  el.addEventListener('keydown', e => { const n = e.shiftKey ? 30 : 8;
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp'){ e.preventDefault(); plJog(k, n); }
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown'){ e.preventDefault(); plJog(k, -n); } });
}

/* ---------- Ce qui bouge tout seul : repère des molettes, vumètres, BPM ---------- */
const vuBuf = new Float32Array(512);
function tableAnime(){
  requestAnimationFrame(tableAnime);
  if (!ac || $('vLearn').hidden) return;
  for (const k of ['A', 'B']){ const d = deck[k];
    // 33 tours ⅓ par minute : un tour toutes les 1,8 s de morceau
    const mk = document.querySelector(`#jog${k} .mk`); if (mk) mk.style.transform = `rotate(${((plPos(k) / 1.8) % 1) * 360}deg)`;
    const vu = document.querySelector(`#vu${k} i`);
    if (vu && d.an){ d.an.getFloatTimeDomainData(vuBuf); let m = 0; for (let i = 0; i < vuBuf.length; i++) m = Math.max(m, Math.abs(vuBuf[i]));
      vu.style.height = Math.min(100, Math.round(m * 110)) + '%'; }
    const bpm = $('bpm' + k); if (bpm){ const b = d.joue && d.per ? 60 / d.per * d.rate : null; bpm.textContent = b ? b.toFixed(1).replace('.', ',') + ' BPM' : ''; }
  }
}

/* ---------- Branchements ---------- */
function buildCommandes(){
  for (const k of ['A', 'B']){
    jogSouris($('jog' + k));
    const cue = $('cue' + k);
    cue.addEventListener('pointerdown', e => { e.preventDefault(); ensureAudio(); plCue(k, true); });
    ['pointerup', 'pointercancel', 'pointerleave'].forEach(t => cue.addEventListener(t, () => plCue(k, false)));
    $('casque' + k).addEventListener('click', () => { ensureAudio(); $('casque' + k).setAttribute('aria-pressed', String(plCasqueBascule(k))); });
    const box = $('pads' + k), num = b => [...box.children].indexOf(b);
    // Un pad part à l'appui (comme sur la table), pas au relâchement du clic : au chapitre 6, l'appui est noté en millisecondes.
    // Le clic sans souris (clavier : Entrée ou espace sur le pad) garde le chemin du clic.
    box.addEventListener('pointerdown', e => { const b = e.target.closest('.pad'); if (!b || e.button !== 0) return; e.preventDefault(); padPresse(k, num(b)); });
    box.addEventListener('click', e => { const b = e.target.closest('.pad'); if (b && e.detail === 0) padPresse(k, num(b)); });
    box.addEventListener('contextmenu', e => { const b = e.target.closest('.pad'); if (!b || padMode[k] !== 'hc') return; e.preventDefault();
      if (run && LESSONS[li].hc) hcPad(k, 'efface', num(b)); else { plHotCueEfface(k, num(b)); renderPads(k); } });
    renderPads(k);
  }
  $('playA').addEventListener('click', () => { ensureAudio(); plLecture('A'); });
  document.querySelectorAll('.ptabs button').forEach(b => b.addEventListener('click', () => { padMode[b.dataset.p] = b.dataset.mode; renderPads(b.dataset.p); }));
  requestAnimationFrame(tableAnime);
}
// Au changement de niveau : casque coupé, pads remis à neuf
function tableDepart(){ for (const k of ['A', 'B']){ $('casque' + k).setAttribute('aria-pressed', 'false'); padMode[k] = 'hc'; renderPads(k); } }
