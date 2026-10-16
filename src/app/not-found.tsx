import Link from 'next/link';
export default function NotFound() { return <div className="container empty-state big-empty"><span className="eyebrow">404 · A FIND THAT GOT AWAY</span><h1>This door leads<br /><em>somewhere else.</em></h1><p>The page or product you’re looking for isn’t available.</p><Link href="/shop" className="button">Find something new →</Link></div>; }
