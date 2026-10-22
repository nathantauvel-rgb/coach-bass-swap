// Lot 28, refait au lot 37 : « Premiers pas ». À la première visite, Vini pose trois questions (niveau, table, objectif),
// puis mène à la première étape du parcours qui va avec le niveau.
const { test, expect } = require('@playwright/test');
const { ouvrir, sansBandeau } = require('./outils');

const NOUVEAU = { 'coach-guide-vu': null, 'coach-fiches': null, 'coach-accueil': null };
const stocke = (page, k) => page.evaluate(c => JSON.parse(localStorage.getItem(c)), k);
const choix = (page, i) => page.locator('#ppOpts .pp-opt').nth(i).click();
const suite = page => page.locator('#ppGo').click();
// Répond à tout : niveau (numéro), table (numéro), minutes (numéro)
async function repondre(page, { niveau, table, minutes }) {
  await suite(page);
  await choix(page, niveau); await suite(page);
  await choix(page, table); await suite(page);
  await choix(page, minutes); await suite(page);
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
  test('trois niveaux ; « Continuer » est grisé tant que rien n\'est choisi ; « Retour » garde les réponses', async ({ page }) => {
    await ouvrir(page, { onglet: '', stockage: NOUVEAU });
    await suite(page);
    await expect(page.locator('#ppAsk')).toHaveText('Tu en es où avec le mix ?');
    await expect(page.locator('#ppOpts .pp-opt .pp-txt > span:first-child')).toHaveText(['Grand débutant', 'Apprenti DJ', 'DJ confirmé']);
    await expect(page.locator('#ppGo')).toBeDisabled();
    await choix(page, 1);
    await expect(page.locator('#ppOpts .pp-opt').nth(1)).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('#ppAsk')).toHaveText(/Mode Expert/);
    await expect(page.locator('#ppGo')).toBeEnabled();
    await suite(page);
    await expect(page.locator('#ppAsk')).toHaveText('Tu as une table DJ ?');
    await page.locator('#ppBack').click();
    await expect(page.locator('#ppOpts .pp-opt').nth(1)).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('#ppGo')).toBeEnabled();
  });
  test('table : aucune n\'est mise en avant ; la liste par marque dit si DJingood la connaît', async ({ page }) => {
    await ouvrir(page, { onglet: '', stockage: NOUVEAU });
    await suite(page); await choix(page, 0); await suite(page);
    await expect(page.locator('#ppOpts .pp-opt')).toHaveCount(2);
    await expect(page.locator('#ppOpts .pp-opt').filter({ hasText: 'FLX4' })).toHaveCount(0);
    await expect(page.locator('#ppListe')).toBeHidden();
    await choix(page, 0);
    await expect(page.locator('#ppAsk')).toHaveText(/Branche-la en USB/);
    await expect(page.locator('#ppListe')).toBeVisible();
    const groupes = await page.locator('#ppModele optgroup').evaluateAll(g => g.map(x => x.label));
    expect(groupes).toEqual(['Hercules', 'Numark', 'Pioneer', 'Reloop', 'Roland']);
    await page.locator('#ppModele').selectOption('inpulse300');
    await expect(page.locator('#ppAsk')).toHaveText('Je connais la Hercules DJControl Inpulse 300 : je la reconnaîtrai dès que tu la brancheras.');
    await page.locator('#ppModele').selectOption('autre');
    await expect(page.locator('#ppAsk')).toHaveText(/je te montrerai comment la régler/);
    await choix(page, 1);
    await expect(page.locator('#ppAsk')).toHaveText(/tout se joue à la souris/);
    await expect(page.locator('#ppListe')).toBeHidden();
    await suite(page);
    await expect(page.locator('#ppNote')).toBeHidden();
    await choix(page, 1);
    await expect(page.locator('#ppNote')).toHaveText('Avec 10 min par jour, ta première vraie transition propre en 2 semaines !');
  });
  test('table branchée : reconnue toute seule, même pendant l\'écran', async ({ page }) => {
    const erreurs = await ouvrir(page, { onglet: '', stockage: NOUVEAU, midi: {} });
    await suite(page); await choix(page, 0); await suite(page);
    await expect(page.locator('#ppGo')).toBeDisabled();
    await page.evaluate(() => window.__midi.brancher('DJControl Inpulse 300'));
    await expect(page.locator('#ppAsk')).toHaveText('Je la reconnais : ta Hercules DJControl Inpulse 300 est prête à jouer !');
    await expect(page.locator('#ppOpts .pp-opt')).toHaveCount(1);
    await expect(page.locator('#ppOpts .pp-opt')).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('#ppGo')).toBeEnabled();
    // débranchée : on revient au choix
    await page.evaluate(() => window.__midi.debrancher());
    await expect(page.locator('#ppOpts .pp-opt')).toHaveCount(2);
    // une table que le site ne connaît pas
    await page.evaluate(() => window.__midi.brancher('Controleur Mystere X1'));
    await expect(page.locator('#ppAsk')).toHaveText(/je ne la connais pas encore/);
    await suite(page); await choix(page, 1); await suite(page);
    expect(await stocke(page, 'coach-accueil')).toMatchObject({ table: 'table', modele: 'inconnue' });
    expect(erreurs).toEqual([]);
  });
  test('Grand débutant : parcours « Grand débutant », objectif enregistré, puis le guide au niveau 1', async ({ page }) => {
    const erreurs = await ouvrir(page, { onglet: '', stockage: NOUVEAU });
    await suite(page);
    await choix(page, 0); await suite(page);
    await choix(page, 0); await page.locator('#ppModele').selectOption('flx4'); await suite(page);
    await choix(page, 0);
    await expect(page.locator('#ppGo')).toHaveText('Commencer');
    await suite(page);
    await expect(page.locator('#pp')).toBeHidden();
    await expect(page.locator('#vLearn')).toBeVisible();
    await expect(page.locator('#onb')).toBeVisible();
    await expect(page.locator('#ltitle')).toHaveText('Le bon moment');
    expect(await page.evaluate(() => localStorage.getItem('coach-parcours'))).toBe('debut');
    expect((await stocke(page, 'coach-objectif')).min).toBe(5);
    expect(await stocke(page, 'coach-accueil')).toEqual({ niveau: 'debut', table: 'table', modele: 'flx4', min: 5, fini: expect.any(String) });
    expect(erreurs).toEqual([]); await sansBandeau(page);
  });
  test('Apprenti DJ : niveau 1 en Mode Expert, sans guide ni fiche, chapitres ouverts', async ({ page }) => {
    const erreurs = await ouvrir(page, { onglet: '', stockage: NOUVEAU });
    await repondre(page, { niveau: 1, table: 1, minutes: 1 });
    await expect(page.locator('#vLearn')).toBeVisible();
    await expect(page.locator('#ltitle')).toHaveText('Le bon moment');
    await expect(page.locator('#expertBtn')).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('#onb')).toBeHidden();
    expect(await page.evaluate(() => localStorage.getItem('coach-parcours'))).toBe('apprenti');
    expect(await page.evaluate(() => [ch2Unlocked(), ch3Unlocked(), ch4Unlocked(), ch5Unlocked()])).toEqual([true, true, true, true]);
    expect(erreurs).toEqual([]); await sansBandeau(page);
  });
  test('DJ confirmé : on commence par le calage', async ({ page }) => {
    const erreurs = await ouvrir(page, { onglet: '', stockage: NOUVEAU });
    await repondre(page, { niveau: 2, table: 1, minutes: 2 });
    await expect(page.locator('#vLearn')).toBeVisible();
    await expect(page.locator('#lnum')).toHaveText(/^Chapitre 5 · Niveau 1/);
    await expect(page.locator('#onb')).toBeHidden();
    expect(await page.evaluate(() => localStorage.getItem('coach-parcours'))).toBe('confirme');
    expect((await stocke(page, 'coach-objectif')).min).toBe(15);
    expect(erreurs).toEqual([]); await sansBandeau(page);
  });
  test('« Passer » : aucun parcours imposé, l\'accueil propose les trois parcours, et plus de questions ensuite', async ({ page }) => {
    await ouvrir(page, { onglet: '', stockage: NOUVEAU });
    await page.locator('#ppSkip').click();
    await expect(page.locator('#pp')).toBeHidden();
    await expect(page.locator('#homeChoice')).toBeVisible();
    await expect(page.locator('#homeChoice .choice')).toHaveCount(3);
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
    await suite(page); await choix(page, 0); await suite(page);
    await choix(page, 0); await page.locator('#ppModele').selectOption('dj505'); await suite(page);
    await choix(page, 1); await suite(page);
    const r = await page.evaluate(() => avisRapport().replace(/ /g, ' '));
    expect(r).toContain('Premiers pas : Grand débutant · une table : Roland DJ-505 · 10 min par jour');
  });
  test('anciennes réponses (avant le lot 37) : relues sans erreur', async ({ page }) => {
    const ancien = JSON.stringify({ niveau: 3, table: 'flx4', pourquoi: ['potes'], min: 10, depart: 'test', fini: '2026-10-16' });
    const erreurs = await ouvrir(page, { onglet: '', stockage: { 'coach-accueil': ancien, 'coach-parcours': 'deja' } });
    await expect(page.locator('#pp')).toBeHidden();
    const r = await page.evaluate(() => avisRapport().replace(/ /g, ' '));
    expect(r).toContain('Premiers pas : DJ confirmé · une table : Pioneer DDJ-FLX4 · 10 min par jour');
    expect(await page.evaluate(() => localStorage.getItem('coach-parcours'))).toBe('apprenti');
    expect(erreurs).toEqual([]); await sansBandeau(page);
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
    await expect(page.locator('#ppVini')).toHaveAttribute('aria-label', 'Vini, la mascotte de DJingood');
  });
});
