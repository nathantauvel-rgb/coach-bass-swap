// Lot 75 : le grand écran. Au-dessus de 1600 px de large, la colonne du site passe à 1600 px (en-tête et pages alignés) et
// les pages rangent leurs blocs côte à côte ; un portable (1366, 1536 px) ne voit rien changer.
const { test, expect } = require('@playwright/test');
const { ouvrir, sansBandeau } = require('./outils');

const S = o => JSON.stringify(o);
// un joueur qui revient : parcours choisi, des niveaux joués (les quêtes du jour s'affichent sur l'accueil)
const VENU = { 'coach-parcours': 'apprenti', 'coach-lecons': S({ 0: 3, 1: 2, 2: 3, 3: 2, 4: 1, 5: 2, 6: 1 }), 'coach-ch2-ouvert': '1' };
const TOUT = ['gPlay', 'gLow', 'gFad', 'gCfx', 'gEcho', 'gMid', 'gMidB', 'gCfxB', 'gHi', 'gTrim', 'gTempoA', 'gTempoB', 'gJogA', 'gJogB', 'gCueA', 'gCueB', 'gPadsA', 'gPadsB', 'gCasqueA', 'gCasqueB', 'gXf'];
const boite = (page, sel) => page.locator(sel).first().evaluate(e => { const r = e.getBoundingClientRect(); return { x: Math.round(r.left), y: Math.round(r.top), l: Math.round(r.width), h: Math.round(r.height) }; });
const defile = page => page.evaluate(() => document.documentElement.scrollWidth > innerWidth);

test.describe('Grand écran (1920 × 1080)', () => {
  test.use({ viewport: { width: 1920, height: 1080 } });
  test('l\'en-tête et les pages ont la même largeur, 1600 px, et rien ne défile de côté', async ({ page }) => {
    const erreurs = await ouvrir(page, { stockage: VENU, onglet: 'accueil' });
    const t = await boite(page, '.app > .top'), v = await boite(page, '#vHome');
    expect(t.l).toBe(1600); expect(v.l).toBe(1600); expect(v.x).toBe(t.x);
    expect(await defile(page)).toBe(false);
    expect(erreurs).toEqual([]); await sansBandeau(page);
  });
  test('accueil : « Ta prochaine étape » à gauche, « Quêtes du jour » à droite, le parcours dessous', async ({ page }) => {
    await ouvrir(page, { stockage: VENU, onglet: 'accueil' });
    await expect(page.locator('#homeQuetes')).toBeVisible();
    const h = await boite(page, '#vHome > .hero'), q = await boite(page, '#homeQuetes'), p = await boite(page, '#homePath');
    expect(q.x).toBeGreaterThan(h.x + h.l - 1); expect(Math.abs(q.y - h.y)).toBeLessThan(2);
    expect(p.y).toBeGreaterThan(h.y + h.h - 1); expect(p.l).toBe(1600);
  });
  test('accueil : le bouton de l\'étape tient sur une ligne, même le plus long', async ({ page }) => {
    await ouvrir(page, { stockage: VENU, onglet: 'accueil' });
    const haut = t => page.evaluate(x => { const b = $('homeCta'); b.textContent = x; return Math.round(b.getBoundingClientRect().height); }, t);
    const court = await haut('Commencer');
    for (const t of ['Chapitre 7, niveau 1 : Premier enchaînement', 'Chapitre 5, niveau 1 : Entendre le décalage', 'Mode Expert, niveau 1 : Le bon moment'])
      expect(await haut(t), t).toBe(court);
  });
  test('accueil sans parcours choisi (pas de quêtes) : le bloc du haut garde toute la largeur', async ({ page }) => {
    await ouvrir(page, { stockage: VENU, onglet: 'accueil' });
    await page.evaluate(() => { parcoursPick = true; renderHome(); });   // « Changer de parcours » : le choix remplace les quêtes
    await expect(page.locator('#homeChoice')).toBeVisible();
    await expect(page.locator('#homeQuetes')).toBeHidden();
    expect((await boite(page, '#vHome > .hero')).l).toBe(1600);
  });
  test('un niveau : la table grandit, et un fader suit toujours la souris', async ({ page }) => {
    await ouvrir(page, { stockage: VENU });
    await page.locator('.node').nth(1).click();
    expect(await page.locator('.table3').evaluate(e => getComputedStyle(e).zoom)).toBe('1.3');
    await page.evaluate(t => tableAllume(t), TOUT);
    const f = page.locator('[data-k="faderA"]'); await f.scrollIntoViewIfNeeded();
    const b = await f.boundingBox();
    await page.mouse.move(b.x + b.width / 2, b.y + b.height - 2); await page.mouse.down();
    await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2, { steps: 4 });
    expect(await page.evaluate(() => ctrl.faderA)).toBeCloseTo(.5, 1);
    await page.mouse.move(b.x + b.width / 2, b.y + 2, { steps: 4 }); await page.mouse.up();
    expect(await page.evaluate(() => ctrl.faderA)).toBe(1);
    // le crossfader aussi, de gauche à droite (dans ce niveau il est automatique : on lui rend la main)
    await page.evaluate(() => document.querySelectorAll('.deck .auto').forEach(e => e.classList.remove('auto')));
    await page.locator('.fader.xf').scrollIntoViewIfNeeded();
    const x = await page.locator('.fader.xf').boundingBox();
    await page.mouse.move(x.x + x.width / 2, x.y + x.height / 2); await page.mouse.down();
    await page.mouse.move(x.x + x.width - 2, x.y + x.height / 2, { steps: 5 }); await page.mouse.up();
    expect(await page.evaluate(() => ctrl.xfader)).toBeGreaterThan(.95);
  });
  test('pendant une partie, la table agrandie tient dans l\'écran : LANCE B, les faders et le crossfader se voient', async ({ page }) => {
    await ouvrir(page, { stockage: VENU });
    await page.locator('.node').nth(6).click();
    await page.locator('#startBtn').click(); await expect(page.locator('#startBtn')).toHaveText('Arrêter', { timeout: 60000 });
    await page.waitForTimeout(800);
    for (const id of ['#launchB', '#wFadA', '#wFadB', '.fader.xf']){
      const r = await page.locator(id).boundingBox(); expect(r.y + r.height, id).toBeLessThanOrEqual(1080); expect(r.y, id).toBeGreaterThanOrEqual(0); }
  });
  test('Mes progrès : les badges à droite du niveau, les chapitres dessous', async ({ page }) => {
    await ouvrir(page, { stockage: VENU, onglet: 'progres' });
    const n = await boite(page, '#vProgres .pg > .pgcard'), m = await boite(page, '#vProgres .pg > :nth-child(4)'), c = await boite(page, '#vProgres .pg > :nth-child(5)');
    expect(m.x).toBeGreaterThan(n.x + n.l - 1); expect(Math.abs(m.y - n.y)).toBeLessThan(2); expect(c.y).toBeGreaterThan(m.y + m.h - 1);
  });
  test('Ma musique : le morceau qui joue à gauche, ce qui va bien après à droite', async ({ page }) => {
    await ouvrir(page, { stockage: VENU, onglet: 'musique' });
    await page.locator('#rbDemo').click(); await page.locator('#mmListe .mm-ouvre').nth(2).click();
    const a = await boite(page, '#mmFiche .mm-f-carte'), b = await boite(page, '#mmFiche .mm-carte');
    expect(b.x).toBeGreaterThan(a.x + a.l - 1); expect(a.l).toBe(400);
  });
  test('S\'entraîner : le défi du jour à droite du titre', async ({ page }) => {
    await ouvrir(page, { stockage: VENU, onglet: 'entrainer' });
    const t = await boite(page, '#vTrain h1'), d = await boite(page, '#vTrain .tr-defi');
    expect(d.x).toBeGreaterThan(t.x + t.l);
  });
  test('Ma table : le schéma à gauche, l\'explication à droite', async ({ page }) => {
    await ouvrir(page, { stockage: VENU, onglet: 'table' });
    const s = await boite(page, '#vTable .tscroll'), p = await boite(page, '#tPanel');
    expect(p.x).toBeGreaterThan(s.x + s.l - 1); expect(p.l).toBe(380);
  });
});

test.describe('Autres tailles', () => {
  for (const [l, h] of [[1366, 768], [1536, 864]]){
    test(`portable ${l} × ${h} : rien ne change (pages de 1012 px, tout empilé, table à sa taille)`, async ({ page }) => {
      await page.setViewportSize({ width: l, height: h });
      await ouvrir(page, { stockage: VENU, onglet: 'accueil' });
      expect((await boite(page, '#vHome')).l).toBe(1012);
      const hr = await boite(page, '#vHome > .hero'), q = await boite(page, '#homeQuetes');
      expect(q.y).toBeGreaterThan(hr.y + hr.h - 1); expect(q.l).toBe(hr.l);
      await page.evaluate(() => { location.hash = '#apprendre'; });
      await expect(page.locator('.node').first()).toBeVisible();
      expect(await page.locator('.table3').evaluate(e => getComputedStyle(e).zoom)).toBe('1');
    });
  }
  test('1600 × 880 (grand mais pas assez haut) : la colonne s\'élargit, la table garde sa taille', async ({ page }) => {
    await page.setViewportSize({ width: 1600, height: 880 });
    await ouvrir(page, { stockage: VENU });
    expect((await boite(page, '#vLearn')).l).toBe(1552);
    expect(await page.locator('.table3').evaluate(e => getComputedStyle(e).zoom)).toBe('1');
  });
  // Chrome en fenêtre normale sur un écran 1920 × 1080 laisse ~913 px de haut à la page (l'écran de l'utilisateur)
  for (const [nom, ch, n] of [['chapitre 1, niveau 7', 1, 6], ['chapitre 5, niveau 1 (le compteur de décalage en plus)', 5, 0]]){
    test(`1920 × 913 : la table grandit un peu (×1,2) et tout se voit pendant une partie (${nom})`, async ({ page }) => {
      await page.setViewportSize({ width: 1920, height: 913 });
      await ouvrir(page, { stockage: VENU });
      if (ch !== 1) await page.evaluate(c => setChapter(c), ch);
      await page.locator('.node').nth(n).click();
      expect(await page.locator('.table3').evaluate(e => getComputedStyle(e).zoom)).toBe('1.2');
      await page.locator('#startBtn').click(); await expect(page.locator('#startBtn')).toHaveText('Arrêter', { timeout: 60000 });
      await page.waitForTimeout(1500);
      for (const id of ['#launchB', '#wFadB', '.fader.xf', '#padsB']){
        const r = await page.locator(id).boundingBox(); expect(r.y + r.height, id).toBeLessThanOrEqual(913); expect(r.y, id).toBeGreaterThanOrEqual(0); }
    });
  }
  // la bulle de Vini ne passe pas sous son disque (défaut du lot 62, vu sur les captures du lot 75)
  for (const [l, h, r] of [[1920, 913, 115], [1366, 768, 115], [375, 812, 66]]){
    test(`${l} × ${h} : la bulle de Vini sur l'accueil n'est pas cachée par son disque`, async ({ page }) => {
      await page.setViewportSize({ width: l, height: h });
      await ouvrir(page, { stockage: VENU, onglet: 'accueil' });
      await page.evaluate(() => { $('homeTip').textContent = 'Encore debout ? Prêt pour ta prochaine transition ?'; });
      const b = await boite(page, '#homeTip'), v = await boite(page, '.hero .hvini');
      const centre = v.x + v.l / 2;
      if (l > 760) expect(b.x + b.l, 'bulle à gauche du disque').toBeLessThanOrEqual(centre - r);
      else expect(b.x, 'bulle à droite du disque').toBeGreaterThanOrEqual(centre + r);
    });
  }
  // entre les deux (fenêtre étroite, iPad en hauteur, demi-écran) : l'écart d'avant, la bulle passe devant le disque (gardien du 19 nov.)
  for (const [l, h] of [[765, 900], [800, 1000], [960, 1000], [1024, 768]]){
    test(`${l} × ${h} : la bulle de Vini passe devant son disque, et rien ne défile de côté`, async ({ page }) => {
      await page.setViewportSize({ width: l, height: h });
      await ouvrir(page, { stockage: VENU, onglet: 'accueil' });
      await page.evaluate(() => { $('homeTip').textContent = 'Encore debout ? Prêt pour ta prochaine transition ?'; });
      const dessus = await page.evaluate(() => { const r = $('homeTip').getBoundingClientRect(); return $('homeTip').contains(document.elementFromPoint(r.right - 3, r.top + r.height / 2)); });
      expect(dessus).toBe(true);
      expect(await page.evaluate(() => getComputedStyle(document.querySelector('.hero .hbuddy')).columnGap)).toBe('14px');
      expect(await defile(page)).toBe(false);
    });
  }
  test('2560 × 1440 : la colonne reste à 1600 px, au milieu, sans défilement de côté', async ({ page }) => {
    await page.setViewportSize({ width: 2560, height: 1440 });
    await ouvrir(page, { stockage: VENU, onglet: 'accueil' });
    const v = await boite(page, '#vHome');
    expect(v.l).toBe(1600); expect(v.x).toBe(480); expect(await defile(page)).toBe(false);
  });
});
