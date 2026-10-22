# DJingood

Tu as une table et tu n'y connais rien : en deux semaines, tu fais tes premières vraies transitions propres avec ta musique.

À la première visite, la mascotte Vini pose trois questions (ton niveau, ta table, ton objectif du jour) et prépare l'un des trois parcours : « Grand débutant » (chaque bouton expliqué, un par un), « Apprenti DJ » (tout ouvert, en Mode Expert) ou « DJ confirmé » (le calage sans SYNC d'abord).

Le site est rangé en trois onglets :

- **Apprendre** : les leçons guidées, sur des morceaux d'entraînement faits pour s'enchaîner (le bon moment, le fader, la coupure, l'écho, le filtre, le swap des basses, et pour finir la transition complète).
- **S'entraîner** : défi du jour, variations, à l'oreille, mini-sets, sur les niveaux déjà joués dans Apprendre.
- **Passer au vrai** : import de la collection rekordbox (fichier XML, lu sur ton appareil, rien n'est envoyé), paires de morceaux recommandées, missions à faire dans rekordbox.

Les morceaux d'entraînement sont produits dans le navigateur (moteur de production maison : grosse caisse, charleys métalliques, réverb, sidechain, accords, mélodies, montées, plusieurs variantes par style), calculés en tâche de fond.

Dans les leçons, le choix « Vraie musique » fait jouer de courts extraits de vrais morceaux à la place : « Dj », « Like An Animal » et « The Power Of The Beat » de Play House, dans le domaine public (CC0, [Free Music Archive](https://freemusicarchive.org/music/play-house)). Les extraits du dossier `musique/` sont coupés pile sur un temps et ramenés à 124 BPM par `tests/vrais-morceaux.js`.

Un compte n'est pas obligatoire : sans lui, la progression reste dans le navigateur. Avec un compte (adresse e-mail ou Google), les étoiles, les XP, les badges et les quêtes suivent le joueur d'un appareil à l'autre.

## Utilisation

Ouvre le site dans Chrome ou Edge, branche ta table en USB (logiciel DJ fermé), puis va dans « Apprendre ». Le site reconnaît tout seul une quinzaine de tables de débutant (Pioneer DDJ-FLX4, DDJ-400, DDJ-SB3 et DDJ-200, Hercules Inpulse 200, 300 et 500 et Starlight, Numark Mixtrack Platinum FX et Pro FX, Party Mix et DJ2GO2 Touch, Roland DJ-505, Reloop Mixage) ; une autre table se règle pas à pas au premier branchement. Sans table, tout se joue aussi à la souris.
