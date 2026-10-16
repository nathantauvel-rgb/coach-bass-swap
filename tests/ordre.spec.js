// Lot 26 : nouvel ordre du chapitre 1 (chaque niveau ajoute une chose, la transition complète en dernier),
// et la progression enregistrée avec l'ancien ordre suit son niveau à sa nouvelle place.
const { test, expect } = require('@playwright/test');
const { ouvrir, sansBandeau } = require('./outils');

const S = o => JSON.stringify(o);
const ORDRE = ['Le bon moment', 'Le fader', 'La coupure sèche', 'L\'écho out', 'Le filtre', 'Le swap des basses', 'La transition complète'];
const stocke = (page, k) => page.evaluate(c => JSON.parse(localStorage.getItem(c)), k);

test.describe('Le nouvel ordre', () => {
  test('du plus simple au final, aux chapitres 1 et 2', async ({ page }) => {
    const erreurs = await ouvrir(page);
    await expect(page.locator('.node .t')).toHaveText(ORDRE);
    await expect(page.locator('.node').nth(6)).toHaveAttribute('aria-label', /^Niveau 7 : La transition complète/);
    await page.locator('.node').nth(6).click();
    await expect(page.locator('#lgoal')).toHaveText('Le final : tout toi-même, comme en soirée.');
    expect(await page.evaluate(() => BASE_LESSONS.map(l => l.kind))).toEqual(['moment', 'fader', 'cut', 'echo', 'filter', 'swap', 'full']);
    // chaque niveau garde ses repères et ses légendes de démo
    expect(await page.evaluate(() => BASE_LESSONS.map(l => l.targets.map(t => t[1]).join(' + ')))).toEqual(
      ['LANCE B', 'MONTE B + B À FOND + A SORTI', 'LANCE B + COUPE A', 'ECHO + COUPE A', 'FILTRE + À FOND', 'SWAP', 'LANCE B + B À FOND + SWAP + A SORTI']);
    expect(await page.evaluate(() => BASE_LESSONS[2].caps[1][1])).toBe('A coupé et B lancé, au même instant');
    expect(erreurs).toEqual([]); await sansBandeau(page);
  });
  test('les questions bonus, les badges et le test de placement suivent leur niveau', async ({ page }) => {
    await ouvrir(page, { stockage: { 'coach-lecons': S({ 5: 3, 6: 2 }) } });
    await page.locator('.node').nth(2).click();
    expect(await page.evaluate(() => quizBonus()[0])).toMatch(/^b6/);   // une question sur la coupure sèche
    await page.locator('.node').nth(5).click();
    expect(await page.evaluate(() => quizBonus()[0])).toMatch(/^b2/);   // une question sur le swap
    expect(await page.evaluate(() => BADGES.filter(b => b[5]()).map(b => b[0]))).toEqual(['pas', 'swap', 'soiree']);
    expect(await page.evaluate(() => P_STEPS.map(i => BASE_LESSONS[i].title))).toEqual(['Le bon moment', 'Le swap des basses', 'La transition complète']);
  });
});

test.describe('La progression d\'avant suit son niveau', () => {
  const AVANT = {
    'coach-ordre': null,
    // ancien ordre : 2 = swap, 3 = transition complète, 5 = écho, 6 = coupure
    'coach-lecons': S({ 0: 3, 2: 3, 3: 2, 5: 1, 6: 3 }),
    'coach-lecons-oreille': S({ 2: 1 }),
    'coach-ch2': S({ 3: 2, 6: 1 }),
    'coach-expert': S({ on: false, best: { 2: 80, 6: 55 } }),
    'coach-test': 'ko:3',
    'coach-journal': S({ parties: [{ c: 1, n: 2, e: 3, k: '', d: '2026-10-15' }, { c: 3, n: 2, e: 2, k: '', d: '2026-10-15' }], clair: { '1-6': 'oui', '3-2': 'bof' } })
  };
  test('étoiles, records, test de placement et journal changent de place, une seule fois', async ({ page }) => {
    const erreurs = await ouvrir(page, { stockage: AVANT });
    expect(await stocke(page, 'coach-lecons')).toEqual({ 0: 3, 5: 3, 6: 2, 3: 1, 2: 3 });
    expect(await stocke(page, 'coach-lecons-oreille')).toEqual({ 5: 1 });
    expect(await stocke(page, 'coach-ch2')).toEqual({ 6: 2, 2: 1 });
    expect(await stocke(page, 'coach-expert')).toEqual({ on: false, best: { 5: 80, 2: 55 } });
    expect(await page.evaluate(() => localStorage.getItem('coach-test'))).toBe('ko:6');
    const jr = await stocke(page, 'coach-journal');
    expect(jr.parties.map(p => [p.c, p.n])).toEqual([[1, 5], [3, 2]]);   // le chapitre 3 ne bouge pas
    expect(jr.clair).toEqual({ '1-2': 'oui', '3-2': 'bof' });
    expect(await page.evaluate(() => localStorage.getItem('coach-ordre'))).toBe('2');
    // à l'écran : le swap (3 étoiles) et la coupure (3 étoiles) sont bien à leur nouvelle place
    await expect(page.locator('.node').nth(5)).toHaveAttribute('aria-label', 'Niveau 6 : Le swap des basses, 3 étoile(s) sur 3');
    await expect(page.locator('.node').nth(2)).toHaveAttribute('aria-label', 'Niveau 3 : La coupure sèche, 3 étoile(s) sur 3');
    // un second chargement ne déplace plus rien
    await page.reload();
    expect(await stocke(page, 'coach-lecons')).toEqual({ 0: 3, 5: 3, 6: 2, 3: 1, 2: 3 });
    expect(erreurs).toEqual([]); await sansBandeau(page);
  });
  test('des données abîmées ne bloquent pas la page', async ({ page }) => {
    const erreurs = await ouvrir(page, { stockage: { 'coach-ordre': null, 'coach-lecons': '{oops', 'coach-expert': '[1]', 'coach-journal': '"x"', 'coach-test': 'ko:9' } });
    await expect(page.locator('.node')).toHaveCount(7);
    expect(await page.evaluate(() => localStorage.getItem('coach-ordre'))).toBe('2');
    expect(erreurs).toEqual([]); await sansBandeau(page);
  });
  test('un nouveau venu : rien à déplacer', async ({ page }) => {
    await ouvrir(page, { stockage: { 'coach-ordre': null } });
    expect(await page.evaluate(() => Object.keys(localStorage).filter(k => k.startsWith('coach-')).sort())).toEqual(['coach-accueil', 'coach-fiches', 'coach-guide-vu', 'coach-journal', 'coach-ordre', 'coach-style']);
  });
});
