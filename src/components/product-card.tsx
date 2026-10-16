'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { ArrowUpRight, Check, Plus } from 'lucide-react';
import type { Product } from '@/lib/types';
import { money, productImage } from '@/lib/format';
import { useCart } from './store-provider';
export function StoreImage({ src, alt, className = '', sizes = '(max-width: 600px) 50vw, 25vw', preload = false }: { src: string; alt: string; className?: string; sizes?: string; preload?: boolean }) {
  const [failed, setFailed] = useState(false);
  return <Image className={className} src={failed ? '/assets/product-placeholder.svg' : src} alt={alt} fill sizes={sizes} preload={preload} unoptimized={src.startsWith('http')} onError={() => setFailed(true)} />;
}
export function ProductCard({ product }: { product: Product }) {
  const { add, ready, lines } = useCart();
  const quantity = lines.find(l => l.product.id === product.id)?.quantity || 0;
  const full = quantity >= Math.min(999, product.availableQuantity);
  const [added, setAdded] = useState(false);
  const discount = product.mrpPaise > product.sellingPricePaise ? Math.round((1 - product.sellingPricePaise / product.mrpPaise) * 100) : 0;
  return <article className="product-card"><Link className="product-image" href={`/products/${product.slug}`} aria-label={`View ${product.name}`}><StoreImage src={productImage(product)} alt={product.images[0]?.altText || product.name} /><div className="product-tags">{!product.inStock ? <span className="tag neutral">Sold out</span> : discount > 0 ? <span className="tag">{discount}% off</span> : product.isNew ? <span className="tag blue">Just in</span> : null}</div><span className="product-arrow"><ArrowUpRight size={19} /></span></Link><div className="product-info"><span className="product-category">{product.category.name}</span><h3><Link href={`/products/${product.slug}`}>{product.name}</Link></h3><div className="product-bottom"><div className="price">{money(product.sellingPricePaise)}{discount > 0 && <del>{money(product.mrpPaise)}</del>}</div><button className={`add-button ${added ? 'added' : ''}`} disabled={!ready || !product.inStock || full} aria-label={full ? `${product.name}: stock limit reached` : `Add ${product.name} to bag`} onClick={() => { add(product); setAdded(true); setTimeout(() => setAdded(false), 1500); }}>{added ? <Check size={19} /> : <Plus size={19} />}</button></div></div></article>;
}
