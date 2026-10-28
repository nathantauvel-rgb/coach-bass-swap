# Vérification sur la vraie DDJ-FLX4

À refaire avant chaque mise en ligne qui touche au MIDI, à l'audio ou aux niveaux. Environ 5 minutes.
Les tests automatiques utilisent une fausse table : ils ne remplacent pas cette vérification.

Préparation : Chrome ou Edge, rekordbox fermé, table branchée en USB.

Depuis le lot 33, le site fait cette vérification avec toi : « Ma table » → **« Vérifier ma table pas à pas »**
(20 étapes, environ 10 minutes). Il coche tout seul les commandes qui répondent, relève les numéros des
commandes qu'il n'utilise pas encore (point 16) et garde le résultat dans « Copier le rapport ». La liste
ci-dessous reste la version papier, utile pour noter à part ou pour vérifier sans ouvrir la vérification.

| # | À faire | Résultat attendu | OK ? |
|---|---|---|---|
| 1 | Ouvrir le site et accepter l'autorisation MIDI | La pastille en haut affiche le nom de la table | |
| 2 | Apprendre, niveau 2 « Le fader » | « Mise en place » passe au vert avec le fader A en haut et le B en bas, puis Jouer se débloque | |
| 3 | Niveau 6 « Le swap des basses » | Pareil avec LOW A au milieu et LOW B à gauche | |
| 4 | Niveau 1 « Le bon moment », pendant la partie | PLAY de la platine droite lance B | |
| 5 | Niveau 7 « La transition complète », en entier | Les quatre contrôles répondent, l'écran de résultat s'affiche | |
| 6 | Niveau 5 « Le filtre » : « Apprendre ce contrôle », tourner le CFX | Le CFX est reconnu, le niveau se joue | |
| 7 | Niveau 4 « L'écho out » : apprendre le bouton ON de l'effet | Le bouton active l'écho pendant la partie | |
| 8 | Débrancher le câble | La pastille repasse en « Souris » | |
| 9 | Rebrancher sans recharger la page | La table est de nouveau reconnue et les contrôles répondent | |
| 10 | Sans table : un niveau à la souris | Barre d'espace pour lancer B, touche E pour l'écho | |
| 11 | S'entraîner : un défi du jour avec la table | La séance se joue comme une leçon | |
| 12 | Son | Le son sort bien (enceintes et casque de la table) | |
| 13 | Cliquer sur la pastille de la table, en haut à droite | La page « Ma table » s'ouvre et indique « Table branchée » | |
| 14 | Sur « Ma table », bouger les faders, les LOW, le MID, appuyer sur PLAY | La bonne commande s'allume sur le schéma et affiche sa position | |
| 15 | Comparer le schéma à la vraie table | Chaque commande est au bon endroit et porte le bon nom (sinon, noter laquelle) | |
| 16 | « Ma table » → « Vérifier ma table pas à pas », étapes « Le crossfader » à « BEAT SYNC » | Le site relève lui-même le canal et le numéro de HI, crossfader, TRIM, tempo, molette, CUE, pad et BEAT SYNC : ils sont dans « Copier le rapport » et serviront aux prochains exercices | |
| 17 | Lot 19 : brancher la FLX4 | La pastille affiche son nom **sans** « · à régler », pas de bandeau « Nouvelle table », les dessins de « Ma table » bougent dans le même sens que la table | |
| 18 | Lot 20 : niveau 1 en Mode Expert, avec le casque de la table, en appuyant sur PLAY bien en rythme (5 essais) | Les scores sont souvent au-dessus de 80 ; noter si l'écart est toujours « trop tard » ou toujours « trop tôt » (et de combien de ms) | |
| 19 | Lots 25 et 26 : niveau 6 « Le swap des basses » avec la vraie musique, au casque de la table | Les grosses caisses de A et B tombent ensemble (pas de « galop »), les deux morceaux ne sonnent pas faux ensemble, le volume est le même que pour la house du site | |
| 20 | Lot 31 : un niveau en entier au casque de la table, avec quelques gestes réussis et ratés, puis en Mode Expert | Les petits sons du jeu s'entendent sans couvrir la musique, la musique ne baisse pas d'un coup à chaque son, les sons ne gênent pas en Mode Expert (sinon : le bouton haut-parleur de l'en-tête les coupe) | |
| 21 | Lot 39 : « Ma table », bouger HI, TRIM, le filtre de B, le crossfader et les deux TEMPO | La bonne commande s'allume sur le schéma et suit la table ; le crossfader va de A (gauche) à B (droite) | |
| 22 | Lot 39 : le sens du TEMPO (numéros relevés dans Mixxx) | Curseur vers soi (en bas) = « + » à l'écran ; vers le haut = « − » | |
| 23 | Lot 39 : la molette en lecture, puis à l'arrêt | En lecture, la tourner accélère ou freine un instant le morceau, sans à-coup ; à l'arrêt, elle le déplace. Noter si c'est trop ou pas assez sensible | |
| 24 | Lot 39 : pads en HOT CUE (1 à 4), puis SHIFT + pad | Un pad pose un repère, puis y saute ; SHIFT + pad l'efface | |
| 25 | Lot 39 : pads en BEAT LOOP (1, 2, 3, 4) et RELOOP/EXIT | Pads 1 à 3 : boucles de 4, 8, 16 temps ; pad 4 : sortie ; RELOOP/EXIT : boucle de 4 ou sortie | |
| 26 | Lot 39 : CUE de A tenu, puis relâché ; CUE casque de B | CUE tenu fait écouter depuis le repère et y revient au relâchement ; avec CUE casque, B s'entend au casque seulement | |
| 27 | Lot 40 : chapitre 5 « Le calage », niveaux 2 à 4, à la molette et au TEMPO de B | La molette ni trop ni pas assez sensible ; le TEMPO permet de tomber sur 124 BPM ; noter si 15 ms (★★★) est trop dur ou trop facile | |
| 28 | Lot 40 : niveau 5 « Au casque », avec un casque sur la table | Avec CUE casque de B, on entend B au casque et pas dans les enceintes ; en montant son fader, il entre dans les enceintes | |
| 29 | Lot 41 : chapitre 6, niveaux 1 et 2, pads de B en HOT CUE | Niveau 1 : le pad 1 de B pose le repère (un fanion « 1 » apparaît sur la piste) ; niveau 2 : le pad 1 de B lance B sur son drop. Noter l'écart annoncé en ms sur 5 essais : toujours « trop tard » ou toujours « trop tôt » ? | |
| 30 | Lot 41 : niveaux 3 à 5, pads en BEAT LOOP | Niveau 3 : le pad 4 (ou RELOOP/EXIT) fait sortir B de sa boucle ; niveaux 4 et 5 : les pads 1, 2, 3 de A font des boucles de 4, 8, 16 temps, et la boucle se raccourcit sans à-coup | |
| 31 | Lot 41 : les seuils du chapitre 6 | Un appui « bien en rythme » au casque de la table donne-t-il souvent ★★★ (moins de 20 ms) ? Si c'est impossible ou trop facile, le dire : les seuils HC_OK (20 ms) et HC_ZERO (150 ms) sont dans `js/hotcues.js` | |
| 32 | Lot 44 : chapitre 7 « Le set », niveau 1, avec la table | La table dessinée est rangée pendant le set (bouton « Afficher la table » pour la ressortir) ; PLAY de gauche lance A, PLAY de droite lance B ; le troisième morceau arrive bien sur A une fois le premier sorti ; ON de l'effet met l'écho sur le morceau en cours, même quand il est sur B | |
| 33 | Lot 44 : la note du set | Un set joué « proprement » à l'oreille donne-t-il 90 ou plus (★★★) ? Noter ce qui coûte des points sans raison (calage, basses, volume, phrase) : les seuils sont en haut de `js/set.js` (ENC_OK 15 ms, ★★★ à 90, ★★ à 75) | |
| 34 | Lot 44 : niveau 5 « Au casque », avec un casque sur la table | Avec CUE casque du morceau qui entre, on l'entend au casque et pas dans les enceintes, qu'il soit sur A ou sur B | |
| 35 | Lot 52 : les Premiers pas animés, en nouveau venu (fenêtre de navigation privée), la table branchée | Après « C'est parti », la musique s'entend étouffée, au casque comme dans les enceintes, et s'ouvre à chaque question ; à l'écran de la table, Vini saute de joie quand la table est reconnue ; « Commencer » fait le drop sur un temps, puis la musique s'éteint quand le niveau s'ouvre | |
Pour chaque ligne, noter : fonctionne, ne fonctionne pas, ou comportement bizarre (et lequel).

Dernière vérification complète : jamais faite depuis l'ajout des onglets (12 oct. 2026).
