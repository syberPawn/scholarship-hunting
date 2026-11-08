import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';
import { createServer } from 'vite';

export const ROOT = fileURLToPath(new URL('..', import.meta.url));

export async function startGame() {
  const server = await createServer({ root: ROOT, logLevel: 'silent' });
  await server.listen();
  const browser = await chromium.launch({ channel: process.env.BROWSER_CHANNEL ?? 'msedge', headless: true });
  return { server, browser, url: server.resolvedUrls.local[0] };
}

/** Opens the game and puts its internals on window, so tests can read them directly. */
export async function openGame(page, url) {
  await page.goto(url);
  await page.waitForFunction(() => window.__game);
  await page.evaluate(() => Object.assign(window, window.__game));
  await page.waitForTimeout(300);
}
