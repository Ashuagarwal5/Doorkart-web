'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ArrowRight, Check, Copy, Package, Search, ShieldCheck } from 'lucide-react';
import { readTracked, type TrackedOrder } from '@/lib/order-storage';
import { storeRequest } from '@/lib/client-api';
import { money } from '@/lib/format';
import type { Order, PlacedOrder } from '@/lib/types';

function OrderSummary({ order }: { order: Order }) {
  return <article className="order-detail"><div className="order-detail-head"><div><span className="eyebrow">{order.orderNumber}</span><h2>{order.orderStatus.replaceAll('_', ' ').toLowerCase()}</h2></div><span className="tag blue">{order.paymentMethod} · {order.paymentStatus.toLowerCase()}</span></div><div className="order-items">{order.items.map(item => <div className="summary-row" key={item.productId}><span>{item.productName} × {item.quantity}</span><strong>{money(item.lineTotalPaise)}</strong></div>)}</div><div className="summary-row"><span>Subtotal</span><span>{money(order.subtotalPaise)}</span></div><div className="summary-row"><span>Delivery</span><span>{money(order.deliveryChargePaise)}</span></div>{order.discountPaise > 0 && <div className="summary-row"><span>Discount</span><span>−{money(order.discountPaise)}</span></div>}<div className="summary-row total"><span>Total</span><strong>{money(order.grandTotalPaise)}</strong></div><div className="delivery-address"><h3>Delivery to {order.customerName}</h3><p>{[order.deliveryAddress.addressLine1, order.deliveryAddress.addressLine2, order.deliveryAddress.landmark, order.deliveryAddress.area, order.deliveryAddress.city, order.deliveryAddress.pincode].filter(Boolean).join(', ')}</p></div><h3 className="tracking-title">Your order’s journey</h3><ol className="order-timeline">{order.statusHistory.map((event,i) => <li key={`${event.createdAt}-${i}`}><span /><div><strong>{event.status.replaceAll('_', ' ').toLowerCase()}</strong><small>{new Date(event.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' })} IST</small>{event.note && <p>{event.note}</p>}</div></li>)}</ol></article>;
}
export function Orders() {
  const [saved, setSaved] = useState<TrackedOrder[]>([]);
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    const timer = window.setTimeout(() => setSaved(readTracked()), 0);
    return () => window.clearTimeout(timer);
  }, []);
  async function lookup(orderNumber: string, token: string) {
    if (busy) return;
    setBusy(true); setError(''); setOrder(null);
    try { setOrder(await storeRequest<Order>(`/orders/${encodeURIComponent(orderNumber.trim().toUpperCase())}`, { headers: { 'x-tracking-token': token.trim() } })); }
    catch(e) { setError(e instanceof Error ? e.message : 'This order could not be loaded.'); }
    finally { setBusy(false); }
  }
  return <><div className="page-heading"><span className="eyebrow">FROM OUR STORE TO YOUR DOOR</span><h1>Follow your <em>finds.</em></h1><p>Check an order using its reference and private tracking token.</p></div><div className="orders-layout"><div><form className="order-lookup" onSubmit={e => { e.preventDefault(); const form = new FormData(e.currentTarget); lookup(String(form.get('number')), String(form.get('token'))); }}><h2><Search size={21} /> Find your order</h2><label>Order reference<input name="number" placeholder="DK-20261016-0001" required pattern="(DK|BN)-[0-9]{8}-[0-9]{4,}" autoCapitalize="characters" maxLength={40} /></label><label>Private tracking token<input type="password" name="token" required maxLength={200} autoComplete="off" /></label><p className="summary-note"><ShieldCheck size={16} /> Your token is only sent in a request header. Keep it private.</p><button className="button full-width" disabled={busy}>{busy ? 'Checking your order…' : 'Look up order'}<ArrowRight size={18} /></button></form>{saved.length > 0 && <div className="saved-orders"><h2>Orders on this device</h2><p>These references are saved in this browser only.</p>{saved.map(t => <button disabled={busy} key={t.orderNumber} onClick={() => lookup(t.orderNumber, t.trackingToken)}><Package size={17} /><span>{t.orderNumber}</span><ArrowRight size={16} /></button>)}</div>}</div><div>{error && <div className="notice error-notice" role="alert">{error}</div>}{order ? <OrderSummary order={order} /> : !busy && !error && <div className="empty-state"><Package size={50} strokeWidth={1} /><h2>Your order’s story starts here.</h2><p>Enter its details or choose an order saved on this device.</p></div>}{busy && <p className="page-loading" role="status">Opening your order…</p>}</div></div></>;
}
export function OrderSuccess() {
  const [order, setOrder] = useState<PlacedOrder | null>(null);
  const [ready, setReady] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState('');
  useEffect(() => {
    const timer = window.setTimeout(() => {
      try { const value = JSON.parse(sessionStorage.getItem('doorkart.web.receipt') || 'null'); if (value?.orderNumber && value?.trackingToken) setOrder(value); } catch { /* Missing receipt is shown as an empty state. */ }
      setReady(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);
  if (!ready) return <p className="page-loading">Opening your confirmation…</p>;
  if (!order) return <div className="empty-state big-empty"><Package size={50} /><h1>No order confirmation here yet.</h1><p>We only show a confirmation after the store accepts an order.</p><Link href="/orders" className="button">Look up an order <ArrowRight size={18} /></Link></div>;
  return <div className="receipt"><div className="receipt-heading"><span className="success-icon"><Check size={32} /></span><span className="eyebrow">A LITTLE SOMETHING TO LOOK FORWARD TO</span><h1>Your order is <em>confirmed.</em></h1><p>Thank you, {order.customerName}. The store has received your order.</p><strong>{order.orderNumber}</strong></div><OrderSummary order={order} /><div className="receipt-token"><h2>Keep your order access safe.</h2><p>Your private token is saved for this tab and, where browser storage is available, on this device. Copy your reference and token if you want to track this order elsewhere. Do not share them publicly.</p><button className="button button-outline" onClick={async () => { try { await navigator.clipboard.writeText(`Order: ${order.orderNumber}\nTracking token: ${order.trackingToken}`); setCopied(true); } catch { setCopyError('Clipboard is unavailable. Your order remains accessible in this tab and through orders saved on this device.'); } }}><Copy size={17} />{copied ? 'Copied securely' : 'Copy reference & private token'}</button>{copyError && <p role="status">{copyError}</p>}</div><Link href="/shop" className="button">Keep exploring <ArrowRight size={18} /></Link></div>;
}
