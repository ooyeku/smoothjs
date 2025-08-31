import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { http, HTTPError } from '../src/net/http.js';

const headers = (map) => ({ get: (k) => map[k.toLowerCase()] || map[k] || '' });

describe('http client', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it('parses JSON responses and returns data', async () => {
    const data = { ok: true };
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      url: '/x',
      headers: headers({ 'content-type': 'application/json' }),
      json: async () => data,
      text: async () => JSON.stringify(data),
    });
    const res = await http.get('/x');
    expect(res).toEqual(data);
  });

  it('throws HTTPError with details on non-ok and parses error json message', async () => {
    const body = { message: 'Nope' };
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      statusText: 'Not Found',
      url: '/err',
      headers: headers({ 'content-type': 'application/json' }),
      json: async () => body,
      text: async () => JSON.stringify(body),
    });
    await expect(http.get('/err')).rejects.toBeInstanceOf(HTTPError);
    try {
      await http.get('/err');
    } catch (e) {
      expect(e.status).toBe(404);
      expect(e.statusText).toBe('Not Found');
      expect(e.url).toBe('/err');
      expect(String(e.body)).toContain('Nope');
      expect(String(e.message)).toContain('HTTP 404 Not Found');
    }
  });

  it('withBase builds URLs correctly', async () => {
    const fetchSpy = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      url: '/api/todos',
      headers: headers({ 'content-type': 'application/json' }),
      json: async () => ({ items: [] }),
      text: async () => '{"items":[]}',
    });
    global.fetch = fetchSpy;
    const api = http.withBase('/api');
    await api.get('/todos');
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const calledWith = fetchSpy.mock.calls[0][0];
    expect(calledWith).toBe('/api/todos');
  });
});
