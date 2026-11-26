// Lot 93 « Des quêtes faisables » (signalé par le gardien du lot 92) : une quête du jour n'est tirée que si le joueur peut la
// faire. « À l'oreille » demande Pro (entraînement à l'oreille, chapitre 2) ; « Mode Expert » demande le bouton ⚙ (Grand débutant :
// après le chapitre 1, lot 89) ; « Un combo du chapitre 4 » demande le chapitre 4 ouvert ET pas dans Pro.
const { test, expect } = require('@playwright/test');
const { ouvrir, APPRENTI } = require('./outils');
const { FAUX, dejaConnecte } = require('./faux-firebase');

const S = o => JSON.stringify(o);
const PRO = 'window.DJINGOOD_PRO = true;';   // Pro allumé (les tests le gardent éteint sinon : tests/serveur.js)
const DEBUT = { 'coach-parcours': 'debut' };
const HUIT = { 'coach-lecons': S({ 0: 3, 1: 2, 2: 3 }) };   // trois niveaux réussis : le chapitre 1 pas fini
const SEPT = { 'coach-lecons': S({ 0: 3, 1: 2, 2: 3, 3: 2, 4: 3, 5: 2, 6: 3 }) };   // le chapitre 1 fini (18 étoiles)
const IMPOSSIBLES = ['oreille', 'expert2', 'combo'];
// les quêtes que le tirage du jour peut donner, et celles tirées sur 60 jours de suite (le tirage dépend de la date)
const possibles = page => page.evaluate(() => QUETES.filter(q => !q.dispo || q.dispo()).map(q => q.id));
async function tirees(page){
  const ids = new Set(), d = new Date();
  for (let k = 0; k < 60; k++){
    const t = new Date(d.getFullYear(), d.getMonth(), d.getDate() + k, 12);
    await page.clock.setFixedTime(t);
    for (const id of await page.evaluate(() => { qt.jour = ''; qtJour(); return qt.ids; })) ids.add(id);
  }
  return [...ids];
}

test.describe('Pro allumé, sans abonnement', () => {
  test('Grand débutant, chapitre 1 pas fini : ni « à l’oreille », ni Mode Expert, ni combo', async ({ page }) => {
    const err = await ouvrir(page, { onglet: 'accueil', avant: PRO, stockage: Object.assign({}, DEBUT, HUIT) });
    expect(await page.evaluate(() => proBloque())).toBe(true);
    const p = await possibles(page);
    for (const id of IMPOSSIBLES) expect(p).not.toContain(id);
    expect(p).toEqual(expect.arrayContaining(['quiz3', 'defi', 'reussies4', 'trois3']));   // ce qu'il peut faire reste
    const t = await tirees(page);
    for (const id of IMPOSSIBLES) expect(t).not.toContain(id);
    expect(t.length).toBeGreaterThan(3);
    expect(err).toEqual([]);
  });
  test('Grand débutant, chapitre 1 fini : Mode Expert arrive (⚙ ouvert), toujours ni « à l’oreille » ni combo', async ({ page }) => {
    await ouvrir(page, { onglet: 'accueil', avant: PRO, stockage: Object.assign({}, DEBUT, SEPT) });
    expect(await page.evaluate(() => [optionsOuvertes(), ch4Unlocked(), chapitrePro(4)])).toEqual([true, true, true]);
    const p = await possibles(page);
    expect(p).toContain('expert2');
    expect(p).not.toContain('oreille'); expect(p).not.toContain('combo');
  });
  test('Apprenti DJ (chapitres ouverts d’office) : Mode Expert oui, combo et « à l’oreille » non', async ({ page }) => {
    await ouvrir(page, { onglet: 'accueil', avant: PRO, stockage: Object.assign({}, APPRENTI, { 'coach-lecons': S({ 0: 3 }) }) });
    expect(await page.evaluate(() => ch4Unlocked())).toBe(true);
    const p = await possibles(page);
    expect(p).toContain('expert2');
    expect(p).not.toContain('oreille'); expect(p).not.toContain('combo');
  });
});

test.describe('La quête du quiz (gardien du lot 93)', () => {
  test('sans Pro, « 3 bonnes réponses » demande au moins 3 questions bonus encore à trouver ; abonné ou Pro éteint, toujours', async ({ page }) => {
    const err = await ouvrir(page, { onglet: 'accueil', avant: PRO, stockage: Object.assign({}, DEBUT, HUIT) });
    expect(await page.evaluate(() => qtQuizGratuites())).toBe(17);   // 14 questions du chapitre 1 et 3 de culture générale
    expect(await possibles(page)).toContain('quiz3');
    // 15 trouvées : il n'en reste que 2, la quête ne pourrait plus être finie
    await page.evaluate(() => { quizOk = QUIZ.filter(q => /^[bg]/.test(q[1])).slice(0, 15).map(q => q[0]); });
    expect(await page.evaluate(() => qtQuizGratuites())).toBe(2);
    expect(await possibles(page)).not.toContain('quiz3');
    for (const id of await tirees(page)) expect(id).not.toBe('quiz3');
    // les questions du chapitre 3 (c…) ne comptent pas : leur chapitre est dans Pro
    expect(await page.evaluate(() => QUIZ.some(q => q[1][0] === 'c' && !quizOk.includes(q[0])))).toBe(true);
    expect(err).toEqual([]);
  });
  test('Pro éteint, il ne reste que 2 questions bonus : la quête du quiz reste possible (le quiz éclair est ouvert)', async ({ page }) => {
    await ouvrir(page, { onglet: 'accueil', stockage: Object.assign({}, DEBUT, HUIT) });
    await page.evaluate(() => { quizOk = QUIZ.filter(q => /^[bg]/.test(q[1])).slice(0, 15).map(q => q[0]); });
    expect(await possibles(page)).toContain('quiz3');
  });
});

test.describe('Abonné, ou Pro éteint : rien ne change', () => {
  test('un abonné peut recevoir « à l’oreille » et le combo', async ({ page }) => {
    await page.route('**/api/pro', r => r.fulfill({ status: 200, contentType: 'application/json',
      body: S({ pro: true, formule: 'an', jusqua: 1826000000, annule: false, essai: false }) }));
    const err = await ouvrir(page, { onglet: 'accueil', avant: dejaConnecte() + FAUX + PRO, stockage: Object.assign({}, DEBUT, SEPT) });
    await expect.poll(() => page.evaluate(() => proActif()), { timeout: 15000 }).toBe(true);
    const p = await possibles(page);
    for (const id of IMPOSSIBLES) expect(p).toContain(id);
    expect(err).toEqual([]);
  });
  test('Pro éteint : « à l’oreille » et le combo restent possibles ; Mode Expert suit toujours ⚙', async ({ page }) => {
    await ouvrir(page, { onglet: 'accueil', stockage: Object.assign({}, APPRENTI, { 'coach-lecons': S({ 0: 3 }) }) });
    expect(await page.evaluate(() => proBloque())).toBe(false);
    const p = await possibles(page);
    for (const id of IMPOSSIBLES) expect(p).toContain(id);
  });
  test('les quêtes déjà tirées aujourd’hui restent jusqu’à minuit', async ({ page }) => {
    const d = new Date(), jour = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
    await ouvrir(page, { onglet: 'accueil', avant: PRO, stockage: Object.assign({}, DEBUT, HUIT,
      { 'coach-quetes': S({ jour, ids: ['demo', 'oreille', 'combo'], cpt: {}, ouverts: [], xp: 0 }) }) });
    await expect(page.locator('#qtList .qt')).toHaveCount(3);
    expect(await page.evaluate(() => qt.ids)).toEqual(['demo', 'oreille', 'combo']);
  });
});
