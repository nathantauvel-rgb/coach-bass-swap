// Tests avec des débutants : « Mon avis », « C'était clair ? », rapport, remise à zéro, fiche des testeurs.
const { test, expect } = require('@playwright/test');
const { ouvrir, sansBandeau } = require('./outils');

const S = o => JSON.stringify(o);
const journal = page => page.evaluate(() => JSON.parse(localStorage.getItem('coach-journal') || 'null'));
// Affiche la carte de résultat comme à la fin d'un niveau, sans jouer la partie entière
const finNiveau = (page, st) => page.evaluate(s => { $('result').hidden = false; avisPartie(chapter, s); }, st);
const rapport = page => page.evaluate(() => avisRapport());

test.describe('Mon avis', () => {
  test('le bouton est sur chaque onglet et ouvre la fenêtre', async ({ page }) => {
    const erreurs = await ouvrir(page, { onglet: '' });
    for (const o of ['accueil', 'apprendre', 'entrainer', 'vrai', 'table']) {
      await page.evaluate(h => { location.hash = '#' + h; }, o);
      await expect(page.locator('#avisBtn')).toBeVisible();
    }
    await page.locator('#avisBtn').click();
    await expect(page.locator('#avis')).toBeVisible();
    await expect(page.locator('#avBloque')).toBeFocused();
    await expect(page.locator('#avMail')).toBeHidden();
    expect(erreurs).toEqual([]); await sansBandeau(page);
  });
  test('un avis vide est refusé, un avis rempli est enregistré avec l\'écran et la note', async ({ page }) => {
    await ouvrir(page);
    await page.locator('.node').nth(5).click();
    await page.locator('#avisBtn').click();
    await page.locator('#avSave').click();
    await expect(page.locator('#avMsg')).toHaveText('Écris au moins une réponse, ou choisis une note.');
    await page.locator('#avBloque').fill('Je ne trouve pas le potard LOW');
    await page.locator('#avNote [data-note="4"]').click();
    await expect(page.locator('#avNote [data-note="4"]')).toHaveAttribute('aria-pressed', 'true');
    await page.locator('#avSave').click();
    await expect(page.locator('#avMsg')).toContainText('Merci, ton avis est enregistré');
    await expect(page.locator('#avBloque')).toHaveValue('');
    const j = await journal(page);
    expect(j.avis).toHaveLength(1);
    expect(j.avis[0]).toMatchObject({ ecran: 'Apprendre · Le swap des basses', bloque: 'Je ne trouve pas le potard LOW', plu: '', note: 4 });
    await expect(page.locator('#avSum')).toContainText('Il contient 1 avis, 0 partie jouée');
  });
  test('Échap, la croix et un changement d\'onglet ferment la fenêtre', async ({ page }) => {
    await ouvrir(page);
    await page.locator('#avisBtn').click(); await page.keyboard.press('Escape');
    await expect(page.locator('#avis')).toBeHidden();
    await page.locator('#avisBtn').click(); await page.locator('#avClose').click();
    await expect(page.locator('#avis')).toBeHidden();
    await page.locator('#avisBtn').click(); await page.evaluate(() => { location.hash = '#accueil'; });
    await expect(page.locator('#vHome')).toBeVisible();
    await expect(page.locator('#avis')).toBeHidden();
  });
  test('ouvrir la fenêtre pendant une partie arrête la partie', async ({ page }) => {
    await ouvrir(page);
    await page.locator('#startBtn').click();
    await expect(page.locator('#startBtn')).toHaveText('Arrêter', { timeout: 60000 });
    await page.locator('#avisBtn').click();
    await expect(page.locator('#startBtn')).toHaveText('Jouer');
  });
});

test.describe('C\'était clair ?', () => {
  test('la réponse est gardée par niveau et revient quand on refait le niveau', async ({ page }) => {
    await ouvrir(page);
    await page.locator('.node').nth(1).click();
    await finNiveau(page, 2);
    await expect(page.locator('#clairRow')).toBeVisible();
    await expect(page.locator('#clairMerci')).toBeHidden();
    await page.locator('#clairRow [data-clair="bof"]').click();
    await expect(page.locator('#clairMerci')).toBeVisible();
    await finNiveau(page, 3);
    await expect(page.locator('#clairRow [data-clair="bof"]')).toHaveAttribute('aria-pressed', 'true');
    const j = await journal(page);
    expect(j.clair).toEqual({ '1-1': 'bof' });
    expect(j.parties.map(p => [p.c, p.n, p.e])).toEqual([[1, 1, 2], [1, 1, 3]]);
  });
  test('pas de question après le verdict d\'un mini-set', async ({ page }) => {
    await ouvrir(page, { onglet: 'entrainer', stockage: { 'coach-lecons': S({ 0: 2, 1: 2, 2: 2 }) } });
    await page.locator('[data-prac=set]').click();
    await page.evaluate(() => { $('clairRow').hidden = false; prac.res = [2, 3, 1]; pracVerdict(); });
    await expect(page.locator('#clairRow')).toBeHidden();
  });
});

test.describe('Le rapport', () => {
  test('il résume parcours, temps, étoiles, niveaux, réponses et avis', async ({ page }) => {
    await ouvrir(page, { stockage: { 'coach-parcours': 'debut', 'coach-lecons': S({ 0: 3, 1: 1 }), 'coach-quiz': S(['b0a']),
      'coach-journal': S({ debut: '2026-10-10', jours: ['2026-10-10'], secs: 600, parties: [{ c: 1, n: 0, e: 2, k: '', d: '2026-10-10' }, { c: 1, n: 0, e: 3, k: 'var', d: '2026-10-10' }, { c: 1, n: 1, e: 1, k: '', d: '2026-10-10' }],
        clair: { '1-0': 'oui', '1-1': 'non' }, avis: [{ d: '2026-10-10', ecran: 'Accueil', bloque: 'Le mot outro', plu: 'Les étoiles', note: 4 }], erreurs: [] }) } });
    const r = await rapport(page);
    expect(r).toMatch(/^Rapport DJingo du \d{4}-\d\d-\d\d\n/);
    expect(r).toContain('Parcours : Parcours « Je débute » · sans table (souris)');
    expect(r).toContain('Temps sur le site : 10 min, sur 2 jours (première visite le 2026-10-10)');
    expect(r).toContain('Étoiles : chapitre 1 4/21, chapitre 2 0/21, chapitre 3 0/12, chapitre 4 0/12 · 45 XP · badges 2/13 · quiz 1/25');
    expect(r).toContain('Niveaux joués (3 parties, dont 1 en entraînement et 0 au test de placement) :');
    expect(r).toContain(' - Chapitre 1, niveau 1 « Le bon moment » : 2 essais, meilleur ★★★, dernier ★★★, clair : oui');
    expect(r).toContain(' - Chapitre 1, niveau 2 « Le fader » : 1 essai, meilleur ★, dernier ★, clair : non');
    expect(r).toContain(' - Le 2026-10-10, sur « Accueil », note 4/5\n   Bloqué : Le mot outro\n   Plu : Les étoiles');
  });
  test('« Copier mon rapport » met le rapport dans le presse-papiers', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await ouvrir(page);
    await page.locator('#avisBtn').click();
    await page.locator('#avCopy').click();
    await expect(page.locator('#avMsg')).toContainText('Rapport copié');
    expect(await page.evaluate(() => navigator.clipboard.readText())).toContain('Rapport DJingo du');
  });
  test('sans presse-papiers, le rapport s\'affiche pour être copié à la main', async ({ page }) => {
    await ouvrir(page, { avant: 'Object.defineProperty(navigator, "clipboard", { value: undefined });' });
    await page.locator('#avisBtn').click();
    await page.locator('#avCopy').click();
    await expect(page.locator('#avText')).toBeVisible();
    await expect(page.locator('#avText')).toHaveValue(/^Rapport DJingo du/);
  });
  test('un journal abîmé ne bloque pas la page et repart proprement', async ({ page }) => {
    const erreurs = await ouvrir(page, { stockage: { 'coach-journal': S({ debut: 5, jours: 'x', secs: -3, parties: [{ c: 9, n: 0, e: 2 }, { c: 1, n: 0, e: 2 }, null], clair: { '1-0': 'peut-être', '2-3': 'oui' }, avis: [{ d: '2026-10-10', note: 9, bloque: 42 }] }) } });
    const j = await journal(page);
    expect(j.secs).toBe(0);
    expect(j.parties).toEqual([{ c: 1, n: 0, e: 2 }]);
    expect(j.clair).toEqual({ '2-3': 'oui' });
    expect(j.avis).toEqual([{ d: '2026-10-10', ecran: '', bloque: '', plu: '', note: 0 }]);
    expect(await rapport(page)).toContain('Avis (1)');
    expect(erreurs).toEqual([]); await sansBandeau(page);
  });
  test('le temps passé compte quand la page est affichée', async ({ page }) => {
    await page.clock.install();
    await ouvrir(page);
    await page.clock.runFor(61000);
    expect((await journal(page)).secs).toBe(60);
  });
});

test.describe('Tout recommencer à zéro', () => {
  test('efface la progression mais garde les réglages de la table', async ({ page }) => {
    const reglage = S({ faderA: { ch: 0, n: 19 } });
    await ouvrir(page, { stockage: { 'coach-parcours': 'debut', 'coach-lecons': S({ 0: 3 }), 'coach-badges': S(['pas']), 'coach-midi-map': reglage, 'coach-verif': '{"i":3}' } });
    await page.locator('#avisBtn').click();
    await page.locator('.avreset summary').click();
    await page.locator('#avReset').click();
    await expect(page.locator('#vHome')).toBeVisible();
    await expect(page.locator('#homeChoice')).toBeVisible();
    const reste = await page.evaluate(() => Object.keys(localStorage).filter(k => k.startsWith('coach-')).sort());
    expect(reste).toEqual(['coach-journal', 'coach-midi-map', 'coach-ordre', 'coach-verif']);   // le journal et coach-ordre reviennent au rechargement
    expect(await page.evaluate(() => localStorage.getItem('coach-midi-map'))).toBe(reglage);
    expect((await journal(page)).parties).toEqual([]);
  });
});

test.describe('Fiche des testeurs', () => {
  test('la page s\'ouvre et mène au site', async ({ page }) => {
    const erreurs = []; page.on('pageerror', e => erreurs.push(String(e)));
    await page.goto('/testeurs.html');
    await expect(page.locator('h1')).toHaveText('Tester DJingo');
    await page.locator('a.cta').click();
    await expect(page.locator('#vHome')).toBeVisible();
    expect(erreurs).toEqual([]);
  });
});
