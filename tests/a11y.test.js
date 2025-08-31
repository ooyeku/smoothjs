import { describe, it, expect } from 'vitest';
import { focusTrap, announce } from '../src/a11y/index.js';

describe('A11y utilities', () => {
  it('focusTrap focuses first element and wraps on Tab/Shift+Tab', () => {
    const host = document.createElement('div');
    const b1 = document.createElement('button'); b1.textContent = 'One';
    const b2 = document.createElement('button'); b2.textContent = 'Two';
    const outside = document.createElement('button'); outside.textContent = 'Outside';
    host.appendChild(b1); host.appendChild(b2);
    document.body.appendChild(host);
    document.body.appendChild(outside);

    const cleanup = focusTrap(host);

    // initial focus should be first focusable
    expect(document.activeElement === b1 || b1 === document.activeElement).toBe(true);

    // Focus the last element and press Tab: should wrap to first
    b2.focus();
    const e1 = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true });
    host.dispatchEvent(e1);
    expect(document.activeElement).toBe(b1);

    // Focus first and press Shift+Tab: should move to last
    b1.focus();
    const e2 = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, shiftKey: true });
    host.dispatchEvent(e2);
    expect(document.activeElement).toBe(b2);

    // Clean up and ensure focus can return
    cleanup();
    outside.focus();
    expect(document.activeElement).toBe(outside);

    document.body.removeChild(host);
    document.body.removeChild(outside);
  });

  it('announce creates assertive live region with text', () => {
    announce('Hello world', { politeness: 'assertive', timeout: 0 });
    const region = document.querySelector('[role="status"]');
    expect(region).toBeTruthy();
    expect(region.getAttribute('aria-live')).toBe('assertive');
    expect(region.textContent).toContain('Hello world');
  });
});
