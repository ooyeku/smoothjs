/**
 * SmoothJS CLI Configuration
 * Defines the recommended project structure and validation rules
 */

export const PROJECT_STRUCTURE = {
  // Required directories for all SmoothJS projects
  required: {
    components: {
      description: 'Reusable UI components',
      files: ['index.js'],
      conventions: [
        'Use PascalCase for component names (e.g., Button.js)',
        'Export components from index.js for clean imports',
        'Keep components focused and single-purpose'
      ]
    },
    pages: {
      description: 'Page components for routing',
      files: ['index.js'],
      conventions: [
        'Use PascalCase with "Page" suffix (e.g., HomePage.js)',
        'Export pages from index.js for clean imports',
        'Keep page logic separate from component logic'
      ]
    },
    stores: {
      description: 'State management stores and selectors',
      files: ['index.js'],
      conventions: [
        'Use camelCase for store names (e.g., userStore.js)',
        'Export stores and selectors from index.js',
        'Use createStore for state and createSelector for derived state'
      ]
    },
    router: {
      description: 'Routing configuration',
      files: ['index.js'],
      conventions: [
        'Define all routes in index.js',
        'Use lazy loading for code splitting',
        'Implement navigation guards where needed'
      ]
    }
  },

  // Optional but recommended directories
  recommended: {
    utils: {
      description: 'Utility functions and helpers',
      files: ['index.js'],
      conventions: [
        'Use camelCase for utility names',
        'Export utilities from index.js',
        'Keep utilities pure and testable'
      ]
    },
    assets: {
      description: 'Static assets (images, fonts, etc.)',
      files: [],
      conventions: [
        'Organize by type (images/, fonts/, icons/)',
        'Use descriptive file names',
        'Optimize assets for web delivery'
      ]
    },
    styles: {
      description: 'CSS and styling files',
      files: ['index.css'],
      conventions: [
        'Use CSS custom properties for theming',
        'Follow BEM or similar naming convention',
        'Keep styles modular and scoped'
      ]
    },
    tests: {
      description: 'Test files and test utilities',
      files: [],
      conventions: [
        'Mirror the source directory structure',
        'Use descriptive test names',
        'Test components, stores, and utilities'
      ]
    }
  },

  // Required files for all projects
  requiredFiles: {
    'app.js': {
      description: 'Main application entry point',
      conventions: [
        'Import and use SmoothJS Component class',
        'Set up routing and main app structure',
        'Initialize the application'
      ]
    },
    'package.json': {
      description: 'Project configuration and dependencies',
      conventions: [
        'Include smoothjs dependency',
        'Set "type": "module" for ES modules',
        'Include appropriate scripts (dev, build, test)'
      ]
    },
    'index.html': {
      description: 'HTML entry point',
      conventions: [
        'Include proper meta tags',
        'Link to main CSS file',
        'Include script tag for app.js'
      ]
    }
  },

  // Recommended files for better project setup
  recommendedFiles: {
    'README.md': {
      description: 'Project documentation',
      conventions: [
        'Include project structure overview',
        'Document setup and development steps',
        'List best practices and conventions'
      ]
    },
    '.gitignore': {
      description: 'Git ignore rules',
      conventions: [
        'Ignore node_modules and build outputs',
        'Ignore environment and IDE files',
        'Ignore logs and temporary files'
      ]
    },
    'vite.config.js': {
      description: 'Vite build configuration',
      conventions: [
        'Configure build output directory',
        'Set up development server options',
        'Configure build optimizations'
      ]
    },
    'jsconfig.json': {
      description: 'JavaScript language configuration',
      conventions: [
        'Set ES2020 target and ESNext module',
        'Enable module resolution and imports',
        'Configure JSX if using React-like syntax'
      ]
    }
  }
};

// Validation rules and scoring
export const VALIDATION_RULES = {
  scoring: {
    criticalIssue: -20,    // Missing required directory/file
    warning: -5,           // Potential issues
    suggestion: 0,         // Recommendations (no score impact)
    bonus: 5               // Bonus for following best practices
  },
  
  thresholds: {
    excellent: 90,
    good: 70,
    fair: 50,
    needsWork: 0
  }
};

// File naming conventions
export const NAMING_CONVENTIONS = {
  components: {
    pattern: /^[A-Z][a-zA-Z0-9]*\.js$/,
    examples: ['Button.js', 'UserCard.js', 'NavigationBar.js'],
    description: 'PascalCase for component names'
  },
  pages: {
    pattern: /^[A-Z][a-zA-Z0-9]*Page\.js$/,
    examples: ['HomePage.js', 'UserProfilePage.js', 'SettingsPage.js'],
    description: 'PascalCase with "Page" suffix'
  },
  stores: {
    pattern: /^[a-z][a-zA-Z0-9]*\.js$/,
    examples: ['userStore.js', 'counterStore.js', 'authStore.js'],
    description: 'camelCase for store names'
  },
  utils: {
    pattern: /^[a-z][a-zA-Z0-9]*\.js$/,
    examples: ['helpers.js', 'formatters.js', 'validators.js'],
    description: 'camelCase for utility names'
  }
};

// Import/export patterns
export const IMPORT_PATTERNS = {
  components: {
    pattern: /export\s+\{\s*[A-Z][a-zA-Z0-9]*\s*\}\s+from\s+['"][^'"]+['"]/,
    description: 'Named exports for components'
  },
  pages: {
    pattern: /export\s+\{\s*[A-Z][a-zA-Z0-9]*Page\s*\}\s+from\s+['"][^'"]+['"]/,
    description: 'Named exports for pages'
  },
  stores: {
    pattern: /export\s+(const|function)\s+[a-z][a-zA-Z0-9]*/,
    description: 'Named exports for stores and selectors'
  }
};

// Best practices
export const BEST_PRACTICES = {
  components: [
    'Keep components focused and single-purpose',
    'Use props for configuration and state',
    'Implement proper lifecycle methods',
    'Handle errors gracefully',
    'Write tests for components'
  ],
  pages: [
    'Keep page logic separate from component logic',
    'Use stores for shared state',
    'Implement proper loading and error states',
    'Handle navigation and routing properly'
  ],
  stores: [
    'Use createStore for state management',
    'Use createSelector for derived state',
    'Keep stores focused on specific domains',
    'Implement proper error handling',
    'Write tests for stores and selectors'
  ],
  routing: [
    'Use hash routing for static hosting',
    'Implement navigation guards where needed',
    'Use lazy loading for code splitting',
    'Handle 404 cases gracefully'
  ],
  general: [
    'Follow consistent naming conventions',
    'Use ES modules for imports/exports',
    'Keep files focused and manageable',
    'Write clear documentation',
    'Implement proper error boundaries'
  ]
};

// Migration guide for existing projects
export const MIGRATION_STEPS = [
  {
    step: 1,
    title: 'Create Required Directories',
    description: 'Create the four required directories: components, pages, stores, router',
    commands: [
      'mkdir components',
      'mkdir pages', 
      'mkdir stores',
      'mkdir router'
    ]
  },
  {
    step: 2,
    title: 'Move Existing Files',
    description: 'Move existing components, pages, and state management to appropriate directories',
    actions: [
      'Move component files to components/',
      'Move page files to pages/',
      'Move state management to stores/',
      'Move routing logic to router/'
    ]
  },
  {
    step: 3,
    title: 'Create Index Files',
    description: 'Create index.js files in each directory for clean imports',
    actions: [
      'Create components/index.js with exports',
      'Create pages/index.js with exports',
      'Create stores/index.js with exports',
      'Create router/index.js with route definitions'
    ]
  },
  {
    step: 4,
    title: 'Update Imports',
    description: 'Update import statements throughout the project',
    actions: [
      'Update component imports to use index files',
      'Update page imports to use index files',
      'Update store imports to use index files',
      'Update router imports to use index files'
    ]
  },
  {
    step: 5,
    title: 'Add Recommended Files',
    description: 'Add optional but recommended files for better project setup',
    actions: [
      'Create utils/ directory with utility functions',
      'Create styles/ directory with CSS files',
      'Create assets/ directory for static files',
      'Create tests/ directory for test files'
    ]
  }
];
