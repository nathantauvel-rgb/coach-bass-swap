// Fabrique les icônes du site et l'image d'aperçu des liens partagés, à partir des dessins de Vini (img/*.svg).
// Usage : node tests/icones.js     (pas besoin du serveur de test)
// À relancer si img/vini-icone.svg, img/vini-logo.svg ou le titre du site changent.
//   favicon.ico          l'icône de l'onglet pour les navigateurs qui ne lisent pas le SVG (16, 32 et 48 pixels)
//   img/icone-192.png    l'icône que Google affiche à côté du site dans ses résultats (un multiple de 48 pixels)
//   img/icone-180.png    l'icône d'un iPhone quand on ajoute le site à l'écran d'accueil (fond plein : iOS remplit
//                        le transparent en noir et arrondit lui-même les coins)
//   img/partage.jpg      l'aperçu quand on partage un lien vers le site (WhatsApp, TikTok, Discord…), 1200 × 630
const { chromium } = require('@playwright/test'), path = require('path'), fs = require('fs');
const RACINE = path.join(__dirname, '..'), IMG = path.join(RACINE, 'img');
const icone = fs.readFileSync(path.join(IMG, 'vini-icone.svg'), 'utf8'), logo = fs.readFileSync(path.join(IMG, 'vini-logo.svg'), 'utf8');
const FOND = '#0B0E16', VIOLET = '#7C4DFF', LAVANDE = '#B89BFF', ORANGE = '#ff7a45', BLANC = '#f2f3f5';

// Un fichier .ico peut contenir directement des PNG : un en-tête, une ligne par taille, puis les images.
const ico = pngs => {
  const tete = Buffer.alloc(6 + 16 * pngs.length); tete.writeUInt16LE(0, 0); tete.writeUInt16LE(1, 2); tete.writeUInt16LE(pngs.length, 4);
  let pos = tete.length;
  pngs.forEach(([cote, png], i) => { const o = 6 + 16 * i;
    tete.writeUInt8(cote >= 256 ? 0 : cote, o); tete.writeUInt8(cote >= 256 ? 0 : cote, o + 1); tete.writeUInt16LE(1, o + 4); tete.writeUInt16LE(32, o + 6);
    tete.writeUInt32LE(png.length, o + 8); tete.writeUInt32LE(pos, o + 12); pos += png.length; });
  return Buffer.concat([tete, ...pngs.map(p => p[1])]);
};

(async () => {
  const b = await chromium.launch();
  // cote : taille de l'image ; marge : place autour de Vini (en part du côté) ; fond : couleur derrière, ou transparent
  const carre = async (cote, marge = 0, fond = 'transparent') => {
    const p = await b.newPage({ viewport: { width: cote, height: cote }, deviceScaleFactor: 1 });
    await p.setContent(`<style>html,body{margin:0;background:${fond}}div{width:${cote}px;height:${cote}px;display:grid;place-items:center}svg{width:${cote * (1 - 2 * marge)}px;height:${cote * (1 - 2 * marge)}px}</style><div>${icone}</div>`);
    const png = await p.screenshot({ omitBackground: fond === 'transparent' }); await p.close(); return png;
  };
  const tailles = [16, 32, 48];
  fs.writeFileSync(path.join(RACINE, 'favicon.ico'), ico(await Promise.all(tailles.map(async c => [c, await carre(c)]))));
  fs.writeFileSync(path.join(IMG, 'icone-192.png'), await carre(192));
  fs.writeFileSync(path.join(IMG, 'icone-180.png'), await carre(180, .1, FOND));

  const p = await b.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
  await p.setContent(`<!doctype html><html lang="fr"><head>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Nunito:wght@700;800;900&display=block">
<style>
  html,body{margin:0}
  .af{width:1200px;height:630px;box-sizing:border-box;padding:0 90px;display:flex;align-items:center;gap:64px;color:${BLANC};
      font-family:Nunito,system-ui,sans-serif;background:radial-gradient(circle at 18% 50%,${VIOLET}55,transparent 46%),radial-gradient(circle at 100% 100%,${ORANGE}33,transparent 40%),${FOND}}
  .vini svg{width:340px;height:340px;display:block}
  .nom{font-size:112px;font-weight:900;letter-spacing:-.03em;line-height:1}
  .nom span{color:${LAVANDE}}
  .titre{font-size:42px;font-weight:800;line-height:1.2;margin-top:22px;white-space:nowrap}
  .adr{display:inline-block;margin-top:34px;font-size:30px;font-weight:800;color:${ORANGE}}
</style></head><body><div class="af"><div class="vini">${logo}</div>
<div><div class="nom"><span>DJ</span>ingood</div><div class="titre">Apprends à mixer<br>sur ta table DJ, en jouant.</div><div class="adr">djingood.fr</div></div></div></body></html>`);
  await p.evaluate(() => document.fonts.ready);
  fs.writeFileSync(path.join(IMG, 'partage.jpg'), await p.screenshot({ type: 'jpeg', quality: 86 }));
  await b.close();
  console.log('favicon.ico, img/icone-192.png, img/icone-180.png, img/partage.jpg');
})();
