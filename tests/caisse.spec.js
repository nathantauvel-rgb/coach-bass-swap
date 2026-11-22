// Lot 81 « La caisse » (21 nov. 2026), décisions de l'utilisateur après l'analyse d'une vidéo sur les ventes d'un SaaS :
// l'année d'office (affichée 4,17 € par mois), le rattrapage (34,99 € la première année pendant 48 h, après une page de
// paiement quittée sans payer), l'essai de 7 jours proposé dès la première réussite avec sa table, l'offre qui reprend le
// plan des Premiers pas, « Comment tu as connu DJingood ? » après le paiement, le titre de la présentation qui dit le résultat.
const { test, expect } = require('@playwright/test');
const { ouvrir } = require('./outils');
const { FAUX, dejaConnecte } = require('./faux-firebase');

const S = o => JSON.stringify(o);
const PRO = 'window.DJINGOOD_PRO = true;';
const UMAMI = 'window.__stats = []; window.umami = { track(n, d){ window.__stats.push(d === undefined ? [n] : [n, d]); } };';
const etoiles = o => ({ 'coach-lecons': S(o) });
const TROIS = etoiles({ 0: 3, 1: 2, 2: 2 }), DEUX = etoiles({ 0: 3, 1: 2 });
const PLAN = { 'coach-accueil': S({ niveau: 'debut', table: 'table', modele: 'flx4', min: 10, oreille: 6, fini: '2026-11-21' }) };
const dans = h => Math.floor(Date.now() / 1000) + h * 3600;
// La fausse fonction /api/pro (comme niveau-dabord.spec.js) : retient chaque appel
async function fausseApi(page, { etat = {}, erreurPayer = '' } = {}){
  const s = { appels: [] };
  await page.route('**/api/pro', async r => {
    const d = JSON.parse(r.request().postData() || '{}'); s.appels.push(d);
    if (d.action === 'payer' && erreurPayer) return r.fulfill({ status: erreurPayer === 'rattrapage-fini' ? 410 : 409, contentType: 'application/json', body: S({ erreur: erreurPayer }) });
    if (d.action === 'payer') return r.fulfill({ status: 200, contentType: 'application/json', body: S({ url: 'http://localhost:' + (process.env.DJ_PORT || 8766) + '/index.html?paye=1#apprendre' }) });
    return r.fulfill({ status: 200, contentType: 'application/json', body: S(Object.assign({ pro: false, formule: null, jusqua: null, annule: false, offert: false, essaiDispo: true }, etat)) });
  });
  return s;
}
// lot 82 : le chapitre 1 est gratuit en entier ; la carte d'un niveau de Pro se voit au chapitre 2 (un ancien abonné qui y revient)
const finCarte = async page => { await page.evaluate(() => { LESSONS = lessonsOf(2); chapter = 2; selectLesson(0); }); await expect(page.locator('#nivFin')).toBeVisible(); return page.locator('#nivFinOffre'); };
const SIX = etoiles({ 0: 3, 1: 2, 2: 2, 3: 2, 4: 2, 5: 2 });

test.describe('L’année d’office et le plan', () => {
  test('la carte de fin : l’année en premier, choisie, à 4,17 € par mois ; le plan des Premiers pas ; elle tient dans 1366 × 768', async ({ page }) => {
    const err = await ouvrir(page, { avant: PRO, stockage: Object.assign({}, TROIS, PLAN) });
    const o = await finCarte(page);
    await expect(o.locator('.offre-f').first()).toHaveAttribute('data-f', 'an');
    await expect(o.locator('.offre-f[aria-pressed="true"]')).toHaveText(/À l’année4,17 €\/mois49,99 € par an/);
    await expect(o.locator('.offre-f[data-f="mois"]')).toHaveText(/Au mois4,99 €\/mois/);
    await expect(o.locator('.offre-plan b')).toHaveText('Ton plan : Pioneer DDJ-FLX4 · 10 min par jour');
    await expect(o.locator('.offre-plan span')).toHaveText('Dans 2 semaines : ta première vraie transition.');
    await expect(o.locator('.offre-frise li').nth(2)).toContainText('49,99 € pour l’année, sauf si tu arrêtes avant');
    await page.evaluate(() => scrollTo(0, 0));
    const r = await page.evaluate(() => ({ bas: $('nivFin').getBoundingClientRect().bottom, h: innerHeight }));
    expect(r.bas).toBeLessThanOrEqual(r.h);
    expect(err).toEqual([]);
  });

  test('le plan suit les réponses (un apprenti, 15 min, une autre table connue) ; rien si les questions ont été passées', async ({ page }) => {
    await ouvrir(page, { avant: PRO, stockage: Object.assign({}, TROIS, { 'coach-accueil': S({ niveau: 'apprenti', table: 'table', modele: 'ddj400', min: 15, fini: '2026-11-21' }) }) });
    const o = await finCarte(page);
    await expect(o.locator('.offre-plan b')).toHaveText('Ton plan : Pioneer DDJ-400 · 15 min par jour');
    await expect(o.locator('.offre-plan span')).toHaveText('En moins de 2 semaines : des transitions vraiment propres.');
    // une table qui n'est pas dans la liste : on ne la nomme pas
    await page.evaluate(() => { accueil = Object.assign({}, accueil, { modele: 'inconnue', min: 5, niveau: 'confirme' }); proOffresRend(); });
    await expect(o.locator('.offre-plan b')).toHaveText('Ton plan : 5 min par jour');
    await expect(o.locator('.offre-plan span')).toHaveText('À ton rythme : un set à 100 sur 100.');
    await page.evaluate(() => { accueil = { passe: true, fini: '2026-10-16' }; proOffresRend(); });
    await expect(o.locator('.offre-plan')).toHaveCount(0);
  });
});

test.describe('Le rattrapage', () => {
  test('pendant les 48 h : la carte de fin propose l’année à 34,99 €, avec sa vraie date limite ; payer l’envoie à Stripe', async ({ page }) => {
    const api = await fausseApi(page, { etat: { rattrapage: dans(40) } });
    await page.addInitScript(UMAMI);
    const err = await ouvrir(page, { avant: dejaConnecte() + FAUX + PRO, stockage: TROIS });
    const o = await finCarte(page);
    await expect(o.locator('.offre-t')).toHaveText('Ta première année à 34,99 €');
    // gardien : l'offre vue sur la carte de fin compte aussi (pas seulement au retour de Stripe)
    expect(await page.evaluate(() => window.__stats.some(x => x[0] === 'rattrapage-vu'))).toBe(true);
    await expect(o.locator('.offre-sous')).toContainText('Au lieu de 49,99 €, jusqu’au ');
    const fin = await page.evaluate(() => proRattrapageFin());
    await expect(o.locator('.offre-sous')).toHaveText(`Au lieu de 49,99 €, ${fin}.`);
    expect(fin).toMatch(/^jusqu’au \S+ \d+ \S+ à \d+ h \d\d$/);
    await expect(o.locator('.offre-f[data-f="an"]')).toHaveText(/À l’année34,99 €la 1re année/);
    await expect(o.locator('.offre-frise li').nth(2)).toContainText('34,99 € pour ta première année, sauf si tu arrêtes avant');
    await expect(o.locator('.offre-plan')).toHaveCount(0);   // pendant le rattrapage, l'offre parle du prix
    await page.evaluate(() => scrollTo(0, 0));
    expect(await page.evaluate(() => $('nivFin').getBoundingClientRect().bottom <= innerHeight)).toBe(true);
    await o.locator('.offre-go').click();
    await page.waitForURL(/paye=1/, { timeout: 15000 });
    const payer = api.appels.find(a => a.action === 'payer');
    expect([payer.formule, payer.essai, payer.rattrapage]).toEqual(['an', 'semaine', true]);
    expect(err).toEqual([]);
  });

  test('au mois, pas de rattrapage ; la fenêtre Pro le montre aussi (−30 %) ; la carte du niveau 7 aussi', async ({ page }) => {
    const api = await fausseApi(page, { etat: { rattrapage: dans(10) } });
    await ouvrir(page, { avant: dejaConnecte() + FAUX + PRO, stockage: SIX });
    await expect.poll(() => page.evaluate(() => proRattrapage())).toBe(true);
    await page.evaluate(() => proOuvre(''));
    await expect(page.locator('#proPrix')).toHaveText('34,99 €');
    await expect(page.locator('#proPar')).toHaveText('/ 1re année');
    await expect(page.locator('#proDetail')).toContainText('49,99 €');
    await expect(page.locator('#proDetail')).toContainText('ensuite 49,99 € par an');
    await expect(page.locator('#pro .pro-eco')).toHaveText('−30 %');
    await page.locator('#pro .pro-bascule [data-f="mois"]').click();
    await expect(page.locator('#proPrix')).toHaveText('4,99 €');
    await page.keyboard.press('Escape');
    await page.evaluate(() => { selectLesson(6); $('result').hidden = false; resultatCarte(3, [['ok', 'Pile.', 1]]); $('next').hidden = false; resultatBoutons(3); finEssai(1, 3, 0); });
    await expect(page.locator('#rProRattrapage')).toBeVisible();
    await expect(page.locator('#rProRattrapage')).toContainText('Ta première année à 34,99 € au lieu de 49,99 €, jusqu’au');
    await expect(page.locator('#rProEssai')).toContainText('7 jours gratuits, puis 34,99 € pour ta première année.');
    await page.locator('#rProBascule').click();   // au mois
    await page.locator('#rProGo').click();
    await page.waitForURL(/paye=1/, { timeout: 15000 });
    const payer = api.appels.find(a => a.action === 'payer');
    expect(payer.formule).toBe('mois'); expect(payer).not.toHaveProperty('rattrapage');
  });

  test('l’offre finie entre-temps : Stripe refuse, le site le dit et revient au prix normal', async ({ page }) => {
    await fausseApi(page, { etat: { rattrapage: dans(1) }, erreurPayer: 'rattrapage-fini' });
    await ouvrir(page, { avant: dejaConnecte() + FAUX + PRO, stockage: TROIS });
    const o = await finCarte(page);
    await expect(o.locator('.offre-t')).toHaveText('Ta première année à 34,99 €');
    await o.locator('.offre-go').click();
    await expect(o.locator('.offre-msg')).toHaveText('L’offre à 34,99 € est terminée : tu peux continuer au prix normal.');
    await expect(o.locator('.offre-t')).toHaveText('Essaie Pro 7 jours, gratuitement');
    await expect(o.locator('.offre-f[data-f="an"]')).toContainText('4,17 €/mois');
  });

  test('une date passée ou absente : pas d’offre', async ({ page }) => {
    await fausseApi(page, { etat: { rattrapage: dans(-1) } });
    await ouvrir(page, { avant: dejaConnecte() + FAUX + PRO, stockage: TROIS });
    const o = await finCarte(page);
    await page.waitForTimeout(500);
    await expect(o.locator('.offre-t')).toHaveText('Essaie Pro 7 jours, gratuitement');
    expect(await page.evaluate(() => proRattrapage())).toBe(false);
  });

  test('revenu de Stripe sans payer (?pro=retour) : la fenêtre Pro qu’on vient de quitter se rouvre, avec l’offre ; l’adresse est nettoyée', async ({ page }) => {
    await fausseApi(page, { etat: { rattrapage: dans(47) } });
    await page.addInitScript(UMAMI);
    await ouvrir(page, { avant: dejaConnecte() + FAUX + PRO, stockage: DEUX, onglet: 'apprendre' });
    await page.goto('/index.html?pro=retour#apprendre');
    await expect(page.locator('#pro')).toBeVisible();
    await expect(page.locator('#proPrix')).toHaveText('34,99 €');
    expect(page.url()).not.toContain('pro=retour');
    expect(await page.evaluate(() => window.__stats.some(x => x[0] === 'rattrapage-vu'))).toBe(true);
  });

  test('revenu de Stripe sans payer, mais l’offre ne court pas : rien ne s’ouvre', async ({ page }) => {
    await fausseApi(page);
    await ouvrir(page, { avant: dejaConnecte() + FAUX + PRO, stockage: DEUX });
    await page.goto('/index.html?pro=retour#apprendre');
    await page.waitForTimeout(1200);
    await expect(page.locator('#pro')).toBeHidden();
  });
});

test.describe('L’essai dès la première réussite', () => {
  // dans le même ordre que finish (niveaux.js) : l'essai d'abord ; s'il est proposé, pas de proposition de compte
  const carte = (st = 3, i = 0) => (page => page.evaluate(([st, i]) => { selectLesson(i); $('result').hidden = false; resultatCarte(st, [['ok', 'Pile.', 1]]); $('next').hidden = false; resultatBoutons(st); if (!essaiTot(1, st)) mlPropose(st); finEssai(1, st, 0); }, [st, i]));

  test('niveau 1 réussi avec une table branchée : l’essai proposé à côté, à la place de « Garde ta progression » ; « Niveau suivant » reste le bouton principal', async ({ page }) => {
    await page.addInitScript(UMAMI);
    const err = await ouvrir(page, { avant: PRO, stockage: etoiles({ 0: 3 }) });
    await page.evaluate(() => { midiCount = 1; });
    await carte()(page);
    await expect(page.locator('#rEssai')).toBeVisible();
    await expect(page.locator('#rEssai b')).toHaveText('Ça marche avec ta table !');
    await expect(page.locator('#rEssaiTxt')).toHaveText('Essaie tout DJingood 7 jours, gratuitement : les 36 exercices, les tutos de Vini, l’entraînement.');
    await expect(page.locator('#rCompte')).toBeHidden();
    await expect(page.locator('#next')).toBeVisible();
    await expect(page.locator('#rPro')).toBeHidden();
    expect(await page.evaluate(() => window.__stats.some(x => x[0] === 'essai-tot'))).toBe(true);
    // gardien : la proposition du compte n'est ni comptée ni consommée pour la journée
    expect(await page.evaluate(() => [window.__stats.some(x => x[0] === 'compte-propose'), localStorage.getItem('coach-compte-propose')])).toEqual([false, null]);
    // le bouton ouvre la fenêtre Pro (l'année d'office, l'essai expliqué) ; après le paiement, on reprend au niveau 2
    await page.locator('#rEssaiGo').click();
    await expect(page.locator('#result')).toBeHidden();
    await expect(page.locator('#pro')).toBeVisible();
    await expect(page.locator('#proGo')).toContainText('Commencer mes 7 jours gratuits');
    await expect(page.locator('#proSemaine')).toBeVisible();
    await expect(page.locator('#proContexte')).toBeHidden();
    expect(await page.evaluate(() => proVoulu.lire())).toBe('niv:1:1');
    expect(err).toEqual([]);
  });

  test('pas proposé : sans table branchée, partie ratée, au niveau 3 et après (lot 82), sans Pro, ou l’essai déjà servi', async ({ page }) => {
    await fausseApi(page, { etat: { essaiDispo: false } });
    await ouvrir(page, { avant: PRO, stockage: etoiles({ 0: 3, 1: 2 }) });
    await carte()(page);
    await expect(page.locator('#rEssai')).toBeHidden();   // midiCount = 0 : à la souris
    await page.evaluate(() => { midiCount = 1; });
    await carte(1)(page);
    await expect(page.locator('#rEssai')).toBeHidden();   // ratée
    await carte(3, 2)(page);
    await expect(page.locator('#rEssai')).toBeHidden();   // niveau 3 (lot 82 : plus de grande carte ici, elle est au niveau 7)
    await expect(page.locator('#rPro')).toBeHidden();
    await carte(3, 4)(page);
    await expect(page.locator('#rEssai')).toBeHidden();   // niveau 5
    await carte(2, 1)(page);
    await expect(page.locator('#rEssai')).toBeVisible();   // niveau 2 réussi : oui
    await page.evaluate(() => { semaineUtilisee = true; });
    await carte(3, 0)(page);
    await expect(page.locator('#rEssai')).toBeHidden();   // l'essai a déjà servi
  });

  test('Pro éteint : jamais', async ({ page }) => {
    await ouvrir(page, { stockage: etoiles({ 0: 3 }) });
    await page.evaluate(() => { midiCount = 1; });
    await carte()(page);
    await expect(page.locator('#rEssai')).toBeHidden();
  });
});

test.describe('Après le paiement', () => {
  test('« Comment tu as connu DJingood ? » : six réponses, envoyée une fois à Umami (et PostHog), puis plus jamais demandée', async ({ page }) => {
    await page.addInitScript(UMAMI);
    const err = await ouvrir(page, { avant: PRO, stockage: DEUX });
    await page.evaluate(() => proMerci());
    await expect(page.locator('#proMerci')).toBeVisible();
    await expect(page.locator('#proSource')).toBeVisible();
    await expect(page.locator('#proSourceChoix button')).toHaveText(['TikTok', 'Instagram', 'YouTube', 'Google', 'Un ami', 'Autre']);
    await page.locator('#proSourceChoix button', { hasText: 'TikTok' }).click();
    await expect(page.locator('#proSourceMerci')).toBeVisible();
    await expect(page.locator('#proSourceChoix')).toBeHidden();
    expect(await page.evaluate(() => window.__stats.filter(x => x[0] === 'pro-source'))).toEqual([['pro-source', { d: 'tiktok' }]]);
    expect(await page.evaluate(() => localStorage.getItem('coach-source-pro'))).toBe('tiktok');
    await page.evaluate(() => { proMerciFerme(); proMerci(); });
    await expect(page.locator('#proSource')).toBeHidden();
    // gardien : la réponse reste sur cet appareil, elle ne part pas dans le compte avec la progression
    expect(await page.evaluate(() => [cptSuivie('coach-source-pro'), cptSuivie('coach-lecons')])).toEqual([false, true]);
    expect(err).toEqual([]);
  });

  test('la question n’existe pas avant de payer : ni dans les Premiers pas, ni dans la fenêtre Pro', async ({ page }) => {
    await ouvrir(page, { avant: PRO, stockage: DEUX });
    await page.evaluate(() => proOuvre(''));
    await expect(page.locator('#pro')).not.toContainText('connu DJingood');
    await expect(page.locator('#proSource')).toBeHidden();
  });
});

test.describe('En anglais', () => {
  const EN = { 'coach-langue': 'en' };
  const manque = page => page.evaluate(() => [...window.__enManque]);
  test('l’offre (année d’office, plan), le rattrapage, l’essai dès la première réussite, la question : tout est traduit', async ({ page }) => {
    await fausseApi(page, { etat: { rattrapage: dans(30) } });
    await ouvrir(page, { avant: dejaConnecte() + FAUX + PRO, stockage: Object.assign({}, TROIS, PLAN, EN) });
    const o = await finCarte(page);
    await expect(o.locator('.offre-t')).toHaveText('Your first year for €34.99');
    await expect(o.locator('.offre-sous')).toContainText('Instead of €49.99, until ');
    await expect(o.locator('.offre-f[data-f="an"]')).toHaveText(/Yearly€34\.99the 1st year/);
    await expect(o.locator('.offre-frise li').nth(2)).toContainText('€34.99 for your first year, unless you cancel before then');
    await page.evaluate(() => { rattrapageFini = true; proOffresRend(); });
    await expect(o.locator('.offre-plan b')).toHaveText('Your plan: Pioneer DDJ-FLX4 · 10 min a day');
    await expect(o.locator('.offre-plan span')).toHaveText('In 2 weeks: your first real transition.');
    await expect(o.locator('.offre-f[data-f="an"]')).toHaveText(/Yearly€4\.17\/month€49\.99 a year/);
    await page.evaluate(() => { midiCount = 1; selectLesson(0); $('result').hidden = false; resultatCarte(3, [['ok', 'Pile.', 1]]); resultatBoutons(3); essaiTot(1, 3); });
    await expect(page.locator('#rEssaiTxt')).toHaveText("Try all of DJingood free for 7 days: the 36 exercises, Vini's tutorials, practice.");
    await expect(page.locator('#rEssaiGo')).toHaveText('See the free trial');
    await page.evaluate(() => { $('result').hidden = true; proMerci(); });
    await expect(page.locator('#proSource p').first()).toHaveText('One last question: how did you hear about DJingood?');
    await expect(page.locator('#proSourceChoix button')).toHaveText(['TikTok', 'Instagram', 'YouTube', 'Google', 'A friend', 'Other']);
    expect((await manque(page)).filter(x => x !== 'Nathan')).toEqual([]);   // le prénom du faux compte n'a pas à être traduit
  });

  test('la présentation : le nouveau titre en anglais', async ({ page }) => {
    await page.goto('/presentation.html?lang=en');
    await expect(page.locator('h1')).toHaveText('Your first real transition, in two weeks.');
    await expect(page.locator('.pres-hero .lead')).toHaveText("Got a controller and don't know the first thing about it? Learn to mix on your controller, one move at a time, with your own music.");
    expect(await manque(page)).toEqual([]);
  });
});
