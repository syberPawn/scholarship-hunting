import { CONFIG } from './config.js';
import { clamp, lerp } from './utils.js';

// Everything that changes during play lives here, so any module can read it.
export const G = {
  scene: 'title',
  level: CONFIG.levels.easy,
  phase: 0,
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
  immunityT: 0,
  biteT: 0,
  build: null,
  ending: null,
  btns: [],
};

export const P = { x: 320, y: 190, aim: 0, cd: 0, walkT: 0, moving: false, flash: 0, hurt: 0 };
export const cam = { x: 0, y: 0 };

export const power = {};
export function resetPowers() {
  for (const [k, cfg] of Object.entries(CONFIG.powerups)) {
    power[k] = { pack: null, timer: cfg.firstAt, active: 0 };
  }
}
resetPowers();
export const powerOn = k => power[k].active > 0;

export const lastPhase = () => CONFIG.phases.length - 1;
export const target = () => G.level.notes * CONFIG.noteValue;
export const isFull = () => G.money >= target();
// Uses the highest funds reached, so bites never bring the crowds back.
export const progress = () => clamp(G.peak / target());
export const crowdCap = p => Math.round(lerp(G.level.crowd[0], G.level.crowd[1], p));
export const spawnGap = p => lerp(G.level.delay[0], G.level.delay[1], p);
