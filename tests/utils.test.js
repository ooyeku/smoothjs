import { describe, it, expect, vi } from 'vitest';
import { utils } from '../src/utils/index.js';

describe('utils', () => {
  it('escapeHtml should escape common entities', () => {
    const input = '<script>alert("x")</script>';
    const escaped = utils.escapeHtml(input);
    expect(escaped).toContain('&lt;script');
    expect(escaped).toContain('&quot;');
    expect(escaped).toContain('&gt;');
  });

  it('debounce should delay invocation', async () => {
    const fn = vi.fn();
    const d = utils.debounce(fn, 20);
    d(); d(); d();
    expect(fn).not.toHaveBeenCalled();
    await new Promise(r => setTimeout(r, 30));
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('throttle should limit rapid calls', async () => {
    const fn = vi.fn();
    const t = utils.throttle(fn, 20);
    t(); t(); t();
    expect(fn).toHaveBeenCalledTimes(1);
    await new Promise(r => setTimeout(r, 25));
    t();
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('ready should call callback (jsdom is treated as browser)', async () => {
    const cb = vi.fn();
    utils.ready(cb);
    await Promise.resolve();
    expect(cb).toHaveBeenCalled();
  });
});
