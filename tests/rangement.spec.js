// Lot 11 : un écran = une chose à faire (chapitres et style repliés, « Mes progrès », carte de résultat).
const { test, expect } = require('@playwright/test');
const { ouvrir, sansBandeau } = require('./outils');

const S = o => JSON.stringify(o);

test.describe('Écran d\'un niveau', () => {
  test('les chapitres tiennent sur une ligne et s\'ouvrent au clic, sans les chapitres pas encore écrits', async ({ page }) => {
    const erreurs = await ouvrir(page, { stockage: { 'coach-lecons': S({ 0: 3, 1: 3, 2: 3, 3: 3, 4: 2 }) } });
    await expect(page.locator('#chapBtn')).toHaveText('Chapitre 1 · Les bases');
    await expect(page.locator('#chapters')).toBeHidden();
    await page.locator('#chapBtn').click();
    await expect(page.locator('#chapters')).toBeVisible();
    await expect(page.locator('.chap')).toHaveCount(4);
    await page.locator('.chap').nth(1).click();
    await expect(page.locator('#chapters')).toBeHidden();
    await expect(page.locator('#chapBtn')).toHaveText('Chapitre 2 · La maîtrise');
    expect(erreurs).toEqual([]); await sansBandeau(page);
  });
  test('le choix des morceaux est replié', async ({ page }) => {
    await ouvrir(page, { stockage: { 'coach-style': 'techno' } });
    await expect(page.locator('#styleBtn')).toHaveText('Morceaux : Techno');
    await expect(page.locator('#styleOpts')).toBeHidden();
    await page.locator('#styleBtn').click();
    await page.locator('#styleOpts [data-style=afro]').click();
    await expect(page.locator('#styleOpts')).toBeHidden();
    await expect(page.locator('#styleBtn')).toHaveText('Morceaux : Afro');
    expect(await page.evaluate(() => localStorage.getItem('coach-style'))).toBe('afro');
  });
  test('plus de paragraphe en bas de page : le clavier est expliqué dans « Comment faire ? »', async ({ page }) => {
    await ouvrir(page);
    await expect(page.locator('p.after')).toHaveCount(0);
    await expect(page.locator('.howto')).toContainText('espace pour lancer B');
  });
});

test.describe('Carte de résultat', () => {
  test('le schéma s\'ouvre sur demande et se dessine à l\'ouverture', async ({ page }) => {
    await ouvrir(page);
    await page.evaluate(() => { $('result').hidden = false; drawCompare([], 0, 24); });
    await expect(page.locator('#cmpBox')).not.toHaveAttribute('open', '');
    await page.locator('#cmpBox summary').click();
    await expect.poll(() => page.evaluate(() => $('cmp').width)).toBeGreaterThan(100);
  });
});

test.describe('Changer de chapitre', () => {
  test('depuis le niveau 6 du chapitre 1, ouvrir le chapitre 4 (4 niveaux seulement) marche sans erreur', async ({ page }) => {
    const erreurs = await ouvrir(page, { stockage: { 'coach-parcours': 'debut', 'coach-lecons': S({ 0: 3, 1: 3, 2: 3, 3: 3, 4: 2 }) } });
    await page.locator('.node').nth(5).click();
    await page.locator('#chapBtn').click();
    await page.locator('#chapters .chap', { hasText: 'Les combos' }).click();
    await expect(page.locator('#chapBtn')).toHaveText('Chapitre 4 · Les combos');
    await expect(page.locator('.node')).toHaveCount(4);
    expect(erreurs).toEqual([]); await sansBandeau(page);
  });
});

test.describe('Mes progrès', () => {
  test('on y arrive par la pastille du niveau : niveau, aujourd\'hui, prochain badge, médailles, chapitres', async ({ page }) => {
    const erreurs = await ouvrir(page, { onglet: '', stockage: { 'coach-parcours': 'debut', 'coach-lecons': S({ 0: 3, 1: 2 }), 'coach-quiz': S(['b0a']) } });
    await page.locator('a.lvlchip').click();
    await expect(page.locator('#vProgres h1')).toHaveText('Mes progrès');
    // 5 étoiles au chapitre 1 (50 XP) + 1 réponse au quiz (5 XP) = 55 XP : niveau 2, encore 5 XP pour le niveau 3
    await expect(page.locator('#pgLvl')).toHaveText('Niveau 2');
    await expect(page.locator('#pgXp')).toHaveText('55 XP');
    await expect(page.locator('#pgXpNext')).toHaveText('Encore 5 XP pour le niveau 3');
    await expect(page.locator('#pgTodaySub')).toHaveText('0 min sur 10');
    await expect(page.locator('#pgStreak')).toHaveText('Pas encore de série');
    await expect(page.locator('#badgeCount')).toHaveText('2 sur 13');
    await expect(page.locator('#homeBadges li')).toHaveCount(13);
    await expect(page.locator('#homeBadges li.won strong')).toHaveText(['Premier pas', 'Bon timing']);   // les gagnées d'abord
    await expect(page.locator('#pgChaps li').first()).toContainText('1 · Les bases');
    await expect(page.locator('#pgChaps li').first()).toContainText('5 ★ sur 21');
    await expect(page.locator('#pgChaps li.locked').first()).toContainText('encore 9 étoiles au chapitre 1');
    await expect(page.locator('.ptile')).toHaveCount(0);
    expect(erreurs).toEqual([]); await sansBandeau(page);
  });
  test('toucher une médaille dit comment la gagner, et où on en est', async ({ page }) => {
    await ouvrir(page, { onglet: 'progres', stockage: { 'coach-parcours': 'debut', 'coach-lecons': S({ 0: 3, 2: 2 }) } });
    await page.locator('#homeBadges li', { hasText: 'Swap propre' }).locator('button').click();
    await expect(page.locator('#pgMedalInfo')).toHaveText('Swap propre : 3 étoiles sur « Le swap des basses ». Tu en es à 2 sur 3 étoiles.');
    await expect(page.locator('#homeBadges li', { hasText: 'Swap propre' }).locator('button')).toHaveAttribute('aria-pressed', 'true');
    await page.locator('#homeBadges li', { hasText: 'Bon timing' }).locator('button').click();
    await expect(page.locator('#pgMedalInfo')).toHaveText('Bon timing : 3 étoiles sur « Le bon moment ». Gagné !');
  });
  test('le prochain badge : le plus proche, et « Y aller » ouvre le bon niveau', async ({ page }) => {
    await ouvrir(page, { onglet: 'progres', stockage: { 'coach-parcours': 'debut', 'coach-lecons': S({ 0: 3, 1: 2, 2: 2 }) } });
    await expect(page.locator('#pgNextName')).toHaveText('Swap propre');
    await expect(page.locator('#pgNextHow')).toHaveText('3 étoiles sur « Le swap des basses » · 2 sur 3 étoiles');
    await page.locator('#pgNextGo').click();
    await expect(page.locator('#vLearn')).toBeVisible();
    await expect(page.locator('#ltitle')).toHaveText('Le swap des basses');
  });
  test('tous les badges gagnés : plus de prochain badge', async ({ page }) => {
    await ouvrir(page, { onglet: 'progres', stockage: { 'coach-parcours': 'debut', 'coach-badges': S(['pas', 'timing', 'swap', 'soiree', 'bases', 'oreille', 'ondes', 'sansfaute', 'regulier', 'accro', 'miniset', 'tete', 'vrai']) } });
    await expect(page.locator('#pgNextName')).toHaveText('Tous les badges sont à toi !');
    await expect(page.locator('#pgNextGo')).toBeHidden();
    await expect(page.locator('#homeBadges li.won')).toHaveCount(13);
  });
  test('chapitres ouverts : une barre chacun, et un clic ouvre le chapitre', async ({ page }) => {
    await ouvrir(page, { onglet: 'progres', stockage: { 'coach-parcours': 'debut', 'coach-lecons': S({ 0: 3, 1: 3, 2: 3, 3: 3, 4: 2 }), 'coach-ch2': S({ 0: 2 }) } });
    await expect(page.locator('#pgChaps li:not(.locked)')).toHaveCount(3);
    await expect(page.locator('#pgChaps li.locked')).toHaveText(['3 · Les vrais morceauxencore 8 étoiles au chapitre 2']);
    await page.locator('#pgChaps button', { hasText: '4 · Les combos' }).click();
    await expect(page.locator('#vLearn')).toBeVisible();
    await expect(page.locator('#chapBtn')).toHaveText('Chapitre 4 · Les combos');
  });
});
