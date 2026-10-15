// Quiz (question bonus après un niveau, quiz éclair dans S'entraîner) et badges.
// Tous les fichiers de js/ partagent la même portée et sont chargés dans l'ordre indiqué dans index.html.
'use strict';
/* ---------- Quiz ----------
   Une question : [identifiant, niveau, question, réponses, explication]. La PREMIÈRE réponse est la bonne
   (elles sont mélangées à l'affichage). Niveau : 'b0' à 'b6' = chapitres 1 et 2, 'c0' à 'c3' = chapitre 3,
   'g' = culture générale. Ne jamais changer un identifiant : il est enregistré dans `coach-quiz`. */
const QUIZ = [
  ['b0a', 'b0', 'Quel est le bon moment pour lancer le morceau B ?',
    ['Sur le premier temps d\'une phrase de A, par exemple quand son outro commence', 'N\'importe quand, du moment que le tempo est le même', 'Quand A est complètement terminé'],
    'Les morceaux avancent par phrases. Si B part sur le premier temps d\'une phrase, les deux morceaux restent alignés jusqu\'au drop.'],
  ['b0b', 'b0', 'L\'outro d\'un morceau, c\'est…',
    ['Sa fin, plus dépouillée, faite pour enchaîner', 'Son passage le plus fort', 'Son tout début'],
    'Dans l\'outro, le morceau se vide : c\'est la place idéale pour faire entrer le suivant.'],
  ['b1a', 'b1', 'À quoi sert le fader d\'une platine ?',
    ['À régler le volume de ce morceau', 'À régler sa vitesse', 'À couper ses basses'],
    'Chaque platine a son fader de volume : en bas, on n\'entend plus le morceau ; en haut, il joue à fond.'],
  ['b1b', 'b1', 'Quand le fader de A doit-il être arrivé à zéro ?',
    ['Avant que le drop de B arrive', 'Dès que B démarre', 'Après le drop de B'],
    'Le drop de B doit tomber seul. Si A traîne encore dessous, le drop perd toute sa force.'],
  ['b2a', 'b2', 'Pourquoi échange-t-on les basses au lieu de les laisser jouer ensemble ?',
    ['Deux lignes de basse en même temps donnent un son brouillon', 'Parce que la table ne peut jouer qu\'une basse', 'Pour que le tempo ne change pas'],
    'Les basses de deux morceaux se marchent dessus. On n\'en garde qu\'une à la fois : c\'est le swap.'],
  ['b2b', 'b2', 'Quel potard coupe les basses d\'une platine ?',
    ['LOW', 'MID', 'CFX'],
    'LOW règle les basses, MID les médiums (où se trouvent les voix), et CFX sert de filtre.'],
  ['b3a', 'b3', 'Avant de lancer B, que fais-tu de son potard LOW ?',
    ['Je le coupe, tout à gauche', 'Je l\'ouvre à fond', 'Je n\'y touche pas'],
    'B doit entrer sans ses basses : celles de A jouent encore. Tu les échangeras à la phrase suivante.'],
  ['b3b', 'b3', 'Dans quel ordre se fait une transition complète ?',
    ['Lancer B, monter son fader, échanger les basses, sortir A', 'Sortir A, lancer B, échanger les basses, monter le fader de B', 'Échanger les basses, lancer B, sortir A, monter le fader de B'],
    'B entre d\'abord discrètement, puis il prend les basses, et A sort avant le drop.'],
  ['b4a', 'b4', 'Dans les niveaux, quel potard sert de filtre ?',
    ['CFX', 'LOW', 'MID'],
    'Le potard CFX est sous les trois potards d\'égalisation. Tourné vers la droite, il retire peu à peu les graves du morceau.'],
  ['b4b', 'b4', 'Quand le filtre de A doit-il être à fond ?',
    ['Juste avant le drop de B', 'Dès que B démarre', 'Après le drop de B'],
    'Tu tournes lentement pendant que B monte : A s\'efface petit à petit et a disparu quand le drop arrive.'],
  ['b5a', 'b5', 'À quoi sert l\'écho quand on fait sortir un morceau ?',
    ['Sa fin résonne et s\'éteint, au lieu de s\'arrêter net', 'À le rendre plus fort', 'À ralentir son tempo'],
    'L\'écho répète le dernier son en le laissant s\'éteindre : la sortie de A paraît voulue.'],
  ['b5b', 'b5', 'Dans un écho out, dans quel ordre fais-tu les deux gestes ?',
    ['J\'active l\'écho, puis je baisse d\'un coup le fader de A', 'Je baisse le fader de A, puis j\'active l\'écho', 'J\'active l\'écho, puis je monte le fader de A'],
    'L\'écho doit avoir attrapé le son avant que tu coupes le volume : sinon il n\'a rien à répéter.'],
  ['b6a', 'b6', 'Dans une coupure sèche, que fais-tu au même instant ?',
    ['Je lance B et je baisse d\'un coup le fader de A', 'Je monte doucement le fader de B', 'Je tourne lentement le filtre de A'],
    'Pas de fondu : A s\'arrête et B démarre sur le même temps, dans un seul geste.'],
  ['b6b', 'b6', 'Pour une coupure sèche, à quel endroit B est-il calé ?',
    ['Sur son drop', 'Au début de son intro', 'Sur son outro'],
    'B doit frapper fort tout de suite, puisqu\'il remplace A d\'un coup.'],
  ['c0a', 'c0', 'B a 16 temps d\'intro. Combien de temps avant la fin de A le lances-tu ?',
    ['16 temps', '32 temps', '8 temps'],
    'Tu comptes à rebours depuis la fin de A : la longueur de l\'intro de B te donne le moment du lancement.'],
  ['c0b', 'c0', 'Sur une forme d\'onde, à quoi reconnaît-on le drop ?',
    ['L\'onde grossit d\'un coup', 'L\'onde devient toute fine', 'L\'onde s\'arrête'],
    'Au drop, la grosse caisse et la basse reviennent ensemble : l\'onde devient bien plus épaisse.'],
  ['c1a', 'c1', 'La musique de A se vide au milieu du morceau, puis repart de plus belle. C\'est…',
    ['Un break', 'L\'outro', 'Le drop'],
    'Le break ressemble à une fin, mais le morceau repart ensuite. L\'outro, elle, ne repart pas.'],
  ['c1b', 'c1', 'A entre dans un break. Que fais-tu ?',
    ['J\'attends : la vraie fin vient plus tard', 'Je lance B tout de suite', 'Je baisse le fader de A'],
    'Si tu lances B pendant le break, A repart en plein milieu de ta transition.'],
  ['c2a', 'c2', 'Quel potard baisse surtout les voix ?',
    ['MID', 'LOW', 'CFX'],
    'Les voix se trouvent dans les médiums : c\'est le potard MID qui les fait reculer.'],
  ['c2b', 'c2', 'Pourquoi couper le MID de A quand B commence à chanter ?',
    ['Pour ne jamais entendre deux voix ensemble', 'Pour donner plus de basses à B', 'Pour garder le même tempo'],
    'Deux voix en même temps, c\'est ce qui s\'entend le plus dans un mix. Une seule voix à la fois.'],
  ['c3a', 'c3', 'A se termine dans 32 temps, et B a 32 temps d\'intro. Quand lances-tu B ?',
    ['Maintenant', 'Dans 16 temps', 'Dans 32 temps'],
    'Avec 32 temps d\'intro lancés 32 temps avant la fin, le drop de B tombe pile quand A s\'arrête.'],
  ['c3b', 'c3', 'Pour savoir quand lancer B, que regardes-tu ?',
    ['Où A se termine, et combien de temps dure l\'intro de B', 'Seulement le tempo des deux morceaux', 'Seulement le début de A'],
    'La fin de A moins la longueur de l\'intro de B : c\'est ton moment de lancement.'],
  ['g0', 'g', 'En house ou en techno, combien de temps compte une mesure ?',
    ['4', '3', '8'],
    'Une mesure, c\'est 4 temps : tu les comptes sur la grosse caisse, 1, 2, 3, 4.'],
  ['g1', 'g', 'Combien de temps y a-t-il dans 8 mesures ?',
    ['32', '16', '64'],
    '8 mesures de 4 temps font 32 temps : c\'est la longueur des intros et des outros dans les niveaux.'],
  ['g2', 'g', 'Que veut dire BPM ?',
    ['Battements par minute : le tempo du morceau', 'Basses par mesure', 'Le volume maximum du morceau'],
    'Plus le BPM est élevé, plus le morceau est rapide. Deux morceaux au même BPM s\'enchaînent plus facilement.']
];
const QUIZ_XP = 5;
let quizOk = []; try { quizOk = JSON.parse(localStorage.getItem('coach-quiz') || '[]'); } catch (e) {}
quizOk = Array.isArray(quizOk) ? QUIZ.map(q => q[0]).filter(id => quizOk.includes(id)) : [];
let quiz = null;   // quiz ouvert : { list, flash, i, good, xp, answered, end, back }
const quizXp = () => quizOk.length * QUIZ_XP;
const quizMix = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--){ const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const quizPlayed = lv => PRAC_ALL || (lv === 'g' ? sumStars(stars) + sumStars(ch2Stars) + sumStars(ch3Stars) > 0 : lv[0] === 'c' ? ch3Stars[lv[1]] >= 1 : stars[lv[1]] >= 1 || ch2Stars[lv[1]] >= 1);
// Question bonus du niveau affiché : une question pas encore trouvée sur ce niveau, sinon de culture générale
const quizBonus = () => { const lv = chapter === 4 ? 'g' : (chapter === 3 ? 'c' : 'b') + li, todo = q => !quizOk.includes(q[0]); return QUIZ.find(q => q[1] === lv && todo(q)) || QUIZ.find(q => q[1] === 'g' && todo(q)) || null; };
// Quiz éclair : 5 questions sur les niveaux déjà joués, celles pas encore trouvées d'abord
const quizFlash = () => { const pool = quizMix(QUIZ.filter(q => quizPlayed(q[1]))); return pool.filter(q => !quizOk.includes(q[0])).concat(pool.filter(q => quizOk.includes(q[0]))).slice(0, 5); };
function openQuiz(list, flash){
  if (quiz || run || !list.length) return;
  quiz = { gT: performance.now(), list, flash, i: 0, good: 0, xp: 0, answered: false, end: false, back: document.activeElement };
  $('quiz').hidden = false; quizShow();
}
function quizShow(){
  const q = quiz.list[quiz.i], box = $('qOpts'); box.innerHTML = ''; box.classList.remove('done'); quiz.answered = false;
  $('qKick').textContent = quiz.flash ? `Quiz éclair · question ${quiz.i + 1} sur ${quiz.list.length}` : 'Question bonus';
  $('qText').textContent = q[2]; $('qWhy').hidden = true; $('qBadge').hidden = true; $('qNext').hidden = true;
  for (const t of quizMix(q[3])){ const b = document.createElement('button'); b.type = 'button'; b.className = 'qopt'; b.textContent = t; b.addEventListener('click', () => quizAnswer(b, t === q[3][0])); box.appendChild(b); }
  box.firstChild.focus({ preventScroll: true });
}
function quizAnswer(btn, ok){
  if (!quiz || quiz.answered) return; quiz.answered = true; const q = quiz.list[quiz.i]; let gain = 0;
  $('qOpts').classList.add('done'); $('qOpts').querySelectorAll('button').forEach(b => { if (b.textContent === q[3][0]) b.classList.add('ok'); }); if (!ok) btn.classList.add('bad');
  if (ok){ quiz.good++; if (!quizOk.includes(q[0])){ quizOk.push(q[0]); gain = QUIZ_XP; quiz.xp += gain; try { localStorage.setItem('coach-quiz', JSON.stringify(quizOk)); } catch (e) {} renderHud(); } }
  const w = $('qWhy'); w.textContent = (ok ? 'Bonne réponse' + (gain ? ` · +${gain} XP` : '') + '. ' : 'Pas tout à fait. ') + q[4]; w.className = 'qwhy ' + (ok ? 'ok' : 'bad'); w.hidden = false;
  badgeNote('qBadge');
  const n = $('qNext'); n.textContent = !quiz.flash ? 'Continuer' : quiz.i >= quiz.list.length - 1 ? 'Voir mon résultat' : 'Question suivante'; n.hidden = false; n.focus({ preventScroll: true });
}
function quizStep(){
  if (!quiz) return;
  if (!quiz.flash || quiz.end){ closeQuiz(); return; }
  if (quiz.i < quiz.list.length - 1){ quiz.i++; quizShow(); return; }
  quiz.end = true; $('qOpts').innerHTML = ''; $('qBadge').hidden = true;
  $('qKick').textContent = 'Quiz éclair'; $('qText').textContent = `${plur(quiz.good, 'bonne réponse', 'bonnes réponses')} sur ${quiz.list.length}`;
  const w = $('qWhy'); w.className = 'qwhy'; w.textContent = (quiz.xp ? `+${quiz.xp} XP. ` : '') + `Tu as trouvé ${quizOk.length} des ${QUIZ.length} questions du site.`;
  $('qNext').textContent = 'Retour à l\'entraînement'; if (quiz.good >= 4) confetti(quiz.good === 5 ? 160 : 60);
}
function closeQuiz(){
  if (!quiz) return; const q = quiz; quiz = null; $('quiz').hidden = true; goalAdd(Math.min(300, (performance.now() - q.gT) / 1000));
  if (!q.flash) $('quizBtn').hidden = true;   // une seule question bonus par partie
  if (view === 'entrainer' && !prac) renderTrain();
  if (q.back && q.back.isConnected && !q.back.hidden) q.back.focus({ preventScroll: true });
}
// Carte « Quiz éclair » de S'entraîner (appelée par renderTrain)
function renderQuizCard(){
  const e = $('tQuizS'); $('quizCard').disabled = !quizFlash().length;
  e.textContent = quizOk.length ? `${quizOk.length} sur ${QUIZ.length} trouvées` : 'Nouveau'; e.classList.toggle('ok', quizOk.length > 0);
}
// Carte de résultat d'un niveau (appelée par finish) : question bonus si le niveau est réussi, et badges gagnés
function quizOffer(st){ $('quizBtn').hidden = !!prac || !!placement || st < 2 || !quizBonus(); badgeNote('rBadge'); }
$('quizBtn').addEventListener('click', () => { const q = quizBonus(); if (q) openQuiz([q], false); });
$('quizCard').addEventListener('click', () => openQuiz(quizFlash(), true));
$('qNext').addEventListener('click', quizStep);
$('qClose').addEventListener('click', closeQuiz);
$('quiz').addEventListener('click', e => { if (e.target === $('quiz')) closeQuiz(); });
// En phase de capture : Échap ferme le quiz sans fermer la carte de résultat qui est dessous
document.addEventListener('keydown', e => { if (e.key === 'Escape' && quiz){ e.stopPropagation(); closeQuiz(); } }, true);

/* ---------- Badges ----------
   Un badge : [identifiant, nom, comment l'obtenir, signe, couleur, condition]. Les conditions lisent la
   progression déjà enregistrée ; `coach-badges` retient les badges gagnés, pour qu'une série de jours
   perdue ne retire rien et pour savoir lesquels sont nouveaux. */
const bdBest = i => Math.max(+stars[i] || 0, +ch2Stars[i] || 0);
const BADGES = [
  ['pas', 'Premier pas', 'Un premier niveau réussi', '▶', 'go', () => [stars, ch2Stars, ch3Stars].some(b => Object.values(b || {}).some(v => v >= 2))],
  ['timing', 'Bon timing', '3 étoiles sur « Le bon moment »', '◆', 'a', () => bdBest(0) >= 3],
  ['swap', 'Swap propre', '3 étoiles sur « Le swap des basses »', '⇄', 'b', () => bdBest(2) >= 3],
  ['soiree', 'Comme en soirée', '« La transition complète » réussie', '♪', 'xp', () => bdBest(3) >= 2],
  ['bases', 'Les bases', 'Chapitre 2 débloqué', 'I', 'a', () => sumStars(stars) >= 14 || (ch2Open && !PRAC_ALL)],
  ['oreille', 'Oreille fine', 'Chapitre 3 débloqué', 'II', 'b', () => sumStars(ch2Stars) >= 10],
  ['ondes', 'Lecteur d\'ondes', 'Chapitre 3 terminé', 'III', 'xp', () => CH3_LESSONS.every((_, i) => ch3Stars[i] >= 2)],
  ['sansfaute', 'Sans faute', '3 étoiles partout au chapitre 1', '★', 'mid', () => BASE_LESSONS.every((_, i) => stars[i] >= 3)],
  ['regulier', 'Régulier', 'Objectif du jour atteint 3 jours de suite', '3', 'go', () => goal.best >= 3 || pracNum('streak') >= 3],
  ['accro', 'Accro', 'Objectif du jour atteint 7 jours de suite', '7', 'go', () => goal.best >= 7 || pracNum('streak') >= 7],
  ['miniset', 'Mini-set de pro', '8 étoiles sur 9 dans un mini-set', '×3', 'mid', () => pracNum('setBest') >= 8],
  ['tete', 'Tête bien faite', '10 bonnes réponses au quiz', '?', 'xp', () => quizOk.length >= 10],
  ['vrai', 'Pour de vrai', 'Une première paire validée dans rekordbox', '✓', 'b', () => rbMis.total > 0]
];
let badgesWon = []; try { badgesWon = JSON.parse(localStorage.getItem('coach-badges') || '[]'); } catch (e) {}
badgesWon = Array.isArray(badgesWon) ? BADGES.map(b => b[0]).filter(id => badgesWon.includes(id)) : [];
// Enregistre les badges dont la condition vient d'être remplie, et les renvoie
function badgeSync(){
  const nb = BADGES.filter(b => !badgesWon.includes(b[0]) && b[5]());
  if (nb.length){ badgesWon.push(...nb.map(b => b[0])); try { localStorage.setItem('coach-badges', JSON.stringify(badgesWon)); } catch (e) {} }
  return nb;
}
function badgeNote(id){
  const nb = badgeSync(), e = $(id); e.hidden = !nb.length;
  e.textContent = nb.length ? (nb.length > 1 ? 'Nouveaux badges : ' : 'Nouveau badge : ') + nb.map(b => b[1]).join(', ') : '';
}
/* ---------- Les médailles de « Mes progrès » (lot 23) ----------
   Un dessin par badge (traits seuls, 24 × 24), doré quand il est gagné, gris avec un cadenas sinon. Toucher une médaille
   dit comment la gagner. BADGE_PROG : où en est le joueur ([actuel, but, unité]) et où aller pour progresser. */
const BADGE_ICON = {
  pas: '<path d="M8 5v14l11-7z"/>',
  timing: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
  swap: '<path d="M4 8h14l-4-4M20 16H6l4 4"/>',
  soiree: '<circle cx="7" cy="17" r="3"/><circle cx="17" cy="15" r="3"/><path d="M10 17V5l10-2v12"/>',
  bases: '<circle cx="8" cy="15" r="4"/><path d="M11 12l8-8M16 7l3 3"/>',
  oreille: '<path d="M4 15v-3a8 8 0 0 1 16 0v3"/><rect x="3" y="14" width="5" height="7" rx="2"/><rect x="16" y="14" width="5" height="7" rx="2"/>',
  ondes: '<path d="M2 12h3l2-6 3 12 3-9 2 6 2-3h5"/>',
  sansfaute: '<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/>',
  regulier: '<path d="M12 3c1 4 6 5.5 6 11a6 6 0 0 1-12 0c0-3 2-5 3.5-6.5.5 2.5 1.5 3.5 2.5 3.5 0-3-1-5 0-8z"/>',
  accro: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4M9 15l2 2 4-4"/>',
  miniset: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3"/><path d="M12 6a6 6 0 0 1 6 6"/>',
  tete: '<path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3z"/>',
  vrai: '<circle cx="12" cy="12" r="9"/><path d="M8 12l3 3 5-6"/>'
};
const LOCK_ICON = '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>';
const iconSvg = paths => `<svg viewBox="0 0 24 24" aria-hidden="true">${paths}</svg>`;
const ch1First3 = () => { const i = BASE_LESSONS.findIndex((_, k) => !(stars[k] >= 3)); return i < 0 ? 0 : i; };
const BADGE_PROG = {
  pas: () => [[stars, ch2Stars, ch3Stars].some(b => Object.values(b || {}).some(v => v >= 2)) ? 1 : 0, 1, '', () => goLesson(1, firstTodo(stars, BASE_LESSONS.length))],
  timing: () => [bdBest(0), 3, 'étoiles', () => goLesson(1, 0)],
  swap: () => [bdBest(2), 3, 'étoiles', () => goLesson(1, 2)],
  soiree: () => [Math.min(2, bdBest(3)), 2, 'étoiles', () => goLesson(1, 3)],
  bases: () => [Math.min(14, sumStars(stars)), 14, 'étoiles au chapitre 1', () => goLesson(1, firstTodo(stars, BASE_LESSONS.length))],
  oreille: () => [Math.min(10, sumStars(ch2Stars)), 10, 'étoiles au chapitre 2', () => ch2Unlocked() ? goLesson(2, firstTodo(ch2Stars, BASE_LESSONS.length)) : goLesson(1, firstTodo(stars, BASE_LESSONS.length))],
  ondes: () => [ch3Done(), CH3_LESSONS.length, 'niveaux du chapitre 3', () => ch3Unlocked() ? goLesson(3, firstTodo(ch3Stars, CH3_LESSONS.length)) : ch2Unlocked() ? goLesson(2, firstTodo(ch2Stars, BASE_LESSONS.length)) : goLesson(1, firstTodo(stars, BASE_LESSONS.length))],
  sansfaute: () => [BASE_LESSONS.filter((_, i) => stars[i] >= 3).length, BASE_LESSONS.length, 'niveaux à 3 étoiles', () => goLesson(1, ch1First3())],
  regulier: () => [Math.min(3, Math.max(goalStreak(), pracNum('streak'))), 3, 'jours de suite', () => goLesson(1, firstTodo(stars, BASE_LESSONS.length))],
  accro: () => [Math.min(7, Math.max(goalStreak(), pracNum('streak'))), 7, 'jours de suite', () => goLesson(1, firstTodo(stars, BASE_LESSONS.length))],
  miniset: () => [Math.min(8, pracNum('setBest')), 8, 'étoiles (ton meilleur mini-set)', () => { location.hash = '#entrainer'; }],
  tete: () => [Math.min(10, quizOk.length), 10, 'bonnes réponses', () => { location.hash = '#entrainer'; }],
  vrai: () => [rbMis.total > 0 ? 1 : 0, 1, '', () => { location.hash = '#vrai'; }]
};
// Le badge le plus proche : parmi ceux qu'il reste à gagner, celui dont la barre est la plus remplie
function badgeNext(){
  let best = null;
  for (const b of BADGES){ if (badgesWon.includes(b[0])) continue; const [cur, max] = BADGE_PROG[b[0]](), r = Math.min(cur, max) / max; if (!best || r > best.r) best = { b, r }; }
  return best && best.b;
}
let medalSel = '';
const medalInfo = b => { const won = badgesWon.includes(b[0]), [cur, max, unit] = BADGE_PROG[b[0]]();
  return `${b[1]} : ${b[2].charAt(0).toLowerCase() + b[2].slice(1)}. ` + (won ? 'Gagné !' : max > 1 ? `Tu en es à ${Math.min(cur, max)} sur ${max} ${unit}.` : 'Pas encore gagné.'); };
// Section « Mes badges » de « Mes progrès » (appelée par renderProgres)
function renderBadges(){
  badgeSync(); const ul = $('homeBadges'); ul.innerHTML = ''; $('badgeCount').textContent = `${badgesWon.length} sur ${BADGES.length}`;
  const order = BADGES.filter(b => badgesWon.includes(b[0])).concat(BADGES.filter(b => !badgesWon.includes(b[0])));
  for (const b of order){ const [id, name] = b, won = badgesWon.includes(id), liEl = document.createElement('li'), bt = document.createElement('button'), d = document.createElement('span'), t = document.createElement('strong');
    liEl.className = 'medal' + (won ? ' won' : ' off'); bt.type = 'button'; bt.setAttribute('aria-pressed', String(medalSel === id)); bt.setAttribute('aria-label', name + (won ? ', gagné' : ', pas encore gagné'));
    d.className = 'mdisc'; d.innerHTML = iconSvg(won ? BADGE_ICON[id] : LOCK_ICON); t.textContent = name; bt.dataset.b = id;
    bt.append(d, t); bt.addEventListener('click', () => { medalSel = medalSel === id ? '' : id; $('pgMedalInfo').textContent = medalSel ? medalInfo(b) : 'Touche une médaille pour savoir comment la gagner.';
      renderBadges(); const f = ul.querySelector(`[data-b="${id}"]`); if (f) f.focus(); });   // la liste est redessinée : on garde la médaille sélectionnée au clavier
    liEl.appendChild(bt); ul.appendChild(liEl); }
}
badgeSync();   // au chargement, sans annonce : quelqu'un qui a déjà joué retrouve ses badges sur l'accueil
