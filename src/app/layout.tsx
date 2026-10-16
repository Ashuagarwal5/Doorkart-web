import { Suspense } from 'react';
import type { Metadata } from 'next';
import { StoreProvider } from '@/components/store-provider';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { getCatalog } from '@/lib/store-api';
import './globals.css';
export const metadata: Metadata = {
  title: { default: 'DoorKart — Open the door to more.', template: '%s | DoorKart' },
  description: 'Discover stationery, gifts, toys, sports, decoration and more at DoorKart. Thoughtful finds for your everyday.',
  metadataBase: new URL(process.env.SITE_URL || 'http://localhost:3000'),
  icons: { icon: [{ url: '/assets/favicon-64.png', type: 'image/png', sizes: '64x64' }], shortcut: '/assets/favicon-64.png', apple: '/assets/favicon-64.png' },
  openGraph: { siteName: 'DoorKart', type: 'website', images: ['/assets/doorkart-logo.png'] },
};
async function StoreShell({ children }: { children: React.ReactNode }) {
  const { demo, categories, shop } = await getCatalog();
  return <><SiteHeader demo={demo} /><main id="main">{children}</main><SiteFooter categories={categories} shop={shop} /></>;
}
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body><StoreProvider><Suspense fallback={<div className="page-loading">Opening DoorKart…</div>}><StoreShell>{children}</StoreShell></Suspense></StoreProvider></body></html>;
}
