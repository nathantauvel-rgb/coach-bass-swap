// Lot 92 « Trois choses en moins » (diagnostic UX du 26 nov. 2026, liste « Ce que j'enlèverais ou cacherais ») : un seul signe
// par carte dans les tutos, le canal, le numéro MIDI et « Réapprendre » repliés dans Ma table, et pas de quêtes du jour sur
// l'accueil avant le premier niveau réussi (choix B de l'utilisateur).
const { test, expect } = require('@playwright/test');
const { ouvrir, envoyer, sansBandeau } = require('./outils');

const S = o => JSON.stringify(o);
const jour = (n = 0) => { const d = new Date(); d.setDate(d.getDate() + n); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
const TUTOS = 'window.DJINGOOD_TUTOS = true;', PRO = 'window.DJINGOOD_PRO = true;';
const commande = (page, id) => page.locator(`#tSvg [data-c="${id}"]`);
const manque = page => page.evaluate(() => [...window.__enManque]);
// un nouveau venu, le jour même de ses Premiers pas ; ses quêtes du jour sont déjà tirées et la démo regardée a fini l'une d'elles
const QUETES = S({ jour: jour(), ids: ['demo', 'parties4', 'reussies4'], cpt: { demos: 1 }, ouverts: [], xp: 0 });
const NOUVEAU = { 'coach-parcours': 'debut', 'coach-quetes': QUETES,
  'coach-accueil': S({ niveau: 'debut', table: 'souris', modele: '', min: 10, oreille: null, mur: false, fini: jour() }) };

test.describe('Tutos : un seul signe par carte', () => {
  test('Pro allumé : les 10 tutos de Pro n’ont plus que le cadenas ; « Pro » est écrit une fois, dans le bandeau, derrière le cadenas', async ({ page }) => {
    const erreurs = await ouvrir(page, { onglet: 'tutos', avant: TUTOS + PRO });
    await expect(page.locator('.tu-carte')).toHaveCount(11);
    await expect(page.locator('.tu-carte.tu-ferme')).toHaveCount(10);
    await expect(page.locator('.tu-carte.tu-ferme .tu-cadenas')).toHaveCount(10);
    await expect(page.locator('.tu-carte.tu-ferme .tu-etiq')).toHaveCount(0);
    await expect(page.locator('.tu-etiq')).toHaveText(['Gratuit']);
    await expect(page.locator('[data-tu="fondu"] .tu-cadenas')).toHaveCount(0);
    await expect(page.locator('#proBandeau .tu-cadenas-legende')).toBeVisible();
    await expect(page.locator('#proBandeau .tu-cadenas-legende')).toHaveAttribute('aria-hidden', 'true');
    await expect(page.locator('#proBandeauTxt')).toHaveText('Les 10 autres sont dans DJingood Pro.');
    // sur toute la page des tutos, « Pro » ne s'écrit plus que deux fois : la phrase du bandeau et son bouton « Découvrir Pro »
    expect(await page.locator('#tuCatalogue').evaluate(e => (e.innerText.match(/\bPro\b/g) || []).length)).toBe(2);
    expect(erreurs).toEqual([]); await sansBandeau(page);
  });
  test('un tuto vu garde « Vu » ; Pro éteint, aucune étiquette « Pro » ni cadenas', async ({ page }) => {
    await ouvrir(page, { onglet: 'tutos', avant: TUTOS, stockage: { 'coach-tutos': S({ vus: ['swap'] }) } });
    await expect(page.locator('.tu-etiq')).toHaveText(['Gratuit', 'Vu']);
    await expect(page.locator('[data-tu="swap"] .tu-etiq')).toHaveText('Vu');
    await expect(page.locator('.tu-cadenas')).toHaveCount(0);
  });
});

test.describe('Ma table : « Réglages avancés », replié', () => {
  test('une commande réglée : canal, numéro et « Réapprendre » repliés ; ouverts, ils le restent quand la table bouge ou qu’on change de commande', async ({ page }) => {
    const erreurs = await ouvrir(page, { onglet: 'table', midi: { branchee: true } });
    await commande(page, 'lowA').click();
    await expect(page.locator('#tPanel strong')).toHaveText('Potard LOW A');
    await expect(page.locator('#tPanel .tlive')).toHaveText('Bouge-la sur ta table pour la voir réagir.');
    await expect(page.locator('#tAvance summary')).toHaveText('Réglages avancés');
    await expect(page.locator('#tAvance')).not.toHaveAttribute('open', '');
    await expect(page.locator('#tPanel .tmap')).toBeHidden();
    await expect(page.locator('#tLearn')).toBeHidden();
    await page.locator('#tAvance summary').click();
    await expect(page.locator('#tPanel .tmap')).toBeVisible();
    await expect(page.locator('#tPanel .tmap')).toHaveText('Réglage : canal 1, numéro 15 (d\'origine).');
    await expect(page.locator('#tLearn')).toHaveText('Réapprendre cette commande');
    // le fader A bouge sur la table : le panneau est refait pour lui, le repli reste ouvert
    await envoyer(page, 0xB0, 19, 100);
    await expect(page.locator('#tPanel strong')).toHaveText('Fader de volume A');
    await expect(page.locator('#tAvance')).toHaveAttribute('open', '');
    await expect(page.locator('#tPanel .tmap')).toHaveText('Réglage : canal 1, numéro 19 (d\'origine).');
    await commande(page, 'hiB').click();
    await expect(page.locator('#tAvance')).toHaveAttribute('open', '');
    // refermé, il reste fermé
    await page.locator('#tAvance summary').click();
    await expect(page.locator('#tPanel .tmap')).toBeHidden();
    await commande(page, 'lowB').click();
    await expect(page.locator('#tAvance')).not.toHaveAttribute('open', '');
    expect(erreurs).toEqual([]); await sansBandeau(page);
  });
  test('une commande pas encore réglée : « Apprendre » reste en vue, sans « Bouge-la » ; apprise, le site le dit et son réglage se replie', async ({ page }) => {
    const erreurs = await ouvrir(page, { onglet: 'table', midi: { branchee: true } });
    await commande(page, 'cfxA').click();
    await expect(page.locator('#tAvance')).toHaveCount(0);
    await expect(page.locator('#tPanel .tlive')).toHaveCount(0);
    await expect(page.locator('#tPanel .tmap')).toBeVisible();
    await expect(page.locator('#tPanel .tmap')).toHaveText('Pas encore réglée : clique sur « Apprendre », puis bouge-la sur ta table.');
    await expect(page.locator('#tLearn')).toBeVisible();
    await page.locator('#tLearn').click();
    await expect(page.locator('#tLearn')).toContainText('Bouge-la sur ta table');
    await envoyer(page, 0xB6, 23, 64);
    expect(await page.evaluate(() => map.cfxA)).toEqual({ ch: 6, n: 23 });
    await expect(page.locator('#tNote')).toHaveText('C’est appris : le site reconnaît maintenant cette commande.');
    await expect(page.locator('#tPanel .tlive')).toHaveText('Position : 50 %');
    await expect(page.locator('#tAvance')).not.toHaveAttribute('open', '');
    await expect(page.locator('#tPanel .tmap')).toHaveText('Réglage : canal 7, numéro 23.');
    // le potard tourne encore (gardien du lot 92) : le message reste ; une autre commande bouge : il part
    await envoyer(page, 0xB6, 23, 80); await envoyer(page, 0xB6, 23, 100);
    await expect(page.locator('#tPanel .tlive')).toHaveText('Position : 79 %');
    await expect(page.locator('#tNote')).toHaveText('C’est appris : le site reconnaît maintenant cette commande.');
    await envoyer(page, 0xB0, 19, 100);
    await expect(page.locator('#tPanel strong')).toHaveText('Fader de volume A');
    await expect(page.locator('#tNote')).toHaveText('');
    await commande(page, 'cfxA').click();
    // réapprendre puis annuler : rien n'est dit
    await page.locator('#tAvance summary').click();
    await page.locator('#tLearn').click(); await page.locator('#tLearn').click();
    await expect(page.locator('#tLearn')).toHaveText('Réapprendre cette commande');
    await expect(page.locator('#tNote')).toHaveText('');
    expect(erreurs).toEqual([]); await sansBandeau(page);
  });
  test('réapprendre depuis le repli : il reste ouvert pendant l’apprentissage, et le nouveau réglage s’y lit', async ({ page }) => {
    await ouvrir(page, { onglet: 'table', midi: { branchee: true } });
    await commande(page, 'playB').click();
    await page.locator('#tAvance summary').click();
    await page.locator('#tLearn').click();
    await expect(page.locator('#tLearn')).toContainText('Appuie dessus');
    await envoyer(page, 0xB3, 50, 64);                 // un potard : refusé pour un bouton, l'apprentissage attend toujours
    await expect(page.locator('#tAvance')).toHaveAttribute('open', '');
    await expect(page.locator('#tLearn')).toContainText('Appuie dessus');
    await envoyer(page, 0x93, 60, 127);
    await expect(page.locator('#tNote')).toHaveText('C’est appris : le site reconnaît maintenant cette commande.');
    await expect(page.locator('#tAvance')).toHaveAttribute('open', '');
    await expect(page.locator('#tPanel .tmap')).toHaveText('Réglage : canal 4, numéro 60 (appris).');
    // réapprise avec le même bouton : le réglage ne change pas, mais c'est appris quand même
    await page.locator('#tLearn').click();
    await expect(page.locator('#tNote')).toHaveText('');
    await envoyer(page, 0x93, 60, 127);
    await expect(page.locator('#tNote')).toHaveText('C’est appris : le site reconnaît maintenant cette commande.');
  });
  test('la note d’une commande que le site n’utilise pas : sans canal ni numéro, sauf « Réglages avancés » ouvert', async ({ page }) => {
    await ouvrir(page, { onglet: 'table', midi: { branchee: true } });
    await envoyer(page, 0x97, 0, 127);                 // un pad de la FLX4
    await expect(page.locator('#tNote')).toHaveText('Commande reçue, mais le site ne s’en sert pas encore.');
    await envoyer(page, 0xB5, 99, 64);                 // un potard inconnu
    await expect(page.locator('#tNote')).toHaveText('Commande reçue, mais le site ne s’en sert pas encore.');
    await commande(page, 'faderA').click(); await page.locator('#tAvance summary').click();
    await expect(page.locator('#tAvance')).toHaveAttribute('open', '');
    await envoyer(page, 0x97, 0, 127);
    await expect(page.locator('#tNote')).toHaveText('Commande reçue mais pas encore utilisée par le site (bouton, canal 8, numéro 0).');
    await envoyer(page, 0xB5, 99, 64);
    await expect(page.locator('#tNote')).toHaveText('Commande reçue mais pas encore utilisée par le site (potard ou fader, canal 6, numéro 99).');
  });
  test('en anglais : le repli, la note courte et « C’est appris » sont traduits', async ({ page }) => {
    const erreurs = await ouvrir(page, { onglet: 'table', midi: { branchee: true }, stockage: { 'coach-langue': 'en' } });
    await envoyer(page, 0x97, 0, 127);
    await expect(page.locator('#tNote')).toHaveText('Control received, but the site doesn\'t use it yet.');
    await commande(page, 'cfxA').click();
    await page.locator('#tLearn').click();
    await envoyer(page, 0xB6, 23, 64);
    await expect(page.locator('#tNote')).toHaveText('Learned: the site now recognizes this control.');
    await expect(page.locator('#tAvance summary')).toHaveText('Advanced settings');
    await page.locator('#tAvance summary').click();
    await expect(page.locator('#tPanel .tmap')).toHaveText('Setting: channel 7, number 23.');
    expect(await manque(page)).toEqual([]);
    expect(erreurs).toEqual([]);
  });
});

test.describe('Accueil : les quêtes du jour attendent le premier niveau réussi', () => {
  test('rien de réussi (une étoile ne suffit pas) : pas de quêtes, Vini ne parle pas de coffre, la carte de fin non plus', async ({ page }) => {
    const erreurs = await ouvrir(page, { onglet: 'accueil', stockage: Object.assign({ 'coach-lecons': S({ 0: 1 }) }, NOUVEAU) });
    await expect(page.locator('#homeCta')).toBeVisible();
    await expect(page.locator('#homeQuetes')).toBeHidden();
    await expect(page.locator('#homePath')).toBeVisible();
    expect(await page.evaluate(() => questCoffres())).toBe(1);   // la démo regardée compte quand même
    await expect(page.locator('#homeTip')).not.toHaveText(/coffre/);
    await page.evaluate(() => questLigne([qtDef('demo')]));
    await expect(page.locator('#rQuete')).toBeHidden();
    expect(erreurs).toEqual([]); await sansBandeau(page);
  });
  test('cachées, elles sont quand même tirées à l’arrivée, comme avant : rien d’impossible pour un débutant le jour de sa première réussite', async ({ page }) => {
    const sans = Object.assign({}, NOUVEAU, { 'coach-quetes': null });
    await ouvrir(page, { onglet: 'accueil', stockage: sans });
    await expect(page.locator('#homeQuetes')).toBeHidden();
    const q = await page.evaluate(() => JSON.parse(localStorage.getItem('coach-quetes')));
    expect(q.jour).toBe(jour()); expect(q.ids).toHaveLength(3);
    for (const id of q.ids) expect(['quiz3', 'defi', 'oreille', 'expert2', 'combo']).not.toContain(id);
    // sa première réussite, à 3 étoiles : les mêmes quêtes arrivent (pas de nouveau tirage avec « à l'oreille » ou « Mode Expert »)
    await page.evaluate(() => { stars[0] = 3; renderHome(); });
    await expect(page.locator('#homeQuetes')).toBeVisible();
    expect(await page.locator('#qtList .qt').evaluateAll(l => l.map(e => e.dataset.q))).toEqual(q.ids);
  });
  test('le premier niveau réussi (2 étoiles) : les quêtes arrivent, déjà entamées, avec leur coffre ; la carte de fin en parle', async ({ page }) => {
    await ouvrir(page, { onglet: 'accueil', stockage: Object.assign({}, NOUVEAU, { 'coach-lecons': S({ 0: 2 }) }) });
    await expect(page.locator('#homeQuetes')).toBeVisible();
    await expect(page.locator('#qtList .qt')).toHaveCount(3);
    await expect(page.locator('#qtList [data-q="demo"] .qt-coffre')).toBeEnabled();
    await expect(page.locator('#homeTip')).toHaveText('Un coffre t’attend dans tes quêtes !');
    await page.evaluate(() => questLigne([qtDef('demo')]));
    await expect(page.locator('#rQuete')).toHaveText('Quête terminée : Regarde une démo ! Ton coffre t’attend sur l’accueil.');
  });
  test('une réussite dans un autre chapitre compte aussi (un DJ confirmé commence ailleurs)', async ({ page }) => {
    await ouvrir(page, { onglet: 'accueil', stockage: { 'coach-parcours': 'confirme', 'coach-ch5': S({ 0: 2 }) } });
    await expect(page.locator('#homeQuetes')).toBeVisible();
    await page.evaluate(() => { ch5Stars = {}; renderHome(); });
    await expect(page.locator('#homeQuetes')).toBeHidden();
  });
  test('sur un grand écran, sans quêtes, le bloc du haut garde toute la largeur', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await ouvrir(page, { onglet: 'accueil', stockage: NOUVEAU });
    await expect(page.locator('#homeQuetes')).toBeHidden();
    expect(await page.locator('#vHome > .hero').evaluate(e => Math.round(e.getBoundingClientRect().width))).toBe(1600);
  });
});
