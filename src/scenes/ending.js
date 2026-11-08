// The ending: the politician always wins.

import { W } from '../config.js';
import { g, rect } from '../canvas.js';
import {
  COLOR_PAL, DOOR, HALL_X, HALL_Y, UPPER_WINDOWS, hallColor, hallDrab, siteColor, siteDrab,
} from '../backgrounds.js';
import { drawEffects, puff } from '../effects.js';
import { txt } from '../font.js';
import { speech, updateSpeech } from '../speech.js';
import { PAL, polStand, polWalkA, polWalkB, put } from '../sprites.js';
import { G } from '../state.js';
import { button, drawBubble } from '../ui.js';
import { clamp } from '../utils.js';
import { goTitle, newGame } from './flow.js';
import {
  CHAIR_FEET, CHAIR_X, drawBottles, drawChair, drawHall, drawSign, drawSittingPolitician, drawWorkers, sipTick,
} from './site.js';

// When each beat happens, in seconds.
const T = {
  signStart: 1.6, signEnd: 2.4, colorStart: 2.6, colorEnd: 3.8, walkStart: 3.9, walkEnd: 6.6,
  doorOpen: 6.1, doorClose: 6.8, closed: 7.3, lights: 7.5, panel: 8.5,
};

export function updateEnd(dt) {
  const E = G.ending;
  E.t += dt;
  if (E.t < T.walkStart) {
    sipTick(E, dt);
    updateSpeech(dt);
  }
  for (const w of E.workers) {
    w.x += w.sp * dt;
    w.t += dt;
    w.flip = false;
    if (Math.random() < dt * 5 && w.x < W) puff(w.x, w.y, '#8f8d80', 1);
  }
}

function drawColorReveal(t) {
  const colorP = clamp((t - T.colorStart) / (T.colorEnd - T.colorStart));
  if (colorP <= 0) return;
  g.save();
  g.beginPath();
  g.arc(DOOR.x + DOOR.w / 2, DOOR.y + 20, colorP * 380, 0, Math.PI * 2);
  g.clip();
  g.drawImage(siteColor, 0, 0);
  drawHall(1, hallColor, false);
  g.restore();
}

function drawPolitician(t, sip) {
  if (t < T.walkStart) {
    drawSittingPolitician(sip);
    if (speech.t > 0.6 && speech.line) drawBubble(CHAIR_X, 116, speech.line, CHAIR_X + 4);
  } else if (t < T.closed) {
    const w = clamp((t - T.walkStart) / (T.walkEnd - T.walkStart));
    const feetX = CHAIR_X + (DOOR.x + DOOR.w / 2 - CHAIR_X) * w;
    const feetY = CHAIR_FEET + (DOOR.y + DOOR.h - CHAIR_FEET) * w;
    const fr = w < 1 ? (Math.floor(t * 8) % 2 ? polWalkA : polWalkB) : polStand;
    put(fr, feetX - 16, feetY - 40, false, false, 2);
  }
}

function drawGameOver() {
  const x = 58, y = 70, w = 204, h = 80;
  rect(x - 2, y - 2, w + 4, h + 4, PAL.k);
  rect(x, y, w, h, '#f2ead2');
  txt('GAME OVER', W / 2, y + 7, '#b23a3a', { s: 2, align: 'c' });
  txt('THE POLITICIAN ALWAYS WINS', W / 2, y + 27, PAL.k, { align: 'c' });
  button(66, y + 44, 92, 26, 'PLAY AGAIN', newGame, '#d9b144');
  button(162, y + 44, 92, 26, 'CHANGE LEVEL', goTitle, '#c4c0b0');
}

export function renderEnd() {
  const E = G.ending, t = E.t;
  g.drawImage(siteDrab, 0, 0);
  drawHall(1, hallDrab, false);
  drawColorReveal(t);
  drawSign(clamp((t - T.signStart) / (T.signEnd - T.signStart)));
  drawBottles();
  drawChair();
  drawWorkers(E.workers, true);

  // Door, politician, door again, so the doors close in front of him.
  const open = t < T.doorOpen ? 0 : t < T.doorClose ? clamp((t - T.doorOpen) / 0.4) : 1 - clamp((t - T.doorClose) / 0.4);
  const panelW = Math.round((DOOR.w / 2) * (1 - open));
  if (open > 0) rect(DOOR.x, DOOR.y, DOOR.w, DOOR.h, '#1a120c');
  drawPolitician(t, E.sip);
  if (open > 0) {
    rect(DOOR.x, DOOR.y, panelW, DOOR.h, COLOR_PAL.door);
    rect(DOOR.x + DOOR.w - panelW, DOOR.y, panelW, DOOR.h, COLOR_PAL.door);
  }

  if (t > T.lights) {
    for (const x of UPPER_WINDOWS) rect(HALL_X + x, HALL_Y + 32, 12, 18, '#ffe27a');
    if (t < T.panel) txt('HOME SWEET HOME!', HALL_X + 96, 12, '#ffffff', { align: 'c', ol: PAL.k });
  }
  drawEffects();
  if (t < T.signStart) txt('CONSTRUCTION COMPLETE!', W / 2, 16, '#ffffff', { align: 'c', ol: PAL.k });
  if (t > T.panel) drawGameOver();
}
