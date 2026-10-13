// Onglet S'entraîner.
// Tous les fichiers de js/ partagent la même portée et sont chargés dans l'ordre indiqué dans index.html.
'use strict';
/* ---------- S'entraîner : défi du jour, variations, à l'oreille, mini-sets ----------
   Une séance (`prac`) rejoue les niveaux du chapitre 1 déjà joués dans Apprendre, sur la même scène,
   avec un style et une variante imposés. Elle ne touche pas aux étoiles des leçons. */
const PRAC_KEY = 'coach-entrainement', PRAC_STYLES = ['house', 'techno', 'afro'], PRAC_ALL = /[?&]tout=1/.test(location.search);
let pracData = {}; try { pracData = JSON.parse(localStorage.getItem(PRAC_KEY) || '{}'); } catch (e) {}
if (!pracData || typeof pracData !== 'object' || Array.isArray(pracData)) pracData = {};
const pracNum = k => Math.max(0, Math.floor(+pracData[k]) || 0);
const pracStr = k => typeof pracData[k] === 'string' ? pracData[k] : '';
const savePrac = () => { try { localStorage.setItem(PRAC_KEY, JSON.stringify(pracData)); } catch (e) {} };
const pracRand = n => Math.floor(Math.random() * n);
const plur = (n, one, many) => n + ' ' + (n > 1 ? many : one);
const dayKey = (d = new Date()) => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
const yesterdayKey = () => { const d = new Date(); d.setDate(d.getDate() - 1); return dayKey(d); };
const streakNow = () => [dayKey(), yesterdayKey()].includes(pracStr('lastOk')) ? pracNum('streak') : 0;
const pracPool = () => BASE_LESSONS.map((_, i) => i).filter(i => PRAC_ALL || stars[i] >= 1);
function dailyPick(pool){ let h = 7; for (const c of dayKey()) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return { li: pool[h % pool.length], sty: PRAC_STYLES[(h >>> 4) % 3], vr: (h >>> 8) % VARIANTS }; }
function renderTrain(){
  const pool = pracPool(), ok = pool.length > 0, doneToday = pracStr('defiDate') === dayKey(), ds = doneToday ? Math.min(3, pracNum('defiStars')) : 0, sk = streakNow();
  document.querySelectorAll('#vTrain [data-prac]').forEach(b => { b.disabled = !ok || (b.dataset.prac === 'set' && pool.length < 3); });
  const tag = (id, txt, good) => { const e = $(id); e.textContent = txt; e.classList.toggle('ok', !!good); };
  tag('tDefiS', ds >= 2 ? 'Réussi ' + '★'.repeat(ds) : doneToday ? 'À retenter' : 'À faire', ds >= 2);
  const p = ok ? dailyPick(pool) : null;
  $('tDefiP').textContent = (p ? `Aujourd'hui : ${BASE_LESSONS[p.li].title}, en ${STYLE_DEFS[p.sty].label}.` : 'Une transition différente chaque jour.') + (sk ? ` Série en cours : ${plur(sk, 'jour', 'jours')}.` : '');
  tag('tVarS', pracNum('vars') ? plur(pracNum('vars'), 'jouée', 'jouées') : 'Nouveau', pracNum('vars'));
  tag('tEarS', pracNum('ears') ? plur(pracNum('ears'), 'réussie', 'réussies') : 'Nouveau', pracNum('ears'));
  tag('tSetS', pool.length < 3 ? 'Verrouillé' : pracNum('setBest') ? `Record : ${pracNum('setBest')}/9 ★` : 'Nouveau', pool.length >= 3 && pracNum('setBest'));
  $('tSetP').textContent = pool.length < 3 ? 'Joue 3 niveaux dans Apprendre pour débloquer les mini-sets.' : 'Trois transitions d\'affilée, sans pouvoir rejouer : comme en soirée.';
  renderQuizCard();
  $('trainNote').innerHTML = ok ? `L'entraînement reprend les niveaux que tu as déjà joués dans Apprendre (${pool.length} sur ${BASE_LESSONS.length}), sur d'autres morceaux.` : 'Joue d\'abord un niveau dans <a href="#apprendre">Apprendre</a> : l\'entraînement reprend les gestes que tu connais déjà.';
}
function startPrac(kind){
  const pool = pracPool(); if (run || prac || !pool.length || (kind === 'set' && pool.length < 3)) return;
  prac = { kind, ear: kind === 'ear', back: { chapter, li }, i: 0, res: [], queue: [], done: false, sty: 'house', vr: 0, last: '' };
  if (kind === 'set'){ const rest = pool.slice(); while (prac.queue.length < 3) prac.queue.push(rest.splice(pracRand(rest.length), 1)[0]); }
  chapter = 1; LESSONS = BASE_LESSONS;
  $('vTrain').hidden = true; $('vLearn').hidden = false; $('vLearn').classList.add('prac'); $('prBanner').hidden = false;
  pracSelect(); window.scrollTo(0, 0);
}
function pracSelect(){
  const pool = pracPool(); let pick = null;
  if (prac.kind === 'defi') pick = dailyPick(pool);
  else for (let tries = 0; tries < 6; tries++){ pick = { li: prac.kind === 'set' ? prac.queue[prac.i] : pool[pracRand(pool.length)], sty: PRAC_STYLES[pracRand(3)], vr: pracRand(VARIANTS) }; if (pick.li + pick.sty !== prac.last) break; }
  prac.sty = pick.sty; prac.vr = pick.vr; prac.last = pick.li + pick.sty;
  selectLesson(pick.li);
  const name = { defi: 'Défi du jour', var: 'Variation', ear: 'À l\'oreille', set: `Mini-set · transition ${prac.i + 1} sur 3` }[prac.kind];
  $('lnum').textContent = name; $('prTitle').textContent = name; $('prText').textContent = LESSONS[li].title + ', en ' + STYLE_DEFS[prac.sty].label;
  $('styleSeg').hidden = true; $('retry').hidden = prac.kind === 'set'; $('cmpBox').hidden = false;
  if (prac.ear){ $('modeTag').hidden = false; $('modeTag').textContent = 'À l\'oreille'; const t = 'À l\'oreille : pas de compte à rebours. Compte les phrases dans ta tête.'; $('hint').textContent = t; say(t); }
}
function pracStep(st){
  prac.res[prac.i] = st; const k = prac.kind; let gain = '', nextTxt = '';
  if (k === 'defi'){ const t = dayKey(); pracData.defiStars = pracStr('defiDate') === t ? Math.max(pracNum('defiStars'), st) : st; pracData.defiDate = t;
    if (st >= 2 && pracStr('lastOk') !== t){ pracData.streak = pracStr('lastOk') === yesterdayKey() ? pracNum('streak') + 1 : 1; pracData.lastOk = t; }
    gain = st >= 2 ? 'Défi réussi · série de ' + plur(streakNow(), 'jour', 'jours') : 'Il faut 2 étoiles pour valider le défi : rejoue !'; nextTxt = 'Retour à l\'entraînement'; }
  if (k === 'var'){ pracData.vars = pracNum('vars') + 1; gain = plur(pracNum('vars'), 'variation jouée', 'variations jouées'); nextTxt = 'Une autre variation'; }
  if (k === 'ear'){ if (st >= 2) pracData.ears = pracNum('ears') + 1; gain = st >= 2 ? plur(pracNum('ears'), 'réussie', 'réussies') + ' à l\'oreille' : 'Pas encore : suis la grosse caisse et compte 8 mesures.'; nextTxt = 'Une autre à l\'oreille'; }
  if (k === 'set'){ if (st === 1) $('rTitle').textContent = 'Pas encore. Lis le conseil, puis enchaîne.'; gain = `Transition ${prac.i + 1} sur 3`; nextTxt = prac.i >= 2 ? 'Voir mon résultat' : 'Transition suivante'; }
  savePrac(); $('rGain').textContent = gain; $('next').hidden = false; $('next').textContent = nextTxt; $('retry').hidden = k === 'set';
}
function pracNext(){
  $('result').hidden = true;
  if (prac.kind === 'defi' || prac.done){ quitPrac(); return; }
  if (prac.kind === 'set'){ if (prac.i >= 2){ pracVerdict(); return; } prac.i++; }
  pracSelect();
}
function pracVerdict(){
  const tot = prac.res.reduce((s, x) => s + (x || 0), 0), old = pracNum('setBest'); pracData.setBest = Math.max(old, tot); savePrac(); prac.done = true;
  $('rStars').innerHTML = ''; $('rTitle').textContent = tot >= 8 ? 'Mini-set de pro !' : tot >= 6 ? 'Beau mini-set !' : 'Mini-set terminé';
  $('rGain').textContent = `${tot} ★ sur 9` + (tot > old ? ' · nouveau record !' : ` · record : ${old} ★`);
  $('rDetails').innerHTML = ''; $('cmpBox').hidden = true; $('retry').hidden = true; badgeNote('rBadge');
  prac.queue.forEach((q, j) => { const x = document.createElement('li'); x.className = (prac.res[j] || 0) >= 2 ? 'ok' : 'bad'; x.textContent = `${BASE_LESSONS[q].title} : ${'★'.repeat(prac.res[j] || 0) || 'pas réussi'}`; $('rDetails').appendChild(x); });
  $('next').hidden = false; $('next').textContent = 'Retour à l\'entraînement'; $('result').hidden = false; if (tot >= 6) confetti(tot >= 8 ? 160 : 60);
}
function quitPrac(){
  if (!prac) return; const b = prac.back; prac = null;
  chapter = b.chapter; LESSONS = chapter === 3 ? CH3_LESSONS : BASE_LESSONS; selectLesson(Math.min(b.li, LESSONS.length - 1));
  $('retry').hidden = false; $('cmpBox').hidden = false; $('next').textContent = 'Niveau suivant';
  $('prBanner').hidden = true; $('vLearn').classList.remove('prac');
  if (view === 'entrainer'){ $('vLearn').hidden = true; $('vTrain').hidden = false; renderTrain(); window.scrollTo(0, 0); }
}
$('prQuit').addEventListener('click', quitPrac);
document.querySelectorAll('#vTrain [data-prac]').forEach(b => b.addEventListener('click', () => startPrac(b.dataset.prac)));
