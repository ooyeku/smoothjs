import { Component } from '../../index.js';

// Dark mode toggle component
export class DarkModeToggle extends Component {
  constructor() {
    super(null, { isDark: false });
  }
  
  onCreate() {
    this.on('click', 'button', () => {
      if (this.props.toggleDarkMode) {
        this.props.toggleDarkMode();
      }
      this.setState({ isDark: !this.state.isDark });
    });
    
    // Check initial state
    this.setState({ 
      isDark: document.documentElement.getAttribute('data-theme') === 'dark' 
    });
  }
  
  template() {
    return this.html`
      <button style="padding: 0.5rem; background: rgba(255, 255, 255, 0.9); backdrop-filter: blur(10px); border: 1px solid rgba(0, 0, 0, 0.1); border-radius: 8px; cursor: pointer; font-size: 1.25rem; transition: all 200ms ease; color: #374151;">
        ${this.state.isDark ? 'Light' : 'Dark'}
      </button>
    `;
  }
}
