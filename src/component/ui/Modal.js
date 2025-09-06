import { defineComponent } from '../../functional/defineComponent.js';
import { useVelvet } from '../../design-system/index.js';
import * as A11y from '../../a11y/index.js';


export const Modal = defineComponent((ctx) => {
  const { html, useEffect } = ctx;
  const { vs } = useVelvet(ctx);

  function widthToCSS(w) {
    if (w === 'sm') return '24rem';
    if (w === 'md') return '32rem';
    if (w === 'lg') return '42rem';
    if (typeof w === 'number') return `${w}px`;
    return String(w || '32rem');
  }

  // Focus trap while open
  useEffect(() => {
    if (!ctx.props.open) return;
    try {
      const cleanup = A11y && typeof A11y.focusTrap === 'function' ? A11y.focusTrap('.smooth-modal-panel') : null;
      return () => { if (typeof cleanup === 'function') cleanup(); };
    } catch {}
  }, [() => ctx.props.open]);

  let _dispose = null;
  const onMount = () => {
    const onKey = (e) => { if (ctx.props.open && e.key === 'Escape') { try { ctx.props.onClose && ctx.props.onClose(); } catch {} } };
    try { window.addEventListener('keydown', onKey); } catch {}
    _dispose = () => { try { window.removeEventListener('keydown', onKey); } catch {} };
    if (ctx.props.open) {
      try { document.body.style.overflow = 'hidden'; } catch {}
    }
  };

  const onUnmount = () => {
    if (_dispose) { try { _dispose(); } catch {} }
    try { document.body.style.overflow = ''; } catch {}
  };

  const onPropsChange = (prev, next) => {
    if (!!prev.open !== !!next.open) {
      try { document.body.style.overflow = next.open ? 'hidden' : ''; } catch {}
    }
  };

  const render = () => {
    const p = ctx.props || {};
    if (!p.open) return null;

    const overlayCls = vs({ base: { position: 'fixed', inset: 0, background: 'var(--overlay)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 } });
    const panelCls = vs({ base: { width: '100%', maxWidth: widthToCSS(p.width), background: 'var(--surface-2)', color: 'var(--text)', borderRadius: '12px', border: '1px solid var(--border)', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)', padding: '1rem', transform: 'translateY(8px)', opacity: 0, animation: 'slideIn 200ms ease forwards' }, dark: { background: 'var(--surface-3)' } });
    const headerCls = vs({ base: { fontWeight: 600, fontSize: '1.125rem', marginBottom: '0.5rem' } });
    const bodyCls = vs({ base: { marginTop: '0.25rem' } });
    const footerCls = vs({ base: { marginTop: '1rem', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' } });

    const onOverlayClick = (e) => {
      const allow = p.closeOnOverlay !== false;
      if (allow && e.target === e.currentTarget) { try { p.onClose && p.onClose(); } catch {} }
    };

    const titleId = 'modal-title';
    const header = p.header ? p.header : (p.title ? html`<div id="${titleId}" class="${headerCls}">${p.title}</div>` : '');
    const body = ctx.children && ctx.children.length ? ctx.children.join('') : '';
    const footer = p.footer ? html`<div class="${footerCls}">${typeof p.footer === 'function' ? p.footer() : p.footer}</div>` : '';

    return html`
      <div class="${overlayCls}" role="dialog" aria-modal="true" aria-labelledby="${p.title ? titleId : ''}" aria-describedby="${p.ariaDescribedBy || ''}" onclick=${onOverlayClick}>
        <div class="${panelCls} smooth-modal-panel">
          ${header}
          <div class="${bodyCls}">${body}</div>
          ${footer}
        </div>
      </div>
    `;
  };

  return { render, onMount, onUnmount, onPropsChange };
});

export default Modal;
