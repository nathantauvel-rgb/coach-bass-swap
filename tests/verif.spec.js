// Lot 33 : « Vérifier ma table », la checklist de la vraie table guidée pas à pas dans « Ma table ».
const { test, expect } = require('@playwright/test');
const { ouvrir, envoyer, sansBandeau } = require('./outils');

const S = o => JSON.stringify(o);
const titre = page => page.locator('#vfTitle');
const stocke = page => page.evaluate(() => JSON.parse(localStorage.getItem('coach-verif')));
const ouvrirVerif = async page => { await page.locator('#tVerif').click(); await expect(page.locator('#verif')).toBeVisible(); };
// Un potard ou un fader poussé aux deux bouts
const bouts = async (page, st, n) => { await envoyer(page, st, n, 0); await envoyer(page, st, n, 127); };

test.describe('Vérifier ma table', () => {
  test('les commandes connues se cochent toutes seules, le filtre et ON s\'apprennent en chemin', async ({ page }) => {
    const erreurs = await ouvrir(page, { onglet: 'table', midi: { branchee: true } });
    await expect(page.locator('#tVerif')).toHaveText('Vérifier ma table pas à pas');
    await ouvrirVerif(page);
    await expect(page.locator('#vfKick')).toHaveText('Vérifier ma table · étape 1 sur 20');
    await expect(page.locator('#vfList li.ok')).toHaveCount(2);
    await expect(titre(page)).toHaveText('Les faders de volume', { timeout: 3000 });
    await bouts(page, 0xB0, 19); await bouts(page, 0xB1, 19);
    await expect(page.locator('#vfState')).toHaveText('Tout répond ✓');
    await expect(titre(page)).toHaveText('Les potards LOW', { timeout: 3000 });
    await bouts(page, 0xB0, 15); await bouts(page, 0xB1, 15);
    await expect(titre(page)).toHaveText('Le MID et le filtre', { timeout: 3000 });
    await expect(page.locator('#vfList li').nth(1)).toContainText('pas encore réglé');
    await bouts(page, 0xB0, 11);
    // le filtre n'a pas de réglage d'origine : le premier potard inconnu devient le sien
    await envoyer(page, 0xB6, 23, 64); await bouts(page, 0xB6, 23);
    await expect(titre(page)).toHaveText('Les boutons', { timeout: 3000 });
    expect(await page.evaluate(() => map.cfxA)).toEqual({ ch: 6, n: 23 });
    await envoyer(page, 0x90, 11, 127); await envoyer(page, 0x91, 11, 127);
    await envoyer(page, 0x94, 71, 127); await envoyer(page, 0x94, 71, 127);
    await expect(titre(page)).toHaveText('Le crossfader', { timeout: 3000 });
    expect(await page.evaluate(() => map.fxOn)).toEqual({ ch: 4, n: 71 });
    expect(JSON.parse(await page.evaluate(() => localStorage.getItem('coach-midi-map'))).fxOn).toEqual({ ch: 4, n: 71 });
    expect((await stocke(page)).res).toMatchObject({ table: 'ok', faders: 'ok', low: 'ok', mid: 'ok', boutons: 'ok' });
    expect((await stocke(page)).nom).toBe('DDJ-FLX4');
    expect(await page.evaluate(() => verifResume()[1].replace(/ /g, ' '))).toBe(' - Ta table est-elle reconnue ? : OK (DDJ-FLX4)');
    expect(erreurs).toEqual([]); await sansBandeau(page);
  });

  test('les commandes pas encore utilisées : leur numéro est relevé', async ({ page }) => {
    await ouvrir(page, { onglet: 'table', midi: { branchee: true }, stockage: { 'coach-verif': S({ i: 5, res: { table: 'ok' } }) } });
    await expect(page.locator('#tVerif')).toHaveText('Reprendre la vérification (étape 6 sur 20)');
    await ouvrirVerif(page);
    await expect(titre(page)).toHaveText('Le crossfader');
    // un fader déjà connu ne compte pas ; le second message d'un potard « fin » non plus
    await bouts(page, 0xB0, 19);
    await expect(page.locator('#vfState')).toHaveText('J’écoute ta table…');
    await envoyer(page, 0xB6, 31, 0); await envoyer(page, 0xB6, 63, 5);
    await expect(page.locator('#vfState')).toHaveText(/Reçu\s:\scanal 7, numéro 31/);
    await envoyer(page, 0xB6, 31, 64); await envoyer(page, 0xB6, 31, 127);
    await expect(page.locator('#vfState')).toHaveText('C’est noté : canal 7, numéro 31 ✓');
    await expect(titre(page)).toHaveText('Le potard HI de A', { timeout: 3000 });
    // une commande absente de la table
    await page.locator('#vfSkip').click();
    await expect(titre(page)).toHaveText('Le potard HI de B');
    // la molette : beaucoup de messages, même tous pareils
    for (const t of ['#vfSkip', '#vfSkip']) await page.locator(t).click();
    await expect(titre(page)).toHaveText('Le tempo de A');
    await page.locator('#vfSkip').click();
    await expect(titre(page)).toHaveText('La molette de A');
    for (let i = 0; i < 6; i++) await envoyer(page, 0xB0, 34, 65);
    await expect(titre(page)).toHaveText('Le bouton CUE de A', { timeout: 3000 });
    // un bouton : le même, deux fois (HOT CUE puis le pad : c'est le pad qui est gardé)
    await page.locator('#vfSkip').click();
    await envoyer(page, 0x97, 27, 127); await envoyer(page, 0x97, 0, 127); await envoyer(page, 0x97, 0, 127);
    await expect(titre(page)).toHaveText('BEAT SYNC de A', { timeout: 3000 });
    const v = await stocke(page);
    expect(v.midi).toEqual({ xfader: { type: 'cc', ch: 6, n: 31 }, jogA: { type: 'cc', ch: 0, n: 34 }, padA: { type: 'note', ch: 7, n: 0 } });
    expect(v.res).toMatchObject({ hiA: 'absent', cueA: 'absent' });
  });

  test('débrancher puis rebrancher, les questions, et le rapport', async ({ page }) => {
    const erreurs = await ouvrir(page, { onglet: 'table', midi: { branchee: true }, stockage: { 'coach-verif': S({ i: 14, res: { table: 'ok', xfader: 'ok' }, midi: { xfader: { type: 'cc', ch: 6, n: 31 } } }) } });
    await ouvrirVerif(page);
    await expect(titre(page)).toHaveText('Débrancher, rebrancher');
    await page.evaluate(() => window.__midi.debrancher());
    await expect(page.locator('#vfList li.ok')).toHaveCount(1);
    await page.evaluate(() => window.__midi.brancher());
    await expect(titre(page)).toHaveText('Le dessin de la table', { timeout: 3000 });
    await expect(page.locator('#vfSvg')).toBeVisible();
    await expect(page.locator('#vfNext')).toBeDisabled();
    await page.locator('.vfopt', { hasText: 'Non, il y a une erreur' }).click();
    await page.locator('#vfNote').fill('Le bouton ON n’est pas au bon endroit');
    await page.locator('#vfNext').click();
    await expect(titre(page)).toHaveText('Le son dans le casque');
    await page.locator('.vfjouer', { hasText: 'Écouter' }).click();
    await page.locator('.vfopt', { hasText: 'Oui, j’entends bien' }).click(); await page.locator('#vfNext').click();
    await expect(titre(page)).toHaveText('Le Mode Expert, au casque');
    await page.locator('.vfopt', { hasText: 'Plus de 80' }).click();
    await expect(page.locator('#vfNext')).toBeDisabled();   // il faut aussi la deuxième réponse
    await page.locator('.vfopt', { hasText: 'Trop tard' }).click(); await page.locator('#vfNext').click();
    await page.locator('.vfopt', { hasText: 'Oui, c’est calé' }).click(); await page.locator('.vfopt', { hasText: 'Sonnent bien' }).click(); await page.locator('#vfNext').click();
    await page.locator('.vfopt', { hasText: 'Bien dosés' }).click(); await page.locator('#vfNext').click();
    await expect(titre(page)).toHaveText('Vérification terminée');
    await expect(page.locator('#vfText')).toHaveText(/^\d+ étapes? sans souci sur 20, 1 à regarder\./);
    const r = (await page.evaluate(() => verifResume().join('\n'))).replace(/ /g, ' ');
    expect(r).toContain('Vérification de la table (terminée le ');
    expect(r).toContain(' - Ta table est-elle reconnue ? : OK');
    expect(r).toContain(' - Le crossfader : OK (canal 7, numéro 31)');
    expect(r).toContain(' - Le dessin de la table : Non, il y a une erreur · « Le bouton ON n’est pas au bon endroit »');
    expect(r).toContain(' - Le Mode Expert, au casque : Plus de 80 · Trop tard');
    expect((await page.evaluate(() => avisRapport())).replace(/ /g, ' ')).toContain('Vérification de la table (terminée le ');
    await page.locator('#vfClose').click();
    await expect(page.locator('#tVerif')).toHaveText('Revoir ma vérification de la table');
    expect(erreurs).toEqual([]); await sansBandeau(page);
  });

  test('« Aller jouer » garde l\'étape, ouvre le niveau en Mode Expert ; Échap ferme', async ({ page }) => {
    await ouvrir(page, { onglet: 'table', midi: { branchee: true }, stockage: { 'coach-verif': S({ i: 17, res: { table: 'ok' } }) } });
    await ouvrirVerif(page);
    await page.keyboard.press('Escape');
    await expect(page.locator('#verif')).toBeHidden();
    await ouvrirVerif(page);
    await page.locator('.vfjouer').click();
    await expect(page.locator('#verif')).toBeHidden();
    await expect(page.locator('#vLearn')).toBeVisible();
    await expect(page.locator('#ltitle')).toHaveText('Le bon moment');
    expect(await page.evaluate(() => expert)).toBe(true);
    expect((await stocke(page)).i).toBe(17);
  });

  for (const v of ['{oops', '[1]', S({ i: 99, res: { zzz: 'ok', table: 5 }, midi: { xfader: { type: 'x', ch: 200 } }, note: 'x' })]) {
    test(`« coach-verif » abîmé (${v.slice(0, 16)}) : on repart du début, sans erreur`, async ({ page }) => {
      const erreurs = await ouvrir(page, { onglet: 'table', midi: {}, stockage: { 'coach-verif': v } });
      // sans table prête à jouer, ni vérification commencée : pas de carte
      await expect(page.locator('.tverif')).toBeHidden();
      await page.evaluate(() => window.__midi.brancher());
      await expect(page.locator('#tVerif')).toHaveText('Vérifier ma table pas à pas');
      await ouvrirVerif(page);
      await expect(page.locator('#vfKick')).toHaveText('Vérifier ma table · étape 1 sur 20');
      await expect(titre(page)).toHaveText('Les faders de volume', { timeout: 3000 });
      await page.evaluate(() => window.__midi.debrancher());
      await expect(page.locator('#vfState')).toHaveText('Aucune table vue pour l’instant.');
      expect(erreurs).toEqual([]); await sansBandeau(page);
    });
  }

  test('une autre table réglée pas à pas passe la première étape ; une table pas encore réglée ne voit pas la carte', async ({ page }) => {
    await ouvrir(page, { onglet: 'table', midi: { branchee: 'Mixtrack Pro' } });
    await expect(page.locator('.tverif')).toBeHidden();
    await page.evaluate(() => { tableCfg = { nom: 'Mixtrack Pro' }; renderTable(); });
    await ouvrirVerif(page);
    await expect(page.locator('#vfList li.ok')).toHaveCount(2);
    await expect(page.locator('#vfList li').nth(1)).toHaveText('✓ Elle est réglée et prête à jouer');
  });
});
