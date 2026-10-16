// Lot 28 : « Premiers pas ». À la première visite, Vini pose ses questions une par une, puis mène à la première partie.
const { test, expect } = require('@playwright/test');
const { ouvrir, sansBandeau } = require('./outils');

const NOUVEAU = { 'coach-guide-vu': null, 'coach-fiches': null, 'coach-accueil': null };
const stocke = (page, k) => page.evaluate(c => JSON.parse(localStorage.getItem(c)), k);
const choix = (page, i) => page.locator('#ppOpts .pp-opt').nth(i).click();
const suite = page => page.locator('#ppGo').click();
// Répond à tout : niveau, table, pourquoi (liste de numéros), minutes (numéro), départ (numéro)
async function repondre(page, { niveau, table, pourquoi, minutes, depart }) {
  await suite(page);
  await choix(page, niveau); await suite(page);
  await choix(page, table); await suite(page);
  for (const i of pourquoi) await choix(page, i);
  await suite(page);
  await choix(page, minutes); await suite(page);
  await choix(page, depart); await suite(page);
}

test.describe('Premiers pas', () => {
  test('un nouveau venu les voit ; quelqu\'un qui a déjà joué, non', async ({ page }) => {
    const erreurs = await ouvrir(page, { onglet: '', stockage: NOUVEAU });
    await expect(page.locator('#pp')).toBeVisible();
    await expect(page.locator('#ppAsk')).toHaveText(/^Salut, moi c’est Vini/);
    await expect(page.locator('#ppVini svg')).toBeVisible();
    await expect(page.locator('#ppVini')).toHaveClass(/vn-danse/);
    await expect(page.locator('#ppGo')).toBeEnabled();
    await expect(page.locator('#ppBack')).toBeHidden();
    await expect(page.locator('#onb')).toBeHidden();   // le guide attend la fin des questions
    expect(erreurs).toEqual([]); await sansBandeau(page);
  });
  for (const [nom, stockage] of [['un parcours déjà choisi', { 'coach-parcours': 'debut', 'coach-accueil': null }], ['une progression', { 'coach-lecons': '{"0":3}', 'coach-accueil': null }]]) {
    test(`pas de Premiers pas pour ${nom}`, async ({ page }) => {
      await ouvrir(page, { onglet: '', stockage });
      await expect(page.locator('#pp')).toBeHidden();
    });
  }
  test('« Continuer » est grisé tant que rien n\'est choisi ; « Retour » garde les réponses', async ({ page }) => {
    await ouvrir(page, { onglet: '', stockage: NOUVEAU });
    await suite(page);
    await expect(page.locator('#ppAsk')).toHaveText('Tu as déjà mixé ?');
    await expect(page.locator('#ppOpts .pp-opt')).toHaveCount(4);
    await expect(page.locator('#ppGo')).toBeDisabled();
    await choix(page, 2);
    await expect(page.locator('#ppOpts .pp-opt').nth(2)).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('#ppAsk')).toHaveText('Top. On va les rendre propres et précises.');
    await expect(page.locator('#ppGo')).toBeEnabled();
    await suite(page);
    await expect(page.locator('#ppAsk')).toHaveText('Tu as quelle table ?');
    await page.locator('#ppBack').click();
    await expect(page.locator('#ppOpts .pp-opt').nth(2)).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('#ppGo')).toBeEnabled();
  });
  test('Vini réagit à la table choisie ; plusieurs raisons possibles ; l\'objectif annonce le délai', async ({ page }) => {
    await ouvrir(page, { onglet: '', stockage: NOUVEAU });
    await suite(page); await choix(page, 0); await suite(page);
    await choix(page, 1);
    await expect(page.locator('#ppAsk')).toHaveText(/je te montrerai comment la régler/);
    await choix(page, 2);
    await expect(page.locator('#ppAsk')).toHaveText(/tout se joue à la souris/);
    await suite(page);
    await choix(page, 0); await choix(page, 4); await choix(page, 0);
    await expect(page.locator('#ppOpts .pp-opt[aria-pressed="true"]')).toHaveCount(1);
    await suite(page);
    await expect(page.locator('#ppNote')).toBeHidden();
    await choix(page, 1);
    await expect(page.locator('#ppNote')).toHaveText('Avec 10 min par jour, ta première vraie transition propre en 2 semaines !');
  });
  test('débutant complet : parcours « Je débute », objectif enregistré, puis le guide au niveau 1', async ({ page }) => {
    const erreurs = await ouvrir(page, { onglet: '', stockage: NOUVEAU });
    await page.locator('#ppGo').click();
    await choix(page, 0); await suite(page);
    await choix(page, 0); await suite(page);
    await choix(page, 0); await choix(page, 3); await suite(page);
    await choix(page, 0); await suite(page);
    await expect(page.locator('#ppOpts .pp-opt').nth(0)).toContainText('Recommandé');
    await choix(page, 0);
    await expect(page.locator('#ppGo')).toHaveText('Commencer');
    await suite(page);
    await expect(page.locator('#pp')).toBeHidden();
    await expect(page.locator('#vLearn')).toBeVisible();
    await expect(page.locator('#onb')).toBeVisible();
    await expect(page.locator('#ltitle')).toHaveText('Le bon moment');
    expect(await page.evaluate(() => localStorage.getItem('coach-parcours'))).toBe('debut');
    expect((await stocke(page, 'coach-objectif')).min).toBe(5);
    expect(await stocke(page, 'coach-accueil')).toMatchObject({ niveau: 0, table: 'flx4', pourquoi: ['potes', 'plaisir'], min: 5, depart: 'bases' });
    expect(erreurs).toEqual([]); await sansBandeau(page);
  });
  test('quelqu\'un qui mixe déjà : le test de placement est recommandé, puis lancé', async ({ page }) => {
    await ouvrir(page, { onglet: '', stockage: NOUVEAU });
    await suite(page); await choix(page, 3); await suite(page);
    await choix(page, 1); await suite(page);
    await choix(page, 4); await suite(page);
    await choix(page, 2); await suite(page);
    await expect(page.locator('#ppOpts .pp-opt').nth(1)).toContainText('Recommandé');
    await expect(page.locator('#ppOpts .pp-opt').nth(0)).not.toContainText('Recommandé');
    await choix(page, 1); await suite(page);
    await expect(page.locator('#pBanner')).toBeVisible();
    await expect(page.locator('#pTitle')).toHaveText('Test de placement · épreuve 1 sur 3');
    expect(await page.evaluate(() => localStorage.getItem('coach-parcours'))).toBe('deja');
    expect((await stocke(page, 'coach-objectif')).min).toBe(15);
  });
  test('« Je sais lancer deux morceaux » puis les bases : niveau 1, sans guide imposé', async ({ page }) => {
    await ouvrir(page, { onglet: '', stockage: NOUVEAU });
    await repondre(page, { niveau: 1, table: 0, pourquoi: [1], minutes: 1, depart: 0 });
    await expect(page.locator('#vLearn')).toBeVisible();
    await expect(page.locator('#ltitle')).toHaveText('Le bon moment');
    await expect(page.locator('#onb')).toBeHidden();
    await expect(page.locator('#pBanner')).toBeHidden();
  });
  test('« Passer » : aucun parcours imposé, l\'accueil propose les deux parcours, et plus de questions ensuite', async ({ page }) => {
    await ouvrir(page, { onglet: '', stockage: NOUVEAU });
    await page.locator('#ppSkip').click();
    await expect(page.locator('#pp')).toBeHidden();
    await expect(page.locator('#homeChoice')).toBeVisible();
    expect((await stocke(page, 'coach-accueil')).passe).toBe(true);
    expect(await page.evaluate(() => localStorage.getItem('coach-parcours'))).toBeNull();
    await page.reload();
    await expect(page.locator('#homeChoice')).toBeVisible();
    await expect(page.locator('#pp')).toBeHidden();
  });
  test('arrivé directement sur Apprendre : d\'abord les questions, le guide ensuite', async ({ page }) => {
    await ouvrir(page, { onglet: 'apprendre', stockage: NOUVEAU });
    await expect(page.locator('#pp')).toBeVisible();
    await expect(page.locator('#onb')).toBeHidden();
  });
  test('le rapport des testeurs reprend les réponses', async ({ page }) => {
    await ouvrir(page, { onglet: '', stockage: NOUVEAU });
    await repondre(page, { niveau: 0, table: 2, pourquoi: [0, 2], minutes: 1, depart: 0 });
    const r = await page.evaluate(() => avisRapport().replace(/ /g, ' '));
    expect(r).toContain('Premiers pas : Je n’ai jamais touché une table · Pas encore de table (je joue à la souris) · pour : mixer entre potes, publier des mixes en ligne · 10 min par jour · commencer par les bases');
  });
  for (const v of ['{oops', '[1]', '{"fini":5}', '"x"']) test(`« coach-accueil » abîmé (${v}) : les questions reviennent, sans erreur`, async ({ page }) => {
    const erreurs = await ouvrir(page, { onglet: '', stockage: Object.assign({}, NOUVEAU, { 'coach-accueil': v }) });
    await expect(page.locator('#pp')).toBeVisible();
    expect(erreurs).toEqual([]); await sansBandeau(page);
  });
});

test.describe('Vini', () => {
  test('trois humeurs ; une joie qui dure un instant', async ({ page }) => {
    await ouvrir(page, { onglet: '', stockage: NOUVEAU });
    const cls = () => page.locator('#ppVini').getAttribute('class');
    await page.evaluate(() => viniHumeur($('ppVini'), 'rate'));
    expect(await cls()).toMatch(/vn-rate/); expect(await cls()).not.toMatch(/vn-danse/);
    await page.evaluate(() => viniHumeur($('ppVini'), 'n’importe quoi'));
    expect(await cls()).toMatch(/vn-danse/);
    await page.evaluate(() => viniJoie($('ppVini'), 150));
    expect(await cls()).toMatch(/vn-parfait/);
    await expect(page.locator('#ppVini')).toHaveClass(/vn-danse/);
    await expect(page.locator('#ppVini')).toHaveAttribute('aria-label', 'Vini, la mascotte de DJingo');
  });
});
