import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Relative base path ensures GitHub Pages deployment works in subfolders (/repo-name/)
  base: './',
  test: {
    globals: true,
    environment: 'node',
  },
});
