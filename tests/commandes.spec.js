// Lot 39, étape 2 : la table complète à l'écran (js/commandes.js, controles.js). Toute la table est affichée ; seules les
// commandes dont le niveau se sert sont allumées. Pendant une partie, la consigne se replie.
const { test, expect } = require('@playwright/test');
const { ouvrir, sansBandeau, jouer } = require('./outils');

const TOUT = ['gPlay', 'gLow', 'gFad', 'gCfx', 'gEcho', 'gMid', 'gMidB', 'gCfxB', 'gHi', 'gTrim', 'gTempoA', 'gTempoB', 'gJogA', 'gJogB', 'gCueA', 'gCueB', 'gPadsA', 'gPadsB', 'gCasqueA', 'gCasqueB', 'gXf'];
// Tout allumer et poser un morceau muet de 60 s (120 BPM) sur la platine A, en lecture
const toutAllume = page => page.evaluate(t => { tableAllume(t); ensureAudio(); ac.resume(); P = .5; play('A', ac.createBuffer(2, ac.sampleRate * 60, ac.sampleRate), ac.currentTime, 10, false); }, TOUT);

test.describe('Allumé ou éteint', () => {
  test('niveau 1 : seul LANCE B est allumé, le reste de la table est éteint et inerte', async ({ page }) => {
    const erreurs = await ouvrir(page);
    await page.locator('.node').nth(0).click();
    await expect(page.locator('#gPlay')).not.toHaveClass(/eteint/);
    for (const sel of ['#gLow', '#gFad', '[data-g="gTrim"] >> nth=0', '#jogA', '#padsA', '#casqueB', '.mx-xf']){
      const el = page.locator(sel).first(); await expect(el.locator('xpath=ancestor-or-self::*[@data-g][1]')).toHaveClass(/eteint/); }
    expect(await page.evaluate(() => document.querySelector('[data-k="trimA"]').closest('[data-g]').inert)).toBe(true);
    expect(erreurs).toEqual([]); await sansBandeau(page);
  });
  test('la transition complète : LOW et faders des deux voies allumés', async ({ page }) => {
    await ouvrir(page);
    await page.locator('.node').nth(6).click();
    for (const id of ['#wLowA', '#wLowB', '#wFadA', '#wFadB', '#launchB']) await expect(page.locator(id).locator('xpath=ancestor-or-self::*[@data-g][1]')).not.toHaveClass(/eteint/);
    await expect(page.locator('#gCfx')).toHaveClass(/eteint/);
  });
});

test.describe('Les commandes', () => {
  test('pads en HOT CUE : un clic pose le repère, un clic droit l\'efface', async ({ page }) => {
    await ouvrir(page); await toutAllume(page);
    await page.locator('#padsA .pad').first().click();
    expect(await page.evaluate(() => deck.A.cues[0])).not.toBeNull();
    await expect(page.locator('#padsA .pad').first()).toHaveClass(/pose/);
    await page.locator('#padsA .pad').first().click({ button: 'right' });
    expect(await page.evaluate(() => deck.A.cues[0])).toBeNull();
    await expect(page.locator('#padsA .pad').first()).not.toHaveClass(/pose/);
  });
  test('pads en BOUCLE : 4, 8, 16 temps et EXIT', async ({ page }) => {
    await ouvrir(page); await toutAllume(page);
    await page.locator('.ptabs [data-p="A"][data-mode="lp"]').click();
    await expect(page.locator('#padsA .pad')).toHaveText(['4', '8', '16', 'EXIT']);
    await page.locator('#padsA .pad').nth(1).click();
    expect(await page.evaluate(() => deck.A.boucle && deck.A.boucle.temps)).toBe(8);
    await expect(page.locator('#padsA .pad').nth(1)).toHaveClass(/live/);
    await page.locator('#padsA .pad').nth(3).click();
    expect(await page.evaluate(() => deck.A.boucle)).toBeNull();
  });
  test('crossfader : on le glisse de gauche à droite', async ({ page }) => {
    await ouvrir(page); await toutAllume(page);
    await page.locator('.fader.xf').scrollIntoViewIfNeeded();
    const box = await page.locator('.fader.xf').boundingBox();
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2); await page.mouse.down();
    await page.mouse.move(box.x + box.width - 2, box.y + box.height / 2, { steps: 5 }); await page.mouse.up();
    expect(await page.evaluate(() => ctrl.xfader)).toBeGreaterThan(.95);
  });
  test('tempo : le curseur vers le bas accélère, et l\'écart s\'affiche en pour cent', async ({ page }) => {
    await ouvrir(page); await toutAllume(page);
    await page.locator('[data-k="tempoA"]').focus();
    for (let i = 0; i < 5; i++) await page.keyboard.press('Shift+ArrowDown');
    expect(await page.evaluate(() => ctrl.tempoA)).toBeCloseTo(0, 5);
    await expect(page.locator('#tpctA')).toHaveText('+8,0 %');
    expect(await page.evaluate(() => deck.A.rate)).toBeCloseTo(1.08, 3);
  });
  test('CUE casque : le bouton allume l\'écoute de la voie', async ({ page }) => {
    await ouvrir(page); await toutAllume(page);
    await page.locator('#casqueA').click();
    await expect(page.locator('#casqueA')).toHaveAttribute('aria-pressed', 'true');
    expect(await page.evaluate(() => casque.A)).toBe(true);
    await page.locator('#casqueA').click();
    expect(await page.evaluate(() => casque.A)).toBe(false);
  });
  test('PLAY de A met en pause, et la molette déplace le morceau à l\'arrêt', async ({ page }) => {
    await ouvrir(page); await toutAllume(page);
    await page.locator('#playA').click();
    expect(await page.evaluate(() => deck.A.joue)).toBe(false);
    const avant = await page.evaluate(() => plPos('A'));
    await page.locator('#jogA').focus();
    await page.keyboard.press('Shift+ArrowRight');
    expect(await page.evaluate(() => plPos('A'))).toBeGreaterThan(avant);
  });
  test('la molette à la souris : la tourner en lecture pousse le morceau', async ({ page }) => {
    await ouvrir(page); await toutAllume(page);
    await page.locator('#jogA').scrollIntoViewIfNeeded();
    const b = await page.locator('#jogA').boundingBox(), cx = b.x + b.width / 2, cy = b.y + b.height / 2, r = b.width / 2 - 8;
    await page.evaluate(() => { window.__max = 1; setInterval(() => { __max = Math.max(__max, deck.A.rate); }, 5); });
    await page.mouse.move(cx, cy - r); await page.mouse.down();
    for (let a = 0; a <= 180; a += 10){ const t = (a - 90) * Math.PI / 180; await page.mouse.move(cx + r * Math.cos(t), cy + r * Math.sin(t)); await page.waitForTimeout(15); }
    await page.mouse.up();
    expect(await page.evaluate(() => __max)).toBeGreaterThan(1.01);
  });
});

test.describe('Pendant une partie', () => {
  test('la consigne se replie, puis revient à l\'arrêt', async ({ page }) => {
    await ouvrir(page);
    await page.locator('.node').nth(0).click();
    await expect(page.locator('.consigne')).toBeVisible();
    await jouer(page);
    await expect(page.locator('#stage')).toHaveClass(/joue/);
    await expect(page.locator('.consigne')).toBeHidden();
    await page.locator('#startBtn').click();
    await expect(page.locator('.consigne')).toBeVisible();
  });
  test('sur un PC portable (1366 × 768), LANCE B et les faders se voient pendant la partie', async ({ page }) => {
    await ouvrir(page);
    await page.locator('.node').nth(6).click();
    await jouer(page);
    await page.waitForTimeout(800);
    for (const id of ['#launchB', '#wFadA', '#wFadB', '#wLowA', '#echoBtn']){
      const r = await page.locator(id).boundingBox(); expect(r.y + r.height, id).toBeLessThanOrEqual(768); expect(r.y, id).toBeGreaterThanOrEqual(0); }
  });
});

// Étape 3 : les mêmes commandes, depuis la table (numéros de la FLX4 relevés dans Mixxx, pas encore vérifiés en vrai)
test.describe('Avec la table', () => {
  const { envoyer } = require('./outils');
  test('éteintes dans un niveau, les commandes de la table complète ne font rien (mais leur position est retenue)', async ({ page }) => {
    await ouvrir(page, { midi: { branchee: true } });
    await page.locator('.node').nth(0).click();
    await envoyer(page, 0xB0, 7, 0);   // HI de A
    expect(await page.evaluate(() => [ctrl.hiA, phys.hiA])).toEqual([.5, 0]);
  });
  test('allumées : HI, TRIM, tempo, filtre de B et crossfader suivent la FLX4', async ({ page }) => {
    await ouvrir(page, { midi: { branchee: true } }); await toutAllume(page);
    await envoyer(page, 0xB0, 7, 0); await envoyer(page, 0xB1, 4, 127); await envoyer(page, 0xB0, 0, 0); await envoyer(page, 0xB6, 24, 127); await envoyer(page, 0xB6, 31, 127);
    expect(await page.evaluate(() => [ctrl.hiA, ctrl.trimB, ctrl.tempoA, ctrl.cfxB, ctrl.xfader])).toEqual([0, 1, 0, 1, 1]);
    await expect(page.locator('#tpctA')).toHaveText('+8,0 %');
  });
  test('CUE (tenu puis relâché), PLAY de A et CUE casque', async ({ page }) => {
    await ouvrir(page, { midi: { branchee: true } }); await toutAllume(page);
    await envoyer(page, 0x90, 12, 127);   // CUE de A en lecture : retour au repère et arrêt
    expect(await page.evaluate(() => [deck.A.joue, plPos('A')])).toEqual([false, 10]);
    await envoyer(page, 0x90, 11, 127);   // PLAY de A
    expect(await page.evaluate(() => deck.A.joue)).toBe(true);
    await envoyer(page, 0x91, 84, 127);   // CUE casque de B
    expect(await page.evaluate(() => casque.B)).toBe(true);
    await expect(page.locator('#casqueB')).toHaveAttribute('aria-pressed', 'true');
  });
  test('la molette de la FLX4 pousse le morceau', async ({ page }) => {
    await ouvrir(page, { midi: { branchee: true } }); await toutAllume(page);
    await page.evaluate(() => { window.__max = 1; setInterval(() => { __max = Math.max(__max, deck.A.rate); }, 5); });
    for (let i = 0; i < 12; i++){ await envoyer(page, 0xB0, 33, 72); await page.waitForTimeout(15); }
    expect(await page.evaluate(() => __max)).toBeGreaterThan(1.01);
  });
  test('les pads de la FLX4 : hot cue, effacer avec SHIFT, boucle de 8, sortie, RELOOP/EXIT', async ({ page }) => {
    await ouvrir(page, { midi: { branchee: true } }); await toutAllume(page);
    await envoyer(page, 0x97, 0, 127);
    expect(await page.evaluate(() => deck.A.cues[0])).not.toBeNull();
    await expect(page.locator('#padsA .pad').first()).toHaveClass(/pose/);
    await envoyer(page, 0x98, 0, 127);
    expect(await page.evaluate(() => deck.A.cues[0])).toBeNull();
    await envoyer(page, 0x97, 97, 127);
    expect(await page.evaluate(() => deck.A.boucle && deck.A.boucle.temps)).toBe(8);
    await expect(page.locator('#padsA .pad').nth(1)).toHaveClass(/live/);
    await envoyer(page, 0x97, 99, 127);   // pad 4 en BEAT LOOP : sortie
    expect(await page.evaluate(() => deck.A.boucle)).toBeNull();
    await envoyer(page, 0x90, 77, 127);   // RELOOP/EXIT sans boucle : boucle de 4
    expect(await page.evaluate(() => deck.A.boucle && deck.A.boucle.temps)).toBe(4);
  });
  test('une table reconnue par sa fiche : ses aigus et son crossfader marchent aussi', async ({ page }) => {
    await ouvrir(page, { midi: { branchee: 'MIXTRACK PLATINUM FX' } }); await toutAllume(page);
    await envoyer(page, 0xB0, 23, 0); await envoyer(page, 0xBF, 8, 127);
    expect(await page.evaluate(() => [ctrl.hiA, ctrl.xfader])).toEqual([0, 1]);
  });
});
