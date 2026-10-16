// Lot 13 : des niveaux plus courts, qui s'arrêtent peu après le dernier geste noté.
const { test, expect } = require('@playwright/test');
const { ouvrir, sansBandeau, jouer } = require('./outils');

test.describe('Durée des niveaux', () => {
  test('chaque niveau du chapitre 1 s\'arrête peu après son dernier geste', async ({ page }) => {
    await ouvrir(page);
    expect(await page.evaluate(() => BASE_LESSONS.map(l => [l.start, l.end]))).toEqual([[20, 44], [24, 100], [40, 72], [40, 74], [24, 100], [24, 72], [16, 100]]);
    // aucune légende de démo ne tombe après la fin du niveau
    expect(await page.evaluate(() => BASE_LESSONS.every(l => l.caps.every(c => c[0] < l.end)))).toBe(true);
    // aucun geste noté ne tombe après la fin du niveau
    expect(await page.evaluate(() => BASE_LESSONS.every(l => l.targets.every(t => t[0] < l.end)))).toBe(true);
  });
  test('« Le bon moment » se termine une douzaine de temps après le lancement de B', async ({ page }) => {
    test.setTimeout(90000);
    const erreurs = await ouvrir(page);
    await page.locator('.node').nth(0).click();
    await jouer(page);
    const t0 = Date.now();
    await page.waitForFunction(() => beatNow() >= 31.6, null, { timeout: 60000, polling: 'raf' });
    await page.keyboard.press('Space');
    await expect(page.locator('#result')).toBeVisible({ timeout: 30000 });
    expect(Date.now() - t0).toBeLessThan(16000);
    await expect(page.locator('#rStars span.on')).toHaveCount(3);
    expect(erreurs).toEqual([]); await sansBandeau(page);
  });
  test('« Le fader » : le premier repère arrive tout de suite', async ({ page }) => {
    await ouvrir(page);
    await page.locator('.node').nth(1).click();
    await jouer(page);
    await expect(page.locator('#tip')).toHaveText(/^Dans [1-9] temps : commence à monter le fader de B, doucement\.$/, { timeout: 15000 });
  });
});
