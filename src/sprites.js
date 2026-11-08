import { g, mkCanvas } from './canvas.js';

// Sprites are drawn as text: each letter is a colour from PAL, and '.' is transparent.
export const PAL = {
  k:'#17151f', H:'#2b2730', s:'#c99a72', z:'#a1744f', b:'#0c0c12', W:'#dcd7c4', D:'#a9a492',
  r:'#b23a3a', L:'#4a4658', y:'#d9b144', c:'#23222e', t:'#d9b144', g:'#93ac6b', G:'#6c8550',
  e:'#efe26a', P:'#5b6a84', B:'#3c465c', T:'#6a5c4a', M:'#55d66a', N:'#2f9a44', O:'#d97b2e',
  a:'#c43fb0', A:'#e87ad6', u:'#2f6fd0', U:'#8fc0ff',
};

function sprite(rows) {
  const w = Math.max(...rows.map(r => r.length)), h = rows.length;
  const img = mkCanvas(w, h), x = img.getContext('2d');
  rows.forEach((row, j) => [...row].forEach((ch, i) => {
    if (ch !== '.') { x.fillStyle = PAL[ch]; x.fillRect(i, j, 1, 1); }
  }));
  const flipped = mkCanvas(w, h), fx = flipped.getContext('2d');
  fx.translate(w, 0);
  fx.scale(-1, 1);
  fx.drawImage(img, 0, 0);
  const whiten = src => {
    const c = mkCanvas(w, h), t = c.getContext('2d');
    t.drawImage(src, 0, 0);
    t.globalCompositeOperation = 'source-in';
    t.fillStyle = '#fff';
    t.fillRect(0, 0, w, h);
    return c;
  };
  return { img, flipped, hit: whiten(img), hitFlipped: whiten(flipped), w, h };
}

export function put(s, x, y, flip = false, hit = false, scale = 1) {
  g.imageSmoothingEnabled = false;
  const im = hit ? (flip ? s.hitFlipped : s.hit) : (flip ? s.flipped : s.img);
  g.drawImage(im, Math.round(x), Math.round(y), s.w * scale, s.h * scale);
}

const POL_TOP = [
  '.....kkkkkk.....',
  '....kHHHHHHk....',
  '...kHHHHHHHHk...',
  '...kssssssssk...',
  '...kbbbssbbbk...',
  '...ksbbssbbsk...',
  '...kssssssssk...',
  '...kszkkkkzsk...',
  '....kssssssk....',
  '...kkkWWWWkkk...',
  '..kWWrWWWWWWWk..',
  '.kWWWWrrWWWWWWk.',
  '.kWWWWWWrrWWWWk.',
  '.kWWWWWWWWrrWWk.',
  '.kWWWWWWWWWWrrk.',
  '.kDWWWWWWWWWWDk.',
  '..kkDDDDDDDDkk..',
];
export const polStand = sprite([...POL_TOP, '...kLLk..kLLk...', '...kLLk..kLLk...', '...kkkk..kkkk...']);
export const polWalkA = sprite([...POL_TOP, '...kLLk..kLLk...', '...kkkk..kLLk...', '..........kkkk..']);
export const polWalkB = sprite([...POL_TOP, '...kLLk..kLLk...', '...kLLk..kkkk...', '..kkkk..........']);
export const polSit = sprite([...POL_TOP, '...kLLk..kLLk...', '...kkkk..kkkk...']);

const ZOMBIE_TOP = [
  '...cccccccccc...',
  '.....cccccc.....',
  '...t.kggggggk...',
  '...t.kgeggegk...',
  '...y.kggggggk...',
  '.....kgkkkkgk...',
  '......kggggk....',
  '....kkPPPPkkggg.',
  '...kPPPPPPPPggg.',
  '...kPPPPPPkk....',
  '...kBPPPPBk.....',
  '...kPPPPPPk.....',
  '....kkkkkk......',
];
export const zombieA = sprite([...ZOMBIE_TOP, '....kTk.kTk.....', '....kTk.kTk.....', '....kk...kk.....']);
export const zombieB = sprite([...ZOMBIE_TOP, '....kTk.kTk.....', '...kTk...kTk....', '...kk.....kk....']);
export const zombieDead = sprite([
  'cccccc............',
  '..cc..............',
  '.kkkkkkkkkkkkkkk..',
  'kgkgkPPPPPPPPkTTk.',
  'kgggkPPPPPPPPkTTk.',
  'kgkgkPPPPPPPPkkkk.',
  '.kkkkkkkkkkkkkk...',
]);

export const banknote = sprite([
  'kkkkkkkkkkk',
  'kMMMMMMMMMk',
  'kMNMMNMMNMk',
  'kMMMNNNMMMk',
  'kMNMMNMMNMk',
  'kMMMMMMMMMk',
  'kkkkkkkkkkk',
]);

const ammoPack = sprite([
  'kkkkkkkkkkkkk',
  'kaaaaaaaaaaak',
  'kaAAAAAAAAAak',
  'kkkkkkkkkkkkk',
  'kaaaayyyaaaak',
  'kaaaayyyaaaak',
  'kaaaaaaaaaaak',
  'kkkkkkkkkkkkk',
]);
const tvSet = sprite([
  '..D.....D....',
  '...D...D.....',
  'kkkkkkkkkkkkk',
  'kUUUUUUUUkyyk',
  'kUuUUUUuUkuuk',
  'kUUUUUUUUkyyk',
  'kUUUUUUUUkuuk',
  'kkkkkkkkkkkkk',
]);
export const POWER_LOOK = {
  narrative: { sprite: ammoPack, col: PAL.A, glow: 'rgba(232,122,214,.3)' },
  media: { sprite: tvSet, col: PAL.U, glow: 'rgba(143,192,255,.3)' },
};

const WORKER_TOP = [
  '..yyyyy..',
  '.yyyyyyy.',
  '..ssssk..',
  '..skssk..',
  '...ss....',
  '..OOOO...',
  '.sOOOOs..',
  '.sOOOOs..',
  '..OOOO...',
];
export const workerA = sprite([...WORKER_TOP, '..LL.LL..', '..LL.LL..', '..kk.kk..']);
export const workerB = sprite([...WORKER_TOP, '..LL..LL.', '.LL....LL', '.kk....kk']);
