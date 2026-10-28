// Fabrique les sons d'exemple du guide du débutant (guide/sons/, publiés) à partir des extraits de musique/ (Play House, CC0).
// Les extraits sont à 124 BPM et commencent pile sur un temps (voir tests/vrais-morceaux.js) : un temps = 60 / 124 s.
// Usage : node tests/sons-guide.js        (il faut ffmpeg)
//
// Repères mesurés le 28 oct. 2026 (énergie des graves mesure par mesure) : dans dj-b, la basse arrive au temps 64
// (+12 dB dans les graves), au début d'une phrase ; les temps 0 à 63 n'ont que la grosse caisse et le reste du rythme.
const { execFileSync } = require('child_process'), fs = require('fs'), path = require('path');
const SRC = path.join(__dirname, '..', 'musique'), OUT = path.join(__dirname, '..', 'guide', 'sons'), P = 60 / 124, SR = 44100;
const TARGET_RMS = .17;   // même volume que la vraie musique du site
const DECALE_MS = 60;     // « ba-boum » : un huitième de temps (le chapitre 5 décale de 40 à 90 ms)

// Une piste = [extrait, premier temps, nombre de temps, options] ; un son = une ou deux pistes jouées ensemble.
const SONS = {
  // la page « phrase » : une phrase entière (32 temps, la grille s'allume avec elle), puis 8 temps de la suivante
  phrase: [['dj-b', 32, 40]],
  // la page « caler » : A (avec ses basses) et l'intro de B (grosse caisse, sans basse), calés ou décalés
  cale: [['animal-a', 0, 16], ['dj-b', 0, 16]],
  decale: [['animal-a', 0, 16], ['dj-b', 0, 16, { retard: DECALE_MS }]],
  // la page « première transition » : les deux basses ensemble, puis après le swap (LOW de A coupé)
  'deux-basses': [['animal-a', 64, 16], ['dj-a', 64, 16]],
  swap: [['animal-a', 64, 16, { basses: false }], ['dj-a', 64, 16]]
};

fs.mkdirSync(OUT, { recursive: true });
const tmp = fs.mkdtempSync(path.join(require('os').tmpdir(), 'sons-guide-'));
for (const [nom, pistes] of Object.entries(SONS)){
  const duree = pistes[0][2] * P, wav = path.join(tmp, nom + '.wav');
  const entrees = pistes.flatMap(([f]) => ['-i', path.join(SRC, f + '.mp3')]);
  const chaines = pistes.map(([, debut, n, o = {}], i) => {
    let c = `[${i}:a]atrim=start=${(debut * P).toFixed(6)}:duration=${(n * P).toFixed(6)},asetpts=PTS-STARTPTS`;
    if (o.basses === false) c += ',lowshelf=g=-26:f=200,highpass=f=40';   // LOW tout à gauche, comme sur la table
    if (o.retard) c += `,adelay=${o.retard}:all=1,atrim=duration=${duree.toFixed(6)}`;
    return c + `[p${i}]`;
  });
  const mix = pistes.length > 1 ? ';' + pistes.map((_, i) => `[p${i}]`).join('') + `amix=inputs=${pistes.length}:normalize=0[m]` : '';
  const fin = pistes.length > 1 ? '[m]' : '[p0]';
  const fc = chaines.join(';') + mix + `;${fin}afade=t=in:d=0.005,afade=t=out:st=${(duree - (nom === 'phrase' ? 1.5 : .4)).toFixed(3)}:d=${nom === 'phrase' ? 1.5 : .4}[o]`;
  execFileSync('ffmpeg', ['-y', '-v', 'error', ...entrees, '-filter_complex', fc, '-map', '[o]', '-map_metadata', '-1', '-ac', '2', '-ar', String(SR), wav]);
  // même volume pour tous les sons : deux sons comparés ne doivent pas différer par le volume
  const raw = execFileSync('ffmpeg', ['-v', 'error', '-i', wav, '-ac', '1', '-f', 'f32le', '-'], { maxBuffer: 1 << 30 }), X = new Float32Array(raw.buffer, raw.byteOffset, raw.length / 4);
  let s = 0; for (const x of X) s += x * x; const gain = TARGET_RMS / Math.sqrt(s / X.length);
  const out = path.join(OUT, nom + '.mp3');
  execFileSync('ffmpeg', ['-y', '-v', 'error', '-i', wav, '-map_metadata', '-1', '-af', `volume=${gain.toFixed(4)},alimiter=limit=0.95:level=false`, '-c:a', 'libmp3lame', '-b:a', '160k', out]);
  console.log(nom.padEnd(12), `${(X.length / SR).toFixed(2)} s`, `gain ${(20 * Math.log10(gain)).toFixed(1)} dB`, `${(fs.statSync(out).size / 1e3).toFixed(0)} Ko`);
}
fs.rmSync(tmp, { recursive: true, force: true });
