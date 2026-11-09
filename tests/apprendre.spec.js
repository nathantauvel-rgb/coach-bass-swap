// Lot 64 : la page « Apprendre » refaite : parcours linéaire (le niveau N+1 s'ouvre quand le niveau N est réussi, 2 étoiles),
// cartes de niveau (réussi en vert, à faire en orange, verrouillé avec un cadenas), chapitres en rangée avec leur pourcentage.
const { test, expect } = require('@playwright/test');
const { ouvrir, sansBandeau } = require('./outils');
const S = o => JSON.stringify(o);
const etats = page => page.locator('.node').evaluateAll(els => els.map(e => (e.className.match(/etat-(\w+)/) || [])[1]));

test.describe('Le parcours linéaire', () => {
  test('nouveau venu : seul le niveau 1 est ouvert, les autres ont un cadenas', async ({ page }) => {
    const erreurs = await ouvrir(page, { verrou: true });
    expect(await etats(page)).toEqual(['encours', 'verrou', 'verrou', 'verrou', 'verrou', 'verrou', 'verrou']);
    await expect(page.locator('.node').nth(1)).toHaveAttribute('aria-disabled', 'true');
    await expect(page.locator('.node').nth(1).locator('.cadenas')).toHaveCount(1);
    await expect(page.locator('.node').nth(0).locator('.etq')).toHaveText('À faire');
    expect(erreurs).toEqual([]); await sansBandeau(page);
  });

  test('réussi = 2 étoiles : le suivant s’ouvre ; 1 étoile ne suffit pas', async ({ page }) => {
    await ouvrir(page, { verrou: true, stockage: { 'coach-lecons': S({ 0: 3, 1: 2, 2: 1 }) } });
    expect(await etats(page)).toEqual(['reussi', 'reussi', 'encours', 'verrou', 'verrou', 'verrou', 'verrou']);
    await expect(page.locator('.node').nth(0).locator('.etq')).toHaveText('Réussi');
    await expect(page.locator('#ltitle')).toHaveText('La coupure sèche');   // on arrive sur le niveau à faire
  });

  test('toucher un niveau verrouillé ne l’ouvre pas : Vini dit lequel réussir d’abord', async ({ page }) => {
    const erreurs = await ouvrir(page, { verrou: true, stockage: { 'coach-lecons': S({ 0: 3, 1: 2 }) } });
    await expect(page.locator('#ltitle')).toHaveText('La coupure sèche');
    // aria-disabled : Playwright attendrait qu'il s'active ; un joueur, lui, peut toucher la carte (force)
    await page.locator('.node').nth(5).click({ force: true });
    await expect(page.locator('#ltitle')).toHaveText('La coupure sèche');
    await expect(page.locator('#tip')).toContainText('Réussis d’abord « La coupure sèche » (2 étoiles)');
    await expect(page.locator('#tip')).toContainText('« Le swap des basses » viendra ensuite : les niveaux s’ouvrent un par un');
    // un niveau réussi se rejoue quand on veut
    await page.locator('.node').nth(0).click();
    await expect(page.locator('#ltitle')).toHaveText('Le bon moment');
    expect(erreurs).toEqual([]); await sansBandeau(page);
  });

  test('un niveau déjà joué avant ce changement reste ouvert', async ({ page }) => {
    await ouvrir(page, { verrou: true, stockage: { 'coach-lecons': S({ 0: 1, 4: 2 }) } });
    expect(await etats(page)).toEqual(['encours', 'verrou', 'verrou', 'verrou', 'reussi', 'verrou', 'verrou']);
  });

  test('« Niveau suivant » n’apparaît pas quand le suivant est encore fermé', async ({ page }) => {
    await ouvrir(page, { verrou: true, stockage: { 'coach-lecons': S({ 0: 1 }) } });
    expect(await page.evaluate(() => [niveauOuvert(0), niveauOuvert(1), niveauEnCours()])).toEqual([true, false, 0]);
    await page.evaluate(() => { stars[0] = 2; });
    expect(await page.evaluate(() => niveauOuvert(1))).toBe(true);
  });

  test('le chapitre 2 suit la même règle avec ses propres étoiles', async ({ page }) => {
    await ouvrir(page, { verrou: true, stockage: { 'coach-lecons': S({ 0: 3, 1: 3, 2: 3, 3: 3, 4: 2 }), 'coach-ch2': S({ 0: 2 }), 'coach-chapitre': '2' } });
    expect((await etats(page)).slice(0, 3)).toEqual(['reussi', 'encours', 'verrou']);
  });

  test('?tout=1 (pour les essais) ouvre tout', async ({ page }) => {
    await page.addInitScript(() => { try { localStorage.setItem('coach-accueil', JSON.stringify({ passe: true, fini: '2026-10-16' })); localStorage.setItem('coach-guide-vu', '1'); } catch (e) {} });
    await page.goto('/index.html?tout=1#apprendre');
    await expect(page.locator('.node').first()).toBeVisible();
    expect(await etats(page)).not.toContain('verrou');
  });
});

test.describe('Les chapitres', () => {
  test('une rangée sur une ligne, la progression en pourcentage, un cadenas sur les chapitres fermés', async ({ page }) => {
    await ouvrir(page, { verrou: true, stockage: { 'coach-lecons': S({ 0: 3, 1: 2, 2: 1 }) } });
    await expect(page.locator('#chapters')).toBeVisible();
    await expect(page.locator('#chapBtn')).toBeHidden();
    await expect(page.locator('.chap').nth(0)).toContainText('29 %');   // 6 étoiles sur 21
    await expect(page.locator('.chap').nth(1)).toHaveClass(/ferme/);
    await expect(page.locator('.chap').nth(1).locator('.cadenas')).toHaveCount(1);
    await expect(page.locator('.chap').nth(1)).toContainText('Verrouillé : 6/14 ★ au chapitre 1');   // lu, et dans l'info-bulle
    // et ce qu'il manque, écrit en clair sur la carte
    await expect(page.locator('.chap').nth(1).locator('.cv')).toBeVisible();
    await expect(page.locator('.chap').nth(1).locator('.cv')).toHaveText('Encore 8 ★ au chapitre 1');
    await expect(page.locator('.chap').nth(2).locator('.cv')).toHaveText('Encore 10 ★ au chapitre 2');
    await expect(page.locator('.chap').nth(0).locator('.cv')).toHaveCount(0);
  });

  test('sur téléphone : la rangée s’arrête sur le chapitre en cours, les cartes de niveau gardent leur largeur', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    const erreurs = await ouvrir(page, { verrou: true, stockage: { 'coach-lecons': S({ 0: 3, 1: 3, 2: 3, 3: 3, 4: 2 }), 'coach-chapitre': '5' } });
    const [barre, carte, largeur] = await page.evaluate(() => {
      const bar = $('chapters'), b = bar.getBoundingClientRect(), c = bar.querySelector('[aria-pressed="true"]').getBoundingClientRect();
      return [[b.left, b.right], [c.left, c.right], document.querySelector('#map .node').getBoundingClientRect().width];
    });
    expect(carte[0]).toBeGreaterThanOrEqual(barre[0] - 1);
    expect(carte[1]).toBeLessThanOrEqual(barre[1] + 1);
    expect(largeur).toBeGreaterThanOrEqual(120);   // une ancienne règle les serrait à 84 px
    expect(erreurs).toEqual([]);
  });
});

test.describe('La carte du niveau', () => {
  test('sur un PC, « Jouer » est le plus gros bouton, au-dessus de « Regarde d’abord », à côté de Vini', async ({ page }) => {
    await ouvrir(page, { verrou: true });
    const [jouer, demo, vini] = await page.evaluate(() => [$('startBtn'), $('watchBtn'), $('lvlVini')].map(e => { const r = e.getBoundingClientRect(); return { y: r.top, h: r.height, x: r.left }; }));
    expect(jouer.h).toBeGreaterThan(demo.h);
    expect(jouer.y).toBeLessThan(demo.y);
    expect(Math.abs(vini.x - jouer.x)).toBeLessThan(80);
    await expect(page.locator('#planNote')).toBeHidden();   // le paragraphe d'explication sous les gestes est retiré
  });
});
