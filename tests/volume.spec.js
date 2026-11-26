// Lot 60 : le volume de tout le site (partie « Son » du menu de l'en-tête depuis le lot 90, « Mon compte », lecteur des tutos)
// et « Mon compte » refait (sections : progression, abonnement, réglages).
const { test, expect } = require('@playwright/test');
const { ouvrir, sansBandeau, ouvrirMenu } = require('./outils');
const { FAUX, dejaConnecte, ouvrirCompte } = require('./faux-firebase');

// le volume affiché dans le menu de l'en-tête (avant le lot 90, l'étiquette du haut-parleur : « Son : 50 % »)
const affiche = page => page.locator('#volPanneau .volpct-txt');
const gains = page => page.evaluate(() => new Promise(r => { ensureAudio(); setTimeout(() => r({ master: +master.gain.value.toFixed(4), casque: +pflBus.gain.value.toFixed(4) }), 300); }));

test.describe('Le volume du site', () => {
  test('au départ : 50 %, soit 4 fois moins fort qu’avant ; le casque de la table suit aussi', async ({ page }) => {
    const erreurs = await ouvrir(page, { onglet: 'accueil' });
    await expect(affiche(page)).toHaveText('50 %');
    await expect(page.locator('#volCurseur')).toHaveValue('50');
    expect(await gains(page)).toEqual({ master: .1875, casque: .25 });
    // chaque voie envoie son CUE casque au bus du volume, pas directement au casque
    expect(await page.evaluate(() => !!pflBus && deck.A.pfl.numberOfOutputs === 1)).toBe(true);
    expect(erreurs).toEqual([]); await sansBandeau(page);
  });

  // lot 90 : le son est la première partie du menu de l'en-tête (« ⋯ » quand on n'est pas connecté)
  test('le son est dans le menu de l’en-tête, qui se ferme avec Échap ou un clic ailleurs', async ({ page }) => {
    await ouvrir(page, { onglet: 'accueil' });
    const b = page.locator('#menuBtn'), pan = page.locator('#menuPanneau');
    await expect(pan).toBeHidden();
    await b.click();
    await expect(pan).toBeVisible();
    await expect(page.locator('#volPanneau')).toBeVisible();
    await expect(b).toHaveAttribute('aria-expanded', 'true');
    await expect(page.locator('#volMuet')).toBeFocused();
    await expect(pan.locator('.volpct-txt')).toHaveText('50 %');
    await page.keyboard.press('Escape');
    await expect(pan).toBeHidden();
    await expect(b).toBeFocused();
    await b.click(); await expect(pan).toBeVisible();
    await page.mouse.click(200, 600);
    await expect(pan).toBeHidden();
    await expect(b).toHaveAttribute('aria-expanded', 'false');
  });

  test('le curseur règle tout le son tout de suite, et le réglage est gardé', async ({ page }) => {
    const erreurs = await ouvrir(page, { onglet: 'accueil' });
    await ouvrirMenu(page);
    await page.locator('#volCurseur').fill('20');
    expect(await gains(page)).toEqual({ master: .03, casque: .04 });
    expect(await page.evaluate(() => localStorage.getItem('coach-volume'))).toBe('0.2');
    await expect(affiche(page)).toHaveText('20 %');
    await page.reload();
    await expect(affiche(page)).toHaveText('20 %');
    await expect(page.locator('#volCurseur')).toHaveValue('20');
    await expect(page.locator('#tuVolume')).toHaveValue('0.2');   // le curseur des tutos est le même réglage
    expect(await gains(page)).toEqual({ master: .03, casque: .04 });
    expect(erreurs).toEqual([]); await sansBandeau(page);
  });

  test('le bouton du panneau coupe tout le son, puis le remet comme avant ; coupé, le bouton du menu le montre', async ({ page }) => {
    await ouvrir(page, { onglet: 'accueil', stockage: { 'coach-volume': '0.6' } });
    await ouvrirMenu(page);
    await expect(page.locator('#menuBtn .menumuet')).toBeHidden();
    await page.locator('#volMuet').click();
    expect((await gains(page)).master).toBe(0);
    await expect(page.locator('#volMuet')).toHaveAttribute('aria-pressed', 'true');
    await expect(affiche(page)).toHaveText('Coupé');
    // lot 90 : un petit haut-parleur barré sur le bouton du menu, et son nom le dit
    await expect(page.locator('#menuBtn .menumuet')).toBeVisible();
    await expect(page.locator('#menuBtn')).toHaveAttribute('aria-label', 'Son coupé, langue, mon avis');
    await page.locator('#volMuet').click();
    expect((await gains(page)).master).toBeCloseTo(.75 * .36, 3);
    await expect(affiche(page)).toHaveText('60 %');
    await expect(page.locator('#menuBtn .menumuet')).toBeHidden();
    await expect(page.locator('#menuBtn')).toHaveAttribute('aria-label', 'Son, langue, mon avis');
  });

  for (const abime of ['abc', '5', '-1', '']) {
    test(`un volume enregistré abîmé (« ${abime} ») revient à 50 %`, async ({ page }) => {
      const erreurs = await ouvrir(page, { onglet: 'accueil', stockage: { 'coach-volume': abime } });
      await expect(affiche(page)).toHaveText('50 %');
      expect(erreurs).toEqual([]);
    });
  }

  test('le volume reste sur l’appareil : il ne suit pas le compte, et « Tout recommencer à zéro » le garde', async ({ page }) => {
    await ouvrir(page, { onglet: 'accueil' });
    expect(await page.evaluate(() => CPT_LOCAL.includes('coach-volume'))).toBe(true);
  });
});

test.describe('« Mon compte », connecté', () => {
  test('des sections nettes : qui tu es, ta progression, tes réglages ; pas d’abonnement tant que Pro est éteint', async ({ page }) => {
    const erreurs = await ouvrir(page, { onglet: 'accueil', avant: dejaConnecte() + FAUX, stockage: { 'coach-lecons': '{"0":3,"1":2}', 'coach-volume': '0.4' } });
    await ouvrirCompte(page);
    await expect(page.locator('#compte .cptcard')).toHaveClass(/connecte/);
    await expect(page.locator('#cptMoiNom')).toHaveText('Nathan');
    await expect(page.locator('#cptProgNiv')).toContainText('Niveau ');
    await expect(page.locator('#cptProgNiv')).toContainText(' XP');
    await expect(page.locator('#cptProgTxt')).toContainText('5 étoiles sur ');
    await expect(page.locator('#cptProSec')).toBeHidden();
    await expect(page.locator('#cptPro')).toBeHidden();
    await expect(page.locator('#cptVol')).toHaveValue('40');
    await expect(page.locator('.cptvol .volpct-txt')).toHaveText('40 %');
    // le curseur de « Mon compte » règle le même volume
    await page.locator('#cptVol').fill('70');
    expect(await page.evaluate(() => localStorage.getItem('coach-volume'))).toBe('0.7');
    await expect(affiche(page)).toHaveText('70 %');
    // l'état de la progression est un texte simple, sans pastille verte
    const vert = await page.locator('#cptEtatTxt').evaluate(e => getComputedStyle(e, '::before').content);
    expect(['none', 'normal']).toContain(vert);
    expect(erreurs).toEqual([]); await sansBandeau(page);
  });

  test('« Mes progrès » ferme la fenêtre et ouvre la page', async ({ page }) => {
    await ouvrir(page, { onglet: 'accueil', avant: dejaConnecte() + FAUX });
    await ouvrirCompte(page);
    await page.locator('#cptProgBtn').click();
    await expect(page.locator('#compte')).toBeHidden();
    await expect(page.locator('#vProgres')).toBeVisible();
  });

  test('avec Pro allumé, la section « Abonnement » apparaît avec son titre', async ({ page }) => {
    await page.route('**/api/pro', r => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ pro: true, formule: 'mois', jusqua: 1826000000, annule: false }) }));
    await ouvrir(page, { onglet: 'accueil', avant: dejaConnecte() + FAUX + 'window.DJINGOOD_PRO = true;' });
    await ouvrirCompte(page);
    await expect(page.locator('#cptProSec')).toBeVisible();
    await expect(page.locator('#cptPro')).toBeVisible();
    await expect(page.locator('#cptProBtn')).toHaveText('Gérer mon abonnement');
    // sur un PC, le texte de l'abonnement a la place de tenir sur une ou deux lignes (il était coincé en colonne)
    const largeur = await page.locator('#cptPro .cptligne-txt').evaluate(e => e.getBoundingClientRect().width);
    expect(largeur).toBeGreaterThan(180);
  });
});

test.describe('Corrections du gardien (lot 60)', () => {
  test('Échap ferme le menu du son sans fermer la carte de fin d’un niveau', async ({ page }) => {
    await ouvrir(page, { onglet: 'apprendre' });
    await page.evaluate(() => { $('result').hidden = false; });
    await ouvrirMenu(page);
    await page.keyboard.press('Escape');
    await expect(page.locator('#menuPanneau')).toBeHidden();
    await expect(page.locator('#result')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.locator('#result')).toBeHidden();
  });
  test('à 700 px de large, le menu du son est entier', async ({ page }) => {
    await page.setViewportSize({ width: 700, height: 768 });
    await ouvrir(page, { onglet: 'accueil' });
    await ouvrirMenu(page);
    await expect(page.locator('#volBips')).toBeVisible();
    const r = await page.locator('#menuPanneau').evaluate(e => { const b = e.getBoundingClientRect(); return [b.left >= 0, b.right <= innerWidth]; });
    expect(r).toEqual([true, true]);
  });
});
