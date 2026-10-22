// Lot 29 : « Ça bouge ». Vini dans les niveaux, carte de résultat façon Duolingo, écran de la série.
const { test, expect } = require('@playwright/test');
const { ouvrir, sansBandeau, jouer } = require('./outils');

const S = o => JSON.stringify(o);
const jour = (n = 0) => { const d = new Date(); d.setDate(d.getDate() + n); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
const vini = page => page.locator('#lvlVini');
// « Le bon moment » joué parfaitement (B lancé pile sur la ligne), ou pas du tout
async function bonMoment(page, lancer = true) {
  await jouer(page);
  if (lancer) { await page.waitForFunction(() => beatNow() >= 31.7, null, { timeout: 60000, polling: 'raf' }); await page.keyboard.press('Space'); }
  await expect(page.locator('#result')).toBeVisible({ timeout: 60000 });
}

test.describe('Vini pendant une partie', () => {
  test('il attend, danse sur le tempo, réagit aux gestes, puis se calme', async ({ page }) => {
    const erreurs = await ouvrir(page);
    await expect(vini(page).locator('svg')).toBeVisible();
    await expect(vini(page)).toHaveClass(/vn-calme/);
    await expect(vini(page)).toHaveAttribute('aria-label', 'Vini, la mascotte de DJingood');
    await jouer(page);
    await expect(vini(page)).toHaveClass(/vn-danse/);
    expect(await page.evaluate(() => parseFloat($('lvlVini').style.getPropertyValue('--vini-beat')))).toBeCloseTo(60 / 124, 3);
    await page.evaluate(() => pop('PARFAIT !', 'ok'));
    await expect(vini(page)).toHaveClass(/vn-parfait/);
    await expect(vini(page)).toHaveClass(/vn-danse/, { timeout: 3000 });
    await page.evaluate(() => pop('Trop tôt !', 'bad'));
    await expect(vini(page)).toHaveClass(/vn-rate/);
    await expect(vini(page)).toHaveClass(/vn-danse/, { timeout: 3000 });
    await page.evaluate(() => pop('Presque', 'mid'));
    await expect(vini(page)).toHaveClass(/vn-danse/);
    await page.locator('#startBtn').click();
    await expect(vini(page)).toHaveClass(/vn-calme/);
    expect(erreurs).toEqual([]); await sansBandeau(page);
  });
});

test.describe('Carte de résultat', () => {
  test('réussi : Vini saute de joie, titre doré, XP, précision et temps', async ({ page }) => {
    test.setTimeout(90000);
    const erreurs = await ouvrir(page);
    await bonMoment(page);
    await expect(page.locator('#rVini')).toHaveClass(/vn-parfait/);
    await expect(page.locator('#rTitle')).toHaveClass(/win/);
    await expect(page.locator('#rStats')).toBeVisible();
    await expect(page.locator('#rXp')).toHaveText('+30');
    await expect(page.locator('#rPrec')).toHaveText('100 %');
    await expect(page.locator('#rTemps')).toHaveText(/^0:[0-5]\d$/);
    await expect(page.locator('#rGain')).toHaveText('');
    expect(erreurs).toEqual([]); await sansBandeau(page);
  });
  test('raté : Vini déçu, pas de titre doré, et le record rappelé', async ({ page }) => {
    test.setTimeout(90000);
    await ouvrir(page, { stockage: { 'coach-lecons': S({ 0: 2 }) } });
    await page.locator('.node').nth(0).click();   // sinon le site ouvre le premier niveau pas encore réussi
    await bonMoment(page, false);
    await expect(page.locator('#rVini')).toHaveClass(/vn-rate/);
    await expect(page.locator('#rTitle')).not.toHaveClass(/win/);
    await expect(page.locator('#rXp')).toHaveText('+0');
    await expect(page.locator('#rPrec')).toHaveText('0 %');
    await expect(page.locator('#rGain')).toHaveText('Record : ★★');
  });
  test('en entraînement et au test de placement, pas de carte d\'XP', async ({ page }) => {
    await ouvrir(page);
    await page.evaluate(() => { placement = { i: 0, res: [] }; $('result').hidden = false; resultatCarte(3, 30, 1, 12); });
    await expect(page.locator('#rXpCard')).toBeHidden();
    await expect(page.locator('#rPrec')).toHaveText('100 %');
    await expect(page.locator('#rTemps')).toHaveText('0:12');
    await page.evaluate(() => { placement = null; resultatCarte(2, 20, .8, 75); });
    await expect(page.locator('#rXpCard')).toBeVisible();
    await expect(page.locator('#rTemps')).toHaveText('1:15');
  });
});

test.describe('Écran de la série', () => {
  test('l\'objectif du jour atteint pendant une partie : 1 jour, la semaine, puis la carte de résultat', async ({ page }) => {
    test.setTimeout(90000);
    const erreurs = await ouvrir(page, { stockage: { 'coach-objectif': S({ min: 5, jours: { [jour()]: 295 } }) } });
    await bonMoment(page);
    await expect(page.locator('#serie')).toBeVisible();
    await expect(page.locator('#serieNum')).toHaveText('1');
    await expect(page.locator('#serieTxt')).toHaveText('jour d’affilée !');
    await expect(page.locator('#serieDit')).toHaveText(/^Objectif du jour atteint/);
    await expect(page.locator('#serieSem li')).toHaveCount(7);
    await expect(page.locator('#serieSem li.auj')).toHaveClass(/fait/);
    await expect(page.locator('#serieSem li.fait')).toHaveCount(1);
    await expect(page.locator('#serieVini')).toHaveClass(/vn-danse/);
    await expect(page.locator('#serieGo')).toBeFocused();
    await page.locator('#serieGo').click();
    await expect(page.locator('#serie')).toBeHidden();
    await expect(page.locator('#result')).toBeVisible();
    await expect(page.locator('#rGoal')).toHaveText('Objectif du jour atteint ! Série de 1 jour.');
    expect(erreurs).toEqual([]); await sansBandeau(page);
  });
  test('trois jours de suite : « 3 jours d\'affilée »', async ({ page }) => {
    test.setTimeout(90000);
    await ouvrir(page, { stockage: { 'coach-objectif': S({ min: 5, jours: { [jour()]: 295 }, faits: [jour(-2), jour(-1)], best: 2 }) } });
    await bonMoment(page);
    await expect(page.locator('#serieNum')).toHaveText('3');
    await expect(page.locator('#serieTxt')).toHaveText('jours d’affilée !');
    await page.keyboard.press('Escape');
    await expect(page.locator('#serie')).toBeHidden();
    await expect(page.locator('#result')).toBeVisible();   // Échap ne ferme que l'écran de la série
  });
  test('pas d\'écran de série si l\'objectif n\'est pas atteint, ou l\'était déjà', async ({ page }) => {
    test.setTimeout(90000);
    await ouvrir(page, { stockage: { 'coach-objectif': S({ min: 15, jours: { [jour()]: 10 } }) } });
    await bonMoment(page);
    await expect(page.locator('#serie')).toBeHidden();
    await page.evaluate(() => { goal.faits.push(dayKey()); goal.jours[dayKey()] = 2000; $('result').hidden = true; });
    await bonMoment(page);
    await expect(page.locator('#serie')).toBeHidden();
  });
  test('le temps du quiz peut aussi atteindre l\'objectif : l\'écran de la série s\'affiche en le fermant', async ({ page }) => {
    await ouvrir(page, { onglet: 'entrainer', stockage: { 'coach-lecons': S({ 0: 2 }), 'coach-objectif': S({ min: 5, jours: { [jour()]: 298 } }) } });
    await page.locator('#quizCard').click();
    await page.waitForTimeout(2500);
    await page.locator('#qClose').click();
    await expect(page.locator('#serie')).toBeVisible();
    await expect(page.locator('#serieNum')).toHaveText('1');
  });
});
