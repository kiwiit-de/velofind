/**
 * Vercel Serverless Function Entry Point for VeloFind API
 * Handles all requests directed to /api/* on Vercel
 */

import type { IncomingMessage, ServerResponse } from 'http';
import { createApp } from '../src/server/app.ts';

let appPromise: Promise<any> | null = null;

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  if (!appPromise) {
    appPromise = createApp();
  }
  const app = await appPromise;
  return app(req, res);
}
