// Lot 47 : des niveaux plus courts (on n'attend plus 30 secondes après le seul geste demandé), et la « voix » fabriquée par
// le site retirée du chapitre 3 (l'utilisateur la trouvait très désagréable).
const { test, expect } = require('@playwright/test');
const { ouvrir, sansBandeau, jouer } = require('./outils');

const S = o => JSON.stringify(o);
const CH3 = { 'coach-chapitre': '3', 'coach-ch2-ouvert': '1', 'coach-ch2': S({ 0: 3, 1: 3, 2: 3, 3: 3 }) };
// Un « robot » qui fait exactement le geste idéal (comme dans combos.spec.js)
const robot = page => page.evaluate(() => { const l = LESSONS[li];
  const tick = () => { if (!run) return; const b = beatNow();
    for (const k of l.user) ctrl[k] = ideal(k, b); applyCtrl();
    if (!l.autoLaunch && run.launch === null && b >= l.launchBeat - .3) launchB();
    if (l.btn.includes('echo') && !echoOn && run.echoAt == null && b >= 62.9) toggleEcho();
    requestAnimationFrame(tick); };
  requestAnimationFrame(tick); });

test.describe('Durée des niveaux', () => {
  test('aucun niveau ne fait attendre plus de 12 temps après son dernier geste', async ({ page }) => {
    await ouvrir(page);
    const trop = await page.evaluate(() => {
      const out = [];
      for (let i = 0; i < 4; i++){ const l = CH3_LESSONS[3]; randomizeRead(l); if (l.targets.length !== 1) out.push('lecture express sans geste'); }
      for (const [ch, list] of [[1, BASE_LESSONS], [3, CH3_LESSONS], [4, CH4_LESSONS], [6, CH6_LESSONS]]) list.forEach((l, i) => {
        const t = l.targets.map(x => x[0]), nom = `chapitre ${ch}, niveau ${i + 1}`;
        if (!t.length){ out.push(nom + ' : aucun geste'); return; }
        if (l.end - Math.max(...t) > 12) out.push(`${nom} : ${l.end - Math.max(...t)} temps d'attente après le dernier geste`);
        // le piège du break est fait pour qu'on attende : le break passe avant le bon moment
        if (Math.min(...t) - l.start > 16 && l.kind !== 'break') out.push(`${nom} : ${Math.min(...t) - l.start} temps d'attente avant le premier geste`);
        if (l.caps.some(c => c[0] < l.start || c[0] >= l.end)) out.push(nom + ' : une légende de démo hors de la partie');
      });
      return out;
    });
    expect(trop).toEqual([]);
  });
  test('chapitre 5 : on ne garde plus B calé pendant 30 secondes de trop', async ({ page }) => {
    await ouvrir(page);
    expect(await page.evaluate(() => CH5_LESSONS.map(l => l.end))).toEqual([124, 64, 84, 84, 80, 80, 80]);
  });
  test('au swap, B est déjà en route au départ, au bon endroit de son morceau', async ({ page }) => {
    test.setTimeout(60000);
    const erreurs = await ouvrir(page);
    await page.locator('.node').nth(5).click();
    await jouer(page);
    await page.waitForFunction(() => beatNow() >= 50, null, { timeout: 30000, polling: 'raf' });
    // A au temps b, B lancé au temps 32 (depuis le début de son morceau) : B en est à son temps b − 32
    const [joue, ecart] = await page.evaluate(() => [deck.B.joue, plPos('B') / P - (beatNow() - 32)]);
    expect(joue).toBe(true);
    expect(Math.abs(ecart)).toBeLessThan(.05);
    expect(erreurs).toEqual([]); await sansBandeau(page);
  });
});

test.describe('Chapitre 3', () => {
  test('la voix fabriquée par le site n\'existe plus nulle part', async ({ page }) => {
    await ouvrir(page);
    expect(await page.evaluate(() => /voice|'v'/.test(makeSong.toString()))).toBe(false);
    expect(await page.evaluate(() => CH3_LESSONS.some(l => (l.A || []).concat(l.B || []).some(s => s[2].includes('v'))))).toBe(false);
    // à la place : une mélodie sur A, puis une sur B
    expect(await page.evaluate(() => { const l = CH3_LESSONS[2]; return [l.title, l.A.some(s => s[2].includes('lead')), l.B.some(s => s[2].includes('lead'))]; }))
      .toEqual(['Une seule mélodie à la fois', true, true]);
  });
  test('couper le MID de A fait vraiment reculer sa mélodie', async ({ page }) => {
    test.setTimeout(60000);
    await ouvrir(page);
    // la mélodie seule de A, passée dans le MID de la table (normal, puis coupé) : on compare les volumes
    const db = await page.evaluate(async () => {
      const t = await renderSong('house', 'A', 11, [[0, 32, ['lead']]], {}, 124), n = t.L.length, sr = SR;
      const rms = async gain => { const oc = new OfflineAudioContext(1, n, sr), b = oc.createBuffer(1, n, sr); b.copyToChannel(t.L, 0);
        const s = oc.createBufferSource(), f = oc.createBiquadFilter(); s.buffer = b; f.type = 'peaking'; f.frequency.value = 1000; f.Q.value = .7; f.gain.value = gain;
        s.connect(f); f.connect(oc.destination); s.start(); const r = (await oc.startRendering()).getChannelData(0); let e = 0; for (let i = 0; i < n; i++) e += r[i] * r[i]; return Math.sqrt(e / n); };
      return 20 * Math.log10(await rms(lowDb(0)) / await rms(lowDb(.5)));
    });
    expect(db).toBeLessThan(-10);
  });
  for (const [i, nom] of [[0, 'L\'intro courte'], [1, 'Le piège du break'], [2, 'Une seule mélodie à la fois'], [3, 'Lecture express']]) {
    test(`${nom} : joué parfaitement, 3 étoiles, et la partie s'arrête peu après le geste`, async ({ page }) => {
      test.setTimeout(120000);
      const erreurs = await ouvrir(page, { stockage: CH3 });
      await page.locator('.node').nth(i).click();
      await expect(page.locator('#ltitle')).toHaveText(nom);
      await jouer(page);
      const [debut, fin, geste] = await page.evaluate(() => { const l = LESSONS[li]; return [START, END, Math.max(...l.targets.map(x => x[0]))]; });
      expect(fin - geste).toBeLessThanOrEqual(12);
      const t0 = Date.now();
      await robot(page);
      await expect(page.locator('#result')).toBeVisible({ timeout: 90000 });
      // la partie dure (fin − début) temps, à 124 BPM ; quelques secondes de marge pour le navigateur de test
      expect(Date.now() - t0).toBeLessThan((fin - debut) * 60 / 124 * 1000 + 6000);
      const conseils = await page.locator('#rDetails li').allTextContents();
      expect(await page.locator('#rDetails li.ok').count(), conseils.join(' / ')).toBe(conseils.length);
      await expect(page.locator('#rStars span.on')).toHaveCount(3);
      expect(erreurs).toEqual([]); await sansBandeau(page);
    });
  }
  test('« Le piège du break » : lancer B pendant le break, c\'est le piège', async ({ page }) => {
    test.setTimeout(90000);
    const erreurs = await ouvrir(page, { stockage: CH3 });
    await page.locator('.node').nth(1).click();
    await jouer(page);
    await page.waitForFunction(() => beatNow() >= 19.7, null, { timeout: 60000, polling: 'raf' });
    await page.keyboard.press('Space');
    await expect(page.locator('#result')).toBeVisible({ timeout: 60000 });
    await page.locator('#rToutSum').click();
    await expect(page.locator('#rDetails')).toContainText('piéger par le break');
    expect(erreurs).toEqual([]); await sansBandeau(page);
  });
});
