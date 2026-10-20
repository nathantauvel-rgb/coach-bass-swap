// Lot 39, étape 1 : le moteur de la table complète (js/platines.js et audio.js). Aigus, TRIM, filtre de B, crossfader,
// casque, tempo, molette, PLAY, CUE, hot cues, boucles et mesure du calage. Rien n'est encore à l'écran : on vérifie le son
// et les positions directement. Au neutre, rien ne doit changer pour les niveaux existants.
const { test, expect } = require('@playwright/test');
const { ouvrir, sansBandeau } = require('./outils');

// Un morceau muet de 60 s à 120 BPM (un temps = 0,5 s), posé sur une platine
const prepare = page => page.evaluate(() => { ensureAudio(); ac.resume(); window.__buf = ac.createBuffer(2, ac.sampleRate * 60, ac.sampleRate); P = .5; });
const attendre = (page, ms) => page.evaluate(ms => new Promise(r => setTimeout(r, ms)), ms);
const proche = (v, cible, ecart = .08) => expect(Math.abs(v - cible)).toBeLessThan(ecart);

test.describe('Au neutre, le son ne change pas', () => {
  test('aigus, TRIM, filtre de B, crossfader et casque sont neutres', async ({ page }) => {
    const erreurs = await ouvrir(page);
    await prepare(page); await attendre(page, 150);
    const v = await page.evaluate(() => ['A', 'B'].map(k => ({ hi: deck[k].hi.gain.value, trim: deck[k].trim.gain.value, xf: deck[k].xf.gain.value,
      hp: deck[k].hp.frequency.value, lp: deck[k].lp.frequency.value, pfl: deck[k].pfl.gain.value })).concat([{ salle: hpSalle.gain.value }]));
    for (const d of v.slice(0, 2)){ proche(d.hi, 0, .01); proche(d.trim, 1, .01); proche(d.xf, 1, .01); proche(d.hp, 10, 1); proche(d.lp, 22000, 10); proche(d.pfl, 0, .01); }
    proche(v[2].salle, 1, .01);
    expect(erreurs).toEqual([]); await sansBandeau(page);
  });
  test('chaque niveau repart du neutre, même après un réglage de la table complète', async ({ page }) => {
    await ouvrir(page);
    await page.evaluate(() => { Object.assign(ctrl, { hiA: 0, trimB: 1, xfader: 1, tempoB: 0, cfxB: .9 }); plCasqueBascule('B'); });
    await page.locator('.node').nth(1).click();
    expect(await page.evaluate(() => [ctrl.hiA, ctrl.trimB, ctrl.xfader, ctrl.tempoB, ctrl.cfxB, casque.B])).toEqual([.5, .5, .5, .5, .5, false]);
  });
});

test.describe('La table de mixage', () => {
  test('aigus coupés, TRIM, filtre de B et crossfader agissent sur la bonne voie', async ({ page }) => {
    await ouvrir(page); await prepare(page);
    await page.evaluate(() => { Object.assign(ctrl, { hiA: 0, trimB: 1, cfxB: 1, xfader: 1 }); applyCtrl(); });
    await attendre(page, 250);
    const v = await page.evaluate(() => ({ hiA: deck.A.hi.gain.value, hiB: deck.B.hi.gain.value, trimB: deck.B.trim.gain.value, hpB: deck.B.hp.frequency.value,
      hpA: deck.A.hp.frequency.value, xfA: deck.A.xf.gain.value, xfB: deck.B.xf.gain.value }));
    proche(v.hiA, -40, .5); proche(v.hiB, 0, .1); proche(v.trimB, Math.pow(10, 9 / 20), .02);
    expect(v.hpB).toBeGreaterThan(5000); expect(v.hpA).toBeLessThan(20);
    proche(v.xfA, 0, .02); proche(v.xfB, 1, .02);
  });
  test('crossfader : les deux voies à fond au milieu, puis la voie quittée descend', async ({ page }) => {
    await ouvrir(page);
    expect(await page.evaluate(() => [0, .25, .5, .75, 1].map(x => [xfGain(x, 'A'), xfGain(x, 'B')].map(g => Math.round(g * 100) / 100))))
      .toEqual([[1, 0], [1, .71], [1, 1], [.71, 1], [0, 1]]);
  });
  test('CUE casque : la voie passe au casque, et le casque quitte la salle', async ({ page }) => {
    await ouvrir(page); await prepare(page); await attendre(page, 200);
    await page.evaluate(() => plCasqueBascule('B')); await attendre(page, 300);
    let v = await page.evaluate(() => [deck.A.pfl.gain.value, deck.B.pfl.gain.value, hpSalle.gain.value]);
    proche(v[0], 0, .02); proche(v[1], 1, .02); proche(v[2], 0, .02);
    await page.evaluate(() => plCasqueBascule('B')); await attendre(page, 200);
    v = await page.evaluate(() => [deck.B.pfl.gain.value, hpSalle.gain.value]);
    proche(v[0], 0, .02); proche(v[1], 1, .02);
  });
});

test.describe('Les platines', () => {
  test('la position avance avec le temps, et le tempo la fait avancer plus vite', async ({ page }) => {
    await ouvrir(page); await prepare(page);
    await page.evaluate(() => play('B', __buf, ac.currentTime, 10, false));
    await attendre(page, 400);
    const p1 = await page.evaluate(() => plPos('B'));
    proche(p1, 10.4, .12);
    // curseur tout en bas : +8 %
    await page.evaluate(() => { ctrl.tempoB = 0; applyCtrl(); window.__t = ac.currentTime; window.__p = plPos('B'); });
    expect(await page.evaluate(() => [deck.B.rate, Math.round(plTempoPct('B') * 1000) / 10])).toEqual([1.08, 8]);
    await attendre(page, 500);
    const avance = await page.evaluate(() => (plPos('B') - __p) / (ac.currentTime - __t));
    proche(avance, 1.08, .02);
  });
  test('PLAY met en pause et reprend au même endroit ; CUE revient au repère', async ({ page }) => {
    await ouvrir(page); await prepare(page);
    await page.evaluate(() => play('A', __buf, ac.currentTime, 4, false)); await attendre(page, 300);
    await page.evaluate(() => plLecture('A'));
    const arret = await page.evaluate(() => [deck.A.joue, plPos('A')]);
    expect(arret[0]).toBe(false); proche(arret[1], 4.3, .12);
    await attendre(page, 300);
    proche(await page.evaluate(() => plPos('A')), arret[1], .001);   // à l'arrêt, elle ne bouge pas
    await page.evaluate(() => plLecture('A')); await attendre(page, 200);
    expect(await page.evaluate(() => deck.A.joue)).toBe(true);
    // en lecture, CUE ramène au repère (le départ du morceau, 4 s) et arrête
    await page.evaluate(() => plCue('A', true));
    expect(await page.evaluate(() => [deck.A.joue, plPos('A')])).toEqual([false, 4]);
    // à l'arrêt ailleurs : CUE pose le repère ici, fait écouter tant qu'on le tient, et y revient au relâchement
    await page.evaluate(() => { deck.A.ancP = 7; plCue('A', true); });
    expect(await page.evaluate(() => [deck.A.cue, deck.A.joue])).toEqual([7, true]);
    await attendre(page, 200); await page.evaluate(() => plCue('A', false));
    expect(await page.evaluate(() => [deck.A.joue, plPos('A')])).toEqual([false, 7]);
  });
  test('hot cue : posé sur le temps le plus proche, puis on y saute', async ({ page }) => {
    await ouvrir(page); await prepare(page);
    await page.evaluate(() => play('A', __buf, ac.currentTime, 12.1, false));
    expect(await page.evaluate(() => plHotCue('A', 0))).toBe('pose');
    expect(await page.evaluate(() => deck.A.cues[0])).toBe(12);
    await attendre(page, 500);
    expect(await page.evaluate(() => plHotCue('A', 0))).toBe('saut');
    proche(await page.evaluate(() => plPos('A')), 12, .06);
    await page.evaluate(() => plHotCueEfface('A', 0));
    expect(await page.evaluate(() => deck.A.cues[0])).toBeNull();
  });
  test('boucle de 4 temps : la position tourne dans la boucle ; EXIT la laisse repartir', async ({ page }) => {
    await ouvrir(page); await prepare(page);
    await page.evaluate(() => play('A', __buf, ac.currentTime, 20, false));
    await page.evaluate(() => plBoucle('A', 1));   // 1 temps = 0,5 s, pour un test court
    expect(await page.evaluate(() => deck.A.boucle)).toEqual({ s: 20, e: 20.5, temps: 1 });
    await attendre(page, 1300);
    const p = await page.evaluate(() => plPos('A'));
    expect(p).toBeGreaterThanOrEqual(20); expect(p).toBeLessThan(20.5);
    expect(await page.evaluate(() => [deck.A.node.loop, deck.A.node.loopStart, deck.A.node.loopEnd])).toEqual([true, 20, 20.5]);
    await page.evaluate(() => plSortie('A')); await attendre(page, 700);
    expect(await page.evaluate(() => [deck.A.boucle, deck.A.node.loop])).toEqual([null, false]);
    expect(await page.evaluate(() => plPos('A'))).toBeGreaterThan(20.5);
  });
  test('la boucle de sécurité revient après EXIT', async ({ page }) => {
    await ouvrir(page); await prepare(page);
    await page.evaluate(() => { play('B', __buf, ac.currentTime, 33, true, 64, 128); plBoucle('B', 4); plSortie('B'); });
    expect(await page.evaluate(() => [deck.B.node.loop, deck.B.node.loopStart, deck.B.node.loopEnd])).toEqual([true, 32, 64]);
  });
  test('molette : en lecture elle pousse le morceau un instant ; à l\'arrêt elle le déplace', async ({ page }) => {
    await ouvrir(page); await prepare(page);
    await page.evaluate(() => play('B', __buf, ac.currentTime, 10, false));
    await page.evaluate(() => plJog('B', 40)); await attendre(page, 100);
    expect(await page.evaluate(() => deck.B.rate)).toBeGreaterThan(1.05);
    await attendre(page, 300);
    expect(await page.evaluate(() => [deck.B.rate, deck.B.bend])).toEqual([1, 0]);
    await page.evaluate(() => { plLecture('B'); window.__p = plPos('B'); plJog('B', 25); });
    proche(await page.evaluate(() => plPos('B') - __p), .1, .001);
  });
  test('calage : le décalage entre A et B se mesure en millisecondes', async ({ page }) => {
    await ouvrir(page); await prepare(page);
    // B part 30 ms en avance sur la grille de A (même tempo)
    await page.evaluate(() => { const t = ac.currentTime + .05; play('A', __buf, t, 8, false); play('B', __buf, t, 4.03, false); });
    await attendre(page, 200);
    proche(await page.evaluate(() => plDecalage()), 30, 2);
    await page.evaluate(() => { stop('B'); });
    expect(await page.evaluate(() => plDecalage())).toBeNull();
  });
});
