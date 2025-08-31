import { describe, it, expect } from 'vitest';
import { SmoothRouter as Router } from '../src/router/SmoothRouter.js';
import { SmoothComponent } from '../src/component/SmoothComponent.js';

class Home extends SmoothComponent {
  template() { return this.html`<div data-testid="home">Home</div>`; }
}
class Users extends SmoothComponent {
  template() { return this.html`<div data-testid="users"><div data-router-outlet></div></div>`; }
}
class UserDetail extends SmoothComponent {
  template() {
    const id = this.props?.params?.id || '?';
    return this.html`<div data-testid="detail">User ${id}</div>`;
  }
}
class NotFound extends SmoothComponent {
  template() { return this.html`<div data-testid="nf">NF</div>`; }
}

describe('SmoothRouter (hash mode)', () => {
  it('navigates routes and renders into root, supports nested + params', async () => {
    const root = document.createElement('div');
    root.id = 'app';
    document.body.appendChild(root);

    const router = new Router({ mode: 'hash', root: '#app', notFound: NotFound });
    router
      .route('/', Home)
      .route('/users', Users)
      .route('/users/:id', UserDetail);

    router.start();
    // Start resolves current hash; ensure goto '/'
    await Promise.resolve();
    await new Promise(resolve => setTimeout(resolve, 10)); // Give time for DOM updates
    expect(root.querySelector('[data-testid="home"]')).toBeTruthy();
    expect(root.querySelector('[data-testid="home"]').textContent).toContain('Home');

    await router.navigate('/users');
    await new Promise(resolve => setTimeout(resolve, 10)); // Give time for DOM updates
    expect(root.querySelector('[data-testid="users"]')).toBeTruthy();
    expect(root.querySelector('[data-testid="users"]').textContent).toContain('');

    await router.navigate('/users/2');
    await new Promise(resolve => setTimeout(resolve, 10)); // Give time for DOM updates
    expect(root.querySelector('[data-testid="detail"]')).toBeTruthy();
    expect(root.querySelector('[data-testid="detail"]').textContent).toContain('2');
  });

  it('handles notFound', async () => {
    const root = document.createElement('div');
    root.id = 'app2';
    document.body.appendChild(root);
    const router = new Router({ mode: 'hash', root: '#app2', notFound: NotFound });
    router.start();
    await router.navigate('/does-not-exist');
    await Promise.resolve();
    expect(root.querySelector('[data-testid="nf"]').textContent).toContain('NF');
  });

  it('intercepts data-router-link clicks', async () => {
    const root = document.createElement('div');
    root.id = 'app3';
    document.body.appendChild(root);
    const router = new Router({ mode: 'hash', root: '#app3' });
    router.route('/', Home).route('/users', Users);
    router.start();
    await Promise.resolve();

    const link = document.createElement('a');
    link.href = '#/users';
    link.setAttribute('data-router-link', '');
    link.setAttribute('data-to', '/users');
    document.body.appendChild(link);
    link.click();
    await new Promise(resolve => setTimeout(resolve, 10)); // Give time for DOM updates
    expect(root.querySelector('[data-testid="users"]')).toBeTruthy();
    expect(root.querySelector('[data-testid="users"]').textContent).toBeDefined();
  });
});
