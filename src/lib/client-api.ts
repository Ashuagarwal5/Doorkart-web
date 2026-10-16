export class ClientError extends Error { constructor(message: string, public status: number) { super(message); } }
export async function storeRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  let response: Response;
  try { response = await fetch(`/api/store${path}`, { ...options, cache: 'no-store', signal: options.signal || AbortSignal.timeout(30000) }); }
  catch { throw new ClientError('We couldn’t confirm the request. Check your connection and try again.', 0); }
  let data;
  try { data = await response.json(); }
  catch { throw new ClientError(options.signal?.aborted ? "Request cancelled." : "Unexpected response. Please try again.", response.status); }
  if (!response.ok) throw new ClientError(data.error || 'Please try again.', response.status);
  return data as T;
}
