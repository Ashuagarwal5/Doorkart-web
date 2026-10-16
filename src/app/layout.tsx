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
  icons: { icon: '/icon.png', apple: '/assets/favicon-64.png' },
};
async function StoreShell({ children }: { children: React.ReactNode }) {
  const { demo, categories, shop } = await getCatalog();
  return <><SiteHeader demo={demo} /><main id="main">{children}</main><SiteFooter categories={categories} shop={shop} /></>;
}
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body><StoreProvider><Suspense fallback={<div className="page-loading">Opening DoorKart…</div>}><StoreShell>{children}</StoreShell></Suspense></StoreProvider></body></html>;
}
