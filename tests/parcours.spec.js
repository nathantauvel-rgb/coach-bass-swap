// Les trois parcours (lot 37) : choix à la première visite, prochaine étape, changement de parcours.
const { test, expect } = require('@playwright/test');
const { ouvrir, sansBandeau } = require('./outils');

const S = o => JSON.stringify(o);
const CH1_FINI = S({ 0: 2, 1: 2, 2: 2, 3: 2, 4: 2, 5: 2, 6: 2 });
const accueil = (page, stockage) => ouvrir(page, { onglet: '', stockage });
const etapes = page => page.locator('#homeStages li').evaluateAll(els => els.map(e => (e.className || 'a-venir') + ' | ' + e.querySelector('strong').textContent + ' | ' + e.querySelector('.sp').textContent));

test.describe('Première visite', () => {
  test('la question est posée, rien d\'autre n\'est proposé', async ({ page }) => {
    const erreurs = await accueil(page, { 'coach-guide-vu': null });
    await expect(page.locator('#homeChoice')).toBeVisible();
    await expect(page.locator('#homeChoice .choice strong')).toHaveText(['Grand débutant', 'Apprenti DJ', 'DJ confirmé']);
    await expect(page.locator('#homeCta')).toBeHidden(); await expect(page.locator('#homePath')).toBeHidden();
    expect(erreurs).toEqual([]); await sansBandeau(page);
  });
  test('« Grand débutant » : le parcours démarre par le guide de la table', async ({ page }) => {
    await accueil(page, { 'coach-guide-vu': null });
    await page.locator('[data-parcours=debut]').click();
    expect(await page.evaluate(() => localStorage.getItem('coach-parcours'))).toBe('debut');
    await expect(page.locator('#homeChoice')).toBeHidden();
    await expect(page.locator('#homeKicker')).toHaveText('Ta prochaine étape');
    await expect(page.locator('#homeTitle')).toHaveText('Découvre ta table');
    expect(await etapes(page)).toEqual(['now | Découvre ta table | En cours', 'a-venir | Les bases | À venir', 'a-venir | S\'entraîner | À venir', 'a-venir | La maîtrise | À venir', 'a-venir | Les vrais morceaux | À venir', 'a-venir | Le calage | À venir', 'a-venir | Passer au vrai | À venir']);
    await page.locator('#homeCta').click();
    await expect(page.locator('#vLearn')).toBeVisible();
    await expect(page.locator('#onb')).toBeVisible();
  });
  test('« Apprenti DJ » : Mode Expert d\'abord, sans guide imposé, tout est ouvert', async ({ page }) => {
    const erreurs = await accueil(page, { 'coach-guide-vu': null });
    await page.locator('[data-parcours=apprenti]').click();
    expect(await page.evaluate(() => localStorage.getItem('coach-parcours'))).toBe('apprenti');
    await expect(page.locator('#homeTitle')).toHaveText('Les bases en Mode Expert');
    await expect(page.locator('#homeCta')).toHaveText('Mode Expert, niveau 1 : Le bon moment');
    expect((await etapes(page)).map(e => e.split(' | ')[1])).toEqual(['Les bases en Mode Expert', 'Les combos', 'Le calage', 'La maîtrise', 'Les vrais morceaux', 'S\'entraîner', 'Passer au vrai']);
    await page.locator('#homeCta').click();
    await expect(page.locator('#vLearn')).toBeVisible();
    await expect(page.locator('#onb')).toBeHidden();
    await expect(page.locator('#expertBtn')).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('#guideBtn')).toBeVisible();
    await page.locator('#chapBtn').click();
    await expect(page.locator('#chapters .chap:disabled')).toHaveCount(0);
    await expect(page.locator('#chapters')).not.toContainText('Test de placement');
    expect(erreurs).toEqual([]);
  });
  test('« DJ confirmé » : le calage d\'abord', async ({ page }) => {
    await accueil(page, { 'coach-guide-vu': null });
    await page.locator('[data-parcours=confirme]').click();
    expect((await etapes(page)).map(e => e.split(' | ')[1])).toEqual(['Le calage', 'Les combos', 'Les bases en Mode Expert', 'Les vrais morceaux', 'S\'entraîner', 'Passer au vrai']);
    await page.locator('#homeCta').click();
    await expect(page.locator('#lnum')).toHaveText(/^Chapitre 5 · Niveau 1/);
    await expect(page.locator('#onb')).toBeHidden();
  });
  test('le choix est gardé après rechargement', async ({ page }) => {
    await accueil(page, { 'coach-guide-vu': null });
    await page.locator('[data-parcours=confirme]').click();
    await page.reload();
    await expect(page.locator('#homeChoice')).toBeHidden();
    await expect(page.locator('#homePathName')).toHaveText('Parcours « DJ confirmé »');
  });
  test('ancien parcours « Je sais déjà » : devient Apprenti DJ', async ({ page }) => {
    await accueil(page, { 'coach-parcours': 'deja', 'coach-test': 'ok' });
    await expect(page.locator('#homePathName')).toHaveText('Parcours « Apprenti DJ »');
    expect(await page.evaluate(() => localStorage.getItem('coach-parcours'))).toBe('apprenti');
  });
});

// Défauts trouvés par le gardien du lot 37 : ouvrir les chapitres par le parcours ne doit rien faire « gagner »
test.describe('Parcours avancés : rien de gagné sans jouer', () => {
  for (const p of ['apprenti', 'confirme']) test(`${p} : pas de badge gratuit, rien de gagné aux yeux du compte`, async ({ page }) => {
    const erreurs = await accueil(page, { 'coach-parcours': p });
    await page.goto('/index.html#progres'); await page.waitForTimeout(500);
    await page.goto('/index.html#accueil'); await page.waitForTimeout(500);
    expect(await page.evaluate(() => JSON.parse(localStorage.getItem('coach-badges') || '[]'))).toEqual([]);
    expect(await page.evaluate(() => cptVide())).toBe(true);
    expect(await page.evaluate(() => [ch2Unlocked(), ch3Unlocked()])).toEqual([true, true]);
    expect(erreurs).toEqual([]);
  });
  for (const [p, ch] of [['apprenti', 2], ['confirme', 5], ['deja', 3]]) test(`${p} : après un rechargement, on reste au chapitre ${ch}`, async ({ page }) => {
    const erreurs = await ouvrir(page, { stockage: { 'coach-parcours': p, 'coach-chapitre': String(ch) } });
    expect(await page.evaluate(() => chapter)).toBe(ch);
    await expect(page.locator('#lnum')).toHaveText(new RegExp(`^Chapitre ${ch} `));
    expect(erreurs).toEqual([]);
  });
  // Gardien du lot 37 (troisième passage) : un ancien joueur qui avait réussi le test de placement, sans parcours enregistré
  test('parcours deviné (ancien test de placement réussi) : après un rechargement, on reste au chapitre 3', async ({ page }) => {
    const erreurs = await ouvrir(page, { stockage: { 'coach-ch2-ouvert': '1', 'coach-test': 'ok', 'coach-chapitre': '3' } });
    expect(await page.evaluate(() => [parcours, chapter])).toEqual(['apprenti', 3]);
    await expect(page.locator('#lnum')).toHaveText(/^Chapitre 3 /);
    expect(erreurs).toEqual([]);
  });
  test('parcours deviné : il reste Apprenti DJ après sa 14e étoile au chapitre 1 (rien ne change sans son choix)', async ({ page }) => {
    await ouvrir(page, { stockage: { 'coach-ch2-ouvert': '1', 'coach-test': 'ok', 'coach-chapitre': '3', 'coach-lecons': JSON.stringify({ 0: 3, 1: 3, 2: 3, 3: 3, 4: 2 }) } });
    expect(await page.evaluate(() => [parcours, chapter, ch3Unlocked()])).toEqual(['apprenti', 3, true]);
  });
  test("apprenti : « La maîtrise » n'est pas faite tant que le chapitre 2 n'est pas joué", async ({ page }) => {
    await accueil(page, { 'coach-parcours': 'apprenti' });
    const e = await etapes(page);
    expect(e.find(x => x.includes('La maîtrise'))).toBe('a-venir | La maîtrise | À venir');
    expect(e.filter(x => x.startsWith('done'))).toEqual([]);
  });
});

test.describe('Prochaine étape', () => {
  test('utilisateur déjà venu : pas de question, il reprend où il en était', async ({ page }) => {
    await accueil(page, { 'coach-lecons': S({ 0: 3 }) });
    await expect(page.locator('#homeChoice')).toBeHidden();
    await expect(page.locator('#homePathName')).toHaveText('Parcours « Grand débutant »');
    await expect(page.locator('#homeTitle')).toHaveText('Les bases');
    await expect(page.locator('#homeCta')).toHaveText('Niveau 2 : Le fader');
    expect((await etapes(page)).slice(0, 2)).toEqual(['done | Découvre ta table | Fait', 'now | Les bases | 3 ★ sur 14']);
    await page.locator('#homeCta').click();
    await expect(page.locator('#vLearn')).toBeVisible();
    await expect(page.locator('#ltitle')).toHaveText('Le fader');
  });
  test('« Grand débutant » : après les bases vient l\'entraînement, puis le chapitre 2', async ({ page }) => {
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
  test('« Apprenti DJ » : un niveau compte en Expert à partir de 60 sur 100, puis les combos', async ({ page }) => {
    await accueil(page, { 'coach-parcours': 'apprenti', 'coach-expert': S({ on: true, best: { 0: 75, 1: 59 } }) });
    expect((await etapes(page))[0]).toBe('now | Les bases en Mode Expert | 1 niveau sur 7');
    await expect(page.locator('#homeCta')).toHaveText('Mode Expert, niveau 2 : Le fader');
    await page.locator('#homeCta').click();
    await expect(page.locator('#ltitle')).toHaveText('Le fader');
    await page.evaluate(() => localStorage.setItem('coach-expert', JSON.stringify({ on: true, best: { 0: 60, 1: 90, 2: 70, 3: 61, 4: 80, 5: 66, 6: 99 } })));
    await page.goto('/index.html'); await page.reload();
    await expect(page.locator('#homeTitle')).toHaveText('Les combos');
    await page.locator('#homeCta').click();
    await expect(page.locator('#lnum')).toHaveText(/^Chapitre 4 · Niveau 1/);
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
      'coach-ch3': S({ 0: 2, 1: 2, 2: 3, 3: 2 }), 'coach-ch5': S({ 0: 3, 1: 2, 2: 2, 3: 2, 4: 2, 5: 2, 6: 2 }), 'coach-missions': S({ pair: '', done: {}, total: 1 }) });
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
    await page.locator('[data-parcours=apprenti]').click();
    expect(await page.evaluate(() => localStorage.getItem('coach-parcours'))).toBe('apprenti');
    await expect(page.locator('#homeTitle')).toHaveText('Les bases en Mode Expert');
    expect(JSON.parse(await page.evaluate(() => localStorage.getItem('coach-lecons')))).toEqual({ 0: 3, 1: 2 });
  });
  test('valeurs enregistrées abîmées : pas de plantage, la question est reposée', async ({ page }) => {
    const erreurs = await accueil(page, { 'coach-guide-vu': null, 'coach-parcours': 'zzz', 'coach-test': '{oops' });
    await expect(page.locator('#homeChoice')).toBeVisible();
    expect(erreurs).toEqual([]); await sansBandeau(page);
  });
});
