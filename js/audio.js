// Audio : platines, égaliseurs, filtre, écho, cache des morceaux.
// Tous les fichiers de js/ partagent la même portée et sont chargés dans l'ordre indiqué dans index.html.
'use strict';
/* ---------- Audio ---------- */
let ac = null, master = null, tracks = null, outChannels = 2, hpBus = null, hpSalle = null;
const deck = { A: { node: null, gain: null }, B: { node: null, gain: null } };
// Lot 39 (table complète) : aigus, TRIM, filtre de B, crossfader et tempo. Au neutre (CTRL_NEUTRE), ils ne changent rien au son :
// les niveaux qui ne s'en servent pas sonnent comme avant. Chaque niveau repart du neutre (Object.assign(ctrl, CTRL_NEUTRE, l.init)).
const CTRL_NEUTRE = { hiA: .5, hiB: .5, trimA: .5, trimB: .5, cfxB: .5, xfader: .5, tempoA: .5, tempoB: .5 };
const ctrl = Object.assign({ faderA: 1, faderB: 0, lowA: .5, lowB: .5, cfxA: .5, midA: .5, midB: .5 }, CTRL_NEUTRE);
const db2g = db => Math.pow(10, db / 20);
const lowDb = v => v <= .5 ? -40 + 80 * v : (v - .5) * 12;
// TRIM : coupé tout à gauche, 0 dB à midi, +9 dB tout à droite
const trimDb = v => v <= .5 ? -40 + 80 * v : (v - .5) * 18;
// Crossfader : les deux voies à fond au milieu, puis celle qu'on quitte descend (courbe douce, sans creux au centre)
const xfGain = (x, k) => k === 'A' ? (x <= .5 ? 1 : Math.cos((x - .5) * Math.PI)) : (x >= .5 ? 1 : Math.cos((.5 - x) * Math.PI));
// Filtre (CFX) : coupe-bas vers la droite, coupe-haut vers la gauche
const cfxFreq = c => [c > .52 ? 20 * Math.pow(400, (c - .5) * 2) : 10, c < .48 ? 20000 * Math.pow(1 / 150, (.5 - c) * 2) : 22000];
const cfxText = v => Math.abs(v - .5) < .03 ? 'neutre' : v > .5 ? 'coupe-bas ' + Math.round((v - .5) * 200) + ' %' : 'coupe-haut ' + Math.round((.5 - v) * 200) + ' %';
function ensureAudio(){
  if (ac) return;
  ac = new (window.AudioContext || window.webkitAudioContext)();
  master = ac.createGain(); master.gain.value = .75;
  const lim = ac.createDynamicsCompressor(); lim.threshold.value = -6; lim.knee.value = 0; lim.ratio.value = 20; lim.attack.value = .002; lim.release.value = .12;
  master.connect(lim);
  // Le casque (lot 39) : le son de la salle, ou celui des voies dont le CUE casque est allumé (avant leur fader)
  hpBus = ac.createGain(); hpBus.gain.value = 1; hpSalle = ac.createGain(); hpSalle.gain.value = 1; lim.connect(hpSalle); hpSalle.connect(hpBus);
  const dest = ac.destination;
  try {
    if (dest.maxChannelCount >= 4){
      // Table avec sa carte son (FLX4…) : sorties 1-2 pour la salle, 3-4 pour le casque
      dest.channelCount = 4; dest.channelCountMode = 'explicit'; dest.channelInterpretation = 'discrete';
      const split = ac.createChannelSplitter(2), splitHp = ac.createChannelSplitter(2), merge = ac.createChannelMerger(4);
      lim.connect(split); split.connect(merge, 0, 0); split.connect(merge, 1, 1); hpBus.connect(splitHp); splitHp.connect(merge, 0, 2); splitHp.connect(merge, 1, 3); merge.connect(dest); outChannels = 4;
    } else lim.connect(dest);
  } catch (e){ try { lim.disconnect(); lim.connect(hpSalle); } catch (_) {} lim.connect(dest); }
  // Une voie : TRIM → LOW → MID → HI → filtre (coupe-bas, coupe-haut) → [écoute au casque] → fader → crossfader → salle
  for (const k of ['A', 'B']){ const d = deck[k];
    d.trim = ac.createGain();
    d.eq = ac.createBiquadFilter(); d.eq.type = 'lowshelf'; d.eq.frequency.value = 220; d.gain = ac.createGain();
    d.mid = ac.createBiquadFilter(); d.mid.type = 'peaking'; d.mid.frequency.value = 1000; d.mid.Q.value = .7;
    d.hi = ac.createBiquadFilter(); d.hi.type = 'highshelf'; d.hi.frequency.value = 3200;
    // A garde le réglage de ses filtres d'avant ; sur B (nouveau), une courbe plate : au neutre, rien ne bouge dans le son
    const q = k === 'A' ? 1.1 : Math.SQRT1_2;
    d.hp = ac.createBiquadFilter(); d.hp.type = 'highpass'; d.hp.frequency.value = 10; d.hp.Q.value = q;
    d.lp = ac.createBiquadFilter(); d.lp.type = 'lowpass'; d.lp.frequency.value = 22000; d.lp.Q.value = q;
    d.pfl = ac.createGain(); d.pfl.gain.value = 0; d.xf = ac.createGain();
    // sans sortie casque (table sans carte son à 4 sorties) : la voie au casque est jouée tout bas dans les enceintes (lot 40)
    d.simu = ac.createGain(); d.simu.gain.value = 0;
    d.an = ac.createAnalyser(); d.an.fftSize = 512;   // vumètre de la voie (après le fader)
    d.trim.connect(d.eq); d.eq.connect(d.mid); d.mid.connect(d.hi); d.hi.connect(d.hp); d.hp.connect(d.lp); d.lp.connect(d.gain); d.lp.connect(d.pfl); d.pfl.connect(hpBus); d.lp.connect(d.simu); d.simu.connect(master);
    d.gain.connect(d.xf); d.xf.connect(master); d.xf.connect(d.an);
    if (k === 'A'){
      // Écho envoyé après le fader : il résonne encore quand le fader est coupé
      d.echoIn = ac.createGain(); d.echoIn.gain.value = 0; d.delay = ac.createDelay(4); d.delay.delayTime.value = P * .75;
      d.fb = ac.createGain(); d.fb.gain.value = .58; d.wet = ac.createGain(); d.wet.gain.value = .85;
      d.gain.connect(d.echoIn); d.echoIn.connect(d.delay); d.delay.connect(d.fb); d.fb.connect(d.delay); d.delay.connect(d.wet); d.wet.connect(master);
    } }
  applyCtrl(); plCasque();
}
function bufferOf(t){ const b = ac.createBuffer(2, t.N, SR); b.getChannelData(0).set(t.L); b.getChannelData(1).set(t.R); return b; }
// Morceaux préparés à l'avance : calculés dès le choix du niveau, réutilisés pour rejouer
const songCache = {}, songOrder = [];
function getSong(sty, vr, part, spd = 1){
  const k = sty + ':' + vr + ':' + part + (spd !== 1 ? ':' + spd : '');
  if (!songCache[k]){ const d = STYLE_DEFS[sty], isA = part === 'A';
    const p = sty === 'vrai' ? vraiSong(vr, part, spd) : renderSong(sty, isA ? 'A' : 'B', d.seed + (isA ? 0 : 12) + vr * 101, isA ? SEC_A : SEC_B(part === 'B1'), isA ? { end: 128, tail: 4 } : {}, d.bpm * spd);
    songCache[k] = p; p.catch(() => { if (songCache[k] === p) delete songCache[k]; });
    // vrai morceau qui n'a pas pu se charger : on réessaiera la prochaine fois
    if (sty === 'vrai') p.then(s => { if (s.panne && songCache[k] === p) delete songCache[k]; }, () => {});
    songOrder.push(k); while (songOrder.length > 10) delete songCache[songOrder.shift()]; }
  return songCache[k];
}
const bufOf = song => song.buf || (song.buf = bufferOf(song));
const songSafe = (sty, vr, part, spd = 1) => getSong(sty, vr, part, spd).catch(() => getSong(sty, vr, part, spd));
let sel = { sty: 'house', vr: 0 }, firstSel = true, warm = null;
function chooseSongs(){
  const l = LESSONS[li]; if (l.wave) return;
  if (prac) sel = { sty: prac.sty, vr: prac.vr };
  else { sel = { sty: chapter === 2 ? CH2_STYLE[li] : pickStyle(), vr: firstSel ? 0 : Math.floor(Math.random() * VARIANTS) }; firstSel = false; }
  // chapitre 5 : toujours la house fabriquée par le site, à 124 BPM (CAL_BPM_A) et à la grille parfaite, quel que soit le
  // style choisi : avec Techno (130) ou Afro (120), A n'était pas au tempo du chapitre et B dérivait tout seul (gardien, lot 40)
  if (chapter === 5) sel.sty = 'house';
  warmSongs();
  const d = STYLE_DEFS[sel.sty]; $('styleTag').textContent = sel.sty === 'vrai' ? vraiTitres(sel.vr, l.bBass) : d.label + ' · ' + d.bpm + ' BPM';
}
// Prépare à l'avance les morceaux du niveau choisi. La vraie musique (environ 2 Mo) n'est téléchargée que sur l'écran des
// leçons : pas sur l'accueil (setView la prépare en arrivant dans Apprendre).
function warmSongs(){
  const l = LESSONS[li], s0 = sel; if (l.wave || (s0.sty === 'vrai' && $('vLearn').hidden)) return;
  const go = () => { if (!hasWorkers() && s0.sty !== 'vrai') return; getSong(s0.sty, s0.vr, 'A').catch(() => {}); getSong(s0.sty, s0.vr, l.bBass ? 'B1' : 'B0').catch(() => {}); };
  if (warm) warm.then(go); else go();
}
function applyCtrl(){
  Object.keys(ctrl).forEach(renderControl);
  if (!ac) return; const t = ac.currentTime;
  deck.A.eq.gain.setTargetAtTime(lowDb(ctrl.lowA), t, .01); deck.B.eq.gain.setTargetAtTime(lowDb(ctrl.lowB), t, .01);
  deck.A.mid.gain.setTargetAtTime(lowDb(ctrl.midA), t, .01); deck.B.mid.gain.setTargetAtTime(lowDb(ctrl.midB), t, .01);
  deck.A.gain.gain.setTargetAtTime(ctrl.faderA * ctrl.faderA, t, .015); deck.B.gain.gain.setTargetAtTime(ctrl.faderB * ctrl.faderB, t, .015);
  for (const k of ['A', 'B']){ const d = deck[k], [hpF, lpF] = cfxFreq(ctrl['cfx' + k]);
    d.hp.frequency.setTargetAtTime(hpF, t, .02); d.lp.frequency.setTargetAtTime(lpF, t, .02);
    d.hi.gain.setTargetAtTime(lowDb(ctrl['hi' + k]), t, .01); d.trim.gain.setTargetAtTime(db2g(trimDb(ctrl['trim' + k])), t, .01);
    d.xf.gain.setTargetAtTime(xfGain(ctrl.xfader, k), t, .015);
    plVitesse(k); }
}
// Lancer un morceau sur une platine. `loop` : boucle de sécurité (temps ls à le), pour qu'une platine ne s'arrête jamais en
// pleine partie. La platine retient où elle en est (platines.js) : position, vitesse, boucle, repères.
function play(k, buf, when, pos, loop, ls = 64, le = 128){
  const d = deck[k]; stop(k);
  d.buf = buf; d.per = P; d.bend = 0; d.secu = loop ? { s: ls * P, e: le * P } : null; d.boucle = null; d.cue = pos; d.cues = [null, null, null, null];
  plDemarre(k, when, pos);
}
// Arrêter une platine : elle garde sa position (pour PLAY, CUE ou un hot cue)
function stop(k){ const d = deck[k]; if (d.node){ if (ac && d.joue) d.ancP = plPos(k); try { d.node.stop(); } catch (e) {} d.node.disconnect(); d.node = null; } d.joue = false; }
