// Lot 76 « Le niveau d'abord » (19 nov. 2026) : la barre du chapitre et ses pastilles, le menu « Tous les niveaux »,
// la carte de fin d'un niveau de Pro et l'offre des 7 jours gratuits (carte demandée), Comprendre rangé dans le menu sur
// ordinateur, les titres de la vraie musique dans « Comment faire ? ».
const { test, expect } = require('@playwright/test');
const { ouvrir } = require('./outils');
const { FAUX, dejaConnecte } = require('./faux-firebase');

const S = o => JSON.stringify(o);
const PRO = 'window.DJINGOOD_PRO = true;';
const etoiles = (o, n = 'coach-lecons') => ({ [n]: S(o) });
const DEUX = etoiles({ 0: 3, 1: 2 }), TROIS = etoiles({ 0: 3, 1: 2, 2: 2 });
// La fausse fonction /api/pro : retient chaque appel ; etat = ce que Stripe répond pour ce compte
async function fausseApi(page, { etat = {}, erreurPayer = '' } = {}){
  const s = { appels: [] };
  await page.route('**/api/pro', async r => {
    const d = JSON.parse(r.request().postData() || '{}'); s.appels.push(d);
    if (d.action === 'payer' && erreurPayer) return r.fulfill({ status: 409, contentType: 'application/json', body: S({ erreur: erreurPayer }) });
    if (d.action === 'payer') return r.fulfill({ status: 200, contentType: 'application/json', body: S({ url: 'http://localhost:' + (process.env.DJ_PORT || 8766) + '/index.html?paye=1#apprendre' }) });
    return r.fulfill({ status: 200, contentType: 'application/json', body: S(Object.assign({ pro: false, formule: null, jusqua: null, annule: false, offert: false, essaiDispo: true }, etat)) });
  });
  return s;
}

test.describe('La barre du chapitre', () => {
  test('en 1366 × 768 : la barre, le niveau, « Jouer » et la piste tiennent dans le premier écran ; le reste est rangé', async ({ page }) => {
    const err = await ouvrir(page, { verrou: true, stockage: DEUX });
    await expect(page.locator('#chapBtn')).toBeVisible();
    await expect(page.locator('#chapBtn')).toHaveText('Chapitre 1 · Les bases');
    await expect(page.locator('#map .node')).toHaveCount(7);
    for (const s of ['#cpBloc', '#nivMenu', '#chapters']) await expect(page.locator(s)).toBeHidden();
    const r = await page.evaluate(() => ({ jouer: $('startBtn').getBoundingClientRect().bottom, piste: $('hw').getBoundingClientRect().top, h: innerHeight, x: document.documentElement.scrollWidth - innerWidth }));
    expect(r.jouer).toBeLessThanOrEqual(r.h);
    expect(r.piste).toBeLessThan(r.h);
    expect(r.x).toBe(0);
    // une pastille par niveau : son numéro (ou un cadenas), son nom au survol, son état pour les lecteurs d'écran
    const n = page.locator('#map .node');
    await expect(n.nth(0).locator('.dot')).toHaveText('1');
    await expect(n.nth(0)).toHaveAttribute('data-t', '1. Le bon moment · réussi');
    await expect(n.nth(2)).toHaveAttribute('data-t', '3. La coupure sèche');
    await expect(n.nth(3)).toHaveAttribute('data-t', '4. L\'écho out · pas encore ouvert');
    await expect(n.nth(2)).toHaveAttribute('aria-pressed', 'true');
    await expect(n.nth(3).locator('.cadenas')).toHaveCount(1);
    await expect(n.nth(1)).toHaveAttribute('aria-label', 'Niveau 2 : Le fader, 2 étoile(s) sur 3');
    expect(err).toEqual([]);
  });

  test('choisir un niveau ne fait plus défiler la page (« Jouer » est déjà à l’écran) ; une partie, si', async ({ page }) => {
    await ouvrir(page, { stockage: DEUX });
    await page.locator('#map .node').nth(1).click();
    await page.waitForTimeout(600);
    expect(await page.evaluate(() => scrollY)).toBe(0);
    await expect(page.locator('#nivHaut')).toBeInViewport();
    await expect(page.locator('#ltitle')).toHaveText('Le fader');
  });

  test('« Chapitre 1 · Les bases » ouvre aussi le menu', async ({ page }) => {
    await ouvrir(page);
    await page.locator('#chapBtn').click();
    await expect(page.locator('#nivMenu')).toBeVisible();
    await expect(page.locator('#chapBtn')).toHaveAttribute('aria-expanded', 'true');
    await expect(page.locator('#nivTous')).toHaveAttribute('aria-expanded', 'true');
  });
});

test.describe('Le menu « Tous les niveaux »', () => {
  test('s’ouvre sous la barre, sur le chapitre en cours ; Échap, la croix ou un clic ailleurs le ferment', async ({ page }) => {
    const err = await ouvrir(page, { stockage: DEUX });
    await page.locator('#nivTous').click();
    await expect(page.locator('#nivMenu')).toBeVisible();
    await expect(page.locator('#nivMenuD h3')).toHaveText('Chapitre 1 · Les bases');
    await expect(page.locator('.nivgrille .nivcarte')).toHaveCount(7);
    await expect(page.locator('.nivgrille .nivcarte').nth(0)).toHaveClass(/reussi/);
    await expect(page.locator('#nivCp')).toBeVisible();
    await expect(page.locator('#chapters .chap')).toHaveCount(7);
    await page.keyboard.press('Escape');
    await expect(page.locator('#nivMenu')).toBeHidden();
    await expect(page.locator('#nivTous')).toBeFocused();
    await page.locator('#nivTous').click();
    await page.locator('#nivMenuX').click();
    await expect(page.locator('#nivMenu')).toBeHidden();
    await page.locator('#nivTous').click();
    await page.mouse.click(40, 400);   // dans la marge de gauche : hors de la barre et du menu
    await expect(page.locator('#nivMenu')).toBeHidden();
    expect(err).toEqual([]);
  });

  test('un chapitre ouvert devient le chapitre en cours, le menu montre ses niveaux ; un niveau choisi ferme le menu', async ({ page }) => {
    await ouvrir(page, { stockage: etoiles({ 0: 3, 1: 3, 2: 3, 3: 3, 4: 2 }) });   // 14 ★ : le chapitre 2 s'ouvre
    await page.locator('#nivTous').click();
    await page.locator('#chapters .chap', { hasText: 'La maîtrise' }).click();
    await expect(page.locator('#chapBtn')).toHaveText('Chapitre 2 · La maîtrise');
    await expect(page.locator('#nivMenu')).toBeVisible();
    await expect(page.locator('#nivMenuD h3')).toHaveText('Chapitre 2 · La maîtrise');
    await page.locator('.nivgrille .nivcarte').nth(1).click();
    await expect(page.locator('#nivMenu')).toBeHidden();
    expect(await page.evaluate(() => [chapter, li])).toEqual([2, 1]);
  });

  test('un niveau pas encore ouvert : le menu se ferme, Vini dit lequel réussir d’abord', async ({ page }) => {
    await ouvrir(page, { verrou: true, stockage: etoiles({ 0: 2 }) });
    await page.locator('#nivTous').click();
    await page.locator('.nivgrille .nivcarte').nth(3).click();
    await expect(page.locator('#nivMenu')).toBeHidden();
    await expect(page.locator('#tip')).toContainText('Réussis d’abord « Le fader »');
    expect(await page.evaluate(() => li)).toBe(1);
  });

  test('Comprendre : ses 7 leçons dans le menu, la première s’ouvre', async ({ page }) => {
    const err = await ouvrir(page);
    await page.locator('#nivTous').click();
    await page.locator('#nivCp').click();
    await expect(page.locator('#nivCp')).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('#nivMenuD h3')).toHaveText('Comprendre · sans table');
    await expect(page.locator('.nivgrille .nivcarte')).toHaveCount(7);
    await expect(page.locator('#nivCpN')).toHaveText('0/21 ★');
    await page.locator('.nivgrille .nivcarte').nth(0).click();
    await expect(page.locator('#nivMenu')).toBeHidden();
    await expect(page.locator('#cp')).toBeVisible();
    expect(err).toEqual([]);
  });

  test('avec Pro : « Pro » écrit une seule fois ; un chapitre de Pro montre ses niveaux, la ligne Pro ouvre la fenêtre', async ({ page }) => {
    const err = await ouvrir(page, { avant: PRO, stockage: DEUX });
    await page.locator('#nivTous').click();
    await expect(page.locator('#chapters .nivmenu-gt')).toContainText('Avec DJingood Pro');
    await expect(page.locator('#chapters .chap.pro')).toHaveCount(6);
    await expect(page.locator('#chapters .pro-tag')).toHaveCount(0);
    await expect(page.locator('.nivmenu-pro')).toContainText('Les niveaux 4 à 7 sont dans DJingood Pro.');
    await page.locator('#chapters .chap.pro', { hasText: 'Le calage' }).click();
    await expect(page.locator('#nivMenuD h3')).toHaveText('Chapitre 5 · Le calage');
    await expect(page.locator('.nivgrille .nivcarte.ferme')).toHaveCount(7);
    await expect(page.locator('.nivmenu-pro')).toContainText('Ce chapitre est dans DJingood Pro');
    expect(await page.evaluate(() => chapter)).toBe(1);
    await page.locator('.nivmenu-pro .pro-mini').click();
    await expect(page.locator('#nivMenu')).toBeHidden();
    await expect(page.locator('#pro')).toBeVisible();
    await expect(page.locator('#proContexteTxt')).toHaveText('Pour ouvrir le chapitre 5 : « Le calage » (après 14 ★ au chapitre 1)');
    expect(err).toEqual([]);
  });
});

test.describe('La carte de fin et les 7 jours gratuits', () => {
  test('après les 3 niveaux gratuits : une carte à la place du niveau de Pro (ni piste ni table), l’offre et « Rejouer »', async ({ page }) => {
    const err = await ouvrir(page, { avant: PRO, stockage: TROIS });
    await page.evaluate(() => selectLesson(3));
    await expect(page.locator('#nivFin')).toBeVisible();
    await expect(page.locator('#nivFinTitre')).toHaveText('Ta première transition est faite. Bravo !');
    await expect(page.locator('#nivFinSur')).toHaveText('Chapitre 1 · Les bases · 7 ★ sur 9');
    await expect(page.locator('#nivFinSuite span')).toHaveCount(4);
    await expect(page.locator('#nivFinSuite span').first()).toHaveText("L'écho out");
    for (const s of ['#startBtn', '#hw', '.deck', '#ltitle']) await expect(page.locator(s)).toBeHidden();
    await expect(page.locator('#map .node[aria-pressed="true"]')).toHaveCount(0);
    const o = page.locator('#nivFinOffre');
    await expect(o.locator('.offre-t')).toHaveText('Essaie Pro 7 jours, gratuitement');
    await expect(o.locator('.offre-frise li')).toHaveCount(3);
    await expect(o.locator('.offre-frise li').nth(1)).toContainText('Jour 5');
    // lot 81 : l'année d'office (4,17 € par mois, 49,99 € par an), en premier ; le mois à côté ; la carte bancaire est dite
    await expect(o.locator('.offre-f')).toHaveCount(2);
    await expect(o.locator('.offre-f').first()).toHaveAttribute('data-f', 'an');
    await expect(o.locator('.offre-f[aria-pressed="true"]')).toContainText('À l’année');
    await expect(o.locator('.offre-f[data-f="an"]')).toContainText('4,17 €/mois');
    await expect(o.locator('.offre-f[data-f="an"]')).toContainText('49,99 € par an');
    await expect(o.locator('.offre-frise li').nth(0)).toContainText('Ta carte est demandée, mais rien n’est prélevé');
    await expect(o.locator('.offre-frise li').nth(2)).toContainText('49,99 € pour l’année, sauf si tu arrêtes avant (dans « Mon compte »)');
    await expect(o.locator('.offre-go')).toHaveText('Commencer mes 7 jours gratuits');
    await expect(o.locator('.offre-p')).toContainText('Sans engagement');
    // la formule au mois
    await o.locator('.offre-f[data-f="mois"]').click();
    await expect(o.locator('.offre-f[data-f="mois"]')).toHaveAttribute('aria-pressed', 'true');
    await expect(o.locator('.offre-frise li').nth(2)).toContainText('4,99 € par mois, sauf si tu arrêtes avant');
    await o.locator('.offre-f[data-f="an"]').click();
    // « Rejouer » : le niveau gratuit le moins bien noté
    await expect(page.locator('#nivFinRejouer')).toHaveText('Rejouer « La coupure sèche »');
    await page.locator('#nivFinRejouer').click();
    await expect(page.locator('#nivFin')).toBeHidden();
    await expect(page.locator('#startBtn')).toHaveText('Jouer');
    expect(await page.evaluate(() => li)).toBe(2);
    expect(err).toEqual([]);
  });

  test('un lien vers un niveau de Pro, sans avoir fini les gratuits : la carte le dit, et propose le niveau gratuit à jouer', async ({ page }) => {
    await ouvrir(page, { avant: PRO, stockage: etoiles({ 0: 2 }) });
    await page.evaluate(() => selectLesson(5));
    await expect(page.locator('#nivFinTitre')).toHaveText('« Le swap des basses » est dans DJingood Pro');
    await expect(page.locator('#nivFinRejouer')).toHaveText('Jouer « Le fader » (gratuit)');
  });

  test('sans compte, « Commencer mes 7 jours gratuits » fait créer le compte, puis ouvre le paiement avec l’essai', async ({ page }) => {
    const api = await fausseApi(page);
    await ouvrir(page, { avant: FAUX + PRO, stockage: TROIS });
    await page.evaluate(() => selectLesson(3));
    await page.locator('#nivFinOffre .offre-go').click();
    await expect(page.locator('#pro')).toBeHidden();   // pas de détour par la grande fenêtre Pro
    await expect(page.locator('#compte')).toBeVisible();
    await expect(page.locator('#compte')).toContainText('essai gratuit');
    await page.locator('#cptPrenom').fill('Léa');
    await page.locator('#cptMail').fill('lea@exemple.fr');
    await page.locator('#cptMdp').fill('secret123');
    await page.locator('#cptGo').click();
    await page.waitForURL(/paye=1/, { timeout: 15000 });
    const payer = api.appels.find(a => a.action === 'payer');
    expect([payer.formule, payer.essai]).toEqual(['an', 'semaine']);   // lot 81 : l'année d'office
  });

  test('connecté, l’essai déjà servi : le site le dit et propose de s’abonner tout de suite', async ({ page }) => {
    const api = await fausseApi(page, { erreurPayer: 'essai-deja' });
    await ouvrir(page, { avant: dejaConnecte() + FAUX + PRO, stockage: TROIS });
    await page.evaluate(() => selectLesson(3));
    await page.locator('#nivFinOffre .offre-go').click();
    await expect(page.locator('#nivFinOffre .offre-msg')).toHaveText('Ton essai gratuit a déjà servi : tu peux t’abonner tout de suite.');
    await expect(page.locator('#nivFinOffre .offre-go')).toHaveText('Continuer avec Pro');
    await expect(page.locator('#nivFinOffre .offre-go')).toBeEnabled();
    expect(api.appels.filter(a => a.action === 'payer').map(a => a.essai)).toEqual(['semaine']);
  });

  test('Stripe dit que ce compte a déjà été abonné : le prix, sans essai', async ({ page }) => {
    await fausseApi(page, { etat: { essaiDispo: false } });
    await ouvrir(page, { avant: dejaConnecte() + FAUX + PRO, stockage: TROIS });
    await page.evaluate(() => selectLesson(3));
    await expect(page.locator('#nivFinOffre .offre-t')).toHaveText('Continue avec DJingood Pro');
    await expect(page.locator('#nivFinOffre .offre-f')).toHaveText([/À l’année4,17 €\/mois49,99 € par an/, /Au mois4,99 €\/mois/]);
    await expect(page.locator('#nivFinOffre .offre-frise')).toHaveCount(0);
    await expect(page.locator('#nivFinOffre .offre-go')).toHaveText('Continuer avec Pro');
  });

  test('la carte de résultat du niveau 3 : le même bouton mène tout droit au paiement ; la fenêtre Pro reste à un lien', async ({ page }) => {
    await ouvrir(page, { avant: FAUX + PRO, stockage: TROIS });
    await page.evaluate(() => { selectLesson(2); $('result').hidden = false; resultatCarte(3, [['ok', 'Pile.', 1]]); $('next').hidden = false; resultatBoutons(3); finEssai(1, 3, 0); });
    await expect(page.locator('#rProGo')).toHaveText('Commencer mes 7 jours gratuits');
    // lot 81 : l'année d'office
    await expect(page.locator('#rProEssai')).toContainText('7 jours gratuits, puis 49,99 € pour l’année (soit 4,17 € par mois). Ta carte est demandée');
    await expect(page.locator('#rProBascule')).toHaveText('Plutôt au mois (4,99 €) ?');
    await page.locator('#rProBascule').click();
    await expect(page.locator('#rProEssai')).toContainText('puis 4,99 € par mois');
    await expect(page.locator('#rProBascule')).toHaveText('Plutôt à l’année (49,99 €, 2 mois offerts) ?');
    await page.locator('#rProBascule').click();
    await page.locator('#rProVoir').click();
    await expect(page.locator('#pro')).toBeVisible();
    await expect(page.locator('#proSemaine')).toBeVisible();
    await expect(page.locator('#proGo')).toContainText('Commencer mes 7 jours gratuits');
    await page.keyboard.press('Escape');
    await page.evaluate(() => { $('result').hidden = false; finEssai(1, 3, 0); });
    await page.locator('#rProGo').click();
    await expect(page.locator('#result')).toBeHidden();
    await expect(page.locator('#pro')).toBeHidden();
    await expect(page.locator('#compte')).toBeVisible();
  });
  // gardien : la carte de résultat est refermée ; si le paiement ne s'ouvre pas, il faut le dire quelque part
  test('le paiement ne s’ouvre pas depuis la carte de résultat : la fenêtre Pro s’ouvre et le dit', async ({ page }) => {
    await page.route('**/api/pro', r => { const d = JSON.parse(r.request().postData() || '{}');
      return r.fulfill({ status: d.action === 'payer' ? 503 : 200, contentType: 'application/json', body: S(d.action === 'payer' ? { erreur: 'pas-configure' } : { pro: false, essaiDispo: true }) }); });
    await ouvrir(page, { avant: dejaConnecte() + FAUX + PRO, stockage: TROIS });
    await page.evaluate(() => { selectLesson(2); $('result').hidden = false; resultatCarte(3, [['ok', 'Pile.', 1]]); $('next').hidden = false; resultatBoutons(3); finEssai(1, 3, 0); });
    await page.locator('#rProGo').click();
    await expect(page.locator('#pro')).toBeVisible();
    await expect(page.locator('#proMsg')).toContainText('pas encore ouvert');
  });
});

test.describe('Le reste de la page', () => {
  test('la vraie musique : ses titres sont dans « Comment faire ? », plus sous le titre du niveau', async ({ page }) => {
    await ouvrir(page, { stockage: { 'coach-style': 'vrai' } });
    await expect(page.locator('#styleTag')).toBeHidden();
    await expect(page.locator('#lcredit')).toContainText('Morceaux : ');
    await page.locator('.howto summary').click();
    await expect(page.locator('#lcredit')).toBeVisible();
    // la house du site : la ligne reste
    await page.evaluate(() => { styleChoice = 'house'; selectLesson(0); });
    await expect(page.locator('#styleTag')).toBeVisible();
    await expect(page.locator('#lcredit')).toBeHidden();
  });

  // gardien : le clic de Mes progrès remontait jusqu'à « un clic ailleurs ferme le menu »
  test('Mes progrès → « Comprendre » ouvre le menu sur Comprendre (ordinateur)', async ({ page }) => {
    const err = await ouvrir(page, { onglet: 'progres' });
    await page.locator('#pgChaps button', { hasText: 'Comprendre' }).click();
    await expect(page.locator('#vLearn')).toBeVisible();
    await expect(page.locator('#nivMenu')).toBeVisible();
    await expect(page.locator('#nivMenuD h3')).toHaveText('Comprendre · sans table');
    await page.waitForTimeout(300);
    await expect(page.locator('#nivMenu')).toBeVisible();
    expect(err).toEqual([]);
  });

  // gardien : entre 861 et 1100 px, au chapitre 6, la 7e pastille passait sous « Tous les niveaux »
  for (const w of [861, 900, 1000, 1100]) test(`fenêtre de ${w} px, chapitre 6 : les pastilles ne passent pas sous « Tous les niveaux »`, async ({ page }) => {
    await page.setViewportSize({ width: w, height: 768 });
    await ouvrir(page, { stockage: Object.assign(etoiles({ 0: 3, 1: 3, 2: 3, 3: 3, 4: 2 }), { 'coach-chapitre': '6' }) });
    await expect(page.locator('#chapBtn')).toContainText('Chapitre 6');
    const [derniere, bouton] = await page.evaluate(() => [[...document.querySelectorAll('#map .node')].pop().getBoundingClientRect().right, $('nivTous').getBoundingClientRect().left]);
    expect(derniere).toBeLessThanOrEqual(bouton);
  });

  test('Mode Expert est sous « Jouer », à côté du choix des morceaux', async ({ page }) => {
    await ouvrir(page, { stockage: etoiles({ 0: 3 }) });
    await expect(page.locator('.actionbar .opts #expertBtn')).toBeVisible();
  });
});

test.describe('Sur un téléphone', () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
  test('Comprendre reste au-dessus de la barre ; rien ne déborde', async ({ page }) => {
    const err = await ouvrir(page, { stockage: DEUX });
    await expect(page.locator('#vLearn')).toHaveClass(/cp-tel/);
    await expect(page.locator('#cpBloc')).toBeVisible();
    await expect(page.locator('#map .node')).toHaveCount(7);
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(0);
    await page.locator('#nivTous').click();
    await expect(page.locator('#nivMenu')).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(0);
    expect(err).toEqual([]);
  });
});
