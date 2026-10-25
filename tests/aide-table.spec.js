// Lot 45 : « Ta table n'apparaît pas ? ». Deux joueurs ne voyaient pas leur table (DDJ-FLX2, XDJ-AZ) et le site ne disait
// pas pourquoi. La pastille du haut, « Ma table », l'écran de la table des Premiers pas et le rapport des testeurs disent
// maintenant ce que le navigateur a répondu : pas de Web MIDI, question en attente, accès refusé, ou aucune table vue.
const { test, expect } = require('@playwright/test');
const { ouvrir, sansBandeau } = require('./outils');

const NOUVEAU = { 'coach-guide-vu': null, 'coach-fiches': null, 'coach-accueil': null };
const SANS_MIDI = 'try { Object.defineProperty(Navigator.prototype, "requestMIDIAccess", { value: undefined, configurable: true }); } catch (e) {}';
// Jusqu'à l'écran de la table des Premiers pas (Grand débutant)
async function ecranTable(page) {
  await page.locator('#ppGo').click();
  await page.locator('#ppOpts .pp-opt').nth(0).click(); await page.locator('#ppGo').click();
  await expect(page.locator('#ppOpts .pp-opt')).toHaveCount(2);
}

test.describe('Ma table : pourquoi la table n\'apparaît pas', () => {
  test('aucune table vue : l\'aide est ouverte, puis se replie quand la table arrive', async ({ page }) => {
    const erreurs = await ouvrir(page, { onglet: 'table', midi: { branchee: false } });
    await expect(page.locator('#midiPill')).toHaveText('Souris (aucune table vue)');
    await expect(page.locator('#tAide')).toHaveAttribute('open', '');
    await expect(page.locator('#tAideSum')).toHaveText('Ta table n’apparaît pas ?');
    await expect(page.locator('#tAideBody li')).toHaveCount(4);
    await expect(page.locator('#tAideBody')).toContainText('Ferme rekordbox');
    await expect(page.locator('#tAideBody')).toContainText('SOFTWARE CONTROL');
    await expect(page.locator('#tAideBody')).toContainText('pilote');
    // une DDJ-FLX2 branchée : le site la voit, propose de la régler, et l'aide devient « ne réagit pas ? », repliée
    await page.evaluate(() => window.__midi.brancher('DDJ-FLX2'));
    await expect(page.locator('#midiPill')).toHaveText('DDJ-FLX2 · à régler');
    await expect(page.locator('#tableBar')).toContainText('DDJ-FLX2');
    await expect(page.locator('#tAideSum')).toHaveText('Ta table ne réagit pas ?');
    await expect(page.locator('#tAide')).not.toHaveAttribute('open', '');
    expect(erreurs).toEqual([]); await sansBandeau(page);
  });
  test('accès refusé : la marche à suivre, et « Réessayer » redemande', async ({ page }) => {
    const erreurs = await ouvrir(page, { onglet: 'table', midi: { refuse: true } });
    await expect(page.locator('#midiPill')).toHaveText('Table non autorisée');
    await expect(page.locator('#tAide')).toHaveAttribute('open', '');
    await expect(page.locator('#tAideBody')).toContainText('« Appareils MIDI » sur « Autoriser »');
    await page.locator('#tAideBody button', { hasText: 'Réessayer' }).click();
    await expect(page.locator('#tAideBody')).toContainText('Toujours refusé.');
    // cette fois, le joueur autorise : la table branchée apparaît
    await page.evaluate(() => { window.__midiCfg.refuse = false; });
    await page.locator('#tAideBody button', { hasText: 'Réessayer' }).click();
    await expect(page.locator('#midiPill')).toHaveText('Souris (aucune table vue)');
    await page.evaluate(() => window.__midi.brancher());
    await expect(page.locator('#midiPill')).toHaveText('DDJ-FLX4');
    expect(erreurs).toEqual([]); await sansBandeau(page);
  });
  test('le navigateur lève une erreur tout de suite : pas de bandeau rouge (gardien)', async ({ page }) => {
    const erreurs = await ouvrir(page, { onglet: 'table', avant: 'navigator.requestMIDIAccess = () => { throw new TypeError("x"); };' });
    await expect(page.locator('#midiPill')).toHaveText('Table non autorisée');
    await expect(page.locator('#tAideBody')).toContainText('Appareils MIDI');
    expect(erreurs).toEqual([]); await sansBandeau(page);
  });
  test('« Réessayer » cliqué deux fois : une seule demande, la table écoutée une seule fois (gardien)', async ({ page }) => {
    const erreurs = await ouvrir(page, { onglet: 'table', avant: `window.__appels = 0; window.__entrees = [];
      navigator.requestMIDIAccess = () => { window.__appels++; if (window.__appels === 1) return Promise.reject(new DOMException('non', 'SecurityError'));
        const e = { id: 'x', name: 'DDJ-FLX4', onmidimessage: null }; window.__entrees.push(e);
        return new Promise(r => setTimeout(() => r({ inputs: new Map([['x', e]]), outputs: new Map(), onstatechange: null }), 300)); };` });
    await expect(page.locator('#midiPill')).toHaveText('Table non autorisée');
    await page.locator('#tAideBody button', { hasText: 'Réessayer' }).dblclick();
    await expect(page.locator('#midiPill')).toHaveText('DDJ-FLX4');
    expect(await page.evaluate(() => [window.__appels, window.__entrees.filter(e => e.onmidimessage).length])).toEqual([2, 1]);
    expect(erreurs).toEqual([]); await sansBandeau(page);
  });
  test('accès déjà accordé, navigateur lent : pas de « Autorise l’accès » (gardien)', async ({ page }) => {
    await ouvrir(page, { onglet: 'table', avant: `const q = navigator.permissions.query.bind(navigator.permissions);
      navigator.permissions.query = d => d && d.name === 'midi' ? Promise.resolve({ state: 'granted' }) : q(d);
      navigator.requestMIDIAccess = () => new Promise(r => setTimeout(() => r({ inputs: new Map(), outputs: new Map(), onstatechange: null }), 2500));` });
    await page.waitForTimeout(2000);
    await expect(page.locator('#midiPill')).toHaveText('Table…');
    await expect(page.locator('#tAideBody')).toContainText('Un instant');
    await expect(page.locator('#midiPill')).toHaveText('Souris (aucune table vue)');
  });
  test('le navigateur attend une réponse : on dit de cliquer sur « Autoriser »', async ({ page }) => {
    const erreurs = await ouvrir(page, { onglet: 'table', avant: 'navigator.requestMIDIAccess = () => new Promise(() => {});' });
    await expect(page.locator('#midiPill')).toHaveText('Autorise l’accès à ta table');
    await expect(page.locator('#tAideBody')).toContainText('clique sur « Autoriser »');
    expect(erreurs).toEqual([]);
  });
  test('navigateur sans Web MIDI (Safari) : la marche à suivre, « Copier le lien » et « Télécharger Chrome »', async ({ page }) => {
    await ouvrir(page, { onglet: 'table', avant: SANS_MIDI });
    await expect(page.locator('#midiPill')).toHaveText('Prends Chrome ou Edge');
    await expect(page.locator('#tAide')).toHaveAttribute('open', '');
    await expect(page.locator('#tAideBody')).toContainText('Ouvre DJingood dans Chrome ou Edge');
    await expect(page.locator('#tAideBody li')).toHaveCount(3);
    await expect(page.locator('#tAideBody a', { hasText: 'Télécharger Chrome' })).toHaveAttribute('href', 'https://www.google.com/chrome/');
    await expect(page.locator('#tAideBody button', { hasText: 'Copier le lien' })).toBeVisible();
  });
  test.describe('copier le lien', () => {
    test.use({ permissions: ['clipboard-read', 'clipboard-write'] });
    test('le lien de l\'accueil part dans le presse-papiers', async ({ page }) => {
      await ouvrir(page, { onglet: 'table', avant: SANS_MIDI });
      await page.locator('#tAideBody button', { hasText: 'Copier le lien' }).click();
      await expect(page.locator('#tAideBody button', { hasText: 'Lien copié !' })).toBeVisible();
      expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(await page.evaluate(() => location.origin + '/index.html'));
    });
  });
  test('sans presse-papiers, le lien s\'écrit en toutes lettres', async ({ page }) => {
    await ouvrir(page, { onglet: 'table', avant: SANS_MIDI + ' try { Object.defineProperty(Navigator.prototype, "clipboard", { value: { writeText: () => Promise.reject(new Error("non")) }, configurable: true }); } catch (e) {}' });
    await page.locator('#tAideBody button', { hasText: 'Copier le lien' }).click();
    await expect(page.locator('#tAideBody .taide-lien')).toHaveText(/^Recopie ce lien : http:\/\/localhost:\d+\/index\.html$/);
    // il reste écrit quand « Ma table » se redessine (clic sur une commande du schéma)
    await page.locator('#tSvg .tc').first().click();
    await expect(page.locator('#tAideBody .taide-lien')).toBeVisible();
  });
  test.describe('sur iPhone', () => {
    test.use({ userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1' });
    test('on dit d\'ouvrir le site sur un ordinateur', async ({ page }) => {
      await ouvrir(page, { onglet: 'table', avant: SANS_MIDI });
      await expect(page.locator('#midiPill')).toHaveText('Souris (table sur ordinateur)');
      await expect(page.locator('#tAideBody')).toContainText('sur un ordinateur');
      await expect(page.locator('#tAideBody button', { hasText: 'Copier le lien' })).toBeVisible();
      await expect(page.locator('#tAideBody a', { hasText: 'Télécharger Chrome' })).toHaveCount(0);
    });
  });
});

test.describe('Premiers pas : la table branchée que le navigateur ne voit pas', () => {
  test('« J’ai une table » sans table vue : l\'aide est proposée, repliée ; à la souris, elle disparaît', async ({ page }) => {
    const erreurs = await ouvrir(page, { onglet: '', stockage: NOUVEAU, midi: { branchee: false } });
    await ecranTable(page);
    await expect(page.locator('#ppAide')).toBeHidden();
    await page.locator('#ppOpts .pp-opt').nth(0).click();
    await expect(page.locator('#ppAide')).toBeVisible();
    await expect(page.locator('#ppAide summary')).toHaveText('Elle est branchée, mais je ne la vois pas ?');
    await expect(page.locator('#ppAide')).not.toHaveAttribute('open', '');
    await page.locator('#ppAide summary').click();
    await expect(page.locator('#ppAide')).toContainText('Ferme rekordbox');
    await page.locator('#ppOpts .pp-opt').nth(1).click();
    await expect(page.locator('#ppAide')).toBeHidden();
    // la table arrive : reconnue, plus d'aide
    await page.evaluate(() => window.__midi.brancher('DDJ-FLX2'));
    await expect(page.locator('#ppAsk')).toContainText('Je vois ta table');
    await expect(page.locator('#ppAide')).toHaveCount(0);
    expect(erreurs).toEqual([]); await sansBandeau(page);
  });
  test('accès refusé : Vini le dit, et l\'aide est ouverte avec « Réessayer »', async ({ page }) => {
    await ouvrir(page, { onglet: '', stockage: NOUVEAU, midi: { refuse: true } });
    await ecranTable(page);
    await expect(page.locator('#ppAsk')).toHaveText(/refusé l’accès à ta table/);
    await expect(page.locator('#ppAide')).toBeVisible();
    await expect(page.locator('#ppAide')).toHaveAttribute('open', '');
    await expect(page.locator('#ppAide button', { hasText: 'Réessayer' })).toBeVisible();
  });
  test('Safari : Vini dit d\'ouvrir Chrome, et l\'aide est ouverte avec « Copier le lien » ; à la souris, elle disparaît', async ({ page }) => {
    await ouvrir(page, { onglet: '', stockage: NOUVEAU, avant: SANS_MIDI });
    await ecranTable(page);
    await expect(page.locator('#ppAsk')).toHaveText(/ouvre DJingood dans Chrome ou Edge/);
    await expect(page.locator('#ppAide')).toBeVisible();
    await expect(page.locator('#ppAide')).toHaveAttribute('open', '');
    await expect(page.locator('#ppAide summary')).toHaveText('Ouvrir DJingood dans Chrome');
    await expect(page.locator('#ppAide button', { hasText: 'Copier le lien' })).toBeVisible();
    await page.locator('#ppOpts .pp-opt').nth(1).click();
    await expect(page.locator('#ppAide')).toBeHidden();
    await expect(page.locator('#ppAsk')).toHaveText(/tout se joue à la souris/);
  });
  test('le navigateur attend une réponse : Vini dit de cliquer sur « Autoriser »', async ({ page }) => {
    await ouvrir(page, { onglet: '', stockage: NOUVEAU, avant: 'navigator.requestMIDIAccess = () => new Promise(() => {});' });
    await ecranTable(page);
    await expect(page.locator('#ppAsk')).toHaveText(/clique sur « Autoriser »/);
  });
});

test.describe('Rapport des testeurs', () => {
  for (const [nom, midi, attendu] of [['aucune table vue', { branchee: false }, 'sans table (souris) · aucune table vue par le navigateur'],
    ['accès refusé', { refuse: true }, 'sans table (souris) · accès à la table refusé']]) {
    test(`sans table, il dit pourquoi : ${nom}`, async ({ page }) => {
      await ouvrir(page, { onglet: 'accueil', midi });
      await expect(page.locator('#midiPill')).not.toHaveText('Table…');
      expect(await page.evaluate(() => avisRapport())).toContain(attendu);
    });
  }
});
