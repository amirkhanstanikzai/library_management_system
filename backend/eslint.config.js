import js from '@eslint/js';
import globals from 'globals';
import { defineConfig } from 'eslint/config';

export default defineConfig([
  // -----------------------------
  // 1️⃣ Main ESLint config (your existing)
  // -----------------------------
  {
    files: ['**/*.{js,mjs,cjs}'],
    plugins: { js },
    extends: ['js/recommended'],
    languageOptions: {
      globals: globals.node,
    },
  },

  // -----------------------------
  // 2️⃣ Jest test files
  // -----------------------------
  {
    files: ['**/*.test.js'],
    languageOptions: {
      globals: {
        ...globals.node, // keep Node globals
        ...globals.jest, // add all Jest globals
      },
    },
  },
]);
