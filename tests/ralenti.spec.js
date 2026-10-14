// Lot 15 : ralenti, seulement sur les combos (chapitre 4), et seulement après deux échecs de suite.
const { test, expect } = require('@playwright/test');
const { ouvrir, sansBandeau, jouer } = require('./outils');

const S = o => JSON.stringify(o);
const CH1_OK = S({ 0: 2, 1: 2, 2: 2, 3: 2, 4: 2, 5: 2, 6: 2 });
const robot = page => page.evaluate(() => { const l = LESSONS[li];
  const tick = () => { if (!run) return; const b = beatNow();
    for (const k of l.user) ctrl[k] = ideal(k, b); applyCtrl();
    if (!l.autoLaunch && run.launch === null && b >= l.launchBeat - .3) launchB();
    if (l.btn.includes('echo') && !echoOn && run.echoAt == null && b >= 62.9) toggleEcho();
    requestAnimationFrame(tick); };
  requestAnimationFrame(tick); });
// Affiche la carte de résultat comme après une partie notée `st` étoiles, sans jouer
const resultat = (page, st) => page.evaluate(s => { $('result').hidden = false; $('rTitle').textContent = 'Pas encore.'; slowOffer(s); }, st);

test.describe('Quand le ralenti est proposé', () => {
  test('chapitre 4 : après deux échecs de suite, pas avant', async ({ page }) => {
    await ouvrir(page, { stockage: { 'coach-lecons': CH1_OK, 'coach-chapitre': '4' } });
    await page.locator('.node').nth(1).click();
    await resultat(page, 1);
    await expect(page.locator('#slowBtn')).toBeHidden();
    await resultat(page, 1);
    await expect(page.locator('#slowBtn')).toHaveText('Réessayer au ralenti (90 %)');
  });
  test('une réussite remet le compteur à zéro', async ({ page }) => {
    await ouvrir(page, { stockage: { 'coach-lecons': CH1_OK, 'coach-chapitre': '4' } });
    await resultat(page, 1); await resultat(page, 2); await resultat(page, 1);
    await expect(page.locator('#slowBtn')).toBeHidden();
  });
  test('jamais aux chapitres 1, 2 et 3', async ({ page }) => {
    await ouvrir(page);
    await resultat(page, 1); await resultat(page, 1); await resultat(page, 1);
    await expect(page.locator('#slowBtn')).toBeHidden();
  });
  test('changer de niveau remet la vitesse normale', async ({ page }) => {
    await ouvrir(page, { stockage: { 'coach-lecons': CH1_OK, 'coach-chapitre': '4' } });
    await page.evaluate(() => { speed = .8; });
    await page.locator('.node').nth(2).click();
    expect(await page.evaluate(() => speed)).toBe(1);
  });
});

test.describe('Jouer au ralenti', () => {
  test('« La transition éclair » à 80 % : le morceau est plus lent, 2 étoiles au plus, puis « Rejouer à 100 % »', async ({ page }) => {
    test.setTimeout(150000);
    const erreurs = await ouvrir(page, { stockage: { 'coach-lecons': CH1_OK, 'coach-chapitre': '4', 'coach-style': 'house' } });
    await page.locator('.node').nth(1).click();
    await page.evaluate(() => { speed = .8; });
    await jouer(page);
    expect(await page.evaluate(() => BPM)).toBeCloseTo(124 * .8, 3);
    await expect(page.locator('#styleTag')).toHaveText('House · 99 BPM · ralenti 80 %');
    await robot(page);
    await expect(page.locator('#result')).toBeVisible({ timeout: 90000 });
    await expect(page.locator('#rStars span.on')).toHaveCount(2);
    await expect(page.locator('#rTitle')).toHaveText('Réussi au ralenti (80 %) ! Repasse à 100 % pour les 3 étoiles.');
    await expect(page.locator('#slowBtn')).toHaveText('Rejouer à 100 %');
    expect(JSON.parse(await page.evaluate(() => localStorage.getItem('coach-ch4')))).toEqual({ 1: 2 });
    await page.locator('#slowBtn').click();
    await expect(page.locator('#startBtn')).toHaveText('Arrêter', { timeout: 60000 });
    expect(await page.evaluate(() => BPM)).toBe(124);
    await expect(page.locator('#styleTag')).toHaveText('House · 124 BPM');
    expect(erreurs).toEqual([]); await sansBandeau(page);
  });
});
