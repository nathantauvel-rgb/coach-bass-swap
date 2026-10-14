// Lot 11 : un écran = une chose à faire (chapitres et style repliés, « Mes progrès », carte de résultat).
const { test, expect } = require('@playwright/test');
const { ouvrir, sansBandeau } = require('./outils');

const S = o => JSON.stringify(o);

test.describe('Écran d\'un niveau', () => {
  test('les chapitres tiennent sur une ligne et s\'ouvrent au clic, sans les chapitres pas encore écrits', async ({ page }) => {
    const erreurs = await ouvrir(page, { stockage: { 'coach-lecons': S({ 0: 3, 1: 3, 2: 3, 3: 3, 4: 2 }) } });
    await expect(page.locator('#chapBtn')).toHaveText('Chapitre 1 · Les bases');
    await expect(page.locator('#chapters')).toBeHidden();
    await page.locator('#chapBtn').click();
    await expect(page.locator('#chapters')).toBeVisible();
    await expect(page.locator('.chap')).toHaveCount(4);
    await page.locator('.chap').nth(1).click();
    await expect(page.locator('#chapters')).toBeHidden();
    await expect(page.locator('#chapBtn')).toHaveText('Chapitre 2 · La maîtrise');
    expect(erreurs).toEqual([]); await sansBandeau(page);
  });
  test('le choix des morceaux est replié', async ({ page }) => {
    await ouvrir(page, { stockage: { 'coach-style': 'techno' } });
    await expect(page.locator('#styleBtn')).toHaveText('Morceaux : Techno');
    await expect(page.locator('#styleOpts')).toBeHidden();
    await page.locator('#styleBtn').click();
    await page.locator('#styleOpts [data-style=afro]').click();
    await expect(page.locator('#styleOpts')).toBeHidden();
    await expect(page.locator('#styleBtn')).toHaveText('Morceaux : Afro');
    expect(await page.evaluate(() => localStorage.getItem('coach-style'))).toBe('afro');
  });
  test('plus de paragraphe en bas de page : le clavier est expliqué dans « Comment faire ? »', async ({ page }) => {
    await ouvrir(page);
    await expect(page.locator('p.after')).toHaveCount(0);
    await expect(page.locator('.howto')).toContainText('espace pour lancer B');
  });
});

test.describe('Carte de résultat', () => {
  test('le schéma s\'ouvre sur demande et se dessine à l\'ouverture', async ({ page }) => {
    await ouvrir(page);
    await page.evaluate(() => { $('result').hidden = false; drawCompare([], 0, 24); });
    await expect(page.locator('#cmpBox')).not.toHaveAttribute('open', '');
    await page.locator('#cmpBox summary').click();
    await expect.poll(() => page.evaluate(() => $('cmp').width)).toBeGreaterThan(100);
  });
});

test.describe('Mes progrès', () => {
  test('on y arrive par la pastille du niveau, avec les étoiles, la série, le quiz et les badges', async ({ page }) => {
    const erreurs = await ouvrir(page, { onglet: '', stockage: { 'coach-parcours': 'debut', 'coach-lecons': S({ 0: 3, 1: 2 }), 'coach-quiz': S(['b0a']) } });
    await page.locator('a.lvlchip').click();
    await expect(page.locator('#vProgres h1')).toHaveText('Mes progrès');
    await expect(page.locator('.ptile')).toHaveCount(8);
    await expect(page.locator('.ptile', { hasText: 'Chapitre 1' })).toContainText('5 ★ sur 21');
    await expect(page.locator('.ptile', { hasText: 'Quiz' })).toContainText('1 sur 25 trouvées');
    await expect(page.locator('#badgeCount')).toHaveText('2 sur 13');
    expect(erreurs).toEqual([]); await sansBandeau(page);
  });
});
