// Fabrique les images de la page de présentation (dossier img/), à partir du vrai site.
// Usage : node tests/images-presentation.js     (le serveur de test est lancé tout seul)
// À relancer quand l'écran d'un niveau, l'accueil ou « Passer au vrai » change.
const { chromium } = require('@playwright/test'), path = require('path'), fs = require('fs'), { spawn } = require('child_process');
const OUT = path.join(__dirname, '..', 'img'), BASE = 'http://localhost:8766', S = o => JSON.stringify(o);
const jour = () => { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
const VENU = { 'coach-guide-vu': '1', 'coach-parcours': 'debut', 'coach-lecons': S({ 0: 3, 1: 3, 2: 2 }), 'coach-badges': S(['pas', 'timing']),
  'coach-objectif': S({ min: 10, jours: { [jour()]: 420 }, faits: [], best: 0 }) };
const fausseTable = () => { const inputs = new Map([['1', { id: '1', name: 'DDJ-FLX4', onmidimessage: null }]]); navigator.requestMIDIAccess = () => Promise.resolve({ inputs, outputs: new Map(), onstatechange: null });
  window.__midi = { envoyer: (...d) => { for (const i of inputs.values()) if (i.onmidimessage) i.onmidimessage({ data: d }); } }; };
(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  let srv = null;
  if (!(await fetch(BASE + '/index.html').then(r => r.ok).catch(() => false))) { srv = spawn(process.execPath, [path.join(__dirname, 'serveur.js')], { stdio: 'ignore' }); await new Promise(r => setTimeout(r, 800)); }
  const b = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
  const page = async (hash, stockage = VENU) => { const ctx = await b.newContext({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1 }), p = await ctx.newPage();
    await p.addInitScript(d => { try { for (const [k, v] of Object.entries(d)) localStorage.setItem(k, v); } catch (e) {} }, stockage); await p.addInitScript(fausseTable);
    await p.goto(BASE + '/index.html#' + hash); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(600); return p; };
  // haut : hauteur maximale de l'image, en pixels (le reste de l'élément est coupé)
  const shot = async (p, nom, sel, haut = 0) => { await p.evaluate(() => { const c = document.getElementById('confetti'); if (c) c.style.visibility = 'hidden'; });
    const el = p.locator(sel), o = { path: path.join(OUT, nom), type: 'jpeg', quality: 82 };
    if (haut){ await el.scrollIntoViewIfNeeded(); const bb = await el.boundingBox(); await p.screenshot(Object.assign(o, { fullPage: true, clip: { x: bb.x, y: bb.y + await p.evaluate(() => scrollY), width: bb.width, height: Math.min(haut, bb.height) } })); }
    else await el.screenshot(o);
    console.log('img/' + nom); };
  // 1. Une partie en cours : la piste, le compte à rebours, le geste à faire (niveau 3, la table branchée)
  let p = await page('apprendre');
  await p.evaluate(() => { for (const [c, n, v] of [[0, 19, 127], [1, 19, 127], [0, 15, 64], [1, 15, 0]]) window.__midi.envoyer(0xB0 + c, n, v); });
  await p.locator('.node').nth(2).click(); await p.waitForTimeout(400);
  await p.locator('#startBtn').click(); await p.waitForFunction(() => document.getElementById('startBtn').textContent === 'Arrêter', null, { timeout: 60000 });
  await p.waitForFunction(() => beatNow() >= 58, null, { timeout: 60000, polling: 'raf' });
  await shot(p, 'apprendre.jpg', '#stage'); await p.context().close();
  // 2. L'accueil : la prochaine étape et l'objectif du jour
  p = await page('accueil'); await shot(p, 'accueil.jpg', '.hero'); await p.context().close();
  // 3. Passer au vrai : une paire de la collection d'exemple et ses missions
  p = await page('vrai'); await p.locator('#rbDemo').click(); await p.locator('#rbGo').click(); await p.locator('#rbMissions .rbok').click(); await p.waitForTimeout(400);
  await shot(p, 'vrai.jpg', '#rbFull', 640); await p.context().close();
  await b.close(); if (srv) srv.kill();
})();
