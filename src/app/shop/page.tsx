import { Suspense } from 'react';
import { getCatalog } from '@/lib/store-api';
import { CatalogBrowser } from '@/components/catalog-browser';
export const metadata = { title: 'Shop all finds' };
async function ShopCatalog() { return <CatalogBrowser catalog={await getCatalog()} />; }
export default function Shop() { return <div className="container page-section"><div className="page-heading"><span className="eyebrow">A WORLD OF EVERYDAY POSSIBILITIES</span><h1>Find your next <em>favourite.</em></h1><p>A little inspiration for your desk, your home, and the people you love.</p></div><Suspense fallback={<p className="page-loading">Loading the collection…</p>}><ShopCatalog /></Suspense></div>; }
