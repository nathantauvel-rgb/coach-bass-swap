// Lot 90 « L'en-tête respire » (lot D du diagnostic UX du 26 nov. 2026) : le son, la langue, « Mon avis » et « Revoir le guide »
// sont rangés dans un menu (js/entete.js), qu'ouvre le bouton du prénom une fois connecté, sinon « ⋯ » à côté de « Se connecter »
// (qui reste violet plein, sa demande du lot 54). Sur téléphone, les onglets passent dans une barre fixe en bas de l'écran,
// cachée pendant une partie, sur la carte de fin et quand une fenêtre est ouverte.
// Pendant les tests, Pro est éteint : l'onglet Tutos est caché (4 onglets au lieu de 5 en ligne).
const { test, expect } = require('@playwright/test');
const { ouvrir, sansBandeau, ouvrirMenu, menuAvis } = require('./outils');
const { FAUX, dejaConnecte, dansLaBase } = require('./faux-firebase');

// les liens et boutons visibles de l'en-tête, sans ceux du menu
const boutons = page => page.evaluate(() => [...document.querySelectorAll('.app > .top a, .app > .top button')]
  .filter(e => e.offsetParent && !e.closest('#menuPanneau') && e.getBoundingClientRect().width > 0).length);
// une couleur du site (jeton de :root), telle que le navigateur l'écrit
const jeton = (page, nom) => page.evaluate(n => { const i = document.createElement('i'); i.style.color = `var(${n})`; document.body.appendChild(i); const c = getComputedStyle(i).color; i.remove(); return c; }, nom);
const onglets = page => page.locator('.app > .top .tabs');

test.describe('Sur ordinateur', () => {
  test('pas connecté : « ⋯ » et « Se connecter » violet ; le menu a le son, la langue et « Mon avis », plus rien d’autre dans l’en-tête', async ({ page }) => {
    const erreurs = await ouvrir(page, { onglet: 'accueil' });
    // le logo, 4 onglets, la pastille, la table, « ⋯ », « Se connecter » (avant le lot 90 : 13 avec Tutos, 12 sans)
    expect(await boutons(page)).toBe(9);
    await expect(page.locator('#menuBtn')).toBeVisible();
    await expect(page.locator('#cptBtn')).toHaveText('Se connecter');
    expect(await page.locator('#cptBtn').evaluate(e => getComputedStyle(e).backgroundColor)).toBe(await jeton(page, '--brand'));
    for (const s of ['#sonsBtn', '.hud #langBtn', '.hud #avisBtn', '.hud #guideBtn']) await expect(page.locator(s)).toHaveCount(0);
    await expect(page.locator('#menuPanneau')).toBeHidden();
    await page.locator('#menuBtn').click();
    await expect(page.locator('#menuPanneau')).toBeVisible();
    await expect(page.locator('#menuBtn')).toHaveAttribute('aria-expanded', 'true');
    await expect(page.locator('#menuCompte')).toBeHidden();
    for (const s of ['#volMuet', '#volCurseur', '#volBips', '#langBtn button[lang="en"]', '#avisBtn']) await expect(page.locator(s)).toBeVisible();
    await expect(page.locator('#guideBtn')).toBeHidden();   // seulement sur Apprendre
    // le menu, juste sous son bouton, entier dans l'écran
    const [b, m] = await Promise.all(['#menuBtn', '#menuPanneau'].map(s => page.locator(s).boundingBox()));
    expect(m.y).toBeGreaterThan(b.y + b.height); expect(m.y).toBeLessThan(b.y + b.height + 20);
    expect(m.x + m.width).toBeLessThanOrEqual(1366);
    expect(erreurs).toEqual([]); await sansBandeau(page);
  });

  test('connecté : le bouton du prénom ouvre le menu, avec « Mon compte » en tête ; la fenêtre du compte rend la main au bouton', async ({ page }) => {
    const erreurs = await ouvrir(page, { onglet: 'accueil', avant: dejaConnecte() + FAUX });
    await expect(page.locator('#cptBtn')).toHaveText('Nathan');
    await expect(page.locator('#menuBtn')).toBeHidden();
    expect(await boutons(page)).toBe(8);
    await expect(page.locator('#cptBtn')).toHaveAttribute('aria-expanded', 'false');
    await expect(page.locator('#cptBtn')).toHaveAttribute('aria-controls', 'menuPanneau');
    await page.locator('#cptBtn').click();
    await expect(page.locator('#menuPanneau')).toBeVisible();
    await expect(page.locator('#compte')).toBeHidden();
    await expect(page.locator('#cptBtn')).toHaveAttribute('aria-expanded', 'true');
    await expect(page.locator('#menuCompte')).toBeFocused();
    await expect(page.locator('#menuNom')).toHaveText('Nathan');
    await expect(page.locator('#menuAv')).toHaveText('N');
    await page.locator('#menuCompte').click();
    await expect(page.locator('#compte')).toBeVisible();
    await expect(page.locator('#menuPanneau')).toBeHidden();
    await expect(page.locator('#cptMoiNom')).toHaveText('Nathan');
    await page.keyboard.press('Escape');
    await expect(page.locator('#compte')).toBeHidden();
    await expect(page.locator('#cptBtn')).toBeFocused();
    // le bouton du prénom referme le menu qu'il a ouvert
    await page.locator('#cptBtn').click(); await expect(page.locator('#menuPanneau')).toBeVisible();
    await page.locator('#cptBtn').click(); await expect(page.locator('#menuPanneau')).toBeHidden();
    await expect(page.locator('#cptBtn')).toHaveAttribute('aria-expanded', 'false');
    expect(erreurs).toEqual([]); await sansBandeau(page);
  });

  test('une progression en attente d’un choix : le bouton du prénom ouvre tout de suite la fenêtre, « ⋯ » garde le menu', async ({ page }) => {
    await ouvrir(page, { onglet: 'accueil', avant: dejaConnecte() + FAUX + dansLaBase('u1', { 'coach-lecons': '{"0":3,"1":3,"2":3}' }, 2000),
      stockage: { 'coach-compte': JSON.stringify({ uid: 'u1', prenom: 'Nathan', maj: 1000, sale: true }), 'coach-lecons': '{"0":1}' } });
    await expect(page.locator('#cptBtn')).toHaveText('Nathan ·');
    await expect(page.locator('#menuBtn')).toBeVisible();
    await expect(page.locator('#cptBtn')).not.toHaveAttribute('aria-controls', /./);
    await page.locator('#cptBtn').click();
    await expect(page.locator('#cptChoix')).toBeVisible();
    await expect(page.locator('#menuPanneau')).toBeHidden();
  });

  test('sans Firebase : pas de bouton du compte, « ⋯ » ouvre le menu', async ({ page }) => {
    const erreurs = await ouvrir(page, { onglet: 'accueil', avant: 'window.DJINGO_FIREBASE = {};' });
    await expect(page.locator('#cptBtn')).toBeHidden();
    expect(await boutons(page)).toBe(8);
    await page.locator('#menuBtn').click();
    await expect(page.locator('#avisBtn')).toBeVisible();
    await expect(page.locator('#menuCompte')).toBeHidden();
    expect(erreurs).toEqual([]);
  });

  test('« Revoir le guide » : dans le menu sur Apprendre seulement ; il ferme le menu et ouvre le guide', async ({ page }) => {
    await ouvrir(page, { onglet: 'apprendre' });
    await ouvrirMenu(page);
    await expect(page.locator('#guideBtn')).toBeVisible();
    await page.locator('#guideBtn').click();
    await expect(page.locator('#menuPanneau')).toBeHidden();
    await expect(page.locator('#onb')).toBeVisible();
  });

  test('« Mon avis » ferme le menu, et la fenêtre fermée rend la main au bouton du menu', async ({ page }) => {
    await ouvrir(page, { onglet: 'accueil' });
    await menuAvis(page);
    await expect(page.locator('#avis')).toBeVisible();
    await expect(page.locator('#menuPanneau')).toBeHidden();
    await expect(page.locator('#avBloque')).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(page.locator('#avis')).toBeHidden();
    await expect(page.locator('#menuBtn')).toBeFocused();
  });

  test('au clavier : le menu prend la main, Échap le ferme et la rend au bouton ; sortir du menu avec Tab le ferme', async ({ page }) => {
    await ouvrir(page, { onglet: 'accueil' });
    await page.locator('#menuBtn').focus();
    await page.keyboard.press('Enter');
    await expect(page.locator('#menuPanneau')).toBeVisible();
    await expect(page.locator('#volMuet')).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(page.locator('#menuPanneau')).toBeHidden();
    await expect(page.locator('#menuBtn')).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page.locator('#menuPanneau')).toBeVisible();
    // le son, les petits sons, FR, EN, « Mon avis », puis on sort du menu
    for (let i = 0; i < 12 && await page.locator('#menuPanneau').isVisible(); i++) await page.keyboard.press('Tab');
    await expect(page.locator('#menuPanneau')).toBeHidden();
    expect(await page.evaluate(() => !document.getElementById('menuPanneau').contains(document.activeElement))).toBe(true);
  });

  test('un clic ailleurs ferme le menu ; un clic dans le menu, non ; le curseur règle le son sans le fermer', async ({ page }) => {
    await ouvrir(page, { onglet: 'accueil' });
    await ouvrirMenu(page);
    await page.locator('.volpan-aide').click();
    await expect(page.locator('#menuPanneau')).toBeVisible();
    await page.locator('#volCurseur').fill('30');
    await expect(page.locator('#volPanneau .volpct-txt')).toHaveText('30 %');
    await expect(page.locator('#menuPanneau')).toBeVisible();
    await page.mouse.click(300, 600);
    await expect(page.locator('#menuPanneau')).toBeHidden();
    await expect(page.locator('#menuBtn')).toHaveAttribute('aria-expanded', 'false');
  });

  test('le son coupé : un petit haut-parleur barré sur le bouton qui ouvre le menu, connecté ou pas', async ({ page }) => {
    await ouvrir(page, { onglet: 'accueil', avant: dejaConnecte() + FAUX, stockage: { 'coach-volume': '0' } });
    await expect(page.locator('#cptBtn')).toHaveText('Nathan');
    await expect(page.locator('#cptBtn .menumuet')).toBeVisible();
    await expect(page.locator('#menuBtn .menumuet')).toBeHidden();
    await expect(page.locator('#cptBtn')).toHaveAccessibleName('Nathan');   // le dessin n'est pas lu avec le prénom
    await page.locator('#cptBtn').click();
    await page.locator('#volMuet').click();
    await expect(page.locator('#cptBtn .menumuet')).toBeHidden();
  });

  test('le menu passe sous les fenêtres : ouvert, puis la fenêtre du compte par-dessus', async ({ page }) => {
    await ouvrir(page, { onglet: 'accueil' });
    await ouvrirMenu(page);
    const z = await page.evaluate(() => [getComputedStyle($('menuPanneau')).zIndex, getComputedStyle($('compte')).zIndex, getComputedStyle($('avis')).zIndex, getComputedStyle($('onb')).zIndex].map(Number));
    expect(z[0]).toBeLessThan(Math.min(z[1], z[2], z[3]));
  });

  test('en anglais : le menu est traduit, sans phrase oubliée', async ({ page }) => {
    const erreurs = await ouvrir(page, { onglet: 'apprendre', stockage: { 'coach-langue': 'en' } });
    await expect(page.locator('#menuBtn')).toHaveAttribute('aria-label', 'Sound, language, feedback');
    await ouvrirMenu(page);
    await expect(page.locator('#menuPanneau .menu-lang .menu-t')).toHaveText('Language');
    await expect(page.locator('#avisBtn')).toHaveText('Feedback');
    await expect(page.locator('#guideBtn')).toHaveText('See the guide again');
    await expect(page.locator('#volTitre')).toHaveText('Sound');
    expect(await page.evaluate(() => [...window.__enManque])).toEqual([]);
    expect(erreurs).toEqual([]);
  });
});

test.describe('Sur téléphone', () => {
  test.use({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });

  test('les onglets : une barre fixe en bas de l’écran, l’onglet en cours en violet ; en haut, le logo, la pastille, « ⋯ » et le compte', async ({ page }) => {
    const erreurs = await ouvrir(page, { onglet: 'accueil' });
    const t = onglets(page);
    await expect(t).toBeVisible();
    expect(await t.evaluate(e => getComputedStyle(e).position)).toBe('fixed');
    const r = await t.boundingBox();
    expect(Math.round(r.y + r.height)).toBe(844); expect(r.x).toBe(0); expect(r.width).toBe(390);
    await expect(t.locator('a:visible')).toHaveCount(4);
    const actif = t.locator('a[aria-current="page"]');
    await expect(actif).toHaveText('Accueil');
    expect(await actif.evaluate(e => getComputedStyle(e).color)).toBe(await jeton(page, '--brand-light'));
    // en haut : une seule ligne, « Se connecter » écrit en entier
    const [logo, plus, cpt] = await Promise.all(['.app > .top .brand', '#menuBtn', '#cptBtn'].map(s => page.locator(s).boundingBox()));
    expect(Math.abs(plus.y + plus.height / 2 - (logo.y + logo.height / 2))).toBeLessThan(8);
    expect(Math.abs(cpt.y + cpt.height / 2 - (logo.y + logo.height / 2))).toBeLessThan(8);
    await expect(page.locator('#cptNom')).toBeVisible();
    expect(cpt.width).toBeGreaterThan(80);
    // un onglet de la barre change de page
    await t.locator('a[data-view="entrainer"]').click();
    await expect(page.locator('#vTrain')).toBeVisible();
    await expect(t.locator('a[aria-current="page"]')).toHaveText('S\'entraîner');
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
    expect(erreurs).toEqual([]); await sansBandeau(page);
  });

  test('la page laisse la place à la barre : le bas de la page se lit au-dessus', async ({ page }) => {
    await ouvrir(page, { onglet: 'accueil' });
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    const [bas, barre] = await page.evaluate(() => { const v = $('vHome').getBoundingClientRect(), t = document.querySelector('.app > .top .tabs').getBoundingClientRect(); return [v.bottom, t.top]; });
    expect(bas).toBeLessThanOrEqual(barre);
  });

  test('la page d’un niveau : la barre « Jouer » se pose au-dessus des onglets, jamais dessous', async ({ page }) => {
    await ouvrir(page, { onglet: 'apprendre' });
    // au milieu de la scène : la barre est collée en bas de l'écran
    await page.evaluate(() => { const st = $('stage'); window.scrollTo(0, scrollY + st.getBoundingClientRect().top + 120); });
    const [jouer, barre] = await page.evaluate(() => [document.querySelector('.actionbar').getBoundingClientRect().bottom, document.querySelector('.app > .top .tabs').getBoundingClientRect().top]);
    expect(jouer).toBeLessThanOrEqual(barre);
    await expect(page.locator('#startBtn')).toBeInViewport();
  });

  test('pendant une partie, et sur la carte de fin : pas de barre des onglets ; elle revient ensuite', async ({ page }) => {
    await ouvrir(page, { onglet: 'apprendre' });
    await expect(onglets(page)).toBeVisible();
    await page.evaluate(() => $('startBtn').click());
    await expect(page.locator('#stage')).toHaveClass(/joue/, { timeout: 60000 });
    await expect(onglets(page)).toBeHidden();
    await page.evaluate(() => $('startBtn').click());   // « Arrêter »
    await expect(page.locator('#stage')).not.toHaveClass(/joue/);
    await expect(onglets(page)).toBeVisible();
    await page.evaluate(() => { $('result').hidden = false; });
    await expect(onglets(page)).toBeHidden();
    await page.evaluate(() => { $('result').hidden = true; });
    await expect(onglets(page)).toBeVisible();
  });

  test('une fenêtre ouverte (compte, avis, guide, Premiers pas) cache la barre des onglets', async ({ page }) => {
    await ouvrir(page, { onglet: 'accueil' });
    await page.locator('#cptBtn').click();
    await expect(page.locator('#compte')).toBeVisible();
    await expect(onglets(page)).toBeHidden();
    await page.locator('#cptClose').click();
    await expect(onglets(page)).toBeVisible();
    await menuAvis(page);
    await expect(onglets(page)).toBeHidden();
    await page.keyboard.press('Escape');
    await expect(onglets(page)).toBeVisible();
    await page.evaluate(() => openOnb());
    await expect(onglets(page)).toBeHidden();
    await page.evaluate(() => closeOnb());
    await page.evaluate(() => openPremiers());
    await expect(page.locator('#pp')).toBeVisible();
    await expect(onglets(page)).toBeHidden();
  });

  test('le menu sur téléphone : sous l’en-tête, entier, avec « Mon avis » mais sans « Revoir le guide »', async ({ page }) => {
    await ouvrir(page, { onglet: 'apprendre' });
    await ouvrirMenu(page);
    const m = await page.locator('#menuPanneau').boundingBox();
    expect(m.x).toBeGreaterThanOrEqual(0); expect(m.x + m.width).toBeLessThanOrEqual(390);
    await expect(page.locator('#avisBtn')).toBeVisible();
    await expect(page.locator('#langBtn')).toBeVisible();
    await expect(page.locator('#guideBtn')).toBeHidden();
  });

  test('petit téléphone (320 px) : « Se connecter » en icône, rien ne dépasse, aucun nom d’onglet coupé', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 700 });
    const erreurs = await ouvrir(page, { onglet: 'accueil' });
    await expect(page.locator('#cptBtn')).toHaveAccessibleName('Se connecter');
    expect((await page.locator('#cptBtn').boundingBox()).width).toBeLessThanOrEqual(40);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
    expect(await page.evaluate(() => [...document.querySelectorAll('.app > .top .tabs a')].filter(a => a.offsetParent && a.scrollWidth > a.clientWidth + 1).length)).toBe(0);
    expect(erreurs).toEqual([]);
  });
});
