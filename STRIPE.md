# Ouvrir DJingood Pro : la marche à suivre

Le code de l'abonnement est prêt (lot 59), mais **éteint** (`PRO_PRET = false` dans `js/pro.js`). Stripe, l'entreprise qui
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
`robot.js` (un paiement complet avec la carte 4242).

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

## 3. Avant de passer en vrai
- Compléter les passages entre crochets de `cgv.html` et `mentions-legales.html` (nom, SIRET, adresse, e-mail, date).
- **Choisir un médiateur de la consommation** (obligatoire quand on vend à des particuliers) et écrire son nom dans
  `cgv.html`.
- Vérifier ta micro-entreprise (SIRET, état à l'URSSAF, TVA).
- Dans le compte Stripe DJingood, activer les vrais paiements : ton SIRET et ton compte bancaire. Vérifier le nom public
  (`DJingood`), le site (`https://djingood.fr`), les conditions d'utilisation (`https://djingood.fr/cgv.html`) et le libellé
  du relevé bancaire (`DJINGOOD`).
- En mode réel, tout est à refaire : le produit et ses deux prix, le portail client, les moyens de paiement (carte
  seulement), puis remplacer les trois réglages de Vercel par la clé `sk_live_…` et les nouveaux `price_…`.
- Mettre à jour `confidentialite.html` (ce que Stripe garde : l'adresse, les paiements, les factures ; jamais la carte
  chez DJingood).
- Ensuite seulement : `PRO_PRET = true` (et `TUTOS_PRET = true` pour montrer l'onglet).
