# Suivre les visites et lire les avis (lot 45)

Deux choses distinctes :

- **Les statistiques** (Umami) : combien de gens viennent, d'où (TikTok, Google…), sur quel appareil,
  et jusqu'où ils vont dans le jeu. Sans cookie, donc sans bandeau à accepter.
- **Les avis** (Firebase) : ce que les joueurs écrivent dans « Mon avis ». Ils arrivent dans la même
  base que les comptes.

## 1. Créer le compte Umami (5 minutes, une seule fois)

1. Va sur https://cloud.umami.is/signup et inscris-toi (formule gratuite « Hobby »). Un code à 6 chiffres
   arrive par e-mail : tape-le.
2. À « Select data region », choisis **EU**. Puis « Skip setup ».
3. Menu de gauche **Websites** → **Add website** (en haut à droite). Name : `DJingood`, Domain : `djingood.fr` → **Save**.
4. **Edit** à côté du site → partie **Tracking code** : copie le code et donne-le à Claude. Il en tire
   l'identifiant du site (`data-website-id`) et le met dans `STATS_ID`, en haut de `js/stats.js`.
   Ce n'est pas un secret : il est visible dans la page de n'importe quel site qui utilise Umami.

Tant que `STATS_ID` est vide, rien n'est compté.

## 2. Publier les nouvelles règles Firebase (2 minutes, AVANT la mise en ligne)

Console Firebase → projet `djingo-1e1f4` → **Firestore Database** → onglet **Règles** → efface tout →
colle le contenu de [firestore.rules](firestore.rules) → **Publier**.

Elles ajoutent la collection `avis` : tout le monde peut y **déposer** un avis, personne ne peut les
relire depuis le site. Les règles des comptes ne changent pas.

Si le site part en ligne avant les règles, rien ne casse : l'avis reste sur l'ordinateur du joueur et
repart tout seul à sa visite suivante.

## 3. Ne pas compter tes propres visites

Tu vas beaucoup jouer : sur chacun de tes appareils, ouvre https://djingood.fr/confidentialite.html et
appuie sur **Ne plus compter mes visites**. (À refaire si tu vides ton navigateur.)

## 4. Le lien à mettre dans ta bio TikTok

```
https://djingood.fr/?utm_source=tiktok
```

Umami range alors ces visiteurs sous « tiktok », même quand l'appli TikTok ne dit pas d'où ils viennent.
Pour une vidéo précise : `?utm_source=tiktok&utm_campaign=nom-de-la-video`.

## Où lire quoi

| Tu veux savoir… | Où regarder |
|---|---|
| Combien de visiteurs, d'où, sur quel appareil | Umami → ton site → **Overview** |
| Où les joueurs s'arrêtent | Umami → **Events** (ou **Reports → Funnel** avec les étapes ci-dessous) |
| Les niveaux pas clairs | Umami → **Events** → `clair` → propriétés `niveau` et `reponse` |
| Ce que les joueurs écrivent | Firebase → **Firestore Database** → collection `avis` |
| La progression des inscrits | Firebase → **Firestore Database** → collection `joueurs` |
| Le nombre de comptes | Firebase → **Authentication** → **Users** |

## Les étapes du jeu comptées (une fois par navigateur)

Dans l'ordre où un joueur les rencontre :

| Étape | Quand |
|---|---|
| `sans-midi` | Le navigateur ne peut pas parler à une table (iPhone, appli TikTok, Safari, Firefox) |
| `premiers-pas-fin` | Il a répondu aux questions de Vini (avec son parcours et s'il a une table) |
| `premiers-pas-passes` | Il a appuyé sur « Passer » |
| `table-branchee` | Une table est branchée (avec son nom) |
| `premiere-partie` | Il a appuyé sur « Jouer » pour la première fois |
| `premiere-reussite` | Premier niveau réussi (2 étoiles ou plus) |
| `chapitre-1` à `chapitre-7` | Premier niveau réussi dans ce chapitre |
| `compte` | Il s'est connecté à un compte |
| `rekordbox` | Il a importé sa collection rekordbox |
| `revenu` | Il est revenu un autre jour |
| `jours-7` | Il est venu 7 jours différents |

Et à chaque fois : `avis` (un avis envoyé, avec sa note) et `clair` (une réponse à « C'était clair ? »).

La formule gratuite d'Umami garde 6 mois d'historique. Le nombre de visites et d'étapes qu'elle compte
par mois est indiqué sur https://umami.is/pricing (environ 100 000 d'après un comparatif, le 25 oct. 2026).
