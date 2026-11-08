// The construction scene: he drinks and lectures while the workers do everything.

import { CONFIG, W, H } from '../config.js';
import { g, rect } from '../canvas.js';
import { HALL_H, HALL_W, HALL_X, HALL_Y, hallDrab, siteDrab } from '../backgrounds.js';
import { drawEffects, popup, puff } from '../effects.js';
import { txt } from '../font.js';
import { speech, updateSpeech } from '../speech.js';
import { PAL } from '../sprites.js';
import { G, lastPhase } from '../state.js';
import { button, drawBubble } from '../ui.js';
import { clamp, pick, rand } from '../utils.js';
import { goCollect, startEnd } from './flow.js';
import {
  CHAIR_X, drawBottles, drawChair, drawHall, drawSign, drawSittingPolitician, drawWorkers, sipTick,
} from './site.js';

function updateWorkers(list, dt, working) {
  for (const w of list) {
    if (!working) continue;
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
  if (!B.done) {
    B.t += dt;
    G.hallP = B.from + (B.to - B.from) * clamp(B.t / CONFIG.buildSeconds);
    const buildLine = HALL_Y + HALL_H - HALL_H * G.hallP;
    if (Math.random() < dt * 2.6) popup(rand(150, 300), buildLine + rand(-4, 20), pick(['TOK', 'TOK TOK', 'BANG', 'CLANK']), '#efe9d0', 0.5);
    if (Math.random() < dt * 6) puff(rand(HALL_X + 8, HALL_X + HALL_W - 8), buildLine, '#c9c6b8', 2);
    if (B.t >= CONFIG.buildSeconds) {
      G.hallP = B.to;
      if (G.phase === lastPhase()) startEnd();
      else B.done = true;
    }
  } else {
    B.alertT += dt;
  }
  updateWorkers(B.workers, dt, !B.done);
}

function drawFundsAlert(B) {
  rect(0, 0, W, H, 'rgba(10,8,14,.6)');
  const x = 45, y = 44, w = 230, h = 92;
  rect(x - 2, y - 2, w + 4, h + 4, '#b23a3a');
  rect(x, y, w, h, '#f2ead2');
  txt('ALERT', W / 2, y + 7, '#b23a3a', { align: 'c' });
  txt('FUNDS RAN OUT!', W / 2, y + 19, '#b23a3a', { s: 2, align: 'c' });
  txt(`CONSTRUCTION STOPPED AT ${Math.round(G.hallP * 100)}%`, W / 2, y + 41, PAL.k, { align: 'c' });
  if (B.alertT > 0.4) button(62, y + 59, 196, 24, 'GO COLLECT MORE SCHOLARSHIPS', goCollect, '#d9b144');
}

export function renderBuild() {
  const B = G.build;
  g.drawImage(siteDrab, 0, 0);
  drawHall(G.hallP, hallDrab, true);
  drawSign(0);
  drawBottles();
  drawChair();
  drawSittingPolitician(B.sip);
  drawWorkers(B.workers, !B.done);
  drawEffects();
  if (speech.t > 0.6 && speech.line) drawBubble(CHAIR_X, 116, speech.line, CHAIR_X + 4);

  rect(0, 0, W, 14, 'rgba(15,14,20,.82)');
  if (lastPhase() > 0) txt(`PHASE ${G.phase + 1}/${lastPhase() + 1}`, 4, 3, '#d9d6c8');
  const barX = 84, barW = 152;
  rect(barX - 1, 1, barW + 2, 11, PAL.k);
  rect(barX, 2, barW, 9, '#2f2c38');
  rect(barX, 2, Math.round(barW * G.hallP), 9, '#d9b144');
  txt('CONSTRUCTION', W / 2, 3, '#ffffff', { align: 'c', ol: PAL.k });
  txt(`HALL ${Math.round(G.hallP * 100)}%`, W - 4, 3, '#d9d6c8', { align: 'r' });

  if (B.done) drawFundsAlert(B);
}
