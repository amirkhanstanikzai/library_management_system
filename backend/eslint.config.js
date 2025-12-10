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
  // 2️⃣ Add this section for Jest tests
  // -----------------------------
  {
    files: ['**/*.test.js'],
    languageOptions: {
      globals: {
        test: 'readonly',
        expect: 'readonly',
        describe: 'readonly',
      },
    },
  },
]);
