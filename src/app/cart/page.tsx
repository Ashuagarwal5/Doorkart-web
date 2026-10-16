import { Suspense } from 'react';
import { getCatalog } from '@/lib/store-api';
import { CartPage } from '@/components/cart-page';
export const metadata = { title: 'Your shopping bag', robots: { index: false, follow: false } };
async function CartContent() { const { demo } = await getCatalog(); return <CartPage demo={demo} />; }
export default function Cart() { return <div className="container page-section"><Suspense fallback={<p className="page-loading">Opening your bag…</p>}><CartContent /></Suspense></div>; }
