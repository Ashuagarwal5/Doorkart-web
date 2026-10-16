import 'server-only';
import { cacheLife } from 'next/cache';
import { sampleCategories, sampleProducts } from './sample-catalog';
import type { Catalog, Category, Product, ProductPage, ShopInfo } from './types';

export const apiBase = () => process.env.DOORKART_API_URL?.replace(/\/$/, '') || '';
export function mediaUrl(value: string | null): string | null {
  if (!value) return null;
  try {
    const url = new URL(value, `${new URL(apiBase()).origin}/`);
    return ['https:', 'http:'].includes(url.protocol) ? url.href : null;
  } catch { return null; }
}
export class StoreError extends Error {
  constructor(message: string, public status = 502) { super(message); }
}
export async function backend<T>(path: string, init: RequestInit = {}): Promise<T> {
  if (!apiBase()) throw new StoreError('The store is not connected yet. Please check back soon.', 503);
  let response: Response;
  try {
    response = await fetch(`${apiBase()}${path}`, { ...init, cache: 'no-store', signal: AbortSignal.timeout(25000), redirect: 'error' });
  } catch { throw new StoreError('We couldn’t reach the store. Please try again.', 503); }
  let body: { success?: boolean; data?: T; error?: { message?: string } };
  try { body = await response.json(); } catch { throw new StoreError('The store returned an unreadable response.'); }
  if (!response.ok || body.success !== true || body.data === undefined) {
    throw new StoreError(body.error?.message || 'The store could not complete this request.', response.ok ? 502 : response.status);
  }
  return body.data;
}
export const normalizeProduct = (p: Product): Product => ({ ...p, images: p.images.map(i => ({ ...i, url: mediaUrl(i.url) || '/assets/product-placeholder.svg' })) });

export async function getCatalog(): Promise<Catalog> {
  'use cache';
  cacheLife({ stale: 30, revalidate: 60, expire: 300 });
  if (!apiBase()) return { categories: sampleCategories, products: sampleProducts, demo: true, error: null, shop: null };
  try {
    const [categories, page, shop] = await Promise.all([
      backend<Category[]>('/categories'), backend<ProductPage>('/products?limit=50&sort=newest'),
      backend<ShopInfo>('/shop').catch(() => null),
    ]);
    return { categories: categories.map(c => ({ ...c, imageUrl: mediaUrl(c.imageUrl) })), products: page.items.map(normalizeProduct), demo: false, error: null, shop };
  } catch (error) {
    return { categories: [], products: [], demo: false, error: error instanceof Error ? error.message : 'The store is temporarily unavailable.', shop: null };
  }
}

export async function getProduct(slug: string): Promise<{ product: Product | null; error: string | null; demo: boolean }> {
  'use cache';
  cacheLife({ stale: 30, revalidate: 60, expire: 300 });
  if (!apiBase()) return { product: sampleProducts.find(p => p.slug === slug) || null, error: null, demo: true };
  try { return { product: normalizeProduct(await backend<Product>(`/products/${encodeURIComponent(slug)}`)), error: null, demo: false }; }
  catch (error) {
    return { product: null, error: error instanceof StoreError && error.status === 404 ? null : 'This product couldn’t be loaded. Please try again.', demo: false };
  }
}
