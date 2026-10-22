// Vini, la mascotte (lots 27 et 28) : un vinyle violet avec un casque, visage « Rétro ». Le dessin est ici, ses couleurs et
// ses mouvements dans styles.css (section « Vini », classes vn-…). Il danse sur le tempo des morceaux (124 BPM).
// Tous les fichiers de js/ partagent la même portée et sont chargés dans l'ordre indiqué dans index.html.
'use strict';
/* ---------- Vini ----------
   Quatre humeurs, choisies par une classe sur l'enveloppe : vn-calme (il attend en clignant des yeux), vn-danse (il danse),
   vn-parfait (il saute de joie), vn-rate (il est déçu). Toutes les parties sont dans le dessin, la feuille de style n'affiche que celles de l'humeur. */
const VINI_SVG = `<svg viewBox="0 0 240 260" aria-hidden="true" focusable="false">
<ellipse class="vn-sh vn-ombre" cx="120" cy="246" rx="58" ry="8"/>
<g class="vn-corps">
  <ellipse class="vn-m7" cx="98" cy="236" rx="17" ry="9"/><ellipse class="vn-m7" cx="142" cy="236" rx="17" ry="9"/>
  <g class="vn-f vn-fb"><path class="vn-st vn-s-m6 vn-bras" d="M52 168 Q34 182 30 200"/><path class="vn-st vn-s-m6 vn-bras" d="M188 168 Q206 182 210 200"/><circle class="vn-cr" cx="30" cy="203" r="10"/><circle class="vn-cr" cx="210" cy="203" r="10"/></g>
  <g class="vn-f vn-fp"><path class="vn-st vn-s-m6 vn-bras" d="M46 172 Q8 168 4 128"/><path class="vn-st vn-s-m6 vn-bras" d="M194 172 Q232 168 236 128"/><circle class="vn-cr" cx="4" cy="122" r="10"/><circle class="vn-cr" cx="236" cy="122" r="10"/></g>
  <circle class="vn-m6" cx="120" cy="132" r="92"/><circle class="vn-m5" cx="117" cy="128" r="87"/>
  <circle class="vn-st vn-s-m6 vn-sillon" cx="120" cy="132" r="78"/><circle class="vn-st vn-s-m6 vn-sillon" cx="120" cy="132" r="69"/><circle class="vn-st vn-s-m6 vn-sillon" cx="120" cy="132" r="60"/>
  <g class="vn-reflet"><path class="vn-m3 vn-r1" d="M43.87 96.5 A84 84 0 0 1 71.82 63.19 L84.44 81.21 A62 62 0 0 0 63.81 105.8 Z"/><path class="vn-m3 vn-r2" d="M196.13 167.5 A84 84 0 0 1 179.4 191.4 L165.25 177.25 A64 64 0 0 0 178 159.05 Z"/></g>
  <circle class="vn-cr" cx="120" cy="132" r="48"/><circle class="vn-st vn-anneau" cx="120" cy="132" r="41"/>
  <g class="vn-f vn-fd vn-fp"><g class="vn-yeux"><ellipse class="vn-ink" cx="105" cy="120" rx="7.5" ry="12.5"/><ellipse class="vn-ink" cx="135" cy="120" rx="7.5" ry="12.5"/>
    <path class="vn-cr" d="M106.5 117 L114 106 L118 113 Z"/><path class="vn-cr" d="M136.5 117 L144 106 L148 113 Z"/></g></g>
  <g class="vn-f vn-fd"><path class="vn-ink" d="M98 139 Q120 163 142 139 Q120 151 98 139 Z"/><path class="vn-st vn-s-ink vn-fossette" d="M95.5 136.5 Q97 140 99.5 141.5"/><path class="vn-st vn-s-ink vn-fossette" d="M144.5 136.5 Q143 140 140.5 141.5"/></g>
  <g class="vn-f vn-fp"><path class="vn-ink" d="M100 139 Q120 168 140 139 Z"/><ellipse class="vn-tg" cx="120" cy="154.5" rx="9" ry="4.4"/></g>
  <g class="vn-f vn-fr"><g class="vn-yeux"><ellipse class="vn-ink" cx="105" cy="125" rx="7" ry="10"/><ellipse class="vn-ink" cx="135" cy="125" rx="7" ry="10"/>
    <path class="vn-cr" d="M106 123 L113 114 L117 120 Z"/><path class="vn-cr" d="M136 123 L143 114 L147 120 Z"/></g>
    <path class="vn-st vn-s-ink vn-sourcil" d="M96 110 L111 106"/><path class="vn-st vn-s-ink vn-sourcil" d="M129 106 L144 110"/><ellipse class="vn-ink" cx="120" cy="150" rx="5" ry="6"/></g>
  <path class="vn-st vn-s-dk vn-arceau" d="M29 104 C26 -4 214 -4 211 104"/><path class="vn-st vn-s-dk3 vn-arceau2" d="M40 70 C52 22 188 22 200 70"/>
  <rect class="vn-dk" x="14" y="98" width="31" height="56" rx="14"/><rect class="vn-dk2" x="38" y="104" width="13" height="44" rx="6.5"/><rect class="vn-dk3" x="20" y="106" width="6" height="22" rx="3"/>
  <rect class="vn-dk" x="195" y="98" width="31" height="56" rx="14"/><rect class="vn-dk2" x="189" y="104" width="13" height="44" rx="6.5"/><rect class="vn-dk3" x="214" y="106" width="6" height="22" rx="3"/>
</g>
<g class="vn-f vn-fn"><g class="vn-note"><ellipse class="vn-m3" cx="206" cy="50" rx="6.5" ry="5" transform="rotate(-20 206 50)"/><rect class="vn-m3" x="210.5" y="28" width="3" height="22" rx="1.5"/><path class="vn-m3" d="M212 28 Q222 32 220 42 Q217 36 212 35 Z"/></g>
  <g class="vn-note vn-n2"><ellipse class="vn-m3" cx="30" cy="62" rx="6" ry="4.6" transform="rotate(-20 30 62)"/><rect class="vn-m3" x="34" y="42" width="3" height="20" rx="1.5"/></g></g>
<g class="vn-f vn-fp"><path class="vn-sp vn-etoile" d="M40 26 l3.2 -9.2 l3.2 9.2 l9.2 3.2 l-9.2 3.2 l-3.2 9.2 l-3.2 -9.2 l-9.2 -3.2 z"/><path class="vn-sp vn-etoile vn-t2" d="M196 18 l2.6 -7.4 l2.6 7.4 l7.4 2.6 l-7.4 2.6 l-2.6 7.4 l-2.6 -7.4 l-7.4 -2.6 z"/><path class="vn-sp vn-etoile vn-t3" d="M222 120 l2.2 -6 l2.2 6 l6 2.2 l-6 2.2 l-2.2 6 l-2.2 -6 l-6 -2.2 z"/></g>
<g class="vn-f vn-fr"><path class="vn-dr vn-goutte" d="M160 88 Q166 98 166 102 A6 6 0 0 1 154 102 Q154 98 160 88 Z"/></g>
</svg>`;
const VINI_HUMEURS = ['calme', 'danse', 'parfait', 'rate'];
// Place Vini dans `el` (vide au départ) avec une humeur ; le texte lu par les lecteurs d'écran va sur l'enveloppe
function viniMettre(el, humeur = 'danse'){ el.classList.add('vini'); el.setAttribute('role', 'img'); el.setAttribute('aria-label', 'Vini, la mascotte de DJingood'); el.innerHTML = VINI_SVG; viniHumeur(el, humeur); }
function viniHumeur(el, humeur){ if (!VINI_HUMEURS.includes(humeur)) humeur = 'danse'; for (const h of VINI_HUMEURS) el.classList.toggle('vn-' + h, h === humeur); }
// Un « Parfait ! » qui dure un instant (après un bon choix, par exemple), puis Vini se remet à danser
/* ---------- Vini en haut des pages (lot 32) ----------
   Un « coin » : Vini (élément `${nom}Vini` dans le bouton `${nom}ViniBtn`) et sa bulle (`${nom}Tip`). viniDit pose la phrase et
   l'humeur de la page ; viniSaute le fait sauter un instant, puis il reprend cette humeur ; le toucher le fait sauter. */
function viniDit(nom, texte, humeur = 'calme'){
  const el = $(nom + 'Vini'); if (!el) return;
  if (!el.firstChild){ viniMettre(el, humeur); $(nom + 'ViniBtn').addEventListener('click', () => { viniSaute(nom); son('clic'); }); }
  el._h = humeur; $(nom + 'Tip').textContent = texte; if (!el.classList.contains('vn-parfait')) viniHumeur(el, humeur);
}
function viniSaute(nom, ms = 1100){
  const el = $(nom + 'Vini'); if (!el || !el.firstChild) return;
  viniHumeur(el, 'parfait'); clearTimeout(el._vn); el._vn = setTimeout(() => viniHumeur(el, el._h || 'calme'), ms);
}
function viniJoie(el, ms = 900){ viniHumeur(el, 'parfait'); clearTimeout(el._vn); el._vn = setTimeout(() => viniHumeur(el, 'danse'), ms); }
/* ---------- Vini pendant une partie (lot 29) ----------
   À côté de la bulle de conseil : il attend (calme), danse pile sur les temps du morceau pendant la partie, saute de joie
   sur un geste réussi et baisse les bras sur un raté, puis se remet à danser, toujours calé sur la musique. */
function viniCale(){
  const el = $('lvlVini'); if (!el || !el.firstChild) return;
  clearTimeout(el._vn);
  if (!run){ viniHumeur(el, 'calme'); return; }
  // la danse commence par le « temps fort » : on la décale pour qu'il tombe sur les temps de la musique
  const b = beatNow(), delai = b < START ? (START - b) * P : -(b - Math.floor(b)) * P;
  el.style.setProperty('--vini-beat', P.toFixed(4) + 's'); el.style.setProperty('--vini-delay', delai.toFixed(3) + 's');
  viniHumeur(el, 'calme'); void el.offsetWidth; viniHumeur(el, 'danse');
}
// Appelé par pop() : « ok » = un geste réussi, « bad » = raté ; les messages intermédiaires ne le font pas réagir
function viniReagit(kind){
  const el = $('lvlVini'); if (!el || !el.firstChild || !run || (kind !== 'ok' && kind !== 'bad')) return;
  viniHumeur(el, kind === 'ok' ? 'parfait' : 'rate'); clearTimeout(el._vn);
  el._vn = setTimeout(viniCale, kind === 'ok' ? 2 * P * 1000 : 1400);
}
viniMettre($('lvlVini'), 'calme');
