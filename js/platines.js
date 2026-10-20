// Les platines (lot 39, table complète) : où en est chaque morceau, sa vitesse (tempo et molette), PLAY, CUE,
// hot cues, boucles et écoute au casque. Le son lui-même (égaliseurs, filtres, faders) est dans audio.js.
// Tous les fichiers de js/ partagent la même portée et sont chargés dans l'ordre indiqué dans index.html.
'use strict';
/* ---------- Où en est une platine ----------
   Une platine retient un point d'ancrage : à l'instant `ancT` (horloge audio), elle était à `ancP` secondes dans le morceau,
   et elle avance depuis à la vitesse `rate`. À chaque changement (vitesse, boucle, saut), on repose l'ancre là où elle en
   est : la position se calcule donc toujours sans erreur cumulée.
   `boucle` (boucle choisie par le joueur) passe avant `secu` (boucle de sécurité posée par play()). `per` = la durée d'un
   temps du morceau, en secondes de morceau (la grille sur laquelle se calent boucles et repères). */
const PL_TEMPO = .08;   // le curseur de tempo va de −8 % à +8 %
function plBoucleActive(k){ const d = deck[k]; return d.boucle || d.secu; }
function plPos(k, t = ac ? ac.currentTime : 0){
  const d = deck[k]; if (d.ancP == null) return 0;
  if (!d.joue || t <= d.ancT) return d.ancP;
  let p = d.ancP + (t - d.ancT) * d.rate; const b = plBoucleActive(k);
  if (b && d.ancP < b.e && p >= b.e) p = b.s + (p - b.s) % (b.e - b.s);
  return p;
}
// Pose une nouvelle ancre (sans rien changer au son)
function plAncre(k){ const d = deck[k], t = ac.currentTime; if (d.joue && t > d.ancT){ d.ancP = plPos(k, t); d.ancT = t; } }
// Lance la source audio de la platine à `when`, depuis `pos` (secondes de morceau)
function plDemarre(k, when, pos){
  const d = deck[k]; if (!d.buf) return;
  if (d.node){ try { d.node.stop(); } catch (e) {} d.node.disconnect(); d.node = null; }
  const n = ac.createBufferSource(); n.buffer = d.buf; d.rate = plVitesseVoulue(k); n.playbackRate.value = d.rate;
  const b = plBoucleActive(k); if (b){ n.loop = true; n.loopStart = b.s; n.loopEnd = b.e; }
  n.connect(d.trim); n.start(Math.max(when, ac.currentTime), Math.max(0, Math.min(pos, d.buf.duration - .01))); d.node = n;
  d.ancT = Math.max(when, ac.currentTime); d.ancP = pos; d.joue = true;
}

/* ---------- Vitesse : curseur de tempo et molette ---------- */
// Tempo : curseur en haut (1) = plus lent, en bas (0) = plus rapide, comme sur les tables DJ
const plTempoPct = k => (.5 - ctrl['tempo' + k]) * 2 * PL_TEMPO;
const plVitesseVoulue = k => (1 + plTempoPct(k)) * (1 + (deck[k].bend || 0));
function plVitesse(k){
  const d = deck[k]; if (!ac) return; const r = plVitesseVoulue(k);
  if (d.node && Math.abs(r - d.rate) > 1e-6){ plAncre(k); d.rate = r; d.node.playbackRate.setValueAtTime(r, Math.max(ac.currentTime, d.ancT)); }
  else d.rate = r;
}
// Molette : en lecture, la tourner pousse (ou freine) le morceau un instant, proportionnellement à sa vitesse ; à l'arrêt,
// elle déplace le morceau. `crans` : signé, positif dans le sens des aiguilles d'une montre.
const PL_JOG = { parCran: .0006, max: .2, calme: 70, pas: .004 };
function plJog(k, crans){
  const d = deck[k]; if (!ac || !d.buf || !crans) return;
  if (!d.joue){ d.ancP = Math.max(0, Math.min(d.buf.duration - .01, (d.ancP || 0) + crans * PL_JOG.pas)); return; }
  d.jogAcc = (d.jogAcc || 0) + crans;
  if (!d.jogTimer) d.jogTimer = setInterval(() => {
    const v = d.jogAcc || 0; d.jogAcc = 0;
    d.bend = Math.max(-PL_JOG.max, Math.min(PL_JOG.max, v * PL_JOG.parCran * (1000 / PL_JOG.calme)));
    plVitesse(k);
    if (!v){ clearInterval(d.jogTimer); d.jogTimer = null; d.bend = 0; plVitesse(k); }
  }, PL_JOG.calme);
}

/* ---------- PLAY, CUE et hot cues ---------- */
const plSurTemps = (k, p) => { const per = deck[k].per || P; return Math.round(p / per) * per; };
function plLecture(k){
  const d = deck[k]; if (!ac || !d.buf) return;
  if (d.joue) stop(k); else plDemarre(k, ac.currentTime, d.ancP || 0);
}
// CUE, comme sur les tables DJ : en lecture, retour au repère et arrêt ; à l'arrêt, poser le repère ici (s'il n'y est pas),
// puis écouter depuis le repère tant que le bouton est tenu, et y revenir au relâchement.
function plCue(k, appuye){
  const d = deck[k]; if (!ac || !d.buf) return;
  if (appuye){
    if (d.joue && !d.cueTenu){ stop(k); d.ancP = d.cue || 0; return; }
    if (!d.joue){ if (Math.abs((d.ancP || 0) - (d.cue || 0)) > .002) d.cue = d.ancP || 0; d.cueTenu = true; plDemarre(k, ac.currentTime, d.cue); }
  } else if (d.cueTenu){ d.cueTenu = false; stop(k); d.ancP = d.cue || 0; }
}
// Hot cue n (0 à 3) : vide, il se pose sur le temps le plus proche ; posé, il y saute (et lance la lecture si on était arrêté)
function plHotCue(k, n){
  const d = deck[k]; if (!ac || !d.buf || !(n >= 0 && n < 4)) return;
  if (d.cues[n] == null){ d.cues[n] = plSurTemps(k, plPos(k)); return 'pose'; }
  d.boucle = null; plDemarre(k, ac.currentTime, d.cues[n]); return 'saut';
}
function plHotCueEfface(k, n){ if (deck[k].cues) deck[k].cues[n] = null; }

/* ---------- Boucles ---------- */
// Boucle de `temps` temps, calée sur le temps le plus proche ; une nouvelle longueur remplace la précédente (même départ)
function plBoucle(k, temps){
  const d = deck[k]; if (!ac || !d.buf || !(temps > 0)) return;
  plAncre(k); const per = d.per || P, p = plPos(k);
  const s = d.boucle ? d.boucle.s : plSurTemps(k, p), e = s + temps * per;
  if (e > d.buf.duration) return;
  d.boucle = { s, e, temps };
  // déjà au-delà de la nouvelle fin (boucle raccourcie) : on repart du début de la boucle, comme une table DJ
  if (d.joue && p >= e){ plDemarre(k, ac.currentTime, s); return; }
  if (d.node){ d.node.loopStart = s; d.node.loopEnd = e; d.node.loop = true; }
}
function plSortie(k){
  const d = deck[k]; if (!d.boucle) return; plAncre(k); d.boucle = null;
  const b = d.secu; if (d.node){ if (b){ d.node.loopStart = b.s; d.node.loopEnd = b.e; } d.node.loop = !!b; }
}

/* ---------- Le casque ---------- */
// CUE casque d'une voie : on l'entend au casque, avant son fader. Dès qu'une voie est au casque, le casque n'a plus la salle.
const casque = { A: false, B: false };
function plCasque(){
  // valeurs posées directement : sans carte son à 4 sorties, le casque n'est relié à rien et le navigateur ne ferait pas avancer un glissé
  if (!ac || !hpBus) return; const une = casque.A || casque.B;
  for (const k of ['A', 'B']){ deck[k].pfl.gain.value = casque[k] ? 1 : 0; deck[k].simu.gain.value = casque[k] && outChannels < 4 ? .3 : 0; }
  hpSalle.gain.value = une ? 0 : 1;
}
function plCasqueBascule(k){ casque[k] = !casque[k]; plCasque(); return casque[k]; }

/* ---------- Le calage ---------- */
// Décalage entre les temps de A et ceux de B, en millisecondes (positif : B en avance), d'après les positions des platines.
// null si l'une des deux ne joue pas.
function plDecalage(t = ac ? ac.currentTime : 0){
  const a = deck.A, b = deck.B; if (!ac || !a.joue || !b.joue || t < a.ancT || t < b.ancT) return null;
  const fa = plPos('A', t) / (a.per || P), fb = plPos('B', t) / (b.per || P);
  let d = (fb - fa) % 1; if (d > .5) d -= 1; if (d < -.5) d += 1;
  // un temps de B dure per / rate secondes à l'oreille
  return d * (b.per || P) / (b.rate || 1) * 1000;
}
