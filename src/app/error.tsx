'use client';
import Link from 'next/link';
export default function ErrorPage({ reset }: { reset: () => void }) { return <div className="container empty-state big-empty"><span className="eyebrow">LET’S TRY THAT AGAIN</span><h1>A little hiccup.</h1><p>We couldn’t open this page. Your bag is still saved on this device where storage is available.</p><button className="button" onClick={reset}>Try again</button><Link href="/shop" className="text-link">Back to the shop →</Link></div>; }
