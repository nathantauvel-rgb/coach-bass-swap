// Démarrage de la page et onglets : chargé en dernier.
// Tous les fichiers de js/ partagent la même portée et sont chargés dans l'ordre indiqué dans index.html.
'use strict';
/* ---------- Démarrage ---------- */
buildControls();
$('startBtn').addEventListener('click', () => run ? stopRun() : withFiches(() => startRun()));
$('watchBtn').addEventListener('click', () => { if (!run) withFiches(() => startRun(true)); });
const styleShow = () => { const b = document.querySelector(`#styleOpts [data-style="${styleChoice}"]`); $('styleBtn').textContent = styleChoice === 'vrai' ? 'Morceaux : vraie musique' : 'Morceaux : ' + (b ? b.textContent : 'House'); };
const styleMenu = open => { $('styleOpts').hidden = !open; $('styleBtn').setAttribute('aria-expanded', String(open)); };
$('styleBtn').addEventListener('click', () => styleMenu($('styleOpts').hidden)); styleShow();
document.querySelectorAll('#styleOpts [data-style]').forEach(b => { b.setAttribute('aria-pressed', String(b.dataset.style === styleChoice));
  b.addEventListener('click', () => { if (run) return; styleChoice = b.dataset.style; try { localStorage.setItem('coach-style', styleChoice); } catch (e) {}
    document.querySelectorAll('#styleOpts [data-style]').forEach(x => x.setAttribute('aria-pressed', String(x === b))); styleShow(); styleMenu(false);
    chooseSongs(); }); });
document.querySelectorAll('#modeSeg button').forEach(b => b.addEventListener('click', () => { if (run || b.disabled) return; ear = b.dataset.mode === 'ear';
  document.querySelectorAll('#modeSeg button').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
  $('hint').textContent = ear ? 'Mode à l\'oreille : pas de compte à rebours, la piste est dans le brouillard. Compte les mesures dans ta tête.' : ''; }));
$('launchB').addEventListener('click', launchB);
$('rClose').addEventListener('click', () => { $('result').hidden = true; });
$('result').addEventListener('click', e => { if (e.target === $('result')) $('result').hidden = true; });
document.addEventListener('keydown', e => { if (e.key === 'Escape') $('result').hidden = true; });
$('retry').addEventListener('click', () => { $('result').hidden = true; startRun(); });
$('next').addEventListener('click', () => {
  if (prac){ pracNext(); return; }
  const go =$('next').dataset.go, goLi = +$('next').dataset.li || 0; delete $('next').dataset.go; delete $('next').dataset.li; $('retry').hidden = false; $('cmpBox').hidden = false;
  if (go === 'ch2'){ $('result').hidden = true; setChapter(2); return; }
  if (go === 'ch1') LESSONS = BASE_LESSONS;
  if (go === 'ch1'){ $('result').hidden = true; chapter = 1; try { localStorage.setItem('coach-chapitre', '1'); } catch (e) {} selectLesson(goLi); return; }
  if (placement){ if (placement.i >= P_STEPS.length - 1){ placementVerdict(); return; } placement.i++; selectLesson(P_STEPS[placement.i]); updatePBanner(); return; }
  selectLesson(Math.min(LESSONS.length - 1, li + 1)); });
document.addEventListener('keydown', e => { if (e.code === 'Space' && run && !(e.target instanceof HTMLInputElement)){ e.preventDefault(); launchB(); } if (e.code === 'KeyE' && run && !e.repeat){ e.preventDefault(); toggleEcho(); } }, true);
$('echoBtn').addEventListener('click', toggleEcho);
window.addEventListener('resize', () => drawHighway(run ? beatNow() : START));
if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { loadCol(); drawHighway(run ? beatNow() : START); });
if (!guideSeen && hasWorkers()) warm = getSong('house', 0, 'B1').catch(() => {});
const firstUndone = LESSONS.findIndex((_, i) => !(bankOf(chapter)[i] >= 2));
selectLesson(firstUndone < 0 ? 0 : firstUndone);
initMidi();
requestAnimationFrame(frame);

/* ---------- Onglets : accueil, Apprendre, S'entraîner, Passer au vrai ---------- */
const VIEWS = { accueil: 'vHome', apprendre: 'vLearn', entrainer: 'vTrain', vrai: 'vReal', table: 'vTable', progres: 'vProgres' };
let view = '';
// L'accueil (renderHome) est dans parcours.js, ses badges et le quiz dans quiz.js
function setView(v){
  if (!VIEWS[v]) v = 'accueil'; if (v === view) return;
  closeQuiz(); closeAvis(); if (prac) quitPrac();
  if (view === 'apprendre'){ if (onb.active) closeOnb(); if (placement) quitPlacement(); stopRun(); $('result').hidden = true; }
  if (view === 'table') learnKey = null;   // un apprentissage commencé sur « Ma table » ne doit pas continuer ailleurs
  view = v;
  for (const [k, id] of Object.entries(VIEWS)) $(id).hidden = k !== v;
  document.querySelectorAll('#tabs a').forEach(a => { if (a.dataset.view === v) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current'); });
  $('guideBtn').hidden = v !== 'apprendre';
  if (v === 'apprendre'){ renderHud(); drawHighway(START); updateSetup(); if (!guideSeen && parcours !== 'deja') openOnb(); }   // parcours « deja » : le guide est proposé (bouton Guide), pas imposé
  else if (v === 'accueil') renderHome();
  else if (v === 'entrainer') renderTrain();
  else if (v === 'vrai') renderReal();
  else if (v === 'table') renderTable();
  else if (v === 'progres') renderProgres();
  window.scrollTo(0, 0);
}
document.querySelectorAll('#tabs a').forEach(a => a.addEventListener('click', () => { if (prac && a.dataset.view === view) quitPrac(); }));
window.addEventListener('hashchange', () => setView(location.hash.slice(1)));
setView(location.hash.slice(1));
