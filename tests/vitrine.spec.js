// Lot 83 « La page d'accueil » : une page comme celles des SaaS, montrée à la moitié des nouveaux venus à la place du premier
// écran de Vini (js/vitrine.js), et le groupe du test envoyé avec chaque statistique (js/stats.js).
const { test, expect } = require('@playwright/test');
const { ouvrir, sansBandeau } = require('./outils');
const { FAUX } = require('./faux-firebase');

// Un nouveau venu : ni réponses aux questions de Vini, ni guide vu
const NOUVEAU = { 'coach-guide-vu': null, 'coach-fiches': null, 'coach-accueil': null };
const PAGE = Object.assign({ 'coach-vitrine': 'page' }, NOUVEAU);
const FAUX_UMAMI = `window.__stats = []; window.umami = { track(n, d){ window.__stats.push(d === undefined ? [n] : [n, d]); } };`;
// Un vrai navigateur (pas un robot de test) dont le tirage au sort tombe sur `r`
const VRAI = r => `Object.defineProperty(Navigator.prototype, 'webdriver', { get: () => false }); Math.random = () => ${r};`;

test.describe('Page d\'accueil (lot 83)', () => {
  test('groupe « page » : la page s\'ouvre à la place de Vini, tient dans un écran de 1366 × 768, sans erreur', async ({ page }) => {
    const erreurs = await ouvrir(page, { onglet: '', stockage: PAGE });
    await expect(page.locator('#vitrine')).toBeVisible();
    await expect(page.locator('#pp')).toBeHidden();
    await expect(page.locator('#vtTitre')).toHaveText(/^Apprends\s*à mixer\s*sur ta table,\s*en jouant$/);
    // la vidéo n'est chargée que pour ceux qui voient la page
    await expect(page.locator('#vtVideo')).toHaveAttribute('src', 'img/vitrine/partie.mp4');
    // habillage « moins IA » (23 nov.) : la vidéo occupe tout le premier écran, « C'est parti » s'y voit sans faire défiler
    const heros = await page.locator('.vt-heros').boundingBox(), go = await page.locator('#vtGo').boundingBox();
    expect(heros.width).toBeGreaterThanOrEqual(1366 - 20);   // d'un bord à l'autre (moins la barre de défilement)
    expect(heros.height).toBeGreaterThanOrEqual(700);
    expect(go.y + go.height).toBeLessThanOrEqual(768);
    await expect(page.locator('.vt-marques')).toHaveCount(0);   // plus de bande de marques
    // Vini au casque sur la vidéo et sur l'onde (sans nom lu à voix haute : il décore) ; l'onde des deux platines, 3 repères
    await expect(page.locator('#vtViniHeros svg')).toHaveCount(1);
    await expect(page.locator('#vtViniOnde svg')).toHaveCount(1);
    await expect(page.locator('#vtViniHeros')).toHaveAttribute('aria-hidden', 'true');
    expect(await page.locator('#vtOnde rect.vt-wa').count()).toBeGreaterThan(80);
    expect(await page.locator('#vtOnde rect.vt-wb').count()).toBeGreaterThan(80);
    await expect(page.locator('.vt-cue')).toHaveCount(3);
    // les titres dans la police des vidéos (chargée seulement pour ceux qui voient la page)
    await expect(page.locator('link#vtPolice')).toHaveCount(1);
    // lot 82 : tout le chapitre 1 est offert (le texte suit NIV_GRATUITS)
    const ch1 = await page.evaluate(() => NIV_GRATUITS >= BASE_LESSONS.length);
    await expect(page.locator('#vtNiv')).toHaveText(ch1 ? 'Tout le chapitre 1 avec ta table' : `Tes ${await page.evaluate(() => NIV_GRATUITS)} premiers niveaux avec ta table`);
    await expect(page.locator('.vt-faq details')).toHaveCount(6);
    await expect(page.locator('.vt-tel')).toBeHidden();   // la phrase du téléphone ne s'affiche pas sur ordinateur
    await sansBandeau(page);
    expect(erreurs).toEqual([]);
  });

  test('« C\'est parti » ouvre directement la première question de Vini (pas de second « C\'est parti »)', async ({ page }) => {
    await ouvrir(page, { onglet: '', stockage: PAGE, avant: FAUX_UMAMI });
    await page.locator('#vtGo').click();
    await expect(page.locator('#vitrine')).toBeHidden();
    await expect(page.locator('#pp')).toBeVisible();
    expect(await page.evaluate(() => PP_ETAPES[pp.i])).toBe('niveau');
    await expect(page.locator('#ppAsk')).toContainText('Tu en es où avec le mix');
    // le clic compte une fois, avec le groupe du test
    const envois = await page.evaluate(() => window.__stats);
    expect(envois).toContainEqual(['page-accueil-go', { accueil: 'page' }]);
    // les questions vont au bout comme avant : Retour ramène au bonjour de Vini
    await page.locator('#ppBack').click();
    expect(await page.evaluate(() => PP_ETAPES[pp.i])).toBe('salut');
  });

  test('le bouton du bas de la page fait la même chose', async ({ page }) => {
    await ouvrir(page, { onglet: '', stockage: PAGE });
    await page.locator('#vtGo2').scrollIntoViewIfNeeded();
    await page.locator('#vtGo2').click();
    await expect(page.locator('#pp')).toBeVisible();
    expect(await page.evaluate(() => PP_ETAPES[pp.i])).toBe('niveau');
  });

  test('groupe « vini » : l\'écran de Vini, comme avant', async ({ page }) => {
    await ouvrir(page, { onglet: '', stockage: Object.assign({ 'coach-vitrine': 'vini' }, NOUVEAU) });
    await expect(page.locator('#pp')).toBeVisible();
    await expect(page.locator('#vitrine')).toBeHidden();
    expect(await page.evaluate(() => PP_ETAPES[pp.i])).toBe('salut');
    // la vidéo n'est pas téléchargée, ni la police des titres de la page
    expect(await page.locator('#vtVideo').getAttribute('src')).toBeNull();
    await expect(page.locator('link#vtPolice')).toHaveCount(0);
  });

  test('un joueur déjà venu ne voit jamais la page, même rangé dans le groupe « page »', async ({ page }) => {
    await ouvrir(page, { onglet: '', stockage: { 'coach-vitrine': 'page', 'coach-parcours': 'debut' } });
    await expect(page.locator('#vitrine')).toBeHidden();
    await expect(page.locator('#pp')).toBeHidden();
  });

  test('quiz fait mais compte pas encore créé : on reprend sur le plan, sans la page', async ({ page }) => {
    await ouvrir(page, { onglet: '', avant: FAUX, stockage: Object.assign({}, PAGE, { 'coach-accueil': JSON.stringify({ niveau: 'debut', table: 'table', modele: 'flx4', min: 10, oreille: 6, mur: true, fini: '2026-11-20' }) }) });
    await expect(page.locator('#pp')).toBeVisible();
    await expect(page.locator('#vitrine')).toBeHidden();
    expect(await page.evaluate(() => PP_ETAPES[pp.i])).toBe('plan');
  });

  test('les tests automatiques restent sur l\'écran de Vini et ne sont rangés dans aucun groupe', async ({ page }) => {
    await ouvrir(page, { onglet: '', stockage: NOUVEAU, avant: FAUX_UMAMI });
    await expect(page.locator('#pp')).toBeVisible();
    await expect(page.locator('#vitrine')).toBeHidden();
    expect(await page.evaluate(() => localStorage.getItem('coach-vitrine'))).toBeNull();
    // et rien n'est ajouté aux statistiques
    expect(await page.evaluate(() => window.__stats.filter(e => e[1] && 'accueil' in e[1]))).toEqual([]);
  });

  test('un vrai nouveau venu est tiré au sort une fois : le groupe est gardé, compté, et suit chaque envoi', async ({ page }) => {
    await ouvrir(page, { onglet: '', stockage: NOUVEAU, avant: FAUX_UMAMI + VRAI(0.2) });
    await expect(page.locator('#vitrine')).toBeVisible();
    expect(await page.evaluate(() => localStorage.getItem('coach-vitrine'))).toBe('page');
    const envois = await page.evaluate(() => window.__stats);
    expect(envois).toContainEqual(['test-accueil', { groupe: 'page', accueil: 'page' }]);
    // un envoi qui n'avait pas de données part avec le groupe
    await page.evaluate(() => stat('essai-quelconque'));
    expect(await page.evaluate(() => window.__stats.at(-1))).toEqual(['essai-quelconque', { accueil: 'page' }]);
  });

  test('l\'autre moitié tombe sur Vini, et le reste au rechargement', async ({ page }) => {
    await ouvrir(page, { onglet: '', stockage: NOUVEAU, avant: VRAI(0.7) });
    await expect(page.locator('#pp')).toBeVisible();
    await expect(page.locator('#vitrine')).toBeHidden();
    expect(await page.evaluate(() => localStorage.getItem('coach-vitrine'))).toBe('vini');
    await page.reload();
    await expect(page.locator('#pp')).toBeVisible();
    await expect(page.locator('#vitrine')).toBeHidden();
  });

  test('?accueil=page montre la page sans ranger le navigateur ni rien compter', async ({ page }) => {
    await page.addInitScript(FAUX_UMAMI);
    await page.goto('/index.html?accueil=page');
    await expect(page.locator('#vitrine')).toBeVisible();
    expect(await page.evaluate(() => localStorage.getItem('coach-vitrine'))).toBeNull();
    expect(await page.evaluate(() => window.__stats.map(e => e[0]))).not.toContain('test-accueil');
  });

  test('« J\'ai déjà un compte » ouvre la fenêtre du compte par-dessus ; connecté, la page s\'efface', async ({ page }) => {
    await ouvrir(page, { onglet: '', stockage: PAGE, avant: FAUX });
    await page.locator('#vtDeja').click();
    await expect(page.locator('#compte')).toBeVisible();
    await expect(page.locator('#vitrine')).toBeVisible();
    // la fenêtre du compte est bien au-dessus de la page (c'est elle qu'on touche au milieu de l'écran)
    expect(await page.evaluate(() => { const b = document.querySelector('#compte .quiz-card, #compte > *').getBoundingClientRect();
      return !!document.elementFromPoint(b.left + b.width / 2, b.top + 20).closest('#compte'); })).toBe(true);
    // fermée sans se connecter : la page est toujours là
    await page.keyboard.press('Escape');
    await page.evaluate(() => closeCompte());
    await expect(page.locator('#vitrine')).toBeVisible();
    // une connexion depuis la page : elle s'efface, et un compte encore vide fait les questions de Vini
    await page.evaluate(() => vitrineConnecte());
    await expect(page.locator('#vitrine')).toBeHidden();
    await expect(page.locator('#pp')).toBeVisible();
  });

  test('en anglais : toute la page est traduite, avec les images anglaises', async ({ page }) => {
    await ouvrir(page, { onglet: '', stockage: Object.assign({ 'coach-langue': 'en' }, PAGE) });
    await page.waitForFunction(() => !document.documentElement.classList.contains('trad'));
    await expect(page.locator('#vtTitre')).toHaveText(/^Learn\s*to mix\s*on your controller,\s*by playing$/);
    await expect(page.locator('#vtGo')).toHaveText("Let's go");
    await expect(page.locator('#vtNiv')).toHaveText('All of chapter 1 with your controller');
    await expect(page.locator('.vt-label').first()).toHaveText('How it works');
    await expect(page.locator('.vt-etape img').first()).toHaveAttribute('src', 'img/vitrine/en/branche.jpg');
    const manque = await page.evaluate(() => [...window.__enManque].filter(t => document.getElementById('vitrine').textContent.includes(t)));
    expect(manque).toEqual([]);
  });

  test('le groupe reste sur l\'appareil : il ne part pas dans le compte en ligne (gardien)', async ({ page }) => {
    await ouvrir(page, { onglet: '', stockage: { 'coach-vitrine': 'page', 'coach-parcours': 'debut' } });
    expect(await page.evaluate(() => cptSuivie('coach-vitrine'))).toBe(false);
    expect(await page.evaluate(() => Object.keys(cptDonnees()))).not.toContain('coach-vitrine');
  });

  test('« Tout recommencer à zéro » garde le groupe : on ne change pas de groupe en cours de test (gardien)', async ({ page }) => {
    await ouvrir(page, { stockage: { 'coach-vitrine': 'vini', 'coach-parcours': 'debut', 'coach-lecons': JSON.stringify({ 0: 3 }) } });
    await page.locator('#avisBtn').click();
    await page.locator('.avreset summary').click();
    await page.locator('#avReset').click();
    await expect(page.locator('#pp')).toBeVisible();   // redevenu un nouveau venu : les questions de Vini, son groupe
    expect(await page.evaluate(() => localStorage.getItem('coach-vitrine'))).toBe('vini');
    await expect(page.locator('#vitrine')).toBeHidden();
  });

  test('la présentation mène directement chez Vini : pas une deuxième page d\'accueil, pas compté dans le test', async ({ page }) => {
    await page.goto('/presentation.html');
    const liens = await page.locator('a.cta, .pres-haut a.ghost').evaluateAll(l => l.map(a => a.getAttribute('href')));
    expect(liens.length).toBeGreaterThanOrEqual(3);
    for (const h of liens) expect(h).toBe('index.html?accueil=vini');
  });

  test('sur téléphone : la phrase pour l\'ordinateur, et le bouton collé en bas quand on descend', async ({ browser }) => {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, locale: 'fr-FR' });
    const page = await ctx.newPage();
    await ouvrir(page, { onglet: '', stockage: PAGE });
    await expect(page.locator('.vt-tel')).toBeVisible();
    const go = await page.locator('#vtGo').boundingBox();
    expect(go.y + go.height).toBeLessThanOrEqual(844);
    await expect(page.locator('#vtColle')).not.toHaveClass(/vt-vu/);
    await page.locator('#vitrine').evaluate(v => { v.scrollTop = 1500; });
    await expect(page.locator('#vtColle')).toHaveClass(/vt-vu/);
    // aucune ligne ne dépasse sur le côté
    expect(await page.locator('#vitrine').evaluate(v => v.scrollWidth <= v.clientWidth)).toBe(true);
    await page.locator('#vtGo3').click();
    await expect(page.locator('#pp')).toBeVisible();
    await ctx.close();
  });
});
