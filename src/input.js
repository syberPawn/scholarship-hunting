// Touch, mouse and keyboard, plus fitting the game to the screen.

import { W, H } from './config.js';
import { canvas } from './canvas.js';
import { G } from './state.js';

export const keys = {};
export const mouse = { x: W / 2, y: H / 2, down: false };
export const stick = { id: null, cx: 0, cy: 0, dx: 0, dy: 0, radius: 24 };

const coarse = window.matchMedia('(pointer: coarse)');
G.touchMode = coarse.matches;
let fullscreenTried = false;

function toGame(e) {
  const r = canvas.getBoundingClientRect();
  return { x: (e.clientX - r.left) / r.width * W, y: (e.clientY - r.top) / r.height * H };
}

function pressButtonAt(p) {
  if (G.lock > 0) return false;
  const margin = 4;
  for (const b of G.btns) {
    if (p.x >= b.x - margin && p.x <= b.x + b.w + margin && p.y >= b.y - margin && p.y <= b.y + b.h + margin) {
      b.fn();
      return true;
    }
  }
  return false;
}

function onPointerDown(e) {
  e.preventDefault();
  G.touchMode = e.pointerType !== 'mouse';
  const p = toGame(e);
  if (pressButtonAt(p)) return;
  if (G.scene !== 'battle') return;
  if (G.touchMode) {
    if (stick.id === null && p.x < W * 0.6) {
      stick.id = e.pointerId;
      stick.cx = p.x;
      stick.cy = p.y;
      stick.dx = 0;
      stick.dy = 0;
      try { canvas.setPointerCapture(e.pointerId); } catch { /* pointer already gone */ }
    }
  } else {
    mouse.down = true;
    mouse.x = p.x;
    mouse.y = p.y;
  }
}

function onPointerMove(e) {
  const p = toGame(e);
  if (e.pointerId === stick.id) {
    const dx = (p.x - stick.cx) / stick.radius, dy = (p.y - stick.cy) / stick.radius, d = Math.hypot(dx, dy);
    stick.dx = d > 1 ? dx / d : dx;
    stick.dy = d > 1 ? dy / d : dy;
  } else if (e.pointerType === 'mouse') {
    mouse.x = p.x;
    mouse.y = p.y;
  }
}

function releasePointer(e) {
  if (e.pointerId === stick.id) {
    stick.id = null;
    stick.dx = 0;
    stick.dy = 0;
  }
  if (e.pointerType === 'mouse') mouse.down = false;
}

// Android allows full screen and a landscape lock after the first tap. iPhones ignore this.
function tryFullscreen() {
  if (!coarse.matches || fullscreenTried) return;
  fullscreenTried = true;
  const el = document.documentElement;
  if (!el.requestFullscreen) return;
  el.requestFullscreen().then(() => {
    if (screen.orientation && screen.orientation.lock) return screen.orientation.lock('landscape');
  }).catch(() => {});
}

function fit() {
  const vw = window.innerWidth, vh = window.innerHeight;
  G.blocked = coarse.matches && vh > vw;
  document.getElementById('rotate').classList.toggle('show', G.blocked);
  const scale = Math.min(vw / W, vh / H);
  canvas.style.width = Math.floor(W * scale) + 'px';
  canvas.style.height = Math.floor(H * scale) + 'px';
}

export function initInput() {
  canvas.addEventListener('pointerdown', onPointerDown);
  canvas.addEventListener('pointermove', onPointerMove);
  canvas.addEventListener('contextmenu', e => e.preventDefault());
  canvas.addEventListener('click', tryFullscreen);
  window.addEventListener('pointerup', releasePointer);
  window.addEventListener('pointercancel', releasePointer);

  window.addEventListener('keydown', e => {
    keys[e.code] = true;
    if (e.code.startsWith('Arrow')) e.preventDefault();
    if (e.code === 'Enter' && G.lock <= 0 && G.btns[0] && !e.repeat) G.btns[0].fn();
  });
  window.addEventListener('keyup', e => { keys[e.code] = false; });
  window.addEventListener('blur', () => {
    for (const k in keys) keys[k] = false;
    mouse.down = false;
  });

  window.addEventListener('resize', fit);
  window.addEventListener('orientationchange', fit);
  if (window.visualViewport) window.visualViewport.addEventListener('resize', fit);
  fit();
}
