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

## Où on en est
- Plan en 5 étapes : 1. Restructurer (3 onglets, supprimer le mode libre, page d'accueil) ·
  2. Remplir S'entraîner · 3. Remplir Passer au vrai · 4. Tester avec 3 à 5 débutants · 5. Lancer.
- **1. Restructurer : fait le 12 oct. 2026.** Accueil + 3 onglets dans `index.html`, lien « Mode libre »
  retiré, `coach.html` renvoie vers `index.html#vrai`.
- **2. Remplir S'entraîner : fait le 12 oct. 2026.** Défi du jour (série de jours), variations,
  à l'oreille, mini-set de 3 transitions. Passer au vrai n'affiche encore que des cartes « Bientôt ».
- **Prochaine étape : 3. Remplir Passer au vrai** (repartir du code de `coach.html`).

## Fichiers
- `index.html` — tout le site des leçons (~1600 lignes, CSS + un seul `<script>`, aucune dépendance).
- `coach.html` — ancien mode libre (bibliothèque rekordbox, coach de swap), retiré du site : la page renvoie
  vers `index.html#vrai`. Son code sert de base à « Passer au vrai » ; `coach.html?ancien=1` l'affiche encore.
- `tests/` — scripts Playwright (Python) : `tdz.py`, `robust.py`, `clar.py`, `play.py`, `play2.py`, `user.py`.
- `README.md` — description publique.

## Architecture de `index.html` (repères)
- **Onglets** : quatre blocs `.view` (`vHome`, `vLearn`, `vTrain`, `vReal`), un seul visible. `setView(v)`
  (fin du script) suit l'adresse : `#accueil` (défaut), `#apprendre`, `#entrainer`, `#vrai`. Quitter
  Apprendre arrête la partie en cours ; le guide de premier lancement s'ouvre à la première entrée dans
  Apprendre, plus au chargement. Les tests ouvrent `index.html#apprendre`.
- **S'entraîner** : une séance `prac` (`startPrac(kind)` avec `defi`, `var`, `ear`, `set`) rejoue les niveaux
  du chapitre 1 déjà joués (`pracPool`, tous avec `?tout=1`) sur la scène des leçons : `vLearn` reçoit la
  classe `.prac` (chapitres et carte masqués) et le bandeau `#prBanner`. Style et variante imposés via
  `chooseSongs`. `finish` n'enregistre pas d'étoiles de leçon pendant une séance et appelle `pracStep` ;
  le bouton « suivant » passe par `pracNext` ; `quitPrac` remet le chapitre et le niveau d'avant.
  Le défi du jour est tiré de la date (`dailyPick`). « À l'oreille » ici = sans compte à rebours mais
  précision normale (le chapitre 2 garde la précision ×2).
- **Gestionnaire d'erreurs** en tête du script → bandeau `#errBanner`. Les rejets marqués `.silent` sont ignorés.
- **État** : `let stars` est déclaré AVANT `earStars`, `ch2Stars`, `chapter`, etc. Puis validation de
  `styleChoice` (house/techno/afro/random) et `chapter` (1/2/3). Déblocage : `ch2Unlocked` (≥14 étoiles
  au ch.1), `ch3Unlocked` (≥10 au ch.2).
- **Audio** (Web Audio) : LOW = lowshelf, MID = peaking, CFX = passe-haut/passe-bas (deck A), écho après
  le fader, limiteur final, sortie 4 canaux pour le casque de la FLX4.
- **MIDI** (Web MIDI) : correspondances FLX4, apprentissage des contrôles, `phys` (positions réelles),
  vérification de la mise en place avant chaque niveau.
- **Morceaux** : `makeSong(style, role, seed, secs, o)` (synthèse procédurale, `STYLE_DEFS`, `VARIANTS = 4`),
  calculés dans des Web Workers (`workerPool`, `renderSong`). Cache `getSong(sty, vr, part)` + `songSafe`
  (relance une fois). `chooseSongs()` précharge dès le choix du niveau. `startRun(demo)` lance la partie.
- **Niveaux** : `BASE_LESSONS` (kinds moment, fader, swap, full, filter, echo, cut ; `targets`, `caps`)
  et `CH3_LESSONS`.
- **Lisibilité** : `ACT` (texte d'action par cible), `GROUP_OF`, `setFocus(ids)` (classe `.focus`),
  `showAction` (« Dans N temps : … » puis « Maintenant : … ! »), `<details class="howto">`.
- **Thème « Tout doux »** (choisi par l'utilisateur, ne pas changer sans lui demander) : jetons CSS dans
  `:root`, polices Fredoka + Nunito, menthe / corail / lavande / violet, bouton Jouer vert, mascotte
  `.buddy`. Ni « arcade », ni « ambiance club ». Maquette de référence :
  https://claude.ai/artifact/CGZeVmXKDoPi2GKaT9WYrW (planche n°2).

### Clés localStorage
`coach-lecons`, `coach-lecons-oreille`, `coach-ch2`, `coach-ch2-ouvert`, `coach-ch3`, `coach-chapitre`,
`coach-style`, `coach-guide-vu`, `coach-entrainement` (défi, série, compteurs, record du mini-set), `coach-midi-map` (partagée avec `coach.html`), `coach-bibliotheque` (`coach.html`).
Toute valeur lue doit être validée : des données abîmées ne doivent jamais bloquer la page.

## Tester
```bash
python3 -m http.server 8765 &        # depuis la racine du dépôt
python3 tests/tdz.py                 # 5 états enregistrés, dont des données abîmées : aucune erreur attendue
python3 tests/robust.py              # Worker normal / bloqué / qui plante : la page reste jouable
python3 tests/clar.py                # écran de niveau (consigne, focus, piste)
```
Chromium est déjà installé pour Playwright (ne pas lancer `playwright install`).
Après chaque modification de `index.html`, vérifier au minimum `tdz.py` et `robust.py`,
puis regarder une capture d'écran.

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
- Messages de commit en français, qui décrivent le changement pour l'utilisateur.
- L'utilisateur juge sur ce qu'il voit : toujours lui dire de recharger la page de production après un push.
