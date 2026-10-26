// Lot 50 : ce que Google, les IA et les liens partagés voient du site (titre, description, icônes, plan du site).
const { test, expect } = require('@playwright/test');
const fs = require('fs'), path = require('path');
const { ouvrir } = require('./outils');
const RACINE = path.join(__dirname, '..'), SITE = 'https://djingood.fr/';
// Une adresse du vrai site → le fichier du dépôt qui la sert
const local = url => url.replace(SITE, '/') === '/' ? '/index.html' : url.replace(SITE, '/');
const meta = (page, sel) => page.locator(sel).first().getAttribute('content');
const plan = () => [...fs.readFileSync(path.join(RACINE, 'sitemap.xml'), 'utf8').matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);

test.describe('SEO : la page d\'accueil', () => {
  test('titre, description, adresse officielle, aperçu des liens partagés et nom du site', async ({ page, request }) => {
    const erreurs = await ouvrir(page, { onglet: 'accueil' });
    await expect(page).toHaveTitle(/^DJingood · Apprends à mixer/);
    const desc = await meta(page, 'meta[name="description"]');
    expect(desc.length).toBeGreaterThan(70); expect(desc.length).toBeLessThanOrEqual(160);
    expect(await page.locator('link[rel="canonical"]').getAttribute('href')).toBe(SITE);
    expect(await meta(page, 'meta[property="og:url"]')).toBe(SITE);
    const image = await meta(page, 'meta[property="og:image"]');
    expect(image.startsWith(SITE)).toBe(true);
    expect((await request.get(local(image))).status()).toBe(200);
    // Google lit le nom du site ici : « DJingood », avec les majuscules (il affichait « Djingood »)
    const ld = JSON.parse(await page.locator('script[type="application/ld+json"]').textContent());
    const site = ld['@graph'].find(o => o['@type'] === 'WebSite');
    expect(site.name).toBe('DJingood'); expect(site.url).toBe(SITE);
    expect((await request.get(local(ld['@graph'].find(o => o['@type'] === 'Organization').logo))).status()).toBe(200);
    expect(erreurs).toEqual([]);
  });

  test('les icônes existent, aux bonnes tailles (Google veut un multiple de 48 pixels)', async ({ page, request }) => {
    await ouvrir(page, { onglet: 'accueil' });
    const liens = await page.locator('link[rel="icon"], link[rel="apple-touch-icon"]').evaluateAll(ls => ls.map(l => [l.getAttribute('href'), l.getAttribute('sizes')]));
    expect(liens.length).toBe(4);
    for (const [href, sizes] of liens) {
      const r = await request.get('/' + href); expect(r.status(), href).toBe(200);
      if (href.endsWith('.png')) { const b = await r.body(), cote = b.readUInt32BE(16);   // largeur écrite dans l'en-tête du PNG
        expect(b.readUInt32BE(20)).toBe(cote); if (sizes) expect(sizes).toBe(cote + 'x' + cote); }
    }
    expect(liens.find(([h]) => h === 'img/icone-192.png')).toBeTruthy();
    const ico = await (await request.get('/favicon.ico')).body();
    expect(ico.readUInt16LE(2)).toBe(1); expect(ico.readUInt16LE(4)).toBe(3);   // un vrai .ico, avec trois tailles
  });

  test('Google ne cite plus les boutons des fenêtres cachées', async ({ page }) => {
    await ouvrir(page, { onglet: 'accueil' });
    // toutes les fenêtres (Premiers pas, guide, avis…) sont écrites avant l'accueil : elles doivent être exclues de l'extrait
    const fenetres = await page.locator('[role="dialog"]').evaluateAll(ds => ds.map(d => [d.id, !!d.closest('[data-nosnippet]')]));
    expect(fenetres.length).toBeGreaterThan(5);
    expect(fenetres.filter(([, ok]) => !ok)).toEqual([]);
  });

  for (const [cas, stockage] of [['un nouveau venu', {}], ['un joueur qui a choisi son parcours', { 'coach-parcours': 'debut' }]])
    test(`l'accueil mène à la présentation (${cas})`, async ({ page }) => {
      await ouvrir(page, { onglet: 'accueil', stockage });
      const lien = page.locator('#vHome a[href="presentation.html"]');
      await expect(lien).toBeVisible();
      await lien.click();
      await expect(page).toHaveURL(/presentation\.html$/);
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', SITE + 'presentation.html');
    });
});

test.describe('SEO : plan du site et robots', () => {
  test('robots.txt laisse tout lire et donne le plan du site', async ({ request }) => {
    const r = await request.get('/robots.txt'); expect(r.status()).toBe(200);
    const t = await r.text();
    expect(t).toMatch(/^User-agent: \*$/m);
    expect(t).not.toMatch(/^Disallow: \/$/m);
    expect(t).toContain('Sitemap: ' + SITE + 'sitemap.xml');
  });

  test('chaque page du plan existe, a un titre, une description, et se déclare elle-même comme adresse officielle', async ({ page }) => {
    const urls = plan();
    expect(urls).toContain(SITE); expect(urls).toContain(SITE + 'presentation.html');
    for (const url of urls) {
      await page.goto(local(url));
      expect((await page.title()).length, url).toBeGreaterThan(10);
      expect((await meta(page, 'meta[name="description"]') || '').length, url).toBeGreaterThan(50);
      expect(await page.locator('link[rel="canonical"]').getAttribute('href'), url).toBe(url);
      expect(await page.locator('meta[name="robots"]').count(), url).toBe(0);
    }
  });

  test('la fiche des testeurs et l\'ancien mode libre restent hors de Google', async ({ request }) => {
    for (const f of ['testeurs.html', 'coach.html']) {
      expect(fs.readFileSync(path.join(RACINE, f), 'utf8')).toContain('<meta name="robots" content="noindex">');
      expect(plan()).not.toContain(SITE + f);
      expect((await request.get('/' + f)).status()).toBe(200);
    }
  });
});

test.describe('SEO : fichiers retirés de la mise en ligne', () => {
  // Lecture simplifiée de .vercelignore, suffisante pour ses lignes : un motif sans « / » vise un nom de fichier ou de
  // dossier à n'importe quelle profondeur, « * » remplace n'importe quels caractères sauf « / ».
  const motifs = fs.readFileSync(path.join(RACINE, '.vercelignore'), 'utf8').split(/\r?\n/).map(l => l.trim()).filter(l => l && !l.startsWith('#'));
  const exclu = chemin => motifs.some(m => { const re = new RegExp('^' + m.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '[^/]*') + '$');
    return chemin.split('/').some(s => re.test(s)); });

  test('les notes du projet et les tests ne sont plus publiés', () => {
    for (const f of ['CLAUDE.md', 'README.md', 'tests/outils.js', '.claude/agents/gardien.md', 'firestore.rules']) expect(exclu(f), f).toBe(true);
  });

  test('aucun fichier dont le site a besoin n\'est retiré', async ({ page }) => {
    const charges = new Set();
    page.on('request', r => { const u = new URL(r.url()); if (u.hostname === 'localhost') charges.add(decodeURIComponent(u.pathname).replace(/^\//, '')); });
    await ouvrir(page, { onglet: 'apprendre' });
    for (const p of ['presentation.html', 'confidentialite.html', 'testeurs.html']) await page.goto('/' + p);
    for (const f of ['favicon.ico', 'robots.txt', 'sitemap.xml', 'package.json', 'img/partage.jpg', 'img/icone-180.png', 'musique']) charges.add(f);
    expect(charges.size).toBeGreaterThan(40);
    expect([...charges].filter(exclu)).toEqual([]);
  });
});
