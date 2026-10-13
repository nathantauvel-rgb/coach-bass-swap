# Coach DJ — mémoire du projet pour Claude

À lire en premier dans toute nouvelle session. L'utilisateur (Nathan, francophone, débutant en code)
parle en français : répondre en français, sans jargon technique inutile.

**Plan et avancement côté utilisateur :** page Notion « Coach DJ — Plan et suivi »
https://app.notion.com/p/3f7c35cc3054816ab64cf22e8dfd49c1
→ Après chaque étape terminée : cocher la case dans Notion, ajouter une ligne au « Journal »,
et mettre à jour la section « Où on en est » ci-dessous.

## Le projet
Site qui apprend aux débutants à mixer, de façon ludique, avec une Pioneer DDJ-FLX4 branchée en USB.
Promesse : « Tu as une table et tu n'y connais rien : en deux semaines, tu fais tes premières vraies
transitions propres avec ta musique. »

Parcours visé en 3 onglets :
1. **Apprendre** — les leçons (chapitres 1 à 3, existe déjà dans `index.html`)
2. **S'entraîner** — défi du jour, variations, à l'oreille, mini-sets (à faire)
3. **Passer au vrai** — remplace le « mode libre » (`coach.html`) : import rekordbox, paires
   recommandées, missions à faire dans rekordbox (à faire)

Hors du plan : refaire un logiciel de mix complet. rekordbox sert à mixer pour de vrai.

## Décisions produit du 13 oct. 2026 (remplacent ce qui les contredit plus bas)
- Objectif : faire de la V1 un MVP vendable, un « Duolingo du DJing », en améliorant l'existant sans réécriture.
- Deux publics, deux parcours : débutants complets ; débutants qui savent lancer deux morceaux et veulent
  de meilleures transitions.
- Direction visuelle : **sombre, premium, inspirée des logiciels DJ** (thème « Cabine », lot 4).
- La DDJ-FLX4 reste le contrôleur de référence. Comptes et paiement : pas prioritaires.
- Lots prévus : 0. sécuriser (tests) · 1. valider `coach-midi-map` · 2. découper `index.html` en modules ·
  3. deux parcours · 4. interface sombre · 5. schéma interactif de la FLX4.
- L'utilisateur valide chaque lot avant qu'il commence, et **rien ne part en ligne sans son accord explicite**.

## Pour reprendre (état au 13 oct. 2026, fin de session)
- **Tout est en ligne** : étapes 1 à 3 du plan Notion, puis lots 0 à 5. `main` = `origin/main`, à une
  note de documentation près (ce fichier), à envoyer avec le prochain lot.
- **En attente côté utilisateur, rien n'a été fait** : la checklist `tests/CHECKLIST-FLX4.md` (16 points)
  sur la vraie FLX4. Aucun lot n'a été vérifié sur la table. À relire en particulier : le schéma de
  « Ma table » et les consignes des missions de « Passer au vrai », écrits de mémoire ; un vrai export
  rekordbox (l'import n'a vu qu'un faux fichier) ; la lisibilité du thème sombre pendant une partie.
- **Le point 16 de la checklist** donne les numéros MIDI des commandes non branchées (HI, crossfader,
  jog, pads) : il les faut avant de proposer de nouveaux exercices. Ne pas inventer ces numéros.
- **Non publié, sur ce PC seulement** : branche `essai-vrais-morceaux` (bouton « Vrais morceaux », écrit
  contre l'ancien `index.html`, à reporter dans `js/audio.js` et `js/demarrage.js`) et dossier
  `audio-essai/` (Splashkabona 117 BPM, Deep House Sunset 122,5 BPM, plus deux morceaux trop lents ;
  licences non vérifiées, il faut le lien et l'auteur de chacun). Piste Suno abandonnée.
- **Sujets ouverts, aucun commencé** : vrais morceaux libres de droits (CC0 ou CC BY), nouveaux exercices
  (HI, crossfader, hot cues, loops, beatmatching), quiz, badges, puis comptes et paiement.
- **Façon de travailler validée par l'utilisateur** : présenter un lot, attendre son accord, travailler
  sur une branche `lot-N-nom`, lancer `npm test`, montrer des captures si l'écran change, puis demander
  l'accord avant `git push`. Après un push : vérifier la production, mettre à jour Notion.

## Où on en est
- **Lot 0 (13 oct. 2026)** : Git installé, dossier de travail `Documents\coach-dj` (l'ancien
  `Documents\coach-bass-swap` et sa sauvegarde datée restent intacts). Branche `lot-0-tests` : Playwright
  pour Node, fausse table MIDI, 63 tests. Branche `essai-vrais-morceaux` : essai local du bouton
  « Vrais morceaux » (fichiers de `audio-essai/`, ignorés par Git, droits non vérifiés). Rien de publié.
- **Lots 0 et 1 publiés le 13 oct. 2026** (accord de l'utilisateur), `main` = commit `38a3e27`.
- **Lot 1 (13 oct. 2026)** : `cleanMap` valide `coach-midi-map` à la
  lecture (entrée invalide, manquante ou en double → réglage d'origine), l'apprentissage refuse un contrôle
  déjà attribué, les valeurs reçues sont bornées, les positions sont oubliées quand la table est débranchée.
  65 tests verts. Pas encore vérifié sur la vraie FLX4.
- **Lot 2 (13 oct. 2026)** : branche `lot-2-modules`, non publiée. `index.html` découpé en `styles.css`
  et 12 fichiers `js/`, code identique ligne pour ligne (vérifié par comparaison automatique). 66 tests verts.
  La branche `essai-vrais-morceaux` modifie l'ancien `index.html` : il faudra reporter son changement
  dans `js/audio.js` et `js/demarrage.js` si on la reprend.
- **Lot 2 publié le 13 oct. 2026.**
- **Lot 3 (13 oct. 2026)** : branche `lot-3-parcours`, non publiée. Deux parcours sur l'accueil
  (`js/parcours.js`) : « Je débute » (guide → bases → entraînement → ch. 2 → ch. 3 → Passer au vrai) et
  « Je sais déjà lancer deux morceaux » (test de placement → bases → ch. 2 → ch. 3 → entraînement →
  Passer au vrai). Mêmes niveaux et mêmes règles de déblocage pour les deux (décision de l'utilisateur).
  L'accueil affiche la prochaine étape et la liste des étapes. Un test de placement raté renvoie au
  premier geste raté. 79 tests verts. Pas vérifié sur la vraie FLX4.
- **Lot 3 publié le 13 oct. 2026.**
- **Lot 4 (13 oct. 2026)** : branche `lot-4-sombre`, non publiée. Étape 1 : couleurs en dur remplacées
  par des couleurs nommées, 10 captures identiques au pixel près. Étape 2 : thème sombre « Cabine »,
  police Inter, mascotte retirée, thème clair supprimé. 79 tests verts, contraste des textes contrôlé.
- **Lot 4 publié le 13 oct. 2026.**
- **Lot 5 (publié le 13 oct. 2026, à la demande de l'utilisateur, avant la checklist FLX4)** : Page « Ma table » (`#table`, ouverte par
  la pastille de la table en haut à droite) : schéma simplifié de la FLX4, explication de chaque commande,
  réaction en direct des 10 commandes qui ont un réglage MIDI, réapprentissage, retour aux réglages
  d'origine. 95 tests verts. **Le dessin et les noms des commandes sont faits de mémoire : l'utilisateur
  doit les relire avec sa table sous les yeux.** HI, TRIM, crossfader, CUE, pads, jog, tempo, BEAT SYNC et
  CFX B sont dessinés et expliqués mais sans réglage MIDI (numéros non vérifiés, à ne pas inventer).
- Plan en 5 étapes : 1. Restructurer (3 onglets, supprimer le mode libre, page d'accueil) ·
  2. Remplir S'entraîner · 3. Remplir Passer au vrai · 4. Tester avec 3 à 5 débutants · 5. Lancer.
- **1. Restructurer : fait le 12 oct. 2026.** Accueil + 3 onglets dans `index.html`, lien « Mode libre »
  retiré, `coach.html` renvoie vers `index.html#vrai`.
- **2. Remplir S'entraîner : fait le 12 oct. 2026.** Défi du jour (série de jours), variations,
  à l'oreille, mini-set de 3 transitions.
- **3. Remplir Passer au vrai : fait le 12 oct. 2026.** Import du XML rekordbox (ou collection d'exemple),
  paires recommandées avec recherche, 6 missions à cocher par paire. Pas encore essayé avec un vrai
  export rekordbox de l'utilisateur : seulement avec `tests/rekordbox-exemple.xml`.
- **Prochaine étape : 4. Tester avec 3 à 5 débutants.** Sujet ouvert en parallèle : l'utilisateur trouve
  les morceaux générés trop pauvres ; piste conseillée = de vrais morceaux en fichiers audio.

## Fichiers
- `index.html` — la structure de la page seulement (~215 lignes). Elle charge `styles.css` puis les
  fichiers de `js/`. Aucune dépendance, aucune étape de construction.
- `styles.css` — toute l'apparence (thème sombre « Cabine »).
- `js/` — le code, découpé le 13 oct. 2026 (lot 2) sans changer une ligne. **Tous les fichiers partagent
  la même portée** (scripts classiques, pas des modules) et **l'ordre de chargement compte** :
  `erreurs` (bandeau d'erreur) → `morceaux` (outils communs `$`, `SR`, moteur de production, Workers) →
  `audio` → `controles` → `niveaux` (niveaux, progression, partie, notation) → `piste` → `midi` →
  `placement` → `entrainement` → `rekordbox` → `guide` → `parcours` (accueil, les deux parcours) →
  `table` (page « Ma table ») → `demarrage` (démarrage et onglets).
  Conséquences : un nom déclaré dans un fichier existe dans tous les autres (chercher avant de nommer) ;
  le code exécuté au chargement d'un fichier ne peut appeler que ce qui est défini dans ce fichier ou
  dans un fichier chargé avant ; `function stop` remplace `window.stop` (sans effet connu).
  Étape suivante possible, non commencée : de vrais modules avec import/export.
- `coach.html` — ancien mode libre (bibliothèque rekordbox, coach de swap), retiré du site : la page renvoie
  vers `index.html#vrai`. Son code sert de base à « Passer au vrai » ; `coach.html?ancien=1` l'affiche encore.
- `tests/` — scripts Playwright (Python) : `tdz.py`, `robust.py`, `clar.py`, `play.py`, `play2.py`, `user.py`.
- `tests/rekordbox-exemple.xml` — fausse collection rekordbox pour essayer l'import à la main.
- `README.md` — description publique.

## Architecture du code (repères ; « fin du script » = `js/demarrage.js`)
- **Onglets** : quatre blocs `.view` (`vHome`, `vLearn`, `vTrain`, `vReal`), un seul visible. `setView(v)`
  (fin du script) suit l'adresse : `#accueil` (défaut), `#apprendre`, `#entrainer`, `#vrai`. Quitter
  Apprendre arrête la partie en cours ; le guide de premier lancement s'ouvre à la première entrée dans
  Apprendre, plus au chargement. Les tests ouvrent `index.html#apprendre`.
- **Parcours** (`js/parcours.js`) : `PARCOURS` (ordre des étapes de chaque parcours), `STAGES` (pour
  chaque étape : `done()` calculé depuis la progression existante, `cta()`, `go()`), `nextStage()`,
  `renderHome()`. Seuls le choix (`coach-parcours` : `debut` ou `deja`) et le résultat du test
  (`coach-test` : `ok` ou `ko:N`, N = premier niveau raté) sont enregistrés. Sans choix enregistré, un
  utilisateur qui a déjà une progression est rangé d'office dans un parcours, sans question. Dans le
  parcours `deja`, le guide ne s'ouvre pas tout seul (`setView`).
- **Ma table** (`js/table.js`) : `TKINDS` (nom et explication par type de commande), `TKEY` (commande du
  schéma → réglage MIDI, quand il existe), `usedIn(key)` (niveaux qui s'en servent, lus dans
  `BASE_LESSONS` / `CH3_LESSONS`), `tableSvg()` (le dessin), `renderTable()`. Quand cette page est
  affichée, `onMidi` passe la main à `tableMidi` : la table n'y pilote ni les niveaux ni l'écho, mais
  les positions (`phys`) restent retenues. L'apprentissage (`learnKey`) accepte maintenant aussi PLAY A
  et PLAY B (boutons), et il est annulé quand on quitte la page.
- **S'entraîner** : une séance `prac` (`startPrac(kind)` avec `defi`, `var`, `ear`, `set`) rejoue les niveaux
  du chapitre 1 déjà joués (`pracPool`, tous avec `?tout=1`) sur la scène des leçons : `vLearn` reçoit la
  classe `.prac` (chapitres et carte masqués) et le bandeau `#prBanner`. Style et variante imposés via
  `chooseSongs`. `finish` n'enregistre pas d'étoiles de leçon pendant une séance et appelle `pracStep` ;
  le bouton « suivant » passe par `pracNext` ; `quitPrac` remet le chapitre et le niveau d'avant.
  Le défi du jour est tiré de la date (`dailyPick`). « À l'oreille » ici = sans compte à rebours mais
  précision normale (le chapitre 2 garde la précision ×2).
- **Passer au vrai** (fonctions `rb…`) : `rbParse` lit le XML rekordbox et ne garde que
  [titre, artiste, genre, bpm, tonalité Camelot] (`rbClean` valide chaque morceau, 6000 au plus).
  `rbBuild(filtre)` cherche les paires (écart de tempo ≤ 6 %, tonalités qui frottent exclues, score
  tempo/tonalité/genre) ; le résultat sans filtre est gardé dans `rbAll` car il coûte ~2 s sur 6000 morceaux.
  `rbMissionList(a, b)` écrit les 6 missions avec les titres et tempos de la paire ; `renderReal` affiche tout.
  Les titres viennent d'un fichier : toujours les écrire avec `textContent`, jamais `innerHTML`.
- **Gestionnaire d'erreurs** en tête du script → bandeau `#errBanner`. Les rejets marqués `.silent` sont ignorés.
- **État** : `let stars` est déclaré AVANT `earStars`, `ch2Stars`, `chapter`, etc. Puis validation de
  `styleChoice` (house/techno/afro/random) et `chapter` (1/2/3). Déblocage : `ch2Unlocked` (≥14 étoiles
  au ch.1), `ch3Unlocked` (≥10 au ch.2).
- **Audio** (Web Audio) : LOW = lowshelf, MID = peaking, CFX = passe-haut/passe-bas (deck A), écho après
  le fader, limiteur final, sortie 4 canaux pour le casque de la FLX4.
- **MIDI** (Web MIDI) : `DEFAULT_MAP` (réglages d'origine de la FLX4, ne pas les changer), `cleanMap`
  (validation de `coach-midi-map`), `MIDI_CC` / `MIDI_NOTE` (potards et faders / boutons : pas de doublon
  dans un même groupe), `onMidi`, apprentissage (`learnKey`), `phys` (positions réelles, vidées au
  débranchement), vérification de la mise en place avant chaque niveau (`updateSetup`).
  PLAY A et MID B ont un réglage mais aucun code ne s'en sert.
- **Morceaux** : `makeSong(style, role, seed, secs, o)` (synthèse procédurale, `STYLE_DEFS`, `VARIANTS = 4`),
  calculés dans des Web Workers (`workerPool`, `renderSong`). Cache `getSong(sty, vr, part)` + `songSafe`
  (relance une fois). `chooseSongs()` précharge dès le choix du niveau. `startRun(demo)` lance la partie.
- **Niveaux** : `BASE_LESSONS` (kinds moment, fader, swap, full, filter, echo, cut ; `targets`, `caps`)
  et `CH3_LESSONS`.
- **Lisibilité** : `ACT` (texte d'action par cible), `GROUP_OF`, `setFocus(ids)` (classe `.focus`),
  `showAction` (« Dans N temps : … » puis « Maintenant : … ! »), `<details class="howto">`.
- **Thème « Cabine »** (lot 4, choisi par l'utilisateur le 13 oct. 2026 ; il remplace « Tout doux », qui
  est supprimé) : sombre, noir neutre, platine A en orange (`--a`), platine B en bleu (`--b`), violet
  (`--xp`) pour l'XP et les gestes à faire, vert (`--go`) pour Jouer. Police Inter partout. Plus de
  mascotte : seule la bulle de conseil `.bubble` reste. **Toutes les couleurs passent par la liste
  `:root` en tête de `styles.css`** (et par `COL` dans `js/piste.js` pour le canvas) : ne jamais écrire
  une couleur en dur ailleurs. Texte posé sur une couleur vive : `--ink` ; sur `--fg` : `--on-fg`.
  `styles.css` garde des couches héritées qui se surchargent (mise en page compacte, « habillage »,
  formes arrondies) : les fusionner serait un nettoyage à part.
- **Captures et contraste** : `node tests/captures.js captures/nom` enregistre chaque écran (dossier
  `captures/` ignoré par Git) et signale les textes au contraste trop faible. Avec `--vite`, seulement
  les écrans fixes, comparables image par image entre deux versions. Seul signalement restant, voulu :
  les étoiles non gagnées, volontairement estompées.

### Clés localStorage
`coach-lecons`, `coach-lecons-oreille`, `coach-ch2`, `coach-ch2-ouvert`, `coach-ch3`, `coach-chapitre`,
`coach-style`, `coach-guide-vu`, `coach-parcours`, `coach-test`, `coach-entrainement` (défi, série, compteurs, record du mini-set),
`coach-collection` (morceaux importés), `coach-missions` (paire choisie, missions cochées, paires validées), `coach-midi-map` (partagée avec `coach.html`), `coach-bibliotheque` (`coach.html`).
Toute valeur lue doit être validée : des données abîmées ne doivent jamais bloquer la page.

## Tester
```bash
npm install                          # une seule fois (Playwright ; le site lui-même n'a aucune dépendance)
npx playwright install chromium      # une seule fois
npm test                             # toute la suite, environ 1 min 30
npx playwright test tests/midi.spec.js   # seulement la liaison avec la table
```
- `tests/outils.js` : `ouvrir(page, { stockage, midi, onglet })` et la fausse table. Elle remplace
  `navigator.requestMIDIAccess` avant le chargement ; le site y branche lui-même `onMidi`, donc les
  messages simulés suivent le même chemin que ceux de la vraie FLX4.
- `tests/midi.spec.js` : détection, faders, LOW, MID, PLAY, apprentissage, rebranchement, messages
  inattendus, `coach-midi-map` abîmée. `tests/parcours.spec.js` : choix du parcours, prochaine étape à
  chaque stade, changement de parcours, test de placement raté. `tests/site.spec.js` : chargement, Workers, parties, progression,
  onglets, S'entraîner, Passer au vrai.
- Pour consigner un défaut connu sans le corriger tout de suite : l'écrire en `test.fail` (réussi tant que
  le défaut existe), puis retirer `.fail` au moment de la correction. Il n'y en a aucun aujourd'hui.
- Pour essayer une branche avec la vraie table avant de publier : `node tests/serveur.js`, puis ouvrir
  http://localhost:8766 dans Chrome (Web MIDI fonctionne sur localhost).
- Les anciens scripts Python (`tests/*.py`) sont gardés mais remplacés par `site.spec.js`.
- Git pour Windows convertit les fins de ligne par défaut : ce dépôt a `core.autocrlf=false` en local.
- Après chaque modification de `index.html` : `npm test`, puis `tests/CHECKLIST-FLX4.md` sur la vraie
  table avant toute mise en ligne qui touche au MIDI, à l'audio ou aux niveaux.

## Pièges connus
- **Liens Vercel figés** : chaque déploiement a un lien long qui ne bouge plus. Toujours donner
  https://coach-bass-swap.vercel.app (production, suit la branche `main`).
- **Ordre des déclarations** : une variable `let` lue avant sa ligne (TDZ) fige toute la page
  (bug « Cannot access 'stars' before initialization »). Déclarer l'état tout en haut.
- **Noms en double** dans le gros script unique (ex. `rr` → `rrIdx`, `l` → `lw`) : chercher avant de nommer.
- **Workers** : en cas d'échec, pas de calcul synchrone au chargement (la page gèlerait) ; repli via `songSafe`.
- **Onglet en arrière-plan** : la partie avance avec `requestAnimationFrame`, donc elle ne se termine pas
  si l'onglet n'est pas affiché. Pour tester une partie entière, garder l'onglet au premier plan.
- `?tout=1` dans l'URL débloque tous les niveaux (pratique pour tester).

## Règles de travail
- Dépôt : https://github.com/nathantauvel-rgb/coach-bass-swap, branche `main`, déployé automatiquement sur Vercel.
  Travailler sur une branche par lot ; demander l'accord de l'utilisateur avant chaque `git push`.
- Messages de commit en français, qui décrivent le changement pour l'utilisateur.
- L'utilisateur juge sur ce qu'il voit : toujours lui dire de recharger la page de production après un push.
