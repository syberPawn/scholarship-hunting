// Plays through the game in a headless browser, on a phone-sized screen and on desktop.
// Screenshots of each scene are saved to tests/screenshots/.

import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT, openGame, startGame } from './helpers.mjs';

const SHOTS = join(ROOT, 'tests', 'screenshots');
mkdirSync(SHOTS, { recursive: true });
const out = n => join(SHOTS, n + '.png');

const results = [];
const check = (name, ok, extra = '') => results.push(`${ok ? 'PASS' : 'FAIL'}  ${name} ${extra}`);
const errors = [];

const ZOMBIE = `(over) => Object.assign({ x: P.x + 40, y: P.y, hp: 99999, sp: 30, kx: 0, ky: 0, stun: 0, hitT: 0, walkT: 0, flip: false }, over || {})`;

async function phone(browser, url) {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  page.on('pageerror', e => errors.push('pageerror: ' + e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
  await openGame(page, url);
  check('portrait shows rotate prompt', await page.evaluate(() => document.getElementById('rotate').classList.contains('show')));
  await page.setViewportSize({ width: 844, height: 390 });
  await page.waitForTimeout(400);
  check('landscape hides rotate prompt', await page.evaluate(() => !document.getElementById('rotate').classList.contains('show')));

  const client = (x, y) => page.evaluate(([x, y]) => {
    const r = canvas.getBoundingClientRect();
    return [r.left + x / 320 * r.width, r.top + y / 180 * r.height];
  }, [x, y]);
  const tapGame = async (x, y) => { const [a, b] = await client(x, y); await page.touchscreen.tap(a, b); };
  const setZombies = list => page.evaluate(([src, list]) => {
    const mk = eval(src);
    G.bullets = [];
    G.zombies = list.map(mk);
  }, [ZOMBIE, list]);

  await page.screenshot({ path: out('01-title') });
  await tapGame(80, 127);
  await page.waitForTimeout(200);
  check('EASY tap enters battle', await page.evaluate(() => G.scene === 'battle' && G.level === CONFIG.levels.easy && target() === 20000));
  check('game has 1 phase', (await page.evaluate(() => CONFIG.phases.length)) === 1);
  const curve = await page.evaluate(() => [0, 0.5, 1].map(p => ({ max: crowdCap(p), delay: spawnGap(p) })));
  check('students thin out but never stop', curve[0].max > curve[1].max && curve[1].max > curve[2].max && curve[2].max >= 1 && curve[0].delay < curve[2].delay, JSON.stringify(curve));
  const groanList = await page.evaluate(() => ({ list: GROANS, rare: RARE_GROAN }));
  check('student lines', groanList.list.join() === 'FEE DUES...,TUITION FEE...,SCHOLARSHIP...,PLEASE...' && groanList.rare === 'VASTAGUNA HUIYAAA....');
  const peakTest = await page.evaluate(() => {
    const m = G.money, p = G.peak;
    G.peak = target() / 2;
    G.money = 0;
    const r = progress();
    G.money = m;
    G.peak = p;
    return r;
  });
  check('bites do not bring crowds back', peakTest === 0.5, `progress=${peakTest}`);

  // Joystick
  const cdp = await ctx.newCDPSession(page);
  const [sx, sy] = await client(60, 130);
  const before = await page.evaluate(() => P.x);
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: sx, y: sy }] });
  await page.waitForTimeout(60);
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: sx + 45, y: sy }] });
  await page.waitForTimeout(700);
  const movedX = await page.evaluate(() => P.x);
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  check('joystick moves politician', movedX > before + 20);

  await page.waitForFunction(() => G.kills >= 3, null, { timeout: 30000 });
  check('auto-fire kills zombies', true);
  await page.screenshot({ path: out('02-battle') });

  // Every 2nd kill drops a scholarship.
  await page.evaluate(() => { G.kills = 0; G.bodies = []; G.spawnT = 99; });
  await setZombies([{ hp: 0 }]);
  await page.waitForTimeout(80);
  const one = await page.evaluate(() => ({ kills: G.kills, money: G.bodies.filter(b => b.hasMoney).length }));
  check('1 kill drops no scholarship', one.kills === 1 && one.money === 0, JSON.stringify(one));
  await setZombies([{ hp: 0 }]);
  await page.waitForTimeout(80);
  const two = await page.evaluate(() => ({ kills: G.kills, money: G.bodies.filter(b => b.hasMoney).length }));
  check('2nd kill drops one scholarship', two.kills === 2 && two.money === 1, JSON.stringify(two));

  // Pickup
  const m0 = await page.evaluate(() => G.money);
  await page.evaluate(() => { const b = G.bodies.find(b => !b.taken && b.hasMoney); P.x = b.x; P.y = b.y; });
  await page.waitForTimeout(150);
  const m1 = await page.evaluate(() => G.money);
  check('walking over money adds Rs500', m1 === m0 + 500, `${m0} -> ${m1}`);
  check('no develop button before full', (await page.evaluate(() => G.btns.length)) === 0);

  // Bites take funds.
  await page.evaluate(() => { G.spawnT = 99; resetPowers(); power.narrative.timer = 999; power.media.timer = 999; G.money = 1000; });
  await setZombies([{}]);
  await page.evaluate(() => { G.zombies[0].x = P.x + 18; G.zombies[0].y = P.y; });
  await page.waitForFunction(() => G.money < 1000, null, { timeout: 15000 });
  await page.screenshot({ path: out('03-bite') });
  check('zombie bite reduces funds', true, await page.evaluate(() => `money=${G.money}`));

  await page.evaluate(() => { G.money = 50; G.zombies[0].x = P.x + 12; G.zombies[0].y = P.y; G.biteT = 0; });
  await page.waitForFunction(() => G.money === 0, null, { timeout: 15000 });
  await page.waitForTimeout(1200);
  const floor = await page.evaluate(() => ({ money: G.money, scene: G.scene }));
  check('funds stop at 0 and he cannot lose', floor.money === 0 && floor.scene === 'battle', JSON.stringify(floor));

  // Media++ blocks bites for 15 seconds.
  await page.evaluate(() => { power.media.timer = 0.01; G.zombies = []; });
  await page.waitForFunction(() => power.media.pack !== null, null, { timeout: 3000 });
  await page.evaluate(() => { power.narrative.pack = { x: cam.x + 90, y: cam.y + 60, seed: 0 }; });
  await page.waitForTimeout(100);
  await page.screenshot({ path: out('04-power-ups') });
  await page.evaluate(() => { power.narrative.pack = null; G.money = 1000; const p = power.media.pack; p.x = P.x; p.y = P.y - 8; });
  await page.waitForFunction(() => powerOn('media'), null, { timeout: 2000 });
  const mediaStart = Date.now();
  await setZombies([{}]);
  await page.evaluate(() => { G.zombies[0].x = P.x + 18; G.zombies[0].y = P.y; });
  await page.waitForTimeout(3000);
  await page.screenshot({ path: out('05-media-active') });
  check('Media++ blocks bites', (await page.evaluate(() => G.money)) === 1000);
  await page.evaluate(() => { power.media.timer = 0; });
  await page.waitForTimeout(200);
  check('no second Media++ while active', await page.evaluate(() => power.media.pack === null));
  await page.evaluate(() => { power.media.timer = 999; });
  await page.waitForFunction(() => !powerOn('media'), null, { timeout: 18000 });
  const mediaSecs = (Date.now() - mediaStart) / 1000;
  check('Media++ lasts about 15 seconds', mediaSecs > 14 && mediaSecs < 16, `${mediaSecs.toFixed(1)}s`);
  await page.evaluate(() => { G.zombies[0].x = P.x + 12; G.zombies[0].y = P.y; G.biteT = 0; });
  await page.waitForFunction(() => G.money < 1000, null, { timeout: 15000 });
  check('bites resume after Media++', true);

  // Narrative++
  await page.evaluate(() => { power.narrative.timer = 999; G.money = 0; });
  const rate = async () => {
    await setZombies([{ sp: 0, stun: 99 }]);
    await page.waitForTimeout(1000);
    return page.evaluate(() => 99999 - G.zombies[0].hp);
  };
  const normal = await rate();
  await page.evaluate(() => { power.narrative.pack = { x: P.x, y: P.y - 8, seed: 0 }; });
  await page.waitForFunction(() => powerOn('narrative'), null, { timeout: 2000 });
  const narrativeStart = Date.now();
  const boosted = await rate();
  check('Narrative++ raises fire rate', boosted >= normal * 2, `normal=${normal} boosted=${boosted}`);
  await page.waitForFunction(() => !powerOn('narrative'), null, { timeout: 7000 });
  const narrativeSecs = (Date.now() - narrativeStart) / 1000;
  check('Narrative++ lasts about 5 seconds', narrativeSecs > 4.3 && narrativeSecs < 5.7, `${narrativeSecs.toFixed(1)}s`);

  // A full round through the real buttons.
  await page.waitForTimeout(400);
  await page.evaluate(() => { G.zombies = []; G.spawnT = 99; G.money = target(); });
  await page.waitForFunction(() => G.btns.length === 1, null, { timeout: 3000 });
  await page.screenshot({ path: out('06-develop-button') });
  check('full meter shows Develop button', true);
  await tapGame(160, 29);
  await page.waitForTimeout(200);
  check('Develop tap opens build scene', (await page.evaluate(() => G.scene)) === 'build');
  check('politician is speaking', await page.evaluate(() => !!speech.line));
  await page.screenshot({ path: out('07-lecture') });

  const order = await page.evaluate(() => {
    const firsts = new Set(), lasts = new Set(), saved = speech.bag;
    let inOrder = true;
    for (let i = 0; i < 300; i++) {
      speech.bag = [];
      const first = nextPoliticianLine();
      firsts.add(first);
      lasts.add(speech.bag[speech.bag.length - 1]);
      const all = [first, ...speech.bag].join('|') + '|';
      if (!all.includes('POLITICIANS ARE NOT CORRUPTED.....|THEY JUST DO CORRUPTION|SOMETIMES....|')) inOrder = false;
    }
    speech.bag = saved;
    return { firsts: firsts.size, lasts: lasts.size, inOrder, inPool: POLITICIAN_LESSONS.flat().includes('NEVER TRUST THE PEOPLE') };
  });
  check('no fixed opening or closing line', order.firsts >= 8 && order.lasts >= 8, JSON.stringify(order));
  check('multi-part jokes stay in order', order.inOrder && order.inPool);
  const lines = await page.evaluate(() => {
    const all = POLITICIAN_LESSONS.flat();
    const bad = all.filter(s => textWidth(s) + 8 > 316 || [...s].some(c => c !== ' ' && !FONT[c]) || s.includes('SCHOLARSHIP'));
    return { count: all.length, bad };
  });
  check('all lecture lines fit and use known letters', lines.bad.length === 0, JSON.stringify(lines));

  await page.waitForFunction(() => G.scene === 'build' && G.build.t > 16, null, { timeout: 30000 });
  await page.screenshot({ path: out('08-hall-mid') });
  check('no Funds Ran Out mid-build', await page.evaluate(() => !G.build.done && G.btns.length === 0));
  const buildStart = Date.now() - (await page.evaluate(() => G.build.t)) * 1000;
  await page.waitForFunction(() => G.scene === 'end', null, { timeout: 40000 });
  const buildSecs = (Date.now() - buildStart) / 1000;
  check('construction lasts about 30 seconds', buildSecs > 28 && buildSecs < 32, `${buildSecs.toFixed(1)}s`);
  check('one build goes straight to the ending', (await page.evaluate(() => G.hallP)) === 1);

  await page.waitForFunction(() => G.ending.t > 3.0);
  await page.screenshot({ path: out('09-sign-changed') });
  await page.waitForFunction(() => G.ending.t > 5.0);
  await page.screenshot({ path: out('10-walking-in') });
  await page.waitForFunction(() => G.ending.t > 7.9);
  await page.screenshot({ path: out('11-moved-in') });
  await page.waitForFunction(() => G.ending.t > 8.8 && G.btns.length === 2);
  await page.screenshot({ path: out('12-game-over') });
  await tapGame(112, 127);
  await page.waitForTimeout(200);
  const again = await page.evaluate(() => ({ scene: G.scene, phase: G.phase, hall: G.hallP, beers: G.beers, money: G.money, easy: G.level === CONFIG.levels.easy }));
  check('Play Again restarts on the same level', again.scene === 'battle' && again.phase === 0 && again.hall === 0 && again.beers === 0 && again.money === 0 && again.easy, JSON.stringify(again));

  // Change Level, then each level's settings.
  await page.evaluate(() => { G.ending = { t: 20, workers: [], sip: 0 }; G.scene = 'end'; G.lock = 0; });
  await page.waitForFunction(() => G.btns.length === 2, null, { timeout: 3000 });
  await tapGame(208, 127);
  await page.waitForTimeout(450);
  check('Change Level returns to title', (await page.evaluate(() => G.scene)) === 'title');
  await tapGame(240, 127);
  await page.waitForTimeout(450);
  const hard = await page.evaluate(() => ({ ok: G.level === CONFIG.levels.hard, target: target(), hp: G.zombies[0].hp }));
  check('HARD applies', hard.ok && hard.target === 30000 && hard.hp === 4, JSON.stringify(hard));
  await page.evaluate(() => { G.scene = 'title'; G.lock = 0; });
  await page.waitForFunction(() => G.btns.length === 3, null, { timeout: 3000 });
  await tapGame(160, 127);
  await page.waitForTimeout(450);
  const medium = await page.evaluate(() => ({ ok: G.level === CONFIG.levels.medium, target: target(), hp: G.zombies[0].hp }));
  check('MEDIUM applies', medium.ok && medium.target === 25000 && medium.hp === 4, JSON.stringify(medium));
  await ctx.close();
}

async function desktop(browser, url) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const page = await ctx.newPage();
  page.on('pageerror', e => errors.push('desktop pageerror: ' + e.message));
  await openGame(page, url);
  await page.mouse.click(320, 508);
  await page.waitForTimeout(450);
  check('desktop level button starts the game', (await page.evaluate(() => G.scene)) === 'battle');
  const x0 = await page.evaluate(() => P.x);
  await page.keyboard.down('KeyD');
  await page.waitForTimeout(500);
  await page.keyboard.up('KeyD');
  check('WASD moves', (await page.evaluate(() => P.x)) > x0 + 15);
  await page.mouse.move(1100, 200);
  await page.mouse.down();
  await page.waitForFunction(() => G.bullets.length > 0, null, { timeout: 3000 });
  check('mouse fires', true);
  await page.mouse.up();
  await ctx.close();
}

const { server, browser, url } = await startGame();
let crashed = false;
try {
  await phone(browser, url);
  await desktop(browser, url);
} catch (e) {
  crashed = true;
  console.error('TEST CRASH', e);
} finally {
  await browser.close();
  await server.close();
}

console.log(results.join('\n'));
console.log(errors.length ? 'ERRORS:\n' + errors.join('\n') : 'No page errors');
if (crashed || errors.length || results.some(r => r.startsWith('FAIL'))) process.exitCode = 1;
