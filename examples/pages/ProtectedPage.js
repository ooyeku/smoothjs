import { defineComponent } from '../../index.js';

// Protected Route Component (functional)
export const ProtectedPage = defineComponent(({ html }) => {
  const render = () => html`
      <div style="max-width: 960px; margin: 0 auto; padding: 0.75rem 1rem;">
        <div style="background: white; border-radius: 12px; padding: 1rem 1.25rem; box-shadow: 0 10px 20px rgba(0,0,0,.14), 0 2px 6px rgba(0,0,0,.08); border: 1px solid #e5e7eb;">
          <div style="text-align: center; margin-bottom: 1.5rem;">
            <h2 style="margin: 0 0 0.5rem 0; font-size: 1.875rem; font-weight: 600;">Protected Page</h2>
            <p style="margin: 0; color: #6b7280;">This page is protected by navigation guards</p>
          </div>

          <div style="padding: 2rem; background: #f0fdf4; border: 2px solid #bbf7d0; border-radius: 8px; text-align: center;">
            <div style="font-size: 3rem; margin-bottom: 1rem;">✓</div>
            <h3 style="margin: 0 0 1rem 0; color: #059669; font-size: 1.25rem; font-weight: 600;">Access Granted!</h3>
            <p style="margin: 0; color: #374151;">You have successfully passed the navigation guard check.</p>
          </div>
        </div>
      </div>
    `;
  return { render };
});
