# Vérification sur la vraie DDJ-FLX4

À refaire avant chaque mise en ligne qui touche au MIDI, à l'audio ou aux niveaux. Environ 5 minutes.
Les tests automatiques utilisent une fausse table : ils ne remplacent pas cette vérification.

Préparation : Chrome ou Edge, rekordbox fermé, table branchée en USB.

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
| 16 | Bouger une commande non utilisée (HI, crossfader, jog, pad) | Un message donne son canal et son numéro : les noter, ils serviront aux prochains exercices | |
| 17 | Lot 19 : brancher la FLX4 | La pastille affiche son nom **sans** « · à régler », pas de bandeau « Nouvelle table », les dessins de « Ma table » bougent dans le même sens que la table | |
| 18 | Lot 20 : niveau 1 en Mode Expert, avec le casque de la table, en appuyant sur PLAY bien en rythme (5 essais) | Les scores sont souvent au-dessus de 80 ; noter si l'écart est toujours « trop tard » ou toujours « trop tôt » (et de combien de ms) | |
| 19 | Lots 25 et 26 : niveau 6 « Le swap des basses » avec la vraie musique, au casque de la table | Les grosses caisses de A et B tombent ensemble (pas de « galop »), les deux morceaux ne sonnent pas faux ensemble, le volume est le même que pour la house du site | |
| 20 | Lot 31 : un niveau en entier au casque de la table, avec quelques gestes réussis et ratés, puis en Mode Expert | Les petits sons du jeu s'entendent sans couvrir la musique, la musique ne baisse pas d'un coup à chaque son, les sons ne gênent pas en Mode Expert (sinon : le bouton haut-parleur de l'en-tête les coupe) | |

Pour chaque ligne, noter : fonctionne, ne fonctionne pas, ou comportement bizarre (et lequel).

Dernière vérification complète : jamais faite depuis l'ajout des onglets (12 oct. 2026).
