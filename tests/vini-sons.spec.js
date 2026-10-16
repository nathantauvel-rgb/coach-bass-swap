// Lot 31 : Vini sur l'accueil (il parle selon la journée, on peut le faire sauter) et les sons du jeu (avec un bouton pour les couper).
const { test, expect } = require('@playwright/test');
const { ouvrir, sansBandeau, jouer } = require('./outils');

const S = o => JSON.stringify(o);
const jour = (n = 0) => { const d = new Date(); d.setDate(d.getDate() + n); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
const BASE = { 'coach-parcours': 'debut' };
const quetes = (cpt, ouverts = []) => S({ jour: jour(), ids: ['parties2', 'reussies2', 'trois3'], cpt, ouverts, xp: 0 });
// Remplace son() par un espion : la liste des sons demandés, dans l'ordre
const espion = page => page.evaluate(() => { window.__sons = []; son = (nom, ...a) => window.__sons.push(a.length ? nom + a[0] : nom); });
const sons = page => page.evaluate(() => window.__sons);

test.describe('Vini sur l\'accueil', () => {
  test('un coffre à ouvrir : il le dit et il danse ; une fois ouvert, il passe à autre chose', async ({ page }) => {
    const erreurs = await ouvrir(page, { onglet: 'accueil', stockage: Object.assign({ 'coach-quetes': quetes({ parties: 2 }) }, BASE) });
    await expect(page.locator('#homeVini svg')).toBeVisible();
    await expect(page.locator('#homeTip')).toHaveText('Un coffre t’attend dans tes quêtes !');
    await expect(page.locator('#homeVini')).toHaveClass(/vn-danse/);
    await page.locator('[data-q="parties2"] .qt-coffre').click();
    await expect(page.locator('#homeVini')).toHaveClass(/vn-parfait/);
    await expect(page.locator('#homeTip')).not.toHaveText(/coffre/, { timeout: 3000 });
    expect(erreurs).toEqual([]); await sansBandeau(page);
  });
  test('objectif atteint, série en cours, ou un simple bonjour', async ({ page }) => {
    await ouvrir(page, { onglet: 'accueil', stockage: Object.assign({ 'coach-objectif': S({ min: 5, jours: { [jour()]: 400 }, faits: [jour()] }) }, BASE) });
    await expect(page.locator('#homeTip')).toHaveText('Objectif du jour atteint, bravo ! Reviens demain pour ta série.');
    await page.evaluate(() => { goal.faits = [dayKey(new Date(Date.now() - 864e5)), dayKey(new Date(Date.now() - 1728e5))]; renderHome(); });
    await expect(page.locator('#homeTip')).toHaveText(/Ta série de 2 jours t’attend\s: quelques minutes suffisent\.$/);
    await expect(page.locator('#homeVini')).toHaveClass(/vn-calme/);
    await page.evaluate(() => { goal.faits = []; renderHome(); });
    await expect(page.locator('#homeTip')).toHaveText(/^((Bonjour|Salut|Bonsoir)\s!|Encore debout\s\?) Prêt/);
    await expect(page.locator('#homeTip')).toHaveText(/Prêt pour ta prochaine transition\s\?$/);
  });
  test('le toucher le fait sauter, puis il se calme', async ({ page }) => {
    await ouvrir(page, { onglet: 'accueil', stockage: BASE });
    await page.locator('#homeViniBtn').click();
    await expect(page.locator('#homeVini')).toHaveClass(/vn-parfait/);
    await expect(page.locator('#homeVini')).toHaveClass(/vn-calme/, { timeout: 3000 });
  });
  test('sans parcours choisi, il danse à côté de « Un geste à la fois »', async ({ page }) => {
    await ouvrir(page, { onglet: 'accueil', stockage: { 'coach-guide-vu': null } });
    await expect(page.locator('#homeTip')).toHaveText('Un geste à la fois, et ça vient vite !');
    await expect(page.locator('#homeVini')).toHaveClass(/vn-danse/);
  });
  test('un seul Vini sur l\'accueil', async ({ page }) => {
    await ouvrir(page, { onglet: 'accueil', stockage: BASE });
    await expect(page.locator('#vHome .vini')).toHaveCount(1);
  });
});

test.describe('Sons du jeu', () => {
  test('un son par message de partie, rien pendant une démo, pas de double carillon', async ({ page }) => {
    await ouvrir(page);
    await espion(page);
    await jouer(page);
    await page.evaluate(() => { pop('PARFAIT !', 'ok'); chime(true); pop('Presque', 'mid'); pop('Raté', 'bad'); });
    expect(await sons(page)).toEqual(['reussi', 'presque', 'rate']);
    await page.evaluate(() => { run.demo = true; pop('Légende de la démo', 'ok'); run.demo = false; });
    expect(await sons(page)).toEqual(['reussi', 'presque', 'rate']);
    await page.waitForTimeout(200);
    await page.evaluate(() => chime(true));
    expect((await sons(page)).slice(-1)).toEqual(['reussi']);
  });
  test('fin de partie : une note par étoile puis un accord ; partie ratée : deux notes qui descendent', async ({ page }) => {
    test.setTimeout(90000);
    await ouvrir(page);
    await espion(page);
    await jouer(page);
    await page.waitForFunction(() => beatNow() >= 31.7, null, { timeout: 60000, polling: 'raf' }); await page.keyboard.press('Space');
    await expect(page.locator('#result')).toBeVisible({ timeout: 60000 });
    await page.waitForTimeout(1000);
    expect((await sons(page)).slice(-4)).toEqual(['etoile0', 'etoile1', 'etoile2', 'fin']);
    await page.evaluate(() => { window.__sons = []; $('result').hidden = true; });
    await jouer(page);
    await expect(page.locator('#result')).toBeVisible({ timeout: 60000 });
    expect((await sons(page)).slice(-1)).toEqual(['finRatee']);
  });
  test('coffre, série, quiz et Premiers pas ont leur son', async ({ page }) => {
    await ouvrir(page, { onglet: 'accueil', stockage: Object.assign({ 'coach-quetes': quetes({ parties: 2 }) }, BASE) });
    await espion(page);
    await page.locator('[data-q="parties2"] .qt-coffre').click();
    await page.evaluate(() => openSerie());
    await page.evaluate(() => closeSerie());
    await page.evaluate(() => { openPremiers(); });
    await page.locator('#ppGo').click(); await page.locator('#ppOpts .pp-opt').first().click();
    expect(await sons(page)).toEqual(['coffre', 'serie', 'clic']);
  });
  test('le bouton coupe les sons, et le choix est gardé', async ({ page }) => {
    const erreurs = await ouvrir(page, { onglet: 'accueil', stockage: BASE });
    const b = page.locator('#sonsBtn');
    await expect(b).toHaveAttribute('aria-pressed', 'true');
    await expect(b).toHaveAttribute('aria-label', 'Sons du jeu : activés');
    // les vraies notes passent, sans erreur
    await page.evaluate(() => { window.__notes = 0; const n = sonNote; sonNote = (...a) => { window.__notes++; n(...a); }; for (const k of Object.keys(SONS)) son(k, 1); });
    expect(await page.evaluate(() => window.__notes)).toBeGreaterThan(15);
    await b.click();
    await expect(b).toHaveAttribute('aria-pressed', 'false');
    expect(await page.evaluate(() => localStorage.getItem('coach-sons'))).toBe('0');
    await page.evaluate(() => { window.__notes = 0; son('fin'); son('coffre'); });
    expect(await page.evaluate(() => window.__notes)).toBe(0);
    await page.reload();
    await expect(page.locator('#sonsBtn')).toHaveAttribute('aria-label', 'Sons du jeu : coupés');
    expect(erreurs).toEqual([]); await sansBandeau(page);
  });
});
