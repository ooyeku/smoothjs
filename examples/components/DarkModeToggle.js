import { defineComponent } from '../../index.js';

// Dark mode toggle component (functional)
const DarkModeToggle = defineComponent(({ useState, html, on, props }) => {
  const [isDark, setIsDark] = useState(() => {
    try { return document.documentElement.getAttribute('data-theme') === 'dark'; } catch { return false; }
  });

  on('click', 'button', () => {
    if (props && props.toggleDarkMode) {
      const newTheme = props.toggleDarkMode();
      setIsDark(newTheme === 'dark');
    }
  });

  const render = () => html`
    <button style="padding: 0.5rem 1rem; background: var(--card); color: var(--muted); border: 1px solid var(--border); border-radius: 8px; cursor: pointer; transition: all 200ms ease;">
      ${isDark ? 'Light' : 'Dark'}
    </button>
  `;

  return { render };
});

export { DarkModeToggle };
