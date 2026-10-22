// Lot 41 : chapitre 6 « Hot cues et boucles » (js/hotcues.js). Chaque appui sur un pad est noté en millisecondes, au temps
// entendu ; Quantize allumé aux niveaux 1 à 4, éteint aux niveaux 5 à 7. S'ouvre avec le chapitre 2 (14 étoiles au chapitre 1).
const { test, expect } = require('@playwright/test');
const { ouvrir, sansBandeau } = require('./outils');

const OUVERT = { 'coach-ch2-ouvert': '1' };
const ch6 = async (page, n) => { await page.evaluate(() => setChapter(6)); await page.locator('.node').nth(n).click(); };
// Une note calculée sur une partie inventée : `gestes` = appuis sur les pads, `coupe` = temps où le fader de A tombe en bas
const note = (page, n, gestes, plus = {}) => page.evaluate(([n, gestes, plus]) => {
  li = n; const frames = []; for (let b = 30; b < 130; b += .25) frames.push({ b, fa: plus.coupe != null && b >= plus.coupe ? 0 : 1, la: .5, lb: 0 });
  const r = { frames, hc: Object.assign({ gestes: gestes.map(g => Object.assign({}, g, g.cue != null ? { cue: g.cue * P } : {})), dropAt: null, silence: false, depasse: false }, plus.hc || {}) };
  const items = hcEval(r); return { st: hcEtoiles(items), items: items.map(x => x[0] + ' | ' + x[1]) };
}, [n, gestes, plus]);
// Un « robot » qui joue la partie : chaque geste part dès que le temps entendu atteint son temps, par le même chemin qu'un
// joueur (pads de l'écran, faders, ou messages de la fausse DDJ-FLX4)
const robot = (page, gestes) => page.evaluate(gestes => {
  const fait = {}, agir = {
    padA0: () => padPresse('A', 0), padA1: () => padPresse('A', 1), padB0: () => padPresse('B', 0), padB3: () => padPresse('B', 3),
    midiB0: () => window.__midi.envoyer(0x99, 0, 127),
    coupe: () => { ctrl.faderA = 0; applyCtrl(); gestureMark(); },
    swap: () => { ctrl.lowA = 0; ctrl.lowB = .5; applyCtrl(); gestureMark(); } };
  const tick = () => { if (!run) return; gestes.forEach(([at, quoi], i) => { if (!fait[i] && heardBeat() >= at){ fait[i] = 1; agir[quoi](); } }); requestAnimationFrame(tick); };
  requestAnimationFrame(tick);
}, gestes);
const jouer = async page => { await page.locator('#startBtn').click(); await page.waitForFunction(() => !!run && !!run.hc, null, { timeout: 60000 }); };
const resultat = async page => { await expect(page.locator('#result')).toBeVisible({ timeout: 80000 }); return page.locator('#rDetails li').allTextContents(); };

test.describe('Le chapitre', () => {
  test('il s\'ouvre avec le chapitre 2 (14 étoiles au chapitre 1)', async ({ page }) => {
    const erreurs = await ouvrir(page);
    await page.locator('#chapBtn').click();
    const c6 = page.locator('#chapters .chap').nth(5);
    await expect(c6).toContainText('Hot cues et boucles'); await expect(c6).toBeDisabled(); await expect(c6).toContainText('Verrouillé');
    expect(erreurs).toEqual([]); await sansBandeau(page);
  });
  test('ouvert, il a 7 niveaux et compte dans le total d\'étoiles', async ({ page }) => {
    const erreurs = await ouvrir(page, { stockage: OUVERT });
    await ch6(page, 0);
    await expect(page.locator('.node')).toHaveCount(7);
    await expect(page.locator('#ltitle')).toHaveText('Poser un repère');
    await expect(page.locator('#starTot')).toHaveText('0/108');
    expect(erreurs).toEqual([]); await sansBandeau(page);
  });
  test('chaque niveau allume seulement ses pads, et les faders ou les LOW quand il s\'en sert', async ({ page }) => {
    await ouvrir(page, { stockage: OUVERT }); await ch6(page, 0);
    const allumes = () => page.evaluate(() => [...new Set([...document.querySelectorAll('.deck [data-g]:not(.eteint)')].map(e => e.dataset.g))].sort());
    expect(await allumes()).toEqual(['gPadsB']);
    await page.locator('.node').nth(3).click(); expect(await allumes()).toEqual(['gFad', 'gPadsA']);
    await page.locator('.node').nth(5).click(); expect(await allumes()).toEqual(['gLow', 'gPadsB']);
    await page.locator('.node').nth(6).click(); expect(await allumes()).toEqual(['gFad', 'gPadsA', 'gPadsB']);
  });
  test('les pads sont dans le bon mode dès le choix du niveau (HOT CUE ou BOUCLE)', async ({ page }) => {
    await ouvrir(page, { stockage: OUVERT }); await ch6(page, 0);
    await expect(page.locator('#padsB .pad')).toHaveText(['1', '2', '3', '4']);
    await page.locator('.node').nth(2).click();
    await expect(page.locator('#padsB .pad')).toHaveText(['4', '8', '16', 'EXIT']);
    await page.locator('.node').nth(3).click();
    await expect(page.locator('#padsA .pad')).toHaveText(['4', '8', '16', 'EXIT']);
    await expect(page.locator('#padsB .pad')).toHaveText(['1', '2', '3', '4']);
  });
  test('Quantize allumé aux niveaux 1 à 4, éteint aux niveaux 5 à 7', async ({ page }) => {
    await ouvrir(page, { stockage: OUVERT }); await ch6(page, 3);
    await expect(page.locator('#modeTag')).toHaveText('Quantize allumé · noté en ms');
    await page.locator('.node').nth(4).click();
    await expect(page.locator('#modeTag')).toHaveText('Quantize éteint · noté en ms');
  });
  test('« Pendant le niveau » donne les gestes des pads, pas « PLAY de droite »', async ({ page }) => {
    await ouvrir(page, { stockage: OUVERT }); await ch6(page, 1);
    await expect(page.locator('#planList li')).toHaveText(['B attend, arrêté sur son hot cue 1 (son drop)', 'Au temps 64 : pad 1 de B, et fader de A en haut → en bas d’un coup, dans le même geste']);
    await page.locator('.node').nth(2).click();
    await expect(page.locator('#planList li').nth(1)).toHaveText('Entre les temps 60 et 64 : pad EXIT de B, pour sortir de la boucle');
  });
  test('c\'est une étape des trois parcours (Grand débutant, Apprenti DJ, DJ confirmé)', async ({ page }) => {
    await ouvrir(page, { stockage: OUVERT });
    expect(await page.evaluate(() => ['debut', 'apprenti', 'confirme'].map(p => PARCOURS[p].stages.includes('ch6')))).toEqual([true, true, true]);
  });
});

test.describe('La note', () => {
  test('niveau 1 : appui pile sur le drop, repère sur le premier temps : 3 étoiles', async ({ page }) => {
    await ouvrir(page, { stockage: OUVERT }); await ch6(page, 0);
    const r = await note(page, 0, [{ k: 'B', res: 'pose', hb: 52.02, cue: 64 }]);
    expect(r.items).toEqual(['ok | Appui pile sur le drop (10 ms).', 'ok | Le repère est sur le premier temps du drop.']); expect(r.st).toBe(3);
  });
  test('niveau 1 : c\'est le dernier repère posé qui compte (après un repère effacé)', async ({ page }) => {
    await ouvrir(page, { stockage: OUVERT }); await ch6(page, 0);
    const r = await note(page, 0, [{ k: 'B', res: 'pose', hb: 40, cue: 52 }, { k: 'B', res: 'efface', hb: 44 }, { k: 'B', res: 'pose', hb: 52, cue: 64 }]);
    expect(r.items[1]).toBe('ok | Le repère est sur le premier temps du drop.'); expect(r.st).toBe(3);
  });
  test('niveau 1 : un repère posé un temps trop tard est dit', async ({ page }) => {
    await ouvrir(page, { stockage: OUVERT }); await ch6(page, 0);
    const r = await note(page, 0, [{ k: 'B', res: 'pose', hb: 53, cue: 65 }]);
    expect(r.items[1]).toBe('bad | Le repère est 1 temps après le drop : écoute le moment où tout entre.'); expect(r.st).toBe(1);
  });
  test('niveau 2 : B pas lancé et A pas coupé, chacun a son conseil', async ({ page }) => {
    await ouvrir(page, { stockage: OUVERT }); await ch6(page, 1);
    const r = await note(page, 1, []);
    expect(r.items).toEqual(['bad | Tu n’as pas lancé B : appuie sur son pad 1 (hot cue) au temps 64.', 'bad | A n’a pas été coupé : baisse son fader d’un coup au temps 64.']);
  });
  test('niveau 4 : une boucle qui dépasse la fin de A est expliquée', async ({ page }) => {
    await ouvrir(page, { stockage: OUVERT }); await ch6(page, 3);
    const r = await note(page, 3, [{ k: 'A', res: 'boucle', hb: 90, s: 90, t: 8 }], { coupe: 104, hc: { silence: true, depasse: true } });
    expect(r.items[0]).toBe('bad | Ta boucle dépassait la fin de A (temps 96) : il est arrivé au bout quand même. Elle doit finir au temps 96 au plus tard.');
  });
  test('niveau 7 (Quantize éteint) : toute boucle posée au début d\'une mesure fait l\'affaire, notée en ms', async ({ page }) => {
    await ouvrir(page, { stockage: OUVERT }); await ch6(page, 6);
    const r = await note(page, 6, [{ k: 'A', res: 'boucle', hb: 92.05, s: 92, t: 4 }, { k: 'B', res: 'saut', hb: 104 }], { coupe: 104 });
    expect(r.items[0]).toBe('ok | Boucle posée pile au temps 92 (24 ms) : A ne s’arrête pas.'); expect(r.st).toBe(3);
  });
  test('la montée : une boucle de 4 ne compte pas pour la boucle de 8', async ({ page }) => {
    await ouvrir(page, { stockage: OUVERT }); await ch6(page, 4);
    const r = await note(page, 4, [{ k: 'A', res: 'boucle', hb: 64, t: 16 }, { k: 'A', res: 'boucle', hb: 80, t: 4 }, { k: 'A', res: 'boucle', hb: 96, t: 4 }], { coupe: 112 });
    expect(r.items[1]).toBe('bad | Pas de boucle de 8 temps (au temps 80).');
  });
  test('les étoiles : moyenne des gestes, 90 % → 3, 60 % → 2', async ({ page }) => {
    await ouvrir(page, { stockage: OUVERT });
    expect(await page.evaluate(() => [hcEtoiles([['ok', '', 1], ['ok', '', .85]]), hcEtoiles([['ok', '', 1], ['bad', '', .3]]), hcEtoiles([['bad', '', .5]])])).toEqual([3, 2, 1]);
  });
});

test.describe('En vrai', () => {
  test('niveau 1 avec la DDJ-FLX4 : le pad 1 de B (HOT CUE) pose le repère sur le drop', async ({ page }) => {
    const erreurs = await ouvrir(page, { midi: { branchee: true }, stockage: OUVERT }); await ch6(page, 0);
    await jouer(page); await robot(page, [[52, 'midiB0']]);
    const items = await resultat(page);
    expect(items[1]).toBe('Le repère est sur le premier temps du drop.');
    expect(await page.evaluate(() => ch6Stars[0])).toBe(3);
    expect(erreurs).toEqual([]);
  });
  test('niveau 2 : B lancé de son hot cue et A coupé au temps 64, 3 étoiles ; la coupure est jugée pendant la partie', async ({ page }) => {
    const erreurs = await ouvrir(page, { stockage: OUVERT }); await ch6(page, 1);
    await jouer(page); await robot(page, [[64, 'padB0'], [64, 'coupe']]);
    await page.waitForFunction(() => run && run.status['COUPE A'], null, { timeout: 40000 });
    expect(await page.evaluate(() => run.status['COUPE A'])).toBe('ok');
    const items = await resultat(page);
    expect(items[0]).toMatch(/^B lancé depuis son hot cue pile sur le temps 64 \(\d+ ms\)\.$/);
    expect(items[1]).toMatch(/^A coupé pile au temps 64 \(\d+ ms\)\.$/);
    expect(await page.evaluate(() => ch6Stars[1])).toBe(3);
    expect(erreurs).toEqual([]);
  });
  test('niveau 3 : sortir de la boucle pendant la dernière mesure fait tomber le drop sur la phrase', async ({ page }) => {
    await ouvrir(page, { stockage: OUVERT }); await ch6(page, 2);
    await jouer(page); await robot(page, [[61, 'padB3']]);
    const items = await resultat(page);
    expect(items).toEqual(['Le drop de B est tombé pile sur la phrase de A.']);
  });
  test('niveau 4 sans rien faire : A s\'arrête à sa fin (silence)', async ({ page }) => {
    await ouvrir(page, { stockage: OUVERT }); await ch6(page, 3);
    await jouer(page);
    await page.waitForFunction(() => run && beatNow() > 98, null, { timeout: 60000 });
    expect(await page.evaluate(() => [deck.A.joue, run.hc.silence])).toEqual([false, true]);
    const items = await resultat(page);
    expect(items[0]).toBe('A est arrivé au bout de son morceau : silence. Boucle sa fin avant le temps 96.');
  });
  test('niveau 6 : le double drop et le swap des basses, 3 étoiles', async ({ page }) => {
    await ouvrir(page, { stockage: OUVERT }); await ch6(page, 5);
    await jouer(page); await robot(page, [[64, 'padB0'], [64, 'swap']]);
    await resultat(page);
    expect(await page.evaluate(() => ch6Stars[5])).toBe(3);
  });
});

// Défauts trouvés en finissant le chapitre (22 oct. 2026), un test chacun
test.describe('Corrections', () => {
  test('la barre d\'espace ne lance pas B : au chapitre 6, il part de son hot cue', async ({ page }) => {
    await ouvrir(page, { stockage: OUVERT }); await ch6(page, 1);
    await jouer(page);
    await page.waitForFunction(() => run && beatNow() > 42, null, { timeout: 30000 });
    await page.keyboard.press('Space');
    expect(await page.evaluate(() => [run.launch, deck.B.joue])).toEqual([null, false]);
    await expect(page.locator('#tip')).toHaveText('Ici, B part de son hot cue : appuie sur le pad 1 de B.');
  });
  test('un pad de l\'écran part à l\'appui, pas au relâchement du clic ; le clic droit efface (et c\'est noté)', async ({ page }) => {
    await ouvrir(page, { stockage: OUVERT }); await ch6(page, 0);
    await jouer(page);
    await page.locator('#padsB .pad').first().hover(); await page.mouse.down();
    expect(await page.evaluate(() => run.hc.gestes.map(g => g.res))).toEqual(['pose']);
    await page.mouse.up();
    expect(await page.evaluate(() => run.hc.gestes.length)).toBe(1);
    await page.locator('#padsB .pad').first().click({ button: 'right' });
    expect(await page.evaluate(() => [run.hc.gestes.map(g => g.res), deck.B.cues[0]])).toEqual([['pose', 'efface'], null]);
  });
  test('un geste au fader est retenu à l\'instant même (pas seulement à l\'image suivante)', async ({ page }) => {
    await ouvrir(page, { stockage: OUVERT }); await ch6(page, 1);
    await jouer(page);
    expect(await page.evaluate(() => { const n = run.frames.length; gestureMark(); return run.frames.length - n; })).toBe(1);
  });
  test('niveau 7 : une boucle posée un peu en retard (Quantize éteint) ne coupe pas A, le retard est noté', async ({ page }) => {
    await ouvrir(page, { stockage: OUVERT }); await ch6(page, 6);
    await jouer(page); await robot(page, [[88.1, 'padA1'], [104, 'padB0'], [104, 'coupe']]);
    await page.waitForFunction(() => run && beatNow() > 99, null, { timeout: 60000 });
    expect(await page.evaluate(() => [deck.A.joue, !!deck.A.boucle, run.hc.silence])).toEqual([true, true, false]);
    const items = await resultat(page);
    expect(items[0]).toMatch(/^Boucle posée \d+ ms en retard par rapport au temps 88 : on entend le raccord\.$|^Boucle posée pile au temps 88/);
  });
  test('au double drop, B a les mêmes accords que A (une autre version du même morceau)', async ({ page }) => {
    await ouvrir(page, { stockage: OUVERT });
    expect(await page.evaluate(() => {
      const d = STYLE_DEFS.house, accords = vr => (d.seed + 12 + vr * 101 + 1) % PROGS.length;   // comme makeSong pour un morceau B
      return [0, 1, 2, 3].map(vr => [hcVarB(CH6_LESSONS[5], vr) !== vr, accords(hcVarB(CH6_LESSONS[5], vr)) === accords(vr), hcVarB(CH6_LESSONS[1], vr) === vr]);
    })).toEqual([[true, true, true], [true, true, true], [true, true, true], [true, true, true]]);
  });
  // Remarques du gardien (feu orange du lot 41), une par test
  test('double drop : un swap 272 ms en retard n\'est ni « parfait » ni vert (marge de 0,25 temps au chapitre 6)', async ({ page }) => {
    await ouvrir(page, { stockage: OUVERT }); await ch6(page, 5);
    // des pas de 1/64 de temps (exacts pour l'ordinateur) : le swap tombe à 64 + 36/64 temps, soit 272 ms après la phrase
    const r = await page.evaluate(() => { li = 5; const frames = []; for (let i = 0; i < 40 * 64; i++){ const b = 40 + i / 64; frames.push({ b, fa: 1, la: b >= 64.5625 ? 0 : .5, lb: b >= 64.5625 ? .5 : 0 }); }
      const run = { frames, hc: { gestes: [{ k: 'B', res: 'saut', hb: 64 }], silence: false } }; const it = hcEval(run); return { tol: TOL, st: hcEtoiles(it), it: it.map(x => x[0] + ' | ' + x[1]) }; });
    expect(r.tol).toBe(.25);
    expect(r.it[1]).toMatch(/^bad \| Swap à 272 ms de la phrase/); expect(r.st).toBeLessThan(3);
  });
  test('niveau 4 : une boucle posée une mesure plus tôt est « pile » pendant la partie, comme dans la note', async ({ page }) => {
    await ouvrir(page, { stockage: OUVERT }); await ch6(page, 3);
    await jouer(page); await robot(page, [[84, 'padA1']]);
    await page.waitForFunction(() => run && run.status.BOUCLE, null, { timeout: 40000 });
    expect(await page.evaluate(() => run.status.BOUCLE)).toBe('ok');
    await expect(page.locator('#tip')).toHaveText(/^Pile ! \(\d+ ms\)$/);
  });
  test('niveau 1 : un second appui dit comment effacer le repère pour le reposer ; « Comment faire ? » explique hot cue et Quantize', async ({ page }) => {
    await ouvrir(page, { stockage: OUVERT }); await ch6(page, 0);
    await expect(page.locator('#llex')).toContainText('Hot cue : un repère gardé sur un pad');
    await expect(page.locator('#llex')).toContainText('Quantize : un réglage qui range');
    await jouer(page);
    await page.waitForFunction(() => run && beatNow() > 33, null, { timeout: 30000 });
    await page.evaluate(() => { padPresse('B', 0); padPresse('B', 0); });
    await expect(page.locator('#tip')).toHaveText('Repère déjà posé. Pour le reposer : SHIFT + pad sur ta table (clic droit à l’écran), puis appuie de nouveau.');
  });
  test('deux messages au même instant ne s\'écrivent pas l\'un sur l\'autre', async ({ page }) => {
    await ouvrir(page, { stockage: OUVERT });
    const tops = await page.evaluate(() => { pop('Pile !', 'ok'); pop('A coupé pile !', 'ok'); return [...document.querySelectorAll('#pops .pop')].map(p => p.style.top); });
    expect(tops[0]).toBe(''); expect(tops[1]).toContain('calc');
  });
});
