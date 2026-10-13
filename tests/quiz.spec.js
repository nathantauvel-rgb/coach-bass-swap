// Quiz (question bonus, quiz éclair) et badges.
const { test, expect } = require('@playwright/test');
const { ouvrir, sansBandeau, jouer } = require('./outils');

const S = o => JSON.stringify(o);
const JOUE = { 'coach-parcours': 'debut', 'coach-lecons': S({ 0: 3, 1: 2, 2: 3 }) };
const stocke = (page, cle) => page.evaluate(k => JSON.parse(localStorage.getItem(k) || 'null'), cle);
const badges = page => page.locator('#homeBadges li.won strong').allTextContents();
// Répond à la question affichée : la bonne réponse est lue dans la liste QUIZ du site
async function repondre(page, juste = true) {
  const question = await page.locator('#qText').textContent();
  const bonne = await page.evaluate(q => QUIZ.find(x => x[2] === q)[3][0], question);
  const choix = page.locator('#qOpts .qopt');
  await expect(choix).toHaveCount(3);
  if (juste) await choix.getByText(bonne, { exact: true }).click();
  else await choix.filter({ hasNotText: bonne }).first().click();
  return bonne;
}

test.describe('Contenu du quiz', () => {
  test('chaque question a un identifiant unique, trois réponses différentes et une explication', async ({ page }) => {
    await ouvrir(page);
    const q = await page.evaluate(() => QUIZ);
    expect(q.length).toBe(25);
    expect(new Set(q.map(x => x[0])).size).toBe(q.length);
    for (const [id, niveau, question, reponses, pourquoi] of q) {
      expect(niveau, id).toMatch(/^(b[0-6]|c[0-3]|g)$/);
      expect(question.length, id).toBeGreaterThan(10); expect(pourquoi.length, id).toBeGreaterThan(10);
      expect(reponses.length, id).toBe(3); expect(new Set(reponses).size, id).toBe(3);
    }
    // deux questions par niveau des chapitres 1 et 3
    for (const n of ['b0', 'b1', 'b2', 'b3', 'b4', 'b5', 'b6', 'c0', 'c1', 'c2', 'c3']) expect(q.filter(x => x[1] === n).length, n).toBe(2);
  });
});

test.describe('Badges sur l\'accueil', () => {
  test('quelqu\'un qui a déjà joué retrouve ses badges, sans rien faire', async ({ page }) => {
    const erreurs = await ouvrir(page, { onglet: '', stockage: JOUE });
    await expect(page.locator('#homeBadges li')).toHaveCount(13);
    expect(await badges(page)).toEqual(['Premier pas', 'Bon timing', 'Swap propre']);
    await expect(page.locator('#badgeCount')).toHaveText('3 sur 13');
    expect(await stocke(page, 'coach-badges')).toEqual(['pas', 'timing', 'swap']);
    expect(erreurs).toEqual([]); await sansBandeau(page);
  });
  test('sans progression, aucun badge', async ({ page }) => {
    await ouvrir(page, { onglet: '', stockage: { 'coach-parcours': 'debut' } });
    await expect(page.locator('#homeBadges li')).toHaveCount(13);
    await expect(page.locator('#homeBadges li.won')).toHaveCount(0);
    await expect(page.locator('#badgeCount')).toHaveText('0 sur 13');
  });
  test('toute la progression donne les 13 badges', async ({ page }) => {
    const trois = S({ 0: 3, 1: 3, 2: 3, 3: 3, 4: 3, 5: 3, 6: 3 });
    await ouvrir(page, { onglet: '', stockage: { 'coach-parcours': 'debut', 'coach-lecons': trois, 'coach-ch2': trois, 'coach-ch3': S({ 0: 2, 1: 2, 2: 2, 3: 2 }),
      'coach-entrainement': S({ streak: 7, setBest: 8 }), 'coach-missions': S({ pair: '', done: {}, total: 1 }), 'coach-quiz': S(['b0a', 'b0b', 'b1a', 'b1b', 'b2a', 'b2b', 'b3a', 'b3b', 'b4a', 'b4b']) } });
    await expect(page.locator('#homeBadges li.won')).toHaveCount(13);
    await expect(page.locator('#badgeCount')).toHaveText('13 sur 13');
  });
  test('un badge gagné reste gagné, même si la série de jours est perdue', async ({ page }) => {
    await ouvrir(page, { onglet: '', stockage: { 'coach-parcours': 'debut', 'coach-badges': S(['regulier']), 'coach-entrainement': S({ streak: 1 }) } });
    expect(await badges(page)).toEqual(['Régulier']);
  });
  test('des données abîmées ne bloquent pas la page et ne donnent rien', async ({ page }) => {
    const erreurs = await ouvrir(page, { onglet: '', stockage: { 'coach-parcours': 'debut', 'coach-badges': '{oops', 'coach-quiz': '"x"' } });
    await expect(page.locator('#homeBadges li.won')).toHaveCount(0);
    await expect(page.locator('#xpTxt')).toHaveText('0 XP');
    expect(erreurs).toEqual([]); await sansBandeau(page);
  });
  test('les identifiants inconnus sont ignorés', async ({ page }) => {
    await ouvrir(page, { onglet: '', stockage: { 'coach-parcours': 'debut', 'coach-badges': S(['pas', 'licorne']), 'coach-quiz': S(['b0a', 'zzz', 'b0a']) } });
    expect(await badges(page)).toEqual(['Premier pas']);
    await expect(page.locator('#xpTxt')).toHaveText('5 XP');
  });
});

test.describe('Quiz éclair', () => {
  test('verrouillé tant qu\'aucun niveau n\'a été joué', async ({ page }) => {
    await ouvrir(page, { onglet: 'entrainer' });
    await expect(page.locator('#quizCard')).toBeDisabled();
  });
  test('cinq bonnes réponses : 25 XP, enregistrées une seule fois', async ({ page }) => {
    const erreurs = await ouvrir(page, { onglet: 'entrainer', stockage: JOUE });
    await expect(page.locator('#tQuizS')).toHaveText('Nouveau');
    await expect(page.locator('#xpTxt')).toHaveText('80 XP');
    await page.locator('#quizCard').click();
    await expect(page.locator('#quiz')).toBeVisible();
    for (let i = 1; i <= 5; i++) {
      await expect(page.locator('#qKick')).toHaveText(`Quiz éclair · question ${i} sur 5`);
      const bonne = await repondre(page);
      await expect(page.locator('#qOpts .qopt.ok')).toHaveText(bonne);
      await expect(page.locator('#qWhy')).toContainText('Bonne réponse · +5 XP');
      await page.locator('#qNext').click();
    }
    await expect(page.locator('#qText')).toHaveText('5 bonnes réponses sur 5');
    await expect(page.locator('#qWhy')).toContainText('+25 XP');
    await expect(page.locator('#xpTxt')).toHaveText('105 XP');
    const trouvees = await stocke(page, 'coach-quiz');
    expect(trouvees.length).toBe(5);
    // seulement des questions sur les niveaux joués (1 à 3) ou de culture générale
    expect(trouvees.every(id => /^(b[0-2][ab]|g\d)$/.test(id))).toBe(true);
    await page.locator('#qNext').click();
    await expect(page.locator('#quiz')).toBeHidden();
    await expect(page.locator('#tQuizS')).toHaveText('5 sur 25 trouvées');
    // un deuxième quiz propose d'abord les questions pas encore trouvées
    await page.locator('#quizCard').click();
    const q2 = await page.locator('#qText').textContent();
    expect(trouvees).not.toContain(await page.evaluate(q => QUIZ.find(x => x[2] === q)[0], q2));
    expect(erreurs).toEqual([]); await sansBandeau(page);
  });
  test('une mauvaise réponse montre la bonne, explique, et ne donne pas d\'XP', async ({ page }) => {
    await ouvrir(page, { onglet: 'entrainer', stockage: JOUE });
    await page.locator('#quizCard').click();
    const bonne = await repondre(page, false);
    await expect(page.locator('#qOpts .qopt.bad')).toHaveCount(1);
    await expect(page.locator('#qOpts .qopt.ok')).toHaveText(bonne);
    await expect(page.locator('#qWhy')).toContainText('Pas tout à fait.');
    // un second clic ne change plus rien
    await page.locator('#qOpts .qopt.ok').click();
    await expect(page.locator('#qWhy')).toContainText('Pas tout à fait.');
    expect(await stocke(page, 'coach-quiz')).toBeNull();
    await expect(page.locator('#xpTxt')).toHaveText('80 XP');
  });
  test('la dixième bonne réponse donne le badge « Tête bien faite »', async ({ page }) => {
    await ouvrir(page, { onglet: 'entrainer', stockage: Object.assign({}, JOUE, { 'coach-quiz': S(['b0a', 'b0b', 'b1a', 'b1b', 'b2a', 'b2b', 'g0', 'g1', 'b3a']) }) });
    await page.locator('#quizCard').click();
    await expect(page.locator('#qText')).toHaveText('Que veut dire BPM ?');
    await repondre(page);
    await expect(page.locator('#qBadge')).toHaveText('Nouveau badge : Tête bien faite');
    expect(await stocke(page, 'coach-badges')).toContain('tete');
  });
  test('Échap, la croix et un changement d\'onglet ferment le quiz', async ({ page }) => {
    await ouvrir(page, { onglet: 'entrainer', stockage: JOUE });
    await page.locator('#quizCard').click(); await page.keyboard.press('Escape');
    await expect(page.locator('#quiz')).toBeHidden();
    await page.locator('#quizCard').click(); await page.locator('#qClose').click();
    await expect(page.locator('#quiz')).toBeHidden();
    await page.locator('#quizCard').click(); await page.evaluate(() => { location.hash = '#accueil'; });
    await expect(page.locator('#vHome')).toBeVisible();
    await expect(page.locator('#quiz')).toBeHidden();
  });
});

test.describe('Question bonus après un niveau', () => {
  test('niveau réussi : badge annoncé, question bonus, 5 XP, puis retour à la carte de résultat', async ({ page }) => {
    test.setTimeout(150000);
    const erreurs = await ouvrir(page);
    await page.locator('.node').nth(0).click();
    await jouer(page);
    await page.waitForFunction(() => beatNow() >= 31.6, null, { timeout: 60000, polling: 'raf' });
    await page.keyboard.press('Space');
    await expect(page.locator('#result')).toBeVisible({ timeout: 90000 });
    await expect(page.locator('#rStars span.on')).toHaveCount(3);
    await expect(page.locator('#rBadge')).toHaveText('Nouveaux badges : Premier pas, Bon timing');
    await expect(page.locator('#xpTxt')).toHaveText('30 XP');
    await page.locator('#quizBtn').click();
    await expect(page.locator('#qKick')).toHaveText('Question bonus');
    await expect(page.locator('#qText')).toHaveText('Quel est le bon moment pour lancer le morceau B ?');
    await repondre(page);
    await expect(page.locator('#xpTxt')).toHaveText('35 XP');
    await page.locator('#qNext').click();
    await expect(page.locator('#quiz')).toBeHidden();
    await expect(page.locator('#result')).toBeVisible();
    await expect(page.locator('#quizBtn')).toBeHidden();
    expect(await stocke(page, 'coach-quiz')).toEqual(['b0a']);
    expect(await stocke(page, 'coach-lecons')).toEqual({ 0: 3 });
    expect(erreurs).toEqual([]); await sansBandeau(page);
  });
  test('niveau raté : pas de question bonus', async ({ page }) => {
    await ouvrir(page);
    await page.evaluate(() => { $('result').hidden = false; quizOffer(1); });
    await expect(page.locator('#quizBtn')).toBeHidden();
    await page.evaluate(() => quizOffer(2));
    await expect(page.locator('#quizBtn')).toBeVisible();
  });
  test('Échap ferme la question sans fermer la carte de résultat', async ({ page }) => {
    await ouvrir(page);
    await page.evaluate(() => { $('result').hidden = false; quizOffer(2); });
    await page.locator('#quizBtn').click();
    await expect(page.locator('#quiz')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.locator('#quiz')).toBeHidden();
    await expect(page.locator('#result')).toBeVisible();
  });
});

test.describe('Badge « Pour de vrai »', () => {
  test('valider une première paire donne le badge', async ({ page }) => {
    await ouvrir(page, { onglet: 'vrai' });
    await page.locator('#rbDemo').click();
    await page.locator('#rbPairs .duo').first().click();
    for (let i = 0; i < 6; i++) await page.locator('#rbMissions input').nth(i).check();
    await expect(page.locator('#rbDone')).toContainText('Nouveau badge : Pour de vrai.');
    expect(await stocke(page, 'coach-badges')).toEqual(['vrai']);
  });
});
