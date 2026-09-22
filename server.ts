/**
 * VeloFind Full-Stack Server
 * Express 4 API Backend + Vite Single Page Application Middleware
 * Fully routed through PostgreSQL 17 + PostGIS via Kysely Repositories
 */

import express, { Request, Response } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { closePool } from './src/server/db/pool.ts';
import { createApp } from './src/server/app.ts';

async function startServer() {
  const app = await createApp();
  const PORT = 3000;

  // --- VITE MIDDLEWARE (DEV) OR STATIC ASSETS (PROD) ---
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`[VeloFind] Core Platform Server listening on http://0.0.0.0:${PORT}`);
  });

  const gracefulShutdown = async (signal: string) => {
    console.log(`[VeloFind] Received ${signal}. Closing server and PostgreSQL pool...`);
    server.close(async () => {
      await closePool();
      console.log('[VeloFind] Shutdown complete.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
}

startServer().catch((err) => {
  console.error('[VeloFind] Startup fatal error:', err);
  process.exit(1);
});
