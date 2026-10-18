// Le compte DJingo (lot 34) : se connecter avec Google, la progression qui suit le joueur.
// Firebase n'est jamais appelé pour de vrai : un faux service est posé AVANT le chargement de la page.
// Le site ne charge ses scripts que si `window.firebase` n'existe pas encore, donc il prend le faux
// et tout le reste du chemin (connexion, lecture, écriture, rechargement) est bien celui du vrai code.
const { test, expect } = require('@playwright/test');
const { ouvrir, sansBandeau } = require('./outils');

// Le faux Firebase. La « base » et la session vivent dans sessionStorage pour survivre au rechargement
// que le site fait quand il reprend la progression du compte.
const FAUX = `
window.DJINGO_FIREBASE = { apiKey: 'faux', authDomain: 'faux.firebaseapp.com', projectId: 'faux', appId: 'faux' };
(() => {
  const BASE = '__faux_base', SESS = '__faux_user';
  const lire = () => { try { return JSON.parse(sessionStorage.getItem(BASE) || '{}'); } catch (e) { return {}; } };
  const ecrire = o => { try { sessionStorage.setItem(BASE, JSON.stringify(o)); } catch (e) {} };
  let user = null; try { user = JSON.parse(sessionStorage.getItem(SESS) || 'null'); } catch (e) {}
  const ecoute = [], prevenir = () => ecoute.forEach(f => { try { f(user); } catch (e) {} });
  const auth = {
    onAuthStateChanged(f){ ecoute.push(f); Promise.resolve().then(() => f(user)); },
    signInWithPopup(){
      if (window.__refus) return Promise.reject(Object.assign(new Error('non'), { code: window.__refus }));
      user = { uid: window.__uid || 'u1', displayName: 'Nathan Tauvel' };
      try { sessionStorage.setItem(SESS, JSON.stringify(user)); } catch (e) {}
      prevenir(); return Promise.resolve({ user });
    },
    signOut(){ user = null; try { sessionStorage.removeItem(SESS); } catch (e) {} prevenir(); return Promise.resolve(); }
  };
  const authFn = () => auth; authFn.GoogleAuthProvider = function (){};
  const db = { collection: () => ({ doc: id => ({
    get: () => { if (window.__horsLigne) return Promise.reject(Object.assign(new Error('hors ligne'), { code: 'unavailable' })); const b = lire(); return Promise.resolve({ exists: !!b[id], data: () => b[id] }); },
    set: d => { if (window.__horsLigne) return new Promise(() => {}); const b = lire(); b[id] = d; ecrire(b); window.__envois = (window.__envois || 0) + 1; return Promise.resolve(); },
    delete: () => { if (window.__horsLigne) return new Promise(() => {}); const b = lire(); delete b[id]; ecrire(b); window.__efface = true; return Promise.resolve(); }
  }) }) };
  window.firebase = { apps: [], initializeApp(){ this.apps.push({}); }, auth: authFn, firestore: () => db };
})();`;

// Pose une progression dans la fausse base, pour l'identifiant donné
const dansLaBase = (uid, donnees, maj = 1) => `
  (() => { let b = {}; try { b = JSON.parse(sessionStorage.getItem('__faux_base') || '{}'); } catch (e) {}
    b['${uid}'] = { v: 1, prenom: 'Nathan', maj: ${maj}, donnees: ${JSON.stringify(donnees)} };
    try { sessionStorage.setItem('__faux_base', JSON.stringify(b)); } catch (e) {} })();`;

// Session Google déjà ouverte sur cet appareil : à mettre AVANT le faux Firebase, qui la lit à son démarrage
const dejaConnecte = (uid = 'u1') => `try { sessionStorage.setItem('__faux_user', JSON.stringify({ uid: '${uid}', displayName: 'Nathan Tauvel' })); } catch (e) {}`;
// Ce que cet appareil retient de son dernier enregistrement
const marque = (maj, sale = false) => JSON.stringify({ uid: 'u1', prenom: 'Nathan', maj, sale });
// Compte les chargements de la page, pour attraper un rechargement en boucle
const COMPTEUR = `try { sessionStorage.setItem('__chargements', String((+sessionStorage.getItem('__chargements') || 0) + 1)); } catch (e) {}`;
const chargements = page => page.evaluate(() => +sessionStorage.getItem('__chargements') || 0);
// Un navigateur qui n'arrive pas à retenir ce qu'on sait du compte (stockage plein ou refusé pour cette clé)
const SANS_MEMOIRE = `(() => { const vrai = Storage.prototype.setItem;
  Storage.prototype.setItem = function (k, v){ if (k === 'coach-compte') return; return vrai.call(this, k, v); }; })();`;

const base = page => page.evaluate(() => { try { return JSON.parse(sessionStorage.getItem('__faux_base') || '{}'); } catch (e) { return {}; } });
const seConnecter = async page => { await page.locator('#cptBtn').click(); await page.locator('#cptIn').click(); };

// Le site a maintenant sa vraie configuration Firebase. Ces deux tests gardent le cas « pas de configuration »,
// qui doit rester sans effet sur le reste du site : on la vide explicitement.
const SANS_CFG = 'window.DJINGO_FIREBASE = {};';

test.describe('Sans configuration', () => {
  test('le bouton reste caché et le site marche comme avant', async ({ page }) => {
    const err = await ouvrir(page, { avant: SANS_CFG });
    await expect(page.locator('#cptBtn')).toBeHidden();
    // Aucun script Firebase n'est allé chercher quoi que ce soit
    expect(await page.evaluate(() => [...document.querySelectorAll('script')].some(s => s.src.includes('firebasejs')))).toBe(false);
    await sansBandeau(page);
    expect(err).toEqual([]);
  });

  test('la progression s\'enregistre toujours normalement', async ({ page }) => {
    await ouvrir(page, { avant: SANS_CFG });
    await page.evaluate(() => localStorage.setItem('coach-chapitre', '2'));
    expect(await page.evaluate(() => localStorage.getItem('coach-chapitre'))).toBe('2');
  });
});

test.describe('La fenêtre du compte', () => {
  test('le bouton apparaît et ouvre la fenêtre ; Échap la referme', async ({ page }) => {
    const err = await ouvrir(page, { avant: FAUX });
    await expect(page.locator('#cptBtn')).toBeVisible();
    await expect(page.locator('#cptBtn')).toHaveText('Se connecter');
    await page.locator('#cptBtn').click();
    await expect(page.locator('#compte')).toBeVisible();
    await expect(page.locator('#cptEtatTxt')).toContainText('reste sur cet ordinateur');
    await page.keyboard.press('Escape');
    await expect(page.locator('#compte')).toBeHidden();
    expect(err).toEqual([]);
  });
});

test.describe('La première connexion', () => {
  test('compte neuf : la progression de cet ordinateur part sur le compte', async ({ page }) => {
    const err = await ouvrir(page, { avant: FAUX, stockage: { 'coach-lecons': '{"0":3,"1":2}', 'coach-parcours': 'debut' } });
    await seConnecter(page);
    await expect(page.locator('#cptMsg')).toContainText('Ton compte est créé');
    await expect(page.locator('#cptBtn')).toHaveText('Nathan');
    const b = await base(page);
    expect(b.u1.donnees['coach-lecons']).toBe('{"0":3,"1":2}');
    expect(b.u1.prenom).toBe('Nathan');
    expect(err).toEqual([]);
  });

  test('les réglages de la table ne partent jamais en ligne', async ({ page }) => {
    await ouvrir(page, { avant: FAUX, stockage: { 'coach-lecons': '{"0":3}', 'coach-midi-map': '{"faderA":1}', 'coach-table': '{"nom":"Autre"}', 'coach-verif': '{"i":3}', 'coach-collection': '[1,2,3]', 'coach-sons': '0' } });
    await seConnecter(page);
    await expect(page.locator('#cptMsg')).toContainText('Ton compte est créé');
    const d = (await base(page)).u1.donnees;
    for (const k of ['coach-midi-map', 'coach-table', 'coach-verif', 'coach-collection', 'coach-sons', 'coach-compte']) expect(d[k]).toBeUndefined();
    expect(d['coach-lecons']).toBe('{"0":3}');
  });

  test('navigateur neuf : la progression du compte revient, après rechargement', async ({ page }) => {
    const err = await ouvrir(page, { avant: FAUX + dansLaBase('u1', { 'coach-lecons': '{"0":3,"1":3,"2":3}', 'coach-parcours': 'deja', 'coach-badges': '["a","b"]' }) });
    await seConnecter(page);
    // Le site recharge la page : on attend que la progression soit là
    await expect.poll(() => page.evaluate(() => localStorage.getItem('coach-lecons')), { timeout: 15000 }).toBe('{"0":3,"1":3,"2":3}');
    expect(await page.evaluate(() => localStorage.getItem('coach-parcours'))).toBe('deja');
    await expect(page.locator('#cptBtn')).toHaveText('Nathan');
    expect(err).toEqual([]);
  });
});

test.describe('Deux progressions', () => {
  test('le site demande laquelle garder, et respecte le choix « mon compte »', async ({ page }) => {
    await ouvrir(page, { avant: FAUX + dansLaBase('u1', { 'coach-lecons': '{"0":3,"1":3}' }), stockage: { 'coach-lecons': '{"0":1}' } });
    await seConnecter(page);
    await expect(page.locator('#cptChoix')).toBeVisible();
    await expect(page.locator('#cptChoixTxt')).toContainText('6 étoiles');
    await expect(page.locator('#cptChoixTxt')).toContainText('1 étoile');
    await page.locator('#cptGardeCompte').click();
    await expect.poll(() => page.evaluate(() => localStorage.getItem('coach-lecons')), { timeout: 15000 }).toBe('{"0":3,"1":3}');
  });

  test('« garder celle de cet ordinateur » remplace celle du compte', async ({ page }) => {
    await ouvrir(page, { avant: FAUX + dansLaBase('u1', { 'coach-lecons': '{"0":3,"1":3}' }), stockage: { 'coach-lecons': '{"0":1}' } });
    await seConnecter(page);
    await page.locator('#cptGardeIci').click();
    await expect(page.locator('#cptMsg')).toContainText('cet ordinateur qui est gardée');
    await expect.poll(async () => (await base(page)).u1.donnees['coach-lecons']).toBe('{"0":1}');
    expect(await page.evaluate(() => localStorage.getItem('coach-lecons'))).toBe('{"0":1}');
  });
});

test.describe('Pendant le jeu', () => {
  test('une étoile gagnée part toute seule sur le compte', async ({ page }) => {
    await ouvrir(page, { avant: FAUX, stockage: { 'coach-lecons': '{"0":1}' } });
    await seConnecter(page);
    await expect(page.locator('#cptMsg')).toContainText('Ton compte est créé');
    await page.evaluate(() => localStorage.setItem('coach-lecons', '{"0":3,"1":2}'));
    await expect.poll(async () => (await base(page)).u1.donnees['coach-lecons'], { timeout: 15000 }).toBe('{"0":3,"1":2}');
  });

  test('dix changements d\'affilée ne font pas dix envois', async ({ page }) => {
    await ouvrir(page, { avant: FAUX });
    await seConnecter(page);
    await expect(page.locator('#cptMsg')).toContainText('Ton compte est créé');
    const avant = await page.evaluate(() => window.__envois || 0);
    await page.evaluate(() => { for (let i = 0; i < 10; i++) localStorage.setItem('coach-chapitre', String((i % 3) + 1)); });
    await expect.poll(async () => (await base(page)).u1.donnees['coach-chapitre'], { timeout: 15000 }).toBe('1');
    expect(await page.evaluate(() => window.__envois || 0) - avant).toBe(1);
  });
});

test.describe('Se déconnecter et effacer', () => {
  test('se déconnecter garde la progression sur cet ordinateur', async ({ page }) => {
    await ouvrir(page, { avant: FAUX, stockage: { 'coach-lecons': '{"0":3}' } });
    await seConnecter(page);
    await expect(page.locator('#cptBtn')).toHaveText('Nathan');
    await page.locator('#cptOut').click();
    await expect(page.locator('#cptMsg')).toContainText('reste sur cet ordinateur');
    await expect(page.locator('#cptBtn')).toHaveText('Se connecter');
    expect(await page.evaluate(() => localStorage.getItem('coach-lecons'))).toBe('{"0":3}');
    expect(await page.evaluate(() => localStorage.getItem('coach-compte'))).toBe(null);
  });

  test('« Tout recommencer à zéro » efface aussi le compte', async ({ page }) => {
    await ouvrir(page, { avant: FAUX, stockage: { 'coach-lecons': '{"0":3}' } });
    await seConnecter(page);
    await expect(page.locator('#cptMsg')).toContainText('Ton compte est créé');
    await page.locator('#cptClose').click();
    await page.locator('#avisBtn').click();
    await page.locator('.avreset summary').click();
    await page.locator('#avReset').click();
    await expect.poll(async () => Object.keys(await base(page)).length, { timeout: 15000 }).toBe(0);
    await expect.poll(() => page.evaluate(() => localStorage.getItem('coach-lecons'))).toBe(null);
    await expect(page.locator('#cptBtn')).toHaveText('Se connecter');
  });

  test('la progression du compte n\'est pas redéplacée au nouvel ordre du chapitre 1', async ({ page }) => {
    // `coach-ordre` ne voyage pas : un paquet sans lui ne doit pas faire remigrer les étoiles (lot 26)
    await ouvrir(page, { avant: FAUX + dansLaBase('u1', { 'coach-lecons': '{"0":3,"5":3}' }) });
    await seConnecter(page);
    await expect.poll(() => page.evaluate(() => localStorage.getItem('coach-lecons')), { timeout: 15000 }).toBe('{"0":3,"5":3}');
    expect(await page.evaluate(() => localStorage.getItem('coach-ordre'))).toBe('2');
    expect(await page.evaluate(() => (JSON.parse(sessionStorage.getItem('__faux_base')).u1.donnees)['coach-ordre'])).toBeUndefined();
  });
});

test.describe('Quand ça se passe mal', () => {
  test('une connexion annulée le dit simplement, sans bandeau d\'erreur', async ({ page }) => {
    const err = await ouvrir(page, { avant: FAUX + 'window.__refus = "auth/popup-closed-by-user";' });
    await seConnecter(page);
    await expect(page.locator('#cptMsg')).toHaveText('Connexion annulée.');
    await expect(page.locator('#cptBtn')).toHaveText('Se connecter');
    await sansBandeau(page);
    expect(err).toEqual([]);
  });

  test('un site non autorisé explique quoi faire', async ({ page }) => {
    await ouvrir(page, { avant: FAUX + 'window.__refus = "auth/unauthorized-domain";' });
    await seConnecter(page);
    await expect(page.locator('#cptMsg')).toContainText('Authorized domains');
  });
});

/* Le cas trouvé par le gardien : un appareil qui reprend sa session ne doit jamais renvoyer sa vieille
   progression par-dessus celle du compte. Rien n'est envoyé tant que les deux n'ont pas été comparées. */
test.describe('Un deuxième appareil', () => {
  test('reprend la progression du compte quand elle a avancé ailleurs, sans rien écraser', async ({ page }) => {
    await ouvrir(page, {
      avant: dejaConnecte() + FAUX + dansLaBase('u1', { 'coach-lecons': '{"0":3,"1":3,"2":3}' }, 2000),
      stockage: { 'coach-compte': marque(1000), 'coach-lecons': '{"0":1}' }
    });
    await expect.poll(() => page.evaluate(() => localStorage.getItem('coach-lecons')), { timeout: 15000 }).toBe('{"0":3,"1":3,"2":3}');
    // la progression du compte n'a pas été remplacée par celle, plus vieille, de cet appareil
    expect((await base(page)).u1.donnees['coach-lecons']).toBe('{"0":3,"1":3,"2":3}');
    expect(await page.evaluate(() => window.__envois || 0)).toBe(0);
  });

  test('ne renvoie rien et ne recharge pas quand personne n\'a avancé ailleurs', async ({ page }) => {
    const err = await ouvrir(page, {
      avant: dejaConnecte() + FAUX + dansLaBase('u1', { 'coach-lecons': '{"0":3}' }, 2000),
      stockage: { 'coach-compte': marque(2000), 'coach-lecons': '{"0":3}' }
    });
    await expect(page.locator('#cptBtn')).toHaveText('Nathan');
    await page.waitForTimeout(4000);
    expect(await page.evaluate(() => window.__envois || 0)).toBe(0);
    expect(await page.evaluate(() => localStorage.getItem('coach-lecons'))).toBe('{"0":3}');
    expect(err).toEqual([]);
  });

  test('demande quoi garder quand les deux ont avancé, et n\'enregistre rien avant la réponse', async ({ page }) => {
    await ouvrir(page, {
      avant: dejaConnecte() + FAUX + dansLaBase('u1', { 'coach-lecons': '{"0":3,"1":3,"2":3}' }, 2000),
      stockage: { 'coach-compte': marque(1000, true), 'coach-lecons': '{"0":1}' }
    });
    // la pastille le signale sans ouvrir la fenêtre toute seule
    await expect(page.locator('#cptBtn')).toHaveText('Nathan ·');
    await page.waitForTimeout(4000);
    expect(await page.evaluate(() => window.__envois || 0)).toBe(0);
    expect((await base(page)).u1.donnees['coach-lecons']).toBe('{"0":3,"1":3,"2":3}');
    await page.locator('#cptBtn').click();
    await expect(page.locator('#cptChoix')).toBeVisible();
    await expect(page.locator('#cptEtatTxt')).toContainText('Choisis quelle progression garder');
    await page.locator('#cptGardeIci').click();
    await expect.poll(async () => (await base(page)).u1.donnees['coach-lecons'], { timeout: 15000 }).toBe('{"0":1}');
  });
});

test.describe('Sans connexion internet', () => {
  test('« Tout recommencer à zéro » renonce et le dit, au lieu de promettre à vide', async ({ page }) => {
    await ouvrir(page, { avant: dejaConnecte() + FAUX + dansLaBase('u1', { 'coach-lecons': '{"0":3}' }, 2000), stockage: { 'coach-compte': marque(2000), 'coach-lecons': '{"0":3}' } });
    await expect(page.locator('#cptBtn')).toHaveText('Nathan');
    await page.evaluate(() => { window.__horsLigne = true; });
    await page.locator('#avisBtn').click();
    await page.locator('.avreset summary').click();
    await page.locator('#avReset').click();
    // Firestore ne répond jamais : au bout de 3 s le site renonce, sans rien effacer ici non plus
    await expect(page.locator('#avMsg')).toContainText('rien n’a été effacé', { timeout: 20000 });
    expect(await page.evaluate(() => localStorage.getItem('coach-lecons'))).toBe('{"0":3}');
    expect((await base(page)).u1.donnees['coach-lecons']).toBe('{"0":3}');
  });

  test('se déconnecter marche quand même', async ({ page }) => {
    await ouvrir(page, { avant: dejaConnecte() + FAUX + dansLaBase('u1', { 'coach-lecons': '{"0":3}' }, 2000), stockage: { 'coach-compte': marque(2000), 'coach-lecons': '{"0":3}' } });
    await expect(page.locator('#cptBtn')).toHaveText('Nathan');
    await page.evaluate(() => { window.__horsLigne = true; });
    await page.locator('#cptBtn').click();
    await page.locator('#cptOut').click();
    await expect(page.locator('#cptBtn')).toHaveText('Se connecter', { timeout: 20000 });
    await expect(page.locator('#cptOut')).toBeHidden();
  });

  test('la fenêtre dit que l\'enregistrement attend le réseau', async ({ page }) => {
    await ouvrir(page, { avant: FAUX, stockage: { 'coach-lecons': '{"0":3}' } });
    await seConnecter(page);
    await expect(page.locator('#cptMsg')).toContainText('Ton compte est créé');
    await page.evaluate(() => { window.__horsLigne = true; localStorage.setItem('coach-lecons', '{"0":3,"1":3}'); });
    await expect(page.locator('#cptEtatTxt')).toContainText('dès que tu seras en ligne', { timeout: 20000 });
  });
});

/* Le deuxième défaut trouvé par le gardien : la page qui se recharge en boucle (il en avait mesuré 321 en
   8 secondes) quand le site n'arrive pas à retenir où il en est, ou quand le document n'a pas de `maj` utilisable. */
test.describe('Jamais de rechargement en boucle', () => {
  test('quand ce navigateur n\'arrive pas à retenir le compte, la page ne se recharge pas sans fin', async ({ page }) => {
    await ouvrir(page, {
      // la marque est posée au départ (avant le blocage), puis le navigateur refuse de la mettre à jour
      avant: COMPTEUR + SANS_MEMOIRE + dejaConnecte() + FAUX + dansLaBase('u1', { 'coach-lecons': '{"0":3,"1":3,"2":3}' }, 2000),
      stockage: { 'coach-compte': marque(1000), 'coach-lecons': '{"0":1}' }
    });
    await page.waitForTimeout(6000);
    expect(await chargements(page)).toBeLessThanOrEqual(2);
    // la progression du compte est bien arrivée, et le site dit quoi faire
    expect(await page.evaluate(() => localStorage.getItem('coach-lecons'))).toBe('{"0":3,"1":3,"2":3}');
    await page.locator('#cptBtn').click();
    await expect(page.locator('#cptEtatTxt')).toContainText('recharge la page toi-même');
  });

  test('un document sans `maj` utilisable ne fait pas tourner le site en rond', async ({ page }) => {
    const err = await ouvrir(page, {
      avant: COMPTEUR + dejaConnecte() + FAUX + dansLaBase('u1', { 'coach-lecons': '{"0":3,"1":3}' }, 0),
      stockage: { 'coach-compte': marque(0), 'coach-lecons': '{"0":1}' }
    });
    await page.waitForTimeout(6000);
    expect(await chargements(page)).toBeLessThanOrEqual(3);
    await sansBandeau(page);
    expect(err).toEqual([]);
  });

  test('un document qui ne contient que des réglages est remplacé, pas repris en boucle', async ({ page }) => {
    await ouvrir(page, {
      avant: COMPTEUR + dejaConnecte() + FAUX + dansLaBase('u1', { 'coach-style': 'house', 'coach-chapitre': '1' }, 0),
      stockage: { 'coach-compte': marque(0), 'coach-lecons': '{"0":2}' }
    });
    await expect.poll(async () => (await base(page)).u1.donnees['coach-lecons'], { timeout: 15000 }).toBe('{"0":2}');
    expect(await chargements(page)).toBeLessThanOrEqual(2);
  });
});

test.describe('Pas de réseau au chargement', () => {
  test('le site le dit, n\'envoie rien, et repart quand la connexion revient', async ({ page }) => {
    await ouvrir(page, {
      avant: dejaConnecte() + FAUX + 'window.__horsLigne = true;' + dansLaBase('u1', { 'coach-lecons': '{"0":3}' }, 2000),
      stockage: { 'coach-compte': marque(2000, true), 'coach-lecons': '{"0":3,"1":2}' }
    });
    await expect(page.locator('#cptBtn')).toHaveText('Nathan');
    await page.locator('#cptBtn').click();
    await expect(page.locator('#cptEtatTxt')).toContainText('Pas de connexion internet', { timeout: 15000 });
    // rien n'est parti : la progression du compte est intacte
    expect((await base(page)).u1.donnees['coach-lecons']).toBe('{"0":3}');
    // la connexion revient : la comparaison se refait, puis l'envoi part
    await page.evaluate(() => { window.__horsLigne = false; window.dispatchEvent(new Event('online')); });
    await expect.poll(async () => (await base(page)).u1.donnees['coach-lecons'], { timeout: 15000 }).toBe('{"0":3,"1":2}');
  });
});

/* Le défaut trouvé par le gardien au troisième passage : un appareil tout neuf écrit déjà un parcours,
   les quêtes du jour et un objectif avant la connexion. Le site croyait qu'il avait « une progression » et
   proposait de remplacer celle du compte par du vide — un clic et tout était perdu. */
test.describe('Un appareil tout neuf', () => {
  const NEUF = {
    'coach-parcours': 'debut',
    'coach-quetes': JSON.stringify({ jour: '2026-10-18', ids: ['a', 'b', 'c'], cpt: { parties: 0, demos: 0, reussies: 0, trois: 0 }, ouverts: [], xp: 0 }),
    'coach-objectif': JSON.stringify({ min: 10, jours: {}, faits: [], best: 0 }),
    'coach-entrainement': JSON.stringify({ serie: 0, set: 0 })
  };

  test('reprend la progression du compte sans poser de question', async ({ page }) => {
    const err = await ouvrir(page, {
      avant: FAUX + dansLaBase('u1', { 'coach-lecons': '{"0":3,"1":3,"2":3}', 'coach-badges': '["a","b","c"]' }, 2000),
      stockage: NEUF
    });
    await seConnecter(page);
    await expect.poll(() => page.evaluate(() => localStorage.getItem('coach-lecons')), { timeout: 15000 }).toBe('{"0":3,"1":3,"2":3}');
    await expect(page.locator('#cptChoix')).toBeHidden();
    expect(err).toEqual([]);
  });

  test('ne compte pas un parcours, des quêtes à zéro ou un objectif comme de la progression', async ({ page }) => {
    await ouvrir(page, { avant: FAUX, stockage: NEUF });
    expect(await page.evaluate(() => cptPoids(cptDonnees()))).toBe(0);
    // mais un coffre ouvert, un jour d'objectif atteint ou une étoile comptent
    expect(await page.evaluate(() => cptPoids({ 'coach-quetes': JSON.stringify({ ouverts: ['a'], cpt: {}, xp: 10 }) }))).toBeGreaterThan(0);
    expect(await page.evaluate(() => cptPoids({ 'coach-objectif': JSON.stringify({ faits: ['2026-10-17'] }) }))).toBeGreaterThan(0);
    expect(await page.evaluate(() => cptPoids({ 'coach-lecons': '{"0":1}' }))).toBe(1);
    expect(await page.evaluate(() => cptPoids({ 'coach-missions': JSON.stringify({ pair: 'x', done: { 0: 1, 1: 1 }, total: 0 }) }))).toBe(2);
    // des paires validées comptent même sans mission cochée, sans dépendre du badge « Pour de vrai »
    expect(await page.evaluate(() => cptPoids({ 'coach-missions': JSON.stringify({ pair: '', done: {}, total: 3 }) }))).toBe(1);
    // des XP de coffre gardés d'un jour à l'autre comptent aussi
    expect(await page.evaluate(() => cptPoids({ 'coach-quetes': JSON.stringify({ ouverts: [], cpt: {}, xp: 10 }) }))).toBe(1);
  });

  test('le poids rend toujours un nombre, même sur des données abîmées ou rien du tout', async ({ page }) => {
    await ouvrir(page, { avant: FAUX });
    const n = await page.evaluate(() => [null, undefined, 'texte', 42, [],
      { 'coach-lecons': '{oops' }, { 'coach-quetes': '[1,2]' }, { 'coach-missions': 'null' },
      { 'coach-objectif': JSON.stringify({ faits: 'non' }) }, { 'coach-lecons': JSON.stringify({ 0: -5 }) }
    ].map(d => cptPoids(d)));
    expect(n.every(x => typeof x === 'number' && x >= 0 && Number.isFinite(x))).toBe(true);
  });

  test('un compte vide ne remplace jamais une vraie progression', async ({ page }) => {
    await ouvrir(page, {
      avant: FAUX + dansLaBase('u1', NEUF, 2000),
      stockage: { 'coach-lecons': '{"0":3,"1":3}' }
    });
    await seConnecter(page);
    await expect(page.locator('#cptMsg')).toContainText('Ton compte est créé');
    await expect(page.locator('#cptChoix')).toBeHidden();
    expect(await page.evaluate(() => localStorage.getItem('coach-lecons'))).toBe('{"0":3,"1":3}');
    await expect.poll(async () => (await base(page)).u1.donnees['coach-lecons']).toBe('{"0":3,"1":3}');
  });
});
