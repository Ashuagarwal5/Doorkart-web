'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { AnimatePresence, motion, MotionConfig } from 'motion/react';
import { Check, ShoppingBag } from 'lucide-react';
import type { CartLine, Product } from '@/lib/types';

type CartState = { lines: CartLine[]; ready: boolean; storageError: boolean; count: number; add: (product: Product, quantity?: number) => void; update: (id: string, quantity: number) => void; remove: (id: string) => void; clear: () => void };
const CartContext = createContext<CartState | null>(null);
const KEY = 'doorkart.web.cart.v1';
const validLine = (value: unknown): value is CartLine => {
  if (!value || typeof value !== 'object') return false;
  const line = value as Partial<CartLine>;
  const p = line.product;
  return !!p && typeof p.id === 'string' && typeof p.slug === 'string' && typeof p.name === 'string'
    && Number.isSafeInteger(p.sellingPricePaise) && p.sellingPricePaise >= 0
    && Number.isSafeInteger(p.availableQuantity) && p.availableQuantity >= 0 && !!p.category && typeof p.category.name === 'string'
    && Array.isArray(p.images) && p.images.every(i => typeof i?.url === 'string')
    && Number.isInteger(line.quantity) && (line.quantity ?? 0) > 0 && (line.quantity ?? 0) <= 999;
};

export function StoreProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [ready, setReady] = useState(false);
  const [storageError, setStorageError] = useState(false);
  const [toast, setToast] = useState('');
  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const stored: unknown = JSON.parse(localStorage.getItem(KEY) || '[]');
        if (Array.isArray(stored)) {
          const unique = new Map<string, CartLine>();
          for (const line of stored.filter(validLine).slice(0, 50)) unique.set(line.product.id, line);
          setLines([...unique.values()]);
        }
      } catch { setStorageError(true); }
      setReady(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);
  useEffect(() => {
    if (!ready) return;
    try { localStorage.setItem(KEY, JSON.stringify(lines)); }
    catch { window.setTimeout(() => setStorageError(true), 0); }
  }, [lines, ready]);
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(''), 3000);
    return () => clearTimeout(timer);
  }, [toast]);
  const add = (product: Product, quantity = 1) => {
    if (!ready || !product.inStock || !Number.isInteger(quantity) || quantity < 1) return;
    setLines(current => {
      const existing = current.find(l => l.product.id === product.id);
      if (!existing && current.length >= 50) return current;
      const next = Math.min(999, product.availableQuantity, (existing?.quantity || 0) + quantity);
      return existing ? current.map(l => l.product.id === product.id ? { product, quantity: next } : l) : [...current, { product, quantity: next }];
    });
    setToast(`${product.name} added to your bag`);
  };
  const update = (id: string, quantity: number) => {
    if (!Number.isInteger(quantity) || quantity < 1) return;
    setLines(current => current.map(l => l.product.id === id ? { ...l, quantity: Math.min(quantity, 999, Math.max(1, l.product.availableQuantity)) } : l));
  };
  return <MotionConfig reducedMotion="user"><CartContext.Provider value={{ lines, ready, storageError, count: lines.reduce((n, l) => n + l.quantity, 0), add, update, remove: id => setLines(current => current.filter(l => l.product.id !== id)), clear: () => setLines([]) }}>
    {children}<div className="toast-region" role="status" aria-live="polite"><AnimatePresence>{toast && <motion.div key={toast} className="toast" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}><span><Check size={17} /></span><p>{toast}</p><ShoppingBag size={18} /></motion.div>}</AnimatePresence></div>
  </CartContext.Provider></MotionConfig>;
}
export function useCart() { const value = useContext(CartContext); if (!value) throw new Error('Cart provider is missing'); return value; }
