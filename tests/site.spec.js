// Fonctionnement général du site. Reprend, avec de vraies vérifications, ce que couvraient les anciens
// scripts Python (tdz, robust, clar, play, play2, user), et ajoute les onglets, S'entraîner et Passer au vrai.
const { test, expect } = require('@playwright/test');
const { ouvrir, envoyer, sansBandeau, jouer } = require('./outils');
const niveau = (page, i) => page.locator('.node').nth(i).click();

test.describe('Fichiers du site', () => {
  test('la feuille de style et tous les fichiers js/ se chargent, dans l\'ordre prévu', async ({ page }) => {
    const rates = [];
    page.on('response', r => { if (r.url().startsWith('http://localhost') && r.status() >= 400) rates.push(r.url()); });
    const erreurs = await ouvrir(page);
    expect(await page.evaluate(() => [...document.scripts].map(s => s.getAttribute('src')))).toEqual(
      ['erreurs', 'morceaux', 'audio', 'controles', 'combos', 'niveaux', 'piste', 'expert', 'midi', 'placement', 'entrainement', 'rekordbox', 'guide', 'objectif', 'quiz', 'parcours', 'table', 'reglage', 'avis', 'demarrage'].map(n => `js/${n}.js`));
    expect(await page.evaluate(() => getComputedStyle(document.body).backgroundColor)).not.toBe('rgba(0, 0, 0, 0)');
    expect(rates).toEqual([]); expect(erreurs).toEqual([]); await sansBandeau(page);
  });
});

test.describe('Chargement avec une progression enregistrée (ancien tdz.py)', () => {
  const ETATS = {
    'chapitre 2 mémorisé mais verrouillé': [{ 'coach-chapitre': '2' }, 7, /^Niveau 1 sur 7/],
    'chapitre 3 mémorisé mais verrouillé': [{ 'coach-chapitre': '3' }, 7, /^Niveau 1 sur 7/],
    'chapitre 2 ouvert': [{ 'coach-chapitre': '2', 'coach-ch2-ouvert': '1' }, 7, /^Chapitre 2/],
    'chapitre 3 ouvert': [{ 'coach-chapitre': '3', 'coach-ch2-ouvert': '1', 'coach-ch2': JSON.stringify({ 0: 3, 1: 3, 2: 3, 3: 3 }) }, 4, /^Chapitre 3/],
    'données abîmées': [{ 'coach-chapitre': 'abc', 'coach-lecons': '{oops', 'coach-ch2': '[1,2]', 'coach-style': 'zouk', 'coach-entrainement': '[1]', 'coach-collection': '{"t":5}', 'coach-missions': '"x"' }, 7, /^Niveau 1 sur 7/]
  };
  for (const [nom, [stockage, nb, titre]] of Object.entries(ETATS)) {
    test(nom, async ({ page }) => {
      const erreurs = await ouvrir(page, { stockage });
      await expect(page.locator('.node')).toHaveCount(nb);
      await expect(page.locator('#lnum')).toHaveText(titre);
      expect(erreurs).toEqual([]); await sansBandeau(page);
    });
  }
});

test.describe('Calcul des morceaux (ancien robust.py)', () => {
  const CAS = {
    'Worker normal': '',
    'Worker bloqué': "window.Worker = function(){ throw new DOMException('blocked', 'SecurityError'); };",
    'Worker qui plante': "window.Worker = function(){ const w = { postMessage(){ setTimeout(() => w.onerror && w.onerror({ message: 'boom', preventDefault(){} }), 50); } }; return w; };"
  };
  for (const [nom, avant] of Object.entries(CAS)) {
    test(`${nom} : la page reste jouable`, async ({ page }) => {
      const erreurs = await ouvrir(page, { avant });
      await niveau(page, 1);
      await expect(page.locator('#ltitle')).toHaveText('Le fader');
      await jouer(page);
      expect(erreurs).toEqual([]); await sansBandeau(page);
    });
  }
});

test.describe('Écran de niveau (ancien clar.py)', () => {
  test('pendant le niveau du filtre, le filtre est mis en évidence et la consigne s\'affiche', async ({ page }) => {
    const erreurs = await ouvrir(page);
    await niveau(page, 4);
    await jouer(page);
    await expect(page.locator('#gCfx')).toHaveClass(/focus/, { timeout: 30000 });
    await expect(page.locator('#tip')).not.toBeEmpty();
    expect(erreurs).toEqual([]);
  });
  test('la démonstration se lance et s\'affiche comme telle', async ({ page }) => {
    await ouvrir(page);
    await niveau(page, 2);
    await jouer(page, '#watchBtn');
    await expect(page.locator('#demoTag')).toBeVisible();
    await expect(page.locator('#stage')).toHaveClass(/demo/);
  });
});

test.describe('Première visite et parties (anciens play.py et play2.py)', () => {
  test('le guide s\'ouvre, donne du son, puis laisse jouer et rejouer', async ({ page }) => {
    const erreurs = await ouvrir(page, { stockage: { 'coach-guide-vu': null } });
    await expect(page.locator('#onb')).toBeVisible();
    await expect(page.locator('#onbTitle')).toHaveText('Bienvenue sur DJingo');
    await page.locator('#onbNext').click();
    await expect(page.locator('#onbTitle')).toHaveText('Compter en phrases', { timeout: 60000 });
    await page.locator('#onbSkip').click();
    await expect(page.locator('#onb')).toBeHidden();
    expect(await page.evaluate(() => localStorage.getItem('coach-guide-vu'))).toBe('1');
    await jouer(page);
    await expect(page.locator('#launchB')).toBeEnabled();
    await page.locator('#startBtn').click();
    await expect(page.locator('#startBtn')).toHaveText('Jouer');
    await jouer(page);
    expect(erreurs).toEqual([]); await sansBandeau(page);
  });
  test('une partie complète sans rien toucher donne un résultat et ne débloque rien', async ({ page }) => {
    test.setTimeout(150000);
    const erreurs = await ouvrir(page);
    await niveau(page, 5);
    await jouer(page);
    await expect(page.locator('#result')).toBeVisible({ timeout: 90000 });
    await expect(page.locator('#rStars span')).toHaveCount(3);
    await expect(page.locator('#rStars span.on')).toHaveCount(1);
    expect(JSON.parse(await page.evaluate(() => localStorage.getItem('coach-lecons')))).toEqual({ 5: 1 });
    await expect(page.locator('#xpTxt')).toHaveText('10 XP');
    expect(erreurs).toEqual([]);
  });
  test('la barre d\'espace lance B', async ({ page }) => {
    await ouvrir(page);
    await niveau(page, 0);
    await jouer(page);
    await page.keyboard.press('Space');
    await expect(page.locator('#launchB')).toBeDisabled();
  });
});

test.describe('Profils d\'utilisateur avec une table (ancien user.py)', () => {
  const PROFILS = {
    'déjà venu, style techno': { 'coach-lecons': JSON.stringify({ 0: 3, 1: 2 }), 'coach-style': 'techno' },
    'chapitre 3': { 'coach-chapitre': '3', 'coach-ch2-ouvert': '1', 'coach-ch2': JSON.stringify({ 0: 3, 1: 3, 2: 3, 3: 2 }), 'coach-lecons-oreille': JSON.stringify({ 0: 2 }) },
    'style surprise, chapitre 2': { 'coach-chapitre': '2', 'coach-ch2-ouvert': '1', 'coach-style': 'random' }
  };
  for (const [nom, stockage] of Object.entries(PROFILS)) {
    test(nom, async ({ page }) => {
      const erreurs = await ouvrir(page, { stockage, midi: { branchee: true } });
      await envoyer(page, 0xB0, 19, 127); await envoyer(page, 0xB1, 19, 0); await envoyer(page, 0xB0, 15, 64); await envoyer(page, 0xB1, 15, 0); await envoyer(page, 0xB0, 11, 64);
      await niveau(page, 1);
      await expect(page.locator('#ltitle')).not.toBeEmpty();
      expect(erreurs).toEqual([]); await sansBandeau(page);
    });
  }
  test('nouveau venu avec une table : le guide s\'ouvre', async ({ page }) => {
    const erreurs = await ouvrir(page, { stockage: { 'coach-guide-vu': null }, midi: { branchee: true } });
    await expect(page.locator('#onb')).toBeVisible();
    expect(erreurs).toEqual([]);
  });
});

test.describe('Progression et déblocages', () => {
  test('14 étoiles au chapitre 1 ouvrent le chapitre 2', async ({ page }) => {
    await ouvrir(page, { stockage: { 'coach-lecons': JSON.stringify({ 0: 3, 1: 3, 2: 3, 3: 3, 4: 2 }) } });
    await expect(page.locator('.chap').nth(1)).toBeEnabled();
    await expect(page.locator('.chap').nth(2)).toBeDisabled();
    await expect(page.locator('#xpTxt')).toHaveText('140 XP');
    await expect(page.locator('#starTot')).toHaveText('14/66');
  });
  test('13 étoiles ne suffisent pas', async ({ page }) => {
    await ouvrir(page, { stockage: { 'coach-lecons': JSON.stringify({ 0: 3, 1: 3, 2: 3, 3: 3, 4: 1 }) } });
    await expect(page.locator('.chap').nth(1)).toBeDisabled();
  });
});

test.describe('Onglets', () => {
  test('accueil par défaut, puis les trois onglets', async ({ page }) => {
    const erreurs = await ouvrir(page, { onglet: '' });
    await expect(page.locator('#vHome')).toBeVisible();
    for (const [lien, bloc] of [['apprendre', '#vLearn'], ['entrainer', '#vTrain'], ['vrai', '#vReal']]) {
      await page.locator(`#tabs a[data-view=${lien}]`).click();
      await expect(page.locator(bloc)).toBeVisible();
      await expect(page.locator(`#tabs a[data-view=${lien}]`)).toHaveAttribute('aria-current', 'page');
    }
    await page.locator('a.brand').click();
    await expect(page.locator('#vHome')).toBeVisible();
    expect(erreurs).toEqual([]);
  });
  test('quitter Apprendre arrête la partie en cours', async ({ page }) => {
    await ouvrir(page);
    await jouer(page);
    await page.locator('#tabs a[data-view=vrai]').click();
    await page.locator('#tabs a[data-view=apprendre]').click();
    await expect(page.locator('#startBtn')).toHaveText('Jouer');
  });
  test('l\'ancienne page du mode libre renvoie vers Passer au vrai', async ({ page }) => {
    await page.goto('/coach.html');
    await expect(page).toHaveURL(/index\.html#vrai$/);
    await expect(page.locator('#vReal')).toBeVisible();
  });
});

test.describe('S\'entraîner', () => {
  test('sans niveau joué, les séances sont verrouillées', async ({ page }) => {
    await ouvrir(page, { onglet: 'entrainer' });
    for (const k of ['defi', 'var', 'ear', 'set']) await expect(page.locator(`[data-prac=${k}]`)).toBeDisabled();
  });
  test('une séance démarre sur la scène des leçons et se quitte proprement', async ({ page }) => {
    const erreurs = await ouvrir(page, { onglet: 'entrainer', stockage: { 'coach-lecons': JSON.stringify({ 0: 2, 1: 1, 2: 3 }) } });
    await page.locator('[data-prac=set]').click();
    await expect(page.locator('#prBanner')).toBeVisible();
    await expect(page.locator('#lnum')).toHaveText('Mini-set · transition 1 sur 3');
    await expect(page.locator('#chapters')).toBeHidden();
    await jouer(page);
    await page.locator('#prQuit').click();
    await expect(page.locator('#vTrain')).toBeVisible();
    await expect(page.locator('#startBtn')).toHaveText('Jouer');
    expect(JSON.parse(await page.evaluate(() => localStorage.getItem('coach-lecons')))).toEqual({ 0: 2, 1: 1, 2: 3 });
    expect(erreurs).toEqual([]);
  });
});

test.describe('Passer au vrai', () => {
  test('collection d\'exemple : paires, missions, paire validée', async ({ page }) => {
    const erreurs = await ouvrir(page, { onglet: 'vrai' });
    await page.locator('#rbDemo').click();
    await expect(page.locator('#rbSum')).toContainText('12 morceaux');
    await expect(page.locator('#rbHero')).toBeVisible();
    await page.locator('#rbGo').click();
    await expect(page.locator('#rbMissions li')).toHaveCount(6);
    for (let i = 0; i < 6; i++) await page.locator('#rbMissions .rbok').click();
    await expect(page.locator('#rbDone')).toContainText('Paire validée');
    expect(erreurs).toEqual([]);
  });
  test('import d\'un fichier rekordbox, puis d\'un fichier qui n\'en est pas un', async ({ page }) => {
    const erreurs = await ouvrir(page, { onglet: 'vrai' });
    await page.locator('#rbFile').setInputFiles('tests/rekordbox-exemple.xml');
    await expect(page.locator('#rbSum')).toHaveText('9 morceaux · rekordbox-exemple · 7 avec tempo et tonalité');
    await expect(page.locator('#rbPairs .duo')).toHaveCount(2);
    await expect(page.locator('#rbPairs b', { hasText: 'Balises' })).toHaveCount(0);
    await page.locator('#rbFile').setInputFiles({ name: 'faux.xml', mimeType: 'text/xml', buffer: Buffer.from('<html>coucou</html>') });
    await expect(page.locator('#rbMsg')).toContainText('n\'est pas une collection rekordbox');
    expect(erreurs).toEqual([]); await sansBandeau(page);
  });
});
