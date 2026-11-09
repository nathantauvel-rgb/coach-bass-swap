// DJingood Pro (lot 59) : la seule porte entre le site et Stripe, qui encaisse les abonnements.
// Fonction Vercel : le fichier api/pro.js répond à l'adresse /api/pro du site. Aucune dépendance.
'use strict';
/* Pourquoi une fonction : la clé secrète de Stripe permet d'encaisser et de rembourser au nom de DJingood. Elle reste ici,
   dans les réglages de Vercel (Settings → Environment Variables), jamais dans le site :
   - STRIPE_CLE       : la clé secrète de Stripe (sk_test_… pour essayer, sk_live_… pour de vrai) ;
   - STRIPE_PRIX_MOIS : l'identifiant du prix « 4,99 € par mois » (price_…) ;
   - STRIPE_PRIX_AN   : l'identifiant du prix « 49,99 € par an » (price_…) ;
   - SITE_URL         : facultatif, l'adresse du site (https://djingood.fr par défaut), pour revenir après le paiement.
   Sans elles, la fonction répond 503 et le site dit que le paiement n'est pas encore ouvert.

   **C'est Stripe qui dit qui est Pro** : pas de base de données en plus. Chaque abonnement porte l'identifiant du compte
   Firebase du joueur (`metadata.uid`) ; pour savoir si quelqu'un est Pro, on cherche ses abonnements chez Stripe. Le site
   envoie le jeton de son compte Firebase (Authorization: Bearer …), vérifié comme pour les mails (api/mails.js) : **on
   prend l'identifiant et l'adresse dans le jeton**, jamais dans ce que le site envoie.

   Actions (POST, JSON) :
   - `etat`    : { pro, formule ('mois' | 'an' | null), jusqua (secondes), annule (s'arrête à la fin de la période) } ;
   - `payer`   : { formule } → { url } de la page de paiement de Stripe (409 si déjà Pro) ;
   - `session` : { id } → comme `etat`, juste après le paiement (la recherche de Stripe met jusqu'à une minute à voir un
                 nouvel abonnement ; la session de paiement, elle, le connaît tout de suite) ;
   - `gerer`   : { url } de la page « Gérer mon abonnement » de Stripe (changer de formule, de carte, factures, arrêter :
                 la loi de 2023 demande que s'arrêter soit aussi simple que s'abonner). */
const mails = require('./mails.js');   // la vérification du jeton Firebase, la même que pour les mails
const STRIPE = 'https://api.stripe.com/v1';
const ACTIFS = ['active', 'trialing', 'past_due'];   // past_due : un paiement a échoué, Stripe réessaie ; Pro reste ouvert
const FORMULES = ['mois', 'an'];

function repond(res, code, d){ res.statusCode = code; res.setHeader('Content-Type', 'application/json; charset=utf-8'); res.setHeader('Cache-Control', 'no-store'); res.end(JSON.stringify(d)); }
// Les paramètres de Stripe s'envoient comme un formulaire : line_items[0][price]=…
function formulaire(o, prefixe = '', out = []){
  for (const [k, v] of Object.entries(o)){
    const cle = prefixe ? `${prefixe}[${k}]` : k;
    if (v && typeof v === 'object') formulaire(v, cle, out);
    else if (v !== undefined && v !== null) out.push(encodeURIComponent(cle) + '=' + encodeURIComponent(String(v)));
  }
  return out.join('&');
}
async function stripe(chemin, cle, o = {}){
  const r = await fetch(STRIPE + chemin, { method: o.corps ? 'POST' : 'GET',
    headers: Object.assign({ Authorization: 'Bearer ' + cle }, o.corps ? { 'Content-Type': 'application/x-www-form-urlencoded' } : {}),
    body: o.corps ? formulaire(o.corps) : undefined });
  const d = await r.json().catch(() => ({}));
  if (!r.ok) throw Object.assign(new Error('stripe ' + r.status), { statut: r.status });
  return d;
}
// La fin de la période payée : sur l'abonnement (anciennes versions de l'API de Stripe) ou sur sa ligne (depuis 2025)
const finPeriode = s => s.current_period_end || (s.items && s.items.data && s.items.data[0] && s.items.data[0].current_period_end) || null;
function etatDe(s, prix){
  if (!s || !ACTIFS.includes(s.status)) return { pro: false, formule: null, jusqua: null, annule: false };
  const p = s.items && s.items.data && s.items.data[0] && s.items.data[0].price && s.items.data[0].price.id;
  return { pro: true, formule: p === prix.an ? 'an' : p === prix.mois ? 'mois' : null, jusqua: finPeriode(s), annule: !!s.cancel_at_period_end };
}
/* L'abonnement de ce compte : le plus récent qui est encore actif.
   Deux chemins, parce que **la recherche de Stripe met jusqu'à une minute à voir un nouvel abonnement** (vu avec le vrai
   Stripe le 9 nov. 2026 : « Gérer mon abonnement » répondait « pas abonné » 2 s après le paiement, et un rechargement
   aurait remis les cadenas) :
   1. les clients Stripe qui ont l'adresse du compte, puis leurs abonnements : des listes, à jour tout de suite (la page
      de paiement crée le client avec cette adresse, `customer_email`) ;
   2. sinon, la recherche par identifiant du compte (l'adresse a pu changer depuis le paiement).
   Dans les deux cas, **seul un abonnement qui porte l'identifiant du compte compte** : une adresse ne suffit jamais
   (Firebase laisse créer un compte avec l'adresse de quelqu'un d'autre). */
const bonAbo = uid => s => !!s && !!s.metadata && s.metadata.uid === uid && ACTIFS.includes(s.status);
async function abonnement(qui, cle){
  const uid = qui.uid, liste = [];
  if (qui.email){
    const c = await stripe('/customers?limit=10&email=' + encodeURIComponent(qui.email), cle);
    for (const client of (c.data || []).slice(0, 5)){
      const s = await stripe('/subscriptions?status=all&limit=20&customer=' + encodeURIComponent(client.id), cle);
      liste.push(...(s.data || []));
    }
  }
  if (!liste.some(bonAbo(uid))){
    const q = encodeURIComponent(`metadata['uid']:'${uid.replace(/'/g, '')}'`);
    const d = await stripe('/subscriptions/search?limit=10&query=' + q, cle);
    liste.push(...(d.data || []));
  }
  const actifs = liste.filter(bonAbo(uid));
  actifs.sort((a, b) => (b.created || 0) - (a.created || 0));
  return actifs[0] || null;
}

async function handler(req, res){
  if (req.method !== 'POST') return repond(res, 405, { erreur: 'methode' });
  const cle = process.env.STRIPE_CLE, prix = { mois: process.env.STRIPE_PRIX_MOIS, an: process.env.STRIPE_PRIX_AN };
  if (!cle || !prix.mois || !prix.an) return repond(res, 503, { erreur: 'pas-configure' });
  const site = (process.env.SITE_URL || 'https://djingood.fr').replace(/\/+$/, '');

  const m = /^Bearer (.+)$/.exec(String(req.headers.authorization || ''));
  let qui = null;
  try { qui = m ? mails.verifie(m[1], await module.exports.cles()) : null; } catch (e) { return repond(res, 502, { erreur: 'certificats' }); }
  if (!qui) return repond(res, 401, { erreur: 'jeton' });

  let b = req.body;
  if (typeof b === 'string'){ try { b = JSON.parse(b); } catch (e) { b = null; } }
  if (!b || typeof b !== 'object') return repond(res, 400, { erreur: 'corps' });

  try {
    if (b.action === 'etat') return repond(res, 200, etatDe(await abonnement(qui, cle), prix));

    if (b.action === 'payer'){
      if (!FORMULES.includes(b.formule)) return repond(res, 400, { erreur: 'formule' });
      if (await abonnement(qui, cle)) return repond(res, 409, { erreur: 'deja-pro' });
      const s = await stripe('/checkout/sessions', cle, { corps: {
        mode: 'subscription', locale: 'fr', allow_promotion_codes: 'true',
        line_items: { 0: { price: prix[b.formule], quantity: 1 } },
        client_reference_id: qui.uid, customer_email: qui.email,
        metadata: { uid: qui.uid }, subscription_data: { metadata: { uid: qui.uid } },
        success_url: site + '/?pro=merci&session={CHECKOUT_SESSION_ID}#tutos', cancel_url: site + '/#tutos',
        // la case à cocher obligatoire : les conditions de vente, et l'accès tout de suite (le joueur renonce au délai de
        // rétractation de 14 jours, comme la loi le permet pour un contenu numérique ouvert immédiatement)
        consent_collection: { terms_of_service: 'required' },
        custom_text: { terms_of_service_acceptance: { message: `J'accepte les [conditions de vente](${site}/cgv.html). Je demande l'accès aux tutos tout de suite et je renonce à mon délai de rétractation de 14 jours.` } }
      } });
      return repond(res, 200, { url: s.url });
    }

    if (b.action === 'session'){
      if (typeof b.id !== 'string' || !/^cs_[A-Za-z0-9_]{6,250}$/.test(b.id)) return repond(res, 400, { erreur: 'session' });
      const s = await stripe('/checkout/sessions/' + b.id + '?expand[]=subscription', cle);
      if (s.client_reference_id !== qui.uid) return repond(res, 403, { erreur: 'pas-a-toi' });
      return repond(res, 200, etatDe(s.subscription && typeof s.subscription === 'object' ? s.subscription : null, prix));
    }

    if (b.action === 'gerer'){
      const s = await abonnement(qui, cle);
      if (!s || !s.customer) return repond(res, 404, { erreur: 'pas-abonne' });
      const p = await stripe('/billing_portal/sessions', cle, { corps: { customer: typeof s.customer === 'string' ? s.customer : s.customer.id, return_url: site + '/#tutos', locale: 'fr' } });
      return repond(res, 200, { url: p.url });
    }
  } catch (e) { return repond(res, 502, { erreur: 'stripe', statut: e.statut || 0 }); }
  return repond(res, 400, { erreur: 'action' });
}

module.exports = handler;
module.exports.formulaire = formulaire;
module.exports.cles = () => mails.cles();   // remplacé par les tests (pas de réseau vers Google)
