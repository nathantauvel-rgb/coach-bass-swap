// Lot 25 : « Vraie musique », de vrais morceaux à la place des morceaux fabriqués par le site (Play House au départ,
// des morceaux de Pixabay depuis le lot 57).
const { test, expect } = require('@playwright/test');
const fs = require('fs'), path = require('path');
const { ouvrir, sansBandeau, jouer } = require('./outils');

const S = o => JSON.stringify(o);
const CH1_OK = S({ 0: 2, 1: 2, 2: 2, 3: 2, 4: 2, 5: 2, 6: 2 });
const DUREE = 136 * 60 / 124;   // un extrait : 136 temps à 124 BPM
const TITRES = /^« (Deep House|Luxury Life) » puis « (Ambient House|Deep House Instrumental|Fashion Diva House) » · Pixabay$/;
// Un « robot » qui fait exactement le geste idéal (comme dans combos.spec.js)
const robot = page => page.evaluate(() => { const l = LESSONS[li];
  const tick = () => { if (!run) return; const b = beatNow();
    for (const k of l.user) ctrl[k] = ideal(k, b); applyCtrl();
    if (!l.autoLaunch && run.launch === null && b >= l.launchBeat - .3) launchB();
    requestAnimationFrame(tick); };
  requestAnimationFrame(tick); });

test.describe('Choisir la vraie musique', () => {
  test('c’est le choix par défaut, en tête de la liste ; un style choisi soi-même est gardé', async ({ page }) => {
    const erreurs = await ouvrir(page, { stockage: { 'coach-style': null } });
    await expect(page.locator('#styleBtn')).toHaveText('Morceaux : vraie musique');
    await expect(page.locator('#styleTag')).toHaveText(TITRES);
    await expect(page.locator('#styleOpts [data-style]').first()).toHaveAttribute('data-style', 'vrai');
    await expect(page.locator('#styleOpts [data-style=vrai]')).toHaveAttribute('aria-pressed', 'true');
    await page.locator('#styleBtn').click();
    await page.locator('#styleOpts [data-style=techno]').click();
    await page.reload();
    await expect(page.locator('#styleBtn')).toHaveText('Morceaux : Techno');
    expect(erreurs).toEqual([]); await sansBandeau(page);
  });
  test('un style enregistré abîmé revient à la vraie musique', async ({ page }) => {
    await ouvrir(page, { stockage: { 'coach-style': 'zouk' } });
    await expect(page.locator('#styleBtn')).toHaveText('Morceaux : vraie musique');
  });
  test('le choix est enregistré, le bouton et l\'étiquette le disent', async ({ page }) => {
    const erreurs = await ouvrir(page);
    await page.locator('#styleBtn').click();
    await page.locator('#styleOpts [data-style=vrai]').click();
    expect(await page.evaluate(() => localStorage.getItem('coach-style'))).toBe('vrai');
    await expect(page.locator('#styleBtn')).toHaveText('Morceaux : vraie musique');
    await expect(page.locator('#styleTag')).toHaveText(TITRES);
    await page.reload();
    await expect(page.locator('#styleBtn')).toHaveText('Morceaux : vraie musique');
    await expect(page.locator('#styleOpts [data-style=vrai]')).toHaveAttribute('aria-pressed', 'true');
    expect(erreurs).toEqual([]); await sansBandeau(page);
  });
  test('le niveau qui a des basses dans l\'intro de B prend un autre morceau B', async ({ page }) => {
    await ouvrir(page, { stockage: { 'coach-style': 'vrai' } });
    // dans chaque mélange, le B qui a des basses dès le début n'est pas celui qui a une intro sans basse
    expect(await page.evaluate(() => VRAIS.every(v => v.B0 !== v.B1))).toBe(true);
    for (const [n, bBass] of [[5, true], [0, false]]){
      await page.locator('.node').nth(n).click();
      const attendu = await page.evaluate(b => vraiTitres(sel.vr, b), bBass);
      await expect(page.locator('#styleTag')).toHaveText(attendu);
      expect(await page.evaluate(() => LESSONS[li].bBass ? true : false)).toBe(bBass);
    }
  });
});

test.describe('Jouer avec la vraie musique', () => {
  test('« Le bon moment » se joue avec les extraits, jusqu\'aux 3 étoiles', async ({ page }) => {
    test.setTimeout(120000);
    const fichiers = [];
    page.on('response', r => { if (r.url().includes('/musique/')) fichiers.push([r.url().split('/musique/')[1], r.status()]); });
    const erreurs = await ouvrir(page, { stockage: { 'coach-style': 'vrai' } });
    await jouer(page);
    const t = await page.evaluate(() => ({ a: tracks.A.duration, b: run.bBuf.duration, bpm: BPM }));
    expect(t.a).toBeCloseTo(DUREE, 1); expect(t.b).toBeCloseTo(DUREE, 1); expect(t.bpm).toBe(124);
    expect(fichiers.length).toBeGreaterThanOrEqual(2);
    for (const [, st] of fichiers) expect(st).toBe(200);
    await expect(page.locator('#styleTag')).toHaveText(TITRES);
    await robot(page);
    await expect(page.locator('#result')).toBeVisible({ timeout: 90000 });
    await expect(page.locator('#rStars span.on')).toHaveCount(3);
    expect(erreurs).toEqual([]); await sansBandeau(page);
  });
  test('si la musique ne se charge pas, la partie se joue avec la house du site', async ({ page }) => {
    await page.route('**/musique/**', r => r.abort());
    const erreurs = await ouvrir(page, { stockage: { 'coach-style': 'vrai' } });
    await jouer(page);
    await expect(page.locator('#styleTag')).toHaveText('House · 124 BPM · la vraie musique n’a pas pu se charger');
    expect(await page.evaluate(() => tracks.A.duration)).toBeGreaterThan(60);
    expect(erreurs).toEqual([]); await sansBandeau(page);
  });
  test('au ralenti (chapitre 4), le vrai morceau est rejoué plus lentement', async ({ page }) => {
    const erreurs = await ouvrir(page, { stockage: { 'coach-lecons': CH1_OK, 'coach-chapitre': '4', 'coach-style': 'vrai' } });
    await page.locator('.node').nth(1).click();
    await page.evaluate(() => { speed = .8; });
    await jouer(page);
    expect(await page.evaluate(() => BPM)).toBeCloseTo(124 * .8, 3);
    expect(await page.evaluate(() => tracks.A.duration)).toBeCloseTo(DUREE / .8, 1);
    await expect(page.locator('#styleTag')).toHaveText('Vraie musique · 99 BPM · ralenti 80 %');
    expect(erreurs).toEqual([]); await sansBandeau(page);
  });
});

test.describe('Les fichiers de musique', () => {
  test('l\'accueil ne télécharge pas la musique ; l\'écran des leçons la prépare', async ({ page }) => {
    const fichiers = [];
    page.on('request', r => { if (r.url().includes('/musique/')) fichiers.push(r.url()); });
    await ouvrir(page, { onglet: '', stockage: { 'coach-style': 'vrai', 'coach-parcours': 'debut' } });
    await expect(page.locator('#vHome')).toBeVisible();
    await page.waitForTimeout(800);
    expect(fichiers).toEqual([]);
    await page.evaluate(() => { location.hash = '#apprendre'; });
    await expect.poll(() => fichiers.length).toBe(2);
  });
  test('chaque extrait cité existe, aucun fichier en trop, chacun pèse moins de 1,5 Mo', async ({ page }) => {
    await ouvrir(page);
    const cites = await page.evaluate(() => [...new Set(VRAIS.flatMap(v => Object.values(v)))].map(n => n + '.mp3').sort());
    // Les extraits des tutos (lot 56) vivent dans le même dossier : ils sont cités par TU_PARTIES
    const tutos = await page.evaluate(() => Object.keys(TU_PARTIES).map(n => n + '.mp3'));
    const dossier = path.join(__dirname, '..', 'musique'), presents = fs.readdirSync(dossier).filter(f => f.endsWith('.mp3')).sort();
    expect(presents).toEqual([...new Set([...cites, ...tutos])].sort());
    for (const f of presents) expect(fs.statSync(path.join(dossier, f)).size).toBeLessThan(1.5e6);
    expect(await page.evaluate(() => Object.keys(VRAIS_TITRES).sort())).toEqual(cites.map(f => f.replace('.mp3', '')));
  });
});
