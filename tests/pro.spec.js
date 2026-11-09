// Lot 59 : DJingood Pro, l'abonnement qui ouvre les tutos Pro (js/pro.js, api/pro.js). Tant que PRO_PRET est faux, rien
// ne change pour les joueurs ; les tests posent window.DJINGOOD_PRO (et window.DJINGOOD_TUTOS pour voir l'onglet).
const crypto = require('crypto');
const { test, expect } = require('@playwright/test');
const { ouvrir } = require('./outils');
const { FAUX, dejaConnecte, ouvrirCompte } = require('./faux-firebase');

const S = o => JSON.stringify(o);
const TUTOS = 'window.DJINGOOD_TUTOS = true;', PRO = 'window.DJINGOOD_PRO = true;';
// La fausse fonction /api/pro : retient chaque appel et répond comme Stripe le dirait
async function fausseApi(page, { pro = false, panne = false, url = '/index.html?paye=1#tutos' } = {}){
  const etat = { pro, panne, appels: [] };
  await page.route('**/api/pro', async r => {
    const q = r.request(), d = JSON.parse(q.postData() || '{}');
    etat.appels.push(Object.assign({ jeton: q.headers().authorization }, d));
    if (etat.panne) return r.fulfill({ status: 503, contentType: 'application/json', body: S({ erreur: 'pas-configure' }) });
    const reponse = { pro: etat.pro, formule: etat.pro ? 'an' : null, jusqua: etat.pro ? 1826000000 : null, annule: false };
    if (d.action === 'payer') return r.fulfill({ status: 200, contentType: 'application/json', body: S({ url: 'http://localhost:' + (process.env.DJ_PORT || 8766) + url }) });
    if (d.action === 'gerer') return r.fulfill({ status: 200, contentType: 'application/json', body: S({ url: 'http://localhost:' + (process.env.DJ_PORT || 8766) + '/index.html?portail=1#tutos' }) });
    if (d.action === 'session'){ etat.pro = true; return r.fulfill({ status: 200, contentType: 'application/json', body: S(Object.assign(reponse, { pro: true, formule: 'an', jusqua: 1826000000 })) }); }
    return r.fulfill({ status: 200, contentType: 'application/json', body: S(reponse) });
  });
  return etat;
}

test.describe('Tant que Pro n’est pas allumé', () => {
  test('aucun cadenas, aucun bandeau, tous les tutos s’ouvrent, rien dans « Mon compte »', async ({ page }) => {
    const err = await ouvrir(page, { onglet: 'tutos', avant: dejaConnecte() + FAUX + TUTOS });
    await expect(page.locator('.tu-carte')).toHaveCount(11);
    await expect(page.locator('.tu-cadenas')).toHaveCount(0);
    await expect(page.locator('#proBandeau')).toBeHidden();
    expect(await page.evaluate(() => [PRO_PRET, proVerrou(), TUTOS.every(proLibre)])).toEqual([false, false, true]);
    await page.locator('[data-tu="swap"]').click();
    await expect(page.locator('#tuLecteur')).toBeVisible();
    await expect(page.locator('#pro')).toBeHidden();
    await page.locator('#tuRetour').click();
    await ouvrirCompte(page);
    await expect(page.locator('#cptPro')).toBeHidden();
    expect(err).toEqual([]);
  });
});

test.describe('Pro allumé, sans abonnement', () => {
  test('les tutos Pro ont un cadenas et ouvrent la fenêtre Pro ; les gratuits s’ouvrent', async ({ page }) => {
    const err = await ouvrir(page, { onglet: 'tutos', avant: TUTOS + PRO });
    await expect(page.locator('.tu-cadenas')).toHaveCount(8);
    await expect(page.locator('#proBandeau')).toBeVisible();
    await expect(page.locator('#proBandeauTxt')).toContainText('Les 8 autres');
    await page.locator('[data-tu="fondu"]').click();
    await expect(page.locator('#tuLecteur')).toBeVisible();
    await page.locator('#tuRetour').click();
    await page.locator('[data-tu="swap"]').click();
    await expect(page.locator('#pro')).toBeVisible();
    await expect(page.locator('#tuLecteur')).toBeHidden();
    await expect(page.locator('#proDedansTxt')).toContainText('11 tutos');
    expect(err).toEqual([]);
  });
  test('la fenêtre Pro : à l’année d’avance, la bascule change le prix, Échap et « Pas maintenant » ferment', async ({ page }) => {
    await ouvrir(page, { onglet: 'tutos', avant: TUTOS + PRO });
    await page.locator('#proBandeauBtn').click();
    await expect(page.locator('#proPrix')).toHaveText('49,99 €');
    await expect(page.locator('#proDetail')).toContainText('2 mois offerts');
    await page.locator('#pro .pro-bascule button[data-f="mois"]').click();
    await expect(page.locator('#proPrix')).toHaveText('4,99 €');
    await expect(page.locator('#proPar')).toHaveText('/ mois');
    await page.keyboard.press('Escape');
    await expect(page.locator('#pro')).toBeHidden();
    await page.locator('#proBandeauBtn').click();
    await expect(page.locator('#proPrix')).toHaveText('49,99 €');   // on repart toujours de l'année
    await page.locator('#proPlusTard').click();
    await expect(page.locator('#pro')).toBeHidden();
  });
  test('sans compte, « Passer à Pro » fait créer le compte, puis enchaîne sur le paiement', async ({ page }) => {
    const api = await fausseApi(page);
    await ouvrir(page, { onglet: 'tutos', avant: FAUX + TUTOS + PRO });
    await page.locator('[data-tu="swap"]').click();
    await page.locator('#pro .pro-bascule button[data-f="mois"]').click();
    await page.locator('#proGo').click();
    await expect(page.locator('#pro')).toBeHidden();
    await expect(page.locator('#compte')).toBeVisible();
    await expect(page.locator('#cptGo')).toHaveText('Créer mon compte');
    await page.locator('#cptPrenom').fill('Léa');
    await page.locator('#cptMail').fill('lea@exemple.fr');
    await page.locator('#cptMdp').fill('secret123');
    await page.locator('#cptGo').click();
    await page.waitForURL(/paye=1/, { timeout: 15000 });
    const payer = api.appels.find(a => a.action === 'payer');
    expect(payer.formule).toBe('mois');
    expect(payer.jeton).toMatch(/^Bearer /);
  });
  test('connecté : « Passer à Pro » ouvre la page de paiement ; si elle n’est pas prête, le site le dit', async ({ page }) => {
    const api = await fausseApi(page, { panne: true });
    await ouvrir(page, { onglet: 'tutos', avant: dejaConnecte() + FAUX + TUTOS + PRO });
    await page.locator('[data-tu="echo"]').waitFor();
    await page.locator('[data-tu="reverbe"]').click();
    await page.locator('#proGo').click();
    await expect(page.locator('#proMsg')).toContainText("pas encore ouvert");
    await expect(page.locator('#proGo')).toBeEnabled();
    api.panne = false;
    await page.locator('#proGo').click();
    await page.waitForURL(/paye=1/, { timeout: 15000 });
    expect(api.appels.filter(a => a.action === 'payer').map(a => a.formule)).toEqual(['an', 'an']);
  });
  test('« Mon compte » propose Pro', async ({ page }) => {
    await fausseApi(page);
    await ouvrir(page, { onglet: 'tutos', avant: dejaConnecte() + FAUX + TUTOS + PRO });
    await ouvrirCompte(page);
    await expect(page.locator('#cptPro')).toBeVisible();
    await expect(page.locator('#cptProBtn')).toHaveText('Découvrir Pro');
    await page.locator('#cptProBtn').click();
    await expect(page.locator('#compte')).toBeHidden();
    await expect(page.locator('#pro')).toBeVisible();
  });
});

test.describe('Pro allumé, abonné', () => {
  test('Stripe dit Pro : plus de cadenas ; « Mon compte » montre l’abonnement et ouvre « Gérer mon abonnement »', async ({ page }) => {
    const api = await fausseApi(page, { pro: true });
    const err = await ouvrir(page, { onglet: 'tutos', avant: dejaConnecte() + FAUX + TUTOS + PRO });
    await expect(page.locator('.tu-cadenas')).toHaveCount(0, { timeout: 15000 });
    await expect(page.locator('#proBandeau')).toBeHidden();
    expect(JSON.parse(await page.evaluate(() => localStorage.getItem('coach-pro')))).toMatchObject({ uid: 'u1', actif: true, formule: 'an' });
    await page.locator('[data-tu="swap"]').click();
    await expect(page.locator('#tuLecteur')).toBeVisible();
    await page.locator('#tuRetour').click();
    await ouvrirCompte(page);
    await expect(page.locator('#cptProTxt')).toContainText("À l'année · renouvelé le");
    await expect(page.locator('#cptProBtn')).toHaveText('Gérer mon abonnement');
    await page.locator('#cptProBtn').click();
    await page.waitForURL(/portail=1/, { timeout: 15000 });
    expect(api.appels.map(a => a.action)).toContain('gerer');
    expect(err).toEqual([]);
  });
  test('l’abonnement d’un autre compte ne sert pas ; un coach-pro abîmé ne bloque rien', async ({ page }) => {
    await fausseApi(page);
    await ouvrir(page, { onglet: 'tutos', avant: FAUX + TUTOS + PRO, stockage: { 'coach-pro': S({ uid: 'quelqu-un', actif: true, formule: 'an' }) } });
    await expect(page.locator('.tu-cadenas')).toHaveCount(8);
    for (const v of ['{casse', '[]', '"texte"', S({ uid: 5, actif: 'oui' })]){
      const err = await ouvrir(page, { onglet: 'tutos', avant: TUTOS + PRO, stockage: { 'coach-pro': v } });
      await expect(page.locator('.tu-cadenas')).toHaveCount(8);
      expect(err).toEqual([]);
    }
  });
  test('le retour de Stripe : la session confirme tout de suite, « Bienvenue dans Pro » propose le tuto voulu', async ({ page }) => {
    const api = await fausseApi(page);
    await ouvrir(page, { onglet: 'tutos', avant: dejaConnecte() + FAUX + TUTOS + PRO + `try { sessionStorage.setItem('djingood-pro-voulu', 'swap'); } catch (e) {}` });
    await page.goto('/index.html?pro=merci&session=cs_test_abc123#tutos');
    await expect(page.locator('#proMerci')).toBeVisible({ timeout: 15000 });
    await expect(page.locator('#proMerciGo')).toHaveText('Regarder « Le swap des basses »');
    expect(api.appels.find(a => a.action === 'session').id).toBe('cs_test_abc123');
    expect(await page.evaluate(() => location.search)).toBe('');   // l'adresse est nettoyée
    await page.locator('#proMerciGo').click();
    await expect(page.locator('#tuLecteur')).toBeVisible();
    await expect(page.locator('#tuTitre')).toHaveText('Le swap des basses');
  });
});

/* ---------- La fonction api/pro.js, sans réseau ----------
   Les clés de Google sont remplacées par une clé fabriquée ici, et Stripe par un faux `fetch`. */
test.describe('La fonction /api/pro', () => {
  const fn = require('../api/pro.js');
  const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', { modulusLength: 2048 });
  const PUB = publicKey.export({ type: 'spki', format: 'pem' });
  const b64 = o => Buffer.from(typeof o === 'string' ? o : S(o)).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  const maintenant = () => Math.floor(Date.now() / 1000);
  function jeton(c = {}){
    const h = b64({ alg: 'RS256', kid: 'k1', typ: 'JWT' });
    const p = b64(Object.assign({ aud: 'djingo-1e1f4', iss: 'https://securetoken.google.com/djingo-1e1f4', sub: 'u1', email: 'Lea@Exemple.fr', email_verified: true, iat: maintenant() - 10, exp: maintenant() + 3000 }, c));
    return h + '.' + p + '.' + crypto.createSign('RSA-SHA256').update(h + '.' + p).sign(privateKey).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }
  const ABO = (o = {}) => Object.assign({ id: 'sub_1', status: 'active', customer: 'cus_1', created: 100, cancel_at_period_end: false, metadata: { uid: 'u1' },
    items: { data: [{ current_period_end: 1826000000, price: { id: 'price_an' } }] } }, o);
  const vraiFetch = global.fetch;
  let stripe;   // les appels à Stripe, et ses réponses selon le chemin
  test.beforeEach(() => {
    Object.assign(process.env, { STRIPE_CLE: 'sk_test_secret', STRIPE_PRIX_MOIS: 'price_mois', STRIPE_PRIX_AN: 'price_an' });
    fn.cles = async () => ({ k1: PUB });
    // abonnements : ce que la RECHERCHE voit (avec une minute de retard chez le vrai Stripe) ;
    // clients : { adresse: [{ id, abos: [...] }] }, ce que les LISTES voient tout de suite
    stripe = { appels: [], abonnements: [], clients: {}, session: null, statut: 200 };
    global.fetch = async (url, o = {}) => {
      stripe.appels.push({ url, methode: o.method, cle: o.headers && o.headers.Authorization, corps: o.body || '' });
      const ok = stripe.statut === 200, rep = d => ({ ok, status: stripe.statut, json: async () => d });
      const q = new URL(url).searchParams;
      if (url.includes('/customers?')) return rep({ data: (stripe.clients[q.get('email')] || []).map(c => ({ id: c.id })) });
      if (url.includes('/subscriptions?')){
        const c = Object.values(stripe.clients).flat().find(x => x.id === q.get('customer'));
        return rep({ data: c ? c.abos : [] });
      }
      if (url.includes('/subscriptions/search')) return rep({ data: stripe.abonnements });
      if (url.includes('/checkout/sessions/')) return rep(stripe.session);
      if (url.endsWith('/checkout/sessions')) return rep({ url: 'https://checkout.stripe.com/c/pay/cs_test_1' });
      if (url.endsWith('/billing_portal/sessions')) return rep({ url: 'https://billing.stripe.com/p/session/1' });
      return rep({});
    };
  });
  test.afterEach(() => { global.fetch = vraiFetch; for (const k of ['STRIPE_CLE', 'STRIPE_PRIX_MOIS', 'STRIPE_PRIX_AN']) delete process.env[k]; });
  async function appel(corps, { methode = 'POST', j = jeton() } = {}){
    const res = { statusCode: 0, entetes: {}, corps: null, setHeader(k, v){ this.entetes[k] = v; }, end(t){ this.corps = JSON.parse(t); } };
    await fn({ method: methode, headers: j ? { authorization: 'Bearer ' + j } : {}, body: corps }, res);
    return res;
  }

  test('refuse ce qui n’est pas un POST, attend ses réglages, refuse un faux jeton', async () => {
    expect((await appel({ action: 'etat' }, { methode: 'GET' })).statusCode).toBe(405);
    delete process.env.STRIPE_PRIX_AN;
    expect((await appel({ action: 'etat' })).statusCode).toBe(503);
    process.env.STRIPE_PRIX_AN = 'price_an';
    for (const j of ['', 'nimporte.quoi.ici', jeton({ exp: maintenant() - 5 }), jeton({ aud: 'autre' })]) expect((await appel({ action: 'etat' }, { j })).statusCode).toBe(401);
    expect(stripe.appels).toEqual([]);
  });
  test('etat : cherche les abonnements de ce compte (l’identifiant vient du jeton), avec la clé secrète', async () => {
    let r = await appel({ action: 'etat', uid: 'quelqu-un-d-autre' });
    expect(r.corps).toEqual({ pro: false, formule: null, jusqua: null, annule: false });
    expect(decodeURIComponent(stripe.appels[0].url)).toContain('/customers?limit=10&email=lea@exemple.fr');
    expect(decodeURIComponent(stripe.appels[1].url)).toContain("metadata['uid']:'u1'");
    expect(stripe.appels[0].cle).toBe('Bearer sk_test_secret');
    stripe.abonnements = [ABO({ status: 'canceled', created: 300 }), ABO(), ABO({ metadata: { uid: 'u2' } })];
    r = await appel({ action: 'etat' });
    expect(r.corps).toEqual({ pro: true, formule: 'an', jusqua: 1826000000, annule: false });
    stripe.abonnements = [ABO({ cancel_at_period_end: true, items: { data: [{ current_period_end: 1800000000, price: { id: 'price_mois' } }] } })];
    expect((await appel({ action: 'etat' })).corps).toEqual({ pro: true, formule: 'mois', jusqua: 1800000000, annule: true });
  });
  test('payer : une page de paiement avec le bon prix, le compte, la case des conditions ; jamais deux abonnements', async () => {
    let r = await appel({ action: 'payer', formule: 'an' });
    expect(r.statusCode).toBe(200); expect(r.corps).toEqual({ url: 'https://checkout.stripe.com/c/pay/cs_test_1' });
    const corps = decodeURIComponent(stripe.appels.find(a => a.url.endsWith('/checkout/sessions')).corps);
    for (const morceau of ['mode=subscription', 'line_items[0][price]=price_an', 'client_reference_id=u1', 'customer_email=lea@exemple.fr',
      'subscription_data[metadata][uid]=u1', 'consent_collection[terms_of_service]=required', 'success_url=https://djingood.fr/?pro=merci&session={CHECKOUT_SESSION_ID}#tutos'])
      expect(corps).toContain(morceau);
    expect(corps).toContain('je renonce à mon délai de rétractation');
    expect((await appel({ action: 'payer', formule: 'semaine' })).statusCode).toBe(400);
    stripe.abonnements = [ABO()];
    r = await appel({ action: 'payer', formule: 'mois' });
    expect(r.statusCode).toBe(409); expect(r.corps).toEqual({ erreur: 'deja-pro' });
  });
  test('session : seulement la sienne ; gerer : seulement pour un abonné ; Stripe en panne : 502', async () => {
    expect((await appel({ action: 'session', id: '../../v1/customers' })).statusCode).toBe(400);
    stripe.session = { client_reference_id: 'u2', subscription: ABO() };
    expect((await appel({ action: 'session', id: 'cs_test_123456' })).statusCode).toBe(403);
    stripe.session = { client_reference_id: 'u1', subscription: ABO() };
    expect((await appel({ action: 'session', id: 'cs_test_123456' })).corps).toMatchObject({ pro: true, formule: 'an' });
    expect((await appel({ action: 'gerer' })).statusCode).toBe(404);
    stripe.abonnements = [ABO()];
    const r = await appel({ action: 'gerer' });
    expect(r.corps).toEqual({ url: 'https://billing.stripe.com/p/session/1' });
    expect(decodeURIComponent(stripe.appels[stripe.appels.length - 1].corps)).toContain('customer=cus_1');
    stripe.statut = 500;
    expect((await appel({ action: 'etat' })).statusCode).toBe(502);
  });
  // Vu avec le vrai Stripe (mode test) le 9 nov. 2026 : 2 s après le paiement, la recherche ne voyait pas encore
  // l'abonnement, donc « Gérer mon abonnement » répondait 404 et un rechargement aurait remis les cadenas.
  test('juste après le paiement (la recherche de Stripe ne voit rien encore) : Pro, « Gérer » marche, pas de second abonnement', async () => {
    stripe.abonnements = [];
    stripe.clients = { 'lea@exemple.fr': [{ id: 'cus_9', abos: [ABO({ customer: 'cus_9' })] }] };
    expect((await appel({ action: 'etat' })).corps).toEqual({ pro: true, formule: 'an', jusqua: 1826000000, annule: false });
    expect(stripe.appels.some(a => a.url.includes('/subscriptions/search'))).toBe(false);
    const g = await appel({ action: 'gerer' });
    expect(g.statusCode).toBe(200);
    expect(decodeURIComponent(stripe.appels[stripe.appels.length - 1].corps)).toContain('customer=cus_9');
    expect((await appel({ action: 'payer', formule: 'mois' })).statusCode).toBe(409);
  });
  test('la même adresse ne suffit pas : l’abonnement d’un autre compte ne rend pas Pro', async () => {
    stripe.clients = { 'lea@exemple.fr': [{ id: 'cus_8', abos: [ABO({ customer: 'cus_8', metadata: { uid: 'u2' } })] }] };
    expect((await appel({ action: 'etat' })).corps).toMatchObject({ pro: false });
    expect(stripe.appels.some(a => a.url.includes('/subscriptions/search'))).toBe(true);
    expect((await appel({ action: 'gerer' })).statusCode).toBe(404);
  });
});
