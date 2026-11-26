// Lot 89 « Le niveau en une consigne » (lot C du diagnostic UX du 26 nov. 2026) : la carte du niveau garde le titre et les
// étapes numérotées, avec les pastilles A et B ; « Comment faire ? » tient en une ligne ; les titres de la vraie musique sont
// sous la table ; la touche du clavier est sur l'étape (sans table) ; « Morceaux » et « Mode Expert » sont derrière ⚙.
const { test, expect } = require('@playwright/test');
const { ouvrir, sansBandeau, jouer, options, APPRENTI } = require('./outils');

const S = o => JSON.stringify(o);
const CH1_FINI = { 'coach-lecons': S({ 0: 3, 1: 2, 2: 2, 3: 2, 4: 3, 5: 2, 6: 2 }) };
const chapitre = (page, n, i) => page.evaluate(([n, i]) => { LESSONS = lessonsOf(n); chapter = n; selectLesson(i); }, [n, i]);

test.describe('La carte du niveau', () => {
  test('la phrase sous le titre ne répète plus les étapes : cachée aux chapitres 1, 3, 4 et 6, là au calage et au set', async ({ page }) => {
    const erreurs = await ouvrir(page, { stockage: APPRENTI });
    for (let i = 0; i < 7; i++){
      await page.evaluate(n => selectLesson(n), i);
      await expect(page.locator('#lgoal')).toBeHidden();
      await expect(page.locator('#plan')).toBeVisible();
    }
    await expect(page.locator('#lgoal')).toHaveText('Le final : tout toi-même, comme en soirée.');   // gardée dans la page, pas affichée
    for (const [n, i] of [[3, 3], [4, 0], [6, 2]]){ await chapitre(page, n, i); await expect(page.locator('#lgoal')).toBeHidden(); }
    // chapitre 5 : pas d'étape (niveau 3), ou seulement le swap (niveau 6) ; chapitre 7 : la feuille de route
    for (const [n, i] of [[5, 2], [5, 5], [7, 0]]){ await chapitre(page, n, i); await expect(page.locator('#lgoal')).toBeVisible(); }
    await expect(page.locator('#lgoal')).toHaveText('Enchaîne trois morceaux sans jamais arrêter la musique.');
    expect(erreurs).toEqual([]); await sansBandeau(page);
  });
  test('les étapes portent les pastilles des platines : A en orange, B en bleu, sans changer la phrase', async ({ page }) => {
    await ouvrir(page);
    await page.locator('.node').nth(2).click();
    await expect(page.locator('#planList .etp-t')).toHaveText(['Lance B (PLAY de droite)', 'Baisse d\'un coup le fader de A jusqu\'en bas']);
    await expect(page.locator('#planList li').nth(0).locator('.etp-pl')).toHaveText(['B']);
    await expect(page.locator('#planList li').nth(0).locator('.etp-b')).toHaveCount(1);
    await expect(page.locator('#planList li').nth(1).locator('.etp-a')).toHaveText('A');
    const [a, b, ink] = await page.evaluate(() => { const c = s => getComputedStyle(document.querySelector(s)); return [c('#planList .etp-a').backgroundColor, c('#planList .etp-b').backgroundColor, c('#planList .etp-a').color]; });
    expect([a, b, ink]).toEqual(['rgb(255, 122, 69)', 'rgb(62, 166, 255)', 'rgb(11, 14, 22)']);   // --a, --b, --ink
    // le swap : deux pastilles ; « LOW », « PLAY », « MID » restent des mots
    await page.locator('.node').nth(5).click();
    await expect(page.locator('#planList .etp-pl')).toHaveText(['A', 'B']);
    // chapitre 6 : les étapes écrites dans le niveau aussi
    await chapitre(page, 6, 2);
    await expect(page.locator('#planList li').nth(0).locator('.etp-b')).toHaveCount(2);
  });
  test('en anglais, la phrase est traduite d\'un bloc, puis A et B deviennent des pastilles', async ({ page }) => {
    const erreurs = await ouvrir(page, { stockage: { 'coach-langue': 'en' } });
    await page.locator('.node').nth(2).click();
    await expect(page.locator('#planList .etp-t').first()).toHaveText('Start B (right PLAY)');
    await expect(page.locator('#planList .etp-t').first().locator('.etp-b')).toHaveText('B');
    await expect(page.locator('#planList li').first().locator('kbd')).toHaveText('space');
    await page.locator('.howto summary').click();
    await expect(page.locator('#lfiches')).toHaveText('See the card again: the PLAY button · the faders');
    expect(await page.evaluate(() => [...window.__enManque])).toEqual([]);
    expect(erreurs).toEqual([]);
  });
});

test.describe('« Comment faire ? » en une ligne', () => {
  test('la phrase et « Revoir la fiche » ; plus de ligne du clavier ni de titres de morceaux', async ({ page }) => {
    await ouvrir(page, { stockage: { 'coach-style': 'vrai' } });
    await page.locator('.node').nth(2).click();
    await page.locator('.howto summary').click();
    await expect(page.locator('.howto .how-ligne')).toHaveText('Sur la ligne, lance B et baisse d\'un coup le fader de A, dans le même geste. Revoir la fiche : le bouton PLAY · les faders');
    await expect(page.locator('.howto')).not.toContainText('Clavier');
    await expect(page.locator('.howto')).not.toContainText('Pixabay');
    // la phrase et les liens tiennent dans un seul paragraphe ; les mots du DJ restent dessous
    await expect(page.locator('.howto > p')).toHaveCount(2);
    await expect(page.locator('#llex')).toContainText('Drop : ');
    await page.locator('#lfiches button', { hasText: 'les faders' }).click();
    await expect(page.locator('#onbTitle')).toHaveText('Les faders de volume');
  });
});

test.describe('La touche du clavier sur l\'étape', () => {
  test('sans table : « espace » sur « Lance B », « E » sur « Allume l\'écho », rien quand B part tout seul', async ({ page }) => {
    await ouvrir(page);
    await page.locator('.node').nth(0).click();
    await expect(page.locator('#planList li kbd')).toHaveText(['espace']);
    await page.locator('.node').nth(3).click();   // l'écho : B part tout seul
    await expect(page.locator('#planList li').nth(0).locator('kbd')).toHaveText('E');
    await expect(page.locator('#planList li kbd')).toHaveCount(1);
    await page.locator('.node').nth(5).click();   // le swap : aucune touche
    await expect(page.locator('#planList li kbd')).toHaveCount(0);
  });
  test('avec la FLX4 branchée, aucune touche ; « Je joue à la souris » la fait revenir', async ({ page }) => {
    await ouvrir(page, { midi: { branchee: true } });
    await page.locator('.node').nth(2).click();
    await expect(page.locator('#planList li kbd')).toHaveCount(0);
    await expect(page.locator('#setup')).toBeVisible();
    await page.locator('#setupSkip').click();
    await expect(page.locator('#planList li kbd')).toHaveText(['espace']);
  });
  test('sur un téléphone, pas de touche (pas de clavier)', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await ouvrir(page);
    await page.locator('.node').nth(0).click();
    await expect(page.locator('#planList li .etp-touche')).toBeHidden();
  });
});

test.describe('Les titres de la vraie musique', () => {
  test('une ligne sous la table, là pendant la partie aussi', async ({ page }) => {
    await ouvrir(page, { stockage: { 'coach-style': 'vrai' } });
    await page.locator('.node').nth(0).click();
    await expect(page.locator('#lcredit')).toHaveText(/^Morceaux : « .+ » puis « .+ » · Pixabay$/);
    await expect(page.locator('#lcredit')).toBeVisible();
    await jouer(page);
    await expect(page.locator('#lcredit')).toBeVisible();
    await page.locator('#startBtn').click();
    // la house du site : pas de ligne
    await page.evaluate(() => { styleChoice = 'house'; selectLesson(0); });
    await expect(page.locator('#lcredit')).toBeHidden();
  });
});

test.describe('Le bouton ⚙ « Options »', () => {
  test('Grand débutant : caché tant que le chapitre 1 n\'est pas fini, puis là', async ({ page }) => {
    const erreurs = await ouvrir(page, { stockage: { 'coach-parcours': 'debut', 'coach-lecons': S({ 0: 3, 1: 2, 2: 2, 3: 2, 4: 3, 5: 2, 6: 1 }) } });
    await expect(page.locator('#optsBtn')).toBeHidden();
    await expect(page.locator('#styleBtn')).toBeHidden();
    await expect(page.locator('#expertBtn')).toBeHidden();
    // le niveau 7 réussi (2 étoiles) : le chapitre 1 est fini
    await page.evaluate(() => { stars[6] = 2; selectLesson(6); });
    await expect(page.locator('#optsBtn')).toBeVisible();
    expect(erreurs).toEqual([]);
  });
  test('sans parcours choisi ni progression : caché aussi', async ({ page }) => {
    await ouvrir(page, { stockage: { 'coach-guide-vu': null } });
    expect(await page.evaluate(() => parcours)).toBe('');
    await expect(page.locator('#optsBtn')).toBeHidden();
  });
  for (const [nom, st] of [['Grand débutant au chapitre 1 fini', Object.assign({ 'coach-parcours': 'debut' }, CH1_FINI)], ['Apprenti DJ', APPRENTI], ['DJ confirmé', { 'coach-parcours': 'confirme' }]])
    test(`${nom} : le bouton est là`, async ({ page }) => {
      await ouvrir(page, { stockage: st });
      await expect(page.locator('#optsBtn')).toBeVisible();
    });
  test('il ouvre « Morceaux » et « Mode Expert » ; Échap, un clic ailleurs ou « Jouer » le referment', async ({ page }) => {
    const erreurs = await ouvrir(page, { stockage: APPRENTI });
    const bt = page.locator('#optsBtn'), menu = page.locator('#optsPanel');
    await expect(bt).toHaveAttribute('aria-expanded', 'false');
    await expect(bt).toHaveAttribute('aria-label', 'Options');
    await expect(menu).toBeHidden();
    await bt.click();
    await expect(bt).toHaveAttribute('aria-expanded', 'true');
    await expect(page.locator('#styleBtn')).toBeVisible();
    await expect(page.locator('#expertBtn')).toBeVisible();
    // Mode Expert allumé : le menu reste ouvert, l'étiquette sous le titre le dit
    await page.locator('#expertBtn').click();
    await expect(page.locator('#expertBtn')).toHaveAttribute('aria-pressed', 'true');
    await expect(menu).toBeVisible();
    await expect(page.locator('#modeTag')).toHaveText('Mode Expert');
    await page.locator('#expertBtn').click();
    await expect(page.locator('#modeTag')).toBeHidden();
    await page.keyboard.press('Escape');
    await expect(menu).toBeHidden();
    await expect(bt).toHaveAttribute('aria-expanded', 'false');
    await bt.click();
    await page.locator('#ltitle').click();
    await expect(menu).toBeHidden();
    await bt.click();
    await page.locator('#startBtn').click();
    await expect(page.locator('#startBtn')).toHaveText('Arrêter', { timeout: 60000 });
    await expect(menu).toBeHidden();
    await expect(bt).toBeHidden();
    expect(erreurs).toEqual([]); await sansBandeau(page);
  });
  test('rien à montrer, pas de bouton : chapitre 2, entraînement ; chapitre 4 : seulement les morceaux', async ({ page }) => {
    await ouvrir(page, { stockage: Object.assign({ 'coach-lecons': S({ 0: 2, 1: 2 }) }, APPRENTI) });
    await chapitre(page, 2, 0);
    await expect(page.locator('#optsBtn')).toBeHidden();
    await chapitre(page, 4, 0);
    await expect(page.locator('#optsBtn')).toBeVisible();
    await options(page);
    await expect(page.locator('#styleBtn')).toBeVisible();
    await expect(page.locator('#expertBtn')).toBeHidden();
    await chapitre(page, 1, 0);
    await page.evaluate(() => startPrac('var'));
    await expect(page.locator('#prBanner')).toBeVisible();
    await expect(page.locator('#optsBtn')).toBeHidden();
  });
  test('Mode Expert allumé avant par un Grand débutant : sans effet tant que le bouton est caché', async ({ page }) => {
    await ouvrir(page, { stockage: { 'coach-parcours': 'debut', 'coach-expert': S({ on: true, best: {} }) } });
    await expect(page.locator('#optsBtn')).toBeHidden();
    expect(await page.evaluate(() => [expert, expertOn(), TOL])).toEqual([true, false, 1]);
    await expect(page.locator('#modeTag')).toBeHidden();
    // le chapitre 1 fini : le bouton revient, et Mode Expert avec lui (on peut l'éteindre)
    await page.evaluate(() => { for (let i = 0; i < 7; i++) stars[i] = 2; selectLesson(0); });
    expect(await page.evaluate(() => [expertOn(), TOL])).toEqual([true, .25]);
    await expect(page.locator('#modeTag')).toHaveText('Mode Expert');
    await options(page);
    await expect(page.locator('#expertBtn')).toHaveAttribute('aria-pressed', 'true');
  });
  test('sur un téléphone, la barre collée en bas tient sur une ligne, ⚙ à gauche', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await ouvrir(page, { stockage: APPRENTI });
    const [g, w, j] = await page.evaluate(() => ['optsBtn', 'watchBtn', 'startBtn'].map(id => { const r = $(id).getBoundingClientRect(); return [Math.round(r.left), Math.round(r.top), Math.round(r.bottom)]; }));
    expect(g[0]).toBeLessThan(w[0]); expect(w[0]).toBeLessThan(j[0]);
    expect(Math.abs(g[1] - j[1])).toBeLessThan(12);   // même ligne
    await options(page);
    const [p, b] = await page.evaluate(() => [$('optsPanel').getBoundingClientRect().bottom, $('optsBtn').getBoundingClientRect().top]);
    expect(p).toBeLessThanOrEqual(b);   // le menu s'ouvre au-dessus
  });
});
