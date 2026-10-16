# DJingo (anciennement Coach DJ) — mémoire du projet pour Claude

À lire en premier dans toute nouvelle session. L'utilisateur (Nathan, francophone, débutant en code)
parle en français : répondre en français, sans jargon technique inutile.

**Plan et avancement côté utilisateur :** page Notion « DJingo — Plan et suivi » (ancien titre : Coach DJ)
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
- **Tout est en ligne** : étapes 1 à 3 du plan Notion, puis lots 0 à 21, 23 à 26 et 28 à 31 (quiz et badges, outils pour les testeurs, clarté pour les débutants, objectif du jour,
  page de présentation, rangement des écrans, Passer au vrai étape par étape, niveaux plus courts, chapitre 4
  « Les combos », ralenti des combos, thème « Cabine pure », « Passer au vrai » visuel, clarté pour un vrai
  débutant et fiches « Découvre ce bouton », autres tables et schéma vivant, Mode Expert, nouveau nom DJingo, « Mes progrès » refait, vraie musique, nouvel ordre du chapitre 1, Premiers pas avec Vini, « Ça bouge », quêtes du jour, Vini sur l'accueil et sons ;
  le lot 22 a été abandonné, le lot 27 est une direction artistique sans code). `main` = `origin/main`, à une
  note de documentation près (ce fichier), à envoyer avec le prochain lot.
- **En attente côté utilisateur, rien n'a été fait** : la checklist `tests/CHECKLIST-FLX4.md` (20 points)
  sur la vraie FLX4. Aucun lot n'a été vérifié sur la table. À relire en particulier : le schéma de
  « Ma table » et les consignes des missions de « Passer au vrai », écrits de mémoire ; un vrai export
  rekordbox (l'import n'a vu qu'un faux fichier) ; la lisibilité du thème sombre pendant une partie.
- **Le point 16 de la checklist** donne les numéros MIDI des commandes non branchées (HI, crossfader,
  jog, pads) : il les faut avant de proposer de nouveaux exercices. Ne pas inventer ces numéros.
- **Non publié, sur ce PC seulement** : branche `essai-vrais-morceaux` (bouton « Vrais morceaux », écrit
  contre l'ancien `index.html`, à reporter dans `js/audio.js` et `js/demarrage.js`) et dossier
  `audio-essai/` (Splashkabona 117 BPM, Deep House Sunset 122,5 BPM, plus deux morceaux trop lents ;
  licences non vérifiées, il faut le lien et l'auteur de chacun). Piste Suno abandonnée.
- **Vrais morceaux, recherche du 13 oct. 2026** : 10 MP3 de Free Music Archive dans `audio-essai/fma/` (hors Git),
  licence lue sur la page de chaque morceau, tempo mesuré par analyse (stable sur tout le morceau).
  Play House (Paris), **CC0** : Dj 125 BPM (sans voix), On My Mind 124, Like An Animal 124, The Power Of The
  Beat 124, I'm Lost 120, Mezoued 120, Deep House Soul 122 (les six derniers avec voix). Pages :
  `freemusicarchive.org/music/play-house/...`. Tommaso Croce, **CC BY 4.0** (crédit obligatoire) : Don't
  Snooze 123 ; CLADE Industries 144 et Rombo Di Tuono 136 sont trop rapides. Pages :
  `freemusicarchive.org/music/Dilating_Times/single/...`. Non fait : écoute par l'utilisateur, tonalités,
  repérage des intros et outros. Aucun morceau ne finit par une outro sans basses. Il manque de la techno
  vers 125-130 BPM. Deep House Sunset = Alex Morgan, CC BY 4.0, généré par IA. Splashkabona : aucune
  licence libre trouvée, ne pas publier.
- **Deuxième recherche (13 oct. 2026)**, licence lue sur chaque page, tempo mesuré en lisant le son sans
  l'enregistrer : techno **CC0** de Keith Jars (Atlantide 125, Aquatic Kiss 127, Aquatic Vision 129,
  Walkyra 120) ; house sans voix : Koi-discovery « Ultimate_Rainbow » 120 (CC0), HoliznaCC0 « Retro
  Synths » et « Back In The 80s » 120 (CC0), 1000 Handz « Mother Soil » 125 (CC BY), Jason Shaw « The Big
  House » 125 (CC BY), Tommaso Croce « Crawling Seeds » 124,5 (CC BY) ; Decktonic, album « Forgotten
  Machines », 7 morceaux à 128 (CC BY). Pas téléchargés, pas écoutés. À la demande de l'utilisateur,
  `croce-clade-industries.mp3` et `croce-dont-snooze.mp3` sont sortis de `audio-essai/fma/` (rangés dans
  `audio-essai/retires/`).
- **Sujets ouverts, aucun commencé** : vrais morceaux libres de droits (CC0 ou CC BY), nouveaux exercices
  (HI, crossfader, hot cues, loops, beatmatching), puis comptes et paiement. Les 25 questions du quiz
  (`js/quiz.js`) n'ont pas encore été relues par l'utilisateur.
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
- **Lot 6 (13 oct. 2026)** : branche `lot-6-quiz-badges`, non publiée. Quiz (`js/quiz.js`) : 25 questions,
  « Question bonus » sur la carte de résultat d'un niveau réussi, carte « Quiz éclair » (5 questions) dans
  S'entraîner, 5 XP par question trouvée (une seule fois). 13 badges calculés depuis la progression,
  section « Mes badges » sur l'accueil, annonce sur la carte de résultat. Ne touche ni au MIDI ni à
  l'audio. 111 tests verts. **Les questions sont à relire par l'utilisateur.**
- **Lot 6 publié le 13 oct. 2026.**
- **Lot 7 (14 oct. 2026)** : branche `lot-7-testeurs`, non publiée. Préparation de l'étape 4 (tests avec des
  débutants), dans `js/avis.js` : bouton « Mon avis » en haut (3 questions, gardées avec l'écran où on
  était), « C'était clair ? » sur la carte de résultat, journal local `coach-journal` (temps passé,
  jours, parties, réponses, avis, 5 dernières erreurs), « Copier mon rapport » (texte à coller dans un
  message), « Tout recommencer à zéro » (efface tout `coach-*` sauf `coach-midi-map`). Page
  `testeurs.html` : la fiche à envoyer aux testeurs. Bouton e-mail prêt mais masqué tant que `AVIS_MAIL`
  est vide (adresse à demander à l'utilisateur, ne pas la deviner). Sur téléphone, « Mon avis » est au
  bout de la barre du haut, qui défile. 124 tests verts.
- **Lot 7 publié le 14 oct. 2026**, sans bouton e-mail (décision de l'utilisateur : `AVIS_MAIL` reste vide).
- **Lot 8 (14 oct. 2026)** : branche `lot-8-clarte`, non publiée. Issu d'un audit du parcours débutant sans
  table. Étape « Les parties d'un morceau » dans le guide (`ONB`, `parts`) ; `LEX` + `lexOf` dans
  `js/niveaux.js` : mots du DJ expliqués dans « Comment faire ? » (`#llex`) ; échec de lancement donné en
  écart (« 8 temps trop tôt »), même chiffre sur le schéma ; `stageIntoView()` amène la scène en haut
  de l'écran au choix d'un niveau (la barre collée en bas recouvrait la piste) ; « Test de placement »
  masqué des chapitres dans le parcours `debut` ; accueil : badges gagnés + 3 suivants, bouton
  « Voir tous les badges » ; « L'écho out » avec accent. Non fait, à voir avec les testeurs : 23 s
  d'attente avant le premier geste du niveau 2. 132 tests verts.
- **Lot 8 publié le 14 oct. 2026.**
- **Lot 9 (14 oct. 2026)** : branche `lot-9-objectif`, non publiée. `js/objectif.js` (chargé entre `guide` et
  `quiz`) : objectif du jour de 5, 10 ou 15 min (10 par défaut), rempli par le temps des parties (démos
  comprises, `run.gT` → `goalAdd` dans `stopRun`) et du quiz (300 s au plus par ouverture). Clé
  `coach-objectif` : `min`, `jours` (secondes par jour, 60 derniers), `faits` (jours atteints), `best`
  (meilleure série). Encart avec anneau sur l'accueil (`#homeGoal`, remplace la bulle quand un parcours
  est choisi) ; ligne `#rGoal` sur la carte de résultat (`goalNote`). Badges « Régulier » et « Accro »
  : série d'objectifs (ou ancienne série de défis). La série du défi du jour s'affiche « d'affilée ».
  142 tests verts.
- **Lot 10 (14 oct. 2026)** : branche `lot-10-presentation` (partie de `lot-9-objectif`), non publiée.
  `presentation.html` : page pour les inconnus (promesse, « Comment ça marche » en 3 étapes avec images,
  deux parcours, matériel, questions fréquentes, bouton « Essayer gratuitement » vers `index.html`).
  Images dans `img/`, fabriquées depuis le vrai site par `node tests/images-presentation.js` (à relancer
  quand ces écrans changent). Styles préfixés `.pres` dans `styles.css`. La page d'accueil du site reste
  `index.html` : faire de la présentation la page d'arrivée est une décision à prendre avec l'utilisateur.
  « Gratuit pendant la phase de test » est écrit sur la page. 145 tests verts.
- **Lots 9 et 10 publiés le 14 oct. 2026**, avec les agents `.claude/agents/` (accord de l'utilisateur, avant la
  checklist FLX4). Restent à décider : garder « Gratuit pendant la phase de test », et faire ou non de
  `presentation.html` la page d'arrivée.
- **Lot 11 (14 oct. 2026)** : branche `lot-11-rangement`, non publiée. Demande de l'utilisateur : « beaucoup
  trop d'informations sur une page ». Principe : un écran = une chose à faire. Accueil : prochaine étape +
  anneau de l'objectif ; le parcours est replié (`#pathDetails`, résumé `#pathSum`). Nouvelle page
  **« Mes progrès »** (`#progres`, `vProgres`, `renderProgres` dans `js/parcours.js`) ouverte par la
  pastille du niveau (`a.lvlchip`, qui contient aussi les étoiles) : tuiles, réglage de l'objectif
  (`#progGoalSet`), tous les badges (`#homeBadges`, bouton « voir tous » supprimé). Niveau : chapitres
  repliés derrière `#chapBtn` (`chapMenu`), chapitres « Bientôt » retirés, style replié derrière
  `#styleBtn` (`#styleOpts`), paragraphe `.after` supprimé (clavier dans « Comment faire ? »). Carte de
  résultat : étoiles, titre, conseils, boutons, puis une ligne `.rmeta` (XP, badge, objectif), le schéma
  dans `<details id="cmpBox">` (redessiné à l'ouverture, `cmpLast`), « C'était clair ? » en bas.
  149 tests verts.
- **Lot 11 publié le 14 oct. 2026** (accord de l'utilisateur, avant la checklist FLX4).
- **Lot 12 (14 oct. 2026)** : branche `lot-12-vrai`, non publiée. « Passer au vrai », une étape à la fois
  (`js/rekordbox.js`) : 3 paires par page (`RB_PER`), la liste se replie sur la paire choisie (`#rbPairSum`,
  « Changer de paire », `rbChoosing`), une seule mission affichée avec « C'est fait » (`.rbok`, `rbCheck`)
  et 6 pastilles (`#rbDots`), « Voir toutes les missions » (`rbShowAll`), « Choisir une autre paire »
  (`#rbAgain`) quand la paire est validée. Calcul des paires et textes des missions inchangés. Image
  `img/accueil.jpg`, `img/apprendre.jpg` et `img/vrai.jpg` refaites. 153 tests verts.
- **Lot 12 publié le 14 oct. 2026.**
- **Lot 13 (14 oct. 2026)** : branche `lot-13-rythme`, non publiée. Demande de l'utilisateur : niveaux trop longs
  quand il y a peu à faire. Chaque niveau du chapitre 1 (donc aussi du chapitre 2) a son début et sa fin
  (`[début, fin]` juste après `BASE_LESSONS`) : la partie s'arrête peu après le dernier geste noté
  (« Le bon moment » : 48 s → 12 s). Niveau 2 : premier repère « MONTE B » au temps 32 (avant, « Dans 47
  temps »). Légendes de démo ramenées avant la fin. Notation inchangée. 156 tests verts.
- **Lot 14 (14 oct. 2026)** : branche `lot-14-combos` (partie de `lot-13-rythme`), non publiée. Chapitre 4
  « Les combos » dans `js/combos.js` (chargé **avant** `niveaux.js`) : `CH4_LESSONS` (Filtre et swap, La
  transition éclair, Écho et drop sans filet, Le grand mix), décrits par un objet `c` (cutLowB, bFull,
  swap, filt, aOut, cut, echo) qui sert à la démo (`ideal4`), aux contrôles automatiques, aux réactions
  (`judge4`) et à la note (`eval4`, `evalSwap4`). Précision au demi-temps (`TOL` .5) et 3 étoiles
  seulement si tous les gestes sont justes. S'ouvre avec le chapitre 2 (`ch4Unlocked`). Clé `coach-ch4`.
  `lessonsOf(n)` donne les niveaux d'un chapitre. Pas d'étape dans les parcours, pas de question de quiz
  propre (question générale). `noCount` : niveau sans compte à rebours. Un test « robot » joue chaque
  combo parfaitement et vérifie les 3 étoiles. Chapitre 5 « La soirée » reste caché (`soon`). `cleanBank` ne garde
  que des notes de 1 à 3 dans toutes les clés d'étoiles (une note abîmée faisait planter la carte). 168 tests verts.
- **Lots 13 et 14 publiés le 14 oct. 2026** (accord de l'utilisateur, avant la checklist FLX4 : le chapitre 4 n'a
  été joué que par le test « robot », pas encore à la main sur la vraie table).
- **Lot 15 (14 oct. 2026)** : branche `lot-15-ralenti`, non publiée. Ralenti, **seulement au chapitre 4** et
  **seulement après deux échecs de suite** sur un même combo (consigne de l'utilisateur : garder les niveaux
  dynamiques). `speed` (1, 0,9 ou 0,8, remis à 1 à chaque changement de niveau), `slowFails`, `slowOffer(st)`
  appelé par `finish`, bouton `#slowBtn` sur la carte de résultat (« Réessayer au ralenti (90 %) », puis
  80 %, puis « Rejouer à 100 % » après une réussite). Le morceau est refabriqué au tempo réduit
  (`getSong`/`songSafe` prennent une vitesse) ; au ralenti, 2 étoiles au plus. Changer de niveau remet
  `slowFails` à zéro. 174 tests verts.
- **Lot 15 publié le 14 oct. 2026** (accord de l'utilisateur, avant la checklist FLX4).
- **Lot 16 (14 oct. 2026)** : branche `lot-16-cabine-pure`, non publiée. Demande de l'utilisateur : « trop de
  couleurs ». Thème « Cabine pure » choisi par l'utilisateur sur captures comparées : le violet, le vert de
  « Jouer », le surlignage brun et les taches décoratives deviennent neutres (blanc et gris) ; nouvelle couleur
  `--accent` (blanc) pour tout ce qui n'est pas une platine. **L'orange (`--a`) et le bleu (`--b`) sont
  réservés à ce qui touche aux platines A et B** (piste, potards, faders, LANCE B, schéma de la table, logo).
  Petits titres `.lnum` en gris, badges gagnés d'une seule couleur. Vert et rouge : messages réussi / raté ;
  jaune : étoiles. Images de la présentation refaites. Contraste contrôlé, 174 tests verts.
- **Lot 16 publié le 15 oct. 2026.** Bande « Les parties d'un morceau » du guide laissée orange (couleurs du
  morceau A) : à changer si l'utilisateur le demande.
- **Lot 17 (15 oct. 2026)** : branche `lot-17-vrai-visuel`, non publiée. Demande de l'utilisateur : « Passer au vrai »
  mal organisé, pas visuel, a l'air compliqué. Avant l'import : « Mixe ta propre musique », 3 étapes
  (`.rbsteps`), un gros bouton, l'exemple en petit lien. Après : **une seule paire en grand** (`#rbHero`,
  « Ta paire du jour », tirée de la date parmi les 10 meilleures, `rbSug`), deux platines dessinées A/B,
  trois pastilles Tempo / Tonalité / Style (`rbChips`), boutons « C'est parti » (`rbPickPair`) et « Une autre
  paire » (`rbNextSug`) ; la liste complète et la recherche sont derrière « Choisir une paire moi-même »
  (`#rbPairPick`, `rbChoosing`). Missions inchangées (une à la fois). Calcul des paires et textes des
  missions inchangés. Prévu ensuite : bouton « Jouer cette paire ici » avec les fichiers de l'utilisateur
  (essai « Ta musique » : import MP3 + grille rekordbox). « Une autre paire » parcourt `rbAll` (titre « Une
  paire pour toi », `rbMoved`), caché s'il n'y a qu'une paire. 182 tests verts.
- **Lot 17 publié le 15 oct. 2026.** Prochaine idée proposée : l'essai « Ta musique » (jouer les exercices avec
  les MP3 de l'utilisateur et la grille de son export rekordbox) ; il faut son export XML et 2 ou 3 morceaux.
- **Lot 18 (15 oct. 2026)** : branche `lot-18-clarte-debutant`, non publiée. Demande de l'utilisateur : pas clair pour
  un débutant ; au swap, l'encadré disait « LOW de B tout à gauche » et la bulle « LOW de B au milieu » en même
  temps. **Vocabulaire unique** : potard « normal » (à midi) / « coupé » (tout à gauche), filtre « neutre » /
  « tout à droite », fader « en haut » / « en bas » (`targetText`, `ACT`, consignes, messages). Avant de jouer :
  encadré **« Pendant le niveau »** sous le titre (`#plan`, `planSteps`, `renderPlan` dans `js/midi.js`), gestes
  dans l'ordre écrits départ → arrivée ; « Position de départ » (ancien « Mise en place », table branchée) avec
  un petit dessin par commande (`pictoOf`) ; la bulle ne donne plus le geste avant la partie. Niveau 4 : repère
  « B À FOND » au temps 56. **Guide** réduit à la musique (Bienvenue, phrases, parties d'un morceau, Tu es
  prêt). **Fiches « Découvre ce bouton »** (`FICHES`, `fichesOf`, `withFiches` dans `js/guide.js`, même
  fenêtre que le guide : `openOnb(étapes, { fiche, keys, after })`) : avant la première partie qui se sert d'une
  commande (PLAY, faders, LOW, filtre, écho, MID), avec le schéma allumé et un essai à l'écoute ; « Je connais,
  passer » ; jamais dans le parcours « deja », l'entraînement ou le test de placement ; « Revoir la fiche »
  dans « Comment faire ? ». Clé `coach-fiches`. Le bouton ON de l'effet compte dans la fiche de l'écho.
  Si la table n'est plus en place après une fiche, la bulle le dit et l'encadré « Position de départ »
  s'affiche. 195 tests verts (tests/outils.js marque les fiches comme vues par défaut).
- **Lot 18 publié le 15 oct. 2026** (accord de l'utilisateur, avant la checklist FLX4). À vérifier sur la table : la
  place du bouton ON dessiné dans les fiches, et ON de l'effet pendant la fiche de l'écho.
- **Lot 19 (15 oct. 2026)** : branche `lot-19-autre-table`, non publiée. Demande de l'utilisateur : rendre le site
  utilisable avec d'autres tables que la FLX4. **« Régler ma table »** pas à pas (`js/reglage.js`, chargé après `table`) :
  fenêtre `#reg`, 8 étapes `REG_STEPS` (faders A et B, LOW A et B, MID A, filtre A, PLAY B, bouton d'effet), schéma des
  fiches recopié avec le préfixe `rg-`. Un potard ou un fader est reconnu après 3 valeurs différentes ; le second
  message d'un potard « fin » (numéro + 32) est ignoré ; un bouton = une note, ou un message de potard 127 puis 0
  (marqué `cc` dans le réglage) ; une commande déjà reconnue est refusée (« Ça, c'est … ») ; « Je n'ai pas cette
  commande » ; Retour ; Échap annule sans rien enregistrer. Bandeau `#tableBar` sous l'en-tête quand une table qui
  n'est pas une FLX4 est branchée sans réglage (`tableEtat()` dans `js/midi.js` : `aucune`, `ok`, `nouvelle`, `flx4`).
  **Tant qu'elle n'est pas réglée, elle ne pilote rien** (`tableOn()`) : pas de position de départ, pastille
  « · à régler », curseurs à l'écran dans les fiches. Clé `coach-table` (`{ nom }`) ; avec elle, `cleanMap(s, true)` ne
  reprend aucun réglage de la FLX4 : une commande absente se fait à l'écran et ne bloque pas « Jouer » (`onScreen`).
  Une FLX4 branchée après une autre table : le bandeau propose de reprendre ses réglages (`flx4Map` dans
  `js/table.js`, aussi derrière « Revenir aux réglages de la DDJ-FLX4 »). Bouton « Régler ma table pas à pas » dans
  « Ma table ». Textes neutres (« ta table ») dans le guide, les fiches, les niveaux, une question du quiz (`b4a`,
  identifiant inchangé), l'accueil, Ma table, la présentation (matériel, question « Et si j'ai une autre table ? »)
  et la fiche des testeurs. « Tout recommencer à zéro » garde `coach-table` ; le rapport des testeurs donne le nom de
  la table. Une table dont Windows préfixe le nom (« 2- ») reste reconnue (`baseName`). Dans « Ma table », pas
  d'apprentissage commande par commande tant que la table n'est pas réglée. **Schéma vivant** (demande de l'utilisateur) :
  dans les fiches, « Régler ma table » et « Ma table », le fader dessiné monte et descend, l'aiguille du potard tourne et le
  bouton s'allume avec la vraie table (`onbSchemaSet`, `onbSchemaPress`, `onbSchemaSync` dans `js/guide.js`, aiguilles `.ndl` ;
  `tableSchemaSet` dans `js/table.js`) ; dans les fiches, aussi avec le curseur. 218 tests verts. **Aucune autre table essayée en vrai** : les numéros MIDI des tests sont inventés.
  Le casque à 4 canaux dépend de la carte son de la table, pas de son nom : à vérifier sur une autre table.
  **Risque à vérifier sur la vraie FLX4** : elle est reconnue au mot « FLX4 » dans son nom (`isFlx4`). Si elle
  s'annonce autrement, elle passe pour une autre table (bandeau « Nouvelle table », elle ne pilote rien avant réglage).
- **Lot 19 publié le 15 oct. 2026** (accord de l'utilisateur, avant la checklist FLX4). À vérifier sur la FLX4 : pastille
  sans « · à régler », pas de bandeau « Nouvelle table », fader et potards dessinés qui bougent dans le bon sens.
- **Lot 20 (15 oct. 2026)** : branche `lot-20-expert`, non publiée. Demande de l'utilisateur : niveaux « beaucoup trop faciles »,
  il faut que quelqu'un d'un peu expérimenté progresse. Constat : B était toujours calé sur le temps le plus proche
  (`launchB` arrondit), tolérance de 1 temps au chapitre 1, compte à rebours et repères. **Mode Expert** (`js/expert.js`,
  chargé après `piste`) sur les 7 niveaux du chapitre 1 seulement, hors entraînement et test de placement (`expertOn()`) :
  bouton `#expertBtn` dans les étiquettes du niveau (« Mode Expert · record N/100 »), préférence et records dans
  `coach-expert` (`{ on, best: { numéro de niveau: score } }`, validé à la lecture). En Expert : `TOL` = 0,25 ; pas de compte
  à rebours, de repère ni de « B partira ici » (même avant de jouer) ; départ 0, 4 ou 8 temps plus tôt au hasard ; B part
  à l'instant de l'appui (`launchExpert`), sans calage. Tout est mesuré **au temps entendu** (`heardTime` : sortie de la
  carte son, `getOutputTimestamp`, sinon `outputLatency`) et chaque geste de la table ou de la souris est noté à l'instant où
  il arrive (`gestureMark` → `snapFrame`). Notes continues en millisecondes (`evalLaunchX`, et `xv` / `dur` dans les
  évaluations du swap, de l'écho et de la coupure quand `xRun`), score sur 100 = moyenne des gestes, étoiles : 90 → 3,
  60 → 2 ; `expertResult` garde le record. Le mode normal ne change pas. Le test de placement met le Mode Expert de côté ;
  `quitPlacement` le rétablit (`tolOf`). 229 tests verts.
- **Lot 21 (15 oct. 2026)** : branche `lot-21-djingo` (partie de `lot-20-expert`), non publiée. **Nouveau nom : DJingo**
  (décision de l'utilisateur) dans les pages, le guide (« Bienvenue sur DJingo »), le rapport des testeurs, la présentation,
  la fiche des testeurs, le README, les agents. Les noms internes ne changent pas : clés `coach-*`, dépôt, adresse
  https://coach-bass-swap.vercel.app (changer d'adresse ou de nom de projet Vercel est une décision à part). Recherche
  rapide : aucune appli « DJingo » trouvée ; avant d'acheter un domaine ou un logo, vérifier les marques (INPI, EUIPO) et la
  proximité avec « Duolingo ». Images de la présentation refaites.
- **Vidéo DJingo (15 oct. 2026)**, dans `marketing/` (hors Git) : `marketing/video/djingo.html`, animation sans capture du site
  (accroche, silence avant le drop, logo sur le drop, jeu de rythme, table qui bouge, Mode Expert, progression, appel),
  musique « Dj » de Play House (CC0) à partir de 1 min 54,968 s, drop au temps 16 de la vidéo. `node marketing/video/rendu.js
  djingo` → `marketing/video/sortie/djingo-tiktok.mp4` et `-sans-son.mp4` (27 s). « Gratuit pendant la bêta » écrit à la fin.
- **Lots 20 et 21 publiés le 15 oct. 2026** (accord de l'utilisateur, avant la checklist FLX4 ; points 17 et 18 ajoutés à
  la checklist : FLX4 reconnue sans « à régler », et score du Mode Expert avec le casque de la table).
- **Vrai export rekordbox essayé le 16 oct. 2026** : `audio-essai/rekordbpx.xml` (hors Git), 1061 morceaux (rekordbox 6.8.6),
  1009 avec tempo et tonalité, importé en 0,2 s sans erreur ; paire du jour correcte. Les fichiers audio qu'il cite ne sont
  **pas sur ce PC** (autre ordinateur de l'utilisateur) : pour l'essai « Ta musique », il doit copier 2 ou 3 MP3 dans
  `audio-essai/`. Sa collection : surtout afro house, deep house, tech house, 118-130 BPM.
- **Lot 22 abandonné (16 oct. 2026)** : branche `lot-22-trouver` gardée, **jamais publiée**. Liens « Trouver des morceaux qui
  vont avec » vers DigDeeper et Beatport ; l'utilisateur ne voulait pas de redirection mais la même chose sur le site
  (comme digdeeper.fm). Bloqué par les droits : Deezer réserve son API à un usage non commercial, Spotify ne donne plus
  recommandations, tempo ni tonalité aux nouvelles applis (nov. 2024). Possible plus tard : même outil limité à la
  collection de l'utilisateur, ou partenariat (DigDeeper, Beatport). L'utilisateur a dit « tant pis, on passe à autre chose ».
- **Lot 23 (16 oct. 2026)** : branche `lot-23-progres`, non publiée. Demande de l'utilisateur : « Mes progrès » ne ressemble
  à rien, trop d'informations, badges pas beaux. Page refaite en cartes (`renderProgres` dans `js/parcours.js`, `#vProgres`
  dans `index.html`) : niveau en grand avec barre et « Encore N XP pour le niveau N+1 » (`xpTotal` dans `js/niveaux.js`,
  aussi utilisé par `renderHud`) ; « Aujourd'hui » (anneau `#pgRing`, choix 5/10/15 min replié derrière « Changer mon
  objectif », `#pgGoalBox`) et la série (`#pgStreak`, record `#pgBest`) ; **ton prochain badge** (`badgeNext` : celui dont la
  barre est la plus remplie, `BADGE_PROG` dans `js/quiz.js` donne [actuel, but, unité, où aller], bouton « Y aller ») ;
  **médailles** (`renderBadges` : `BADGE_ICON`, dessins en traits, dorées `--mid` sur `--medal-bg` quand gagnées, grises
  avec cadenas sinon, gagnées d'abord ; toucher une médaille l'explique dans `#pgMedalInfo`) ; « Mes chapitres » (barre
  d'étoiles par chapitre ouvert, clic pour l'ouvrir ; chapitres fermés : ce qu'il manque). Les anciennes cases `.ptile` et
  le nombre de réponses au quiz ont disparu. **Défaut ancien corrigé** (déjà en ligne) : depuis les niveaux 5 à 7 du
  chapitre 1, ouvrir le chapitre 4 (4 niveaux) faisait planter la page ; `selectLesson` remet `li` à 0 s'il n'existe pas.
  234 tests verts.
- **Lot 23 publié le 16 oct. 2026** (accord de l'utilisateur). Médailles et flamme dorées (`--mid`) : l'utilisateur n'a pas
  dit si c'était trop coloré ; à reprendre s'il le demande.
- **Lot 24 (16 oct. 2026)** : branche `lot-24-oreille`, non publiée. Défaut signalé par l'utilisateur (capture) : à l'oreille
  (chapitre 2), un geste déjà fait affichait son repère validé (✓) **devant** la ligne, à l'endroit du bon moment, ce
  qui trahissait la phrase ; même trou en Mode Expert. `markShown` (`js/piste.js`) : sans repères, rien devant la ligne,
  le repère et sa note réapparaissent une fois la ligne passée. Brouillard rendu tout à fait opaque au-delà de la ligne.
  235 tests verts.
- **Lot 24 publié le 16 oct. 2026** (accord de l'utilisateur).
- **Vidéo « le rêve » (16 oct. 2026)**, dans `marketing/` (hors Git) : `marketing/video/djingo-reve.html` (chambre, plongée dans
  le vinyle, « …c'était TOI », drop avec foule, lasers et mur de LED, trois rêves, le site en trois mots, « Deviens DJ »),
  même musique et même drop que `djingo.html`. `node marketing/video/rendu.js djingo-reve` → `sortie/djingo-reve-tiktok.mp4`.
- **Lot 25 (16 oct. 2026)** : branche `lot-25-vrais-morceaux`, non publiée. Choix **« Vraie musique »** dans « Morceaux » (style
  `vrai`, nom choisi parce que « Les vrais morceaux » est déjà le titre du chapitre 3) : chapitres 1 et 4 joués sur de vrais
  morceaux de Play House (**CC0**). `js/vrais.js` (chargé après `audio`) : `VRAIS` (2 paires : A « Dj » ou « Like An Animal »,
  B0 l'autre, B1 « The Power Of The Beat », dont l'intro a des basses), `vraiSong` (charge `musique/*.mp3`, décode dans un
  contexte hors ligne, ralenti du chapitre 4 par `vraiSlow` = comme un disque, plus grave), repli sur la house du site si le
  fichier ne se charge pas (étiquette « la vraie musique n'a pas pu se charger »). `getSong` passe la main à `vraiSong` pour
  `vrai`. Étiquette du niveau : « « Dj » puis « Like An Animal » · Play House ». Les extraits (`musique/`, 5 fichiers de
  65,8 s, 1,05 Mo chacun, publiés) sont faits par `node tests/vrais-morceaux.js` depuis `audio-essai/fma/` (hors Git) : coupés
  pile sur un temps, ramenés à 124 BPM (« Dj » est à 125), même volume. Grille mesurée : grosse caisse moyenne sur les temps
  de la grille, écart entre les extraits sous 10 ms ; Chrome décode les MP3 sans décalage (vérifié). « On My Mind » écarté
  (grille instable). L'entraînement, le chapitre 2 et le chapitre 3 gardent les morceaux du site. 241 tests verts. Écouté par
  l'utilisateur sur ce PC : « ça rend bien » (pas encore avec le casque de la FLX4). À sa
  demande, **« Vraie musique » est le choix par défaut** et en tête de la liste (un style choisi soi-même reste enregistré dans
  `coach-style` ; une valeur abîmée revient à `vrai`). Les tests jouent la house sauf indication contraire (`tests/outils.js`
  met `coach-style` à `house`). 243 tests verts.
- **Lot 26 (16 oct. 2026)** : branche `lot-26-ordre` (partie de `lot-25-vrais-morceaux`), non publiée. Demande de l'utilisateur :
  l'ordre du chapitre 1 venait de l'ordre d'ajout des niveaux. **Nouvel ordre**, chaque niveau ajoute une chose : 1. Le bon
  moment · 2. Le fader · 3. La coupure sèche · 4. L'écho out · 5. Le filtre · 6. Le swap des basses · 7. La transition complète
  (« Le final : tout toi-même, comme en soirée »). Le chapitre 2 suit le même ordre. Dans `js/niveaux.js` : `kind` écrit dans
  chaque niveau, `[début, fin]`, `TARGETS` et `DEMO_CAPS` renumérotés. **Progression déplacée une seule fois**
  (`ORDRE_1` = ancien numéro → nouveau, `ordreMigre`, clé `coach-ordre` = `2`) : `coach-lecons`, `coach-lecons-oreille`,
  `coach-ch2`, records de `coach-expert`, `coach-test` (`ko:N`), parties et « C'était clair ? » du journal (chapitres 1 et 2).
  Quiz : niveaux `b0`-`b6` renumérotés, **identifiants inchangés** (`b6a` est une question du niveau `b2`). Badges « Swap
  propre » et « Comme en soirée » : niveaux 5 et 6 (`bdBest`, `BADGE_PROG`). Test de placement : `P_STEPS = [0, 5, 6]`.
  Textes : étape « Les bases », README. Images de la présentation refaites (`tests/images-presentation.js` : swap = niveau 6).
  Tests : numéros de niveau mis à jour, `tests/outils.js` met `coach-ordre` à `2`, nouveau `tests/ordre.spec.js`.
  Après le gardien (feu rouge seulement à cause des 5 MP3, qui demandent l'accord de l'utilisateur) : la vraie musique n'est
  téléchargée que sur l'écran des leçons (`warmSongs`), extraits sans informations d'origine, présentation et checklist
  (point 19) à jour. 249 tests verts.
- **Lot 27 « Direction artistique » (16 oct. 2026)**, pas de code du site. Décision de l'utilisateur : retour d'une mascotte et
  d'**un peu** de couleur, façon Duolingo (il trouvait l'ancien site trop coloré). Page privée claude.ai (canvas) :
  https://claude.ai/artifact/MhEyunmwTB6inYCCAecyCd : trois mascottes animées sur le tempo (Vini le vinyle au casque, Axo
  l'axolotl aux branchies-égaliseur, Boomy l'enceinte), humeurs danse / parfait / raté ; une seule couleur ajoutée (violet UV
  `#8C5CFF` recommandé, rose néon et citron en comparaison) ; police Nunito ; boutons en relief, cartes de choix, bulle ;
  4 écrans d'accueil cliquables (niveau, objectif, bravo, série). Atelier de dessin : `captures/mascottes.html` (hors Git).
  **Choix de l'utilisateur : Vini, en violet.** Il garde le corps (vinyle, bras, jambes, casque) mais trouve le visage trop
  « kawaii » : planche « Vini · six visages » ajoutée (Cool, Lunettes, Rétro, Grands yeux, Minimal, LED ; atelier
  `captures/visages.html`, planche fabriquée par un script à partir de l'atelier). **Visage choisi : « Rétro »** (yeux noirs de dessin animé des années 30 avec
  une encoche, grand sourire, ni joues roses ni nez), appliqué à toutes les planches. Police Nunito validée. Suite prévue : lot 28 « Premiers pas » (accueil façon
  Duolingo), lot 29 « Ça bouge » (mascotte dans les niveaux, écran de fin, série).
- **Lot 28 « Premiers pas » (16 oct. 2026)** : branche `lot-28-premiers-pas` (partie de `lot-26-ordre`), non publiée. **Vini sur le
  site** : `js/vini.js` (`VINI_SVG`, `viniMettre(el, humeur)`, `viniHumeur`, `viniJoie` ; humeurs `danse`, `parfait`, `rate`), couleurs
  et mouvements dans `styles.css` (section « Vini », classes `vn-…`, tokens `--vini-…`, danse au tempo `--vini-beat`). **Premiers pas**
  (`js/premiers.js`, fenêtre `#pp` plein écran) : à la toute première visite (`ppAOuvrir` : ni parcours choisi ou déduit, ni
  `coach-accueil`), 6 écrans façon Duolingo, une question par écran, barre de progression, Retour, « Passer », bouton du bas grisé
  tant qu'on n'a rien choisi : bonjour de Vini → « Tu as déjà mixé ? » (4 niveaux ; 0 = parcours `debut`, sinon `deja`) → « Tu as
  quelle table ? » (FLX4, autre, souris ; Vini répond) → « Pourquoi tu veux mixer ? » (plusieurs choix) → objectif 5/10/15 min
  (`goalSet`, avec le délai annoncé) → « Par où tu commences ? » (bases ou test de placement, « Recommandé » selon le niveau). La fin
  choisit le parcours et mène au niveau 1 (le guide s'ouvre pour `debut`) ou lance le test de placement. « Passer » n'impose rien :
  l'accueil propose les deux parcours comme avant. Clé `coach-accueil` (`{ niveau, table, pourquoi, min, depart, fini }` ou
  `{ passe, fini }`), résumée dans le rapport des testeurs (`ppResume`). Le guide ne s'ouvre pas tant que les questions sont à
  l'écran. **Police Nunito partout** (site, présentation, fiche des testeurs). **Couleur de marque** violet (`--brand…`) : Vini et le
  bouton principal des Premiers pas seulement, pour l'instant. Tests : `tests/outils.js` marque les Premiers pas comme passés
  (`coach-accueil`), nouveau `tests/premiers.spec.js`. Images de la présentation refaites. 265 tests verts.
- **Lots 25, 26 et 28 publiés le 16 oct. 2026** (accord de l'utilisateur, MP3 compris, avant la checklist FLX4 ; gardien : feu orange).
  Production vérifiée : Premiers pas pour un nouveau venu puis guide, rien pour un habitué, Nunito chargée, nouvel ordre, partie sur
  la vraie musique (morceau A de 65,8 s), aucune erreur. Notion à jour. Prochain lot proposé : 29 « Ça bouge » (Vini dans les
  niveaux, écran de fin avec cartes XP / précision / temps, écran de série « 1 jour ! »).
- **Lot 29 « Ça bouge » (16 oct. 2026)** : branche `lot-29-ca-bouge`, non publiée. **Vini dans les niveaux** (`#lvlVini`, à gauche
  de la bulle de conseil, caché sur téléphone comme la bulle) : humeur `calme` (il cligne des yeux) hors partie ; pendant une partie,
  il danse **calé sur les temps du morceau** (`viniCale` dans `js/vini.js` : `--vini-beat` = `P`, `--vini-delay` selon `beatNow()`),
  saute de joie sur un message « ok » et baisse les bras sur un « bad » (`viniReagit`, appelé par `pop`), puis se recale.
  **Carte de résultat** (`resultatCarte`, `resultatVini`, `compte` dans `js/niveaux.js`) : Vini (joie si 2 étoiles ou plus,
  déception sinon), titre doré (`h2.win`), trois cartes qui se remplissent : XP gagnés (doré), précision = moyenne des gestes notés
  (vert), temps de la partie (violet) ; pas de carte d'XP en entraînement ni au test de placement ; `#rGain` ne garde que le record,
  le score Expert et les chapitres débloqués. **Écran de la série** (`openSerie` / `closeSerie` dans `js/objectif.js`, fenêtre
  `#serie`) : quand l'objectif du jour vient d'être atteint (fin de partie ou fermeture du quiz), Vini danse à côté d'une flamme,
  nombre de jours d'affilée en grand, semaine du lundi au dimanche avec les jours réussis cochés, « Continuer » (ou Échap) mène à la
  carte de résultat. Nouvelle humeur `calme` et classe `vn-fn` (notes de musique seulement quand il danse). Nouveau
  `tests/ca-bouge.spec.js`. 273 tests verts. Images de la présentation refaites.
- **Lot 29 publié le 16 oct. 2026** (accord de l'utilisateur ; gardien : feu orange, défaut d'Échap sur l'écran de la série corrigé
  avant : l'écouteur passe en premier et arrête la touche). Production vérifiée (Vini calme puis danse puis joie, écran de série,
  carte de fin +30 / 100 % / 0:12, aucune erreur). Notion à jour. À demander à l'utilisateur : le doré et les trois cartes de couleur
  font-ils trop ? Pistes suivantes possibles : Vini sur l'accueil et « Mes progrès », sons de réussite, quêtes du jour façon Duolingo.
- **Lot 30 « Quêtes du jour » (16 oct. 2026)** : branche `lot-30-quetes`, non publiée. Demande de l'utilisateur. `js/quetes.js` (chargé
  après `premiers`) : `QUETES` (12 quêtes : identifiant, difficulté 0/1/2, texte, but, compteur, `dispo()`), chaque jour trois quêtes
  (une par difficulté, compteurs différents) tirées de la date parmi celles qui ont un sens pour le joueur (`qtJour` : pas de quiz,
  défi, oreille ni Expert pour un débutant, pas de combo sans chapitre 4), gardées toute la journée. Compteurs du jour (`parties`,
  `demos`, `reussies` = 2 étoiles ou plus, `trois`, `expert`, `oreille`, `combos`, `quiz`) mis à jour par `questNote` (fin de partie,
  démos comprises, après `pracStep`) et `questQuiz` (chaque bonne réponse) ; le défi du jour se lit dans l'entraînement. **Coffre** par
  quête terminée (10, 15 ou 20 XP selon la difficulté, `questOuvrir`), une seule fois ; le total `xp` s'ajoute à `xpTotal`. Section
  `#homeQuetes` sur l'accueil (entre la prochaine étape et le parcours, cachée tant qu'aucun parcours n'est choisi), en-tête violet
  avec Vini, « N sur 3 · nouvelles quêtes dans N h ». Ligne `#rQuete` sur la carte de fin quand une partie termine une quête. Clé
  `coach-quetes` (`{ jour, ids, cpt, ouverts, xp }`, validée à la lecture ; un nouveau jour remet compteurs et coffres à zéro, garde
  `xp`). Nouveau `tests/quetes.spec.js`. 282 tests verts.
- **Lot 30 publié le 16 oct. 2026** (accord de l'utilisateur ; gardien : feu orange, compteur « 1 / 2 » sorti de la barre violette
  pour la lisibilité avant la mise en ligne). Production vérifiée (quêtes affichées, ligne de la carte de fin, coffre +10 XP, aucune
  erreur). Notion à jour. Toujours sans réponse : le violet et le doré font-ils trop ? Le violet sert désormais à Vini, au bouton des
  Premiers pas et aux quêtes (commentaire de `:root` mis à jour).
- **Lot 31 « Vini sur l'accueil et sons » (16 oct. 2026)** : branche `lot-31-vini-sons`, non publiée. Demande de l'utilisateur.
  **Vini sur l'accueil** (`#homeViniBtn` / `#homeVini`, à droite de « Ta prochaine étape », sous le texte sur téléphone) : `homeVini()`
  dans `js/parcours.js` choisit sa phrase (`#homeTip`) : coffre à ouvrir (`questCoffres` dans `js/quetes.js`), objectif atteint, série à
  garder, ou bonjour selon l'heure ; il danse s'il y a quelque chose à fêter, sinon il attend ; le toucher le fait sauter. C'est
  le seul Vini de l'accueil (celui de l'en-tête des quêtes a été retiré) : il saute quand on ouvre un coffre. **Sons** (`js/sons.js`,
  chargé après `vrais`) : notes fabriquées dans le navigateur (`sonNote`, `SONS`, `son(nom)`), aucun fichier, par la sortie
  générale ; `pop()` sonne selon le message (réussi, presque, raté ; jamais pendant une démo), `chime()` ne double pas un message qui
  vient de sonner ; fin de partie : une note par étoile puis un accord, ou deux notes qui descendent (rien si l'écran de série passe
  devant, qui a son propre son) ; coffre, série, quiz, choix des Premiers pas, fin du test de placement et du mini-set. Bouton
  haut-parleur `#sonsBtn` dans l'en-tête (clé `coach-sons`, `0` = coupés). Images de la présentation refaites (sur `img/accueil.jpg`, Vini annonce
  un coffre, message valable à toute heure). Point 20 ajouté à la checklist FLX4 (les sons au casque de la table). Nouveau `tests/vini-sons.spec.js`. 291 tests verts.
- **Lot 31 publié le 16 oct. 2026** (accord de l'utilisateur ; gardien : feu orange). Production vérifiée (Vini annonce le coffre et
  danse, un seul Vini, le coffre joue ses 5 notes, contexte audio lancé, bouton des sons qui coupe et garde `coach-sons` à `0`, aucune
  erreur). Notion à jour. Prochaine étape du plan : tester avec 3 à 5 débutants (fiche `testeurs.html`), et la checklist FLX4 (20 points).
- **Couleurs validées par l'utilisateur (16 oct. 2026)** : le violet (Vini, Premiers pas, quêtes) et le doré (titres réussis, série,
  étoiles, XP) lui conviennent. Ne pas les retirer.
- **Lot 32 « Vini partout » (16 oct. 2026)** : branche `lot-32-vini-partout`, non publiée. Choix de l'utilisateur parmi 4 pistes.
  **Coin Vini** commun (`viniDit(nom, texte, humeur)` et `viniSaute(nom)` dans `js/vini.js`) : éléments `${nom}Vini`, `${nom}ViniBtn`,
  `${nom}Tip` (bloc `.vcoin` en haut de la page) ; le toucher le fait sauter, puis il reprend l'humeur de la page. L'accueil passe
  aussi par lui (`homeVini`). **Mes progrès** (`viniProgres` dans `js/parcours.js`, appelé par `renderProgres`) : objectif atteint
  (danse), badge à moitié gagné ou plus (« Tu y es presque : 2 sur 3 pour le badge « Swap propre » ! »), sinon les XP pour le niveau
  suivant. **S'entraîner** (`viniEntrainement` dans `js/entrainement.js`, appelé par `renderTrain`) : jouer d'abord un niveau, le défi
  du jour qui attend, défi pas encore réussi, ou défi réussi (danse) avec le mini-set et son record. **Passer au vrai** (`viniVrai`
  dans `js/rekordbox.js`, appelé par `renderReal` et `renderMissions`) : demander la collection, « Voilà ta paire du jour ! »,
  « Mission N sur 6 : … », paire validée (danse) ; chaque mission faite le fait sauter avec un son (`reussi`, `fin` pour la dernière).
  Nouveau `tests/vini-partout.spec.js`.
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
  `audio` → `vrais` (vraie musique) → `sons` (sons du jeu) → `controles` → `combos` (chapitre 4) → `niveaux` (niveaux, progression, partie, notation) → `piste` → `expert` (Mode Expert) → `midi` →
  `placement` → `entrainement` → `rekordbox` → `guide` → `objectif` (objectif du jour) → `quiz` (quiz et badges) → `parcours` (accueil, les deux parcours) → `vini` (la mascotte) → `premiers` (Premiers pas) → `quetes` (quêtes du jour) →
  `table` (page « Ma table ») → `reglage` (régler une autre table pas à pas) → `avis` (avis des testeurs, rapport) →
  `demarrage` (démarrage et onglets).
  Conséquences : un nom déclaré dans un fichier existe dans tous les autres (chercher avant de nommer) ;
  le code exécuté au chargement d'un fichier ne peut appeler que ce qui est défini dans ce fichier ou
  dans un fichier chargé avant ; `function stop` remplace `window.stop` (sans effet connu).
  Étape suivante possible, non commencée : de vrais modules avec import/export.
- `coach.html` — ancien mode libre (bibliothèque rekordbox, coach de swap), retiré du site : la page renvoie
  vers `index.html#vrai`. Son code sert de base à « Passer au vrai » ; `coach.html?ancien=1` l'affiche encore.
- `tests/` — scripts Playwright (Python) : `tdz.py`, `robust.py`, `clar.py`, `play.py`, `play2.py`, `user.py`.
- `tests/rekordbox-exemple.xml` — fausse collection rekordbox pour essayer l'import à la main.
- `musique/` — extraits de vrais morceaux (Play House, CC0) pour « Vraie musique », refaits par `node tests/vrais-morceaux.js`.
- `README.md` — description publique.

## Architecture du code (repères ; « fin du script » = `js/demarrage.js`)
- **Onglets** : des blocs `.view` (`vHome`, `vLearn`, `vTrain`, `vReal`, `vTable`, `vProgres`), un seul visible. `setView(v)`
  (fin du script) suit l'adresse : `#accueil` (défaut), `#apprendre`, `#entrainer`, `#vrai`, et aussi `#table` (« Ma table ») et `#progres` (« Mes progrès »). Quitter
  Apprendre arrête la partie en cours ; le guide de premier lancement s'ouvre à la première entrée dans
  Apprendre, plus au chargement. Les tests ouvrent `index.html#apprendre`.
- **Parcours** (`js/parcours.js`) : `PARCOURS` (ordre des étapes de chaque parcours), `STAGES` (pour
  chaque étape : `done()` calculé depuis la progression existante, `cta()`, `go()`), `nextStage()`,
  `renderHome()`. Seuls le choix (`coach-parcours` : `debut` ou `deja`) et le résultat du test
  (`coach-test` : `ok` ou `ko:N`, N = premier niveau raté) sont enregistrés. Sans choix enregistré, un
  utilisateur qui a déjà une progression est rangé d'office dans un parcours, sans question. Dans le
  parcours `deja`, le guide ne s'ouvre pas tout seul (`setView`).
- **Quiz et badges** (`js/quiz.js`) : `QUIZ` (une question = identifiant, niveau `b0`-`b6` / `c0`-`c3` / `g`,
  question, 3 réponses dont la première est la bonne, explication ; ne jamais changer un identifiant),
  `quizBonus()` (question du niveau affiché), `quizFlash()` (5 questions sur les niveaux joués),
  `openQuiz` / `closeQuiz` (fenêtre `#quiz`), `quizOffer(st)` appelé par `finish`. `BADGES` (identifiant,
  nom, condition lue dans la progression), `badgeSync()` (enregistre et renvoie les nouveaux),
  `badgeNote(id)` (annonce), `renderBadges()` appelé par `renderProgres`. L'XP du quiz s'ajoute dans `renderHud`.
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
  PLAY A et MID B ont un réglage mais aucun code ne s'en sert. Autre table (lot 19) : `tableCfg` (clé `coach-table`),
  `tableEtat()` / `tableOn()`, `cleanMap(s, perso)`, boutons `cc`, `pressKey` ; la préparation pas à pas est dans `js/reglage.js`
  (`onMidi` lui passe la main tant que `reg.active`).
- **Morceaux** : `makeSong(style, role, seed, secs, o)` (synthèse procédurale, `STYLE_DEFS`, `VARIANTS = 4`),
  calculés dans des Web Workers (`workerPool`, `renderSong`). Cache `getSong(sty, vr, part)` + `songSafe`
  (relance une fois). `chooseSongs()` précharge dès le choix du niveau. `startRun(demo)` lance la partie.
- **Niveaux** : `BASE_LESSONS` (kinds moment, fader, cut, echo, filter, swap, full, dans cet ordre depuis le lot 26 ; `targets`, `caps`)
  et `CH3_LESSONS`.
- **Lisibilité** : `ACT` (texte d'action par cible), `GROUP_OF`, `setFocus(ids)` (classe `.focus`),
  `showAction` (« Dans N temps : … » puis « Maintenant : … ! »), `<details class="howto">`.
- **Thème « Cabine pure »** (lot 16, 14 oct. 2026, après « Cabine » du lot 4) : sombre, noir neutre et blanc.
  Platine A en orange (`--a`) et platine B en bleu (`--b`) **seulement pour ce qui touche aux platines** ;
  partout ailleurs `--accent` (blanc). `--xp` et `--go` sont devenus neutres (gris clair, blanc). Ne pas
  réintroduire de couleur décorative : l'utilisateur trouvait le site trop coloré. **Depuis les lots 27-28 (décision de l'utilisateur) :
  une seule couleur de marque, le violet `--brand` (Vini et bouton principal), police Nunito partout, mascotte Vini (`js/vini.js`).** **Toutes les couleurs passent par la liste
  `:root` en tête de `styles.css`** (et par `COL` dans `js/piste.js` pour le canvas) : ne jamais écrire
  une couleur en dur ailleurs. Texte posé sur une couleur vive : `--ink` ; sur `--fg` : `--on-fg`.
  `styles.css` garde des couches héritées qui se surchargent (mise en page compacte, « habillage »,
  formes arrondies) : les fusionner serait un nettoyage à part.
- **Captures et contraste** : `node tests/captures.js captures/nom` enregistre chaque écran (dossier
  `captures/` ignoré par Git) et signale les textes au contraste trop faible. Avec `--vite`, seulement
  les écrans fixes, comparables image par image entre deux versions. Seul signalement restant, voulu :
  les étoiles non gagnées, volontairement estompées.

### Clés localStorage
`coach-lecons`, `coach-lecons-oreille`, `coach-ch2`, `coach-ch2-ouvert`, `coach-ch3`, `coach-ch4` (étoiles des combos), `coach-chapitre`,
`coach-style` (`house`, `techno`, `afro`, `random` ou `vrai`), `coach-guide-vu`, `coach-fiches` (fiches « Découvre ce bouton » déjà vues), `coach-parcours`, `coach-test`, `coach-quiz` (identifiants des questions trouvées),
`coach-badges` (identifiants des badges gagnés), `coach-objectif` (objectif du jour, secondes par jour, série), `coach-journal` (temps, parties, « C'était clair ? », avis des testeurs), `coach-entrainement` (défi, série, compteurs, record du mini-set),
`coach-collection` (morceaux importés), `coach-missions` (paire choisie, missions cochées, paires validées), `coach-midi-map` (partagée avec `coach.html`), `coach-table` (nom d'une autre table réglée pas à pas ; gardée par « Tout recommencer à zéro »), `coach-expert` (Mode Expert choisi, records sur 100), `coach-ordre` (`2` : progression passée au nouvel ordre du chapitre 1), `coach-accueil` (réponses des Premiers pas, ou `passe`), `coach-quetes` (quêtes du jour, compteurs, coffres ouverts, XP des coffres), `coach-sons` (`0` : sons du jeu coupés), `coach-bibliotheque` (`coach.html`).
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
  inattendus, `coach-midi-map` abîmée. `tests/quiz.spec.js` : contenu du quiz, badges, quiz éclair, question bonus. `tests/objectif.spec.js` : objectif du jour, série. `tests/presentation.spec.js` : page de présentation. `tests/rangement.spec.js` : chapitres et style repliés, « Mes progrès », schéma replié. `tests/vrai.spec.js` : Passer au vrai étape par étape. `tests/rythme.spec.js` : durée des niveaux. `tests/combos.spec.js` : chapitre 4. `tests/ralenti.spec.js` : ralenti des combos. `tests/fiches.spec.js` : fiches, « Pendant le niveau », position de départ. `tests/autre-table.spec.js` : autre table, « Régler ma table », retour à la FLX4. `tests/expert.spec.js` : Mode Expert. `tests/vrais.spec.js` : vraie musique. `tests/ordre.spec.js` : ordre du chapitre 1 et progression déplacée. `tests/premiers.spec.js` : Premiers pas et Vini. `tests/ca-bouge.spec.js` : Vini en partie, carte de résultat, écran de la série. `tests/quetes.spec.js` : quêtes du jour. `tests/vini-sons.spec.js` : Vini sur l'accueil, sons du jeu. `tests/vini-partout.spec.js` : Vini sur Mes progrès, S'entraîner, Passer au vrai. `tests/clarte.spec.js` : lexique, échecs en écart, piste visible, badges de l'accueil. `tests/avis.spec.js` : « Mon avis »,
  « C'était clair ? », rapport, remise à zéro, fiche des testeurs.
  `tests/parcours.spec.js` : choix du parcours, prochaine étape à
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
- **Agents du projet** (`.claude/agents/`, créés le 14 oct. 2026) : `gardien` (tests et pièges connus,
  feu vert/orange/rouge, ne modifie rien) à lancer avant chaque demande de `git push` ; `chercheur-morceaux`
  (morceaux CC0 / CC BY entre 118 et 130 BPM, licence lue sur la page du morceau, ne télécharge rien).
