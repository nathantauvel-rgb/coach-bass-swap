// Le mail de rappel des 7 jours gratuits (lot 76) : deux jours avant la fin d'un essai, Vini prévient que l'abonnement va
// démarrer, combien, et comment arrêter. Fonction Vercel : le fichier api/rappel.js répond à l'adresse /api/rappel.
// Aucune dépendance.
'use strict';
/* Pourquoi : décision de l'utilisateur (19 nov. 2026) : 7 jours gratuits, carte demandée au début. Sans rappel, des joueurs
   oublient d'arrêter, voient le prélèvement et se sentent piégés (plaintes, remboursements, litiges). C'est un **mail de
   service** (il parle de l'abonnement que la personne vient de commencer) : il part à tous ceux qui essaient, sans la case
   « Vini peut m'écrire ». La page de Stripe et les conditions de vente l'annoncent.

   Qui l'appelle : Vercel, une fois par jour (vercel.json, « crons »), avec l'en-tête Authorization: Bearer <CRON_SECRET>.
   Réglages de Vercel (Settings → Environment Variables), jamais dans le site :
   - CRON_SECRET : une longue phrase au hasard ; Vercel l'envoie tout seul à chaque passage (sans elle, personne d'autre
                   ne peut déclencher des mails) ;
   - STRIPE_CLE  : la même que pour api/pro.js ;
   - BREVO_CLE   : la même que pour api/lien.js.
   Sans eux : 503, et rien ne part.

   Ce qu'il fait : il demande à Stripe les abonnements en essai (status=trialing) et garde ceux qui
   - viennent des 7 jours gratuits (metadata.essai = 'semaine', écrit par api/pro.js ; pas le mois offert des anciens comptes,
     qui ne demande pas de carte et ne prélève rien) ;
   - n'ont pas été arrêtés (cancel_at_period_end : il n'y aura pas de prélèvement) ;
   - n'ont pas encore été prévenus (metadata.rappel) ;
   - finissent dans FENETRE (de 20 à 60 heures : la tâche passe une fois par jour, à une heure qui peut glisser).
   Il envoie le mail par Brevo, puis écrit metadata.rappel sur l'abonnement : jamais deux mails pour le même essai.
   Une erreur sur un abonnement n'empêche pas les autres. */
const STRIPE = 'https://api.stripe.com/v1';
const BREVO = 'https://api.brevo.com/v3/smtp/email';
const EXPEDITEUR = { name: 'Vini de DJingood', email: 'noreply@djingood.fr' };
const FENETRE = [20 * 3600, 60 * 3600];   // secondes avant la fin de l'essai
const PAGES = 10;                         // au plus 10 pages de 100 abonnements en essai par passage
const pro = require('./pro.js');          // formulaire : les paramètres de Stripe s'envoient comme un formulaire

function repond(res, code, d){ res.statusCode = code; res.setHeader('Content-Type', 'application/json; charset=utf-8'); res.setHeader('Cache-Control', 'no-store'); res.end(JSON.stringify(d)); }
const html = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
async function stripe(chemin, cle, corps){
  const r = await fetch(STRIPE + chemin, { method: corps ? 'POST' : 'GET',
    headers: Object.assign({ Authorization: 'Bearer ' + cle }, corps ? { 'Content-Type': 'application/x-www-form-urlencoded' } : {}),
    body: corps ? pro.formulaire(corps) : undefined });
  const d = await r.json().catch(() => ({}));
  if (!r.ok) throw Object.assign(new Error('stripe ' + r.status), { statut: r.status });
  return d;
}

// Le jour de la fin de l'essai, en français, heure de Paris : « jeudi 26 novembre »
const jour = s => new Date(s * 1000).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'Europe/Paris' });
// Ce qui sera prélevé : « 49,99 € pour l'année » ou « 4,99 € par mois », lu sur le prix de l'abonnement (jamais deviné)
function montant(s){
  const p = s && s.items && s.items.data && s.items.data[0] && s.items.data[0].price;
  if (!p || typeof p.unit_amount !== 'number') return '';
  const e = (p.unit_amount / 100).toFixed(2).replace('.', ',') + ' €', iv = p.recurring && p.recurring.interval;
  return iv === 'year' ? e + ' pour l’année' : iv === 'month' ? e + ' par mois' : e;
}
const SUJET = d => 'Ton essai de DJingood Pro se termine ' + d;
function mailTexte(d, m){
  return 'Salut !\n\n' +
    `Ton essai gratuit de DJingood Pro se termine ${d}. Ce jour-là, ton abonnement démarre${m ? ' : ' + m + ', prélevés sur la carte que tu as donnée' : ''}.\n\n` +
    'Tu veux continuer ? Tu n’as rien à faire.\n\n' +
    'Tu veux arrêter ? Sur djingood.fr, ouvre ton compte (en haut à droite), puis « Gérer mon abonnement » et « Annuler '
    + 'l’abonnement ». Rien ne sera prélevé, et Pro reste ouvert jusqu’à la fin de l’essai.\n\n' +
    'https://djingood.fr\n\nVini, de DJingood\n';
}
function mailHtml(d, m){
  const p = 'font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:1.5;color:#1d2030;margin:0 0 16px';
  return '<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">' +
    '<title>' + html(SUJET(d)) + '</title></head><body style="margin:0;padding:0;background:#f3f1fa">' +
    '<div style="display:none;max-height:0;overflow:hidden;opacity:0">Tu veux continuer ? Rien à faire. Tu veux arrêter ? Un clic suffit.</div>' +
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f3f1fa"><tr><td align="center" style="padding:28px 12px">' +
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border-radius:14px">' +
    '<tr><td style="padding:28px 28px 8px;font-family:Arial,Helvetica,sans-serif;font-size:22px;font-weight:bold;color:#1d2030">' +
    '<span style="color:#7c4dff">DJ</span>ingood</td></tr>' +
    '<tr><td style="padding:12px 28px 4px">' +
    '<p style="' + p + ';font-size:18px;font-weight:bold">Salut !</p>' +
    '<p style="' + p + '">Ton essai gratuit de DJingood Pro se termine <b>' + html(d) + '</b>. Ce jour-là, ton abonnement démarre' +
    (m ? '&nbsp;: <b>' + html(m) + '</b>, prélevés sur la carte que tu as donnée' : '') + '.</p>' +
    '<p style="' + p + '"><b>Tu veux continuer&nbsp;?</b> Tu n’as rien à faire.</p>' +
    '<p style="' + p + '"><b>Tu veux arrêter&nbsp;?</b> Sur djingood.fr, ouvre ton compte (en haut à droite), puis «&nbsp;Gérer mon abonnement&nbsp;» ' +
    'et «&nbsp;Annuler l’abonnement&nbsp;». Rien ne sera prélevé, et Pro reste ouvert jusqu’à la fin de l’essai.</p>' +
    '<table role="presentation" cellpadding="0" cellspacing="0" style="margin:8px 0 22px"><tr><td style="border-radius:10px;background:#7c4dff">' +
    '<a href="https://djingood.fr/" style="display:inline-block;padding:14px 28px;font-family:Arial,Helvetica,sans-serif;font-size:17px;font-weight:bold;color:#ffffff;text-decoration:none;border-radius:10px">Aller sur DJingood</a>' +
    '</td></tr></table>' +
    '<p style="' + p + '">Vini, de DJingood</p>' +
    '</td></tr><tr><td style="padding:4px 28px 24px;font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#8a8ea0">' +
    'Tu reçois ce mail parce que tu as commencé un essai gratuit de DJingood Pro. · <a href="https://djingood.fr" style="color:#8a8ea0">djingood.fr</a></td></tr>' +
    '</table></td></tr></table></body></html>';
}

// Cet abonnement doit recevoir le rappel maintenant
function aPrevenir(s, maintenant){
  if (!s || s.status !== 'trialing' || !s.metadata || s.metadata.essai !== 'semaine' || s.metadata.rappel) return false;
  if (s.cancel_at_period_end || s.cancel_at) return false;
  const reste = (s.trial_end || 0) - maintenant;
  return reste >= FENETRE[0] && reste <= FENETRE[1];
}

async function handler(req, res){
  const secret = (process.env.CRON_SECRET || '').trim(), cle = process.env.STRIPE_CLE, brevo = (process.env.BREVO_CLE || '').trim();
  if (!secret || !cle || !brevo) return repond(res, 503, { erreur: 'pas-configure' });
  if (String(req.headers.authorization || '') !== 'Bearer ' + secret) return repond(res, 401, { erreur: 'secret' });

  const maintenant = Math.floor(module.exports.maintenant() / 1000), bilan = { vus: 0, envoyes: 0, erreurs: 0 };
  let apres = '';
  try {
    for (let page = 0; page < PAGES; page++){
      const d = await stripe('/subscriptions?status=trialing&limit=100&expand[]=data.customer' + (apres ? '&starting_after=' + encodeURIComponent(apres) : ''), cle);
      const liste = d.data || [];
      for (const s of liste){
        bilan.vus++;
        if (!aPrevenir(s, maintenant)) continue;
        try {
          let mail = s.customer && typeof s.customer === 'object' ? s.customer.email : '';
          if (!mail && typeof s.customer === 'string') mail = (await stripe('/customers/' + encodeURIComponent(s.customer), cle)).email || '';
          if (!mail){ bilan.erreurs++; continue; }
          const dj = jour(s.trial_end), m = montant(s);
          const r = await fetch(BREVO, { method: 'POST', headers: { 'api-key': brevo, accept: 'application/json', 'content-type': 'application/json' },
            body: JSON.stringify({ sender: EXPEDITEUR, to: [{ email: mail }], subject: SUJET(dj), htmlContent: mailHtml(dj, m), textContent: mailTexte(dj, m), tags: ['rappel-essai'] }) });
          if (!r.ok){ bilan.erreurs++; continue; }
          // jamais deux mails pour le même essai ; Stripe qui répond mal : on réessaie une fois (gardien : sans la marque, le
          // mail repartirait le lendemain, rare mais possible)
          const marque = () => stripe('/subscriptions/' + encodeURIComponent(s.id), cle, { metadata: { rappel: new Date(maintenant * 1000).toISOString() } });
          try { await marque(); } catch (e) { await marque(); }
          bilan.envoyes++;
        } catch (e) { bilan.erreurs++; }
      }
      if (!d.has_more || !liste.length) break;
      apres = liste[liste.length - 1].id;
    }
  } catch (e) { return repond(res, 502, Object.assign({ erreur: 'stripe', statut: e.statut || 0 }, bilan)); }
  return repond(res, 200, bilan);
}

module.exports = handler;
module.exports.maintenant = () => Date.now();   // remplacé par les tests
module.exports.aPrevenir = aPrevenir;
module.exports.montant = montant;
module.exports.mailHtml = mailHtml;
module.exports.mailTexte = mailTexte;
module.exports.FENETRE = FENETRE;
