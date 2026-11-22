# Scholarship Hunting

A small pixel-art browser game of political satire. Play as the entirely fictional
Hon. Minister Fundsworth of Greater Pocketpur: shoot zombie students, collect the scholarship
money, and build a Multipurpose Community Hall that turns out to be a private residence.

Works on desktop and on phones in landscape. Any resemblance to a real politician is purely coincidental.

## Controls

| | Move | Shoot |
|---|---|---|
| **Desktop** | WASD or arrow keys | Aim with the mouse, hold to fire |
| **Phone** | Left thumb joystick | Automatic |

## Getting started

Needs [Node.js](https://nodejs.org/) 20.19 or newer.

```
npm install
npm run dev
```

Then open the link it prints.

| Command | What it does |
|---|---|
| `npm run dev` | Runs the game locally and reloads when you save |
| `npm run build` | Creates the production site in `dist/` |
| `npm run preview` | Runs the production build locally |
| `npm run lint` | Checks the code with ESLint |
| `npm test` | Plays through the game in a headless browser |
| `npm run test:balance` | Simulates full games to check how long a round takes |

The tests use Microsoft Edge by default. To use another installed browser, set
`BROWSER_CHANNEL`, for example to `chrome`.

## Publishing

Run `npm run build` and host the contents of `dist/` on any static host. Paths are relative,
so it works from a subfolder too.

## Project layout

```
index.html          the page and canvas
src/
  main.js           startup and game loop
  config.js         crowd size, power-ups and timings: start here to rebalance
  lines.js          the politician's lectures and the students' lines
  state.js          shared game state
  speech.js         picks what the politician says next
  input.js          touch, mouse, keyboard, screen fitting
  canvas.js         low-level pixel drawing
  font.js           pixel font
  sprites.js        character and item art
  backgrounds.js    battlefield, building site and hall art
  effects.js        floating text and dust
  ui.js             buttons and speech bubbles
  utils.js          small maths helpers
  styles.css        page styles
  scenes/
    flow.js         moves between scenes
    title.js        title screen
    battle.js       the battlefield
    build.js        the construction scene
    ending.js       the ending
    site.js         drawing shared by construction and ending
tests/
  playthrough.mjs   end-to-end checks
  balance.mjs       round-length simulator
```
