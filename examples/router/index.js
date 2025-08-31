import { Router } from '../../index.js';
import { appStore } from '../stores/index.js';
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
import { 
  counterStore, 
  preferencesStore, 
  selectIsEven, 
  selectDouble, 
  selectCountCategory, 
  selectAnimationDuration, 
  selectAppStatus 
} from '../stores/index.js';

// Router Setup with Advanced Guards (hash mode for static hosting)
export const router = new Router({ 
  mode: 'hash', 
  root: '#app', 
  notFound: NotFound, 
  beforeEach: async (to, from) => {
    console.log('Navigating:', from, '->', to); 

    // Simulate authentication check
    if (to === '/protected') {
      const isAuthenticated = true; // For demo purposes, always allow access
      if (!isAuthenticated) {
        console.warn('Access denied to protected route');
        // Could redirect to login page here
        return false; // Cancel navigation
      }
    }

    // Simulate loading state for certain routes
    if (to === '/loading-demo') {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate async check
    }

    // Update navigation history in app store
    appStore.setState({
      lastActivity: new Date().toISOString(),
      currentRoute: to
    });

    console.log('Navigation allowed, proceeding...');
    return true; 
  },
  afterEach: (to, from) => {
    console.log('Navigation completed:', from, '->', to);

    // Track page views
    if (typeof gtag !== 'undefined') {
      gtag('event', 'page_view', {
        page_title: to,
        page_location: window.location.href
      });
    }

    // Scroll to top on navigation
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
});

// Configure routes with props where needed
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
  .route('/loading-demo', LoadingDemoPage);
