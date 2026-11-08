// Fast-forwards the real game logic on every level with two simulated players:
// "sharp" always heads for the nearest money, "casual" re-decides once a second and dawdles.

import { openGame, startGame } from './helpers.mjs';

const { server, browser, url } = await startGame();

try {
  const page = await (await browser.newContext({ viewport: { width: 844, height: 390 }, hasTouch: true, isMobile: true })).newPage();
  await openGame(page, url);

  const rows = await page.evaluate(() => {
    const dt = 1 / 60, rows = [];
    G.touchMode = true;
    for (const key of Object.keys(CONFIG.levels)) for (const mode of ['sharp', 'casual']) for (let run = 0; run < 12; run++) {
      G.level = CONFIG.levels[key];
      G.phase = 0;
      startBattle();
      P.x = 320;
      P.y = 190;
      stick.id = 1;
      let t = 0, bitten = 0, last = G.money, think = 0, dx = 0, dy = 0;
      while (!isFull() && t < 900) {
        think -= dt;
        if (mode === 'sharp' || think <= 0) {
          think = 1;
          const targets = G.bodies.filter(b => !b.taken && b.hasMoney).map(b => ({ x: b.x, y: b.y }));
          for (const k in power) if (power[k].pack) targets.push({ x: power[k].pack.x, y: power[k].pack.y + 8 });
          let best = null, d = 1e9;
          for (const o of targets) {
            const q = Math.hypot(o.x - P.x, o.y - P.y);
            if (q < d) { d = q; best = o; }
          }
          const idle = mode === 'casual' && Math.random() < 0.25;
          dx = best && !idle ? (best.x - P.x) / (d || 1) : 0;
          dy = best && !idle ? (best.y - P.y) / (d || 1) : 0;
          if (mode === 'casual') { dx *= 0.8; dy *= 0.8; }
        }
        stick.dx = dx;
        stick.dy = dy;
        updateBattle(dt);
        updateEffects(dt);
        if (G.money < last) bitten += last - G.money;
        last = G.money;
        t += dt;
      }
      rows.push({ key, mode, t, bitten, full: isFull(), kills: G.kills, target: target() });
    }
    stick.id = null;
    return rows;
  });

  for (const key of ['easy', 'medium', 'hard']) for (const mode of ['sharp', 'casual']) {
    const r = rows.filter(x => x.key === key && x.mode === mode);
    const ts = r.map(x => x.t).sort((a, b) => a - b);
    const avg = f => Math.round(r.reduce((s, x) => s + f(x), 0) / r.length);
    console.log(`${key.padEnd(6)} ${mode.padEnd(6)} filled ${r.filter(x => x.full).length}/${r.length}, target Rs${r[0].target}, ${ts[0].toFixed(0)}-${ts[r.length - 1].toFixed(0)}s (median ${ts[6].toFixed(0)}s), avg bitten Rs${avg(x => x.bitten)}, avg kills ${avg(x => x.kills)}`);
  }
} finally {
  await browser.close();
  await server.close();
}
