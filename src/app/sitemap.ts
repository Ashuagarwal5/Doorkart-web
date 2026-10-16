import type { MetadataRoute } from 'next';
import { getCatalog } from '@/lib/store-api';
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const origin = process.env.SITE_URL?.replace(/\/$/, '');
  if (!origin) return [];
  const catalog = await getCatalog();
  const paths = ['/', '/shop', '/categories', '/privacy-policy', '/terms-and-conditions', ...catalog.categories.map(c => `/categories/${c.slug}`), ...catalog.products.map(p => `/products/${p.slug}`)];
  return paths.map(path => ({ url: `${origin}${path}`, changeFrequency: 'weekly', priority: path === '/' ? 1 : .6 }));
}
