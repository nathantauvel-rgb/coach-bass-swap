// Les mails de Vini (lot 54) : la seule porte entre le site et Brevo, l'outil qui envoie les mails.
// Fonction Vercel : le fichier api/mails.js répond à l'adresse /api/mails du site. Aucune dépendance.
'use strict';
/* Pourquoi une fonction : la clé de Brevo permet d'envoyer des mails au nom de DJingood. Écrite dans le site, n'importe
   qui pourrait la lire. Elle reste ici, dans les réglages de Vercel (Settings → Environment Variables) :
   - BREVO_CLE   : la clé d'API de Brevo (SMTP & API → Clés API) ;
   - BREVO_LISTE : le numéro de la liste « Mails de Vini » dans Brevo.
   Sans elles, la fonction répond 503 et le site dit que ça n'a pas marché.

   Le site envoie le jeton de son compte Firebase (Authorization: Bearer …). On vérifie sa signature avec les clés
   publiques de Google, et **on prend l'adresse dans le jeton**, jamais dans ce que le site envoie. Et **on n'inscrit
   qu'une adresse confirmée** (`email_verified`) : Firebase laisse créer un compte avec l'adresse de n'importe qui, donc
   sans ça on pourrait faire envoyer nos mails à un inconnu (feu rouge du gardien). Un compte Google est confirmé ; un
   compte par e-mail l'est quand le joueur a cliqué le lien que le site lui fait envoyer.
   Rien de libre n'arrive dans un mail : le prénom ne garde que des lettres, et la prochaine étape doit être un nom de
   la liste NIVEAUX (les titres du site, vérifiés par un test).

   Actions (POST, JSON) :
   - `oui`  : { prenom, niveau, ou } → le contact est créé ou mis à jour dans Brevo et mis dans la liste. Brevo envoie
     alors les mails de bienvenue (automatisation « contact ajouté à la liste »). Il redevient joignable s'il s'était
     désinscrit : il vient de redire oui sur le site. Adresse pas confirmée : 403.
   - `non`  : le contact sort de la liste et est marqué « ne plus écrire » (comme le lien d'un mail). On ne l'efface
     pas : recréé plus tard, il recevrait de nouveau les mails de bienvenue.
   - `etat` : { oui } = dans la liste et pas désinscrit. */
const crypto = require('crypto');
const PROJET = 'djingo-1e1f4';   // le projet Firebase (identifiant technique, ne jamais le renommer)
const CERTS = 'https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com';
const BREVO = 'https://api.brevo.com/v3';
const OU = ['creation', 'question', 'compte'];
// Les seules « prochaines étapes » qu'un mail peut afficher : les niveaux du chapitre 1 et les étapes des parcours
// (BASE_LESSONS et STAGES dans le site). Un test de tests/mails.spec.js vérifie qu'il n'en manque aucune.
const NIVEAUX = ['Le bon moment', 'Le fader', 'La coupure sèche', 'L\'écho out', 'Le filtre', 'Le swap des basses', 'La transition complète',
  'Comprendre la musique', 'Découvre ta table', 'Les bases', 'Les bases en Mode Expert', 'Les combos', 'S\'entraîner', 'La maîtrise',
  'Les vrais morceaux', 'Le calage', 'Hot cues et boucles', 'Le set', 'Passer au vrai'];

// Les clés publiques de Google, gardées le temps qu'il indique
let cache = { cles: null, fin: 0 };
async function cles(){
  if (cache.cles && Date.now() < cache.fin) return cache.cles;
  const r = await fetch(CERTS);
  if (!r.ok) throw new Error('certificats ' + r.status);
  const age = /max-age=(\d+)/.exec(r.headers.get('cache-control') || '');
  cache = { cles: await r.json(), fin: Date.now() + (age ? +age[1] : 3600) * 1000 };
  return cache.cles;
}

const b64 = s => Buffer.from(String(s).replace(/-/g, '+').replace(/_/g, '/'), 'base64');
// Le jeton est-il un vrai jeton de ce projet, pas expiré ? Renvoie { uid, email, confirme } ou null.
function verifie(jeton, lesCles, maintenant = Date.now() / 1000){
  const p = String(jeton || '').split('.');
  if (p.length !== 3) return null;
  let h, c;
  try { h = JSON.parse(b64(p[0]).toString('utf8')); c = JSON.parse(b64(p[1]).toString('utf8')); } catch (e) { return null; }
  if (!h || h.alg !== 'RS256' || !lesCles || typeof lesCles[h.kid] !== 'string') return null;
  let ok = false;
  try { ok = crypto.createVerify('RSA-SHA256').update(p[0] + '.' + p[1]).verify(lesCles[h.kid], b64(p[2])); } catch (e) { return null; }
  if (!ok || !c) return null;
  if (c.aud !== PROJET || c.iss !== 'https://securetoken.google.com/' + PROJET) return null;
  if (!(c.exp > maintenant) || !(c.iat <= maintenant + 300) || typeof c.sub !== 'string' || !c.sub || c.sub.length > 128) return null;
  if (typeof c.email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c.email) || c.email.length > 200) return null;
  return { uid: c.sub, email: c.email.toLowerCase(), confirme: c.email_verified === true };
}

// Un prénom : des lettres, et au plus un espace, un tiret ou une apostrophe entre deux lettres (« Jean-Pierre », « Lou Ann »)
const prenomOk = v => (typeof v === 'string' && /^\p{L}+(?:[ '’-]\p{L}+)?$/u.test(v.trim()) && v.trim().length <= 30 ? v.trim() : '');
const jour = () => new Date().toISOString().slice(0, 10);
function brevo(chemin, cle, o = {}){
  return fetch(BREVO + chemin, Object.assign({}, o, { headers: { 'api-key': cle, accept: 'application/json', 'content-type': 'application/json' } }));
}
function repond(res, code, d){ res.statusCode = code; res.setHeader('Content-Type', 'application/json; charset=utf-8'); res.setHeader('Cache-Control', 'no-store'); res.end(JSON.stringify(d)); }

async function handler(req, res){
  if (req.method !== 'POST') return repond(res, 405, { erreur: 'methode' });
  const cle = process.env.BREVO_CLE, liste = parseInt(process.env.BREVO_LISTE, 10);
  if (!cle || !(liste > 0)) return repond(res, 503, { erreur: 'pas-configure' });

  const m = /^Bearer (.+)$/.exec(String(req.headers.authorization || ''));
  let qui = null;
  try { qui = m ? verifie(m[1], await module.exports.cles()) : null; } catch (e) { return repond(res, 502, { erreur: 'certificats' }); }
  if (!qui) return repond(res, 401, { erreur: 'jeton' });

  let b = req.body;
  if (typeof b === 'string'){ try { b = JSON.parse(b); } catch (e) { b = null; } }
  if (!b || typeof b !== 'object') return repond(res, 400, { erreur: 'corps' });
  const adresse = encodeURIComponent(qui.email);

  try {
    if (b.action === 'oui'){
      if (!qui.confirme) return repond(res, 403, { erreur: 'adresse-non-confirmee' });
      const attributes = { ACCORD_LE: jour(), ACCORD_OU: OU.includes(b.ou) ? b.ou : 'compte' };
      const prenom = prenomOk(b.prenom);
      if (prenom) attributes.PRENOM = prenom;
      if (NIVEAUX.includes(b.niveau)) attributes.NIVEAU = b.niveau;
      const r = await brevo('/contacts', cle, { method: 'POST', body: JSON.stringify({ email: qui.email, attributes, listIds: [liste], updateEnabled: true, emailBlacklisted: false }) });
      if (!r.ok) return repond(res, 502, { erreur: 'brevo', statut: r.status });
      return repond(res, 200, { oui: true });
    }
    if (b.action === 'non'){
      const r = await brevo('/contacts/' + adresse, cle, { method: 'PUT', body: JSON.stringify({ emailBlacklisted: true, unlinkListIds: [liste] }) });
      if (!r.ok && r.status !== 404) return repond(res, 502, { erreur: 'brevo', statut: r.status });
      return repond(res, 200, { oui: false });
    }
    if (b.action === 'etat'){
      const r = await brevo('/contacts/' + adresse, cle, { method: 'GET' });
      if (r.status === 404) return repond(res, 200, { oui: false });
      if (!r.ok) return repond(res, 502, { erreur: 'brevo', statut: r.status });
      const d = await r.json();
      return repond(res, 200, { oui: !!d && Array.isArray(d.listIds) && d.listIds.includes(liste) && !d.emailBlacklisted });
    }
  } catch (e) { return repond(res, 502, { erreur: 'brevo' }); }
  return repond(res, 400, { erreur: 'action' });
}

module.exports = handler;
module.exports.verifie = verifie;
module.exports.NIVEAUX = NIVEAUX;
module.exports.cles = cles;   // remplacé par les tests (pas de réseau vers Google)
