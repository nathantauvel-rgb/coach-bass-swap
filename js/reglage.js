// Régler une autre table que la DDJ-FLX4, pas à pas (lot 19) : le site demande chaque commande, on la bouge, il la reconnaît.
// Tous les fichiers de js/ partagent la même portée et sont chargés dans l'ordre indiqué dans index.html.
'use strict';
/* ---------- Régler ma table ----------
   Une commande par étape, avec le schéma allumé. Potard ou fader : reconnu quand il a envoyé 3 valeurs différentes
   (un bouton appuyé par erreur ne suffit pas), éloignées d'au moins REG_ECART crans (lot 55 : un potard usé qui tremble
   tout seul envoie 2 ou 3 valeurs voisines, et il était pris pour la commande demandée, ce qui décalait toutes les
   suivantes) ; le second message d'un potard « fin » (numéro + 32, envoyé juste après le premier) est ignoré.
   Bouton : une note, ou un message de potard qui passe de 127 à 0 (appui puis relâche).
   Une commande déjà reconnue à une autre étape est refusée. « Je n'ai pas cette commande » : elle se fera à l'écran.
   Rien n'est enregistré avant « Enregistrer » ; Échap ou la croix annulent. Le résultat : coach-midi-map (seulement les
   commandes reconnues) et coach-table (le nom de la table).
   Lot 73 « Ta table, dès le début » : le même moteur sert aussi
   - aux Premiers pas (ou : 'pp') : une table inconnue y règle ses 3 premiers boutons, dessinés dans l'écran des questions,
     ou une table reconnue y règle le seul bouton qui ne répond pas (garde : on garde tous ses autres réglages) ;
   - juste avant un niveau (quoi : 'juste') : une table réglée à la main règle les boutons de ce niveau qu'elle n'a pas encore
     montrés, puis la partie démarre ;
   - à l'arrivée sur l'ordinateur par le lien (quoi : 'court', compte.js) : les 3 premiers boutons, dans cette fenêtre.
   Les commandes passées (« Je n'ai pas cette commande ») d'une table réglée à la main vont dans coach-table.ecran : elles se
   font à l'écran, et le site ne les redemande plus. */
const REG_STEPS = [
  { k: 'faderA', name: 'le fader de volume de gauche', text: 'Monte puis descends le fader de volume de la platine A : le curseur vertical à gauche du centre.' },
  { k: 'faderB', name: 'le fader de volume de droite', text: 'Monte puis descends le fader de volume de la platine B : le curseur vertical à droite du centre.' },
  { k: 'lowA', name: 'le potard LOW de gauche', text: 'Tourne le potard des basses de la platine A. Il s’appelle LOW (ou BASS) : c’est le plus bas des potards de son, juste au-dessus du fader.' },
  { k: 'lowB', name: 'le potard LOW de droite', text: 'Tourne le potard des basses de la platine B.' },
  { k: 'midA', name: 'le potard MID de gauche', text: 'Tourne le potard MID de la platine A, juste au-dessus du LOW.' },
  { k: 'cfxA', name: 'le filtre de gauche', text: 'Tourne le filtre de la platine A. Selon les tables, il s’appelle CFX, FILTER ou COLOR.' },
  { k: 'playB', name: 'le bouton PLAY de droite', text: 'Appuie sur le bouton PLAY de la platine B (souvent marqué ▶).' },
  { k: 'fxOn', name: 'le bouton de l’effet', text: 'Appuie sur le bouton qui allume les effets : ON, FX ON ou BEAT FX selon les tables. Pas de bouton d’effet ? À l’écran, le bouton ECHO ou la touche E font pareil.' }
];
// Les boutons des 3 exercices gratuits (lot 73) : lancer B, et les deux faders
const REG_PREMIERS = ['faderA', 'faderB', 'playB'];
// Le nom des autres commandes, pour « Ça, c'est … » quand on règle un seul bouton d'une table déjà réglée (mode garde)
const REG_NOMS = { midB: 'le potard MID de droite', hiA: 'le potard HI de gauche', hiB: 'le potard HI de droite', trimA: 'le potard TRIM de gauche',
  trimB: 'le potard TRIM de droite', cfxB: 'le filtre de droite', xfader: 'le crossfader', tempoA: 'le tempo de gauche', tempoB: 'le tempo de droite',
  playA: 'le bouton PLAY de gauche', cueA: 'le bouton CUE de gauche', cueB: 'le bouton CUE de droite', pflA: 'le CUE casque de gauche', pflB: 'le CUE casque de droite' };
const regNomDe = k => (REG_STEPS.find(s => s.k === k) || {}).name || REG_NOMS[k] || 'une autre commande';
// releve (lot 55) : tout ce que la table a envoyé pendant chaque étape, pour « Copier le relevé » à la fin. Un joueur dont la
// table ne se règle pas bien nous l'envoie : on voit enfin ce que chaque commande envoie vraiment.
// steps : les étapes de ce réglage ; ou : 'fenetre' (la fenêtre #reg) ou 'pp' (l'écran de la table des Premiers pas) ;
// svg, pre : le schéma qui suit la table et le préfixe de ses identifiants ; garde : on ajoute aux réglages actuels au lieu de
// les remplacer ; quoi : '', 'juste' (avant un niveau) ou 'court' (les 3 premiers boutons) ; apres(n) : appelé une fois
// enregistré (n = commandes reconnues) ; apresTexte : le bouton de la fin, dans la fenêtre.
const reg = { active: false, i: 0, got: {}, seen: {}, last: {}, msg: '', wait: false, nom: '', timer: 0, releve: {},
  steps: REG_STEPS, ou: 'fenetre', svg: null, pre: 'rg-', garde: false, quoi: '', apres: null, apresTexte: '' };
const REG_ECART = 12;   // sur 127 : environ un dixième de la course d'un potard ou d'un fader
let tableLater = false;   // « Plus tard » : le bandeau ne revient qu'au prochain chargement de la page
const capFirst = t => t.charAt(0).toUpperCase() + t.slice(1);
// Le schéma est celui des fiches (même dessin, identifiants préfixés rg- pour ne pas les mélanger, ses dégradés aussi : lot 73)
$('regSvg').innerHTML = $('onbSvg').innerHTML.replace(/(id="|url\(#)sv-/g, '$1rg-');
// La table à régler : la première qui n'est pas une FLX4 (ou la FLX4 elle-même, si on la règle à la main)
const regName = () => midiNames.find(n => !isFlx4(n)) || midiNames[0] || '';
const regKind = (k, m) => MIDI_CC.includes(k) || !!(m && m.cc);
// La commande qui envoie déjà ce message : une étape de ce réglage, ou (mode garde) un réglage enregistré de cette table
function regProprio(cc, ch, n, sauf){
  for (const s of reg.steps) if (s.k !== sauf && reg.got[s.k] && regKind(s.k, reg.got[s.k]) === cc && midiSame(reg.got[s.k], ch, n)) return s.k;
  if (reg.garde) for (const k of MIDI_CC.concat(MIDI_NOTE)) if (k !== sauf && !reg.got[k] && map[k] && regKind(k, map[k]) === cc && midiSame(map[k], ch, n)) return k;
  return null;
}
const regOwner = (k, got) => regProprio(regKind(k, got), got.ch, got.n, k);

// Démarre un réglage ; renvoie false s'il ne peut pas commencer (pas de table, une partie en cours, un réglage déjà ouvert)
function regDemarre(o = {}){
  if (!midiCount || run || reg.active) return false;
  learnKey = null;
  const steps = o.cles ? REG_STEPS.filter(s => o.cles.includes(s.k)) : REG_STEPS; if (!steps.length) return false;
  Object.assign(reg, { active: true, i: 0, got: {}, seen: {}, last: {}, msg: '', wait: false, nom: regName(), releve: {}, steps, pos: {},
    ou: o.ou || 'fenetre', svg: o.svg || $('regSvg'), pre: o.pre || 'rg-', garde: !!o.garde, quoi: o.quoi || '', apres: o.apres || null, apresTexte: o.apresTexte || '' });
  if (reg.ou === 'fenetre'){ $('reg').hidden = false; renderTableBar(); renderReg(); setTimeout(() => $('regSkip').focus(), 30); }
  else regRendu();
  return true;
}
function openReg(){ regDemarre(); }
function closeReg(){ reg.active = false; clearTimeout(reg.timer); $('reg').hidden = true; renderTableBar(); }
// Les Premiers pas abandonnent leur réglage (on change d'écran, la table est débranchée, les questions se ferment) : rien n'est gardé
function regAnnulePp(){ if (reg.active && reg.ou === 'pp'){ reg.active = false; clearTimeout(reg.timer); } }
// Ce qui se voit : la fenêtre, ou l'écran de la table des Premiers pas (premiers.js)
function regRendu(){ if (reg.ou === 'fenetre') renderReg(); else if (typeof ppRegRendu === 'function') ppRegRendu(); }
function regGo(i){
  clearTimeout(reg.timer); Object.assign(reg, { i, seen: {}, last: {}, msg: '', wait: false }); if (reg.steps[i]) reg.releve[reg.steps[i].k] = {};
  // aux Premiers pas, pas de dernier écran : la dernière étape faite, c'est enregistré
  if (reg.ou !== 'fenetre' && i >= reg.steps.length) return regFini();
  regRendu();
}
// « Je n'ai pas cette commande » : elle se fera à l'écran
function regPasse(){ if (reg.active && reg.i < reg.steps.length){ delete reg.got[reg.steps[reg.i].k]; regGo(reg.i + 1); } }
function regFini(){
  const n = Object.keys(reg.got).length, apres = reg.apres;
  if (n) regSave(); else { reg.active = false; clearTimeout(reg.timer); if (apres) apres(0); }
}
// Le relevé : chaque message reçu pendant l'étape, regroupé par commande (type, canal, numéro), avec le nombre et les valeurs
function regNote(type, ch, d1, d2){
  const st = reg.steps[reg.i]; if (!st) return;
  const genre = type === 0xB0 ? 'cc' : type === 0x90 || type === 0x80 ? 'note' : 'autre', id = genre + ':' + type + ':' + ch + ':' + d1;
  const r = reg.releve[st.k] || (reg.releve[st.k] = {}); if (!r[id] && Object.keys(r).length >= 40) return;
  const x = r[id] || (r[id] = { genre, type, ch, n: d1, nb: 0, min: 127, max: 0 });
  x.nb++; x.min = Math.min(x.min, d2); x.max = Math.max(x.max, d2);
}
function regReleveTxt(){
  const quoi = x => x.genre === 'cc' ? 'potard, fader ou bouton (CC)' : x.genre === 'note' ? 'bouton (note)' : `autre message (${x.type.toString(16).toUpperCase()})`;
  const L = [`Relevé DJingood du ${dayKey()} (« Régler ma table »)`, `Table : ${reg.nom || midiNames.join(', ') || 'aucune branchée'}`, ''];
  for (const s of reg.steps){
    const g = reg.got[s.k], r = Object.values(reg.releve[s.k] || {}).sort((a, b) => b.nb - a.nb);
    L.push(`${capFirst(s.name)} : ${g ? `reconnu, canal ${g.ch + 1}, numéro ${g.n}${g.cc ? ' (bouton en CC)' : ''}` : 'pas reconnu'}`);
    if (!r.length) L.push('  rien reçu');
    for (const x of r.slice(0, 6)) L.push(`  ${quoi(x)}, canal ${x.ch + 1}, numéro ${x.n} : ${x.nb} message${x.nb > 1 ? 's' : ''}, valeurs ${x.min} à ${x.max}`);
    if (r.length > 6) L.push(`  et ${r.length - 6} autre${r.length > 7 ? 's' : ''}`);
  }
  return L.join('\n');
}
function regCopier(){
  const t = regReleveTxt(), show = () => { const a = $('regOut'); a.value = t; a.hidden = false; a.focus(); a.select(); };
  const ok = () => { const el = $('regState'); el.className = 'regstate ok'; el.textContent = 'Relevé copié ! Colle-le dans un message (Ctrl + V) et envoie-le-nous.'; };
  if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(t).then(ok, show); else show();
}

function regMidi(type, ch, d1, d2){
  const st = reg.steps[reg.i]; if (!st) return;
  regNote(type, ch, d1, d2);
  const btn = MIDI_NOTE.includes(st.k), id = ch + ':' + d1, svg = reg.svg, pre = reg.pre; let got = null;
  // Le schéma suit la table : une commande déjà reconnue bouge à sa place, sinon c'est celle qu'on attend qui bouge
  const own = type === 0xB0 || type === 0x90 ? regProprio(type === 0xB0, ch, d1) : null;
  // la dernière position vue de chaque potard ou fader reconnu : elle sert de position réelle une fois enregistré (gardien du
  // lot 73 : sans elle, « Avant de jouer » demandait de remettre la table en place alors qu'elle y était)
  if (own && type === 0xB0 && MIDI_CC.includes(own)) reg.pos[own] = d2 / 127;
  if (svg){
    if (own){ if (MIDI_CC.includes(own)) onbSchemaSet(svg, pre, own, d2 / 127); else if (d2 >= 64) onbSchemaPress(svg, pre, own); }
    else if (type === 0xB0 && !btn && !(d1 >= 32 && d1 < 64 && reg.seen[ch + ':' + (d1 - 32)])) onbSchemaSet(svg, pre, st.k, d2 / 127);
  }
  if (reg.wait) return;
  if (btn){
    if (type === 0x90 && d2 > 0) got = { ch, n: d1 };
    else if (type === 0xB0){ if (d2 === 0 && reg.last[id] === 127) got = { ch, n: d1, cc: true }; reg.last[id] = d2; }
  } else if (type === 0xB0){
    if (d1 >= 32 && d1 < 64 && reg.seen[ch + ':' + (d1 - 32)]) return;   // second message d'un potard « fin »
    const vus = (reg.seen[id] = reg.seen[id] || new Set()).add(d2);
    if (vus.size >= 3 && Math.max(...vus) - Math.min(...vus) >= REG_ECART) got = { ch, n: d1 };
  }
  if (!got) return;
  const other = regOwner(st.k, got);
  if (other){ reg.msg = `Ça, c’est ${regNomDe(other)}, déjà ${reg.got[other] ? 'reconnu' : 'réglé'}. ${btn ? 'Appuie plutôt sur' : 'Bouge plutôt'} ${st.name}.`; reg.seen = {}; reg.last = {}; renderRegState(); return; }
  reg.got[st.k] = got; reg.wait = true; reg.msg = ''; if (type === 0xB0 && !btn) reg.pos[st.k] = d2 / 127; chime(true); if (btn && svg) onbSchemaPress(svg, pre, st.k); renderRegState();
  const at = reg.i; reg.timer = setTimeout(() => { if (reg.active && reg.i === at) regGo(at + 1); }, 700);
}

function renderReg(){
  const st = reg.steps[reg.i], end = !st, n = Object.keys(reg.got).length, juste = reg.quoi === 'juste';
  const titre = juste ? 'Avant de jouer' : 'Régler ma table';
  $('regKick').textContent = end ? (juste ? titre : `Régler ma table · ${reg.nom}`) : `${titre} · ${reg.i + 1} sur ${reg.steps.length}`;
  $('regTitle').textContent = end ? (n ? (juste ? 'C’est réglé !' : 'Ta table est prête') : juste ? 'Ces boutons se feront à l’écran' : 'Rien n’a été reconnu') : capFirst(st.name);
  const debut = juste && reg.i === 0 ? 'Ce niveau se sert d’un bouton que ta table ne m’a pas encore montré. ' : '';
  const fin = juste ? (n ? 'C’est noté pour ta table. Ce qui manque se fera à l’écran, à la souris.' : 'Pas de souci : tu les feras à l’écran, à la souris. Tu pourras les régler plus tard depuis « Ma table ».')
    : reg.quoi === 'court' ? (n ? 'Voici ce que le site a reconnu. Les autres boutons, je te les ferai régler juste avant l’exercice qui s’en sert.' : 'Vérifie que ta table est bien branchée, puis recommence. Tu peux aussi jouer à la souris.')
    : n ? 'Voici ce que le site a reconnu. Ce qui manque se fera à l’écran, à la souris. Tu pourras tout refaire depuis « Ma table ».' : 'Vérifie que ta table est bien branchée, puis recommence. Tu peux aussi jouer à la souris.';
  $('regText').textContent = end ? fin + ' Quelque chose cloche ? « Copier le relevé », et envoie-le-nous : on verra ce que ta table envoie.' : debut + st.text;
  $('regSvg').style.display = end ? 'none' : ''; if (!end) onbHighlight(st.k, $('regSvg'), 'rg-');
  const ul = $('regList'); ul.innerHTML = ''; ul.hidden = !end;
  if (end) for (const s of reg.steps){ const ok = !!reg.got[s.k], x = document.createElement('li'); x.className = ok ? 'ok' : ''; x.textContent = `${ok ? '✓' : '•'} ${capFirst(s.name)} : ${ok ? 'reconnu' : 'à l’écran'}`; ul.appendChild(x); }
  // avant un niveau, on peut jouer même sans rien de reconnu : les boutons passés se feront à l'écran
  // à l'arrivée sur l'ordinateur, sans rien de reconnu : « Continuer à la souris » (sinon « C'est parti » rouvrait le réglage)
  const court0 = reg.quoi === 'court' && !n;
  $('regSkip').hidden = end; $('regSave').hidden = !end || !(n || juste || court0); $('regSave').textContent = court0 ? 'Continuer à la souris' : reg.apresTexte || 'Enregistrer';
  $('regCopie').hidden = !end; $('regOut').hidden = true;
  $('regBack').hidden = !end && reg.i === 0; $('regBack').textContent = end ? 'Recommencer' : 'Retour';
  renderRegState();
}
function renderRegState(){
  if (reg.ou !== 'fenetre'){ regRendu(); return; }
  const st = reg.steps[reg.i], el = $('regState'); el.className = 'regstate' + (reg.wait ? ' ok' : reg.msg ? ' warn' : '');
  el.textContent = !st ? '' : regEtatTexte(st);
}
const regEtatTexte = st => !midiCount ? 'Ta table est débranchée : rebranche-la pour continuer.' : reg.wait ? 'Reconnu !' : reg.msg || (MIDI_NOTE.includes(st.k) ? 'J’attends que tu appuies dessus sur ta table…' : 'J’attends que tu le bouges sur ta table…');
// Les commandes d'une table réglée à la main qui se font à l'écran, exprès (coach-table.ecran)
const regEcran = () => tableCfg && Array.isArray(tableCfg.ecran) ? tableCfg.ecran : [];
function regSave(){
  const f = modeleDe(reg.nom), apres = reg.apres, n = Object.keys(reg.got).length;
  if (!n && reg.quoi === 'court'){ closeReg(); if (apres) apres(0); return; }   // rien à enregistrer : la table reste à régler
  const saute = reg.steps.filter(s => !reg.got[s.k]).map(s => s.k), ecran = l => Array.from(new Set(l.filter(k => !reg.got[k])));
  if (reg.garde){
    // la même table : on ajoute ce qui vient d'être réglé à ce qu'elle savait déjà (FLX4, table qui a sa fiche, ou réglée à la main)
    map = cleanMap(Object.assign({}, map, reg.got), !!tableCfg);
    if (tableCfg && !tableCfg.modele){ tableCfg = Object.assign({}, tableCfg, { ecran: ecran(regEcran().concat(saute)) }); if (!tableCfg.ecran.length) delete tableCfg.ecran; }
  } else {
    // une table qui a sa fiche, réglée à la main (sa fiche était peut-être fausse) : elle garde son modèle, et ce réglage
    // est gardé dans coach-tables comme le sien, pour revenir après un passage par une autre table
    tableGarde(); map = cleanMap(reg.got, true); tableCfg = f ? { nom: baseName(reg.nom), modele: f.id } : { nom: reg.nom };
    // ce qui a été passé se fait à l'écran ; réglée en partie (les 3 premiers boutons), le reste sera demandé plus tard
    if (!f && saute.length) tableCfg.ecran = saute;
  }
  // les positions réelles : en ajoutant des boutons à la même table, seules celles des boutons réglés repartent de zéro (gardien du
  // lot 73) ; puis celles vues pendant le réglage
  for (const k of Object.keys(reg.garde ? reg.got : phys)) delete phys[k];
  for (const [k, v] of Object.entries(reg.pos || {})) if (map[k]) phys[k] = v;
  try { localStorage.setItem('coach-midi-map', JSON.stringify(map)); if (tableCfg) localStorage.setItem('coach-table', JSON.stringify(tableCfg)); } catch (e) {}
  if (f || reg.garde) tableGarde();
  closeReg(); renderPill(); updateSetup();
  if (view === 'table'){ tableNote = 'Ta table est réglée : bouge une commande pour la voir réagir.'; renderTable(); }
  if (apres) apres(n);
}

/* ---------- Juste avant un niveau (lot 73) ----------
   Une table réglée à la main (sans fiche) qui n'a pas encore montré un bouton de ce niveau : on le règle maintenant, puis la
   partie démarre. Ni la FLX4 ni une table qui a sa fiche (leurs réglages sont complets), ni à la souris, ni à l'entraînement. */
function regBesoins(l){ const k = new Set(l && l.user || []); if (l && !l.autoLaunch) k.add('playB'); if (l && (l.btn || []).includes('echo')) k.add('fxOn'); return REG_STEPS.map(s => s.k).filter(x => k.has(x)); }
function regManque(l){
  if (!l || !midiCount || mouseMode || prac || placement || !tableOn() || !tableCfg || tableCfg.modele) return [];
  return regBesoins(l).filter(k => !map[k] && !regEcran().includes(k));
}
function regAvantDeJouer(go){
  const m = regManque(LESSONS[li]); if (!m.length) return go();
  if (!regDemarre({ cles: m, garde: true, quoi: 'juste', apres: n => { stat1('reglage-avant-niveau', { boutons: n }); go(); }, apresTexte: 'Jouer' })) go();
}

/* ---------- Le bandeau : une autre table vient d'être branchée ---------- */
function renderTableBar(){
  const bar = $('tableBar'), e = tableEtat(), neuve = e === 'ok' ? ficheNouvelle() : null;
  bar.hidden = tableLater || reg.active || !(neuve || ['nouvelle', 'flx4', 'connue'].includes(e)); if (bar.hidden) return;
  const fi = e === 'connue' ? modeleDe(midiNames.find(modeleDe)) : null;
  $('tbText').textContent = e === 'flx4' ? 'Tu as branché une DDJ-FLX4, mais les réglages sont ceux de ton autre table. On reprend ceux de la FLX4 ?'
    : neuve ? `DJingood connaît maintenant les réglages de la ${neuve.nom}. On les prend à la place de ceux que tu as réglés à la main ?`
    : fi ? `Tu as branché une ${fi.nom} : DJingood connaît ses réglages. On les prend ?${tableCfg ? ' Ceux de ta table réglée à la main seront remplacés.' : ''}`
    : `Nouvelle table : « ${regName()} ». DJingood ne la connaît pas encore : règle-la pas à pas, en bougeant chaque commande quand il te le demande.`;
  $('tbGo').textContent = e === 'flx4' ? 'Reprendre les réglages de la FLX4' : fi || neuve ? 'Prendre ses réglages' : 'Régler ma table';
}
// Prendre les réglages d'une table qui a sa fiche, à la place de ceux d'une table réglée à la main (lot 55 : celle qui avait
// été réglée à la main avant d'avoir sa fiche, même si une autre table connue est branchée avant elle)
function modeleReprend(){ modeleApply(ficheNouvelle() ? tableCfg.nom : midiNames.find(modeleDe) || '', true); renderPill(); updateSetup(); renderTableBar(); if (view === 'table') renderTable(); }
$('tbGo').addEventListener('click', () => { const e = tableEtat(); if (e === 'flx4'){ flx4Reprend(); if (view === 'table') renderTable(); } else if (e === 'connue' || ficheNouvelle()) modeleReprend(); else openReg(); });
$('tbLater').addEventListener('click', () => { tableLater = true; renderTableBar(); });
$('regSkip').addEventListener('click', () => { if (reg.ou === 'fenetre') regPasse(); });
$('regBack').addEventListener('click', () => {
  if (!reg.active || reg.ou !== 'fenetre') return;
  if (reg.i >= reg.steps.length){ reg.got = {}; regGo(0); return; }
  if (reg.i > 0){ delete reg.got[reg.steps[reg.i].k]; delete reg.got[reg.steps[reg.i - 1].k]; regGo(reg.i - 1); } });
$('regSave').addEventListener('click', regSave);
$('regCopie').addEventListener('click', regCopier);
$('regClose').addEventListener('click', closeReg);
document.addEventListener('keydown', e => { if (e.key === 'Escape' && reg.active && reg.ou === 'fenetre'){ e.stopPropagation(); closeReg(); } }, true);
