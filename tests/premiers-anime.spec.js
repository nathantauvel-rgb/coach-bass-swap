// Lot 52 : les Premiers pas animés. Au premier écran, Vini sort de la platine et mixe derrière sa table ; sa bulle s'écrit pendant
// qu'il parle ; il réagit à chaque réponse ; la musique monte d'une question à l'autre, et « Commencer » est le drop.
const { test, expect } = require('@playwright/test');
const { ouvrir, sansBandeau } = require('./outils');

const NOUVEAU = { 'coach-guide-vu': null, 'coach-fiches': null, 'coach-accueil': null };
const suite = page => page.locator('#ppGo').click();
const choix = (page, v) => page.locator(`#ppOpts .pp-opt[data-v="${v}"]`).click();
// Ce que montre Vini dans le coin : sa pose (data-…) et ses classes
const pose = page => page.evaluate(() => { const v = $('ppVini');
  return { bras: v.getAttribute('data-bras'), yeux: v.getAttribute('data-yeux'), fx: v.getAttribute('data-fx'), cls: v.getAttribute('class') }; });
const musique = page => page.evaluate(() => ({ joue: !!ppSon.src, coupure: ppSon.filtre ? Math.round(ppSon.filtre.frequency.value) : 0, vitesse: ppSon.vitesse }));
const avance = page => page.locator('#ppBar').getAttribute('aria-valuenow');
const cachees = page => page.locator('#ppAsk .pp-c:not(.v)').count();

test.describe('Premiers pas animés', () => {
  test('premier écran : la table s’allume, Vini en sort, atterrit derrière, dit bonjour, puis mixe', async ({ page }) => {
    const erreurs = await ouvrir(page, { onglet: '', stockage: NOUVEAU, midi: { branchee: false } });
    await expect(page.locator('#ppBody')).toHaveClass(/pp-intro/);
    await expect(page.locator('#ppScene .ps-table')).toBeVisible();
    // la phrase entière est déjà là pour les lecteurs d'écran, encore transparente : elle s'écrit quand Vini a atterri
    await expect(page.locator('#ppAsk')).toHaveText(/^Salut, moi c’est Vini/);
    expect(await page.locator('#ppAsk .pp-c.v').count()).toBe(0);
    await expect(page.locator('#ppBody')).toHaveClass(/pp-salue/, { timeout: 5000 });
    await expect(page.locator('#ppBody')).toHaveClass(/pp-derriere/);
    await expect(page.locator('#ppScene .vini')).toHaveClass(/vn-parle/);
    await expect(page.locator('#ppBody')).toHaveClass(/pp-mixe/, { timeout: 9000 });
    await expect(page.locator('#ppScene .vini')).not.toHaveClass(/vn-parle/);
    expect(await cachees(page)).toBe(0);
    expect(await avance(page)).toBe('5');
    await expect(page.locator('#ppSon')).toBeHidden();   // pas de musique avant « C'est parti »
    expect((await musique(page)).joue).toBe(false);
    expect(erreurs).toEqual([]); await sansBandeau(page);
  });
  test('toucher la bulle affiche toute la phrase d’un coup, et Vini se tait', async ({ page }) => {
    await ouvrir(page, { onglet: '', stockage: NOUVEAU, midi: { branchee: false } });
    await expect(page.locator('#ppBody')).toHaveClass(/pp-salue/, { timeout: 5000 });
    await page.locator('#ppAsk').click();
    expect(await cachees(page)).toBe(0);
    await expect(page.locator('#ppScene .vini')).not.toHaveClass(/vn-parle/);
    await expect(page.locator('#ppBody')).toHaveClass(/pp-mixe/, { timeout: 3000 });
  });
  test('« C’est parti » : Vini saute dans le coin, la musique démarre étouffée et s’ouvre à chaque question', async ({ page }) => {
    const erreurs = await ouvrir(page, { onglet: '', stockage: NOUVEAU, midi: { branchee: false } });
    await suite(page);
    await expect(page.locator('#ppScene')).toBeHidden();
    await expect(page.locator('#ppVini')).toBeVisible();
    await expect(page.locator('#ppSon')).toBeVisible();
    await expect(page.locator('#ppSon')).toHaveAttribute('aria-pressed', 'true');
    await expect.poll(() => musique(page).then(m => m.joue)).toBe(true);
    await expect(page.locator('#ppAsk')).toHaveText('Tu en es où avec le mix ?');
    await expect.poll(() => cachees(page), { timeout: 5000 }).toBe(0);
    expect(await avance(page)).toBe('30');
    const c1 = (await musique(page)).coupure;
    expect(c1).toBeLessThan(500);
    await choix(page, 'debut'); await suite(page);
    expect(await avance(page)).toBe('52');
    await expect.poll(() => musique(page).then(m => m.coupure)).toBeGreaterThan(650);
    await choix(page, 'souris'); await suite(page);
    expect(await avance(page)).toBe('74');
    await expect.poll(() => musique(page).then(m => m.coupure)).toBeGreaterThan(1500);
    // l'objectif change le tempo du morceau, comme le tempo d'une platine
    await choix(page, 15); await expect.poll(() => musique(page).then(m => m.vitesse)).toBe(1.07);
    await choix(page, 5); await expect.poll(() => musique(page).then(m => m.vitesse)).toBe(.94);
    await choix(page, 10); await expect.poll(() => musique(page).then(m => m.vitesse)).toBe(1);
    expect(erreurs).toEqual([]);
  });
  test('chaque réponse a sa réaction de Vini', async ({ page }) => {
    await ouvrir(page, { onglet: '', stockage: NOUVEAU, midi: {} });
    await suite(page);
    await choix(page, 'debut');
    await expect.poll(() => pose(page)).toMatchObject({ bras: 'pouce', yeux: 'clin', fx: 'etoiles' });
    await choix(page, 'apprenti');
    await expect.poll(() => pose(page)).toMatchObject({ bras: 'oreille', yeux: 'fermes', fx: 'notes', cls: expect.stringContaining('vn-r-hoche') });
    await choix(page, 'confirme');
    await expect.poll(() => pose(page).then(p => [p.bras, p.yeux, /vn-lunettes/.test(p.cls)])).toEqual([null, null, true]);
    await suite(page);
    // la table : il tend l'oreille en attendant qu'on la branche, sort une souris sans table, lève le pouce pour une table connue
    await choix(page, 'table');
    await expect.poll(() => pose(page)).toMatchObject({ bras: 'oreille', fx: 'ondes', cls: expect.stringContaining('vn-calme') });
    await page.locator('#ppModele').selectOption('flx4');
    await expect.poll(() => pose(page)).toMatchObject({ bras: 'pouce', yeux: 'clin' });
    await choix(page, 'souris');
    await expect.poll(() => pose(page)).toMatchObject({ bras: 'souris' });
    await page.evaluate(() => window.__midi.brancher('DDJ-FLX4'));
    await expect(page.locator('#ppVini')).toHaveClass(/vn-parfait/);
    await expect(page.locator('#ppOpts .pp-big .ps-mini')).toBeVisible();
    await expect.poll(() => pose(page)).toMatchObject({ bras: null, fx: 'etoiles', cls: expect.stringContaining('vn-danse') });
    await suite(page);
    // l'objectif : il se balance, danse, ou se dépense
    await choix(page, 5);
    await expect.poll(() => pose(page)).toMatchObject({ yeux: 'fermes', cls: expect.stringContaining('vn-r-lent') });
    await choix(page, 15);
    await expect.poll(() => pose(page).then(p => [p.bras, /vn-r-rapide/.test(p.cls), /vn-sueur/.test(p.cls), /vn-sourcils/.test(p.cls)])).toEqual(['haut', true, true, true]);
    await choix(page, 10);
    await expect.poll(() => pose(page).then(p => [p.bras, p.yeux, /vn-r-|vn-sueur/.test(p.cls)])).toEqual([null, null, false]);
  });
  test('« Commencer » : le drop sur le temps suivant, puis le premier niveau, et la musique s’arrête', async ({ page }) => {
    const erreurs = await ouvrir(page, { onglet: '', stockage: NOUVEAU, midi: { branchee: false } });
    await suite(page); await choix(page, 'debut'); await suite(page); await choix(page, 'souris'); await suite(page); await choix(page, 10);
    await expect.poll(() => musique(page).then(m => m.joue)).toBe(true);
    await suite(page);
    await expect(page.locator('#ppGo')).toBeDisabled();
    expect(await avance(page)).toBe('100');
    // les réponses sont gardées tout de suite, avant même la fin du drop
    expect(JSON.parse(await page.evaluate(() => localStorage.getItem('coach-accueil')))).toMatchObject({ niveau: 'debut', table: 'souris', min: 10 });
    await expect.poll(() => musique(page).then(m => m.coupure), { timeout: 3000 }).toBeGreaterThan(15000);
    await expect(page.locator('#ppVini')).toHaveClass(/vn-parfait/);
    await expect(page.locator('#ppAsk')).toHaveText('C’est parti !');
    await expect(page.locator('#pp')).toBeHidden({ timeout: 4000 });
    expect((await musique(page)).joue).toBe(false);
    await expect(page.locator('#ltitle')).toHaveText('Le bon moment');
    expect(erreurs).toEqual([]); await sansBandeau(page);
  });
  test('sons coupés : pas de musique ; le bouton à côté de « Passer » la remet, et le choix est gardé', async ({ page }) => {
    await ouvrir(page, { onglet: '', stockage: Object.assign({ 'coach-sons': '0' }, NOUVEAU), midi: { branchee: false } });
    await suite(page);
    await expect(page.locator('#ppSon')).toHaveAttribute('aria-pressed', 'false');
    await expect(page.locator('#ppSon')).toHaveAttribute('aria-label', 'Musique : coupée');
    await page.waitForTimeout(600);
    expect((await musique(page)).joue).toBe(false);
    await page.locator('#ppSon').click();
    await expect.poll(() => musique(page).then(m => m.joue)).toBe(true);
    expect(await page.evaluate(() => localStorage.getItem('coach-sons'))).toBe('1');
    await expect(page.locator('#sonsBtn')).toHaveAttribute('aria-pressed', 'true');   // le haut-parleur de l'en-tête suit
    await page.locator('#ppSon').click();
    await expect.poll(() => musique(page).then(m => m.joue)).toBe(false);
    await page.locator('#ppSkip').click();
    await expect(page.locator('#pp')).toBeHidden();
  });
  test('« Passer » pendant la musique : elle s’arrête avec les questions', async ({ page }) => {
    await ouvrir(page, { onglet: '', stockage: NOUVEAU, midi: { branchee: false } });
    await suite(page);
    await expect.poll(() => musique(page).then(m => m.joue)).toBe(true);
    await page.locator('#ppSkip').click();
    await expect(page.locator('#pp')).toBeHidden();
    expect((await musique(page)).joue).toBe(false);
  });
  test('« Retour » jusqu’au premier écran : Vini mixe déjà, sans rejouer l’entrée', async ({ page }) => {
    await ouvrir(page, { onglet: '', stockage: NOUVEAU, midi: { branchee: false } });
    await suite(page);
    await expect(page.locator('#ppVini')).toBeVisible();
    await page.locator('#ppBack').click();
    await expect(page.locator('#ppScene .ps-table')).toBeVisible();
    await expect(page.locator('#ppBody')).toHaveClass(/pp-mixe/);
    await expect(page.locator('#ppBody')).not.toHaveClass(/pp-intro/);
    await expect(page.locator('#ppSon')).toBeHidden();
  });
  test('animations réduites : pas d’entrée ni d’écriture lettre par lettre, et « Commencer » ne fait pas attendre', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    const erreurs = await ouvrir(page, { onglet: '', stockage: NOUVEAU, midi: { branchee: false } });
    await expect(page.locator('#ppBody')).toHaveClass(/pp-mixe/);
    expect(await cachees(page)).toBe(0);
    await suite(page);
    await expect(page.locator('#ppAsk')).toHaveText('Tu en es où avec le mix ?');
    expect(await cachees(page)).toBe(0);
    await choix(page, 'apprenti'); await suite(page); await choix(page, 'souris'); await suite(page); await choix(page, 5);
    await suite(page);
    await expect(page.locator('#pp')).toBeHidden({ timeout: 1000 });
    expect(erreurs).toEqual([]);
  });
});

test.describe('Les poses de Vini, ailleurs', () => {
  test('sans pose, rien ne change : l’accueil garde son Vini habituel', async ({ page }) => {
    await ouvrir(page, { onglet: 'accueil', stockage: { 'coach-parcours': 'debut' } });
    const v = page.locator('#homeVini');
    await expect(v).toBeVisible();
    for (const k of ['data-bras', 'data-yeux', 'data-bouche', 'data-fx']) await expect(v).not.toHaveAttribute(k, /.*/);
    for (const p of ['.vn-pb-pouce', '.vn-pb-souris', '.vn-pa-lunettes', '.vn-pa-sueur', '.vn-pm-parle', '.vn-py-clin', '.vn-px-ondes']) await expect(v.locator(p).first()).toBeHidden();
    await expect(v.locator('.vn-py-ouverts')).toBeVisible();
  });
  test('viniPose par-dessus l’humeur, puis viniPose sans pose : Vini revient à son humeur', async ({ page }) => {
    await ouvrir(page, { onglet: 'accueil', stockage: { 'coach-parcours': 'debut' } });
    const v = page.locator('#homeVini');
    await page.evaluate(() => { viniHumeur($('homeVini'), 'danse'); viniPose($('homeVini'), { bras: 'souris', lunettes: true, rythme: 'lent' }); viniParle($('homeVini'), true); });
    await expect(v.locator('.vn-pb-souris').last()).toBeVisible();
    await expect(v.locator('.vn-pa-lunettes')).toBeVisible();
    await expect(v.locator('.vn-pm-parle')).toBeVisible();
    await expect(v.locator('.vn-pb-bas')).toBeHidden();
    await expect(v).toHaveClass(/vn-r-lent/);
    await page.evaluate(() => { viniPose($('homeVini')); viniParle($('homeVini'), false); });
    await expect(v.locator('.vn-pb-bas')).toBeVisible();
    await expect(v.locator('.vn-pa-lunettes')).toBeHidden();
    await expect(v.locator('.vn-pm-sourire')).toBeVisible();
    await expect(v).not.toHaveClass(/vn-r-lent/);
  });
});
