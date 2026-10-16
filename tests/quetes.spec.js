// Lot 30 : quêtes du jour. Trois quêtes par jour sur l'accueil, des compteurs qui repartent à zéro chaque jour, un coffre d'XP.
const { test, expect } = require('@playwright/test');
const { ouvrir, sansBandeau, jouer } = require('./outils');

const S = o => JSON.stringify(o);
const jour = (n = 0) => { const d = new Date(); d.setDate(d.getDate() + n); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
const BASE = { 'coach-parcours': 'debut' };
const quetes = (ids, cpt = {}, ouverts = [], xp = 0, j = jour()) => S({ jour: j, ids, cpt, ouverts, xp });
const stocke = (page, k) => page.evaluate(c => JSON.parse(localStorage.getItem(c)), k);
const ligne = (page, id) => page.locator(`#qtList [data-q="${id}"]`);

test.describe('Quêtes du jour sur l\'accueil', () => {
  test('trois quêtes, tirées une fois pour la journée, avec Vini', async ({ page }) => {
    const erreurs = await ouvrir(page, { onglet: 'accueil', stockage: Object.assign({ 'coach-lecons': S({ 0: 3, 1: 2 }) }, BASE) });
    await expect(page.locator('#homeQuetes')).toBeVisible();
    await expect(page.locator('#qtList .qt')).toHaveCount(3);
    await expect(page.locator('#qtVini svg')).toBeVisible();
    await expect(page.locator('#qtSub')).toHaveText(/^0 sur 3 · nouvelles quêtes dans \d+ h$/);
    const q = await stocke(page, 'coach-quetes');
    expect(q.jour).toBe(jour()); expect(q.ids).toHaveLength(3);
    // une quête de chaque difficulté, pas deux fois le même compteur
    expect(await page.evaluate(ids => ids.map(id => qtDef(id).niv), q.ids)).toEqual([0, 1, 2]);
    expect(new Set(await page.evaluate(ids => ids.map(id => qtDef(id).cpt), q.ids)).size).toBe(3);
    await page.reload();
    expect((await stocke(page, 'coach-quetes')).ids).toEqual(q.ids);
    expect(erreurs).toEqual([]); await sansBandeau(page);
  });
  test('un débutant n\'a que des quêtes qu\'il peut faire', async ({ page }) => {
    await ouvrir(page, { onglet: 'accueil', stockage: BASE });
    const ids = (await stocke(page, 'coach-quetes')).ids;
    for (const id of ids) expect(['quiz3', 'defi', 'oreille', 'expert2', 'combo']).not.toContain(id);
  });
  test('pas de quêtes tant qu\'aucun parcours n\'est choisi', async ({ page }) => {
    await ouvrir(page, { onglet: 'accueil', stockage: { 'coach-guide-vu': null } });
    await expect(page.locator('#homeChoice')).toBeVisible();
    await expect(page.locator('#homeQuetes')).toBeHidden();
  });
});

test.describe('Avancer et ouvrir les coffres', () => {
  test('une partie fait avancer les quêtes ; la carte de fin le dit ; le coffre donne ses XP une seule fois', async ({ page }) => {
    test.setTimeout(90000);
    const erreurs = await ouvrir(page, { stockage: Object.assign({ 'coach-quetes': quetes(['parties2', 'reussies2', 'trois3']) }, BASE) });
    await jouer(page);
    await page.waitForFunction(() => beatNow() >= 31.7, null, { timeout: 60000, polling: 'raf' }); await page.keyboard.press('Space');
    await expect(page.locator('#result')).toBeVisible({ timeout: 60000 });
    await expect(page.locator('#rQuete')).toBeHidden();
    expect((await stocke(page, 'coach-quetes')).cpt).toMatchObject({ parties: 1, reussies: 1, trois: 1 });
    // deuxième partie : « Joue 2 niveaux » et « Réussis 2 transitions » sont finies
    await page.locator('#retry').click();
    await expect(page.locator('#startBtn')).toHaveText('Arrêter', { timeout: 60000 });
    await page.waitForFunction(() => beatNow() >= 31.7, null, { timeout: 60000, polling: 'raf' }); await page.keyboard.press('Space');
    await expect(page.locator('#result')).toBeVisible({ timeout: 60000 });
    await expect(page.locator('#rQuete')).toHaveText('Quête terminée : Joue 2 niveaux, Réussis 2 transitions ! Ton coffre t’attend sur l’accueil.');
    // sur l'accueil
    await page.evaluate(() => { location.hash = '#accueil'; });
    await expect(page.locator('#qtSub')).toHaveText(/^2 sur 3/);
    await expect(ligne(page, 'trois3').locator('.qt-n')).toHaveText('2 / 3');
    await expect(ligne(page, 'trois3').locator('.qt-coffre')).toBeDisabled();
    const coffre = ligne(page, 'reussies2').locator('.qt-coffre');
    await expect(coffre).toBeEnabled();
    await expect(coffre).toHaveAttribute('aria-label', 'Ouvrir le coffre : +15 XP');
    const xp = await page.evaluate(() => xpTotal());
    await coffre.click();
    expect(await page.evaluate(() => xpTotal())).toBe(xp + 15);
    await expect(page.locator('#xpTxt')).toHaveText(`${xp + 15} XP`);
    await expect(ligne(page, 'reussies2').locator('.qt-gain')).toHaveText('+15 XP');
    await expect(ligne(page, 'reussies2').locator('.qt-coffre')).toBeDisabled();
    await page.evaluate(() => questOuvrir('reussies2'));
    expect(await page.evaluate(() => xpTotal())).toBe(xp + 15);
    const q = await stocke(page, 'coach-quetes');
    expect(q.ouverts).toEqual(['reussies2']); expect(q.xp).toBe(15);
    expect(erreurs).toEqual([]); await sansBandeau(page);
  });
  test('une démo, le quiz et le défi du jour comptent aussi', async ({ page }) => {
    await ouvrir(page, { onglet: 'accueil', stockage: Object.assign({ 'coach-lecons': S({ 0: 2 }), 'coach-quetes': quetes(['demo', 'defi', 'quiz3']),
      'coach-entrainement': S({ defiDate: jour(), defiStars: 2 }) }, BASE) });
    await expect(ligne(page, 'defi').locator('.qt-n')).toHaveText('1 / 1');
    await page.evaluate(() => { questNote({ demo: true }); questQuiz(); questQuiz(); renderQuetes(); });
    await expect(ligne(page, 'demo').locator('.qt-n')).toHaveText('1 / 1');
    await expect(ligne(page, 'quiz3').locator('.qt-n')).toHaveText('2 / 3');
    await expect(page.locator('#qtSub')).toHaveText(/^2 sur 3/);
  });
});

test.describe('Un nouveau jour', () => {
  test('nouvelles quêtes, compteurs à zéro, les XP des coffres restent', async ({ page }) => {
    await ouvrir(page, { onglet: 'accueil', stockage: Object.assign({ 'coach-lecons': S({ 0: 3 }), 'coach-quetes': quetes(['parties2', 'reussies2', 'trois3'], { parties: 2, reussies: 2 }, ['parties2', 'reussies2'], 25, jour(-1)) }, BASE) });
    const q = await stocke(page, 'coach-quetes');
    expect(q.jour).toBe(jour()); expect(q.ouverts).toEqual([]); expect(q.xp).toBe(25);
    expect(Object.values(q.cpt).every(v => v === 0)).toBe(true);
    expect(await page.evaluate(() => xpTotal())).toBe(30 + 25);
  });
  for (const v of ['{oops', '[1]', S({ jour: 5, ids: ['zzz', 'demo', 'demo'], cpt: { parties: -4, quiz: 'x' }, ouverts: 'x', xp: -3 })]) {
    test(`« coach-quetes » abîmé (${v.slice(0, 20)}) : trois quêtes quand même, sans erreur`, async ({ page }) => {
      const erreurs = await ouvrir(page, { onglet: 'accueil', stockage: Object.assign({ 'coach-quetes': v }, BASE) });
      await expect(page.locator('#qtList .qt')).toHaveCount(3);
      const q = await stocke(page, 'coach-quetes');
      expect(q.xp).toBe(0); expect(Object.values(q.cpt).every(n => Number.isInteger(n) && n >= 0)).toBe(true);
      expect(erreurs).toEqual([]); await sansBandeau(page);
    });
  }
});
