// Lot 54 « Vini t'écrit » : l'accord pour les mails (case, question, interrupteur), l'adresse confirmée avant d'écrire,
// la carte de fin qui propose le compte, et la fonction api/mails.js qui parle à Brevo. Le faux Firebase est celui des
// tests du compte ; /api/mails est remplacée par une fausse réponse (page.route), Brevo et les clés de Google par des
// faux côté Node.
const crypto = require('crypto');
const { test, expect } = require('@playwright/test');
const { ouvrir, sansBandeau, jouer } = require('./outils');
const { FAUX, dejaConnecte, ouvrirCompte, rouvrirCompte, lienClique } = require('./faux-firebase');

const S = o => JSON.stringify(o);
const MAILS = 'window.DJINGO_MAILS = true;';   // les mails allumés (ML_PRET reste faux tant que Brevo n'est pas réglé)
const reponse = page => page.evaluate(() => { try { return JSON.parse(localStorage.getItem('coach-mails') || 'null'); } catch (e) { return null; } });
// Une session ouverte avec un compte par e-mail dont l'adresse n'est pas encore confirmée
const pasConfirme = `try { sessionStorage.setItem('__faux_user', JSON.stringify({ uid: 'u2', displayName: 'Léa', email: 'lea@exemple.fr', emailVerified: false })); } catch (e) {}`;

// La fausse fonction /api/mails : retient chaque appel, et si l'adresse est inscrite (comme Brevo)
async function fausseApi(page, { inscrit = false, panne = false } = {}){
  const etat = { inscrit, panne, appels: [] };
  await page.route('**/api/mails', async r => {
    const q = r.request(), d = JSON.parse(q.postData() || '{}');
    etat.appels.push(Object.assign({ jeton: q.headers().authorization }, d));
    if (etat.panne) return r.fulfill({ status: 503, contentType: 'application/json', body: S({ erreur: 'pas-configure' }) });
    if (d.action === 'oui') etat.inscrit = true;
    if (d.action === 'non') etat.inscrit = false;
    return r.fulfill({ status: 200, contentType: 'application/json', body: S({ oui: etat.inscrit }) });
  });
  return etat;
}
const creer = async (page, coche) => {
  await ouvrirCompte(page);
  await page.locator('#cptVersCreer').click();
  await page.locator('#cptPrenom').fill('Léa');
  await page.locator('#cptMail').fill('lea@exemple.fr');
  await page.locator('#cptMdp').fill('secret123');
  if (coche) await page.locator('#cptAccord').click();
  await page.locator('#cptGo').click();
  await expect(page.locator('#cptBtn')).toHaveText('Léa', { timeout: 15000 });
};

test.describe('Tant que les mails ne sont pas allumés', () => {
  test('ni case, ni question, ni interrupteur, et rien n’est envoyé', async ({ page }) => {
    const api = await fausseApi(page);
    const err = await ouvrir(page, { avant: FAUX, onglet: 'accueil' });
    await ouvrirCompte(page); await page.locator('#cptVersCreer').click();
    await expect(page.locator('#cptAccord')).toBeHidden();
    await expect(page.locator('#cptNote')).toContainText('Rien d’autre, et rien n’est partagé');
    await page.locator('#cptPrenom').fill('Léa'); await page.locator('#cptMail').fill('lea@exemple.fr'); await page.locator('#cptMdp').fill('secret123');
    await page.locator('#cptGo').click();
    await rouvrirCompte(page);
    await expect(page.locator('#cptConnecte')).toBeVisible();
    await expect(page.locator('#cptMailsRow')).toBeHidden();
    await page.locator('#cptClose').click();
    await page.waitForTimeout(2500);
    await expect(page.locator('#mlQ')).toBeHidden();
    expect(api.appels).toEqual([]);
    expect(await page.evaluate(() => window.__verifEnvois || 0)).toBe(0);
    expect(err).toEqual([]); await sansBandeau(page);
  });
});

test.describe('La case « Vini peut m’écrire »', () => {
  test('seulement en créant un compte, jamais cochée d’avance, et elle dit ce que sont les mails', async ({ page }) => {
    await ouvrir(page, { avant: FAUX + MAILS, onglet: 'accueil' });
    await ouvrirCompte(page);
    await expect(page.locator('#cptAccord')).toBeHidden();               // accueil de la fenêtre
    await page.locator('#cptVersCreer').click();
    await expect(page.locator('#cptAccord')).toBeVisible();
    await expect(page.locator('#cptAccord')).toContainText('Des astuces pour progresser et les nouveautés de DJingood');
    await expect(page.locator('#cptMails')).not.toBeChecked();
    await expect(page.locator('#cptNote')).toContainText('ne sert à t’écrire que si tu coches la case');
    await page.locator('#cptBascule').click();                             // « J'ai déjà un compte »
    await expect(page.locator('#cptAccord')).toBeHidden();
    // rouvrir la fenêtre la remet décochée
    await page.locator('#cptBascule').click(); await page.locator('#cptAccord').click();
    await expect(page.locator('#cptMails')).toBeChecked();
    await page.locator('#cptClose').click(); await ouvrirCompte(page); await page.locator('#cptVersCreer').click();
    await expect(page.locator('#cptMails')).not.toBeChecked();
  });

  test('cochée avec un compte par e-mail : d’abord le lien de confirmation, puis l’adresse part chez Brevo', async ({ page }) => {
    const api = await fausseApi(page);
    const err = await ouvrir(page, { avant: FAUX + MAILS, onglet: 'accueil' });
    await creer(page, true);
    // adresse pas confirmée : rien ne part chez Brevo, Firebase envoie le lien
    await expect.poll(() => page.evaluate(() => window.__verifEnvois || 0)).toBe(1);
    await expect.poll(() => reponse(page)).toMatchObject({ uid: 'm1', rep: 'attente', ou: 'creation' });
    expect(api.appels).toEqual([]);
    // le bandeau de bienvenue le dit, puis « Mon compte » aussi
    await expect(page.locator('#cptToastTxt')).toContainText('clique sur le lien');
    await rouvrirCompte(page);
    await expect(page.locator('#cptMailsRow')).toBeVisible();
    await expect(page.locator('#cptMailsInter')).toHaveAttribute('aria-checked', 'true');
    await expect(page.locator('#cptMailsTxt')).toContainText('clique sur le lien');
    // le joueur clique le lien, puis revient sur le site
    await lienClique(page, 'lea@exemple.fr');
    await page.reload();
    await expect.poll(() => api.appels.length).toBe(1);
    expect(api.appels[0]).toMatchObject({ action: 'oui', ou: 'creation', prenom: 'Léa', jeton: 'Bearer jeton-m1' });
    expect(typeof api.appels[0].niveau).toBe('string');
    await expect.poll(() => reponse(page)).toMatchObject({ uid: 'm1', rep: 'oui', ou: 'creation' });
    // la réponse suit le compte : elle est dans le document en ligne
    await expect.poll(() => page.evaluate(() => { const b = JSON.parse(sessionStorage.getItem('__faux_base') || '{}'); return b.m1 && b.m1.donnees['coach-mails']; }), { timeout: 8000 }).toContain('"rep":"oui"');
    expect(err).toEqual([]); await sansBandeau(page);
  });

  test('avec Google (premier écran, pas de case) : Vini pose la question juste après, et l’adresse part tout de suite', async ({ page }) => {
    const api = await fausseApi(page);
    await ouvrir(page, { avant: FAUX + MAILS, onglet: 'accueil' });
    await ouvrirCompte(page);
    await page.locator('#cptIn').click();
    await expect(page.locator('#compte')).toBeHidden({ timeout: 15000 });
    await page.locator('#mlOui').click({ timeout: 10000 });
    await expect.poll(() => api.appels.length).toBe(1);
    expect(api.appels[0]).toMatchObject({ action: 'oui', ou: 'question', prenom: 'Nathan', jeton: 'Bearer jeton-u1' });
    expect(await page.evaluate(() => window.__verifEnvois || 0)).toBe(0);
    await expect.poll(() => reponse(page)).toMatchObject({ uid: 'u1', rep: 'oui' });
  });

  test('pas cochée : seulement un « non », pas de lien, et Vini ne posera pas la question', async ({ page }) => {
    const api = await fausseApi(page);
    await ouvrir(page, { avant: FAUX + MAILS, onglet: 'accueil' });
    await creer(page, false);
    await expect.poll(() => reponse(page)).toMatchObject({ uid: 'm1', rep: 'non', ou: 'creation' });
    await expect(page.locator('#compte')).toBeHidden();
    await page.waitForTimeout(2500);
    await expect(page.locator('#mlQ')).toBeHidden();
    expect(api.appels.map(a => [a.action, a.ou])).toEqual([['non', 'creation']]);
    expect(await page.evaluate(() => window.__verifEnvois || 0)).toBe(0);
  });
});

test.describe('La question, pour les comptes créés avant', () => {
  const connecte = dejaConnecte() + FAUX + MAILS;

  test('posée une fois sur l’accueil ; « Non merci » : on ne redemande pas', async ({ page }) => {
    const api = await fausseApi(page);
    const err = await ouvrir(page, { avant: connecte, onglet: 'accueil' });
    await expect(page.locator('#mlQ')).toBeVisible({ timeout: 8000 });
    await expect(page.locator('#mlTitre')).toHaveText('Nathan, je peux t\'écrire ?');
    await expect(page.locator('#mlQ .mltexte')).toContainText('des astuces pour progresser et les nouveautés');
    await page.locator('#mlNon').click();
    await expect(page.locator('#mlQ')).toBeHidden();
    expect(await reponse(page)).toMatchObject({ uid: 'u1', rep: 'non', ou: 'question' });
    await page.reload();
    await page.waitForTimeout(3500);
    await expect(page.locator('#mlQ')).toBeHidden();
    // le « non » part aussi chez Brevo (l'adresse a pu y être inscrite depuis un autre appareil)
    expect(api.appels.map(a => [a.action, a.ou])).toEqual([['non', 'question']]);
    expect(err).toEqual([]); await sansBandeau(page);
  });

  test('« Oui, écris-moi » : l’adresse part chez Brevo', async ({ page }) => {
    const api = await fausseApi(page);
    await ouvrir(page, { avant: connecte, onglet: 'accueil' });
    await page.locator('#mlOui').click({ timeout: 8000 });
    await expect(page.locator('#mlQ')).toBeHidden();
    expect(api.appels).toHaveLength(1);
    expect(api.appels[0]).toMatchObject({ action: 'oui', ou: 'question', prenom: 'Nathan', jeton: 'Bearer jeton-u1' });
    expect(await reponse(page)).toMatchObject({ uid: 'u1', rep: 'oui', ou: 'question' });
  });

  test('« Oui » avec une adresse pas confirmée : le lien part, Vini le dit, et fermer ne vaut pas « non »', async ({ page }) => {
    const api = await fausseApi(page);
    await ouvrir(page, { avant: pasConfirme + FAUX + MAILS, onglet: 'accueil' });
    await page.locator('#mlOui').click({ timeout: 8000 });
    await expect(page.locator('#mlMsg')).toContainText('Clique sur le lien dedans pour confirmer ton adresse');
    await expect(page.locator('#mlOui')).toHaveText('J\'ai compris');
    await expect(page.locator('#mlNon')).toBeHidden();
    expect(await page.evaluate(() => window.__verifEnvois || 0)).toBe(1);
    await page.keyboard.press('Escape');
    await expect(page.locator('#mlQ')).toBeHidden();
    expect(await reponse(page)).toMatchObject({ uid: 'u2', rep: 'attente', ou: 'question' });
    expect(api.appels).toEqual([]);
    // tant qu'elle n'est pas confirmée, rien ne part, même en revenant
    await page.reload(); await page.waitForTimeout(2500);
    expect(api.appels).toEqual([]);
    await expect(page.locator('#mlQ')).toBeHidden();
  });

  test('Échap vaut « non »', async ({ page }) => {
    await fausseApi(page);
    await ouvrir(page, { avant: connecte, onglet: 'accueil' });
    await expect(page.locator('#mlQ')).toBeVisible({ timeout: 8000 });
    await page.keyboard.press('Escape');
    await expect(page.locator('#mlQ')).toBeHidden();
    expect(await reponse(page)).toMatchObject({ rep: 'non', ou: 'question' });
  });

  test('pas de réseau : on le dit, et fermer ne vaut pas « non »', async ({ page }) => {
    await fausseApi(page, { panne: true });
    await ouvrir(page, { avant: connecte, onglet: 'accueil' });
    await page.locator('#mlOui').click({ timeout: 8000 });
    await expect(page.locator('#mlMsg')).toContainText('Ça n’a pas marché');
    await expect(page.locator('#mlQ')).toBeVisible();
    await page.locator('#mlFerme').click();
    await expect(page.locator('#mlQ')).toBeHidden();
    expect(await reponse(page)).toBe(null);
  });

  test('pas pendant une autre page : elle attend le retour à l’accueil', async ({ page }) => {
    await fausseApi(page);
    await ouvrir(page, { avant: connecte, onglet: 'progres' });
    await page.waitForTimeout(3500);
    await expect(page.locator('#mlQ')).toBeHidden();
    await page.evaluate(() => { location.hash = '#accueil'; });
    await expect(page.locator('#mlQ')).toBeVisible({ timeout: 8000 });
  });

  test('la réponse d’un autre compte, sur ce navigateur, ne compte pas', async ({ page }) => {
    await fausseApi(page);
    await ouvrir(page, { avant: connecte, onglet: 'accueil', stockage: { 'coach-mails': S({ uid: 'autre', rep: 'oui', le: '2026-10-29', ou: 'creation' }) } });
    await expect(page.locator('#mlQ')).toBeVisible({ timeout: 8000 });
  });
});

test.describe('L’interrupteur de « Mon compte »', () => {
  const connecte = dejaConnecte() + FAUX + MAILS;
  const oui = { 'coach-mails': S({ uid: 'u1', rep: 'oui', le: '2026-10-29', ou: 'creation' }) };

  test('couper : Brevo n’écrit plus', async ({ page }) => {
    const api = await fausseApi(page, { inscrit: true });
    const err = await ouvrir(page, { avant: connecte, onglet: 'accueil', stockage: oui });
    await page.waitForTimeout(1500);
    await ouvrirCompte(page);
    await expect(page.locator('#cptMailsRow')).toBeVisible();
    await expect(page.locator('#cptMailsInter')).toHaveAttribute('aria-checked', 'true');
    await expect.poll(() => api.appels.map(a => a.action)).toEqual(['etat']);
    await page.locator('#cptMailsInter').click();
    await expect(page.locator('#cptMailsInter')).toHaveAttribute('aria-checked', 'false');
    await expect(page.locator('#cptMsg')).toContainText('Vini ne t’écrira plus');
    expect(api.appels.map(a => a.action)).toEqual(['etat', 'non']);
    expect(await reponse(page)).toMatchObject({ rep: 'non', ou: 'compte' });
    expect(err).toEqual([]); await sansBandeau(page);
  });

  test('allumer avec une adresse pas confirmée : le lien part, et l’interrupteur le dit', async ({ page }) => {
    const api = await fausseApi(page);
    await ouvrir(page, { avant: pasConfirme + FAUX + MAILS, onglet: 'accueil', stockage: { 'coach-mails': S({ uid: 'u2', rep: 'non', le: '2026-10-29', ou: 'question' }) } });
    await page.waitForTimeout(1500);
    await ouvrirCompte(page);
    await expect.poll(() => api.appels.map(a => a.action)).toEqual(['etat']);
    await page.locator('#cptMailsInter').click();
    await expect(page.locator('#cptMsg')).toContainText('clique sur le lien dedans');
    await expect(page.locator('#cptMailsInter')).toHaveAttribute('aria-checked', 'true');
    await expect(page.locator('#cptMailsTxt')).toContainText('Presque fini');
    expect(api.appels.map(a => a.action)).toEqual(['etat']);
    expect(await reponse(page)).toMatchObject({ rep: 'attente', ou: 'compte' });
    // lien cliqué, puis « Mon compte » rouvert : l'adresse part
    await lienClique(page, 'lea@exemple.fr');
    await page.locator('#cptClose').click(); await ouvrirCompte(page);
    await expect.poll(() => api.appels.map(a => a.action)).toEqual(['etat', 'oui']);
    await expect.poll(() => reponse(page)).toMatchObject({ rep: 'oui', ou: 'compte' });
  });

  test('pas de réseau : l’interrupteur revient où il était', async ({ page }) => {
    const api = await fausseApi(page, { inscrit: true });
    await ouvrir(page, { avant: connecte, onglet: 'accueil', stockage: oui });
    await page.waitForTimeout(1500);
    await ouvrirCompte(page);
    await expect.poll(() => api.appels.length).toBe(1);
    api.panne = true;
    await page.locator('#cptMailsInter').click();
    await expect(page.locator('#cptMsg')).toContainText('Ça n’a pas marché');
    await expect(page.locator('#cptMailsInter')).toHaveAttribute('aria-checked', 'true');
    expect(await reponse(page)).toMatchObject({ rep: 'oui' });
  });

  test('désinscrit depuis un mail : l’interrupteur le montre en ouvrant « Mon compte »', async ({ page }) => {
    await fausseApi(page, { inscrit: false });
    await ouvrir(page, { avant: connecte, onglet: 'accueil', stockage: oui });
    await page.waitForTimeout(1500);
    await ouvrirCompte(page);
    await expect(page.locator('#cptMailsInter')).toHaveAttribute('aria-checked', 'false');
    expect(await reponse(page)).toMatchObject({ rep: 'non', ou: 'compte' });
  });
});

test.describe('La carte de fin propose le compte', () => {
  // « Le bon moment » joué parfaitement : B lancé pile sur la ligne
  async function bonMoment(page){
    await jouer(page);
    await page.waitForFunction(() => beatNow() >= 31.7, null, { timeout: 60000, polling: 'raf' }); await page.keyboard.press('Space');
    await expect(page.locator('#result')).toBeVisible({ timeout: 60000 });
  }

  test('après une réussite, sans compte : un encadré, et le bouton ouvre « Créer mon compte »', async ({ page }) => {
    test.setTimeout(90000);
    const err = await ouvrir(page, { avant: FAUX });
    await bonMoment(page);
    await expect(page.locator('#rCompte')).toBeVisible();
    await expect(page.locator('#rCompte')).toContainText('Garde ta progression.');
    await expect(page.locator('#rCompte')).not.toContainText('mail');            // pas de promesse de mails : la case n'est jamais cochée d'avance
    await expect(page.locator('#next')).toHaveClass(/go/);                  // « Niveau suivant » reste le bouton principal
    await page.locator('#rCompteGo').click();
    await expect(page.locator('#compte')).toBeVisible();
    await expect(page.locator('#cptTitle')).toHaveText('Créer mon compte');
    expect(err).toEqual([]); await sansBandeau(page);
  });

  test('une fois par jour au plus, jamais après un échec, jamais avec un compte', async ({ page }) => {
    await ouvrir(page, { avant: FAUX + MAILS });
    await page.evaluate(() => { $('result').hidden = false; mlPropose(1); });
    await expect(page.locator('#rCompte')).toBeHidden();                    // raté
    await page.evaluate(() => mlPropose(2));
    await expect(page.locator('#rCompte')).toBeVisible();
    await page.evaluate(() => mlPropose(3));
    await expect(page.locator('#rCompte')).toBeHidden();                    // déjà proposé aujourd'hui
    await page.evaluate(() => localStorage.setItem('coach-compte-propose', '2020-01-01'));
    await page.evaluate(() => { cpt = { uid: 'u9', prenom: 'Sam' }; mlPropose(3); });
    await expect(page.locator('#rCompte')).toBeHidden();                    // déjà un compte
  });

  test('le jour de la proposition reste sur cet ordinateur', async ({ page }) => {
    await ouvrir(page, { avant: FAUX });
    expect(await page.evaluate(() => cptSuivie('coach-compte-propose'))).toBe(false);
    expect(await page.evaluate(() => cptSuivie('coach-mails'))).toBe(true);
  });
});

// Second passage du gardien : l'écouteur `focus` de js/mails.js existe avant que compte.js (et `cpt`) soit chargé
test('revenir sur l’onglet pendant le chargement n’affiche pas d’erreur', async ({ page }) => {
  const erreurs = [];
  page.on('pageerror', e => erreurs.push(String(e)));
  let lache; const retenu = new Promise(r => { lache = r; });
  await page.route('**/js/compte.js', async r => { await retenu; await r.continue(); });
  await page.addInitScript(FAUX + MAILS);
  await page.goto('/index.html#accueil', { waitUntil: 'commit' });
  await page.waitForFunction(() => typeof mlConfirme === 'function');      // mails.js est là, compte.js pas encore
  await page.evaluate(() => window.dispatchEvent(new Event('focus')));
  lache();
  await page.waitForFunction(() => typeof cptOn === 'function');
  await page.waitForTimeout(300);
  expect(erreurs).toEqual([]); await sansBandeau(page);
});

test('la page de confidentialité parle des mails de Vini', async ({ page }) => {
  await page.goto('/confidentialite.html');
  await expect(page.getByRole('heading', { name: 'Les mails de Vini' })).toBeVisible();
  const corps = page.locator('body');
  await expect(corps).toContainText('un mail par semaine au plus');
  await expect(corps).toContainText('Brevo');
  await expect(corps).toContainText('Les mails de Vini » dans « Mon compte »');   // l'interrupteur, pour dire oui comme non
  await expect(corps).toContainText('confirmer');                                   // l'adresse confirmée
});

/* ---------- La fonction api/mails.js, sans réseau ----------
   Les clés de Google sont remplacées par une clé fabriquée ici, et Brevo par un faux `fetch`. */
test.describe('La fonction /api/mails', () => {
  const fn = require('../api/mails.js');
  const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', { modulusLength: 2048 });
  const autre = crypto.generateKeyPairSync('rsa', { modulusLength: 2048 }).privateKey;
  const PUB = publicKey.export({ type: 'spki', format: 'pem' });
  const b64 = o => Buffer.from(typeof o === 'string' ? o : S(o)).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  const maintenant = () => Math.floor(Date.now() / 1000);
  function jeton(c = {}, cle = privateKey){
    const h = b64({ alg: 'RS256', kid: 'k1', typ: 'JWT' });
    const p = b64(Object.assign({ aud: 'djingo-1e1f4', iss: 'https://securetoken.google.com/djingo-1e1f4', sub: 'u1', email: 'Lea@Exemple.fr', email_verified: true, iat: maintenant() - 10, exp: maintenant() + 3000 }, c));
    const sig = crypto.createSign('RSA-SHA256').update(h + '.' + p).sign(cle);
    return h + '.' + p + '.' + sig.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }
  const vraiFetch = global.fetch;
  let brevo;   // les appels à Brevo, et sa réponse
  test.beforeEach(() => {
    process.env.BREVO_CLE = 'cle-secrete'; process.env.BREVO_LISTE = '7';
    fn.cles = async () => ({ k1: PUB });
    brevo = { appels: [], statut: 201, corps: {} };
    global.fetch = async (url, o = {}) => { brevo.appels.push({ url, methode: o.method, cle: o.headers && o.headers['api-key'], corps: o.body ? JSON.parse(o.body) : null });
      return { ok: brevo.statut >= 200 && brevo.statut < 300, status: brevo.statut, json: async () => brevo.corps }; };
  });
  test.afterEach(() => { global.fetch = vraiFetch; delete process.env.BREVO_CLE; delete process.env.BREVO_LISTE; });
  async function appel(corps, { methode = 'POST', j = jeton() } = {}){
    const res = { statusCode: 0, entetes: {}, corps: null, setHeader(k, v){ this.entetes[k] = v; }, end(t){ this.corps = JSON.parse(t); } };
    await fn({ method: methode, headers: j ? { authorization: 'Bearer ' + j } : {}, body: corps }, res);
    return res;
  }

  test('refuse ce qui n’est pas un POST, et attend ses réglages', async () => {
    expect((await appel({ action: 'etat' }, { methode: 'GET' })).statusCode).toBe(405);
    delete process.env.BREVO_CLE;
    expect((await appel({ action: 'etat' })).statusCode).toBe(503);
    expect(brevo.appels).toEqual([]);
  });

  test('refuse un jeton faux, expiré, d’un autre projet, ou sans adresse', async () => {
    for (const j of ['', 'nimporte.quoi.ici', jeton({}, autre), jeton({ exp: maintenant() - 5 }), jeton({ aud: 'autre-projet' }),
      jeton({ iss: 'https://securetoken.google.com/autre' }), jeton({ email: undefined }), jeton({ sub: '' })]){
      expect((await appel({ action: 'oui' }, { j })).statusCode).toBe(401);
    }
    expect(brevo.appels).toEqual([]);
  });

  test('n’inscrit jamais une adresse pas confirmée (on ne peut pas inscrire l’adresse d’un autre)', async () => {
    for (const v of [false, undefined, 'true']){
      const r = await appel({ action: 'oui', prenom: 'Léa', niveau: 'Le fader' }, { j: jeton({ email_verified: v }) });
      expect(r.statusCode).toBe(403); expect(r.corps).toEqual({ erreur: 'adresse-non-confirmee' });
    }
    expect(brevo.appels).toEqual([]);
  });

  test('oui : l’adresse vient du jeton, jamais de ce que le site envoie', async () => {
    const r = await appel({ action: 'oui', email: 'pirate@exemple.fr', prenom: 'Léa', niveau: 'Le fader', ou: 'question' });
    expect(r.statusCode).toBe(200); expect(r.corps).toEqual({ oui: true });
    expect(brevo.appels).toHaveLength(1);
    const a = brevo.appels[0];
    expect(a).toMatchObject({ url: 'https://api.brevo.com/v3/contacts', methode: 'POST', cle: 'cle-secrete' });
    expect(a.corps).toMatchObject({ email: 'lea@exemple.fr', listIds: [7], updateEnabled: true, emailBlacklisted: false });
    expect(a.corps.attributes).toMatchObject({ PRENOM: 'Léa', NIVEAU: 'Le fader', ACCORD_OU: 'question' });
    expect(a.corps.attributes.ACCORD_LE).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  test('rien de libre n’arrive dans un mail : prénom en lettres seulement, étape prise dans la liste', async () => {
    const essais = [['Jean-Pierre', 'Jean-Pierre'], ['Lou Ann', 'Lou Ann'], ['Zoé', 'Zoé'], ['Léa <b>', undefined], ['Va sur arnaque.com', undefined],
      ['Va vite sur arnaque', undefined], ['Nathan2', undefined], ['', undefined]];
    for (const [prenom, garde] of essais){
      brevo.appels = [];
      await appel({ action: 'oui', prenom, niveau: 'Va vite sur arnaque-exemple.com' });
      expect(brevo.appels[0].corps.attributes.PRENOM).toBe(garde);
      expect(brevo.appels[0].corps.attributes.NIVEAU).toBe(undefined);
    }
  });

  test('non : Brevo n’écrit plus, sans effacer le contact (sinon il recevrait de nouveau la bienvenue)', async () => {
    brevo.statut = 204;
    let r = await appel({ action: 'non' });
    expect(r.corps).toEqual({ oui: false });
    expect(brevo.appels[0]).toMatchObject({ url: 'https://api.brevo.com/v3/contacts/lea%40exemple.fr', methode: 'PUT', corps: { emailBlacklisted: true, unlinkListIds: [7] } });
    brevo.statut = 404;
    r = await appel({ action: 'non', }, { j: jeton({ email_verified: false }) });   // pas besoin d'adresse confirmée pour dire non
    expect(r.statusCode).toBe(200);
  });

  test('etat : inscrit = dans la liste et pas désinscrit', async () => {
    brevo.statut = 200; brevo.corps = { listIds: [3, 7], emailBlacklisted: false };
    expect((await appel({ action: 'etat' })).corps).toEqual({ oui: true });
    brevo.corps = { listIds: [7], emailBlacklisted: true };
    expect((await appel({ action: 'etat' })).corps).toEqual({ oui: false });
    brevo.corps = { listIds: [3], emailBlacklisted: false };
    expect((await appel({ action: 'etat' })).corps).toEqual({ oui: false });
    brevo.statut = 404;
    expect((await appel({ action: 'etat' })).corps).toEqual({ oui: false });
    expect(brevo.appels[0]).toMatchObject({ methode: 'GET' });
  });

  test('une erreur de Brevo est dite au site', async () => {
    brevo.statut = 400;
    expect((await appel({ action: 'oui' })).statusCode).toBe(502);
    expect((await appel({ action: 'inconnue' })).statusCode).toBe(400);
  });
});

// La liste des étapes de la fonction suit les noms du site : sinon le premier mail perdrait « Ta prochaine étape »
test('chaque prochaine étape que le site peut envoyer est dans la liste de la fonction', async ({ page }) => {
  const { NIVEAUX } = require('../api/mails.js');
  await ouvrir(page);
  const noms = await page.evaluate(() => [...BASE_LESSONS.map(l => l.title), ...Object.values(STAGES).map(s => s.title)]);
  expect(noms.filter(n => !NIVEAUX.includes(n))).toEqual([]);
});
