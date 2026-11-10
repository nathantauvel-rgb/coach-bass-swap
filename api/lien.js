// Le lien de connexion, envoyé par Brevo avec notre texte (lot 67 « Le mail qui arrive »).
// Fonction Vercel : le fichier api/lien.js répond à l'adresse /api/lien du site. Aucune dépendance.
'use strict';
/* Pourquoi : jusqu'ici, Firebase envoyait lui-même le mail du lien de connexion, avec son texte à lui (impossible à
   changer), et le premier mail d'un nouveau venu tombait souvent dans les spams, où Gmail désactive les liens. Ici, on
   demande le lien à Firebase sans le lui faire envoyer, puis Brevo l'envoie avec notre texte, depuis djingood.fr.

   Réglages de Vercel (Settings → Environment Variables), jamais dans le site :
   - BREVO_CLE       : la clé d'API de Brevo (la même que pour les mails de Vini, lot 54) ;
   - FIREBASE_COMPTE : la clé d'un compte de service Google aux droits limités (« Administrateur Firebase Authentication »),
                       tout le fichier JSON tel quel. Elle permet de fabriquer le lien ; elle ne sort jamais d'ici.
   Sans elles : 503, et le site envoie le lien par Firebase, comme avant (rien ne casse).

   Sécurités :
   - on n'envoie qu'à une adresse qui a déjà un compte DJingood (sinon 404, et le site repasse par Firebase) ;
   - au plus MAX liens par adresse et par heure (429), pour que personne ne puisse bombarder une boîte ; les envois sont
     retenus sur le compte lui-même (champ « liens » de ses attributs Firebase), sans autre base ;
   - le lien ramène toujours sur une page de DJingood (SITES), jamais sur une adresse donnée par celui qui appelle ;
   - rien de libre n'arrive dans le mail : le prénom ne garde que des lettres.

   Le lien du mail pointe directement sur djingood.fr (…?apiKey=…&oobCode=…&mode=signIn), comme celui où Firebase
   ramène après son propre passage : le site le reconnaît pareil (stats.js, LIEN_CONNEXION), et un lien vers le même
   domaine que l'expéditeur rassure les messageries.

   POST { mail, retour } → 200 { envoye: true } | 400 | 404 pas-de-compte | 405 | 429 trop | 502 | 503 pas-configure */
const crypto = require('crypto');
const PROJET = 'djingo-1e1f4';   // le projet Firebase (identifiant technique, ne jamais le renommer)
const IDT = 'https://identitytoolkit.googleapis.com/v1/projects/' + PROJET;
const JETON = 'https://oauth2.googleapis.com/token';
const BREVO = 'https://api.brevo.com/v3/smtp/email';
// Même expéditeur que les mails de Firebase depuis le 10 nov. 2026 : ce que les joueurs ont déjà marqué « pas un spam » compte
const EXPEDITEUR = { name: 'DJingood', email: 'noreply@djingood.fr' };
const SITES = ['https://djingood.fr', 'https://www.djingood.fr', 'https://coach-bass-swap.vercel.app'];
const MAX = 3, FENETRE = 3600 * 1000;
const SUJET = 'Ton lien pour te connecter à DJingood';

const mailOk = v => typeof v === 'string' && v.trim().length <= 200 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
// Un prénom : des lettres, et au plus un espace, un tiret ou une apostrophe entre deux lettres (comme api/mails.js)
const prenomOk = v => (typeof v === 'string' && /^\p{L}+(?:[ '’-]\p{L}+)?$/u.test(v.trim()) && v.trim().length <= 30 ? v.trim() : '');
const html = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
function repond(res, code, d){ res.statusCode = code; res.setHeader('Content-Type', 'application/json; charset=utf-8'); res.setHeader('Cache-Control', 'no-store'); res.end(JSON.stringify(d)); }

// La page où le lien ramène : celle d'où le joueur l'a demandé, si c'est bien une page de DJingood ; sinon l'accueil
function retourOk(v){
  try {
    const u = new URL(String(v));
    if (SITES.includes(u.origin) && /^\/[\w./-]{0,80}$/.test(u.pathname) && !u.pathname.includes('..')) return u.origin + u.pathname;
  } catch (e) {}
  return SITES[0] + '/';
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
  const r = await fetch(IDT + chemin, { method: 'POST', headers: { authorization: 'Bearer ' + jeton, 'content-type': 'application/json' }, body: JSON.stringify(corps) });
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
  const cle = process.env.BREVO_CLE, c = compte();
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

    // 2. Pas plus de MAX liens par heure pour cette adresse (retenus sur le compte, avant l'envoi)
    let attr = {};
    try { attr = JSON.parse(u.customAttributes || '{}'); } catch (e) {}
    if (!attr || typeof attr !== 'object' || Array.isArray(attr)) attr = {};
    const recents = (Array.isArray(attr.liens) ? attr.liens : []).filter(x => typeof x === 'number' && Date.now() - x < FENETRE && x <= Date.now());
    if (recents.length >= MAX) return repond(res, 429, { erreur: 'trop' });
    attr.liens = recents.concat(Date.now()).slice(-MAX);
    const note = await google('/accounts:update', jeton, { localId: u.localId, customAttributes: JSON.stringify(attr) });
    if (!note.ok) return repond(res, 502, { erreur: 'google', statut: note.status });

    // 3. Le lien, fabriqué par Firebase sans qu'il l'envoie
    const oob = await google('/accounts:sendOobCode', jeton, { requestType: 'EMAIL_SIGNIN', email: u.email, continueUrl: retour, canHandleCodeInApp: true, returnOobLink: true });
    const lien = oob.ok && oob.d ? lienDirect(oob.d.oobLink, retour) : '';
    if (!lien) return repond(res, 502, { erreur: 'google', statut: oob.status });

    // 4. Brevo l'envoie, avec notre texte
    const prenom = prenomOk(u.displayName);
    const r = await fetch(BREVO, { method: 'POST', headers: { 'api-key': cle, accept: 'application/json', 'content-type': 'application/json' },
      body: JSON.stringify({ sender: EXPEDITEUR, to: [{ email: u.email }], subject: SUJET, htmlContent: mailHtml(prenom, lien), textContent: mailTexte(prenom, lien), tags: ['lien-connexion'] }) });
    if (!r.ok) return repond(res, 502, { erreur: 'brevo', statut: r.status });
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
