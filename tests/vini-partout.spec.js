// Lot 32 : Vini en haut de « Mes progrès », « S'entraîner » et « Passer au vrai », avec une phrase qui dépend de chaque page.
const { test, expect } = require('@playwright/test');
const { ouvrir, sansBandeau } = require('./outils');

const S = o => JSON.stringify(o);
const jour = (n = 0) => { const d = new Date(); d.setDate(d.getDate() + n); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
const BASE = { 'coach-parcours': 'debut' };
// Les phrases ont des espaces insécables avant « : », « ! », « ? » : on les compare avec des espaces ordinaires
const dit = (page, nom) => page.locator(`#${nom}Tip`).evaluate(e => e.textContent.replace(/ /g, ' '));

test.describe('Mes progrès', () => {
  test('un badge presque gagné, puis l\'objectif atteint, sinon les XP qui manquent', async ({ page }) => {
    const erreurs = await ouvrir(page, { onglet: 'progres', stockage: Object.assign({ 'coach-lecons': S({ 0: 3, 1: 2, 5: 2 }) }, BASE) });
    await expect(page.locator('#progVini svg')).toBeVisible();
    expect(await dit(page, 'prog')).toBe('Tu y es presque : 2 sur 3 pour le badge « Swap propre » !');
    await expect(page.locator('#progVini')).toHaveClass(/vn-calme/);
    await page.evaluate(() => { goal.faits.push(dayKey()); renderProgres(); });
    expect(await dit(page, 'prog')).toBe('Objectif du jour atteint : tu gères !');
    await expect(page.locator('#progVini')).toHaveClass(/vn-danse/);
    expect(erreurs).toEqual([]); await sansBandeau(page);
  });
  test('un nouveau venu : les XP pour le niveau 2', async ({ page }) => {
    await ouvrir(page, { onglet: 'progres', stockage: BASE });
    expect(await dit(page, 'prog')).toBe('Encore 30 XP pour passer au niveau 2 !');
  });
});

test.describe('S\'entraîner', () => {
  test('sans niveau joué, après un niveau, défi réussi', async ({ page }) => {
    await ouvrir(page, { onglet: 'entrainer', stockage: BASE });
    expect(await dit(page, 'train')).toBe('Joue d’abord un niveau dans Apprendre : ensuite, je t’entraîne ici !');
    await page.evaluate(() => { stars[0] = 2; renderTrain(); });
    expect(await dit(page, 'train')).toMatch(/^Le défi du jour t’attend : « .+ », en (House|Techno|Afro house)\.$/);
    await page.evaluate(() => { stars[1] = 2; stars[2] = 2; pracData.defiDate = dayKey(); pracData.defiStars = 3; renderTrain(); });
    expect(await dit(page, 'train')).toBe('Défi réussi ! Et si tu tentais un mini-set de 3 transitions ?');
    await expect(page.locator('#trainVini')).toHaveClass(/vn-danse/);
    await page.evaluate(() => { pracData.setBest = 6; renderTrain(); });
    expect(await dit(page, 'train')).toBe('Défi réussi ! Et un mini-set pour battre ton record de 6 ★ sur 9 ?');
    await page.evaluate(() => { pracData.defiStars = 1; renderTrain(); });
    expect(await dit(page, 'train')).toBe('Le défi du jour n’est pas encore réussi : retente-le !');
  });
});

test.describe('Passer au vrai', () => {
  test('la collection, la paire du jour, les missions une par une, la paire validée', async ({ page }) => {
    const erreurs = await ouvrir(page, { onglet: 'vrai', stockage: BASE });
    expect(await dit(page, 'real')).toBe('Montre-moi ta collection rekordbox : je te trouve deux morceaux qui vont bien ensemble !');
    await page.locator('#rbDemo').click();
    expect(await dit(page, 'real')).toBe('Voilà ta paire du jour ! Ça te tente ?');
    await page.locator('#rbGo').click();
    expect(await dit(page, 'real')).toBe('Mission 1 sur 6 : prépare tes deux morceaux.');
    await page.evaluate(() => { window.__sons = []; son = n => window.__sons.push(n); });
    await page.locator('#rbMissions .rbok').click();
    await expect(page.locator('#realVini')).toHaveClass(/vn-parfait/);
    expect(await dit(page, 'real')).toMatch(/^Mission 2 sur 6 : /);
    for (let i = 0; i < 5; i++) await page.locator('#rbMissions .rbok').click();
    expect(await dit(page, 'real')).toBe('Paire validée, bravo ! Tu as fait 1 vraie transition avec ta musique.');
    expect(await page.evaluate(() => window.__sons)).toEqual(['reussi', 'reussi', 'reussi', 'reussi', 'reussi', 'fin']);
    await expect(page.locator('#realVini')).toHaveClass(/vn-danse/, { timeout: 3000 });
    expect(erreurs).toEqual([]); await sansBandeau(page);
  });
});

test.describe('Partout', () => {
  test('un seul Vini par page, et le toucher le fait sauter', async ({ page }) => {
    await ouvrir(page, { onglet: 'progres', stockage: BASE });
    for (const [vue, nom] of [['vProgres', 'prog'], ['vTrain', 'train'], ['vReal', 'real'], ['vHome', 'home']]) {
      await page.evaluate(v => { location.hash = '#' + { vProgres: 'progres', vTrain: 'entrainer', vReal: 'vrai', vHome: 'accueil' }[v]; }, vue);
      await expect(page.locator(`#${vue} .vini`)).toHaveCount(1);
      await page.locator(`#${nom}ViniBtn`).click();
      await expect(page.locator(`#${nom}Vini`)).toHaveClass(/vn-parfait/);
      await expect(page.locator(`#${nom}Vini`)).not.toHaveClass(/vn-parfait/, { timeout: 3000 });
    }
  });
});
