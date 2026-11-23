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
  'Ton prénom': 'Your first name', 'Ton e-mail': 'Your email', 'toi@exemple.fr': 'you@example.com',
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


/* ---------- Lot 80 : début ---------- */
// Écrit pendant le lot 80 (novembre 2026) : ce que le site a gagné depuis le lot 53. Une ligne se corrige à la main.
enPareil("PRO", "DJingood Pro", "HOT CUES", "Pause", "Pixabay", "Pro", "Deep House", "Ambient House", "Deep House Instrumental", "Luxury Life", "Fashion Diva House", "Filter House", "House - July", "Pioneer XDJ-RR", "Satin", "Aurore", "Mirage", "Warm-up", "Afro sunset", "Lune Basse", "Kalia Moon", "Terre rouge", "Moussa K.", "Soleil noir", "Kora Club", "Ilé Ayo", "Sahel Drive", "Savane", "Cuivres", "Paloma Vee", "Noé Marlo", "Lumière noire", "Fil rouge", "Saint-Ange", "Fièvre", "Dernier métro", "Grand bleu", "Oslo Nuit", "Melodic House & Techno", "Marée haute", "Acier Doux", "Mira Sol", "House & Nu Disco", "Les Jumeaux Disco", "Boule à facettes", "Bain de minuit", "Possible", "Playlist", "FADER ↓", "FADER ↑", "LOW ↓", "LOW ↑", "HI ↓", "MID ↓", "HI ↑", "MID ↑", "3 min", "2 min");

/* ---------- index.html (lot 80) ---------- */
enDe({
  "Mixe comme<br><span class=\"pro-accent\">un vrai DJ.</span>": "Mix like<br><span class=\"pro-accent\">a real DJ.</span>",
  "L'entraînement et Ma musique<small>Variations, à l'oreille, mini-sets, et ce qui va avec chaque morceau de ta collection rekordbox.</small>": "Practice and My music<small>Variations, by ear, mini-sets, and what goes with each track in your rekordbox collection.</small>",
  "<b>Ton premier mois est offert</b>, sans carte bancaire : merci d'avoir été là avant Pro. Ensuite, ce prix, seulement si tu continues.": "<b>Your first month is free</b>, no credit card needed: thanks for being here before Pro. After that, this price, only if you keep going.",
  "<b>7 jours gratuits</b>, puis ce prix. Ta carte est demandée, mais rien n'est prélevé avant le 7<sup>e</sup> jour&nbsp;; Vini t'envoie un mail 2 jours avant la fin de l'essai. Tu arrêtes quand tu veux, dans «&nbsp;Mon compte&nbsp;».": "<b>7 days free</b>, then this price. We ask for your card, but nothing is charged before the 7<sup>th</sup> day; Vini emails you 2 days before your trial ends. Cancel anytime in \"My account\".",
  "Bienvenue dans <span class=\"pro-accent\">Pro</span> !": "Welcome to <span class=\"pro-accent\">Pro</span>!",
  "Tu gardes toutes tes étoiles et ton niveau. Et pour te remercier, <b>ton premier mois de Pro est offert</b>&nbsp;: tous les chapitres, tous les tutos.": "You keep all your stars and your level. And to thank you, <b>your first month of Pro is free</b>: every chapter, every tutorial.",
  "<span class=\"pro-tag\">Pro</span>Avec DJingood Pro, comme les 7 chapitres et tous les tutos.": "<span class=\"pro-tag\">Pro</span>With DJingood Pro, like the 7 chapters and all the tutorials.",
  "<span class=\"pro-tag\">Pro</span>Gratuit : l'import, et la fiche d'un morceau. Tout le reste avec DJingood Pro.": "<span class=\"pro-tag\">Pro</span>Free: the import, and one track's card. Everything else with DJingood Pro.",
  "Dans rekordbox, ouvre le menu <b>Fichier</b>.": "In rekordbox, open the <b>File</b> menu.",
  "Choisis <b>« Exporter la collection au format xml »</b>, et enregistre le fichier.": "Choose <b>\"Export Collection in xml format\"</b>, and save the file.",
  "Comprendre<small>Gratuit, juste le son</small>": "Understand<small>Free, just the sound</small>",
  "<span class=\"pro-tag\">Pro</span>La suite, avec DJingood Pro": "<span class=\"pro-tag\">Pro</span>The rest, with DJingood Pro",
  "<b>Garde ta progression.</b><span>Crée ton compte&nbsp;: tes étoiles et ta série te suivent sur tous tes appareils.</span>": "<b>Keep your progress.</b><span>Create your account: your stars and your streak follow you on all your devices.</span>",
  "Ton rapport pour l'équipe": "Your report for the team",
  "← Retour": "← Back",
  "Recevoir les conseils de Vini par mail : 3 pour démarrer, puis un par semaine au plus. Désinscription en un clic.": "Get Vini's tips by email: 3 to get started, then one a week at most. Unsubscribe in one click.",
  "Créer un compte avec mon e-mail": "Create an account with my email",
  "Pas de mot de passe ? Recevoir un lien de connexion": "No password? Get a sign-in link",
  "Abonnement": "Subscription",
  "Réglages": "Settings",
  "Volume du site": "Site volume",
  "Les mails de Vini": "Vini's emails",
  "Mixe comme": "Mix like",
  "un vrai DJ.": "a real DJ.",
  "Toute la formation DJingood : les exercices avec ta table, les tutos de Vini, l'entraînement.": "The whole DJingood course: the exercises with your controller, Vini's tutorials, practice.",
  "Les 7 chapitres": "All 7 chapters",
  "exercices de plus : le swap des basses, le calage, les hot cues, le set noté sur 100.": "more exercises: the bass swap, beatmatching, hot cues, the set scored out of 100.",
  "Tous les tutos de Vini": "All of Vini's tutorials",
  "de plus aujourd'hui, et un nouveau chaque mois.": "more today, and a new one every month.",
  "Variations, à l'oreille, mini-sets, et ce qui va avec chaque morceau de ta collection rekordbox.": "Variations, by ear, mini-sets, and what goes with each track in your rekordbox collection.",
  "Mensuel": "Monthly",
  "Annuel": "Yearly",
  "/ an": "/ year",
  ", sans carte bancaire : merci d'avoir été là avant Pro. Ensuite, ce prix, seulement si tu continues.": ", no credit card needed: thanks for being here before Pro. After that, this price, only if you keep going.",
  "7 jours gratuits": "7 days free",
  ", puis ce prix. Ta carte est demandée, mais rien n'est prélevé avant le 7": ", then this price. We ask for your card, but nothing is charged before the 7",
  "jour ; Vini t'envoie un mail 2 jours avant la fin de l'essai. Tu arrêtes quand tu veux, dans « Mon compte ».": "day; Vini emails you 2 days before your trial ends. Cancel anytime in \"My account\".",
  "D'abord, essaie avec ta table": "First, try it with your controller",
  "Passer à Pro quand même": "Go Pro anyway",
  "Sans engagement": "No commitment",
  "Paiement sécurisé par Stripe": "Secure payment by Stripe",
  "Conditions de vente": "Terms of sale",
  "Mentions légales": "Legal notice",
  "Pas maintenant": "Not now",
  "Ce que tu débloques": "What you unlock",
  "Tous les tutos, et un nouveau chaque mois.": "All the tutorials, and a new one every month.",
  "LES BASES": "THE BASICS",
  "La fin du chapitre 1": "The end of chapter 1",
  "4 niveaux": "4 levels",
  "À L'OREILLE": "BY EAR",
  "7 niveaux": "7 levels",
  "CALAGE": "BEATMATCHING",
  "LE SET": "THE SET",
  "7 niveaux, noté sur 100": "7 levels, scored out of 100",
  "Bienvenue dans": "Welcome to",
  "Tous les tutos sont ouverts.": "All the tutorials are unlocked.",
  "Voir les tutos": "See the tutorials",
  "Merci d'avoir été là dès le début !": "Thanks for being here from the start!",
  "DJingood passe à un abonnement, DJingood Pro.": "DJingood is moving to a subscription, DJingood Pro.",
  "Tu gardes toutes tes étoiles et ton niveau. Et pour te remercier,": "You keep all your stars and your level. And to thank you,",
  "ton premier mois de Pro est offert": "your first month of Pro is free",
  "tous les chapitres, tous les tutos.": "every chapter, every tutorial.",
  "Sans carte bancaire. À la fin du mois, tu choisis de continuer ou non.": "No credit card. At the end of the month, you choose whether to continue.",
  "Ce message ne s'affiche qu'une fois. L'offre reste dans la fenêtre Pro.": "This message only shows once. The offer stays in the Pro window.",
  "Tu es connecté": "You're signed in",
  "Bienvenue sur ordinateur !": "Welcome to DJingood on your computer!",
  "Ton plan du téléphone est là. Ici, tu vas brancher ta table.": "The plan from your phone is here. Now you'll plug in your controller.",
  "Relevé de ta table": "Your controller report",
  "Copier le relevé": "Copy the report",
  "Tutos": "Tutorials",
  "Revoir le guide": "See the guide again",
  "Son": "Sound",
  "Le volume de tout le site : exercices, tutos, leçons.": "The volume for the whole site: exercises, tutorials, lessons.",
  "Petits sons du jeu": "Little game sounds",
  "Réussi, raté, étoiles, coffres.": "Success, miss, stars, chests.",
  "Mon avis : ce qui t'a bloqué, ce qui t'a plu": "Feedback: what got you stuck, what you liked",
  "Ou fais le défi du jour (gratuit)": "Or do the daily challenge (free)",
  "Sur ton ordinateur": "On your computer",
  "Donner mon avis": "Give feedback",
  "Entraînement": "Practice",
  "Mixe ta musique": "Mix your music",
  "Choisis un morceau de ta collection rekordbox : je te trouve ceux qui vont avec, et je t'explique comment faire la transition.": "Pick a track from your rekordbox collection: I'll find the ones that go with it, and explain how to do the transition.",
  "Avec DJingood Pro, comme les 7 chapitres et tous les tutos.": "With DJingood Pro, like the 7 chapters and all the tutorials.",
  "Choisis un morceau que tu aimes : je te trouve ceux qui vont avec dans ta collection, et je t'explique comment faire la transition.": "Pick a track you love: I'll find the ones in your collection that go with it, and explain how to do the transition.",
  "Gratuit : l'import, et la fiche d'un morceau. Tout le reste avec DJingood Pro.": "Free: the import, and one track's card. Everything else with DJingood Pro.",
  "Importer ma collection rekordbox": "Import my rekordbox collection",
  "Comment exporter ma collection depuis rekordbox ?": "How do I export my collection from rekordbox?",
  "Dans rekordbox, ouvre le menu": "In rekordbox, open the menu",
  "Fichier": "File",
  "Choisis": "Choose",
  "« Exporter la collection au format xml »": "\"Export Collection in xml format\"",
  ", et enregistre le fichier.": ", and save the file.",
  "Reviens ici, appuie sur « Importer ma collection rekordbox » et choisis ce fichier.": "Come back here, press \"Import my rekordbox collection\" and choose that file.",
  "Mettre à jour": "Update",
  "Réimporte ta collection rekordbox pour voir aussi tes playlists, la date d'ajout de tes morceaux et ce que tu as déjà joué.": "Re-import your rekordbox collection to also see your playlists, when you added your tracks, and what you've already played.",
  "Mes morceaux": "My tracks",
  "Vus récemment": "Recently viewed",
  "Chercher un titre ou un artiste": "Search for a title or an artist",
  "Filtres": "Filters",
  "Trier par": "Sort by",
  "Les techniques des DJ, expliquées par Vini. Tu écoutes, tu regardes la table, et tu comprends pourquoi ça marche.": "DJ techniques, explained by Vini. You listen, you watch the controller, and you understand why it works.",
  "« Le fondu au fader » est gratuit.": "\"The fader fade\" is free.",
  "Les autres, et un nouveau chaque mois, sont dans DJingood Pro.": "The others, and a new one every month, are in DJingood Pro.",
  "Tuto": "Tutorial",
  "‹ Tous les tutos": "‹ All tutorials",
  "Chapitres du tuto": "Tutorial chapters",
  "Écoute": "Listen",
  "Tuto suivant": "Next tutorial",
  "Revoir le tuto": "Watch the tutorial again",
  "Lecteur du tuto": "Tutorial player",
  "Plan précédent": "Previous shot",
  "Plan suivant": "Next shot",
  "Réécouter": "Listen again",
  "Niveaux du chapitre": "Chapter levels",
  "Tous les niveaux": "All levels",
  "Sans table": "No controller",
  "Gratuit, juste le son": "Free, just the sound",
  "Avec ta table": "With your controller",
  "La suite du chapitre :": "The rest of the chapter:",
  "La suite, avec DJingood Pro": "The rest, with DJingood Pro",
  "Puis 6 chapitres : à l'oreille, les vrais morceaux, les combos, le calage, les hot cues et le set noté sur 100.": "Then 6 chapters: by ear, real tracks, combos, beatmatching, hot cues, and the set scored out of 100.",
  "Voir tout ce qu'il y a dans Pro": "See everything in Pro",
  "Crée ton compte : tes étoiles et ta série te suivent sur tous tes appareils.": "Create your account: your stars and your streak follow you on all your devices.",
  "« Deep House » puis « Ambient House »": "\"Deep House\" then \"Ambient House\"",
  "Les bases : Guidé, un geste à la fois": "The basics: Guided, one move at a time",
  "sors de la boucle de B (pad EXIT), avant le temps 64": "exit B's loop (EXIT pad), before beat 64",
  "B attend": "B is waiting",
  "hot cue 1 posé sur son drop": "hot cue 1 set on its drop",
  "sans table": "no controller",
  "sur ton téléphone": "on your phone",
  "avec ta table": "with your controller",
  "soit 4,17 € par mois": "that's €4.17 a month",
});

/* ---------- js/premiers.js (lot 80) ---------- */
enDe({
  "Oui, j'en ai une": "Yes, I have one",
  "Tu la brancheras sur ton ordinateur": "You'll plug it into your computer",
  "Pas encore": "Not yet",
  "Je commence au doigt, sur mon téléphone": "I'll start with my finger, on my phone",
  "Laquelle ?": "Which one?",
  "Super ! On la branchera sur ton ordinateur, je t'enverrai le lien.": "Great! We'll plug it into your computer, I'll send you the link.",
  "Pas de souci : on commence sur ton téléphone, au doigt.": "No problem: we'll start on your phone, with your finger.",
  "Voir mon plan": "See my plan",
  "Garder mon plan": "Keep my plan",
  "Commencer la leçon 1": "Start lesson 1",
  "Salut, moi c'est Vini ! Je vais t'apprendre à mixer. En une minute, je te fais ton plan.": "Hi, I'm Vini! I'm going to teach you how to mix. In one minute, I'll make your plan.",
  "Ton plan est prêt ! Le début est gratuit.": "Your plan is ready! The start is free.",
  "Ton plan est prêt !": "Your plan is ready!",
  "Crée ton compte gratuit pour garder ton plan. Je t'envoie aussi un lien pour l'ouvrir sur ton ordinateur.": "Create your free account to keep your plan. I'll also send you a link to open it on your computer.",
  "Crée ton compte gratuit pour garder ton plan et ta progression.": "Create your free account to keep your plan and your progress.",
  "pas encore faits": "not done yet",
  "passés sans répondre": "skipped without answering",
  "une table": "a controller",
  "(branchée, pas dans la liste)": "(plugged in, not in the list)",
  "(pas dans la liste)": "(not in the list)",
  "compte pas encore créé": "account not created yet",
  "Écoute les 4 premiers, puis tape sur chaque « boum » !": "Listen to the first 4, then tap on every \"boom\"!",
  "Ton oreille ! Touche le rond : je lance 4 « boum », puis tape en rythme sur les 8 suivants.": "Your ear! Touch the circle: I'll play 4 \"booms\", then tap in rhythm on the next 8.",
  "Tu as l'oreille, bravo ! Tu peux réessayer, ou continuer.": "You've got the ear, well done! You can try again, or keep going.",
  "Pas de souci : c'est exactement ce qu'on va travailler ensemble.": "No problem: that's exactly what we'll work on together.",
  "Taper sur le temps (ou la barre d'espace)": "Tap on the beat (or the space bar)",
  "Passer cette question": "Skip this question",
  "Le temps, la phrase, les basses : 7 leçons de 2 minutes, au doigt.": "The beat, the phrase, the bass: 7 two-minute lessons, with your finger.",
  "Les 7 gestes du DJ": "The DJ's 7 moves",
  "Lancer, fader, couper les basses, filtre, écho… en jouant.": "Starting a track, the fader, cutting the bass, filter, echo… all by playing.",
  "Ensuite": "Next",
  "Les mêmes gestes, sans compte à rebours.": "The same moves, without a countdown.",
  "Ta première vraie transition": "Your first real transition",
  "Propre, en rythme, sur de la vraie musique.": "Clean, on beat, on real music.",
  "Révise les bases": "Review the basics",
  "7 leçons de 2 minutes, au doigt : va vite si tu connais.": "7 two-minute lessons, with your finger: go fast if you know them.",
  "Le Mode Expert": "Expert Mode",
  "Les 7 gestes, notés à la milliseconde.": "The 7 moves, scored to the millisecond.",
  "Les combos et le calage": "Combos and beatmatching",
  "Plusieurs gestes d'affilée, et deux tempos à caler.": "Several moves in a row, and two tempos to match.",
  "Des transitions vraiment propres": "Really clean transitions",
  "Jusqu'à ton premier set, noté sur 100.": "All the way to your first set, scored out of 100.",
  "Plusieurs morceaux enchaînés, noté sur 100.": "Several tracks in a row, scored out of 100.",
  "Le calage à l'oreille": "Beatmatching by ear",
  "Sans BPM affiché, comme en club.": "No BPM on screen, like in a club.",
  "Un set à 100 sur 100": "A set at 100 out of 100",
  "Hot cues, boucles, et plus aucune aide.": "Hot cues, loops, and no more help.",
  "Tes 3 premiers gestes": "Your first 3 moves",
  "Lancer au bon moment, le fader, la coupure : ta première transition, avec ta table.": "Starting at the right time, the fader, the cut: your first transition, with your controller.",
  "Tes 3 premiers gestes, en Mode Expert": "Your first 3 moves, in Expert Mode",
  "Lancer, le fader, la coupure : sans aide, notés à la milliseconde.": "Starting, the fader, the cut: no help, scored to the millisecond.",
  "Le swap des basses, le calage, les hot cues, jusqu'au set noté sur 100.": "The bass swap, beatmatching, hot cues, all the way to the set scored out of 100.",
  "Les 4 autres gestes": "The other 4 moves",
  "L'écho, le filtre, le swap des basses, la transition complète.": "The echo, the filter, the bass swap, the full transition.",
  "Jusqu'au set noté sur 100": "All the way to the set scored out of 100",
  "Les vrais morceaux, le calage, les hot cues.": "Real tracks, beatmatching, hot cues.",
  "Plusieurs gestes d'affilée, deux tempos à caler, jusqu'au set.": "Several moves in a row, two tempos to match, all the way to the set.",
  "Le set et le calage": "The set and beatmatching",
  "Plusieurs morceaux enchaînés, sans BPM affiché, comme en club.": "Several tracks in a row, no BPM on screen, like in a club.",
  "À ton rythme": "At your own pace",
  "En moins de 2 semaines": "In less than 2 weeks",
  "Dans 2 semaines": "In 2 weeks",
  "Gratuit": "Free",
  "On part bien !": "Off to a good start!",
  "On va l'entraîner ensemble.": "We'll train it together.",
  "Écris ton prénom : c'est comme ça que je t'appellerai.": "Type your first name: that's what I'll call you.",
  "Tu as déjà un compte avec cette adresse. Je t'envoie un lien pour te connecter…": "You already have an account with this address. I'm sending you a sign-in link…",
  "Tu as déjà un compte avec cette adresse : je t'ai envoyé un lien pour te connecter (regarde aussi dans les spams). Ouvre-le sur ce téléphone, ou choisis « J'ai déjà un compte ».": "You already have an account with this address: I sent you a sign-in link (check your spam too). Open it on this phone, or choose \"I already have an account\".",
  "Tu as déjà un compte avec cette adresse, et je t'ai déjà envoyé 3 liens dans l'heure : regarde dans ta boîte de réception et dans tes spams.": "You already have an account with this address, and I've already sent you 3 links in the last hour: check your inbox and your spam.",
  "Tu as déjà un compte avec cette adresse : choisis « J'ai déjà un compte » juste en dessous.": "You already have an account with this address: choose \"I already have an account\" just below.",
  "Ton compte est créé : ton plan et ta progression sont gardés.": "Your account is created: your plan and your progress are saved.",
  "Le lien n'a pas pu partir": "The link couldn't be sent",
  "J'envoie ton lien pour l'ordinateur…": "Sending your link for the computer…",
  "Sur ton ordinateur, ouvre djingood.fr et choisis « J'ai déjà un compte », avec la même adresse : je t'enverrai un lien là-bas.": "On your computer, open djingood.fr and choose \"I already have an account\", with the same address: I'll send you a link there.",
  "Ils sont dans ta boîte de réception ou dans tes spams : ouvre le plus récent sur ton PC. Tu pourras en redemander un plus tard.": "They're in your inbox or your spam: open the most recent one on your computer. You can ask for another one later.",
  "Ta table, ce sera sur ordinateur. Ouvre ce mail sur ton PC : tu seras connecté tout de suite.": "Your controller is for the computer. Open this email on your computer: you'll be signed in right away.",
});

/* ---------- js/niveaux.js (lot 80) ---------- */
enDe({
  "Ici, B n'a que 16 temps d'intro. Sur la piste, B en pointillé montre où il tomberait si tu le lançais maintenant : lance-le quand le début de son drop s'aligne sur la fin de A.": "Here, B has only 16 beats of intro. On the track, the dotted B shows where it would land if you started it now: start it when the beginning of its drop lines up with the end of A.",
  "A a un break au milieu : la musique se vide, puis repart de plus belle. Repère sur la piste la vraie fin du morceau (le break n'en est pas une), puis lance B (32 temps d'intro) pour que son drop tombe quand A s'arrête.": "A has a break in the middle: the music empties out, then comes back even bigger. On the track, find where the song really ends (the break isn't the end), then start B (32 beats of intro) so its drop lands when A stops.",
  "Structure inconnue : lis la piste et lance B au bon moment.": "Unknown structure: read the track and start B at the right time.",
  "À chaque partie, l'outro de A et l'intro de B changent de longueur. Lis la piste de A pour trouver sa fin, regarde la longueur de l'intro de B, et lance B pour que son drop tombe quand A s'arrête.": "Every game, A's outro and B's intro change length. Read A's track to find where it ends, check how long B's intro is, and start B so its drop lands when A stops.",
  "Outro (mélodie)": "Outro (melody)",
  "Intro (mélodie)": "Intro (melody)",
  "Intros, breaks, mélodies": "Intros, breaks, melodies",
  "Découvrir": "Discover",
  "7 petites leçons pour entendre ce que fait un DJ. Juste ton doigt et le son. Gratuit.": "7 short lessons to hear what a DJ does. Just your finger and the sound. Free.",
  "Ta première transition est faite. Bravo !": "Your first transition is done. Well done!",
  "Chapitre 3 : plus de compte à rebours. Lis la piste : elle montre l'intro, le break et la fin de chaque morceau. La démo montre le bon moment.": "Chapter 3: no more countdown. Read the track: it shows the intro, the break and the end of each song. The demo shows the right moment.",
  "Lis la piste": "Read the track",
  "Lis la piste et agis au bon moment.": "Read the track and act at the right moment.",
  "Tu n'as pas lancé B : repère la fin de A sur la piste, puis lance B pour que son drop tombe dessus.": "You didn't start B: find the end of A on the track, then start B so its drop lands right on it.",
  "Tu t'es fait piéger par le break de A : la musique s'est vidée, mais ce n'était pas la fin. Sur la piste, on voyait que A repartait à fond après le break.": "A's break fooled you: the music emptied out, but it wasn't the end. On the track, you could see A coming back full blast after the break.",
  "Ta première transition !": "Your first transition!",
  "49,99 € par an": "€49.99 a year",
  "Plutôt au mois (4,99 €) ?": "Monthly instead (€4.99)?",
  "Plutôt à l'année (49,99 €, 2 mois offerts) ?": "Yearly instead (€49.99, 2 months free)?",
});

/* ---------- js/parcours.js (lot 80) ---------- */
enDe({
  "Ma musique": "My music",
  "Avec DJingood Pro": "With DJingood Pro",
  "Lire la structure des morceaux, éviter le piège du break, une seule mélodie à la fois : comme dans rekordbox.": "Reading track structure, avoiding the break trap, one melody at a time: just like in rekordbox.",
  "Avec ta musique : importe ta collection rekordbox, choisis un morceau, et prépare la transition avec un de ceux qui vont avec.": "With your music: import your rekordbox collection, pick a track, and prepare the transition with one that goes with it.",
  "Les 7 gestes, avec ta table : ouvre le lien sur ton ordinateur, tu seras déjà connecté.": "The 7 moves, with your controller: open the link on your computer, you'll already be signed in.",
  "Les 7 gestes, avec ta table : ouvre djingood.fr sur ton ordinateur.": "The 7 moves, with your controller: open djingood.fr on your computer.",
  "Tes gestes gratuits sont faits, bravo ! La suite t'attend dans DJingood Pro.": "Your free moves are done, well done! The rest is waiting for you in DJingood Pro.",
});

/* ---------- js/compte.js (lot 80) ---------- */
enDe({
  "Ta progression est revenue.": "Your progress is back.",
  "Ton compte est créé : ta progression est enregistrée.": "Your account is created: your progress is saved.",
  "Ta progression est enregistrée sur ton compte.": "Your progress is saved to your account.",
  "C'est noté !": "Got it!",
  "La progression de cet ordinateur est maintenant sur ton compte.": "This computer's progress is now on your account.",
  "Écris l'adresse de ton compte, comme toi@exemple.fr : je t'envoie un lien pour te connecter.": "Type your account's email address, like you@example.com: I'll send you a link to sign in.",
  "C'est envoyé ! Ouvre le lien sur cet appareil : tu seras connecté. Pas dans ta boîte de réception ? Regarde dans les spams, puis indique à ta messagerie que ce n'est pas un spam : sinon, le lien ne s'ouvre pas.": "Sent! Open the link on this device: you'll be signed in. Not in your inbox? Check your spam folder, then tell your email app it's not spam: otherwise, the link won't open.",
  "Ce lien a déjà servi ou il est trop vieux. Écris ton adresse, puis « Recevoir un lien de connexion » : je t'en envoie un nouveau.": "This link has already been used or is too old. Type your address, then \"Get a sign-in link\": I'll send you a new one.",
  "C'est envoyé ! Regarde dans ta boîte mail, et surtout dans les spams. Si le lien n'y est pas cliquable, dis à ta messagerie que ce n'est pas un spam : il s'activera.": "Sent! Check your inbox, and especially your spam folder. If the link isn't clickable there, tell your email app it's not spam: it will start working.",
  "Je t'ai déjà envoyé 3 liens dans l'heure : regarde dans ta boîte de réception et dans tes spams, il y est. Tu pourras en redemander un plus tard.": "I've already sent you 3 links in the last hour: check your inbox and your spam, it's there. You can ask for another one later.",
  "La connexion par e-mail n'est pas activée dans Firebase (Authentication → Sign-in method → E-mail/Mot de passe, et « Lien envoyé par e-mail »).": "Email sign-in isn't turned on in Firebase (Authentication → Sign-in method → Email/Password, and \"Email link\").",
  "Ce lien a déjà servi ou il est trop vieux. Demande-en un nouveau.": "This link has already been used or is too old. Ask for a new one.",
  "Content de te revoir !": "Good to see you again!",
  "Connexion par lien": "Sign in with a link",
  "ou avec ton e-mail": "or with your email",
  "Choisis un mot de passe": "Choose a password",
  "Déjà un compte ?": "Already have an account?",
  "Pas encore de compte ?": "Don't have an account yet?",
  "Créer un compte": "Create an account",
  "Tes étoiles et ta série te suivent sur tous tes appareils.": "Your stars and your streak follow you on all your devices.",
  "Écris l'adresse où tu as reçu le lien : c'est la sécurité de la connexion sans mot de passe.": "Type the address where you got the link: that's what keeps password-free sign-in secure.",
  "Toi": "You",
  "Ta progression est enregistrée au fur et à mesure.": "Your progress is saved as you go.",
  "DJingood enregistre ton prénom, ton adresse et ta progression. Ton adresse ne sert à t'écrire que si tu coches la case.": "DJingood saves your first name, your email address and your progress. Your address is only used to email you if you tick the box.",
  "Pour les mails de Vini, clique sur le lien qu'on vient de t'envoyer.": "For Vini's emails, click the link we just sent you.",
  "Quand tu veux": "Whenever you want",
  "Branche ta table en USB": "Plug in your controller over USB",
  "Reconnue": "Recognized",
  "Je la reconnaîtrai toute seule": "I'll recognize it on my own",
  "Ton premier niveau": "Your first level",
});

/* ---------- js/mails.js (lot 80) ---------- */
enDe({
  "3 mails pour bien démarrer, puis un par semaine au plus : des astuces et les nouveautés. Tu peux aussi arrêter depuis n'importe quel mail.": "3 emails to get off to a good start, then one a week at most: tips and what's new. You can also stop from any email.",
  "Presque fini : clique sur le lien que DJingood t'a envoyé par mail pour confirmer ton adresse. Pas reçu ? Coupe puis rallume ce bouton.": "Almost done: click the link DJingood emailed you to confirm your address. Didn't get it? Turn this switch off and on again.",
  "DJingood vient de t'envoyer un mail : clique sur le lien dedans pour confirmer ton adresse.": "DJingood just sent you an email: click the link inside to confirm your address.",
  "C'est noté : Vini t'écrira, un mail par semaine au plus.": "Got it: Vini will email you, one email a week at most.",
  "C'est noté : Vini ne t'écrira plus.": "Got it: Vini won't email you anymore.",
});

/* ---------- js/pro.js (lot 80) ---------- */
enDe({
  "Découvrir Pro": "Discover Pro",
  "Continuer avec Pro": "Continue with Pro",
  "Prendre mon mois offert": "Claim my free month",
  "4,99 € par mois": "€4.99 a month",
  "Aller à Ma musique": "Go to My music",
  "Sans engagement : tu arrêtes quand tu veux.": "No commitment: cancel anytime.",
  "Pour t'entraîner sans limite": "To practice without limits",
  "Pour mixer ta propre musique": "To mix your own music",
  "M'envoyer le lien pour l'ordi": "Send me the link for my computer",
  "Jouer le niveau 1 (gratuit)": "Play level 1 (free)",
  "Un instant : on prépare ton mois offert…": "One moment: we're setting up your free month…",
  "Un instant : on prépare ton essai gratuit…": "One moment: we're setting up your free trial…",
  "Un instant : on ouvre la page de paiement…": "One moment: opening the payment page…",
  "Tu es déjà Pro !": "You're already Pro!",
  "Ton essai gratuit a déjà servi : tu peux t'abonner tout de suite.": "You've already used your free trial: you can subscribe right away.",
  "Ton mois offert a déjà servi : tu peux t'abonner tout de suite.": "You've already used your free month: you can subscribe right away.",
  "Le mois offert est réservé aux comptes créés avant l'arrivée de Pro : tu peux t'abonner tout de suite.": "The free month is only for accounts created before Pro launched: you can subscribe right away.",
  "Le paiement n'est pas encore ouvert. Reviens bientôt !": "Payment isn't open yet. Come back soon!",
  "La page de paiement ne s'ouvre pas. Vérifie ta connexion, puis réessaie.": "The payment page won't open. Check your connection, then try again.",
  "Crée ton compte : ton mois offert et ta progression y seront gardés.": "Create your account: your free month and your progress will be kept there.",
  "Crée ton compte : il garde ton essai gratuit et ta progression, sur ton ordinateur comme sur ton téléphone.": "Create your account: it keeps your free trial and your progress, on your computer and on your phone.",
  "Crée ton compte : il garde ton abonnement, sur ton ordinateur comme sur ton téléphone.": "Create your account: it keeps your subscription, on your computer and on your phone.",
  "Le chapitre 3 s'ouvre avec 10 ★ au chapitre 2.": "Chapter 3 unlocks with 10 ★ in chapter 2.",
  "On va s'entraîner ?": "Shall we practice?",
  "On mixe ta musique ?": "Shall we mix your music?",
  "On reprend où tu en étais ?": "Pick up where you left off?",
  "Passer à Pro": "Go Pro",
  "Pour toi": "For you",
  "49,99 € pour l'année (soit 4,17 € par mois)": "€49.99 for the year (that's €4.17 a month)",
  "Ton premier mois est offert": "Your first month is free",
  "Sans carte bancaire : merci d'avoir été là avant Pro. Ensuite, 4,99 € par mois ou 49,99 € par an, seulement si tu continues.": "No credit card: thanks for being here before Pro. After that, €4.99 a month or €49.99 a year, only if you keep going.",
  "Continue avec DJingood Pro": "Keep going with DJingood Pro",
  "Formule": "Plan",
  "Au mois": "Monthly",
  "À l'année": "Yearly",
  "2 mois offerts": "2 months free",
  "Vini t'envoie un mail pour te prévenir.": "Vini emails you a reminder.",
  "Les tutos de Vini": "Vini's tutorials",
  "L'entraînement et Ma musique": "Practice and My music",
  "Essai gratuit": "Free trial",
  "Mois offert": "Free month",
  "4,99 € par mois, ou 49,99 € par an.": "€4.99 a month, or €49.99 a year.",
  "Gérer mon abonnement": "Manage my subscription",
  "La page de l'abonnement ne s'ouvre pas. Vérifie ta connexion, puis réessaie.": "The subscription page won't open. Check your connection, then try again.",
});

/* ---------- js/midi.js (lot 80) ---------- */
enDe({
  "Ici, pas de compte à rebours : écoute la musique (ou lis la piste) et fais chaque geste au bon moment.": "No countdown here: listen to the music (or read the track) and do each move at the right moment.",
});

/* ---------- js/table.js (lot 80) ---------- */
enDe({
  "(réglée pas à pas)": "(set up step by step)",
  "chapitre 3,": "chapter 3,",
  "chapitre 4,": "chapter 4,",
  "Utilisée dans :": "Used in:",
  "(d'origine)": "(default)",
  "(appris)": "(learned)",
});

/* ---------- js/sons.js (lot 80) ---------- */
enDe({
  "Son : coupé": "Sound: off",
  "Régler le son": "Adjust the sound",
  "Remettre le son": "Turn the sound back on",
  "Couper le son": "Mute the sound",
});

/* ---------- js/morceaux.js (lot 80) ---------- */
enDe({
  "calcul en arrière-plan indisponible": "background processing unavailable",
  "Ton navigateur bloque le calcul en arrière-plan : chaque lancement prendra quelques secondes.": "Your browser is blocking background processing: each start will take a few seconds.",
});

/* ---------- js/commandes.js (lot 80) ---------- */
enDe({
  "(posé ; clic droit pour l'effacer)": "(set; right-click to clear it)",
  "(vide : un clic le pose)": "(empty: one click sets it)",
});

/* ---------- js/entrainement.js (lot 80) ---------- */
enDe({
  "Défi réussi ! Reviens demain pour le suivant : ta série t'attend.": "Challenge complete! Come back tomorrow for the next one: your streak is waiting.",
  "Le défi du jour reprend tes niveaux gratuits, sur d'autres morceaux.": "The daily challenge replays your free levels, on other tracks.",
  "Joue d'abord un niveau gratuit dans <a href=\"#apprendre\">Apprendre</a> : le défi du jour le reprendra, sur d'autres morceaux.": "First play a free level in <a href=\"#apprendre\">Learn</a>: the daily challenge will replay it, on other tracks.",
  "Le reste de l'entraînement est dans DJingood Pro.": "The rest of practice is in DJingood Pro.",
});

/* ---------- js/comprendre.js (lot 80) ---------- */
enDe({
  "Envoi…": "Sending…",
  "Pas dans ta boîte de réception ? Regarde dans les spams, puis indique à ta messagerie que ce n'est pas un spam : sinon, le lien ne s'ouvre pas.": "Not in your inbox? Check your spam folder, then tell your email app it's not spam: otherwise, the link won't open.",
  "Déjà envoyé : regarde tes mails": "Already sent: check your email",
  "Pas parti : réessaie": "Not sent: try again",
});

/* ---------- js/quiz.js (lot 80) ---------- */
enDe({
  "À essayer": "To try",
  "Dans rekordbox, sur la forme d'onde, à quoi reconnaît-on le drop ?": "In rekordbox, on the waveform, how do you spot the drop?",
  "Bonne réponse": "Right answer",
  "bonne réponse": "right answer",
});

/* ---------- js/calage.js (lot 80) ---------- */
enDe({
  "Entendre le décalage": "Hear the drift",
  "Écoute A et B ensemble : calés, ou B en avance, ou B en retard ?": "Listen to A and B together: in sync, B ahead, or B behind?",
  "Cinq écoutes, sans toucher à la table. Calés, les deux grosses caisses tombent ensemble : un seul coup, net. B en avance : son coup arrive juste avant celui de A, on entend « ta-boum ». B en retard : c'est l'inverse, « boum-ta ». Réponds avec les trois boutons au-dessus de la table.": "Five listens, without touching the controller. In sync, the two kick drums land together: a single, clean hit. B ahead: its hit comes just before A's, you hear \"ta-boom\". B behind: it's the other way around, \"boom-ta\". Answer with the three buttons above the controller.",
  "Pousser, freiner": "Push, brake",
  "B part un peu à côté : rattrape-le à la molette, puis garde-le calé.": "B starts a little off: catch it with the jog wheel, then keep it in sync.",
  "B a le même tempo que A, mais il est parti un peu trop tôt ou trop tard. Tourne la molette de B : dans le sens des aiguilles d'une montre, tu le pousses ; dans l'autre sens, tu le freines. Le compteur au-dessus de la table dit de combien il est décalé : vise moins de 15 ms, et garde-le là jusqu'à la fin.": "B has the same tempo as A, but it started a little too early or too late. Turn B's jog wheel: clockwise, you push it; counterclockwise, you brake it. The counter above the controller tells you how far off it is: aim for less than 15 ms, and keep it there until the end.",
  "La bonne vitesse": "The right speed",
  "B va un peu plus vite que A : règle son tempo, puis cale-le.": "B is a little faster than A: set its tempo, then sync it up.",
  "B est à 126 BPM, A à 124 : même bien parti, il prend de l'avance petit à petit. Ramène-le à 124 avec le curseur TEMPO de B (vers le haut, il ralentit), puis rattrape le décalage à la molette.": "B is at 126 BPM, A at 124: even with a good start, it slowly drifts ahead. Bring it back to 124 with B's TEMPO slider (up slows it down), then catch the drift with the jog wheel.",
  "La vitesse à l'oreille": "Speed by ear",
  "Plus de BPM affiché : entends si B accélère ou ralentit, et corrige.": "No more BPM on screen: hear whether B is speeding up or slowing down, and correct it.",
  "B n'a pas le même tempo que A, mais cette fois aucun chiffre ne te dit lequel va le plus vite. Écoute : si le compteur grimpe vers « en avance », B est trop rapide ; s'il descend vers « en retard », il est trop lent. Corrige au TEMPO, puis à la molette.": "B doesn't have the same tempo as A, but this time no number tells you which one is faster. Listen: if the counter climbs toward \"ahead\", B is too fast; if it drops toward \"behind\", it's too slow. Correct with TEMPO, then with the jog wheel.",
  "Prépare B au casque sans que la salle l'entende, puis fais-le entrer sur la phrase.": "Prepare B in your headphones without the crowd hearing it, then bring it in on the phrase.",
  "B joue fader en bas : la salle n'entend que A. Allume CUE 🎧 de B pour l'écouter au casque, règle son tempo et cale-le. Au temps 64, monte son fader : il doit entrer déjà calé. Sans sortie casque sur ta table, B est joué tout bas dans les enceintes.": "B plays with its fader down: the crowd only hears A. Turn on B's CUE 🎧 to listen to it in your headphones, set its tempo and sync it up. At beat 64, bring up its fader: it should come in already in sync. If your controller has no headphone output, B plays very quietly through the speakers.",
  "Lancer et caler": "Start and sync",
  "Tout toi-même : lance B, règle sa vitesse, cale-le, puis échange les basses.": "All by yourself: start B, set its speed, sync it up, then swap the lows.",
  "B n'est pas lancé : appuie sur LANCE B (PLAY de droite) au début d'une mesure, vers le temps 32. Il part à l'instant exact, sans calage automatique. Règle son tempo (4 BPM d'écart), cale-le, puis au temps 64 échange les basses : LOW de A normal → coupé, LOW de B coupé → normal.": "B isn't playing: press START B (right PLAY) at the start of a bar, around beat 32. It starts at that exact moment, with no automatic sync. Set its tempo (4 BPM apart), sync it up, then at beat 64 swap the lows: A's LOW normal → cut, B's LOW cut → normal.",
  "Le final : ni BPM, ni compteur, ni repère. Lance, cale et échange les basses à l'oreille.": "The finale: no BPM, no counter, no marker. Start, sync and swap the lows by ear.",
  "Comme le niveau précédent, mais sans aucune aide à l'écran : ni BPM, ni compteur, ni repère sur la piste. Lance B vers le temps 32, cale-le au tempo et à la molette en écoutant, puis échange les basses au temps 64.": "Like the previous level, but with no help on screen at all: no BPM, no counter, no marker on the track. Start B around beat 32, sync it with the tempo and the jog wheel by listening, then swap the lows at beat 64.",
  "B est lancé : cale-le !": "B is playing: sync it up!",
  "Oui, calés !": "Yes, in sync!",
  "Lance B quand tu le sens.": "Start B when you feel it.",
  "Écoute, cale, et échange les basses au bon moment.": "Listen, sync, and swap the lows at the right moment.",
  "Lance B au début d'une mesure !": "Start B at the start of a bar!",
  "Calé : garde-le comme ça.": "In sync: keep it like that.",
  "B est en avance : freine-le.": "B is ahead: brake it.",
  "B est en retard : pousse-le.": "B is behind: push it.",
  "Le compteur s'allume quand B joue": "The counter lights up when B plays",
  "Calés : bien entendu.": "In sync: well heard.",
  "En avance : le coup de B arrive juste avant celui de A.": "Ahead: B's hit comes just before A's.",
  "En retard : le coup de B arrive juste après celui de A.": "Behind: B's hit comes just after A's.",
  "Calés : un seul coup, net.": "In sync: a single, clean hit.",
  "Règle d'abord son tempo, puis rattrape le décalage à la molette.": "Set its tempo first, then catch the drift with the jog wheel.",
  "Rattrape-le à la molette, par petites touches.": "Catch it with the jog wheel, in small nudges.",
  "B n'a jamais été calé 4 temps de suite.": "B was never in sync for 4 beats in a row.",
  "Le fader de B n'est jamais monté : B n'est pas entré.": "B's fader never went up: B never came in.",
});

/* ---------- js/combos.js (lot 80) ---------- */
enDe({
  "Filtre et swap": "Filter and swap",
  "Efface A au filtre, puis échange les basses pile sur la phrase.": "Fade A out with the filter, then swap the lows right on the phrase.",
  "B arrive tout seul, basses coupées. Quand « FILTRE » touche la ligne, tourne le CFX de A vers la droite, lentement : il doit être à fond au moment du swap. Au swap, dans le même geste : LOW de A normal → coupé, LOW de B coupé → normal.": "B comes in on its own, lows cut. When \"FILTER\" touches the line, turn A's CFX to the right, slowly: it should be all the way up at the swap. At the swap, in the same move: A's LOW normal → cut, B's LOW cut → normal.",
  "B arrive, basses coupées": "B comes in, lows cut",
  "Le filtre commence, lentement": "The filter starts, slowly",
  "Filtre à fond, swap des basses": "Filter all the way, bass swap",
  "B a pris toute la place": "B has taken over",
  "La transition éclair": "The lightning transition",
  "Toute la transition en 16 temps : lance, monte, échange, coupe.": "The whole transition in 16 beats: start, raise, swap, cut.",
  "Le LOW de B est déjà coupé (position de départ). Lance B sur la ligne : il démarre 16 temps avant son drop. Monte son fader en 8 temps, puis, au drop, fais le swap des basses et baisse A d'un coup.": "B's LOW is already cut (starting position). Start B on the line: it starts 16 beats before its drop. Bring up its fader over 8 beats, then, at the drop, do the bass swap and pull A down in one go.",
  "B part 16 temps avant son drop": "B starts 16 beats before its drop",
  "Swap et A coupé : drop de B !": "Swap and A cut: B's drop!",
  "Écho et drop, sans filet": "Echo and drop, no safety net",
  "Écho sur A, coupure, et B lancé sur son drop : sans compte à rebours.": "Echo on A, cut, and B started on its drop: no countdown.",
  "Pas de compte à rebours : compte les phrases dans ta tête. Sur le dernier temps de la phrase de A, active l'écho (ON de l'effet ou touche E). Sur le premier temps de la phrase suivante, coupe A et lance B, déjà calé sur son drop, dans le même geste.": "No countdown: count the phrases in your head. On the last beat of A's phrase, turn on the echo (the effect's ON button or the E key). On the first beat of the next phrase, cut A and start B, already cued on its drop, in the same move.",
  "Compte la fin de la phrase": "Count to the end of the phrase",
  "Écho sur le dernier temps": "Echo on the last beat",
  "A coupé, B lancé sur son drop": "A cut, B started on its drop",
  "B tombe dans l'écho": "B drops into the echo",
  "Le grand mix": "The big mix",
  "Une longue transition propre : B entre, swap, filtre, et A sort avant le drop.": "A long, clean transition: B comes in, swap, filter, and A goes out before the drop.",
  "Le LOW de B est déjà coupé (position de départ). Lance B sur la ligne et monte son fader. Au début de la phrase suivante, fais le swap des basses, puis efface A au filtre, lentement, jusqu'à « À FOND ». Baisse enfin le fader de A : il doit être à zéro au drop de B.": "B's LOW is already cut (starting position). Start B on the line and bring up its fader. At the start of the next phrase, do the bass swap, then fade A out with the filter, slowly, up to \"FULL\". Finally, pull down A's fader: it should be at zero at B's drop.",
  "Swap, et le filtre commence": "Swap, and the filter starts",
  "Filtre à fond": "Filter all the way",
  "A est sorti : drop de B !": "A is out: B's drop!",
  "Filtre trop brusque !": "Filter too sudden!",
  "Filtre à fond trop tard": "Filter full too late",
  "B à fond… un peu tard": "B full… a little late",
  "A sorti en retard": "A out late",
  "A joue encore au drop !": "A is still playing at the drop!",
  "Tu as tourné le filtre vers la gauche : pour effacer A, tourne vers la droite.": "You turned the filter to the left: to fade A out, turn it to the right.",
  "Le filtre n'a jamais été tourné.": "The filter was never turned.",
  "Filtre monté en douceur, et à fond à temps.": "Filter raised smoothly, and all the way up in time.",
  "A jouait encore au drop de B : baisse son fader avant.": "A was still playing at B's drop: pull its fader down before then.",
  "A n'a jamais été coupé : baisse son fader d'un coup au drop.": "A was never cut: pull its fader down in one go at the drop.",
  "A coupé pile au drop.": "A cut right at the drop.",
  "Coupure et lancement en même temps.": "Cut and start at the same time.",
});

/* ---------- js/hotcues.js (lot 80) ---------- */
enDe({
  "Sans filet": "No safety net",
  "Poser un repère": "Set a cue point",
  "Pose le hot cue 1 de B pile sur le premier temps de son drop.": "Set B's hot cue 1 right on the first beat of its drop.",
  "B joue la fin de son intro, A est baissé. Quand le drop de B arrive (le bloc « Drop » sur la piste), appuie sur le pad 1 de B, en mode HOT CUE : c'est ton repère. Quantize est allumé : le repère se range sur le temps le plus proche, mais ton appui est noté en millisecondes.": "B is playing the end of its intro, A is down. When B's drop arrives (the \"Drop\" block on the track), press B's pad 1, in HOT CUE mode: that's your cue point. Quantize is on: the cue point snaps to the nearest beat, but your press is scored in milliseconds.",
  "Écoute la fin de l'intro de B (A est baissé)": "Listen to the end of B's intro (A is down)",
  "Au premier temps du drop de B : pad 1 de B, en mode HOT CUE": "On the first beat of B's drop: B's pad 1, in HOT CUE mode",
  "B démarre : écoute la fin de son intro": "B starts: listen to the end of its intro",
  "Le drop de B approche": "B's drop is coming",
  "Pad 1 de B sur le drop : le repère est posé": "B's pad 1 on the drop: the cue point is set",
  "Ce repère servira à lancer B pile sur son drop": "This cue point will start B right on its drop",
  "Lancer depuis le repère": "Start from the cue point",
  "Sur la phrase de A, lance B depuis son hot cue et coupe A, au même instant.": "On A's phrase, start B from its hot cue and cut A, at the same instant.",
  "Le hot cue 1 de B est posé sur son drop, B attend. Au temps 64 (début de la phrase de A), appuie sur le pad 1 de B : il part directement sur son drop. Dans le même geste, baisse le fader de A d'un coup.": "B's hot cue 1 is set on its drop, B is waiting. At beat 64 (start of A's phrase), press B's pad 1: it starts straight on its drop. In the same move, pull A's fader down in one go.",
  "B attend, arrêté sur son hot cue 1 (son drop)": "B is waiting, stopped on its hot cue 1 (its drop)",
  "Au temps 64 : pad 1 de B, et fader de A en haut → en bas d'un coup, dans le même geste": "At beat 64: B's pad 1, and A's fader up → down in one go, in the same move",
  "B attend, arrêté sur son hot cue 1": "B is waiting, stopped on its hot cue 1",
  "Pad 1 de B et A coupé : B part directement sur son drop": "B's pad 1 and A cut: B starts straight on its drop",
  "Pas d'intro : la transition est nette": "No intro: the transition is clean",
  "B attend en boucle": "B waits in a loop",
  "B tourne sur une boucle de 4 temps : sors-en pour que son drop tombe sur la phrase de A.": "B is spinning on a 4-beat loop: exit it so its drop lands on A's phrase.",
  "B tourne sur la dernière mesure de son intro, juste avant son drop. Compte les mesures de A : sors de la boucle (pad 4 « EXIT » en mode BOUCLE) pendant la dernière mesure avant le temps 64. B finit sa mesure et tombe sur son drop pile au début de la phrase. Au temps 64, A se coupe tout seul.": "B is looping the last bar of its intro, just before its drop. Count A's bars: exit the loop (pad 4 \"EXIT\" in LOOP mode) during the last bar before beat 64. B finishes its bar and lands on its drop right at the start of the phrase. At beat 64, A cuts out on its own.",
  "B tourne sur une boucle de 4 temps (pads de B en mode BOUCLE)": "B is spinning on a 4-beat loop (B's pads in LOOP mode)",
  "Entre les temps 60 et 64 : pad EXIT de B, pour sortir de la boucle": "Between beats 60 and 64: B's EXIT pad, to exit the loop",
  "B finit sa mesure et tombe sur son drop au temps 64": "B finishes its bar and lands on its drop at beat 64",
  "B tourne sur la dernière mesure de son intro": "B is looping the last bar of its intro",
  "Compte les mesures de A": "Count A's bars",
  "Dernière mesure avant la phrase : on sort de la boucle": "Last bar before the phrase: exit the loop",
  "B finit sa mesure et tombe sur son drop": "B finishes its bar and lands on its drop",
  "A se coupe tout seul : ici, seul le drop de B compte": "A cuts out on its own: here, only B's drop counts",
  "Prolonger l'outro": "Extend the outro",
  "A s'arrête au temps 96, trop tôt pour B : boucle sa fin, puis coupe A sur le drop de B.": "A stops at beat 96, too early for B: loop its end, then cut A on B's drop.",
  "Le morceau A finit au temps 96, mais le drop de B n'arrive qu'au temps 104. Avant la fin de A, pose une boucle de 8 temps sur A (pad « 8 » en mode BOUCLE), au début d'une mesure, sans dépasser la fin : A tourne au lieu de s'arrêter. Au drop de B (temps 104), baisse le fader de A d'un coup.": "Track A ends at beat 96, but B's drop only arrives at beat 104. Before A ends, set an 8-beat loop on A (pad \"8\" in LOOP mode), at the start of a bar, without going past the end: A loops instead of stopping. At B's drop (beat 104), pull A's fader down in one go.",
  "Avant le temps 96 (fin de A), au début d'une mesure : pad 8 de A, en mode BOUCLE": "Before beat 96 (end of A), at the start of a bar: A's pad 8, in LOOP mode",
  "Au drop de B (temps 104) : fader de A en haut → en bas, d'un coup": "At B's drop (beat 104): A's fader up → down, in one go",
  "B démarre, mais son drop n'arrive qu'au temps 104": "B starts, but its drop only arrives at beat 104",
  "Boucle de 8 sur A, au début d'une mesure": "8-beat loop on A, at the start of a bar",
  "A aurait dû s'arrêter ici : il tourne en boucle": "A should have stopped here: it's looping",
  "Drop de B : A coupé d'un coup": "B's drop: A cut in one go",
  "Boucle A sur 16 temps, puis 8, puis 4, et coupe-le pile sur le drop de B. Quantize éteint.": "Loop A over 16 beats, then 8, then 4, and cut it right on B's drop. Quantize off.",
  "Quantize est éteint : la boucle part exactement quand tu appuies. Temps 64 : boucle de 16 sur A. Temps 80 : raccourcis à 8. Temps 96 : raccourcis à 4, la tension monte. Temps 112 : le drop de B arrive, baisse le fader de A d'un coup.": "Quantize is off: the loop starts exactly when you press. Beat 64: 16-beat loop on A. Beat 80: shorten it to 8. Beat 96: shorten it to 4, the tension builds. Beat 112: B's drop arrives, pull A's fader down in one go.",
  "Temps 64 : pad 16 de A (boucle de 16 temps)": "Beat 64: A's pad 16 (16-beat loop)",
  "Temps 80 : pad 8 de A (la boucle raccourcit)": "Beat 80: A's pad 8 (the loop gets shorter)",
  "Temps 96 : pad 4 de A": "Beat 96: A's pad 4",
  "Temps 112, drop de B : fader de A en haut → en bas, d'un coup": "Beat 112, B's drop: A's fader up → down, in one go",
  "Boucle de 16 sur A": "16-beat loop on A",
  "Raccourcie à 8 : ça s'accélère": "Shortened to 8: it speeds up",
  "Raccourcie à 4 : la tension monte": "Shortened to 4: the tension builds",
  "Drop de B : A coupé": "B's drop: A cut",
  "Le double drop": "The double drop",
  "Fais tomber le drop de B en même temps que celui de A, et échange les basses. Quantize éteint.": "Make B's drop land at the same time as A's, and swap the lows. Quantize off.",
  "A arrive sur son drop au temps 64. Le hot cue 1 de B est posé sur son propre drop. Au temps 64, appuie sur le pad 1 de B : les deux drops tombent ensemble. Dans le même geste, échange les basses : LOW de A normal → coupé, LOW de B coupé → normal.": "A reaches its drop at beat 64. B's hot cue 1 is set on its own drop. At beat 64, press B's pad 1: both drops land together. In the same move, swap the lows: A's LOW normal → cut, B's LOW cut → normal.",
  "Au temps 64, quand A arrive sur son drop : pad 1 de B (B part sur son drop)": "At beat 64, when A reaches its drop: B's pad 1 (B starts on its drop)",
  "Dans le même geste : LOW de A normal → coupé, LOW de B coupé → normal": "In the same move: A's LOW normal → cut, B's LOW cut → normal",
  "A arrive sur son drop au temps 64": "A reaches its drop at beat 64",
  "B part de son hot cue : deux drops ensemble": "B starts from its hot cue: two drops together",
  "Une seule basse à la fois : celle de B": "Only one bassline at a time: B's",
  "Le final, sans repère : boucle la fin de A, lance B depuis son hot cue sur la phrase et coupe A.": "The finale, no markers: loop the end of A, start B from its hot cue on the phrase and cut A.",
  "A s'arrête au temps 96. Avant la fin, boucle ses 8 derniers temps (pad 8 de A), puis, au début de la phrase suivante (temps 104), lance B depuis son hot cue (posé sur son drop) et coupe A dans le même geste. Quantize éteint, et aucun repère sur la piste.": "A stops at beat 96. Before the end, loop its last 8 beats (A's pad 8), then, at the start of the next phrase (beat 104), start B from its hot cue (set on its drop) and cut A in the same move. Quantize off, and no markers on the track.",
  "Avant le temps 96 (fin de A) : une boucle de 8 sur A, au début d'une mesure": "Before beat 96 (end of A): an 8-beat loop on A, at the start of a bar",
  "Au temps 104 : pad 1 de B, et fader de A en haut → en bas d'un coup, dans le même geste": "At beat 104: B's pad 1, and A's fader up → down in one go, in the same move",
  "Boucle de 8 sur A, avant sa fin": "8-beat loop on A, before it ends",
  "B lancé de son hot cue, A coupé": "B started from its hot cue, A cut",
  "Aucun repère : tout se fait à l'oreille": "No markers: it's all by ear",
  "Repère déjà posé. Pour le reposer : SHIFT + pad sur ta table (clic droit à l'écran), puis appuie de nouveau.": "Cue point already set. To set it again: SHIFT + pad on your controller (right-click on screen), then press again.",
  "Le drop de B tombe sur la phrase !": "B's drop lands on the phrase!",
  "Trop tard : B tourne encore dans sa boucle !": "Too late: B is still looping!",
  "Ta boucle dépassait la fin de A : silence !": "Your loop went past the end of A: silence!",
  "A est arrivé au bout : silence ! Il fallait boucler sa fin.": "A reached the end: silence! You needed to loop its end.",
  "pose le repère (pad 1 de B)": "set the cue point (B's pad 1)",
  "lance B (pad 1)": "start B (pad 1)",
  "coupe A": "cut A",
  "le drop de B arrive": "B's drop is coming",
  "boucle la fin de A (pad 8)": "loop the end of A (pad 8)",
  "boucle de 16 sur A": "16-beat loop on A",
  "boucle à 8": "loop to 8",
  "boucle à 4": "loop to 4",
  "échange les basses": "swap the lows",
  "Écoute, compte les mesures, et agis au bon moment.": "Listen, count the bars, and act at the right moment.",
  "Écoute B tourner, et compte les mesures de A.": "Listen to B loop, and count A's bars.",
  "Écoute, et prépare-toi.": "Listen, and get ready.",
  "FIN DE A": "END OF A",
  "A s'est arrêté : silence": "A stopped: silence",
  "Tu n'as pas posé de hot cue : appuie sur le pad 1 de B quand son drop arrive.": "You didn't set a hot cue: press B's pad 1 when its drop arrives.",
  "Le repère est sur le premier temps du drop.": "The cue point is on the first beat of the drop.",
  "B n'est jamais sorti de sa boucle : sors-en (EXIT) pendant la dernière mesure avant le temps 64.": "B never exited its loop: exit it (EXIT) during the last bar before beat 64.",
  "Le drop de B est tombé pile sur la phrase de A.": "B's drop landed right on A's phrase.",
  "Tu n'as pas bouclé A.": "You didn't loop A.",
});

/* ---------- js/set.js (lot 80) ---------- */
enDe({
  "Au casque": "In the headphones",
  "La montée": "The climb",
  "Velours": "Velvet",
  "Intro avec basse": "Intro with bass",
  "Intro courte": "Short intro",
  "Néon": "Neon",
  "Minuit": "Midnight",
  "Lumière": "Light",
  "Comète": "Comet",
  "Orbite": "Orbit",
  "Écume": "Foam",
  "Saphir": "Sapphire",
  "Nuage": "Cloud",
  "Opale": "Opal",
  "Zénith": "Zenith",
  "un swap des basses": "a bass swap",
  "un filtre": "a filter",
  "un écho": "an echo",
  "une coupure sèche": "a hard cut",
  "Coupe les basses du morceau qui sort (LOW à gauche) et ouvre celles du morceau qui entre, dans le même geste.": "Cut the lows of the outgoing track (LOW to the left) and open those of the incoming track, in the same move.",
  "Tourne le filtre du morceau qui sort vers la droite, lentement, avant de baisser son fader.": "Turn the outgoing track's filter to the right, slowly, before pulling down its fader.",
  "Allume l'écho sur le dernier temps du morceau qui sort, puis coupe son fader d'un coup.": "Turn on the echo on the last beat of the outgoing track, then cut its fader in one go.",
  "Baisse d'un coup le fader du morceau qui sort, au moment où l'autre arrive sur son drop.": "Pull the outgoing track's fader down in one go, just as the other one hits its drop.",
  "Premier enchaînement": "First mix",
  "Enchaîne trois morceaux sans jamais arrêter la musique.": "Mix three tracks in a row without ever stopping the music.",
  "Le premier morceau joue sur la platine A. Lance le suivant sur B (PLAY de droite) au début d'une phrase, quand une ligne PHRASE touche MAINTENANT. Cale-le à la molette, monte son fader, puis fais sortir le premier avant la fin de son outro. Le troisième se charge tout seul sur A : recommence. Les trois morceaux ont le même tempo.": "The first track plays on deck A. Start the next one on B (right PLAY) at the start of a phrase, when a PHRASE line touches NOW. Sync it with the jog wheel, bring up its fader, then take the first one out before the end of its outro. The third one loads by itself on A: do it again. All three tracks have the same tempo.",
  "Les tempos bougent": "The tempos move",
  "Trois morceaux qui n'ont pas le même tempo : règle chacun avant de le faire entrer.": "Three tracks with different tempos: set each one before bringing it in.",
  "Chaque morceau a son tempo, affiché sur sa platine. Avant de monter le fader du morceau qui entre, règle son TEMPO pour qu'il ait le même BPM que celui qui joue, puis cale-le à la molette.": "Each track has its own tempo, shown on its deck. Before bringing up the incoming track's fader, set its TEMPO so it has the same BPM as the one playing, then sync it with the jog wheel.",
  "Transitions imposées": "Set transitions",
  "Quatre morceaux, et une technique pour chaque transition : swap, filtre, puis écho.": "Four tracks, and one technique for each transition: swap, filter, then echo.",
  "La feuille de route donne la technique de chaque transition. Swap : coupe les basses du morceau qui sort et ouvre celles du morceau qui entre, dans le même geste. Filtre : tourne le filtre du morceau qui sort vers la droite, lentement, avant de baisser son fader. Écho : allume l'écho sur le dernier temps, puis coupe le morceau qui sort.": "The roadmap gives the technique for each transition. Swap: cut the lows of the outgoing track and open those of the incoming track, in the same move. Filter: turn the outgoing track's filter to the right, slowly, before pulling down its fader. Echo: turn on the echo on the last beat, then cut the outgoing track.",
  "Morceaux pièges": "Trick tracks",
  "Une intro courte, un break, une intro avec basse, puis de la techno : lis chaque morceau.": "A short intro, a break, an intro with bass, then some techno: read each track.",
  "Regarde la piste avant de lancer. « Intro courte » : 16 temps seulement. « Break » : la musique se vide au milieu, ce n'est pas la fin. « Intro avec basse » : coupe son LOW avant de le faire entrer. Le dernier morceau est de la techno, plus rapide. Plus de BPM affiché sur les platines.": "Look at the track view before starting. \"Short intro\": only 16 beats. \"Break\": the music empties out in the middle, it's not the end. \"Intro with bass\": cut its LOW before bringing it in. The last track is techno, faster. No more BPM on the decks.",
  "Prépare chaque morceau au casque avant de le faire entrer. Plus de compteur de décalage.": "Prepare each track in your headphones before bringing it in. No more drift counter.",
  "Lance le morceau suivant fader en bas et allume son CUE 🎧 : tu l'entends au casque, la salle ne l'entend pas. Cale-le à l'oreille (tempo, puis molette), puis monte son fader sur une phrase. Sans sortie casque sur ta table, il est joué tout bas dans les enceintes.": "Start the next track with its fader down and turn on its CUE 🎧: you hear it in your headphones, the crowd doesn't. Sync it by ear (tempo, then jog wheel), then bring up its fader on a phrase. If your controller has no headphone output, it plays very quietly through the speakers.",
  "Cinq morceaux de plus en plus rapides : fais monter la soirée de 120 à 128 BPM, en douceur.": "Five tracks, faster and faster: take the party from 120 to 128 BPM, smoothly.",
  "Chaque morceau est 2 BPM plus rapide que le précédent. Cale-le sur celui qui joue, puis, une fois seul, ramène-le petit à petit à son vrai tempo : la soirée monte toute seule. Le tempo ne doit jamais sauter d'un coup, et la soirée doit finir à 126 BPM ou plus.": "Each track is 2 BPM faster than the one before. Sync it to the one playing, then, once it's alone, bring it back little by little to its real tempo: the party rises on its own. The tempo must never jump all at once, and the party must end at 126 BPM or more.",
  "Le grand set": "The big set",
  "Le final : six morceaux surprise, de 120 à 130 BPM, sans aucune aide.": "The finale: six surprise tracks, from 120 to 130 BPM, with no help at all.",
  "Ni BPM, ni compteur de décalage, ni phrases dessinées, ni note en direct : la piste s'arrête à MAINTENANT. Les morceaux changent à chaque partie. Tout se fait à l'oreille : lancer sur la phrase, caler, échanger les basses, faire sortir. La note s'affiche à la fin.": "No BPM, no drift counter, no drawn phrases, no live score: the track view stops at NOW. The tracks change every game. It's all by ear: start on the phrase, sync, swap the lows, take tracks out. Your score shows at the end.",
  "de 120 à 130 BPM": "from 120 to 130 BPM",
  "tempos à trouver": "tempos to find",
  "Six morceaux surprise, de 120 à 130 BPM : ils changent à chaque partie.": "Six surprise tracks, from 120 to 130 BPM: they change every game.",
  "Tu pars de 100 points.": "You start with 100 points.",
  "Basses (25) : jamais deux basses en même temps plus de 2 temps.": "Bass (25): never two basslines at the same time for more than 2 beats.",
  "Volume (20) : pas de trou de son pendant une transition.": "Volume (20): no drop in sound during a transition.",
  "Phrase (20) : chaque morceau part au bon moment (son drop tombe pile à la fin du précédent), et les basses changent de morceau sur une phrase.": "Phrase (20): each track starts at the right moment (its drop lands right at the end of the previous one), and the bass changes tracks on a phrase.",
  "Les deux platines jouent chacune leur tour : le morceau suivant se charge tout seul sur la platine qui vient de se libérer.": "The two decks take turns: the next track loads by itself on the deck that just freed up.",
  "Les morceaux n'ont pas pu se préparer : réessaie.": "The tracks couldn't be prepared: try again.",
  "Démonstration : écoute comment les morceaux s'enchaînent.": "Demo: listen to how the tracks flow into each other.",
  "Astuce : la barre d'espace lance le morceau qui attend.": "Tip: the space bar starts the waiting track.",
  "Sans filet : à toi, à l'oreille.": "No safety net: your turn, by ear.",
  "Ta table est branchée : la table à l'écran est rangée.": "Your controller is plugged in: the on-screen controller is hidden.",
  "La table à l'écran est affichée.": "The on-screen controller is shown.",
  "Ranger la table": "Hide the controller",
  "Pas calés !": "Not in sync!",
  "Deux basses ensemble !": "Two basslines at once!",
  "La musique s'est arrêtée !": "The music stopped!",
  "Le son a baissé !": "The sound dropped!",
  "Basses pas sur la phrase": "Bass swap not on the phrase",
  "Le tempo a sauté !": "The tempo jumped!",
  "Pas écouté au casque": "Not checked in the headphones",
  "à la fin": "at the end",
  "Ensuite :": "Next:",
  "Coupe les basses du morceau qui entre (LOW à gauche) tant que l'autre a les siennes.": "Cut the lows of the incoming track (LOW to the left) while the other one still has its own.",
  "Monte le morceau qui entre avant de baisser celui qui sort.": "Bring up the incoming track before pulling down the outgoing one.",
  "Lance le morceau suivant avant la fin de celui qui joue : regarde où finit son outro sur la piste.": "Start the next track before the one playing ends: look where its outro ends on the track view.",
  "Lance le morceau suivant pour que son drop tombe pile à la fin de celui qui joue : regarde où il tomberait, en pointillé sur la piste. Attention aux intros courtes et aux breaks.": "Start the next track so its drop lands right at the end of the one playing: look where it would land, dotted on the track view. Watch out for short intros and breaks.",
  "Compte les mesures : lance le morceau suivant pour que son drop tombe pile à la fin de celui qui joue (une intro courte part plus tard).": "Count the bars: start the next track so its drop lands right at the end of the one playing (a short intro starts later).",
  "Échange les basses au début d'une phrase.": "Swap the lows at the start of a phrase.",
  "Allume CUE 🎧 du morceau qui entre, et cale-le avant de monter son fader.": "Turn on the incoming track's CUE 🎧, and sync it before bringing up its fader.",
  "Bouge le tempo petit à petit, sur plusieurs mesures.": "Move the tempo little by little, over several bars.",
  "Après chaque transition, ramène doucement le morceau à son vrai tempo : la soirée monte toute seule.": "After each transition, gently bring the track back to its real tempo: the party rises on its own.",
  "Lance le morceau suivant avant la fin de celui qui joue.": "Start the next track before the one playing ends.",
  "C'est ton premier record": "It's your first record",
  "Aucune erreur : la musique n'a jamais faibli.": "No mistakes: the music never faltered.",
});

/* ---------- js/rekordbox.js (lot 80) ---------- */
enDe({
  "Soirée samedi": "Saturday night",
  "Coups de cœur": "Favorites",
  "Nouveautés": "New arrivals",
  "Fais un swap des basses !": "Do a bass swap!",
  "Caler, puis swap des basses": "Sync, then bass swap",
  "Cale-les, puis échange les basses !": "Sync them, then swap the lows!",
  "Le filtre qui ouvre": "The opening filter",
  "Fais monter l'énergie avec le filtre !": "Build the energy with the filter!",
  "Fais un écho out !": "Do an echo out!",
  "tempos éloignés": "tempos far apart",
  "même tonalité": "same key",
  "tonalités voisines": "neighboring keys",
  "tonalités cousines": "related keys",
  "descente d'énergie": "energy drop",
  "tonalités qui frottent": "clashing keys",
  "Parfait": "Perfect",
  "Très bien": "Very good",
  "Bien": "Good",
  "Moyen": "Medium",
  "Difficile": "Hard",
  "Tout d'affilée, sans t'arrêter, du début à la fin. Recommence jusqu'à ce que ça sonne propre trois fois de suite.": "All in one go, without stopping, from start to finish. Do it again until it sounds clean three times in a row.",
  "à l'instant": "just now",
  "<span class=\"mm-l-va\">Ta fiche offerte ›</span>": "<span class=\"mm-l-va\">Your free card ›</span>",
  "<span class=\"mm-l-va\">Ce qui va avec ›</span>": "<span class=\"mm-l-va\">What goes with it ›</span>",
  "Retirer de tes favoris": "Remove from your favorites",
  "Ajouter à tes favoris": "Add to your favorites",
  "· <em>jamais joué</em>": "· <em>never played</em>",
  "<div class=\"mm-l-tete\" aria-hidden=\"true\"><span></span><span>Titre</span><span>Style</span><span>Tempo</span><span>Tonalité</span><span>Ajouté</span><span></span></div>": "<div class=\"mm-l-tete\" aria-hidden=\"true\"><span></span><span>Title</span><span>Style</span><span>Tempo</span><span>Key</span><span>Added</span><span></span></div>",
  "<p class=\"mm-vide\">Aucun morceau ne correspond. <button type=\"button\" class=\"linkbtn\" data-mm=\"effacer\">Effacer les filtres</button></p>": "<p class=\"mm-vide\">No track matches. <button type=\"button\" class=\"linkbtn\" data-mm=\"effacer\">Clear the filters</button></p>",
  "Ajoutés depuis moins d'un mois": "Added less than a month ago",
  "Jamais joués": "Never played",
  "Mes favoris": "My favorites",
  "Ajoutés récemment": "Recently added",
  "Titre": "Title",
  "Les plus joués": "Most played",
  "C'est la collection d'exemple : ouvre les fiches que tu veux. Avec ta vraie collection, la fiche d'un morceau est offerte.": "This is the sample collection: open any cards you want. With your real collection, one track's card is free.",
  "Ta fiche offerte t'a plu ? Avec Pro, je fais pareil pour tous tes morceaux.": "Did you like your free card? With Pro, I do the same for all your tracks.",
  "Choisis le morceau que tu préfères : sa fiche est offerte.": "Pick your favorite track: its card is free.",
  "Aucun morceau ne correspond : enlève un filtre.": "No track matches: remove a filter.",
  "Choisis un morceau que tu aimes : je te montre ceux qui vont avec.": "Pick a track you love: I'll show you the ones that go with it.",
  "différent": "different",
  "Retirer cette paire de tes favoris": "Remove this pair from your favorites",
  "Garder cette paire": "Keep this pair",
  "Jamais joué": "Never played",
  "<p class=\"mm-vide\">rekordbox n'a pas encore analysé ce morceau : il me manque son tempo ou sa tonalité. Analyse-le dans rekordbox, puis réexporte ta collection.</p>": "<p class=\"mm-vide\">rekordbox hasn't analyzed this track yet: I'm missing its tempo or its key. Analyze it in rekordbox, then export your collection again.</p>",
  "<p class=\"mm-vide\">Aucun morceau de ta collection ne va vraiment avec celui-là (tempo trop loin, ou tonalité qui frotte). Essaie avec un autre.</p>": "<p class=\"mm-vide\">No track in your collection really goes with this one (tempo too far, or clashing key). Try another one.</p>",
  "Toutes": "All",
  "Garder": "Keep",
  "Monter": "Build up",
  "Calmer": "Calm down",
  "Même style": "Same style",
  "<p class=\"mm-vide\">Aucun morceau avec ces réglages.</p>": "<p class=\"mm-vide\">No track with these settings.</p>",
  "Voir l'autre": "See the other one",
  "Ce morceau n'est pas encore analysé par rekordbox.": "This track hasn't been analyzed by rekordbox yet.",
  "Le premier, c'est un sans-faute.": "The first one is flawless.",
  "Il me manque des infos sur ces morceaux.": "I'm missing some info about these tracks.",
  "Paire gardée": "Pair kept",
  "<span class=\"mm-st off\">Pas commencée</span>": "<span class=\"mm-st off\">Not started</span>",
  "<p class=\"mm-vide\">Pas encore de paire gardée : touche ♥ sur une paire qui te plaît.</p>": "<p class=\"mm-vide\">No pair kept yet: tap ♥ on a pair you like.</p>",
  "<p class=\"mm-vide\">Pas encore de morceau aimé : touche ♥ dans la liste de tes morceaux.</p>": "<p class=\"mm-vide\">No liked track yet: tap ♥ in your track list.</p>",
  "Touche ♥ sur un morceau ou une paire : je les garde ici.": "Tap ♥ on a track or a pair: I'll keep them here.",
  "Tes paires gardées et tes morceaux aimés.": "Your kept pairs and your liked tracks.",
  "<p class=\"mm-vide\">Rien pour l'instant : ouvre la fiche d'un morceau.</p>": "<p class=\"mm-vide\">Nothing yet: open a track's card.</p>",
  "Tout ce que tu as regardé, du plus récent au plus ancien. Clique pour y revenir.": "Everything you've looked at, from newest to oldest. Click to go back to it.",
  "Rien pour l'instant : ouvre la fiche d'un morceau.": "Nothing yet: open a track's card.",
  "Montre-moi ta collection rekordbox : je te trouve les morceaux qui vont ensemble.": "Show me your rekordbox collection: I'll find the tracks that go together.",
  "C'est la collection d'exemple.": "This is the sample collection.",
  "Ouvre les fiches que tu veux. Avec ta vraie collection, la fiche d'un morceau est offerte ; pour toutes les autres, les favoris et les missions, c'est DJingood Pro.": "Open any cards you want. With your real collection, one track's card is free; for all the others, favorites and missions, it's DJingood Pro.",
  "Ta première fiche est offerte.": "Your first card is free.",
  "Choisis le morceau que tu préfères : je te montre ceux qui vont avec, et la technique pour chaque transition.": "Pick your favorite track: I'll show you the ones that go with it, and the technique for each transition.",
  "Tu as déjà vu ta fiche offerte.": "You've already seen your free card.",
  "Avec DJingood Pro : ce qui va avec pour tous tes morceaux, la technique pour chaque transition, tes favoris et les missions.": "With DJingood Pro: what goes with it for all your tracks, the technique for each transition, your favorites and the missions.",
  "Ta propre musique, c'est dans DJingood Pro : choisis un morceau, je te trouve ceux qui vont avec.": "Your own music is in DJingood Pro: pick a track, I'll find the ones that go with it.",
});

/* ---------- js/verif.js (lot 80) ---------- */
enDe({
  "Potard CFX (filtre) de A": "A's CFX knob (filter)",
  "PLAY de la platine gauche": "PLAY on the left deck",
  "PLAY de la platine droite": "PLAY on the right deck",
  "ON de l'effet": "The effect's ON",
  "Ta table est-elle reconnue ?": "Is your controller recognized?",
  "Branche ta table en USB, rekordbox fermé. Le site doit la reconnaître tout seul.": "Plug in your controller over USB, with rekordbox closed. The site should recognize it on its own.",
  "Monte le fader de A jusqu'en haut, puis descends-le jusqu'en bas. Pareil pour celui de B.": "Push A's fader all the way up, then all the way down. Same for B's.",
  "Les potards LOW": "The LOW knobs",
  "Tourne le LOW de A tout à gauche, puis tout à droite. Pareil pour celui de B.": "Turn A's LOW all the way left, then all the way right. Same for B's.",
  "Le MID et le filtre": "The MID and the filter",
  "Tourne le MID de A d'un bout à l'autre, puis le potard CFX de A (le filtre, sous les effets).": "Turn A's MID from one end to the other, then A's CFX knob (the filter, below the effects).",
  "Les boutons": "The buttons",
  "Appuie sur PLAY de la platine gauche, puis sur PLAY de la platine droite, puis sur ON de l'effet.": "Press PLAY on the left deck, then PLAY on the right deck, then the effect's ON.",
  "Le crossfader": "The crossfader",
  "Bouge le crossfader (le fader horizontal, en bas au milieu) d'un bout à l'autre.": "Move the crossfader (the horizontal fader, at the bottom in the middle) from one end to the other.",
  "Le potard HI de A": "A's HI knob",
  "Tourne le potard HI de la platine gauche (le plus haut des trois potards d'égaliseur).": "Turn the HI knob of the left deck (the highest of the three EQ knobs).",
  "Le potard HI de B": "B's HI knob",
  "Tourne le potard HI de la platine droite.": "Turn the HI knob of the right deck.",
  "Le potard TRIM de A": "A's TRIM knob",
  "Tourne le potard TRIM de la platine gauche (tout en haut, au-dessus du HI).": "Turn the TRIM knob of the left deck (at the very top, above HI).",
  "Le tempo de A": "A's tempo",
  "Bouge le fader TEMPO de la platine gauche (le fader vertical, sur le côté de la molette).": "Move the TEMPO fader of the left deck (the vertical fader, beside the jog wheel).",
  "La molette de A": "A's jog wheel",
  "Tourne la grande molette de la platine gauche par le bord, sans appuyer dessus.": "Turn the big jog wheel of the left deck by its edge, without pressing on it.",
  "Le bouton CUE de A": "A's CUE button",
  "Appuie deux fois sur CUE de la platine gauche (juste au-dessus de PLAY).": "Press CUE on the left deck twice (just above PLAY).",
  "Le pad 1 de A": "A's pad 1",
  "Appuie sur HOT CUE au-dessus des pads de gauche, puis deux fois sur le premier pad (en haut à gauche).": "Press HOT CUE above the left pads, then press the first pad twice (top left).",
  "BEAT SYNC de A": "A's BEAT SYNC",
  "Appuie deux fois sur BEAT SYNC de la platine gauche.": "Press BEAT SYNC on the left deck twice.",
  "Débrancher, rebrancher": "Unplug, plug back in",
  "Débranche le câble USB de la table, attends deux secondes, puis rebranche-le.": "Unplug the controller's USB cable, wait two seconds, then plug it back in.",
  "Le dessin de la table": "The controller drawing",
  "Compare ce dessin à ta vraie table : chaque commande est-elle au bon endroit, avec le bon nom ?": "Compare this drawing to your real controller: is each control in the right place, with the right name?",
  "Oui, tout est bon": "Yes, it's all good",
  "Non, il y a une erreur": "No, there's a mistake",
  "Le son dans le casque": "Sound in the headphones",
  "Branche un casque sur la table, puis appuie sur « Écouter » : tu dois entendre quelques secondes de musique.": "Plug headphones into the controller, then press \"Listen\": you should hear a few seconds of music.",
  "Oui, j'entends bien": "Yes, I can hear it",
  "Non, rien dans le casque": "No, nothing in the headphones",
  "Le Mode Expert, au casque": "Expert Mode, with headphones",
  "Joue 5 fois le niveau 1 « Le bon moment » en Mode Expert, au casque de la table, en appuyant sur PLAY bien en rythme. Tes scores tournent autour de :": "Play level 1 \"The right moment\" 5 times in Expert Mode, with headphones on the controller, pressing PLAY right on the beat. Your scores are around:",
  "Plus de 80": "Over 80",
  "Entre 60 et 80": "Between 60 and 80",
  "Moins de 60": "Under 60",
  "Le site dit le plus souvent :": "The site most often says:",
  "Ça varie": "It varies",
  "La vraie musique": "Real music",
  "Joue le niveau du bouton ci-dessous avec la vraie musique, au casque. Quand A et B jouent ensemble, les grosses caisses tombent-elles en même temps ?": "Play the level from the button below with real music, with headphones. When A and B play together, do the kick drums land at the same time?",
  "Oui, c'est calé": "Yes, it's in sync",
  "Non, ça « galope »": "No, it \"gallops\"",
  "Et les deux morceaux ensemble :": "And the two tracks together:",
  "Sonnent bien": "Sound good",
  "Sonnent faux": "Sound off",
  "Les petits sons du jeu": "The little game sounds",
  "Pendant ces parties, les petits sons du jeu (réussi, raté, étoiles) étaient :": "During these games, the little game sounds (success, miss, stars) were:",
  "Bien dosés": "Just right",
  "Trop forts": "Too loud",
  "Gênants en Mode Expert": "Distracting in Expert Mode",
  "Vérification terminée": "Check complete",
  "Une table est branchée": "A controller is plugged in",
  "Elle est réglée et prête à jouer": "It's set up and ready to play",
  "C'est une DDJ-FLX4, prête à jouer sans réglage": "It's a DDJ-FLX4, ready to play with no setup",
  "Table débranchée": "Controller unplugged",
  "Table rebranchée et reconnue": "Controller plugged back in and recognized",
  "(pas encore réglé : bouge-le, le site l'apprend)": "(not set up yet: move it, the site learns it)",
  "Fait :": "Done:",
  "En attente :": "Waiting:",
  "Branche ta table pour faire cette étape.": "Plug in your controller to do this step.",
  "J'écoute ta table…": "Listening to your controller…",
  "Tout répond ✓": "Everything responds ✓",
  "Aucune table vue pour l'instant.": "No controller seen yet.",
  "Aller jouer le niveau 1 en Mode Expert": "Go play level 1 in Expert Mode",
  "Rapport copié ! Colle-le dans un message.": "Report copied! Paste it into a message.",
  "Revoir ma vérification de la table": "See my controller check again",
  "Elle reprend là où tu t'étais arrêté.": "It picks up where you left off.",
});

/* ---------- js/reglage.js (lot 80) ---------- */
enDe({
  "le fader de volume de gauche": "the left volume fader",
  "Monte puis descends le fader de volume de la platine A : le curseur vertical à gauche du centre.": "Move deck A's volume fader up and down: the vertical slider left of center.",
  "le fader de volume de droite": "the right volume fader",
  "Monte puis descends le fader de volume de la platine B : le curseur vertical à droite du centre.": "Move deck B's volume fader up and down: the vertical slider right of center.",
  "le potard LOW de gauche": "the left LOW knob",
  "Tourne le potard des basses de la platine A. Il s'appelle LOW (ou BASS) : c'est le plus bas des potards de son, juste au-dessus du fader.": "Turn deck A's bass knob. It's called LOW (or BASS): it's the lowest of the sound knobs, just above the fader.",
  "le potard LOW de droite": "the right LOW knob",
  "Tourne le potard des basses de la platine B.": "Turn deck B's bass knob.",
  "le potard MID de gauche": "the left MID knob",
  "Tourne le potard MID de la platine A, juste au-dessus du LOW.": "Turn deck A's MID knob, just above the LOW.",
  "le filtre de gauche": "the left filter",
  "Tourne le filtre de la platine A. Selon les tables, il s'appelle CFX, FILTER ou COLOR.": "Turn deck A's filter. Depending on the controller, it's called CFX, FILTER or COLOR.",
  "le bouton PLAY de droite": "the right PLAY button",
  "Appuie sur le bouton PLAY de la platine B (souvent marqué ▶).": "Press deck B's PLAY button (often marked ▶).",
  "le bouton de l'effet": "the effect button",
  "Appuie sur le bouton qui allume les effets : ON, FX ON ou BEAT FX selon les tables. Pas de bouton d'effet ? À l'écran, le bouton ECHO ou la touche E font pareil.": "Press the button that turns on the effects: ON, FX ON or BEAT FX depending on the controller. No effect button? On screen, the ECHO button or the E key do the same.",
  "pas reconnu": "not recognized",
  "rien reçu": "nothing received",
  "Relevé copié ! Colle-le dans un message (Ctrl + V) et envoie-le-nous.": "Report copied! Paste it into a message (Ctrl + V) and send it to us.",
  "Ta table est prête": "Your controller is ready",
  "Rien n'a été reconnu": "Nothing was recognized",
  "Voici ce que le site a reconnu. Ce qui manque se fera à l'écran, à la souris. Tu pourras tout refaire depuis « Ma table ».": "Here's what the site recognized. Whatever's missing will be done on screen, with the mouse. You can redo everything from \"My controller\".",
  "Vérifie que ta table est bien branchée, puis recommence. Tu peux aussi jouer à la souris.": "Check that your controller is plugged in properly, then start again. You can also play with the mouse.",
  "Quelque chose cloche ? « Copier le relevé », et envoie-le-nous : on verra ce que ta table envoie.": "Something wrong? \"Copy the report\", and send it to us: we'll see what your controller sends.",
  "à l'écran": "on screen",
  "Ta table est débranchée : rebranche-la pour continuer.": "Your controller is unplugged: plug it back in to continue.",
  "Reconnu !": "Recognized!",
  "J'attends que tu appuies dessus sur ta table…": "Waiting for you to press it on your controller…",
  "J'attends que tu le bouges sur ta table…": "Waiting for you to move it on your controller…",
  "Ta table est réglée : bouge une commande pour la voir réagir.": "Your controller is set up: move a control to see it react.",
  "Tu as branché une DDJ-FLX4, mais les réglages sont ceux de ton autre table. On reprend ceux de la FLX4 ?": "You plugged in a DDJ-FLX4, but the settings are your other controller's. Shall we switch back to the FLX4's?",
  "Ceux de ta table réglée à la main seront remplacés.": "The settings of your hand-tuned controller will be replaced.",
  "Reprendre les réglages de la FLX4": "Switch back to the FLX4 settings",
  "Prendre ses réglages": "Use its settings",
});

/* ---------- presentation.html (lot 80) ---------- */
enDe({
  "<b>3 exercices gratuits</b> · puis 4,99 € par mois, sans engagement · rien à installer": "<b>3 free exercises</b> · then €4.99 a month, no commitment · nothing to install",
  "Presque rien : pas de publicité, pas de cookie. Le site compte ses visites sans cookie, sans jamais garder ton prénom ni ton adresse dans ses statistiques, et ton avis ne part que si tu l'envoies. Tout est expliqué dans <a href=\"confidentialite.html\">Ce que DJingood garde sur toi</a>.": "Almost nothing: no ads, no cookies. The site counts its visits without cookies, without ever keeping your first name or your email address in its statistics, and your feedback is only sent if you send it. It's all explained in <a href=\"confidentialite.html\">What DJingood keeps about you</a>.",
  "Gratuit pour apprendre": "Free to learn",
  "rien à installer": "nothing to install",
  "compte facultatif": "account optional",
  "3 exercices gratuits": "3 free exercises",
  "· puis 4,99 € par mois, sans engagement": "· then €4.99 a month, no commitment",
  "Mixer ta musique": "Mix your music",
  "Importe ta collection rekordbox : pour chaque morceau, le site te montre ceux qui vont bien après, la technique pour faire la transition, et des missions à faire dans rekordbox.": "Import your rekordbox collection: for each track, the site shows you the ones that go well next, the technique for the transition, and missions to do in rekordbox.",
  "La fiche d'un morceau : les morceaux de la collection qui vont avec, et la technique pour chaque transition": "A track's card: the tracks in your collection that go with it, and the technique for each transition",
  "Le prix": "Pricing",
  "Combien ça coûte ?": "How much does it cost?",
  "Pour commencer : gratuit": "To start: free",
  "Les 7 leçons « Comprendre », sans table. Tes 3 premiers exercices avec ta table. Le défi du jour et un tuto. Dans « Ma musique », l'import de ta collection et la fiche d'un de tes morceaux.": "The 7 \"Understand\" lessons, no controller needed. Your first 3 exercises with your controller. The daily challenge and a tutorial. In \"My music\", importing your collection and the card for one of your tracks.",
  "DJingood Pro : 4,99 € par mois": "DJingood Pro: €4.99 a month",
  "Ou 49,99 € par an, sans engagement. Les 7 chapitres, tous les tutos de Vini, l'entraînement et Ma musique.": "Or €49.99 a year, no commitment. All 7 chapters, all of Vini's tutorials, practice and My music.",
  "Oui : les leçons, l'entraînement et Comprendre sont gratuits.": "Yes: the lessons, practice and Understand are free.",
  "Pour commencer, oui : les 7 leçons « Comprendre », tes 3 premiers exercices avec ta table, le défi du jour, un tuto, et dans « Ma musique » l'import de ta collection et la fiche d'un de tes morceaux sont gratuits. La suite (les 7 chapitres, tous les tutos, l'entraînement, le reste de Ma musique) est dans DJingood Pro, à 4,99 € par mois ou 49,99 € par an, sans engagement : tu arrêtes en deux clics.": "To start, yes: the 7 \"Understand\" lessons, your first 3 exercises with your controller, the daily challenge, a tutorial, and in \"My music\" importing your collection and the card for one of your tracks are free. The rest (all 7 chapters, all the tutorials, practice, the rest of My music) is in DJingood Pro, at €4.99 a month or €49.99 a year, no commitment: you cancel in two clicks.",
  "Les niveaux se jouent sur de vrais morceaux de house libres de droits, choisis sur Pixabay. Tu peux aussi choisir des morceaux fabriqués par le site, en house, techno ou afro. Ensuite, l'onglet « Ma musique » te fait travailler avec ta propre musique : pour chaque morceau de ta collection rekordbox, ceux qui vont avec et la technique pour faire la transition.": "The levels are played on real royalty-free house tracks, picked on Pixabay. You can also choose tracks made by the site, in house, techno or afro. Then, the \"My music\" tab has you work with your own music: for each track in your rekordbox collection, the ones that go with it and the technique for the transition.",
  "Le site reconnaît tout seul une quinzaine de tables de débutant (Pioneer DDJ-FLX4, DDJ-400, DDJ-SB3, DDJ-200 et XDJ-RR, Hercules Inpulse 200, 300 et 500 et Starlight, Numark Mixtrack Platinum FX et Pro FX, Party Mix et DJ2GO2 Touch, Roland DJ-505, Reloop Mixage). Si tu branches une table qu'il ne connaît pas encore, il te propose de la régler pas à pas : il te montre chaque commande, tu la bouges, il la reconnaît. Une commande que ta table n'a pas se fait à la souris. Les réglages de ces tables viennent de leur documentation : dis-nous si quelque chose ne marche pas avec la tienne.": "The site recognizes about fifteen beginner controllers on its own (Pioneer DDJ-FLX4, DDJ-400, DDJ-SB3, DDJ-200 and XDJ-RR, Hercules Inpulse 200, 300 and 500 and Starlight, Numark Mixtrack Platinum FX and Pro FX, Party Mix and DJ2GO2 Touch, Roland DJ-505, Reloop Mixage). If you plug in a controller it doesn't know yet, it offers to set it up step by step: it shows you each control, you move it, it recognizes it. A control your controller doesn't have is done with the mouse. The settings for these controllers come from their documentation: let us know if something doesn't work with yours.",
  "Presque rien : pas de publicité, pas de cookie. Le site compte ses visites sans cookie, sans jamais garder ton prénom ni ton adresse dans ses statistiques, et ton avis ne part que si tu l'envoies. Tout est expliqué dans": "Almost nothing: no ads, no cookies. The site counts its visits without cookies, without ever keeping your first name or your email address in its statistics, and your feedback is only sent if you send it. It's all explained in",
});

/* ---------- js/tutos.js (lot 80) ---------- */
enDe({
  "Quand l'utiliser": "When to use it",
  "Pas à pas": "Step by step",
  "Les erreurs": "Mistakes",
  "break de A": "A's break",
  "dernière phrase de A": "A's last phrase",
  "fin de A": "end of A",
  "« Deep House » (alexrockbeat) et « Deep House Instrumental » (arnaud136), sur Pixabay": "\"Deep House\" (alexrockbeat) and \"Deep House Instrumental\" (arnaud136), on Pixabay",
  "« Luxury Life » et « Fashion Diva House » (kulakovka), sur Pixabay": "\"Luxury Life\" and \"Fashion Diva House\" (kulakovka), on Pixabay",
  "« Luxury Life » (kulakovka) et « House - July » (Easy_Eva), sur Pixabay": "\"Luxury Life\" (kulakovka) and \"House - July\" (Easy_Eva), on Pixabay",
  "Écoute d'abord la transition en entier. Je t'explique juste après.": "First, listen to the whole transition. I'll explain right after.",
  "ÉCHO": "ECHO",
  "RÉVERBE": "REVERB",
  "FILTRE se ferme": "FILTER closes",
  "FILTRE s'ouvre": "FILTER opens",
  "La boucle qui attend": "The waiting loop",
  "B patiente en boucle juste avant son drop, puis part pile quand A se termine.": "B waits in a loop just before its drop, then takes off right when A ends.",
  "↑ 2 temps de drop s'échappent": "↑ 2 beats of the drop slip out",
  "↑ la boucle déborde : B prend du retard": "↑ the loop spills over: B falls behind",
  "Écoute… et suis le trait blanc sur la piste : c'est là où on en est.": "Listen… and follow the white line on the track: that's where we are.",
  "Tu as entendu ? B tournait en rond sous A, et son drop est parti pile quand A s'est arrêté. C'est ça, la boucle qui attend.": "Did you hear it? B was going round in circles under A, and its drop took off right when A stopped. That's the waiting loop.",
  "La boucle, c'est la salle d'attente de B : il tourne en rond juste avant son drop, et c'est toi qui choisis quand il part.": "The loop is B's waiting room: it goes round in circles just before its drop, and you decide when it goes.",
  "Elle te sauve quand B arrive trop vite à son drop, ou quand A dure plus longtemps que prévu.": "It saves you when B gets to its drop too fast, or when A lasts longer than planned.",
  "Le secret, c'est 32 temps : une phrase entière. Quand B sort de sa boucle, il retombe pile sur une phrase de A.": "The secret is 32 beats: a whole phrase. When B leaves its loop, it lands right on one of A's phrases.",
  "1 phrase = 32 temps = 8 mesures de 4 temps": "1 phrase = 32 beats = 8 bars of 4 beats",
  "Lance B au casque, pile sur le premier temps d'une phrase de A.": "Start B in your headphones, right on the first beat of one of A's phrases.",
  "Compte 32 temps. Au début de la phrase suivante, appuie sur IN.": "Count 32 beats. At the start of the next phrase, press IN.",
  "Encore 32 temps. Juste avant le drop de B, appuie sur OUT : B repart en arrière, il tourne en boucle.": "Another 32 beats. Just before B's drop, press OUT: B jumps back, it loops.",
  "Pendant que B tourne, monte doucement son fader. Il attend sous A, sans ses basses.": "While B loops, slowly bring up its fader. It waits under A, without its lows.",
  "A finit sa dernière phrase. Sur le 1, appuie sur EXIT et baisse A d'un coup : le drop de B tombe pile.": "A finishes its last phrase. On the 1, press EXIT and pull A down in one go: B's drop lands right on time.",
  "Erreur n° 1": "Mistake #1",
  "Tu appuies sur IN 2 temps trop tard : ta boucle mord sur le drop. Écoute bien la fin du tour.": "You press IN 2 beats too late: your loop bites into the drop. Listen closely to the end of the loop.",
  "Le drop a démarré, puis il est reparti en arrière. Maintenant, la bonne :": "The drop started, then jumped back. Now, the right way:",
  "Erreur n° 2": "Mistake #2",
  "Sans Quantize, tu appuies sur OUT un poil trop tard : ta boucle fait 32 temps et quart. Écoute après le tour.": "Without Quantize, you press OUT a hair too late: your loop is 32 and a quarter beats. Listen after the loop.",
  "Les grosses caisses ne tombent plus ensemble : ça galope. Allume Quantize : IN et OUT se posent tout seuls sur le temps. La bonne :": "The kick drums don't land together anymore: it gallops. Turn on Quantize: IN and OUT snap to the beat on their own. The right way:",
  "Bravo, tu connais la boucle qui attend ! Garde ces trois lignes en tête.": "Well done, you know the waiting loop! Keep these three lines in mind.",
  "**32 temps**, c'est une phrase : ta boucle fait 32 temps, pas un de plus.": "**32 beats** is a phrase: your loop is 32 beats, not one more.",
  "<b>32 temps</b>, c'est une phrase : ta boucle fait 32 temps, pas un de plus.": "<b>32 beats</b> is a phrase: your loop is 32 beats, not one more.",
  "**IN** au début d'une phrase de B, **OUT** juste avant son drop. Avec Quantize allumé.": "**IN** at the start of one of B's phrases, **OUT** just before its drop. With Quantize on.",
  "<b>IN</b> au début d'une phrase de B, <b>OUT</b> juste avant son drop. Avec Quantize allumé.": "<b>IN</b> at the start of one of B's phrases, <b>OUT</b> just before its drop. With Quantize on.",
  "**EXIT** sur le 1 quand A se termine : le drop de B tombe pile.": "**EXIT** on the 1 when A ends: B's drop lands right on time.",
  "<b>EXIT</b> sur le 1 quand A se termine : le drop de B tombe pile.": "<b>EXIT</b> on the 1 when A ends: B's drop lands right on time.",
  "La boucle qui prolonge l'outro": "The loop that extends the outro",
  "A finit avant le drop de B ? Tu boucles la fin de A, le temps que B arrive.": "A ends before B's drop? Loop the end of A, while B gets there.",
  "↑ A est fini : il ne reste que B, sans ses basses": "↑ A is over: only B is left, without its lows",
  "↑ le trou : A s'est arrêté trop tôt": "↑ the gap: A stopped too early",
  "Écoute… et suis le trait blanc sur la piste.": "Listen… and follow the white line on the track.",
  "Tu as entendu ? A est arrivé au bout, mais il a continué à tourner sur ses 16 derniers temps, le temps que B arrive à son drop.": "Did you hear it? A reached the end, but it kept looping its last 16 beats, while B got to its drop.",
  "Le problème : B met longtemps à arriver à son drop, et A se termine avant. Écoute ce qui se passe sans boucle :": "The problem: B takes a long time to reach its drop, and A ends first. Listen to what happens without a loop:",
  "Tout retombe : pendant 32 temps, il ne reste que B, sans ses basses, tout maigre. La boucle qui prolonge l'outro bouche ce trou.": "Everything falls flat: for 32 beats, there's only B left, without its lows, really thin. The loop that extends the outro fills that gap.",
  "Lance B au casque sur une phrase de A, puis monte son fader pendant la fin de A.": "Start B in your headphones on one of A's phrases, then bring up its fader during the end of A.",
  "16 temps avant la fin de A, appuie sur IN.": "16 beats before the end of A, press IN.",
  "Sur la fin de A, appuie sur OUT : A repart 16 temps en arrière, et tourne en boucle sous la montée de B.": "At the end of A, press OUT: A jumps back 16 beats, and loops under B's build-up.",
  "Pas besoin d'EXIT : quand le drop de B arrive, baisse A d'un coup.": "No need for EXIT: when B's drop arrives, pull A down in one go.",
  "L'erreur": "The mistake",
  "Tu appuies sur EXIT trop tôt : A repart vers sa fin… et s'arrête avant le drop de B.": "You press EXIT too early: A heads to its end… and stops before B's drop.",
  "Tu as entendu le trou ? Garde la boucle jusqu'au drop de B. La bonne :": "Did you hear the gap? Keep the loop until B's drop. The right way:",
  "Bravo ! Avec cette boucle, plus de trou entre deux morceaux.": "Well done! With this loop, no more gaps between two tracks.",
  "Si A finit avant le drop de B, **boucle la fin de A**.": "If A ends before B's drop, **loop the end of A**.",
  "Si A finit avant le drop de B, <b>boucle la fin de A</b>.": "If A ends before B's drop, <b>loop the end of A</b>.",
  "**IN** 16 temps avant la fin, **OUT** sur la fin : A tourne sous B jusqu'à son drop.": "**IN** 16 beats before the end, **OUT** at the end: A loops under B until its drop.",
  "<b>IN</b> 16 temps avant la fin, <b>OUT</b> sur la fin : A tourne sous B jusqu'à son drop.": "<b>IN</b> 16 beats before the end, <b>OUT</b> at the end: A loops under B until its drop.",
  "Pas d'EXIT : au drop de B, **baisse A** d'un coup.": "No EXIT: at B's drop, **pull A down** in one go.",
  "Pas d'EXIT : au drop de B, <b>baisse A</b> d'un coup.": "No EXIT: at B's drop, <b>pull A down</b> in one go.",
  "La montée en boucle": "The loop build-up",
  "Une boucle qui raccourcit (8, 4, 2, 1 temps) fait monter la tension avant le drop.": "A loop that gets shorter (8, 4, 2, 1 beats) builds the tension before the drop.",
  "↑ trop vite : la boucle bégaie 18 temps": "↑ too fast: the loop stutters for 18 beats",
  "Écoute d'abord la montée en entier. Je t'explique juste après.": "First, listen to the whole build-up. I'll explain right after.",
  "Écoute… la boucle de A raccourcit, raccourcit… et boum.": "Listen… A's loop gets shorter, and shorter… and boom.",
  "Tu as senti la tension monter ? La boucle de A est passée de 8 temps à 4, puis 2, puis 1, puis un demi… et le drop de B a tout libéré.": "Did you feel the tension rise? A's loop went from 8 beats to 4, then 2, then 1, then a half… and B's drop released it all.",
  "La montée, c'est pour le moment fort de ton set : juste avant un gros drop, comme un roulement de tambour.": "The build-up is for the big moment of your set: just before a big drop, like a drum roll.",
  "Le secret : chaque ½X tombe à la fin d'un tour, deux tours à chaque fois. Le tout dure une phrase, et le drop tombe pile sur la suivante.": "The secret: each ½X lands at the end of a loop, two loops each time. The whole thing lasts one phrase, and the drop lands right on the next one.",
  "8 + 8 + 4 + 4 + 2 + 2 + 1 + 1 + 4 × ½ = 32 temps": "8 + 8 + 4 + 4 + 2 + 2 + 1 + 1 + 4 × ½ = 32 beats",
  "Au début de la dernière phrase de A, pose une boucle de 8 temps : IN, puis OUT 8 temps plus tard.": "At the start of A's last phrase, set an 8-beat loop: IN, then OUT 8 beats later.",
  "Après deux tours, appuie sur ½X : la boucle passe à 4 temps.": "After two loops, press ½X: the loop goes to 4 beats.",
  "Continue : ½X tous les deux tours. 2 temps, puis 1, puis un demi.": "Keep going: ½X every two loops. 2 beats, then 1, then a half.",
  "Sur le 1 de la phrase suivante, baisse A et monte B d'un coup : le drop explose.": "On the 1 of the next phrase, pull A down and bring B up in one go: the drop explodes.",
  "Tu raccourcis trop vite : ta boucle arrive à un demi-temps bien avant le drop. Écoute :": "You shorten too fast: your loop gets to half a beat long before the drop. Listen:",
  "Ça bégaie pendant 8 secondes, et la tension retombe. Deux tours à chaque fois, pas plus vite. La bonne :": "It stutters for 8 seconds, and the tension drops. Two loops each time, no faster. The right way:",
  "Bravo ! La montée, c'est ton arme pour les gros drops.": "Well done! The build-up is your weapon for big drops.",
  "Une boucle de **8 temps** au début de la dernière phrase de A.": "An **8-beat** loop at the start of A's last phrase.",
  "Une boucle de <b>8 temps</b> au début de la dernière phrase de A.": "An <b>8-beat</b> loop at the start of A's last phrase.",
  "**½X tous les deux tours** : 8, 4, 2, 1, un demi.": "**½X every two loops**: 8, 4, 2, 1, a half.",
  "<b>½X tous les deux tours</b> : 8, 4, 2, 1, un demi.": "<b>½X every two loops</b>: 8, 4, 2, 1, a half.",
  "Le drop de B **pile sur le 1** de la phrase suivante.": "B's drop **right on the 1** of the next phrase.",
  "Le drop de B <b>pile sur le 1</b> de la phrase suivante.": "B's drop <b>right on the 1</b> of the next phrase.",
  "La boucle de secours": "The rescue loop",
  "B est parti en retard ? Une boucle de 4 temps sur A rattrape tout.": "B started late? A 4-beat loop on A makes up for everything.",
  "↑ le trou : 8 temps sans A avant le drop": "↑ the gap: 8 beats without A before the drop",
  "↑ la boucle déborde après la fin de A : un trou à chaque tour": "↑ the loop spills past the end of A: a gap on every loop",
  "B était parti en retard, mais tu n'as rien entendu : A a répété sa dernière mesure, le temps que le drop de B arrive.": "B had started late, but you didn't hear a thing: A repeated its last bar, while B's drop arrived.",
  "Tu as lancé B 8 temps trop tard ? Ça arrive à tout le monde. Son drop tombera 8 temps après la fin de A. Écoute :": "You started B 8 beats too late? It happens to everyone. Its drop will land 8 beats after the end of A. Listen:",
  "Tu entends le trou ? La boucle de secours gagne ces 8 temps, et personne ne s'en rend compte.": "Hear the gap? The rescue loop wins back those 8 beats, and nobody notices.",
  "Oups : B part 8 temps après le début d'une phrase de A. Son drop arrivera en retard.": "Oops: B starts 8 beats after the start of one of A's phrases. Its drop will come late.",
  "Sur la dernière mesure de A, 4 temps avant la fin, appuie sur IN.": "On A's last bar, 4 beats before the end, press IN.",
  "Sur la fin de A, appuie sur OUT : A répète sa dernière mesure. Deux tours, et tu as gagné 8 temps.": "At the end of A, press OUT: A repeats its last bar. Two loops, and you've won back 8 beats.",
  "Au drop de B, baisse A d'un coup. Sauvé !": "At B's drop, pull A down in one go. Saved!",
  "Tu appuies sur IN 2 temps trop tard : ta boucle déborde après la fin de A. Écoute :": "You press IN 2 beats too late: your loop spills past the end of A. Listen:",
  "Un trou à chaque tour ! Ta boucle doit finir pile sur la fin de A. La bonne :": "A gap on every loop! Your loop has to end right at the end of A. The right way:",
  "Bravo ! Un B parti en retard ne te fait plus peur.": "Well done! A late B doesn't scare you anymore.",
  "B parti en retard ? **Boucle la fin de A** pour gagner du temps.": "B started late? **Loop the end of A** to win back time.",
  "B parti en retard ? <b>Boucle la fin de A</b> pour gagner du temps.": "B started late? <b>Loop the end of A</b> to win back time.",
  "Une boucle de **4 temps** qui tourne deux fois : **8 temps** de gagnés.": "A **4-beat** loop that plays twice: **8 beats** won back.",
  "Une boucle de <b>4 temps</b> qui tourne deux fois : <b>8 temps</b> de gagnés.": "A <b>4-beat</b> loop that plays twice: <b>8 beats</b> won back.",
  "Ta boucle finit **pile sur la fin de A**, et au drop de B tu baisses A.": "Your loop ends **right at the end of A**, and at B's drop you pull A down.",
  "Ta boucle finit <b>pile sur la fin de A</b>, et au drop de B tu baisses A.": "Your loop ends <b>right at the end of A</b>, and at B's drop you pull A down.",
  "Le fondu au fader": "The fader fade",
  "B monte tout doucement pendant la dernière phrase de A, et son drop tombe quand A disparaît.": "B comes up very slowly during A's last phrase, and its drop lands when A disappears.",
  "↑ B arrive d'un coup": "↑ B comes in all at once",
  "↑ A est parti : il ne reste que la montée de B": "↑ A is gone: only B's build-up is left",
  "Tu as entendu ? B est monté tout doucement pendant la fin de A, et on n'a pas entendu la couture. C'est le fondu au fader.": "Did you hear it? B came up very slowly during the end of A, and you couldn't hear the seam. That's the fader fade.",
  "C'est la transition la plus simple : un morceau monte pendant que l'autre descend, juste avec les faders.": "It's the simplest transition: one track comes up while the other goes down, just with the faders.",
  "Le secret : B monte doucement pendant la dernière phrase de A, et son drop tombe pile quand A s'arrête.": "The secret: B comes up slowly during A's last phrase, and its drop lands right when A stops.",
  "Lance B au casque, au début de l'avant-dernière phrase de A.": "Start B in your headphones, at the start of A's second-to-last phrase.",
  "Au début de la dernière phrase de A, monte le fader de B, tout doucement : en 24 temps.": "At the start of A's last phrase, bring up B's fader, very slowly: over 24 beats.",
  "Sur les 8 derniers temps, baisse A. Le drop de B tombe pile quand A disparaît.": "Over the last 8 beats, pull A down. B's drop lands right when A disappears.",
  "Tu montes B d'un coup. Écoute le début de la phrase :": "You bring B up all at once. Listen to the start of the phrase:",
  "Ça saute : tout le monde l'a entendu. Monte-le doucement, sur 24 temps. La bonne :": "It jumps: everybody heard it. Bring it up slowly, over 24 beats. The right way:",
  "Tu baisses A trop tôt. Écoute la fin de la phrase :": "You pull A down too early. Listen to the end of the phrase:",
  "Il ne reste que la montée de B, toute maigre. Garde A jusqu'au drop de B. La bonne :": "Only B's build-up is left, really thin. Keep A until B's drop. The right way:",
  "Bravo, tu connais le fondu au fader ! Garde ces trois lignes en tête.": "Well done, you know the fader fade! Keep these three lines in mind.",
  "B monte **doucement**, pendant la dernière phrase de A : pas d'un coup.": "B comes up **slowly**, during A's last phrase: not all at once.",
  "B monte <b>doucement</b>, pendant la dernière phrase de A : pas d'un coup.": "B comes up <b>slowly</b>, during A's last phrase: not all at once.",
  "**A descend sur les 8 derniers temps**, pas avant.": "**A goes down over the last 8 beats**, not before.",
  "<b>A descend sur les 8 derniers temps</b>, pas avant.": "<b>A goes down over the last 8 beats</b>, not before.",
  "Le **drop de B** tombe pile quand A disparaît.": "**B's drop** lands right when A disappears.",
  "Le <b>drop de B</b> tombe pile quand A disparaît.": "<b>B's drop</b> lands right when A disappears.",
  "Au drop de B, les basses changent de morceau, sur le 1 : jamais deux basses en même temps.": "At B's drop, the bass changes tracks, on the 1: never two basslines at the same time.",
  "↑ deux basses en même temps : ça devient boueux": "↑ two basslines at the same time: it gets muddy",
  "↑ 2 temps de basses doublées": "↑ 2 beats of doubled bass",
  "Tu as entendu ? Au drop de B, les basses ont changé de morceau d'un coup, sur le 1. C'est le swap des basses.": "Did you hear it? At B's drop, the bass changed tracks all at once, on the 1. That's the bass swap.",
  "Deux basses en même temps, ça fait de la bouillie : les graves des deux morceaux se marchent dessus.": "Two basslines at the same time make mush: the lows of both tracks step on each other.",
  "Le swap, c'est échanger les basses : celles de A partent, celles de B arrivent, au même instant, sur le 1.": "The swap means exchanging the lows: A's go out, B's come in, at the same instant, on the 1.",
  "Coupe le LOW de B, tout à gauche. Puis lance B au casque, sur une phrase de A.": "Cut B's LOW, all the way left. Then start B in your headphones, on one of A's phrases.",
  "Monte son fader pendant sa montée : on l'entend, mais sans ses basses.": "Bring up its fader during its build-up: you hear it, but without its lows.",
  "Au drop de B, sur le 1 : coupe le LOW de A et ouvre celui de B, en même temps.": "At B's drop, on the 1: cut A's LOW and open B's, at the same time.",
  "A finit sa phrase sans ses basses. À la fin, baisse-le.": "A finishes its phrase without its lows. At the end, pull it down.",
  "Tu oublies le swap. Écoute le drop de B :": "You forget the swap. Listen to B's drop:",
  "Ça cogne et ça bave : deux basses ensemble. La bonne :": "It thumps and smears: two basslines together. The right way:",
  "Tu ouvres le LOW de B à l'heure, mais tu coupes celui de A 2 temps trop tard. Écoute bien le drop :": "You open B's LOW on time, but you cut A's 2 beats too late. Listen closely to the drop:",
  "Les basses se sont doublées pendant 2 temps. Les deux potards en même temps, sur le 1. La bonne :": "The bass doubled for 2 beats. Both knobs at the same time, on the 1. The right way:",
  "Bravo, tu sais faire le swap des basses !": "Well done, you can do the bass swap!",
  "**Jamais deux basses** en même temps.": "**Never two basslines** at the same time.",
  "<b>Jamais deux basses</b> en même temps.": "<b>Never two basslines</b> at the same time.",
  "Le **LOW de B coupé** avant de le lancer.": "**B's LOW cut** before you start it.",
  "Le <b>LOW de B coupé</b> avant de le lancer.": "<b>B's LOW cut</b> before you start it.",
  "Au **drop de B**, sur le 1 : LOW de A coupé, LOW de B ouvert.": "At **B's drop**, on the 1: A's LOW cut, B's LOW open.",
  "Au <b>drop de B</b>, sur le 1 : LOW de A coupé, LOW de B ouvert.": "At <b>B's drop</b>, on the 1: A's LOW cut, B's LOW open.",
  "Le mix aux 3 bandes": "The 3-band mix",
  "Les aigus, puis les médiums, puis les basses : B entre bande par bande pendant que A s'efface.": "The highs, then the mids, then the lows: B comes in band by band while A fades away.",
  "↑ deux morceaux entiers en même temps : tout se mélange": "↑ two full tracks at the same time: it all blurs together",
  "Tu as entendu ? B est entré par petits morceaux : ses aigus, puis ses médiums, puis ses basses. Et A s'effaçait de la même façon.": "Did you hear it? B came in bit by bit: its highs, then its mids, then its lows. And A faded away the same way.",
  "Le swap échange les basses. Le mix aux 3 bandes va plus loin : les aigus, puis les médiums, puis les basses, une bande toutes les 2 mesures.": "The swap exchanges the lows. The 3-band mix goes further: the highs, then the mids, then the lows, one band every 2 bars.",
  "C'est plus long et plus doux : parfait quand deux morceaux se ressemblent.": "It's longer and smoother: perfect when two tracks sound alike.",
  "Avant de lancer B, coupe ses trois potards : HI, MID et LOW tout à gauche. Puis lance-le au casque.": "Before starting B, cut its three knobs: HI, MID and LOW all the way left. Then start it in your headphones.",
  "Monte son fader : on n'entend presque rien, c'est normal.": "Bring up its fader: you can hardly hear anything, that's normal.",
  "Au drop de B, échange les aigus : HI de A à gauche, HI de B au milieu.": "At B's drop, swap the highs: A's HI to the left, B's HI to the middle.",
  "2 mesures plus tard, les médiums.": "2 bars later, the mids.",
  "Encore 2 mesures : les basses. A n'est plus qu'un souffle : baisse-le à la fin de sa phrase.": "Another 2 bars: the lows. A is just a whisper now: pull it down at the end of its phrase.",
  "Tu ouvres B en entier d'un coup, et A reste entier. Écoute :": "You open B fully all at once, and A stays full. Listen:",
  "Deux morceaux entiers : tout se mélange. Une bande à la fois. La bonne :": "Two full tracks: it all blurs together. One band at a time. The right way:",
  "Bravo, tu sais mixer aux 3 bandes !": "Well done, you can do a 3-band mix!",
  "**HI, puis MID, puis LOW** : une bande toutes les 2 mesures.": "**HI, then MID, then LOW**: one band every 2 bars.",
  "<b>HI, puis MID, puis LOW</b> : une bande toutes les 2 mesures.": "<b>HI, then MID, then LOW</b>: one band every 2 bars.",
  "Ce que B gagne, **A le perd au même moment**.": "Whatever B gains, **A loses at the same moment**.",
  "Ce que B gagne, <b>A le perd au même moment</b>.": "Whatever B gains, <b>A loses at the same moment</b>.",
  "Les **basses en dernier**, sur le 1.": "The **lows last**, on the 1.",
  "Les <b>basses en dernier</b>, sur le 1.": "The <b>lows last</b>, on the 1.",
  "Sur le 1, A disparaît et le drop de B arrive, d'un coup : pas de mélange.": "On the 1, A disappears and B's drop arrives, all at once: no blending.",
  "↑ 2 temps de silence": "↑ 2 beats of silence",
  "↑ A traîne 2 temps sur le drop de B": "↑ A drags 2 beats into B's drop",
  "Tu as entendu ? Sur le 1, A a disparu et le drop de B est arrivé, d'un coup. C'est la coupure sèche.": "Did you hear it? On the 1, A disappeared and B's drop arrived, all at once. That's the hard cut.",
  "C'est la transition la plus franche : pas de mélange, on passe d'un morceau à l'autre en un instant.": "It's the most direct transition: no blending, you go from one track to the other in an instant.",
  "Tout se joue sur un seul temps : le 1 où A finit sa phrase et où B lâche son drop.": "It all comes down to a single beat: the 1 where A ends its phrase and B lets its drop go.",
  "Lance B au casque, 64 temps avant la fin de A : son drop tombera pile à la fin.": "Start B in your headphones, 64 beats before the end of A: its drop will land right at the end.",
  "Prépare tes deux mains : une sur le fader de A, une sur celui de B. Compte la dernière phrase de A…": "Get both hands ready: one on A's fader, one on B's. Count A's last phrase…",
  "… et sur le 1 : A en bas, B en haut, en même temps.": "… and on the 1: A down, B up, at the same time.",
  "Tu coupes A 2 temps trop tôt. Écoute :": "You cut A 2 beats too early. Listen:",
  "Un trou ! La salle l'a entendu. Les deux mains en même temps. La bonne :": "A gap! The crowd heard it. Both hands at the same time. The right way:",
  "Tu coupes A 2 temps trop tard. Écoute :": "You cut A 2 beats too late. Listen:",
  "A a mordu sur le drop de B. Sur le 1, pile. La bonne :": "A bit into B's drop. On the 1, exactly. The right way:",
  "Bravo, tu connais la coupure sèche !": "Well done, you know the hard cut!",
  "**Sur le 1** : A en bas, B en haut, en même temps.": "**On the 1**: A down, B up, at the same time.",
  "<b>Sur le 1</b> : A en bas, B en haut, en même temps.": "<b>On the 1</b>: A down, B up, at the same time.",
  "Lance B pour que **son drop tombe pile** à la fin de A.": "Start B so that **its drop lands right** at the end of A.",
  "Lance B pour que <b>son drop tombe pile</b> à la fin de A.": "Start B so that <b>its drop lands right</b> at the end of A.",
  "Ni **trou**, ni **chevauchement**.": "No **gap**, no **overlap**.",
  "Ni <b>trou</b>, ni <b>chevauchement</b>.": "No <b>gap</b>, no <b>overlap</b>.",
  "La dernière mesure de A rebondit en échos, pendant que le drop de B arrive dessous.": "A's last bar bounces away in echoes, while B's drop arrives underneath.",
  "↑ A s'arrête net": "↑ A stops dead",
  "↑ A se noie dans ses échos": "↑ A drowns in its echoes",
  "Tu as entendu ? A ne s'est pas arrêté net : sa dernière mesure a rebondi en échos, et le drop de B est arrivé dessous. C'est l'écho out.": "Did you hear it? A didn't stop dead: its last bar bounced away in echoes, and B's drop arrived underneath. That's the echo out.",
  "L'écho répète le son, de plus en plus bas, comme dans la montagne. Il continue même quand le fader de A est en bas.": "The echo repeats the sound, quieter and quieter, like in the mountains. It keeps going even when A's fader is down.",
  "L'écho out fait partir A en douceur, surtout quand B arrive avec un gros drop.": "The echo out takes A out smoothly, especially when B comes in with a big drop.",
  "Sur la table : l'effet ECHO du BEAT FX, réglé sur 3/4 de temps": "On the controller: the BEAT FX ECHO effect, set to 3/4 of a beat",
  "Au début de la dernière phrase de A, monte doucement le fader de B.": "At the start of A's last phrase, slowly bring up B's fader.",
  "Sur la dernière mesure de A, allume l'écho : les 4 derniers temps rebondissent.": "On A's last bar, turn on the echo: the last 4 beats bounce.",
  "Sur le 1, baisse A d'un coup. Laisse l'écho allumé : il continue tout seul, sous le drop de B.": "On the 1, pull A down in one go. Leave the echo on: it keeps going on its own, under B's drop.",
  "Quand les échos se sont éteints, tu peux éteindre l'effet.": "When the echoes have died out, you can turn off the effect.",
  "Sans écho, A s'arrête net. Écoute :": "Without echo, A stops dead. Listen:",
  "Ça coupe, c'est sec. Avec l'écho :": "It cuts, it's abrupt. With the echo:",
  "Tu allumes l'écho 3 mesures trop tôt. Écoute :": "You turn on the echo 3 bars too early. Listen:",
  "A se noie dans ses répétitions avant même la fin : c'est brouillon. Une seule mesure suffit. La bonne :": "A drowns in its repeats before it even ends: it's messy. One bar is enough. The right way:",
  "Bravo, tu connais l'écho out !": "Well done, you know the echo out!",
  "L'écho sur **la dernière mesure** de A, pas avant.": "The echo on **A's last bar**, not before.",
  "L'écho sur <b>la dernière mesure</b> de A, pas avant.": "The echo on <b>A's last bar</b>, not before.",
  "Sur le 1, **A en bas** : l'écho continue tout seul.": "On the 1, **A down**: the echo keeps going on its own.",
  "Sur le 1, <b>A en bas</b> : l'écho continue tout seul.": "On the 1, <b>A down</b>: the echo keeps going on its own.",
  "Tu éteins l'écho **quand les répétitions se sont tues**.": "You turn off the echo **when the repeats have gone quiet**.",
  "Tu éteins l'écho <b>quand les répétitions se sont tues</b>.": "You turn off the echo <b>when the repeats have gone quiet</b>.",
  "La sortie dans la réverbe": "The reverb exit",
  "A s'envole dans un nuage de réverbe, et le drop de B arrive pendant qu'il s'éteint.": "A floats away in a cloud of reverb, and B's drop arrives as it fades.",
  "RÉVERBE off": "REVERB off",
  "↑ la réverbe s'est coupée avec A": "↑ the reverb cut out with A",
  "↑ tout devient flou, trop tôt": "↑ everything gets blurry, too early",
  "Tu as entendu ? A s'est envolé dans un nuage, comme dans une immense salle, pendant que B arrivait. C'est la sortie dans la réverbe.": "Did you hear it? A floated away in a cloud, like in a huge hall, while B came in. That's the reverb exit.",
  "La réverbe, c'est le son d'une grande salle : il ne se répète pas comme l'écho, il s'étale et s'éteint doucement.": "Reverb is the sound of a big hall: it doesn't repeat like the echo, it spreads out and fades slowly.",
  "Elle fait disparaître A dans un souffle : parfait quand B commence par un gros drop.": "It makes A vanish in a whoosh: perfect when B starts with a big drop.",
  "Sur la table : l'effet REVERB du BEAT FX": "On the controller: the BEAT FX REVERB effect",
  "2 mesures avant la fin de A, allume la réverbe.": "2 bars before the end of A, turn on the reverb.",
  "Sur le 1, baisse A. La réverbe continue de résonner : laisse-la allumée !": "On the 1, pull A down. The reverb keeps ringing: leave it on!",
  "Tu éteins la réverbe en même temps que tu baisses A. Écoute :": "You turn off the reverb at the same time as you pull A down. Listen:",
  "Le nuage a disparu d'un coup : c'est comme couper net. Laisse l'effet allumé. La bonne :": "The cloud vanished all at once: it's like cutting dead. Leave the effect on. The right way:",
  "Tu allumes la réverbe 4 mesures trop tôt. Écoute :": "You turn on the reverb 4 bars too early. Listen:",
  "A devient flou bien avant la fin : on ne comprend plus rien. 2 mesures suffisent. La bonne :": "A gets blurry long before the end: you can't make anything out. 2 bars are enough. The right way:",
  "Bravo, tu sais sortir dans la réverbe !": "Well done, you know the reverb exit!",
  "La réverbe sur les **2 dernières mesures** de A.": "The reverb on A's **last 2 bars**.",
  "La réverbe sur les <b>2 dernières mesures</b> de A.": "The reverb on A's <b>last 2 bars</b>.",
  "Sur le 1, **A en bas**, mais la réverbe **reste allumée**.": "On the 1, **A down**, but the reverb **stays on**.",
  "Sur le 1, <b>A en bas</b>, mais la réverbe <b>reste allumée</b>.": "On the 1, <b>A down</b>, but the reverb <b>stays on</b>.",
  "Tu l'éteins **quand le nuage s'est éteint**.": "You turn it off **when the cloud has faded**.",
  "Tu l'éteins <b>quand le nuage s'est éteint</b>.": "You turn it off <b>when the cloud has faded</b>.",
  "B entre tout fin, juste ses aigus, et s'ouvre petit à petit jusqu'à son drop. A, lui, se referme.": "B comes in really thin, just its highs, and opens up little by little until its drop. A, meanwhile, closes up.",
  "FILTRE ouvert": "FILTER open",
  "↑ B s'ouvre d'un coup, trop tôt": "↑ B opens all at once, too early",
  "Tu as entendu ? B est arrivé tout fin, juste ses aigus, puis il s'est ouvert jusqu'à son drop. A, lui, s'est refermé. C'est la transition au filtre.": "Did you hear it? B came in really thin, just its highs, then it opened up until its drop. A, meanwhile, closed up. That's the filter transition.",
  "Le filtre enlève une partie du son. Tourné à droite, il ne garde que les aigus : le morceau devient tout fin. À gauche, il ne garde que les graves : il devient sourd.": "The filter removes part of the sound. Turned right, it keeps only the highs: the track gets really thin. Turned left, it keeps only the lows: it gets muffled.",
  "Avec lui, B peut entrer tôt sans gêner A : il est trop fin pour se battre avec lui.": "With it, B can come in early without getting in A's way: it's too thin to fight with it.",
  "Le filtre au milieu = le son normal": "The filter in the middle = normal sound",
  "Avant de lancer B, tourne son filtre presque tout à droite. Puis lance-le au casque.": "Before starting B, turn its filter almost all the way right. Then start it in your headphones.",
  "Au début de la dernière phrase de A, monte le fader de B : on n'entend que ses aigus.": "At the start of A's last phrase, bring up B's fader: you only hear its highs.",
  "Pendant toute la phrase, ramène doucement le filtre de B vers le milieu.": "Throughout the phrase, slowly bring B's filter back to the middle.",
  "Sur les 16 derniers temps, tourne le filtre de A vers la gauche : il s'assourdit. Sur le 1, baisse-le.": "Over the last 16 beats, turn A's filter to the left: it gets muffled. On the 1, pull it down.",
  "Tu ouvres le filtre de B d'un coup, sans attendre la fin de la phrase. Écoute :": "You open B's filter all at once, without waiting for the end of the phrase. Listen:",
  "B débarque en entier, trop tôt, et se bat avec A. Tourne doucement, sur toute la phrase. La bonne :": "B barges in fully, too early, and fights with A. Turn slowly, over the whole phrase. The right way:",
  "Bravo, tu sais faire entrer un morceau au filtre !": "Well done, you can bring a track in with the filter!",
  "B entre **filtré** : seulement ses aigus.": "B comes in **filtered**: only its highs.",
  "B entre <b>filtré</b> : seulement ses aigus.": "B comes in <b>filtered</b>: only its highs.",
  "Tu l'**ouvres doucement**, sur toute la dernière phrase de A.": "You **open it slowly**, over A's whole last phrase.",
  "Tu l'<b>ouvres doucement</b>, sur toute la dernière phrase de A.": "You <b>open it slowly</b>, over A's whole last phrase.",
  "A se **referme** pendant ce temps, puis il part sur le 1.": "Meanwhile A **closes up**, then goes out on the 1.",
  "A se <b>referme</b> pendant ce temps, puis il part sur le 1.": "Meanwhile A <b>closes up</b>, then goes out on the 1.",
  "Le volume et les basses": "Volume and bass",
  "Le fader, le swap des basses, les 3 bandes, la coupure : les transitions de base, faites proprement.": "The fader, the bass swap, the 3 bands, the cut: the basic transitions, done properly.",
  "Les effets": "Effects",
  "L'écho, la réverbe, le filtre : faire partir un morceau en douceur, en faire entrer un autre.": "Echo, reverb, filter: taking a track out smoothly, bringing another one in.",
  "Les boucles": "Loops",
  "IN, OUT, EXIT et ½X : faire attendre un morceau, en prolonger un autre, faire monter la tension, rattraper un retard.": "IN, OUT, EXIT and ½X: making a track wait, extending another, building tension, catching up when you're late.",
  "↺ la boucle repart": "↺ the loop restarts",
  "· sans basses": "· no lows",
  "· filtré": "· filtered",
  "écho…": "echo…",
  "réverbe…": "reverb…",
  "Version ratée": "Wrong version",
  "Version réussie": "Right version",
  "Lecture": "Play",
  "Je prépare la musique…": "Getting the music ready…",
  "La musique ne se charge pas. Vérifie ta connexion, puis rouvre le tuto.": "The music won't load. Check your connection, then open the tutorial again.",
  "MONTÉE": "BUILD-UP",
  "Vu": "Seen",
  "Un tuto": "A tutorial",
  "Tu as vu tous les tutos. Bravo !": "You've watched all the tutorials. Well done!",
});

/* ---------- 01-index (lot 80, motifs) ---------- */
// index.html : les étiquettes écrites avec un nombre ou un nom
enDe({ 'Ma musique': 'My music' });
enMotif('Son : {#n} %', 'Sound: {n}%');
enMotif('Ma table : {x}', 'My controller: {x}');
enMotif('{x}, {#n} étoile(s) sur 3, verrouillé', '{x}, {n} star(s) out of 3, locked');
enMotif('{x}, {#n} étoile(s) sur 3, avec DJingood Pro', '{x}, {n} star(s) out of 3, with DJingood Pro');
enMotif('Chapitre {#n} : {x}, {#m} niveaux, avec DJingood Pro', 'Chapter {n}: {x}, {m} levels, with DJingood Pro');
enMotif('{x} : avec DJingood Pro', '{x}: with DJingood Pro');

/* ---------- 02-premiers (lot 80, motifs) ---------- */
// js/premiers.js : les morceaux du formulaire de compte, et les phrases avec un prénom
enDe({
  "Continuer sans compte pour l'instant": 'Continue without an account for now',
  "Pas de mot de passe : je t'envoie un lien pour te connecter.": "No password: I'll send you a link to sign in.",
  'DJingood garde ton prénom, ton adresse et ta progression.': 'DJingood keeps your first name, your email address and your progress.'
});
enMotif("C'est bon, {=p} ! Ton plan est gardé sur ton compte.", "All set, {p}! Your plan is saved to your account.");
enMotif("C'est bon ! Ton plan est gardé sur ton compte.", "All set! Your plan is saved to your account.");

/* ---------- 03-niveaux (lot 80, motifs) ---------- */
// js/niveaux.js : phrases avec un nombre ou un titre de niveau
enDe({
  'Swap en retard': 'Swap late', 'Swap en avance': 'Swap early',
  'Coupé en retard': 'Cut late', 'Coupé trop tôt': 'Cut too early',
  '4,99 € par mois': '€4.99 a month'
});
enMotif('Verrouillé : {#n}/{#m} ★ au chapitre {#c}', 'Locked: {n}/{m} ★ in chapter {c}');
enMotif('Encore {#n} ★ au chapitre {#c}', '{n} more ★ in chapter {c}');
enMotif("Ce chapitre est dans DJingood Pro : ses {#n} niveaux s'ouvrent avec l'abonnement.", 'This chapter is in DJingood Pro: its {n} levels unlock with the subscription.');
enMotif('Les niveaux {#n} à {#m} sont dans DJingood Pro.', 'Levels {n} to {m} are in DJingood Pro.');
enMotif("Réussis d'abord « {x} » (2 étoiles) : « {y} » s'ouvrira juste après.", 'First pass "{x}" (2 stars): "{y}" unlocks right after.');
enMotif("Réussis d'abord « {x} » (2 étoiles) : « {y} » viendra ensuite : les niveaux s'ouvrent un par un.", 'First pass "{x}" (2 stars): "{y}" comes after that: levels unlock one at a time.');
enMotif('Chapitre 1 · {x} · {#n} ★ sur 9', 'Chapter 1 · {x} · {n} ★ of 9');
enMotif('« {x} » est dans DJingood Pro', '"{x}" is in DJingood Pro');
enMotif("Puis {#n} chapitres, jusqu'au set noté sur 100.", 'Then {n} chapters, all the way to the set scored out of 100.');
enMotif("Et {#n} autres chapitres, jusqu'au set noté sur 100.", 'And {n} more chapters, all the way to the set scored out of 100.');
enMotif('Rejouer « {x} »', 'Replay "{x}"');
enMotif('Jouer « {x} » (gratuit)', 'Play "{x}" (free)');
enMotif('Les leçons Comprendre restent gratuites ({#n}/{#m} ★)', 'The Understand lessons stay free ({n}/{m} ★)');
enMotif('Ce niveau est dans DJingood Pro. Les {#n} premiers niveaux du chapitre 1 sont gratuits.', 'This level is in DJingood Pro. The first {n} levels of chapter 1 are free.');
enMotif('{x} · {#n} BPM', '{x} · {n} BPM');
enMotif('Swap {x} trop tard.', 'Swap {x} too late.');
enMotif('Swap {x} trop tôt.', 'Swap {x} too early.');
enMotif('Tu as fini les {#n} niveaux gratuits', "You've finished the {n} free levels");
enMotif('Commencer mes {#n} jours gratuits', 'Start my {n}-day free trial');
enMotif("{#n} jours gratuits, puis {x}. Ta carte est demandée, mais rien n'est prélevé avant le {#m}e jour ; un mail te prévient 2 jours avant.", "{n} days free, then {x}. We ask for your card, but nothing is charged before day {m}; an email reminds you 2 days before.");
// la bulle d'un niveau sur la carte (data-t) et son nom lu à voix haute
enMotif('{#n}. {x} · réussi', '{n}. {x} · done');
enMotif('{#n}. {x} · avec Pro', '{n}. {x} · with Pro');
enMotif('{#n}. {x} · pas encore ouvert', '{n}. {x} · not open yet');
enMotif(/^(\d+)\. ([^<>·]{1,60})$/, (m, n, x) => `${n}. ${tr(x)}`);
enMotif('Niveau {#n} : {x}, {#s} étoile(s) sur 3, avec DJingood Pro', 'Level {n}: {x}, {s} {s:star:stars} out of 3, with DJingood Pro');
enMotif('Niveau {#n} : {x}, {#s} étoile(s) sur 3, verrouillé', 'Level {n}: {x}, {s} {s:star:stars} out of 3, locked');

/* ---------- 04-parcours (lot 80, motifs) ---------- */
// js/parcours.js : phrases avec un nombre
enMotif('Tes {#n} premiers gestes', 'Your first {n} moves');
enMotif('Lancer au bon moment, le fader, la coupure : les {#n} premiers niveaux, gratuits. En Mode Expert, sans aucune aide, chaque geste noté à la milliseconde.', 'Starting at the right time, the fader, the cut: the first {n} levels, free. In Expert Mode, with no help at all, every move scored to the millisecond.');
enMotif("Bravo, tu as fini les {#n} niveaux gratuits. La suite : l'écho, le filtre, le swap des basses, puis la transition complète.", "Well done, you've finished the {n} free levels. Next up: the echo, the filter, the bass swap, then the full transition.");
enMotif('encore {#n} étoiles au chapitre {#c}', '{n} more stars in chapter {c}');
enMotif('encore {#n} étoile au chapitre {#c}', '{n} more star in chapter {c}');
enMotif('{x} · {#n} sur {#m} {y}', '{x} · {n} of {m} {y}');

/* ---------- 05-compte (lot 80, motifs) ---------- */
// js/compte.js : phrases avec un prénom, une heure ou des chiffres
enDe({ 'erreur inconnue': 'unknown error', 'Bienvenue !': 'Welcome!' });
enMotif('Ton mot de passe est trop court : il en faut au moins {#n} caractères.', 'Your password is too short: it needs at least {n} characters.');
enMotif('{#n} caractères minimum', '{n} characters minimum');
enMotif("Ça n'a pas marché : {x}", "That didn't work: {x}");
enMotif("Ton compte a déjà une progression ({x}), et cet ordinateur en a une autre ({y}). Laquelle tu gardes ? L'autre sera remplacée. Rien n'est enregistré tant que tu n'as pas choisi.", 'Your account already has progress ({x}), and this computer has different progress ({y}). Which one do you keep? The other one will be replaced. Nothing is saved until you choose.');
enMotif(/^(\d+) étoiles? et (\d+) badges?$/, (m, e, b) => `${e} ${+e === 1 ? 'star' : 'stars'} and ${b} ${+b === 1 ? 'badge' : 'badges'}`);
enMotif('Progression enregistrée à {=h}', 'Progress saved at {h}');
enMotif('Bienvenue {=p} !', 'Welcome {p}!');
enMotif('Content de te revoir, {=p} !', 'Good to see you again, {p}!');
enMotif('Bienvenue sur ordinateur, {=p} !', 'Welcome to DJingood on your computer, {p}!');
enMotif('Ta table : {=t}', 'Your controller: {t}');
enMotif('Bienvenue {=p} ! Ton compte est créé. À partir de maintenant, ta progression est enregistrée dessus.', 'Welcome {p}! Your account is created. From now on, your progress is saved to it.');
enMotif('{#n} leçons sur 7', '{n} lessons of 7');
enMotif('{#n} leçon sur 7', '{n} lesson of 7');
// « Ta progression » dans « Mon compte »
enMotif('Niveau {#n} · {=x} XP', 'Level {n} · {x} XP');
enMotif(/^(\d+) étoiles? sur (\d+)(?: · série de (\d+) jours?)?$/, (m, e, t, s) => `${e} ${+e === 1 ? 'star' : 'stars'} of ${t}` + (s ? ` · ${s}-day streak` : ''));

/* ---------- 07-pro (lot 80, motifs) ---------- */
// js/pro.js : phrases avec un titre, un nombre, un prix ou une date (dates déjà en anglais : LOCALE, js/langue.js)
enDe({
  "Aller à l'entraînement": 'Go to practice', "Aujourd'hui": 'Today',
  '<s>59,88 €</s> soit 4,17 € par mois · 2 mois offerts': "<s>€59.88</s> that's €4.17 a month · 2 months free",
  '/ mois': '/ month'
});
enMotif('Pour regarder « {x} »', 'To watch "{x}"');
enMotif('Pour jouer « {x} »', 'To play "{x}"');
enMotif('Pour ouvrir le chapitre {#n} : « {x} » (après {#s} ★ au chapitre {#c})', 'To open chapter {n}: "{x}" (after {s} ★ in chapter {c})');
enMotif('Pour ouvrir le chapitre {#n} : « {x} »', 'To open chapter {n}: "{x}"');
enMotif('{#n} exercices, {#m} tutos, et un nouveau tuto chaque mois.', '{n} exercises, {m} tutorials, and a new tutorial every month.');
enMotif('Tes {#n} premiers exercices sont gratuits, sur ordinateur. Vérifie que ta table marche avec DJingood avant de payer quoi que ce soit.', 'Your first {n} exercises are free, on a computer. Check that your controller works with DJingood before paying anything.');
enMotif('Tes {#n} premiers exercices sont gratuits. Vérifie que ta table marche avec DJingood avant de payer quoi que ce soit.', 'Your first {n} exercises are free. Check that your controller works with DJingood before paying anything.');
enMotif("Le mois offert est réservé aux comptes créés avant l'arrivée de Pro : tu peux essayer Pro {#n} jours gratuitement.", 'The free month is only for accounts created before Pro launched: you can try Pro free for {n} days.');
enMotif("Le chapitre {#n} s'ouvre avec 14 ★ au chapitre 1 (tu en as {#m}).", 'Chapter {n} unlocks with 14 ★ in chapter 1 (you have {m}).');
enMotif('On continue avec « {x} » ?', 'Shall we continue with "{x}"?');
enMotif('{x} On continue avec « {y} » ?', '{x} Shall we continue with "{y}"?');
enMotif('Jouer « {x} »', 'Play "{x}"');
enMotif("« {x} » s'ouvre quand les niveaux d'avant sont réussis.", '"{x}" unlocks once the levels before it are passed.');
enMotif('On ouvre « {x} » ?', 'Shall we open "{x}"?');
enMotif('Aller au chapitre {#n}', 'Go to chapter {n}');
enMotif('On commence par « {x} » ?', 'Shall we start with "{x}"?');
enMotif('Regarder « {x} »', 'Watch "{x}"');
enMotif('Tout DJingood est ouvert : les 7 chapitres et tous les tutos. {x}', 'All of DJingood is unlocked: the 7 chapters and all the tutorials. {x}');
enMotif('Pour toi, {=p}', 'For you, {p}');
enMotif('Essaie Pro {#n} jours, gratuitement', 'Try Pro free for {n} days');
enMotif("Tout s'ouvre : les {#n} exercices, les tutos de Vini, l'entraînement. Ta carte est demandée, mais rien n'est prélevé.", "Everything unlocks: the {n} exercises, Vini's tutorials, practice. We ask for your card, but nothing is charged.");
enMotif('Jour {#n}', 'Day {n}');
enMotif('{x}, sauf si tu arrêtes avant (dans « Mon compte »).', '{x}, unless you cancel before then (in "My account").');
enMotif("Les {#n} exercices, jusqu'au set noté sur 100", 'All {n} exercises, up to the set scored out of 100');
// l'abonnement dans « Mon compte »
enMotif("Essai gratuit jusqu'au {=d}", 'Free trial until {d}');
enMotif("Mois offert jusqu'au {=d}", 'Free month until {d}');
enMotif("{x} · s'arrête le {=d}", '{x} · ends on {d}');
enMotif('{x} · renouvelé le {=d}', '{x} · renews on {d}');
enMotif("s'arrête le {=d}", 'ends on {d}');
enMotif('renouvelé le {=d}', 'renews on {d}');
// l'objectif de la semaine (js/objectif.js) : le jour est déjà écrit en anglais
enMotif('{=d} : objectif atteint', '{d}: goal reached');

/* ---------- 08-divers (lot 80, motifs) ---------- */
// petits fichiers : le bandeau d'erreur, Ma table
enMotif('Un problème est survenu : {=m} (envoie une capture de ce message pour que je corrige).', 'Something went wrong: {m} (send a screenshot of this message so I can fix it).');
enMotif('{=t} (réglée pas à pas)', '{t} (set up step by step)');
enMotif('Utilisée dans : {x}.', 'Used in: {x}.');

/* ---------- 09-entrainement (lot 80, motifs) ---------- */
// S'entraîner, Comprendre, le quiz, les Premiers pas, Ma table : phrases avec un nombre, un titre ou une adresse
enDe({
  'Pas dans ta boîte de réception ?': 'Not in your inbox?',
  "Regarde dans les spams, puis indique à ta messagerie que ce n'est pas un spam : sinon, le lien ne s'ouvre pas.": "Check your spam folder, then tell your email app it's not spam: otherwise, the link won't open.",
  "<b>Pas dans ta boîte de réception ?</b> Regarde dans les spams, puis indique à ta messagerie que ce n'est pas un spam : sinon, le lien ne s'ouvre pas.": "<b>Not in your inbox?</b> Check your spam folder, then tell your email app it's not spam: otherwise, the link won't open.",
  'Copier le lien': 'Copy the link', 'Renvoyer': 'Send again',
  "Il faut 2 étoiles pour valider le défi : rejoue !": 'You need 2 stars to pass the challenge: play again!',
  "Retour à l'entraînement": 'Back to practice', 'Une autre variation': 'Another variation', "Une autre à l'oreille": 'Another one by ear',
  'Pas encore : suis la grosse caisse et compte 8 mesures.': 'Not yet: follow the kick drum and count 8 bars.'
});
// S'entraîner
enMotif(/^(\d+) (jouée|jouées|réussie|réussies)$/, (m, n, w) => `${n} ${/^jou/.test(w) ? 'played' : 'passed'}`);
enMotif(/^([^<>]{1,80}), en (House|Techno|Afro house|Vraie musique|vraie musique)$/, (m, t, s) => `${tr(t)}, in ${tr(s)}`);
enMotif(/^Défi réussi · (\d+) jours? d'affilée$/, (m, n) => `Challenge complete · ${n} ${+n === 1 ? 'day' : 'days'} in a row`);
enMotif(/^(\d+) variations? jouées?$/, (m, n) => `${n} ${+n === 1 ? 'variation' : 'variations'} played`);
enMotif(/^(\d+) réussies? à l'oreille$/, (m, n) => `${n} passed by ear`);
enMotif('{#n} ★ sur 9 · nouveau record !', '{n} ★ of 9 · new record!');
enMotif('{#n} ★ sur 9 · record : {#m} ★', '{n} ★ of 9 · record: {m} ★');
enMotif('{x} : pas réussi', '{x}: not passed');
enMotif('Défi réussi ! Et un mini-set pour battre ton record de {#n} ★ sur 9 ?', 'Challenge complete! How about a mini-set to beat your record of {n} ★ out of 9?');
enMotif("Le défi du jour t'attend : « {x} », en {y}.", 'The daily challenge is waiting: "{x}", in {y}.');
enMotif("Aujourd'hui : {x}, en {y}.", 'Today: {x}, in {y}.');
enMotif(/^Réussi (\d+) jours? d'affilée\.$/, (m, n) => `Done ${n} ${+n === 1 ? 'day' : 'days'} in a row.`);
enMotif('Record : {#n}/9 ★', 'Record: {n}/9 ★');
enMotif("L'entraînement reprend les niveaux que tu as déjà joués dans Apprendre ({#n} sur {#m}), sur d'autres morceaux.", "Practice replays the levels you've already played in Learn ({n} of {m}), on other tracks.");
enMotif('Mini-set · transition {#n} sur 3', 'Mini-set · transition {n} of 3');
enMotif('Transition {#n} sur 3', 'Transition {n} of 3');
// Comprendre (les leçons sur le téléphone)
enMotif('{#n} leçons sur {#m}', '{n} lessons of {m}');
enMotif('{#n} leçon sur {#m}', '{n} lesson of {m}');
enMotif('Leçon {#n} : {x}, pas encore ouverte', 'Lesson {n}: {x}, not open yet');
enMotif(/^Leçon (\d+) : ([\s\S]+?), (\d+) étoiles? sur 3$/, (m, n, x, s) => `Lesson ${n}: ${tr(x)}, ${s} ${+s === 1 ? 'star' : 'stars'} out of 3`);
enMotif('Leçon {#n} : {x}', 'Lesson {n}: {x}');
enMotif('Leçon {#n} · {x}', 'Lesson {n} · {x}');
enMotif('{x} · {#n} min', '{x} · {n} min');
enMotif('Envoyé à {=m}', 'Sent to {m}');
// le quiz et les badges
enMotif('Tu en es à {#n} sur {#m} {x}.', "You're at {n} of {m} {x}.");
enMotif('Nouveaux badges : {x}', 'New badges: {x}');
enMotif('Nouveau badge : {x}', 'New badge: {x}');
// Ma table
enMotif("Ça, c'est déjà le réglage de « {x} » : une même commande de ta table ne peut pas servir à deux endroits. Bouge celle que tu veux régler, ou refais « Régler ma table pas à pas » pour tout remettre en ordre.", 'That\'s already the setting for "{x}": one control on your controller can\'t be used in two places. Move the one you want to set up, or redo "Set up my controller step by step" to put everything back in order.');
// les Premiers pas
enMotif('La {=m}, super ! On la branchera sur ton ordinateur.', "The {m}, great! We'll plug it into your computer.");
enMotif('{#n} sur 8 pile : tu as le rythme !', "{n} of 8 right on the beat: you've got rhythm!");
enMotif("{#n} sur 8 pile : c'est un bon début.", "{n} of 8 right on the beat: that's a good start.");
enMotif("{#n} sur 8 pile : on va l'entraîner ensemble.", "{n} of 8 right on the beat: we'll train it together.");
enMotif('Les {#n} autres exercices', 'The other {n} exercises');
enMotif('Ton oreille : {#n} « boum » sur 8 pile. {x}', 'Your ear: {n} "booms" of 8 right on the beat. {x}');
enMotif("Ton lien pour l'ordinateur est parti à {=m}", 'Your link for the computer was sent to {m}');
enMotif("Je t'ai déjà envoyé 3 liens dans l'heure, à {=m}", "I've already sent you 3 links in the last hour, to {m}");

/* ---------- 10-calage-combos (lot 80, motifs) ---------- */
// chapitres 4 et 5 : phrases avec un nombre de temps, des millisecondes ou un BPM
enDe({ 'calés': 'in sync' });
enMotif('Prépare-toi à lancer B vers le temps {#n}.', 'Get ready to start B around beat {n}.');
enMotif("Tu n'as pas lancé B : appuie sur LANCE B (PLAY de droite) vers le temps {#n}.", "You didn't start B: press START B (right PLAY) around beat {n}.");
enMotif('B lancé {#n} temps tard : cale-le vite !', 'B started {n} {n:beat:beats} late: sync it up fast!');
enMotif('B lancé {#n} temps tôt : cale-le vite !', 'B started {n} {n:beat:beats} early: sync it up fast!');
enMotif('Oui : {x} ({#n} ms)', 'Yes: {x} ({n} ms)');
enMotif("Non : c'était « {x} »", 'No: it was "{x}"');
enMotif('Écoute {#n} sur {#m} : calés, B en avance, ou B en retard ?', 'Listen {n} of {m}: in sync, B ahead, or B behind?');
enMotif('Dans {#n} temps : échange les basses !', 'In {n} {n:beat:beats}: swap the lows!');
enMotif('Dans {#n} temps : monte le fader de B !', "In {n} {n:beat:beats}: bring up B's fader!");
enMotif('Calé · {#n} ms', 'In sync · {n} ms');
enMotif('{x} de {#n} ms : bien entendu.', '{x} by {n} ms: well heard.');
enMotif(/^Tu as répondu « (.+?) », c'était « (.+?) »(?: \((\d+) ms\))?\.(?: (.+))?$/, (m, a, b, ms, suite) => `You answered "${tr(a)}", it was "${tr(b)}"${ms ? ` (${ms} ms)` : ''}.` + (suite ? ' ' + tr(suite) : ''));
enMotif(/^Tu n'as répondu qu'à (\d+) écoutes? sur (\d+)\.$/, (m, n, t) => `You only answered ${n} ${+n === 1 ? 'listen' : 'listens'} of ${t}.`);
enMotif('B est resté calé (moins de {#n} ms) {#p} % du temps.', 'B stayed in sync (under {n} ms) {p}% of the time.');
enMotif('B est resté calé {#p} % du temps, et presque calé (moins de {#n} ms) {#q} % du temps. Encore un peu de précision.', 'B stayed in sync {p}% of the time, and almost in sync (under {n} ms) {q}% of the time. A bit more precision.');
enMotif("B n'est resté calé que {#p} % du temps. {x}", 'B only stayed in sync {p}% of the time. {x}');
enMotif('Calé en {#n} temps.', 'In sync in {n} {n:beat:beats}.');
enMotif('Calé en {#n} temps : vise moins de {#m}.', 'In sync in {n} {n:beat:beats}: aim for under {m}.');
enMotif('B finit à {#n} BPM, comme A.', 'B ends at {n} BPM, like A.');
enMotif('B finit à {#n} BPM : il va encore trop vite (A est à {#m}).', "B ends at {n} BPM: it's still too fast (A is at {m}).");
enMotif('B finit à {#n} BPM : il est encore trop lent (A est à {#m}).', "B ends at {n} BPM: it's still too slow (A is at {m}).");
enMotif('B est entré au temps {#n}, déjà calé.', 'B came in at beat {n}, already in sync.');
enMotif('B est entré décalé de {#n} ms : cale-le au casque avant de monter son fader.', 'B came in {n} ms off: sync it in your headphones before bringing up its fader.');
enMotif('B est entré au temps {#n} : vise le temps {#m}.', 'B came in at beat {n}: aim for beat {m}.');
// chapitre 4
enMotif("B à fond au temps {#n}, à l'heure.", 'B full at beat {n}, on time.');
enMotif('B à fond au temps {#n} : vise le temps {#m}.', 'B full at beat {n}: aim for beat {m}.');
enMotif("A n'était pas complètement filtré au temps {#n}.", "A wasn't fully filtered at beat {n}.");
enMotif('Blanc de {#n} temps entre la coupure et B.', 'A gap of {n} {n:beat:beats} between the cut and B.');
enMotif('Deux basses ensemble pendant {#n} temps : ouvre B et coupe A dans le même geste.', 'Two basslines together for {n} {n:beat:beats}: open B and cut A in the same move.');

/* ---------- 11-hotcues (lot 80, motifs) ---------- */
// chapitre 6 : phrases avec des temps, des millisecondes, « en retard » / « trop tôt »
const enRetard = s => ({ 'en retard': 'late', 'trop tard': 'too late', 'trop tôt': 'too early', 'en avance': 'early', 'après': 'after', 'avant': 'before' }[s] || s);
const enTemps = n => +n === 1 ? 'beat' : 'beats';
enDe({ 'BOUCLE': 'LOOP' });
enMotif('Pile ! ({#n} ms)', 'Spot on! ({n} ms)');
enMotif(/^(\d+) ms (en retard|trop tôt)$/, (m, n, s) => `${n} ms ${enRetard(s)}`);
enMotif(/^Le drop est tombé (\d+) temps (trop tard|trop tôt)$/, (m, n, s) => `The drop landed ${n} ${enTemps(n)} ${enRetard(s)}`);
enMotif('A coupé pile ! ({#n} ms)', 'A cut spot on! ({n} ms)');
enMotif(/^A coupé (\d+) ms (en retard|trop tôt)$/, (m, n, s) => `A cut ${n} ms ${enRetard(s)}`);
enMotif('Dans {#n} temps : la dernière mesure avant la phrase. Sors de la boucle (pad EXIT) pendant cette mesure.', 'In {n} {n:beat:beats}: the last bar before the phrase. Exit the loop (EXIT pad) during this bar.');
enMotif('↻ Boucle de {#n} temps', '↻ {n}-beat loop');
enMotif("A n'a pas été coupé : baisse son fader d'un coup au temps {#n}.", "A wasn't cut: pull its fader down in one go at beat {n}.");
enMotif('A coupé pile au temps {#n} ({#m} ms).', 'A cut right at beat {n} ({m} ms).');
enMotif(/^A coupé (\d+) ms (en retard|trop tôt) \(vise le temps (\d+)\)\.$/, (m, a, s, t) => `A cut ${a} ms ${enRetard(s)} (aim for beat ${t}).`);
enMotif("Tu n'as pas lancé B : appuie sur son pad 1 (hot cue) au temps {#n}.", "You didn't start B: press its pad 1 (hot cue) at beat {n}.");
enMotif('B lancé depuis son hot cue pile sur le temps {#n} ({#m} ms).', 'B started from its hot cue right on beat {n} ({m} ms).');
enMotif(/^B lancé (\d+) ms (en retard|trop tôt)\.$/, (m, a, s) => `B started ${a} ms ${enRetard(s)}.`);
enMotif('Appui pile sur le drop ({#n} ms).', 'Pressed right on the drop ({n} ms).');
enMotif(/^Appui (\d+) ms (en retard|trop tôt) par rapport au drop\.$/, (m, a, s) => `Pressed ${a} ms ${enRetard(s)} relative to the drop.`);
enMotif(/^Le repère est (\d+) temps (après|avant) le drop : écoute le moment où tout entre\.$/, (m, n, s) => `The cue point is ${n} ${enTemps(n)} ${enRetard(s)} the drop: listen for the moment everything comes in.`);
enMotif(/^Le drop de B est tombé (\d+) temps (trop tard|trop tôt) : sors de la boucle pendant la dernière mesure avant la phrase \(entre les temps 60 et 64\)\.$/, (m, n, s) => `B's drop landed ${n} ${enTemps(n)} ${enRetard(s)}: exit the loop during the last bar before the phrase (between beats 60 and 64).`);
enMotif("Ta boucle dépassait la fin de A (temps {#n}) : il est arrivé au bout quand même. Elle doit finir au temps {#m} au plus tard.", 'Your loop went past the end of A (beat {n}): it reached the end anyway. It has to end by beat {m} at the latest.');
enMotif('A est arrivé au bout de son morceau : silence. Boucle sa fin avant le temps {#n}.', 'A reached the end of its track: silence. Loop its end before beat {n}.');
enMotif("Boucle de {#n} temps posée au début d'une mesure (temps {#m}) : A ne s'arrête pas.", "{n}-beat loop set at the start of a bar (beat {m}): A doesn't stop.");
enMotif("Boucle posée au temps {#n}, pas au début d'une mesure : ça boite.", 'Loop set at beat {n}, not at the start of a bar: it limps.');
enMotif("Boucle posée pile au temps {#n} ({#m} ms) : A ne s'arrête pas.", "Loop set right at beat {n} ({m} ms): A doesn't stop.");
enMotif(/^Boucle posée (\d+) ms (en retard|trop tôt) par rapport au temps (\d+) : on entend le raccord\.$/, (m, a, s, b) => `Loop set ${a} ms ${enRetard(s)} relative to beat ${b}: you can hear the seam.`);
enMotif('Pas de boucle de {#n} temps (au temps {#m}).', 'No {n}-beat loop (at beat {m}).');
enMotif('Boucle de {#n} pile au temps {#m} ({#k} ms).', '{n}-beat loop right at beat {m} ({k} ms).');
enMotif(/^Boucle de (\d+) (\d+) ms (en retard|trop tôt)\.$/, (m, t, a, s) => `${t}-beat loop ${a} ms ${enRetard(s)}.`);

/* ---------- 12-set (lot 80, motifs) ---------- */
// chapitre 7 : phrases avec un nom de morceau, une platine, des temps, des points
enDe({ 'MAINTENANT': 'NOW' });
enMotif('de {#n} à {#m} BPM', 'from {n} to {m} BPM');
enMotif('{#n} morceaux · {x} · environ {=d}', '{n} tracks · {x} · about {d}');
enMotif('Calage (35 points) : quand on entend les deux morceaux, ils restent calés à moins de {#n} ms.', 'Sync (35 points): when you can hear both tracks, they stay in sync within {n} ms.');
enMotif('Musique arrêtée : −{#n}. Morceau pas joué : −{#m}.', 'Music stopped: −{n}. Track not played: −{m}.');
enMotif('Technique pas respectée : −{#n}.', 'Technique not followed: −{n}.');
enMotif("Morceau pas écouté au casque avant d'entrer : −{#n}.", 'Track not checked in the headphones before coming in: −{n}.');
enMotif("Tempo qui saute d'un coup : −{#n}. Soirée finie sous {#b} BPM : −{#m}.", 'Tempo jumping all at once: −{n}. Party ending under {b} BPM: −{m}.');
enMotif('★★★ à partir de {#n}, ★★ à partir de {#m}.', '★★★ from {n}, ★★ from {m}.');
enMotif('« {x} » joue. Prépare « {y} » sur B.', '"{x}" is playing. Prepare "{y}" on B.');
enMotif("« {x} » n'est pas parti au bon moment", '"{x}" didn\'t start at the right moment');
enMotif('« {x} » termine le set : laisse-le jouer.', '"{x}" ends the set: let it play.');
enMotif('« {x} » joue seul. Le morceau suivant arrive sur la platine {=k}.', '"{x}" is playing alone. The next track is coming on deck {k}.');
enMotif("« {x} » est dans son break : ce n'est pas la fin, il va repartir. Attends avant de lancer « {y} ».", '"{x}" is in its break: it\'s not the end, it will come back. Wait before starting "{y}".');
enMotif(/^Lance « (.+?) » sur la platine ([AB]) pour que son drop tombe pile à la fin de « (.+?) »( \(regarde où il tomberait, en pointillé\))?(, fader en bas et CUE 🎧 allumé)?\.$/,
  (m, n, k, c, p, q) => `Start "${tr(n)}" on deck ${k} so its drop lands right at the end of "${tr(c)}"${p ? ' (look where it would land, dotted)' : ''}${q ? ', fader down and CUE 🎧 on' : ''}.`);
enMotif('« {x} » est calé : monte son fader sur une phrase.', '"{x}" is in sync: bring up its fader on a phrase.');
enMotif('Cale « {x} » au casque (tempo, puis molette), puis monte son fader.', 'Sync "{x}" in your headphones (tempo, then jog wheel), then bring up its fader.');
enMotif('Cale « {x} » (tempo, puis molette), puis monte son fader sur une phrase.', 'Sync "{x}" (tempo, then jog wheel), then bring up its fader on a phrase.');
enMotif('Tourne le filtre de « {x} » vers la droite, puis baisse son fader.', 'Turn the filter of "{x}" to the right, then pull down its fader.');
enMotif("Allume l'écho sur le dernier temps de « {x} », puis coupe son fader.", 'Turn on the echo on the last beat of "{x}", then cut its fader.');
enMotif("Coupe « {x} » d'un coup quand « {y} » arrive sur son drop.", 'Cut "{x}" in one go when "{y}" hits its drop.');
enMotif('Échange les basses sur une phrase, puis fais sortir « {x} ».', 'Swap the lows on a phrase, then take "{x}" out.');
enMotif('« {x} » attend sur la platine {=k}', '"{x}" is waiting on deck {k}');
// le nom d'un morceau sur la piste (canvas) : « Néon » · 124,0 BPM · s'il part maintenant
enMotif(/^« (.+?) »( · [\d,]+ BPM)?( · s'il part maintenant)?$/, (m, x, b, s) => `"${tr(x)}"${b ? b.replace(',', '.') : ''}${s ? ' · if it starts now' : ''}`);
enMotif("« {x} » et « {y} » n'étaient pas calés pendant {#n} s.", '"{x}" and "{y}" were out of sync for {n} s.');
enMotif("Cale « {x} » avant de monter son fader : le tempo d'abord, puis la molette.", 'Sync "{x}" before bringing up its fader: tempo first, then the jog wheel.');
enMotif('Deux basses en même temps pendant {#n} temps, entre « {x} » et « {y} ».', 'Two basslines at the same time for {n} {n:beat:beats}, between "{x}" and "{y}".');
enMotif('Le son de « {x} » a baissé pendant {#n} temps.', 'The sound of "{x}" dropped for {n} {n:beat:beats}.');
enMotif('Le son a baissé pendant {#n} temps, entre « {x} » et « {y} ».', 'The sound dropped for {n} {n:beat:beats}, between "{x}" and "{y}".');
enMotif("La musique s'est arrêtée après « {x} ».", 'The music stopped after "{x}".');
enMotif(/^« (.+?) » n'est pas parti au bon moment \((\d+) temps (trop tard|trop tôt)\) : son drop doit tomber pile à la fin de « (.+?) »\.$/,
  (m, b, d, s, a) => `"${tr(b)}" didn't start at the right moment (${d} ${+d === 1 ? 'beat' : 'beats'} ${s === 'trop tard' ? 'too late' : 'too early'}): its drop has to land right at the end of "${tr(a)}".`);
enMotif("Les basses sont passées de « {x} » à « {y} » {#n} temps à côté d'une phrase.", 'The bass passed from "{x}" to "{y}" {n} {n:beat:beats} off a phrase.');
enMotif('Entre « {x} » et « {y} », il fallait {z}.', 'Between "{x}" and "{y}", you needed {z}.');
enMotif('« {x} » est entré sans avoir été écouté au casque.', '"{x}" came in without being checked in the headphones.');
enMotif("Le tempo de « {x} » a sauté d'un coup.", 'The tempo of "{x}" jumped all at once.');
enMotif('La soirée a fini à {#n} BPM, au lieu de {#m} ou plus.', 'The party ended at {n} BPM, instead of {m} or more.');
enMotif("{#n} morceaux n'ont pas été joués.", "{n} tracks weren't played.");
enMotif("« {x} » n'a pas été joué.", '"{x}" wasn\'t played.');
enMotif(/^Ça t'a coûté (\d+) points?\.$/, (m, n) => `That cost you ${n} ${+n === 1 ? 'point' : 'points'}.`);
enMotif("C'est ton nouveau record (avant : {=a})", "It's your new record (before: {a})");
enMotif('Ton record : {=a}', 'Your record: {a}');

/* ---------- 13-rekordbox (lot 80, motifs) ---------- */
// Ma musique : les morceaux de texte des modèles, et les phrases avec un titre, un nombre ou une date
enDe({
  'Toutes': 'All', 'Le code de rekordbox : 8A, 9B…': 'The rekordbox code: 8A, 9B…', 'Tous les styles': 'All styles',
  'Playlist rekordbox': 'rekordbox playlist', 'Tes playlists, lues dans ton export.': 'Your playlists, read from your export.',
  'Afficher seulement': 'Show only', 'Effacer les filtres': 'Clear the filters', 'Technique': 'Technique',
  'Ce qui va bien après': 'What goes well next', 'Ambiance': 'Vibe', '‹ Mes morceaux': '‹ My tracks', 'Le morceau qui joue': 'The track playing',
  "Il me manque le tempo ou la tonalité d'un de ces deux morceaux : analyse-les dans rekordbox, puis réexporte ta collection.": "I'm missing the tempo or the key of one of these two tracks: analyze them in rekordbox, then export your collection again.",
  'Choisir une autre transition': 'Choose another transition', '‹ Précédente': '‹ Previous', 'Suivante ›': 'Next ›',
  'La technique conseillée': 'The recommended technique', 'Sur ta table, dans rekordbox': 'On your controller, in rekordbox',
  'Paires gardées': 'Kept pairs', 'Morceaux aimés': 'Liked tracks', 'Paire': 'Pair', 'Fiche': 'Card', 'Ce qui va après': 'What goes next',
  'Exemple': 'Example', 'Ce que tu vas obtenir': "What you'll get",
  'Pour chaque morceau de ta collection : ceux qui vont le mieux après, pourquoi, et la technique pour faire la transition.': 'For each track in your collection: the ones that go best next, why, and the technique for the transition.',
  'Paire du jour': 'Pair of the day', 'Préparer ›': 'Prepare ›', 'Écouter': 'Listen', "M'entraîner sur le site": 'Practice on the site',
  'Voir le tuto': 'Watch the tutorial', 'Faite': 'Done', 'Facile': 'Easy', 'le même': 'the same',
  "montée d'énergie": 'energy boost', 'même tempo': 'same tempo', 'tempos proches': 'close tempos',
  'hier': 'yesterday', "aujourd'hui": 'today',
  'Ajouté': 'Added', 'Titre': 'Title', 'Ce qui va avec ›': 'What goes with it ›', 'Ta fiche offerte ›': 'Your free card ›', 'jamais joué': 'never played'
});
// « Tempos proches (124 et 126 BPM), tonalités voisines (8A et 9A) : … »
enMotif(/^(.+?) \(([\d,.]+) et ([\d,.]+) BPM\), (.+?) \((\S+) et (\S+)\) : ([\s\S]+)$/, (m, t, a, b, c, ka, kb, fin) => `${tr(t)} (${a.replace(',', '.')} and ${b.replace(',', '.')} BPM), ${tr(c)} (${ka} and ${kb}): ${tr(fin)}`);
enMotif("tu peux mélanger longtemps. Coupe les basses de « {=b} », lance-le sur le 1 d'une phrase, puis échange les basses d'un seul geste.", 'you can mix for a long time. Cut the lows of "{b}", start it on the 1 of a phrase, then swap the lows in a single move.');
enMotif('cale « {=b} » sur le tempo de « {=a} » avant de mélanger, puis échange les basses.', 'match "{b}" to the tempo of "{a}" before mixing, then swap the lows.');
enMotif("« {=b} » fait monter l'énergie. Fais-le entrer filtre fermé, et ouvre-le pendant une phrase.", '"{b}" builds the energy. Bring it in with the filter closed, and open it over a phrase.');
enMotif("trop loin pour un long mélange. Fais partir « {=a} » dans l'écho, et lance « {=b} » sur le 1 de la phrase.", 'too far apart for a long blend. Send "{a}" out on the echo, and start "{b}" on the 1 of the phrase.');
// dates : « 12 août », « 12 août 2025 », « Ajouté le … »
const enMois = { 'janv.': 'Jan', 'févr.': 'Feb', 'mars': 'Mar', 'avr.': 'Apr', 'mai': 'May', 'juin': 'Jun', 'juil.': 'Jul', 'août': 'Aug', 'sept.': 'Sep', 'oct.': 'Oct', 'nov.': 'Nov', 'déc.': 'Dec' };
const enDate = (d, mo, y) => `${enMois[mo] || mo} ${d}${y ? ', ' + y : ''}`;
enMotif(/^(\d{1,2}) (janv\.|févr\.|mars|avr\.|mai|juin|juil\.|août|sept\.|oct\.|nov\.|déc\.)(?: (\d{4}))?$/, (m, d, mo, y) => enDate(d, mo, y));
enMotif(/^Ajouté le (\d{1,2}) (janv\.|févr\.|mars|avr\.|mai|juin|juil\.|août|sept\.|oct\.|nov\.|déc\.)(?: (\d{4}))?$/, (m, d, mo, y) => 'Added ' + enDate(d, mo, y));
enMotif('Ajouté {x}', 'Added {x}');
enMotif('il y a {#n} jours', '{n} days ago');
enMotif('il y a {#n} min', '{n} min ago');
enMotif('il y a {#n} h', '{n} h ago');
enMotif(/^Afficher (\d+) morceaux? de plus \((\d+) restants?\)$/, (m, n, r) => `Show ${n} more ${+n === 1 ? 'track' : 'tracks'} (${r} left)`);
enMotif('De {#n} à {#m} BPM', 'From {n} to {m} BPM');
enMotif(/^(\d+) (?:morceau correspond|morceaux correspondent)\. Choisis-en un !$/, (m, n) => `${n} ${+n === 1 ? 'track matches' : 'tracks match'}. Pick one!`);
enMotif('Tonalité {=k}', 'Key {k}');
enMotif('Voir les {#n} autres', 'See the other {n}');
enMotif('Rien ne va vraiment après « {x} ». Essaie un autre morceau !', 'Nothing really goes after "{x}". Try another track!');
enMotif("Voilà les morceaux de ta collection qui vont le mieux après « {x} ». Le premier, c'est un sans-faute.", 'Here are the tracks in your collection that go best after "{x}". The first one is flawless.');
enMotif('Voilà les morceaux de ta collection qui vont le mieux après « {x} ».', 'Here are the tracks in your collection that go best after "{x}".');
enMotif('‹ Ce qui va après « {x} »', '‹ What goes after "{x}"');
enMotif('Platine {=k}', 'Deck {k}');
enMotif('Bravo, les {#n} missions sont faites ! Nouveau badge : {x}.', 'Well done, all {n} missions are done! New badge: {x}.');
enMotif('Bravo, les {#n} missions sont faites !', 'Well done, all {n} missions are done!');
enMotif('Mission {#n} sur {#m}', 'Mission {n} of {m}');
enMotif(/^« (.+?) » puis « (.+?) » : (.+?), (.+?)\. ([\s\S]+)$/, (m, a, b, t, c, dit) => `"${tr(a)}" then "${tr(b)}": ${tr(t)}, ${tr(c)}. ${tr(dit)}`);
enMotif(/^(\d+) (?:favori n'est plus|favoris ne sont plus) dans ta collection\.$/, (m, n) => `${n} ${+n === 1 ? 'favorite is' : 'favorites are'} no longer in your collection.`);
enMotif(/^Tes paires gardées et tes morceaux aimés\. Il te reste (\d+) paires? à terminer !$/, (m, n) => `Your kept pairs and your liked tracks. You have ${n} ${+n === 1 ? 'pair' : 'pairs'} left to finish!`);
enMotif('Tu as vu ta fiche offerte : « {x} ».', 'You\'ve seen your free card: "{x}".');
enMotif('· {#n} avec tempo et tonalité', '· {n} with tempo and key');

/* ---------- 14-verif-reglage (lot 80, motifs) ---------- */
// Vérifier ma table, Régler ma table : phrases avec une étape, un nom de table ou une commande
enMotif('canal {#c}, note {#n}', 'channel {c}, note {n}');
enMotif('canal {#c}, numéro {#n}', 'channel {c}, number {n}');
enMotif('Vérifier ma table · étape {#n} sur {#m}', 'Check my controller · step {n} of {m}');
enMotif('Reçu : {=x}… continue.', 'Received: {x}… keep going.');
enMotif('Aller jouer « {x} »', 'Go play "{x}"');
enMotif(/^(\d+) étapes? sans souci sur (\d+)(?:, (\d+) à regarder)?\. Copie le rapport et envoie-le : il contient tout ce que le site a relevé sur ta table\.$/,
  (m, ok, n, ko) => `${ok} ${+ok === 1 ? 'step' : 'steps'} with no problem out of ${n}${ko ? `, ${ko} to look at` : ''}. Copy the report and send it: it contains everything the site recorded about your controller.`);
enMotif('Reprendre la vérification (étape {#n} sur {#m})', 'Resume the check (step {n} of {m})');
enMotif('Faite le {=d} : tu peux la revoir et copier le rapport.', 'Done on {d}: you can see it again and copy the report.');
enMotif(/^Ça, c'est (.+?), déjà reconnu\. (Appuie plutôt sur|Bouge plutôt) (.+?)\.$/, (m, a, v, b) => `That's ${tr(a)}, already recognized. ${v === 'Bouge plutôt' ? 'Move' : 'Press'} ${tr(b)} instead.`);
enMotif('Régler ma table · {#n} sur {#m}', 'Set up my controller · {n} of {m}');
enMotif('Régler ma table · {=t}', 'Set up my controller · {t}');
enMotif('DJingood connaît maintenant les réglages de la {=t}. On les prend à la place de ceux que tu as réglés à la main ?', 'DJingood now knows the settings of the {t}. Shall we use them instead of the ones you set up by hand?');
enMotif('Tu as branché une {=t} : DJingood connaît ses réglages. On les prend ? Ceux de ta table réglée à la main seront remplacés.', 'You plugged in a {t}: DJingood knows its settings. Shall we use them? The settings of your hand-tuned controller will be replaced.');
enMotif('Tu as branché une {=t} : DJingood connaît ses réglages. On les prend ?', 'You plugged in a {t}: DJingood knows its settings. Shall we use them?');
enMotif('Nouvelle table : « {=t} ». DJingood ne la connaît pas encore : règle-la en une minute, en bougeant chaque commande quand il te le demande.', 'New controller: "{t}". DJingood doesn\'t know it yet: set it up in one minute, by moving each control when it asks you to.');

/* ---------- 16-chapitres (lot 80, motifs) ---------- */
// les chapitres : « titre : sous-titre » (bulle et nom lu à voix haute de la carte des chapitres)
enDe({
  'Caler deux morceaux soi-même, sans SYNC': 'Beatmatch two tracks yourself, without SYNC',
  'Partir au bon endroit, gagner du temps': 'Start in the right place, save time',
  'Des morceaux enchaînés, sans pause': 'Tracks mixed in a row, without a break',
  'Hot cues et boucles': 'Hot cues and loops'
});
enMotif(/^(Les bases|La maîtrise|Les vrais morceaux|Les combos|Le calage|Hot cues et boucles|Le set) : ([^<>]+)$/, (m, t, s) => `${tr(t)}: ${tr(s)}`);

/* ---------- 17-tutos (lot 80, motifs) ---------- */
// les tutos : la table dessinée et les étiquettes de la piste
enPareil('BEAT FX', 'Fashion Diva');
enDe({
  'La table DJ : platine A, table de mixage, platine B': 'The DJ controller: deck A, mixer, deck B',
  'montée de B': "B's build-up", 'intro de B': "B's intro", 'sans basses': 'no lows', 'filtré': 'filtered',
  'LOW = les basses': 'LOW = the lows', 'tout à gauche = coupé': 'all the way left = cut', 'HI = les aigus': 'HI = the highs',
  'MID = les voix, les mélodies': 'MID = vocals, melodies'
});
// les tutos : phrases avec un numéro, un titre ou une durée
enMotif('Étape {#n} sur {#m}', 'Step {n} of {m}');
enMotif('Mesure {#n} sur 8', 'Bar {n} of 8');
enMotif('Plan {#n} / {#m}', 'Shot {n} / {m}');
enMotif('Tuto suivant : {x}', 'Next tutorial: {x}');
enMotif('{x} · tuto {#n} sur {#m}', '{x} · tutorial {n} of {m}');
enMotif('{=d} · avec Vini', '{d} · with Vini');
enMotif("Ici, je t'explique les techniques des DJ, une par une. Commence par « {x} » !", 'Here, I explain DJ techniques, one at a time. Start with "{x}"!');
enMotif('Prochain tuto conseillé : « {x} ».', 'Next suggested tutorial: "{x}".');
enMotif('Musique : {x}', 'Music: {x}');
enMotif('{x} est gratuit.', '{x} is free.');
enMotif('{x} sont gratuits.', '{x} are free.');

/* ---------- 18-releve (lot 80, motifs) ---------- */
// ce que le relevé de toute la suite de tests a trouvé en plus (phrases construites au vol)
enDe({
  'B au casque': 'B in the headphones',
  'Fais le niveau du mieux possible. Tu peux regarder la démo avant.': 'Do the level as well as you can. You can watch the demo first.',
  "Ferme rekordbox, Serato, djay et VirtualDJ : sur Windows, une table ne parle qu'à un seul logiciel à la fois. Puis débranche ta table et rebranche-la.": 'Close rekordbox, Serato, djay and VirtualDJ: on Windows, a controller can only talk to one program at a time. Then unplug your controller and plug it back in.',
  "Ferme rekordbox, Serato, djay et VirtualDJ : sur Windows, une table ne parle qu'à un seul logiciel à la fois. Puis recharge la page.": 'Close rekordbox, Serato, djay and VirtualDJ: on Windows, a controller can only talk to one program at a time. Then reload the page.',
  'GRATUIT': 'FREE', 'Pas commencée': 'Not started', 'Intro (avec basse)': 'Intro (with bass)', 'Intro avec basse': 'Intro with bass',
  "Le défi du jour reprend tes niveaux gratuits, sur d'autres morceaux. Le reste de l'entraînement est dans DJingood Pro.": 'The daily challenge replays your free levels, on other tracks. The rest of practice is in DJingood Pro.',
  "rekordbox n'a pas encore analysé ce morceau : il me manque son tempo ou sa tonalité. Analyse-le dans rekordbox, puis réexporte ta collection.": "rekordbox hasn't analyzed this track yet: I'm missing its tempo or its key. Analyze it in rekordbox, then export your collection again.",
  'Tempo le plus lent': 'Slowest tempo', 'Tempo le plus rapide': 'Fastest tempo',
  "Toujours refusé. Ton navigateur a refusé l'accès à ta table. Pour l'autoriser :": 'Still refused. Your browser refused access to your controller. To allow it:',
  "Voici ce que le site a reconnu. Ce qui manque se fera à l'écran, à la souris. Tu pourras tout refaire depuis « Ma table ». Quelque chose cloche ? « Copier le relevé », et envoie-le-nous : on verra ce que ta table envoie.": 'Here\'s what the site recognized. Whatever\'s missing will be done on screen, with the mouse. You can redo everything from "My controller". Something wrong? "Copy the report", and send it to us: we\'ll see what your controller sends.'
});
enPareil('DROP', 'DROP B', 'PHRASE', 'FADER', 'IN', 'OUT', 'record');
enDe({ 'filtre': 'filter', 'Raté': 'Missed', 'Légende de la démo': 'Demo legend' });
// le set : la pénalité écrite à la suite (« … (−15) », ou « … ! −15 » dans la bulle qui saute)
enMotif(/^([\s\S]+?) \(−(\d+)\)$/, (m, x, n) => `${tr(x)} (−${n})`);
enMotif(/^([\s\S]+?[!.]) −(\d+)$/, (m, x, n) => `${tr(x)} −${n}`);
// le set : la feuille de route (« Néon, après un filtre »)
enMotif(/^([^,<>]{1,30}), après (un swap des basses|un filtre|un écho|une coupure sèche)$/, (m, t, x) => `${tr(t)}, after ${tr(x)}`);
// le calage : le compteur de chaque platine
enMotif(/^([AB]) calé \((\d+) ms\)$/, (m, k, n) => `${k} in sync (${n} ms)`);
// Régler ma table : une commande reconnue, ou pas encore réglée
enMotif("C'est noté : {x} ✓", 'Got it: {x} ✓');
enMotif("{x} (pas encore réglé : bouge-le, le site l'apprend)", '{x} (not set up yet: move it, the site learns it)');
enDe({
  "Joue d'abord un niveau gratuit dans <a href=\"#apprendre\">Apprendre</a> : le défi du jour le reprendra, sur d'autres morceaux. Le reste de l'entraînement est dans DJingood Pro.":
    'First play a free level in <a href="#apprendre">Learn</a>: the daily challenge will replay it, on other tracks. The rest of practice is in DJingood Pro.',
  // les mots dessinés sur les cartes des tutos
  'BASSES': 'BASS', '3 BANDES': '3 BANDS', 'COUPURE': 'CUT', 'SECOURS': 'RESCUE'
});
// Régler ma table : le bilan, une ligne par commande (« ✓ Le fader de volume de gauche : reconnu »)
enMotif(/^([✓•]) (.+?) : (reconnu|à l'écran|pas reconnu|rien reçu)$/, (m, s, nom, e) => `${s} ${tr(nom)}: ${tr(e)}`);
// Ma musique : filtres, playlists, favoris
enMotif('{#n} à {#m} BPM', '{n} to {m} BPM');
enMotif('Enlever le filtre : {x}', 'Remove the filter: {x}');
enMotif('Playlist « {x} »', 'Playlist "{x}"');
enMotif(/^([^<>()]{1,40}) \((\d+)\)$/, (m, x, n) => `${tr(x)} (${n})`);
enMotif('Ajouter à tes favoris : {=x}', 'Add to your favorites: {x}');
enMotif('Retirer de tes favoris : {=x}', 'Remove from your favorites: {x}');
enMotif(/^(\d+) lectures?$/, (m, n) => `${n} ${+n === 1 ? 'play' : 'plays'}`);   // Ma musique : combien de fois le morceau a été joué
enMotif('{#n} morceaux ·', '{n} tracks ·');
enMotif('{#n} morceau ·', '{n} track ·');
enMotif(/^([^<>·]{1,40}) ·$/, (m) => m);   // un nom d'artiste suivi de « · » (avant « jamais joué ») : rien à traduire
// le calage (chapitre 5) : le compteur et les écoutes
enMotif('B en retard de {#n} ms', 'B behind by {n} ms');
enMotif('B en avance de {#n} ms', 'B ahead by {n} ms');
enMotif('Écoute {#n} sur {#m}…', 'Listen {n} of {m}…');
enMotif(/^Écoute (\d+) : (.+?)(?: \((\d+) ms\))?$/, (m, n, x, ms) => `Listen ${n}: ${tr(x)}${ms ? ` (${ms} ms)` : ''}`);
// les corrections
enMotif('A est sorti au temps {#n}, avant le drop.', 'A went out at beat {n}, before the drop.');
enMotif('Filtre lancé au temps {#n}.', 'Filter started at beat {n}.');
enMotif('Les {#n} autres, et un nouveau chaque mois, sont dans DJingood Pro.', 'The other {n}, and a new one every month, are in DJingood Pro.');
// le set : les règles de la note, en une seule phrase (« Tu pars de 100 points. Calage (35 points) : … »)
enMotif('Musique arrêtée : −{#n}.', 'Music stopped: −{n}.');
enMotif('Morceau pas joué : −{#n}.', 'Track not played: −{n}.');
enMotif("Tempo qui saute d'un coup : −{#n}.", 'Tempo jumping all at once: −{n}.');
enMotif('Soirée finie sous {#b} BPM : −{#m}.', 'Party ending under {b} BPM: −{m}.');
enMotifFin(/^(Tu pars de 100 points\. [\s\S]+)$/, (m, s) => s.split(/(?<=\.) (?=[A-ZÀ-Ý★])/).map(tr).join(' '));
// Comprendre : le conseil des écouteurs sans fil, ajouté à la fin du résultat
enMotif(/^([\s\S]+?) Tes frappes arrivent toutes un peu tard : avec des écouteurs sans fil, le son a du retard\. Essaie avec le haut-parleur\.$/,
  (m, a) => tr(a) + ' Your taps all come in a little late: with wireless headphones, the sound lags. Try with the speaker.');
/* ---------- Lot 80 : fin ---------- */

/* ---------- Lot 81 « La caisse » : l'année d'office, le rattrapage, l'essai dès la première réussite, le plan, la source ---------- */
enPareil('TikTok', 'Instagram', 'YouTube');
enDe({
  // index.html : l'essai sur la carte de résultat, la question après le paiement
  'Ça marche avec ta table !': 'It works with your controller!',
  "Voir l'essai gratuit": 'See the free trial',
  'Une dernière question : comment tu as connu DJingood ?': 'One last question: how did you hear about DJingood?',
  'Comment tu as connu DJingood': 'How did you hear about DJingood',
  'Un ami': 'A friend',
  'Autre': 'Other',
  "Merci, ça m'aide beaucoup !": 'Thanks, that really helps!',
  // presentation.html : le titre dit le résultat
  'Ta première vraie transition, en deux semaines.': 'Your first real transition, in two weeks.',
  "Tu as une table et tu n'y connais rien ? Apprends à mixer sur ta table, un geste à la fois, avec ta musique.": "Got a controller and don't know the first thing about it? Learn to mix on your controller, one move at a time, with your own music.",
  // js/pro.js : les formules, le rattrapage
  '4,17 €/mois': '€4.17/month',
  '49,99 € par an': '€49.99 a year',
  "49,99 € pour l'année": '€49.99 for the year',
  'la 1re année': 'the 1st year',
  '4,99 €/mois': '€4.99/month',
  'payé chaque mois': 'billed monthly',
  '34,99 €': '€34.99',
  '/ 1re année': '/ 1st year',
  'Ta première année à 34,99 €': 'Your first year for €34.99',
  '34,99 € pour ta première année': '€34.99 for your first year',
  "L'offre à 34,99 € est terminée : tu peux continuer au prix normal.": 'The €34.99 offer has ended: you can continue at the regular price.',
  // js/niveaux.js
  "Plutôt à l'année (34,99 € la 1re année) ?": 'Yearly instead (€34.99 the 1st year)?'
});
enMotif("<s>49,99 €</s> jusqu'au {=d} à {=h} · ensuite 49,99 € par an", '<s>€49.99</s> until {d} at {h} · then €49.99 a year');
enMotif("Au lieu de 49,99 €, jusqu'au {=d} à {=h}.", 'Instead of €49.99, until {d} at {h}.');
enMotif("Ta première année à 34,99 € au lieu de 49,99 €, jusqu'au {=d} à {=h}.", 'Your first year for €34.99 instead of €49.99, until {d} at {h}.');
enMotif("Essaie tout DJingood {#n} jours, gratuitement : les {#m} exercices, les tutos de Vini, l'entraînement.", "Try all of DJingood free for {n} days: the {m} exercises, Vini's tutorials, practice.");
// le plan des Premiers pas, rappelé dans l'offre (proPlan) : le nom de la table est le même dans les deux langues
enMotif('Ton plan : {=t} · {#m} min par jour', 'Your plan: {t} · {m} min a day');
enMotif('Ton plan : {#m} min par jour', 'Your plan: {m} min a day');
enMotif('Ton plan : {=t}', 'Your plan: {t}');
{ const quand = { 'À ton rythme': 'At your own pace', 'Dans 2 semaines': 'In 2 weeks', 'En moins de 2 semaines': 'In under 2 weeks' };
  const but = { 'ta première vraie transition': 'your first real transition', 'des transitions vraiment propres': 'truly clean transitions', 'un set à 100 sur 100': 'a 100/100 set' };
  for (const q in quand) for (const b in but) EN[trCle(`${q} : ${b}.`)] = `${quand[q]}: ${but[b]}.`; }
/* ---------- Lot 73 : début (la table, dès le début : Premiers pas, liste des tables, « Avant de jouer ») ---------- */
// les tables ajoutées à la liste (tables.js) et leur marque : des noms, gardés tels quels
enPareil('Native Instruments', 'Pioneer DDJ-FLX2', 'Pioneer DDJ-FLX6', 'Pioneer DDJ-FLX10', 'Pioneer DDJ-REV1', 'Pioneer XDJ-AZ',
  'Pioneer XDJ-RX3', 'Pioneer XDJ-RR', 'Hercules DJControl Inpulse T7', 'Numark NS4FX', 'Roland DJ-202',
  'Native Instruments Traktor Kontrol S2 MK3', 'Native Instruments Traktor Kontrol S3', 'Native Instruments Traktor Kontrol S4 MK3',
  'DDJ-FLX2', 'DDJ-FLX6', 'DDJ-FLX10', 'DDJ-REV1', 'XDJ-AZ', 'XDJ-RX3', 'XDJ-RR', 'DDJ-400', 'DDJ-SB3', 'DDJ-200', 'DJ-505', 'DJ-202',
  'DJControl Inpulse 200', 'DJControl Inpulse 300', 'DJControl Inpulse 500', 'MIXTRACK PLATINUM FX', 'DDJ-400, XDJ-RR');
enDe({
  // Premiers pas : le champ « Une autre table » et ce qui attend la table choisie
  'La marque et le modèle de ta table': "Your controller's brand and model",
  'Sa marque et son modèle, par exemple Denon MC7000': 'Its brand and model, for example Denon MC7000',
  'Reconnue toute seule': 'Recognized on its own',
  'Branchée · réglée': 'Plugged in · set up',
  'reconnu': 'recognized',   // (d'avant le lot 73) le bilan d'un réglage : « ✓ Le potard LOW de gauche : reconnu »
  "Branche-la en USB : je la reconnais sans réglage, et on vérifie ensemble qu'elle répond.": "Plug it in over USB: I recognize it with no setup, and we check together that it responds.",
  "Branche-la sur ton ordinateur : je la reconnais sans réglage, et on vérifie ensemble qu'elle répond.": "Plug it into your computer: I recognize it with no setup, and we check together that it responds.",
  'Son mode MIDI, puis 30 secondes de réglage': 'Its MIDI mode, then 30 seconds of setup',
  'Débranche-la, tiens le bouton FLX de gauche enfoncé et rebranche-la : ses pads clignotent en vert (il lui faut sa dernière mise à jour). Ensuite, je te guide bouton par bouton.':
    'Unplug it, hold down the left FLX button and plug it back in: its pads flash green (it needs its latest update). Then I guide you button by button.',
  'Pas encore compatible': 'Not compatible yet',
  "Elle n'envoie pas de MIDI, le langage des tables DJ : ton navigateur ne peut pas me la montrer. Tous les exercices marchent à la souris en attendant.":
    "It doesn't send MIDI, the language of DJ controllers: your browser can't show it to me. Every exercise works with the mouse in the meantime.",
  "Elle n'envoie pas de MIDI, le langage des tables DJ : ton navigateur ne peut pas me la montrer. Tous les exercices marchent au doigt et à la souris en attendant.":
    "It doesn't send MIDI, the language of DJ controllers: your browser can't show it to me. Every exercise works by touch or with the mouse in the meantime.",
  '30 secondes de réglage': '30 seconds of setup',
  '30 secondes de réglage sur ton ordi': '30 seconds of setup on your computer',
  'La première fois que tu la branches, je te guide bouton par bouton.': 'The first time you plug it in, I guide you button by button.',
  'Je te guiderai pour la régler': "I'll guide you through setting it up",
  "Quand tu la brancheras, je te guide bouton par bouton. Dis-moi laquelle : ça m'aide à savoir quelles tables ajouter.":
    "When you plug it in, I guide you button by button. Tell me which one: it helps me know which controllers to add.",
  "Sur ton ordinateur, je te guide bouton par bouton. Dis-moi laquelle : ça m'aide à savoir quelles tables ajouter.":
    "On your computer, I guide you button by button. Tell me which one: it helps me know which controllers to add.",
  // Premiers pas : ce que dit Vini, table branchée
  "Ta table m'envoie des signaux, mais pas ceux que j'attendais. On règle ce bouton ensemble ?": "Your controller is sending me signals, but not the ones I expected. Shall we set up this button together?",
  'On règle ce bouton ensemble : bouge le fader de gauche sur ta table.': "Let's set up this button together: move the left fader on your controller.",
  'Bien ! Maintenant, le fader de droite.': 'Nice! Now, the right fader.',
  'Dernier bouton : le PLAY de droite.': 'Last button: the right PLAY.',
  'Je vois ta table, mais je ne la connais pas encore. On règle ses 3 premiers boutons : 30 secondes !': "I can see your controller, but I don't know it yet. Let's set up its first 3 buttons: 30 seconds!",
  "C'est réglé ! Tes 3 premiers exercices marcheront avec ta table.": 'All set! Your first 3 exercises will work with your controller.',
  'Pas de souci : tu joueras à la souris en attendant.': "No problem: you'll play with the mouse in the meantime.",
  'Pas de souci : si un bouton ne répond pas dans un exercice, tu pourras jouer à la souris.': "No problem: if a button doesn't respond in an exercise, you can play with the mouse.",
  "Je l'ai vu bouger : ta table et moi, on se parle !": 'I saw it move: your controller and I are talking!',
  "Tu as bougé le fader ? Rien ne m'arrive de ta table. Si rekordbox (ou un autre logiciel de DJ) est ouvert, ferme-le, puis débranche ta table et rebranche-la.":
    'Did you move the fader? Nothing is reaching me from your controller. If rekordbox (or another DJ app) is open, close it, then unplug your controller and plug it back in.',
  "Ce bouton-là, je ne le connais pas encore. Si c'est ton fader de gauche, clique sur « Le dessin ne bouge pas ? ».": 'I don\'t know that button yet. If it\'s your left fader, click "The drawing doesn\'t move?".',
  // Premiers pas : le test de 5 secondes et le réglage des 3 premiers boutons
  'Bouge le fader de gauche': 'Move the left fader',
  'Monte-le tout en haut, puis redescends-le : regarde le dessin.': 'Push it all the way up, then bring it back down: watch the drawing.',
  "Rien ne m'arrive de ta table pour l'instant.": 'Nothing is reaching me from your controller yet.',
  'Le dessin ne bouge pas ?': "The drawing doesn't move?",
  "Je n'ai pas ce bouton": "I don't have this button",
  'On verra ça dans les exercices': "We'll see in the exercises",
  'Ta table répond !': 'Your controller responds!',
  "Si ton fader ne répond pas, clique sur « Je joue à la souris cette fois » dans l'exercice. Tu pourras régler ta table depuis « Ma table ».":
    'If your fader doesn\'t respond, click "I\'ll play with the mouse this time" in the exercise. You can set up your controller from "My controller".',
  'Elle et moi, on se parle : tes exercices marcheront avec elle.': "We're talking: your exercises will work with it.",
  "C'est réglé !": 'All set!',
  'On la réglera plus tard': "We'll set it up later",
  "Tes 3 premiers exercices marcheront avec ta table. Les autres boutons, je te les ferai régler juste avant l'exercice qui s'en sert.":
    "Your first 3 exercises will work with your controller. I'll have you set up the other buttons right before the exercise that uses them.",
  'Tu joueras à la souris en attendant. Tu pourras régler ta table depuis « Ma table ».': 'You\'ll play with the mouse in the meantime. You can set up your controller from "My controller".',
  // l'arrivée sur l'ordinateur par le lien (compte.js) et la position de départ d'un niveau (midi.js)
  'Réglée': 'Set up',
  'À régler : 30 secondes': 'To set up: 30 seconds',
  'tu le régleras en cliquant sur « Jouer »': 'you\'ll set it up when you click "Play"',
  // « Ta table n'apparaît pas ? » (midi.js) : l'XDJ-RR et les Traktor ajoutés
  "Table tout-en-un, avec un écran (XDJ-AZ, XDJ-RR, XDJ-RX3, XDJ-XZ…) : vérifie qu'elle est en mode ordinateur. Sur l'XDJ-AZ : bouton SOURCE, puis SOFTWARE CONTROL.":
    "All-in-one system with a screen (XDJ-AZ, XDJ-RR, XDJ-RX3, XDJ-XZ…): check that it's in computer mode. On the XDJ-AZ: SOURCE button, then SOFTWARE CONTROL.",
  "Table tout-en-un, avec un écran (XDJ-AZ, XDJ-RR, XDJ-RX3, XDJ-XZ…) : passe-la en mode ordinateur. Sur l'XDJ-AZ : bouton SOURCE, puis SOFTWARE CONTROL. Traktor S2 MK3 ou S3 : débranche-la, puis rebranche-la en tenant le bouton FLX de gauche (son mode MIDI).":
    'All-in-one system with a screen (XDJ-AZ, XDJ-RR, XDJ-RX3, XDJ-XZ…): switch it to computer mode. On the XDJ-AZ: SOURCE button, then SOFTWARE CONTROL. Traktor S2 MK3 or S3: unplug it, then plug it back in while holding the left FLX button (its MIDI mode).',
  "Sur Windows, certaines tables demandent d'installer leur pilote, sur le site de la marque (souvent les tables tout-en-un, comme l'XDJ-AZ ou l'XDJ-RR). La DDJ-FLX4 et la plupart des petites tables n'en ont pas besoin.":
    "On Windows, some controllers need their driver installed, from the brand's website (often all-in-one systems, like the XDJ-AZ or the XDJ-RR). The DDJ-FLX4 and most small controllers don't need one.",
  // Régler ma table : un seul bouton à la fois, « Avant de jouer », l'arrivée sur l'ordinateur
  'le potard MID de droite': 'the right MID knob', 'le potard HI de gauche': 'the left HI knob', 'le potard HI de droite': 'the right HI knob',
  'le potard TRIM de gauche': 'the left TRIM knob', 'le potard TRIM de droite': 'the right TRIM knob', 'le filtre de droite': 'the right filter',
  'le crossfader': 'the crossfader', 'le tempo de gauche': 'the left tempo fader', 'le tempo de droite': 'the right tempo fader',
  'le bouton PLAY de gauche': 'the left PLAY button', 'le bouton CUE de gauche': 'the left CUE button', 'le bouton CUE de droite': 'the right CUE button',
  'le CUE casque de gauche': 'the left headphone CUE', 'le CUE casque de droite': 'the right headphone CUE', 'une autre commande': 'another control',
  'Avant de jouer': 'Before you play',
  "Ces boutons se feront à l'écran": 'These buttons will be done on screen',
  "C'est noté pour ta table. Ce qui manque se fera à l'écran, à la souris.": "Got it for your controller. Whatever's missing will be done on screen, with the mouse.",
  "Pas de souci : tu les feras à l'écran, à la souris. Tu pourras les régler plus tard depuis « Ma table ».": 'No problem: you\'ll do them on screen, with the mouse. You can set them up later from "My controller".',
  "Voici ce que le site a reconnu. Les autres boutons, je te les ferai régler juste avant l'exercice qui s'en sert.": "Here's what the site recognized. I'll have you set up the other buttons right before the exercise that uses them.",
  'Continuer à la souris': 'Continue with the mouse',
  // la page de présentation
  'Une table DJ branchée en USB, et un casque ou des enceintes. Le site reconnaît tout seul une quinzaine de tables de débutant (Pioneer, Hercules, Numark, Roland, Reloop) ; une autre table se règle en 30 secondes, dès le premier branchement.':
    'A DJ controller plugged in over USB, and headphones or speakers. The site recognizes about fifteen beginner controllers on its own (Pioneer, Hercules, Numark, Roland, Reloop); any other controller takes 30 seconds to set up, the first time you plug it in.',
  "Le site reconnaît tout seul une quinzaine de tables de débutant (Pioneer DDJ-FLX4, DDJ-400, DDJ-SB3, DDJ-200 et XDJ-RR, Hercules Inpulse 200, 300 et 500 et Starlight, Numark Mixtrack Platinum FX et Pro FX, Party Mix et DJ2GO2 Touch, Roland DJ-505, Reloop Mixage). Si tu branches une table qu'il ne connaît pas encore, il la règle avec toi dès le début, en 30 secondes : il te montre un bouton, tu le bouges, il le reconnaît ; les autres boutons se règlent juste avant l'exercice qui s'en sert. Une commande que ta table n'a pas se fait à la souris. Les Traktor S2 MK3 et S3 ont un mode MIDI (on les branche en tenant le bouton FLX de gauche) : elles devraient pouvoir se régler aussi, dis-nous si ça marche ; la S4 MK3 n'en a pas, elle ne peut pas encore servir. Les réglages de ces tables viennent de leur documentation : dis-nous si quelque chose ne marche pas avec la tienne.":
    "The site recognizes about fifteen beginner controllers on its own (Pioneer DDJ-FLX4, DDJ-400, DDJ-SB3, DDJ-200 and XDJ-RR, Hercules Inpulse 200, 300 and 500 and Starlight, Numark Mixtrack Platinum FX and Pro FX, Party Mix and DJ2GO2 Touch, Roland DJ-505, Reloop Mixage). If you plug in a controller it doesn't know yet, it sets it up with you right from the start, in 30 seconds: it shows you a button, you move it, it recognizes it; the other buttons get set up right before the exercise that uses them. A control your controller doesn't have is done with the mouse. The Traktor S2 MK3 and S3 have a MIDI mode (you plug them in while holding the left FLX button): they should be able to be set up too, let us know if it works; the S4 MK3 doesn't have one, so it can't be used yet. The settings for these controllers come from their documentation: let us know if something doesn't work with yours."
});
// ce que dit Vini d'une table choisie dans la liste, selon ce qui l'attend
enMotif('Ah, la {=n}… Je ne sais pas encore lui parler.', "Ah, the {n}… I don't know how to talk to it yet.");
enMotif('Ah, la {=n}… Je ne sais pas encore lui parler. Tout marche au doigt et à la souris en attendant.', "Ah, the {n}… I don't know how to talk to it yet. Everything works by touch or with the mouse in the meantime.");
enMotif('La {=n} ! Sur ton ordinateur, on la passera en mode MIDI, puis on la réglera ensemble.', "The {n}! On your computer, we'll switch it to MIDI mode, then set it up together.");
enMotif('La {=n} ! Branche-la en mode MIDI, et on la réglera ensemble.', "The {n}! Plug it in in MIDI mode, and we'll set it up together.");
enMotif('La {=n} ! On la réglera ensemble sur ton ordinateur : 30 secondes.', "The {n}! We'll set it up together on your computer: 30 seconds.");
enMotif('La {=n} ! Je ne la connais pas encore : quand tu la brancheras, on la réglera ensemble, en 30 secondes.', "The {n}! I don't know it yet: when you plug it in, we'll set it up together, in 30 seconds.");
enMotif('Je la reconnais : ta {=n} ! Bouge le fader de gauche, pour voir.', "I recognize it: your {n}! Move the left fader, let's see.");
// une table tout-en-un : la phrase de son statut, suivie du conseil du mode ordinateur
enMotif(/^(.+?) C'est une table tout-en-un : mets-la en mode ordinateur\.$/, (m, a) => tr(a) + " It's an all-in-one system: switch it to computer mode.");
// Régler ma table : une commande déjà réglée à la main (le mode qui garde les autres réglages)
enMotif(/^Ça, c'est (.+?), déjà réglé\. (Appuie plutôt sur|Bouge plutôt) (.+?)\.$/, (m, a, v, b) => `That's ${tr(a)}, already set up. ${v === 'Bouge plutôt' ? 'Move' : 'Press'} ${tr(b)} instead.`);
enMotif('Avant de jouer · {#n} sur {#m}', 'Before you play · {n} of {m}');
enMotif(/^Ce niveau se sert d'un bouton que ta table ne m'a pas encore montré\. (.+)$/, (m, a) => "This level uses a button your controller hasn't shown me yet. " + tr(a));
// la fin d'un réglage : le bilan, puis « Quelque chose cloche ? … » (les deux phrases se suivent dans le même paragraphe)
enMotif(/^(.+?) Quelque chose cloche \? « Copier le relevé », et envoie-le-nous : on verra ce que ta table envoie\.$/,
  (m, a) => tr(a) + ' Something wrong? "Copy the report", and send it to us: we\'ll see what your controller sends.');
enMotif('Nouvelle table : « {=t} ». DJingood ne la connaît pas encore : règle-la pas à pas, en bougeant chaque commande quand il te le demande.', 'New controller: "{t}". DJingood doesn\'t know it yet: set it up step by step, by moving each control when it asks you to.');
enMotif('Recopie ce lien : {=u}', 'Copy this link: {u}');   // (d'avant le lot 73) le lien de Chrome, quand la copie n'a pas marché
// le rapport des testeurs : une table tapée qui n'est pas dans la liste
enMotif(/^une table \(pas dans la liste : (.{1,40})\)$/, (m, x) => `a controller (not in the list: ${x})`);
/* ---------- Lot 73 : fin ---------- */

/* ---------- Lot 83 « La page d'accueil » (index.html, #vitrine ; js/vitrine.js) ---------- */
enPareil('DJingood', 'DJingood Pro');
enDe({
  // le titre posé sur la vidéo (habillage « moins IA », 23 nov.) : traduit d'un bloc, avec ses retours à la ligne
  'Apprends <span class="vt-ensemble">à mixer</span><br>sur ta table,<br>en jouant': 'Learn <span class="vt-ensemble">to mix</span><br>on your controller,<br>by playing',
  "C'est parti": "Let's go",
  'Gratuit · rien à installer': 'Free · nothing to install',
  'Voir la vidéo': 'Watch the video',   // moins d'animations demandées : le bouton qui lance la vidéo (gardien)
  'Mettre en pause': 'Pause',
  "Commence ici, joue avec ta table sur l'ordi.": 'Start here, play with your controller on your computer.',
  "Une vraie partie : les gestes sur la table, le jeu à l'écran": 'A real game: the moves on the controller, the game on screen',
  'Le site reconnaît la table branchée': 'The site recognizes the plugged-in controller',
  'Branche ta table': 'Plug in your controller',
  "Une partie : la piste qui défile et la table à l'écran": 'A game: the scrolling track and the controller on screen',
  'Suis la piste': 'Follow the track',
  'Vini te note': 'Vini scores you',
  'Gratuit pour commencer.': 'Free to start.',
  'Gratuit': 'Free',
  '0 €': '€0',
  'pour toujours': 'forever',
  '7 leçons sans table': '7 lessons without a controller',
  'Le défi du jour': 'The daily challenge',
  '4,17 €': '€4.17',
  'par mois': 'a month',
  '49,99 € par an · ou 4,99 € par mois': '€49.99 a year · or €4.99 a month',
  '7 jours gratuits': '7 days free',
  "Les chapitres 2 à 7, jusqu'au vrai set": 'Chapters 2 to 7, up to a real set',   // lot 82 : le chapitre 1 est offert
  'Tout le chapitre 1 avec ta table': 'All of chapter 1 with your controller',
  'Tous les tutos de Vini': "All of Vini's tutorials",
  'Ta musique, avec rekordbox': 'Your music, with rekordbox',
  'Questions': 'Questions',
  "Je n'y connais rien, c'est pour moi ?": "I know nothing about it. Is it for me?",
  "Oui. On commence par apprendre à compter la musique, puis un seul geste par niveau. Vini t'explique chaque bouton juste avant de t'en servir.":
    'Yes. You start by learning to count the music, then one move per level. Vini explains each button right before you use it.',
  'Ça marche avec ma table ?': 'Does it work with my controller?',
  'Les tables de débutant les plus courantes (Pioneer, Hercules, Numark, Roland, Reloop) sont reconnues toutes seules. Une autre se règle avec toi en 30 secondes.':
    'The most common beginner controllers (Pioneer, Hercules, Numark, Roland, Reloop) are recognized on their own. Any other one is set up with you in 30 seconds.',
  "C'est gratuit ?": 'Is it free?',
  'Oui pour commencer, sans carte bancaire. Pour la suite, Pro a 7 jours gratuits : un mail te prévient 2 jours avant la fin, et tu arrêtes quand tu veux dans « Mon compte ».':
    'Yes to start, no credit card. For the rest, Pro has 7 days free: an email warns you 2 days before the end, and you cancel anytime in "My account".',
  'En combien de temps je sais mixer ?': 'How long until I can mix?',
  'Ta première transition, dès ta première séance. Avec 10 minutes par jour, tes premières vraies transitions propres en deux semaines.':
    'Your first transition, in your very first session. With 10 minutes a day, your first real clean transitions in two weeks.',
  "J'ai déjà rekordbox, ça sert à quoi ?": 'I already have rekordbox. What is this for?',
  'rekordbox (ou Serato) sert à mixer, pas à apprendre. DJingood te fait faire chaque geste sur ta table et te dit ce qui cloche.':
    "rekordbox (or Serato) is for mixing, not for learning. DJingood has you do each move on your controller and tells you what's off.",
  'Il me faut quoi ?': 'What do I need?',
  'Ta table branchée en USB, un ordinateur (PC ou Mac) avec Chrome ou Edge, et un casque ou des enceintes. Rien à installer. Sur téléphone, tu peux déjà faire 7 leçons sans table.':
    'Your controller plugged in over USB, a computer (PC or Mac) with Chrome or Edge, and headphones or speakers. Nothing to install. On a phone, you can already do 7 lessons without a controller.',
  'CGV': 'Terms'
});
enMotif('Tes {#n} premiers niveaux avec ta table', 'Your first {n} levels with your controller');
/* ---------- Lot 83 : fin ---------- */
/* ---------- Lot 82 « Le chapitre 1 offert » : la grande carte du niveau 7, la démo d'un chapitre fermé, les textes ---------- */
enDe({
  // index.html : la grande carte du niveau 7
  '<span class="pro-tag">Pro</span>La suite : mixer seul': '<span class="pro-tag">Pro</span>Next: mixing on your own',
  'La suite : mixer seul': 'Next: mixing on your own',
  'Et aussi : les combos, les hot cues et les boucles.': 'Plus: combos, hot cues and loops.',
  'Ta première transition complète !': 'Your first complete transition!',
  'Caler sans SYNC': 'Beatmatch without SYNC',
  'Ton premier set': 'Your first set',
  // la carte d'un niveau de Pro, la barre de la démo
  'Voir la démo': 'Watch the demo',
  'Démo': 'Demo',
  // (d'avant le lot 82) l'étiquette du chapitre 2, que la démo montre maintenant à tout le monde
  'précision serrée': 'tight timing',
  // la fenêtre Pro
  'Les chapitres 2 à 7': 'Chapters 2 to 7',
  "exercices de plus : à l'oreille, le calage, les hot cues, le set noté sur 100.": 'more exercises: by ear, beatmatching, hot cues, the set scored out of 100.',
  'VRAIS MORCEAUX': 'REAL TRACKS',
  'Tu as fini le chapitre 1': "You've finished chapter 1",
  'Le chapitre 1 est gratuit. Vérifie que ta table marche avec DJingood avant de payer quoi que ce soit.': 'Chapter 1 is free. Check that your controller works with DJingood before paying anything.',
  'Le chapitre 1 est gratuit, sur ordinateur. Vérifie que ta table marche avec DJingood avant de payer quoi que ce soit.': 'Chapter 1 is free, on a computer. Check that your controller works with DJingood before paying anything.',
  // js/niveaux.js, js/parcours.js
  'Ce niveau est dans DJingood Pro. Le chapitre 1 est gratuit.': 'This level is in DJingood Pro. Chapter 1 is free.',
  "Bravo, tu as fini le chapitre 1. La suite : à l'oreille, avec de vrais morceaux, sans SYNC.": "Well done, you've finished chapter 1. Next: by ear, with real tracks, without SYNC.",
  'Refais les 7 gestes sur d’autres morceaux : un défi par jour, gratuit.': 'Replay the 7 moves on other tracks: one free challenge a day.',
  // la fenêtre Pro, plus visuelle
  '7 jours gratuits': '7 days free',
  '1er mois offert · sans carte': '1st month free · no card',
  'Aujourd’hui': 'Today',
  'Gratuit': 'Free',
  'Jour 5': 'Day 5',
  'Rappel': 'Reminder',
  'Jour 7': 'Day 7',
  'Ton essai gratuit': 'Your free trial',
  'exercices': 'exercises',
  'tutos, un nouveau chaque mois': 'tutorials, a new one every month',
  'avec ta collection rekordbox': 'with your rekordbox collection',
  'Le chapitre 1 est gratuit : vérifie que ta table marche.': 'Chapter 1 is free: check that your controller works.',
  'Le chapitre 1 est gratuit, sur ordinateur : vérifie que ta table marche.': 'Chapter 1 is free, on a computer: check that your controller works.',
  // js/premiers.js : le plan du Grand débutant
  'Les 7 gestes du chapitre 1': 'The 7 moves of chapter 1',
  "Jusqu'à ta première transition complète, avec ta table.": 'Up to your first complete transition, with your controller.',
  "À l'oreille, sans SYNC": 'By ear, without SYNC',
  'Avec de vrais morceaux, sans compte à rebours.': 'With real tracks, no countdown.',
  'Les combos, le calage, les hot cues.': 'Combos, beatmatching, hot cues.',
  "À l'oreille, le calage, les hot cues, jusqu'au set noté sur 100.": 'By ear, beatmatching, hot cues, all the way to the set scored out of 100.'
});
enMotif('Voir la démo du chapitre {#n}', 'Watch the chapter {n} demo');
enMotif('Chapitre 1 terminé · {#n} ★', 'Chapter 1 done · {n} ★');
enMotif("{#n} jours gratuits, puis {x}. Rien n'est prélevé avant le {#m}e jour.", '{n} days free, then {x}. Nothing is charged before day {m}.');
// la page de présentation (lot 82 : tout le chapitre 1 gratuit)
enDe({
  '<b>Tout le chapitre 1 gratuit</b> · puis 4,99 € par mois, sans engagement · rien à installer': '<b>All of chapter 1 free</b> · then €4.99 a month, no commitment · nothing to install',
  'Tout le chapitre 1 gratuit': 'All of chapter 1 free',
  "Les 7 leçons « Comprendre », sans table. Tout le chapitre 1 avec ta table, jusqu'à ta première transition complète. Le défi du jour et un tuto. Dans « Ma musique », l'import de ta collection et la fiche d'un de tes morceaux.":
    'The 7 "Understand" lessons, no controller needed. All of chapter 1 with your controller, up to your first complete transition. The daily challenge and a tutorial. In "My music", importing your collection and the card for one of your tracks.',
  "Pour commencer, oui : les 7 leçons « Comprendre », tout le chapitre 1 avec ta table (7 niveaux), le défi du jour, un tuto, et dans « Ma musique » l'import de ta collection et la fiche d'un de tes morceaux sont gratuits. La suite (les chapitres 2 à 7, tous les tutos, l'entraînement, le reste de Ma musique) est dans DJingood Pro, à 4,99 € par mois ou 49,99 € par an, sans engagement : tu arrêtes en deux clics.":
    'To start, yes: the 7 "Understand" lessons, all of chapter 1 with your controller (7 levels), the daily challenge, a tutorial, and in "My music" importing your collection and the card for one of your tracks are free. The rest (chapters 2 to 7, all the tutorials, practice, the rest of My music) is in DJingood Pro, at €4.99 a month or €49.99 a year, no commitment: you cancel in two clicks.'
});
enDe({
  "Ou 49,99 € par an, sans engagement. Les chapitres 2 à 7, tous les tutos de Vini, l'entraînement et Ma musique.": "Or €49.99 a year, no commitment. Chapters 2 to 7, all of Vini's tutorials, practice and My music.",
  '<span class="pro-tag">Pro</span>Avec DJingood Pro, comme les chapitres 2 à 7 et tous les tutos.': '<span class="pro-tag">Pro</span>With DJingood Pro, like chapters 2 to 7 and all the tutorials.',
  'Avec DJingood Pro, comme les chapitres 2 à 7 et tous les tutos.': 'With DJingood Pro, like chapters 2 to 7 and all the tutorials.'
});
/* ---------- Lot 82 : fin ---------- */

trPage();
