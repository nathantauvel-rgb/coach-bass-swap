// Test de placement.
// Tous les fichiers de js/ partagent la même portée et sont chargés dans l'ordre indiqué dans index.html.
'use strict';
/* ---------- Test de placement ---------- */
const P_STEPS = [0, 5, 6];   // le bon moment, le swap des basses, la transition complète
function startPlacement(){
  if (run) return; chapter = 1; placement = { i: 0, res: [] };
  $('pBanner').hidden = false; selectLesson(P_STEPS[0]); updatePBanner();
  $('stage').scrollIntoView({ behavior: REDUCED ? 'auto' : 'smooth', block: 'start' });
}
function updatePBanner(){ $('pTitle').textContent = `Test de placement · épreuve ${placement.i + 1} sur ${P_STEPS.length}`; $('pText').textContent = 'Fais le niveau du mieux possible. Tu peux regarder la démo avant.'; }
function quitPlacement(){ placement = null; $('pBanner').hidden = true; $('next').textContent = 'Niveau suivant'; renderHud();
  // le Mode Expert, mis de côté pendant le test, revient (précision, bouton, consignes)
  if (!run){ TOL = tolOf(); renderExpert(); renderPlan(); } }
function placementStep(st){
  placement.res[placement.i] = st;
  const last = placement.i >= P_STEPS.length - 1;
  $('next').hidden = false; $('next').textContent = last ? 'Voir mon résultat' : 'Épreuve suivante';
}
function placementVerdict(){
  const res = placement.res.slice(), ok = res.length === P_STEPS.length && res.every(x => x >= 2);
  if (ok){ ch2Open = true; try { localStorage.setItem('coach-ch2-ouvert', '1'); } catch (e) {} }
  // Test raté : on reprendra au premier geste raté plutôt qu'au niveau 1. Le résultat sert aussi au parcours (parcours.js).
  const firstFail = ok ? 0 : P_STEPS[Math.max(0, P_STEPS.findIndex((_, j) => !(res[j] >= 2)))];
  testDone = ok ? 'ok' : 'ko:' + firstFail; try { localStorage.setItem('coach-test', testDone); } catch (e) {}
  quitPlacement();
  $('rStars').innerHTML = ''; $('rStats').hidden = true; resultatVini(ok ? 'parfait' : 'rate'); $('rTitle').classList.toggle('win', ok); $('rTitle').textContent = ok ? 'Tu maîtrises les bases : chapitres 2 et 4 débloqués !' : 'On commence par les bases';
  $('rGain').textContent = ok ? 'Les niveaux du chapitre 1 restent jouables quand tu veux.' : 'Le chapitre 2 se débloque avec 14 étoiles au chapitre 1.';
  $('rDetails').innerHTML = ''; $('cmpBox').hidden = true;
  ['Le bon moment', 'Le swap des basses', 'La transition complète'].forEach((t, j) => { const x = document.createElement('li'); x.className = (res[j] || 0) >= 2 ? 'ok' : 'bad'; x.textContent = `${t} : ${'★'.repeat(res[j] || 0) || 'pas réussi'}`; $('rDetails').appendChild(x); });
  $('next').hidden = false; $('next').textContent = ok ? 'Aller au chapitre 2' : firstFail ? 'Reprendre à : ' + BASE_LESSONS[firstFail].title : 'Commencer le chapitre 1';
  $('next').dataset.go = ok ? 'ch2' : 'ch1'; $('next').dataset.li = String(firstFail); $('retry').hidden = true; $('quizBtn').hidden = true; $('clairRow').hidden = true; badgeNote('rBadge'); $('result').hidden = false; renderHud();
}
$('pQuit').addEventListener('click', () => { quitPlacement(); });
