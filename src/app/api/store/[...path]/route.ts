import { type NextRequest } from 'next/server';
import { apiBase, backend, normalizeProduct, StoreError } from '@/lib/store-api';
import type { ProductPage } from '@/lib/types';

type Context = { params: Promise<{ path: string[] }> };
const result = (data: unknown, status = 200) => Response.json(data, { status, headers: { 'Cache-Control': 'no-store' } });
function fail(error: unknown) { return result({ error: error instanceof Error ? error.message : 'The request could not be completed.' }, error instanceof StoreError ? error.status : 502); }
export async function GET(request: NextRequest, context: Context) {
  const { path } = await context.params;
  const route = path.join('/');
  if (!/^(products|categories|delivery-areas|shop|orders\/(DK|BN)-\d{8}-\d{4,})$/.test(route)) return result({ error: 'Not found' }, 404);
  try {
    const token = request.headers.get('x-tracking-token');
    const data = await backend<unknown>(`/${route}${request.nextUrl.search}`, { headers: token ? { 'x-tracking-token': token } : {} });
    if (route === 'products') {
      const page = data as ProductPage;
      return result({ ...page, items: page.items.map(normalizeProduct) });
    }
    return result(data);
  } catch (error) { return fail(error); }
}
export async function POST(request: NextRequest, context: Context) {
  const { path } = await context.params;
  if (path.join('/') !== 'orders') return result({ error: 'Not found' }, 404);
  const origin = request.headers.get('origin');
  if (!origin || origin !== request.nextUrl.origin) return result({ error: 'Please submit checkout from this website.' }, 403);
  if (!apiBase()) return result({ error: 'Checkout is not open yet. No order has been placed.' }, 503);
  try {
    const body = await request.text();
    if (body.length > 100000) return result({ error: 'This order is too large.' }, 413);
    JSON.parse(body);
    return result(await backend('/orders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body }));
  } catch (error) { return fail(error); }
}
