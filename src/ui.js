import { W } from './config.js';
import { rect } from './canvas.js';
import { textWidth, txt } from './font.js';
import { PAL } from './sprites.js';
import { G } from './state.js';
import { clamp } from './utils.js';

/** Draws a button and registers it for this frame's taps and clicks. */
export function button(x, y, w, h, label, fn, col) {
  G.btns.push({ x, y, w, h, fn });
  rect(x - 2, y - 2, w + 4, h + 4, PAL.k);
  rect(x, y, w, h, col);
  rect(x, y + h - 2, w, 2, '#8a6d22');
  txt(label, x + w / 2, y + Math.floor((h - 7) / 2) - 1, PAL.k, { align: 'c' });
}

export function drawBubble(cx, y, text, tailX) {
  const w = textWidth(text) + 8, x = Math.round(clamp(cx - w / 2, 2, W - w - 2));
  rect(x - 1, y - 1, w + 2, 13, PAL.k);
  rect(x, y, w, 11, '#ffffff');
  if (tailX !== undefined) {
    rect(tailX - 1, y + 12, 4, 2, PAL.k);
    rect(tailX, y + 11, 2, 2, '#ffffff');
  }
  txt(text, x + 4, y + 2, PAL.k);
}
