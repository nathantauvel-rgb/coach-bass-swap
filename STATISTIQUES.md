# Suivre les visites et lire les avis (lot 46)

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

**Fait le 25 oct. 2026** : l'identifiant de djingood.fr est dans `js/stats.js`. Tant que `STATS_ID` est vide,
rien n'est compté.

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

## 4. Savoir combien viennent de TikTok

Avec moins de 1 000 abonnés, le lien de la bio TikTok n'est pas cliquable : les gens tapent `djingood.fr`
eux-mêmes. Umami les range alors dans les visites **« Direct »** (sans provenance). Tant que TikTok est le
seul endroit où DJingood est montré, **Direct ≈ TikTok** : regarde la courbe des visites dans les heures qui
suivent chaque vidéo.

Pour que l'adresse soit facile à recopier : écrite en gros et dite dans chaque vidéo, et un commentaire
épinglé « 👉 djingood.fr » (on peut le copier en gardant le doigt appuyé dessus).

Le jour où le lien de la bio devient cliquable (1 000 abonnés), y mettre :

```
https://djingood.fr/?utm_source=tiktok
```

Umami rangera alors ces visiteurs sous « tiktok ».

## 5. PostHog : suivre chaque joueur du téléphone jusqu'à l'abonnement (lot 77, 10 minutes, une seule fois)

Umami donne des totaux. PostHog reçoit **les mêmes étapes**, mais les relie entre elles pour chaque joueur : tu vois
combien de gens passent d'une étape à la suivante, et en combien de jours. Surtout, avec un compte, PostHog relie la visite
sur le téléphone (où le compte est créé) à la visite sur l'ordinateur (où le lien du mail est ouvert) : c'est le seul
moyen de mesurer le passage du téléphone à l'ordinateur.

Comme Umami : sans cookie, sans aucun identifiant gardé sur l'appareil, seulement sur le vrai site, et le bouton de la page de
confidentialité le coupe (donc si tu as déjà fait l'étape 3, tes propres visites ne sont pas comptées non plus).
Pas d'enregistrement de l'écran.

1. Va sur https://eu.posthog.com/signup : **bien la version EU** (les données restent en Europe). Crée le compte.
2. Quand PostHog propose d'installer un bout de code : passe cette étape, il est déjà dans le site.
3. **Settings** → **Project** → copie la **Project API key** (elle commence par `phc_`) et donne-la à Claude.
   Ce n'est pas un secret (elle est lue par le navigateur de chaque visiteur) : elle peut aller dans le chat, contrairement
   à la clé Stripe. Claude la met dans `PH_ID`, en haut de `js/stats.js`.
4. Toujours dans **Settings** → **Project** : active **Discard client IP data** (PostHog ne garde pas l'adresse IP).
5. Après la mise en ligne, crée l'entonnoir : **Product analytics** → **New insight** → **Funnel**, avec ces étapes dans
   l'ordre : `mur-vu` → `compte` → `lien-ordi-envoye` → `ordi-depuis-lien` → `table-branchee` → `premiere-reussite` →
   `essai-fini` → `pro`. Fenêtre de conversion : **14 jours**. Enregistre-le sous le nom « Du téléphone à Pro ».
   **Depuis le lot 82 (chapitre 1 gratuit en entier)**, remplace `essai-fini` (les 3 niveaux gratuits, plus envoyé) par
   `ch1-fini` (le niveau 7 réussi : la grande carte de Pro est montrée).

### Lot 82 : savoir si le chapitre 1 offert vend mieux

- **Le chiffre à suivre, chaque semaine** : les essais commencés (`pro-offre`, puis `pro`) pour 100 tables branchées
  (`table-branchee`), avant et après la mise en ligne du lot 82.
- `ch1-fini` : le niveau 7 réussi pour la première fois (une fois par navigateur).
- `demo-pro` : la démo d'un chapitre fermé regardée (chaque fois), avec `chap` (le chapitre) et `depuis` (`fin` : la grande
  carte du niveau 7 ; `fenetre` : l'image de la fenêtre Pro ; `niveau` ou `carte` : un niveau de Pro).
- La règle décidée avant (analyse de `Documents\MARKETING\08-chapitre-1-offert.md`) : après 3 à 4 semaines, si ce chiffre
  est plus bas qu'avant, on remet 3 niveaux gratuits (`NIV_GRATUITS` dans `js/niveaux.js`), ou on essaie 6.

## Où lire quoi

| Tu veux savoir… | Où regarder |
|---|---|
| Combien de visiteurs, d'où, sur quel appareil | Umami → ton site → **Overview** |
| Où les joueurs s'arrêtent | Umami → **Events** (ou **Reports → Funnel** avec les étapes ci-dessous) |
| Combien passent du téléphone à l'ordinateur, puis à Pro, et en combien de jours | PostHog → l'entonnoir « Du téléphone à Pro » |
| Le chemin d'un joueur en particulier | PostHog → **People** → un joueur (identifiant du compte) → ses événements |
| Les niveaux pas clairs | Umami → **Events** → `clair` → propriétés `niveau` et `reponse` |
| Ce que les joueurs écrivent | Firebase → **Firestore Database** → collection `avis` |
| La progression des inscrits | Firebase → **Firestore Database** → collection `joueurs` |
| Le nombre de comptes | Firebase → **Authentication** → **Users** |

## Les étapes du jeu comptées (une fois par navigateur)

Dans l'ordre où un joueur les rencontre :

| Étape | Quand |
|---|---|
| `anglais` | Il a ouvert le site en anglais (bouton EN, ou une adresse avec `?lang=en`), une fois par navigateur (lots 53 et 80) |
| `sans-midi` | Le navigateur ne peut pas parler à une table (iPhone, appli TikTok, Safari, Firefox) |
| `premiers-pas-fin` | Il a répondu aux questions de Vini (avec son parcours et s'il a une table) |
| `premiers-pas-passes` | Il a appuyé sur « Passer » (avant le lot 65, qui a retiré « Passer ») |
| `quiz-oreille` | Il a tapé les 8 temps de « Ton oreille » (avec son score, `pile`) |
| `plan-vu` | Il a vu « Ton plan est prêt » |
| `mur-vu` | Il a vu l'écran du compte, obligatoire juste après le plan (lot 65) |
| `mur-sans-compte` | Firebase ne répondait pas : il a continué sans compte |
| `lien-ordi-envoye` | Un lien de connexion lui a été envoyé par mail (sur téléphone : pour l'ordinateur) |
| `ordi-depuis-lien` | Il a ouvert ce lien et s'est connecté (sur l'ordinateur, le plus souvent) |
| `comprendre-1` | Il a fini sa première leçon « Comprendre » (lot 48) |
| `comprendre-fin` | Il a fini les sept leçons « Comprendre » |
| `table-branchee` | Une table est branchée (avec son nom) |
| `premiere-partie` | Il a appuyé sur « Jouer » pour la première fois |
| `premiere-reussite` | Premier niveau réussi (2 étoiles ou plus) |
| `chapitre-1` à `chapitre-7` | Premier niveau réussi dans ce chapitre |
| `compte` | Il s'est connecté à un compte |
| `rekordbox` | Il a importé sa collection rekordbox (onglet « Ma musique ») |
| `ma-musique-fiche` | Il a ouvert la fiche d'un de ses morceaux (« Ce qui va avec ») |
| `ma-musique-paire` | Il a ouvert « Préparer la transition » pour une paire de ses morceaux |
| `revenu` | Il est revenu un autre jour |
| `jours-7` | Il est venu 7 jours différents |

Et à chaque fois : `avis` (un avis envoyé, avec sa note) et `clair` (une réponse à « C'était clair ? »).

Le lien de connexion, à chaque envoi : `lien-envoye`, avec `par` = `brevo` (notre mail, lot 67) ou `firebase` (le mail de
Firebase, quand Brevo n'est pas réglé ou ne répond pas). Pour savoir si le mail arrive : compare `lien-ordi-envoye` et
`ordi-depuis-lien`, avant et après le lot 67.

Le guide du débutant (lot 51), à chaque fois aussi : `guide-ecoute` (un son d'exemple écouté, avec son nom) et
`guide-vers-jeu` (un lecteur a cliqué sur le bouton de fin d'une page du guide et arrive dans le jeu, avec le nom de la
page : `apprendre`, `phrase`, `transition`, `caler` ou `table`). C'est le chiffre qui dit si le guide amène des joueurs.

La formule gratuite d'Umami garde 6 mois d'historique. Le nombre de visites et d'étapes qu'elle compte
par mois est indiqué sur https://umami.is/pricing (environ 100 000 d'après un comparatif, le 25 oct. 2026).
