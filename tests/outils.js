// Outils communs aux tests : fausse table MIDI et ouverture de la page dans un état connu.
const { expect } = require('@playwright/test');

// Fausse table : remplace navigator.requestMIDIAccess AVANT le chargement de la page. Le site y branche
// lui-même son propre gestionnaire (initMidi puis onMidi), donc les messages envoyés ici suivent
// exactement le chemin des messages d'une vraie DDJ-FLX4. Rien du code du site n'est contourné.
function fausseTable(cfg) {
  const inputs = new Map(), acc = { inputs, outputs: new Map(), onstatechange: null };
  navigator.requestMIDIAccess = () => cfg.refuse ? Promise.reject(new DOMException('refusé', 'SecurityError')) : Promise.resolve(acc);
  const api = {
    brancher(nom) { inputs.set('1', { id: '1', name: nom || 'DDJ-FLX4', onmidimessage: null }); if (acc.onstatechange) acc.onstatechange({}); },
    debrancher() { inputs.delete('1'); if (acc.onstatechange) acc.onstatechange({}); },
    envoyer(...octets) { for (const i of inputs.values()) if (i.onmidimessage) i.onmidimessage({ data: octets }); }
  };
  if (cfg.branchee) api.brancher(typeof cfg.branchee === 'string' ? cfg.branchee : undefined);
  window.__midi = api;
}

// Ouvre le site. `stockage` = contenu du localStorage (le guide est marqué comme vu sauf indication contraire),
// `midi` = { branchee, refuse } pour la fausse table (branchee : true pour une DDJ-FLX4, ou le nom d'une autre table),
// ou null pour laisser le navigateur tel quel.
async function ouvrir(page, { stockage = {}, midi = null, onglet = 'apprendre', avant = '' } = {}) {
  const erreurs = [];
  page.on('pageerror', e => erreurs.push(String(e)));
  // Les tests jouent la house du site sauf indication contraire (la vraie musique, choisie par défaut, a ses propres tests).
  // Les numéros de niveau des tests suivent l'ordre actuel du chapitre 1 (coach-ordre : rien à déplacer, voir ordre.spec.js).
  // Les « Premiers pas » (questions de Vini à la première visite) sont marqués comme passés, sauf dans premiers.spec.js.
  const donnees = Object.assign({ 'coach-guide-vu': '1', 'coach-fiches': '[\"play\", \"fader\", \"low\", \"cfx\", \"echo\", \"mid\"]', 'coach-style': 'house', 'coach-ordre': '2',
    'coach-accueil': '{\"passe\": true, \"fini\": \"2026-10-16\"}' }, stockage);
  await page.addInitScript(d => { try { if (!sessionStorage.getItem('__pret')) { for (const [k, v] of Object.entries(d)) if (v !== null) localStorage.setItem(k, v); sessionStorage.setItem('__pret', '1'); } } catch (e) {} }, donnees);
  if (midi) await page.addInitScript(fausseTable, midi);
  if (avant) await page.addInitScript(avant);
  await page.goto('/index.html#' + onglet);
  if (onglet === 'apprendre') await expect(page.locator('.node').first()).toBeVisible();
  return erreurs;
}

const envoyer = (page, ...octets) => page.evaluate(o => window.__midi.envoyer(...o), octets);
const miseEnPlace = page => page.locator('#setupList li').evaluateAll(els => els.map(e => (e.className || '-') + ' | ' + e.textContent.replace(/\s+/g, ' ').trim()));
const sansBandeau = page => expect(page.locator('#errBanner')).toHaveCount(0);

// Lance une partie et attend que le bouton passe à « Arrêter »
async function jouer(page, bouton = '#startBtn') {
  await page.locator(bouton).click();
  await expect(page.locator('#startBtn')).toHaveText('Arrêter', { timeout: 60000 });
}

module.exports = { ouvrir, envoyer, miseEnPlace, sansBandeau, jouer };
