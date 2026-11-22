// The construction scene: he drinks and lectures while the workers do everything.

import { CONFIG, W } from '../config.js';
import { g, rect } from '../canvas.js';
import { HALL_H, HALL_W, HALL_X, HALL_Y, hallDrab, siteDrab } from '../backgrounds.js';
import { drawEffects, puff } from '../effects.js';
import { txt } from '../font.js';
import { speech, updateSpeech } from '../speech.js';
import { PAL } from '../sprites.js';
import { G } from '../state.js';
import { drawBubble } from '../ui.js';
import { clamp, rand } from '../utils.js';
import { startEnd } from './flow.js';
import {
  CHAIR_X, drawBottles, drawChair, drawHall, drawSign, drawSittingPolitician, drawWorkers, sipTick,
} from './site.js';

function updateWorkers(list, dt) {
  for (const w of list) {
    if (w.arrived) {
      w.tx = rand(128, 306);
      w.ty = rand(140, 177);
      w.arrived = false;
    }
    const dx = w.tx - w.x, dy = w.ty - w.y, d = Math.hypot(dx, dy);
    if (d < 3) {
      w.arrived = true;
      continue;
    }
    w.x += dx / d * w.sp * dt;
    w.y += dy / d * w.sp * dt;
    w.flip = dx < 0;
    w.t += dt;
    if (Math.random() < dt * 5) puff(w.x, w.y, '#8f8d80', 1);
  }
}

export function updateBuild(dt) {
  const B = G.build;
  sipTick(B, dt);
  updateSpeech(dt);
  B.t += dt;
  G.hallP = clamp(B.t / CONFIG.buildSeconds);
  const buildLine = HALL_Y + HALL_H - HALL_H * G.hallP;
  if (Math.random() < dt * 6) puff(rand(HALL_X + 8, HALL_X + HALL_W - 8), buildLine, '#c9c6b8', 2);
  updateWorkers(B.workers, dt);
  if (B.t >= CONFIG.buildSeconds) startEnd();
}

export function renderBuild() {
  const B = G.build;
  g.drawImage(siteDrab, 0, 0);
  drawHall(G.hallP, hallDrab, true);
  drawSign(0);
  drawBottles();
  drawChair();
  drawSittingPolitician(B.sip);
  drawWorkers(B.workers, true);
  drawEffects();
  if (speech.t > 0.6 && speech.line) drawBubble(CHAIR_X, 116, speech.line, CHAIR_X + 4);

  rect(0, 0, W, 14, 'rgba(15,14,20,.82)');
  const barX = 84, barW = 152;
  rect(barX - 1, 1, barW + 2, 11, PAL.k);
  rect(barX, 2, barW, 9, '#2f2c38');
  rect(barX, 2, Math.round(barW * G.hallP), 9, '#d9b144');
  txt('CONSTRUCTION', W / 2, 3, '#ffffff', { align: 'c', ol: PAL.k });
}
