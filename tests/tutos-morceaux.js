// Fabrique les extraits des tutos (lot 56) à partir des MP3 de audio-essai/pixabay/ (hors Git) : chaque extrait commence
// pile sur un temps, est ramené à 124 BPM SANS changer sa hauteur (ffmpeg, filtre rubberband : deux morceaux de même
// tonalité restent justes l'un contre l'autre), mis au même volume sans dépasser -2 dB en crête, puis encodé en MP3 dans
// musique/ (publié).
// Usage : node tests/tutos-morceaux.js        (il faut ffmpeg avec rubberband)
//
// Morceaux de Pixabay (licence Pixabay : usage commercial sans crédit, pas de redistribution telle quelle ; ici, extraits
// coupés et au tempo changé), choisis à l'oreille par l'utilisateur le 7 nov. 2026. Tempo entier, mesuré ; le premier temps
// `t0` est affiné ici sur le claquement de la grosse caisse (dans les aigus : les basses faussent la mesure dans les graves),
// sur un passage `grosse` [premier temps, dernier temps] où elle est nette. Un extrait = [morceau, première mesure, nombre
// de temps, passage où vérifier sa grille, en temps de l'extrait].
const { execFileSync } = require('child_process'), fs = require('fs'), path = require('path');
const SRC = path.join(__dirname, '..', 'audio-essai', 'pixabay'), OUT = path.join(__dirname, '..', 'musique'), BPM = 124, SR = 44100;
const TRACKS = {
  deep: { file: 'alexrockbeat-deep-house-590869.mp3', bpm: 128, t0: .2293, grosse: [32, 128] },
  instru: { file: 'arnaud136-deep-house-instrumental-354596.mp3', bpm: 125, t0: .1981, grosse: [192, 248] },   // calé sur le drop de 1:32, celui qu'on utilise
  luxury: { file: 'kulakovka-luxury-life-618587.mp3', bpm: 122, t0: .0849, grosse: [32, 160] },
  diva: { file: 'kulakovka-fashion-diva-house-614889.mp3', bpm: 120, t0: .1473, grosse: [32, 96] }
};
// A : la fin du morceau (break, la dernière partie avec basses, l'outro) ; B : 64 ou 32 temps sans basse, puis le drop
const CUTS = {
  'tuto-deep-a': ['deep', 32, 148, [32, 128]],
  'tuto-instru-b': ['instru', 32, 136, [64, 120]],   // le break (mesures 32 à 48, sans basse) puis le vrai drop, à 1:32 (dit par l'utilisateur, 7 nov.)
  'tuto-luxury-a': ['luxury', 32, 160, [64, 128]],
  'tuto-diva-b': ['diva', 0, 96, [32, 96]]
};
const TARGET_RMS = .17;   // le même volume que les extraits de « Vraie musique »
const P = 60 / BPM;

// Le son d'un fichier, en mono (ou en stéréo entrelacée), en nombres
function lire(f, stereo = false){
  const raw = execFileSync('ffmpeg', ['-v', 'error', '-i', f, '-ac', stereo ? '2' : '1', '-ar', String(SR), '-f', 'f32le', '-'], { maxBuffer: 1 << 30 });
  return new Float32Array(raw.buffer, raw.byteOffset, raw.length / 4);
}
// Où tombe le coup de la grosse caisse par rapport à la grille t0 + k × per, sur les temps a à z : on empile l'énergie des
// graves (< 150 Hz) de tous ces temps les uns sur les autres ; le pic de la pile est le coup de grosse caisse (les notes de
// basse, les charleys et les petits coups entre les temps se fondent dans la moyenne). Mesure temps par temps : trop
// bruitée sur ces morceaux chargés (essai du 7 nov. 2026). Rend l'écart en secondes, de -per/2 à +per/2, et la netteté
// du pic (pic / moyenne de la pile).
const KICK = .012;   // la convention : le pic de la grosse caisse tombe 12 ms après le temps (son attaque est sur le temps)
function attaque(x, t0, per, a, z){
  const hop = 16, fps = SR / hop, k = 1 - Math.exp(-2 * Math.PI * 150 / SR), nf = Math.floor(x.length / hop), env = new Float32Array(nf);
  let lp = 0;
  for (let f = 0; f < nf; f++){ let e = 0; for (let i = f * hop; i < (f + 1) * hop; i++){ lp += k * (x[i] - lp); e += lp * lp; } env[f] = e; }
  const cases = Math.round(per * fps), pile = new Float64Array(cases);
  for (let b = a; b < z; b++){
    const f0 = Math.round((t0 + b * per - per / 2) * fps);
    if (f0 < 0 || f0 + cases >= nf) continue;
    for (let c = 0; c < cases; c++) pile[c] += env[f0 + c];
  }
  let m = 0, cm = 0, s = 0; for (let c = 0; c < cases; c++){ s += pile[c]; if (pile[c] > m){ m = pile[c]; cm = c; } }
  return { med: cm / fps - per / 2, net: m / (s / cases) };
}
const RUBBERBAND = R => `rubberband=tempo=${R.toFixed(6)}:transients=mixed:detector=compound:channels=together:pitchq=quality`;
// Le retard du changement de tempo, mesuré sur des clics : un clic par temps d'origine, passé dans le même filtre
function retard(R, Po, n, avant, tmp){
  const sec = (n + 1) * Po + avant, N = Math.ceil(sec * SR), buf = Buffer.alloc(44 + N * 2);
  buf.write('RIFF', 0); buf.writeUInt32LE(36 + N * 2, 4); buf.write('WAVEfmt ', 8); buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(1, 22);
  buf.writeUInt32LE(SR, 24); buf.writeUInt32LE(SR * 2, 28); buf.writeUInt16LE(2, 32); buf.writeUInt16LE(16, 34); buf.write('data', 36); buf.writeUInt32LE(N * 2, 40);
  for (let k = 0; avant + k * Po < sec - .05; k++){ const i0 = Math.round((avant + k * Po) * SR); for (let j = 0; j < 40; j++) buf.writeInt16LE(Math.round(20000 * Math.exp(-j / 8) * (j % 2 ? -1 : 1)), 44 + (i0 + j) * 2); }
  const clic = path.join(tmp, 'clics.wav'), sortie = path.join(tmp, 'clics-sortie.wav');
  fs.writeFileSync(clic, buf);
  execFileSync('ffmpeg', ['-y', '-v', 'error', '-i', clic, '-af', `asetpts=PTS-STARTPTS,${RUBBERBAND(R)}`, sortie]);
  const y = lire(sortie), ecarts = [];
  for (let k = 0; avant + k * Po < sec - .1; k++){
    const t = (avant + k * Po) / R, a = Math.max(0, Math.floor((t - .06) * SR)), z = Math.min(y.length, Math.floor((t + .06) * SR));
    let m = 0, im = a; for (let i = a; i < z; i++) if (Math.abs(y[i]) > m){ m = Math.abs(y[i]); im = i; }
    ecarts.push(im / SR - t);
  }
  ecarts.sort((u, v) => u - v);
  return { med: ecarts[Math.floor(ecarts.length / 2)], min: ecarts[0], max: ecarts[ecarts.length - 1] };
}
fs.mkdirSync(OUT, { recursive: true });
const tmp = fs.mkdtempSync(path.join(require('os').tmpdir(), 'tutos-'));
const affine = {};
for (const [key, tr] of Object.entries(TRACKS)){
  const a = attaque(lire(path.join(SRC, tr.file)), tr.t0, 60 / tr.bpm, ...tr.grosse);
  affine[key] = tr.t0 + a.med - KICK;
  console.log(key.padEnd(7), `premier temps ${(affine[key] * 1000).toFixed(1)} ms (pic de la grosse caisse ${(a.med * 1000).toFixed(1)} ms après l'ancienne mesure, netteté ${a.net.toFixed(1)})`);
}
for (const [name, [key, mesure, n, verif]] of Object.entries(CUTS)){
  const tr = TRACKS[key], Po = 60 / tr.bpm, R = BPM / tr.bpm, debut = affine[key] + mesure * 4 * Po, wav = path.join(tmp, name + '.wav');
  // un temps de marge avant et après : le changement de tempo met quelques millisecondes à démarrer
  const avant = Math.min(Po, debut);
  execFileSync('ffmpeg', ['-y', '-v', 'error', '-i', path.join(SRC, tr.file), '-af',
    `aresample=${SR},atrim=start=${(debut - avant).toFixed(6)}:duration=${((n + 1) * Po + avant).toFixed(6)},asetpts=PTS-STARTPTS,${RUBBERBAND(R)}`,
    '-map_metadata', '-1', '-ac', '2', '-ar', String(SR), wav]);
  // le premier temps tombe à `avant / R` secondes, plus le retard du filtre
  const ret = retard(R, Po, n, avant, tmp), coupe = avant / R + ret.med;
  const x = lire(wav), X2 = lire(wav, true), a0 = Math.floor(coupe * SR), a1 = Math.min(x.length, a0 + Math.floor(n * P * SR));
  let s = 0, pic = 0;
  for (let i = a0; i < a1; i++) s += x[i] * x[i];
  for (let i = a0 * 2; i < a1 * 2; i++) pic = Math.max(pic, Math.abs(X2[i]));
  // le volume commun, sans dépasser -2,5 dB en crête avant l'encodage (le MP3 ajoute un peu au-dessus)
  const gain = Math.min(TARGET_RMS / Math.sqrt(s / (a1 - a0)), .75 / pic), out = path.join(OUT, name + '.mp3'), duree = n * P;
  // aucune information copiée du fichier d'origine (titre, commentaire, lien) : seulement le son
  execFileSync('ffmpeg', ['-y', '-v', 'error', '-i', wav, '-map_metadata', '-1', '-af',
    `atrim=start=${coupe.toFixed(6)}:duration=${duree.toFixed(6)},asetpts=PTS-STARTPTS,afade=t=in:d=0.004,afade=t=out:st=${(duree - .004).toFixed(6)}:d=0.004,volume=${gain.toFixed(4)}`,
    '-c:a', 'libmp3lame', '-b:a', '128k', out]);
  // vérification : où tombe la grosse caisse dans l'extrait (0 = pile sur les temps de 124 BPM)
  const y = lire(out), v = attaque(y, 0, P, ...verif), Y2 = lire(out, true);
  let picY = 0; for (const u of Y2) picY = Math.max(picY, Math.abs(u));
  console.log(name.padEnd(14), `${(y.length / SR).toFixed(2)} s (${n} temps)`, `retard du filtre ${(ret.med * 1000).toFixed(1)} ms (${(ret.min * 1000).toFixed(1)} à ${(ret.max * 1000).toFixed(1)})`,
    `gain ${(20 * Math.log10(gain)).toFixed(1)} dB`, `crête ${(20 * Math.log10(picY)).toFixed(1)} dB`,
    `pic de la grosse caisse à ${(v.med * 1000).toFixed(1)} ms du temps (attendu : ${KICK * 1000}), netteté ${v.net.toFixed(1)}`, `${(fs.statSync(out).size / 1e6).toFixed(2)} Mo`);
}
fs.rmSync(tmp, { recursive: true, force: true });
