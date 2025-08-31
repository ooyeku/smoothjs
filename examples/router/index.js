import { Router } from '../../index.js';
import { HomePage } from '../pages/HomePage.js';
import { NotFound } from '../pages/NotFound.js';

// Router Setup with Advanced Guards (hash mode for static hosting)
const router = new Router({
  mode: 'hash',
  root: '#app',
  fallback: NotFound
});

// Configure routes: keep Home eager; lazy-load others
router
  .route('/', HomePage)
  .route('/todo', () => import('../pages/TodoPage.js').then(m => m.TodoPage))
  .route('/counter', () => import('../pages/CounterPage.js').then(m => m.CounterPage))
  .route('/fetch', () => import('../pages/FetchPage.js').then(m => m.FetchPage))
  .route('/dom', () => import('../pages/DomPage.js').then(m => m.DomPage))
  .route('/users', () => import('../pages/UsersPage.js').then(m => m.UsersPage))
  .route('/users/:id', () => import('../users.js'))
  .route('/error', () => import('../pages/ErrorPage.js').then(m => m.ErrorPage))
  .route('/about', () => import('../pages/AboutPage.js').then(m => m.AboutPage))
  .route('/protected', () => import('../pages/ProtectedPage.js').then(m => m.ProtectedPage))
  .route('/loading-demo', () => import('../pages/LoadingDemoPage.js').then(m => m.LoadingDemoPage))
  .route('/composition', () => import('../pages/CompositionPage.js').then(m => m.CompositionPage))
  .route('/mutations', () => import('../pages/MutationsPage.js').then(m => m.MutationsPage))
  .route('/design', () => import('../pages/DesignSystemPage.js').then(m => m.DesignSystemPage))
  .route('/forms', () => import('../pages/FormsPage.js').then(m => m.FormsPage));

export { router };
