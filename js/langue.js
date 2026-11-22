/* ---------- Langue (lot 53) : le site en français, ou en anglais ----------
   Le français reste la langue du site : tout le code écrit ses textes en français, comme avant, et en français rien de ce
   fichier ne s'active. En anglais, aucun autre fichier ne change : chaque texte est traduit au moment où il s'affiche. Les
   fonctions du navigateur qui écrivent du texte (textContent, innerHTML, insertAdjacentHTML, append, title, setAttribute,
   createTextNode, et le texte dessiné sur un canvas) passent par tr(), qui cherche la phrase dans le dictionnaire de
   js/anglais.js : EN pour les phrases fixes, enMotif() pour celles qui contiennent un nombre ou un nom. Une phrase absente
   du dictionnaire reste en français et elle est notée dans window.__enManque : les tests s'en servent pour vérifier qu'un
   écran est entièrement traduit.
   Choix de la langue : ?lang=en ou ?lang=fr dans l'adresse, sinon l'anglais de la visite (LANGUE_VISITE), sinon coach-langue,
   sinon le français. Jamais de bascule automatique : Google lit le site avec un navigateur réglé en anglais, il doit
   continuer à voir la version française (lot 50). Le bouton FR | EN (langueBoutons) change de langue et recharge la page
   (langueChange) : chaque fichier écrit ses textes au chargement.
   Lot 84 (demande de l'utilisateur du 22 nov. 2026 : « je veux qu'il soit en fr mais qu'il y ait un bouton FR/EN pour
   basculer ») : ?lang=en (le lien des pubs anglaises, le mail de rappel en anglais) n'est gardé pour de bon que sur un
   navigateur qui n'est pas réglé en français. Sur un navigateur en français, l'anglais dure le temps de la visite
   (sessionStorage, propre à l'onglet) : quelqu'un qui ouvre une fois le lien des pubs ne retrouve plus djingood.fr en
   anglais les jours suivants. Un clic sur le bouton, lui, est toujours gardé. ?lang=fr est toujours gardé. */
const LANGUE_VISITE = 'coach-langue-visite';
const LANGUE = (() => {
  let q = null, garde = null, visite = null;
  try { q = new URLSearchParams(location.search).get('lang'); } catch (e) {}
  try { garde = localStorage.getItem('coach-langue'); } catch (e) {}
  try { visite = sessionStorage.getItem(LANGUE_VISITE); } catch (e) {}
  if (q === 'fr'){
    try { localStorage.setItem('coach-langue', 'fr'); } catch (e) {}
    try { sessionStorage.removeItem(LANGUE_VISITE); } catch (e) {}
    return 'fr';
  }
  if (q === 'en'){
    if (langueNavigateurFr()){ try { sessionStorage.setItem(LANGUE_VISITE, 'en'); } catch (e) {} }
    else { try { localStorage.setItem('coach-langue', 'en'); } catch (e) {} }
    return 'en';
  }
  if (visite === 'en') return 'en';
  return garde === 'en' ? 'en' : 'fr';
})();
// Les dates, les heures et les grands nombres s'écrivent à l'anglaise en anglais (lot 80 : pro.js, compte.js, objectif.js,
// rekordbox.js s'en servent à la place de 'fr-FR')
const LOCALE = LANGUE === 'en' ? 'en-US' : 'fr-FR';
const EN = Object.create(null);  // phrase française (espaces simplifiés) → phrase anglaise ; rempli par js/anglais.js
const EN_MOTIFS = [];            // [expression, fonction] : phrases qui contiennent un nombre ou un nom
const EN_CACHE = new Map();
window.__enManque = new Set();
window.__enManqueHtml = new Set();

// Espaces insécables, retours à la ligne et apostrophes courbes ramenés à une forme unique, pour que le dictionnaire
// n'ait qu'une seule façon d'écrire chaque phrase.
function trCle(s){ return s.replace(/[\s  ]+/g, ' ').replace(/[’‘]/g, "'").trim(); }

/* Une phrase avec des trous. Dans le français : {#n} un nombre, {x} un texte traduit à son tour, {=x} un texte gardé tel
   quel (un nom de morceau, un prénom). Dans l'anglais : {n} remet la valeur, {n:beat:beats} choisit le mot selon le nombre.
   On peut aussi passer une expression et une fonction. */
function enMotif(fr, en){
  if (fr instanceof RegExp){ EN_MOTIFS.push([fr, en]); return; }
  const noms = [], types = [];
  const src = trCle(fr).split(/(\{[#=]?\w+\})/).map(p => {
    const m = p.match(/^\{([#=]?)(\w+)\}$/);
    if (!m) return p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    noms.push(m[2]); types.push(m[1]);
    return m[1] === '#' ? '([-−+]?\\d+(?:[.,]\\d+)?)' : '([\\s\\S]+?)';
  }).join('');
  const re = new RegExp('^' + src + '$');
  EN_MOTIFS.push([re, (...g) => {
    const v = {};
    noms.forEach((n, i) => { const x = g[i + 1]; v[n] = types[i] === '#' ? x.replace(',', '.').replace('−', '-') : types[i] === '=' ? x : tr(x); });
    return en.replace(/\{(\w+)(?::([^:}]*):([^}]*))?\}/g, (t, n, un, plus) => {
      if (!(n in v)) return t;
      if (un === undefined) return v[n];
      return Math.abs(parseFloat(v[n])) === 1 ? un : plus;
    });
  }]);
}

// Les motifs très larges (une liste « a · b · c », une phrase coupée en deux) : essayés après tous les autres
const EN_MOTIFS_FIN = [];
function enMotifFin(re, f){ EN_MOTIFS_FIN.push([re, f]); }
// Une phrase du dictionnaire, telle quelle ou avec l'autre casse en tête (« Lance B… » en tête de liste est la même
// phrase que « lance B… »), ou null
function trExact(cle){
  if (cle in EN) return EN[cle];
  const c0 = cle.charAt(0), bas = c0 === c0.toLowerCase(), autre = (bas ? c0.toUpperCase() : c0.toLowerCase()) + cle.slice(1);
  if (autre !== cle && autre in EN){ const t = EN[autre]; return (bas ? t.charAt(0).toLowerCase() : t.charAt(0).toUpperCase()) + t.slice(1); }
  return null;
}
// La traduction d'une phrase entière, ou null. Un motif dont la fonction renvoie null laisse sa place aux suivants.
function trTrouve(cle){
  let t = trExact(cle);
  if (t !== null) return t;
  if (/[^.]\.$/.test(cle) && (t = trExact(cle.slice(0, -1))) !== null) return t + '.';   // la même phrase, avec un point final
  for (const l of [EN_MOTIFS, EN_MOTIFS_FIN])
    for (const [re, f] of l){
      const m = cle.match(re); if (!m) continue;
      const r = typeof f === 'function' ? f(...m) : cle.replace(re, f);
      if (r !== null && r !== undefined) return r;
    }
  return null;
}
let EN_SORTIES = null;
function trFrancais(cle){
  if (!/[a-zà-ÿ]{2}/i.test(cle)) return false;
  if (!EN_SORTIES) EN_SORTIES = new Set(Object.values(EN).map(trCle));
  if (EN_SORTIES.has(cle)) return false;
  // le début d'une phrase anglaise coupée pour tenir sur la piste (« Main pa… »)
  if (cle.endsWith('…')){ const d = cle.slice(0, -1).trim(); for (const s of EN_SORTIES) if (s.startsWith(d)) return false; }
  return true;
}
function tr(s){
  if (LANGUE !== 'en' || typeof s !== 'string') return s;
  // un pourcentage à la française (« 0,0 % », le tempo d'une platine) : « 0.0% »
  if (/^\s*[-+−]?\d+,\d+\s?%\s*$/.test(s)) return s.replace(',', '.').replace(/\s?%/, '%');
  // un prix à la française (« 4,99 € ») : « €4.99 » (lot 80)
  if (/^\s*\d+(?:,\d+)?\s?€\s*$/.test(s)) return s.replace(/(\d+)(?:,(\d+))?\s?€/, (m, e, c) => '€' + e + (c ? '.' + c : ''));
  // un nombre à virgule tout seul (« 124,0 », le tempo écrit sur une platine) : « 124.0 » (lot 80)
  if (/^\s*[-+−]?\d+,\d+\s*$/.test(s)) return s.replace(',', '.');
  if (!/[A-Za-zÀ-ÿ]/.test(s)) return s;
  const c = EN_CACHE.get(s); if (c !== undefined) return c;
  const m = s.match(/^([\s  ]*)([\s\S]*?)([\s  ]*)$/), cle = trCle(m[2]);
  let t = trTrouve(cle);
  if (t === null){ if (trFrancais(cle)) window.__enManque.add(cle); t = s; }
  else {
    if (EN_SORTIES) EN_SORTIES.add(trCle(t));   // une phrase déjà traduite qui revient n'est pas « manquante »
    // en anglais, pas d'espace avant « : » (le français en met une, souvent dans un morceau de texte à part)
    t = (/^[:;!?]/.test(t) ? '' : m[1]) + t + m[3];
  }
  if (EN_CACHE.size > 5000) EN_CACHE.clear();
  EN_CACHE.set(s, t);
  return t;
}
// Une phrase qui contient des balises (<b>…</b>) : traduite en entier, ou null si le dictionnaire ne l'a pas
function trHtml(h){
  if (typeof h !== 'string' || !/[A-Za-zÀ-ÿ]{2}/.test(h.replace(/<[^>]*>/g, ''))) return null;
  const cle = trCle(h), t = trTrouve(cle);
  if (t === null && /<[a-z]/i.test(h) && trFrancais(cle.replace(/<[^>]*>/g, ' '))) window.__enManqueHtml.add(cle);
  return t;
}

const TR_ATTRS = ['title', 'aria-label', 'placeholder', 'alt', 'aria-description'];
let trBrut = null;  // les vraies fonctions du navigateur, gardées par trPose

// Traduit tout ce qui est déjà écrit sous root : une phrase avec des balises d'un coup si le dictionnaire la connaît (et
// qu'aucun élément nommé dedans ne serait remplacé), sinon chaque morceau de texte et les attributs lus à voix haute.
function trDom(root){
  if (LANGUE !== 'en' || !root || !trBrut) return;
  const pile = [root];
  while (pile.length){
    const n = pile.pop();
    if (n.nodeType === 3){ const v = n.nodeValue, t = tr(v); if (t !== v) n.nodeValue = t; continue; }
    if (n.nodeType !== 1 && n.nodeType !== 11) continue;
    if (n.nodeType === 1){
      if (n.tagName === 'SCRIPT' || n.tagName === 'STYLE') continue;
      for (const a of TR_ATTRS){ const v = n.getAttribute(a); if (v){ const t = tr(v); if (t !== v) trBrut.setAttribute.call(n, a, t); } }
      if (n !== root && n.childElementCount && n.childNodes.length > 1 && !n.querySelector('[id]')){
        const h = n.innerHTML;
        if (h.length < 900){ const t = trHtml(h); if (t !== null){ trBrut.innerHTML.set.call(n, t); continue; } }
      }
    }
    for (let c = n.lastChild; c; c = c.previousSibling) pile.push(c);
  }
}

// En anglais, les fonctions qui écrivent du texte passent par tr()
function trPose(){
  const P = (proto, prop) => Object.getOwnPropertyDescriptor(proto, prop);
  trBrut = { textContent: P(Node.prototype, 'textContent'), innerHTML: P(Element.prototype, 'innerHTML'),
    innerText: P(HTMLElement.prototype, 'innerText'), title: P(HTMLElement.prototype, 'title'),
    setAttribute: Element.prototype.setAttribute, insertAdjacentHTML: Element.prototype.insertAdjacentHTML,
    append: Element.prototype.append, prepend: Element.prototype.prepend, createTextNode: Document.prototype.createTextNode,
    fillText: CanvasRenderingContext2D.prototype.fillText, strokeText: CanvasRenderingContext2D.prototype.strokeText,
    measureText: CanvasRenderingContext2D.prototype.measureText };
  const B = trBrut;
  Object.defineProperty(Node.prototype, 'textContent', { ...B.textContent, set(v){ B.textContent.set.call(this, tr(v)); } });
  if (B.innerText) Object.defineProperty(HTMLElement.prototype, 'innerText', { ...B.innerText, set(v){ B.innerText.set.call(this, tr(v)); } });
  Object.defineProperty(HTMLElement.prototype, 'title', { ...B.title, set(v){ B.title.set.call(this, tr(v)); } });
  Object.defineProperty(Element.prototype, 'innerHTML', { ...B.innerHTML, set(v){
    const t = trHtml(v);
    B.innerHTML.set.call(this, t === null ? v : t);
    if (t === null && typeof v === 'string' && /[A-Za-zÀ-ÿ]{2}/.test(v.replace(/<[^>]*>/g, ''))) trDom(this);
    if (typeof v === 'string' && /\.html/.test(v)) trLiens(this);
  } });
  Element.prototype.insertAdjacentHTML = function(ou, h){
    const t = trHtml(h), cible = ou === 'beforebegin' || ou === 'afterend' ? this.parentNode : this;
    B.insertAdjacentHTML.call(this, ou, t === null ? h : t);
    if (t === null) trDom(cible);
    if (typeof h === 'string' && /\.html/.test(h)) trLiens(cible);
  };
  Element.prototype.setAttribute = function(n, v){ return B.setAttribute.call(this, n, TR_ATTRS.includes(n) ? tr(v) : v); };
  Element.prototype.append = function(...a){ return B.append.apply(this, a.map(tr)); };
  Element.prototype.prepend = function(...a){ return B.prepend.apply(this, a.map(tr)); };
  Document.prototype.createTextNode = function(s){ return B.createTextNode.call(this, tr(s)); };
  CanvasRenderingContext2D.prototype.fillText = function(s, ...a){ return B.fillText.call(this, tr(s), ...a); };
  CanvasRenderingContext2D.prototype.strokeText = function(s, ...a){ return B.strokeText.call(this, tr(s), ...a); };
  CanvasRenderingContext2D.prototype.measureText = function(s){ return B.measureText.call(this, tr(s)); };
}
if (LANGUE === 'en'){ document.documentElement.lang = 'en'; trPose(); }

// Les pages légales ont leur traduction anglaise (lot 80 : terms.html, privacy.html, legal-notice.html) : en anglais, les
// liens du site y mènent. La version française fait foi, et chaque page anglaise la cite.
const EN_PAGES = { 'cgv.html': 'terms.html', 'confidentialite.html': 'privacy.html', 'mentions-legales.html': 'legal-notice.html' };
// Les captures du site sur la page de présentation : leur version anglaise (img/en/, faite par tests/images-presentation.js en)
const EN_IMAGES = { 'img/apprendre.jpg': 'img/en/apprendre.jpg', 'img/accueil.jpg': 'img/en/accueil.jpg', 'img/vrai.jpg': 'img/en/vrai.jpg' };
function trLiens(root){
  if (LANGUE !== 'en' || !trBrut || !root || typeof root.querySelectorAll !== 'function') return;
  root.querySelectorAll('a[href]').forEach(a => { const h = a.getAttribute('href'); if (EN_PAGES[h]) trBrut.setAttribute.call(a, 'href', EN_PAGES[h]); });
  root.querySelectorAll('img[src]').forEach(i => { const s = i.getAttribute('src'); if (EN_IMAGES[s]) trBrut.setAttribute.call(i, 'src', EN_IMAGES[s]); });
}

// Appelé par js/anglais.js une fois le dictionnaire rempli : traduit la page déjà écrite et son titre
// La page reste cachée jusque-là (classe « trad » posée dans le <head>), pour ne pas montrer le français une seconde.
function trPage(){
  if (LANGUE !== 'en') return;
  EN_CACHE.clear(); EN_SORTIES = null;
  try { trDom(document.body); trLiens(document.body); const t = tr(document.title); if (t !== document.title) document.title = t; }
  finally { document.documentElement.classList.remove('trad'); }
}

// Changer de langue : le choix est gardé, et l'adresse le porte aussi (?lang=…), au cas où le navigateur refuse de le garder
function langueChange(l){
  try { localStorage.setItem('coach-langue', l); } catch (e) {}
  try { sessionStorage.removeItem(LANGUE_VISITE); } catch (e) {}   // lot 84 : le clic remplace l'anglais de la visite
  const u = new URL(location.href); u.searchParams.set('lang', l);
  location.replace(u.href);
}
// Écrire sans traduire : le bouton de langue parle la langue qu'il propose
function trSans(el, n, v){
  if (n === null) (trBrut ? trBrut.textContent.set : P_TEXTE.set).call(el, v);
  else (trBrut ? trBrut.setAttribute : Element.prototype.setAttribute).call(el, n, v);
}
const P_TEXTE = Object.getOwnPropertyDescriptor(Node.prototype, 'textContent');
// Le navigateur est-il réglé en français (une de ses langues) ?
function langueNavigateurFr(){
  try { return (navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language || '']).some(x => /^fr/i.test(String(x))); }
  catch (e) { return true; }
}
// Le bouton FR | EN de l'en-tête, des Premiers pas et de la page de présentation (lot 84, à la place d'un bouton qui ne
// montrait que l'autre langue) : deux côtés, la langue affichée en évidence (aria-pressed), l'autre se clique. Écrit sans
// passer par le dictionnaire : chaque côté parle sa propre langue. Lot 80 (choix de l'utilisateur, 21 nov.) : sur la page
// en français, pour un navigateur qui n'est pas en français, le côté anglais dit « English » en toutes lettres (lot 84 :
// sur les Premiers pas et la présentation ; l'en-tête du site garde « EN », faute de place).
const LANGUE_COTES = [['fr', 'FR', 'Lire DJingood en français'], ['en', 'EN', 'Read DJingood in English']];
function langueBoutons(){
  const enMot = LANGUE === 'fr' && !langueNavigateurFr();
  document.querySelectorAll('.langbtn').forEach(g => {
    if (g.childElementCount) return;
    trSans(g, 'role', 'group'); trSans(g, 'aria-label', 'Langue · Language');
    g.classList.toggle('langbtn-mot', enMot);
    for (const [l, court, titre] of LANGUE_COTES){
      const b = document.createElement('button');
      trSans(b, 'type', 'button'); trSans(b, 'lang', l); trSans(b, 'title', titre);
      trSans(b, 'aria-pressed', String(l === LANGUE));
      if (l === 'en' && enMot){   // « English », et « EN » pour l'en-tête du site (styles.css choisit)
        for (const [c, t] of [['lb-long', 'English'], ['lb-court', court]]){ const s = document.createElement('span'); s.className = c; trSans(s, null, t); b.appendChild(s); }
      } else trSans(b, null, court);
      b.onclick = () => { if (l !== LANGUE) langueChange(l); };
      g.appendChild(b);
    }
  });
}
// Lot 80 : plus de carte « Switch to English » qui s'ouvrait toute seule (elle cachait le bouton des Premiers pas, et la
// règle de l'utilisateur du 20 nov. 2026 veut la forme de tous les sites pour un réglage) : le bouton FR / EN suffit, et
// les pubs en anglais mènent directement à ?lang=en.
function langueOffre(){
  langueBoutons();
  if (LANGUE === 'en' && typeof stat1 === 'function') stat1('anglais');
}
document.addEventListener('DOMContentLoaded', langueOffre);
