import { CONFIG } from './config.js';
import { clamp, lerp } from './utils.js';

// Everything that changes during play lives here, so any module can read it.
export const G = {
  scene: 'title',
  money: 0,
  peak: 0,
  kills: 0,
  beers: 0,
  hallP: 0,
  lock: 0,
  time: 0,
  blocked: false,
  touchMode: false,
  zombies: [],
  bullets: [],
  bodies: [],
  popups: [],
  parts: [],
  spawnT: 0,
  groanT: 2,
  shieldT: 0,
  build: null,
  ending: null,
  btns: [],
};

export const P = { x: 320, y: 190, aim: 0, cd: 0, walkT: 0, moving: false, flash: 0 };
export const cam = { x: 0, y: 0 };

export const power = {};
export function resetPowers() {
  for (const [k, cfg] of Object.entries(CONFIG.powerups)) {
    power[k] = { pack: null, timer: cfg.firstAt, active: 0 };
  }
}
resetPowers();
export const powerOn = k => power[k].active > 0;

export const target = () => CONFIG.notes * CONFIG.noteValue;
export const isFull = () => G.money >= target();
export const progress = () => clamp(G.peak / target());
export const crowdCap = p => Math.round(lerp(CONFIG.crowd[0], CONFIG.crowd[1], p));
export const spawnGap = p => lerp(CONFIG.spawnDelay[0], CONFIG.spawnDelay[1], p);
