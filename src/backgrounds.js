// Art that is drawn once at startup and then reused every frame.

import { W, H, WORLD_W, WORLD_H } from './config.js';
import { drawOn, mkCanvas, pxLine, rect } from './canvas.js';
import { txt } from './font.js';
import { pick, rand } from './utils.js';

export const world = mkCanvas(WORLD_W, WORLD_H);
drawOn(world.getContext('2d'), () => {
  rect(0, 0, WORLD_W, WORLD_H, '#3a3427');
  for (let i = 0; i < 2600; i++) {
    rect(rand(0, WORLD_W), rand(0, WORLD_H), 1, 1, pick(['#443d2e', '#322d22', '#4b4433']));
  }
  for (let i = 0; i < 120; i++) {
    const x = rand(0, WORLD_W), y = rand(0, WORLD_H);
    rect(x, y, 1, 3, '#5b5a3a');
    rect(x + 2, y + 1, 1, 2, '#5b5a3a');
    rect(x - 2, y + 1, 1, 2, '#4f4e33');
  }
  for (let i = 0; i < 40; i++) {
    const x = rand(0, WORLD_W), y = rand(0, WORLD_H), w = Math.floor(rand(3, 8));
    rect(x, y, w, 3, '#55503f');
    rect(x, y + 3, w, 1, '#2c281e');
  }
  // The scholarship office, long since closed.
  rect(250, 34, 140, 52, '#5a5648');
  rect(250, 86, 140, 3, '#2c281e');
  rect(244, 26, 152, 9, '#47443a');
  rect(258, 40, 124, 11, '#2c281e');
  txt('SCHOLARSHIP OFFICE', 320, 42, '#a9a492', { align: 'c' });
  for (const x of [264, 348]) {
    rect(x, 58, 26, 18, '#2c281e');
    pxLine(x, 58, x + 26, 76, '#47443a');
  }
  rect(306, 58, 28, 28, '#2c281e');
  rect(300, 66, 40, 10, '#b23a3a');
  txt('CLOSED', 320, 68, '#dcd7c4', { align: 'c' });
  const notices = [[60, 60, 'FEES', 'DUE'], [560, 90, 'FUNDS', 'DELAYED'], [90, 290, 'PLEASE', 'WAIT'], [540, 300, 'FILE', 'FORM 9B']];
  for (const [x, y, a, b] of notices) {
    rect(x - 1, y + 20, 3, 14, '#2c281e');
    rect(x - 25, y, 50, 22, '#6a5c4a');
    txt(a, x, y + 3, '#1f1c16', { align: 'c' });
    txt(b, x, y + 12, '#1f1c16', { align: 'c' });
  }
});

export const HALL_X = 122, HALL_Y = 26, HALL_W = 192, HALL_H = 110;
export const DOOR = { x: HALL_X + 78, y: HALL_Y + 60, w: 36, h: 42 };
export const UPPER_WINDOWS = [38, 64, 90, 116, 142];

function makeHall(p, finished) {
  const c = mkCanvas(HALL_W, HALL_H);
  drawOn(c.getContext('2d'), () => {
    // Roof
    for (let i = 0; i < 26; i++) {
      const half = 10 + Math.round(i * 2.9);
      rect(96 - half, i, half * 2, 1, i % 4 === 0 ? p.roofD : p.roof);
    }
    if (finished) txt('F', 94, 11, p.gold);
    // Upper floor and balcony
    rect(26, 26, 140, 30, p.wall);
    rect(26, 26, 140, 2, p.wallD);
    for (const x of UPPER_WINDOWS) {
      rect(x - 1, 31, 14, 20, p.trim);
      rect(x, 32, 12, 18, p.win);
      rect(x + 5, 32, 2, 18, p.winD);
    }
    rect(18, 50, 156, 2, p.trim);
    rect(18, 55, 156, 1, p.wallD);
    for (let x = 20; x < 174; x += 6) rect(x, 52, 2, 3, p.trim);
    // Ground floor
    rect(8, 56, 176, 46, p.wall);
    rect(8, 56, 176, 3, p.wallD);
    for (const x of [14, 64, 122, 172]) {
      rect(x, 56, 6, 46, p.trim);
      rect(x + 4, 56, 2, 46, p.wallD);
    }
    for (const x of [26, 46, 132, 152]) {
      rect(x - 1, 65, 16, 26, p.trim);
      rect(x, 66, 14, 24, p.win);
      rect(x + 6, 66, 2, 24, p.winD);
    }
    // Grand entrance
    rect(76, 58, 40, 44, p.gold);
    rect(78, 60, 36, 42, p.door);
    rect(95, 60, 2, 42, p.doorD);
    rect(91, 80, 2, 4, p.gold);
    rect(99, 80, 2, 4, p.gold);
    // Foundation and steps
    rect(0, 102, 192, 8, p.stone);
    for (let x = 0; x < 192; x += 12) rect(x, 102, 1, 8, p.stoneD);
    rect(0, 105, 192, 1, p.stoneD);
    rect(72, 102, 48, 3, p.trim);
    rect(68, 105, 56, 5, p.wallD);
  });
  return c;
}

export const COLOR_PAL = { stone:'#b4a890', stoneD:'#8f8470', wall:'#f2dfb4', wallD:'#d8bf8c', trim:'#ffffff', roof:'#c9552e', roofD:'#a0401f', win:'#86d0f2', winD:'#4c8fb4', door:'#7a4a24', doorD:'#5a3418', gold:'#f2c744' };
const DRAB_PAL = { stone:'#6f6d66', stoneD:'#57564f', wall:'#9c9a90', wallD:'#7f7d74', trim:'#b8b6ac', roof:'#6d6a62', roofD:'#55534c', win:'#5c6066', winD:'#484b50', door:'#54504a', doorD:'#3f3c38', gold:'#8a8778' };

export const hallDrab = makeHall(DRAB_PAL, false);
export const hallColor = makeHall(COLOR_PAL, true);

function makeSite(sky, far, ground, speck, sun) {
  const c = mkCanvas(W, H);
  drawOn(c.getContext('2d'), () => {
    rect(0, 0, W, 118, sky);
    if (sun) {
      rect(26, 18, 20, 20, sun);
      rect(23, 21, 26, 14, sun);
      rect(29, 15, 14, 26, sun);
    }
    for (let x = 0; x < W; x += 2) rect(x, 104 + Math.sin(x / 26) * 6 + Math.sin(x / 9) * 2, 2, 20, far);
    rect(0, 118, W, 62, ground);
    for (let i = 0; i < 340; i++) rect(rand(0, W), rand(118, H), 1, 1, pick(speck));
  });
  return c;
}

export const siteDrab = makeSite('#8a8a86', '#6d6c66', '#5c5a4c', ['#67655a', '#514f43', '#6e6c60'], null);
export const siteColor = makeSite('#7cc4ef', '#5b9c5a', '#74b552', ['#88c766', '#62a044', '#9ad277'], '#ffe27a');
