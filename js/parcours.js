// Les deux parcours : choix à la première visite, étapes, et « prochaine étape » sur l'accueil.
// Tous les fichiers de js/ partagent la même portée et sont chargés dans l'ordre indiqué dans index.html.
'use strict';
/* ---------- Parcours ----------
   Les deux parcours utilisent les mêmes niveaux et les mêmes règles de déblocage : seuls changent le point
   d'entrée, l'ordre des étapes et la recommandation. Une étape est « faite » d'après la progression déjà
   enregistrée (étoiles, entraînement, paires validées) : le parcours ne stocke que le choix et le résultat du test. */
const PARCOURS = {
  debut: { name: 'Parcours « Je débute »', stages: ['guide', 'ch1', 'train', 'ch2', 'ch3', 'ch5', 'ch6', 'vrai'] },
  deja: { name: 'Parcours « J\'améliore mes transitions »', stages: ['test', 'ch1', 'ch2', 'ch5', 'ch6', 'ch3', 'train', 'vrai'] }
};
// Tant que le chapitre 6 n'est pas prêt (CH6_PRET dans js/hotcues.js), il n'est pas une étape du parcours.
if (!CH6_PRET) for (const p of Object.values(PARCOURS)) p.stages = p.stages.filter(s => s !== 'ch6');
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
const ch5Done = () => CH5_LESSONS.filter((_, i) => ch5Stars[i] >= 2).length;
const ch6Done = () => CH6_LESSONS.filter((_, i) => ch6Stars[i] >= 2).length;
function goLesson(ch, idx){
  location.hash = '#apprendre'; setView('apprendre');
  if (placement) quitPlacement();
  if (chapter !== ch) setChapter(ch);
  if (chapter === ch && idx != null) selectLesson(idx);
}
const STAGES = {
  guide: { title: 'Découvre ta table', text: 'Un petit tour d\'une minute, avec le son : compter les phrases et reconnaître les parties d\'un morceau. Chaque bouton de ta table te sera présenté juste avant de t\'en servir.',
    done: () => guideSeen, cta: () => 'Commencer le guide', go: () => { location.hash = '#apprendre'; setView('apprendre'); } },
  test: { title: 'Le test de placement', text: 'Trois épreuves courtes pour voir où tu en es : le bon moment, le swap des basses, la transition complète.',
    done: () => !!testDone || ch2Unlocked(), cta: () => 'Passer le test', go: () => { goLesson(1, null); startPlacement(); } },
  ch1: { title: 'Les bases', text: 'Sept gestes, un par niveau : lancer au bon moment, le fader, la coupure, l\'écho, le filtre, le swap des basses, puis la transition complète pour finir.',
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
  ch5: { title: 'Le calage', text: 'Caler deux morceaux soi-même, sans SYNC : entendre le décalage, régler le tempo, rattraper à la molette, au casque, puis sans aucune aide.',
    done: () => ch5Done() >= CH5_LESSONS.length, prog: () => `${ch5Done()} niveau${ch5Done() > 1 ? 'x' : ''} sur ${CH5_LESSONS.length}`,
    cta: () => { const i = firstTodo(ch5Stars, CH5_LESSONS.length); return `Chapitre 5, niveau ${i + 1} : ${CH5_LESSONS[i].title}`; },
    go: () => goLesson(5, firstTodo(ch5Stars, CH5_LESSONS.length)) },
  ch6: { title: 'Hot cues et boucles', text: 'Partir au bon endroit et gagner du temps : poser un repère, lancer depuis lui, sortir d’une boucle sur la phrase, prolonger une outro, faire monter la tension.',
    done: () => ch6Done() >= CH6_LESSONS.length, prog: () => `${ch6Done()} niveau${ch6Done() > 1 ? 'x' : ''} sur ${CH6_LESSONS.length}`,
    cta: () => { const i = firstTodo(ch6Stars, CH6_LESSONS.length); return `Chapitre 6, niveau ${i + 1} : ${CH6_LESSONS[i].title}`; },
    go: () => goLesson(6, firstTodo(ch6Stars, CH6_LESSONS.length)) },
  vrai: { title: 'Passer au vrai', text: 'Avec ta musique : importe ta collection rekordbox, choisis une paire, et fais les missions sur ta table.',
    done: () => rbMis.total > 0, cta: () => 'Aller à Passer au vrai', go: () => { location.hash = '#vrai'; } }
};
const nextStage = () => parcours ? PARCOURS[parcours].stages.find(id => !STAGES[id].done()) || '' : '';
function setParcours(p){ if (!PARCOURS[p]) return; parcours = p; parcoursPick = false; try { localStorage.setItem('coach-parcours', p); } catch (e) {} renderHome(); }
function renderHome(){
  const choosing = !parcours || parcoursPick, cur = nextStage(), st = STAGES[cur];
  $('homeChoice').hidden = !choosing; $('homeQuetes').hidden = choosing; if (!choosing) renderQuetes(); $('homePath').hidden = choosing; $('homeKicker').hidden = choosing; $('homeCta').hidden = choosing; $('homeNeed').hidden = !choosing; $('homeGoal').hidden = choosing;
  document.querySelectorAll('#homeChoice [data-parcours]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.parcours === parcours)));
  if (choosing){
    $('homeTitle').textContent = 'Tu as une table et tu n\'y connais rien ?'; $('homeLead').textContent = 'En deux semaines, tu fais tes premières vraies transitions propres, avec ta musique.';
    $('homeTip').textContent = 'Un geste à la fois, et ça vient vite !'; homeVini(); return; }
  $('homeKicker').textContent = cur ? 'Ta prochaine étape' : 'Parcours terminé';
  $('homeTitle').textContent = st ? st.title : 'Bravo, tu as tout fait !';
  $('homeLead').textContent = st ? st.text : 'Garde la main : un défi par jour, et de nouvelles paires de morceaux dans rekordbox.';
  $('homeCta').textContent = st ? st.cta() : 'Faire le défi du jour';
  renderGoal(); homeVini();
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
// Vini sur l'accueil (lot 31) : un coffre à ouvrir, l'objectif atteint, la série à garder, ou un simple bonjour selon l'heure
function homeVini(){
  if (!parcours || parcoursPick){ viniDit('home', 'Un geste à la fois, et ça vient vite\u00a0!', 'danse'); return; }
  const coffres = questCoffres(), fait = goalDone(), sk = goalStreak(), h = new Date().getHours();
  const salut = h < 5 ? 'Encore debout\u00a0?' : h < 12 ? 'Bonjour\u00a0!' : h < 18 ? 'Salut\u00a0!' : 'Bonsoir\u00a0!';
  viniDit('home', coffres ? (coffres > 1 ? `${coffres} coffres t’attendent dans tes quêtes\u00a0!` : 'Un coffre t’attend dans tes quêtes\u00a0!')
    : fait ? 'Objectif du jour atteint, bravo\u00a0! Reviens demain pour ta série.'
    : sk ? `${salut} Ta série de ${plur(sk, 'jour', 'jours')} t’attend\u00a0: quelques minutes suffisent.`
    : `${salut} Prêt pour ta prochaine transition\u00a0?`, coffres || fait ? 'danse' : 'calme');
}
// Vini sur « Mes progrès » (lot 32) : l'objectif atteint, un badge presque gagné, ou la prochaine étape (les XP sont déjà écrits dessous)
function viniProgres(){
  const nb = badgeNext(), p = nb ? BADGE_PROG[nb[0]]() : null, st = STAGES[nextStage()];
  if (goalDone()) viniDit('prog', 'Objectif du jour atteint\u00a0: tu gères\u00a0!', 'danse');
  else if (p && p[1] > 1 && p[0] / p[1] >= .5) viniDit('prog', `Tu y es presque\u00a0: ${Math.min(p[0], p[1])} sur ${p[1]} pour le badge «\u00a0${nb[1]}\u00a0»\u00a0!`);
  else viniDit('prog', st ? `Prochaine étape\u00a0: «\u00a0${st.cta()}\u00a0». À toi de jouer\u00a0!` : 'Tu as tout fait, bravo\u00a0! Garde la main avec le défi du jour.');
}
$('homeCta').addEventListener('click', () => { const st = STAGES[nextStage()]; if (st) st.go(); else location.hash = '#entrainer'; });
$('homeChange').addEventListener('click', () => { parcoursPick = true; renderHome(); });
document.querySelectorAll('#homeChoice [data-parcours]').forEach(b => b.addEventListener('click', () => setParcours(b.dataset.parcours)));
/* ---------- Mes progrès : niveau, étoiles, série, objectif, badges ---------- */
// « Mes progrès » (lot 23) : le niveau, aujourd'hui et la série, le prochain badge, les médailles, les chapitres
function renderProgres(){
  const xp = xpTotal(), lv = 1 + Math.floor(xp / 30), sk = goalStreak(), mins = Math.floor(goalSecs() / 60);
  $('pgLvl').textContent = `Niveau ${lv}`; $('pgXp').textContent = `${xp} XP`; $('pgXpFill').style.width = (xp % 30) / 30 * 100 + '%';
  $('pgXpNext').textContent = `Encore ${30 - xp % 30} XP pour le niveau ${lv + 1}`;
  $('pgRing').style.strokeDashoffset = String(169.6 * (1 - Math.min(1, goalSecs() / (goal.min * 60))));
  $('pgToday').textContent = goalDone() ? 'Objectif du jour atteint' : 'Aujourd\'hui'; $('pgTodaySub').textContent = `${mins} min sur ${goal.min}`;
  $('pgStreak').textContent = sk ? `Série : ${plur(sk, 'jour', 'jours')}` : 'Pas encore de série';
  $('pgBest').textContent = goal.best ? `Record : ${plur(goal.best, 'jour', 'jours')}` : 'Atteins ton objectif pour en lancer une';
  renderGoal(); renderBadges(); viniProgres();
  // le prochain badge
  const nb = badgeNext(); $('pgNext').hidden = false;
  if (nb){ const [cur, max, unit, go] = BADGE_PROG[nb[0]](); $('pgNextIcon').innerHTML = iconSvg(BADGE_ICON[nb[0]]); $('pgNextName').textContent = nb[1];
    $('pgNextHow').textContent = nb[2] + (max > 1 ? ` · ${Math.min(cur, max)} sur ${max} ${unit}` : ''); $('pgNextBarBox').hidden = max <= 1; $('pgNextBar').style.width = Math.min(cur, max) / max * 100 + '%';
    $('pgNextGo').hidden = false; $('pgNextGo').onclick = go; }
  else { $('pgNextIcon').innerHTML = iconSvg(BADGE_ICON.sansfaute); $('pgNextName').textContent = 'Tous les badges sont à toi !'; $('pgNextHow').textContent = 'Bravo. Continue l\'objectif du jour pour garder ta série.'; $('pgNextBarBox').hidden = true; $('pgNextGo').hidden = true; }
  // les chapitres : une barre d'étoiles pour ceux qui sont ouverts, ce qu'il manque pour les autres
  const ul = $('pgChaps'); ul.innerHTML = '';
  const row = (txt, right, frac, go) => { const liEl = document.createElement('li'), top = document.createElement(go ? 'button' : 'div'), a = document.createElement('span'), b = document.createElement('span');
    top.className = 'pgch'; if (go){ top.type = 'button'; top.addEventListener('click', go); } else liEl.className = 'locked';
    a.textContent = txt; b.className = 'pgsub'; b.textContent = right; top.append(a, b); liEl.appendChild(top);
    if (frac != null){ const bar = document.createElement('div'), f = document.createElement('i'); bar.className = 'pgbar'; f.style.width = frac * 100 + '%'; bar.appendChild(f); top.appendChild(bar); }
    ul.appendChild(liEl); };
  const ch = n => CHAPTERS.find(c => c.n === n).title, max1 = BASE_LESSONS.length * 3;
  const open = (n, bank, len) => row(`${n} · ${ch(n)}`, `${sumStars(bank)} ★ sur ${len * 3}`, sumStars(bank) / (len * 3), () => goLesson(n, firstTodo(bank, len)));
  open(1, stars, BASE_LESSONS.length);
  // Le chapitre 6 n'apparaît ici que s'il est prêt (CH6_PRET dans js/hotcues.js) : sinon on l'annoncerait à un
  // joueur qui ne pourrait jamais l'ouvrir, et son bouton ne mènerait nulle part.
  if (ch2Unlocked()){ open(2, ch2Stars, BASE_LESSONS.length); open(4, ch4Stars, CH4_LESSONS.length); open(5, ch5Stars, CH5_LESSONS.length); if (CH6_PRET) open(6, ch6Stars, CH6_LESSONS.length); }
  else row(`2 · ${ch(2)}, 4 · ${ch(4)}, 5 · ${ch(5)}${CH6_PRET ? ` et 6 · ${ch(6)}` : ''}`, `encore ${plur(14 - sumStars(stars), 'étoile', 'étoiles')} au chapitre 1`, null, null);
  if (ch3Unlocked()) open(3, ch3Stars, CH3_LESSONS.length);
  else row(`3 · ${ch(3)}`, ch2Unlocked() ? `encore ${plur(10 - sumStars(ch2Stars), 'étoile', 'étoiles')} au chapitre 2` : 'après le chapitre 2', null, null);
}
$('pgGoalBtn').addEventListener('click', () => { const box = $('pgGoalBox'); box.hidden = !box.hidden; $('pgGoalBtn').setAttribute('aria-expanded', String(!box.hidden)); });
