// Potards et faders affichés à l'écran.
// Tous les fichiers de js/ partagent la même portée et sont chargés dans l'ordre indiqué dans index.html.
'use strict';
/* ---------- Potards et faders ---------- */
const SWEEP = 2.356, controls = {};
function arc(cx, cy, r, a0, a1){ const p = a => [cx + r * Math.sin(a), cy - r * Math.cos(a)]; if (Math.abs(a1 - a0) < .001) return '';
  const [x0, y0] = p(Math.min(a0, a1)), [x1, y1] = p(Math.max(a0, a1));
  return `M${x0.toFixed(2)} ${y0.toFixed(2)} A${r} ${r} 0 ${Math.abs(a1 - a0) > Math.PI ? 1 : 0} 1 ${x1.toFixed(2)} ${y1.toFixed(2)}`; }
function buildControls(){
  document.querySelectorAll('.knob').forEach(el => {
    el.innerHTML = `<svg viewBox="0 0 60 60" aria-hidden="true"><path class="trk" d="${arc(30, 30, 25, -SWEEP, SWEEP)}"/><path class="arc"/><circle class="body" cx="30" cy="30" r="17"/><line class="ptr" x1="30" y1="30" x2="30" y2="17"/></svg><span class="kv"></span>`;
    controls[el.dataset.k] = el; });
  document.querySelectorAll('.fader').forEach(el => { controls[el.dataset.k] = el; });
  for (const k in controls){
    const el = controls[k], knob = el.classList.contains('knob');
    el.setAttribute('role', 'slider'); el.tabIndex = 0; el.setAttribute('aria-valuemin', '0'); el.setAttribute('aria-valuemax', '100');
    let sy = 0, sv = 0;
    const set = v => { if (isAuto(k)) return; ctrl[k] = Math.max(0, Math.min(1, v)); applyCtrl(); gestureMark(); };
    // le crossfader est couché : on lit la position de gauche (A) à droite (B)
    const fromPos = e => { const r = el.getBoundingClientRect(); return el.classList.contains('xf') ? (e.clientX - r.left - 22) / (r.width - 44) : 1 - (e.clientY - r.top - 22) / (r.height - 44); };
    el.addEventListener('pointerdown', e => { e.preventDefault(); el.focus(); try { el.setPointerCapture(e.pointerId); } catch (_) {} sy = e.clientY; sv = ctrl[k]; if (!knob) set(fromPos(e)); el._d = true; });
    el.addEventListener('pointermove', e => { if (!el._d) return; knob ? set(sv + (sy - e.clientY) / 150) : set(fromPos(e)); });
    ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(t => el.addEventListener(t, () => { el._d = false; }));
    el.addEventListener('keydown', e => { const st = e.shiftKey ? .1 : .03;
      if (e.key === 'ArrowUp' || e.key === 'ArrowRight'){ e.preventDefault(); set(ctrl[k] + st); }
      else if (e.key === 'ArrowDown' || e.key === 'ArrowLeft'){ e.preventDefault(); set(ctrl[k] - st); } });
  }
}
function renderControl(k){
  const el = controls[k]; if (!el) return; const v = ctrl[k];
  // potard de la table de mixage qui vient de bouger : sa valeur s'affiche un instant (lot 39)
  if (el._v != null && Math.abs(el._v - v) > .001 && el.closest('.mx')){ el.classList.add('bouge'); clearTimeout(el._b); el._b = setTimeout(() => el.classList.remove('bouge'), 900); }
  el._v = v;
  el.style.setProperty('--v', v); el.setAttribute('aria-valuenow', String(Math.round(v * 100)));
  if (el.classList.contains('knob')){
    const a = -SWEEP + v * 2 * SWEEP; el.querySelector('.arc').setAttribute('d', arc(30, 30, 25, 0, a));
    const p = el.querySelector('.ptr'); p.setAttribute('x2', (30 + 13 * Math.sin(a)).toFixed(2)); p.setAttribute('y2', (30 - 13 * Math.cos(a)).toFixed(2));
    const db = k.startsWith('trim') ? trimDb(v) : lowDb(v);
    const t = k.startsWith('cfx') ? cfxText(v) : v < .04 ? 'coupé' : (db > 0 ? '+' : '') + db.toFixed(0) + ' dB'; el.querySelector('.kv').textContent = t; el.setAttribute('aria-valuetext', t);
  }
  // tempo : l'écart en pour cent, sous le curseur
  if (k.startsWith('tempo')){ const pct = plTempoPct(k.slice(-1)) * 100, t = (pct > .05 ? '+' : pct < -.05 ? '−' : '') + Math.abs(pct).toFixed(1).replace('.', ',') + ' %';
    const out = $('tpct' + k.slice(-1)); if (out) out.textContent = t; el.setAttribute('aria-valuetext', t); }
}
