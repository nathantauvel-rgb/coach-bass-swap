// Lot 9 : objectif du jour et série de jours.
const { test, expect } = require('@playwright/test');
const { ouvrir, sansBandeau, jouer } = require('./outils');

const S = o => JSON.stringify(o);
const jour = (decalage = 0) => { const d = new Date(); d.setDate(d.getDate() + decalage); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
const accueil = (page, objectif, autre = {}) => ouvrir(page, { onglet: '', stockage: Object.assign({ 'coach-parcours': 'debut', 'coach-objectif': objectif === undefined ? null : S(objectif) }, autre) });
const stocke = page => page.evaluate(() => JSON.parse(localStorage.getItem('coach-objectif') || 'null'));

test.describe('L\'encart de l\'accueil', () => {
  test('nouveau venu : pas d\'encart tant que le parcours n\'est pas choisi', async ({ page }) => {
    await ouvrir(page, { onglet: '', stockage: { 'coach-guide-vu': null } });
    await expect(page.locator('#homeGoal')).toBeHidden();
    await page.locator('[data-parcours=debut]').click();
    await expect(page.locator('#homeGoal')).toBeVisible();
    await expect(page.locator('#goalTitle')).toHaveText('0 min sur 10 aujourd\'hui');
    await expect(page.locator('#goalSub')).toHaveText('Atteins ton objectif chaque jour pour lancer une série.');
    await expect(page.locator('#homeTip')).toBeHidden();
  });
  test('on choisit son objectif', async ({ page }) => {
    await accueil(page, { min: 10, jours: { [jour()]: 400 } });
    await expect(page.locator('#goalTitle')).toHaveText('6 min sur 10 aujourd\'hui');
    await page.locator('a.lvlchip').click();
    await expect(page.locator('#vProgres')).toBeVisible();
    await page.locator('#progGoalSet [data-goal="5"]').click();
    await expect(page.locator('#progGoalSet [data-goal="5"]')).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('#progGoalTxt')).toHaveText("6 min sur 5 aujourd’hui. Les parties et le quiz le remplissent.".replace('’', "'"));
    await page.evaluate(() => { location.hash = '#accueil'; });
    await expect(page.locator('#goalTitle')).toHaveText('Objectif du jour atteint !');
    await expect(page.locator('#homeGoal')).toHaveClass(/done/);
    const o = await stocke(page);
    expect(o.min).toBe(5); expect(o.faits).toEqual([jour()]);
  });
  test('la série compte les jours d\'affilée, aujourd\'hui compris', async ({ page }) => {
    await accueil(page, { min: 5, jours: { [jour()]: 300 }, faits: [jour(-3), jour(-1), jour()] });
    await expect(page.locator('#goalSub')).toHaveText('Série de 2 jours. Reviens demain pour la continuer.');
  });
  test('objectif pas encore atteint aujourd\'hui : la série d\'hier tient encore', async ({ page }) => {
    await accueil(page, { min: 10, jours: { [jour()]: 120 }, faits: [jour(-1)] });
    await expect(page.locator('#goalTitle')).toHaveText('2 min sur 10 aujourd\'hui');
    await expect(page.locator('#goalSub')).toHaveText('Série de 1 jour : atteins ton objectif aujourd\'hui pour la garder.');
  });
  test('un jour manqué remet la série à zéro', async ({ page }) => {
    await accueil(page, { min: 10, faits: [jour(-3), jour(-2)] });
    await expect(page.locator('#goalSub')).toHaveText('Atteins ton objectif chaque jour pour lancer une série.');
  });
  test('des données abîmées ne bloquent rien', async ({ page }) => {
    const erreurs = await accueil(page, { min: 7, jours: [1, 2], faits: 'x', best: 'beaucoup' });
    await expect(page.locator('#goalTitle')).toHaveText('0 min sur 10 aujourd\'hui');
    expect(erreurs).toEqual([]); await sansBandeau(page);
  });
});

test.describe('Ce qui remplit l\'objectif', () => {
  test('le temps d\'une partie compte', async ({ page }) => {
    await ouvrir(page);
    await jouer(page);
    await page.waitForTimeout(3000);
    await page.locator('#startBtn').click();
    const o = await stocke(page);
    expect(o.jours[jour()]).toBeGreaterThanOrEqual(2);
  });
  test('le temps du quiz compte', async ({ page }) => {
    await ouvrir(page, { onglet: 'entrainer', stockage: { 'coach-lecons': S({ 0: 2 }) } });
    await page.locator('#quizCard').click();
    await page.waitForTimeout(2000);
    await page.locator('#qClose').click();
    expect((await stocke(page)).jours[jour()]).toBeGreaterThanOrEqual(1);
  });
  test('la carte de résultat annonce l\'objectif atteint, puis le rappelle', async ({ page }) => {
    await ouvrir(page, { stockage: { 'coach-objectif': S({ min: 5, jours: { [jour()]: 200 } }) } });
    await page.evaluate(() => { $('result').hidden = false; goalNote(); });
    await expect(page.locator('#rGoal')).toHaveText('Encore 2 min pour ton objectif du jour');
    await page.evaluate(() => { goalAdd(120); goalNote(); });
    await expect(page.locator('#rGoal')).toHaveText('Objectif du jour atteint ! Série de 1 jour.');
    await expect(page.locator('#rGoal')).toHaveClass(/done/);
    await page.evaluate(() => goalNote());
    await expect(page.locator('#rGoal')).toHaveText('Objectif du jour fait · série de 1 jour');
  });
});

test.describe('Badges de série', () => {
  test('3 jours d\'objectif d\'affilée donnent « Régulier »', async ({ page }) => {
    await ouvrir(page, { onglet: 'progres', stockage: { 'coach-parcours': 'debut', 'coach-objectif': S({ min: 5, faits: [jour(-2), jour(-1), jour()], best: 3 }) } });
    await expect(page.locator('.ptile', { hasText: 'Série en cours' })).toContainText('3 jours');
    await expect(page.locator('#homeBadges li.won strong')).toHaveText(['Régulier']);
  });
});
