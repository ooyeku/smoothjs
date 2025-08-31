import { describe, it, expect } from 'vitest';
import { sanitize } from '../src/security/index.js';

describe('Security.sanitize', () => {
  it('removes script tags and event handlers', () => {
    const input = '<div onclick="alert(1)">x<script>alert(2)</script></div>';
    const out = sanitize(input);
    expect(out).toContain('<div>x</div>');
    expect(out).not.toContain('onclick');
    expect(out).not.toContain('<script>');
  });

  it('removes javascript: URLs and unsafe data: URLs', () => {
    const input = '<a href="javascript:alert(1)">a</a><img src="data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==">';
    const out = sanitize(input);
    expect(out).toContain('<a>a</a>');
    expect(out).toContain('<img>'); // src removed
    expect(out).not.toContain('javascript:');
    expect(out).not.toContain('data:text/html');
  });

  it('allows safe data image URLs', () => {
    const input = '<img src="data:image/png;base64,iVBORw0KGgo=">';
    const out = sanitize(input);
    // Our sanitizer keeps the element but strips src (we allow image/*, so it should keep src)
    expect(out).toContain('data:image/png');
  });

  it('supports allowTags option (disallowing tags unwraps to text)', () => {
    const input = '<strong>Bold</strong><em>Italics</em>';
    const out = sanitize(input, { allowTags: ['strong'] });
    // strong remains, em becomes text
    expect(out).toContain('<strong>Bold</strong>');
    expect(out).toContain('Italics');
    expect(out).not.toContain('<em>');
  });

  it('supports allowAttrs to restrict attributes', () => {
    const input = '<a href="/path" rel="noopener" target="_blank">link</a>';
    const out = sanitize(input, { allowAttrs: { a: ['href'], '*': [] } });
    expect(out).toContain('<a href="/path">link</a>');
    expect(out).not.toContain('rel=');
    expect(out).not.toContain('target=');
  });
});
