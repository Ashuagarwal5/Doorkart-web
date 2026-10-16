import type { MetadataRoute } from 'next';
export default function robots(): MetadataRoute.Robots { const origin = process.env.SITE_URL?.replace(/\/$/, ''); return { rules: { userAgent: '*', allow: '/', disallow: ['/api/', '/cart', '/checkout', '/orders', '/order-success'] }, ...(origin ? { sitemap: `${origin}/sitemap.xml` } : {}) }; }
