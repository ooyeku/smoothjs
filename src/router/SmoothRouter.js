export class SmoothRouter {
  constructor(options = {}) {
    this._routeTree = []; // array of top-level route nodes
    this.currentPath = null;
    this._listeners = [];
    this._navSubscribers = new Set();
    this._mountedInstances = []; // chain of mounted components for nested routes
    this.options = {
      mode: options.mode === 'hash' ? 'hash' : 'history',
      root: options.root || '#app',
      notFound: options.notFound || null,
      beforeEach: typeof options.beforeEach === 'function' ? options.beforeEach : null
    };
    this._root = this.options.root;

    if (typeof window !== 'undefined') {
      const popHandler = () => this._handleLocationChange();
      window.addEventListener('popstate', popHandler);
      this._listeners.push(['popstate', popHandler]);
      if (this.options.mode === 'hash') {
        const hashHandler = () => this._handleLocationChange();
        window.addEventListener('hashchange', hashHandler);
        this._listeners.push(['hashchange', hashHandler]);
      }
      // Delegate anchor clicks (same-origin) in history mode and data-router-link in all modes
      const clickHandler = (e) => {
        const linkEl = e.target.closest && e.target.closest('[data-router-link]');
        if (linkEl) {
          const to = linkEl.getAttribute('data-to');
          if (to) {
            e.preventDefault();
            this.navigate(to);
            return;
          }
        }
        if (this.options.mode === 'history') {
          const a = e.target.closest && e.target.closest('a[href^="/"]');
          if (!a || a.target === '_blank' || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
          e.preventDefault();
          this.navigate(a.getAttribute('href'));
        }
      };
      document.addEventListener('click', clickHandler);
      this._listeners.push(['click', clickHandler]);
    }
  }

  // Public: build a link string for use in templates
  link(to, label, { exact = false, activeClass = 'active', attrs = '' } = {}) {
    const href = this.options.mode === 'hash' ? `#${to}` : to;
    const isActive = this._isActive(to, { exact });
    const cls = isActive ? ` class="${activeClass}"` : '';
    const extra = attrs ? ' ' + attrs.trim() : '';
    return `<a href="${href}" data-router-link data-to="${to}" data-exact="${exact ? '1' : '0'}"${cls}${extra}>${label}</a>`;
  }

  _isActive(to, { exact = false } = {}) {
    if (!this.currentPath) return false;
    if (exact) return this.currentPath === to;
    return this.currentPath === to || this.currentPath.startsWith(to.endsWith('/') ? to : to + '/');
  }
  
  // Register a route. Supports component class, async loader, or node with children
  route(path, target) {
    const node = this._ensurePath(path);
    if (target && typeof target === 'object' && (target.component || target.load || target.children)) {
      if (target.component) node.component = target.component;
      if (typeof target.load === 'function') node.load = target.load;
      if (Array.isArray(target.children)) {
        target.children.forEach(child => {
          const childPath = child.path || '';
          const childNode = this._ensurePath(path + (path.endsWith('/') || !childPath ? '' : '/') + childPath);
          if (child.component) childNode.component = child.component;
          if (typeof child.load === 'function') childNode.load = child.load;
        });
      }
    } else {
      // simple component or loader function
      if (typeof target === 'function' && !target.prototype) {
        node.load = target; // async loader
      } else {
        node.component = target;
      }
    }
    return this;
  }

  _ensurePath(path) {
    const segments = this._splitPath(path);
    let level = this._routeTree;
    let node = null;
    for (const seg of segments) {
      let n = level.find(r => r.segment === seg);
      if (!n) {
        n = { segment: seg, children: [] };
        level.push(n);
      }
      node = n;
      level = n.children;
    }
    // Support index route when path is '/'
    if (!node && segments.length === 0) {
      node = { segment: '', children: [] };
      this._routeTree.push(node);
    }
    return node;
  }

  _splitPath(path) {
    if (!path || path === '/') return [];
    return path.replace(/^\//, '').split('/');
  }

  _resolvePath() {
    if (typeof window === 'undefined') return '/';
    if (this.options.mode === 'hash') {
      return window.location.hash.replace(/^#/, '') || '/';
    }
    return window.location.pathname || '/';
  }

  async navigate(path, navOptions = {}) {
    if (typeof window === 'undefined') return;

    const to = path || this._resolvePath();
    const from = this.currentPath;

    if (this.options.beforeEach) {
      const res = await this.options.beforeEach(to, from);
      if (res === false) return; // navigation canceled
    }

    // Unmount previously mounted chain
    this._mountedInstances.forEach(inst => {
      try { inst.unmount && inst.unmount(); } catch {}
    });
    this._mountedInstances = [];

    // Match route chain
    const match = await this._match(to);
    this.currentPath = to;

    if (match && match.chain.length) {
      await this._renderChain(match);
    } else if (this.options.notFound) {
      const NotFound = this.options.notFound;
      const inst = new NotFound();
      const mountTarget = (typeof this.options.root === 'string')
        ? (typeof document !== 'undefined' ? document.querySelector(this.options.root) : null)
        : this.options.root;
      inst.mount(mountTarget || this.options.root);
      this._mountedInstances = [inst];
    }

    // update URL
    if (navOptions.replace) {
      if (this.options.mode === 'hash') {
        const target = `#${to}`;
        if (window.location.hash !== target) window.location.hash = target; // avoid location.replace to prevent jsdom navigation
      } else if (window.location.pathname !== to) {
        history.replaceState(null, '', to);
      }
    } else {
      if (this.options.mode === 'hash') {
        const target = `#${to}`;
        if (window.location.hash !== target) window.location.hash = target;
      } else if (window.location.pathname !== to) {
        history.pushState(null, '', to);
      }
    }

    // notify subscribers for active links
    this._navSubscribers.forEach(cb => { try { cb(this.currentPath); } catch {} });
    this._updateActiveLinks();
  }

  async _match(path) {
    const segments = this._splitPath(path);
    const chain = [];
    const params = {};
    let nodes = this._routeTree;

    for (let i = 0; i <= segments.length; i++) {
      const seg = segments[i] || '';
      let matched = null;

      // Try static match first
      matched = nodes.find(n => n.segment === seg);
      // Try dynamic :param match
      if (!matched) {
        matched = nodes.find(n => typeof n.segment === 'string' && n.segment.startsWith(':'));
        if (matched && matched.segment.length > 1) {
          const key = matched.segment.slice(1);
          params[key] = seg || '';
        }
      }

      if (!matched) break;

      const comp = await this._ensureComponent(matched);
      chain.push({ node: matched, component: comp });

      nodes = matched.children || [];
    }

    return { chain, params };
  }

  async _ensureComponent(node) {
    if (node.component) return node.component;
    if (typeof node.load === 'function') {
      if (node._loaded) return node._loaded;
      const loaded = await node.load();
      // Support default export or constructor
      node._loaded = loaded && loaded.default ? loaded.default : loaded;
      return node._loaded;
    }
    return null;
  }

  async _renderChain(match) {
    const { chain, params } = match;
    // Resolve the initial mount target to an Element if a selector string was provided
    let mountTarget = (typeof this.options.root === 'string')
      ? (typeof document !== 'undefined' ? document.querySelector(this.options.root) : null)
      : this.options.root;
    // Defensive: if not found yet, try once more on next microtask before proceeding
    if (!mountTarget && typeof document !== 'undefined' && typeof this.options.root === 'string') {
      await Promise.resolve();
      mountTarget = document.querySelector(this.options.root);
      if (!mountTarget) {
        console.warn('Router: mount root not found:', this.options.root);
        return; // bail gracefully; caller may retry via start or subsequent navigation
      }
    }
    for (let i = 0; i < chain.length; i++) {
      const Comp = chain[i].component;
      if (!Comp) continue;
      const inst = new Comp();
      inst.mount(mountTarget || this.options.root, { props: { params } });
      this._mountedInstances.push(inst);
      // Find outlet for next component
      if (i < chain.length - 1) {
        const rootEl = mountTarget && mountTarget.querySelector ? mountTarget : (typeof document !== 'undefined' && typeof this.options.root === 'string' ? document.querySelector(this.options.root) : this.options.root);
        const outlet = rootEl && rootEl.querySelector ? rootEl.querySelector('[data-router-outlet]') : null;
        mountTarget = outlet || rootEl; // if no outlet, mount into same root
      }
    }
  }

  _handleLocationChange() {
    const path = this._resolvePath();
    if (path !== this.currentPath) this.navigate(path, { replace: true });
  }
  
  start() {
    this.navigate(this._resolvePath(), { replace: true });
  }

  onChange(cb) {
    if (typeof cb !== 'function') return () => {};
    this._navSubscribers.add(cb);
    return () => this._navSubscribers.delete(cb);
  }

  _updateActiveLinks() {
    if (typeof document === 'undefined') return;
    const links = Array.from(document.querySelectorAll('[data-router-link]'));
    links.forEach(a => {
      const to = a.getAttribute('data-to') || '';
      const exact = a.getAttribute('data-exact') === '1';
      const isActive = this._isActive(to, { exact });
      const activeClass = 'active';
      if (isActive) a.classList.add(activeClass); else a.classList.remove(activeClass);
      if (isActive) a.setAttribute('aria-current', exact ? 'page' : 'true'); else a.removeAttribute('aria-current');
    });
  }

  destroy() {
    if (typeof window === 'undefined') return;
    this._listeners.forEach(([event, handler]) => {
      if (event === 'click') document.removeEventListener(event, handler);
      else window.removeEventListener(event, handler);
    });
    this._listeners = [];
    this._navSubscribers.clear();
    this._mountedInstances.forEach(inst => { try { inst.unmount && inst.unmount(); } catch {} });
    this._mountedInstances = [];
  }
}
