// Lot 18 : clair pour quelqu'un qui n'a jamais touché une platine (position de départ, gestes, fiches « Découvre ce bouton »).
const { test, expect } = require('@playwright/test');
const { ouvrir, envoyer, miseEnPlace, sansBandeau } = require('./outils');

const S = o => JSON.stringify(o);
const NEUF = { 'coach-fiches': null, 'coach-parcours': 'debut' };
const vues = page => page.evaluate(() => JSON.parse(localStorage.getItem('coach-fiches') || '[]'));

test.describe('Le guide ne parle plus que de la musique', () => {
  test('4 étapes, sans bouton de la table', async ({ page }) => {
    await ouvrir(page);
    expect(await page.evaluate(() => ONB.map(s => s.title))).toEqual(['Bienvenue sur DJingo', 'Compter en phrases', 'Les parties d\'un morceau', 'Tu es prêt']);
    expect(await page.evaluate(() => ONB.some(s => s.k))).toBe(false);
  });
});

test.describe('Fiches « Découvre ce bouton »', () => {
  test('la première fois : la fiche de PLAY, on l\'essaie, puis la partie démarre', async ({ page }) => {
    const erreurs = await ouvrir(page, { stockage: NEUF });
    await page.locator('.node').nth(0).click();
    await page.locator('#startBtn').click();
    await expect(page.locator('#onb')).toBeVisible();
    await expect(page.locator('#onbTitle')).toHaveText('Le bouton PLAY');
    await expect(page.locator('#onbSkip')).toHaveText('Je connais, passer');
    await expect(page.locator('#sv-playB circle')).toHaveClass(/hl/);
    await page.locator('#onbTry .onb-play').click();
    await expect(page.locator('#onbTry .ok')).toHaveText('Bien joué !');
    await page.locator('#onbNext').click();
    await expect(page.locator('#onb')).toBeHidden();
    await expect(page.locator('#startBtn')).toHaveText('Arrêter', { timeout: 60000 });
    expect(await vues(page)).toEqual(['play']);
    expect(await page.evaluate(() => localStorage.getItem('coach-guide-vu'))).toBe('1');
    expect(erreurs).toEqual([]); await sansBandeau(page);
  });
  test('une fois vue, la fiche ne revient plus', async ({ page }) => {
    await ouvrir(page, { stockage: Object.assign({}, NEUF, { 'coach-fiches': S(['play']) }) });
    await page.locator('.node').nth(0).click();
    await page.locator('#startBtn').click();
    await expect(page.locator('#startBtn')).toHaveText('Arrêter', { timeout: 60000 });
    await expect(page.locator('#onb')).toBeHidden();
  });
  test('un niveau qui demande trois commandes nouvelles : trois fiches à la suite', async ({ page }) => {
    await ouvrir(page, { stockage: NEUF });
    await page.locator('.node').nth(6).click();
    await page.locator('#watchBtn').click();
    await expect(page.locator('#onbDots i')).toHaveCount(3);
    await expect(page.locator('#onbTitle')).toHaveText('Le bouton PLAY');
    await page.locator('#onbNext').click();
    await expect(page.locator('#onbTitle')).toHaveText('Les faders de volume');
    await page.locator('#onbNext').click();
    await expect(page.locator('#onbTitle')).toHaveText('Le potard LOW : les basses');
    await expect(page.locator('#onbNext')).toHaveText('Compris, on joue');
    await page.locator('#onbNext').click();
    await expect(page.locator('#demoTag')).toBeVisible({ timeout: 60000 });
    expect((await vues(page)).sort()).toEqual(['fader', 'low', 'play']);
  });
  test('« Je connais, passer » lance quand même la partie ; Échap n\'en lance pas', async ({ page }) => {
    await ouvrir(page, { stockage: NEUF });
    await page.locator('.node').nth(1).click();
    await page.locator('#startBtn').click();
    await page.keyboard.press('Escape');
    await expect(page.locator('#onb')).toBeHidden();
    await expect(page.locator('#startBtn')).toHaveText('Jouer');
    await page.locator('.node').nth(5).click();
    await page.locator('#startBtn').click();
    await page.locator('#onbSkip').click();
    await expect(page.locator('#startBtn')).toHaveText('Arrêter', { timeout: 60000 });
  });
  test('parcours « Je sais déjà » : jamais de fiche imposée', async ({ page }) => {
    await ouvrir(page, { stockage: Object.assign({}, NEUF, { 'coach-parcours': 'deja' }) });
    await page.locator('.node').nth(6).click();
    await page.locator('#startBtn').click();
    await expect(page.locator('#startBtn')).toHaveText('Arrêter', { timeout: 60000 });
    await expect(page.locator('#onb')).toBeHidden();
  });
  test('« Revoir la fiche » dans « Comment faire ? », sans lancer de partie', async ({ page }) => {
    await ouvrir(page);
    await page.locator('.node').nth(3).click();
    await page.locator('.howto summary').click();
    await expect(page.locator('#lfiches button')).toHaveText(['Revoir la fiche : les faders', 'Revoir la fiche : l\'écho']);
    await page.locator('#lfiches button', { hasText: 'écho' }).click();
    await expect(page.locator('#onbTitle')).toHaveText('L\'écho');
    await page.locator('#onbTry .onb-play').click();
    expect(await page.evaluate(() => echoOn)).toBe(true);
    await page.locator('#onbNext').click();
    await expect(page.locator('#onb')).toBeHidden();
    await expect(page.locator('#startBtn')).toHaveText('Jouer');
    expect(await page.evaluate(() => echoOn)).toBe(false);
  });
  test('ON de l\'effet sur la table compte dans la fiche de l\'écho', async ({ page }) => {
    await ouvrir(page, { midi: { branchee: true }, stockage: { 'coach-midi-map': S({ fxOn: { ch: 4, n: 71 } }) } });
    await page.locator('.node').nth(3).click();
    await page.evaluate(() => openOnb([FICHES.echo], { fiche: true, keys: ['echo'] }));
    await envoyer(page, 0x94, 71, 127);
    await expect(page.locator('#onbTry .ok')).toHaveText('Bien joué !');
  });
});

test.describe('Avant de jouer : position de départ et gestes, bien séparés', () => {
  test('le swap : « Pendant le niveau » écrit le geste départ → arrivée, et la bulle ne le donne pas', async ({ page }) => {
    await ouvrir(page);
    await page.locator('.node').nth(5).click();
    await expect(page.locator('#planList li')).toHaveText(['Échange les basses : LOW de A normal → coupé, LOW de B coupé → normal']);
    await expect(page.locator('#tip')).not.toContainText('basses');
  });
  test('la transition complète : couper le LOW de B avant de lancer, puis les gestes dans l\'ordre', async ({ page }) => {
    await ouvrir(page);
    await page.locator('.node').nth(6).click();
    await expect(page.locator('#planList li')).toHaveText(['Avant de lancer B : LOW de B normal → coupé', 'Lance B (PLAY de droite)', 'Monte le fader de B jusqu\'en haut',
      'Échange les basses : LOW de A normal → coupé, LOW de B coupé → normal', 'Baisse le fader de A jusqu\'en bas']);
  });
  test('l\'encadré disparaît pendant la partie et revient après', async ({ page }) => {
    await ouvrir(page);
    await page.locator('.node').nth(0).click();
    await expect(page.locator('#plan')).toBeVisible();
    await page.locator('#startBtn').click();
    await expect(page.locator('#startBtn')).toHaveText('Arrêter', { timeout: 60000 });
    await expect(page.locator('#plan')).toBeHidden();
    await page.locator('#startBtn').click();
    await expect(page.locator('#plan')).toBeVisible();
  });
  test('avec la table : « Position de départ », un dessin et les mots « coupé » / « normal »', async ({ page }) => {
    await ouvrir(page, { midi: { branchee: true } });
    await page.locator('.node').nth(5).click();
    await expect(page.locator('#setup h3')).toHaveText('Position de départ');
    const etat = await miseEnPlace(page);
    expect(etat[0]).toContain('Potard LOW de A : normal (à midi)');
    expect(etat[1]).toContain('Potard LOW de B : coupé (tout à gauche)');
    await expect(page.locator('#setupList .pic svg')).toHaveCount(2);
    await expect(page.locator('#tip')).toHaveText('Place ta table en position de départ, puis appuie sur Jouer.');
  });
});

test.describe('Après une fiche, table pas en place', () => {
  test('« Compris, on joue » montre la position de départ et dit quoi faire', async ({ page }) => {
    await ouvrir(page, { midi: { branchee: true }, stockage: { 'coach-fiches': null, 'coach-parcours': 'debut' } });
    await page.locator('.node').nth(5).click();
    await envoyer(page, 0xB0, 15, 64); await envoyer(page, 0xB1, 15, 0);
    await page.locator('#startBtn').click();
    await expect(page.locator('#onbTitle')).toHaveText('Le potard LOW : les basses');
    await envoyer(page, 0xB0, 15, 0);
    await page.locator('#onbNext').click();
    await expect(page.locator('#onb')).toBeHidden();
    await expect(page.locator('#startBtn')).toHaveText('Mets ta table en place');
    await expect(page.locator('#tip')).toHaveText('Remets ta table en position de départ : « Jouer » se débloquera tout seul.');
    await expect(page.locator('#setup')).toBeInViewport();
  });
});
