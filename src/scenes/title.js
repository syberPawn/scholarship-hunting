import { CONFIG, W, H } from '../config.js';
import { g, rect } from '../canvas.js';
import { world } from '../backgrounds.js';
import { txt } from '../font.js';
import { PAL, banknote, polStand, put, zombieA, zombieB } from '../sprites.js';
import { G } from '../state.js';
import { button } from '../ui.js';
import { startLevel } from './flow.js';

export function renderTitle() {
  g.drawImage(world, -160, -90);
  rect(0, 0, W, H, 'rgba(15,14,20,.55)');
  txt('SCHOLARSHIP HUNTING', W / 2, 7, '#f2c744', { s: 2, align: 'c', ol: PAL.k });
  txt('A TOTALLY LEGITIMATE DEVELOPMENT PROJECT', W / 2, 26, '#dcd7c4', { align: 'c', ol: PAL.k });
  txt('HON. MINISTER FUNDSWORTH OF GREATER POCKETPUR', W / 2, 37, '#a9a492', { align: 'c', ol: PAL.k });

  const bob = Math.round(Math.sin(G.time * 3) * 2);
  const step = Math.floor(G.time * 4) % 2;
  put(polStand, W / 2 - 24, 48 + bob, false, false, 3);
  put(step ? zombieA : zombieB, 40, 62, false, false, 3);
  put(step ? zombieB : zombieA, 232, 62, true, false, 3);
  const noteY = 60 + Math.round(Math.sin(G.time * 4 + 1) * 2);
  put(banknote, 100, noteY, false, false, 2);
  put(banknote, 198, noteY, false, false, 2);

  Object.entries(CONFIG.levels).forEach(([key, l], i) => {
    button(42 + i * 80, 114, 76, 26, l.label, () => startLevel(key), l.color);
  });

  const hint = G.touchMode ? 'LEFT THUMB MOVES. HE SHOOTS BY HIMSELF.' : 'WASD TO MOVE. HOLD MOUSE TO SHOOT.';
  txt(hint, W / 2, 146, '#ffffff', { align: 'c', ol: PAL.k });
  txt('A WORK OF FICTION. ANY RESEMBLANCE TO ANY REAL', W / 2, 160, '#8f8d80', { align: 'c', ol: PAL.k });
  txt('POLITICIAN IS PURELY COINCIDENTAL.', W / 2, 170, '#8f8d80', { align: 'c', ol: PAL.k });
}
