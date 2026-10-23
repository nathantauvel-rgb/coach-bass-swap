// Lot 44 : chapitre 7 « Le set » (js/set.js). Plusieurs morceaux enchaînés sur les deux platines, qui jouent chacune leur
// tour ; la note part de 100 et chaque erreur coûte des points. S'ouvre avec le chapitre 2 (14 étoiles au chapitre 1).
const { test, expect } = require('@playwright/test');
const { ouvrir, sansBandeau } = require('./outils');

const OUVERT = { 'coach-ch2-ouvert': '1' };
const ch7 = async (page, n) => { await page.evaluate(() => setChapter(7)); await page.locator('.node').nth(n).click(); };
const jouer = async (page, bouton = '#startBtn') => { await page.locator(bouton).click(); await page.waitForFunction(() => !!run && !!run.set, null, { timeout: 60000 }); };
const resultat = async (page, ms = 150000) => { await expect(page.locator('#result')).toBeVisible({ timeout: ms }); return page.locator('#rDetails li').allTextContents(); };
// Le « robot » : la démo du set jouée comme une vraie partie (notée), par set.js lui-même (encAutomate)
// La note défile de 0 à sa valeur (700 ms) : on la lit une fois arrivée (lue trop tôt, elle valait 23 au lieu de 100)
const noteFinale = async page => { await page.waitForTimeout(1000); return +(await page.locator('#rNoteVal').textContent()); };
const ROBOT = 'window.ENC_ROBOT = true;';

test.describe('Le chapitre', () => {
  test('il s\'ouvre avec le chapitre 2 (14 étoiles au chapitre 1)', async ({ page }) => {
    const erreurs = await ouvrir(page);
    await page.locator('#chapBtn').click();
    const c7 = page.locator('#chapters .chap').nth(6);
    await expect(c7).toContainText('Le set'); await expect(c7).toBeDisabled(); await expect(c7).toContainText('Verrouillé');
    expect(erreurs).toEqual([]); await sansBandeau(page);
  });
  test('ouvert, il a 7 niveaux, compte dans le total d\'étoiles et montre la feuille de route', async ({ page }) => {
    const erreurs = await ouvrir(page, { stockage: OUVERT });
    await ch7(page, 0);
    await expect(page.locator('.node')).toHaveCount(7);
    await expect(page.locator('#ltitle')).toHaveText('Premier enchaînement');
    await expect(page.locator('#starTot')).toHaveText(/\/129$/);
    // la feuille de route : trois morceaux, A puis B puis A
    await expect(page.locator('#setRoute')).toBeVisible();
    await expect(page.locator('#setRouteList li:not(.sep)')).toHaveText([/«\sNéon\s»/, /«\sMinuit\s»/, /«\sVelours\s»/]);   // espaces insécables dans les guillemets
    await expect(page.locator('#setRouteList .enctag')).toHaveText(['A', 'B', 'A']);
    // « Pendant le niveau » laisse la place à la feuille de route ; la note est repliée dans « Comment c'est noté ? »
    await expect(page.locator('#plan')).toBeHidden();
    await expect(page.locator('#setNoteBox')).toBeVisible(); await expect(page.locator('#setNoteBox')).not.toHaveAttribute('open', '');
    await expect(page.locator('#setNoteTxt')).toContainText('Tu pars de 100 points.');
    await expect(page.locator('#modeTag')).toHaveText('Noté sur 100');
    await expect(page.locator('#styleTag')).toHaveText(/^3 morceaux · 124 BPM · environ/);
    await expect(page.locator('#cdLab')).toHaveText('record'); await expect(page.locator('#cdNum')).toHaveText('—');
    // le niveau 3 donne la technique de chaque transition, le niveau 7 cache ses morceaux
    await page.locator('.node').nth(2).click();
    await expect(page.locator('#setRouteList li.sep small')).toHaveText(['swap', 'filtre', 'écho']);
    await page.locator('.node').nth(6).click();
    await expect(page.locator('#setRouteNote')).toContainText('Six morceaux surprise');
    await expect(page.locator('#stage')).toHaveClass(/sansbpm/);
    expect(erreurs).toEqual([]); await sansBandeau(page);
  });
  test('il est une étape des trois parcours', async ({ page }) => {
    await ouvrir(page, { onglet: 'accueil' });
    const etapes = await page.evaluate(() => Object.fromEntries(Object.entries(PARCOURS).map(([k, p]) => [k, p.stages])));
    expect(etapes.debut.slice(-3)).toEqual(['ch6', 'ch7', 'vrai']);
    expect(etapes.apprenti.slice(0, 4)).toEqual(['expert', 'ch4', 'ch5', 'ch7']);
    expect(etapes.confirme[0]).toBe('ch7');
  });
});

test.describe('La note', () => {
  test('les plafonds de chaque critère et les étoiles', async ({ page }) => {
    await ouvrir(page, { stockage: OUVERT });
    await ch7(page, 0);
    const r = await page.evaluate(() => {
      const S = { sp: encSpecs(LESSONS[0]), pertes: new Map() }; run = { demo: true, set: S };
      encPerte(S, 'calage', 1, 50); encPerte(S, 'basses', 1, 3.4); encPerte(S, 'entree', 2, 30); encPerte(S, 'blanc', 2, ENC_BLANC);
      const liste = encListe(S).map(p => p.type + ':' + p.v), sc = encScore(S); run = null;
      return { liste, sc, e: [encEtoiles(90), encEtoiles(89), encEtoiles(75), encEtoiles(74)] };
    });
    // calage plafonné à 35, phrase à 20, la musique arrêtée en plus : 100 − 35 − 3 − 20 − 15 = 27
    expect(r.liste).toEqual(['calage:35', 'entree:20', 'blanc:15', 'basses:3']);
    expect(r.sc).toBe(27);
    expect(r.e).toEqual([3, 2, 2, 1]);
  });
});

test.describe('Pendant le set', () => {
  test('les platines jouent chacune leur tour, la barre d\'espace lance celle qui attend', async ({ page }) => {
    const erreurs = await ouvrir(page, { stockage: OUVERT });
    await ch7(page, 0); await jouer(page);
    await expect(page.locator('#setLigne')).toBeVisible(); await expect(page.locator('#setLigne')).toContainText('Morceau 1 sur 3');
    await expect(page.locator('#setLigne')).toContainText('Ensuite : B « Minuit »');
    await expect(page.locator('#cdLab')).toHaveText('/ 100'); await expect(page.locator('#cdNum')).toHaveText('100');
    expect(await page.evaluate(() => [deck.A.joue, deck.B.joue, run.set.en.A, run.set.en.B, Math.round(60 / deck.B.per)])).toEqual([true, false, 0, 1, 124]);
    await page.keyboard.press('Space');
    await expect.poll(() => page.evaluate(() => deck.B.joue)).toBe(true);
    // l'écho s'applique au morceau en cours (ici sur A)
    await page.evaluate(() => toggleEcho());
    expect(await page.evaluate(() => [echoOn, echoDeck])).toEqual([true, 'A']);
    await page.locator('#startBtn').click();
    await expect(page.locator('#setLigne')).toBeHidden();
    expect(erreurs).toEqual([]); await sansBandeau(page);
  });
  test('avec une table branchée, la table dessinée est rangée (et se ressort)', async ({ page }) => {
    const erreurs = await ouvrir(page, { stockage: Object.assign({}, OUVERT), midi: { branchee: true } });
    await ch7(page, 0);
    // la table est en position de départ (faders et LOW)
    await page.evaluate(() => { Object.assign(phys, { faderA: 1, faderB: 0, lowA: .5, lowB: .5 }); updateSetup(); });
    await jouer(page);
    await expect(page.locator('#stage')).toHaveClass(/rangee/);
    await expect(page.locator('.deck')).toBeHidden();
    await expect(page.locator('#setRange')).toContainText('la table à l’écran est rangée');
    await page.locator('#setTableBtn').click();
    await expect(page.locator('.deck')).toBeVisible();
    await expect(page.locator('#setTableBtn')).toHaveText('Ranger la table');
    await page.locator('#startBtn').click();
    expect(erreurs).toEqual([]); await sansBandeau(page);
  });
  test('« Je joue à la souris cette fois » : la table dessinée reste affichée (gardien)', async ({ page }) => {
    const erreurs = await ouvrir(page, { stockage: OUVERT, midi: { branchee: true } });
    await ch7(page, 0);
    await page.locator('#setupSkip').click();
    await jouer(page);
    await expect(page.locator('#stage')).not.toHaveClass(/rangee/);
    await expect(page.locator('.deck')).toBeVisible(); await expect(page.locator('#setRange')).toBeHidden();
    await page.locator('#startBtn').click();
    expect(erreurs).toEqual([]); await sansBandeau(page);
  });
});

test.describe('Corrections du gardien', () => {
  test('sur un PC 1366 × 768 avec une table : la position de départ tient en 4 lignes nommées, « Jouer » se voit', async ({ page }) => {
    const erreurs = await ouvrir(page, { stockage: OUVERT, midi: { branchee: true } });
    for (const n of [0, 2, 6]){
      await page.evaluate(() => window.scrollTo(0, 0));
      await ch7(page, n);
      await expect(page.locator('#setup')).toBeVisible();
      // plus la ligne facultative du bouton ON de l'effet, comme au niveau de l'écho du chapitre 1
      const lignes = (await page.locator('#setupList li').allTextContents()).filter(t => !t.includes('Bouton ON'));
      expect(lignes).toHaveLength(4);
      for (const t of lignes) expect(t).toMatch(/(Fader de volume|Potard LOW de) [AB]/);
      await expect(page.locator('#startBtn')).toBeInViewport({ ratio: 1 });
    }
    expect(erreurs).toEqual([]);
  });
  test('« C’était clair ? » d’un niveau du chapitre 7 est gardé au rechargement', async ({ page }) => {
    await ouvrir(page, { stockage: Object.assign({ 'coach-journal': JSON.stringify({ clair: { '7-0': 'oui' } }) }, OUVERT) });
    expect(await page.evaluate(() => jr.clair['7-0'])).toBe('oui');
  });
  test('au mini-set, le bouton à appuyer reste en orange même quand « Rejouer » est caché', async ({ page }) => {
    await ouvrir(page);
    await page.evaluate(() => { $('result').hidden = false; $('retry').hidden = true; $('next').hidden = false; resultatBoutons(1); });
    await expect(page.locator('#next')).toHaveClass(/go/);
  });
});

test.describe('Des sets entiers', () => {
  test.setTimeout(200000);
  test('niveau 1 joué proprement : 3 étoiles, note en grand, rien à travailler', async ({ page }) => {
    const erreurs = await ouvrir(page, { stockage: OUVERT, avant: ROBOT });
    await ch7(page, 0); await jouer(page);
    const items = await resultat(page);
    const note = await noteFinale(page);
    expect(note, items.join(' / ')).toBeGreaterThanOrEqual(90);
    await expect(page.locator('#rStars .on')).toHaveCount(3);
    await expect(page.locator('#rTitle')).toHaveText('Set de pro !');
    await expect(page.locator('#rGain')).toContainText('C’est ton premier record');
    await expect(page.locator('#rGain')).toContainText('+90 XP');
    expect(await page.evaluate(() => [JSON.parse(localStorage.getItem('coach-ch7'))[0], JSON.parse(localStorage.getItem('coach-set')).best[0] >= 90])).toEqual([3, true]);
    expect(erreurs).toEqual([]); await sansBandeau(page);
  });
  test('niveau 3 joué proprement : les trois techniques sont reconnues', async ({ page }) => {
    const erreurs = await ouvrir(page, { stockage: OUVERT, avant: ROBOT });
    await ch7(page, 2); await jouer(page);
    const items = await resultat(page, 190000);
    expect(items.join(' / ')).not.toContain('il fallait');
    expect(await noteFinale(page), items.join(' / ')).toBeGreaterThanOrEqual(90);
    expect(erreurs).toEqual([]); await sansBandeau(page);
  });
  test('sans rien toucher : la musique s\'arrête, les morceaux pas joués coûtent cher', async ({ page }) => {
    const erreurs = await ouvrir(page, { stockage: OUVERT });
    await ch7(page, 0); await jouer(page);
    const items = await resultat(page, 90000);
    expect(items.join(' / ')).toContain('La musique s’est arrêtée après « Néon »');
    expect(items.join(' / ')).toContain('2 morceaux n’ont pas été joués');
    expect(await noteFinale(page)).toBeLessThan(50);
    await expect(page.locator('#rStars .on')).toHaveCount(1);
    // « À travailler » : la plus grosse erreur, ce qu'elle a coûté, et le conseil de Vini ; le détail est replié
    await expect(page.locator('#rTravail')).toBeVisible();
    await expect(page.locator('#rQuoi')).toHaveText('2 morceaux n’ont pas été joués.');
    await expect(page.locator('#rCout')).toHaveText('Ça t’a coûté 60 points.');
    await expect(page.locator('#rAstuce')).toBeVisible();
    await expect(page.locator('#rTout')).not.toHaveAttribute('open', '');
    await expect(page.locator('#rToutSum')).toHaveText('Voir toutes mes erreurs (2)');
    await expect(page.locator('#retry')).toHaveClass(/go/);
    // gardien : la carte s'affiche en haut de la scène, ses boutons se voient sans défiler (ils étaient à 802 px sur 768)
    await expect(page.locator('#retry')).toBeInViewport({ ratio: 1 });
    expect(erreurs).toEqual([]); await sansBandeau(page);
  });
});
