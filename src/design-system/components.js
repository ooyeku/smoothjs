import { VelvetComponent } from './VelvetComponent.js';

// Button Component
export class VButton extends VelvetComponent {
  static defaultProps = {
    variant: 'primary', // primary, secondary, ghost, danger
    size: 'md', // sm, md, lg
    loading: false,
    disabled: false,
    fullWidth: false,
    onClick: null,
    ripple: true
  };
  
  constructor(element, initialState, props) {
    super(element, initialState, { ...VButton.defaultProps, ...props });
  }
  
  onCreate() {
    if (this.props.onClick) {
      this.on('click', 'button', (e) => {
        if (this.props.ripple) {
          this.ripple(e);
        }
        this.props.onClick(e);
      });
    }
  }
  
  template() {
    const { variant, size, loading, disabled, fullWidth, children } = this.props;
    const buttonClass = this.v.button(variant, size);
    const additionalStyles = fullWidth ? { width: '100%' } : {};
    
    return this.html`
      <button 
        class="${buttonClass} ${loading ? 'opacity-75' : ''}"
        style="${Object.entries(additionalStyles).map(([k, v]) => `${k}: ${v}`).join('; ')}"
        disabled=${disabled || loading}
      >
        ${loading ? this.renderSpinner() : (children || 'Button')}
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
    
    return this.html`<span class="${spinnerClass}"></span> Loading...`;
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
    error: false,
    icon: null,
    placeholder: '',
    value: '',
    onChange: null,
    onInput: null
  };
  
  constructor(element, initialState, props) {
    super(element, initialState, { ...VInput.defaultProps, ...props });
  }
  
  onCreate() {
    if (this.props.onChange) {
      this.on('change', 'input', this.props.onChange);
    }
    if (this.props.onInput) {
      this.on('input', 'input', this.props.onInput);
    }
  }
  
  template() {
    const { type, size, error, icon, placeholder, value } = this.props;
    
    const sizeMap = {
      sm: { padding: '0.5rem 0.75rem', fontSize: '0.875rem' },
      md: { padding: '0.75rem 1rem', fontSize: '1rem' },
      lg: { padding: '1rem 1.25rem', fontSize: '1.125rem' }
    };
    
    const inputStyle = {
      base: {
        width: '100%',
        ...sizeMap[size],
        lineHeight: '1.5',
        color: '#18181b',
        backgroundColor: 'white',
        border: '1px solid',
        borderColor: error ? '#ef4444' : '#d4d4d8',
        borderRadius: '8px',
        transition: 'all 250ms ease',
        outline: 'none',
        ...(icon && { paddingLeft: '2.5rem' })
      },
      focus: {
        borderColor: error ? '#ef4444' : '#0ea5e9',
        boxShadow: error 
          ? '0 0 0 3px rgba(239, 68, 68, 0.1)'
          : '0 0 0 3px rgba(14, 165, 233, 0.1)'
      },
      dark: {
        backgroundColor: '#18181b',
        color: '#fafafa',
        borderColor: error ? '#ef4444' : '#52525b'
      }
    };
    
    const wrapperStyle = {
      base: {
        position: 'relative',
        width: '100%'
      }
    };
    
    return this.html`
      <div class="${this.vs(wrapperStyle)}">
        ${icon ? this.renderIcon(icon) : ''}
        <input 
          type="${type}"
          class="${this.vs(inputStyle)}"
          placeholder="${placeholder}"
          value="${value}"
        />
        ${error && typeof error === 'string' ? this.renderError(error) : ''}
      </div>
    `;
  }
  
  renderIcon(icon) {
    const iconStyle = {
      base: {
        position: 'absolute',
        left: '0.75rem',
        top: '50%',
        transform: 'translateY(-50%)',
        color: '#71717a',
        pointerEvents: 'none'
      }
    };
    
    return this.html`<span class="${this.vs(iconStyle)}">${icon}</span>`;
  }
  
  renderError(message) {
    const errorStyle = {
      base: {
        marginTop: '0.25rem',
        fontSize: '0.875rem',
        color: '#ef4444'
      }
    };
    
    return this.html`<p class="${this.vs(errorStyle)}">${message}</p>`;
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
        <div class="${this.vs(modalStyle)}">
          ${title ? this.html`
            <div class="${this.vs(headerStyle)}">
              <h2 class="${this.vs(titleStyle)}">${title}</h2>
              <span class="close-btn ${this.vs(closeStyle)}">×</span>
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
  Grid: VGrid
};