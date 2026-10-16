// Fabrique les extraits de « Vrais morceaux » (lot 25) à partir des MP3 de audio-essai/fma/ (hors Git) : chaque extrait
// commence pile sur un temps, est ramené à 124 BPM et au même volume, puis encodé en MP3 dans musique/ (publié).
// Usage : node tests/vrais-morceaux.js        (il faut ffmpeg)
//
// Les morceaux sont de Play House (CC0, freemusicarchive.org/music/play-house). Leur grille a été mesurée le 16 oct. 2026 :
// tempo entier (125 ou 124 BPM), premier temps à `t0` secondes du début du fichier, drops sur des multiples de 32 temps.
// Mesure : coïncidence grosse caisse + clic sur plusieurs passages, et instant d'arrivée des basses aux drops. « On My Mind »
// a été écarté : sa grille ne tombait pas au même endroit selon les passages.
// Un extrait = une suite de morceaux de grille [premier temps, nombre de temps] mis bout à bout.
const { execFileSync } = require('child_process'), fs = require('fs'), path = require('path');
const SRC = path.join(__dirname, '..', 'audio-essai', 'fma'), OUT = path.join(__dirname, '..', 'musique'), BPM = 124, SR = 44100;
const TRACKS = {
  dj: { file: 'playhouse-dj.mp3', bpm: 125, t0: .015 },
  animal: { file: 'playhouse-like-an-animal.mp3', bpm: 124, t0: .039 },
  power: { file: 'playhouse-power-of-the-beat.mp3', bpm: 124, t0: .019 }
};
// Platine A : 132 temps avec des basses ; platine B : 64 temps d'intro puis le drop (B0), ou une intro qui a déjà des basses (B1)
const CUTS = {
  'dj-a': ['dj', [[256, 136]]],
  'animal-a': ['animal', [[320, 136]]],
  'animal-b': ['animal', [[32, 136]]],
  'dj-b': ['dj', [[0, 32], [224, 104]]],   // l'intro (32 temps) raccordée à la montée (32 temps), puis le drop
  'power-b': ['power', [[0, 136]]]
};
const TARGET_RMS = .17;   // volume commun (environ -15 dB), le limiteur du site s'occupe des crêtes
fs.mkdirSync(OUT, { recursive: true });
const tmp = fs.mkdtempSync(path.join(require('os').tmpdir(), 'vrais-'));
for (const [name, [key, parts]] of Object.entries(CUTS)){
  const tr = TRACKS[key], P = 60 / tr.bpm, rate = BPM / tr.bpm, wav = path.join(tmp, name + '.wav');
  // morceaux de grille découpés à l'échantillon près, mis bout à bout, puis ramenés à 124 BPM (comme un vinyle un peu ralenti)
  const fc = `[0:a]aresample=${SR},asplit=${parts.length}` + parts.map((_, i) => `[s${i}]`).join('') + ';' + parts.map(([from, n], i) => `[s${i}]atrim=start=${(tr.t0 + from * P).toFixed(6)}:duration=${(n * P).toFixed(6)},asetpts=PTS-STARTPTS[p${i}]`).join(';')
    + ';' + parts.map((_, i) => `[p${i}]`).join('') + `concat=n=${parts.length}:v=0:a=1[c];[c]asetrate=${(SR * rate).toFixed(3)},aresample=${SR},afade=t=in:d=0.004,afade=t=out:st=${((parts.reduce((s, p) => s + p[1], 0) * P) / rate - .6).toFixed(3)}:d=0.6[o]`;
  execFileSync('ffmpeg', ['-y', '-v', 'error', '-i', path.join(SRC, tr.file), '-filter_complex', fc, '-map', '[o]', '-ac', '2', '-ar', String(SR), wav]);
  // volume : on mesure l'énergie moyenne et on la ramène à la cible
  const raw = execFileSync('ffmpeg', ['-v', 'error', '-i', wav, '-ac', '1', '-f', 'f32le', '-'], { maxBuffer: 1 << 30 }), X = new Float32Array(raw.buffer, raw.byteOffset, raw.length / 4);
  let s = 0; for (const x of X) s += x * x; const rms = Math.sqrt(s / X.length), gain = TARGET_RMS / rms;
  const out = path.join(OUT, name + '.mp3');
  execFileSync('ffmpeg', ['-y', '-v', 'error', '-i', wav, '-af', `volume=${gain.toFixed(4)}`, '-c:a', 'libmp3lame', '-b:a', '128k', out]);
  console.log(name.padEnd(9), `${(X.length / SR).toFixed(1)} s`, `gain ${(20 * Math.log10(gain)).toFixed(1)} dB`, `${(fs.statSync(out).size / 1e6).toFixed(2)} Mo`);
}
fs.rmSync(tmp, { recursive: true, force: true });
