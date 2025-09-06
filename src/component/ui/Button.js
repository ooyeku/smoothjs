import { defineComponent, Velvet } from '../../../index.js';


export const Button = defineComponent((ctx) => {
  const { html } = ctx;
  const { vs } = Velvet.useVelvet(ctx);

  function getVariantClass(variant = 'primary', size = 'md') {
    // Prefer Velvet recipe if available (note: useVelvet returns just vs(style), so we fallback here)
    return vs({
      base:
        variant === 'primary' ? {
          backgroundColor: '#0ea5e9', color: 'white', borderRadius: '8px', border: '1px solid #0ea5e9',
          padding: size === 'sm' ? '0.5rem 0.8rem' : size === 'lg' ? '1rem 1.5rem' : '0.75rem 1rem',
          fontSize: size === 'sm' ? '0.875rem' : size === 'lg' ? '1.025rem' : '1rem', cursor: 'pointer', transition: 'all 200ms ease'
        }
      : variant === 'secondary' ? {
          backgroundColor: 'transparent', color: '#0ea5e9', borderRadius: '8px', border: '1px solid #0ea5e9',
          padding: size === 'sm' ? '0.5rem 0.8rem' : size === 'lg' ? '1rem 1.5rem' : '0.75rem 1rem', cursor: 'pointer'
        }
      : variant === 'ghost' ? {
          backgroundColor: 'transparent', color: 'var(--text)', border: '1px solid var(--border)', borderRadius: '8px',
          padding: size === 'sm' ? '0.5rem 0.8rem' : size === 'lg' ? '1rem 1.5rem' : '0.75rem 1rem', cursor: 'pointer'
        }
      : {
          backgroundColor: '#ef4444', color: 'white', borderRadius: '8px', border: '1px solid #ef4444',
          padding: size === 'sm' ? '0.5rem 0.8rem' : size === 'lg' ? '1rem 1.5rem' : '0.75rem 1rem', cursor: 'pointer'
        },
      hover:
        variant === 'primary' ? { backgroundColor: '#0284c7', borderColor: '#0284c7' }
      : variant === 'secondary' ? { backgroundColor: 'rgba(14,165,233,.08)' }
      : variant === 'ghost' ? { backgroundColor: 'var(--surface-2)' }
      : { backgroundColor: '#dc2626', borderColor: '#dc2626' },
      active: { transform: 'translateY(0.5px)' },
      dark: variant === 'primary' ? { background: '#0284c7', border: '1px solid #0284c7' } : {}
    });
  }

  function getClass({ variant = 'primary', size = 'md', fullWidth = false, styles } = {}) {
    const base = vs({ base: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', width: fullWidth ? '100%' : 'auto', position: 'relative', userSelect: 'none' } });
    const recipe = getVariantClass(variant, size);
    const override = styles && typeof styles === 'object' ? vs(styles) : '';
    return [base, recipe, override].filter(Boolean).join(' ');
  }

  const render = () => {
    const p = ctx.props || {};
    const {
      variant = 'primary', size = 'md', loading = false, disabled = false, fullWidth = false,
      leftIcon = null, rightIcon = null, type = 'button', ariaLabel = null
    } = p;

    const cls = getClass({ variant, size, fullWidth, styles: p.styles });
    const stateCls = (disabled || loading) ? vs({ base: { opacity: 0.6, pointerEvents: 'none' } }) : '';
    const spin = vs({ base: { animation: 'spin 1s linear infinite', border: '2px solid var(--border)', borderTopColor: 'transparent', width: '1em', height: '1em', borderRadius: '9999px' } });
    const merged = [cls, stateCls, p.class || ''].join(' ').trim();

    const content = ctx.children && ctx.children.length ? ctx.children.join('') : (typeof p.children === 'string' ? p.children : 'Button');

    return html`
      <button
        type="${type}"
        class="${merged}"
        aria-busy="${loading || false}"
        aria-label="${ariaLabel || ''}"
        ${disabled || loading ? 'disabled' : ''}
        onclick=${p.onClick}
      >
        ${leftIcon ? html`<span aria-hidden="true">${leftIcon}</span>` : ''}
        ${loading ? html`<span class="${spin}"></span>` : ''}
        ${content}
        ${rightIcon ? html`<span aria-hidden="true">${rightIcon}</span>` : ''}
      </button>
    `;
  };

  // expose recipe for customization if needed
  render.getClass = getClass;

  return { render };
});

export default Button;
