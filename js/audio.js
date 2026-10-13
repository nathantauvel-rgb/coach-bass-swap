// Audio : platines, égaliseurs, filtre, écho, cache des morceaux.
// Tous les fichiers de js/ partagent la même portée et sont chargés dans l'ordre indiqué dans index.html.
'use strict';
/* ---------- Audio ---------- */
let ac = null, master = null, tracks = null, outChannels = 2;
const deck = { A: { node: null, gain: null }, B: { node: null, gain: null } };
const ctrl = { faderA: 1, faderB: 0, lowA: .5, lowB: .5, cfxA: .5, midA: .5, midB: .5 };
const db2g = db => Math.pow(10, db / 20);
const lowDb = v => v <= .5 ? -40 + 80 * v : (v - .5) * 12;
const cfxText = v => Math.abs(v - .5) < .03 ? 'neutre' : v > .5 ? 'coupe-bas ' + Math.round((v - .5) * 200) + ' %' : 'coupe-haut ' + Math.round((.5 - v) * 200) + ' %';
function ensureAudio(){
  if (ac) return;
  ac = new (window.AudioContext || window.webkitAudioContext)();
  master = ac.createGain(); master.gain.value = .75;
  const lim = ac.createDynamicsCompressor(); lim.threshold.value = -6; lim.knee.value = 0; lim.ratio.value = 20; lim.attack.value = .002; lim.release.value = .12;
  master.connect(lim);
  const dest = ac.destination;
  try {
    if (dest.maxChannelCount >= 4){
      dest.channelCount = 4; dest.channelCountMode = 'explicit'; dest.channelInterpretation = 'discrete';
      const split = ac.createChannelSplitter(2), merge = ac.createChannelMerger(4);
      lim.connect(split); split.connect(merge, 0, 0); split.connect(merge, 1, 1); split.connect(merge, 0, 2); split.connect(merge, 1, 3); merge.connect(dest); outChannels = 4;
    } else lim.connect(dest);
  } catch (e){ try { lim.disconnect(); } catch (_) {} lim.connect(dest); }
  for (const k of ['A', 'B']){ const d = deck[k];
    d.eq = ac.createBiquadFilter(); d.eq.type = 'lowshelf'; d.eq.frequency.value = 220; d.gain = ac.createGain();
    d.mid = ac.createBiquadFilter(); d.mid.type = 'peaking'; d.mid.frequency.value = 1000; d.mid.Q.value = .7;
    if (k === 'A'){
      // Filtre CFX (coupe-bas à droite, coupe-haut à gauche) et écho envoyé après le fader : l'écho résonne encore quand le fader est coupé
      d.hp = ac.createBiquadFilter(); d.hp.type = 'highpass'; d.hp.frequency.value = 10; d.hp.Q.value = 1.1;
      d.lp = ac.createBiquadFilter(); d.lp.type = 'lowpass'; d.lp.frequency.value = 22000; d.lp.Q.value = 1.1;
      d.eq.connect(d.mid); d.mid.connect(d.hp); d.hp.connect(d.lp); d.lp.connect(d.gain);
      d.echoIn = ac.createGain(); d.echoIn.gain.value = 0; d.delay = ac.createDelay(4); d.delay.delayTime.value = P * .75;
      d.fb = ac.createGain(); d.fb.gain.value = .58; d.wet = ac.createGain(); d.wet.gain.value = .85;
      d.gain.connect(d.echoIn); d.echoIn.connect(d.delay); d.delay.connect(d.fb); d.fb.connect(d.delay); d.delay.connect(d.wet); d.wet.connect(master);
    } else { d.eq.connect(d.mid); d.mid.connect(d.gain); }
    d.gain.connect(master); }
  applyCtrl();
}
function bufferOf(t){ const b = ac.createBuffer(2, t.N, SR); b.getChannelData(0).set(t.L); b.getChannelData(1).set(t.R); return b; }
// Morceaux préparés à l'avance : calculés dès le choix du niveau, réutilisés pour rejouer
const songCache = {}, songOrder = [];
function getSong(sty, vr, part){
  const k = sty + ':' + vr + ':' + part;
  if (!songCache[k]){ const d = STYLE_DEFS[sty], isA = part === 'A';
    const p = renderSong(sty, isA ? 'A' : 'B', d.seed + (isA ? 0 : 12) + vr * 101, isA ? SEC_A : SEC_B(part === 'B1'), isA ? { end: 128, tail: 4 } : {}, d.bpm);
    songCache[k] = p; p.catch(() => { if (songCache[k] === p) delete songCache[k]; });
    songOrder.push(k); while (songOrder.length > 10) delete songCache[songOrder.shift()]; }
  return songCache[k];
}
const bufOf = song => song.buf || (song.buf = bufferOf(song));
const songSafe = (sty, vr, part) => getSong(sty, vr, part).catch(() => getSong(sty, vr, part));
let sel = { sty: 'house', vr: 0 }, firstSel = true, warm = null;
function chooseSongs(){
  const l = LESSONS[li]; if (l.wave) return;
  if (prac) sel = { sty: prac.sty, vr: prac.vr };
  else { sel = { sty: chapter === 2 ? CH2_STYLE[li] : pickStyle(), vr: firstSel ? 0 : Math.floor(Math.random() * VARIANTS) }; firstSel = false; }
  const s0 = sel, go = () => { if (!hasWorkers()) return; getSong(s0.sty, s0.vr, 'A').catch(() => {}); getSong(s0.sty, s0.vr, l.bBass ? 'B1' : 'B0').catch(() => {}); };
  if (warm) warm.then(go); else go();
  const d = STYLE_DEFS[sel.sty]; $('styleTag').textContent = d.label + ' · ' + d.bpm + ' BPM';
}
function applyCtrl(){
  Object.keys(ctrl).forEach(renderControl);
  if (!ac) return; const t = ac.currentTime;
  deck.A.eq.gain.setTargetAtTime(lowDb(ctrl.lowA), t, .01); deck.B.eq.gain.setTargetAtTime(lowDb(ctrl.lowB), t, .01);
  deck.A.mid.gain.setTargetAtTime(lowDb(ctrl.midA), t, .01); deck.B.mid.gain.setTargetAtTime(lowDb(ctrl.midB), t, .01);
  deck.A.gain.gain.setTargetAtTime(ctrl.faderA * ctrl.faderA, t, .015); deck.B.gain.gain.setTargetAtTime(ctrl.faderB * ctrl.faderB, t, .015);
  const c = ctrl.cfxA, hpF = c > .52 ? 20 * Math.pow(400, (c - .5) * 2) : 10, lpF = c < .48 ? 20000 * Math.pow(1 / 150, (.5 - c) * 2) : 22000;
  deck.A.hp.frequency.setTargetAtTime(hpF, t, .02); deck.A.lp.frequency.setTargetAtTime(lpF, t, .02);
}
function play(k, buf, when, pos, loop, ls = 64, le = 128){
  const d = deck[k]; stop(k);
  const n = ac.createBufferSource(); n.buffer = buf;
  if (loop){ n.loop = true; n.loopStart = ls * P; n.loopEnd = le * P; }
  n.connect(d.eq); n.start(when, pos); d.node = n;
}
function stop(k){ const d = deck[k]; if (d.node){ try { d.node.stop(); } catch (e) {} d.node.disconnect(); d.node = null; } }
