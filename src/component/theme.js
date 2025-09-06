// Always-on base theming for SmoothJS (no public API change)
// - Injects a minimal base stylesheet with semantic CSS variables for light/dark
// - Boots theme before first render tick (as early as possible once this module loads)
// - Exposes a tiny SmoothTheme API on window for apps to opt-into controls

(function initTheme(){
  if (typeof document === 'undefined' || typeof window === 'undefined') return;
  try {
    // Avoid double init if already present (examples inject a boot script; Velvet may inject variables/styles)
    if (document.getElementById('smooth-base-theme')) return;

    // 1) Inject base stylesheet (variables + base layer + form controls)
    const css = `
      /* SmoothJS base theme */
      *,*::before,*::after{box-sizing:border-box}
      html,body{min-height:100%}
      :root,:root[data-theme="light"]{
        --surface:#f5f7fb;--surface-2:#ffffff;--surface-3:#ffffff;--text:#1f2937;--text-muted:#6b7280;--text-inverse:#0b1220;--border:#e5e7eb;--focus-ring:#60a5fa;--accent:#0ea5e9;--accent-contrast:#fff;--success:#10b981;--success-contrast:#052e16;--warning:#f59e0b;--warning-contrast:#451a03;--danger:#ef4444;--danger-contrast:#7f1d1d;--overlay:rgba(0,0,0,.30);--backdrop:rgba(0,0,0,.20);color-scheme:light
      }
      :root[data-theme="dark"],[data-theme="dark"]{
        --surface:#0b1220;--surface-2:#0f1a2b;--surface-3:#16243a;--text:#ffffff;--text-muted:#d1d5db;--text-inverse:#0b1220;--border:#3b4b63;--focus-ring:#60a5fa;--accent:#8dd9ff;--accent-contrast:#0b1220;--success:#10b981;--success-contrast:#052e16;--warning:#f59e0b;--warning-contrast:#451a03;--danger:#ef4444;--danger-contrast:#7f1d1d;--overlay:rgba(0,0,0,.60);--backdrop:rgba(0,0,0,.40);color-scheme:dark
      }
      html,body{background:var(--surface);color:var(--text)}
      :where(div,section,article,header,main,footer,aside,nav){background-color:transparent;color:inherit}
      :where(button,input,textarea,select){background:var(--surface-2);color:var(--text);border:1px solid var(--border)}
      :where(button){cursor:pointer}
      :where(input,textarea)::placeholder{color:var(--text-muted)}
      :where(input[type="checkbox"],input[type="radio"],progress){accent-color:var(--accent)}
      :where(:focus-visible){outline:2px solid var(--focus-ring);outline-offset:2px}
      ::selection{background:var(--accent);color:var(--accent-contrast)}
      body{scrollbar-color:var(--border) var(--surface)}
    `;
    const style = document.createElement('style');
    style.id = 'smooth-base-theme';
    style.setAttribute('data-smooth-theme', '1');
    style.textContent = css.replace(/\s+/g,' ').trim();
    // Insert before other styles when possible
    const head = document.head || document.getElementsByTagName('head')[0];
    head.insertBefore(style, head.firstChild || null);

    // 2) Theme boot logic (preference -> system -> default)
    const LS_KEY = 'smoothjs:theme';
    const doc = document.documentElement;
    const mql = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;

    function resolveMode(theme){
      if (theme === 'dark') return 'dark';
      if (theme === 'light') return 'light';
      return (mql && mql.matches) ? 'dark' : 'light';
    }

    function apply(theme, emit){
      const mode = resolveMode(theme);
      try { doc.setAttribute('data-theme', mode); } catch {}
      try { doc.style.colorScheme = (mode === 'dark' ? 'dark' : 'light'); } catch {}
      if (emit) {
        try { window.dispatchEvent(new CustomEvent('themechange', { detail: { theme, mode } })); } catch {}
      }
    }

    const saved = (()=>{ try { return localStorage.getItem(LS_KEY); } catch { return null; } })();
    apply(saved || 'auto', false);

    function onSystemChange(){
      const pref = (()=>{ try { return localStorage.getItem(LS_KEY); } catch { return null; } })();
      if (!pref) apply('auto', true);
    }

    // Bind/unbind system listener depending on explicit preference
    function bind(){ try { if (mql && mql.addEventListener) mql.addEventListener('change', onSystemChange); } catch {} }
    function unbind(){ try { if (mql && mql.removeEventListener) mql.removeEventListener('change', onSystemChange); } catch {} }

    if (saved) unbind(); else bind();

    // 3) Expose minimal API
    if (!window.SmoothTheme) window.SmoothTheme = {};
    window.SmoothTheme.getTheme = function(){ try { return localStorage.getItem(LS_KEY) || 'auto'; } catch { return 'auto'; } };
    window.SmoothTheme.setTheme = function(t){
      if (t === 'auto') { try { localStorage.removeItem(LS_KEY); } catch {} apply('auto', true); bind(); return; }
      try { localStorage.setItem(LS_KEY, t); } catch {}
      apply(t, true); unbind();
    };
    window.SmoothTheme.onThemeChange = function(cb){ if (typeof cb === 'function'){ window.addEventListener('themechange', cb); return function(){ window.removeEventListener('themechange', cb); }; } return function(){} };
  } catch {}
})();

export {};