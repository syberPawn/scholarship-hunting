import { canvas } from './canvas.js';
import { CONFIG } from './config.js';
import { updateEffects } from './effects.js';
import { FONT, textWidth } from './font.js';
import { initInput, stick } from './input.js';
import { GROANS, POLITICIAN_LESSONS, RARE_GROAN } from './lines.js';
import { nextPoliticianLine, speech } from './speech.js';
import {
  G, P, cam, crowdCap, isFull, power, powerOn, progress, resetPowers, spawnGap, target,
} from './state.js';
import { renderBattle, updateBattle } from './scenes/battle.js';
import { renderBuild, updateBuild } from './scenes/build.js';
import { renderEnd, updateEnd } from './scenes/ending.js';
import { startBattle } from './scenes/flow.js';
import { renderTitle } from './scenes/title.js';

const UPDATE = { battle: updateBattle, build: updateBuild, end: updateEnd };
const RENDER = { title: renderTitle, battle: renderBattle, build: renderBuild, end: renderEnd };

let last = performance.now();

function frame(now) {
  const dt = Math.min(1 / 20, (now - last) / 1000);
  last = now;
  if (!G.blocked) {
    G.time += dt;
    G.lock = Math.max(0, G.lock - dt);
    if (UPDATE[G.scene]) UPDATE[G.scene](dt);
    updateEffects(dt);
  }
  G.btns = [];
  RENDER[G.scene]();
  requestAnimationFrame(frame);
}

initInput();
requestAnimationFrame(frame);

// Lets the tests in tests/ reach the game. Removed from production builds.
if (import.meta.env.DEV) {
  window.__game = {
    canvas, CONFIG, FONT, textWidth, stick, GROANS, POLITICIAN_LESSONS, RARE_GROAN,
    nextPoliticianLine, speech, G, P, cam, crowdCap, isFull, power, powerOn, progress,
    resetPowers, spawnGap, target, startBattle, updateBattle, updateEffects,
  };
}
