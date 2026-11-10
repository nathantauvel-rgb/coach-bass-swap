// Premiers pas (lot 28, refait au lot 37, animé au lot 52) : à la toute première visite, Vini pose trois questions, une par écran,
// comme dans Duolingo : ton niveau, ta table, ton objectif du jour. Le niveau choisit le parcours (parcours.js) et la première partie.
// Les réponses sont gardées dans coach-accueil.
// Tous les fichiers de js/ partagent la même portée et sont chargés dans l'ordre indiqué dans index.html.
'use strict';
/* ---------- Premiers pas ----------
   S'ouvre seulement pour un nouveau venu : pas de parcours (ni choisi, ni déduit d'une progression) et pas encore de réponses.
   « Passer » ferme sans rien choisir : l'accueil propose alors les trois parcours.
   Lot 37 (choix de l'utilisateur, 22 oct. 2026) : plus de « Pourquoi tu veux mixer ? » (la réponse ne servait à rien), plus de
   test de placement (les chapitres ne sont pas de plus en plus durs, ce sont des gestes différents), et aucune table n'est
   mise en avant : la table branchée est reconnue toute seule, sinon on la choisit dans la liste.
   Lot 52 (« Oui, toutes », 28 oct. 2026, d'après la maquette captures/maquette-vini) : c'est la première image du site, elle doit
   vivre. Vini sort de la platine et mixe au premier écran, sa bulle s'écrit pendant qu'il parle, il réagit à chaque réponse et
   danse au rythme de l'objectif choisi, et la musique monte d'une question à l'autre jusqu'au drop de « Commencer ».
   Lot 65 « Arrivée et compte » (9 nov. 2026, maquette captures/maquette-onboarding du dossier principal) : les visiteurs viennent
   de TikTok, souvent sur leur téléphone. Quatre questions (niveau, « Ton oreille » : 8 temps à taper, table, temps par jour),
   puis « Ton plan est prêt » (le drop), puis **le compte, obligatoire** (choix de l'utilisateur : ni « Plus tard », ni
   « Passer ») : prénom + e-mail, sans mot de passe ; le mail de Firebase porte le lien qui connecte au même compte sur
   l'ordinateur. Sur un téléphone, un dernier écran dit où est parti ce lien. Les joueurs déjà venus ne voient rien de neuf. */
const ACC_KEY = 'coach-accueil';
const PP_ETAPES = ['salut', 'niveau', 'oreille', 'table', 'objectif', 'plan', 'compte', 'envoye'];
// Les trois niveaux : identifiant (= parcours), nom, ce qu'il veut dire, ce que répond Vini
const PP_NIVEAUX = [
  ['debut', 'Grand débutant', 'Je n’ai jamais mixé', 'Parfait, on part de zéro. Chaque bouton, un par un !'],
  ['apprenti', 'Apprenti DJ', 'Je sais lancer deux morceaux, mes transitions ne sont pas encore propres', 'On saute les explications : tout est ouvert, en Mode Expert.'],
  ['confirme', 'DJ confirmé', 'Je mixe déjà, je veux du défi', 'Alors on attaque direct par un vrai set : plusieurs morceaux enchaînés, noté sur 100. Accroche-toi !']
];
const PP_TABLES = [['table', 'J’ai une table', 'Branche-la en USB : je la reconnais toute seule'], ['souris', 'Pas encore de table', 'Je joue à la souris']];
// Sur un téléphone, on ne branche rien : on demande seulement s'il en a une (lot 65)
const PP_TABLES_TEL = { table: ['Oui, j’en ai une', 'Tu la brancheras sur ton ordinateur'], souris: ['Pas encore', 'Je commence au doigt, sur mon téléphone'] };
const PP_MINUTES = [[5, 'Tranquille', 'à ton rythme !'], [10, 'Normal', 'en 2 semaines !'], [15, 'Intensif', 'encore plus vite !']];
// Ce que fait Vini à chaque réponse (lot 52) : une pose par-dessus son humeur (viniPose, js/vini.js) ; calme : il ne danse pas
const PP_POSES = {
  debut: { bras: 'pouce', yeux: 'clin', fx: 'etoiles' },
  apprenti: { bras: 'oreille', yeux: 'fermes', fx: 'notes', rythme: 'hoche' },
  confirme: { lunettes: true, fx: 'etoiles', rythme: 'hoche' },
  5: { yeux: 'fermes', rythme: 'lent' },
  15: { bras: 'haut', sourcils: true, sueur: true, rythme: 'rapide' },
  ecoute: { bras: 'oreille', fx: 'ondes', calme: true },   // il tend l'oreille : il attend ta table
  souris: { bras: 'souris' },
  connue: { bras: 'pouce', yeux: 'clin' },
  branchee: { fx: 'etoiles' }
};
// La tête de lecture de la barre d'avancement, en % : le drop de la forme d'onde est au bout, « Voir mon plan » l'y amène
const PP_POS = { salut: 5, niveau: 24, oreille: 40, table: 56, objectif: 72, plan: 100, compte: 100, envoye: 100 };
// Les tables que le site connaît, rangées par marque, toutes sur un pied d'égalité (la FLX4 avec les autres Pioneer)
const ppMarque = nom => nom.split(' ')[0];
const PP_LISTE = [{ id: 'flx4', nom: 'Pioneer DDJ-FLX4' }].concat(MODELES.map(m => ({ id: m.id, nom: m.nom })))
  .sort((a, b) => ppMarque(a.nom).localeCompare(ppMarque(b.nom)) || a.nom.localeCompare(b.nom));
const ppNomDe = id => (PP_LISTE.find(t => t.id === id) || {}).nom || '';
// La table branchée en ce moment : { nom, id } (id : 'flx4', celui d'une fiche, ou 'inconnue'), ou null
function ppBranchee(){
  if (!midiCount) return null;
  const n = midiNames.find(isFlx4) || midiNames.find(x => modeleDe(x)) || midiNames[0], m = modeleDe(n);
  return isFlx4(n) ? { nom: 'Pioneer DDJ-FLX4', id: 'flx4' } : m ? { nom: m.nom, id: m.id } : { nom: n.replace(/^\d+-\s*/, ''), id: 'inconnue' };
}
// petits dessins (traits de la couleur du texte de la carte) ; au lot 52, ils bougent quand on choisit la réponse
const ppTrait = d => `<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
const PP_IC = {
  table: ppTrait('<rect x="2" y="8" width="28" height="16" rx="4"/><g class="pp-ic-rot" style="transform-origin:9px 16px"><circle cx="9" cy="16" r="4"/><path d="M9 16v-3.2"/></g><g class="pp-ic-rot" style="transform-origin:23px 16px"><circle cx="23" cy="16" r="4"/><path d="M23 16v-3.2"/></g><path d="M15 12v8M17 12v8"/>'),
  souris: ppTrait('<rect x="9" y="3" width="14" height="26" rx="7"/><path d="M9 11h14"/><path class="pp-ic-molette" d="M16 5v3.5"/>'),
  coche: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
  plan: ppTrait('<circle cx="16" cy="16" r="13"/>' + [[10, 7], [15, 11], [20, 5], [25, 9]].map(([x, h], i) => `<path class="pp-pl" style="--i:${i}" d="M${x} 21v-${h}" stroke-width="2.6"/>`).join('')),
  // lot 65 : le plan, le lien envoyé
  tel: ppTrait('<rect x="9" y="3" width="14" height="26" rx="3.5"/><path d="M14.5 24.5h3"/>'),
  oreille: ppTrait('<path d="M10 13a6 6 0 1 1 12 0c0 4-4 5-4 9a3.5 3.5 0 0 1-7 0"/><path d="M14 13a2 2 0 1 1 4 0"/><path d="M25 9q2.5 4 0 8M27.5 6q4.5 7 0 14"/>'),
  etoile: ppTrait('<path d="m16 4 3.6 7.4 8.1 1.2-5.9 5.7 1.4 8.1L16 22.6l-7.2 3.8 1.4-8.1-5.9-5.7 8.1-1.2z"/>'),
  mail: ppTrait('<rect x="4" y="7" width="24" height="18" rx="4"/><path d="m5.5 9.5 10.5 8 10.5-8"/>')
};
const ppBarres = n => `<svg viewBox="0 0 28 24">${[[2, 14, 10], [11.5, 7, 17], [21, 0, 24]].map(([x, y, h], k) => `<rect class="${k <= n ? 'pp-b-on' : 'pp-b-off'}" style="--i:${k}" x="${x}" y="${y}" width="5" height="${h}" rx="2.5"/>`).join('')}</svg>`;
// L'objectif du jour : un petit disque qui tourne plus ou moins vite
const ppVinyle = m => `<svg class="pp-ic-vinyle pp-v${m}" viewBox="0 0 32 32"><circle class="pp-iv-d" cx="16" cy="16" r="13"/><path class="pp-iv-r" d="M7.5 13A9 9 0 0 1 13 7.5"/><circle class="pp-iv-l" cx="16" cy="16" r="4.5"/></svg>`;
const ppEllipse = (cx, cy, rx, ry) => `M${cx - rx} ${cy}A${rx} ${ry} 0 1 0 ${cx + rx} ${cy}A${rx} ${ry} 0 1 0 ${cx - rx} ${cy}`;
// La table reconnue, en petit : ses anneaux s'allument et ses pads clignotent sur le tempo
function ppMiniTable(){
  let pads = '';
  for (let k = 0; k < 8; k++) pads += `<rect class="ps-pad ${k > 3 ? 'ps-pad-b' : 'ps-pad-a'}" style="--k:${k}" x="${(k > 3 ? 76 : 12) + (k % 4) * 8.5}" y="44" width="7" height="5" rx="1.5"/>`;
  return `<svg class="ps-mini" viewBox="0 0 120 58"><rect class="ps-face" x="2" y="12" width="116" height="44" rx="10"/><rect class="ps-haut" x="2" y="5" width="116" height="47" rx="10"/>
<ellipse class="ps-bord" cx="28" cy="25" rx="21" ry="12"/><ellipse class="ps-bord" cx="92" cy="25" rx="21" ry="12"/>
<path class="ps-anneau ps-a" pathLength="100" d="${ppEllipse(28, 25, 17, 9.4)}"/><path class="ps-anneau ps-b" pathLength="100" d="${ppEllipse(92, 25, 17, 9.4)}"/>
<ellipse class="ps-plateau" cx="28" cy="25" rx="13" ry="7"/><ellipse class="ps-plateau" cx="92" cy="25" rx="13" ry="7"/>
<path class="ps-fente" d="M54 15V35M66 15V35"/><rect class="ps-cap" x="50" y="18" width="8" height="4" rx="1"/><rect class="ps-cap" x="62" y="18" width="8" height="4" rx="1"/>${pads}</svg>`;
}

// réponses déjà données : un objet { niveau, table, modele, min, oreille, mur, fini } ou { passe, fini } ; tout le reste est ignoré.
// Avant le lot 37, `niveau` était un numéro de 0 à 3 (0 = Grand débutant, 1 et 2 = Apprenti DJ, 3 = DJ confirmé)
// et `table` valait 'flx4', 'autre' ou 'souris'. Lot 65 : `oreille` = « boum » tapés pile sur 8 (null : passé) ; `mur` = le
// plan est fait mais le compte pas encore créé (au rechargement, les questions rouvrent sur le plan).
let accueil = null; try { accueil = JSON.parse(localStorage.getItem(ACC_KEY) || 'null'); } catch (e) {}
if (!accueil || typeof accueil !== 'object' || Array.isArray(accueil) || !(accueil.passe === true || typeof accueil.fini === 'string')) accueil = null;
else { const v = accueil.niveau, t = accueil.table, m = accueil.modele, o = accueil.oreille;
  accueil = { niveau: PP_NIVEAUX.some(x => x[0] === v) ? v : [0, 1, 2, 3].includes(v) ? ['debut', 'apprenti', 'apprenti', 'confirme'][v] : null,
    table: PP_TABLES.some(x => x[0] === t) ? t : t === 'flx4' || t === 'autre' ? 'table' : null,
    modele: typeof m === 'string' && (m === 'autre' || m === 'inconnue' || !!ppNomDe(m)) ? m : t === 'flx4' ? 'flx4' : '',
    min: PP_MINUTES.some(x => x[0] === accueil.min) ? accueil.min : null, passe: accueil.passe === true, fini: typeof accueil.fini === 'string' ? accueil.fini.slice(0, 10) : '',
    oreille: Number.isInteger(o) && o >= 0 && o <= 8 ? o : null, mur: accueil.mur === true }; }
// vue : la table a été reconnue au branchement ; oreille : le score du test (null : pas fait), oreillePasse : passé exprès
const ppVide = () => ({ niveau: null, table: null, modele: '', min: null, vue: false, oreille: null, oreillePasse: false });
// entree : l'entrée du premier écran a déjà été jouée ; attente : la bulle attend que Vini ait atterri ; vol : son saut vers le coin ;
// vh : Vini sur la table du premier écran ; sort : on quitte le premier écran ; fini : « Commencer » a été cliqué
// mail : l'adresse du compte créé ici ; lien : 'envoi', 'ok' ou 'rate' (le lien pour l'ordinateur) ; envoi : création en cours ;
// rate : la création a échoué faute de réseau (on peut alors continuer sans compte, pour ne jamais rester coincé)
const pp = { on: false, i: 0, rep: ppVide(), entree: false, attente: false, vol: null, vh: null, sort: false, fini: false, mail: '', lien: '', envoi: false, rate: false, prenom: '', mailTape: '' };
const PP_I = id => PP_ETAPES.indexOf(id);
// Le compte manque encore : Firebase est réglé, personne n'est connecté ici, ni ne l'a été sur ce navigateur
const ppCompteManque = () => typeof cptOn === 'function' && cptOn() && !(typeof cpt !== 'undefined' && cpt) && !(typeof cptSauve !== 'undefined' && cptSauve);
// Un nouveau venu, ou quelqu'un qui a fait le quiz sans créer son compte (lot 65 : le compte est obligatoire)
// (`mur` sans parcours : rechargé avant le compte ; avec un parcours : « Continuer sans compte pour l'instant » à la visite d'avant)
const ppAOuvrir = () => (!parcours && !accueil) || !!(accueil && accueil.mur && ppCompteManque());
const ppSave = o => { accueil = o; try { localStorage.setItem(ACC_KEY, JSON.stringify(o)); } catch (e) {} };
// Les minuteurs d'un écran, tous annulés quand l'écran change ou que les questions se ferment
let ppMinuteurs = [];
function ppPlusTard(ms, f){ const t = setTimeout(() => { ppMinuteurs = ppMinuteurs.filter(x => x !== t); f(); }, ms); ppMinuteurs.push(t); }
function ppAnnule(){
  ppMinuteurs.forEach(clearTimeout); ppMinuteurs = [];
  if (pp.vol){ pp.vol.onfinish = null; pp.vol.cancel(); pp.vol = null; }
}

function openPremiers(){
  if (pp.on) return;
  Object.assign(pp, { on: true, i: 0, rep: ppVide(), entree: false, sort: false, fini: false, mail: '', lien: '', envoi: false, rate: false, prenom: '', mailTape: '' });
  if (!$('ppVini').firstChild) viniMettre($('ppVini'));
  if (!$('ppFill').firstChild) ppOndeInit();
  $('pp').hidden = false; document.documentElement.classList.add('pp-open');
  // le quiz est déjà fait, le compte manque (rechargement, ou retour plus tard) : on reprend sur le plan
  if (accueil && accueil.mur){ Object.assign(pp.rep, { niveau: accueil.niveau, table: accueil.table, modele: accueil.modele, min: accueil.min, oreille: accueil.oreille });
    pp.entree = true; pp.i = PP_I('plan'); }
  ppRender(0);
}
function ppClose(){
  ppAnnule(); ppTapeFin(); ppOrStop(); ppMusiqueArret();
  pp.on = false; $('pp').hidden = true; document.documentElement.classList.remove('pp-open');
  $('ppScene').textContent = ''; pp.vh = null;
  ppSon.pret = null;   // le morceau décodé (23 Mo) est rendu à la mémoire (gardien du lot 52)
}
// « Voir mon plan » : les réponses sont gardées tout de suite (avec `mur` tant que le compte manque). Vini se ramasse, la musique
// s'ouvre jusqu'au temps suivant, et c'est le drop (lot 52) : il saute, les notes et les vinyles volent, et le plan apparaît.
function ppVersPlan(){
  const r = pp.rep, v = $('ppVini');
  pp.sort = true; $('ppGo').disabled = true;
  ppSave({ niveau: r.niveau, table: r.table, modele: r.modele, min: r.min, oreille: r.oreille, mur: ppCompteManque(), fini: dayKey() });
  stat1('premiers-pas-fin', { parcours: r.niveau, table: r.table === 'table' ? 'oui' : 'non' });
  goalSet(r.min);
  ppAnnule(); ppAvance(100);
  const attente = ppMusiqueDrop();
  const suite = () => { pp.sort = false; pp.i = PP_I('plan'); ppRender(1); stat1('plan-vu'); };
  if (REDUCED) return suite();
  viniPose(v, { yeux: 'fermes' }); viniHumeur(v, 'calme'); v.classList.add('pp-ramasse');
  ppPlusTard(attente, () => {
    v.classList.remove('pp-ramasse'); viniPose(v, {}); viniHumeur(v, 'parfait'); v._pose = null;
    ppDrop(v); suite();
  });
}
// La fin : le parcours qui va avec le niveau, puis sa première étape : le niveau 1 (et le guide) pour un Grand débutant, le Mode
// Expert pour un Apprenti DJ, le set (chapitre 7) pour un DJ confirmé ; sur un téléphone, « Comprendre » passe devant (lot 48)
// `sansCompte` : « Continuer sans compte pour l'instant » ; `mur` reste, et le compte sera redemandé à la visite suivante
function ppTermine(sansCompte){
  const r = pp.rep; if (pp.fini) return; pp.fini = true;
  if (accueil && accueil.mur && !sansCompte) ppSave(Object.assign({}, accueil, { mur: false }));
  ppMusiqueArret(1.2); ppClose(); setParcours(r.niveau);
  if (r.niveau === 'debut' && !cpEtape()) goLesson(1, 0); else STAGES[nextStage() || PARCOURS[r.niveau].stages[0]].go();
}
const ppPret = () => { const r = pp.rep, id = PP_ETAPES[pp.i];
  return id === 'salut' || id === 'plan' || id === 'envoye' || (id === 'compte' && !pp.envoi) || (id === 'niveau' && r.niveau !== null)
    || (id === 'oreille' && (r.oreille !== null || r.oreillePasse) && !(ppOr && !ppOr.fin)) || (id === 'table' && r.table !== null) || (id === 'objectif' && r.min !== null); };
/* L'écran de la table. Une table branchée est reconnue toute seule (ppMidi est appelé par initMidi à chaque branchement) ;
   sinon « J'ai une table » ouvre la liste par marque, qui sert seulement à savoir si DJingood la connaît déjà. */
function ppTableOpts(add){
  const r = pp.rep, b = ppBranchee();
  if (b){ r.table = 'table'; r.modele = b.id; r.vue = true;
    add({ v: 'table', txt: b.nom, sub: b.id === 'inconnue' ? 'Branchée · je ne la connais pas encore' : 'Branchée et reconnue', ic: ppMiniTable(), big: true, pick: () => {} });
    return; }
  if (r.vue){ r.vue = false; r.modele = ''; }   // elle vient d'être débranchée
  const tel = cpMobile();
  PP_TABLES.forEach(([v, txt, sub]) => add({ v, txt: tel ? PP_TABLES_TEL[v][0] : txt, sub: tel ? PP_TABLES_TEL[v][1] : sub, ic: PP_IC[v], pick: () => { r.table = v; if (v === 'souris') r.modele = ''; } }));
  const box = document.createElement('label'), t = document.createElement('span'), sel = document.createElement('select');
  box.className = 'pp-liste'; box.id = 'ppListe'; t.textContent = tel ? 'Laquelle ?' : 'Laquelle ? (si tu ne peux pas la brancher maintenant)'; sel.id = 'ppModele';
  const vide = document.createElement('option'); vide.value = ''; vide.textContent = 'Choisis ta table'; sel.appendChild(vide);
  let grp = null;
  PP_LISTE.forEach(x => { if (!grp || grp.label !== ppMarque(x.nom)){ grp = document.createElement('optgroup'); grp.label = ppMarque(x.nom); sel.appendChild(grp); }
    const o = document.createElement('option'); o.value = x.id; o.textContent = x.nom; grp.appendChild(o); });
  const autre = document.createElement('option'); autre.value = 'autre'; autre.textContent = 'Une autre table'; sel.appendChild(autre);
  sel.value = r.modele || '';
  sel.addEventListener('change', () => { r.modele = sel.value; ppMaj(); ppSautille(); });
  box.append(t, sel); $('ppOpts').appendChild(box);
  if (tel) return;   // sur un téléphone, rien à brancher : l'aide de la table attendra l'ordinateur (lot 65)
  // Lot 45 : la table est branchée mais le navigateur ne la voit pas, ou l'accès a été refusé (midi.js)
  const d = document.createElement('details'), sm = document.createElement('summary'), body = document.createElement('div');
  d.className = 'pp-aide'; d.id = 'ppAide'; body.className = 'taide-in'; midiAideRemplir(body);
  sm.textContent = midiEtat === 'refuse' ? 'Comment l’autoriser ?' : midiEtat === 'absent' ? (midiIos() ? 'Ouvrir DJingood sur un ordinateur' : 'Ouvrir DJingood dans Chrome') : 'Elle est branchée, mais je ne la vois pas ?';
  d.open = midiEtat === 'refuse' || midiEtat === 'absent';
  d.append(sm, body); $('ppOpts').appendChild(d);
}
// L'aide se montre quand on dit avoir une table et qu'aucune n'est vue, quand l'accès a été refusé, ou quand le navigateur ne
// sait pas parler aux tables (Safari) ; jamais à la souris
const ppAideVue = r => r.table !== 'souris' && (midiEtat === 'refuse' || midiEtat === 'absent' || (midiEtat === 'pret' && r.table === 'table'));
function ppTableDit(){
  const r = pp.rep, b = ppBranchee();
  if (b) return b.id === 'inconnue' ? `Je vois ta table, mais je ne la connais pas encore : je te montrerai comment la régler, ça prend deux minutes.`
    : `Je la reconnais : ta ${b.nom} est prête à jouer !`;
  // sur un téléphone (lot 65) : rien à brancher ici, la table ira sur l'ordinateur
  if (cpMobile()) return r.table === 'table' ? (r.modele && r.modele !== 'autre' ? `La ${ppNomDe(r.modele)}, super ! On la branchera sur ton ordinateur.` : 'Super ! On la branchera sur ton ordinateur, je t’enverrai le lien.')
    : r.table === 'souris' ? 'Pas de souci : on commence sur ton téléphone, au doigt.' : 'Tu as une table DJ ?';
  if (r.table === 'souris') return 'Aucun problème : tout se joue à la souris. Tu brancheras une table plus tard.';
  // ce que le navigateur a répondu (lot 45) : il ne peut pas voir de table, il attend qu'on l'autorise, ou on l'a refusé
  if (midiEtat === 'absent') return midiIos() ? 'Sur iPhone et iPad, je ne peux pas parler à une table. Continue à la souris, et ouvre DJingood sur un ordinateur pour brancher ta table.'
    : 'Ce navigateur ne sait pas parler aux tables DJ : ouvre DJingood dans Chrome ou Edge pour brancher la tienne. En attendant, tout marche à la souris.';
  if (midiEtat === 'question') return 'Ton navigateur te demande si je peux parler à ta table : clique sur « Autoriser », en haut de l’écran.';
  if (midiEtat === 'refuse') return 'Ton navigateur m’a refusé l’accès à ta table. Regarde juste en dessous comment l’autoriser.';
  if (r.table !== 'table') return 'Tu as une table DJ ?';
  if (r.modele === 'autre') return 'Pas de souci : quand tu la brancheras, je te montrerai comment la régler.';
  if (r.modele) return `Je connais la ${ppNomDe(r.modele)} : je la reconnaîtrai dès que tu la brancheras.`;
  return 'Branche-la en USB, je t’attends ! Tu peux aussi continuer : je la reconnaîtrai plus tard.';
}
// Une table vient d'être branchée ou débranchée pendant l'écran de la table : on le refait, et Vini saute de joie quand il la voit
// (le navigateur prévient plusieurs fois pour un seul branchement : on ne refait l'écran que si la table a changé)
let ppVu = '';
function ppMidi(){ const b = ppBranchee(), k = b ? b.nom : '';
  if (typeof ordiMaj === 'function') ordiMaj();   // la carte « Bienvenue sur ordinateur » suit la table (lot 65)
  if (k === ppVu) return; ppVu = k;
  if (!pp.on || PP_ETAPES[pp.i] !== 'table' || pp.fini) return;
  ppRender(0);
  if (b){ viniJoie($('ppVini')); son('reussi'); ppPlusTard(380, () => ppEclats($('ppOpts').querySelector('.pp-opt'), 36, .7)); } }
function ppOption(o, k){
  const b = document.createElement('button'); b.type = 'button'; b.className = 'pp-opt' + (o.big ? ' pp-big' : '') + (REDUCED ? '' : ' pp-entre'); b.dataset.v = String(o.v);
  // les réponses arrivent l'une après l'autre (lot 52)
  b.style.setProperty('--d', (140 + k * 85) + 'ms');
  // l'onde autour de la table reconnue dure plus longtemps que l'arrivée de la carte : on attend sa fin (gardien du lot 52)
  const fin = o.big ? 'pp-branche' : 'pp-entre';
  b.addEventListener('animationend', e => { if (e.animationName === fin) b.classList.remove('pp-entre'); });
  if (o.badge){ const g = document.createElement('span'); g.className = 'pp-badge'; g.textContent = o.badge; b.appendChild(g); }
  if (o.ic){ const ic = document.createElement('span'); ic.className = 'pp-ic'; ic.setAttribute('aria-hidden', 'true'); ic.innerHTML = o.ic; b.appendChild(ic); }
  const t = document.createElement('span'), m = document.createElement('span'); t.className = 'pp-txt'; m.textContent = o.txt; t.appendChild(m);
  if (o.sub){ const s = document.createElement('span'); s.className = 'pp-sub'; s.textContent = o.sub; t.appendChild(s); }
  b.appendChild(t);
  if (o.tag){ const s = document.createElement('span'); s.className = 'pp-tag'; s.textContent = o.tag; b.appendChild(s); }
  if (o.coche){ const c = document.createElement('span'); c.className = 'pp-check'; c.setAttribute('aria-hidden', 'true'); c.innerHTML = PP_IC.coche; b.appendChild(c); }
  b.addEventListener('click', () => { if (pp.fini) return; o.pick(); ppMaj(); ppSautille(); son('clic'); });
  return b;
}
// Un écran : la question de Vini, les réponses, le bouton du bas. `sens` : 1 en avançant, -1 en revenant, 0 sur place ;
// `vol` : la place de Vini sur la table du premier écran, quand il en vient (il saute jusqu'au coin)
function ppRender(sens, vol){
  const id = PP_ETAPES[pp.i], r = pp.rep, body = $('ppBody'), box = $('ppOpts');
  ppAnnule(); ppTapeFin(); if (id !== 'oreille') ppOrStop();
  $('ppBack').hidden = pp.i === 0 || id === 'envoye';
  $('ppSon').hidden = pp.i === 0;
  ppAvance(PP_POS[id]); ppMusiqueEtape();
  body.classList.toggle('pp-fin', id === 'plan' || id === 'compte' || id === 'envoye');   // le plan et le compte, plus longs : en haut de l'écran
  body.classList.remove('pp-intro', 'pp-derriere', 'pp-salue', 'pp-mixe', 'pp-sort');
  body.classList.toggle('pp-hero', id === 'salut');
  $('ppAsk').classList.remove('pp-cache', 'pp-pop');
  // l'entrée du premier écran ne se joue qu'une fois : en y revenant, Vini mixe déjà
  const intro = id === 'salut' && !pp.entree && !REDUCED;
  pp.attente = intro || (!!vol && !REDUCED);
  if (id === 'salut'){ ppHero(intro); pp.entree = true; }
  else { $('ppScene').hidden = true; $('ppScene').textContent = ''; pp.vh = null; }
  box.innerHTML = '';
  let k = 0;
  const add = o => box.appendChild(ppOption(o, k++));
  if (id === 'niveau') PP_NIVEAUX.forEach(([v, txt, sub], n) => add({ v, txt, sub, ic: ppBarres(n), pick: () => { r.niveau = v; } }));
  if (id === 'oreille') ppOreilleOpts();
  if (id === 'table') ppTableOpts(add);
  if (id === 'objectif') PP_MINUTES.forEach(([v, tag]) => add({ v, txt: v + ' min par jour', tag, ic: ppVinyle(v), pick: () => { r.min = v; ppMusiqueVitesse(v); } }));
  if (id === 'plan') ppPlanOpts();
  if (id === 'compte') ppCompteOpts();
  if (id === 'envoye') ppEnvoyeOpts();
  ppMaj();
  if (vol && !REDUCED && id !== 'salut') ppVol(vol);
  else if (sens && id !== 'salut') ppSautille();
  // au compte, sur ordinateur, le curseur va dans le prénom (sur un téléphone, le clavier cacherait le plan d'un coup)
  const first = box.querySelector('.pp-opt') || (id === 'compte' && !cpMobile() ? $('ppPrenom') : null) || (id === 'oreille' ? $('ppRond') : null);
  (first || $('ppCol')).focus({ preventScroll: true });
}
// Le texte du bouton du bas, selon l'écran
function ppGoTexte(){
  const id = PP_ETAPES[pp.i];
  if (id === 'salut') return 'C’est parti';
  if (id === 'objectif') return 'Voir mon plan';
  if (id === 'plan') return ppCompteManque() ? 'Garder mon plan' : 'Commencer';
  if (id === 'compte') return pp.envoi ? 'Création de ton compte…' : 'Garder mon plan';
  if (id === 'envoye') return cpEtape() && STAGES.comprendre && !STAGES.comprendre.done() ? 'Commencer la leçon 1' : 'C’est parti';
  return 'Continuer';
}
// Après un choix : les cartes cochées, ce que dit Vini et ce qu'il fait, la petite note, le bouton du bas
function ppMaj(){
  const id = PP_ETAPES[pp.i], r = pp.rep;
  const sel = { niveau: r.niveau, table: r.table, objectif: r.min }[id];
  $('ppOpts').querySelectorAll('.pp-opt').forEach(b => b.setAttribute('aria-pressed', String(sel !== null && sel !== undefined && String(sel) === b.dataset.v)));
  const liste = $('ppListe'); if (liste) liste.hidden = r.table !== 'table';
  const aide = $('ppAide'); if (aide) aide.hidden = !ppAideVue(r);
  const texte = id === 'salut' ? 'Salut, moi c’est Vini ! Je vais t’apprendre à mixer. En une minute, je te fais ton plan.'
    : id === 'niveau' ? (r.niveau === null ? 'Tu en es où avec le mix ?' : PP_NIVEAUX.find(x => x[0] === r.niveau)[3])
    : id === 'oreille' ? ppOrTexte()
    : id === 'table' ? ppTableDit()
    : id === 'plan' ? 'Ton plan est prêt !'
    : id === 'compte' ? (cpMobile() ? 'Crée ton compte gratuit pour garder ton plan. Je t’envoie aussi un lien pour l’ouvrir sur ton ordinateur.' : 'Crée ton compte gratuit pour garder ton plan et ta progression.')
    : id === 'envoye' ? `C’est bon${ppPrenomVu() ? ', ' + ppPrenomVu() : ''} ! Ton plan est gardé sur ton compte.`
    : 'Combien de temps par jour pour t’entraîner ?';
  if (ppBulle(texte) && !pp.attente) ppTaper(id === 'salut' ? pp.vh : $('ppVini'));
  if (!pp.attente) ppPose();
  const note = $('ppNote'), m = PP_MINUTES.find(x => x[0] === r.min);
  note.hidden = !(id === 'objectif' && m);
  if (!note.hidden){ note.innerHTML = PP_IC.plan; const t = document.createElement('span'), b = document.createElement('b');
    t.textContent = `Avec ${m[0]} min par jour, ta première vraie transition propre `; b.textContent = m[2]; t.appendChild(b); note.appendChild(t); }
  $('ppGo').textContent = ppGoTexte();
  $('ppGo').disabled = !ppPret() || pp.fini;
}
$('ppGo').addEventListener('click', () => {
  if (!ppPret() || pp.fini || pp.sort) return;
  const id = PP_ETAPES[pp.i];
  if (id === 'salut') ppQuitteHero();
  else if (id === 'objectif') ppVersPlan();
  else if (id === 'plan'){ if (ppCompteManque()){ pp.i = PP_I('compte'); ppRender(1); stat1('mur-vu'); } else ppTermine(); }
  else if (id === 'compte') ppCompteEnvoie();
  else if (id === 'envoye') ppTermine();
  else { pp.i++; ppRender(1); }
});
// pas de retour depuis « lien envoyé » : le compte existe déjà
$('ppBack').addEventListener('click', () => { if (pp.i > 0 && PP_ETAPES[pp.i] !== 'envoye' && !pp.fini && !pp.sort && !pp.envoi){ ppOrStop(); pp.i--; ppRender(-1); } });
// Pour le rapport des testeurs : ce que la personne a répondu en arrivant
function ppResume(){
  if (!accueil) return 'pas encore faits';
  if (accueil.passe) return 'passés sans répondre';
  const niv = PP_NIVEAUX.find(x => x[0] === accueil.niveau);
  const tab = accueil.table === 'souris' ? 'pas encore de table' : accueil.table !== 'table' ? ''
    : 'une table' + (accueil.modele === 'inconnue' ? ' (branchée, pas dans la liste)' : accueil.modele === 'autre' ? ' (pas dans la liste)' : accueil.modele ? ' : ' + ppNomDe(accueil.modele) : '');
  return [niv ? niv[1] : '', tab, accueil.min ? accueil.min + ' min par jour' : '', accueil.oreille !== null ? 'oreille ' + accueil.oreille + '/8' : '',
    accueil.mur ? 'compte pas encore créé' : ''].filter(Boolean).join(' · ');
}

/* ---------- « Ton oreille » (lot 65) : 4 « boum » pour se caler, puis 8 à taper ----------
   Le son et l'instant entendu sont ceux de la leçon 1 de « Comprendre » (cpJoue, cpEntendu, chargés après ce fichier).
   Pile : à 110 ms près, presque : à 200 ms près, comme dans la leçon. La musique des questions se tait pendant le test. */
const PP_OR_PILE = .11, PP_OR_PRESQUE = .2;
let ppOr = null;   // le test en cours : { t0, per, coups (écart en s pour chacun des 8 temps), fin }
const ppOrPhrase = n => n >= 6 ? `${n} sur 8 pile : tu as le rythme !` : n >= 3 ? `${n} sur 8 pile : c’est un bon début.` : `${n} sur 8 pile : on va l’entraîner ensemble.`;
function ppOrTexte(){
  const n = pp.rep.oreille;
  if (ppOr && !ppOr.fin) return 'Écoute les 4 premiers, puis tape sur chaque « boum » !';
  if (n === null) return 'Ton oreille ! Touche le rond : je lance 4 « boum », puis tape en rythme sur les 8 suivants.';
  return n >= 6 ? 'Tu as l’oreille, bravo ! Tu peux réessayer, ou continuer.' : 'Pas de souci : c’est exactement ce qu’on va travailler ensemble.';
}
function ppOreilleOpts(){
  const r = pp.rep, w = document.createElement('div'); w.className = 'pp-oreille';
  const b = document.createElement('button'); b.type = 'button'; b.className = 'pp-rond'; b.id = 'ppRond';
  b.setAttribute('aria-label', 'Taper sur le temps (ou la barre d’espace)'); b.textContent = r.oreille !== null ? String(r.oreille) : '▶';
  b.addEventListener('pointerdown', e => { e.preventDefault(); ppOrTouche(); });
  b.addEventListener('keydown', e => { if (e.key === 'Enter'){ e.preventDefault(); ppOrTouche(); } });   // Espace : écouté sur toute la fenêtre
  const pts = document.createElement('div'); pts.className = 'pp-points'; pts.id = 'ppPoints'; pts.setAttribute('aria-hidden', 'true');
  for (let k = 0; k < 8; k++) pts.appendChild(document.createElement('i'));
  const res = document.createElement('p'); res.className = 'pp-res'; res.id = 'ppOrRes'; res.setAttribute('role', 'status');
  res.textContent = r.oreille !== null ? ppOrPhrase(r.oreille) : ''; res.hidden = r.oreille === null;
  const passe = document.createElement('button'); passe.type = 'button'; passe.className = 'pp-passe'; passe.id = 'ppOrPasse'; passe.textContent = 'Passer cette question';
  passe.addEventListener('click', () => { if (pp.fini || pp.sort) return; ppOrStop(); r.oreille = null; r.oreillePasse = true; pp.i++; ppRender(1); });
  w.append(b, pts, res, passe); $('ppOpts').appendChild(w);
}
function ppOrTouche(){ if (!pp.on || PP_ETAPES[pp.i] !== 'oreille' || pp.fini || pp.sort) return; if (ppOr && !ppOr.fin) ppOrFrappe(cpEntendu()); else ppOrLance(); }
function ppOrLance(){
  ppOrStop();
  const e = cpJoue({ n: 12, kick: true, bpm: 124 }, .3);
  ppOr = { t0: e.t0, per: e.per, coups: [], fin: false };
  ppMusiqueBaisse(true); pp.rep.oreille = null; pp.rep.oreillePasse = false;
  $('ppPoints').querySelectorAll('i').forEach(i => { i.className = ''; });
  $('ppOrRes').hidden = true; $('ppOrPasse').hidden = true;
  ppMaj();
  const dans = s => Math.max(0, (s - ac.currentTime) * 1000);
  for (let k = 0; k < 12; k++) ppPlusTard(dans(ppOr.t0 + k * ppOr.per), () => ppOrBoum(k));
  ppPlusTard(dans(ppOr.t0 + 12 * ppOr.per + .25), ppOrFin);
}
// Le rond bat la mesure : 1, 2, 3, 4 pour se caler, puis un point à chaque temps à taper
function ppOrBoum(k){
  const r = $('ppRond'); if (!r || !ppOr) return;
  r.textContent = k < 4 ? String(k + 1) : '●'; r.classList.toggle('a-toi', k >= 4);
  r.classList.remove('boum'); void r.offsetWidth; r.classList.add('boum');
}
// Une frappe à l'instant t (entendu) : le temps le plus proche, et l'écart. Les tests l'appellent avec l'instant voulu.
function ppOrFrappe(t){
  if (!ppOr || ppOr.fin) return;
  const k = Math.round((t - ppOr.t0) / ppOr.per), r = $('ppRond');
  if (r){ r.classList.add('tape'); clearTimeout(r._tape); r._tape = setTimeout(() => r.classList.remove('tape'), 140); }
  if (k < 4 || k > 11 || ppOr.coups[k - 4] != null) return;
  const e = Math.abs(t - (ppOr.t0 + k * ppOr.per)); ppOr.coups[k - 4] = e;
  const p = $('ppPoints').children[k - 4]; if (p) p.className = e < PP_OR_PILE ? 'pile' : e < PP_OR_PRESQUE ? 'presque' : 'rate';
}
function ppOrFin(){
  if (!ppOr) return;
  ppOr.fin = true;
  const n = ppOr.coups.filter(e => e != null && e < PP_OR_PILE).length;
  pp.rep.oreille = n;
  $('ppPoints').querySelectorAll('i').forEach(i => { if (!i.className) i.className = 'rate'; });
  const r = $('ppRond'); r.textContent = String(n); r.classList.remove('a-toi');
  $('ppOrRes').textContent = ppOrPhrase(n); $('ppOrRes').hidden = false; $('ppOrPasse').hidden = false;
  ppMusiqueBaisse(false); stat1('quiz-oreille', { pile: n });
  if (n >= 6){ viniJoie($('ppVini')); son('reussi'); } else ppSautille();
  ppMaj();
}
function ppOrStop(){ if (ppOr && !ppOr.fin){ try { cpStop(); } catch (e) {} ppMusiqueBaisse(false); } ppOr = null; }
// La barre d'espace tape aussi (sur ordinateur) ; jamais pendant qu'on écrit dans un champ
window.addEventListener('keydown', e => {
  if (!pp.on || PP_ETAPES[pp.i] !== 'oreille' || e.code !== 'Space' || /INPUT|SELECT|TEXTAREA/.test((e.target && e.target.tagName) || '')) return;
  e.preventDefault(); e.stopPropagation(); if (!e.repeat) ppOrTouche();
}, true);

/* ---------- « Ton plan est prêt » (lot 65) ----------
   Trois étapes selon le niveau et l'appareil (sur un téléphone, on commence par ce qui se fait au doigt), le score de l'oreille,
   et un seul bouton : « Garder mon plan ». */
const PP_PLAN = {
  debut: tel => [
    tel ? ['tel', 'Aujourd’hui · sur ton téléphone', 'Comprendre la musique', 'Le temps, la phrase, les basses : 7 leçons de 2 minutes, au doigt.']
        : ['table', 'Aujourd’hui · avec ta table', 'Les 7 gestes du DJ', 'Lancer, fader, couper les basses, filtre, écho… en jouant.'],
    tel ? ['table', 'Sur ton ordinateur · avec ta table', 'Les 7 gestes du DJ', 'Lancer, fader, couper les basses, filtre, écho… en jouant.']
        : ['oreille', 'Ensuite', 'À l’oreille', 'Les mêmes gestes, sans compte à rebours.'],
    ['etoile', '', 'Ta première vraie transition', 'Propre, en rythme, sur de la vraie musique.']],
  apprenti: tel => [
    tel ? ['tel', 'Aujourd’hui · sur ton téléphone', 'Révise les bases', '7 leçons de 2 minutes, au doigt : va vite si tu connais.']
        : ['table', 'Aujourd’hui · avec ta table', 'Le Mode Expert', 'Les 7 gestes, notés à la milliseconde.'],
    tel ? ['table', 'Sur ton ordinateur · avec ta table', 'Le Mode Expert', 'Les 7 gestes, notés à la milliseconde.']
        : ['oreille', 'Ensuite', 'Les combos et le calage', 'Plusieurs gestes d’affilée, et deux tempos à caler.'],
    ['etoile', '', 'Des transitions vraiment propres', 'Jusqu’à ton premier set, noté sur 100.']],
  confirme: tel => [
    tel ? ['tel', 'Aujourd’hui · sur ton téléphone', 'Révise les bases', '7 leçons de 2 minutes, au doigt : va vite si tu connais.']
        : ['table', 'Aujourd’hui · avec ta table', 'Le set', 'Plusieurs morceaux enchaînés, noté sur 100.'],
    tel ? ['table', 'Sur ton ordinateur · avec ta table', 'Le set', 'Plusieurs morceaux enchaînés, noté sur 100.']
        : ['oreille', 'Ensuite', 'Le calage à l’oreille', 'Sans BPM affiché, comme en club.'],
    ['etoile', '', 'Un set à 100 sur 100', 'Hot cues, boucles, et plus aucune aide.']]
};
function ppPlanOpts(){
  const r = pp.rep, box = $('ppOpts'), niv = PP_NIVEAUX.find(x => x[0] === r.niveau) || PP_NIVEAUX[0];
  const nomTable = r.table !== 'table' ? 'Pas encore de table' : r.modele && r.modele !== 'autre' && r.modele !== 'inconnue' ? ppNomDe(r.modele) : 'Ta table';
  const res = document.createElement('div'); res.className = 'pp-resume';
  [niv[1], nomTable, r.min ? r.min + ' min par jour' : ''].filter(Boolean).forEach(t => { const s = document.createElement('span'); s.textContent = t; res.appendChild(s); });
  const quand = r.min === 5 ? 'À ton rythme' : r.min === 15 ? 'En moins de 2 semaines' : 'Dans 2 semaines';
  const ol = document.createElement('ol'); ol.className = 'pp-frise';
  (PP_PLAN[r.niveau] || PP_PLAN.debut)(cpMobile()).forEach(([ic, q, titre, txt], i) => {
    const li = document.createElement('li'); li.className = i === 0 ? 'pp-maint' : '';
    li.innerHTML = `<span class="pp-pt" aria-hidden="true">${PP_IC[ic]}</span><span><span class="pp-quand"></span><b></b><small></small></span>`;
    li.querySelector('.pp-quand').textContent = q || quand; li.querySelector('b').textContent = titre; li.querySelector('small').textContent = txt;
    ol.appendChild(li);
  });
  box.append(res, ol);
  if (r.oreille !== null){
    const s = document.createElement('p'); s.className = 'pp-score';
    s.innerHTML = `<span class="pp-ic" aria-hidden="true">${PP_IC.coche}</span><span></span>`;
    s.lastChild.textContent = `Ton oreille : ${r.oreille} « boum » sur 8 pile. ${r.oreille >= 5 ? 'On part bien !' : 'On va l’entraîner ensemble.'}`;
    box.appendChild(s);
  }
}

/* ---------- Le compte (lot 65) : obligatoire, sans mot de passe ----------
   Choix de l'utilisateur (9 nov. 2026, « B : obligatoire direct ») : juste après le plan, ni « Plus tard », ni croix. Prénom +
   e-mail ; le compte est créé tout de suite (cptCreerSansMdp, compte.js), donc ce qu'il fait ensuite sur ce téléphone part dessus.
   Google aussi, sauf dans le navigateur d'une appli (TikTok, Instagram…), où Google refuse la connexion. « J'ai déjà un compte »
   ouvre la fenêtre du compte par-dessus. Si Firebase ne répond pas du tout (pas de réseau, service bloqué), on peut continuer sans
   compte : un mur qui ne s'ouvre jamais ferait perdre le joueur pour de bon. */
const ppPrenomVu = () => { const p = (typeof cpt !== 'undefined' && cpt && cpt.prenom !== 'toi' && cpt.prenom) || pp.prenom || ''; return p; };
function ppCompteOpts(){
  const f = document.createElement('form'); f.className = 'pp-compte'; f.id = 'ppCompte'; f.noValidate = true;
  f.innerHTML = `<label class="pp-champ"><span>Ton prénom</span><input id="ppPrenom" autocomplete="given-name" maxlength="40" enterkeyhint="next"></label>
<label class="pp-champ"><span>Ton e-mail</span><input id="ppMail" type="email" autocomplete="email" inputmode="email" maxlength="120" enterkeyhint="go"></label>
<label class="pp-case" id="ppAccord"><input type="checkbox" id="ppMails"> <span>Vini peut m’écrire : un conseil par semaine au plus. Désinscription en un clic.</span></label>
<p class="pp-msg" id="ppMsg" role="status" hidden></p>
<p class="pp-mdp">Pas de mot de passe : je t’envoie un lien pour te connecter.</p>
<div class="pp-ou" id="ppOu"><span>ou</span></div>
<button type="button" class="pp-google" id="ppGoogle"></button>
<div class="pp-liens"><button type="button" class="pp-passe" id="ppDeja">J’ai déjà un compte</button><button type="button" class="pp-passe" id="ppSans" hidden>Continuer sans compte pour l’instant</button></div>
<p class="pp-legal">DJingood garde ton prénom, ton adresse et ta progression. <a href="confidentialite.html" target="_blank" rel="noopener">Ce que DJingood garde sur toi</a></p>`;
  $('ppOpts').appendChild(f);
  $('ppGoogle').innerHTML = $('cptIn').innerHTML;   // le bouton aux couleurs que Google demande (lot 54), le même que dans la fenêtre du compte
  $('ppPrenom').value = pp.prenom || ''; $('ppMail').value = pp.mailTape || '';
  $('ppPrenom').addEventListener('input', e => { pp.prenom = e.target.value.trim().slice(0, 40); });
  $('ppMail').addEventListener('input', e => { pp.mailTape = e.target.value.trim(); });
  $('ppAccord').hidden = !mlActif();
  const google = !cptAppli(); $('ppGoogle').hidden = !google; $('ppOu').hidden = !google;
  $('ppSans').hidden = !pp.rate;
  f.addEventListener('submit', e => { e.preventDefault(); if (ppPret()) ppCompteEnvoie(); });
  $('ppGoogle').addEventListener('click', () => {
    if (pp.envoi) return; ppMsg('Connexion en cours…');
    cptEntrer(mlActif() ? $('ppMails').checked : undefined).then(e => { if (e) ppMsg(cptErreur(e)); });   // la suite : cptChange → ppCompteOk
  });
  $('ppDeja').addEventListener('click', () => { if (pp.envoi) return; openCompte(); cptVa('entrer'); if (pp.mailTape) $('cptMail').value = pp.mailTape; });
  $('ppSans').addEventListener('click', () => { stat1('mur-sans-compte'); ppTermine(true); });
}
function ppMsg(t){ const m = $('ppMsg'); if (!m) return; m.textContent = t || ''; m.hidden = !t; }
function ppCompteEnvoie(){
  if (pp.envoi || pp.fini) return;
  const prenom = $('ppPrenom').value.trim().slice(0, 40), mail = $('ppMail').value.trim();
  if (!prenom){ ppMsg('Écris ton prénom : c’est comme ça que je t’appellerai.'); $('ppPrenom').focus(); return; }
  if (!cptMailOk(mail)){ ppMsg('Écris une adresse e-mail valide, comme toi@exemple.fr.'); $('ppMail').focus(); return; }
  pp.prenom = prenom; pp.envoi = true; ppMsg(''); ppMaj();
  cptCreerSansMdp(prenom, mail, $('ppAccord').hidden ? null : $('ppMails').checked).then(() => {
    pp.envoi = false; pp.mail = mail; ppCompteOk();
  }, e => {
    pp.envoi = false;
    const c = (e && e.code) || '';
    if (c === 'auth/email-already-in-use'){
      // il a déjà un compte avec cette adresse : on lui envoie un lien pour s'y connecter, sans rien créer
      ppMsg('Tu as déjà un compte avec cette adresse. Je t’envoie un lien pour te connecter…');
      cptLienEnvoie(mail).then(() => ppMsg('Tu as déjà un compte avec cette adresse : je t’ai envoyé un lien pour te connecter (regarde aussi dans les spams). Ouvre-le sur ce téléphone, ou choisis « J’ai déjà un compte ».'),
        () => ppMsg('Tu as déjà un compte avec cette adresse : choisis « J’ai déjà un compte » juste en dessous.'));
    } else {
      ppMsg(cptErreur(e));
      // Firebase ne répond pas du tout : on laisse continuer sans compte (sinon le joueur resterait bloqué ici)
      if (!c || c === 'auth/network-request-failed' || c === 'unavailable' || c === 'auth/internal-error' || c === 'auth/operation-not-allowed'){ pp.rate = true; $('ppSans').hidden = false; }
    }
    ppMaj();
  });
}
// Le compte existe : créé ici (pp.mail), ou on vient de se connecter (Google, « J'ai déjà un compte ») : cptChange l'appelle.
// Pendant une création, on attend sa réponse (Firebase annonce le compte avant qu'elle revienne).
function ppCompteOk(){
  if (!pp.on || pp.fini || pp.envoi || PP_ETAPES[pp.i] !== 'compte') return;
  if (accueil && accueil.mur) ppSave(Object.assign({}, accueil, { mur: false }));
  setParcours(pp.rep.niveau);   // tout de suite : une page rechargée ou fermée sur « lien envoyé » garde le parcours (gardien)
  // sur un téléphone, le lien qui ouvre le même compte sur l'ordinateur ; puis l'écran qui dit où il est parti
  if (pp.mail && cpMobile()){
    ppLienPart();
    pp.i = PP_I('envoye'); ppRender(1); return;
  }
  if (typeof cptToast === 'function') cptToast(`Bienvenue${ppPrenomVu() ? ' ' + ppPrenomVu() : ''} !`, 'Ton compte est créé : ton plan et ta progression sont gardés.');
  ppTermine();
}
// « Renvoyer » attend 30 secondes entre deux envois (Firebase limite les mails, et un double clic ne doit pas en envoyer deux)
const PP_RENVOI = 30000;
function ppLienPart(){
  pp.lien = 'envoi'; pp.lienAt = Date.now(); ppEnvoyeMaj();
  cptLienEnvoie(pp.mail).then(() => { pp.lien = 'ok'; ppEnvoyeMaj(); }, () => { pp.lien = 'rate'; ppEnvoyeMaj(); });
  setTimeout(ppEnvoyeMaj, PP_RENVOI + 50);
}

/* ---------- Sur un téléphone : le lien pour l'ordinateur est parti (lot 65) ---------- */
const ppMasque = m => { const [a, d] = String(m || '').split('@'); return d ? Array.from(a)[0] + '•••@' + d : String(m || ''); };
function ppEnvoyeOpts(){
  const c = document.createElement('div'); c.className = 'pp-envoye';
  c.innerHTML = `<div class="pp-mailcarte"><span class="pp-ic" aria-hidden="true">${PP_IC.mail}</span><span><b id="ppLienTitre"></b><small id="ppLienTxt"></small></span></div>
<p class="pp-spam" id="ppSpam"><b>Pas dans ta boîte de réception ?</b> Regarde dans les spams, puis indique à ta messagerie que ce n’est pas un spam : sinon, le lien ne s’ouvre pas.</p>
<div class="pp-mini"><button type="button" id="ppCopie">Copier le lien</button><button type="button" id="ppRenvoie">Renvoyer</button></div>`;
  $('ppOpts').appendChild(c);
  $('ppCopie').addEventListener('click', async e => {
    const b = e.currentTarget, url = midiLien(); let ok = false;
    try { await navigator.clipboard.writeText(url); ok = true; } catch (x) {}
    b.textContent = ok ? 'Lien copié !' : url; if (ok) setTimeout(() => { b.textContent = 'Copier le lien'; }, 2500);
  });
  $('ppRenvoie').addEventListener('click', () => { if (pp.lien === 'envoi' || Date.now() - (pp.lienAt || 0) < PP_RENVOI) return; ppLienPart(); });
  ppEnvoyeMaj();
}
function ppEnvoyeMaj(){
  const t = $('ppLienTitre'); if (!t) return;
  t.textContent = pp.lien === 'ok' ? `Ton lien pour l’ordinateur est parti à ${ppMasque(pp.mail)}` : pp.lien === 'rate' ? 'Le lien n’a pas pu partir' : 'J’envoie ton lien pour l’ordinateur…';
  $('ppLienTxt').textContent = pp.lien === 'rate' ? 'Sur ton ordinateur, ouvre djingood.fr et choisis « J’ai déjà un compte », avec la même adresse : je t’enverrai un lien là-bas.'
    : 'Ta table, ce sera sur ordinateur. Ouvre ce mail sur ton PC : tu seras connecté tout de suite.';
  // le mail d'un domaine neuf arrive souvent dans les spams, où Gmail désactive les liens (vu le 10 nov. 2026)
  $('ppSpam').hidden = pp.lien === 'rate';
  $('ppRenvoie').disabled = pp.lien === 'envoi' || Date.now() - (pp.lienAt || 0) < PP_RENVOI;
}

/* ---------- Vini réagit (lot 52) ----------
   Sa pose suit l'écran et la réponse choisie (PP_POSES) ; il fait un petit saut à chaque choix. Avec la musique, il danse calé
   sur ses temps. */
function ppPoseDe(){
  const id = PP_ETAPES[pp.i], r = pp.rep;
  if (id === 'niveau') return PP_POSES[r.niveau] || null;
  if (id === 'objectif') return PP_POSES[r.min] || null;
  // lot 65 : il écoute pendant le test de l'oreille, puis il est content ; il fête le plan, il fait un clin d'œil au compte
  if (id === 'oreille') return ppOr && !ppOr.fin ? { bras: 'oreille', calme: true } : r.oreille === null ? PP_POSES.ecoute : r.oreille >= 6 ? PP_POSES.branchee : PP_POSES.connue;
  if (id === 'plan' || id === 'envoye') return PP_POSES.branchee;
  if (id === 'compte') return PP_POSES.connue;
  if (id !== 'table') return null;
  if (ppBranchee()) return PP_POSES.branchee;
  if (r.table === 'souris') return PP_POSES.souris;
  if (r.table === 'table') return r.modele ? PP_POSES.connue : PP_POSES.ecoute;
  return midiEtat === 'question' ? PP_POSES.ecoute : null;
}
function ppPose(){
  const v = $('ppVini');
  if (PP_ETAPES[pp.i] === 'salut' || pp.vol || pp.fini) return;
  const p = ppPoseDe() || {}, cle = JSON.stringify(p);
  if (v._pose === cle) return;
  v._pose = cle; viniPose(v, p);
  if (!v.classList.contains('vn-parfait')) viniHumeur(v, p.calme ? 'calme' : 'danse');
  ppCale(v);
}
function ppSautille(){
  if (REDUCED || pp.vol) return;
  $('ppVini').animate([{ transform: 'none' }, { transform: 'translateY(-16px)', offset: .4 }, { transform: 'translateY(3px) scaleY(.95)', offset: .78 }, { transform: 'none' }],
    { duration: 380, easing: 'ease-out' });
}
// Vini danse calé sur la musique : chaque mouvement repart pile sur un temps
function ppCale(v){
  if (!ppSon.src || !v) return;
  const b = PP_TEMPS / ppSon.vitesse, c = v.classList;
  const cycle = c.contains('vn-r-lent') ? 4 : c.contains('vn-r-rapide') ? .5 : c.contains('vn-parfait') ? 2 : 1;
  v.style.setProperty('--vini-beat', b.toFixed(4) + 's'); v.style.setProperty('--vini-delay', (-(ppTemps() % cycle) * b).toFixed(3) + 's');
  const garde = [...c].filter(x => /^vn-(danse|parfait|calme|rate|r-\w+)$/.test(x));
  c.remove(...garde); void v.getBoundingClientRect(); c.add(...garde);
}

/* ---------- La bulle de Vini (lot 52) : le texte s'écrit pendant qu'il parle ----------
   La phrase est posée d'un coup, lettre par lettre, encore transparentes : la bulle a tout de suite sa taille (rien ne saute autour)
   et la phrase entière est déjà là pour les lecteurs d'écran. Puis les lettres apparaissent une à une ; toucher la bulle affiche tout. */
let ppTape = null;
// Renvoie vrai si la phrase a changé
function ppBulle(texte){
  const el = $('ppAsk');
  if (el.dataset.t === texte) return false;
  ppTapeFin(); el.dataset.t = texte; el.textContent = '';
  for (const ch of texte){ const s = document.createElement('span'); s.className = 'pp-c'; s.textContent = ch; el.appendChild(s); }
  return true;
}
// v : le Vini qui parle ; fin : appelée quand tout est écrit
function ppTaper(v, fin){
  ppTapeFin();
  const cs = [...$('ppAsk').querySelectorAll('.pp-c:not(.v)')];
  if (REDUCED || !cs.length){ cs.forEach(s => s.classList.add('v')); if (fin) fin(); return; }
  let i = 0, pause = 0;
  if (v) viniParle(v, true);
  ppTape = { v, fin, t: setInterval(() => {
    if (pause > 0){ pause--; return; }
    const c = cs[i++];
    if (!c){ const f = ppTape.fin; ppTapeFin(); if (f) f(); return; }
    c.classList.add('v');
    if ('.!?'.includes(c.textContent) && i < cs.length) pause = 7; else if (c.textContent === ',' || c.textContent === ':') pause = 3;
  }, 26) };
}
function ppTapeFin(){
  if (!ppTape) return;
  clearInterval(ppTape.t); $('ppAsk').querySelectorAll('.pp-c').forEach(s => s.classList.add('v'));
  if (ppTape.v) viniParle(ppTape.v, false);
  ppTape = null;
}
$('ppAsk').addEventListener('click', () => { if (ppTape){ const f = ppTape.fin; ppTapeFin(); if (f) f(); } });

/* ---------- Le premier écran (lot 52) : Vini sort de la platine de gauche et mixe derrière sa table ----------
   Une table dessinée (deux platines, la table de mixage, les pads). La première fois (pp-intro), elle monte et s'allume, Vini y
   tourne comme un disque, saute dehors et atterrit derrière la table (pp-derriere : le bas de son corps est caché), dit bonjour en
   agitant la main (pp-salue), puis mixe (pp-mixe) : une main scratche, l'autre tient le casque, puis passe au crossfader. */
function ppSceneSvg(){
  let pads = '', vu = '', boutons = '';
  for (let k = 0; k < 8; k++) pads += `<rect class="ps-pad ${k > 3 ? 'ps-pad-b' : 'ps-pad-a'}" style="--k:${k}" x="${(k > 3 ? 266 : 50) + (k % 4) * 24}" y="293" width="20" height="10" rx="3"/>`;
  [[191, ''], [203, ' ps-vu-d']].forEach(([x, d]) => { for (let k = 0; k < 6; k++) vu += `<rect class="ps-vu ps-vu${k} ${k > 3 ? 'ps-vu-o' : 'ps-vu-v'}${d}" x="${x}" y="${283 - k * 7}" width="6" height="5" rx="1.2"/>`; });
  [172, 228].forEach(x => [217, 231, 245].forEach(y => { boutons += `<ellipse class="ps-bouton" cx="${x}" cy="${y}" rx="5.5" ry="3.6"/><path class="ps-trait" d="M${x} ${y}v-3"/>`; }));
  const anneau = (cx, c) => `<path class="ps-lueur ${c}" d="${ppEllipse(cx, 254, 60, 32.4)}"/><path class="ps-anneau ${c}" pathLength="100" d="${ppEllipse(cx, 254, 60, 32.4)}"/>`;
  const plateau = (cx, c) => `<g transform="translate(${cx} 254) scale(1 .54)"><g class="ps-plat ${c}"><circle class="ps-plateau" r="52"/><circle class="ps-sillon" r="44"/><circle class="ps-sillon" r="35"/><rect class="ps-repere" x="-3" y="-51" width="6" height="17" rx="3"/><circle class="ps-axe" r="9"/></g></g>`;
  const bras = (c, d, x, y) => `<g class="ps-bras ${c}"><g class="ps-bras-in"><path class="vn-st vn-s-m6 ps-bras-trait" d="${d}"/><circle class="vn-cr" cx="${x}" cy="${y}" r="7.5"/></g></g>`;
  const note = (x, y, c) => `<g transform="translate(${x} ${y})"><g class="ps-note ${c}"><ellipse rx="6.5" ry="5" transform="rotate(-20)"/><rect x="4.5" y="-22" width="3" height="22" rx="1.5"/><path d="M6 -22Q16 -18 14 -8Q11 -14 6 -15Z"/></g></g>`;
  // Vini en disque sur la platine de gauche, avant de sauter : son visage tourne avec le disque
  const disque = `<g class="ps-disque" transform="translate(92 252) scale(1 .54)"><g class="ps-disque-rot"><circle class="vn-m6" r="46"/><circle class="vn-m5" r="43"/><circle class="vn-st vn-s-m6 vn-sillon" r="37"/><circle class="vn-st vn-s-m6 vn-sillon" r="31"/><circle class="vn-cr" r="24"/>
<g transform="scale(.5) translate(-120 -132)"><ellipse class="vn-ink" cx="105" cy="120" rx="7.5" ry="12.5"/><ellipse class="vn-ink" cx="135" cy="120" rx="7.5" ry="12.5"/><path class="vn-cr" d="M106.5 117 L114 106 L118 113 Z"/><path class="vn-cr" d="M136.5 117 L144 106 L148 113 Z"/><path class="vn-ink" d="M98 139 Q120 163 142 139 Q120 151 98 139 Z"/></g></g></g>`;
  return `<svg class="ps" viewBox="0 24 400 312" aria-hidden="true" focusable="false">
<defs><radialGradient id="psHalo"><stop offset="0" class="ps-halo1"/><stop offset=".6" class="ps-halo2"/><stop offset="1" class="ps-halo3"/></radialGradient>
<clipPath id="psDerriere"><rect x="-60" y="-80" width="520" height="286"/></clipPath></defs>
<ellipse class="ps-halo" cx="200" cy="150" rx="175" ry="135" fill="url(#psHalo)"/>
<g class="ps-table">
<ellipse class="ps-ombre" cx="200" cy="331" rx="194" ry="8"/><rect class="ps-face" x="8" y="224" width="384" height="104" rx="22"/><rect class="ps-haut" x="8" y="204" width="384" height="108" rx="22"/><path class="ps-reflet" d="M36 206.5H364"/>
<ellipse class="ps-bord" cx="92" cy="254" rx="66" ry="36"/><ellipse class="ps-bord" cx="308" cy="254" rx="66" ry="36"/>
${anneau(92, 'ps-a')}${anneau(308, 'ps-b')}${plateau(92, 'ps-plat-g')}${plateau(308, 'ps-plat-d')}${disque}${boutons}
<path class="ps-fente" d="M172 262V290M228 262V290M184 303H216"/><rect class="ps-cap" x="164" y="264" width="16" height="7" rx="2"/><rect class="ps-cap" x="220" y="264" width="16" height="7" rx="2"/>
${vu}<rect class="ps-cap ps-xf" x="195" y="299" width="10" height="8" rx="2"/>${pads}
<text class="ps-marque" x="200" y="323">DJINGOOD</text>
</g>
<g class="ps-vini-clip"><g class="ps-vini">${VINI_SVG.replace('<svg ', '<svg class="vini" x="-90" y="-99" width="180" height="195" overflow="visible" ')}</g></g>
${bras('ps-bg', 'M147 194Q114 204 110 240', 110, 244)}${bras('ps-boreille', 'M253 194Q300 198 285 148', 283, 142)}${bras('ps-bfader', 'M253 194Q260 252 214 297', 211, 300)}${bras('ps-bsalut', 'M253 194Q300 188 298 128', 298, 121)}
<g class="ps-notes">${note(54, 222, 'ps-n1')}${note(346, 220, 'ps-n2')}${note(198, 236, 'ps-n3')}</g>
</svg>`;
}
// La place de Vini sur la table (son cadre de 240 × 260), là où il est au repos, en pixels de la page
function ppPlaceVh(){
  const s = $('ppScene').firstElementChild; if (!s) return null;
  const r = s.getBoundingClientRect(), k = r.width / 400;
  return { left: r.left + 110 * k, top: r.top + (51 - 24) * k, width: 180 * k, height: 195 * k };
}
function ppHero(intro){
  const box = $('ppScene'), body = $('ppBody');
  box.innerHTML = ppSceneSvg(); box.hidden = false;
  const v = box.querySelector('.vini'); pp.vh = v;
  viniHumeur(v, 'calme');
  if (!intro){ viniPose(v, { bras: 'aucun', rythme: 'hoche' }); body.classList.add('pp-derriere', 'pp-mixe'); return; }
  viniPose(v, { bras: 'aucun' });
  body.classList.add('pp-intro');
  ppPlusTard(2090, () => body.classList.add('pp-derriere'));
  ppPlusTard(2420, () => {
    pp.attente = false; viniPose(v, { bras: 'aucun', rythme: 'hoche' }); body.classList.add('pp-salue');
    ppEclats(v, 16, .5);
    ppTaper(v, () => ppPlusTard(900, () => { body.classList.remove('pp-salue'); body.classList.add('pp-mixe'); }));
  });
}
// « C'est parti » : la musique démarre, la table s'en va, Vini saute jusqu'au coin
function ppQuitteHero(){
  ppMusiqueLance();
  const r = ppPlaceVh();
  if (REDUCED || !r){ pp.i++; ppRender(1); return; }
  ppAnnule(); ppTapeFin(); pp.sort = true;
  $('ppBody').classList.remove('pp-intro'); $('ppBody').classList.add('pp-sort');
  ppPlusTard(230, () => { pp.sort = false; pp.i++; ppRender(1, r); });
}
// Le saut de la table au coin : #ppVini part de la place qu'avait Vini sur la table et y saute en arc, puis il parle
function ppVol(r){
  const v = $('ppVini'), a = v.getBoundingClientRect(), b = $('ppAsk');
  const dx = r.left - a.left, dy = r.top - a.top, s = r.width / a.width;
  viniHumeur(v, 'calme'); viniPose(v, { bras: 'haut', bouche: 'ouverte' }); v._pose = null;
  b.classList.add('pp-cache');
  const an = v.animate([
    { transform: `translate(${dx}px,${dy}px) scale(${s})` },
    { transform: `translate(${dx * .45}px,${dy * .45 - 90}px) scale(${(s + 1) / 2}) rotate(-12deg)`, offset: .45 },
    { transform: 'none' }
  ], { duration: 720, easing: 'cubic-bezier(.33,.66,.4,1)' });
  pp.vol = an;
  // un onglet en arrière-plan peut retenir l'animation : au bout d'une seconde, Vini parle quand même
  const suite = () => { if (pp.vol !== an) return; pp.vol = null; an.onfinish = null; an.cancel();
    pp.attente = false; b.classList.remove('pp-cache'); b.classList.add('pp-pop'); ppSautille(); ppPose(); ppTaper(v); };
  an.onfinish = suite; ppPlusTard(1000, suite);
}

/* ---------- La barre d'avancement en forme d'onde (lot 52) ----------
   Comme l'aperçu d'un morceau dans un logiciel de DJ : une intro calme, une montée, une petite pause, puis le drop. La partie jouée
   est violette, la tête de lecture avance d'une question à l'autre et arrive au drop avec « Commencer ». */
function ppOndeSvg(drop){
  let r = '';
  for (let k = 0; k < 64; k++){
    const u = k / 63, bruit = Math.abs(Math.sin(k * 12.9898) * 43758.5453) % 1;
    const a = u < .2 ? .2 + bruit * .18 : u < .7 ? .3 + (u - .2) / .5 * .42 + bruit * .16 : u < .77 ? .16 + bruit * .1 : .8 + bruit * .2, h = 4 + a * 20;
    r += `<rect${drop && u > .77 ? ' class="pp-fort"' : ''} x="${k * 4 + .7}" y="${(13 - h / 2).toFixed(1)}" width="2.6" height="${h.toFixed(1)}" rx="1.3"/>`;
  }
  return `<svg viewBox="0 0 256 26" preserveAspectRatio="none" aria-hidden="true">${r}</svg>`;
}
function ppOndeInit(){ $('ppBar').insertAdjacentHTML('afterbegin', ppOndeSvg(false)); $('ppFill').innerHTML = ppOndeSvg(true); $('ppBar').insertAdjacentHTML('beforeend', '<b class="pp-tete"></b>'); }
function ppAvance(p){
  const f = $('ppFill'), c = `inset(0 ${100 - p}% 0 0)`, t = $('ppBar').querySelector('.pp-tete');
  f.style.clipPath = c; f.style.webkitClipPath = c; if (t) t.style.left = p + '%';
  $('ppBar').setAttribute('aria-valuenow', String(Math.round(p)));
}

/* ---------- La musique (lot 52) ----------
   Après « C'est parti », « Deep House » (alexrockbeat, Pixabay : le morceau A de la vraie musique, à 124 BPM, coupé pile sur
   un temps ; « Dj » de Play House jusqu'au lot 57) joue en boucle derrière un filtre : étouffé, comme entendu de la pièce d'à côté, il s'ouvre un peu plus à chaque question (PP_COUPURE) ;
   l'objectif du jour le ralentit ou l'accélère, comme le tempo d'une platine ; « Commencer » est le drop : le filtre s'ouvre en grand
   sur le temps suivant. Elle suit le bouton des sons (coach-sons) et s'arrête quand les questions se ferment. */
const PP_MUSIQUE = 'musique/niv-deep-a.mp3';
const PP_TEMPS = 60 / 124;   // un temps du morceau, en secondes
// après le drop (plan, compte, lien envoyé), le filtre reste grand ouvert
const PP_COUPURE = { salut: 380, niveau: 380, oreille: 600, table: 820, objectif: 1900, plan: 16000, compte: 16000, envoye: 16000 };
const PP_VITESSE = { 5: .94, 10: 1, 15: 1.07 };
const ppSon = { pret: null, src: null, filtre: null, gain: null, t0: 0, pos0: 0, vitesse: 1 };
function ppMusiquePrepare(){
  if (!ppSon.pret) ppSon.pret = fetch(PP_MUSIQUE).then(r => { if (!r.ok) throw quiet('musique ' + r.status); return r.arrayBuffer(); })
    .then(vraiDecode).catch(() => { ppSon.pret = null; return null; });
  return ppSon.pret;
}
// Appelée par un clic : le navigateur laisse alors le son partir. Le morceau n'est téléchargé qu'à ce moment (un visiteur qui
// passe les questions ne télécharge rien). Pas de navigator.audioSession ici, contrairement aux leçons « Comprendre » : cette
// musique est un décor, elle respecte le mode silencieux de l'iPhone et ne coupe pas celle d'une autre appli (gardien du lot 52).
function ppMusiqueLance(){
  if (!sonsOn || ppSon.src || !pp.on) return;
  ensureAudio(); if (ac.state !== 'running') ac.resume();
  ppMusiquePrepare().then(buf => {
    if (!buf || ppSon.src || !pp.on || pp.fini || !sonsOn) return;
    const src = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain(), t = ac.currentTime + .05;
    src.buffer = buf; src.loop = true; f.type = 'lowpass'; f.Q.value = .7; f.frequency.value = PP_COUPURE[PP_ETAPES[pp.i]];
    g.gain.value = 0; src.connect(f); f.connect(g); g.connect(master); src.start(t); g.gain.setTargetAtTime(.55, t, .3);
    Object.assign(ppSon, { src, filtre: f, gain: g, t0: t, pos0: 0, vitesse: 1 });
    if (PP_ETAPES[pp.i] === 'objectif' && pp.rep.min) ppMusiqueVitesse(pp.rep.min); else ppCale($('ppVini'));
  });
}
// Onglet caché : la musique des questions se tait, et revient quand on revient (gardien du lot 52)
document.addEventListener('visibilitychange', () => {
  if (!ppSon.src || pp.fini) return;
  const g = ppSon.gain.gain, t = ac.currentTime;
  g.cancelScheduledValues(t); g.setValueAtTime(g.value, t); g.setTargetAtTime(document.hidden ? 0 : .55, t, .1);
});
// Où en est le morceau, en temps (sans musique : 0)
const ppTemps = () => ppSon.src ? ppSon.pos0 + (ac.currentTime - ppSon.t0) * ppSon.vitesse / PP_TEMPS : 0;
function ppMusiqueEtape(){
  if (!ppSon.src || pp.fini) return;
  const id = PP_ETAPES[pp.i];
  ppSon.filtre.frequency.setTargetAtTime(PP_COUPURE[id], ac.currentTime, .4);
  // pendant qu'on écrit son prénom et son adresse, la musique se fait plus discrète (lot 65)
  if (id === 'compte' || id === 'envoye') ppSon.gain.gain.setTargetAtTime(.32, ac.currentTime, .5);
}
// Pendant le test de l'oreille, la musique des questions se tait presque : on n'entend que les « boum » (lot 65)
function ppMusiqueBaisse(oui){ if (ppSon.src && !document.hidden) ppSon.gain.gain.setTargetAtTime(oui ? .05 : .55, ac.currentTime, .12); }
function ppMusiqueVitesse(min){
  const v = PP_VITESSE[min] || 1;
  if (!ppSon.src || v === ppSon.vitesse) return;
  ppSon.pos0 = ppTemps(); ppSon.t0 = ac.currentTime; ppSon.vitesse = v;
  ppSon.src.playbackRate.setValueAtTime(v, ppSon.t0); ppCale($('ppVini'));
}
function ppMusiqueArret(duree = .3){
  if (!ppSon.src) return;
  const { src, gain } = ppSon, t = ac.currentTime;
  gain.gain.cancelScheduledValues(t); gain.gain.setValueAtTime(gain.gain.value, t); gain.gain.linearRampToValueAtTime(0, t + duree);
  try { src.stop(t + duree + .05); } catch (e) {}
  ppSon.src = null; ppSon.vitesse = 1;
}
// Le drop : le filtre s'ouvre jusqu'au prochain temps (au moins 0,7 temps d'attente). Renvoie l'attente, en millisecondes.
function ppMusiqueDrop(){
  if (!ppSon.src) return 450;
  const t = ac.currentTime, b = ppTemps(), dt = (Math.ceil(b + .7) - b) * PP_TEMPS / ppSon.vitesse, f = ppSon.filtre.frequency, g = ppSon.gain.gain;
  f.cancelScheduledValues(t); f.setValueAtTime(f.value, t); f.exponentialRampToValueAtTime(16000, t + dt);
  g.cancelScheduledValues(t); g.setValueAtTime(g.value, t); g.linearRampToValueAtTime(.9, t + dt);
  return dt * 1000;
}
// Le bouton de la musique, à côté de « Passer » : c'est le même réglage que le haut-parleur de l'en-tête (coach-sons)
function ppSonRendu(){
  const b = $('ppSon');
  b.setAttribute('aria-pressed', String(sonsOn)); b.setAttribute('aria-label', sonsOn ? 'Musique : activée' : 'Musique : coupée');
  b.title = sonsOn ? 'Couper la musique' : 'Remettre la musique'; b.innerHTML = sonsIcone(sonsOn);
}
$('ppSon').addEventListener('click', () => {
  sonsOn = !sonsOn; try { localStorage.setItem('coach-sons', sonsOn ? '1' : '0'); } catch (e) {}
  renderSons(); ppSonRendu();
  if (sonsOn) ppMusiqueLance(); else ppMusiqueArret();
});
ppSonRendu();

/* ---------- Éclats (lot 52) : des notes, des étoiles et de petits vinyles, au drop et quand une table est reconnue ---------- */
const ppFx = { parts: [], raf: 0, d: 1, cols: null };
function ppEclats(el, n, force = 1){
  if (REDUCED || !el) return;
  const cv = $('ppEclats'), r = el.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height * .45;
  if (!ppFx.cols){ const cs = getComputedStyle(document.documentElement); ppFx.cols = ['--brand', '--brand-light', '--a', '--vini-spark', '--vini-cream'].map(k => cs.getPropertyValue(k).trim()); }
  if (!ppFx.raf){ ppFx.d = Math.min(2, window.devicePixelRatio || 1); cv.width = innerWidth * ppFx.d; cv.height = innerHeight * ppFx.d; }
  const formes = ['note', 'etoile', 'disque', 'bande'];
  for (let i = 0; i < n; i++){
    const a = -Math.PI / 2 + (Math.random() - .5) * Math.PI * 1.3, vit = (4 + Math.random() * 9) * force;
    ppFx.parts.push({ x, y, vx: Math.cos(a) * vit, vy: Math.sin(a) * vit - 1.5 * force, r: Math.random() * 6.28, vr: (Math.random() - .5) * .3, t: 0,
      vie: 60 + Math.random() * 45, s: 5 + Math.random() * 6, c: ppFx.cols[i % 4], f: formes[(Math.random() * formes.length) | 0] });
  }
  if (!ppFx.raf) ppFx.raf = requestAnimationFrame(ppEclatsPas);
}
function ppEclatsPas(){
  const g = $('ppEclats').getContext('2d');
  g.setTransform(ppFx.d, 0, 0, ppFx.d, 0, 0); g.clearRect(0, 0, innerWidth, innerHeight);
  ppFx.parts = ppFx.parts.filter(p => p.t < p.vie);
  for (const p of ppFx.parts){
    p.t++; p.vy += .3; p.vx *= .985; p.vy *= .985; p.x += p.vx; p.y += p.vy; p.r += p.vr;
    const s = p.s;
    g.save(); g.globalAlpha = Math.min(1, (p.vie - p.t) / 22); g.translate(p.x, p.y); g.rotate(p.r); g.fillStyle = p.c; g.strokeStyle = p.c;
    if (p.f === 'note'){ g.beginPath(); g.ellipse(0, 0, s * .62, s * .46, -.35, 0, 6.29); g.fill(); g.fillRect(s * .4, -s * 1.9, s * .24, s * 1.9);
      g.beginPath(); g.moveTo(s * .52, -s * 1.9); g.quadraticCurveTo(s * 1.4, -s * 1.6, s * 1.2, -s * .9); g.lineWidth = s * .2; g.stroke(); }
    else if (p.f === 'etoile'){ g.beginPath(); for (let k = 0; k < 10; k++){ const rr = k % 2 ? s * .42 : s, aa = k * Math.PI / 5; g.lineTo(Math.cos(aa) * rr, Math.sin(aa) * rr); } g.closePath(); g.fill(); }
    else if (p.f === 'disque'){ g.beginPath(); g.arc(0, 0, s * .8, 0, 6.29); g.fill(); g.fillStyle = ppFx.cols[4]; g.beginPath(); g.arc(0, 0, s * .3, 0, 6.29); g.fill(); }
    else g.fillRect(-s * .5, -s * .18, s, s * .36);
    g.restore();
  }
  ppFx.raf = ppFx.parts.length ? requestAnimationFrame(ppEclatsPas) : 0;
  if (!ppFx.raf) g.clearRect(0, 0, innerWidth, innerHeight);
}
// Le drop : un éclair de lumière, une onde qui part de Vini, et les éclats
function ppDrop(v){
  if (REDUCED) return;
  const r = v.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height * .45;
  const f = document.createElement('i'), c = document.createElement('i');
  f.className = 'pp-flash'; f.style.setProperty('--x', x + 'px'); f.style.setProperty('--y', y + 'px');
  c.className = 'pp-choc'; c.style.left = x + 'px'; c.style.top = y + 'px';
  $('pp').append(f, c); setTimeout(() => { f.remove(); c.remove(); }, 900);
  ppEclats(v, 130, 1.15);
}
