# SmoothJS CLI - Project Structure Enforcement

A robust CLI tool for creating, validating, and maintaining SmoothJS projects with consistent, scalable architecture.

## 🚀 Features

- **Project Scaffolding**: Create new projects with recommended structure
- **Structure Validation**: Validate existing projects against best practices
- **Component Generation**: Add new components, pages, stores, and utilities
- **Best Practices Enforcement**: Ensure consistent project organization
- **Migration Support**: Help restructure existing projects

## 📁 Recommended Project Structure

```
[projectname]/
├── components/          # Reusable UI components
│   ├── index.js        # Component exports
│   ├── Button.js       # Example component
│   └── Card.js         # Example component
├── pages/              # Page components
│   ├── index.js        # Page exports
│   ├── HomePage.js     # Example page
│   └── AboutPage.js    # Example page
├── stores/             # State management
│   ├── index.js        # Store exports
│   └── counter.js      # Example store
├── router/             # Routing configuration
│   ├── index.js        # Route definitions
│   └── routes.js       # Example routes
├── utils/              # Utility functions
│   └── index.js        # Utility exports
├── assets/             # Static assets
├── styles/             # CSS and styling
│   └── index.css       # Main styles
├── tests/              # Test files
├── app.js              # Main application entry point
├── index.html          # HTML entry point
├── package.json        # Project configuration
├── vite.config.js      # Build configuration
└── README.md           # Project documentation
```

## 🛠️ Installation

```bash
# Install globally
npm install -g smoothjs-cli

# Or use npx
npx smoothjs-cli create my-app
```

## 📋 Commands

### Create New Project

```bash
# Create project in current directory
smoothjs create my-app

# Create project in specific directory
smoothjs create my-app ./projects

# Create project with custom options
smoothjs create my-app --template=minimal
```

### Validate Existing Project

```bash
# Validate current directory
smoothjs validate

# Validate specific project
smoothjs validate ./path/to/project

# Get detailed recommendations
smoothjs validate --detailed
```

### Add New Items

```bash
# Add new component
smoothjs add component Button

# Add new page
smoothjs add page UserProfile

# Add new store
smoothjs add store user

# Add new utility
smoothjs add util helpers

# Add to specific project
smoothjs add component Button ./path/to/project
```

### Get Help

```bash
# Show all commands
smoothjs help

# Show specific command help
smoothjs create --help
```

## 🏗️ Project Scaffolding

The CLI creates a complete project structure with:

- **Directory Structure**: All required and recommended directories
- **Template Files**: Pre-configured files with best practices
- **Example Components**: Sample Button and Card components
- **Example Pages**: Home and About pages
- **Example Stores**: Counter store with selectors
- **Routing Setup**: Basic router configuration
- **Build Configuration**: Vite setup for development
- **Documentation**: Comprehensive README and comments

### Generated Files

- `package.json` with SmoothJS dependency and scripts
- `index.html` with proper meta tags and structure
- `app.js` with main application component and routing
- `vite.config.js` for build and development
- `jsconfig.json` for JavaScript language features
- `.gitignore` with common exclusions
- Component templates with proper structure
- Store templates with state management patterns
- Utility templates with common functions

## ✅ Validation System

The validation system checks:

### Required Elements
- ✅ Required directories exist and are properly structured
- ✅ Required files exist with proper content
- ✅ Basic SmoothJS imports and usage

### Best Practices
- ⚠️ File naming conventions
- ⚠️ Import/export patterns
- ⚠️ Component structure
- ⚠️ State management patterns

### Recommendations
- 💡 Optional directories for better organization
- 💡 Additional configuration files
- 💡 Testing setup
- 💡 Documentation improvements

### Scoring System

- **90-100**: Excellent - Follows all best practices
- **70-89**: Good - Solid structure with minor improvements
- **50-69**: Fair - Needs some restructuring
- **0-49**: Needs work - Major restructuring required

## 🔧 Adding New Items

### Component Template

```javascript
import { Component } from 'smoothjs';

export class Button extends Component {
  constructor() {
    super(null, {
      // Add your props here
    });
  }

  onCreate() {
    // Initialize event listeners and subscriptions
  }

  onUnmount() {
    // Clean up subscriptions and event listeners
  }

  template() {
    return this.html`
      <div class="button">
        <!-- Your component template here -->
        <h3>Button Component</h3>
        <p>This is the Button component.</p>
      </div>
    `;
  }
}
```

### Page Template

```javascript
import { Component } from 'smoothjs';

export class HomePage extends Component {
  constructor() {
    super(null, {
      // Add your page state here
    });
  }

  onCreate() {
    // Initialize page-specific logic
  }

  onUnmount() {
    // Clean up page resources
  }

  template() {
    return this.html`
      <div class="home-page">
        <h2>Home</h2>
        <div class="page-content">
          <!-- Your page content here -->
          <p>This is the Home page.</p>
        </div>
      </div>
    `;
  }
}
```

### Store Template

```javascript
import { createStore, createSelector } from 'smoothjs';

// User store
export const userStore = createStore({
  // Add your initial state here
  data: null,
  loading: false,
  error: null
});

// User selectors
export const selectUserData = createSelector(
  s => s.data,
  (data) => data
);

export const selectUserLoading = createSelector(
  s => s.loading,
  (loading) => loading
);

export const selectUserError = createSelector(
  s => s.error,
  (error) => error
);

// User actions
export const userActions = {
  setData: (data) => userStore.setState({ data, loading: false, error: null }),
  setLoading: (loading) => userStore.setState({ loading }),
  setError: (error) => userStore.setState({ error, loading: false }),
  reset: () => userStore.setState({ data: null, loading: false, error: null })
};
```

## 🚀 Migration Guide

For existing projects, follow these steps:

### 1. Create Required Directories
```bash
mkdir components pages stores router
```

### 2. Move Existing Files
- Move component files to `components/`
- Move page files to `pages/`
- Move state management to `stores/`
- Move routing logic to `router/`

### 3. Create Index Files
- Create `index.js` in each directory
- Export all items from index files
- Update imports throughout the project

### 4. Update Imports
```javascript
// Before
import { Button } from './components/Button.js';

// After
import { Button } from './components/index.js';
```

### 5. Add Recommended Elements
- Create `utils/` directory for utilities
- Create `styles/` directory for CSS
- Create `assets/` directory for static files
- Create `tests/` directory for testing

## 📚 Best Practices

### Component Guidelines
- Keep components focused and single-purpose
- Use props for configuration and state
- Implement proper lifecycle methods
- Handle errors gracefully
- Write tests for components

### Page Guidelines
- Keep page logic separate from component logic
- Use stores for shared state
- Implement proper loading and error states
- Handle navigation and routing properly

### Store Guidelines
- Use `createStore` for state management
- Use `createSelector` for derived state
- Keep stores focused on specific domains
- Implement proper error handling
- Write tests for stores and selectors

### Routing Guidelines
- Use hash routing for static hosting
- Implement navigation guards where needed
- Use lazy loading for code splitting
- Handle 404 cases gracefully

### General Guidelines
- Follow consistent naming conventions
- Use ES modules for imports/exports
- Keep files focused and manageable
- Write clear documentation
- Implement proper error boundaries

## 🔍 Validation Examples

### Successful Validation
```bash
$ smoothjs validate
🔍 Validating project structure: /path/to/project

📊 Project Structure Validation Report
=====================================
✅ No critical issues found!

🏆 Project Structure Score: 95/100
🌟 Excellent! Your project follows SmoothJS best practices.
```

### Validation with Issues
```bash
$ smoothjs validate
🔍 Validating project structure: /path/to/project

📊 Project Structure Validation Report
=====================================
❌ Found 2 critical issue(s):
   • Missing required directory: components/
   • Missing required file: app.js

⚠️  Found 1 warning(s):
   • package.json does not include smoothjs dependency

💡 3 suggestion(s) for improvement:
   • Consider adding utils/ directory for better organization
   • Consider adding styles/ directory for better organization
   • Consider adding .gitignore for better project setup

🏆 Project Structure Score: 60/100
⚠️  Fair. Consider restructuring your project to follow SmoothJS conventions.

🚨 Critical issues must be fixed for the project to work properly.
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details.

## 🆘 Support

- **Documentation**: [SmoothJS Docs](https://smoothjs.dev)
- **Issues**: [GitHub Issues](https://github.com/smoothjs/smoothjs/issues)
- **Discussions**: [GitHub Discussions](https://github.com/smoothjs/smoothjs/discussions)

## 🔗 Related

- [SmoothJS Framework](https://github.com/smoothjs/smoothjs)
- [SmoothJS Documentation](https://smoothjs.dev)
- [SmoothJS Examples](https://github.com/smoothjs/smoothjs-examples)
