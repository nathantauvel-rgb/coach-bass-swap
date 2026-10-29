// Le faux Firebase des tests (lot 34), partagé depuis le lot 54 entre compte.spec.js et mails.spec.js.
// Firebase n'est jamais appelé pour de vrai : ce faux service est posé AVANT le chargement de la page.
// Le site ne charge ses scripts que si `window.firebase` n'existe pas encore, donc il prend le faux
// et tout le reste du chemin (connexion, lecture, écriture, rechargement) est bien celui du vrai code.
// Le faux Firebase. La « base » et la session vivent dans sessionStorage pour survivre au rechargement
// que le site fait quand il reprend la progression du compte.
const FAUX = `
window.DJINGO_FIREBASE = { apiKey: 'faux', authDomain: 'faux.firebaseapp.com', projectId: 'faux', appId: 'faux' };
(() => {
  const BASE = '__faux_base', SESS = '__faux_user';
  const lire = () => { try { return JSON.parse(sessionStorage.getItem(BASE) || '{}'); } catch (e) { return {}; } };
  const ecrire = o => { try { sessionStorage.setItem(BASE, JSON.stringify(o)); } catch (e) {} };
  const GENS = '__faux_gens';
  // les adresses dont le lien de confirmation a été « cliqué » (lienClique dans les tests)
  const verifies = () => { try { return JSON.parse(sessionStorage.getItem('__faux_verifies') || '[]'); } catch (e) { return []; } };
  const gens = () => { try { return JSON.parse(sessionStorage.getItem(GENS) || '{}'); } catch (e) { return {}; } };
  const gensEcrire = o => { try { sessionStorage.setItem(GENS, JSON.stringify(o)); } catch (e) {} };
  let user = null; try { user = JSON.parse(sessionStorage.getItem(SESS) || 'null'); } catch (e) {}
  const ecoute = [], prevenir = () => ecoute.forEach(f => { try { f(user); } catch (e) {} });
  const auth = {
    onAuthStateChanged(f){ ecoute.push(f); Promise.resolve().then(() => f(user)); },
    signInWithPopup(){
      if (window.__refus) return Promise.reject(Object.assign(new Error('non'), { code: window.__refus }));
      user = { uid: window.__uid || 'u1', displayName: 'Nathan Tauvel', email: 'nathan@exemple.fr', emailVerified: true };
      try { sessionStorage.setItem(SESS, JSON.stringify(user)); } catch (e) {}
      prevenir(); return Promise.resolve({ user });
    },
    signOut(){ user = null; try { sessionStorage.removeItem(SESS); } catch (e) {} prevenir(); return Promise.resolve(); },
    createUserWithEmailAndPassword(mail, mdp){
      const g = gens();
      if (g[mail]) return Promise.reject({ code: 'auth/email-already-in-use' });
      if (String(mdp).length < 6) return Promise.reject({ code: 'auth/weak-password' });
      if (window.__refus) return Promise.reject({ code: window.__refus });
      g[mail] = { uid: 'm' + (Object.keys(g).length + 1), mdp, nom: '' }; gensEcrire(g);
      user = { uid: g[mail].uid, displayName: null, email: mail, emailVerified: false };
      try { sessionStorage.setItem(SESS, JSON.stringify(user)); } catch (e) {}
      prevenir();
      return Promise.resolve({ user: Object.assign({}, user, { updateProfile(p){ const h = gens(); h[mail].nom = p.displayName; gensEcrire(h); user.displayName = p.displayName; try { sessionStorage.setItem(SESS, JSON.stringify(user)); } catch (e) {} return Promise.resolve(); } }) });
    },
    signInWithEmailAndPassword(mail, mdp){
      const g = gens();
      if (!g[mail]) return Promise.reject({ code: 'auth/user-not-found' });
      if (g[mail].mdp !== mdp) return Promise.reject({ code: 'auth/wrong-password' });
      user = { uid: g[mail].uid, displayName: g[mail].nom || null, email: mail, emailVerified: verifies().includes(mail) };
      try { sessionStorage.setItem(SESS, JSON.stringify(user)); } catch (e) {}
      prevenir(); return Promise.resolve({ user });
    },
    sendPasswordResetEmail(mail){
      if (!gens()[mail]) return Promise.reject({ code: 'auth/user-not-found' });
      window.__lienEnvoye = mail; return Promise.resolve();
    }
  };
  auth.languageCode = null;
  // Le compte connecté et son jeton, que le site envoie à /api/mails (lot 54)
  Object.defineProperty(auth, 'currentUser', { get: () => user ? Object.assign({}, user, {
    getIdToken: () => Promise.resolve('jeton-' + user.uid),
    sendEmailVerification: () => { window.__verifEnvois = (window.__verifEnvois || 0) + 1; return Promise.resolve(); },
    reload: () => { if (user && user.email && verifies().includes(user.email)){ user.emailVerified = true; try { sessionStorage.setItem(SESS, JSON.stringify(user)); } catch (e) {} } return Promise.resolve(); }
  }) : null });
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
const dejaConnecte = (uid = 'u1') => `try { sessionStorage.setItem('__faux_user', JSON.stringify({ uid: '${uid}', displayName: 'Nathan Tauvel', email: 'nathan@exemple.fr', emailVerified: true })); } catch (e) {}`;
const base = page => page.evaluate(() => { try { return JSON.parse(sessionStorage.getItem('__faux_base') || '{}'); } catch (e) { return {}; } });
// La fenêtre peut déjà être ouverte (après une déconnexion, par exemple) : le bouton de l'en-tête est
// alors caché derrière elle, et cliquer dessus attendrait pour rien.
const ouvrirCompte = async page => { if (await page.locator('#compte').isHidden()) await page.locator('#cptBtn').click(); };
// Google est sur le premier écran de la fenêtre (lot 54)
const seConnecter = async page => { await ouvrirCompte(page); await page.locator('#cptIn').click(); };
// Après une connexion faite dans la page, la fenêtre se ferme toute seule (lot 54) : on attend, puis on la rouvre
const rouvrirCompte = async page => { await page.locator('#compte').waitFor({ state: 'hidden', timeout: 15000 }); await page.locator('#cptBtn').click(); };
// Créer un compte avec une adresse e-mail
const creerCompte = async (page, prenom, mail, mdp) => {
  await ouvrirCompte(page);
  await page.locator('#cptVersCreer').click();
  await page.locator('#cptPrenom').fill(prenom);
  await page.locator('#cptMail').fill(mail);
  await page.locator('#cptMdp').fill(mdp);
  await page.locator('#cptGo').click();
};

// Le joueur clique le lien de confirmation reçu par mail
const lienClique = (page, mail) => page.evaluate(m => { let v = []; try { v = JSON.parse(sessionStorage.getItem('__faux_verifies') || '[]'); } catch (e) {} v.push(m); sessionStorage.setItem('__faux_verifies', JSON.stringify(v)); }, mail);

module.exports = { lienClique, FAUX, dansLaBase, dejaConnecte, base, ouvrirCompte, rouvrirCompte, seConnecter, creerCompte };
