# Ouvrir DJingood Pro : la marche à suivre

Le code de l'abonnement est prêt (lot 59), mais **éteint** (`PRO_PRET = false` dans `js/pro-pret.js`). Stripe, l'entreprise qui
encaisse les paiements, est réglé en **mode test** (de fausses cartes, aucun argent) ; on passe en vrai quand tout est prêt.

## Ce qui est déjà fait (9 nov. 2026, en mode test)
- Un compte Stripe **à part pour DJingood**, rangé dans ton organisation Stripe à côté de tes autres projets (pour que la
  page de paiement et le relevé bancaire disent « DJingood », jamais le nom d'un autre projet).
- Le produit **DJingood Pro** et ses deux prix : **4,99 € par mois** et **49,99 € par an**.
- La page « Gérer mon abonnement » (le portail client) : annuler (Pro reste ouvert jusqu'à la fin de la période payée,
  sans remboursement), changer de formule (mensuel → annuel tout de suite, la part du mois non utilisée est déduite ;
  annuel → mensuel à la fin de l'année payée), changer de carte, voir ses factures.
- Les moyens de paiement : **la carte seulement** (Apple Pay et Google Pay passent par elle), comme le disent les conditions
  de vente. Stripe en ajoute d'autres tout seul (Klarna, Amazon Pay…) : ils sont éteints.
- Essayé de bout en bout sur l'ordinateur (http://localhost:8774), par un robot et par toi, avec la carte de test
  `4242 4242 4242 4242`.

Pour Claude : les scripts de `captures/stripe/` (hors Git, copie `coach-dj-lot59`) refont tout ça sur un compte de test, à
partir de la clé de test rangée dans un fichier de l'ordinateur, hors de tout dépôt (jamais dans le dépôt ni dans le chat) :
`installe.js` (produit et prix), `portail.js`, `moyens.js`, `serveur.js` (le site et `api/pro.js` sur le port 8774),
`robot.js` (un paiement complet avec la carte 4242). En réel : `captures/stripe-reel/installe-reel.js` (copie `coach-dj-lot68`, hors Git ; regarde seulement, ou `--creer`).

## 1. Brancher Stripe sur le site en ligne (Vercel), toujours en mode test
À faire une fois le lot 59 publié (éteint : les joueurs ne voient rien).
1. Dans Vercel : projet `coach-bass-swap` → **Settings → Environment Variables**, ajoute les trois réglages que Claude te
   donne (`STRIPE_CLE`, `STRIPE_PRIX_MOIS`, `STRIPE_PRIX_AN`). La clé secrète ne se colle jamais dans le site.
2. Redéploie (Deployments → les trois points → Redeploy), pour que la fonction `api/pro.js` les lise.
3. Essaie : https://djingood.fr/?tutos=1&pro=1#tutos (le paramètre `pro=1` allume Pro pour ton onglet seulement), un tuto
   avec un cadenas, « Passer à Pro », la carte `4242 4242 4242 4242` (date dans le futur, n'importe quel code).

## 2. Ce que Stripe affiche et envoie (dans le compte DJingood)
- **Paramètres → Image de marque** : le logo de Vini et la couleur `#7C4DFF`.
- **Paramètres → E-mails clients** : allumer les **reçus de paiement**, les **rappels avant le renouvellement d'un
  abonnement** (obligatoire pour la formule à l'année) et les **paiements qui échouent**.

## 3. Avant de passer en vrai (état au 11 nov. 2026)
- [x] Les passages entre crochets de `cgv.html` et `mentions-legales.html` : nom, SIREN, adresse, e-mail (lot 66, repris
  dans le lot 68).
- [ ] **Le médiateur de la consommation** (obligatoire quand on vend à des particuliers ; CM2C conseillé) : t'inscrire, puis
  donner à Claude le nom et l'adresse exacts de ta convention, pour `cgv.html`.
- [x] Les vrais paiements activés dans Stripe (SIRET, compte bancaire). Tu gardes ton compte Stripe d'avant, renommé
  « DJingood » (nom public et nom du compte), rangé sous ton organisation « Djingood ». Libellé du relevé : `DJINGOOD`.
  L'autre compte « DJingood » (dans « Autres comptes ») est l'essai du 9 nov. : il ne sert plus.
- [x] En mode réel : le produit et ses deux prix, le portail client, les moyens de paiement (carte, Apple Pay, Google Pay),
  le 11 nov. Une page de paiement normale et une page « mois offert sans carte » ont été ouvertes puis refermées : Stripe
  accepte les deux.
- [x] `confidentialite.html` dit ce que Stripe garde (lot 68).

## 4. Le jour de l'ouverture
1. Claude : le médiateur et la date dans `cgv.html` (« Conditions en vigueur au … »), `PRO_PRET = true` dans
   `js/pro-pret.js` (c'est tout : les tutos suivent Pro, `TUTOS_PRET` ne sert plus), les tests, le gardien.
2. Toi, dans Vercel (projet `coach-bass-swap` → Settings → Environment Variables) : remplacer `STRIPE_CLE`,
   `STRIPE_PRIX_MOIS` et `STRIPE_PRIX_AN` par les valeurs réelles que Claude te donne (jamais dans le chat pour la clé :
   tu la recopies depuis ton fichier privé). Pas avant : avec l'adresse d'essai `?pro=1`, n'importe qui pourrait payer
   pour de vrai.
3. Publication, seulement avec ton accord, puis Redeploy dans Vercel si les réglages ont changé après.
4. Un vrai essai : un compte créé avant le 12 nov. voit le mois offert ; un nouveau compte voit 3 exercices gratuits.
