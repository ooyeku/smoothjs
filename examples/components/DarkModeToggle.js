import { Component } from '../../index.js';

// Dark mode toggle component
export class DarkModeToggle extends Component {
  constructor(element, initialState, props) {
    console.log('DarkModeToggle constructor called with:', { element, initialState, props });
    super(element, initialState, props);
    console.log('After super call, this.props:', this.props);
  }
  
  onCreate() {
    // Check initial state first
    const currentTheme = document.documentElement.getAttribute('data-theme');
    this.setState({ isDark: currentTheme === 'dark' });
    
    this.on('click', 'button', () => {
      if (this.props.toggleDarkMode) {
        const newTheme = this.props.toggleDarkMode();
        this.setState({ isDark: newTheme === 'dark' });
      } else {
        console.error('toggleDarkMode prop not provided. Props received:', this.props);
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
