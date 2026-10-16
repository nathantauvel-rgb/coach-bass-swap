// Les deux parcours : choix à la première visite, prochaine étape, changement de parcours.
const { test, expect } = require('@playwright/test');
const { ouvrir, sansBandeau, jouer } = require('./outils');

const S = o => JSON.stringify(o);
const CH1_FINI = S({ 0: 2, 1: 2, 2: 2, 3: 2, 4: 2, 5: 2, 6: 2 });
const accueil = (page, stockage) => ouvrir(page, { onglet: '', stockage });
const etapes = page => page.locator('#homeStages li').evaluateAll(els => els.map(e => (e.className || 'a-venir') + ' | ' + e.querySelector('strong').textContent + ' | ' + e.querySelector('.sp').textContent));

test.describe('Première visite', () => {
  test('la question est posée, rien d\'autre n\'est proposé', async ({ page }) => {
    const erreurs = await accueil(page, { 'coach-guide-vu': null });
    await expect(page.locator('#homeChoice')).toBeVisible();
    await expect(page.locator('#homeChoice .choice')).toHaveText([/Je débute complètement/, /Je sais déjà lancer deux morceaux/]);
    await expect(page.locator('#homeCta')).toBeHidden(); await expect(page.locator('#homePath')).toBeHidden();
    expect(erreurs).toEqual([]); await sansBandeau(page);
  });
  test('« Je débute » : le parcours démarre par le guide de la table', async ({ page }) => {
    await accueil(page, { 'coach-guide-vu': null });
    await page.locator('[data-parcours=debut]').click();
    expect(await page.evaluate(() => localStorage.getItem('coach-parcours'))).toBe('debut');
    await expect(page.locator('#homeChoice')).toBeHidden();
    await expect(page.locator('#homeKicker')).toHaveText('Ta prochaine étape');
    await expect(page.locator('#homeTitle')).toHaveText('Découvre ta table');
    expect(await etapes(page)).toEqual(['now | Découvre ta table | En cours', 'a-venir | Les bases | À venir', 'a-venir | S\'entraîner | À venir', 'a-venir | La maîtrise | À venir', 'a-venir | Les vrais morceaux | À venir', 'a-venir | Passer au vrai | À venir']);
    await page.locator('#homeCta').click();
    await expect(page.locator('#vLearn')).toBeVisible();
    await expect(page.locator('#onb')).toBeVisible();
  });
  test('« Je sais déjà lancer deux morceaux » : test de placement, sans guide imposé', async ({ page }) => {
    const erreurs = await accueil(page, { 'coach-guide-vu': null });
    await page.locator('[data-parcours=deja]').click();
    expect(await page.evaluate(() => localStorage.getItem('coach-parcours'))).toBe('deja');
    await expect(page.locator('#homeTitle')).toHaveText('Le test de placement');
    expect((await etapes(page)).map(e => e.split(' | ')[1])).toEqual(['Le test de placement', 'Les bases', 'La maîtrise', 'Les vrais morceaux', 'S\'entraîner', 'Passer au vrai']);
    await page.locator('#homeCta').click();
    await expect(page.locator('#vLearn')).toBeVisible();
    await expect(page.locator('#onb')).toBeHidden();
    await expect(page.locator('#pBanner')).toBeVisible();
    await expect(page.locator('#pTitle')).toHaveText('Test de placement · épreuve 1 sur 3');
    await expect(page.locator('#guideBtn')).toBeVisible();
    expect(erreurs).toEqual([]);
  });
  test('le choix est gardé après rechargement', async ({ page }) => {
    await accueil(page, { 'coach-guide-vu': null });
    await page.locator('[data-parcours=deja]').click();
    await page.reload();
    await expect(page.locator('#homeChoice')).toBeHidden();
    await expect(page.locator('#homePathName')).toHaveText('Parcours « J\'améliore mes transitions »');
  });
});

test.describe('Prochaine étape', () => {
  test('utilisateur déjà venu : pas de question, il reprend où il en était', async ({ page }) => {
    await accueil(page, { 'coach-lecons': S({ 0: 3 }) });
    await expect(page.locator('#homeChoice')).toBeHidden();
    await expect(page.locator('#homePathName')).toHaveText('Parcours « Je débute »');
    await expect(page.locator('#homeTitle')).toHaveText('Les bases');
    await expect(page.locator('#homeCta')).toHaveText('Niveau 2 : Le fader');
    expect((await etapes(page)).slice(0, 2)).toEqual(['done | Découvre ta table | Fait', 'now | Les bases | 3 ★ sur 14']);
    await page.locator('#homeCta').click();
    await expect(page.locator('#vLearn')).toBeVisible();
    await expect(page.locator('#ltitle')).toHaveText('Le fader');
  });
  test('« Je débute » : après les bases vient l\'entraînement, puis le chapitre 2', async ({ page }) => {
    await accueil(page, { 'coach-parcours': 'debut', 'coach-lecons': CH1_FINI });
    await expect(page.locator('#homeTitle')).toHaveText('S\'entraîner');
    await page.locator('#homeCta').click();
    await expect(page.locator('#vTrain')).toBeVisible();
    await page.evaluate(() => localStorage.setItem('coach-entrainement', JSON.stringify({ vars: 1 })));
    await page.goto('/index.html'); await page.reload();
    await expect(page.locator('#homeTitle')).toHaveText('La maîtrise');
    await page.locator('#homeCta').click();
    await expect(page.locator('#lnum')).toHaveText(/^Chapitre 2/);
  });
  test('« Je sais déjà » : test raté, on reprend au premier geste raté', async ({ page }) => {
    await accueil(page, { 'coach-guide-vu': null, 'coach-parcours': 'deja', 'coach-test': 'ko:5' });
    await expect(page.locator('#homeTitle')).toHaveText('Les bases');
    await expect(page.locator('#homeCta')).toHaveText('Niveau 6 : Le swap des basses');
    await page.locator('#homeCta').click();
    await expect(page.locator('#ltitle')).toHaveText('Le swap des basses');
    await expect(page.locator('#onb')).toBeHidden();
  });
  test('« Je sais déjà » : test réussi, les bases sont passées', async ({ page }) => {
    await accueil(page, { 'coach-parcours': 'deja', 'coach-test': 'ok', 'coach-ch2-ouvert': '1' });
    expect((await etapes(page)).slice(0, 3)).toEqual(['done | Le test de placement | Fait', 'done | Les bases | Fait', 'now | La maîtrise | 0 ★ sur 10']);
    await page.locator('#homeCta').click();
    await expect(page.locator('#lnum')).toHaveText(/^Chapitre 2 · Niveau 1/);
  });
  test('chapitre 3 puis Passer au vrai', async ({ page }) => {
    await accueil(page, { 'coach-parcours': 'debut', 'coach-lecons': CH1_FINI, 'coach-entrainement': S({ vars: 1 }), 'coach-ch2': S({ 0: 3, 1: 3, 2: 2, 3: 2 }) });
    await expect(page.locator('#homeTitle')).toHaveText('Les vrais morceaux');
    await page.locator('#homeCta').click();
    await expect(page.locator('#lnum')).toHaveText(/^Chapitre 3 · Niveau 1/);
    await expect(page.locator('.node')).toHaveCount(4);
  });
  test('tout est fait : le parcours est terminé', async ({ page }) => {
    await accueil(page, { 'coach-parcours': 'debut', 'coach-lecons': CH1_FINI, 'coach-entrainement': S({ vars: 1 }), 'coach-ch2': S({ 0: 3, 1: 3, 2: 2, 3: 2 }),
      'coach-ch3': S({ 0: 2, 1: 2, 2: 3, 3: 2 }), 'coach-missions': S({ pair: '', done: {}, total: 1 }) });
    await expect(page.locator('#homeKicker')).toHaveText('Parcours terminé');
    expect((await etapes(page)).every(e => e.startsWith('done'))).toBe(true);
    await page.locator('#homeCta').click();
    await expect(page.locator('#vTrain')).toBeVisible();
  });
});

test.describe('Changer de parcours', () => {
  test('le lien remontre la question, le parcours actuel est marqué, la progression est gardée', async ({ page }) => {
    await accueil(page, { 'coach-parcours': 'debut', 'coach-lecons': S({ 0: 3, 1: 2 }) });
    await page.locator('#pathSum').click();
    await page.locator('#homeChange').click();
    await expect(page.locator('#homeChoice')).toBeVisible();
    await expect(page.locator('[data-parcours=debut]')).toHaveAttribute('aria-pressed', 'true');
    await page.locator('[data-parcours=deja]').click();
    expect(await page.evaluate(() => localStorage.getItem('coach-parcours'))).toBe('deja');
    await expect(page.locator('#homeTitle')).toHaveText('Le test de placement');
    expect(JSON.parse(await page.evaluate(() => localStorage.getItem('coach-lecons')))).toEqual({ 0: 3, 1: 2 });
  });
  test('valeurs enregistrées abîmées : pas de plantage, la question est reposée', async ({ page }) => {
    const erreurs = await accueil(page, { 'coach-guide-vu': null, 'coach-parcours': 'zzz', 'coach-test': '{oops' });
    await expect(page.locator('#homeChoice')).toBeVisible();
    expect(erreurs).toEqual([]); await sansBandeau(page);
  });
});

test.describe('Test de placement', () => {
  test('raté sans rien toucher : le résultat est noté et on repart du niveau 1', async ({ page }) => {
    test.setTimeout(300000);
    const erreurs = await accueil(page, { 'coach-guide-vu': null });
    await page.locator('[data-parcours=deja]').click();
    await page.locator('#homeCta').click();
    for (let i = 0; i < 3; i++) {
      await jouer(page);
      await expect(page.locator('#result')).toBeVisible({ timeout: 90000 });
      await page.locator('#next').click();
    }
    await expect(page.locator('#rTitle')).toHaveText('On commence par les bases');
    await expect(page.locator('#next')).toHaveText('Commencer le chapitre 1');
    expect(await page.evaluate(() => localStorage.getItem('coach-test'))).toBe('ko:0');
    expect(await page.evaluate(() => localStorage.getItem('coach-lecons'))).not.toBeNull();
    await page.locator('#next').click();
    await expect(page.locator('#ltitle')).toHaveText('Le bon moment');
    await page.locator('a.brand').click();
    await expect(page.locator('#homeTitle')).toHaveText('Les bases');
    expect(erreurs).toEqual([]);
  });
});
