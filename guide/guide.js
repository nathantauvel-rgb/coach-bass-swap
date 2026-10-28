// Le guide du débutant (lot 51) en scènes, avec Vini (dessin et humeurs dans js/vini.js, chargé juste avant).
// Tout le texte est dans la page (c'est lui que lisent Google et les IA) : ce fichier ne fait que l'animer.
// Sans lui, la page reste lisible : toutes les étapes sont ouvertes, les cartes montrent leurs deux faces.
//  - [data-vini]           Vini, avec son humeur de départ (calme, danse, parfait, rate) ; le toucher le fait sauter
//  - .vr-sc                une scène : elle apparaît quand on descend (classe « vue »)
//  - button[data-son]      joue guide/sons/<nom>.mp3, un seul son à la fois ; data-humeur = l'humeur de Vini pendant ce son
//  - [data-grille]         la grille de la phrase s'allume au rythme du son du même nom ; [data-statut] dit où on en est
//  - [data-pas]            un pas à pas : une étape ouverte à la fois ; la scène reçoit data-etape (le dessin de la FLX4 suit)
//  - .vr-piege             une carte à retourner : l'erreur d'un côté, la solution de l'autre
//  - [data-jeu]            « À toi » : toucher le « 1 » de la phrase suivante
//  - [data-pistes]         A et B sur la ligne du temps : B lancé sur le « 1 », ou n'importe quand
(function(){
  'use strict';
  const P = 60 / 124, NB = ' ';
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  document.documentElement.classList.add('js');

  /* ---------- Vini ---------- */
  const humeur = (el, h) => { if (!el) return; el._h = h; viniHumeur(el, h); };
  const viniDe = el => { const s = el && el.closest('.vr-sc'); return s && s.querySelector('.vini'); };
  // la danse repart sur le temps : appelé quand la musique démarre
  const cale = el => { if (!el) return; el.style.setProperty('--vini-delay', '0s'); viniHumeur(el, 'calme'); void el.offsetWidth; humeur(el, 'danse'); };
  const saute = el => { if (!el) return; viniHumeur(el, 'parfait'); clearTimeout(el._t); el._t = setTimeout(() => viniHumeur(el, el._h), 1100); };
  $$('[data-vini]').forEach(el => {
    viniMettre(el, el.dataset.vini); el._h = el.dataset.vini;
    el.removeAttribute('role'); el.removeAttribute('aria-label'); el.setAttribute('aria-hidden', 'true');   // décoratif
    el.addEventListener('click', () => saute(el));
  });
  const bulle = (el, txt) => { if (!el || el.textContent === txt) return; el.textContent = txt; el.classList.remove('change'); void el.offsetWidth; el.classList.add('change'); };

  /* ---------- Les scènes apparaissent quand on descend ; la barre du haut suit la lecture ---------- */
  const io = 'IntersectionObserver' in window ? new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting){ e.target.classList.add('vue'); io.unobserve(e.target); } }), { threshold: .15 }) : null;
  $$('.vr-sc').forEach(s => io ? io.observe(s) : s.classList.add('vue'));
  const lecture = document.querySelector('.vr-lecture');
  if (lecture) addEventListener('scroll', () => { const h = document.documentElement, m = h.scrollHeight - h.clientHeight; lecture.style.transform = `scaleX(${m > 0 ? Math.min(1, h.scrollTop / m) : 0})`; }, { passive: true });

  /* ---------- Les sons : une balise <audio> (sur iPhone, elle joue même en mode silencieux) ---------- */
  const sons = {};
  let enCours = null;   // { nom, a, b (bouton ou null), sc (scène), quand (fonction appelée à chaque image), fin }
  function arrete(){
    if (!enCours) return;
    const e = enCours; enCours = null;
    e.a.pause(); try { e.a.currentTime = 0; } catch (x) {}
    if (e.b){ e.b.setAttribute('aria-pressed', 'false'); const ic = e.b.querySelector('.g-ic'); if (ic) ic.textContent = '▶'; }
    if (e.sc) e.sc.removeAttribute('data-joue');
    if (e.fin) e.fin();
  }
  function joue(nom, o = {}){
    arrete();
    let a = sons[nom];
    if (!a){ a = sons[nom] = new Audio('sons/' + nom + '.mp3');
      a.addEventListener('ended', () => { if (enCours && enCours.a === a) arrete(); });
      a.addEventListener('playing', () => { if (enCours && enCours.a === a){ if (enCours.sc) enCours.sc.dataset.joue = nom; if (enCours.vini) enCours.h ? humeur(enCours.vini, enCours.h) : cale(enCours.vini); } }); }
    enCours = Object.assign({ nom, a }, o);
    if (o.b){ o.b.setAttribute('aria-pressed', 'true'); const ic = o.b.querySelector('.g-ic'); if (ic) ic.textContent = '■'; }
    const p = a.play(); if (p && p.catch) p.catch(() => { if (enCours && enCours.a === a) arrete(); });
    const image = () => { if (!enCours || enCours.a !== a) return; if (enCours.quand) enCours.quand(a.currentTime); requestAnimationFrame(image); };
    requestAnimationFrame(image);
    try { if (typeof stat === 'function') stat('guide-ecoute', { son: nom }); } catch (x) {}
  }

  // Un bouton « Écouter » ; s'il y a une grille du même nom dans sa scène, elle s'allume au rythme du son
  $$('button[data-son]').forEach(b => b.addEventListener('click', () => {
    if (enCours && enCours.b === b){ arrete(); return; }
    const nom = b.dataset.son, sc = b.closest('.vr-sc'), v = viniDe(b), grille = sc && sc.querySelector(`[data-grille="${nom}"]`);
    const o = { b, sc, vini: v, h: b.dataset.humeur || null, fin: () => humeur(v, v && v.dataset.vini || 'calme') };
    if (grille){
      const cases = $$('.g-t', grille), statut = sc.querySelector('[data-statut]'), bul = sc.querySelector('[data-bulle-apres]');
      const temps = statut ? [...statut.attributes].filter(x => /^data-t\d+$/.test(x.name)).map(x => [+x.name.slice(6), x.value]).sort((x, y) => x[0] - y[0]) : [];
      const repos = statut && statut.textContent;
      let vu = -1;
      o.quand = t => {
        const k = Math.floor(t / P); if (k === vu) return;
        if (vu >= 0) cases[vu % cases.length].classList.remove('g-on', 'g-neuf');
        vu = k; cases[k % cases.length].classList.add('g-on'); if (k >= cases.length) cases[k % cases.length].classList.add('g-neuf');
        if (statut){ const s = (temps.filter(([n]) => n <= k).pop() || [0, repos])[1]; if (statut.textContent !== s) statut.textContent = s; }
        // la phrase suivante commence : la basse arrive, Vini saute
        if (k === cases.length){ humeur(v, 'parfait'); if (bul) bulle(bul, bul.dataset.bulleApres); }
      };
      o.fin = () => { if (vu >= 0) cases[vu % cases.length].classList.remove('g-on', 'g-neuf'); if (statut) statut.textContent = repos; humeur(v, 'calme'); };
    }
    joue(nom, o);
  }));

  /* ---------- Le pas à pas : une étape ouverte à la fois ---------- */
  $$('[data-pas]').forEach(box => {
    const items = $$('li', box), sc = box.closest('.vr-sc'), v = viniDe(box);
    const prec = box.querySelector('[data-prec]'), suiv = box.querySelector('[data-suiv]'), oui = box.querySelector('[data-oui]'), num = box.querySelector('.vr-pas-n'), msg = box.querySelector('.vr-pas-msg');
    const depart = box.hasAttribute('data-depart');   // le dessin montre d'abord la position de départ, aucune étape ouverte
    // une étape peut donner à Vini sa propre phrase (data-bulle) ; sans étape ouverte, il reprend sa première phrase
    const bul = items.some(li => li.dataset.bulle) && sc ? sc.querySelector('.vr-bul') : null, bul0 = bul && bul.textContent;
    let i = depart ? -1 : 0;
    function va(k){
      i = Math.max(depart ? -1 : 0, Math.min(items.length - 1, k));
      items.forEach((li, n) => { li.classList.toggle('actif', n === i); li.classList.toggle('fait', n < i); const t = li.querySelector('.vr-pas-t'); if (t) t.setAttribute('aria-expanded', String(n === i)); });
      if (sc) sc.dataset.etape = String(i + 1);
      if (num) num.textContent = i < 0 ? `${items.length} étapes` : `${i + 1} sur ${items.length}`;
      if (prec) prec.disabled = i <= (depart ? -1 : 0);
      if (suiv) suiv.lastChild.textContent = ' ' + (i < 0 ? 'Commencer' : i === items.length - 1 ? 'Recommencer' : suiv.dataset.suiv || 'Suivant');
      if (msg) msg.textContent = '';
      if (bul) bulle(bul, i < 0 ? bul0 : items[i].dataset.bulle || bul0);
      if (i === items.length - 1 && box.hasAttribute('data-fete')) humeur(v, 'parfait');
      else if (v && v._h === 'parfait') humeur(v, v.dataset.vini || 'calme');
    }
    items.forEach((li, n) => { const t = li.querySelector('.vr-pas-t'); if (t) t.addEventListener('click', () => va(n)); });
    if (prec) prec.addEventListener('click', () => va(i - 1));
    if (suiv) suiv.addEventListener('click', () => va(i === items.length - 1 ? (depart ? -1 : 0) : i + 1));
    // « C'était ça ! » (table non détectée) : Vini saute, et le message dit quoi faire ensuite
    if (oui) oui.addEventListener('click', () => { humeur(v, 'parfait'); if (msg) msg.textContent = oui.dataset.message || ''; });
    va(i);
  });

  /* ---------- Les cartes à retourner ---------- */
  $$('.vr-piege').forEach(c => c.addEventListener('click', () => {
    const r = c.getAttribute('aria-pressed') !== 'true'; c.setAttribute('aria-pressed', String(r));
    if (r) saute(viniDe(c));
  }));

  /* ---------- « À toi » : toucher le « 1 » de la phrase suivante ---------- */
  $$('[data-jeu]').forEach(box => {
    const nom = box.dataset.jeu, sc = box.closest('.vr-sc'), v = viniDe(box), bul = sc.querySelector('.vr-bul');
    const segs = $$('.vr-mesures i', box), pad = box.querySelector('.vr-pad'), go = box.querySelector('.vr-go'), msg = box.querySelector('.vr-msg');
    let etat = 'pret';
    const message = (t, c) => { msg.textContent = t; msg.className = 'vr-msg ' + (c || ''); };
    function tape(){
      if (etat !== 'joue' || !enCours) return;
      pad.classList.add('appui'); setTimeout(() => pad.classList.remove('appui'), 120);
      const t = enCours.a.currentTime, d = t - segs.length * 4 * P, ms = Math.round(Math.abs(d) * 1000);
      if (t < segs.length * 2 * P){ message('Pas encore' + NB + '! Compte les ' + segs.length + ' mesures jusqu\'au bout.', 'presque'); return; }
      etat = 'fini'; pad.disabled = true;
      if (Math.abs(d) <= .15){ message('Pile sur le «' + NB + '1' + NB + '»' + NB + '! (' + ms + ' ms)', 'ok'); humeur(v, 'parfait'); bulle(bul, 'Bravo' + NB + '! C\'est exactement là qu\'un DJ lance le morceau suivant.'); }
      else if (Math.abs(d) <= .35) message('Presque' + NB + '! Un tout petit peu trop ' + (d < 0 ? 'tôt' : 'tard') + ' (' + ms + ' ms).', 'presque');
      else if (d < 0){ message('Trop tôt' + NB + ': il restait ' + Math.max(1, Math.round(-d / P)) + ' temps.', 'non'); humeur(v, 'rate'); }
      else { message('Trop tard' + NB + ': le «' + NB + '1' + NB + '» était passé.', 'non'); humeur(v, 'rate'); }
    }
    go.addEventListener('click', () => {
      etat = 'joue'; message(''); go.hidden = true; pad.disabled = false; pad.focus({ preventScroll: true });
      bulle(bul, bul.dataset.bulleJeu || bul.textContent);
      joue(nom, { sc, vini: v, quand: t => {
        const k = Math.floor(t / P);
        segs.forEach((s, n) => { s.classList.toggle('plein', k < segs.length * 4 && n <= (k >> 2)); s.classList.toggle('neuf', k >= segs.length * 4); });
        if (etat === 'joue' && t > segs.length * 4 * P + 1.2){ etat = 'fini'; pad.disabled = true; humeur(v, 'rate');
          message('Le «' + NB + '1' + NB + '» est passé' + NB + ': touche le bouton dès que la basse arrive.', 'non'); }
      }, fin: () => {
        const avait = document.activeElement === pad || document.activeElement === document.body;
        segs.forEach(s => s.classList.remove('plein', 'neuf')); pad.disabled = true; go.hidden = false; go.lastChild.textContent = ' Rejouer';
        if (etat === 'joue') message(''); etat = 'pret'; if (v && v._h === 'danse') humeur(v, 'calme');
        if (avait) go.focus({ preventScroll: true });   // le clavier repart de « Rejouer »
      } });
    });
    // l'instant compte : on lit l'appui (doigt, souris) ou la touche, pas le relâchement
    let clavier = 0;
    pad.addEventListener('pointerdown', e => { e.preventDefault(); tape(); });
    pad.addEventListener('keydown', e => { if (e.key === ' ' || e.key === 'Enter'){ e.preventDefault(); clavier = Date.now(); if (!e.repeat) tape(); } });
    // un lecteur d'écran « clique » sans appui ni touche (detail = 0) : on le compte aussi, sauf juste après une touche
    pad.addEventListener('click', e => { if (e.detail === 0 && Date.now() - clavier > 600) tape(); });
  });

  /* ---------- A et B sur la ligne du temps ---------- */
  $$('[data-pistes]').forEach(box => {
    const sc = box.closest('.vr-sc'), v = viniDe(box), bul = sc.querySelector('.vr-bul'), [bon, mal] = $$('.vr-choix button', sc);
    const textes = [bul.textContent, bul.dataset.bulleMal];
    function choisit(ok){
      box.classList.toggle('bon', ok); box.classList.toggle('mal', !ok);
      bon.setAttribute('aria-pressed', String(ok)); mal.setAttribute('aria-pressed', String(!ok));
      humeur(v, ok ? 'danse' : 'rate'); bulle(bul, textes[ok ? 0 : 1]);
    }
    bon.addEventListener('click', () => choisit(true)); mal.addEventListener('click', () => choisit(false));
  });
})();
