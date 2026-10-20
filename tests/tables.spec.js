// Lot 38 : les tables de débutant que DJingo reconnaît toutes seules (fiches de js/tables.js).
// Les fausses tables portent le nom d'une vraie table ; leurs numéros sont ceux de la fiche (rien n'est essayé en vrai).
const { test, expect } = require('@playwright/test');
const { ouvrir, envoyer, sansBandeau } = require('./outils');

const S = o => JSON.stringify(o);
const stocke = (page, cle) => page.evaluate(k => JSON.parse(localStorage.getItem(k)), cle);

test.describe('Les fiches', () => {
  test('chaque fiche est valide : numéros MIDI possibles, aucun doublon, nom reconnu', async ({ page }) => {
    await ouvrir(page);
    const pb = await page.evaluate(() => {
      const out = [], ids = new Set();
      for (const f of MODELES){
        if (ids.has(f.id)) out.push('id en double : ' + f.id); ids.add(f.id);
        for (const [k, v] of Object.entries(Object.assign({}, f.cmd, f.plus))) if (!Array.isArray(v) || !(v[0] >= 0 && v[0] <= 15 && v[1] >= 0 && v[1] <= 127)) out.push(`${f.id}.${k} invalide`);
        for (const k of Object.keys(f.cmd)) if (!MIDI_CC.includes(k) && !MIDI_NOTE.includes(k)) out.push(`${f.id}.${k} : commande inconnue du site`);
        // cleanMap garde tout : pas de doublon dans un même groupe
        if (Object.keys(cleanMap(modeleMap(f), true)).length !== Object.keys(f.cmd).length) out.push(`${f.id} : doublon`);
        if (modeleDe(f.nom.replace(/^\S+\s/, '')) !== f) out.push(`${f.id} : son nom ne la reconnaît pas`);
        if (isFlx4(f.nom)) out.push(`${f.id} : passe pour une FLX4`);
      }
      return out;
    });
    expect(pb).toEqual([]);
  });
  test('les noms de port : variantes reconnues, MK2 et tables voisines non', async ({ page }) => {
    await ouvrir(page);
    const r = await page.evaluate(() => ['DDJ-400', '2- DDJ-400', 'PIONEER DDJ-SB3', 'DJControl Inpulse 200', 'DJControl Inpulse 200 MK2', 'DJControl Inpulse 500',
      'MIXTRACK PLATINUM FX', 'Mixtrack Pro FX', 'Mixtrack Pro', 'Numark Party Mix', 'Party Mix MKII', 'DJ2GO2 Touch', 'DJ-505', 'Reloop Mixage IE', 'DDJ-FLX4', 'DDJ-2000']
      .map(n => [n, (modeleDe(n) || {}).id || null]));
    expect(Object.fromEntries(r)).toEqual({ 'DDJ-400': 'ddj400', '2- DDJ-400': 'ddj400', 'PIONEER DDJ-SB3': 'ddjsb3', 'DJControl Inpulse 200': 'inpulse200', 'DJControl Inpulse 200 MK2': null,
      'DJControl Inpulse 500': 'inpulse500', 'MIXTRACK PLATINUM FX': 'mixtrackplatinumfx', 'Mixtrack Pro FX': 'mixtrackprofx', 'Mixtrack Pro': null, 'Numark Party Mix': 'partymix',
      'Party Mix MKII': null, 'DJ2GO2 Touch': 'dj2go2touch', 'DJ-505': 'dj505', 'Reloop Mixage IE': 'mixage', 'DDJ-FLX4': null, 'DDJ-2000': null });
  });
});

test.describe('Une table connue, branchée', () => {
  test('Hercules Inpulse 200 : prête tout de suite, sans bandeau, et elle pilote le niveau', async ({ page }) => {
    const erreurs = await ouvrir(page, { midi: { branchee: 'DJControl Inpulse 200' } });
    await expect(page.locator('#midiPill')).toHaveText('DJControl Inpulse 200');
    await expect(page.locator('#midiPill')).toHaveClass(/\bon\b/);
    await expect(page.locator('#tableBar')).toBeHidden();
    expect(await stocke(page, 'coach-table')).toEqual({ nom: 'DJControl Inpulse 200', modele: 'inpulse200' });
    // le swap : LOW de A (canal 2, numéro 2) et LOW de B (canal 3, numéro 2) suivent la table
    await page.locator('.node').nth(5).click();
    await expect(page.locator('#setup')).toBeVisible();
    await envoyer(page, 0xB1, 2, 64); await envoyer(page, 0xB2, 2, 0);
    expect(await page.evaluate(() => [phys.lowA, phys.lowB])).toEqual([64 / 127, 0]);
    // PLAY de B (note 7, canal 3) lance B au niveau 1
    await page.locator('.node').nth(0).click();
    expect(await page.evaluate(() => map.playB)).toEqual({ ch: 2, n: 7 });
    expect(erreurs).toEqual([]); await sansBandeau(page);
  });
  test('une commande que la table n\'a pas (le MID de l\'Inpulse 200) se fait à l\'écran et ne bloque pas « Jouer »', async ({ page }) => {
    await ouvrir(page, { midi: { branchee: 'DJControl Inpulse 200' } });
    expect(await page.evaluate(() => [!!map.midA, onScreen('midA')])).toEqual([false, true]);
  });
  test('Pioneer DDJ-400 : le filtre et ON de l\'effet marchent sans rien apprendre', async ({ page }) => {
    await ouvrir(page, { midi: { branchee: 'DDJ-400' } });
    await expect(page.locator('#midiPill')).toHaveClass(/\bon\b/);
    expect(await page.evaluate(() => [map.cfxA, map.fxOn])).toEqual([{ ch: 6, n: 23 }, { ch: 4, n: 71 }]);
  });
  test('« Ma table » dit qu\'elle est reconnue, et le bouton du bas revient à sa fiche', async ({ page }) => {
    await ouvrir(page, { onglet: 'table', midi: { branchee: 'MIXTRACK PLATINUM FX' } });
    await expect(page.locator('#tState')).toContainText('reconnue toute seule');
    await expect(page.locator('#tKick')).toHaveText('Ta table');
    await expect(page.locator('#tReset')).toHaveText('Revenir aux réglages d\'origine de la Numark Mixtrack Platinum FX');
    // un réglage appris à la main, puis le retour à la fiche
    await page.evaluate(() => { map = Object.assign({}, map, { lowA: { ch: 9, n: 99 } }); });
    await page.locator('#tReset').click(); await page.locator('#tReset').click();
    expect(await page.evaluate(() => map.lowA)).toEqual({ ch: 0, n: 25 });
    await expect(page.locator('#tNote')).toHaveText('Réglages de la Numark Mixtrack Platinum FX en place.');
  });
  test('le rapport des testeurs dit que la table a été reconnue d\'après sa fiche', async ({ page }) => {
    await ouvrir(page, { midi: { branchee: 'DJ-505' } });
    expect(await page.evaluate(() => avisRapport())).toContain('table branchée : DJ-505 (reconnue d’après sa fiche)');
  });
});

test.describe('Changer de table', () => {
  test('une table réglée à la main n\'est pas remplacée sans demander : le bandeau propose la fiche', async ({ page }) => {
    await ouvrir(page, { midi: { branchee: 'DJControl Inpulse 300' }, stockage: { 'coach-table': S({ nom: 'Controleur Mystere X1' }), 'coach-midi-map': S({ faderA: { ch: 0, n: 8 } }) } });
    await expect(page.locator('#tableBar')).toBeVisible();
    await expect(page.locator('#tbText')).toContainText('Tu as branché une Hercules DJControl Inpulse 300 : DJingo connaît ses réglages');
    await expect(page.locator('#midiPill')).not.toHaveClass(/\bon\b/);
    await page.locator('#tbGo').click();
    await expect(page.locator('#tableBar')).toBeHidden();
    await expect(page.locator('#midiPill')).toHaveClass(/\bon\b/);
    expect(await stocke(page, 'coach-table')).toEqual({ nom: 'DJControl Inpulse 300', modele: 'inpulse300' });
    expect(await page.evaluate(() => map.midA)).toEqual({ ch: 1, n: 3 });
  });
  test('après une table reconnue, une autre table reconnue prend ses réglages toute seule', async ({ page }) => {
    await ouvrir(page, { midi: { branchee: 'DDJ-SB3' }, stockage: { 'coach-table': S({ nom: 'DJControl Inpulse 300', modele: 'inpulse300' }) } });
    await expect(page.locator('#midiPill')).toHaveClass(/\bon\b/);
    expect(await stocke(page, 'coach-table')).toEqual({ nom: 'DDJ-SB3', modele: 'ddjsb3' });
  });
  test('après une table reconnue, la DDJ-FLX4 retrouve ses réglages d\'origine toute seule', async ({ page }) => {
    await ouvrir(page, { midi: { branchee: true }, stockage: { 'coach-table': S({ nom: 'DDJ-400', modele: 'ddj400' }), 'coach-midi-map': S({ faderA: { ch: 0, n: 19 } }) } });
    await expect(page.locator('#midiPill')).toHaveClass(/\bon\b/);
    await expect(page.locator('#tableBar')).toBeHidden();
    expect(await stocke(page, 'coach-table')).toBeNull();
    expect(await page.evaluate(() => map.lowA)).toEqual({ ch: 0, n: 15 });
  });
  test('une fiche inconnue dans coach-table est ignorée sans rien casser', async ({ page }) => {
    const erreurs = await ouvrir(page, { stockage: { 'coach-table': S({ nom: 'Truc', modele: 'nexistepas' }) } });
    expect(await page.evaluate(() => tableCfg)).toEqual({ nom: 'Truc' });
    expect(erreurs).toEqual([]);
  });
});
