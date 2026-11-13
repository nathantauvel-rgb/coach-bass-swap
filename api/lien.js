// Le lien de connexion, envoyé par Brevo avec notre texte (lot 67 « Le mail qui arrive »).
// Fonction Vercel : le fichier api/lien.js répond à l'adresse /api/lien du site. Aucune dépendance.
'use strict';
/* Pourquoi : jusqu'ici, Firebase envoyait lui-même le mail du lien de connexion, avec son texte à lui (impossible à
   changer), et le premier mail d'un nouveau venu tombait souvent dans les spams, où Gmail désactive les liens. Ici, on
   demande le lien à Firebase sans le lui faire envoyer, puis Brevo l'envoie avec notre texte, depuis djingood.fr.

   Réglages de Vercel (Settings → Environment Variables), jamais dans le site :
   - BREVO_CLE       : la clé d'API de Brevo (la même que pour les mails de Vini, lot 54) ;
   - FIREBASE_COMPTE : la clé d'un compte de service Google aux droits limités (rôles « Administrateur Firebase
                       Authentication » et « Utilisateur Cloud Datastore »), tout le fichier JSON tel quel. Elle permet de
                       fabriquer le lien et de compter les envois ; elle ne sort jamais d'ici.
   Sans elles : 503, et le site envoie le lien par Firebase, comme avant (rien ne casse).

   Sécurités :
   - on n'envoie qu'à une adresse qui a déjà un compte DJingood (sinon 404, et le site repasse par Firebase). Ça ne suffit
     pas à protéger un inconnu (n'importe qui peut créer un compte avec l'adresse d'un autre), d'où les deux limites :
   - au plus MAX liens par adresse et par heure (429), et au plus PLAFOND mails par jour pour tout le site, sous les 300 de
     l'offre gratuite de Brevo (503 : le lien part alors par Firebase). Les envois sont comptés dans Firestore (collection
     `limites`, une fiche par adresse et par heure, nommée d'après une empreinte de l'adresse, jamais l'adresse en clair, et
     une fiche par jour) par un **ajout atomique** : Firestore ajoute 1 et rend le nouveau total en une seule opération, donc
     vingt demandes arrivées en même temps reçoivent 1, 2, 3… 20, jamais toutes « 0 » (feu rouge du gardien : avec une
     lecture puis une écriture, 4 vagues de 20 demandes envoyaient 60 mails à la même adresse). Les règles de Firestore
     ferment cette collection au site ; seul ce compte de service y écrit ;
   - le lien ramène toujours sur l'accueil de DJingood (SITES, page / ou /index.html), jamais sur une adresse ni une page
     données par celui qui appelle ;
   - rien de libre n'arrive dans le mail : le prénom ne garde que des lettres.

   Le lien du mail pointe directement sur djingood.fr (…?apiKey=…&oobCode=…&mode=signIn), comme celui où Firebase
   ramène après son propre passage : le site le reconnaît pareil (stats.js, LIEN_CONNEXION), et un lien vers le même
   domaine que l'expéditeur rassure les messageries.

   POST { mail, retour } → 200 { envoye: true } | 400 | 404 pas-de-compte | 405 | 429 trop | 502 | 503 pas-configure | plafond */
const crypto = require('crypto');
const PROJET = 'djingo-1e1f4';   // le projet Firebase (identifiant technique, ne jamais le renommer)
const IDT = 'https://identitytoolkit.googleapis.com/v1/projects/' + PROJET;
const BASE = 'projects/' + PROJET + '/databases/(default)/documents';
const FS = 'https://firestore.googleapis.com/v1/' + BASE + ':commit';
const PLAFOND = 200;   // mails de lien par jour (UTC) pour tout le site : Brevo gratuit en permet 300, dont ceux de Vini
const JETON = 'https://oauth2.googleapis.com/token';
const BREVO = 'https://api.brevo.com/v3/smtp/email';
// Même expéditeur que les mails de Firebase depuis le 10 nov. 2026 : ce que les joueurs ont déjà marqué « pas un spam » compte
const EXPEDITEUR = { name: 'DJingood', email: 'noreply@djingood.fr' };
const SITES = ['https://djingood.fr', 'https://www.djingood.fr', 'https://coach-bass-swap.vercel.app'];
const MAX = 3;   // liens par adresse et par heure (heure pleine, UTC)
const SUJET = 'Ton lien pour te connecter à DJingood';

const mailOk = v => typeof v === 'string' && v.trim().length <= 200 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
// Un prénom : des lettres, et au plus un espace, un tiret ou une apostrophe entre deux lettres (comme api/mails.js)
const prenomOk = v => (typeof v === 'string' && /^\p{L}+(?:[ '’-]\p{L}+)?$/u.test(v.trim()) && v.trim().length <= 30 ? v.trim() : '');
const html = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
function repond(res, code, d){ res.statusCode = code; res.setHeader('Content-Type', 'application/json; charset=utf-8'); res.setHeader('Cache-Control', 'no-store'); res.end(JSON.stringify(d)); }

// La page où le lien ramène : l'accueil du site d'où le joueur l'a demandé (seule page qui sait finir la connexion) ;
// sinon l'accueil de djingood.fr
function retourOk(v){
  try {
    const u = new URL(String(v));
    if (SITES.includes(u.origin) && (u.pathname === '/' || u.pathname === '/index.html')) return u.origin + u.pathname;
  } catch (e) {}
  return SITES[0] + '/';
}

// Les deux fiches de compteur : celle de l'adresse pour cette heure (nommée d'après une empreinte, jamais l'adresse en
// clair) et celle du jour pour tout le site.
function fiches(mail, maintenant = new Date()){
  const iso = maintenant.toISOString(), heure = iso.slice(0, 13).replace(/[-T]/g, ''), jour = iso.slice(0, 10);
  const empreinte = crypto.createHash('sha256').update('djingood-lien:' + mail).digest('hex').slice(0, 32);
  return { adresse: BASE + '/limites/a-' + empreinte + '-' + heure, jour: BASE + '/limites/jour-' + jour };
}
// +1 sur une fiche, en une seule opération : Firestore rend le nouveau total (transformResults). Une fiche absente est
// créée ; `fin` permet un ménage automatique (règle TTL de Firestore sur ce champ, facultative).
function ajout(nom, maintenant = new Date()){
  const fin = new Date(maintenant.getTime() + 2 * 86400e3).toISOString();
  return { writes: [{ update: { name: nom, fields: { fin: { timestampValue: fin } } }, updateMask: { fieldPaths: ['fin'] },
    updateTransforms: [{ fieldPath: 'n', increment: { integerValue: '1' } }] }] };
}
async function compte1(nom, jeton){
  const n = await google(FS, jeton, ajout(nom));
  const w = n.ok && n.d && Array.isArray(n.d.writeResults) ? n.d.writeResults[0] : null;
  const t = w && Array.isArray(w.transformResults) && w.transformResults[0], v = t ? parseInt(t.integerValue, 10) : NaN;
  return v > 0 ? v : NaN;
}
// Le lien du mail : directement sur la page de DJingood, avec ce que Firebase a mis dans le sien. Sinon, le sien tel quel.
function lienDirect(oob, retour){
  try {
    const u = new URL(oob), p = u.searchParams;
    if (p.get('mode') === 'signIn' && p.get('oobCode') && p.get('apiKey'))
      return retour + '?apiKey=' + encodeURIComponent(p.get('apiKey')) + '&oobCode=' + encodeURIComponent(p.get('oobCode')) + '&mode=signIn&lang=fr';
  } catch (e) {}
  return /^https:\/\//.test(String(oob)) ? String(oob) : '';
}

// La clé du compte de service : le fichier JSON collé tel quel dans Vercel (ou encodé en base64, si Vercel l'a abîmé)
function compte(){
  let t = String(process.env.FIREBASE_COMPTE || '').trim();
  if (!t) return null;
  if (t[0] !== '{'){ try { t = Buffer.from(t, 'base64').toString('utf8'); } catch (e) { return null; } }
  try {
    const c = JSON.parse(t);
    if (c && typeof c.client_email === 'string' && typeof c.private_key === 'string') return { email: c.client_email, cle: c.private_key.replace(/\\n/g, '\n') };
  } catch (e) {}
  return null;
}
// Le jeton d'accès de Google pour ce compte de service, gardé jusqu'à 5 min avant sa fin
let acces = { v: '', fin: 0, qui: '' };
async function jetonAcces(c){
  if (acces.v && acces.qui === c.email && Date.now() < acces.fin) return acces.v;
  const b = o => Buffer.from(JSON.stringify(o)).toString('base64url');
  const t = Math.floor(Date.now() / 1000);
  const corps = b({ alg: 'RS256', typ: 'JWT' }) + '.' + b({ iss: c.email, aud: JETON, iat: t, exp: t + 3600,
    scope: 'https://www.googleapis.com/auth/identitytoolkit https://www.googleapis.com/auth/cloud-platform' });
  const signe = corps + '.' + crypto.createSign('RSA-SHA256').update(corps).sign(c.cle).toString('base64url');
  const r = await fetch(JETON, { method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: 'grant_type=' + encodeURIComponent('urn:ietf:params:oauth:grant-type:jwt-bearer') + '&assertion=' + signe });
  const d = r.ok ? await r.json() : null;
  if (!d || typeof d.access_token !== 'string') throw new Error('jeton ' + r.status);
  acces = { v: d.access_token, fin: Date.now() + Math.max(60, (+d.expires_in || 3600) - 300) * 1000, qui: c.email };
  return acces.v;
}
async function google(chemin, jeton, corps){
  const r = await fetch(/^https:/.test(chemin) ? chemin : IDT + chemin, { method: 'POST', headers: { authorization: 'Bearer ' + jeton, 'content-type': 'application/json' }, body: JSON.stringify(corps) });
  let d = null; try { d = await r.json(); } catch (e) {}
  return { ok: r.ok, status: r.status, d };
}

// Le mail. Texte validé par Nathan le 10 nov. 2026. Pas d'image (bloquées par défaut, et mal vues d'un domaine neuf).
function mailTexte(prenom, lien){
  return (prenom ? 'Salut ' + prenom + ' !' : 'Salut !') + '\n\nVoici ton lien pour te connecter à DJingood :\n' + lien +
    '\n\nOuvre-le sur l’ordinateur où tu brancheras ta table : tu y retrouveras ton plan et ta progression.\n\n' +
    'Ce lien ne sert qu’une fois. Tu n’as rien demandé ? Ignore ce mail : rien ne se passe sans clic.\n\nVini, de DJingood\nhttps://djingood.fr';
}
function mailHtml(prenom, lien){
  const l = html(lien), p = 'font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:1.5;color:#1d2030;margin:0 0 16px';
  return '<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">' +
    '<title>' + html(SUJET) + '</title></head><body style="margin:0;padding:0;background:#f3f1fa">' +
    '<div style="display:none;max-height:0;overflow:hidden;opacity:0">Un clic, et tu retrouves ton plan sur l’ordinateur.</div>' +
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f3f1fa"><tr><td align="center" style="padding:28px 12px">' +
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border-radius:14px">' +
    '<tr><td style="padding:28px 28px 8px;font-family:Arial,Helvetica,sans-serif;font-size:22px;font-weight:bold;color:#1d2030">' +
    '<span style="color:#7c4dff">DJ</span>ingood</td></tr>' +
    '<tr><td style="padding:12px 28px 4px">' +
    '<p style="' + p + ';font-size:18px;font-weight:bold">' + html(prenom ? 'Salut ' + prenom + ' !' : 'Salut !') + '</p>' +
    '<p style="' + p + '">Voici ton lien pour te connecter à DJingood.</p>' +
    '<table role="presentation" cellpadding="0" cellspacing="0" style="margin:8px 0 22px"><tr><td style="border-radius:10px;background:#7c4dff">' +
    '<a href="' + l + '" style="display:inline-block;padding:14px 28px;font-family:Arial,Helvetica,sans-serif;font-size:17px;font-weight:bold;color:#ffffff;text-decoration:none;border-radius:10px">Me connecter</a>' +
    '</td></tr></table>' +
    '<p style="' + p + '">Ouvre-le sur l’ordinateur où tu brancheras ta table&nbsp;: tu y retrouveras ton plan et ta progression.</p>' +
    '<p style="' + p + ';font-size:14px;color:#5b5f73">Ce lien ne sert qu’une fois. Tu n’as rien demandé&nbsp;? Ignore ce mail&nbsp;: rien ne se passe sans clic.</p>' +
    '<p style="' + p + '">Vini, de DJingood</p>' +
    '<p style="' + p + ';font-size:13px;color:#5b5f73">Le bouton ne marche pas&nbsp;? Copie ce lien dans ton navigateur&nbsp;:<br>' +
    '<a href="' + l + '" style="color:#5b3fd6;word-break:break-all">' + l + '</a></p>' +
    '</td></tr><tr><td style="padding:4px 28px 24px;font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#8a8ea0">' +
    'DJingood · <a href="https://djingood.fr" style="color:#8a8ea0">djingood.fr</a></td></tr>' +
    '</table></td></tr></table></body></html>';
}

async function handler(req, res){
  if (req.method !== 'POST') return repond(res, 405, { erreur: 'methode' });
  const cle = (process.env.BREVO_CLE || '').trim(), c = compte();
  if (!cle || !c) return repond(res, 503, { erreur: 'pas-configure' });

  let b = req.body;
  if (typeof b === 'string'){ try { b = JSON.parse(b); } catch (e) { b = null; } }
  if (!b || typeof b !== 'object' || !mailOk(b.mail)) return repond(res, 400, { erreur: 'adresse' });
  const mail = b.mail.trim().toLowerCase(), retour = retourOk(b.retour);

  let jeton;
  try { jeton = await module.exports.jetonAcces(c); } catch (e) { return repond(res, 502, { erreur: 'google' }); }
  try {
    // 1. Le compte existe ? (on n'écrit jamais à une adresse sans compte)
    const qui = await google('/accounts:lookup', jeton, { email: [mail] });
    if (!qui.ok) return repond(res, 502, { erreur: 'google', statut: qui.status });
    const u = qui.d && Array.isArray(qui.d.users) ? qui.d.users[0] : null;
    if (!u || u.disabled || typeof u.localId !== 'string' || !mailOk(u.email)) return repond(res, 404, { erreur: 'pas-de-compte' });

    // 2. Les limites, comptées AVANT l'envoi par un ajout atomique (voir l'en-tête) : d'abord MAX par adresse et par heure,
    //    puis, seulement pour une demande qui a passé la première, PLAFOND par jour. (Une demande refusée ne compte pas dans
    //    la journée : sinon, quelqu'un pourrait couper Brevo pour tout le monde avec 200 demandes refusées, remarque du gardien.)
    const f = fiches(u.email.toLowerCase());
    const parAdresse = await compte1(f.adresse, jeton);
    if (!(parAdresse > 0)) return repond(res, 502, { erreur: 'compteur' });
    if (parAdresse > MAX) return repond(res, 429, { erreur: 'trop' });
    const parJour = await compte1(f.jour, jeton);
    if (!(parJour > 0)) return repond(res, 502, { erreur: 'compteur' });
    if (parJour > PLAFOND) return repond(res, 503, { erreur: 'plafond' });

    // 3. Le lien, fabriqué par Firebase sans qu'il l'envoie
    const oob = await google('/accounts:sendOobCode', jeton, { requestType: 'EMAIL_SIGNIN', email: u.email, continueUrl: retour, canHandleCodeInApp: true, returnOobLink: true });
    const lien = oob.ok && oob.d ? lienDirect(oob.d.oobLink, retour) : '';
    if (!lien) return repond(res, 502, { erreur: 'google', statut: oob.status });

    // 4. Brevo l'envoie, avec notre texte
    const prenom = prenomOk(u.displayName);
    const r = await fetch(BREVO, { method: 'POST', headers: { 'api-key': cle, accept: 'application/json', 'content-type': 'application/json' },
      body: JSON.stringify({ sender: EXPEDITEUR, to: [{ email: u.email }], subject: SUJET, htmlContent: mailHtml(prenom, lien), textContent: mailTexte(prenom, lien), tags: ['lien-connexion'] }) });
    if (!r.ok){
      // la raison donnée par Brevo (« Key not found », « unrecognised IP address »…), pour savoir quoi régler ; jamais la clé
      const d = await r.json().catch(() => null);
      const detail = d && typeof d.message === 'string' ? d.message.split(cle).join('…').slice(0, 200) : '';
      return repond(res, 502, { erreur: 'brevo', statut: r.status, code: d && typeof d.code === 'string' ? d.code.slice(0, 40) : '', detail });
    }
    return repond(res, 200, { envoye: true });
  } catch (e) { return repond(res, 502, { erreur: 'reseau' }); }
}

module.exports = handler;
module.exports.jetonAcces = jetonAcces;   // remplacé par les tests (pas de réseau vers Google)
module.exports.mailHtml = mailHtml;
module.exports.mailTexte = mailTexte;
module.exports.retourOk = retourOk;
module.exports.lienDirect = lienDirect;
module.exports.MAX = MAX;
module.exports.PLAFOND = PLAFOND;
module.exports.fiches = fiches;
module.exports.ajout = ajout;
