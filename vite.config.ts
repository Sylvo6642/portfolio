import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import type { Connect } from 'vite';
import fs from 'fs';
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'serve-concepts-static',
      configureServer(server) {
        server.middlewares.use((req: Connect.IncomingMessage, res, next) => {
          const url = req.url ?? '';
          if (url.startsWith('/concepts/')) {
            const filePath = path.resolve(__dirname, 'public', url.replace(/^\//, '').split('?')[0]);
            const indexPath = filePath.endsWith('.html') ? filePath : path.join(filePath, 'index.html');
            if (fs.existsSync(indexPath)) {
              res.setHeader('Content-Type', 'text/html');
              fs.createReadStream(indexPath).pipe(res);
              return;
            }
          }
          next();
        });
      },
    },
  ],
  server: {
    port: 5173,
    proxy: {
      '/projects/Clausify': 'http://localhost:5174',
      '/projects/SpendWise': 'http://localhost:5175',
      '/projects/SkillDash': 'http://localhost:5176',
    },
    // Note: /api/analyze is served by Vercel serverless in prod.
    // For local dev, run: vercel dev (instead of npm run dev)
  },
});
