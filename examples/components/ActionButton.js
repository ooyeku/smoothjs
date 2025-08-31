import { Component } from '../../index.js';

// Reusable component: ActionButton
export class ActionButton extends Component {
  constructor() {
    super(null, {
      label: '',
      variant: 'primary',
      size: 'md',
      icon: null,
      disabled: false,
      loading: false,
      onClick: null
    });
  }

  setProps(props) {
    super.setProps(props);
  }

  onCreate() {
    if (this.props.onClick) {
      this.on('click', 'button', this.props.onClick);
    }
  }

  template() {
    const variants = {
      primary: 'background: #0ea5e9; color: white; border: 1px solid #0ea5e9;',
      secondary: 'background: #f3f4f6; color: #374151; border: 1px solid #d1d5db;',
      ghost: 'background: transparent; color: #6b7280; border: 1px solid #d1d5db;',
      outline: 'background: transparent; color: #0ea5e9; border: 1px solid #0ea5e9;'
    };
    
    const sizes = {
      sm: 'padding: 0.5rem 1rem; font-size: 0.875rem;',
      md: 'padding: 0.75rem 1.5rem; font-size: 1rem;',
      lg: 'padding: 1rem 2rem; font-size: 1.125rem;'
    };

    const baseStyle = `${variants[this.props.variant] || variants.primary} ${sizes[this.props.size] || sizes.md} border-radius: 6px; cursor: pointer; text-decoration: none; display: inline-block; transition: all 200ms ease;`;
    const disabledStyle = this.props.disabled || this.props.loading ? 'opacity: 0.5; cursor: not-allowed;' : '';

    return this.html`
      <button
        style="${baseStyle} ${disabledStyle}"
        ${this.props.disabled || this.props.loading ? 'disabled' : ''}
      >
        ${this.props.loading ? this.html`
          <div style="display: flex; align-items: center; gap: 0.5rem;">
            <div style="width: 1rem; height: 1rem; border: 2px solid currentColor; border-top: 2px solid transparent; border-radius: 50%; animation: spin 1s linear infinite;"></div>
            Loading...
          </div>
        ` : this.html`
          <div style="display: flex; align-items: center; gap: 0.5rem;">
            ${this.props.icon ? this.html`<span>${this.props.icon}</span>` : ''}
            <span>${this.props.label}</span>
          </div>
        `}
      </button>
    `;
  }
}
