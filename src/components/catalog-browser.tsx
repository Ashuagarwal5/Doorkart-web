'use client';
import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Search, SearchX, SlidersHorizontal } from 'lucide-react';
import { ProductCard } from './product-card';
import { storeRequest } from '@/lib/client-api';
import type { Catalog, ProductPage } from '@/lib/types';

export function CatalogBrowser({ catalog, category }: { catalog: Catalog; category?: string }) {
  const params = useSearchParams();
  const router = useRouter();
  const search = params.get('search') || '';
  const selected = category || params.get('category') || '';
  const sort = ['newest', 'price_asc', 'price_desc', 'name_asc'].includes(params.get('sort') || '') ? params.get('sort')! : 'newest';
  const pageNumber = Math.max(1, Math.floor(Number(params.get('page')) || 1));
  const isNew = params.get('new') === 'true';
  const inStock = params.get('inStock') === 'true';
  const [result, setResult] = useState<ProductPage | null>(null);
  const [loading, setLoading] = useState(!catalog.demo);
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);
  const query = new URLSearchParams({ limit: '12', page: String(pageNumber), sort });
  if (selected) query.set('category', selected);
  if (search) query.set('search', search.slice(0, 100));
  if (isNew) query.set('new', 'true');
  if (inStock) query.set('inStock', 'true');
  const queryString = query.toString();
  useEffect(() => {
    if (catalog.demo) return;
    const abort = new AbortController();
    storeRequest<ProductPage>(`/products?${queryString}`, { signal: abort.signal }).then(data => { if (!abort.signal.aborted) setResult(data); }).catch(e => { if (!abort.signal.aborted) setError(e.message); }).finally(() => { if (!abort.signal.aborted) setLoading(false); });
    return () => abort.abort();
  }, [catalog.demo, queryString, retry]);
  let items = result?.items || [];
  let total = result?.pagination.total || 0;
  let totalPages = result?.pagination.totalPages || 0;
  if (catalog.demo) {
    items = catalog.products.filter(p => (!selected || p.category.slug === selected) && (!isNew || p.isNew) && (!inStock || p.inStock) && `${p.name} ${p.description}`.toLowerCase().includes(search.toLowerCase()));
    if (sort === 'price_asc') items = [...items].sort((a,b) => a.sellingPricePaise - b.sellingPricePaise);
    if (sort === 'price_desc') items = [...items].sort((a,b) => b.sellingPricePaise - a.sellingPricePaise);
    if (sort === 'name_asc') items = [...items].sort((a,b) => a.name.localeCompare(b.name));
    total = items.length; totalPages = Math.ceil(total / 12); items = items.slice((pageNumber - 1) * 12, pageNumber * 12);
  }
  function change(key: string, value: string) {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value); else next.delete(key);
    if (key !== 'page') next.delete('page');
    router.push(`${category ? `/categories/${category}` : '/shop'}?${next.toString()}`, { scroll: false });
  }
  return <div className="catalog-content">{catalog.demo && <p className="notice">You’re exploring our sample collection. Products and prices are illustrative; checkout is not open yet.</p>}<div className="catalog-toolbar"><form className="catalog-search" key={search} onSubmit={e => { e.preventDefault(); change('search', String(new FormData(e.currentTarget).get('search') || '').trim()); }}><Search size={18} /><input name="search" type="search" maxLength={100} defaultValue={search} placeholder="Search for your next find" aria-label="Search catalogue" /><button type="submit" className="text-button">Search</button></form><label className="sort-label"><SlidersHorizontal size={17} /><span className="sr-only">Sort products</span><select value={sort} onChange={e => change('sort', e.target.value)}><option value="newest">Newest first</option><option value="price_asc">Price: low to high</option><option value="price_desc">Price: high to low</option><option value="name_asc">Name: A–Z</option></select></label></div>
    <div className="catalog-layout"><aside className="catalog-sidebar"><h2>Find your favourites</h2><div className="category-filters"><Link className={!selected ? 'selected' : ''} href="/shop">All products</Link>{catalog.categories.map(c => <Link href={`/categories/${c.slug}`} key={c.id} className={selected === c.slug ? 'selected' : ''}>{c.name}<ArrowRight size={14} /></Link>)}</div><h3>A little more specific?</h3><label className="check-label"><input type="checkbox" checked={inStock} onChange={e => change('inStock', e.target.checked ? 'true' : '')} /> In stock only</label><label className="check-label"><input type="checkbox" checked={isNew} onChange={e => change('new', e.target.checked ? 'true' : '')} /> New arrivals</label></aside><div className="catalog-results"><p className="result-count" role="status">{loading ? 'Finding your favourites…' : `${total} ${total === 1 ? 'find' : 'finds'}${search ? ` for “${search}”` : ''}`}</p>{error ? <div className="empty-state" role="alert"><SearchX size={40} /><h2>We couldn’t load these finds.</h2><p>{error}</p><button className="button" onClick={() => setRetry(n => n + 1)}>Try again</button></div> : loading ? <div className="product-grid listing-grid" aria-label="Loading products">{[1,2,3,4,5,6].map(n => <div className="skeleton-card" key={n}><div /><span /><span /></div>)}</div> : items.length ? <><div className="product-grid listing-grid">{items.map(p => <ProductCard key={p.id} product={p} />)}</div>{totalPages > 1 && <nav className="pagination" aria-label="Product pages"><button className="button button-outline small" disabled={pageNumber <= 1} onClick={() => change('page', String(pageNumber - 1))}><ArrowLeft size={16} /> Previous</button><span>Page {pageNumber} of {totalPages}</span><button className="button button-outline small" disabled={pageNumber >= totalPages} onClick={() => change('page', String(pageNumber + 1))}>Next <ArrowRight size={16} /></button></nav>}</> : <div className="empty-state"><SearchX size={42} /><h2>No finds this time.</h2><p>Try another search or explore a different category.</p><Link href="/shop" className="button button-outline">Explore all products <ArrowUpRightIcon /></Link></div>}</div></div></div>;
}
function ArrowUpRightIcon() { return <ArrowRight size={17} />; }
