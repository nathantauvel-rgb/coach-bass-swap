// Lot 46 : statistiques de visite (Umami) et avis envoyés à l'équipe (Firebase).
// Umami et Firebase ne sont jamais appelés pour de vrai : un faux est posé AVANT le chargement de la page. Le site ne charge
// leurs scripts que si `window.umami` / `window.firebase` n'existent pas encore, donc tout le reste du chemin est le vrai.
const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');
const { ouvrir, sansBandeau, jouer } = require('./outils');

const S = o => JSON.stringify(o);
// Le faux Umami : chaque envoi est noté dans window.__stats (remis à zéro à chaque chargement de la page)
const FAUX_UMAMI = `window.__stats = []; window.umami = { track(n, d){ window.__stats.push(d === undefined ? [n] : [n, d]); } };`;
// Le faux Firebase : la collection des avis vit dans sessionStorage, pour survivre au rechargement
const FAUX_FB = `
window.DJINGO_FIREBASE = { apiKey: 'faux', authDomain: 'faux.firebaseapp.com', projectId: 'faux', appId: 'faux' };
(() => {
  const lire = () => { try { return JSON.parse(sessionStorage.getItem('__avis') || '[]'); } catch (e) { return []; } };
  const auth = { onAuthStateChanged(f){ Promise.resolve().then(() => f(null)); } };
  const authFn = () => auth; authFn.GoogleAuthProvider = function (){};
  const db = { collection: nom => ({ add: d => {
    if (window.__horsLigne) return new Promise(() => {});   // hors ligne, Firestore ne répond jamais
    const l = lire(); l.push(Object.assign({ __col: nom }, d)); sessionStorage.setItem('__avis', JSON.stringify(l)); return Promise.resolve({ id: 'a' + l.length }); } }) };
  const fsFn = () => db; fsFn.FieldValue = { serverTimestamp: () => 'HEURE_DU_SERVEUR' };
  window.firebase = { apps: [], initializeApp(){ this.apps.push({}); }, auth: authFn, firestore: fsFn };
})();`;
const envois = page => page.evaluate(() => window.__stats);
const noms = async page => (await envois(page)).map(e => e[0]);
const etapes = page => page.evaluate(() => JSON.parse(localStorage.getItem('coach-stats') || 'null'));
const base = page => page.evaluate(() => JSON.parse(sessionStorage.getItem('__avis') || '[]'));
const journal = page => page.evaluate(() => JSON.parse(localStorage.getItem('coach-journal') || 'null'));
const aujourdhui = () => { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
// « Le bon moment » joué parfaitement (B lancé pile sur la ligne)
async function bonMoment(page) {
  await jouer(page);
  await page.waitForFunction(() => beatNow() >= 31.7, null, { timeout: 60000, polling: 'raf' }); await page.keyboard.press('Space');
  await expect(page.locator('#result')).toBeVisible({ timeout: 60000 });
}
async function ecrireAvis(page, bloque, note) {
  await page.locator('#avisBtn').click();
  await page.locator('#avBloque').fill(bloque);
  await page.locator(`#avNote [data-note="${note}"]`).click();
  await page.locator('#avSave').click();
}

test.describe('Statistiques de visite', () => {
  test('hors du vrai site, rien n\'est chargé ni compté', async ({ page }) => {
    const erreurs = await ouvrir(page, { stockage: { 'coach-journal': S({ jours: ['2020-01-01'] }) } });
    await jouer(page);
    expect(await page.evaluate(() => [!!document.querySelector('script[src*="umami"]'), typeof window.umami, localStorage.getItem('coach-stats')]))
      .toEqual([false, 'undefined', null]);
    expect(erreurs).toEqual([]); await sansBandeau(page);
  });
  test('chaque étape ne part qu\'une fois par navigateur, même après un rechargement', async ({ page }) => {
    const erreurs = await ouvrir(page, { avant: FAUX_UMAMI, stockage: { 'coach-journal': S({ jours: ['2020-01-01'] }) } });
    expect(await noms(page)).toEqual(['revenu']);   // revenu un autre jour
    await jouer(page); await page.locator('#startBtn').click();
    await jouer(page); await page.locator('#startBtn').click();
    expect(await noms(page)).toEqual(['revenu', 'premiere-partie']);
    expect(await etapes(page)).toEqual(['revenu', 'premiere-partie']);
    await page.reload(); await expect(page.locator('.node').first()).toBeVisible();
    await jouer(page);
    expect(await noms(page)).toEqual([]);
    expect(erreurs).toEqual([]); await sansBandeau(page);
  });
  test('un niveau réussi compte la première réussite et son chapitre ; « C\'était clair ? » part avec le niveau', async ({ page }) => {
    test.setTimeout(120000);
    const erreurs = await ouvrir(page, { avant: FAUX_UMAMI });
    await bonMoment(page);
    await expect(page.locator('#rStars span.on')).toHaveCount(3);
    expect(await noms(page)).toEqual(['premiere-partie', 'premiere-reussite', 'chapitre-1']);
    await page.locator('#clairRow [data-clair="bof"]').click();
    await page.locator('#clairRow [data-clair="bof"]').click();   // même réponse : rien de plus
    await page.locator('#clairRow [data-clair="oui"]').click();
    expect((await envois(page)).slice(3)).toEqual([['clair', { niveau: 'Ch. 1 · 1. Le bon moment', reponse: 'bof' }], ['clair', { niveau: 'Ch. 1 · 1. Le bon moment', reponse: 'oui' }]]);
    expect(erreurs).toEqual([]); await sansBandeau(page);
  });
  test('une partie sans réussite ne compte pas de réussite', async ({ page }) => {
    test.setTimeout(150000);
    await ouvrir(page, { avant: FAUX_UMAMI });
    await page.locator('.node').nth(5).click();
    await jouer(page);
    await expect(page.locator('#result')).toBeVisible({ timeout: 90000 });
    expect(await noms(page)).toEqual(['premiere-partie']);
  });
  test('la table branchée part avec son nom', async ({ page }) => {
    const erreurs = await ouvrir(page, { avant: FAUX_UMAMI, midi: { branchee: true } });
    await expect.poll(() => envois(page)).toEqual([['table-branchee', { table: 'Pioneer DDJ-FLX4' }]]);
    await page.evaluate(() => { window.__midi.debrancher(); window.__midi.brancher(); });
    expect(await envois(page)).toHaveLength(1);
    expect(erreurs).toEqual([]);
  });
  test('un navigateur sans MIDI (iPhone, appli TikTok) est compté', async ({ page }) => {
    await ouvrir(page, { avant: FAUX_UMAMI + `Object.defineProperty(navigator, 'requestMIDIAccess', { value: undefined });` });
    await expect.poll(() => noms(page)).toEqual(['sans-midi']);
    await expect(page.locator('#midiPill')).toContainText('Prends Chrome ou Edge');
  });
  test('Premiers pas : passés, ou finis avec le parcours choisi', async ({ page }) => {
    const NOUVEAU = { 'coach-guide-vu': null, 'coach-fiches': null, 'coach-accueil': null };
    await ouvrir(page, { onglet: '', stockage: NOUVEAU, avant: FAUX_UMAMI });
    await page.locator('#ppSkip').click();
    expect(await noms(page)).toEqual(['premiers-pas-passes']);
    await page.evaluate(() => { localStorage.removeItem('coach-accueil'); localStorage.removeItem('coach-stats'); });
    await page.reload(); await expect(page.locator('#pp')).toBeVisible();
    const choix = i => page.locator('#ppOpts .pp-opt').nth(i).click(), suite = () => page.locator('#ppGo').click();
    await suite(); await choix(0); await suite(); await choix(1); await suite(); await choix(1); await suite();
    await expect.poll(() => envois(page)).toContainEqual(['premiers-pas-fin', { parcours: 'debut', table: 'non' }]);
  });
  test('refuser : plus rien ne part, et rien n\'est marqué', async ({ page }) => {
    await ouvrir(page, { avant: FAUX_UMAMI, stockage: { 'umami.disabled': '1', 'coach-journal': S({ jours: ['2020-01-01'] }) } });
    await jouer(page);
    expect(await envois(page)).toEqual([]);
    expect(await etapes(page)).toBeNull();
  });
  test('« Tout recommencer à zéro » garde les étapes déjà comptées', async ({ page }) => {
    await ouvrir(page, { avant: FAUX_UMAMI, stockage: { 'coach-stats': S(['premiere-partie']), 'coach-lecons': S({ 0: 3 }) } });
    await page.locator('#avisBtn').click();
    await page.locator('.avreset summary').click();
    await page.locator('#avReset').click();
    await expect(page.locator('#vHome')).toBeVisible();
    expect(await etapes(page)).toEqual(['premiere-partie']);
    expect(await page.evaluate(() => localStorage.getItem('coach-lecons'))).toBeNull();
  });
  test('une valeur abîmée dans coach-stats ne bloque rien', async ({ page }) => {
    const erreurs = await ouvrir(page, { avant: FAUX_UMAMI, stockage: { 'coach-stats': '{"a":1' } });
    await jouer(page);
    expect(await etapes(page)).toEqual(['premiere-partie']);
    expect(erreurs).toEqual([]); await sansBandeau(page);
  });
});

test.describe('Les avis partent chez l\'équipe', () => {
  test('l\'avis arrive dans la base, avec l\'écran et le navigateur, sans adresse ni prénom', async ({ page }) => {
    const erreurs = await ouvrir(page, { avant: FAUX_FB + FAUX_UMAMI });
    await ecrireAvis(page, 'Le fader', 4);
    await expect(page.locator('#avMsg')).toContainText('bien arrivé');
    const docs = await base(page);
    expect(docs).toHaveLength(1);
    const d = docs[0];
    expect(Object.keys(d).sort()).toEqual(['__col', 'appareil', 'bloque', 'ecran', 'jour', 'note', 'parcours', 'plu', 'quand', 'table', 'v']);
    expect(d).toMatchObject({ __col: 'avis', v: 1, quand: 'HEURE_DU_SERVEUR', jour: aujourdhui(), ecran: 'Apprendre · Le bon moment', note: 4, bloque: 'Le fader', plu: '', table: 'aucune' });
    expect(d.appareil).toMatch(/Chrome/);
    expect((await journal(page)).avis.map(a => a.p)).toEqual([1]);
    expect(await envois(page)).toContainEqual(['avis', { note: 4 }]);
    expect(erreurs).toEqual([]); await sansBandeau(page);
  });
  test('connecté : l\'identifiant du compte part avec l\'avis', async ({ page }) => {
    await ouvrir(page, { avant: FAUX_FB });
    // la connexion préparée à l'avance annonce « personne » : attendre qu'elle soit passée avant de poser le compte
    await page.waitForFunction(() => cptFb && cptFb.auth); await page.waitForTimeout(100);
    await page.evaluate(() => { cpt = { uid: 'u9', prenom: 'Lou' }; });
    await ecrireAvis(page, 'Super', 5);
    await expect(page.locator('#avMsg')).toContainText('bien arrivé');
    const d = (await base(page))[0];
    expect(d.uid).toBe('u9');
    expect(JSON.stringify(d)).not.toContain('Lou');
  });
  test('hors ligne : l\'avis est gardé, puis repart tout seul à la visite suivante', async ({ page }) => {
    test.setTimeout(60000);
    await ouvrir(page, { avant: FAUX_FB });
    await page.evaluate(() => { window.__horsLigne = true; });
    await ecrireAvis(page, 'Pas de réseau', 2);
    await expect(page.locator('#avMsg')).toContainText('Envoi de ton avis');
    await expect(page.locator('#avSave')).toBeDisabled();
    await expect(page.locator('#avMsg')).toContainText('n’a pas pu partir', { timeout: 15000 });
    await expect(page.locator('#avSave')).toBeEnabled();
    expect((await journal(page)).avis.map(a => a.p)).toEqual([0]);
    expect(await base(page)).toEqual([]);
    await page.reload();
    await expect.poll(() => base(page), { timeout: 20000 }).toHaveLength(1);
    expect((await base(page))[0].bloque).toBe('Pas de réseau');
    expect((await journal(page)).avis.map(a => a.p)).toEqual([1]);
  });
  test('un avis écrit avant ce lot ne part jamais (on avait promis « rien n\'est envoyé sans toi »)', async ({ page }) => {
    test.setTimeout(40000);
    await ouvrir(page, { avant: FAUX_FB, stockage: { 'coach-journal': S({ avis: [{ d: '2026-10-01', ecran: 'Accueil', bloque: 'ancien', plu: '', note: 3 }] }) } });
    await page.waitForTimeout(11000);
    expect(await base(page)).toEqual([]);
    expect((await journal(page)).avis).toEqual([{ d: '2026-10-01', ecran: 'Accueil', bloque: 'ancien', plu: '', note: 3 }]);
  });
  test('en local, sans Firebase, l\'avis reste sur l\'ordinateur comme avant', async ({ page }) => {
    const demandes = []; page.on('request', r => demandes.push(r.url()));
    await ouvrir(page);
    await ecrireAvis(page, 'Local', 3);
    await expect(page.locator('#avMsg')).toContainText('Merci, ton avis est enregistré');
    expect((await journal(page)).avis[0].p).toBeUndefined();
    expect(demandes.filter(u => /firestore/.test(u))).toEqual([]);
  });
  test('les règles Firestore acceptent exactement les champs que le site envoie', async () => {
    const regles = fs.readFileSync(path.join(__dirname, '..', 'firestore.rules'), 'utf8');
    const liste = regles.match(/hasOnly\(\[([^\]]+)\]\)/)[1].split(',').map(s => s.trim().replace(/'/g, '')).sort();
    expect(liste).toEqual(['appareil', 'bloque', 'ecran', 'jour', 'note', 'parcours', 'plu', 'quand', 'table', 'uid', 'v']);
    expect(regles).toMatch(/match \/avis\/\{id\} \{\s*allow create: if avisOk\(request\.resource\.data\);\s*\}/);   // créer, jamais relire
  });
});

test.describe('Ce que DJingood garde sur toi', () => {
  test('les fenêtres « Mon avis » et du compte y mènent', async ({ page }) => {
    await ouvrir(page);
    await expect(page.locator('#avis a[href="confidentialite.html"]')).toHaveCount(1);
    await expect(page.locator('#compte a[href="confidentialite.html"]')).toHaveCount(1);
    await expect(page.locator('#avSave')).toHaveText('Envoyer mon avis');
  });
  test('la page explique tout et laisse refuser les statistiques', async ({ page }) => {
    const erreurs = []; page.on('pageerror', e => erreurs.push(String(e)));
    await page.goto('/confidentialite.html');
    await expect(page.locator('h1')).toHaveText('Ce que DJingood garde sur toi');
    await expect(page.locator('h2.sub')).toHaveText(['Sur ton ordinateur', 'Si tu crées un compte', 'Les statistiques de visite', 'Quand tu envoies ton avis', 'Une question ?']);
    const btn = page.locator('#statsBtn');
    await expect(btn).toHaveText('Ne plus compter mes visites');
    await btn.click();
    await expect(btn).toHaveText('Compter de nouveau mes visites');
    await expect(page.locator('#statsEtat')).toContainText('ne sont plus comptées');
    expect(await page.evaluate(() => localStorage.getItem('umami.disabled'))).toBe('1');
    await btn.click();
    expect(await page.evaluate(() => localStorage.getItem('umami.disabled'))).toBeNull();
    expect(erreurs).toEqual([]);
  });
  test('la présentation et la fiche des testeurs y mènent', async ({ page }) => {
    await page.goto('/presentation.html');
    await expect(page.locator('a[href="confidentialite.html"]')).toHaveCount(2);
    await page.goto('/testeurs.html');
    await expect(page.locator('a[href="confidentialite.html"]')).toHaveCount(1);
    await expect(page.locator('.page-note')).not.toContainText('Rien n\'est envoyé tout seul');
  });
});
