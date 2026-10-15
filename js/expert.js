// Mode Expert (lot 20) : les 7 niveaux des bases, sans aide. B part exactement quand tu appuies (pas de calage
// automatique), pas de compte à rebours ni de repère, précision serrée, gestes notés en millisecondes, score sur 100.
// Tous les fichiers de js/ partagent la même portée et sont chargés dans l'ordre indiqué dans index.html.
'use strict';
/* ---------- Mode Expert ----------
   Préférence et records dans coach-expert : { on: true/false, best: { '0': 87, … } } (numéro de niveau du chapitre 1 →
   meilleur score, de 0 à 100). La variable `expert` est déclarée avec l'état, dans niveaux.js. */
let xBest = {};
try { const s = JSON.parse(localStorage.getItem('coach-expert') || 'null');
  if (s && typeof s === 'object' && !Array.isArray(s)){ expert = s.on === true;
    if (s.best && typeof s.best === 'object' && !Array.isArray(s.best)) for (const [k, v] of Object.entries(s.best)) if (/^\d$/.test(k) && Number.isInteger(v) && v >= 0 && v <= 100) xBest[k] = v; } } catch (e) {}
const saveExpert = () => { try { localStorage.setItem('coach-expert', JSON.stringify({ on: expert, best: xBest })); } catch (e) {} };
// Seulement au chapitre 1, hors entraînement et test de placement
const expertOn = () => expert && chapter === 1 && !prac && !placement;
// L'instant que l'on entend, pas celui que l'ordinateur calcule : la carte son a toujours un peu de retard
function heardTime(){
  const ts = ac.getOutputTimestamp ? ac.getOutputTimestamp() : null;
  if (ts && ts.contextTime > 0 && ts.performanceTime > 0) return Math.min(ac.currentTime, ts.contextTime + (performance.now() - ts.performanceTime) / 1000);
  return ac.currentTime - (ac.outputLatency || ac.baseLatency || 0);
}
const heardBeat = () => (heardTime() - run.t0) / P + START;
// En Expert, chaque geste est noté à l'instant même où il arrive (table ou souris), pas seulement à l'image suivante de l'écran
function gestureMark(){ if (run && run.expert && !run.demo) run.frames.push(snapFrame(heardBeat())); }
// Lancer B sans calage : il part du début de son intro à l'instant précis (entendu) de l'appui
function launchExpert(){
  const l = LESSONS[li], T = ac.currentTime, h = heardTime(), b = (h - run.t0) / P + START;
  run.launch = b; run.lowBAtLaunch = ctrl.lowB; $('launchB').disabled = true;
  play('B', run.bBuf, T + .01, Math.max(0, l.bCue * P + (T + .01 - h)), true, ...(l.bLoop || [64, 128]));
  const it = evalLaunchX(b, l.launchBeat), a = Math.abs(msOf(b - l.launchBeat)), dir = b > l.launchBeat ? 'trop tard' : 'trop tôt';
  run.status['LANCE B'] = it[0];
  if (a <= 30){ pop(`PARFAIT ! ${a} ms`, 'ok'); chime(true); }
  else if (it[0] === 'ok'){ pop(`Bien : ${a} ms ${dir}`, 'ok'); chime(true); }
  else if (it[0] === 'mid'){ pop(`${a} ms ${dir}`, 'mid'); chime(false); }
  else pop(Math.abs(b - l.launchBeat) < 2 ? `Raté : ${a} ms ${dir}` : 'Raté : pas le bon temps', 'bad');
}
// Note du lancement : continue, de 1 (10 ms d'écart ou moins) à 0 (150 ms ou plus)
function evalLaunchX(L, target = 32){
  if (L === null) return ['bad', 'Tu n\'as pas lancé B. En Expert, rien ne te prévient : compte les temps jusqu\'au début de la phrase.', 0];
  const e = L - target, a = Math.abs(msOf(e)), dir = e > 0 ? 'trop tard' : 'trop tôt', v = clamp01(1 - (a - 10) / 140);
  if (a <= 30) return ['ok', `B est parti à ${a} ms du temps : parfait, on n'entend aucun décalage.`, v];
  if (a <= 70) return ['ok', `B est parti ${a} ms ${dir} : bien, c'est presque imperceptible.`, v];
  if (a <= 150) return ['mid', `B est parti ${a} ms ${dir} : les grosses caisses se dédoublent. Appuie un poil plus ${e > 0 ? 'tôt' : 'tard'}.`, v];
  if (Math.abs(e) < 2) return ['bad', `B est parti ${a} ms ${dir} : les deux rythmes se marchent dessus.`, 0];
  return ['bad', `B est parti ${fr1(Math.abs(e))} temps ${dir} : vise le premier temps de la phrase.`, 0];
}
// Fin d'une partie en Expert : score sur 100, étoiles, record
function expertResult(score){
  const xs = Math.round(score * 100), prev = xBest[li], rec = prev == null || xs > prev;
  if (rec){ xBest[li] = xs; saveExpert(); renderExpert(); }
  return { xs, st: xs >= 90 ? 3 : xs >= 60 ? 2 : 1, txt: rec ? (prev == null ? `Expert : ${xs}/100 · premier record` : `Expert : ${xs}/100 · nouveau record (avant : ${prev})`) : `Expert : ${xs}/100 · record : ${prev}/100` };
}
function renderExpert(){
  const b = $('expertBtn'); b.hidden = chapter !== 1 || !!prac || !!placement; if (b.hidden) return;
  b.setAttribute('aria-pressed', String(expert)); b.textContent = expert ? `Mode Expert · record ${xBest[li] != null ? xBest[li] + '/100' : '—'}` : 'Mode Expert';
}
$('expertBtn').addEventListener('click', () => { if (run || preparing) return; expert = !expert; saveExpert(); selectLesson(li); });
