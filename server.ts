/**
 * VeloFind Full-Stack Server
 * Express 4 API Backend + Vite Single Page Application Middleware
 * Fully routed through PostgreSQL 17 + PostGIS via Kysely Repositories
 * Server-Side Dynamic SEO Meta Injection for Googlebot, Crawlers & Social Scrapers
 */

import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { closePool } from './src/server/db/pool.ts';
import { createApp } from './src/server/app.ts';
import { resolveSeoMetadataForRequest, injectSeoIntoHtml } from './src/server/seo-ssr-injector.ts';

async function startServer() {
  const app = await createApp();
  const PORT = 3000;

  // Helper to serve SEO-injected HTML
  const serveInjectedHtml = async (req: Request, res: Response, rawHtml: string) => {
    try {
      const host = req.get('host') || 'velofind.de';
      const protocol = req.protocol === 'https' || req.get('x-forwarded-proto') === 'https' ? 'https' : 'http';
      const domain = `${protocol}://${host}`;
      const urlObj = new URL(req.originalUrl || req.url, domain);
      const metadata = resolveSeoMetadataForRequest(urlObj.pathname, urlObj.searchParams, domain);
      const injectedHtml = injectSeoIntoHtml(rawHtml, metadata);
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.send(injectedHtml);
    } catch (err) {
      console.error('[SEO-SSR] Injection error:', err);
      res.send(rawHtml);
    }
  };

  // --- VITE MIDDLEWARE (DEV) OR STATIC ASSETS (PROD) ---
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'custom'
    });
    app.use(vite.middlewares);

    // Custom HTML handler with SSR metadata injection
    app.get('*', async (req: Request, res: Response, next: NextFunction) => {
      // Skip API, sitemap, robots, or static assets with file extensions
      if (req.path.startsWith('/api') || req.path === '/sitemap.xml' || req.path === '/robots.txt' || (req.path.includes('.') && !req.path.endsWith('.html'))) {
        return next();
      }
      try {
        const rawTemplate = fs.readFileSync(path.join(process.cwd(), 'index.html'), 'utf-8');
        const transformedHtml = await vite.transformIndexHtml(req.originalUrl, rawTemplate);
        await serveInjectedHtml(req, res, transformedHtml);
      } catch (e: any) {
        vite.ssrFixStacktrace(e);
        next(e);
      }
    });
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath, { index: false }));
    app.get('*', async (req: Request, res: Response, next: NextFunction) => {
      if (req.path.startsWith('/api') || req.path === '/sitemap.xml' || req.path === '/robots.txt' || (req.path.includes('.') && !req.path.endsWith('.html'))) {
        return next();
      }
      try {
        const rawTemplate = fs.readFileSync(path.join(distPath, 'index.html'), 'utf-8');
        await serveInjectedHtml(req, res, rawTemplate);
      } catch (e) {
        res.sendFile(path.join(distPath, 'index.html'));
      }
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
