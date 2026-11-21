// Lot 73 « Ta table, dès le début » : aux Premiers pas, sur un ordinateur, la table branchée est testée (reconnue) ou réglée
// (inconnue) avant le premier exercice ; la liste dit ce qui attend chaque table ; une table réglée à la main règle, juste avant
// un niveau, les boutons qui lui manquent ; à l'arrivée sur l'ordinateur par le lien, une table inconnue se règle aussi.
const { test, expect } = require('@playwright/test');
const { ouvrir, envoyer, sansBandeau } = require('./outils');

const NOUVEAU = { 'coach-guide-vu': null, 'coach-fiches': null, 'coach-accueil': null };
const AUTRE = 'Controleur Mystere X1';
const S = o => JSON.stringify(o);
const stocke = (page, k) => page.evaluate(c => JSON.parse(localStorage.getItem(c)), k);
const choix = (page, i) => page.locator('#ppOpts .pp-opt').nth(i).click();
const suite = page => page.locator('#ppGo').click();
const FAUX_UMAMI = 'window.__stats = []; window.umami = { track(n, d){ window.__stats.push(d === undefined ? [n] : [n, d]); } };';
// Jusqu'à l'écran de la table : bonjour, niveau Grand débutant, « Ton oreille » passée
async function ecranTable(page) {
  await suite(page); await choix(page, 0); await suite(page); await page.locator('#ppOrPasse').click();
  await expect(page.locator('#ppAsk')).not.toHaveText(/^Ton oreille/);
}
// Un fader ou un potard qu'on bouge d'un bout à l'autre ; un bouton qu'on appuie puis relâche
async function bouger(page, canal, numero, valeurs = [10, 40, 75, 110, 60]) { for (const v of valeurs) await envoyer(page, 0xB0 | canal, numero, v); }
async function appuyer(page, canal, note) { await envoyer(page, 0x90 | canal, note, 127); await envoyer(page, 0x80 | canal, note, 0); }

test.describe('Ta table, dès le début : aux Premiers pas', () => {
  test('table reconnue : « Continuer » attend le test du fader de gauche, et le dessin suit la table', async ({ page }) => {
    const erreurs = await ouvrir(page, { onglet: '', stockage: NOUVEAU, midi: { branchee: true } });
    await ecranTable(page);
    await expect(page.locator('#ppOpts .pp-big')).toContainText('Branchée et reconnue');
    await expect(page.locator('#ppTestT')).toHaveText('Bouge le fader de gauche');
    await expect(page.locator('#ppAsk')).toHaveText('Je la reconnais : ta Pioneer DDJ-FLX4 ! Bouge le fader de gauche, pour voir.');
    await expect(page.locator('#ppTestLien')).toHaveText('Le dessin ne bouge pas ?');
    await expect(page.locator('#ppGo')).toBeDisabled();
    // le fader de droite bouge sur le dessin, mais ne fait pas le test ; PLAY de B ne lance rien pendant le test
    const capB = () => page.locator('#pt-faderB rect').last().getAttribute('y');
    const avant = await capB();
    await bouger(page, 1, 19);
    await expect.poll(capB).not.toBe(avant);
    await page.evaluate(() => { window.__lance = 0; launchB = () => { window.__lance++; }; });
    await appuyer(page, 1, 11);
    expect(await page.evaluate(() => window.__lance)).toBe(0);
    await expect(page.locator('#ppGo')).toBeDisabled();
    // le fader de gauche fait la moitié de sa course : c'est bon
    await bouger(page, 0, 19, [5, 40]);
    await expect(page.locator('#ppGo')).toBeDisabled();
    // gardien du lot 73 : un bouton que ses réglages ne connaissent pas (le filtre de la FLX4) ne fait pas croire à une panne,
    // puisque le fader de gauche a déjà répondu
    await bouger(page, 6, 23, [0, 20, 40, 60, 80, 100, 127]);
    expect(await page.evaluate(() => ppT.indice)).toBe(false);
    await bouger(page, 0, 19, [90]);
    await expect(page.locator('#ppTestT')).toHaveText('Ta table répond !');
    // la position du fader est retenue : au premier exercice, la table est déjà « en place »
    expect(await page.evaluate(() => phys.faderA)).toBeCloseTo(90 / 127, 3);
    await expect(page.locator('#ppAsk')).toHaveText('Je l’ai vu bouger : ta table et moi, on se parle !');
    await expect(page.locator('#ppTestLien')).toBeHidden();
    await expect(page.locator('#ppGo')).toBeEnabled();
    await suite(page);
    await expect(page.locator('#ppAsk')).toHaveText('Combien de temps par jour pour t’entraîner ?');
    // en revenant, le test reste fait
    await page.locator('#ppBack').click();
    await expect(page.locator('#ppTestT')).toHaveText('Ta table répond !');
    await expect(page.locator('#ppGo')).toBeEnabled();
    expect(erreurs).toEqual([]); await sansBandeau(page);
  });

  test('table reconnue dont le fader ne répond pas : on règle ce bouton-là, et lui seul', async ({ page }) => {
    const erreurs = await ouvrir(page, { onglet: '', stockage: NOUVEAU, midi: { branchee: true } });
    await ecranTable(page);
    // la table envoie un numéro que ses réglages ne connaissent pas : Vini propose « Le dessin ne bouge pas ? »
    await bouger(page, 0, 70, [0, 20, 40, 60, 80, 100, 127]);
    await expect(page.locator('#ppAsk')).toHaveText('Ce bouton-là, je ne le connais pas encore. Si c’est ton fader de gauche, clique sur « Le dessin ne bouge pas ? ».');
    await page.locator('#ppTestLien').click();
    await expect(page.locator('#ppAsk')).toHaveText(/pas ceux que j’attendais/);
    await expect(page.locator('#ppTestT')).toHaveText('Le fader de volume de gauche');
    await expect(page.locator('#ppTestLien')).toHaveText('Je n’ai pas ce bouton');
    // une commande déjà réglée (le LOW de gauche de la FLX4) est refusée
    await bouger(page, 0, 15);
    await expect(page.locator('#ppTestEtat')).toContainText('Ça, c’est le potard LOW de gauche, déjà réglé');
    await bouger(page, 0, 70);
    await expect(page.locator('#ppTestT')).toHaveText('Ta table répond !');
    await expect(page.locator('#ppGo')).toBeEnabled();
    const m = await stocke(page, 'coach-midi-map');
    expect(m.faderA).toEqual({ ch: 0, n: 70 });
    expect(m.lowA).toEqual({ ch: 0, n: 15 });   // les autres réglages de la FLX4 ne bougent pas
    expect(await stocke(page, 'coach-table')).toBeNull();   // la FLX4 reste la FLX4
    expect(await stocke(page, 'coach-tables')).toMatchObject({ flx4: { faderA: { ch: 0, n: 70 } } });
    expect(erreurs).toEqual([]); await sansBandeau(page);
  });

  test('table reconnue muette : Vini dit de fermer rekordbox ; au premier signal, le test reprend', async ({ page }) => {
    const erreurs = await ouvrir(page, { onglet: '', stockage: NOUVEAU, midi: { branchee: true } });
    await ecranTable(page);
    await expect(page.locator('#ppAsk')).toHaveText('Tu as bougé le fader ? Rien ne m’arrive de ta table. Si rekordbox (ou un autre logiciel de DJ) est ouvert, ferme-le, puis débranche ta table et rebranche-la.', { timeout: 20000 });
    await expect(page.locator('#ppTestEtat')).toHaveText('Rien ne m’arrive de ta table pour l’instant.');
    // « Le dessin ne bouge pas ? » alors que rien n'est arrivé : Vini ne parle pas de signaux (gardien du lot 73)
    await page.locator('#ppTestLien').click();
    await expect(page.locator('#ppAsk')).toHaveText('On règle ce bouton ensemble : bouge le fader de gauche sur ta table.');
    await bouger(page, 0, 19);   // le fader répond : le réglage le reconnaît, et le test est fait
    await expect(page.locator('#ppTestT')).toHaveText('Ta table répond !');
    await expect(page.locator('#ppGo')).toBeEnabled();
    expect(erreurs).toEqual([]); await sansBandeau(page);
  });
  test('table reconnue : « Je n’ai pas ce bouton » ne promet pas l’écran, il donne l’issue de secours', async ({ page }) => {
    const erreurs = await ouvrir(page, { onglet: '', stockage: NOUVEAU, midi: { branchee: true } });
    await ecranTable(page);
    await page.locator('#ppTestLien').click();   // « Le dessin ne bouge pas ? »
    await expect(page.locator('#ppTestLien')).toHaveText('Je n’ai pas ce bouton');
    await page.locator('#ppTestLien').click();
    await expect(page.locator('#ppTestT')).toHaveText('On verra ça dans les exercices');
    await expect(page.locator('#ppTestS')).toContainText('« Je joue à la souris cette fois »');
    await expect(page.locator('#ppGo')).toBeEnabled();
    expect(await page.evaluate(() => map.faderA)).toEqual({ ch: 0, n: 19 });   // les réglages de la FLX4 n'ont pas changé
    expect(erreurs).toEqual([]); await sansBandeau(page);
  });

  // gardien du lot 73 : sur un portable de 768 px, la page n'a qu'environ 650 px ; « Continuer », collé en bas, cachait le texte
  // d'état, le lien de secours et le bas du dessin
  for (const [nom, branchee] of [['DDJ-FLX4', true], ['table inconnue', AUTRE]]) test(`écran bas (1366 × 650) : l’état, le lien et le dessin restent au-dessus de « Continuer » (${nom})`, async ({ page }) => {
    await page.setViewportSize({ width: 1366, height: 650 });
    const erreurs = await ouvrir(page, { onglet: '', stockage: NOUVEAU, midi: { branchee } });
    await ecranTable(page);
    await expect(page.locator('#ppTestEtat')).toBeVisible();
    await expect(page.locator('#ppTestLien')).toBeVisible();
    const r = await page.evaluate(() => { const bas = id => $(id).getBoundingClientRect().bottom;
      return { go: $('ppGo').getBoundingClientRect().top, etat: bas('ppTestEtat'), lien: bas('ppTestLien'), svg: bas('ppTestSvg') }; });
    expect(r.etat).toBeLessThanOrEqual(r.go);
    expect(r.lien).toBeLessThanOrEqual(r.go);
    expect(r.svg).toBeLessThanOrEqual(r.go);
    expect(erreurs).toEqual([]);
  });

  test('table inconnue : ses 3 premiers boutons, réglés tout de suite', async ({ page }) => {
    const erreurs = await ouvrir(page, { onglet: '', stockage: NOUVEAU, midi: { branchee: AUTRE } });
    await ecranTable(page);
    await expect(page.locator('#ppAsk')).toHaveText('Je vois ta table, mais je ne la connais pas encore. On règle ses 3 premiers boutons : 30 secondes !');
    await expect(page.locator('#ppOpts .pp-big')).toContainText('je ne la connais pas encore');
    await expect(page.locator('#ppTestN')).toHaveText('1 sur 3');
    await expect(page.locator('#ppTestT')).toHaveText('Le fader de volume de gauche');
    await expect(page.locator('#pt-faderA rect').first()).toHaveClass(/hl/);
    await expect(page.locator('#ppGo')).toBeDisabled();
    await bouger(page, 0, 7);
    await expect(page.locator('#ppTestN')).toHaveText('2 sur 3');
    await expect(page.locator('#ppAsk')).toHaveText('Bien ! Maintenant, le fader de droite.');
    // le même fader une deuxième fois : refusé
    await bouger(page, 0, 7);
    await expect(page.locator('#ppTestEtat')).toContainText('Ça, c’est le fader de volume de gauche, déjà reconnu');
    await bouger(page, 0, 8);
    await expect(page.locator('#ppTestN')).toHaveText('3 sur 3');
    await expect(page.locator('#ppTestEtat')).toHaveText('J’attends que tu appuies dessus sur ta table…');
    await appuyer(page, 0, 40);
    await expect(page.locator('#ppTestT')).toHaveText('C’est réglé !');
    await expect(page.locator('#ppAsk')).toHaveText('C’est réglé ! Tes 3 premiers exercices marcheront avec ta table.');
    await expect(page.locator('#ppOpts .pp-big')).toContainText('Branchée · réglée');
    await expect(page.locator('#ppGo')).toBeEnabled();
    expect(await stocke(page, 'coach-table')).toEqual({ nom: AUTRE });
    expect(await stocke(page, 'coach-midi-map')).toEqual({ faderA: { ch: 0, n: 7 }, faderB: { ch: 0, n: 8 }, playB: { ch: 0, n: 40 } });
    await expect(page.locator('#midiPill')).toHaveText(AUTRE);   // plus « à régler »
    expect(erreurs).toEqual([]); await sansBandeau(page);
  });

  test('table inconnue : « Je n’ai pas ce bouton » trois fois, on continue à la souris ; une seule fois, il se fera à l’écran', async ({ page }) => {
    await ouvrir(page, { onglet: '', stockage: NOUVEAU, midi: { branchee: AUTRE } });
    await ecranTable(page);
    for (const t of ['1 sur 3', '2 sur 3', '3 sur 3']) { await expect(page.locator('#ppTestN')).toHaveText(t); await page.locator('#ppTestLien').click(); }
    await expect(page.locator('#ppTestT')).toHaveText('On la réglera plus tard');
    await expect(page.locator('#ppGo')).toBeEnabled();
    expect(await stocke(page, 'coach-table')).toBeNull();
    // une autre fois : le PLAY passé se fera à l'écran (coach-table.ecran), les deux faders sont réglés
    await page.evaluate(() => { window.__midi.debrancher(); });
    await page.evaluate(n => window.__midi.brancher(n), AUTRE);
    await expect(page.locator('#ppTestN')).toHaveText('1 sur 3');
    await bouger(page, 0, 7);
    await expect(page.locator('#ppTestN')).toHaveText('2 sur 3');
    await bouger(page, 0, 8);
    await expect(page.locator('#ppTestN')).toHaveText('3 sur 3');
    await page.locator('#ppTestLien').click();
    await expect(page.locator('#ppTestT')).toHaveText('C’est réglé !');
    expect(await stocke(page, 'coach-table')).toEqual({ nom: AUTRE, ecran: ['playB'] });
  });

  test('« J’ai une table » sans table vue : l’aide est ouverte, avec l’XDJ-RR, la Traktor et « Réessayer »', async ({ page }) => {
    const erreurs = await ouvrir(page, { onglet: '', stockage: NOUVEAU, midi: { branchee: false } });
    await ecranTable(page);
    await choix(page, 0);
    await expect(page.locator('#ppAide')).toBeVisible();
    await expect(page.locator('#ppAide')).toHaveAttribute('open', '');
    await expect(page.locator('#ppAide')).toContainText('XDJ-RR');
    await expect(page.locator('#ppAide')).toContainText('bouton FLX de gauche');
    await expect(page.locator('#ppAide button', { hasText: 'Réessayer' })).toBeVisible();
    await page.locator('#ppAide button', { hasText: 'Réessayer' }).click();
    await expect(page.locator('#ppAide')).toBeVisible();
    // la table arrive : le test commence
    await page.evaluate(() => window.__midi.brancher());
    await expect(page.locator('#ppTestT')).toHaveText('Bouge le fader de gauche');
    expect(erreurs).toEqual([]); await sansBandeau(page);
  });

  test('la liste dit ce qui attend chaque table ; « Une autre table » demande laquelle', async ({ page }) => {
    const erreurs = await ouvrir(page, { onglet: '', stockage: NOUVEAU, midi: { branchee: false }, avant: FAUX_UMAMI });
    await ecranTable(page);
    await choix(page, 0);
    expect(await page.locator('#ppModele optgroup').evaluateAll(g => g.map(x => x.label))).toEqual(['Hercules', 'Native Instruments', 'Numark', 'Pioneer', 'Reloop', 'Roland']);
    expect(await page.locator('#ppModele optgroup[label="Pioneer"] option').allTextContents()).toEqual(['Pioneer DDJ-200', 'Pioneer DDJ-400', 'Pioneer DDJ-FLX2',
      'Pioneer DDJ-FLX4', 'Pioneer DDJ-FLX6', 'Pioneer DDJ-FLX10', 'Pioneer DDJ-REV1', 'Pioneer DDJ-SB3', 'Pioneer XDJ-AZ', 'Pioneer XDJ-RR', 'Pioneer XDJ-RX3']);
    await expect(page.locator('#ppStatut')).toBeHidden();
    await page.locator('#ppModele').selectOption('flx4');
    await expect(page.locator('#ppStatut')).toContainText('Reconnue toute seule');
    await page.locator('#ppModele').selectOption('ddjflx2');
    await expect(page.locator('#ppStatut')).toContainText('30 secondes de réglage');
    await expect(page.locator('#ppAsk')).toHaveText('La Pioneer DDJ-FLX2 ! Je ne la connais pas encore : quand tu la brancheras, on la réglera ensemble, en 30 secondes.');
    await page.locator('#ppModele').selectOption('xdjaz');
    await expect(page.locator('#ppStatut')).toContainText('mode ordinateur');
    await page.locator('#ppModele').selectOption('traktors2mk3');
    await expect(page.locator('#ppStatut')).toContainText('bouton FLX de gauche');
    await expect(page.locator('#ppAsk')).toHaveText('La Traktor Kontrol S2 MK3 ! Branche-la en mode MIDI, et on la réglera ensemble.');
    await page.locator('#ppModele').selectOption('traktors4mk3');
    await expect(page.locator('#ppStatut')).toContainText('Pas encore compatible');
    await expect(page.locator('#ppAsk')).toHaveText('Ah, la Traktor Kontrol S4 MK3… Je ne sais pas encore lui parler.');
    await expect(page.locator('#ppAide')).toBeHidden();   // pas d'aide « je ne la vois pas » pour une table qui ne peut pas être vue
    await expect(page.locator('#ppAutreNom')).toBeHidden();
    await page.locator('#ppModele').selectOption('autre');
    await expect(page.locator('#ppAutreNom')).toBeVisible();
    await expect(page.locator('#ppStatut')).toContainText('Dis-moi laquelle');
    await expect(page.locator('#ppAide')).toBeVisible();
    await page.locator('#ppAutreNom').fill('Denon <MC7000>');
    await suite(page); await choix(page, 1); await suite(page);   // le temps par jour, puis « Voir mon plan »
    await expect.poll(() => stocke(page, 'coach-accueil')).toMatchObject({ table: 'table', modele: 'autre', autre: 'Denon MC7000' });
    expect(await page.evaluate(() => window.__stats)).toContainEqual(['table-choisie', { table: 'autre : Denon MC7000', statut: 'autre' }]);
    expect(await page.evaluate(() => ppResume())).toContain('une table (pas dans la liste : Denon MC7000)');
    expect(erreurs).toEqual([]); await sansBandeau(page);
  });

  test('sur un téléphone : pas de test, la liste dit ce qui l’attend sur l’ordinateur', async ({ browser }) => {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true }), page = await ctx.newPage();
    const erreurs = await ouvrir(page, { onglet: '', stockage: NOUVEAU, midi: { branchee: false } });
    await ecranTable(page);
    await choix(page, 0);
    await page.locator('#ppModele').selectOption('ddjflx2');
    await expect(page.locator('#ppStatut')).toContainText('30 secondes de réglage sur ton ordi');
    await expect(page.locator('#ppAsk')).toHaveText('La Pioneer DDJ-FLX2 ! On la réglera ensemble sur ton ordinateur : 30 secondes.');
    await expect(page.locator('#ppTest')).toHaveCount(0);
    await expect(page.locator('#ppGo')).toBeEnabled();
    expect(erreurs).toEqual([]);
    await ctx.close();
  });
});

test.describe('Ta table, dès le début : juste avant un niveau', () => {
  const REGLEE3 = { faderA: { ch: 0, n: 7 }, faderB: { ch: 0, n: 8 }, playB: { ch: 0, n: 40 } };
  test('table réglée à la main : les boutons du niveau qu’elle n’a pas encore montrés, puis on joue', async ({ page }) => {
    const erreurs = await ouvrir(page, { midi: { branchee: AUTRE }, stockage: { 'coach-table': S({ nom: AUTRE }), 'coach-midi-map': S(REGLEE3) } });
    await page.locator('.node').nth(5).click();   // niveau 6 : le swap des basses (les deux LOW)
    // gardien du lot 73 : la position de départ ne dit plus « ta table n'en a pas » pour un bouton qui va être réglé
    await expect(page.locator('#setupList')).toContainText('tu le régleras en cliquant sur « Jouer »');
    await expect(page.locator('#setupList')).not.toContainText('ta table n\'en a pas');
    await page.locator('#startBtn').click();
    await expect(page.locator('#reg')).toBeVisible();
    await expect(page.locator('#regKick')).toHaveText('Avant de jouer · 1 sur 2');
    await expect(page.locator('#regTitle')).toHaveText('Le potard LOW de gauche');
    await expect(page.locator('#regText')).toContainText('Ce niveau se sert d’un bouton que ta table ne m’a pas encore montré');
    // un bouton déjà réglé (le fader de gauche) est refusé
    await bouger(page, 0, 7);
    await expect(page.locator('#regState')).toContainText('Ça, c’est le fader de volume de gauche, déjà réglé');
    await bouger(page, 0, 9);
    await expect(page.locator('#regTitle')).toHaveText('Le potard LOW de droite');
    await bouger(page, 0, 10);
    await expect(page.locator('#regTitle')).toHaveText('C’est réglé !');
    await expect(page.locator('#regSave')).toHaveText('Jouer');
    await page.locator('#regSave').click();
    await expect(page.locator('#reg')).toBeHidden();
    expect(await stocke(page, 'coach-midi-map')).toEqual(Object.assign({ lowA: { ch: 0, n: 9 }, lowB: { ch: 0, n: 10 } }, REGLEE3));
    expect(await stocke(page, 'coach-table')).toEqual({ nom: AUTRE });
    // les LOW sont maintenant sur la table : la position de départ les attend, puis on joue sans rien redemander
    await envoyer(page, 0xB0, 9, 64); await envoyer(page, 0xB0, 10, 0);
    await expect(page.locator('#startBtn')).toBeEnabled();
    await page.locator('#startBtn').click();
    await expect(page.locator('#startBtn')).toHaveText('Arrêter', { timeout: 60000 });
    await expect(page.locator('#reg')).toBeHidden();
    expect(erreurs).toEqual([]); await sansBandeau(page);
  });
  test('« Avant de jouer » : le bouton réglé, la partie part sans remettre la table en place', async ({ page }) => {
    const erreurs = await ouvrir(page, { midi: { branchee: AUTRE }, stockage: { 'coach-table': S({ nom: AUTRE }), 'coach-midi-map': S(REGLEE3) } });
    await page.locator('.node').nth(3).click();   // niveau 4 : l'écho out (le bouton de l'effet)
    await envoyer(page, 0xB0, 7, 127);   // le fader de gauche en haut : en place
    await expect(page.locator('#startBtn')).toBeEnabled();
    await page.locator('#startBtn').click();
    await expect(page.locator('#regKick')).toHaveText('Avant de jouer · 1 sur 1');
    await appuyer(page, 0, 50);
    await expect(page.locator('#regSave')).toHaveText('Jouer');
    await page.locator('#regSave').click();
    await expect(page.locator('#startBtn')).toHaveText('Arrêter', { timeout: 60000 });
    expect(await page.evaluate(() => phys.faderA)).toBe(1);   // la position du fader n'a pas été oubliée
    expect(erreurs).toEqual([]); await sansBandeau(page);
  });
  test('« Je n’ai pas cette commande » : ils se feront à l’écran, et le site ne les redemande plus', async ({ page }) => {
    await ouvrir(page, { midi: { branchee: AUTRE }, stockage: { 'coach-table': S({ nom: AUTRE }), 'coach-midi-map': S(REGLEE3) } });
    await page.locator('.node').nth(5).click();
    await page.locator('#startBtn').click();
    await page.locator('#regSkip').click(); await page.locator('#regSkip').click();
    await expect(page.locator('#regTitle')).toHaveText('Ces boutons se feront à l’écran');
    await expect(page.locator('#regSave')).toBeVisible();
    await page.locator('#regSave').click();
    await expect(page.locator('#startBtn')).toHaveText('Arrêter', { timeout: 60000 });
    expect(await stocke(page, 'coach-table')).toEqual({ nom: AUTRE, ecran: ['lowA', 'lowB'] });
    await page.locator('#startBtn').click();   // on arrête, puis on rejoue : plus de question
    await page.locator('#startBtn').click();
    await expect(page.locator('#startBtn')).toHaveText('Arrêter', { timeout: 60000 });
    await expect(page.locator('#reg')).toBeHidden();
  });
  test('ni la FLX4 ni une table qui a sa fiche ne règlent rien avant de jouer ; la croix annule sans jouer', async ({ page }) => {
    await ouvrir(page, { midi: { branchee: AUTRE }, stockage: { 'coach-table': S({ nom: AUTRE }), 'coach-midi-map': S(REGLEE3) } });
    await page.locator('.node').nth(5).click();
    await page.locator('#startBtn').click();
    await expect(page.locator('#reg')).toBeVisible();
    await page.locator('#regClose').click();
    await expect(page.locator('#reg')).toBeHidden();
    await expect(page.locator('#startBtn')).toHaveText('Jouer');
    expect(await page.evaluate(() => regManque(LESSONS[li]))).toEqual(['lowA', 'lowB']);
    // la même page avec une FLX4 : rien à régler
    expect(await page.evaluate(() => { tableCfg = null; return regManque(LESSONS[li]); })).toEqual([]);
  });
});

test.describe('Ta table, dès le début : arrivée sur l’ordinateur par le lien', () => {
  test('une table inconnue se règle (ses 3 premiers boutons) avant d’aller jouer', async ({ page }) => {
    const erreurs = await ouvrir(page, { onglet: 'accueil', midi: { branchee: AUTRE }, stockage: { 'coach-parcours': 'debut' } });
    await page.evaluate(() => ordiBienvenue());
    await expect(page.locator('#ordi')).toBeVisible();
    await expect(page.locator('#ordiEtapes')).toContainText('À régler : 30 secondes');
    await page.locator('#ordiGo').click();
    await expect(page.locator('#reg')).toBeVisible();
    await expect(page.locator('#regKick')).toHaveText('Régler ma table · 1 sur 3');
    await bouger(page, 0, 7);
    await expect(page.locator('#regKick')).toHaveText('Régler ma table · 2 sur 3');
    await bouger(page, 0, 8);
    await expect(page.locator('#regKick')).toHaveText('Régler ma table · 3 sur 3');
    await appuyer(page, 0, 40);
    await expect(page.locator('#regTitle')).toHaveText('Ta table est prête');
    await expect(page.locator('#regText')).toContainText('juste avant l’exercice qui s’en sert');
    await expect(page.locator('#regSave')).toHaveText('C’est parti');
    await page.locator('#regSave').click();
    await expect(page.locator('#reg')).toBeHidden();
    await expect(page.locator('#ordi')).toBeHidden();
    expect(await stocke(page, 'coach-table')).toEqual({ nom: AUTRE });
    expect(erreurs).toEqual([]); await sansBandeau(page);
  });
  test('rien de reconnu : « Continuer à la souris », et « C’est parti » ne rouvre plus le réglage', async ({ page }) => {
    const erreurs = await ouvrir(page, { onglet: 'accueil', midi: { branchee: AUTRE }, stockage: { 'coach-parcours': 'debut' } });
    await page.evaluate(() => ordiBienvenue());
    await page.locator('#ordiGo').click();
    for (let i = 0; i < 3; i++) await page.locator('#regSkip').click();
    await expect(page.locator('#regTitle')).toHaveText('Rien n’a été reconnu');
    await expect(page.locator('#regSave')).toHaveText('Continuer à la souris');
    await page.locator('#regSave').click();
    await expect(page.locator('#reg')).toBeHidden();
    await expect(page.locator('#ordi')).toBeHidden();
    expect(await stocke(page, 'coach-table')).toBeNull();   // rien d'enregistré : elle reste à régler
    // la carte rouverte : « C'est parti » continue sans rouvrir le réglage
    await page.evaluate(() => ordiBienvenue());
    await page.locator('#ordiGo').click();
    await expect(page.locator('#ordi')).toBeHidden();
    await expect(page.locator('#reg')).toBeHidden();
    expect(erreurs).toEqual([]); await sansBandeau(page);
  });
});

// Le site en anglais (lot 80, en ligne le 21 nov.) : tout ce que le lot 73 ajoute doit être traduit. window.__enManque liste
// ce qu'un écran anglais a laissé en français ; le nom d'une table inconnue (AUTRE) est un nom, il reste tel quel.
test.describe('Ta table, dès le début : en anglais', () => {
  const EN = { ...NOUVEAU, 'coach-langue': 'en' };
  const manque = page => page.evaluate(nom => [...window.__enManque].filter(s => !s.includes(nom)), AUTRE);
  test('table reconnue : le test du fader de gauche, en anglais', async ({ page }) => {
    const erreurs = await ouvrir(page, { onglet: '', stockage: EN, midi: { branchee: true } });
    await ecranTable(page);
    await expect(page.locator('#ppTestT')).toHaveText('Move the left fader');
    await expect(page.locator('#ppAsk')).toHaveText("I recognize it: your Pioneer DDJ-FLX4! Move the left fader, let's see.");
    await expect(page.locator('#ppTestLien')).toHaveText("The drawing doesn't move?");
    await bouger(page, 0, 19, [5, 40, 90]);
    await expect(page.locator('#ppTestT')).toHaveText('Your controller responds!');
    await expect(page.locator('#ppAsk')).toHaveText('I saw it move: your controller and I are talking!');
    expect(await manque(page)).toEqual([]);
    expect(erreurs).toEqual([]); await sansBandeau(page);
  });

  test('table inconnue : ses 3 premiers boutons, en anglais', async ({ page }) => {
    const erreurs = await ouvrir(page, { onglet: '', stockage: EN, midi: { branchee: AUTRE } });
    await ecranTable(page);
    await expect(page.locator('#ppAsk')).toHaveText("I can see your controller, but I don't know it yet. Let's set up its first 3 buttons: 30 seconds!");
    await expect(page.locator('#ppTestN')).toHaveText('1 of 3');
    await expect(page.locator('#ppTestT')).toHaveText('The left volume fader');
    await expect(page.locator('#ppTestLien')).toHaveText("I don't have this button");
    await bouger(page, 0, 7);
    await expect(page.locator('#ppAsk')).toHaveText('Nice! Now, the right fader.');
    await bouger(page, 0, 8);
    await expect(page.locator('#ppAsk')).toHaveText('Last button: the right PLAY.');
    await appuyer(page, 0, 40);
    await expect(page.locator('#ppTestT')).toHaveText('All set!');
    await expect(page.locator('#ppTestS')).toHaveText("Your first 3 exercises will work with your controller. I'll have you set up the other buttons right before the exercise that uses them.");
    expect(await manque(page)).toEqual([]);
    expect(erreurs).toEqual([]); await sansBandeau(page);
  });

  test('la liste : ce qui attend chaque table, et « Une autre table », en anglais', async ({ page }) => {
    const erreurs = await ouvrir(page, { onglet: '', stockage: EN, midi: { branchee: false } });
    await ecranTable(page);
    await choix(page, 0);
    for (const [id, titre] of [['ddjflx2', '30 seconds of setup'], ['traktors2mk3', 'Its MIDI mode, then 30 seconds of setup'], ['traktors4mk3', 'Not compatible yet'], ['xdjrr', 'Recognized on its own'], ['autre', "I'll guide you through setting it up"]]){
      await page.locator('#ppModele').selectOption(id);
      await expect(page.locator('#ppStatut')).toContainText(titre);
    }
    await expect(page.locator('#ppAutreNom')).toHaveAttribute('placeholder', 'Its brand and model, for example Denon MC7000');
    await expect(page.locator('#ppAutreNom')).toHaveAttribute('aria-label', "Your controller's brand and model");
    expect(await manque(page)).toEqual([]);
    expect(erreurs).toEqual([]); await sansBandeau(page);
  });

  test('« Avant de jouer » et la position de départ, en anglais', async ({ page }) => {
    const erreurs = await ouvrir(page, { midi: { branchee: AUTRE }, stockage: { 'coach-langue': 'en', 'coach-table': S({ nom: AUTRE }), 'coach-midi-map': S({ faderA: { ch: 0, n: 7 }, faderB: { ch: 0, n: 8 }, playB: { ch: 0, n: 40 } }) } });
    await page.locator('.node').nth(5).click();   // niveau 6 : le swap des basses (les deux LOW, pas encore montrés)
    await expect(page.locator('#setupList')).toContainText(`you'll set it up when you click "Play"`);
    await page.locator('#startBtn').click();
    await expect(page.locator('#regKick')).toHaveText('Before you play · 1 of 2');
    await expect(page.locator('#regTitle')).toHaveText('The left LOW knob');
    await expect(page.locator('#regText')).toHaveText(/^This level uses a button your controller hasn't shown me yet\. Turn deck A's bass knob\./);
    await bouger(page, 0, 7);   // le fader de gauche, déjà réglé : refusé
    await expect(page.locator('#regState')).toContainText("That's the left volume fader, already set up. Move the left LOW knob instead.");
    await bouger(page, 0, 20);
    await expect(page.locator('#regKick')).toHaveText('Before you play · 2 of 2');
    await page.locator('#regSkip').click();   // « Je n'ai pas cette commande »
    await expect(page.locator('#regTitle')).toHaveText('All set!');
    await expect(page.locator('#regText')).toHaveText("Got it for your controller. Whatever's missing will be done on screen, with the mouse. Something wrong? \"Copy the report\", and send it to us: we'll see what your controller sends.");
    expect(await manque(page)).toEqual([]);
    expect(erreurs).toEqual([]); await sansBandeau(page);
  });

});
