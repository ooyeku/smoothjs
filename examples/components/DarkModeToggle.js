import { Component } from '../../index.js';

// Dark mode toggle component
export class DarkModeToggle extends Component {
  constructor(element, initialState, props) {
    super(element, initialState, props);
  }
  
  onCreate() {
    // Initialize from current theme
    const currentTheme = document.documentElement.getAttribute('data-theme');
    this.setState({ isDark: currentTheme === 'dark' });
    
    this.on('click', 'button', () => {
      if (this.props.toggleDarkMode) {
        const newTheme = this.props.toggleDarkMode();
        this.setState({ isDark: newTheme === 'dark' });
      }
    });
  }
  
  template() {
    const buttonText = this.state.isDark ? 'Light' : 'Dark';
    
    return this.html`
      <button style="padding: 0.5rem 1rem; background: var(--card); color: var(--muted); border: 1px solid var(--border); border-radius: 8px; cursor: pointer; transition: all 200ms ease;">
        ${buttonText}
      </button>
    `;
  }
}
