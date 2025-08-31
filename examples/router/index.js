import { Router } from '../../index.js';
import { HomePage } from '../pages/HomePage.js';
import { TodoPage } from '../pages/TodoPage.js';
import { CounterPage } from '../pages/CounterPage.js';
import { FetchPage } from '../pages/FetchPage.js';
import { DomPage } from '../pages/DomPage.js';
import { UsersPage } from '../pages/UsersPage.js';
import { AboutPage } from '../pages/AboutPage.js';
import { ErrorPage } from '../pages/ErrorPage.js';
import { ProtectedPage } from '../pages/ProtectedPage.js';
import { LoadingDemoPage } from '../pages/LoadingDemoPage.js';
import { NotFound } from '../pages/NotFound.js';
import { CompositionPage } from '../pages/CompositionPage.js';
import { MutationsPage } from '../pages/MutationsPage.js';

// Router Setup with Advanced Guards (hash mode for static hosting)
const router = new Router({
  mode: 'hash',
  root: '#app',
  fallback: NotFound
});

// Configure routes
router
  .route('/', HomePage)
  .route('/todo', TodoPage)
  .route('/counter', CounterPage)
  .route('/fetch', FetchPage)
  .route('/dom', DomPage)
  .route('/users', UsersPage)
  .route('/users/:id', () => import('../users.js'))
  .route('/error', ErrorPage)
  .route('/about', AboutPage)
  .route('/protected', ProtectedPage)
  .route('/loading-demo', LoadingDemoPage)
  .route('/composition', CompositionPage)
  .route('/mutations', MutationsPage);

export { router };
