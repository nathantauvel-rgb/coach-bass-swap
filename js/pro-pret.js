// L'interrupteur de DJingood Pro (lot 68) : un seul endroit pour tout le site. Lu par js/pro.js (cadenas, fenêtre Pro),
// donc par niveaux.js, tutos.js, parcours.js… et par la page de présentation, qui n'écrit le prix que quand Pro est ouvert
// (sinon un visiteur lirait « 4,99 € » sur un site encore entièrement gratuit). Chargé juste après stats.js.
// Le jour de l'ouverture : passer à true (avec STRIPE.md, section 3 : les vrais réglages de Stripe et de Vercel).
'use strict';
const PRO_PRET = false;
