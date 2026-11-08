import { CONFIG, W, H, WORLD_W, WORLD_H } from '../config.js';
import { g, pxLine, pxRing, rect } from '../canvas.js';
import { world } from '../backgrounds.js';
import { drawEffects, popup, puff } from '../effects.js';
import { textWidth, txt } from '../font.js';
import { keys, mouse, stick } from '../input.js';
import { GROANS, RARE_GROAN } from '../lines.js';
import {
  PAL, POWER_LOOK, banknote, polStand, polWalkA, polWalkB, put, zombieA, zombieB, zombieDead,
} from '../sprites.js';
import {
  G, P, cam, crowdCap, isFull, lastPhase, power, powerOn, progress, spawnGap, target,
} from '../state.js';
import { button } from '../ui.js';
import { clamp, pick, rand } from '../utils.js';
import { spawnZombie, startBuild } from './flow.js';

function nearestZombie() {
  let best = null, bestD = CONFIG.autoAimRange;
  for (const z of G.zombies) {
    // Only target what the player can see, or the money lands off-screen.
    if (z.x < cam.x + 4 || z.x > cam.x + W - 4 || z.y - 8 < cam.y + 14 || z.y > cam.y + H) continue;
    const d = Math.hypot(z.x - P.x, z.y - P.y);
    if (d < bestD) { best = z; bestD = d; }
  }
  return best;
}

function placePack(state) {
  for (let i = 0; i < 20; i++) {
    const x = cam.x + rand(30, W - 30), y = cam.y + rand(44, H - 14);
    if (Math.hypot(x - P.x, y - P.y) > 60) {
      state.pack = { x, y, seed: rand(0, 6) };
      return;
    }
  }
}

function updatePowerups(dt) {
  for (const [k, cfg] of Object.entries(CONFIG.powerups)) {
    const p = power[k];
    p.active = Math.max(0, p.active - dt);
    if (p.pack) {
      if (p.pack.x < cam.x || p.pack.x > cam.x + W || p.pack.y < cam.y + 14 || p.pack.y > cam.y + H) {
        // Left behind off-screen: bring a new one rather than leaving the player without any.
        p.pack = null;
        p.timer = rand(2, 4);
      } else if (Math.hypot(P.x - p.pack.x, P.y - 8 - p.pack.y) < 20) {
        p.pack = null;
        p.active = cfg.seconds;
        p.timer = rand(...cfg.respawn);
        popup(P.x, P.y - 28, cfg.label, POWER_LOOK[k].col, 1);
      }
    } else if (p.active <= 0) {
      p.timer -= dt;
      if (p.timer <= 0) placePack(p);
    }
  }
}

function updateCamera() {
  cam.x = Math.round(clamp(P.x - W / 2, 0, WORLD_W - W));
  cam.y = Math.round(clamp(P.y - H / 2 - 10, 0, WORLD_H - H));
}

function updatePlayer(dt) {
  let dx = 0, dy = 0;
  if (keys.ArrowLeft || keys.KeyA) dx -= 1;
  if (keys.ArrowRight || keys.KeyD) dx += 1;
  if (keys.ArrowUp || keys.KeyW) dy -= 1;
  if (keys.ArrowDown || keys.KeyS) dy += 1;
  if (stick.id !== null) { dx = stick.dx; dy = stick.dy; }
  const len = Math.hypot(dx, dy);
  if (len > 1) { dx /= len; dy /= len; }
  P.moving = len > 0.08;
  if (P.moving) {
    P.x = clamp(P.x + dx * CONFIG.playerSpeed * dt, 10, WORLD_W - 10);
    P.y = clamp(P.y + dy * CONFIG.playerSpeed * dt, 26, WORLD_H - 6);
    P.walkT += dt;
  }
  updateCamera();

  let firing = false;
  if (G.touchMode) {
    const z = nearestZombie();
    if (z) {
      P.aim = Math.atan2(z.y - 8 - (P.y - 10), z.x - P.x);
      firing = true;
    } else if (P.moving) {
      P.aim = Math.atan2(dy, dx);
    }
  } else {
    P.aim = Math.atan2(mouse.y + cam.y - (P.y - 10), mouse.x + cam.x - P.x);
    firing = mouse.down;
  }
  P.cd -= dt;
  P.flash -= dt;
  if (firing && P.cd <= 0) {
    P.cd = powerOn('narrative') ? CONFIG.narrativeFireDelay : CONFIG.fireDelay;
    P.flash = 0.05;
    const c = Math.cos(P.aim), s = Math.sin(P.aim);
    G.bullets.push({
      x: P.x + c * 14, y: P.y - 11 + s * 12,
      vx: c * CONFIG.bulletSpeed, vy: s * CONFIG.bulletSpeed, t: 0,
    });
  }
}

// Zombies bite away his funds, but he himself can never lose.
function updateZombies(dt) {
  G.immunityT -= dt;
  G.biteT -= dt;
  P.hurt -= dt;
  for (const z of G.zombies) {
    const a = Math.atan2(P.y - z.y, P.x - z.x);
    z.stun -= dt;
    z.hitT -= dt;
    z.walkT += dt;
    z.flip = P.x < z.x;
    if (z.stun <= 0) {
      z.x += Math.cos(a) * z.sp * dt;
      z.y += Math.sin(a) * z.sp * dt;
    }
    z.x += z.kx * dt;
    z.y += z.ky * dt;
    const damp = Math.pow(0.0015, dt);
    z.kx *= damp;
    z.ky *= damp;
    if (Math.hypot(P.x - z.x, P.y - z.y) < 13) {
      z.kx = -Math.cos(a) * 200;
      z.ky = -Math.sin(a) * 200;
      z.stun = 0.4;
      if (powerOn('media')) {
        if (G.immunityT <= 0) {
          popup(P.x, P.y - 28, CONFIG.powerups.media.label, PAL.U, 0.8);
          G.immunityT = 0.9;
        }
      } else if (G.biteT <= 0 && G.money > 0) {
        G.money = Math.max(0, G.money - G.level.biteLoss);
        G.biteT = CONFIG.biteCooldown;
        P.hurt = 0.12;
        popup(P.x, P.y - 28, '-₹' + G.level.biteLoss, '#ff6a5a', 0.7);
      }
    }
  }

  // Keep them from stacking on the same spot.
  const list = G.zombies;
  for (let i = 0; i < list.length; i++) for (let j = i + 1; j < list.length; j++) {
    const a = list[i], b = list[j];
    const ddx = a.x - b.x, ddy = a.y - b.y, d = Math.hypot(ddx, ddy);
    if (d > 0.01 && d < 12) {
      const push = (12 - d) * 0.5 * Math.min(1, dt * 12);
      a.x += ddx / d * push;
      a.y += ddy / d * push;
      b.x -= ddx / d * push;
      b.y -= ddy / d * push;
    }
  }
}

function updateGroans(dt) {
  G.groanT -= dt;
  if (G.groanT > 0) return;
  const onScreen = G.zombies.filter(z => z.x > cam.x + 8 && z.x < cam.x + W - 8 && z.y > cam.y + 30 && z.y < cam.y + H);
  if (onScreen.length) {
    const z = pick(onScreen);
    popup(z.x, z.y - 26, Math.random() < CONFIG.rareGroanChance ? RARE_GROAN : pick(GROANS), '#b9cf8f', 1.4);
  }
  G.groanT = rand(1.2, 3);
}

function updateBullets(dt) {
  G.bullets = G.bullets.filter(b => {
    b.t += dt;
    b.x += b.vx * dt;
    b.y += b.vy * dt;
    if (b.t > 0.9) return false;
    for (const z of G.zombies) {
      if (z.hp > 0 && Math.hypot(b.x - z.x, b.y - (z.y - 8)) < 10) {
        z.hp--;
        z.hitT = 0.09;
        z.kx += b.vx * 0.07; // keep small, or zombies can never reach him
        z.ky += b.vy * 0.07;
        puff(b.x, b.y, '#dcd7c4', 2);
        return false;
      }
    }
    return true;
  });
}

function collectDead() {
  G.zombies = G.zombies.filter(z => {
    if (z.hp > 0) return true;
    G.kills++;
    G.bodies.push({
      x: z.x, y: z.y, flip: z.flip, taken: false, fade: 0, age: 0, seed: rand(0, 6),
      hasMoney: G.kills % CONFIG.killsPerScholarship === 0,
    });
    puff(z.x, z.y - 8, '#b9cf8f', 6);
    return false;
  });
  if (G.bodies.length > 70) G.bodies.splice(0, G.bodies.length - 70);
}

function updatePickups(dt) {
  G.bodies = G.bodies.filter(b => {
    if (b.taken) {
      b.fade += dt;
      return b.fade < 0.5;
    }
    if (!b.hasMoney) { // no scholarship on this one, so it clears away by itself
      b.age += dt;
      if (b.age > 3) b.taken = true;
      return true;
    }
    if (!isFull() && Math.hypot(P.x - b.x, P.y - 8 - (b.y - 8)) < 20) {
      b.taken = true;
      G.money = Math.min(target(), G.money + CONFIG.noteValue);
      G.peak = Math.max(G.peak, G.money);
      popup(b.x, b.y - 22, '+₹' + CONFIG.noteValue, '#55d66a', 0.7);
    }
    return true;
  });
}

export function updateBattle(dt) {
  updatePlayer(dt);
  updatePowerups(dt);

  G.spawnT -= dt;
  if (G.spawnT <= 0 && G.zombies.length < crowdCap(progress())) {
    spawnZombie();
    G.spawnT = spawnGap(progress());
  }

  updateZombies(dt);
  updateGroans(dt);
  updateBullets(dt);
  collectDead();
  updatePickups(dt);
}

function drawZombie(z) {
  const fr = Math.floor(z.walkT * 5) % 2 ? zombieA : zombieB;
  put(fr, z.x - 8 - cam.x, z.y - 16 - cam.y, z.flip, z.hitT > 0);
}

function drawPlayer() {
  const x = Math.round(P.x - cam.x), y = Math.round(P.y - cam.y);
  const fr = P.moving ? (Math.floor(P.walkT * 9) % 2 ? polWalkA : polWalkB) : polStand;
  put(fr, x - 8, y - 20, false, P.hurt > 0);
  const shield = power.media.active;
  if (shield > 0 && (shield > 2 || Math.floor(G.time * 8) % 2)) {
    pxRing(x, y - 10, 15, PAL.U);
    pxRing(x, y - 10, 16, PAL.U);
  }
  const c = Math.cos(P.aim), s = Math.sin(P.aim);
  const hx = x + c * 5, hy = y - 11 + s * 3;
  pxLine(hx, hy, hx + c * 8, hy + s * 8, PAL.k, 2);
  rect(hx, hy, 2, 2, PAL.s);
  rect(hx - c * 2, hy - s * 2, 2, 2, PAL.y);
  if (P.flash > 0) rect(hx + c * 10 - 1, hy + s * 10 - 1, 4, 4, '#ffe27a');
}

function drawField() {
  g.drawImage(world, -cam.x, -cam.y);
  for (const b of G.bodies) {
    if (b.taken && Math.floor(b.fade * 20) % 2) continue;
    put(zombieDead, b.x - 9 - cam.x, b.y - 7 - cam.y, b.flip);
  }
  const drawList = G.zombies.map(z => ({ y: z.y, d: () => drawZombie(z) }));
  drawList.push({ y: P.y, d: drawPlayer });
  drawList.sort((a, b) => a.y - b.y).forEach(e => e.d());
  for (const b of G.bodies) {
    if (b.taken || !b.hasMoney) continue;
    const bob = Math.round(Math.sin(G.time * 4 + b.seed) * 2);
    const x = b.x - 5 - cam.x, y = b.y - 22 + bob - cam.y;
    rect(x - 1, y - 1, 13, 9, 'rgba(120,255,140,.28)');
    put(banknote, x, y);
  }
  for (const [k, cfg] of Object.entries(CONFIG.powerups)) {
    const p = power[k].pack, look = POWER_LOOK[k];
    if (!p) continue;
    const bob = Math.round(Math.sin(G.time * 5 + p.seed) * 2);
    const x = p.x - cam.x, y = p.y - cam.y + bob;
    rect(x - 8, y - 5, 17, 13, look.glow);
    put(look.sprite, x - 6, y - 4);
    txt(cfg.label, clamp(x, 34, W - 34), y - 14, look.col, { align: 'c', ol: PAL.k });
  }
  const bulletCol = powerOn('narrative') ? PAL.A : '#ffe27a';
  for (const b of G.bullets) rect(b.x - 1 - cam.x, b.y - 1 - cam.y, 3, 3, bulletCol);
  drawEffects();
}

function drawHud() {
  rect(0, 0, W, 14, 'rgba(15,14,20,.82)');
  if (lastPhase() > 0) txt(`PHASE ${G.phase + 1}/${lastPhase() + 1}`, 4, 3, '#d9d6c8');
  txt(G.level.label, 4, 3, G.level.color);
  const barX = 84, barW = 152, frac = G.money / target();
  rect(barX - 1, 1, barW + 2, 11, PAL.k);
  rect(barX, 2, barW, 9, '#2f2c38');
  rect(barX, 2, Math.round(barW * frac), 9, isFull() && Math.floor(G.time * 6) % 2 ? '#bff2b0' : '#2f9a44');
  txt(`₹${G.money} / ₹${target()}`, W / 2, 3, '#ffffff', { align: 'c', ol: PAL.k });
  txt(`HALL ${Math.round(G.hallP * 100)}%`, W - 4, 3, '#d9d6c8', { align: 'r' });
  if (isFull()) button(92, 18, 136, 22, 'DEVELOP YOUR TOWN', startBuild, Math.floor(G.time * 4) % 2 ? '#f2c744' : '#d9b144');

  // Progress to the next scholarship
  txt('NEXT ₹', 4, 17, PAL.M, { ol: PAL.k });
  const needed = CONFIG.killsPerScholarship, got = G.kills % needed;
  for (let i = 0; i < needed; i++) {
    rect(43 + i * 7, 17, 5, 7, PAL.k);
    rect(44 + i * 7, 18, 3, 5, i < got ? PAL.M : '#2f2c38');
  }

  // Power-up timers
  let timerY = 17;
  for (const [k, cfg] of Object.entries(CONFIG.powerups)) {
    if (!powerOn(k)) continue;
    const w = textWidth(cfg.label), col = POWER_LOOK[k].col;
    txt(cfg.label, W - 4, timerY, col, { align: 'r', ol: PAL.k });
    rect(W - 4 - w, timerY + 9, w, 3, PAL.k);
    rect(W - 4 - w, timerY + 9, Math.ceil(w * power[k].active / cfg.seconds), 3, col);
    timerY += 16;
  }
}

function drawJoystick() {
  if (!G.touchMode) return;
  if (stick.id !== null) {
    g.globalAlpha = 0.6;
    pxRing(stick.cx, stick.cy, stick.radius, '#ffffff');
    rect(stick.cx + stick.dx * stick.radius - 5, stick.cy + stick.dy * stick.radius - 5, 10, 10, '#ffffff');
    g.globalAlpha = 1;
  } else if (G.phase === 0 && G.kills < 15) {
    g.globalAlpha = 0.45;
    pxRing(46, 134, 22, '#ffffff');
    g.globalAlpha = 1;
    txt('MOVE', 46, 131, '#ffffff', { align: 'c', ol: PAL.k });
  }
}

export function renderBattle() {
  drawField();
  drawHud();
  drawJoystick();
}
