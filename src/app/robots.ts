import type { MetadataRoute } from 'next';
export default function robots(): MetadataRoute.Robots { const origin = (process.env.SITE_URL || 'http://localhost:3000').replace(/\/$/, ''); return { rules: { userAgent: '*', allow: '/', disallow: ['/api/', '/cart', '/checkout', '/orders', '/order-success'] }, ...(origin ? { sitemap: `${origin}/sitemap.xml` } : {}) }; }
