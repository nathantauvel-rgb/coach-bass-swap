// Lot 19 : une autre table que la DDJ-FLX4. Le site la reconnaît, ne la laisse rien piloter tant qu'elle n'est pas réglée,
// et propose de la régler pas à pas. La fausse table porte un autre nom ; ses numéros MIDI sont inventés pour le test.
const { test, expect } = require('@playwright/test');
const { ouvrir, envoyer, miseEnPlace, sansBandeau } = require('./outils');

const S = o => JSON.stringify(o);
const AUTRE = 'DJControl Inpulse 200';
const PAR_DEFAUT = { faderA: { ch: 0, n: 19 }, faderB: { ch: 1, n: 19 }, lowA: { ch: 0, n: 15 }, lowB: { ch: 1, n: 15 }, midA: { ch: 0, n: 11 }, midB: { ch: 1, n: 11 }, playA: { ch: 0, n: 11 }, playB: { ch: 1, n: 11 } };
// Ce que la préparation pas à pas du test ci-dessous enregistre (pas de MID sur cette table)
const REGLEE = { faderA: { ch: 0, n: 8 }, faderB: { ch: 1, n: 8 }, lowA: { ch: 0, n: 3 }, lowB: { ch: 1, n: 3 }, cfxA: { ch: 4, n: 20 }, playB: { ch: 1, n: 30, cc: true }, fxOn: { ch: 4, n: 71 } };
const DEJA_REGLEE = { 'coach-table': S({ nom: AUTRE }), 'coach-midi-map': S(REGLEE) };
const bouge = async (page, statut, n, valeurs) => { for (const v of valeurs) await envoyer(page, statut, n, v); };
const stocke = (page, cle) => page.evaluate(k => JSON.parse(localStorage.getItem(k)), cle);

test.describe('Une autre table, pas encore réglée', () => {
  test('la DDJ-FLX4 : pas de bandeau, rien ne change', async ({ page }) => {
    await ouvrir(page, { midi: { branchee: true } });
    await expect(page.locator('#midiPill')).toHaveText('DDJ-FLX4');
    await expect(page.locator('#midiPill')).toHaveClass(/\bon\b/);
    await expect(page.locator('#tableBar')).toBeHidden();
  });
  test('un bandeau propose de la régler, et elle ne pilote rien en attendant', async ({ page }) => {
    const erreurs = await ouvrir(page, { midi: { branchee: AUTRE } });
    await expect(page.locator('#tableBar')).toBeVisible();
    await expect(page.locator('#tbText')).toContainText(`Nouvelle table : « ${AUTRE} »`);
    await expect(page.locator('#tbGo')).toHaveText('Régler ma table');
    await expect(page.locator('#midiPill')).toHaveText(`${AUTRE} · à régler`);
    await expect(page.locator('#midiPill')).not.toHaveClass(/\bon\b/);
    // ses numéros ne sont pas ceux de la FLX4 : pas de position de départ demandée, « Jouer » reste libre
    await page.locator('.node').nth(5).click();
    await expect(page.locator('#setup')).toBeHidden();
    await expect(page.locator('#startBtn')).toBeEnabled();
    await envoyer(page, 0xB0, 15, 0);
    expect(await page.evaluate(() => phys.lowA)).toBeUndefined();
    await page.locator('#tbLater').click();
    await expect(page.locator('#tableBar')).toBeHidden();
    expect(erreurs).toEqual([]); await sansBandeau(page);
  });
  test('dans une fiche, le curseur à l\'écran remplace la table pas encore réglée', async ({ page }) => {
    await ouvrir(page, { midi: { branchee: AUTRE }, stockage: { 'coach-fiches': null, 'coach-parcours': 'debut' } });
    await page.locator('.node').nth(5).click();
    await page.locator('#startBtn').click();
    await expect(page.locator('#onbTitle')).toHaveText('Le potard LOW : les basses');
    await expect(page.locator('#onbNote')).toHaveText('Ta table n\'est pas encore réglée : le curseur ci-dessus fait la même chose.');
    await expect(page.locator('#onbTry .act')).toContainText('(ou utilise le curseur)');
  });
});

test.describe('Régler ma table pas à pas', () => {
  test('chaque commande, puis le résumé, puis la table pilote le site', async ({ page }) => {
    const erreurs = await ouvrir(page, { midi: { branchee: AUTRE } });
    await page.locator('#tbGo').click();
    await expect(page.locator('#reg')).toBeVisible();
    await expect(page.locator('#tableBar')).toBeHidden();
    await expect(page.locator('#regKick')).toHaveText('Régler ma table · 1 sur 8');
    await expect(page.locator('#regTitle')).toHaveText('Le fader de volume de gauche');
    await expect(page.locator('#rg-faderA rect').first()).toHaveClass(/hl/);
    await expect(page.locator('#regBack')).toBeHidden();
    // fader A : deux valeurs ne suffisent pas (un bouton appuyé par erreur en envoie autant)
    await bouge(page, 0xB0, 8, [10, 20]);
    await expect(page.locator('#regState')).toHaveText('J’attends que tu le bouges sur ta table…');
    await bouge(page, 0xB0, 8, [30]);
    await expect(page.locator('#regState')).toHaveText('Reconnu !');
    await expect(page.locator('#regTitle')).toHaveText('Le fader de volume de droite');
    // fader B : on touche d'abord le fader A, déjà reconnu
    await bouge(page, 0xB0, 8, [40, 50, 60]);
    await expect(page.locator('#regState')).toHaveText('Ça, c’est le fader de volume de gauche, déjà reconnu. Bouge plutôt le fader de volume de droite.');
    await bouge(page, 0xB1, 8, [10, 20, 30]);
    await expect(page.locator('#regTitle')).toHaveText('Le potard LOW de gauche');
    // LOW A : un potard « fin » envoie deux messages par position (numéro 3, puis 35) ; seul le premier compte
    for (const v of [60, 61, 62]) { await envoyer(page, 0xB0, 3, v); await envoyer(page, 0xB0, 35, v); }
    await expect(page.locator('#regTitle')).toHaveText('Le potard LOW de droite');
    await bouge(page, 0xB1, 3, [60, 61, 62]);
    await expect(page.locator('#regTitle')).toHaveText('Le potard MID de gauche');
    await page.locator('#regSkip').click();
    await expect(page.locator('#regTitle')).toHaveText('Le filtre de gauche');
    await bouge(page, 0xB4, 20, [60, 70, 80]);
    await expect(page.locator('#regTitle')).toHaveText('Le bouton PLAY de droite');
    await expect(page.locator('#regState')).toHaveText('J’attends que tu appuies dessus sur ta table…');
    // PLAY B : ce bouton-là envoie un message de potard, 127 à l'appui et 0 au relâché
    await bouge(page, 0xB1, 30, [127, 0]);
    await expect(page.locator('#regTitle')).toHaveText('Le bouton de l’effet');
    await envoyer(page, 0x94, 71, 127);
    await expect(page.locator('#regTitle')).toHaveText('Ta table est prête');
    await expect(page.locator('#regKick')).toHaveText(`Régler ma table · ${AUTRE}`);
    await expect(page.locator('#regList li')).toHaveText(['✓ Le fader de volume de gauche : reconnu', '✓ Le fader de volume de droite : reconnu', '✓ Le potard LOW de gauche : reconnu',
      '✓ Le potard LOW de droite : reconnu', '• Le potard MID de gauche : à l’écran', '✓ Le filtre de gauche : reconnu', '✓ Le bouton PLAY de droite : reconnu', '✓ Le bouton de l’effet : reconnu']);
    await page.locator('#regSave').click();
    await expect(page.locator('#reg')).toBeHidden();
    expect(await stocke(page, 'coach-table')).toEqual({ nom: AUTRE });
    expect(await stocke(page, 'coach-midi-map')).toEqual(REGLEE);
    await expect(page.locator('#midiPill')).toHaveText(AUTRE);
    await expect(page.locator('#midiPill')).toHaveClass(/\bon\b/);
    await expect(page.locator('#tableBar')).toBeHidden();
    // la table pilote maintenant le site : position de départ du swap, avec ses propres numéros
    await page.locator('.node').nth(5).click();
    await expect(page.locator('#setup')).toBeVisible();
    await expect(page.locator('#startBtn')).toBeDisabled();
    await envoyer(page, 0xB0, 3, 64); await envoyer(page, 0xB1, 3, 0);
    await expect(page.locator('#startBtn')).toBeEnabled();
    expect(erreurs).toEqual([]); await sansBandeau(page);
  });
  test('« Retour » fait réapprendre la commande d\'avant', async ({ page }) => {
    await ouvrir(page, { midi: { branchee: AUTRE } });
    await page.locator('#tbGo').click();
    await bouge(page, 0xB0, 8, [10, 20, 30]);
    await expect(page.locator('#regTitle')).toHaveText('Le fader de volume de droite');
    await page.locator('#regBack').click();
    await expect(page.locator('#regTitle')).toHaveText('Le fader de volume de gauche');
    await bouge(page, 0xB0, 9, [10, 20, 30]);
    await expect(page.locator('#regTitle')).toHaveText('Le fader de volume de droite');
    await bouge(page, 0xB0, 8, [10, 20, 30]);   // l'ancien numéro du fader A est libre : il est accepté
    await expect(page.locator('#regTitle')).toHaveText('Le potard LOW de gauche');
  });
  test('Échap annule : rien n\'est enregistré, le bandeau revient', async ({ page }) => {
    await ouvrir(page, { midi: { branchee: AUTRE } });
    await page.locator('#tbGo').click();
    await bouge(page, 0xB0, 8, [10, 20, 30]);
    await expect(page.locator('#regTitle')).toHaveText('Le fader de volume de droite');
    await page.keyboard.press('Escape');
    await expect(page.locator('#reg')).toBeHidden();
    expect(await stocke(page, 'coach-table')).toBeNull();
    expect(await stocke(page, 'coach-midi-map')).toBeNull();
    await expect(page.locator('#tableBar')).toBeVisible();
  });
  test('rien de reconnu : pas de bouton « Enregistrer »', async ({ page }) => {
    await ouvrir(page, { midi: { branchee: AUTRE } });
    await page.locator('#tbGo').click();
    for (let i = 0; i < 8; i++) await page.locator('#regSkip').click();
    await expect(page.locator('#regTitle')).toHaveText('Rien n’a été reconnu');
    await expect(page.locator('#regSave')).toBeHidden();
    await page.locator('#regBack').click();
    await expect(page.locator('#regTitle')).toHaveText('Le fader de volume de gauche');
  });
  test('depuis « Ma table » aussi', async ({ page }) => {
    await ouvrir(page, { onglet: 'table', midi: { branchee: AUTRE } });
    await expect(page.locator('#tKick')).toHaveText('Ta table');
    await expect(page.locator('#tState')).toContainText('Elle n\'est pas encore réglée');
    // pas de commande à apprendre une par une tant que la table n'est pas réglée
    await page.locator('#tSvg [data-c="faderA"]').click();
    await expect(page.locator('#tPanel .tmap')).toHaveText('Règle d\'abord ta table : clique sur « Régler ma table pas à pas », en bas de la page.');
    await expect(page.locator('#tLearn')).toHaveCount(0);
    await page.locator('#tReg').click();
    await expect(page.locator('#reg')).toBeVisible();
  });
  test('Windows ajoute « 2- » devant le nom : c\'est toujours la même table', async ({ page }) => {
    await ouvrir(page, { midi: { branchee: '2- ' + AUTRE }, stockage: DEJA_REGLEE });
    await expect(page.locator('#tableBar')).toBeHidden();
    await expect(page.locator('#midiPill')).toHaveClass(/\bon\b/);
  });
});

test.describe('Une autre table déjà réglée', () => {
  test('au rechargement : ses réglages seulement, sans ceux de la FLX4', async ({ page }) => {
    await ouvrir(page, { midi: { branchee: AUTRE }, stockage: DEJA_REGLEE });
    await expect(page.locator('#tableBar')).toBeHidden();
    await expect(page.locator('#midiPill')).toHaveClass(/\bon\b/);
    expect(await page.evaluate(() => map)).toEqual(REGLEE);
    await envoyer(page, 0xB0, 8, 0);
    expect(await page.evaluate(() => phys.faderA)).toBe(0);
  });
  test('une commande qu\'elle n\'a pas se fait à l\'écran et ne bloque pas « Jouer »', async ({ page }) => {
    const sansLowA = Object.assign({}, REGLEE); delete sansLowA.lowA;
    await ouvrir(page, { midi: { branchee: AUTRE }, stockage: { 'coach-table': S({ nom: AUTRE }), 'coach-midi-map': S(sansLowA) } });
    await page.locator('.node').nth(5).click();
    const etat = await miseEnPlace(page);
    expect(etat[0]).toContain('à l\'écran : ta table n\'en a pas');
    expect(etat[0].startsWith('ok')).toBe(true);
    await expect(page.locator('#setupList button.learn')).toHaveCount(0);
    await envoyer(page, 0xB1, 3, 0);
    await expect(page.locator('#startBtn')).toBeEnabled();
  });
  test('le bouton PLAY qui envoie un message de potard lance B', async ({ page }) => {
    await ouvrir(page, { midi: { branchee: AUTRE }, stockage: DEJA_REGLEE });
    await page.locator('.node').nth(0).click();
    await page.evaluate(() => { window.__lance = 0; launchB = () => { window.__lance++; }; });
    await bouge(page, 0xB1, 30, [127, 127, 0, 127]);   // deux appuis (127 répété = toujours le même appui)
    expect(await page.evaluate(() => window.__lance)).toBe(2);
  });
  test('« Ma table » : elle réagit, et propose de revenir aux réglages de la FLX4', async ({ page }) => {
    await ouvrir(page, { onglet: 'table', midi: { branchee: AUTRE }, stockage: DEJA_REGLEE });
    await expect(page.locator('#tState')).toContainText('(réglée pas à pas)');
    await bouge(page, 0xB1, 30, [127]);
    await expect(page.locator('#tPanel strong')).toHaveText('Bouton PLAY B');
    await expect(page.locator('#tPanel .tlive')).toHaveText('Appuyée !');
    await page.locator('#tSvg [data-c="midA"]').click();
    await expect(page.locator('#tPanel .tmap')).toContainText('Pas sur ta table');
    await expect(page.locator('#tReset')).toHaveText('Revenir aux réglages de la DDJ-FLX4');
    await page.locator('#tReset').click(); await page.locator('#tReset').click();
    expect(await stocke(page, 'coach-table')).toBeNull();
    await expect(page.locator('#tableBar')).toBeVisible();   // c'est de nouveau une table à régler
  });
  test('une DDJ-FLX4 branchée à la place : le bandeau propose de reprendre ses réglages', async ({ page }) => {
    await ouvrir(page, { midi: { branchee: true }, stockage: DEJA_REGLEE });
    await expect(page.locator('#tbText')).toContainText('Tu as branché une DDJ-FLX4');
    await expect(page.locator('#midiPill')).toHaveText('DDJ-FLX4 · à régler');
    await page.locator('#tbGo').click();
    await expect(page.locator('#tableBar')).toBeHidden();
    await expect(page.locator('#midiPill')).toHaveText('DDJ-FLX4');
    expect(await page.evaluate(() => map)).toEqual(PAR_DEFAUT);
    expect(await stocke(page, 'coach-table')).toBeNull();
    expect(await stocke(page, 'coach-midi-map')).toBeNull();
  });
  test('réglages enregistrés abîmés : une entrée en double ou invalide est simplement absente', async ({ page }) => {
    await ouvrir(page);
    const net = await page.evaluate(() => cleanMap({ faderA: { ch: 0, n: 8 }, lowA: { ch: 0, n: 8 }, faderB: 'x', playB: { ch: 1, n: 30, cc: true }, fxOn: { ch: 4, n: 71, cc: 'oui' } }, true));
    expect(net).toEqual({ playB: { ch: 1, n: 30, cc: true }, fxOn: { ch: 4, n: 71 } });
  });
  for (const v of ['{oops', S({ nom: 42 }), S({ nom: '' }), S([1])]) test(`« coach-table » abîmé (${v}) : la page charge, avec les réglages de la FLX4`, async ({ page }) => {
    const erreurs = await ouvrir(page, { midi: { branchee: true }, stockage: { 'coach-table': v } });
    expect(await page.evaluate(() => [tableCfg, map])).toEqual([null, PAR_DEFAUT]);
    await expect(page.locator('#tableBar')).toBeHidden();
    expect(erreurs).toEqual([]);
  });
  test('« Tout recommencer à zéro » garde la table réglée, et le rapport la nomme', async ({ page }) => {
    await ouvrir(page, { midi: { branchee: AUTRE }, stockage: Object.assign({ 'coach-parcours': 'debut' }, DEJA_REGLEE) });
    expect(await page.evaluate(() => avisRapport())).toContain(`table branchée : ${AUTRE} (réglée pas à pas)`);
    await page.locator('#avisBtn').click();
    await page.locator('.avreset summary').click();
    await page.locator('#avReset').click();
    await expect(page.locator('#homeChoice')).toBeVisible();
    expect(await stocke(page, 'coach-table')).toEqual({ nom: AUTRE });
    expect(await stocke(page, 'coach-midi-map')).toEqual(REGLEE);
  });
});

test.describe('Le schéma suit la table', () => {
  test('fiche : l\'aiguille du potard LOW dessiné tourne avec le vrai, et avec le curseur', async ({ page }) => {
    await ouvrir(page, { midi: { branchee: true }, stockage: { 'coach-fiches': null, 'coach-parcours': 'debut' } });
    await page.locator('.node').nth(5).click();
    await envoyer(page, 0xB0, 15, 64); await envoyer(page, 0xB1, 15, 0);
    await page.locator('#startBtn').click();
    await expect(page.locator('#onbTitle')).toHaveText('Le potard LOW : les basses');
    await envoyer(page, 0xB0, 15, 0);
    await expect(page.locator('#sv-lowA-n')).toHaveAttribute('transform', 'rotate(-135.0 266 114)');
    await envoyer(page, 0xB0, 15, 127);
    await expect(page.locator('#sv-lowA-n')).toHaveAttribute('transform', 'rotate(135.0 266 114)');
    await page.locator('#onbTry input').fill('0.5');
    await expect(page.locator('#sv-lowA-n')).toHaveAttribute('transform', 'rotate(0.0 266 114)');
  });
  test('« Régler ma table » : le fader dessiné suit le vrai, même déjà reconnu', async ({ page }) => {
    await ouvrir(page, { midi: { branchee: AUTRE } });
    await page.locator('#tbGo').click();
    const capA = page.locator('#rg-faderA rect').last(), capB = page.locator('#rg-faderB rect').last();
    await envoyer(page, 0xB0, 8, 0);
    await expect(capA).toHaveAttribute('y', '226.0');
    await envoyer(page, 0xB0, 8, 127);
    await expect(capA).toHaveAttribute('y', '176.0');
    await envoyer(page, 0xB0, 8, 50);
    await expect(page.locator('#regTitle')).toHaveText('Le fader de volume de droite');
    const avant = await capB.getAttribute('y');
    await envoyer(page, 0xB0, 8, 0);   // le fader A, déjà reconnu, bouge à sa place
    await expect(capA).toHaveAttribute('y', '226.0');
    expect(await capB.getAttribute('y')).toBe(avant);
  });
  test('« Ma table » : fader à sa vraie hauteur, repère du potard tourné', async ({ page }) => {
    await ouvrir(page, { onglet: 'table', midi: { branchee: true } });
    await envoyer(page, 0xB0, 19, 0);
    await expect(page.locator('#tSvg [data-c="faderA"] .cap')).toHaveAttribute('y', '384.0');
    await envoyer(page, 0xB0, 15, 127);
    await expect(page.locator('#tSvg [data-c="lowA"] .mk')).toHaveAttribute('transform', 'rotate(135.0 400 195)');
  });
});
