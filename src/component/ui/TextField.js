import { defineComponent } from '../../functional/defineComponent.js';
import { useVelvet } from '../../design-system/index.js';
import {Velvet} from "../../../index.js";


export const TextField = defineComponent((ctx) => {
  const { html, useRef } = ctx;
  const { vs } = Velvet.useVelvet(ctx);
  const idRef = useRef(null);
  if (!idRef.current) idRef.current = `tf-${Math.random().toString(36).slice(2)}`;

  const render = () => {
    const p = ctx.props || {};
    const id = p.id || idRef.current;
    const {
      label, placeholder, value = '', type = 'text', error, helperText,
      disabled = false, required = false, name, leading, trailing
    } = p;

    const rootCls = vs({ base: { display: 'flex', flexDirection: 'column', gap: '0.375rem' } });
    const labelCls = vs({ base: { fontSize: '0.875rem', color: 'var(--text)' } });
    const fieldWrap = vs({ base: { position: 'relative', display: 'flex', alignItems: 'center' } });

    const inputBase = vs({ base: { width: '100%', padding: '.55rem .7rem', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '14px', background: 'var(--surface-2)', color: 'var(--text)' }, focus: { outline: 'none', borderColor: '#0ea5e9', boxShadow: '0 0 0 3px rgba(14,165,233,.2)' } });
    const inputState = error ? vs({ base: { borderColor: 'var(--danger)' }, focus: { boxShadow: '0 0 0 3px rgba(239, 68, 68, 0.15)' } }) : '';
    const leadingCls = vs({ base: { position: 'absolute', left: '0.75rem', color: 'var(--text-muted)' } });
    const trailingCls = vs({ base: { position: 'absolute', right: '0.75rem', color: 'var(--text-muted)' } });
    const inputPaddingAdjust = vs({ base: { paddingLeft: leading ? '2.25rem' : undefined, paddingRight: trailing ? '2.25rem' : undefined } });
    const helperCls = vs({ base: { fontSize: '0.75rem', color: error ? 'var(--danger)' : 'var(--text-muted)' } });

    const describedBy = helperText ? `${id}-help` : undefined;
    const mergedRoot = [rootCls, p.class || ''].join(' ').trim();

    const oninput = (e) => { try { p.onInput && p.onInput(e.target.value, e); } catch {} };
    const onchange = (e) => { try { p.onChange && p.onChange(e.target.value, e); } catch {} };

    return html`
      <div class="${mergedRoot}">
        ${label ? html`<label for="${id}" class="${labelCls}">${label}${required ? ' *' : ''}</label>` : ''}
        <div class="${fieldWrap}">
          ${leading ? html`<span class="${leadingCls}">${leading}</span>` : ''}
          <input
            id="${id}"
            name="${name || id}"
            type="${type}"
            class="${[inputBase, inputState, inputPaddingAdjust, p.styles ? vs(p.styles) : ''].join(' ').trim()}"
            placeholder="${placeholder || ''}"
            value="${value}"
            aria-invalid="${!!error}"
            aria-required="${!!required}"
            aria-describedby="${describedBy || ''}"
            ${disabled ? 'disabled' : ''}
            oninput=${oninput}
            onchange=${onchange}
            onblur=${p.onBlur}
            onfocus=${p.onFocus}
          />
          ${trailing ? html`<span class="${trailingCls}">${trailing}</span>` : ''}
        </div>
        ${helperText ? html`<div id="${describedBy}" class="${helperCls}">${helperText}</div>` : ''}
      </div>
    `;
  };

  return { render };
});

export default TextField;
