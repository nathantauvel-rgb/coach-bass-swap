// Petit serveur de fichiers pour les tests : sert la racine du dépôt sur http://localhost:8766 (ou sur le port DJ_PORT)
const http = require('http'), fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
// Le SVG n'est pas deviné par le navigateur comme le JPEG : sans son type, une image SVG ne s'affiche pas du tout.
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.xml': 'application/xml', '.mp3': 'audio/mpeg', '.json': 'application/json',
  '.svg': 'image/svg+xml; charset=utf-8', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.ico': 'image/x-icon', '.txt': 'text/plain; charset=utf-8' };
http.createServer((req, res) => {
  // Un dossier sert son index.html, comme Vercel : /guide/ → guide/index.html (lot 51)
  const rel = (decodeURIComponent(req.url.split('?')[0]).replace(/^\/+/, '') || 'index.html').replace(/(^|\/)$/, '$1index.html');
  const file = path.join(ROOT, rel);
  if (!file.startsWith(ROOT)) { res.writeHead(403); res.end(); return; }
  fs.readFile(file, (err, data) => {
    if (err) { res.writeHead(404); res.end('introuvable'); return; }
    res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream' });
    res.end(req.method === 'HEAD' ? undefined : data);
  });
}).listen(+process.env.DJ_PORT || 8766);
