# Brancher les comptes DJingood (environ 10 minutes)

Le code des comptes est écrit et testé. Il lui manque une seule chose : **les coordonnées de ta base**.
Tant qu'elles ne sont pas remplies, le bouton « Se connecter » reste caché et le site marche
exactement comme avant. Rien ne risque de casser.

Tout se fait sur **console.firebase.google.com**, avec ton compte Google. C'est gratuit pour notre
taille (le palier gratuit couvre très largement quelques centaines de joueurs).

Je ne peux pas faire ces étapes à ta place : elles demandent ton compte Google.

---

## 1. Créer le projet

1. Va sur https://console.firebase.google.com et clique **Créer un projet**.
2. Nom : `DJingood`. Tu peux **désactiver Google Analytics** (on n'en a pas besoin).
3. Attends la création, puis entre dans le projet.

## 2. Autoriser la connexion avec Google

1. Menu de gauche : **Build → Authentication**, puis **Get started**.
2. Onglet **Sign-in method** → clique **Google** → bascule **Enable**.
3. Choisis une adresse d'assistance (la tienne) → **Save**.

## 3. Autoriser nos adresses

Toujours dans **Authentication** → onglet **Settings** → **Authorized domains**.
`localhost` y est déjà. Ajoute, une ligne à la fois :

```
coach-bass-swap.vercel.app
djingood.fr
www.djingood.fr
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
2. Section **Vos applications** → icône **`</>`** (Web) → nom `DJingood` → **Enregistrer l'application**
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
| Le mail « Mot de passe oublié » arrive dans les indésirables | Section suivante : envoyer les e-mails depuis djingood.fr |

## Envoyer les e-mails depuis djingood.fr (15 minutes, puis jusqu'à 48 h d'attente)

**Pourquoi** : l'e-mail « Mot de passe oublié » part aujourd'hui de `noreply@djingo-1e1f4.firebaseapp.com`, une
adresse qui n'appartient pas à DJingood. Gmail le range dans les indésirables et y désactive le lien. En l'envoyant
depuis `djingood.fr`, le domaine qui est à toi, tu prouves aux messageries que le message vient bien de toi. Ça ne
garantit pas la boîte de réception dès le premier jour (un domaine tout neuf n'a pas encore de réputation), mais
c'est la condition pour y arriver.

Ouvre deux onglets côte à côte : la console Firebase, et la zone DNS d'OVH (Web Cloud → Noms de domaine →
`djingood.fr` → Zone DNS).

### A. Dans Firebase : demander le domaine

1. Projet `djingo-1e1f4` → **Authentication** → onglet **Templates** (« Modèles »).
2. Choisis le modèle **Password reset** (« Réinitialisation du mot de passe ») et clique sur le crayon.
3. À côté de l'expéditeur, clique sur **Customize domain** (« Personnaliser le domaine »).
4. Tape `djingood.fr` et valide. Firebase affiche les lignes à ajouter chez OVH (en général une ou deux lignes
   **TXT** et deux lignes **CNAME**). **Laisse cette page ouverte** : ce sont ces valeurs-là qu'il faut recopier,
   à la lettre. Ne les prends jamais ailleurs (ni de mémoire, ni dans un tuto) : elles sont propres à ton projet.

### B. Chez OVH : recopier les lignes

Pour chaque ligne donnée par Firebase : **Ajouter une entrée**, choisis le type (TXT ou CNAME), puis :

- **Sous-domaine** : OVH ajoute `djingood.fr` tout seul derrière. Si Firebase donne
  `firebase1._domainkey.djingood.fr`, tape seulement `firebase1._domainkey`. Si Firebase donne `djingood.fr` tout
  court (ou `@`), laisse le champ **vide**.
- **Cible / valeur** : copier-coller exact depuis Firebase.

⚠️ **Le piège de la ligne SPF** (celle dont la valeur commence par `v=spf1`). Ta zone en a **déjà une**, mise par
OVH : `v=spf1 include:mx.ovh.com -all`. Un domaine ne doit en avoir **qu'une seule** : avec deux, les messageries
n'en croient aucune, et les mails partent encore plus sûrement en indésirables. Donc **n'en ajoute pas une
deuxième** : modifie celle qui existe (le crayon au bout de la ligne ; chez OVH elle peut être affichée en type
TXT ou SPF) en y glissant le morceau `include:…` donné par Firebase, juste avant `-all`. Par exemple, si Firebase
donne `v=spf1 include:_spf.exemple.com ~all`, ta ligne devient :

```
v=spf1 include:mx.ovh.com include:_spf.exemple.com -all
```

Ne supprime aucune autre ligne de la zone : le site et la réception des mails sur `djingood.fr` en dépendent.

### C. De retour dans Firebase : valider

1. Clique sur **Verify** (« Valider »). Ça prend de quelques minutes à 48 heures : si Firebase répond « en
   attente », ce n'est pas une erreur, reviens plus tard.
2. Une fois validé, dans le modèle : nom de l'expéditeur **`DJingood`** (le nom affiché, pas une adresse), adresse
   **`noreply@djingood.fr`**. Ne touche ni à l'objet ni au message : ils sont affichés en anglais, mais le site
   demande le français à chaque envoi. Le lien du mail reste en `djingo-1e1f4.firebaseapp.com`, c'est normal.
   Le `%APP_NAME%` du mail est le **nom public** du projet : roue dentée → Paramètres du projet → Général →
   Nom public → `DJingood`. Seulement ce nom-là : l'identifiant `djingo-1e1f4` ne change jamais.
3. Fais-toi envoyer un « Mot de passe oublié » depuis le site et regarde où il arrive. S'il arrive dans la boîte de
   réception, le message du site (qui dit aujourd'hui de regarder dans les indésirables) pourra être adouci.

**Pour vérifier sans croire l'interface** : `nslookup -type=TXT djingood.fr ns103.ovh.net` doit montrer **une
seule** ligne qui commence par `v=spf1`, avec le morceau de Firebase dedans. Mesurer sur ce serveur-là (celui
d'OVH), pas sur celui de ta box, qui garde l'ancienne réponse plusieurs heures. Une ligne `"1|www.djingood.fr"`
apparaît aussi : c'est un reste d'OVH, sans danger, on la laisse. Si Firebase reste « en attente » plus de 48 h,
regarder d'abord la ligne `v=spf1`.
