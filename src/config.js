// Tuning: change these to rebalance the game.

export const W = 320;
export const H = 180;
export const WORLD_W = 640;
export const WORLD_H = 360;

export const CONFIG = {
  phases: [
    { builtTo: 1.00 },
  ],
  noteValue: 500,
  killsPerScholarship: 2,
  biteCooldown: 0.25,
  playerSpeed: 84,
  fireDelay: 0.2,
  narrativeFireDelay: 0.07,
  powerups: {
    narrative: { label: 'NARRATIVE++', seconds: 5, firstAt: 6, respawn: [10, 16] },
    media: { label: 'MEDIA++', seconds: 15, firstAt: 12, respawn: [14, 22] },
  },
  bulletSpeed: 270,
  autoAimRange: 100,
  buildSeconds: 30,
  // In every level students thin out as the funds fill, but never stop, so the
  // target can always be reached. delay and crowd go from [empty funds, full funds].
  levels: {
    easy:   { label: 'EASY',   color: '#d9b144', notes: 40, hp: 3, speed: 40, delay: [0.32, 1.1], crowd: [26, 6],  biteLoss: 100 },
    medium: { label: 'MEDIUM', color: '#e08a3c', notes: 50, hp: 4, speed: 46, delay: [0.26, 0.85], crowd: [32, 10], biteLoss: 150 },
    hard:   { label: 'HARD',   color: '#d9604a', notes: 60, hp: 4, speed: 50, delay: [0.24, 0.8], crowd: [34, 8], biteLoss: 150 },
  },
  rareGroanChance: 0.05,
};
