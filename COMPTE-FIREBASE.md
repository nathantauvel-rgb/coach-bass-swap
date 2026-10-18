# Brancher les comptes DJingo (environ 10 minutes)

Le code des comptes est écrit et testé. Il lui manque une seule chose : **les coordonnées de ta base**.
Tant qu'elles ne sont pas remplies, le bouton « Se connecter » reste caché et le site marche
exactement comme avant. Rien ne risque de casser.

Tout se fait sur **console.firebase.google.com**, avec ton compte Google. C'est gratuit pour notre
taille (le palier gratuit couvre très largement quelques centaines de joueurs).

Je ne peux pas faire ces étapes à ta place : elles demandent ton compte Google.

---

## 1. Créer le projet

1. Va sur https://console.firebase.google.com et clique **Créer un projet**.
2. Nom : `DJingo`. Tu peux **désactiver Google Analytics** (on n'en a pas besoin).
3. Attends la création, puis entre dans le projet.

## 2. Autoriser la connexion avec Google

1. Menu de gauche : **Build → Authentication**, puis **Get started**.
2. Onglet **Sign-in method** → clique **Google** → bascule **Enable**.
3. Choisis une adresse d'assistance (la tienne) → **Save**.

## 3. Autoriser nos adresses

Toujours dans **Authentication** → onglet **Settings** → **Authorized domains**.
`localhost` y est déjà. Ajoute :

```
coach-bass-swap.vercel.app
```

Sans ça, la connexion affichera « Ce site n'est pas encore autorisé ».

## 4. Créer la base

1. Menu de gauche : **Build → Firestore Database** → **Create database**.
2. Choisis **Start in production mode** (on met nos propres règles juste après).
3. Emplacement : **eur3 (europe-west)** — nos joueurs sont en Europe.

## 5. Coller les règles de sécurité

Onglet **Rules** de Firestore → efface tout → colle le contenu du fichier
[firestore.rules](firestore.rules) de ce dossier → **Publish**.

C'est ce qui garantit qu'un joueur ne peut voir que sa propre progression.

## 6. Récupérer les coordonnées

1. Roue dentée en haut à gauche → **Paramètres du projet**.
2. Section **Vos applications** → icône **`</>`** (Web) → nom `DJingo` → **Enregistrer l'application**
   (ne coche **pas** Firebase Hosting, on est déjà sur Vercel).
3. Firebase affiche un bloc `const firebaseConfig = { … }`. **Copie-le et envoie-le-moi**, ou remplis
   toi-même le haut de [js/compte.js](js/compte.js) :

```js
let CPT_CFG = { apiKey: 'AIza…', authDomain: 'djingo-xxxx.firebaseapp.com', projectId: 'djingo-xxxx', appId: '1:…:web:…' };
```

Il n'y a que ces quatre lignes à changer.

> Ces valeurs **ne sont pas des secrets** : elles sont visibles dans la page de n'importe quel site qui
> utilise Firebase. La sécurité vient des règles de l'étape 5, pas du fait de les cacher. On peut donc
> les mettre dans le dépôt sans problème.

---

## Ce qui se passera ensuite

- Un bouton **« Se connecter »** apparaît en haut à droite.
- Au premier compte, si tu as déjà une progression sur cet ordinateur, elle est **envoyée sur le compte**
  (tu ne perds rien).
- Si le compte a déjà une progression **et** que l'ordinateur en a une autre, le site demande laquelle garder.
- Ensuite, chaque étoile, chaque XP, chaque badge est enregistré tout seul, 2,5 secondes après.
- **Ne suivent pas le compte** (ça n'aurait pas de sens ailleurs) : les réglages MIDI de la table, le nom
  d'une autre table, la vérification de la table, la collection rekordbox importée, et le bouton des sons.
- « Tout recommencer à zéro » efface aussi la progression du compte.

Une fois que ça marche chez toi, il restera deux petites choses à écrire, que j'ai laissées de côté tant que le
bouton n'existe pas : une phrase dans `README.md` et une sur `presentation.html` (« ta progression te suit d'un
appareil à l'autre »).

## Deux limites, à connaître avant de le dire aux testeurs

- **Deux appareils en même temps ne fusionnent pas.** Le site compare les deux progressions au chargement de la
  page, pas en continu. Si tu joues sur l'ordinateur et sur le téléphone dans la même heure, le dernier qui
  enregistre gagne, et l'autre perd sa séance au rechargement suivant. Quand les deux ont avancé chacun de leur
  côté, le site ne choisit pas tout seul : il demande laquelle garder.
- **Sans réseau, rien n'est enregistré en ligne** (c'est normal), et « Tout recommencer à zéro » refuse de
  s'exécuter plutôt que d'effacer seulement la moitié. Il te le dit et te propose de réessayer connecté.

## Si ça ne marche pas

| Message | Ce qu'il faut faire |
|---|---|
| « Ce site n'est pas encore autorisé » | Étape 3 : ajouter l'adresse dans Authorized domains |
| « Le compte n'a pas le droit d'écrire » | Étape 5 : les règles ne sont pas publiées |
| « Ton navigateur a bloqué la fenêtre » | Autoriser les fenêtres surgissantes pour le site |
| Le bouton n'apparaît pas | Les coordonnées de l'étape 6 ne sont pas remplies |
