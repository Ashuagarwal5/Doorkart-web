'use client';
import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Banknote, Check, Minus, Plus, ShoppingBag } from 'lucide-react';
import { StoreImage } from './product-card';
import { useCart } from './store-provider';
import { money } from '@/lib/format';
import type { Product } from '@/lib/types';
export function ProductDetail({ product, demo }: { product: Product; demo: boolean }) {
  const [active, setActive] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const { add, ready, lines } = useCart();
  const media = product.images.length ? product.images : [{ url: '/assets/product-placeholder.svg', altText: product.name, mediaType: 'IMAGE' }];
  const current = media[active];
  const inBag = lines.find(l => l.product.id === product.id)?.quantity || 0;
  const available = Math.max(0, Math.min(999, product.availableQuantity) - inBag);
  const discount = product.mrpPaise > product.sellingPricePaise;
  return <><nav className="breadcrumbs" aria-label="Breadcrumb"><Link href="/shop">Shop</Link><span>/</span><Link href={`/categories/${product.category.slug}`}>{product.category.name}</Link><span>/</span><span>{product.name}</span></nav><div className="detail-grid"><div><div className="detail-image">{current.mediaType === 'VIDEO' ? <video src={current.url} controls playsInline aria-label={current.altText || product.name} /> : <StoreImage key={current.url} src={current.url} alt={current.altText || product.name} preload sizes="(max-width: 760px) 100vw, 50vw" />}</div>{media.length > 1 && <div className="thumbnails">{media.map((image,i) => <button key={`${image.url}-${i}`} onClick={() => setActive(i)} className={active === i ? 'selected' : ''} aria-label={`View ${image.mediaType === 'VIDEO' ? 'video' : 'image'} ${i+1}`} aria-pressed={active === i}>{image.mediaType === 'VIDEO' ? 'Play video' : <StoreImage src={image.url} alt="" sizes="80px" />}</button>)}</div>}</div><div className="detail-copy"><span className="eyebrow">{product.category.name}</span><h1>{product.name}</h1><div className="detail-price">{money(product.sellingPricePaise)}{discount && <del>{money(product.mrpPaise)}</del>}</div><span className={`stock-label ${product.inStock ? '' : 'sold-out'}`}>{product.inStock ? <><Check size={15} /> In stock</> : 'Currently out of stock'}</span><p className="description">{product.description}</p>{demo && <p className="notice">Sample product and price. You can try the shopping bag; purchases aren’t available yet.</p>}<div className="detail-actions"><div className="quantity-control"><button aria-label="Decrease quantity" disabled={quantity <= 1} onClick={() => setQuantity(n => n-1)}><Minus size={16} /></button><span aria-live="polite">{quantity}</span><button aria-label="Increase quantity" disabled={quantity >= available} onClick={() => setQuantity(n => n+1)}><Plus size={16} /></button></div><button className="button" disabled={!ready || !product.inStock || available < quantity} onClick={() => add(product, quantity)}><ShoppingBag size={18} /> {available === 0 && product.inStock ? 'Stock limit reached' : product.inStock ? 'Add to bag' : 'Sold out'}</button></div>{inBag > 0 && <Link className="in-bag-link" href="/cart">{inBag} in your bag · View bag <ArrowRight size={16} /></Link>}<div className="detail-assurance"><Banknote size={22} /><div>Cash on Delivery<small>Delivery availability and charges are checked at checkout.</small></div></div><p className="sku">Product reference: {product.sku}</p></div></div></>;
}
