# SmoothJS Examples - Modular Structure

This directory contains a modular, well-organized example application that demonstrates SmoothJS capabilities.

## Directory Structure

```
examples/
├── components/           # Reusable UI components
│   ├── index.js         # Component exports
│   ├── FallbackStyling.js
│   ├── StatCard.js
│   ├── ActionButton.js
│   ├── DataTable.js
│   ├── DarkModeToggle.js
│   └── GlobalErrorBoundary.js
├── pages/               # Page components
│   ├── index.js         # Page exports
│   ├── HomePage.js
│   ├── TodoPage.js
│   ├── CounterPage.js
│   ├── FetchPage.js
│   ├── DomPage.js
│   ├── UsersPage.js
│   ├── AboutPage.js
│   ├── ErrorPage.js
│   ├── ProtectedPage.js
│   ├── LoadingDemoPage.js
│   └── NotFound.js
├── stores/              # State management
│   └── index.js         # Store definitions and selectors
├── router/              # Routing configuration
│   └── index.js         # Router setup and route definitions
├── app.js               # Main application entry point
└── README.md            # This file
```

## Components

### Reusable UI Components (`components/`)

- **FallbackStyling**: Provides fallback styling when Velvet design system fails
- **StatCard**: Displays statistics with icons and trends
- **ActionButton**: Configurable button with different variants and states
- **DataTable**: Sortable and selectable data table
- **DarkModeToggle**: Theme switching component
- **GlobalErrorBoundary**: Catches and handles application errors

### Page Components (`pages/`)

- **HomePage**: Main navigation and overview
- **TodoPage**: Todo management with local state
- **CounterPage**: Advanced counter with multi-store state management
- **FetchPage**: Query caching and network request management
- **DomPage**: DOM utilities demonstration
- **UsersPage**: Nested routing example
- **AboutPage**: Version and utility information
- **ErrorPage**: Error boundary demonstration
- **ProtectedPage**: Navigation guards example
- **LoadingDemoPage**: Async navigation guards
- **NotFound**: 404 page component

## State Management (`stores/`)

- **counterStore**: Manages counter state
- **preferencesStore**: User preferences and settings
- **appStore**: Application-wide state
- **Selectors**: Memoized selectors for derived state

## Routing (`router/`)

- Hash-based routing for static hosting
- Navigation guards with authentication checks
- Async route validation
- Page view tracking
- Smooth scrolling

## Usage

### Importing Components

```javascript
import { StatCard, ActionButton } from './components/index.js';
import { HomePage, TodoPage } from './pages/index.js';
import { counterStore } from './stores/index.js';
```

### Using Components

```javascript
// Create a stat card
const statCard = new StatCard({
  title: 'Total Users',
  value: '1,234',
  icon: '👥',
  color: 'blue',
  trend: { direction: 'up', value: 12 }
});

// Create an action button
const button = new ActionButton({
  label: 'Click Me',
  variant: 'primary',
  size: 'md',
  onClick: () => console.log('Clicked!')
});
```

### State Management

```javascript
import { counterStore, selectIsEven } from './stores/index.js';

// Subscribe to state changes
const unsubscribe = counterStore.select(selectIsEven, (isEven) => {
  console.log('Count is even:', isEven);
});

// Update state
counterStore.setState(prev => ({ count: prev.count + 1 }));
```

## Benefits of Modular Structure

1. **Maintainability**: Each component has a single responsibility
2. **Reusability**: Components can be easily imported and used elsewhere
3. **Testability**: Individual components can be tested in isolation
4. **Scalability**: Easy to add new components and pages
5. **Organization**: Clear separation of concerns
6. **Import/Export**: Clean dependency management

## Adding New Components

1. Create the component file in the appropriate directory
2. Export it from the corresponding `index.js` file
3. Import and use it in your application

## Adding New Pages

1. Create the page component in the `pages/` directory
2. Add the route in `router/index.js`
3. Export the page from `pages/index.js`

This modular structure makes the codebase much more maintainable and easier to work with compared to the original monolithic `app.js` file.
