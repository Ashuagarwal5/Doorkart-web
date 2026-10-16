'use client';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Banknote, Check, LockKeyhole, MapPin } from 'lucide-react';
import { useCart } from './store-provider';
import { money } from '@/lib/format';
import { ClientError, storeRequest } from '@/lib/client-api';
import { PENDING_KEY, readPending, saveOrder } from '@/lib/order-storage';
import type { DeliveryArea, OrderInput, PlacedOrder, ProductPage } from '@/lib/types';

export function Checkout({ demo }: { demo: boolean }) {
  const { lines, ready, clear } = useCart();
  const router = useRouter();
  const [areas, setAreas] = useState<DeliveryArea[]>([]);
  const [areaId, setAreaId] = useState('');
  const [loading, setLoading] = useState(!demo);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [pending, setPending] = useState<OrderInput | null>(null);
  const [retry, setRetry] = useState(0);
  const submitting = useRef(false);
  useEffect(() => {
    const timer = window.setTimeout(() => setPending(readPending()), 0);
    return () => window.clearTimeout(timer);
  }, []);
  useEffect(() => {
    if (demo) return;
    let cancelled = false;
    storeRequest<DeliveryArea[]>('/delivery-areas').then(data => { if (!cancelled) setAreas(data); }).catch(e => { if (!cancelled) setError(e.message); }).finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [demo, retry]);
  const area = areas.find(a => a.id === areaId);
  const subtotal = lines.reduce((n, l) => n + l.quantity * l.product.sellingPricePaise, 0);
  const delivery = area ? area.freeDeliveryThresholdPaise !== null && subtotal >= area.freeDeliveryThresholdPaise ? 0 : area.deliveryChargePaise : null;
  const belowMinimum = !!area?.minimumOrderPaise && subtotal < area.minimumOrderPaise;
  const demoItems = lines.some(l => l.product.id.startsWith('demo-'));
  async function place(input: OrderInput) {
    if (submitting.current) return;
    submitting.current = true; setBusy(true); setError('');
    try {
      // Persist the exact request BEFORE submission. A lost response is safely retried with this same body.
      sessionStorage.setItem(PENDING_KEY, JSON.stringify(input));
      setPending(input);
      const order = await storeRequest<PlacedOrder>('/orders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(input) });
      if (!order.orderNumber || !order.trackingToken || !Number.isSafeInteger(order.grandTotalPaise)) throw new Error('The order response could not be confirmed. Retry this same request.');
      saveOrder(order);
      sessionStorage.removeItem(PENDING_KEY);
      clear();
      router.push('/order-success');
    } catch (e) {
      if (e instanceof ClientError && [400, 401, 403, 404, 413, 422, 429].includes(e.status)) {
        sessionStorage.removeItem(PENDING_KEY); setPending(null);
        setError(e.message);
      } else setError(`${e instanceof Error ? e.message : 'We couldn’t confirm your order.'} Use “Retry this order” to check the same submission. Do not place a new order until it is resolved.`);
    } finally { submitting.current = false; setBusy(false); }
  }
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (!area || demo || demoItems || belowMinimum || submitting.current) return;
    const form = new FormData(event.currentTarget);
    const get = (name: string) => String(form.get(name) || '').trim();
    const pincode = get('pincode');
    if (area.pincode && area.pincode !== pincode) { setError('This pincode does not match the selected delivery area.'); return; }
    setBusy(true); setError('');
    try {
      const current = await storeRequest<ProductPage>(`/products?ids=${encodeURIComponent(lines.map(l => l.product.id).join(','))}&limit=50`);
      for (const line of lines) {
        const product = current.items.find(p => p.id === line.product.id);
        if (!product || !product.inStock || product.availableQuantity < line.quantity) throw new Error(`${line.product.name} is no longer available in the requested quantity. Please update your bag.`);
        if (product.sellingPricePaise !== line.product.sellingPricePaise) throw new Error(`The price of ${line.product.name} has changed. Remove it from your bag and add it again to review the current price.`);
      }
      await place({ clientRequestId: crypto.randomUUID(), customer: { fullName: get('name'), mobile: get('phone') }, address: { addressLine1: get('address'), addressLine2: get('address2'), landmark: get('landmark'), city: get('city'), pincode }, deliveryAreaId: area.id, items: lines.map(l => ({ productId: l.product.id, quantity: l.quantity })), paymentMethod: 'COD' });
    } catch (e) { setError(e instanceof Error ? e.message : 'Please review your bag and try again.'); }
    finally { setBusy(false); }
  }
  if (!ready) return <p className="page-loading">Preparing checkout…</p>;
  if (pending) return <div className="empty-state big-empty"><LockKeyhole size={44} /><h1>Let’s confirm your order.</h1><p>A previous submission hasn’t been resolved. Retrying sends the same request and won’t create a duplicate order.</p><p>For {pending.customer.fullName} · {pending.address.pincode}</p>{error && <p className="notice error-notice" role="alert">{error}</p>}<button className="button" disabled={busy || demo} onClick={() => place(pending)}>{busy ? 'Checking your order…' : 'Retry this order'}<ArrowRight size={18} /></button></div>;
  if (!lines.length) return <div className="empty-state big-empty"><h1>A good order starts<br />with a good find.</h1><p>Your bag is empty.</p><Link className="button" href="/shop">Explore the store <ArrowRight size={18} /></Link></div>;
  return <><div className="page-heading"><span className="eyebrow">JUST A FEW MORE LITTLE DETAILS</span><h1>Make it <em>yours.</em></h1><p>Guest checkout. Cash on Delivery. No account needed.</p></div>{(demo || demoItems) && <p className="notice">Checkout isn’t available for sample products. No order will be placed.</p>}<div className="cart-layout checkout-layout"><form className="checkout-form" onSubmit={submit}><fieldset disabled={busy || demo || demoItems}><legend><MapPin size={20} /> Where should we bring your finds?</legend><div className="form-grid"><label>Full name<input name="name" autoComplete="name" minLength={2} maxLength={100} required /></label><label>Mobile number<input name="phone" type="tel" inputMode="numeric" autoComplete="tel-national" pattern="[6-9][0-9]{9}" placeholder="10-digit mobile number" maxLength={10} required /></label><label className="span-two">Delivery area<select value={areaId} onChange={e => setAreaId(e.target.value)} required disabled={loading || !areas.length}><option value="">{loading ? 'Checking delivery areas…' : 'Select your delivery area'}</option>{areas.map(a => <option key={a.id} value={a.id}>{a.name}{a.pincode ? ` · ${a.pincode}` : ''}</option>)}</select></label><label className="span-two">Address<input name="address" autoComplete="address-line1" placeholder="House, building, street" maxLength={200} required /></label><label className="span-two">Address line 2 <span>(optional)</span><input name="address2" autoComplete="address-line2" maxLength={200} /></label><label>Landmark <span>(optional)</span><input name="landmark" maxLength={200} /></label><label>City<input name="city" autoComplete="address-level2" maxLength={100} required /></label><label>Pincode<input key={area?.pincode || 'pincode'} name="pincode" autoComplete="postal-code" inputMode="numeric" pattern="[1-9][0-9]{5}" maxLength={6} defaultValue={area?.pincode || ''} required /></label></div><div className="payment-option"><Banknote size={25} /><div><strong>Cash on Delivery</strong><p>Pay when your order arrives. No online payment.</p></div><Check size={19} /></div><label className="consent"><input type="checkbox" required /><span>I have reviewed the <Link href="/terms-and-conditions">Terms & Conditions</Link> and <Link href="/privacy-policy">Privacy Policy</Link>. My order reference and access token will be saved on this device for tracking.</span></label>{belowMinimum && <p className="notice">The minimum order for {area?.name} is {money(area?.minimumOrderPaise || 0)}.</p>}<button className="button full-width" disabled={loading || !area || belowMinimum || busy || demo || demoItems}>{busy ? 'Checking your order…' : 'Place Cash on Delivery order'}<ArrowRight size={18} /></button></fieldset>{!loading && !demo && !areas.length && <p className="notice">No delivery areas are currently available. Orders cannot be placed yet.</p>}{error && <div className="notice error-notice" role="alert">{error}{!areas.length && <button type="button" className="text-button" onClick={() => setRetry(n => n+1)}>Retry connection</button>}</div>}</form><aside className="order-summary"><h2>Your good finds</h2>{lines.map(l => <div className="summary-row" key={l.product.id}><span>{l.product.name} <small>× {l.quantity}</small></span><strong>{money(l.product.sellingPricePaise * l.quantity)}</strong></div>)}<div className="summary-row"><span>Items subtotal</span><span>{money(subtotal)}</span></div><div className="summary-row"><span>Estimated delivery</span><span>{delivery === null ? 'Select area' : money(delivery)}</span></div><div className="summary-row total"><span>Estimated total</span><strong>{money(subtotal + (delivery || 0))}</strong></div><p className="summary-note">The store validates final stock, prices, delivery availability, and total when the order is submitted. This is an estimate.</p><p className="cod-note"><LockKeyhole size={14} /> Your details are sent only when you place the order.</p></aside></div></>;
}
