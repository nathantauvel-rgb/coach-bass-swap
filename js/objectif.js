// Objectif du jour : quelques minutes de pratique par jour, et la série de jours où il est atteint.
// Tous les fichiers de js/ partagent la même portée et sont chargés dans l'ordre indiqué dans index.html.
'use strict';
/* ---------- Objectif du jour ----------
   Comptent : le temps des parties (démos comprises) et du quiz. `coach-objectif` garde l'objectif choisi
   (5, 10 ou 15 min), les secondes de chaque jour (60 derniers jours), les jours où l'objectif a été atteint
   et la meilleure série. */
const GOAL_KEY = 'coach-objectif', GOAL_MINS = [5, 10, 15], GOAL_DAY = /^\d{4}-\d\d-\d\d$/;
let goal = {}; try { goal = JSON.parse(localStorage.getItem(GOAL_KEY) || '{}'); } catch (e) {}
if (!goal || typeof goal !== 'object' || Array.isArray(goal)) goal = {};
{ const j = goal.jours && typeof goal.jours === 'object' && !Array.isArray(goal.jours) ? goal.jours : {};
  goal = {
    min: GOAL_MINS.includes(goal.min) ? goal.min : 10,
    jours: Object.fromEntries(Object.entries(j).filter(([d, s]) => GOAL_DAY.test(d) && Number.isFinite(s) && s >= 0).sort().slice(-60).map(([d, s]) => [d, Math.min(86400, Math.floor(s))])),
    faits: Array.isArray(goal.faits) ? [...new Set(goal.faits.filter(d => typeof d === 'string' && GOAL_DAY.test(d)))].sort().slice(-400) : [],
    best: Math.max(0, Math.floor(+goal.best) || 0)
  };
}
let goalFresh = false;   // vrai juste après avoir atteint l'objectif du jour (annonce sur la carte de résultat)
const saveGoal = () => { try { localStorage.setItem(GOAL_KEY, JSON.stringify(goal)); } catch (e) {} };
const goalSecs = () => goal.jours[dayKey()] || 0;
const goalDone = () => goal.faits.includes(dayKey());
// Série : jours d'affilée où l'objectif est atteint, en comptant jusqu'à aujourd'hui ou jusqu'à hier
function goalStreak(){
  const d = new Date(); if (!goalDone()) d.setDate(d.getDate() - 1);
  let n = 0; while (goal.faits.includes(dayKey(d))){ n++; d.setDate(d.getDate() - 1); }
  return n;
}
function goalCheck(){
  if (goalDone() || goalSecs() < goal.min * 60) return;
  goal.faits.push(dayKey()); goal.best = Math.max(goal.best, goalStreak()); goalFresh = true;
}
function goalAdd(secs){
  secs = Math.min(1800, Math.max(0, +secs || 0)); if (!secs) return;
  const d = dayKey(); goal.jours[d] = Math.min(86400, (goal.jours[d] || 0) + secs);
  goalCheck(); saveGoal();
}
function goalSet(min){ if (!GOAL_MINS.includes(min)) return; goal.min = min; goalCheck(); goalFresh = false; saveGoal(); renderGoal(); }
// Encart de l'accueil (appelé par renderHome)
function renderGoal(){
  const done = goalDone(), mins = Math.floor(goalSecs() / 60), sk = goalStreak(), p = Math.min(1, goalSecs() / (goal.min * 60));
  $('goalFill').style.strokeDashoffset = String(169.6 * (1 - p)); $('homeGoal').classList.toggle('done', done);
  $('goalTitle').textContent = done ? 'Objectif du jour atteint !' : `${mins} min sur ${goal.min} aujourd'hui`;
  $('goalSub').textContent = sk ? `Série de ${plur(sk, 'jour', 'jours')}` + (done ? '. Reviens demain pour la continuer.' : ' : atteins ton objectif aujourd\'hui pour la garder.') : 'Atteins ton objectif chaque jour pour lancer une série.';
  document.querySelectorAll('#progGoalSet [data-goal]').forEach(b => b.setAttribute('aria-pressed', String(+b.dataset.goal === goal.min)));
}
// Ligne de la carte de résultat (appelée par finish)
function goalNote(){
  const e = $('rGoal'), left = Math.max(1, Math.ceil((goal.min * 60 - goalSecs()) / 60));
  e.classList.toggle('done', goalDone());
  e.textContent = goalFresh ? `Objectif du jour atteint ! Série de ${plur(goalStreak(), 'jour', 'jours')}.` : goalDone() ? `Objectif du jour fait · série de ${plur(goalStreak(), 'jour', 'jours')}` : `Encore ${left} min pour ton objectif du jour`;
  goalFresh = false;
}
document.querySelectorAll('#progGoalSet [data-goal]').forEach(b => b.addEventListener('click', () => { goalSet(+b.dataset.goal); renderProgres(); }));
