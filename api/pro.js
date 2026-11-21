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
   - `etat`    : { pro, formule ('mois' | 'an' | null), jusqua (secondes), annule (s'arrête à la fin de la période),
                 essai (pendant un essai gratuit), semaine (pendant les 7 jours gratuits, lot 76), offert (pas abonné : le
                 mois offert l'attend, compte d'avant la limite jamais abonné, lot 68), essaiDispo (pas abonné : jamais
                 abonné, donc les 7 jours gratuits sont possibles, lot 76) } ;
   - `payer`   : { formule, essai? } → { url } de la page de paiement de Stripe (409 si déjà Pro). Avec `essai: true`
                 (lot 68) : le mois offert aux comptes créés avant la limite (FONDATEURS_AVANT, plus bas), 30 jours sans
                 carte bancaire ; si aucune carte n'est ajoutée, l'abonnement s'arrête tout seul à la fin. 403
                 `essai-reserve` pour un compte plus récent ; une seule fois par compte : 409 `essai-deja` si ce compte a
                 déjà eu un abonnement, quel qu'il soit. Avec `essai: 'semaine'` (lot 76, décision de l'utilisateur du
                 19 nov. 2026) : 7 jours gratuits pour tout compte jamais abonné, **carte demandée** par Stripe au début ;
                 au 7e jour, l'abonnement démarre tout seul (sauf s'il a été arrêté). 409 `essai-deja` sinon. L'abonnement
                 porte `metadata.essai` ('semaine' ou 'mois-offert') : api/rappel.js prévient par mail 2 jours avant la fin
                 des essais 'semaine' ;
   - `session` : { id } → comme `etat`, juste après le paiement (la recherche de Stripe met jusqu'à une minute à voir un
                 nouvel abonnement ; la session de paiement, elle, le connaît tout de suite) ;
   - `gerer`   : { url } de la page « Gérer mon abonnement » de Stripe (changer de formule, de carte, factures, arrêter :
                 la loi de 2023 demande que s'arrêter soit aussi simple que s'abonner).
   Lot 81 (« La caisse », décision de l'utilisateur du 21 nov. 2026) : **le rattrapage**. Quelqu'un qui a ouvert la page de
   paiement sans payer a droit, pendant 48 heures et une seule fois, à sa première année à 34,99 € au lieu de 49,99 €. La date
   limite est vraie (une fausse urgence est interdite) : c'est ce fichier qui la calcule, à partir de la première page de
   paiement ouverte par ce compte chez Stripe (rattrapageJusqua), jamais à partir de ce que le site envoie. `etat` la donne
   (`rattrapage`, en secondes) ; `payer` avec `rattrapage: true` (l'année seulement) la revérifie (410 `rattrapage-fini`
   sinon) et applique la remise de 15 € (couponRattrapage). Le retour de Stripe sans payer : /?pro=retour#apprendre. */
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
  return { pro: true, formule: p === prix.an ? 'an' : p === prix.mois ? 'mois' : null, jusqua: finPeriode(s), annule: !!s.cancel_at_period_end, essai: s.status === 'trialing',
    semaine: s.status === 'trialing' && !!s.metadata && s.metadata.essai === 'semaine' };
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
/* Lot 68, demande de l'utilisateur (11 nov. 2026) : le mois offert va aux comptes DJingood DÉJÀ CRÉÉS ; un compte créé
   ensuite n'a que les exercices gratuits. La date de création vient de Firebase (accounts:lookup, avec le jeton du joueur et
   la clé publique du site, la même que js/compte.js : ce n'est pas un secret), jamais de ce que le site envoie.
   La limite : PRO_FONDATEURS_AVANT dans les réglages de Vercel (une date ISO), sinon la fin du 11 novembre 2026, heure de
   Paris. Si on la change, changer aussi la phrase de cgv.html (« créés jusqu'au 11 novembre 2026 inclus »). */
const FONDATEURS_AVANT = () => { const t = Date.parse(process.env.PRO_FONDATEURS_AVANT || ''); return isFinite(t) ? t : Date.parse('2026-11-12T00:00:00+01:00'); };
const CLE_WEB = 'AIzaSyCRQf6s3sNfUiJ-WIrRNBXV9tb09ZFeaAU';   // la clé publique du site (js/compte.js, CPT_CFG.apiKey)
async function creation(jeton){
  const r = await fetch('https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=' + CLE_WEB,
    { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ idToken: jeton }) });
  const d = await r.json().catch(() => ({}));
  if (!r.ok) throw Object.assign(new Error('google ' + r.status), { statut: r.status });
  const u = d && d.users && d.users[0];
  return u ? { uid: String(u.localId || ''), cree: Number(u.createdAt) || 0 } : null;
}
// Ce compte existait avant la limite (et c'est bien le sien : même identifiant que dans le jeton vérifié)
async function fondateur(jeton, qui){
  const c = await module.exports.creation(jeton);
  return !!c && c.uid === qui.uid && c.cree > 0 && c.cree < FONDATEURS_AVANT();
}
// Le mois offert l'attend : compte d'avant la limite, jamais abonné (une erreur de Google = pas d'offre affichée, rien de cassé)
async function offertA(jeton, qui, cle){
  try { if (!await fondateur(jeton, qui)) return false; } catch (e) { return false; }
  // Stripe qui répond mal ici ne doit pas faire échouer toute la réponse (gardien, 11 nov.) : pas de mois offert, c'est tout
  try { return !(await dejaAbonne(qui, cle)); } catch (e) { return false; }
}
// Lot 68 : ce compte a-t-il déjà eu un abonnement, même arrêté ? (le mois offert ne sert qu'une fois)
async function dejaAbonne(qui, cle){
  const q = encodeURIComponent(`metadata['uid']:'${qui.uid.replace(/'/g, '')}'`);
  const d = await stripe('/subscriptions/search?limit=1&query=' + q, cle);
  if ((d.data || []).length) return true;
  if (!qui.email) return false;
  const c = await stripe('/customers?limit=10&email=' + encodeURIComponent(qui.email), cle);
  for (const client of (c.data || []).slice(0, 5)){
    const s = await stripe('/subscriptions?status=all&limit=20&customer=' + encodeURIComponent(client.id), cle);
    if ((s.data || []).some(x => x && x.metadata && x.metadata.uid === qui.uid)) return true;
  }
  return false;
}

/* ---------- Lot 81 : le rattrapage ----------
   La fenêtre de 48 heures s'ouvre à la PREMIÈRE page de paiement que ce compte a ouverte depuis la mise en ligne du lot 81
   (RATTRAPAGE_DEPUIS) ; elle ne se rouvre jamais. Stripe ne sait pas chercher une page de paiement par compte : on parcourt
   celles créées depuis cette date (100 par page, 5 pages au plus) et on garde celles qui portent l'identifiant du compte
   (`client_reference_id`). Plus de 500 pages de paiement depuis la mise en ligne : on ne sait plus dire laquelle était la
   première, donc pas de rattrapage (jamais une date limite qu'on ne peut pas prouver). */
const RATTRAPAGE_HEURES = 48;
const RATTRAPAGE_REMISE = 1500;   // en centimes : 49,99 € − 15 € = 34,99 € la première année
const RATTRAPAGE_COUPON = 'djingood-rattrapage-1';
const RATTRAPAGE_DEPUIS = () => { const t = Date.parse(process.env.PRO_RATTRAPAGE_DEPUIS || ''); return isFinite(t) ? t : Date.parse('2026-11-21T00:00:00+01:00'); };
async function rattrapageJusqua(qui, cle){
  const depuis = Math.floor(RATTRAPAGE_DEPUIS() / 1000);
  let apres = '', premiere = null;
  for (let page = 0; page < 5; page++){
    const d = await stripe('/checkout/sessions?limit=100&created[gte]=' + depuis + (apres ? '&starting_after=' + encodeURIComponent(apres) : ''), cle);
    const liste = d.data || [];
    for (const s of liste) if (s && s.client_reference_id === qui.uid && typeof s.created === 'number' && (premiere === null || s.created < premiere)) premiere = s.created;
    if (!d.has_more || !liste.length){ apres = ''; break; }
    apres = liste[liste.length - 1].id;
  }
  if (apres || premiere === null) return null;
  const fin = premiere + RATTRAPAGE_HEURES * 3600;
  return fin * 1000 > module.exports.maintenant() ? fin : null;
}
/* La remise elle-même : un coupon de 15 €, créé chez Stripe la première fois qu'on en a besoin (rien à régler à la main).
   « repeating » sur 1 mois, et pas « once » : avec les 7 jours gratuits, Stripe émet d'abord une facture à 0 € qui pourrait
   consommer un coupon « once » ; un coupon de 1 mois couvre la première vraie facture (au 7e jour, ou tout de suite sans
   essai) et jamais le renouvellement, un an plus tard. */
async function couponRattrapage(cle){
  try { await stripe('/coupons/' + RATTRAPAGE_COUPON, cle); }
  catch (e){
    if (e.statut !== 404) throw e;
    await stripe('/coupons', cle, { corps: { id: RATTRAPAGE_COUPON, amount_off: RATTRAPAGE_REMISE, currency: 'eur', duration: 'repeating', duration_in_months: 1, name: 'DJingood −15 €' } });
  }
  return RATTRAPAGE_COUPON;
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
    if (b.action === 'etat'){
      const e = etatDe(await abonnement(qui, cle), prix);
      if (!e.pro){
        e.offert = await offertA(m[1], qui, cle);   // lot 68 : le mois offert des comptes déjà créés
        // lot 76 : les 7 jours gratuits, pour un compte jamais abonné (Stripe qui répond mal : on le propose, payer revérifie)
        let jamais = null;
        try { jamais = !(await dejaAbonne(qui, cle)); e.essaiDispo = jamais; } catch (er) { e.essaiDispo = true; }
        // lot 81 : le rattrapage, pour un compte jamais abonné, pendant ses 48 heures (Stripe qui répond mal : pas d'offre)
        if (jamais === true){ try { const r = await rattrapageJusqua(qui, cle); if (r) e.rattrapage = r; } catch (er) {} }
      }
      return repond(res, 200, e);
    }

    if (b.action === 'payer'){
      if (!FORMULES.includes(b.formule)) return repond(res, 400, { erreur: 'formule' });
      if (await abonnement(qui, cle)) return repond(res, 409, { erreur: 'deja-pro' });
      const essai = b.essai === true, semaine = b.essai === 'semaine', rattrapage = b.rattrapage === true;
      // lot 81 : le rattrapage, c'est l'année, et jamais avec le mois offert
      if (rattrapage && (b.formule !== 'an' || essai)) return repond(res, 400, { erreur: 'rattrapage' });
      if (essai){
        let f; try { f = await fondateur(m[1], qui); } catch (e) { return repond(res, 502, { erreur: 'google' }); }
        if (!f) return repond(res, 403, { erreur: 'essai-reserve' });   // un compte créé après la limite : pas de mois offert
        if (await dejaAbonne(qui, cle)) return repond(res, 409, { erreur: 'essai-deja' });
      }
      // lot 76 : les 7 jours gratuits, une seule fois par compte (un compte qui a déjà eu un abonnement paie tout de suite)
      if (semaine && await dejaAbonne(qui, cle)) return repond(res, 409, { erreur: 'essai-deja' });
      // lot 81 : le rattrapage (l'année à 34,99 €), revérifié ici : la fenêtre de 48 heures, et jamais abonné
      let coupon = '';
      if (rattrapage){
        if (!(await rattrapageJusqua(qui, cle)) || await dejaAbonne(qui, cle)) return repond(res, 410, { erreur: 'rattrapage-fini' });
        coupon = await couponRattrapage(cle);
      }
      // lot 80 : le site en anglais envoie { langue: 'en' } : la page de Stripe en anglais, et l'abonnement le retient
      // (metadata.langue) pour que le mail de rappel de l'essai (api/rappel.js) parte en anglais
      const en = b.langue === 'en';
      const s = await stripe('/checkout/sessions', cle, { corps: Object.assign({
        // lot 81 : Stripe refuse les codes promo ET une remise sur la même page : avec le rattrapage, la remise seulement
        mode: 'subscription', locale: en ? 'en' : 'fr',
        line_items: { 0: { price: prix[b.formule], quantity: 1 } },
        client_reference_id: qui.uid, customer_email: qui.email,
        metadata: { uid: qui.uid }, subscription_data: Object.assign({ metadata: Object.assign({ uid: qui.uid }, essai ? { essai: 'mois-offert' } : semaine ? { essai: 'semaine' } : {}, en ? { langue: 'en' } : {}, rattrapage ? { rattrapage: '1' } : {}) },
          // le mois offert : 30 jours, sans carte ; sans carte ajoutée d'ici là, l'abonnement s'arrête (rien n'est prélevé)
          essai ? { trial_period_days: 30, trial_settings: { end_behavior: { missing_payment_method: 'cancel' } } } : {},
          // lot 76 : 7 jours gratuits, la carte est demandée (le réglage par défaut de Stripe) ; Stripe écrit lui-même sur sa
          // page « 7 jours gratuits » et la date du premier paiement
          semaine ? { trial_period_days: 7 } : {}),
        // lot 81 : revenir de Stripe sans payer le dit au site (pro=retour), qui montre alors le rattrapage
        success_url: site + '/?pro=merci&session={CHECKOUT_SESSION_ID}#apprendre', cancel_url: site + '/?pro=retour#apprendre',
        // la case à cocher obligatoire : les conditions de vente, et l'accès tout de suite (le joueur renonce au délai de
        // rétractation de 14 jours, comme la loi le permet pour un contenu numérique ouvert immédiatement)
        consent_collection: { terms_of_service: 'required' },
        custom_text: { terms_of_service_acceptance: { message: en
          ? `I accept the [terms of sale](${site}/terms.html). I ask for access to DJingood Pro right away and I waive my 14-day right of withdrawal.`
          : `J'accepte les [conditions de vente](${site}/cgv.html). Je demande l'accès à DJingood Pro tout de suite et je renonce à mon délai de rétractation de 14 jours.` } }
      }, essai ? { payment_method_collection: 'if_required' } : {}, coupon ? { discounts: { 0: { coupon } } } : { allow_promotion_codes: 'true' }) });
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
      const p = await stripe('/billing_portal/sessions', cle, { corps: { customer: typeof s.customer === 'string' ? s.customer : s.customer.id, return_url: site + '/#apprendre', locale: b.langue === 'en' ? 'en' : 'fr' } });
      return repond(res, 200, { url: p.url });
    }
  } catch (e) { return repond(res, 502, { erreur: 'stripe', statut: e.statut || 0 }); }
  return repond(res, 400, { erreur: 'action' });
}

module.exports = handler;
module.exports.formulaire = formulaire;
module.exports.cles = () => mails.cles();   // remplacé par les tests (pas de réseau vers Google)
module.exports.creation = creation;   // remplacé par les tests (pas de réseau vers Google)
module.exports.maintenant = () => Date.now();   // lot 81 : remplacé par les tests (la fenêtre de 48 heures du rattrapage)
module.exports.RATTRAPAGE_REMISE = RATTRAPAGE_REMISE;   // api/rappel.js : le montant du mail de rappel
