// Lot 82 « Le chapitre 1 offert » (22 nov. 2026). Décision de l'utilisateur : « laisse le premier chapitre gratuit
// entièrement », et le meilleur moment pour payer au chapitre 2. Maquette v2 validée (captures/maquette-ch1-offert/ du
// dossier principal) : la grande carte au niveau 7, la grande fenêtre Pro gardée au clic sur le chapitre 2 avec la démo en
// image, la démo d'un chapitre fermé, la petite proposition gardée aux niveaux 1 et 2 seulement. Sa règle du même jour :
// très peu d'écriture.
const { test, expect } = require('@playwright/test');
const { ouvrir } = require('./outils');

const S = o => JSON.stringify(o);
const PRO = 'window.DJINGOOD_PRO = true;';
const UMAMI = 'window.__stats = []; window.umami = { track(n, d){ window.__stats.push(d === undefined ? [n] : [n, d]); } };';
const etoiles = o => ({ 'coach-lecons': S(o) });
const SIX = etoiles({ 0: 3, 1: 2, 2: 3, 3: 2, 4: 3, 5: 2 });            // niveaux 1 à 6 réussis, le 7 jamais
const SEPT = etoiles({ 0: 3, 1: 2, 2: 3, 3: 2, 4: 3, 5: 2, 6: 3 });     // tout le chapitre 1 : 18 ★
const stats = page => page.evaluate(() => window.__stats || []);
// La carte de résultat d'une partie réussie au niveau i (comme finish), avec une table branchée
const resultat = (page, i, st = 3) => page.evaluate(({ i, st }) => {
  midiCount = 1; selectLesson(i); const before = stars[i] || 0; stars[i] = Math.max(before, st);
  $('rTitle').textContent = 'Parfait, transition de pro !'; $('rGain').textContent = '+30 XP';
  $('result').hidden = false; resultatCarte(st, [['ok', 'Pile.', 1]]); $('next').hidden = false; resultatBoutons(st);
  if (!essaiTot(1, st)) mlPropose(st); finEssai(1, st, before);
}, { i, st });

test.describe('Le chapitre 1 gratuit', () => {
  test('les 7 niveaux du chapitre 1 se jouent sans Pro (Mode Expert compris) ; les chapitres 2 à 7 restent dans Pro', async ({ page }) => {
    const err = await ouvrir(page, { avant: PRO, stockage: SIX });
    expect(await page.evaluate(() => BASE_LESSONS.map((_, i) => niveauPro(1, i)))).toEqual([false, false, false, false, false, false, false]);
    expect(await page.evaluate(() => [2, 3, 4, 5, 6, 7].map(chapitrePro))).toEqual([true, true, true, true, true, true]);
    await page.locator('.node').nth(6).click();
    await expect(page.locator('#ltitle')).toHaveText('La transition complète');
    await expect(page.locator('#startBtn')).toHaveText('Jouer');
    await expect(page.locator('#nivFin')).toBeHidden();
    await expect(page.locator('#watchBtn')).toBeVisible();
    expect(await page.evaluate(() => { expert = true; return BASE_LESSONS.every((_, i) => { selectLesson(i); return !proIci(); }); })).toBe(true);
    expect(err).toEqual([]);
  });

  test('le défi du jour tourne sur les 7 niveaux ; « Vérifier ma table » fait jouer le swap des basses', async ({ page }) => {
    await ouvrir(page, { avant: PRO, stockage: SEPT });
    expect(await page.evaluate(() => pracPool().length)).toBe(7);
    expect(await page.evaluate(() => BASE_LESSONS[vfNivMusique()].title)).toBe('Le swap des basses');
  });
});

test.describe('La grande carte, au niveau 7', () => {
  test('le niveau 7 réussi la première fois : la suite en 4 tuiles, l’essai, la démo, « Plus tard » ; elle tient dans 1366 × 768', async ({ page }) => {
    await page.setViewportSize({ width: 1366, height: 768 });
    const err = await ouvrir(page, { avant: PRO + UMAMI, stockage: SIX });
    await resultat(page, 6);
    await expect(page.locator('#rTitle')).toHaveText('Ta première transition complète !');
    await expect(page.locator('#rGain')).toHaveText('Chapitre 1 terminé · 18 ★');
    await expect(page.locator('#rPro .rpro-t')).toHaveText('ProLa suite : mixer seul');
    await expect(page.locator('#rProNiv li')).toHaveText(['Chapitre 2À l’oreille', 'Chapitre 3Les vrais morceaux', 'Chapitre 5Caler sans SYNC', 'Chapitre 7Ton premier set']);
    await expect(page.locator('#rProEssaiTxt')).toHaveText('7 jours gratuits, puis 49,99 € pour l’année (soit 4,17 € par mois). Rien n’est prélevé avant le 7e jour.');
    await expect(page.locator('#rProDemo')).toHaveText('Voir la démo du chapitre 2');
    await expect(page.locator('#rProGo')).toHaveText('Commencer mes 7 jours gratuits');
    await expect(page.locator('#rProTard')).toBeVisible();
    // une seule chose à faire : ni « Rejouer », ni « Niveau suivant », ni le détail, ni la petite proposition
    for (const id of ['#retry', '#next', '#rTout', '#rTravail', '#rEssai', '#rCompte']) await expect(page.locator(id)).toBeHidden();
    const r = await page.evaluate(() => ({ bas: $('rProGo').getBoundingClientRect().bottom, carte: document.querySelector('.rcard').getBoundingClientRect().bottom, h: innerHeight }));
    expect(r.bas).toBeLessThanOrEqual(r.h); expect(r.carte).toBeLessThanOrEqual(r.h);
    expect((await stats(page)).filter(s => s[0] === 'ch1-fini')).toHaveLength(1);
    await page.locator('#rProTard').click();
    await expect(page.locator('#result')).toBeHidden();
    await expect(page.locator('#pro')).toBeHidden();
    expect(err).toEqual([]);
  });

  test('le niveau 3 n’a plus la grande carte, ni le niveau 7 déjà réussi ; la carte suivante retrouve « Rejouer » et le détail', async ({ page }) => {
    await ouvrir(page, { avant: PRO + UMAMI, stockage: SEPT });
    await resultat(page, 2);
    await expect(page.locator('#rPro')).toBeHidden();
    await expect(page.locator('#rTitle')).toHaveText('Parfait, transition de pro !');
    await resultat(page, 6);   // 3 étoiles avant : déjà réussi
    await expect(page.locator('#rPro')).toBeHidden();
    await expect(page.locator('#retry')).toBeVisible();
    await expect(page.locator('#rTout')).toBeVisible();
    expect((await stats(page)).filter(s => s[0] === 'ch1-fini' || s[0] === 'essai-fini')).toEqual([]);
  });

  test('« Commencer mes 7 jours gratuits » : après le paiement, on ouvre le chapitre 2', async ({ page }) => {
    await ouvrir(page, { avant: PRO, stockage: SEPT });
    expect(await page.evaluate(() => proPour('', { fin: true }))).toEqual({ voulu: 'chap:2', contexte: 'Tu as fini le chapitre 1', depuis: 'fin' });
    expect(await page.evaluate(() => proSuite('chap:2')[1])).toBe('Aller au chapitre 2');
  });
});

test.describe('La petite proposition d’essai', () => {
  test('gardée après une réussite aux niveaux 1 et 2 avec la table, plus jamais aux niveaux 3 à 6', async ({ page }) => {
    await ouvrir(page, { avant: PRO, stockage: etoiles({}) });
    const vue = [];
    for (const i of [0, 1, 2, 3, 4, 5]){ await resultat(page, i); vue.push(await page.locator('#rEssai').isVisible()); }
    expect(vue).toEqual([true, true, false, false, false, false]);
  });
});

test.describe('Le clic sur le chapitre 2 : la grande fenêtre Pro, avec la démo en image', () => {
  test('la fenêtre d’avant, l’image de la démo à la place de la phrase sous le titre, et ce qui est payant dit juste', async ({ page }) => {
    const err = await ouvrir(page, { avant: PRO, stockage: SEPT });
    await page.evaluate(() => setChapter(2));
    await expect(page.locator('#pro')).toBeVisible();
    await expect(page.locator('#proContexteTxt')).toHaveText('Pour ouvrir le chapitre 2 : « La maîtrise »');
    await expect(page.locator('#proDemo')).toBeVisible();
    await expect(page.locator('#proSous')).toBeHidden();
    await expect(page.locator('#proDemoTxt')).toHaveText('Voir la démo du chapitre 2');
    expect(await page.locator('#proDemoImg').evaluate(i => i.complete && i.naturalWidth)).toBe(966);
    await expect(page.locator('.pro-atouts li').first()).toContainText('Les chapitres 2 à 7');
    await expect(page.locator('.pro-atouts li').first()).toContainText(`${await page.evaluate(() => proNbExercices())} exercices de plus : à l’oreille, le calage`);
    await expect(page.locator('.pro-atouts li').first()).not.toContainText('swap');
    await expect(page.locator('.pro-vg strong')).toHaveText(['La maîtrise', 'Les vrais morceaux', 'Le calage', 'Hot cues et boucles', 'Le set']);
    expect(err).toEqual([]);
  });

  test('sans chapitre (le menu, un tuto) : la fenêtre d’avant, sans image ; un chapitre fermé du menu « Tous les niveaux » : avec', async ({ page }) => {
    await ouvrir(page, { avant: PRO, stockage: SEPT });
    await page.evaluate(() => proOuvre(''));
    await expect(page.locator('#proDemo')).toBeHidden(); await expect(page.locator('#proSous')).toBeVisible();
    await page.evaluate(() => { proFerme(); proOuvre('swap'); });
    await expect(page.locator('#proDemo')).toBeHidden();
    await page.evaluate(() => { proFerme(); proOuvre('', { chap: 5 }); });
    await expect(page.locator('#proDemoTxt')).toHaveText('Voir la démo du chapitre 5');
  });

  test('la démo : elle joue sur la table du site, la barre garde l’essai ; « Fermer » ramène à la fenêtre, rien n’est enregistré', async ({ page }) => {
    const err = await ouvrir(page, { avant: PRO + UMAMI, stockage: Object.assign({ 'coach-chapitre': '1' }, SEPT) });
    await page.evaluate(() => setChapter(2));
    await page.locator('#proDemo').click();
    await expect(page.locator('#pro')).toBeHidden();
    await expect(page.locator('#apercu')).toBeVisible();
    await expect(page.locator('#apercuTitre')).toHaveText('Chapitre 2 · La maîtrise');
    await expect(page.locator('#apercuGo')).toHaveText('Commencer mes 7 jours gratuits');
    await expect.poll(() => page.evaluate(() => !!run && run.demo), { timeout: 20000 }).toBe(true);
    expect(await page.evaluate(() => ({ ch: chapter, li }))).toEqual({ ch: 2, li: 0 });
    await expect(page.locator('#nivFin')).toBeHidden();
    expect((await stats(page)).filter(s => s[0] === 'demo-pro')).toEqual([['demo-pro', { chap: '2', depuis: 'fenetre' }]]);
    await page.locator('#apercuX').click();
    await expect(page.locator('#apercu')).toBeHidden();
    expect(await page.evaluate(() => ({ run: !!run, ch: chapter, apercu }))).toEqual({ run: false, ch: 1, apercu: null });
    await expect(page.locator('#pro')).toBeVisible();
    await expect(page.locator('#proContexteTxt')).toHaveText('Pour ouvrir le chapitre 2 : « La maîtrise »');
    expect(await page.evaluate(() => [localStorage.getItem('coach-chapitre'), JSON.parse(localStorage.getItem('coach-ch2') || '{}')])).toEqual(['1', {}]);
    expect(err).toEqual([]);
  });

  test('depuis la grande carte : « Arrêter » rouvre la fenêtre ; changer d’onglet pendant la démo ne rouvre rien', async ({ page }) => {
    await ouvrir(page, { avant: PRO, stockage: SIX });
    await resultat(page, 6);
    await page.locator('#rProDemo').click();
    await expect(page.locator('#result')).toBeHidden();
    await expect.poll(() => page.evaluate(() => !!run && run.demo), { timeout: 20000 }).toBe(true);
    await page.locator('#startBtn').click();   // « Arrêter »
    await expect(page.locator('#pro')).toBeVisible();
    await expect(page.locator('#apercu')).toBeHidden();
    await page.evaluate(() => proFerme());
    await page.evaluate(() => apercuDemarre(2, 0, 'fin'));
    await expect.poll(() => page.evaluate(() => !!run && run.demo), { timeout: 20000 }).toBe(true);
    await page.evaluate(() => { location.hash = '#accueil'; });
    await expect(page.locator('#vHome')).toBeVisible();
    expect(await page.evaluate(() => ({ run: !!run, apercu, ch: chapter }))).toEqual({ run: false, apercu: null, ch: 1 });
    await expect(page.locator('#pro')).toBeHidden();
    await expect(page.locator('#apercu')).toBeHidden();
  });

  test('un ancien abonné qui revient sur le chapitre 2 (la carte du niveau) : « Voir la démo » montre ce niveau, puis on revient sur la carte', async ({ page }) => {
    await ouvrir(page, { avant: PRO, stockage: Object.assign({ 'coach-chapitre': '2' }, SEPT) });
    await expect(page.locator('#nivFin')).toBeVisible();
    await expect(page.locator('#nivFinTitre')).toHaveText('« Le bon moment » est dans DJingood Pro');
    await expect(page.locator('#nivFinSur')).toHaveText('Chapitre 2 · La maîtrise');
    await page.locator('#nivFinDemo').click();
    await expect.poll(() => page.evaluate(() => !!run && run.demo && chapter === 2 && li === 0), { timeout: 30000 }).toBe(true);
    await expect(page.locator('#apercu')).toBeVisible();
    await page.locator('#apercuX').click();
    await expect(page.locator('#nivFin')).toBeVisible();
    await expect(page.locator('#pro')).toBeHidden();
  });

  test('sur un téléphone, pas d’image de démo dans la fenêtre Pro (on y envoie vers l’ordinateur)', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await ouvrir(page, { avant: PRO + 'const mm = window.matchMedia.bind(window); window.matchMedia = q => /pointer: coarse/.test(q) ? { matches: true, addEventListener(){}, removeEventListener(){} } : mm(q);', stockage: SEPT });
    test.skip(!(await page.evaluate(() => typeof cpMobile === 'function' && cpMobile())), 'ce navigateur de test n’est pas vu comme un téléphone');
    await page.evaluate(() => proOuvre('', { chap: 2 }));
    await expect(page.locator('#proDemo')).toBeHidden();
  });
});

test.describe('Corrections du gardien', () => {
  test('on change de chapitre pendant la préparation de la démo : la barre disparaît, les niveaux de Pro restent fermés', async ({ page }) => {
    await ouvrir(page, { avant: PRO, stockage: SEPT });
    await page.evaluate(() => { apercuDemarre(2, 0, 'fenetre'); setChapter(1); });
    await expect.poll(() => page.evaluate(() => apercu), { timeout: 20000 }).toBe(null);
    await expect(page.locator('#apercu')).toBeHidden();
    expect(await page.evaluate(() => [chapter, !!run])).toEqual([1, false]);
    expect(await page.evaluate(() => { LESSONS = lessonsOf(2); chapter = 2; selectLesson(1); return proIci(); })).toBe(true);
  });

  test('« Jouer » pendant l’aperçu (la démo pas encore partie) : jamais une vraie partie de Pro, la fenêtre Pro revient', async ({ page }) => {
    await ouvrir(page, { avant: PRO, stockage: SEPT });
    await page.evaluate(() => { apercuDemarre(2, 0, 'fenetre'); preparing = false; startRun(false); });
    await expect(page.locator('#pro')).toBeVisible();
    await expect(page.locator('#apercu')).toBeHidden();
    expect(await page.evaluate(() => [apercu, chapter])).toEqual([null, 1]);
  });

  test('l’accueil : après le chapitre 1, l’étape « S’entraîner » ne promet que le défi du jour gratuit', async ({ page }) => {
    await ouvrir(page, { avant: PRO, onglet: 'accueil', stockage: Object.assign({ 'coach-parcours': 'debut' }, SEPT) });
    await expect(page.locator('#homeTitle')).toHaveText('S\'entraîner');
    await expect(page.locator('#homeLead')).toHaveText('Refais les 7 gestes sur d’autres morceaux : un défi par jour, gratuit.');
  });
});

test.describe('Les parcours et le plan', () => {
  test('Apprenti DJ et DJ confirmé gardent leurs 3 niveaux en Mode Expert avant leur vraie étape', async ({ page }) => {
    await ouvrir(page, { avant: PRO, onglet: 'accueil', stockage: { 'coach-parcours': 'confirme' } });
    await expect(page.locator('#homeTitle')).toHaveText('Tes 3 premiers gestes');
    await page.evaluate(() => { [0, 1, 2].forEach(i => { xBest[i] = 80; }); renderHome(); });
    await expect(page.locator('#homeTitle')).toHaveText('Le set');
    await expect(page.locator('#homeCta')).toHaveText('Continuer avec Pro');
    await page.evaluate(() => setParcours('apprenti'));
    await expect(page.locator('#homeTitle')).toHaveText('Les bases en Mode Expert');
    await expect(page.locator('#homeCta')).not.toHaveText('Continuer avec Pro');
  });

  test('le plan du Grand débutant : les 7 gestes du chapitre 1 gratuits, puis Pro', async ({ page }) => {
    await ouvrir(page, { avant: PRO });
    const plan = (p, tel = false) => page.evaluate(({ p, tel }) => PP_PLAN_PRO[p](tel).map(x => [x[2], x[4]]), { p, tel });
    expect(await plan('debut')).toEqual([['Les 7 gestes du chapitre 1', 'gratuit'], ['À l’oreille, sans SYNC', 'pro'], ['Jusqu’au set noté sur 100', 'pro']]);
    expect((await plan('debut', true))[1]).toEqual(['Les 7 gestes du chapitre 1', 'gratuit']);
    expect((await plan('apprenti'))[0]).toEqual(['Tes 3 premiers gestes, en Mode Expert', 'gratuit']);
  });
});

test.describe('En anglais', () => {
  const EN = { 'coach-langue': 'en' };
  test('la grande carte, la fenêtre Pro et sa démo, la barre de la démo : tout est traduit', async ({ page }) => {
    await ouvrir(page, { avant: PRO, stockage: Object.assign({}, SIX, EN) });
    await resultat(page, 6);
    await expect(page.locator('#rTitle')).toHaveText('Your first complete transition!');
    await expect(page.locator('#rGain')).toHaveText('Chapter 1 done · 18 ★');
    await expect(page.locator('#rProNiv li').nth(2)).toHaveText('Chapter 5Beatmatch without SYNC');
    await expect(page.locator('#rProEssaiTxt')).toHaveText("7 days free, then €49.99 for the year (that's €4.17 a month). Nothing is charged before day 7.");
    await expect(page.locator('#rProDemo')).toHaveText('Watch the chapter 2 demo');
    await expect(page.locator('#rProTard')).toHaveText('Later');
    await page.evaluate(() => { $('result').hidden = true; setChapter(2); });
    await expect(page.locator('#proDemoTxt')).toHaveText('Watch the chapter 2 demo');
    expect(await page.locator('#proDemoImg').getAttribute('src')).toBe('img/en/demo-apercu.jpg');
    await expect(page.locator('.pro-atouts li').first()).toContainText('Chapters 2 to 7');
    await expect(page.locator('.pro-vg-mot').nth(1)).toHaveText('REAL TRACKS');
    await page.locator('#proDemo').click();
    await expect(page.locator('#apercuTitre')).toHaveText(/^Chapter 2 · /);
    await expect(page.locator('.apercu-tag')).toHaveText('Demo');
    await expect(page.locator('#apercuX')).toHaveText('Close');
    expect(await page.evaluate(() => [...window.__enManque])).toEqual([]);
  });
});
