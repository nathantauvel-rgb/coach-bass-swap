# Les mails de Vini : marche à suivre

Ce qu'il faut régler une fois pour que DJingood envoie ses mails (lot 54). Compte une heure, sans te presser.
Les noms des menus de Brevo peuvent changer un peu : si tu ne trouves pas un écran, demande-moi, on le fait ensemble.

**Règle à ne jamais oublier : on n'écrit qu'aux gens qui ont dit oui** (la case « Vini peut m'écrire », la question
de Vini, ou l'interrupteur de « Mon compte »). Jamais d'import d'adresses depuis Firebase, jamais de mail aux comptes
qui n'ont pas répondu. Et **un mail par semaine au plus**.

## D'abord : le lien de connexion par Brevo (lot 67 « Le mail qui arrive »)

Depuis le lot 67, le mail du lien de connexion (celui qui fait passer du téléphone à l'ordinateur) part par Brevo, avec
**notre texte**, au lieu du texte de Firebase qui tombait dans les spams. Tant que ces réglages ne sont pas faits, rien ne
casse : le site envoie le lien par Firebase, comme avant. Compte une vingtaine de minutes.

**Les deux clés de cette page ne se donnent à personne** : ni dans le site, ni dans un message, ni dans une conversation
avec moi. Tu les colles seulement dans Vercel.

1. **Brevo, le domaine.** Les lignes de Brevo sont déjà dans la zone DNS d'OVH (vérifié le 10 nov. 2026 : `brevo-code`,
   `brevo1._domainkey` et `brevo2._domainkey`, DMARC). Dans Brevo : **Expéditeurs, domaines et IP dédiées → Domaines** :
   `djingood.fr` doit être marqué « Authentifié ». Sinon, clique sur « Authentifier » et dis-le-moi.
   Si Brevo demande de compléter le profil de ton entreprise ou d'activer l'envoi de mails « transactionnels », fais-le.
2. **Brevo, la clé.** Si tu ne l'as pas déjà fait pour les mails de Vini : **SMTP & API → Clés API → Générer une nouvelle
   clé**, nom `djingood-site`. Dans Vercel (projet `coach-bass-swap` → **Settings → Environment Variables**), ajoute
   `BREVO_CLE` = cette clé, pour « Production » seulement.
3. **Firebase, une clé aux droits limités.** Elle sert seulement à fabriquer le lien de connexion et à compter les envois.
   - Ouvre https://console.cloud.google.com/iam-admin/serviceaccounts?project=djingo-1e1f4 (le même compte Google que
     Firebase).
   - **Créer un compte de service** → nom `djingood-liens` → « Créer et continuer ».
   - Rôles : cherche **« Administrateur Firebase Authentication »** (en anglais : Firebase Authentication Admin), puis
     « Ajouter un autre rôle » et cherche **« Utilisateur Cloud Datastore »** (Cloud Datastore User : c'est ce qui lui permet
     de compter les mails envoyés) → « Continuer » → « OK ». **Pas** « Propriétaire » ni « Éditeur » : ils donneraient accès
     à tout le projet. (Si tu as déjà créé le compte avec un seul rôle : **IAM** → crayon sur la ligne `djingood-liens` →
     « Ajouter un autre rôle ».)
   - Clique sur le compte `djingood-liens` → onglet **Clés** → **Ajouter une clé → Créer une clé → JSON → Créer**. Un
     fichier `.json` se télécharge. (Si Google dit que la création de clés est désactivée, arrête-toi et dis-le-moi.)
   - Ouvre ce fichier avec le Bloc-notes, tout sélectionner (Ctrl+A), copier (Ctrl+C).
   - Dans Vercel, ajoute `FIREBASE_COMPTE` = tout le texte collé tel quel, pour « Production » seulement (coche
     « Sensitive » si Vercel le propose).
   - **Supprime ensuite le fichier `.json`** de tes Téléchargements (et vide la corbeille) : la clé ne doit vivre que dans
     Vercel. Si un jour tu crois qu'elle a fuité : supprime-la dans l'onglet Clés de Google, puis refais celle-ci.
4. **Faire prendre les réglages.** Vercel ne les lit qu'au déploiement suivant : **Deployments** → le plus récent → « ⋯ »
   → **Redeploy** (ou attends la prochaine mise en ligne).
5. **Essayer.** Sur ton téléphone, fais les questions de Vini avec une adresse neuve : avec Gmail, ajoute `+essai1` avant
   le `@` (`ton.nom+essai1@gmail.com` arrive dans ta boîte, mais c'est un nouveau compte pour DJingood). Le mail doit venir
   de « DJingood », commencer par « Salut … ! » et avoir un bouton violet « Me connecter ». Sur ton ordinateur, clique le
   bouton : tu dois être connecté. Regarde aussi où mène le bouton (appui long sur téléphone) : l'adresse doit commencer par
   `https://djingood.fr`. Si elle commence par une adresse de Brevo (suivi des clics), dis-le-moi, on le coupe ensemble.
   Dans Umami, l'événement `lien-envoye` dit par où le lien est parti (`par` : `brevo` ou `firebase`). Si tu ne vois que
   `firebase`, un réglage manque (une clé, ou le second rôle) : dis-le-moi.
   Tu peux effacer les comptes d'essai dans Firebase (**Authentication → Users**).

Sécurités prévues (api/lien.js) : on n'écrit qu'à une adresse qui a déjà un compte DJingood, au plus 3 liens par adresse et
par heure (même si les demandes arrivent toutes en même temps), au plus 200 mails de lien par jour pour tout le site (la
formule gratuite de Brevo en permet 300, avec ceux de Vini ; au-delà, le lien part par Firebase), et le lien ramène toujours
sur l'accueil de djingood.fr. Les envois sont comptés dans Firestore (collection `limites`, de petites fiches sans adresse
en clair). Facultatif, pour qu'elles s'effacent toutes seules : Firestore → **TTL** → collection `limites`, champ `fin`.

## Comment ça marche

1. Le joueur dit oui sur le site. S'il a créé son compte avec une adresse e-mail (pas avec Google), le site lui fait
   d'abord envoyer par Firebase un lien pour **confirmer son adresse** : on n'écrit jamais à une adresse pas confirmée
   (sinon n'importe qui pourrait inscrire l'adresse d'un autre).
2. Le site prévient la fonction `api/mails.js` (sur Vercel). Elle vérifie que c'est bien lui et que son adresse est
   confirmée, puis ajoute son adresse, son prénom et sa prochaine étape dans la liste « Mails de Vini » de Brevo.
3. Brevo voit arriver le contact dans la liste et envoie tout seul les trois mails : le jour même, 2 jours après,
   7 jours après.
4. S'il dit non (interrupteur) ou clique sur « Ne plus recevoir » dans un mail, Brevo le marque « ne plus écrire ».
   Pour effacer complètement une adresse (quelqu'un qui le demande), supprime le contact dans Brevo à la main.

## 0. Avant tout : les mails de Firebase depuis djingood.fr

Le lien qui confirme l'adresse d'un joueur est envoyé par Firebase, comme celui de « Mot de passe oublié ». Tant que
Firebase envoie depuis `noreply@djingo-1e1f4.firebaseapp.com`, ce lien risque d'arriver dans les indésirables, et le
joueur ne recevra jamais nos mails. Finis d'abord la section « Envoyer les e-mails depuis djingood.fr » de
`COMPTE-FIREBASE.md` (même piège du `v=spf1` unique chez OVH). Dans la console Firebase (Authentication → Modèles),
règle aussi le modèle **« Vérification de l'adresse e-mail »** : nom de l'expéditeur `DJingood`, comme pour
« Réinitialisation du mot de passe ». Le site dit « DJingood vient de t'envoyer un mail ».

Bon à savoir : le « oui » d'un joueur qui doit confirmer son adresse n'arrive chez Brevo que quand il revient sur le
site, connecté, après avoir cliqué le lien.

## 1. Le compte Brevo

- Crée un compte sur https://www.brevo.com (offre gratuite : 300 mails par jour, largement assez pour commencer).
- Brevo est une entreprise française : c'est elle qui envoie les mails pour DJingood (la page de confidentialité le dit).

## 2. Envoyer depuis djingood.fr

Sans ça, les mails arrivent dans les indésirables (même problème qu'avec le « mot de passe oublié » de Firebase).

- Dans Brevo : **Expéditeurs, domaines et IP dédiées → Domaines → Ajouter un domaine** → `djingood.fr`.
- Brevo te donne des lignes à ajouter dans la zone DNS d'OVH (un code Brevo, une clé DKIM, souvent une ligne DMARC).
  Recopie **les valeurs exactes affichées par Brevo**, jamais de mémoire.
- **Piège déjà connu chez OVH** : la zone a déjà une ligne `v=spf1 include:mx.ovh.com -all`. Si Brevo demande d'ajouter
  un `include:`, glisse-le **dans cette même ligne** (avant le `-all`). Jamais une deuxième ligne `v=spf1`.
- Reviens dans Brevo et clique sur « Authentifier ». Ça peut prendre quelques heures.
- Dis-moi quand c'est fait : je vérifie la zone directement sur le serveur d'OVH.

## 3. L'expéditeur

- **Nom** : `Vini de DJingood` · **Adresse** : `vini@djingood.fr`.
- Les réponses (le mail du 7e jour demande « qu'est-ce qui t'a bloqué ? ») doivent arriver chez toi. Le plus simple :
  chez OVH, crée une **redirection** `vini@djingood.fr` → ton adresse Gmail (Emails → Redirection). Ça sert aussi si
  Brevo demande de confirmer l'adresse de l'expéditeur.

## 4. La liste et les champs

- **Contacts → Listes → Créer une liste** : `Mails de Vini`. Note son **numéro** (ID), il sert à l'étape 6.
- **Contacts → Paramètres → Attributs de contact** : vérifie que `PRENOM` existe (texte), et crée :
  - `NIVEAU` (texte) : la prochaine étape du joueur au moment où il dit oui ;
  - `ACCORD_LE` (date) : le jour où il a dit oui (c'est la preuve demandée par la CNIL) ;
  - `ACCORD_OU` (texte) : `creation`, `question` ou `compte`.

## 5. La clé d'API

- **SMTP & API → Clés API → Générer une nouvelle clé**, nom `djingood-site`.
- **Cette clé ne se donne à personne** : ni dans le site, ni dans un message, ni dans une conversation avec moi. Tu la
  colles seulement dans Vercel, juste en dessous.

## 6. Les réglages de Vercel

- Vercel → projet `coach-bass-swap` → **Settings → Environment Variables**, pour « Production » :
  - `BREVO_CLE` = la clé d'API de l'étape 5 ;
  - `BREVO_LISTE` = le numéro de la liste de l'étape 4 (seulement le chiffre).
- Les réglages servent au prochain déploiement : ils prendront effet avec la mise en ligne du lot.

## 7. Les trois mails

Dans le dossier `mails/` du projet, un fichier par mail. Pour chacun : **Campagnes → Modèles → Nouveau modèle →
« Coller votre code »**, colle tout le fichier, puis mets l'objet et le texte d'aperçu écrits en haut du fichier.

| Fichier | Quand | Objet |
|---|---|---|
| `1-bienvenue.html` | le jour même | Bienvenue sur DJingood, c'est Vini ! |
| `2-astuce-32.html` | 2 jours après | L'astuce qui change tout : compter jusqu'à 32 |
| `3-une-question.html` | 7 jours après | Une petite question |

Envoie-toi un test de chacun (bouton « Envoyer un test ») pour voir s'ils s'affichent bien sur ton téléphone.

## 8. L'automatisation

- **Automatisations → Créer un scénario → « Contact ajouté à une liste »**, liste `Mails de Vini`.
- Étapes : envoyer `1-bienvenue` → attendre 2 jours → envoyer `2-astuce-32` → attendre 5 jours → envoyer `3-une-question`.
- Dans les réglages du scénario, **laisse un contact n'y entrer qu'une seule fois** (option de « ré-entrée » décochée) :
  sinon quelqu'un qui coupe puis rallume l'interrupteur recevrait de nouveau les trois mails.
- Active le scénario.

## 9. Ensuite, c'est moi

Quand les étapes 1 à 8 sont faites, dis-le-moi :
1. j'allume les mails sur le site (`ML_PRET` dans `js/mails.js`) ;
2. on essaie avec **ton** compte : tu dis oui, tu reçois le mail de bienvenue, tu coupes l'interrupteur, et ton adresse
   reste dans Brevo marquée « ne plus écrire » (elle sort de la liste) ;
3. et seulement avec ton accord, on met en ligne.

## Où lire les résultats

- **Umami → Events** : `compte-propose` (la carte de fin a proposé le compte), `compte-propose-clic`, `mails-question`,
  `mails-oui` et `mails-non` (avec `ou` : `creation`, `question` ou `compte`).
- **Brevo → Statistiques** de chaque mail : ouvertures, clics, désinscriptions. Si les désinscriptions montent, on
  écrit moins souvent.
