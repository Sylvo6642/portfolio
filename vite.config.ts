import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/projects/Clausify': 'http://localhost:5174',
      '/projects/SpendWise': 'http://localhost:5175',
      '/projects/SkillDash': 'http://localhost:5176',
    },
  },
});
