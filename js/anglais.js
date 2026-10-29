/* ---------- Le dictionnaire anglais (lot 53) ----------
   Chargé juste après js/langue.js, qui explique comment il sert. Une ligne = une phrase telle que le site l'écrit en
   français (les espaces insécables et les apostrophes courbes comptent comme des espaces et des apostrophes droites), et
   sa traduction. Les phrases qui contiennent un nombre ou un nom sont des motifs (enMotif) : {#n} un nombre, {x} un
   texte traduit à son tour, {=x} un nom gardé tel quel ; dans l'anglais, {n:beat:beats} choisit le mot selon le nombre.
   Vocabulaire : table = controller, platine = deck, potard = knob, temps = beat, mesure = bar, phrase = phrase,
   « coupé » = all the way down, « normal » = at 12 o'clock. Vini tutoie : en anglais, il reste simple et chaleureux.
   Lot 53 : ce qu'un visiteur voit pendant ses 20 premières minutes. Le reste du site viendra au second lot ; d'ici là,
   une phrase absente reste en français. */
const enPareil = (...l) => l.forEach(x => { EN[trCle(x)] = x; });
const enDe = o => { for (const k in o) EN[trCle(k)] = o[k]; };

enPareil('FR', 'EN', 'DJingood', 'Vini', 'DJ', 'A', 'B', 'LOW', 'MID', 'HI', 'TRIM', 'CUE', 'PLAY', 'SYNC', 'FX', 'ON', 'OK',
  'XP', 'BPM', 'USB', 'MIDI', 'Pioneer DDJ-FLX4', 'DDJ-FLX4', 'FLX4', 'rekordbox', 'Chrome', 'Edge', 'Safari', 'Google', 'Play House');

/* ---------- Premiers pas (js/premiers.js) ---------- */
enDe({
  'Grand débutant': 'Total beginner',
  "Je n'ai jamais mixé": "I've never mixed",
  'Parfait, on part de zéro. Chaque bouton, un par un !': "Perfect, we'll start from scratch. Every button, one at a time!",
  'Apprenti DJ': 'Apprentice DJ',
  'Je sais lancer deux morceaux, mes transitions ne sont pas encore propres': "I can play two tracks, but my transitions aren't clean yet",
  'On saute les explications : tout est ouvert, en Mode Expert.': "We'll skip the explanations: everything is unlocked, in Expert Mode.",
  'DJ confirmé': 'Experienced DJ',
  'Je mixe déjà, je veux du défi': 'I already mix, I want a challenge',
  'Alors on attaque direct par un vrai set : plusieurs morceaux enchaînés, noté sur 100. Accroche-toi !': 'Then we go straight to a real set: several tracks in a row, scored out of 100. Hang on tight!',
  "J'ai une table": 'I have a controller',
  'Branche-la en USB : je la reconnais toute seule': "Plug it in over USB: I'll recognize it on my own",
  'Pas encore de table': 'No controller yet',
  'Je joue à la souris': "I'll play with the mouse",
  'Tranquille': 'Easy', 'à ton rythme !': 'at your own pace!',
  'Normal': 'Regular', 'en 2 semaines !': 'in 2 weeks!',
  'Intensif': 'Intense', 'encore plus vite !': 'even faster!',
  "C'est parti !": "Let's go!", "C'est parti": "Let's go", 'Commencer': 'Start', 'Continuer': 'Continue',
  'Branchée · je ne la connais pas encore': "Plugged in · I don't know it yet",
  'Branchée et reconnue': 'Plugged in and recognized',
  'Laquelle ? (si tu ne peux pas la brancher maintenant)': "Which one? (if you can't plug it in right now)",
  'Choisis ta table': 'Pick your controller',
  'Une autre table': 'Another controller',
  "Comment l'autoriser ?": 'How do I allow it?',
  'Ouvrir DJingood sur un ordinateur': 'Open DJingood on a computer',
  'Ouvrir DJingood dans Chrome': 'Open DJingood in Chrome',
  'Elle est branchée, mais je ne la vois pas ?': "It's plugged in, but I can't see it?",
  'Je vois ta table, mais je ne la connais pas encore : je te montrerai comment la régler, ça prend deux minutes.': "I can see your controller, but I don't know it yet: I'll show you how to set it up, it takes two minutes.",
  'Aucun problème : tout se joue à la souris. Tu brancheras une table plus tard.': 'No problem: everything works with the mouse. You can plug in a controller later.',
  'Sur iPhone et iPad, je ne peux pas parler à une table. Continue à la souris, et ouvre DJingood sur un ordinateur pour brancher ta table.': "On iPhone and iPad, I can't talk to a controller. Keep going without one, and open DJingood on a computer to plug yours in.",
  'Ce navigateur ne sait pas parler aux tables DJ : ouvre DJingood dans Chrome ou Edge pour brancher la tienne. En attendant, tout marche à la souris.': "This browser can't talk to DJ controllers: open DJingood in Chrome or Edge to plug yours in. Meanwhile, everything works with the mouse.",
  "Ton navigateur te demande si je peux parler à ta table : clique sur « Autoriser », en haut de l'écran.": 'Your browser is asking if I can talk to your controller: click "Allow" at the top of the screen.',
  "Ton navigateur m'a refusé l'accès à ta table. Regarde juste en dessous comment l'autoriser.": "Your browser didn't let me talk to your controller. Look just below to see how to allow it.",
  'Tu as une table DJ ?': 'Do you have a DJ controller?',
  'Pas de souci : quand tu la brancheras, je te montrerai comment la régler.': "No worries: when you plug it in, I'll show you how to set it up.",
  "Branche-la en USB, je t'attends ! Tu peux aussi continuer : je la reconnaîtrai plus tard.": "Plug it in over USB, I'm waiting! You can also keep going: I'll recognize it later.",
  "Salut, moi c'est Vini ! Je vais t'apprendre à mixer. D'abord, trois questions pour préparer ton parcours.": "Hi, I'm Vini! I'm going to teach you how to mix. First, three quick questions to set up your path.",
  'Tu en es où avec le mix ?': 'Where are you at with mixing?',
  "Combien de temps par jour pour t'entraîner ?": 'How much time a day do you want to practice?',
  'Musique : activée': 'Music: on', 'Musique : coupée': 'Music: off',
  'Couper la musique': 'Mute the music', 'Remettre la musique': 'Turn the music back on',
});
enMotif('Je la reconnais : ta {=n} est prête à jouer !', 'I recognize it: your {n} is ready to play!');
enMotif('Je connais la {=n} : je la reconnaîtrai dès que tu la brancheras.', "I know the {n}: I'll recognize it as soon as you plug it in.");
enMotif('{#n} min par jour', '{n} min a day');
enMotif('Avec {#n} min par jour, ta première vraie transition propre', 'With {n} min a day, your first real clean transition');

/* ---------- La page (index.html) : en-tête, onglets, accueil, fenêtres ---------- */
enPareil('ingood', 'DJINGOOD', 'VOL', 'CFX', 'ECHO', 'HOT CUE', 'Crossfader', 'CROSSFADER', 'CUE 🎧', 'House', 'Techno', 'Afro',
  'Mini-set', 'Quiz', 'Variations', 'Guide', '0 dB', '5 min', '10 min', '15 min', '0 XP', 'Hercules', 'Numark', 'Roland', 'Reloop');
EN[trCle('<span class="dj">DJ</span>ingood')] = '<span class="dj">DJ</span>ingood';
enDe({
  'DJingood · Apprends à mixer sur ta table DJ, en jouant': 'DJingood · Learn to mix on your DJ controller, by playing',
  'Retour': 'Back', 'Avancement': 'Progress', 'Passer': 'Skip', 'Fermer la leçon': 'Close the lesson',
  'Avancement de la leçon': 'Lesson progress', 'Ta semaine': 'Your week',
  "Schéma simplifié d'une table DJ": 'Simplified diagram of a DJ controller',
  'PLATINE A': 'DECK A', 'PLATINE B': 'DECK B', 'Platine A': 'Deck A', 'Platine B': 'Deck B',
  'Passer le guide': 'Skip the guide', 'Suivant': 'Next', 'Fermer': 'Close',
  'DJingood est en test': 'DJingood is in beta', 'Ton avis': 'Your feedback',
  "Qu'est-ce qui t'a bloqué ou gêné ?": 'What got you stuck or bothered you?', "Qu'est-ce qui t'a plu ?": 'What did you like?',
  'Ta note sur 5': 'Your rating out of 5', 'Ta note': 'Your rating', 'Envoyer mon avis': 'Send my feedback',
  "Ton avis part chez l'équipe DJingood avec le nom de l'écran, ta table et ton navigateur.": 'Your feedback goes to the DJingood team with the name of the screen, your controller and your browser.',
  'Ce que DJingood garde sur toi': 'What DJingood keeps about you',
  'Ton rapport': 'Your report', 'Copier mon rapport': 'Copy my report', 'Envoyer par e-mail': 'Send by email',
  'Tout recommencer à zéro': 'Start over from scratch',
  'Efface ta progression, tes étoiles, tes badges, tes réponses au quiz et tes avis sur cet ordinateur, et aussi sur ton compte si tu es connecté. Les réglages et la vérification de ta table sont gardés.': "Erases your progress, stars, badges, quiz answers and feedback on this computer, and on your account too if you're signed in. Your controller's settings and check are kept.",
  'Oui, tout effacer': 'Yes, erase everything',
  'Vérifier ma table': 'Check my controller', 'Un détail à noter ? (facultatif)': 'Anything to add? (optional)',
  'Rapport de vérification': 'Check report', 'Ça ne marche pas': "It doesn't work", 'Copier le rapport': 'Copy the report',
  'Recommencer': 'Start over', 'Ta progression': 'Your progress', 'Mon compte': 'My account',
  'Garder celle de mon compte': 'Keep the one on my account', 'Garder celle de cet ordinateur': 'Keep the one on this computer',
  'Tes étoiles, tes XP et tes badges te suivent partout': 'Your stars, XP and badges follow you everywhere',
  "Tu changes d'ordinateur ou de téléphone sans rien reperdre": 'Switch computers or phones without losing anything',
  'Même si tu vides ton navigateur, ta progression revient': 'Even if you clear your browser, your progress comes back',
  'Créer mon compte': 'Create my account', "J'ai déjà un compte": 'I already have an account',
  'Ton prénom': 'Your first name', 'Nathan': 'Alex', 'Ton e-mail': 'Your email', 'toi@exemple.fr': 'you@example.com',
  'Ton mot de passe': 'Your password', 'Voir': 'Show', 'Mot de passe oublié ?': 'Forgot your password?', 'ou': 'or',
  'Continuer avec Google': 'Continue with Google', 'Se déconnecter': 'Sign out',
  'Régler ma table': 'Set up my controller', "Je n'ai pas cette commande": "I don't have this control", 'Enregistrer': 'Save',
  "DJingood, retour à l'accueil": 'DJingood, back to home', 'Les transitions, un geste à la fois': 'Transitions, one move at a time',
  'Parcours': 'Path', 'Accueil': 'Home', 'Apprendre': 'Learn', "S'entraîner": 'Practice', 'Passer au vrai': 'Go for real',
  'Mes progrès : niveau, étoiles, badges': 'My progress: level, stars, badges', 'Niv. 1': 'Lvl 1',
  'Ma table : le schéma et les réglages': 'My controller: the diagram and the settings', 'Table…': 'Controller…',
  'Se connecter': 'Sign in', 'Mon avis': 'Feedback', 'Plus tard': 'Later', 'Ta prochaine étape': 'Your next step',
  "Tu as une table et tu n'y connais rien ?": "Got a controller and don't know the first thing about it?",
  'En deux semaines, tu fais tes premières vraies transitions propres, avec ta musique.': "In two weeks, you'll make your first real clean transitions, with your own music.",
  'Ta table, ce sera sur ordinateur.': 'Your controller will be for the computer.',
  "M'envoyer le lien": 'Send me the link', 'Ton niveau': 'Your level',
  "Je n'ai jamais mixé. On part de zéro : chaque bouton, un par un, puis tes premières transitions.": "I've never mixed. We start from scratch: every button, one at a time, then your first transitions.",
  'Je sais lancer deux morceaux. Tout est ouvert, en Mode Expert : chaque geste noté à la milliseconde.': 'I can play two tracks. Everything is unlocked, in Expert Mode: every move scored to the millisecond.',
  'Je mixe déjà. On attaque direct le calage sans SYNC, puis les combos sans filet.': 'I already mix. We go straight to beatmatching without SYNC, then combos with no safety net.',
  'Il te faut une table DJ branchée en USB (le site reconnaît tout seul une quinzaine de tables de débutant, de Pioneer, Hercules, Numark, Roland et Reloop ; les autres se règlent en une minute), et Chrome ou Edge. Pas encore de table ? Tu peux essayer à la souris.': "You need a DJ controller plugged in over USB (the site recognizes about fifteen beginner controllers on its own, from Pioneer, Hercules, Numark, Roland and Reloop; the others take a minute to set up), and Chrome or Edge. No controller yet? You can try with the mouse.",
  'Un geste à la fois, et ça vient vite !': 'One move at a time, and it comes fast!',
  'Faire sauter Vini': 'Make Vini jump', 'Quêtes du jour': 'Daily quests', 'Voir tout mon parcours': 'See my whole path',
  'Changer de parcours': 'Change path', 'Mes progrès et mes badges': 'My progress and badges',
  'Comment marche DJingood ?': 'How does DJingood work?', 'Guide du débutant': "Beginner's guide", 'Confidentialité': 'Privacy',
  "Tu connais les gestes : ici, tu les répètes jusqu'à ce qu'ils deviennent naturels.": 'You know the moves: here, you repeat them until they come naturally.',
  'À faire': 'To do', 'Défi du jour': 'Daily challenge', 'Une transition différente chaque jour.': 'A different transition every day.',
  'Nouveau': 'New', 'Un geste que tu connais, sur un autre morceau, un autre style, un autre tempo.': 'A move you know, on another track, another style, another tempo.',
  "À l'oreille": 'By ear', 'Sans compte à rebours : tu comptes les phrases dans ta tête.': 'No countdown: you count the phrases in your head.',
  "Trois transitions d'affilée, sans pouvoir rejouer : comme en soirée.": 'Three transitions in a row, no retries: just like at a party.',
  'Quiz éclair': 'Quick quiz', 'Cinq questions sur les gestes que tu connais déjà.': 'Five questions on the moves you already know.',
  'Mixe ta propre musique': 'Mix your own music',
  "Le site lit ta collection rekordbox et te trouve deux morceaux qui s'enchaînent bien. Toi, tu fais la transition sur ta table.": 'The site reads your rekordbox collection and finds two tracks that blend well. You do the transition on your controller.',
  'Exporte ta collection': 'Export your collection',
  'Dans rekordbox : menu Fichier, puis « Exporter la collection au format xml ».': 'In rekordbox: File menu, then "Export Collection in xml format".',
  'Choisis le fichier ici': 'Pick the file here', "Rien n'est envoyé : tout reste sur ton ordinateur.": 'Nothing is sent: everything stays on your computer.',
  'Reçois ta paire': 'Get your pair', 'Deux de tes morceaux qui vont ensemble, et des missions à faire dans rekordbox.': 'Two of your tracks that go together, and missions to do in rekordbox.',
  'Choisir mon fichier rekordbox': 'Pick my rekordbox file', "Essayer avec des morceaux d'exemple": 'Try with sample tracks',
  'Changer de fichier': 'Change file', 'Retirer': 'Remove', 'Ta paire du jour': 'Your pair of the day',
  'Une autre paire': 'Another pair', 'Changer de paire': 'Change pair', 'Choisir une paire moi-même': 'Pick a pair myself',
  'Choisis ta paire': 'Pick your pair', 'Revenir à la paire proposée': 'Back to the suggested pair',
  'Chercher un morceau ou un artiste': 'Search for a track or an artist', "Voir d'autres paires": 'See other pairs',
  'Tes missions dans rekordbox': 'Your missions in rekordbox', 'Voir toutes les missions': 'See all missions',
  'Ta table': 'Your controller', 'Ma table': 'My controller',
  'À quoi sert chaque commande, et lesquelles tu utilises dans les niveaux.': 'What each control does, and which ones you use in the levels.',
  "Ta table n'apparaît pas ?": "Your controller doesn't show up?", 'Tester ta table': 'Test your controller',
  '10 minutes : le site vérifie chaque commande avec toi.': '10 minutes: the site checks every control with you.',
  'Vérifier ma table pas à pas': 'Check my controller step by step', 'Régler ma table pas à pas': 'Set up my controller step by step',
  "Revenir aux réglages d'origine": 'Back to the original settings',
  'Schéma simplifié, sur le modèle de la DDJ-FLX4 : la disposition exacte peut différer de ta table.': 'Simplified diagram, based on the DDJ-FLX4: the exact layout may differ from your controller.',
  'Mes progrès': 'My progress', "Aujourd'hui": 'Today', 'Changer mon objectif': 'Change my goal',
  'Objectif du jour, en minutes': 'Daily goal, in minutes', 'Objectif': 'Goal',
  'Les parties et le quiz remplissent ton objectif.': 'Games and the quiz fill up your goal.',
  'Ton prochain badge': 'Your next badge', 'Y aller': 'Go', 'Mes badges': 'My badges',
  'Touche une médaille pour savoir comment la gagner.': 'Tap a medal to see how to earn it.', 'Mes chapitres': 'My chapters',
  'Comprendre': 'Understand', '· sans table': '· no controller',
  '7 petites leçons pour entendre ce que fait un DJ. Juste ton doigt et le son.': '7 short lessons to hear what a DJ does. Just your finger and the sound.',
  'Chapitres': 'Chapters', 'Niveaux': 'Levels', 'Test de placement': 'Placement test', 'Quitter le test': 'Quit the test', 'Quitter': 'Quit',
  'Comment faire ?': 'How do I do it?',
  "Clavier : espace pour lancer B, E pour l'écho. Niveau réussi ? Refais le même geste dans rekordbox, avec ta musique.": 'Keyboard: space to start B, E for the echo. Level passed? Do the same move in rekordbox, with your own music.',
  'Mode Expert': 'Expert Mode', "Comment c'est noté ?": 'How is it scored?', 'Pendant le niveau': 'During the level',
  'Regarde la démo si tu hésites, puis à toi !': "Watch the demo if you're not sure, then it's your turn!",
  'Appuie sur Jouer': 'Press Play', 'Piste : les gestes arrivent vers la ligne de frappe': 'Track: the moves come toward the hit line',
  'DÉMO': 'DEMO', 'Afficher la table': 'Show the controller', 'Alors ?': 'So?', 'Calés': 'In sync',
  'B en avance': 'B ahead', 'B en retard': 'B behind',
  'Molette de A': 'Jog wheel of A', 'Molette': 'Jog wheel', 'Tempo de A': 'Tempo of A', 'Lecture ou pause de A': 'Play or pause A',
  'BOUCLE': 'LOOP', 'Table de mixage': 'Mixer',
  'TRIM de A': 'TRIM of A', 'Aigus de A': 'Highs of A', 'Médiums de A': 'Mids of A', 'Basses de A': 'Lows of A', 'Filtre de A': 'Filter of A',
  'FILTRE': 'FILTER',
  'TRIM de B': 'TRIM of B', 'Aigus de B': 'Highs of B', 'Médiums de B': 'Mids of B', 'Basses de B': 'Lows of B', 'Filtre de B': 'Filter of B',
  'Écouter A au casque': 'Listen to A in the headphones', 'Écouter B au casque': 'Listen to B in the headphones',
  'Volume de A': 'Volume of A', 'Volume de B': 'Volume of B', 'Tempo de B': 'Tempo of B', 'Molette de B': 'Jog wheel of B',
  'LANCE B': 'START B', 'Position de départ': 'Starting position',
  'Place ta table comme ci-dessous. « Jouer » se débloque quand tout est vert.': 'Set your controller like below. "Play" unlocks when everything is green.',
  'Je joue à la souris cette fois': "I'll play with the mouse this time",
  'Morceaux : vraie musique': 'Tracks: real music', 'Style des morceaux': 'Track style', 'Vraie musique': 'Real music',
  'Surprise': 'Surprise me', 'Mode': 'Mode', 'Guidé': 'Guided', "Regarde d'abord": 'Watch first', 'Jouer': 'Play',
  'Ta feuille de route': 'Your roadmap', 'À travailler': 'To work on', 'Rejouer': 'Play again', 'Niveau suivant': 'Next level',
  'Question bonus · +5 XP': 'Bonus question · +5 XP', 'Voir le détail': 'See the details',
  'Voir mon geste et le geste idéal': 'See my move and the ideal move',
  'Comparaison entre ton geste et le geste idéal': 'Comparison between your move and the ideal move',
  'geste idéal': 'ideal move', 'ton geste': 'your move', "C'était clair ?": 'Was it clear?',
  'Oui': 'Yes', 'Bof': 'Meh', 'Non': 'No', 'Merci !': 'Thanks!',
  'Couper les sons du jeu': 'Mute the game sounds', 'Sons du jeu : activés': 'Game sounds: on',
  'Vini, la mascotte de DJingood': "Vini, DJingood's mascot", 'Se connecter pour garder ta progression': 'Sign in to keep your progress',
  'Lance B (PLAY de droite)': 'Start B (right PLAY)',
  'Chaque geste arrive sur la piste avec un repère ◆ et un compte à rebours : fais-le quand il touche la ligne.': 'Each move comes down the track with a ◆ marker and a countdown: do it when it touches the line.',
  'neutre': 'centered', "À l'oreille · précision ×2": 'By ear · precision ×2',
  'MAINTENANT': 'NOW',
  'Choisis ton niveau : DJingood te prépare le parcours qui va avec. Tu pourras en changer quand tu veux.': "Pick your level: DJingood sets up the path that goes with it. You can change it whenever you want.",
  'Table non autorisée': 'Controller not allowed',
});
enMotif('Hot cue {#n} de {=p} (vide : un clic le pose)', 'Hot cue {n} of {p} (empty: one click sets it)');
enMotif('Niveau {#n}', 'Level {n}');
enMotif('Niv. {#n}', 'Lvl {n}');
enMotif('Étape {#n}', 'Step {n}');
enMotif('Chapitre {#n}', 'Chapter {n}');
enMotif('{x} · {#n} BPM', '{x} · {n} BPM');
enMotif('{#n} XP', '{n} XP');

/* ---------- Les niveaux (js/niveaux.js) : chapitres 1 et 3, carte de fin, consignes, corrections ---------- */
enPareil('AB', 'SWAP', 'Intro', 'Outro', 'Drop', 'Break', 'Phrase', 'Swap', 'hot cue', 'Hot cue', 'Quantize', 'Niv.');
enDe({
  'tard': 'late', 'tôt': 'early',
  'Le bon moment': 'The right moment', 'Lance B pile quand A entre dans son outro.': 'Start B right when A enters its outro.',
  'Le geste arrive sur la piste : appuie sur LANCE B (ou PLAY de droite sur ta table) quand il touche la ligne. Tout le reste est automatique.': 'The move comes down the track: press START B (or the right PLAY on your controller) when it touches the line. Everything else is automatic.',
  'Le fader': 'The fader', 'Fais entrer B en douceur, puis fais sortir A avant le drop.': 'Bring B in smoothly, then take A out before the drop.',
  "B démarre tout seul, fader en bas. Monte son fader jusqu'en haut, doucement, sur 16 à 32 temps. Puis baisse celui de A jusqu'en bas : il doit y être quand le drop de B arrive sur la ligne.": "B starts on its own, fader down. Bring its fader all the way up, slowly, over 16 to 32 beats. Then bring A's fader all the way down: it must be there when B's drop reaches the line.",
  'La coupure sèche': 'The hard cut', 'Coupe A et lance B sur son drop, au même instant.': 'Cut A and start B on its drop, at the same instant.',
  "B est calé sur son drop. Quand les losanges touchent la ligne, lance B (PLAY droite ou espace) et baisse d'un coup le fader de A, dans le même geste.": "B is cued on its drop. When the diamonds touch the line, start B (right PLAY or space) and drop A's fader all at once, in the same move.",
  "L'écho out": 'The echo out', 'Fais disparaître A dans un écho, puis B tombe sur son drop.': 'Make A vanish into an echo, then B lands on its drop.',
  "Sur le dernier temps avant la ligne, active l'écho (bouton ECHO, ON de l'effet sur ta table, ou touche E), puis baisse d'un coup le fader de A sur la ligne. B démarre tout seul sur son drop.": "On the last beat before the line, turn on the echo (ECHO button, the effect's ON on your controller, or the E key), then drop A's fader all at once on the line. B starts on its own, on its drop.",
  'Le filtre': 'The filter', 'Efface A en douceur avec le filtre pendant que B joue.': 'Fade A out smoothly with the filter while B plays.',
  'B joue déjà, tout seul. Quand « FILTRE » touche la ligne, tourne le potard CFX de A vers la droite, lentement : il doit être tout à droite quand « À FOND » arrive, juste avant le drop de B.': "B is already playing, on its own. When \"FILTER\" touches the line, turn A's CFX knob to the right, slowly: it must be all the way right when \"FULL\" arrives, just before B's drop.",
  'Le swap des basses': 'The bass swap', 'Échange les basses de A et B pile sur la ligne.': 'Swap the lows of A and B right on the line.',
  "B joue déjà, tout seul, basses coupées. Quand le repère « SWAP » touche la ligne, échange les basses d'un seul geste, une main sur chaque potard : LOW de A normal → coupé, LOW de B coupé → normal.": "B is already playing, on its own, lows cut. When the \"SWAP\" marker touches the line, swap the lows in a single move, one hand on each knob: A's LOW normal → cut, B's LOW cut → normal.",
  'La transition complète': 'The full transition', 'Le final : tout toi-même, comme en soirée.': 'The finale: all by yourself, like at a party.',
  "Le LOW de B est déjà coupé (position de départ) : B entre sans ses basses. Lance B quand le repère touche la ligne et monte son fader jusqu'en haut. À la phrase suivante, échange les basses (LOW de A coupé, LOW de B normal). Enfin, baisse le fader de A jusqu'en bas avant le drop.": "B's LOW is already cut (starting position): B comes in without its lows. Start B when the marker touches the line and bring its fader all the way up. On the next phrase, swap the lows (A's LOW cut, B's LOW normal). Finally, bring A's fader all the way down before the drop.",
  "L'intro courte": 'The short intro', "Lance B pour que son drop tombe pile quand A s'arrête.": 'Start B so its drop lands right when A stops.',
  "Ici, B n'a que 16 temps d'intro. Sur la piste, la forme d'onde bleue pâle montre où tomberait B si tu le lançais maintenant : lance-le quand son drop (là où l'onde grossit) s'aligne sur la fin de A.": 'Here, B has only 16 beats of intro. On the track, the pale blue waveform shows where B would land if you started it now: start it when its drop (where the wave gets bigger) lines up with the end of A.',
  'A entre dans son outro': 'A enters its outro', 'Son drop tombera pile à la fin de A': 'Its drop will land right at the end of A',
  'Le piège du break': 'The break trap', 'Ne te fais pas avoir par le break : attends la vraie fin de A.': "Don't get fooled by the break: wait for the real end of A.",
  "A a un break au milieu : la musique se vide, puis repart de plus belle. Repère sur la forme d'onde la vraie fin du morceau, puis lance B (32 temps d'intro) pour que son drop tombe quand A s'arrête.": 'A has a break in the middle: the music empties out, then comes back stronger. Find the real end of the track on the waveform, then start B (32-beat intro) so its drop lands when A stops.',
  "Break : ce n'est pas la fin !": "Break: it's not the end!", 'A repart à fond': 'A comes back full on', 'Vraie outro : B est lancé': 'Real outro: B is started',
  'Une seule mélodie à la fois': 'One melody at a time', 'Coupe le MID de A quand la mélodie de B arrive.': "Cut A's MID when B's melody comes in.",
  "A joue encore sa mélodie pendant son outro, et B a une mélodie dans son intro. Quand celle de B commence, coupe le MID de A (le potard des médiums, là où vivent les mélodies et les voix) pour qu'on n'entende jamais deux mélodies ensemble. B arrive tout seul.": "A still plays its melody during its outro, and B has a melody in its intro. When B's starts, cut A's MID (the mids knob, where melodies and vocals live) so you never hear two melodies together. B comes in on its own.",
  'MÉLODIE': 'MELODY', 'B arrive, sans mélodie': 'B comes in, no melody', 'La mélodie de B commence : MID de A coupé': "B's melody starts: A's MID cut",
  'Lecture express': 'Speed reading', "Structure inconnue : lis les formes d'onde et lance B au bon moment.": 'Unknown structure: read the waveforms and start B at the right moment.',
  "À chaque partie, l'outro de A et l'intro de B changent de longueur. Lis la forme d'onde de A pour trouver sa fin, regarde l'intro de B, et lance B pour que son drop tombe quand A s'arrête.": "Every game, A's outro and B's intro change length. Read A's waveform to find its end, look at B's intro, and start B so its drop lands when A stops.",
  // Les repères dessinés sur la piste
  'MONTE B': 'B UP', 'B À FOND': 'B FULL', 'A SORTI': 'A OUT', 'COUPE A': 'CUT A', 'À FOND': 'FULL',
  // Ce qu'il faut faire, dans le compte à rebours
  'lance B (PLAY de droite)': 'start B (right PLAY)', 'commence à monter le fader de B, doucement': "start bringing B's fader up, slowly",
  "monte le fader de B jusqu'en haut": "bring B's fader all the way up", "baisse le fader de A jusqu'en bas": "bring A's fader all the way down",
  'échange les basses : LOW de A normal → coupé, LOW de B coupé → normal': "swap the lows: A's LOW normal → cut, B's LOW cut → normal",
  'commence à tourner le filtre de A vers la droite, lentement': "start turning A's filter to the right, slowly", 'filtre de A tout à droite': "A's filter all the way right",
  "allume l'écho": 'turn on the echo', "baisse d'un coup le fader de A jusqu'en bas": "drop A's fader all the way down at once",
  'coupe le MID de A (normal → coupé)': "cut A's MID (normal → cut)",
  // Les mots du DJ (« Comment faire ? »)
  "le début d'un morceau, plus léger, fait pour le mélanger au morceau d'avant": 'the start of a track, lighter, made to blend with the track before',
  "la fin d'un morceau, qui se vide peu à peu : c'est là qu'on fait entrer le suivant": "the end of a track, which empties out little by little: that's where you bring in the next one",
  "le moment où tout le morceau arrive d'un coup, basses comprises, après l'intro ou un break": 'the moment the whole track hits at once, lows included, after the intro or a break',
  'une pause au milieu du morceau : la musique se vide, puis repart de plus belle': 'a pause in the middle of the track: the music empties out, then comes back stronger',
  '32 temps, soit 8 mesures de 4 temps : la musique change au début de chaque phrase': '32 beats, which is 8 bars of 4 beats: the music changes at the start of each phrase',
  "l'échange des basses entre les deux morceaux": 'swapping the lows between the two tracks',
  'écho': 'echo', 'Écho': 'Echo', "un effet qui répète le son en le laissant s'éteindre": 'an effect that repeats the sound while letting it fade away',
  "un repère gardé sur un pad : un premier appui le pose, les suivants font repartir le morceau de là (même s'il était arrêté). Pour l'effacer : SHIFT + pad sur la table, clic droit à l'écran": 'a marker saved on a pad: the first press sets it, the next ones restart the track from there (even if it was stopped). To erase it: SHIFT + pad on the controller, right-click on screen',
  'Boucle': 'Loop', "un passage de 4, 8 ou 16 temps qui se répète tant qu'on n'en sort pas (EXIT)": "a 4, 8 or 16-beat section that repeats until you leave it (EXIT)",
  "un réglage qui range les repères et les boucles sur le temps le plus proche, même si l'appui tombe un peu à côté": 'a setting that snaps markers and loops to the nearest beat, even if your press is slightly off',
  // Sous le compte à rebours
  'temps avant de monter B': 'beats before bringing in B', 'temps avant de tourner le filtre': 'beats before turning the filter',
  'temps : filtre à fond avant le drop': 'beats: filter all the way before the drop', "temps avant d'activer l'écho": 'beats before turning on the echo',
  'temps avant de couper A': 'beats before cutting A', 'temps avant de lancer B': 'beats before starting B', 'temps pour monter B': 'beats to bring B up',
  'temps avant le swap': 'beats before the swap', 'temps avant le drop de B : A doit être sorti': "beats before B's drop: A must be out",
  // Les chapitres
  'Les bases': 'The basics', 'Guidé, un geste à la fois': 'Guided, one move at a time', 'La maîtrise': 'Mastery',
  "À l'oreille, précision ×2": 'By ear, precision ×2', 'Les vrais morceaux': 'Real tracks', "Formes d'onde, breaks, mélodies": 'Waveforms, breaks, melodies',
  'Les combos': 'Combos', 'Plusieurs gestes, au demi-temps près': 'Several moves, to the half beat', 'Le calage': 'Beatmatching',
  'Caler deux morceaux soi-même, sans SYNC': 'Beatmatch two tracks yourself, without SYNC', 'Hot cues et boucles': 'Hot cues and loops',
  'Partir au bon endroit, gagner du temps': 'Start at the right spot, save time', 'Le set': 'The set', 'Des morceaux enchaînés, sans pause': 'Tracks back to back, no pause',
  'Bientôt': 'Coming soon', "BPM · à l'oreille · précision serrée": 'BPM · by ear · tight precision', 'Style surprise à chaque partie': 'Surprise style every game',
  'Chapitre 6 : hot cues et boucles. Quantize allumé, mais chaque appui est noté en millisecondes.': 'Chapter 6: hot cues and loops. Quantize is on, but every press is scored in milliseconds.',
  "Chapitre 6 : Quantize éteint. Repères et boucles partent exactement à l'appui.": 'Chapter 6: Quantize off. Markers and loops start exactly when you press.',
  'Chapitre 5 : B ne se cale plus tout seul. Le site mesure le décalage pendant toute la partie.': 'Chapter 5: B no longer syncs itself. The site measures the drift for the whole game.',
  "Chapitre 4 : plusieurs gestes d'affilée, notés au demi-temps près. 3 étoiles seulement si tout est juste.": 'Chapter 4: several moves in a row, scored to the half beat. 3 stars only if everything is right.',
  "Chapitre 3 : plus de compte à rebours. Lis les formes d'onde, comme dans rekordbox. La démo montre le bon moment.": 'Chapter 3: no more countdown. Read the waveforms, like in rekordbox. The demo shows the right moment.',
  'Chapitre 2 : pas de compte à rebours, et il faut être deux fois plus précis. Regarde la démo si besoin.': 'Chapter 2: no countdown, and you need to be twice as precise. Watch the demo if needed.',
  'Les contrôles grisés bougent tout seuls : regarde-les, ils te montrent le geste.': 'The grayed-out controls move on their own: watch them, they show you the move.',
  'Noté sur 100': 'Scored out of 100', 'Quantize allumé · noté en ms': 'Quantize on · scored in ms', 'Quantize éteint · noté en ms': 'Quantize off · scored in ms',
  "À l'oreille, sans geste": 'By ear, no moves', "Lis les formes d'onde": 'Read the waveforms',
  'Sans compte à rebours · au demi-temps près': 'No countdown · to the half beat', 'Au demi-temps près': 'To the half beat',
  'Place ta table en position de départ, puis appuie sur Jouer.': 'Set your controller to the starting position, then press Play.',
  'Pas de repère cette fois. Enchaîne comme en soirée !': 'No markers this time. Mix it like at a party!',
  'Mode Expert : ni compte à rebours, ni repère, ni calage automatique. Chaque geste est noté en millisecondes.': 'Expert Mode: no countdown, no markers, no auto-sync. Every move is scored in milliseconds.',
  "Lis les gestes à faire, ou regarde d'abord la démo. Puis à toi !": "Read the moves to make, or watch the demo first. Then it's your turn!",
  'Revoir la fiche :': 'See the card again:', 'Arrêter': 'Stop',
  'Remets ta table en position de départ : « Jouer » se débloquera tout seul.': 'Put your controller back in the starting position: "Play" will unlock on its own.',
  'Préparation…': 'Getting ready…', 'Préparation (quelques secondes)…': 'Getting ready (a few seconds)…',
  "House · 124 BPM · la vraie musique n'a pas pu se charger": "House · 124 BPM · the real music couldn't load",
  'Démonstration : regarde les contrôles bouger et écoute le résultat.': 'Demo: watch the controls move and listen to the result.',
  'Astuce : sur ta table, choisis le bon mode des pads (HOT CUE ou BEAT LOOP).': 'Tip: on your controller, pick the right pad mode (HOT CUE or BEAT LOOP).',
  "Astuce : la touche E active aussi l'écho.": 'Tip: the E key turns on the echo too.', "Astuce : la barre d'espace lance aussi B.": 'Tip: the space bar starts B too.',
  // Ce qui s'affiche pendant la partie
  'PARFAIT !': 'PERFECT!', 'Trop tôt !': 'Too early!', 'Trop tard !': 'Too late!',
  'Bonne phrase… mais pas la bonne': 'On a phrase… but the wrong one', 'Raté : milieu de phrase': 'Missed: middle of a phrase',
  'Ici, B part de son hot cue : appuie sur le pad 1 de B.': "Here, B starts from its hot cue: press B's pad 1.",
  'Écho lancé !': 'Echo on!', 'Écho trop tôt': 'Echo too early', 'Écho trop tard': 'Echo too late',
  "B part sur le 1 de l'outro": 'B starts on the 1 of the outro', 'Même tempo, même phrase : B joue sous A': 'Same tempo, same phrase: B plays under A',
  'B entre, fader en bas': 'B comes in, fader down', 'B est à fond': 'B is all the way up', 'A est sorti': 'A is out', 'Drop de B !': "B's drop!",
  'Prépare tes deux mains': 'Get both hands ready', 'A coupé et B lancé, au même instant': 'A cut and B started, at the same instant',
  'Transition nette, sans mélange': 'Clean transition, no blending', 'Écoute la fin de phrase de A': "Listen to the end of A's phrase",
  'Écho activé sur le dernier temps': 'Echo on, on the last beat', "Fader de A coupé : l'écho résonne": "A's fader cut: the echo rings out",
  'B tombe sur son drop': 'B lands on its drop', 'B joue déjà sous A': 'B is already playing under A',
  'Le filtre commence : A perd ses basses': 'The filter starts: A loses its lows', 'On continue lentement': 'Keep going slowly',
  "Filtre à fond : A n'est plus qu'un souffle": 'Filter all the way: A is just a whisper', 'B joue sous A, basses coupées': 'B plays under A, lows cut',
  'Swap : A coupé, B ouvert': 'Swap: A cut, B open', 'Les basses de B ont pris le relais': "B's lows have taken over",
  'B attend, basses coupées': 'B waits, lows cut', 'B part sur le 1': 'B starts on the 1', 'Swap des basses': 'Bass swap',
  'SWAP PARFAIT !': 'PERFECT SWAP!', 'Swap en retard': 'Late swap', 'Swap en avance': 'Early swap', 'Swap pas tout à fait net': 'Swap not quite clean',
  'Swap raté': 'Swap missed', "Le swap, c'était maintenant !": 'The swap was now!', 'B est installé !': 'B is settled in!',
  'B est à fond… un peu tard': 'B is all the way up… a bit late', 'A sorti à temps !': 'A out in time!', 'A sorti trop tôt': 'A out too early',
  'Deux basses en même temps !': 'Two basslines at once!', 'Mélodie coupée pile !': 'Melody cut right on time!', 'Coupé trop tôt': 'Cut too early',
  'Coupé en retard': 'Cut late', 'Deux mélodies en même temps !': 'Two melodies at once!', 'Trop tard ! Lance B': 'Too late! Start B',
  'Mauvais côté ! Tourne vers la droite': 'Wrong way! Turn it to the right', 'Filtre lancé !': 'Filter started!', 'Filtre trop tôt': 'Filter too early',
  'Filtre en retard': 'Filter late', 'Tourne le filtre !': 'Turn the filter!', "A s'efface en douceur !": 'A fades out smoothly!', 'Trop brusque !': 'Too abrupt!',
  'Un peu tard': 'A bit late', "A n'est pas filtré au drop !": "A isn't filtered at the drop!", "Pas d'écho !": 'No echo!',
  'ECHO OUT PARFAIT !': 'PERFECT ECHO OUT!', 'Coupé… mais sans écho': 'Cut… but no echo', 'Coupure nette !': 'Clean cut!', 'Coupe A !': 'Cut A!',
  "Lis les formes d'onde et agis au bon moment.": 'Read the waveforms and act at the right moment.',
  'Mode Expert : aucun repère, à toi de sentir le moment.': "Expert Mode: no markers, it's up to you to feel the moment.",
  'Pas de compte à rebours : écoute et sens la phrase.': 'No countdown: listen and feel the phrase.',
  'Écoute le résultat…': 'Listen to the result…',
  // La carte de fin
  "Tu n'as pas lancé B : écoute le compte à rebours et appuie quand il arrive à zéro.": "You didn't start B: listen to the countdown and press when it hits zero.",
  "B est parti pile sur le 1 de l'outro de A.": "B started right on the 1 of A's outro.", 'B est parti pile sur le début de la phrase.': 'B started right at the start of the phrase.',
  "B est parti sur le début d'une autre phrase (une phrase trop tard) : c'est en rythme, mais pas au bon moment du morceau.": "B started at the beginning of another phrase (one phrase too late): it's on beat, but not at the right moment in the track.",
  "B est parti sur le début d'une autre phrase (une phrase trop tôt) : c'est en rythme, mais pas au bon moment du morceau.": "B started at the beginning of another phrase (one phrase too early): it's on beat, but not at the right moment in the track.",
  "B n'est jamais arrivé à fond : monte son fader jusqu'en haut.": 'B never got all the way up: bring its fader all the way up.',
  "Tu as monté B presque d'un coup : étale le geste sur 16 temps au moins pour une entrée douce.": 'You brought B up almost all at once: spread the move over at least 16 beats for a smooth entry.',
  "Montée de B progressive : l'entrée est douce.": 'B came up gradually: a smooth entry.',
  'A jouait encore au drop de B : deux basses en même temps. Baisse A avant que le compte à rebours arrive à zéro.': "A was still playing at B's drop: two basslines at once. Bring A down before the countdown hits zero.",
  'Il y a eu un creux de volume : les deux faders étaient bas en même temps.': 'There was a volume dip: both faders were down at the same time.',
  'Pas de creux de volume pendant la transition.': 'No volume dip during the transition.',
  "Les basses de A n'ont jamais été coupées : passe son LOW de normal à coupé (tout à gauche).": "A's lows were never cut: turn its LOW from normal to cut (all the way left).",
  "Les basses de B n'ont jamais été remises : passe son LOW de coupé à normal (à midi).": "B's lows were never brought back: turn its LOW from cut to normal (12 o'clock).",
  'Swap pile sur le début de la phrase.': 'Swap right at the start of the phrase.',
  'Les basses passent de A à B sans chevauchement ni trou.': 'The lows go from A to B with no overlap and no gap.',
  'Tu as tourné le filtre vers la gauche : de ce côté il enlève les aigus et garde les basses. Pour effacer A, tourne vers la droite.': 'You turned the filter to the left: on that side it removes the highs and keeps the lows. To fade A out, turn it to the right.',
  "Le filtre n'a jamais été tourné : tourne le CFX de A vers la droite.": "The filter was never turned: turn A's CFX to the right.",
  "A n'était pas complètement filtré au drop de B : va jusqu'au bout du potard avant « À FOND ».": "A wasn't fully filtered at B's drop: turn the knob all the way before \"FULL\".",
  "Tu n'as pas activé l'écho : appuie sur ECHO juste avant de couper A.": "You didn't turn on the echo: press ECHO just before cutting A.",
  'Écho activé sur le dernier temps de la phrase.': 'Echo on, on the last beat of the phrase.',
  "A n'a jamais été coupé : baisse son fader d'un coup sur la ligne.": 'A was never cut: drop its fader all at once on the line.',
  "A coupé pile au début de la phrase : B tombe dans l'écho.": 'A cut right at the start of the phrase: B drops into the echo.',
  "L'écho était lancé avant la coupure : A s'éteint en douceur.": 'The echo was on before the cut: A fades away smoothly.',
  "Tu as coupé A avant de lancer l'écho : il n'y avait plus rien à faire résonner.": 'You cut A before turning on the echo: there was nothing left to echo.',
  "A n'a jamais été coupé : baisse son fader d'un coup au moment où B démarre.": 'A was never cut: drop its fader all at once the moment B starts.',
  'A coupé pile sur la ligne.': 'A cut right on the line.',
  'Coupure et lancement en même temps : la transition est nette.': 'Cut and start at the same time: the transition is clean.',
  "Tu n'as pas lancé B : repère la fin de A sur la forme d'onde, puis lance B pour que son drop tombe dessus.": "You didn't start B: find the end of A on the waveform, then start B so its drop lands on it.",
  "Le drop de B est tombé pile quand A s'est arrêté.": "B's drop landed right when A stopped.",
  "Tu t'es fait piéger par le break de A : la musique s'est vidée, mais ce n'était pas la fin. Sur la forme d'onde, on voyait qu'elle repartait.": "You got fooled by A's break: the music emptied out, but it wasn't the end. On the waveform, you could see it coming back.",
  "Le MID de A n'a jamais été coupé : les deux mélodies se sont superposées.": "A's MID was never cut: the two melodies stacked on top of each other.",
  'MID de A coupé pile quand la mélodie de B commence : une seule mélodie à la fois.': "A's MID cut right when B's melody starts: one melody at a time.",
  'À toi ! Appuie sur Jouer et refais exactement la même chose.': 'Your turn! Press Play and do exactly the same thing.', 'À toi de jouer': 'Your turn',
  'Basses de B coupées avant de le lancer.': "B's lows cut before starting it.",
  'B est parti avec ses basses ouvertes : coupe son LOW avant de le lancer.': 'B started with its lows open: cut its LOW before starting it.',
  'Expert : niveau pro !': 'Expert: pro level!', 'Expert : bien, encore un peu de précision.': 'Expert: good, a little more precision.',
  'Expert : pas encore. Écoute, compte, anticipe.': 'Expert: not yet. Listen, count, anticipate.',
  'Set de pro !': 'Pro set!', 'Beau set !': 'Nice set!', 'Pas encore. Lis le conseil et rejoue.': 'Not yet. Read the tip and play again.',
  'Parfait, transition de pro !': 'Perfect, a pro transition!', 'Presque ! Un détail à régler.': 'Almost! One detail to fix.',
  'Score maximum déjà atteint': 'Top score already reached',
  'Chapitres 2, 4, 5, 6 et 7 débloqués !': 'Chapters 2, 4, 5, 6 and 7 unlocked!', 'Chapitres 2, 4, 5 et 7 débloqués !': 'Chapters 2, 4, 5 and 7 unlocked!',
  'Chapitre 3 débloqué !': 'Chapter 3 unlocked!', 'Le détail': 'The details',
  'Rejouer à 100 %': 'Play again at 100%', 'Réessayer à 80 %': 'Try again at 80%', 'Réessayer au ralenti (90 %)': 'Try again slowed down (90%)',
});
enMotif('{#n} temps', '{n} {n:beat:beats}');
enMotif('{#n} ms', '{n} ms');
enMotif('{#n} temps trop tôt', '{n} {n:beat:beats} too early');
enMotif('{#n} temps trop tard', '{n} {n:beat:beats} too late');
enMotif('B lancé : {#n} temps avant la fin de A', 'B started: {n} {n:beat:beats} before the end of A');
enMotif('Chapitre {#n} · {x}', 'Chapter {n} · {x}');
enMotif('Verrouillé : {#n}/{#m} ★ au chapitre {#c}', 'Locked: {n}/{m} ★ in chapter {c}');
enMotif('Niveau {#n} : {x}, {#s} étoile(s) sur 3', 'Level {n}: {x}, {s} {s:star:stars} out of 3');
enMotif('Chapitre {#c} · Niveau {#n} sur {#m}', 'Chapter {c} · Level {n} of {m}');
enMotif('Niveau {#n} sur {#m}', 'Level {n} of {m}');
enMotif('Calé à moins de {#n} ms', 'In sync within {n} ms');
enMotif('Revoir la fiche : {x}', 'See the card again: {x}');
enMotif('{x} · {#n} BPM · ralenti {#p} %', '{x} · {n} BPM · slowed to {p}%');
enMotif(/^(Maintenant : |Dans (\d+) temps : )(.+?)( !|\.)$/, (m, debut, n, quoi) =>
  (n ? 'In ' + n + (n === '1' ? ' beat: ' : ' beats: ') : 'Now: ') + quoi.split(' et ').map(tr).join(' and ') + (n ? '.' : '!'));
enMotif(/^(Intro|Outro|Drop|Break|Phrase|Swap|Écho|Hot cue|Boucle|Quantize) : (.+?)(\.?)$/, (m, mot, def, point) =>
  / (?:Intro|Outro|Drop|Break|Phrase|Swap|Écho|Hot cue|Boucle|Quantize) : /.test(def) ? null : tr(mot) + ': ' + tr(def) + point);
enMotif("B est parti {#n} temps trop tard : son drop tombe {#m} temps après la fin de phrase de A, ça s'entend comme un décalage.", "B started {n} {n:beat:beats} too late: its drop lands {m} {m:beat:beats} after the end of A's phrase, and you can hear it's off.");
enMotif("B est parti {#n} temps trop tôt : son drop tombe {#m} temps avant la fin de phrase de A, ça s'entend comme un décalage.", "B started {n} {n:beat:beats} too early: its drop lands {m} {m:beat:beats} before the end of A's phrase, and you can hear it's off.");
enMotif("B est parti {#n} temps trop {x}, en plein milieu d'une phrase : les deux morceaux ne changent plus en même temps. Attends le début de la phrase.", 'B started {n} {n:beat:beats} too {x}, right in the middle of a phrase: the two tracks no longer change at the same time. Wait for the start of the phrase.');
enMotif('B est arrivé à fond au temps {#n}, bien installé avant la suite.', 'B was all the way up at beat {n}, well settled before what comes next.');
enMotif('B est arrivé à fond tard (temps {#n}). Vise le temps 64.', 'B got all the way up late (beat {n}). Aim for beat 64.');
enMotif('A est sorti tôt (temps {#n}), avant que B soit vraiment installé.', 'A went out early (beat {n}), before B was really settled in.');
enMotif('A est sorti au temps {#n}, avant le drop de B.', "A went out at beat {n}, before B's drop.");
enMotif('Swap à {x} du début de la phrase.', 'Swap {x} from the start of the phrase.');
enMotif('Swap {x} trop tard.', 'Swap {x} too late.');
enMotif('Swap {x} trop tôt.', 'Swap {x} too early.');
enMotif('Swap à {x} de la phrase : vise le début de la phrase.', 'Swap {x} off the phrase: aim for the start of the phrase.');
enMotif('Deux basses ensemble pendant {x} : ouvre B et coupe A dans le même geste.', 'Two basslines together for {x}: open B and cut A in the same move.');
enMotif('Deux basses ensemble pendant {x} : ça frotte un peu.', 'Two basslines together for {x}: it clashes a bit.');
enMotif("Plus aucune basse pendant {x} : l'énergie retombe.", 'No bass at all for {x}: the energy drops.');
enMotif('Petit trou dans les basses ({x}).', 'Small gap in the lows ({x}).');
enMotif('Filtre lancé au temps {#n}, au début de la phrase.', 'Filter started at beat {n}, at the start of the phrase.');
enMotif('Filtre lancé au temps {#n} : commence quand « FILTRE » touche la ligne (temps 64).', 'Filter started at beat {n}: start when "FILTER" touches the line (beat 64).');
enMotif('Filtre monté trop vite ({#n} temps) : étale le geste sur 16 à 32 temps.', 'Filter turned too fast ({n} {n:beat:beats}): spread the move over 16 to 32 beats.');
enMotif("Filtre monté en {#n} temps : A s'efface en douceur.", 'Filter turned over {n} {n:beat:beats}: A fades out smoothly.');
enMotif('Écho activé {x} trop tard : vise le dernier temps avant la ligne.', 'Echo on {x} too late: aim for the last beat before the line.');
enMotif('Écho activé {x} trop tôt : vise le dernier temps avant la ligne.', 'Echo on {x} too early: aim for the last beat before the line.');
enMotif("A coupé à {x} du début de la phrase : B tombe dans l'écho.", 'A cut {x} from the start of the phrase: B drops into the echo.');
enMotif('A coupé {x} en retard.', 'A cut {x} late.');
enMotif('A coupé {x} trop tôt.', 'A cut {x} too early.');
enMotif('A coupé à {x} de la ligne.', 'A cut {x} off the line.');
enMotif('A et B ont joué ensemble pendant {x} : coupe A dans le même geste.', 'A and B played together for {x}: cut A in the same move.');
enMotif('Il y a eu un blanc de {x} entre la coupure et le lancement de B.', 'There was a {x} silence between the cut and the start of B.');
enMotif("Le bon moment était le temps {#b} : fin de A (temps {#e}) moins l'intro de B ({#i} temps).", "The right moment was beat {b}: end of A (beat {e}) minus B's intro ({i} {i:beat:beats}).");
enMotif('B lancé trop tôt : son drop est tombé {#n} temps avant la fin de A, pendant que A jouait encore.{y}', 'B started too early: its drop landed {n} {n:beat:beats} before the end of A, while A was still playing.{y}');
enMotif('B lancé trop tard : {#n} temps de vide entre la fin de A et le drop de B.{y}', "B started too late: {n} {n:beat:beats} of silence between the end of A and B's drop.{y}");
enMotif("MID coupé {#n} temps trop tôt : A a perdu sa mélodie alors que celle de B n'avait pas commencé.", "MID cut {n} {n:beat:beats} too early: A lost its melody before B's had started.");
enMotif('MID coupé {#n} temps trop tard : on a entendu deux mélodies ensemble pendant {#m} temps.', 'MID cut {n} {n:beat:beats} too late: two melodies played together for {m} {m:beat:beats}.');
enMotif('Record : {x}', 'Best: {x}');
enMotif('+{#n} XP', '+{n} XP');
enMotif('Voir toutes mes erreurs ({#n})', 'See all my mistakes ({n})');
enMotif('Voir le détail ({#n})', 'See the details ({n})');
enMotif('Réussi au ralenti ({#n} %) ! Repasse à 100 % pour les 3 étoiles.', 'Passed in slow motion ({n}%)! Go back to 100% for the 3 stars.');
// Une liste « a · b · c » (la ligne des gains de la carte de fin, les étiquettes d'un niveau) : chaque morceau à part
enMotifFin(/^([^<>]+? · [^<>]+)$/, (m, s) => s.split(' · ').map(tr).join(' · '));   // jamais sur du HTML : trDom le traduit morceau par morceau

/* ---------- La table (js/midi.js) et la piste (js/piste.js) ---------- */
enPareil('MID A', 'Fader A', 'Fader B', 'LOW A', 'LOW B', 'CFX A', 'XDJ-AZ', 'SOFTWARE CONTROL', 'SOURCE');
enDe({
  'Table MIDI': 'MIDI controller', 'autre table': 'other controller',
  "Autorise l'accès à ta table": 'Allow access to your controller', 'Souris (aucune table vue)': 'Mouse (no controller found)',
  '· à régler': '· needs setup', 'à régler': 'needs setup', 'Souris (table sur ordinateur)': 'Mouse (controller on computer)', 'Prends Chrome ou Edge': 'Use Chrome or Edge',
  'Sur iPhone et iPad, aucun navigateur ne sait parler à une table DJ. Ouvre DJingood sur un ordinateur, avec Chrome ou Edge :': 'On iPhone and iPad, no browser can talk to a DJ controller. Open DJingood on a computer, with Chrome or Edge:',
  'Copie le lien de DJingood avec le bouton ci-dessous, et envoie-le-toi (par message ou par mail).': "Copy DJingood's link with the button below, and send it to yourself (by text or email).",
  'Ouvre-le sur ton ordinateur, dans Chrome ou Edge, et branche ta table en USB.': 'Open it on your computer, in Chrome or Edge, and plug your controller in over USB.',
  'Ce navigateur ne sait pas parler aux tables DJ (Safari, par exemple). Ouvre DJingood dans Chrome ou Edge :': "This browser can't talk to DJ controllers (Safari, for example). Open DJingood in Chrome or Edge:",
  'Copie le lien de DJingood avec le bouton ci-dessous.': "Copy DJingood's link with the button below.",
  "Ouvre Chrome (ou télécharge-le, c'est gratuit) et colle le lien dans la barre d'adresse.": "Open Chrome (or download it, it's free) and paste the link into the address bar.",
  'Branche ta table, et clique sur « Autoriser » quand Chrome te le demande.': 'Plug in your controller, and click "Allow" when Chrome asks you.',
  'Un instant : le navigateur cherche ta table.': 'One moment: the browser is looking for your controller.',
  "Ton navigateur te demande, en haut de l'écran (parfois avec une petite icône dans la barre d'adresse), si DJingood peut utiliser tes appareils MIDI, c'est-à-dire ta table : clique sur « Autoriser ».": 'Your browser is asking, at the top of the screen (sometimes with a small icon in the address bar), whether DJingood can use your MIDI devices, meaning your controller: click "Allow".',
  'Toujours refusé.': 'Still blocked.', "Ton navigateur a refusé l'accès à ta table. Pour l'autoriser :": 'Your browser blocked access to your controller. To allow it:',
  "Clique sur le cadenas, à gauche de l'adresse du site.": "Click the padlock, to the left of the site's address.",
  'Mets « Appareils MIDI » sur « Autoriser ».': 'Set "MIDI devices" to "Allow".', 'Recharge la page.': 'Reload the page.',
  "Sur Firefox, le plus simple est d'ouvrir DJingood dans Chrome ou Edge.": 'On Firefox, the easiest is to open DJingood in Chrome or Edge.',
  "Ferme rekordbox, Serato, djay et VirtualDJ : sur Windows, une table ne parle qu'à un seul logiciel à la fois.": 'Close rekordbox, Serato, djay and VirtualDJ: on Windows, a controller only talks to one program at a time.',
  'Ta table ne réagit pas ?': "Your controller doesn't respond?",
  'Le navigateur la voit, mais rien ne bouge quand tu touches une commande ?': 'The browser sees it, but nothing moves when you touch a control?',
  'Puis recharge la page.': 'Then reload the page.',
  "Table tout-en-un, avec un écran (XDJ-AZ, XDJ-RX3, XDJ-XZ…) : vérifie qu'elle est en mode ordinateur. Sur l'XDJ-AZ : bouton SOURCE, puis SOFTWARE CONTROL.": "All-in-one system with a screen (XDJ-AZ, XDJ-RX3, XDJ-XZ…): check that it's in computer mode. On the XDJ-AZ: SOURCE button, then SOFTWARE CONTROL.",
  "Le navigateur ne voit aucune table. Vérifie, dans l'ordre :": "The browser doesn't see any controller. Check, in this order:",
  'Puis débranche ta table et rebranche-la.': 'Then unplug your controller and plug it back in.',
  "Branche-la directement sur l'ordinateur, sans hub, avec le câble livré avec (certains câbles ne font que charger). Si elle a une prise de courant, allume-la.": 'Plug it straight into the computer, without a hub, with the cable it came with (some cables only charge). If it has a power plug, turn it on.',
  "Table tout-en-un, avec un écran (XDJ-AZ, XDJ-RX3, XDJ-XZ…) : passe-la en mode ordinateur. Sur l'XDJ-AZ : bouton SOURCE, puis SOFTWARE CONTROL.": 'All-in-one system with a screen (XDJ-AZ, XDJ-RX3, XDJ-XZ…): switch it to computer mode. On the XDJ-AZ: SOURCE button, then SOFTWARE CONTROL.',
  "Sur Windows, certaines tables demandent d'installer leur pilote, sur le site de la marque (c'est le cas de l'XDJ-AZ). La DDJ-FLX4 et la plupart des petites tables n'en ont pas besoin.": "On Windows, some controllers need their driver installed, from the brand's website (the XDJ-AZ does). The DDJ-FLX4 and most small controllers don't need one.",
  'Réessayer': 'Try again', 'Copier le lien': 'Copy the link', 'Télécharger Chrome': 'Download Chrome', 'Lien copié !': 'Link copied!', 'Recopie ce lien :': 'Copy this link:',
  'Tourne le potard MID de A…': "Turn A's MID knob…", 'Tourne le potard CFX de A…': "Turn A's CFX knob…", "Appuie sur ON de l'effet…": "Press the effect's ON…",
  'Fader de volume A': 'Volume fader A', 'Fader de volume B': 'Volume fader B', 'Potard LOW de A': "A's LOW knob", 'Potard LOW de B': "B's LOW knob",
  'Potard CFX de A': "A's CFX knob", 'Potard MID de A': "A's MID knob", 'Potard MID de B': "B's MID knob",
  'en haut': 'up', 'en bas': 'down', 'tout à droite': 'all the way right', 'neutre (à midi)': "centered (12 o'clock)",
  'coupé (tout à gauche)': 'cut (all the way left)', 'normal (à midi)': "normal (12 o'clock)",
  'Avant de lancer B : LOW de B normal → coupé': "Before starting B: B's LOW normal → cut",
  'Mode Expert : pas de compte à rebours ni de repère, et B part exactement quand tu appuies. Chaque geste est noté en millisecondes, score sur 100.': 'Expert Mode: no countdown and no markers, and B starts exactly when you press. Every move is scored in milliseconds, out of 100.',
  "Ici, pas de compte à rebours : écoute la musique (ou lis la forme d'onde) et fais chaque geste au bon moment.": 'No countdown here: listen to the music (or read the waveform) and make each move at the right moment.',
  "à l'écran : ta table n'en a pas": "on screen: your controller doesn't have it", 'en place': 'in place', 'bouge-le un peu': 'move it a little',
  'monte-le': 'push it up', 'descends-le': 'pull it down', 'tourne à droite': 'turn right', 'tourne à gauche': 'turn left',
  'Apprendre ce contrôle': 'Learn this control', "Bouton ON de l'effet (facultatif : sinon bouton ECHO ou touche E)": "The effect's ON button (optional: otherwise the ECHO button or the E key)",
  'Mets ta table en place': 'Set up your controller',
  // La piste
  'B si tu le lances maintenant': 'B if you start it now', "Préparation des formes d'onde…": 'Preparing the waveforms…',
  'Corps': 'Main part', "Fin d'intro": 'End of intro', 'Intro (avec basse)': 'Intro (with bass)', 'B partira ici': 'B will start here',
  'Repères masqués : écoute': 'Markers hidden: listen', 'Lancer B': 'Start B', 'pas lancé': 'not started',
});
enMotif(/^: (.+)$/, (m, x) => ': ' + tr(x));
enMotif('toi : {#n} temps trop {x}', 'you: {n} {n:beat:beats} too {x}');
enMotif('toi : {#n} ms trop {x}', 'you: {n} ms too {x}');

/* ---------- Le guide et les fiches « Découvre ce bouton » (js/guide.js) ---------- */
enDe({
  'Bienvenue sur DJingood': 'Welcome to DJingood',
  "Une transition, c'est passer d'un morceau à l'autre sans que la piste de danse s'arrête. Ici, tu l'apprends geste par geste, sur ta table. D'abord deux choses sur la musique : comment la compter, et comment un morceau est construit. Les boutons de ta table te seront présentés au moment de t'en servir.": "A transition means going from one track to the next without the dance floor stopping. Here, you learn it move by move, on your controller. First, two things about music: how to count it, and how a track is built. You'll meet your controller's buttons right when you need them.",
  'Compter en phrases': 'Counting in phrases',
  "Chaque coup de grosse caisse est un temps. 4 temps font une mesure, 8 mesures font une phrase de 32 temps. La musique change toujours au début d'une phrase : c'est là qu'on fait les transitions. Suis la grille avec la musique.": 'Every kick drum hit is a beat. 4 beats make a bar, 8 bars make a 32-beat phrase. The music always changes at the start of a phrase: that\'s where transitions happen. Follow the grid along with the music.',
  "Les parties d'un morceau": 'The parts of a track',
  'Un morceau se découpe en parties de quelques phrases. Dans les niveaux, elles portent ces noms et ont ces couleurs sur la piste.': 'A track is split into parts of a few phrases each. In the levels, they have these names and these colors on the track.',
  'Tu es prêt': "You're ready",
  "Commence par le niveau 1. Avant chaque niveau, le site te montre la position de départ de ta table et les gestes à faire. Si tu hésites, « Regarde d'abord » te montre le geste parfait.": 'Start with level 1. Before each level, the site shows you the starting position for your controller and the moves to make. If you\'re not sure, "Watch first" shows you the perfect move.',
  'Commencer le niveau 1': 'Start level 1',
  'Le bouton PLAY': 'The PLAY button',
  "En bas de chaque platine. Il lance ou arrête le morceau de cette platine. Dans les niveaux, tu lances B avec le PLAY de droite, pile quand le repère touche la ligne.": "At the bottom of each deck. It starts or stops that deck's track. In the levels, you start B with the right PLAY, right when the marker touches the line.",
  "Appuie sur PLAY à droite : la musique s'arrête, puis repart": 'Press the right PLAY: the music stops, then starts again',
  'Les faders de volume': 'The volume faders',
  "Les deux curseurs verticaux, au centre. Celui de gauche règle le volume du morceau A, celui de droite le morceau B. En haut : on l'entend. En bas : on ne l'entend plus.": "The two vertical sliders in the middle. The left one sets the volume of track A, the right one track B. Up: you hear it. Down: you don't hear it anymore.",
  'Baisse puis remonte le fader de gauche': 'Bring the left fader down, then back up',
  'Le potard LOW : les basses': 'The LOW knob: the lows',
  "Il gère la grosse caisse et la ligne de basse. Normal (à midi, le cran du milieu) : on entend les basses. Coupé (tout à gauche) : elles disparaissent. On n'en laisse jamais deux ensemble : c'est le potard clé des transitions.": "It handles the kick drum and the bassline. Normal (12 o'clock, the middle notch): you hear the lows. Cut (all the way left): they disappear. You never leave two basslines together: it's the key knob for transitions.",
  'Coupe puis remets les basses de gauche': 'Cut the left lows, then bring them back',
  'Le filtre CFX': 'The CFX filter',
  "Le dernier potard de chaque voie. Neutre (à midi) : il ne fait rien. Tourné vers la droite, le morceau perd ses basses et s'efface en douceur.": "The last knob on each channel. Centered (12 o'clock): it does nothing. Turned to the right, the track loses its lows and fades out smoothly.",
  'Tourne le filtre de gauche vers la droite': 'Turn the left filter to the right',
  "L'écho": 'The echo',
  "Un effet qui répète le son en le laissant s'éteindre. Sur ta table, c'est le bouton qui allume l'effet (ON sur la FLX4) ; ici, aussi le bouton ECHO ou la touche E. On l'allume juste avant de couper un morceau, pour qu'il parte en résonnant.": "An effect that repeats the sound while letting it fade away. On your controller, it's the button that turns the effect on (ON on the FLX4); here, also the ECHO button or the E key. You turn it on just before cutting a track, so it leaves ringing out.",
  "Allume l'écho et écoute": 'Turn on the echo and listen',
  'Le potard MID : les voix et les mélodies': 'The MID knob: vocals and melodies',
  "Juste au-dessus du LOW. Il gère les médiums, là où sont les voix et les mélodies. Normal (à midi) : on entend tout. Coupé (tout à gauche) : les voix et les mélodies reculent.": "Just above the LOW. It handles the mids, where the vocals and melodies are. Normal (12 o'clock): you hear everything. Cut (all the way left): the vocals and melodies step back.",
  'Coupe puis remets le MID de gauche': 'Cut the left MID, then bring it back',
  'le bouton PLAY': 'the PLAY button', 'les faders': 'the faders', 'le potard LOW': 'the LOW knob', 'le filtre CFX': 'the CFX filter',
  "l'écho": 'the echo', 'le potard MID': 'the MID knob',
  '(ou clique sur PLAY)': '(or click PLAY)', '(ou clique sur ECHO)': '(or click ECHO)', '(ou utilise le curseur)': '(or use the slider)',
  'Tourne le potard CFX…': 'Turn the CFX knob…', 'Faire reconnaître ce potard': 'Get this knob recognized', 'Bien joué !': 'Well done!',
  'Je connais, passer': 'I know it, skip', 'Compris, on joue': "Got it, let's play", 'Compris': 'Got it', 'Terminer': 'Finish',
  'Pas de table détectée : le curseur ci-dessus fait la même chose.': 'No controller found: the slider above does the same thing.',
  "Ta table n'est pas encore réglée : le curseur ci-dessus fait la même chose.": "Your controller isn't set up yet: the slider above does the same thing.",
  "Ta table n'a pas cette commande : le curseur ci-dessus fait la même chose.": "Your controller doesn't have this control: the slider above does the same thing.",
  'Ta table doit d\'abord reconnaître ce potard : clique sur le bouton, puis tourne-le.': 'Your controller first needs to recognize this knob: click the button, then turn it.',
  'Préparation du son…': 'Getting the sound ready…',
});
enMotif('Temps {#t} · mesure {#m} sur 8', 'Beat {t} · bar {m} of 8');

/* ---------- L'accueil et « Mes progrès » (js/parcours.js) ---------- */
enDe({
  'Parcours « Grand débutant »': 'Path: "Total beginner"', 'Parcours « Apprenti DJ »': 'Path: "Apprentice DJ"', 'Parcours « DJ confirmé »': 'Path: "Experienced DJ"',
  'Découvre ta table': 'Discover your controller',
  "Un petit tour d'une minute, avec le son : compter les phrases et reconnaître les parties d'un morceau. Chaque bouton de ta table te sera présenté juste avant de t'en servir.": "A quick one-minute tour, with sound: counting phrases and recognizing the parts of a track. You'll meet each button of your controller right before you use it.",
  'Commencer le guide': 'Start the guide', 'Les bases en Mode Expert': 'The basics in Expert Mode',
  "Les sept gestes, sans aucune aide : B part à l'instant où tu appuies, pas de compte à rebours, chaque geste noté à la milliseconde. Vise 60 sur 100 à chaque niveau.": 'The seven moves, with no help at all: B starts the instant you press, no countdown, every move scored to the millisecond. Aim for 60 out of 100 on each level.',
  'Plusieurs gestes enchaînés, au demi-temps près : filtre et swap, la transition éclair, écho et drop, le grand mix.': 'Several moves in a row, to the half beat: filter and swap, the lightning transition, echo and drop, the big mix.',
  "Sept gestes, un par niveau : lancer au bon moment, le fader, la coupure, l'écho, le filtre, le swap des basses, puis la transition complète pour finir.": 'Seven moves, one per level: starting at the right moment, the fader, the cut, the echo, the filter, the bass swap, then the full transition to finish.',
  "Refais les gestes que tu connais sur d'autres morceaux : défi du jour, variations, à l'oreille, mini-set.": 'Redo the moves you know on other tracks: daily challenge, variations, by ear, mini-set.',
  "Aller à l'entraînement": 'Go to practice',
  'Les mêmes gestes à l\'oreille, sans compte à rebours, et deux fois plus précis.': 'The same moves by ear, no countdown, and twice as precise.',
  "Lire les formes d'onde, éviter le piège du break, une seule mélodie à la fois : comme dans rekordbox.": 'Reading waveforms, avoiding the break trap, one melody at a time: just like in rekordbox.',
  'Caler deux morceaux soi-même, sans SYNC : entendre le décalage, régler le tempo, rattraper à la molette, au casque, puis sans aucune aide.': 'Beatmatching two tracks yourself, without SYNC: hearing the drift, setting the tempo, catching up with the jog wheel, in the headphones, then with no help at all.',
  "Partir au bon endroit et gagner du temps : poser un repère, lancer depuis lui, sortir d'une boucle sur la phrase, prolonger une outro, faire monter la tension.": 'Starting at the right spot and saving time: setting a marker, starting from it, leaving a loop on the phrase, extending an outro, building tension.',
  "Des morceaux enchaînés sans que la musique s'arrête, comme en soirée : lancer sur la phrase, caler, échanger les basses, faire sortir. Noté sur 100.": 'Tracks mixed back to back without the music stopping, like at a party: starting on the phrase, beatmatching, swapping the lows, taking the track out. Scored out of 100.',
  'Avec ta musique : importe ta collection rekordbox, choisis une paire, et fais les missions sur ta table.': 'With your own music: import your rekordbox collection, pick a pair, and do the missions on your controller.',
  'Aller à Passer au vrai': 'Go to Go for real',
  'Parcours terminé': 'Path complete', 'Bravo, tu as tout fait !': 'Well done, you did it all!',
  'Garde la main : un défi par jour, et de nouvelles paires de morceaux dans rekordbox.': 'Keep your hand in: one challenge a day, and new pairs of tracks in rekordbox.',
  'Faire le défi du jour': 'Do the daily challenge', 'Voir tout mon parcours · terminé': 'See my whole path · complete',
  'Fait': 'Done', 'En cours': 'In progress', 'À venir': 'Coming up',
  'Encore debout ?': 'Still up?', 'Bonjour !': 'Good morning!', 'Salut !': 'Hi!', 'Bonsoir !': 'Good evening!',
  "Un coffre t'attend dans tes quêtes !": 'A chest is waiting for you in your quests!',
  'Objectif du jour atteint, bravo ! Reviens demain pour ta série.': 'Daily goal reached, well done! Come back tomorrow for your streak.',
  'Objectif du jour atteint : tu gères !': "Daily goal reached: you're crushing it!",
  "Choisis ton parcours sur l'accueil : je te dirai par où continuer.": "Pick your path on the home page: I'll tell you where to go next.",
  'Tu as tout fait, bravo ! Garde la main avec le défi du jour.': 'You did it all, well done! Keep your hand in with the daily challenge.',
  'Objectif du jour atteint': 'Daily goal reached', 'Pas encore de série': 'No streak yet',
  'Atteins ton objectif pour en lancer une': 'Reach your goal to start one',
  'Tous les badges sont à toi !': 'All the badges are yours!', "Bravo. Continue l'objectif du jour pour garder ta série.": 'Well done. Keep up the daily goal to keep your streak.',
  'après le chapitre 2': 'after chapter 2',
});
enMotif('{#n} niveau sur {#m}', '{n} level of {m}');
enMotif('{#n} niveaux sur {#m}', '{n} levels of {m}');
enMotif('Mode Expert, niveau {#n} : {x}', 'Expert Mode, level {n}: {x}');
enMotif('Chapitre {#c}, niveau {#n} : {x}', 'Chapter {c}, level {n}: {x}');
enMotif('{#n} ★ sur {#m}', '{n} ★ of {m}');
enMotif('Niveau {#n} : {x}', 'Level {n}: {x}');
enMotif('Voir tout mon parcours · étape {#n} sur {#m}', 'See my whole path · step {n} of {m}');
enMotif("{#n} coffres t'attendent dans tes quêtes !", '{n} chests are waiting for you in your quests!');
enMotif("{x} Ta série de {#n} jours t'attend : quelques minutes suffisent.", '{x} Your {n}-day streak is waiting: a few minutes will do.');
enMotif("{x} Ta série de {#n} jour t'attend : quelques minutes suffisent.", '{x} Your {n}-day streak is waiting: a few minutes will do.');
enMotif('{x} Prêt pour ta prochaine transition ?', '{x} Ready for your next transition?');
enMotif('Tu y es presque : {#n} sur {#m} pour le badge « {x} » !', "You're almost there: {n} of {m} for the \"{x}\" badge!");
enMotif('Prochaine étape : « {x} ». À toi de jouer !', 'Next step: "{x}". Your turn!');
enMotif('Encore {#n} XP pour le niveau {#m}', '{n} more XP to level {m}');
enMotif('{#n} min sur {#m}', '{n} min of {m}');
enMotif('{#n} jours', '{n} {n:day:days}');
enMotif('{#n} jour', '{n} day');
enMotif('{#n} étoiles', '{n} {n:star:stars}');
enMotif('{#n} étoile', '{n} star');
enMotif('Série : {x}', 'Streak: {x}');
enMotif('{x} · {#n} sur {#m} {y}', '{x} · {n} of {m} {y}');
enMotif(/^(\d+) · ([^·]+)$/, (m, n, x) => n + ' · ' + tr(x));
enMotif('encore {x} au chapitre {#n}', '{x} to go in chapter {n}');
enMotif('2 · {a}, 4 · {b}, 5 · {c}, 6 · {d} et 7 · {e}', '2 · {a}, 4 · {b}, 5 · {c}, 6 · {d} and 7 · {e}');
enMotif('2 · {a}, 4 · {b}, 5 · {c} et 7 · {e}', '2 · {a}, 4 · {b}, 5 · {c} and 7 · {e}');

/* ---------- « Ma table » (js/table.js), les commandes à l'écran, l'objectif, les quêtes, le Mode Expert, les sons ---------- */
enPareil('BEAT SYNC', 'EXIT', 'Dj', 'Like An Animal', 'The Power Of The Beat', 'Pioneer DDJ-400', 'Pioneer DDJ-SB3', 'Pioneer DDJ-200',
  'Hercules DJControl Inpulse 200', 'Hercules DJControl Inpulse 300', 'Hercules DJControl Inpulse 500', 'Hercules DJControl Starlight',
  'Numark Mixtrack Platinum FX', 'Numark Mixtrack Pro FX', 'Numark Party Mix', 'Numark DJ2GO2 Touch', 'Roland DJ-505', 'Reloop Mixage');
enDe({
  "Cale automatiquement le tempo de cette platine sur l'autre. Pratique pour débuter : tu te concentres sur le bon moment et sur tes gestes.": "Automatically matches this deck's tempo to the other one. Handy when you start: you focus on the right moment and on your moves.",
  'Jog, le grand plateau': 'Jog wheel, the big platter',
  "Pousse ou retient le morceau pour le recaler à la main, et sert à se déplacer dedans quand il est à l'arrêt.": "Pushes or holds back the track to line it up by hand, and moves through it when it's stopped.",
  'Fader de tempo': 'Tempo fader',
  "Accélère ou ralentit le morceau. C'est avec lui qu'on met deux morceaux à la même vitesse quand on n'utilise pas BEAT SYNC.": "Speeds the track up or slows it down. It's what you use to get two tracks to the same speed when you don't use BEAT SYNC.",
  'Bouton CUE': 'CUE button',
  "Pose un point de départ dans le morceau et y revient. Morceau à l'arrêt, il le fait jouer tant que tu restes appuyé.": 'Sets a starting point in the track and goes back to it. With the track stopped, it plays as long as you hold it.',
  'Bouton PLAY': 'PLAY button', 'Lance ou arrête le morceau de cette platine.': "Starts or stops this deck's track.",
  'Pads': 'Pads', "Huit touches sous le plateau. En mode HOT CUE, chacune garde un repère dans le morceau et y saute d'un appui.": 'Eight buttons under the platter. In HOT CUE mode, each one saves a marker in the track and jumps to it with one press.',
  'Potard TRIM': 'TRIM knob', "Règle le niveau d'entrée du morceau, pour que deux morceaux aient la même force avant de les mélanger.": "Sets the track's input level, so two tracks have the same loudness before you blend them.",
  'Potard HI': 'HI knob', 'Les aigus : charleys, cymbales, tout ce qui brille dans le morceau.': 'The highs: hi-hats, cymbals, everything that shines in the track.',
  'Potard MID': 'MID knob', "Les médiums : les voix et les mélodies. À couper sur un morceau quand l'autre chante.": 'The mids: vocals and melodies. Cut them on one track when the other one is singing.',
  'Potard LOW': 'LOW knob', "Les basses : grosse caisse et ligne de basse. Deux basses en même temps, ça fait de la bouillie : c'est le potard clé des transitions.": "The lows: kick drum and bassline. Two basslines at once turns into mush: it's the key knob for transitions.",
  'Potard CFX, le filtre': 'CFX knob, the filter',
  "Un filtre : vers la droite le son s'affine, vers la gauche il s'étouffe, à midi (neutre) il ne fait rien.": "A filter: to the right the sound gets thinner, to the left it gets muffled, at 12 o'clock (centered) it does nothing.",
  'Bouton CUE du casque': 'Headphone CUE button', "Envoie ce morceau dans ton casque, pour le préparer sans que le public l'entende.": 'Sends this track to your headphones, so you can prepare it without the crowd hearing it.',
  'Fader de volume': 'Volume fader', "Le volume du morceau dans les enceintes. Tout en bas, on ne l'entend plus.": "The track's volume in the speakers. All the way down, you can't hear it anymore.",
  "Glisse d'un morceau à l'autre en un seul geste : à gauche la platine A, à droite la platine B.": 'Slides from one track to the other in a single move: deck A on the left, deck B on the right.',
  "Bouton ON de l'effet": "The effect's ON button", "Active l'effet choisi sur la table, par exemple un écho.": 'Turns on the effect selected on the controller, for example an echo.',
  'CASQUE': 'HEADPHONES', 'VOLUME': 'VOLUME',
  "Aucune table vue pour l'instant : tu peux lire les explications, et brancher ta table pour voir les commandes réagir.": 'No controller found yet: you can read the explanations, and plug in your controller to see the controls react.',
  'Ta DDJ-FLX4': 'Your DDJ-FLX4', 'Choisis une commande': 'Pick a control',
  'Clique sur une commande du schéma pour savoir à quoi elle sert. En couleur : celles que le site utilise dans ses niveaux.': 'Click a control on the diagram to see what it does. In color: the ones the site uses in its levels.',
  "Reconnue par le site, mais aucun niveau ne s'en sert pour l'instant.": 'Recognized by the site, but no level uses it yet.',
  'Pas encore utilisée par le site.': 'Not used by the site yet.',
  'Reprends d\'abord les réglages de la DDJ-FLX4 (bouton en bas de la page).': 'First take back the DDJ-FLX4 settings (button at the bottom of the page).',
  'Règle d\'abord ta table : clique sur « Régler ma table pas à pas », en bas de la page.': 'First set up your controller: click "Set up my controller step by step", at the bottom of the page.',
  'Bouge-la sur ta table pour la voir réagir.': 'Move it on your controller to see it react.',
  "Pas sur ta table : tu la fais à l'écran. Si ta table l'a, clique sur « Apprendre », puis bouge-la.": 'Not on your controller: you do it on screen. If your controller has it, click "Learn", then move it.',
  'Pas encore réglée : clique sur « Apprendre », puis bouge-la sur ta table.': 'Not set up yet: click "Learn", then move it on your controller.',
  'Appuie dessus sur ta table… (annuler)': 'Press it on your controller… (cancel)', 'Bouge-la sur ta table… (annuler)': 'Move it on your controller… (cancel)',
  'Réapprendre cette commande': 'Learn this control again', 'Apprendre cette commande': 'Learn this control',
  'Confirmer : effacer mes réglages appris': 'Confirm: erase my learned settings', 'Revenir aux réglages de la DDJ-FLX4': 'Back to the DDJ-FLX4 settings',
  'Appuyée !': 'Pressed!', 'Réglages de la DDJ-FLX4 rétablis.': 'DDJ-FLX4 settings restored.', "Réglages d'origine rétablis.": 'Original settings restored.',
  "Le filtre CFX et le bouton d'effet seront à réapprendre.": 'The CFX filter and the effect button will need to be learned again.',
  'coupé': 'cut',
  // L'objectif du jour et la série
  'Objectif du jour atteint !': 'Daily goal reached!', '. Reviens demain pour la continuer.': '. Come back tomorrow to keep it going.',
  ": atteins ton objectif aujourd'hui pour la garder.": ': reach your goal today to keep it.',
  'Atteins ton objectif chaque jour pour lancer une série.': 'Reach your goal every day to start a streak.',
  "jours d'affilée !": 'days in a row!', "jour d'affilée !": 'day in a row!',
  'Objectif du jour atteint ! Reviens demain pour garder ta série.': 'Daily goal reached! Come back tomorrow to keep your streak.',
  ': objectif atteint': ': goal reached',
  // Les quêtes du jour
  'Regarde une démo': 'Watch a demo', 'Joue 2 niveaux': 'Play 2 levels', 'Trouve 3 bonnes réponses au quiz': 'Get 3 right answers in the quiz',
  'Joue 4 niveaux': 'Play 4 levels', 'Réussis 2 transitions': 'Nail 2 transitions', 'Fais une partie à 3 étoiles': 'Get a 3-star game',
  'Réussis le défi du jour': 'Beat the daily challenge', "Réussis un niveau à l'oreille": 'Pass a level by ear', 'Réussis 4 transitions': 'Nail 4 transitions',
  'Fais 3 parties à 3 étoiles': 'Get 3 three-star games', 'Joue 2 niveaux en Mode Expert': 'Play 2 levels in Expert Mode',
  'Réussis un combo du chapitre 4': 'Pass a combo from chapter 4',
  // Le choix des morceaux, le mode à l'oreille, le bandeau d'erreur
  'Morceaux :': 'Tracks:',
  "Mode à l'oreille : pas de compte à rebours, la piste est dans le brouillard. Compte les mesures dans ta tête.": 'By-ear mode: no countdown, the track is in the fog. Count the bars in your head.',
  // Le Mode Expert
  'trop tard': 'too late', 'trop tôt': 'too early', 'Raté : pas le bon temps': 'Missed: wrong beat',
  "Tu n'as pas lancé B. En Expert, rien ne te prévient : compte les temps jusqu'au début de la phrase.": "You didn't start B. In Expert, nothing warns you: count the beats until the start of the phrase.",
  // Les sons du jeu
  'Remettre les sons du jeu': 'Turn the game sounds back on', 'Sons du jeu : coupés': 'Game sounds: off',
});
enMotif('Position : {#n} %', 'Position: {n}%');
enMotif('Table branchée : {=n}. Elle n\'est pas encore réglée : clique sur « Régler ma table pas à pas », puis bouge chaque commande quand le site te le demande.', 'Controller plugged in: {n}. It isn\'t set up yet: click "Set up my controller step by step", then move each control when the site asks you.');
enMotif('Table branchée : {=n}. Les réglages sont encore ceux de ton autre table : clique sur « Revenir aux réglages de la DDJ-FLX4 ».', 'Controller plugged in: {n}. The settings are still those of your other controller: click "Back to the DDJ-FLX4 settings".');
enMotif('Table branchée : {=n}. DJingood connaît ses réglages, mais ceux en place sont ceux de ta table réglée à la main : clique sur « {x} », en bas de la page.', 'Controller plugged in: {n}. DJingood knows its settings, but the ones in place are from your hand-set controller: click "{x}", at the bottom of the page.');
enMotif("Table branchée : {=n}, reconnue toute seule. Ses réglages viennent de sa documentation et n'ont pas encore été vérifiés sur une vraie table : si une commande ne répond pas, « Vérifier ma table » le dira, et tu peux la réapprendre.", 'Controller plugged in: {n}, recognized on its own. Its settings come from its documentation and haven\'t been checked on a real controller yet: if a control doesn\'t respond, "Check my controller" will tell you, and you can learn it again.');
enMotif('Table branchée : {=n} (réglée pas à pas). Bouge une commande pour la voir réagir.', 'Controller plugged in: {n} (set up step by step). Move a control to see it react.');
enMotif('Table branchée : {=n}. Bouge une commande pour la voir réagir.', 'Controller plugged in: {n}. Move a control to see it react.');
enMotif(/^Utilisée dans : (.+)\.$/, (m, l) => 'Used in: ' + l.split(' · ').map(x => /^chapitre (\d), (.+)$/.test(x) ? x.replace(/^chapitre (\d), (.+)$/, (y, c, t) => 'chapter ' + c + ', ' + tr(t)) : tr(x)).join(' · ') + '.');
enMotif('Réglage : canal {#c}, numéro {#n}{=r}.', 'Setting: channel {c}, number {n}{r}.');
enMotif('Prendre les réglages de la {=n}', 'Use the {n} settings');
enMotif("Revenir aux réglages d'origine de la {=n}", 'Back to the original {n} settings');
enMotif('Commande reçue mais pas encore utilisée par le site (potard ou fader, canal {#c}, numéro {#n}).', 'Control received but not used by the site yet (knob or fader, channel {c}, number {n}).');
enMotif('Commande reçue mais pas encore utilisée par le site (bouton, canal {#c}, numéro {#n}).', 'Control received but not used by the site yet (button, channel {c}, number {n}).');
enMotif('Réglages de la {=n} en place.', '{n} settings in place.');
enMotif('PLATINE {=k}', 'DECK {k}');
enMotif('Hot cue {#n} de {=k} (posé ; clic droit pour l\'effacer)', 'Hot cue {n} of {k} (set; right-click to erase it)');
enMotif('Boucle de {#n} temps sur {=k}', '{n}-beat loop on {k}');
enMotif('Sortir de la boucle de {=k}', 'Exit the loop on {k}');
enMotif("{#n} min sur {#m} aujourd'hui", '{n} min of {m} today');
enMotif(/^Série de (\d+) jours?(.*)$/, (m, n, reste) => n + '-day streak' + tr(reste));
enMotif('Objectif du jour atteint ! Série de {#n} jours.', 'Daily goal reached! {n}-day streak.');
enMotif('Objectif du jour atteint ! Série de {#n} jour.', 'Daily goal reached! {n}-day streak.');
enMotif('Objectif du jour fait · série de {#n} jours', 'Daily goal done · {n}-day streak');
enMotif('Objectif du jour fait · série de {#n} jour', 'Daily goal done · {n}-day streak');
enMotif('Encore {#n} min pour ton objectif du jour', '{n} more min for your daily goal');
enMotif('Objectif atteint {#n} jours de suite ! Reviens demain pour continuer ta série.', 'Goal reached {n} days in a row! Come back tomorrow to keep your streak going.');
enMotif('{#n} sur {#m} · nouvelles quêtes dans {#h} h', '{n} of {m} · new quests in {h} h');
enMotif('Coffre ouvert : +{#n} XP', 'Chest opened: +{n} XP');
enMotif('Ouvrir le coffre : +{#n} XP', 'Open the chest: +{n} XP');
enMotif('Coffre de {#n} XP, à gagner', '{n} XP chest, up for grabs');
enMotif("Quête terminée : {x} ! Ton coffre t'attend sur l'accueil.", 'Quest complete: {x}! Your chest is waiting on the home page.');
enMotif('Morceaux : {x}', 'Tracks: {x}');
enMotif('Un problème est survenu : {=m} (envoie une capture de ce message pour que je corrige).', 'Something went wrong: {m} (send a screenshot of this message so I can fix it).');
enMotif('PARFAIT ! {#n} ms', 'PERFECT! {n} ms');
enMotif('Bien : {#n} ms {x}', 'Good: {n} ms {x}');
enMotif('Raté : {#n} ms {x}', 'Missed: {n} ms {x}');
enMotif('{#n} ms trop tard', '{n} ms too late');
enMotif('{#n} ms trop tôt', '{n} ms too early');
enMotif("B est parti à {#n} ms du temps : parfait, on n'entend aucun décalage.", "B started {n} ms off the beat: perfect, you can't hear any drift.");
enMotif("B est parti {#n} ms {x} : bien, c'est presque imperceptible.", "B started {n} ms {x}: good, it's almost unnoticeable.");
enMotif('B est parti {#n} ms {x} : les grosses caisses se dédoublent. Appuie un poil plus tôt.', 'B started {n} ms {x}: the kick drums double up. Press a hair earlier.');
enMotif('B est parti {#n} ms {x} : les grosses caisses se dédoublent. Appuie un poil plus tard.', 'B started {n} ms {x}: the kick drums double up. Press a hair later.');
enMotif('B est parti {#n} ms {x} : les deux rythmes se marchent dessus.', 'B started {n} ms {x}: the two rhythms trip over each other.');
enMotif('B est parti {#n} temps {x} : vise le premier temps de la phrase.', 'B started {n} {n:beat:beats} {x}: aim for the first beat of the phrase.');
enMotif('Expert : {#n}/100 · premier record', 'Expert: {n}/100 · first record');
enMotif('Expert : {#n}/100 · nouveau record (avant : {#m})', 'Expert: {n}/100 · new record (before: {m})');
enMotif('Expert : {#n}/100 · record : {#m}/100', 'Expert: {n}/100 · record: {m}/100');
enMotif('Mode Expert · record {x}', 'Expert Mode · record {x}');
enMotif('« {=a} » puis « {=b} » · Play House', '"{a}" then "{b}" · Play House');

/* ---------- Les leçons « Comprendre » (js/comprendre.js) : ce qu'un visiteur fait d'abord sur son téléphone ---------- */
enPareil('Le BPM');
enDe({
  'Le temps': 'The beat', "Le « boum » qui ne s'arrête jamais": 'The "boom" that never stops',
  "Un temps, c'est un « boum » de la grosse caisse. Les DJ comptent les temps pour savoir quand lancer le morceau suivant.": 'A beat is one "boom" of the kick drum. DJs count beats to know when to start the next track.',
  "Dans la house, la grosse caisse frappe toujours au même rythme. Chaque « boum », c'est un temps.": 'In house music, the kick drum always hits at the same pace. Every "boom" is a beat.',
  'Tout le reste se cale sur ces temps : les « tss » entre deux « boum », le clap, la basse.': 'Everything else locks onto those beats: the "tss" between two "booms", the clap, the bass.',
  'Tape sur chaque « boum »': 'Tap on every "boom"',
  '8 temps. Le rond compte avec toi au début, puis tape avec la grosse caisse.': '8 beats. The circle counts with you at first, then tap along with the kick drum.',
  "Lequel garde toujours le même écart ?": 'Which one always keeps the same spacing?', 'Morceau A': 'Track A', 'Morceau B': 'Track B',
  "Bien entendu ! En B, chaque « boum » tombe pile au même écart. C'est ce qui permet de compter.": 'Good ears! In B, every "boom" lands at exactly the same spacing. That\'s what lets you count.',
  "C'est B : écoute A, certains « boum » arrivent trop tôt ou trop tard.": 'It\'s B: listen to A, some "booms" come too early or too late.',
  'Encore, sans aide': 'Again, with no help', 'Cette fois, le rond ne clignote plus : seulement tes oreilles.': "This time, the circle doesn't flash anymore: just your ears.",
  "Compter jusqu'à 4": 'Counting to 4', 'Trouver le « 1 »': 'Finding the "1"',
  "4 temps font 1 mesure. Le « 1 » est le temps fort : c'est souvent là que la musique change.": '4 beats make 1 bar. The "1" is the strong beat: that\'s often where the music changes.',
  'Les temps vont par 4 : 1, 2, 3, 4, et on recommence. Ces 4 temps forment une mesure.': 'Beats go in fours: 1, 2, 3, 4, and start again. Those 4 beats make a bar.',
  'Le « 1 » est le temps fort. Ici, une cymbale le marque à chaque mesure.': 'The "1" is the strong beat. Here, a cymbal marks it in every bar.',
  'Combien de temps dans une mesure ?': 'How many beats in a bar?',
  'Oui : 4 temps, puis on repart sur le « 1 ».': 'Yes: 4 beats, then back to the "1".',
  "C'est 4 : 1, 2, 3, 4, puis on repart sur le « 1 ».": 'It\'s 4: 1, 2, 3, 4, then back to the "1".',
  'Tape seulement sur le « 1 »': 'Tap only on the "1"', 'Une fois par mesure, avec la cymbale.': 'Once per bar, with the cymbal.',
  'Sur quel temps tombe la cymbale ?': 'Which beat does the cymbal land on?',
  'Le 1': 'The 1', 'Le 2': 'The 2', 'Le 3': 'The 3', 'Le 4': 'The 4',
  'Bien compté : 1, 2, la cymbale sur le 3, puis 4.': 'Well counted: 1, 2, the cymbal on the 3, then 4.',
  "Elle tombe sur le 3 : compte 1, 2, 3, 4 avec les ronds pendant l'écoute.": 'It lands on the 3: count 1, 2, 3, 4 with the circles while you listen.',
  'La vitesse': 'Speed',
  "Le BPM, c'est le nombre de temps par minute. Deux morceaux se mélangent bien quand ils vont au même BPM.": 'BPM is the number of beats per minute. Two tracks blend well when they run at the same BPM.',
  "Le BPM, c'est le nombre de temps par minute. À 124 BPM, la grosse caisse frappe 124 fois par minute.": 'BPM is the number of beats per minute. At 124 BPM, the kick drum hits 124 times a minute.',
  'Lequel va le plus vite ?': 'Which one is faster?',
  'Bien entendu ! B est à 130 BPM, A à 116 : B fait 14 « boum » de plus par minute.': 'Good ears! B is at 130 BPM, A at 116: B has 14 more "booms" per minute.',
  "C'est B : 130 BPM contre 116. L'écart entre deux « boum » y est plus court.": 'It\'s B: 130 BPM against 116. The gap between two "booms" is shorter.',
  'Ces deux-là vont-ils à la même vitesse ?': 'Are these two at the same speed?',
  "Oui : les deux sont à 124 BPM. C'est ce qui permet de les mélanger.": "Yes: both are at 124 BPM. That's what lets you blend them.",
  'Si : les deux sont à 124 BPM. Les sons changent, mais les « boum » tombent au même rythme.': 'They are: both are at 124 BPM. The sounds change, but the "booms" land at the same pace.',
  'Le premier, puis le second': 'The first one, then the second',
  "Pour mélanger deux morceaux, il faut qu'ils aillent…": 'To blend two tracks, they need to be…',
  'À la même vitesse': 'At the same speed', 'Au même volume': 'At the same volume', 'Dans le même style': 'In the same style',
  "Oui : sinon leurs « boum » se décalent et ça galope. Sur ta table, c'est le tempo (ou SYNC) qui règle ça.": 'Yes: otherwise their "booms" drift apart and it gallops. On your controller, the tempo (or SYNC) takes care of that.',
  "À la même vitesse : sinon leurs « boum » se décalent et ça galope. Sur ta table, c'est le tempo (ou SYNC) qui règle ça.": 'At the same speed: otherwise their "booms" drift apart and it gallops. On your controller, the tempo (or SYNC) takes care of that.',
  'Tape en rythme, plus vite': 'Tap in time, faster', '8 temps, à 130 BPM.': '8 beats, at 130 BPM.',
  'La phrase': 'The phrase', 'Tout change tous les 32 temps': 'Everything changes every 32 beats',
  "8 mesures, soit 32 temps, font une phrase. Les DJ lancent et mélangent leurs morceaux au début d'une phrase.": '8 bars, which is 32 beats, make a phrase. DJs start and blend their tracks at the start of a phrase.',
  "Les mesures vont par 8 : 8 mesures de 4 temps, ça fait 32 temps. C'est une phrase.": "Bars go in eights: 8 bars of 4 beats makes 32 beats. That's a phrase.",
  "À la fin d'une phrase, la musique change : un instrument arrive ou s'en va. Écoute la fin de cette phrase.": 'At the end of a phrase, the music changes: an instrument comes in or drops out. Listen to the end of this phrase.',
  'Tape quand ça change': 'Tap when it changes',
  'Compte les mesures : le changement arrive au début de la phrase suivante.': 'Count the bars: the change comes at the start of the next phrase.',
  "Une phrase, c'est combien de temps ?": 'How many beats is a phrase?',
  'Oui : 8 mesures de 4 temps.': 'Yes: 8 bars of 4 beats.', "C'est 32 : 8 mesures de 4 temps.": "It's 32: 8 bars of 4 beats.",
  "Tu veux lancer ton morceau B. Le meilleur moment, c'est…": 'You want to start your track B. The best moment is…',
  "Au début d'une phrase": 'At the start of a phrase', "Au milieu d'une mesure": 'In the middle of a bar', "N'importe quand": 'Any time',
  "Oui : c'est là que l'oreille attend un changement. B arrive comme s'il faisait partie du morceau.": "Yes: that's where the ear expects a change. B comes in as if it were part of the track.",
  "Au début d'une phrase : c'est là que l'oreille attend un changement.": "At the start of a phrase: that's where the ear expects a change.",
  'Intro, break, drop, outro': 'Intro, break, drop, outro',
  "L'intro et l'outro sont faites pour mixer. Le DJ fait entrer B sur son intro, pendant l'outro de A.": "The intro and the outro are made for mixing. The DJ brings B in on its intro, during A's outro.",
  "Un morceau se découpe en parties. L'intro est simple, sans basse : c'est là que le DJ fait entrer le morceau.": "A track is split into parts. The intro is simple, with no bass: that's where the DJ brings the track in.",
  "Le drop, c'est quand tout joue : la basse, les accords. Tout le monde danse.": 'The drop is when everything plays: the bass, the chords. Everyone dances.',
  "Le break est une pause : la grosse caisse s'arrête, il reste les nappes. L'outro, à la fin, ressemble à l'intro.": 'The break is a pause: the kick drum stops, only the pads remain. The outro, at the end, sounds like the intro.',
  'Quelle partie est-ce ?': 'Which part is this?', "L'intro": 'The intro', 'Le drop': 'The drop', 'Le break': 'The break',
  "Oui : plus de grosse caisse, juste des nappes. C'est le break.": "Yes: no more kick drum, just pads. That's the break.",
  "C'est le break : la grosse caisse s'est arrêtée.": "It's the break: the kick drum stopped.",
  'Et celle-ci ?': 'And this one?', "Oui : tout joue, c'est le drop.": "Yes: everything plays, that's the drop.",
  "C'est le drop : la basse et les accords jouent avec la grosse caisse.": "It's the drop: the bass and the chords play with the kick drum.",
  "Remets les parties dans l'ordre": 'Put the parts in order',
  "C'est ça : l'intro au début, l'outro à la fin. Au milieu, le break et le drop se répondent : la tension monte, puis ça explose.": "That's it: the intro at the start, the outro at the end. In the middle, the break and the drop answer each other: the tension builds, then it explodes.",
  "L'intro est toujours au début et l'outro à la fin ; au milieu, le break et le drop se répondent.": 'The intro is always at the start and the outro at the end; in the middle, the break and the drop answer each other.',
  'Grave, médium, aigu': 'Lows, mids, highs', 'Pourquoi on coupe les basses': 'Why we cut the lows',
  "Le potard LOW règle les graves. Deux basses en même temps, c'est la bouillie : on n'en garde qu'une à la fois.": 'The LOW knob controls the lows. Two basslines at once is mush: you only keep one at a time.',
  'Le son se range en trois étages : les graves (la grosse caisse, la basse), les médiums (les accords), les aigus (les « tss »).': 'Sound is stacked in three floors: the lows (the kick drum, the bass), the mids (the chords), the highs (the "tss").',
  'Sur ta table, chaque étage a son potard : LOW, MID et HI. Écoute les graves disparaître au milieu.': 'On your controller, each floor has its knob: LOW, MID and HI. Listen to the lows disappear in the middle.',
  "Qu'est-ce qui a été coupé ?": 'What was cut?', 'Les basses': 'The lows', 'le « boum » grave': 'the deep "boom"', 'Les aigus': 'The highs',
  'les « tss »': 'the "tss"', 'Rien du tout': 'Nothing at all',
  "Oui : les « tss » ont disparu, le « boum » est resté. C'est le potard HI.": 'Yes: the "tss" disappeared, the "boom" stayed. That\'s the HI knob.',
  "Ce sont les aigus : les « tss » ont disparu, le « boum » est resté. C'est le potard HI.": 'It\'s the highs: the "tss" disappeared, the "boom" stayed. That\'s the HI knob.',
  'Avant, puis après': 'Before, then after', 'Et là ?': 'And now?',
  "Oui : le « boum » a disparu. C'est le potard LOW.": 'Yes: the "boom" disappeared. That\'s the LOW knob.',
  "Ce sont les basses : le « boum » a disparu, les « tss » sont toujours là. C'est le potard LOW.": 'It\'s the lows: the "boom" disappeared, the "tss" is still there. That\'s the LOW knob.',
  'Lequel fait « bouillie » ?': 'Which one sounds like mush?',
  "Oui : deux basses en même temps se marchent dessus. C'est pour ça qu'on coupe les basses de B quand il entre.": "Yes: two basslines at once trip over each other. That's why you cut B's lows when it comes in.",
  "C'est A : il a deux basses en même temps, elles se marchent dessus. C'est pour ça qu'on coupe les basses de B quand il entre.": "It's A: it has two basslines at once, they trip over each other. That's why you cut B's lows when it comes in.",
  'Quand B entre, tu coupes…': 'When B comes in, you cut…', 'Ses basses (LOW)': 'Its lows (LOW)', 'Ses aigus (HI)': 'Its highs (HI)', 'Son volume': 'Its volume',
  'Oui : une seule basse à la fois, toujours.': 'Yes: one bassline at a time, always.', 'Ses basses : une seule basse à la fois, toujours.': 'Its lows: one bassline at a time, always.',
  'La transition': 'The transition', 'Ce que tu vas faire avec ta table': "What you'll do with your controller",
  "B entre sur une phrase, sans ses basses. On échange les basses, puis A s'en va. C'est ce que tu vas faire au chapitre 1, avec ta table.": "B comes in on a phrase, without its lows. You swap the lows, then A leaves. That's what you'll do in chapter 1, with your controller.",
  "Une transition, c'est passer d'un morceau à l'autre sans que la danse s'arrête. Écoute : A joue, puis B entre, sans ses basses.": 'A transition means going from one track to the next without the dancing stopping. Listen: A plays, then B comes in, without its lows.',
  "Puis on échange les basses : celle de A s'en va, celle de B arrive. Enfin, A s'en va.": "Then you swap the lows: A's goes away, B's comes in. Finally, A leaves.",
  "Remets les gestes dans l'ordre": 'Put the moves in order', "Lancer B au début d'une phrase": 'Start B at the start of a phrase',
  'Monter le volume de B': "Bring B's volume up", 'Échanger les basses': 'Swap the lows', 'Baisser le volume de A': "Bring A's volume down",
  "Parfait : c'est exactement la transition complète du chapitre 1.": "Perfect: that's exactly the full transition from chapter 1.",
  "L'ordre : lancer B sur une phrase, monter son volume, échanger les basses, puis baisser A.": 'The order: start B on a phrase, bring its volume up, swap the lows, then bring A down.',
  'B entre pendant quelle partie de A ?': 'During which part of A does B come in?', 'Son outro': 'Its outro', 'Son drop': 'Its drop', 'Son break': 'Its break',
  "Oui : l'outro de A est simple, B y trouve sa place.": "Yes: A's outro is simple, so B finds its place there.",
  'Pendant son outro : elle est simple, B y trouve sa place.': 'During its outro: it\'s simple, so B finds its place there.',
  'Combien de basses à la fois ?': 'How many basslines at a time?', 'Une seule': 'Just one', 'Deux': 'Two', 'Aucune': 'None',
  'Oui, une seule. Tu as tout compris : la suite se passe avec ta table.': 'Yes, just one. You got it all: what comes next happens on your controller.',
  "Une seule : deux basses ensemble, c'est la bouillie.": 'Just one: two basslines together is mush.',
  'Comprendre la musique': 'Understanding music',
  "Sept petites leçons, sans table : entendre les temps, compter les phrases, reconnaître les parties d'un morceau. Juste ton doigt et le son.": 'Seven short lessons, no controller: hearing the beats, counting phrases, recognizing the parts of a track. Just your finger and the sound.',
  'Écouter': 'Listen', 'Chaque case est une mesure de 4 temps.': 'Each box is a bar of 4 beats.', "Chaque rond s'allume sur un temps.": 'Each circle lights up on a beat.',
  "Tu n'entends rien ? Monte le son, et enlève le mode silencieux.": "Can't hear anything? Turn the volume up, and switch off silent mode.",
  'Sur ordinateur : clique sur le rond, ou appuie sur Espace.': 'On a computer: click the circle, or press Space.',
  'Écoute…': 'Listen…', 'Tape': 'Tap', 'Trop tôt': 'Too early', 'Pas sur le « 1 »': 'Not on the "1"', 'Pile !': 'Spot on!', 'Un peu tôt': 'A bit early', 'Trop tard': 'Too late',
  'Un seul tap par « boum » : écoute la grosse caisse et tape avec elle, sans te presser.': 'Just one tap per "boom": listen to the kick drum and tap along with it, no rushing.',
  "Tu as tapé sur d'autres temps : attends la cymbale, une fois par mesure.": 'You tapped on other beats: wait for the cymbal, once per bar.',
  'Pile au début de la nouvelle phrase.': 'Right at the start of the new phrase.',
  "Tu n'as pas tapé. Compte les mesures : le changement arrive après la 8e.": "You didn't tap. Count the bars: the change comes after the 8th.",
  'Trop tôt : compte les mesures jusqu\'à la 8e, puis tape sur le « 1 » suivant.': 'Too early: count the bars up to the 8th, then tap on the next "1".',
  'Un peu tard : en comptant les mesures, tu peux le sentir arriver.': 'A bit late: by counting the bars, you can feel it coming.',
  'Tes frappes arrivent toutes un peu tard : avec des écouteurs sans fil, le son a du retard. Essaie avec le haut-parleur.': 'Your taps all come a bit late: with wireless earbuds, the sound lags. Try with the speaker.',
  'Bravo': 'Well done', 'Fini': 'Done', 'Presque': 'Almost', 'Vérifier': 'Check',
  "Touche un morceau pour l'écouter, puis vérifie.": 'Tap a track to listen to it, then check.', 'Bien vu !': 'Nice one!', 'Pas tout à fait': 'Not quite',
  'Touche-les de la première à la dernière.': 'Tap them from first to last.',
  'Leçon terminée !': 'Lesson complete!', 'À retenir': 'Remember', 'Leçon suivante': 'Next lesson', "Revenir à l'accueil": 'Back to home',
  'Pour garder ta progression et la retrouver sur ton ordinateur :': 'To keep your progress and find it again on your computer:',
  'crée ton compte': 'create your account', 'À ouvrir sur mon ordinateur, avec ma table DJ': 'To open on my computer, with my DJ controller',
  'pas encore ouverte': 'not unlocked yet',
});
enMotif('{#n} leçon sur {#m}', '{n} lesson of {m}');
enMotif('{#n} leçons sur {#m}', '{n} lessons of {m}');
enMotif('Leçon {#n} : {x}, {#s} étoile sur 3', 'Lesson {n}: {x}, {s} star out of 3');
enMotif('Leçon {#n} : {x}, {#s} étoiles sur 3', 'Lesson {n}: {x}, {s} stars out of 3');
enMotif('Leçon {#n} : {x}, pas encore ouverte', 'Lesson {n}: {x}, not unlocked yet');
enMotif('Leçon {#n} : {x}', 'Lesson {n}: {x}');
enMotif('Leçon {#n} · {x}', 'Lesson {n} · {x}');
enMotif('{#n} temps sur 8 dans le rythme.', '{n} of 8 beats in time.');
enMotif('{#n} temps sur 8 dans le rythme. Écoute la grosse caisse et tape avec elle, sans te presser.', '{n} of 8 beats in time. Listen to the kick drum and tap along with it, no rushing.');
enMotif('{#n} « 1 » sur 4.', '{n} "1"s out of 4.');
enMotif('{#n} « 1 » sur 4. Compte 1, 2, 3, 4 dans ta tête et tape sur le 1.', '{n} "1"s out of 4. Count 1, 2, 3, 4 in your head and tap on the 1.');
enMotif('{#n} étoile sur 3', '{n} star out of 3');
enMotif('{#n} étoiles sur 3', '{n} stars out of 3');
enMotif('Ton record ici : {=s}', 'Your best here: {s}');
enMotif('{x} · {#n} min', '{x} · {n} min');

/* ---------- Le quiz et les badges (js/quiz.js) ---------- */
enPareil('II', 'III', '4', '3', '8', '16', '32', '64');
enDe({
  'Quel est le bon moment pour lancer le morceau B ?': "What's the right moment to start track B?",
  "Sur le premier temps d'une phrase de A, par exemple quand son outro commence": "On the first beat of one of A's phrases, for example when its outro starts",
  "N'importe quand, du moment que le tempo est le même": "Any time, as long as the tempo is the same", 'Quand A est complètement terminé': 'When A has completely finished',
  "Les morceaux avancent par phrases. Si B part sur le premier temps d'une phrase, les deux morceaux restent alignés jusqu'au drop.": 'Tracks move forward in phrases. If B starts on the first beat of a phrase, both tracks stay lined up until the drop.',
  "L'outro d'un morceau, c'est…": "A track's outro is…", 'Sa fin, plus dépouillée, faite pour enchaîner': 'Its ending, more stripped back, made for mixing into the next',
  'Son passage le plus fort': 'Its loudest part', 'Son tout début': 'Its very beginning',
  "Dans l'outro, le morceau se vide : c'est la place idéale pour faire entrer le suivant.": 'In the outro, the track empties out: the perfect place to bring in the next one.',
  "À quoi sert le fader d'une platine ?": "What is a deck's fader for?", 'À régler le volume de ce morceau': "Setting that track's volume",
  'À régler sa vitesse': 'Setting its speed', 'À couper ses basses': 'Cutting its lows',
  "Chaque platine a son fader de volume : en bas, on n'entend plus le morceau ; en haut, il joue à fond.": "Each deck has its volume fader: down, you can't hear the track anymore; up, it plays at full volume.",
  'Quand le fader de A doit-il être arrivé à zéro ?': "When should A's fader be all the way down?",
  'Avant que le drop de B arrive': "Before B's drop arrives", 'Dès que B démarre': 'As soon as B starts', 'Après le drop de B': "After B's drop",
  'Le drop de B doit tomber seul. Si A traîne encore dessous, le drop perd toute sa force.': "B's drop has to land on its own. If A is still lingering underneath, the drop loses all its power.",
  'Dans une coupure sèche, que fais-tu au même instant ?': 'In a hard cut, what do you do at the same instant?',
  "Je lance B et je baisse d'un coup le fader de A": "I start B and drop A's fader all at once",
  'Je monte doucement le fader de B': "I slowly bring B's fader up", 'Je tourne lentement le filtre de A': "I slowly turn A's filter",
  "Pas de fondu : A s'arrête et B démarre sur le même temps, dans un seul geste.": 'No fade: A stops and B starts on the same beat, in a single move.',
  'Pour une coupure sèche, à quel endroit B est-il calé ?': 'For a hard cut, where is B cued?',
  'Sur son drop': 'On its drop', 'Au début de son intro': 'At the start of its intro', 'Sur son outro': 'On its outro',
  "B doit frapper fort tout de suite, puisqu'il remplace A d'un coup.": 'B has to hit hard right away, since it replaces A all at once.',
  "À quoi sert l'écho quand on fait sortir un morceau ?": 'What is the echo for when you take a track out?',
  "Sa fin résonne et s'éteint, au lieu de s'arrêter net": 'Its ending rings out and fades, instead of stopping dead',
  'À le rendre plus fort': 'Making it louder', 'À ralentir son tempo': 'Slowing its tempo down',
  "L'écho répète le dernier son en le laissant s'éteindre : la sortie de A paraît voulue.": "The echo repeats the last sound while letting it fade: A's exit sounds intentional.",
  'Dans un écho out, dans quel ordre fais-tu les deux gestes ?': 'In an echo out, in what order do you make the two moves?',
  "J'active l'écho, puis je baisse d'un coup le fader de A": "I turn on the echo, then drop A's fader all at once",
  "Je baisse le fader de A, puis j'active l'écho": "I bring A's fader down, then turn on the echo",
  "J'active l'écho, puis je monte le fader de A": "I turn on the echo, then bring A's fader up",
  "L'écho doit avoir attrapé le son avant que tu coupes le volume : sinon il n'a rien à répéter.": 'The echo has to catch the sound before you cut the volume: otherwise it has nothing to repeat.',
  'Dans les niveaux, quel potard sert de filtre ?': 'In the levels, which knob is the filter?',
  "Le potard CFX est sous les trois potards d'égalisation. Tourné vers la droite, il retire peu à peu les graves du morceau.": 'The CFX knob is below the three EQ knobs. Turned to the right, it gradually removes the lows from the track.',
  'Quand le filtre de A doit-il être à fond ?': "When should A's filter be all the way?", 'Juste avant le drop de B': "Just before B's drop",
  "Tu tournes lentement pendant que B monte : A s'efface petit à petit et a disparu quand le drop arrive.": "You turn slowly while B comes up: A fades out little by little and is gone when the drop arrives.",
  'Pourquoi échange-t-on les basses au lieu de les laisser jouer ensemble ?': 'Why do we swap the lows instead of letting them play together?',
  'Deux lignes de basse en même temps donnent un son brouillon': 'Two basslines at once make a muddy sound',
  "Parce que la table ne peut jouer qu'une basse": 'Because the controller can only play one bassline', 'Pour que le tempo ne change pas': "So the tempo doesn't change",
  "Les basses de deux morceaux se marchent dessus. On n'en garde qu'une à la fois : c'est le swap.": "The lows of two tracks trip over each other. You only keep one at a time: that's the swap.",
  "Quel potard coupe les basses d'une platine ?": "Which knob cuts a deck's lows?",
  'LOW règle les basses, MID les médiums (où se trouvent les voix), et CFX sert de filtre.': 'LOW controls the lows, MID the mids (where the vocals are), and CFX is the filter.',
  'Avant de lancer B, que fais-tu de son potard LOW ?': 'Before starting B, what do you do with its LOW knob?',
  'Je le coupe, tout à gauche': 'I cut it, all the way left', "Je l'ouvre à fond": 'I open it all the way', "Je n'y touche pas": "I don't touch it",
  'B doit entrer sans ses basses : celles de A jouent encore. Tu les échangeras à la phrase suivante.': "B has to come in without its lows: A's are still playing. You'll swap them on the next phrase.",
  'Dans quel ordre se fait une transition complète ?': 'In what order does a full transition go?',
  'Lancer B, monter son fader, échanger les basses, sortir A': 'Start B, bring its fader up, swap the lows, take A out',
  'Sortir A, lancer B, échanger les basses, monter le fader de B': "Take A out, start B, swap the lows, bring B's fader up",
  'Échanger les basses, lancer B, sortir A, monter le fader de B': "Swap the lows, start B, take A out, bring B's fader up",
  "B entre d'abord discrètement, puis il prend les basses, et A sort avant le drop.": 'B first comes in quietly, then takes over the lows, and A leaves before the drop.',
  "B a 16 temps d'intro. Combien de temps avant la fin de A le lances-tu ?": 'B has a 16-beat intro. How many beats before the end of A do you start it?',
  '16 temps': '16 beats', '32 temps': '32 beats', '8 temps': '8 beats',
  "Tu comptes à rebours depuis la fin de A : la longueur de l'intro de B te donne le moment du lancement.": "You count back from the end of A: the length of B's intro gives you the moment to start.",
  "Sur une forme d'onde, à quoi reconnaît-on le drop ?": 'On a waveform, how do you spot the drop?',
  "L'onde grossit d'un coup": 'The wave suddenly gets bigger', "L'onde devient toute fine": 'The wave gets really thin', "L'onde s'arrête": 'The wave stops',
  "Au drop, la grosse caisse et la basse reviennent ensemble : l'onde devient bien plus épaisse.": 'At the drop, the kick drum and the bass come back together: the wave gets much thicker.',
  'La musique de A se vide au milieu du morceau, puis repart de plus belle. C\'est…': "A's music empties out in the middle of the track, then comes back stronger. That's…",
  'Un break': 'A break', "L'outro": 'The outro',
  "Le break ressemble à une fin, mais le morceau repart ensuite. L'outro, elle, ne repart pas.": "The break sounds like an ending, but the track comes back afterward. The outro doesn't.",
  'A entre dans un break. Que fais-tu ?': 'A enters a break. What do you do?',
  "J'attends : la vraie fin vient plus tard": 'I wait: the real end comes later', 'Je lance B tout de suite': 'I start B right away', 'Je baisse le fader de A': "I bring A's fader down",
  'Si tu lances B pendant le break, A repart en plein milieu de ta transition.': 'If you start B during the break, A comes back right in the middle of your transition.',
  'Quel potard baisse surtout les voix ?': 'Which knob mostly turns the vocals down?',
  "Les voix se trouvent dans les médiums : c'est le potard MID qui les fait reculer.": "Vocals sit in the mids: it's the MID knob that pushes them back.",
  'Pourquoi couper le MID de A quand la mélodie (ou la voix) de B commence ?': "Why cut A's MID when B's melody (or vocal) starts?",
  'Pour ne jamais entendre deux mélodies ensemble': 'So you never hear two melodies together', 'Pour donner plus de basses à B': 'To give B more lows',
  'Pour garder le même tempo': 'To keep the same tempo',
  "Deux mélodies ou deux voix en même temps, c'est ce qui s'entend le plus dans un mix. Une seule à la fois.": "Two melodies or two vocals at once is what stands out most in a mix. One at a time.",
  "A se termine dans 32 temps, et B a 32 temps d'intro. Quand lances-tu B ?": 'A ends in 32 beats, and B has a 32-beat intro. When do you start B?',
  'Maintenant': 'Now', 'Dans 16 temps': 'In 16 beats', 'Dans 32 temps': 'In 32 beats',
  "Avec 32 temps d'intro lancés 32 temps avant la fin, le drop de B tombe pile quand A s'arrête.": "With a 32-beat intro started 32 beats before the end, B's drop lands right when A stops.",
  'Pour savoir quand lancer B, que regardes-tu ?': 'To know when to start B, what do you look at?',
  "Où A se termine, et combien de temps dure l'intro de B": "Where A ends, and how long B's intro lasts",
  'Seulement le tempo des deux morceaux': 'Only the tempo of both tracks', 'Seulement le début de A': 'Only the start of A',
  "La fin de A moins la longueur de l'intro de B : c'est ton moment de lancement.": "The end of A minus the length of B's intro: that's your moment to start.",
  'En house ou en techno, combien de temps compte une mesure ?': 'In house or techno, how many beats are in a bar?',
  'Une mesure, c\'est 4 temps : tu les comptes sur la grosse caisse, 1, 2, 3, 4.': 'A bar is 4 beats: you count them on the kick drum, 1, 2, 3, 4.',
  'Combien de temps y a-t-il dans 8 mesures ?': 'How many beats are in 8 bars?',
  '8 mesures de 4 temps font 32 temps : c\'est la longueur des intros et des outros dans les niveaux.': "8 bars of 4 beats make 32 beats: that's the length of intros and outros in the levels.",
  'Que veut dire BPM ?': 'What does BPM mean?', 'Battements par minute : le tempo du morceau': "Beats per minute: the track's tempo",
  'Basses par mesure': 'Basslines per bar', 'Le volume maximum du morceau': "The track's maximum volume",
  "Plus le BPM est élevé, plus le morceau est rapide. Deux morceaux au même BPM s'enchaînent plus facilement.": 'The higher the BPM, the faster the track. Two tracks at the same BPM blend more easily.',
  'Question bonus': 'Bonus question', 'Voir mon résultat': 'See my result', 'Question suivante': 'Next question',
  "Retour à l'entraînement": 'Back to practice',
  // Les badges
  'Premier pas': 'First step', 'Un premier niveau réussi': 'A first level passed', 'Bon timing': 'Good timing',
  '3 étoiles sur « Le bon moment »': '3 stars on "The right moment"', 'Swap propre': 'Clean swap', '3 étoiles sur « Le swap des basses »': '3 stars on "The bass swap"',
  'Comme en soirée': 'Like at a party', '« La transition complète » réussie': '"The full transition" passed', 'Chapitre 2 débloqué': 'Chapter 2 unlocked',
  'Oreille fine': 'Sharp ear', 'Chapitre 3 débloqué': 'Chapter 3 unlocked', "Lecteur d'ondes": 'Wave reader', 'Chapitre 3 terminé': 'Chapter 3 complete',
  'Sans faute': 'Flawless', '3 étoiles partout au chapitre 1': '3 stars everywhere in chapter 1', 'Régulier': 'Steady',
  'Objectif du jour atteint 3 jours de suite': 'Daily goal reached 3 days in a row', 'Accro': 'Hooked', 'Objectif du jour atteint 7 jours de suite': 'Daily goal reached 7 days in a row',
  'Mini-set de pro': 'Pro mini-set', '8 étoiles sur 9 dans un mini-set': '8 stars out of 9 in a mini-set', 'Tête bien faite': 'Sharp mind',
  '10 bonnes réponses au quiz': '10 right answers in the quiz', 'Pour de vrai': 'For real', 'Une première paire validée dans rekordbox': 'A first pair done in rekordbox',
  'étoiles': 'stars', 'étoiles au chapitre 1': 'stars in chapter 1', 'étoiles au chapitre 2': 'stars in chapter 2', 'niveaux du chapitre 3': 'chapter 3 levels',
  'niveaux à 3 étoiles': '3-star levels', 'jours de suite': 'days in a row', 'étoiles (ton meilleur mini-set)': 'stars (your best mini-set)', 'bonnes réponses': 'right answers',
  'Gagné !': 'Earned!', 'Pas encore gagné.': 'Not earned yet.', ', gagné': ', earned', ', pas encore gagné': ', not earned yet',
});
enMotif('Quiz éclair · question {#n} sur {#m}', 'Quick quiz · question {n} of {m}');
enMotif(/^(Bonne réponse(?: · \+(\d+) XP)?\. |Pas tout à fait\. )([\s\S]+)$/, (m, debut, xp, pourquoi) =>
  (debut.startsWith('Pas') ? 'Not quite. ' : 'Right answer' + (xp ? ' · +' + xp + ' XP' : '') + '. ') + tr(pourquoi));
enMotif('{#n} bonne réponse sur {#m}', '{n} right answer out of {m}');
enMotif('{#n} bonnes réponses sur {#m}', '{n} right answers out of {m}');
enMotif('+{#n} XP. Tu as trouvé {#a} des {#b} questions du site.', "+{n} XP. You've found {a} of the site's {b} questions.");
enMotif('Tu as trouvé {#a} des {#b} questions du site.', "You've found {a} of the site's {b} questions.");
enMotif('{#n} sur {#m} trouvées', '{n} of {m} found');
enMotif('Nouveaux badges : {x}', 'New badges: {x}');
enMotif('Nouveau badge : {x}', 'New badge: {x}');
enMotif(/^(.+?) : (.+?)\. (Gagné !|Pas encore gagné\.|Tu en es à (\d+) sur (\d+) (.+)\.)$/, (m, nom, desc, fin, a, b, unite) =>
  tr(nom) + ': ' + tr(desc) + '. ' + (a ? "You're at " + a + ' of ' + b + ' ' + tr(unite) + '.' : tr(fin)));
enMotif('Tu en es à {#a} sur {#b} {x}.', "You're at {a} of {b} {x}.");

/* ---------- Le compte (js/compte.js) et « Mon avis » (js/avis.js) ---------- */
enDe({
  'Ta progression est revenue. Recharge la page toi-même pour la voir.': 'Your progress is back. Reload the page yourself to see it.',
  'Ta progression est revenue. Ce navigateur ne sait pas la retenir : recharge la page toi-même pour la voir.': "Your progress is back. This browser can't remember it: reload the page yourself to see it.",
  "C'est la progression de cet ordinateur qui est gardée, et elle est maintenant enregistrée sur ton compte.": "This computer's progress is the one kept, and it's now saved to your account.",
  'Connexion en cours…': 'Signing in…',
  "Ta progression est trop grosse pour être enregistrée en ligne. Préviens-moi : c'est un défaut du site.": "Your progress is too big to save online. Let me know: it's a bug on the site.",
  'Tu es déconnecté. Ta progression reste sur cet ordinateur.': "You're signed out. Your progress stays on this computer.",
  "Pas de réseau : ta progression en ligne n'a pas pu être effacée, donc rien n'a été effacé. Reconnecte-toi à internet et réessaie. Tu peux aussi te déconnecter d'abord : « Tout effacer » n'effacera alors que cet ordinateur.": 'No connection: your online progress couldn\'t be erased, so nothing was erased. Get back online and try again. You can also sign out first: "Erase everything" will then only erase this computer.',
  'Création de ton compte…': 'Creating your account…', 'Envoi en cours…': 'Sending…',
  "C'est envoyé ! Regarde dans ta boîte mail, et surtout dans les indésirables. Si le lien n'y est pas cliquable, dis à ta messagerie que ce n'est pas un spam : il s'activera.": "Sent! Check your inbox, and especially your spam folder. If the link isn't clickable there, tell your email app it isn't spam: it will start working.",
  'Connexion annulée.': 'Sign-in canceled.',
  'Ton navigateur a bloqué la fenêtre de connexion. Autorise les fenêtres surgissantes pour ce site, puis réessaie.': 'Your browser blocked the sign-in window. Allow pop-ups for this site, then try again.',
  'Pas de connexion internet. Ta progression reste sur cet ordinateur, réessaie plus tard.': 'No internet connection. Your progress stays on this computer, try again later.',
  "Ce site n'est pas encore autorisé dans le projet Firebase (Authentication → Settings → Authorized domains).": "This site isn't authorized in the Firebase project yet (Authentication → Settings → Authorized domains).",
  "Le compte n'a pas le droit d'écrire. Vérifie les règles de sécurité Firestore.": "The account isn't allowed to write. Check the Firestore security rules.",
  "Cette adresse a déjà un compte. Choisis « J'ai déjà un compte » juste en dessous.": 'This address already has an account. Choose "I already have an account" just below.',
  "Cette adresse e-mail n'a pas l'air valide.": "This email address doesn't look valid.",
  'Aucun compte avec cette adresse. Tu veux peut-être en créer un ?': 'No account with this address. Maybe you want to create one?',
  'Adresse ou mot de passe incorrect.': 'Wrong email or password.', 'Écris ton mot de passe.': 'Type your password.',
  "Trop d'essais de suite. Attends quelques minutes, puis réessaie.": 'Too many tries in a row. Wait a few minutes, then try again.',
  "La création de compte par e-mail n'est pas activée dans Firebase (Authentication → Sign-in method → E-mail/Mot de passe).": "Email sign-up isn't enabled in Firebase (Authentication → Sign-in method → Email/Password).",
  'Choisis quelle progression garder': 'Choose which progress to keep', 'Mon compte DJingood': 'My DJingood account',
  'Me connecter': 'Sign me in', 'Envoyer le lien': 'Send the link',
  "On t'envoie un lien pour en choisir un nouveau.": "We'll send you a link to choose a new one.",
  "Je n'ai pas encore de compte": "I don't have an account yet", 'Revenir à la connexion': 'Back to sign-in',
  'Mot de passe oublié': 'Forgot password', 'Garde ta progression': 'Keep your progress',
  'Choisis quelle progression garder, juste en dessous.': 'Choose which progress to keep, just below.',
  'Pas de réseau : ta progression sera enregistrée dès que tu seras en ligne.': "No connection: your progress will be saved as soon as you're online.",
  'Enregistrement en cours…': 'Saving…', 'Vérification de ta progression…': 'Checking your progress…',
  'Sans compte, ta progression reste sur cet ordinateur et disparaît si tu changes de navigateur.': 'Without an account, your progress stays on this computer and disappears if you switch browsers.',
  "Écris l'adresse de ton compte.": "Type your account's email address.",
  "Les réglages de ta table restent sur cet ordinateur : ils ne servent qu'ici.": 'Your controller settings stay on this computer: they only work here.',
  "DJingood enregistre ton prénom, ton adresse et ta progression. Rien d'autre, et rien n'est partagé.": 'DJingood saves your first name, your email and your progress. Nothing else, and nothing is shared.',
  'Écris une adresse e-mail valide, comme toi@exemple.fr.': 'Type a valid email address, like you@example.com.',
  "Écris ton prénom : c'est comme ça que Vini t'appellera.": "Type your first name: that's what Vini will call you.",
  'Cacher': 'Hide',
  // « Mon avis »
  'Écris au moins une réponse, ou choisis une note.': 'Write at least one answer, or pick a rating.',
  'Merci, ton avis est enregistré ! Quand tu as fini de tester, envoie ton rapport ci-dessous.': "Thanks, your feedback is saved! When you're done testing, send your report below.",
  'Envoi de ton avis…': 'Sending your feedback…',
  "Merci, ton avis est bien arrivé chez l'équipe DJingood ! Tu peux en écrire un autre quand tu veux.": 'Thanks, your feedback reached the DJingood team! You can write another one whenever you want.',
  "Ton avis est gardé sur cet ordinateur, mais il n'a pas pu partir (pas de connexion ?). Il repartira tout seul à ta prochaine visite.": "Your feedback is saved on this computer, but it couldn't be sent (no connection?). It will go out on its own on your next visit.",
  'Sélectionne le texte ci-dessous et copie-le (Ctrl + C), puis colle-le dans ton message.': 'Select the text below and copy it (Ctrl + C), then paste it into your message.',
  'Rapport copié ! Colle-le dans un e-mail ou un message (Ctrl + V).': 'Report copied! Paste it into an email or a message (Ctrl + V).',
});
enMotif(/^(\d+ étoiles?) et (\d+ badges?)$/, (m, x, y) => tr(x) + ' and ' + tr(y));
enMotif('Bienvenue {=p} ! Ton compte est créé. À partir de maintenant, ta progression est enregistrée dessus.', 'Welcome {p}! Your account is created. From now on, your progress is saved to it.');
enMotif('Ton mot de passe est trop court : il en faut au moins {#n} caractères.', 'Your password is too short: it needs at least {n} characters.');
enMotif("Ça n'a pas marché : {=m}", "That didn't work: {m}");
enMotif("Ton compte a déjà une progression ({x}), et cet ordinateur en a une autre ({y}). Laquelle tu gardes ? L'autre sera remplacée. Rien n'est enregistré tant que tu n'as pas choisi.", "Your account already has progress ({x}), and this computer has different progress ({y}). Which one do you keep? The other will be replaced. Nothing is saved until you choose.");
enMotif('Au moins {#n} caractères.', 'At least {n} characters.');
enMotif('Salut {=p} ! Progression enregistrée à {=h}.', 'Hi {p}! Progress saved at {h}.');
enMotif('Salut {=p} ! Ta progression est enregistrée au fur et à mesure.', 'Hi {p}! Your progress is saved as you go.');
enMotif('{#n} badges', '{n} {n:badge:badges}');
enMotif('{#n} badge', '{n} badge');
enMotif('{#n} avis', '{n} {n:review:reviews}');
enMotif('{#n} parties jouées', '{n} games played');
enMotif('{#n} partie jouée', '{n} game played');
enMotif("Il contient {x}, {y} et le temps passé sur le site. Il reste sur cet ordinateur tant que tu ne le copies pas.", "It contains {x}, {y} and the time spent on the site. It stays on this computer until you copy it.");

/* ---------- La page de présentation (presentation.html) ---------- */
enDe({
  'Ouvrir le site': 'Open the site', 'Pour toutes les tables de débutant': 'For every beginner controller',
  'Apprends à mixer sur ta table, un geste à la fois.': 'Learn to mix on your controller, one move at a time.',
  "Tu as une table et tu n'y connais rien ? En deux semaines, tu fais tes premières vraies transitions propres, avec ta musique.": "Got a controller and don't know the first thing about it? In two weeks, you'll make your first real clean transitions, with your own music.",
  'Essayer gratuitement': 'Try it for free', 'Comment ça marche': 'How it works',
  'Gratuit pendant la phase de test': 'Free during the beta', 'sans compte': 'no account', 'tout reste sur ton ordinateur': 'everything stays on your computer',
  'Le site écoute ta table et te dit ce qui cloche.': "The site listens to your controller and tells you what's off.",
  'Branche ta table en USB. Les gestes arrivent sur une piste qui défile, comme dans un jeu de rythme : lancer B, monter le fader, échanger les basses. Tu les fais sur ta vraie table, et le site te note au temps près.': 'Plug your controller in over USB. The moves come down a scrolling track, like in a rhythm game: start B, bring the fader up, swap the lows. You make them on your real controller, and the site scores you to the beat.',
  'Raté ? Il te dit pourquoi, par exemple « B est parti 8 temps trop tôt », et te montre ton geste à côté du geste idéal.': 'Missed it? It tells you why, for example "B started 8 beats too early", and shows your move next to the ideal one.',
  'Un niveau en cours : la piste des deux morceaux, le compte à rebours et les potards LOW à tourner': 'A level in progress: the track of both songs, the countdown and the LOW knobs to turn',
  "S'entraîner chaque jour": 'Practice every day',
  "Un objectif de 5, 10 ou 15 minutes par jour, une série de jours à tenir, un défi du jour, des mini-sets de trois transitions d'affilée et un quiz pour retenir les mots du DJ.": "A goal of 5, 10 or 15 minutes a day, a streak to keep up, a daily challenge, mini-sets of three transitions in a row and a quiz to learn DJ vocabulary.",
  "L'accueil : la prochaine étape du parcours et l'objectif du jour": 'The home page: the next step of the path and the daily goal',
  "Importe ta collection rekordbox : le site te propose des paires de tes morceaux qui s'enchaînent bien, puis des missions à faire dans rekordbox, avec ta musique.": 'Import your rekordbox collection: the site suggests pairs of your tracks that blend well, then missions to do in rekordbox, with your own music.',
  'Une paire de morceaux de la collection, et la mission en cours à faire dans rekordbox': 'A pair of tracks from the collection, and the current mission to do in rekordbox',
  'Pour qui': "Who it's for", 'Trois parcours, selon où tu en es.': "Three paths, depending on where you're at.",
  "Tu n'as jamais mixé. Un petit tour pour apprendre à compter la musique, puis sept gestes, un par niveau, chaque bouton présenté juste avant de s'en servir : le bon moment, le fader, la coupure, l'écho, le filtre, le swap des basses, puis la transition complète pour finir.": "You've never mixed. A quick tour to learn to count music, then seven moves, one per level, each button introduced right before you use it: the right moment, the fader, the cut, the echo, the filter, the bass swap, then the full transition to finish.",
  "Tu sais lancer deux morceaux. Pas d'explications imposées, tout est ouvert : les sept gestes en Mode Expert (sans compte à rebours, notés à la milliseconde), puis les combos, le calage et un vrai set de plusieurs morceaux.": 'You can play two tracks. No forced explanations, everything is unlocked: the seven moves in Expert Mode (no countdown, scored to the millisecond), then combos, beatmatching and a real set of several tracks.',
  "Tu mixes déjà. On attaque direct par un vrai set : plusieurs morceaux enchaînés sans que la musique s'arrête, noté sur 100. Puis le calage sans SYNC, les combos sans filet et le Mode Expert.": 'You already mix. We go straight to a real set: several tracks back to back without the music stopping, scored out of 100. Then beatmatching without SYNC, combos with no safety net and Expert Mode.',
  "Ce qu'il te faut": 'What you need',
  'Une table DJ branchée en USB, et un casque ou des enceintes. Le site reconnaît tout seul une quinzaine de tables de débutant (Pioneer, Hercules, Numark, Roland, Reloop) ; une autre table se règle en une minute.': 'A DJ controller plugged in over USB, and headphones or speakers. The site recognizes about fifteen beginner controllers on its own (Pioneer, Hercules, Numark, Roland, Reloop); any other controller takes a minute to set up.',
  'Un ordinateur avec <b>Chrome</b> ou <b>Edge</b>.': 'A computer with <b>Chrome</b> or <b>Edge</b>.',
  'Pas encore de table ? Tu peux essayer à la souris.': 'No controller yet? You can try with the mouse.',
  'Questions fréquentes': 'FAQ', "C'est gratuit ?": 'Is it free?', 'Oui, pendant la phase de test.': 'Yes, during the beta.',
  'Faut-il créer un compte ?': 'Do I need an account?',
  "Non, tu peux tout faire sans compte : ta progression reste alors dans ton navigateur, sur cet ordinateur, et elle n'est envoyée nulle part. Si tu en crées un (avec une adresse e-mail ou avec Google), tes étoiles, tes XP et tes badges te suivent d'un appareil à l'autre, et tu ne perds rien en changeant d'ordinateur.": "No, you can do everything without one: your progress then stays in your browser, on this computer, and isn't sent anywhere. If you create one (with an email address or with Google), your stars, XP and badges follow you from one device to another, and you don't lose anything when you switch computers.",
  'Avec quelle musique ?': 'With what music?',
  'Les niveaux se jouent sur de vrais morceaux de house libres de droits (Play House, domaine public). Tu peux aussi choisir des morceaux fabriqués par le site, en house, techno ou afro. Ensuite, « Passer au vrai » te fait travailler avec ta propre musique dans rekordbox.': 'The levels are played on real royalty-free house tracks (Play House, public domain). You can also pick tracks made by the site, in house, techno or afro. Then, "Go for real" gets you working with your own music in rekordbox.',
  'Ça remplace rekordbox ?': 'Does it replace rekordbox?',
  "Non. DJingood t'apprend les gestes ; rekordbox reste le logiciel avec lequel tu mixes pour de vrai.": 'No. DJingood teaches you the moves; rekordbox is still the software you mix with for real.',
  "Et si j'ai une autre table ?": 'What if I have another controller?',
  "Le site reconnaît tout seul une quinzaine de tables de débutant (Pioneer DDJ-FLX4, DDJ-400, DDJ-SB3 et DDJ-200, Hercules Inpulse 200, 300 et 500 et Starlight, Numark Mixtrack Platinum FX et Pro FX, Party Mix et DJ2GO2 Touch, Roland DJ-505, Reloop Mixage). Si tu branches une table qu'il ne connaît pas encore, il te propose de la régler pas à pas : il te montre chaque commande, tu la bouges, il la reconnaît. Une commande que ta table n'a pas se fait à la souris. Les réglages de ces tables viennent de leur documentation : dis-nous si quelque chose ne marche pas avec la tienne.": "The site recognizes about fifteen beginner controllers on its own (Pioneer DDJ-FLX4, DDJ-400, DDJ-SB3 and DDJ-200, Hercules Inpulse 200, 300 and 500 and Starlight, Numark Mixtrack Platinum FX and Pro FX, Party Mix and DJ2GO2 Touch, Roland DJ-505, Reloop Mixage). If you plug in a controller it doesn't know yet, it offers to set it up step by step: it shows you each control, you move it, it recognizes it. A control your controller doesn't have is done with the mouse. These controllers' settings come from their documentation: let us know if something doesn't work with yours.",
  'Sur téléphone ?': 'On a phone?',
  "Oui, pour commencer : sur téléphone, DJingood propose sept petites leçons sans table pour apprendre à compter la musique (le temps, la phrase, les parties d'un morceau…), au doigt. Pour les gestes sur ta table, il faut un ordinateur avec Chrome ou Edge, la table branchée en USB.": "Yes, to get started: on a phone, DJingood offers seven short lessons without a controller to learn to count music (the beat, the phrase, the parts of a track…), with your finger. For the moves on your controller, you need a computer with Chrome or Edge, and the controller plugged in over USB.",
  "Qu'est-ce que DJingood sait de moi ?": 'What does DJingood know about me?',
  'Presque rien : pas de publicité, pas de cookie. Le site compte ses visites sans savoir qui tu es, et ton avis ne part que si tu l\'envoies. Tout est expliqué dans <a href="confidentialite.html">Ce que DJingood garde sur toi</a>.': 'Almost nothing: no ads, no cookies. The site counts its visits without knowing who you are, and your feedback is only sent if you send it. It\'s all explained in <a href="confidentialite.html">What DJingood keeps about you</a> (in French).',
  "Ta première transition propre, c'est aujourd'hui.": 'Your first clean transition is today.',
  'Guide du DJ débutant': "Beginner DJ's guide",
  'Apprendre à mixer quand on débute': 'Learning to mix as a beginner', 'Comment marche DJingood': 'How DJingood works',
});

/* ---------- Relevé par le robot du lot 53 : ce qui n'apparaît qu'en jouant ---------- */
enDe({ 'temps': 'beats' });
enMotif('{#n} BPM', '{n} BPM');
enMotif('temps {#n}', 'beat {n}');
enMotif('{#n} sur {#m}', '{n} of {m}');
enMotif('{x}, gagné', '{x}, earned');
enMotif('{x}, pas encore gagné', '{x}, not earned yet');
// Un essai dans une fiche : « Appuie sur PLAY à droite… » suivi de « (ou clique sur PLAY) »
enMotif(/^(.+) (\(ou (?:clique sur \w+|utilise le curseur)\))$/, (m, a, b) => tr(a) + ' ' + tr(b));
// Le nom d'une commande de « Ma table » suivi de sa platine (« Potard LOW A »)
enMotif(/^(.+) ([AB])$/, (m, nom, k) => { const t = trExact(nom); return t === null ? null : t + ' ' + k; });
// Une liste de noms connus (« Premier pas, Bon timing ») : seulement si chaque nom est dans le dictionnaire
enMotifFin(/^[^,]+(, [^,]+)+$/, m => { const l = m.split(', ').map(trExact); return l.includes(null) ? null : l.join(', '); });

/* ---------- « S'entraîner » (js/entrainement.js) et « Passer au vrai » (js/rekordbox.js) ---------- */
enPareil('Afro house', 'Afro House', 'Tech House', 'Disco', 'Tempo', 'Style', 'Exemple');
enDe({
  "Joue d'abord un niveau dans Apprendre : ensuite, je t'entraîne ici !": "Play a level in Learn first: then I'll train you here!",
  'Défi réussi ! Et si tu tentais un mini-set de 3 transitions ?': 'Challenge done! How about trying a mini-set of 3 transitions?',
  "Défi réussi ! Rejoue tes gestes à l'oreille pour les affûter.": 'Challenge done! Replay your moves by ear to sharpen them.',
  "Le défi du jour n'est pas encore réussi : retente-le !": "Today's challenge isn't done yet: give it another go!",
  'Réussi': 'Done', 'À retenter': 'Try again', 'Verrouillé': 'Locked',
  'Joue 3 niveaux dans Apprendre pour débloquer les mini-sets.': 'Play 3 levels in Learn to unlock the mini-sets.',
  'Joue d\'abord un niveau dans <a href="#apprendre">Apprendre</a> : l\'entraînement reprend les gestes que tu connais déjà.': 'Play a level in <a href="#apprendre">Learn</a> first: practice reuses the moves you already know.',
  'Variation': 'Variation', "À l'oreille : pas de compte à rebours. Compte les phrases dans ta tête.": 'By ear: no countdown. Count the phrases in your head.',
  'Il faut 2 étoiles pour valider le défi : rejoue !': 'You need 2 stars to pass the challenge: play again!',
  'Une autre variation': 'Another variation', 'Pas encore : suis la grosse caisse et compte 8 mesures.': 'Not yet: follow the kick drum and count 8 bars.',
  "Une autre à l'oreille": 'Another one by ear', 'Pas encore. Lis le conseil, puis enchaîne.': 'Not yet. Read the tip, then keep going.',
  'Transition suivante': 'Next transition', 'Mini-set de pro !': 'Pro mini-set!', 'Beau mini-set !': 'Nice mini-set!', 'Mini-set terminé': 'Mini-set complete',
  // Passer au vrai
  'Matin clair': 'Clear morning', 'Les quais': 'The docks', 'Verre fumé': 'Smoked glass', 'Piscine vide': 'Empty pool', 'Après minuit': 'After midnight',
  'Néon rose': 'Pink neon', 'Tunnel': 'Tunnel', 'Acier': 'Steel', 'Sable chaud': 'Warm sand', 'Tambours': 'Drums', 'Grand soleil': 'Bright sun', 'Vieux vinyle': 'Old vinyl',
  'Prépare tes deux morceaux': 'Get your two tracks ready', 'Repère la fin du premier morceau': 'Find the end of the first track',
  'même tempo': 'same tempo', 'tempos proches': 'close tempos', 'à ajuster': 'needs adjusting', 'Tonalité': 'Key', 'la même': 'the same',
  'voisines': 'neighbors', 'cousines': 'related', "montée d'énergie": 'energy boost', 'à écouter': 'listen first', 'le même': 'the same',
  'différents': 'different', 'inconnu': 'unknown', 'Genre absent de rekordbox': 'No genre in rekordbox',
  'Ta paire': 'Your pair', 'Une paire pour toi': 'A pair for you', 'Artiste inconnu': 'Unknown artist',
  'Ta collection est trop grande pour être gardée en mémoire : il faudra la réimporter à ta prochaine visite.': "Your collection is too big to remember: you'll need to import it again on your next visit.",
  'Tout d\'affilée, sans t\'arrêter : LOW coupé, PLAY sur la phrase, fader qui monte, swap des basses, puis le premier morceau qui sort. Recommence jusqu\'à ce que ça sonne propre trois fois de suite.': "All in one go, without stopping: LOW cut, PLAY on the phrase, fader coming up, bass swap, then the first track going out. Start over until it sounds clean three times in a row.",
  "C'est fait": 'Done', 'Nouveau badge : Pour de vrai.': 'New badge: For real.',
  'Masquer les missions': 'Hide the missions', 'Ne voir que la mission en cours': 'Only show the current mission', 'Revoir les missions': 'See the missions again',
  'Montre-moi ta collection rekordbox : je te trouve deux morceaux qui vont bien ensemble !': "Show me your rekordbox collection: I'll find you two tracks that go well together!",
  'Choisis deux morceaux, je te prépare les missions.': "Pick two tracks, I'll prepare the missions for you.",
  "Je n'ai pas trouvé de paire : il me faut des morceaux avec leur tempo et leur tonalité.": "I couldn't find a pair: I need tracks with their tempo and key.",
  'Voilà une autre paire pour toi ! Ça te tente ?': "Here's another pair for you! Up for it?", 'Voilà ta paire du jour ! Ça te tente ?': "Here's your pair of the day! Up for it?",
  'Facile': 'Easy', 'Aucune paire trouvée pour cette recherche.': 'No pair found for this search.',
  'Aucune paire trouvée. Vérifie que rekordbox a bien analysé tes morceaux (tempo et tonalité), puis réexporte ta collection.': 'No pair found. Check that rekordbox has analyzed your tracks (tempo and key), then export your collection again.',
  "collection d'exemple": 'sample collection', 'Ce fichier ne contient aucun morceau.': "This file doesn't contain any tracks.",
  "Ce fichier n'est pas une collection rekordbox. Dans rekordbox : Fichier, puis Exporter la collection au format xml.": "This file isn't a rekordbox collection. In rekordbox: File, then Export Collection in xml format.",
});
enMotif('Défi réussi ! Et un mini-set pour battre ton record de {#n} ★ sur 9 ?', 'Challenge done! How about a mini-set to beat your record of {n} ★ out of 9?');
enMotif("Le défi du jour t'attend : « {x} », en {x2}.", 'Today\'s challenge is waiting: "{x}", in {x2}.');
enMotif("Aujourd'hui : {x}, en {y}.{z}", 'Today: {x}, in {y}.{z}');
enMotif("Aujourd'hui : {x}, en {y}.", 'Today: {x}, in {y}.');
enMotif("Réussi {#n} jours d'affilée.", 'Done {n} days in a row.');
enMotif("Réussi {#n} jour d'affilée.", 'Done {n} day in a row.');
enMotif("Défi réussi · {#n} jours d'affilée", 'Challenge done · {n} days in a row');
enMotif("Défi réussi · {#n} jour d'affilée", 'Challenge done · {n} day in a row');
enMotif('{#n} jouées', '{n} played'); enMotif('{#n} jouée', '{n} played');
enMotif('{#n} réussies', '{n} passed'); enMotif('{#n} réussie', '{n} passed');
enMotif("{#n} réussies à l'oreille", '{n} passed by ear'); enMotif("{#n} réussie à l'oreille", '{n} passed by ear');
enMotif('{#n} variations jouées', '{n} variations played'); enMotif('{#n} variation jouée', '{n} variation played');
enMotif('Record : {#n}/9 ★', 'Best: {n}/9 ★');
enMotif("L'entraînement reprend les niveaux que tu as déjà joués dans Apprendre ({#n} sur {#m}), sur d'autres morceaux.", "Practice reuses the levels you've already played in Learn ({n} of {m}), on other tracks.");
enMotif('Mini-set · transition {#n} sur 3', 'Mini-set · transition {n} of 3');
// « Le bon moment, en House » (titre d'un niveau d'entraînement) : seulement si les deux noms sont connus
enMotif(/^([^<>,]+), en ([^<>,]+)$/, (m, x, y) => { const a = trExact(x), b = trExact(y); return a === null || b === null ? null : a + ', in ' + b; });
enMotif('Transition {#n} sur 3', 'Transition {n} of 3');
enMotif('{#n} ★ sur 9 · nouveau record !', '{n} ★ out of 9 · new record!');
enMotif('{#n} ★ sur 9 · record : {#m} ★', '{n} ★ out of 9 · record: {m} ★');
enMotif('même tonalité ({=k})', 'same key ({k})');
enMotif('tonalités voisines ({=a} et {=b})', 'neighboring keys ({a} and {b})');
enMotif('tonalités cousines ({=a} et {=b})', 'related keys ({a} and {b})');
enMotif("montée d'énergie ({=a} vers {=b})", 'energy boost ({a} to {b})');
enMotif('tonalités éloignées ({=a} et {=b})', 'distant keys ({a} and {b})');
enMotif('Même tempo ({#n} BPM)', 'Same tempo ({n} BPM)');
enMotif('{#a} et {#b} BPM', '{a} and {b} BPM');
enMotif('même genre', 'same genre');
enMotif(/^([0-9A-B]{1,3}) et ([0-9A-B]{1,3})$/, (m, a, b) => a + ' and ' + b);
enMotif('Dans rekordbox, charge « {=a} » sur la platine 1 et « {=b} » sur la platine 2.', 'In rekordbox, load "{a}" on deck 1 and "{b}" on deck 2.');
enMotif('Ils sont au même tempo ({#n} BPM).', "They're at the same tempo ({n} BPM).");
enMotif('Le premier est à {#a} BPM, le second à {#b} : appuie sur BEAT SYNC de la platine 2 pour qu\'il se cale sur le premier.', "The first is at {a} BPM, the second at {b}: press BEAT SYNC on deck 2 so it locks onto the first.");
enMotif('Écoute « {=a} » en comptant les phrases de 32 temps. Vers la fin, trouve le moment où le morceau se vide : c\'est son outro. Pose un repère dessus avec un pad HOT CUE.', 'Listen to "{a}" while counting 32-beat phrases. Near the end, find the moment the track empties out: that\'s its outro. Set a marker there with a HOT CUE pad.');
enMotif("Fader de la platine 2 en bas. Relance « {=a} » un peu avant ton repère, et appuie sur PLAY de la platine 2 pile sur le premier temps de l'outro. Écoute au casque (bouton CUE du canal 2) : les deux grosses caisses doivent tomber ensemble.", 'Deck 2 fader down. Restart "{a}" a little before your marker, and press PLAY on deck 2 right on the first beat of the outro. Listen in your headphones (CUE button on channel 2): both kick drums should land together.');
enMotif('Refais la même chose, puis monte le fader de « {=a} » sur une phrase, et baisse celui de « {=b} » sur la phrase suivante.', 'Do the same thing again, then bring up the fader of "{a}" over one phrase, and bring down the one of "{b}" over the next phrase.');
enMotif("Avant de lancer « {=a} », coupe son LOW. Au début d'une phrase, coupe le LOW de « {=b} » (tout à gauche) et remets celui de « {=c} » à normal (à midi), dans le même geste.", 'Before starting "{a}", cut its LOW. At the start of a phrase, cut the LOW of "{b}" (all the way left) and bring the one of "{c}" back to normal (12 o\'clock), in the same move.');
enMotif('{#n} BPM · {=k}', '{n} BPM · {k}');
enMotif('Les {#n} missions sont faites avec « {=a} » puis « {=b} ».', 'All {n} missions are done with "{a}" then "{b}".');
enMotif("Mission {#n} sur {#m}. Fais-la sur ta table, puis appuie sur « C'est fait » quand c'est propre.", 'Mission {n} of {m}. Do it on your controller, then press "Done" when it\'s clean.');
enMotif('Paire validée ! Tu as réussi {#n} vraies transitions avec ta musique.{y}', 'Pair done! You nailed {n} real transitions with your own music.{y}');
enMotif('Paire validée ! Tu as réussi {#n} vraie transition avec ta musique.{y}', 'Pair done! You nailed {n} real transition with your own music.{y}');
enMotif('Paire validée ! Tu as réussi {#n} vraies transitions avec ta musique.', 'Pair done! You nailed {n} real transitions with your own music.');
enMotif('Paire validée ! Tu as réussi {#n} vraie transition avec ta musique.', 'Pair done! You nailed {n} real transition with your own music.');
enMotif('Paire validée, bravo ! Tu as fait {x} avec ta musique.', 'Pair done, well done! You made {x} with your own music.');
enMotif('{#n} vraies transitions', '{n} real transitions'); enMotif('{#n} vraie transition', '{n} real transition');
enMotif('Mission {#n} sur {#m} : {x}.', 'Mission {n} of {m}: {x}.');
enMotif('{#n} morceaux', '{n} tracks'); enMotif('{#n} morceau', '{n} track');
enMotif('{#n} avec tempo et tonalité', '{n} with tempo and key');
enMotif('Ta collection est très grande : seuls les {#n} premiers morceaux sont utilisés.', 'Your collection is very big: only the first {n} tracks are used.');

// La valeur du filtre CFX, affichée quand on le tourne (js/audio.js)
enMotif('coupe-bas {#n} %', 'low cut {n}%');
enMotif('coupe-haut {#n} %', 'high cut {n}%');
// Les mots du DJ de « Comment faire ? » : une ligne par mot, toutes dans le même texte
enMotifFin(/^((?:Intro|Outro|Drop|Break|Phrase|Swap|Écho|Hot cue|Boucle|Quantize) : [\s\S]+)$/, (m, s) => {
  const l = s.split(/(?<=\.) (?=(?:Intro|Outro|Drop|Break|Phrase|Swap|Écho|Hot cue|Boucle|Quantize) : )/);
  return l.length > 1 ? l.map(tr).join('\n') : null;
});

enMotif('{#n} dB', '{n} dB');

trPage();
