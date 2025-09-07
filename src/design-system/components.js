import { VelvetComponent } from './VelvetComponent.js';
import { focusTrap } from '../a11y/index.js';

// Button Component
export class VButton extends VelvetComponent {
  static defaultProps = {
    variant: 'primary', // primary, secondary, ghost, danger
    size: 'md', // sm, md, lg
    loading: false,
    disabled: false,
    fullWidth: false,
    onClick: null,
    ripple: true,
    type: 'button', // 'button' | 'submit' | 'reset'
    startIcon: null,
    endIcon: null,
    loadingText: 'Loading',
    ariaLabel: null,
    href: null,      // if provided and not disabled/loading, render as link
    target: null,
    rel: null
  };
  
  constructor(element, initialState, props) {
    super(element, initialState, { ...VButton.defaultProps, ...props });
  }
  
  onCreate() {
    // Unified click handler for <button> and anchor-as-button
    this.on('click', 'button, a[role="button"]', (e) => {
      const isDisabled = this.props.disabled || this.props.loading;
      if (isDisabled) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }
      if (this.props.ripple) {
        this.ripple(e);
      }
      if (typeof this.props.onClick === 'function') {
        this.props.onClick(e);
      }
    });
    // Keyboard activation for anchor with role="button"
    this.on('keydown', 'a[role="button"]', (e) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        try { e.currentTarget.click(); } catch {}
      }
    });
  }
  
  template() {
    const {
      variant,
      size,
      loading,
      disabled,
      fullWidth,
      children,
      type,
      startIcon,
      endIcon,
      loadingText,
      ariaLabel,
      href,
      target,
      rel
    } = this.props;
    const buttonClass = this.v.button(variant, size);
    const additionalStyles = fullWidth ? { width: '100%' } : {};
    const isDisabled = !!(disabled || loading);
    const commonAttrs = `
      class="${buttonClass} ${loading ? 'opacity-75' : ''}"
      style="${Object.entries(additionalStyles).map(([k, v]) => `${k}: ${v}`).join('; ')}"
      data-variant="${variant}"
      data-size="${size}"
      data-state="${loading ? 'loading' : (disabled ? 'disabled' : 'ready')}"
      aria-busy="${loading ? 'true' : 'false'}"
      ${ariaLabel ? `aria-label="${ariaLabel}"` : ''}
    `;
    const content = loading
      ? this.html`${this.renderSpinner()}<span style="${this._srOnlyStyle()}">${loadingText || 'Loading'}</span>`
      : this.html`
          ${startIcon ? this._renderInlineIcon(startIcon) : ''}
          <span>${children || 'Button'}</span>
          ${endIcon ? this._renderInlineIcon(endIcon) : ''}
        `;
    
    // Prefer anchor when href is provided AND not disabled/loading
    if (href && !isDisabled) {
      const safeRel = target === '_blank'
        ? (rel ? rel : 'noopener noreferrer')
        : (rel || '');
      return this.html`
        <a
          ${commonAttrs}
          href="${href}"
          ${target ? `target="${target}"` : ''}
          ${safeRel ? `rel="${safeRel}"` : ''}
          role="button"
          aria-disabled="false"
        >${content}</a>
      `;
    }

    return this.html`
      <button 
        ${commonAttrs}
        type="${type || 'button'}"
        ${isDisabled ? 'disabled' : ''}
        aria-disabled="${isDisabled ? 'true' : 'false'}"
      >
        ${content}
      </button>
    `;
  }
  
  renderSpinner() {
    const spinnerClass = this.vs({
      base: {
        display: 'inline-block',
        width: '1em',
        height: '1em',
        border: '2px solid transparent',
        borderTopColor: 'currentColor',
        borderRadius: '50%',
        animation: 'spin 0.6s linear infinite'
      }
    });
    
    return this.html`<span class="${spinnerClass}" aria-hidden="true"></span>`;
  }

  _srOnlyStyle() {
    return [
      'position:absolute',
      'width:1px',
      'height:1px',
      'padding:0',
      'margin:-1px',
      'overflow:hidden',
      'clip:rect(0,0,0,0)',
      'white-space:nowrap',
      'border:0'
    ].join(';');
  }

  _renderInlineIcon(icon) {
    // Accepts string, HTMLElement, or template
    const wrapStyle = this.vs({
      base: { display: 'inline-flex', alignItems: 'center' }
    });
    return this.html`<span class="${wrapStyle}" aria-hidden="true">${icon}</span>`;
  }
}

// Card Component
export class VCard extends VelvetComponent {
  static defaultProps = {
    elevated: false,
    interactive: false,
    padding: 'md',
    onClick: null
  };
  
  constructor(element, initialState, props) {
    super(element, initialState, { ...VCard.defaultProps, ...props });
  }
  
  onCreate() {
    if (this.props.onClick && this.props.interactive) {
      this.on('click', '.card', this.props.onClick);
    }
  }
  
  template() {
    const { elevated, interactive, padding, children } = this.props;
    const paddingMap = {
      sm: this.theme.spacing[4],
      md: this.theme.spacing[6],
      lg: this.theme.spacing[8]
    };
    
    const cardStyle = {
      base: {
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: paddingMap[padding] || paddingMap.md,
        transition: 'all 250ms ease',
        ...(elevated ? {
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)'
        } : {
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)'
        })
      },
      ...(interactive && {
        hover: {
          transform: 'translateY(-2px)',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.15)',
          cursor: 'pointer'
        }
      }),
      dark: {
        backgroundColor: '#27272a',
        color: '#fafafa'
      }
    };
    
    return this.html`
      <div class="card ${this.vs(cardStyle)}">
        ${children || ''}
      </div>
    `;
  }
}

// Input Component
export class VInput extends VelvetComponent {
  static defaultProps = {
    type: 'text',
    size: 'md',
    error: false,           // boolean | string
    helperText: '',         // non-error guidance text
    icon: null,             // deprecated: prefer startIcon/endIcon
    startIcon: null,
    endIcon: null,
    placeholder: '',
    value: '',
    name: '',
    id: null,
    labelId: null,          // id of external label element (if any)
    required: false,
    disabled: false,
    readOnly: false,
    autoComplete: null,     // allow override
    inputMode: null,        // allow override
    maxLength: null,
    minLength: null,
    min: null,
    max: null,
    step: null,
    fullWidth: true,
    clearable: false,       // show clear button (text-like types)
    showPasswordToggle: true, // for type="password"
    loading: false,         // show inline spinner and aria-busy
    onChange: null,
    onInput: null,
    onClear: null,
    validate: null          // (value) => string | false
  };
  
  constructor(element, initialState, props) {
    super(element, initialState, { ...VInput.defaultProps, ...props });
  }
  
  onCreate() {
    // Robust event binding; guard-calls to user handlers if provided
    this.on('input', 'input', (e) => {
      // Avoid emitting during IME composition
      if (e.isComposing) return;
      if (typeof this.props.onInput === 'function') {
        this.props.onInput(e);
      }
      this._runValidation(e.currentTarget?.value ?? '');
    });
    this.on('change', 'input', (e) => {
      if (e.isComposing) return;
      if (typeof this.props.onChange === 'function') {
        this.props.onChange(e);
      }
      this._runValidation(e.currentTarget?.value ?? '');
    });
    // Clear button
    this.on('click', '.vinput-clear', (e) => {
      const input = this._getInput();
      if (!input || input.disabled || input.readOnly) return;
      input.value = '';
      input.dispatchEvent(new Event('input', { bubbles: true }));
      if (typeof this.props.onClear === 'function') {
        try { this.props.onClear(); } catch {}
      }
      input.focus();
    });
    // Password toggle
    this.on('click', '.vinput-toggle', (e) => {
      const input = this._getInput();
      if (!input) return;
      const isPassword = input.getAttribute('type') === 'password';
      input.setAttribute('type', isPassword ? 'text' : 'password');
      e.currentTarget.setAttribute('aria-pressed', isPassword ? 'true' : 'false');
      input.focus({ preventScroll: true });
    });
    // Keyboard support for interactive adornments
    this.on('keydown', '.vinput-clear, .vinput-toggle', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        try { e.currentTarget.click(); } catch {}
      }
    });
  }
  
  // Public helpers
  focus() { this._getInput()?.focus(); }
  blur() { this._getInput()?.blur(); }
  select() { this._getInput()?.select?.(); }

  _getInput() {
    return this.element?.querySelector('input');
  }

  _runValidation(value) {
    if (typeof this.props.validate === 'function') {
      let msg = '';
      try { msg = this.props.validate(value) || ''; } catch {}
      if (typeof msg === 'string' && msg) {
        // Set error message via a prop/state bridge if your system supports it
        // Here we just trigger a re-render with transient state
        this.setState({ _err: msg });
      } else if (this.state?._err) {
        this.setState({ _err: '' });
      }
    }
  }
  
  template() {
    const {
      type,
      size,
      error,
      helperText,
      icon,
      startIcon,
      endIcon,
      placeholder,
      value,
      name,
      id,
      labelId,
      required,
      disabled,
      readOnly,
      autoComplete,
      inputMode,
      maxLength,
      minLength,
      min,
      max,
      step,
      fullWidth,
      clearable,
      showPasswordToggle,
      loading
    } = this.props;

    const sizeMap = {
      sm: { padding: '0.5rem 0.75rem', fontSize: '0.875rem' },
      md: { padding: '0.75rem 1rem', fontSize: '1rem' },
      lg: { padding: '1rem 1.25rem', fontSize: '1.125rem' }
    };
    
    const inputStyle = {
      base: {
        width: fullWidth ? '100%' : 'auto',
        ...sizeMap[size],
        lineHeight: '1.5',
        color: '#18181b',
        backgroundColor: 'white',
        border: '1px solid',
        borderColor: (error || this.state?._err) ? '#ef4444' : '#d4d4d8',
        borderRadius: '8px',
        transition: 'all 250ms ease',
        outline: 'none',
        paddingLeft: (icon || startIcon) ? '2.5rem' : sizeMap[size].padding.split(' ')[1],
        paddingRight: (endIcon || clearable || (type === 'password' && showPasswordToggle) || loading) ? '2.5rem' : sizeMap[size].padding.split(' ')[1],
        opacity: disabled ? '0.6' : '1'
      },
      focus: {},
      focusVisible: {
        borderColor: (error || this.state?._err) ? '#ef4444' : '#0ea5e9',
        boxShadow: (error || this.state?._err)
          ? '0 0 0 3px rgba(239, 68, 68, 0.1)'
          : '0 0 0 3px rgba(14, 165, 233, 0.15)'
      },
      dark: {
        backgroundColor: '#18181b',
        color: '#fafafa',
        borderColor: (error || this.state?._err) ? '#ef4444' : '#52525b'
      }
    };
    
    const wrapperStyle = {
      base: {
        position: 'relative',
        width: fullWidth ? '100%' : 'auto'
      }
    };

    // Derive a11y attributes
    const inputId = id || `vinput-${Math.random().toString(36).slice(2, 8)}`;
    const helperId = helperText ? `${inputId}-help` : '';
    const errorMsg = typeof error === 'string' ? error : (this.state?._err || '');
    const errorId = (errorMsg) ? `${inputId}-error` : '';
    const describedBy = [helperId, errorId].filter(Boolean).join(' ') || null;
    const ariaAutoComplete = autoComplete ?? this._inferAutocomplete(type);
    const ariaInputMode = inputMode ?? this._inferInputMode(type);

    return this.html`
      <div class="${this.vs(wrapperStyle)}">
        ${(icon || startIcon) ? this.renderIcon(startIcon || icon, 'start') : ''}
        ${(endIcon && !(clearable || (type === 'password' && showPasswordToggle) || loading)) ? this.renderIcon(endIcon, 'end') : ''}

        <input
          id="${inputId}"
          name="${name || ''}"
          type="${type}"
          class="${this.vs(inputStyle)}"
          placeholder="${placeholder}"
          value="${value}"
          ${required ? 'required' : ''}
          ${disabled ? 'disabled' : ''}
          ${readOnly ? 'readonly' : ''}
          ${maxLength != null ? `maxlength="${maxLength}"` : ''}
          ${minLength != null ? `minlength="${minLength}"` : ''}
          ${min != null ? `min="${min}"` : ''}
          ${max != null ? `max="${max}"` : ''}
          ${step != null ? `step="${step}"` : ''}
          ${ariaAutoComplete ? `autocomplete="${ariaAutoComplete}"` : ''}
          ${ariaInputMode ? `inputmode="${ariaInputMode}"` : ''}
          ${labelId ? `aria-labelledby="${labelId}"` : ''}
          ${describedBy ? `aria-describedby="${describedBy}"` : ''}
          aria-invalid="${(error || this.state?._err) ? 'true' : 'false'}"
          aria-errormessage="${errorId || ''}"
          aria-busy="${loading ? 'true' : 'false'}"
          spellcheck="${this._inferSpellcheck(type)}"
        />

        ${clearable && this._isClearableType(type) ? this._renderClear(inputId) : ''}
        ${(type === 'password' && showPasswordToggle) ? this._renderPasswordToggle() : ''}
        ${loading ? this._renderEndSpinner() : ''}

        ${helperText ? this.renderHelper(helperText, helperId) : ''}
        ${(errorMsg) ? this.renderError(errorMsg, errorId) : ''}
      </div>
    `;
  }
  
  renderIcon(icon, slot = 'start') {
    const pos = slot === 'end' ? { right: '0.75rem' } : { left: '0.75rem' };
    const iconStyle = {
      base: {
        position: 'absolute',
        top: '50%',
        transform: 'translateY(-50%)',
        color: '#71717a',
        pointerEvents: 'none',
        ...pos
      }
    };
    return this.html`<span class="${this.vs(iconStyle)}" aria-hidden="true">${icon}</span>`;
  }
  
  renderHelper(message, id) {
    const helperStyle = {
      base: {
        marginTop: '0.25rem',
        fontSize: '0.875rem',
        color: '#52525b'
      },
      dark: { color: '#a1a1aa' }
    };
    return this.html`<p id="${id}" class="${this.vs(helperStyle)}">${message}</p>`;
  }

  renderError(message, id) {
    const errorStyle = {
      base: {
        marginTop: '0.25rem',
        fontSize: '0.875rem',
        color: '#ef4444'
      }
    };
    return this.html`<p id="${id}" class="${this.vs(errorStyle)}" role="status" aria-live="polite">${message}</p>`;
  }

  _renderClear(forId) {
    const btnStyle = this.vs({
      base: {
        position: 'absolute',
        right: '0.375rem',
        top: '50%',
        transform: 'translateY(-50%)',
        border: 'none',
        background: 'transparent',
        cursor: 'pointer',
        padding: '0.25rem',
        borderRadius: '6px',
        color: '#71717a'
      },
      hover: { backgroundColor: 'rgba(0,0,0,0.05)' },
      dark: { color: '#a1a1aa' }
    });
    return this.html`<button type="button" class="vinput-clear ${btnStyle}" aria-label="Clear input" tabindex="0" ${forId ? `aria-controls="${forId}"` : ''}>×</button>`;
  }

  _renderPasswordToggle() {
    const btnStyle = this.vs({
      base: {
        position: 'absolute',
        right: '0.375rem',
        top: '50%',
        transform: 'translateY(-50%)',
        border: 'none',
        background: 'transparent',
        cursor: 'pointer',
        padding: '0.25rem',
        borderRadius: '6px',
        color: '#71717a'
      },
      hover: { backgroundColor: 'rgba(0,0,0,0.05)' },
      dark: { color: '#a1a1aa' }
    });
    return this.html`<button type="button" class="vinput-toggle ${btnStyle}" aria-label="Show password" aria-pressed="false" tabindex="0">👁</button>`;
  }

  _renderEndSpinner() {
    const spinnerClass = this.vs({
      base: {
        position: 'absolute',
        right: '0.75rem',
        top: '50%',
        transform: 'translateY(-50%)',
        display: 'inline-block',
        width: '1em',
        height: '1em',
        border: '2px solid transparent',
        borderTopColor: 'currentColor',
        borderRadius: '50%',
        animation: 'spin 0.6s linear infinite',
        color: '#71717a'
      }
    });
    return this.html`<span class="${spinnerClass}" aria-hidden="true"></span>`;
  }

  _isClearableType(type) {
    return ['text', 'search', 'email', 'tel', 'url'].includes(type);
  }

  _inferInputMode(type) {
    switch (type) {
      case 'email': return 'email';
      case 'tel': return 'tel';
      case 'url': return 'url';
      case 'number': return 'decimal';
      default: return null;
    }
  }

  _inferAutocomplete(type) {
    // Provide sensible defaults; can be overridden by prop
    switch (type) {
      case 'email': return 'email';
      case 'password': return 'current-password';
      case 'tel': return 'tel';
      case 'url': return 'url';
      case 'name': return 'name';
      default: return 'on';
    }
  }

  _inferSpellcheck(type) {
    return (type === 'password' || type === 'email' || type === 'url' || type === 'number') ? 'false' : 'true';
  }
}

// Container Component
export class VContainer extends VelvetComponent {
  static defaultProps = {
    maxWidth: 'lg', // sm, md, lg, xl, 2xl, full
    centered: true,
    padding: true
  };
  
  constructor(element, initialState, props) {
    super(element, initialState, { ...VContainer.defaultProps, ...props });
  }
  
  template() {
    const { maxWidth, centered, padding, children } = this.props;
    
    const widths = {
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px',
      full: '100%'
    };
    
    const containerStyle = {
      base: {
        width: '100%',
        maxWidth: widths[maxWidth] || widths.lg,
        ...(centered && { margin: '0 auto' }),
        ...(padding && { padding: '0 1rem' })
      },
      responsive: padding ? {
        md: { padding: '0 1.5rem' },
        lg: { padding: '0 2rem' }
      } : {}
    };
    
    return this.html`
      <div class="${this.vs(containerStyle)}">
        ${children || ''}
      </div>
    `;
  }
}

// Toast Component
export class VToast extends VelvetComponent {
  static defaultProps = {
    type: 'info', // success, warning, error, info
    message: '',
    duration: 3000,
    position: 'bottom-right',
    onDismiss: null
  };
  
  constructor(element, initialState, props) {
    super(element, initialState, { ...VToast.defaultProps, ...props });
  }
  
  onCreate() {
    if (this.props.duration > 0) {
      this.timeout = setTimeout(() => this.dismiss(), this.props.duration);
    }
    
    this.on('click', '.dismiss', () => this.dismiss());
  }
  
  onUnmount() {
    if (this.timeout) {
      clearTimeout(this.timeout);
    }
  }
  
  dismiss() {
    if (this.props.onDismiss) {
      this.props.onDismiss();
    }
    this.element?.remove();
  }
  
  template() {
    const { type, message } = this.props;
    
    const colors = {
      success: { bg: '#10b981', icon: '✓' },
      warning: { bg: '#f59e0b', icon: '⚠' },
      error: { bg: '#ef4444', icon: '✕' },
      info: { bg: '#3b82f6', icon: 'ℹ' }
    };
    
    const toastStyle = {
      base: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        padding: '1rem 1.25rem',
        backgroundColor: colors[type].bg,
        color: 'white',
        borderRadius: '8px',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
        animation: 'slideIn 300ms ease-out',
        minWidth: '300px',
        maxWidth: '500px'
      }
    };
    
    const iconStyle = {
      base: {
        fontSize: '1.25rem',
        flexShrink: '0'
      }
    };
    
    const dismissStyle = {
      base: {
        marginLeft: 'auto',
        cursor: 'pointer',
        fontSize: '1.25rem',
        opacity: '0.8',
        transition: 'opacity 150ms ease'
      },
      hover: {
        opacity: '1'
      }
    };
    
    return this.html`
      <div class="${this.vs(toastStyle)}">
        <span class="${this.vs(iconStyle)}">${colors[type].icon}</span>
        <span style="flex: 1">${message}</span>
        <span class="dismiss ${this.vs(dismissStyle)}">×</span>
      </div>
    `;
  }
}

// Modal Component
export class VModal extends VelvetComponent {
  static defaultProps = {
    open: false,
    title: '',
    onClose: null,
    closeOnOverlay: true,
    maxWidth: 'md'
  };
  
  constructor(element, initialState, props) {
    super(element, initialState, { ...VModal.defaultProps, ...props });
  }
  
  onCreate() {
    if (this.props.closeOnOverlay) {
      this.on('click', '.overlay', (e) => {
        if (e.target.classList.contains('overlay')) {
          this.close();
        }
      });
    }
    
    this.on('click', '.close-btn', () => this.close());
  }
  
  onStateChange(prev, next) {
    // Manage focus trap based on open state
    if (next.open && !this._trapCleanup && this.element) {
      const dlg = this.element.querySelector('[role="dialog"]');
      if (dlg) this._trapCleanup = focusTrap(dlg);
    }
    if (!next.open && this._trapCleanup) {
      try { this._trapCleanup(); } catch {}
      this._trapCleanup = null;
    }
  }

  onUnmount() {
    if (this._trapCleanup) {
      try { this._trapCleanup(); } catch {}
      this._trapCleanup = null;
    }
  }
  
  onPropsChange(prev, next) {
    // also react to external prop changes
    if (next && typeof next.open !== 'undefined') {
      const willOpen = !!next.open;
      if (willOpen && !this._trapCleanup && this.element) {
        const dlg = this.element.querySelector('[role="dialog"]');
        if (dlg) this._trapCleanup = focusTrap(dlg);
      }
      if (!willOpen && this._trapCleanup) {
        try { this._trapCleanup(); } catch {}
        this._trapCleanup = null;
      }
    }
  }

  close() {
    if (this.props.onClose) {
      this.props.onClose();
    }
  }
  
  template() {
    const { open, title, children, maxWidth } = this.props;
    
    if (!open) {
      return this.html``;
    }
    
    const widths = {
      sm: '480px',
      md: '640px',
      lg: '768px',
      xl: '1024px',
      full: '100%'
    };
    
    const overlayStyle = {
      base: {
        position: 'fixed',
        inset: '0',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        zIndex: '1040',
        animation: 'fadeIn 200ms ease-out'
      }
    };
    
    const modalStyle = {
      base: {
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        width: '100%',
        maxWidth: widths[maxWidth] || widths.md,
        maxHeight: '90vh',
        overflow: 'auto',
        animation: 'scaleIn 200ms ease-out'
      },
      dark: {
        backgroundColor: '#27272a',
        color: '#fafafa'
      }
    };
    
    const headerStyle = {
      base: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '1.5rem',
        borderBottom: '1px solid #e4e4e7'
      },
      dark: {
        borderBottomColor: '#52525b'
      }
    };
    
    const titleStyle = {
      base: {
        fontSize: '1.25rem',
        fontWeight: '600',
        margin: '0'
      }
    };
    
    const closeStyle = {
      base: {
        fontSize: '1.5rem',
        cursor: 'pointer',
        opacity: '0.6',
        transition: 'opacity 150ms ease'
      },
      hover: {
        opacity: '1'
      }
    };
    
    const bodyStyle = {
      base: {
        padding: '1.5rem'
      }
    };
    
    return this.html`
      <div class="overlay ${this.vs(overlayStyle)}">
        <div class="${this.vs(modalStyle)}" role="dialog" aria-modal="true" ${title ? 'aria-labelledby="vmodal-title"' : ''}>
          ${title ? this.html`
            <div class="${this.vs(headerStyle)}">
              <h2 id="vmodal-title" class="${this.vs(titleStyle)}">${title}</h2>
              <span class="close-btn ${this.vs(closeStyle)}" aria-label="Close dialog">×</span>
            </div>
          ` : ''}
          <div class="${this.vs(bodyStyle)}">
            ${children || ''}
          </div>
        </div>
      </div>
    `;
  }
}

// Grid Component
export class VGrid extends VelvetComponent {
  static defaultProps = {
    cols: 1,
    gap: 4,
    responsive: true
  };
  
  constructor(element, initialState, props) {
    super(element, initialState, { ...VGrid.defaultProps, ...props });
  }
  
  template() {
    const { cols, gap, responsive, children } = this.props;
    
    const gridStyle = {
      base: {
        display: 'grid',
        gap: this.theme.spacing[gap] || this.theme.spacing[4],
        gridTemplateColumns: `repeat(${cols}, 1fr)`
      }
    };
    
    if (responsive && cols > 1) {
      gridStyle.responsive = {
        sm: { gridTemplateColumns: 'repeat(1, 1fr)' },
        md: { gridTemplateColumns: `repeat(${Math.min(cols, 2)}, 1fr)` },
        lg: { gridTemplateColumns: `repeat(${cols}, 1fr)` }
      };
    }
    
    return this.html`
      <div class="${this.vs(gridStyle)}">
        ${children || ''}
      </div>
    `;
  }
}

// Export all components
export const VelvetUI = {
  Button: VButton,
  Card: VCard,
  Input: VInput,
  Container: VContainer,
  Toast: VToast,
  Modal: VModal,
  Grid: VGrid,
  get Tabs() { return VTabs; }
};

// Tabs Component (accessible)
export class VTabs extends VelvetComponent {
  static defaultProps = {
    tabs: [], // [{ id, label, content }]
    selectedIndex: 0,
    onChange: null
  };

  constructor(element, initialState, props) {
    const p = { ...VTabs.defaultProps, ...props };
    super(element, { index: p.selectedIndex || 0 }, p);
  }

  onCreate() {
    // Click to activate
    this.on('click', '[role="tab"]', (e) => {
      const idx = Number(e.currentTarget.getAttribute('data-index')) || 0;
      this._select(idx, true);
    });
    // Keyboard navigation
    this.on('keydown', '[role="tab"]', (e) => {
      const count = (this.props.tabs || []).length;
      if (!count) return;
      const current = this.state.index || 0;
      let next = null;
      switch (e.key) {
        case 'ArrowRight': next = (current + 1) % count; break;
        case 'ArrowLeft': next = (current - 1 + count) % count; break;
        case 'Home': next = 0; break;
        case 'End': next = count - 1; break;
        case 'Enter': case ' ': next = current; break;
      }
      if (next != null) {
        e.preventDefault();
        this._select(next, true, { focus: true });
      }
    });
  }

  _select(index, notify = false, { focus = false } = {}) {
    const prev = this.state.index;
    if (index === prev) return;
    this.setState({ index });
    // after render, optionally focus the tab button
    Promise.resolve().then(() => {
      if (focus && this.element) {
        const btn = this.element.querySelector(`[role="tab"][data-index="${index}"]`);
        if (btn) try { btn.focus(); } catch {}
      }
    });
    if (notify && typeof this.props.onChange === 'function') {
      try { this.props.onChange(index); } catch {}
    }
  }

  template() {
    const tabs = this.props.tabs || [];
    const idx = Math.min(Math.max(this.state.index || 0, 0), Math.max(0, tabs.length - 1));

    const tablistStyle = {
      base: {
        display: 'flex', gap: '0.5rem', borderBottom: '1px solid #e4e4e7', paddingBottom: '0.25rem'
      },
      dark: { borderBottomColor: '#52525b' }
    };
    const tabStyle = (active) => ({
      base: {
        appearance: 'none',
        background: 'transparent',
        border: '0',
        borderBottom: active ? '2px solid #0ea5e9' : '2px solid transparent',
        color: active ? '#0ea5e9' : 'inherit',
        padding: '0.5rem 0.75rem',
        cursor: 'pointer',
        borderRadius: '6px 6px 0 0'
      },
      hover: { backgroundColor: 'rgba(14,165,233,0.08)' },
      dark: {
        color: active ? '#8dd9ff' : 'inherit',
        borderBottomColor: active ? '#8dd9ff' : 'transparent'
      }
    });
    const panelStyle = {
      base: { padding: '0.75rem', outline: 'none' }
    };

    const tabBtns = tabs.map((t, i) => {
      const active = i === idx;
      const id = `tab-${i}`;
      const panelId = `panel-${i}`;
      return this.html`
        <button
          role="tab"
          id="${id}"
          class="${this.vs(tabStyle(active))}"
          aria-selected="${active ? 'true' : 'false'}"
          aria-controls="${panelId}"
          tabindex="${active ? '0' : '-1'}"
          data-index="${i}"
          type="button"
        >${t.label || `Tab ${i+1}`}</button>`;
    }).join('');

    const panels = tabs.map((t, i) => {
      const active = i === idx;
      const id = `panel-${i}`;
      const labelId = `tab-${i}`;
      return this.html`
        <div role="tabpanel" id="${id}" aria-labelledby="${labelId}" hidden="${active ? '' : 'hidden'}" class="${this.vs(panelStyle)}" ${active ? '' : 'style="display:none;"'}>
          ${t.content || ''}
        </div>`;
    }).join('');

    return this.html`
      <div class="v-tabs">
        <div role="tablist" aria-label="Tabs" class="${this.vs(tablistStyle)}">
          ${tabBtns}
        </div>
        ${panels}
      </div>
    `;
  }
}
