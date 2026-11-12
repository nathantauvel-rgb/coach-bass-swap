// Lot 68 : la découpe gratuit / Pro. Gratuit : les 3 premiers niveaux du chapitre 1 (Mode Expert compris), Comprendre, le défi
// du jour (sur ces 3 niveaux), un tuto. Tout le reste demande DJingood Pro. Tant que PRO_PRET est faux, rien ne change pour
// les joueurs : les tests allument Pro avec window.DJINGOOD_PRO.
const { test, expect } = require('@playwright/test');
const { ouvrir } = require('./outils');
const { FAUX, dejaConnecte } = require('./faux-firebase');

const S = o => JSON.stringify(o);
const PRO = 'window.DJINGOOD_PRO = true;';
const etoiles = (o, n = 'coach-lecons') => ({ [n]: S(o) });
const DEUX = etoiles({ 0: 3, 1: 2 }), TROIS = etoiles({ 0: 3, 1: 2, 2: 3 });
// un joueur d'avant Pro : des étoiles hors des niveaux gratuits (il garde tout, et Pro lui offre un mois)
const ANCIEN = Object.assign(etoiles({ 0: 3, 1: 3, 2: 3, 3: 2, 4: 2 }), etoiles({ 0: 2 }, 'coach-ch5'), { 'coach-parcours': 'debut' });
async function fausseApi(page, { pro = false, offert = false, erreurEssai = '' } = {}){
  const etat = { appels: [] };
  await page.route('**/api/pro', async r => {
    const d = JSON.parse(r.request().postData() || '{}'); etat.appels.push(d);
    if (d.action === 'payer' && d.essai && erreurEssai) return r.fulfill({ status: erreurEssai === 'essai-reserve' ? 403 : 409, contentType: 'application/json', body: S({ erreur: erreurEssai }) });
    if (d.action === 'payer') return r.fulfill({ status: 200, contentType: 'application/json', body: S({ url: 'http://localhost:' + (process.env.DJ_PORT || 8766) + '/index.html?paye=1#apprendre' }) });
    // offert : la réponse d'api/pro.js pour un compte créé avant la limite et jamais abonné (lot 68)
    return r.fulfill({ status: 200, contentType: 'application/json', body: S(Object.assign({ pro, formule: pro ? 'an' : null, jusqua: pro ? 1826000000 : null, annule: false, essai: false }, pro ? {} : { offert })) });
  });
  return etat;
}
const etats = page => page.locator('#map .node').evaluateAll(ns => ns.map(n => [...n.classList].find(c => c.startsWith('etat-')).slice(5)));

test.describe('Tant que Pro est éteint', () => {
  test('rien ne change : pas de cadenas Pro, « Jouer », l’entraînement et Passer au vrai comme avant', async ({ page }) => {
    const err = await ouvrir(page, { stockage: TROIS });
    expect(await etats(page)).not.toContain('pro');
    await expect(page.locator('.chapters .chap.pro')).toHaveCount(0);
    await expect(page.locator('#proNiv')).toBeHidden();
    await expect(page.locator('#cpBlocGratuit')).toBeHidden();
    await page.evaluate(() => selectLesson(5));
    await expect(page.locator('#startBtn')).toHaveText('Jouer');
    await expect(page.locator('#watchBtn')).toBeVisible();
    await page.goto('/index.html#entrainer');
    await expect(page.locator('#vTrain .card.tr-pro')).toHaveCount(0);
    await page.goto('/index.html#vrai');
    await expect(page.locator('#rbPro')).toBeHidden();
    await expect(page.locator('#rbEmpty')).toBeVisible();
    await expect(page.locator('#tabTutos')).toBeHidden();
    expect(err).toEqual([]);
  });
});

test.describe('Pro allumé, sans abonnement', () => {
  test('Apprendre : les 3 premiers niveaux gratuits, les 4 suivants et les chapitres 2 à 7 dans Pro', async ({ page }) => {
    const err = await ouvrir(page, { stockage: DEUX, avant: PRO });
    expect(await etats(page)).toEqual(['reussi', 'reussi', 'encours', 'pro', 'pro', 'pro', 'pro']);
    await expect(page.locator('#map .node.etat-pro .etq').first()).toHaveText('Pro');
    await expect(page.locator('.chapters .chap.pro')).toHaveCount(6);
    await expect(page.locator('.chapters .chap.pro').first()).toContainText('7 niveaux');
    await expect(page.locator('#proNiv')).toBeVisible();
    await expect(page.locator('#proNivTxt')).toContainText('Les 40 autres');
    await expect(page.locator('#cpBlocGratuit')).toBeVisible();
    // un niveau de Pro : la fenêtre Pro dit pour quoi elle s'ouvre
    await page.locator('#map .node').nth(3).click();
    await expect(page.locator('#pro')).toBeVisible();
    await expect(page.locator('#proContexteTxt')).toHaveText("Pour jouer « L'écho out »");
    await expect(page.locator('#proNbEx')).toHaveText('40');
    await page.keyboard.press('Escape');
    // un chapitre de Pro
    await page.locator('.chapters .chap.pro').nth(3).click();
    await expect(page.locator('#proContexteTxt')).toHaveText('Pour ouvrir le chapitre 5 : « Le calage » (après 14 ★ au chapitre 1)');
    expect(await page.evaluate(() => chapter)).toBe(1);
    expect(err).toEqual([]);
  });

  test('les deux cadenas : gris pour la progression, violet pour Pro', async ({ page }) => {
    await ouvrir(page, { stockage: etoiles({ 0: 2 }), avant: PRO, verrou: true });
    expect(await etats(page)).toEqual(['reussi', 'encours', 'verrou', 'pro', 'pro', 'pro', 'pro']);
    await page.locator('#map .node').nth(2).click({ force: true });
    await expect(page.locator('#pro')).toBeHidden();   // le gris refuse, comme avant (lot 64)
    await page.locator('#map .node').nth(4).click();
    await expect(page.locator('#pro')).toBeVisible();
  });

  test('un niveau de Pro affiché : « Continuer avec Pro », pas de démo, ni partie ni fiche', async ({ page }) => {
    const err = await ouvrir(page, { stockage: TROIS, avant: PRO });
    await page.evaluate(() => selectLesson(3));
    await expect(page.locator('#startBtn')).toHaveText('Continuer avec Pro');
    await expect(page.locator('#watchBtn')).toBeHidden();
    await expect(page.locator('#expertBtn')).toBeHidden();
    await expect(page.locator('#hint')).toContainText('dans DJingood Pro');
    await page.locator('#startBtn').click();
    await expect(page.locator('#pro')).toBeVisible();
    expect(await page.evaluate(() => [!!run, preparing])).toEqual([false, false]);
    await page.keyboard.press('Escape');
    await page.evaluate(() => startRun(true));   // même la démo
    await expect(page.locator('#pro')).toBeVisible();
    // un niveau gratuit, lui, se joue
    await page.keyboard.press('Escape');
    await page.evaluate(() => selectLesson(2));
    await expect(page.locator('#startBtn')).toHaveText('Jouer');
    await expect(page.locator('#watchBtn')).toBeVisible();
    await expect(page.locator('#expertBtn')).toBeVisible();
    expect(err).toEqual([]);
  });

  test('« Niveau suivant » vers un niveau de Pro ouvre la fenêtre Pro', async ({ page }) => {
    await ouvrir(page, { stockage: TROIS, avant: PRO });
    await page.evaluate(() => { selectLesson(2); $('result').hidden = false; $('next').hidden = false; });
    await page.locator('#next').click();
    await expect(page.locator('#pro')).toBeVisible();
    await expect(page.locator('#proContexteTxt')).toHaveText("Pour jouer « L'écho out »");
    expect(await page.evaluate(() => li)).toBe(2);
  });

  test('la fin du niveau 3 réussi la première fois : « Ta première transition ! » et la suite dans Pro', async ({ page }) => {
    const err = await ouvrir(page, { stockage: TROIS, avant: PRO });
    await page.evaluate(() => { selectLesson(2); $('result').hidden = false; resultatCarte(3, [['ok', 'Pile.', 1]]); $('next').hidden = false; resultatBoutons(3); finEssai(1, 3, 0); });
    await expect(page.locator('#rTitle')).toHaveText('Ta première transition !');
    await expect(page.locator('#rPro')).toBeVisible();
    await expect(page.locator('#rProNiv li')).toHaveCount(4);
    await expect(page.locator('#rProNiv li').first()).toContainText("L'écho out");
    await expect(page.locator('#rProGo')).toBeVisible();
    await expect(page.locator('#next')).toBeHidden();
    await expect(page.locator('#retry')).not.toHaveClass(/\bgo\b/);
    await page.locator('#rProGo').click();
    await expect(page.locator('#result')).toBeHidden();
    await expect(page.locator('#proContexteTxt')).toHaveText('Tu as fini les 3 niveaux gratuits');
    // déjà réussi avant, ou raté : la carte normale
    await page.keyboard.press('Escape');
    await page.evaluate(() => { $('result').hidden = false; finEssai(1, 3, 2); });
    await expect(page.locator('#rPro')).toBeHidden();
    await page.evaluate(() => finEssai(1, 1, 0));
    await expect(page.locator('#rPro')).toBeHidden();
    expect(err).toEqual([]);
  });

  test('la fenêtre Pro vend tout le site ; avant d’avoir joué, elle propose d’essayer avec sa table', async ({ page }) => {
    const err = await ouvrir(page, { avant: PRO });
    await page.evaluate(() => proOuvre('', { chap: 5 }));
    await expect(page.locator('#pro .pro-atouts')).toContainText('Les 7 chapitres');
    await expect(page.locator('#pro .pro-atouts')).not.toContainText('reste gratuit');
    await expect(page.locator('#proDedansTxt')).toHaveText('40 exercices, 10 tutos, et un nouveau tuto chaque mois.');
    await expect(page.locator('#proEssai')).toBeVisible();
    await expect(page.locator('#proGo')).toBeHidden();
    await expect(page.locator('#proEssaiGo')).toHaveText('Jouer le niveau 1 (gratuit)');
    // « Passer à Pro quand même » reste possible
    await page.locator('#proQuandMeme').click();
    await expect(page.locator('#proGo')).toBeVisible();
    await expect(page.locator('#proEssai')).toBeHidden();
    // le niveau 1, gratuit
    await page.evaluate(() => proOuvre(''));
    await page.locator('#proEssaiGo').click();
    await expect(page.locator('#pro')).toBeHidden();
    expect(await page.evaluate(() => [chapter, li])).toEqual([1, 0]);
    expect(err).toEqual([]);
  });

  test('S’entraîner : le défi du jour gratuit sur les niveaux gratuits, le reste dans Pro', async ({ page }) => {
    const err = await ouvrir(page, { onglet: 'entrainer', stockage: Object.assign({}, ANCIEN, { 'coach-fondateur': '1' }), avant: PRO });
    await expect(page.locator('#vTrain .card.tr-pro')).toHaveCount(4);
    await expect(page.locator('#tVarS')).toHaveText('Pro');
    await expect(page.locator('#trainNote')).toContainText('dans DJingood Pro');
    expect(await page.evaluate(() => pracPool())).toEqual([0, 1, 2]);   // pas les niveaux 4 et 5, pourtant joués
    await page.locator('#vTrain [data-prac="var"]').click();
    await expect(page.locator('#pro')).toBeVisible();
    await expect(page.locator('#proContexteTxt')).toHaveText('Pour t’entraîner sans limite');
    await page.keyboard.press('Escape');
    await page.locator('#quizCard').click();
    await expect(page.locator('#pro')).toBeVisible();
    await page.keyboard.press('Escape');
    await page.locator('#vTrain [data-prac="defi"]').click();
    await expect(page.locator('#prBanner')).toBeVisible();
    expect(await page.evaluate(() => li)).toBeLessThan(3);
    expect(err).toEqual([]);
  });

  test('Passer au vrai est dans Pro ; l’onglet Tutos se montre, un seul tuto gratuit', async ({ page }) => {
    const err = await ouvrir(page, { onglet: 'vrai', stockage: TROIS, avant: PRO });
    await expect(page.locator('#rbPro')).toBeVisible();
    await expect(page.locator('#rbEmpty')).toBeHidden();
    await page.locator('#rbProBtn').click();
    await expect(page.locator('#proContexteTxt')).toHaveText('Pour mixer ta propre musique');
    await page.keyboard.press('Escape');
    await expect(page.locator('#tabTutos')).toBeVisible();
    await page.goto('/index.html#tutos');
    await expect(page.locator('.tu-carte:not(.tu-ferme)')).toHaveCount(1);
    await expect(page.locator('.tu-carte:not(.tu-ferme)')).toHaveAttribute('data-tu', 'fondu');
    expect(err).toEqual([]);
  });

  test('l’accueil : les 3 niveaux faits, la prochaine étape propose Pro et le défi du jour gratuit', async ({ page }) => {
    const err = await ouvrir(page, { onglet: 'accueil', stockage: Object.assign({ 'coach-parcours': 'debut' }, TROIS), avant: PRO });
    await expect(page.locator('#homePro')).toBeVisible();
    await expect(page.locator('#homeProTxt')).toHaveText('Niveau 4 : L\'écho out');
    await expect(page.locator('#homeCta')).toHaveText('Continuer avec Pro');
    await expect(page.locator('#homeLead')).toContainText('tu as fini les 3 niveaux gratuits');
    await expect(page.locator('#homeTip')).toContainText('DJingood Pro');
    await page.locator('#homeCta').click();
    await expect(page.locator('#pro')).toBeVisible();
    await expect(page.locator('#proContexteTxt')).toHaveText("Pour jouer « L'écho out »");
    await page.keyboard.press('Escape');
    await page.locator('#homeDefi').click();
    await expect(page).toHaveURL(/#entrainer/);
    expect(err).toEqual([]);
  });

  test('l’accueil d’un débutant qui n’a pas fini : rien de Pro', async ({ page }) => {
    await ouvrir(page, { onglet: 'accueil', stockage: Object.assign({ 'coach-parcours': 'debut' }, DEUX), avant: PRO });
    await expect(page.locator('#homePro')).toBeHidden();
    await expect(page.locator('#homeCta')).toHaveText('Niveau 3 : La coupure sèche');
  });

  for (const p of ['apprenti', 'confirme']) test(`${p} : on commence par les 3 niveaux gratuits, en Mode Expert`, async ({ page }) => {
    await ouvrir(page, { onglet: 'accueil', stockage: { 'coach-parcours': p }, avant: PRO });
    expect(await page.evaluate(() => nextStage())).toBe('essai');
    await expect(page.locator('#homeCta')).toHaveText('Mode Expert, niveau 1 : Le bon moment');
    await page.locator('#homeCta').click();
    await expect(page).toHaveURL(/#apprendre/);
    expect(await page.evaluate(() => [chapter, li, expert])).toEqual([1, 0, true]);
    // les 3 faits en Expert (60/100) : l'étape suivante est dans Pro
    await page.evaluate(() => { xBest[0] = 70; xBest[1] = 65; xBest[2] = 90; setView('accueil'); renderHome(); });
    await expect(page.locator('#homeCta')).toHaveText('Continuer avec Pro');
  });

  test('le plan des Premiers pas dit ce qui est gratuit et ce qui est dans Pro', async ({ page }) => {
    await ouvrir(page, { onglet: 'accueil', avant: PRO });
    const plan = async niveau => page.evaluate(n => { $('ppOpts').innerHTML = ''; Object.assign(pp.rep, { niveau: n, table: 'table', min: 10, oreille: null }); ppPlanOpts();
      return [...$('ppOpts').querySelectorAll('.pp-frise li')].map(l => [l.querySelector('b').textContent, l.querySelector('.pro-tag').textContent]); }, niveau);
    expect(await plan('debut')).toEqual([['Tes 3 premiers gestes', 'Gratuit'], ['Les 4 autres gestes', 'Pro'], ['Jusqu’au set noté sur 100', 'Pro']]);
    expect((await plan('confirme'))[0]).toEqual(['Tes 3 premiers gestes, en Mode Expert', 'Gratuit']);
  });
});

// Règle de l'utilisateur (11 nov. 2026) : les comptes déjà créés ont un mois offert ; un compte créé ensuite n'a que les
// exercices gratuits. C'est api/pro.js qui le sait (date de création chez Firebase) et le dit par `offert`.
test.describe('Le mois offert aux comptes déjà créés', () => {
  test('un compte d’avant la limite : un message, une seule fois, puis l’offre reste dans la fenêtre Pro', async ({ page }) => {
    await fausseApi(page, { offert: true });
    const err = await ouvrir(page, { onglet: 'accueil', stockage: TROIS, avant: dejaConnecte() + FAUX + PRO });
    await expect(page.locator('#fond')).toBeVisible({ timeout: 10000 });
    expect(await page.evaluate(() => localStorage.getItem('coach-fondateur'))).toBe('1');
    await expect(page.locator('#fond')).toContainText('Tu gardes toutes tes étoiles');
    await page.locator('#fondPlusTard').click();
    await expect(page.locator('#fond')).toBeHidden();
    await page.evaluate(() => proOuvre(''));
    await expect(page.locator('#proFond')).toBeVisible();
    await expect(page.locator('#proGo')).toContainText('Prendre mon mois offert');
    await expect(page.locator('#proEssai')).toBeHidden();
    await page.reload(); await page.waitForTimeout(4000);
    await expect(page.locator('#fond')).toBeHidden();
    expect(err).toEqual([]);
  });

  test('« Prendre mon mois offert » demande l’essai à Stripe ; s’il a déjà servi, on peut s’abonner normalement', async ({ page }) => {
    const api = await fausseApi(page, { offert: true, erreurEssai: 'essai-deja' });
    await ouvrir(page, { onglet: 'accueil', stockage: Object.assign({ 'coach-fondateur': '1' }, TROIS), avant: dejaConnecte() + FAUX + PRO });
    await expect.poll(() => page.evaluate(() => proFondateur()), { timeout: 10000 }).toBe(true);
    await page.evaluate(() => proOuvre(''));
    await page.locator('#proGo').click();
    await expect(page.locator('#proMsg')).toContainText('mois offert a déjà servi');
    await expect(page.locator('#proGo')).toContainText('Passer à Pro');
    await expect(page.locator('#proFond')).toBeHidden();
    expect(api.appels.filter(a => a.action === 'payer').map(a => !!a.essai)).toEqual([true]);
    await page.locator('#proGo').click();
    await page.waitForURL(/paye=1/, { timeout: 15000 });
    expect(api.appels.filter(a => a.action === 'payer').map(a => !!a.essai)).toEqual([true, false]);
  });

  test('si le serveur refuse (compte trop récent), le site le dit et propose l’abonnement normal', async ({ page }) => {
    await fausseApi(page, { offert: true, erreurEssai: 'essai-reserve' });
    await ouvrir(page, { onglet: 'accueil', stockage: Object.assign({ 'coach-fondateur': '1' }, TROIS), avant: dejaConnecte() + FAUX + PRO });
    await expect.poll(() => page.evaluate(() => proFondateur()), { timeout: 10000 }).toBe(true);
    await page.evaluate(() => proOuvre(''));
    await page.locator('#proGo').click();
    await expect(page.locator('#proMsg')).toContainText('réservé aux comptes créés avant');
    await expect(page.locator('#proGo')).toContainText('Passer à Pro');
  });

  test('un compte créé après la limite ne voit ni le message ni l’offre, même avec des étoiles', async ({ page }) => {
    await fausseApi(page, { offert: false });
    await ouvrir(page, { onglet: 'accueil', stockage: ANCIEN, avant: dejaConnecte() + FAUX + PRO });
    await expect.poll(() => page.evaluate(() => proEtat.uid), { timeout: 10000 }).toBe('u1');
    await page.waitForTimeout(3500);
    await expect(page.locator('#fond')).toBeHidden();
    await page.evaluate(() => proOuvre(''));
    await expect(page.locator('#proFond')).toBeHidden();
    await expect(page.locator('#proGo')).toContainText('Passer à Pro');
  });

  test('sans compte, pas de mois offert, même avec des étoiles', async ({ page }) => {
    await ouvrir(page, { onglet: 'accueil', stockage: ANCIEN, avant: PRO });
    await page.waitForTimeout(4000);
    await expect(page.locator('#fond')).toBeHidden();
    expect(await page.evaluate(() => proFondateur())).toBe(false);
  });
});

test.describe('Pro allumé, abonné', () => {
  test('Stripe dit Pro : plus rien de verrouillé par Pro, le message du mois offert ne vient pas', async ({ page }) => {
    await fausseApi(page, { pro: true });
    const err = await ouvrir(page, { stockage: ANCIEN, avant: dejaConnecte() + FAUX + PRO });
    await expect.poll(() => etats(page), { timeout: 15000 }).not.toContain('pro');
    await expect(page.locator('.chapters .chap.pro')).toHaveCount(0);
    await expect(page.locator('#proNiv')).toBeHidden();
    await page.evaluate(() => selectLesson(5));
    await expect(page.locator('#startBtn')).toHaveText('Jouer');
    await page.waitForTimeout(3000);
    await expect(page.locator('#fond')).toBeHidden();
    expect(err).toEqual([]);
  });
});

// Corrections du gardien (lot 68)
test.describe('Corrections du gardien', () => {
  test('après le paiement, un chapitre encore fermé par les étoiles est dit, et on propose un niveau vraiment ouvert', async ({ page }) => {
    await ouvrir(page, { stockage: TROIS, avant: PRO, verrou: true });
    await page.evaluate(() => proOuvre('', { chap: 5 }));
    await expect(page.locator('#proContexteTxt')).toHaveText('Pour ouvrir le chapitre 5 : « Le calage » (après 14 ★ au chapitre 1)');
    const s = await page.evaluate(() => proSuite('chap:5').slice(0, 2));
    expect(s[0]).toContain('Le chapitre 5 s’ouvre avec 14 ★ au chapitre 1 (tu en as 8)');
    expect(s[1]).toBe("Jouer « L'écho out »");
    // un niveau fermé par la progression : pareil
    expect(await page.evaluate(() => proSuite('niv:1:5')[0])).toContain('s’ouvre quand les niveaux d’avant sont réussis');
    // un niveau ouvert : proposé tel quel
    expect(await page.evaluate(() => proSuite('niv:1:3')[1])).toBe("Jouer « L'écho out »");
  });

  test('Vérifier ma table : sans abonnement, l’étape de la vraie musique fait jouer « Le fader » (gratuit)', async ({ page }) => {
    await ouvrir(page, { avant: PRO, verrou: true });
    await page.evaluate(() => vfJouer('swap'));
    await expect(page.locator('#ltitle')).toHaveText('Le fader');
    await expect(page.locator('#startBtn')).toHaveText('Jouer');
  });

  test('le mois offert attend la réponse de Stripe : un abonné sur un nouvel ordinateur ne le voit pas', async ({ page }) => {
    let repondre;
    const attente = new Promise(r => { repondre = r; });
    await page.route('**/api/pro', async r => { await attente; r.fulfill({ status: 200, contentType: 'application/json', body: S({ pro: true, formule: 'an', jusqua: 1826000000, annule: false, essai: false }) }); });
    await ouvrir(page, { onglet: 'accueil', stockage: ANCIEN, avant: dejaConnecte() + FAUX + PRO });
    await page.waitForTimeout(3500);
    await expect(page.locator('#fond')).toBeHidden();   // Stripe n'a pas encore répondu : rien
    repondre();
    await expect.poll(() => page.evaluate(() => proActif()), { timeout: 10000 }).toBe(true);
    await page.waitForTimeout(3500);
    await expect(page.locator('#fond')).toBeHidden();   // abonné : jamais
    expect(await page.evaluate(() => localStorage.getItem('coach-fondateur'))).toBeNull();
  });
});

test.describe("L'interrupteur de Pro", () => {
  test('js/pro-pret.js garde sa forme, et le serveur de test part toujours avec Pro éteint', async ({ page, request }) => {
    // le jour de l'ouverture, PRO_PRET passe à true : tests/serveur.js (--tests) le remet à false pour la suite des tests
    const vrai = require('fs').readFileSync(require('path').join(__dirname, '..', 'js', 'pro-pret.js'), 'utf8');
    expect(vrai).toMatch(/^const PRO_PRET = (true|false);$/m);
    const servi = await (await request.get('/js/pro-pret.js')).text();
    expect(servi).toContain('const PRO_PRET = false;');
    await ouvrir(page, { onglet: 'accueil' });
    expect(await page.evaluate(() => [PRO_PRET, proVerrou()])).toEqual([false, false]);
  });
});
