// Lot 56 : l'onglet « Tutos » (js/tutos.js). Des tutos qui se regardent comme une vidéo : Vini explique, puis on écoute,
// et la piste et la table dessinée bougent avec le son. Trois familles depuis le lot 58 : le volume et les basses (4 tutos),
// les effets (3), les boucles (4). L'onglet reste caché tant que TUTOS_PRET est faux ; ?tutos=1 (ou window.DJINGOOD_TUTOS
// dans les tests) le montre.
const { test, expect } = require('@playwright/test');
const { ouvrir } = require('./outils');

const AVEC = 'window.DJINGOOD_TUTOS = true;';
const ORDRE = ['fondu', 'swap', 'bandes', 'coupe', 'echo', 'reverbe', 'filtre', 'attend', 'prolonge', 'montee', 'secours'];   // l'ordre du catalogue
const BOUCLES = ['attend', 'prolonge', 'montee', 'secours'];
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

  test('le catalogue : trois familles dans l\'ordre où on les apprend, le premier tuto de chacune gratuit', async ({ page }) => {
    const erreurs = await ouvrirTutos(page);
    await expect(page.locator('#tabTutos')).toHaveAttribute('aria-current', 'page');
    await expect(page.locator('.tu-famille h2')).toHaveText(['Le volume et les basses', 'Les effets', 'Les boucles']);
    await expect(page.locator('.tu-carte')).toHaveCount(11);
    expect(await page.locator('.tu-carte').evaluateAll(cs => cs.map(c => c.dataset.tu))).toEqual(ORDRE);
    await expect(page.locator('.tu-carte strong')).toHaveText(['Le fondu au fader', 'Le swap des basses', 'Le mix aux 3 bandes', 'La coupure sèche',
      "L'écho out", 'La sortie dans la réverbe', 'Le filtre qui ouvre', 'La boucle qui attend', "La boucle qui prolonge l'outro", 'La montée en boucle', 'La boucle de secours']);
    await expect(page.locator('.tu-etiq')).toHaveText(['Gratuit', 'Pro', 'Pro', 'Pro', 'Gratuit', 'Pro', 'Pro', 'Gratuit', 'Pro', 'Pro', 'Pro']);
    await expect(page.locator('#tutosTip')).toContainText('Le fondu au fader');
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
    expect(await page.evaluate(() => tuJoue(TUTOS[2].versions.bon.B, 128, 128).b)).toBe(32);   // « Fashion Diva » : 32 temps d'intro
    // trop vite : la boucle d'un demi-temps tourne pendant 18 temps
    const vite = await joue(page, 'montee', 'vite', 'A', 110, 128);
    expect(vite.every(p => p[1] - p[0] <= .5 + 1e-6)).toBe(true);
    expect(vite.length).toBe(36);
  });

  test('la boucle de secours : A répète sa dernière mesure deux fois ; une boucle qui déborde fait des trous', async ({ page }) => {
    await ouvrirTutos(page);
    expect(await joue(page, 'secours', 'bon', 'A', 120, 136)).toEqual([[120, 124, 120, false], [124, 128, 124, false], [128, 132, 124, true], [132, 136, 124, true]]);
    expect(await page.evaluate(() => tuJoue(TUTOS[3].versions.bon.B, 136, 136).b)).toBe(32);
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
    expect(await page.evaluate(() => JSON.parse(localStorage.getItem('coach-tutos')))).toEqual({ vus: ['attend'] });   // plus de `vol` depuis le lot 60 (volume du site, coach-volume)
    await page.locator('#tuSuivant').click();
    await page.waitForFunction(() => tu.phase !== 'charge' && tu.t.id === 'prolonge', null, { timeout: 30000 });
    await expect(page.locator('#tuTitre')).toHaveText("La boucle qui prolonge l'outro");
    await page.locator('#tuRetour').click();
    await expect(page.locator('#tuCatalogue')).toBeVisible();
    await expect(page.locator('[data-tu="attend"] .tu-etiq')).toHaveText('Vu');
    // Vini conseille le premier tuto pas encore vu, dans l'ordre du catalogue (lot 58 : les gestes de base d'abord)
    await expect(page.locator('#tutosTip')).toContainText('Le fondu au fader');
    // d'une famille à l'autre, dans l'ordre du catalogue : après « Le filtre qui ouvre », « La boucle qui attend » (gardien du lot 58)
    await lancer(page, 'filtre');
    await page.locator('#tuChaps button[data-c="4"]').click();
    await expect(page.locator('#tuSuivant')).toContainText('La boucle qui attend');
    await page.locator('#tuSuivant').click();
    await page.waitForFunction(() => tu.phase !== 'charge' && tu.t.id === 'attend', null, { timeout: 30000 });
    await page.locator('#tuRetour').click();
    // le dernier tuto du catalogue ne propose pas de suivant
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

  test('les onze tutos s\'ouvrent et vont jusqu\'au bout sans erreur', async ({ page }) => {
    test.setTimeout(120000);
    const erreurs = await ouvrirTutos(page);
    for (const id of ORDRE){
      await lancer(page, id);
      const n = await page.evaluate(() => tu.t.plans.length);
      for (let i = 0; i < n; i++) await page.evaluate(i => tuAller(i, { direct: true }), i);
      await expect(page.locator('#tuRetenirListe li')).toHaveCount(3);
      await page.locator('#tuRetour').click();
    }
    expect(await page.evaluate(() => JSON.parse(localStorage.getItem('coach-tutos')).vus)).toEqual(ORDRE);
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
  // Lot 60 : la glissière du lecteur est celle du volume de TOUT le site (master) ; les tutos gardent leur niveau d'avant
  // (0,49) par rapport aux exercices
  test('la glissière règle le volume du site ; le haut-parleur du lecteur coupe et remet le son', async ({ page }) => {
    await ouvrirTutos(page);
    await lancer(page, 'attend');
    await page.evaluate(() => tuAller(1, { direct: true }));
    await page.waitForFunction(() => tu.phase === 'son', null, { timeout: 20000 });
    const gains = () => page.evaluate(() => new Promise(r => setTimeout(() => r([+tu.sortie.gain.value.toFixed(3), +master.gain.value.toFixed(4)]), 300)));
    expect(await gains()).toEqual([.49, .1875]);   // volume du site à 50 % : 0,75 × 0,5 au carré
    await page.locator('#tuVolume').fill('0.3');
    expect((await gains())[1]).toBeCloseTo(.0675, 3);
    expect(await page.evaluate(() => localStorage.getItem('coach-volume'))).toBe('0.3');
    await expect(page.locator('#volCurseur')).toHaveValue('30');   // le curseur de l'en-tête suit
    await page.locator('#tuMuet').click();
    expect((await gains())[1]).toBe(0);
    await expect(page.locator('#tuMuet')).toHaveAttribute('aria-pressed', 'true');
    await page.locator('#tuMuet').click();
    expect((await gains())[1]).toBeCloseTo(.0675, 3);
    expect((await gains())[0]).toBe(.49);
  });
});

test.describe('Tutos : la musique', () => {
  test('dans chaque bonne version, A est baissé pile quand B arrive au début de son drop', async ({ page }) => {
    await ouvrirTutos(page);
    const r = await page.evaluate(ids => ids.map(id => {
      const v = TUTOS.find(t => t.id === id).versions.bon, coupe = v.A.niv[v.A.niv.length - 2][0], drop = TU_PARTIES[v.B.m].find(p => p[3] === 'fort')[0];
      return [id, coupe, tuJoue(v.B, coupe, coupe).b === drop];
    }), BOUCLES);
    expect(r).toEqual([['attend', 128, true], ['prolonge', 160, true], ['montee', 128, true], ['secours', 136, true]]);
  });
  test('lot 58 : à partir du drop de B, jamais deux basses ensemble, et B finit à fond avec ses basses', async ({ page }) => {
    await ouvrirTutos(page);
    const r = await page.evaluate(() => TUTOS.filter(t => t.famille !== 'boucles').map(t => {
      const v = t.versions.bon, drop = TU_PARTIES[v.B.m].find(p => p[3] === 'fort')[0], xd = v.B.debut + drop - v.B.pos;
      const basse = (s, x) => tuNiv(s, x) > .05 && tuEq(s, 'low', x) > .5;
      let deux = 0; for (let x = xd + .1; x < xd + 32; x += .25) if (basse(v.A, x) && basse(v.B, x)) deux++;
      return [t.id, xd, deux, tuNiv(v.B, xd + 20) > .9 && tuEq(v.B, 'low', xd + 20) > .9];
    }));
    expect(r).toEqual([['fondu', 128, 0, true], ['swap', 96, 0, true], ['bandes', 96, 0, true], ['coupe', 128, 0, true],
      ['echo', 128, 0, true], ['reverbe', 128, 0, true], ['filtre', 128, 0, true]]);
    // et les versions ratées du swap et des 3 bandes en ont bien
    expect(await page.evaluate(() => [['swap', 'double'], ['swap', 'tard'], ['bandes', 'ensemble']].map(([id, n]) => {
      const v = TUTOS.find(t => t.id === id).versions[n], basse = (s, x) => tuNiv(s, x) > .05 && tuEq(s, 'low', x) > .5;
      return basse(v.A, 96.5) && basse(v.B, 96.5);
    }))).toEqual([true, true, true]);
    // aux 3 bandes, les basses de B arrivent en dernier : 16 temps après son drop
    expect(await page.evaluate(() => { const v = TUTOS.find(t => t.id === 'bandes').versions.bon; return [tuEq(v.B, 'low', 111.9), tuEq(v.B, 'low', 112.1), tuEq(v.A, 'low', 112.1)]; })).toEqual([0, 1, 0]);
  });

  test('les quatre extraits sont là, et chaque tuto dit d\'où vient sa musique', async ({ page }) => {
    await ouvrirTutos(page);
    for (const m of ['tuto-deep-a', 'tuto-instru-b', 'tuto-luxury-a', 'tuto-diva-b', 'niv-july-b']){
      const r = await page.request.get(`/musique/${m}.mp3`);
      expect(r.status(), m).toBe(200);
    }
    expect(await page.evaluate(() => TUTOS.every(t => TU_PARTIES[t.versions.bon.A.m] && TU_PARTIES[t.versions.bon.B.m] && TU_MUSIQUE[t.musique]))).toBe(true);
    await lancer(page, 'montee');
    await expect(page.locator('#tuMusique')).toContainText('Luxury Life');
  });
});

test.describe('Tutos : les potards, le filtre et les effets (lot 58)', () => {
  test('un tuto sans potards ne les allume pas ; le swap allume les LOW, l\'écho out le bouton ÉCHO', async ({ page }) => {
    await ouvrirTutos(page);
    const allumees = id => page.evaluate(id => { const t = TUTOS.find(x => x.id === id), c = tuCommandes(t); return ['lowA', 'lowB', 'hiB', 'filtreB', 'echo', 'reverb'].filter(x => c.has(x)); }, id);
    expect(await allumees('attend')).toEqual([]);
    expect(await allumees('swap')).toEqual(['lowA', 'lowB']);
    expect(await allumees('bandes')).toEqual(['lowA', 'lowB', 'hiB']);
    expect(await allumees('echo')).toEqual(['echo']);
    expect(await allumees('reverbe')).toEqual(['reverb']);
    expect(await allumees('filtre')).toEqual(['filtreB']);
  });
  test('la table dessinée suit : LOW coupé, ÉCHO allumé ; la piste montre « sans basses » et la queue de l\'écho', async ({ page }) => {
    const erreurs = await ouvrirTutos(page);
    await lancer(page, 'swap');
    await page.evaluate(() => tuMajTable(90, 'bon', false));
    await expect(page.locator('#tuTable [data-c="lowB"]')).toHaveClass(/coupe-b/);
    await expect(page.locator('#tuTable [data-c="lowA"]')).not.toHaveClass(/coupe-a/);
    await page.evaluate(() => tuMajTable(100, 'bon', false));
    await expect(page.locator('#tuTable [data-c="lowA"]')).toHaveClass(/coupe-a/);
    await expect(page.locator('#tuTable [data-c="lowB"]')).not.toHaveClass(/coupe-b/);
    await expect(page.locator('#tuVoieA .tu-blk', { hasText: 'sans basses' }).first()).toBeAttached();
    await page.locator('#tuRetour').click();
    await lancer(page, 'echo');
    await page.evaluate(() => tuMajTable(126, 'bon', false));
    await expect(page.locator('#tuTable [data-c="echo"]')).toHaveClass(/on-a/);
    await expect(page.locator('#tuVoieA .tu-blk.queue')).toHaveText('écho…');
    await expect(page.locator('#tuMarques .tu-mk', { hasText: 'ÉCHO' })).toHaveCount(1);
    expect(erreurs).toEqual([]);
  });
  test('le son : chaque nouveau tuto se joue (potards, filtre, effets branchés), et éteindre l\'effet coupe sa queue', async ({ page }) => {
    const erreurs = await ouvrirTutos(page);
    for (const id of ['swap', 'bandes', 'echo', 'reverbe', 'filtre']){
      await lancer(page, id);
      const r = await page.evaluate(() => { tuSonJoue([112, 136, 'bon']); return [tu.srcs.length > 0, tu.noeuds.length > 10]; });
      expect(r, id).toEqual([true, true]);
      await page.evaluate(() => tuSonStop());
      expect(await page.evaluate(() => tu.noeuds.length)).toBe(0);
      await page.locator('#tuRetour').click();
    }
    // la réverbe éteinte en même temps que le fader : plus de queue
    expect(await page.evaluate(() => { const v = TUTOS.find(t => t.id === 'reverbe').versions;
      return [tuFx(v.bon.A, 'reverb', 132), tuFx(v.eteint.A, 'reverb', 132)]; })).toEqual([true, false]);
    expect(erreurs).toEqual([]);
  });
});
