// Fabrique les extraits de musique du site à partir des MP3 de audio-essai/pixabay/ (hors Git) : ceux des tutos (lot 56) et
// ceux de « Vraie musique » dans les niveaux (lot 57, à la place de Play House). Chaque extrait commence pile sur un temps,
// est ramené à 124 BPM SANS changer sa hauteur (ffmpeg, filtre rubberband : deux morceaux de même tonalité restent justes
// l'un contre l'autre), mis au même volume sans dépasser -2 dB en crête, puis encodé en MP3 dans musique/ (publié).
// Usage : node tests/musique-pixabay.js [début du nom]    (il faut ffmpeg avec rubberband)
//   sans rien : tous les extraits ; « niv- » : seulement ceux des niveaux (les tutos, déjà publiés, ne bougent pas).
//
// Morceaux de Pixabay (licence Pixabay : usage commercial sans crédit, pas de redistribution telle quelle ; ici, extraits
// coupés et au tempo changé), choisis à l'oreille par l'utilisateur les 7 et 8 nov. 2026, jamais un morceau marqué « AI
// generated » sur sa page Pixabay (« House - July » et « Filter House » écartés pour ça le 8 nov.). Captures datées des pages
// dans marketing/licences/ (hors Git). Tempo entier, mesuré ; le premier temps `t0` est affiné ici sur le coup de la grosse
// caisse, sur un passage `grosse` [premier temps, dernier temps] où elle est nette. Un extrait = [morceau, morceaux de grille
// [premier temps, nombre de temps] mis bout à bout, passage où vérifier sa grille, en temps de l'extrait].
const { execFileSync } = require('child_process'), fs = require('fs'), path = require('path');
const SRC = path.join(__dirname, '..', 'audio-essai', 'pixabay'), OUT = path.join(__dirname, '..', 'musique'), BPM = 124, SR = 44100;
const TRACKS = {
  deep: { file: 'alexrockbeat-deep-house-590869.mp3', bpm: 128, t0: .2293, grosse: [32, 128] },
  instru: { file: 'arnaud136-deep-house-instrumental-354596.mp3', bpm: 125, t0: .1981, grosse: [192, 248] },   // calé sur le drop de 1:32, celui qu'on utilise
  luxury: { file: 'kulakovka-luxury-life-618587.mp3', bpm: 122, t0: .0849, grosse: [32, 160] },
  diva: { file: 'kulakovka-fashion-diva-house-614889.mp3', bpm: 120, t0: .1473, grosse: [32, 96] },
  ambient: { file: 'kulakovka-ambient-house-624653.mp3', bpm: 118, t0: .0998, grosse: [64, 180] },
  // le même morceau, calé sur la grosse caisse de son intro (elle commence 24 ms avant celle du drop : un autre son)
  instruIntro: { file: 'arnaud136-deep-house-instrumental-354596.mp3', bpm: 125, t0: .1981, grosse: [0, 64] }
};
// Où sont les basses (énergie sous 150 Hz, mesure par mesure, 8 nov. 2026 ; en temps du morceau d'origine) :
//   deep    : 32-128, break 128-144, 144-220, une mesure sans basse, 224-260, puis l'outro
//   instru  : intro 0-64, 64-128 (première entrée, pas le drop), break 128-192, DROP à 192 (1:32), 192-280, break, 384-472
//   luxury  : 32-160, break 160-192, 192-256, puis l'outro
//   diva    : intro 0-32, DROP à 32, 32-192, puis l'outro
//   ambient : intro 0-64 (nappes, pas de grosse caisse nette), DROP à 64 (0:32), 64-192, creux 192-224, 224-…
// Tutos — A : la fin du morceau (break, la dernière partie avec basses, l'outro) ; B : 64 ou 32 temps sans basse, puis le drop.
// Niveaux (js/vrais.js) — A : 136 temps avec des basses ; B0 : 64 temps sans basse puis le drop ; B1 : des basses dès le début.
// Les raccords (deux morceaux de grille) tombent au début d'une phrase et sautent un break. Un 4e élément = un autre dossier.
const CUTS = {
  'tuto-deep-a': ['deep', [[128, 148]], [32, 128]],
  'tuto-instru-b': ['instru', [[128, 136]], [64, 120]],   // le break (mesures 32 à 48, sans basse) puis le vrai drop, à 1:32 (dit par l'utilisateur, 7 nov.)
  'tuto-luxury-a': ['luxury', [[128, 160]], [64, 128]],
  'tuto-diva-b': ['diva', [[0, 96]], [32, 96]],
  'niv-deep-a': ['deep', [[32, 96], [144, 40]], [8, 136]],        // le break 128-144 sauté
  'niv-luxury-a': ['luxury', [[32, 128], [192, 8]], [8, 136]],    // le break 160-192 sauté
  'niv-ambient-b': ['ambient', [[0, 136]], [64, 136]],            // B0 : 64 temps d'intro, le drop au temps 64
  'niv-instru-b1': ['instru', [[192, 64], [192, 72]], [0, 136]],  // B1 : le drop de 1:32, joué deux fois (la dernière partie
                                                                  // du morceau a une grosse caisse qui tombe 20 ms plus tôt)
  'niv-diva-b1': ['diva', [[32, 136]], [0, 136]],                 // B1 : depuis le drop
  // Pour les sons du guide seulement (tests/sons-guide.js), rangé hors de musique/ et jamais publié : la seule intro qui a
  // une grosse caisse nette sans basse (netteté 15, les autres moins de 2), la basse arrive au temps 64
  'guide-instru-intro': ['instruIntro', [[0, 80]], [0, 64], 'audio-essai/extraits']
};
const SEULS = process.argv[2] || '';
const TARGET_RMS = .17;   // le même volume pour tous les extraits
const P = 60 / BPM;

// Le son d'un fichier, en mono (ou en stéréo entrelacée), en nombres
function lire(f, stereo = false){
  const raw = execFileSync('ffmpeg', ['-v', 'error', '-i', f, '-ac', stereo ? '2' : '1', '-ar', String(SR), '-f', 'f32le', '-'], { maxBuffer: 1 << 30 });
  return new Float32Array(raw.buffer, raw.byteOffset, raw.length / 4);
}
// Où COMMENCE le coup de la grosse caisse par rapport à la grille t0 + k × per, sur les temps a à z : on empile l'énergie
// des graves (< 150 Hz) de tous ces temps les uns sur les autres (les notes de basse, les charleys et les petits coups entre
// les temps se fondent dans la moyenne), on lisse sur 8 ms, puis on part du pic et on recule jusqu'à passer sous le plancher
// + 25 % de la montée. Mesure temps par temps : trop bruitée sur ces morceaux chargés (7 nov. 2026). Le pic seul ne suffit
// pas (8 nov. 2026) : « Fashion Diva » et « Ambient House » ont une grosse caisse longue (plus de 100 ms), le pic tombait
// à la fin du coup et leurs extraits partaient 45 et 90 ms trop tôt. Rend le début et le pic, en secondes.
const DEBUT = -.008;   // la convention : le coup commence 8 ms avant le temps (mesuré sur « Deep House », le plus net)
function debutCoup(x, t0, per, a, z){
  const hop = 44, fps = SR / hop, k = 1 - Math.exp(-2 * Math.PI * 150 / SR), nf = Math.floor(x.length / hop), env = new Float32Array(nf);
  let lp = 0; for (let fr = 0, i = 0; fr < nf; fr++){ let e = 0; for (let j = 0; j < hop; j++, i++){ lp += k * (x[i] - lp); e += lp * lp; } env[fr] = e; }
  const W = Math.round(per / 2 * fps), p = new Float64Array(2 * W + 1);
  for (let b = a; b < z; b++){ const c = Math.round((t0 + b * per) * fps); if (c - W < 0 || c + W >= nf) continue; for (let d = -W; d <= W; d++) p[d + W] += env[c + d]; }
  const L = Math.round(.004 * fps), s = new Float64Array(p.length);
  for (let i = 0; i < p.length; i++){ let t = 0, n = 0; for (let j = Math.max(0, i - L); j <= Math.min(p.length - 1, i + L); j++){ t += p[j]; n++; } s[i] = t / n; }
  let im = 0; for (let i = 0; i < s.length; i++) if (s[i] > s[im]) im = i;
  let fl = Infinity; for (let i = Math.max(0, im - Math.round(.2 * fps)); i <= im; i++) fl = Math.min(fl, s[i]);
  const seuil = fl + .25 * (s[im] - fl); let i = im; while (i > 0 && s[i] > seuil) i--;
  return { debut: (i - W) / fps, pic: (im - W) / fps };
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
const tmp = fs.mkdtempSync(path.join(require('os').tmpdir(), 'musique-'));
const choisis = Object.entries(CUTS).filter(([name]) => name.startsWith(SEULS));
const affine = {};
for (const key of new Set(choisis.map(([, [k]]) => k))){
  const tr = TRACKS[key], a = debutCoup(lire(path.join(SRC, tr.file)), tr.t0, 60 / tr.bpm, ...tr.grosse);
  affine[key] = tr.t0 + a.debut - DEBUT;
  console.log(key.padEnd(8), `premier temps ${(affine[key] * 1000).toFixed(1)} ms (le coup commence ${(a.debut * 1000).toFixed(1)} ms après l'ancienne mesure)`);
}
for (const [name, [key, parts, verif, dossier]] of choisis){
  const tr = TRACKS[key], Po = 60 / tr.bpm, R = BPM / tr.bpm, wav = path.join(tmp, name + '.wav'), n = parts.reduce((s, p) => s + p[1], 0);
  // les morceaux de grille, découpés à l'échantillon près au tempo d'origine et mis bout à bout, PUIS le changement de tempo
  // sur le tout ; un temps de marge avant le premier et après le dernier (le changement de tempo met quelques millisecondes à
  // démarrer)
  const debut = affine[key] + parts[0][0] * Po, avant = Math.min(Po, debut);
  const morceaux = parts.map(([from, k], i) => {
    const s = affine[key] + from * Po - (i === 0 ? avant : 0), d = k * Po + (i === 0 ? avant : 0) + (i === parts.length - 1 ? Po : 0);
    return `[s${i}]atrim=start=${s.toFixed(6)}:duration=${d.toFixed(6)},asetpts=PTS-STARTPTS[p${i}]`;
  });
  const fc = `[0:a]aresample=${SR},asplit=${parts.length}` + parts.map((_, i) => `[s${i}]`).join('') + ';' + morceaux.join(';') + ';'
    + parts.map((_, i) => `[p${i}]`).join('') + `concat=n=${parts.length}:v=0:a=1,${RUBBERBAND(R)}[o]`;
  execFileSync('ffmpeg', ['-y', '-v', 'error', '-i', path.join(SRC, tr.file), '-filter_complex', fc, '-map', '[o]',
    '-map_metadata', '-1', '-ac', '2', '-ar', String(SR), wav]);
  // le premier temps tombe à `avant / R` secondes, plus le retard du filtre
  const ret = retard(R, Po, n, avant, tmp), coupe = avant / R + ret.med;
  const x = lire(wav), X2 = lire(wav, true), a0 = Math.floor(coupe * SR), a1 = Math.min(x.length, a0 + Math.floor(n * P * SR));
  let s = 0, pic = 0;
  for (let i = a0; i < a1; i++) s += x[i] * x[i];
  for (let i = a0 * 2; i < a1 * 2; i++) pic = Math.max(pic, Math.abs(X2[i]));
  // le volume commun, sans dépasser -2,5 dB en crête avant l'encodage (le MP3 ajoute un peu au-dessus)
  const gain = Math.min(TARGET_RMS / Math.sqrt(s / (a1 - a0)), .75 / pic), out = path.join(dossier ? path.join(__dirname, '..', dossier) : OUT, name + '.mp3'), duree = n * P;
  fs.mkdirSync(path.dirname(out), { recursive: true });
  // aucune information copiée du fichier d'origine (titre, commentaire, lien) : seulement le son
  execFileSync('ffmpeg', ['-y', '-v', 'error', '-i', wav, '-map_metadata', '-1', '-af',
    `atrim=start=${coupe.toFixed(6)}:duration=${duree.toFixed(6)},asetpts=PTS-STARTPTS,afade=t=in:d=0.004,afade=t=out:st=${(duree - .004).toFixed(6)}:d=0.004,volume=${gain.toFixed(4)}`,
    '-c:a', 'libmp3lame', '-b:a', '128k', out]);
  // vérification : où commence la grosse caisse dans l'extrait, sur les temps de 124 BPM
  const y = lire(out), v = debutCoup(y, 0, P, ...verif), Y2 = lire(out, true);
  let picY = 0; for (const u of Y2) picY = Math.max(picY, Math.abs(u));
  console.log(name.padEnd(14), `${(y.length / SR).toFixed(2)} s (${n} temps)`, `retard du filtre ${(ret.med * 1000).toFixed(1)} ms (${(ret.min * 1000).toFixed(1)} à ${(ret.max * 1000).toFixed(1)})`,
    `gain ${(20 * Math.log10(gain)).toFixed(1)} dB`, `crête ${(20 * Math.log10(picY)).toFixed(1)} dB`,
    `le coup commence à ${(v.debut * 1000).toFixed(1)} ms du temps (attendu : ${DEBUT * 1000})`, `${(fs.statSync(out).size / 1e6).toFixed(2)} Mo`);
}
fs.rmSync(tmp, { recursive: true, force: true });
