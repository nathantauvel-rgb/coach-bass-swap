// Lot 70 : au chapitre 3, la piste montre les mêmes blocs que les autres chapitres (avant : des formes d'onde, que
// l'utilisateur trouvait différentes du reste du site).
const { test, expect } = require('@playwright/test');
const { ouvrir } = require('./outils');

const S = o => JSON.stringify(o);
const CH3 = { 'coach-chapitre': '3', 'coach-ch2-ouvert': '1', 'coach-ch2': S({ 0: 3, 1: 3, 2: 3, 3: 3 }) };

test.describe('Piste du chapitre 3', () => {
  test('les blocs suivent la structure de chaque morceau', async ({ page }) => {
    await ouvrir(page);
    const r = await page.evaluate(() => CH3_LESSONS.slice(0, 3).map(l => [ch3BlocsA(l), ch3BlocsB(l)]));
    // l'intro courte
    expect(r[0][0]).toEqual([[0, 16, 'Corps', true], [16, 48, 'Outro', false]]);
    expect(r[0][1]).toEqual([[0, 16, 'Intro', false], [16, 160, 'Drop', true]]);
    // le piège du break : le break est pâle et nommé, A repart à fond après
    expect(r[1][0]).toEqual([[0, 16, 'Corps', true], [16, 32, 'Break', false], [32, 48, 'Corps', true], [48, 80, 'Outro', false]]);
    // une seule mélodie : on voit où la mélodie de A s'arrête et où celle de B commence
    expect(r[2][0].map(x => x[2])).toEqual(['Corps', 'Outro (mélodie)', 'Outro']);
    expect(r[2][1].map(x => x[2])).toEqual(['Intro', 'Intro (mélodie)', 'Drop']);
  });
  test('lecture express : les blocs changent avec la structure tirée au hasard', async ({ page }) => {
    await ouvrir(page);
    const r = await page.evaluate(() => { const l = CH3_LESSONS[3], out = [];
      for (let i = 0; i < 12; i++){ randomizeRead(l); const a = ch3BlocsA(l), b = ch3BlocsB(l);
        out.push(a[a.length - 1][1] === l.aEnd && a[a.length - 1][2] === 'Outro' && b[0][1] === l.bIntro && b[1][2] === 'Drop'); }
      return out; });
    expect(r.every(Boolean)).toBe(true);
  });
  test('la piste se dessine sans formes d\'onde, avant et pendant la partie, et les textes parlent de la piste', async ({ page }) => {
    test.setTimeout(90000);
    const erreurs = await ouvrir(page, { stockage: CH3 });
    await page.evaluate(() => setChapter(3)); await page.locator('.node').nth(1).click();
    // plus besoin d'attendre les formes d'onde pour dessiner la piste
    expect(await page.evaluate(() => { waveTk = null; drawHighway(START); return true; })).toBe(true);
    await expect(page.locator('#modeTag')).toHaveText('Lis la piste');
    await expect(page.locator('#hint')).not.toContainText('forme');
    await page.locator('#startBtn').click();
    await page.waitForFunction(() => run && beatNow() >= 20, null, { timeout: 60000 });
    // B pas encore lancé : il est dessiné en pointillé là où il tomberait, sans repère du bon moment
    expect(await page.evaluate(() => run.launch)).toBe(null);
    await page.evaluate(() => stopRun());
    expect(await page.evaluate(() => [...document.querySelectorAll('.chap, #chapBtn, .chapters *')].some(e => /Formes d'onde/.test(e.textContent)))).toBe(false);
    expect(erreurs).toEqual([]);
  });
  // Lot 71 : sur téléphone (piste de 190 px), « B si tu le lances maintenant » était écrit sous le bas de la piste, et
  // « Drop » ne tenait pas sur un écran de 360 px
  for (const [nom, vp, dessous] of [['ordinateur', { width: 1366, height: 768 }, true], ['téléphone de 390 px', { width: 390, height: 844 }, false], ['téléphone de 360 px', { width: 360, height: 780 }, false]])
    test(`${nom} : les textes de B en pointillé restent dans la piste`, async ({ page }) => {
      test.setTimeout(90000);
      await page.setViewportSize(vp);
      const erreurs = await ouvrir(page, { stockage: CH3 });
      await page.evaluate(() => setChapter(3)); await page.locator('.node').nth(0).click();
      await page.locator('#startBtn').click();
      await page.waitForFunction(() => run && beatNow() >= START + 4, null, { timeout: 60000 });
      const r = await page.evaluate(() => { const ecrits = [], f = CanvasRenderingContext2D.prototype.fillText;
        CanvasRenderingContext2D.prototype.fillText = function (t, x, y){ ecrits.push([t, x, y]); return f.apply(this, arguments); };
        drawHighway(beatNow()); CanvasRenderingContext2D.prototype.fillText = f;
        const cv = $('hw'); return { ecrits, h: cv.clientHeight, w: cv.clientWidth }; });
      const phrase = r.ecrits.find(e => e[0] === 'B si tu le lances maintenant');
      expect(phrase).toBeTruthy();
      expect(phrase[2]).toBeLessThan(r.h - 2);
      expect(phrase[2] > 136 + 46).toBe(dessous);   // sous la piste de B sur ordinateur, entre A et B sur téléphone
      expect(r.ecrits.some(e => e[0] === 'Drop' && e[1] < r.w)).toBe(true);
      expect(erreurs).toEqual([]);
    });
});
