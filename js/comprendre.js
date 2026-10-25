// « Comprendre » (lot 48) : sept petites leçons de théorie, sans table, au doigt sur un téléphone (à la souris ou avec la
// barre d'espace sur un ordinateur). Pour les visiteurs qui arrivent de TikTok sur leur téléphone : ils n'ont pas leur table
// sous la main, mais ils peuvent déjà apprendre à entendre les temps, les phrases et les parties d'un morceau.
// Tous les fichiers de js/ partagent la même portée et sont chargés dans l'ordre indiqué dans index.html.
'use strict';
/* ---------- Comment c'est fait ----------
   - Une leçon (CP_LECONS) est une liste de cartes : `explique` (une phrase de Vini, un son à écouter), `tape` (taper en
     rythme : sur chaque temps, sur le « 1 », ou quand la phrase change), `choix` (écoute et choisis, ou une question) et
     `ordre` (remettre dans l'ordre). La fenêtre reprend le cadre des Premiers pas (classes `pp-…`).
   - Les sons sont fabriqués ici, à la volée, par une petite boîte à rythmes (cpJoue) : grosse caisse, charleston, clap,
     basse, accords, nappe, cymbale. Rien à télécharger ni à calculer à l'avance : le son part tout de suite, même sur un téléphone.
   - Note : 3 étoiles si tous les exercices sont justes du premier coup, 2 à partir de 60 %, 1 sinon. 10 XP par étoile.
     `coach-comprendre` ({ numéro de leçon: étoiles }) suit le compte comme les autres étoiles (cptPoids dans compte.js).
   - Sur un téléphone, ou un navigateur qui ne sait pas parler aux tables (cpMobile), « Comprendre » passe en tête du parcours
     (cpEtape, lu par parcoursEtapes) et les Premiers pas y mènent. Sur un ordinateur, rien n'est imposé : les leçons sont
     en haut d'« Apprendre », repliées (choix de l'utilisateur, 25 oct. 2026). */
const CP_KEY = 'coach-comprendre', CP_XP = 10, CP_BPM = 124;
let cpStars = {}; try { cpStars = cleanBank(JSON.parse(localStorage.getItem(CP_KEY) || '{}')); } catch (e) {}
const cpMobile = () => midiEtat === 'absent' || matchMedia('(pointer: coarse) and (max-width: 900px)').matches;
const cpEtape = () => cpMobile();
const cpEtoiles = () => sumStars(cpStars);
const cpXp = () => cpEtoiles() * CP_XP;
const cpFaite = i => (cpStars[i] || 0) >= 1;

/* ---------- Les leçons ---------- */
const cpM = (n, o = {}) => Object.assign({ n, bpm: CP_BPM }, o);
const CP_TOUT = { kick: true, hat: true, clap: true, basse: true, accords: true };
const cpE = (dit, son, o = {}) => Object.assign({ t: 'explique', dit, son }, o);
const cpT = (mode, titre, sous, son, o = {}) => Object.assign({ t: 'tape', mode, titre, sous, son }, o);
const cpC = (titre, options, bonne, juste, faux, o = {}) => Object.assign({ t: 'choix', titre, options: options.map(x => typeof x === 'string' ? { t: x } : x), bonne, juste, faux }, o);
const cpO = (titre, items, juste, faux) => ({ t: 'ordre', titre, items, juste, faux });
const CP_LECONS = [
  { titre: 'Le temps', sous: 'Le « boum » qui ne s’arrête jamais',
    retenir: 'Un temps, c’est un « boum » de la grosse caisse. Les DJ comptent les temps pour savoir quand lancer le morceau suivant.',
    cartes: [
      cpE('Dans la house, la grosse caisse frappe toujours au même rythme. Chaque « boum », c’est un temps.', cpM(8, { kick: true }), { points: true }),
      cpE('Tout le reste se cale sur ces temps : les « tss » entre deux « boum », le clap, la basse.', cpM(8, { kick: true, hat: true, clap: true, basse: true }), { points: true }),
      cpT('temps', 'Tape sur chaque « boum »', '8 temps. Les ronds comptent avec toi au début.', cpM(12, { kick: true, hat: true })),
      cpC('Lequel garde toujours le même écart ?', [{ t: 'Morceau A', son: cpM(8, { kick: true, irregulier: true }) }, { t: 'Morceau B', son: cpM(8, { kick: true }) }], 1,
        'Bien entendu ! En B, chaque « boum » tombe pile au même écart. C’est ce qui permet de compter.',
        'C’est B : écoute A, certains « boum » arrivent trop tôt ou trop tard.'),
      cpT('temps', 'Encore, sans les ronds', 'Cette fois, seulement avec tes oreilles.', cpM(12, { kick: true, hat: true, clap: true }), { sansAide: true })
    ] },
  { titre: 'Compter jusqu’à 4', sous: 'Trouver le « 1 »',
    retenir: '4 temps font 1 mesure. Le « 1 » est le temps fort : c’est souvent là que la musique change.',
    cartes: [
      cpE('Les temps vont par 4 : 1, 2, 3, 4, et on recommence. Ces 4 temps forment une mesure.', cpM(16, { kick: true, hat: true }), { points: true }),
      cpE('Le « 1 » est le temps fort. Ici, une cymbale le marque à chaque mesure.', cpM(16, { kick: true, hat: true, clap: true, cymbale1: true }), { points: true }),
      cpC('Combien de temps dans une mesure ?', ['4', '8', '2'], 0, 'Oui : 4 temps, puis on repart sur le « 1 ».', 'C’est 4 : 1, 2, 3, 4, puis on repart sur le « 1 ».'),
      cpT('un', 'Tape seulement sur le « 1 »', 'Une fois par mesure, avec la cymbale.', cpM(20, { kick: true, hat: true, cymbale1: true })),
      cpC('Sur quel temps tombe la cymbale ?', ['Le 1', 'Le 2', 'Le 3', 'Le 4'], 2, 'Bien compté : 1, 2, la cymbale sur le 3, puis 4.',
        'Elle tombe sur le 3 : compte 1, 2, 3, 4 avec les ronds pendant l’écoute.', { son: cpM(8, { kick: true, hat: true, cymbale: 2 }), points: true })
    ] },
  { titre: 'La vitesse', sous: 'Le BPM',
    retenir: 'Le BPM, c’est le nombre de temps par minute. Deux morceaux se mélangent bien quand ils vont au même BPM.',
    cartes: [
      cpE('Le BPM, c’est le nombre de temps par minute. À 124 BPM, la grosse caisse frappe 124 fois par minute.', cpM(8, { kick: true, hat: true, clap: true, basse: true }), { points: true }),
      cpC('Lequel va le plus vite ?', [{ t: 'Morceau A', son: cpM(8, { kick: true, hat: true, clap: true, bpm: 116 }) }, { t: 'Morceau B', son: cpM(8, { kick: true, hat: true, clap: true, bpm: 130 }) }], 1,
        'Bien entendu ! B est à 130 BPM, A à 116 : B fait 14 « boum » de plus par minute.',
        'C’est B : 130 BPM contre 116. L’écart entre deux « boum » y est plus court.'),
      cpC('Ces deux-là vont-ils à la même vitesse ?', ['Oui', 'Non'], 0, 'Oui : les deux sont à 124 BPM. C’est ce qui permet de les mélanger.',
        'Si : les deux sont à 124 BPM. Les sons changent, mais les « boum » tombent au même rythme.',
        { son: [cpM(8, { kick: true, hat: true }), cpM(8, { kick: true, clap: true, basse: true, nappe: true })], ecoute: 'Le premier, puis le second' }),
      cpC('Pour mélanger deux morceaux, il faut qu’ils aillent…', ['À la même vitesse', 'Au même volume', 'Dans le même style'], 0,
        'Oui : sinon leurs « boum » se décalent et ça galope. Sur ta table, c’est le tempo (ou SYNC) qui règle ça.',
        'À la même vitesse : sinon leurs « boum » se décalent et ça galope. Sur ta table, c’est le tempo (ou SYNC) qui règle ça.'),
      cpT('temps', 'Tape en rythme, plus vite', '8 temps, à 130 BPM.', cpM(12, { kick: true, hat: true, clap: true, bpm: 130 }))
    ] },
  { titre: 'La phrase', sous: 'Tout change tous les 32 temps',
    retenir: '8 mesures, soit 32 temps, font une phrase. Les DJ lancent et mélangent leurs morceaux au début d’une phrase.',
    cartes: [
      cpE('Les mesures vont par 8 : 8 mesures de 4 temps, ça fait 32 temps. C’est une phrase.', cpM(16, { kick: true, hat: true, clap: true }), { mesures: 1 }),
      cpE('À la fin d’une phrase, la musique change : un instrument arrive ou s’en va. Écoute la fin de cette phrase.', cpM(24, { kick: true, hat: true, clap: true, basse: [16, 24], accords: [16, 24] }), { mesures: 5 }),
      cpT('change', 'Tape quand ça change', 'Compte les mesures : le changement arrive au début de la phrase suivante.', cpM(24, { kick: true, hat: true, clap: true, basse: [16, 24], accords: [16, 24] }), { change: 16, mesures: 5 }),
      cpC('Une phrase, c’est combien de temps ?', ['32', '16', '8'], 0, 'Oui : 8 mesures de 4 temps.', 'C’est 32 : 8 mesures de 4 temps.'),
      cpC('Tu veux lancer ton morceau B. Le meilleur moment, c’est…', ['Au début d’une phrase', 'Au milieu d’une mesure', 'N’importe quand'], 0,
        'Oui : c’est là que l’oreille attend un changement. B arrive comme s’il faisait partie du morceau.',
        'Au début d’une phrase : c’est là que l’oreille attend un changement.')
    ] },
  { titre: 'Les parties d’un morceau', sous: 'Intro, break, drop, outro',
    retenir: 'L’intro et l’outro sont faites pour mixer. Le DJ fait entrer B sur son intro, pendant l’outro de A.',
    cartes: [
      cpE('Un morceau se découpe en parties. L’intro est simple, sans basse : c’est là que le DJ fait entrer le morceau.', cpM(8, { kick: true, hat: true }), { points: true }),
      cpE('Le drop, c’est quand tout joue : la basse, les accords. Tout le monde danse.', cpM(8, CP_TOUT), { points: true }),
      cpE('Le break est une pause : la grosse caisse s’arrête, il reste les nappes. L’outro, à la fin, ressemble à l’intro.', cpM(8, { hat: true, nappe: true })),
      cpC('Quelle partie est-ce ?', ['L’intro', 'Le drop', 'Le break'], 2, 'Oui : plus de grosse caisse, juste des nappes. C’est le break.',
        'C’est le break : la grosse caisse s’est arrêtée.', { son: cpM(8, { hat: true, nappe: true }) }),
      cpC('Et celle-ci ?', ['L’intro', 'Le drop', 'Le break'], 1, 'Oui : tout joue, c’est le drop.',
        'C’est le drop : la basse et les accords jouent avec la grosse caisse.', { son: cpM(8, CP_TOUT) }),
      cpO('Remets les parties dans l’ordre', ['Intro', 'Break', 'Drop', 'Outro'], 'C’est ça : on entre doucement, la tension monte, ça explose, puis on redescend.',
        'L’ordre : intro, break, drop, outro. On entre doucement, la tension monte, ça explose, puis on redescend.')
    ] },
  { titre: 'Grave, médium, aigu', sous: 'Pourquoi on coupe les basses',
    retenir: 'Le potard LOW règle les graves. Deux basses en même temps, c’est la bouillie : on n’en garde qu’une à la fois.',
    cartes: [
      cpE('Le son se range en trois étages : les graves (la grosse caisse, la basse), les médiums (les accords), les aigus (les « tss »).', cpM(8, CP_TOUT)),
      cpE('Sur ta table, chaque étage a son potard : LOW, MID et HI. Écoute les graves disparaître au milieu.', cpM(8, Object.assign({ coupe: [4, 'basses'] }, CP_TOUT))),
      cpC('Qu’est-ce qui a été coupé ?', [{ t: 'Les basses', s: 'le « boum » grave' }, { t: 'Les aigus', s: 'les « tss »' }, { t: 'Rien du tout' }], 1,
        'Oui : les « tss » ont disparu, le « boum » est resté. C’est le potard HI.',
        'Ce sont les aigus : les « tss » ont disparu, le « boum » est resté. C’est le potard HI.',
        { son: cpM(8, Object.assign({ coupe: [4, 'aigus'] }, CP_TOUT)), ecoute: 'Avant, puis après' }),
      cpC('Et là ?', [{ t: 'Les basses', s: 'le « boum » grave' }, { t: 'Les aigus', s: 'les « tss »' }, { t: 'Rien du tout' }], 0,
        'Oui : le « boum » a disparu. C’est le potard LOW.',
        'Ce sont les basses : le « boum » a disparu, les « tss » sont toujours là. C’est le potard LOW.',
        { son: cpM(8, Object.assign({ coupe: [4, 'basses'] }, CP_TOUT)), ecoute: 'Avant, puis après' }),
      cpC('Lequel fait « bouillie » ?', [{ t: 'Morceau A', son: cpM(8, { kick: true, hat: true, basse: true, basse2: true }) }, { t: 'Morceau B', son: cpM(8, { kick: true, hat: true, basse: true }) }], 0,
        'Oui : deux basses en même temps se marchent dessus. C’est pour ça qu’on coupe les basses de B quand il entre.',
        'C’est A : il a deux basses en même temps, elles se marchent dessus. C’est pour ça qu’on coupe les basses de B quand il entre.'),
      cpC('Quand B entre, tu coupes…', ['Ses basses (LOW)', 'Ses aigus (HI)', 'Son volume'], 0, 'Oui : une seule basse à la fois, toujours.', 'Ses basses : une seule basse à la fois, toujours.')
    ] },
  { titre: 'La transition', sous: 'Ce que tu vas faire avec ta table',
    retenir: 'B entre sur une phrase, sans ses basses. On échange les basses, puis A s’en va. C’est ce que tu vas faire au chapitre 1, avec ta table.',
    cartes: [
      cpE('Une transition, c’est passer d’un morceau à l’autre sans que la danse s’arrête. Écoute : A joue, puis B entre sur une phrase, sans ses basses.',
        cpM(16, { kick: true, hat: true, accords: true, basse: true, nappe: [8, 16], clap: [8, 16] })),
      cpE('Puis on échange les basses : celle de A s’en va, celle de B arrive. Enfin, A s’en va.', cpM(16, { kick: true, hat: [0, 8], accords: [0, 8], basse: [0, 4], basseB: [4, 16], nappe: true, clap: true })),
      cpO('Remets les gestes dans l’ordre', ['Lancer B au début d’une phrase', 'Monter le volume de B', 'Échanger les basses', 'Baisser le volume de A'],
        'Parfait : c’est exactement la transition complète du chapitre 1.', 'L’ordre : lancer B sur une phrase, monter son volume, échanger les basses, puis baisser A.'),
      cpC('B entre pendant quelle partie de A ?', ['Son outro', 'Son drop', 'Son break'], 0, 'Oui : l’outro de A est simple, B y trouve sa place.', 'Pendant son outro : elle est simple, B y trouve sa place.'),
      cpC('Combien de basses à la fois ?', ['Une seule', 'Deux', 'Aucune'], 0, 'Oui, une seule. Tu as tout compris : la suite se passe avec ta table.', 'Une seule : deux basses ensemble, c’est la bouillie.')
    ] }
];
const cpOuverte = i => i === 0 || cpFaite(i - 1) || parcoursOuvert || /[?&]tout=1/.test(location.search);
const cpProchaine = () => { const i = CP_LECONS.findIndex((_, k) => !cpFaite(k)); return i < 0 ? 0 : i; };
const cpNbFaites = () => CP_LECONS.filter((_, k) => cpFaite(k)).length;

// L'étape du parcours (en tête sur un téléphone, voir parcoursEtapes dans parcours.js)
STAGES.comprendre = { title: 'Comprendre la musique',
  text: 'Sept petites leçons, sans table : entendre les temps, compter les phrases, reconnaître les parties d’un morceau. Juste ton doigt et le son.',
  done: () => cpNbFaites() >= CP_LECONS.length, prog: () => `${cpNbFaites()} leçon${cpNbFaites() > 1 ? 's' : ''} sur ${CP_LECONS.length}`,
  cta: () => `Leçon ${cpProchaine() + 1} : ${CP_LECONS[cpProchaine()].titre}`, go: () => cpLecon(cpProchaine()) };

/* ---------- La boîte à rythmes ----------
   Un motif : `n` temps à `bpm`, et pour chaque instrument les temps où il joue (true = tout le long, [de, à[ = une plage).
   `coupe: [k, 'basses' | 'aigus']` coupe un étage à partir du temps k (comme le potard LOW ou HI tourné à fond à gauche).
   Une liste de motifs est jouée l'un après l'autre. */
let cpBruit = null;
function cpBruitBuf(){ if (cpBruit) return cpBruit; const b = ac.createBuffer(1, ac.sampleRate, ac.sampleRate), d = b.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; return (cpBruit = b); }
function cpKick(o, t){ const s = ac.createOscillator(), g = ac.createGain(); s.frequency.setValueAtTime(150, t); s.frequency.exponentialRampToValueAtTime(48, t + .12);
  g.gain.setValueAtTime(.9, t); g.gain.exponentialRampToValueAtTime(.001, t + .32); s.connect(g); g.connect(o); s.start(t); s.stop(t + .35); }
function cpSouffle(o, t, d, type, f, v){ const s = ac.createBufferSource(), fl = ac.createBiquadFilter(), g = ac.createGain(); s.buffer = cpBruitBuf(); fl.type = type; fl.frequency.value = f;
  g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(.001, t + d); s.connect(fl); fl.connect(g); g.connect(o); s.start(t, Math.random() * .5); s.stop(t + d + .02); }
function cpNote(o, t, f, d, type, v, coupe = 0){ const s = ac.createOscillator(), g = ac.createGain(); s.type = type; s.frequency.value = f;
  g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(v, t + .01); g.gain.exponentialRampToValueAtTime(.001, t + d);
  let n = s; if (coupe){ const fl = ac.createBiquadFilter(); fl.type = 'lowpass'; fl.frequency.value = coupe; s.connect(fl); n = fl; }
  n.connect(g); g.connect(o); s.start(t); s.stop(t + d + .05); }
const CP_RACINES = [55, 43.65, 65.41, 49], CP_ACCORDS = [[220, 261.6, 329.6], [174.6, 220, 261.6], [261.6, 329.6, 392], [196, 246.9, 293.7]];
const cpDans = (v, k) => v === true || (Array.isArray(v) && k >= v[0] && k < v[1]);
let cpEnCours = null;   // le son qui joue : { bus, t0, per, fin, n }
function cpStop(){ const e = cpEnCours; cpEnCours = null; if (!e) return;
  try { e.bus.gain.cancelScheduledValues(0); e.bus.gain.setValueAtTime(0, ac.currentTime); } catch (x) {}
  setTimeout(() => { try { e.bus.disconnect(); } catch (x) {} }, 150); }
function cpMotif(bus, m, t0){
  const per = 60 / (m.bpm || CP_BPM), lo = ac.createBiquadFilter(), hi = ac.createBiquadFilter(), entree = ac.createGain();
  lo.type = 'lowshelf'; lo.frequency.value = 220; hi.type = 'highshelf'; hi.frequency.value = 3200;
  entree.connect(lo); lo.connect(hi); hi.connect(bus);
  if (m.coupe){ const f = m.coupe[1] === 'basses' ? lo : hi; f.gain.setValueAtTime(0, t0); f.gain.setValueAtTime(-40, t0 + m.coupe[0] * per); }
  for (let k = 0; k < m.n; k++){
    const t = t0 + k * per, mes = Math.floor(k / 4) % 4, un = k % 4 === 0;
    // « irrégulier » : certains temps arrivent trop tôt ou trop tard (leçon 1)
    const ecart = m.irregulier ? [0, .09, 0, -.08][k % 4] * (k % 8 < 4 ? 1 : -1) : 0;
    if (cpDans(m.kick, k)) cpKick(entree, t + ecart);
    if (cpDans(m.hat, k)) cpSouffle(entree, t + per / 2, .05, 'highpass', 7000, .22);
    if (cpDans(m.clap, k) && k % 2 === 1) cpSouffle(entree, t, .14, 'bandpass', 1500, .42);
    if (cpDans(m.basse, k)) cpNote(entree, t + per / 2, CP_RACINES[mes], per * .45, 'sawtooth', .3, 320);
    // une seconde basse qui ne va pas avec la première (leçon 6), ou la basse du morceau B (leçon 7)
    if (cpDans(m.basse2, k)) cpNote(entree, t + per * .25, CP_RACINES[(mes + 2) % 4] * 1.06, per * .5, 'sawtooth', .3, 320);
    if (cpDans(m.basseB, k)) cpNote(entree, t, CP_RACINES[mes] * 2, per * .4, 'square', .16, 420);
    if (cpDans(m.accords, k) && un) CP_ACCORDS[mes].forEach(f => cpNote(entree, t, f, per * 1.6, 'square', .045, 1800));
    if (cpDans(m.nappe, k) && un) CP_ACCORDS[(mes + 1) % 4].forEach(f => cpNote(entree, t, f, per * 3.8, 'sine', .07));
    if ((m.cymbale1 && un) || (m.cymbale != null && k % 4 === m.cymbale)) cpSouffle(entree, t, 1.2, 'highpass', 5000, .3);
  }
  return t0 + m.n * per;
}
function cpJoue(son, apres = .15){
  ensureAudio(); if (ac.state !== 'running') ac.resume(); cpStop();
  const liste = Array.isArray(son) ? son : [son], bus = ac.createGain(); bus.connect(master);
  const t0 = ac.currentTime + apres; let t = t0;
  liste.forEach((m, i) => { t = cpMotif(bus, m, t) + (i < liste.length - 1 ? .5 : 0); });
  cpEnCours = { bus, t0, per: 60 / (liste[0].bpm || CP_BPM), fin: t, n: liste[0].n };
  return cpEnCours;
}
// L'instant entendu : la carte son a un peu de retard sur l'horloge (même idée que heardTime dans expert.js)
const cpEntendu = () => ac ? ac.currentTime - (ac.outputLatency || ac.baseLatency || 0) : 0;

/* ---------- La fenêtre d'une leçon ---------- */
const cp = { on: false, l: 0, i: 0, ok: 0, notes: 0, debut: 0, essais: 0, jeton: 0, back: null, tape: null, choix: -1, ordre: [], fin: false };
const cpCarte = () => CP_LECONS[cp.l].cartes[cp.i];
const cpNote1 = juste => { if (cp.essais === 0){ cp.notes++; if (juste) cp.ok++; } };
function cpLecon(l){
  if (!CP_LECONS[l] || !cpOuverte(l)) return;
  if (run) stopRun(); if (pp.on) return;
  Object.assign(cp, { on: true, l, i: 0, ok: 0, notes: 0, debut: Date.now(), essais: 0, fin: false, back: cp.on ? cp.back : document.activeElement });
  $('cp').hidden = false; document.documentElement.classList.add('pp-open');
  ensureAudio(); if (ac.state !== 'running') ac.resume();
  cpRend();
}
function cpFerme(){ if (!cp.on) return; cp.on = false; cp.jeton++; cpStop(); $('cp').hidden = true; document.documentElement.classList.remove('pp-open');
  if (view === 'accueil') renderHome(); cpRendChemin(); const b = cp.back; if (b && b.isConnected && !b.hidden) b.focus({ preventScroll: true }); }
function cpSuivante(){ cp.essais = 0; cpStop(); if (cp.i + 1 < CP_LECONS[cp.l].cartes.length){ cp.i++; cpRend(); } else cpTermine(); }
function cpPied(txt, faire, actif = true){ const b = $('cpGo'); $('cpPied').hidden = !txt; b.textContent = txt || ''; b.disabled = !actif; b.onclick = faire; }
function cpVerdict(bien, titre, texte, boutons){
  const v = $('cpVerdict'); v.className = 'cp-verdict ' + (bien ? 'bien' : 'mal'); v.hidden = false; $('cpPied').hidden = true;
  $('cpVTitre').textContent = titre; $('cpVTexte').textContent = texte; const z = $('cpVBoutons'); z.innerHTML = '';
  boutons.forEach(([txt, faire, second]) => { const b = document.createElement('button'); b.type = 'button'; b.className = second ? 'cp-second' : 'cp-vgo'; b.textContent = txt; b.onclick = faire; z.appendChild(b); });
  son(bien ? 'reussi' : 'rate'); z.firstChild.focus({ preventScroll: true });
}
const cpEl = (tag, cls, txt) => { const e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; };
const CP_PLAY = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 1.5v13l11-6.5z" fill="currentColor"/></svg>';
function cpEcoute(label, son, carte){ const b = cpEl('button', 'cp-ecoute'); b.type = 'button'; b.innerHTML = `<span class="cp-play">${CP_PLAY}</span>`; b.appendChild(cpEl('span', '', label));
  b.addEventListener('click', () => { cpJoue(son); cpAnime(carte); }); return b; }
// Les ronds (un par temps d'une mesure) ou les cases (une par mesure d'une phrase) qui s'allument pendant l'écoute
function cpReperes(c){
  if (c.mesures){ const r = cpEl('div', 'cp-mesures'); for (let k = 0; k < 8; k++) r.appendChild(cpEl('i', k < c.mesures - 1 ? 'passe' : '')); return r; }
  const r = cpEl('div', 'cp-points'); for (let k = 0; k < 4; k++) r.appendChild(cpEl('i', k === 0 ? 'un' : '')); return r;
}
// Fait vivre les repères pendant que le son joue (et le compte à rebours du rond à taper)
function cpAnime(c){
  const jeton = ++cp.jeton, e = cpEnCours;
  const pas = () => {
    if (jeton !== cp.jeton || !cp.on || cpEnCours !== e) return;
    const b = Math.floor((cpEntendu() - e.t0) / e.per), corps = $('cpCorps');
    corps.querySelectorAll('.cp-points i').forEach((d, k) => d.classList.toggle('on', b >= 0 && b < e.n && b % 4 === k));
    if (c && c.mesures) corps.querySelectorAll('.cp-mesures i').forEach((d, k) => { const m = c.mesures - 1 + Math.floor(b / 4);
      d.classList.toggle('on', b >= 0 && b < e.n && (m % 8) === k); d.classList.toggle('passe', k < (b < 0 ? c.mesures - 1 : m % 8) && m < 8); });
    if (c && c.t === 'tape') cpTapeAnime(c, b);
    if (cpEntendu() < e.fin + .2) requestAnimationFrame(pas);
    else corps.querySelectorAll('.cp-points i, .cp-mesures i').forEach(d => d.classList.remove('on'));
  };
  requestAnimationFrame(pas);
}
function cpRend(){
  const L = CP_LECONS[cp.l], c = cpCarte(), corps = $('cpCorps');
  cp.jeton++; $('cpVerdict').hidden = true; corps.innerHTML = ''; corps.classList.remove('pp-in'); void corps.offsetWidth; corps.classList.add('pp-in');
  const pct = Math.round(cp.i / L.cartes.length * 100); $('cpFill').style.width = pct + '%'; $('cpBar').setAttribute('aria-valuenow', String(pct));
  corps.appendChild(cpEl('span', 'lnum cp-kick', `Leçon ${cp.l + 1} · ${L.titre}`));
  if (c.t === 'explique'){
    const h = cpEl('div', 'pp-head'), v = cpEl('div'), p = cpEl('p', 'pp-bubble', c.dit); p.id = 'cpTitre'; p.setAttribute('aria-live', 'polite');
    viniMettre(v, 'calme'); h.append(v, p); corps.appendChild(h);
    if (c.son){ corps.appendChild(cpEcoute('Écouter', c.son, c)); if (c.points || c.mesures){ corps.appendChild(cpReperes(c));
      corps.appendChild(cpEl('p', 'cp-legende', c.mesures ? 'Chaque case est une mesure de 4 temps.' : 'Chaque rond s’allume sur un temps.')); } }
    cpPied('Continuer', cpSuivante);
    return;
  }
  const t = cpEl('h2', 'cp-titre', c.titre); t.id = 'cpTitre'; corps.appendChild(t);
  if (c.t === 'tape') return cpTapeRend(c, corps);
  if (c.t === 'choix') return cpChoixRend(c, corps);
  if (c.t === 'ordre') return cpOrdreRend(c, corps);
}

/* ---------- Taper en rythme ----------
   Les 4 premiers temps du son servent à se caler (les ronds comptent, sauf « sans les ronds »), puis on tape :
   - `temps` : sur chacun des 8 temps suivants ; réussi avec 6 temps justes ou presque ;
   - `un` : sur le « 1 » de chacune des 4 mesures suivantes ; réussi avec 3 « 1 » justes et au plus une frappe ailleurs ;
   - `change` : une seule fois, au début de la phrase suivante (temps `change`) ; réussi de 0,25 s trop tôt à 0,4 s trop tard.
   Une frappe est « pile » à 0,11 s près, « presque » à 0,2 s (un téléphone ajoute son propre retard au toucher). */
const CP_PILE = .11, CP_PRESQUE = .2;
function cpTapeRend(c, corps){
  corps.appendChild(cpEl('p', 'cp-sous', c.sous));
  if (c.mesures) corps.appendChild(cpReperes(c));
  const pad = cpEl('button', 'cp-pad', 'Commencer'); pad.type = 'button'; pad.id = 'cpPad';
  pad.addEventListener('pointerdown', e => { e.preventDefault(); cpPadAppui(c); });
  pad.addEventListener('keydown', e => { if (e.key === 'Enter'){ e.preventDefault(); cpPadAppui(c); } });
  corps.appendChild(pad);
  corps.appendChild(cpEl('p', 'cp-retour', '')).id = 'cpRetour';
  const n = c.mode === 'temps' ? 8 : c.mode === 'un' ? 4 : 0, coups = cpEl('div', 'cp-coups'); coups.id = 'cpCoups';
  for (let k = 0; k < n; k++) coups.appendChild(cpEl('i')); corps.appendChild(coups);
  corps.appendChild(cpEl('p', 'cp-astuce', cpMobile() ? '' : 'Sur ordinateur : clique sur le rond, ou appuie sur Espace.'));
  cp.tape = null; cpPied('', null);
}
function cpPadAppui(c){ if (!cp.tape) cpTapeDemarre(c); else cpFrappe(); }
function cpTapeDemarre(c){
  const e = cpJoue(c.son), per = e.per;
  const attendus = c.mode === 'temps' ? [4, 5, 6, 7, 8, 9, 10, 11] : c.mode === 'un' ? [4, 8, 12, 16] : [c.change];
  cp.tape = { c, e, attendus: attendus.map(k => e.t0 + k * per), coups: attendus.map(() => null), ailleurs: 0, frappes: [], fini: false };
  cpAnime(c);
  setTimeout(() => cpTapeFin(), Math.max(0, (e.fin - ac.currentTime) * 1000) + 350);
}
function cpTapeAnime(c, b){
  const pad = $('cpPad'); if (!pad || !cp.tape) return;
  const avant = c.mode === 'change' ? c.change : 4;
  pad.textContent = b < 0 ? 'Écoute…' : b < avant && c.mode !== 'change' ? (c.sansAide ? 'Écoute…' : String(4 - b)) : 'Tape';
  pad.classList.toggle('bat', b >= 0 && b < cp.tape.e.n && !c.sansAide && (c.mode !== 'un' || b % 4 === 0));
}
// Une frappe, à l'instant entendu (les tests passent l'instant eux-mêmes)
function cpFrappe(t = cpEntendu()){
  const tp = cp.tape; if (!tp || tp.fini) return; tp.frappes.push(t);
  const per = tp.e.per, c = tp.c, coups = document.querySelectorAll('#cpCoups i');
  if (c.mode === 'change'){ if (tp.coups[0] !== null) return; const err = t - tp.attendus[0]; if (err < -2 * per) { cpRetour('Trop tôt', 'mal'); return; } tp.coups[0] = err; cpRetour(cpMot(err), cpClasse(err)); return; }
  // le temps le plus proche de la frappe (les 4 premiers servent à se caler) ; au « 1 », une frappe sur un autre temps est « ailleurs »
  const bk = Math.round((t - tp.e.t0) / per), dernier = c.mode === 'un' ? 19 : 11;
  if (bk < 4 || bk > dernier) return;
  if (c.mode === 'un' && bk % 4){ tp.ailleurs++; cpRetour('Pas sur le « 1 »', 'mal'); return; }
  const k = c.mode === 'un' ? bk / 4 - 1 : bk - 4, err = t - tp.attendus[k];
  if (tp.coups[k] === null || Math.abs(err) < Math.abs(tp.coups[k])) tp.coups[k] = err;
  if (coups[k]) coups[k].className = cpClasse(tp.coups[k]);
  cpRetour(cpMot(err), cpClasse(err));
}
const cpClasse = err => Math.abs(err) <= CP_PILE ? 'ok' : Math.abs(err) <= CP_PRESQUE ? 'mid' : 'mal';
const cpMot = err => Math.abs(err) <= CP_PILE ? 'Pile !' : Math.abs(err) <= CP_PRESQUE ? (err < 0 ? 'Un peu tôt' : 'Un peu tard') : err < 0 ? 'Trop tôt' : 'Trop tard';
function cpRetour(txt, cls){ const r = $('cpRetour'); if (r){ r.textContent = txt; r.className = 'cp-retour ' + cls; } }
function cpTapeFin(){
  const tp = cp.tape; if (!tp || tp.fini || !cp.on || cpCarte() !== tp.c) return; tp.fini = true;
  const c = tp.c, bons = tp.coups.filter(e => e !== null && Math.abs(e) <= CP_PRESQUE).length;
  let juste, texte;
  if (c.mode === 'temps'){ juste = bons >= 6; texte = juste ? `${bons} temps sur 8 dans le rythme.` : `${bons} temps sur 8 dans le rythme. Écoute la grosse caisse et tape avec elle, sans te presser.`; }
  else if (c.mode === 'un'){ juste = bons >= 3 && tp.ailleurs <= 1; texte = juste ? `${bons} « 1 » sur 4.` : tp.ailleurs > 1 ? 'Tu as tapé sur d’autres temps : attends la cymbale, une fois par mesure.' : `${bons} « 1 » sur 4. Compte 1, 2, 3, 4 dans ta tête et tape sur le 1.`; }
  else { const e = tp.coups[0]; juste = e !== null && e >= -.25 && e <= .4;
    texte = juste ? 'Pile au début de la nouvelle phrase.' : e === null ? 'Tu n’as pas tapé. Compte les mesures : le changement arrive après la 8e.' : e < 0 ? 'Trop tôt : compte les mesures jusqu’à la 8e, puis tape sur le « 1 » suivant.' : 'Un peu tard : en comptant les mesures, tu peux le sentir arriver.'; }
  const premier = cp.essais === 0; cpNote1(juste);
  const pad = $('cpPad'); if (pad){ pad.textContent = juste ? 'Bravo' : 'Fini'; pad.classList.remove('bat'); }
  if (juste) cpVerdict(true, 'Bien joué !', texte, [['Continuer', cpSuivante]]);
  else cpVerdict(false, 'Presque', texte, premier ? [['Réessayer', () => { cp.essais++; cpRend(); }], ['Passer', cpSuivante, true]] : [['Continuer', cpSuivante]]);
}

/* ---------- Écoute et choisis ---------- */
function cpChoixRend(c, corps){
  if (c.son) corps.appendChild(cpEcoute(c.ecoute || 'Écouter', c.son, c));
  if (c.son && c.points) corps.appendChild(cpReperes(c));
  const cote = c.options.length === 2 && c.options.every(o => o.son), z = cpEl('div', 'pp-opts' + (cote ? ' cp-cote' : '')); z.id = 'cpOpts';
  c.options.forEach((o, i) => {
    const b = cpEl('button', 'pp-opt cp-opt'); b.type = 'button'; b.dataset.i = String(i); b.setAttribute('aria-pressed', 'false');
    if (o.son){ const p = cpEl('span', 'cp-mini'); p.innerHTML = CP_PLAY; p.setAttribute('aria-hidden', 'true'); b.appendChild(p); }
    const tx = cpEl('span', 'pp-txt'); tx.appendChild(cpEl('span', '', o.t)); if (o.s) tx.appendChild(cpEl('span', 'pp-sub', o.s)); b.appendChild(tx);
    // une option avec un son : le toucher le fait entendre et le choisit
    b.addEventListener('click', () => { if (cp.choixFige) return; if (o.son){ cpJoue(o.son); cpAnime(null); } cp.choix = i;
      z.querySelectorAll('.cp-opt').forEach(x => x.setAttribute('aria-pressed', String(x === b))); cpPied('Vérifier', () => cpChoixVerifie(c), true); });
    z.appendChild(b);
  });
  corps.appendChild(z);
  if (cote) corps.appendChild(cpEl('p', 'cp-legende', 'Touche un morceau pour l’écouter, puis vérifie.'));
  cp.choix = -1; cp.choixFige = false; cpPied('Vérifier', () => cpChoixVerifie(c), false);
}
function cpChoixVerifie(c){
  if (cp.choix < 0) return; cp.choixFige = true; cpStop();
  const juste = cp.choix === c.bonne; cpNote1(juste);
  document.querySelectorAll('#cpOpts .cp-opt').forEach((b, i) => { b.classList.toggle('juste', i === c.bonne); b.classList.toggle('faux', i === cp.choix && !juste); b.disabled = true; });
  cpVerdict(juste, juste ? 'Bien vu !' : 'Pas tout à fait', juste ? c.juste : c.faux, [[juste ? 'Continuer' : 'Compris', cpSuivante]]);
}

/* ---------- Remettre dans l'ordre ---------- */
function cpOrdreRend(c, corps){
  corps.appendChild(cpEl('p', 'cp-sous', 'Touche-les de la première à la dernière.'));
  // mélangées, mais jamais déjà dans le bon ordre
  const n = c.items.length, melange = c.items.map((_, i) => i).sort((a, b) => ((a * 7 + 3) % n) - ((b * 7 + 3) % n));
  if (melange.every((v, i) => v === i)) melange.reverse();
  cp.ordre = [];
  const cases = cpEl('ol', 'cp-cases'); cases.id = 'cpCases'; const puces = cpEl('div', 'cp-puces'); puces.id = 'cpPuces';
  const rend = () => {
    cases.innerHTML = ''; for (let k = 0; k < n; k++){ const li = cpEl('li', cp.ordre[k] != null ? 'plein' : ''); li.appendChild(cpEl('b', '', String(k + 1)));
      if (cp.ordre[k] != null){ const x = cpEl('button', 'cp-dans', c.items[cp.ordre[k]]); x.type = 'button'; x.addEventListener('click', () => { if (cp.choixFige) return; cp.ordre.splice(k, 1); rend(); }); li.appendChild(x); }
      cases.appendChild(li); }
    puces.innerHTML = ''; melange.filter(i => !cp.ordre.includes(i)).forEach(i => { const b = cpEl('button', 'cp-puce', c.items[i]); b.type = 'button';
      b.addEventListener('click', () => { if (cp.choixFige) return; cp.ordre.push(i); rend(); }); puces.appendChild(b); });
    cpPied('Vérifier', () => cpOrdreVerifie(c), cp.ordre.length === n);
  };
  corps.append(cases, puces); cp.choixFige = false; rend();
}
function cpOrdreVerifie(c){
  if (cp.ordre.length !== c.items.length) return; cp.choixFige = true;
  const juste = cp.ordre.every((v, i) => v === i); cpNote1(juste);
  document.querySelectorAll('#cpCases li').forEach((li, i) => li.classList.add(cp.ordre[i] === i ? 'juste' : 'faux'));
  cpVerdict(juste, juste ? 'Bien vu !' : 'Pas tout à fait', juste ? c.juste : c.faux, [[juste ? 'Continuer' : 'Compris', cpSuivante]]);
}

/* ---------- Fin de la leçon ---------- */
function cpTermine(){
  const l = cp.l, L = CP_LECONS[l], avant = cpStars[l] || 0, st = cp.ok === cp.notes ? 3 : cp.ok / Math.max(1, cp.notes) >= .6 ? 2 : 1;
  const secs = Math.round((Date.now() - cp.debut) / 1000);
  if (st > avant){ cpStars[l] = st; try { localStorage.setItem(CP_KEY, JSON.stringify(cpStars)); } catch (e) {} }
  goalAdd(secs); stat1('comprendre-1'); if (cpNbFaites() >= CP_LECONS.length) stat1('comprendre-fin');
  renderHud(); cp.fin = true; cp.jeton++;
  $('cpFill').style.width = '100%'; $('cpBar').setAttribute('aria-valuenow', '100'); $('cpVerdict').hidden = true; $('cpPied').hidden = true;
  const corps = $('cpCorps'); corps.innerHTML = ''; const f = cpEl('div', 'cp-fin');
  const v = cpEl('div', 'cp-fvini'); viniMettre(v, 'parfait'); f.appendChild(v);
  const e = cpEl('div', 'cp-etoiles'); e.setAttribute('aria-label', `${st} étoile${st > 1 ? 's' : ''} sur 3`); for (let k = 0; k < 3; k++) e.appendChild(cpEl('span', k < st ? 'on' : '', '★')); f.appendChild(e);
  const h = cpEl('h2', 'cp-ftitre', 'Leçon terminée !'); h.id = 'cpTitre'; f.appendChild(h);
  const gain = st > avant ? `+${(st - avant) * CP_XP} XP` : `Ton record ici : ${'★'.repeat(avant)}`;
  f.appendChild(cpEl('p', 'cp-gain', `${gain} · ${Math.max(1, Math.round(secs / 60))} min`));
  const r = cpEl('div', 'cp-retenir'); r.appendChild(cpEl('b', '', 'À retenir')); r.appendChild(cpEl('span', '', L.retenir)); f.appendChild(r);
  const bt = cpEl('div', 'cp-fboutons'), suite = l + 1 < CP_LECONS.length;
  const b1 = cpEl('button', 'cp-vgo', suite ? 'Leçon suivante' : 'Revenir à l’accueil'); b1.type = 'button';
  b1.addEventListener('click', () => { if (suite) cpLecon(l + 1); else { cpFerme(); location.hash = '#accueil'; } });
  const b2 = cpEl('button', 'cp-second', 'Rejouer'); b2.type = 'button'; b2.addEventListener('click', () => cpLecon(l));
  bt.append(b1, b2); f.appendChild(bt);
  // Sur un téléphone, sans compte : le compte est le pont vers l'ordinateur et la table
  if (cpMobile() && !cpt && cptOn()){ const p = cpEl('p', 'cp-garde', 'Pour garder ta progression et la retrouver sur ton ordinateur : ');
    const a = cpEl('button', 'cp-lien', 'crée ton compte'); a.type = 'button'; a.addEventListener('click', () => { cpFerme(); openCompte(); cptVa('creer'); });
    p.appendChild(a); p.appendChild(document.createTextNode('.')); f.appendChild(p); }
  corps.appendChild(f);
  for (let k = 0; k < st; k++) setTimeout(() => son('etoile', k), 150 + k * 180); setTimeout(() => son('fin'), 200 + st * 180);
  viniJoie(v); b1.focus({ preventScroll: true });
}

/* ---------- Dans « Apprendre » : la liste des leçons ---------- */
let cpBlocVu = false;
function cpRendChemin(){
  const ol = $('cpChemin'); if (!ol) return;
  // ouvert d'office sur un téléphone, décidé la première fois qu'« Apprendre » s'affiche (avant, le site ne sait pas encore
  // si le navigateur peut parler à une table) ; ensuite, c'est le joueur qui ouvre ou replie
  if (!cpBlocVu && !$('vLearn').hidden){ cpBlocVu = true; $('cpBloc').open = cpMobile(); }
  $('cpBlocN').textContent = `${cpEtoiles()}/${CP_LECONS.length * 3} ★`;
  ol.innerHTML = ''; const cur = cpProchaine();
  CP_LECONS.forEach((L, i) => { const ouverte = cpOuverte(i), st = cpStars[i] || 0;
    const li = cpEl('li', 'cp-lc' + (i === cur && !STAGES.comprendre.done() ? ' cur' : '') + (ouverte ? '' : ' ferme'));
    const b = cpEl('button', 'cp-lbtn'); b.type = 'button'; b.disabled = !ouverte;
    b.setAttribute('aria-label', `Leçon ${i + 1} : ${L.titre}, ${ouverte ? `${st} étoile${st > 1 ? 's' : ''} sur 3` : 'pas encore ouverte'}`);
    b.appendChild(cpEl('span', 'cp-disque', String(i + 1)));
    const t = cpEl('span', 'cp-nom'); t.appendChild(cpEl('b', '', L.titre)); t.appendChild(cpEl('small', '', L.sous));
    if (st) t.appendChild(cpEl('span', 'cp-st', '★'.repeat(st) + '☆'.repeat(3 - st)));
    b.appendChild(t); b.addEventListener('click', () => cpLecon(i)); li.appendChild(b); ol.appendChild(li); });
}
// « M'envoyer le lien » (accueil d'un téléphone) : la feuille de partage du téléphone, sinon le lien copié
async function cpEnvoieLien(b){
  const url = location.origin + location.pathname;
  if (navigator.share){ try { await navigator.share({ title: 'DJingood', text: 'À ouvrir sur mon ordinateur, avec ma table DJ', url }); return; } catch (e) { if (e && e.name === 'AbortError') return; } }
  let ok = false; try { await navigator.clipboard.writeText(url); ok = true; } catch (e) {}
  b.textContent = ok ? 'Lien copié !' : url; if (ok) setTimeout(() => { b.textContent = 'M’envoyer le lien'; }, 2500);
}
$('cpX').addEventListener('click', cpFerme);
$('homeLienBtn').addEventListener('click', e => cpEnvoieLien(e.currentTarget));
document.addEventListener('keydown', e => {
  if (!cp.on) return;
  if (e.key === 'Escape'){ e.stopPropagation(); cpFerme(); return; }
  if (e.code === 'Space' && cp.tape !== undefined && cpCarte() && cpCarte().t === 'tape' && !cp.fin && $('cpVerdict').hidden){ e.preventDefault(); e.stopPropagation(); cpPadAppui(cpCarte()); }
}, true);
