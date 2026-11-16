// Lot 72 : « Ma musique » (ancien « Passer au vrai »). La liste des morceaux (recherche, styles, filtres, tri), la fiche « Ce qui va
// avec », préparer la transition (technique, missions), les favoris, vus récemment, les adresses et le bouton retour, l'import
// d'un export rekordbox, les anciennes données, et sans abonnement (l'import et une fiche offerts).
const { test, expect } = require('@playwright/test');
const { ouvrir, sansBandeau } = require('./outils');

const S = o => JSON.stringify(o);
const PRO = 'window.DJINGOOD_PRO = true;';
const lignes = page => page.locator('#mmListe .mm-ligne');
const titres = page => page.locator('#mmListe .mm-l-t b').allTextContents();
const noms = page => page.locator('#mmFiche .mm-c-nom').allTextContents();
// Les phrases de Vini ont des espaces insécables avant « : », « ! », « ? » : on les compare avec des espaces ordinaires
const dit = page => page.locator('#realTip').evaluate(e => e.textContent.replace(/ /g, ' '));
const cle = (page, titre) => page.evaluate(t => rbCles[rbLib.findIndex(x => x[0] === t)], titre);
async function exemple(page, o = {}){
  const erreurs = await ouvrir(page, Object.assign({ onglet: 'musique' }, o));
  await page.locator('#rbDemo').click();
  await expect(lignes(page)).toHaveCount(24);
  return erreurs;
}
async function fiche(page, titre){
  await page.locator('#mmListe .mm-ouvre').filter({ has: page.locator('.mm-l-t b', { hasText: titre }) }).first().click();
  await expect(page.locator('#mmFiche h1')).toHaveText(titre);
}
const preparer = (page, n = 0) => page.locator('#mmFiche .mm-carte').nth(n).locator('[data-mm="paire"]').click();
// Un curseur du tempo : on lui donne une valeur, comme si on l'avait glissé
const regle = (page, f, v) => page.locator(`#mmPanneau input[data-f="${f}"]`).evaluate((e, v) => { e.value = v; e.dispatchEvent(new Event('input', { bubbles: true })); e.dispatchEvent(new Event('change', { bubbles: true })); }, v);

test.describe('Avant l’import', () => {
  test('l’onglet « Ma musique », le titre, un gros bouton, l’exemple et un aperçu de ce qu’on obtient', async ({ page }) => {
    const erreurs = await ouvrir(page, { onglet: 'musique' });
    await expect(page.locator('#tabs a[data-view=vrai]')).toHaveText('Ma musique');
    await expect(page.locator('#tabs a[data-view=vrai]')).toHaveAttribute('aria-current', 'page');
    await expect(page.locator('#rbEmpty h1')).toHaveText('Mixe ta musique');
    await expect(page.locator('#rbPick')).toHaveText('Importer ma collection rekordbox');
    await expect(page.locator('#rbDemo')).toHaveText('Essayer avec des morceaux d’exemple');
    await expect(page.locator('#mmApercu .mm-ap-p')).toHaveCount(3);
    await expect(page.locator('#mmApercu .mm-ap-tech').first()).toHaveText('Le swap des basses');
    await expect(page.locator('#mmOffre')).toBeHidden();   // Pro éteint pendant les tests : tout est ouvert, rien n'est « offert »
    expect(await dit(page)).toBe('Montre-moi ta collection rekordbox : je te trouve les morceaux qui vont ensemble.');
    expect(erreurs).toEqual([]); await sansBandeau(page);
  });
  test('l’ancienne adresse #vrai mène à Ma musique', async ({ page }) => {
    await ouvrir(page, { onglet: 'vrai' });
    await expect(page.locator('#vReal')).toBeVisible();
    await expect(page.locator('#tabs a[data-view=vrai]')).toHaveAttribute('aria-current', 'page');
    await expect(page.locator('#tabs a[data-view=vrai]')).toHaveAttribute('href', '#musique');
  });
});

test.describe('Mes morceaux', () => {
  test('toute la collection, les plus récents d’abord, avec le style, le tempo, la tonalité et la date', async ({ page }) => {
    const erreurs = await exemple(page);
    await expect(page.locator('#rbSum')).toHaveText('24 morceaux · collection d’exemple');
    expect((await titres(page)).slice(0, 3)).toEqual(['Fil rouge', 'Tambours', 'Après minuit']);
    const l = lignes(page).nth(2);
    await expect(l.locator('.mm-l-s')).toHaveText('Afro House');
    await expect(l.locator('.mm-l-b')).toHaveText('122');
    await expect(l.locator('.mm-cle')).toHaveText('8A');
    await expect(l.locator('.mm-l-d')).toHaveText('il y a 4 jours');
    await expect(lignes(page).first().locator('.mm-l-t small')).toHaveText('Noé Marlo · jamais joué');
    await expect(lignes(page).first().locator('.mm-coeur')).toHaveAttribute('aria-pressed', 'false');   // et non "" (gardien)
    await expect(page.locator('#mmStyles .mm-chip').nth(1)).toHaveAttribute('aria-pressed', 'false');
    await expect(page.locator('#mmStyles .mm-chip')).toHaveText(['Tous les styles24', 'Afro House9', 'Deep House5', 'House & Nu Disco4', 'Melodic House & Techno3', 'Tech House3']);
    await expect(page.locator('#mmNbM')).toHaveText('24');
    await expect(page.locator('#mmPdj')).toBeVisible();
    await expect(page.locator('#mmOnglets a[aria-current="page"]')).toHaveAttribute('data-mm-onglet', 'morceaux');
    expect(await dit(page)).toBe('Choisis un morceau que tu aimes : je te montre ceux qui vont avec.');
    expect(erreurs).toEqual([]); await sansBandeau(page);
  });
  test('la recherche, un style, le tri', async ({ page }) => {
    await exemple(page);
    await page.locator('#mmQ').fill('kora');
    expect(await titres(page)).toEqual(['Tambours', 'Savane']);
    await page.locator('#mmQ').fill('');
    await page.locator('#mmStyles .mm-chip', { hasText: 'Tech House' }).click();
    expect(await titres(page)).toEqual(['Fièvre', 'Piscine vide', 'Dernier métro']);
    expect(await dit(page)).toBe('3 morceaux correspondent. Choisis-en un !');
    await page.locator('#mmTri').selectOption('bpm');
    expect(await titres(page)).toEqual(['Dernier métro', 'Piscine vide', 'Fièvre']);
    await page.locator('#mmStyles .mm-chip', { hasText: 'Tous les styles' }).click();
    await page.locator('#mmTri').selectOption('lect');
    expect((await titres(page))[0]).toBe('Soleil noir');
  });
  test('les filtres : rangés derrière un bouton, en pastilles une fois choisis', async ({ page }) => {
    await exemple(page);
    await expect(page.locator('#mmPanneau')).toBeHidden();
    await page.locator('#mmFiltresBtn').click();
    await expect(page.locator('#mmPanneau')).toBeVisible();
    await expect(page.locator('#mmFiltresBtn')).toHaveAttribute('aria-expanded', 'true');
    await expect(page.locator('#mmPanneau .mm-pg-t')).toHaveText(['Tempo', 'Tonalité', 'Playlist rekordbox', 'Afficher seulement']);
    await page.locator('#mmPl').selectOption({ label: 'Nouveautés (6)' });
    await expect(lignes(page)).toHaveCount(6);
    await page.locator('#mmPanneau .mm-tog', { hasText: 'Jamais joués' }).click();
    await expect(lignes(page)).toHaveCount(4);
    await expect(page.locator('#mmActifs .mm-actif')).toHaveText(['Playlist « Nouveautés »', 'Jamais joués']);
    await expect(page.locator('#mmFiltresN')).toHaveText('2');
    await page.locator('#mmActifs .mm-actif', { hasText: 'Jamais joués' }).click();
    await expect(lignes(page)).toHaveCount(6);
    await regle(page, 'tmin', 123);
    await expect(lignes(page)).toHaveCount(3);
    await expect(page.locator('#mmTempoV')).toHaveText('De 123 à 127 BPM');
    await page.locator('#mmPanneau [data-mm="effacer"]').click();
    await expect(lignes(page)).toHaveCount(24);
    await expect(page.locator('#mmActifs')).toBeHidden();
    await page.locator('#mmPanneau .mm-tog', { hasText: 'Ajoutés depuis moins d’un mois' }).click();
    await expect(lignes(page)).toHaveCount(9);
    await page.locator('#mmQ').fill('zzz');
    await expect(page.locator('#mmListe .mm-vide')).toContainText('Aucun morceau ne correspond');
  });
  test('beaucoup de morceaux : 100 d’abord, puis « Afficher plus »', async ({ page }) => {
    const t = Array.from({ length: 250 }, (_, i) => ['Morceau ' + String(i).padStart(3, '0'), 'Artiste', 'House', 120 + (i % 8), (1 + i % 12) + 'A']);
    await ouvrir(page, { onglet: 'musique', stockage: { 'coach-collection': S({ v: 2, n: 'grosse', t, p: [] }) } });
    await expect(lignes(page)).toHaveCount(100);
    await expect(page.locator('#mmPlus')).toHaveText('Afficher 100 morceaux de plus (150 restants)');
    await page.locator('#mmPlus').click();
    await expect(lignes(page)).toHaveCount(200);
    await expect(page.locator('#mmPlus')).toHaveText('Afficher 50 morceaux de plus (50 restants)');
  });
  test('un seul morceau de plus : au singulier', async ({ page }) => {
    const t = Array.from({ length: 101 }, (_, i) => ['Morceau ' + String(i).padStart(3, '0'), 'Artiste', 'House', 124, '8A']);
    await ouvrir(page, { onglet: 'musique', stockage: { 'coach-collection': S({ v: 2, n: 'x', t, p: [] }) } });
    await expect(page.locator('#mmPlus')).toHaveText('Afficher 1 morceau de plus (1 restant)');
  });
});

test.describe('Ce qui va avec', () => {
  test('la fiche d’un morceau : les 5 meilleurs, pourquoi, la technique, puis les autres', async ({ page }) => {
    const erreurs = await exemple(page);
    const k = await cle(page, 'Après minuit');
    await fiche(page, 'Après minuit');
    await expect(page).toHaveURL(new RegExp('#musique/morceau/' + k + '$'));
    await expect(page.locator('#mmOnglets')).toBeHidden();
    await expect(page.locator('#mmFiche .mm-f-meta > span')).toHaveText(['122 BPM', 'Tonalité 8A', 'Afro House', 'Ajouté il y a 4 jours', '4 lectures', 'Soirée samedi · Coups de cœur']);
    const cartes = page.locator('#mmFiche .mm-carte');
    await expect(cartes).toHaveCount(5);
    expect(await noms(page)).toEqual(['Soleil noir', 'Néon rose', 'Terre rouge', 'Marée haute', 'Les quais']);
    await expect(cartes.first().locator('.mm-note-r b')).toHaveText('100');
    await expect(cartes.first().locator('.mm-note small')).toHaveText('Parfait');
    await expect(cartes.first().locator('.mm-pourquoi')).toContainText('même tempo');
    await expect(cartes.first().locator('.mm-c-t b')).toHaveText('Le swap des basses');
    await expect(cartes.first().locator('.mm-diff')).toHaveText('Facile');
    await expect(page.locator('#mmFiche .mm-carte .mm-c-t b', { hasText: 'Le filtre qui ouvre' })).toHaveCount(0);
    expect(await dit(page)).toBe('Voilà les morceaux de ta collection qui vont le mieux après « Après minuit ». Le premier, c’est un sans-faute.');
    await page.locator('#mmFiche [data-mm="plusf"]').click();
    await expect(cartes).toHaveCount(12);
    await expect(cartes.filter({ hasText: 'Tambours' }).locator('.mm-c-t b')).toHaveText('Le filtre qui ouvre');
    await expect(cartes.filter({ hasText: 'Piscine vide' }).locator('.mm-c-t b')).toHaveText('L’écho out');
    await expect(cartes.filter({ hasText: 'Grand bleu' }).locator('.mm-c-t b')).toHaveText('Caler, puis swap des basses');
    expect(erreurs).toEqual([]); await sansBandeau(page);
  });
  test('l’ambiance, même style, même tempo', async ({ page }) => {
    await exemple(page);
    await fiche(page, 'Après minuit');
    await page.locator('#mmFiche [data-mm="amb"][data-v="calmer"]').click();
    expect(await noms(page)).toEqual(['Terre rouge', 'Lumière noire', 'Matin clair']);
    await page.locator('#mmFiche [data-mm="amb"][data-v="garder"]').click();
    expect(await noms(page)).toEqual(['Soleil noir', 'Les quais']);
    await page.locator('#mmFiche [data-mm="amb"][data-v=""]').click();
    await page.locator('#mmFiche .mm-tog', { hasText: 'Même style' }).click();
    expect(await noms(page)).toEqual(['Soleil noir', 'Néon rose', 'Terre rouge', 'Tambours']);
    await page.locator('#mmFiche .mm-tog', { hasText: 'Même style' }).click();
    await page.locator('#mmFiche .mm-tog', { hasText: 'Même tempo' }).click();
    expect(await noms(page)).toEqual(['Soleil noir', 'Néon rose', 'Les quais']);   // « même tempo », comme sur les cartes (moins de 0,5 % d'écart)
  });
  test('un morceau sans tempo, ou qui ne va avec rien', async ({ page }) => {
    const t = [['Sans tempo', 'A', 'House', 0, '8A'], ['Seul au monde', 'B', 'House', 124, '8A'], ['Trop loin', 'C', 'Techno', 140, '2B']];
    const erreurs = await ouvrir(page, { onglet: 'musique', stockage: { 'coach-collection': S({ v: 2, n: 'x', t, p: [] }) } });
    await fiche(page, 'Sans tempo');
    await expect(page.locator('#mmFiche .mm-vide')).toContainText('rekordbox n’a pas encore analysé ce morceau');
    expect(await dit(page)).toBe('Ce morceau n’est pas encore analysé par rekordbox.');
    await page.locator('#mmFiche [data-mm="liste"]').click();
    await fiche(page, 'Seul au monde');
    await expect(page.locator('#mmFiche .mm-vide')).toContainText('Aucun morceau de ta collection ne va vraiment avec celui-là');
    expect(erreurs).toEqual([]);
  });
});

test.describe('Préparer la transition', () => {
  test('les deux platines, la technique, l’exercice, les missions une par une', async ({ page }) => {
    const erreurs = await exemple(page);
    await fiche(page, 'Après minuit');
    await preparer(page);
    await expect(page).toHaveURL(/#musique\/paire\/m[0-9a-z-]+\/m[0-9a-z-]+$/);
    await expect(page.locator('#mmPaire .mm-t-deck.a b')).toHaveText('Après minuit');
    await expect(page.locator('#mmPaire .mm-t-deck.b b')).toHaveText('Soleil noir');
    await expect(page.locator('#mmPaire .mm-t-tt h2')).toHaveText('Le swap des basses');
    await expect(page.locator('#mmPaire .mm-t-tech p')).toContainText('Même tempo (122 et 122 BPM), même tonalité (8A et 8A)');
    await expect(page.locator('#mmPaire [data-mm="exo"]')).toContainText('Chapitre 1 · niveau 6 · Le swap des basses');
    await expect(page.locator('#mmPaire .mm-retour')).toHaveText('‹ Ce qui va après « Après minuit »');
    await expect(page.locator('#mmPaire .mm-m-tete b')).toHaveText('Mission 1 sur 6');
    await expect(page.locator('#mmPaire .mm-t-mis h3')).toHaveText('Prépare tes deux morceaux');
    await expect(page.locator('#mmPaire [data-mm="mprec"]')).toBeDisabled();
    await page.locator('#mmPaire [data-mm="mok"]').click();
    await expect(page.locator('#mmPaire .mm-m-tete b')).toHaveText('Mission 2 sur 6');
    await expect(page.locator('#mmPaire .mm-m-points i.ok')).toHaveCount(1);
    await page.locator('#mmPaire [data-mm="mprec"]').click();
    await expect(page.locator('#mmPaire .mm-m-tete b')).toHaveText('Mission 1 sur 6');
    await page.locator('#mmPaire [data-mm="mtoutes"]').click();
    await expect(page.locator('#mmPaire .mm-m-liste li')).toHaveCount(6);
    await page.locator('#mmPaire .mm-m-liste li').nth(2).locator('label').click();
    await expect(page.locator('#mmPaire .mm-m-liste li.ok')).toHaveCount(3);
    await page.reload();
    await expect(page.locator('#mmPaire .mm-m-tete b')).toHaveText('Mission 4 sur 6');
    expect(erreurs).toEqual([]); await sansBandeau(page);
  });
  test('« M’entraîner sur le site » ouvre le niveau de la technique, même pas encore atteint (gardien)', async ({ page }) => {
    await exemple(page, { verrou: true });   // les niveaux s'ouvrent dans l'ordre : le swap des basses n'est pas encore atteint
    await fiche(page, 'Après minuit');
    await preparer(page);
    await page.locator('#mmPaire [data-mm="exo"]').click();
    await expect(page.locator('#vLearn')).toBeVisible();
    await expect(page.locator('#lnum')).toHaveText('Niveau 6 sur 7');
    expect(await page.evaluate(() => [chapter, li])).toEqual([1, 5]);
  });
  test('« M’entraîner » vers le chapitre 5 encore fermé : le niveau s’ouvre pour cette fois (gardien)', async ({ page }) => {
    const t = [['Lent', 'A', 'House', 122, '8A'], ['Rapide', 'B', 'House', 124, '8A']];
    await ouvrir(page, { onglet: 'musique', verrou: true, stockage: { 'coach-collection': S({ v: 2, n: 'x', t, p: [] }), 'coach-parcours': 'debut' } });
    await fiche(page, 'Lent');
    await preparer(page);
    await expect(page.locator('#mmPaire .mm-t-tt h2')).toHaveText('Caler, puis swap des basses');
    await expect(page.locator('#mmPaire [data-mm="exo"]')).toContainText('Chapitre 5 · niveau 3 · La bonne vitesse');
    await page.locator('#mmPaire [data-mm="exo"]').click();
    await expect(page.locator('#vLearn')).toBeVisible();
    await expect.poll(() => page.evaluate(() => [chapter, li])).toEqual([5, 2]);
  });
  test('les 6 missions faites : la paire est validée, et ne compte qu’une fois', async ({ page }) => {
    await exemple(page);
    await fiche(page, 'Après minuit');
    await preparer(page);
    for (let i = 0; i < 6; i++) await page.locator('#mmPaire [data-mm="mok"]').click();
    await expect(page.locator('#mmPaire .mm-bravo')).toContainText('Bravo, les 6 missions sont faites !');
    await expect(page.locator('#mmPaire .mm-m-liste li.ok')).toHaveCount(6);
    const total = () => page.evaluate(() => JSON.parse(localStorage.getItem('coach-missions')).total);
    expect(await total()).toBe(1);
    await page.locator('#mmPaire .mm-m-liste li').nth(5).locator('label').click();
    await expect(page.locator('#mmPaire .mm-m-liste li.ok')).toHaveCount(5);
    await page.locator('#mmPaire .mm-m-liste li').nth(5).locator('label').click();
    await expect(page.locator('#mmPaire .mm-bravo')).toBeVisible();
    expect(await total()).toBe(1);
    await page.locator('#mmPaire [data-mm="fiche"]', { hasText: 'Choisir une autre transition' }).click();
    await expect(page.locator('#mmFiche h1')).toHaveText('Après minuit');
  });
});

test.describe('Favoris et vus récemment', () => {
  test('♥ sur un morceau et sur une paire : on les retrouve dans Mes favoris', async ({ page }) => {
    const erreurs = await exemple(page);
    await lignes(page).nth(2).locator('.mm-coeur').click();
    await expect(lignes(page).nth(2).locator('.mm-coeur')).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('#mmNbF')).toHaveText('1');
    await fiche(page, 'Après minuit');
    await page.locator('#mmFiche .mm-carte').nth(1).locator('[data-mm="coeurp"]').click();
    await expect(page.locator('#mmFiche .mm-carte').nth(1).locator('[data-mm="coeurp"]')).toHaveAttribute('aria-pressed', 'true');
    await page.locator('#mmFiche [data-mm="liste"]').click();
    await page.locator('#mmOnglets a[data-mm-onglet="favoris"]').click();
    await expect(page).toHaveURL(/#musique\/favoris$/);
    await expect(page.locator('#mmFavoris .mm-p-ligne .mm-p-t b')).toHaveText(['Après minuit', 'Néon rose']);
    await expect(page.locator('#mmFavoris .mm-st')).toHaveText('Pas commencée');
    await expect(page.locator('#mmFavoris .mm-ligne .mm-l-t b')).toHaveText(['Après minuit']);
    expect(await dit(page)).toBe('Tes paires gardées et tes morceaux aimés. Il te reste 1 paire à terminer !');
    await page.locator('#mmFavoris .mm-p-ligne-boite .mm-coeur').click();
    await expect(page.locator('#mmFavoris .mm-p-ligne')).toHaveCount(0);
    expect(await page.evaluate(() => JSON.parse(localStorage.getItem('coach-musique')).favP)).toEqual([]);
    expect(erreurs).toEqual([]);
  });
  test('vus récemment : les fiches et les paires, du plus récent au plus ancien', async ({ page }) => {
    await exemple(page);
    await fiche(page, 'Tambours');
    await page.locator('#mmFiche [data-mm="liste"]').click();
    await fiche(page, 'Après minuit');
    await preparer(page);
    await page.locator('#mmPaire .mm-retour').click();
    await expect(page.locator('#mmFiche h1')).toHaveText('Après minuit');
    await page.locator('#mmFiche [data-mm="liste"]').click();
    await page.locator('#mmOnglets a[data-mm-onglet="recents"]').click();
    const L = page.locator('#mmRecents .mm-p-ligne-boite');
    await expect(L).toHaveCount(3);
    await expect(L.locator('.mm-r-k')).toHaveText(['Fiche', 'Paire', 'Fiche']);
    await expect(L.first()).toContainText('Après minuit');
    await expect(L.nth(2)).toContainText('Tambours');
    await expect(L.first().locator('.mm-r-q')).toHaveText('à l’instant');
    await L.nth(1).locator('.mm-p-ligne').click();
    await expect(page.locator('#mmPaire .mm-t-deck.b b')).toHaveText('Soleil noir');
  });
  test('les favoris et vus récemment restent sur cet ordinateur (ils ne suivent pas le compte)', async ({ page }) => {
    await ouvrir(page, { onglet: 'musique' });
    expect(await page.evaluate(() => CPT_LOCAL.includes('coach-musique') && CPT_LOCAL.includes('coach-collection'))).toBe(true);
  });
});

test.describe('Les adresses et le bouton retour', () => {
  test('chaque page a son adresse : retour et avance du navigateur', async ({ page }) => {
    await exemple(page);
    await fiche(page, 'Après minuit');
    await preparer(page);
    await page.goBack();
    await expect(page.locator('#mmFiche h1')).toHaveText('Après minuit');
    await page.goBack();
    await expect(page.locator('#mmMorceaux')).toBeVisible();
    await expect(page.locator('#mmOnglets')).toBeVisible();
    await page.goForward();
    await expect(page.locator('#mmFiche h1')).toHaveText('Après minuit');
    await page.locator('#tabs a[data-view=vrai]').click();
    await expect(page.locator('#mmMorceaux')).toBeVisible();
  });
  test('une adresse vers un morceau qui n’existe pas montre la liste', async ({ page }) => {
    const t = [['Un', 'A', 'House', 124, '8A'], ['Deux', 'B', 'House', 124, '9A']];
    const erreurs = await ouvrir(page, { onglet: 'musique/morceau/mzzzzzz', stockage: { 'coach-collection': S({ v: 2, n: 'x', t, p: [] }) } });
    await expect(page.locator('#mmMorceaux')).toBeVisible();
    await expect(page.locator('#mmFiche')).toBeHidden();
    expect(erreurs).toEqual([]);
  });
});

test.describe('Sécurité et anciennes données', () => {
  test('des titres piégés restent du texte', async ({ page }) => {
    const t = [['<img src=x onerror=alert(1)>', 'A"B', 'House', 124, '8A'], ['Deux', '<b>x</b>', 'House', 124, '8A']];
    const erreurs = await ouvrir(page, { onglet: 'musique', stockage: { 'coach-collection': S({ v: 2, n: '<i>nom</i>', t, p: ['<script>x</script>'] }) } });
    await expect(page.locator('#mmListe')).toContainText('<img src=x onerror=alert(1)>');
    await expect(page.locator('#rbSum')).toHaveText('2 morceaux · <i>nom</i>');
    await fiche(page, '<img src=x onerror=alert(1)>');
    await expect(page.locator('#mmFiche .mm-c-nom')).toHaveText(['Deux']);
    await expect(page.locator('#mmFiche .mm-c-m small')).toHaveText('<b>x</b> · House');
    await page.locator('#mmFiche [data-mm="coeur"]').first().click();
    await page.locator('#mmFiche .mm-carte [data-mm="coeurp"]').click();
    await preparer(page);
    await expect(page.locator('#mmPaire .mm-t-deck.a b')).toHaveText('<img src=x onerror=alert(1)>');
    await expect(page.locator('#mmPaire .mm-t-mis p')).toContainText('<img src=x onerror=alert(1)>');
    await page.locator('#mmPaire [data-mm="mtoutes"]').click();
    await page.goto('/index.html#musique/favoris');
    await expect(page.locator('#mmFavoris')).toContainText('<img src=x onerror=alert(1)>');
    await page.goto('/index.html#musique/recents');
    await expect(page.locator('#mmRecents')).toContainText('<img src=x onerror=alert(1)>');
    expect(await page.locator('#vReal img, #vReal script, #vReal b b, #vReal i i').count()).toBe(0);
    expect(erreurs).toEqual([]); await sansBandeau(page);
  });
  test('tout le HTML de la page passe par le gabarit qui échappe : une valeur oubliée reste du texte', async ({ page }) => {
    await ouvrir(page, { onglet: 'musique' });
    expect(await page.evaluate(() => [String(mmH`<b>${'<i>x</i>'}</b>`), String(mmH`<p>${mmH`<i>${'&'}</i>`}${['<a>', mmBrut('<br>')]}</p>`)])).toEqual(['<b>&lt;i&gt;x&lt;/i&gt;</b>', '<p><i>&amp;</i>&lt;a&gt;<br></p>']);
  });
  test('une collection d’avant le lot 72 : elle marche, propose de la réimporter, et sa paire en cours est reprise', async ({ page }) => {
    const t = [['Un', 'A', 'House', 124, '8A'], ['Deux', 'B', 'House', 124, '8A'], ['Trois', 'C', 'House', 125, '9A']];
    const erreurs = await ouvrir(page, { onglet: 'musique', stockage: { 'coach-collection': S({ n: 'vieille', t }), 'coach-missions': S({ pair: '0|1', done: { prep: 1, outro: 1 }, total: 0 }) } });
    await expect(page.locator('#mmAncien')).toBeVisible();
    await expect(lignes(page)).toHaveCount(3);
    await expect(page.locator('#mmTri')).toHaveValue('titre');
    await expect(page.locator('#mmTri option')).toHaveText(['Titre', 'Tempo', 'Tonalité']);
    expect(await page.evaluate(() => rbMis.paires[rbCles[0] + '>' + rbCles[1]])).toBe(2);
    await page.locator('#mmFiltresBtn').click();
    await expect(page.locator('#mmPanneau .mm-pg-t')).toHaveText(['Tempo', 'Tonalité', 'Afficher seulement']);
    await expect(page.locator('#mmPanneau .mm-tog')).toHaveText(['Mes favoris']);
    expect(erreurs).toEqual([]);
  });
  test('des données abîmées ne bloquent pas la page', async ({ page }) => {
    const erreurs = await ouvrir(page, { onglet: 'musique', stockage: { 'coach-collection': '{"v":2,"t":[1,["x"],null],"p":5}', 'coach-musique': '{"fav":"oops","vus":[{"t":"m","a":"<b>","q":1}],"offerte":3}', 'coach-missions': '{"paires":{"a>b":3,"m1>m1":2},"ok":"x","total":"deux"}' } });
    await expect(lignes(page)).toHaveCount(1);
    expect(await page.evaluate(() => [mmData.fav, mmData.vus, mmData.offerte, Object.keys(rbMis.paires), rbMis.ok, rbMis.total])).toEqual([[], [], '', [], [], 0]);
    expect(erreurs).toEqual([]); await sansBandeau(page);
  });
});

test.describe('Importer un export rekordbox', () => {
  test('un vrai fichier : tempo, tonalité, et les morceaux sans tempo listés quand même', async ({ page }) => {
    const erreurs = await ouvrir(page, { onglet: 'musique' });
    await page.locator('#rbFile').setInputFiles('tests/rekordbox-exemple.xml');
    await expect(page.locator('#rbSum')).toHaveText('9 morceaux · rekordbox-exemple · 7 avec tempo et tonalité');
    await expect(lignes(page)).toHaveCount(9);
    await expect(page.locator('#mmListe')).toContainText('<b>Balises</b> & "guillemets"');
    expect(await page.locator('#mmListe b b').count()).toBe(0);
    expect(erreurs).toEqual([]); await sansBandeau(page);
  });
  test('les playlists, la date d’ajout et les lectures sont lues', async ({ page }) => {
    const xml = `<?xml version="1.0" encoding="UTF-8"?><DJ_PLAYLISTS Version="1.0.0"><COLLECTION Entries="3">
      <TRACK TrackID="11" Name="Alpha" Artist="X" Genre="House" AverageBpm="124.00" Tonality="8A" DateAdded="2026-01-05" PlayCount="3" Location="file://localhost/a.mp3"/>
      <TRACK TrackID="12" Name="Beta" Artist="Y" Genre="House" AverageBpm="124.00" Tonality="9A" DateAdded="2025-12-01" PlayCount="0" Location="file://localhost/b.mp3"/>
      <TRACK TrackID="13" Name="Gamma" Artist="Z" Genre="Techno" AverageBpm="130.00" Tonality="8A" DateAdded="2026-02-10" PlayCount="7" Location="file://localhost/c.mp3"/>
    </COLLECTION><PLAYLISTS><NODE Type="0" Name="ROOT" Count="3">
      <NODE Type="0" Name="Dossier" Count="1"><NODE Name="Samedi" Type="1" KeyType="0" Entries="2"><TRACK Key="11"/><TRACK Key="13"/></NODE></NODE>
      <NODE Name="Par fichier" Type="1" KeyType="1" Entries="1"><TRACK Key="file://localhost/b.mp3"/></NODE>
      <NODE Name="Vide" Type="1" KeyType="0" Entries="0"></NODE>
    </NODE></PLAYLISTS></DJ_PLAYLISTS>`;
    const erreurs = await ouvrir(page, { onglet: 'musique' });
    await page.locator('#rbFile').setInputFiles({ name: 'ma.xml', mimeType: 'text/xml', buffer: Buffer.from(xml) });
    await expect(lignes(page)).toHaveCount(3);
    expect(await titres(page)).toEqual(['Gamma', 'Alpha', 'Beta']);
    await expect(lignes(page).nth(2).locator('.mm-l-t small')).toHaveText('Y · jamais joué');
    await page.locator('#mmFiltresBtn').click();
    await expect(page.locator('#mmPl option')).toHaveText(['Toutes', 'Samedi (2)', 'Par fichier (1)']);
    await page.locator('#mmPl').selectOption({ label: 'Samedi (2)' });
    expect(await titres(page)).toEqual(['Gamma', 'Alpha']);
    await page.locator('#mmTri').selectOption('lect');
    expect(await titres(page)).toEqual(['Gamma', 'Alpha']);
    expect(erreurs).toEqual([]);
  });
  test('un fichier qui n’est pas une collection rekordbox', async ({ page }) => {
    await ouvrir(page, { onglet: 'musique' });
    await page.locator('#rbFile').setInputFiles({ name: 'faux.xml', mimeType: 'text/xml', buffer: Buffer.from('<html>coucou</html>') });
    await expect(page.locator('#rbMsg')).toContainText('n’est pas une collection rekordbox');
    await expect(page.locator('#rbEmpty')).toBeVisible();
  });
  test('« Retirer » vide la collection, mais garde les favoris', async ({ page }) => {
    await exemple(page);
    await lignes(page).first().locator('.mm-coeur').click();
    await page.locator('#rbClear').click();
    await expect(page.locator('#rbEmpty')).toBeVisible();
    expect(await page.evaluate(() => [localStorage.getItem('coach-collection'), JSON.parse(localStorage.getItem('coach-musique')).fav.length])).toEqual([null, 1]);
  });
});

test.describe('Écouter', () => {
  test('ouvre une recherche YouTube avec l’artiste et le titre', async ({ page }) => {
    await exemple(page);
    await page.evaluate(() => { window.__ouvert = []; window.open = (u, c, f) => { window.__ouvert.push([u, c, f]); return null; }; });
    await fiche(page, 'Après minuit');
    await page.locator('#mmFiche .mm-f-act [data-mm="ecoute"]').click();
    await page.locator('#mmFiche .mm-carte').first().locator('[data-mm="ecoute"]').click();
    expect(await page.evaluate(() => window.__ouvert)).toEqual([
      ['https://www.youtube.com/results?search_query=Lune%20Basse%20Apr%C3%A8s%20minuit', '_blank', 'noopener'],
      ['https://www.youtube.com/results?search_query=Moussa%20K.%20Soleil%20noir', '_blank', 'noopener']]);
  });
});

test.describe('Sans abonnement (Pro allumé)', () => {
  const MA = S({ v: 2, n: 'ma collection', p: [], t: [['Tambours', 'Kora Club', 'Afro House', 123, '10A'], ['Cuivres', 'Sahel Drive', 'Afro House', 123, '11A'],
    ['Après minuit', 'Lune Basse', 'Afro House', 122, '8A'], ['Soleil noir', 'Moussa K.', 'Afro House', 122, '8A'], ['Néon rose', 'Kalia Moon', 'Afro House', 122, '9A']] });
  test('avant l’import : l’offre est annoncée', async ({ page }) => {
    await ouvrir(page, { onglet: 'musique', avant: PRO });
    await expect(page.locator('#rbPro')).toBeHidden();
    await expect(page.locator('#mmOffre')).toBeVisible();
  });
  test('la collection d’exemple se regarde en entier ; la fiche offerte attend la vraie collection (gardien)', async ({ page }) => {
    const erreurs = await ouvrir(page, { onglet: 'musique', avant: PRO });
    await page.locator('#rbDemo').click();
    await expect(page.locator('#mmGratuit')).toContainText('C’est la collection d’exemple.');
    await fiche(page, 'Tambours');
    await page.locator('#mmFiche [data-mm="liste"]').click();
    await fiche(page, 'Après minuit');
    expect(await page.evaluate(() => mmData.offerte)).toBe('');
    await page.locator('#rbFile').setInputFiles('tests/rekordbox-exemple.xml');
    await expect(page.locator('#mmGratuit')).toContainText('Ta première fiche est offerte.');
    await expect(lignes(page).first().locator('.mm-l-a')).toHaveText('Ce qui va avec ›');
    expect(erreurs).toEqual([]);
  });
  test('l’import et une fiche sont offerts ; le reste ouvre la fenêtre Pro', async ({ page }) => {
    const erreurs = await ouvrir(page, { onglet: 'musique', avant: PRO, stockage: { 'coach-collection': MA } });
    await expect(page.locator('#mmGratuit')).toContainText('Ta première fiche est offerte.');
    await expect(page.locator('#mmPdj')).toBeHidden();
    expect(await dit(page)).toBe('Choisis le morceau que tu préfères : sa fiche est offerte.');
    await fiche(page, 'Tambours');
    await expect(page.locator('#mmFiche .mm-carte').first()).toBeVisible();
    await preparer(page);
    await expect(page.locator('#proContexteTxt')).toHaveText('Pour mixer ta propre musique');
    await page.keyboard.press('Escape');
    await page.locator('#mmFiche [data-mm="liste"]').click();
    await expect(page.locator('#mmGratuit')).toContainText('Tu as vu ta fiche offerte : « Tambours ».');
    await expect(lignes(page).filter({ hasText: 'Tambours' }).locator('.mm-l-a')).toHaveText('Ta fiche offerte ›');
    await expect(lignes(page).filter({ hasText: 'Après minuit' }).locator('.mm-l-a')).toHaveText('Pro');
    await lignes(page).filter({ hasText: 'Après minuit' }).locator('.mm-ouvre').click();
    await expect(page.locator('#proContexteTxt')).toHaveText('Pour mixer ta propre musique');
    await expect(page).toHaveURL(/#musique$/);
    await page.keyboard.press('Escape');
    await page.locator('#mmOnglets a[data-mm-onglet="favoris"]').click();
    await expect(page.locator('#proContexteTxt')).toBeVisible();
    await expect(page).toHaveURL(/#musique$/);
    expect(erreurs).toEqual([]);
  });
  test('une fiche offerte qui n’est plus dans la collection : le bandeau le dit, sans promettre une autre fiche', async ({ page }) => {
    await ouvrir(page, { onglet: 'musique', avant: PRO, stockage: { 'coach-collection': MA, 'coach-musique': S({ offerte: 'mzzzz' }) } });
    await expect(page.locator('#mmGratuit')).toContainText('Tu as déjà vu ta fiche offerte.');
    await expect(lignes(page).first().locator('.mm-l-a')).toHaveText('Pro');
  });
  test('une adresse vers une autre fiche, sans abonnement : la liste', async ({ page }) => {
    await ouvrir(page, { onglet: 'musique', avant: PRO, stockage: { 'coach-collection': MA } });
    const k = await cle(page, 'Néon rose');
    await page.evaluate(k => { mmData.offerte = rbCles[0]; location.hash = '#musique/morceau/' + k; }, k);
    await expect(page.locator('#mmMorceaux')).toBeVisible();
    await expect(page.locator('#mmFiche')).toBeHidden();
  });
  test('sans fiche offerte (mmOfferte faux) : une carte Pro à la place de la page', async ({ page }) => {
    await ouvrir(page, { onglet: 'musique', avant: PRO });
    await page.evaluate(() => { mmOfferte = false; renderReal(); });
    await expect(page.locator('#rbPro')).toBeVisible();
    await expect(page.locator('#rbEmpty')).toBeHidden();
    await page.locator('#rbProBtn').click();
    await expect(page.locator('#proContexteTxt')).toHaveText('Pour mixer ta propre musique');
  });
});

test.describe('Sur téléphone', () => {
  for (const largeur of [360, 390]) {
    test(`à ${largeur} px : rien ne déborde, avant l’import, dans la liste, la fiche, la transition et vus récemment (gardien)`, async ({ page }) => {
      await page.setViewportSize({ width: largeur, height: 780 });
      const deborde = () => page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
      await ouvrir(page, { onglet: 'musique' });
      expect(await deborde()).toBeLessThanOrEqual(0);
      await page.locator('#rbDemo').click();
      await expect(lignes(page)).toHaveCount(24);
      expect(await deborde()).toBeLessThanOrEqual(0);
      await fiche(page, 'Après minuit');
      expect(await deborde()).toBeLessThanOrEqual(0);
      await preparer(page);
      await expect(page.locator('#mmPaire .mm-t-deck').first()).toBeVisible();
      expect(await deborde()).toBeLessThanOrEqual(0);
      await page.locator('#mmPaire [data-mm="coeurp"]').click();
      await page.goto('/index.html#musique/recents');
      await expect(page.locator('#mmRecents .mm-p-ligne-boite').first()).toBeVisible();
      expect(await deborde()).toBeLessThanOrEqual(0);
      // les titres d'une paire gardent assez de place pour se lire (ils étaient coupés à 4 ou 5 lettres)
      expect(await page.locator('#mmRecents .mm-p-ligne .mm-p-t b').first().evaluate(e => e.getBoundingClientRect().width)).toBeGreaterThan(90);
      await page.goto('/index.html#musique/favoris');
      await expect(page.locator('#mmFavoris .mm-p-ligne').first()).toBeVisible();
      expect(await deborde()).toBeLessThanOrEqual(0);
      expect(await page.locator('#mmFavoris .mm-p-ligne .mm-p-t b').first().evaluate(e => e.getBoundingClientRect().width)).toBeGreaterThan(90);
    });
  }
});
