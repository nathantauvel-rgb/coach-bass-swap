// Les deux parcours : choix à la première visite, étapes, et « prochaine étape » sur l'accueil.
// Tous les fichiers de js/ partagent la même portée et sont chargés dans l'ordre indiqué dans index.html.
'use strict';
/* ---------- Parcours ----------
   Les deux parcours utilisent les mêmes niveaux et les mêmes règles de déblocage : seuls changent le point
   d'entrée, l'ordre des étapes et la recommandation. Une étape est « faite » d'après la progression déjà
   enregistrée (étoiles, entraînement, paires validées) : le parcours ne stocke que le choix et le résultat du test. */
const PARCOURS = {
  debut: { name: 'Parcours « Je débute »', stages: ['guide', 'ch1', 'train', 'ch2', 'ch3', 'vrai'] },
  deja: { name: 'Parcours « J\'améliore mes transitions »', stages: ['test', 'ch1', 'ch2', 'ch3', 'train', 'vrai'] }
};
let parcours = ''; try { parcours = localStorage.getItem('coach-parcours') || ''; } catch (e) {}
if (!PARCOURS[parcours]) parcours = '';
// Résultat du test de placement : 'ok', ou 'ko:N' avec N = premier niveau raté (voir placementVerdict)
let testDone = ''; try { testDone = localStorage.getItem('coach-test') || ''; } catch (e) {}
if (!/^(ok|ko:[0-6])$/.test(testDone)) testDone = '';
const testFail = () => testDone.startsWith('ko:') ? +testDone.slice(3) : 0;
// Quelqu'un qui a déjà une progression n'a pas à choisir : on déduit son parcours
if (!parcours && (guideSeen || ch2Open || sumStars(stars) + sumStars(ch2Stars) + sumStars(ch3Stars) > 0)) parcours = ch2Open && sumStars(stars) < 14 ? 'deja' : 'debut';
let parcoursPick = false;
const firstTodo = (bank, n, from = 0) => { for (let i = from; i < n; i++) if (!(bank[i] >= 2)) return i; for (let i = 0; i < n; i++) if (!(bank[i] >= 2)) return i; return 0; };
const ch3Done = () => CH3_LESSONS.filter((_, i) => ch3Stars[i] >= 2).length;
function goLesson(ch, idx){
  location.hash = '#apprendre'; setView('apprendre');
  if (placement) quitPlacement();
  if (chapter !== ch) setChapter(ch);
  if (chapter === ch && idx != null) selectLesson(idx);
}
const STAGES = {
  guide: { title: 'Découvre ta table', text: 'Un petit tour d\'une minute, avec le son : les faders, les basses, le filtre, PLAY, et comment compter les phrases.',
    done: () => guideSeen, cta: () => 'Commencer le guide', go: () => { location.hash = '#apprendre'; setView('apprendre'); } },
  test: { title: 'Le test de placement', text: 'Trois épreuves courtes pour voir où tu en es : le bon moment, le swap des basses, la transition complète.',
    done: () => !!testDone || ch2Unlocked(), cta: () => 'Passer le test', go: () => { goLesson(1, null); startPlacement(); } },
  ch1: { title: 'Les bases', text: 'Sept gestes, un par niveau : lancer au bon moment, le fader, le swap des basses, la transition complète, le filtre, l\'écho, la coupure.',
    done: () => ch2Unlocked(), prog: () => `${sumStars(stars)} ★ sur 14`,
    cta: () => { const i = firstTodo(stars, BASE_LESSONS.length, testFail()); return `Niveau ${i + 1} : ${BASE_LESSONS[i].title}`; },
    go: () => goLesson(1, firstTodo(stars, BASE_LESSONS.length, testFail())) },
  train: { title: 'S\'entraîner', text: 'Refais les gestes que tu connais sur d\'autres morceaux : défi du jour, variations, à l\'oreille, mini-set.',
    done: () => !!pracStr('lastOk') || pracNum('vars') + pracNum('ears') + pracNum('setBest') > 0, cta: () => 'Aller à l\'entraînement', go: () => { location.hash = '#entrainer'; } },
  ch2: { title: 'La maîtrise', text: 'Les mêmes gestes à l\'oreille, sans compte à rebours, et deux fois plus précis.',
    done: () => ch3Unlocked(), prog: () => `${sumStars(ch2Stars)} ★ sur 10`,
    cta: () => { const i = firstTodo(ch2Stars, BASE_LESSONS.length); return `Chapitre 2, niveau ${i + 1} : ${BASE_LESSONS[i].title}`; },
    go: () => goLesson(2, firstTodo(ch2Stars, BASE_LESSONS.length)) },
  ch3: { title: 'Les vrais morceaux', text: 'Lire les formes d\'onde, éviter le piège du break, gérer les voix : comme dans rekordbox.',
    done: () => ch3Done() >= CH3_LESSONS.length, prog: () => `${ch3Done()} niveau${ch3Done() > 1 ? 'x' : ''} sur ${CH3_LESSONS.length}`,
    cta: () => { const i = firstTodo(ch3Stars, CH3_LESSONS.length); return `Chapitre 3, niveau ${i + 1} : ${CH3_LESSONS[i].title}`; },
    go: () => goLesson(3, firstTodo(ch3Stars, CH3_LESSONS.length)) },
  vrai: { title: 'Passer au vrai', text: 'Avec ta musique : importe ta collection rekordbox, choisis une paire, et fais les missions sur ta table.',
    done: () => rbMis.total > 0, cta: () => 'Aller à Passer au vrai', go: () => { location.hash = '#vrai'; } }
};
const nextStage = () => parcours ? PARCOURS[parcours].stages.find(id => !STAGES[id].done()) || '' : '';
function setParcours(p){ if (!PARCOURS[p]) return; parcours = p; parcoursPick = false; try { localStorage.setItem('coach-parcours', p); } catch (e) {} renderHome(); }
function renderHome(){
  const choosing = !parcours || parcoursPick, cur = nextStage(), st = STAGES[cur];
  $('homeChoice').hidden = !choosing; $('homePath').hidden = choosing; $('homeKicker').hidden = choosing; $('homeCta').hidden = choosing; $('homeNeed').hidden = !choosing; $('homeGoal').hidden = choosing; $('homeTip').parentElement.hidden = !choosing;
  document.querySelectorAll('#homeChoice [data-parcours]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.parcours === parcours)));
  if (choosing){
    $('homeTitle').textContent = 'Tu as une table et tu n\'y connais rien ?'; $('homeLead').textContent = 'En deux semaines, tu fais tes premières vraies transitions propres, avec ta musique.';
    $('homeTip').textContent = 'Un geste à la fois, et ça vient vite !'; return; }
  $('homeKicker').textContent = cur ? 'Ta prochaine étape' : 'Parcours terminé';
  $('homeTitle').textContent = st ? st.title : 'Bravo, tu as tout fait !';
  $('homeLead').textContent = st ? st.text : 'Garde la main : un défi par jour, et de nouvelles paires de morceaux dans rekordbox.';
  $('homeCta').textContent = st ? st.cta() : 'Faire le défi du jour';
  renderGoal();
  const n = PARCOURS[parcours].stages.indexOf(cur); $('pathSum').textContent = cur ? `Voir tout mon parcours · étape ${n + 1} sur ${PARCOURS[parcours].stages.length}` : 'Voir tout mon parcours · terminé';
  $('homePathName').textContent = PARCOURS[parcours].name;
  const ol = $('homeStages'); ol.innerHTML = '';
  PARCOURS[parcours].stages.forEach((id, n) => { const s = STAGES[id], done = s.done(), now = id === cur;
    const liEl = document.createElement('li'), num = document.createElement('span'), box = document.createElement('div'), t = document.createElement('strong'), d = document.createElement('span'), tag = document.createElement('span');
    liEl.className = done ? 'done' : now ? 'now' : ''; if (now) liEl.setAttribute('aria-current', 'step');
    num.className = 'num'; num.textContent = done ? '✓' : String(n + 1); t.textContent = s.title; d.textContent = s.text;
    tag.className = 'sp' + (done || now ? '' : ' soon'); tag.textContent = done ? 'Fait' : now ? (s.prog ? s.prog() : 'En cours') : 'À venir';
    box.append(t, d); liEl.append(num, box, tag); ol.appendChild(liEl); });
}
$('homeCta').addEventListener('click', () => { const st = STAGES[nextStage()]; if (st) st.go(); else location.hash = '#entrainer'; });
$('homeChange').addEventListener('click', () => { parcoursPick = true; renderHome(); });
document.querySelectorAll('#homeChoice [data-parcours]').forEach(b => b.addEventListener('click', () => setParcours(b.dataset.parcours)));
/* ---------- Mes progrès : niveau, étoiles, série, objectif, badges ---------- */
function renderProgres(){
  const box = $('progTiles'); box.innerHTML = ''; const sk = goalStreak(), max = BASE_LESSONS.length * 3;
  const tiles = [[$('lvl').textContent, $('xpTxt').textContent], ['Chapitre 1', `${sumStars(stars)} ★ sur ${max}`], ['Chapitre 2', `${sumStars(ch2Stars)} ★ sur ${max}`],
    ['Chapitre 3', `${sumStars(ch3Stars)} ★ sur ${CH3_LESSONS.length * 3}`], ['Série en cours', sk ? plur(sk, 'jour', 'jours') : 'aucune'], ['Meilleure série', goal.best ? plur(goal.best, 'jour', 'jours') : '—'], ['Quiz', `${quizOk.length} sur ${QUIZ.length} trouvées`]];
  for (const [k, v] of tiles){ const d = document.createElement('div'), a = document.createElement('span'), b = document.createElement('strong'); d.className = 'ptile'; a.textContent = k; b.textContent = v; d.append(a, b); box.appendChild(d); }
  $('progGoalTxt').textContent = `${Math.floor(goalSecs() / 60)} min sur ${goal.min} aujourd'hui. Les parties et le quiz le remplissent.`;
  renderGoal(); renderBadges();
}
