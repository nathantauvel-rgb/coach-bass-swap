// Lot 53 : le site en anglais. Le français reste la langue par défaut et ne change pas ; l'anglais se choisit par
// ?lang=en, par le bouton FR / EN, ou par la carte proposée aux navigateurs qui ne sont pas en français.
// window.__enManque liste les phrases qu'un écran anglais a laissées en français : elle doit rester vide.
const { test, expect } = require('@playwright/test');
const { ouvrir, sansBandeau } = require('./outils');

const manque = page => page.evaluate(() => [...window.__enManque]);
const EN = { 'coach-langue': 'en' };
// Un iPhone : aucun de ses navigateurs ne sait parler aux tables
const SANS_MIDI = `Object.defineProperty(navigator, 'requestMIDIAccess', { value: undefined });
  Object.defineProperty(navigator, 'userAgent', { value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1' });`;

test.describe('Le français ne change pas', () => {
  test('par défaut : la page est en français, rien n\'est traduit, le bouton propose l\'anglais', async ({ page }) => {
    const erreurs = await ouvrir(page, { onglet: 'accueil' });
    await expect(page.locator('html')).toHaveAttribute('lang', 'fr');
    await expect(page.locator('#tabs a[data-view="apprendre"]')).toContainText('Apprendre');
    await expect(page.locator('#langBtn')).toHaveText('EN');
    await expect(page.locator('#langBtn')).toHaveAttribute('title', 'Read DJingood in English');
    // les fonctions du navigateur sont celles d'origine : en français, rien ne passe par le dictionnaire
    expect(await page.evaluate(() => [Object.getOwnPropertyDescriptor(Node.prototype, 'textContent').set, Element.prototype.setAttribute, CanvasRenderingContext2D.prototype.fillText]
      .every(f => /\[native code\]/.test(Function.prototype.toString.call(f))))).toBe(true);
    await expect(page.locator('#langOffre')).toHaveCount(0);
    // et le dictionnaire anglais n'est même pas téléchargé
    expect(await page.evaluate(() => typeof enDe === 'undefined' && ![...document.scripts].some(s => /anglais\.js/.test(s.src)))).toBe(true);
    expect(erreurs).toEqual([]); await sansBandeau(page);
  });
});

test.describe('La page de présentation', () => {
  test('en anglais, entièrement, avec son bouton FR', async ({ page }) => {
    const erreurs = [];
    page.on('pageerror', e => erreurs.push(String(e)));
    await page.goto('/presentation.html?lang=en');
    await expect(page.locator('h1')).toHaveText('Learn to mix on your controller, one move at a time.');
    await expect(page.locator('#langBtn')).toHaveText('FR');
    await expect(page).toHaveTitle('Learning to mix as a beginner · How DJingood works');
    expect(await manque(page)).toEqual([]);
    expect(erreurs).toEqual([]);
  });
});

test.describe('Choisir l\'anglais', () => {
  test('?lang=en : la page passe en anglais, le choix est gardé, FR ramène le français', async ({ page }) => {
    const erreurs = [];
    page.on('pageerror', e => erreurs.push(String(e)));
    await page.addInitScript(() => { try { if (!sessionStorage.getItem('__pret')){ localStorage.setItem('coach-accueil', '{"passe":true,"fini":"2026-10-16"}'); localStorage.setItem('coach-guide-vu', '1'); sessionStorage.setItem('__pret', '1'); } } catch (e) {} });
    await page.goto('/index.html?lang=en#accueil');
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page.locator('#tabs a[data-view="apprendre"]')).toContainText('Learn');
    await expect(page.locator('#tabs a[data-view="entrainer"]')).toContainText('Practice');
    await expect(page).toHaveTitle('DJingood · Learn to mix on your DJ controller, by playing');
    await expect(page.locator('#langBtn')).toHaveText('FR');
    expect(await page.evaluate(() => localStorage.getItem('coach-langue'))).toBe('en');
    // sans le ?lang, le choix gardé suffit
    await page.goto('/index.html#accueil');
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await page.locator('#langBtn').click();
    await expect(page).toHaveURL(/lang=fr/);
    await expect(page.locator('html')).toHaveAttribute('lang', 'fr');
    await expect(page.locator('#tabs a[data-view="apprendre"]')).toContainText('Apprendre');
    expect(await page.evaluate(() => localStorage.getItem('coach-langue'))).toBe('fr');
    expect(erreurs).toEqual([]);
  });

  test('un navigateur en anglais se voit proposer l\'anglais, une seule fois', async ({ browser }) => {
    const ctx = await browser.newContext({ locale: 'en-US' }), page = await ctx.newPage();
    await page.addInitScript(() => { try { if (!sessionStorage.getItem('__pret')){ localStorage.setItem('coach-accueil', '{"passe":true,"fini":"2026-10-16"}'); sessionStorage.setItem('__pret', '1'); } } catch (e) {} });
    await page.goto('/index.html#accueil');
    const carte = page.locator('#langOffre');
    await expect(carte).toBeVisible();
    await expect(carte).toContainText('DJingood is in French. Want it in English?');
    await carte.getByRole('button', { name: 'Garder le français' }).click();
    await expect(carte).toHaveCount(0);
    expect(await page.evaluate(() => localStorage.getItem('coach-langue'))).toBe('fr');
    await page.reload();
    await expect(page.locator('#tabs')).toBeVisible();
    await expect(page.locator('#langOffre')).toHaveCount(0);
    // « Switch to English », depuis un autre navigateur neuf
    const ctx2 = await browser.newContext({ locale: 'en-GB' }), p2 = await ctx2.newPage();
    await p2.goto('/index.html');
    await p2.locator('#langOffre').getByRole('button', { name: 'Switch to English' }).click();
    await expect(p2.locator('html')).toHaveAttribute('lang', 'en');
    await expect(p2.locator('#ppAsk')).toContainText("Hi, I'm Vini!");
    await ctx.close(); await ctx2.close();
  });

  test('un navigateur en français ne voit pas la proposition', async ({ browser }) => {
    const ctx = await browser.newContext({ locale: 'fr-BE' }), page = await ctx.newPage();
    await page.goto('/index.html');
    await expect(page.locator('#pp')).toBeVisible();
    await expect(page.locator('#langOffre')).toHaveCount(0);
    await ctx.close();
  });
});

test.describe('En anglais, rien ne reste en français', () => {
  // Lot 80 : le déroulé d'aujourd'hui (niveau, oreille, table, objectif, puis le plan)
  test('Premiers pas : Vini parle anglais, lettre par lettre, et le parcours mène au plan', async ({ page }) => {
    const erreurs = await ouvrir(page, { onglet: 'accueil', midi: { branchee: false }, stockage: { ...EN, 'coach-accueil': null, 'coach-guide-vu': null, 'coach-fiches': null } });
    await expect(page.locator('#pp')).toBeVisible();
    await expect(page.locator('#ppAsk')).toHaveText("Hi, I'm Vini! I'm going to teach you how to mix. In one minute, I'll make your plan.");
    await expect(page.locator('#ppGo')).toHaveText("Let's go");
    await page.locator('#ppGo').click();
    await expect(page.locator('.pp-opt[data-v="debut"]')).toContainText('Total beginner');
    await page.locator('.pp-opt[data-v="debut"]').click();
    await expect(page.locator('#ppAsk')).toHaveText("Perfect, we'll start from scratch. Every button, one at a time!");
    await page.locator('#ppGo').click();
    await expect(page.locator('#ppOrPasse')).toHaveText('Skip this question');
    await page.locator('#ppOrPasse').click();
    await page.locator('#ppOpts .pp-opt').nth(1).click();   // pas encore de table : à la souris
    await page.locator('#ppGo').click();
    await page.locator('#ppOpts .pp-opt').nth(1).click();   // 10 min par jour
    await expect(page.locator('#ppNote')).toContainText('With 10 min a day, your first real clean transition in 2 weeks!');
    await page.locator('#ppGo').click();
    await expect(page.locator('#ppAsk')).toHaveText(/^Your plan is ready!/);
    await expect(page.locator('.pp-frise')).toBeVisible();
    expect(await manque(page)).toEqual([]);
    expect(erreurs).toEqual([]); await sansBandeau(page);
  });

  test('chapitre 1 : les sept niveaux, leurs consignes et la position de départ', async ({ page }) => {
    const erreurs = await ouvrir(page, { stockage: EN, midi: { branchee: true } });
    await page.goto('/index.html?tout=1#apprendre');
    for (let i = 0; i < 7; i++){
      await page.evaluate(n => goLesson(1, n), i);
      await page.evaluate(() => document.querySelectorAll('details.howto').forEach(d => { d.open = true; }));
    }
    await expect(page.locator('#ltitle')).toHaveText('The full transition');
    await expect(page.locator('#lnum')).toHaveText('Level 7 of 7');
    await expect(page.locator('#setupList')).toContainText("B's LOW knob: cut (all the way left)");
    expect(await manque(page)).toEqual([]);
    expect(erreurs).toEqual([]); await sansBandeau(page);
  });

  test('niveau 1 joué : la partie, le compte à rebours et la carte de fin', async ({ page }) => {
    test.setTimeout(90000);
    const erreurs = await ouvrir(page, { stockage: EN });
    await page.locator('#startBtn').click();
    await expect(page.locator('#startBtn')).toHaveText('Stop', { timeout: 60000 });
    await page.waitForFunction(() => beatNow() >= 24, null, { timeout: 60000, polling: 'raf' });
    await expect(page.locator('#cdLab')).toHaveText('beats');
    await expect(page.locator('#hint')).toHaveText(/^In \d+ beats: start B \(right PLAY\)\.$/);
    await page.waitForFunction(() => beatNow() >= 31.7, null, { timeout: 60000, polling: 'raf' });
    await page.keyboard.press('Space');
    await expect(page.locator('#result')).toBeVisible({ timeout: 60000 });
    await expect(page.locator('#rGain')).toHaveText('+30 XP');
    await expect(page.locator('#startBtn')).toHaveText('Play');
    await expect(page.locator('#rToutSum')).toHaveText('See the details (1)');
    await page.locator('#rToutSum').click();
    await expect(page.locator('#rTout')).toContainText('B started right on the 1 of A\'s outro.');
    await page.locator('#rTout summary', { hasText: 'See my move and the ideal move' }).click();
    expect(await manque(page)).toEqual([]);
    expect(erreurs).toEqual([]); await sansBandeau(page);
  });

  test('la piste dessinée est traduite aussi', async ({ page }) => {
    await ouvrir(page, { stockage: EN });
    expect(await page.evaluate(() => { const g = document.createElement('canvas').getContext('2d'); g.font = '800 11px sans-serif';
      return g.measureText('MAINTENANT').width === g.measureText('NOW').width; })).toBe(true);
  });

  test('« Préparation… » : le bouton reconnaît son texte traduit', async ({ page }) => {
    await ouvrir(page, { stockage: EN, midi: { branchee: true } });
    await page.evaluate(() => { $('startBtn').textContent = 'Préparation…'; updateSetup(); });
    await expect(page.locator('#startBtn')).toHaveText('Getting ready…');
  });

  test('l\'accueil, Mes progrès et Ma table', async ({ page }) => {
    const erreurs = await ouvrir(page, { onglet: 'accueil', stockage: { ...EN, 'coach-parcours': 'debut' } });
    await expect(page.locator('#homeTip')).not.toBeEmpty();
    for (const v of ['progres', 'table', 'accueil']) await page.evaluate(h => { location.hash = '#' + h; }, v);
    await expect(page.locator('#tabs a[data-view="accueil"]')).toContainText('Home');
    expect(await manque(page)).toEqual([]);
    expect(erreurs).toEqual([]); await sansBandeau(page);
  });

  test('sur un téléphone : les sept leçons « Comprendre », carte par carte', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    const erreurs = await ouvrir(page, { onglet: 'accueil', stockage: { ...EN, 'coach-parcours': 'debut' }, avant: SANS_MIDI });
    const nb = await page.evaluate(() => CP_LECONS.map(L => L.cartes.length));
    expect(nb.length).toBe(7);
    for (let l = 0; l < 7; l++){
      for (let i = 0; i < nb[l]; i++) await page.evaluate(([a, c]) => { cpLecon(a); cp.i = c; cpRend(); }, [l, i]);
      await page.evaluate(() => cpTermine());
    }
    await expect(page.locator('#cp')).toContainText('Lesson complete!');
    expect(await manque(page)).toEqual([]);
    expect(erreurs).toEqual([]); await sansBandeau(page);
  });
});

// Lot 80 : tout ce que le site a gagné depuis le lot 53 (Pro, les 7 chapitres, les tutos, Ma musique, les pages légales)
test.describe('Lot 80 : le reste du site en anglais', () => {
  const PRO = 'window.DJINGOOD_PRO = true; window.DJINGOOD_TUTOS = true;';
  test('les 7 chapitres : chaque niveau, sa consigne et « How do I do it? », sans une phrase en français', async ({ page }) => {
    const erreurs = await ouvrir(page, { stockage: EN });
    await page.evaluate(async () => {
      for (const c of [1, 2, 3, 4, 5, 6, 7]) for (let i = 0; i < lessonsOf(c).length; i++){ goLesson(c, i); await new Promise(r => setTimeout(r, 40)); }
    });
    expect(await manque(page)).toEqual([]);
    expect(erreurs).toEqual([]); await sansBandeau(page);
  });
  test('la fenêtre Pro : les prix à l’anglaise, les liens vers les pages anglaises', async ({ page }) => {
    const erreurs = await ouvrir(page, { stockage: EN, avant: PRO, onglet: 'accueil' });
    await page.evaluate(() => proOuvre(''));
    await expect(page.locator('#pro')).toBeVisible();
    await expect(page.locator('#pro')).toContainText('€49.99');
    await expect(page.locator('#pro')).not.toContainText('49,99');
    expect(await page.locator('#pro a').evaluateAll(l => l.map(a => a.getAttribute('href')).filter(h => /\.html$/.test(h)))).toEqual(['terms.html', 'legal-notice.html']);
    expect(await manque(page)).toEqual([]);
    expect(erreurs).toEqual([]); await sansBandeau(page);
  });
  test('les tutos : la liste, puis chaque tuto plan par plan, la bulle de Vini en anglais', async ({ page }) => {
    const erreurs = await ouvrir(page, { stockage: EN, avant: 'window.DJINGOOD_TUTOS = true;', onglet: 'tutos' });   // Pro éteint : tous les tutos s'ouvrent
    await expect(page.locator('.tu-carte').first()).toBeVisible();
    for (const id of await page.evaluate(() => TUTOS.map(t => t.id))){
      await page.evaluate(id => { tuOuvre(id); for (let i = 0; i < tu.t.plans.length; i++) tuAller(i, { direct: true }); }, id);
      // la bulle (lettre par lettre) dit la même chose que sa version lue à voix haute, en anglais
      const [vu, lu] = await page.evaluate(() => [[...document.querySelectorAll('#tuBulle [aria-hidden] span')].map(s => s.textContent).join(''), document.querySelector('#tuBulle .tu-sr').textContent]);
      expect(vu).toBe(lu); expect(lu).not.toMatch(/ tu | ta | les /);
      await page.locator('#tuRetour').click();
    }
    expect(await manque(page)).toEqual([]);
    expect(erreurs).toEqual([]); await sansBandeau(page);
  });
  test('pas de case « mails de Vini » en anglais (ils n’existent qu’en français) ; le lien de connexion est demandé en anglais', async ({ page }) => {
    const erreurs = await ouvrir(page, { stockage: EN, onglet: 'accueil', avant: 'window.DJINGO_MAILS = true;' });
    expect(await page.evaluate(() => [ML_PRET_EN, mlActif()])).toEqual([false, false]);
    let corps = null;
    await page.route('**/api/lien', r => { corps = JSON.parse(r.request().postData() || '{}'); r.fulfill({ status: 200, contentType: 'application/json', body: '{"envoye":true}' }); });
    expect(await page.evaluate(() => cptLienBrevo('lea@exemple.fr'))).toBe(true);
    expect(corps).toMatchObject({ mail: 'lea@exemple.fr', langue: 'en' });
    expect(erreurs).toEqual([]);
  });
  test('les pages légales en anglais, et la présentation avec ses captures anglaises', async ({ page }) => {
    for (const [p, titre] of [['terms.html', 'The DJingood Pro subscription'], ['privacy.html', 'What DJingood keeps about you'], ['legal-notice.html', 'Who makes DJingood']]){
      await page.goto('/' + p);
      await expect(page.locator('html')).toHaveAttribute('lang', 'en');
      await expect(page.locator('h1')).toHaveText(titre);
      await expect(page.locator('.page')).toContainText('the French version applies');
    }
    await page.goto('/presentation.html?lang=en');
    await page.waitForFunction(() => !document.documentElement.classList.contains('trad'));
    expect(await page.locator('img[src^="img/"]').evaluateAll(l => l.map(i => i.getAttribute('src')).filter(s => /\.jpg$/.test(s)))).toEqual(['img/en/apprendre.jpg', 'img/en/accueil.jpg', 'img/en/vrai.jpg']);
    expect(await manque(page)).toEqual([]);
  });
});
