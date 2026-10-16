import type { OrderInput, PlacedOrder } from './types';
export const PENDING_KEY = 'doorkart.web.pending-order.v1';
const TRACKED_KEY = 'doorkart.web.tracked-orders.v1';
export type TrackedOrder = { orderNumber: string; trackingToken: string };
export function readTracked(): TrackedOrder[] {
  try { const value: unknown = JSON.parse(localStorage.getItem(TRACKED_KEY) || '[]'); return Array.isArray(value) ? value.filter((v): v is TrackedOrder => !!v && typeof v.orderNumber === 'string' && typeof v.trackingToken === 'string').slice(0, 50) : []; }
  catch { return []; }
}
export function saveOrder(order: PlacedOrder) {
  // Session receipt remains available even if persistent storage is blocked.
  sessionStorage.setItem('doorkart.web.receipt', JSON.stringify(order));
  try { localStorage.setItem(TRACKED_KEY, JSON.stringify([{ orderNumber: order.orderNumber, trackingToken: order.trackingToken }, ...readTracked().filter(t => t.orderNumber !== order.orderNumber)].slice(0, 50))); } catch { /* Receipt still holds the token for this tab. */ }
}
export function readPending(): OrderInput | null {
  try { const value = JSON.parse(sessionStorage.getItem(PENDING_KEY) || 'null'); return value && typeof value.clientRequestId === 'string' && Array.isArray(value.items) && value.customer && value.address ? value as OrderInput : null; } catch { return null; }
}
