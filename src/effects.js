// Floating text and dust particles.

import { W } from './config.js';
import { rect } from './canvas.js';
import { textWidth, txt } from './font.js';
import { PAL } from './sprites.js';
import { G, cam } from './state.js';
import { clamp, rand } from './utils.js';

export function popup(x, y, s, c, life = 0.9) {
  G.popups.push({ x, y, s, c, t: 0, life });
}

export function puff(x, y, col, n) {
  for (let i = 0; i < n; i++) {
    G.parts.push({ x, y, vx: rand(-26, 26), vy: rand(-30, -4), t: 0, life: rand(0.25, 0.6), c: col });
  }
}

export function updateEffects(dt) {
  G.parts = G.parts.filter(p => {
    p.t += dt;
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.vy += 90 * dt;
    return p.t < p.life;
  });
  G.popups = G.popups.filter(p => {
    p.t += dt;
    return p.t < p.life;
  });
}

export function drawEffects() {
  for (const p of G.parts) rect(p.x - cam.x, p.y - cam.y, 2, 2, p.c);
  for (const p of G.popups) {
    const x = clamp(p.x - cam.x, textWidth(p.s) / 2 + 2, W - textWidth(p.s) / 2 - 2);
    txt(p.s, x, p.y - cam.y - p.t * 18, p.c, { align: 'c', ol: PAL.k });
  }
}
