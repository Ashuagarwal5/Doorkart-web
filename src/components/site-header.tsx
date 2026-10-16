'use client';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowUpRight, Menu, Search, ShoppingBag, UserRound, X } from 'lucide-react';
import { useCart } from './store-provider';

export function Brand() {
  return <span className="brand"><span className="brand-symbol"><Image src="/assets/doorkart-logo.png" alt="" width={52} height={52} sizes="52px" /></span><span>Door<span>Kart</span><b>.</b></span></span>;
}
export function SiteHeader({ demo }: { demo: boolean }) {
  const pathname = usePathname();
  const router = useRouter();
  const { count } = useCart();
  const hydrated = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const visibleCount = hydrated ? count : 0;
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const menuButton = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const listener = () => setScrolled(window.scrollY > 15);
    listener(); window.addEventListener('scroll', listener, { passive: true });
    return () => window.removeEventListener('scroll', listener);
  }, []);
  useEffect(() => {
    if (searchOpen) searchRef.current?.focus();
    const escape = (e: KeyboardEvent) => { if (e.key === 'Escape') { setOpen(false); setSearchOpen(false); menuButton.current?.focus(); } };
    document.addEventListener('keydown', escape);
    return () => document.removeEventListener('keydown', escape);
  }, [searchOpen]);
  const links = [['/', 'Home'], ['/shop', 'Shop'], ['/categories', 'Categories'], ['/orders', 'Orders']];
  const close = () => { setOpen(false); setSearchOpen(false); };
  return <><a href="#main" className="skip-link">Skip to content</a><div className="announcement"><span>{demo ? 'A first look at DoorKart. Sample catalogue · Orders are not open yet.' : 'Your everyday favourites, a little closer to home.'}</span><Link href="/shop">Explore the store <ArrowUpRight size={12} /></Link></div>
    <header className={`site-header ${scrolled ? 'scrolled' : ''}`}><div className="container nav-inner"><Link href="/" onClick={close} aria-label="DoorKart home"><Brand /></Link><nav className="desktop-nav" aria-label="Main navigation">{links.map(([href, label]) => <Link href={href} key={href} className={pathname === href || href !== '/' && pathname.startsWith(href) ? 'active' : ''} aria-current={pathname === href ? 'page' : undefined}>{label}</Link>)}</nav><div className="nav-actions"><button className="icon-button" aria-label={searchOpen ? 'Close search' : 'Search products'} aria-expanded={searchOpen} aria-controls="site-search" onClick={() => { setSearchOpen(!searchOpen); setOpen(false); }}>{searchOpen ? <X size={21} /> : <Search size={21} />}</button><Link className="icon-button account-link" href="/checkout" aria-label="Guest checkout"><UserRound size={21} /></Link><Link className="icon-button cart-link" href="/cart" aria-label={`Shopping bag, ${visibleCount} items`} onClick={close}><ShoppingBag size={21} /><AnimatePresence mode="popLayout">{visibleCount > 0 && <motion.span key={visibleCount} className="cart-count" initial={{ scale: .6 }} animate={{ scale: 1 }}>{visibleCount > 99 ? '99+' : visibleCount}</motion.span>}</AnimatePresence></Link><button ref={menuButton} className="icon-button menu-button" aria-label={open ? 'Close navigation' : 'Open navigation'} aria-expanded={open} aria-controls="mobile-menu" onClick={() => { setOpen(!open); setSearchOpen(false); }}>{open ? <X /> : <Menu />}</button></div></div>
    <AnimatePresence>{searchOpen && <motion.div id="site-search" className="search-panel" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}><form className="container" onSubmit={e => { e.preventDefault(); const data = new FormData(e.currentTarget); router.push(`/shop?search=${encodeURIComponent(String(data.get('search') || '').trim())}`); close(); }}><Search size={20} /><input ref={searchRef} type="search" name="search" maxLength={100} placeholder="Find your next favourite…" aria-label="Search products" /><button className="button small" type="submit">Search <ArrowUpRight size={16} /></button></form></motion.div>}</AnimatePresence>
    <AnimatePresence>{open && <motion.nav id="mobile-menu" className="mobile-menu" aria-label="Mobile navigation" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}>{links.map(([href, label]) => <Link key={href} href={href} onClick={close} aria-current={pathname === href ? 'page' : undefined}>{label}<ArrowUpRight size={17} /></Link>)}<Link href="/checkout" onClick={close}>Guest checkout<ArrowUpRight size={17} /></Link></motion.nav>}</AnimatePresence></header></>;
}
