// Drawing shared by the construction scene and the ending.

import { g, pxLine, rect } from '../canvas.js';
import { HALL_H, HALL_W, HALL_X, HALL_Y } from '../backgrounds.js';
import { txt } from '../font.js';
import { PAL, polSit, put, workerA, workerB } from '../sprites.js';
import { G } from '../state.js';

export const CHAIR_X = 56, CHAIR_FEET = 174;

export function sipTick(state, dt) {
  const before = state.sip;
  state.sip += dt;
  if (before < 3.2 && state.sip >= 3.2) {
    state.sip = 0;
    G.beers++;
  }
}

export function drawHall(p, img, scaffold) {
  const r = Math.floor(HALL_H * p);
  if (r > 0) g.drawImage(img, 0, HALL_H - r, HALL_W, r, HALL_X, HALL_Y + HALL_H - r, HALL_W, r);
  if (scaffold) {
    const top = HALL_Y + HALL_H - r - 6;
    for (const x of [HALL_X + 2, HALL_X + 62, HALL_X + 130, HALL_X + 188]) {
      rect(x, top, 2, HALL_Y + HALL_H - top, '#3f3528');
    }
    rect(HALL_X - 2, top + 2, HALL_W + 6, 2, '#5a4a34');
    if (r > 44) rect(HALL_X - 2, HALL_Y + HALL_H - 44, HALL_W + 6, 2, '#5a4a34');
  }
}

export function drawSign(flipT) {
  const cx = 53, y = 46, full = 94, showBack = flipT > 0.5;
  const squeeze = Math.abs(Math.cos(flipT * Math.PI));
  rect(14, y + 30, 3, 44, '#3f3528');
  rect(90, y + 30, 3, 44, '#3f3528');
  const w = Math.max(2, Math.round(full * squeeze));
  rect(cx - w / 2 - 1, y - 1, w + 2, 36, PAL.k);
  rect(cx - w / 2, y, w, 34, showBack ? '#b23a3a' : '#c7b98f');
  if (w > 86) {
    const lines = showBack ? ['PRIVATE', 'RESIDENCE', 'KEEP OUT'] : ['MULTIPURPOSE', 'COMMUNITY', 'HALL'];
    const col = showBack ? '#ffffff' : PAL.k;
    lines.forEach((l, i) => txt(l, cx, y + 4 + i * 10, col, { align: 'c' }));
  }
}

export function drawBottles() {
  const n = Math.min(G.beers, 36);
  for (let i = 0; i < n; i++) {
    const row = Math.floor(i / 9), x = 5 + (i % 9) * 3 + (row % 2), y = 172 - row * 5;
    rect(x, y + 2, 2, 4, '#b9731f');
    rect(x, y, 2, 2, '#e8d48a');
  }
}

export function drawChair() {
  const x = CHAIR_X, f = CHAIR_FEET;
  rect(x - 16, f - 34, 32, 24, '#e8e4d6');
  rect(x - 16, f - 34, 32, 2, '#c4c0b0');
  rect(x - 18, f - 11, 36, 4, '#c4c0b0');
  rect(x - 16, f - 7, 3, 7, '#c4c0b0');
  rect(x + 13, f - 7, 3, 7, '#c4c0b0');
}

export function drawSittingPolitician(sip) {
  const x = CHAIR_X - 16, y = CHAIR_FEET - 42, u = 2;
  put(polSit, x, y, false, false, u);
  const sipping = sip > 2.3;
  const hand = sipping ? [11, 9] : [14, 15];
  pxLine(x + 13 * u, y + 11 * u, x + hand[0] * u, y + hand[1] * u, PAL.W, u);
  rect(x + 13 * u, y + 13 * u, u, u, PAL.k);
  if (sipping) {
    pxLine(x + hand[0] * u, y + hand[1] * u - u, x + 8 * u, y + 7 * u, '#b9731f', u);
    rect(x + 7 * u, y + 7 * u, u, u, '#e8d48a');
  } else {
    rect(x + (hand[0] - 0.5) * u, y + (hand[1] - 3) * u, u * 2, u * 5, '#b9731f');
    rect(x + (hand[0] - 0.5) * u, y + (hand[1] - 5) * u, u, u * 2, '#e8d48a');
  }
  rect(x + hand[0] * u, y + hand[1] * u, u, u, PAL.s);
  rect(x + (hand[0] + 0.5) * u, y + (hand[1] + 1) * u, u, u, PAL.y);
}

export function drawWorkers(list, moving) {
  [...list].sort((a, b) => a.y - b.y).forEach(w => {
    const fr = moving && Math.floor(w.t * 12) % 2 ? workerA : workerB;
    const x = w.x - 4, y = w.y - 12;
    put(moving ? fr : workerA, x, y, w.flip);
    if (w.cargo === 0) {
      rect(x + 1, y - 3, 7, 3, '#a3452f');
      rect(x + 4, y - 3, 1, 3, '#6e2e20');
    }
    if (w.cargo === 1) {
      const dir = w.flip ? -1 : 1, bx = w.flip ? x - 9 : x + 9;
      rect(bx, y + 5, 9, 4, '#6f6d66');
      rect(bx + 1, y + 4, 7, 2, '#c4b48a');
      rect(bx + 3 + dir * 2, y + 9, 3, 3, PAL.k);
    }
    if (w.cargo === 2) {
      pxLine(x + 7, y + 6, x + 11, y + 2, '#6a5c4a');
      rect(x + 10, y, 4, 2, PAL.k);
    }
  });
}
