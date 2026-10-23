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

// Lot 44 : la carte est plus simple (demande de l'utilisateur : « trop de couleurs, trop d'informations ») : plus de cartes
// de couleur, une ligne (record, XP), « À travailler » (le geste le moins réussi), le détail replié.
test.describe('Carte de résultat', () => {
  test('réussi : Vini saute de joie, une ligne avec les XP, rien à travailler', async ({ page }) => {
    test.setTimeout(90000);
    const erreurs = await ouvrir(page);
    await bonMoment(page);
    await expect(page.locator('#rVini')).toHaveClass(/vn-parfait/);
    await expect(page.locator('#rTitle')).toHaveClass(/win/);
    await expect(page.locator('#rStats')).toHaveCount(0);
    await expect(page.locator('#rGain')).toHaveText('+30 XP');
    await expect(page.locator('#rTravail')).toBeHidden();
    await expect(page.locator('#rNote')).toBeHidden();
    await expect(page.locator('#rTout')).not.toHaveAttribute('open', '');
    await expect(page.locator('#next')).toHaveClass(/go/);
    // le titre n'est plus doré : le doré reste aux étoiles
    expect(await page.evaluate(() => getComputedStyle($('rTitle')).color === getComputedStyle(document.body).color)).toBe(true);
    expect(erreurs).toEqual([]); await sansBandeau(page);
  });
  test('raté : Vini déçu, le record rappelé, et ce qu’il faut travailler', async ({ page }) => {
    test.setTimeout(90000);
    await ouvrir(page, { stockage: { 'coach-lecons': S({ 0: 2 }) } });
    await page.locator('.node').nth(0).click();   // sinon le site ouvre le premier niveau pas encore réussi
    await bonMoment(page, false);
    await expect(page.locator('#rVini')).toHaveClass(/vn-rate/);
    await expect(page.locator('#rTitle')).not.toHaveClass(/win/);
    await expect(page.locator('#rGain')).toHaveText('Record : ★★');
    await expect(page.locator('#rTravail')).toBeVisible();
    await expect(page.locator('#rQuoi')).toContainText("Tu n'as pas lancé B");
    await expect(page.locator('#retry')).toHaveClass(/go/);
  });
  test('« À travailler » prend le geste le moins réussi ; le détail est replié et compte les gestes', async ({ page }) => {
    await ouvrir(page);
    await page.evaluate(() => { $('result').hidden = false; resultatCarte(2, [['ok', 'Lancé pile.', 1], ['mid', 'Swap un peu tard.', .5], ['bad', 'Deux basses ensemble.', 0]]); });
    await expect(page.locator('#rQuoi')).toHaveText('Deux basses ensemble.');
    await expect(page.locator('#rCout')).toBeHidden(); await expect(page.locator('#rAstuce')).toBeHidden();
    await expect(page.locator('#rToutSum')).toHaveText('Voir le détail (3)');
    await page.evaluate(() => resultatCarte(3, [['ok', 'Lancé pile.', 1]]));
    await expect(page.locator('#rTravail')).toBeHidden();
    // le mini-set et l'ancien test de placement : leur liste se lit dépliée
    await page.evaluate(() => resultatListe());
    await expect(page.locator('#rTout')).toHaveAttribute('open', '');
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
