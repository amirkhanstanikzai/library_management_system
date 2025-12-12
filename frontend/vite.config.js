import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true, // no need to import describe/test/expect
    environment: 'jsdom', // simulates browser DOM
    include: ['tests/**/*.test.jsx', 'src/**/*.test.jsx'], // find test files
    setupFiles: './tests/setupTests.js', // optional: setup file for globals
    threads: false, // run in single thread to save memory
  },
});
