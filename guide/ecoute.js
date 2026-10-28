// Les sons d'exemple du guide du débutant (guide/sons/*.mp3, fabriqués par tests/sons-guide.js depuis la vraie musique
// du site). Un bouton [data-son] joue son extrait, un seul à la fois ; il ne se télécharge qu'au premier appui.
// Une grille [data-grille] s'allume au rythme du son qu'elle suit (data-grille = nom du son) : un temps = 60 / 124 s.
// Le texte [data-statut] change aux temps donnés par ses attributs data-t0, data-t28… (le plus grand temps déjà passé).
// Une balise <audio> plutôt que le son du navigateur (Web Audio) : sur iPhone, elle joue même en mode silencieux.
(function(){
  const P = 60 / 124;
  const sons = {};
  let enCours = null;   // { b: bouton, a: <audio>, nom }

  const grilles = [...document.querySelectorAll('[data-grille]')].map(g => {
    const statut = g.parentNode.querySelector('[data-statut]');
    const temps = statut ? [...statut.attributes].filter(x => /^data-t\d+$/.test(x.name)).map(x => [+x.name.slice(6), x.value]).sort((a, b) => a[0] - b[0]) : [];
    return { g, nom: g.dataset.grille, cases: [...g.querySelectorAll('.g-t')], statut, temps, repos: statut && statut.textContent, allume: -1 };
  });

  function allume(gr, t){
    if (t === gr.allume) return;
    if (gr.allume >= 0) gr.cases[gr.allume % gr.cases.length].classList.remove('g-on', 'g-neuf');
    gr.allume = t;
    // après la dernière case, la phrase suivante commence : la grille repart du premier « 1 », dans une autre couleur
    if (t >= 0) gr.cases[t % gr.cases.length].classList.add('g-on', ...(t >= gr.cases.length ? ['g-neuf'] : []));
    if (gr.statut){
      const txt = t < 0 ? gr.repos : (gr.temps.filter(([n]) => n <= t).pop() || [0, gr.repos])[1];
      if (gr.statut.textContent !== txt) gr.statut.textContent = txt;
    }
  }

  function suit(){
    if (!enCours) return;
    const t = Math.floor(enCours.a.currentTime / P);
    grilles.filter(gr => gr.nom === enCours.nom).forEach(gr => allume(gr, t));
    requestAnimationFrame(suit);
  }

  function marque(b, joue){
    b.setAttribute('aria-pressed', joue ? 'true' : 'false');
    const ic = b.querySelector('.g-ic');
    if (ic) ic.textContent = joue ? '■' : '▶';
  }

  function arrete(){
    if (!enCours) return;
    const { b, a } = enCours;
    enCours = null;
    a.pause();
    try { a.currentTime = 0; } catch (e) {}
    marque(b, false);
    grilles.forEach(gr => allume(gr, -1));
  }

  document.querySelectorAll('button[data-son]').forEach(b => b.addEventListener('click', () => {
    const nom = b.dataset.son, deja = enCours && enCours.b === b;
    arrete();
    if (deja) return;
    let a = sons[nom];
    if (!a){
      a = sons[nom] = new Audio('sons/' + nom + '.mp3');
      a.addEventListener('ended', () => { if (enCours && enCours.a === a) arrete(); });
    }
    enCours = { b, a, nom };
    marque(b, true);
    const p = a.play();
    if (p && p.catch) p.catch(() => { if (enCours && enCours.a === a) arrete(); });
    requestAnimationFrame(suit);
    try { if (typeof stat === 'function') stat('guide-ecoute', { son: nom }); } catch (e) {}
  }));
})();
