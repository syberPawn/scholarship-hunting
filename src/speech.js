import { POLITICIAN_LESSONS } from './lines.js';
import { shuffle } from './utils.js';

export const speech = { line: '', t: 0, bag: [] };

export function nextPoliticianLine() {
  if (!speech.bag.length) speech.bag = shuffle(POLITICIAN_LESSONS).flat();
  return speech.bag.shift();
}

export function updateSpeech(dt) {
  speech.t -= dt;
  if (speech.t <= 0) {
    speech.line = nextPoliticianLine();
    speech.t = 3.2;
  }
}
