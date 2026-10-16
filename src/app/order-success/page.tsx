import { OrderSuccess } from '@/components/orders';
export const metadata = { title: 'Order confirmation', robots: { index: false, follow: false } };
export default function Success() { return <div className="container page-section"><OrderSuccess /></div>; }
