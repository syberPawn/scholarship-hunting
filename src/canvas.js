// The screen canvas and low-level pixel drawing.

export const canvas = document.getElementById('game');
const screenCtx = canvas.getContext('2d');
screenCtx.imageSmoothingEnabled = false;

// The context everything currently draws to. Other modules read this live value.
export let g = screenCtx;

export const mkCanvas = (w, h) => {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return c;
};

/** Runs fn with drawing redirected to another context, for pre-drawn art. */
export function drawOn(ctx, fn) {
  const prev = g;
  g = ctx;
  fn();
  g = prev;
}

export function rect(x, y, w, h, col) {
  g.fillStyle = col;
  g.fillRect(Math.round(x), Math.round(y), w, h);
}

export function pxLine(x0, y0, x1, y1, col, size = 1) {
  g.fillStyle = col;
  const n = Math.max(1, Math.ceil(Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0))));
  for (let i = 0; i <= n; i++) {
    g.fillRect(Math.round(x0 + (x1 - x0) * i / n), Math.round(y0 + (y1 - y0) * i / n), size, size);
  }
}

export function pxRing(cx, cy, r, col) {
  g.fillStyle = col;
  const steps = Math.ceil(r * 6);
  for (let i = 0; i < steps; i++) {
    const a = i / steps * Math.PI * 2;
    g.fillRect(Math.round(cx + Math.cos(a) * r), Math.round(cy + Math.sin(a) * r), 1, 1);
  }
}
