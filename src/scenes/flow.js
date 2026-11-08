// Moving between scenes, and setting each one up.

import { CONFIG, W, H } from '../config.js';
import { mouse } from '../input.js';
import { speech } from '../speech.js';
import { G, P, cam, resetPowers } from '../state.js';
import { rand } from '../utils.js';

export function spawnZombie() {
  const side = Math.floor(rand(0, 4));
  let x = cam.x + rand(0, W), y = cam.y + rand(0, H);
  if (side === 0) y = cam.y - 22;
  if (side === 1) y = cam.y + H + 22;
  if (side === 2) x = cam.x - 22;
  if (side === 3) x = cam.x + W + 22;
  G.zombies.push({
    x, y, hp: G.level.hp, sp: G.level.speed + rand(-4, 10),
    kx: 0, ky: 0, stun: 0, hitT: 0, walkT: rand(0, 2), flip: false,
  });
}

function makeWorker() {
  return {
    x: rand(130, 300), y: rand(142, 176), tx: 0, ty: 0, sp: rand(58, 96), t: rand(0, 3),
    cargo: Math.floor(rand(0, 3)), flip: false, arrived: true,
  };
}

function clearField() {
  G.zombies = [];
  G.bullets = [];
  G.bodies = [];
  G.popups = [];
  G.parts = [];
}

export function startBattle() {
  clearField();
  G.scene = 'battle';
  G.money = 0;
  G.peak = 0;
  G.kills = 0;
  G.lock = 0.3;
  G.spawnT = 0;
  G.groanT = 2;
  G.immunityT = 0;
  G.biteT = 0;
  P.hurt = 0;
  resetPowers();
  for (let i = 0; i < 4; i++) spawnZombie();
}

export function newGame() {
  G.phase = 0;
  G.beers = 0;
  G.hallP = 0;
  speech.bag = [];
  P.x = 320;
  P.y = 190;
  startBattle();
}

export function startLevel(key) {
  G.level = CONFIG.levels[key];
  newGame();
}

export function goTitle() {
  G.scene = 'title';
  G.lock = 0.3;
}

export function startBuild() {
  clearField();
  cam.x = 0;
  cam.y = 0;
  mouse.down = false;
  G.scene = 'build';
  G.lock = 0.3;
  speech.t = 0;
  G.build = {
    t: 0, from: G.hallP, to: CONFIG.phases[G.phase].builtTo, done: false, alertT: 0, sip: 0,
    workers: Array.from({ length: 7 }, makeWorker),
  };
}

export function goCollect() {
  G.phase++;
  startBattle();
}

export function startEnd() {
  G.scene = 'end';
  G.lock = 0.3;
  G.ending = { t: 0, workers: G.build.workers, sip: G.build.sip };
  for (const w of G.ending.workers) {
    w.tx = rand(350, 400);
    w.ty = w.y;
    w.sp = rand(120, 170);
    w.arrived = false;
  }
}
