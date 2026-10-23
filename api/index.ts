/**
 * Vercel Serverless Function Entry Point for VeloFind API
 * Handles all requests directed to /api/* on Vercel
 */

import type { IncomingMessage, ServerResponse } from 'http';
import { createApp } from '../src/server/app.ts';

let appPromise: Promise<any> | null = null;

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  try {
    if (!appPromise) {
      appPromise = createApp();
    }
    const app = await appPromise;
    return app(req, res);
  } catch (err: any) {
    console.error('[Vercel Serverless Function Error]', err);
    const url = req.url || '';
    if (url.includes('/out/')) {
      res.statusCode = 302;
      res.setHeader('Location', 'https://boc24.de');
      res.end();
      return;
    }
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Serverless execution fallback', message: err?.message || 'Internal Error' }));
  }
}
