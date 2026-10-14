// Prend une capture de chaque écran du site dans un état connu, et contrôle le contraste des textes.
// Usage : node tests/captures.js <dossier de sortie> [--vite]     (le serveur de test est lancé tout seul)
// --vite : seulement les écrans fixes (pour comparer deux versions image par image) ; sinon aussi une partie en cours et un résultat.
const { chromium } = require('@playwright/test'), path = require('path'), fs = require('fs'), { spawn } = require('child_process'), crypto = require('crypto');
const out = path.resolve(process.argv[2] || 'captures'), vite = process.argv.includes('--vite');
const S = o => JSON.stringify(o), BASE = 'http://localhost:8766';
const VENU = { 'coach-guide-vu': '1', 'coach-parcours': 'debut', 'coach-lecons': S({ 0: 3, 1: 2, 2: 1 }) };
const ECRANS = [
  ['01-accueil-nouveau', {}, '', null],
  ['02-accueil-parcours', VENU, '', null],
  ['03-niveau', VENU, 'apprendre', async p => { await p.locator('.node').nth(2).click(); }],
  ['04-guide', {}, 'apprendre', null],
  ['05-entrainer', VENU, 'entrainer', null],
  ['06-vrai', VENU, 'vrai', async p => { await p.locator('#rbDemo').click(); await p.locator('#rbPairs .duo').first().click(); await p.locator('#rbMissions input').first().check(); }],
  ['07-table-branchee', VENU, 'apprendre', async p => { await p.locator('.node').nth(3).click(); await p.evaluate(() => { window.__midi.envoyer(0xB0, 19, 127); window.__midi.envoyer(0xB1, 19, 64); window.__midi.envoyer(0xB0, 15, 64); }); }, true],
  ['15-progres', VENU, 'progres', null],
  ['17-ralenti', { 'coach-guide-vu': '1', 'coach-parcours': 'debut', 'coach-lecons': S({ 0: 3, 1: 2, 2: 2, 3: 2, 4: 2, 5: 2, 6: 2 }), 'coach-chapitre': '4' }, 'apprendre', async p => { await p.locator('.node').nth(1).click(); await p.evaluate(() => { $('rStars').innerHTML = '<span class="on">★</span><span>★</span><span>★</span>'; $('rTitle').textContent = 'Pas encore. Lis le conseil et rejoue.'; $('rDetails').innerHTML = '<li class="bad">Swap à 2,5 temps de la phrase.</li>'; $('result').hidden = false; slowOffer(1); slowOffer(1); }); }],
  ['16-combos', { 'coach-guide-vu': '1', 'coach-parcours': 'debut', 'coach-lecons': S({ 0: 3, 1: 2, 2: 2, 3: 2, 4: 2, 5: 2, 6: 2 }), 'coach-chapitre': '4' }, 'apprendre', async p => { await p.locator('.node').nth(3).click(); }],
  ['10-ma-table', VENU, 'table', async p => { await p.evaluate(() => window.__midi.envoyer(0xB0, 15, 90)); }, true],
  ['12-avis', VENU, 'apprendre', async p => { await p.locator('#avisBtn').click(); await p.locator('#avBloque').fill('Je ne sais pas quand lancer B.'); await p.locator('#avNote [data-note="3"]').click(); }],
  ['13-testeurs', {}, '', async p => { await p.goto(BASE + '/testeurs.html'); await p.evaluate(() => document.fonts.ready); }],
  ['14-presentation', {}, '', async p => { await p.goto(BASE + '/presentation.html'); await p.evaluate(() => document.fonts.ready); await p.evaluate(() => document.querySelectorAll('img').forEach(i => { i.loading = 'eager'; })); await p.waitForTimeout(600); }]
];
const LENTS = [
  ['08-partie-en-cours', VENU, 'apprendre', async p => { await p.locator('.node').nth(3).click(); await p.locator('#watchBtn').click(); await p.waitForFunction(() => document.getElementById('startBtn').textContent === 'Arrêter', null, { timeout: 60000 }); await p.waitForTimeout(9000); }],
  ['09-resultat', VENU, 'apprendre', async p => { await p.locator('.node').nth(5).click(); await p.locator('#startBtn').click(); await p.locator('#result').waitFor({ state: 'visible', timeout: 120000 }); await p.waitForTimeout(1800); }],
  ['11-quiz', VENU, 'entrainer', async p => { await p.locator('#quizCard').click(); await p.locator('#qOpts .qopt').first().click(); }]
];
const fausseTable = () => { const inputs = new Map([['1', { id: '1', name: 'DDJ-FLX4', onmidimessage: null }]]); navigator.requestMIDIAccess = () => Promise.resolve({ inputs, outputs: new Map(), onstatechange: null });
  window.__midi = { envoyer: (...d) => { for (const i of inputs.values()) if (i.onmidimessage) i.onmidimessage({ data: d }); } }; };
// Contraste : pour chaque texte visible, couleur du texte contre le premier fond opaque trouvé en remontant.
const contraste = () => { const lum = c => { const [r, g, b] = c.map(v => { v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); }); return .2126 * r + .7152 * g + .0722 * b; };
  const cv = document.createElement('canvas').getContext('2d', { willReadFrequently: true });
  const rgba = s => { cv.clearRect(0, 0, 1, 1); cv.fillStyle = '#000'; cv.fillStyle = s; cv.fillRect(0, 0, 1, 1); return [...cv.getImageData(0, 0, 1, 1).data]; };
  const bad = [], seen = new Set();
  for (const el of document.querySelectorAll('body *')) {
    if (!el.checkVisibility || !el.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true })) continue;
    if (![...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim())) continue;
    if (el.closest('[aria-hidden=true]') || el.closest(':disabled')) continue;
    const cs = getComputedStyle(el), fg = rgba(cs.color); let bg = null, n = el;
    while (n && n !== document.documentElement) { const b = getComputedStyle(n); if (b.backgroundImage !== 'none' && n !== document.body) { bg = null; break; } const c = rgba(b.backgroundColor); if (c[3] > 250) { bg = c; break; } if (c[3] > 0) { bg = null; break; } n = n.parentElement; }
    if (!bg) continue;
    const a = lum(fg), b = lum(bg), ratio = (Math.max(a, b) + .05) / (Math.min(a, b) + .05), big = parseFloat(cs.fontSize) >= 24 || (parseFloat(cs.fontSize) >= 18.5 && +cs.fontWeight >= 700);
    if (ratio < (big ? 3 : 4.5)) { const k = (el.id || el.className || el.tagName) + '|' + ratio.toFixed(1); if (!seen.has(k)) { seen.add(k); bad.push(`${ratio.toFixed(1)} ${el.tagName.toLowerCase()}${el.id ? '#' + el.id : ''}.${String(el.className).split(' ')[0]} « ${el.textContent.trim().slice(0, 30)} »`); } }
  }
  return bad; };
(async () => {
  fs.mkdirSync(out, { recursive: true });
  let srv = null;
  if (!(await fetch(BASE + '/index.html').then(r => r.ok).catch(() => false))) { srv = spawn(process.execPath, [path.join(__dirname, 'serveur.js')], { stdio: 'ignore' }); await new Promise(r => setTimeout(r, 800)); }
  const b = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
  const shot = async ([nom, stockage, onglet, action, midi], vp) => {
    const ctx = await b.newContext({ viewport: vp, deviceScaleFactor: 1, reducedMotion: 'reduce' }), p = await ctx.newPage(), errs = [];
    p.on('pageerror', e => errs.push(String(e)));
    await p.addInitScript(d => { try { if (!sessionStorage.getItem('__pret')) { for (const [k, v] of Object.entries(d)) localStorage.setItem(k, v); sessionStorage.setItem('__pret', '1'); } } catch (e) {} }, stockage);
    if (midi) await p.addInitScript(fausseTable);
    await p.goto(BASE + '/index.html#' + onglet); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(700);
    if (action) { await action(p); await p.waitForTimeout(500); }
    await p.evaluate(() => { const c = document.getElementById('confetti'); if (c) c.style.visibility = 'hidden'; });
    const file = path.join(out, `${nom}${vp.width < 600 ? '-mobile' : ''}.png`);
    await p.screenshot({ path: file, fullPage: true, animations: 'disabled' });
    const faibles = await p.evaluate(contraste);
    console.log(path.basename(file).padEnd(36), crypto.createHash('sha1').update(fs.readFileSync(file)).digest('hex').slice(0, 10), errs.length ? 'ERREURS ' + errs.join(' / ') : '', faibles.length ? '\n    contraste faible : ' + faibles.join('\n    contraste faible : ') : '');
    await ctx.close();
  };
  for (const e of ECRANS) { await shot(e, { width: 1366, height: 800 }); if (['01-accueil-nouveau', '02-accueil-parcours', '03-niveau', '12-avis', '13-testeurs', '14-presentation'].includes(e[0])) await shot(e, { width: 390, height: 800 }); }
  if (!vite) for (const e of LENTS) await shot(e, { width: 1366, height: 800 });
  await b.close(); if (srv) srv.kill();
})();
