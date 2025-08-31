import { describe, it, expect } from 'vitest';
import { SmoothRouter as Router } from '../src/router/SmoothRouter.js';
import { SmoothComponent } from '../src/component/SmoothComponent.js';

class Login extends SmoothComponent {
  template() { return this.html`<div data-testid="login">Login</div>`; }
}
class Private extends SmoothComponent {
  template() { return this.html`<div data-testid="private">Private</div>`; }
}

describe('Router guards and active link', () => {
  it('redirects when beforeEach returns a path string', async () => {
    const root = document.createElement('div');
    root.id = 'guard-root';
    document.body.appendChild(root);

    const router = new Router({ mode: 'hash', root: '#guard-root', beforeEach: (to) => {
      if (to === '/private') return '/login';
    }});

    router.route('/login', Login).route('/private', Private);

    await router.navigate('/private');
    // give DOM time
    await new Promise(r => setTimeout(r, 5));

    expect(router.currentPath).toBe('/login');
    expect(root.querySelector('[data-testid="login"]').textContent).toContain('Login');
  });

  it('applies custom active class from data-active-class', async () => {
    const root = document.createElement('div');
    root.id = 'active-root';
    document.body.appendChild(root);

    const router = new Router({ mode: 'hash', root: '#active-root' });
    router.route('/login', Login);

    // Build link element with custom active class
    const a = document.createElement('a');
    a.setAttribute('href', '#/login');
    a.setAttribute('data-router-link', '');
    a.setAttribute('data-to', '/login');
    a.setAttribute('data-active-class', 'is-active');
    document.body.appendChild(a);

    await router.navigate('/login');
    await new Promise(r => setTimeout(r, 5));

    expect(a.classList.contains('is-active')).toBe(true);
  });
});
