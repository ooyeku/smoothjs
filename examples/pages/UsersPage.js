import { defineComponent } from '../../index.js';

// Users Parent Page (nested routing demo)
export const UsersPage = defineComponent(({ html }) => {
  const users = [
    { id: 1, name: 'Ada Lovelace' },
    { id: 2, name: 'Alan Turing' },
    { id: 3, name: 'Grace Hopper' }
  ];
  const render = () => html`
      <div>
        <h2>Users</h2>
        <p class="muted">Nested routing with dynamic params and lazy loading. Select a user to load details lazily.</p>
        <ul class="list">
          ${users.map(u => html`<li>
            <a href="#/users/${u.id}" data-router-link data-to="/users/${u.id}">${u.name}</a>
          </li>`)}
        </ul>
        <div class="card" style="margin-top:1rem; padding: .5rem 1rem;">
          <div class="muted" style="margin-bottom:.5rem;">Details outlet:</div>
          <div data-router-outlet></div>
        </div>
      </div>
    `;
  return { render };
});
