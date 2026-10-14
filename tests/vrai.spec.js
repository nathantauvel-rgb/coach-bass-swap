// Passer au vrai : une paire proposée en grand, puis ses missions une par une (lots 12 et 17).
const { test, expect } = require('@playwright/test');
const { ouvrir, sansBandeau } = require('./outils');

const visibles = page => page.locator('#rbMissions li:visible');
async function paire(page) {
  await page.locator('#rbDemo').click();
  await page.locator('#rbGo').click();
}

test.describe('Avant l\'import', () => {
  test('trois étapes, un gros bouton, et l\'exemple en petit', async ({ page }) => {
    const erreurs = await ouvrir(page, { onglet: 'vrai' });
    await expect(page.locator('#rbEmpty h1')).toHaveText('Mixe ta propre musique');
    await expect(page.locator('.rbsteps li')).toHaveCount(3);
    await expect(page.locator('#rbPick')).toBeVisible();
    await expect(page.locator('#rbDemo')).toHaveText('Essayer avec des morceaux d\'exemple');
    expect(erreurs).toEqual([]); await sansBandeau(page);
  });
});

test.describe('La paire du jour', () => {
  test('une seule paire en grand : deux platines, trois pastilles, deux boutons', async ({ page }) => {
    const erreurs = await ouvrir(page, { onglet: 'vrai' });
    await page.locator('#rbDemo').click();
    await expect(page.locator('#rbKick')).toHaveText('Ta paire du jour');
    await expect(page.locator('#rbAT')).not.toBeEmpty();
    await expect(page.locator('#rbBT')).not.toBeEmpty();
    await expect(page.locator('#rbAM')).toHaveText(/^\d+ BPM · \d+[AB]$/);
    await expect(page.locator('.rbchip b')).toHaveText([/Tempo$/, /Tonalité$/, /Style$/]);
    await expect(page.locator('#rbGo')).toBeVisible();
    await expect(page.locator('#rbNext')).toBeVisible();
    await expect(page.locator('#rbPairPick')).toBeHidden();
    await expect(page.locator('#rbMisBox')).toBeHidden();
    expect(erreurs).toEqual([]); await sansBandeau(page);
  });
  test('« Une autre paire » en propose une différente', async ({ page }) => {
    await ouvrir(page, { onglet: 'vrai' });
    await page.locator('#rbDemo').click();
    const avant = await page.locator('#rbAT').textContent() + await page.locator('#rbBT').textContent();
    await page.locator('#rbNext').click();
    expect(await page.locator('#rbAT').textContent() + await page.locator('#rbBT').textContent()).not.toBe(avant);
  });
  test('« C\'est parti » : la carte devient « Ta paire » et les missions s\'ouvrent', async ({ page }) => {
    await ouvrir(page, { onglet: 'vrai' });
    await paire(page);
    await expect(page.locator('#rbKick')).toHaveText('Ta paire');
    await expect(page.locator('#rbGo')).toBeHidden();
    await expect(page.locator('#rbPairChange')).toBeVisible();
    await expect(page.locator('#rbMisBox')).toBeVisible();
  });
  test('« Choisir une paire moi-même » ouvre la liste, et on peut revenir', async ({ page }) => {
    await ouvrir(page, { onglet: 'vrai' });
    await page.locator('#rbDemo').click();
    await page.locator('#rbOwn').click();
    await expect(page.locator('#rbPairPick')).toBeVisible();
    await expect(page.locator('#rbPairs .duo')).toHaveCount(3);
    await expect(page.locator('#rbHero')).toBeHidden();
    await page.locator('#rbBack').click();
    await expect(page.locator('#rbHero')).toBeVisible();
    await page.locator('#rbOwn').click();
    await page.locator('#rbPairs .duo').nth(1).click();
    await expect(page.locator('#rbKick')).toHaveText('Ta paire');
    await expect(page.locator('#rbMisBox')).toBeVisible();
    await page.locator('#rbPairChange').click();
    await expect(page.locator('#rbPairPick')).toBeVisible();
    await expect(page.locator('#rbMisBox')).toBeHidden();
  });
  test('des titres piégés restent du texte', async ({ page }) => {
    await ouvrir(page, { onglet: 'vrai', stockage: { 'coach-collection': JSON.stringify({ n: 'x', t: [['<img src=x onerror=alert(1)>', 'A', 'House', 124, '8A'], ['Deux', 'B', 'House', 124, '8A']] }) } });
    await expect(page.locator('#rbAT, #rbBT')).toContainText(['<img src=x onerror=alert(1)>']);
    expect(await page.locator('#rbHero img').count()).toBe(0);
  });
});

test.describe('Les missions', () => {
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
  });
  test('« Voir toutes les missions » montre les 6, et on peut décocher', async ({ page }) => {
    await ouvrir(page, { onglet: 'vrai' });
    await paire(page);
    await page.locator('#rbMissions .rbok').click();
    await page.locator('#rbMisAll').click();
    await expect(visibles(page)).toHaveCount(6);
    await page.locator('#rbMissions input').first().uncheck();
    await expect(page.locator('#rbMisSub')).toHaveText(/^Mission 1 sur 6\./);
  });
  test('paire validée : « Une autre paire » en propose une nouvelle ; la progression survit au rechargement', async ({ page }) => {
    await ouvrir(page, { onglet: 'vrai' });
    await paire(page);
    for (let i = 0; i < 2; i++) await page.locator('#rbMissions .rbok').click();
    await page.reload();
    await expect(page.locator('#rbMisSub')).toHaveText(/^Mission 3 sur 6\./);
    const avant = await page.locator('#rbAT').textContent() + await page.locator('#rbBT').textContent();
    for (let i = 0; i < 4; i++) await page.locator('#rbMissions .rbok').click();
    await expect(page.locator('#rbDone')).toContainText('Paire validée');
    await page.locator('#rbAgain').click();
    await expect(page.locator('#rbKick')).toHaveText('Ta paire du jour');
    await expect(page.locator('#rbMisBox')).toBeHidden();
    expect(await page.locator('#rbAT').textContent() + await page.locator('#rbBT').textContent()).not.toBe(avant);
  });
});
