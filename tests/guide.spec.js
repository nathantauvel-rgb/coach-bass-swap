// Lot 51 : le guide du débutant (guide/*.html), des pages de questions écrites pour Google et pour les IA.
const { test, expect } = require('@playwright/test');
const fs = require('fs'), path = require('path');
const { ouvrir } = require('./outils');
const RACINE = path.join(__dirname, '..'), SITE = 'https://djingood.fr/';
const GUIDE = fs.readdirSync(path.join(RACINE, 'guide')).filter(f => f.endsWith('.html')).sort();
const QUESTIONS = GUIDE.filter(f => f !== 'index.html');
const plan = () => [...fs.readFileSync(path.join(RACINE, 'sitemap.xml'), 'utf8').matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
const adresse = f => SITE + 'guide/' + (f === 'index.html' ? '' : f);
// Les pages mettent une espace insécable devant « : » et « ? » ; les données pour Google, une espace simple
const net = t => t.replace(/\s+/g, ' ').trim();
const donnees = async page => JSON.parse(await page.locator('script[type="application/ld+json"]').textContent())['@graph'];

test.describe('Guide du débutant', () => {
  test('chaque page du guide est dans le plan du site et a sa carte sur la page d\'entrée', async ({ page }) => {
    expect(QUESTIONS.length).toBe(5);
    for (const f of GUIDE) expect(plan(), f).toContain(adresse(f));
    await page.goto('/guide/');
    await expect(page.locator('h1')).toHaveText('Le guide du DJ débutant');
    const cartes = await page.locator('.g-liste a.card').evaluateAll(as => as.map(a => a.getAttribute('href')));
    // En absolu : si Vercel sert /guide sans barre finale, des liens relatifs mèneraient hors du dossier.
    expect(cartes.sort()).toEqual(QUESTIONS.map(f => '/guide/' + f));
  });

  for (const f of QUESTIONS)
    test(`${f} : la question, la réponse en bref, l'auteur et ce que lisent Google et les IA`, async ({ page }) => {
      const erreurs = []; page.on('pageerror', e => erreurs.push(e.message));
      await page.goto('/guide/' + f);
      const g = await donnees(page), art = g.find(o => o['@type'] === 'Article');
      expect(net(await page.locator('h1').textContent())).toBe(art.headline);
      expect(await page.locator('link[rel="canonical"]').getAttribute('href')).toBe(adresse(f));
      expect(art.mainEntityOfPage).toBe(adresse(f));
      // signé de son vrai prénom (choix de l'utilisateur, 27 oct. 2026), avec la date affichée
      expect(art.author.name).toBe('Nathan');
      await expect(page.locator('.g-date')).toContainText('par Nathan, créateur de DJingood');
      expect(await page.locator('.g-date time').getAttribute('datetime')).toBe(art.dateModified);
      // la réponse courte tout en haut : c'est elle que les IA recopient
      expect(net(await page.locator('.g-tete .g-bref p').textContent()).length).toBeGreaterThan(150);
      // les questions fréquentes données à Google sont exactement celles de la page
      const faq = g.find(o => o['@type'] === 'FAQPage').mainEntity;
      const vues = await page.locator('.pres-faq details').evaluateAll(ds => ds.map(d => [d.querySelector('summary').textContent, d.querySelector('p').textContent]));
      expect(vues.length).toBeGreaterThan(2);
      expect(vues.map(([q, r]) => [net(q), net(r)])).toEqual(faq.map(q => [q.name, q.acceptedAnswer.text]));
      expect(g.find(o => o['@type'] === 'BreadcrumbList').itemListElement[1].item).toBe(SITE + 'guide/');
      // les quatre autres questions, et le bouton qui mène au jeu
      const autres = await page.locator('.g-autres li a').evaluateAll(as => as.map(a => a.getAttribute('href')));
      expect(autres.sort()).toEqual(QUESTIONS.filter(q => q !== f));
      // le bouton de la dernière scène ouvre le bon exercice du jeu (voir « Du guide au jeu » plus bas)
      await expect(page.locator('.g-essai a.cta')).toHaveAttribute('href', /^\.\.\/index\.html\?guide=(apprendre|phrase|transition|caler|table)$/);
      expect(await page.locator('script[src="../js/stats.js"]').count()).toBe(1);
      expect(erreurs).toEqual([]);
    });

  test('tous les liens, images et fichiers des pages du guide existent', async ({ page, request }) => {
    for (const f of GUIDE) {
      await page.goto('/guide/' + f);
      const urls = await page.locator('a[href], link[href], img[src], script[src]').evaluateAll(es => es.map(e => e.href || e.src));
      for (const u of new Set(urls.map(u => u.replace(/#.*/, '')))) {
        if (!u.startsWith(new URL(page.url()).origin)) continue;   // Google Fonts
        expect((await request.get(u)).status(), `${f} → ${u}`).toBe(200);
      }
    }
  });

  // Les sons d'exemple (guide/ecoute.js, fabriqués par tests/sons-guide.js) : un bouton par son, un seul son à la fois
  test('chaque bouton « Écouter » a son son, et un seul son joue à la fois', async ({ page, request }) => {
    const vus = [];
    for (const f of QUESTIONS) {
      await page.goto('/guide/' + f);
      for (const nom of await page.locator('button[data-son]').evaluateAll(bs => bs.map(b => b.dataset.son))) {
        expect((await request.get('/guide/sons/' + nom + '.mp3')).status(), `${f} → ${nom}`).toBe(200);
        vus.push(nom);
      }
    }
    expect(vus.sort()).toEqual(['cale', 'decale', 'deux-basses', 'phrase', 'swap']);
    await page.goto('/guide/premiere-transition-ddj-flx4.html');
    const [deux, swap] = [page.locator('button[data-son="deux-basses"]'), page.locator('button[data-son="swap"]')];
    await deux.click();
    await expect(deux).toHaveAttribute('aria-pressed', 'true');
    await swap.click();
    await expect(swap).toHaveAttribute('aria-pressed', 'true');
    await expect(deux).toHaveAttribute('aria-pressed', 'false');
    await swap.click();
    await expect(swap).toHaveAttribute('aria-pressed', 'false');
  });

  test('la grille de la phrase s\'allume au rythme du son, puis repart sur la phrase suivante', async ({ page }) => {
    await page.goto('/guide/phrase-musicale-32-temps.html');
    await page.locator('button[data-son="phrase"]').click();
    const allumee = () => page.evaluate(() => [...document.querySelectorAll('[data-grille] .g-t')].findIndex(e => e.classList.contains('g-on')));
    await expect.poll(allumee, { timeout: 5000 }).toBeGreaterThan(1);
    await expect(page.locator('[data-statut]')).toContainText('Mesure');
    // au temps 32, la basse arrive : la grille repart du premier « 1 », dans une autre couleur
    await page.waitForFunction(() => document.querySelector('[data-grille] .g-t.g-neuf'), null, { timeout: 25000 });
    await expect(page.locator('[data-statut]')).toContainText('Nouvelle phrase');
    await expect(page.locator('[data-grille] .g-t.g-neuf')).toHaveCount(1);
  });

  test('l\'accueil et la présentation mènent au guide', async ({ page }) => {
    await ouvrir(page, { onglet: 'accueil' });
    const lien = page.locator('#vHome a[href="guide/"]');
    await expect(lien).toBeVisible();
    await lien.click();
    await expect(page).toHaveURL(/\/guide\/$/);
    await expect(page.locator('h1')).toHaveText('Le guide du DJ débutant');
    await page.goto('/presentation.html');
    await expect(page.locator('a[href="guide/"]')).toHaveCount(1);
  });

  test('la présentation ne dit plus que le téléphone ne sert à rien (leçons « Comprendre », lot 48)', async ({ page }) => {
    await page.goto('/presentation.html');
    await page.locator('.pres-faq summary', { hasText: 'Sur téléphone ?' }).click();
    await expect(page.locator('.pres-faq details[open] p')).toContainText('sept petites leçons sans table');
  });
});

// Les pages en scènes, avec Vini (guide/guide.js, maquette validée par l'utilisateur le 28 oct. 2026)
test.describe('Guide du débutant en scènes', () => {
  test('Vini est sur chaque page, et chaque scène apparaît quand on descend', async ({ page }) => {
    for (const f of GUIDE) {
      await page.goto('/guide/' + f);
      expect(await page.locator('[data-vini] svg').count(), f).toBeGreaterThan(1);
      const derniere = page.locator('.vr-sc').last();
      await derniere.scrollIntoViewIfNeeded();
      await expect(derniere, f).toHaveClass(/vue/);
    }
  });

  test('sans les animations, tout le texte reste dans la page et lisible', async ({ browser }) => {
    const ctx = await browser.newContext({ javaScriptEnabled: false }), page = await ctx.newPage();
    await page.goto('/guide/premiere-transition-ddj-flx4.html');
    for (const s of await page.locator('.vr-pas li > span').all()) await expect(s).toBeVisible();
    await expect(page.locator('.vr-sc').nth(1)).toBeVisible();
    await expect(page.locator('.vr-dos').first()).toBeVisible();   // la solution des cartes à retourner
    await ctx.close();
  });

  test('première transition : les quatre gestes, un par un, sur le dessin de la FLX4', async ({ page }) => {
    await page.goto('/guide/premiere-transition-ddj-flx4.html');
    const sc = page.locator('section[data-etape]'), suiv = sc.locator('[data-suiv]');
    await expect(sc).toHaveAttribute('data-etape', '0');
    await expect(sc.locator('.vr-pas li.actif')).toHaveCount(0);
    await expect(sc.locator('.vr-bul')).toContainText('position de départ');
    for (const n of ['1', '2', '3', '4']) {
      await suiv.click();
      await expect(sc).toHaveAttribute('data-etape', n);
      await expect(sc.locator('.vr-pas li.actif')).toHaveCount(1);
      await expect(sc.locator('.vr-bul')).toContainText('Geste ' + n);   // Vini commente chaque geste (gardien)
    }
    await expect(suiv).toContainText('Recommencer');
    await expect(sc.locator('.vini')).toHaveClass(/vn-parfait/);
    // le dessin suit : au geste 4, le fader de A est descendu
    expect(await sc.locator('.g-fdr-a').evaluate(e => getComputedStyle(e).transform)).not.toBe('none');
    await suiv.click();
    await expect(sc).toHaveAttribute('data-etape', '0');
  });

  test('les cartes à retourner montrent la solution', async ({ page }) => {
    await page.goto('/guide/caler-sans-sync.html');
    const c = page.locator('.vr-piege').first();
    await c.scrollIntoViewIfNeeded();
    await c.click();
    await expect(c).toHaveAttribute('aria-pressed', 'true');
    await c.click();
    await expect(c).toHaveAttribute('aria-pressed', 'false');
  });

  test('table non détectée : l\'enquête, indice par indice, et « C\'était ça ! »', async ({ page }) => {
    await page.goto('/guide/table-dj-non-detectee.html');
    const box = page.locator('[data-pas]');
    await expect(box.locator('.vr-pas-n')).toHaveText('1 sur 6');
    await box.locator('[data-suiv]').click();
    await expect(box.locator('.vr-pas-n')).toHaveText('2 sur 6');
    await box.locator('[data-oui]').click();
    await expect(box.locator('.vr-pas-msg')).toContainText('enquête résolue');
  });

  test('la phrase : B sur le « 1 » ou n\'importe quand', async ({ page }) => {
    await page.goto('/guide/phrase-musicale-32-temps.html');
    const pistes = page.locator('[data-pistes]'), [bon, mal] = [page.locator('.vr-choix button').first(), page.locator('.vr-choix button').last()];
    await mal.click();
    await expect(pistes).toHaveClass(/mal/);
    await expect(mal).toHaveAttribute('aria-pressed', 'true');
    await bon.click();
    await expect(pistes).toHaveClass(/bon/);
  });

  test('la phrase, « À toi » : toucher le bouton sur le « 1 » de la phrase suivante', async ({ page }) => {
    await page.goto('/guide/phrase-musicale-32-temps.html');
    const jeu = page.locator('[data-jeu]');
    await jeu.locator('.vr-go').click();
    await expect(jeu.locator('.vr-pad')).toBeEnabled();
    // trop tôt, avant la moitié de la phrase : on ne compte pas, il faut attendre
    await jeu.locator('.vr-pad').dispatchEvent('pointerdown');
    await expect(jeu.locator('.vr-msg')).toContainText('Pas encore');
    // au temps 32 (15,48 s), la barre passe au vert : on touche tout de suite
    await page.waitForFunction(() => document.querySelector('.vr-mesures i.neuf'), null, { timeout: 25000, polling: 'raf' });
    await jeu.locator('.vr-pad').dispatchEvent('pointerdown');
    await expect(jeu.locator('.vr-msg')).toHaveText(/Pile|Presque/);
  });
});

// Du guide au jeu (lot 51) : ?guide=… ouvre l'exercice qui va avec la page, sans les questions de Vini (choix de l'utilisateur)
test.describe('Du guide au jeu', () => {
  const arrive = async (page, cle) => {
    const erreurs = []; page.on('pageerror', e => erreurs.push(e.message));
    await page.goto('/index.html?guide=' + cle);
    await expect(page).not.toHaveURL(/guide=/);   // le paramètre est retiré de l'adresse
    return erreurs;
  };

  test('la phrase : la leçon « La phrase » s\'ouvre tout de suite, sans les questions de Vini', async ({ page }) => {
    const erreurs = await arrive(page, 'phrase');
    await expect(page.locator('#cp')).toBeVisible();
    expect(await page.evaluate(() => cp.l)).toBe(3);
    await expect(page.locator('#pp')).toBeHidden();
    expect(erreurs).toEqual([]);
  });

  test('par où commencer : la première leçon « Comprendre »', async ({ page }) => {
    await arrive(page, 'apprendre');
    await expect(page.locator('#cp')).toBeVisible();
    expect(await page.evaluate(() => cp.l)).toBe(0);
  });

  test('première transition, sur ordinateur : le niveau « La transition complète »', async ({ page }) => {
    await arrive(page, 'transition');
    await expect(page.locator('#vLearn')).toBeVisible();
    await expect(page.locator('#ltitle')).toHaveText('La transition complète');
    expect(await page.evaluate(() => [chapter, li])).toEqual([1, 6]);
  });

  test('caler, sur ordinateur : le niveau 1 du chapitre 5, ouvert pour la visite seulement', async ({ page }) => {
    const erreurs = await arrive(page, 'caler');
    await expect(page.locator('#vLearn')).toBeVisible();
    expect(await page.evaluate(() => [chapter, li, ch5Unlocked()])).toEqual([5, 0, false]);
    expect(await page.evaluate(() => localStorage.getItem('coach-chapitre'))).not.toBe('5');
    await page.reload();
    await expect(page.locator('#vLearn')).toBeVisible();
    expect(await page.evaluate(() => chapter)).toBe(1);   // au rechargement, on revient où on en était
    expect(erreurs).toEqual([]);
  });

  test('sans parcours choisi, Vini ne dit pas « Tu as tout fait » dans Mes progrès (gardien)', async ({ page }) => {
    await arrive(page, 'phrase');
    await page.evaluate(() => { cpFerme(); location.hash = '#progres'; });
    await expect(page.locator('#progTip')).toContainText('Choisis ton parcours');
  });

  test('table non détectée : la page « Ma table »', async ({ page }) => {
    await arrive(page, 'table');
    await expect(page.locator('#vTable')).toBeVisible();
  });

  test('un paramètre inconnu ne change rien : les questions de Vini s\'ouvrent comme d\'habitude', async ({ page }) => {
    await page.goto('/index.html?guide=constructor');
    await expect(page.locator('#pp')).toBeVisible();
  });

  test('sur un téléphone, une leçon « Comprendre » à la place d\'un niveau qui demande une table', async ({ browser }) => {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true }), page = await ctx.newPage();
    await arrive(page, 'caler');
    await expect(page.locator('#cp')).toBeVisible();
    expect(await page.evaluate(() => cp.l)).toBe(2);
    await arrive(page, 'transition');
    expect(await page.evaluate(() => cp.l)).toBe(6);
    await ctx.close();
  });
});

test.describe('Guide du débutant sur téléphone', () => {
  test.use({ viewport: { width: 390, height: 844 } });
  test('aucune page ne déborde en largeur', async ({ page }) => {
    for (const f of GUIDE) {
      await page.goto('/guide/' + f);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), f).toBe(true);
    }
  });
});
