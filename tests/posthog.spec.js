// Lot 77 : PostHog reçoit les mêmes envois qu'Umami, relie les étapes d'un compte connecté à son identifiant,
// et se tait quand le joueur refuse les statistiques. PostHog n'est jamais appelé pour de vrai : un faux est posé AVANT le
// chargement de la page (comme le faux Umami de stats.spec.js), donc tout le reste du chemin est le vrai.
const { test, expect } = require('@playwright/test');
const { ouvrir, sansBandeau, jouer } = require('./outils');
const { FAUX, seConnecter, rouvrirCompte } = require('./faux-firebase');

const S = o => JSON.stringify(o);
const FAUX_UMAMI = `window.__stats = []; window.umami = { track(n, d){ window.__stats.push(d === undefined ? [n] : [n, d]); } };`;
const FAUX_PH = `window.__ph = []; window.posthog = {
  capture(n, d){ window.__ph.push(['capture', n, d]); }, identify(u){ window.__ph.push(['identify', u]); }, reset(){ window.__ph.push(['reset']); } };`;
const envoisPh = page => page.evaluate(() => window.__ph);
const capturesPh = async page => (await envoisPh(page)).filter(e => e[0] === 'capture').map(e => e[1]);
const nomsUmami = async page => (await page.evaluate(() => window.__stats)).map(e => e[0]);

test.describe('PostHog', () => {
  test('hors du vrai site, sans faux, PostHog n\'est ni chargé ni appelé', async ({ page }) => {
    const erreurs = await ouvrir(page, { stockage: { 'coach-journal': S({ jours: ['2020-01-01'] }) } });
    await jouer(page);
    expect(await page.evaluate(() => [!!document.querySelector('script[src*="posthog"]'), typeof window.posthog, localStorage.getItem('coach-stats')]))
      .toEqual([false, 'undefined', null]);
    expect(erreurs).toEqual([]); await sansBandeau(page);
  });

  test('chaque envoi d\'Umami part aussi chez PostHog, une seule fois, et pas de nouveau après un rechargement', async ({ page }) => {
    const erreurs = await ouvrir(page, { avant: FAUX_UMAMI + FAUX_PH, stockage: { 'coach-journal': S({ jours: ['2020-01-01'] }) } });
    await jouer(page); await page.locator('#startBtn').click();
    await jouer(page); await page.locator('#startBtn').click();
    expect(await nomsUmami(page)).toEqual(['revenu', 'premiere-partie']);
    expect(await capturesPh(page)).toEqual(['revenu', 'premiere-partie']);
    // les propriétés suivent : un envoi sans détail part avec un objet vide
    expect((await envoisPh(page))[0]).toEqual(['capture', 'revenu', {}]);
    await page.reload(); await expect(page.locator('.node').first()).toBeVisible();
    await jouer(page);
    expect(await envoisPh(page)).toEqual([]);
    expect(erreurs).toEqual([]); await sansBandeau(page);
  });

  test('PostHog seul (sans Umami) reçoit quand même les étapes', async ({ page }) => {
    const erreurs = await ouvrir(page, { avant: FAUX_PH, stockage: { 'coach-journal': S({ jours: ['2020-01-01'] }) } });
    await jouer(page);
    expect(await capturesPh(page)).toEqual(['revenu', 'premiere-partie']);
    expect(await page.evaluate(() => JSON.parse(localStorage.getItem('coach-stats')))).toEqual(['revenu', 'premiere-partie']);
    expect(erreurs).toEqual([]); await sansBandeau(page);
  });

  test('refuser les statistiques coupe aussi PostHog', async ({ page }) => {
    const erreurs = await ouvrir(page, { avant: FAUX_UMAMI + FAUX_PH, stockage: { 'umami.disabled': '1', 'coach-journal': S({ jours: ['2020-01-01'] }) } });
    await jouer(page);
    expect(await envoisPh(page)).toEqual([]);
    expect(await page.evaluate(() => window.__stats)).toEqual([]);
    expect(erreurs).toEqual([]); await sansBandeau(page);
  });

  test('un compte connecté relie ses étapes à son identifiant ; la déconnexion le délie', async ({ page }) => {
    const erreurs = await ouvrir(page, { avant: FAUX + FAUX_UMAMI + FAUX_PH });
    await seConnecter(page);
    await expect(page.locator('#cptBtn')).toHaveText('Nathan');
    const e = await envoisPh(page);
    const qui = e.findIndex(x => x[0] === 'identify'), compte = e.findIndex(x => x[0] === 'capture' && x[1] === 'compte');
    expect(e[qui]).toEqual(['identify', 'u1']);
    expect(compte).toBeGreaterThan(qui);   // « compte » part déjà relié au compte
    expect(e.filter(x => x[0] === 'identify')).toHaveLength(1);
    expect(e.some(x => x[0] === 'reset')).toBe(false);   // le « personne » de Firebase au chargement ne délie rien
    await rouvrirCompte(page);
    await page.locator('#cptOut').click();
    await expect(page.locator('#cptBtn')).toHaveText('Se connecter');
    await expect.poll(async () => (await envoisPh(page)).filter(x => x[0] === 'reset').length).toBe(1);
    // rien n'a jamais envoyé le prénom ni l'adresse
    expect(JSON.stringify(await envoisPh(page))).not.toMatch(/Nathan|exemple\.fr/);
    expect(erreurs).toEqual([]); await sansBandeau(page);
  });

  test('la page de confidentialité présente PostHog, et son bouton le coupe aussi', async ({ page }) => {
    await page.addInitScript(FAUX_PH);
    await page.goto('/confidentialite.html');
    await expect(page.locator('main, body').first()).toContainText('Umami et PostHog');
    await expect(page.locator('body')).toContainText('n\'enregistre pas ton écran');
    await expect(page.locator('#statsEtat')).toHaveText('Sur ce navigateur, tes visites sont comptées (sans cookie).');
    await page.locator('#statsBtn').click();
    await expect(page.locator('#statsEtat')).toHaveText('Sur ce navigateur, tes visites ne sont plus comptées.');
    await page.evaluate(() => stat('essai-depuis-confidentialite'));
    expect(await envoisPh(page)).toEqual([]);
  });
});
