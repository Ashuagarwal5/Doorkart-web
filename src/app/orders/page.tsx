import { Orders } from '@/components/orders';
export const metadata = { title: 'Track your order', robots: { index: false, follow: false } };
export default function OrdersPage() { return <div className="container page-section"><Orders /></div>; }
