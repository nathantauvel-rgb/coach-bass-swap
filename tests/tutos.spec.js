// Lot 56 : l'onglet « Tutos » (js/tutos.js). Des tutos qui se regardent comme une vidéo : Vini explique, puis on écoute,
// et la piste et la table dessinée bougent avec le son. Première famille : les boucles (4 tutos). L'onglet reste caché tant
// que TUTOS_PRET est faux ; ?tutos=1 (ou window.DJINGOOD_TUTOS dans les tests) le montre.
const { test, expect } = require('@playwright/test');
const { ouvrir } = require('./outils');

const AVEC = 'window.DJINGOOD_TUTOS = true;';
const ouvrirTutos = (page, o = {}) => ouvrir(page, Object.assign({ onglet: 'tutos', avant: AVEC }, o));
// Ouvre un tuto par sa carte (le clic lance le son), puis attend que la musique soit chargée
async function lancer(page, id){
  await page.locator(`[data-tu="${id}"]`).click();
  await page.waitForFunction(() => tu.phase !== 'charge', null, { timeout: 30000 });
}
// Ce que joue une platine d'une version, entre xa et xb : [début, fin, temps du morceau, la boucle est repartie]
const joue = (page, id, version, k, xa, xb) => page.evaluate(([id, version, k, xa, xb]) =>
  tuJoue(TUTOS.find(t => t.id === id).versions[version][k], xa, xb).pieces.map(p => [+p.x0.toFixed(3), +p.x1.toFixed(3), +p.b0.toFixed(3), p.rep]), [id, version, k, xa, xb]);

test.describe('Tutos : l\'onglet', () => {
  test('caché tant que les tutos ne sont pas prêts : #tutos mène à l\'accueil', async ({ page }) => {
    const erreurs = await ouvrir(page, { onglet: 'tutos' });
    await expect(page.locator('#tabTutos')).toBeHidden();
    await expect(page.locator('#vHome')).toBeVisible();
    await expect(page.locator('#vTutos')).toBeHidden();
    expect(await page.evaluate(() => TUTOS_PRET)).toBe(false);
    expect(erreurs).toEqual([]);
  });

  test('?tutos=1 montre l\'onglet, et il reste là quand on recharge sans le paramètre', async ({ page }) => {
    await ouvrir(page, { onglet: 'accueil' });
    await page.goto('/index.html?tutos=1#tutos');
    await expect(page.locator('#tabTutos')).toBeVisible();
    await expect(page.locator('#vTutos')).toBeVisible();
    await page.goto('/index.html#tutos');
    await expect(page.locator('#tabTutos')).toBeVisible();
  });

  test('le catalogue : les boucles en quatre tutos, le premier gratuit, Vini conseille le premier', async ({ page }) => {
    const erreurs = await ouvrirTutos(page);
    await expect(page.locator('#tabTutos')).toHaveAttribute('aria-current', 'page');
    await expect(page.locator('.tu-famille h2')).toHaveText('Les boucles');
    await expect(page.locator('.tu-carte')).toHaveCount(4);
    await expect(page.locator('.tu-carte strong')).toHaveText(['La boucle qui attend', "La boucle qui prolonge l'outro", 'La montée en boucle', 'La boucle de secours']);
    await expect(page.locator('.tu-etiq')).toHaveText(['Gratuit', 'Pro', 'Pro', 'Pro']);
    await expect(page.locator('#tutosTip')).toContainText('La boucle qui attend');
    expect(erreurs).toEqual([]);
  });
});

test.describe('Tutos : ce que jouent les platines', () => {
  test('la boucle qui attend : B tourne sur son intro, son drop tombe pile au temps 128', async ({ page }) => {
    await ouvrirTutos(page);
    expect(await joue(page, 'attend', 'bon', 'B', 80, 144)).toEqual([[80, 96, 48, false], [96, 128, 32, true], [128, 144, 64, false]]);
    // IN 2 temps trop tard : 2 temps de drop s'échappent (64 à 66) avant que la boucle reparte
    expect(await joue(page, 'attend', 'mord', 'B', 80, 144)).toEqual([[80, 98, 48, false], [98, 128, 34, true], [128, 144, 64, false]]);
    // OUT un quart de temps trop tard : B a un quart de temps de retard après EXIT
    const boite = await joue(page, 'attend', 'boite', 'B', 80, 144);
    expect(boite[boite.length - 1]).toEqual([128, 144, 63.75, false]);
    // A est baissé d'un coup au temps 128
    expect(await page.evaluate(() => { const a = TUTOS[0].versions.bon.A; return [tuNiv(a, 127.9), tuNiv(a, 128.1)]; })).toEqual([1, 0]);
  });

  test('la boucle qui prolonge l\'outro : A répète ses 16 derniers temps ; un EXIT trop tôt laisse un trou', async ({ page }) => {
    await ouvrirTutos(page);
    expect(await joue(page, 'prolonge', 'bon', 'A', 104, 160)).toEqual([[104, 112, 104, false], [112, 128, 112, false], [128, 144, 112, true], [144, 160, 112, true]]);
    // EXIT au temps 136 : A finit sa boucle jusqu'au bout de son morceau (temps 128), puis plus rien jusqu'au drop de B
    expect(await joue(page, 'prolonge', 'tot', 'A', 104, 160)).toEqual([[104, 112, 104, false], [112, 128, 112, false], [128, 136, 112, true], [136, 144, 120, false]]);
    expect(await joue(page, 'prolonge', 'sans', 'A', 104, 160)).toEqual([[104, 128, 104, false]]);
  });

  test('la montée en boucle : 8, 4, 2, 1, un demi, deux tours à chaque fois, et le drop au temps 128', async ({ page }) => {
    await ouvrirTutos(page);
    const a = await joue(page, 'montee', 'bon', 'A', 96, 128);
    expect(a.reduce((s, p) => s + p[1] - p[0], 0)).toBeCloseTo(32, 6);
    expect(a.map(p => p[1] - p[0])).toEqual([8, 8, 4, 4, 2, 2, 1, 1, .5, .5, .5, .5]);
    expect(a.every(p => p[2] === 96)).toBe(true);   // chaque tour repart du début de la boucle
    expect(await page.evaluate(() => tuJoue(TUTOS[2].versions.bon.B, 128, 128).b)).toBe(64);
    // trop vite : la boucle d'un demi-temps tourne pendant 18 temps
    const vite = await joue(page, 'montee', 'vite', 'A', 110, 128);
    expect(vite.every(p => p[1] - p[0] <= .5 + 1e-6)).toBe(true);
    expect(vite.length).toBe(36);
  });

  test('la boucle de secours : A répète sa dernière mesure deux fois ; une boucle qui déborde fait des trous', async ({ page }) => {
    await ouvrirTutos(page);
    expect(await joue(page, 'secours', 'bon', 'A', 120, 136)).toEqual([[120, 124, 120, false], [124, 128, 124, false], [128, 132, 124, true], [132, 136, 124, true]]);
    expect(await page.evaluate(() => tuJoue(TUTOS[3].versions.bon.B, 136, 136).b)).toBe(64);
    const deborde = await joue(page, 'secours', 'deborde', 'A', 126, 136);
    expect(deborde.reduce((s, p) => s + p[1] - p[0], 0)).toBeCloseTo(6, 6);   // 10 temps, dont 4 de silence
  });

  test('chaque plan est complet : version qui existe, commandes montrées dessinées, 3 lignes à retenir', async ({ page }) => {
    await ouvrirTutos(page);
    const soucis = await page.evaluate(() => {
      const r = [];
      $('tuTable').innerHTML = tuTableSvg();
      for (const t of TUTOS){
        if (t.retenir.length !== 3) r.push(t.id + ' : retenir');
        if (t.plans[t.plans.length - 1].fin !== true) r.push(t.id + ' : pas de fin');
        for (const c of [0, 1, 2, 3, 4]) if (!t.plans.some(p => p.ch === c)) r.push(t.id + ' : chapitre ' + c + ' vide');
        t.plans.forEach((p, i) => {
          if (p.seg && !t.versions[p.seg[2] || 'bon']) r.push(`${t.id} ${i} : version ${p.seg[2]}`);
          if (p.seg && (p.seg[0] < t.vue[0] - 8 || p.seg[1] > t.vue[1] + 1e-9)) r.push(`${t.id} ${i} : hors de la piste`);
          (p.cibles || []).forEach(c => { if (!tuCtl(c)) r.push(`${t.id} ${i} : commande ${c}`); });
        });
      }
      return r;
    });
    expect(soucis).toEqual([]);
  });
});

test.describe('Tutos : le lecteur', () => {
  test('un tuto se joue : le son part, la piste et la table suivent, pause, plan suivant', async ({ page }) => {
    const erreurs = await ouvrirTutos(page);
    await lancer(page, 'attend');
    await expect(page.locator('#tuLecteur')).toBeVisible();
    await expect(page.locator('#tuCatalogue')).toBeHidden();
    await expect(page.locator('#tuTitre')).toHaveText('La boucle qui attend');
    await expect(page.locator('#tuChaps button')).toHaveCount(5);
    await expect(page.locator('#tuBulle')).toContainText("Écoute d'abord");
    // « Réécouter » sur le premier plan : le passage d'après n'est pas encore là, on va directement à l'écoute du plan 2
    await page.evaluate(() => tuAller(1, { direct: true }));
    await page.waitForFunction(() => tu.phase === 'son' && tuX() > 82, null, { timeout: 20000 });
    expect(await page.evaluate(() => tu.srcs.length)).toBeGreaterThan(2);
    await expect(page.locator('#tuEcoute')).toBeVisible();
    await expect(page.locator('#tuCurseur')).toBeVisible();
    await expect(page.locator('#tuMesure')).toContainText('sur 8');
    await expect(page.locator('#tuTable [data-c="playB"]')).toHaveClass(/on-b/);
    await expect(page.locator('#tuTable [data-c="inB"]')).toHaveClass(/on-b/);   // IN appuyé au temps 64, OUT pas encore
    // pause : le son s'arrête avec l'image
    await page.locator('#tuLire').click();
    await expect.poll(() => page.evaluate(() => ac.state)).toBe('suspended');
    const x = await page.evaluate(() => tuX());
    await page.waitForTimeout(500);
    expect(await page.evaluate(() => tuX())).toBeCloseTo(x, 3);
    await page.locator('#tuLire').click();
    await expect.poll(() => page.evaluate(() => ac.state)).toBe('running');
    await page.locator('#tuSuiv').click();
    expect(await page.evaluate(() => [tu.i, tu.phase, tu.srcs.length])).toEqual([2, 'texte', 0]);
    await expect(page.locator('#tuChaps button.ici')).toContainText('Écoute');
    expect(erreurs).toEqual([]);
  });

  test('« Pas à pas » : la commande du geste est montrée, puis s\'allume au moment où on l\'entend', async ({ page }) => {
    await ouvrirTutos(page);
    await lancer(page, 'attend');
    await page.locator('#tuChaps button[data-c="2"]').click();
    await expect(page.locator('#tuEtape')).toHaveText('Étape 1 sur 5');
    await page.evaluate(() => tuAller(7, { direct: true }));   // « appuie sur IN » au début de la phrase suivante
    await expect(page.locator('#tuEtape')).toHaveText('Étape 2 sur 5');
    await expect(page.locator('#tuTable [data-c="inB"]')).toHaveClass(/cible/);
    await expect(page.locator('#tuTable [data-c="inB"]')).not.toHaveClass(/on-b/);
    await expect(page.locator('#tuMarques .tu-mk', { hasText: 'IN' })).toHaveCount(0);
    await page.waitForFunction(() => tu.phase === 'son' && tuX() > 64.5, null, { timeout: 20000 });
    await expect(page.locator('#tuTable [data-c="inB"]')).toHaveClass(/on-b/);
    await expect(page.locator('#tuMarques .tu-mk', { hasText: 'IN' })).toHaveCount(1);
  });

  test('« Les erreurs » : la version ratée est annoncée, et la piste montre où ça casse', async ({ page }) => {
    await ouvrirTutos(page);
    await lancer(page, 'attend');
    await page.locator('#tuChaps button[data-c="3"]').click();
    await expect(page.locator('#tuEtape')).toHaveText('Erreur n° 1');
    await expect(page.locator('#tuBadge2')).toHaveText('Version ratée');
    await expect(page.locator('.tu-alerte')).toContainText("2 temps de drop s'échappent");
    await page.locator('#tuSuiv').click();
    await expect(page.locator('#tuBadge2')).toHaveText('Version réussie');
    await expect(page.locator('.tu-alerte')).toHaveCount(0);
  });

  test('« À retenir » : trois lignes, le tuto est marqué vu, et le suivant est proposé', async ({ page }) => {
    await ouvrirTutos(page);
    await lancer(page, 'attend');
    await page.locator('#tuChaps button[data-c="4"]').click();
    await expect(page.locator('#tuRetenir')).toBeVisible();
    await expect(page.locator('#tuPiste')).toBeHidden();
    await expect(page.locator('#tuRetenirListe li')).toHaveCount(3);
    await expect(page.locator('#tuSuivant')).toContainText("La boucle qui prolonge l'outro");
    expect(await page.evaluate(() => JSON.parse(localStorage.getItem('coach-tutos')))).toEqual({ vus: ['attend'], vol: .7 });
    await page.locator('#tuSuivant').click();
    await page.waitForFunction(() => tu.phase !== 'charge' && tu.t.id === 'prolonge', null, { timeout: 30000 });
    await expect(page.locator('#tuTitre')).toHaveText("La boucle qui prolonge l'outro");
    await page.locator('#tuRetour').click();
    await expect(page.locator('#tuCatalogue')).toBeVisible();
    await expect(page.locator('.tu-etiq').first()).toHaveText('Vu');
    await expect(page.locator('#tutosTip')).toContainText("La boucle qui prolonge l'outro");
    // le dernier tuto de la famille ne propose pas de suivant
    await lancer(page, 'secours');
    await page.locator('#tuChaps button[data-c="4"]').click();
    await expect(page.locator('#tuSuivant')).toBeHidden();
  });

  test('changer d\'onglet arrête le tuto et son son', async ({ page }) => {
    await ouvrirTutos(page);
    await lancer(page, 'montee');
    await page.evaluate(() => tuAller(1, { direct: true }));
    await page.waitForFunction(() => tu.phase === 'son', null, { timeout: 20000 });
    await page.locator('#tabs a[data-view="accueil"]').click();
    await expect(page.locator('#vHome')).toBeVisible();
    expect(await page.evaluate(() => [tu.phase, tu.srcs.length, tu.son])).toEqual(['ferme', 0, null]);
    await page.locator('#tabTutos').click();
    await expect(page.locator('#tuCatalogue')).toBeVisible();
    await expect(page.locator('#tuLecteur')).toBeHidden();
  });

  test('les quatre tutos s\'ouvrent et vont jusqu\'au bout sans erreur', async ({ page }) => {
    const erreurs = await ouvrirTutos(page);
    for (const id of ['attend', 'prolonge', 'montee', 'secours']){
      await lancer(page, id);
      const n = await page.evaluate(() => tu.t.plans.length);
      for (let i = 0; i < n; i++) await page.evaluate(i => tuAller(i, { direct: true }), i);
      await expect(page.locator('#tuRetenirListe li')).toHaveCount(3);
      await page.locator('#tuRetour').click();
    }
    expect(await page.evaluate(() => JSON.parse(localStorage.getItem('coach-tutos')).vus)).toEqual(['attend', 'prolonge', 'montee', 'secours']);
    await expect(page.locator('#tutosTip')).toContainText('tous les tutos');
    expect(erreurs).toEqual([]);
  });

  test('sur un portable (1366 × 768), le lecteur tient en entier à l\'écran une fois ouvert', async ({ page }) => {
    await ouvrirTutos(page);
    await lancer(page, 'attend');
    const r = await page.evaluate(() => { const a = $('tuLecteur').getBoundingClientRect(); return [a.top, a.bottom, innerHeight]; });
    expect(r[0]).toBeGreaterThanOrEqual(0);
    expect(r[1]).toBeLessThanOrEqual(r[2]);
  });
});

test.describe('Tutos : le volume', () => {
  test('la glissière règle le volume ; le haut-parleur du lecteur et celui de l\'en-tête coupent le son', async ({ page }) => {
    await ouvrirTutos(page);
    await lancer(page, 'attend');
    await page.evaluate(() => tuAller(1, { direct: true }));
    await page.waitForFunction(() => tu.phase === 'son', null, { timeout: 20000 });
    const gain = () => page.evaluate(() => new Promise(r => setTimeout(() => r(+tu.sortie.gain.value.toFixed(3)), 300)));
    expect(await gain()).toBeCloseTo(.49, 2);   // 0,7 au carré
    await page.locator('#tuVolume').fill('0.3');
    expect(await gain()).toBeCloseTo(.09, 2);
    expect(await page.evaluate(() => JSON.parse(localStorage.getItem('coach-tutos')).vol)).toBe(.3);
    await page.locator('#tuMuet').click();
    expect(await gain()).toBe(0);
    await page.locator('#tuMuet').click();
    expect(await gain()).toBeCloseTo(.09, 2);
    await page.locator('#sonsBtn').click();   // le haut-parleur de l'en-tête coupe aussi les tutos
    expect(await gain()).toBe(0);
    await expect(page.locator('#tuMuet')).toHaveAttribute('aria-pressed', 'true');
    await page.locator('#tuVolume').fill('0.5');   // remonter le volume du lecteur rallume les sons
    expect(await page.evaluate(() => sonsOn)).toBe(true);
    expect(await gain()).toBeCloseTo(.25, 2);
  });
});
