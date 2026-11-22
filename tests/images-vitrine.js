// Fabrique les images des trois étapes de la page d'accueil (lot 83, dossier img/vitrine/), à partir du vrai site.
// Usage : DJ_PORT=8806 node tests/images-vitrine.js       (le serveur de test est lancé tout seul s'il ne répond pas)
//         DJ_PORT=8806 node tests/images-vitrine.js en    → les mêmes, le site en anglais, dans img/vitrine/en/
// L'étape 2 (la piste) est img/apprendre.jpg, faite par tests/images-presentation.js. À relancer quand l'écran de la table des
// Premiers pas ou la carte de résultat change.
const { chromium } = require('@playwright/test'), path = require('path'), fs = require('fs'), { spawn } = require('child_process');
const EN = process.argv[2] === 'en';
const OUT = path.join(__dirname, '..', 'img', 'vitrine', EN ? 'en' : ''), PORT = process.env.DJ_PORT || 8766, BASE = `http://localhost:${PORT}`;
const S = o => JSON.stringify(o);
const fausseTable = () => { const inputs = new Map([['1', { id: '1', name: 'DDJ-FLX4', onmidimessage: null }]]); navigator.requestMIDIAccess = () => Promise.resolve({ inputs, outputs: new Map(), onstatechange: null });
  window.__midi = { envoyer: (...d) => { for (const i of inputs.values()) if (i.onmidimessage) i.onmidimessage({ data: d }); } }; };

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  let srv = null;
  if (!(await fetch(BASE + '/index.html').then(r => r.ok).catch(() => false))) {
    srv = spawn(process.execPath, [path.join(__dirname, 'serveur.js')], { stdio: 'ignore', env: Object.assign({}, process.env, { DJ_PORT: String(PORT) }) });
    await new Promise(r => setTimeout(r, 800));
  }
  const b = await chromium.launch();
  const page = async (stockage, hash) => {
    const ctx = await b.newContext({ viewport: { width: 1280, height: 860 }, deviceScaleFactor: 2 }), p = await ctx.newPage();
    await p.addInitScript(d => { try { for (const [k, v] of Object.entries(d)) localStorage.setItem(k, v); } catch (e) {} }, Object.assign(EN ? { 'coach-langue': 'en' } : {}, stockage));
    await p.addInitScript(fausseTable); await p.addInitScript(() => { window.DJINGOOD_LIBRE = true; });
    await p.goto(BASE + '/index.html#' + hash); await p.evaluate(() => document.fonts.ready);
    await p.waitForFunction(() => !document.documentElement.classList.contains('trad'), null, { timeout: 15000 });
    await p.waitForTimeout(600); return p;
  };
  // Une zone de la page, de l'élément du haut à celui du bas, élargie de `marge` pixels, au format 4:3 (coupée en bas)
  const shot = async (p, nom, haut, bas, marge = 16) => {
    const r = await p.evaluate(([h, bs, m]) => {
      const a = document.querySelector(h).getBoundingClientRect(), z = document.querySelector(bs).getBoundingClientRect();
      const x = Math.min(a.left, z.left) - m, w = Math.max(a.right, z.right) - x + m, y = a.top - m;
      return { x, y, width: w, height: Math.min(z.bottom - y + m, w * 3 / 4) };
    }, [haut, bas, marge]);
    await p.screenshot({ path: path.join(OUT, nom), type: 'jpeg', quality: 84, clip: r });
    console.log(path.relative(path.join(__dirname, '..'), path.join(OUT, nom)));
  };
  // 1. Branche ta table : les Premiers pas, à l'écran de la table, la FLX4 branchée et reconnue
  let p = await page({}, 'accueil');
  await p.evaluate(() => { pp.rep.niveau = 'debut'; pp.entree = true; pp.i = PP_I('table'); ppRender(0); });
  await p.waitForSelector('#ppTest svg'); await p.waitForTimeout(2500);   // la bulle de Vini a fini de s'écrire
  await shot(p, 'branche.jpg', '#ppOpts', '#ppTest svg');
  await p.context().close();
  // 2. Vini te note : la carte de résultat d'un niveau réussi (sans la proposition d'essai, sans le détail)
  p = await page({ 'coach-accueil': S({ passe: true, fini: '2026-10-16' }), 'coach-guide-vu': '1', 'coach-parcours': 'debut' }, 'apprendre');
  await p.evaluate(() => { selectLesson(0); $('rTitle').textContent = 'Parfait, transition de pro !'; $('rGain').textContent = '+30 XP';
    $('result').hidden = false; resultatCarte(3, [['ok', 'Pile.', 1]]); $('next').hidden = false; resultatBoutons(3);
    $('rTout').hidden = true; $('rClose').style.visibility = 'hidden'; const c = document.getElementById('confetti'); if (c) c.style.visibility = 'hidden'; });
  await p.waitForTimeout(900);
  // toute la largeur de la carte, de son haut jusque sous les boutons
  const r = await p.evaluate(() => { const c = document.querySelector('#result .rcard').getBoundingClientRect(), n = $('next').getBoundingClientRect();
    return { x: c.left + 2, y: c.top + 2, width: c.width - 4, height: n.bottom - c.top + 26 }; });
  await p.screenshot({ path: path.join(OUT, 'etoiles.jpg'), type: 'jpeg', quality: 84, clip: r });
  console.log(path.relative(path.join(__dirname, '..'), path.join(OUT, 'etoiles.jpg')));
  await p.context().close();
  await b.close(); if (srv) srv.kill();
})();
