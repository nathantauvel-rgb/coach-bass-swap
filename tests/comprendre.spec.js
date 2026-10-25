// Lot 48 : « Comprendre », sept petites leçons de théorie sans table, au doigt sur un téléphone.
const { test, expect } = require('@playwright/test');
const { ouvrir, sansBandeau } = require('./outils');

const S = o => JSON.stringify(o);
// Un iPhone : aucun de ses navigateurs (ni l'appli TikTok) ne sait parler aux tables
const SANS_MIDI = `Object.defineProperty(navigator, 'requestMIDIAccess', { value: undefined });
  Object.defineProperty(navigator, 'userAgent', { value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1' });`;
// Safari sur un Mac : pas de Web MIDI non plus, mais c'est un ordinateur
const MAC_SAFARI = `Object.defineProperty(navigator, 'requestMIDIAccess', { value: undefined });`;
const aujourdhui = () => { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
const FAUX_UMAMI = `window.__stats = []; window.umami = { track(n, d){ window.__stats.push(d === undefined ? [n] : [n, d]); } };`;
const NOUVEAU = { 'coach-guide-vu': null, 'coach-fiches': null, 'coach-accueil': null };
const etoiles = page => page.evaluate(() => JSON.parse(localStorage.getItem('coach-comprendre') || 'null'));
const carte = (page, l, i) => page.evaluate(([a, b]) => { cpLecon(a); cp.i = b; cpRend(); }, [l, i]);
const go = page => page.locator('#cpGo').click();
const suite = page => page.locator('#cpVBoutons button').first().click();
// Lance l'exercice de rythme, puis tape aux instants voulus (décalés de `ecart` secondes), à l'heure de l'horloge du son
async function taper(page, { ecart = .02, quels = null } = {}) {
  await page.locator('#cpPad').dispatchEvent('pointerdown');
  await page.evaluate(async ([e, q]) => {
    const tp = cp.tape, per = tp.e.per;
    const instants = q ? q.map(k => tp.e.t0 + k * per) : tp.attendus;
    for (const a of instants){ while (cpEntendu() < a + e) await new Promise(r => setTimeout(r, 5)); cpFrappe(a + e); }
  }, [ecart, quels]);
  await expect(page.locator('#cpVerdict')).toBeVisible({ timeout: 15000 });
}

test.describe('Sur un ordinateur, rien n\'est imposé', () => {
  test('l\'accueil garde sa prochaine étape ; les leçons sont en haut d\'« Apprendre », repliées', async ({ page }) => {
    const erreurs = await ouvrir(page, { onglet: 'accueil', stockage: { 'coach-parcours': 'debut', 'coach-guide-vu': '1' } });
    await expect(page.locator('#homeTitle')).not.toHaveText('Comprendre la musique');
    await expect(page.locator('#homeLien')).toBeHidden();
    await page.evaluate(() => { location.hash = '#apprendre'; });
    await expect(page.locator('#cpBloc')).toBeVisible();
    expect(await page.locator('#cpBloc').evaluate(d => d.open)).toBe(false);
    await expect(page.locator('#cpBlocN')).toHaveText('0/21 ★');
    await page.locator('#cpBloc summary').click();
    await expect(page.locator('#cpChemin .cp-lbtn')).toHaveCount(7);
    await expect(page.locator('#cpChemin .cp-lbtn b')).toHaveText(['Le temps', 'Compter jusqu’à 4', 'La vitesse', 'La phrase', 'Les parties d’un morceau', 'Grave, médium, aigu', 'La transition']);
    await expect(page.locator('#cpChemin .cp-lbtn').nth(0)).toBeEnabled();
    await expect(page.locator('#cpChemin .cp-lbtn').nth(1)).toBeDisabled();
    await expect(page.locator('#starTot')).toHaveText('0/150');
    expect(erreurs).toEqual([]); await sansBandeau(page);
  });
  test('Apprenti DJ et DJ confirmé : toutes les leçons sont ouvertes', async ({ page }) => {
    await ouvrir(page, { stockage: { 'coach-parcours': 'confirme' } });
    await page.locator('#cpBloc summary').click();
    for (let i = 0; i < 7; i++) await expect(page.locator('#cpChemin .cp-lbtn').nth(i)).toBeEnabled();
  });
});

test.describe('Sur un téléphone', () => {
  test('après les questions de Vini, on arrive sur la leçon 1 ; l\'accueil la propose ensuite', async ({ page }) => {
    const erreurs = await ouvrir(page, { onglet: '', stockage: NOUVEAU, avant: SANS_MIDI });
    await page.locator('#ppGo').click(); await page.locator('#ppOpts .pp-opt').nth(0).click(); await page.locator('#ppGo').click();
    await page.locator('#ppOpts .pp-opt').nth(1).click(); await page.locator('#ppGo').click();
    await page.locator('#ppOpts .pp-opt').nth(1).click(); await page.locator('#ppGo').click();
    await expect(page.locator('#cp')).toBeVisible();
    await expect(page.locator('.cp-kick')).toHaveText('Leçon 1 · Le temps');
    await expect(page.locator('#onb')).toBeHidden();   // pas de guide par-dessus
    await page.locator('#cpX').click();
    await expect(page.locator('#cp')).toBeHidden();
    await expect(page.locator('#homeTitle')).toHaveText('Comprendre la musique');
    await expect(page.locator('#homeCta')).toHaveText('Leçon 1 : Le temps');
    await expect(page.locator('#homeLien')).toBeVisible();
    await expect(page.locator('#homeStages li').first()).toContainText('Comprendre la musique');
    // dans « Apprendre », les leçons sont ouvertes d'office, et le guide ne s'ouvre pas tout seul
    await page.evaluate(() => { location.hash = '#apprendre'; });
    expect(await page.locator('#cpBloc').evaluate(d => d.open)).toBe(true);
    await expect(page.locator('#onb')).toBeHidden();
    expect(erreurs).toEqual([]); await sansBandeau(page);
  });
  test('« M’envoyer le lien » donne l\'adresse du site', async ({ page }) => {
    await ouvrir(page, { onglet: 'accueil', stockage: { 'coach-parcours': 'debut' }, avant: SANS_MIDI + `try { delete Navigator.prototype.share; } catch (e) {}` });
    await page.locator('#homeLienBtn').click();
    await expect(page.locator('#homeLienBtn')).toHaveText(/Lien copié|localhost/);
  });
  test('à la fin d\'une leçon, sans compte, on propose d\'en créer un', async ({ page }) => {
    test.setTimeout(60000);
    await ouvrir(page, { avant: SANS_MIDI });
    await carte(page, 0, 4);
    await taper(page); await suite(page);
    await expect(page.locator('.cp-garde')).toContainText('retrouver sur ton ordinateur');
    await page.locator('.cp-garde .cp-lien').click();
    await expect(page.locator('#cp')).toBeHidden();
    await expect(page.locator('#compte')).toBeVisible();
    await expect(page.locator('#cptGo')).toHaveText('Créer mon compte');
  });
});

test.describe('Une leçon', () => {
  test('la leçon 1 entière, tout juste du premier coup : 3 étoiles, 30 XP, la leçon 2 s\'ouvre', async ({ page }) => {
    test.setTimeout(90000);
    const erreurs = await ouvrir(page, { avant: FAUX_UMAMI });
    await page.evaluate(() => cpLecon(0));
    await expect(page.locator('#cpTitre')).toContainText('grosse caisse');
    await page.locator('.cp-ecoute').click();
    await expect(page.locator('.cp-points i.on')).toHaveCount(1, { timeout: 3000 });   // les ronds s'allument avec le son
    await go(page); await go(page);
    await expect(page.locator('#cpTitre')).toHaveText('Tape sur chaque « boum »');
    await taper(page);
    await expect(page.locator('#cpVTitre')).toHaveText('Bien joué !');
    await expect(page.locator('#cpCoups i.ok')).toHaveCount(8);
    await suite(page);
    await page.locator('.cp-opt').nth(1).click(); await go(page);
    await expect(page.locator('#cpVTitre')).toHaveText('Bien vu !');
    await suite(page);
    await taper(page); await suite(page);
    await expect(page.locator('.cp-ftitre')).toHaveText('Leçon terminée !');
    await expect(page.locator('.cp-etoiles .on')).toHaveCount(3);
    await expect(page.locator('.cp-gain')).toContainText('+30 XP');
    await expect(page.locator('.cp-retenir')).toContainText('Un temps, c’est un « boum »');
    expect(await etoiles(page)).toEqual({ 0: 3 });
    await expect(page.locator('#starTot')).toHaveText('3/150');
    await expect(page.locator('#xpTxt')).toHaveText('30 XP');
    expect(await page.evaluate(() => window.__stats.map(e => e[0]))).toContain('comprendre-1');
    await page.locator('.cp-fin .cp-vgo').click();   // « Leçon suivante »
    await expect(page.locator('.cp-kick')).toHaveText('Leçon 2 · Compter jusqu’à 4');
    expect(erreurs).toEqual([]); await sansBandeau(page);
  });
  test('les erreurs : « Réessayer » une fois, et la note baisse', async ({ page }) => {
    test.setTimeout(90000);
    await ouvrir(page);
    await carte(page, 0, 2);
    await taper(page, { ecart: .24 });   // tout trop tard (un demi-temps plus loin, ce serait « un peu tôt » sur le temps suivant)
    await expect(page.locator('#cpVTitre')).toHaveText('Presque');
    await expect(page.locator('#cpVBoutons button')).toHaveText(['Réessayer', 'Passer']);
    await suite(page);   // Réessayer
    await taper(page);
    await expect(page.locator('#cpVTitre')).toHaveText('Bien joué !');
    await suite(page);
    await page.locator('.cp-opt').nth(0).click(); await go(page);   // mauvais choix
    await expect(page.locator('#cpVTitre')).toHaveText('Pas tout à fait');
    await expect(page.locator('.cp-opt.juste')).toHaveCount(1); await expect(page.locator('.cp-opt.faux')).toHaveCount(1);
    await expect(page.locator('#cpVBoutons button')).toHaveText(['Compris']);
    await suite(page);
    await taper(page); await suite(page);
    // juste du premier coup : 1 exercice sur 3 → 1 étoile
    await expect(page.locator('.cp-etoiles .on')).toHaveCount(1);
    expect(await etoiles(page)).toEqual({ 0: 1 });
  });
  test('taper sur le « 1 » : frapper sur d\'autres temps compte contre', async ({ page }) => {
    test.setTimeout(60000);
    await ouvrir(page, { stockage: { 'coach-comprendre': S({ 0: 3 }) } });
    await carte(page, 1, 3);
    await expect(page.locator('#cpCoups i')).toHaveCount(4);
    await taper(page, { quels: [4, 6, 8, 10, 12, 16] });
    await expect(page.locator('#cpVTexte')).toContainText('Tu as tapé sur d’autres temps');
    await suite(page);
    await taper(page, { quels: [4, 8, 12, 16] });
    await expect(page.locator('#cpVTitre')).toHaveText('Bien joué !');
  });
  test('la phrase : taper au début de la phrase suivante', async ({ page }) => {
    test.setTimeout(60000);
    await ouvrir(page, { stockage: { 'coach-parcours': 'confirme' } });
    await carte(page, 3, 2);
    await expect(page.locator('#cpCorps .cp-mesures i')).toHaveCount(8);
    await taper(page, { ecart: .05 });
    await expect(page.locator('#cpVTexte')).toHaveText('Pile au début de la nouvelle phrase.');
  });
  test('la phrase : taper une mesure trop tôt est raté', async ({ page }) => {
    test.setTimeout(60000);
    await ouvrir(page, { stockage: { 'coach-parcours': 'confirme' } });
    await carte(page, 3, 2);
    await taper(page, { quels: [14] });
    await expect(page.locator('#cpVTitre')).toHaveText('Presque');
    await expect(page.locator('#cpVTexte')).toContainText('Trop tôt');
  });
  test('remettre dans l\'ordre, juste puis faux', async ({ page }) => {
    await ouvrir(page, { stockage: { 'coach-parcours': 'confirme' } });
    await carte(page, 4, 5);
    await expect(page.locator('#cpGo')).toBeDisabled();
    for (const t of ['Intro', 'Break', 'Drop', 'Outro']) await page.locator('.cp-puce', { hasText: t }).click();
    await go(page);
    await expect(page.locator('#cpVTitre')).toHaveText('Bien vu !');
    // la leçon présente le drop avant le break : cet ordre-là est juste aussi (gardien du lot 48)
    await carte(page, 4, 5);
    for (const t of ['Intro', 'Drop', 'Break', 'Outro']) await page.locator('.cp-puce', { hasText: t }).click();
    await go(page);
    await expect(page.locator('#cpVTitre')).toHaveText('Bien vu !');
    await expect(page.locator('#cpCases li.juste')).toHaveCount(4);
    await carte(page, 4, 5);
    for (const t of ['Drop', 'Intro', 'Break', 'Outro']) await page.locator('.cp-puce', { hasText: t }).click();
    await page.locator('.cp-dans', { hasText: 'Drop' }).click();   // on peut retirer une partie posée
    await expect(page.locator('#cpGo')).toBeDisabled();
    await page.locator('.cp-puce', { hasText: 'Drop' }).click();
    await go(page);
    await expect(page.locator('#cpVTitre')).toHaveText('Pas tout à fait');
    await expect(page.locator('#cpVTexte')).toContainText('l’outro à la fin');
  });
  test('au clavier : Espace tape, Échap ferme', async ({ page }) => {
    await ouvrir(page);
    await carte(page, 0, 2);
    await page.keyboard.press('Space');
    expect(await page.evaluate(() => !!cp.tape)).toBe(true);
    await page.keyboard.press('Escape');
    await expect(page.locator('#cp')).toBeHidden();
    await expect(page.locator('#startBtn')).toHaveText('Jouer');   // la barre d'espace n'a pas lancé de partie
  });
  test('tous les sons des sept leçons se fabriquent sans erreur', async ({ page }) => {
    const erreurs = await ouvrir(page);
    const n = await page.evaluate(() => { let k = 0; ensureAudio();
      for (const L of CP_LECONS) for (const c of L.cartes){ const sons = [c.son].concat((c.options || []).map(o => o.son)).filter(Boolean);
        for (const s of sons){ const e = cpJoue(s); if (!(e.fin > e.t0)) throw new Error('son vide'); k++; } }
      cpStop(); return k; });
    expect(n).toBeGreaterThan(20);
    expect(erreurs).toEqual([]);
  });
});

test.describe('Corrections du gardien', () => {
  test('l\'objectif du jour atteint pendant une leçon : l\'écran de la série s\'affiche, Échap ne ferme que lui', async ({ page }) => {
    test.setTimeout(60000);
    await ouvrir(page, { stockage: { 'coach-objectif': S({ min: 5, jours: { [aujourdhui()]: 295 }, faits: [] }) } });
    await carte(page, 0, 4); await taper(page); await suite(page);
    await expect(page.locator('#serie')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.locator('#serie')).toBeHidden();
    await expect(page.locator('#cp')).toBeVisible();
    await expect(page.locator('.cp-ftitre')).toHaveText('Leçon terminée !');
  });
  test('Safari sur un Mac est un ordinateur : niveau 1 après les questions, pas de lien d\'envoi', async ({ page }) => {
    await ouvrir(page, { onglet: '', stockage: NOUVEAU, avant: MAC_SAFARI });
    await page.locator('#ppGo').click(); await page.locator('#ppOpts .pp-opt').nth(0).click(); await page.locator('#ppGo').click();
    await page.locator('#ppOpts .pp-opt').nth(1).click(); await page.locator('#ppGo').click();
    await page.locator('#ppOpts .pp-opt').nth(1).click(); await page.locator('#ppGo').click();
    await expect(page.locator('#cp')).toBeHidden();
    await expect(page.locator('#vLearn')).toBeVisible();
    await page.evaluate(() => { location.hash = '#accueil'; });
    await expect(page.locator('#homeLien')).toBeHidden();
  });
  test('taper sans arrêt ne réussit pas « Tape sur chaque boum »', async ({ page }) => {
    test.setTimeout(60000);
    await ouvrir(page);
    await carte(page, 0, 2);
    await page.locator('#cpPad').dispatchEvent('pointerdown');
    await page.evaluate(async () => { const tp = cp.tape; for (let t = tp.e.t0 + 3.6 * tp.e.per; t < tp.e.fin; t += .12){ while (cpEntendu() < t) await new Promise(r => setTimeout(r, 5)); cpFrappe(t); } });
    await expect(page.locator('#cpVerdict')).toBeVisible({ timeout: 15000 });
    await expect(page.locator('#cpVTitre')).toHaveText('Presque');
    await expect(page.locator('#cpVTexte')).toContainText('Un seul tap par « boum »');
  });
  test('toutes les frappes en retard du même écart : le conseil des écouteurs sans fil', async ({ page }) => {
    test.setTimeout(60000);
    await ouvrir(page);
    await carte(page, 0, 2);
    await taper(page, { ecart: .22 });
    await expect(page.locator('#cpVTexte')).toContainText('écouteurs sans fil');
  });
  test('Espace tenu enfoncé n\'envoie pas une rafale de frappes ; le rond compte 1, 2, 3, 4', async ({ page }) => {
    await ouvrir(page);
    await carte(page, 0, 2);
    await page.keyboard.down('Space'); await page.keyboard.down('Space'); await page.keyboard.down('Space');
    expect(await page.evaluate(() => [!!cp.tape, cp.tape.frappes.length])).toEqual([true, 0]);
    await page.keyboard.up('Space');
    await expect(page.locator('#cpPad')).toHaveText('1', { timeout: 3000 });
    await expect(page.locator('#cpPad')).toHaveText('2', { timeout: 3000 });
  });
  test('rouvrir le choix du parcours cache le lien d\'envoi', async ({ page }) => {
    await ouvrir(page, { onglet: 'accueil', stockage: { 'coach-parcours': 'debut' }, avant: SANS_MIDI });
    await expect(page.locator('#homeLien')).toBeVisible();
    await page.evaluate(() => { parcoursPick = true; renderHome(); });   // ce que fait « Changer de parcours »
    await expect(page.locator('#homeLien')).toBeHidden();
  });
  test('la première explication dit quoi faire si on n\'entend rien', async ({ page }) => {
    await ouvrir(page);
    await page.evaluate(() => cpLecon(0));
    await expect(page.locator('#cpCorps')).toContainText('enlève le mode silencieux');
  });
});

test.describe('Ailleurs sur le site', () => {
  test('les étoiles comptent pour le compte, « Mes progrès » et le rapport des testeurs', async ({ page }) => {
    await ouvrir(page, { onglet: 'progres', stockage: { 'coach-comprendre': S({ 0: 3, 1: 2 }) } });
    expect(await page.evaluate(() => cptPoids({ 'coach-comprendre': '{"0":3}' }))).toBe(3);
    expect(await page.evaluate(() => cptResume({ 'coach-comprendre': '{"0":3,"1":2}' }))).toContain('5 étoiles');
    await expect(page.locator('#pgChaps li').first()).toContainText('Comprendre');
    await expect(page.locator('#pgChaps li').first()).toContainText('5 ★ sur 21');
    expect(await page.evaluate(() => avisRapport())).toContain('Comprendre 5/21');
    await expect(page.locator('#starTot')).toHaveText('5/150');
    await expect(page.locator('#xpTxt')).toHaveText('50 XP');
  });
  test('une valeur abîmée dans coach-comprendre ne bloque rien', async ({ page }) => {
    const erreurs = await ouvrir(page, { stockage: { 'coach-comprendre': '{"0":9,"x":2' } });
    expect(await page.evaluate(() => cpStars)).toEqual({});
    await expect(page.locator('#starTot')).toHaveText('0/150');
    expect(erreurs).toEqual([]); await sansBandeau(page);
  });
});
