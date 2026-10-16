// Lot 20 : Mode Expert sur les 7 niveaux des bases (sans calage automatique, sans compte à rebours ni repère, score sur 100).
const { test, expect } = require('@playwright/test');
const { ouvrir, sansBandeau } = require('./outils');

const S = o => JSON.stringify(o);
const EXPERT = { 'coach-expert': S({ on: true, best: {} }) };
// Robot : lance B quand le temps entendu atteint la cible (+ décalage voulu, en temps), et garde le temps du lancement
const robot = (decalage = 0) => { const tick = () => { if (run && run.expert && run.launch === null && heardBeat() >= LESSONS[li].launchBeat + decalage){ launchB(); window.__L = run.launch; }
  if (!document.getElementById('result').hidden) return; requestAnimationFrame(tick); }; requestAnimationFrame(tick); };
const expertDe = page => page.evaluate(() => JSON.parse(localStorage.getItem('coach-expert')));

test.describe('Mode Expert', () => {
  test('le bouton : au chapitre 1, retenu d\'une visite à l\'autre', async ({ page }) => {
    const erreurs = await ouvrir(page, { stockage: { 'coach-ch2-ouvert': '1' } });
    const bt = page.locator('#expertBtn');
    await expect(bt).toHaveText('Mode Expert');
    await expect(bt).toHaveAttribute('aria-pressed', 'false');
    expect(await page.evaluate(() => TOL)).toBe(1);
    await bt.click();
    await expect(bt).toHaveAttribute('aria-pressed', 'true');
    await expect(bt).toHaveText('Mode Expert · record —');
    expect(await page.evaluate(() => TOL)).toBe(.25);
    await expect(page.locator('#planNote')).toContainText('Mode Expert : pas de compte à rebours ni de repère');
    expect(await expertDe(page)).toEqual({ on: true, best: {} });
    await page.reload();
    await expect(page.locator('#expertBtn')).toHaveAttribute('aria-pressed', 'true');
    await page.evaluate(() => setChapter(2));
    await expect(page.locator('#expertBtn')).toBeHidden();
    expect(await page.evaluate(() => TOL)).toBe(.5);
    expect(erreurs).toEqual([]);
  });
  test('une partie : pas de compte à rebours, B part à l\'instant de l\'appui, score sur 100 et record', async ({ page }) => {
    const erreurs = await ouvrir(page, { stockage: EXPERT });
    await page.locator('.node').nth(0).click();
    await page.locator('#startBtn').click();
    await expect(page.locator('#startBtn')).toHaveText('Arrêter', { timeout: 60000 });
    expect(await page.evaluate(() => run.expert)).toBe(true);
    await expect(page.locator('#cdNum')).toHaveText('?');
    await page.evaluate(robot);
    await expect(page.locator('#result')).toBeVisible({ timeout: 60000 });
    const L = await page.evaluate(() => window.__L);
    expect(Number.isInteger(L)).toBe(false);   // pas arrondi au temps le plus proche
    await expect(page.locator('#rGain')).toContainText('· premier record');
    const score = +(await page.locator('#rGain').textContent()).match(/Expert : (\d+)\/100/)[1];
    expect(score).toBeGreaterThanOrEqual(80);
    await expect(page.locator('#rDetails li').first()).toContainText(' ms');
    expect((await expertDe(page)).best).toEqual({ 0: score });
    await expect(page.locator('#expertBtn')).toHaveText(`Mode Expert · record ${score}/100`);
    expect(erreurs).toEqual([]); await sansBandeau(page);
  });
  test('un lancement en retard fait baisser le score, et le record ne baisse pas', async ({ page }) => {
    await ouvrir(page, { stockage: { 'coach-expert': S({ on: true, best: { 0: 99 } }) } });
    await page.locator('.node').nth(0).click();
    await page.locator('#startBtn').click();
    await expect(page.locator('#startBtn')).toHaveText('Arrêter', { timeout: 60000 });
    await page.evaluate(robot, .25);   // un quart de temps : environ 120 ms en retard
    await expect(page.locator('#result')).toBeVisible({ timeout: 60000 });
    await expect(page.locator('#rGain')).toContainText('record : 99/100');
    await expect(page.locator('#rDetails li').first()).toContainText('ms trop tard');
    const score = +(await page.locator('#rGain').textContent()).match(/Expert : (\d+)\/100/)[1];
    expect(score).toBeLessThan(40);
    expect((await expertDe(page)).best).toEqual({ 0: 99 });
  });
  test('le lancement est noté en millisecondes', async ({ page }) => {
    await ouvrir(page);
    const r = await page.evaluate(() => [evalLaunchX(32 + .02 / P), evalLaunchX(32 - .1 / P), evalLaunchX(34), evalLaunchX(null)].map(([n, t, v]) => [n, t, Math.round(v * 100)]));
    expect(r[0][0]).toBe('ok'); expect(r[0][1]).toContain('à 20 ms du temps'); expect(r[0][2]).toBe(93);
    expect(r[1][0]).toBe('mid'); expect(r[1][1]).toContain('100 ms trop tôt'); expect(r[1][2]).toBe(36);
    expect(r[2][0]).toBe('bad'); expect(r[2][1]).toContain('2 temps trop tard'); expect(r[2][2]).toBe(0);
    expect(r[3][0]).toBe('bad');
  });
  test('sans Mode Expert, rien ne change : B est calé sur le temps le plus proche', async ({ page }) => {
    await ouvrir(page);
    await page.locator('.node').nth(0).click();
    await page.locator('#startBtn').click();
    await expect(page.locator('#startBtn')).toHaveText('Arrêter', { timeout: 60000 });
    expect(await page.evaluate(() => run.expert)).toBe(false);
    await page.waitForFunction(() => beatNow() >= 31.8, null, { polling: 'raf', timeout: 30000 });
    await page.evaluate(() => launchB());
    expect(await page.evaluate(() => run.launch)).toBe(32);
  });
  for (const v of ['{oops', S([1]), S({ on: 'oui', best: { 0: 500, x: 3, 1: 50, 2: 7.5 } })]) test(`« coach-expert » abîmé (${v}) : la page charge, sans Mode Expert`, async ({ page }) => {
    const erreurs = await ouvrir(page, { stockage: { 'coach-expert': v } });
    expect(await page.evaluate(() => [expert, xBest])).toEqual([false, v.includes('50') ? { 1: 50 } : {}]);
    await expect(page.locator('#expertBtn')).toHaveAttribute('aria-pressed', 'false');
    expect(erreurs).toEqual([]);
  });
});

test.describe('Mode Expert : les gestes continus', () => {
  test('le swap parfait au temps entendu donne un score élevé, écrit en millisecondes', async ({ page }) => {
    await ouvrir(page, { stockage: EXPERT });
    await page.locator('.node').nth(5).click();
    await page.locator('#startBtn').click();
    await expect(page.locator('#startBtn')).toHaveText('Arrêter', { timeout: 60000 });
    await page.evaluate(() => { const tick = () => { if (!run) return; const hb = heardBeat(); for (const k of ['lowA', 'lowB']) ctrl[k] = ideal(k, hb); applyCtrl(); requestAnimationFrame(tick); }; requestAnimationFrame(tick); });
    await expect(page.locator('#result')).toBeVisible({ timeout: 60000 });
    const score = +(await page.locator('#rGain').textContent()).match(/Expert : (\d+)\/100/)[1];
    expect(score).toBeGreaterThanOrEqual(60);   // le robot agit à chaque image de l'écran : sur un PC chargé, quelques dizaines de ms de retard
    await expect(page.locator('#rDetails li').first()).toContainText(' ms');
  });
});

test('Mode Expert : un geste sur la table est noté à l\'instant où il arrive', async ({ page }) => {
  await ouvrir(page, { stockage: EXPERT, midi: { branchee: true } });
  await page.locator('.node').nth(5).click();
  await page.evaluate(() => { window.__midi.envoyer(0xB0, 15, 64); window.__midi.envoyer(0xB1, 15, 0); });
  await page.locator('#startBtn').click();
  await expect(page.locator('#startBtn')).toHaveText('Arrêter', { timeout: 60000 });
  const n = await page.evaluate(() => { const avant = run.frames.length; window.__midi.envoyer(0xB0, 15, 30); return run.frames.length - avant; });
  expect(n).toBe(1);
  expect(await page.evaluate(() => run.frames[run.frames.length - 1].la)).toBeCloseTo(30 / 127, 3);
});

test('Mode Expert : mis de côté pendant le test de placement, il revient quand on le quitte', async ({ page }) => {
  await ouvrir(page, { stockage: Object.assign({ 'coach-parcours': 'deja' }, EXPERT) });
  await page.evaluate(() => startPlacement());
  await expect(page.locator('#expertBtn')).toBeHidden();
  expect(await page.evaluate(() => TOL)).toBe(1);
  await page.locator('#pQuit').click();
  await expect(page.locator('#expertBtn')).toBeVisible();
  expect(await page.evaluate(() => TOL)).toBe(.25);
  await expect(page.locator('#planNote')).toContainText('Mode Expert');
});
