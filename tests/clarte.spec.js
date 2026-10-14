// Lot 8 : plus clair pour un débutant (mots du DJ, échecs en écart, piste visible, accueil allégé).
const { test, expect } = require('@playwright/test');
const { ouvrir, sansBandeau } = require('./outils');

const S = o => JSON.stringify(o);

test.describe('Les mots du DJ', () => {
  test('le guide a une étape « Les parties d\'un morceau »', async ({ page }) => {
    const erreurs = await ouvrir(page, { stockage: { 'coach-guide-vu': null } });
    const titres = await page.evaluate(() => ONB.map(s => s.title));
    expect(titres.slice(-3)).toEqual(['Compter en phrases', 'Les parties d\'un morceau', 'Tu es prêt']);
    await page.evaluate(() => { onb.i = ONB.findIndex(s => s.parts); renderOnb(); });
    await expect(page.locator('#onbTitle')).toHaveText('Les parties d\'un morceau');
    await expect(page.locator('.onb-parts span')).toHaveText(['Intro', 'Corps', 'Break', 'Corps', 'Outro']);
    await expect(page.locator('.onb-lex dt')).toHaveText(['Intro', 'Drop', 'Break', 'Outro']);
    expect(erreurs).toEqual([]); await sansBandeau(page);
  });
  test('« Comment faire ? » explique les mots employés par le niveau', async ({ page }) => {
    await ouvrir(page);
    await page.locator('.node').nth(0).click();
    await expect(page.locator('#llex')).toHaveText(/^Outro : la fin d'un morceau/);
    await page.locator('.node').nth(1).click();
    await expect(page.locator('#llex')).toContainText('Drop : ');
    await page.locator('.node').nth(2).click();
    await expect(page.locator('#llex')).toHaveText(/^Swap : /);
    await page.locator('.node').nth(5).click();
    await expect(page.locator('#ltitle')).toHaveText('L\'écho out');
    await expect(page.locator('#llex')).toContainText('Écho : ');
  });
});

test.describe('Messages d\'échec', () => {
  test('un lancement en plein milieu de phrase est donné en écart', async ({ page }) => {
    await ouvrir(page);
    expect(await page.evaluate(() => evalLaunch(24)[1])).toMatch(/^B est parti 8 temps trop tôt, en plein milieu d'une phrase/);
    expect(await page.evaluate(() => evalLaunch(45)[1])).toMatch(/^B est parti 13 temps trop tard/);
  });
});

test.describe('La piste reste visible', () => {
  test('sur un écran de portable, la barre des boutons ne recouvre plus la piste', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await ouvrir(page);
    await page.locator('.node').nth(1).click();
    await page.waitForTimeout(800);
    const r = await page.evaluate(() => ({ hw: document.querySelector('.hw').getBoundingClientRect().bottom, bar: $('actionbar').getBoundingClientRect().top }));
    expect(r.hw).toBeLessThanOrEqual(r.bar);
  });
});

test.describe('Moins de bruit pour un débutant', () => {
  test('pas de « Test de placement » dans les chapitres du parcours « Je débute »', async ({ page }) => {
    await ouvrir(page, { stockage: { 'coach-parcours': 'debut' } });
    await expect(page.locator('.chap.test')).toHaveCount(0);
  });
  test('il reste dans l\'autre parcours', async ({ page }) => {
    await ouvrir(page, { stockage: { 'coach-parcours': 'deja' } });
    await expect(page.locator('.chap.test')).toHaveCount(1);
  });
  test('l\'accueil ne montre que la prochaine étape et l\'objectif ; le parcours est replié, les badges sont ailleurs', async ({ page }) => {
    await ouvrir(page, { onglet: '', stockage: { 'coach-parcours': 'debut', 'coach-lecons': S({ 0: 3, 1: 2, 2: 3 }) } });
    await expect(page.locator('#homeCta')).toBeVisible();
    await expect(page.locator('#homeGoal')).toBeVisible();
    await expect(page.locator('#homeStages')).toBeHidden();
    await expect(page.locator('#pathSum')).toHaveText('Voir tout mon parcours · étape 2 sur 6');
    await expect(page.locator('#homeBadges')).toBeHidden();
    await page.locator('#pathSum').click();
    await expect(page.locator('#homeStages li')).toHaveCount(6);
    await page.locator('#homePath a[href="#progres"]').click();
    await expect(page.locator('#homeBadges li')).toHaveCount(13);
    await expect(page.locator('#homeBadges li.won')).toHaveCount(3);
  });
});
