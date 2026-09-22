/**
 * API Client URL Helper
 * Resolves API endpoints against optional VITE_API_BASE_URL (for split frontend/backend architectures like Vercel + Render)
 * or falls back to relative paths for same-origin serverless / container setups.
 */

export const API_BASE_URL = ((import.meta as any).env?.VITE_API_BASE_URL || '').replace(/\/$/, '');

export function apiUrl(path: string): string {
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${cleanPath}`;
}

export function resolveImageUrl(url?: string): string {
  if (!url) return apiUrl('/images/bikes/cube_stereo_hybrid.jpg');
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return apiUrl(url);
}
