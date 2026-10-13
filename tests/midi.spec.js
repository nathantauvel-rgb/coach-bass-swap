// Liaison avec la DDJ-FLX4 (Web MIDI). Ces tests utilisent une fausse table : ils protègent le code,
// ils ne remplacent pas la vérification sur la vraie table (voir tests/CHECKLIST-FLX4.md).
const { test, expect } = require('@playwright/test');
const { ouvrir, envoyer, miseEnPlace, sansBandeau, jouer } = require('./outils');

const PAR_DEFAUT = { faderA: { ch: 0, n: 19 }, faderB: { ch: 1, n: 19 }, lowA: { ch: 0, n: 15 }, lowB: { ch: 1, n: 15 }, midA: { ch: 0, n: 11 }, midB: { ch: 1, n: 11 }, playA: { ch: 0, n: 11 }, playB: { ch: 1, n: 11 } };
const CH3 = { 'coach-chapitre': '3', 'coach-ch2-ouvert': '1', 'coach-ch2': JSON.stringify({ 0: 3, 1: 3, 2: 3, 3: 3 }) };
const niveau = (page, i) => page.locator('.node').nth(i).click();

test.describe('Détection', () => {
  test('aucune table : on joue à la souris', async ({ page }) => {
    const erreurs = await ouvrir(page, { midi: { branchee: false } });
    await expect(page.locator('#midiPill')).toHaveText('Souris (aucune table branchée)');
    await expect(page.locator('#midiPill')).not.toHaveClass(/\bon\b/);
    await niveau(page, 1);
    await expect(page.locator('#setup')).toBeHidden();
    await expect(page.locator('#startBtn')).toBeEnabled();
    expect(erreurs).toEqual([]); await sansBandeau(page);
  });
  test('autorisation MIDI refusée : on joue à la souris', async ({ page }) => {
    const erreurs = await ouvrir(page, { midi: { refuse: true } });
    await expect(page.locator('#midiPill')).toHaveText('Souris (MIDI bloqué ici)');
    await expect(page.locator('#startBtn')).toBeEnabled();
    expect(erreurs).toEqual([]); await sansBandeau(page);
  });
  test('navigateur sans Web MIDI', async ({ page }) => {
    const erreurs = await ouvrir(page, { avant: 'try { Object.defineProperty(Navigator.prototype, "requestMIDIAccess", { value: undefined, configurable: true }); } catch (e) {}' });
    await expect(page.locator('#midiPill')).toHaveText('Souris (MIDI indisponible)');
    expect(erreurs).toEqual([]);
  });
  test('table branchée : son nom s\'affiche et la mise en place est demandée', async ({ page }) => {
    await ouvrir(page, { midi: { branchee: true } });
    await expect(page.locator('#midiPill')).toHaveText('DDJ-FLX4');
    await expect(page.locator('#midiPill')).toHaveClass(/\bon\b/);
    await niveau(page, 1);
    await expect(page.locator('#setup')).toBeVisible();
    await expect(page.locator('#startBtn')).toBeDisabled();
    await expect(page.locator('#startBtn')).toHaveText('Mets ta table en place');
  });
  test('« Je joue à la souris cette fois » débloque le niveau', async ({ page }) => {
    await ouvrir(page, { midi: { branchee: true } });
    await niveau(page, 1);
    await page.locator('#setupSkip').click();
    await expect(page.locator('#setup')).toBeHidden();
    await expect(page.locator('#startBtn')).toBeEnabled();
  });
});

test.describe('Contrôles par défaut', () => {
  test('faders de volume A et B', async ({ page }) => {
    await ouvrir(page, { midi: { branchee: true } });
    await niveau(page, 1);
    await envoyer(page, 0xB0, 19, 0);
    expect((await miseEnPlace(page))[0]).toContain('wrong');
    await envoyer(page, 0xB0, 19, 127); await envoyer(page, 0xB1, 19, 0);
    const etat = await miseEnPlace(page);
    expect(etat[0]).toMatch(/^ok .*Fader de volume A/); expect(etat[1]).toMatch(/^ok .*Fader de volume B/);
    await expect(page.locator('#startBtn')).toBeEnabled();
    await expect(page.locator('#startBtn')).toHaveText('Jouer');
  });
  test('potards LOW A et B', async ({ page }) => {
    await ouvrir(page, { midi: { branchee: true } });
    await niveau(page, 2);
    await envoyer(page, 0xB0, 15, 64); await envoyer(page, 0xB1, 15, 127);
    let etat = await miseEnPlace(page);
    expect(etat[0]).toMatch(/^ok .*LOW de A/); expect(etat[1]).toMatch(/^wrong .*LOW de B/);
    await envoyer(page, 0xB1, 15, 0);
    etat = await miseEnPlace(page);
    expect(etat[1]).toMatch(/^ok .*LOW de B/);
    await expect(page.locator('#startBtn')).toBeEnabled();
  });
  test('potard MID A (chapitre 3)', async ({ page }) => {
    await ouvrir(page, { midi: { branchee: true }, stockage: CH3 });
    await niveau(page, 2);
    await expect(page.locator('#ltitle')).toHaveText('Une seule voix à la fois');
    await envoyer(page, 0xB0, 11, 0);
    expect((await miseEnPlace(page))[0]).toMatch(/^wrong .*MID de A/);
    await envoyer(page, 0xB0, 11, 64);
    expect((await miseEnPlace(page))[0]).toMatch(/^ok .*MID de A/);
  });
  test('potard MID B : reçu sans erreur (aucun niveau ne s\'en sert aujourd\'hui)', async ({ page }) => {
    const erreurs = await ouvrir(page, { midi: { branchee: true } });
    await envoyer(page, 0xB1, 11, 64);
    expect(erreurs).toEqual([]); await sansBandeau(page);
  });
  test('PLAY B lance le morceau B pendant une partie', async ({ page }) => {
    const erreurs = await ouvrir(page, { midi: { branchee: true } });
    await niveau(page, 0);
    await jouer(page);
    await expect(page.locator('#launchB')).toBeEnabled();
    await envoyer(page, 0x91, 11, 0);            // bouton relâché : ignoré
    await expect(page.locator('#launchB')).toBeEnabled();
    await envoyer(page, 0x91, 11, 127);
    await expect(page.locator('#launchB')).toBeDisabled();
    expect(erreurs).toEqual([]);
  });
  test('PLAY A : reçu sans effet (le site ne s\'en sert pas aujourd\'hui)', async ({ page }) => {
    const erreurs = await ouvrir(page, { midi: { branchee: true } });
    await niveau(page, 0);
    await jouer(page);
    await envoyer(page, 0x90, 11, 127);
    await expect(page.locator('#launchB')).toBeEnabled();
    await expect(page.locator('#startBtn')).toHaveText('Arrêter');
    expect(erreurs).toEqual([]);
  });
  test('PLAY B hors partie ne fait rien', async ({ page }) => {
    const erreurs = await ouvrir(page, { midi: { branchee: true } });
    await niveau(page, 0);
    await envoyer(page, 0x91, 11, 127);
    await expect(page.locator('#startBtn')).toHaveText('Jouer');
    expect(erreurs).toEqual([]);
  });
});

test.describe('Apprentissage d\'un contrôle', () => {
  test('le filtre CFX s\'apprend, s\'enregistre et reste après rechargement', async ({ page }) => {
    await ouvrir(page, { midi: { branchee: true } });
    await niveau(page, 4);
    await page.locator('#setupList .learn').click();
    await expect(page.locator('#setupList .learn')).toHaveText('Tourne le potard CFX de A…');
    await envoyer(page, 0xB6, 55, 10);           // octet de précision (CC 32 à 63) : refusé
    await envoyer(page, 0x96, 70, 127);          // une note : refusée pour un potard
    expect(await page.evaluate(() => localStorage.getItem('coach-midi-map'))).toBeNull();
    await envoyer(page, 0xB6, 23, 64);
    expect(JSON.parse(await page.evaluate(() => localStorage.getItem('coach-midi-map')))).toEqual(Object.assign({}, PAR_DEFAUT, { cfxA: { ch: 6, n: 23 } }));
    expect((await miseEnPlace(page))[0]).toMatch(/^ok .*CFX de A/);
    await page.reload();
    await niveau(page, 4);
    await envoyer(page, 0xB6, 23, 64);
    expect((await miseEnPlace(page))[0]).toMatch(/^ok .*CFX de A/);
  });
  test('le bouton ON de l\'effet s\'apprend et active l\'écho', async ({ page }) => {
    await ouvrir(page, { midi: { branchee: true } });
    await niveau(page, 5);
    await page.locator('#setupList .learn').click();
    await envoyer(page, 0xB4, 20, 64);           // un potard : refusé pour un bouton
    expect(await page.evaluate(() => localStorage.getItem('coach-midi-map'))).toBeNull();
    await envoyer(page, 0x94, 71, 127);
    expect(JSON.parse(await page.evaluate(() => localStorage.getItem('coach-midi-map'))).fxOn).toEqual({ ch: 4, n: 71 });
    await envoyer(page, 0xB0, 19, 127);
    await jouer(page);
    await envoyer(page, 0x94, 71, 127);
    await expect(page.locator('#echoBtn')).toHaveAttribute('aria-pressed', 'true');
  });
  test('un contrôle déjà utilisé ailleurs est refusé pendant l\'apprentissage', async ({ page }) => {
    await ouvrir(page, { midi: { branchee: true } });
    await niveau(page, 4);
    await page.locator('#setupList .learn').click();
    await envoyer(page, 0xB0, 19, 64);           // le fader A, déjà attribué : refusé, on attend toujours
    expect(await page.evaluate(() => localStorage.getItem('coach-midi-map'))).toBeNull();
    await expect(page.locator('#setupList .learn')).toHaveText('Tourne le potard CFX de A…');
    await envoyer(page, 0xB6, 23, 64);
    expect(JSON.parse(await page.evaluate(() => localStorage.getItem('coach-midi-map'))).cfxA).toEqual({ ch: 6, n: 23 });
  });
  test('un réglage appris valide est gardé quand une autre entrée est abîmée', async ({ page }) => {
    await ouvrir(page, { midi: { branchee: true }, stockage: { 'coach-midi-map': JSON.stringify({ faderA: 'x', cfxA: { ch: 6, n: 23 }, fxOn: { ch: 4, n: 71 } }) } });
    await niveau(page, 4);
    await envoyer(page, 0xB6, 23, 64);
    expect((await miseEnPlace(page))[0]).toMatch(/^ok .*CFX de A/);
    await niveau(page, 1);
    await envoyer(page, 0xB0, 19, 127); await envoyer(page, 0xB1, 19, 0);
    await expect(page.locator('#startBtn')).toBeEnabled();
  });
});

test.describe('Débranchement et rebranchement', () => {
  test('la table est perdue puis retrouvée sans recharger la page', async ({ page }) => {
    const erreurs = await ouvrir(page, { midi: { branchee: true } });
    await niveau(page, 1);
    await page.evaluate(() => window.__midi.debrancher());
    await expect(page.locator('#midiPill')).toHaveText('Souris (aucune table branchée)');
    await expect(page.locator('#setup')).toBeHidden();
    await expect(page.locator('#startBtn')).toBeEnabled();
    await page.evaluate(() => window.__midi.brancher());
    await expect(page.locator('#midiPill')).toHaveText('DDJ-FLX4');
    await expect(page.locator('#setup')).toBeVisible();
    await envoyer(page, 0xB0, 19, 127); await envoyer(page, 0xB1, 19, 0);
    await expect(page.locator('#startBtn')).toBeEnabled();
    expect(erreurs).toEqual([]);
  });
  test('table branchée après le chargement de la page', async ({ page }) => {
    await ouvrir(page, { midi: { branchee: false } });
    await page.evaluate(() => window.__midi.brancher('DDJ-FLX4'));
    await expect(page.locator('#midiPill')).toHaveText('DDJ-FLX4');
  });
  // Une table débranchée a pu être manipulée entre-temps : ses anciennes positions sont oubliées.
  test('après rebranchement, une ancienne position n\'est plus considérée comme « en place »', async ({ page }) => {
    await ouvrir(page, { midi: { branchee: true } });
    await niveau(page, 1);
    await envoyer(page, 0xB0, 19, 127); await envoyer(page, 0xB1, 19, 0);
    await page.evaluate(() => { window.__midi.debrancher(); window.__midi.brancher(); });
    expect((await miseEnPlace(page))[0]).not.toMatch(/^ok /);
  });
});

test.describe('Messages inattendus', () => {
  test('messages tronqués, horloge, note relâchée, contrôle inconnu : ignorés', async ({ page }) => {
    const erreurs = await ouvrir(page, { midi: { branchee: true } });
    await niveau(page, 1);
    for (const m of [[], [0xB0], [0xB0, 19], [0xF8], [0xFE], [0x81, 11, 0], [0xB5, 99, 64], [0xE0, 0, 64], [0xC0, 5]]) await envoyer(page, ...m);
    expect(erreurs).toEqual([]); await sansBandeau(page);
    await envoyer(page, 0xB0, 19, 127); await envoyer(page, 0xB1, 19, 0);
    await expect(page.locator('#startBtn')).toBeEnabled();
  });
  // Une vraie table ne peut pas envoyer ces valeurs ; elles sont bornées par précaution.
  test('une valeur hors limites est ramenée entre 0 et 127', async ({ page }) => {
    await ouvrir(page, { midi: { branchee: true } });
    await niveau(page, 1);
    await envoyer(page, 0xB0, 19, 200); await envoyer(page, 0xB1, 19, -5);
    const affiche = k => page.locator(`[data-k=${k}]`).getAttribute('aria-valuenow').then(Number);
    expect(await affiche('faderA')).toBeLessThanOrEqual(100); expect(await affiche('faderB')).toBeGreaterThanOrEqual(0);
  });
});

test.describe('Correspondance enregistrée (coach-midi-map)', () => {
  const faders = async page => { await niveau(page, 1); await envoyer(page, 0xB0, 19, 127); await envoyer(page, 0xB1, 19, 0); };
  test('absente : réglages par défaut', async ({ page }) => {
    await ouvrir(page, { midi: { branchee: true } });
    await faders(page);
    await expect(page.locator('#startBtn')).toBeEnabled();
  });
  test('illisible : réglages par défaut', async ({ page }) => {
    const erreurs = await ouvrir(page, { midi: { branchee: true }, stockage: { 'coach-midi-map': '{oops' } });
    await faders(page);
    await expect(page.locator('#startBtn')).toBeEnabled();
    expect(erreurs).toEqual([]);
  });
  test('valide et personnalisée : respectée', async ({ page }) => {
    await ouvrir(page, { midi: { branchee: true }, stockage: { 'coach-midi-map': JSON.stringify(Object.assign({}, PAR_DEFAUT, { faderA: { ch: 2, n: 40 } })) } });
    await niveau(page, 1);
    await envoyer(page, 0xB0, 19, 127);
    expect((await miseEnPlace(page))[0]).not.toMatch(/^ok /);
    await envoyer(page, 0xB2, 40, 127); await envoyer(page, 0xB1, 19, 0);
    await expect(page.locator('#startBtn')).toBeEnabled();
  });
  // Dans tous les cas abîmés, la page ne doit jamais planter et la souris doit rester utilisable.
  const ABIMEES = { 'un texte': '"abc"', 'un nombre': '5', 'une liste': '[1,2]', 'null': 'null', 'incomplète': JSON.stringify({ cfxA: { ch: 6, n: 23 } }),
    'entrée invalide': JSON.stringify(Object.assign({}, PAR_DEFAUT, { faderA: 'x' })), 'hors limites': JSON.stringify(Object.assign({}, PAR_DEFAUT, { faderA: { ch: 99, n: 999 } })),
    'en double': JSON.stringify(Object.assign({}, PAR_DEFAUT, { faderB: { ch: 0, n: 19 } })) };
  for (const [nom, valeur] of Object.entries(ABIMEES)) {
    test(`abîmée (${nom}) : pas de plantage, la souris reste possible`, async ({ page }) => {
      const erreurs = await ouvrir(page, { midi: { branchee: true }, stockage: { 'coach-midi-map': valeur } });
      await faders(page);
      expect(erreurs).toEqual([]); await sansBandeau(page);
      await page.locator('#setupSkip').click();
      await expect(page.locator('#startBtn')).toBeEnabled();
    });
  }
  // Validation à la lecture (cleanMap) : toute entrée invalide, manquante ou en double reprend le réglage d'origine.
  for (const nom of ['un texte', 'un nombre', 'une liste', 'incomplète', 'entrée invalide', 'hors limites', 'en double']) {
    test(`abîmée (${nom}) : les contrôles par défaut fonctionnent quand même`, async ({ page }) => {
      await ouvrir(page, { midi: { branchee: true }, stockage: { 'coach-midi-map': ABIMEES[nom] } });
      await faders(page);
      await expect(page.locator('#startBtn')).toBeEnabled({ timeout: 2000 });
    });
  }
});
