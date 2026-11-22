import js from '@eslint/js';
import globals from 'globals';

export default [
  { ignores: ['dist/'] },
  js.configs.recommended,
  {
    files: ['src/**/*.js'],
    languageOptions: { globals: globals.browser },
  },
  {
    files: ['tests/**/*.mjs', '*.config.js'],
    languageOptions: { globals: globals.node },
  },
  {
    // Test callbacks run inside the page, where the game's internals are on window.
    files: ['tests/**/*.mjs'],
    rules: { 'no-undef': 'off' },
  },
];
