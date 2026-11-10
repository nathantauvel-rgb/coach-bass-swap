// Lot 65 « Arrivée et compte » : les questions de Vini (niveau, « Ton oreille », table, temps par jour), « Ton plan est prêt »,
// le compte obligatoire sans mot de passe, le lien magique pour l'ordinateur, et l'arrivée sur l'ordinateur par ce lien.
// Le faux Firebase (faux-firebase.js) sait créer un compte, envoyer un lien de connexion et l'ouvrir.
const { test, expect } = require('@playwright/test');
const { ouvrir, sansBandeau } = require('./outils');
const { FAUX, dansLaBase } = require('./faux-firebase');

const NOUVEAU = { 'coach-guide-vu': null, 'coach-fiches': null, 'coach-accueil': null };
const stocke = (page, k) => page.evaluate(c => JSON.parse(localStorage.getItem(c)), k);
const choix = (page, i) => page.locator('#ppOpts .pp-opt').nth(i).click();
const suite = page => page.locator('#ppGo').click();
const etape = page => page.evaluate(() => PP_ETAPES[pp.i]);
// Jusqu'au plan : niveau (numéro), l'oreille passée, table (numéro), minutes (numéro)
async function jusquauPlan(page, { niveau = 0, table = 1, minutes = 1 } = {}) {
  await suite(page);
  await choix(page, niveau); await suite(page);
  await page.locator('#ppOrPasse').click();
  await choix(page, table); await suite(page);
  await choix(page, minutes); await suite(page);
  await expect(page.locator('.pp-frise')).toBeVisible();
}
async function creerCompte(page, prenom = 'Sam', mail = 'sam@exemple.fr') {
  await suite(page);   // « Garder mon plan »
  await page.locator('#ppPrenom').fill(prenom); await page.locator('#ppMail').fill(mail);
  await suite(page);
}

test.describe('Les questions de Vini', () => {
  test('quatre questions, sans « Passer » : niveau, oreille, table, temps par jour, puis le plan', async ({ page }) => {
    const erreurs = await ouvrir(page, { onglet: '', stockage: NOUVEAU, avant: FAUX });
    await expect(page.locator('#pp')).toBeVisible();
    await expect(page.locator('#ppSkip')).toHaveCount(0);
    await suite(page);
    await expect.poll(() => etape(page)).toBe('niveau');
    await choix(page, 0); await suite(page);
    await expect.poll(() => etape(page)).toBe('oreille');
    await expect(page.locator('#ppAsk')).toHaveText(/Ton oreille/);
    await expect(page.locator('#ppGo')).toBeDisabled();   // il faut taper (ou passer la question)
    await page.locator('#ppOrPasse').click();
    await expect.poll(() => etape(page)).toBe('table');
    await choix(page, 1); await suite(page);
    await expect.poll(() => etape(page)).toBe('objectif');
    await choix(page, 1);
    await expect(page.locator('#ppGo')).toHaveText('Voir mon plan');
    await suite(page);
    await expect(page.locator('#ppAsk')).toHaveText('Ton plan est prêt !');
    await expect(page.locator('#ppGo')).toHaveText('Garder mon plan');
    expect(erreurs).toEqual([]); await sansBandeau(page);
  });

  test('« Ton oreille » : 4 temps pour se caler, puis 8 à taper ; le score va sur le plan', async ({ page }) => {
    await ouvrir(page, { onglet: '', stockage: NOUVEAU, avant: FAUX });
    await suite(page); await choix(page, 0); await suite(page);
    await page.locator('#ppRond').dispatchEvent('pointerdown');
    await expect(page.locator('#ppGo')).toBeDisabled();   // pendant le test
    // 7 temps pile, un à 150 ms (presque), et une frappe pendant le « 1, 2, 3, 4 » qui ne compte pas
    const n = await page.evaluate(() => { const o = ppOr;
      ppOrFrappe(o.t0 + o.per);
      [0, .02, -.03, .05, .15, -.01, .03, .04].forEach((d, i) => ppOrFrappe(o.t0 + (i + 4) * o.per + d));
      ppOrFin(); return pp.rep.oreille; });
    expect(n).toBe(7);
    await expect(page.locator('#ppOrRes')).toHaveText('7 sur 8 pile : tu as le rythme !');
    await expect(page.locator('#ppPoints i.pile')).toHaveCount(7);
    await expect(page.locator('#ppPoints i.presque')).toHaveCount(1);
    await expect(page.locator('#ppGo')).toBeEnabled();
    await suite(page); await choix(page, 1); await suite(page); await choix(page, 1); await suite(page);
    await expect(page.locator('.pp-score')).toHaveText('Ton oreille : 7 « boum » sur 8 pile. On part bien !');
    expect((await stocke(page, 'coach-accueil')).oreille).toBe(7);
  });

  test('le plan suit le niveau : Mode Expert pour un Apprenti DJ, le set pour un DJ confirmé', async ({ page }) => {
    await ouvrir(page, { onglet: '', stockage: NOUVEAU, avant: FAUX });
    await jusquauPlan(page, { niveau: 1 });
    await expect(page.locator('.pp-frise li b').first()).toHaveText('Le Mode Expert');
    await page.locator('#ppBack').click(); await page.locator('#ppBack').click(); await page.locator('#ppBack').click(); await page.locator('#ppBack').click();
    await choix(page, 2); await suite(page); await page.locator('#ppOrPasse').click(); await suite(page); await suite(page);
    await expect(page.locator('.pp-frise li b').first()).toHaveText('Le set');
    await expect(page.locator('.pp-resume span')).toHaveText(['DJ confirmé', 'Pas encore de table', '10 min par jour']);
  });
});

test.describe('Le compte, obligatoire', () => {
  test('pas de « Plus tard » ni de croix ; un rechargement rouvre les questions sur le plan', async ({ page }) => {
    const erreurs = await ouvrir(page, { onglet: '', stockage: NOUVEAU, avant: FAUX });
    await jusquauPlan(page);
    await suite(page);
    await expect(page.locator('#ppCompte')).toBeVisible();
    await expect(page.locator('#ppSans')).toBeHidden();
    expect(await stocke(page, 'coach-accueil')).toMatchObject({ niveau: 'debut', mur: true });
    expect(await page.evaluate(() => localStorage.getItem('coach-parcours'))).toBeNull();
    await page.reload();
    await expect(page.locator('#pp')).toBeVisible();
    await expect.poll(() => etape(page)).toBe('plan');
    await expect(page.locator('.pp-frise')).toBeVisible();
    expect(erreurs).toEqual([]);
  });

  test('sur un ordinateur : prénom + e-mail, sans mot de passe ; le compte existe, pas de lien envoyé', async ({ page }) => {
    const erreurs = await ouvrir(page, { onglet: '', stockage: NOUVEAU, avant: FAUX });
    await jusquauPlan(page);
    await creerCompte(page);
    await expect(page.locator('#pp')).toBeHidden();
    await expect(page.locator('#cptToastTitre')).toHaveText('Bienvenue Sam !');
    expect(await page.evaluate(() => [cpt && cpt.prenom, localStorage.getItem('coach-parcours'), window.__liensConnexion || null])).toEqual(['Sam', 'debut', null]);
    expect(await stocke(page, 'coach-accueil')).toMatchObject({ mur: false });
    await expect(page.locator('#ltitle')).toHaveText('Le bon moment');
    expect(erreurs).toEqual([]); await sansBandeau(page);
  });

  test('les champs sont vérifiés avant d\'appeler Firebase', async ({ page }) => {
    await ouvrir(page, { onglet: '', stockage: NOUVEAU, avant: FAUX });
    await jusquauPlan(page); await suite(page);
    await suite(page);
    await expect(page.locator('#ppMsg')).toHaveText(/Écris ton prénom/);
    await page.locator('#ppPrenom').fill('Sam'); await page.locator('#ppMail').fill('pas-une-adresse');
    await suite(page);
    await expect(page.locator('#ppMsg')).toHaveText(/adresse e-mail valide/);
    expect(await page.evaluate(() => cpt)).toBeNull();
  });

  test('une adresse qui a déjà un compte : un lien de connexion part, rien n\'est créé', async ({ page }) => {
    const avant = `try { sessionStorage.setItem('__faux_gens', JSON.stringify({ 'sam@exemple.fr': { uid: 'm1', mdp: 'x', nom: 'Sam' } })); } catch (e) {}` + FAUX;
    await ouvrir(page, { onglet: '', stockage: NOUVEAU, avant });
    await jusquauPlan(page);
    await creerCompte(page);
    await expect(page.locator('#ppMsg')).toHaveText(/déjà un compte avec cette adresse : je t’ai envoyé un lien/);
    expect(await page.evaluate(() => [cpt, window.__liensConnexion.map(l => l.mail)])).toEqual([null, ['sam@exemple.fr']]);
    await expect(page.locator('#pp')).toBeVisible();
  });

  test('Firebase ne répond pas : on peut continuer sans compte, pour ne jamais rester bloqué', async ({ page }) => {
    await ouvrir(page, { onglet: '', stockage: NOUVEAU, avant: FAUX + `window.__refus = 'auth/network-request-failed';` });
    await jusquauPlan(page);
    await creerCompte(page);
    await expect(page.locator('#ppMsg')).toHaveText(/Pas de connexion internet/);
    await expect(page.locator('#ppSans')).toBeVisible();
    await page.locator('#ppSans').click();
    await expect(page.locator('#pp')).toBeHidden();
    expect(await page.evaluate(() => localStorage.getItem('coach-parcours'))).toBe('debut');
  });

  test('« J\'ai déjà un compte » : la fenêtre du compte passe par-dessus, et peut envoyer un lien de connexion', async ({ page }) => {
    await ouvrir(page, { onglet: '', stockage: NOUVEAU, avant: FAUX });
    await jusquauPlan(page); await suite(page);
    await page.locator('#ppMail').fill('nina@exemple.fr');
    await page.locator('#ppDeja').click();
    await expect(page.locator('#compte')).toBeVisible();
    await expect(page.locator('#cptMail')).toHaveValue('nina@exemple.fr');
    const z = await page.evaluate(() => [getComputedStyle($('compte')).zIndex, getComputedStyle($('pp')).zIndex].map(Number));
    expect(z[0]).toBeGreaterThan(z[1]);
    await page.locator('#cptLienBtn').click();
    await expect(page.locator('#cptMsg')).toHaveText(/C’est envoyé/);
    expect(await page.evaluate(() => window.__liensConnexion.map(l => [l.mail, l.app]))).toEqual([['nina@exemple.fr', true]]);
  });

  test('Google, depuis l\'écran du compte : les questions se ferment une fois connecté', async ({ page }) => {
    await ouvrir(page, { onglet: '', stockage: NOUVEAU, avant: FAUX });
    await jusquauPlan(page); await suite(page);
    await page.locator('#ppGoogle').click();
    await expect(page.locator('#pp')).toBeHidden();
    expect(await page.evaluate(() => [cpt.prenom, localStorage.getItem('coach-parcours')])).toEqual(['Nathan', 'debut']);
  });

  test('un joueur déjà connecté ne voit pas l\'écran du compte', async ({ page }) => {
    const avant = `try { sessionStorage.setItem('__faux_user', JSON.stringify({ uid: 'u9', displayName: 'Lou', email: 'lou@exemple.fr', emailVerified: true })); } catch (e) {}` + FAUX;
    await ouvrir(page, { onglet: '', stockage: Object.assign({}, NOUVEAU, { 'coach-compte': JSON.stringify({ uid: 'u9', prenom: 'Lou', maj: 0, sale: false }) }), avant });
    await page.waitForFunction(() => typeof cpt !== 'undefined' && cpt);
    // déjà connecté sur ce navigateur : les questions, mais le plan mène directement au premier niveau
    await jusquauPlan(page);
    await expect(page.locator('#ppGo')).toHaveText('Commencer');
    await suite(page);
    await expect(page.locator('#pp')).toBeHidden();
    expect(await page.evaluate(() => localStorage.getItem('coach-parcours'))).toBe('debut');
  });
});

test.describe('Dans le navigateur de l\'appli TikTok', () => {
  test.use({ userAgent: 'Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Mobile Safari/537.36 trill_340100 BytedanceWebview/d8a21c6' });
  test('pas de bouton Google (Google y refuse la connexion), ni dans les questions ni dans la fenêtre du compte', async ({ page }) => {
    await ouvrir(page, { onglet: '', stockage: NOUVEAU, avant: FAUX });
    await jusquauPlan(page); await suite(page);
    await expect(page.locator('#ppGoogle')).toBeHidden();
    await expect(page.locator('#ppOu')).toBeHidden();
    await page.locator('#ppDeja').click();
    await expect(page.locator('#cptIn')).toBeHidden();
  });
});

test.describe('Sur un téléphone', () => {
  test.use({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  test('« Tu as une table DJ ? », un plan qui commence au doigt, puis le lien pour l\'ordinateur', async ({ page }) => {
    const erreurs = await ouvrir(page, { onglet: '', stockage: NOUVEAU, avant: FAUX });
    await suite(page); await choix(page, 0); await suite(page); await page.locator('#ppOrPasse').click();
    await expect(page.locator('#ppOpts .pp-opt .pp-txt > span:first-child')).toHaveText(['Oui, j’en ai une', 'Pas encore']);
    await expect(page.locator('#ppAide')).toHaveCount(0);   // rien à brancher ici
    await choix(page, 0);
    await expect(page.locator('#ppAsk')).toHaveText(/On la branchera sur ton ordinateur/);
    await suite(page); await choix(page, 1); await suite(page);
    await expect(page.locator('.pp-frise li b').first()).toHaveText('Comprendre la musique');
    await creerCompte(page);
    await expect(page.locator('.pp-envoye')).toBeVisible();
    await expect(page.locator('#ppLienTitre')).toHaveText('Ton lien pour l’ordinateur est parti à s•••@exemple.fr');
    const l = await page.evaluate(() => window.__liensConnexion);
    expect(l).toEqual([{ mail: 'sam@exemple.fr', url: expect.stringMatching(/\/index\.html$/), app: true }]);
    await expect(page.locator('#ppBack')).toBeHidden();
    await expect(page.locator('#ppGo')).toHaveText('Commencer la leçon 1');
    await suite(page);
    await expect(page.locator('#cp')).toBeVisible();   // la leçon 1 de Comprendre
    expect(erreurs).toEqual([]);
  });

  test('« Renvoyer » attend un peu entre deux envois', async ({ page }) => {
    await ouvrir(page, { onglet: '', stockage: NOUVEAU, avant: FAUX });
    await jusquauPlan(page); await creerCompte(page);
    await expect(page.locator('#ppLienTitre')).toHaveText(/est parti/);
    await expect(page.locator('#ppRenvoie')).toBeDisabled();
  });

  test('l\'accueil du téléphone : « Sur ton ordinateur », et le lien part par mail quand on a un compte', async ({ page }) => {
    await ouvrir(page, { onglet: '', stockage: NOUVEAU, avant: FAUX });
    await jusquauPlan(page); await creerCompte(page); await suite(page);
    await page.locator('#cpX').click();
    await page.goto('/index.html#accueil');
    await page.waitForFunction(() => typeof cpt !== 'undefined' && cpt);
    await page.evaluate(() => renderHome());
    await expect(page.locator('#homeLien')).toBeVisible();
    await expect(page.locator('#homeLienTxt')).toHaveText(/tu seras déjà connecté/);
    await page.locator('#homeLienBtn').click();
    await expect(page.locator('#homeLienBtn')).toHaveText('Envoyé à s•••@exemple.fr');
  });
});

test.describe('Sur l\'ordinateur, par le lien du mail', () => {
  const COMPTE_SAM = `try { if (!sessionStorage.getItem('__faux_gens')) sessionStorage.setItem('__faux_gens', JSON.stringify({ 'sam@exemple.fr': { uid: 'm1', mdp: 'x', nom: 'Sam' } })); } catch (e) {}`
    + dansLaBase('m1', { 'coach-parcours': 'debut', 'coach-comprendre': JSON.stringify({ 0: 3, 1: 2 }),
      'coach-accueil': JSON.stringify({ niveau: 'debut', table: 'table', modele: 'flx4', min: 10, oreille: 7, mur: false, fini: '2026-11-10' }) }, 5);
  test('l\'adresse est redemandée une fois, la progression du téléphone revient, puis « Bienvenue sur ordinateur »', async ({ page }) => {
    const erreurs = [];
    page.on('pageerror', e => erreurs.push(String(e)));
    await page.addInitScript(COMPTE_SAM); await page.addInitScript(FAUX);
    await page.goto('/index.html?apiKey=faux&oobCode=faux123&mode=signIn&lang=fr');
    await expect(page.locator('#compte')).toBeVisible();
    await expect(page.locator('#pp')).toBeHidden();   // les questions attendent
    await expect(page.locator('#cptTitle')).toHaveText('Connexion par lien');
    await page.locator('#cptMail').fill('sam@exemple.fr');
    await page.locator('#cptGo').click();
    await expect(page.locator('#ordi')).toBeVisible({ timeout: 15000 });
    await expect(page.locator('#ordiTitre')).toHaveText('Bienvenue sur ordinateur, Sam !');
    await expect(page.locator('#ordiEtapes li').first()).toHaveText(/Comprendre la musique.*2 leçons sur 7/);
    expect(await page.evaluate(() => location.search)).toBe('');   // le lien est retiré de l'adresse
    await page.locator('#ordiGo').click();
    await expect(page.locator('#ordi')).toBeHidden();
    await expect(page.locator('#vLearn')).toBeVisible();
    expect(erreurs).toEqual([]);
  });

  test('un lien ouvert sur le même appareil connecte sans redemander l\'adresse', async ({ page }) => {
    await page.addInitScript(COMPTE_SAM); await page.addInitScript(FAUX);
    await page.addInitScript(() => { try { localStorage.setItem('__djingood-lien', 'sam@exemple.fr'); } catch (e) {} });
    await page.goto('/index.html?apiKey=faux&oobCode=faux123&mode=signIn&lang=fr');
    await expect(page.locator('#ordi')).toBeVisible({ timeout: 15000 });
    await expect(page.locator('#compte')).toBeHidden();
  });

  test('un lien qui a déjà servi : le site propose d\'en recevoir un autre', async ({ page }) => {
    await page.addInitScript(COMPTE_SAM); await page.addInitScript(FAUX);
    await page.addInitScript(() => { try { localStorage.setItem('__djingood-lien', 'sam@exemple.fr'); } catch (e) {} });
    await page.goto('/index.html?apiKey=faux&oobCode=vieux&mode=signIn&lang=fr');
    await expect(page.locator('#cptMsg')).toHaveText(/déjà servi ou il est trop vieux/);
    await expect(page.locator('#cptLienBtn')).toBeVisible();
    expect(await page.evaluate(() => location.search)).toBe('');
    // fermer la fenêtre : un nouveau venu retrouve les questions de Vini
    await page.locator('#cptClose').click();
    await expect(page.locator('#pp')).toBeVisible();
  });
});

test.describe('Corrections du gardien (lot 65)', () => {
  // le compte créé sur le téléphone, sans aucune leçon finie : seulement les réponses et le parcours
  const SAM_SANS_LECON = `try { if (!sessionStorage.getItem('__faux_gens')) sessionStorage.setItem('__faux_gens', JSON.stringify({ 'sam@exemple.fr': { uid: 'm1', mdp: 'x', nom: 'Sam' } })); } catch (e) {}`
    + dansLaBase('m1', { 'coach-parcours': 'debut',
      'coach-accueil': JSON.stringify({ niveau: 'debut', table: 'souris', modele: '', min: 10, oreille: null, mur: false, fini: '2026-11-10' }) }, 5);
  test('le lien ouvert sur l\'ordinateur avant toute leçon : le plan du téléphone arrive, il n\'est pas effacé', async ({ page }) => {
    const erreurs = [];
    page.on('pageerror', e => erreurs.push(String(e)));
    await page.addInitScript(SAM_SANS_LECON); await page.addInitScript(FAUX);
    await page.goto('/index.html?apiKey=faux&oobCode=faux123&mode=signIn&lang=fr');
    await page.locator('#cptMail').fill('sam@exemple.fr'); await page.locator('#cptGo').click();
    await expect(page.locator('#ordi')).toBeVisible({ timeout: 15000 });
    expect(await page.evaluate(() => [localStorage.getItem('coach-parcours'), JSON.parse(localStorage.getItem('coach-accueil')).niveau])).toEqual(['debut', 'debut']);
    // et le compte n'a pas été remplacé par le vide de l'ordinateur
    const base = await page.evaluate(() => JSON.parse(sessionStorage.getItem('__faux_base')).m1.donnees);
    expect(base['coach-parcours']).toBe('debut');
    await page.locator('#ordiGo').click();
    await page.reload();
    await expect(page.locator('#pp')).toBeHidden();   // Vini ne repose pas les questions
    expect(erreurs).toEqual([]);
  });

  test('le code du lien quitte l\'adresse dès le chargement, avant les statistiques', async ({ page }) => {
    await page.addInitScript(SAM_SANS_LECON); await page.addInitScript(FAUX);
    await page.goto('/index.html?apiKey=faux&oobCode=faux123&mode=signIn&lang=fr');
    await expect(page.locator('#compte')).toBeVisible();
    expect(await page.evaluate(() => [location.search, location.href.includes('oobCode')])).toEqual(['', false]);
  });

  test('une page rechargée sur « lien envoyé » garde le parcours : pas de retour aux questions', async ({ browser }) => {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true }), page = await ctx.newPage();
    await ouvrir(page, { onglet: '', stockage: NOUVEAU, avant: FAUX });
    await jusquauPlan(page); await creerCompte(page);
    await expect(page.locator('.pp-envoye')).toBeVisible();
    expect(await page.evaluate(() => localStorage.getItem('coach-parcours'))).toBe('debut');
    await page.reload();
    await expect(page.locator('#pp')).toBeHidden();
    await ctx.close();
  });

  test('« Tout recommencer à zéro » efface aussi l\'adresse du dernier lien envoyé', async ({ page }) => {
    await ouvrir(page, { onglet: 'accueil', stockage: { 'coach-parcours': 'debut' }, avant: FAUX });
    await page.evaluate(() => { localStorage.setItem('__djingood-lien', 'sam@exemple.fr'); avisReset(); });
    // la page se recharge : on relit une fois qu'elle est revenue
    await expect.poll(() => page.evaluate(() => localStorage.getItem('__djingood-lien')).catch(() => 'rechargement')).toBeNull();
  });

  test('« Continuer sans compte pour l\'instant » : le compte est redemandé à la visite suivante', async ({ page }) => {
    await ouvrir(page, { onglet: '', stockage: NOUVEAU, avant: FAUX + `window.__refus = 'auth/network-request-failed';` });
    await jusquauPlan(page); await creerCompte(page);
    await page.locator('#ppSans').click();
    await expect(page.locator('#pp')).toBeHidden();
    expect(await stocke(page, 'coach-accueil')).toMatchObject({ mur: true });
    await page.reload();
    await expect(page.locator('#pp')).toBeVisible();
    await expect.poll(() => etape(page)).toBe('plan');
  });
});
