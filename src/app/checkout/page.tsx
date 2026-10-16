import { getCatalog } from '@/lib/store-api';
import { Checkout } from '@/components/checkout';
export const metadata = { title: 'Cash on Delivery checkout', robots: { index: false, follow: false } };
export default async function CheckoutPage() { const { demo } = await getCatalog(); return <div className="container page-section"><Checkout demo={demo} /></div>; }
