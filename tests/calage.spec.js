// Lot 40 : chapitre 5 « Le calage » (js/calage.js). Le site mesure le décalage entre A et B pendant toute la partie ;
// les étoiles viennent de la part du temps où B est resté calé (moins de 15 ms : ★★★ à 85 %, moins de 25 ms : ★★ à 60 %).
const { test, expect } = require('@playwright/test');
const { ouvrir, sansBandeau } = require('./outils');

const OUVERT = { 'coach-ch2-ouvert': '1' };
const ch5 = async (page, n) => { await page.evaluate(() => setChapter(5)); await page.locator('.node').nth(n).click(); };
// Une note calculée sur une partie inventée : `mes` = [temps, décalage en ms], B lancé au temps 20
const note = (page, n, mes, plus = {}) => page.evaluate(([n, mes, plus]) => {
  li = n; const r = Object.assign({ launch: 20, calBpm: 124, frames: [], cal: { mes: mes.map(([b, ms]) => [b, ms, 1, 1]) } }, plus);
  const items = calEval(r); return { st: calEtoiles(r, items), items: items.map(x => x[0] + ' | ' + x[1]) };
}, [n, mes, plus]);
const serie = (de, a, f) => { const o = []; for (let b = de; b < a; b += .25) o.push([b, f(b)]); return o; };

test.describe('Le chapitre', () => {
  test('il s\'ouvre avec le chapitre 2 (14 étoiles au chapitre 1)', async ({ page }) => {
    const erreurs = await ouvrir(page);
    await page.locator('#chapBtn').click();
    await expect(page.locator('#chapters .chap').nth(4)).toContainText('Le calage');
    await expect(page.locator('#chapters .chap').nth(4)).toBeDisabled();
    await expect(page.locator('#chapters .chap').nth(4)).toContainText('Verrouillé');
    expect(erreurs).toEqual([]); await sansBandeau(page);
  });
  test('ouvert, il a 7 niveaux, le premier à l\'oreille', async ({ page }) => {
    const erreurs = await ouvrir(page, { stockage: OUVERT });
    await ch5(page, 0);
    await expect(page.locator('.node')).toHaveCount(7);
    await expect(page.locator('#ltitle')).toHaveText('Entendre le décalage');
    expect(erreurs).toEqual([]); await sansBandeau(page);
  });
  test('chaque niveau allume seulement ce qu\'il faut : molette de B, puis tempo de B, casque, LANCE B…', async ({ page }) => {
    await ouvrir(page, { stockage: OUVERT }); await ch5(page, 1);
    const allumes = () => page.evaluate(() => [...new Set([...document.querySelectorAll('.deck [data-g]:not(.eteint)')].map(e => e.dataset.g))].sort());
    expect(await allumes()).toEqual(['gJogB']);
    await page.locator('.node').nth(2).click(); expect(await allumes()).toEqual(['gJogB', 'gTempoB']);
    await page.locator('.node').nth(4).click(); expect(await allumes()).toEqual(['gCasqueB', 'gFad', 'gJogB', 'gTempoB']);
    await page.locator('.node').nth(5).click(); expect(await allumes()).toEqual(['gJogB', 'gLow', 'gPlay', 'gTempoB']);
  });
  test('le BPM disparaît à partir du niveau 4 « La vitesse à l\'oreille »', async ({ page }) => {
    await ouvrir(page, { stockage: OUVERT }); await ch5(page, 2);
    await expect(page.locator('#stage')).not.toHaveClass(/sansbpm/);
    await page.locator('.node').nth(3).click();
    await expect(page.locator('#stage')).toHaveClass(/sansbpm/);
  });
});

test.describe('La note', () => {
  test('calé presque tout le temps : 3 étoiles', async ({ page }) => {
    await ouvrir(page, { stockage: OUVERT }); await ch5(page, 1);
    const r = await note(page, 1, serie(21, 84, b => b < 26 ? 60 : 5));
    expect(r.st).toBe(3); expect(r.items[0]).toMatch(/^ok \| B est resté calé \(moins de 15 ms\) 100 %/);
  });
  test('presque calé (entre 15 et 25 ms) : 2 étoiles ; jamais calé : 1 étoile', async ({ page }) => {
    await ouvrir(page, { stockage: OUVERT }); await ch5(page, 1);
    expect((await note(page, 1, serie(21, 84, () => 20))).st).toBe(2);
    const r = await note(page, 1, serie(21, 84, () => 70));
    expect(r.st).toBe(1); expect(r.items).toContain('bad | B n’a jamais été calé 4 temps de suite.');
  });
  test('le temps laissé pour caler ne compte pas dans la note', async ({ page }) => {
    await ouvrir(page, { stockage: OUVERT }); await ch5(page, 2);
    // décalé pendant les 16 temps de grâce du niveau 3, puis calé
    expect((await note(page, 2, serie(21, 100, b => b < 36 ? 80 : 4))).st).toBe(3);
  });
  test('la vitesse finale de B est notée quand B n\'avait pas le tempo de A', async ({ page }) => {
    await ouvrir(page, { stockage: OUVERT }); await ch5(page, 2);
    const r = await page.evaluate(() => { li = 2; const r = { launch: 20, calBpm: 126, frames: [], cal: { mes: [[40, 3, 1, 1], [60, 3, 1, 1]] } }; return calEval(r).map(x => x[0] + ' | ' + x[1]); });
    expect(r).toContain('mid | B finit à 126 BPM : il va encore trop vite (A est à 124).');
  });
  test('au casque : B doit entrer calé, au temps 64', async ({ page }) => {
    await ouvrir(page, { stockage: OUVERT }); await ch5(page, 4);
    const r = await page.evaluate(() => { li = 4; const mes = []; for (let b = 21; b < 96; b += .25) mes.push([b, 4, b >= 64 ? 1 : 0, 1]);
      const run = { launch: 20, calBpm: 124, frames: [], cal: { mes } }; const it = calEval(run); return { st: calEtoiles(run, it), it: it.map(x => x[0] + ' | ' + x[1]) }; });
    expect(r.it).toContain('ok | B est entré au temps 64, déjà calé.'); expect(r.st).toBe(3);
  });
  test('niveaux 6 et 7 : B pas lancé, c\'est noté', async ({ page }) => {
    await ouvrir(page, { stockage: OUVERT }); await ch5(page, 5);
    const r = await note(page, 5, [], { launch: null });
    expect(r.items).toEqual(['bad | Tu n’as pas lancé B : appuie sur LANCE B (PLAY de droite) vers le temps 32.']);
    expect(r.st).toBe(1);
  });
});

test.describe('En vrai', () => {
  test.setTimeout(150000);
  test('niveau 1 : cinq écoutes, et les bonnes réponses donnent 3 étoiles', async ({ page }) => {
    const erreurs = await ouvrir(page, { stockage: OUVERT }); await ch5(page, 0);
    await page.locator('#startBtn').click();
    await expect(page.locator('#calQuiz')).toBeVisible({ timeout: 30000 });
    for (let i = 0; i < 5; i++){
      await expect(page.locator('#calQuiz button').first()).toBeEnabled({ timeout: 20000 });
      const bon = await page.evaluate(() => { const ms = run.q.tours[run.q.i]; return ms === 0 ? 0 : ms > 0 ? 1 : -1; });
      await page.locator(`#calQuiz button[data-r="${bon}"]`).click();
    }
    await expect(page.locator('#result')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('#rStars .on')).toHaveCount(3);
    expect(await page.evaluate(() => ch5Stars[0])).toBe(3);
    expect(erreurs).toEqual([]);
  });
  test('niveau 3 : un « robot » qui règle le tempo puis cale à la molette obtient au moins 2 étoiles', async ({ page }) => {
    const erreurs = await ouvrir(page, { stockage: OUVERT }); await ch5(page, 2);
    await page.locator('#startBtn').click();
    await expect(page.locator('#startBtn')).toHaveText('Arrêter', { timeout: 60000 });
    // le robot : tempo exact dès que B joue, puis petites touches de molette
    await page.evaluate(() => { const tick = () => { if (!run) return; if (run.launch !== null){ if (!window.__t){ ctrl.tempoB = .5 - (124 / run.calBpm - 1) / (2 * PL_TEMPO); applyCtrl(); window.__t = 1; }
      const ms = plDecalage(); if (ms != null && Math.abs(ms) > 3) plJog('B', -ms * .05); } requestAnimationFrame(tick); }; requestAnimationFrame(tick); });
    await expect(page.locator('#result')).toBeVisible({ timeout: 90000 });
    expect(await page.evaluate(() => ch5Stars[2])).toBeGreaterThanOrEqual(2);
    await expect(page.locator('#rDetails li').first()).toContainText('B est resté calé');
    expect(erreurs).toEqual([]);
  });
  test('niveau 2 sans rien faire : B reste décalé, 1 étoile', async ({ page }) => {
    await ouvrir(page, { stockage: OUVERT }); await ch5(page, 1);
    await page.locator('#startBtn').click();
    await expect(page.locator('#calBar')).toBeVisible({ timeout: 60000 });
    await expect(page.locator('#calTxt')).toHaveText(/B en (avance|retard) de \d+ ms/);
    await expect(page.locator('#result')).toBeVisible({ timeout: 90000 });
    expect(await page.evaluate(() => ch5Stars[1])).toBe(1);
  });
});
