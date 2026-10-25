// Lot 14 : chapitre 4 « Les combos ».
const { test, expect } = require('@playwright/test');
const { ouvrir, sansBandeau, jouer } = require('./outils');

const S = o => JSON.stringify(o);
const CH1_OK = S({ 0: 2, 1: 2, 2: 2, 3: 2, 4: 2, 5: 2, 6: 2 });
const chapitre4 = page => ouvrir(page, { stockage: { 'coach-lecons': CH1_OK, 'coach-chapitre': '4' } });
// Un « robot » qui fait exactement le geste idéal : les commandes suivent la démo, B est lancé et l'écho activé au bon temps
const robot = page => page.evaluate(() => { const l = LESSONS[li];
  const tick = () => { if (!run) return; const b = beatNow();
    for (const k of l.user) ctrl[k] = ideal(k, b); applyCtrl();
    if (!l.autoLaunch && run.launch === null && b >= l.launchBeat - .3) launchB();
    if (l.btn.includes('echo') && !echoOn && run.echoAt == null && b >= 62.9) toggleEcho();
    requestAnimationFrame(tick); };
  requestAnimationFrame(tick); });

test.describe('Ouverture du chapitre 4', () => {
  test('verrouillé au début, ouvert avec 14 étoiles au chapitre 1, comme le chapitre 2', async ({ page }) => {
    await ouvrir(page);
    await page.locator('#chapBtn').click();
    await expect(page.locator('.chap')).toHaveCount(7);
    await expect(page.locator('.chap').nth(3)).toBeDisabled();
    await expect(page.locator('.chap').nth(3)).toContainText('Verrouillé : 0/14 ★ au chapitre 1');
  });
  test('ouvert : 4 niveaux, au demi-temps près', async ({ page }) => {
    const erreurs = await chapitre4(page);
    await expect(page.locator('#chapBtn')).toHaveText('Chapitre 4 · Les combos');
    await expect(page.locator('.node')).toHaveCount(4);
    await expect(page.locator('.node .t')).toHaveText(['Filtre et swap', 'La transition éclair', 'Écho et drop, sans filet', 'Le grand mix']);
    expect(await page.evaluate(() => TOL)).toBe(.5);
    await expect(page.locator('#starTot')).toHaveText('14/150');
    expect(erreurs).toEqual([]); await sansBandeau(page);
  });
  test('un chapitre 4 mémorisé mais verrouillé ramène au chapitre 1', async ({ page }) => {
    await ouvrir(page, { stockage: { 'coach-chapitre': '4' } });
    await expect(page.locator('#chapBtn')).toHaveText('Chapitre 1 · Les bases');
  });
});

test.describe('Chaque combo joué parfaitement donne 3 étoiles', () => {
  for (const [i, nom] of [[0, 'Filtre et swap'], [1, 'La transition éclair'], [2, 'Écho et drop, sans filet'], [3, 'Le grand mix']]) {
    test(nom, async ({ page }) => {
      test.setTimeout(120000);
      const erreurs = await chapitre4(page);
      await page.locator('.node').nth(i).click();
      await jouer(page);
      await robot(page);
      await expect(page.locator('#result')).toBeVisible({ timeout: 90000 });
      const conseils = await page.locator('#rDetails li').allTextContents();
      expect(await page.locator('#rDetails li.ok').count(), conseils.join(' / ')).toBe(conseils.length);
      await expect(page.locator('#rStars span.on')).toHaveCount(3);
      expect(JSON.parse(await page.evaluate(() => localStorage.getItem('coach-ch4')))).toEqual({ [i]: 3 });
      expect(erreurs).toEqual([]); await sansBandeau(page);
    });
  }
});

test.describe('Sans rien faire', () => {
  test('« Écho et drop » : pas de compte à rebours, et une seule étoile', async ({ page }) => {
    test.setTimeout(90000);
    await chapitre4(page);
    await page.locator('.node').nth(2).click();
    await jouer(page);
    await expect(page.locator('#cdNum')).toHaveText('?', { timeout: 15000 });
    await expect(page.locator('#result')).toBeVisible({ timeout: 60000 });
    await expect(page.locator('#rStars span.on')).toHaveCount(1);
  });
  test('la démo de chaque combo se joue sans erreur', async ({ page }) => {
    test.setTimeout(240000);
    const erreurs = await chapitre4(page);
    for (let i = 0; i < 4; i++) {
      await page.locator('.node').nth(i).click();
      await jouer(page, '#watchBtn');
      await expect(page.locator('#startBtn')).toHaveText('Jouer', { timeout: 90000 });
    }
    expect(erreurs).toEqual([]); await sansBandeau(page);
  });
});

test.describe('Étoiles abîmées', () => {
  for (const [nom, valeur] of [['note trop grande', '{"0":4}'], ['note négative', '{"0":-1}'], ['texte', '{"0":"x","9":3,"12":2}']]) {
    test(`${nom} : la carte des niveaux s'affiche quand même`, async ({ page }) => {
      const erreurs = await ouvrir(page, { stockage: { 'coach-lecons': S({ 0: 2, 1: 2, 2: 2, 3: 2, 4: 2, 5: 2, 6: 2 }), 'coach-chapitre': '4', 'coach-ch4': valeur, 'coach-ch3': valeur, 'coach-ch2': valeur } });
      await expect(page.locator('.node')).toHaveCount(4);
      expect(erreurs).toEqual([]); await sansBandeau(page);
    });
  }
});
