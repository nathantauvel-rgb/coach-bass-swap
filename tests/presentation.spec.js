// Lot 10 : page de présentation.
const { test, expect } = require('@playwright/test');

test.describe('Page de présentation', () => {
  test('elle s\'affiche sans erreur, ses images se chargent et elle mène au site', async ({ page }) => {
    const erreurs = [], rates = [];
    page.on('pageerror', e => erreurs.push(String(e)));
    page.on('response', r => { if (r.url().startsWith('http://localhost') && r.status() >= 400) rates.push(r.url()); });
    await page.goto('/presentation.html');
    await expect(page.locator('h1')).toHaveText('Apprends à mixer sur ta table, un geste à la fois.');
    for (const img of await page.locator('img').all()) {
      await img.scrollIntoViewIfNeeded();
      await expect.poll(() => img.evaluate(i => i.complete && i.naturalWidth > 0)).toBe(true);
    }
    expect(await page.locator('img:not([alt])').count()).toBe(0);
    await page.locator('.pres-hero a.cta').click();
    await expect(page.locator('#vHome')).toBeVisible();
    expect(erreurs).toEqual([]); expect(rates).toEqual([]);
  });
  test('sur téléphone, pas de défilement de côté', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 800 });
    await page.goto('/presentation.html');
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  });
  test('les questions fréquentes s\'ouvrent', async ({ page }) => {
    await page.goto('/presentation.html');
    await page.locator('.pres-faq summary', { hasText: 'Faut-il créer un compte ?' }).click();
    await expect(page.locator('.pres-faq details[open] p')).toContainText('Rien n\'est envoyé');
  });
});
