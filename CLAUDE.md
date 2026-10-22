# DJingood (anciennement Coach DJ) — mémoire du projet pour Claude

À lire en premier dans toute nouvelle session. L'utilisateur (Nathan, francophone, débutant en code)
parle en français : répondre en français, sans jargon technique inutile.

**Plan et avancement côté utilisateur :** page Notion « DJingood — Plan et suivi » (ancien titre : Coach DJ)
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

## Pour reprendre (état au 17 oct. 2026, fin de session)
- **Nom définitif : « DJingood » (22 oct. 2026, décision de l'utilisateur, remplace « DJingo » du lot 21).** Renommé partout
  dans le texte affiché : pages, guide, Vini, fiches de table, rapports, README, présentation, fiche des testeurs, agents,
  maquettes et vidéos de `marketing/`. **Trois identifiants techniques gardent l'ancien nom et ne doivent jamais être
  renommés** : `djingo-1e1f4` (projet Firebase : le renommer couperait tous les comptes), `window.DJINGO_FIREBASE` et
  `__djingo-compte-repris`. Restent inchangés aussi, comme au lot 21 : les clés `coach-*`, le dépôt, l'adresse
  https://coach-bass-swap.vercel.app, et les noms de fichiers `marketing/video/djingo*.html`. **Le renommage est
  publié** (commit `6926ee5`, 22 oct. 2026, voir juste en dessous), avec le chapitre 6 masqué à ce moment-là.
   **Domaine `djingood.fr`
  acheté chez OVH le 22 oct. 2026** (dit par l'utilisateur ; c'est l'adresse écrite à la fin de la vidéo POV).
  **Le domaine marche, vérifié le 22 oct. 2026 au soir** : `djingood.fr` ET `www.djingood.fr` servent le site en
  HTTPS. Zone DNS finale, lue directement sur le serveur autoritaire d'OVH (`nslookup -type=A djingood.fr
  ns103.ovh.net`) : racine `A 76.76.21.21`, `www CNAME af685902ae9496e5.vercel-dns-017.com.`, et **plus aucun
  `AAAA`**. C'est l'`AAAA` d'OVH (`2001:41d0:301::29`) qui faisait tomber un visiteur sur « Site en construction »
  une fois sur deux, selon qu'il passait en IPv4 ou en IPv6 : **le supprimer était la correction**. Les pièges
  rencontrés en chemin, à se rappeler : OVH refuse un CNAME sur un nom qui a déjà un A, un AAAA ou un TXT
  (« CNAME and other data ») ; Vercel a DEUX pages « Domains », celle du compte et celle du projet, et seule
  celle du projet rattache vraiment le domaine (sinon Vercel répond 404 et ne fabrique pas de certificat) ;
  un cache DNS garde l'ancienne réponse plusieurs heures, donc **mesurer sur le serveur autoritaire**.
  Vérifier d'ici avec `nslookup` et `curl` plutôt que de croire l'interface. Procédure complète si c'est à
  refaire : il faut l'ajouter dans Vercel (projet `coach-bass-swap` → Settings → Domains), recopier
  dans la zone DNS d'OVH **les valeurs exactes affichées par Vercel** (elles changent avec le temps, ne jamais les
  donner de mémoire) en supprimant d'abord les enregistrements de parking d'OVH, puis — **piège qui casse tous les
  comptes** — ajouter `djingood.fr` et `www.djingood.fr` aux « Authorized domains » de Firebase
  (console → `djingo-1e1f4` → Authentication → Settings), sans quoi la connexion renvoie `auth/unauthorized-domain`.
  Une seule adresse en dur dans le site publié : `presentation.html` ligne 10 (`og:image`) ; sinon
  `COMPTE-FIREBASE.md` (étape 3) et `marketing/message-testeurs.md` (hors Git). Les images de `img/` sont
  des morceaux d'écran sans l'en-tête : aucun nom dedans (refaites quand même). **Pas encore fait** : vérifier les marques
  (INPI, EUIPO) avant d'acheter un domaine, et refaire les MP4 de `marketing/video/sortie/`, qui montrent l'ancien nom.
- **PUBLIÉ le 22 oct. 2026 (commit `6926ee5`), avec l'accord de l'utilisateur** : le nouveau nom **DJingood**,
  l'habillage (vinyles, barre d'onglets, « Jouer » orange) et le code du chapitre 6 **masqué**. 421 tests verts.
  **Gardien : feu rouge au premier passage**, et il avait raison : le chapitre 6 restait visible à trois endroits
  (deux dans « Mes progrès », un sur la carte de fin, qui promettait un chapitre introuvable). Corrigé, puis feu vert.
  Production vérifiée : titre « DJingood », `CH6_PRET = false` bien servi, le « DJ » violet en place, aucune erreur.
  **Pas commités, volontairement** : `.gitignore` (modifié en local) et `marketing/` (366 Mo, non ignoré par Git :
  **ne jamais faire `git add .`**, ajouter les fichiers un par un).
  **Reste à faire après cette mise en ligne** : la checklist `tests/CHECKLIST-FLX4.md` sur la vraie table (le lot
  touche `midi.js`, `audio.js`, `commandes.js`, `platines.js`, `niveaux.js`, `piste.js`), et refaire la vidéo POV
  si on veut qu'elle montre la nouvelle interface.
- **Chapitre 6 « Hot cues et boucles » FINI le 22 oct. 2026 au soir, sur la branche `lot-41-hotcues`, PAS PUBLIÉ** :
  `CH6_PRET = true`, une douzaine de défauts corrigés, 29 tests dans `tests/hotcues.spec.js` (détail dans l'entrée
  « Lot 41 repris et fini » plus bas). Gardien : feu orange, ses remarques corrigées. **Ordre de publication : le lot 37
  d'abord** (choix de l'utilisateur, branche `lot-37-parcours-adapte` dans la copie `Documents\coach-dj-lot37`), puis
  le chapitre 6 fusionné par-dessus (conflits attendus dans `niveaux.js`, `midi.js` et les tests parcours, clarte,
  avis), `npm test` et le gardien à refaire. **Rien ne part sans l'accord de l'utilisateur.** Captures dans
  `captures/lot41/` (hors Git). Jamais joué sur une vraie FLX4 : points 29 à 31 de la checklist.
- **Habillage « maquettes » (22 oct. 2026), d'après deux images envoyées par l'utilisateur** (`Parcours néon du DJing.png`
  et `Tableau de bord DJingo futuriste et musical.png`, dans ses Téléchargements). Il voulait « plus de vie, plus
  ludique », avec « l'orange et le violet qu'on voit un peu plus ». Fait, tout à la **fin de `styles.css`** (les
  couches héritées redéfinissent ces sélecteurs plus haut, il faut passer après) :
  **les niveaux sont des disques vinyles** (sillons, pastille centrale, arc de néon ; la couleur alterne orange /
  violet avec `--pastille` et `:nth-child`, le niveau en cours a un anneau complet qui tourne, coupé par
  `prefers-reduced-motion`) ; le disque **garde toujours son numéro** (avant, 3 étoiles affichaient un ★ à la place) ;
  **barre d'onglets** refaite façon maquette — **l'utilisateur a choisi de GARDER les quatre onglets** (Accueil ajouté,
  puis Apprendre, S'entraîner, Passer au vrai) avec une icône chacun et un soulignement violet, **et non les 3 onglets
  de la maquette**, qui auraient fait disparaître S'entraîner et Passer au vrai ; les numéros 1-2-3 des onglets sont
  devenus des icônes ; **« Jouer » passe à l'orange** (`--a`, relief `--a-edge`) et « Regarde d'abord » prend un contour
  violet ; « Pendant le niveau » numérote ses étapes dans des pastilles violettes ; barre d'XP et fil des niveaux en
  dégradé violet → orange ; `.lnum` en lavande. Nouveaux jetons dans `:root` : `--a-edge`, `--vinyle-*`.
  **Non repris de la maquette, à sa demande** : le fond d'écran et le logo au vinyle orange (Vini reste le logo).
  **Retours de l'utilisateur le soir même, tous appliqués** : la barre d'onglets est remontee **sur la ligne du logo**
  (le `<nav class="tabs">` est maintenant DANS `header.top`, les pastilles XP/table/Guide passent sur la ligne du
  dessous ; sous 980 px l'ordre s'inverse et les onglets defilent) ; le **D et le J de DJingood sont en violet**
  (`.brand-name .dj`, sur les trois pages) ; les **disques sont plus realistes** : six couches superposees
  (pastille, liseré de la pastille, brillance en diagonale, sillons fins, sillons profonds, corps du disque),
  liseré de lumiere sur le bord, halo colore sur l'arc de neon, **le disque du niveau en cours est plus gros**
  (x1,13) et **le fil passe derriere les disques**, centre sur eux (`top:41px` = padding 10 + la moitie de 66).
  Piege a retenir : si on change la taille des disques, **il faut rebouger ce `top`**, sinon le fil traverse les
  disques au lieu de relier leurs centres.
  **L'orange reste le langage de la platine A pendant une partie** (piste, potards, faders) : rien de cela n'a changé,
  l'orange des disques et du bouton « Jouer » est de la décoration, hors partie.
- **Vidéo TikTok « POV » en cours (22 oct. 2026), dans `marketing/video/` (hors Git).** Fichiers : `djingood-pov.html`
  (la vidéo, pilotée par `render(t)`), `texte-voix.md` (le texte que l'utilisateur doit lire), `voix.js` (mesure le
  volume de sa voix 30 fois par seconde → `son/voix.json` et `son/voix.js`). `rendu.js` sait maintenant mélanger une
  voix off (`window.VOIX_FICHIER`) avec la musique baissée dessous (sidechaincompress) ; sans voix, il se comporte
  comme avant. Rendu : `node marketing/video/rendu.js djingood-pov` → `sortie/djingood-pov-tiktok.mp4`.
  **Version 2 : 19,2 s**, 125 BPM, drop au temps 8 (3,84 s), musique « Dj » de Play House (CC0) à partir de 118,808 s.
  **Décisions de l'utilisateur, à ne pas défaire** : angle « POV : tu viens d'acheter une table » ; 100 % motion design
  (pas de capture du site) ; **deux couleurs seulement, l'ORANGE et le VIOLET** (il a refusé le vert et le bleu, en
  montrant une capture d'écran de référence) ; **Vini doit être présent, animé et PARLER** tout du long ; l'adresse
  affichée est **djingood.fr**. La v1 (27 s) a été refusée : accroche trop lente (4 s de carton qui s'ouvre), rythme
  trop lent, pas de voix. **Prochaine étape : l'utilisateur enregistre sa voix** (`son/voix.m4a`), puis
  `node marketing/video/voix.js` et on relance le rendu ; la bouche de Vini se cale sur le volume réel de sa voix.
  **Attention** : `marketing/` n'est jamais commité, donc ces fichiers n'existent que sur ce PC.
- **Lot 40 « Le calage » (chapitre 5) publié le 21 oct. 2026** (voir l'entrée « Lot 40 »). **Ensuite : le chapitre 6 « Hot cues
  et boucles »**, plan validé par l'utilisateur le 21 oct. : 7 niveaux (poser un repère, lancer depuis le repère, B attend en
  boucle, prolonger l'outro, la montée 16 → 8 → 4, le double drop, sans filet), note en millisecondes, **Quantize allumé
  aux niveaux 1 à 4 et éteint aux niveaux 5 à 7**, ouverture avec le chapitre 2 (14 étoiles au chapitre 1), morceaux du
  site au même tempo (pas de calage). Il faut aussi dessiner sur la piste les hot cues posés et la zone de la boucle.
- **Lot 39 « La table complète » publié le 20 oct. 2026** (voir l'entrée « Lot 39 »). Gardien : feu rouge, corrigé.
  **Les 12 nouveaux numéros MIDI de la FLX4** (DEFAULT_MAP) et ceux des molettes et des pads, relevés dans Mixxx et relus
  un par un par le gardien, **sont publiés avec l'accord explicite de l'utilisateur**, avant la checklist (points 21 à 26). Corrigés : sur téléphone, seules les commandes du niveau
  s'affichent (LANCE B et « Arrêter » sortaient de l'écran) ; pads de la FLX4 en BEAT LOOP rangés comme à l'écran (pads
  1 à 3 = 4, 8, 16 temps, pad 4 = sortie ; note 77 = RELOOP/EXIT) ; filtres de B à courbe plate (au neutre, le son de B ne
  bouge plus) ; valeur d'un potard de la table de mixage au survol ou quand il bouge ; CUE et PLAY aux couleurs de leur
  platine ; points 21 à 26 de la checklist. **Ensuite : le chapitre 5 « Le calage »**, plan présenté (7 niveaux :
  entendre le décalage, pousser/freiner, la bonne vitesse, la vitesse à l'oreille, au casque, lancer et caler, sans filet ;
  note continue, ★★★ sous 15 ms 85 % du temps). **L'utilisateur a dit oui aux quatre questions** : les 7 niveaux dans cet
  ordre, ouverture en même temps que le chapitre 2 (14 étoiles au chapitre 1), casque simulé (B tout bas dans les
  enceintes) sans sortie casque, seuils 15 / 25 ms à ajuster après ses essais sur la FLX4.
- **Lot 36 « Identité et interface » publié le 20 oct. 2026** (accord de l'utilisateur ; 353 tests verts, gardien : feu
  orange sans blocage). Voir l'entrée « Lot 36 » plus bas pour les décisions à ne pas défaire (l'orange reste la
  platine A, le violet reste la couleur de DJingood, la maquette de Lou n'est qu'une inspiration). **Prochain travail :
  le lot A « la table complète »** (voir la décision du 20 oct. juste en dessous), en commençant par chercher la
  liste MIDI officielle Pioneer de la FLX4 et par une maquette à montrer avant le code. Reste à refilmer la vidéo
  « La transition ratée » avant de la diffuser (« Jouer » a changé de place).
- **Lot 38 « Toutes les tables » publié le 20 oct. 2026** (accord de l'utilisateur ; 370 tests verts, gardien : feu rouge
  puis feu orange ; voir l'entrée « Lot 38 » plus bas). **Ensuite, lot A « la table complète »** : maquette
  montrée le 20 oct. (`captures/maquette-table/`, hors Git : deux platines avec molette, tempo, CUE, PLAY, 4 pads en
  HOT CUE ou BOUCLE ; table de mixage TRIM / HI / MID / LOW / FILTRE, CUE casque, vumètres, crossfader ; vue « Sans
  aides »). Trois questions posées, sans réponse encore : consigne repliée et seules les commandes du niveau allumées
  pendant une partie ; 4 pads ou 8 ; ordre de travail (son, puis table à l'écran, puis branchement sur les tables).
- **Nouveau début pensé pour le PC (18 oct. 2026), validé sur maquette par l'utilisateur** (lot à faire après le 36).
  L'écran s'appelle **« Prépare ta table »** (étapes : Toi · Ta table · Niveau 1), choix de l'utilisateur : ni « cabine »
  (jargon), ni « platine » (dans le site, une platine est une moitié de la table, A ou B). Constat : le début copiait
  Duolingo (appli de téléphone) alors que 90 % des joueurs seront sur PC avec la table en USB ; une dizaine d'écrans
  (6 questions, 4 de guide, la fiche PLAY) avant de toucher la table, qui n'est jamais branchée pendant ce temps.
  Proposition : accueil en grand → une seule question (« Tu as déjà mixé ? ») → **« Prépare ta table »** (navigateur,
  table reconnue toute seule avec l'autorisation MIDI demandée à ce moment-là, un geste qui fait bouger le dessin, test du
  son) → niveau 1 directement ; objectif du jour et compte après la première partie ; « Pourquoi tu veux mixer ? » retiré tant
  que rien ne s'en sert. **Maquette** (hors Git) : `captures/maquette-debut/index.html` (via `node tests/serveur.js`, barre
  « MAQUETTE » pour changer d'écran ou simuler une table ; dans Chrome, elle écoute la vraie table, jamais essayé) et
  ses captures dans `captures/maquette-debut/captures/`. À faire avant le lot 37, qui dépend des questions posées.
- **Décision du 20 oct. 2026 : monter beaucoup le niveau, avec tous les boutons de la table.** L'utilisateur veut
  qu'un DJ qui mixe depuis un an trouve les exercices difficiles. Le site reste un **jeu pour s'entraîner** (on ne
  remplace pas rekordbox, pas de mode « mix libre »), mais les exercices notés doivent se servir de toutes les
  commandes. Ordre validé : **A. la table complète** (aigus/médiums/basses et TRIM sur A et B, crossfader, tempo,
  molette, CUE casque, 4 hot cues, boucles 4/8/16/32 + exit, à l'écran et sur la FLX4 ; numéros MIDI pris dans la
  liste officielle Pioneer puis confirmés par « Vérifier ma table », jamais inventés ; maquette à montrer avant le
  code) → **B. chapitre 5 « Le calage »** (tempos différents, B ne se cale plus tout seul, calage au casque, décalage
  mesuré tout du long) → **C. chapitre 6 « Hot cues et boucles »** → **D. chapitre 7 « Comme en club »** (note
  continue sur 100 : basses doublées, creux/bosses de volume, décalage ; aucune aide). Les chapitres 1 à 4 ne
  changent pas. Le **test de placement** (aujourd'hui tout ou rien, 3 épreuves, aucun niveau annoncé) sera refait
  après, quand il y aura ces niveaux à mesurer ; question laissée ouverte : un niveau validé par le test vaut-il
  2 étoiles ou est-il seulement sauté ? **SoundCloud « Free Download »** : expliqué à l'utilisateur que ce n'est
  pas une licence (accord écrit de l'artiste ou CC0 / CC BY nécessaire) ; il se renseignera plus tard.
- **Ensuite : l'étape 4 du plan Notion, tester avec 3 à 5 débutants.** Le compte est fini
  et **essayé par l'utilisateur sur la production** : Google, création par e-mail, reconnexion, progression retrouvée
  dans un autre navigateur. `README.md` et la question « Faut-il créer un compte ? » de `presentation.html` en parlent.
  Le **message à envoyer aux testeurs** attend toujours dans `marketing/message-testeurs.md` (hors Git) : il n'a été
  envoyé à personne, c'est à l'utilisateur de choisir ses testeurs. Quand les rapports arrivent, les lire ensemble et
  en tirer la liste des corrections. **Ne jamais se connecter à sa place, ni inventer de clés Firebase.**
  Ne jamais ajouter `.gitignore` (modifié localement pour `marketing/video/sortie/`) ni `marketing/` à un commit.
- **Tout est en ligne** : étapes 1 à 3 du plan Notion, puis lots 0 à 21, 23 à 26 et 28 à 35 (quiz et badges, outils pour les testeurs, clarté pour les débutants, objectif du jour,
  page de présentation, rangement des écrans, Passer au vrai étape par étape, niveaux plus courts, chapitre 4
  « Les combos », ralenti des combos, thème « Cabine pure », « Passer au vrai » visuel, clarté pour un vrai
  débutant et fiches « Découvre ce bouton », autres tables et schéma vivant, Mode Expert, nouveau nom DJingood, « Mes progrès » refait, vraie musique, nouvel ordre du chapitre 1, Premiers pas avec Vini, « Ça bouge », quêtes du jour, Vini sur l'accueil et sons, Vini partout, prêt pour les testeurs, compte Google, écran de compte ;
  le lot 22 a été abandonné, le lot 27 est une direction artistique sans code). `main` = `origin/main`, à une
  note de documentation près (ce fichier), à envoyer avec le prochain lot.
- **En attente côté utilisateur, rien n'a été fait** : la vérification de la vraie FLX4. Elle se fait maintenant
  **dans le site** : « Ma table » → « Vérifier ma table pas à pas » (20 étapes, 10 min, lot 33) ; `tests/CHECKLIST-FLX4.md`
  reste la version papier. Aucun lot n'a été vérifié sur la table. À relire en particulier : le schéma de
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
- **Lot 21 (15 oct. 2026)** : branche `lot-21-djingo` (partie de `lot-20-expert`), non publiée. **Nouveau nom : « DJingo »**
  (décision de l'utilisateur ; devenu « DJingood » le 22 oct. 2026, voir le lot 42) dans les pages, le guide, le rapport des
  testeurs, la présentation, la fiche des testeurs, le README, les agents. Les noms internes ne changent pas : clés `coach-*`,
  dépôt, adresse https://coach-bass-swap.vercel.app (changer d'adresse ou de nom de projet Vercel est une décision à part).
  Avant d'acheter un domaine ou un logo, vérifier les marques (INPI, EUIPO) et la proximité avec « Duolingo ».
  Images de la présentation refaites.
- **Vidéo DJingood (15 oct. 2026)**, dans `marketing/` (hors Git) : `marketing/video/djingo.html`, animation sans capture du site
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
  Après le gardien : sur Mes progrès, la dernière phrase donne la prochaine étape (les XP étaient déjà écrits dessous) ; dans Passer
  au vrai, Vini ne promet pas de paire s'il n'y en a aucune, et dit « une autre paire » après « Une autre paire ».
  Nouveau `tests/vini-partout.spec.js`. 297 tests verts.
- **Lot 32 publié le 16 oct. 2026** (accord de l'utilisateur ; gardien : feu orange). Production vérifiée (phrases de Vini sur les
  quatre pages, mission cochée = Vini qui saute, aucune erreur). Notion à jour. La suite de tests prend maintenant 7 à 11 minutes :
  la lancer en arrière-plan. Prochaines étapes possibles : prêt pour les testeurs (fiche, message, vérification guidée de la FLX4),
  plus de vraie musique, nouveaux exercices (il faut les numéros MIDI du point 16).
- **Lot 33 « Prêt pour les testeurs » (17 oct. 2026)** : branche `lot-33-testeurs`, non publiée. **Vérifier ma table** (`js/verif.js`,
  chargé après `reglage`) : la checklist FLX4 guidée pas à pas, ouverte depuis une carte en haut de « Ma table » (`.tverif`, `#tVerif`,
  visible seulement avec une table prête à jouer ou une vérification commencée). Fenêtre `#verif`, 20 étapes `VF_STEPS` : `auto`
  (table reconnue, faders, LOW, MID et filtre, boutons : cochés tout seuls quand la commande va d'un bout à l'autre ou est pressée ;
  le filtre et ON de l'effet, sans réglage d'origine, sont appris au passage par `vfApprend` : le premier message inconnu du bon
  type), `capture` (crossfader, HI A et B, TRIM A, tempo A, molette A, CUE, pad 1, BEAT SYNC : **le site relève leur numéro MIDI**
  dans `vf.midi` sans s'en servir ; potard = 3 valeurs, second message « fin » ignoré, molette = 6 messages, bouton = deux fois le
  même ; « Je n'ai pas cette commande »), `branche` (débrancher puis rebrancher, `verifBranche` appelé par `initMidi`), `manuel`
  (dessin de la table avec `tableSvg`, son au casque avec « Écouter » = 4 s de vraie musique, scores du Mode Expert au casque,
  vraie musique calée, sons du jeu ; « Aller jouer » ouvre le niveau et garde l'étape), puis bilan. Pendant la fenêtre, `onMidi`
  passe la main à `verifMidi` (les positions `phys` restent retenues). Clé `coach-verif` (`i`, `res`, `res2`, `note`, `midi`,
  `fini`, `nom`), validée à la lecture, **gardée par « Tout recommencer à zéro »**. « Copier le rapport » et le rapport des testeurs
  (`verifResume`) donnent chaque étape, les numéros relevés et les réglages utilisés. Fiche `testeurs.html` à jour (questions de
  Vini, rekordbox fermé, casque et son, section « Tu as une DDJ-FLX4 ? 10 minutes de plus »). Nouveau `tests/verif.spec.js` ; écrans
  `18-verifier-liste` et `19-verifier-questions` dans `tests/captures.js`. Le bilan compte « à regarder » une réponse autre que
  la première (la bonne) ou « ne marche pas » ; une commande absente ou une étape passée n'en est pas. Une autre table réglée pas à
  pas passe l'étape 1 (« Elle est réglée et prête à jouer ») ; le nom de la table est gardé (`vf.nom`) et écrit dans le rapport.
  **À vérifier sur la vraie FLX4** (c'est justement à ça que sert la vérification) : que le filtre (CFX) et ON de l'effet
  s'apprennent bien au passage, et les numéros relevés pour crossfader, HI, TRIM, tempo, molette, CUE, pad, BEAT SYNC
  (le point 16 de la checklist se fait maintenant par cette vérification). `tests/CHECKLIST-FLX4.md` renvoie vers la
  vérification guidée pour son point 16 au lieu de demander de noter les numéros à la main.
- **Lot 33 publié le 17 oct. 2026** (accord de l'utilisateur ; 305 tests verts, gardien : feu orange, rien de bloquant).
  Production vérifiée : `js/verif.js` servi, aucune erreur dans la console, 20 étapes plus l'écran de bilan (`VF_N` = 20,
  `VF_STEPS` en a 21), carte « Tester ta table » bien cachée sans table branchée, fiche des testeurs à jour. Notion à jour.
  **Message aux testeurs** prêt dans `marketing/message-testeurs.md` (hors Git), pas encore envoyé.
  **Cinq détails signalés par le gardien, laissés tels quels, à reprendre si un testeur s'y cogne** : 1. l'étape « Aller jouer
  Le swap des basses » n'impose pas le style « Vraie musique » (c'est le défaut, mais un testeur passé à « House » jouerait
  sans le savoir) ; 2. l'étape Mode Expert le laisse allumé après la vérification ; 3. le dessin recopié dans la fenêtre réagit
  au survol mais pas au clic (les clics sont branchés sur `#tSvg` seulement) ; 4. appuyer plusieurs fois sur « Écouter »
  superpose les extraits ; 5. `vfApprend` prend le **premier** message inconnu : une autre commande bougée au mauvais moment
  peut être prise pour le filtre (rattrapable par « Revenir aux réglages de la DDJ-FLX4 »).
- **Lot 34 « Compte DJingood » (17 oct. 2026)** : branche `lot-34-compte`, non publiée. Demande de l'utilisateur : créer un compte et
  se connecter avec Google, et que la progression (XP, niveaux, étoiles, badges, quêtes) suive le compte au lieu de rester
  dans le navigateur. `js/compte.js` (chargé **après `avis`**, avant `demarrage`) :
  - **Firebase chargé à la demande** (3 scripts `*-compat.js` depuis gstatic, version `CPT_SDK`), seulement quand on se
    connecte ou qu'on était déjà connecté : la page reste aussi rapide qu'avant pour tous les autres. `cptSdk()` ne charge
    rien si `window.firebase` existe déjà — c'est le point d'accroche des tests.
  - **Un seul point d'enregistrement** : `localStorage.setItem` et `removeItem` sont enveloppés ici (`cptBrut` garde les
    vraies fonctions, et l'enveloppe est dans un `try` : un navigateur qui refuse le stockage ne doit rien casser).
    Les 55 endroits qui enregistrent la progression dans les 18 autres fichiers ne changent pas. Toute écriture d'une
    clé suivie marque `cptSale` et déclenche un envoi 2,5 s plus tard (`cptBientot`), plus un envoi immédiat quand
    l'onglet passe en arrière-plan ou se ferme.
  - **On ne renvoie rien avant d'avoir comparé** (`cptBloque`, vrai à chaque chargement). `cptSync()` relit d'abord le
    document du compte, puis décide : compte neuf **ou compte sans rien de gagné** → on envoie ce qu'il y a ici ;
    `maj` identique à `cptMaj` → personne n'a avancé ailleurs, on débloque ; rien de gagné ici (`cptVide`) → on reprend
    celle du compte ; on était à jour et le compte a bougé (`cptMaj` connu, rien de sale) → on reprend celle du compte ;
    les deux ont vraiment gagné quelque chose → **on demande** (`cptAttente`, la pastille affiche « Prénom · »).
    **C'est le point le plus important du lot** : sans lui, un deuxième appareil renvoyait sa vieille progression
    par-dessus celle du compte au bout de quelques secondes, sans que le joueur touche à rien (défaut trouvé par le
    gardien, reproduit puis couvert par `tests/compte.spec.js` → « Un deuxième appareil »).
  - `coach-compte` garde `{ uid, prenom, maj, sale }` : `maj` = l'horodatage du dernier document écrit ou repris par
    cet appareil, `sale` = des changements locaux pas encore enregistrés. C'est ce couple qui permet de distinguer
    « le compte a avancé ailleurs » de « j'ai avancé hors ligne ».
  - **Au retour de la progression du compte, la page est rechargée** (`cptEcrit` puis `location.reload()`) : chaque fichier
    de `js/` lit sa progression au chargement, c'est la seule façon sûre de la faire prendre partout.
  - **La connexion manuelle et la reprise de session suivent le même chemin** : tout passe par `onAuthStateChanged`
    (`cptChange`) puis `cptSync()`. Il n'y a pas de fonction séparée pour le premier cas.
  - **Ce qui ne suit pas le compte** (`CPT_LOCAL`) : `coach-midi-map`, `coach-table`, `coach-verif`, `coach-collection`,
    `coach-bibliotheque`, `coach-sons`, `coach-compte`, `coach-journal` et **`coach-ordre`**. `coach-journal` compte le
    temps toutes les 15 s : le suivre ferait un envoi toutes les 15 s par onglet, pour rien (le rapport des testeurs se
    copie depuis l'appareil de toute façon). `coach-ordre` n'est pas de la progression mais le **format** des données du
    navigateur (lot 26) : s'il voyageait et revenait absent d'un paquet, `ordreMigre` déplacerait les étoiles une deuxième
    fois et les fausserait. Deux défauts trouvés par les tests et par le gardien, corrigés avant d'aller plus loin.
  - Données **dans le document de progression** : identifiant, prénom, progression. Pas l'adresse e-mail : elle reste
    du côté de l'authentification Firebase (voir le lot 35, qui ajoute les comptes par e-mail). Un document par joueur dans la
    collection `joueurs`. Règles de sécurité dans `firestore.rules` : chacun seulement sur son document, tout le reste
    fermé. **Pas de limite de taille dans les règles** : `request.resource.size()` n'existe pas côté Firestore (c'est
    une notion de Firebase Storage) et la console refuse de publier ; le garde-fou est `CPT_MAX` côté site.
  - « Tout recommencer à zéro » efface aussi le document du compte (`cptOublie`, appelé par `avisReset`) et déconnecte,
    sinon la progression reviendrait au rechargement. **Hors ligne, Firestore ne répond jamais** : au bout de `CPT_FIN`
    (3 s) on efface et on recharge quand même, pour que le bouton ne reste jamais sans effet. De la même façon, un envoi
    qui traîne plus de `CPT_LENT` (5 s) affiche « ta progression sera enregistrée dès que tu seras en ligne ».
  - Bouton `#cptBtn` dans l'en-tête (violet quand on est connecté, avec le prénom), fenêtre `#compte`, écran `20-compte`
    dans `tests/captures.js`, nouveau `tests/compte.spec.js` (faux Firebase posé avant le chargement : le vrai chemin du
    code est parcouru, connexion, lecture, écriture et rechargement compris).
  - **Configuration Firebase remplie le 18 oct. 2026** par l'utilisateur : projet `djingo-1e1f4`, palier Spark (gratuit),
    `CPT_CFG` en haut de `js/compte.js`. Ces valeurs ne sont pas des secrets : la sécurité vient de `firestore.rules`.
    Vérifié dans le navigateur : les trois scripts Firebase se chargent depuis gstatic, le SDK s'initialise, aucune
    erreur. **La connexion Google elle-même n'a pas été essayée** (c'est le compte de l'utilisateur, à lui de le faire).
    `window.DJINGO_FIREBASE` permet toujours d'essayer un autre projet sans modifier le fichier, et c'est ce que font
    les tests. **À confirmer avec l'utilisateur avant toute mise en ligne** : les règles de `firestore.rules` publiées
    (étape 5 de `COMPTE-FIREBASE.md`) et `coach-bass-swap.vercel.app` ajouté aux « Authorized domains » (étape 3) —
    sans ce dernier, la connexion marche en local mais échoue en production.
  - **Garde-fou contre le rechargement en boucle** (`cptReprend`, défaut trouvé par le gardien : 321 rechargements en
    8 secondes, sans aucune donnée abîmée). Reprendre la progression du compte se termine par `location.reload()` ;
    si le navigateur n'arrive pas à retenir où on en est (stockage plein ou refusé) ou si on a déjà repris dans cet
    onglet (marque `CPT_TOUR` dans `sessionStorage`), le chargement suivant reprendrait la même décision et la page
    se rechargerait sans fin. Dans ce cas on garde ce qui vient d'être écrit, on ne recharge pas, et la fenêtre dit
    de recharger soi-même. `cptSync` traite aussi un document de compte sans rien de gagné (`cptPoids(d) === 0`)
    comme un compte neuf, pour la même raison.
  - **Hors ligne** : `cptSync` échoue → on reste bloqué (rien ne doit partir avant d'avoir comparé), la fenêtre dit
    pourquoi (`cptSouci`) et un écouteur `online` refait la comparaison dès que la connexion revient. « Tout
    recommencer à zéro » **renonce et n'efface rien** si le document du compte n'a pas pu être supprimé (`cptOublie`
    renvoie `false`, `cptResetKo` l'explique) : mieux vaut ne rien faire que promettre un effacement qui n'a pas eu
    lieu. Se déconnecter marche quand même (course avec `CPT_FIN`).
  - **Limites connues, à dire à l'utilisateur** : la comparaison n'a lieu qu'**au chargement de la page**, donc deux
    appareils joués en même temps ne fusionnent pas — le dernier qui enregistre gagne, et l'autre perd sa séance au
    rechargement suivant. Et si le navigateur refuse d'écrire `coach-compte`, le compte ne se reprend pas tout seul
    au chargement : il faut recliquer sur « Se connecter ».
  - **`cptPoids(d)` : ce qui est vraiment gagné** (étoiles des 5 clés, badges, questions trouvées, records Expert,
    coffres ouverts et compteurs du jour, jours d'objectif atteints, missions faites, test de placement). Il a remplacé
    un test « est-ce que ces clés existent ? » (ancien `CPT_RIEN` / `cptPlein`), qui était faux : **un appareil tout neuf
    écrit déjà `coach-parcours`, `coach-quetes` et `coach-objectif` avant même la connexion**, à la fin des Premiers pas
    et au premier affichage de l'accueil. Le site croyait donc qu'il avait « une progression » et proposait de remplacer
    celle du compte par du vide — un clic sur « Garder celle de cet ordinateur » et les étoiles étaient perdues
    (troisième feu rouge du gardien). Avec un poids, **la question n'est posée que si les deux côtés ont vraiment gagné
    quelque chose** : aucun des deux choix ne peut remplacer une vraie progression par du vide.
  - `testeurs.html` dit maintenant que la progression part sur le compte si on se connecte.
  334 tests verts (29 pour le compte).
  **Gardien : feu rouge aux trois premiers passages**, et il avait raison les trois fois. 1. Le deuxième appareil qui
  écrasait le compte, `request.resource.size()` qui n'existe pas dans les règles Firestore, « Tout recommencer à zéro »
  sans effet hors ligne. 2. Le rechargement en boucle (321 rechargements en 8 secondes), l'effacement hors ligne qui
  promettait à vide, la fenêtre bloquée sur « Vérification… » sans réseau. 3. L'appareil neuf à qui on proposait
  d'écraser le compte avec du vide. Tout est corrigé et couvert par des tests ; **chaque défaut a son test**, pour
  qu'aucun ne puisse revenir.
- **Lot 34 publié le 18 oct. 2026** (accord de l'utilisateur ; 334 tests verts, gardien : feu orange au quatrième
  passage, après trois feux rouges corrigés). L'utilisateur a confirmé avoir publié les règles de `firestore.rules`
  et ajouté `coach-bass-swap.vercel.app` aux « Authorized domains ». Production vérifiée : `js/compte.js` servi, la
  configuration `djingo-1e1f4` en place, le bouton « Se connecter » affiché, les trois scripts Firebase chargés depuis
  gstatic, le SDK initialisé, aucune erreur dans la console. **La connexion Google n'a pas été essayée** (compte de
  l'utilisateur). Captures dans `captures/lot34/` (hors Git) : pas connecté, connecté, et la question des deux
  progressions. Restent à écrire quand l'utilisateur aura confirmé que ça marche : une phrase dans `README.md` et une
  sur `presentation.html` (« ta progression te suit d'un appareil à l'autre »).
- **Lot 35 « Écran de compte » (18 oct. 2026)** : branche `lot-35-ecran-compte`, non publiée. Deux demandes de
  l'utilisateur après avoir essayé le lot 34 : « une interface normale de création de compte », avec « créer » et
  « se connecter » séparés, et « pas mal de lenteur » à la connexion.
  - **Pourquoi c'était un vrai sujet** : avec Google seul, « Créer un compte » et « Se connecter » sont la **même
    action** (Google crée le compte tout seul la première fois). L'utilisateur a choisi, parmi trois options,
    d'ajouter **l'e-mail et le mot de passe** : c'est ce qui donne deux vrais chemins.
  - **La fenêtre `#compte` est devenue un petit parcours** : `cptPas` vaut `accueil` (ce que le compte apporte +
    « Créer mon compte » / « J'ai déjà un compte »), `creer` (prénom, e-mail, mot de passe), `entrer` (e-mail, mot de
    passe, « Mot de passe oublié ? ») ou `oubli` (e-mail seul). `cptVa(pas)` change d'écran, `cptRend()` adapte titre,
    champs, bouton et bascule. Google reste proposé en raccourci sous un trait « ou ». Échap revient d'abord à
    l'accueil de la fenêtre avant de la fermer, pour ne pas perdre ce qu'on tapait.
  - **E-mail et mot de passe** : `cptCreer` (avec `updateProfile` pour garder le prénom, qui sert à Vini et à la
    pastille), `cptEntrerMail`, `cptOubliMdp` (lien de réinitialisation envoyé par Firebase). `cptEnvoyer` vérifie
    **avant** d'appeler Firebase (adresse, mot de passe d'au moins `CPT_MDP_MIN` = 6, prénom) : les messages sont plus
    clairs et rien ne part pour rien. Bouton « Voir » pour afficher le mot de passe ; le champ est vidé à la fermeture.
    `cptErreur` traduit en plus les codes `email-already-in-use`, `invalid-email`, `weak-password`, `user-not-found`,
    `wrong-password`, `too-many-requests` et `operation-not-allowed`.
    **Il faut activer « E-mail/Mot de passe »** dans la console Firebase (Authentication → Sign-in method), sinon
    Firebase répond `auth/operation-not-allowed` — et le site le dit en clair.
  - **Vitesse** : Firebase est coupé en deux, `cptSdkAuth()` (app + auth, **49 Ko**) et `cptSdkDb()` (firestore,
    100 Ko). La fenêtre Google n'a besoin que de la première, la base ne sert qu'une fois connecté : **66 % de moins
    à attendre au clic**. En plus, la connexion est préparée à l'avance (`requestIdleCallback`, repli `setTimeout`)
    dès que la page est tranquille, donc le clic est immédiat.
  - **Deux défauts trouvés par les tests et corrigés** : après une déconnexion, la fenêtre restait sur le formulaire
    au lieu de revenir à l'accueil ; et se reconnecter au même compte sur le même appareil reposait la question
    « laquelle tu gardes ? » alors que rien n'avait changé — `cptSauve` était figé au chargement de la page, il est
    maintenant tenu à jour par `cptNote()`, et `cptSync` ne demande plus rien quand les deux paquets sont identiques.
  - **Gardien : feu orange, aucun blocage.** Il a créé un vrai compte avec un mot de passe repérable et vérifié
    qu'il n'est nulle part (ni stockage, ni document en ligne, ni rapport des testeurs, ni adresse de page), et a
    passé en revue les 16 combinaisons d'écrans. **Deux vrais défauts trouvés et corrigés** : sur « Mot de passe
    oublié », le bouton « Revenir à la connexion » menait à la création ; et `cptPas` était remis à `accueil` à
    chaque fois que Firebase annonçait « personne », donc le formulaire disparaissait tout seul pendant qu'on le
    remplissait dans les premières secondes de la page (c'est maintenant dans le `if (avait)`). Quatre petits points
    aussi : les liens restent désactivés pendant une opération, la comparaison des deux paquets trie les clés
    (Firestore ne les rend pas dans le même ordre, elle ne servait donc à rien), le préchargement attend qu'aucune
    partie ne tourne, et les textes sur l'e-mail ont été remis d'accord.
  - Écrans `21-compte-creer` dans `tests/captures.js`, et les six écrans dans `captures/lot35/` (hors Git). 344 tests verts, 39 pour le compte (le faux Firebase sait créer un compte
    par e-mail, se connecter et envoyer un lien de réinitialisation).
- **Lot 35 publié le 18 oct. 2026** (accord de l'utilisateur ; 348 tests verts, gardien : feu orange sans blocage).
  L'utilisateur a activé « E-mail/Mot de passe » dans la console Firebase avant la mise en ligne. Production vérifiée :
  seuls `firebase-app-compat.js` et `firebase-auth-compat.js` sont préchargés (49 Ko), **Firestore n'est pas chargé**
  tant qu'on ne se connecte pas, les quatre écrans s'enchaînent et « Revenir à la connexion » mène bien à la connexion,
  aucune erreur dans la console. **Essayé par l'utilisateur le 18 oct. 2026 sur la production** : création d'un compte
  par e-mail, reconnexion et progression retrouvée — tout marche. Seul « Mot de passe oublié » posait problème
  (voir la correction juste après).
- **Correction du 18 oct. 2026, après l'essai de l'utilisateur** (branche `correction-mail-francais`). Il a tout essayé :
  création de compte par e-mail, reconnexion et progression retrouvée **marchent**. Trois soucis sur l'e-mail de
  « mot de passe oublié », tous les trois sur le même mail :
  - **Il arrivait en anglais** : Firebase envoie dans la langue qu'on lui donne, et on ne lui donnait rien.
    `cptFb.auth.languageCode = 'fr'` dans `cptSdkAuth`. Un test le vérifie.
  - **Le lien n'était pas cliquable** : ce n'est pas un défaut du site, Gmail désactive les liens des messages mis en
    indésirables. Le message du site l'explique maintenant et dit de marquer le mail comme « non indésirable ».
  - **Il arrive dans les indésirables** : l'expéditeur est `noreply@djingo-1e1f4.firebaseapp.com`, un domaine qui
    n'appartient pas au projet et n'a aucune réputation. **Ne se corrige pas dans le code.** La vraie solution est de
    brancher un domaine à soi comme expéditeur (Authentication → Modèles → « Personnaliser le domaine »), ce qui
    suppose d'acheter le domaine DJingood — et donc de **vérifier d'abord les marques INPI et EUIPO** (proximité avec
    « Duolingo », déjà notée au lot 21). Décision laissée à l'utilisateur ; en attendant, le site prévient.
- **Lot 36 « Identité et interface » (18 oct. 2026)** : branche `lot-36-vini-identite`, **non publiée**. L'utilisateur a
  envoyé un **brief de direction artistique** (3 parties : projet, direction générale, palette) puis un complément sur
  l'interface. Le brief lui-même est arrivé **tronqué** (il s'arrête au milieu de la liste « Éviter », sur « * Un ») :
  s'il existe une partie 4 ou 5 (typographie, composants, animations), elle n'a jamais été reçue — à redemander.
  - **Ses décisions, prises en répondant à mes questions** : la maquette que son amie Lou lui a envoyée (bleue, avec
    une autre structure : « Les gestes », « Ta formation » en 3 cartes, « 66 gestes ») est **une simple inspiration**,
    pas une direction à suivre — la structure du site ne change pas. Le **violet** reste la couleur de DJingood (pas le
    bleu de la maquette, qui veut dire « platine B »). **Vini devient le représentant général du site.** Le logo qu'il
    a envoyé est une inspiration, il n'a pas tranché.
  - **Palette alignée sur le brief** : `--bg` `#0B0E16`, `--brand` `#7C4DFF`, `--brand-light` `#B89BFF`,
    `--vini-cream` `#FFF7E6`, `--line` `#3A3F56` (« ardoise »), et les gris passés au même bleu-noir.
    **`--on-brand` est passé au blanc** : le violet du brief est plus sombre que l'ancien, et le texte foncé tombait à
    4,0 de contraste au lieu des 4,5 exigés (en blanc : 4,8). Vérifié par calcul, pas à l'œil.
  - **L'orange du brief n'a PAS été appliqué aux boutons**, et l'utilisateur l'a confirmé explicitement : l'orange veut
    dire **platine A** et le bleu **platine B** dans les leçons. C'est un langage appris, pas une décoration. Les
    récompenses gardent le doré. **Ne pas appliquer cette partie du brief à la lettre.**
  - **Vini est la marque** : nouveaux `img/vini-logo.svg` (avec le casque, pour l'en-tête) et `img/vini-icone.svg`
    (plus gras, sans casque : à 16 px le casque mange la largeur et le visage disparaît). L'en-tête affichait jusque-là
    un **carré orange** (reste de l'ancien thème, qui contredisait la règle ci-dessus) et le site **n'avait aucune
    icône d'onglet**. Les deux sont corrigés sur `index.html`, `presentation.html` et `testeurs.html`. La classe
    `.disc` a disparu, remplacée par `.blogo`.
  - **`tests/serveur.js` ne connaissait ni le SVG ni les images** : une image SVG servie en `application/octet-stream`
    ne s'affiche pas du tout (contrairement au JPEG, que le navigateur devine). L'icône n'aurait marché qu'en ligne.
  - **L'écran d'un niveau, rangé en cartes** (4 demandes de l'utilisateur, toutes acceptées) : la cause du désordre
    était que **`.actionbar` était collée en bas (`position:sticky`) même sur ordinateur**, donc elle flottait
    par-dessus les contrôles. Nouveau découpage dans `index.html` : `.consigne` (carte), `.bottom` qui contient
    `.deck` (carte « Ta table » : LANCE B, potards, faders) et `.bside` (`.start-row` + `.actionbar`). « Jouer »
    (`.start`) devient violet et large, « Regarde d'abord » (`.watch`) un contour discret. Les règles sont à la
    **fin** de `styles.css` : les couches héritées redéfinissent `.start` et `.watch` deux fois, il faut passer après.
  - **Où est « Jouer » (corrigé après le gardien du 19 oct. 2026)** : au-dessus de 1040 px, `.stage` est une **grille**
    et `.stage-head`, `.bottom` et `.bside` sont en `display:contents` (leurs enfants se rangent dans la grille) :
    consigne à gauche ; à droite Vini, le compte à rebours, la « Position de départ » et la barre d'action ; puis la
    piste et « Ta table » sur toute la largeur. Quand on choisit un niveau, `stageIntoView` monte la scène en haut de
    l'écran : « Jouer » est dedans, même en 1366 × 768 avec la position de départ. En dessous de 1040 px, `.bottom` et
    `.bside` restent en `display:contents` pour que `.actionbar` soit un enfant direct de la scène : **une barre collée
    (`sticky`) ne sort jamais de la boîte qui la contient**, et rangée dans une colonne, elle ne collait plus en bas.
  - **Priorité à l'ordinateur** (dit par l'utilisateur le 18 oct. 2026) : **90 % des joueurs seront sur PC**, parce
    qu'il faut y brancher la table en USB. Le téléphone doit rester utilisable, mais **ce n'est jamais lui qui décide
    d'un choix de mise en page**. À garder en tête pour tout travail d'interface.
  - **Gardien, 19 oct. 2026 : feu rouge** (350 tests verts, mais un recul mesuré à la taille réelle de l'écran) :
    « Jouer » était sous le bas de l'écran d'un PC 1366 × 768 (85 px au niveau 1, 630 px avec la « Position de
    départ »), et la barre ne collait plus en bas sur téléphone. **Les captures pleine page ne le montraient pas** :
    pour juger un écran de niveau, toujours regarder une capture à la taille de l'écran. Corrigé (voir « Où est
    « Jouer » » ci-dessus), deux tests dans `tests/clarte.spec.js` qui échouent sur l'ancienne mise en page. Corrigés
    aussi : l'étiquette « Temps » de la carte de fin (texte `--ink` sur le nouveau violet : 4,0 de contraste, passée en
    `--on-brand`), la pulsation de « Jouer » prêt (ancien gris et blanc → violet), « Regarde d'abord » grisé qui
    changeait de couleur au survol, `--disc-in` qui ne servait plus. Images de la présentation refaites.
    Captures : `captures/lot36-final/` (pleine page) et `captures/lot36-jouer/` (taille réelle, avec et sans table).
- **Correction ajoutée au lot 36 (20 oct. 2026), signalée par l'utilisateur avec sa table** : à « La transition
  complète » (chapitres 1 et 2), la position de départ demandait le LOW de B **à midi**, puis la première consigne
  disait de le couper. Il est maintenant **coupé dès la position de départ** (`init.lowB` = 0), comme au swap ; même
  chose pour les combos « La transition éclair » et « Le grand mix » (`ideal4` ne remonte plus le LOW de B avant de
  le recouper). La note « Basses de B coupées avant de le lancer » reste (elle vérifie qu'on ne l'a pas rouvert).
  Test ajouté dans `tests/fiches.spec.js`.
- **Vidéo « La transition ratée » (18 oct. 2026)**, dans `marketing/video/` (hors Git), mode d'emploi dans
  `video-transition.md`. Suit la **partie 8 du brief** (direction artistique des vidéos, reçue ce jour-là ; les parties
  4 à 7 n'ont jamais été reçues) : vrai problème de débutant → vrai site → ce qu'on apprend → Vini, logo, appel. 25 s,
  vertical. **Les images du site sont de vraies parties**, filmées par `tournage.js` avec une **horloge virtuelle**
  (`performance.now`, `requestAnimationFrame`, minuteries, `ac.currentTime` et animations CSS remplacés : 1/60 s par pas,
  quelle que soit la durée d'une capture) et la fausse DDJ-FLX4 des tests ; `bande-son.js` rejoue le moteur audio du
  site hors ligne avec les mêmes gestes ; `transition-montage.js` donne le minutage aux deux. **Filmée sur la branche
  `lot-36-vini-identite`** : à publier avant de diffuser la vidéo, sinon le site en ligne n'aura pas le même écran.
  **Validée telle quelle par l'utilisateur le 18 oct. 2026** (`sortie/djingo-transition-tiktok.mp4`). Pas encore postée.
  **Attention** : filmée avant que « Jouer » monte à côté de la consigne (correction du 19 oct.) ; si on la voit dans
  la vidéo, elle ne correspond plus au site. `tournage.js` peut la refilmer à l'identique sur le nouvel écran.
- **Lot 38 « Toutes les tables » (20 oct. 2026)** : branche `lot-38-toutes-les-tables`, non publiée. Demande de l'utilisateur :
  ne pas se fermer à la FLX4, avant la table complète (lot A). **Fiches de table** dans `js/tables.js` (chargé juste avant
  `midi`) : `MODELES` (13 tables : Pioneer DDJ-400, DDJ-SB3, DDJ-200 ; Hercules Inpulse 200, 300, 500, Starlight ; Numark
  Mixtrack Platinum FX, Mixtrack Pro FX, Party Mix, DJ2GO2 Touch ; Roland DJ-505 ; Reloop Mixage), chacune avec `re` (nom du
  port MIDI ; les « MK2 / MKII » exclues, leurs numéros peuvent changer), `cmd` (commandes que le site utilise) et `plus`
  (aigus, TRIM, crossfader, tempo, CUE, CUE casque, **pour le lot A, rien ne les lit encore**). `modeleDe(nom)`, `modeleId`,
  `modeleMap`. **Numéros relevés dans les correspondances du logiciel libre Mixxx** (`res/controllers/*.midi.xml`, GPL :
  seuls les numéros, des faits, sont repris, pas de code), recoupés par marque (Pioneer = plan de la FLX4 ; Numark et
  Roland = même plan). **Aucune n'a été essayée en vrai** (`teste` = false partout). La FLX4 n'a pas de fiche :
  `DEFAULT_MAP` ne change pas (son filtre et ON de l'effet restent appris au passage, même si Mixxx donne les numéros :
  canal 7 n° 23, et canal 5 n° 71). Branchement (`modeleAuto`, appelé à chaque changement de table dans `initMidi`) :
  une table qui a sa fiche prend ses réglages toute seule (`modeleApply` : `coach-table` = `{ nom, modele }`, puis
  `cleanMap(…, true)` comme une table réglée pas à pas, donc une commande absente se fait à l'écran) ; des réglages venus
  d'une fiche sont remplacés sans demander (autre table connue, ou retour automatique à la FLX4 par `flx4Map`) ; ceux d'une
  table **réglée à la main** jamais : nouvel état `'connue'` de `tableEtat()`, bandeau « DJingood connaît ses réglages. On les
  prend ? » (`modeleReprend` dans `js/reglage.js`). « Ma table » : texte « reconnue toute seule », réglage « (d'origine) »
  d'après la fiche, bouton du bas « Revenir aux réglages d'origine de la … » (`tableResetTxt`, `tableResetModele`). Le
  rapport des testeurs dit « (reconnue d'après sa fiche) ». Textes mis à jour : accueil, présentation (titre « sur ta table
  DJ », matériel, question « Et si j'ai une autre table ? »), fiche des testeurs, README. Tests : `tests/tables.spec.js`
  (nouveau) ; dans `tests/autre-table.spec.js`, la table « inconnue » s'appelle maintenant `Controleur Mystere X1`
  (l'Inpulse 200 est devenue connue). Pas de fiche (Mixxx n'a rien) : DDJ-FLX2, DDJ-FLX6, DDJ-REV1, Inpulse T7, DJ-202,
  et les MK2 : réglage pas à pas. Les Traktor de Native Instruments ne parlent pas MIDI au navigateur : hors de portée.
  **Pour qu'une fiche passe à « testée »** : le rapport de « Vérifier ma table » d'un joueur qui a cette table.
  **Gardien : feu rouge au premier passage**, corrigé : passer par une table connue effaçait ce que la FLX4 avait appris
  (filtre, ON de l'effet). Maintenant chaque table connue garde ses réglages dans `coach-tables` (`tableGarde` avant
  chaque changement automatique, `flx4Reprend` pour revenir à la FLX4 avec ce qu'elle avait appris, `modeleApply(nom,
  true)` pour reprendre ceux d'une table connue). Les boutons « Revenir aux réglages d'origine » remettent, eux, les
  réglages d'origine. Aussi : `msgFin(d1)` remplace les tests « numéro entre 32 et 63 = second message d'un potard fin »
  (`midi.js`, `table.js`, `verif.js`), parce que les vrais numéros de la Reloop Mixage tombent là (`sansFin` dans sa
  fiche) ; une table connue dont `coach-midi-map` est abîmée reprend sa fiche au chargement ; le bandeau ne parle de
  « réglages remplacés » que s'il y en a. Un test par défaut dans `tests/tables.spec.js`.
  Second passage : feu orange. Corrigé avant la mise en ligne : une table connue **réglée à la main** (sa fiche était
  peut-être fausse) garde son `modele` (`regSave`), donc ce réglage est gardé dans `coach-tables` et revient après un
  passage par la FLX4.
- **Lot 38 publié le 20 oct. 2026.**
- **Lot 39 « La table complète » (= lot A, commencé le 20 oct. 2026)** : branche `lot-39-table-complete`, non publiée.
  Réponses de l'utilisateur sur la maquette (`captures/maquette-table/`) : pendant une partie, la consigne se replie et
  seules les commandes du niveau sont allumées ; **4 pads** par platine ; ordre : le son, puis la table à l'écran, puis le
  branchement sur la FLX4 et les autres tables. **Étape 1, le son (faite)** :
  - `js/audio.js` : chaque voie est maintenant TRIM → LOW → MID → HI → filtre (coupe-bas / coupe-haut, sur A **et** B) →
    écoute au casque → fader → crossfader → salle. Nouvelles valeurs de `ctrl` : `hiA/B`, `trimA/B`, `cfxB`, `xfader`,
    `tempoA/B`, toutes à .5 dans `CTRL_NEUTRE` ; au neutre, le son est identique à avant. **Chaque niveau repart du
    neutre** : `Object.assign(ctrl, CTRL_NEUTRE, l.init)` partout où on appliquait `l.init`, et `selectLesson` coupe
    le casque des deux voies. `trimDb` (coupé à gauche, 0 dB à midi, +9 dB à droite), `xfGain` (les deux voies à fond au
    milieu, sans creux), `cfxFreq`. Casque : `hpBus` (sorties 3-4 d'une table à 4 sorties) reçoit la salle (`hpSalle`)
    tant qu'aucune voie n'a son CUE casque, sinon seulement les voies au casque, avant leur fader (`deck[k].pfl`).
    Vumètre : `deck[k].an` (AnalyserNode après le fader, rien ne le lit encore).
  - `js/platines.js` (nouveau, chargé juste après `audio`) : chaque platine retient une ancre (`ancT`, `ancP`, `rate`),
    `plPos(k)` donne sa position exacte, boucles comprises (`boucle` du joueur, sinon `secu`, la boucle de sécurité posée
    par `play`). `play()` et `stop()` passent par là (`plDemarre`), sans rien changer pour les niveaux. Tempo :
    `plTempoPct` (curseur en haut = plus lent, ±8 % : `PL_TEMPO`), `plVitesse` ; molette `plJog(k, crans)` (en lecture,
    pousse ou freine selon sa vitesse, `PL_JOG` ; à l'arrêt, déplace) ; `plLecture` (PLAY/pause) ; `plCue(k, appuyé)`
    comme une table DJ ; `plHotCue(k, n)` (vide : se pose sur le temps le plus proche ; posé : y saute),
    `plHotCueEfface` ; `plBoucle(k, temps)` et `plSortie(k)` (la boucle de sécurité revient) ; `plCasqueBascule(k)` ;
    `plDecalage()` = décalage A/B en millisecondes (positif : B en avance), pour le chapitre 5. **Les réglages de la
    molette (`PL_JOG`) sont à ajuster sur la vraie table.**
  - Tests : `tests/platines.spec.js` (12 tests ; morceau muet de 60 s posé directement sur une platine).
  **Étape 2, la table à l'écran (faite)** : la carte « Ta table » (`index.html`, `.deck` → `.table3`) montre toute la
  table : platine A (`.plA` : molette `#jogA`, tempo `data-k="tempoA"` + `#tpctA`, CUE `#cueA`, PLAY `#playA`, pads
  `#padsA` avec onglets HOT CUE / BOUCLE), table de mixage (`.mx` : ECHO en haut `#gEcho`, puis TRIM / HI / MID / LOW /
  FILTRE des deux voies, CUE casque `#casqueA/B`, faders avec vumètres `#vuA/B`, crossfader `data-k="xfader"`, couché),
  platine B (`.plB`, LANCE B `#launchB` à la place de PLAY). **Tous les anciens identifiants sont gardés** (`#gPlay`,
  `#gLow`, `#gFad`, `#gCfx`, `#gEcho`, `#gMid`, `#wLowA`…). Chaque commande porte `data-g` (son groupe) :
  `tableAllume(l.show)` (dans `js/commandes.js`, appelé par `selectLesson` à la place de l'ancien `hidden`) éteint et rend
  inerte (`inert`, classe `.eteint`) tout ce que le niveau n'utilise pas ; `setFocus` allume `.focus` sur tous les
  `[data-g]` du groupe. Nouveaux groupes : `gMidB`, `gCfxB`, `gHi`, `gTrim`, `gTempo`, `gJog`, `gCue`, `gPads`,
  `gCasque`, `gXf`. `isAuto` ne tient jamais les commandes de `CTRL_NEUTRE`. `js/commandes.js` (nouveau, chargé après
  `controles`) : `tableAllume`, `renderPads`, `padPresse` (clic droit sur un hot cue posé = l'effacer), molette à la souris
  (`jogSouris` : un degré tourné = un cran ; flèches au clavier), `tableAnime` (repère des molettes à 33 tours ⅓, vumètres,
  BPM), `buildCommandes` (appelé par `demarrage`), `tableDepart` (au changement de niveau). `controles.js` : le
  crossfader se lit de gauche à droite (`.xf`), textes en dB du TRIM, % du tempo. **Pendant une partie** (`.stage.joue`,
  posée par `setStartBtn`) : consigne, choix des morceaux et « Ta table » repliés, Vini + compte à rebours + « Arrêter »
  sur une ligne, puis la piste et la table ; `stageIntoView` au départ. Sur 1366 × 768, LANCE B, LOW, faders et ECHO se
  voient (test), le crossfader est un peu coupé (aucun niveau ne s'en sert encore). Tests : `tests/commandes.spec.js`.
  Captures : `captures/lot39/` (hors Git).
  **Étape 3, le branchement sur la table (faite)** : `MIDI_CC` gagne `hiA/B`, `trimA/B`, `cfxB`, `xfader`, `tempoA/B` ;
  `MIDI_NOTE` gagne `cueA/B` et `pflA/B` (CUE casque). **`DEFAULT_MAP` de la FLX4 reçoit ces numéros** (relevés dans Mixxx,
  recoupés avec la DDJ-400, pas encore vérifiés en vrai ; les anciens numéros ne changent pas, le filtre de A et ON de
  l'effet restent appris au passage). Les fiches de `js/tables.js` donnent les leurs par `plus` (`modeleMap` les reprend).
  `CMD_GROUPE` + `cmdLibre(k)` : une commande de la table complète **éteinte dans le niveau ne fait rien** (sa position est
  quand même retenue dans `phys`). `pressKey(k, relache)` : CUE se tient (note relâchée = `relache`), PLAY de A,
  CUE casque. **Molettes et pads seulement sur la FLX4** (`flx4Plus` dans `midi.js`) : molette = potard relatif (64 =
  immobile, 720 crans par tour, n° 33 à 35, `plJog(k, (valeur − 64) / 2)` en degrés), pads canaux 8 (A) et 10 (B) : HOT CUE
  notes 0 à 3, SHIFT (canaux 9 et 11) = effacer, BEAT LOOP notes 100 à 103 (4, 8, 16, 32 temps), 4 BEAT/EXIT note 77.
  Tempo : Mixxx donne « valeur 0 = le plus rapide », comme notre `plTempoPct`. « Ma table » : `TKEY` connaît HI, TRIM,
  filtre de B, crossfader (`cross`), tempo, CUE, CUE casque (`casqueA` → `pflA`) ; `tableSchemaSet` dessine tempo et
  crossfader. « Vérifier ma table » : à une étape de relevé, le numéro **déjà connu de la commande vérifiée** est
  accepté (il confirme celui de Mixxx). Tests : `tests/commandes.spec.js` (« Avec la table ») ; `PAR_DEFAUT` mis à jour dans
  `tests/midi.spec.js` et `tests/autre-table.spec.js`. **À vérifier sur la vraie FLX4** : sens du tempo, réglage de la
  molette (`PL_JOG`), pads en mode HOT CUE et BEAT LOOP, CUE tenu.
  **Suite** : le chapitre 5 « Le calage » (premiers exercices qui allument ces commandes).
- **Lot 40 « Le calage » (chapitre 5, 20 oct. 2026)** : branche `lot-40-calage`, non publiée. Plan validé par
  l'utilisateur (7 niveaux, ouverture avec le chapitre 2, casque simulé, seuils 15 / 25 ms). `js/calage.js` (nouveau, chargé
  après `combos`, avant `niveaux`) : `CH5_LESSONS` (chaque niveau a `cal` : `quiz`, `decale`, `bpmB`, `compteur`, `bpm`,
  `grace`, `entre`, `libre`, `swap` — voir l'en-tête du fichier), `CAL_OK` = 15, `CAL_MID` = 25, `CAL_BPM_A` = 124.
  1. Entendre le décalage (5 écoutes : calés, B en avance, B en retard ; boutons `#calQuiz`, `calTours`, `calTour`,
  `calRepond`) · 2. Pousser, freiner (même tempo, B décalé de 40 à 90 ms, molette de B) · 3. La bonne vitesse (B à 126,
  tempo + molette, BPM affiché) · 4. La vitesse à l'oreille (B à 121, 122, 126 ou 127, BPM caché : `.stage.sansbpm`) ·
  5. Au casque (B fader en bas, CUE casque de B, entrer au temps 64) · 6. Lancer et caler (B lancé par le joueur à
  l'instant exact, `calLanceLibre`, 4 BPM d'écart, swap au temps 64) · 7. Sans filet (pareil, sans BPM, sans compteur,
  piste dans le brouillard : `noCount`).
  Déroulé : `startRun` tire le tempo de B (`calChoisitBpm`) et fabrique B à ce tempo (`songSafe(…, bpmB / 124)`), puis
  `calDepart` à la place de `launchAt` ; `calLance(k, ms)` lance B au temps k de A décalé de ms, `calGrille` lui donne sa
  propre grille (`deck.B.per`) ; `frame` passe la main à `calFrame` (mesure `plDecalage` à chaque image dans
  `run.cal.mes`, compteur `#calBar` / `calCompteur`, consignes) ; démo : `calDemo` (tempo exact puis molette) et
  `calDemoGestes` (entrée de B, swap). Note : `calEval` (part du temps calé après la grâce, temps pour caler, BPM final de
  B, entrée de B, swap via `evalSwap`), étoiles `calEtoiles` (★★★ : 85 % sous 15 ms, ★★ : 60 % sous 25 ms ; une autre
  consigne ratée empêche ★★★). Au chapitre 5, la musique est toujours fabriquée par le site (house, si « vraie musique »
  ou « surprise » était choisi : `chooseSongs`). Casque simulé : sans sortie casque (`outChannels` < 4), une voie au
  CUE casque joue à 30 % dans les enceintes (`deck[k].simu`, `plCasque`).
  Ailleurs : `CHAPTERS` (5 = « Le calage », 6 = « La soirée », toujours caché), `ch5Stars` (clé `coach-ch5`), `bankOf`,
  `lessonsOf`, `BANK_KEY`, `XP_PER` (25 par étoile), `ch5Unlocked`, `xpTotal`, total d'étoiles ; parcours : étape `ch5`
  (« Je débute » : après le chapitre 3 ; « J'améliore » : après le chapitre 2) ; « Mes progrès » ; rapport des testeurs ;
  compte (`cptPoids`, `cptResume`). Groupes de la table **séparés par platine** : `gTempoA/B`, `gJogA/B`, `gCueA/B`,
  `gPadsA/B`, `gCasqueA/B` (CMD_GROUPE et `flx4Plus` suivent). Tests : `tests/calage.spec.js` (dont un « robot » qui cale
  le niveau 3 en vrai). **À essayer par l'utilisateur sur sa FLX4** : la sensibilité de la molette (`PL_JOG`) décide de la
  difficulté réelle des niveaux 2 à 7, et les seuils 15 / 25 ms.
  **Gardien : feu rouge** (21 oct. 2026), corrigé : avec « Techno » (130 BPM) ou « Afro house » (120) choisi, A ne jouait
  pas à 124 et B dérivait tout seul → **le chapitre 5 joue toujours la house** (`chooseSongs`). Aussi : le journal des
  testeurs garde le chapitre 5 (`js/avis.js`) ; question bonus générale au chapitre 5 (`quizBonus`) ; **tempo de la table en
  haute résolution** (`tempoFin`, `tempoGros` dans `js/midi.js` : le message fin n + 32 suit le gros, 16 384 positions au lieu
  de 128, sinon impossible de tomber sur 124 BPM) ; le compteur garde sa place avant que B parte (`calCompteur(ms, garde)`,
  classe `.attend`) ; la démo du niveau 1 répond elle-même ; au niveau 7, la bulle ne donne plus aucune aide. Points 27 et
  28 de la checklist. Chaque correction a son test dans `tests/calage.spec.js` (« Corrections du gardien »).
  Second passage : feu orange. Corrigé avant la mise en ligne : sur téléphone, la barre « Arrêter » reste collée en bas
  pendant une partie (`.stage.joue .actionbar` sticky sous 1040 px, place gardée sous la table) — elle sortait de l'écran
  aux niveaux 5 et 6 ; le texte du compteur tient sur une ligne. Laissé tel quel (à demander à l'utilisateur) : au niveau 7,
  après LANCE B, la bulle dit de combien de temps B est parti tôt ou tard (un retour après coup, pas une aide).
- **Lot 40 publié le 21 oct. 2026** (accord de l'utilisateur ; 421 tests verts).
- **Lot 41 « Hot cues et boucles » (chapitre 6, commencé le 21 oct. 2026) : COMMENCÉ, NON FINI, et MASQUÉ.**
  (État du 22 oct. au matin. **Fini le soir même et `CH6_PRET` passé à `true`**, avec ses tests : voir l'entrée
  « Lot 41 repris et fini » juste après. Le paragraphe ci-dessous reste utile pour le principe de l'interrupteur.)
  `js/hotcues.js` (195 lignes, chargé entre `calage` et `niveaux`) : `CH6_LESSONS`, les hot cues et les boucles
  pendant une partie (`hcPad`), le dessin des repères et de la zone de boucle sur la piste, la note en
  millisecondes. Étoiles dans `coach-ch6`, 25 XP par étoile.
  **TOUT LE CHAPITRE EST DERRIÈRE UN SEUL INTERRUPTEUR** : `const CH6_PRET = false;` en haut de `js/hotcues.js`
  (choix de l'utilisateur le 22 oct., au moment de publier le nouveau nom : ne pas montrer un chapitre en chantier).
  À `false`, le chapitre n'existe pas pour le joueur : absent de la liste des chapitres (`soon: !CH6_PRET`),
  `ch6Unlocked()` faux, hors du total d'étoiles, hors des deux parcours, hors du rapport des testeurs,
  hors de « Mes chapitres » dans Mes progrès, et la carte de fin annonce « Chapitres 2, 4 et 5 débloqués »
  au lieu de « 2, 4, 5 et 6 ». Le code reste chargé mais inerte (tous les points d'entrée testent `LESSONS[li].hc`).
  **Le gardien a mis un feu rouge** le 22 oct. parce que trois de ces endroits avaient été oubliés (les deux de
  « Mes progrès » et la carte de fin) : si on remet un chapitre derrière ce genre de drapeau, **penser à ces
  cinq endroits**, pas seulement à la liste des chapitres.
  **Pour reprendre le lot 41** : passer `CH6_PRET` à `true`, finir les 7 niveaux, et **écrire
  `tests/hotcues.spec.js`** — il n'y a aujourd'hui aucun test du chapitre 6, il partirait sans filet.
- **Lot 41 repris et fini le 22 oct. 2026** (branche `lot-41-hotcues`, **non publiée** ; demande de l'utilisateur :
  « on enchaîne sur le site »). `CH6_PRET = true`. Un « robot » a joué les 7 niveaux (démo, geste parfait, rien du tout) :
  tous allaient au bout sans erreur, mais une dizaine de défauts, tous corrigés et couverts par `tests/hotcues.spec.js` :
  - **Mesure** : la coupure du fader n'était notée qu'à l'image suivante (jusqu'à 30 ms d'erreur sur un geste parfait) ;
    `gestureMark` (expert.js) note maintenant aussi au chapitre 6. Les pads de l'écran partaient **au relâchement du clic**
    (toujours en retard) : ils partent à l'appui (`pointerdown` dans `buildCommandes`, le clavier garde le clic).
  - **Le son sort après son calcul** (environ 50 ms dans le navigateur de test) : sans Quantize, la boucle se posait plus
    loin que ce que le joueur entendait. `plHotCue(k, n, ici)` et `plBoucle(k, temps, ici)` prennent maintenant l'endroit
    entendu (`hcPad` le lit avec `heardTime()` avant que `plBoucle` repose l'ancre) ; sans `ici`, rien ne change ailleurs.
  - **Triche** : la barre d'espace et PLAY de B lançaient B par l'ancien chemin, sans hot cue ; `launchB` refuse au chapitre 6.
  - **Consignes** : le rond compte de nouveau les temps (`hcConsigne`) ; « Coupe A » est jugé pendant la partie (`hcCoupe`) ;
    au niveau 3, un repère **EXIT** au temps 60 et la consigne visent la dernière mesure (temps 60 à 64), pas le drop, et la
    sortie est juste si **le drop tombe sur la phrase** (calculé à l'appui), pas selon l'instant exact ; A est coupé par le
    site au temps 64 (sinon deux basses après le drop). « Pendant le niveau » : chaque niveau a son `plan` (il disait
    « PLAY de droite »), et la démo ses légendes (`caps`).
  - **Fin de A (niveaux 4 et 7)** : une boucle qui dépasse la fin emmène A au bout quand même (silence), avec une marge de
    `HC_ZERO` ms (un retard de quelques ms sans Quantize ne doit pas couper A) ; la note dit « Ta boucle dépassait la fin ».
    Au niveau 7, toute boucle posée au début d'une mesure fait l'affaire, notée en ms par rapport à cette mesure.
  - **Double drop** : les deux morceaux n'avaient pas la même suite d'accords et frottaient. `hcVarB` : B prend la version
    `vr + VARIANTS` (graine + 404, même suite d'accords sur les 4 de `PROGS`, autre motif) ; `warmSongs` la prépare.
  - **Piste** : la boucle est une **zone** (le tour en cours en vif, les suivants pâles, depuis l'endroit où elle a été posée :
    `run.hc.depuis`), les hot cues posés ont un **fanion numéroté**, et au niveau 3 la piste d'attente montre la boucle puis
    le drop au temps 64. Les pads sont dans le bon mode dès le choix du niveau (`hcModes`).
  - Niveaux plus courts ou plus propres : niveau 1 de 32 à 62 (B lancé au temps 36), niveau 3 de 44 à 76 ; niveaux 3, 4 et
    5 avec B sans basse dans l'intro (`bBass: false`), pour ne pas avoir deux basses sous la boucle.
  - Deux messages au même instant (lancer B et couper A) ne s'écrivent plus l'un sur l'autre (`pop`, piste.js, tous chapitres).
  - Points 29 à 31 de la checklist FLX4. Seuils `HC_OK` = 20 ms et `HC_ZERO` = 150 ms **à ajuster après les essais de
    l'utilisateur sur sa table**, comme ceux du chapitre 5. Les tests « 14/87 » du total d'étoiles passent à « 14/108 ».
  - **Gardien : feu orange** (447 tests verts), trois remarques corrigées, un test chacune : au double drop, un swap 265 ms
    en retard affichait « SWAP PARFAIT ! » en vert (`tolOf` vaut maintenant 0,25 au chapitre 6, comme en Expert, et la
    couleur des lignes du swap suit leur note en ms) ; aux niveaux 4 et 7, une boucle posée une mesure plus tôt affichait
    « 1933 ms trop tôt » alors que la note l'accepte (`hcStatut` mesure à la mesure la plus proche) ; au niveau 1, un
    second appui ne disait pas comment effacer le repère (la bulle le dit). Le lexique de « Comment faire ? » explique
    maintenant hot cue, boucle et Quantize (`LEX`).
- **Lot 37 « Parcours adapté aux réponses » (fait le 22 oct. 2026)** : demande de l'utilisateur du 17 oct. 2026. Les Premiers
  pas posent déjà cinq questions et gardent tout dans `coach-accueil` (`{ niveau, table, pourquoi, min, depart }`), mais
  seuls `niveau` (choix du parcours), `min` (objectif du jour) et `depart` servent. **`table` et `pourquoi` ne servent à
  rien aujourd'hui.** Il faut un algorithme qui adapte ce qui est proposé derrière : les exercices, l'ordre des étapes, les
  quêtes du jour et les missions de « Passer au vrai » devraient suivre les réponses (par exemple : sans table, ne pas
  proposer les missions qui demandent la table ; « mixer en soirée » plutôt que « pour moi » fait remonter le mini-set et
  Passer au vrai ; un joueur qui se dit à l'aise saute les fiches « Découvre ce bouton »). À cadrer avec l'utilisateur
  avant de commencer : quelles réponses changent quoi, exactement. (C'était le « lot 35 », puis le « lot 36 », avant
  que l'utilisateur demande l'écran de compte puis le travail d'identité ; renuméroté en 37.)
  **Décisions de l'utilisateur du 22 oct. 2026 (remplacent ce qui les contredit)** : 1. **la DDJ-FLX4 n'est plus présentée
  comme « la table de base »** : on demande au joueur quelle table il a, toutes les tables sur un pied d'égalité (proposé :
  la table branchée est reconnue toute seule, sinon liste par marque, ou « pas encore de table »). 2. **Les chapitres ne
  sont pas de plus en plus durs**, ce sont des gestes différents : le test de placement « tu commences au chapitre N »
  n'a pas de sens. Le chapitre 1 (apprendre chaque bouton) reste pour ceux qui n'ont jamais touché une table ; ceux qui
  ont déjà touché doivent avoir des **exercices vraiment plus difficiles** (aujourd'hui : Mode Expert, combos, calage ;
  plus tard chapitres 6 et 7). **Validé par l'utilisateur le 22 oct.** : table reconnue toute seule au branchement, liste
  par marque en secours, « Je n'ai pas encore de table » ; une seule question de niveau à trois réponses (débutant complet
  → parcours actuel ; un peu d'expérience → tout ouvert en Mode Expert, puis combos, calage ; mixe déjà → le plus dur
  d'emblée), **test de placement supprimé**. Il n'aime pas la formule « touché une table » ; **réponses choisies :
  « Grand débutant » · « Apprenti DJ » · « DJ confirmé »**. **Lot 37 avant le chapitre 6** (choix de l'utilisateur).
  **FAIT le 22 oct. 2026, NON PUBLIÉ** : branche `lot-37-parcours-adapte` (commit `68a321b`), travaillée dans une **copie
  à part `Documents\coach-dj-lot37`** (git worktree, `node_modules` relié par jonction) pour ne pas toucher au dossier
  principal, où le chapitre 6 était en cours (`CH6_PRET = true` non commité) et où un autre serveur occupait le port 8766.
  **Tests : `DJ_PORT=8767 npx playwright test`** (port réglable ajouté dans `playwright.config.js`, `tests/serveur.js`,
  `tests/captures.js`, `tests/images-presentation.js` ; sinon Playwright réutilise le serveur d'une autre copie et teste
  le mauvais code). 430 tests verts. **Gardien : feu rouge au premier passage**, corrigé : ouvrir les chapitres par
  le parcours mettait `ch2Open` à vrai, ce qui donnait le badge « Les bases » sans jouer (le compte croyait alors à une
  progression, le défaut du lot 34) et cochait l'étape « La maîtrise ». Maintenant un drapeau à part, `parcoursOuvert`
  (niveaux.js), lu par `ch2Unlocked` / `ch3Unlocked` seulement ; les étapes ch1 et ch2 se jugent sur les étoiles.
  Second passage : feu rouge pour un défaut déjà là au premier commit : niveaux.js vérifie le chapitre enregistré **au
  chargement, avant parcours.js**, donc un Apprenti DJ revenait au chapitre 1 à chaque rechargement. `parcoursOuvert` est
  maintenant lu dans `coach-parcours` dès niveaux.js (piège : tout ce que niveaux.js vérifie au chargement ne connaît pas
  encore le parcours). Test « après un rechargement, on reste au chapitre N ». Captures : `captures/lot37/` (dossier principal).
  Contenu : `PP_ETAPES` = salut, niveau, table, objectif ; `PP_NIVEAUX` = `debut` / `apprenti` / `confirme` (= parcours) ;
  écran de table : `ppBranchee()` reconnaît la table branchée (appelé par `initMidi` via `ppMidi`), sinon « J'ai une table »
  + liste par marque `#ppModele` (`PP_LISTE`), ou « Pas encore de table » ; `coach-accueil` = `{ niveau, table, modele, min,
  fini }` (anciennes valeurs relues). Parcours : `apprenti` = expert, ch4, ch5, ch2, ch3, ch6, train, vrai ; `confirme` = ch5,
  ch4, expert, ch6, ch3, train, vrai ; nouvelles étapes `expert` (niveau compté à 60/100 dans `xBest`) et `ch4` ;
  `parcoursAvance()`, `parcoursOuvre()` (ouvre ch2 et ch3 sans rien enregistrer) ; ancien `deja` → `apprenti`. Fiches et
  guide jamais imposés aux deux parcours avancés. Test de placement : plus aucun point d'entrée (`js/placement.js` reste
  chargé mais inerte ; à supprimer dans un nettoyage à part). Textes : accueil, présentation (« Trois parcours »), testeurs,
  README. **Reste** : accord de l'utilisateur sur les captures, gardien, puis push.
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
  `audio` → `platines` (position, tempo, molette, CUE, hot cues, boucles, casque) → `vrais` (vraie musique) → `sons` (sons du jeu) → `controles` → `commandes` (table complète à l'écran) → `combos` (chapitre 4) → `calage` (chapitre 5) → `hotcues` (chapitre 6, lot 41) → `niveaux` (niveaux, progression, partie, notation) → `piste` → `expert` (Mode Expert) → `tables` (fiches des tables reconnues) → `midi` →
  `placement` → `entrainement` → `rekordbox` → `guide` → `objectif` (objectif du jour) → `quiz` (quiz et badges) → `parcours` (accueil, les deux parcours) → `vini` (la mascotte) → `premiers` (Premiers pas) → `quetes` (quêtes du jour) →
  `table` (page « Ma table ») → `reglage` (régler une autre table pas à pas) → `verif` (vérifier ma table pas à pas) → `avis` (avis des testeurs, rapport) → `compte` (se connecter avec Google) →
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
`coach-lecons`, `coach-lecons-oreille`, `coach-ch2`, `coach-ch2-ouvert`, `coach-ch3`, `coach-ch4` (étoiles des combos), `coach-ch5` (étoiles du calage), `coach-ch6` (étoiles des hot cues, lot 41), `coach-chapitre`,
`coach-style` (`house`, `techno`, `afro`, `random` ou `vrai`), `coach-guide-vu`, `coach-fiches` (fiches « Découvre ce bouton » déjà vues), `coach-parcours`, `coach-test`, `coach-quiz` (identifiants des questions trouvées),
`coach-badges` (identifiants des badges gagnés), `coach-objectif` (objectif du jour, secondes par jour, série), `coach-journal` (temps, parties, « C'était clair ? », avis des testeurs), `coach-entrainement` (défi, série, compteurs, record du mini-set),
`coach-collection` (morceaux importés), `coach-missions` (paire choisie, missions cochées, paires validées), `coach-midi-map` (partagée avec `coach.html`), `coach-table` (`{ nom }` d'une autre table réglée pas à pas, ou `{ nom, modele }` d'une table reconnue par sa fiche, lot 38 ; gardée par « Tout recommencer à zéro »), `coach-tables` (réglages gardés de chaque table connue, `{ flx4: {...}, ddj400: {...} }`, pour passer d'une table à l'autre sans perdre ce qui a été appris ; gardée aussi, ne suit pas le compte), `coach-verif` (« Vérifier ma table » : étape, réponses, numéros MIDI relevés ; gardée aussi), `coach-expert` (Mode Expert choisi, records sur 100), `coach-ordre` (`2` : progression passée au nouvel ordre du chapitre 1), `coach-accueil` (réponses des Premiers pas, ou `passe`), `coach-quetes` (quêtes du jour, compteurs, coffres ouverts, XP des coffres), `coach-sons` (`0` : sons du jeu coupés), `coach-compte` (`{ uid, prenom, maj, sale }` du dernier compte connecté : `maj` = horodatage du dernier document écrit ou repris, `sale` = des changements pas encore enregistrés en ligne), `coach-bibliotheque` (`coach.html`).
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
  inattendus, `coach-midi-map` abîmée. `tests/quiz.spec.js` : contenu du quiz, badges, quiz éclair, question bonus. `tests/objectif.spec.js` : objectif du jour, série. `tests/presentation.spec.js` : page de présentation. `tests/rangement.spec.js` : chapitres et style repliés, « Mes progrès », schéma replié. `tests/vrai.spec.js` : Passer au vrai étape par étape. `tests/rythme.spec.js` : durée des niveaux. `tests/combos.spec.js` : chapitre 4. `tests/ralenti.spec.js` : ralenti des combos. `tests/fiches.spec.js` : fiches, « Pendant le niveau », position de départ. `tests/autre-table.spec.js` : autre table, « Régler ma table », retour à la FLX4. `tests/tables.spec.js` : tables reconnues par leur fiche (lot 38). `tests/platines.spec.js`, `tests/commandes.spec.js` : la table complète (lot 39). `tests/calage.spec.js` : chapitre 5 (lot 40). `tests/expert.spec.js` : Mode Expert. `tests/verif.spec.js` : « Vérifier ma table ». `tests/vrais.spec.js` : vraie musique. `tests/ordre.spec.js` : ordre du chapitre 1 et progression déplacée. `tests/premiers.spec.js` : Premiers pas et Vini. `tests/ca-bouge.spec.js` : Vini en partie, carte de résultat, écran de la série. `tests/quetes.spec.js` : quêtes du jour. `tests/vini-sons.spec.js` : Vini sur l'accueil, sons du jeu. `tests/vini-partout.spec.js` : Vini sur Mes progrès, S'entraîner, Passer au vrai. `tests/compte.spec.js` : le compte Google (faux Firebase posé avant le chargement). `tests/clarte.spec.js` : lexique, échecs en écart, piste visible, badges de l'accueil. `tests/avis.spec.js` : « Mon avis »,
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
