// Lot 8 : plus clair pour un débutant (mots du DJ, échecs en écart, piste visible, accueil allégé).
const { test, expect } = require('@playwright/test');

test.describe('À l\'oreille et en Mode Expert : aucun repère devant la ligne', () => {
  test('un geste déjà fait ne montre pas son repère avant que la ligne l\'atteigne', async ({ page }) => {
    await page.goto('/index.html#apprendre');
    const r = await page.evaluate(() => [markShown(true, 64, 40, 'ok'), markShown(true, 64, 64.2, 'ok'), markShown(true, 64, 70, null), markShown(false, 64, 40, null)]);
    expect(r).toEqual([false, true, false, true]);
  });
});
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
    await page.locator('.node').nth(5).click();
    await expect(page.locator('#llex')).toHaveText(/^Swap : /);
    await page.locator('.node').nth(3).click();
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
    const r = await page.evaluate(() => { const a = document.querySelector('.hw').getBoundingClientRect(), b = $('actionbar').getBoundingClientRect(); return { hw: [a.top, a.bottom], bar: [b.top, b.bottom] }; });
    // Depuis le lot 36, sur ordinateur, la barre est au-dessus de la piste (à côté de la consigne) : jamais par-dessus
    expect(r.hw[1] <= r.bar[0] || r.bar[1] <= r.hw[0]).toBe(true);
  });

  // Gardien du lot 36 : rangée en bas de la scène, « Jouer » était sous le bas de l'écran d'un PC (jusqu'à 630 px plus
  // bas avec la « Position de départ »), alors qu'en ligne il se voyait toujours
  test('sur un PC 1366 × 768, « Jouer » se voit sans défiler, même avec la position de départ', async ({ page }) => {
    await page.setViewportSize({ width: 1366, height: 768 });
    await ouvrir(page, { midi: { branchee: true }, stockage: { 'coach-lecons': '{"0":3,"1":2,"2":2,"3":2,"4":2,"5":2}' } });
    for (const n of [0, 6]){
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.locator('.node').nth(n).click();
      if (n === 6) await expect(page.locator('#setup')).toBeVisible();
      await expect(page.locator('#startBtn')).toBeInViewport({ ratio: 1 });
    }
  });

  // Gardien du lot 36 : rangée dans une colonne, la barre ne pouvait plus rester collée en bas (elle ne sort jamais de sa boîte)
  test('sur téléphone, « Jouer » reste collé en bas de l’écran pendant qu’on fait défiler la scène', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await ouvrir(page);
    await page.locator('.node').first().click();
    const [vus, n] = await page.evaluate(async () => { const st = $('stage'), y0 = scrollY + st.getBoundingClientRect().top, y1 = y0 + st.offsetHeight - innerHeight; let vus = 0, n = 0;
      for (let y = y0; y <= y1; y += 60){ window.scrollTo(0, y); await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
        const b = $('startBtn').getBoundingClientRect(); n++; if (b.top >= 0 && b.bottom <= innerHeight) vus++; }
      return [vus, n]; });
    expect(n).toBeGreaterThan(3);
    expect(vus).toBe(n);
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
    await ouvrir(page, { onglet: '', stockage: { 'coach-parcours': 'debut', 'coach-lecons': S({ 0: 3, 1: 2, 5: 3 }) } });
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
