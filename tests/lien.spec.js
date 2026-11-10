// Lot 67 « Le mail qui arrive » : le lien de connexion part par Brevo, avec notre texte (api/lien.js), et le site repasse
// par Firebase si la fonction n'est pas réglée ou ne répond pas. Deux parties : le site, avec une fausse fonction
// (page.route) et le faux Firebase des tests du compte ; puis la fonction elle-même, sans réseau.
const { test, expect } = require('@playwright/test');
const crypto = require('crypto');
const { ouvrir, sansBandeau } = require('./outils');
const { FAUX } = require('./faux-firebase');

const NOUVEAU = { 'coach-guide-vu': null, 'coach-fiches': null, 'coach-accueil': null };
const choix = (page, i) => page.locator('#ppOpts .pp-opt').nth(i).click();
const suite = page => page.locator('#ppGo').click();
async function jusquauPlan(page) {
  await suite(page); await choix(page, 0); await suite(page);
  await page.locator('#ppOrPasse').click();
  await choix(page, 1); await suite(page); await choix(page, 1); await suite(page);
  await expect(page.locator('.pp-frise')).toBeVisible();
}
// La fausse fonction /api/lien : retient chaque appel et répond ce qu'on lui dit (ou coupe la connexion)
async function fausseFonction(page, reponse) {
  const appels = [];
  await page.route('**/api/lien', async r => {
    appels.push({ methode: r.request().method(), corps: JSON.parse(r.request().postData() || 'null') });
    if (reponse === 'coupe') return r.abort();
    await r.fulfill({ status: reponse.statut, contentType: 'application/json', body: JSON.stringify(reponse.corps || {}) });
  });
  return appels;
}
// « J'ai déjà un compte » → « Recevoir un lien de connexion »
async function demandeLien(page, mail = 'nina@exemple.fr') {
  await page.locator('#cptBtn').click();
  await page.evaluate(() => cptVa('entrer'));
  await page.locator('#cptMail').fill(mail);
  await page.locator('#cptLienBtn').click();
}
const liensFirebase = page => page.evaluate(() => (window.__liensConnexion || []).map(l => l.mail));

test.describe('Le site : Brevo d\'abord, Firebase en secours', () => {
  test('Brevo envoie : Firebase n\'envoie rien, l\'adresse et la page de retour partent à la fonction', async ({ page }) => {
    const appels = await fausseFonction(page, { statut: 200, corps: { envoye: true } });
    const erreurs = await ouvrir(page, { onglet: 'accueil', avant: FAUX });
    await demandeLien(page);
    await expect(page.locator('#cptMsg')).toHaveText(/C’est envoyé/);
    expect(appels).toEqual([{ methode: 'POST', corps: { mail: 'nina@exemple.fr', retour: expect.stringMatching(/^http:\/\/localhost:\d+\/index\.html$/) } }]);
    expect(await liensFirebase(page)).toEqual([]);
    expect(await page.evaluate(() => localStorage.getItem('__djingood-lien'))).toBe('nina@exemple.fr');   // pour finir la connexion ici
    expect(erreurs).toEqual([]); await sansBandeau(page);
  });

  for (const [nom, reponse] of [['pas réglée (503)', { statut: 503, corps: { erreur: 'pas-configure' } }],
    ['adresse sans compte (404)', { statut: 404, corps: { erreur: 'pas-de-compte' } }],
    ['Brevo en panne (502)', { statut: 502, corps: { erreur: 'brevo' } }],
    ['réponse bizarre', { statut: 200, corps: { autre: 1 } }],
    ['pas de connexion', 'coupe']]) {
    test(`fonction ${nom} : le lien part par Firebase, comme avant`, async ({ page }) => {
      const appels = await fausseFonction(page, reponse);
      const erreurs = await ouvrir(page, { onglet: 'accueil', avant: FAUX });
      await demandeLien(page);
      await expect(page.locator('#cptMsg')).toHaveText(/C’est envoyé/);
      expect(appels).toHaveLength(1);
      expect(await liensFirebase(page)).toEqual(['nina@exemple.fr']);
      expect(erreurs).toEqual([]); await sansBandeau(page);
    });
  }

  test('trop de liens demandés (429) : on dit où le chercher, et Firebase ne sert pas à contourner la limite', async ({ page }) => {
    await fausseFonction(page, { statut: 429, corps: { erreur: 'trop' } });
    await ouvrir(page, { onglet: 'accueil', avant: FAUX });
    await demandeLien(page);
    await expect(page.locator('#cptMsg')).toHaveText('Je t’ai déjà envoyé 3 liens dans l’heure : regarde dans ta boîte de réception et dans tes spams, il y est. Tu pourras en redemander un plus tard.');
    expect(await liensFirebase(page)).toEqual([]);
  });

  test('la fonction traîne plus de 8 s : Firebase prend le relais', async ({ page }) => {
    await page.route('**/api/lien', () => {});   // ne répond jamais
    await ouvrir(page, { onglet: 'accueil', avant: FAUX });
    await page.evaluate(() => { window.__vraiTimeout = setTimeout; window.setTimeout = (f, ms, ...a) => window.__vraiTimeout(f, ms === CPT_LIEN_ATTENTE ? 50 : ms, ...a); });
    await demandeLien(page);
    await expect(page.locator('#cptMsg')).toHaveText(/C’est envoyé/);
    expect(await liensFirebase(page)).toEqual(['nina@exemple.fr']);
  });

  test.describe('Sur un téléphone', () => {
    test.use({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
    test('après le compte des Premiers pas, le lien pour l\'ordinateur part par Brevo', async ({ page }) => {
      const appels = await fausseFonction(page, { statut: 200, corps: { envoye: true } });
      const erreurs = await ouvrir(page, { onglet: '', stockage: NOUVEAU, avant: FAUX });
      await jusquauPlan(page);
      await suite(page);
      await page.locator('#ppPrenom').fill('Sam'); await page.locator('#ppMail').fill('sam@exemple.fr');
      await suite(page);
      await expect(page.locator('#ppLienTitre')).toHaveText('Ton lien pour l’ordinateur est parti à s•••@exemple.fr');
      expect(appels.map(a => a.corps.mail)).toEqual(['sam@exemple.fr']);
      expect(await liensFirebase(page)).toEqual([]);
      expect(erreurs).toEqual([]); await sansBandeau(page);
    });

    test('3 liens déjà partis dans l\'heure : l\'écran le dit et montre où chercher (gardien du lot 67)', async ({ page }) => {
      await fausseFonction(page, { statut: 429, corps: { erreur: 'trop' } });
      await ouvrir(page, { onglet: '', stockage: NOUVEAU, avant: FAUX });
      await jusquauPlan(page);
      await suite(page);
      await page.locator('#ppPrenom').fill('Sam'); await page.locator('#ppMail').fill('sam@exemple.fr');
      await suite(page);
      await expect(page.locator('#ppLienTitre')).toHaveText('Je t’ai déjà envoyé 3 liens dans l’heure, à s•••@exemple.fr');
      await expect(page.locator('#ppLienTxt')).toContainText('dans ta boîte de réception ou dans tes spams');
      await expect(page.locator('#ppSpam')).toBeVisible();
      expect(await liensFirebase(page)).toEqual([]);
    });

    test('l\'accueil du téléphone : « M\'envoyer le lien » refusé (429) le dit sans « réessaie »', async ({ page }) => {
      await fausseFonction(page, { statut: 429, corps: { erreur: 'trop' } });
      const avant = `try { sessionStorage.setItem('__faux_user', JSON.stringify({ uid: 'u9', displayName: 'Lou', email: 'lou@exemple.fr', emailVerified: true })); } catch (e) {}` + FAUX;
      await ouvrir(page, { onglet: 'accueil', stockage: { 'coach-parcours': 'debut', 'coach-compte': JSON.stringify({ uid: 'u9', prenom: 'Lou', maj: 0, sale: false }) }, avant });
      await page.waitForFunction(() => typeof cpt !== 'undefined' && cpt && cptFb && cptFb.auth && cptFb.auth.currentUser);
      await page.evaluate(() => renderHome());
      await page.locator('#homeLienBtn').click();
      await expect(page.locator('#homeLienBtn')).toHaveText('Déjà envoyé : regarde tes mails');
      await expect(page.locator('#homeLienTxt')).toContainText('Je t’ai déjà envoyé 3 liens dans l’heure');
      expect(await liensFirebase(page)).toEqual([]);
    });
  });
});

/* ---------- La fonction api/lien.js, sans réseau ----------
   Google (le jeton d'accès, la recherche du compte, la fabrication du lien), Firestore (les compteurs) et Brevo sont remplacés
   par un faux `fetch`. Chaque faux appel rend la main avant de répondre, comme le réseau : des demandes lancées ensemble
   s'entremêlent vraiment. Le faux Firestore ajoute 1 d'un seul coup, comme le vrai (`increment`). */
test.describe('La fonction /api/lien', () => {
  const fn = require('../api/lien.js');
  const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', { modulusLength: 2048 });
  const CLE_PEM = privateKey.export({ type: 'pkcs8', format: 'pem' });
  const COMPTE = { type: 'service_account', client_email: 'djingood-liens@djingo-1e1f4.iam.gserviceaccount.com', private_key: CLE_PEM };
  const OOB = 'https://djingo-1e1f4.firebaseapp.com/__/auth/action?apiKey=AIza-essai&mode=signIn&oobCode=CODE-123&continueUrl=https%3A%2F%2Fdjingood.fr%2F&lang=fr';
  const vraiFetch = global.fetch, vraiJeton = fn.jetonAcces;
  let g;   // l'état du faux Google et du faux Brevo, et tous les appels
  test.beforeEach(() => {
    process.env.BREVO_CLE = 'cle-brevo'; process.env.FIREBASE_COMPTE = JSON.stringify(COMPTE);
    fn.jetonAcces = async () => 'jeton-google';
    g = { appels: [], users: [{ localId: 'u1', email: 'lea@exemple.fr', displayName: 'Léa' }], brevo: 201, lookup: 200, commit: 200, oob: 200, fiches: {}, commitVide: false };
    global.fetch = async (url, o = {}) => {
      const corps = o.body && /json/.test(JSON.stringify(o.headers || {})) ? JSON.parse(o.body) : o.body;
      g.appels.push({ url, corps, entetes: o.headers });
      await new Promise(r => setImmediate(r));   // le réseau : les autres demandes avancent pendant ce temps
      const rep = (statut, d) => ({ ok: statut >= 200 && statut < 300, status: statut, json: async () => d });
      if (url.endsWith('/accounts:lookup')) return rep(g.lookup, g.users.length ? { users: g.users.filter(u => u.email === corps.email[0]) } : {});
      if (url === 'https://firestore.googleapis.com/v1/projects/djingo-1e1f4/databases/(default)/documents:commit') {
        if (g.commit !== 200) return rep(g.commit, {});
        if (g.commitVide) return rep(200, { commitTime: 'x' });
        const writeResults = corps.writes.map(w => { const nom = w.update.name; g.fiches[nom] = (g.fiches[nom] || 0) + 1;
          return { updateTime: 'x', transformResults: [{ integerValue: String(g.fiches[nom]) }] }; });
        return rep(200, { writeResults, commitTime: 'x' });
      }
      if (url.endsWith('/accounts:sendOobCode')) return rep(g.oob, { email: 'lea@exemple.fr', oobLink: OOB });
      if (url === 'https://api.brevo.com/v3/smtp/email') return rep(g.brevo, { messageId: 'm1' });
      return rep(404, {});
    };
  });
  test.afterEach(() => { global.fetch = vraiFetch; fn.jetonAcces = vraiJeton; delete process.env.BREVO_CLE; delete process.env.FIREBASE_COMPTE; });
  async function appel(corps, methode = 'POST'){
    const res = { statusCode: 0, entetes: {}, corps: null, setHeader(k, v){ this.entetes[k] = v; }, end(t){ this.corps = JSON.parse(t); } };
    await fn({ method: methode, headers: {}, body: corps }, res);
    return res;
  }
  const vers = fin => g.appels.filter(a => a.url.endsWith(fin));
  const brevo = () => g.appels.filter(a => a.url.startsWith('https://api.brevo.com'));

  test('refuse ce qui n\'est pas un POST, attend ses deux réglages, vérifie l\'adresse', async () => {
    expect((await appel({ mail: 'lea@exemple.fr' }, 'GET')).statusCode).toBe(405);
    delete process.env.FIREBASE_COMPTE;
    expect((await appel({ mail: 'lea@exemple.fr' })).statusCode).toBe(503);
    process.env.FIREBASE_COMPTE = '{ pas du json'; expect((await appel({ mail: 'lea@exemple.fr' })).statusCode).toBe(503);
    process.env.FIREBASE_COMPTE = JSON.stringify(COMPTE); delete process.env.BREVO_CLE;
    expect((await appel({ mail: 'lea@exemple.fr' })).statusCode).toBe(503);
    process.env.BREVO_CLE = 'cle-brevo';
    for (const m of ['', 'pas-une-adresse', 'a@b', 'x'.repeat(200) + '@exemple.fr', 42]) expect((await appel({ mail: m })).statusCode).toBe(400);
    expect(g.appels).toEqual([]);
  });

  test('le mail part : notre texte, depuis noreply@djingood.fr, avec un lien direct vers djingood.fr', async () => {
    const r = await appel(JSON.stringify({ mail: ' Lea@Exemple.FR ', retour: 'https://djingood.fr/index.html' }));
    expect(r.statusCode).toBe(200); expect(r.corps).toEqual({ envoye: true });
    expect(vers('/accounts:lookup')[0].corps).toEqual({ email: ['lea@exemple.fr'] });
    expect(vers('/accounts:lookup')[0].entetes.authorization).toBe('Bearer jeton-google');
    expect(vers('/accounts:sendOobCode')[0].corps).toEqual({ requestType: 'EMAIL_SIGNIN', email: 'lea@exemple.fr', continueUrl: 'https://djingood.fr/index.html', canHandleCodeInApp: true, returnOobLink: true });
    const b = brevo();
    expect(b).toHaveLength(1);
    expect(b[0].entetes['api-key']).toBe('cle-brevo');
    const lien = 'https://djingood.fr/index.html?apiKey=AIza-essai&oobCode=CODE-123&mode=signIn&lang=fr';
    expect(b[0].corps).toMatchObject({ sender: { name: 'DJingood', email: 'noreply@djingood.fr' }, to: [{ email: 'lea@exemple.fr' }],
      subject: 'Ton lien pour te connecter à DJingood', tags: ['lien-connexion'] });
    expect(b[0].corps.textContent).toContain('Salut Léa !');
    expect(b[0].corps.textContent).toContain(lien);
    expect(b[0].corps.textContent).toContain('Ce lien ne sert qu’une fois. Tu n’as rien demandé ? Ignore ce mail : rien ne se passe sans clic.');
    expect(b[0].corps.htmlContent).toContain('href="' + lien.replace(/&/g, '&amp;') + '"');
    expect(b[0].corps.htmlContent).toContain('Me connecter');
    expect(b[0].corps.htmlContent).toContain('Ouvre-le sur l’ordinateur où tu brancheras ta table');
    expect(b[0].corps.htmlContent).not.toMatch(/<img|<script/i);
  });

  test('le lien ramène toujours sur une page de DJingood, jamais sur une adresse donnée par celui qui appelle', async () => {
    for (const [retour, attendu] of [['https://arnaque.example/djingood.fr', 'https://djingood.fr/'], ['javascript:alert(1)', 'https://djingood.fr/'],
      ['https://djingood.fr.arnaque.example/', 'https://djingood.fr/'], ['https://www.djingood.fr/index.html?x=1#y', 'https://www.djingood.fr/index.html'],
      ['https://coach-bass-swap.vercel.app/', 'https://coach-bass-swap.vercel.app/'], [undefined, 'https://djingood.fr/'], ['http://djingood.fr/', 'https://djingood.fr/'],
      // seules l'accueil et /index.html savent finir la connexion (remarque du gardien)
      ['https://djingood.fr/presentation.html', 'https://djingood.fr/'], ['https://djingood.fr//arnaque.example', 'https://djingood.fr/'], ['https://djingood.fr/api/lien', 'https://djingood.fr/']]) {
      g.appels = []; g.fiches = {};   // chaque essai repart d'un compteur vide (3 liens par heure)
      expect((await appel({ mail: 'lea@exemple.fr', retour })).statusCode).toBe(200);
      expect(vers('/accounts:sendOobCode')[0].corps.continueUrl).toBe(attendu);
      expect(brevo()[0].corps.textContent).toContain(attendu + '?apiKey=');
    }
  });

  test('une adresse sans compte (ou un compte bloqué) : rien n\'est envoyé, le site repassera par Firebase', async () => {
    g.users = [];
    let r = await appel({ mail: 'inconnu@exemple.fr' });
    expect(r.statusCode).toBe(404); expect(r.corps).toEqual({ erreur: 'pas-de-compte' });
    g.users = [{ localId: 'u1', email: 'lea@exemple.fr', disabled: true }];
    r = await appel({ mail: 'lea@exemple.fr' });
    expect(r.statusCode).toBe(404);
    expect(vers(':commit')).toEqual([]); expect(brevo()).toEqual([]);
  });

  test(`au plus ${fn.MAX} liens par heure et par adresse, même demandés tous en même temps (feu rouge du gardien)`, async () => {
    // 20 demandes lancées ensemble pour la même adresse : avec une lecture puis une écriture, toutes passaient
    const r = await Promise.all(Array.from({ length: 20 }, () => appel({ mail: 'lea@exemple.fr' })));
    const codes = r.map(x => x.statusCode);
    expect(codes.filter(c => c === 200)).toHaveLength(fn.MAX);
    expect(codes.filter(c => c === 429)).toHaveLength(20 - fn.MAX);
    expect(r.find(x => x.statusCode === 429).corps).toEqual({ erreur: 'trop' });
    expect(brevo()).toHaveLength(fn.MAX);
    expect(vers('/accounts:sendOobCode')).toHaveLength(fn.MAX);   // pas de lien fabriqué pour rien
    // une autre adresse a son propre compteur
    g.users.push({ localId: 'u2', email: 'tom@exemple.fr', displayName: 'Tom' });
    expect((await appel({ mail: 'tom@exemple.fr' })).statusCode).toBe(200);
  });

  test('les compteurs : une fiche par adresse et par heure (sans l\'adresse en clair), une par jour, +1 d\'un seul coup', async () => {
    await appel({ mail: 'lea@exemple.fr' });
    const c = vers(':commit').map(x => x.corps.writes);
    expect(c).toHaveLength(2);   // l'adresse d'abord, puis le jour
    expect(c.map(w => w.length)).toEqual([1, 1]);
    const [w0, w1] = c.map(w => w[0]);
    expect(w0.update.name).toMatch(/^projects\/djingo-1e1f4\/databases\/\(default\)\/documents\/limites\/a-[0-9a-f]{32}-\d{10}$/);
    expect(w1.update.name).toMatch(/^projects\/djingo-1e1f4\/databases\/\(default\)\/documents\/limites\/jour-\d{4}-\d{2}-\d{2}$/);
    for (const x of [w0, w1]) {
      expect(x.updateTransforms).toEqual([{ fieldPath: 'n', increment: { integerValue: '1' } }]);
      expect(x.updateMask).toEqual({ fieldPaths: ['fin'] });
      expect(x.update.fields.fin.timestampValue).toMatch(/^\d{4}-/);
      expect(JSON.stringify(x)).not.toContain('lea');
    }
    // même adresse, même heure : même fiche ; heure suivante ou autre adresse : une autre
    const nom = (m, d) => fn.fiches(m, new Date(d)).adresse;
    expect(nom('lea@exemple.fr', '2026-11-10T21:00:01Z')).toBe(nom('lea@exemple.fr', '2026-11-10T21:59:59Z'));
    expect(nom('lea@exemple.fr', '2026-11-10T21:59:59Z')).not.toBe(nom('lea@exemple.fr', '2026-11-10T22:00:00Z'));
    expect(nom('lea@exemple.fr', '2026-11-10T21:00:00Z')).not.toBe(nom('tom@exemple.fr', '2026-11-10T21:00:00Z'));
    expect(fn.fiches('lea@exemple.fr', new Date('2026-11-10T23:30:00Z')).jour).toMatch(/jour-2026-11-10$/);
  });

  test('une demande refusée (429) ne compte pas dans la journée : personne ne peut couper Brevo pour les autres (gardien)', async () => {
    const r = await Promise.all(Array.from({ length: 30 }, () => appel({ mail: 'lea@exemple.fr' })));
    expect(r.filter(x => x.statusCode === 200)).toHaveLength(fn.MAX);
    expect(g.fiches[fn.fiches('lea@exemple.fr').jour]).toBe(fn.MAX);
  });

  test(`au-delà de ${fn.PLAFOND} mails par jour pour tout le site : 503, et le site repasse par Firebase`, async () => {
    const jour = fn.fiches('x@exemple.fr').jour;
    g.fiches[jour] = fn.PLAFOND;
    const r = await appel({ mail: 'lea@exemple.fr' });
    expect(r.statusCode).toBe(503); expect(r.corps).toEqual({ erreur: 'plafond' });
    expect(brevo()).toEqual([]); expect(vers('/accounts:sendOobCode')).toEqual([]);
  });

  test('rien de libre n\'arrive dans le mail : le prénom ne garde que des lettres', async () => {
    for (const [nom, salut] of [['Jean-Pierre', 'Salut Jean-Pierre !'], ['Léa <b>', 'Salut !'], ['Va sur arnaque.com', 'Salut !'], [undefined, 'Salut !'], ['Nathan2', 'Salut !']]) {
      g.appels = []; g.fiches = {}; g.users[0].displayName = nom;
      await appel({ mail: 'lea@exemple.fr' });
      expect(brevo()[0].corps.textContent.split('\n')[0]).toBe(salut);
      expect(brevo()[0].corps.htmlContent).not.toContain('<b>');
    }
  });

  test('Google ou Brevo en panne : 502, et le site repassera par Firebase', async () => {
    for (const panne of ['lookup', 'commit', 'oob', 'brevo']) {
      g.appels = []; g.fiches = {}; g[panne] = 500;
      expect((await appel({ mail: 'lea@exemple.fr' })).statusCode).toBe(502);
      g[panne] = panne === 'brevo' ? 201 : 200;
    }
    // Firestore répond sans les totaux (par exemple sans le droit d'écrire) : rien ne part par Brevo
    g.appels = []; g.commitVide = true;
    expect((await appel({ mail: 'lea@exemple.fr' })).statusCode).toBe(502);
    expect(brevo()).toEqual([]); g.commitVide = false;
    fn.jetonAcces = async () => { throw new Error('refusé'); };
    expect((await appel({ mail: 'lea@exemple.fr' })).statusCode).toBe(502);
    global.fetch = async () => { throw new Error('réseau'); };
    fn.jetonAcces = async () => 'jeton-google';
    expect((await appel({ mail: 'lea@exemple.fr' })).statusCode).toBe(502);
  });

  test('le jeton d\'accès de Google : signé avec la clé du compte de service, gardé entre deux appels', async () => {
    const recus = [];
    global.fetch = async (url, o) => { recus.push({ url, corps: o.body }); return { ok: true, status: 200, json: async () => ({ access_token: 'acces-1', expires_in: 3600 }) }; };
    const c = { email: COMPTE.client_email, cle: CLE_PEM };
    expect(await vraiJeton(c)).toBe('acces-1');
    expect(await vraiJeton(c)).toBe('acces-1');
    expect(recus).toHaveLength(1);
    expect(recus[0].url).toBe('https://oauth2.googleapis.com/token');
    const p = new URLSearchParams(recus[0].corps);
    expect(p.get('grant_type')).toBe('urn:ietf:params:oauth:grant-type:jwt-bearer');
    const [h, c64, sig] = p.get('assertion').split('.');
    expect(crypto.createVerify('RSA-SHA256').update(h + '.' + c64).verify(publicKey, Buffer.from(sig, 'base64url'))).toBe(true);
    const contenu = JSON.parse(Buffer.from(c64, 'base64url').toString('utf8'));
    expect(contenu).toMatchObject({ iss: COMPTE.client_email, aud: 'https://oauth2.googleapis.com/token' });
    expect(contenu.scope).toContain('https://www.googleapis.com/auth/identitytoolkit');
    expect(contenu.exp - contenu.iat).toBe(3600);
  });

  test('la clé collée dans Vercel : le fichier JSON tel quel, encodé en base64, ou avec des « \\n » écrits en toutes lettres', async () => {
    let vue = null;
    fn.jetonAcces = async c => { vue = c; return 'jeton-google'; };
    for (const v of [JSON.stringify(COMPTE), Buffer.from(JSON.stringify(COMPTE)).toString('base64'),
      JSON.stringify(Object.assign({}, COMPTE, { private_key: CLE_PEM.replace(/\n/g, '\\n') }))]) {
      process.env.FIREBASE_COMPTE = v; vue = null;
      expect((await appel({ mail: 'lea@exemple.fr' })).statusCode).toBe(200);
      expect(vue.email).toBe(COMPTE.client_email);
      expect(vue.cle).toBe(CLE_PEM);
    }
  });

  test('si Firebase change la forme de son lien, on garde le sien tel quel (jamais un lien vide ou douteux)', async () => {
    expect(fn.lienDirect('https://exemple.firebaseapp.com/__/auth/action?mode=resetPassword&oobCode=x&apiKey=y', 'https://djingood.fr/')).toBe('https://exemple.firebaseapp.com/__/auth/action?mode=resetPassword&oobCode=x&apiKey=y');
    expect(fn.lienDirect('javascript:alert(1)', 'https://djingood.fr/')).toBe('');
    expect(fn.lienDirect(undefined, 'https://djingood.fr/')).toBe('');
  });

  test('le site reconnaît le lien direct comme un lien de connexion (même forme que celui où Firebase ramène)', async ({ page }) => {
    // stats.js retire le code de l'adresse avant Umami, et compte.js le termine : le lien direct doit passer par là
    const erreurs = await ouvrir(page, { onglet: 'accueil', avant: FAUX });
    await page.goto('/index.html?apiKey=AIza-essai&oobCode=CODE-123&mode=signIn&lang=fr');
    expect(await page.evaluate(() => [/oobCode=CODE-123/.test(LIEN_CONNEXION), location.search, cptLienVu])).toEqual([true, '', true]);
    // ouvert sur un autre appareil que celui qui l'a demandé : la fenêtre du compte demande l'adresse (sécurité de Firebase)
    await expect(page.locator('#compte')).toBeVisible();
    expect(erreurs).toEqual([]); await sansBandeau(page);
  });
});
