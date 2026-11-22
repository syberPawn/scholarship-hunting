import { W, H } from '../config.js';
import { g, rect } from '../canvas.js';
import { world } from '../backgrounds.js';
import { txt } from '../font.js';
import { PAL, banknote, polStand, put, zombieA, zombieB } from '../sprites.js';
import { G } from '../state.js';
import { button } from '../ui.js';
import { newGame } from './flow.js';

export function renderTitle() {
  g.drawImage(world, -160, -90);
  rect(0, 0, W, H, 'rgba(15,14,20,.55)');
  txt('SCHOLARSHIP HUNTING', W / 2, 16, '#f2c744', { s: 2, align: 'c', ol: PAL.k });

  const bob = Math.round(Math.sin(G.time * 3) * 2);
  const step = Math.floor(G.time * 4) % 2;
  put(polStand, W / 2 - 24, 48 + bob, false, false, 3);
  put(step ? zombieA : zombieB, 40, 62, false, false, 3);
  put(step ? zombieB : zombieA, 232, 62, true, false, 3);
  const noteY = 60 + Math.round(Math.sin(G.time * 4 + 1) * 2);
  put(banknote, 100, noteY, false, false, 2);
  put(banknote, 198, noteY, false, false, 2);

  button(112, 114, 96, 26, 'PLAY', newGame, '#d9b144');

  const hint = G.touchMode ? 'DRAG TO MOVE' : 'WASD MOVE  MOUSE SHOOT';
  txt(hint, W / 2, 146, '#ffffff', { align: 'c', ol: PAL.k });
  txt('A WORK OF FICTION', W / 2, 168, '#8f8d80', { align: 'c', ol: PAL.k });
}
