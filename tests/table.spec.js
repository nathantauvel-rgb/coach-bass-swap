// Page « Ma table » : schéma, explications, réaction en direct, réapprentissage, retour aux réglages d'origine.
const { test, expect } = require('@playwright/test');
const { ouvrir, envoyer, miseEnPlace, sansBandeau, jouer } = require('./outils');

const carte = page => page.evaluate(() => JSON.parse(localStorage.getItem('coach-midi-map')));
const commande = (page, id) => page.locator(`#tSvg [data-c="${id}"]`);
const APPRIS = JSON.stringify({ cfxA: { ch: 6, n: 23 }, fxOn: { ch: 4, n: 71 } });

test.describe('Schéma et explications', () => {
  test('la pastille de la table ouvre la page, sans table branchée', async ({ page }) => {
    const erreurs = await ouvrir(page, { onglet: '', midi: { branchee: false } });
    await page.locator('#midiPill').click();
    await expect(page.locator('#vTable')).toBeVisible();
    await expect(page.locator('#tabs a[aria-current]')).toHaveCount(0);
    await expect(page.locator('#tState')).toContainText('Aucune table branchée');
    await expect(page.locator('#tSvg .tc')).toHaveCount(28);
    await expect(page.locator('#tPanel strong')).toHaveText('Choisis une commande');
    expect(erreurs).toEqual([]); await sansBandeau(page);
  });
  test('une commande utilisée par le site : explication, niveaux, réglage', async ({ page }) => {
    await ouvrir(page, { onglet: 'table', midi: { branchee: true } });
    await commande(page, 'lowA').click();
    await expect(commande(page, 'lowA')).toHaveClass(/\bsel\b/);
    await expect(page.locator('#tPanel strong')).toHaveText('Potard LOW A');
    await expect(page.locator('#tPanel .tuse')).toHaveText('Utilisée dans : Le swap des basses · La transition complète.');
    await expect(page.locator('#tPanel .tmap')).toHaveText('Réglage : canal 1, numéro 15 (d\'origine).');
    await expect(commande(page, 'lowA')).toHaveClass(/\bsite\b/);
  });
  test('PLAY B et le bouton d\'effet : niveaux lus dans les niveaux eux-mêmes', async ({ page }) => {
    await ouvrir(page, { onglet: 'table' });
    await commande(page, 'playB').click();
    await expect(page.locator('#tPanel .tuse')).toContainText('Le bon moment');
    await expect(page.locator('#tPanel .tuse')).toContainText('chapitre 3, Lecture express');
    await commande(page, 'fx').click();
    await expect(page.locator('#tPanel .tuse')).toHaveText('Utilisée dans : L\'echo out.');
    await expect(page.locator('#tPanel .tmap')).toContainText('Pas encore réglée');
  });
  test('une commande que le site ne connaît pas encore', async ({ page }) => {
    await ouvrir(page, { onglet: 'table' });
    for (const id of ['cross', 'jogA', 'hiB', 'padsA', 'tempoB', 'cfxB']) {
      await commande(page, id).click();
      await expect(page.locator('#tPanel .tuse')).toHaveText('Pas encore utilisée par le site.');
      await expect(page.locator('#tLearn')).toHaveCount(0);
      await expect(commande(page, id)).not.toHaveClass(/\bsite\b/);
    }
  });
  test('MID B et PLAY A : reconnues, mais aucun niveau ne s\'en sert', async ({ page }) => {
    await ouvrir(page, { onglet: 'table' });
    await commande(page, 'midB').click();
    await expect(page.locator('#tPanel .tuse')).toContainText('aucun niveau ne s\'en sert');
  });
  test('au clavier : Entrée choisit la commande', async ({ page }) => {
    await ouvrir(page, { onglet: 'table' });
    await commande(page, 'faderB').focus();
    await page.keyboard.press('Enter');
    await expect(page.locator('#tPanel strong')).toHaveText('Fader de volume B');
  });
});

test.describe('En direct avec la table', () => {
  test('un fader qui bouge s\'allume, est choisi tout seul et affiche sa position', async ({ page }) => {
    const erreurs = await ouvrir(page, { onglet: 'table', midi: { branchee: true } });
    await expect(page.locator('#tState')).toContainText('Table branchée : DDJ-FLX4');
    await envoyer(page, 0xB0, 19, 100);
    await expect(page.locator('#tPanel strong')).toHaveText('Fader de volume A');
    await expect(page.locator('#tPanel .tlive')).toHaveText('Position : 79 %');
    await expect(commande(page, 'faderA')).toHaveClass(/\blive\b/);
    await expect(commande(page, 'faderA')).not.toHaveClass(/\blive\b/, { timeout: 3000 });
    expect(erreurs).toEqual([]);
  });
  test('PLAY B : affiché comme appuyé, relâché ignoré', async ({ page }) => {
    await ouvrir(page, { onglet: 'table', midi: { branchee: true } });
    await envoyer(page, 0x91, 11, 0);
    await expect(page.locator('#tPanel strong')).toHaveText('Choisis une commande');
    await envoyer(page, 0x91, 11, 127);
    await expect(page.locator('#tPanel strong')).toHaveText('Bouton PLAY B');
    await expect(page.locator('#tPanel .tlive')).toHaveText('Appuyée !');
  });
  test('une commande inconnue est signalée avec son canal et son numéro', async ({ page }) => {
    await ouvrir(page, { onglet: 'table', midi: { branchee: true } });
    await envoyer(page, 0xB5, 99, 64);
    await expect(page.locator('#tNote')).toHaveText('Commande reçue mais pas encore utilisée par le site (potard ou fader, canal 6, numéro 99).');
    await envoyer(page, 0x97, 40, 127);
    await expect(page.locator('#tNote')).toContainText('bouton, canal 8, numéro 40');
    await envoyer(page, 0xB0, 51, 64);                 // octet de précision : ignoré
    await expect(page.locator('#tNote')).toContainText('bouton, canal 8, numéro 40');
  });
  test('sur cette page, la table ne pilote ni l\'écho ni les niveaux, mais sa position est retenue', async ({ page }) => {
    await ouvrir(page, { onglet: 'table', midi: { branchee: true }, stockage: { 'coach-midi-map': APPRIS } });
    await envoyer(page, 0x94, 71, 127);
    await expect(page.locator('#tPanel strong')).toHaveText('Bouton ON de l\'effet');
    await expect(page.locator('#echoBtn')).toHaveAttribute('aria-pressed', 'false');
    await envoyer(page, 0xB0, 19, 127); await envoyer(page, 0xB1, 19, 0);
    await page.locator('#tabs a[data-view=apprendre]').click();
    await page.locator('.node').nth(1).click();
    const etat = await miseEnPlace(page);
    expect(etat[0]).toMatch(/^ok /); expect(etat[1]).toMatch(/^ok /);
  });
  test('table branchée puis débranchée pendant qu\'on regarde la page', async ({ page }) => {
    await ouvrir(page, { onglet: 'table', midi: { branchee: false } });
    await page.evaluate(() => window.__midi.brancher());
    await expect(page.locator('#tState')).toContainText('Table branchée');
    await page.evaluate(() => window.__midi.debrancher());
    await expect(page.locator('#tState')).toContainText('Aucune table branchée');
  });
});

test.describe('Réglages', () => {
  test('apprendre le filtre depuis la page', async ({ page }) => {
    await ouvrir(page, { onglet: 'table', midi: { branchee: true } });
    await commande(page, 'cfxA').click();
    await expect(page.locator('#tLearn')).toHaveText('Apprendre cette commande');
    await page.locator('#tLearn').click();
    await expect(page.locator('#tLearn')).toContainText('Bouge-la sur ta table');
    await envoyer(page, 0xB0, 19, 64);                 // le fader A, déjà attribué : refusé
    await envoyer(page, 0x96, 23, 127);                // un bouton : refusé pour un potard
    expect(await page.evaluate(() => localStorage.getItem('coach-midi-map'))).toBeNull();
    await envoyer(page, 0xB6, 23, 64);
    expect((await carte(page)).cfxA).toEqual({ ch: 6, n: 23 });
    await expect(page.locator('#tPanel .tmap')).toHaveText('Réglage : canal 7, numéro 23.');
    await expect(page.locator('#tLearn')).toHaveText('Réapprendre cette commande');
  });
  test('réapprendre PLAY B avec un autre bouton, puis s\'en servir dans un niveau', async ({ page }) => {
    await ouvrir(page, { onglet: 'table', midi: { branchee: true } });
    await commande(page, 'playB').click();
    await page.locator('#tLearn').click();
    await expect(page.locator('#tLearn')).toContainText('Appuie dessus');
    await envoyer(page, 0xB3, 50, 64);                 // un potard : refusé pour un bouton
    await envoyer(page, 0x90, 11, 127);                // PLAY A, déjà attribué : refusé
    await envoyer(page, 0x93, 60, 127);
    expect((await carte(page)).playB).toEqual({ ch: 3, n: 60 });
    await expect(page.locator('#tPanel .tmap')).toHaveText('Réglage : canal 4, numéro 60 (appris).');
    await page.locator('#tabs a[data-view=apprendre]').click();
    await page.locator('.node').nth(0).click();
    await jouer(page);
    await envoyer(page, 0x91, 11, 127);                // l'ancien bouton ne fait plus rien
    await expect(page.locator('#launchB')).toBeEnabled();
    await envoyer(page, 0x93, 60, 127);
    await expect(page.locator('#launchB')).toBeDisabled();
  });
  test('annuler un apprentissage, et quitter la page l\'annule aussi', async ({ page }) => {
    await ouvrir(page, { onglet: 'table', midi: { branchee: true } });
    await commande(page, 'faderA').click();
    await page.locator('#tLearn').click(); await page.locator('#tLearn').click();
    await expect(page.locator('#tLearn')).toHaveText('Réapprendre cette commande');
    await page.locator('#tLearn').click();
    await page.locator('#tabs a[data-view=apprendre]').click();
    await page.locator('.node').nth(1).click();
    await envoyer(page, 0xB7, 77, 127);                // serait appris si l'apprentissage continuait
    await envoyer(page, 0xB0, 19, 127); await envoyer(page, 0xB1, 19, 0);
    await expect(page.locator('#startBtn')).toBeEnabled();
    expect(await page.evaluate(() => localStorage.getItem('coach-midi-map'))).toBeNull();
  });
  test('revenir aux réglages d\'origine demande une confirmation', async ({ page }) => {
    await ouvrir(page, { onglet: 'table', midi: { branchee: true }, stockage: { 'coach-midi-map': APPRIS } });
    await commande(page, 'cfxA').click();
    await expect(page.locator('#tPanel .tmap')).toContainText('canal 7, numéro 23');
    await page.locator('#tReset').click();
    await expect(page.locator('#tReset')).toHaveText('Confirmer : effacer mes réglages appris');
    expect(await page.evaluate(() => localStorage.getItem('coach-midi-map'))).toBe(APPRIS);
    await page.locator('#tReset').click();
    expect(await page.evaluate(() => localStorage.getItem('coach-midi-map'))).toBeNull();
    await expect(page.locator('#tNote')).toContainText('Réglages d\'origine rétablis');
    await expect(page.locator('#tPanel .tmap')).toContainText('Pas encore réglée');
    await envoyer(page, 0xB0, 19, 100);
    await expect(page.locator('#tPanel strong')).toHaveText('Fader de volume A');
  });
  test('choisir une autre commande annule la demande de confirmation', async ({ page }) => {
    await ouvrir(page, { onglet: 'table', stockage: { 'coach-midi-map': APPRIS } });
    await page.locator('#tReset').click();
    await commande(page, 'hiA').click();
    await expect(page.locator('#tReset')).toHaveText('Revenir aux réglages d\'origine');
    expect(await page.evaluate(() => localStorage.getItem('coach-midi-map'))).toBe(APPRIS);
  });
});
