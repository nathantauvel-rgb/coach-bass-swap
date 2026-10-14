// Lot 12 : Passer au vrai, une étape à la fois.
const { test, expect } = require('@playwright/test');
const { ouvrir, sansBandeau } = require('./outils');

const visibles = page => page.locator('#rbMissions li:visible');
async function paire(page) {
  await page.locator('#rbDemo').click();
  await page.locator('#rbPairs .duo').first().click();
}

test.describe('Passer au vrai, une étape à la fois', () => {
  test('3 paires, puis la liste se replie sur la paire choisie', async ({ page }) => {
    const erreurs = await ouvrir(page, { onglet: 'vrai' });
    await page.locator('#rbDemo').click();
    await expect(page.locator('#rbPairs .duo')).toHaveCount(3);
    await expect(page.locator('#rbMore')).toBeVisible();
    await expect(page.locator('#rbMisBox')).toBeHidden();
    await page.locator('#rbPairs .duo').first().click();
    await expect(page.locator('#rbPairPick')).toBeHidden();
    await expect(page.locator('#rbPairTitle')).toHaveText('2. Ta paire');
    await expect(page.locator('#rbPairTxt')).toHaveText(/^« Sable chaud » → « Tambours » · 120 et 121 BPM/);
    await page.locator('#rbPairChange').click();
    await expect(page.locator('#rbPairPick')).toBeVisible();
    await expect(page.locator('#rbMisBox')).toBeHidden();
    expect(erreurs).toEqual([]); await sansBandeau(page);
  });
  test('une mission à la fois, avec des pastilles', async ({ page }) => {
    await ouvrir(page, { onglet: 'vrai' });
    await paire(page);
    await expect(visibles(page)).toHaveCount(1);
    await expect(page.locator('#rbDots span')).toHaveCount(6);
    await expect(page.locator('#rbMisSub')).toHaveText(/^Mission 1 sur 6\./);
    await expect(visibles(page).locator('strong')).toHaveText('Prépare tes deux morceaux');
    await page.locator('#rbMissions .rbok').click();
    await expect(page.locator('#rbMisSub')).toHaveText(/^Mission 2 sur 6\./);
    await expect(page.locator('#rbDots span.done')).toHaveCount(1);
    await expect(visibles(page).locator('strong')).toHaveText('Repère la fin du premier morceau');
  });
  test('« Voir toutes les missions » montre les 6, et on peut décocher', async ({ page }) => {
    await ouvrir(page, { onglet: 'vrai' });
    await paire(page);
    await page.locator('#rbMissions .rbok').click();
    await page.locator('#rbMisAll').click();
    await expect(visibles(page)).toHaveCount(6);
    await expect(page.locator('#rbMisAll')).toHaveText('Ne voir que la mission en cours');
    await page.locator('#rbMissions input').first().uncheck();
    await expect(page.locator('#rbMisSub')).toHaveText(/^Mission 1 sur 6\./);
  });
  test('paire validée : bouton pour en choisir une autre ; la progression survit au rechargement', async ({ page }) => {
    await ouvrir(page, { onglet: 'vrai' });
    await paire(page);
    for (let i = 0; i < 2; i++) await page.locator('#rbMissions .rbok').click();
    await page.reload();
    await expect(page.locator('#rbMisSub')).toHaveText(/^Mission 3 sur 6\./);
    for (let i = 0; i < 4; i++) await page.locator('#rbMissions .rbok').click();
    await expect(page.locator('#rbDone')).toContainText('Paire validée');
    await expect(visibles(page)).toHaveCount(0);
    await expect(page.locator('#rbMisAll')).toHaveText('Revoir les missions');
    await page.locator('#rbAgain').click();
    await expect(page.locator('#rbPairPick')).toBeVisible();
  });
});
