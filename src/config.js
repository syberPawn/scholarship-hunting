// Tuning: change these to rebalance the game.

export const W = 320;
export const H = 180;
export const WORLD_W = 640;
export const WORLD_H = 360;

export const CONFIG = {
  notes: 40,
  noteValue: 500,
  killsPerScholarship: 2,
  playerSpeed: 84,
  fireDelay: 0.2,
  narrativeFireDelay: 0.07,
  powerups: {
    narrative: { label: 'NARRATIVE++', seconds: 5, firstAt: 6, respawn: [10, 16] },
  },
  shieldLabel: 'DEMOCRACY++',
  bulletSpeed: 270,
  autoAimRange: 100,
  buildSeconds: 30,
  // Students thin out as the funds fill, but never stop, so the target can
  // always be reached. delay and crowd go from [empty funds, full funds].
  zombieSpeed: 40,
  spawnDelay: [0.32, 1.1],
  crowd: [26, 6],
  rareGroanChance: 0.05,
};
